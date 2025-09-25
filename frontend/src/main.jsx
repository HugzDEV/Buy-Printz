import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Toaster } from 'react-hot-toast'
import { Toaster as SonnerToaster } from 'sonner'
import App from './App.jsx'
import './index.css'
import { addGlobalDownloadProtection } from './utils/downloadProtection'

// Lazy load non-critical components
const LazyApp = React.lazy(() => import('./App.jsx'))

// Initialize Stripe with optimized loading
const stripeKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY

// Lazy load Stripe only when needed to improve initial page load
let stripePromise = null
const loadStripeWhenNeeded = () => {
  if (!stripePromise && stripeKey) {
    // Defer Stripe loading to reduce initial bundle size
    stripePromise = new Promise((resolve) => {
      // Load Stripe asynchronously after page load
      setTimeout(() => {
        loadStripe(stripeKey, {
          // Optimize Stripe loading
          stripeAccount: undefined,
          apiVersion: '2023-10-16', // Use stable API version
          locale: 'en'
        }).then(resolve)
      }, 100) // Small delay to prioritize critical content
    })
  }
  return stripePromise
}

if (!stripeKey) {
  console.warn('VITE_STRIPE_PUBLISHABLE_KEY not found. Payment functionality will be disabled.')
}

// Initialize download protection
addGlobalDownloadProtection()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Elements stripe={loadStripeWhenNeeded()}>
        <Suspense fallback={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            <div>Loading BuyPrintz...</div>
          </div>
        }>
          <App />
        </Suspense>
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
