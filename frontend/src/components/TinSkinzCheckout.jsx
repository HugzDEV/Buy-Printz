import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStripe } from '@stripe/react-stripe-js';
import { calculateTinSkinzPricing, formatCurrency, CANDY_OPTIONS, calculateCandyPricing } from '../utils/tinSkinzPricing';
import { NeumorphicButton } from './ui';

const TinSkinzCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const stripe = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  
  // Order data from marketplace
  const [orderData, setOrderData] = useState(() => {
    const selectedDesignsParam = searchParams.get('selected_designs');
    const customMessage = searchParams.get('custom_message');
    const totalQuantity = parseInt(searchParams.get('total_quantity')) || 1;
    const pricingParam = searchParams.get('pricing');
    
    let selectedDesigns = [];
    let marketplacePricing = {};
    
    try {
      selectedDesigns = selectedDesignsParam ? JSON.parse(selectedDesignsParam) : [];
      marketplacePricing = pricingParam ? JSON.parse(pricingParam) : {};
    } catch (error) {
      console.error('Error parsing order data:', error);
      selectedDesigns = [];
      marketplacePricing = {};
    }
    
    console.log('TinSkinzCheckout - Order data:', {
      selectedDesigns,
      customMessage,
      totalQuantity,
      marketplacePricing
    });
    
    return {
      selected_designs: selectedDesigns,
      custom_message: customMessage,
      total_quantity: totalQuantity,
      marketplace_pricing: marketplacePricing
    };
  });

  // Candy selection removed - now handled per design in marketplace

  // Final pricing (candy already included per design)
  const [finalPricing, setFinalPricing] = useState(null);


  // Use marketplace pricing directly (candy already included)
  useEffect(() => {
    console.log('TinSkinzCheckout - Using marketplace pricing:', {
      selectedDesigns: orderData.selected_designs,
      marketplacePricing: orderData.marketplace_pricing,
      totalQuantity: orderData.total_quantity
    });
    
    if (orderData.selected_designs && orderData.selected_designs.length > 0 && orderData.marketplace_pricing && Object.keys(orderData.marketplace_pricing).length > 0) {
      // Use marketplace pricing directly since candy is already included per design
      const marketplacePricing = orderData.marketplace_pricing;
      console.log('Using marketplace pricing:', marketplacePricing);
      
      setFinalPricing(marketplacePricing);
    } else {
      console.log('Missing required data for pricing calculation');
      setFinalPricing(null);
    }
  }, [orderData]);

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
      // Create order with multiple designs (candy already included per design)
      const checkoutOrderData = {
        selected_designs: orderData.selected_designs,
        total_quantity: orderData.total_quantity,
        pricing: {
          unit_price: finalPricing.unit_price,
          message_unit_price: finalPricing.message_unit_price,
          subtotal: finalPricing.subtotal,
          tax_amount: finalPricing.tax_amount,
          total_amount: finalPricing.total_amount
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

  if (!orderData.selected_designs || orderData.selected_designs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Order Found</h1>
          <p className="text-gray-600 mb-6">Please start your order from the Tin Skinz marketplace.</p>
          <div className="mb-4 p-4 bg-gray-100 rounded-lg text-left">
            <h3 className="font-semibold mb-2">Debug Info:</h3>
            <p>Selected Designs: {JSON.stringify(orderData.selected_designs)}</p>
            <p>Custom Message: {orderData.custom_message || 'Not found'}</p>
            <p>Total Quantity: {orderData.total_quantity}</p>
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

        <div className="max-w-4xl mx-auto space-y-8">
          {/* Back Button */}
          <div className="flex justify-start">
            <button
              onClick={() => {
                // Go back to marketplace with preserved selections
                const backUrl = `/tin-skinz?${window.location.search}`;
                navigate(backUrl);
              }}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back to Tin Skinz Marketplace</span>
            </button>
          </div>

          {/* Order Summary */}
          <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Summary</h2>
            </div>

            <div className="space-y-4">
              {/* Selected Designs with Candy */}
              {orderData.selected_designs && orderData.selected_designs.map((item) => {
                const candy = item.candy_id ? CANDY_OPTIONS.find(c => c.id === item.candy_id) : null;
                const candyPricing = item.candy_id ? calculateCandyPricing(item.candy_id, orderData.total_quantity) : null;
                const candyCostForThisDesign = candyPricing ? candyPricing.unitPrice * item.quantity : 0;
                
                return (
                  <div key={item.design_id} className="space-y-2 border-b border-gray-200 pb-3 last:border-b-0">
                    <div className="flex items-center gap-3">
                      {/* Design Thumbnail */}
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-100/40 to-yellow-100/40 rounded-lg flex items-center justify-center overflow-hidden shadow-inner flex-shrink-0">
                        <img 
                          src={item.design_thumbnail} 
                          alt={item.design_name}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                          <span className="text-gray-500 text-xs">Preview</span>
                        </div>
                      </div>
                      
                      {/* Design Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{item.design_name}</h4>
                            <p className="text-xs text-gray-600">Quantity: {item.quantity}</p>
                            {candy && (
                              <p className="text-xs text-green-600">+ {candy.name}</p>
                            )}
                            {item.custom_message && (
                              <p className="text-xs text-blue-600">Message: "{item.custom_message}"</p>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency((finalPricing?.unit_price || 0) * item.quantity)}
                            </div>
                            {candy && candyPricing && (
                              <div className="text-xs text-green-600">
                                + {formatCurrency(candyCostForThisDesign)}
                              </div>
                            )}
                            {item.custom_message && (
                              <div className="text-xs text-blue-600">
                                + {formatCurrency((finalPricing?.message_unit_price || 0) * item.quantity)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}


              {/* Quantity Discount Info */}
              {orderData.total_quantity >= 3 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-800 font-medium">
                    💰 Bulk Discount Applied - {finalPricing?.tier?.description}
                  </div>
                </div>
              )}

              {/* Free Messaging Info */}
              {orderData.total_quantity >= 51 && orderData.custom_message && (
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
                <span>{formatCurrency(finalPricing?.tax_amount || 0)}</span>
              </div>

              <hr className="border-white/20" />
              <div className="flex justify-between font-bold text-xl text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(finalPricing?.total_amount || 0)}</span>
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
