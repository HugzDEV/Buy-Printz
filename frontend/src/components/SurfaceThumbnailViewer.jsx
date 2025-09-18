import React, { useState, useEffect, useCallback } from 'react'

const SurfaceThumbnailViewer = ({ 
  productType,
  orderDetails,
  canvasData,
  surfaceElements,
  designOption,
  tentDesignOption,
  tinSurfaceCoverage,
  onSurfaceSelect,
  selectedSurface,
  currentSurface
}) => {
  const [surfaceThumbnails, setSurfaceThumbnails] = useState({})
  const [isGenerating, setIsGenerating] = useState(false)

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

   // KONVA-ONLY: Generate thumbnail using only Konva exports
   const generateSurfaceThumbnail = useCallback(async (surface) => {
     const { key: surfaceKey, dimensions } = surface
     
     console.log('🎨 KONVA-ONLY: Generating thumbnail for surface:', surfaceKey)
     
     // PRIORITY 1: Use live Konva export for current surface (most up-to-date!)
     if (surfaceKey === currentSurface && canvasData?.konvaStageImage) {
       console.log('🎨 ✅ Using LIVE Konva export for current surface thumbnail:', surfaceKey)
       return {
         dataUrl: canvasData.konvaStageImage,
         dimensions,
         elementCount: (orderDetails?.surface_elements || surfaceElements)[surfaceKey]?.length || 0
       }
     }
     
     // PRIORITY 2: Use stored Konva surface images (perfect alignment)
     const surfaceImages = orderDetails?.surface_images || canvasData?.surface_images
     if (surfaceImages && surfaceImages[surfaceKey]) {
       console.log('🎨 ✅ Using stored Konva surface image for thumbnail:', surfaceKey)
       return {
         dataUrl: surfaceImages[surfaceKey],
         dimensions,
         elementCount: (orderDetails?.surface_elements || surfaceElements)[surfaceKey]?.length || 0
       }
     }
    
    // NO FALLBACK TO CANVAS2D - Show placeholder instead
    console.log('🚫 No Konva export available for surface:', surfaceKey, '- showing placeholder')
    
    // Create simple placeholder (small Canvas2D only for placeholder text)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 200 // Small thumbnail size
    canvas.height = 120
    
    // Gray background
    ctx.fillStyle = '#f3f4f6'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // Border
    ctx.strokeStyle = '#d1d5db'
    ctx.lineWidth = 1
    ctx.strokeRect(0, 0, canvas.width, canvas.height)
    
     // "No Preview" text
     ctx.fillStyle = '#6b7280'
     ctx.font = '14px Arial'
     ctx.textAlign = 'center'
     ctx.textBaseline = 'middle'
     ctx.fillText('Not Available', canvas.width / 2, canvas.height / 2 - 8)
     ctx.font = '12px Arial'
     ctx.fillText('(Design Required)', canvas.width / 2, canvas.height / 2 + 8)
    
    const elementCount = (orderDetails?.surface_elements || surfaceElements)[surfaceKey]?.length || 0
    
    return {
      dataUrl: canvas.toDataURL('image/png', 0.8),
      dimensions,
      elementCount
    }
   }, [orderDetails, canvasData, surfaceElements, currentSurface])

  // Generate all surface thumbnails using Konva exports only
  const generateAllThumbnails = useCallback(async () => {
    setIsGenerating(true)
    const thumbnails = {}
    
    try {
      const surfaces = getAvailableSurfaces()
      console.log('🎨 KONVA-ONLY: Generating thumbnails for surfaces:', surfaces.map(s => s.key))
      
      for (const surface of surfaces) {
        const thumbnail = await generateSurfaceThumbnail(surface)
        thumbnails[surface.key] = thumbnail
        console.log(`🎨 Generated thumbnail for ${surface.key}: ${thumbnail.dimensions.width}x${thumbnail.dimensions.height} (${thumbnail.elementCount} elements)`)
      }
      
      setSurfaceThumbnails(thumbnails)
      
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

  // Get current surface info
  const surfaces = getAvailableSurfaces()
  const currentThumbnail = surfaceThumbnails[selectedSurface]

  if (isGenerating) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Generating thumbnails...</p>
        </div>
      </div>
    )
  }

  if (surfaces.length === 0) {
    return (
      <div className="text-center p-4">
        <p className="text-sm text-gray-500">No surfaces available</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {surfaces.map((surface) => {
        const thumbnail = surfaceThumbnails[surface.key]
        const isSelected = selectedSurface === surface.key
        
        return (
          <div
            key={surface.key}
            className={`
              cursor-pointer p-3 rounded-lg border transition-all duration-200
              ${isSelected 
                ? 'border-blue-500 bg-blue-50 shadow-md' 
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }
            `}
            onClick={() => onSurfaceSelect?.(surface.key)}
          >
            <div className="flex items-center space-x-3">
              {/* Thumbnail Image */}
              <div className="flex-shrink-0">
                {thumbnail ? (
                  <img
                    src={thumbnail.dataUrl}
                    alt={surface.name}
                    className={`w-16 h-10 rounded border bg-gray-50 ${
                      productType === 'tent' 
                        ? 'object-cover object-center' 
                        : 'object-contain'
                    }`}
                  />
                ) : (
                  <div className="w-16 h-10 bg-gray-200 rounded border flex items-center justify-center">
                    <span className="text-xs text-gray-400">...</span>
                  </div>
                )}
              </div>
              
              {/* Surface Info */}
              <div className="flex-1 min-w-0">
                <h4 className={`font-medium text-sm truncate ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                  {surface.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1">
                  {thumbnail ? `${thumbnail.dimensions.width} × ${thumbnail.dimensions.height}px • ${thumbnail.elementCount} elements` : 'Loading...'}
                </p>
              </div>
              
              {/* Selection Indicator */}
              {isSelected && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </div>
          </div>
        )
      })}
      
    </div>
  )
}

export default SurfaceThumbnailViewer
