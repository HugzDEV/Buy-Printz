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
  Triangle
} from 'lucide-react'
import authService from '../services/auth'
import shippingService from '../services/shippingService'
import InlinePrintPreview from './InlinePrintPreview'
import { GlassCard } from './ui'

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

const TentCheckout = () => {
  const navigate = useNavigate()
  const stripe = useStripe()
  const elements = useElements()
  
  // State management
  const [orderData, setOrderData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewApproved, setPreviewApproved] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    tentDetails: true,
    accessories: false,
    customerInfo: false,
    shipping: false,
    payment: false
  })
  
  // Shipping state
  const [shippingQuotes, setShippingQuotes] = useState([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState(null)
  const [selectedShippingOption, setSelectedShippingOption] = useState('standard')

  // Tent specifications - should come from order data, not be selectable
  const [tentSpecs, setTentSpecs] = useState({
    tentSize: '10x10',
    surfaces: {
      canopy: true,
      sidewalls: false,
      backwall: false
    },
    withFrame: true,
    reinforcedStripColor: 'white'
  })

  // Accessories - carrying bag upgrade always available, others à la carte for canopy-only
  const [selectedAccessories, setSelectedAccessories] = useState([])
  const accessories = [
    // Carrying bag with wheels upgrade - available for all variants
    { id: 'carrying-bag-wheels', name: 'Carrying Bag w/ Wheels', price: 74.99, description: 'Premium wheeled bag for easy transport (upgrade from standard bag)' },
    
    // À la carte accessories - only for graphic-only (no frame) orders
    ...(!tentSpecs?.withFrame ? [
      { id: 'sandbags', name: 'Sandbags', price: 60.00, description: 'Heavy-duty sandbags for tent stability (sand not included)' },
      { id: 'carrying-bag', name: 'Standard Carrying Bag', price: 49.99, description: 'Basic carrying bag for transport' },
      { id: 'ropes-stakes', name: 'Ropes & Stakes', price: 19.99, description: 'Professional tent ropes and stakes' }
    ] : [])
  ]

  // Customer information
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  })

  // Shipping information (legacy - keeping for compatibility)
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  })

  // Load order data from session storage
  useEffect(() => {
    const savedOrderData = sessionStorage.getItem('orderData')
    if (savedOrderData) {
      try {
        const parsed = JSON.parse(savedOrderData)
        // Use the design option from the order data (set in BannerEditor)
        console.log('🎨 TentCheckout - Using design option from order data:', parsed.design_option || parsed.tent_design_option)
        setOrderData(parsed)
        
        // Get design option for fallback compatibility
        const designOption = parsed.tent_design_option || parsed.design_option
        
        // Load tent specs from order data - prioritize tent_specs from editor
        let finalTentSpecs
        if (parsed.tent_specs && parsed.tent_specs.surfaces) {
          // Use new surface-based tent specs directly from editor (preferred method)
          finalTentSpecs = {
            tentSize: parsed.tent_specs.tentSize || '10x10',
            surfaces: parsed.tent_specs.surfaces || {
              canopy: true,
              sidewalls: false,
              backwall: false
            },
            withFrame: parsed.tent_specs.withFrame !== undefined ? parsed.tent_specs.withFrame : true,
            reinforcedStripColor: parsed.tent_specs.reinforcedStripColor || 'white'
          }
          setTentSpecs(finalTentSpecs)
        } else {
          // Fallback: Build tent specs from old design option mapping
          const surfaces = {
            canopy: true, // Always true
            sidewalls: designOption === 'all-sides',
            backwall: designOption === 'canopy-backwall' || designOption === 'all-sides'
          }
          
          // Determine withFrame from old data - assume frame is included unless explicitly canopy-only
          const withFrame = designOption !== 'canopy-only'
          
          finalTentSpecs = {
            tentSize: parsed.tent_size || '10x10',
            surfaces: surfaces,
            withFrame: withFrame,
            reinforcedStripColor: parsed.reinforced_strip_color || 'white'
          }
          setTentSpecs(finalTentSpecs)
        }
        
        console.log('🏕️ Loaded tent order data:', parsed)
        console.log('🏕️ Raw tent_specs from editor:', parsed.tent_specs)
        console.log('🏕️ Mapped tent specs from design option:', { designOption })
        console.log('🏕️ Final tent specs being set:', finalTentSpecs)
      } catch (error) {
        console.error('Error parsing tent order data:', error)
      }
    } else {
      // Set default order data for preview modal
      const defaultOrderData = {
        product_type: 'tradeshow_tent',
        tent_specs: tentSpecs, // Use the current tent specs
        design_option: 'canopy-only', // Default for empty state
        quantity: 1,
        canvas_data: null,
        dimensions: null,
        surface_elements: {},
        current_surface: 'canopy_front'
      }
      setOrderData(defaultOrderData)
      console.log('Set default tent order data:', defaultOrderData)
    }
  }, [])

  // Get shipping quotes when shipping section is expanded and customer info is available
  useEffect(() => {
    if (expandedSections.shipping && orderData && !shippingQuotes.length && !shippingLoading) {
      // Only get shipping quotes if customer has entered shipping info
      if (customerInfo.zipCode) {
        getTentShippingQuotes()
      }
    }
  }, [expandedSections.shipping, orderData, customerInfo.zipCode])

  // Calculate tent pricing based on correct pricing structure
  const calculateTentPrice = () => {
    // Base tent pricing
    let basePrice = 0
    
    // Handle case where tentSpecs is not yet loaded
    if (!tentSpecs) {
      console.log('💰 tentSpecs not loaded yet, returning default price')
      return 599.00 // Default price
    }
    
    console.log('💰 Calculating tent price with specs:', tentSpecs)
    console.log('💰 Order data tent_pricing:', orderData?.tent_pricing)
    
    // Get pricing from order data if available
    if (orderData?.tent_pricing) {
      basePrice = orderData.tent_pricing.base_price || 0
      console.log('💰 Using order data pricing:', basePrice)
    } else {
      // New surface-based pricing structure
      console.log('💰 Using surface-based pricing - withFrame:', tentSpecs.withFrame, 'surfaces:', tentSpecs.surfaces)
      
      if (!tentSpecs.withFrame) {
        // Graphic only (no frame) pricing - à la carte surface pricing
        basePrice = 325.00 // Base canopy graphic
        console.log('💰 Base canopy graphic (no frame):', basePrice)
        
        // Add costs for additional surfaces
        if (tentSpecs.surfaces?.backwall) {
          basePrice += 175.00 // Backwall graphic
          console.log('💰 + Backwall graphic:', 175.00)
        }
        if (tentSpecs.surfaces?.sidewalls) {
          basePrice += 230.00 // Sidewalls graphic (both left + right)
          console.log('💰 + Sidewalls graphic:', 230.00)
        }
      } else {
        // Complete tent with frame pricing - includes accessories
        basePrice = 599.00 // Base complete tent (canopy + frame + accessories)
        console.log('💰 Base complete tent (with frame):', basePrice)
        
        // Add costs for additional surfaces
        if (tentSpecs.surfaces?.backwall && !tentSpecs.surfaces?.sidewalls) {
          basePrice += 201.00 // Just backwall (800 - 599)
          console.log('💰 + Backwall:', 201.00)
        } else if (tentSpecs.surfaces?.sidewalls && tentSpecs.surfaces?.backwall) {
          basePrice += 301.00 // Full walls - sidewalls + backwall (900 - 599)
          console.log('💰 + Full walls (sidewalls + backwall):', 301.00)
        } else if (tentSpecs.surfaces?.sidewalls && !tentSpecs.surfaces?.backwall) {
          basePrice += 151.00 // Just sidewalls (750 - 599)
          console.log('💰 + Sidewalls only:', 151.00)
        }
      }
      
      console.log('💰 Final base price:', basePrice)
    }
    
    // Add accessories
    const accessoriesTotal = selectedAccessories.reduce((total, accessoryId) => {
      const accessory = accessories.find(a => a.id === accessoryId)
      return total + (accessory ? accessory.price : 0)
    }, 0)
    
    return basePrice + accessoriesTotal
  }

  const totalPrice = calculateTentPrice()
  
  // Calculate marketplace template costs
  const marketplaceCost = orderData?.marketplace_templates ? 
    orderData.marketplace_templates.reduce((total, template) => total + (template.price || 0), 0) : 0
  
  // Calculate shipping cost and tax from selected shipping option
  const selectedShippingQuote = shippingQuotes.find(quote => {
    return quote.name === selectedShippingOption || quote.type === selectedShippingOption
  })
  const shippingCost = selectedShippingQuote ? parseFloat(selectedShippingQuote.cost?.replace('$', '') || '0') : 0
  const taxAmount = selectedShippingQuote ? parseFloat(selectedShippingQuote.tax?.replace('$', '') || '0') : 0
  
  // Add a state variable to force re-render when shipping option changes
  const [shippingUpdateTrigger, setShippingUpdateTrigger] = useState(0)
  
  useEffect(() => {
    if (selectedShippingOption) {
      setShippingUpdateTrigger(prev => prev + 1)
      console.log('🚚 Tent shipping option changed, updating total. Selected:', selectedShippingOption)
      console.log('🚚 Selected quote:', selectedShippingQuote)
      console.log('🚚 Shipping cost:', shippingCost)
    }
  }, [selectedShippingOption, selectedShippingQuote, shippingCost])
  
  const finalTotalPrice = totalPrice + marketplaceCost + shippingCost + taxAmount
  
  // Force recalculation when shipping changes
  console.log('🔄 Tent total calculation:', { 
    totalPrice, 
    marketplaceCost, 
    shippingCost, 
    taxAmount,
    finalTotalPrice, 
    shippingUpdateTrigger,
    selectedShippingOption 
  })

  // Handle accessory selection
  const handleAccessoryToggle = (accessoryId) => {
    setSelectedAccessories(prev => 
      prev.includes(accessoryId) 
        ? prev.filter(id => id !== accessoryId)
        : [...prev, accessoryId]
    )
  }

  // Handle section toggle
  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Handle input changes
  const handleInputChange = (field, value) => {
    setShippingInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle customer info changes
  const handleCustomerInfoChange = (field, value) => {
    setCustomerInfo(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Get real-time shipping quotes from our print partners for tents
  const getTentShippingQuotes = async () => {
    if (!orderData) return

    setShippingLoading(true)
    setShippingError(null)

    try {
      console.log('🚚 Getting real-time shipping quotes for tent from our print partners...')
      
      // Prepare tent order data for shipping quote
      const shippingOrderData = {
        product_type: 'tent',
        dimensions: { width: 10, height: 10 }, // Tent dimensions
        quantity: 1,
        zip_code: customerInfo.zipCode || '10001',
        job_name: `Tent Order ${Date.now()}`,
        print_options: {
          tent_size: tentSpecs.tentSize,
          tent_design_option: orderData.tent_design_option || 'canopy-only'
        },
        accessories: selectedAccessories,
        customer_info: customerInfo
      }

      // Get shipping quote from our print partners
      const quote = await shippingService.getShippingCosts(shippingOrderData, customerInfo)
      
      if (quote.success && quote.shipping_options) {
        setShippingQuotes(quote.shipping_options)
        console.log('✅ Real-time tent shipping quotes received:', quote.shipping_options)
      } else {
        setShippingError('No shipping options available at this time')
        console.warn('⚠️ No shipping options received from our print partners for tent')
      }

    } catch (error) {
      console.error('❌ Error getting tent shipping quotes:', error)
      setShippingError('Unable to get shipping costs at this time. Please try again.')
      
      // NO FALLBACK - System must get real shipping costs from our print partners
      setShippingQuotes([])
    } finally {
      setShippingLoading(false)
    }
  }


  // Create order
  const createOrder = async () => {
    if (!stripe || !elements) return

    setIsLoading(true)
    try {
      // First create the order
      const tentOrderData = {
        ...orderData, // This contains canvas_data, dimensions, etc. from BannerEditor
        product_type: 'tradeshow_tent',
        quantity: 1,
        tent_size: tentSpecs.tentSize, // Required for database trigger validation
        tent_type: tentSpecs.tentType || 'event-tent',
        tent_material: tentSpecs.material || '6oz-tent-fabric',
        tent_frame_type: tentSpecs.frameType || '40mm-aluminum-hex',
        tent_print_method: tentSpecs.printMethod || 'dye-sublimation',
        tent_specs: tentSpecs,
        selected_accessories: selectedAccessories,
        customer_info: customerInfo,
        shipping_option: {
          service_code: selectedShippingOption,
          cost: shippingCost
        },
        total_amount: finalTotalPrice,
        subtotal: totalPrice + marketplaceCost,
        tax_amount: taxAmount,
        shipping_cost: shippingCost,
        amount_cents: Math.round(finalTotalPrice * 100)
      }

      console.log('📤 Creating tent order with data:', tentOrderData)

      // Create order
      const orderResponse = await authService.authenticatedRequest('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(tentOrderData)
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

      const paymentIntentData = await paymentIntentResponse.json()
      console.log('Payment intent created:', paymentIntentData)

      // Get card element
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) {
        throw new Error('Payment form not found')
      }

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(paymentIntentData.client_secret, {
        payment_method: {
          card: cardElement,
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
        }
      })

      if (error) {
        toast.error(error.message)
      } else if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful! Your tent order has been placed.')
        navigate('/order-confirmation', { 
          state: { 
            orderId: paymentIntent.id,
            productType: 'tradeshow_tent'
          } 
        })
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Payment failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Validate form
  const isFormValid = () => {
    return customerInfo.name && 
           customerInfo.email && 
           customerInfo.phone && 
           customerInfo.address && 
           customerInfo.city && 
           customerInfo.state && 
           customerInfo.zipCode
  }

  // Modal handlers
  const handlePreviewCancel = () => {
    setShowPreviewModal(false)
  }

  const handlePreviewApprove = (pdfBlob) => {
    setPreviewApproved(true)
    setShowPreviewModal(false)
    toast.success('Tent design approved! Proceeding with order.')
  }

  // Handle preview design - run quality control check before opening modal
  const handlePreviewDesign = async () => {
    console.log('🛡️ QUALITY CONTROL: Starting preview design process')
    
    if (!orderData) {
      console.error('🛡️ QUALITY CONTROL: No order data available for preview')
      return
    }
    
    // Check if we already have surface images (quality control already ran)
    if (orderData.surface_images && Object.keys(orderData.surface_images).length > 0) {
      console.log('🛡️ QUALITY CONTROL: Surface images already available, opening modal')
      setShowPreviewModal(true)
      return
    }
    
    // Need to trigger quality control capture in the editor
    console.warn('🛡️ QUALITY CONTROL: No surface images available!')
    console.warn('🛡️ This suggests the editor needs to run captureAllSurfaceImages()')
    console.warn('🛡️ Opening modal anyway - will show current surface only')
    
    // Open modal anyway - the modal will handle missing surface images
    setShowPreviewModal(true)
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
                    tent_specs: orderData.tent_specs,
                    tin_surface_coverage: orderData.tin_surface_coverage
                  }
                  sessionStorage.setItem('cancelledOrder', JSON.stringify(restorationData))
                  console.log('Saved cancelled tent order data for restoration')
                }
                navigate('/editor?product=tent')
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors backdrop-blur-sm bg-white/20 rounded-xl px-4 py-2 border border-white/30"
            >
              <ChevronLeft className="w-5 h-5" />
              Back to Tent Editor
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
            {/* Print Preview */}
            <CollapsibleSection
              title="Print Preview"
              icon={Eye}
              isExpanded={expandedSections.tentDetails}
              onToggle={() => toggleSection('tentDetails')}
            >
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="mb-3 text-center">
                    <Eye className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <h3 className="text-lg font-semibold text-blue-900">Review Your Tent Design</h3>
                    <p className="text-blue-700">Confirm your design before proceeding.</p>
                  </div>
                  <InlinePrintPreview
                    orderDetails={orderData}
                    canvasData={orderData?.canvas_data}
                    productType={orderData?.product_type === 'tradeshow_tent' ? 'tent' : orderData?.product_type || 'tent'}
                    dimensions={orderData?.dimensions}
                    surfaceElements={orderData?.surface_elements || {}}
                    currentSurface={orderData?.current_surface || 'canopy_front'}
                    onApprove={() => {
                      setPreviewApproved(true)
                      // Keep tent specific flow simple: just mark approved
                    }}
                  />
                </div>
                
                {previewApproved && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-900">Design Approved!</p>
                        <p className="text-sm text-green-700">Your tent design has been approved and is ready for production.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* Tent Details - Display Only (from editor specs) */}
            <CollapsibleSection
              title="Tent Specifications"
              icon={Layers}
              isExpanded={expandedSections.accessories}
              onToggle={() => toggleSection('accessories')}
            >
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Layers className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-blue-700">Tent configuration was set in the editor based on your design choices</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tent Package
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                      {tentSpecs?.withFrame ? 'Complete Tent (Frame + Canopy)' : 'Canopy Graphic Only (You Have Frame)'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tent Size
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                      {tentSpecs?.tentSize || '10x10'} Event Tent
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                      6oz Tent Fabric (600x600 denier)
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frame Type
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                      40mm Aluminum Hex Hardware
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Print Method
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                      Dye-Sublimation Graphic
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reinforced Strip Color
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                      {(tentSpecs?.reinforcedStripColor || 'white').charAt(0).toUpperCase() + (tentSpecs?.reinforcedStripColor || 'white').slice(1)}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wall Options
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                      Canopy{tentSpecs?.surfaces?.backwall ? ' + Backwall' : ''}{tentSpecs?.surfaces?.sidewalls ? ' + Sidewalls' : ''}
                      {!tentSpecs?.surfaces?.backwall && !tentSpecs?.surfaces?.sidewalls ? ' Only' : ''}
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">
                        {!tentSpecs?.withFrame ? 'Canopy Features' : 'Complete Tent Features'}
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• 360 degrees of branding coverage</li>
                        <li>• Weather resistant waterproof fabric</li>
                        <li>• Dye-sublimation printing for vibrant colors</li>
                        {tentSpecs?.withFrame && (
                          <>
                            <li>• Heavy duty aluminum hex frame</li>
                            <li>• Telescopic legs with height adjustment</li>
                            <li>• Standard carrying bag included (FREE)</li>
                            <li>• Ropes & stakes included (FREE)</li>
                            <li>• Sandbags included (FREE)</li>
                            {tentSpecs?.surfaces?.backwall && <li>• Backwall included</li>}
                            {tentSpecs?.surfaces?.sidewalls && <li>• Sidewalls included</li>}
                          </>
                        )}
                        {!tentSpecs?.withFrame && (
                          <>
                            <li>• Designed for your existing tent frame</li>
                            <li>• Accessories available à la carte below</li>
                            <li>• Sandbags, bag & ropes sold separately</li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Accessories */}
            <CollapsibleSection
              title={!tentSpecs?.withFrame ? 'Required Accessories & Upgrades' : 'Available Upgrades'}
              icon={Package}
              isExpanded={expandedSections.accessories}
              onToggle={() => toggleSection('accessories')}
            >
              <div className="space-y-3">
                {accessories.map((accessory) => (
                  <div key={accessory.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={accessory.id}
                        checked={selectedAccessories.includes(accessory.id)}
                        onChange={() => handleAccessoryToggle(accessory.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <label htmlFor={accessory.id} className="font-medium text-gray-900 cursor-pointer">
                          {accessory.name}
                        </label>
                        <p className="text-sm text-gray-600">{accessory.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-gray-900">${accessory.price.toFixed(2)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Customer Information */}
            <CollapsibleSection
              title="Customer Information"
              icon={User}
              isExpanded={expandedSections.customerInfo}
              onToggle={() => toggleSection('customerInfo')}
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
                      onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
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
                      onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <input
                      type="text"
                      value={customerInfo.address}
                      onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
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
                      onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                    <input
                      type="text"
                      value={customerInfo.state}
                      onChange={(e) => handleCustomerInfoChange('state', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                      placeholder="State"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={customerInfo.zipCode}
                      onChange={(e) => handleCustomerInfoChange('zipCode', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 hover:border-gray-400 active:border-blue-500 focus:outline-none focus:shadow-lg"
                      placeholder="ZIP Code"
                    />
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Shipping Information */}
            <CollapsibleSection
              title="Shipping Options"
              icon={Truck}
              isExpanded={expandedSections.shipping}
              onToggle={() => toggleSection('shipping')}
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
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-green-600" />
                      Shipping Method
                    </h4>
                    {customerInfo.zipCode && (
                      <button
                        onClick={getTentShippingQuotes}
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
                      <span className="ml-3 text-gray-600">Getting shipping quotes...</span>
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
                        // Use unique key combining index and name to avoid duplicates
                        const optionKey = `${index}-${option.name || option.type || 'unknown'}`
                        const optionValue = option.name || option.type || `option_${index}`
                        const optionLabel = option.name || option.description || `${option.type} shipping`
                        const optionCost = option.cost || 'Free'
                        
                        return (
                          <label key={optionKey} className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 active:bg-green-100 active:scale-95 cursor-pointer transition-all duration-200 transform hover:scale-105 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2">
                            <input
                              type="radio"
                              name="shipping"
                              value={optionValue}
                              checked={selectedShippingOption === optionValue}
                              onChange={(e) => {
                                console.log('🚚 Tent shipping option changed to:', e.target.value)
                                setSelectedShippingOption(e.target.value)
                              }}
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
                      <p>Click "Refresh Quotes" to get real-time shipping options from our print partners</p>
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleSection>

            {/* Payment Information */}
            <CollapsibleSection
              title="Payment Information"
              icon={CreditCard}
              isExpanded={expandedSections.payment}
              onToggle={() => toggleSection('payment')}
            >
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
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
                
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>Your payment information is secure and encrypted</span>
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
                  {/* Base Tent */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {tentSpecs?.tentSize || '10x10'} Event Tent
                      {tentSpecs?.withFrame ? (
                        <div className="text-xs text-gray-500 mt-1">
                          Complete tent with frame, standard bag, ropes, stakes & sandbags
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 mt-1">
                          Graphic only (you have frame)
                        </div>
                      )}
                    </span>
                    <span className="font-medium">
                      ${tentSpecs?.withFrame ? '599.00' : '325.00'}
                    </span>
                  </div>

                  {/* Wall Options */}
                  {tentSpecs?.surfaces?.backwall && !tentSpecs?.surfaces?.sidewalls && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">+ Backwall</span>
                      <span className="font-medium text-green-600">
                        +${tentSpecs?.withFrame ? '201.00' : '175.00'}
                      </span>
                    </div>
                  )}
                  
                  {tentSpecs?.surfaces?.sidewalls && !tentSpecs?.surfaces?.backwall && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">+ Sidewalls (Left & Right)</span>
                      <span className="font-medium text-green-600">
                        +${tentSpecs?.withFrame ? '151.00' : '230.00'}
                      </span>
                    </div>
                  )}
                  
                  {tentSpecs?.surfaces?.sidewalls && tentSpecs?.surfaces?.backwall && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">+ Full Walls (Sidewalls + Backwall)</span>
                      <span className="font-medium text-green-600">
                        +${tentSpecs?.withFrame ? '301.00' : '405.00'}
                      </span>
                    </div>
                  )}

                  {/* Frame Option */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Frame Option:</span>
                    <span className="font-medium">
                      {tentSpecs?.withFrame ? 'With Frame (Complete Tent)' : 'Graphic Only (You Have Frame)'}
                    </span>
                  </div>

                  {/* Material & Print Method */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material:</span>
                    <span className="font-medium">6oz Tent Fabric (600x600 denier)</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Print Method:</span>
                    <span className="font-medium">Dye-Sublimation Graphic</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Reinforced Strip:</span>
                    <span className="font-medium">
                      {(tentSpecs?.reinforcedStripColor || 'white').charAt(0).toUpperCase() + (tentSpecs?.reinforcedStripColor || 'white').slice(1)}
                    </span>
                  </div>
                  
                  {/* Accessories */}
                  {selectedAccessories.map(accessoryId => {
                    const accessory = accessories.find(a => a.id === accessoryId)
                    return accessory ? (
                      <div key={accessoryId} className="flex justify-between">
                        <span className="text-gray-600">+ {accessory.name}</span>
                        <span className="font-medium text-green-600">+${accessory.price.toFixed(2)}</span>
                      </div>
                    ) : null
                  })}
                  
                  {/* Marketplace Templates */}
                  {orderData?.marketplace_templates && orderData.marketplace_templates.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Marketplace Templates:</span>
                      <span className="font-medium text-buyprint-brand">
                        +${marketplaceCost.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {/* Shipping Cost */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium">
                      {selectedShippingQuote ? selectedShippingQuote.cost : 'Calculating...'}
                    </span>
                  </div>
                  
                  {/* Tax */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-medium">
                      {selectedShippingQuote && selectedShippingQuote.tax ? selectedShippingQuote.tax : '$0.00'}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span className="text-blue-600">${finalTotalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={createOrder}
                  disabled={!isFormValid() || isLoading || !stripe}
                  className="w-full bg-gradient-to-r from-buyprint-brand to-buyprint-600 hover:from-buyprint-600 hover:to-buyprint-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Complete Order - ${finalTotalPrice.toFixed(2)}
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

export default TentCheckout
