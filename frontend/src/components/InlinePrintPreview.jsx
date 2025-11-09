import React, { useEffect, useMemo, useState } from 'react'
import { Download, CheckCircle, AlertTriangle } from 'lucide-react'
import SurfaceThumbnailViewer from './SurfaceThumbnailViewer'
import { generateWatermarkedImage, createPdfFromImage, downloadBlob } from '../utils/imaging'

const InlinePrintPreview = ({
  orderDetails,
  canvasData,
  productType = 'banner',
  dimensions,
  surfaceElements = {},
  currentSurface = 'front',
  onApprove
}) => {
  const [selectedSurface, setSelectedSurface] = useState(currentSurface)
  const [currentSurfaceIndex, setCurrentSurfaceIndex] = useState(0)
  const [previewImage, setPreviewImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Ensure transparent regions render over white in previews
  const normalizePreviewImage = (dataUrl) => {
    return new Promise((resolve) => {
      if (!dataUrl) return resolve(null)
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        try {
          resolve(canvas.toDataURL('image/png', 1.0))
        } catch (e) {
          resolve(dataUrl)
        }
      }
      img.onerror = () => resolve(dataUrl)
      img.src = dataUrl
    })
  }

  const getSurfaceNames = useMemo(() => {
    if (productType === 'tin') {
      const surfaceCoverage = orderDetails?.design_option || orderDetails?.tin_surface_coverage || 'front-back'
      const allTinSurfaces = [
        { key: 'front', name: 'Front' },
        { key: 'back', name: 'Back' },
        { key: 'inside', name: 'Inside' },
        { key: 'lid', name: 'Lid' }
      ]
      if (surfaceCoverage === 'front-only') return allTinSurfaces.filter(s => s.key === 'front')
      if (surfaceCoverage === 'front-back') return allTinSurfaces.filter(s => s.key === 'front' || s.key === 'back')
      return allTinSurfaces
    }
    if (productType === 'tent') {
      const allSurfaces = [
        { key: 'canopy_front', name: 'Canopy Front + Valence' },
        { key: 'canopy_back', name: 'Canopy Back + Valence' },
        { key: 'canopy_left', name: 'Canopy Left + Valence' },
        { key: 'canopy_right', name: 'Canopy Right + Valence' },
        { key: 'sidewall_left', name: 'Left Sidewall' },
        { key: 'sidewall_right', name: 'Right Sidewall' },
        { key: 'backwall', name: 'Back Wall' }
      ]
      
      // Use tent_specs if available (new surface-based system), otherwise fall back to design_option
      const tentSpecs = orderDetails?.tent_specs
      if (tentSpecs && tentSpecs.surfaces) {
        // Filter surfaces based on tent specs
        return allSurfaces.filter(surface => {
          if (surface.key.startsWith('canopy_')) {
            return tentSpecs.surfaces.canopy === true // Canopy is always included if true
          }
          if (surface.key === 'sidewall_left' || surface.key === 'sidewall_right') {
            return tentSpecs.surfaces.sidewalls === true
          }
          if (surface.key === 'backwall') {
            return tentSpecs.surfaces.backwall === true
          }
          return false
        })
      }
      
      // Fallback to old design_option system for backward compatibility
      const designOption = orderDetails?.design_option || orderDetails?.tent_design_option || 'canopy-only'
      if (designOption === 'canopy-only') return allSurfaces.filter(s => s.key.startsWith('canopy_'))
      if (designOption === 'canopy-backwall') return allSurfaces.filter(s => s.key.startsWith('canopy_') || s.key === 'backwall')
      return allSurfaces
    }
    return [{ key: 'front', name: 'Design' }]
  }, [orderDetails, productType])

  const surfaces = getSurfaceNames

  useEffect(() => {
    if (!selectedSurface && surfaces.length) setSelectedSurface(surfaces[0].key)
  }, [selectedSurface, surfaces])

  useEffect(() => {
    // Use live canvas export ONLY for the current surface
    const processAndSet = async (dataUrl) => {
      const normalized = await normalizePreviewImage(dataUrl)
      setPreviewImage(normalized)
    }

    if (selectedSurface === currentSurface) {
      // Try to find the Konva stage using multiple approaches
      const findKonvaCanvas = () => {
        // Method 1: Try multiple selectors with better targeting
        const stageSelectors = [
          '.konvajs-content canvas',
          'canvas[data-konva-stage]', 
          '[data-konva-stage] canvas',
          'canvas[data-konva]',
          '.konvajs-content canvas[data-konva]',
          'canvas'
        ]
        
        for (const selector of stageSelectors) {
          const elements = document.querySelectorAll(selector)
          for (const element of elements) {
            // Check if this canvas has Konva content (has width/height and is visible)
            if (element.width > 0 && element.height > 0 && element.offsetWidth > 0) {
              console.log(`🎨 Found Konva canvas with selector: ${selector}`)
              return element
            }
          }
        }
        
        // Method 2: Try to find any canvas with Konva-specific attributes
        const allCanvases = document.querySelectorAll('canvas')
        for (const canvas of allCanvases) {
          if (canvas.width > 0 && canvas.height > 0 && canvas.offsetWidth > 0) {
            // Check if this looks like a Konva canvas (has specific dimensions or attributes)
            const parent = canvas.parentElement
            if (parent && (
              parent.classList.contains('konvajs-content') ||
              parent.hasAttribute('data-konva-stage') ||
              canvas.hasAttribute('data-konva')
            )) {
              console.log(`🎨 Found Konva canvas by parent attributes`)
              return canvas
            }
          }
        }
        
        return null
      }
      
      const stageCanvas = findKonvaCanvas()
      
      if (stageCanvas) {
        try {
          // Use Konva's recommended high-quality export settings
          const devicePixelRatio = window.devicePixelRatio || 1
          const isMobile = window.innerWidth < 768
          const exportPixelRatio = Math.max(devicePixelRatio, isMobile ? 3 : 2)
          
          console.log(`🎨 Konva Export - Mobile: ${isMobile}, DevicePixelRatio: ${devicePixelRatio}, ExportRatio: ${exportPixelRatio}`)
          console.log(`🎨 Canvas dimensions: ${stageCanvas.width}x${stageCanvas.height}`)
          
          const fresh = stageCanvas.toDataURL({ 
            mimeType: 'image/png', 
            quality: 1.0, 
            pixelRatio: exportPixelRatio,
            imageSmoothingEnabled: true
          })
          
          console.log(`🎨 Generated high-quality canvas image - Length: ${fresh.length}`)
          processAndSet(fresh)
          return
        } catch (e) {
          console.error('🎨 Konva canvas export failed:', e)
          // fall through to stored images
        }
      } else {
        console.warn('🎨 No valid Konva canvas found for export')
        // Try to wait a bit and retry (in case canvas is still loading)
        setTimeout(() => {
          const retryCanvas = findKonvaCanvas()
          if (retryCanvas) {
            console.log('🎨 Found Konva canvas on retry')
            try {
              const fresh = retryCanvas.toDataURL({ 
                mimeType: 'image/png', 
                quality: 1.0, 
                pixelRatio: 2
              })
              processAndSet(fresh)
            } catch (e) {
              console.error('🎨 Retry canvas export failed:', e)
            }
          }
        }, 500)
      }
    }

    // Stored surface images for any selected surface - check all possible locations
    const surfaceImages = orderDetails?.surface_images || canvasData?.surface_images || orderDetails?.canvas_data?.surface_images
    console.log(`🎨 DEBUG: Looking for surface image for ${selectedSurface}`)
    console.log(`🎨 DEBUG: surfaceImages:`, surfaceImages)
    console.log(`🎨 DEBUG: orderDetails?.surface_images:`, orderDetails?.surface_images)
    console.log(`🎨 DEBUG: canvasData?.surface_images:`, canvasData?.surface_images)
    console.log(`🎨 DEBUG: orderDetails?.canvas_data?.surface_images:`, orderDetails?.canvas_data?.surface_images)
    
    if (surfaceImages && selectedSurface && surfaceImages[selectedSurface]) {
      console.log(`🎨 Using stored surface image for ${selectedSurface}`)
      processAndSet(surfaceImages[selectedSurface])
      return
    }

    // Stored single-surface stage image as last resort (only for current surface) - check all possible locations
    const konvaStageImage = canvasData?.konvaStageImage || orderDetails?.canvas_data?.konvaStageImage
    if (selectedSurface === currentSurface && konvaStageImage) {
      console.log(`🎨 Using stored stage image for ${selectedSurface}`)
      processAndSet(konvaStageImage)
      return
    }

    // Additional fallback: try to use canvas_image if available
    const canvasImage = orderDetails?.canvas_image || canvasData?.canvas_image
    console.log(`🎨 DEBUG: canvasImage available:`, !!canvasImage)
    console.log(`🎨 DEBUG: selectedSurface === currentSurface:`, selectedSurface === currentSurface)
    if (selectedSurface === currentSurface && canvasImage) {
      console.log(`🎨 Using canvas image for ${selectedSurface}`)
      processAndSet(canvasImage)
      return
    }
    
    // For tin products, if we have a canvas_image, use it for any surface since it's the tin surface area
    if (productType === 'tin' && canvasImage) {
      console.log(`🎨 Using canvas image for tin product (any surface)`)
      processAndSet(canvasImage)
      return
    }

    console.warn(`🎨 No preview image available for surface: ${selectedSurface}`)
    console.log('🎨 Available data:', {
      orderDetails: !!orderDetails,
      canvasData: !!canvasData,
      surfaceImages: orderDetails?.surface_images || canvasData?.surface_images || orderDetails?.canvas_data?.surface_images,
      konvaStageImage: canvasData?.konvaStageImage || orderDetails?.canvas_data?.konvaStageImage,
      canvasImage: orderDetails?.canvas_image || canvasData?.canvas_image,
      selectedSurface,
      orderDetailsKeys: orderDetails ? Object.keys(orderDetails) : [],
      canvasDataKeys: canvasData ? Object.keys(canvasData) : []
    })
    setPreviewImage(null)
  }, [orderDetails, canvasData, selectedSurface, currentSurface])

  const handleNext = () => {
    if (!surfaces.length) return
    const nextIndex = (currentSurfaceIndex + 1) % surfaces.length
    setCurrentSurfaceIndex(nextIndex)
    setSelectedSurface(surfaces[nextIndex].key)
  }

  const handlePrev = () => {
    if (!surfaces.length) return
    const prevIndex = (currentSurfaceIndex - 1 + surfaces.length) % surfaces.length
    setCurrentSurfaceIndex(prevIndex)
    setSelectedSurface(surfaces[prevIndex].key)
  }

  const handleDownloadPdf = async () => {
    if (!previewImage) return
    setIsGenerating(true)
    try {
      const watermarked = await generateWatermarkedImage(previewImage)
      const pdfBlob = await createPdfFromImage({
        imageDataURL: watermarked,
        productType,
        dimensions,
        canvasData
      })
      downloadBlob(pdfBlob, `${productType}-design-production.pdf`)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApprove = async () => {
    if (!previewImage) return
    const watermarked = await generateWatermarkedImage(previewImage)
    await createPdfFromImage({ imageDataURL: watermarked, productType, dimensions, canvasData })
    onApprove?.()
  }

  return (
    <div className="space-y-4">
      <div className="w-full bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-gray-700">
            Design Preview
            <div className="text-xs text-gray-500 mt-1 sm:hidden">Refresh page after rotating device for optimal positioning</div>
          </div>
          {surfaces.length > 1 && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <button 
                onClick={handlePrev} 
                className="px-3 py-2 sm:px-2 sm:py-1 border rounded hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
              >
                Prev
              </button>
              <span className="font-medium">{currentSurfaceIndex + 1} of {surfaces.length}</span>
              <button 
                onClick={handleNext} 
                className="px-3 py-2 sm:px-2 sm:py-1 border rounded hover:bg-gray-50 active:bg-gray-100 transition-colors touch-manipulation"
              >
                Next
              </button>
            </div>
          )}
        </div>
        <div className="relative w-full h-[350px] sm:h-[500px] lg:h-[600px] bg-white rounded-md overflow-hidden flex items-center justify-center p-2 sm:p-4">
          {previewImage ? (
            <>
              {productType === 'tin' ? (
                // Realistic Tin Preview - Responsive for mobile and desktop
                <div className="relative w-full h-full flex items-center justify-center">
                  {/* Base Tin Surface Image */}
                  <img
                    src={`/assets/images/Tin Surfaces/Tin_${
                      selectedSurface === 'back' ? 'Back' : 
                      selectedSurface === 'inside' ? 'Front' : 
                      selectedSurface === 'lid' ? 'Front' : 
                      'Front'
                    }.png`}
                    alt={`Tin ${selectedSurface === 'back' ? 'Back' : 'Front'} Surface`}
                    className="absolute inset-0 w-full h-full object-contain"
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  
                  {/* Design Overlay with Tin Surface Clipping Mask - Responsive sizing */}
                  <div 
                    className="absolute"
                    style={{
                      // Mobile: scale to 70% of viewport, Desktop: fixed 464px (perfect)
                      width: window.innerWidth < 768 ? 'min(464px, 70vw)' : '464px',
                      height: window.innerWidth < 768 ? 'min(289px, 43vw)' : '289px',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      clipPath: window.innerWidth < 768 ? 'inset(0 round min(31px, 5vw))' : 'inset(0 round 31px)',
                      WebkitClipPath: window.innerWidth < 768 ? 'inset(0 round min(31px, 5vw))' : 'inset(0 round 31px)',
                      backgroundColor: 'transparent',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={previewImage}
                      alt="Design Preview"
                      className="w-full h-full"
                      style={{
                        objectFit: 'fill'
                      }}
                      draggable={false}
                      onContextMenu={(e) => e.preventDefault()}
                    />
                  </div>
                  
                  {/* Watermark Overlay */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage: "url('/assets/images/BuyPrintz_Watermark_1200px_72dpi.png')",
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                      opacity: 0.2,
                      mixBlendMode: 'multiply',
                      zIndex: 9999
                    }}
                    onError={(e) => {
                      console.warn('🎨 Watermark failed to load in production')
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              ) : productType === 'tent' ? (
                // Tent Preview - Mobile fills container, Desktop uses natural size
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt="Tent Design Preview"
                    className="sm:max-w-full sm:max-h-full object-contain bg-white"
                    style={{
                      // Mobile: fill container, Desktop: natural responsive sizing
                      width: window.innerWidth < 640 ? '100%' : 'auto',
                      height: window.innerWidth < 640 ? '100%' : 'auto'
                    }}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage: "url('/assets/images/BuyPrintz_Watermark_1200px_72dpi.png')",
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                      opacity: 0.3,
                      mixBlendMode: 'multiply',
                      zIndex: 9999
                    }}
                    onError={(e) => {
                      console.warn('🎨 Watermark failed to load in production')
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                // Standard Preview for Banners/Stickers - Mobile fills container, Desktop natural size
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={previewImage}
                    alt="Design Preview"
                    className="sm:max-w-full sm:max-h-full object-contain bg-white"
                    style={{
                      // Mobile: fill container (like stickers), Desktop: natural responsive sizing
                      width: window.innerWidth < 640 ? '100%' : 'auto',
                      height: window.innerWidth < 640 ? '100%' : 'auto'
                    }}
                    draggable={false}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage: "url('/assets/images/BuyPrintz_Watermark_1200px_72dpi.png')",
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                      opacity: 0.3,
                      mixBlendMode: 'multiply',
                      zIndex: 9999
                    }}
                    onError={(e) => {
                      console.warn('🎨 Watermark failed to load in production')
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center space-y-2">
              <AlertTriangle className="h-10 w-10 text-amber-500 mx-auto" />
              <div className="text-sm text-gray-600">Preview not available. Save your design and try again.</div>
            </div>
          )}
        </div>
      </div>

      { (productType === 'tin' || productType === 'tent') && (
        <div className="bg-white border rounded-lg p-3">
          <div className="text-sm font-medium text-gray-700 mb-2">All Surfaces</div>
          <div className="max-h-[260px] overflow-y-auto">
            <SurfaceThumbnailViewer
              orderDetails={orderDetails}
              canvasData={canvasData}
              surfaceElements={surfaceElements}
              productType={productType}
              onSurfaceSelect={setSelectedSurface}
              selectedSurface={selectedSurface}
              designOption={orderDetails?.design_option || orderDetails?.tent_design_option}
              tentDesignOption={orderDetails?.tent_design_option}
              tinSurfaceCoverage={orderDetails?.tin_surface_coverage}
              dimensions={canvasData?.canvasSize || dimensions}
              currentSurface={currentSurface}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button 
          onClick={handleDownloadPdf} 
          disabled={!previewImage || isGenerating} 
          className="w-full sm:w-auto px-4 py-3 sm:py-2 border rounded flex items-center gap-2 justify-center hover:bg-gray-50 active:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation font-medium"
        >
          <Download className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="text-base sm:text-sm">{isGenerating ? 'Generating PDF...' : 'Download PDF'}</span>
        </button>
        <button 
          onClick={handleApprove} 
          disabled={!previewImage} 
          className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation font-medium shadow-sm"
        >
          <CheckCircle className="w-5 h-5 sm:w-4 sm:h-4" />
          <span className="text-base sm:text-sm">Approve Design</span>
        </button>
      </div>
    </div>
  )
}

export default InlinePrintPreview


