// Product definitions and exports
export { BANNER_PRODUCT, BANNER_SIZES, BANNER_MATERIALS } from './banner';
export { 
  BUSINESS_CARD_TIN_PRODUCT, 
  TIN_SURFACES, 
  TIN_PRICING, 
  TIN_FINISHES, 
  PRINTING_METHODS 
} from './tin';
export { 
  TRADESHOW_TENT_PRODUCT, 
  TENT_COMPONENTS, 
  TENT_SIZES, 
  TENT_MATERIALS, 
  TENT_PRICING 
} from './tent';

import { ProductType } from '../types';
import { BANNER_PRODUCT } from './banner';
import { BUSINESS_CARD_TIN_PRODUCT } from './tin';
import { TRADESHOW_TENT_PRODUCT } from './tent';

export const PRODUCTS: Record<string, ProductType> = {
  banner: BANNER_PRODUCT,
  'business-card-tin': BUSINESS_CARD_TIN_PRODUCT,
  'tradeshow-tent': TRADESHOW_TENT_PRODUCT
};

export const getProduct = (productId: string): ProductType | undefined => {
  return PRODUCTS[productId];
};

export const getAllProducts = (): ProductType[] => {
  return Object.values(PRODUCTS);
};

export const getProductsByCategory = (category: string): ProductType[] => {
  return Object.values(PRODUCTS).filter(product => product.category === category);
};
