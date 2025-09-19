import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, Truck } from 'lucide-react';

const TinSkinzSuccess = () => {
  const [searchParams] = useSearchParams();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    if (orderId) {
      // In a real implementation, you would fetch order details from the API
      // For now, we'll just show a success message
      setLoading(false);
    }
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading order details...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-8">
          <img 
            src="/assets/tin-skinz/Tin Skinz_logo_full color_Secondary logo.png" 
            alt="Tin Skinz Logo" 
            className="h-24 w-auto mx-auto mb-6"
          />
        </div>

        {/* Success Card */}
        <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Order Confirmed! 🎉
          </h1>
          
          <p className="text-xl text-gray-700 mb-6">
            Thank you for your Tin Skinz order! Your custom tins are being prepared.
          </p>

          {orderId && (
            <div className="bg-white/50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Order ID</p>
              <p className="font-mono text-lg font-bold text-gray-900">{orderId}</p>
            </div>
          )}

          {/* Order Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-3">
                <Package className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Order Processing</h3>
              <p className="text-sm text-gray-600 text-center">
                Your order is being prepared with your selected design and custom message.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Shipping</h3>
              <p className="text-sm text-gray-600 text-center">
                Your Tin Skinz will be shipped within 3-5 business days.
              </p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Delivery</h3>
              <p className="text-sm text-gray-600 text-center">
                You'll receive tracking information via email once shipped.
              </p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white/30 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">What's Next?</h3>
            <ul className="text-left text-gray-700 space-y-2">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                You'll receive an email confirmation with your order details
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Your Tin Skinz will be custom printed with your selected design
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                We'll send tracking information once your order ships
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Expected delivery: 5-7 business days after shipping
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.href = '/tin-skinz'}
              className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              Order More Tin Skinz
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-gray-900 font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border border-white/30"
            >
              Back to Home
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/70 text-sm">
            Questions about your order? Contact us at{' '}
            <a href="mailto:support@buyprintz.com" className="text-yellow-400 hover:underline">
              support@buyprintz.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TinSkinzSuccess;
