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
  const [imageScale, setImageScale] = useState(1.5)
  const [selectedSurface, setSelectedSurface] = useState(currentSurface)
  const [approvedSurfaces, setApprovedSurfaces] = useState(new Set())
  const [currentSurfaceIndex, setCurrentSurfaceIndex] = useState(0)

  // Get surface names based on product type and design option
  const getSurfaceNames = () => {
    if (productType === 'tin') {
      return [
        { key: 'front', name: 'Front', description: 'Main front surface' },
        { key: 'back', name: 'Back', description: 'Back surface' },
        { key: 'inside', name: 'Inside', description: 'Inside surface' },
        { key: 'lid', name: 'Lid', description: 'Lid surface' }
      ]
    } else if (productType === 'tent') {
      const allSurfaces = [
        { key: 'canopy_front', name: 'Canopy Front', description: 'Front canopy surface' },
        { key: 'canopy_back', name: 'Canopy Back', description: 'Back canopy surface' },
        { key: 'canopy_left', name: 'Canopy Left', description: 'Left canopy surface' },
        { key: 'canopy_right', name: 'Canopy Right', description: 'Right canopy surface' },
        { key: 'sidewall_left', name: 'Left Sidewall', description: 'Left sidewall panel' },
        { key: 'sidewall_right', name: 'Right Sidewall', description: 'Right sidewall panel' },
        { key: 'backwall', name: 'Back Wall', description: 'Back wall panel' }
      ]
      
      // Filter surfaces based on design option
      const designOption = orderDetails?.design_option || 'canopy-only'
      if (designOption === 'canopy-only') {
        return allSurfaces.filter(s => s.key.startsWith('canopy_'))
      } else if (designOption === 'canopy-backwall') {
        return allSurfaces.filter(s => s.key.startsWith('canopy_') || s.key === 'backwall')
      } else {
        return allSurfaces // all-sides
      }
    }
    return [{ key: 'front', name: 'Design', description: 'Main design' }]
  }

  // Get tent surface dimensions
  const getTentSurfaceDimensions = (surfaceKey) => {
    const tentDimensions = {
      'canopy_front': { width: 1160, height: 789, shape: 'triangular' },
      'canopy_back': { width: 1160, height: 789, shape: 'triangular' },
      'canopy_left': { width: 1160, height: 789, shape: 'triangular' },
      'canopy_right': { width: 1160, height: 789, shape: 'triangular' },
      'sidewall_left': { width: 1110, height: 390, shape: 'rectangular' },
      'sidewall_right': { width: 1110, height: 390, shape: 'rectangular' },
      'backwall': { width: 1110, height: 780, shape: 'rectangular' }
    }
    return tentDimensions[surfaceKey] || { width: 1160, height: 789, shape: 'triangular' }
  }

  // Get current surface dimensions
  const getCurrentSurfaceDimensions = () => {
    if (productType === 'tent') {
      return getTentSurfaceDimensions(selectedSurface)
    }
    return dimensions
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
    if (index >= 0 && index < surfaces.length) {
      setCurrentSurfaceIndex(index)
      setSelectedSurface(surfaces[index].key)
    }
  }

  // Check if all surfaces are approved
  const areAllSurfacesApproved = () => {
    if (!hasMultipleSurfaces()) return true
    const surfaces = getAllSurfaces()
    return surfaces.every(surface => approvedSurfaces.has(surface.key))
  }

  // Get approval progress
  const getApprovalProgress = () => {
    if (!hasMultipleSurfaces()) return { current: 1, total: 1 }
    const surfaces = getAllSurfaces()
    return {
      current: approvedSurfaces.size,
      total: surfaces.length
    }
  }

  // Set preview image when modal opens - NO PDF generation for preview
  useEffect(() => {
    if (isOpen && orderDetails?.canvas_image) {
      console.log('Setting high-quality canvas image for preview!')
      setPreviewImage(orderDetails.canvas_image)
      setIsGenerating(false)
    } else if (isOpen && !orderDetails?.canvas_image) {
      console.warn('No canvas image available for preview!')
      setPreviewImage(null)
      setIsGenerating(false)
    }
  }, [isOpen, orderDetails])

  // Debug image dimensions when it loads
  const handleImageLoad = (event) => {
    const img = event.target
    console.log('Image loaded:', {
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      clientWidth: img.clientWidth,
      clientHeight: img.clientHeight,
      offsetWidth: img.offsetWidth,
      offsetHeight: img.offsetHeight
    })
  }

  // Set image scale based on screen size
  useEffect(() => {
    const updateScale = () => {
      if (window.innerWidth < 768) {
        setImageScale(2.0) // Moderate scaling on mobile for better fit
      } else {
        setImageScale(1.0) // No scaling on desktop to maintain original behavior
      }
    }
    
    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [])

  // Generate PDF only when user approves (for production)
  const generatePDFForProduction = async () => {
    try {
      setIsGenerating(true)
      
      if (orderDetails?.canvas_image) {
        console.log('Generating production PDF from high-quality canvas image...')
        const pdfBlob = await createPDFFromImage(orderDetails.canvas_image)
        return pdfBlob // Return the PDF blob
      } else {
        console.error('No canvas image available for PDF generation!')
        throw new Error('No canvas image available')
      }
    } catch (error) {
      console.error('Error generating production PDF:', error)
      throw error
    } finally {
      setIsGenerating(false)
    }
  }

  // Create PDF directly from canvas image (production quality)
  const createPDFFromImage = async (imageDataURL) => {
    try {
      let pdfWidthInches, pdfHeightInches
      
      if (productType === 'tent') {
        // For tents, use pixel dimensions converted to inches at 150 DPI
        const surfaceDims = getCurrentSurfaceDimensions()
        pdfWidthInches = surfaceDims.width / 150 // Convert pixels to inches at 150 DPI
        pdfHeightInches = surfaceDims.height / 150
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

      // Add the canvas image to PDF with maximum quality settings
      // Use 'MEDIUM' quality for best balance of quality and file size
      pdf.addImage(imageDataURL, 'PNG', 0, 0, pdfWidthInches, pdfHeightInches, undefined, 'MEDIUM', 0)

      // Create blob for production
      const pdfBlob = pdf.output('blob')
      setPdfBlob(pdfBlob) // Also update state for other uses
      
      console.log('Production-quality PDF created successfully!')
      return pdfBlob // Return the blob
    } catch (error) {
      console.error('Error creating production PDF:', error)
      throw error
    }
  }

  const handleApprove = async () => {
    try {
      // Generate PDF for production only when user approves
      const pdfBlob = await generatePDFForProduction()
      
      // Now we have the PDF blob, proceed with approval
      if (pdfBlob) {
        console.log('PDF generated successfully, proceeding with approval')
        onApprove(pdfBlob)
      } else {
        console.error('PDF generation failed - cannot approve')
        alert('PDF generation failed. Please try again.')
      }
    } catch (error) {
      console.error('Error in approval process:', error)
      alert('Error generating production PDF. Please try again.')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-full overflow-y-auto p-1 sm:p-4">
        <DialogHeader className="pb-4 sm:pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Printer className="h-5 w-5" />
              Print Preview & Approval
            </div>
            {hasMultipleSurfaces() && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Progress:</span>
                <span className="font-semibold text-blue-600">
                  {getApprovalProgress().current}/{getApprovalProgress().total} Surfaces Approved
                </span>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-6 pb-2 sm:pb-6">
          {/* Left Column - Preview */}
          <div className="space-y-2 sm:space-y-4">
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Design Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                 {isGenerating ? (
                   <div className="flex items-center justify-center p-4 sm:p-12">
                     <div className="text-center space-y-2">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                       <p className="text-sm text-gray-600">Generating your {productType} preview...</p>
                     </div>
                   </div>
                 ) : previewImage ? (
                   <div className="space-y-3 sm:space-y-4">
                     {/* Multi-Surface Preview for Tins and Tents */}
        {(productType === 'tin' || productType === 'tent') ? (
          <div className="space-y-4">
            {/* Surface Selection with Approval Status */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900">Review All Surfaces</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {getSurfaceNames().map((surface, index) => (
                  <div key={surface.key} className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedSurface(surface.key)
                        setCurrentSurfaceIndex(index)
                      }}
                      className={`w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between ${
                        selectedSurface === surface.key
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      title={surface.description}
                    >
                      <span>{surface.name}</span>
                      {approvedSurfaces.has(surface.key) && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </button>
                    <button
                      onClick={() => handleSurfaceApproval(surface.key)}
                      className={`w-full px-2 py-1 rounded text-xs transition-all duration-200 ${
                        approvedSurfaces.has(surface.key)
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {approvedSurfaces.has(surface.key) ? '✓ Approved' : 'Approve'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
                         
                         {/* Surface Preview with Navigation */}
                         <div className="space-y-3">
                           <div className="flex items-center justify-between">
                             <h5 className="font-medium text-gray-900">
                               {getSurfaceNames().find(s => s.key === selectedSurface)?.name} Preview
                             </h5>
                             <div className="flex items-center gap-2">
                               <button
                                 onClick={() => navigateToSurface(currentSurfaceIndex - 1)}
                                 disabled={currentSurfaceIndex === 0}
                                 className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                               >
                                 ←
                               </button>
                               <span className="text-sm text-gray-600">
                                 {currentSurfaceIndex + 1} of {getSurfaceNames().length}
                               </span>
                               <button
                                 onClick={() => navigateToSurface(currentSurfaceIndex + 1)}
                                 disabled={currentSurfaceIndex === getSurfaceNames().length - 1}
                                 className="p-1 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
                               >
                                 →
                               </button>
                             </div>
                           </div>
                           
                           <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center overflow-hidden">
                             <div className="relative flex items-center justify-center w-full" style={{ 
                               minHeight: window.innerWidth < 768 ? '200px' : '280px',
                               maxHeight: window.innerWidth < 768 ? '240px' : '320px',
                             }}>
                               {previewImage ? (
                                 <img
                                   src={previewImage}
                                   alt={`${productType} ${selectedSurface} Preview`}
                                   className={`border shadow-lg ${productType === 'tin' ? 'rounded-lg' : 'rounded'}`}
                                   style={{
                                     width: 'auto',
                                     height: 'auto',
                                     maxWidth: '100%',
                                     maxHeight: window.innerWidth < 768 ? '180px' : '280px',
                                     minHeight: window.innerWidth < 768 ? '120px' : '250px',
                                     objectFit: 'contain',
                                     transform: `scale(${imageScale})`,
                                     transformOrigin: 'center center',
                                     borderRadius: productType === 'tin' ? '2.3px' : undefined
                                   }}
                                   onLoad={handleImageLoad}
                                 />
                               ) : (
                                 <div className="text-center text-gray-500 p-8">
                                   <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                   <p className="text-sm">No preview available for {selectedSurface}</p>
                                 </div>
                               )}
                             </div>
                           </div>
                           
                           {/* Current Surface Approval */}
                           <div className="flex items-center justify-center">
                             <button
                               onClick={() => handleSurfaceApproval(selectedSurface)}
                               className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                                 approvedSurfaces.has(selectedSurface)
                                   ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                   : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                               }`}
                             >
                               {approvedSurfaces.has(selectedSurface) ? (
                                 <>
                                   <CheckCircle className="w-4 h-4 inline mr-2" />
                                   Approved
                                 </>
                               ) : (
                                 'Approve This Surface'
                               )}
                             </button>
                           </div>
                         </div>
                       </div>
                     ) : (
                       /* Banner Preview */
                       <div className="bg-gray-100 rounded-lg p-1 sm:p-6 flex items-center justify-center overflow-hidden">
                         <div className="relative flex items-center justify-center w-full" style={{ 
                           minHeight: window.innerWidth < 768 ? '200px' : '280px',
                           maxHeight: window.innerWidth < 768 ? '240px' : '320px',
                           transform: window.innerWidth < 768 ? 'translate(74%, 65%) scale(1.25)' : 'none'
                         }}>
                           {previewImage ? (
                             <img
                               src={previewImage}
                               alt="Banner Design Preview"
                               className="rounded border shadow-lg"
                               style={{
                                 width: 'auto',
                                 height: 'auto',
                                 maxWidth: '100%',
                                 maxHeight: window.innerWidth < 768 ? '180px' : '280px',
                                 minHeight: window.innerWidth < 768 ? '120px' : '250px',
                                 objectFit: 'contain',
                                 transform: `scale(${imageScale})`,
                                 transformOrigin: 'center center'
                               }}
                               onLoad={handleImageLoad}
                             />
                           ) : (
                             <div className="text-center text-gray-500 p-8">
                               <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                               <p className="text-sm">No preview available</p>
                             </div>
                           )}
                           
                           {/* BuyPrintz Watermark Overlay - IP Protection - Aligned with canvas */}
                           <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                             <img
                               src="/assets/images/BuyPrintz_Watermark_1200px_72dpi.png"
                               alt="BuyPrintz Watermark"
                               className="w-full h-full object-cover opacity-30"
                               style={{
                                 position: 'absolute',
                                 top: 0,
                                 left: 0,
                                 zIndex: 10,
                                 opacity: 0.3,
                                 // Mobile positioning to match canvas transform
                                 transform: window.innerWidth < 768 ? 'translate(74%, 65%) scale(1.25)' : 'none'
                               }}
                             />
                           </div>
                          
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs" style={{ 
                            zIndex: 20,
                            // Mobile positioning to match canvas transform
                            transform: window.innerWidth < 768 ? 'translate(74%, 65%) scale(1.25)' : 'none'
                          }}>
                            Preview
                          </div>
                         </div>
                       </div>
                     )}
                     
                     {/* Print Information */}
                     <div className="bg-green-50 rounded-lg p-2 sm:p-4">
                       <div className="text-center">
                         <p className="text-sm font-medium text-green-900">
                           {productType === 'tent' ? (
                             `${getCurrentSurfaceDimensions().width}px × ${getCurrentSurfaceDimensions().height}px - ${getCurrentSurfaceDimensions().shape}`
                           ) : (
                             `${dimensions.width}ft × ${dimensions.height}ft`
                           )} - Production Ready
                         </p>
                         <p className="text-xs text-green-700 mt-1">
                           This is the exact image that will be printed
                         </p>
                       </div>
                     </div>

                     {/* Quick Actions */}
                     <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                       <Button
                         variant="outline"
                         onClick={() => {
                           const link = document.createElement('a')
                           let filename = 'design'
                           
                           if (productType === 'tent') {
                             filename = `tent-${orderDetails?.tent_size || '10x10'}-${selectedSurface}`
                           } else if (productType === 'tin') {
                             filename = `tin-${selectedSurface}`
                           } else {
                             filename = `banner-${orderDetails?.banner_type || 'custom'}`
                           }
                           
                           link.download = `${filename}.png`
                           link.href = previewImage
                           link.click()
                         }}
                         className="flex items-center gap-2"
                       >
                         <Download className="h-4 w-4" />
                         Download Production Image
                       </Button>
                     </div>
                   </div>
                 ) : (
                  <div className="flex items-center justify-center p-6 sm:p-12">
                    <div className="text-center space-y-2">
                      <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                      <p className="text-sm text-gray-600">No preview available</p>
                    </div>
                  </div>
                 )}
               </CardContent>
            </Card>
          </div>

          {/* Right Column - Specifications */}
          <div className="space-y-2 sm:space-y-4">
            {/* Print Specifications */}
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Print Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-sm font-medium text-gray-600">Dimensions</p>
                    <Badge variant="outline">
                      {productType === 'tent' ? (
                        `${getCurrentSurfaceDimensions().width}px × ${getCurrentSurfaceDimensions().height}px`
                      ) : (
                        `${dimensions.width}ft × ${dimensions.height}ft`
                      )}
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-sm font-medium text-gray-600">Material</p>
                    <Badge variant="outline">
                      {productType === 'tent' ? (
                        orderDetails?.tent_material || '6oz Tent Fabric'
                      ) : productType === 'tin' ? (
                        'Premium Vinyl Stickers'
                      ) : (
                        orderDetails?.banner_material || 'Standard Vinyl'
                      )}
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-sm font-medium text-gray-600">
                      {productType === 'tent' ? 'Print Method' : 'Finish'}
                    </p>
                    <Badge variant="outline">
                      {productType === 'tent' ? (
                        orderDetails?.tent_print_method || 'Dye-Sublimation'
                      ) : productType === 'tin' ? (
                        orderDetails?.tin_finish || 'Silver'
                      ) : (
                        orderDetails?.banner_finish || 'Matte'
                      )}
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-sm font-medium text-gray-600">Quantity</p>
                    <Badge variant="outline">
                      {orderDetails?.quantity || 1} piece(s)
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-sm font-medium text-gray-600">Resolution</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      {productType === 'tent' ? '150 DPI' : '300 DPI'}
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-sm font-medium text-gray-600">Color Profile</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      CMYK
                    </Badge>
                  </div>
                </div>
                
                {/* Tent-specific specifications */}
                {productType === 'tent' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2 sm:space-y-3">
                        <p className="text-sm font-medium text-gray-600">Tent Size</p>
                        <Badge variant="outline">
                          {orderDetails?.tent_size || '10x10'}
                        </Badge>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <p className="text-sm font-medium text-gray-600">Frame Type</p>
                        <Badge variant="outline">
                          {orderDetails?.tent_frame_type || '40mm Aluminum Hex'}
                        </Badge>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <p className="text-sm font-medium text-gray-600">Surface Shape</p>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700">
                          {getCurrentSurfaceDimensions().shape}
                        </Badge>
                      </div>
                      <div className="space-y-2 sm:space-y-3">
                        <p className="text-sm font-medium text-gray-600">Surface Type</p>
                        <Badge variant="outline" className="bg-orange-50 text-orange-700">
                          {selectedSurface.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Print Ready Status */}
            <Alert variant="success" className="p-2 sm:p-4">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Ready for Production!</strong><br />
                Your design meets all print quality requirements and is ready to be sent to our production facility.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-3 w-full pt-2 sm:pt-4 border-t mt-2 sm:mt-4 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            
            {hasMultipleSurfaces() && !areAllSurfacesApproved() && (
              <div className="flex-1 text-center py-2">
                <p className="text-sm text-amber-600 font-medium">
                  Please approve all {getApprovalProgress().total} surfaces before continuing
                </p>
              </div>
            )}
            
            <Button
              onClick={handleApprove}
              disabled={!orderDetails?.canvas_image || (hasMultipleSurfaces() && !areAllSurfacesApproved())}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Check className="h-4 w-4" />
              {hasMultipleSurfaces() ? 'Approve All & Print' : 'Approve & Print'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PrintPreviewModal