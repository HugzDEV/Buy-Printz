import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const EmailConfirmed = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Auto redirect to dashboard after 3 seconds
    const timer = setTimeout(() => {
      navigate('/dashboard')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <>
      <SEOHead 
        title="Email Confirmed - Welcome to BuyPrintz!"
        description="Your email has been successfully confirmed. Welcome to BuyPrintz professional banner printing platform."
        url="https://buyprintz.com/email-confirmed"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-xl rounded-3xl p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-buyprint-brand/20 backdrop-blur-sm border border-buyprint-brand/30 text-buyprint-brand rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10" />
            </div>
            
            {/* Success Message */}
            <h1 className="text-3xl font-bold text-white mb-4">
              Email Confirmed! 🎉
            </h1>
            
            <p className="text-white/90 text-lg mb-6 leading-relaxed">
              Welcome to BuyPrintz! Your account is now active and you can start creating professional banners with our lightning-fast 2-3 day delivery.
            </p>
            
            {/* Features Preview */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-white/80 text-sm">
                <CheckCircle className="w-4 h-4 text-buyprint-brand mr-2" />
                <span>Access to professional design tools</span>
              </div>
              <div className="flex items-center text-white/80 text-sm">
                <CheckCircle className="w-4 h-4 text-buyprint-brand mr-2" />
                <span>2-3 business day delivery guarantee</span>
              </div>
              <div className="flex items-center text-white/80 text-sm">
                <CheckCircle className="w-4 h-4 text-buyprint-brand mr-2" />
                <span>Premium banner materials & finishing</span>
              </div>
            </div>
            
            {/* CTA Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-buyprint-brand hover:bg-buyprint-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 w-full hover:scale-105 hover:shadow-2xl"
            >
              Go to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
            
            {/* Auto Redirect Notice */}
            <p className="text-white/60 text-xs mt-4">
              Redirecting automatically in 3 seconds...
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default EmailConfirmed
