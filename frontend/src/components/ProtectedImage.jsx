import React, { useState, useRef, useEffect } from 'react'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { addProtectionClass, removeProtectionClass } from '../utils/downloadProtection'

const ProtectedImage = ({ 
  src, 
  alt, 
  className = '', 
  watermark = true, 
  watermarkOpacity = 0.3,
  isPreview = false,
  onUpgrade,
  onError,
  ...props 
}) => {
  const [showFullImage, setShowFullImage] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const imgRef = useRef(null)
  const containerRef = useRef(null)

  const handleImageLoad = () => {
    setImageLoaded(true)
  }

  const handleImageError = (e) => {
    setImageError(true)
    if (onError) onError(e)
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    }
  }

  const toggleImageVisibility = () => {
    setShowFullImage(!showFullImage)
  }

  // Download protection methods
  const preventRightClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  const preventDragStart = (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  const preventDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  const preventContextMenu = (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  const preventKeyboardShortcuts = (e) => {
    // Block common keyboard shortcuts for saving images
    if (
      (e.ctrlKey || e.metaKey) && 
      (e.key === 's' || e.key === 'S' || e.key === 'a' || e.key === 'A')
    ) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
    
    // Block F12 (developer tools)
    if (e.key === 'F12') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
    
    // Block Ctrl+Shift+I (developer tools)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }

  const preventSelection = (e) => {
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  // Add protection event listeners
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Add protection class
    addProtectionClass(container)

    // Add all protection event listeners
    container.addEventListener('contextmenu', preventContextMenu)
    container.addEventListener('dragstart', preventDragStart)
    container.addEventListener('drag', preventDrag)
    container.addEventListener('selectstart', preventSelection)
    container.addEventListener('keydown', preventKeyboardShortcuts)
    
    // Disable text selection on the container
    container.style.userSelect = 'none'
    container.style.webkitUserSelect = 'none'
    container.style.mozUserSelect = 'none'
    container.style.msUserSelect = 'none'
    
    // Disable drag and drop
    container.draggable = false

    return () => {
      removeProtectionClass(container)
      container.removeEventListener('contextmenu', preventContextMenu)
      container.removeEventListener('dragstart', preventDragStart)
      container.removeEventListener('drag', preventDrag)
      container.removeEventListener('selectstart', preventSelection)
      container.removeEventListener('keydown', preventKeyboardShortcuts)
    }
  }, [])

  if (imageError) {
    return (
      <div className={`${className} bg-gray-100 flex items-center justify-center`}>
        <div className="text-center text-gray-400">
          <div className="text-4xl mb-2">🖼️</div>
          <p className="text-sm">Image unavailable</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative ${className}`}
      onContextMenu={preventRightClick}
      onDragStart={preventDragStart}
      onDrag={preventDrag}
      onSelectStart={preventSelection}
      style={{
        userSelect: 'none',
        webkitUserSelect: 'none',
        mozUserSelect: 'none',
        msUserSelect: 'none',
        pointerEvents: 'auto'
      }}
    >
      {/* Main Image */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-all duration-300 ${
          showFullImage ? 'blur-none' : 'blur-sm'
        }`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onContextMenu={preventRightClick}
        onDragStart={preventDragStart}
        onDrag={preventDrag}
        onSelectStart={preventSelection}
        style={{
          filter: showFullImage ? 'none' : 'blur(8px) brightness(0.7)',
          userSelect: 'none',
          webkitUserSelect: 'none',
          mozUserSelect: 'none',
          msUserSelect: 'none',
          pointerEvents: 'auto',
          draggable: false
        }}
        draggable={false}
        {...props}
      />

      {/* Watermark Overlay */}
      {watermark && imageLoaded && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url('/assets/images/BuyPrintz_Watermark_1200px_72dpi.png')`,
            backgroundSize: 'contain',
            backgroundRepeat: 'repeat',
            backgroundPosition: 'center',
            opacity: watermarkOpacity,
            mixBlendMode: 'multiply',
            userSelect: 'none',
            webkitUserSelect: 'none',
            mozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'none'
          }}
          onContextMenu={preventRightClick}
          onDragStart={preventDragStart}
          onDrag={preventDrag}
          onSelectStart={preventSelection}
        />
      )}

      {/* Additional Protection Overlay */}
      {watermark && imageLoaded && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'transparent',
            userSelect: 'none',
            webkitUserSelect: 'none',
            mozUserSelect: 'none',
            msUserSelect: 'none',
            pointerEvents: 'none'
          }}
          onContextMenu={preventRightClick}
          onDragStart={preventDragStart}
          onDrag={preventDrag}
          onSelectStart={preventSelection}
        />
      )}

      {/* Protection Overlay */}
      {!showFullImage && imageLoaded && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center pointer-events-auto">
          <div className="text-center text-white">
            <Lock className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-medium mb-3">Protected Content</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={toggleImageVisibility}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 border border-white/30 rounded-lg text-white text-xs transition-all duration-200 flex items-center gap-1 touch-manipulation"
                style={{ touchAction: 'manipulation' }}
              >
                <Eye className="w-3 h-3" />
                Preview
              </button>
              {onUpgrade && (
                <button
                  onClick={handleUpgrade}
                  className="px-3 py-1 bg-buyprint-brand hover:bg-buyprint-600 text-white text-xs rounded-lg transition-all duration-200 touch-manipulation"
                  style={{ touchAction: 'manipulation' }}
                >
                  Purchase
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Hide Button */}
      {showFullImage && (
        <button
          onClick={toggleImageVisibility}
          className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all duration-200 touch-manipulation"
          style={{ touchAction: 'manipulation' }}
        >
          <EyeOff className="w-4 h-4" />
        </button>
      )}

      {/* Loading State */}
      {!imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-buyprint-brand rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs">Loading...</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProtectedImage
