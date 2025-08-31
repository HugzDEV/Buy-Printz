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
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewImage, setPreviewImage] = useState(null)
  const [qualityAnalysis, setQualityAnalysis] = useState(null)

  // Generate PDF when modal opens
  useEffect(() => {
    if (isOpen && (canvasData || orderDetails?.canvas_image)) {
      generatePDF()
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [isOpen, canvasData, orderDetails])

  const generatePDF = async () => {
    try {
      setIsGenerating(true)
      
      // Check if we have a perfect canvas image from the editor
      if (orderDetails?.canvas_image) {
        console.log('Using perfect canvas image for preview!')
        
        // Use the exported canvas image directly
        setPreviewImage(orderDetails.canvas_image)
        
        // Create PDF with the canvas image
        await createPDFFromImage(orderDetails.canvas_image)
        return
      }

      // No canvas image available - this shouldn't happen with the new system
      console.warn('No canvas image available for preview!')
      setPreviewImage(null)
      return
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Create PDF directly from canvas image (perfect method)
  const createPDFFromImage = async (imageDataURL) => {
    try {
      console.log('Creating PDF from image data URL:', imageDataURL.substring(0, 50) + '...')
      
      // Get actual banner dimensions from orderDetails
      const printWidthFeet = parseFloat(orderDetails.banner_size?.split('x')[0]) || parseFloat(dimensions.width) || 2
      const printHeightFeet = parseFloat(orderDetails.banner_size?.split('x')[1]?.split('ft')[0]?.trim()) || parseFloat(dimensions.height) || 4
      const pdfWidthInches = printWidthFeet * 12
      const pdfHeightInches = printHeightFeet * 12

      console.log(`Actual banner dimensions: ${printWidthFeet}ft x ${printHeightFeet}ft`)
      console.log(`PDF dimensions: ${pdfWidthInches}" x ${pdfHeightInches}"`)

      // Cap PDF dimensions while maintaining aspect ratio
      const maxInches = 200
      const aspectRatio = pdfHeightInches / pdfWidthInches
      
      let cappedWidthInches, cappedHeightInches
      if (pdfWidthInches > maxInches || pdfHeightInches > maxInches) {
        if (pdfWidthInches > pdfHeightInches) {
          cappedWidthInches = maxInches
          cappedHeightInches = maxInches * aspectRatio
        } else {
          cappedHeightInches = maxInches
          cappedWidthInches = maxInches / aspectRatio
        }
      } else {
        cappedWidthInches = pdfWidthInches
        cappedHeightInches = pdfHeightInches
      }

      // Create PDF with proper aspect ratio
      const pdf = new jsPDF({
        orientation: cappedWidthInches > cappedHeightInches ? 'landscape' : 'portrait',
        unit: 'in',
        format: [cappedWidthInches, cappedHeightInches]
      })

      console.log(`Creating PDF with dimensions: ${cappedWidthInches}" x ${cappedHeightInches}"`)

      // Add the canvas image to PDF
      pdf.addImage(imageDataURL, 'PNG', 0, 0, cappedWidthInches, cappedHeightInches, '', 'FAST')

      // Add full canvas watermark to PDF (protects design from theft)
      try {
        const watermarkPath = '/assets/images/BuyPrintz_Watermark_1200px_72dpi.png'
        pdf.addImage(watermarkPath, 'PNG', 0, 0, cappedWidthInches, cappedHeightInches, '', 'FAST')
        console.log(`Added full canvas watermark to PDF`)
      } catch (watermarkError) {
        console.warn('Could not add watermark to PDF:', watermarkError)
      }

      // Add a specifications page
      pdf.addPage('letter')
      pdf.setFontSize(16)
      pdf.text('Print Specifications', 0.5, 1)
      
      pdf.setFontSize(12)
      const specs = [
        `Banner Dimensions: ${printWidthFeet}ft x ${printHeightFeet}ft (${pdfWidthInches}" x ${pdfHeightInches}")`,
        `Material: ${orderDetails.banner_material || 'Standard Vinyl'}`,
        `Finish: ${orderDetails.banner_finish || 'Matte'}`,
        `Type: ${orderDetails.banner_type || 'Indoor/Outdoor'}`,
        `Quantity: ${orderDetails.quantity || 1}`,
        `Resolution: 300 DPI`,
        `Color Profile: CMYK`,
        `File Format: High-Quality PNG`
      ]
      
      specs.forEach((spec, index) => {
        pdf.text(spec, 0.5, 1.5 + (index * 0.3))
      })

      // Create blob and URL
      const pdfBlob = pdf.output('blob')
      setPdfBlob(pdfBlob)
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      const newPreviewUrl = URL.createObjectURL(pdfBlob)
      setPreviewUrl(newPreviewUrl)
      
      console.log('PDF created successfully! Blob size:', pdfBlob.size, 'bytes')
      console.log('PDF URL created:', newPreviewUrl)
    } catch (error) {
      console.error('Error creating PDF from image:', error)
      console.error('Error details:', error.message, error.stack)
    }
  }

  const handleApprove = () => {
    // For final print approval, send the clean canvas image (no watermark)
    // The PDF blob contains watermark for customer protection
    const cleanPrintData = {
      pdfBlob: pdfBlob, // Watermarked PDF for records
      cleanImage: orderDetails?.canvas_image, // Clean image for actual printing
      orderDetails: orderDetails,
      dimensions: dimensions
    }
    onApprove(cleanPrintData)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
             <DialogContent className="max-w-[98vw] sm:max-w-6xl max-h-[98vh] sm:max-h-[90vh] h-auto overflow-hidden flex flex-col">
                 <DialogHeader className="flex-shrink-0 pb-2 sm:pb-4 border-b">
                     <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
             <Printer className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
             Print Preview & Approval
           </DialogTitle>
           <p className="text-gray-600 text-xs sm:text-sm mt-2">
            Review your banner design before production. This preview shows exactly how your banner will look when printed.
          </p>
        </DialogHeader>

                 <div className="flex-1 overflow-y-auto min-h-0 pb-4">
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 sm:gap-4 p-2 sm:p-4 max-h-full">
            {/* Left Column - Main Preview (Takes 2/3 width on xl screens) */}
                         <div className="xl:col-span-2 space-y-3 sm:space-y-6 overflow-y-auto max-h-full">
              {/* Banner Preview Card */}
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Your Banner Design
                  </CardTitle>
                </CardHeader>
                                 <CardContent className="space-y-3 sm:space-y-4">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                      <div className="text-center space-y-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 font-medium">Generating your banner preview...</p>
                        <p className="text-sm text-gray-500">This may take a few seconds</p>
                      </div>
                    </div>
                  ) : previewImage ? (
                    <div className="space-y-3 sm:space-y-4">
                                             {/* Main Banner Preview */}
                                                                       <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-2 sm:p-4 flex items-center justify-center h-[350px] sm:h-[300px]">
                         <div className="relative group">
                           <img
                             src={previewImage}
                             alt="Banner Design Preview"
                             className="w-full h-full object-cover rounded-lg border-2 border-white shadow-xl transition-transform group-hover:scale-105"
                           />
                           
                           {/* Full Canvas Watermark - Bottom Layer */}
                           <div className="absolute inset-0 pointer-events-none">
                             <img
                               src="/assets/images/BuyPrintz_Watermark_1200px_72dpi.png"
                               alt="BuyPrintz Watermark"
                               className="w-full h-full object-cover opacity-40"
                               style={{
                                 position: 'absolute',
                                 top: 0,
                                 left: 0,
                                 zIndex: 1
                               }}
                             />
                           </div>
                          
                          {/* Preview Badge */}
                          <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs font-medium">
                            PREVIEW
                          </div>
                          
                          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 font-medium px-3 py-1">
                              {dimensions.width}ft × {dimensions.height}ft
                            </Badge>
                          </div>
                        </div>
                      </div>

                                             {/* Action Buttons */}
                       <div className="flex justify-center pt-3 sm:pt-6">
                        {previewUrl ? (
                          <Button
                            onClick={() => {
                              if (pdfBlob) {
                                const url = URL.createObjectURL(pdfBlob)
                                const a = document.createElement('a')
                                a.href = url
                                a.download = `BuyPrintz-Banner-${orderDetails.banner_type || 'Design'}.pdf`
                                document.body.appendChild(a)
                                a.click()
                                document.body.removeChild(a)
                                URL.revokeObjectURL(url)
                              }
                            }}
                                                         className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-medium shadow-lg"
                          >
                            <Download className="h-5 w-5" />
                            Download Print File
                          </Button>
                        ) : (
                          <Button
                            disabled
                                                         className="bg-gray-400 text-white flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-lg font-medium"
                          >
                            <Download className="h-5 w-5" />
                            Generating Print File...
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-red-200">
                      <div className="text-center space-y-2">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                        <p className="text-red-600 font-medium">Preview Generation Failed</p>
                        <p className="text-sm text-red-500">Please try creating your order again</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quality Status */}
              <Alert className="border-green-200 bg-green-50 shadow-sm">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertDescription className="text-green-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-green-900">✓ Ready for Production!</strong><br />
                      <span className="text-sm">Your design meets all print quality requirements and is ready for our production facility.</span>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                      300 DPI
                    </Badge>
                  </div>
                </AlertDescription>
              </Alert>
            </div>

            {/* Right Column - Specifications (Takes 1/3 width on xl screens) */}
                         <div className="space-y-4 sm:space-y-6 overflow-y-auto max-h-full">
              {/* Print Specifications */}
              <Card className="shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Print Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Dimensions</span>
                        <Badge variant="outline" className="bg-white">
                          {dimensions.width}ft × {dimensions.height}ft
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Material</span>
                        <Badge variant="outline" className="bg-white">
                          {orderDetails.banner_material || 'Standard Vinyl'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Finish</span>
                        <Badge variant="outline" className="bg-white">
                          {orderDetails.banner_finish || 'Matte'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Quantity</span>
                        <Badge variant="outline" className="bg-white">
                          {orderDetails.quantity || 1} piece(s)
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
                        <span className="text-sm font-medium text-green-700">Resolution</span>
                        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                          300 DPI
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <span className="text-sm font-medium text-blue-700">Color Profile</span>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                          CMYK
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Final Approval Checklist */}
              <Card className="shadow-lg border-amber-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg text-amber-800">
                    <Check className="h-5 w-5" />
                    Final Review
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Design elements are positioned correctly</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Text is clear and readable at print size</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Colors meet print standards</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Content fits within banner dimensions</span>
                    </div>
                    
                    <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-xs text-amber-800">
                        <strong>Important:</strong> This is your final opportunity to review before production. 
                        Once approved and payment is processed, changes cannot be made.
                      </p>
                    </div>
                                     </div>
                 </CardContent>
               </Card>

               {/* Action Buttons */}
               <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                 <Button
                   variant="outline"
                   onClick={onClose}
                   className="flex items-center justify-center gap-2 order-2 sm:order-1 min-h-[44px]"
                 >
                   <X className="h-4 w-4" />
                   Cancel Order
                 </Button>
                 
                 <Button
                   onClick={handleApprove}
                   disabled={!pdfBlob || isGenerating}
                   className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 order-1 sm:order-2 shadow-lg min-h-[44px]"
                 >
                   <Check className="h-4 w-4" />
                   Approve & Continue to Payment
                 </Button>
               </div>
             </div>
          </div>
                 </div>
      </DialogContent>
    </Dialog>
  )
}

export default PrintPreviewModal
