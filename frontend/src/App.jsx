import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import LandingPage from './components/LandingPage'
import Products from './components/Products'
import TinProducts from './components/TinProducts'
import TentProducts from './components/TentProducts'
import ProductDetail from './components/ProductDetail'
import Contact from './components/Contact'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import BannerEditor from './components/BannerEditor'
import Checkout from './components/Checkout'
import TinCheckout from './components/TinCheckout'
import OrderConfirmation from './components/OrderConfirmation'
import TermsOfService from './components/TermsOfService'
import PrivacyPolicy from './components/PrivacyPolicy'
import EmailConfirmed from './components/EmailConfirmed'
import CheckEmail from './components/CheckEmail'
import ResetPassword from './components/ResetPassword'
import Header from './components/Header'
import Footer from './components/Footer'
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
            <Footer />
          </>
        } />
        
        <Route path="/products" element={
          <>
            <Header />
            <Products />
            <Footer />
          </>
        } />
        
        <Route path="/tin-products" element={
          <>
            <Header />
            <TinProducts />
            <Footer />
          </>
        } />
        
        <Route path="/tent-products" element={
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
        
        <Route path="/confirmation" element={
          <ProtectedRoute>
            <>
              <Header />
              <OrderConfirmation />
              <Footer />
            </>
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
