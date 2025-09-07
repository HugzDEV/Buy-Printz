import { TinProduct, TinSurface, CanvasSize } from '../types';

export const TIN_SURFACES: TinSurface[] = [
  {
    id: 'front',
    name: 'Front',
    dimensions: { width: 350, height: 250 }, // 3.5" x 2.5" in pixels at 100 DPI
    required: true
  },
  {
    id: 'back',
    name: 'Back',
    dimensions: { width: 350, height: 250 },
    required: true
  },
  {
    id: 'inside',
    name: 'Inside',
    dimensions: { width: 350, height: 250 },
    required: false
  },
  {
    id: 'lid',
    name: 'Lid',
    dimensions: { width: 350, height: 250 },
    required: false
  }
];

export const BUSINESS_CARD_TIN_PRODUCT: TinProduct = {
  id: 'business-card-tin',
  name: 'Business Card Tin',
  category: 'Business Cards',
  description: 'Premium aluminum business card tins with custom vinyl stickers',
  defaultSize: { width: 350, height: 250 },
  availableSizes: [
    { width: 350, height: 250 }, // Standard tin
    { width: 400, height: 300 }  // Premium tin
  ],
  surfaces: TIN_SURFACES,
  quantities: [100, 250, 500],
  finishes: ['silver', 'black', 'gold'],
  printingMethods: ['premium-vinyl', 'premium-clear-vinyl'],
  specifications: [
    {
      id: 'quantity',
      name: 'Quantity',
      type: 'select',
      options: ['100', '250', '500'],
      defaultValue: '100',
      required: true
    },
    {
      id: 'surface-coverage',
      name: 'Surface Coverage',
      type: 'select',
      options: ['front-back', 'all-sides'],
      defaultValue: 'front-back',
      required: true
    },
    {
      id: 'tin-finish',
      name: 'Tin Finish',
      type: 'select',
      options: ['silver', 'black', 'gold'],
      defaultValue: 'silver',
      required: true
    },
    {
      id: 'printing-method',
      name: 'Printing Method',
      type: 'select',
      options: ['premium-vinyl', 'premium-clear-vinyl'],
      defaultValue: 'premium-vinyl',
      required: true
    }
  ]
};

export const TIN_PRICING = {
  '100': {
    'front-back': {
      'silver': 399.99,
      'black': 400.24,
      'gold': 400.49
    },
    'all-sides': {
      'silver': 499.99,
      'black': 500.24,
      'gold': 500.49
    }
  },
  '250': {
    'front-back': {
      'silver': 749.99,
      'black': 750.24,
      'gold': 750.49
    },
    'all-sides': {
      'silver': 849.99,
      'black': 850.24,
      'gold': 850.49
    }
  },
  '500': {
    'front-back': {
      'silver': 1000.00,
      'black': 1000.25,
      'gold': 1000.50
    },
    'all-sides': {
      'silver': 1100.00,
      'black': 1100.25,
      'gold': 1100.50
    }
  }
};

export const TIN_FINISHES = {
  'silver': {
    name: 'Silver',
    description: 'Classic silver aluminum finish',
    priceModifier: 0.00
  },
  'black': {
    name: 'Black',
    description: 'Sleek black aluminum finish',
    priceModifier: 0.25
  },
  'gold': {
    name: 'Gold',
    description: 'Premium gold aluminum finish',
    priceModifier: 0.50
  }
};

export const PRINTING_METHODS = {
  'premium-vinyl': {
    name: 'Premium Vinyl Stickers',
    description: 'High-quality vinyl stickers for tin application',
    dpi: 300,
    colorMode: 'CMYK'
  },
  'premium-clear-vinyl': {
    name: 'Premium Clear Vinyl Stickers',
    description: 'Clear vinyl stickers for transparent effect',
    dpi: 300,
    colorMode: 'CMYK'
  }
};
