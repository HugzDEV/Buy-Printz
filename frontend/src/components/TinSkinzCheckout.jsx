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
  // Note: Weight calculation is handled on the backend:
  // - Empty tins: 1.18oz (0.074 lbs) each
  // - Tins with candy: 3.11oz (0.194 lbs) each
  const getShippingRates = async () => {
    const addressToUse = shippingInfo.sameAsBilling ? billingInfo : shippingInfo;
    
    if (!addressToUse.zipCode) {
      setShippingError('Please enter your shipping address to get shipping rates');
      return;
    }
    
    setShippingLoading(true);
    setShippingError(null);
    
    try {
      console.log('Getting shipping rates for:', {
        selected_designs: orderData.selected_designs,
        total_quantity: orderData.total_quantity,
        customer_info: addressToUse
      });
      
      const response = await fetch('https://api.buyprintz.com/api/tin-skinz/shipping/get-rates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_designs: orderData.selected_designs,
          total_quantity: orderData.total_quantity,
          customer_info: addressToUse
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to get shipping rates`);
      }
      
      const result = await response.json();
      console.log('Shipping rates response:', result);
      
      if (result.success && result.shipping_options && result.shipping_options.length > 0) {
        setShippingOptions(result.shipping_options);
        // Auto-select the first (cheapest) option
        setSelectedShipping(result.shipping_options[0]);
      } else {
        setShippingError('No shipping options available');
      }
    } catch (error) {
      console.error('Error getting shipping rates:', error);
      setShippingError(`Unable to get shipping rates: ${error.message}`);
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
    const addressToUse = shippingInfo.sameAsBilling ? billingInfo : shippingInfo;
    if (addressToUse.zipCode && addressToUse.address && addressToUse.city && addressToUse.state) {
      getShippingRates();
    }
  }, [shippingInfo.zipCode, shippingInfo.address, shippingInfo.city, shippingInfo.state, shippingInfo.sameAsBilling, billingInfo.zipCode, billingInfo.address, billingInfo.city, billingInfo.state]);
  
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

      const response = await fetch('https://api.buyprintz.com/api/tin-skinz/create-order', {
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

              {/* Shipping */}
              {selectedShipping && (
                <div className="flex justify-between text-gray-700">
                  <span>Shipping ({selectedShipping.name})</span>
                  <span>{formatCurrency(selectedShipping.cost)}</span>
                </div>
              )}

              <hr className="border-white/20" />
              <div className="flex justify-between font-bold text-xl text-gray-900">
                <span>Total</span>
                <span>{formatCurrency((finalPricing?.total_amount || 0) + (selectedShipping?.cost || 0))}</span>
              </div>
              
              {/* Billing Information */}
              <div className="mt-6">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-4 bg-gradient-to-r from-amber-100/50 to-yellow-100/50 rounded-xl border border-amber-200/50 hover:from-amber-200/50 hover:to-yellow-200/50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Billing Information</h3>
                    </div>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 bg-white/50 rounded-xl border border-amber-200/30">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                    <input
                      type="text"
                      value={billingInfo.firstName}
                      onChange={(e) => setBillingInfo({...billingInfo, firstName: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.firstName && <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                    <input
                      type="text"
                      value={billingInfo.lastName}
                      onChange={(e) => setBillingInfo({...billingInfo, lastName: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.lastName && <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={billingInfo.email}
                      onChange={(e) => setBillingInfo({...billingInfo, email: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={billingInfo.phone}
                      onChange={(e) => setBillingInfo({...billingInfo, phone: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.phone && <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                    <input
                      type="text"
                      value={billingInfo.address}
                      onChange={(e) => setBillingInfo({...billingInfo, address: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        formErrors.address ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.address && <p className="text-red-500 text-sm mt-1">{formErrors.address}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={billingInfo.city}
                      onChange={(e) => setBillingInfo({...billingInfo, city: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        formErrors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.city && <p className="text-red-500 text-sm mt-1">{formErrors.city}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                    <input
                      type="text"
                      value={billingInfo.state}
                      onChange={(e) => setBillingInfo({...billingInfo, state: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        formErrors.state ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.state && <p className="text-red-500 text-sm mt-1">{formErrors.state}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code *</label>
                    <input
                      type="text"
                      value={billingInfo.zipCode}
                      onChange={(e) => setBillingInfo({...billingInfo, zipCode: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                        formErrors.zipCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {formErrors.zipCode && <p className="text-red-500 text-sm mt-1">{formErrors.zipCode}</p>}
                  </div>
                </div>
                  </div>
                </details>
              </div>

              {/* Shipping Information */}
              <div className="mt-6">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-4 bg-gradient-to-r from-amber-100/50 to-yellow-100/50 rounded-xl border border-amber-200/50 hover:from-amber-200/50 hover:to-yellow-200/50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Shipping Information</h3>
                    </div>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 bg-white/50 rounded-xl border border-amber-200/30">
                
                <div className="mb-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={shippingInfo.sameAsBilling}
                      onChange={(e) => setShippingInfo({...shippingInfo, sameAsBilling: e.target.checked})}
                      className="rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Same as billing address</span>
                  </label>
                </div>

                {!shippingInfo.sameAsBilling && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                      <input
                        type="text"
                        value={shippingInfo.firstName}
                        onChange={(e) => setShippingInfo({...shippingInfo, firstName: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          formErrors.shippingFirstName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.shippingFirstName && <p className="text-red-500 text-sm mt-1">{formErrors.shippingFirstName}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={shippingInfo.lastName}
                        onChange={(e) => setShippingInfo({...shippingInfo, lastName: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          formErrors.shippingLastName ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.shippingLastName && <p className="text-red-500 text-sm mt-1">{formErrors.shippingLastName}</p>}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Address *</label>
                      <input
                        type="text"
                        value={shippingInfo.address}
                        onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          formErrors.shippingAddress ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.shippingAddress && <p className="text-red-500 text-sm mt-1">{formErrors.shippingAddress}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={shippingInfo.city}
                        onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          formErrors.shippingCity ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.shippingCity && <p className="text-red-500 text-sm mt-1">{formErrors.shippingCity}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        value={shippingInfo.state}
                        onChange={(e) => setShippingInfo({...shippingInfo, state: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          formErrors.shippingState ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.shippingState && <p className="text-red-500 text-sm mt-1">{formErrors.shippingState}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code *</label>
                      <input
                        type="text"
                        value={shippingInfo.zipCode}
                        onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                          formErrors.shippingZipCode ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.shippingZipCode && <p className="text-red-500 text-sm mt-1">{formErrors.shippingZipCode}</p>}
                    </div>
                  </div>
                )}
                  </div>
                </details>
              </div>

              {/* Shipping Options */}
              <div className="mt-6">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-4 bg-gradient-to-r from-amber-100/50 to-yellow-100/50 rounded-xl border border-amber-200/50 hover:from-amber-200/50 hover:to-yellow-200/50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <Truck className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Shipping Options</h3>
                    </div>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 bg-white/50 rounded-xl border border-amber-200/30">

                {shippingLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Getting shipping rates...</p>
                  </div>
                ) : shippingError ? (
                  <div className="text-center py-8">
                    <div className="text-red-600">{shippingError}</div>
                  </div>
                ) : shippingOptions.length > 0 ? (
                  <div className="space-y-3">
                    {shippingOptions.map((option) => (
                      <label key={option.id} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-amber-50">
                        <input
                          type="radio"
                          name="shipping"
                          value={option.id}
                          checked={selectedShipping?.id === option.id}
                          onChange={() => setSelectedShipping(option)}
                          className="text-amber-600 focus:ring-amber-500"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{option.name}</span>
                            <span className="font-bold text-amber-600">{formatCurrency(option.cost)}</span>
                          </div>
                          <p className="text-sm text-gray-600">
                            Estimated delivery: {option.estimated_days} business days
                            {option.carrier && <span className="ml-2 text-xs text-gray-500">({option.carrier})</span>}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">Enter your shipping address to see shipping options</p>
                  </div>
                )}
                  </div>
                </details>
              </div>

              {/* Payment Form */}
              <div className="mt-6">
                <details className="group">
                  <summary className="flex items-center justify-between cursor-pointer p-4 bg-gradient-to-r from-amber-100/50 to-yellow-100/50 rounded-xl border border-amber-200/50 hover:from-amber-200/50 hover:to-yellow-200/50 transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-amber-600" />
                      <h3 className="text-lg font-semibold text-gray-900">Payment Information</h3>
                    </div>
                    <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="mt-4 p-4 bg-white/50 rounded-xl border border-amber-200/30">
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
                </details>
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
