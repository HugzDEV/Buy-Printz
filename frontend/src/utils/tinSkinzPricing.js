/**
 * Tin Skinz Pricing Utility
 * Handles pricing calculations based on quantity tiers and options
 */

// Pricing tiers based on quantity
const PRICING_TIERS = [
  { min: 1, max: 1, basePrice: 9.99, candyPrice: 3.00, messagePrice: 0.99 },
  { min: 2, max: 2, basePrice: 9.99, candyPrice: 3.00, messagePrice: 0.99 },
  { min: 3, max: 3, basePrice: 6.67, candyPrice: 1.67, messagePrice: 0.99 }, // $19.99/3 = $6.67, candy: ($24.99-$19.99)/3 = $1.67
  { min: 4, max: 19, basePrice: 6.67, candyPrice: 1.67, messagePrice: 0.99 },
  { min: 20, max: 50, basePrice: 6.00, candyPrice: 0.00, messagePrice: 0.99 },
  { min: 51, max: 99, basePrice: 5.50, candyPrice: 0.00, messagePrice: 0.00 }, // Free messaging
  { min: 100, max: null, basePrice: 4.50, candyPrice: 0.00, messagePrice: 0.00 } // Free messaging
];

// Tax rate (8.5%)
const TAX_RATE = 0.085;

/**
 * Calculate pricing for Tin Skinz order
 * @param {number} quantity - Number of tins
 * @param {boolean} hasCandy - Whether candy is included
 * @param {boolean} hasCustomMessage - Whether custom message is included
 * @returns {Object} Pricing breakdown
 */
export function calculateTinSkinzPricing(quantity, hasCandy = false, hasCustomMessage = false) {
  // Find the appropriate pricing tier
  const tier = PRICING_TIERS.find(t => 
    quantity >= t.min && (t.max === null || quantity <= t.max)
  );

  if (!tier) {
    throw new Error(`Invalid quantity: ${quantity}`);
  }

  // Calculate unit prices
  const unitPrice = tier.basePrice;
  const candyUnitPrice = hasCandy ? tier.candyPrice : 0;
  const messageUnitPrice = hasCustomMessage ? tier.messagePrice : 0;

  // Calculate totals
  const subtotal = (unitPrice + candyUnitPrice + messageUnitPrice) * quantity;
  const taxAmount = subtotal * TAX_RATE;
  const totalAmount = subtotal + taxAmount;

  return {
    quantity,
    hasCandy,
    hasCustomMessage,
    unitPrice,
    candyUnitPrice,
    messageUnitPrice,
    subtotal: Math.round(subtotal * 100) / 100, // Round to 2 decimal places
    taxAmount: Math.round(taxAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    tier: {
      min: tier.min,
      max: tier.max,
      description: getTierDescription(tier)
    }
  };
}

/**
 * Get human-readable description of pricing tier
 * @param {Object} tier - Pricing tier object
 * @returns {string} Description
 */
function getTierDescription(tier) {
  if (tier.min === tier.max) {
    if (tier.min === 1) return "Single tin";
    if (tier.min === 2) return "Two tins";
    if (tier.min === 3) return "Three tins (bulk discount)";
  }
  
  if (tier.max === null) {
    return `${tier.min}+ tins (wholesale pricing)`;
  }
  
  return `${tier.min}-${tier.max} tins`;
}

/**
 * Get pricing breakdown for display
 * @param {Object} pricing - Pricing object from calculateTinSkinzPricing
 * @returns {Array} Array of pricing line items
 */
export function getPricingBreakdown(pricing) {
  const breakdown = [];
  
  // Base price
  breakdown.push({
    label: `Tin Skinz (${pricing.quantity} × $${pricing.unitPrice.toFixed(2)})`,
    amount: pricing.unitPrice * pricing.quantity,
    type: 'base'
  });
  
  // Candy price
  if (pricing.hasCandy && pricing.candyUnitPrice > 0) {
    breakdown.push({
      label: `Candy (${pricing.quantity} × $${pricing.candyUnitPrice.toFixed(2)})`,
      amount: pricing.candyUnitPrice * pricing.quantity,
      type: 'candy'
    });
  }
  
  // Custom message price
  if (pricing.hasCustomMessage && pricing.messageUnitPrice > 0) {
    breakdown.push({
      label: `Custom Message (${pricing.quantity} × $${pricing.messageUnitPrice.toFixed(2)})`,
      amount: pricing.messageUnitPrice * pricing.quantity,
      type: 'message'
    });
  }
  
  // Subtotal
  breakdown.push({
    label: 'Subtotal',
    amount: pricing.subtotal,
    type: 'subtotal',
    isSubtotal: true
  });
  
  // Tax
  breakdown.push({
    label: 'Tax (8.5%)',
    amount: pricing.taxAmount,
    type: 'tax'
  });
  
  // Total
  breakdown.push({
    label: 'Total',
    amount: pricing.totalAmount,
    type: 'total',
    isTotal: true
  });
  
  return breakdown;
}

/**
 * Format currency for display
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

/**
 * Get savings information for bulk orders
 * @param {number} quantity - Number of tins
 * @returns {Object|null} Savings information or null if no savings
 */
export function getBulkSavings(quantity) {
  if (quantity < 3) return null;
  
  const singlePrice = calculateTinSkinzPricing(1, false, false);
  const bulkPrice = calculateTinSkinzPricing(quantity, false, false);
  
  const singleTotal = singlePrice.totalAmount * quantity;
  const bulkTotal = bulkPrice.totalAmount;
  const savings = singleTotal - bulkTotal;
  
  if (savings <= 0) return null;
  
  return {
    savings: Math.round(savings * 100) / 100,
    percentage: Math.round((savings / singleTotal) * 100),
    description: `Save $${savings.toFixed(2)} (${Math.round((savings / singleTotal) * 100)}%) vs individual pricing`
  };
}
