// Service Worker for BuyPrintz - Optimized Caching Strategy
const CACHE_NAME = 'buyprintz-v1.0.0';
const STATIC_CACHE = 'buyprintz-static-v1.0.0';
const DYNAMIC_CACHE = 'buyprintz-dynamic-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/assets/images/buyprintz_logo.png'
];

// External resources with longer cache times (only cache when actually requested)
const EXTERNAL_CACHE_STRATEGIES = {
  'fonts.googleapis.com': { cacheTime: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  'fonts.gstatic.com': { cacheTime: 30 * 24 * 60 * 60 * 1000 } // 30 days
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        // Only cache assets that actually exist
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            cache.add(asset).catch(error => {
              console.warn(`Failed to cache ${asset}:`, error);
              return null;
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests for caching (Cache API limitation)
  if (request.method !== 'GET') {
    return; // Let the browser handle non-GET requests normally
  }

  // Skip caching for certain request types
  if (request.headers.get('range') || 
      request.url.includes('chrome-extension://') ||
      request.url.includes('moz-extension://') ||
      request.url.includes('safari-extension://')) {
    return; // Let the browser handle these requests normally
  }

  // Handle external resources with optimized caching
  if (isExternalResource(url.hostname)) {
    event.respondWith(handleExternalResource(request, url));
    return;
  }

  // Handle internal resources
  event.respondWith(handleInternalResource(request));
});

// Check if resource is external
function isExternalResource(hostname) {
  return Object.keys(EXTERNAL_CACHE_STRATEGIES).some(domain => 
    hostname.includes(domain)
  );
}

// Handle external resources with long cache times
async function handleExternalResource(request, url) {
  try {
    const hostname = url.hostname;
    const strategy = Object.entries(EXTERNAL_CACHE_STRATEGIES).find(([domain]) => 
      hostname.includes(domain)
    );

    if (!strategy) {
      return fetch(request);
    }

    const cache = await caches.open(DYNAMIC_CACHE);
    
    // Try cache first
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      console.log('Serving from cache:', request.url);
      return cachedResponse;
    }

    // Fetch from network and cache
    const networkResponse = await fetch(request);
    if (networkResponse.ok && request.method === 'GET') {
      // Simply cache the response without modifying headers (only GET requests)
      await cache.put(request, networkResponse.clone());
      console.log('Cached external resource:', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.error('Network error, serving from cache:', error);
    // Try to serve from cache as fallback
    try {
      const cache = await caches.open(DYNAMIC_CACHE);
      const cachedResponse = await cache.match(request);
      return cachedResponse || new Response('Offline', { status: 503 });
    } catch (cacheError) {
      console.error('Cache error:', cacheError);
      return new Response('Offline', { status: 503 });
    }
  }
}

// Handle internal resources with cache-first strategy
async function handleInternalResource(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    
    // Try cache first for static assets
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Fetch from network
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses (only GET requests)
      if (request.method === 'GET') {
        await cache.put(request, networkResponse.clone());
      }
    }
    return networkResponse;
  } catch (error) {
    console.error('Network error:', error);
    return new Response('Offline', { status: 503 });
  }
}
