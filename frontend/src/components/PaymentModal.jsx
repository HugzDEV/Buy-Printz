import React, { useState } from 'react'
import { 
  X, 
  CreditCard, 
  Lock, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  User,
  Mail,
  MapPin
} from 'lucide-react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { GlassCard, GlassButton } from './ui'

const PaymentModal = ({ 
  isOpen, 
  onClose, 
  template, 
  onSuccess, 
  onError 
}) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [billingDetails, setBillingDetails] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  })

  const handleSubmit = async (event) => {
    event.preventDefault()
    
    if (!stripe || !elements) {
      return
    }

    setProcessing(true)

    try {
      // Create payment intent
      const apiUrl = import.meta.env.VITE_API_URL || 'https://buy-printz-production.up.railway.app'
      const response = await fetch(`${apiUrl}/api/creator-marketplace/templates/${template.id}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to create payment intent')
      }

      const { client_secret } = await response.json()

      // Confirm payment with card element
      const { error, paymentIntent } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: billingDetails.name,
            email: billingDetails.email,
            address: {
              line1: billingDetails.address,
              city: billingDetails.city,
              state: billingDetails.state,
              postal_code: billingDetails.zip,
              country: 'US'
            }
          }
        }
      })

      if (error) {
        onError(error.message)
      } else if (paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent)
      }
    } catch (error) {
      onError(error.message)
    } finally {
      setProcessing(false)
    }
  }

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
        fontFamily: 'Inter, system-ui, sans-serif',
      },
      invalid: {
        color: '#9e2146',
      },
    },
    hidePostalCode: true,
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto backdrop-blur-md bg-white/80 border border-white/30 shadow-xl rounded-3xl">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-buyprint-brand/20 rounded-lg">
                <CreditCard className="w-5 h-5 text-buyprint-brand" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Complete Purchase</h2>
                <p className="text-sm text-gray-600">Secure payment powered by Stripe</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Template Info */}
          <div className="bg-white/20 rounded-lg p-4 mb-6 border border-white/30">
            <div className="flex items-center gap-3">
              {template.preview_image_url && (
                <img 
                  src={template.preview_image_url} 
                  alt={template.name}
                  className="w-12 h-12 object-cover rounded-lg"
                />
              )}
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600">by {template.creator_name || 'BuyPrintz'}</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-buyprint-brand">${template.price}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Billing Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5" />
                Billing Information
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={billingDetails.name}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={billingDetails.email}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  required
                  value={billingDetails.address}
                  onChange={(e) => setBillingDetails(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={billingDetails.city}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, city: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent"
                    placeholder="New York"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    required
                    value={billingDetails.state}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent"
                    placeholder="NY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP *
                  </label>
                  <input
                    type="text"
                    required
                    value={billingDetails.zip}
                    onChange={(e) => setBillingDetails(prev => ({ ...prev, zip: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </h3>
              
              <div className="p-4 bg-white/20 border border-white/30 rounded-lg">
                <CardElement options={cardElementOptions} />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-3 p-3 bg-buyprint-brand/10 border border-buyprint-brand/20 rounded-lg">
              <Lock className="w-5 h-5 text-buyprint-brand" />
              <p className="text-sm text-buyprint-brand">
                Your payment information is secure and encrypted. We never store your card details.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-gray-700 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!stripe || processing}
                className="flex-1 px-4 py-2 bg-buyprint-brand hover:bg-buyprint-600 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4 mr-2" />
                    Pay ${template.price}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default PaymentModal
