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
  dimensions 
}) => {
  const [pdfBlob, setPdfBlob] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewImage, setPreviewImage] = useState(null)
  const [imageScale, setImageScale] = useState(1.5)

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
      // Convert feet to inches for printing
      const printWidthFeet = parseFloat(dimensions.width) || 2
      const printHeightFeet = parseFloat(dimensions.height) || 4
      const pdfWidthInches = printWidthFeet * 12
      const pdfHeightInches = printHeightFeet * 12

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
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Preview & Approval
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
                       <p className="text-sm text-gray-600">Generating your banner preview...</p>
                     </div>
                   </div>
                 ) : previewImage ? (
                   <div className="space-y-3 sm:space-y-4">
                                         {/* Main Banner Preview */}
                                                                                       <div className="bg-gray-100 rounded-lg p-1 sm:p-6 flex items-center justify-center overflow-visible sm:overflow-hidden">
                        <div className="relative flex items-center justify-center w-full" style={{ 
                          minHeight: window.innerWidth < 768 ? '180px' : '280px',
                          maxHeight: window.innerWidth < 768 ? '220px' : '320px',
                          // Mobile positioning adjustments - 30% larger, ultimate positioning
                          transform: window.innerWidth < 768 ? 'translate(75%, 70%) scale(1.3)' : 'none'
                        }}>
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
                              transformOrigin: 'center center',
                              // Ensure mobile positioning is correct
                              display: 'block',
                              margin: '0 auto'
                            }}
                            onLoad={handleImageLoad}
                          />
                         
                         {/* BuyPrintz Watermark Overlay - IP Protection - Only cover the image, not the entire viewport */}
                         <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 10 }}>
                           <img
                             src="/assets/images/BuyPrintz_Watermark_1200px_72dpi.png"
                             alt="BuyPrintz Watermark"
                             className="w-full h-full object-cover opacity-30"
                             style={{
                               position: 'absolute',
                               top: 0,
                               left: 0,
                               zIndex: 10
                             }}
                           />
                         </div>
                        
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs" style={{ zIndex: 20 }}>
                          Preview
                        </div>
                      </div>
                    </div>

                    {/* Print Information */}
                    <div className="bg-green-50 rounded-lg p-2 sm:p-4">
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-900">
                          {dimensions.width}ft × {dimensions.height}ft - Production Ready
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
                          link.download = `banner-design-${orderDetails.banner_type || 'custom'}.png`
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
                      {dimensions.width}ft × {dimensions.height}ft
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-sm font-medium text-gray-600">Material</p>
                    <Badge variant="outline">
                      {orderDetails.banner_material || 'Standard Vinyl'}
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-sm font-medium text-gray-600">Finish</p>
                    <Badge variant="outline">
                      {orderDetails.banner_finish || 'Matte'}
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-sm font-medium text-gray-600">Quantity</p>
                    <Badge variant="outline">
                      {orderDetails.quantity} piece(s)
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-sm font-medium text-gray-600">Resolution</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      300 DPI
                    </Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <p className="text-sm font-medium text-gray-600">Color Profile</p>
                                         <Badge variant="outline" className="bg-blue-50 text-blue-700">
                       CMYK
                     </Badge>
                  </div>
                                 </div>
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
            
            <Button
              onClick={handleApprove}
              disabled={!orderDetails?.canvas_image}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Check className="h-4 w-4" />
              Approve & Print
            </Button>
          </div>
          

        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PrintPreviewModal
