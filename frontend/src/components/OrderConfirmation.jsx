import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle, Download, Mail, Phone, MapPin, ArrowLeft } from 'lucide-react'

const OrderConfirmation = () => {
  const [orderConfirmation, setOrderConfirmation] = useState(null)

  useEffect(() => {
    const savedConfirmation = localStorage.getItem('orderConfirmation')
    if (savedConfirmation) {
      setOrderConfirmation(JSON.parse(savedConfirmation))
    }
  }, [])

  if (!orderConfirmation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">Please return to the design tool to create a new order.</p>
          <Link to="/editor" className="btn-primary">
            Start Designing
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600">Your order has been successfully submitted to Buy Printz</p>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-mono font-medium">{orderConfirmation.orderId}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Amount:</span>
              <span className="font-semibold text-primary-600">
                ${orderConfirmation.amount.toFixed(2)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Status:</span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Processing
              </span>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>{orderConfirmation.customerInfo.email}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>{orderConfirmation.customerInfo.phone}</span>
            </div>
            
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-gray-400 mt-1" />
              <div>
                <p>{orderConfirmation.customerInfo.name}</p>
                <p className="text-gray-600">
                  {orderConfirmation.customerInfo.address}<br />
                  {orderConfirmation.customerInfo.city}, {orderConfirmation.customerInfo.state} {orderConfirmation.customerInfo.zipCode}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">What's Next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                1
              </div>
              <div>
                <h3 className="font-medium">Order Processing</h3>
                <p className="text-gray-600 text-sm">
                  Your order is being processed by Buy Printz. You'll receive a confirmation email shortly.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                2
              </div>
              <div>
                <h3 className="font-medium">Production</h3>
                <p className="text-gray-600 text-sm">
                  Your signs will be produced using high-quality materials and professional finishing.
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium mt-0.5">
                3
              </div>
              <div>
                <h3 className="font-medium">Shipping</h3>
                <p className="text-gray-600 text-sm">
                  Your order will be shipped to your address within 3-5 business days.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-6">
          <h2 className="text-xl font-semibold mb-4">Track Your Order</h2>
          
          <p className="text-gray-600 mb-4">
            You can track your order status using the order ID above. We'll also send you email updates as your order progresses.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="btn-secondary flex items-center justify-center gap-2">
              <Download className="w-4 h-4" />
              Download Invoice
            </button>
            <button className="btn-secondary flex items-center justify-center gap-2">
              <Mail className="w-4 h-4" />
              Email Receipt
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OrderConfirmation
