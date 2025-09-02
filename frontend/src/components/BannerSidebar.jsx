import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { 
  Image as ImageIcon, 
  Square, 
  Circle as CircleIcon,
  Star as StarIcon,
  Triangle,
  Heart,
  Award,
  Shield,
  Info,
  ChevronDown,
  ChevronUp,
  Upload,
  Sparkles,
  Palette,
  Settings,
  Copy,
  CornerDownRight,
  FileText,
  X
} from 'lucide-react'

const BannerSidebar = ({ 
  isMobileOpen,
  bannerSpecs,
  bannerTypes = [],
  bannerSizes = [],
  canvasSize,
  canvasOrientation,

  onAddShape,
  onAddAsset,
  onAddIcon,
  onAddText,
  onLoadTemplate,
  onImageUpload,
  onTextPropertyChange,
  onShapePropertyChange,
  onChangeBannerType,
  onChangeCanvasSize,
  onToggleCanvasOrientation,
  bannerTemplates = [],
  userTemplates = [],
  selectedElement = null
}) => {
  const [expandedSections, setExpandedSections] = useState({
    specifications: false,
    shapes: false,
    text: false,
    templates: false,
    assets: false,
    upload: false
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [sizeCategory, setSizeCategory] = useState('landscape')
  const [customWidth, setCustomWidth] = useState('800')
  const [customHeight, setCustomHeight] = useState('400')
  const [uploadedImages, setUploadedImages] = useState([])



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
    { name: 'Hexagon', icon: Settings, type: 'hexagon', category: 'basic' },
    { name: 'Octagon', icon: Settings, type: 'octagon', category: 'basic' },
    
    // Decorative Shapes
    { name: 'Star', icon: StarIcon, type: 'star', category: 'decorative' },
    { name: 'Heart', icon: Heart, type: 'heart', category: 'decorative' },
    { name: 'Diamond', icon: Award, type: 'diamond', category: 'decorative' },
    { name: 'Cross', icon: Award, type: 'cross', category: 'decorative' },
    { name: 'Crown', icon: Award, type: 'crown', category: 'decorative' },
    
    // Arrows & Directional
    { name: 'Arrow Right', icon: CornerDownRight, type: 'arrow-right', category: 'arrows' },
    { name: 'Arrow Left', icon: CornerDownRight, type: 'arrow-left', category: 'arrows' },
    { name: 'Arrow Up', icon: CornerDownRight, type: 'arrow-up', category: 'arrows' },
    { name: 'Arrow Down', icon: CornerDownRight, type: 'arrow-down', category: 'arrows' },
    { name: 'Double Arrow', icon: CornerDownRight, type: 'double-arrow', category: 'arrows' },
    
    // Business Shapes
    { name: 'Badge', icon: Shield, type: 'badge', category: 'business' },
    { name: 'Certificate', icon: FileText, type: 'certificate', category: 'business' },
    { name: 'Document', icon: FileText, type: 'document', category: 'business' },
    { name: 'Checkmark', icon: FileText, type: 'checkmark', category: 'business' },
    { name: 'Target', icon: CircleIcon, type: 'target', category: 'business' }
  ]

  // Enhanced Icon Library
  const iconLibrary = [
    // Business & Professional
    { name: 'Phone', icon: FileText, symbol: '📞', category: 'business' },
    { name: 'Mail', icon: FileText, symbol: '✉️', category: 'business' },
    { name: 'Location', icon: FileText, symbol: '📍', category: 'business' },
    { name: 'Globe', icon: FileText, symbol: '🌐', category: 'business' },
    { name: 'Calendar', icon: FileText, symbol: '📅', category: 'business' },
    { name: 'Clock', icon: FileText, symbol: '🕐', category: 'business' },
    { name: 'User', icon: FileText, symbol: '👤', category: 'business' },
    { name: 'Users', icon: FileText, symbol: '👥', category: 'business' },
    { name: 'Building', icon: FileText, symbol: '🏢', category: 'business' },
    { name: 'Briefcase', icon: FileText, symbol: '💼', category: 'business' },
    { name: 'Chart', icon: FileText, symbol: '📊', category: 'business' },
    { name: 'Calculator', icon: FileText, symbol: '🧮', category: 'business' },
    
    // Awards & Recognition
    { name: 'Star', icon: StarIcon, symbol: '★', category: 'awards' },
    { name: 'Award', icon: Award, symbol: '🏆', category: 'awards' },
    { name: 'Shield', icon: Shield, symbol: '🛡️', category: 'awards' },
    { name: 'Trophy', icon: Award, symbol: '🏅', category: 'awards' },
    { name: 'Medal', icon: Award, symbol: '🥇', category: 'awards' },
    { name: 'Crown', icon: Award, symbol: '👑', category: 'awards' },
    
    // Communication
    { name: 'Chat', icon: FileText, symbol: '💬', category: 'communication' },
    { name: 'Message', icon: FileText, symbol: '💌', category: 'communication' },
    { name: 'Video Call', icon: FileText, symbol: '📹', category: 'communication' },
    { name: 'Speaker', icon: FileText, symbol: '🔊', category: 'communication' },
    { name: 'Microphone', icon: FileText, symbol: '🎤', category: 'communication' },
    { name: 'Camera', icon: FileText, symbol: '📷', category: 'communication' },
    
    // Technology
    { name: 'Computer', icon: FileText, symbol: '💻', category: 'technology' },
    { name: 'Mobile', icon: FileText, symbol: '📱', category: 'technology' },
    { name: 'WiFi', icon: FileText, symbol: '📶', category: 'technology' },
    { name: 'Battery', icon: FileText, symbol: '🔋', category: 'technology' },
    { name: 'Settings', icon: Settings, symbol: '⚙️', category: 'technology' },
    { name: 'Lock', icon: Shield, symbol: '🔒', category: 'technology' },
    { name: 'Key', icon: Shield, symbol: '🔑', category: 'technology' },
    
    // Finance & Money
    { name: 'Dollar', icon: FileText, symbol: '💵', category: 'finance' },
    { name: 'Credit Card', icon: FileText, symbol: '💳', category: 'finance' },
    { name: 'Bank', icon: FileText, symbol: '🏦', category: 'finance' },
    { name: 'Piggy Bank', icon: FileText, symbol: '🐷', category: 'finance' },
    { name: 'Chart Up', icon: FileText, symbol: '📈', category: 'finance' },
    { name: 'Chart Down', icon: FileText, symbol: '📉', category: 'finance' },
    
    // Health & Wellness
    { name: 'Heart', icon: Heart, symbol: '♥️', category: 'health' },
    { name: 'Medical Cross', icon: FileText, symbol: '➕', category: 'health' },
    { name: 'Pill', icon: FileText, symbol: '💊', category: 'health' },
    { name: 'Stethoscope', icon: FileText, symbol: '🩺', category: 'health' },
    { name: 'Hospital', icon: FileText, symbol: '🏥', category: 'health' },
    { name: 'Ambulance', icon: FileText, symbol: '🚑', category: 'health' },
    
    // Food & Dining
    { name: 'Restaurant', icon: FileText, symbol: '🍽️', category: 'food' },
    { name: 'Coffee', icon: FileText, symbol: '☕', category: 'food' },
    { name: 'Pizza', icon: FileText, symbol: '🍕', category: 'food' },
    { name: 'Burger', icon: FileText, symbol: '🍔', category: 'food' },
    { name: 'Cake', icon: FileText, symbol: '🎂', category: 'food' },
    { name: 'Wine', icon: FileText, symbol: '🍷', category: 'food' },
    
    // Transportation
    { name: 'Car', icon: FileText, symbol: '🚗', category: 'transport' },
    { name: 'Truck', icon: FileText, symbol: '🚛', category: 'transport' },
    { name: 'Motorcycle', icon: FileText, symbol: '🏍️', category: 'transport' },
    { name: 'Bicycle', icon: FileText, symbol: '🚲', category: 'transport' },
    { name: 'Airplane', icon: FileText, symbol: '✈️', category: 'transport' },
    { name: 'Ship', icon: FileText, symbol: '🚢', category: 'transport' },
    
    // Education
    { name: 'Graduation Cap', icon: FileText, symbol: '🎓', category: 'education' },
    { name: 'Book', icon: FileText, symbol: '📚', category: 'education' },
    { name: 'Pencil', icon: FileText, symbol: '✏️', category: 'education' },
    { name: 'School', icon: FileText, symbol: '🏫', category: 'education' },
    { name: 'Microscope', icon: FileText, symbol: '🔬', category: 'education' },
    { name: 'Lightbulb', icon: FileText, symbol: '💡', category: 'education' },
    
    // Social Media
    { name: 'X (Twitter)', icon: FileText, symbol: '𝕏', category: 'social', imagePath: '/assets/images/social icons/X.png' },
    { name: 'Twitter', icon: FileText, symbol: '🐦', category: 'social', imagePath: '/assets/images/social icons/Twitter.png' },
    { name: 'Meta (Facebook)', icon: FileText, symbol: '📘', category: 'social', imagePath: '/assets/images/social icons/Facebook.png' },
    { name: 'LinkedIn', icon: FileText, symbol: '💼', category: 'social', imagePath: '/assets/images/social icons/LinkedIn.png' },
    { name: 'Reddit', icon: FileText, symbol: '🤖', category: 'social', imagePath: '/assets/images/social icons/Reddit.png' },
    { name: 'GitHub', icon: FileText, symbol: '🐙', category: 'social' },
    { name: 'Pinterest', icon: FileText, symbol: '📌', category: 'social', imagePath: '/assets/images/social icons/Pinterest.png' },
    { name: 'Instagram', icon: FileText, symbol: '📷', category: 'social', imagePath: '/assets/images/social icons/Instagram.png' },
    { name: 'Snapchat', icon: FileText, symbol: '👻', category: 'social', imagePath: '/assets/images/social icons/Snapchat.png' },
    { name: 'Telegram', icon: FileText, symbol: '✈️', category: 'social', imagePath: '/assets/images/social icons/Telegram.png' },
    { name: 'WhatsApp', icon: FileText, symbol: '💬', category: 'social', imagePath: '/assets/images/social icons/Whatsapp.png' },
    { name: 'Yelp', icon: FileText, symbol: '⭐', category: 'social' },
    { name: 'Twitch', icon: FileText, symbol: '🎮', category: 'social', imagePath: '/assets/images/social icons/Twitch.png' },
    { name: 'YouTube', icon: FileText, symbol: '📺', category: 'social', imagePath: '/assets/images/social icons/Youtube.png' },
    { name: 'TikTok', icon: FileText, symbol: '🎵', category: 'social', imagePath: '/assets/images/social icons/Tiktok.png' },
    { name: 'Discord', icon: FileText, symbol: '🎭', category: 'social', imagePath: '/assets/images/social icons/Discord.png' },
    { name: 'Slack', icon: FileText, symbol: '💬', category: 'social', imagePath: '/assets/images/social icons/Slack.png' },
    { name: 'Skype', icon: FileText, symbol: '📞', category: 'social', imagePath: '/assets/images/social icons/Skype.png' },
    { name: 'Zoom', icon: FileText, symbol: '🎥', category: 'social', imagePath: '/assets/images/social icons/Zoom.png' },
    { name: 'Spotify', icon: FileText, symbol: '🎵', category: 'social', imagePath: '/assets/images/social icons/Spotify.png' },
    { name: 'Netflix', icon: FileText, symbol: '🎬', category: 'social' },
    { name: 'Amazon', icon: FileText, symbol: '📦', category: 'social' },
    { name: 'eBay', icon: FileText, symbol: '🛒', category: 'social' },
    { name: 'Etsy', icon: FileText, symbol: '🛍️', category: 'social' },
    { name: 'PayPal', icon: FileText, symbol: '💳', category: 'social', imagePath: '/assets/images/social icons/Paypal.png' },
    { name: 'Uber', icon: FileText, symbol: '🚗', category: 'social' },
    { name: 'Airbnb', icon: FileText, symbol: '🏠', category: 'social' },
    { name: 'Google Maps', icon: FileText, symbol: '🗺️', category: 'social' },
    { name: 'Dropbox', icon: FileText, symbol: '📁', category: 'social', imagePath: '/assets/images/social icons/Dropbox.png' },
    { name: 'Canva', icon: FileText, symbol: '🎨', category: 'social' },
    { name: 'Notion', icon: FileText, symbol: '📝', category: 'social' },
    { name: 'Trello', icon: FileText, symbol: '📋', category: 'social' },
    { name: 'Messenger', icon: FileText, symbol: '💬', category: 'social', imagePath: '/assets/images/social icons/Messenger.png' },
    { name: 'Vimeo', icon: FileText, symbol: '🎬', category: 'social', imagePath: '/assets/images/social icons/Vimeo.png' },
    { name: 'Dribbble', icon: FileText, symbol: '🏀', category: 'social', imagePath: '/assets/images/social icons/Dribbble.png' },
    { name: 'Soundcloud', icon: FileText, symbol: '🎵', category: 'social', imagePath: '/assets/images/social icons/Soundcloud.png' },
    { name: 'Tumblr', icon: FileText, symbol: '📝', category: 'social', imagePath: '/assets/images/social icons/Tumblr.png' },
    { name: 'Viber', icon: FileText, symbol: '📱', category: 'social', imagePath: '/assets/images/social icons/Viber.png' },
    { name: 'Line', icon: FileText, symbol: '💬', category: 'social', imagePath: '/assets/images/social icons/Line.png' },
    { name: 'WeChat', icon: FileText, symbol: '💬', category: 'social', imagePath: '/assets/images/social icons/WeChat.png' },
    { name: 'VK', icon: FileText, symbol: '🇷🇺', category: 'social', imagePath: '/assets/images/social icons/VK.png' },
    { name: 'Behance', icon: FileText, symbol: '🎨', category: 'social', imagePath: '/assets/images/social icons/Behance.png' },
    { name: 'Google Drive', icon: FileText, symbol: '☁️', category: 'social', imagePath: '/assets/images/social icons/Drive.png' },
    { name: 'Microsoft Word', icon: FileText, symbol: '📄', category: 'social', imagePath: '/assets/images/social icons/Word.png' },
    { name: 'Microsoft Excel', icon: FileText, symbol: '📊', category: 'social', imagePath: '/assets/images/social icons/Excel.png' },
    { name: 'Microsoft PowerPoint', icon: FileText, symbol: '📊', category: 'social', imagePath: '/assets/images/social icons/PowerPoint.png' },
    { name: 'Microsoft Outlook', icon: FileText, symbol: '📧', category: 'social', imagePath: '/assets/images/social icons/Outlook.png' },
    { name: 'Microsoft OneNote', icon: FileText, symbol: '📝', category: 'social', imagePath: '/assets/images/social icons/OneNote.png' }
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

  const toggleSection = (sectionKey) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }))
  }

  const handleAssetClick = (asset) => {
    const imagePath = `/assets/images/${asset.file}`
    onAddAsset(imagePath, asset.name)
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
          onClick={() => onAddText()}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
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
              onClick={() => onAddText(text)}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors duration-200 text-center"
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
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
          <option value="Impact">Impact</option>
          <option value="Comic Sans MS">Comic Sans MS</option>
          <option value="Courier New">Courier New</option>
          <option value="Lucida Console">Lucida Console</option>
          <option value="Tahoma">Tahoma</option>
          <option value="Trebuchet MS">Trebuchet MS</option>
          <option value="Arial Black">Arial Black</option>
          <option value="Bookman Old Style">Bookman Old Style</option>
          <option value="Garamond">Garamond</option>
          <option value="Palatino">Palatino</option>
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
    <div className={`
      w-full sm:w-80 lg:w-96 
      h-full 
      backdrop-blur-xl bg-gradient-to-b from-white/20 to-white/10
      border-r border-white/20
      overflow-y-auto
    `}>
      <div className="p-4 space-y-4">
        
        {/* Mobile Header with Close Button */}
        <div className="flex items-center justify-between sm:hidden">
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
        <div className="hidden sm:block text-center py-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Design Tools
          </h2>
          <p className="text-sm text-gray-600 mt-1">Tools & options</p>
        </div>

        {/* Banner Specifications */}
        <GlassCard>
          <button
            onClick={() => toggleSection('specifications')}
            className="w-full p-4 sm:p-4 flex items-center justify-between hover:bg-white/10 rounded-2xl transition-colors min-h-[56px]"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-blue-400 to-blue-500">
                <Info className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">Specifications</h3>
                <p className="text-xs text-gray-500">Banner details</p>
              </div>
            </div>
            {expandedSections.specifications ? 
              <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" /> : 
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500" />
            }
          </button>

          {expandedSections.specifications && (
            <div className="px-4 pb-4 space-y-3">
              {/* Banner Type Selector */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3">
                <div className="text-sm font-medium text-gray-800 mb-3">Banner Type</div>
                <select 
                  value={bannerSpecs?.id || ''}
                  onChange={(e) => onChangeBannerType?.(e.target.value)}
                  className="w-full px-3 py-2 bg-white/50 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  {bannerTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Canvas Size Selector */}
              <div className="backdrop-blur-sm bg-white/30 rounded-xl p-3">
                <div className="text-sm font-medium text-gray-800 mb-3">Banner Size</div>
                
                {/* Size Category Tabs */}
                <div className="flex gap-1 mb-3">
                  <button
                    onClick={() => setSizeCategory('landscape')}
                    className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all duration-200 ${
                      sizeCategory === 'landscape' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/20 text-gray-600 hover:bg-white/30'
                    }`}
                  >
                    Landscape
                  </button>
                  <button
                    onClick={() => setSizeCategory('portrait')}
                    className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all duration-200 ${
                      sizeCategory === 'portrait' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/20 text-gray-600 hover:bg-white/30'
                    }`}
                  >
                    Portrait
                  </button>
                  <button
                    onClick={() => setSizeCategory('custom')}
                    className={`flex-1 px-2 py-1 text-xs rounded-lg transition-all duration-200 ${
                      sizeCategory === 'custom' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/20 text-gray-600 hover:bg-white/30'
                    }`}
                  >
                    Custom
                  </button>
                </div>

                {/* Size Options */}
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {bannerSizes
                    .filter(size => size.category === sizeCategory)
                    .map((size) => (
                      <button
                        key={size.name}
                        onClick={() => onChangeCanvasSize?.(size.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                          canvasSize.width === size.width && canvasSize.height === size.height
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/20 text-gray-700 hover:bg-white/30'
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

                {/* Custom Size Input */}
                {sizeCategory === 'custom' && (
                  <div className="mt-3 pt-3 border-t border-white/20">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Width (px)</label>
                        <input
                          type="number"
                          value={customWidth}
                          onChange={(e) => setCustomWidth(e.target.value)}
                          className="w-full px-2 py-1 bg-white/50 border border-white/30 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                          placeholder="800"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600 block mb-1">Height (px)</label>
                        <input
                          type="number"
                          value={customHeight}
                          onChange={(e) => setCustomHeight(e.target.value)}
                          className="w-full px-2 py-1 bg-white/50 border border-white/30 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                          placeholder="400"
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (customWidth && customHeight) {
                          onChangeCanvasSize?.(`Custom ${customWidth}x${customHeight}`)
                        }
                      }}
                      className="w-full mt-2 px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-700 border border-green-400/30 rounded text-xs font-medium transition-all duration-200"
                    >
                      Apply Custom Size
                    </button>
                  </div>
                )}
              </div>

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
                
                {bannerSpecs?.description && (
                  <div className="pt-2 border-t border-white/20">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {bannerSpecs.description}
                    </p>
                  </div>
                )}
                
                {bannerSpecs?.uses && bannerSpecs.uses.length > 0 && (
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
              </div>
            </div>
          )}
        </GlassCard>

        {/* Image Upload */}
        <GlassCard>
          <button
            onClick={() => toggleSection('upload')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/10 rounded-2xl transition-colors"
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
                  border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200
                  ${isDragActive 
                    ? 'border-orange-400 bg-orange-50/50' 
                    : 'border-white/30 hover:border-white/50 bg-white/10 hover:bg-white/20'
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
                className="w-full p-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-700 border border-purple-400/30 backdrop-blur-sm rounded-lg transition-all duration-200 text-sm font-medium"
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
            </div>
          )}
        </GlassCard>

        {/* Text Editor */}
        <GlassCard>
          <button
            onClick={() => toggleSection('text')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/10 rounded-2xl transition-colors"
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
              {/* Quick Text Templates */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Quick Text</h4>
                <div className="grid grid-cols-2 gap-2">
                  {['HEADLINE', 'Subtitle', 'Body Text', 'Call to Action'].map((text) => (
                    <button
                      key={text}
                      onClick={() => onAddText(text)}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm transition-colors duration-200 text-center"
                    >
                      {text}
                    </button>
                  ))}
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
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Impact">Impact</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Tahoma">Tahoma</option>
                  <option value="Trebuchet MS">Trebuchet MS</option>
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
              
              {/* Edit Text Button */}
              {selectedElement?.type === 'text' && (
                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      // This will trigger text editing in the canvas
                      if (window.dispatchEvent) {
                        window.dispatchEvent(new CustomEvent('editText', { 
                          detail: { elementId: selectedElement.id } 
                        }))
                      }
                    }}
                    className="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    ✏️ Edit Text
                  </button>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    Double-click text on canvas or press Enter to edit
                  </p>
                </div>
              )}
            </div>
          )}
        </GlassCard>

        {/* Shapes & Icons */}
        <GlassCard>
          <button
            onClick={() => toggleSection('shapes')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/10 rounded-2xl transition-colors"
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
                      onClick={() => onAddShape(shape.type)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
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
                      onClick={() => onAddShape(shape.type)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
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
                      onClick={() => onAddShape(shape.type)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
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
                      onClick={() => onAddShape(shape.type)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
                    >
                      <shape.icon className="w-4 h-4" />
                      <span className="text-xs font-medium">{shape.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Business Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Business & Professional</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'business').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => onAddIcon(icon.name, icon.symbol)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
                    >
                      <span className="text-lg">{icon.symbol}</span>
                      <span className="text-xs font-medium">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Awards Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Awards & Recognition</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'awards').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => onAddIcon(icon.name, icon.symbol)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
                    >
                      <span className="text-lg">{icon.symbol}</span>
                      <span className="text-xs font-medium">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Communication Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Communication</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'communication').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => onAddIcon(icon.name, icon.symbol)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
                    >
                      <span className="text-lg">{icon.symbol}</span>
                      <span className="text-xs font-medium">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Technology Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Technology</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'technology').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => onAddIcon(icon.name, icon.symbol)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
                    >
                      <span className="text-lg">{icon.symbol}</span>
                      <span className="text-xs font-medium">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Finance Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Finance & Money</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'finance').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => onAddIcon(icon.name, icon.symbol)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
                    >
                      <span className="text-lg">{icon.symbol}</span>
                      <span className="text-xs font-medium">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Health Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Health & Wellness</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'health').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => onAddIcon(icon.name, icon.symbol)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
                    >
                      <span className="text-lg">{icon.symbol}</span>
                      <span className="text-xs font-medium">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Food Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Food & Dining</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'food').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => onAddIcon(icon.name, icon.symbol)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
                    >
                      <span className="text-lg">{icon.symbol}</span>
                      <span className="text-xs font-medium">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Transport Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Transportation</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'transport').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => onAddIcon(icon.name, icon.symbol)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
                    >
                      <span className="text-lg">{icon.symbol}</span>
                      <span className="text-xs font-medium">{icon.name}</span>
                    </NeumorphicButton>
                  ))}
                </div>
              </div>

              {/* Education Icons */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Education</h4>
                <div className="grid grid-cols-4 gap-2">
                  {iconLibrary.filter(icon => icon.category === 'education').map((icon) => (
                    <NeumorphicButton
                      key={icon.name}
                      onClick={() => onAddIcon(icon.name, icon.symbol)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
                    >
                      <span className="text-lg">{icon.symbol}</span>
                      <span className="text-xs font-medium">{icon.name}</span>
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
                      onClick={() => onAddIcon(icon.name, icon.symbol, icon.imagePath)}
                      variant="glass"
                      className="p-2 flex flex-col items-center gap-1"
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
            className="w-full p-4 flex items-center justify-between hover:bg-white/10 rounded-2xl transition-colors"
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
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">My Templates</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {userTemplates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => onLoadTemplate(template)}
                        className="w-full text-left p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors border border-white/30"
                      >
                        <div className="font-medium text-gray-800 text-sm">{template.name}</div>
                        <div className="text-xs text-gray-600">{template.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Professional Templates */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Professional Templates</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {bannerTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => onLoadTemplate(template)}
                      className="w-full text-left p-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors border border-white/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-gray-800 text-sm">{template.name}</div>
                        <div className="flex gap-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            template.orientation === 'landscape' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {template.orientation === 'landscape' ? 'Landscape' : 'Portrait'}
                          </span>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                            {template.category}
                          </span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">{template.description}</div>
                      {template.recommendedSizes && (
                        <div className="text-xs text-gray-500">
                          Best for: {template.recommendedSizes.join(', ')} ft
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Designs */}
        <GlassCard>
          <button
            onClick={() => toggleSection('assets')}
            className="w-full p-4 flex items-center justify-between hover:bg-white/10 rounded-2xl transition-colors"
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
                  className="w-full px-3 py-2 bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400/50 placeholder-gray-500"
                />
              </div>

              {/* Designs Grid */}
              <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                {getFilteredAssets(assetCategories.skins.assets).map((asset, index) => (
                  <button
                    key={index}
                    onClick={() => handleAssetClick(asset)}
                    className="aspect-square relative group overflow-hidden rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200 border border-white/30 hover:border-purple-300/50"
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

      </div>
    </div>
  )
}

export default BannerSidebar
