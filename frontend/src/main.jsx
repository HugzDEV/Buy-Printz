import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Toaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from 'sonner'
import App from './App.jsx'
import './index.css'
import { addGlobalDownloadProtection } from './utils/downloadProtection'

// Initialize Stripe
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

if (!stripeKey) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY not found. Payment functionality will be disabled.')
}

// Initialize download protection
addGlobalDownloadProtection()

// Clear any cached data on page load to prevent UI breaking on refresh
if (typeof window !== 'undefined') {
  // Clear any stale cache data
  if (window.localStorage) {
    const cacheKeys = Object.keys(window.localStorage).filter(key => 
      key.startsWith('cache_') || key.startsWith('auth_') || key.startsWith('user_')
    )
    cacheKeys.forEach(key => {
      try {
        const data = JSON.parse(window.localStorage.getItem(key))
        // Clear cache entries older than 1 hour
        if (data && data.timestamp && Date.now() - data.timestamp > 3600000) {
          window.localStorage.removeItem(key)
        }
      } catch (e) {
        // If parsing fails, remove the item
        window.localStorage.removeItem(key)
      }
    })
  }
  
  // Force reload if this is a refresh (not initial load)
  if (window.performance && window.performance.navigation.type === 1) {
    // This is a refresh, ensure clean state
    console.log('🔄 Page refreshed - ensuring clean state')
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Elements stripe={stripePromise}>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <SonnerToaster 
          position="top-right"
          richColors
          closeButton
        />
      </Elements>
    </BrowserRouter>
  </React.StrictMode>,
)
