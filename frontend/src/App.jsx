import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import LandingPage from './components/LandingPage'
import Products from './components/Products'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import BannerEditor from './components/BannerEditor'
import Checkout from './components/Checkout'
import OrderConfirmation from './components/OrderConfirmation'
import TermsOfService from './components/TermsOfService'
import PrivacyPolicy from './components/PrivacyPolicy'
import EmailConfirmed from './components/EmailConfirmed'
import CheckEmail from './components/CheckEmail'
import ResetPassword from './components/ResetPassword'
import Header from './components/Header'
import Footer from './components/Footer'
import authService from './services/auth'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await authService.isAuthenticated()
        setIsAuthenticated(auth)
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  
  return children
}

// Public Route Component (redirects to dashboard if already authenticated)
const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await authService.isAuthenticated()
        setIsAuthenticated(auth)
      } catch (error) {
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    checkAuth()
  }, [])

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }
  
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
                        <>
                          <Header />
                          <BannerEditor />
                          <Footer />
                        </>
                      </ProtectedRoute>
                    } />
        
        <Route path="/checkout" element={
          <ProtectedRoute>
            <>
              <Header />
              <Checkout />
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

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </HelmetProvider>
  )
}

export default App
