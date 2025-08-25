import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer, Line as KonvaLine, Circle, Star, RegularPolygon, Arrow, Path } from 'react-konva'
import jsPDF from 'jspdf'
import { 
  Type, 
  Image as ImageIcon, 
  Square, 
  Circle as CircleIcon,
  Triangle,
  Star as StarIcon,
  Download, 
  Upload, 
  Palette, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  RotateCw,
  Copy,
  Clipboard,
  Trash2,
  Layers,
  ZoomIn,
  ZoomOut,
  Move,
  Save,
  ShoppingCart,
  Undo,
  Redo,
  Grid,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  Info,
  Minus,
  Plus,
  CornerDownRight,
  MousePointer,
  Pen,
  Brush,
  Eraser,
  Crop,
  Filter,
  Sun,
  Moon,
  Zap,
  Heart,
  Award,
  Shield,
  Clock,
  Mail,
  Phone,
  MapPin,
  Globe,
  Camera,
  Music,
  Video,
  Coffee,
  Car,
  Home,
  Briefcase,
  ShoppingBag,
  Gift,
  Tag,
  TrendingUp,
  Users,
  Settings,
  FileText,
  Layout,
  PaintBucket,
  Maximize,
  Minimize,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Battery,
  Bluetooth,
  Printer,
  Monitor,
  Smartphone,
  Tablet,
  Laptop
} from 'lucide-react'
import { useDropzone } from 'react-dropzone'

import authService from '../services/auth'
import canvasStateService from '../services/canvasState'


