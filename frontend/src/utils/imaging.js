// Imaging utilities for exporting Konva designs to images/PDFs
// High-verbosity, readable code per code_style

import jsPDF from 'jspdf'

/**
 * Generate a watermarked PNG data URL from an original image data URL.
 * Applies a tiled BuyPrintz watermark to protect IP in previews/downloads.
 */
export const generateWatermarkedImage = async (originalImageDataURL) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const watermarkImg = new Image()
      watermarkImg.onload = () => {
        // Scale watermark to COVER the entire canvas (no gaps)
        const scale = Math.max(canvas.width / watermarkImg.width, canvas.height / watermarkImg.height)
        const drawWidth = watermarkImg.width * scale
        const drawHeight = watermarkImg.height * scale
        const offsetX = (canvas.width - drawWidth) / 2
        const offsetY = (canvas.height - drawHeight) / 2

        ctx.save()
        ctx.globalAlpha = 0.3
        ctx.globalCompositeOperation = 'multiply'
        ctx.drawImage(watermarkImg, offsetX, offsetY, drawWidth, drawHeight)
        ctx.restore()

        resolve(canvas.toDataURL('image/png', 1.0))
      }
      watermarkImg.onerror = () => resolve(originalImageDataURL)
      watermarkImg.src = '/assets/images/BuyPrintz_Watermark_1200px_72dpi.png'
    }
    img.onerror = () => resolve(originalImageDataURL)
    img.src = originalImageDataURL
  })
}

/**
 * Create a production-quality PDF from an image data URL.
 * Uses print dimensions for banners, pixel-based conversion for tents, and sensible defaults for tins.
 */
export const createPdfFromImage = async ({
  imageDataURL,
  productType = 'banner',
  dimensions,
  canvasData
}) => {
  let pdfWidthInches
  let pdfHeightInches

  if (productType === 'tent') {
    const canvasSize = canvasData?.canvasSize || { width: 1160, height: 1049 }
    pdfWidthInches = canvasSize.width / 150
    pdfHeightInches = canvasSize.height / 150
  } else if (productType === 'tin') {
    // Business card tin typical size ~3.5" x 2"; fallback to image aspect ratio if needed
    const assumedWidth = 3.5
    const assumedHeight = 2.0
    pdfWidthInches = assumedWidth
    pdfHeightInches = assumedHeight
  } else {
    const printWidthFeet = parseFloat(dimensions?.width) || 2
    const printHeightFeet = parseFloat(dimensions?.height) || 4
    pdfWidthInches = printWidthFeet * 12
    pdfHeightInches = printHeightFeet * 12
  }

  const pdf = new jsPDF({
    orientation: pdfWidthInches > pdfHeightInches ? 'landscape' : 'portrait',
    unit: 'in',
    format: [pdfWidthInches, pdfHeightInches],
    compress: false,
    precision: 16
  })

  const img = new Image()
  img.src = imageDataURL
  await new Promise((resolve) => { img.onload = resolve })

  const imageAspectRatio = img.width / img.height
  const pdfAspectRatio = pdfWidthInches / pdfHeightInches

  let finalWidth = pdfWidthInches
  let finalHeight = pdfHeightInches
  let offsetX = 0
  let offsetY = 0

  if (imageAspectRatio > pdfAspectRatio) {
    finalHeight = pdfWidthInches / imageAspectRatio
    offsetY = (pdfHeightInches - finalHeight) / 2
  } else {
    finalWidth = pdfHeightInches * imageAspectRatio
    offsetX = (pdfWidthInches - finalWidth) / 2
  }

  pdf.addImage(imageDataURL, 'PNG', offsetX, offsetY, finalWidth, finalHeight, undefined, 'SLOW', 0)
  return pdf.output('blob')
}

/**
 * Convenience to trigger a browser download of a Blob with a given filename.
 */
export const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}


