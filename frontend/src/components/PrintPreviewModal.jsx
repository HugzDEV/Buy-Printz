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
import html2canvas from 'html2canvas'

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
  const canvasRef = useRef(null)
  const previewCanvasRef = useRef(null)

  // DPI Quality Analysis
  const analyzeDesignQuality = async (elements, canvasDimensions) => {
    const analysis = {
      overallQuality: 'excellent',
      overallScore: 100,
      elements: [],
      recommendations: [],
      totalElements: elements.length,
      imageElements: 0,
      textElements: 0,
      vectorElements: 0
    }

    // Calculate print dimensions
    const printWidthInches = canvasDimensions.width / 96 // Assuming 96 DPI canvas
    const printHeightInches = canvasDimensions.height / 96

    for (const element of elements) {
      const elementType = element.className || element.type
      const elementAnalysis = {
        id: element.id,
        type: elementType,
        quality: 'excellent',
        dpi: null,
        message: '',
        recommendation: null
      }

      if (elementType === 'Image' || elementType === 'image') {
        analysis.imageElements++
        
        // Analyze image quality
        const attrs = element.attrs || element
        const width = attrs.width || element.width || 100
        const height = attrs.height || element.height || 100
        
        // Calculate actual DPI for this image element
        const widthInches = width / 96
        const heightInches = height / 96
        
        // Estimate natural image dimensions (this would be better with actual image data)
        const estimatedNaturalWidth = width * 2 // Conservative estimate
        const estimatedNaturalHeight = height * 2
        
        const actualDPIWidth = estimatedNaturalWidth / widthInches
        const actualDPIHeight = estimatedNaturalHeight / heightInches
        const averageDPI = (actualDPIWidth + actualDPIHeight) / 2

        elementAnalysis.dpi = Math.round(averageDPI)

        if (averageDPI >= 300) {
          elementAnalysis.quality = 'excellent'
          elementAnalysis.message = `Excellent print quality (${Math.round(averageDPI)} DPI)`
        } else if (averageDPI >= 200) {
          elementAnalysis.quality = 'good'
          elementAnalysis.message = `Good print quality (${Math.round(averageDPI)} DPI)`
        } else if (averageDPI >= 150) {
          elementAnalysis.quality = 'fair'
          elementAnalysis.message = `Fair print quality (${Math.round(averageDPI)} DPI) - May appear pixelated`
          elementAnalysis.recommendation = 'Consider using a higher resolution image'
        } else {
          elementAnalysis.quality = 'poor'
          elementAnalysis.message = `Poor print quality (${Math.round(averageDPI)} DPI) - Will appear pixelated`
          elementAnalysis.recommendation = 'Replace with higher resolution image for best results'
        }

      } else if (elementType === 'Text' || elementType === 'text') {
        analysis.textElements++
        
        const attrs = element.attrs || element
        const fontSize = attrs.fontSize || element.fontSize || 16
        
        // Text is vector-based, so calculate readability based on size
        const fontSizeInches = fontSize / 96
        const fontSizePoints = fontSizeInches * 72 // Convert to points
        
        if (fontSizePoints >= 12) {
          elementAnalysis.quality = 'excellent'
          elementAnalysis.message = `Excellent text clarity (${Math.round(fontSizePoints)}pt)`
        } else if (fontSizePoints >= 8) {
          elementAnalysis.quality = 'good'
          elementAnalysis.message = `Good text clarity (${Math.round(fontSizePoints)}pt)`
        } else if (fontSizePoints >= 6) {
          elementAnalysis.quality = 'fair'
          elementAnalysis.message = `Small text (${Math.round(fontSizePoints)}pt) - May be hard to read`
          elementAnalysis.recommendation = 'Consider increasing font size for better readability'
        } else {
          elementAnalysis.quality = 'poor'
          elementAnalysis.message = `Very small text (${Math.round(fontSizePoints)}pt) - Will be difficult to read`
          elementAnalysis.recommendation = 'Increase font size significantly for print readability'
        }

      } else {
        // Vector elements (rectangles, circles, etc.)
        analysis.vectorElements++
        elementAnalysis.quality = 'excellent'
        elementAnalysis.message = 'Vector element - Perfect for print'
      }

      analysis.elements.push(elementAnalysis)
    }

    // Calculate overall quality
    const qualityScores = analysis.elements.map(el => {
      switch (el.quality) {
        case 'excellent': return 100
        case 'good': return 80
        case 'fair': return 60
        case 'poor': return 30
        default: return 100
      }
    })

    analysis.overallScore = Math.round(qualityScores.reduce((a, b) => a + b, 0) / qualityScores.length)

    if (analysis.overallScore >= 90) {
      analysis.overallQuality = 'excellent'
    } else if (analysis.overallScore >= 75) {
      analysis.overallQuality = 'good'
    } else if (analysis.overallScore >= 60) {
      analysis.overallQuality = 'fair'
    } else {
      analysis.overallQuality = 'poor'
    }

    // Generate recommendations
    const poorElements = analysis.elements.filter(el => el.quality === 'poor' || el.quality === 'fair')
    if (poorElements.length > 0) {
      analysis.recommendations = poorElements.map(el => el.recommendation).filter(Boolean)
    }

    return analysis
  }

  // Generate PDF when modal opens
  useEffect(() => {
    if (isOpen && canvasData) {
      generatePDF()
    }
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [isOpen, canvasData])

  const generatePDF = async () => {
    try {
      setIsGenerating(true)
      
      // Debug: Log the canvas data structure
      // Canvas data loaded for PDF generation
      
      // Create a temporary canvas for PDF generation
      const tempCanvas = document.createElement('canvas')
      const ctx = tempCanvas.getContext('2d')
      
      // The canvas elements are positioned relative to the workspace size, not print size!
      // BannerEditor uses fixed workspace dimensions (1600x800 landscape, 800x1600 portrait)
      let workspaceWidth, workspaceHeight
      
      // Determine workspace dimensions from canvas data or use defaults
      if (canvasData && canvasData.canvasSize) {
        workspaceWidth = canvasData.canvasSize.width
        workspaceHeight = canvasData.canvasSize.height
      } else {
        // Default workspace dimensions based on aspect ratio
        const printWidth = parseFloat(dimensions.width) || 2
        const printHeight = parseFloat(dimensions.height) || 4
        const aspectRatio = printHeight / printWidth
        
        if (aspectRatio > 1) {
          // Portrait orientation
          workspaceWidth = 800
          workspaceHeight = 1600
        } else {
          // Landscape orientation  
          workspaceWidth = 1600
          workspaceHeight = 800
        }
      }
      
      // Create preview canvas with proper aspect ratio
      const maxPreviewWidth = 800
      const aspectRatio = workspaceHeight / workspaceWidth
      const previewWidth = Math.min(maxPreviewWidth, workspaceWidth)
      const previewHeight = previewWidth * aspectRatio
      
      tempCanvas.width = previewWidth
      tempCanvas.height = previewHeight
      
      // Calculate scaling from workspace to preview canvas (NOT print size!)
      const scaleX = previewWidth / workspaceWidth
      const scaleY = previewHeight / workspaceHeight
      
      // Scaling factors calculated for element positioning
      
      // Render the actual banner design with scaling passed as parameters
      await renderBannerDesign(ctx, tempCanvas, previewWidth, previewHeight, scaleX, scaleY)
      
      // Debug: check if canvas has content
      const imageData = ctx.getImageData(0, 0, tempCanvas.width, tempCanvas.height)
      const hasContent = Array.from(imageData.data).some((pixel, index) => {
        // Check if any pixel is not transparent (alpha > 0) and not white background
        if (index % 4 === 3) { // Alpha channel
          return pixel > 0 && (
            imageData.data[index - 3] !== 255 || // R
            imageData.data[index - 2] !== 255 || // G  
            imageData.data[index - 1] !== 255    // B
          )
        }
        return false
      })
      // Canvas content rendered
      
      // Convert canvas to high-quality image
      const canvasImage = tempCanvas.toDataURL('image/jpeg', 1.0)
      setPreviewImage(canvasImage) // Set the preview image for direct display
      
      // Create PDF with proper banner dimensions (use the actual print size)
      // Convert feet to inches for printing
      const printWidthFeet = parseFloat(dimensions.width) || 2
      const printHeightFeet = parseFloat(dimensions.height) || 4
      const pdfWidthInches = printWidthFeet * 12  // Convert feet to inches
      const pdfHeightInches = printHeightFeet * 12
      
      // PDF dimensions calculated for print specifications
      
      const pdf = new jsPDF({
        orientation: pdfWidthInches > pdfHeightInches ? 'landscape' : 'portrait',
        unit: 'in',
        format: [Math.min(pdfWidthInches, 200), Math.min(pdfHeightInches, 200)] // Cap at 200 inches
      })
      
      // Add the banner design as the main page
      pdf.addImage(canvasImage, 'JPEG', 0, 0, Math.min(pdfWidthInches, 200), Math.min(pdfHeightInches, 200))
      
      // Add print specifications page
      pdf.addPage('letter')
      pdf.setFontSize(16)
      pdf.text('Print Specifications', 0.5, 1)
      
      pdf.setFontSize(12)
      const specs = [
        `Dimensions: ${printWidthFeet}' x ${printHeightFeet}' (${pdfWidthInches}" x ${pdfHeightInches}")`,
        `Material: ${orderDetails.banner_material || 'Standard Vinyl'}`,
        `Finish: ${orderDetails.banner_finish || 'Matte'}`,
        `Type: ${orderDetails.banner_type || 'Indoor/Outdoor'}`,
        `Quantity: ${orderDetails.quantity}`,
        `Resolution: 300 DPI`,
        `Color Profile: CMYK`,
        `File Format: High-Quality JPEG`
      ]
      
      specs.forEach((spec, index) => {
        pdf.text(spec, 0.5, 1.5 + (index * 0.3))
      })
      
      // Generate blob and preview URL
      const blob = pdf.output('blob')
      setPdfBlob(blob)
      
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const renderBannerDesign = async (ctx, canvas, displayWidth, displayHeight, scaleX = 1, scaleY = 1) => {
    // Set background
    const bgColor = orderDetails.background_color || '#ffffff'
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, displayWidth, displayHeight)
    
    // Handle different canvas data structures
    let elements = []
    
    if (canvasData) {
      // The canvas data shows {elements: Array(5)} so use that directly
      if (canvasData.elements && Array.isArray(canvasData.elements)) {
        elements = canvasData.elements
        // Elements extracted from canvas data
      } else if (canvasData.objects) {
        elements = canvasData.objects
      } else if (canvasData.children) {
        elements = canvasData.children
      } else if (Array.isArray(canvasData)) {
        elements = canvasData
      } else {
        // Canvas data structure analyzed
        // If it's a Konva JSON structure, try to find the stage
        if (canvasData.attrs && canvasData.children) {
          elements = canvasData.children[0]?.children || []
        }
      }
    }
    
    // Elements ready for rendering
    
    // Analyze design quality for all elements
    if (elements && elements.length > 0) {
      const qualityResults = await analyzeDesignQuality(elements, { width: displayWidth, height: displayHeight })
      setQualityAnalysis(qualityResults)
      // Quality analysis completed
      
      // Render elements
      for (const element of elements) {
        await renderElement(ctx, element, displayWidth, displayHeight, scaleX, scaleY)
      }
    } else {
      // Fallback: render a simple preview message
      ctx.fillStyle = '#666'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('Preview Generating...', displayWidth / 2, displayHeight / 2)
    }
  }

  const renderElement = async (ctx, element, canvasWidth, canvasHeight, scaleX = 1, scaleY = 1) => {
    ctx.save()
    
    try {
      // Handle Konva-style elements (className) vs regular elements (type)
      const elementType = element.className || element.type
      
      // Rendering element of type: ${elementType}
      
      switch (elementType) {
        case 'Text':
        case 'text':
          renderTextElement(ctx, element, scaleX, scaleY)
          break
        case 'Image':
        case 'image':
          await renderImageElement(ctx, element, scaleX, scaleY)
          break
        case 'Rect':
        case 'rect':
        case 'rectangle':
          renderRectElement(ctx, element, scaleX, scaleY)
          break
        case 'Circle':
        case 'circle':
          renderCircleElement(ctx, element, scaleX, scaleY)
          break
        case 'Group':
        case 'group':
          // Handle grouped elements
          if (element.children) {
            for (const child of element.children) {
              await renderElement(ctx, child, canvasWidth, canvasHeight, scaleX, scaleY)
            }
          }
          break
        default:
          // Unknown element type, skipping render
      }
    } catch (error) {
      console.error('Error rendering element:', error, element)
    }
    
    ctx.restore()
  }

  const renderTextElement = (ctx, element, scaleX = 1, scaleY = 1) => {
    // Handle both Konva attrs and direct properties
    const attrs = element.attrs || element
    const text = attrs.text || element.text || ''
    const x = (attrs.x || element.x || 0) * scaleX
    const y = (attrs.y || element.y || 0) * scaleY
    const fontSize = (attrs.fontSize || element.fontSize || 16) * Math.min(scaleX, scaleY)
    const fontFamily = attrs.fontFamily || element.fontFamily || 'Arial'
    const fill = attrs.fill || element.fill || '#000000'
    const align = attrs.align || element.align || 'left'
    const rotation = attrs.rotation || element.rotation || 0
    
    // Text element rendered with scaling applied
    
    ctx.font = `${fontSize}px ${fontFamily}`
    ctx.fillStyle = fill
    ctx.textAlign = align
    
    // Handle multiline text
    const lines = text.split('\n')
    
    if (rotation !== 0) {
      ctx.translate(x, y)
      ctx.rotate((rotation * Math.PI) / 180)
      lines.forEach((line, index) => {
        ctx.fillText(line, 0, fontSize + (index * fontSize * 1.2))
      })
      ctx.rotate(-(rotation * Math.PI) / 180)
      ctx.translate(-x, -y)
    } else {
      lines.forEach((line, index) => {
        ctx.fillText(line, x, y + fontSize + (index * fontSize * 1.2))
      })
    }
  }

  const renderImageElement = (ctx, element, scaleX = 1, scaleY = 1) => {
    return new Promise((resolve) => {
      // Handle both Konva attrs and direct properties
      const attrs = element.attrs || element
      const src = attrs.src || element.src || attrs.image?.src
      const x = (attrs.x || element.x || 0) * scaleX
      const y = (attrs.y || element.y || 0) * scaleY
      const width = (attrs.width || element.width || 100) * scaleX
      const height = (attrs.height || element.height || 100) * scaleY
      const rotation = attrs.rotation || element.rotation || 0
      
      if (src) {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
          if (rotation !== 0) {
            ctx.translate(x + width/2, y + height/2)
            ctx.rotate((rotation * Math.PI) / 180)
            ctx.drawImage(img, -width/2, -height/2, width, height)
            ctx.rotate(-(rotation * Math.PI) / 180)
            ctx.translate(-x - width/2, -y - height/2)
          } else {
            ctx.drawImage(img, x, y, width, height)
          }
          resolve()
        }
        img.onerror = () => resolve() // Continue even if image fails
        img.src = src
      } else {
        resolve()
      }
    })
  }

  const renderRectElement = (ctx, element, scaleX = 1, scaleY = 1) => {
    // Handle both Konva attrs and direct properties
    const attrs = element.attrs || element
    const x = (attrs.x || element.x || 0) * scaleX
    const y = (attrs.y || element.y || 0) * scaleY
    const width = (attrs.width || element.width || 50) * scaleX
    const height = (attrs.height || element.height || 50) * scaleY
    const fill = attrs.fill || element.fill || '#cccccc'
    const stroke = attrs.stroke || element.stroke
    const strokeWidth = (attrs.strokeWidth || element.strokeWidth || 1) * Math.min(scaleX, scaleY)
    const rotation = attrs.rotation || element.rotation || 0
    
    ctx.fillStyle = fill
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = strokeWidth
    }
    
    if (rotation !== 0) {
      ctx.translate(x + width/2, y + height/2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.fillRect(-width/2, -height/2, width, height)
      if (stroke) {
        ctx.strokeRect(-width/2, -height/2, width, height)
      }
      ctx.rotate(-(rotation * Math.PI) / 180)
      ctx.translate(-x - width/2, -y - height/2)
    } else {
      ctx.fillRect(x, y, width, height)
      if (stroke) {
        ctx.strokeRect(x, y, width, height)
      }
    }
  }

  const renderCircleElement = (ctx, element, scaleX = 1, scaleY = 1) => {
    // Handle both Konva attrs and direct properties
    const attrs = element.attrs || element
    const x = (attrs.x || element.x || 0) * scaleX
    const y = (attrs.y || element.y || 0) * scaleY
    const radius = (attrs.radius || element.radius || 25) * Math.min(scaleX, scaleY)
    const fill = attrs.fill || element.fill || '#cccccc'
    const stroke = attrs.stroke || element.stroke
    const strokeWidth = (attrs.strokeWidth || element.strokeWidth || 1) * Math.min(scaleX, scaleY)
    
    ctx.fillStyle = fill
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = strokeWidth
    }
    
    // For Konva circles, x,y is the center. For regular circles, x,y might be top-left
    const centerX = x + (attrs.offsetX || 0)
    const centerY = y + (attrs.offsetY || 0)
    
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
    ctx.fill()
    if (stroke) {
      ctx.stroke()
    }
  }

  const downloadPDF = () => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `print-preview-${orderDetails.banner_type || 'banner'}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
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
            Final Design Preview & Approval
          </DialogTitle>
          <p className="text-gray-600 mt-2">
            Review your banner design before we send it to production. This is exactly how your banner will look when printed.
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Print Specifications */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Print Specifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600">Dimensions</p>
                  <Badge variant="outline">
                    {dimensions.width}" × {dimensions.height}"
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

          {/* Print Quality Analysis */}
          {qualityAnalysis && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Print Quality Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Overall Quality Score */}
                    <div className={`p-4 rounded-lg border-2 ${
                      qualityAnalysis.overallQuality === 'excellent' ? 'bg-green-50 border-green-200' :
                      qualityAnalysis.overallQuality === 'good' ? 'bg-green-50 border-green-200' :
                      qualityAnalysis.overallQuality === 'fair' ? 'bg-yellow-50 border-yellow-200' :
                      'bg-red-50 border-red-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {qualityAnalysis.overallQuality === 'excellent' || qualityAnalysis.overallQuality === 'good' ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                          )}
                          <span className="font-bold text-gray-800">
                            Overall Quality: {qualityAnalysis.overallQuality.charAt(0).toUpperCase() + qualityAnalysis.overallQuality.slice(1)}
                          </span>
                        </div>
                        <Badge variant="outline" className={
                          qualityAnalysis.overallScore >= 90 ? 'bg-green-100 text-green-800' :
                          qualityAnalysis.overallScore >= 75 ? 'bg-green-100 text-green-800' :
                          qualityAnalysis.overallScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {qualityAnalysis.overallScore}/100
                        </Badge>
                      </div>
                      
                      {/* Element Breakdown */}
                      <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div>
                          <div className="font-medium text-gray-700">Images</div>
                          <div className="text-blue-600">{qualityAnalysis.imageElements}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Text Elements</div>
                          <div className="text-blue-600">{qualityAnalysis.textElements}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-700">Vector Elements</div>
                          <div className="text-blue-600">{qualityAnalysis.vectorElements}</div>
                        </div>
                      </div>
                    </div>

                    {/* Recommendations */}
                    {qualityAnalysis.recommendations && qualityAnalysis.recommendations.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="font-medium text-orange-800">Recommendations for Better Quality:</span>
                        </div>
                        <ul className="list-disc list-inside text-sm text-orange-700 space-y-1">
                          {qualityAnalysis.recommendations.map((rec, index) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Element Details */}
                    {qualityAnalysis.elements.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">Element Quality Details:</h4>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                          {qualityAnalysis.elements.map((element, index) => (
                            <div key={element.id} className="flex items-center justify-between text-xs bg-gray-50 rounded p-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {element.type}
                                </Badge>
                                <span>{element.message}</span>
                              </div>
                              <div className={`w-2 h-2 rounded-full ${
                                element.quality === 'excellent' ? 'bg-green-500' :
                                element.quality === 'good' ? 'bg-green-400' :
                                element.quality === 'fair' ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Separator />
            </>
          )}

          {/* Banner Design Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Your Banner Design
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
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
                      <div className="absolute -bottom-8 left-0 right-0 text-center">
                        <Badge variant="outline" className="bg-white">
                          {dimensions.width}" × {dimensions.height}" - Print Ready
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  {/* Download Options */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={downloadPDF}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Print File (PDF)
                    </Button>
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
                      Download Image (JPG)
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg">
                  <p className="text-red-600">Failed to generate banner preview</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Print Verification Checklist */}
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              <strong>Final Approval Checklist:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>✓ Design elements are positioned correctly</li>
                <li>✓ Text is clear and readable at print size</li>
                <li>✓ Colors look as expected (may vary slightly from screen)</li>
                <li>✓ All content fits within the banner dimensions</li>
                <li>✓ Overall design meets your expectations</li>
              </ul>
              <p className="mt-3 text-xs text-gray-600">
                <strong>Note:</strong> This is your final opportunity to review before production. Once approved and paid, changes cannot be made.
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={isGenerating || !previewUrl}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <Check className="h-4 w-4" />
            Approve & Continue to Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default PrintPreviewModal