const BannerEditor = () => {
  const navigate = useNavigate()
  const stageRef = useRef()
  const transformerRef = useRef()
  
  // Fixed workspace size - different templates for each orientation
  const LANDSCAPE_WIDTH = 1600
  const LANDSCAPE_HEIGHT = 800
  const PORTRAIT_WIDTH = 800
  const PORTRAIT_HEIGHT = 1600
  
  // Mobile responsive workspace dimensions
  const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight })
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 640)
  
  // Get responsive canvas dimensions based on screen size
  const getResponsiveCanvasDimensions = () => {
    const isMobile = window.innerWidth < 640
    const isTablet = window.innerWidth < 1024
    
    if (orientation === 'portrait') {
      if (isMobile) {
        return { width: 320, height: 640 } // Mobile portrait - fit screen
      } else if (isTablet) {
        return { width: 400, height: 800 } // Tablet portrait
      }
      return { width: PORTRAIT_WIDTH, height: PORTRAIT_HEIGHT } // Desktop
    } else {
      if (isMobile) {
        return { width: 320, height: 160 } // Mobile landscape - very compact
      } else if (isTablet) {
        return { width: 600, height: 300 } // Tablet landscape
      }
      return { width: LANDSCAPE_WIDTH, height: LANDSCAPE_HEIGHT } // Desktop
    }
  }
  
  // Canvas settings - size based on orientation and screen size
  const [canvasSize, setCanvasSize] = useState(() => getResponsiveCanvasDimensions()) 
  const [scale, setScale] = useState(1) // Start with 100% scale, let responsive sizing handle fit
  
 
  const [selectedId, setSelectedId] = useState(null)
  const [elements, setElements] = useState([])
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [showGrid, setShowGrid] = useState(true)
  const [uploadQuality, setUploadQuality] = useState(null)
  const [copiedElement, setCopiedElement] = useState(null)
  const [activeTab, setActiveTab] = useState('tools')
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false)
  const [selectedBannerType, setSelectedBannerType] = useState('vinyl-13oz')
  const [selectedBannerSize, setSelectedBannerSize] = useState('2ft x 4ft')
  
  // Custom dimensions state
  const [useCustomSize, setUseCustomSize] = useState(false)
  const [customWidth, setCustomWidth] = useState(2)
  const [customHeight, setCustomHeight] = useState(4)
  const [orientation, setOrientation] = useState('landscape') // 'landscape' or 'portrait'
  
  // Ref to track canvas resizing state
  const isResizingRef = useRef(false)
  const isRotatingRef = useRef(false)
  const isInitialLoadRef = useRef(true)

  // Preset banner sizes (dimensions only)
  const presetSizes = [
    { name: '2ft x 4ft', width: 2, height: 4 },
    { name: '3ft x 6ft', width: 3, height: 6 },
    { name: '4ft x 8ft', width: 4, height: 8 },
    { name: '5ft x 10ft', width: 5, height: 10 },
    { name: '6ft x 3ft', width: 6, height: 3 },
    { name: '8ft x 4ft', width: 8, height: 4 },
    { name: '10ft x 3ft', width: 10, height: 3 },
    { name: '12ft x 4ft', width: 12, height: 4 }
  ]

  // Buy Printz Professional Banner Types
  const bannerTypes = [
    {
      id: 'vinyl-13oz',
      name: '13oz. Vinyl Banner',
      category: 'Vinyl Banners',
      material: '13oz Vinyl',
      finish: 'Matte',
      specs: 'Our most popular banner',
      description: 'Weather resistant, 4-color process',
      uses: ['Outdoor Advertising', 'Events', 'Storefronts']
    },
    {
      id: 'vinyl-18oz',
      name: '18oz. Blockout Banner',
      category: 'Vinyl Banners',
      material: '18oz Blockout Vinyl',
      finish: 'Blockout',
      specs: 'Our most durable banner',
      description: 'Premium heavyweight vinyl with complete opacity',
      uses: ['Heavy-duty Outdoor', 'Construction Sites', 'Long-term Use']
    },
    {
      id: 'mesh',
      name: 'Mesh Banner',
      category: 'Mesh Banners',
      material: 'Mesh Vinyl',
      finish: 'Perforated',
      specs: 'Best option for windy conditions',
      description: '70/30 mesh allows wind to pass through',
      uses: ['Windy Locations', 'Fencing', 'Construction Barriers']
    },
    {
      id: 'indoor',
      name: 'Indoor Banner',
      category: 'Indoor Banners',
      material: 'Indoor Vinyl',
      finish: 'Smooth',
      specs: 'Fast and smooth surface (UV)',
      description: 'Cost-effective option for indoor use',
      uses: ['Indoor Displays', 'Trade Shows', 'Retail']
    },
    {
      id: 'pole',
      name: 'Pole Banner',
      category: 'Pole Banners',
      material: '13oz Vinyl',
      finish: 'Reinforced',
      specs: 'Durable 13 oz banners',
      description: 'Ready to install hardware kit included',
      uses: ['Street Poles', 'Lamp Posts', 'Municipal Displays']
    },
    {
      id: 'fabric-9oz',
      name: '9oz. Fabric Banner',
      category: 'Fabric Banners',
      material: '9oz Polyester Fabric',
      finish: 'Fabric Weave',
      specs: 'Dye sublimation print',
      description: 'Wrinkle resistant and washable',
      uses: ['Premium Indoor', 'Trade Shows', 'Events']
    },
    {
      id: 'fabric-blockout',
      name: 'Blockout Fabric Banner',
      category: 'Fabric Banners',
      material: 'Blockout Fabric',
      finish: 'Opaque Fabric',
      specs: 'Dye sublimation print',
      description: 'Wrinkle resistant and washable with complete opacity',
      uses: ['Double-sided Displays', 'Premium Indoor Signage']
    },
    {
      id: 'fabric-tension',
      name: 'Tension Fabric Banner',
      category: 'Fabric Banners',
      material: 'Tension Fabric',
      finish: 'Stretch Fabric',
      specs: 'Dye sublimation print',
      description: 'Stretch material for wraps, wrinkle resistant',
      uses: ['Trade Show Displays', 'Premium Presentations']
    },
    {
      id: 'backlit',
      name: 'Backlit Banner',
      category: 'Specialty Banners',
      material: 'Translucent Vinyl',
      finish: 'Backlit Compatible',
      specs: '13 oz translucent vinyl for backlight',
      description: 'Specially designed for backlighting applications',
      uses: ['Light Boxes', 'Illuminated Signage', 'Displays']
    }
  ]

  const bannerSizes = {
    'vinyl-13oz': [
      { name: '2ft x 4ft', width: 2400, height: 1200, price: 45.00 },
      { name: '3ft x 6ft', width: 3600, height: 1800, price: 68.00 },
      { name: '4ft x 8ft', width: 4800, height: 2400, price: 95.00 },
      { name: '5ft x 10ft', width: 6000, height: 3000, price: 125.00 }
    ],
    'vinyl-18oz': [
      { name: '2ft x 4ft', width: 2400, height: 1200, price: 58.00 },
      { name: '3ft x 6ft', width: 3600, height: 1800, price: 85.00 },
      { name: '4ft x 8ft', width: 4800, height: 2400, price: 115.00 }
    ],
    'mesh': [
      { name: '2ft x 4ft', width: 2400, height: 1200, price: 52.00 },
      { name: '3ft x 6ft', width: 3600, height: 1800, price: 78.00 },
      { name: '4ft x 8ft', width: 4800, height: 2400, price: 110.00 }
    ],
    'indoor': [
      { name: '2ft x 4ft', width: 2400, height: 1200, price: 38.00 },
      { name: '3ft x 6ft', width: 3600, height: 1800, price: 55.00 },
      { name: '4ft x 8ft', width: 4800, height: 2400, price: 78.00 }
    ],
    'pole': [
      { name: '30" x 60"', width: 900, height: 1800, price: 95.00 },
      { name: '30" x 84"', width: 900, height: 2520, price: 115.00 },
      { name: '30" x 100"', width: 900, height: 3000, price: 125.00 }
    ],
    'fabric-9oz': [
      { name: '2ft x 4ft', width: 2400, height: 1200, price: 68.00 },
      { name: '3ft x 6ft', width: 3600, height: 1800, price: 95.00 }
    ],
    'fabric-blockout': [
      { name: '2ft x 4ft', width: 2400, height: 1200, price: 78.00 },
      { name: '3ft x 6ft', width: 3600, height: 1800, price: 110.00 }
    ],
    'fabric-tension': [
      { name: '2ft x 4ft', width: 2400, height: 1200, price: 89.00 },
      { name: '3ft x 6ft', width: 3600, height: 1800, price: 125.00 }
    ],
    'backlit': [
      { name: '2ft x 4ft', width: 2400, height: 1200, price: 95.00 },
      { name: '3ft x 6ft', width: 3600, height: 1800, price: 135.00 }
    ]
  }

  // Legacy banner presets for compatibility
  const bannerPresets = [
    // 13oz Vinyl Banner - Most Popular (Multiple Sizes)
    {
      name: '13oz. Vinyl Banner - 2ft x 4ft',
      category: 'Vinyl Banners',
      width: 2400, height: 1200,
      printSize: '2ft x 4ft',
      price: 45.00,
      specs: 'Our most popular banner',
      material: '13oz Vinyl',
      finish: 'Matte',
      uses: ['Outdoor Advertising', 'Events', 'Storefronts'],
      description: 'Weather resistant, 4-color process'
    },
    {
      name: '13oz. Vinyl Banner - 3ft x 6ft',
      category: 'Vinyl Banners',
      width: 3600, height: 1800,
      printSize: '3ft x 6ft',
      price: 68.00,
      specs: 'Our most popular banner',
      material: '13oz Vinyl',
      finish: 'Matte',
      uses: ['Large Outdoor Displays', 'Grand Openings'],
      description: 'Weather resistant, 4-color process'
    },
    {
      name: '13oz. Vinyl Banner - 4ft x 8ft',
      category: 'Vinyl Banners',
      width: 4800, height: 2400,
      printSize: '4ft x 8ft',
      price: 95.00,
      specs: 'Our most popular banner',
      material: '13oz Vinyl',
      finish: 'Matte',
      uses: ['Building Signage', 'Large Promotions'],
      description: 'Weather resistant, 4-color process'
    },
    // 18oz Blockout Banner - Most Durable  
    {
      name: '18oz. Blockout Banner',
      category: 'Vinyl Banners',
      width: 2400, height: 1200,
      printSize: '2ft x 4ft',
      price: 58.00,
      specs: 'Our most durable banner',
      material: '18oz Blockout Vinyl',
      finish: 'Blockout',
      uses: ['Heavy-duty Outdoor', 'Construction Sites', 'Long-term Use'],
      description: 'Premium heavyweight vinyl with complete opacity'
    },
    // Mesh Banner - Wind Resistant (Multiple Sizes)
    {
      name: 'Mesh Banner - 2ft x 4ft',
      category: 'Mesh Banners',
      width: 2400, height: 1200,
      printSize: '2ft x 4ft',
      price: 52.00,
      specs: 'Best option for windy conditions',
      material: 'Mesh Vinyl',
      finish: 'Perforated',
      uses: ['Windy Locations', 'Fencing', 'Construction Barriers'],
      description: '70/30 mesh allows wind to pass through'
    },
    {
      name: 'Mesh Banner - 4ft x 8ft',
      category: 'Mesh Banners',
      width: 4800, height: 2400,
      printSize: '4ft x 8ft',
      price: 110.00,
      specs: 'Best option for windy conditions',
      material: 'Mesh Vinyl',
      finish: 'Perforated',
      uses: ['Large Fencing', 'Construction Sites', 'Building Wraps'],
      description: '70/30 mesh allows wind to pass through'
    },
    // Indoor Banner - Fast & Smooth
    {
      name: 'Indoor Banner',
      category: 'Indoor Banners',
      width: 2400, height: 1200,
      printSize: '2ft x 4ft',
      price: 38.00,
      specs: 'Fast and smooth surface (UV)',
      material: 'Indoor Vinyl',
      finish: 'Smooth',
      uses: ['Indoor Displays', 'Trade Shows', 'Retail'],
      description: 'Cost-effective option for indoor use'
    },
    // Pole Banner - Street Display
    {
      name: 'Pole Banner',
      category: 'Pole Banners',
      width: 900, height: 3000,
      printSize: '30" x 100"',
      price: 125.00,
      specs: 'Durable 13 oz banners',
      material: '13oz Vinyl',
      finish: 'Reinforced',
      uses: ['Street Poles', 'Lamp Posts', 'Municipal Displays'],
      description: 'Ready to install hardware kit included'
    },
    // 9oz Fabric Banner - Premium Feel
    {
      name: '9oz. Fabric Banner',
      category: 'Fabric Banners',
      width: 2400, height: 1200,
      printSize: '2ft x 4ft',
      price: 68.00,
      specs: 'Dye sublimation print',
      material: '9oz Polyester Fabric',
      finish: 'Fabric Weave',
      uses: ['Premium Indoor', 'Trade Shows', 'Events'],
      description: 'Wrinkle resistant and washable'
    },
    // Blockout Fabric Banner - Double-sided
    {
      name: 'Blockout Fabric Banner',
      category: 'Fabric Banners',
      width: 2400, height: 1200,
      printSize: '2ft x 4ft',
      price: 78.00,
      specs: 'Dye sublimation print',
      material: 'Blockout Fabric',
      finish: 'Opaque Fabric',
      uses: ['Double-sided Displays', 'Premium Indoor Signage'],
      description: 'Wrinkle resistant and washable with complete opacity'
    },
    // Tension Fabric Banner - Stretch Material
    {
      name: 'Tension Fabric Banner',
      category: 'Fabric Banners',
      width: 2400, height: 1200,
      printSize: '2ft x 4ft',
      price: 89.00,
      specs: 'Dye sublimation print',
      material: 'Tension Fabric',
      finish: 'Stretch Fabric',
      uses: ['Trade Show Displays', 'Premium Presentations'],
      description: 'Stretch material for wraps, wrinkle resistant'
    },
    // Backlit Banner - Illuminated Displays
    {
      name: 'Backlit Banner',
      category: 'Specialty Banners',
      width: 2400, height: 1200,
      printSize: '2ft x 4ft',
      price: 95.00,
      specs: '13 oz translucent vinyl for backlight',
      material: 'Translucent Vinyl',
      finish: 'Backlit Compatible',
      uses: ['Light Boxes', 'Illuminated Signage', 'Displays'],
      description: 'Specially designed for backlighting applications'
    }
  ]

  // Professional Banner Templates Library
  const bannerTemplates = [
    // Business Grand Opening
    {
      id: 'grand-opening-burst',
      name: 'Grand Opening - Burst',
      category: 'Business Events',
      description: 'Eye-catching design with starburst background',
      tags: ['grand opening', 'business', 'celebration'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 1200,
          fill: '#1e3a8a'
        },
        {
          id: 'star-burst',
          type: 'star',
          x: 1200, y: 600,
          numPoints: 16,
          innerRadius: 200,
          outerRadius: 400,
          fill: '#fbbf24',
          strokeWidth: 8,
          stroke: '#f59e0b'
        },
        {
          id: 'title',
          type: 'text',
          x: 1200, y: 480,
          text: 'GRAND OPENING',
          fontSize: 88,
          fontFamily: 'Impact',
          fill: '#ffffff',
          align: 'center',
          strokeWidth: 4,
          stroke: '#1e3a8a'
        },
        {
          id: 'subtitle',
          type: 'text',
          x: 1200, y: 720,
          text: 'NOW OPEN!',
          fontSize: 64,
          fontFamily: 'Arial Black',
          fill: '#dc2626',
          align: 'center',
          strokeWidth: 3,
          stroke: '#ffffff'
        }
      ]
    },

    // Retail Sale
    {
      id: 'mega-sale-red',
      name: 'Mega Sale - Red Alert',
      category: 'Retail Sales',
      description: 'High-impact red design for maximum attention',
      tags: ['sale', 'discount', 'retail', 'urgent'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 1200,
          fill: '#dc2626'
        },
        {
          id: 'accent-shape',
          type: 'rect',
          x: 0, y: 0,
          width: 600, height: 1200,
          fill: '#991b1b'
        },
        {
          id: 'sale-text',
          type: 'text',
          x: 1500, y: 300,
          text: 'MEGA SALE',
          fontSize: 120,
          fontFamily: 'Impact',
          fill: '#ffffff',
          align: 'center',
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,0.5)',
          shadowOffsetY: 5
        },
        {
          id: 'discount',
          type: 'text',
          x: 1500, y: 500,
          text: 'UP TO 70% OFF',
          fontSize: 80,
          fontFamily: 'Arial Black',
          fill: '#fbbf24',
          align: 'center',
          strokeWidth: 3,
          stroke: '#dc2626'
        },
        {
          id: 'dates',
          type: 'text',
          x: 1500, y: 650,
          text: 'JUNE 15-30',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: 'limited',
          type: 'text',
          x: 1500, y: 750,
          text: 'LIMITED TIME ONLY!',
          fontSize: 36,
          fontFamily: 'Arial Black',
          fill: '#fbbf24',
          align: 'center'
        }
      ]
    },

    // Real Estate Professional
    {
      id: 'real-estate-modern',
      name: 'Real Estate - Modern Blue',
      category: 'Real Estate',
      description: 'Professional design for property listings',
      tags: ['real estate', 'for sale', 'professional', 'contact'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 1200,
          fill: '#1e40af'
        },
        {
          id: 'white-section',
          type: 'rect',
          x: 200, y: 200,
          width: 2000, height: 800,
          fill: '#ffffff'
        },
        {
          id: 'for-sale',
          type: 'text',
          x: 1200, y: 400,
          text: 'FOR SALE',
          fontSize: 96,
          fontFamily: 'Arial Black',
          fill: '#1e40af',
          align: 'center'
        },
        {
          id: 'house-icon',
          type: 'text',
          x: 800, y: 600,
          text: '🏠',
          fontSize: 120,
          align: 'center'
        },
        {
          id: 'contact',
          type: 'text',
          x: 1600, y: 600,
          text: 'CALL TODAY\n(555) 123-4567',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: '#1e40af',
          align: 'center',
          lineHeight: 1.2
        }
      ]
    },

    // Restaurant Special
    {
      id: 'restaurant-special',
      name: 'Restaurant Special',
      category: 'Food & Dining',
      description: 'Appetizing design for restaurant promotions',
      tags: ['restaurant', 'food', 'special', 'dining'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 1200,
          fill: '#7c2d12'
        },
        {
          id: 'top-section',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 300,
          fill: '#fbbf24'
        },
        {
          id: 'main-text',
          type: 'text',
          x: 1200, y: 150,
          text: 'DAILY SPECIAL',
          fontSize: 72,
          fontFamily: 'Impact',
          fill: '#7c2d12',
          align: 'center'
        },
        {
          id: 'food-emoji',
          type: 'text',
          x: 600, y: 650,
          text: '🍕',
          fontSize: 200,
          align: 'center'
        },
        {
          id: 'description',
          type: 'text',
          x: 1600, y: 550,
          text: 'WOOD FIRED PIZZA\n$12.99',
          fontSize: 64,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          lineHeight: 1.3
        },
        {
          id: 'hours',
          type: 'text',
          x: 1200, y: 950,
          text: 'Available 11AM - 9PM Daily',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center'
        }
      ]
    },

    // Construction/Contractor
    {
      id: 'construction-professional',
      name: 'Construction Pro',
      category: 'Construction',
      description: 'Bold design for construction companies',
      tags: ['construction', 'contractor', 'professional', 'services'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 1200,
          fill: '#f97316'
        },
        {
          id: 'diagonal-stripe',
          type: 'rect',
          x: 0, y: 800,
          width: 2400, height: 400,
          fill: '#1f2937',
          rotation: -15
        },
        {
          id: 'company-name',
          type: 'text',
          x: 1200, y: 300,
          text: 'ABC CONSTRUCTION',
          fontSize: 88,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          strokeWidth: 4,
          stroke: '#1f2937'
        },
        {
          id: 'services',
          type: 'text',
          x: 1200, y: 500,
          text: 'RESIDENTIAL • COMMERCIAL',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: '#1f2937',
          align: 'center',
          fontWeight: 'bold'
        },
        {
          id: 'phone',
          type: 'text',
          x: 1200, y: 650,
          text: '📞 (555) BUILD-NOW',
          fontSize: 56,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: 'licensed',
          type: 'text',
          x: 1200, y: 800,
          text: 'Licensed • Bonded • Insured',
          fontSize: 32,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center'
        }
      ]
    },

    // Auto Dealership
    {
      id: 'auto-dealership',
      name: 'Auto Dealership Sale',
      category: 'Automotive',
      description: 'Dynamic design for car sales events',
      tags: ['auto', 'cars', 'dealership', 'sale'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 1200,
          fill: '#1f2937'
        },
        {
          id: 'accent-bar',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 200,
          fill: '#dc2626'
        },
        {
          id: 'main-text',
          type: 'text',
          x: 1200, y: 100,
          text: 'YEAR-END CLEARANCE',
          fontSize: 64,
          fontFamily: 'Impact',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: 'car-emoji',
          type: 'text',
          x: 600, y: 650,
          text: '🚗',
          fontSize: 240,
          align: 'center'
        },
        {
          id: 'offer',
          type: 'text',
          x: 1600, y: 500,
          text: '0% APR\nFINANCING',
          fontSize: 72,
          fontFamily: 'Arial Black',
          fill: '#dc2626',
          align: 'center',
          lineHeight: 1.2,
          strokeWidth: 2,
          stroke: '#ffffff'
        },
        {
          id: 'details',
          type: 'text',
          x: 1600, y: 750,
          text: 'Up to 60 Months\nQualified Buyers',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          lineHeight: 1.3
        }
      ]
    },

    // Medical/Healthcare
    {
      id: 'medical-clinic',
      name: 'Medical Clinic',
      category: 'Healthcare',
      description: 'Clean, professional healthcare design',
      tags: ['medical', 'healthcare', 'clinic', 'professional'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 1200,
          fill: '#ffffff'
        },
        {
          id: 'header-bar',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 250,
          fill: '#1e40af'
        },
        {
          id: 'clinic-name',
          type: 'text',
          x: 1200, y: 125,
          text: 'FAMILY MEDICAL CENTER',
          fontSize: 72,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          fontWeight: 'bold'
        },
        {
          id: 'medical-cross',
          type: 'text',
          x: 600, y: 650,
          text: '⚕️',
          fontSize: 200,
          align: 'center'
        },
        {
          id: 'services',
          type: 'text',
          x: 1600, y: 550,
          text: 'NOW ACCEPTING\nNEW PATIENTS',
          fontSize: 56,
          fontFamily: 'Arial Black',
          fill: '#1e40af',
          align: 'center',
          lineHeight: 1.3
        },
        {
          id: 'contact-info',
          type: 'text',
          x: 1200, y: 900,
          text: 'Call (555) MEDICAL • Walk-ins Welcome',
          fontSize: 40,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center'
        }
      ]
    },

    // Law Firm
    {
      id: 'law-firm-professional',
      name: 'Law Firm Professional',
      category: 'Legal Services',
      description: 'Sophisticated design for legal professionals',
      tags: ['law', 'legal', 'attorney', 'professional'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 1200,
          fill: '#1f2937'
        },
        {
          id: 'gold-accent',
          type: 'rect',
          x: 100, y: 100,
          width: 2200, height: 1000,
          fill: '#ffffff',
          strokeWidth: 8,
          stroke: '#d97706'
        },
        {
          id: 'firm-name',
          type: 'text',
          x: 1200, y: 350,
          text: 'SMITH & ASSOCIATES',
          fontSize: 80,
          fontFamily: 'Georgia',
          fill: '#1f2937',
          align: 'center',
          fontWeight: 'bold'
        },
        {
          id: 'specialty',
          type: 'text',
          x: 1200, y: 500,
          text: 'ATTORNEYS AT LAW',
          fontSize: 48,
          fontFamily: 'Georgia',
          fill: '#d97706',
          align: 'center'
        },
        {
          id: 'scales-icon',
          type: 'text',
          x: 1200, y: 650,
          text: '⚖️',
          fontSize: 120,
          align: 'center'
        },
        {
          id: 'specialties',
          type: 'text',
          x: 1200, y: 850,
          text: 'Personal Injury • Family Law • Estate Planning',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center'
        }
      ]
    },

    // Fitness Gym
    {
      id: 'fitness-gym-energy',
      name: 'Fitness Gym Energy',
      category: 'Fitness & Health',
      description: 'High-energy design for gyms and fitness centers',
      tags: ['fitness', 'gym', 'workout', 'health'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 1200,
          fill: '#000000'
        },
        {
          id: 'energy-stripe',
          type: 'rect',
          x: 0, y: 300,
          width: 2400, height: 600,
          fill: '#dc2626'
        },
        {
          id: 'gym-name',
          type: 'text',
          x: 1200, y: 200,
          text: 'POWERHOUSE GYM',
          fontSize: 88,
          fontFamily: 'Impact',
          fill: '#ffffff',
          align: 'center',
          strokeWidth: 4,
          stroke: '#dc2626'
        },
        {
          id: 'muscle-emoji',
          type: 'text',
          x: 600, y: 600,
          text: '💪',
          fontSize: 200,
          align: 'center'
        },
        {
          id: 'offer',
          type: 'text',
          x: 1600, y: 550,
          text: 'NO SIGNUP FEE\nFIRST MONTH',
          fontSize: 64,
          fontFamily: 'Impact',
          fill: '#ffffff',
          align: 'center',
          lineHeight: 1.2
        },
        {
          id: 'cta',
          type: 'text',
          x: 1600, y: 750,
          text: '$19.99',
          fontSize: 80,
          fontFamily: 'Arial Black',
          fill: '#fbbf24',
          align: 'center'
        },
        {
          id: 'footer',
          type: 'text',
          x: 1200, y: 1000,
          text: 'Open 24/7 • State-of-the-Art Equipment',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center'
        }
      ]
    },

    // Beauty Salon
    {
      id: 'beauty-salon-elegant',
      name: 'Beauty Salon Elegant',
      category: 'Beauty & Wellness',
      description: 'Elegant design for beauty salons and spas',
      tags: ['beauty', 'salon', 'spa', 'elegant'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 2400, height: 1200,
          fill: '#f3e8ff'
        },
        {
          id: 'purple-accent',
          type: 'circle',
          x: 1200, y: 600,
          radius: 500,
          fill: '#7c3aed',
          opacity: 0.1
        },
        {
          id: 'salon-name',
          type: 'text',
          x: 1200, y: 300,
          text: 'BELLA BEAUTY SALON',
          fontSize: 80,
          fontFamily: 'Georgia',
          fill: '#7c3aed',
          align: 'center',
          fontStyle: 'italic'
        },
        {
          id: 'sparkle-1',
          type: 'text',
          x: 800, y: 500,
          text: '✨',
          fontSize: 80,
          align: 'center'
        },
        {
          id: 'sparkle-2',
          type: 'text',
          x: 1600, y: 700,
          text: '✨',
          fontSize: 80,
          align: 'center'
        },
        {
          id: 'services',
          type: 'text',
          x: 1200, y: 650,
          text: 'Hair • Nails • Skincare • Massage',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: '#4c1d95',
          align: 'center'
        },
        {
          id: 'special-offer',
          type: 'text',
          x: 1200, y: 850,
          text: 'New Client Special: 20% Off First Visit',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#7c3aed',
          align: 'center',
          fontWeight: 'bold'
        }
      ]
    },

    // PORTRAIT TEMPLATES
    // Simple Portrait Test
    {
      id: 'simple-portrait-test',
      name: 'Simple Test - Portrait',
      category: 'Test',
      orientation: 'portrait',
      description: 'Simple test template for portrait mode',
      tags: ['test', 'portrait'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 1600,
          fill: '#3b82f6'
        },
        {
          id: 'test-text',
          type: 'text',
          x: 0, y: 800,
          text: 'TEST PORTRAIT',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          width: 800
        }
      ]
    },

    // Portrait Business Grand Opening
    {
      id: 'grand-opening-portrait',
      name: 'Grand Opening - Portrait',
      category: 'Business Events',
      orientation: 'portrait',
      description: 'Vertical design perfect for door displays and pole banners',
      tags: ['grand opening', 'business', 'celebration', 'portrait'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 1600,
          fill: '#1e40af'
        },
        {
          id: 'starburst',
          type: 'star',
          x: 400, y: 250,
          outerRadius: 60,
          innerRadius: 30,
          numPoints: 8,
          fill: '#fbbf24',
          stroke: '#f59e0b',
          strokeWidth: 4
        },
        {
          id: 'main-text',
          type: 'text',
          x: 0, y: 450,
          text: 'GRAND OPENING',
          fontSize: 52,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'business-name',
          type: 'text',
          x: 0, y: 600,
          text: 'YOUR BUSINESS',
          fontSize: 38,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'date-text',
          type: 'text',
          x: 0, y: 750,
          text: 'JANUARY 15TH',
          fontSize: 28,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          width: 800
        },
        {
          id: 'special-offer',
          type: 'text',
          x: 0, y: 950,
          text: '🎉 SPECIAL OFFERS 🎉',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'details',
          type: 'text',
          x: 0, y: 1100,
          text: 'FREE GIFTS • DISCOUNTS\nREFRESHMENTS',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          width: 800
        }
      ]
    },

    // Portrait Restaurant Menu
    {
      id: 'restaurant-menu-portrait',
      name: 'Restaurant Menu - Portrait',
      category: 'Food & Dining',
      orientation: 'portrait',
      description: 'Elegant vertical menu design for restaurants',
      tags: ['restaurant', 'menu', 'food', 'dining', 'portrait'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 1600,
          fill: '#0f172a'
        },
        {
          id: 'header-accent',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 200,
          fill: '#dc2626'
        },
        {
          id: 'restaurant-name',
          type: 'text',
          x: 0, y: 120,
          text: 'BISTRO ELEGANTE',
          fontSize: 48,
          fontFamily: 'Georgia',
          fill: '#ffffff',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'cuisine-type',
          type: 'text',
          x: 0, y: 300,
          text: 'AUTHENTIC ITALIAN CUISINE',
          fontSize: 28,
          fontFamily: 'Georgia',
          fill: '#f1c40f',
          align: 'center',
          width: 800
        },
        {
          id: 'specials-header',
          type: 'text',
          x: 0, y: 450,
          text: "TODAY'S SPECIALS",
          fontSize: 36,
          fontFamily: 'Georgia',
          fill: '#ffffff',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'menu-item-1',
          type: 'text',
          x: 0, y: 550,
          text: 'Osso Buco Milanese - $32',
          fontSize: 24,
          fontFamily: 'Georgia',
          fill: '#f1c40f',
          align: 'center',
          width: 800
        },
        {
          id: 'menu-item-2',
          type: 'text',
          x: 0, y: 620,
          text: 'Truffle Risotto - $28',
          fontSize: 24,
          fontFamily: 'Georgia',
          fill: '#f1c40f',
          align: 'center',
          width: 800
        },
        {
          id: 'menu-item-3',
          type: 'text',
          x: 0, y: 690,
          text: 'Tiramisu della Casa - $12',
          fontSize: 24,
          fontFamily: 'Georgia',
          fill: '#f1c40f',
          align: 'center',
          width: 800
        },
        {
          id: 'chef-special',
          type: 'text',
          x: 0, y: 850,
          text: "CHEF'S RECOMMENDATION",
          fontSize: 32,
          fontFamily: 'Georgia',
          fill: '#dc2626',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'special-dish',
          type: 'text',
          x: 0, y: 950,
          text: 'Lobster Ravioli\nin Saffron Cream Sauce\n$42',
          fontSize: 26,
          fontFamily: 'Georgia',
          fill: '#ffffff',
          align: 'center',
          width: 800
        },
        {
          id: 'hours',
          type: 'text',
          x: 0, y: 1200,
          text: 'HOURS OF OPERATION',
          fontSize: 24,
          fontFamily: 'Georgia',
          fill: '#f1c40f',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'hours-detail',
          type: 'text',
          x: 0, y: 1280,
          text: 'Monday - Thursday: 5PM - 10PM\nFriday - Saturday: 5PM - 11PM\nSunday: 4PM - 9PM',
          fontSize: 18,
          fontFamily: 'Georgia',
          fill: '#ffffff',
          align: 'center',
          width: 800
        },
        {
          id: 'contact',
          type: 'text',
          x: 0, y: 1450,
          text: 'Reservations: (555) 123-4567\nwww.bistroelegante.com',
          fontSize: 20,
          fontFamily: 'Georgia',
          fill: '#f1c40f',
          align: 'center',
          width: 800
        }
      ]
    },

    // Portrait Real Estate
    {
      id: 'real-estate-portrait',
      name: 'Real Estate - Portrait',
      category: 'Real Estate',
      orientation: 'portrait',
      description: 'Professional vertical design for property listings',
      tags: ['real estate', 'property', 'for sale', 'portrait'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 1600,
          fill: '#ffffff'
        },
        {
          id: 'header',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 150,
          fill: '#1e40af'
        },
        {
          id: 'status',
          type: 'text',
          x: 0, y: 100,
          text: 'FOR SALE',
          fontSize: 56,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'price',
          type: 'text',
          x: 0, y: 250,
          text: '$599,000',
          fontSize: 72,
          fontFamily: 'Arial Black',
          fill: '#dc2626',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'address',
          type: 'text',
          x: 0, y: 400,
          text: '123 MAPLE STREET\nSPRINGFIELD, CA 90210',
          fontSize: 32,
          fontFamily: 'Arial',
          fill: '#1f2937',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'features',
          type: 'text',
          x: 0, y: 600,
          text: '🏠 4 BEDROOMS\n🛁 3 BATHROOMS\n🚗 2 CAR GARAGE\n📐 2,400 SQ FT',
          fontSize: 28,
          fontFamily: 'Arial',
          fill: '#1f2937',
          align: 'center',
          width: 800
        },
        {
          id: 'highlights',
          type: 'text',
          x: 0, y: 900,
          text: '✨ NEWLY RENOVATED\n🌳 LARGE BACKYARD\n🎯 PRIME LOCATION\n💫 MOVE-IN READY',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#059669',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'agent-name',
          type: 'text',
          x: 0, y: 1200,
          text: 'SARAH JOHNSON',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#1e40af',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'agent-title',
          type: 'text',
          x: 0, y: 1270,
          text: 'Licensed Real Estate Agent',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#6b7280',
          align: 'center',
          width: 800
        },
        {
          id: 'contact-info',
          type: 'text',
          x: 0, y: 1380,
          text: '📱 (555) 123-4567\n✉️ sarah@primerealty.com',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#1f2937',
          align: 'center',
          width: 800
        },
        {
          id: 'call-to-action',
          type: 'text',
          x: 0, y: 1500,
          text: 'CALL TODAY FOR PRIVATE SHOWING',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#dc2626',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        }
      ]
    },

    // Portrait Event Announcement
    {
      id: 'event-portrait',
      name: 'Event Announcement - Portrait',
      category: 'Events',
      orientation: 'portrait',
      description: 'Vertical event poster design',
      tags: ['event', 'announcement', 'party', 'celebration', 'portrait'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 1600,
          fill: '#7c3aed'
        },
        {
          id: 'top-accent',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 100,
          fill: '#fbbf24'
        },
        {
          id: 'event-type',
          type: 'text',
          x: 0, y: 200,
          text: 'COMMUNITY',
          fontSize: 36,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'event-name',
          type: 'text',
          x: 0, y: 320,
          text: 'SUMMER\nFESTIVAL',
          fontSize: 72,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'date',
          type: 'text',
          x: 0, y: 600,
          text: 'SATURDAY\nJULY 15TH',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'time',
          type: 'text',
          x: 0, y: 800,
          text: '12:00 PM - 8:00 PM',
          fontSize: 32,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          width: 800
        },
        {
          id: 'location',
          type: 'text',
          x: 0, y: 900,
          text: 'CENTRAL PARK\nMAIN PAVILION',
          fontSize: 28,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          width: 800
        },
        {
          id: 'activities',
          type: 'text',
          x: 0, y: 1100,
          text: '🎵 LIVE MUSIC\n🍔 FOOD TRUCKS\n🎨 KIDS ACTIVITIES\n🎆 FIREWORKS',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center',
          width: 800
        },
        {
          id: 'admission',
          type: 'text',
          x: 0, y: 1350,
          text: 'FREE ADMISSION',
          fontSize: 40,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'info',
          type: 'text',
          x: 0, y: 1450,
          text: 'For more info: summerfest2024.com',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center',
          width: 800
        }
      ]
    },

    // Portrait Corporate/Business
    {
      id: 'corporate-portrait',
      name: 'Corporate Announcement - Portrait',
      category: 'Business',
      orientation: 'portrait',
      description: 'Professional corporate vertical banner',
      tags: ['corporate', 'business', 'professional', 'announcement', 'portrait'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 1600,
          fill: '#1e293b'
        },
        {
          id: 'header-band',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 120,
          fill: '#3b82f6'
        },
        {
          id: 'company-name',
          type: 'text',
          x: 0, y: 200,
          text: 'INNOVATIVE SOLUTIONS',
          fontSize: 42,
          fontFamily: 'Arial',
          fill: '#3b82f6',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'announcement',
          type: 'text',
          x: 0, y: 350,
          text: 'NOW HIRING',
          fontSize: 64,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'position',
          type: 'text',
          x: 0, y: 500,
          text: 'SENIOR SOFTWARE\nENGINEERS',
          fontSize: 48,
          fontFamily: 'Arial',
          fill: '#10b981',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'benefits',
          type: 'text',
          x: 0, y: 750,
          text: '💰 COMPETITIVE SALARY\n🏥 FULL BENEFITS\n🏠 REMOTE WORK OPTIONS\n📈 CAREER GROWTH',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          width: 800
        },
        {
          id: 'requirements',
          type: 'text',
          x: 0, y: 1050,
          text: 'REQUIREMENTS',
          fontSize: 32,
          fontFamily: 'Arial',
          fill: '#3b82f6',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'requirements-list',
          type: 'text',
          x: 0, y: 1150,
          text: '• 5+ years experience\n• React, Node.js, Python\n• Team leadership skills\n• Bachelor\'s degree preferred',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#e2e8f0',
          align: 'center',
          width: 800
        },
        {
          id: 'cta',
          type: 'text',
          x: 0, y: 1350,
          text: 'APPLY TODAY',
          fontSize: 36,
          fontFamily: 'Arial Black',
          fill: '#10b981',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'contact',
          type: 'text',
          x: 0, y: 1450,
          text: 'careers@innovativesolutions.com\n(555) 123-4567',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#94a3b8',
          align: 'center',
          width: 800
        }
      ]
    },

    // Portrait Fitness/Health
    {
      id: 'fitness-portrait',
      name: 'Fitness Challenge - Portrait',
      category: 'Health & Fitness',
      orientation: 'portrait',
      description: 'Motivational vertical fitness banner',
      tags: ['fitness', 'health', 'gym', 'challenge', 'workout', 'portrait'],
      elements: [
        {
          id: 'bg',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 1600,
          fill: '#0f172a'
        },
        {
          id: 'accent-top',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 80,
          fill: '#ef4444'
        },
        {
          id: 'accent-bottom',
          type: 'rect',
          x: 0, y: 1520,
          width: 800, height: 80,
          fill: '#ef4444'
        },
        {
          id: 'challenge-type',
          type: 'text',
          x: 0, y: 180,
          text: '30-DAY',
          fontSize: 48,
          fontFamily: 'Arial Black',
          fill: '#ef4444',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'challenge-name',
          type: 'text',
          x: 0, y: 280,
          text: 'FITNESS\nCHALLENGE',
          fontSize: 72,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'motivation',
          type: 'text',
          x: 0, y: 500,
          text: 'TRANSFORM YOUR BODY\nTRANSFORM YOUR LIFE',
          fontSize: 28,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'features',
          type: 'text',
          x: 0, y: 700,
          text: '💪 DAILY WORKOUTS\n🥗 MEAL PLANS\n📱 APP TRACKING\n👥 COMMUNITY SUPPORT',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          width: 800
        },
        {
          id: 'stats',
          type: 'text',
          x: 0, y: 950,
          text: 'JOIN 10,000+ MEMBERS\nAVERAGE WEIGHT LOSS: 15 LBS',
          fontSize: 22,
          fontFamily: 'Arial',
          fill: '#10b981',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'price',
          type: 'text',
          x: 0, y: 1150,
          text: 'ONLY $29/MONTH',
          fontSize: 48,
          fontFamily: 'Arial Black',
          fill: '#ef4444',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'guarantee',
          type: 'text',
          x: 0, y: 1250,
          text: '30-DAY MONEY BACK GUARANTEE',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center',
          width: 800
        },
        {
          id: 'cta-fitness',
          type: 'text',
          x: 0, y: 1350,
          text: 'START TODAY',
          fontSize: 40,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          fontWeight: 'bold',
          width: 800
        },
        {
          id: 'website',
          type: 'text',
          x: 0, y: 1450,
          text: 'www.fitnesschallenge.com',
          fontSize: 24,
          fontFamily: 'Arial',
          fill: '#94a3b8',
          align: 'center',
          width: 800
        }
      ]
    }
  ]

  // Shape Library
  const shapeLibrary = [
    { name: 'Rectangle', icon: Square, type: 'rect' },
    { name: 'Circle', icon: CircleIcon, type: 'circle' },
    { name: 'Star', icon: StarIcon, type: 'star' },
    { name: 'Triangle', icon: Triangle, type: 'triangle' },
    { name: 'Arrow', icon: CornerDownRight, type: 'arrow' },
    { name: 'Hexagon', icon: Settings, type: 'hexagon' },
    { name: 'Heart', icon: Heart, type: 'heart' },
    { name: 'Diamond', icon: Award, type: 'diamond' }
  ]

  // Icon Library
  const iconLibrary = [
    { name: 'Star', icon: StarIcon },
    { name: 'Heart', icon: Heart },
    { name: 'Award', icon: Award },
    { name: 'Shield', icon: Shield },
    { name: 'Clock', icon: Clock },
    { name: 'Mail', icon: Mail },
    { name: 'Phone', icon: Phone },
    { name: 'Location', icon: MapPin },
    { name: 'Globe', icon: Globe },
    { name: 'Camera', icon: Camera },
    { name: 'Music', icon: Music },
    { name: 'Video', icon: Video },
    { name: 'Coffee', icon: Coffee },
    { name: 'Car', icon: Car },
    { name: 'Home', icon: Home },
    { name: 'Briefcase', icon: Briefcase },
    { name: 'Shopping', icon: ShoppingBag },
    { name: 'Gift', icon: Gift },
    { name: 'Tag', icon: Tag },
    { name: 'Trending', icon: TrendingUp },
    { name: 'Users', icon: Users }
  ]

  // DPI Quality Detection
  const detectImageQuality = (file) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const widthInches = canvasSize.width / 300
        const heightInches = canvasSize.height / 300
        
        const actualDPIWidth = img.naturalWidth / widthInches
        const actualDPIHeight = img.naturalHeight / heightInches
        const averageDPI = (actualDPIWidth + actualDPIHeight) / 2
        
        let quality = 'poor'
        let message = ''
        
        if (averageDPI >= 300) {
          quality = 'excellent'
          message = `Excellent print quality (${Math.round(averageDPI)} DPI)`
        } else if (averageDPI >= 200) {
          quality = 'good'
          message = `Good print quality (${Math.round(averageDPI)} DPI)`
        } else if (averageDPI >= 150) {
          quality = 'fair'
          message = `Fair print quality (${Math.round(averageDPI)} DPI) - May appear pixelated`
        } else {
          quality = 'poor'
          message = `Poor print quality (${Math.round(averageDPI)} DPI) - Will appear pixelated`
        }
        
        resolve({
          quality,
          dpi: Math.round(averageDPI),
          message,
          width: img.naturalWidth,
          height: img.naturalHeight
        })
      }
      img.src = URL.createObjectURL(file)
    })
  }

  // Text formatting options
  const [textTool, setTextTool] = useState({
    fontSize: 72,
    fontFamily: 'Arial',
    fill: '#000000',
    fontStyle: 'normal',
    fontWeight: 'normal',
    textDecoration: '',
    align: 'left',
    lineHeight: 1.2,
    strokeWidth: 0,
    stroke: '#000000',
    shadowColor: 'rgba(0,0,0,0.5)',
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0
  })

  // Tools state
  const [activeTool, setActiveTool] = useState('select')
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')

  const [showLayerPanel, setShowLayerPanel] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(5)
  const [opacity, setOpacity] = useState(1)
  const [blendMode, setBlendMode] = useState('normal')

  // Responsive viewport calculations for fixed workspace
  const getViewportDimensions = useCallback(() => {
    const container = document.getElementById('canvas-container')
    if (!container) return { width: 960, height: 480, scale: 0.6 }
    
    const rect = container.getBoundingClientRect()
    // Proper workspace padding for comfortable editing
    const horizontalPadding = 200 // Generous horizontal padding for workspace comfort
    const verticalPadding = 240   // Account for title, controls, and workspace padding
    
    const availableWidth = Math.max(rect.width - horizontalPadding, 600)
    const availableHeight = Math.max(rect.height - verticalPadding, 400)
    
    const scaleX = availableWidth / canvasSize.width
    const scaleY = availableHeight / canvasSize.height
    const newScale = Math.min(scaleX, scaleY, 1.0) // Max 100% for fixed workspace
    
    // Ensure reasonable scale for editing with fixed workspace
    const finalScale = Math.max(newScale, 0.4)
    
    return {
      width: canvasSize.width * finalScale,
      height: canvasSize.height * finalScale,
      scale: finalScale
    }
  }, [canvasSize])

  // Disable automatic scale adjustment - users control zoom manually
  // useEffect(() => {
  //   const viewport = getViewportDimensions()
  //   setScale(viewport.scale)
  // }, [canvasSize, getViewportDimensions])

  // Disable window resize auto-scaling - keep zoom user-controlled
  // useEffect(() => {
  //   const handleResize = () => {
  //     const viewport = getViewportDimensions()
  //     setScale(viewport.scale)
  //   }
  //   
  //   window.addEventListener('resize', handleResize)
  //   return () => window.removeEventListener('resize', handleResize)
  // }, [getViewportDimensions])

  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current && stageRef.current) {
      if (selectedId) {
        const selectedNode = stageRef.current.findOne(`#${selectedId}`)
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode])
          transformerRef.current.getLayer().batchDraw()
        }
      } else {
        transformerRef.current.nodes([])
        transformerRef.current.getLayer().batchDraw()
      }
    }
  }, [selectedId, elements])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.contentEditable === 'true') {
        return
      }

      // Copy (Ctrl+C / Cmd+C)
      if ((e.ctrlKey || e.metaKey) && e.key === 'c' && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        copySelected()
      }
      
      // Paste (Ctrl+V / Cmd+V)
      if ((e.ctrlKey || e.metaKey) && e.key === 'v' && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        pasteElement()
      }
      
      // Delete (Delete key)
      if (e.key === 'Delete' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        deleteSelectedElement()
      }

      // Duplicate (Ctrl+D / Cmd+D)
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && !e.shiftKey && !e.altKey) {
        e.preventDefault()
        duplicateSelected()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, elements, copiedElement])

  // No auto-scaling - users control zoom manually via controls

  // Load user preferences on component mount
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const response = await authService.authenticatedRequest('/api/user/preferences')
        if (response.ok) {
          const data = await response.json()
          if (data.success && data.preferences) {
            const prefs = data.preferences
            if (prefs.default_banner_type && prefs.default_banner_type !== selectedBannerType) {
              setSelectedBannerType(prefs.default_banner_type)
            }
            if (prefs.default_banner_size && prefs.default_banner_size !== selectedBannerSize) {
              setSelectedBannerSize(prefs.default_banner_size)
            }
            // Apply editor settings if any
            if (prefs.editor_settings) {
              const settings = typeof prefs.editor_settings === 'string' 
                ? JSON.parse(prefs.editor_settings) 
                : prefs.editor_settings
              
              if (settings.showGrid !== undefined) setShowGrid(settings.showGrid)
              if (settings.backgroundColor) setBackgroundColor(settings.backgroundColor)
              if (settings.useCustomSize !== undefined) setUseCustomSize(settings.useCustomSize)
              if (settings.customWidth !== undefined) setCustomWidth(settings.customWidth)
              if (settings.customHeight !== undefined) setCustomHeight(settings.customHeight)
              if (settings.orientation !== undefined) setOrientation(settings.orientation)
            }
          }
        }
      } catch (error) {
        console.log('Could not load user preferences:', error)
      }
    }
    
    const loadCanvasState = async () => {
      try {
        // Check if returning from checkout with preserved canvas state
        const checkoutCanvasState = await canvasStateService.loadCheckoutCanvasState()
        
        if (checkoutCanvasState && checkoutCanvasState.canvas_data) {
          const canvasData = checkoutCanvasState.canvas_data
          const bannerSettings = checkoutCanvasState.banner_settings
          
          console.log('Restoring canvas state from database:', checkoutCanvasState)
          
          if (canvasData.elements && canvasData.elements.length > 0) {
            setElements(canvasData.elements)
            setBackgroundColor(canvasData.backgroundColor || backgroundColor)
            
            // Restore canvas size if available
            if (canvasData.canvasSize) {
              setCanvasSize(canvasData.canvasSize)
            }
            
            // Restore banner settings
            if (bannerSettings) {
              if (bannerSettings.selectedBannerType) {
                setSelectedBannerType(bannerSettings.selectedBannerType)
              }
              if (bannerSettings.selectedBannerSize) {
                setSelectedBannerSize(bannerSettings.selectedBannerSize)
              }
              if (bannerSettings.useCustomSize !== undefined) {
                setUseCustomSize(bannerSettings.useCustomSize)
              }
              if (bannerSettings.customWidth) {
                setCustomWidth(bannerSettings.customWidth)
              }
              if (bannerSettings.customHeight) {
                setCustomHeight(bannerSettings.customHeight)
              }
              if (bannerSettings.orientation) {
                setOrientation(bannerSettings.orientation)
              }
            }
            
            // Clear the checkout canvas state after loading
            await canvasStateService.clearCheckoutCanvasState()

          }
        } else {
          // Try to load regular canvas state if no checkout state
          const regularCanvasState = await canvasStateService.loadCanvasState()
          
          if (regularCanvasState && regularCanvasState.canvas_data) {
            const canvasData = regularCanvasState.canvas_data
            
            if (canvasData.elements && canvasData.elements.length > 0) {
              setElements(canvasData.elements)
              setBackgroundColor(canvasData.backgroundColor || backgroundColor)
              
              if (canvasData.canvasSize) {
                setCanvasSize(canvasData.canvasSize)
              }
              

            }
          }
        }
      } catch (error) {
        console.log('Could not load canvas state from database:', error)
        
        // Fallback to localStorage if database is unavailable
        try {
          const savedCanvasState = localStorage.getItem('canvasState')
          if (savedCanvasState) {
            const canvasState = JSON.parse(savedCanvasState)
            console.log('Falling back to localStorage canvas state:', canvasState)
            
            if (canvasState.elements && canvasState.elements.length > 0) {
              setElements(canvasState.elements)
              setBackgroundColor(canvasState.backgroundColor || backgroundColor)
              
              if (canvasState.canvasSize) {
                setCanvasSize(canvasState.canvasSize)
              }
              
              // Restore banner settings
              if (canvasState.selectedBannerType) {
                setSelectedBannerType(canvasState.selectedBannerType)
              }
              if (canvasState.selectedBannerSize) {
                setSelectedBannerSize(canvasState.selectedBannerSize)
              }
              if (canvasState.useCustomSize !== undefined) {
                setUseCustomSize(canvasState.useCustomSize)
              }
              if (canvasState.customWidth) {
                setCustomWidth(canvasState.customWidth)
              }
              if (canvasState.customHeight) {
                setCustomHeight(canvasState.customHeight)
              }
              if (canvasState.orientation) {
                setOrientation(canvasState.orientation)
              }
              
              localStorage.removeItem('canvasState')

            }
          }
        } catch (localError) {
          console.log('Could not load from localStorage either:', localError)
          localStorage.removeItem('canvasState') // Clean up if corrupted
        }
      }
    }
    
    loadUserPreferences()
    loadCanvasState()
  }, [])

  // Update canvas size when orientation changes (different templates)
  useEffect(() => {
    const updateCanvasForScreenSize = () => {
      const newDimensions = getResponsiveCanvasDimensions()
      setCanvasSize(newDimensions)
      setIsMobileView(window.innerWidth < 640)
      setViewportSize({ width: window.innerWidth, height: window.innerHeight })
      

    }
    
    // Update immediately for orientation change
    updateCanvasForScreenSize()
    
    // Add resize listener for screen size changes
    const handleResize = () => {
      updateCanvasForScreenSize()
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [orientation]) // Update when orientation changes
  
  // Auto-scale for mobile when canvas size or viewport changes
  useEffect(() => {
    if (isMobileView && canvasSize.width && viewportSize.width) {
      const availableWidth = viewportSize.width - 40
      const availableHeight = viewportSize.height - 300
      
      const scaleX = availableWidth / canvasSize.width
      const scaleY = availableHeight / canvasSize.height
      
      const optimalScale = Math.min(scaleX, scaleY, 1)
      setScale(optimalScale)
    }
  }, [isMobileView, canvasSize, viewportSize])

  // Save user preferences when banner type/size changes
  const saveUserPreferences = async () => {
    try {
      const editorSettings = {
        showGrid,
        backgroundColor,
        scale,
        useCustomSize,
        customWidth,
        customHeight,
        orientation
      }
      
      await authService.authenticatedRequest('/api/user/preferences', {
        method: 'POST',
        body: JSON.stringify({
          default_banner_type: selectedBannerType,
          default_banner_size: selectedBannerSize,
          editor_settings: editorSettings
        })
      })
    } catch (error) {
      console.log('Could not save user preferences:', error)
    }
  }

  // Save preferences when key settings change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      saveUserPreferences()
    }, 1000) // Debounce saves
    
    return () => clearTimeout(timeoutId)
  }, [selectedBannerType, selectedBannerSize, useCustomSize, customWidth, customHeight, orientation, showGrid, backgroundColor])

  // Auto-save canvas state when elements change
  useEffect(() => {
    if (elements.length > 0) {
      const canvasData = {
        elements,
        canvasSize,
        backgroundColor
      }
      
      const bannerSettings = {
        selectedBannerType,
        selectedBannerSize,
        useCustomSize,
        customWidth,
        customHeight,
        orientation
      }
      
      // Auto-save with debouncing
      canvasStateService.autoSaveCanvasState(canvasData, bannerSettings, 3000) // 3 second delay
    }
    
    return () => {
      // Clear auto-save timeout on cleanup
      canvasStateService.clearAutoSave()
    }
  }, [elements, canvasSize, backgroundColor, selectedBannerType, selectedBannerSize, useCustomSize, customWidth, customHeight, orientation])

  // History management
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.stringify({ elements, canvasSize, backgroundColor }))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [elements, canvasSize, backgroundColor, history, historyIndex])

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      const state = JSON.parse(history[newIndex])
      setElements(state.elements)
      setCanvasSize(state.canvasSize)
      setBackgroundColor(state.backgroundColor)
      setHistoryIndex(newIndex)
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      const state = JSON.parse(history[newIndex])
      setElements(state.elements)
      setCanvasSize(state.canvasSize)
      setBackgroundColor(state.backgroundColor)
      setHistoryIndex(newIndex)
    }
  }

  // Load template with scaling to current canvas size
  const loadTemplate = (template) => {
    // Determine template default size based on template orientation
    let templateWidth, templateHeight
    
    if (template.orientation === 'portrait') {
      // Portrait templates: 800x1600px
      templateWidth = 800
      templateHeight = 1600
    } else {
      // Landscape templates: 2400x1200px (default)
      templateWidth = 2400
      templateHeight = 1200
    }
    
    // Calculate scaling factors
    const scaleX = canvasSize.width / templateWidth
    const scaleY = canvasSize.height / templateHeight
    
    // Check if scaling is needed (avoid unnecessary scaling that causes pixelation)
    const needsScaling = Math.abs(scaleX - 1.0) > 0.01 || Math.abs(scaleY - 1.0) > 0.01
    
    const scaledElements = template.elements.map(el => {
      const scaledElement = {
        ...el,
        id: `${el.type}-${Date.now()}-${Math.random()}`,
        draggable: true,
        x: needsScaling ? el.x * scaleX : el.x,
        y: needsScaling ? el.y * scaleY : el.y
      }
      
      // Scale dimensions for shapes and images only if needed
      if (needsScaling) {
        if (el.width) scaledElement.width = el.width * scaleX
        if (el.height) scaledElement.height = el.height * scaleY
      } else {
        if (el.width) scaledElement.width = el.width
        if (el.height) scaledElement.height = el.height
      }
      
      // Scale font size for text elements only if needed
      if (el.fontSize) {
        scaledElement.fontSize = needsScaling ? Math.round(el.fontSize * Math.min(scaleX, scaleY)) : el.fontSize
      }
      
      // Scale radius for circles and stars only if needed
      if (needsScaling) {
        if (el.radius) scaledElement.radius = el.radius * Math.min(scaleX, scaleY)
        if (el.innerRadius) scaledElement.innerRadius = el.innerRadius * Math.min(scaleX, scaleY)
        if (el.outerRadius) scaledElement.outerRadius = el.outerRadius * Math.min(scaleX, scaleY)
      } else {
        if (el.radius) scaledElement.radius = el.radius
        if (el.innerRadius) scaledElement.innerRadius = el.innerRadius
        if (el.outerRadius) scaledElement.outerRadius = el.outerRadius
      }
      
      // Scale stroke width only if needed
      if (el.strokeWidth) {
        scaledElement.strokeWidth = needsScaling ? Math.max(1, Math.round(el.strokeWidth * Math.min(scaleX, scaleY))) : el.strokeWidth
      }
      
      // Scale points for lines/polygons only if needed
      if (el.points && Array.isArray(el.points)) {
        if (needsScaling) {
          scaledElement.points = el.points.map((point, index) => 
            index % 2 === 0 ? point * scaleX : point * scaleY
          )
        } else {
          scaledElement.points = [...el.points]
        }
      }
      
      return scaledElement
    })
    
    setElements(scaledElements)
    saveToHistory()

  }

  // Add text element
  const addText = () => {
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 36,
      text: 'Your Text Here',
      ...textTool,
      draggable: true,
      width: 200
    }
    setElements([...elements, newText])
    setSelectedId(newText.id)
    saveToHistory()
  }

  // Add shapes
  const addShape = (shapeType) => {
    const baseProps = {
      id: `${shapeType}-${Date.now()}`,
      type: shapeType,
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      fill: '#3B82F6',
      stroke: '#000000',
      strokeWidth: 0,
      draggable: true
    }

    let shapeProps = {}
    
    switch (shapeType) {
      case 'rect':
        shapeProps = { width: 200, height: 100 }
        break
      case 'circle':
        shapeProps = { radius: 60 }
        break
      case 'star':
        shapeProps = { numPoints: 5, innerRadius: 40, outerRadius: 80 }
        break
      case 'triangle':
        shapeProps = { sides: 3, radius: 60 }
        break
      case 'hexagon':
        shapeProps = { sides: 6, radius: 60 }
        break
      case 'arrow':
        shapeProps = { 
          points: [0, 15, 70, 15, 70, 5, 100, 20, 70, 35, 70, 25, 0, 25],
          closed: true,
          fill: '#3B82F6',
          stroke: '#1E40AF',
          strokeWidth: 2
        }
        break
      default:
        shapeProps = { width: 100, height: 100 }
    }

    const newShape = { ...baseProps, ...shapeProps }
    setElements([...elements, newShape])
    setSelectedId(newShape.id)
    saveToHistory()
  }

  // Add icon as text element
  const addIcon = (iconName) => {
    const iconMap = {
      'Star': '★',
      'Heart': '♥',
      'Award': '🏆',
      'Shield': '🛡️',
      'Clock': '🕐',
      'Mail': '✉️',
      'Phone': '📞',
      'Location': '📍',
      'Globe': '🌐',
      'Camera': '📷',
      'Music': '🎵',
      'Video': '🎬',
      'Coffee': '☕',
      'Car': '🚗',
      'Home': '🏠',
      'Briefcase': '💼',
      'Shopping': '🛍️',
      'Gift': '🎁',
      'Tag': '🏷️',
      'Trending': '📈',
      'Users': '👥'
    }

    const newIcon = {
      id: `icon-${Date.now()}`,
      type: 'text',
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      text: iconMap[iconName] || '★',
      fontSize: 100,
      fontFamily: 'Arial',
      fill: '#3B82F6',
      draggable: true
    }
    setElements([...elements, newIcon])
    setSelectedId(newIcon.id)
    saveToHistory()
  }

  // Handle image upload with DPI detection
  const onDrop = useCallback(async (acceptedFiles) => {
    console.log('Files dropped:', acceptedFiles)
    for (const file of acceptedFiles) {
      try {
        console.log('Processing file:', file.name, 'Size:', file.size)
        const qualityInfo = await detectImageQuality(file)
        setUploadQuality(qualityInfo)
        
        if (qualityInfo.quality === 'excellent' || qualityInfo.quality === 'good') {

        }
        
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new window.Image()
          img.onload = () => {
            const maxWidth = canvasSize.width * 0.6
            const maxHeight = canvasSize.height * 0.6
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
            
            const newImage = {
              id: `image-${Date.now()}`,
              type: 'image',
              x: 100,
              y: 100,
              width: img.width * scale,
              height: img.height * scale,
              src: e.target.result,
              draggable: true,
              quality: qualityInfo
            }
            setElements([...elements, newImage])
            setSelectedId(newImage.id)
            saveToHistory()
          }
          img.src = e.target.result
        }
        reader.readAsDataURL(file)
      } catch (error) {

      }
    }
  }, [elements, canvasSize])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg']
    },
    multiple: false,
    noClick: false
  })

  // Handle element selection
  const handleSelect = (id) => {
    setSelectedId(id)
    setActiveTool('select')
  }

  // Handle element changes
  const handleElementChange = (id, newAttrs) => {
    setElements(elements.map(el => el.id === id ? { ...el, ...newAttrs } : el))
  }



  // Delete selected element
  const deleteSelected = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId))
      setSelectedId(null)
      saveToHistory()

    }
  }

  // Duplicate selected element
  const duplicateSelected = () => {
    if (selectedId) {
      const element = elements.find(el => el.id === selectedId)
      if (element) {
        const newElement = {
          ...element,
          id: `${element.type}-${Date.now()}`,
          x: element.x + 20,
          y: element.y + 20
        }
        setElements([...elements, newElement])
        setSelectedId(newElement.id)
        saveToHistory()
      }
    }
  }

  // Copy selected element (Ctrl+C)
  const copySelected = () => {
    if (selectedId) {
      const element = elements.find(el => el.id === selectedId)
      if (element) {
        setCopiedElement(element)
      }
    }
  }

  // Paste copied element (Ctrl+V)
  const pasteElement = () => {
    if (copiedElement) {
      const newElement = {
        ...copiedElement,
        id: `${copiedElement.type}-${Date.now()}`,
        x: copiedElement.x + 20,
        y: copiedElement.y + 20
      }
      setElements([...elements, newElement])
      setSelectedId(newElement.id)
      saveToHistory()
    }
  }

  // Delete selected element (Del key)
  const deleteSelectedElement = () => {
    if (selectedId) {
      setElements(elements.filter(el => el.id !== selectedId))
      setSelectedId(null)
      saveToHistory()
    }
  }

  // Universal alignment functions - work the same in both orientations
  const alignElements = (alignment) => {
    if (!selectedId) return
    
    const element = elements.find(el => el.id === selectedId)
    if (!element) return

    let newX = element.x
    let newY = element.y

    // Simple universal alignment - works for both landscape and portrait templates
    switch (alignment) {
      case 'left':
        newX = 50
        break
      case 'center-h':
        newX = (canvasSize.width - (element.width || 100)) / 2
        break
      case 'right':
        newX = canvasSize.width - (element.width || 100) - 50
        break
      case 'top':
        newY = 50
        break
      case 'center-v':
        newY = (canvasSize.height - (element.height || 100)) / 2
        break
      case 'bottom':
        newY = canvasSize.height - (element.height || 100) - 50
        break
    }

    handleElementChange(selectedId, { x: newX, y: newY })
    saveToHistory()
  }

  // Zoom controls
  const zoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 2)) // Max 200% zoom
  }

  const zoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.1)) // Min 10% zoom
  }

  const resetZoom = () => {
    setScale(0.1) // Reset to 10% for full workspace overview
  }

  // Rotation control
  const rotateSelected = () => {
    if (!selectedId) return
    
    const element = elements.find(el => el.id === selectedId)
    if (!element) return
    
    const newRotation = (element.rotation || 0) + 90
    handleElementChange(selectedId, { rotation: newRotation })
    saveToHistory()
  }

  // Flip tools - work in canvas coordinates (rotation handled visually)
  const flipSelected = (direction) => {
    if (!selectedId) return
    
    const element = elements.find(el => el.id === selectedId)
    if (!element) return
    
    const updates = {}
    if (direction === 'horizontal') {
      updates.scaleX = (element.scaleX || 1) * -1
    } else {
      updates.scaleY = (element.scaleY || 1) * -1
    }
    
    handleElementChange(selectedId, updates)
    saveToHistory()
  }

  const lockElement = () => {
    if (!selectedId) return
    
    const element = elements.find(el => el.id === selectedId)
    if (!element) return
    
    handleElementChange(selectedId, { draggable: !element.draggable })

  }

  const setOpacityForSelected = (newOpacity) => {
    if (!selectedId) return
    
    handleElementChange(selectedId, { opacity: newOpacity })
    saveToHistory()
  }

  const groupElements = () => {
    // Group functionality - would need multiple selection first
    toast('Group functionality coming soon')
  }

  const ungroupElements = () => {
    // Ungroup functionality
    toast('Ungroup functionality coming soon')
  }

  // Save current design as custom template
  const saveAsTemplate = async () => {
    if (elements.length === 0) {

      return
    }

    const templateName = prompt('Enter template name:')
    if (!templateName) return

    const currentType = getCurrentBannerType()
    
    try {
      const response = await authService.authenticatedRequest('/api/templates/save', {
        method: 'POST',
        body: JSON.stringify({
          name: templateName,
          category: 'Custom',
          description: `Custom template created on ${new Date().toLocaleDateString()}`,
          canvas_data: { elements, canvasSize, backgroundColor },
          banner_type: selectedBannerType
        })
      })
      
      if (response.ok) {

        loadUserTemplates() // Refresh the templates list
      } else {
        throw new Error('Failed to save template')
      }
    } catch (error) {
      console.error('Error saving template:', error)

    }
  }

  // Load user's custom templates
  const [userTemplates, setUserTemplates] = useState([])
  
  const loadUserTemplates = async () => {
    try {
      const response = await authService.authenticatedRequest('/api/templates/user')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setUserTemplates(data.templates)
        }
      }
    } catch (error) {
      console.log('Could not load user templates:', error)
    }
  }

  // Load user templates on mount
  useEffect(() => {
    loadUserTemplates()
  }, [])

  // Load custom template with scaling
  const loadCustomTemplate = (template) => {
    try {
      const templateData = typeof template.canvas_data === 'string' 
        ? JSON.parse(template.canvas_data) 
        : template.canvas_data
      
      // Determine original template size (use dimensions from first background element or detect orientation)
      const bgElement = templateData.elements.find(el => el.type === 'rect' && el.x === 0 && el.y === 0)
      let originalWidth = bgElement?.width || templateData.canvasSize?.width
      let originalHeight = bgElement?.height || templateData.canvasSize?.height
      
      // If no dimensions found, use defaults based on current orientation
      if (!originalWidth || !originalHeight) {
        if (orientation === 'portrait') {
          originalWidth = 800
          originalHeight = 1600
        } else {
          originalWidth = 2400
          originalHeight = 1200
        }
      }
      
      // Calculate scaling factors
      const scaleX = canvasSize.width / originalWidth
      const scaleY = canvasSize.height / originalHeight
      
      const scaledElements = templateData.elements.map(el => {
        const scaledElement = {
          ...el,
          id: `${el.type}-${Date.now()}-${Math.random()}`,
          draggable: true,
          x: el.x * scaleX,
          y: el.y * scaleY
        }
        
        // Apply the same scaling logic as loadTemplate
        if (el.width) scaledElement.width = el.width * scaleX
        if (el.height) scaledElement.height = el.height * scaleY
        if (el.fontSize) scaledElement.fontSize = Math.round(el.fontSize * Math.min(scaleX, scaleY))
        if (el.radius) scaledElement.radius = el.radius * Math.min(scaleX, scaleY)
        if (el.innerRadius) scaledElement.innerRadius = el.innerRadius * Math.min(scaleX, scaleY)
        if (el.outerRadius) scaledElement.outerRadius = el.outerRadius * Math.min(scaleX, scaleY)
        if (el.strokeWidth) scaledElement.strokeWidth = Math.max(1, Math.round(el.strokeWidth * Math.min(scaleX, scaleY)))
        if (el.points && Array.isArray(el.points)) {
          scaledElement.points = el.points.map((point, index) => 
            index % 2 === 0 ? point * scaleX : point * scaleY
          )
        }
        
        return scaledElement
      })
      
      setElements(scaledElements)
      
      if (templateData.backgroundColor) {
        setBackgroundColor(templateData.backgroundColor)
      }
      
      saveToHistory()
  
    } catch (error) {
      console.error('Error loading template:', error)

    }
  }

  // Layer management
  const moveLayer = (direction) => {
    if (!selectedId) return
    
    const currentIndex = elements.findIndex(el => el.id === selectedId)
    if (currentIndex === -1) return

    const newElements = [...elements]
    const element = newElements[currentIndex]

    if (direction === 'up' && currentIndex < newElements.length - 1) {
      newElements[currentIndex] = newElements[currentIndex + 1]
      newElements[currentIndex + 1] = element
    } else if (direction === 'down' && currentIndex > 0) {
      newElements[currentIndex] = newElements[currentIndex - 1]
      newElements[currentIndex - 1] = element
    }

    setElements(newElements)
    saveToHistory()
  }

  // Export canvas as professional print-ready PDF
  const exportCanvas = () => {
    try {
      const dimensions = getCurrentDimensions()
      
      // Convert feet to inches for PDF (1 foot = 12 inches)
      const widthInches = dimensions.width * 12
      const heightInches = dimensions.height * 12
      
      // Create PDF with exact banner dimensions
      const pdf = new jsPDF({
        orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
        unit: 'in',
        format: [widthInches, heightInches]
      })
      
      // Get high-resolution canvas data (300 DPI equivalent)
      const uri = stageRef.current.toDataURL({
        mimeType: 'image/jpeg',
        quality: 1,
        pixelRatio: 3 // 3x for high resolution
      })
      
      // Add the canvas image to PDF at full size with no margins
      pdf.addImage(uri, 'JPEG', 0, 0, widthInches, heightInches)
      
      // Add print information as metadata
      pdf.setProperties({
        title: `Banner ${dimensions.width}ft x ${dimensions.height}ft (${orientation})`,
        subject: 'Professional Banner for Print Production',
        author: 'Buy Printz Banner Editor',
        keywords: 'banner, print, production, 300dpi',
        creator: 'Buy Printz Professional Banner Editor'
      })
      
      // Generate filename
      const filename = useCustomSize 
        ? `${dimensions.width}x${dimensions.height}ft-custom-${orientation}-banner-print.pdf`
        : `${selectedBannerSize.replace(' x ', 'x').replace(' ', '').replace('ft', 'ft')}-${orientation}-banner-print.pdf`
      
      // Save the PDF
      pdf.save(filename)
      

    } catch (error) {
      console.error('Export error:', error)

    }
  }

  // Save design with enhanced banner specifications
  const saveDesign = async () => {
    const currentType = getCurrentBannerType()
    const currentDimensions = getCurrentDimensions()
    
    const designData = {
      elements,
      canvasSize,
      backgroundColor,
      timestamp: new Date().toISOString()
    }
    
    // Collect print options from the UI
    const printOptions = {
      grommets: 'every-2ft', // Default, could be made dynamic
      hem: 'standard-hem',
      windSlits: false,
      polePockets: 'none'
    }
    
    try {
      const response = await authService.authenticatedRequest('/api/designs/save-enhanced', {
        method: 'POST',
        body: JSON.stringify({
          name: `${currentType?.name || 'Custom'} Banner - ${new Date().toLocaleString()}`,
          canvas_data: designData,
          product_type: 'banner',
          dimensions: canvasSize,
          banner_type: selectedBannerType,
          banner_material: currentType?.material,
          banner_finish: currentType?.finish,
          banner_size: `${getCurrentDimensions().width}ft x ${getCurrentDimensions().height}ft (${orientation})`,
          banner_category: currentType?.category,
          background_color: backgroundColor,
          print_options: printOptions
        })
      })
      
      if (response.ok) {

      } else {
        throw new Error('Failed to save design')
      }
    } catch (error) {
      console.error('Error saving design:', error)

    }
  }

  // Proceed to checkout
  const proceedToCheckout = async () => {
    if (elements.length === 0) {

      return
    }

    const currentType = getCurrentBannerType()
    const currentDimensions = getCurrentDimensions()

    // Collect print options from the UI (could be made dynamic)
    const printOptions = {
      grommets: 'every-2ft',
      hem: 'standard-hem', 
      windSlits: false,
      polePockets: 'none'
    }

    const orderData = {
      product_type: 'banner',
      banner_type: selectedBannerType,
      banner_material: currentType?.material || 'Custom Material',
      banner_finish: currentType?.finish || 'Custom Finish',
      banner_size: `${getCurrentDimensions().width}ft x ${getCurrentDimensions().height}ft (${orientation})`,
      banner_category: currentType?.category || 'Custom',
      quantity: 1,
      dimensions: canvasSize,
      canvas_data: { elements, canvasSize, backgroundColor },
      background_color: backgroundColor,
      print_options: printOptions,
      total_amount: 0 // Price will be calculated at checkout
    }

    try {
      // Save canvas state to database for restoration if user returns
      const canvasData = {
        elements,
        canvasSize,
        backgroundColor
      }
      
      const bannerSettings = {
        selectedBannerType,
        selectedBannerSize,
        useCustomSize,
        customWidth,
        customHeight,
        orientation
      }
      
      await canvasStateService.saveCheckoutCanvasState(canvasData, bannerSettings)
      
      // Also auto-save current state as regular canvas state
      await canvasStateService.saveCanvasState(canvasData, bannerSettings)
      
      localStorage.setItem('orderData', JSON.stringify(orderData))
      navigate('/checkout')
    } catch (error) {
      console.error('Error saving canvas state:', error)

      
      // Fallback to localStorage if database save fails
      const canvasState = {
        elements,
        canvasSize,
        backgroundColor,
        selectedBannerType,
        selectedBannerSize,
        useCustomSize,
        customWidth,
        customHeight,
        orientation
      }
      localStorage.setItem('canvasState', JSON.stringify(canvasState))
      localStorage.setItem('orderData', JSON.stringify(orderData))
      navigate('/checkout')
    }
  }

  // Get current banner information
  const getCurrentBannerType = () => {
    return bannerTypes.find(type => type.id === selectedBannerType)
  }

  // Convert feet to pixels (300 DPI)
  const feetToPixels = (feet) => Math.round(feet * 300 * 12) // 300 DPI * 12 inches per foot

  // Get current banner dimensions with orientation
  const getCurrentDimensions = () => {
    let width, height
    
    if (useCustomSize) {
      width = customWidth
      height = customHeight
    } else {
      const preset = presetSizes.find(size => size.name === selectedBannerSize)
      if (preset) {
        width = preset.width
        height = preset.height
      } else {
        width = 2
        height = 4
      }
    }
    
    // Apply orientation - swap dimensions if portrait
    if (orientation === 'portrait' && width > height) {
      [width, height] = [height, width]
    } else if (orientation === 'landscape' && height > width) {
      [width, height] = [height, width]
    }
    
    return {
      width,
      height,
      pixels: {
        width: feetToPixels(width),
        height: feetToPixels(height)
      },
      orientation
    }
  }

  // Get workspace dimensions based on orientation and screen size
  const getWorkspaceDimensions = () => {
    return getResponsiveCanvasDimensions()
  }
  
  // Calculate scale factor from workspace to actual banner for export
  const getExportScale = () => {
    const actualDimensions = getCurrentDimensions()
    const workspaceDimensions = getWorkspaceDimensions()
    
    const scaleX = actualDimensions.pixels.width / workspaceDimensions.width
    const scaleY = actualDimensions.pixels.height / workspaceDimensions.height
    
    return { scaleX, scaleY }
  }

  // Update canvas size to fixed workspace dimensions based on orientation
  const updateCanvasSize = () => {
    const workspaceDims = getWorkspaceDimensions()
    setCanvasSize({
      width: workspaceDims.width,
      height: workspaceDims.height
    })
    saveToHistory()
  }

  // Switch between landscape and portrait templates
  const rotateBanner = () => {
    isRotatingRef.current = true // Prevent canvas size effect from interfering
    
    const newOrientation = orientation === 'landscape' ? 'portrait' : 'landscape'
    
    // Switch to different template size based on orientation
    setOrientation(newOrientation)
    
    // Canvas size will be updated by the useEffect that watches orientation
    
    // Transform elements to match new orientation - DISABLED for fixed workspace
    if (false && elements.length > 0 && oldWidth > 0 && oldHeight > 0) {
      const transformedElements = elements.map(element => {
        // For orientation change, we need to rotate the coordinate system
        // Portrait to Landscape: (x,y) -> (y, height-x)  
        // Landscape to Portrait: (x,y) -> (width-y, x)
        
        let newX, newY, newElementWidth, newElementHeight
        
        if (newOrientation === 'landscape') {
          // Portrait to Landscape transformation
          if (element.type === 'image') {
            // For images, preserve aspect ratio and ensure they fit in new canvas
            newX = element.y
            newY = oldHeight - element.x - element.height // Use height for positioning
            newElementWidth = element.width
            newElementHeight = element.height
            
            // Ensure image stays within new canvas bounds
            const newCanvasWidth = oldHeight // Swapped
            const newCanvasHeight = oldWidth // Swapped
            if (newX + newElementWidth > newCanvasWidth) {
              newX = Math.max(0, newCanvasWidth - newElementWidth)
            }
            if (newY + newElementHeight > newCanvasHeight) {
              newY = Math.max(0, newCanvasHeight - newElementHeight)
            }
          } else if (element.type === 'circle' || element.type === 'star' || 
                     element.type === 'triangle' || element.type === 'hexagon') {
            // For circular/radial elements, preserve shape and just reposition
            newX = element.y
            newY = oldHeight - element.x - (element.radius * 2 || element.outerRadius * 2 || 60)
            newElementWidth = element.width // Preserve original dimensions
            newElementHeight = element.height
          } else {
            // For text/rectangular shapes, swap dimensions and position
            newX = element.y
            newY = oldHeight - element.x - (element.width || 0)
            newElementWidth = element.height
            newElementHeight = element.width
          }
        } else {
          // Landscape to Portrait transformation  
          if (element.type === 'image') {
            // For images, preserve aspect ratio and ensure they fit in new canvas
            newX = oldWidth - element.y - element.width // Use width for positioning
            newY = element.x
            newElementWidth = element.width
            newElementHeight = element.height
            
            // Ensure image stays within new canvas bounds
            const newCanvasWidth = oldHeight // Swapped
            const newCanvasHeight = oldWidth // Swapped
            if (newX + newElementWidth > newCanvasWidth) {
              newX = Math.max(0, newCanvasWidth - newElementWidth)
            }
            if (newY + newElementHeight > newCanvasHeight) {
              newY = Math.max(0, newCanvasHeight - newElementHeight)
            }
          } else if (element.type === 'circle' || element.type === 'star' || 
                     element.type === 'triangle' || element.type === 'hexagon') {
            // For circular/radial elements, preserve shape and just reposition
            newX = oldWidth - element.y - (element.radius * 2 || element.outerRadius * 2 || 60)
            newY = element.x
            newElementWidth = element.width // Preserve original dimensions
            newElementHeight = element.height
          } else {
            // For text/rectangular shapes, swap dimensions and position
            newX = oldWidth - element.y - (element.height || 0)
            newY = element.x
            newElementWidth = element.height
            newElementHeight = element.width
          }
        }
        
        return {
          ...element,
          x: newX,
          y: newY,
          width: element.width ? newElementWidth : element.width,
          height: element.height ? newElementHeight : element.height,
          // Keep fontSize and strokeWidth the same - they shouldn't change with orientation
        }
      })
      
      setElements(transformedElements)
    }
    
    // Clear selection to avoid issues with transformed elements
    setSelectedId(null)
    
    // Orientation change complete - no canvas size update needed
    // Reset rotation flag immediately since workspace stays same size
    isRotatingRef.current = false
    
    saveToHistory()
  }

  // Get selected element
  const selectedElement = elements.find(el => el.id === selectedId)
  const currentDimensionsInfo = getCurrentDimensions()

  // Grid component
  const GridLines = () => {
    if (!showGrid) return null
    
    const gridSize = 100
    const lines = []
    
    for (let i = 0; i <= canvasSize.width; i += gridSize) {
      lines.push(
        <KonvaLine
          key={`v-${i}`}
          points={[i, 0, i, canvasSize.height]}
          stroke="#e5e7eb"
          strokeWidth={1}
          listening={false}
        />
      )
    }
    
    for (let i = 0; i <= canvasSize.height; i += gridSize) {
      lines.push(
        <KonvaLine
          key={`h-${i}`}
          points={[0, i, canvasSize.width, i]}
          stroke="#e5e7eb"
          strokeWidth={1}
          listening={false}
        />
      )
    }
    
    return lines
  }

  // Render elements
  const renderElement = (element) => {
    const commonProps = {
      id: element.id, // Essential for transformer to find elements
      name: element.id, // Alternative selector
      ...element,
      listening: true,
      onClick: () => handleSelect(element.id),
      onTap: () => handleSelect(element.id),
      onDblClick: element.type === 'text' ? () => {
        // Enable text editing mode
        const textElement = stageRef.current?.findOne(`#${element.id}`)
        if (textElement) {
          textElement.hide()
          
          // Create textarea for editing
          const textPosition = textElement.absolutePosition()
          const stage = textElement.getStage()
          const stageBox = stage.container().getBoundingClientRect()
          const areaPosition = {
            x: stageBox.left + textPosition.x * scale,
            y: stageBox.top + textPosition.y * scale
          }
          
          const textarea = document.createElement('textarea')
          document.body.appendChild(textarea)
          
          textarea.value = element.text
          textarea.style.position = 'absolute'
          textarea.style.top = areaPosition.y + 'px'
          textarea.style.left = areaPosition.x + 'px'
          textarea.style.width = (element.width || 200) * scale + 'px'
          textarea.style.fontSize = (element.fontSize || 24) * scale + 'px'
          textarea.style.border = '2px solid #4F46E5'
          textarea.style.padding = '4px'
          textarea.style.margin = '0px'
          textarea.style.overflow = 'hidden'
          textarea.style.background = 'white'
          textarea.style.outline = 'none'
          textarea.style.resize = 'none'
          textarea.style.fontFamily = element.fontFamily || 'Arial'
          textarea.style.color = element.fill || '#000000'
          textarea.style.textAlign = element.align || 'left'
          textarea.style.lineHeight = element.lineHeight || '1.2'
          textarea.style.zIndex = '1000'
          
          textarea.focus()
          textarea.select()
          
          const removeTextarea = () => {
            textarea.parentNode?.removeChild(textarea)
            textElement.show()
            textElement.getLayer().batchDraw()
          }
          
          textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleElementChange(element.id, { text: textarea.value })
              removeTextarea()
              saveToHistory()
            } else if (e.key === 'Escape') {
              removeTextarea()
            }
          })
          
          textarea.addEventListener('blur', () => {
            handleElementChange(element.id, { text: textarea.value })
            removeTextarea()
            saveToHistory()
          })
        }
      } : undefined,
      onDragEnd: (e) => {
        handleElementChange(element.id, {
          x: e.target.x(),
          y: e.target.y()
        })
        saveToHistory()
      },
      onTransformEnd: (e) => {
        const node = e.target
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        
        // Update element with new transform values
        const updates = {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation()
        }
        
        // Handle scaling for different element types
        if (element.type === 'text') {
          updates.fontSize = element.fontSize * Math.max(scaleX, scaleY)
          updates.scaleX = 1
          updates.scaleY = 1
        } else if (element.type === 'rect') {
          updates.width = element.width * scaleX
          updates.height = element.height * scaleY
          updates.scaleX = 1
          updates.scaleY = 1
        } else if (element.type === 'circle') {
          updates.radius = element.radius * Math.max(scaleX, scaleY)
          updates.scaleX = 1
          updates.scaleY = 1
        } else if (element.type === 'star') {
          updates.outerRadius = element.outerRadius * Math.max(scaleX, scaleY)
          updates.innerRadius = element.innerRadius * Math.max(scaleX, scaleY)
          updates.scaleX = 1
          updates.scaleY = 1
        } else if (element.type === 'arrow') {
          // Scale arrow points
          if (element.points) {
            const scaledPoints = element.points.map((point, index) => {
              return index % 2 === 0 ? point * scaleX : point * scaleY
            })
            updates.points = scaledPoints
          }
          updates.scaleX = 1
          updates.scaleY = 1
        } else if (element.type === 'image') {
          updates.width = element.width * scaleX
          updates.height = element.height * scaleY
          updates.scaleX = 1
          updates.scaleY = 1
        } else {
          updates.scaleX = scaleX
          updates.scaleY = scaleY
        }
        
        handleElementChange(element.id, updates)
        
        // Reset scale on the node to prevent double scaling
        node.scaleX(1)
        node.scaleY(1)
        
        saveToHistory()
      }
    }
    
    switch (element.type) {
      case 'text':
        return <Text key={element.id} {...commonProps} />
      case 'rect':
        return <Rect key={element.id} {...commonProps} />
      case 'circle':
        return <Circle key={element.id} {...commonProps} />
      case 'star':
        return <Star key={element.id} {...commonProps} />
      case 'triangle':
      case 'hexagon':
        return <RegularPolygon key={element.id} {...commonProps} />
      case 'arrow':
        return <KonvaLine key={element.id} {...commonProps} closed={true} />
      case 'image':
        const imageObj = new window.Image()
        imageObj.src = element.src
        return <KonvaImage key={element.id} {...commonProps} image={imageObj} />
      default:
        return null
    }
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col overflow-hidden">
      
      {/* Clean Modern Toolbar */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        {/* Main Header Row */}
        <div className="px-2 sm:px-4 lg:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              <span className="hidden sm:inline">Buy Printz Banner Studio</span>
              <span className="sm:hidden">Banner Studio</span>
            </h1>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-1 sm:space-x-3">
              {/* History Controls - Hide labels on mobile */}
              <div className="flex items-center space-x-1 bg-gray-50 rounded-lg p-1">
                <button 
                  onClick={undo} 
                  disabled={historyIndex <= 0} 
                  className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                  title="Undo"
                >
                  <Undo className="w-4 h-4 text-gray-600" />
                </button>
                <button 
                  onClick={redo} 
                  disabled={historyIndex >= history.length - 1} 
                  className="p-2 rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                  title="Redo"
                >
                  <Redo className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Zoom Controls - Compact on mobile */}
              <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-50 rounded-lg p-1 sm:p-2">
                <button 
                  onClick={zoomOut}
                  className="p-1 rounded hover:bg-white transition-colors"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </button>
                <span className="text-xs sm:text-sm font-medium text-gray-700 min-w-[2rem] sm:min-w-[3rem] text-center">
                  <span className="hidden sm:inline">{Math.round(scale * 100)}%</span>
                  <span className="sm:hidden">{Math.round(scale * 100)}</span>
                </span>
                <button 
                  onClick={zoomIn}
                  className="p-1 rounded hover:bg-white transition-colors"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600" />
                </button>
                <button 
                  onClick={resetZoom}
                  className="hidden sm:block px-2 py-1 rounded text-xs text-gray-600 hover:bg-white transition-colors"
                  title="Reset Zoom"
                >
                  Fit
                </button>
                <button 
                  onClick={() => {
                    // Mobile fit-to-screen
                    const availableWidth = viewportSize.width - 40
                    const availableHeight = viewportSize.height - 300
                    const scaleX = availableWidth / canvasSize.width
                    const scaleY = availableHeight / canvasSize.height
                    const optimalScale = Math.min(scaleX, scaleY, 1)
                    setScale(optimalScale)
                  }}
                  className="sm:hidden p-1 rounded text-xs text-gray-600 hover:bg-white transition-colors"
                  title="Fit to Screen"
                >
                  Fit
                </button>
              </div>

              {/* Utility Buttons */}
              <button 
                onClick={() => setShowGrid(!showGrid)} 
                className={`p-2 rounded-lg border transition-colors ${
                  showGrid 
                    ? 'bg-blue-50 text-blue-600 border-blue-200' 
                    : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                }`}
                title="Toggle Grid"
              >
                <Grid className="w-4 h-4" />
              </button>

              {/* Mobile Tools Toggle */}
              <button 
                onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                className="sm:hidden p-2 rounded-lg border bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 transition-colors"
                title="Toggle Tools Panel"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Element Controls - only show when element is selected, hide on mobile */}
              {selectedId && (
                <div className="hidden sm:flex items-center space-x-1 pl-3 border-l border-gray-300">
                  <button 
                    onClick={copySelected}
                    className="p-2 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-blue-600"
                    title="Copy (Ctrl+C)"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={pasteElement}
                    className="p-2 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-green-600"
                    title="Paste (Ctrl+V)"
                    disabled={!copiedElement}
                  >
                    <Clipboard className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={duplicateSelected}
                    className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Duplicate (Ctrl+D)"
                  >
                    <Copy className="w-4 h-4 text-gray-600" />
                  </button>
                  <button 
                    onClick={deleteSelected}
                    className="p-2 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors text-red-600"
                    title="Delete (Del)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Save & Export - Compact on mobile */}
              <div className="flex items-center space-x-1 sm:space-x-2 pl-2 sm:pl-3 border-l border-gray-300">
                <button 
                  onClick={saveDesign} 
                  className="px-2 sm:px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors flex items-center space-x-1 sm:space-x-2"
                >
                  <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Save</span>
                </button>
                <button 
                  onClick={saveAsTemplate} 
                  className="hidden sm:flex px-4 py-2 bg-purple-50 text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors items-center space-x-2"
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Template</span>
                </button>
                <button 
                  onClick={exportCanvas} 
                  className="px-2 sm:px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-lg hover:bg-green-100 transition-colors flex items-center space-x-1 sm:space-x-2"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline text-sm font-medium">Export</span>
                </button>
              </div>
              
              {/* Create Order */}
              <button
                onClick={proceedToCheckout}
                disabled={elements.length === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-3 sm:px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-1 sm:space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Order</span>
              </button>
            </div>
          </div>
        </div>

        {/* Settings Row - Scrollable on mobile */}
        <div className="px-2 sm:px-6 py-2 sm:py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center space-x-2 sm:space-x-6 overflow-x-auto pb-2 sm:pb-0">
            {/* Banner Type */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 min-w-0">Type:</label>
              <select 
                className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedBannerType}
                onChange={(e) => {
                  setSelectedBannerType(e.target.value)
                  saveToHistory()
                }}
              >
                {bannerTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Banner Size */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 min-w-0">Size:</label>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    setUseCustomSize(false)
                    const preset = presetSizes[0]
                    setSelectedBannerSize(preset.name)
                  }}
                  className={`px-3 py-1 text-sm rounded-md transition-all ${
                    !useCustomSize 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Preset
                </button>
                <button
                  onClick={() => setUseCustomSize(true)}
                  className={`px-3 py-1 text-sm rounded-md transition-all ${
                    useCustomSize 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Custom
                </button>
              </div>
              
              {!useCustomSize ? (
                <select 
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedBannerSize}
                  onChange={(e) => setSelectedBannerSize(e.target.value)}
                >
                  {presetSizes.map(size => (
                    <option key={size.name} value={size.name}>
                      {size.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="2"
                    max="50"
                    step="0.5"
                    value={customWidth}
                    onChange={(e) => setCustomWidth(Math.max(2, parseFloat(e.target.value) || 2))}
                    className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">×</span>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    step="0.5"
                    value={customHeight}
                    onChange={(e) => setCustomHeight(Math.max(1, parseFloat(e.target.value) || 1))}
                    className="w-16 bg-white border border-gray-300 rounded-lg px-2 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-sm text-gray-500">ft</span>
                </div>
              )}
            </div>

            {/* Orientation */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 min-w-0">Orientation:</label>
              <div className="flex space-x-1">
                <button
                  onClick={() => setOrientation('landscape')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center space-x-1 ${
                    orientation === 'landscape'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-3 h-2 bg-current rounded-sm opacity-60"></div>
                  <span>Landscape</span>
                </button>
                <button
                  onClick={() => setOrientation('portrait')}
                  className={`px-3 py-2 text-sm rounded-lg transition-all flex items-center space-x-1 ${
                    orientation === 'portrait'
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="w-2 h-3 bg-current rounded-sm opacity-60"></div>
                  <span>Portrait</span>
                </button>
              </div>
              <button
                onClick={rotateBanner}
                className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Rotate Banner"
              >
                <RotateCw className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Banner Info */}
            <div className="flex items-center text-sm text-gray-600 bg-white border border-gray-300 rounded-lg px-3 py-2">
              <span className="font-medium">
                {getCurrentDimensions().width}ft × {getCurrentDimensions().height}ft
              </span>
              <span className="mx-2 text-gray-400">•</span>
              <span>{getCurrentBannerType()?.material}</span>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-500">{getCurrentDimensions().pixels.width} × {getCurrentDimensions().pixels.height}px</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Professional Tools Panel - Collapsible on mobile */}
        <div className={`w-full sm:w-80 lg:w-96 bg-gray-100 border-r shadow-neumorphic-inset overflow-y-auto ${isMobileToolsOpen ? 'block' : 'hidden sm:block'}`}>
          <div className="p-3 sm:p-6">
            
            {/* Tab Navigation - Mobile responsive */}
            <div className="neumorphic-container p-2 sm:p-3 rounded-xl mb-4 sm:mb-6">
              <div className="grid grid-cols-4 gap-1 sm:gap-2">
                {[
                  { key: 'tools', label: 'Tools', icon: Settings },
                  { key: 'shapes', label: 'Shapes', icon: Square },
                  { key: 'templates', label: 'Templates', icon: Copy },
                  { key: 'effects', label: 'Effects', icon: Palette }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`p-2 sm:p-3 rounded-lg text-xs font-medium transition-all flex flex-col items-center space-y-1 ${
                      activeTab === tab.key 
                        ? 'neumorphic-active text-blue-600 bg-blue-50' 
                        : 'neumorphic-button text-gray-600 hover:text-gray-800'
                    }`}
                  >
                    <tab.icon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="text-xs">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tools Tab */}
            {activeTab === 'tools' && (
              <div className="space-y-6">
                {/* Banner Specifications */}
                <div className="neumorphic-container p-5 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Info className="w-5 h-5 mr-3 text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-800">Banner Specifications</h3>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Type:</span>
                      <span className="text-sm font-bold text-gray-800">{getCurrentBannerType()?.category || 'Custom'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Dimensions:</span>
                      <span className="text-sm font-bold text-gray-800">
                        {useCustomSize 
                          ? `${customWidth}ft x ${customHeight}ft (Custom)` 
                          : selectedBannerSize
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Material:</span>
                      <span className="text-sm font-bold text-gray-800">{getCurrentBannerType()?.material || 'Custom Material'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Finish:</span>
                      <span className="text-sm font-bold text-gray-800">{getCurrentBannerType()?.finish || 'Custom Finish'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-600">Resolution:</span>
                      <span className="text-sm font-bold text-gray-800">Professional Print Quality</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {getCurrentBannerType()?.specs || 'Professional quality banner printing with premium materials and finishes.'}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1 pt-2">
                      {(getCurrentBannerType()?.uses || ['Custom Use']).map((use, index) => (
                        <span key={index} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Design Tools */}
                <div className="neumorphic-container p-5 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Type className="w-5 h-5 mr-3 text-green-500" />
                    <h3 className="text-lg font-bold text-gray-800">Design Tools</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={addText}
                      className="neumorphic-tool-button group flex flex-col items-center p-4 rounded-xl transition-all hover:scale-105"
                    >
                      <Type className="w-7 h-7 mb-2 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Add Text</span>
                    </button>
                    <button
                      onClick={() => addShape('rect')}
                      className="neumorphic-tool-button group flex flex-col items-center p-4 rounded-xl transition-all hover:scale-105"
                    >
                      <Square className="w-7 h-7 mb-2 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Rectangle</span>
                    </button>
                    <button
                      onClick={() => addShape('circle')}
                      className="neumorphic-tool-button group flex flex-col items-center p-4 rounded-xl transition-all hover:scale-105"
                    >
                      <CircleIcon className="w-7 h-7 mb-2 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Circle</span>
                    </button>
                    <button
                      onClick={() => addShape('star')}
                      className="neumorphic-tool-button group flex flex-col items-center p-4 rounded-xl transition-all hover:scale-105"
                    >
                      <StarIcon className="w-7 h-7 mb-2 text-gray-600 group-hover:text-blue-600 transition-colors" />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">Star</span>
                    </button>
                  </div>
                </div>

                {/* Image Upload */}
                <div className="neumorphic-container p-5 rounded-xl">
                  <div className="flex items-center mb-4">
                    <ImageIcon className="w-5 h-5 mr-3 text-purple-500" />
                    <h3 className="text-lg font-bold text-gray-800">Upload Images</h3>
                  </div>
                  <div 
                    {...getRootProps()} 
                    className="neumorphic-input-container border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 transition-all group"
                  >
                    <input {...getInputProps()} />
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    <p className="text-sm text-gray-700 font-medium mb-1">
                      {isDragActive ? 'Drop image here' : 'Drag & drop or click to upload'}
                    </p>
                    <p className="text-xs text-gray-500">
                      JPG, PNG, SVG • Max 10MB
                    </p>
                  </div>
                  

                </div>

                {/* Keyboard Shortcuts */}
                <div className="neumorphic-container p-5 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Info className="w-5 h-5 mr-3 text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-800">Keyboard Shortcuts</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center bg-white bg-opacity-50 rounded p-2">
                      <span className="text-gray-700">Copy</span>
                      <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">Ctrl+C</span>
                    </div>
                    <div className="flex justify-between items-center bg-white bg-opacity-50 rounded p-2">
                      <span className="text-gray-700">Paste</span>
                      <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">Ctrl+V</span>
                    </div>
                    <div className="flex justify-between items-center bg-white bg-opacity-50 rounded p-2">
                      <span className="text-gray-700">Duplicate</span>
                      <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">Ctrl+D</span>
                    </div>
                    <div className="flex justify-between items-center bg-white bg-opacity-50 rounded p-2">
                      <span className="text-gray-700">Delete</span>
                      <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">Del</span>
                    </div>
                  </div>
                </div>

                {/* Banner Options */}
                <div className="neumorphic-container p-5 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Settings className="w-5 h-5 mr-3 text-orange-500" />
                    <h3 className="text-lg font-bold text-gray-800">Banner Options</h3>
                  </div>
                  <div className="space-y-4">
                    {/* Grommets */}
                    <div className="bg-white bg-opacity-50 rounded-lg p-3">
                      <label className="block text-sm font-bold text-gray-800 mb-2">Grommets (Eyelets)</label>
                      <select className="w-full neumorphic-input-container p-2 rounded-lg text-sm border-none bg-transparent focus:outline-none">
                        <option value="every-2ft">Every 2 feet (Standard)</option>
                        <option value="every-18in">Every 18 inches</option>
                        <option value="corners-only">Corners only</option>
                        <option value="no-grommets">No grommets</option>
                      </select>
                    </div>

                    {/* Hem & Reinforcement */}
                    <div className="bg-white bg-opacity-50 rounded-lg p-3">
                      <label className="block text-sm font-bold text-gray-800 mb-2">Hem & Reinforcement</label>
                      <select className="w-full neumorphic-input-container p-2 rounded-lg text-sm border-none bg-transparent focus:outline-none">
                        <option value="standard-hem">Standard 1" hem</option>
                        <option value="reinforced-hem">Reinforced double hem</option>
                        <option value="welded-hem">Heat welded hem</option>
                        <option value="rope-hem">Rope reinforced hem</option>
                      </select>
                    </div>

                    {/* Wind Slits */}
                    <div className="bg-white bg-opacity-50 rounded-lg p-3">
                      <label className="flex items-center text-sm font-bold text-gray-800">
                        <input 
                          type="checkbox" 
                          className="mr-2 rounded" 
                          defaultChecked={false}
                        />
                        Add wind slits for outdoor use
                      </label>
                      <p className="text-xs text-gray-600 mt-1">Reduces wind resistance for large banners</p>
                    </div>

                    {/* Pole Pockets */}
                    <div className="bg-white bg-opacity-50 rounded-lg p-3">
                      <label className="block text-sm font-bold text-gray-800 mb-2">Pole Pockets</label>
                      <select className="w-full neumorphic-input-container p-2 rounded-lg text-sm border-none bg-transparent focus:outline-none">
                        <option value="none">No pole pockets</option>
                        <option value="top">Top pole pocket</option>
                        <option value="top-bottom">Top & bottom pole pockets</option>
                        <option value="sides">Side pole pockets</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Background */}
                <div className="neumorphic-container p-5 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Palette className="w-5 h-5 mr-3 text-pink-500" />
                    <h3 className="text-lg font-bold text-gray-800">Background Color</h3>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <div className="neumorphic-input-container p-2 rounded-lg">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => {
                          setBackgroundColor(e.target.value)
                          saveToHistory()
                        }}
                        className="w-full h-12 border-none rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-600">Current color:</span>
                      <span className="text-xs font-mono text-gray-800 bg-white px-2 py-1 rounded">
                        {backgroundColor.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Shapes Tab */}
            {activeTab === 'shapes' && (
              <div className="space-y-6">
                {/* Shape Library */}
                <div className="neumorphic-container p-5 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Square className="w-5 h-5 mr-3 text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-800">Basic Shapes</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {shapeLibrary.map((shape) => (
                      <button
                        key={shape.type}
                        onClick={() => addShape(shape.type)}
                        className="neumorphic-tool-button group flex flex-col items-center p-4 rounded-xl transition-all hover:scale-105"
                      >
                        <shape.icon className="w-7 h-7 mb-2 text-gray-600 group-hover:text-blue-600 transition-colors" />
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{shape.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Icon Library */}
                <div className="neumorphic-container p-5 rounded-xl">
                  <div className="flex items-center mb-4">
                    <StarIcon className="w-5 h-5 mr-3 text-purple-500" />
                    <h3 className="text-lg font-bold text-gray-800">Business Icons</h3>
                  </div>
                  <div className="bg-white bg-opacity-50 rounded-lg p-3">
                    <div className="grid grid-cols-3 gap-3 max-h-80 overflow-y-auto">
                      {iconLibrary.map((icon) => (
                        <button
                          key={icon.name}
                          onClick={() => addIcon(icon.name)}
                          className="neumorphic-tool-button group flex flex-col items-center p-3 rounded-lg transition-all hover:scale-105"
                        >
                          <icon.icon className="w-6 h-6 mb-1 text-gray-600 group-hover:text-purple-600 transition-colors" />
                          <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{icon.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600 text-center">
                        Click any icon to add to your banner design
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                {/* User Templates */}
                {userTemplates.length > 0 && (
                  <div className="neumorphic-container p-5 rounded-xl">
                    <div className="flex items-center mb-4">
                      <FileText className="w-5 h-5 mr-3 text-purple-500" />
                      <h3 className="text-lg font-bold text-gray-800">My Templates</h3>
                    </div>
                    
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {userTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => loadCustomTemplate(template)}
                          className="w-full neumorphic-tool-button group p-4 rounded-xl text-left transition-all hover:scale-102"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-bold text-gray-800 group-hover:text-gray-900 text-base mb-1">
                                {template.name}
                              </div>
                              <div className="text-xs text-gray-600 group-hover:text-gray-700 mb-2">
                                {template.description}
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                                  Custom
                                </span>
                                <span className="text-xs text-gray-500">
                                  {new Date(template.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="text-purple-500 group-hover:text-purple-600 transition-colors ml-3 flex-shrink-0">
                              <CornerDownRight className="w-5 h-5" />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="neumorphic-container p-5 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Copy className="w-5 h-5 mr-3 text-green-500" />
                    <h3 className="text-lg font-bold text-gray-800">Professional Templates</h3>
                  </div>
                  
                  {/* Template Categories */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(bannerTemplates.map(t => t.category))].map((category) => (
                        <span key={category} className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bannerTemplates
                      .filter(template => {
                        // Show templates that match current orientation or are universal
                        if (template.orientation) {
                          return template.orientation === orientation
                        }
                        // Templates without orientation specified work for landscape (default)
                        return orientation === 'landscape'
                      })
                      .map((template) => (
                      <button
                        key={template.id}
                        onClick={() => loadTemplate(template)}
                        className="w-full neumorphic-tool-button group p-4 rounded-xl text-left transition-all hover:scale-102"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-bold text-gray-800 group-hover:text-gray-900 text-base mb-1">
                              {template.name}
                            </div>
                            <div className="text-xs text-gray-600 group-hover:text-gray-700 mb-2">
                              {template.description}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                {template.category}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {template.tags.slice(0, 2).map((tag, index) => (
                                  <span key={index} className="inline-block bg-gray-100 text-gray-600 text-xs px-1 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-green-500 group-hover:text-green-600 transition-colors ml-3 flex-shrink-0">
                            <CornerDownRight className="w-5 h-5" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs text-green-700 font-medium text-center">
                        ✨ {bannerTemplates.length} Professional Templates • All elements fully customizable
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Effects Tab */}
            {activeTab === 'effects' && !selectedElement && (
              <div className="space-y-6">
                <div className="neumorphic-container p-8 rounded-xl text-center">
                  <div className="text-gray-400 mb-4">
                    <MousePointer className="w-16 h-16 mx-auto" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">Select an Element</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Click on any text, shape, or image in your banner to access advanced editing options and effects.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-700 font-medium">
                      💡 Tip: Double-click text elements to edit them directly on the canvas
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'effects' && selectedElement && (
              <div className="space-y-6">
                {/* Element Properties */}
                <div className="neumorphic-container p-5 rounded-xl">
                  <div className="flex items-center mb-4">
                    <Palette className="w-5 h-5 mr-3 text-indigo-500" />
                    <h3 className="text-lg font-bold text-gray-800">
                      {selectedElement.type === 'text' ? 'Text Properties' : 'Element Properties'}
                    </h3>
                  </div>
                  
                  {/* Element Actions */}
                  <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
                    <label className="block text-sm font-bold text-gray-800 mb-3">Quick Actions</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={copySelected}
                        className="neumorphic-button group p-3 rounded-lg text-blue-600 hover:text-blue-700 transition-colors flex items-center justify-center"
                        title="Copy (Ctrl+C)"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Copy</span>
                      </button>
                      <button
                        onClick={pasteElement}
                        className="neumorphic-button group p-3 rounded-lg text-green-600 hover:text-green-700 transition-colors flex items-center justify-center"
                        title="Paste (Ctrl+V)"
                        disabled={!copiedElement}
                      >
                        <Clipboard className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Paste</span>
                      </button>
                      <button
                        onClick={duplicateSelected}
                        className="neumorphic-button group p-3 rounded-lg text-gray-600 hover:text-blue-600 transition-colors flex items-center justify-center"
                        title="Duplicate (Ctrl+D)"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Duplicate</span>
                      </button>
                      <button
                        onClick={deleteSelected}
                        className="neumorphic-button group p-3 rounded-lg text-red-600 hover:text-red-700 transition-colors flex items-center justify-center"
                        title="Delete (Del)"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Alignment Tools */}
                  <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4">
                    <label className="block text-sm font-bold text-gray-800 mb-3">Alignment</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => alignElements('left')} 
                        className="neumorphic-button group p-3 rounded-lg hover:bg-blue-50 transition-colors flex flex-col items-center"
                      >
                        <AlignLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                        <span className="text-xs text-gray-600 mt-1">Left</span>
                      </button>
                      <button 
                        onClick={() => alignElements('center-h')} 
                        className="neumorphic-button group p-3 rounded-lg hover:bg-blue-50 transition-colors flex flex-col items-center"
                      >
                        <AlignCenter className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                        <span className="text-xs text-gray-600 mt-1">Center</span>
                      </button>
                      <button 
                        onClick={() => alignElements('right')} 
                        className="neumorphic-button group p-3 rounded-lg hover:bg-blue-50 transition-colors flex flex-col items-center"
                      >
                        <AlignRight className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors" />
                        <span className="text-xs text-gray-600 mt-1">Right</span>
                      </button>
                    </div>
                  </div>

                  {/* Text Properties */}
                  {selectedElement.type === 'text' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
                        <div className="neumorphic-input-container p-2 rounded-lg">
                          <textarea
                            value={selectedElement.text}
                            onChange={(e) => handleElementChange(selectedId, { text: e.target.value })}
                            className="w-full bg-transparent border-none resize-none focus:outline-none text-sm"
                            rows="2"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Font Size: {selectedElement.fontSize}px
                        </label>
                        <div className="neumorphic-input-container p-2 rounded-lg">
                          <input
                            type="range"
                            min="12"
                            max="200"
                            value={selectedElement.fontSize}
                            onChange={(e) => handleElementChange(selectedId, { fontSize: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Font Family</label>
                        <div className="neumorphic-input-container p-2 rounded-lg">
                          <select
                            value={selectedElement.fontFamily}
                            onChange={(e) => handleElementChange(selectedId, { fontFamily: e.target.value })}
                            className="w-full bg-transparent border-none focus:outline-none text-sm"
                          >
                            <option value="Arial">Arial</option>
                            <option value="Arial Black">Arial Black</option>
                            <option value="Helvetica">Helvetica</option>
                            <option value="Impact">Impact</option>
                            <option value="Times New Roman">Times New Roman</option>
                            <option value="Georgia">Georgia</option>
                            <option value="Verdana">Verdana</option>
                            <option value="Comic Sans MS">Comic Sans MS</option>
                            <option value="Courier New">Courier New</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                        <div className="neumorphic-input-container p-2 rounded-lg">
                          <input
                            type="color"
                            value={selectedElement.fill}
                            onChange={(e) => handleElementChange(selectedId, { fill: e.target.value })}
                            className="w-full h-10 border-none rounded cursor-pointer"
                          />
                        </div>
                      </div>

                      {/* Text Effects */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text Stroke</label>
                        <div className="space-y-2">
                          <div className="neumorphic-input-container p-2 rounded-lg">
                            <input
                              type="color"
                              value={selectedElement.stroke || '#000000'}
                              onChange={(e) => handleElementChange(selectedId, { stroke: e.target.value })}
                              className="w-full h-8 border-none rounded cursor-pointer"
                            />
                          </div>
                          <div className="neumorphic-input-container p-2 rounded-lg">
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={selectedElement.strokeWidth || 0}
                              onChange={(e) => handleElementChange(selectedId, { strokeWidth: parseInt(e.target.value) })}
                              className="w-full"
                            />
                            <span className="text-xs text-gray-600">Stroke: {selectedElement.strokeWidth || 0}px</span>
                          </div>
                        </div>
                      </div>

                      {/* Text Shadow */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Text Shadow</label>
                        <div className="space-y-2">
                          <div className="neumorphic-input-container p-2 rounded-lg">
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={selectedElement.shadowBlur || 0}
                              onChange={(e) => handleElementChange(selectedId, { shadowBlur: parseInt(e.target.value) })}
                              className="w-full"
                            />
                            <span className="text-xs text-gray-600">Blur: {selectedElement.shadowBlur || 0}px</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="neumorphic-input-container p-2 rounded-lg">
                              <input
                                type="range"
                                min="-20"
                                max="20"
                                value={selectedElement.shadowOffsetX || 0}
                                onChange={(e) => handleElementChange(selectedId, { shadowOffsetX: parseInt(e.target.value) })}
                                className="w-full"
                              />
                              <span className="text-xs text-gray-600">X: {selectedElement.shadowOffsetX || 0}</span>
                            </div>
                            <div className="neumorphic-input-container p-2 rounded-lg">
                              <input
                                type="range"
                                min="-20"
                                max="20"
                                value={selectedElement.shadowOffsetY || 0}
                                onChange={(e) => handleElementChange(selectedId, { shadowOffsetY: parseInt(e.target.value) })}
                                className="w-full"
                              />
                              <span className="text-xs text-gray-600">Y: {selectedElement.shadowOffsetY || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleElementChange(selectedId, { 
                            fontStyle: selectedElement.fontStyle === 'bold' ? 'normal' : 'bold' 
                          })}
                          className={`neumorphic-button p-3 rounded-lg ${selectedElement.fontStyle === 'bold' ? 'neumorphic-active' : ''}`}
                        >
                          <Bold className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleElementChange(selectedId, { 
                            fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' 
                          })}
                          className={`neumorphic-button p-3 rounded-lg ${selectedElement.fontStyle === 'italic' ? 'neumorphic-active' : ''}`}
                        >
                          <Italic className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleElementChange(selectedId, { 
                            textDecoration: selectedElement.textDecoration === 'underline' ? '' : 'underline' 
                          })}
                          className={`neumorphic-button p-3 rounded-lg ${selectedElement.textDecoration === 'underline' ? 'neumorphic-active' : ''}`}
                        >
                          <Underline className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Shape Properties */}
                  {(selectedElement.type === 'rect' || selectedElement.type === 'circle' || selectedElement.type === 'star') && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fill Color</label>
                        <div className="neumorphic-input-container p-2 rounded-lg">
                          <input
                            type="color"
                            value={selectedElement.fill}
                            onChange={(e) => handleElementChange(selectedId, { fill: e.target.value })}
                            className="w-full h-10 border-none rounded cursor-pointer"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stroke Color</label>
                        <div className="neumorphic-input-container p-2 rounded-lg">
                          <input
                            type="color"
                            value={selectedElement.stroke || '#000000'}
                            onChange={(e) => handleElementChange(selectedId, { stroke: e.target.value })}
                            className="w-full h-10 border-none rounded cursor-pointer"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Stroke Width: {selectedElement.strokeWidth || 0}px
                        </label>
                        <div className="neumorphic-input-container p-2 rounded-lg">
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={selectedElement.strokeWidth || 0}
                            onChange={(e) => handleElementChange(selectedId, { strokeWidth: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Transparency Control */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Transparency
                    </label>
                    <div className="neumorphic-input-container p-2 rounded-lg">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={selectedElement.opacity || 1}
                        onChange={(e) => setOpacityForSelected(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Arrange Controls */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Arrange</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => moveLayer('up')} className="neumorphic-button p-2 rounded-lg text-xs">
                        Move Forward
                      </button>
                      <button onClick={() => moveLayer('down')} className="neumorphic-button p-2 rounded-lg text-xs">
                        Move Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas Area - Fixed Workspace - Mobile Responsive */}
        <div className={`flex-1 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden ${isMobileToolsOpen ? 'hidden sm:block' : 'block'}`}>
          <div id="canvas-container" className="w-full h-full p-2 sm:p-4 flex flex-col items-center justify-center">
              {/* Banner Details - Always at top, never rotated - Compact on mobile */}
              <div className="mb-2 sm:mb-4 text-center">
                <div className="text-sm sm:text-lg font-bold text-gray-800 mb-1">
                  <span className="hidden sm:inline">{getCurrentBannerType()?.name || 'Custom Banner'}</span>
                  <span className="sm:hidden">{getCurrentBannerType()?.name?.split(' ')[0] || 'Banner'}</span>
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  <span className="hidden sm:inline">{Math.round(scale * 100)}% scale • Print: {getCurrentDimensions().width}ft x {getCurrentDimensions().height}ft ({orientation}) • PDF Ready</span>
                  <span className="sm:hidden">{getCurrentDimensions().width}x{getCurrentDimensions().height}ft • {Math.round(scale * 100)}%</span>
                </div>
              </div>
              
              {/* Canvas Area - Fully Responsive */}
              <div className="neumorphic-container p-2 sm:p-8 rounded-2xl bg-white flex items-center justify-center w-full max-w-full">
                <div className="neumorphic-inset rounded-xl overflow-hidden max-w-full max-h-full" style={{
                  width: Math.min(canvasSize.width * scale, viewportSize.width - (isMobileView ? 40 : 200)),
                  height: Math.min(canvasSize.height * scale, viewportSize.height - (isMobileView ? 300 : 400))
                }}>
                <Stage
                  ref={stageRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  scale={{ x: scale, y: scale }}
                  onMouseDown={(e) => {
                    if (e.target === e.target.getStage()) {
                      setSelectedId(null)
                    }
                  }}
                >
                  <Layer>
                    {/* Background */}
                    <Rect
                      width={canvasSize.width}
                      height={canvasSize.height}
                      fill={backgroundColor}
                    />
                    
                    {/* Grid */}
                    <GridLines />
                    
                    {/* Elements */}
                    {elements.map((element) => renderElement(element))}
                    
                    {/* Transformer for selected element */}
                    <Transformer
                      ref={transformerRef}
                      boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) {
                          return oldBox
                        }
                        return newBox
                      }}
                      enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
                      rotateEnabled={true}
                      borderEnabled={true}
                      anchorSize={8}
                      anchorStroke="#4F46E5"
                      anchorFill="#EEF2FF"
                      borderStroke="#4F46E5"
                      borderStrokeWidth={2}
                      visible={!!selectedId}
                    />
                  </Layer>
                </Stage>
                </div>
              </div>
          </div>
        </div>
      </div>

      <style>{`
        #canvas-container {
          /* Fixed workspace - no scrolling */
        }
        
        /* Canvas container styles now handled by Tailwind classes */
        
        /* Ensure canvas has comfortable workspace padding */
        .neumorphic-container {
          background: #e6e6e6;
          box-shadow: 8px 8px 16px #c1c1c1, -8px -8px 16px #ffffff;
          margin: 1rem; /* Consistent margins for 10% zoom view */
          min-width: fit-content;
        }
        
        .neumorphic-button {
          background: #e6e6e6;
          box-shadow: 4px 4px 8px #c1c1c1, -4px -4px 8px #ffffff;
          border: none;
          transition: all 0.2s ease;
        }
        
        .neumorphic-button:hover {
          box-shadow: 6px 6px 12px #c1c1c1, -6px -6px 12px #ffffff;
        }
        
        .neumorphic-button:active {
          box-shadow: inset 4px 4px 8px #c1c1c1, inset -4px -4px 8px #ffffff;
        }
        
        .neumorphic-button-primary {
          background: linear-gradient(145deg, #667eea, #764ba2);
          box-shadow: 4px 4px 8px #c1c1c1, -4px -4px 8px #ffffff;
          border: none;
          transition: all 0.2s ease;
        }
        
        .neumorphic-button-primary:hover {
          box-shadow: 6px 6px 12px #c1c1c1, -6px -6px 12px #ffffff;
          transform: translateY(-1px);
        }
        
        .neumorphic-tool-button {
          background: #e6e6e6;
          box-shadow: 4px 4px 8px #c1c1c1, -4px -4px 8px #ffffff;
          border: none;
          transition: all 0.2s ease;
        }
        
        .neumorphic-tool-button:hover {
          box-shadow: 6px 6px 12px #c1c1c1, -6px -6px 12px #ffffff;
          transform: translateY(-1px);
        }
        
        .neumorphic-input-container {
          background: #e6e6e6;
          box-shadow: inset 4px 4px 8px #c1c1c1, inset -4px -4px 8px #ffffff;
        }
        
        .neumorphic-inset {
          background: #e6e6e6;
          box-shadow: inset 8px 8px 16px #c1c1c1, inset -8px -8px 16px #ffffff;
        }
        
        .neumorphic-active {
          box-shadow: inset 4px 4px 8px #c1c1c1, inset -4px -4px 8px #ffffff;
        }
        
        .shadow-neumorphic-inset {
          box-shadow: inset 8px 8px 16px #c1c1c1, inset -8px -8px 16px #ffffff;
        }
      `}</style>
    </div>
  )
}

export default BannerEditor