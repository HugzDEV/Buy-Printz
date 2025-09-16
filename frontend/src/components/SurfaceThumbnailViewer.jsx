import React, { useState, useEffect, useCallback } from 'react'

const SurfaceThumbnailViewer = ({ 
  productType,
  orderDetails,
  canvasData,
  surfaceElements,
  designOption,
  tentDesignOption,
  tinSurfaceCoverage
}) => {
  const [surfaceThumbnails, setSurfaceThumbnails] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedSurface, setSelectedSurface] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Get available surfaces based on product type and specifications
  const getAvailableSurfaces = useCallback(() => {
    if (productType === 'tin') {
      const surfaceCoverage = designOption || tinSurfaceCoverage || 'front-back'
      const allSurfaces = [
        { key: 'front', name: 'Front', dimensions: { width: 374, height: 225 } },
        { key: 'back', name: 'Back', dimensions: { width: 374, height: 225 } },
        { key: 'inside', name: 'Inside', dimensions: { width: 374, height: 225 } },
        { key: 'lid', name: 'Lid', dimensions: { width: 374, height: 225 } }
      ]
      
      if (surfaceCoverage === 'front-only') {
        return allSurfaces.filter(s => s.key === 'front')
      } else if (surfaceCoverage === 'front-back') {
        return allSurfaces.filter(s => s.key === 'front' || s.key === 'back')
      } else {
        return allSurfaces // all-surfaces
      }
    } else if (productType === 'tent') {
      const tentDesign = designOption || tentDesignOption || 'canopy-only'
      const allSurfaces = [
        { key: 'canopy_front', name: 'Canopy Front + Valence', dimensions: { width: 1160, height: 1049 } },
        { key: 'canopy_back', name: 'Canopy Back + Valence', dimensions: { width: 1160, height: 1049 } },
        { key: 'canopy_left', name: 'Canopy Left + Valence', dimensions: { width: 1160, height: 1049 } },
        { key: 'canopy_right', name: 'Canopy Right + Valence', dimensions: { width: 1160, height: 1049 } },
        { key: 'sidewall_left', name: 'Left Sidewall', dimensions: { width: 1110, height: 390 } },
        { key: 'sidewall_right', name: 'Right Sidewall', dimensions: { width: 1110, height: 390 } },
        { key: 'backwall', name: 'Back Wall', dimensions: { width: 1110, height: 780 } }
      ]
      
      if (tentDesign === 'canopy-only') {
        return allSurfaces.filter(s => s.key.startsWith('canopy_'))
      } else if (tentDesign === 'canopy-backwall') {
        return allSurfaces.filter(s => s.key.startsWith('canopy_') || s.key === 'backwall')
      } else {
        return allSurfaces // all-sides
      }
    }
    return [{ key: 'front', name: 'Design', dimensions: { width: 800, height: 600 } }]
  }, [productType, designOption, tentDesignOption, tinSurfaceCoverage])

  // Generate thumbnail for a specific surface
  const generateSurfaceThumbnail = useCallback(async (surface) => {
    const { key: surfaceKey, dimensions } = surface
    
    // Create canvas with proper dimensions
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    canvas.width = dimensions.width
    canvas.height = dimensions.height
    
    // Get elements for this surface
    const surfaceElementsData = orderDetails?.surface_elements || surfaceElements
    const elementsToRender = surfaceElementsData[surfaceKey] || []
    
    // Set background
    ctx.fillStyle = canvasData?.backgroundColor || '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Apply clipping for tent canopy surfaces
    if (productType === 'tent' && surfaceKey.startsWith('canopy_')) {
      ctx.beginPath()
      
      // Triangular canopy path
      ctx.moveTo(canvas.width / 2, 0) // Top point
      ctx.lineTo(0, 789)              // Bottom left of triangle
      ctx.lineTo(canvas.width, 789)   // Bottom right of triangle
      
      // Rectangular valence path
      ctx.lineTo(canvas.width, 809)   // Top right of valence
      ctx.lineTo(0, 809)              // Top left of valence
      ctx.lineTo(0, 1009)             // Bottom left of valence
      ctx.lineTo(canvas.width, 1009)  // Bottom right of valence
      ctx.lineTo(canvas.width, 789)   // Back to bottom right of triangle
      
      ctx.closePath()
      ctx.clip()
    }
    
    // Render elements
    for (const element of elementsToRender) {
      if (element.type === 'image' && element.imageDataUrl) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        await new Promise((resolve, reject) => {
          img.onload = () => {
            ctx.drawImage(img, element.x, element.y, element.width, element.height)
            resolve()
          }
          img.onerror = reject
          img.src = element.imageDataUrl
        })
      } else if (element.type === 'text') {
        ctx.font = `${element.fontSize}px ${element.fontFamily}`
        ctx.fillStyle = element.fill || element.color || '#000000'
        ctx.textAlign = element.align || element.textAlign || 'left'
        ctx.fillText(element.text, element.x, element.y)
      } else if (element.type === 'rect') {
        ctx.fillStyle = element.fill || '#000000'
        ctx.fillRect(element.x, element.y, element.width, element.height)
      } else if (element.type === 'circle') {
        ctx.beginPath()
        ctx.arc(element.x + element.radius, element.y + element.radius, element.radius, 0, 2 * Math.PI)
        ctx.fillStyle = element.fill || '#000000'
        ctx.fill()
      }
    }
    
    return {
      dataUrl: canvas.toDataURL('image/png', 0.8),
      dimensions,
      elementCount: elementsToRender.length
    }
  }, [productType, orderDetails, canvasData, surfaceElements])

  // Generate all surface thumbnails
  const generateAllThumbnails = useCallback(async () => {
    setIsGenerating(true)
    const thumbnails = {}
    
    try {
      const surfaces = getAvailableSurfaces()
      console.log('🎨 Generating thumbnails for surfaces:', surfaces.map(s => s.key))
      
      for (const surface of surfaces) {
        const thumbnail = await generateSurfaceThumbnail(surface)
        thumbnails[surface.key] = thumbnail
        console.log(`🎨 Generated thumbnail for ${surface.key}: ${thumbnail.dimensions.width}x${thumbnail.dimensions.height}`)
      }
      
      setSurfaceThumbnails(thumbnails)
      
      // Set initial selected surface
      if (surfaces.length > 0) {
        setSelectedSurface(surfaces[0].key)
        setCurrentIndex(0)
      }
      
    } catch (error) {
      console.error('Error generating thumbnails:', error)
    } finally {
      setIsGenerating(false)
    }
  }, [getAvailableSurfaces, generateSurfaceThumbnail])

  // Generate thumbnails when component mounts or dependencies change
  useEffect(() => {
    if (orderDetails || canvasData) {
      generateAllThumbnails()
    }
  }, [generateAllThumbnails])

  // Navigation functions
  const navigateToSurface = (index) => {
    const surfaces = getAvailableSurfaces()
    if (index >= 0 && index < surfaces.length) {
      setCurrentIndex(index)
      setSelectedSurface(surfaces[index].key)
    }
  }

  const navigatePrevious = () => navigateToSurface(currentIndex - 1)
  const navigateNext = () => navigateToSurface(currentIndex + 1)

  // Get current surface info
  const surfaces = getAvailableSurfaces()
  const currentSurface = surfaces[currentIndex]
  const currentThumbnail = surfaceThumbnails[selectedSurface]

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Generating surface previews...</p>
        </div>
      </div>
    )
  }

  if (!currentThumbnail) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-600">No preview available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Surface Navigation */}
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-gray-900">
          {currentSurface?.name} Preview
        </h5>
        <div className="flex items-center gap-2">
          <button
            onClick={navigatePrevious}
            disabled={currentIndex === 0}
            className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            ←
          </button>
          <span className="text-sm text-gray-600">
            {currentIndex + 1} of {surfaces.length}
          </span>
          <button
            onClick={navigateNext}
            disabled={currentIndex === surfaces.length - 1}
            className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
          >
            →
          </button>
        </div>
      </div>

      {/* Surface Preview */}
      <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center overflow-hidden">
        <img
          src={currentThumbnail.dataUrl}
          alt={`${currentSurface?.name} preview`}
          className="max-w-full max-h-96 object-contain"
          style={{
            width: 'auto',
            height: 'auto',
            maxWidth: '100%',
            maxHeight: '400px'
          }}
        />
      </div>

      {/* Surface Info */}
      <div className="text-sm text-gray-600 text-center">
        {currentThumbnail.dimensions.width} × {currentThumbnail.dimensions.height}px
        {currentThumbnail.elementCount > 0 && (
          <span> • {currentThumbnail.elementCount} elements</span>
        )}
      </div>
    </div>
  )
}

export default SurfaceThumbnailViewer
