import { TentProduct, TentComponent, CanvasSize } from '../types';

export const TENT_COMPONENTS: TentComponent[] = [
  {
    id: 'tent',
    name: 'Tent',
    dimensions: { width: 1200, height: 1200 }, // 10x10 ft in pixels at 120 DPI
    required: true
  },
  {
    id: 'table-cloth',
    name: 'Table Cloth',
    dimensions: { width: 1200, height: 600 }, // 10x5 ft
    required: false
  },
  {
    id: 'flag',
    name: 'Flag',
    dimensions: { width: 600, height: 1200 }, // 5x10 ft
    required: false
  }
];

export const TRADESHOW_TENT_PRODUCT: TentProduct = {
  id: 'tradeshow-tent',
  name: 'Tradeshow Tent',
  category: 'Tradeshow',
  description: 'Professional tradeshow tents with custom graphics',
  defaultSize: { width: 1200, height: 1200 },
  availableSizes: [
    { width: 1200, height: 1200 }, // 10x10 ft
    { width: 2400, height: 1200 }  // 10x20 ft
  ],
  components: TENT_COMPONENTS,
  sizes: ['10x10', '10x20'],
  materials: ['vinyl', 'mesh', 'fabric'],
  finishes: ['matte', 'glossy'],
  specifications: [
    {
      id: 'size',
      name: 'Tent Size',
      type: 'select',
      options: ['10x10', '10x20'],
      defaultValue: '10x10',
      required: true
    },
    {
      id: 'material',
      name: 'Material',
      type: 'select',
      options: ['vinyl', 'mesh', 'fabric'],
      defaultValue: 'vinyl',
      required: true
    },
    {
      id: 'finish',
      name: 'Finish',
      type: 'select',
      options: ['matte', 'glossy'],
      defaultValue: 'matte',
      required: true
    },
    {
      id: 'components',
      name: 'Components',
      type: 'select',
      options: ['tent-only', 'tent-table-cloth', 'tent-flag', 'complete-package'],
      defaultValue: 'complete-package',
      required: true
    },
    {
      id: 'quantity',
      name: 'Quantity',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 10,
      step: 1,
      required: true
    }
  ]
};

export const TENT_SIZES = {
  '10x10': {
    name: '10x10 Tradeshow Tent',
    dimensions: { width: 1200, height: 1200 },
    description: 'Standard 10x10 foot tradeshow tent'
  },
  '10x20': {
    name: '10x20 Tradeshow Tent',
    dimensions: { width: 2400, height: 1200 },
    description: 'Large 10x20 foot tradeshow tent'
  }
};

export const TENT_MATERIALS = {
  'vinyl': {
    name: 'Vinyl',
    description: 'Durable vinyl material for outdoor use',
    uses: ['Outdoor Events', 'Trade Shows', 'Festivals']
  },
  'mesh': {
    name: 'Mesh',
    description: 'Breathable mesh material for windy conditions',
    uses: ['Windy Locations', 'Outdoor Events', 'Construction Sites']
  },
  'fabric': {
    name: 'Fabric',
    description: 'Soft fabric material for indoor use',
    uses: ['Indoor Events', 'Conferences', 'Exhibitions']
  }
};

export const TENT_PRICING = {
  '10x10': {
    'tent-only': 199.99,
    'tent-table-cloth': 249.99,
    'tent-flag': 229.99,
    'complete-package': 299.99
  },
  '10x20': {
    'tent-only': 399.99,
    'tent-table-cloth': 449.99,
    'tent-flag': 429.99,
    'complete-package': 499.99
  }
};
