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
import PrintPreviewModal from './PrintPreviewModal'
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
    shipping: false,
    payment: false
  })
  
  // Shipping state
  const [shippingQuotes, setShippingQuotes] = useState([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState(null)
  const [selectedShippingOption, setSelectedShippingOption] = useState('standard')

  // Tent specifications
  const [tentSpecs, setTentSpecs] = useState({
    tentSize: '10x10',
    tentType: 'event-tent',
    material: '6oz-tent-fabric',
    frameType: '40mm-aluminum-hex',
    printMethod: 'dye-sublimation'
  })

  // Accessories
  const [selectedAccessories, setSelectedAccessories] = useState([])
  const accessories = [
    { id: 'carrying-bag', name: 'Carrying Bag w/ Wheels', price: 49.99, description: 'Premium wheeled bag for easy transport' },
    { id: 'sandbags', name: 'Sandbags', price: 24.99, description: 'Heavy-duty sandbags for tent stability (sand not included)' },
    { id: 'ropes-stakes', name: 'Reinforced Strip', price: 19.99, description: 'Professional tent ropes and stakes' }
  ]

  // Shipping information
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
        // Use the design option from the order data (set in BannerSidebar)
        console.log('🎨 TentCheckout - Using design option from order data:', parsed.design_option || parsed.tent_design_option)
        setOrderData(parsed)
        console.log('Loaded tent order data:', parsed)
      } catch (error) {
        console.error('Error parsing tent order data:', error)
      }
    } else {
      // Set default order data for preview modal
      const defaultOrderData = {
        product_type: 'tradeshow_tent',
        tent_size: tentSpecs.tentSize,
        tent_type: tentSpecs.tentType,
        tent_material: '6oz Tent Fabric',
        tent_frame_type: '40mm Aluminum Hex',
        tent_print_method: 'Dye-Sublimation',
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

  // Get shipping quotes when shipping section is expanded
  useEffect(() => {
    if (expandedSections.shipping && orderData && !shippingQuotes.length && !shippingLoading) {
      getTentShippingQuotes()
    }
  }, [expandedSections.shipping, orderData])

  // Calculate tent pricing
  const calculateTentPrice = () => {
    const basePrice = tentSpecs.tentSize === '10x10' ? 299.99 : 499.99
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
  
  const finalTotalPrice = totalPrice + marketplaceCost

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

  // Get real-time shipping quotes from B2Sign for tents
  const getTentShippingQuotes = async () => {
    if (!orderData) return

    setShippingLoading(true)
    setShippingError(null)

    try {
      console.log('🚚 Getting real-time shipping quotes for tent from B2Sign...')
      
      // Prepare tent order data for shipping quote
      const shippingOrderData = {
        product_type: 'tent',
        dimensions: { width: 10, height: 10 }, // Tent dimensions
        quantity: 1,
        zip_code: shippingInfo.zipCode || '10001',
        job_name: `Tent Order ${Date.now()}`,
        print_options: {
          tent_size: tentSpecs.tentSize,
          tent_design_option: orderData.tent_design_option || 'canopy-only'
        },
        accessories: selectedAccessories,
        customer_info: shippingInfo
      }

      // Get shipping quote from B2Sign
      const quote = await shippingService.getShippingQuote(shippingOrderData)
      
      if (quote.success && quote.shipping_options) {
        setShippingQuotes(quote.shipping_options)
        console.log('✅ Real-time tent shipping quotes received:', quote.shipping_options)
      } else {
        setShippingError('No shipping options available from B2Sign')
        console.warn('⚠️ No shipping options received from B2Sign for tent')
      }

    } catch (error) {
      console.error('❌ Error getting tent shipping quotes:', error)
      setShippingError(`Failed to get shipping quotes: ${error.message}`)
      
      // NO FALLBACK - System must get real shipping costs from B2Sign
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
      const cardElement = elements.getElement(CardElement)
      
      // Create payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        },
        body: JSON.stringify({
          amount: Math.round(finalTotalPrice * 100), // Convert to cents
          currency: 'usd',
          metadata: {
            product_type: 'tradeshow_tent',
            tent_size: tentSpecs.tentSize,
            tent_type: tentSpecs.tentType,
            material: tentSpecs.material,
            frame_type: tentSpecs.frameType,
            print_method: tentSpecs.printMethod,
            accessories: JSON.stringify(selectedAccessories),
            shipping_info: JSON.stringify(shippingInfo)
          }
        })
      })

      const { client_secret } = await response.json()

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: {
              line1: shippingInfo.address,
              city: shippingInfo.city,
              state: shippingInfo.state,
              postal_code: shippingInfo.zipCode,
              country: shippingInfo.country
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
    return shippingInfo.firstName && 
           shippingInfo.lastName && 
           shippingInfo.email && 
           shippingInfo.phone && 
           shippingInfo.address && 
           shippingInfo.city && 
           shippingInfo.state && 
           shippingInfo.zipCode
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
                <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <Eye className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">Review Your Tent Design</h3>
                  <p className="text-blue-700 mb-4">
                    Before proceeding, please review your tent design to ensure it's exactly what you want printed.
                  </p>
                  <button
                    onClick={() => setShowPreviewModal(true)}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <Eye className="w-5 h-5" />
                    Preview Tent Design
                  </button>
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

            {/* Tent Details */}
            <CollapsibleSection
              title="Tent Specifications"
              icon={Layers}
              isExpanded={expandedSections.accessories}
              onToggle={() => toggleSection('accessories')}
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tent Size
                    </label>
                    <select
                      value={tentSpecs.tentSize}
                      onChange={(e) => setTentSpecs(prev => ({ ...prev, tentSize: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="10x10">10x10 Event Tent - $299.99</option>
                      <option value="10x20">10x20 Event Tent - $499.99</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Material
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                      6oz Tent Fabric (600x600 denier)
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frame Type
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                      40mm Aluminum Hex Hardware
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Print Method
                    </label>
                    <div className="px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                      Dye-Sublimation Graphic
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Tent Features</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• 360 degrees of branding coverage</li>
                        <li>• Weather resistant waterproof fabric</li>
                        <li>• Telescopic legs with height adjustment</li>
                        <li>• Interior lattice expansion system</li>
                        <li>• Heavy duty aluminum hardware</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleSection>

            {/* Accessories */}
            <CollapsibleSection
              title="Tent Accessories"
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

            {/* Shipping Information */}
            <CollapsibleSection
              title="Shipping Information"
              icon={Truck}
              isExpanded={expandedSections.shipping}
              onToggle={() => toggleSection('shipping')}
            >
              <div className="space-y-4">
                {/* Shipping Options */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-green-600" />
                      Shipping Method
                    </h4>
                    <button
                      onClick={getTentShippingQuotes}
                      disabled={shippingLoading}
                      className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {shippingLoading ? 'Getting Quotes...' : 'Refresh Quotes'}
                    </button>
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
                      <span className="ml-3 text-gray-600">Getting real-time shipping quotes from B2Sign...</span>
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
                              checked={selectedShippingOption === optionValue}
                              onChange={(e) => setSelectedShippingOption(e.target.value)}
                              className="mr-3 text-green-600 focus:ring-green-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <Icon className="w-4 h-4 text-green-600" />
                                <p className="font-medium text-gray-900">{optionLabel}</p>
                              </div>
                              <p className={`text-sm ${optionCost !== 'Free' ? 'text-green-600' : 'text-gray-500'}`}>
                                {optionCost}
                              </p>
                              {option.estimated_days && (
                                <p className="text-xs text-gray-500">
                                  Est. {option.estimated_days} day{option.estimated_days !== 1 ? 's' : ''}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address *
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code *
                    </label>
                    <input
                      type="text"
                      value={shippingInfo.zipCode}
                      onChange={(e) => handleInputChange('zipCode', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {tentSpecs.tentSize} Event Tent
                    </span>
                    <span className="font-medium">
                      ${tentSpecs.tentSize === '10x10' ? '299.99' : '499.99'}
                    </span>
                  </div>
                  
                  {selectedAccessories.map(accessoryId => {
                    const accessory = accessories.find(a => a.id === accessoryId)
                    return accessory ? (
                      <div key={accessoryId} className="flex justify-between">
                        <span className="text-gray-600">{accessory.name}</span>
                        <span className="font-medium">${accessory.price.toFixed(2)}</span>
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
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-semibold">
                      <span>Total</span>
                      <span>${finalTotalPrice.toFixed(2)}</span>
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

      {/* Print Preview Modal */}
      <PrintPreviewModal
        isOpen={showPreviewModal}
        onClose={handlePreviewCancel}
        onApprove={handlePreviewApprove}
        canvasData={orderData?.canvas_data}
        orderDetails={{
          ...orderData,
          // canvas_image should already be the correct data URL from BannerEditor
          // Don't override it with canvas_data object
        }}
        dimensions={orderData?.dimensions}
        productType={orderData?.product_type === 'tradeshow_tent' ? 'tent' : orderData?.product_type || 'tent'}
        surfaceElements={orderData?.surface_elements || {}}
        currentSurface={orderData?.current_surface || 'canopy_front'}
      />
    </div>
  )
}

export default TentCheckout
