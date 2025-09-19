import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { calculateTinSkinzPricing, formatCurrency, CANDY_OPTIONS, calculateCandyPricing } from '../utils/tinSkinzPricing';
import { NeumorphicButton } from './ui';
import { Truck, CreditCard, User, MapPin, Shield, AlertTriangle } from 'lucide-react';

const TinSkinzCheckout = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  
  // Billing Information
  const [billingInfo, setBillingInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  
  // Shipping Information
  const [shippingInfo, setShippingInfo] = useState({
    firstName: '',
    lastName: '',
    company: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US',
    sameAsBilling: true
  });
  
  // Shipping Options
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShipping, setSelectedShipping] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(null);
  
  // Fraud Prevention
  const [fraudChecks, setFraudChecks] = useState({
    emailVerified: false,
    phoneVerified: false,
    addressVerified: false,
    riskScore: 0
  });
  
  // Form Validation
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  
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
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    // Billing validation
    if (!billingInfo.firstName.trim()) errors.firstName = 'First name is required';
    if (!billingInfo.lastName.trim()) errors.lastName = 'Last name is required';
    if (!billingInfo.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(billingInfo.email)) errors.email = 'Email is invalid';
    if (!billingInfo.phone.trim()) errors.phone = 'Phone number is required';
    if (!billingInfo.address.trim()) errors.address = 'Address is required';
    if (!billingInfo.city.trim()) errors.city = 'City is required';
    if (!billingInfo.state.trim()) errors.state = 'State is required';
    if (!billingInfo.zipCode.trim()) errors.zipCode = 'Zip code is required';
    
    // Shipping validation
    if (!shippingInfo.sameAsBilling) {
      if (!shippingInfo.firstName.trim()) errors.shippingFirstName = 'First name is required';
      if (!shippingInfo.lastName.trim()) errors.shippingLastName = 'Last name is required';
      if (!shippingInfo.address.trim()) errors.shippingAddress = 'Address is required';
      if (!shippingInfo.city.trim()) errors.shippingCity = 'City is required';
      if (!shippingInfo.state.trim()) errors.shippingState = 'State is required';
      if (!shippingInfo.zipCode.trim()) errors.shippingZipCode = 'Zip code is required';
    }
    
    // Shipping option validation
    if (!selectedShipping) errors.shipping = 'Please select a shipping option';
    
    setFormErrors(errors);
    const isValid = Object.keys(errors).length === 0;
    setIsFormValid(isValid);
    return isValid;
  };
  
  // Get shipping rates from UPS
  const getShippingRates = async () => {
    if (!shippingInfo.zipCode) {
      setShippingError('Please enter your shipping address to get shipping rates');
      return;
    }
    
    setShippingLoading(true);
    setShippingError(null);
    
    try {
      const response = await fetch('/api/tin-skinz/shipping/get-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_designs: orderData.selected_designs,
          total_quantity: orderData.total_quantity,
          customer_info: shippingInfo
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get shipping rates');
      }
      
      const result = await response.json();
      
      if (result.success && result.shipping_options.length > 0) {
        setShippingOptions(result.shipping_options);
        // Auto-select the first (cheapest) option
        setSelectedShipping(result.shipping_options[0]);
      } else {
        setShippingError('No shipping options available');
      }
    } catch (error) {
      console.error('Error getting shipping rates:', error);
      setShippingError('Unable to get shipping rates. Please try again.');
    } finally {
      setShippingLoading(false);
    }
  };
  
  // Fraud prevention checks
  const performFraudChecks = async () => {
    try {
      // Basic email validation
      const emailValid = /\S+@\S+\.\S+/.test(billingInfo.email);
      
      // Basic phone validation
      const phoneValid = /^\+?[\d\s\-\(\)]{10,}$/.test(billingInfo.phone);
      
      // Basic address validation
      const addressValid = billingInfo.address.length > 5 && 
                          billingInfo.city.length > 2 && 
                          billingInfo.state.length === 2 && 
                          /^\d{5}(-\d{4})?$/.test(billingInfo.zipCode);
      
      // Calculate risk score (0-100, lower is better)
      let riskScore = 0;
      if (!emailValid) riskScore += 30;
      if (!phoneValid) riskScore += 25;
      if (!addressValid) riskScore += 25;
      if (billingInfo.email.includes('temp') || billingInfo.email.includes('test')) riskScore += 20;
      if (billingInfo.phone.includes('555')) riskScore += 15;
      
      setFraudChecks({
        emailVerified: emailValid,
        phoneVerified: phoneValid,
        addressVerified: addressValid,
        riskScore
      });
      
      return riskScore < 50; // Allow orders with risk score < 50
    } catch (error) {
      console.error('Error performing fraud checks:', error);
      return false;
    }
  };


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
  
  // Validate form when billing or shipping info changes
  useEffect(() => {
    validateForm();
  }, [billingInfo, shippingInfo, selectedShipping]);
  
  // Get shipping rates when shipping address is complete
  useEffect(() => {
    if (shippingInfo.zipCode && shippingInfo.address && shippingInfo.city && shippingInfo.state) {
      getShippingRates();
    }
  }, [shippingInfo.zipCode, shippingInfo.address, shippingInfo.city, shippingInfo.state]);
  
  // Perform fraud checks when billing info changes
  useEffect(() => {
    if (billingInfo.email && billingInfo.phone && billingInfo.address) {
      performFraudChecks();
    }
  }, [billingInfo.email, billingInfo.phone, billingInfo.address]);

  const handlePurchase = async () => {
    if (!finalPricing) {
      console.error('Pricing not calculated');
      return;
    }

    if (!stripe || !elements) {
      console.error('Stripe not ready');
      alert('Payment system not ready. Please try again.');
      return;
    }
    
    // Validate form
    if (!validateForm()) {
      console.error('Form validation failed');
      return;
    }
    
    // Perform fraud checks
    const fraudCheckPassed = await performFraudChecks();
    if (!fraudCheckPassed) {
      alert('Order could not be processed due to security concerns. Please contact support.');
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
        billing_info: billingInfo,
        shipping_info: shippingInfo.sameAsBilling ? billingInfo : shippingInfo,
        shipping_option: selectedShipping,
        fraud_checks: fraudChecks
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

      // Get card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Payment form not found');
      }

      // Confirm payment with Stripe
      const { error } = await stripe.confirmCardPayment(client_secret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: 'John Doe',
            email: 'customer@example.com',
            address: {
              line1: '123 Main St',
              city: 'Anytown',
              state: 'MA',
              postal_code: '12345',
              country: 'US'
            }
          }
        }
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
                const currentSearch = window.location.search;
                const backUrl = `/tin-skinz${currentSearch}`;
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
              
              {/* Payment Form */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                <div className="p-4 border border-gray-300 rounded-lg bg-gray-50">
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
                <p className="text-sm text-gray-600 mt-2">
                  Your payment information is secure and encrypted. We accept all major credit cards.
                </p>
              </div>
              
              <button
                onClick={handlePurchase}
                disabled={!finalPricing || isLoading}
                className="w-full px-6 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold text-lg rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Complete Purchase'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TinSkinzCheckout;
