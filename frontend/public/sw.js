// Service Worker for BuyPrintz - Optimized Caching Strategy
const CACHE_NAME = 'buyprintz-v1.0.0';
const STATIC_CACHE = 'buyprintz-static-v1.0.0';
const DYNAMIC_CACHE = 'buyprintz-dynamic-v1.0.0';

// Resources to cache immediately
const STATIC_ASSETS = [
  '/',
  '/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png',
  '/assets/index.css',
  '/src/main.jsx'
];

// External resources with longer cache times
const EXTERNAL_CACHE_STRATEGIES = {
  'js.stripe.com': { cacheTime: 7 * 24 * 60 * 60 * 1000 }, // 7 days
  'm.stripe.network': { cacheTime: 7 * 24 * 60 * 60 * 1000 }, // 7 days
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
        return cache.addAll(STATIC_ASSETS);
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
  const hostname = url.hostname;
  const strategy = Object.entries(EXTERNAL_CACHE_STRATEGIES).find(([domain]) => 
    hostname.includes(domain)
  );

  if (!strategy) {
    return fetch(request);
  }

  const [, { cacheTime }] = strategy;
  const cache = await caches.open(DYNAMIC_CACHE);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    // Check if cache is still valid
    const cacheDate = new Date(cachedResponse.headers.get('sw-cache-date'));
    const now = new Date();
    
    if (now - cacheDate < cacheTime) {
      console.log('Serving from cache:', request.url);
      return cachedResponse;
    }
  }

  // Fetch from network and cache
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Clone response and add cache timestamp
      const responseToCache = networkResponse.clone();
      responseToCache.headers.set('sw-cache-date', new Date().toISOString());
      
      await cache.put(request, responseToCache);
      console.log('Cached external resource:', request.url);
    }
    return networkResponse;
  } catch (error) {
    console.error('Network error, serving from cache:', error);
    return cachedResponse || new Response('Offline', { status: 503 });
  }
}

// Handle internal resources with cache-first strategy
async function handleInternalResource(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Try cache first for static assets
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Fetch from network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache successful responses
      await cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Network error:', error);
    return new Response('Offline', { status: 503 });
  }
}
