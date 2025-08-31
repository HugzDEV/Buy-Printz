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
  AlertCircle
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

  const saveCustomerInfo = async () => {
    try {
      const response = await authService.authenticatedRequest(`/api/orders/${orderId}/customer-info`, {
        method: 'POST',
        body: JSON.stringify(customerInfo)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save customer information')
      }
      
      console.log('Customer information saved successfully')
    } catch (error) {
      console.error('Error saving customer info:', error)
      // Don't fail the payment process if customer info save fails
      toast.error('Warning: Customer information could not be saved')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements || !orderData || !orderId) {
      return
    }

    setLoading(true)
    setCheckoutStep('processing')

    try {
      // Save customer information first
      await saveCustomerInfo()

      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: elements.getElement(CardElement),
        billing_details: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: {
            line1: customerInfo.address,
            city: customerInfo.city,
            state: customerInfo.state,
            postal_code: customerInfo.zipCode,
            country: 'US'
          }
        }
      })

      if (error) {
        toast.error(error.message)
        setLoading(false)
        setCheckoutStep('error')
        return
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(
        paymentIntent.client_secret,
        {
          payment_method: paymentMethod.id
        }
      )

      if (confirmError) {
        toast.error(confirmError.message)
        setLoading(false)
        setCheckoutStep('error')
        return
      }

      // Payment successful - order status will be updated via webhook
      setCheckoutStep('completed')
      sessionStorage.setItem('orderConfirmation', JSON.stringify({
        orderId: orderId,
        amount: paymentIntent.amount,
        customerInfo,
        bannerOptions,
        shippingOption
      }))
      
      // Clear order data from sessionStorage
      sessionStorage.removeItem('orderData')
      
      navigate('/confirmation')
      toast.success('Payment successful!')

    } catch (error) {
      console.error('Payment error:', error)
      setCheckoutStep('error')
      toast.error(`Payment failed: ${error.message}`)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Order Summary */}
          <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-4 lg:p-6 border border-white/30 shadow-xl max-h-[calc(100vh-250px)] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Package className="w-5 h-5 mr-2 text-blue-600" />
              Order Summary
            </h2>
            
            <div className="space-y-4">
              {/* Product Details */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/30">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Tag className="w-4 h-4 mr-2 text-blue-600" />
                  Product Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium capitalize">{orderData.product_type}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{orderData.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Dimensions:</span>
                    <span className="font-medium">{orderData.banner_size}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium">{orderData.banner_material}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Finish:</span>
                    <span className="font-medium">{orderData.banner_finish}</span>
                  </div>
                </div>
              </div>

              {/* Banner Options */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/30">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2 text-purple-600" />
                  Banner Options
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Grommets:</span>
                    <span className="font-medium">
                      {grommetOptions.find(opt => opt.value === bannerOptions.grommets)?.label}
                      {grommetCost > 0 && <span className="text-green-600 ml-1">+${grommetCost}</span>}
                      {grommetCost < 0 && <span className="text-red-600 ml-1">${grommetCost}</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hem:</span>
                    <span className="font-medium">
                      {hemOptions.find(opt => opt.value === bannerOptions.hem)?.label}
                      {hemCost > 0 && <span className="text-green-600 ml-1">+${hemCost}</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pole Pockets:</span>
                    <span className="font-medium">
                      {polePocketOptions.find(opt => opt.value === bannerOptions.polePockets)?.label}
                      {polePocketCost > 0 && <span className="text-green-600 ml-1">+${polePocketCost}</span>}
                    </span>
                  </div>
                  {bannerOptions.windSlits && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Wind Slits:</span>
                      <span className="font-medium text-green-600">+${windSlitCost}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/30">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-green-600" />
                  Pricing
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base Price:</span>
                    <span className="font-medium">${basePrice.toFixed(2)}</span>
                  </div>
                  {optionsTotal > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Options:</span>
                      <span className="font-medium text-green-600">+${optionsTotal.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      {shippingCost > 0 ? `+$${shippingCost.toFixed(2)}` : 'Free'}
                    </span>
                  </div>
                  <hr className="border-gray-300" />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-blue-600">${totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-sm bg-blue-400/20 rounded-xl p-4 border border-blue-200/30">
                <div className="flex items-center gap-2 text-blue-800">
                  <Lock className="w-4 h-4" />
                  <span className="text-sm font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-blue-700 mt-1">
                  Your payment information is encrypted and secure
                </p>
              </div>
            </div>
          </div>

          {/* Banner Options & Shipping */}
          <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-4 lg:p-6 border border-white/30 shadow-xl max-h-[calc(100vh-250px)] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-purple-600" />
              Banner Options
            </h2>
            
            <div className="space-y-6">
              {/* Grommets */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/30">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                  <Anchor className="w-4 h-4 mr-2 text-blue-600" />
                  Grommets (Eyelets)
                </label>
                <select
                  value={bannerOptions.grommets}
                  onChange={(e) => handleBannerOptionChange('grommets', e.target.value)}
                  className="w-full backdrop-blur-sm bg-white/50 rounded-lg px-3 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {grommetOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} {option.price > 0 ? `(+$${option.price})` : option.price < 0 ? `($${option.price})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Hem & Reinforcement */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/30">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                  <Ruler className="w-4 h-4 mr-2 text-green-600" />
                  Hem & Reinforcement
                </label>
                <select
                  value={bannerOptions.hem}
                  onChange={(e) => handleBannerOptionChange('hem', e.target.value)}
                  className="w-full backdrop-blur-sm bg-white/50 rounded-lg px-3 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {hemOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} {option.price > 0 ? `(+$${option.price})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wind Slits */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/30">
                <label className="flex items-center text-sm font-bold text-gray-800 mb-3">
                  <Wind className="w-4 h-4 mr-2 text-orange-600" />
                  <input 
                    type="checkbox" 
                    checked={bannerOptions.windSlits}
                    onChange={(e) => handleBannerOptionChange('windSlits', e.target.checked)}
                    className="mr-2 rounded"
                  />
                  Add wind slits for outdoor use (+$8)
                </label>
                <p className="text-xs text-gray-600 ml-6">Reduces wind resistance for large banners</p>
              </div>

              {/* Pole Pockets */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/30">
                <label className="block text-sm font-bold text-gray-800 mb-3 flex items-center">
                  <Package className="w-4 h-4 mr-2 text-purple-600" />
                  Pole Pockets
                </label>
                <select
                  value={bannerOptions.polePockets}
                  onChange={(e) => handleBannerOptionChange('polePockets', e.target.value)}
                  className="w-full backdrop-blur-sm bg-white/50 rounded-lg px-3 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {polePocketOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label} {option.price > 0 ? `(+$${option.price})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Shipping Options */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-4 border border-white/30">
                <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                  <Truck className="w-4 h-4 mr-2 text-indigo-600" />
                  Shipping Options
                </h3>
                <div className="space-y-3">
                  {shippingOptions.map(option => {
                    const IconComponent = option.icon
                    return (
                      <label key={option.value} className="flex items-center p-3 backdrop-blur-sm bg-white/50 rounded-lg border border-white/30 cursor-pointer hover:bg-white/70 transition-all">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.value}
                          checked={shippingOption === option.value}
                          onChange={(e) => setShippingOption(e.target.value)}
                          className="mr-3"
                        />
                        <IconComponent className="w-4 h-4 mr-2 text-indigo-600" />
                        <div className="flex-1">
                          <div className="font-medium text-gray-800">{option.label}</div>
                          <div className="text-sm text-gray-600">
                            {option.price > 0 ? `+$${option.price.toFixed(2)}` : 'Free'}
                          </div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-4 lg:p-6 border border-white/30 shadow-xl max-h-[calc(100vh-250px)] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
              <User className="w-5 h-5 mr-2 text-green-600" />
              Customer Information
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full backdrop-blur-sm bg-white/50 rounded-lg pl-10 pr-4 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full backdrop-blur-sm bg-white/50 rounded-lg pl-10 pr-4 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full backdrop-blur-sm bg-white/50 rounded-lg pl-10 pr-4 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full backdrop-blur-sm bg-white/50 rounded-lg pl-10 pr-4 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main St"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">City</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full backdrop-blur-sm bg-white/50 rounded-lg px-4 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="New York"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">State</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full backdrop-blur-sm bg-white/50 rounded-lg px-4 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="NY"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full backdrop-blur-sm bg-white/50 rounded-lg px-4 py-2 text-sm border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="10001"
                  />
                </div>
              </div>

              {/* Preview Step */}
              {checkoutStep === 'preview' && (
                <div className="mt-6 space-y-4">
                  <div className="backdrop-blur-sm bg-blue-400/20 rounded-xl p-4 border border-blue-200/30">
                    <h3 className="flex items-center gap-2 text-lg font-medium text-blue-800 mb-2">
                      <Eye className="w-5 h-5" />
                      Final Design Approval Required
                    </h3>
                    <p className="text-blue-700 text-sm mb-4">
                      Please review your banner design before payment. This shows exactly how your banner will look when printed by Buy Printz.
                    </p>
                    <button
                      type="button"
                      onClick={handleShowPreview}
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Review Final Design
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Section */}
              {checkoutStep === 'ready' && (
                <>
                  <div className="mt-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-800">
                      <CreditCard className="w-5 h-5" />
                      Payment Information
                    </h3>
                    
                    <div className="backdrop-blur-sm bg-white/50 rounded-xl p-4 border border-white/30">
                      <CardElement
                        options={{
                          style: {
                            base: {
                              fontSize: '16px',
                              color: '#424770',
                              '::placeholder': {
                                color: '#aab7c4',
                              },
                            },
                            invalid: {
                              color: '#9e2146',
                            },
                          },
                        }}
                      />
                    </div>
                  </div>

                  {approvedPDF && (
                    <div className="mt-4 backdrop-blur-sm bg-green-400/20 rounded-xl p-4 border border-green-200/30">
                      <div className="flex items-center gap-2 text-green-800 mb-2">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Design Approved</span>
                      </div>
                      <p className="text-green-700 text-sm">
                        Your print design has been verified and approved. Ready for payment!
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!stripe || loading || checkoutStep !== 'ready'}
                    className="w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Processing Payment...
                      </div>
                    ) : (
                      `Pay $${totalAmount.toFixed(2)}`
                    )}
                  </button>
                </>
              )}
            </form>
          </div>
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
