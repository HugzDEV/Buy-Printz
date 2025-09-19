import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { calculateTinSkinzPricing, formatCurrency } from '../utils/tinSkinzPricing';
import { NeumorphicButton } from './ui';

const TinSkinzCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [stripe, setStripe] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Order data from marketplace
  const [orderData, setOrderData] = useState(() => {
    const designId = searchParams.get('design_id');
    const customMessage = searchParams.get('custom_message');
    const quantity = parseInt(searchParams.get('quantity')) || 1;
    const pricingParam = searchParams.get('pricing');
    
    let marketplacePricing = {};
    try {
      marketplacePricing = pricingParam ? JSON.parse(pricingParam) : {};
    } catch (error) {
      console.error('Error parsing pricing data:', error);
      marketplacePricing = {};
    }
    
    console.log('TinSkinzCheckout - Order data:', {
      designId,
      customMessage,
      quantity,
      marketplacePricing
    });
    
    return {
      design_id: designId,
      custom_message: customMessage,
      quantity,
      marketplace_pricing: marketplacePricing
    };
  });

  // Candy selection
  const [selectedCandy, setSelectedCandy] = useState('');
  const [candyOptions] = useState([
    { id: 'gummy-bears', name: 'Gummy Bears', price: 3.00 },
    { id: 'chocolate-coins', name: 'Chocolate Coins', price: 3.50 },
    { id: 'jelly-beans', name: 'Jelly Beans', price: 2.75 },
    { id: 'sour-patch', name: 'Sour Patch Kids', price: 3.25 }
  ]);

  // Final pricing with candy
  const [finalPricing, setFinalPricing] = useState(null);

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      setStripe(stripeInstance);
    };
    initializeStripe();
  }, []);

  // Calculate final pricing with candy
  useEffect(() => {
    console.log('TinSkinzCheckout - Pricing calculation triggered:', {
      designId: orderData.design_id,
      marketplacePricing: orderData.marketplace_pricing,
      selectedCandy,
      quantity: orderData.quantity
    });
    
    if (orderData.design_id && orderData.marketplace_pricing && Object.keys(orderData.marketplace_pricing).length > 0) {
      const hasCandy = selectedCandy !== '';
      const hasCustomMessage = orderData.custom_message && orderData.custom_message.trim() !== '';
      
      try {
        // Start with marketplace pricing (no candy)
        const marketplacePricing = orderData.marketplace_pricing;
        console.log('Marketplace pricing:', marketplacePricing);
        
        // Calculate candy cost if selected
        let candyUnitPrice = 0;
        if (hasCandy && orderData.quantity <= 19) {
          const candyOption = candyOptions.find(c => c.id === selectedCandy);
          candyUnitPrice = candyOption ? candyOption.price : 0;
        }
        
        // Calculate new totals with candy
        const candyTotal = candyUnitPrice * orderData.quantity;
        const newSubtotal = marketplacePricing.subtotal + candyTotal;
        const newTaxAmount = newSubtotal * 0.0625; // 6.25% MA tax
        const newTotalAmount = newSubtotal + newTaxAmount;
        
        const finalPricingData = {
          ...marketplacePricing,
          candyUnitPrice,
          subtotal: Math.round(newSubtotal * 100) / 100,
          taxAmount: Math.round(newTaxAmount * 100) / 100,
          totalAmount: Math.round(newTotalAmount * 100) / 100,
          hasCandy
        };
        
        console.log('Final pricing calculated:', finalPricingData);
        setFinalPricing(finalPricingData);
      } catch (error) {
        console.error('Error calculating final pricing:', error);
        setFinalPricing(null);
      }
    } else {
      console.log('Missing required data for pricing calculation');
      setFinalPricing(null);
    }
  }, [orderData, selectedCandy, candyOptions]);

  const handlePurchase = async () => {
    if (!finalPricing) {
      console.error('Pricing not calculated');
      return;
    }

    // In production, Stripe is handled by Railway
    // For local dev, we'll simulate the checkout flow
    if (!stripe) {
      console.log('Stripe not loaded (local dev) - simulating checkout');
      alert('In local development mode. In production, this would proceed to Stripe checkout.');
      return;
    }

    setIsLoading(true);
    
    try {
      // Create order with candy selection
      const checkoutOrderData = {
        design_id: orderData.design_id,
        custom_message: orderData.custom_message,
        candy_id: selectedCandy || null,
        quantity: orderData.quantity,
        pricing: {
          unit_price: finalPricing.unitPrice,
          candy_unit_price: finalPricing.candyUnitPrice,
          message_unit_price: finalPricing.messageUnitPrice,
          subtotal: finalPricing.subtotal,
          tax_amount: finalPricing.taxAmount,
          total_amount: finalPricing.totalAmount
        },
        shipping_address: {
          name: 'John Doe',
          line1: '123 Main St',
          city: 'Anytown',
          state: 'MA',
          postal_code: '12345',
          country: 'US'
        },
        billing_address: {
          name: 'John Doe',
          line1: '123 Main St',
          city: 'Anytown',
          state: 'MA',
          postal_code: '12345',
          country: 'US'
        }
      };

      const response = await fetch('/api/tin-skinz/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(checkoutOrderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { client_secret } = await response.json();

      // Confirm payment with Stripe
      const { error } = await stripe.confirmPayment({
        clientSecret: client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/tin-skinz/success`,
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        alert('Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!orderData.design_id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Order Found</h1>
          <p className="text-gray-600 mb-6">Please start your order from the Tin Skinz marketplace.</p>
          <div className="mb-4 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <p>Design ID: {orderData.design_id || 'Not found'}</p>
            <p>Custom Message: {orderData.custom_message || 'Not found'}</p>
            <p>Quantity: {orderData.quantity}</p>
            <p>Pricing: {JSON.stringify(orderData.marketplace_pricing)}</p>
            <p>URL Params: {window.location.search}</p>
          </div>
          <button
            onClick={() => navigate('/tin-skinz')}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-xl transition-all duration-200"
          >
            Go to Tin Skinz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Complete Your Order</h1>
          <p className="text-xl text-gray-600">Add candy and finalize your Tin Skinz purchase</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Candy Selection */}
          <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Add Candy (Optional)</h2>
              <p className="text-gray-600">Choose from our selection of premium candies to fill your tin.</p>
            </div>

            <div className="space-y-4">
              <div className="backdrop-blur-md bg-white/30 border border-white/40 rounded-xl p-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="candy"
                    value=""
                    checked={selectedCandy === ''}
                    onChange={(e) => setSelectedCandy(e.target.value)}
                    className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">No Candy</div>
                    <div className="text-sm text-gray-600">Tin only, no candy included</div>
                  </div>
                  <div className="text-yellow-600 font-bold">$0.00</div>
                </label>
              </div>

              {candyOptions.map((candy) => (
                <div key={candy.id} className="backdrop-blur-md bg-white/30 border border-white/40 rounded-xl p-4">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="candy"
                      value={candy.id}
                      checked={selectedCandy === candy.id}
                      onChange={(e) => setSelectedCandy(e.target.value)}
                      className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{candy.name}</div>
                      <div className="text-sm text-gray-600">Premium quality candy</div>
                    </div>
                    <div className="text-yellow-600 font-bold">${candy.price}</div>
                  </label>
                </div>
              ))}
            </div>

            {orderData.quantity > 19 && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800 font-medium">
                  ℹ️ Candy not available for bulk orders (20+ tins)
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Summary</h2>
            </div>

            <div className="space-y-4">
              {/* Base Tin Price */}
              <div className="flex justify-between text-gray-700">
                <span>Tin Design ({orderData.quantity} × {formatCurrency(finalPricing?.unitPrice || 0)})</span>
                <span>{formatCurrency((finalPricing?.unitPrice || 0) * orderData.quantity)}</span>
              </div>

              {/* Custom Message */}
              {orderData.custom_message && (
                <div className="flex justify-between text-gray-700">
                  <span>Custom Message ({orderData.quantity} × {formatCurrency(finalPricing?.messageUnitPrice || 0)})</span>
                  <span>{formatCurrency((finalPricing?.messageUnitPrice || 0) * orderData.quantity)}</span>
                </div>
              )}

              {/* Candy Selection */}
              {selectedCandy && orderData.quantity <= 19 && (
                <div className="flex justify-between text-gray-700">
                  <span>{candyOptions.find(c => c.id === selectedCandy)?.name} ({orderData.quantity} × {formatCurrency(finalPricing?.candyUnitPrice || 0)})</span>
                  <span>{formatCurrency((finalPricing?.candyUnitPrice || 0) * orderData.quantity)}</span>
                </div>
              )}

              {/* Quantity Discount Info */}
              {orderData.quantity >= 3 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-800 font-medium">
                    💰 Bulk Discount Applied - {finalPricing?.tier?.description}
                  </div>
                </div>
              )}

              {/* Free Messaging Info */}
              {orderData.quantity >= 51 && orderData.custom_message && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="text-sm text-green-800 font-medium">
                    🎉 Free Custom Messaging on orders 51+
                  </div>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex justify-between text-gray-700 border-t border-gray-200 pt-2">
                <span>Subtotal</span>
                <span>{formatCurrency(finalPricing?.subtotal || 0)}</span>
              </div>

              {/* Tax */}
              <div className="flex justify-between text-gray-700">
                <span>Tax (6.25%)</span>
                <span>{formatCurrency(finalPricing?.taxAmount || 0)}</span>
              </div>

              <hr className="border-white/20" />
              <div className="flex justify-between font-bold text-xl text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(finalPricing?.totalAmount || 0)}</span>
              </div>
              
              <button
                onClick={handlePurchase}
                disabled={!finalPricing || isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : (!stripe ? 'Complete Purchase (Dev Mode)' : 'Complete Purchase')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TinSkinzCheckout;
