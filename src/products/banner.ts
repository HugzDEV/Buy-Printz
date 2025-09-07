import { ProductType, CanvasSize, ProductSpecification } from '../types';

export const BANNER_PRODUCT: ProductType = {
  id: 'banner',
  name: 'Vinyl Banner',
  category: 'Banners',
  description: 'High-quality vinyl banners for outdoor and indoor use',
  defaultSize: { width: 800, height: 400 },
  availableSizes: [
    { width: 600, height: 300 }, // 2ft x 1ft
    { width: 800, height: 400 }, // 2ft x 4ft
    { width: 900, height: 600 }, // 3ft x 2ft
    { width: 1200, height: 600 }, // 4ft x 2ft
    { width: 1200, height: 900 }, // 4ft x 3ft
    { width: 1800, height: 900 }, // 6ft x 3ft
    { width: 2400, height: 1200 }, // 8ft x 4ft
    { width: 3000, height: 1200 }, // 10ft x 4ft
    { width: 3600, height: 1200 }, // 12ft x 4ft
  ],
  specifications: [
    {
      id: 'material',
      name: 'Material',
      type: 'select',
      options: [
        '13oz-vinyl',
        '18oz-blockout',
        'mesh',
        'indoor',
        'pole',
        '9oz-fabric',
        'blockout-fabric',
        'tension-fabric',
        'backlit'
      ],
      defaultValue: '13oz-vinyl',
      required: true
    },
    {
      id: 'finish',
      name: 'Finish',
      type: 'select',
      options: ['matte', 'glossy', 'satin'],
      defaultValue: 'matte',
      required: true
    },
    {
      id: 'sides',
      name: 'Print Sides',
      type: 'select',
      options: ['single', 'double'],
      defaultValue: 'single',
      required: true
    },
    {
      id: 'grommets',
      name: 'Grommets',
      type: 'select',
      options: [
        'every-2ft-all-sides',
        'every-2ft-top-bottom',
        'every-2ft-left-right',
        '4-corners-only',
        'no-grommets'
      ],
      defaultValue: 'every-2ft-all-sides',
      required: false
    },
    {
      id: 'hem',
      name: 'Hem',
      type: 'select',
      options: ['no-hem', 'all-sides'],
      defaultValue: 'all-sides',
      required: false
    },
    {
      id: 'quantity',
      name: 'Quantity',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 100,
      step: 1,
      required: true
    }
  ]
};

export const BANNER_SIZES = {
  '2ft x 1ft': { width: 600, height: 300 },
  '2ft x 4ft': { width: 800, height: 400 },
  '3ft x 2ft': { width: 900, height: 600 },
  '4ft x 2ft': { width: 1200, height: 600 },
  '4ft x 3ft': { width: 1200, height: 900 },
  '6ft x 3ft': { width: 1800, height: 900 },
  '8ft x 4ft': { width: 2400, height: 1200 },
  '10ft x 4ft': { width: 3000, height: 1200 },
  '12ft x 4ft': { width: 3600, height: 1200 },
  'Custom': { width: 800, height: 400 }
};

export const BANNER_MATERIALS = {
  '13oz-vinyl': {
    name: '13oz Vinyl Banner',
    description: 'Our most popular banner - weather resistant',
    uses: ['Outdoor Advertising', 'Events', 'Storefronts']
  },
  '18oz-blockout': {
    name: '18oz Blockout Banner',
    description: 'Premium heavyweight vinyl with complete opacity',
    uses: ['Heavy-duty Outdoor', 'Construction Sites', 'Long-term Use']
  },
  'mesh': {
    name: 'Mesh Banner',
    description: '70/30 mesh allows wind to pass through',
    uses: ['Windy Locations', 'Fencing', 'Construction Barriers']
  },
  'indoor': {
    name: 'Indoor Banner',
    description: 'Cost-effective option for indoor use',
    uses: ['Indoor Displays', 'Trade Shows', 'Retail']
  },
  'pole': {
    name: 'Pole Banner',
    description: 'Ready to install hardware kit included',
    uses: ['Street Poles', 'Lamp Posts', 'Municipal Displays']
  },
  '9oz-fabric': {
    name: '9oz Fabric Banner',
    description: 'Soft fabric material for indoor use',
    uses: ['Indoor Events', 'Conferences', 'Retail Displays']
  }
};
