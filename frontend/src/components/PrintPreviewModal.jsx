import React, { useState, useEffect, useRef } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
  Badge,
  Alert,
  AlertDescription
} from './ui/index.jsx'
import { Download, Eye, FileText, Check, X, Printer, CheckCircle, AlertTriangle } from 'lucide-react'
import jsPDF from 'jspdf'
import SurfaceThumbnailViewer from './SurfaceThumbnailViewer'

const PrintPreviewModal = ({ 
  isOpen, 
  onClose, 
  onApprove, 
  canvasData, 
  orderDetails,
  dimensions,
  productType = 'banner',
  surfaceElements = {},
  currentSurface = 'front'
}) => {
  const [pdfBlob, setPdfBlob] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [imageScale, setImageScale] = useState(1.0)
  const [selectedSurface, setSelectedSurface] = useState(currentSurface)
  const [approvedSurfaces, setApprovedSurfaces] = useState(new Set())
  const [currentSurfaceIndex, setCurrentSurfaceIndex] = useState(0)

  // Initialize selected surface to current surface from editor when modal opens
  useEffect(() => {
    if (isOpen) {
      if (hasMultipleSurfaces()) {
        const surfaces = getAllSurfaces()
        if (surfaces.length > 0) {
          // ALWAYS use the current surface from editor if it exists in available surfaces
          const currentSurfaceExists = surfaces.find(s => s.key === currentSurface)
          if (currentSurfaceExists) {
            setSelectedSurface(currentSurface)
            const surfaceIndex = surfaces.findIndex(s => s.key === currentSurface)
            setCurrentSurfaceIndex(surfaceIndex >= 0 ? surfaceIndex : 0)
            console.log('🎨 PrintPreviewModal - Using current editor surface:', currentSurface)
          } else {
            // Fallback: For tents, prefer to start with the first canopy surface
            const firstCanopySurface = surfaces.find(s => s.key.startsWith('canopy_'))
            const initialSurface = firstCanopySurface || surfaces[0]
            setSelectedSurface(initialSurface.key)
            setCurrentSurfaceIndex(0)
            console.log('🎨 PrintPreviewModal - Current surface not available, using fallback:', initialSurface.key)
          }
        }
      } else {
        // For single-surface products, always use the current surface
        setSelectedSurface(currentSurface)
        setCurrentSurfaceIndex(0)
      }
    }
  }, [isOpen, productType, orderDetails?.design_option, currentSurface])

  // Get surface names based on product type and design option
  const getSurfaceNames = () => {
    if (productType === 'tin') {
      const surfaceCoverage = orderDetails?.design_option || orderDetails?.tin_surface_coverage || 'front-back'
      const allTinSurfaces = [
        { key: 'front', name: 'Front', description: 'Main front surface' },
        { key: 'back', name: 'Back', description: 'Back surface' },
        { key: 'inside', name: 'Inside', description: 'Inside surface' },
        { key: 'lid', name: 'Lid', description: 'Lid surface' }
      ]
      
      let filteredSurfaces = []
      if (surfaceCoverage === 'front-only') {
        filteredSurfaces = allTinSurfaces.filter(s => s.key === 'front')
      } else if (surfaceCoverage === 'front-back') {
        filteredSurfaces = allTinSurfaces.filter(s => s.key === 'front' || s.key === 'back')
      } else if (surfaceCoverage === 'all-surfaces') {
        filteredSurfaces = allTinSurfaces
      } else {
        filteredSurfaces = allTinSurfaces.filter(s => s.key === 'front' || s.key === 'back')
      }
      return filteredSurfaces
      
    } else if (productType === 'tent') {
      const allSurfaces = [
        { key: 'canopy_front', name: 'Canopy Front + Valence', description: 'Front canopy with valence' },
        { key: 'canopy_back', name: 'Canopy Back + Valence', description: 'Back canopy with valence' },
        { key: 'canopy_left', name: 'Canopy Left + Valence', description: 'Left canopy with valence' },
        { key: 'canopy_right', name: 'Canopy Right + Valence', description: 'Right canopy with valence' },
        { key: 'sidewall_left', name: 'Left Sidewall', description: 'Left sidewall panel' },
        { key: 'sidewall_right', name: 'Right Sidewall', description: 'Right sidewall panel' },
        { key: 'backwall', name: 'Back Wall', description: 'Back wall panel' }
      ]
      
      const designOption = orderDetails?.design_option || orderDetails?.tent_design_option || 'canopy-only'
      let filteredSurfaces = []
      
      if (designOption === 'canopy-only') {
        filteredSurfaces = allSurfaces.filter(s => s.key.startsWith('canopy_'))
      } else if (designOption === 'canopy-backwall') {
        filteredSurfaces = allSurfaces.filter(s => s.key.startsWith('canopy_') || s.key === 'backwall')
      } else if (designOption === 'all-sides') {
        filteredSurfaces = allSurfaces
      } else {
        filteredSurfaces = allSurfaces.filter(s => s.key.startsWith('canopy_'))
      }
      return filteredSurfaces
    }
    return [{ key: 'front', name: 'Design', description: 'Main design' }]
  }

  // Get all surfaces for multi-surface products
  const getAllSurfaces = () => {
    return getSurfaceNames()
  }

  // Check if current product has multiple surfaces
  const hasMultipleSurfaces = () => {
    return productType === 'tin' || productType === 'tent'
  }

  // Handle surface approval
  const handleSurfaceApproval = (surfaceKey) => {
    setApprovedSurfaces(prev => {
      const newSet = new Set(prev)
      if (newSet.has(surfaceKey)) {
        newSet.delete(surfaceKey)
      } else {
        newSet.add(surfaceKey)
      }
      return newSet
    })
  }

  // Navigate between surfaces
  const navigateToSurface = (index) => {
    const surfaces = getAllSurfaces()
    if (surfaces && surfaces[index]) {
      setSelectedSurface(surfaces[index].key)
      setCurrentSurfaceIndex(index)
    }
  }

   // KONVA-ONLY IMAGE LOADING - No more Canvas2D conflicts!
   useEffect(() => {
     const loadPreviewImage = async () => {
       console.log('🎨 KONVA-ONLY: Loading preview image - isOpen:', isOpen, 'orderDetails:', !!orderDetails, 'canvasData:', !!canvasData)
       
       if (isOpen && (orderDetails || canvasData)) {
         console.log('🎨 KONVA-ONLY: Canvas data available:', !!canvasData)
         console.log('🎨 KONVA-ONLY: Selected surface:', selectedSurface, 'Current surface:', currentSurface)
         
         // Get surface images from multiple sources
         const surfaceImages = orderDetails?.surface_images || canvasData?.surface_images
         console.log('🎨 DEBUG: Available surface images keys:', Object.keys(surfaceImages || {}))
         console.log('🎨 DEBUG: Looking for surface:', selectedSurface)
         
         // PRIORITY 1: Use stored surface image for selected surface (MOST RELIABLE!)
         if (surfaceImages && surfaceImages[selectedSurface]) {
           console.log('🎨 ✅ USING STORED SURFACE IMAGE for:', selectedSurface)
           setPreviewImage(surfaceImages[selectedSurface])
           return
         }
         
         // PRIORITY 2: Use Konva native export for current surface if selected surface matches
         if (selectedSurface === currentSurface && canvasData?.konvaStageImage) {
           console.log('🎨 ✅ USING KONVA NATIVE EXPORT - Perfect alignment guaranteed!')
           setPreviewImage(canvasData.konvaStageImage)
           return
         }
         
         // PRIORITY 3: Use main canvas image (captured with Konva) for current surface only
         const canvasImage = orderDetails?.canvas_image || canvasData?.canvas_image
         if (canvasImage) {
           if (!hasMultipleSurfaces() || selectedSurface === currentSurface) {
             console.log('🎨 ✅ Using stored Konva canvas image for current surface')
             setPreviewImage(canvasImage)
             return
           }
         }
        
         // NO FALLBACK TO CANVAS2D - Force proper Konva capture
         console.warn('🚫 NO IMAGE AVAILABLE - Canvas2D generation has been PURGED!')
         console.warn('🚫 Ensure all surfaces are captured using Konva stageRef.current.toDataURL()')
         console.warn('🚫 Selected surface:', selectedSurface, 'Current surface:', currentSurface)
         console.warn('🚫 Available surface images:', Object.keys(surfaceImages || {}))
         console.warn('🚫 Konva stage image available:', !!canvasData?.konvaStageImage)
         
         // PRIORITY 4: If selected surface is current surface, use Konva stage image anyway
         if (selectedSurface === currentSurface && canvasData?.konvaStageImage) {
           console.log('🎨 ⚠️ FALLBACK: Using Konva stage image for missing surface data')
           setPreviewImage(canvasData.konvaStageImage)
           return
         }
         
         setPreviewImage(null)
      }
    }
    
    loadPreviewImage()
  }, [isOpen, orderDetails, canvasData, selectedSurface, currentSurface])

  // Handle surface navigation
  const handlePreviousSurface = () => {
    const surfaces = getAllSurfaces()
    const newIndex = currentSurfaceIndex > 0 ? currentSurfaceIndex - 1 : surfaces.length - 1
    navigateToSurface(newIndex)
  }

  const handleNextSurface = () => {
    const surfaces = getAllSurfaces()
    const newIndex = currentSurfaceIndex < surfaces.length - 1 ? currentSurfaceIndex + 1 : 0
    navigateToSurface(newIndex)
  }

  // Generate watermarked image for downloads
  const generateWatermarkedImage = async (originalImageDataURL) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      const img = new Image()
      img.onload = () => {
        // Set canvas size to match image
        canvas.width = img.width
        canvas.height = img.height
        
        // Draw the original image
        ctx.drawImage(img, 0, 0)
        
        // Load and draw watermark
        const watermarkImg = new Image()
        watermarkImg.onload = () => {
          // Calculate watermark pattern
          const watermarkWidth = Math.min(canvas.width / 4, 300)
          const watermarkHeight = (watermarkImg.height / watermarkImg.width) * watermarkWidth
          
          // Set watermark properties
          ctx.globalAlpha = 0.3
          ctx.globalCompositeOperation = 'multiply'
          
          // Draw repeating watermark pattern
          for (let x = 0; x < canvas.width; x += watermarkWidth * 1.5) {
            for (let y = 0; y < canvas.height; y += watermarkHeight * 1.5) {
              ctx.drawImage(watermarkImg, x, y, watermarkWidth, watermarkHeight)
            }
          }
          
          // Reset context properties
          ctx.globalAlpha = 1
          ctx.globalCompositeOperation = 'source-over'
          
          // Return watermarked image as data URL
          resolve(canvas.toDataURL('image/png', 0.9))
        }
        
        watermarkImg.onerror = () => {
          console.warn('Watermark image failed to load, using original image')
          resolve(originalImageDataURL)
        }
        
        watermarkImg.src = '/assets/images/BuyPrintz_Watermark_1200px_72dpi.png'
      }
      
      img.onerror = () => {
        console.error('Failed to load original image for watermarking')
        resolve(originalImageDataURL)
      }
      
      img.src = originalImageDataURL
    })
  }

  // Create PDF from Konva image (production quality)
  const createPDFFromImage = async (imageDataURL) => {
    try {
      let pdfWidthInches, pdfHeightInches
      
      if (productType === 'tent') {
        // For tents, use pixel dimensions converted to inches at 150 DPI
        const canvasSize = canvasData?.canvasSize || { width: 1160, height: 1049 }
        pdfWidthInches = canvasSize.width / 150
        pdfHeightInches = canvasSize.height / 150
      } else {
        // For banners and tins, convert feet to inches for printing
        const printWidthFeet = parseFloat(dimensions.width) || 2
        const printHeightFeet = parseFloat(dimensions.height) || 4
        pdfWidthInches = printWidthFeet * 12
        pdfHeightInches = printHeightFeet * 12
      }

      // Create PDF with actual print dimensions and production quality settings
      const pdf = new jsPDF({
        orientation: pdfWidthInches > pdfHeightInches ? 'landscape' : 'portrait',
        unit: 'in',
        format: [pdfWidthInches, pdfHeightInches],
        compress: false, // No compression for maximum quality
        precision: 16 // Maximum precision for production quality
      })

      // Add the Konva image to PDF with maximum quality settings
      pdf.addImage(imageDataURL, 'PNG', 0, 0, pdfWidthInches, pdfHeightInches, undefined, 'MEDIUM', 0)

      // Create blob for production
      const pdfBlob = pdf.output('blob')
      setPdfBlob(pdfBlob)
      
      console.log('✅ Production-quality PDF created from Konva export!')
      return pdfBlob
    } catch (error) {
      console.error('Error creating production PDF:', error)
      throw error
    }
  }

  const handleApprove = async () => {
    if (previewImage) {
      // Generate watermarked version for approval (IP protection)
      const watermarkedImage = await generateWatermarkedImage(previewImage)
      await createPDFFromImage(watermarkedImage)
      onApprove?.()
    }
  }

  const handleDownload = async () => {
    if (!previewImage) return
    
    try {
      setIsGenerating(true)
      
      // Generate watermarked version for download (IP protection)
      const watermarkedImage = await generateWatermarkedImage(previewImage)
      const pdfBlob = await createPDFFromImage(watermarkedImage)
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${productType}-design-production.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const surfaces = getAllSurfaces()
  const currentSurfaceData = surfaces.find(s => s.key === selectedSurface)

  // Calculate actual DPI based on canvas size and product dimensions
  const calculateDPI = () => {
    if (productType === 'tent') {
      // Tent canopy: 1160x1049 pixels for approximately 10x10 ft tent
      const canvasSize = canvasData?.canvasSize || { width: 1160, height: 1049 }
      // Approximate tent dimensions in inches (10ft = 120 inches)
      const physicalWidth = 120 // inches
      const dpi = Math.round(canvasSize.width / physicalWidth)
      return dpi
    } else if (productType === 'tin') {
      // Business card tin: typically 3.5" x 2" 
      const physicalWidth = 3.5 // inches
      const canvasSize = canvasData?.canvasSize || { width: 374, height: 225 }
      const dpi = Math.round(canvasSize.width / physicalWidth)
      return dpi
    } else {
      // Banner: use provided dimensions or default
      const widthFeet = parseFloat(dimensions?.width) || 2
      const physicalWidth = widthFeet * 12 // convert to inches
      const canvasSize = canvasData?.canvasSize || { width: 800, height: 600 }
      const dpi = Math.round(canvasSize.width / physicalWidth)
      return dpi
    }
  }

  const currentDPI = calculateDPI()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] mx-auto overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Print Preview - {productType.charAt(0).toUpperCase() + productType.slice(1)}
            {hasMultipleSurfaces() && (
              <Badge variant="outline" className="ml-2">
                {currentSurfaceData?.name || selectedSurface}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
           {/* Left Column: Preview + Quality Assurance */}
           <div className="lg:col-span-2 space-y-4 lg:space-y-6">
             {/* Design Preview */}
             <Card className="overflow-hidden">
               <CardHeader className="pb-3">
                 <CardTitle className="text-lg flex items-center justify-between">
                   <span>Design Preview</span>
                   {hasMultipleSurfaces() && (
                     <div className="flex items-center gap-2">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={handlePreviousSurface}
                         disabled={surfaces.length <= 1}
                       >
                         ← Previous
                       </Button>
                       <span className="text-sm text-muted-foreground">
                         {currentSurfaceIndex + 1} of {surfaces.length}
                       </span>
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={handleNextSurface}
                         disabled={surfaces.length <= 1}
                       >
                         Next →
                       </Button>
                     </div>
                   )}
                 </CardTitle>
               </CardHeader>
               <CardContent className="overflow-hidden">
                  <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-50 rounded-lg flex items-center justify-center p-2 md:p-4">
                    {previewImage ? (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <img 
                          src={previewImage} 
                          alt="Design Preview"
                          className="object-contain rounded shadow-lg max-w-full max-h-full"
                          style={{
                            transform: `scale(${imageScale})`,
                            transition: 'transform 0.2s ease-in-out',
                            width: 'auto',
                            height: 'auto'
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                          draggable={false}
                        />
                        {/* BuyPrintz Watermark Overlay for IP Protection */}
                        <div 
                          className="absolute inset-0 pointer-events-none z-50"
                          style={{
                            backgroundImage: `url('/assets/images/BuyPrintz_Watermark_1200px_72dpi.png')`,
                            backgroundSize: 'contain',
                            backgroundRepeat: 'repeat',
                            backgroundPosition: 'center',
                            opacity: 0.3,
                            mixBlendMode: 'multiply',
                            userSelect: 'none',
                            webkitUserSelect: 'none',
                            mozUserSelect: 'none',
                            msUserSelect: 'none',
                            pointerEvents: 'none',
                            zIndex: 9999
                          }}
                          onContextMenu={(e) => e.preventDefault()}
                          onDragStart={(e) => e.preventDefault()}
                          onSelectStart={(e) => e.preventDefault()}
                        />
                      </div>
                    ) : (
                      <div className="text-center space-y-3">
                        <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto" />
                         <div>
                           <p className="text-lg font-medium text-gray-900">Preview Not Available</p>
                           <p className="text-sm text-gray-500 mt-1">
                             Please save your design and try again.
                           </p>
                         </div>
                      </div>
                    )}
                  </div>
               </CardContent>
             </Card>

             {/* Quality Assurance */}
             <Card>
               <CardHeader className="pb-3">
                 <CardTitle className="text-lg">Quality Assurance</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                   <p className="text-sm font-medium text-amber-800 mb-2">Important Notice</p>
                   <p className="text-sm text-amber-700">
                     Please review all surfaces carefully. Orders are <strong>non-refundable</strong> once approved and sent to production.
                   </p>
                 </div>
                 <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                   <p className="text-sm font-medium text-green-800 mb-2">Quality Guarantee</p>
                   <p className="text-sm text-green-700">
                     All designs are reviewed for print quality and technical requirements before production begins.
                   </p>
                 </div>
               </CardContent>
             </Card>
           </div>

           {/* Right Column: Surfaces + Print Specs + Actions */}
           <div className="space-y-4 lg:space-y-6">
             {/* All Surfaces */}
             {hasMultipleSurfaces() && (
               <Card>
                 <CardHeader className="pb-3">
                   <CardTitle className="text-lg">All Surfaces</CardTitle>
                 </CardHeader>
                 <CardContent className="overflow-y-auto max-h-[250px] md:max-h-[350px] lg:max-h-[400px]">
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
                 </CardContent>
               </Card>
             )}

             {/* Print Specifications */}
             <Card>
               <CardHeader className="pb-2">
                 <CardTitle className="text-sm">Print Specifications</CardTitle>
               </CardHeader>
               <CardContent className="space-y-2">
                 <div className="grid grid-cols-2 gap-2 text-xs">
                   <div className="bg-white p-2 rounded border">
                     <p className="font-medium text-gray-600 mb-1">Resolution</p>
                     <div className="flex items-center gap-1">
                       <span className="text-gray-900 font-medium">{currentDPI} DPI</span>
                       {currentDPI >= 150 ? (
                         <span className="text-green-600 text-xs">✓</span>
                       ) : currentDPI >= 100 ? (
                         <span className="text-yellow-600 text-xs">⚠</span>
                       ) : (
                         <span className="text-red-600 text-xs">⚠</span>
                       )}
                     </div>
                   </div>
                   <div className="bg-white p-2 rounded border">
                     <p className="font-medium text-gray-600 mb-1">Color</p>
                     <p className="text-gray-900 font-medium">CMYK</p>
                   </div>
                 </div>
                 <div className="bg-blue-50 border border-blue-200 p-2 rounded text-xs">
                   <p className="text-blue-700">
                     {currentDPI >= 150 ? 'Excellent quality' :
                      currentDPI >= 100 ? 'Good quality' :
                      'Consider higher resolution'}
                   </p>
                 </div>
               </CardContent>
             </Card>

             {/* Actions */}
             <Card>
               <CardHeader className="pb-3">
                 <CardTitle className="text-lg">Actions</CardTitle>
               </CardHeader>
               <CardContent className="space-y-3">
                 <Button
                   onClick={handleDownload}
                   disabled={!previewImage || isGenerating}
                   className="w-full"
                   variant="outline"
                 >
                   <Download className="h-4 w-4 mr-2" />
                   {isGenerating ? 'Generating PDF...' : 'Download Production PDF'}
                 </Button>
                 
                 <Button
                   onClick={handleApprove}
                   disabled={!previewImage}
                   className="w-full bg-green-600 hover:bg-green-700"
                 >
                   <CheckCircle className="h-4 w-4 mr-2" />
                   Approve Design
                 </Button>
               </CardContent>
             </Card>
           </div>
         </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PrintPreviewModal
