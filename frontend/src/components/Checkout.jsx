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

// Collapsible Section Component - Defined outside to prevent recreation
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
      isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
    }`}>
      <div className="p-6">
        {children}
      </div>
    </div>
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
    zipCode: ''
  })
  
  // Banner Options Configuration - Updated to match Supabase table
  const bannerOptionsConfig = {
    // 1. Width x Height (from editor - already handled)
    // 2. # of sides
    sides: [
      { value: 1, label: 'Single Sided', price: 0 },
      { value: 2, label: 'Double Sided', price: 25 }
    ],
    
    // 3. Material (from editor - already handled)
    // 4. Pole Pockets
    polePockets: [
      { value: 'none', label: 'No Pole Pockets', price: 0 },
      { value: '2in-top', label: '2" Pocket - Top Only (fits 1" pole)', price: 8 },
      { value: '3in-top', label: '3" Pocket - Top Only (fits 1.5" pole)', price: 10 },
      { value: '4in-top', label: '4" Pocket - Top Only (fits 2" pole)', price: 12 },
      { value: '2in-top-bottom', label: '2" Pockets - Top & Bottom', price: 15 },
      { value: '3in-top-bottom', label: '3" Pockets - Top & Bottom', price: 18 },
      { value: '4in-top-bottom', label: '4" Pockets - Top & Bottom', price: 22 }
    ],
    
    // 5. Hem Options
    hem: [
      { value: 'no-hem', label: 'No Hem', price: 0 },
      { value: 'all-sides', label: 'All Sides Hem', price: 12 }
    ],
    
    // 6. Grommet Options
    grommets: [
      { value: 'every-2ft-all-sides', label: 'Every 2\' - All Sides', price: 15 },
      { value: 'every-2ft-top-bottom', label: 'Every 2\' - Top & Bottom', price: 12 },
      { value: 'every-2ft-left-right', label: 'Every 2\' - Left & Right', price: 10 },
      { value: '4-corners-only', label: '4 Corners Only', price: 8 },
      { value: 'no-grommets', label: 'No Grommets', price: 0 }
    ],
    
    // 7. Webbing Options
    webbing: [
      { value: 'no-webbing', label: 'No Webbing', price: 0 },
      { value: '1in-webbing', label: '1" Webbing', price: 18 },
      { value: '1in-webbing-d-rings', label: '1" Webbing w/ D-rings', price: 25 },
      { value: '1in-velcro-all-sides', label: '1" Velcro - All Sides', price: 22 }
    ],
    
    // 8. Corner Reinforcement
    corners: [
      { value: 'no-reinforcement', label: 'No Reinforced Corners', price: 0 },
      { value: 'reinforce-top-only', label: 'Reinforce Top Only', price: 8 },
      { value: 'reinforce-bottom-only', label: 'Reinforce Bottom Only', price: 8 },
      { value: 'reinforce-all-corners', label: 'Reinforce All Corners', price: 15 }
    ],
    
    // 9. Rope Options
    rope: [
      { value: 'no-rope', label: 'No Rope', price: 0 },
      { value: '3-16-top-only', label: '3/16" Rope - Top Only', price: 12 },
      { value: '3-16-bottom-only', label: '3/16" Rope - Bottom Only', price: 12 },
      { value: '3-16-top-bottom', label: '3/16" Rope - Top & Bottom', price: 20 },
      { value: '5-16-top-only', label: '5/16" Rope - Top Only', price: 15 },
      { value: '5-16-bottom-only', label: '5/16" Rope - Bottom Only', price: 15 },
      { value: '5-16-top-bottom', label: '5/16" Rope - Top & Bottom', price: 25 }
    ],
    
    // 10. Wind Slits
    windslits: [
      { value: 'no-windslits', label: 'No Wind Slits', price: 0 },
      { value: 'standard-windslits', label: 'Standard Wind Slits', price: 8 }
    ],
    
    // Turnaround Time
    turnaround: [
      { value: 'next-day', label: 'Next Day (4pm PST Cutoff) - Free', price: 0 },
      { value: 'same-day', label: 'Same Day (12pm PST Cutoff) +$8.00', price: 8 }
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
    const sectionOrder = ['printPreview', 'bannerOptions', 'shipping', 'customerInfo', 'reviewPayment']
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
    const sectionOrder = ['printPreview', 'bannerOptions', 'shipping', 'customerInfo', 'reviewPayment']
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

  // Calculate banner options costs
  const sidesCost = bannerOptionsConfig.sides.find(opt => opt.value === bannerOptions.sides)?.price || 0
  const grommetCost = bannerOptionsConfig.grommets.find(opt => opt.value === bannerOptions.grommets)?.price || 0
  const hemCost = bannerOptionsConfig.hem.find(opt => opt.value === bannerOptions.hem)?.price || 0
  const polePocketCost = bannerOptionsConfig.polePockets.find(opt => opt.value === bannerOptions.polePockets)?.price || 0
  const webbingCost = bannerOptionsConfig.webbing.find(opt => opt.value === bannerOptions.webbing)?.price || 0
  const cornersCost = bannerOptionsConfig.corners.find(opt => opt.value === bannerOptions.corners)?.price || 0
  const ropeCost = bannerOptionsConfig.rope.find(opt => opt.value === bannerOptions.rope)?.price || 0
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
  const optionsTotal = sidesCost + grommetCost + hemCost + polePocketCost + webbingCost + cornersCost + ropeCost + windSlitCost + turnaroundCost
  const subtotal = basePrice * bannerOptions.quantity + optionsTotal
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
              {getStepIcon('printPreview', checkoutStep)}
              <span className={getStepStatus('printPreview', checkoutStep)}>Print Preview</span>
            </div>
            <div className="flex-1 h-0.5 bg-gray-200 mx-2">
              <div className={`h-full transition-all duration-500 ${
                ['bannerOptions', 'shipping', 'customerInfo', 'reviewPayment', 'processing', 'completed', 'error'].includes(checkoutStep) 
                  ? 'bg-blue-500 w-full' 
                  : 'bg-gray-200 w-0'
              }`} />
            </div>
            <div className="flex items-center gap-2">
              {getStepIcon('bannerOptions', checkoutStep)}
              <span className={getStepStatus('bannerOptions', checkoutStep)}>Banner Options</span>
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

        {/* Order Summary Card */}
        <div className="mb-6 backdrop-blur-xl bg-white/20 rounded-2xl p-4 lg:p-6 border border-white/30 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Order Summary</h3>
                <p className="text-sm text-gray-600">
                  {orderData?.dimensions?.width || 2}ft × {orderData?.dimensions?.height || 4}ft Banner
                  {bannerOptions.quantity > 1 && ` × ${bannerOptions.quantity}`}
                  {bannerOptions.sides === 2 && ' (Double Sided)'}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {bannerOptions.material ? 
                    Object.entries(materialPricing).find(([key]) => key === bannerOptions.material)?.[1] ? 
                    `${Object.entries(materialPricing).find(([key]) => key === bannerOptions.material)?.[1]}/sqft` : 
                    'Material pricing' : 
                    'Select material'
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">
                ${totalAmount}
              </p>
              <p className="text-sm text-gray-600">Total (including all options & shipping)</p>
              <div className="text-xs text-gray-500 mt-1">
                <p>Base: ${basePrice * bannerOptions.quantity}</p>
                <p>Options: +${optionsTotal}</p>
                <p>Shipping: +${shippingCost}</p>
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
                <h3 className="text-lg font-semibold text-blue-900 mb-2">Review Your Design</h3>
                <p className="text-blue-700 mb-4">
                  Before proceeding, please review your banner design to ensure it's exactly what you want printed.
                </p>
                <button
                  onClick={() => setShowPreviewModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
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
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-purple-300 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="sides"
                        value={option.value}
                        checked={bannerOptions.sides === option.value}
                        onChange={(e) => setBannerOptions(prev => ({ ...prev, sides: parseInt(e.target.value) }))}
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

              {/* Pole Pockets */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-indigo-600" />
                  Pole Pockets
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {bannerOptionsConfig.polePockets.map((option) => (
                    <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-indigo-300 cursor-pointer transition-colors">
                      <input
                        type="radio"
                        name="polePockets"
                        value={option.value}
                        checked={bannerOptions.polePockets === option.value}
                        onChange={(e) => setBannerOptions(prev => ({ ...prev, polePockets: e.target.value }))}
                        className="mr-3 text-indigo-600"
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
                              <p className={`text-sm ${option.price > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                {option.price > 0 ? `+$${option.price}` : 'No additional cost'}
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
                              <p className={`text-sm ${option.price > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                {option.price > 0 ? `+$${option.price}` : 'No additional cost'}
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
                              <p className={`text-sm ${option.price > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                {option.price > 0 ? `+$${option.price}` : 'No additional cost'}
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
                              <p className={`text-sm ${option.price > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                {option.price > 0 ? `+$${option.price}` : 'No additional cost'}
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
              <div className="space-y-3">
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
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => goToPreviousSection('bannerOptions')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  ← Back to Preview
                </button>
                <button
                  onClick={() => continueToNextSection('bannerOptions')}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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

              {/* Navigation */}
              <div className="flex justify-between pt-4 border-t border-gray-200">
                <button
                  onClick={() => goToPreviousSection('shipping')}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
                >
                  ← Back to Banner Options
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
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
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <input
                    type="text"
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
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
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={customerInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="State"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                  <input
                    type="text"
                    value={customerInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                  Order Summary
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Banner Design:</span>
                    <span className="font-medium">${basePrice * bannerOptions.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sides ({bannerOptions.sides === 2 ? 'Double' : 'Single'}):</span>
                    <span className="font-medium">
                      {sidesCost > 0 ? `+$${sidesCost}` : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pole Pockets:</span>
                    <span className="font-medium">
                      {polePocketCost > 0 ? `+$${polePocketCost}` : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hem Style:</span>
                    <span className="font-medium">
                      {hemCost > 0 ? `+$${hemCost}` : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Grommets:</span>
                    <span className="font-medium">
                      {grommetCost > 0 ? `+$${grommetCost}` : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Webbing:</span>
                    <span className="font-medium">
                      {webbingCost > 0 ? `+$${webbingCost}` : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Corner Reinforcement:</span>
                    <span className="font-medium">
                      {cornersCost > 0 ? `+$${cornersCost}` : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rope:</span>
                    <span className="font-medium">
                      {ropeCost > 0 ? `+$${ropeCost}` : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wind Slits:</span>
                    <span className="font-medium">
                      {windSlitCost > 0 ? `+$${windSlitCost}` : 'No additional cost'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Turnaround:</span>
                    <span className="font-medium">
                      {turnaroundCost > 0 ? `+$${turnaroundCost}` : 'No additional cost'}
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
                  className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  ← Back to Customer Info
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
