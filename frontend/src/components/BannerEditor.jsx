import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import jsPDF from 'jspdf'
import { QRCodeCanvas } from 'qrcode.react'
import { createRoot } from 'react-dom/client'
import { 
  ChevronLeft, 
  Settings, 
  ShoppingCart,
  Menu,
  X,
  QrCode,
  Link,
  Palette,
  Trash2
} from 'lucide-react'
import BannerSidebar from './BannerSidebar'
import BannerCanvas from './BannerCanvas'
import OnboardingTour from './OnboardingTour'
import SaveModal from './SaveModal'
import SuccessNotification from './SuccessNotification'
import authService from '../services/auth'
import cacheService from '../services/cache'

const BannerEditorNew = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Product type selection - Must be declared first
  const [productType, setProductType] = useState(() => {
    // Initialize from URL parameter
    const urlProduct = searchParams.get('product')
    if (urlProduct === 'tin') return 'tin'
    if (urlProduct === 'tent') return 'tent'
    return 'banner' // default
  })
  
  // Surface navigation state - Must be declared before elements
  const [currentSurface, setCurrentSurface] = useState(() => {
    const urlProduct = searchParams.get('product')
    if (urlProduct === 'tin') return 'front'
    if (urlProduct === 'tent') return 'canopy_front'
    return 'front'
  })
  
  // Core state - Multi-surface support for tins and tents
  const [surfaceElements, setSurfaceElements] = useState({
    // Tin surfaces
    front: [],
    back: [],
    inside: [],
    lid: [],
    // Tent surfaces
    canopy_front: [],
    canopy_back: [],
    canopy_left: [],
    canopy_right: [],
    sidewall_left: [],
    sidewall_right: [],
    backwall: []
  })
  
  // Current elements based on product type and surface
  const elements = (productType === 'tin' || productType === 'tent') ? surfaceElements[currentSurface] : surfaceElements.front
  const setElements = (productType === 'tin' || productType === 'tent')
    ? (newElements) => {
        setSurfaceElements(prev => ({
          ...prev,
          [currentSurface]: typeof newElements === 'function' ? newElements(prev[currentSurface]) : newElements
        }))
      }
    : (newElements) => {
        setSurfaceElements(prev => ({
          ...prev,
          front: typeof newElements === 'function' ? newElements(prev.front) : newElements
        }))
      }
  
  const [selectedId, setSelectedId] = useState(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  
  // Navigation state
  const [cameFromTemplate, setCameFromTemplate] = useState(false)
  
  // Tour state
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false)
  const [showTour, setShowTour] = useState(false)
  
  
  // Save Modal state
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [saveModalType, setSaveModalType] = useState('template') // Only templates now
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  
  // Success Notification state
  const [showSuccessNotification, setShowSuccessNotification] = useState(false)
  const [successMessage, setSuccessMessage] = useState({ title: '', message: '' })
  
  
  // Canvas configuration - Initialize based on product type
  const [canvasSize, setCanvasSize] = useState(() => {
    const urlProduct = searchParams.get('product')
    if (urlProduct === 'tin') return { width: 374, height: 225 } // tin default
    if (urlProduct === 'tent') return { width: 1160, height: 789 } // tent canopy default (116" x 78.86" scaled to pixels)
    return { width: 800, height: 400 } // banner default
  })

  // Triangular clipping function for tent canopy
  const getTentCanopyClipFunc = () => {
    return (ctx) => {
      ctx.beginPath()
      // Create triangular path for tent canopy
      // Top point (center top)
      ctx.moveTo(canvasSize.width / 2, 0)
      // Bottom left point
      ctx.lineTo(0, canvasSize.height)
      // Bottom right point
      ctx.lineTo(canvasSize.width, canvasSize.height)
      ctx.closePath()
    }
  }
  const [backgroundColor, setBackgroundColor] = useState('#ffffff')
  const [canvasOrientation, setCanvasOrientation] = useState(() => {
    const urlProduct = searchParams.get('product')
    if (urlProduct === 'tin') return 'landscape'
    if (urlProduct === 'tent') return 'landscape' // tent canopy is landscape
    return 'landscape'
  })
  
  // Tin specifications state
  const [tinSpecs, setTinSpecs] = useState({
    finish: 'silver',
    surfaceCoverage: 'front-back',
    printingMethod: 'premium-vinyl'
  })
  
  // Banner size presets - Standard banner dimensions (H x W format)
  const bannerSizes = [
    // Landscape Banners (Horizontal - wider than tall)
    { name: '2x3 ft (Landscape)', width: 900, height: 600, orientation: 'landscape', category: 'landscape' },
    { name: '2x4 ft (Landscape)', width: 1200, height: 600, orientation: 'landscape', category: 'landscape' },
    { name: '2x5 ft (Landscape)', width: 1500, height: 600, orientation: 'landscape', category: 'landscape' },
    { name: '2x6 ft (Landscape)', width: 1800, height: 600, orientation: 'landscape', category: 'landscape' },
    { name: '3x4 ft (Landscape)', width: 1200, height: 900, orientation: 'landscape', category: 'landscape' },
    { name: '3x5 ft (Landscape)', width: 1500, height: 900, orientation: 'landscape', category: 'landscape' },
    { name: '3x6 ft (Landscape)', width: 1800, height: 900, orientation: 'landscape', category: 'landscape' },
    { name: '4x8 ft (Landscape)', width: 2400, height: 1200, orientation: 'landscape', category: 'landscape' },
    { name: '5x10 ft (Landscape)', width: 3000, height: 1500, orientation: 'landscape', category: 'landscape' },
    
    // Portrait Banners (Vertical - taller than wide)
    { name: '3x2 ft (Portrait)', width: 600, height: 900, orientation: 'portrait', category: 'portrait' },
    { name: '4x2 ft (Portrait)', width: 600, height: 1200, orientation: 'portrait', category: 'portrait' },
    { name: '5x2 ft (Portrait)', width: 600, height: 1500, orientation: 'portrait', category: 'portrait' },
    { name: '6x2 ft (Portrait)', width: 600, height: 1800, orientation: 'portrait', category: 'portrait' },
    { name: '4x3 ft (Portrait)', width: 900, height: 1200, orientation: 'portrait', category: 'portrait' },
    { name: '5x3 ft (Portrait)', width: 900, height: 1500, orientation: 'portrait', category: 'portrait' },
    { name: '6x3 ft (Portrait)', width: 900, height: 1800, orientation: 'portrait', category: 'portrait' },
    { name: '8x4 ft (Portrait)', width: 1200, height: 2400, orientation: 'portrait', category: 'portrait' },
    
    // Custom option
    { name: 'Custom Size', width: 800, height: 400, orientation: 'landscape', category: 'custom' }
  ]
  
  // Product type configurations
  const productConfigs = {
    banner: {
      name: 'Vinyl Banner',
      defaultSize: { width: 800, height: 400 },
      sizes: bannerSizes,
      description: 'High-quality vinyl banners for outdoor and indoor use'
    },
    tin: {
      name: 'Business Card Tin',
      defaultSize: { width: 374, height: 225 }, // 3.74" x 2.25" at 100 DPI
      sizes: [
        { name: 'Business Card Tin', width: 374, height: 225, orientation: 'landscape', category: 'standard' }
      ],
      description: 'Premium aluminum business card tins with custom vinyl stickers'
    },
    tent: {
      name: 'Tradeshow Tent',
      defaultSize: { width: 1160, height: 789 }, // Canopy default (116" x 78.86" scaled to pixels)
      sizes: [
        { name: 'Canopy', width: 1160, height: 789, orientation: 'landscape', category: 'canopy' },
        { name: 'Full Wall', width: 1110, height: 780, orientation: 'landscape', category: 'wall' },
        { name: 'Half Wall', width: 1110, height: 370, orientation: 'landscape', category: 'wall' }
      ],
      description: 'Professional tradeshow tents with custom graphics'
    }
  }
  
  // Handle product type change
  const handleProductTypeChange = useCallback((newProductType) => {
    setProductType(newProductType)
    const config = productConfigs[newProductType]
    setCanvasSize(config.defaultSize)
    setCanvasOrientation(config.defaultSize.width > config.defaultSize.height ? 'landscape' : 'portrait')
    
    // Set appropriate default surface for each product type
    if (newProductType === 'tin') {
      setCurrentSurface('front')
    } else if (newProductType === 'tent') {
      setCurrentSurface('canopy_front')
    } else {
      setCurrentSurface('front')
    }
  }, [productConfigs])

  // Handle tin specification changes
  const handleTinSpecChange = useCallback((key, value) => {
    setTinSpecs(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  // Handle surface navigation
  const handleSurfaceChange = useCallback((surface) => {
    setCurrentSurface(surface)
    // Clear selection when switching surfaces
    setSelectedId(null)
    
    // Update canvas size based on tent surface
    if (productType === 'tent') {
      if (surface === 'sidewall_left' || surface === 'sidewall_right') {
        // Sidewalls: same width, half height (1110 x 390 for full wall, 1110 x 185 for half wall)
        setCanvasSize({ width: 1110, height: 390 })
      } else if (surface === 'backwall') {
        // Backwall: original size (1110 x 780 for full wall, 1110 x 370 for half wall)
        setCanvasSize({ width: 1110, height: 780 })
      } else if (surface.startsWith('canopy_')) {
        // Canopy surfaces: triangular size
        setCanvasSize({ width: 1160, height: 789 })
      }
    }
  }, [productType])
  
  // Check if user is first time user - only from landing page
  useEffect(() => {
    const checkTourStatus = async () => {
      try {
        const fromLandingPage = sessionStorage.getItem('fromLandingPage')
        
        // Only check tour status if user came from landing page
        if (fromLandingPage === 'true') {
          const response = await authService.authenticatedRequest('/api/user/tour-status')
          const tourCompleted = response.tour_completed
          
          // Only show tour if:
          // 1. Tour hasn't been completed
          // 2. User came from landing page (not dashboard)
          if (!tourCompleted) {
            setIsFirstTimeUser(true)
            setShowTour(true)
          } else {
            setIsFirstTimeUser(false)
            setShowTour(false)
          }
        } else {
          setIsFirstTimeUser(false)
          setShowTour(false)
        }
      } catch (error) {
        console.error('Error checking tour status:', error)
        // If there's an error, don't show the tour
        setIsFirstTimeUser(false)
        setShowTour(false)
      }
    }
    
    checkTourStatus()
  }, [])
  
  // All available banner types from products
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
      id: 'mesh-banner',
      name: 'Mesh Banner',
      category: 'Mesh Banners',
      material: 'Mesh Vinyl',
      finish: 'Perforated',
      specs: 'Best option for windy conditions',
      description: '70/30 mesh allows wind to pass through',
      uses: ['Windy Locations', 'Fencing', 'Construction Barriers']
    },
    {
      id: 'indoor-banner',
      name: 'Indoor Banner',
      category: 'Indoor Banners',
      material: 'Indoor Vinyl',
      finish: 'Smooth',
      specs: 'Fast and smooth surface (UV)',
      description: 'Cost-effective option for indoor use',
      uses: ['Indoor Displays', 'Trade Shows', 'Retail']
    },
    {
      id: 'pole-banner',
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
      id: 'tension-fabric',
      name: 'Tension Fabric Banner',
      category: 'Fabric Banners',
      material: 'Tension Fabric',
      finish: 'Stretch Fabric',
      specs: 'Dye sublimation print',
      description: 'Stretch material for wraps, wrinkle resistant',
      uses: ['Trade Show Displays', 'Premium Presentations']
    },
    {
      id: 'backlit-banner',
      name: 'Backlit Banner',
      category: 'Specialty Banners',
      material: 'Translucent Vinyl',
      finish: 'Backlit Compatible',
      specs: '13 oz translucent vinyl for backlight',
      description: 'Specially designed for backlighting applications',
      uses: ['Light Boxes', 'Illuminated Signage', 'Displays']
    }
  ]

  // Banner specifications - Updated to match actual product specifications
  const [bannerSpecs, setBannerSpecs] = useState(() => {
    // Get product type from URL parameter
    const productType = searchParams.get('product')
    console.log('URL product parameter:', productType)
    
    // Find the matching banner type
    const selectedBannerType = bannerTypes.find(banner => banner.id === productType)
    console.log('Selected banner type:', selectedBannerType)
    
    // Return the selected banner type or default to first one
    return selectedBannerType || bannerTypes[0]
  })

  // Utility functions
  const generateId = (type) => `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Clear canvas function
  const clearCanvas = useCallback(() => {
    if (elements.length === 0) return
    
    if (confirm('Are you sure you want to clear the canvas? This will remove all elements and cannot be undone.')) {
      setElements([])
      setSelectedId(null)
      // Show success feedback
      console.log('Canvas cleared successfully')
    }
  }, [elements.length])





  // Add shape element
  const addShape = useCallback((shapeType) => {
    const baseProps = {
      id: generateId(shapeType),
      type: shapeType,
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      fill: '#6B7280', // Neutral gray instead of blue
      stroke: '#374151', // Darker gray for stroke
      strokeWidth: 2,
      rotation: 0
    }

    let shape
    switch (shapeType) {
      case 'rect':
        shape = { ...baseProps, width: 200, height: 100 }
        break
      case 'circle':
        shape = { ...baseProps, radius: 60 }
        break
      case 'star':
        shape = { 
          ...baseProps, 
          numPoints: 5, 
          innerRadius: 40, 
          outerRadius: 80 
        }
        break
      case 'triangle':
        shape = { ...baseProps, sides: 3, radius: 60 }
        break
      case 'hexagon':
        shape = { ...baseProps, sides: 6, radius: 60 }
        break
      case 'heart':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [150, 300, 120, 240, 90, 240, 60, 270, 60, 300, 90, 330, 150, 390, 210, 330, 240, 300, 240, 270, 210, 240, 180, 240],
          closed: true,
          scaleX: 0.5,
          scaleY: 0.5,
          x: canvasSize.width / 2 - 60,
          y: canvasSize.height / 2 - 75
        }
        break
      case 'diamond':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [100, 50, 150, 100, 100, 150, 50, 100],
          closed: true,
          x: canvasSize.width / 2 - 50,
          y: canvasSize.height / 2 - 50
        }
        break
      case 'arrow':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [0, 15, 70, 15, 70, 5, 100, 20, 70, 35, 70, 25, 0, 25],
          closed: true,
          x: canvasSize.width / 2 - 50,
          y: canvasSize.height / 2 - 20
        }
        break
      case 'arrow-right':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [0, 15, 70, 15, 70, 5, 100, 20, 70, 35, 70, 25, 0, 25],
          closed: true,
          x: canvasSize.width / 2 - 50,
          y: canvasSize.height / 2 - 20
        }
        break
      case 'arrow-left':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [100, 15, 30, 15, 30, 5, 0, 20, 30, 35, 30, 25, 100, 25],
          closed: true,
          x: canvasSize.width / 2 - 50,
          y: canvasSize.height / 2 - 20
        }
        break
      case 'arrow-up':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [15, 100, 15, 30, 5, 30, 20, 0, 35, 30, 25, 30, 25, 100],
          closed: true,
          x: canvasSize.width / 2 - 20,
          y: canvasSize.height / 2 - 50
        }
        break
      case 'arrow-down':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [15, 0, 15, 70, 5, 70, 20, 100, 35, 70, 25, 70, 25, 0],
          closed: true,
          x: canvasSize.width / 2 - 20,
          y: canvasSize.height / 2 - 50
        }
        break
      case 'double-arrow':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [0, 15, 40, 15, 40, 5, 60, 20, 40, 35, 40, 25, 0, 25, 100, 15, 60, 15, 60, 5, 40, 20, 60, 35, 60, 25, 100, 25],
          closed: true,
          x: canvasSize.width / 2 - 50,
          y: canvasSize.height / 2 - 20
        }
        break
      case 'octagon':
        shape = { ...baseProps, sides: 8, radius: 60 }
        break
      case 'cross':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [40, 0, 40, 30, 0, 30, 0, 40, 40, 40, 40, 80, 50, 80, 50, 40, 90, 40, 90, 30, 50, 30, 50, 0],
          closed: true,
          x: canvasSize.width / 2 - 45,
          y: canvasSize.height / 2 - 40
        }
        break
      case 'crown':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [20, 60, 30, 40, 40, 50, 50, 30, 60, 50, 70, 40, 80, 60, 80, 70, 20, 70],
          closed: true,
          x: canvasSize.width / 2 - 50,
          y: canvasSize.height / 2 - 35
        }
        break
      case 'badge':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [50, 0, 80, 20, 80, 50, 50, 80, 20, 50, 20, 20],
          closed: true,
          x: canvasSize.width / 2 - 50,
          y: canvasSize.height / 2 - 40
        }
        break
      case 'certificate':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [0, 0, 100, 0, 100, 80, 0, 80, 0, 0, 10, 10, 90, 10, 90, 70, 10, 70],
          closed: true,
          x: canvasSize.width / 2 - 50,
          y: canvasSize.height / 2 - 40
        }
        break
      case 'document':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [0, 0, 80, 0, 80, 100, 0, 100, 0, 0, 10, 10, 70, 10, 70, 90, 10, 90],
          closed: true,
          x: canvasSize.width / 2 - 40,
          y: canvasSize.height / 2 - 50
        }
        break
      case 'checkmark':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [10, 50, 30, 70, 70, 30],
          closed: false,
          strokeWidth: 4,
          x: canvasSize.width / 2 - 40,
          y: canvasSize.height / 2 - 35
        }
        break
      case 'target':
        shape = { 
          ...baseProps,
          type: 'line',
          points: [50, 0, 60, 40, 100, 50, 60, 60, 50, 100, 40, 60, 0, 50, 40, 40],
          closed: true,
          x: canvasSize.width / 2 - 50,
          y: canvasSize.height / 2 - 50
        }
        break
      default:
        return
    }

    // Use multi-surface logic for tin and tent products
    if (productType === 'tin' || productType === 'tent') {
      setSurfaceElements(prev => ({
        ...prev,
        [currentSurface]: [...prev[currentSurface], shape]
      }))
    } else {
      setElements(prev => [...prev, shape])
    }
    setSelectedId(shape.id)
  }, [canvasSize, productType, currentSurface])

  // Add text element
  const addText = useCallback((textContent = 'Sample Text') => {
    const newText = {
      id: generateId('text'),
      type: 'text',
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 15,
      text: textContent,
      fontSize: 24,
      fontFamily: 'Arial',
      fill: '#000000',
      align: 'left',
      verticalAlign: 'top',
      fontStyle: 'normal',
      textDecoration: 'none',
      lineHeight: 1.2,
      letterSpacing: 0,
      padding: 0,
      width: 200,
      height: 'auto',
      wrap: 'word',
      rotation: 0
    }
    
    // Use multi-surface logic for tin and tent products
    if (productType === 'tin' || productType === 'tent') {
      setSurfaceElements(prev => ({
        ...prev,
        [currentSurface]: [...prev[currentSurface], newText]
      }))
    } else {
      setElements(prev => [...prev, newText])
    }
    setSelectedId(newText.id)
  }, [canvasSize, productType, currentSurface])

  // Add icon as text element or image element
  const addIcon = useCallback((iconName, symbol, imagePath = null) => {
    if (imagePath) {
      // Create image element for icons with actual images
      const img = new window.Image()
      img.onload = () => {
        const newIcon = {
          id: generateId('image'),
          type: 'image',
          x: canvasSize.width / 2 - 50,
          y: canvasSize.height / 2 - 50,
          width: 100,
          height: 100,
          image: img,
          rotation: 0,
          assetName: iconName,
          imagePath: imagePath // Store the actual image path for restoration
        }
        // Use multi-surface logic for tin and tent products
        if (productType === 'tin' || productType === 'tent') {
          setSurfaceElements(prev => ({
            ...prev,
            [currentSurface]: [...prev[currentSurface], newIcon]
          }))
        } else {
          setElements(prev => [...prev, newIcon])
        }
        setSelectedId(newIcon.id)
      }
      img.onerror = () => {
        console.error('Failed to load icon image:', imagePath)
        // Fallback to text element with emoji
        const newIcon = {
          id: generateId('text'),
          type: 'text',
          x: canvasSize.width / 2 - 50,
          y: canvasSize.height / 2 - 50,
          text: symbol,
          fontSize: 100,
          fontFamily: 'Arial',
          fill: '#6B7280', // Neutral gray instead of blue
          align: 'center',
          verticalAlign: 'middle'
        }
        // Use multi-surface logic for tin and tent products
        if (productType === 'tin' || productType === 'tent') {
          setSurfaceElements(prev => ({
            ...prev,
            [currentSurface]: [...prev[currentSurface], newIcon]
          }))
        } else {
          setElements(prev => [...prev, newIcon])
        }
        setSelectedId(newIcon.id)
      }
      img.src = imagePath
    } else {
      // Create text element for emoji-based icons
      const newIcon = {
        id: generateId('text'),
        type: 'text',
        x: canvasSize.width / 2 - 50,
        y: canvasSize.height / 2 - 50,
        text: symbol,
        fontSize: 100,
        fontFamily: 'Arial',
        fill: '#6B7280', // Neutral gray instead of blue
        align: 'center',
        verticalAlign: 'middle'
      }
      // Use multi-surface logic for tin and tent products
      if (productType === 'tin' || productType === 'tent') {
        setSurfaceElements(prev => ({
          ...prev,
          [currentSurface]: [...prev[currentSurface], newIcon]
        }))
      } else {
        setElements(prev => [...prev, newIcon])
      }
      setSelectedId(newIcon.id)
    }
  }, [canvasSize, productType, currentSurface])

  // Add QR code element
  const addQRCode = useCallback((url, qrColor = '#000000', backgroundColor = '#ffffff') => {
    // Create a hidden div to render the QR code
    const qrContainer = document.createElement('div')
    qrContainer.style.position = 'absolute'
    qrContainer.style.left = '-9999px'
    qrContainer.style.top = '-9999px'
    document.body.appendChild(qrContainer)
    
    // Create a temporary React element for the QR code
    const qrElement = React.createElement(QRCodeCanvas, {
      value: url,
      size: 200,
      fgColor: qrColor,
      bgColor: backgroundColor,
      level: 'M', // Medium error correction
      includeMargin: true
    })
    
    // Render the QR code to the hidden container
    const root = createRoot(qrContainer)
    root.render(qrElement)
    
    // Wait for the QR code to render, then capture it
    setTimeout(() => {
      const canvas = qrContainer.querySelector('canvas')
      if (canvas) {
        const qrDataUrl = canvas.toDataURL('image/png')
        
        // Create image element from the QR code
        const img = new window.Image()
        img.onload = () => {
          const newQRCode = {
            id: generateId('qrcode'),
            type: 'image',
            x: canvasSize.width / 2 - 100,
            y: canvasSize.height / 2 - 100,
            width: 200,
            height: 200,
            image: img,
            rotation: 0,
            assetName: 'QR Code',
            qrData: {
              url: url,
              color: qrColor,
              backgroundColor: backgroundColor
            }
          }
          // Use multi-surface logic for tin and tent products
          if (productType === 'tin' || productType === 'tent') {
            setSurfaceElements(prev => ({
              ...prev,
              [currentSurface]: [...prev[currentSurface], newQRCode]
            }))
          } else {
            setElements(prev => [...prev, newQRCode])
          }
          setSelectedId(newQRCode.id)
        }
        img.src = qrDataUrl
        
        // Clean up the hidden container
        document.body.removeChild(qrContainer)
      }
    }, 100)
  }, [canvasSize, productType, currentSurface])



  // Text property change handler
  const handleTextPropertyChange = useCallback((property, value) => {
    if (!selectedId) return
    
    setElements(prev => prev.map(el => {
      if (el.id === selectedId && el.type === 'text') {
        if (typeof value === 'function') {
          return { ...el, [property]: value(el[property]) }
        }
        return { ...el, [property]: value }
      }
      return el
    }))
  }, [selectedId])

  // Shape property change handler
  const handleShapePropertyChange = useCallback((property, value) => {
    if (!selectedId) return
    
    setElements(prev => prev.map(el => {
      if (el.id === selectedId && (
        el.type === 'rect' || 
        el.type === 'circle' || 
        el.type === 'star' || 
        el.type === 'triangle' || 
        el.type === 'hexagon' || 
        el.type === 'octagon' ||
        el.type === 'line' ||
        // Include all shape types that can have color properties
        ['heart', 'diamond', 'arrow', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'double-arrow', 'cross', 'crown', 'badge', 'certificate', 'document', 'checkmark', 'target'].includes(el.type)
      )) {
        if (typeof value === 'function') {
          return { ...el, [property]: value(el[property]) }
        }
        return { ...el, [property]: value }
      }
      return el
    }))
  }, [selectedId])



  // Change banner type
  const changeBannerType = useCallback((bannerTypeId) => {
    const selectedBannerType = bannerTypes.find(type => type.id === bannerTypeId)
    if (selectedBannerType) {
      setBannerSpecs(selectedBannerType)
    }
  }, [bannerTypes])

  // Change canvas size
  const changeCanvasSize = useCallback((sizePreset) => {
    // Handle custom size format: "Custom 800x400"
    if (sizePreset.startsWith('Custom ')) {
      const sizeMatch = sizePreset.match(/Custom (\d+)x(\d+)/)
      if (sizeMatch) {
        const width = parseInt(sizeMatch[1])
        const height = parseInt(sizeMatch[2])
        
        // Warn user if there are existing elements
        if (elements.length > 0) {
          const confirmed = window.confirm(
            `Changing canvas size to Custom (${width}×${height}px).\n\nExisting elements may need repositioning. Continue?`
          )
          if (!confirmed) return
        }
        
        setCanvasSize({ width, height })
        setCanvasOrientation(width > height ? 'landscape' : 'portrait')
        return
      }
    }
    
    const selectedSize = bannerSizes.find(size => size.name === sizePreset)
    if (selectedSize) {
      // Warn user if there are existing elements
      if (elements.length > 0) {
        const confirmed = window.confirm(
          `Changing canvas size to ${selectedSize.name} (${selectedSize.width}×${selectedSize.height}px).\n\nExisting elements may need repositioning. Continue?`
        )
        if (!confirmed) return
      }
      
      setCanvasSize({ width: selectedSize.width, height: selectedSize.height })
      setCanvasOrientation(selectedSize.orientation)
    }
  }, [bannerSizes, elements.length])

  // Toggle canvas orientation
  const toggleCanvasOrientation = useCallback(() => {
    const newOrientation = canvasOrientation === 'landscape' ? 'portrait' : 'landscape'
    
    // Warn user if there are existing elements
    if (elements.length > 0) {
      const confirmed = window.confirm(
        `Switching from ${canvasOrientation} to ${newOrientation} orientation.\n\nCanvas will be rotated and existing elements may need repositioning. Continue?`
      )
      if (!confirmed) return
    }
    
    setCanvasOrientation(newOrientation)
    
    // Swap width and height
    setCanvasSize(prev => ({
      width: prev.height,
      height: prev.width
    }))
  }, [canvasOrientation, elements.length])

  // Professional Banner Templates Library
  const bannerTemplates = [
    // Business Grand Opening
    {
      id: 'grand-opening-burst',
      name: 'Grand Opening - Burst',
      category: 'Business Events',
      description: 'Eye-catching design with starburst background',
      tags: ['grand opening', 'business', 'celebration'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#1e3a8a'
        },
        {
          id: generateId('star'),
          type: 'star',
          x: 400, y: 200,
          numPoints: 16,
          innerRadius: 60,
          outerRadius: 120,
          fill: '#fbbf24',
          strokeWidth: 3,
          stroke: '#f59e0b'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 160,
          text: 'GRAND OPENING',
          fontSize: 32,
          fontFamily: 'Impact',
          fill: '#ffffff',
          align: 'center',
          strokeWidth: 2,
          stroke: '#1e3a8a'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 240,
          text: 'NOW OPEN!',
          fontSize: 24,
          fontFamily: 'Arial Black',
          fill: '#dc2626',
          align: 'center',
          strokeWidth: 2,
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
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#dc2626'
        },
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 200, height: 400,
          fill: '#991b1b'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 500, y: 100,
          text: 'MEGA SALE',
          fontSize: 48,
          fontFamily: 'Impact',
          fill: '#ffffff',
          align: 'center',
          shadowBlur: 5,
          shadowColor: 'rgba(0,0,0,0.5)',
          shadowOffsetY: 3
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 500, y: 180,
          text: 'UP TO 70% OFF',
          fontSize: 32,
          fontFamily: 'Arial Black',
          fill: '#fbbf24',
          align: 'center',
          strokeWidth: 2,
          stroke: '#dc2626'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 500, y: 240,
          text: 'JUNE 15-30',
          fontSize: 20,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 500, y: 280,
          text: 'LIMITED TIME ONLY!',
          fontSize: 16,
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
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#1e40af'
        },
        {
          id: generateId('rect'),
          type: 'rect',
          x: 50, y: 50,
          width: 700, height: 300,
          fill: '#ffffff'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 120,
          text: 'FOR SALE',
          fontSize: 36,
          fontFamily: 'Arial Black',
          fill: '#1e40af',
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 250, y: 200,
          text: '🏠',
          fontSize: 48,
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 550, y: 200,
          text: 'CALL TODAY\n(555) 123-4567',
          fontSize: 20,
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
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#7c2d12'
        },
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 100,
          fill: '#fbbf24'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 50,
          text: 'DAILY SPECIAL',
          fontSize: 28,
          fontFamily: 'Impact',
          fill: '#7c2d12',
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 220,
          text: '🍕',
          fontSize: 80,
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 550, y: 180,
          text: 'WOOD FIRED PIZZA\n$12.99',
          fontSize: 24,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          lineHeight: 1.3
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 320,
          text: 'Available 11AM - 9PM Daily',
          fontSize: 16,
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
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#f97316'
        },
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 250,
          width: 800, height: 150,
          fill: '#1f2937',
          rotation: -15
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 100,
          text: 'ABC CONSTRUCTION',
          fontSize: 32,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          strokeWidth: 2,
          stroke: '#1f2937'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 150,
          text: 'RESIDENTIAL • COMMERCIAL',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#1f2937',
          align: 'center',
          fontWeight: 'bold'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 200,
          text: '📞 (555) BUILD-NOW',
          fontSize: 20,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 320,
          text: 'LICENSED • INSURED • BONDED',
          fontSize: 14,
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
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#1f2937'
        },
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 100,
          fill: '#dc2626'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 50,
          text: 'SUMMER SALE EVENT',
          fontSize: 28,
          fontFamily: 'Impact',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 180,
          text: '🚗',
          fontSize: 80,
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 550, y: 150,
          text: 'SAVE UP TO\n$5,000 OFF',
          fontSize: 32,
          fontFamily: 'Arial Black',
          fill: '#dc2626',
          align: 'center',
          lineHeight: 1.2
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 280,
          text: 'ALL NEW & USED VEHICLES',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 320,
          text: '📞 (555) AUTO-SALE',
          fontSize: 16,
          fontFamily: 'Arial Black',
          fill: '#fbbf24',
          align: 'center'
        }
      ]
    },

    // Medical Clinic
    {
      id: 'medical-clinic',
      name: 'Medical Clinic',
      category: 'Healthcare',
      description: 'Clean, professional healthcare design',
      tags: ['medical', 'healthcare', 'clinic', 'professional'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#ffffff'
        },
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 80,
          fill: '#2563eb'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 40,
          text: 'CITY MEDICAL CLINIC',
          fontSize: 24,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 150,
          text: '🏥',
          fontSize: 60,
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 550, y: 120,
          text: 'ACCEPTING NEW PATIENTS',
          fontSize: 20,
          fontFamily: 'Arial Black',
          fill: '#2563eb',
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 550, y: 160,
          text: 'Family Medicine • Urgent Care\nWalk-ins Welcome',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center',
          lineHeight: 1.3
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 280,
          text: '📞 (555) MED-CARE • 📍 123 Main St',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#2563eb',
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 400, y: 320,
          text: 'Mon-Fri 8AM-6PM • Sat 9AM-2PM',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#6b7280',
          align: 'center'
        }
      ]
    },

    // Portrait Templates for variety
    // Real Estate Portrait
    {
      id: 'real-estate-portrait',
      name: 'Real Estate - Portrait',
      category: 'Real Estate',
      description: 'Tall design perfect for property listings',
      tags: ['real estate', 'portrait', 'property', 'vertical'],
      orientation: 'portrait',
      recommendedSizes: ['3x2', '4x2', '5x2', '6x2'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 400, height: 800,
          fill: '#1e40af'
        },
        {
          id: generateId('rect'),
          type: 'rect',
          x: 25, y: 25,
          width: 350, height: 750,
          fill: '#ffffff'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 80,
          text: 'FOR SALE',
          fontSize: 28,
          fontFamily: 'Arial Black',
          fill: '#1e40af',
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 200,
          text: '🏠',
          fontSize: 60,
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 350,
          text: 'BEAUTIFUL HOME\n3 BED • 2 BATH\n1,500 SQ FT',
          fontSize: 18,
          fontFamily: 'Arial Black',
          fill: '#1e40af',
          align: 'center',
          lineHeight: 1.3
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 500,
          text: 'CALL TODAY\n(555) 123-4567',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#1e40af',
          align: 'center',
          lineHeight: 1.2
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 650,
          text: 'OPEN HOUSE\nSUNDAY 2-4PM',
          fontSize: 14,
          fontFamily: 'Arial Black',
          fill: '#dc2626',
          align: 'center',
          lineHeight: 1.2
        }
      ]
    },

    // Restaurant Portrait
    {
      id: 'restaurant-portrait',
      name: 'Restaurant - Portrait',
      category: 'Food & Dining',
      description: 'Tall design for restaurant promotions',
      tags: ['restaurant', 'portrait', 'food', 'vertical'],
      orientation: 'portrait',
      recommendedSizes: ['3x2', '4x2', '5x2', '6x2'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 400, height: 800,
          fill: '#7c2d12'
        },
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 400, height: 100,
          fill: '#fbbf24'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 50,
          text: 'DAILY SPECIAL',
          fontSize: 24,
          fontFamily: 'Impact',
          fill: '#7c2d12',
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 180,
          text: '🍕',
          fontSize: 80,
          align: 'center'
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 320,
          text: 'WOOD FIRED PIZZA\n$12.99',
          fontSize: 20,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          lineHeight: 1.3
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 450,
          text: 'Available 11AM - 9PM\nDaily Specials',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center',
          lineHeight: 1.3
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 200, y: 600,
          text: '📞 (555) PIZZA-NOW\n📍 123 Main Street',
          fontSize: 12,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center',
          lineHeight: 1.2
        }
      ]
    },

    // NEW PROFESSIONAL TEMPLATES - Built with Real Assets
    // RESTAURANT & FOOD TEMPLATES
    {
      id: 'pizza-special-offer',
      name: 'Pizza Special Offer',
      category: 'Restaurant & Food',
      description: 'Eye-catching pizza promotion with food icons and special pricing',
      tags: ['pizza', 'restaurant', 'food', 'special offer'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#FF6B35'
        },
        {
          id: generateId('pizza-bg'),
          type: 'image',
          x: 50, y: 50,
          width: 200, height: 200,
          src: '/assets/images/food/Pizza.svg',
          opacity: 0.1
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 300, y: 80,
          text: 'PIZZA SPECIAL',
          fontSize: 48,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#FFFFFF',
          stroke: '#000000',
          strokeWidth: 2
        },
        {
          id: generateId('text2'),
          type: 'text',
          x: 300, y: 140,
          text: 'Buy 2 Get 1 FREE',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#FFD700',
          stroke: '#000000',
          strokeWidth: 1
        },
        {
          id: generateId('text3'),
          type: 'text',
          x: 300, y: 200,
          text: 'Starting at $12.99',
          fontSize: 20,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: generateId('text4'),
          type: 'text',
          x: 300, y: 250,
          text: 'Call: (555) 123-PIZZA',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: generateId('qrcode'),
          type: 'qrcode',
          x: 600, y: 250,
          width: 120, height: 120,
          qrData: {
            text: 'https://yourrestaurant.com/menu',
            color: '#FFFFFF',
            backgroundColor: '#000000'
          }
        }
      ]
    },

    {
      id: 'coffee-shop-opening',
      name: 'Coffee Shop Grand Opening',
      category: 'Restaurant & Food',
      description: 'Elegant coffee shop announcement with warm colors and coffee icons',
      tags: ['coffee', 'grand opening', 'restaurant', 'cafe'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#8B4513'
        },
        {
          id: generateId('coffee-bg'),
          type: 'image',
          x: 50, y: 100,
          width: 150, height: 150,
          src: '/assets/images/food/Coffee.svg',
          opacity: 0.2
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 250, y: 60,
          text: 'GRAND OPENING',
          fontSize: 42,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#FFFFFF',
          stroke: '#8B4513',
          strokeWidth: 2
        },
        {
          id: generateId('text2'),
          type: 'text',
          x: 250, y: 120,
          text: 'Brew & Bean Café',
          fontSize: 32,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#FFD700'
        },
        {
          id: generateId('text3'),
          type: 'text',
          x: 250, y: 170,
          text: 'Saturday, March 15th',
          fontSize: 20,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: generateId('text4'),
          type: 'text',
          x: 250, y: 200,
          text: '10:00 AM - 6:00 PM',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: generateId('text5'),
          type: 'text',
          x: 250, y: 240,
          text: 'FREE Coffee for First 100 Customers!',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FFD700',
          fontWeight: 'bold'
        },
        {
          id: generateId('text6'),
          type: 'text',
          x: 250, y: 280,
          text: '123 Main Street, Downtown',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        }
      ]
    },

    {
      id: 'construction-safety-first',
      name: 'Construction Safety First',
      category: 'Construction',
      description: 'Professional construction safety banner with industry icons',
      tags: ['construction', 'safety', 'professional', 'building'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#FFA500'
        },
        {
          id: generateId('construction-bg'),
          type: 'image',
          x: 50, y: 50,
          width: 200, height: 200,
          src: '/assets/images/Construction/BANNER-1_Constr.svg',
          opacity: 0.15
        },
        {
          id: generateId('text'),
          type: 'text',
          x: 300, y: 80,
          text: 'SAFETY FIRST',
          fontSize: 48,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#FFFFFF',
          stroke: '#000000',
          strokeWidth: 3
        },
        {
          id: generateId('text2'),
          type: 'text',
          x: 300, y: 140,
          text: 'BuildRight Construction',
          fontSize: 28,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#000000'
        },
        {
          id: generateId('text3'),
          type: 'text',
          x: 300, y: 180,
          text: 'Building Tomorrow, Safely Today',
          fontSize: 20,
          fontFamily: 'Inter',
          fill: '#000000'
        },
        {
          id: generateId('text4'),
          type: 'text',
          x: 300, y: 220,
          text: 'Licensed & Insured • 20+ Years Experience',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#000000'
        },
        {
          id: generateId('text5'),
          type: 'text',
          x: 300, y: 250,
          text: 'Call: (555) 123-BUILD',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#000000',
          fontWeight: 'bold'
        },
        {
          id: generateId('text6'),
          type: 'text',
          x: 300, y: 280,
          text: 'www.buildrightconstruction.com',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#000000'
        }
      ]
    },

    // ENHANCED PROFESSIONAL TEMPLATES - Showcasing All Editor Features
    {
      id: 'tech-startup-launch',
      name: 'Tech Startup Launch',
      category: 'Business & Tech',
      description: 'Modern tech startup with icons, shapes, and QR code integration',
      tags: ['startup', 'tech', 'launch', 'modern'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#1E293B'
        },
        {
          id: generateId('gradient-shape'),
          type: 'rect',
          x: 0, y: 0,
          width: 300, height: 400,
          fill: '#3B82F6',
          opacity: 0.8
        },
        {
          id: generateId('tech-icon'),
          type: 'image',
          x: 50, y: 100,
          width: 120, height: 120,
          src: '/assets/images/icons/Cloud Computing.svg',
          opacity: 0.9
        },
        {
          id: generateId('main-text'),
          type: 'text',
          x: 350, y: 80,
          text: 'TECHNOVATE',
          fontSize: 48,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#FFFFFF',
          stroke: '#1E293B',
          strokeWidth: 2
        },
        {
          id: generateId('sub-text'),
          type: 'text',
          x: 350, y: 140,
          text: 'Revolutionary AI Platform',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#60A5FA',
          stroke: '#1E293B',
          strokeWidth: 1
        },
        {
          id: generateId('features-text'),
          type: 'text',
          x: 350, y: 180,
          text: '✓ Machine Learning ✓ Real-time Analytics ✓ Cloud Integration',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#E2E8F0'
        },
        {
          id: generateId('cta-text'),
          type: 'text',
          x: 350, y: 220,
          text: 'Join the Future Today!',
          fontSize: 20,
          fontFamily: 'Inter',
          fill: '#FBBF24',
          fontWeight: 'bold',
          stroke: '#1E293B',
          strokeWidth: 1
        },
        {
          id: generateId('website-text'),
          type: 'text',
          x: 350, y: 260,
          text: 'www.technovate.ai',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: generateId('qr-code'),
          type: 'qrcode',
          x: 600, y: 200,
          width: 120, height: 120,
          qrData: {
            text: 'https://technovate.ai/signup',
            color: '#FFFFFF',
            backgroundColor: '#1E293B'
          }
        }
      ]
    },

    {
      id: 'fitness-gym-promotion',
      name: 'Fitness Gym Promotion',
      category: 'Health & Fitness',
      description: 'Dynamic fitness promotion with icons, shapes, and modern design',
      tags: ['fitness', 'gym', 'health', 'promotion'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#DC2626'
        },
        {
          id: generateId('circle-bg'),
          type: 'circle',
          x: 600, y: 50,
          width: 150, height: 150,
          fill: '#FBBF24',
          opacity: 0.3
        },
        {
          id: generateId('fitness-icon'),
          type: 'image',
          x: 50, y: 100,
          width: 150, height: 150,
          src: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/medical-1.svg',
          opacity: 0.2
        },
        {
          id: generateId('main-text'),
          type: 'text',
          x: 250, y: 60,
          text: 'POWER GYM',
          fontSize: 52,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#FFFFFF',
          stroke: '#DC2626',
          strokeWidth: 3
        },
        {
          id: generateId('offer-text'),
          type: 'text',
          x: 250, y: 130,
          text: 'NEW YEAR SPECIAL',
          fontSize: 28,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#FBBF24',
          stroke: '#DC2626',
          strokeWidth: 2
        },
        {
          id: generateId('deal-text'),
          type: 'text',
          x: 250, y: 180,
          text: '50% OFF First Month',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#FFFFFF',
          stroke: '#DC2626',
          strokeWidth: 1
        },
        {
          id: generateId('features-text'),
          type: 'text',
          x: 250, y: 220,
          text: '✓ 24/7 Access ✓ Personal Training ✓ Group Classes',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FEF2F2'
        },
        {
          id: generateId('contact-text'),
          type: 'text',
          x: 250, y: 260,
          text: 'Call: (555) 123-FIT',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#FFFFFF',
          fontWeight: 'bold'
        },
        {
          id: generateId('address-text'),
          type: 'text',
          x: 250, y: 290,
          text: '789 Fitness Street, Health District',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: generateId('qr-code'),
          type: 'qrcode',
          x: 600, y: 220,
          width: 120, height: 120,
          qrData: {
            text: 'https://powergym.com/signup',
            color: '#FFFFFF',
            backgroundColor: '#DC2626'
          }
        }
      ]
    },

    {
      id: 'real-estate-luxury',
      name: 'Luxury Real Estate',
      category: 'Real Estate',
      description: 'Premium real estate listing with elegant design and QR code',
      tags: ['real estate', 'luxury', 'property', 'elegant'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#0F172A'
        },
        {
          id: generateId('gold-accent'),
          type: 'rect',
          x: 0, y: 0,
          width: 200, height: 400,
          fill: '#FBBF24',
          opacity: 0.9
        },
        {
          id: generateId('luxury-icon'),
          type: 'image',
          x: 50, y: 120,
          width: 100, height: 100,
          src: '/assets/images/icons/Home.svg',
          opacity: 0.8
        },
        {
          id: generateId('main-text'),
          type: 'text',
          x: 250, y: 80,
          text: 'LUXURY LIVING',
          fontSize: 48,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#FFFFFF',
          stroke: '#0F172A',
          strokeWidth: 2
        },
        {
          id: generateId('property-text'),
          type: 'text',
          x: 250, y: 140,
          text: 'Exclusive Waterfront Estate',
          fontSize: 28,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#FBBF24',
          stroke: '#0F172A',
          strokeWidth: 1
        },
        {
          id: generateId('price-text'),
          type: 'text',
          x: 250, y: 180,
          text: 'Starting at $2.5M',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#FFFFFF',
          stroke: '#0F172A',
          strokeWidth: 1
        },
        {
          id: generateId('features-text'),
          type: 'text',
          x: 250, y: 220,
          text: '✓ 5 Bedrooms ✓ 4 Bathrooms ✓ Ocean View ✓ Private Dock',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#E2E8F0'
        },
        {
          id: generateId('agent-text'),
          type: 'text',
          x: 250, y: 260,
          text: 'Sarah Johnson, Luxury Specialist',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#FBBF24',
          fontWeight: 'bold'
        },
        {
          id: generateId('contact-text'),
          type: 'text',
          x: 250, y: 290,
          text: 'Call: (555) 123-LUXE',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: generateId('qr-code'),
          type: 'qrcode',
          x: 600, y: 200,
          width: 120, height: 120,
          qrData: {
            text: 'https://luxuryrealestate.com/property/123',
            color: '#FFFFFF',
            backgroundColor: '#0F172A'
          }
        }
      ]
    },

    {
      id: 'wedding-announcement',
      name: 'Wedding Announcement',
      category: 'Events & Parties',
      description: 'Elegant wedding announcement with romantic design and QR code',
      tags: ['wedding', 'announcement', 'romantic', 'elegant'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: generateId('rect'),
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#F8FAFC'
        },
        {
          id: generateId('romantic-bg'),
          type: 'circle',
          x: 100, y: 100,
          width: 120, height: 120,
          fill: '#FECACA',
          opacity: 0.3
        },
        {
          id: generateId('romantic-bg2'),
          type: 'circle',
          x: 600, y: 200,
          width: 100, height: 100,
          fill: '#FED7D7',
          opacity: 0.3
        },
        {
          id: generateId('heart-icon'),
          type: 'image',
          x: 50, y: 150,
          width: 80, height: 80,
          src: '/assets/images/icons/Heart.svg',
          opacity: 0.4
        },
        {
          id: generateId('main-text'),
          type: 'text',
          x: 200, y: 80,
          text: 'SAVE THE DATE',
          fontSize: 42,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#DC2626',
          stroke: '#FFFFFF',
          strokeWidth: 2
        },
        {
          id: generateId('couple-text'),
          type: 'text',
          x: 200, y: 130,
          text: 'Sarah & Michael',
          fontSize: 36,
          fontFamily: 'Inter',
          fontWeight: 'bold',
          fill: '#1E293B',
          stroke: '#FFFFFF',
          strokeWidth: 1
        },
        {
          id: generateId('date-text'),
          type: 'text',
          x: 200, y: 180,
          text: 'June 15th, 2024',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#DC2626',
          stroke: '#FFFFFF',
          strokeWidth: 1
        },
        {
          id: generateId('time-text'),
          type: 'text',
          x: 200, y: 210,
          text: '4:00 PM Ceremony',
          fontSize: 20,
          fontFamily: 'Inter',
          fill: '#1E293B'
        },
        {
          id: generateId('venue-text'),
          type: 'text',
          x: 200, y: 240,
          text: 'Garden Manor Estate',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#1E293B'
        },
        {
          id: generateId('rsvp-text'),
          type: 'text',
          x: 200, y: 280,
          text: 'RSVP by May 1st',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#DC2626',
          fontWeight: 'bold'
        },
        {
          id: generateId('qr-code'),
          type: 'qrcode',
          x: 600, y: 200,
          width: 120, height: 120,
          qrData: {
            text: 'https://sarahandmichael.com/rsvp',
            color: '#DC2626',
            backgroundColor: '#FFFFFF'
          }
        }
      ]
    }
  ]

  // Scale template elements to fit current canvas size
  const scaleTemplateElements = useCallback((templateElements, targetWidth, targetHeight) => {
    // Original template dimensions (hardcoded in templates)
    const originalWidth = 800
    const originalHeight = 400
    
    // Calculate scaling factors
    const scaleX = targetWidth / originalWidth
    const scaleY = targetHeight / originalHeight
    
    return templateElements.map(element => {
      const scaledElement = { ...element }
      
      // Scale position
      if (scaledElement.x !== undefined) {
        scaledElement.x = scaledElement.x * scaleX
      }
      if (scaledElement.y !== undefined) {
        scaledElement.y = scaledElement.y * scaleY
      }
      
      // Scale dimensions
      if (scaledElement.width !== undefined) {
        scaledElement.width = scaledElement.width * scaleX
      }
      if (scaledElement.height !== undefined) {
        scaledElement.height = scaledElement.height * scaleY
      }
      
      // Scale font size
      if (scaledElement.fontSize !== undefined) {
        scaledElement.fontSize = Math.max(12, scaledElement.fontSize * Math.min(scaleX, scaleY))
      }
      
      // Scale stroke width
      if (scaledElement.strokeWidth !== undefined) {
        scaledElement.strokeWidth = scaledElement.strokeWidth * Math.min(scaleX, scaleY)
      }
      
      // Scale shape properties
      if (scaledElement.radius !== undefined) {
        scaledElement.radius = scaledElement.radius * Math.min(scaleX, scaleY)
      }
      if (scaledElement.innerRadius !== undefined) {
        scaledElement.innerRadius = scaledElement.innerRadius * Math.min(scaleX, scaleY)
      }
      if (scaledElement.outerRadius !== undefined) {
        scaledElement.outerRadius = scaledElement.outerRadius * Math.min(scaleX, scaleY)
      }
      
      // Scale line points
      if (scaledElement.points !== undefined) {
        scaledElement.points = scaledElement.points.map((point, index) => {
          if (index % 2 === 0) {
            return point * scaleX // x coordinates
          } else {
            return point * scaleY // y coordinates
          }
        })
      }
      
      return scaledElement
    })
  }, [])

  // Load template functionality
  const loadTemplate = useCallback((template) => {
    // Find the template by ID
    const selectedTemplate = bannerTemplates.find(t => t.id === template.id)
    
    if (selectedTemplate) {
      // Clear existing elements
      setElements([])
      
      // Scale template elements to fit current canvas size
      const scaledElements = scaleTemplateElements(
        selectedTemplate.elements, 
        canvasSize.width, 
        canvasSize.height
      ).map(element => ({
        ...element,
        id: generateId(element.type)
      }))
      
      setElements(scaledElements)
      
      // Clear selection
      setSelectedId(null)
    } else {
      alert('Template not found. Please try again.')
    }
  }, [bannerTemplates, scaleTemplateElements, canvasSize.width, canvasSize.height])

  // Add asset from library
  const addAsset = useCallback((imagePath, assetName) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Calculate scale to fit the canvas while maintaining aspect ratio
      // Allow upscaling for high-quality designs
      const canvasAspectRatio = canvasSize.width / canvasSize.height
      const imageAspectRatio = img.width / img.height
      
      let scale
      let finalWidth, finalHeight
      
      if (imageAspectRatio > canvasAspectRatio) {
        // Image is wider than canvas - fit to width
        finalWidth = canvasSize.width * 0.9 // Use 90% of canvas width
        finalHeight = (finalWidth / img.width) * img.height
        scale = finalWidth / img.width
      } else {
        // Image is taller than canvas - fit to height
        finalHeight = canvasSize.height * 0.9 // Use 90% of canvas height
        finalWidth = (finalHeight / img.height) * img.width
        scale = finalHeight / img.height
      }
      
      // Ensure the image doesn't exceed canvas bounds
      if (finalWidth > canvasSize.width || finalHeight > canvasSize.height) {
        const maxScale = Math.min(canvasSize.width / img.width, canvasSize.height / img.height)
        scale = Math.min(scale, maxScale)
        finalWidth = img.width * scale
        finalHeight = img.height * scale
      }
      
      const newImage = {
        id: generateId('image'),
        type: 'image',
        x: canvasSize.width / 2 - finalWidth / 2,
        y: canvasSize.height / 2 - finalHeight / 2,
        width: finalWidth,
        height: finalHeight,
        image: img,
        rotation: 0,
        assetName: assetName,
        imagePath: imagePath // Store the actual image path for restoration
      }
      
      // Use multi-surface logic for tin and tent products
      if (productType === 'tin' || productType === 'tent') {
        setSurfaceElements(prev => ({
          ...prev,
          [currentSurface]: [...prev[currentSurface], newImage]
        }))
      } else {
        setElements(prev => [...prev, newImage])
      }
      setSelectedId(newImage.id)
    }
    img.onerror = () => {
      console.error('Failed to load asset:', imagePath)
      alert('Failed to load asset. Please try again.')
    }
    img.src = imagePath
  }, [canvasSize, productType, currentSurface])

  // Handle image upload
  const handleImageUpload = useCallback(async (file) => {
    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new window.Image()
        img.onload = () => {
          // Calculate scale to fit the canvas while maintaining aspect ratio
          // Allow upscaling for high-quality designs
          const canvasAspectRatio = canvasSize.width / canvasSize.height
          const imageAspectRatio = img.width / img.height
          
          let scale
          let finalWidth, finalHeight
          
          if (imageAspectRatio > canvasAspectRatio) {
            // Image is wider than canvas - fit to width
            finalWidth = canvasSize.width * 0.8 // Use 80% of canvas width for uploads
            finalHeight = (finalWidth / img.width) * img.height
            scale = finalWidth / img.width
          } else {
            // Image is taller than canvas - fit to height
            finalHeight = canvasSize.height * 0.8 // Use 80% of canvas height for uploads
            finalWidth = (finalHeight / img.height) * img.width
            scale = finalHeight / img.height
          }
          
          // Ensure the image doesn't exceed canvas bounds
          if (finalWidth > canvasSize.width || finalHeight > canvasSize.height) {
            const maxScale = Math.min(canvasSize.width / img.width, canvasSize.height / img.height)
            scale = Math.min(scale, maxScale)
            finalWidth = img.width * scale
            finalHeight = img.height * scale
          }
          
          const newImage = {
            id: generateId('image'),
            type: 'image',
            x: canvasSize.width / 2 - finalWidth / 2,
            y: canvasSize.height / 2 - finalHeight / 2,
            width: finalWidth,
            height: finalHeight,
            image: img,
            rotation: 0,
            uploadedFile: file.name,
            imageDataUrl: e.target.result // Store data URL for restoration
          }
          
          setElements(prev => [...prev, newImage])
          setSelectedId(newImage.id)
        }
        img.onerror = (error) => {
          console.error('Failed to load image:', error)
          alert('Failed to load image. Please try again.')
        }
        img.src = e.target.result
      }
      reader.onerror = (error) => {
        console.error('FileReader error:', error)
        alert('Failed to read file. Please try again.')
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error('Failed to upload image:', error)
      alert('Failed to upload image. Please try again.')
    }
  }, [canvasSize])

  // Export as PDF
  const exportToPDF = useCallback(() => {
    // Implementation for PDF export
    const pdf = new jsPDF({
      orientation: canvasSize.width > canvasSize.height ? 'landscape' : 'portrait',
      unit: 'px',
      format: [canvasSize.width, canvasSize.height]
    })
    
    // Add canvas content to PDF
    // This is a simplified version - you'd need to implement proper canvas-to-PDF conversion
    pdf.text('Banner Design', 20, 30)
    pdf.save('banner-design.pdf')
  }, [canvasSize])


  // Save as template
  const saveAsTemplate = useCallback(() => {
    setSaveModalType('template')
    setSaveError(null)
    setShowSaveModal(true)
  }, [])

  const handleSaveTemplate = useCallback(async (name, description) => {
    setIsSaving(true)
    setSaveError(null)
    
    try {
      const templateData = {
        name: name,
        description: description || `Template created on ${new Date().toLocaleDateString()}`,
        category: 'Custom',
        canvas_data: {
          elements,
          canvasSize,
          backgroundColor,
          bannerSpecs,
          timestamp: new Date().toISOString()
        },
        banner_type: bannerSpecs?.id || 'vinyl-13oz',
        is_public: false
      }
      
      console.log('Sending template data:', templateData)
      
      const response = await authService.authenticatedRequest('/api/templates/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateData)
      })
      
      console.log('Template save response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Template save error response:', errorData)
        throw new Error(errorData.detail || 'Failed to save template')
      }
      
      const result = await response.json()
      console.log('Template save result:', result)
      
      if (result.success) {
        setShowSaveModal(false)
        setSuccessMessage({
          title: 'Template Saved!',
          message: 'Your template has been saved successfully and is now available in your templates collection!'
        })
        setShowSuccessNotification(true)
        
        // Invalidate cache to ensure fresh data on next load
        const currentUser = await authService.getCurrentUser()
        if (currentUser?.id) {
          cacheService.invalidateTemplates(currentUser.id)
        }
        
        return true
      } else {
        throw new Error(result.error || 'Failed to save template')
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      
      // Provide more specific error messages
      let errorMessage = error.message
      if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
        errorMessage = 'Authentication error. Please log in again.'
      } else if (error.message.includes('Templates table not found')) {
        errorMessage = 'Templates feature is not available. Please contact support.'
      }
      
      setSaveError(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }, [elements, canvasSize, backgroundColor, bannerSpecs])

  // Create order
  const createOrder = useCallback(() => {
    // Generate canvas image data for preview
    const generateCanvasImage = () => {
      try {
        // Try multiple selectors to find the Konva canvas
        const selectors = [
          '.konvajs-content canvas',
          'canvas[data-konva-stage]',
          'canvas',
          '[data-konva-stage] canvas'
        ]
        
        let stageElement = null
        for (const selector of selectors) {
          stageElement = document.querySelector(selector)
          if (stageElement) {
            console.log('Found canvas with selector:', selector)
            break
          }
        }
        
        if (stageElement) {
          // Use a higher quality export but limit size
          const imageData = stageElement.toDataURL('image/png', 0.8)
          console.log('Canvas image generated successfully, length:', imageData.length)
          
          // Check if image is too large (limit to 5MB)
          if (imageData.length > 5 * 1024 * 1024) {
            console.warn('Canvas image too large, reducing quality')
            return stageElement.toDataURL('image/png', 0.5)
          }
          
          return imageData
        }
        
        console.warn('No canvas element found for image generation')
        return null
      } catch (error) {
        console.error('Failed to generate canvas image:', error)
        return null
      }
    }

    // Navigate to checkout with design data
    const orderData = {
      // Canvas data (required by backend)
      canvas_data: {
        elements: elements.map(element => {
          // For image elements, ensure we store the data URL for restoration
          if (element.type === 'image' && element.image) {
            return {
              ...element,
              imageDataUrl: element.imageDataUrl || (element.image.src ? element.image.src : null)
            }
          }
          return element
        }),
        canvasSize,
        backgroundColor,
        bannerSpecs,
        timestamp: new Date().toISOString()
      },
      canvas_image: generateCanvasImage(),
      
      // Order metadata (required by backend)
      product_type: productType === 'tin' ? 'business_card_tin' : productType === 'tent' ? 'tradeshow_tent' : 'banner',
      quantity: 1,
              dimensions: {
          width: 2, // Default 2ft width
          height: 4, // Default 4ft height
          orientation: canvasOrientation
        },
      banner_type: bannerSpecs?.id || 'vinyl-13oz',
      banner_material: bannerSpecs?.material || '13oz Vinyl',
      banner_finish: bannerSpecs?.finish || 'Matte',
      banner_size: `${canvasSize.width}x${canvasSize.height}px (${canvasOrientation})`,
      banner_category: bannerSpecs?.category || 'Vinyl Banners',
      background_color: backgroundColor,
      print_options: {} // Will be populated by checkout component
    }
    
    console.log('Creating order with elements count:', elements.length)
    console.log('Canvas size:', canvasSize)
    console.log('Banner specs:', bannerSpecs)
    
    // Store in sessionStorage for checkout (temporary, will be replaced by Supabase order)
    sessionStorage.setItem('orderData', JSON.stringify(orderData))
    
    // Route to appropriate checkout based on product type
    if (orderData.product_type === 'business_card_tin') {
      navigate('/tin-checkout')
    } else if (orderData.product_type === 'tradeshow_tent') {
      navigate('/tent-checkout') // Future implementation
    } else {
      navigate('/checkout')
    }
  }, [elements, canvasSize, backgroundColor, bannerSpecs, navigate, productType])

  // Helper function to find the correct image path for an asset
  const findAssetImagePath = useCallback(async (assetName) => {
    // Define the asset categories and their files (matching BannerSidebar structure)
    const assetCategories = {
      zodiac: [
        { name: 'Cancer', file: '1_Cancer_FINAL_with text.png' },
        { name: 'Taurus', file: '2_Taurus_FINAL-1_with text.png' },
        { name: 'Capricorn', file: '3_Capricornus_FINAL-1_with text.png' },
        { name: 'Pisces', file: '4_Pisces_FINAL-1_with text.png' },
        { name: 'Leo', file: '5_Leo_FINAL-1_with text.png' },
        { name: 'Aquarius', file: '6_Aquarius_FINAL_with text.png' },
        { name: 'Libra', file: '7_Libra_FINAL-1_with text.png' },
        { name: 'Sagittarius', file: '8_Sagittarius_FINAL_with text.png' },
        { name: 'Gemini', file: '9_Gemini_FINAL-2_with text.png' },
        { name: 'Aries', file: '10_Aries_FINAL_with text.png' },
        { name: 'Virgo', file: '11_Virgo_FINAL-2_with text.png' },
        { name: 'Scorpio', file: '12_Scorpio_FINAL_with text.png' }
      ],
      abstract: [
        { name: 'Abstract Design 1', file: 'abstract1.png' },
        { name: 'Abstract Design 2', file: 'abstract2.png' },
        { name: 'Abstract Design 3', file: 'abstract3.png' }
      ],
      business: [
        { name: 'Business Icon 1', file: 'business1.png' },
        { name: 'Business Icon 2', file: 'business2.png' },
        { name: 'Business Icon 3', file: 'business3.png' }
      ],
      social: [
        { name: 'X (Twitter)', file: 'social icons/X.png' },
        { name: 'Twitter', file: 'social icons/Twitter.png' },
        { name: 'Meta (Facebook)', file: 'social icons/Facebook.png' },
        { name: 'LinkedIn', file: 'social icons/LinkedIn.png' },
        { name: 'Reddit', file: 'social icons/Reddit.png' },
        { name: 'Pinterest', file: 'social icons/Pinterest.png' },
        { name: 'Instagram', file: 'social icons/Instagram.png' },
        { name: 'Snapchat', file: 'social icons/Snapchat.png' },
        { name: 'Telegram', file: 'social icons/Telegram.png' },
        { name: 'WhatsApp', file: 'social icons/Whatsapp.png' },
        { name: 'Twitch', file: 'social icons/Twitch.png' },
        { name: 'YouTube', file: 'social icons/Youtube.png' },
        { name: 'TikTok', file: 'social icons/Tiktok.png' },
        { name: 'Discord', file: 'social icons/Discord.png' },
        { name: 'Slack', file: 'social icons/Slack.png' },
        { name: 'Skype', file: 'social icons/Skype.png' },
        { name: 'Behance', file: 'social icons/Behance.png' },
        { name: 'Dribbble', file: 'social icons/Dribbble.png' },
        { name: 'Dropbox', file: 'social icons/Dropbox.png' },
        { name: 'Drive', file: 'social icons/Drive.png' },
        { name: 'Excel', file: 'social icons/Excel.png' },
        { name: 'Line', file: 'social icons/Line.png' },
        { name: 'Messenger', file: 'social icons/Messenger.png' },
        { name: 'OneNote', file: 'social icons/OneNote.png' },
        { name: 'Outlook', file: 'social icons/Outlook.png' },
        { name: 'Paypal', file: 'social icons/Paypal.png' },
        { name: 'PowerPoint', file: 'social icons/PowerPoint.png' },
        { name: 'Soundcloud', file: 'social icons/Soundcloud.png' },
        { name: 'Spotify', file: 'social icons/Spotify.png' },
        { name: 'Tumblr', file: 'social icons/Tumblr.png' },
        { name: 'Viber', file: 'social icons/Viber.png' },
        { name: 'Vimeo', file: 'social icons/Vimeo.png' },
        { name: 'VK', file: 'social icons/VK.png' },
        { name: 'WeChat', file: 'social icons/WeChat.png' },
        { name: 'Word', file: 'social icons/Word.png' },
        { name: 'Zoom', file: 'social icons/Zoom.png' }
      ],
      skins: [
        { name: 'SKINS Design 00 Front/Back', file: 'SKINS_DESIGN 00_FRONT OR BACK.png' },
        { name: 'SKINS Design 00A Back', file: 'SKINS_DESIGN 00A_BACK.png' },
        { name: 'SKINS Design 00A Front', file: 'SKINS_DESIGN 00A_FRONT.png' },
        { name: 'SKINS Design 1 Back', file: 'SKINS_DESIGN 1_BACK.png' },
        { name: 'SKINS Design 1 Front', file: 'SKINS_DESIGN 1_FRONT.png' },
        { name: 'SKINS Design 10 Back', file: 'SKINS_DESIGN 10_BACK.png' },
        { name: 'SKINS Design 10 Front', file: 'SKINS_DESIGN 10_FRONT.png' },
        { name: 'SKINS Design 11 Back', file: 'SKINS_DESIGN 11_BACK.png' },
        { name: 'SKINS Design 11 Front', file: 'SKINS_DESIGN 11_FRONT.png' },
        { name: 'SKINS Design 12 Back', file: 'SKINS_DESIGN 12_BACK.png' },
        { name: 'SKINS Design 12 Front', file: 'SKINS_DESIGN 12_FRONT.png' },
        { name: 'SKINS Design 13 Back', file: 'SKINS_DESIGN 13_BACK.png' },
        { name: 'SKINS Design 13 Front', file: 'SKINS_DESIGN 13_FRONT.png' },
        { name: 'SKINS Design 14 Front/Back', file: 'SKINS_DESIGN 14_FRONT OR BACK.png' },
        { name: 'SKINS Design 15 Front/Back', file: 'SKINS_DESIGN 15_FRONT OR BACK.png' },
        { name: 'SKINS Design 16 Front/Back', file: 'SKINS_DESIGN 16_FRONT OR BACK.png' },
        { name: 'SKINS Design 17 Back', file: 'SKINS_DESIGN 17_BACK.png' },
        { name: 'SKINS Design 17 Front', file: 'SKINS_DESIGN 17_FRONT.png' },
        { name: 'SKINS Design 18A Front/Back', file: 'SKINS_DESIGN 18A_FRONT OR BACK.png' },
        { name: 'SKINS Design 18B Front/Back', file: 'SKINS_DESIGN 18B_FRONT OR BACK.png' },
        { name: 'SKINS Design 19 Back', file: 'SKINS_DESIGN 19_BACK.png' },
        { name: 'SKINS Design 19 Front', file: 'SKINS_DESIGN 19_FRONT.png' },
        { name: 'SKINS Design 2 Back', file: 'SKINS_DESIGN 2_BACK.png' },
        { name: 'SKINS Design 2 Front', file: 'SKINS_DESIGN 2_FRONT.png' },
        { name: 'SKINS Design 20 Back', file: 'SKINS_DESIGN 20_BACK.png' },
        { name: 'SKINS Design 20 Front', file: 'SKINS_DESIGN 20_FRONT.png' },
        { name: 'SKINS Design 21 Back', file: 'SKINS_DESIGN 21_BACK.png' },
        { name: 'SKINS Design 21 Front', file: 'SKINS_DESIGN 21_FRONT.png' },
        { name: 'SKINS Design 22 Back', file: 'SKINS_DESIGN 22_BACK.png' },
        { name: 'SKINS Design 22 Front', file: 'SKINS_DESIGN 22_FRONT.png' },
        { name: 'SKINS Design 23 Back', file: 'SKINS_DESIGN 23_BACK.png' },
        { name: 'SKINS Design 23 Front', file: 'SKINS_DESIGN 23_FRONT.png' },
        { name: 'SKINS Design 24 Back', file: 'SKINS_DESIGN 24_BACK.png' },
        { name: 'SKINS Design 24 Front', file: 'SKINS_DESIGN 24_FRONT.png' },
        { name: 'SKINS Design 25 Back', file: 'SKINS_DESIGN 25_BACK.png' },
        { name: 'SKINS Design 25 Front', file: 'SKINS_DESIGN 25_FRONT.png' },
        { name: 'SKINS Design 26 Back', file: 'SKINS_DESIGN 26_BACK.png' },
        { name: 'SKINS Design 26 Front', file: 'SKINS_DESIGN 26_FRONT.png' },
        { name: 'SKINS Design 27 Back', file: 'SKINS_DESIGN 27_BACK.png' },
        { name: 'SKINS Design 27 Front', file: 'SKINS_DESIGN 27_FRONT.png' },
        { name: 'SKINS Design 28 Black', file: 'SKINS_DESIGN 28_FRONT OR BACK.png' },
        { name: 'SKINS Design 3 Black', file: 'SKINS_DESIGN 3_BLACK.png' },
        { name: 'SKINS Design 3 Front', file: 'SKINS_DESIGN 3_FRONT.png' },
        { name: 'SKINS Design 4 Back', file: 'SKINS_DESIGN 4_BACK.png' },
        { name: 'SKINS Design 4 Front', file: 'SKINS_DESIGN 4_FRONT.png' },
        { name: 'SKINS Design 5 Back', file: 'SKINS_DESIGN 5_BACK.png' },
        { name: 'SKINS Design 5 Front', file: 'SKINS_DESIGN 5_FRONT.png' },
        { name: 'SKINS Design 6 Back', file: 'SKINS_DESIGN 6_BACK.png' },
        { name: 'SKINS Design 6 Front', file: 'SKINS_DESIGN 6_FRONT.png' },
        { name: 'SKINS Design 7 Back', file: 'SKINS_DESIGN 7_BACK.png' },
        { name: 'SKINS Design 7 Front', file: 'SKINS_DESIGN 7_FRONT.png' },
        { name: 'SKINS Design 8 Back', file: 'SKINS_DESIGN 8_BACK.png' },
        { name: 'SKINS Design 8 Front', file: 'SKINS_DESIGN 8_FRONT.png' },
        { name: 'SKINS Design 9 Back', file: 'SKINS_DESIGN 9_BACK.png' },
        { name: 'SKINS Design 9 Front', file: 'SKINS_DESIGN 9_FRONT.png' }
      ]
    }

    // Search through all categories to find the matching asset
    for (const [categoryName, assets] of Object.entries(assetCategories)) {
      const foundAsset = assets.find(asset => asset.name === assetName)
      if (foundAsset) {
        return `/assets/images/${foundAsset.file}`
      }
    }

    // If not found in predefined categories, try direct path construction
    // This handles cases where the assetName might be the filename itself
    return `/assets/images/${assetName}`
  }, [])

  // Function to restore image elements from serialized data
  const restoreImageElements = useCallback(async (elements) => {
    const restoredElements = []
    
    for (const element of elements) {
      if (element.type === 'image' && element.image) {
        // If the image is a serialized object, we need to recreate the HTML Image
        if (typeof element.image === 'object' && !element.image.naturalWidth) {
          try {
            // Check if it's a QR code that needs to be regenerated
            if (element.assetName === 'QR Code' && element.qrData) {
              console.log('🎨 Restoring QR code:', element.qrData)
              
              // Create a hidden div to render the QR code
              const qrContainer = document.createElement('div')
              qrContainer.style.position = 'absolute'
              qrContainer.style.left = '-9999px'
              qrContainer.style.top = '-9999px'
              document.body.appendChild(qrContainer)
              
              // Create a temporary React element for the QR code
              const qrElement = React.createElement(QRCodeCanvas, {
                value: element.qrData.url,
                size: 200,
                fgColor: element.qrData.color,
                bgColor: element.qrData.backgroundColor,
                level: 'M', // Medium error correction
                includeMargin: true
              })
              
              // Render the QR code to the hidden container
              const root = createRoot(qrContainer)
              root.render(qrElement)
              
              // Wait for the QR code to render, then capture it
              await new Promise((resolve) => {
                setTimeout(() => {
                  const canvas = qrContainer.querySelector('canvas')
                  if (canvas) {
                    const qrDataUrl = canvas.toDataURL('image/png')
                    
                    // Create image element from the QR code
                    const img = new window.Image()
                    img.onload = () => {
                      const restoredElement = {
                        ...element,
                        image: img
                      }
                      restoredElements.push(restoredElement)
                      resolve()
                    }
                    img.src = qrDataUrl
                  } else {
                    resolve()
                  }
                  
                  // Clean up the hidden container
                  document.body.removeChild(qrContainer)
                }, 100)
              })
            } else {
              // Check if we have a data URL or need to recreate the image
              let imageSrc = null
              
              // If it's an uploaded file, check if we have a data URL stored
              if (element.uploadedFile && element.imageDataUrl) {
                // Use the stored data URL for uploaded images
                imageSrc = element.imageDataUrl
              } else if (element.imagePath) {
                // Use the stored image path if available (newer saves)
                imageSrc = element.imagePath
              } else if (element.assetName) {
                // For older saves, we need to find the correct file path
                // The assetName is the display name, but we need to find the actual file
                imageSrc = await findAssetImagePath(element.assetName)
              }
              
              if (imageSrc) {
                // Create a new HTML Image element
                const img = new window.Image()
                img.crossOrigin = 'anonymous'
                await new Promise((resolve, reject) => {
                  img.onload = resolve
                  img.onerror = (error) => {
                    console.error('Failed to load image:', imageSrc, error)
                    reject(error)
                  }
                  img.src = imageSrc
                })
                
                // Create the restored element
                const restoredElement = {
                  ...element,
                  image: img
                }
                restoredElements.push(restoredElement)
              } else {
                // Skip elements we can't restore
                console.warn('Cannot restore image element - no valid image source found:', element)
              }
            }
          } catch (error) {
            console.error('Failed to restore image element:', error)
            // Skip this element if restoration fails
          }
        } else {
          // Element is already properly formatted
          restoredElements.push(element)
        }
      } else {
        // Non-image elements can be restored as-is
        restoredElements.push(element)
      }
    }
    
    return restoredElements
  }, [findAssetImagePath])

  // Load design from database
  const loadDesignFromDatabase = useCallback(async (designId) => {
    try {
      const response = await authService.authenticatedRequest(`/api/designs/${designId}`)
      if (response.ok) {
        const designData = await response.json()
        if (designData.canvas_data) {
          const canvasData = JSON.parse(designData.canvas_data)
          // Restore image elements properly
          restoreImageElements(canvasData.elements || []).then(restoredElements => {
            setElements(restoredElements)
            setBackgroundColor(canvasData.backgroundColor || '#ffffff')
            if (canvasData.bannerSpecs) {
              setBannerSpecs(canvasData.bannerSpecs)
            }
            if (canvasData.canvasSize) {
              setCanvasSize(canvasData.canvasSize)
              setCanvasOrientation(canvasData.canvasSize.width > canvasData.canvasSize.height ? 'landscape' : 'portrait')
            }
          }).catch(error => {
            console.error('Failed to restore image elements:', error)
            // Fallback to loading without images
            setElements(canvasData.elements || [])
            setBackgroundColor(canvasData.backgroundColor || '#ffffff')
            if (canvasData.bannerSpecs) {
              setBannerSpecs(canvasData.bannerSpecs)
            }
            if (canvasData.canvasSize) {
              setCanvasSize(canvasData.canvasSize)
              setCanvasOrientation(canvasData.canvasSize.width > canvasData.canvasSize.height ? 'landscape' : 'portrait')
            }
          })
        }
      } else {
        console.error('Failed to load design from database')
      }
    } catch (error) {
      console.error('Error loading design from database:', error)
    }
  }, [restoreImageElements])

  // Load template from database
  const loadTemplateFromDatabase = useCallback(async (templateId) => {
    try {
      const response = await authService.authenticatedRequest(`/api/templates/${templateId}`)
      if (response.ok) {
        const templateData = await response.json()
        if (templateData.canvas_data) {
          const canvasData = JSON.parse(templateData.canvas_data)
          // Restore image elements properly
          restoreImageElements(canvasData.elements || []).then(restoredElements => {
            setElements(restoredElements)
            setBackgroundColor(canvasData.backgroundColor || '#ffffff')
            if (canvasData.bannerSpecs) {
              setBannerSpecs(canvasData.bannerSpecs)
            }
            if (canvasData.canvasSize) {
              setCanvasSize(canvasData.canvasSize)
              setCanvasOrientation(canvasData.canvasSize.width > canvasData.canvasSize.height ? 'landscape' : 'portrait')
            }
          }).catch(error => {
            console.error('Failed to restore image elements:', error)
            // Fallback to loading without images
            setElements(canvasData.elements || [])
            setBackgroundColor(canvasData.backgroundColor || '#ffffff')
            if (canvasData.bannerSpecs) {
              setBannerSpecs(canvasData.bannerSpecs)
            }
            if (canvasData.canvasSize) {
              setCanvasSize(canvasData.canvasSize)
              setCanvasOrientation(canvasData.canvasSize.width > canvasData.canvasSize.height ? 'landscape' : 'portrait')
            }
          })
        }
      } else {
        console.error('Failed to load template from database')
      }
    } catch (error) {
      console.error('Error loading template from database:', error)
    }
  }, [restoreImageElements])

  // Load saved design on mount - check for design/template ID in URL params
  useEffect(() => {
    // Check if we're returning from checkout with a cancelled order
    const cancelledOrder = sessionStorage.getItem('cancelledOrder')
    if (cancelledOrder) {
      try {
        const orderData = JSON.parse(cancelledOrder)
        if (orderData.canvas_data) {
          // Restore image elements properly
          restoreImageElements(orderData.canvas_data.elements || []).then(restoredElements => {
            setElements(restoredElements)
            setBackgroundColor(orderData.canvas_data.backgroundColor || '#ffffff')
            if (orderData.canvas_data.bannerSpecs) {
              setBannerSpecs(orderData.canvas_data.bannerSpecs)
            }
            if (orderData.canvas_data.canvasSize) {
              setCanvasSize(orderData.canvas_data.canvasSize)
              setCanvasOrientation(orderData.canvas_data.canvasSize.width > orderData.canvas_data.canvasSize.height ? 'landscape' : 'portrait')
            }
          }).catch(error => {
            console.error('Failed to restore image elements:', error)
            // Fallback to loading without images
            setElements(orderData.canvas_data.elements || [])
            setBackgroundColor(orderData.canvas_data.backgroundColor || '#ffffff')
            if (orderData.canvas_data.bannerSpecs) {
              setBannerSpecs(orderData.canvas_data.bannerSpecs)
            }
            if (orderData.canvas_data.canvasSize) {
              setCanvasSize(orderData.canvas_data.canvasSize)
              setCanvasOrientation(orderData.canvas_data.canvasSize.width > orderData.canvas_data.canvasSize.height ? 'landscape' : 'portrait')
            }
          })
        }
        sessionStorage.removeItem('cancelledOrder')
      } catch (error) {
        console.error('Failed to restore cancelled order:', error)
      }
    }

    // Check URL params for design/template ID to load from database
    const designId = searchParams.get('design')
    const templateId = searchParams.get('template')
    
    if (designId) {
      setCameFromTemplate(false)
      loadDesignFromDatabase(designId)
    } else if (templateId) {
      setCameFromTemplate(true)
      // Check for template data in sessionStorage first
      const templateData = sessionStorage.getItem('templateData')
      if (templateData) {
        try {
          const canvasData = JSON.parse(templateData)
          console.log('🎨 Loading template data from sessionStorage:', canvasData)
          
          // Restore image elements properly
          console.log('🎨 About to restore elements:', canvasData.elements)
          console.log('🎨 Canvas data keys:', Object.keys(canvasData))
          restoreImageElements(canvasData.elements || []).then(restoredElements => {
            console.log('🎨 Restored elements:', restoredElements)
            setElements(restoredElements)
            setBackgroundColor(canvasData.backgroundColor || '#ffffff')
            if (canvasData.bannerSpecs) {
              setBannerSpecs(canvasData.bannerSpecs)
            }
            if (canvasData.canvasSize) {
              setCanvasSize(canvasData.canvasSize)
              setCanvasOrientation(canvasData.canvasSize.width > canvasData.canvasSize.height ? 'landscape' : 'portrait')
            }
            // Clear the template data from sessionStorage after loading
            sessionStorage.removeItem('templateData')
          }).catch(error => {
            console.error('Failed to restore image elements:', error)
            // Fallback to loading without images
            console.log('🎨 Fallback: Setting elements directly:', canvasData.elements)
            setElements(canvasData.elements || [])
            setBackgroundColor(canvasData.backgroundColor || '#ffffff')
            if (canvasData.bannerSpecs) {
              setBannerSpecs(canvasData.bannerSpecs)
            }
            if (canvasData.canvasSize) {
              setCanvasSize(canvasData.canvasSize)
              setCanvasOrientation(canvasData.canvasSize.width > canvasData.canvasSize.height ? 'landscape' : 'portrait')
            }
            // Clear the template data from sessionStorage after loading
            sessionStorage.removeItem('templateData')
          })
        } catch (error) {
          console.error('Failed to parse template data from sessionStorage:', error)
          // Clear invalid data and fallback to loading from database
          sessionStorage.removeItem('templateData')
          loadTemplateFromDatabase(templateId)
        }
      } else {
        // No template data in sessionStorage, load from database
        loadTemplateFromDatabase(templateId)
      }
    }
  }, [restoreImageElements])

  // Handle mobile sidebar close event
  useEffect(() => {
    const handleCloseMobileSidebar = () => {
      setIsMobileSidebarOpen(false)
    }

    window.addEventListener('closeMobileSidebar', handleCloseMobileSidebar)
    return () => {
      window.removeEventListener('closeMobileSidebar', handleCloseMobileSidebar)
    }
  }, [])

  // Glass UI Header Component
  const GlassHeader = () => (
    <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 p-2 md:p-4">
      <div className="flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(cameFromTemplate ? '/dashboard?tab=templates' : '/dashboard')}
            className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden md:inline text-sm font-medium">
              {cameFromTemplate ? 'Templates' : 'Dashboard'}
            </span>
          </button>
          
          <div className="hidden md:block w-px h-6 bg-white/30" />
          
          {/* BuyPrintz Logo - Clickable to Homepage */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <img 
              src="/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png" 
              alt="BuyPrintz" 
              className="h-12 md:h-16 w-auto"
            />
          </button>
        </div>

        {/* Center Section - Product Type Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700 hidden md:block">
            Product:
          </label>
          <select
            value={productType}
            onChange={(e) => handleProductTypeChange(e.target.value)}
            className="px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg transition-all duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="banner">🏷️ Vinyl Banner</option>
            <option value="tin">🗃️ Business Card Tin</option>
            <option value="tent">🏕️ Tradeshow Tent</option>
          </select>
        </div>

        {/* Right Section */}
        <div className="action-buttons flex items-center gap-2 md:gap-3">
          <button
            onClick={saveAsTemplate}
            className="px-2 md:px-4 py-1 md:py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 border border-purple-400/30 backdrop-blur-sm rounded-xl transition-all duration-200 font-medium text-xs md:text-sm"
          >
            <span className="hidden sm:inline">Save as Template</span>
            <span className="sm:hidden">Save</span>
          </button>
          
          <button
            onClick={createOrder}
            className="px-2 md:px-4 py-1 md:py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 border border-blue-400/30 backdrop-blur-sm rounded-xl transition-all duration-200 font-medium flex items-center gap-1 md:gap-2 text-xs md:text-sm"
          >
            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Create Order</span>
            <span className="sm:hidden">Order</span>
          </button>
          
          {/* Mobile Hamburger - After action buttons */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="mobile-hamburger md:hidden p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center z-50"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
      </div>
    </div>
  )

  return (
    <div className="final-step h-screen flex flex-col bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 overflow-hidden">
      
      {/* Header */}
      <GlassHeader />
      
      {/* Main Content - Mobile Optimized with Landscape Toggle */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar - Toggleable on Mobile Landscape, Always Visible on Desktop */}
        <div className={`
          sidebar-tools
          ${isMobileSidebarOpen ? 'fixed inset-0 z-50' : 'hidden'}
          md:block md:relative md:inset-auto md:z-auto
          transition-all duration-300 ease-in-out
        `}>
          <BannerSidebar
            isMobileOpen={isMobileSidebarOpen}
            bannerSpecs={bannerSpecs}
            bannerTypes={bannerTypes}
            bannerSizes={productConfigs[productType].sizes}
            canvasSize={canvasSize}
            canvasOrientation={canvasOrientation}
            productType={productType}
            tinSpecs={tinSpecs}
            onTinSpecsChange={handleTinSpecChange}
            currentSurface={currentSurface}
            onSurfaceChange={handleSurfaceChange}

            onAddShape={addShape}
            onAddText={addText}
            onAddAsset={addAsset}
            onAddIcon={addIcon}
            onLoadTemplate={loadTemplate}
            onImageUpload={handleImageUpload}
            onAddQRCode={addQRCode}

            onTextPropertyChange={handleTextPropertyChange}
            onShapePropertyChange={handleShapePropertyChange}
            onChangeBannerType={changeBannerType}
            onChangeCanvasSize={changeCanvasSize}
            onToggleCanvasOrientation={toggleCanvasOrientation}
            bannerTemplates={bannerTemplates}
            userTemplates={[]}
            selectedElement={elements.find(el => el.id === selectedId)}
          />
        </div>
        
        {/* Canvas - Centered on Mobile Landscape when Sidebar Closed, Normal on Desktop */}
        <div className={`
          canvas-container flex-1 relative
          ${isMobileSidebarOpen ? 'hidden' : 'block'}
          md:block
          z-10 md:z-auto
          transition-all duration-300 ease-in-out
        `}>
          <BannerCanvas
            elements={elements}
            setElements={setElements}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            canvasSize={canvasSize}
            backgroundColor={backgroundColor}
            onExport={exportToPDF}
            onCreateOrder={createOrder}
            onClearCanvas={clearCanvas}
            hasElements={elements.length > 0}
            productType={productType}
            currentSurface={currentSurface}
            onSurfaceChange={handleSurfaceChange}
            clipFunc={productType === 'tent' && (currentSurface === 'canopy_front' || currentSurface === 'canopy_back' || currentSurface === 'canopy_left' || currentSurface === 'canopy_right') ? getTentCanopyClipFunc() : null}
          />
          
                {/* Mobile Overlay when sidebar is open */}
      {isMobileSidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/20 z-20" onClick={() => setIsMobileSidebarOpen(false)} />
      )}
      </div>
    </div>
    
    {/* Onboarding Tour */}
    <OnboardingTour
      isFirstTimeUser={isFirstTimeUser}
      showTour={showTour}
      onTourComplete={async () => {
        setShowTour(false)
        setIsFirstTimeUser(false)
        try {
          await authService.authenticatedRequest('/api/user/mark-tour-completed', {
            method: 'POST'
          })
        } catch (error) {
          console.error('Error marking tour as completed:', error)
        }
      }}
      onSkipTour={async () => {
        setShowTour(false)
        setIsFirstTimeUser(false)
        try {
          await authService.authenticatedRequest('/api/user/mark-tour-completed', {
            method: 'POST'
          })
        } catch (error) {
          console.error('Error marking tour as completed:', error)
        }
      }}
    />
    
    
    {/* Save Modal */}
    <SaveModal
      isOpen={showSaveModal}
      onClose={() => {
        setShowSaveModal(false)
        setSaveError(null)
      }}
      onSave={handleSaveTemplate}
      type={saveModalType}
      isLoading={isSaving}
      error={saveError}
    />
    
    {/* Success Notification */}
    <SuccessNotification
      isVisible={showSuccessNotification}
      onClose={() => setShowSuccessNotification(false)}
      title={successMessage.title}
      message={successMessage.message}
      type="success"
    />
    </div>
  )
}

export default BannerEditorNew
