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
  Square,
  Triangle,
  Circle,
  Diamond
} from 'lucide-react'
import authService from '../services/auth'
import InlinePrintPreview from './InlinePrintPreview'
import { GlassCard } from './ui'

// Collapsible Section Component - Standardized design
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
        <span className="font-semibold text-gray-900">{title}</span>
      </div>
      {isExpanded ? (
        <ChevronUp className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
      ) : (
        <ChevronDown className="h-5 w-5 text-gray-500 group-hover:text-gray-700 transition-colors" />
      )}
    </button>
    {isExpanded && (
      <div className="p-6 bg-white">
        {children}
      </div>
    )}
  </div>
)

const StickerCheckout = () => {
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
  
  // Sticker Configuration - Based on sticker specifications
  const stickerConfig = {
    // Quantity Options
    quantities: [
      { value: 50, label: '50 Stickers', basePrice: 29.99 },
      { value: 100, label: '100 Stickers', basePrice: 49.99 },
      { value: 250, label: '250 Stickers', basePrice: 99.99 },
      { value: 500, label: '500 Stickers', basePrice: 179.99 },
      { value: 1000, label: '1000 Stickers', basePrice: 299.99 }
    ],
    
    // Material Options
    materials: [
      { value: 'vinyl', label: 'Vinyl', priceModifier: 0.00, description: 'Standard vinyl stickers' },
      { value: 'paper', label: 'Paper', priceModifier: -0.10, description: 'Paper stickers (indoor use)' },
      { value: 'clear', label: 'Clear Vinyl', priceModifier: 0.15, description: 'Transparent vinyl stickers' }
    ],
    
    // Finish Options
    finishes: [
      { 
        value: 'matte', 
        label: 'Matte Finish', 
        priceModifier: 0.00, 
        description: 'Indoor/outdoor use',
        properties: { waterproof: false, uvResistant: false, removable: false }
      },
      { 
        value: 'glossy', 
        label: 'Glossy Finish', 
        priceModifier: 0.05, 
        description: 'Waterproof, UV resistant, permanent',
        properties: { waterproof: true, uvResistant: true, removable: false }
      },
      { 
        value: 'satin', 
        label: 'Satin Finish', 
        priceModifier: 0.03, 
        description: 'Semi-gloss finish',
        properties: { waterproof: false, uvResistant: false, removable: false }
      }
    ],
    
    // Shape Options
    shapes: [
      { value: 'circle', label: 'Circle', priceModifier: 0.00 },
      { value: 'square', label: 'Square', priceModifier: 0.00 },
      { value: 'rectangle', label: 'Rectangle', priceModifier: 0.00 },
      { value: 'oval', label: 'Oval', priceModifier: 0.00 },
      { value: 'triangle', label: 'Triangle', priceModifier: 0.00 },
      { value: 'diamond', label: 'Diamond', priceModifier: 0.00 },
      { value: 'custom', label: 'Custom Shape', priceModifier: 0.25 }
    ],
    
    // Size Options (diameter for circles, width for others)
    sizes: [
      { value: '1x1', label: '1" × 1"', priceModifier: 0.00 },
      { value: '2x2', label: '2" × 2"', priceModifier: 0.00 },
      { value: '3x3', label: '3" × 3"', priceModifier: 0.00 },
      { value: '4x4', label: '4" × 4"', priceModifier: 0.00 },
      { value: '5x5', label: '5" × 5"', priceModifier: 0.00 },
      { value: '6x6', label: '6" × 6"', priceModifier: 0.00 }
    ]
  }

  // Sticker Options State - Initialize from order data
  const [stickerOptions, setStickerOptions] = useState({
    quantity: 100,
    material: 'vinyl',
    finish: 'matte',
    shape: 'circle', // Will be overridden from order data
    size: '3x3', // Will be overridden from order data
    jobName: '',
    showAdvancedOptions: false
  })
  
  // Shipping Options State
  const [shippingOption, setShippingOption] = useState('')
  const [shippingOptions, setShippingOptions] = useState([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState(null)
  
  // Collapsible sections state - Progressive user journey
  const [expandedSections, setExpandedSections] = useState({
    printPreview: true,      // Start with print preview
    stickerOptions: false,   // Opens after preview approval
    customerInfo: false,     // Opens after sticker options
    shipping: false,         // Opens after customer info
    reviewPayment: false     // Opens after shipping selection
  })
  
  const [loading, setLoading] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [checkoutStep, setCheckoutStep] = useState('printPreview')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [approvedPDF, setApprovedPDF] = useState(null)
  const [previewApproved, setPreviewApproved] = useState(false)

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
    const sectionOrder = ['printPreview', 'stickerOptions', 'customerInfo', 'shipping', 'reviewPayment']
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
    const sectionOrder = ['printPreview', 'stickerOptions', 'customerInfo', 'shipping', 'reviewPayment']
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

  // Get shipping rates from UPS
  const getShippingRates = async () => {
    if (!customerInfo.zipCode || !customerInfo.address) {
      setShippingOptions([])
      return
    }

    try {
      setShippingLoading(true)
      setShippingError(null)

      const orderData = {
        total_quantity: stickerOptions.quantity,
        selected_designs: [{
          design_id: 'custom-sticker',
          quantity: stickerOptions.quantity,
          sticker_type: stickerOptions.material,
          sticker_finish: stickerOptions.finish,
          sticker_shape: stickerOptions.shape,
          sticker_size: stickerOptions.size
        }]
      }

      const shippingCustomerInfo = {
        name: customerInfo.name || 'Customer',
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        zipCode: customerInfo.zipCode,
        phone: customerInfo.phone || '5551234567'
      }

      const response = await authService.authenticatedRequest('/api/stickers/shipping/get-rates', {
        method: 'POST',
        body: JSON.stringify({
          selected_designs: orderData.selected_designs,
          total_quantity: orderData.total_quantity,
          customer_info: shippingCustomerInfo
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.shipping_options) {
          setShippingOptions(data.shipping_options)
          // Auto-select the first (cheapest) option
          if (data.shipping_options.length > 0 && !shippingOption) {
            setShippingOption(data.shipping_options[0].type)
          }
        } else {
          setShippingError('Unable to get shipping rates')
          setShippingOptions([])
        }
      } else {
        setShippingError('Failed to get shipping rates')
        setShippingOptions([])
      }
    } catch (error) {
      console.error('Error getting shipping rates:', error)
      setShippingError('Error getting shipping rates')
      setShippingOptions([])
    } finally {
      setShippingLoading(false)
    }
  }

  // Calculate sticker pricing
  const calculateStickerPrice = () => {
    const baseQuantity = stickerConfig.quantities.find(q => q.value === stickerOptions.quantity)
    const material = stickerConfig.materials.find(m => m.value === stickerOptions.material)
    const finish = stickerConfig.finishes.find(f => f.value === stickerOptions.finish)
    const shape = stickerConfig.shapes.find(s => s.value === stickerOptions.shape)
    const size = stickerConfig.sizes.find(s => s.value === stickerOptions.size)
    
    if (!baseQuantity || !material || !finish || !shape || !size) {
      return 0
    }
    
    let totalPrice = baseQuantity.basePrice
    
    // Add material modifier (per unit)
    totalPrice += (material.priceModifier * stickerOptions.quantity)
    
    // Add finish modifier (per unit)
    totalPrice += (finish.priceModifier * stickerOptions.quantity)
    
    // Add shape modifier (per unit)
    totalPrice += (shape.priceModifier * stickerOptions.quantity)
    
    return totalPrice
  }
  
  const stickerBasePrice = calculateStickerPrice()
  const shippingCost = shippingOptions.find(opt => opt.type === shippingOption)?.cost || 0
  
  // Calculate marketplace template costs
  const marketplaceCost = orderData?.marketplace_templates ? 
    orderData.marketplace_templates.reduce((total, template) => total + (template.price || 0), 0) : 0
  
  // Calculate tax (MA 6.25%)
  const subtotal = stickerBasePrice + marketplaceCost
  const taxRate = 0.0625
  const taxAmount = subtotal * taxRate
  
  const totalAmount = Math.round((subtotal + taxAmount + shippingCost) * 100) / 100

  useEffect(() => {
    const savedOrderData = sessionStorage.getItem('orderData')
    if (!savedOrderData) {
      navigate('/editor')
      return
    }

    try {
      const parsedOrderData = JSON.parse(savedOrderData)
      console.log('Loading sticker order data from sessionStorage:', parsedOrderData)
      setOrderData(parsedOrderData)
      
      // Initialize sticker options from order data
      if (parsedOrderData.sticker_specs) {
        setStickerOptions(prev => ({
          ...prev,
          material: parsedOrderData.sticker_specs.material || 'vinyl',
          finish: parsedOrderData.sticker_specs.finish || 'matte',
          shape: parsedOrderData.sticker_specs.shape || 'circle',
          size: parsedOrderData.sticker_specs.size || '3x3'
        }))
      }
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
          sessionStorage.setItem('redirectAfterLogin', '/sticker-checkout')
          navigate('/login')
          return
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        sessionStorage.setItem('redirectAfterLogin', '/sticker-checkout')
        navigate('/login')
        return
      } finally {
        setAuthLoading(false)
      }
    }
    
    checkAuth()
  }, [navigate])

  // Get shipping rates when customer info or sticker options change
  useEffect(() => {
    if (customerInfo.zipCode && customerInfo.address && customerInfo.city && customerInfo.state) {
      getShippingRates()
    }
  }, [customerInfo.zipCode, customerInfo.address, customerInfo.city, customerInfo.state, stickerOptions.quantity, stickerOptions.material, stickerOptions.finish, stickerOptions.shape, stickerOptions.size])

  const createOrder = async () => {
    try {
      console.log('Creating sticker order with data:', orderData)
      
      // Update order data with sticker options
      const updatedOrderData = {
        ...orderData,
        product_type: 'custom_sticker',
        sticker_options: stickerOptions,
        shipping_option: shippingOption
      }
      
      const response = await authService.authenticatedRequest('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(updatedOrderData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Sticker order creation failed:', errorData)
        throw new Error(errorData.detail || 'Failed to create sticker order')
      }
      
      const data = await response.json()
      console.log('Sticker order created successfully:', data)
      
      if (data.success) {
        setOrderId(data.order_id)
        createPaymentIntent(data.order_id)
        setCheckoutStep('preview')
        toast.success('Sticker order created successfully!')
      } else {
        setCheckoutStep('error')
        toast.error('Failed to create sticker order')
      }
    } catch (error) {
      console.error('Sticker order creation error:', error)
      setCheckoutStep('error')
      toast.error(`Error creating sticker order: ${error.message}`)
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

  const handleStickerOptionChange = (option, value) => {
    setStickerOptions(prev => ({
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
    setCheckoutStep('stickerOptions')
    setExpandedSections(prev => ({
      ...prev,
      stickerOptions: true
    }))
    toast.success('Design approved! Now configure your sticker options.')
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

    if (!shippingOption || shippingCost === 0) {
      toast.error('Please select a shipping method')
      return
    }

    if (!stripe || !elements) {
      toast.error('Payment system not ready. Please try again.')
      return
    }

    setLoading(true)
    setCheckoutStep('processing')

    try {
      // Create order with all the data
      const updatedOrderData = {
        ...orderData, // This contains canvas_data, dimensions, etc. from BannerEditor
        product_type: 'custom_sticker',
        quantity: stickerOptions.quantity,
        sticker_options: stickerOptions,
        customer_info: customerInfo,
        shipping_option: {
          service_code: shippingOption,
          cost: shippingCost
        },
        total_amount: totalAmount, // Include the calculated total amount
        subtotal: subtotal,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        // Also send amount in cents for backend compatibility
        amount_cents: Math.round(totalAmount * 100)
      }

      // Debug pricing calculation
      console.log('🔍 Frontend Pricing Debug:', {
        stickerBasePrice,
        marketplaceCost,
        subtotal,
        taxAmount,
        shippingCost,
        totalAmount,
        quantity: stickerOptions.quantity
      })

      console.log('📤 Sending to backend:', {
        total_amount: totalAmount,
        amount_cents: Math.round(totalAmount * 100),
        subtotal,
        tax_amount: taxAmount,
        shipping_cost: shippingCost
      })

      // Create order
      const orderResponse = await authService.authenticatedRequest('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(updatedOrderData)
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        throw new Error(errorData.detail || 'Failed to create order')
      }

      const orderResponseData = await orderResponse.json()
      console.log('Order created successfully:', orderResponseData)

      // Create payment intent
      const paymentIntentResponse = await authService.authenticatedRequest('/api/payments/create-intent', {
        method: 'POST',
        body: JSON.stringify({ order_id: orderResponseData.order_id })
      })

      if (!paymentIntentResponse.ok) {
        const errorData = await paymentIntentResponse.json()
        throw new Error(errorData.detail || 'Failed to create payment intent')
      }

      const paymentIntent = await paymentIntentResponse.json()
      console.log('Payment intent created:', paymentIntent)

      // Get card element
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Payment form not found')
      }

      // Confirm payment with Stripe
      const { error } = await stripe.confirmCardPayment(paymentIntent.client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: customerInfo.name,
            email: customerInfo.email,
            address: {
              line1: customerInfo.address,
              city: customerInfo.city,
              state: customerInfo.state,
              postal_code: customerInfo.zipCode,
              country: 'US'
            }
          }
        }
      })

      if (error) {
        console.error('Payment failed:', error)
        toast.error('Payment failed. Please try again.')
        return
      }

      // Create shipment with UPS
      const shippingOrderData = {
        total_quantity: stickerOptions.quantity,
        selected_designs: [{
          design_id: 'custom-sticker',
          quantity: stickerOptions.quantity,
          sticker_type: stickerOptions.material,
          sticker_finish: stickerOptions.finish,
          sticker_shape: stickerOptions.shape,
          sticker_size: stickerOptions.size
        }]
      }

      const shippingCustomerInfo = {
        name: customerInfo.name,
        address: customerInfo.address,
        city: customerInfo.city,
        state: customerInfo.state,
        zipCode: customerInfo.zipCode,
        phone: customerInfo.phone || '5551234567'
      }

      // Create shipment
      const shipmentResponse = await authService.authenticatedRequest('/api/stickers/shipping/create-shipment', {
        method: 'POST',
        body: JSON.stringify({
          order_data: shippingOrderData,
          customer_info: shippingCustomerInfo,
          service_code: shippingOption
        })
      })

      if (shipmentResponse.ok) {
        const shipmentData = await shipmentResponse.json()
        if (shipmentData.success && shipmentData.shipment_info?.tracking_number) {
          console.log('Shipment created with tracking number:', shipmentData.shipment_info.tracking_number)
          toast.success(`Order shipped! Tracking: ${shipmentData.shipment_info.tracking_number}`)
        }
      }

      setCheckoutStep('completed')
      toast.success('Sticker order submitted successfully!')
      
      setTimeout(() => {
        navigate('/confirmation')
      }, 1500)

    } catch (error) {
      console.error('Sticker order submission error:', error)
      setCheckoutStep('error')
      toast.error('Sticker order submission failed. Please try again.')
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
          <p className="text-gray-600 mb-4">You need to be logged in to access the sticker checkout.</p>
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

  if (!orderData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-8 border border-white/30 shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                if (orderData) {
                  // Store only essential data for canvas restoration, not the large images
                  const restorationData = {
                    canvas_data: orderData.canvas_data,
                    surface_elements: orderData.surface_elements,
                    marketplace_templates: orderData.marketplace_templates,
                    product_type: orderData.product_type,
                    design_option: orderData.design_option,
                    tent_design_option: orderData.tent_design_option,
                    tin_surface_coverage: orderData.tin_surface_coverage
                  }
                  sessionStorage.setItem('cancelledOrder', JSON.stringify(restorationData))
                  console.log('Saved cancelled sticker order data for restoration')
                }
                navigate('/editor?product=sticker')
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors backdrop-blur-sm bg-white/20 rounded-xl px-4 py-2 border border-white/30"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Sticker Editor
            </button>
            
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
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
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="mb-3 text-center">
                  <Eye className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="text-lg font-semibold text-blue-900">Review Your Sticker Design</h3>
                  <p className="text-blue-700">Confirm your design before proceeding.</p>
                </div>
                <InlinePrintPreview
                  orderDetails={orderData}
                  canvasData={orderData?.canvas_data}
                  productType={orderData?.product_type === 'custom_sticker' ? 'sticker' : orderData?.product_type || 'sticker'}
                  dimensions={orderData?.dimensions}
                  surfaceElements={orderData?.surface_elements || {}}
                  currentSurface={orderData?.current_surface || 'front'}
                  onApprove={() => {
                    setPreviewApproved(true)
                    continueToNextSection('printPreview')
                  }}
                />
              </div>
              
              {previewApproved && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Design Approved!</p>
                      <p className="text-sm text-green-700">Your sticker design has been approved and is ready for production.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => continueToNextSection('printPreview')}
                    className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Continue to Sticker Options →
                  </button>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Sticker Options - Step 2 */}
          <CollapsibleSection
            title="Sticker Options"
            icon={Settings}
            isExpanded={expandedSections.stickerOptions}
            onToggle={() => toggleSection('stickerOptions')}
            defaultExpanded={false}
            data-section="stickerOptions"
          >
            <div className="space-y-6 pb-6">
              {/* Pricing Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Professional Sticker Options</p>
                    <p>High-quality vinyl stickers with custom graphics. Perfect for branding, events, and promotional use.</p>
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
                      value={stickerOptions.jobName}
                      onChange={(e) => setStickerOptions(prev => ({ ...prev, jobName: e.target.value }))}
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
                  {stickerConfig.quantities.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                      <input 
                        type="radio" 
                        name="quantity" 
                        value={option.value} 
                        checked={stickerOptions.quantity === option.value} 
                        onChange={(e) => setStickerOptions(prev => ({ ...prev, quantity: parseInt(e.target.value) }))} 
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

              {/* Material Selection */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  Material
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {stickerConfig.materials.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 active:bg-purple-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-purple-500 focus-within:ring-offset-2">
                      <input 
                        type="radio" 
                        name="material" 
                        value={option.value} 
                        checked={stickerOptions.material === option.value} 
                        onChange={(e) => setStickerOptions(prev => ({ ...prev, material: e.target.value }))} 
                        className="mr-3 text-purple-600 focus:ring-purple-500" 
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        <p className={`text-sm ${option.priceModifier > 0 ? 'text-green-600' : option.priceModifier < 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                          {option.priceModifier > 0 ? `+$${option.priceModifier}/unit` : 
                           option.priceModifier < 0 ? `-$${Math.abs(option.priceModifier)}/unit` : 
                           'No additional cost'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Finish Selection */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-yellow-600" />
                  Finish
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {stickerConfig.finishes.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 active:bg-yellow-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-yellow-500 focus-within:ring-offset-2">
                      <input 
                        type="radio" 
                        name="finish" 
                        value={option.value} 
                        checked={stickerOptions.finish === option.value} 
                        onChange={(e) => setStickerOptions(prev => ({ ...prev, finish: e.target.value }))} 
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

              {/* Shape and Size Display (Read-only from editor) */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-green-600" />
                  Sticker Specifications
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      {(() => {
                        const getShapeIcon = (shape) => {
                          switch (shape) {
                            case 'circle': return <Circle className="w-5 h-5 text-green-600" />
                            case 'square': return <Square className="w-5 h-5 text-green-600" />
                            case 'rectangle': return <Square className="w-5 h-5 text-green-600" />
                            case 'oval': return <Circle className="w-5 h-5 text-green-600" />
                            case 'triangle': return <Triangle className="w-5 h-5 text-green-600" />
                            case 'diamond': return <Diamond className="w-5 h-5 text-green-600" />
                            case 'custom': return <Layers className="w-5 h-5 text-green-600" />
                            default: return <Square className="w-5 h-5 text-green-600" />
                          }
                        }
                        return getShapeIcon(stickerOptions.shape)
                      })()}
                      <span className="font-medium text-gray-900">Shape</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      {stickerConfig.shapes.find(s => s.value === stickerOptions.shape)?.label || 'Circle'}
                    </p>
                    <p className="text-sm text-gray-600">Selected in editor</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Ruler className="w-5 h-5 text-indigo-600" />
                      <span className="font-medium text-gray-900">Size</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-800">
                      {stickerConfig.sizes.find(s => s.value === stickerOptions.size)?.label || '3" × 3"'}
                    </p>
                    <p className="text-sm text-gray-600">Selected in editor</p>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Shape and size are locked</p>
                      <p>These specifications were set in the editor and cannot be changed during checkout. To modify, return to the editor.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-6 pb-2 border-t border-gray-200 mt-6">
                <button
                  onClick={() => goToPreviousSection('stickerOptions')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all duration-200 rounded-lg flex items-center gap-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  ← Back to Preview
                </button>
                <button
                  onClick={() => continueToNextSection('stickerOptions')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
                >
                  Continue to Customer Info →
                </button>
              </div>
            </div>
          </CollapsibleSection>

          {/* Customer Information - Step 3 */}
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
                  <select
                    value={customerInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                  >
                    <option value="">Select State</option>
                    <option value="AL">Alabama</option>
                    <option value="AK">Alaska</option>
                    <option value="AZ">Arizona</option>
                    <option value="AR">Arkansas</option>
                    <option value="CA">California</option>
                    <option value="CO">Colorado</option>
                    <option value="CT">Connecticut</option>
                    <option value="DE">Delaware</option>
                    <option value="FL">Florida</option>
                    <option value="GA">Georgia</option>
                    <option value="HI">Hawaii</option>
                    <option value="ID">Idaho</option>
                    <option value="IL">Illinois</option>
                    <option value="IN">Indiana</option>
                    <option value="IA">Iowa</option>
                    <option value="KS">Kansas</option>
                    <option value="KY">Kentucky</option>
                    <option value="LA">Louisiana</option>
                    <option value="ME">Maine</option>
                    <option value="MD">Maryland</option>
                    <option value="MA">Massachusetts</option>
                    <option value="MI">Michigan</option>
                    <option value="MN">Minnesota</option>
                    <option value="MS">Mississippi</option>
                    <option value="MO">Missouri</option>
                    <option value="MT">Montana</option>
                    <option value="NE">Nebraska</option>
                    <option value="NV">Nevada</option>
                    <option value="NH">New Hampshire</option>
                    <option value="NJ">New Jersey</option>
                    <option value="NM">New Mexico</option>
                    <option value="NY">New York</option>
                    <option value="NC">North Carolina</option>
                    <option value="ND">North Dakota</option>
                    <option value="OH">Ohio</option>
                    <option value="OK">Oklahoma</option>
                    <option value="OR">Oregon</option>
                    <option value="PA">Pennsylvania</option>
                    <option value="RI">Rhode Island</option>
                    <option value="SC">South Carolina</option>
                    <option value="SD">South Dakota</option>
                    <option value="TN">Tennessee</option>
                    <option value="TX">Texas</option>
                    <option value="UT">Utah</option>
                    <option value="VT">Vermont</option>
                    <option value="VA">Virginia</option>
                    <option value="WA">Washington</option>
                    <option value="WV">West Virginia</option>
                    <option value="WI">Wisconsin</option>
                    <option value="WY">Wyoming</option>
                    <option value="DC">District of Columbia</option>
                  </select>
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
                  ← Back to Sticker Options
                </button>
                <button
                  onClick={() => continueToNextSection('customerInfo')}
                  disabled={!customerInfo.name || !customerInfo.email}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
                >
                  Continue to Shipping →
                </button>
              </div>
            </div>
          </CollapsibleSection>

          {/* Shipping - Step 4 */}
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
                <p className="text-green-700">
                  {customerInfo.zipCode ? 'Choose your preferred shipping method' : 'Enter your shipping address to see shipping options'}
                </p>
              </div>

              {/* Shipping Options */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-600" />
                  Shipping Method
                </h4>
                {!customerInfo.zipCode ? (
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Shipping options will appear here</p>
                    <p className="text-sm text-gray-500">Please enter your shipping address above to see available shipping methods and costs</p>
                  </div>
                ) : shippingLoading ? (
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                    <p className="text-gray-600">Getting shipping rates...</p>
                  </div>
                ) : shippingError ? (
                  <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
                    <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
                    <p className="text-red-600 mb-2">Unable to get shipping rates</p>
                    <p className="text-sm text-red-500">{shippingError}</p>
                    <button
                      onClick={getShippingRates}
                      className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : shippingOptions.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {shippingOptions.map((option) => (
                      <label key={option.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 active:bg-green-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.type}
                          checked={shippingOption === option.type}
                          onChange={(e) => setShippingOption(e.target.value)}
                          className="mr-3 text-green-600 focus:ring-green-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Truck className="w-4 h-4 text-green-600" />
                            <p className="font-medium text-gray-900">{option.name}</p>
                          </div>
                          <p className="text-sm text-green-600 font-medium">
                            ${option.cost}
                          </p>
                          {option.estimated_days && (
                            <p className="text-xs text-gray-500">
                              Est. delivery: {option.estimated_days} days
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">No shipping options available</p>
                    <p className="text-sm text-gray-500">Please check your address and try again</p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => goToPreviousSection('shipping')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  ← Back to Customer Information
                </button>
                <button
                  onClick={() => continueToNextSection('shipping')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
                  Sticker Order Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">{stickerOptions.quantity} Stickers</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium">
                      {stickerConfig.materials.find(m => m.value === stickerOptions.material)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Finish:</span>
                    <span className="font-medium">
                      {stickerConfig.finishes.find(f => f.value === stickerOptions.finish)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shape:</span>
                    <span className="font-medium">
                      {stickerConfig.shapes.find(s => s.value === stickerOptions.shape)?.label} (Locked)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">
                      {stickerConfig.sizes.find(s => s.value === stickerOptions.size)?.label} (Locked)
                    </span>
                  </div>
                  
                  {/* Marketplace Templates */}
                  {orderData?.marketplace_templates && orderData.marketplace_templates.length > 0 && (
                    <>
                      {orderData.marketplace_templates.map((template, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-gray-600">Marketplace Template:</span>
                          <span className="font-medium text-buyprint-brand">+${template.price}</span>
                        </div>
                      ))}
                    </>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (6.25%):</span>
                    <span className="font-medium">
                      ${taxAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Calculating...'}
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

              {/* Payment Information */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCardIcon className="w-5 h-5 text-blue-600" />
                  Payment Information
                </h4>
                <div className="p-4 border border-gray-300 rounded-lg bg-white">
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
                <p className="text-sm text-gray-600 mt-2">
                  Your payment information is secure and encrypted. We accept all major credit cards.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => goToPreviousSection('reviewPayment')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 active:bg-gray-100 active:scale-95 font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 shadow-sm hover:shadow-md"
                >
                  ← Back to Shipping
                </button>
                
                <button
                  onClick={handleSubmitOrder}
                  disabled={loading || !customerInfo.name || !customerInfo.email}
                  className="flex-1 px-6 py-3 bg-buyprint-brand hover:bg-buyprint-600 active:bg-buyprint-700 active:scale-95 disabled:bg-gray-400 text-white font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-buyprint-brand focus:ring-offset-2 shadow-lg hover:shadow-xl disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5" />
                      Complete Sticker Order
                    </>
                  )}
                </button>
              </div>
            </div>
          </CollapsibleSection>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Summary
                </h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {stickerOptions.quantity} Stickers
                    </span>
                    <span className="font-medium">
                      ${stickerBasePrice.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium">
                      {stickerConfig.materials.find(m => m.value === stickerOptions.material)?.label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Finish:</span>
                    <span className="font-medium">
                      {stickerConfig.finishes.find(f => f.value === stickerOptions.finish)?.label}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shape:</span>
                    <span className="font-medium">
                      {stickerConfig.shapes.find(s => s.value === stickerOptions.shape)?.label} (Locked)
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Size:</span>
                    <span className="font-medium">
                      {stickerConfig.sizes.find(s => s.value === stickerOptions.size)?.label} (Locked)
                    </span>
                  </div>
                  
                  {/* Marketplace Templates in sidebar */}
                  {orderData?.marketplace_templates && orderData.marketplace_templates.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marketplace Templates:</span>
                      <span className="font-medium text-buyprint-brand">
                        +${marketplaceCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (6.25%):</span>
                    <span className="font-medium">
                      ${taxAmount.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      {shippingCost > 0 ? `$${shippingCost.toFixed(2)}` : 'Calculating...'}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmitOrder}
                  disabled={loading || !customerInfo.name || !customerInfo.email}
                  className="w-full bg-gradient-to-r from-buyprint-brand to-buyprint-600 hover:from-buyprint-600 hover:to-buyprint-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Complete Order - ${totalAmount.toFixed(2)}
                    </>
                  )}
                </button>

                <div className="mt-4 text-xs text-gray-500 text-center">
                  By completing this order, you agree to our Terms of Service and Privacy Policy
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </div>

      {/* Modal removed in favor of inline preview */}
    </div>
  )
}

export default StickerCheckout
