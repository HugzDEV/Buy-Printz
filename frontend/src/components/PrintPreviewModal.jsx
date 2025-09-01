import React, { useState, useEffect, useRef, useCallback } from 'react'
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
  const [error, setError] = useState(null)
  
  // Refs for cleanup
  const timeoutRef = useRef(null)
  const testImageRef = useRef(null)
  const isMountedRef = useRef(true)
  
  // Function to get correct banner dimensions
  const getBannerDimensions = useCallback(() => {
    let width, height
    
    if (dimensions && dimensions.width && dimensions.height) {
      width = parseFloat(dimensions.width)
      height = parseFloat(dimensions.height)
    } else if (orderDetails?.banner_size) {
      const sizeMatch = orderDetails.banner_size.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/)
      if (sizeMatch) {
        width = parseFloat(sizeMatch[1])
        height = parseFloat(sizeMatch[2])
      } else {
        width = 2
        height = 4
      }
    } else {
      width = 2
      height = 4
    }
    
    // Cap dimensions to reasonable production limits
    const maxFeet = 50
    if (width > maxFeet) width = maxFeet
    if (height > maxFeet) height = maxFeet
    
    return { width, height }
  }, [dimensions, orderDetails?.banner_size])

  // Cleanup function
  const cleanup = useCallback(() => {
    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    
    // Clean up test image
    if (testImageRef.current) {
      testImageRef.current.onload = null
      testImageRef.current.onerror = null
      testImageRef.current = null
    }
    
    // Revoke object URLs
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }, [previewUrl])

  // Generate PDF when modal opens - Fixed race condition and memory leaks
  useEffect(() => {
    if (isOpen && orderDetails?.canvas_image) {
      // Clear previous state to prevent race conditions
      setPreviewImage(null)
      setPdfBlob(null)
      setError(null)
      
      // Small delay to ensure state is cleared
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          generatePDF()
        }
      }, 100)
    }
    
    return () => {
      cleanup()
    }
  }, [isOpen, orderDetails?.canvas_image, cleanup, generatePDF])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      cleanup()
    }
  }, [cleanup])

  const generatePDF = useCallback(async () => {
    if (!isMountedRef.current) return
    
    try {
      setIsGenerating(true)
      setError(null)
      
      // Check if we have a perfect canvas image from the editor
      if (orderDetails?.canvas_image) {
        // Validate the image data
        if (orderDetails.canvas_image.length < 100) {
          throw new Error('Canvas image data is too short, likely corrupted')
        }
        
        // Validate base64 image data
        if (!orderDetails.canvas_image.startsWith('data:image/')) {
          throw new Error('Invalid image data format')
        }
        
        // Test image loading before setting state
        const testImage = new Image()
        testImageRef.current = testImage
        
        const imageLoadPromise = new Promise((resolve, reject) => {
          testImage.onload = () => {
            if (isMountedRef.current) {
              setPreviewImage(orderDetails.canvas_image)
              resolve()
            }
          }
          testImage.onerror = () => {
            reject(new Error('Failed to load image data'))
          }
        })
        
        testImage.src = orderDetails.canvas_image
        
        // Wait for image to load
        await imageLoadPromise
        
        // Create PDF with the canvas image
        await createPDFFromImage(orderDetails.canvas_image)
        return
      }

      // No canvas image available - this shouldn't happen with the new system
      throw new Error('No canvas image available for preview')
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error generating PDF:', error)
        setError(error.message)
        setPreviewImage(null)
      }
    } finally {
      if (isMountedRef.current) {
        setIsGenerating(false)
      }
    }
  }, [orderDetails?.canvas_image, createPDFFromImage])

  // Create PDF directly from canvas image (perfect method)
  const createPDFFromImage = useCallback(async (imageDataURL) => {
    if (!isMountedRef.current) return
    
    try {
      // Get actual banner dimensions using the same logic as UI
      const { width: printWidthFeet, height: printHeightFeet } = getBannerDimensions()
      
      const pdfWidthInches = printWidthFeet * 12
      const pdfHeightInches = printHeightFeet * 12

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

      // Add the canvas image to PDF
      pdf.addImage(imageDataURL, 'PNG', 0, 0, cappedWidthInches, cappedHeightInches, '', 'FAST')

      // Add full canvas watermark to PDF (protects design from theft)
      try {
        const watermarkPath = '/assets/images/BuyPrintz_Watermark_1200px_72dpi.png'
        pdf.addImage(watermarkPath, 'PNG', 0, 0, cappedWidthInches, cappedHeightInches, '', 'FAST')
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
        `Material: ${orderDetails?.banner_material || 'Standard Vinyl'}`,
        `Finish: ${orderDetails?.banner_finish || 'Matte'}`,
        `Type: ${orderDetails?.banner_type || 'Indoor/Outdoor'}`,
        `Quantity: ${orderDetails?.quantity || 1}`,
        `Resolution: 300 DPI`,
        `Color Profile: CMYK`,
        `File Format: High-Quality PNG`
      ]
      
      specs.forEach((spec, index) => {
        pdf.text(spec, 0.5, 1.5 + (index * 0.3))
      })

      // Create blob and URL
      const pdfBlob = pdf.output('blob')
      
      if (isMountedRef.current) {
        setPdfBlob(pdfBlob)
        
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl)
        }
        const newPreviewUrl = URL.createObjectURL(pdfBlob)
        setPreviewUrl(newPreviewUrl)
      }
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Error creating PDF from image:', error)
        setError('Failed to create PDF preview')
      }
    }
  }, [getBannerDimensions, orderDetails])

  const handleApprove = useCallback(() => {
    // For final print approval, send the clean canvas image (no watermark)
    // The PDF blob contains watermark for customer protection
    const cleanPrintData = {
      pdfBlob: pdfBlob, // Watermarked PDF for records
      cleanImage: orderDetails?.canvas_image, // Clean image for actual printing
      orderDetails: orderDetails,
      dimensions: dimensions
    }
    onApprove(cleanPrintData)
  }, [pdfBlob, orderDetails, dimensions, onApprove])

  const handleDownload = useCallback(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `BuyPrintz-Banner-${orderDetails?.banner_type || 'Design'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }
  }, [pdfBlob, orderDetails?.banner_type])

  const handleImageLoad = useCallback(() => {
    // Image loaded successfully - no console.log in production
  }, [])

  const handleImageError = useCallback((e) => {
    if (isMountedRef.current) {
      console.error('Banner image failed to load:', e)
      setError('Failed to load banner preview')
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl w-[98vw] max-h-[95vh] h-auto overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Printer className="h-6 w-6 text-blue-600" />
            Print Preview & Approval
          </DialogTitle>
          <p className="text-gray-600 text-sm mt-2">
            Review your banner design before production. This preview shows exactly how your banner will look when printed.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 p-2 sm:p-4 h-full">
            {/* Left Column - Main Preview (Takes 2/3 width on xl screens) */}
            <div className="xl:col-span-2 space-y-4 lg:space-y-6 overflow-hidden">
              {/* Banner Preview Card */}
              <Card className="shadow-lg h-full overflow-y-auto">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Eye className="h-5 w-5 text-blue-600" />
                    Your Banner Design
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isGenerating ? (
                    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                      <div className="text-center space-y-3">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 font-medium">Generating your banner preview...</p>
                        <p className="text-sm text-gray-500">This may take a few seconds</p>
                      </div>
                    </div>
                  ) : error ? (
                    <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border-2 border-red-200">
                      <div className="text-center space-y-2">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto" />
                        <p className="text-red-600 font-medium">Preview Generation Failed</p>
                        <p className="text-sm text-red-500">{error}</p>
                      </div>
                    </div>
                  ) : previewImage ? (
                    <div className="space-y-4">
                      {/* Main Banner Preview */}
                      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-2 sm:p-4 flex items-center justify-center min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
                        <div className="relative group">
                          <img
                            src={previewImage}
                            alt="Banner Design Preview"
                            className="max-w-full max-h-[280px] sm:max-h-[380px] lg:max-h-[480px] rounded-lg border-2 border-white shadow-xl transition-transform group-hover:scale-105"
                            style={{
                              maxWidth: '100%',
                              height: 'auto',
                              objectFit: 'contain'
                            }}
                            onLoad={handleImageLoad}
                            onError={handleImageError}
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
                              {getBannerDimensions().width}ft × {getBannerDimensions().height}ft
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-center pt-4 sm:pt-6">
                        {previewUrl ? (
                          <Button
                            onClick={handleDownload}
                            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-medium shadow-lg"
                          >
                            <Download className="h-5 w-5" />
                            Download Print File
                          </Button>
                        ) : (
                          <Button
                            disabled
                            className="bg-gray-400 text-white flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-medium"
                          >
                            <Download className="h-5 w-5" />
                            Generating Print File...
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
                      <div className="text-center space-y-2">
                        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto" />
                        <p className="text-gray-600 font-medium">No Preview Available</p>
                        <p className="text-sm text-gray-500">Please try again</p>
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
            <div className="space-y-3 sm:space-y-4 lg:space-y-6 overflow-hidden">
              {/* Print Specifications */}
              <Card className="shadow-lg h-full overflow-y-auto">
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
                          {getBannerDimensions().width}ft × {getBannerDimensions().height}ft
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Material</span>
                        <Badge variant="outline" className="bg-white">
                          {orderDetails?.banner_material || 'Standard Vinyl'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Finish</span>
                        <Badge variant="outline" className="bg-white">
                          {orderDetails?.banner_finish || 'Matte'}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-600">Quantity</span>
                        <Badge variant="outline" className="bg-white">
                          {orderDetails?.quantity || 1} piece(s)
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
              <Card className="shadow-lg border-amber-200 h-full overflow-y-auto">
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
            </div>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 bg-gray-50 mt-4">
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-end">
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
              disabled={!pdfBlob || isGenerating || !!error}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 order-1 sm:order-2 shadow-lg min-h-[44px]"
            >
              <Check className="h-4 w-4" />
              Approve & Continue to Payment
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PrintPreviewModal
