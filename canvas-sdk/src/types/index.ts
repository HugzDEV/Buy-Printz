// Core Types for BuyPrintz Canvas SDK

export interface CanvasSize {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Element {
  id: string;
  type: 'text' | 'image' | 'rect' | 'circle' | 'line' | 'star' | 'polygon';
  x: number;
  y: number;
  width: number;
  height: number | 'auto';
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  draggable: boolean;
  selectable: boolean;
  // Text specific properties
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontStyle?: 'normal' | 'bold' | 'italic';
  textDecoration?: 'none' | 'underline' | 'line-through';
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  align?: 'left' | 'center' | 'right';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  lineHeight?: number;
  letterSpacing?: number;
  padding?: number;
  wrap?: 'word' | 'char' | 'none';
  // Shape specific properties
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  cornerRadius?: number;
  // Image specific properties
  src?: string;
  // Star specific properties
  innerRadius?: number;
  outerRadius?: number;
  numPoints?: number;
  // Line specific properties
  points?: number[];
  // Polygon specific properties
  sides?: number;
  radius?: number;
}

export interface CanvasData {
  elements: Element[];
  canvasSize: CanvasSize;
  backgroundColor: string;
  selectedId?: string;
  selectedIds?: string[];
}

export interface ProductType {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultSize: CanvasSize;
  availableSizes: CanvasSize[];
  specifications: ProductSpecification[];
}

export interface ProductSpecification {
  id: string;
  name: string;
  type: 'select' | 'number' | 'boolean' | 'color';
  options?: string[];
  defaultValue: any;
  min?: number;
  max?: number;
  step?: number;
  required: boolean;
}

export interface TinSurface {
  id: 'front' | 'back' | 'inside' | 'lid';
  name: string;
  dimensions: CanvasSize;
  required: boolean;
}

export interface TinProduct extends ProductType {
  surfaces: TinSurface[];
  quantities: number[];
  finishes: string[];
  printingMethods: string[];
}

export interface TentComponent {
  id: 'tent' | 'table-cloth' | 'flag';
  name: string;
  dimensions: CanvasSize;
  required: boolean;
}

export interface TentProduct extends ProductType {
  components: TentComponent[];
  sizes: string[];
  materials: string[];
  finishes: string[];
}

export interface CanvasEditorConfig {
  productType: 'banner' | 'tin' | 'tent';
  canvasSize: CanvasSize;
  backgroundColor?: string;
  onSave?: (design: CanvasData) => void;
  onExport?: (design: CanvasData) => void;
  onElementSelect?: (element: Element) => void;
  onElementChange?: (element: Element) => void;
  readOnly?: boolean;
  showGrid?: boolean;
  showGuides?: boolean;
}

export interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  thumbnail: string;
  canvasData: CanvasData;
  productType: string;
  tags: string[];
  isPublic: boolean;
}

export interface ExportOptions {
  format: 'png' | 'jpg' | 'pdf' | 'svg';
  quality?: number;
  scale?: number;
  backgroundColor?: string;
}

export interface PrintSpecification {
  dpi: number;
  colorMode: 'RGB' | 'CMYK';
  bleed: number;
  safeArea: number;
  minResolution: number;
  maxResolution: number;
}
