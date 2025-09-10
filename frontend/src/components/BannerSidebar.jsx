import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Image as ImageIcon, 
  Square, 
  Circle as CircleIcon,
  Star as StarIcon,
  Triangle,
  ChevronDown,
  ChevronUp,
  Upload,
  Sparkles,
  Palette,
  Copy,
  CornerDownRight,
  FileText,
  X,
  QrCode,
  Link,
  Trash2,
  ShoppingCart,
  Store,
  Loader2,
  Eye,
  User,
  Tag
} from 'lucide-react'

const BannerSidebar = ({ 
  isMobileOpen,
  bannerSpecs,
  bannerTypes = [],
  bannerSizes = [],
  canvasSize,
  canvasOrientation,
  productType = 'banner',
  tinSpecs = { finish: 'silver', surfaceCoverage: 'front-back', printingMethod: 'premium-vinyl' },
  onTinSpecsChange,
  currentSurface = 'front',
  onSurfaceChange,
  onAvailableSurfacesChange,
  onCopyDesignToSurface,
  tentDesignOption = 'canopy-only',
  onTentDesignOptionChange,

  onAddShape,
  onAddAsset,
  onAddIcon,
  onAddText,
  onAddQRCode,
  onLoadTemplate,
  onImageUpload,
  onClearCanvas,
  onTextPropertyChange,
  onShapePropertyChange,
  onChangeBannerType,
  onChangeCanvasSize,
  onToggleCanvasOrientation,
  bannerTemplates = [],
  userTemplates = [],
  selectedElement = null,
  elementsCount = 0
}) => {
  const [expandedSections, setExpandedSections] = useState({
    specifications: false,
    shapes: false,
    text: false,
    qrcode: false,
    templates: false,
    assets: false,
    upload: false,
    marketplace: false
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [sizeCategory, setSizeCategory] = useState('landscape')
  const [uploadedImages, setUploadedImages] = useState([])
  
  // Marketplace state
  const [marketplaceTemplates, setMarketplaceTemplates] = useState([])
  const [marketplaceLoading, setMarketplaceLoading] = useState(false)
  const [marketplaceError, setMarketplaceError] = useState(null)
  const [marketplaceSearchTerm, setMarketplaceSearchTerm] = useState('')
  const [selectedMarketplaceCategory, setSelectedMarketplaceCategory] = useState('')

  // Stable callback for radio button changes
  const handleTentDesignOptionChange = useCallback((value) => {
    const previousOption = tentDesignOption
    
    // Call the parent handler
    if (onTentDesignOptionChange) {
      onTentDesignOptionChange(value)
    }
    
    // Handle design transfer when new surfaces become available
    if (previousOption !== value) {
      // If switching to "canopy-backwall" from "canopy-only"
      if (value === 'canopy-backwall' && previousOption === 'canopy-only') {
        // All 4 canopy sides keep their existing designs, backwall starts blank
        // No copying needed - canopy sides already have their designs
        console.log('🎨 Switching to canopy-backwall - canopy sides keep existing designs, backwall starts blank')
      }
      // If switching to "all-sides" from "canopy-only" or "canopy-backwall"
      else if (value === 'all-sides' && (previousOption === 'canopy-only' || previousOption === 'canopy-backwall')) {
        // All existing surfaces (4 canopy sides + backwall if applicable) keep their designs, sidewalls remain blank
        console.log('🎨 Switching to all-sides - existing surfaces keep their designs, sidewalls remain blank')
      }
    }
  }, [tentDesignOption, onTentDesignOptionChange, onCopyDesignToSurface])

  // Memoized available tent surfaces based on design option
  const availableTentSurfaces = useMemo(() => {
    const allSurfaces = [
      { key: 'canopy_front', name: 'Canopy Front + Valence', group: 'canopy' },
      { key: 'canopy_back', name: 'Canopy Back + Valence', group: 'canopy' },
      { key: 'canopy_left', name: 'Canopy Left + Valence', group: 'canopy' },
      { key: 'canopy_right', name: 'Canopy Right + Valence', group: 'canopy' },
      { key: 'backwall', name: 'Back Wall', group: 'wall' }, // Moved backwall right after canopy
      { key: 'sidewall_left', name: 'Left Sidewall', group: 'wall' },
      { key: 'sidewall_right', name: 'Right Sidewall', group: 'wall' }
    ]

    let filteredSurfaces = []
    if (tentDesignOption === 'canopy-only') {
      // Include canopy surfaces (now with integrated valence)
      filteredSurfaces = allSurfaces.filter(s => s.group === 'canopy')
    } else if (tentDesignOption === 'canopy-backwall') {
      // For canopy + backwall, return canopy surfaces + backwall in order
      filteredSurfaces = [
        ...allSurfaces.filter(s => s.group === 'canopy'),
        ...allSurfaces.filter(s => s.key === 'backwall')
      ]
    } else {
      filteredSurfaces = allSurfaces // all-sides
    }
    
    return filteredSurfaces
  }, [tentDesignOption])

  // Memoized available tin surfaces based on surface coverage
  const availableTinSurfaces = useMemo(() => {
    const allSurfaces = [
      { key: 'front', name: 'Front', group: 'main' },
      { key: 'back', name: 'Back', group: 'main' },
      { key: 'inside', name: 'Inside', group: 'secondary' },
      { key: 'lid', name: 'Lid', group: 'secondary' }
    ]

    // Return empty array if tinSpecs is null (not a tin product)
    if (!tinSpecs) {
      return []
    }

    if (tinSpecs.surfaceCoverage === 'front-back') {
      return allSurfaces.filter(s => s.group === 'main')
    } else {
      return allSurfaces // all-sides
    }
  }, [tinSpecs?.surfaceCoverage])

  // Update currentSurface if it's not available in the new filtered surfaces
  useEffect(() => {
    if (productType === 'tent') {
      const availableSurfaceKeys = availableTentSurfaces.map(s => s.key)
      if (!availableSurfaceKeys.includes(currentSurface)) {
        if (availableTentSurfaces.length > 0) {
          onSurfaceChange?.(availableTentSurfaces[0].key)
        }
      }
    } else if (productType === 'tin') {
      const availableSurfaceKeys = availableTinSurfaces.map(s => s.key)
      if (!availableSurfaceKeys.includes(currentSurface)) {
        if (availableTinSurfaces.length > 0) {
          onSurfaceChange?.(availableTinSurfaces[0].key)
        }
      }
    }
  }, [availableTentSurfaces, availableTinSurfaces, currentSurface, onSurfaceChange, productType])

  // Notify parent component of available surfaces change
  useEffect(() => {
    if (productType === 'tent' && onAvailableSurfacesChange) {
      const availableSurfaceKeys = availableTentSurfaces.map(s => s.key)
      onAvailableSurfacesChange(availableSurfaceKeys)
    } else if (productType === 'tin' && onAvailableSurfacesChange) {
      const availableSurfaceKeys = availableTinSurfaces.map(s => s.key)
      onAvailableSurfacesChange(availableSurfaceKeys)
    }
  }, [availableTentSurfaces, availableTinSurfaces, productType, onAvailableSurfacesChange])

  // Note: Removed useEffect to prevent double render issues

  // QR Code state
  const [qrColor, setQrColor] = useState('#000000')
  const [qrBackgroundColor, setQrBackgroundColor] = useState('#ffffff')


  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollDirection, setScrollDirection] = useState('down')

  const sidebarRef = useRef(null)
  const templatesScrollRef = useRef(null)
  const [scrollPositions, setScrollPositions] = useState({})
  const [isPreservingScroll, setIsPreservingScroll] = useState(false)
  
  // Count open sections to adjust timing
  const openSectionsCount = Object.values(expandedSections).filter(Boolean).length

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      uploadedImages.forEach(image => {
        if (image.url && image.url.startsWith('blob:')) {
          URL.revokeObjectURL(image.url)
        }
      })
    }
  }, [])

  // Marketplace categories
  const marketplaceCategories = [
    'Restaurant & Food',
    'Retail & Shopping', 
    'Service Businesses',
    'Events & Community',
    'Seasonal',
    'Industry Specific'
  ]

  // Load marketplace templates
  const loadMarketplaceTemplates = async () => {
    try {
      setMarketplaceLoading(true)
      setMarketplaceError(null)
      
      const filters = {
        is_approved: true,
        is_active: true,
        limit: 20
      }
      
      if (selectedMarketplaceCategory) {
        filters.category = selectedMarketplaceCategory
      }
      
      if (marketplaceSearchTerm) {
        filters.search = marketplaceSearchTerm
      }
      
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value)
        }
      })
      
      const apiUrl = import.meta.env.VITE_API_URL || 'https://buy-printz-production.up.railway.app'
      const response = await fetch(`${apiUrl}/api/creator-marketplace/templates/marketplace?${queryParams}`)
      
      if (response.ok) {
        const data = await response.json()
        setMarketplaceTemplates(data.templates || [])
      } else {
        setMarketplaceError('Failed to load marketplace templates')
      }
    } catch (error) {
      console.error('Error loading marketplace templates:', error)
      setMarketplaceError('Network error loading templates')
    } finally {
      setMarketplaceLoading(false)
    }
  }

  // Load marketplace templates when section is expanded
  useEffect(() => {
    if (expandedSections.marketplace && marketplaceTemplates.length === 0) {
      loadMarketplaceTemplates()
    }
  }, [expandedSections.marketplace])

  // Reload when search or category changes
  useEffect(() => {
    if (expandedSections.marketplace) {
      loadMarketplaceTemplates()
    }
  }, [marketplaceSearchTerm, selectedMarketplaceCategory])

  // Handle scroll restoration after layout changes
  useLayoutEffect(() => {
    if (isPreservingScroll) {
      const sidebar = sidebarRef.current
      const templates = templatesScrollRef.current
      
      if (sidebar && scrollPositions.sidebar !== undefined) {
        sidebar.scrollTop = scrollPositions.sidebar
      }
      if (templates && scrollPositions.templates !== undefined) {
        templates.scrollTop = scrollPositions.templates
      }
    }
  }, [expandedSections, isPreservingScroll, scrollPositions])

  // Function to remove uploaded image
  const removeUploadedImage = (index) => {
    setUploadedImages(prev => {
      const newImages = [...prev]
      const removedImage = newImages.splice(index, 1)[0]
      
      // Clean up the object URL
      if (removedImage.url && removedImage.url.startsWith('blob:')) {
        URL.revokeObjectURL(removedImage.url)
      }
      
      return newImages
    })
  }

  // Use bannerTemplates prop instead of local definition

  // Enhanced Shape Library
  const shapeLibrary = [
    // Basic Shapes
    { name: 'Rectangle', icon: Square, type: 'rect', category: 'basic' },
    { name: 'Circle', icon: CircleIcon, type: 'circle', category: 'basic' },
    { name: 'Triangle', icon: Triangle, type: 'triangle', category: 'basic' },
    { name: 'Hexagon', icon: FileText, type: 'hexagon', category: 'basic' },
    { name: 'Octagon', icon: FileText, type: 'octagon', category: 'basic' },
    
    // Decorative Shapes
    { name: 'Star', icon: StarIcon, type: 'star', category: 'decorative' },
    
    // Arrows & Directional
    { name: 'Arrow Right', icon: CornerDownRight, type: 'arrow-right', category: 'arrows' },
    { name: 'Arrow Left', icon: CornerDownRight, type: 'arrow-left', category: 'arrows' },
    { name: 'Arrow Up', icon: CornerDownRight, type: 'arrow-up', category: 'arrows' },
    { name: 'Arrow Down', icon: CornerDownRight, type: 'arrow-down', category: 'arrows' },
    { name: 'Double Arrow', icon: CornerDownRight, type: 'double-arrow', category: 'arrows' },
    
    // Business Shapes
    { name: 'Badge', icon: FileText, type: 'badge', category: 'business' },
    { name: 'Certificate', icon: FileText, type: 'certificate', category: 'business' },
    { name: 'Document', icon: FileText, type: 'document', category: 'business' },
    { name: 'Checkmark', icon: FileText, type: 'checkmark', category: 'business' },
    { name: 'Target', icon: CircleIcon, type: 'target', category: 'business' }
  ]

  // Enhanced Icon Library - Only Icons with Real Assets
  const iconLibrary = [
    // Medical & Healthcare (Real SVG Icons)
    { name: 'Doctor', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Doctor.svg' },
    { name: 'Nurse', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Nurse.svg' },
    { name: 'Hospital Building', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Hospital.svg' },
    { name: 'Medical Kit', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Medical Kit.svg' },
    { name: 'Stethoscope', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Phonendoscope.svg' },
    { name: 'Thermometer', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Thermometer.svg' },
    { name: 'Syringe', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Syringe.svg' },
    { name: 'Pills', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Medicine.svg' },
    { name: 'Capsule', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Capsule.svg' },
    { name: 'Microscope', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Microscope.svg' },
    { name: 'DNA', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/DNA.svg' },
    { name: 'Cardiogram', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Cardiogram.svg' },
    { name: 'X-Ray', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Xray.svg' },
    { name: 'MRI', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/MRI.svg' },
    { name: 'USG', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/USG.svg' },
    { name: 'Ambulance', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Ambulance.svg' },
    { name: 'Pharmacy', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Pharmacy.svg' },
    { name: 'Medical Report', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Medical Report.svg' },
    { name: 'Prescription', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Prescription.svg' },
    { name: 'Medical History', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Medical History.svg' },
    { name: 'Medical Checkup', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Medical Checkup.svg' },
    { name: 'Surgery Room', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Surgery Room.svg' },
    { name: 'Emergency Call', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Emergency Call.svg' },
    { name: 'Blood', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Blood.svg' },
    { name: 'Blood Transfusion', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Blood Transfusion.svg' },
    { name: 'Sample Tube', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Sample Tube.svg' },
    { name: 'Bacteria', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Bacteria.svg' },
    { name: 'Caduceus', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Caduceus.svg' },
    { name: 'Wheelchair', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Wheelchair.svg' },
    { name: 'Crutches', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Crutches.svg' },
    { name: 'Weight Scale', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Weight Scale.svg' },
    { name: 'Oxygen', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Oxygen.svg' },
    { name: 'Infusion', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Infusion.svg' },
    { name: 'Herbal Medicine', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Herbal.svg' },
    { name: 'Dental', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Dental.svg' },
    { name: 'Ophthalmologist', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/ophthalmologists.svg' },
    { name: 'Blood Pressure', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Sphygmomanometer.svg' },
    { name: 'Radioactive', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Radio Active.svg' },
    { name: 'Mobile Apps', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Mobile Apps.svg' },
    { name: 'Healthy Insurance', icon: FileText, symbol: null, category: 'medical', imagePath: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/DrawKit Medical - Color/SVG/Healthy Insurance.svg' },
    
    // Social Media (Real PNG Icons)
    { name: 'X (Twitter)', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/X.png' },
    { name: 'Twitter', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Twitter.png' },
    { name: 'Meta (Facebook)', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Facebook.png' },
    { name: 'LinkedIn', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/LinkedIn.png' },
    { name: 'Reddit', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Reddit.png' },
    { name: 'Pinterest', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Pinterest.png' },
    { name: 'Instagram', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Instagram.png' },
    { name: 'Snapchat', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Snapchat.png' },
    { name: 'Telegram', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Telegram.png' },
    { name: 'WhatsApp', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Whatsapp.png' },
    { name: 'Twitch', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Twitch.png' },
    { name: 'YouTube', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Youtube.png' },
    { name: 'TikTok', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Tiktok.png' },
    { name: 'Discord', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Discord.png' },
    { name: 'Slack', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Slack.png' },
    { name: 'Skype', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Skype.png' },
    { name: 'Behance', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Behance.png' },
    { name: 'Dribbble', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Dribbble.png' },
    { name: 'Dropbox', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Dropbox.png' },
    { name: 'Drive', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Drive.png' },
    { name: 'Excel', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Excel.png' },
    { name: 'Line', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Line.png' },
    { name: 'Messenger', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Messenger.png' },
    { name: 'OneNote', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/OneNote.png' },
    { name: 'Outlook', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Outlook.png' },
    { name: 'Paypal', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Paypal.png' },
    { name: 'PowerPoint', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/PowerPoint.png' },
    { name: 'Soundcloud', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Soundcloud.png' },
    { name: 'Spotify', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Spotify.png' },
    { name: 'Tumblr', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Tumblr.png' },
    { name: 'Viber', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Viber.png' },
    { name: 'Vimeo', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Vimeo.png' },
    { name: 'VK', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/VK.png' },
    { name: 'WeChat', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/WeChat.png' },
    { name: 'Word', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Word.png' },
    { name: 'Zoom', icon: FileText, symbol: null, category: 'social', imagePath: '/assets/images/social icons/Zoom.png' },
    
    // Technology & Business (Real SVG Icons)
    { name: 'Technology', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Technology.svg' },
    { name: 'Data Analytics', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Data Analytic.svg' },
    { name: 'User Experience', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/User Experience.svg' },
    { name: 'Passive Income', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Passive Income.svg' },
    { name: 'Valuations', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Valuations.svg' },
    { name: 'Blue Print', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Blue Print.svg' },
    { name: 'Anti Virus', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Anti Virus.svg' },
    { name: 'Manager', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Manager.svg' },
    { name: 'Digital Agreement', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Digital Agreement.svg' },
    { name: 'Growth', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Growth.svg' },
    { name: 'Sync Data', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Sync Data.svg' },
    { name: 'Project Management', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Project Management.svg' },
    { name: 'Startup', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Startup.svg' },
    { name: 'Development', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Development.svg' },
    { name: 'Digital Marketing', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Digital Marketing.svg' },
    { name: 'User Security', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/User Security.svg' },
    { name: 'Affiliate', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Affiliate.svg' },
    { name: 'Registration', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Registration.svg' },
    { name: 'Budget', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Budget.svg' },
    { name: 'Online Shopping', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Online Shoping.svg' },
    { name: 'Feedback Audience', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Feedback Audience.svg' },
    { name: 'Warning', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Warning.svg' },
    { name: 'Unicorn', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Unicorn.svg' },
    { name: 'Direction', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Direction.svg' },
    { name: 'Time Management', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Time Management.svg' },
    { name: 'MRR', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/MRR.svg' },
    { name: 'User Acquisitions', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/User Acquisitions.svg' },
    { name: 'Investor', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Investor.svg' },
    { name: 'Binocular', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Binocular.svg' },
    { name: 'Product Management', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Product Management.svg' },
    { name: 'Cloud Computing', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Cloud Computing.svg' },
    { name: 'Target Audience', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Target Audience.svg' },
    { name: 'Website', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Website.svg' },
    { name: 'Networking', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Networking.svg' },
    { name: 'Mobile Payment', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Mobile Payment.svg' },
    { name: 'Ecommerce', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Ecommerce.svg' },
    { name: 'SaaS', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/SaaS.svg' },
    { name: 'Cloud Data', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Cloud Data.svg' },
    { name: 'Speed', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Speed.svg' },
    { name: 'Work Flow', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Work Flow.svg' },
    { name: 'Database', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Database.svg' },
    { name: 'Presentation', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Presentation.svg' },
    { name: 'Software Companies', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Software Companes.svg' },
    { name: 'Comparison', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Comparison.svg' },
    { name: 'User Interface', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/User Interface.svg' },
    { name: 'Target', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Target.svg' },
    { name: 'Creative Idea', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Creative Idea.svg' },
    { name: 'SEO', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/SEO.svg' },
    { name: 'Hockey Stick Growth', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Hockey stick growth.svg' },
    { name: 'Teamwork', icon: FileText, symbol: null, category: 'technology', imagePath: '/assets/images/icons/Teamwork.svg' },
    
    // Food & Dining (Real SVG Icons)
    { name: 'Lollipop', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Lollipop.svg' },
    { name: 'Tart', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Tart.svg' },
    { name: 'Pancake', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Pancake.svg' },
    { name: 'Ramen', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Ramen.svg' },
    { name: 'Dimsum', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Dimsum.svg' },
    { name: 'Cheese', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Cheese.svg' },
    { name: 'Baguette', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Baguette.svg' },
    { name: 'Sausage', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Sausage.svg' },
    { name: 'Muffin', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Muffin.svg' },
    { name: 'Sushi', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Sushi.svg' },
    { name: 'Fries', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Fries.svg' },
    { name: 'Banana', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Banana.svg' },
    { name: 'Pizza', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Pizza.svg' },
    { name: 'Boba', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Boba.svg' },
    { name: 'Ice Cream', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Ice Cream.svg' },
    { name: 'Banana Split', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Banana Split.svg' },
    { name: 'Donut', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Donut.svg' },
    { name: 'Tea', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Tea.svg' },
    { name: 'Chocolate', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Chocolate.svg' },
    { name: 'Sandwich', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Sandwich.svg' },
    { name: 'Juice', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Juice.svg' },
    { name: 'Salt Pepper', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Salt Pepper.svg' },
    { name: 'Pie', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Pie.svg' },
    { name: 'Burger', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Burger.svg' },
    { name: 'Onigiri', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Onigiri.svg' },
    { name: 'Mineral Water', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Mineral Water.svg' },
    { name: 'BBQ', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/BBQ.svg' },
    { name: 'Spaghetti', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Spaghetti.svg' },
    { name: 'Softdrink', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Softdrink.svg' },
    { name: 'Salad', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Salad.svg' },
    { name: 'Cutlery', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Cutlery.svg' },
    { name: 'Coffee', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Coffee.svg' },
    { name: 'Hotdog', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Hotdog.svg' },
    { name: 'Cocktail', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Cocktail.svg' },
    { name: 'Breakfast', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Breakfast.svg' },
    { name: 'Bread', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Bread.svg' },
    { name: 'Cheesecake', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Cheesecake.svg' },
    { name: 'Cookies', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Cookies.svg' },
    { name: 'Salmon Steak', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Salmon Steak.svg' },
    { name: 'Ice Block', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Ice block.svg' },
    { name: 'Sauce', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Sauce.svg' },
    { name: 'Chopsticks', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Chopsticks.svg' },
    { name: 'Steak', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Steak.svg' },
    { name: 'Kimbab', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Kimbab.svg' },
    { name: 'Milk', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Milk.svg' },
    { name: 'Beer', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Beer.svg' },
    { name: 'Cola Can', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Cola Can.svg' },
    { name: 'Burrito', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Burrito.svg' },
    { name: 'Croissant', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Croissant.svg' },
    { name: 'Wine', icon: FileText, symbol: null, category: 'food', imagePath: '/assets/images/food/Wine.svg' },
  ]

  // Asset categories with modern organization
  const assetCategories = {
    zodiac: {
      name: 'Zodiac Signs',
      icon: StarIcon,
      color: 'from-yellow-400 to-amber-500',
      assets: [
        { name: 'Cancer', file: '1_Cancer_FINAL_with text.png', tags: ['zodiac', 'cancer'] },
        { name: 'Taurus', file: '2_Taurus_FINAL-1_with text.png', tags: ['zodiac', 'taurus'] },
        { name: 'Capricorn', file: '3_Capricornus_FINAL-1_with text.png', tags: ['zodiac', 'capricorn'] },
        { name: 'Pisces', file: '4_Pisces_FINAL-1_with text.png', tags: ['zodiac', 'pisces'] },
        { name: 'Leo', file: '5_Leo_FINAL-1_with text.png', tags: ['zodiac', 'leo'] },
        { name: 'Aquarius', file: '6_Aquarius_FINAL_with text.png', tags: ['zodiac', 'aquarius'] },
        { name: 'Libra', file: '7_Libra_FINAL-1_with text.png', tags: ['zodiac', 'libra'] },
        { name: 'Sagittarius', file: '8_Sagittarius_FINAL_with text.png', tags: ['zodiac', 'sagittarius'] },
        { name: 'Gemini', file: '9_Gemini_FINAL-2_with text.png', tags: ['zodiac', 'gemini'] },
        { name: 'Aries', file: '10_Aries_FINAL_with text.png', tags: ['zodiac', 'aries'] },
        { name: 'Virgo', file: '11_Virgo_FINAL-2_with text.png', tags: ['zodiac', 'virgo'] },
        { name: 'Scorpio', file: '12_Scorpio_FINAL_with text.png', tags: ['zodiac', 'scorpio'] }
      ]
    },
    abstract: {
      name: 'Abstract Designs',
      icon: Sparkles,
      color: 'from-purple-400 to-pink-500',
      assets: [
        { name: 'Abstract 1', file: 'Abstract 1.png', tags: ['abstract', 'pattern'] },
        { name: 'Abstract 2', file: 'Abstract 2_NEW.png', tags: ['abstract', 'pattern'] },
        { name: 'Abstract 3', file: 'Abstract 3.png', tags: ['abstract', 'pattern'] },
        { name: 'Abstract 4', file: 'Abstract 4.png', tags: ['abstract', 'pattern'] },
        { name: 'Abstract 5', file: 'Abstract 5_NEW.png', tags: ['abstract', 'pattern'] },
        { name: 'Abstract 6', file: 'Abstract 6.png', tags: ['abstract', 'pattern'] },
        { name: 'Abstract 9', file: 'Abstract 9.png', tags: ['abstract', 'pattern'] },
        { name: 'Abstract 10', file: 'Abstract 10.png', tags: ['abstract', 'pattern'] },
        { name: 'Abstract 11', file: 'Abstract 11.png', tags: ['abstract', 'pattern'] },
        { name: 'Abstract 12', file: 'Abstract 12.png', tags: ['abstract', 'pattern'] },
        { name: 'Abstract 16', file: 'Abstract 16.png', tags: ['abstract', 'pattern'] },
        { name: 'Abstract 17', file: 'Abstract 17.png', tags: ['abstract', 'pattern'] }
      ]
    },
    skins: {
      name: 'SKINS Designs',
      icon: Palette,
      color: 'from-blue-400 to-indigo-500',
      assets: [
        // Front Designs
        { name: 'SKINS Design 00A Front', file: 'SKINS_DESIGN 00A_FRONT.png', tags: ['skins', 'front', '00a'] },
        { name: 'SKINS Design 1 Front', file: 'SKINS_DESIGN 1_FRONT.png', tags: ['skins', 'front', '1'] },
        { name: 'SKINS Design 2 Front', file: 'SKINS_DESIGN 2_FRONT.png', tags: ['skins', 'front', '2'] },
        { name: 'SKINS Design 3 Front', file: 'SKINS_DESIGN 3_FRONT.png', tags: ['skins', 'front', '3'] },
        { name: 'SKINS Design 4 Front', file: 'SKINS_DESIGN 4_FRONT.png', tags: ['skins', 'front', '4'] },
        { name: 'SKINS Design 5 Front', file: 'SKINS_DESIGN 5_FRONT.png', tags: ['skins', 'front', '5'] },
        { name: 'SKINS Design 6 Front', file: 'SKINS_DESIGN 6_FRONT.png', tags: ['skins', 'front', '6'] },
        { name: 'SKINS Design 7 Front', file: 'SKINS_DESIGN 7_FRONT.png', tags: ['skins', 'front', '7'] },
        { name: 'SKINS Design 8 Front', file: 'SKINS_DESIGN 8_FRONT.png', tags: ['skins', 'front', '8'] },
        { name: 'SKINS Design 9 Front', file: 'SKINS_DESIGN 9_FRONT.png', tags: ['skins', 'front', '9'] },
        { name: 'SKINS Design 10 Front', file: 'SKINS_DESIGN 10_FRONT.png', tags: ['skins', 'front', '10'] },
        { name: 'SKINS Design 11 Front', file: 'SKINS_DESIGN 11_FRONT.png', tags: ['skins', 'front', '11'] },
        { name: 'SKINS Design 12 Front', file: 'SKINS_DESIGN 12_FRONT.png', tags: ['skins', 'front', '12'] },
        { name: 'SKINS Design 13 Front', file: 'SKINS_DESIGN 13_FRONT.png', tags: ['skins', 'front', '13'] },
        { name: 'SKINS Design 17 Front', file: 'SKINS_DESIGN 17_FRONT.png', tags: ['skins', 'front', '17'] },
        { name: 'SKINS Design 19 Front', file: 'SKINS_DESIGN 19_FRONT.png', tags: ['skins', 'front', '19'] },
        { name: 'SKINS Design 20 Front', file: 'SKINS_DESIGN 20_FRONT.png', tags: ['skins', 'front', '20'] },
        { name: 'SKINS Design 21 Front', file: 'SKINS_DESIGN 21_FRONT.png', tags: ['skins', 'front', '21'] },
        { name: 'SKINS Design 22 Front', file: 'SKINS_DESIGN 22_FRONT.png', tags: ['skins', 'front', '22'] },
        { name: 'SKINS Design 23 Front', file: 'SKINS_DESIGN 23_FRONT.png', tags: ['skins', 'front', '23'] },
        { name: 'SKINS Design 24 Front', file: 'SKINS_DESIGN 24_FRONT.png', tags: ['skins', 'front', '24'] },
        { name: 'SKINS Design 25 Front', file: 'SKINS_DESIGN 25_FRONT.png', tags: ['skins', 'front', '25'] },
        { name: 'SKINS Design 26 Front', file: 'SKINS_DESIGN 26_FRONT.png', tags: ['skins', 'front', '26'] },
        { name: 'SKINS Design 27 Front', file: 'SKINS_DESIGN 27_FRONT.png', tags: ['skins', 'front', '27'] },
        { name: 'SKINS Design 28 Front', file: 'SKINS_DESIGN 28_BACK.png', tags: ['skins', 'front', '28'] },
        
        // Back Designs
        { name: 'SKINS Design 00A Back', file: 'SKINS_DESIGN 00A_BACK.png', tags: ['skins', 'back', '00a'] },
        { name: 'SKINS Design 1 Back', file: 'SKINS_DESIGN 1_BACK.png', tags: ['skins', 'back', '1'] },
        { name: 'SKINS Design 2 Back', file: 'SKINS_DESIGN 2_BACK.png', tags: ['skins', 'back', '2'] },
        { name: 'SKINS Design 3 Black', file: 'SKINS_DESIGN 3_BLACK.png', tags: ['skins', 'back', '3', 'black'] },
        { name: 'SKINS Design 4 Back', file: 'SKINS_DESIGN 4_BACK.png', tags: ['skins', 'back', '4'] },
        { name: 'SKINS Design 5 Back', file: 'SKINS_DESIGN 5_BACK.png', tags: ['skins', 'back', '5'] },
        { name: 'SKINS Design 6 Back', file: 'SKINS_DESIGN 6_BACK.png', tags: ['skins', 'back', '6'] },
        { name: 'SKINS Design 7 Back', file: 'SKINS_DESIGN 7_BACK.png', tags: ['skins', 'back', '7'] },
        { name: 'SKINS Design 8 Back', file: 'SKINS_DESIGN 8_BACK.png', tags: ['skins', 'back', '8'] },
        { name: 'SKINS Design 9 Back', file: 'SKINS_DESIGN 9_BACK.png', tags: ['skins', 'back', '9'] },
        { name: 'SKINS Design 10 Back', file: 'SKINS_DESIGN 10_BACK.png', tags: ['skins', 'back', '10'] },
        { name: 'SKINS Design 11 Back', file: 'SKINS_DESIGN 11_BACK.png', tags: ['skins', 'back', '11'] },
        { name: 'SKINS Design 12 Back', file: 'SKINS_DESIGN 12_BACK.png', tags: ['skins', 'back', '12'] },
        { name: 'SKINS Design 13 Back', file: 'SKINS_DESIGN 13_BACK.png', tags: ['skins', 'back', '13'] },
        { name: 'SKINS Design 17 Back', file: 'SKINS_DESIGN 17_BACK.png', tags: ['skins', 'back', '17'] },
        { name: 'SKINS Design 19 Back', file: 'SKINS_DESIGN 19_BACK.png', tags: ['skins', 'back', '19'] },
        { name: 'SKINS Design 20 Back', file: 'SKINS_DESIGN 20_BACK.png', tags: ['skins', 'back', '20'] },
        { name: 'SKINS Design 21 Back', file: 'SKINS_DESIGN 21_BACK.png', tags: ['skins', 'back', '21'] },
        { name: 'SKINS Design 22 Back', file: 'SKINS_DESIGN 22_BACK.png', tags: ['skins', 'back', '22'] },
        { name: 'SKINS Design 23 Back', file: 'SKINS_DESIGN 23_BACK.png', tags: ['skins', 'back', '23'] },
        { name: 'SKINS Design 24 Back', file: 'SKINS_DESIGN 24_BACK.png', tags: ['skins', 'back', '24'] },
        { name: 'SKINS Design 25 Back', file: 'SKINS_DESIGN 25_BACK.png', tags: ['skins', 'back', '25'] },
        { name: 'SKINS Design 26 Back', file: 'SKINS_DESIGN 26_BACK.png', tags: ['skins', 'back', '26'] },
        { name: 'SKINS Design 27 Back', file: 'SKINS_DESIGN 27_BACK.png', tags: ['skins', 'back', '27'] },
        
        // Front or Back Designs
        { name: 'SKINS Design 00 Front/Back', file: 'SKINS_DESIGN 00_FRONT OR BACK.png', tags: ['skins', 'front', 'back', '00'] },
        { name: 'SKINS Design 14 Front/Back', file: 'SKINS_DESIGN 14_FRONT OR BACK.png', tags: ['skins', 'front', 'back', '14'] },
        { name: 'SKINS Design 15 Front/Back', file: 'SKINS_DESIGN 15_FRONT OR BACK.png', tags: ['skins', 'back', '15'] },
        { name: 'SKINS Design 16 Front/Back', file: 'SKINS_DESIGN 16_FRONT OR BACK.png', tags: ['skins', 'front', 'back', '16'] },
        { name: 'SKINS Design 18A Front/Back', file: 'SKINS_DESIGN 18A_FRONT OR BACK.png', tags: ['skins', 'front', 'back', '18a'] },
        { name: 'SKINS Design 18B Front/Back', file: 'SKINS_DESIGN 18B_FRONT OR BACK.png', tags: ['skins', 'front', 'back', '18b'] }
      ]
    }
  }

  const preserveScrollPosition = useCallback((callback) => {
    const currentScrollTop = sidebarRef.current?.scrollTop || 0
    const templatesScrollTop = templatesScrollRef.current?.scrollTop || 0
    
    // Store scroll positions in state for useLayoutEffect
    setScrollPositions({
      sidebar: currentScrollTop,
      templates: templatesScrollTop
    })
    
    setIsPreservingScroll(true)
    
    // Temporarily disable scroll events
    const sidebar = sidebarRef.current
    const templates = templatesScrollRef.current
    
    if (sidebar) {
      sidebar.style.pointerEvents = 'none'
    }
    if (templates) {
      templates.style.pointerEvents = 'none'
    }
    
    // Execute the callback
    callback()
    
    // Re-enable pointer events after a delay
    setTimeout(() => {
      if (sidebar) {
        sidebar.style.pointerEvents = 'auto'
      }
      if (templates) {
        templates.style.pointerEvents = 'auto'
      }
      setIsPreservingScroll(false)
    }, 150)
  }, [openSectionsCount])

  const toggleSection = (sectionKey) => {
    preserveScrollPosition(() => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  })
  }

  // Handle tin specification changes
  const handleTinSpecChange = (key, value) => {
    if (onTinSpecsChange) {
      onTinSpecsChange(key, value)
    }
  }

  // Handle surface navigation
  const handleSurfaceChange = (surface) => {
    if (onSurfaceChange) {
      onSurfaceChange(surface)
    }
  }

  const handleAssetClick = (asset) => {
    preserveScrollPosition(() => {
    const imagePath = `/assets/images/${asset.file}`
    onAddAsset(imagePath, asset.name)
    })
  }

  const handleTemplateClick = (template) => {
    preserveScrollPosition(() => {
      onLoadTemplate(template)
    })
  }

  const handleIconClick = (name, symbol, imagePath) => {
    preserveScrollPosition(() => {
      onAddIcon(name, symbol, imagePath)
    })
  }

  const handleShapeClick = (shapeType) => {
    preserveScrollPosition(() => {
      onAddShape(shapeType)
    })
  }

  const handleTextAdd = (text = '') => {
    preserveScrollPosition(() => {
      onAddText(text)
    })
  }

  const handleQRCodeAdd = (url, color, backgroundColor) => {
    preserveScrollPosition(() => {
      onAddQRCode(url, color, backgroundColor)
    })
  }

  const getFilteredAssets = (assets) => {
    if (!searchTerm) return assets
    const searchLower = searchTerm.toLowerCase()
    return assets.filter(asset =>
      asset.name.toLowerCase().includes(searchLower) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  // Image upload handling
  const onDrop = async (acceptedFiles) => {
    for (const file of acceptedFiles) {
      try {
        // Create a URL for the uploaded image
        const imageUrl = URL.createObjectURL(file)
        
        // Add to uploaded images state
        setUploadedImages(prev => [...prev, {
          url: imageUrl,
          name: file.name,
          file: file
        }])
        
        // Call the parent callback
        if (onImageUpload) {
          onImageUpload(file)
        }
      } catch (error) {
        console.error('Error processing uploaded file:', error)
        alert('Failed to process uploaded file. Please try again.')
      }
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    onDropRejected: (rejectedFiles) => {
      console.log('Files rejected:', rejectedFiles)
      alert('Some files were rejected. Please check file type and size.')
    },
    onDragEnter: () => {
      console.log('Drag enter')
    },
    onDragLeave: () => {
      console.log('Drag leave')
    },
    onDragOver: () => {
      console.log('Drag over')
    }
  })

  const GlassCard = ({ children, className = "" }) => (
    <div className={`
      backdrop-blur-xl bg-white/10 
      border border-white/20 
      rounded-xl sm:rounded-2xl 
      shadow-[0_4px_16px_rgba(0,0,0,0.1)] sm:shadow-[0_8px_32px_rgba(0,0,0,0.1)]
      hover:shadow-[0_6px_24px_rgba(0,0,0,0.15)] sm:hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]
      transition-all duration-300
      ${className}
    `}>
      {children}
    </div>
  )

  const NeumorphicButton = ({ children, onClick, className = "", variant = "default" }) => {
    const variants = {
      default: "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700",
      primary: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",
      glass: "bg-white/20 hover:bg-white/30 text-gray-800 border border-white/30"
    }
    
    return (
      <button
        onClick={onClick}
        className={`
          ${variants[variant]}
          backdrop-blur-sm
          rounded-xl
          shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_8px_rgba(0,0,0,0.1)]
          hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_6px_12px_rgba(0,0,0,0.15)]
          active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]
          transition-all duration-200
          font-medium
          min-h-[44px]
          ${className}
        `}
      >
        {children}
      </button>
    )
  }

  // Text section
  const TextSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Text</h3>
        <button
          onClick={() => handleTextAdd()}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-md hover:shadow-lg"
        >
          Add Text
        </button>
      </div>
      
      {/* Quick Text Templates */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Quick Text</h4>
        <div className="grid grid-cols-2 gap-2">
          {['HEADLINE', 'Subtitle', 'Body Text', 'Call to Action'].map((text) => (
            <button
              key={text}
              onClick={() => handleTextAdd(text)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 rounded-lg text-sm transition-all duration-200 text-center transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500/50 shadow-sm hover:shadow-md"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
      
      {/* Font Family Selection */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Font Family</h4>
        <select
          onChange={(e) => onTextPropertyChange('fontFamily', e.target.value)}
          value={selectedElement?.fontFamily || 'Arial'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {/* Sans-serif Fonts */}
          <optgroup label="Sans-serif">
            <option value="Arial">Arial</option>
            <option value="Helvetica">Helvetica</option>
            <option value="Verdana">Verdana</option>
            <option value="Tahoma">Tahoma</option>
            <option value="Trebuchet MS">Trebuchet MS</option>
            <option value="Calibri">Calibri</option>
            <option value="Segoe UI">Segoe UI</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Roboto">Roboto</option>
            <option value="Lato">Lato</option>
            <option value="Montserrat">Montserrat</option>
            <option value="Source Sans Pro">Source Sans Pro</option>
            <option value="Nunito">Nunito</option>
            <option value="Poppins">Poppins</option>
            <option value="Inter">Inter</option>
          </optgroup>
          
          {/* Serif Fonts */}
          <optgroup label="Serif">
            <option value="Times New Roman">Times New Roman</option>
            <option value="Georgia">Georgia</option>
            <option value="Garamond">Garamond</option>
            <option value="Book Antiqua">Book Antiqua</option>
            <option value="Palatino">Palatino</option>
            <option value="Times">Times</option>
            <option value="Baskerville">Baskerville</option>
            <option value="Playfair Display">Playfair Display</option>
            <option value="Merriweather">Merriweather</option>
            <option value="Lora">Lora</option>
            <option value="Crimson Text">Crimson Text</option>
          </optgroup>
          
          {/* Display/Decorative Fonts */}
          <optgroup label="Display & Decorative">
            <option value="Impact">Impact</option>
            <option value="Comic Sans MS">Comic Sans MS</option>
            <option value="Papyrus">Papyrus</option>
            <option value="Chalkduster">Chalkduster</option>
            <option value="Marker Felt">Marker Felt</option>
            <option value="Bradley Hand">Bradley Hand</option>
            <option value="Brush Script MT">Brush Script MT</option>
            <option value="Lobster">Lobster</option>
            <option value="Pacifico">Pacifico</option>
            <option value="Dancing Script">Dancing Script</option>
            <option value="Great Vibes">Great Vibes</option>
            <option value="Satisfy">Satisfy</option>
            <option value="Kaushan Script">Kaushan Script</option>
            <option value="Righteous">Righteous</option>
            <option value="Fredoka One">Fredoka One</option>
            <option value="Bangers">Bangers</option>
            <option value="Chewy">Chewy</option>
            <option value="Luckiest Guy">Luckiest Guy</option>
          </optgroup>
          
          {/* Monospace Fonts */}
          <optgroup label="Monospace">
            <option value="Courier New">Courier New</option>
            <option value="Lucida Console">Lucida Console</option>
            <option value="Monaco">Monaco</option>
            <option value="Consolas">Consolas</option>
            <option value="Source Code Pro">Source Code Pro</option>
            <option value="Fira Code">Fira Code</option>
            <option value="JetBrains Mono">JetBrains Mono</option>
          </optgroup>
          
          {/* Handwriting Fonts */}
          <optgroup label="Handwriting">
            <option value="Caveat">Caveat</option>
            <option value="Kalam">Kalam</option>
            <option value="Indie Flower">Indie Flower</option>
            <option value="Shadows Into Light">Shadows Into Light</option>
            <option value="Amatic SC">Amatic SC</option>
            <option value="Permanent Marker">Permanent Marker</option>
            <option value="Rock Salt">Rock Salt</option>
            <option value="Cedarville Cursive">Cedarville Cursive</option>
            <option value="Handlee">Handlee</option>
          </optgroup>
        </select>
      </div>
      
      {/* Font Size */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Font Size</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTextPropertyChange('fontSize', Math.max(8, (selectedElement?.fontSize || 24) - 2))}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-sm font-bold"
          >
            -
          </button>
          <span className="flex-1 text-center text-sm font-medium text-gray-700">
            {selectedElement?.fontSize || 24}px
          </span>
          <button
            onClick={() => onTextPropertyChange('fontSize', Math.min(200, (selectedElement?.fontSize || 24) + 2))}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-sm font-bold"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Text Color */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Text Color</h4>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={selectedElement?.fill || '#000000'}
            onChange={(e) => onTextPropertyChange('fill', e.target.value)}
            className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
            title="Choose text color"
          />
          <span className="text-xs text-gray-500 font-mono">
            {selectedElement?.fill || '#000000'}
          </span>
        </div>
      </div>
      
      {/* Text Alignment */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Alignment</h4>
        <div className="grid grid-cols-3 gap-1">
          {[
            { value: 'left', icon: '⫷', label: 'Left' },
            { value: 'center', icon: '⫸', label: 'Center' },
            { value: 'right', icon: '⫹', label: 'Right' }
          ].map((align) => (
            <button
              key={align.value}
              onClick={() => onTextPropertyChange('align', align.value)}
              className={`p-2 rounded-lg text-sm transition-colors duration-200 ${
                (selectedElement?.align || 'left') === align.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={align.label}
            >
              <div className="text-lg">{align.icon}</div>
              <div className="text-xs">{align.label}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Vertical Alignment */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Vertical Alignment</h4>
        <div className="grid grid-cols-3 gap-1">
          {[
            { value: 'top', icon: '⊤', label: 'Top' },
            { value: 'middle', icon: '⊟', label: 'Middle' },
            { value: 'bottom', icon: '⊥', label: 'Bottom' }
          ].map((valign) => (
            <button
              key={valign.value}
              onClick={() => onTextPropertyChange('verticalAlign', valign.value)}
              className={`p-2 rounded-lg text-sm transition-colors duration-200 ${
                (selectedElement?.verticalAlign || 'top') === valign.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={valign.label}
            >
              <div className="text-lg">{valign.icon}</div>
              <div className="text-xs">{valign.label}</div>
            </button>
          ))}
        </div>
      </div>
      
      {/* Text Style */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Text Style</h4>
        <div className="flex flex-wrap gap-1">
          {[
            { value: 'normal', label: 'Normal' },
            { value: 'bold', label: 'Bold' },
            { value: 'italic', label: 'Italic' }
          ].map((style) => (
            <button
              key={style.value}
              onClick={() => onTextPropertyChange('fontStyle', style.value)}
              className={`px-2 py-1 rounded text-xs transition-colors duration-200 ${
                (selectedElement?.fontStyle || 'normal') === style.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Text Decoration */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Decoration</h4>
        <div className="flex flex-wrap gap-1">
          {[
            { value: 'none', label: 'None' },
            { value: 'underline', label: 'Underline' },
            { value: 'line-through', label: 'Strike' }
          ].map((decoration) => (
            <button
              key={decoration.value}
              onClick={() => onTextPropertyChange('textDecoration', decoration.value)}
              className={`px-2 py-1 rounded text-xs transition-colors duration-200 ${
                (selectedElement?.textDecoration || 'none') === decoration.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {decoration.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Line Height */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Line Height</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTextPropertyChange('lineHeight', Math.max(0.5, (selectedElement?.lineHeight || 1.2) - 0.1))}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-sm font-bold"
          >
            -
          </button>
          <span className="flex-1 text-center text-sm font-medium text-gray-700">
            {((selectedElement?.lineHeight || 1.2) * 100).toFixed(0)}%
          </span>
          <button
            onClick={() => onTextPropertyChange('lineHeight', Math.min(3, (selectedElement?.lineHeight || 1.2) + 0.1))}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-sm font-bold"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Letter Spacing */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Letter Spacing</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTextPropertyChange('letterSpacing', Math.max(-5, (selectedElement?.letterSpacing || 0) - 0.5))}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-sm font-bold"
          >
            -
          </button>
          <span className="flex-1 text-center text-sm font-medium text-gray-700">
            {selectedElement?.letterSpacing || 0}px
          </span>
          <button
            onClick={() => onTextPropertyChange('letterSpacing', Math.min(20, (selectedElement?.letterSpacing || 0) + 0.5))}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-sm font-bold"
          >
            +
          </button>
        </div>
      </div>
      
      {/* Padding */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Padding</h4>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTextPropertyChange('padding', Math.max(0, (selectedElement?.padding || 0) - 2))}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-sm font-bold"
          >
            -
          </button>
          <span className="flex-1 text-center text-sm font-medium text-gray-700">
            {selectedElement?.padding || 0}px
          </span>
          <button
            onClick={() => onTextPropertyChange('padding', Math.min(50, (selectedElement?.padding || 0) + 2))}
            className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-sm font-bold"
          >
            +
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div 
      ref={sidebarRef}
      className={`
      w-full sm:w-80 lg:w-96 
      h-full 
      backdrop-blur-xl bg-gradient-to-b from-white/20 to-white/10
      border-r border-white/20
      overflow-y-auto
      relative
      ${isPreservingScroll ? 'scroll-preserve' : ''}
      `}
      onScroll={() => {
        const sidebar = sidebarRef.current
        if (!sidebar) return

        const scrollTop = sidebar.scrollTop
        const scrollHeight = sidebar.scrollHeight
        const clientHeight = sidebar.clientHeight
        
        // Determine scroll direction
        if (scrollTop > (sidebar.lastScrollTop || 0)) {
          setScrollDirection('down')
        } else {
          setScrollDirection('up')
        }
        
        // Show scroll indicator
        setIsScrolling(true)
        
        // Clear timeout and hide indicator
        clearTimeout(sidebar.scrollTimeout)
        sidebar.scrollTimeout = setTimeout(() => {
          setIsScrolling(false)
        }, 1000)
        
        sidebar.lastScrollTop = scrollTop
      }}
    >
      {/* Scroll Direction Indicator */}
      {isScrolling && (
        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 z-10 transition-opacity duration-300 ${
          scrollDirection === 'down' ? 'animate-pulse' : 'animate-bounce'
        }`} />
      )}
      
      <div className="p-4 space-y-4">
        
        {/* Mobile & Landscape Header with Close Button */}
        <div className="flex items-center justify-between md:hidden">
          <div className="text-left">
            <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Design Tools
            </h2>
            <p className="text-sm text-gray-600">Tools & options</p>
          </div>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('closeMobileSidebar'))}
            className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl transition-all duration-200 min-w-[48px] min-h-[48px] flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Desktop Header */}
        <div className="hidden md:block text-center py-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Design Tools
          </h2>
          <p className="text-sm text-gray-600 mt-1">Tools & options</p>
        </div>

        {/* Banner Specifications */}
        <GlassCard>
          <button
            onClick={() => toggleSection('specifications')}
            className="w-full p-4 sm:p-4 flex items-center justify-between hover:bg-white/20 active:bg-white/30 rounded-2xl transition-all duration-200 min-h-[56px] transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                  {productType === 'banner' && 'Specifications'}
                  {productType === 'tin' && 'Tin Specifications'}
                  {productType === 'tent' && 'Tent Specifications'}
                </h3>
                <p className="text-xs text-gray-500">
                  {productType === 'banner' && 'Banner details'}
                  {productType === 'tin' && 'Tin details'}
                  {productType === 'tent' && 'Tent details'}
                </p>
              </div>
            </div>
            {expandedSections.specifications ? 
              <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            }
          </button>

          {expandedSections.specifications && (
            <div className="px-4 pb-4 space-y-3">
              {/* Product Type Selector */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3">
                <div className="text-sm font-medium text-gray-800 mb-3">
                  {productType === 'banner' && 'Banner Type'}
                  {productType === 'tin' && 'Tin Finish'}
                  {productType === 'tent' && 'Tent Material'}
                </div>
                {productType === 'tent' ? (
                  <div className="w-full px-3 py-2 bg-white/50 border border-white/30 rounded-lg text-sm text-gray-700">
                    6oz Tent Fabric (600x600 denier)
                  </div>
                ) : (
                <select 
                  value={productType === 'tin' ? (tinSpecs?.finish || '') : (bannerSpecs?.id || '')}
                  onChange={(e) => {
                    if (productType === 'tin') {
                      handleTinSpecChange('finish', e.target.value)
                    } else {
                      onChangeBannerType?.(e.target.value)
                    }
                  }}
                  className="w-full px-3 py-2 bg-white/50 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {productType === 'banner' && bannerTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                  {productType === 'tin' && (
                    <>
                      <option value="silver">Silver</option>
                      <option value="black">Black</option>
                      <option value="gold">Gold</option>
                    </>
                  )}
                </select>
                )}
              </div>

              {/* Tin-Specific Options */}
              {productType === 'tin' && (
                <>
                  {/* Surface Coverage */}
                  <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3">
                    <div className="text-sm font-medium text-gray-800 mb-3">Surface Coverage</div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="surface-coverage" 
                          value="front-back" 
                          checked={tinSpecs?.surfaceCoverage === 'front-back'}
                          onChange={(e) => handleTinSpecChange('surfaceCoverage', e.target.value)}
                          className="text-blue-500" 
                        />
                        <span className="text-sm text-gray-700">Front + Back Only</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="surface-coverage" 
                          value="all-sides" 
                          checked={tinSpecs?.surfaceCoverage === 'all-sides'}
                          onChange={(e) => handleTinSpecChange('surfaceCoverage', e.target.value)}
                          className="text-blue-500" 
                        />
                        <span className="text-sm text-gray-700">All Sides (Front, Back, Inside, Lid)</span>
                      </label>
                    </div>
                  </div>

                  {/* Printing Method */}
                  <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3">
                    <div className="text-sm font-medium text-gray-800 mb-3">Printing Method</div>
                    <select 
                      value={tinSpecs?.printingMethod || ''}
                      onChange={(e) => handleTinSpecChange('printingMethod', e.target.value)}
                      className="w-full px-3 py-2 bg-white/50 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    >
                      <option value="premium-vinyl">Premium Vinyl Stickers</option>
                      <option value="premium-clear-vinyl">Premium Clear Vinyl Stickers</option>
                    </select>
                  </div>
                </>
              )}

              {/* Tent-Specific Options */}
              {productType === 'tent' && (
                <>
                  {/* Design Coverage */}
                  <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3">
                    <div className="text-sm font-medium text-gray-800 mb-3">Design Coverage</div>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="tentDesignOption" 
                          value="canopy-only"
                          checked={tentDesignOption === 'canopy-only'}
                          className="text-blue-500"
                          onChange={(e) => handleTentDesignOptionChange(e.target.value)}
                        />
                        <span className="text-sm text-gray-700">Canopy Only (4 surfaces)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="tentDesignOption" 
                          value="canopy-backwall"
                          checked={tentDesignOption === 'canopy-backwall'}
                          className="text-blue-500"
                          onChange={(e) => handleTentDesignOptionChange(e.target.value)}
                        />
                        <span className="text-sm text-gray-700">Canopy + Back Wall (5 surfaces)</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="tentDesignOption" 
                          value="all-sides"
                          checked={tentDesignOption === 'all-sides'}
                          className="text-blue-500"
                          onChange={(e) => handleTentDesignOptionChange(e.target.value)}
                        />
                        <span className="text-sm text-gray-700">All Sides (7 surfaces)</span>
                      </label>
                    </div>
                  </div>

                  {/* Surface Selector */}
                  <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3">
                    <div className="text-sm font-medium text-gray-800 mb-3">Design Surface</div>
                    <select
                      key={`tent-surface-selector-${tentDesignOption}`}
                      className="w-full px-3 py-2 bg-white/50 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      value={currentSurface}
                      onChange={(e) => {
                        onSurfaceChange?.(e.target.value)
                      }}
                    >
                      {availableTentSurfaces.map((surface) => (
                        <option key={surface.key} value={surface.key}>
                          {surface.name}
                        </option>
                      ))}
                    </select>
                    <div className="mt-2 text-xs text-gray-600">
                      {availableTentSurfaces.length} surface{availableTentSurfaces.length !== 1 ? 's' : ''} available
                    </div>
                  </div>

                  {/* Tent Specifications */}
                  <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3">
                    <div className="text-sm font-medium text-gray-800 mb-3">Tent Specifications</div>
                    <div className="space-y-2 text-xs text-gray-600">
                      <div>• 10x10 ft Event Tent (120"w x 120"d x 124.5"-137"h)</div>
                      <div>• 6oz Tent Fabric (600x600 denier)</div>
                      <div>• 40mm Aluminum Hex Hardware (1mm wall thickness)</div>
                      <div>• Dye-Sublimation Graphic (Scratch & Weather Resistant)</div>
                      <div>• Weight: 51 lbs (43 lbs Hardware + 8 lbs Canopy)</div>
                    </div>
                  </div>
                </>
              )}

              {/* Canvas Size Selector - Only for banners */}
              {productType === 'banner' && (
                <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3">
                  <div className="text-sm font-medium text-gray-800 mb-3">Banner Size</div>
                
                {/* Size Category Tabs - Only show for banners */}
                  <div className="flex gap-1 mb-3">
                    <button
                      onClick={() => setSizeCategory('landscape')}
                      className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        sizeCategory === 'landscape' 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-white/20 text-gray-600 hover:bg-white/30 hover:shadow-md'
                      }`}
                    >
                      Landscape
                    </button>
                    <button
                      onClick={() => setSizeCategory('portrait')}
                      className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        sizeCategory === 'portrait' 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-white/20 text-gray-600 hover:bg-white/30 hover:shadow-md'
                      }`}
                    >
                      Portrait
                    </button>
                    <button
                      onClick={() => setSizeCategory('custom')}
                      className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        sizeCategory === 'custom' 
                          ? 'bg-blue-500 text-white shadow-lg' 
                          : 'bg-white/20 text-gray-600 hover:bg-white/30 hover:shadow-md'
                      }`}
                    >
                      Custom
                    </button>
                  </div>
                )

                {/* Size Options */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {bannerSizes
                    .filter(size => productType === 'banner' ? size.category === sizeCategory : true)
                    .map((size) => (
                      <button
                        key={size.name}
                        onClick={() => onChangeCanvasSize?.(size.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          canvasSize.width === size.width && canvasSize.height === size.height
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span>{size.name.replace(' (Landscape)', '').replace(' (Portrait)', '')}</span>
                          <span className="text-xs opacity-75">
                            {size.width}×{size.height}px
                          </span>
                        </div>
                      </button>
                    ))}
                </div>

                {/* Custom Size Input - Only for banners */}
                {productType === 'banner' && sizeCategory === 'custom' && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="mb-3">
                      <div className="text-xs text-gray-600 mb-1">Current Custom Size</div>
                      <div className="text-sm font-medium text-gray-800 bg-white/40 rounded-lg px-3 py-2">
                        {canvasSize.width} × {canvasSize.height}px
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Width (px)</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1 bg-white/50 border border-white/30 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:border-white/50 active:border-blue-500/50"
                          placeholder="800"
                          defaultValue={canvasSize.width}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Height (px)</label>
                        <input
                          type="number"
                          className="w-full px-2 py-1 bg-white/50 border border-white/30 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:border-white/50 active:border-blue-500/50"
                          placeholder="400"
                          defaultValue={canvasSize.height}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const widthInput = document.querySelector('input[placeholder="800"]')
                        const heightInput = document.querySelector('input[placeholder="400"]')
                        if (widthInput && heightInput && widthInput.value.trim() && heightInput.value.trim()) {
                          const width = parseInt(widthInput.value.trim())
                          const height = parseInt(heightInput.value.trim())
                          if (!isNaN(width) && !isNaN(height) && width >= 100 && width <= 5000 && height >= 100 && height <= 5000) {
                            onChangeCanvasSize?.(`Custom ${width}x${height}`)
                            // Update the input values to reflect the new canvas size
                            widthInput.value = width.toString()
                            heightInput.value = height.toString()
                          }
                        }
                      }}
                      className="w-full mt-2 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 text-green-700 border border-green-400/30 rounded text-xs font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-green-500/50 shadow-sm hover:shadow-md"
                    >
                      Apply Custom Size
                    </button>
                  </div>
                )}
              </div>
              )}

              {/* Current Specifications */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Canvas:</span>
                  <span className="font-medium text-gray-800">{canvasSize.width} × {canvasSize.height}px</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Orientation:</span>
                  <span className={`font-medium px-2 py-1 rounded text-xs ${
                    canvasOrientation === 'landscape' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {canvasOrientation === 'landscape' ? 'Landscape' : 'Portrait'}
                  </span>
                </div>
                
                {productType === 'banner' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-800">{bannerSpecs?.name || 'Custom'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium text-gray-800">{bannerSpecs?.category || 'Custom'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Material:</span>
                      <span className="font-medium text-gray-800">{bannerSpecs?.material || 'Premium'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Finish:</span>
                      <span className="font-medium text-gray-800">{bannerSpecs?.finish || 'Standard'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Specs:</span>
                      <span className="font-medium text-gray-800">{bannerSpecs?.specs || 'Standard'}</span>
                    </div>
                  </>
                )}

                {productType === 'tin' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-medium text-gray-800">Business Card Tin</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tin Finish:</span>
                      <span className="font-medium text-gray-800 capitalize">{tinSpecs?.finish || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Surface Coverage:</span>
                      <span className="font-medium text-gray-800">
                        {tinSpecs?.surfaceCoverage === 'front-back' ? 'Front + Back' : 'All Sides'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Printing:</span>
                      <span className="font-medium text-gray-800">
                        {tinSpecs?.printingMethod === 'premium-vinyl' ? 'Premium Vinyl Stickers' : 'Premium Clear Vinyl Stickers'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Dimensions:</span>
                      <span className="font-medium text-gray-800">3.74" × 2.25" × 0.78"</span>
                    </div>
                  </>
                )}

                {productType === 'tent' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Product:</span>
                      <span className="font-medium text-gray-800">Tradeshow Tent</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tent Size:</span>
                      <span className="font-medium text-gray-800">10×10 ft</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Material:</span>
                      <span className="font-medium text-gray-800">6oz Tent Fabric</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Components:</span>
                      <span className="font-medium text-gray-800">Tent + Accessories</span>
                    </div>
                  </>
                )}
                
                {/* Product-specific description and uses */}
                {productType === 'banner' && bannerSpecs?.description && (
                  <div className="pt-2 border-t border-white/20">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {bannerSpecs.description}
                    </p>
                  </div>
                )}

                {productType === 'tin' && (
                  <div className="pt-2 border-t border-white/20">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Premium aluminum business card tins with custom vinyl stickers. Perfect for memorable networking and professional branding.
                    </p>
                  </div>
                )}

                {productType === 'tent' && (
                  <div className="pt-2 border-t border-white/20">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      Professional tradeshow tents with custom graphics. Ideal for events, conferences, and outdoor marketing.
                    </p>
                  </div>
                )}
                
                {productType === 'banner' && bannerSpecs?.uses && bannerSpecs.uses.length > 0 && (
                  <div className="pt-2 border-t border-white/20">
                    <p className="text-xs font-medium text-gray-700 mb-1">Best for:</p>
                    <div className="flex flex-wrap gap-1">
                      {bannerSpecs.uses.map((use, index) => (
                        <span 
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full"
                        >
                          {use}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {productType === 'tin' && (
                  <div className="pt-2 border-t border-white/20">
                    <p className="text-xs font-medium text-gray-700 mb-1">Best for:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Networking</span>
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Professional Branding</span>
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Memorable Business Cards</span>
                    </div>
                  </div>
                )}

                {productType === 'tent' && (
                  <div className="pt-2 border-t border-white/20">
                    <p className="text-xs font-medium text-gray-700 mb-1">Best for:</p>
                    <div className="flex flex-wrap gap-1">
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Trade Shows</span>
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Outdoor Events</span>
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Marketing</span>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}
        </GlassCard>

        {/* Image Upload */}
        <GlassCard>
          <button
            onClick={() => toggleSection('upload')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/20 active:bg-white/30 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Upload</h3>
                <p className="text-xs text-gray-500">Your images</p>
              </div>
            </div>
            {expandedSections.upload ? 
              <ChevronUp className="w-4 h-4 text-gray-500" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </button>

          {expandedSections.upload && (
            <div className="px-4 pb-4 space-y-4">
              {/* Dropzone */}
              <div 
                {...getRootProps()} 
                onClick={(e) => {
                  console.log('Dropzone clicked')
                  // Ensure the click event triggers the file input
                  e.stopPropagation()
                }}
                className={`
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-orange-500/50
                  ${isDragActive 
                    ? 'border-orange-400 bg-orange-50/50 shadow-lg' 
                    : 'border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/20 hover:shadow-md'
                  }
                `}
              >
                <input {...getInputProps()} />
                <Upload className={`w-8 h-8 mx-auto mb-3 ${isDragActive ? 'text-orange-400' : 'text-gray-400'}`} />
                <p className="text-sm text-gray-600 mb-1">
                  {isDragActive ? 'Drop images here...' : 'Drag & drop images here'}
                </p>
                <p className="text-xs text-gray-500">or click to browse</p>
                <p className="text-xs text-blue-500 mt-1 font-medium">Click to upload</p>
              </div>

              {/* Browse Files Button */}
              <button
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.multiple = true
                  input.style.display = 'none'
                  
                  input.onchange = (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      const filesArray = Array.from(e.target.files)
                      onDrop(filesArray)
                    }
                  }
                  
                  document.body.appendChild(input)
                  input.click()
                  
                  setTimeout(() => {
                    if (document.body.contains(input)) {
                      document.body.removeChild(input)
                    }
                  }, 1000)
                }}
                className="w-full p-2 bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 text-purple-700 border border-purple-400/30 backdrop-blur-sm rounded-lg transition-all duration-200 text-sm font-medium transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm hover:shadow-md"
              >
                Browse Files
              </button>

              {/* Uploaded Images */}
              {uploadedImages.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <button
                          onClick={() => onAddAsset(image.url, image.name)}
                          className="aspect-square relative group overflow-hidden rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 border border-white/30 w-full"
                        >
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                          <div className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                            {image.name}
                          </div>
                        </button>
                        <button
                          onClick={() => removeUploadedImage(index)}
                          className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                          title="Remove image"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Surface Navigation for Tins */}
              {productType === 'tin' && (
                <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3">
                  <div className="text-sm font-medium text-gray-800 mb-3">Surface Navigation</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleSurfaceChange('front')}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        currentSurface === 'front'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                      }`}
                    >
                      Front
                    </button>
                    <button
                      onClick={() => handleSurfaceChange('back')}
                      className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                        currentSurface === 'back'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                      }`}
                    >
                      Back
                    </button>
                    {tinSpecs?.surfaceCoverage === 'all-sides' && (
                      <>
                        <button
                          onClick={() => handleSurfaceChange('inside')}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                            currentSurface === 'inside'
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                          }`}
                        >
                          Inside
                        </button>
                        <button
                          onClick={() => handleSurfaceChange('lid')}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                            currentSurface === 'lid'
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                          }`}
                        >
                          Lid
                        </button>
                      </>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-600 text-center">
                    Currently editing: <span className="font-medium capitalize">{currentSurface}</span> surface
                  </div>
                </div>
              )}

              {/* Surface Navigation for Tents */}
              {productType === 'tent' && (
                <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3">
                  <div className="text-sm font-medium text-gray-800 mb-3">Surface Navigation</div>
                  
                  {/* Canopy Surfaces */}
                  <div className="mb-3">
                    <div className="text-xs font-medium text-gray-600 mb-2">Canopy Surfaces</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSurfaceChange('canopy_front')}
                        className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          currentSurface === 'canopy_front'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                        }`}
                      >
                        Front
                      </button>
                      <button
                        onClick={() => handleSurfaceChange('canopy_back')}
                        className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          currentSurface === 'canopy_back'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                        }`}
                      >
                        Back
                      </button>
                      <button
                        onClick={() => handleSurfaceChange('canopy_left')}
                        className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          currentSurface === 'canopy_left'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                        }`}
                      >
                        Left
                      </button>
                      <button
                        onClick={() => handleSurfaceChange('canopy_right')}
                        className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          currentSurface === 'canopy_right'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                        }`}
                      >
                        Right
                      </button>
                    </div>
                  </div>

                  {/* Sidewalls and Backwall */}
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">Sidewalls & Backwall</div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleSurfaceChange('sidewall_left')}
                        className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          currentSurface === 'sidewall_left'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                        }`}
                      >
                        Left Wall
                      </button>
                      <button
                        onClick={() => handleSurfaceChange('sidewall_right')}
                        className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          currentSurface === 'sidewall_right'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                        }`}
                      >
                        Right Wall
                      </button>
                      <button
                        onClick={() => handleSurfaceChange('backwall')}
                        className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                          currentSurface === 'backwall'
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'bg-white/20 text-gray-700 hover:bg-white/30 hover:shadow-md'
                        }`}
                      >
                        Back Wall
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-gray-600 text-center">
                    Currently editing: <span className="font-medium capitalize">{currentSurface.replace('_', ' ')}</span> surface
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>

        {/* Text Editor */}
        <GlassCard>
          <button
            onClick={() => toggleSection('text')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/20 active:bg-white/30 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Text</h3>
                <p className="text-xs text-gray-500">Add & edit text</p>
              </div>
            </div>
            {expandedSections.text ? 
              <ChevronUp className="w-4 h-4 text-gray-500" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </button>

          {expandedSections.text && (
            <div className="px-4 pb-4 space-y-4">
              {/* Multi-line Text Input */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Add Text</h4>
                <div className="space-y-2">
                  <textarea
                    placeholder="Enter text... (Press Enter for new lines, Ctrl+Enter to add)"
                    className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    onKeyDown={(e) => {
                      // Allow Enter for new lines, Ctrl+Enter or Cmd+Enter to add text
                      if ((e.key === 'Enter' && (e.ctrlKey || e.metaKey)) && e.target.value.trim()) {
                        e.preventDefault();
                        handleTextAdd(e.target.value.trim())
                        e.target.value = ''
                      }
                      // Allow Shift+Enter for new lines (default behavior)
                    }}
                  />
                  <p className="text-xs text-gray-500">
                    Press Enter for new lines • Ctrl+Enter to add text
                  </p>
                  <button
                    onClick={() => {
                      const textarea = document.querySelector('textarea[placeholder*="Enter text"]')
                      if (textarea && textarea.value.trim()) {
                        handleTextAdd(textarea.value.trim())
                        textarea.value = ''
                      }
                    }}
                    className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    Add Text
                  </button>
                </div>
              </div>
              
              {/* Font Family */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Font Family</h4>
                <select
                  onChange={(e) => onTextPropertyChange('fontFamily', e.target.value)}
                  value={selectedElement?.fontFamily || 'Arial'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {/* Sans-serif Fonts */}
                  <optgroup label="Sans-serif">
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Verdana">Verdana</option>
                    <option value="Tahoma">Tahoma</option>
                    <option value="Trebuchet MS">Trebuchet MS</option>
                    <option value="Calibri">Calibri</option>
                    <option value="Segoe UI">Segoe UI</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Source Sans Pro">Source Sans Pro</option>
                    <option value="Nunito">Nunito</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Inter">Inter</option>
                  </optgroup>
                  
                  {/* Serif Fonts */}
                  <optgroup label="Serif">
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Garamond">Garamond</option>
                    <option value="Book Antiqua">Book Antiqua</option>
                    <option value="Palatino">Palatino</option>
                    <option value="Times">Times</option>
                    <option value="Baskerville">Baskerville</option>
                    <option value="Playfair Display">Playfair Display</option>
                    <option value="Merriweather">Merriweather</option>
                    <option value="Lora">Lora</option>
                    <option value="Crimson Text">Crimson Text</option>
                  </optgroup>
                  
                  {/* Display/Decorative Fonts */}
                  <optgroup label="Display & Decorative">
                    <option value="Impact">Impact</option>
                    <option value="Comic Sans MS">Comic Sans MS</option>
                    <option value="Papyrus">Papyrus</option>
                    <option value="Chalkduster">Chalkduster</option>
                    <option value="Marker Felt">Marker Felt</option>
                    <option value="Bradley Hand">Bradley Hand</option>
                    <option value="Brush Script MT">Brush Script MT</option>
                    <option value="Lobster">Lobster</option>
                    <option value="Pacifico">Pacifico</option>
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Great Vibes">Great Vibes</option>
                    <option value="Satisfy">Satisfy</option>
                    <option value="Kaushan Script">Kaushan Script</option>
                    <option value="Righteous">Righteous</option>
                    <option value="Fredoka One">Fredoka One</option>
                    <option value="Bangers">Bangers</option>
                    <option value="Chewy">Chewy</option>
                    <option value="Luckiest Guy">Luckiest Guy</option>
                  </optgroup>
                  
                  {/* Monospace Fonts */}
                  <optgroup label="Monospace">
                    <option value="Courier New">Courier New</option>
                    <option value="Lucida Console">Lucida Console</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Consolas">Consolas</option>
                    <option value="Source Code Pro">Source Code Pro</option>
                    <option value="Fira Code">Fira Code</option>
                    <option value="JetBrains Mono">JetBrains Mono</option>
                  </optgroup>
                  
                  {/* Handwriting Fonts */}
                  <optgroup label="Handwriting">
                    <option value="Caveat">Caveat</option>
                    <option value="Kalam">Kalam</option>
                    <option value="Indie Flower">Indie Flower</option>
                    <option value="Shadows Into Light">Shadows Into Light</option>
                    <option value="Amatic SC">Amatic SC</option>
                    <option value="Permanent Marker">Permanent Marker</option>
                    <option value="Rock Salt">Rock Salt</option>
                    <option value="Cedarville Cursive">Cedarville Cursive</option>
                    <option value="Kalam">Kalam</option>
                    <option value="Handlee">Handlee</option>
                  </optgroup>
                </select>
              </div>
              
              {/* Font Size */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Font Size</h4>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onTextPropertyChange('fontSize', Math.max(8, (selectedElement?.fontSize || 24) - 2))}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-sm font-bold"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-sm font-medium text-gray-700">
                    {selectedElement?.fontSize || 24}px
                  </span>
                  <button
                    onClick={() => onTextPropertyChange('fontSize', Math.min(200, (selectedElement?.fontSize || 24) + 2))}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Text Color */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Text Color</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={selectedElement?.fill || '#000000'}
                    onChange={(e) => onTextPropertyChange('fill', e.target.value)}
                    className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
                    title="Choose text color"
                  />
                  <span className="text-xs text-gray-500 font-mono">
                    {selectedElement?.fill || '#000000'}
                  </span>
                </div>
              </div>
              
              {/* Text Stroke/Outline */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Text Outline</h4>
                
                {/* Stroke Toggle */}
                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!(selectedElement?.stroke && selectedElement?.strokeWidth > 0)}
                      onChange={(e) => {
                        preserveScrollPosition(() => {
                          if (e.target.checked) {
                            onTextPropertyChange('stroke', selectedElement?.stroke || '#000000')
                            onTextPropertyChange('strokeWidth', selectedElement?.strokeWidth || 2)
                          } else {
                            onTextPropertyChange('stroke', null)
                            onTextPropertyChange('strokeWidth', 0)
                          }
                        })
                      }}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="text-sm text-gray-700">Enable Outline</span>
                  </label>
                </div>
                
                {/* Stroke Color and Width - Always rendered to prevent layout shifts */}
                <div className={`space-y-2 pl-6 transition-all duration-200 ${selectedElement?.stroke && selectedElement?.strokeWidth > 0 ? 'opacity-100 max-h-32' : 'opacity-50 max-h-0 overflow-hidden'}`}>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Color:</label>
                    <input
                      type="color"
                      value={selectedElement?.stroke || '#000000'}
                      onChange={(e) => preserveScrollPosition(() => onTextPropertyChange('stroke', e.target.value))}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      title="Choose outline color"
                      disabled={!(selectedElement?.stroke && selectedElement?.strokeWidth > 0)}
                    />
                    <span className="text-xs text-gray-500 font-mono">
                      {selectedElement?.stroke || '#000000'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-600">Width:</label>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          preserveScrollPosition(() => {
                            const currentWidth = selectedElement?.strokeWidth || 0
                            const newWidth = Math.max(0, currentWidth - 1)
                            onTextPropertyChange('strokeWidth', newWidth)
                            // If width becomes 0, also disable stroke
                            if (newWidth === 0) {
                              onTextPropertyChange('stroke', null)
                            }
                          })
                        }}
                        className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!(selectedElement?.stroke && selectedElement?.strokeWidth > 0)}
                      >
                        -
                      </button>
                      <span className="text-xs text-gray-700 min-w-[20px] text-center">
                        {selectedElement?.strokeWidth || 0}px
                      </span>
                      <button
                        onClick={() => {
                          preserveScrollPosition(() => {
                            const currentWidth = selectedElement?.strokeWidth || 0
                            const newWidth = Math.min(20, currentWidth + 1)
                            onTextPropertyChange('strokeWidth', newWidth)
                            // If width becomes > 0 and no stroke color, set default stroke
                            if (newWidth > 0 && !selectedElement?.stroke) {
                              onTextPropertyChange('stroke', '#000000')
                            }
                          })
                        }}
                        className="w-6 h-6 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded flex items-center justify-center text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!(selectedElement?.stroke && selectedElement?.strokeWidth > 0)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Text Alignment */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Alignment</h4>
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { value: 'left', icon: '⫷', label: 'Left' },
                    { value: 'center', icon: '⫸', label: 'Center' },
                    { value: 'right', icon: '⫹', label: 'Right' }
                  ].map((align) => (
                    <button
                      key={align.value}
                      onClick={() => onTextPropertyChange('align', align.value)}
                      className={`p-2 rounded-lg text-sm transition-colors duration-200 ${
                        (selectedElement?.align || 'left') === align.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title={align.label}
                    >
                      <div className="text-lg">{align.icon}</div>
                      <div className="text-xs">{align.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Text Style */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Text Style</h4>
                <div className="flex flex-wrap gap-1">
                  {[
                    { value: 'normal', label: 'Normal' },
                    { value: 'bold', label: 'Bold' },
                    { value: 'italic', label: 'Italic' }
                  ].map((style) => (
                    <button
                      key={style.value}
                      onClick={() => onTextPropertyChange('fontStyle', style.value)}
                      className={`px-2 py-1 rounded text-xs transition-colors duration-200 ${
                        (selectedElement?.fontStyle || 'normal') === style.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* QR Code Generator */}
        <GlassCard>
          <button
            onClick={() => toggleSection('qrcode')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/20 active:bg-white/30 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-green-500">
                <QrCode className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">QR Code</h3>
                <p className="text-xs text-gray-500">Generate scannable QR codes</p>
              </div>
            </div>
            {expandedSections.qrcode ? 
              <ChevronUp className="w-4 h-4 text-gray-500" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </button>

          {expandedSections.qrcode && (
            <div className="px-4 pb-4 space-y-4">
              {/* URL Input */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Website URL</h4>
                <div className="flex flex-col gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com"
                    defaultValue="https://buyprintz.com"
                    onKeyDown={(e) => {
                      e.stopPropagation()
                      if (e.key === 'Enter' && e.target.value.trim()) {
                        if (e.target.value.trim().startsWith('http')) {
                          handleQRCodeAdd(e.target.value.trim(), qrColor, qrBackgroundColor)
                          e.target.value = ''
                        } else {
                          alert('Please enter a valid URL starting with http:// or https://')
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => {
                      const input = document.querySelector('input[placeholder="https://example.com"]')
                      if (input && input.value.trim()) {
                        if (input.value.trim().startsWith('http')) {
                          handleQRCodeAdd(input.value.trim(), qrColor, qrBackgroundColor)
                          input.value = ''
                        } else {
                          alert('Please enter a valid URL starting with http:// or https://')
                        }
                      }
                    }}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                  >
                    <QrCode className="w-4 h-4" />
                    Generate
                  </button>
                </div>
              </div>
              
              {/* QR Code Colors */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700">QR Code Colors</h4>
                
                {/* QR Code Color */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-600 flex items-center gap-2">
                    <Palette className="w-3 h-3" />
                    QR Code Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
                      title="Choose QR code color"
                    />
                    <span className="text-xs text-gray-500 font-mono">
                      {qrColor}
                    </span>
                  </div>
                </div>
                
                {/* Background Color */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-600 flex items-center gap-2">
                    <Palette className="w-3 h-3" />
                    Background Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={qrBackgroundColor}
                      onChange={(e) => setQrBackgroundColor(e.target.value)}
                      className="w-10 h-10 rounded border-2 border-gray-300 cursor-pointer"
                      title="Choose background color"
                    />
                    <span className="text-xs text-gray-500 font-mono">
                      {qrBackgroundColor}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Preview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Preview</h4>
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="text-xs text-gray-500 mb-2">Enter URL above to generate QR code</div>
                  <div className="text-xs text-gray-500">
                    Colors: {qrColor} / {qrBackgroundColor}
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Shapes & Icons */}
        <GlassCard>
          <button
            onClick={() => toggleSection('shapes')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/20 active:bg-white/30 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-400 to-indigo-500">
                <Square className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Shapes & Icons</h3>
                <p className="text-xs text-gray-500">Basic shapes & icons</p>
              </div>
            </div>
            {expandedSections.shapes ? 
              <ChevronUp className="w-4 h-4 text-gray-500" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </button>

          {expandedSections.shapes && (
            <div className="px-4 pb-4 space-y-6">
              {/* Basic Shapes */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Basic Shapes</h4>
                <div className="grid grid-cols-4 gap-2">
                  {shapeLibrary.filter(shape => shape.category === 'basic').map((shape) => (
                    <NeumorphicButton
                      key={shape.type}
                      onClick={() => handleShapeClick(shape.type)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      <shape.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{shape.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Decorative Shapes */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Decorative Shapes</h4>
                <div className="grid grid-cols-4 gap-2">
                  {shapeLibrary.filter(shape => shape.category === 'decorative').map((shape) => (
                    <NeumorphicButton
                      key={shape.type}
                      onClick={() => handleShapeClick(shape.type)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      <shape.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{shape.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Arrows */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Arrows & Directional</h4>
                <div className="grid grid-cols-4 gap-2">
                  {shapeLibrary.filter(shape => shape.category === 'arrows').map((shape) => (
                    <NeumorphicButton
                      key={shape.type}
                      onClick={() => handleShapeClick(shape.type)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      <shape.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{shape.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Business Shapes */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Business Shapes</h4>
                <div className="grid grid-cols-4 gap-2">
                  {shapeLibrary.filter(shape => shape.category === 'business').map((shape) => (
                    <NeumorphicButton
                      key={shape.type}
                      onClick={() => handleShapeClick(shape.type)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      <shape.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{shape.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Medical Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Medical & Healthcare</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'medical').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => handleIconClick(icon.name, icon.symbol, icon.imagePath)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      {icon.imagePath ? (
                        <img 
                          src={icon.imagePath} 
                          alt={icon.name}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                      <span className="text-lg">{icon.symbol}</span>
                      )}
                      <span className="text-xs font-medium text-center leading-tight">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Technology & Business Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Technology & Business</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'technology').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => handleIconClick(icon.name, icon.symbol, icon.imagePath)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      {icon.imagePath ? (
                        <img 
                          src={icon.imagePath} 
                          alt={icon.name}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                      <span className="text-lg">{icon.symbol}</span>
                      )}
                      <span className="text-xs font-medium text-center leading-tight">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Food & Dining Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Food & Dining</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'food').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => handleIconClick(icon.name, icon.symbol, icon.imagePath)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      {icon.imagePath ? (
                        <img 
                          src={icon.imagePath} 
                          alt={icon.name}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                      <span className="text-lg">{icon.symbol}</span>
                      )}
                      <span className="text-xs font-medium text-center leading-tight">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Social Media Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Social Media</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'social').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => handleIconClick(icon.name, icon.symbol, icon.imagePath)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1 transform hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                      {icon.imagePath ? (
                        <img 
                          src={icon.imagePath} 
                          alt={icon.name}
                          className="w-6 h-6 object-contain"
                        />
                      ) : (
                        <span className="text-lg">{icon.symbol}</span>
                      )}
                      <span className="text-xs font-medium text-center leading-tight">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Professional Templates */}
        <GlassCard>
          <button
            onClick={() => toggleSection('templates')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/20 active:bg-white/30 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-400 to-green-500">
                <Copy className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Templates</h3>
                <p className="text-xs text-gray-500">Professional designs</p>
              </div>
            </div>
            {expandedSections.templates ? 
              <ChevronUp className="w-4 h-4 text-gray-500" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </button>

          {expandedSections.templates && (
            <div className="px-4 pb-4 space-y-4">
              {/* User Templates */}
              {userTemplates.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-800">My Templates</h4>
                    <span className="text-xs text-gray-500 bg-green-100 px-2 py-1 rounded-full">
                      {userTemplates.length} saved
                    </span>
                  </div>
                  <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {userTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => handleTemplateClick(template)}
                        className="w-full text-left p-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-green-500/50 group"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="font-semibold text-gray-800 text-sm group-hover:text-green-700 transition-colors duration-200 flex-1 truncate">
                            {template.name}
                          </div>
                          <span className="text-gray-400 group-hover:text-green-500 transition-colors duration-200">
                            →
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 leading-relaxed line-clamp-2">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Templates */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-gray-800">Professional Templates</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {bannerTemplates.length} templates
                  </span>
                </div>
                
                <div 
                  ref={templatesScrollRef}
                  className="space-y-2 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
                >
                  {bannerTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateClick(template)}
                      className="w-full text-left p-3 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg transition-all duration-200 border border-white/20 hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 group"
                    >
                      {/* Header with title and badges */}
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-gray-800 text-sm group-hover:text-blue-700 transition-colors duration-200 flex-1 truncate">
                          {template.name}
                        </h5>
                        <div className="flex gap-1 ml-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            template.orientation === 'landscape' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-violet-100 text-violet-700'
                          }`}>
                            {template.orientation === 'landscape' ? '📐' : '📱'}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                            {template.category.split(' ')[0]}
                          </span>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <div className="text-xs text-gray-600 leading-relaxed mb-2 line-clamp-2">
                        {template.description}
                        </div>
                      
                      {/* Features */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {template.recommendedSizes && template.recommendedSizes.length > 0 && (
                            <span className="text-gray-500">
                              {template.recommendedSizes[0]} ft
                            </span>
                          )}
                          {template.tags && template.tags.length > 0 && (
                            <span className="text-gray-400">•</span>
                          )}
                          {template.tags && template.tags.length > 0 && (
                            <span className="text-gray-500">
                              {template.tags[0]}
                            </span>
                          )}
                        </div>
                        <span className="text-gray-400 group-hover:text-blue-500 transition-colors duration-200">
                          →
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Template count and info */}
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="text-center text-xs text-gray-500">
                    <div className="mb-1">Professional designs with real assets</div>
                    <div className="flex items-center justify-center gap-2">
                      <span>✨</span>
                      <span>QR codes</span>
                      <span>•</span>
                      <span>Icons</span>
                      <span>•</span>
                      <span>Shapes</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Designs */}
        <GlassCard>
          <button
            onClick={() => toggleSection('assets')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/20 active:bg-white/30 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-400 to-purple-500">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Designs</h3>
                <p className="text-xs text-gray-500">Professional artwork collection</p>
              </div>
            </div>
            {expandedSections.assets ? 
              <ChevronUp className="w-4 h-4 text-gray-500" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </button>

          {expandedSections.assets && (
            <div className="px-4 pb-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search designs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 focus:border-purple-400/50 placeholder-gray-500 transition-all duration-200 hover:border-white/50 active:border-purple-400/50 focus:shadow-lg"
                />
              </div>

              {/* Designs Grid */}
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {getFilteredAssets(assetCategories.skins.assets).map((asset, index) => (
                  <button
                    key={index}
                    onClick={() => handleAssetClick(asset)}
                    className="aspect-square relative group overflow-hidden rounded-lg bg-white/20 hover:bg-white/30 active:bg-white/40 transition-all duration-200 border border-white/30 hover:border-purple-300/50 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500/50 shadow-sm hover:shadow-md"
                  >
                    <img
                      src={`/assets/images/${asset.file}`}
                      alt={asset.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <div className="absolute bottom-1 left-1 right-1 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate">
                      {asset.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Marketplace Section */}
        <GlassCard className="mb-4">
          <button
            onClick={() => setExpandedSections(prev => ({ ...prev, marketplace: !prev.marketplace }))}
            className="w-full flex items-center justify-between p-4 hover:bg-white/10 transition-colors duration-200 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-400 to-green-600 rounded-lg shadow-lg">
                <Store className="w-4 h-4 text-white" />
      </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">Marketplace</h3>
                <p className="text-xs text-gray-500">Premium templates</p>
              </div>
            </div>
            {expandedSections.marketplace ? 
              <ChevronUp className="w-4 h-4 text-gray-500" /> : 
              <ChevronDown className="w-4 h-4 text-gray-500" />
            }
          </button>

          {expandedSections.marketplace && (
            <div className="px-4 pb-4 space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search marketplace..."
                  value={marketplaceSearchTerm}
                  onChange={(e) => setMarketplaceSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 placeholder-gray-500 transition-all duration-200 hover:border-white/50 active:border-green-400/50 focus:shadow-lg"
                />
              </div>

              {/* Category Filter */}
              <div>
                <select
                  value={selectedMarketplaceCategory}
                  onChange={(e) => setSelectedMarketplaceCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white/30 border border-white/30 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent transition-all duration-200"
                >
                  <option value="">All Categories</option>
                  {marketplaceCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* Loading State */}
              {marketplaceLoading && (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-green-500" />
                  <span className="ml-2 text-sm text-gray-600">Loading templates...</span>
                </div>
              )}

              {/* Error State */}
              {marketplaceError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{marketplaceError}</p>
                </div>
              )}

              {/* Templates Grid */}
              {!marketplaceLoading && !marketplaceError && (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {marketplaceTemplates.length === 0 ? (
                    <div className="text-center py-8">
                      <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 text-sm">No templates found</p>
                    </div>
                  ) : (
                    marketplaceTemplates.map((template) => (
                      <div key={template.id} className="bg-white/20 border border-white/30 rounded-lg p-3 hover:bg-white/30 transition-all duration-200">
                        <div className="flex gap-3">
                          {/* Template Preview */}
                          <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {template.preview_image_url ? (
                              <img 
                                src={template.preview_image_url} 
                                alt={template.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <div className="text-gray-400 text-xs">🎨</div>
                              </div>
                            )}
                          </div>

                          {/* Template Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 text-sm line-clamp-1 mb-1">
                              {template.name}
                            </h4>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                              {template.description}
                            </p>
                            
                            {/* Template Meta */}
                            <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  {template.creators?.display_name || 'Unknown'}
                                </span>
                                <span className="flex items-center">
                                  <Tag className="w-3 h-3 mr-1" />
                                  {template.category}
                                </span>
                              </div>
                              <span className="font-semibold text-green-600">
                                ${template.price}
                              </span>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              <button
                                onClick={() => window.open(`/marketplace/template/${template.id}`, '_blank')}
                                className="flex-1 px-2 py-1 bg-white/30 hover:bg-white/40 border border-white/30 rounded text-xs text-gray-700 transition-all duration-200 flex items-center justify-center gap-1"
                              >
                                <Eye className="w-3 h-3" />
                                Preview
                              </button>
                              <button
                                onClick={() => {
                                  // Load marketplace template onto canvas (same as regular templates)
                                  if (onLoadTemplate) {
                                    onLoadTemplate({
                                      id: template.id,
                                      name: template.name,
                                      type: 'marketplace',
                                      price: template.price,
                                      templateData: template.template_data,
                                      previewImage: template.preview_image_url,
                                      creator: template.creators?.display_name,
                                      category: template.category,
                                      marketplaceTemplate: true // Flag to identify marketplace templates
                                    })
                                  }
                                }}
                                className="flex-1 px-2 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-xs transition-all duration-200 flex items-center justify-center gap-1"
                              >
                                <Sparkles className="w-3 h-3" />
                                Use
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </GlassCard>

      </div>
      

    </div>
  )
}

export default BannerSidebar
