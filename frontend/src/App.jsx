import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import LandingPage from './components/LandingPage'
import AllProducts from './components/AllProducts'
import Products from './components/Products'
import TinProducts from './components/TinProducts'
import TentProducts from './components/TentProducts'
import StickerProducts from './components/StickerProducts'
import StickerProductDetail from './components/StickerProductDetail'
import ProductDetail from './components/ProductDetail'
import Contact from './components/Contact'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import BannerEditor from './components/BannerEditor'
import Checkout from './components/Checkout'
import TinCheckout from './components/TinCheckout'
import TentCheckout from './components/TentCheckout'
import StickerCheckout from './components/StickerCheckout'
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
import CreatorRegistration from './components/CreatorRegistration'
import CreatorDashboard from './components/CreatorDashboard'
import TemplateUpload from './components/TemplateUpload'
import CreatorEarnings from './components/CreatorEarnings'
import TinSkinzMarketplace from './components/TinSkinzMarketplace'
import TinSkinzDemo from './components/TinSkinzDemo'
import TinSkinzCheckout from './components/TinSkinzCheckout'
import TinSkinzSuccess from './components/TinSkinzSuccess'
import CreatorProfile from './components/CreatorProfile'
import authService from './services/auth'

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
        
        <Route path="/stickers" element={
          <>
            <Header />
            <StickerProducts />
            <Footer />
          </>
        } />
        
        <Route path="/sticker-product/:id" element={
          <>
            <Header />
            <StickerProductDetail />
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
        <Route path="/blog" element={
          <>
            <Header />
            <Blog />
            <Footer />
          </>
        } />
        <Route path="/blog/:slug" element={<BlogPost />} />
        
        {/* Email Confirmation */}
        <Route path="/email-confirmed" element={<EmailConfirmed />} />
        <Route path="/check-email" element={<CheckEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/editor" element={
          <ProtectedRoute>
            <BannerEditor />
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
        
        <Route path="/sticker-checkout" element={
          <ProtectedRoute>
            <>
              <Header />
              <StickerCheckout />
              <Footer />
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

        {/* Catch all route - 404 page instead of redirect */}
        <Route path="*" element={
          <>
            <Header />
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
                <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                <a 
                  href="/" 
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  Go Home
                </a>
              </div>
            </div>
            <Footer />
          </>
        } />
      </Routes>
      </div>
    </HelmetProvider>
  )
}

export default App
