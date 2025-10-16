import React, { useState, useCallback, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
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
  const stageRef = useRef() // Add stageRef to BannerEditor
  
  // Product type selection - Must be declared first
  const [productType, setProductType] = useState(() => {
    // Initialize from URL parameter
    const urlProduct = searchParams.get('product')
    if (urlProduct === 'tin') return 'tin'
    if (urlProduct === 'tent') return 'tent'
    if (urlProduct === 'sticker') return 'sticker'
    return 'banner' // default
  })
  
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
      specs: 'Wind resistant',
      description: 'Allows wind to pass through, perfect for windy areas',
      uses: ['Windy Locations', 'Fence Banners', 'Construction Sites']
    },
    {
      id: 'fabric-banner',
      name: 'Fabric Banner',
      category: 'Fabric Banners',
      material: '9oz Fabric',
      finish: 'Matte',
      specs: 'Eco-friendly option',
      description: 'Made from recycled materials, wrinkle-resistant',
      uses: ['Indoor Events', 'Trade Shows', 'Retail Displays']
    },
    {
      id: 'backlit-banner',
      name: 'Backlit Banner',
      category: 'Backlit Banners',
      material: 'Translucent Vinyl',
      finish: 'Translucent',
      specs: 'Illuminated display',
      description: 'Designed for backlighting, vibrant colors when lit',
      uses: ['Light Boxes', 'Illuminated Signs', 'Night Displays']
    },
    {
      id: 'pole-banner',
      name: 'Pole Banner',
      category: 'Pole Banners',
      material: '13oz Vinyl',
      finish: 'Matte',
      specs: 'Double-sided printing',
      description: 'Perfect for street poles and flagpoles',
      uses: ['Street Marketing', 'Events', 'Directional Signs']
    }
  ]

  // Sticker specifications and materials
  const stickerMaterials = [
    {
      id: 'premium-vinyl',
      name: 'Premium Vinyl Stickers',
      material: 'Premium Vinyl',
      finish: 'White Back',
      specs: 'Weather resistant, vibrant colors',
      description: 'High-quality vinyl with white backing for maximum opacity',
      uses: ['Outdoor Use', 'Vehicles', 'Signs', 'Equipment']
    },
    {
      id: 'premium-clear-vinyl',
      name: 'Premium Clear Vinyl Stickers',
      material: 'Premium Clear Vinyl',
      finish: 'Transparent',
      specs: 'Clear background, see-through effect',
      description: 'Transparent vinyl for glass and windows',
      uses: ['Windows', 'Glass', 'Transparent Surfaces', 'Decals']
    }
  ]

  // Sticker shape configurations with clipping paths
  const stickerShapes = [
    {
      id: 'circle',
      name: 'Circle',
      description: 'Perfect round stickers',
      sizes: ['1x1', '2x2', '3x3', '4x4', '5x5']
    },
    {
      id: 'square',
      name: 'Square',
      description: 'Classic square stickers',
      sizes: ['1x1', '2x2', '2.5x2.5', '3x3', '3.5x3.5', '4x4', '4.5x4.5', '5x5']
    },
    {
      id: 'rectangle',
      name: 'Rectangle',
      description: 'Rectangular stickers for text and logos',
      sizes: ['2x4', '2.5x3', '3x2', '3x5', '3.5x1.5', '4x2', '4x3', '4x6', '5x3', '6x4']
    },
    {
      id: 'triangle',
      name: 'Triangle',
      description: 'Triangular stickers for directional use',
      sizes: ['1x1', '2x1.5', '2x2', '3x2', '3x3', '4x2.5', '4x4', '5x3', '5x5', '6x4']
    },
    {
      id: 'diamond',
      name: 'Diamond',
      description: 'Diamond-shaped stickers',
      sizes: ['1x1', '2x2', '3x3', '4x4', '5x5']
    },
    {
      id: 'oval',
      name: 'Oval',
      description: 'Oval stickers for elegant designs',
      sizes: ['2x1.5', '3x2', '3x4', '4x3', '4x5', '5x4']
    }
  ]

  // Initialize product specs based on URL parameter (only if not already initialized)
  useEffect(() => {
    const urlProduct = searchParams.get('product')
    console.log('🎨 Checking specs initialization for product:', urlProduct)
    
    if (urlProduct === 'tin' && !tinSpecs) {
      setTinSpecs({
        finish: 'silver',
        surfaceCoverage: 'front-back',
        printingMethod: 'premium-vinyl'
      })
      console.log('🎨 Initialized tin specs')
    } else if (urlProduct === 'tent' && !tentDesignOption) {
      console.log('🎨 useEffect tent initialization - tentDesignOption was null, setting to canopy-only')
      setTentDesignOption('canopy-only')
      if (!tentSpecs) {
        console.log('🎨 useEffect tent initialization - tentSpecs was null, initializing')
        const newTentSpecs = {
          tentSize: '10x10',
          surfaces: {
            canopy: true,
            sidewalls: false,
            backwall: false
          },
          withFrame: true,
          reinforcedStripColor: 'white'
        }
        setTentSpecs(newTentSpecs)
        console.log('🎨 useEffect tent initialization - set tentSpecs to:', newTentSpecs)
      } else {
        console.log('🎨 useEffect tent initialization - tentSpecs already exists:', tentSpecs)
      }
      console.log('🎨 Initialized tent design option and specs')
    } else if (urlProduct === 'banner' && !bannerSpecs) {
      setBannerSpecs(bannerTypes[0])
      console.log('🎨 Initialized banner specs')
    }
  }, []) // Only run once on mount
  
  // Surface navigation state - Must be declared before elements
  const [currentSurface, setCurrentSurface] = useState(() => {
    const urlProduct = searchParams.get('product')
    if (urlProduct === 'tin') return 'front'
    if (urlProduct === 'tent') return 'canopy_front'
    if (urlProduct === 'sticker') return 'square'
    return 'front'
  })
  
  // Available surfaces for multi-surface product navigation
  const [availableSurfaces, setAvailableSurfaces] = useState([])
  
  // Core state - Multi-surface support for tins, tents, and stickers
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
    backwall: [],
    // Sticker surfaces (different shapes)
    circle: [],
    square: [],
    rectangle: [],
    triangle: [],
    diamond: [],
    oval: []
  })
  
  // Store captured surface images (Konva exports for each surface)
  const [surfaceImages, setSurfaceImages] = useState({})
  
  
  // Function to copy design elements between surfaces
  const copyDesignToSurface = useCallback((sourceSurface, targetSurface) => {
    if (surfaceElements[sourceSurface] && surfaceElements[sourceSurface].length > 0) {
      setSurfaceElements(prev => ({
        ...prev,
        [targetSurface]: [...prev[sourceSurface]] // Copy elements from source to target
      }))
      console.log(`🎨 Copied design from ${sourceSurface} to ${targetSurface}`)
    }
  }, [surfaceElements])
  
  // Current elements based on product type and surface
  const elements = (productType === 'tin' || productType === 'tent' || productType === 'sticker') 
    ? (surfaceElements[currentSurface] || []) 
    : (surfaceElements.front || [])
  const setElements = (productType === 'tin' || productType === 'tent' || productType === 'sticker')
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
  const [currentTemplateId, setCurrentTemplateId] = useState(null)
  const [activeDesignAssets, setActiveDesignAssets] = useState(new Set())
  
  // Navigation state
  const [cameFromTemplate, setCameFromTemplate] = useState(false)
  
  // Tour state
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false)
  
  // Marketplace templates tracking
  const [marketplaceTemplates, setMarketplaceTemplates] = useState([])
  const [showTour, setShowTour] = useState(false)
  
  // Specification state - this drives downstream components
  const [tentDesignOption, setTentDesignOption] = useState(() => {
    const urlProduct = searchParams.get('product')
    if (urlProduct === 'tent') {
      return 'canopy-only'
    }
    return null // For non-tent products, return null
  })

  // Tent specifications state - surface-based configuration
  const [tentSpecs, setTentSpecsOriginal] = useState(() => {
    const urlProduct = searchParams.get('product')
    console.log('🎨 TentSpecs useState init - urlProduct:', urlProduct)
    if (urlProduct === 'tent') {
      const defaultSpecs = {
        tentSize: '10x10',
        surfaces: {
          canopy: true, // Always true - canopy is always included
          sidewalls: false,
          backwall: false
        },
        withFrame: true, // Default to with frame (complete tent)
        reinforcedStripColor: 'white'
      }
      console.log('🎨 TentSpecs useState init - returning default specs:', defaultSpecs)
      return defaultSpecs
    }
    console.log('🎨 TentSpecs useState init - returning null for non-tent product')
    return null
  })
  
  // Wrapped setTentSpecs to debug when it's called with null
  const setTentSpecs = useCallback((value) => {
    if (value === null) {
      console.log('🚨 setTentSpecs called with null! Stack trace:')
      console.trace()
    } else {
      console.log('✅ setTentSpecs called with value:', value)
    }
    setTentSpecsOriginal(value)
  }, [])
  
  // Ref to store latest tent specs for immediate access
  const tentSpecsRef = useRef(tentSpecs)
  
  // Initialize tentSpecs when product type changes to tent and tentSpecs is null
  useEffect(() => {
    if (productType === 'tent' && tentSpecs === null) {
      console.log('🎨 Product type is tent but tentSpecs is null - initializing default specs')
      const defaultSpecs = {
        tentSize: '10x10',
        surfaces: {
          canopy: true,
          sidewalls: false,
          backwall: false
        },
        withFrame: true,
        reinforcedStripColor: 'white'
      }
      setTentSpecs(defaultSpecs)
    }
  }, [productType, tentSpecs])

  // Debug tentSpecs changes and update ref
  useEffect(() => {
    console.log('🎨 TentSpecs state changed to:', tentSpecs)
    tentSpecsRef.current = tentSpecs
    
    // Update available surfaces when tent specs change
    if (productType === 'tent' && tentSpecs) {
      const baseSurfaces = ['canopy_front', 'canopy_back', 'canopy_left', 'canopy_right']
      const additionalSurfaces = []
      
      if (tentSpecs.surfaces?.sidewalls) {
        additionalSurfaces.push('sidewall_left', 'sidewall_right')
      }
      
      if (tentSpecs.surfaces?.backwall) {
        additionalSurfaces.push('backwall')
      }
      
      const updatedAvailableSurfaces = [...baseSurfaces, ...additionalSurfaces]
      console.log('🎨 TentSpecs useEffect - Updating available surfaces:', updatedAvailableSurfaces)
      setAvailableSurfaces(updatedAvailableSurfaces)
    } else if (productType === 'tent' && tentSpecs === null) {
      // Reset to base surfaces when tentSpecs is null
      console.log('🎨 TentSpecs is null - resetting to base surfaces only')
      setAvailableSurfaces(['canopy_front', 'canopy_back', 'canopy_left', 'canopy_right'])
    }
    
    if (tentSpecs === null && productType === 'tent') {
      console.log('🚨 TentSpecs is null for tent product! Stack trace:')
      console.trace()
    }
  }, [tentSpecs, productType])
  
  
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
    if (urlProduct === 'tin') return { width: 393, height: 236 } // tin canvas 5% larger than tin surface (374x225)
    if (urlProduct === 'tent') return { width: 1160, height: 1049 } // tent canopy+valence default (canopy 789px + gap 20px + valence 200px + padding 40px)
    return { width: 800, height: 400 } // banner default
  })

  // Generate canvas image data for preview - MOVED HERE after canvasSize definition
  const generateCanvasImage = useCallback(() => {
    try {
      // PRIORITY 1: Use Konva native export for perfect alignment
      if (stageRef.current && typeof stageRef.current.toDataURL === 'function') {
        console.log('🎨 Using Konva native export (toDataURL) - eliminates alignment issues')
        
        // For tin products, export only the tin surface area (374x225) centered in canvas
        if (productType === 'tin') {
          console.log('🎨 Tin product detected - exporting tin surface area for alignment')
          const tinSurfaceWidth = 374
          const tinSurfaceHeight = 225
          const offsetX = (canvasSize.width - tinSurfaceWidth) / 2  // Center horizontally: (393-374)/2 = 9.5
          const offsetY = (canvasSize.height - tinSurfaceHeight) / 2 // Center vertically: (236-225)/2 = 5.5
          
          const imageData = stageRef.current.toDataURL({
            pixelRatio: 3, // Higher quality export for better print quality
            mimeType: 'image/png',
            quality: 1.0, // Maximum quality for print
            // Export only the tin surface area (374x225) centered in canvas
            x: offsetX,
            y: offsetY,
            width: tinSurfaceWidth,  // 374 - actual tin surface width
            height: tinSurfaceHeight // 225 - actual tin surface height
          })
          console.log('🎨 Tin surface area exported, length:', imageData.length)
          return imageData
        }
        
        // Standard export for other products
        const imageData = stageRef.current.toDataURL({
          pixelRatio: 3, // Higher quality export for better print quality
          mimeType: 'image/png',
          quality: 1.0 // Maximum quality for print
        })
        console.log('🎨 Konva image generated successfully, length:', imageData.length)
        
        // Check if image is too large (limit to 10MB for high quality)
        if (imageData.length > 10 * 1024 * 1024) {
          console.warn('🎨 Konva image too large, reducing quality')
          return stageRef.current.toDataURL({
            pixelRatio: 1, // Reduce pixel ratio for smaller file
            mimeType: 'image/png',
            quality: 0.5
          })
        }
        
        return imageData
      }
      
      // FALLBACK: Canvas method if Konva fails
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
        console.log('🎨 Falling back to canvas export method')
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
  }, [stageRef, productType, canvasSize])

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

  // Combined clipping function for tent canopy + valence
  const getTentCanopyValenceClipFunc = () => {
    return (ctx) => {
      // Create a single clipping path that includes both triangular canopy and rectangular valence
      ctx.beginPath()
      
      // Start with triangular canopy path
      ctx.moveTo(canvasSize.width / 2, 0) // Top point (center top)
      ctx.lineTo(0, 789)                  // Bottom left of triangle
      ctx.lineTo(canvasSize.width, 789)   // Bottom right of triangle
      
      // Continue to rectangular valence path (no closePath between them)
      ctx.lineTo(canvasSize.width, 809)   // Top right of valence
      ctx.lineTo(0, 809)                  // Top left of valence
      ctx.lineTo(0, 1009)                 // Bottom left of valence (789 + 20 + 200)
      ctx.lineTo(canvasSize.width, 1009)  // Bottom right of valence
      ctx.lineTo(canvasSize.width, 789)   // Back to bottom right of triangle
      
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
  const [tinSpecs, setTinSpecs] = useState(() => {
    const urlProduct = searchParams.get('product')
    if (urlProduct === 'tin') {
      return {
    finish: 'silver',
    surfaceCoverage: 'front-back',
    printingMethod: 'premium-vinyl'
      }
    }
    return null // For non-tin products, return null
  })

  // Sticker specifications state
  const [stickerSpecs, setStickerSpecs] = useState(() => {
    const urlProduct = searchParams.get('product')
    if (urlProduct === 'sticker') {
      return {
        material: 'premium-vinyl',
        shape: 'square',
        size: '3x3',
        quantity: 100
      }
    }
    return null // For non-sticker products, return null
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
      defaultSize: { width: 393, height: 236 }, // Canvas 5% larger than tin surface (374x225)
      sizes: [
        { name: 'Business Card Tin', width: 393, height: 236, orientation: 'landscape', category: 'standard' }
      ],
      description: 'Premium aluminum business card tins with custom vinyl stickers',
      // Safe zone is the actual tin surface area (374x225) centered in larger canvas
      safeZone: {
        margin: 9.5, // (393-374)/2 = 9.5px margin to center tin surface in canvas
        width: 374,   // Actual tin surface width
        height: 225   // Actual tin surface height
      }
    },
    tent: {
      name: 'Tradeshow Tent',
      defaultSize: { width: 1160, height: 1049 }, // Canopy + valence default (789px + 20px gap + 200px valence + 40px padding)
      sizes: [
        { name: 'Canopy + Valence', width: 1160, height: 1049, orientation: 'landscape', category: 'canopy' },
        { name: 'Full Wall', width: 1110, height: 780, orientation: 'landscape', category: 'wall' },
        { name: 'Half Wall', width: 1110, height: 370, orientation: 'landscape', category: 'wall' }
      ],
      description: 'Professional tradeshow tents with custom graphics'
    },
    sticker: {
      name: 'Custom Stickers',
      defaultSize: { width: 300, height: 300 }, // 3x3 inch at 100 DPI
      sizes: [
        { name: '1x1 inch', width: 100, height: 100, orientation: 'square', category: 'small' },
        { name: '2x2 inch', width: 200, height: 200, orientation: 'square', category: 'small' },
        { name: '3x3 inch', width: 300, height: 300, orientation: 'square', category: 'medium' },
        { name: '4x4 inch', width: 400, height: 400, orientation: 'square', category: 'medium' },
        { name: '5x5 inch', width: 500, height: 500, orientation: 'square', category: 'large' }
      ],
      description: 'Custom vinyl stickers in various shapes and sizes'
    }
  }
  
  // Handle product type change
  const handleProductTypeChange = useCallback((newProductType) => {
    console.log('🎨 Product type changing from', productType, 'to', newProductType)
    
    setProductType(newProductType)
    const config = productConfigs[newProductType]
    setCanvasSize(config.defaultSize)
    setCanvasOrientation(config.defaultSize.width > config.defaultSize.height ? 'landscape' : 'portrait')
    
    // Set appropriate default surface for each product type
    if (newProductType === 'tin') {
      setCurrentSurface('front')
      // Initialize tin specs
      setTinSpecs({
        finish: 'silver',
        surfaceCoverage: 'front-back',
        printingMethod: 'premium-vinyl'
      })
    } else if (newProductType === 'tent') {
      setCurrentSurface('canopy_front')
      // Initialize tent design option and specs
      setTentDesignOption('canopy-only')
      setTentSpecs({
        tentSize: '10x10',
        surfaces: {
          canopy: true,
          sidewalls: false,
          backwall: false
        },
        withFrame: true,
        reinforcedStripColor: 'white'
      })
    } else if (newProductType === 'sticker') {
      setCurrentSurface('square')
      // Initialize sticker specs
      setStickerSpecs({
        material: 'premium-vinyl',
        shape: 'square',
        size: '3x3',
        quantity: 100
      })
    } else {
      setCurrentSurface('front')
      // Initialize banner specs for banner products
      if (newProductType === 'banner') {
        setBannerSpecs(bannerTypes[0]) // Default to first banner type
      }
    }
    
    // Clear existing elements when switching product types
    setSurfaceElements({
      front: [],
      back: [],
      inside: [],
      lid: [],
      canopy_front: [],
      canopy_back: [],
      canopy_left: [],
      canopy_right: [],
      sidewall_left: [],
      sidewall_right: [],
      backwall: [],
      circle: [],
      square: [],
      rectangle: [],
      triangle: [],
      diamond: [],
      oval: []
    })
    
    console.log('🎨 Product type changed to:', newProductType)
  }, [productType, productConfigs, bannerTypes])

  // Handle tin specification changes
  const handleTinSpecChange = useCallback((key, value) => {
    setTinSpecs(prev => ({
      ...prev,
      [key]: value
    }))
    console.log('🎨 BannerEditor - Tin spec changed:', key, 'to', value)
  }, [])

  // Handle tent design option changes
  const handleTentDesignOptionChange = useCallback((value) => {
    const previousOption = tentDesignOption
    setTentDesignOption(value)
    console.log('🎨 BannerEditor - Tent design option changed from', previousOption, 'to:', value)
    
    // When switching to "all-sides", ensure sidewalls start blank
    if (value === 'all-sides' && previousOption !== 'all-sides') {
      setSurfaceElements(prev => ({
        ...prev,
        sidewall_left: [],
        sidewall_right: []
      }))
      console.log('🎨 BannerEditor - Initialized sidewalls as empty for all-sides mode')
    }
  }, [tentDesignOption])

  // Handle tent specification changes
  const handleTentSpecChange = useCallback((key, value) => {
    setTentSpecs(prev => {
      // Handle case where prev might be null
      const currentSpecs = prev || {
        tentSize: '10x10',
        surfaces: {
          canopy: true,
          sidewalls: false,
          backwall: false
        },
        withFrame: true,
        reinforcedStripColor: 'white'
      }
      
      let newSpecs
      
      // Handle nested surface changes
      if (key.startsWith('surfaces.')) {
        const surfaceKey = key.split('.')[1]
        newSpecs = {
          ...currentSpecs,
          surfaces: {
            ...currentSpecs.surfaces,
            [surfaceKey]: value
          }
        }
      } else {
        // Handle direct property changes
        newSpecs = {
          ...currentSpecs,
          [key]: value
        }
      }
      
      console.log('🎨 BannerEditor - Tent spec changed:', key, 'from', key.includes('.') ? currentSpecs.surfaces?.[key.split('.')[1]] : currentSpecs[key], 'to', value)
      console.log('🎨 BannerEditor - New tent specs:', newSpecs)
      
      // Update available surfaces based on tent specs
      if (productType === 'tent') {
        const baseSurfaces = ['canopy_front', 'canopy_back', 'canopy_left', 'canopy_right']
        const additionalSurfaces = []
        
        if (newSpecs.surfaces.sidewalls) {
          additionalSurfaces.push('sidewall_left', 'sidewall_right')
        }
        
        if (newSpecs.surfaces.backwall) {
          additionalSurfaces.push('backwall')
        }
        
        const updatedAvailableSurfaces = [...baseSurfaces, ...additionalSurfaces]
        console.log('🎨 BannerEditor - Updating available surfaces:', updatedAvailableSurfaces)
        setAvailableSurfaces(updatedAvailableSurfaces)
      }
      
      return newSpecs
    })
  }, [productType])

  // Handle surface navigation with automatic image capture
  const handleSurfaceChange = useCallback((surface) => {
    // CAPTURE CURRENT SURFACE IMAGE BEFORE SWITCHING
    if (productType === 'tin' || productType === 'tent' || productType === 'sticker') {
      const currentElements = surfaceElements[currentSurface] || []
      
      // Only capture if current surface has elements
      if (currentElements.length > 0) {
        try {
          const currentSurfaceImage = generateCanvasImage()
          if (currentSurfaceImage) {
            setSurfaceImages(prev => ({
              ...prev,
              [currentSurface]: currentSurfaceImage
            }))
            console.log(`🎨 AUTO-CAPTURED: Surface image for ${currentSurface} (${currentElements.length} elements)`)
          }
        } catch (error) {
          console.warn('🎨 Failed to auto-capture surface image for:', currentSurface, error)
        }
      }
    }
    
    // SWITCH TO NEW SURFACE
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
        // Canopy surfaces: triangular canopy + rectangular valence below
        // Total height: canopy height (789px) + gap (20px) + valence height (200px) + bottom padding (40px) = 1049px
        setCanvasSize({ width: 1160, height: 1049 })
      }
    }
  }, [productType, currentSurface, surfaceElements, generateCanvasImage])

  // Handle available surfaces change from sidebar
  const handleAvailableSurfacesChange = useCallback((surfaces) => {
    setAvailableSurfaces(surfaces)
  }, [])
  
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
  

  // Banner specifications - Only used for banner products
  const [bannerSpecs, setBannerSpecs] = useState(() => {
    // Get product type from URL parameter
    const productType = searchParams.get('product')
    
    // Only set banner specs for banner products
    if (productType === 'banner') {
    // Find the matching banner type
    const selectedBannerType = bannerTypes.find(banner => banner.id === productType)
    return selectedBannerType || bannerTypes[0]
    }
    
    // For non-banner products, return null or a default structure
    return null
  })

  // Log product specs once when component mounts
  useEffect(() => {
    const productType = searchParams.get('product')
    console.log('URL product parameter:', productType)
    
    if (productType === 'banner') {
      console.log('Selected banner type:', bannerSpecs)
    } else if (productType === 'tin') {
      console.log('Tin specs:', tinSpecs)
    } else if (productType === 'tent') {
      console.log('Tent design option:', tentDesignOption)
    }
  }, []) // Only run once on mount
  
  // Log specs when they change
  useEffect(() => {
    console.log('🎨 Current product type:', productType)
    if (productType === 'tin') {
      console.log('🎨 Current tin specs:', tinSpecs)
    } else if (productType === 'tent') {
      console.log('🎨 Current tent design option:', tentDesignOption)
    } else if (productType === 'banner') {
      console.log('🎨 Current banner specs:', bannerSpecs)
    }
  }, [productType, tinSpecs, tentDesignOption, bannerSpecs])

  // Utility functions
  const generateId = (type) => `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Clear canvas function
  const clearCanvas = useCallback(() => {
    if (elements.length === 0) return
    
    if (confirm('Are you sure you want to clear the canvas? This will remove all elements and cannot be undone.')) {
      setElements([])
      setSelectedId(null)
      setCurrentTemplateId(null) // Clear template selection
      setActiveDesignAssets(new Set()) // Clear active design assets
      // Show success feedback
      console.log('Canvas cleared successfully')
    }
  }, [elements.length])





  // Add shape element
  const addShape = useCallback((shapeType) => {
    // Konva coordinate system: center-positioned shapes (circle, star, triangle, hexagon) 
    // use x,y as center, while top-left positioned shapes (rect, text, image) use x,y as top-left
    const isCenterPositioned = ['circle', 'star', 'triangle', 'hexagon', 'octagon'].includes(shapeType)
    
    const baseProps = {
      id: generateId(shapeType),
      type: shapeType,
      // For center-positioned shapes: use exact center coordinates
      // For top-left positioned shapes: offset by shape size for visual centering
      x: isCenterPositioned ? canvasSize.width / 2 : canvasSize.width / 2 - 50,
      y: isCenterPositioned ? canvasSize.height / 2 : canvasSize.height / 2 - 50,
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
          id: generateId('icon'),
          type: 'image',
          x: canvasSize.width / 2 - 50 + (Math.random() - 0.5) * 100,
          y: canvasSize.height / 2 - 50 + (Math.random() - 0.5) * 100,
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
          id: generateId('icon'),
          type: 'text',
          x: canvasSize.width / 2 - 50 + (Math.random() - 0.5) * 100,
          y: canvasSize.height / 2 - 50 + (Math.random() - 0.5) * 100,
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
        id: generateId('icon'),
        type: 'text',
        x: canvasSize.width / 2 - 50 + (Math.random() - 0.5) * 100,
        y: canvasSize.height / 2 - 50 + (Math.random() - 0.5) * 100,
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
            id: 'template_qrcode_placeholder',
            type: 'image',
            x: canvasSize.width / 2 - 100,
            y: canvasSize.height / 2 - 100,
            width: 200,
            height: 200,
            image: img,
            imageDataUrl: qrDataUrl, // Store the data URL for serialization and print preview
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
        let updatedElement = { ...el }
        
        if (typeof value === 'function') {
          updatedElement[property] = value(el[property])
        } else {
          updatedElement[property] = value
        }
        
        // Special handling for text content changes
        if (property === 'text') {
          // Update wrap behavior and width based on whether text contains line breaks
          updatedElement.wrap = value.includes('\n') ? 'word' : 'none'
          updatedElement.width = value.includes('\n') ? (updatedElement.width || 200) : 'auto'
        }
        
          // Special handling for text elements when font size changes
          if (property === 'fontSize' && value !== el.fontSize) {
            // When font size changes, set a reasonable width to allow expansion
            // This prevents text from wrapping to new lines when font size increases
            updatedElement.width = Math.max(200, updatedElement.width || 200)
            updatedElement.wrap = 'none'
          }
        
        return updatedElement
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

  // Template state for dynamic loading
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)

  // Load templates based on product type
  const loadTemplates = useCallback(async (productType) => {
    setTemplatesLoading(true)
    try {
      const { getTemplatesByProductType } = await import('./templates/index.js')
      const templateArray = await getTemplatesByProductType(productType)
      setTemplates(templateArray)
    } catch (error) {
      console.error('Error loading templates:', error)
      setTemplates([])
    } finally {
      setTemplatesLoading(false)
    }
  }, [])

  // Load templates when product type changes
  useEffect(() => {
    if (productType) {
      loadTemplates(productType)
    }
  }, [productType, loadTemplates])

  // Legacy templates removed - now using modular template system

  // Ensure element has all required properties for proper rendering and transformation
  const ensureElementProperties = useCallback((element) => {
    const defaults = {
      id: element.id,
      type: element.type,
      x: element.x || 0,
      y: element.y || 0,
      rotation: element.rotation || 0,
      fill: element.fill || '#000000',
      stroke: element.stroke || null,
      strokeWidth: element.strokeWidth || 0,
      opacity: element.opacity || 1,
      scaleX: element.scaleX || 1,
      scaleY: element.scaleY || 1
    }
    
    // Apply defaults for missing properties
    Object.keys(defaults).forEach(key => {
      if (element[key] === undefined || element[key] === null) {
        element[key] = defaults[key]
      }
    })
    
    // Type-specific defaults
    switch (element.type) {
      case 'text':
        if (!element.text) element.text = 'Text'
        if (!element.fontSize) element.fontSize = 24
        if (!element.fontFamily) element.fontFamily = 'Arial'
        // Set width based on text content - auto for single line, fixed for multi-line
        if (!element.width || element.width === 'auto') {
          element.width = element.text && element.text.includes('\n') ? 200 : 'auto'
        }
        // Preserve 'auto' height for dynamic text sizing, only set default if missing
        if (!element.height) element.height = 'auto'
        if (element.stroke === undefined) element.stroke = null
        if (element.strokeWidth === undefined) element.strokeWidth = 0
        if (!element.wrap) element.wrap = element.text && element.text.includes('\n') ? 'word' : 'none'
        if (!element.lineHeight) element.lineHeight = 1.2
        if (!element.fontStyle) element.fontStyle = 'normal'
        if (!element.align) element.align = 'left'
        if (!element.verticalAlign) element.verticalAlign = 'top'
        if (!element.padding) element.padding = 0
        if (!element.textDecoration) element.textDecoration = 'none'
        if (!element.letterSpacing) element.letterSpacing = 0
        if (element.rotation === undefined) element.rotation = 0
        if (element.fill === undefined) element.fill = '#000000'
        break
      case 'rect':
        if (!element.width) element.width = 100
        if (!element.height) element.height = 100
        break
      case 'circle':
        if (!element.radius) element.radius = 50
        break
      case 'star':
        if (!element.numPoints) element.numPoints = 5
        if (!element.innerRadius) element.innerRadius = 30
        if (!element.outerRadius) element.outerRadius = 50
        if (!element.width) element.width = 100
        if (!element.height) element.height = 100
        break
      case 'triangle':
      case 'hexagon':
      case 'octagon':
        if (!element.radius) element.radius = 50
        if (!element.width) element.width = 100
        if (!element.height) element.height = 100
        break
      case 'line':
        if (!element.points) element.points = [0, 0, 100, 100]
        break
      case 'image':
        if (!element.width) element.width = 100
        if (!element.height) element.height = 100
        break
    }
    
    return element
  }, [])

  // Scale template elements to fit current canvas size
  const scaleTemplateElements = useCallback((templateElements, targetWidth, targetHeight, originalCanvasSize = null) => {
    // Determine original template dimensions
    let originalWidth, originalHeight
    
    if (originalCanvasSize) {
      // Use provided original dimensions
      originalWidth = originalCanvasSize.width
      originalHeight = originalCanvasSize.height
    } else {
      // Try to detect original dimensions from template elements
      // Find the maximum x+width and y+height to estimate original canvas size
      let maxX = 0, maxY = 0
      templateElements.forEach(element => {
        if (element.x !== undefined && element.width !== undefined) {
          maxX = Math.max(maxX, element.x + element.width)
        }
        if (element.y !== undefined && element.height !== undefined) {
          maxY = Math.max(maxY, element.y + element.height)
        }
      })
      
      // Use detected dimensions if reasonable, otherwise fallback to banner defaults
      if (maxX > 0 && maxY > 0) {
        originalWidth = Math.max(maxX, 800) // Ensure minimum width
        originalHeight = Math.max(maxY, 400) // Ensure minimum height
        console.log('🎨 Detected template dimensions:', originalWidth, 'x', originalHeight)
      } else {
        // Fallback to banner dimensions for legacy templates
        originalWidth = 800
        originalHeight = 400
        console.log('🎨 Using fallback banner dimensions for template scaling')
      }
    }
    
    // Calculate scaling factors
    const scaleX = targetWidth / originalWidth
    const scaleY = targetHeight / originalHeight
    
    console.log('🎨 Scaling template from', originalWidth, 'x', originalHeight, 'to', targetWidth, 'x', targetHeight)
    console.log('🎨 Scale factors: X =', scaleX.toFixed(3), ', Y =', scaleY.toFixed(3))
    
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
    console.log('🎨 Loading template:', template)
    console.log('🎨 Current product type:', productType)
    console.log('🎨 Current surface:', currentSurface)
    
    // Set the current template ID for visual indication
    setCurrentTemplateId(template.id)
    
    // Check if it's a marketplace template
    if (template.marketplaceTemplate) {
      console.log('🎨 Loading marketplace template:', template.name)
      console.log('🎨 Marketplace template will preserve current product type:', productType)
      
      // Track marketplace template for pricing
      const marketplaceTemplate = {
        id: template.id,
        name: template.name,
        price: template.price,
        creator: template.creator,
        category: template.category
      }
      
      // Add to marketplace templates if not already added
      setMarketplaceTemplates(prev => {
        const exists = prev.find(t => t.id === template.id)
        if (!exists) {
          return [...prev, marketplaceTemplate]
        }
        return prev
      })
      
      // Handle marketplace template
      if (template.templateData) {
        try {
          // Parse template data if it's a string
          const templateData = typeof template.templateData === 'string' 
            ? JSON.parse(template.templateData) 
            : template.templateData
          
          console.log('🎨 Parsed template data:', templateData)
          
          // Clear existing elements
          setElements([])
          
          // For marketplace templates, create a background image element
          if (templateData.template_type === 'image' && templateData.template_file) {
            console.log('🎨 Creating image element from template file:', templateData.template_file)
            
            // Create image element that will be loaded asynchronously
            const imageElement = {
              id: 'template_image_placeholder',
              type: 'image',
              x: 0,
              y: 0,
              width: canvasSize.width,
              height: canvasSize.height,
              src: templateData.template_file,
              alt: template.name,
              scaleX: 1,
              scaleY: 1,
              rotation: 0,
              opacity: 1,
              zIndex: 0
            }
            
            // Preload the image to ensure it loads properly
            const img = new window.Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              console.log('🎨 Marketplace template image loaded successfully')
              console.log('🎨 Product type after loading:', productType) // Should be unchanged
              
              // Update the image element with the loaded image object
              const loadedImageElement = {
                ...imageElement,
                image: img, // Konva needs the HTML Image object, not just src
                imagePath: templateData.template_file // Keep the path for reference
              }
              
              setElements([loadedImageElement])
              setSelectedId(null)
            }
            img.onerror = (error) => {
              console.error('🎨 Failed to load marketplace template image:', error)
              console.error('🎨 Image src:', templateData.template_file)
              alert(`Failed to load template image. Please check if the image exists at: ${templateData.template_file}`)
            }
            img.src = templateData.template_file
            
            console.log(`🎨 Loading marketplace template as background image: ${template.name}`)
          } else {
            // If it has elements array, use that
            if (templateData.elements && Array.isArray(templateData.elements)) {
              const scaledElements = scaleTemplateElements(
                templateData.elements, 
                canvasSize.width, 
                canvasSize.height,
                templateData.canvasSize || null // Pass original canvas size if available
              ).map(element => {
                // Generate new ID for each element to avoid conflicts
                const elementWithId = {
                  ...element,
                  id: generateId(element.type)
                }
                // Ensure all required properties are present for proper rendering and transformation
                return ensureElementProperties(elementWithId)
              })
              
              setElements(scaledElements)
              setSelectedId(null)
              
              console.log(`🎨 Loaded marketplace template with elements: ${template.name}`)
            } else {
              console.error('🎨 Unsupported marketplace template format:', templateData)
              alert('Marketplace template format not supported. Please try a different template.')
            }
          }
        } catch (error) {
          console.error('🎨 Error parsing marketplace template data:', error)
          console.error('🎨 Template data:', template.templateData)
          alert('Error loading marketplace template. Please try again.')
        }
      } else {
        console.error('🎨 No template data available for marketplace template:', template)
        alert('Marketplace template data not available. Please try again.')
      }
    } else {
      // Handle tent template with surfaces
      if (productType === 'tent' && template.surfaces) {
        console.log('🎨 Loading tent template:', template.name)
        console.log('🎨 Tent template surfaces:', Object.keys(template.surfaces))
        
        // Update tent specs based on template surfaces
        const templateSurfaceKeys = Object.keys(template.surfaces)
        const hasSidewalls = templateSurfaceKeys.includes('sidewall_left') || templateSurfaceKeys.includes('sidewall_right')
        const hasBackwall = templateSurfaceKeys.includes('backwall')
        
        // Update tent specs to match template surfaces
        const updatedTentSpecs = {
          tentSize: '10x10',
          surfaces: {
            canopy: true, // Always true for canopy surfaces
            sidewalls: hasSidewalls,
            backwall: hasBackwall
          },
          withFrame: true,
          reinforcedStripColor: 'white'
        }
        
        console.log('🎨 Updating tent specs for template:', updatedTentSpecs)
        setTentSpecs(updatedTentSpecs)
        
        // Clear existing surface elements
        setSurfaceElements({
          front: [],
          back: [],
          inside: [],
          lid: [],
          canopy_front: [],
          canopy_back: [],
          canopy_left: [],
          canopy_right: [],
          sidewall_left: [],
          sidewall_right: [],
          backwall: []
        })
        
        // Load elements for each surface
        const newSurfaceElements = {}
        Object.keys(template.surfaces).forEach(surfaceKey => {
          const surfaceData = template.surfaces[surfaceKey]
          if (surfaceData && surfaceData.elements) {
            // Scale elements for the current surface
            const scaledElements = scaleTemplateElements(
              surfaceData.elements,
              canvasSize.width,
              canvasSize.height,
              canvasSize // Use current canvas size for tent surfaces
            ).map(element => {
              // Generate new ID for each element to avoid conflicts
              const elementWithId = {
                ...element,
                id: generateId(element.type)
              }
              // Ensure all required properties are present
              return ensureElementProperties(elementWithId)
            })
            
            newSurfaceElements[surfaceKey] = scaledElements
            console.log(`🎨 Loaded ${scaledElements.length} elements for surface: ${surfaceKey}`)
          }
        })
        
        setSurfaceElements(newSurfaceElements)
        setSelectedId(null)
        console.log(`🎨 Loaded tent template: ${template.name}`)
        return
      }
      
      // Handle regular banner template
      console.log('🎨 Loading regular template:', template.name)
    const selectedTemplate = templates.find(t => t.id === template.id)
    
    if (selectedTemplate) {
      // Clear existing elements
      setElements([])
      
      // Scale template elements to fit current canvas size
      const scaledElements = scaleTemplateElements(
        selectedTemplate.elements, 
        canvasSize.width, 
          canvasSize.height,
          selectedTemplate.canvasSize || { width: 800, height: 400 } // Banner templates use 800x400
      ).map(element => {
        // Generate new ID for each element to avoid conflicts
        const elementWithId = {
          ...element,
          id: generateId(element.type)
        }
        // Ensure all required properties are present for proper rendering and transformation
        return ensureElementProperties(elementWithId)
      })
      
      // Check if any elements have src properties that need preloading
      const imageElements = scaledElements.filter(element => element.type === 'image' && element.src)
      console.log('🎨 Template elements after scaling:', scaledElements.length)
      console.log('🎨 Image elements found:', imageElements.length)
      console.log('🎨 Image elements:', imageElements)
      
      if (imageElements.length > 0) {
        console.log('🎨 Preloading', imageElements.length, 'image elements for template:', template.name)
        
        // Preload all images before setting elements
        const preloadPromises = imageElements.map(element => {
          return new Promise((resolve, reject) => {
            const img = new window.Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
              console.log('🎨 Successfully loaded image:', element.src)
              resolve({
                ...element,
                image: img, // Konva needs the HTML Image object
                imagePath: element.src // Keep the path for reference
              })
            }
            img.onerror = (error) => {
              console.error('🎨 Failed to load template image:', element.src, error)
              // Don't reject, just return the element without the image
              resolve(element)
            }
            img.src = element.src
          })
        })
        
        // Wait for all images to load, then set elements
        Promise.all(preloadPromises).then(loadedElements => {
          // Replace the original image elements with loaded ones
          const finalElements = scaledElements.map(element => {
            if (element.type === 'image' && element.src) {
              const loadedElement = loadedElements.find(loaded => loaded.id === element.id)
              return loadedElement || element
            }
            return element
          })
          
          setElements(finalElements)
          setSelectedId(null)
          console.log(`🎨 Loaded regular template with preloaded images: ${template.name}`)
        }).catch(error => {
          console.error('🎨 Error preloading template images:', error)
          // Fallback to setting elements without preloading
          setElements(scaledElements)
          setSelectedId(null)
        })
      } else {
        // No images to preload, set elements directly
        setElements(scaledElements)
        setSelectedId(null)
        console.log(`🎨 Loaded regular template: ${template.name}`)
      }
    } else {
        console.error('🎨 Template not found in templates:', template.id)
      alert('Template not found. Please try again.')
    }
    }
  }, [templates, scaleTemplateElements, ensureElementProperties, canvasSize.width, canvasSize.height, productType, currentSurface])

  // Remove asset from tracking when deleted
  const removeAssetFromTracking = useCallback((assetName) => {
    setActiveDesignAssets(prev => {
      const newSet = new Set(prev)
      newSet.delete(assetName)
      return newSet
    })
  }, [])

  // Remove asset from canvas when toggled off
  const removeAssetFromCanvas = useCallback((assetName) => {
    console.log('🎨 Removing asset from canvas:', assetName)
    
    // Find the element to remove first
    const elementToRemove = elements.find(el => el.type === 'image' && el.assetName === assetName)
    console.log('🎨 Element to remove:', elementToRemove)
    console.log('🎨 Current selectedId:', selectedId)
    
    // Clear selection immediately if the selected element is being removed
    if (elementToRemove && selectedId === elementToRemove.id) {
      console.log('🎨 Clearing selection for removed element')
      setSelectedId(null)
      
      // Clear transformer handles immediately
      if (stageRef.current && stageRef.current.clearTransformer) {
        console.log('🎨 Calling clearTransformer')
        stageRef.current.clearTransformer()
      } else {
        console.log('🎨 clearTransformer not available')
      }
    }
    
    // Find and remove the asset element from the canvas
    setElements(prev => {
      const newElements = prev.filter(el => !(el.type === 'image' && el.assetName === assetName))
      return newElements
    })
    
    // Remove from tracking
    setActiveDesignAssets(prev => {
      const newSet = new Set(prev)
      newSet.delete(assetName)
      return newSet
    })
  }, [elements, selectedId])

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
      
      // Track this design asset as active
      setActiveDesignAssets(prev => new Set([...prev, assetName]))
      
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
            id: 'template_image_placeholder',
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
      // Generate thumbnail using marketplace-style service (stores as file, not base64 in DB)
      let thumbnailUrl = null
      try {
        // Wait a bit to ensure stage is fully rendered
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Use the existing generateCanvasImage function which has proper fallbacks
        console.log('🎨 Generating thumbnail using existing generateCanvasImage function...')
        const fullQualityImage = generateCanvasImage()
        
        if (fullQualityImage) {
          console.log(`🎨 Generated template image successfully, length: ${fullQualityImage.length}`)
          
          // Send to backend thumbnail service (similar to marketplace approach)
          console.log('🎨 Sending thumbnail request to backend...')
          const thumbnailResponse = await authService.authenticatedRequest('/api/templates/generate-thumbnail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageData: fullQualityImage,
              templateName: name
            })
          })
          
          console.log('🎨 Thumbnail response status:', thumbnailResponse.status)
          
          if (thumbnailResponse.ok) {
            const thumbnailResult = await thumbnailResponse.json()
            thumbnailUrl = thumbnailResult.thumbnail_url
            console.log(`✅ Generated template thumbnail: ${thumbnailUrl}`)
          } else {
            const errorText = await thumbnailResponse.text()
            console.error('❌ Thumbnail service failed:', thumbnailResponse.status, errorText)
            console.warn('⚠️ Thumbnail service failed, template will be saved without thumbnail')
          }
        } else {
          console.warn('⚠️ Failed to generate canvas image - generateCanvasImage returned null')
        }
      } catch (error) {
        console.warn('Failed to generate thumbnail via service:', error)
      }

      const templateData = {
        name: name,
        description: description || `Template created on ${new Date().toLocaleDateString()}`,
        category: 'Custom',
        canvas_data: {
          elements,
          canvasSize,
          backgroundColor,
          bannerSpecs,
          productType, // Save current product type
          currentSurface, // Save current surface
          surface_elements: (productType === 'tin' || productType === 'tent') ? surfaceElements : undefined, // Save multi-surface elements
          // Save design options for proper restoration
          tent_design_option: tentDesignOption,
          tin_surface_coverage: tinSpecs?.surfaceCoverage,
          timestamp: new Date().toISOString()
        },
        banner_type: bannerSpecs?.id || 'vinyl-13oz',
        is_public: false,
        thumbnail_url: thumbnailUrl // Include thumbnail URL (not base64 data)
      }
      
      console.log('Sending template data with thumbnail URL:', {
        ...templateData,
        thumbnail_url: thumbnailUrl || 'NO THUMBNAIL'
      })
      
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
      console.log('Template saved with thumbnail URL:', result.thumbnail_url || 'NO THUMBNAIL URL')
      
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
  }, [elements, canvasSize, backgroundColor, bannerSpecs, productType, currentSurface, surfaceElements])

  // Create order
  const createOrder = useCallback(async () => {

    // MULTI-SURFACE QUALITY CONTROL: Capture ALL surfaces for print preview
    // This is our "forced stop and check moment" - users MUST see all surfaces
    const captureAllSurfaceImages = async () => {
      if (productType === 'tin' || productType === 'tent') {
        console.log('🛡️ QUALITY CONTROL: Capturing ALL surfaces for mandatory review')
        const allCapturedImages = { ...surfaceImages } // Start with auto-captured images
        
        // Get all available surfaces based on product configuration
        const allSurfaces = productType === 'tin' 
          ? ['front', 'back', 'inside', 'lid']
          : ['canopy_front', 'canopy_back', 'canopy_left', 'canopy_right', 'sidewall_left', 'sidewall_right', 'backwall']
        
        // Store current surface to restore later (minimize UI disruption)
        const originalSurface = currentSurface
        console.log('🛡️ QUALITY CONTROL: Original surface:', originalSurface)
        
        try {
          // Capture EVERY surface that has elements (critical for templates/reprints)
          for (const surface of allSurfaces) {
            const surfaceElementsForCapture = surfaceElements[surface] || []
            
            // Skip truly empty surfaces
            if (surfaceElementsForCapture.length === 0) {
              console.log(`🛡️ QUALITY CONTROL: Surface ${surface} is empty - skipping`)
              continue
            }
            
            // Use auto-captured image if available (better performance)
            if (allCapturedImages[surface]) {
              console.log(`🛡️ QUALITY CONTROL: Using auto-captured image for ${surface}`)
              continue
            }
            
            // CRITICAL: Capture surfaces that have elements but weren't auto-captured
            // This happens with templates/reprints where user didn't manually switch
            console.log(`🛡️ QUALITY CONTROL: Force-capturing ${surface} (${surfaceElementsForCapture.length} elements) - user may not have visited this surface`)
            
            // Temporarily switch to surface for accurate capture
            setCurrentSurface(surface)
            
            // Wait for Konva stage to update with new surface elements
            await new Promise(resolve => setTimeout(resolve, 400)) // Slightly longer for reliability
            
            // Capture using Konva (same method as auto-capture)
            const surfaceImage = generateCanvasImage()
            if (surfaceImage) {
              allCapturedImages[surface] = surfaceImage
              console.log(`🛡️ QUALITY CONTROL: ✅ Captured ${surface} for mandatory review`)
            } else {
              console.warn(`🛡️ QUALITY CONTROL: ⚠️ Failed to capture ${surface} - will show placeholder`)
            }
          }
          
          // Restore original surface (minimize UI disruption)
          setCurrentSurface(originalSurface)
          console.log('🛡️ QUALITY CONTROL: Restored original surface:', originalSurface)
          
          // Wait for UI to stabilize
          await new Promise(resolve => setTimeout(resolve, 200))
          
          console.log('🛡️ QUALITY CONTROL: All surfaces captured for mandatory review:', Object.keys(allCapturedImages))
          return allCapturedImages
          
        } catch (error) {
          console.error('🛡️ QUALITY CONTROL: Error during surface capture:', error)
          
          // Restore original surface on error
          setCurrentSurface(originalSurface)
          
          // Fallback: ensure user can still see SOMETHING for each surface
          const fallbackImage = generateCanvasImage()
          allSurfaces.forEach(surface => {
            if (!allCapturedImages[surface] && (surfaceElements[surface] || []).length > 0) {
              allCapturedImages[surface] = fallbackImage
              console.log(`🛡️ QUALITY CONTROL: Using fallback image for ${surface}`)
            }
          })
          
          return allCapturedImages
        }
      }
      
      return { front: generateCanvasImage() }
    }

    // CAPTURE FINAL SURFACE IMAGE before checkout
    if ((productType === 'tin' || productType === 'tent') && elements.length > 0) {
      try {
        const finalSurfaceImage = generateCanvasImage()
        if (finalSurfaceImage) {
          setSurfaceImages(prev => ({
            ...prev,
            [currentSurface]: finalSurfaceImage
          }))
          console.log(`🎨 FINAL-CAPTURED: Surface image for ${currentSurface} before checkout`)
        }
      } catch (error) {
        console.warn('🎨 Failed to capture final surface image:', error)
      }
    }

    // Helper to compress data URL for storage-friendly previews
    const compressDataUrl = (dataUrl, { maxWidth = 1200, maxHeight = 1200, quality = 0.7 } = {}) => {
      return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => {
          const scale = Math.min(maxWidth / img.width, maxHeight / img.height, 1)
          const targetWidth = Math.max(1, Math.floor(img.width * scale))
          const targetHeight = Math.max(1, Math.floor(img.height * scale))
          const canvas = document.createElement('canvas')
          canvas.width = targetWidth
          canvas.height = targetHeight
          const ctx = canvas.getContext('2d')
          // Ensure transparent areas render over white instead of black when saving JPEG
          ctx.clearRect(0, 0, targetWidth, targetHeight)
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, targetWidth, targetHeight)
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
          try {
            const out = canvas.toDataURL('image/jpeg', quality)
            resolve(out)
          } catch (e) {
            resolve(dataUrl)
          }
        }
        img.onerror = () => resolve(dataUrl)
        img.src = dataUrl
      })
    }

    // Capture all surfaces (if applicable) and prepare compressed copies for storage
    let capturedAllSurfaceImages = undefined
    let compressedSurfaceImages = undefined
    try {
      capturedAllSurfaceImages = await captureAllSurfaceImages()
      const entries = Object.entries(capturedAllSurfaceImages)
      const compressedEntries = []
      for (const [key, url] of entries) {
        if (!url) continue
        // Compress to storage-friendly size/quality
        // JPEG is fine for preview; production PDF uses fresh export when downloading
        // Use slightly higher quality for tins (small art) and tents (details)
        const q = productType === 'tin' ? 0.8 : productType === 'tent' ? 0.75 : 0.7
        const compressed = await compressDataUrl(url, { maxWidth: 1400, maxHeight: 1400, quality: q })
        compressedEntries.push([key, compressed])
      }
      compressedSurfaceImages = Object.fromEntries(compressedEntries)
    } catch (e) {
      console.warn('Surface image capture/compress failed; previews may be limited:', e)
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
        timestamp: new Date().toISOString(),
        konvaStageImage: generateCanvasImage(), // Include Konva export for current surface (generateCanvasImage handles stageRef internally)
        surface_images: surfaceImages // Include auto-captured surface images for preview modal
      },
      canvas_image: generateCanvasImage(),
      surface_images: capturedAllSurfaceImages || await captureAllSurfaceImages(), // QUALITY CONTROL: Ensure ALL surfaces are captured
      surface_elements: surfaceElements, // Include surface elements for restoration
      
      // Marketplace templates used in the design
      marketplace_templates: marketplaceTemplates,
      
      // Order metadata (required by backend)
      product_type: productType === 'tin' ? 'business_card_tin' : productType === 'tent' ? 'tradeshow_tent' : 'banner',
      quantity: 1,
              dimensions: {
          width: 2, // Default 2ft width
          height: 4, // Default 4ft height
          orientation: canvasOrientation
        },
      banner_type: bannerSpecs?.id || (productType === 'banner' ? 'vinyl-13oz' : null),
      banner_material: bannerSpecs?.material || (productType === 'banner' ? '13oz Vinyl' : null),
      banner_finish: bannerSpecs?.finish || (productType === 'banner' ? 'Matte' : null),
      banner_size: `${canvasSize.width}x${canvasSize.height}px (${canvasOrientation})`,
      banner_category: bannerSpecs?.category || (productType === 'banner' ? 'Vinyl Banners' : null),
      background_color: backgroundColor,
      print_options: {}, // Will be populated by checkout component
      
      // Specification data - drives downstream components
      design_option: productType === 'tent' ? tentDesignOption : 
                     productType === 'tin' ? (tinSpecs?.surfaceCoverage || 'front-back') : 'single-surface',
      tent_design_option: tentDesignOption,
      tent_specs: tentSpecs,
      tin_surface_coverage: tinSpecs?.surfaceCoverage || 'front-back'
    }
    
    console.log('Creating order with elements count:', elements.length)
    console.log('Canvas size:', canvasSize)
    console.log('Banner specs:', bannerSpecs)
    console.log('🎨 Order data specs - tentDesignOption:', tentDesignOption)
    console.log('🎨 Order data specs - tentSpecs:', tentSpecs)
    console.log('🎨 Order data specs - tinSpecs.surfaceCoverage:', tinSpecs?.surfaceCoverage)
    console.log('🎨 Order data specs - design_option:', productType === 'tent' ? tentDesignOption : productType === 'tin' ? (tinSpecs?.surfaceCoverage || 'front-back') : 'single-surface')
    console.log('🎨 Order data being created:', orderData)
    console.log('🎨 About to save orderDataForStorage with tent_specs:', tentSpecs)
    console.log('🎨 DEBUG: productType:', productType, 'tentSpecs is null?', tentSpecs === null)
    console.log('🎨 DEBUG: tentSpecsRef.current:', tentSpecsRef.current)
    
    // For tent products, ensure tent specs are properly set
    let finalTentSpecs = tentSpecs || tentSpecsRef.current
    if (productType === 'tent' && !finalTentSpecs) {
      console.error('🚨 Tent specs are null in both state and ref! Initializing default tent specifications.')
      
      // Initialize default tent specs if they're missing
      const defaultTentSpecs = {
        tentSize: '10x10',
        surfaces: {
          canopy: true,
          sidewalls: false,
          backwall: false
        },
        withFrame: true,
        reinforcedStripColor: 'white'
      }
      
      setTentSpecs(defaultTentSpecs)
      finalTentSpecs = defaultTentSpecs // Use immediately for order data
      console.log('🎨 Initialized default tent specs:', defaultTentSpecs)
      
      toast.success('Tent specifications initialized with defaults.')
    } else if (productType === 'tent' && tentSpecs !== finalTentSpecs) {
      console.log('🎨 Using tent specs from ref instead of state:', finalTentSpecs)
    }
    
    // Store in sessionStorage for checkout (temporary). Keep it lightweight to avoid quota errors.
    // Sanitize marketplace templates to avoid large payloads in storage
    const sanitizedMarketplaceTemplates = (orderData.marketplace_templates || []).map(t => ({
      id: t.id,
      name: t.name || t.title || null,
      title: t.title || t.name || null,
      price: typeof t.price === 'number' ? t.price : Number(t.price) || 0,
      thumbnail: t.thumbnail || t.previewUrl || t.image || t.thumbnail_url || null
    }))

    const orderDataForStorage = {
      // Core order info
      product_type: orderData.product_type,
      quantity: orderData.quantity,
      dimensions: orderData.dimensions,
      banner_type: orderData.banner_type,
      banner_material: orderData.banner_material,
      banner_finish: orderData.banner_finish,
      banner_size: orderData.banner_size,
      banner_category: orderData.banner_category,
      background_color: orderData.background_color,
      design_option: orderData.design_option,
      tent_design_option: orderData.tent_design_option,
      tin_surface_coverage: orderData.tin_surface_coverage,
      current_surface: currentSurface,
      marketplace_templates: sanitizedMarketplaceTemplates,

      // Specs
      tent_specs: finalTentSpecs,

      // Sanitize surface elements (remove image objects)
      surface_elements: Object.keys(surfaceElements).reduce((acc, surfaceKey) => {
        acc[surfaceKey] = (surfaceElements[surfaceKey] || []).map(element => {
          if (element.type === 'image') {
            return {
              ...element,
              image: null,
              imageDataUrl: element.imageDataUrl || (element.image?.src || null)
            }
          }
          return element
        })
        return acc
      }, {}),

      // Include compressed surface images for previews in checkout (omit for banners to save space)
      surface_images: productType === 'banner' ? undefined : compressedSurfaceImages,

      // Minimal canvas data: keep konva stage image and essentials; exclude large surface_images
      canvas_data: {
        canvasSize: orderData.canvas_data?.canvasSize,
        backgroundColor: orderData.canvas_data?.backgroundColor,
        konvaStageImage: orderData.canvas_data?.konvaStageImage,
        elements: orderData.canvas_data?.elements.map(element => {
          if (element.type === 'image') {
            return {
              ...element,
              image: null,
              imageDataUrl: element.imageDataUrl || (element.image?.src || null)
            }
          }
          return element
        })
      }
    }
    
    console.log('🎨 Final orderDataForStorage being saved:', orderDataForStorage)
    console.log('🎨 tent_specs in orderDataForStorage:', orderDataForStorage.tent_specs)
    console.log('🎨 Current tentSpecs state when saving:', tentSpecs)
    console.log('🎨 finalTentSpecs used in order:', finalTentSpecs)
    console.log('🎨 Current tentDesignOption when saving:', tentDesignOption)
    // Attempt write; if it fails, further reduce payload and retry
    try {
      sessionStorage.setItem('orderData', JSON.stringify(orderDataForStorage))
    } catch (e) {
      console.warn('sessionStorage quota exceeded, reducing payload...', e)
      // Drop optional fields to fit quota
      orderDataForStorage.surface_elements = undefined
      if (orderDataForStorage.canvas_data?.elements) {
        orderDataForStorage.canvas_data.elements = []
      }
      try {
        sessionStorage.setItem('orderData', JSON.stringify(orderDataForStorage))
      } catch (err) {
        console.error('Still over quota after reduction; storing minimal payload.', err)
        const minimalPayload = {
          product_type: orderDataForStorage.product_type,
          quantity: orderDataForStorage.quantity,
          dimensions: orderDataForStorage.dimensions,
          current_surface: orderDataForStorage.current_surface,
          marketplace_templates: orderDataForStorage.marketplace_templates,
          canvas_data: {
            canvasSize: orderDataForStorage.canvas_data?.canvasSize,
            backgroundColor: orderDataForStorage.canvas_data?.backgroundColor,
            konvaStageImage: orderDataForStorage.canvas_data?.konvaStageImage
          }
        }
        sessionStorage.setItem('orderData', JSON.stringify(minimalPayload))
      }
    }
    
    // Route to appropriate checkout based on product type
    if (orderData.product_type === 'business_card_tin') {
      navigate('/tin-checkout')
    } else if (orderData.product_type === 'tradeshow_tent') {
      navigate('/tent-checkout') // Future implementation
    } else {
    navigate('/checkout')
    }
  }, [elements, canvasSize, backgroundColor, bannerSpecs, navigate, productType, marketplaceTemplates, generateCanvasImage, surfaceImages, currentSurface, surfaceElements, tentDesignOption, tentSpecs, tinSpecs, canvasOrientation])

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
                        image: img,
                        imageDataUrl: qrDataUrl // Preserve the data URL for serialization and print preview
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
                  img.onload = () => {
                    console.log('🎨 Successfully loaded image:', imageSrc)
                    resolve()
                  }
                  img.onerror = (error) => {
                    console.error('Failed to load image:', imageSrc, error)
                    reject(error)
                  }
                  img.src = imageSrc
                })
                
                // Verify the image is valid before using it
                if (img.naturalWidth > 0 && img.naturalHeight > 0) {
                // Create the restored element
                const restoredElement = {
                  ...element,
                  image: img
                }
                restoredElements.push(restoredElement)
                  console.log('🎨 Successfully restored image element:', element.assetName || 'uploaded image')
                } else {
                  console.warn('Image loaded but has invalid dimensions:', imageSrc)
                }
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
          
          // Restore product type and surface from saved template data
          if (canvasData.productType) {
            console.log('🎨 Restoring product type from template:', canvasData.productType)
            setProductType(canvasData.productType)
          } else {
            console.log('🎨 No productType in template data, attempting to detect from bannerSpecs:', canvasData.bannerSpecs)
            // Fallback: try to detect product type from bannerSpecs
            if (canvasData.bannerSpecs) {
              const bannerId = canvasData.bannerSpecs.id || canvasData.bannerSpecs
              if (bannerId && typeof bannerId === 'string') {
                if (bannerId.includes('tin') || bannerId.includes('business_card')) {
                  console.log('🎨 Detected tin product type from bannerSpecs')
                  setProductType('tin')
                } else if (bannerId.includes('tent') || bannerId.includes('tradeshow')) {
                  console.log('🎨 Detected tent product type from bannerSpecs')
                  setProductType('tent')
                } else {
                  console.log('🎨 Defaulting to banner product type')
                  setProductType('banner')
                }
              }
            }
          }
          
          if (canvasData.currentSurface) {
            console.log('🎨 Restoring current surface from template:', canvasData.currentSurface)
            setCurrentSurface(canvasData.currentSurface)
          } else {
            console.log('🎨 No currentSurface in template data, using default based on product type')
            // Set default surface based on product type
            const detectedProductType = canvasData.productType || 'banner'
            if (detectedProductType === 'tin') {
              setCurrentSurface('front')
            } else if (detectedProductType === 'tent') {
              setCurrentSurface('canopy_front')
            } else {
              setCurrentSurface('front')
            }
          }
          
          // For multi-surface products, restore surface_elements if available
          if (canvasData.surface_elements && (canvasData.productType === 'tin' || canvasData.productType === 'tent')) {
            console.log('🎨 Restoring multi-surface elements from template:', canvasData.surface_elements)
            setSurfaceElements(canvasData.surface_elements)
          } else {
          // For single-surface products or fallback, restore image elements properly
          const elementsToRestore = canvasData.elements || []
          
          // Check if we need to scale elements (template loaded on different product type)
          if (canvasData.canvasSize && 
              (canvasData.canvasSize.width !== canvasSize.width || canvasData.canvasSize.height !== canvasSize.height)) {
            console.log('🎨 Template canvas size differs from current canvas, scaling elements')
            console.log('🎨 Template canvas:', canvasData.canvasSize, '-> Current canvas:', canvasSize)
            
            // Scale elements to fit current canvas
            const scaledElements = scaleTemplateElements(
              elementsToRestore,
              canvasSize.width,
              canvasSize.height,
              canvasData.canvasSize
            )
            
            restoreImageElements(scaledElements).then(restoredElements => {
              setElements(restoredElements)
            }).catch(error => {
              console.error('Failed to restore scaled image elements:', error)
              setElements(scaledElements)
            })
          } else {
            // No scaling needed, restore elements as-is
            restoreImageElements(elementsToRestore).then(restoredElements => {
              setElements(restoredElements)
          }).catch(error => {
            console.error('Failed to restore image elements:', error)
              setElements(elementsToRestore)
            })
          }
          }
          
          // Restore design options from template
          if (canvasData.tent_design_option) {
            console.log('🎨 Restoring tent design option from template:', canvasData.tent_design_option)
            setTentDesignOption(canvasData.tent_design_option)
          }
          if (canvasData.tin_surface_coverage) {
            console.log('🎨 Restoring tin surface coverage from template:', canvasData.tin_surface_coverage)
            setTinSpecs(prev => ({
              ...prev,
              surfaceCoverage: canvasData.tin_surface_coverage
            }))
          }
          
          // Restore other template properties
            setBackgroundColor(canvasData.backgroundColor || '#ffffff')
            if (canvasData.bannerSpecs) {
              setBannerSpecs(canvasData.bannerSpecs)
            }
            if (canvasData.canvasSize) {
              setCanvasSize(canvasData.canvasSize)
              setCanvasOrientation(canvasData.canvasSize.width > canvasData.canvasSize.height ? 'landscape' : 'portrait')
            }
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
          // For multi-surface products, restore surface_elements if available
          if (orderData.surface_elements && (productType === 'tin' || productType === 'tent')) {
            console.log('🎨 Restoring multi-surface elements from surface_elements')
            
            // Restore image elements properly for each surface
            const restoredSurfaceElements = {}
            const surfaceKeys = Object.keys(orderData.surface_elements)
            
            // Process each surface's elements
            const restorePromises = surfaceKeys.map(async (surfaceKey) => {
              const elements = orderData.surface_elements[surfaceKey] || []
              try {
                const restoredElements = await restoreImageElements(elements)
                restoredSurfaceElements[surfaceKey] = restoredElements
                console.log(`🎨 Restored ${restoredElements.length} elements for surface: ${surfaceKey}`)
              } catch (error) {
                console.error(`Failed to restore elements for surface ${surfaceKey}:`, error)
                restoredSurfaceElements[surfaceKey] = elements // Fallback to original elements
              }
            })
            
            // Wait for all surfaces to be restored
            Promise.all(restorePromises).then(() => {
              // Ensure all surfaces are properly initialized with empty arrays
              const completeSurfaceElements = {
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
                backwall: [],
                // Override with restored elements
                ...restoredSurfaceElements
              }
              setSurfaceElements(completeSurfaceElements)
            }).catch(error => {
              console.error('Failed to restore surface elements:', error)
              // Fallback: ensure all surfaces are empty
              setSurfaceElements({
                front: [],
                back: [],
                inside: [],
                lid: [],
                canopy_front: [],
                canopy_back: [],
                canopy_left: [],
                canopy_right: [],
                sidewall_left: [],
                sidewall_right: [],
                backwall: []
              })
            })
          } else if ((productType === 'tin' || productType === 'tent')) {
            console.log('🎨 Fallback: Restoring from canvas_data.elements (no surface_elements)')
            
            // Fallback: restore from canvas_data.elements and put on current surface
            restoreImageElements(orderData.canvas_data.elements || []).then(restoredElements => {
              const currentSurface = productType === 'tin' ? 'front' : 'canopy_front'
              const restoredSurfaceElements = {
                // Initialize all surfaces as empty
                front: [],
                back: [],
                inside: [],
                lid: [],
                canopy_front: [],
                canopy_back: [],
                canopy_left: [],
                canopy_right: [],
                sidewall_left: [],
                sidewall_right: [],
                backwall: [],
                // Override with restored elements for current surface
                [currentSurface]: restoredElements
              }
              setSurfaceElements(restoredSurfaceElements)
              console.log(`🎨 Restored ${restoredElements.length} elements for surface: ${currentSurface}`)
            }).catch(error => {
              console.error('Failed to restore image elements:', error)
              // Fallback: create empty surface elements for all surfaces
              setSurfaceElements({
                front: [],
                back: [],
                inside: [],
                lid: [],
                canopy_front: [],
                canopy_back: [],
                canopy_left: [],
                canopy_right: [],
                sidewall_left: [],
                sidewall_right: [],
                backwall: []
              })
            })
            
            setBackgroundColor(orderData.canvas_data.backgroundColor || '#ffffff')
            if (orderData.canvas_data.bannerSpecs) {
              setBannerSpecs(orderData.canvas_data.bannerSpecs)
            }
            if (orderData.canvas_data.canvasSize) {
              setCanvasSize(orderData.canvas_data.canvasSize)
              setCanvasOrientation(orderData.canvas_data.canvasSize.width > orderData.canvas_data.canvasSize.height ? 'landscape' : 'portrait')
            }
            // Restore tent design option if available
            if (orderData.tent_design_option) {
              setTentDesignOption(orderData.tent_design_option)
              console.log('🎨 Restored tent design option:', orderData.tent_design_option)
            }
            // Restore tent specs if available
            if (orderData.tent_specs) {
              setTentSpecs(orderData.tent_specs)
              console.log('🎨 Restored tent specs:', orderData.tent_specs)
            }
          } else {
            // For single-surface products or fallback, restore image elements properly
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
              // Restore tent design option if available
              if (orderData.tent_design_option) {
                setTentDesignOption(orderData.tent_design_option)
                console.log('🎨 Restored tent design option (fallback):', orderData.tent_design_option)
              }
              // Restore tent specs if available
              if (orderData.tent_specs) {
                setTentSpecs(orderData.tent_specs)
                console.log('🎨 Restored tent specs (fallback):', orderData.tent_specs)
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
              // Restore tent design option if available
              if (orderData.tent_design_option) {
                setTentDesignOption(orderData.tent_design_option)
                console.log('🎨 Restored tent design option (error fallback):', orderData.tent_design_option)
            }
          })
          }
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
          
          // Restore product type and surface from saved template data
          if (canvasData.productType) {
            console.log('🎨 Restoring product type from sessionStorage:', canvasData.productType)
            setProductType(canvasData.productType)
          } else {
            console.log('🎨 No productType in sessionStorage data, attempting to detect from bannerSpecs:', canvasData.bannerSpecs)
            // Fallback: try to detect product type from bannerSpecs
            if (canvasData.bannerSpecs) {
              const bannerId = canvasData.bannerSpecs.id || canvasData.bannerSpecs
              if (bannerId && typeof bannerId === 'string') {
                if (bannerId.includes('tin') || bannerId.includes('business_card')) {
                  console.log('🎨 Detected tin product type from bannerSpecs')
                  setProductType('tin')
                } else if (bannerId.includes('tent') || bannerId.includes('tradeshow')) {
                  console.log('🎨 Detected tent product type from bannerSpecs')
                  setProductType('tent')
                } else {
                  console.log('🎨 Defaulting to banner product type')
                  setProductType('banner')
                }
              }
            }
          }
          
          if (canvasData.currentSurface) {
            console.log('🎨 Restoring current surface from sessionStorage:', canvasData.currentSurface)
            setCurrentSurface(canvasData.currentSurface)
          } else {
            console.log('🎨 No currentSurface in sessionStorage data, using default based on product type')
            // Set default surface based on product type
            const detectedProductType = canvasData.productType || 'banner'
            if (detectedProductType === 'tin') {
              setCurrentSurface('front')
            } else if (detectedProductType === 'tent') {
              setCurrentSurface('canopy_front')
            } else {
              setCurrentSurface('front')
            }
          }
          
          // For multi-surface products, restore surface_elements if available
          if (canvasData.surface_elements && (canvasData.productType === 'tin' || canvasData.productType === 'tent')) {
            console.log('🎨 Restoring multi-surface elements from sessionStorage:', canvasData.surface_elements)
            
            // Restore image elements properly for each surface
            const restoredSurfaceElements = {}
            const surfaceKeys = Object.keys(canvasData.surface_elements)
            
            // Process each surface's elements
            const restorePromises = surfaceKeys.map(async (surfaceKey) => {
              const elements = canvasData.surface_elements[surfaceKey] || []
              try {
                const restoredElements = await restoreImageElements(elements)
                restoredSurfaceElements[surfaceKey] = restoredElements
                console.log(`🎨 Restored ${restoredElements.length} elements for surface: ${surfaceKey}`)
              } catch (error) {
                console.error(`Failed to restore elements for surface ${surfaceKey}:`, error)
                restoredSurfaceElements[surfaceKey] = elements // Fallback to original elements
              }
            })
            
            // Wait for all surfaces to be restored
            Promise.all(restorePromises).then(() => {
              // Ensure all surfaces are properly initialized with empty arrays
              const completeSurfaceElements = {
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
                backwall: [],
                // Override with restored elements
                ...restoredSurfaceElements
              }
              setSurfaceElements(completeSurfaceElements)
            }).catch(error => {
              console.error('Failed to restore surface elements:', error)
              // Fallback: ensure all surfaces are empty
              setSurfaceElements({
                front: [],
                back: [],
                inside: [],
                lid: [],
                canopy_front: [],
                canopy_back: [],
                canopy_left: [],
                canopy_right: [],
                sidewall_left: [],
                sidewall_right: [],
                backwall: []
              })
            })
          } else {
            // For single-surface products or fallback, restore image elements properly
          console.log('🎨 About to restore elements:', canvasData.elements)
          console.log('🎨 Canvas data keys:', Object.keys(canvasData))
          restoreImageElements(canvasData.elements || []).then(restoredElements => {
            console.log('🎨 Restored elements:', restoredElements)
            setElements(restoredElements)
          }).catch(error => {
            console.error('Failed to restore image elements:', error)
            // Fallback to loading without images
            console.log('🎨 Fallback: Setting elements directly:', canvasData.elements)
            setElements(canvasData.elements || [])
            })
          }
          
          // Restore design options from template
          if (canvasData.tent_design_option) {
            console.log('🎨 Restoring tent design option from sessionStorage template:', canvasData.tent_design_option)
            setTentDesignOption(canvasData.tent_design_option)
          }
          if (canvasData.tent_specs) {
            console.log('🎨 Restoring tent specs from sessionStorage template:', canvasData.tent_specs)
            setTentSpecs(canvasData.tent_specs)
          }
          if (canvasData.tin_surface_coverage) {
            console.log('🎨 Restoring tin surface coverage from sessionStorage template:', canvasData.tin_surface_coverage)
            setTinSpecs(prev => ({
              ...prev,
              surfaceCoverage: canvasData.tin_surface_coverage
            }))
          }
          
          // Restore other template properties
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

  // Ensure canvas size is properly set for tent products on initial load
  useEffect(() => {
    if (productType === 'tent' && currentSurface.startsWith('canopy_')) {
      // Ensure canvas size includes valence for canopy surfaces
      setCanvasSize({ width: 1160, height: 1049 })
    }
  }, [productType, currentSurface]) // Run when productType or currentSurface changes

  // Glass UI Header Component
  const GlassHeader = () => (
    <div className="backdrop-blur-xl bg-white/10 border-b border-white/20 p-3 md:p-4">
      <div className="flex items-center justify-between">
        
        {/* Left Section */}
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <button
            onClick={() => navigate(cameFromTemplate ? '/dashboard?tab=templates' : '/dashboard')}
            className="flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg md:rounded-xl transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4 md:w-4 md:h-4" />
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
              className="h-16 md:h-24 w-auto"
            />
          </button>
        </div>

        {/* Center Section - Product Type Selector */}
        <div className="flex items-center gap-2 md:gap-2 flex-shrink-0">
          <label className="text-xs font-medium text-gray-700 hidden md:block">
            Product:
          </label>
          <select
            value={productType}
            onChange={(e) => handleProductTypeChange(e.target.value)}
            className="product-selector px-2 md:px-3 py-1.5 md:py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg transition-all duration-200 text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-w-0"
            data-tour="product-selector"
          >
            <option value="banner">🏷️ Banner</option>
            <option value="tin">🗃️ Tin</option>
            <option value="tent">🏕️ Tent</option>
            <option value="sticker">🏷️ Sticker</option>
          </select>
        </div>

        {/* Right Section */}
        <div className="action-buttons flex items-center gap-2 md:gap-3 flex-shrink-0">
          <button
            onClick={saveAsTemplate}
            className="px-2 md:px-4 py-1.5 md:py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 border border-purple-400/30 backdrop-blur-sm rounded-lg md:rounded-xl transition-all duration-200 font-medium text-xs md:text-sm"
          >
            <span className="hidden sm:inline">Save as Template</span>
            <span className="sm:hidden">Save</span>
          </button>
          
          <button
            onClick={() => createOrder()}
            className="px-2 md:px-4 py-1.5 md:py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 border border-blue-400/30 backdrop-blur-sm rounded-lg md:rounded-xl transition-all duration-200 font-medium flex items-center gap-1 md:gap-2 text-xs md:text-sm"
          >
            <ShoppingCart className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Create Order</span>
            <span className="sm:hidden">Order</span>
          </button>
          
          {/* Mobile Hamburger - After action buttons */}
          <button
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="mobile-hamburger md:hidden p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg transition-all duration-200 min-w-[40px] min-h-[40px] flex items-center justify-center z-50 relative flex-shrink-0"
            data-tour="mobile-hamburger"
          >
            {isMobileSidebarOpen ? <X className="w-4 h-4 text-gray-800" /> : <Menu className="w-4 h-4 text-gray-800" />}
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
          data-tour="sidebar-tools"
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
            onAvailableSurfacesChange={handleAvailableSurfacesChange}
            onCopyDesignToSurface={copyDesignToSurface}
            tentDesignOption={tentDesignOption}
            onTentDesignOptionChange={handleTentDesignOptionChange}
            tentSpecs={tentSpecs}
            onTentSpecChange={handleTentSpecChange}
            stickerSpecs={stickerSpecs}
            onStickerSpecChange={setStickerSpecs}
            stickerMaterials={stickerMaterials}
            stickerShapes={stickerShapes}

            onAddShape={addShape}
            onAddText={addText}
            onAddAsset={addAsset}
            onAddIcon={addIcon}
            onLoadTemplate={loadTemplate}
            onImageUpload={handleImageUpload}
            onAddQRCode={addQRCode}
            onRemoveAssetFromTracking={removeAssetFromTracking}

            onTextPropertyChange={handleTextPropertyChange}
            onShapePropertyChange={handleShapePropertyChange}
            onChangeBannerType={changeBannerType}
            onChangeCanvasSize={changeCanvasSize}
            onToggleCanvasOrientation={toggleCanvasOrientation}
            bannerTemplates={templates}
            userTemplates={[]}
            selectedElement={elements.find(el => el.id === selectedId)}
            selectedId={selectedId}
            currentTemplateId={currentTemplateId}
            activeDesignAssets={activeDesignAssets}
            onRemoveAssetFromCanvas={removeAssetFromCanvas}
          />
        </div>
        
        {/* Canvas - Centered on Mobile Landscape when Sidebar Closed, Normal on Desktop */}
        <div className={`
          canvas-container flex-1 relative
          ${isMobileSidebarOpen ? 'hidden' : 'block'}
          md:block
          z-0 md:z-auto
          transition-all duration-300 ease-in-out
        `}>
          <BannerCanvas
            ref={stageRef}
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
            availableSurfaces={availableSurfaces}
            clipFunc={productType === 'tent' && (currentSurface === 'canopy_front' || currentSurface === 'canopy_back' || currentSurface === 'canopy_left' || currentSurface === 'canopy_right') ? getTentCanopyValenceClipFunc() : null}
            onRemoveAssetFromTracking={removeAssetFromTracking}
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
