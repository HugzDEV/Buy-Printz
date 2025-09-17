import React, { useState, useRef, useEffect } from 'react'
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
        className="w-full h-full object-cover transition-all duration-300"
        onLoad={handleImageLoad}
        onError={handleImageError}
        onContextMenu={preventRightClick}
        onDragStart={preventDragStart}
        onDrag={preventDrag}
        onSelectStart={preventSelection}
        style={{
          userSelect: 'none',
          webkitUserSelect: 'none',
          mozUserSelect: 'none',
          msUserSelect: 'none',
          pointerEvents: 'none',
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
