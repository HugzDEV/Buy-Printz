import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react'
import authService from '../services/auth'
import toast from 'react-hot-toast'
import SEOHead from './SEOHead'

const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isValidLink, setIsValidLink] = useState(true)
  
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    // Check if we have the required tokens from the URL
    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')
    
    if (!accessToken || !refreshToken) {
      setIsValidLink(false)
      toast.error('Invalid or expired reset link')
    }
  }, [searchParams])

  const validatePassword = (pwd) => {
    const requirements = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    }
    
    return requirements
  }

  const passwordRequirements = validatePassword(password)
  const isPasswordValid = Object.values(passwordRequirements).every(req => req)

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!isPasswordValid) {
      toast.error('Please meet all password requirements')
      return
    }
    
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    
    try {
      await authService.updatePassword(password)
      toast.success('Password updated successfully!')
      
      // Redirect to login after successful password reset
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      
    } catch (error) {
      console.error('Password update error:', error)
      
      if (error.message.includes('session')) {
        toast.error('Reset link has expired. Please request a new one.')
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        toast.error(error.message || 'Failed to update password. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!isValidLink) {
    return (
      <>
        <SEOHead 
          title="Invalid Reset Link - BuyPrintz"
          description="This password reset link is invalid or has expired."
          url="https://buyprintz.com/reset-password"
        />
        
        <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center py-12 px-4">
          <div className="max-w-md w-full">
            <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-xl rounded-3xl p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">
                Invalid Reset Link
              </h1>
              <p className="text-white/80 mb-6">
                This password reset link is invalid or has expired. Please request a new one.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="bg-buyprint-brand hover:bg-buyprint-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <SEOHead 
        title="Set New Password - BuyPrintz"
        description="Create a new password for your BuyPrintz account."
        url="https://buyprintz.com/reset-password"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-xl rounded-3xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-buyprint-brand/20 backdrop-blur-sm border border-buyprint-brand/30 text-buyprint-brand rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Set New Password
              </h1>
              <p className="text-white/80">
                Create a strong password for your BuyPrintz account
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/60" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-buyprint-brand focus:border-buyprint-brand"
                    placeholder="Enter new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-white/60" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/60" />
                    )}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {password && (
                <div className="bg-white/10 border border-white/20 rounded-xl p-4 space-y-2">
                  <p className="text-white/90 text-sm font-medium mb-2">Password Requirements:</p>
                  {Object.entries({
                    length: 'At least 8 characters',
                    uppercase: 'One uppercase letter',
                    lowercase: 'One lowercase letter', 
                    number: 'One number',
                    special: 'One special character'
                  }).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <CheckCircle className={`w-4 h-4 ${passwordRequirements[key] ? 'text-green-400' : 'text-white/40'}`} />
                      <span className={`text-sm ${passwordRequirements[key] ? 'text-green-400' : 'text-white/70'}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-white mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-white/60" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-white/20 rounded-xl placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-buyprint-brand focus:border-buyprint-brand"
                    placeholder="Confirm new password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-white/60" />
                    ) : (
                      <Eye className="h-5 w-5 text-white/60" />
                    )}
                  </button>
                </div>
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-400 text-sm mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || !isPasswordValid || password !== confirmPassword}
                className="w-full bg-buyprint-brand hover:bg-buyprint-600 disabled:bg-white/20 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating Password...
                  </>
                ) : (
                  'Update Password'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-white/70 hover:text-white text-sm transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ResetPassword
