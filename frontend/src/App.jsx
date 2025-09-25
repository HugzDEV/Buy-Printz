import React, { useState, useEffect, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import LandingPage from './components/LandingPage'
import AllProducts from './components/AllProducts'
import Products from './components/Products'
import TinProducts from './components/TinProducts'
import TentProducts from './components/TentProducts'
import ProductDetail from './components/ProductDetail'
import Contact from './components/Contact'
import Login from './components/Login'
import Register from './components/Register'
import OrderConfirmation from './components/OrderConfirmation'
import TermsOfService from './components/TermsOfService'
import PrivacyPolicy from './components/PrivacyPolicy'
import Support from './components/Support'
import Blog from './components/Blog'
import BlogPost from './components/BlogPost'
import EmailConfirmed from './components/EmailConfirmed'
import CheckEmail from './components/CheckEmail'
import ResetPassword from './components/ResetPassword'
import Header from './components/Header'
import Footer from './components/Footer'
import Marketplace from './components/Marketplace'
import TemplateDetail from './components/TemplateDetail'

// Lazy load heavy components to reduce initial bundle size
const Dashboard = React.lazy(() => import('./components/Dashboard'))
const BannerEditor = React.lazy(() => import('./components/BannerEditor'))
const Checkout = React.lazy(() => import('./components/Checkout'))
const TinCheckout = React.lazy(() => import('./components/TinCheckout'))
const TentCheckout = React.lazy(() => import('./components/TentCheckout'))
// Lazy load more heavy components
const CreatorRegistration = React.lazy(() => import('./components/CreatorRegistration'))
const CreatorDashboard = React.lazy(() => import('./components/CreatorDashboard'))
const TemplateUpload = React.lazy(() => import('./components/TemplateUpload'))
const CreatorEarnings = React.lazy(() => import('./components/CreatorEarnings'))
const TinSkinzMarketplace = React.lazy(() => import('./components/TinSkinzMarketplace'))
// Lazy load remaining heavy components
const TinSkinzDemo = React.lazy(() => import('./components/TinSkinzDemo'))
const TinSkinzCheckout = React.lazy(() => import('./components/TinSkinzCheckout'))
const TinSkinzSuccess = React.lazy(() => import('./components/TinSkinzSuccess'))
const CreatorProfile = React.lazy(() => import('./components/CreatorProfile'))
const Admin = React.lazy(() => import('./components/Admin'))
import authService from './services/auth'

// Loading component for Suspense fallbacks
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
)

// Protected Route Component with Optimized Mobile Handling
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    let timeoutId = null
    
    const checkAuth = async () => {
      try {
        // Add timeout to prevent hanging on mobile
        const authPromise = authService.isAuthenticated()
        timeoutId = setTimeout(() => {
          if (mounted) {
            console.warn('Auth check timeout - assuming not authenticated')
            setIsAuthenticated(false)
            setLoading(false)
          }
        }, 5000) // 5 second timeout
        
        const auth = await authPromise
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        
        if (mounted) {
          setIsAuthenticated(auth)
          setLoading(false)
        }
      } catch (error) {
        console.warn('Auth check failed:', error)
        
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        
        if (mounted) {
          setIsAuthenticated(false)
          setLoading(false)
        }
      }
    }
    
    // Start auth check immediately
    checkAuth()

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route Component - Simplified for better mobile performance
const PublicRoute = ({ children }) => {
  // For public routes, we don't need to check authentication immediately
  // This prevents mobile hanging during routing
  return children
}

function App() {
  return (
    <HelmetProvider>
      <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={
          <>
            <Header />
            <LandingPage />
          </>
        } />
        
        <Route path="/all-products" element={
          <>
            <Header />
            <AllProducts />
            <Footer />
          </>
        } />
        
        <Route path="/banner-products" element={
          <>
            <Header />
            <Products />
            <Footer />
          </>
        } />
        
        <Route path="/business-card-tins" element={
          <>
            <Header />
            <TinProducts />
            <Footer />
          </>
        } />
        
        <Route path="/tradeshow-tents" element={
          <>
            <Header />
            <TentProducts />
            <Footer />
          </>
        } />
        
        <Route path="/contact" element={
          <>
            <Header />
            <Contact />
            <Footer />
          </>
        } />
        
        <Route path="/marketplace" element={
          <>
            <Header />
            <Marketplace />
            <Footer />
          </>
        } />
        
        <Route path="/marketplace/template/:templateId" element={
          <>
            <Header />
            <TemplateDetail />
            <Footer />
          </>
        } />
        
        <Route path="/creator/:creatorId" element={
          <>
            <Header />
            <CreatorProfile />
            <Footer />
          </>
        } />
        
        <Route path="/tin-skinz" element={
          <>
            <Header />
            <TinSkinzMarketplace />
            <Footer />
          </>
        } />
        
        <Route path="/tin-skinz-demo" element={
          <>
            <Header />
            <TinSkinzDemo />
            <Footer />
          </>
        } />
        
        <Route path="/tin-skinz/checkout" element={
          <>
            <Header />
            <TinSkinzCheckout />
            <Footer />
          </>
        } />
        
        <Route path="/tin-skinz/success" element={
          <>
            <Header />
            <TinSkinzSuccess />
            <Footer />
          </>
        } />
        
        <Route path="/product/:productId" element={
          <>
            <Header />
            <ProductDetail />
            <Footer />
          </>
        } />
        
        <Route path="/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        
        <Route path="/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />

        {/* Legal Pages */}
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/support" element={<Support />} />
        
        {/* Blog Pages */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        {/* Email Confirmation */}
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          </ProtectedRoute>
        } />
        
        <Route path="/editor" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <BannerEditor />
            </Suspense>
          </ProtectedRoute>
        } />
        
        <Route path="/checkout" element={
          <ProtectedRoute>
            <>
              <Header />
              <Checkout />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/tin-checkout" element={
          <ProtectedRoute>
            <>
              <Header />
              <TinCheckout />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/tent-checkout" element={
          <ProtectedRoute>
            <>
              <Header />
              <TentCheckout />
            </>
          </ProtectedRoute>
        } />
        
        <Route path="/confirmation" element={
          <ProtectedRoute>
            <>
              <Header />
              <OrderConfirmation />
              <Footer />
            </>
          </ProtectedRoute>
        } />
        
        {/* Creator Routes */}
        <Route path="/creator/register" element={
          <ProtectedRoute>
            <CreatorRegistration />
          </ProtectedRoute>
        } />
        
        <Route path="/creator/dashboard" element={
          <ProtectedRoute>
            <CreatorDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/creator/upload" element={
          <ProtectedRoute>
            <TemplateUpload />
          </ProtectedRoute>
        } />
        
        <Route path="/creator/earnings" element={
          <ProtectedRoute>
            <CreatorEarnings />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </HelmetProvider>
  )
}

export default App
