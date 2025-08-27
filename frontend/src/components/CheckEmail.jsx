import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Mail, RefreshCw, ArrowLeft, CheckCircle } from 'lucide-react'
import SEOHead from './SEOHead'
import authService from '../services/auth'
import toast from 'react-hot-toast'

const CheckEmail = () => {
  const [email, setEmail] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    // Get email from sessionStorage (set during registration)
    const registrationEmail = sessionStorage.getItem('registrationEmail')
    if (registrationEmail) {
      setEmail(registrationEmail)
    }

    // Start cooldown timer if exists
    const cooldownEnd = sessionStorage.getItem('resendCooldownEnd')
    if (cooldownEnd) {
      const timeLeft = Math.max(0, parseInt(cooldownEnd) - Date.now())
      if (timeLeft > 0) {
        setResendCooldown(Math.ceil(timeLeft / 1000))
        
        const timer = setInterval(() => {
          setResendCooldown(prev => {
            if (prev <= 1) {
              clearInterval(timer)
              sessionStorage.removeItem('resendCooldownEnd')
              return 0
            }
            return prev - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      }
    }
  }, [])

  const handleResendEmail = async () => {
    if (resendCooldown > 0 || !email) return

    setIsResending(true)
    try {
      await authService.resendConfirmation(email)
      toast.success('Confirmation email sent! Please check your inbox.')
      
      // Set 60-second cooldown
      setResendCooldown(60)
      sessionStorage.setItem('resendCooldownEnd', (Date.now() + 60000).toString())
      
      const timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            sessionStorage.removeItem('resendCooldownEnd')
            return 0
          }
          return prev - 1
        })
      }, 1000)
      
    } catch (error) {
      toast.error('Failed to resend email. Please try again.')
    } finally {
      setIsResending(false)
    }
  }



  return (
    <>
      <SEOHead 
        title="Check Your Email - BuyPrintz Account Confirmation"
        description="Please check your email to confirm your BuyPrintz account and start designing professional banners."
        url="https://buyprintz.com/check-email"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-lg w-full">
          <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-xl rounded-3xl p-8 text-center">
            {/* Email Icon */}
            <div className="w-20 h-20 bg-buyprint-brand/20 backdrop-blur-sm border border-buyprint-brand/30 text-buyprint-brand rounded-full flex items-center justify-center mx-auto mb-6">
              <Mail className="w-10 h-10" />
            </div>
            
            {/* Main Message */}
            <h1 className="text-3xl font-bold text-white mb-4">
              Check Your Email! 📧
            </h1>
            
            <p className="text-white/90 text-lg mb-6 leading-relaxed">
              We've sent a confirmation email to:
            </p>
            
            {email && (
              <div className="bg-white/10 border border-white/20 rounded-xl p-4 mb-6">
                <p className="text-buyprint-brand font-bold text-lg break-all">
                  {email}
                </p>
              </div>
            )}
            
            <p className="text-white/80 mb-8">
              Please open your email app or browser and look for our confirmation email. Click the confirmation link to activate your account and start creating professional banners with our 2-3 business day delivery.
            </p>
            
            {/* Quick Actions */}
            <div className="space-y-4 mb-8">
              <button
                onClick={handleResendEmail}
                disabled={isResending || resendCooldown > 0}
                className="bg-buyprint-brand hover:bg-buyprint-600 disabled:bg-white/20 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 w-full hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 border border-white/30"
              >
                <RefreshCw className={`w-5 h-5 ${isResending ? 'animate-spin' : ''}`} />
                {isResending ? 'Sending...' : 
                 resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 
                 'Resend Confirmation Email'}
              </button>
            </div>
            
            {/* Help Section */}
            <div className="space-y-4 text-sm text-white/70">
              <div className="flex items-start text-left space-x-3">
                <CheckCircle className="w-4 h-4 text-buyprint-brand mt-0.5 flex-shrink-0" />
                <p>Open your email app (Gmail, Outlook, Apple Mail, etc.) to find the confirmation email</p>
              </div>
              <div className="flex items-start text-left space-x-3">
                <CheckCircle className="w-4 h-4 text-buyprint-brand mt-0.5 flex-shrink-0" />
                <p>Check your spam/junk folder if you don't see the email in your inbox</p>
              </div>
              <div className="flex items-start text-left space-x-3">
                <CheckCircle className="w-4 h-4 text-buyprint-brand mt-0.5 flex-shrink-0" />
                <p>The confirmation link will expire in 24 hours for security</p>
              </div>
              <div className="flex items-start text-left space-x-3">
                <CheckCircle className="w-4 h-4 text-buyprint-brand mt-0.5 flex-shrink-0" />
                <p>Use the "Resend" button above if you need a new confirmation email</p>
              </div>
            </div>
            
            {/* Back to Login */}
            <div className="mt-8 pt-6 border-t border-white/20">
              <Link 
                to="/login"
                className="text-white/80 hover:text-white transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </div>
          
          {/* Alternative Contact */}
          <div className="text-center mt-6">
            <p className="text-white/60 text-sm">
              Need help? Contact us at{' '}
              <a 
                href="mailto:order@buyprintz.com" 
                className="text-buyprint-brand hover:text-buyprint-400 transition-colors"
              >
                order@buyprintz.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default CheckEmail
