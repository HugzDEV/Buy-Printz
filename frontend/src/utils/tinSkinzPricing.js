/**
 * Tin Skinz Pricing Utility
 * Handles pricing calculations based on quantity tiers and options
 */

// Pricing tiers based on quantity
const PRICING_TIERS = [
  { min: 1, max: 2, basePrice: 9.99, messagePrice: 0.99 },
  { min: 3, max: 6, basePrice: 8.99, messagePrice: 0.99 },
  { min: 7, max: 10, basePrice: 8.50, messagePrice: 0.99 },
  { min: 11, max: 19, basePrice: 8.00, messagePrice: 0.99 },
  { min: 20, max: 49, basePrice: 6.50, messagePrice: 0.99 },
  { min: 50, max: 74, basePrice: 6.00, messagePrice: 0.50 },
  { min: 75, max: 99, basePrice: 5.50, messagePrice: 0.25 },
  { min: 100, max: 149, basePrice: 5.00, messagePrice: 0.00 }, // Free messaging
  { min: 150, max: 499, basePrice: 4.00, messagePrice: 0.00 }, // Free messaging
  { min: 500, max: 1000, basePrice: 3.50, messagePrice: 0.00 } // Free messaging
];

// Tax rate (6.25% MA state tax)
const TAX_RATE = 0.0625;

// Candy options with base prices
export const CANDY_OPTIONS = [
  { id: 'strawberry-hard-candy', name: 'Strawberry Filled Hard Candy', price: 0.66 },
  { id: 'candy-blocks', name: 'Candy Blocks', price: 0.83 },
  { id: 'jolly-ranchers', name: 'Jolly Ranchers', price: 0.83 },
  { id: 'jawbreakers', name: 'Jawbreakers', price: 0.95 },
  { id: 'peppermint-star-lights', name: 'Peppermint Star Lights', price: 0.66 },
  { id: 'soft-peppermint-puffs', name: 'Soft Peppermint Puffs', price: 0.87 },
  { id: 'cream-savers-strawberry', name: 'Cream Savers Strawberry', price: 1.32 },
  { id: 'fruit-flavored-buttons', name: 'Fruit Flavored Buttons', price: 0.66 },
  { id: 'werthers-original', name: "Werther's Original Hard Candy", price: 2.15 },
  { id: 'hopes-coffee', name: "Hope's Coffee", price: 2.40 },
  { id: 'assorted-starlights', name: 'Assorted Starlights', price: 0.66 },
  { id: 'sour-lemon-balls', name: 'Sour Lemon Balls', price: 1.20 },
  { id: 'spearmint-balls', name: 'Spearmint Balls', price: 0.66 },
  { id: 'fruit-barrels', name: 'Fruit Barrels', price: 0.66 },
  { id: 'bananarama', name: 'Bananarama', price: 0.92 },
  { id: 'hersheys', name: "Hershey's", price: 1.65 },
  { id: 'jordan-almonds', name: 'Jordan Almonds', price: 2.25 },
  { id: 'blue-mms', name: 'Blue M&Ms', price: 3.00 },
  { id: 'hersheys-kisses-pink', name: "Hershey's Kisses Pink", price: 3.00 },
  { id: 'pink-mms', name: 'Pink M&Ms', price: 3.00 }
];

// Candy discount tiers
const CANDY_DISCOUNT_TIERS = [
  { min: 1, max: 19, discount: 0 }, // No discount
  { min: 20, max: 49, discount: 0.10 }, // 10% off
  { min: 50, max: 74, discount: 0.15 }, // 15% off
  { min: 75, max: 99, discount: 0.175 }, // 17.5% off
  { min: 100, max: 149, discount: 0.20 }, // 20% off
  { min: 150, max: 499, discount: 0.225 }, // 22.5% off
  { min: 500, max: 1000, discount: 0.30 } // 30% off
];

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
  const candyUnitPrice = 0; // Candy pricing handled separately in checkout
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
  
  if (tier.max === 1000) {
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
    label: 'Tax (6.25%)',
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
 * Calculate candy pricing with bulk discounts
 * @param {string} candyId - ID of the selected candy
 * @param {number} quantity - Number of tins
 * @returns {Object} Candy pricing information
 */
export function calculateCandyPricing(candyId, quantity) {
  const candy = CANDY_OPTIONS.find(c => c.id === candyId);
  if (!candy) {
    return { unitPrice: 0, totalPrice: 0, discount: 0, discountPercent: 0 };
  }

  // Find the appropriate discount tier
  const discountTier = CANDY_DISCOUNT_TIERS.find(tier => 
    quantity >= tier.min && quantity <= tier.max
  );

  const discount = discountTier ? discountTier.discount : 0;
  const unitPrice = candy.price * (1 - discount);
  const totalPrice = unitPrice * quantity;

  return {
    unitPrice: Math.round(unitPrice * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
    discount: Math.round((candy.price - unitPrice) * 100) / 100,
    discountPercent: Math.round(discount * 100),
    originalPrice: candy.price
  };
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
