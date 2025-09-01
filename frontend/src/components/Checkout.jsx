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
  Check
} from 'lucide-react'
import authService from '../services/auth'
import PrintPreviewModal from './PrintPreviewModal'

const Checkout = () => {
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
  
  // Banner Options State
  const [bannerOptions, setBannerOptions] = useState({
    grommets: 'every-2ft',
    hem: 'standard-hem',
    windSlits: false,
    polePockets: 'none'
  })
  
  // Shipping Options State
  const [shippingOption, setShippingOption] = useState('standard')
  
  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    orderSummary: true,
    bannerOptions: true,
    customerInfo: true,
    payment: false
  })
  
  const [loading, setLoading] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [checkoutStep, setCheckoutStep] = useState('creating') // creating, preview, ready, processing, completed, error
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [approvedPDF, setApprovedPDF] = useState(null)

  // Banner Options Configuration
  const grommetOptions = [
    { value: 'every-2ft', label: 'Every 2 feet (Standard)', price: 0 },
    { value: 'every-18in', label: 'Every 18 inches', price: 5 },
    { value: 'corners-only', label: 'Corners only', price: -5 },
    { value: 'no-grommets', label: 'No grommets', price: -10 }
  ]

  const hemOptions = [
    { value: 'standard-hem', label: 'Standard 1" hem', price: 0 },
    { value: 'reinforced-hem', label: 'Reinforced double hem', price: 8 },
    { value: 'welded-hem', label: 'Heat welded hem', price: 12 },
    { value: 'rope-hem', label: 'Rope reinforced hem', price: 15 }
  ]

  const polePocketOptions = [
    { value: 'none', label: 'No pole pockets', price: 0 },
    { value: 'top', label: 'Top pole pocket', price: 8 },
    { value: 'top-bottom', label: 'Top & bottom pole pockets', price: 15 },
    { value: 'sides', label: 'Side pole pockets', price: 12 }
  ]

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
  }

  // Collapsible Section Component
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
        isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
      }`}>
        <div className="p-6 space-y-6">
          {children}
        </div>
      </div>
    </div>
  )

  useEffect(() => {
    const savedOrderData = sessionStorage.getItem('orderData')
    if (!savedOrderData) {
      navigate('/editor')
      return
    }

    try {
      const parsedOrderData = JSON.parse(savedOrderData)
      console.log('Loading order data from sessionStorage:', parsedOrderData)
      setOrderData(parsedOrderData)
    } catch (error) {
      console.error('Failed to parse order data:', error)
      navigate('/editor')
    }
  }, [navigate])

  useEffect(() => {
    if (orderData) {
      createOrder()
    }
  }, [orderData])

  const createOrder = async () => {
    try {
      console.log('Creating order with data:', orderData)
      
      // Update order data with banner options
      const updatedOrderData = {
        ...orderData,
        print_options: bannerOptions,
        shipping_option: shippingOption
      }
      
      const response = await authService.authenticatedRequest('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(updatedOrderData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Order creation failed:', errorData)
        throw new Error(errorData.detail || 'Failed to create order')
      }
      
      const data = await response.json()
      console.log('Order created successfully:', data)
      
      if (data.success) {
        setOrderId(data.order_id)
        createPaymentIntent(data.order_id)
        setCheckoutStep('preview') // Show preview before payment
        toast.success('Order created successfully!')
      } else {
        setCheckoutStep('error')
        toast.error('Failed to create order')
      }
    } catch (error) {
      console.error('Order creation error:', error)
      setCheckoutStep('error')
      toast.error(`Error creating order: ${error.message}`)
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
      // Don't set ready here - payment intent is created during preview step
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

  const handleBannerOptionChange = (option, value) => {
    setBannerOptions(prev => ({
      ...prev,
      [option]: value
    }))
  }

  const handleShowPreview = () => {
    setShowPreviewModal(true)
  }

  const handlePreviewApprove = (pdfBlob) => {
    setApprovedPDF(pdfBlob)
    setShowPreviewModal(false)
    setCheckoutStep('ready')
    toast.success('Design approved! Ready for payment.')
  }

  const handlePreviewCancel = () => {
    setShowPreviewModal(false)
  }

  // Save customer information
  const saveCustomerInfo = async () => {
    try {
      // Here you would typically save to your backend
      // For now, we'll just log it
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
      // Save customer information first
      await saveCustomerInfo()

      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Order successful
      setCheckoutStep('completed')
      toast.success('Order submitted successfully!')
      
      // Navigate to confirmation or show success message
      setTimeout(() => {
        navigate('/confirmation')
      }, 1500)

    } catch (error) {
      console.error('Order submission error:', error)
      setCheckoutStep('error')
      toast.error('Order submission failed. Please try again.')
    } finally {
      setLoading(false)
    }
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

  const basePrices = {
    banner: 25.00,
    sign: 35.00,
    sticker: 15.00,
    custom: 50.00
  }

  const basePrice = basePrices[orderData.product_type] || 50.00
  
  // Calculate banner options costs
  const grommetCost = grommetOptions.find(opt => opt.value === bannerOptions.grommets)?.price || 0
  const hemCost = hemOptions.find(opt => opt.value === bannerOptions.hem)?.price || 0
  const polePocketCost = polePocketOptions.find(opt => opt.value === bannerOptions.polePockets)?.price || 0
  const windSlitCost = bannerOptions.windSlits ? 8 : 0
  const shippingCost = shippingOptions.find(opt => opt.value === shippingOption)?.price || 0
  
  const optionsTotal = grommetCost + hemCost + polePocketCost + windSlitCost
  const subtotal = basePrice * orderData.quantity + optionsTotal
  const totalAmount = subtotal + shippingCost

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-4 lg:py-8">
      <div className="container mx-auto px-2 sm:px-4 max-w-6xl overflow-hidden">
        <div className="text-center mb-4 lg:mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                // Save current order data to sessionStorage before going back
                if (orderData) {
                  sessionStorage.setItem('cancelledOrder', JSON.stringify(orderData))
                  console.log('Saved cancelled order data for restoration')
                }
                navigate('/editor')
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors backdrop-blur-sm bg-white/20 rounded-xl px-4 py-2 border border-white/30"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Editor
            </button>
            <div></div> {/* Spacer for centering */}
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order and payment</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 backdrop-blur-xl bg-white/20 rounded-2xl p-4 lg:p-6 border border-white/30 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] lg:min-w-0">
            <div className="flex items-center gap-2">
              {getStepIcon('creating', checkoutStep)}
              <span className={getStepStatus('creating', checkoutStep)}>Creating Order</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div className={`h-full transition-all duration-500 ${
                ['preview', 'ready', 'processing', 'completed'].includes(checkoutStep) 
                  ? 'bg-blue-500 w-full' 
                  : 'bg-gray-200 w-0'
              }`} />
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon('preview', checkoutStep)}
              <span className={getStepStatus('preview', checkoutStep)}>Print Preview</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div className={`h-full transition-all duration-500 ${
                ['ready', 'processing', 'completed'].includes(checkoutStep) 
                  ? 'bg-blue-500 w-full' 
                  : 'bg-gray-200 w-0'
              }`} />
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon('ready', checkoutStep)}
              <span className={getStepStatus('ready', checkoutStep)}>Payment Ready</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div className={`h-full transition-all duration-500 ${
                ['processing', 'completed'].includes(checkoutStep) 
                  ? 'bg-blue-500 w-full' 
                  : 'bg-gray-200 w-0'
              }`} />
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon('processing', checkoutStep)}
              <span className={getStepStatus('processing', checkoutStep)}>Processing</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div className={`h-full transition-all duration-500 ${
                checkoutStep === 'completed' 
                  ? 'bg-green-500 w-full' 
                  : 'bg-gray-200 w-0'
              }`} />
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon('completed', checkoutStep)}
              <span className={getStepStatus('completed', checkoutStep)}>Complete</span>
            </div>
          </div>
        </div>

        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Order Summary */}
          <CollapsibleSection
            title="Order Summary"
            icon={ShoppingCart}
            isExpanded={expandedSections.orderSummary}
            onToggle={() => toggleSection('orderSummary')}
            defaultExpanded={true}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">Banner Design</p>
                    <p className="text-sm text-blue-700">Custom vinyl banner</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-blue-900">${orderData?.total_amount || 25}</p>
                  <p className="text-sm text-blue-700">Total</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Dimensions</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {orderData?.dimensions?.width || 2}ft × {orderData?.dimensions?.height || 4}ft
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-600">Quantity</p>
                  <p className="text-lg font-semibold text-gray-900">{orderData?.quantity || 1}</p>
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Banner Options */}
          <CollapsibleSection
            title="Banner Options & Shipping"
            icon={Settings}
            isExpanded={expandedSections.bannerOptions}
            onToggle={() => toggleSection('bannerOptions')}
            defaultExpanded={true}
          >
            <div className="space-y-6">
              {/* Grommets */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-blue-600" />
                  Grommets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {grommetOptions.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="grommets"
                        value={option.value}
                        checked={bannerOptions.grommets === option.value}
                        onChange={(e) => setBannerOptions(prev => ({ ...prev, grommets: e.target.value }))}
                        className="mr-3 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className={`text-sm ${option.price > 0 ? 'text-green-600' : option.price < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                          {option.price > 0 ? `+$${option.price}` : option.price < 0 ? `-$${Math.abs(option.price)}` : 'No additional cost'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Hem Options */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-purple-600" />
                  Hem Style
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {hemOptions.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="hem"
                        value={option.value}
                        checked={bannerOptions.hem === option.value}
                        onChange={(e) => setBannerOptions(prev => ({ ...prev, hem: e.target.value }))}
                        className="mr-3 text-purple-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className={`text-sm ${option.price > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                          {option.price > 0 ? `+$${option.price}` : 'No additional cost'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
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
                      <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.value}
                          checked={shippingOption === option.value}
                          onChange={(e) => setShippingOption(e.target.value)}
                          className="mr-3 text-green-600"
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
            </div>
          </CollapsibleSection>

          {/* Customer Information */}
          <CollapsibleSection
            title="Customer Information"
            icon={User}
            isExpanded={expandedSections.customerInfo}
            onToggle={() => toggleSection('customerInfo')}
            defaultExpanded={true}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, address: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={customerInfo.state}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={customerInfo.zipCode}
                    onChange={(e) => setCustomerInfo(prev => ({ ...prev, zipCode: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="ZIP Code"
                  />
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* Payment Section */}
          <CollapsibleSection
            title="Payment & Review"
            icon={CreditCardIcon}
            isExpanded={expandedSections.payment}
            onToggle={() => toggleSection('payment')}
            defaultExpanded={false}
          >
            <div className="space-y-6">
              {/* Order Review */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Order Review</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Banner Design:</span>
                    <span className="font-medium">${orderData?.total_amount || 25}</span>
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
                        ${(orderData?.total_amount || 25) + 
                           (shippingOption === 'express' ? 25 : 
                            shippingOption === 'overnight' ? 45 : 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Preview Design
                </button>
                
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading || !customerInfo.name || !customerInfo.email}
                  className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Complete Order
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
      />
    </div>
  )
}

export default Checkout
