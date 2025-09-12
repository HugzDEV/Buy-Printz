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
import shippingService from '../services/shippingService'
import PrintPreviewModal from './PrintPreviewModal'
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
    zipCode: '',
    jobName: ''
  })
  
  // Add authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  
  // Banner Options Configuration - Updated to match Supabase table
  const bannerOptionsConfig = {
    // 1. Width x Height (from editor - already handled)
    // 2. # of sides
    sides: [
      { value: 1, label: 'Single Sided', price: 0 },
      { value: 2, label: 'Double Sided', description: 'Additional cost applies' }
    ],
    
    // 3. Material (from editor - already handled)
    // 4. Pole Pockets - 10% markup (internal)
    polePockets: [
      { value: 'none', label: 'No Pole Pockets', price: 0 },
      { value: '2in-top', label: '2" Pocket - Top Only (fits 1" pole)', description: 'Additional cost applies' },
      { value: '3in-top', label: '3" Pocket - Top Only (fits 1.5" pole)', description: 'Additional cost applies' },
      { value: '4in-top', label: '4" Pocket - Top Only (fits 2" pole)', description: 'Additional cost applies' },
      { value: '2in-top-bottom', label: '2" Pockets - Top & Bottom', description: 'Additional cost applies' },
      { value: '3in-top-bottom', label: '3" Pockets - Top & Bottom', description: 'Additional cost applies' },
      { value: '4in-top-bottom', label: '4" Pockets - Top & Bottom', description: 'Additional cost applies' }
    ],
    
    // 5. Hem Options - Free
    hem: [
      { value: 'no-hem', label: 'No Hem', price: 0 },
      { value: 'all-sides', label: 'All Sides Hem', price: 0 }
    ],
    
    // 6. Grommet Options - $3.00 flat rate
    grommets: [
      { value: 'every-2ft-all-sides', label: 'Every 2\' - All Sides', price: 3.00 },
      { value: 'every-2ft-top-bottom', label: 'Every 2\' - Top & Bottom', price: 3.00 },
      { value: 'every-2ft-left-right', label: 'Every 2\' - Left & Right', price: 3.00 },
      { value: '4-corners-only', label: '4 Corners Only', price: 3.00 },
      { value: 'no-grommets', label: 'No Grommets', price: 0 }
    ],
    
    // 7. Webbing Options - 27% markup (internal)
    webbing: [
      { value: 'no-webbing', label: 'No Webbing', price: 0 },
      { value: '1in-webbing', label: '1" Webbing', description: 'Additional cost applies' },
      { value: '1in-webbing-d-rings', label: '1" Webbing w/ D-rings', description: 'Additional cost applies' },
      { value: '1in-velcro-all-sides', label: '1" Velcro - All Sides', description: 'Additional cost applies' }
    ],
    
    // 8. Corner Reinforcement - 16% markup (internal)
    corners: [
      { value: 'no-reinforcement', label: 'No Reinforced Corners', price: 0 },
      { value: 'reinforce-top-only', label: 'Reinforce Top Only', description: 'Additional cost applies' },
      { value: 'reinforce-bottom-only', label: 'Reinforce Bottom Only', description: 'Additional cost applies' },
      { value: 'reinforce-all-corners', label: 'Reinforce All Corners', description: 'Additional cost applies' }
    ],
    
    // 9. Rope Options - 35-70% markup (internal)
    rope: [
      { value: 'no-rope', label: 'No Rope', price: 0 },
      { value: '3-16-top-only', label: '3/16" Rope - Top Only', description: 'Additional cost applies' },
      { value: '3-16-bottom-only', label: '3/16" Rope - Bottom Only', description: 'Additional cost applies' },
      { value: '3-16-top-bottom', label: '3/16" Rope - Top & Bottom', description: 'Additional cost applies' },
      { value: '5-16-top-only', label: '5/16" Rope - Top Only', description: 'Additional cost applies' },
      { value: '5-16-bottom-only', label: '5/16" Rope - Bottom Only', description: 'Additional cost applies' },
      { value: '5-16-top-bottom', label: '5/16" Rope - Top & Bottom', description: 'Additional cost applies' }
    ],
    
    // 10. Wind Slits - Keep existing flat rate
    windslits: [
      { value: 'no-windslits', label: 'No Wind Slits', price: 0 },
      { value: 'standard-windslits', label: 'Standard Wind Slits', price: 8.00 }
    ],
    
    // Turnaround Time
    turnaround: [
      { value: 'next-day', label: 'Next Day (4pm PST Cutoff) - Free', price: 0 },
      { value: 'same-day', label: 'Same Day (12pm PST Cutoff) +$15.00', price: 15 }
    ]
  }

  // Banner Options State - Updated to match Supabase structure
  const [bannerOptions, setBannerOptions] = useState({
    sides: 1,
    polePockets: 'none',
    hem: 'no-hem',
    grommets: 'every-2ft-all-sides',
    webbing: 'no-webbing',
    corners: 'no-reinforcement',
    rope: 'no-rope',
    windslits: 'no-windslits',
    turnaround: 'next-day',
    jobName: '',
    quantity: 1,
    material: '13oz-vinyl', // Added material selection
    showAdvancedOptions: false // Added for advanced options expansion
  })
  
  // Shipping Options State
  const [shippingOption, setShippingOption] = useState('standard')
  const [shippingQuotes, setShippingQuotes] = useState([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState(null)
  
  // Collapsible sections state - Progressive user journey
  const [expandedSections, setExpandedSections] = useState({
    printPreview: true,      // Start with print preview
    bannerOptions: false,    // Opens after preview approval
    shipping: false,         // Opens after banner options
    customerInfo: false,     // Opens after shipping selection
    reviewPayment: false     // Opens after customer info completion
  })
  
  const [loading, setLoading] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [checkoutStep, setCheckoutStep] = useState('printPreview') // printPreview, bannerOptions, shipping, customerInfo, reviewPayment, processing, completed, error
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [approvedPDF, setApprovedPDF] = useState(null)
  const [previewApproved, setPreviewApproved] = useState(false)

  // Shipping Options Configuration - REMOVED HARDCODED PRICES
  // All shipping options now come from B2Sign integration
  const shippingOptions = []

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
    const sectionOrder = ['printPreview', 'bannerOptions', 'customerInfo', 'shipping', 'reviewPayment']
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
    const sectionOrder = ['printPreview', 'bannerOptions', 'customerInfo', 'shipping', 'reviewPayment']
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

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true)
        const authenticated = await authService.isAuthenticated()
        setIsAuthenticated(authenticated)
        
        if (!authenticated) {
          console.log('User not authenticated, redirecting to login')
          // Save current location to redirect back after login
          sessionStorage.setItem('redirectAfterLogin', '/checkout')
          navigate('/login')
          return
        }
      } catch (error) {
        console.error('Authentication check failed:', error)
        sessionStorage.setItem('redirectAfterLogin', '/checkout')
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

  // Get shipping quotes when shipping section is expanded
  useEffect(() => {
    if (expandedSections.shipping && orderData && !shippingQuotes.length && !shippingLoading) {
      // If customer has entered shipping info, get shipping costs from B2Sign
      if (customerInfo.zipCode) {
        getShippingCosts()
      } else {
        // Shipping quotes only available after user enters shipping information
        setShippingError(null)
      }
    }
  }, [expandedSections.shipping, orderData])

  // Get shipping costs when customer enters shipping info
  useEffect(() => {
    if (customerInfo.zipCode && expandedSections.shipping && shippingQuotes.length > 0) {
      // Refresh with shipping costs when zip code is entered
      getShippingCosts()
    }
  }, [customerInfo.zipCode])

  // Real-time shipping updates when banner options change
  useEffect(() => {
    if (expandedSections.shipping && customerInfo.zipCode && bannerOptions) {
      // Debounce shipping cost updates to avoid too many API calls
      const timeoutId = setTimeout(() => {
        console.log('🔄 Banner options changed, updating shipping costs...')
        getShippingCosts()
      }, 1000)
      
      return () => clearTimeout(timeoutId)
    }
  }, [bannerOptions.material, bannerOptions.sides, bannerOptions.quantity, bannerOptions.grommets, bannerOptions.hem, bannerOptions.polePockets])

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

  // Get shipping costs from B2Sign (requires customer shipping info)
  const getShippingCosts = async () => {
    if (!orderData || !customerInfo.zipCode) {
      setShippingError('Please enter your shipping information to get shipping costs')
      return
    }

    setShippingLoading(true)
    setShippingError(null)

    try {
      console.log('🚚 Getting shipping costs from B2Sign...')
      
      // Prepare order data for shipping costs
      const shippingOrderData = {
        product_type: orderData.product_type || 'banner',
        material: bannerOptions.material,
        dimensions: orderData.dimensions,
        quantity: bannerOptions.quantity,
        job_name: bannerOptions.jobName || `BuyPrintz Order ${Date.now()}`,
        print_options: {
          sides: bannerOptions.sides,
          grommets: bannerOptions.grommets,
          hem: bannerOptions.hem,
          polePockets: bannerOptions.polePockets,
          webbing: bannerOptions.webbing,
          corners: bannerOptions.corners,
          rope: bannerOptions.rope,
          windslits: bannerOptions.windslits,
          turnaround: bannerOptions.turnaround
        }
      }

      // Get shipping costs from B2Sign
      const shippingCosts = await shippingService.getShippingCosts(shippingOrderData, customerInfo)
      
      if (shippingCosts.success && shippingCosts.shipping_options) {
        setShippingQuotes(shippingCosts.shipping_options)
        console.log('✅ Shipping costs received:', shippingCosts.shipping_options)
      } else {
        setShippingError('No shipping options available at this time')
        console.warn('⚠️ No shipping options received from B2Sign')
      }

    } catch (error) {
      console.error('❌ Error getting shipping costs:', error)
      setShippingError('Unable to get shipping costs at this time. Please try again.')
      
      // NO FALLBACK - System must get real shipping costs from B2Sign
      setShippingQuotes([])
    } finally {
      setShippingLoading(false)
    }
  }

  // Get base shipping quotes (for preview before customer info)
  // Base shipping quotes removed - shipping quotes only available after user enters shipping info

  const handleShowPreview = () => {
    setShowPreviewModal(true)
  }

  const handlePreviewApprove = (pdfBlob) => {
    setApprovedPDF(pdfBlob)
    setPreviewApproved(true)
    setShowPreviewModal(false)
    setCheckoutStep('bannerOptions')
    setExpandedSections(prev => ({
      ...prev,
      bannerOptions: true
    }))
    toast.success('Design approved! Now configure your banner options.')
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
          <p className="text-gray-600 mb-4">You need to be logged in to access the checkout.</p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-buyprint-brand hover:bg-buyprint-600 text-white font-medium rounded-lg transition-colors"
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

  // Material pricing per square foot
  const materialPricing = {
    '13oz-vinyl': 1.60,
    '18oz-blackout': 2.50,
    'mesh': 1.80,
    'indoor': 2.50,
    'pole': 3.00,
    '9oz-fabric': 2.75,
    'blockout-fabric': 7.00,
    'tension-fabric': 5.15,
    'backlit': 7.00
  }

  // Calculate banner options costs - Now handled by backend with dynamic markup
  const grommetCost = bannerOptionsConfig.grommets.find(opt => opt.value === bannerOptions.grommets)?.price || 0
  const windSlitCost = bannerOptionsConfig.windslits.find(opt => opt.value === bannerOptions.windslits)?.price || 0
  const turnaroundCost = bannerOptionsConfig.turnaround.find(opt => opt.value === bannerOptions.turnaround)?.price || 0
  const shippingCost = shippingOptions.find(opt => opt.value === shippingOption)?.price || 0
  
  // Calculate base price from material and dimensions
  const getBasePrice = () => {
    const materialPrice = materialPricing[bannerOptions.material] || 1.60
    const width = orderData?.dimensions?.width || 2
    const height = orderData?.dimensions?.height || 4
    return materialPrice * width * height
  }
  
  const basePrice = getBasePrice()
  
  // Calculate percentage-based options for instant pricing updates
  const sidesCost = bannerOptions.sides === 2 ? basePrice : 0 // 100% markup for double sided
  const polePocketCost = bannerOptions.polePockets !== 'none' ? basePrice * 0.10 : 0 // 10% markup
  const webbingCost = bannerOptions.webbing !== 'no-webbing' ? basePrice * 0.27 : 0 // 27% markup
  const cornersCost = bannerOptions.corners !== 'no-reinforcement' ? basePrice * 0.16 : 0 // 16% markup
  
  // Rope pricing based on size and placement
  const getRopeCost = () => {
    if (bannerOptions.rope === 'no-rope') return 0
    if (bannerOptions.rope.includes('3-16')) {
      return bannerOptions.rope.includes('top-bottom') ? basePrice * 0.50 : basePrice * 0.35
    }
    if (bannerOptions.rope.includes('5-16')) {
      return bannerOptions.rope.includes('top-bottom') ? basePrice * 0.70 : basePrice * 0.50
    }
    return 0
  }
  const ropeCost = getRopeCost()
  
  // Calculate marketplace template costs
  const marketplaceCost = orderData?.marketplace_templates ? 
    orderData.marketplace_templates.reduce((total, template) => total + (template.price || 0), 0) : 0
  
  // Calculate total options cost including all percentage-based options
  const optionsTotal = sidesCost + polePocketCost + grommetCost + webbingCost + cornersCost + ropeCost + windSlitCost + turnaroundCost
  const subtotal = basePrice * bannerOptions.quantity + optionsTotal + marketplaceCost
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                // Save current order data to sessionStorage before going back
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
                  console.log('Saved cancelled order data for restoration')
                }
                // Route back to banner editor with product parameter
                const productParam = orderData?.banner_type ? `?product=${orderData.banner_type}` : ''
                navigate(`/editor${productParam}`)
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors backdrop-blur-sm bg-white/20 rounded-xl px-4 py-2 border border-white/30"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Banner Editor
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
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                <Eye className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Review Your Design</h3>
                <p className="text-blue-700 mb-4">
                  Before proceeding, please review your banner design to ensure it's exactly what you want printed.
                </p>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-6 py-3 bg-buyprint-brand hover:bg-buyprint-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <Eye className="w-5 h-5" />
                  Preview Design
                </button>
              </div>
              
              {previewApproved && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Design Approved!</p>
                      <p className="text-sm text-green-700">Your design has been approved and is ready for production.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => continueToNextSection('printPreview')}
                    className="mt-3 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Continue to Banner Options →
                  </button>
                </div>
              )}
            </div>
          </CollapsibleSection>

          {/* Banner Options - Step 2 */}
          <CollapsibleSection
            title="Banner Options"
            icon={Settings}
            isExpanded={expandedSections.bannerOptions}
            onToggle={() => toggleSection('bannerOptions')}
            defaultExpanded={false}
            data-section="bannerOptions"
          >
            <div className="space-y-6 pb-6">
              {/* Pricing Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Professional Banner Options</p>
                    <p>Advanced options are priced based on your banner specifications to ensure fair, scalable pricing. Final costs will be calculated based on your selected size, material, and options.</p>
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
                      value={bannerOptions.jobName}
                      onChange={(e) => setBannerOptions(prev => ({ ...prev, jobName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter job name (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={bannerOptions.quantity}
                      onChange={(e) => setBannerOptions(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Material Selection */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Banner Material
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { value: '13oz-vinyl', label: '13oz. Vinyl Banner', price: 1.60, description: 'Standard outdoor vinyl' },
                    { value: '18oz-blackout', label: '18oz Blackout Banner', price: 2.50, description: 'Heavy-duty blackout material' },
                    { value: 'mesh', label: 'Mesh Banner', price: 1.80, description: 'Wind-resistant mesh' },
                    { value: 'indoor', label: 'Indoor Banner', price: 2.50, description: 'Premium indoor material' },
                    { value: 'pole', label: 'Pole Banner', price: 3.00, description: 'Durable pole banner material' },
                    { value: '9oz-fabric', label: '9oz Fabric Banner', price: 2.75, description: 'Lightweight fabric' },
                    { value: 'blockout-fabric', label: 'Blockout Fabric Banner', price: 7.00, description: 'Premium blockout fabric' },
                    { value: 'tension-fabric', label: 'Tension Fabric', price: 5.15, description: 'Professional tension fabric' },
                    { value: 'backlit', label: 'Backlit Banner', price: 7.00, description: 'Premium backlit material' }
                  ].map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="material"
                        value={option.value}
                        checked={bannerOptions.material === option.value}
                        onChange={(e) => setBannerOptions(prev => ({ ...prev, material: e.target.value }))}
                        className="mr-3 text-blue-600"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className="text-sm text-gray-600">{option.description}</p>
                        <p className="text-sm text-green-600 font-medium">${option.price}/sqft</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sides */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  Number of Sides
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bannerOptionsConfig.sides.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2">
                      <input type="radio" name="sides" value={option.value} checked={bannerOptions.sides === option.value} onChange={(e) => setBannerOptions(prev => ({ ...prev, sides: parseInt(e.target.value) }))} className="mr-3 text-blue-600 focus:ring-blue-500" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className={`text-sm ${option.price > 0 ? 'text-green-600' : option.description ? 'text-blue-600' : 'text-gray-500'}`}>
                          {option.price > 0 ? `+$${option.price}` : option.description ? `${option.description}` : 'No additional cost'}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Pole Pockets */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  Pole Pockets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bannerOptionsConfig.polePockets.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 active:bg-green-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
                      <input type="radio" name="polePockets" value={option.value} checked={bannerOptions.polePockets === option.value} onChange={(e) => setBannerOptions(prev => ({ ...prev, polePockets: e.target.value }))} className="mr-3 text-green-600 focus:ring-green-500" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className={`text-sm ${option.price > 0 ? 'text-green-600' : option.description ? 'text-blue-600' : 'text-gray-500'}`}>
                          {option.price > 0 ? `+$${option.price}` : option.description ? `${option.description}` : 'No additional cost'}
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
                  {bannerOptionsConfig.hem.map((option) => (
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

              {/* Grommets */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Anchor className="w-4 h-4 text-blue-600" />
                  Grommets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bannerOptionsConfig.grommets.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 active:bg-orange-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2">
                      <input type="radio" name="grommets" value={option.value} checked={bannerOptions.grommets === option.value} onChange={(e) => setBannerOptions(prev => ({ ...prev, grommets: e.target.value }))} className="mr-3 text-orange-600 focus:ring-orange-500" />
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

              {/* Additional Options - Expandable Section */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setBannerOptions(prev => ({ ...prev, showAdvancedOptions: !prev.showAdvancedOptions }))}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="font-semibold text-gray-900">Additional Options</span>
                    <span className="text-sm text-gray-500">(Webbing, Corners, Rope, Wind Slits)</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-600 transition-transform ${bannerOptions.showAdvancedOptions ? 'rotate-180' : ''}`} />
                </button>
                
                {bannerOptions.showAdvancedOptions && (
                  <div className="space-y-6 pl-4 border-l-2 border-gray-200">
                    {/* Webbing */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-800 flex items-center gap-2">
                        <Package className="w-4 h-4 text-green-600" />
                        Webbing & Hanging Options
                      </h5>
                      
                      {/* Webbing Recommendation Note */}
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium">Professional Recommendation</p>
                            <p>Banners over 100 square feet should include webbing for proper hanging and stability. This ensures your banner is securely mounted and won't sag or tear.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {bannerOptionsConfig.webbing.map((option) => (
                          <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="webbing"
                              value={option.value}
                              checked={bannerOptions.webbing === option.value}
                              onChange={(e) => setBannerOptions(prev => ({ ...prev, webbing: e.target.value }))}
                              className="mr-3 text-green-600"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{option.label}</p>
                              <p className={`text-sm ${option.price > 0 ? 'text-green-600' : option.description ? 'text-blue-600' : 'text-gray-500'}`}>
                                {option.price > 0 ? `+$${option.price}` : 
                                 option.description ? `${option.description}` : 
                                 'No additional cost'}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Corner Reinforcement */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-800 flex items-center gap-2">
                        <Package className="w-4 h-4 text-orange-600" />
                        Corner Reinforcement
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {bannerOptionsConfig.corners.map((option) => (
                          <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-orange-300 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="corners"
                              value={option.value}
                              checked={bannerOptions.corners === option.value}
                              onChange={(e) => setBannerOptions(prev => ({ ...prev, corners: e.target.value }))}
                              className="mr-3 text-orange-600"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{option.label}</p>
                              <p className={`text-sm ${option.price > 0 ? 'text-green-600' : option.description ? 'text-blue-600' : 'text-gray-500'}`}>
                                {option.price > 0 ? `+$${option.price}` : 
                                 option.description ? `${option.description}` : 
                                 'No additional cost'}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Rope Options */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-800 flex items-center gap-2">
                        <Package className="w-4 h-4 text-red-600" />
                        Rope Options
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {bannerOptionsConfig.rope.map((option) => (
                          <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-red-300 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="rope"
                              value={option.value}
                              checked={bannerOptions.rope === option.value}
                              onChange={(e) => setBannerOptions(prev => ({ ...prev, rope: e.target.value }))}
                              className="mr-3 text-red-600"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{option.label}</p>
                              <p className={`text-sm ${option.price > 0 ? 'text-green-600' : option.description ? 'text-blue-600' : 'text-gray-500'}`}>
                                {option.price > 0 ? `+$${option.price}` : 
                                 option.description ? `${option.description}` : 
                                 'No additional cost'}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Wind Slits */}
                    <div className="space-y-3">
                      <h5 className="font-medium text-gray-800 flex items-center gap-2">
                        <Wind className="w-4 h-4 text-cyan-600" />
                        Wind Slits
                      </h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {bannerOptionsConfig.windslits.map((option) => (
                          <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-cyan-300 cursor-pointer transition-colors">
                            <input
                              type="radio"
                              name="windslits"
                              value={option.value}
                              checked={bannerOptions.windslits === option.value}
                              onChange={(e) => setBannerOptions(prev => ({ ...prev, windslits: e.target.value }))}
                              className="mr-3 text-cyan-600"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{option.label}</p>
                              <p className={`text-sm ${option.price > 0 ? 'text-green-600' : option.description ? 'text-blue-600' : 'text-gray-500'}`}>
                                {option.price > 0 ? `+$${option.price}` : 
                                 option.description ? `${option.description}` : 
                                 'No additional cost'}
                              </p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Turnaround Time */}
              <div className="space-y-3 mb-6">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-yellow-600" />
                  Turnaround Time
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bannerOptionsConfig.turnaround.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-yellow-300 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="turnaround"
                        value={option.value}
                        checked={bannerOptions.turnaround === option.value}
                        onChange={(e) => setBannerOptions(prev => ({ ...prev, turnaround: e.target.value }))}
                        className="mr-3 text-yellow-600"
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

              {/* Navigation */}
              <div className="flex justify-between pt-6 pb-2 border-t border-gray-200 mt-6">
                <button
                  onClick={() => goToPreviousSection('bannerOptions')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 active:bg-gray-200 active:scale-95 transition-all duration-200 rounded-lg flex items-center gap-2 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  ← Back to Preview
                </button>
                <button
                  onClick={() => continueToNextSection('bannerOptions')}
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

              {/* Job Name Field */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Name (Required for B2Sign)</label>
                <input
                  type="text"
                  value={customerInfo.jobName}
                  onChange={(e) => handleInputChange('jobName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                  placeholder="Enter a name for this order (e.g., 'Company Banner - Q1 2024')"
                />
                <p className="text-sm text-gray-500 mt-1">This helps identify your order in our system and with our printing partner.</p>
              </div>

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => goToPreviousSection('customerInfo')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  ← Back to Banner Options
                </button>
                <button
                  onClick={() => continueToNextSection('customerInfo')}
                  disabled={!customerInfo.name || !customerInfo.email || !customerInfo.jobName}
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
                <p className="text-green-700 font-medium">
                  {customerInfo.zipCode ? 'Choose your preferred shipping method' : 'Enter your shipping address to see shipping options'}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  🚀 Powered by B2Sign - Real-time shipping costs
                </p>
              </div>

              {/* Shipping Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    Shipping Method
                  </h4>
                  {customerInfo.zipCode && (
                    <button
                      onClick={getShippingCosts}
                      disabled={shippingLoading}
                      className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {shippingLoading ? 'Getting Shipping Costs...' : 'Refresh Shipping Costs'}
                    </button>
                  )}
                </div>

                {shippingError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-700">{shippingError}</p>
                    </div>
                  </div>
                )}

                {shippingLoading && (
                  <div className="flex items-center justify-center p-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    <span className="ml-3 text-gray-600">🚀 Getting real-time shipping costs from B2Sign...</span>
                  </div>
                )}

                {!customerInfo.zipCode && !shippingLoading && (
                  <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
                    <Truck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 mb-2">Shipping options will appear here</p>
                    <p className="text-sm text-gray-500">Please enter your shipping address above to see available shipping methods and costs</p>
                  </div>
                )}

                {!shippingLoading && shippingQuotes.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {shippingQuotes.map((option, index) => {
                      const Icon = option.type === 'standard' ? Truck : 
                                  option.type === 'expedited' ? Zap : Package
                      const optionValue = option.type || `option_${index}`
                      const optionLabel = option.name || option.description || `${option.type} shipping`
                      const optionCost = option.cost || 'Free'
                      
                      return (
                        <label key={optionValue} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 active:bg-green-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
                          <input
                            type="radio"
                            name="shipping"
                            value={optionValue}
                            checked={shippingOption === optionValue}
                            onChange={(e) => setShippingOption(e.target.value)}
                            className="mr-3 text-green-600 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Icon className="w-4 h-4 text-green-600" />
                              <p className="font-medium text-gray-900">{optionLabel}</p>
                            </div>
                            <p className={`text-sm font-semibold ${optionCost !== 'Free' ? 'text-green-600' : 'text-gray-500'}`}>
                              {optionCost}
                            </p>
                            {option.estimated_days && (
                              <p className="text-xs text-gray-500">
                                Est. {option.estimated_days} day{option.estimated_days !== 1 ? 's' : ''}
                              </p>
                            )}
                            {option.delivery_date && (
                              <p className="text-xs text-blue-600 font-medium">
                                📅 Delivers by {option.delivery_date}
                              </p>
                            )}
                          </div>
                        </label>
                      )
                    })}
                  </div>
                )}

                {!shippingLoading && !shippingQuotes.length && !shippingError && (
                  <div className="text-center p-6 text-gray-500">
                    <Truck className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Click "Refresh Quotes" to get real-time shipping options from B2Sign</p>
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
                  disabled={!customerInfo.name || !customerInfo.email || !customerInfo.jobName}
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
                  Order Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Banner Design:</span>
                    <span className="font-medium">${basePrice * bannerOptions.quantity}</span>
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
                    <span className="text-gray-600">Sides ({bannerOptions.sides === 2 ? 'Double' : 'Single'}):</span>
                    <span className="font-medium">
                      {sidesCost > 0 ? <span className="text-green-600">+${sidesCost.toFixed(2)}</span> : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pole Pockets:</span>
                    <span className="font-medium">
                      {polePocketCost > 0 ? <span className="text-green-600">+${polePocketCost.toFixed(2)}</span> : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hem Style:</span>
                    <span className="font-medium">
                      {/* Hem is free, no additional cost */}
                      <span className="text-gray-500">No additional cost</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grommets:</span>
                    <span className="font-medium">
                      {grommetCost > 0 ? <span className="text-green-600">+${grommetCost.toFixed(2)}</span> : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Webbing:</span>
                    <span className="font-medium">
                      {webbingCost > 0 ? <span className="text-green-600">+${webbingCost.toFixed(2)}</span> : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Corner Reinforcement:</span>
                    <span className="font-medium">
                      {cornersCost > 0 ? <span className="text-green-600">+${cornersCost.toFixed(2)}</span> : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rope:</span>
                    <span className="font-medium">
                      {ropeCost > 0 ? <span className="text-green-600">+${ropeCost.toFixed(2)}</span> : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wind Slits:</span>
                    <span className="font-medium">
                      {windSlitCost > 0 ? <span className="text-green-600">+${windSlitCost.toFixed(2)}</span> : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Turnaround:</span>
                    <span className="font-medium">
                      {turnaroundCost > 0 ? <span className="text-green-600">+${turnaroundCost.toFixed(2)}</span> : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      {shippingQuotes.find(q => q.type === shippingOption)?.cost || 'Calculating...'}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        ${totalAmount}
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
                      Complete Order
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
                      {orderData?.dimensions?.width || 2}ft × {orderData?.dimensions?.height || 4}ft Banner
                    </span>
                    <span className="font-medium">
                      ${(basePrice * bannerOptions.quantity).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium">
                      {bannerOptions.material ? 
                        Object.entries(materialPricing).find(([key]) => key === bannerOptions.material)?.[0]?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                        'Select material'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sides:</span>
                    <span className="font-medium">
                      {bannerOptions.sides === 2 ? 'Double Sided' : 'Single Sided'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="font-medium">
                      {bannerOptions.quantity}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Options:</span>
                    <span className="font-medium">
                      +${optionsTotal.toFixed(2)}
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
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      {shippingQuotes.find(q => q.type === shippingOption)?.cost || 'Calculating...'}
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

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPreviewModal}
        onClose={handlePreviewCancel}
        onApprove={handlePreviewApprove}
        canvasData={orderData?.canvas_data}
        orderDetails={orderData}
        dimensions={orderData?.dimensions}
        productType={orderData?.product_type || 'banner'}
        surfaceElements={orderData?.surface_elements || {}}
        currentSurface={orderData?.current_surface || 'front'}
      />
    </div>
  )
}

export default Checkout
