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
      const stageCanvas = document.querySelector('.konvajs-content canvas, canvas[data-konva-stage], [data-konva-stage] canvas')
      if (stageCanvas) {
        const isMobile = window.innerWidth < 768
        const pixelRatio = isMobile ? 3 : 2
        try {
          // Add environment-specific handling for production
          const isProduction = import.meta.env.PROD
          console.log(`🎨 Preview generation - Environment: ${isProduction ? 'Production' : 'Development'}`)
          
          const fresh = stageCanvas.toDataURL({ 
            mimeType: 'image/png', 
            quality: 1.0, 
            pixelRatio: isProduction ? pixelRatio * 1.5 : pixelRatio // Higher quality in production
          })
          console.log(`🎨 Generated canvas image - Length: ${fresh.length}, Mobile: ${isMobile}`)
          processAndSet(fresh)
          return
        } catch (e) {
          console.error('🎨 Canvas export failed:', e)
          // fall through to stored images
        }
      }
    }

    // Stored surface images for any selected surface
    const surfaceImages = orderDetails?.surface_images || canvasData?.surface_images
    if (surfaceImages && selectedSurface && surfaceImages[selectedSurface]) {
      console.log(`🎨 Using stored surface image for ${selectedSurface}`)
      processAndSet(surfaceImages[selectedSurface])
      return
    }

    // Stored single-surface stage image as last resort (only for current surface)
    if (selectedSurface === currentSurface && canvasData?.konvaStageImage) {
      console.log(`🎨 Using stored stage image for ${selectedSurface}`)
      processAndSet(canvasData.konvaStageImage)
      return
    }

    console.warn(`🎨 No preview image available for surface: ${selectedSurface}`)
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
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <button onClick={handlePrev} className="px-2 py-1 border rounded">Prev</button>
              <span>{currentSurfaceIndex + 1} of {surfaces.length}</span>
              <button onClick={handleNext} className="px-2 py-1 border rounded">Next</button>
            </div>
          )}
        </div>
        <div className="relative w-full h-[200px] sm:h-[400px] lg:h-[500px] bg-white rounded-md overflow-hidden flex items-center justify-center">
          {previewImage ? (
            <>
              <img
                src={previewImage}
                alt="Design Preview"
                className="max-w-full max-h-full object-contain select-none origin-center sm:scale-100 sm:translate-x-0 sm:translate-y-0"
                style={{ 
                  display: 'block', 
                  margin: '0 auto', 
                  objectPosition: 'center center', 
                  background: 'transparent', 
                  zIndex: 1,
                  // Mobile-only positioning - NEVER affects desktop (sm+ screens)
                  ...(window.innerWidth < 640 && {
                    transform: productType === 'banner' 
                      ? window.innerHeight > window.innerWidth 
                        ? 'scale(2.18) translateX(74px) translateY(38px)' // Portrait
                        : 'scale(2.18) translateX(157px) translateY(90px)' // Landscape
                      : productType === 'tent'
                      ? 'scale(2.5) translateX(75px) translateY(55px)'
                      : 'scale(1.98) translateX(40px) translateY(20px)'
                  })
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
        <button onClick={handleDownloadPdf} disabled={!previewImage || isGenerating} className="w-full sm:w-auto px-4 py-2 border rounded flex items-center gap-2 justify-center">
          <Download className="w-4 h-4" />
          {isGenerating ? 'Generating PDF...' : 'Download PDF'}
        </button>
        <button onClick={handleApprove} disabled={!previewImage} className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded flex items-center gap-2 justify-center">
          <CheckCircle className="w-4 h-4" />
          Approve Design
        </button>
      </div>
    </div>
  )
}

export default InlinePrintPreview


