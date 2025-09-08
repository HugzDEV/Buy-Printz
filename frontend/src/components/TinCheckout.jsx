import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'
import { 
  Lock, 
  CreditCard, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye,
  Settings,
  Package,
  Truck,
  Shield,
  Zap,
  Anchor,
  Wind,
  Ruler,
  Palette,
  Tag,
  ChevronLeft,
  ChevronRight,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  FileText,
  CreditCard as CreditCardIcon,
  Check,
  Layers,
  Box
} from 'lucide-react'
import authService from '../services/auth'
import PrintPreviewModal from './PrintPreviewModal'
import { GlassCard } from './ui'

// Collapsible Section Component - Reused from banner checkout
const CollapsibleSection = ({ title, icon: Icon, children, isExpanded, onToggle, defaultExpanded = false }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 hover:from-gray-100 hover:to-gray-50 transition-all duration-200 flex items-center justify-between group"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
          <Icon className="h-5 w-5 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="p-2 bg-gray-100 rounded-lg group-hover:bg-gray-200 transition-colors">
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-gray-600" />
        ) : (
          <ChevronDown className="h-5 w-5 text-gray-600" />
        )}
      </div>
    </button>
    
    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
      isExpanded ? 'max-h-[8000px] sm:max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
    }`}>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </div>
  </div>
)

const TinCheckout = () => {
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  
  const [orderData, setOrderData] = useState(null)
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })
  
  // Add authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  
  // Business Card Tin Configuration - Based on GALACTIC_EXPANSION_PLAN.md
  const tinConfig = {
    // Quantity Options
    quantities: [
      { value: 100, label: '100 Units', basePrice: 399.99 },
      { value: 250, label: '250 Units', basePrice: 749.99 },
      { value: 500, label: '500 Units', basePrice: 1000.00 }
    ],
    
    // Surface Coverage Options
    surfaceCoverage: [
      { 
        value: 'front-back', 
        label: 'Front + Back Only', 
        description: 'Design on front and back surfaces',
        priceModifier: 0.00
      },
      { 
        value: 'all-sides', 
        label: 'All Sides (Front + Back + Inside + Lid)', 
        description: 'Complete tin branding on all surfaces',
        priceModifier: 100.00
      }
    ],
    
    // Tin Finish Options
    tinFinishes: [
      { value: 'silver', label: 'Silver', priceModifier: 0.00, description: 'Classic silver finish' },
      { value: 'black', label: 'Black', priceModifier: 0.25, description: 'Premium black finish' },
      { value: 'gold', label: 'Gold', priceModifier: 0.50, description: 'Luxury gold finish' }
    ],
    
    // Printing Options
    printingMethods: [
      { 
        value: 'premium-vinyl', 
        label: 'Premium Vinyl Stickers', 
        description: 'High-quality vinyl stickers for tin application',
        priceModifier: 0.00
      },
      { 
        value: 'premium-clear-vinyl', 
        label: 'Premium Clear Vinyl Stickers', 
        description: 'Clear vinyl stickers for transparent effect',
        priceModifier: 25.00
      }
    ]
  }

  // Tin Options State
  const [tinOptions, setTinOptions] = useState({
    quantity: 100,
    surfaceCoverage: 'front-back',
    tinFinish: 'silver',
    printingMethod: 'premium-vinyl',
    jobName: '',
    showAdvancedOptions: false
  })
  
  // Shipping Options State
  const [shippingOption, setShippingOption] = useState('standard')
  
  // Collapsible sections state - Progressive user journey
  const [expandedSections, setExpandedSections] = useState({
    printPreview: true,      // Start with print preview
    tinOptions: false,       // Opens after preview approval
    shipping: false,         // Opens after tin options
    customerInfo: false,     // Opens after shipping selection
    reviewPayment: false     // Opens after customer info completion
  })
  
  const [loading, setLoading] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [checkoutStep, setCheckoutStep] = useState('printPreview')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [approvedPDF, setApprovedPDF] = useState(null)
  const [previewApproved, setPreviewApproved] = useState(false)

  // Shipping Options Configuration
  const shippingOptions = [
    { value: 'standard', label: 'Standard Shipping (5-7 days)', price: 0, icon: Truck },
    { value: 'express', label: 'Express Shipping (2-3 days)', price: 25, icon: Zap },
    { value: 'overnight', label: 'Overnight Shipping (1 day)', price: 45, icon: Package }
  ]

  // Toggle section expansion
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
    
    // Update checkout step when manually toggling sections
    if (expandedSections[section]) {
      // If closing a section, don't change step
      return
    } else {
      // If opening a section, update step
      setCheckoutStep(section)
    }
  }

  // Progressive navigation functions
  const continueToNextSection = (currentSection) => {
    const sectionOrder = ['printPreview', 'tinOptions', 'shipping', 'customerInfo', 'reviewPayment']
    const currentIndex = sectionOrder.indexOf(currentSection)
    const nextSection = sectionOrder[currentIndex + 1]
    
    if (nextSection) {
      setExpandedSections(prev => ({
        ...prev,
        [nextSection]: true
      }))
      
      // Update checkout step
      setCheckoutStep(nextSection)
      
      // Scroll to next section
      setTimeout(() => {
        const nextElement = document.querySelector(`[data-section="${nextSection}"]`)
        if (nextElement) {
          nextElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }

  const goToPreviousSection = (currentSection) => {
    const sectionOrder = ['printPreview', 'tinOptions', 'shipping', 'customerInfo', 'reviewPayment']
    const currentIndex = sectionOrder.indexOf(currentSection)
    const prevSection = sectionOrder[currentIndex - 1]
    
    if (prevSection) {
      setExpandedSections(prev => ({
        ...prev,
        [prevSection]: true
      }))
      
      // Update checkout step
      setCheckoutStep(prevSection)
      
      // Scroll to previous section
      setTimeout(() => {
        const prevElement = document.querySelector(`[data-section="${prevSection}"]`)
        if (prevElement) {
          prevElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 300)
    }
  }

  // Calculate tin pricing
  const calculateTinPrice = () => {
    const baseQuantity = tinConfig.quantities.find(q => q.value === tinOptions.quantity)
    const surfaceCoverage = tinConfig.surfaceCoverage.find(s => s.value === tinOptions.surfaceCoverage)
    const tinFinish = tinConfig.tinFinishes.find(f => f.value === tinOptions.tinFinish)
    const printingMethod = tinConfig.printingMethods.find(p => p.value === tinOptions.printingMethod)
    
    if (!baseQuantity || !surfaceCoverage || !tinFinish || !printingMethod) {
      return 0
    }
    
    let totalPrice = baseQuantity.basePrice
    
    // Add surface coverage modifier
    totalPrice += surfaceCoverage.priceModifier
    
    // Add tin finish modifier (per unit)
    totalPrice += (tinFinish.priceModifier * tinOptions.quantity)
    
    // Add printing method modifier
    totalPrice += printingMethod.priceModifier
    
    return totalPrice
  }
  
  const tinBasePrice = calculateTinPrice()
  const shippingCost = shippingOptions.find(opt => opt.value === shippingOption)?.price || 0
  const totalAmount = tinBasePrice + shippingCost

  useEffect(() => {
    const savedOrderData = sessionStorage.getItem('orderData')
    if (!savedOrderData) {
      navigate('/editor')
      return
    }

    try {
      const parsedOrderData = JSON.parse(savedOrderData)
      console.log('Loading tin order data from sessionStorage:', parsedOrderData)
      setOrderData(parsedOrderData)
    } catch (error) {
      console.error('Failed to parse order data:', error)
      navigate('/editor')
    }
  }, [navigate])

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true)
        const authenticated = await authService.isAuthenticated()
        setIsAuthenticated(authenticated)
        
        if (!authenticated) {
          console.log('User not authenticated, redirecting to login')
          sessionStorage.setItem('redirectAfterLogin', '/tin-checkout')
          navigate('/login')
          return
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        sessionStorage.setItem('redirectAfterLogin', '/tin-checkout')
        navigate('/login')
        return
      } finally {
        setAuthLoading(false)
      }
    }
    
    checkAuth()
  }, [navigate])

  useEffect(() => {
    if (orderData && isAuthenticated && !authLoading) {
      createOrder()
    }
  }, [orderData, isAuthenticated, authLoading])

  const createOrder = async () => {
    try {
      console.log('Creating tin order with data:', orderData)
      
      // Update order data with tin options
      const updatedOrderData = {
        ...orderData,
        product_type: 'business_card_tin',
        tin_options: tinOptions,
        shipping_option: shippingOption
      }
      
      const response = await authService.authenticatedRequest('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(updatedOrderData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Tin order creation failed:', errorData)
        throw new Error(errorData.detail || 'Failed to create tin order')
      }
      
      const data = await response.json()
      console.log('Tin order created successfully:', data)
      
      if (data.success) {
        setOrderId(data.order_id)
        createPaymentIntent(data.order_id)
        setCheckoutStep('preview')
        toast.success('Tin order created successfully!')
      } else {
        setCheckoutStep('error')
        toast.error('Failed to create tin order')
      }
    } catch (error) {
      console.error('Tin order creation error:', error)
      setCheckoutStep('error')
      toast.error(`Error creating tin order: ${error.message}`)
    }
  }

  const createPaymentIntent = async (orderId) => {
    try {
      const response = await authService.authenticatedRequest('/api/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderId })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create payment intent')
      }
      
      const data = await response.json()
      setPaymentIntent(data)
    } catch (error) {
      console.error('Payment intent error:', error)
      setCheckoutStep('error')
      toast.error(`Error creating payment intent: ${error.message}`)
    }
  }

  const handleInputChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTinOptionChange = (option, value) => {
    setTinOptions(prev => ({
      ...prev,
      [option]: value
    }))
  }

  const handleShowPreview = () => {
    setShowPreviewModal(true)
  }

  const handlePreviewApprove = (pdfBlob) => {
    setApprovedPDF(pdfBlob)
    setPreviewApproved(true)
    setShowPreviewModal(false)
    setCheckoutStep('tinOptions')
    setExpandedSections(prev => ({
      ...prev,
      tinOptions: true
    }))
    toast.success('Design approved! Now configure your tin options.')
  }

  const handlePreviewCancel = () => {
    setShowPreviewModal(false)
  }

  // Save customer information
  const saveCustomerInfo = async () => {
    try {
      console.log('Saving customer info:', customerInfo)
      return true
    } catch (error) {
      console.error('Error saving customer info:', error)
      return false
    }
  }

  // Handle order submission
  const handleSubmitOrder = async () => {
    if (!customerInfo.name || !customerInfo.email) {
      toast.error('Please fill in your name and email')
      return
    }

    setLoading(true)
    setCheckoutStep('processing')

    try {
      await saveCustomerInfo()
      await new Promise(resolve => setTimeout(resolve, 2000))

      setCheckoutStep('completed')
      toast.success('Tin order submitted successfully!')
      
      setTimeout(() => {
        navigate('/confirmation')
      }, 1500)

    } catch (error) {
      console.error('Tin order submission error:', error)
      setCheckoutStep('error')
      toast.error('Tin order submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = (step, currentStep) => {
    if (step === 'error') return <XCircle className="w-5 h-5 text-red-500" />
    if (step === 'completed') return <CheckCircle className="w-5 h-5 text-green-500" />
    if (step === currentStep) return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />
    if (currentStep === 'completed' || currentStep === 'error') return <CheckCircle className="w-5 h-5 text-green-500" />
    return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
  }

  const getStepStatus = (step, currentStep) => {
    if (step === currentStep) return 'text-blue-600 font-medium'
    if (currentStep === 'completed' || currentStep === 'error') return 'text-green-600'
    return 'text-gray-500'
  }

  // Early return for loading and error states
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Checking Authentication</h2>
          <p className="text-gray-600">Please wait while we verify your account...</p>
        </GlassCard>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="p-4 bg-red-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">You need to be logged in to access the tin checkout.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Go to Login
          </button>
        </GlassCard>
      </div>
    )
  }

  if (!orderData || !paymentIntent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-8 border border-white/30 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-4 lg:py-8">
      <div className="container mx-auto px-2 sm:px-4 max-w-6xl">
        <div className="text-center mb-4 lg:mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (orderData) {
                  sessionStorage.setItem('cancelledOrder', JSON.stringify(orderData))
                  console.log('Saved cancelled tin order data for restoration')
                }
                navigate('/editor?product=tin')
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors backdrop-blur-sm bg-white/20 rounded-xl px-4 py-2 border border-white/30"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Tin Editor
            </button>
            <div></div>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Business Card Tin Checkout</h1>
          <p className="text-gray-600">Complete your tin order and payment</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 backdrop-blur-xl bg-white/20 rounded-2xl p-4 lg:p-6 border border-white/30 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] lg:min-w-0">
            <div className="flex items-center gap-2">
              {getStepIcon('printPreview', checkoutStep)}
              <span className={getStepStatus('printPreview', checkoutStep)}>Print Preview</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div className={`h-full transition-all duration-500 ${
                ['tinOptions', 'shipping', 'customerInfo', 'reviewPayment', 'processing', 'completed', 'error'].includes(checkoutStep) 
                  ? 'bg-blue-500 w-full' 
                  : 'bg-gray-200 w-0'
              }`} />
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon('tinOptions', checkoutStep)}
              <span className={getStepStatus('tinOptions', checkoutStep)}>Tin Options</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div className={`h-full transition-all duration-500 ${
                ['shipping', 'customerInfo', 'reviewPayment', 'processing', 'completed', 'error'].includes(checkoutStep) 
                  ? 'bg-blue-500 w-full' 
                  : 'bg-gray-200 w-0'
              }`} />
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon('shipping', checkoutStep)}
              <span className={getStepStatus('shipping', checkoutStep)}>Shipping</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div className={`h-full transition-all duration-500 ${
                ['customerInfo', 'reviewPayment', 'processing', 'completed', 'error'].includes(checkoutStep) 
                  ? 'bg-blue-500 w-full' 
                  : 'bg-gray-200 w-0'
              }`} />
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon('customerInfo', checkoutStep)}
              <span className={getStepStatus('customerInfo', checkoutStep)}>Customer Info</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div className={`h-full transition-all duration-500 ${
                ['reviewPayment', 'processing', 'completed', 'error'].includes(checkoutStep) 
                  ? 'bg-blue-500 w-full' 
                  : 'bg-gray-200 w-0'
              }`} />
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon('reviewPayment', checkoutStep)}
              <span className={getStepStatus('reviewPayment', checkoutStep)}>Review & Payment</span>
            </div>
          </div>
        </div>

        {/* Order Summary Card - Sticky Container */}
        <div className="sticky top-0 z-20 mb-4 sm:mb-6">
          <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-3 sm:p-4 lg:p-6 border border-white/30 shadow-xl">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <Box className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Tin Order Summary</h3>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {tinOptions.quantity} Business Card Tins
                    {tinOptions.surfaceCoverage === 'all-sides' ? ' (All Sides)' : ' (Front + Back)'}
                  </p>
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    {tinConfig.tinFinishes.find(f => f.value === tinOptions.tinFinish)?.label} Finish
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-green-600">
                  ${totalAmount.toFixed(2)}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">Total (including shipping)</p>
                <div className="text-xs text-gray-500 mt-1">
                  <p>Base: ${tinBasePrice.toFixed(2)}</p>
                  <p>Shipping: +${shippingCost.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Print Preview - Step 1 */}
          <CollapsibleSection
            title="Print Preview"
            icon={Eye}
            isExpanded={expandedSections.printPreview}
            onToggle={() => toggleSection('printPreview')}
            defaultExpanded={true}
            data-section="printPreview"
          >
            <div className="space-y-4">
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                <Eye className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Review Your Tin Design</h3>
                <p className="text-blue-700 mb-4">
                  Before proceeding, please review your business card tin design to ensure it's exactly what you want printed.
                </p>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <Eye className="w-5 h-5" />
                  Preview Tin Design
                </button>
              </div>
              
              {previewApproved && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Design Approved!</p>
                      <p className="text-sm text-green-700">Your tin design has been approved and is ready for production.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => continueToNextSection('printPreview')}
                    className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Continue to Tin Options →
                  </button>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Tin Options - Step 2 */}
          <CollapsibleSection
            title="Tin Options"
            icon={Settings}
            isExpanded={expandedSections.tinOptions}
            onToggle={() => toggleSection('tinOptions')}
            defaultExpanded={false}
            data-section="tinOptions"
          >
            <div className="space-y-6 pb-6">
              {/* Pricing Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Premium Business Card Tins</p>
                    <p>High-quality metal tins with premium vinyl sticker printing. Perfect for professional networking and memorable business interactions.</p>
                  </div>
                </div>
              </div>

              {/* Job Details */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Job Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Name</label>
                    <input
                      type="text"
                      value={tinOptions.jobName}
                      onChange={(e) => setTinOptions(prev => ({ ...prev, jobName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter job name (optional)"
                    />
                  </div>
                </div>
              </div>

              {/* Quantity Selection */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Quantity
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tinConfig.quantities.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                      <input 
                        type="radio" 
                        name="quantity" 
                        value={option.value} 
                        checked={tinOptions.quantity === option.value} 
                        onChange={(e) => setTinOptions(prev => ({ ...prev, quantity: parseInt(e.target.value) }))} 
                        className="mr-3 text-blue-600 focus:ring-blue-500" 
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-green-600 font-medium">${option.basePrice}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Surface Coverage */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" />
                  Surface Coverage
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tinConfig.surfaceCoverage.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 active:bg-purple-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2">
                      <input 
                        type="radio" 
                        name="surfaceCoverage" 
                        value={option.value} 
                        checked={tinOptions.surfaceCoverage === option.value} 
                        onChange={(e) => setTinOptions(prev => ({ ...prev, surfaceCoverage: e.target.value }))} 
                        className="mr-3 text-purple-600 focus:ring-purple-500" 
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        <p className={`text-sm ${option.priceModifier > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          {option.priceModifier > 0 ? `+$${option.priceModifier}` : 'No additional cost'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Tin Finish */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-yellow-600" />
                  Tin Finish
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tinConfig.tinFinishes.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 active:bg-yellow-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-yellow-500 focus-within:ring-offset-2">
                      <input 
                        type="radio" 
                        name="tinFinish" 
                        value={option.value} 
                        checked={tinOptions.tinFinish === option.value} 
                        onChange={(e) => setTinOptions(prev => ({ ...prev, tinFinish: e.target.value }))} 
                        className="mr-3 text-yellow-600 focus:ring-yellow-500" 
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        <p className={`text-sm ${option.priceModifier > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          {option.priceModifier > 0 ? `+$${option.priceModifier}/unit` : 'No additional cost'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Printing Method */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  Printing Method
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {tinConfig.printingMethods.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 active:bg-green-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
                      <input 
                        type="radio" 
                        name="printingMethod" 
                        value={option.value} 
                        checked={tinOptions.printingMethod === option.value} 
                        onChange={(e) => setTinOptions(prev => ({ ...prev, printingMethod: e.target.value }))} 
                        className="mr-3 text-green-600 focus:ring-green-500" 
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        <p className={`text-sm ${option.priceModifier > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          {option.priceModifier > 0 ? `+$${option.priceModifier}` : 'No additional cost'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-6 pb-2 border-t border-gray-200 mt-6">
                <button
                  onClick={() => goToPreviousSection('tinOptions')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all duration-200 rounded-lg flex items-center gap-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  ← Back to Preview
                </button>
                <button
                  onClick={() => continueToNextSection('tinOptions')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                >
                  Continue to Shipping →
                </button>
              </div>
            </div>
          </CollapsibleSection>

          {/* Shipping - Step 3 */}
          <CollapsibleSection
            title="Shipping Options"
            icon={Truck}
            isExpanded={expandedSections.shipping}
            onToggle={() => toggleSection('shipping')}
            defaultExpanded={false}
            data-section="shipping"
          >
            <div className="space-y-6">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <Truck className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-700">Choose your preferred shipping method</p>
              </div>

              {/* Shipping Options */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-600" />
                  Shipping Method
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {shippingOptions.map((option) => {
                    const Icon = option.icon
                    return (
                      <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 active:bg-green-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.value}
                          checked={shippingOption === option.value}
                          onChange={(e) => setShippingOption(e.target.value)}
                          className="mr-3 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4 text-green-600" />
                            <p className="font-medium text-gray-900">{option.label}</p>
                          </div>
                          <p className={`text-sm ${option.price > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                            {option.price > 0 ? `+$${option.price}` : 'Free shipping'}
                          </p>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => goToPreviousSection('shipping')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  ← Back to Tin Options
                </button>
                <button
                  onClick={() => continueToNextSection('shipping')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  Continue to Customer Info →
                </button>
              </div>
            </div>
          </CollapsibleSection>

          {/* Customer Information - Step 4 */}
          <CollapsibleSection
            title="Customer Information"
            icon={User}
            isExpanded={expandedSections.customerInfo}
            onToggle={() => toggleSection('customerInfo')}
            defaultExpanded={false}
            data-section="customerInfo"
          >
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <User className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-blue-700">Please provide your contact and shipping information</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                    placeholder="Enter your street address"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={customerInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={customerInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={customerInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                    placeholder="ZIP Code"
                  />
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => goToPreviousSection('customerInfo')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  ← Back to Shipping
                </button>
                <button
                  onClick={() => continueToNextSection('customerInfo')}
                  disabled={!customerInfo.name || !customerInfo.email}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  Continue to Review & Payment →
                </button>
              </div>
            </div>
          </CollapsibleSection>

          {/* Review & Payment - Step 5 */}
          <CollapsibleSection
            title="Review & Payment"
            icon={CreditCardIcon}
            isExpanded={expandedSections.reviewPayment}
            onToggle={() => toggleSection('reviewPayment')}
            defaultExpanded={false}
            data-section="reviewPayment"
          >
            <div className="space-y-6">
              {/* Order Summary */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  Tin Order Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{tinOptions.quantity} Business Card Tins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Surface Coverage:</span>
                    <span className="font-medium">
                      {tinOptions.surfaceCoverage === 'all-sides' ? 'All Sides (Front + Back + Inside + Lid)' : 'Front + Back Only'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tin Finish:</span>
                    <span className="font-medium">
                      {tinConfig.tinFinishes.find(f => f.value === tinOptions.tinFinish)?.label}
                      {tinConfig.tinFinishes.find(f => f.value === tinOptions.tinFinish)?.priceModifier > 0 && 
                        <span className="text-green-600 ml-1">(+${tinConfig.tinFinishes.find(f => f.value === tinOptions.tinFinish)?.priceModifier}/unit)</span>
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Printing Method:</span>
                    <span className="font-medium">
                      {tinConfig.printingMethods.find(p => p.value === tinOptions.printingMethod)?.label}
                      {tinConfig.printingMethods.find(p => p.value === tinOptions.printingMethod)?.priceModifier > 0 && 
                        <span className="text-green-600 ml-1">(+${tinConfig.printingMethods.find(p => p.value === tinOptions.printingMethod)?.priceModifier})</span>
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      {shippingOption === 'standard' ? 'Free' : 
                       shippingOption === 'express' ? '+$25' : '+$45'}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        ${totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Info Review */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-blue-700 font-medium">Name:</span>
                    <p className="text-blue-900">{customerInfo.name || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Email:</span>
                    <p className="text-blue-900">{customerInfo.email || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Phone:</span>
                    <p className="text-blue-900">{customerInfo.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <span className="text-blue-700 font-medium">Address:</span>
                    <p className="text-blue-900">
                      {customerInfo.address ? `${customerInfo.address}, ${customerInfo.city}, ${customerInfo.state} ${customerInfo.zipCode}` : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => goToPreviousSection('reviewPayment')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 active:scale-95 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                >
                  ← Back to Customer Info
                </button>
                
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading || !customerInfo.name || !customerInfo.email}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 active:scale-95 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Complete Tin Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPreviewModal}
        onClose={handlePreviewCancel}
        onApprove={handlePreviewApprove}
        canvasData={orderData?.canvas_data}
        orderDetails={orderData}
        dimensions={orderData?.dimensions}
        productType={orderData?.product_type || 'business_card_tin'}
        surfaceElements={orderData?.surface_elements || {}}
        currentSurface={orderData?.current_surface || 'front'}
      />
    </div>
  )
}

export default TinCheckout
