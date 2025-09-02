import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'
import authService from '../services/auth'
import toast from 'react-hot-toast'
import PasswordResetModal from './PasswordResetModal'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [componentReady, setComponentReady] = useState(false)
  const navigate = useNavigate()

  // Simple component initialization to prevent hanging
  useEffect(() => {
    const timer = setTimeout(() => {
      setComponentReady(true)
    }, 100)
    
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      console.log('Login form submitted with:', { email, password: password ? '[HIDDEN]' : 'empty' })
      
      const result = await authService.login(email, password)
      console.log('Login successful:', result)
      
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      
      // Provide more specific error messages
      let errorMessage = 'Login failed. Please try again.'
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before logging in.'
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a moment before trying again.'
      } else if (error.message.includes('Supabase not initialized')) {
        errorMessage = 'Authentication service not available. Please check your configuration.'
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Show loading state until component is ready
  if (!componentReady) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading login page...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* BuyPrintz Logo */}
        <div className="flex justify-center mb-6">
          <img 
            src="/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png" 
            alt="BuyPrintz Logo" 
            className="h-32 w-auto"
          />
        </div>
        
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Need help?</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Forgot your password?{' '}
                <button 
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="font-medium text-primary-600 hover:text-primary-500 transition-colors"
                >
                  Reset it here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      <PasswordResetModal 
        isOpen={showResetModal} 
        onClose={() => setShowResetModal(false)} 
      />
    </div>
  )
}

export default Login
