import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'
import { Lock, CreditCard, User, Mail, Phone, MapPin, CheckCircle, Clock, XCircle, Eye } from 'lucide-react'
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
  const [loading, setLoading] = useState(false)
  const [paymentIntent, setPaymentIntent] = useState(null)
  const [orderId, setOrderId] = useState(null)
  const [checkoutStep, setCheckoutStep] = useState('creating') // creating, preview, ready, processing, completed, error
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [approvedPDF, setApprovedPDF] = useState(null)

  useEffect(() => {
    const savedOrderData = localStorage.getItem('orderData')
    if (!savedOrderData) {
      navigate('/editor')
      return
    }
    
    setOrderData(JSON.parse(savedOrderData))
  }, [navigate])

  useEffect(() => {
    if (orderData) {
      createOrder()
    }
  }, [orderData])

  const createOrder = async () => {
    try {
      console.log('Creating order with data:', orderData)
      const response = await authService.authenticatedRequest('/api/orders/create', {
        method: 'POST',
        body: JSON.stringify(orderData)
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
      localStorage.setItem('orderConfirmation', JSON.stringify({
        orderId: orderId,
        amount: paymentIntent.amount,
        customerInfo
      }))
      
      // Clear order data from localStorage
      localStorage.removeItem('orderData')
      
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
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
  const totalAmount = basePrice * orderData.quantity

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/editor')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Editor
            </button>
            <div></div> {/* Spacer for centering */}
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Complete your order and payment</p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between">
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Product Type:</span>
                <span className="font-medium capitalize">{orderData.product_type}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{orderData.quantity}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Dimensions:</span>
                <span className="font-medium">{orderData.dimensions.width} × {orderData.dimensions.height}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Base Price:</span>
                <span className="font-medium">${basePrice.toFixed(2)}</span>
              </div>
              
              <hr />
              
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total:</span>
                <span className="text-primary-600">${totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Secure Payment</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Your payment information is encrypted and secure
              </p>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="card">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Customer Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      required
                      value={customerInfo.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="input-field pl-10"
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      required
                      value={customerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="input-field pl-10"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    required
                    value={customerInfo.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="input-field pl-10"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    required
                    value={customerInfo.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="input-field pl-10"
                    placeholder="123 Main St"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="input-field"
                    placeholder="New York"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    className="input-field"
                    placeholder="NY"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={customerInfo.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className="input-field"
                    placeholder="10001"
                  />
                </div>
              </div>

              {/* Preview Step */}
              {checkoutStep === 'preview' && (
                <div className="mt-6 space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                      className="btn-primary flex items-center gap-2"
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
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Information
                    </h3>
                    
                    <div className="border rounded-lg p-4">
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
                    <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
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
                    className="btn-primary w-full py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
