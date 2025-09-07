import { TIN_PRICING, TENT_PRICING } from '../products';

export interface PricingOptions {
  productType: 'banner' | 'tin' | 'tent';
  quantity?: number;
  material?: string;
  finish?: string;
  size?: string;
  surfaceCoverage?: string;
  components?: string;
}

export const calculatePricing = (options: PricingOptions): number => {
  switch (options.productType) {
    case 'tin':
      return calculateTinPricing(options);
    case 'tent':
      return calculateTentPricing(options);
    case 'banner':
      return calculateBannerPricing(options);
    default:
      return 0;
  }
};

const calculateTinPricing = (options: PricingOptions): number => {
  const { quantity, surfaceCoverage, finish } = options;
  
  if (!quantity || !surfaceCoverage || !finish) {
    return 0;
  }

  const quantityKey = quantity.toString();
  const coverageKey = surfaceCoverage as 'front-back' | 'all-sides';
  const finishKey = finish as 'silver' | 'black' | 'gold';

  const pricing = TIN_PRICING[quantityKey as keyof typeof TIN_PRICING];
  if (!pricing) return 0;

  const coveragePricing = pricing[coverageKey];
  if (!coveragePricing) return 0;

  const basePrice = coveragePricing[finishKey];
  if (basePrice === undefined) return 0;

  return basePrice;
};

const calculateTentPricing = (options: PricingOptions): number => {
  const { size, components } = options;
  
  if (!size || !components) {
    return 0;
  }

  const sizeKey = size as '10x10' | '10x20';
  const componentsKey = components as 'tent-only' | 'tent-table-cloth' | 'tent-flag' | 'complete-package';

  const pricing = TENT_PRICING[sizeKey];
  if (!pricing) return 0;

  const price = pricing[componentsKey];
  return price || 0;
};

const calculateBannerPricing = (options: PricingOptions): number => {
  // Banner pricing would be calculated based on size, material, quantity, etc.
  // For now, return a base price
  const basePrice = 25.00;
  const quantity = options.quantity || 1;
  
  // Simple quantity-based pricing
  if (quantity >= 10) {
    return basePrice * quantity * 0.9; // 10% discount for 10+
  } else if (quantity >= 5) {
    return basePrice * quantity * 0.95; // 5% discount for 5+
  }
  
  return basePrice * quantity;
};

export const getPricingBreakdown = (options: PricingOptions): {
  basePrice: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discounts?: Array<{ type: string; amount: number }>;
} => {
  const totalPrice = calculatePricing(options);
  const quantity = options.quantity || 1;
  const unitPrice = totalPrice / quantity;
  
  const breakdown = {
    basePrice: totalPrice,
    quantity,
    unitPrice,
    totalPrice
  };

  // Add discount information for banners
  if (options.productType === 'banner' && quantity >= 5) {
    const basePrice = 25.00 * quantity;
    const discount = basePrice - totalPrice;
    
    if (discount > 0) {
      breakdown.discounts = [{
        type: quantity >= 10 ? 'Bulk Discount (10+ units)' : 'Volume Discount (5+ units)',
        amount: discount
      }];
    }
  }

  return breakdown;
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(price);
};

export const getPriceRange = (options: Omit<PricingOptions, 'quantity'>): {
  min: number;
  max: number;
  minQuantity: number;
  maxQuantity: number;
} => {
  switch (options.productType) {
    case 'tin':
      return {
        min: calculateTinPricing({ ...options, quantity: 100 }),
        max: calculateTinPricing({ ...options, quantity: 500 }),
        minQuantity: 100,
        maxQuantity: 500
      };
    case 'tent':
      return {
        min: calculateTentPricing({ ...options, size: '10x10', components: 'tent-only' }),
        max: calculateTentPricing({ ...options, size: '10x20', components: 'complete-package' }),
        minQuantity: 1,
        maxQuantity: 10
      };
    case 'banner':
      return {
        min: calculateBannerPricing({ ...options, quantity: 1 }),
        max: calculateBannerPricing({ ...options, quantity: 100 }),
        minQuantity: 1,
        maxQuantity: 100
      };
    default:
      return { min: 0, max: 0, minQuantity: 1, maxQuantity: 1 };
  }
};
