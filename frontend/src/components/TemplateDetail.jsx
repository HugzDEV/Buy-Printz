import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Star, 
  Eye, 
  User, 
  ShoppingCart, 
  Heart,
  Share2,
  Download,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Tag,
  Calendar
} from 'lucide-react'
import { GlassCard, GlassButton } from './ui'
import ProtectedImage from './ProtectedImage'
import authService from '../services/auth'
import PaymentModal from './PaymentModal'

const TemplateDetail = () => {
  const { templateId } = useParams()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [template, setTemplate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseSuccess, setPurchaseSuccess] = useState(false)
  const [alreadyPurchased, setAlreadyPurchased] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)

  useEffect(() => {
    loadTemplate()
    
    // Check if user returned from successful payment
    if (searchParams.get('purchase') === 'success') {
      setPurchaseSuccess(true)
      setAlreadyPurchased(true)
      // Clean up URL
      navigate(`/marketplace/${templateId}`, { replace: true })
    }
  }, [templateId, searchParams, navigate])

  const loadTemplate = async () => {
    try {
      setLoading(true)
      // Use the same API URL as authService but without authentication
      const apiUrl = import.meta.env.VITE_API_URL || 'https://buy-printz-production.up.railway.app'
      const response = await fetch(`${apiUrl}/api/creator-marketplace/templates/${templateId}`)
      
      if (response.ok) {
        const data = await response.json()
        setTemplate(data.template)
        
        // Check if user already purchased this template
        if (data.template.already_purchased) {
          setAlreadyPurchased(true)
        }
      } else {
        setError('Template not found')
      }
    } catch (error) {
      console.error('Error loading template:', error)
      setError('Network error loading template')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = () => {
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = (paymentIntent) => {
    setShowPaymentModal(false)
    setPurchaseSuccess(true)
    setAlreadyPurchased(true)
    setError(null)
  }

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />)
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-5 h-5 text-yellow-400 fill-current opacity-50" />)
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-5 h-5 text-gray-300" />)
    }
    
    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <GlassButton onClick={() => navigate('/marketplace')}>
            Back to Marketplace
          </GlassButton>
        </GlassCard>
      </div>
    )
  }

  if (purchaseSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Purchase Successful! 🎉
          </h2>
          
          <p className="text-gray-600 mb-6">
            You now own "{template.name}". You can access it from your dashboard and use it in the canvas editor.
          </p>
          
          <div className="flex gap-4">
            <GlassButton
              onClick={() => navigate('/dashboard')}
              className="flex-1"
            >
              Go to Dashboard
            </GlassButton>
            <GlassButton
              onClick={() => navigate('/marketplace')}
              variant="outline"
              className="flex-1"
            >
              Browse More
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
          <GlassButton
            onClick={() => navigate('/marketplace')}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </GlassButton>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Template Preview */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="aspect-video bg-gray-100 rounded-xl mb-6 overflow-hidden">
                {template.preview_image_url ? (
                  <ProtectedImage
                    src={template.preview_image_url}
                    alt={template.name}
                    className="w-full h-full"
                    watermark={!alreadyPurchased}
                    watermarkOpacity={alreadyPurchased ? 0.05 : 0.2}
                    isPreview={!alreadyPurchased}
                    onUpgrade={() => setShowPaymentModal(true)}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <div className="text-6xl mb-4">🎨</div>
                      <p className="text-lg">Template Preview</p>
                      <p className="text-sm">Interactive preview would be displayed here</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Template Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {template.name}
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {template.description}
                  </p>
                </div>

                {/* Creator Info */}
                <div className="flex items-center gap-4 p-4 bg-white/20 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {template.creator?.display_name || 'Unknown Creator'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {template.creator?.is_verified ? 'Verified Creator' : 'Creator'}
                    </p>
                  </div>
                  {template.creator?.is_verified && (
                    <div className="ml-auto">
                      <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                        ✓ Verified
                      </div>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white/20 rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {template.rating ? template.rating.toFixed(1) : '0.0'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {template.rating_count || 0} reviews
                    </p>
                  </div>
                  
                  <div className="text-center p-4 bg-white/20 rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <Eye className="w-5 h-5 text-blue-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {template.view_count || 0}
                    </p>
                    <p className="text-sm text-gray-600">views</p>
                  </div>
                  
                  <div className="text-center p-4 bg-white/20 rounded-xl">
                    <div className="flex items-center justify-center mb-2">
                      <ShoppingCart className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">
                      {template.sales_count || 0}
                    </p>
                    <p className="text-sm text-gray-600">sales</p>
                  </div>
                </div>

                {/* Tags */}
                {template.tags && template.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {template.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          <Tag className="w-3 h-3 inline mr-1" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Tag className="w-4 h-4 mr-2" />
                    <span>Category: {template.category}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Created: {formatDate(template.created_at)}</span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Purchase Panel */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {formatCurrency(template.price)}
                </div>
                <p className="text-sm text-gray-600">
                  One-time purchase • Lifetime access
                </p>
              </div>

              {alreadyPurchased ? (
                <div className="text-center">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-xl mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-green-700 font-medium">You own this template!</p>
                  </div>
                  <GlassButton
                    onClick={() => navigate('/dashboard')}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Access in Dashboard
                  </GlassButton>
                </div>
              ) : (
                <div className="space-y-4">
                  <GlassButton
                    onClick={handlePurchase}
                    disabled={purchasing}
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {purchasing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Purchase Template
                      </>
                    )}
                  </GlassButton>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Secure payment powered by Stripe
                    </p>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="mt-8 space-y-3">
                <h3 className="font-semibold text-gray-900">What you get:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Full template files
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Commercial use license
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Lifetime access
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                    Easy customization
                  </li>
                </ul>
              </div>

              {/* Share Buttons */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex gap-2">
                  <GlassButton variant="outline" className="flex-1">
                    <Heart className="w-4 h-4 mr-2" />
                    Save
                  </GlassButton>
                  <GlassButton variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </GlassButton>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {template && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          template={template}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}
    </div>
  )
}

export default TemplateDetail
