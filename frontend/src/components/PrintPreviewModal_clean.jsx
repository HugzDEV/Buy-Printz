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
      // Convert feet to inches for printing
      const printWidthFeet = parseFloat(dimensions.width) || 2
      const printHeightFeet = parseFloat(dimensions.height) || 4
      const pdfWidthInches = printWidthFeet * 12
      const pdfHeightInches = printHeightFeet * 12

      // Create PDF with actual print dimensions
      const pdf = new jsPDF({
        orientation: pdfWidthInches > pdfHeightInches ? 'landscape' : 'portrait',
        unit: 'in',
        format: [pdfWidthInches, pdfHeightInches]
      })

      // Add the canvas image to PDF
      pdf.addImage(imageDataURL, 'PNG', 0, 0, pdfWidthInches, pdfHeightInches)

      // Create blob and URL
      const pdfBlob = pdf.output('blob')
      setPdfBlob(pdfBlob)
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
      const newPreviewUrl = URL.createObjectURL(pdfBlob)
      setPreviewUrl(newPreviewUrl)
      
      console.log('PDF created successfully from canvas image!')
    } catch (error) {
      console.error('Error creating PDF from image:', error)
    }
  }

  const handleApprove = () => {
    onApprove(pdfBlob)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Print Preview & Approval
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Design Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isGenerating ? (
                  <div className="flex items-center justify-center p-12">
                    <div className="text-center space-y-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-sm text-gray-600">Generating your banner preview...</p>
                    </div>
                  </div>
                ) : previewImage ? (
                  <div className="space-y-4">
                    {/* Main Banner Preview */}
                    <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center">
                      <div className="relative">
                        <img
                          src={previewImage}
                          alt="Banner Design Preview"
                          className="max-w-full max-h-96 rounded border shadow-lg"
                          style={{
                            maxWidth: '600px',
                            height: 'auto'
                          }}
                        />
                        <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-xs">
                          Preview
                        </div>
                      </div>
                    </div>

                    {/* Print Information */}
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-center">
                        <p className="text-sm font-medium text-blue-900">
                          {dimensions.width}ft × {dimensions.height}ft - Print Ready
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 justify-center">
                      <Button
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a')
                          link.download = `banner-design-${orderDetails.banner_type || 'custom'}.jpg`
                          link.href = previewImage
                          link.click()
                        }}
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Preview
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center p-12">
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
          <div className="space-y-4">
            {/* Print Specifications */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Print Specifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Dimensions</p>
                    <Badge variant="outline">
                      {dimensions.width}ft × {dimensions.height}ft
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Material</p>
                    <Badge variant="outline">
                      {orderDetails.banner_material || 'Standard Vinyl'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Finish</p>
                    <Badge variant="outline">
                      {orderDetails.banner_finish || 'Matte'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Quantity</p>
                    <Badge variant="outline">
                      {orderDetails.quantity} piece(s)
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Resolution</p>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      300 DPI
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-600">Color Profile</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      CMYK
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Print Ready Status */}
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Ready for Production!</strong><br />
                Your design meets all print quality requirements and is ready to be sent to our production facility.
              </AlertDescription>
            </Alert>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancel
            </Button>
            
            {previewUrl && (
              <Button
                variant="outline"
                onClick={() => {
                  window.open(previewUrl, '_blank')
                }}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                View PDF
              </Button>
            )}
            
            <Button
              onClick={handleApprove}
              disabled={!pdfBlob}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
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
