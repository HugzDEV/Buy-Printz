// Tent Templates Library
export const tentTemplates = [
  {
    id: 'professional-corporate-tent',
    name: 'Professional Corporate Tent',
    description: 'Clean, professional design perfect for corporate events and trade shows',
    category: 'corporate',
    surfaces: {
      canopy_front: {
        // Canopy Front Surface - Triangular canopy + rectangular valence
        // Dimensions: 1160 x 1049px (canopy: 1160 x 789px + valence: 1160 x 200px + gap: 20px + padding: 40px)
        elements: [
          // Background gradient
          {
            id: 'corporate-bg-gradient',
            type: 'rect',
            x: 0,
            y: 0,
            width: 1160,
            height: 1049,
            fill: {
              type: 'linear',
              startPoint: { x: 0, y: 0 },
              endPoint: { x: 1160, y: 1049 },
              colorStops: [
                { offset: 0, color: '#1e3a8a' }, // Deep blue
                { offset: 0.5, color: '#3b82f6' }, // Medium blue
                { offset: 1, color: '#1e40af' }   // Dark blue
              ]
            },
            clipFunc: 'triangular' // Triangular clipping for canopy portion
          },
          // Company logo area (top center of canopy)
          {
            id: 'corporate-logo-bg',
            type: 'rect',
            x: 480,
            y: 215, // Moved down 20% (50 + 10 = 60)
            width: 200,
            height: 120,
            fill: '#ffffff',
            cornerRadius: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10,
            shadowOffset: { x: 0, y: 4 }
          },
          // Company name
          {
            id: 'corporate-company-name',
            type: 'text',
            x: 508,
            y: 260, // Moved down 20% (110 + 22 = 132)
            text: 'BUYPRINTZ',
            fontSize: 24,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e3a8a',
            align: 'center'
          },
          // Main headline (center of canopy)
          {
            id: 'corporate-headline',
            type: 'text',
            x: 333, // Moved 10% to the left (372 - 37 = 335)
            y: 416, // Moved down 10% (378 + 38 = 416)
            text: 'CUSTOM PRINTING\nSOLUTIONS\nEXCELLENCE',
            fontSize: 36,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            lineHeight: 1.2,
            width: 500, // Fixed width like new text elements
            height: 'auto' // Auto height like new text elements
          },
          // Corporate Tagline (bottom of canopy)
          {
            id: 'corporate-contact',
            type: 'text',
            x: 278, // Moved 2% more to the right (445 + 9 = 454)
            y: 680, // Moved 20% more down (569 + 111 = 680)
            text: 'BRANDING, MARKETING, PRINTING',
            fontSize: 36,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            lineHeight: 1.4,
            width: 250, // Fixed width like new text elements
            height: 'auto' // Auto height like new text elements
          },
          // Valence section - Contact Information (rectangular area below canopy)
          {
            id: 'corporate-valence-bg',
            type: 'rect',
            x: 0,
            y: 809, // Start of valence (789 + 20 gap)
            width: 1160,
            height: 200,
            fill: '#1e40af'
          },
          // Valence text - Contact Information
          {
            id: 'corporate-valence-text',
            type: 'text',
            x: 270, // Moved 50% to the left (580 - 290 = 290px left)
            y: 875,
            text: 'WWW.BUYPRINTZ.COM\n617-505-0603',
            fontSize: 36,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 600, // Increased width to accommodate full website address
            height: 'auto', // Auto height for dynamic sizing
            wrap: 'word' // Allow word wrapping for multi-line text
          },
          // QR code placeholder - Contact Information (bottom right of valence)
          {
            id: 'corporate-qr-code',
            type: 'rect',
            x: 1000,
            y: 850,
            width: 120,
            height: 120,
            fill: '#ffffff',
            stroke: '#1e40af',
            strokeWidth: 2,
            cornerRadius: 8
          },
          {
            id: 'corporate-qr-label',
            type: 'text',
            x: 910, // Moved 1% more to the left (913 - 3 = 910)
            y: 900, // Same line as delivery text
            text: 'SCAN ME',
            fontSize: 16,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'left',
            width: 'auto', // Auto width for single-line text
            height: 'auto',
            wrap: 'none' // No wrapping for single-line text
          },
          // Second QR code placeholder - Contact Information (bottom left of valence)
          {
            id: 'corporate-qr-code-left',
            type: 'rect',
            x: 40,
            y: 850,
            width: 120,
            height: 120,
            fill: '#ffffff',
            stroke: '#1e40af',
            strokeWidth: 2,
            cornerRadius: 8
          },
          {
            id: 'corporate-qr-label-left',
            type: 'text',
            x: 180, // Moved additional 50% to the right (130 + 50 = 180)
            y: 900, // Same line as delivery text
            text: 'SCAN ME',
            fontSize: 16,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'right',
            width: 'auto', // Auto width for single-line text
            height: 'auto',
            wrap: 'none' // No wrapping for single-line text
          }
        ]
      },
      canopy_back: {
        // Canopy Back Surface - Same as front but with different messaging
        elements: [
          // Background gradient (same as front)
          {
            id: 'corporate-bg-gradient-back',
            type: 'rect',
            x: 0,
            y: 0,
            width: 1160,
            height: 1049,
            fill: {
              type: 'linear',
              startPoint: { x: 0, y: 0 },
              endPoint: { x: 1160, y: 1049 },
              colorStops: [
                { offset: 0, color: '#1e3a8a' },
                { offset: 0.5, color: '#3b82f6' },
                { offset: 1, color: '#1e40af' }
              ]
            },
            clipFunc: 'triangular'
          },
          // Company logo area
          {
            id: 'corporate-logo-bg-back',
            type: 'rect',
            x: 480,
            y: 215, // Same as front
            width: 200,
            height: 120,
            fill: '#ffffff',
            cornerRadius: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10,
            shadowOffset: { x: 0, y: 4 }
          },
          // Company name
          {
            id: 'corporate-company-name-back',
            type: 'text',
            x: 508, // Exact same as front
            y: 260, // Exact same as front
            text: 'BUYPRINTZ',
            fontSize: 24,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e3a8a',
            align: 'center',
            width: 'auto',
            height: 'auto'
          },
          // Main headline (same as front)
          {
            id: 'corporate-headline-back',
            type: 'text',
            x: 333, // Exact same as front
            y: 416, // Same as front
            text: 'CUSTOM PRINTING\nSOLUTIONS\nEXCELLENCE',
            fontSize: 36,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            lineHeight: 1.2,
            width: 500,
            height: 'auto'
          },
          // Corporate Tagline (bottom of canopy) - exact same as front
          {
            id: 'corporate-contact-back',
            type: 'text',
            x: 278, // Exact same as front
            y: 680, // Exact same as front
            text: 'BRANDING, MARKETING, PRINTING',
            fontSize: 36,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            lineHeight: 1.4,
            width: 'auto', // Auto width for single-line text
            height: 'auto',
            wrap: 'none' // No wrapping for single-line text
          },
          // Valence section
          {
            id: 'corporate-valence-bg-back',
            type: 'rect',
            x: 0,
            y: 809,
            width: 1160,
            height: 200,
            fill: '#1e40af'
          },
          // Valence text - Contact Information (exact same as front)
          {
            id: 'corporate-valence-text-back',
            type: 'text',
            x: 270, // Exact same as front
            y: 875, // Exact same as front
            text: 'WWW.BUYPRINTZ.COM\n617-505-0603',
            fontSize: 36,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 600, // Increased width to accommodate full website address
            height: 'auto',
            wrap: 'word' // Allow word wrapping for multi-line text
          },
          // QR code placeholder - Contact Information (bottom right of valence) - exact same as front
          {
            id: 'corporate-qr-code-back',
            type: 'rect',
            x: 1000, // Exact same as front
            y: 850, // Exact same as front
            width: 120, // Exact same as front
            height: 120, // Exact same as front
            fill: '#ffffff',
            stroke: '#1e40af', // Exact same as front
            strokeWidth: 2,
            cornerRadius: 8
          },
          {
            id: 'corporate-qr-label-back',
            type: 'text',
            x: 910, // Exact same as front
            y: 900, // Exact same as front
            text: 'SCAN ME',
            fontSize: 16, // Exact same as front
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'left', // Exact same as front
            width: 'auto', // Auto width for single-line text
            height: 'auto',
            wrap: 'none' // No wrapping for single-line text
          },
          // Second QR code placeholder - Contact Information (bottom left of valence) - exact same as front
          {
            id: 'corporate-qr-code-left-back',
            type: 'rect',
            x: 40, // Exact same as front
            y: 850, // Exact same as front
            width: 120, // Exact same as front
            height: 120, // Exact same as front
            fill: '#ffffff',
            stroke: '#1e40af', // Exact same as front
            strokeWidth: 2,
            cornerRadius: 8
          },
          {
            id: 'corporate-qr-label-left-back',
            type: 'text',
            x: 180, // Exact same as front
            y: 900, // Exact same as front
            text: 'SCAN ME',
            fontSize: 16, // Exact same as front
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'right', // Exact same as front
            width: 'auto', // Auto width for single-line text
            height: 'auto',
            wrap: 'none' // No wrapping for single-line text
          }
        ]
      },
      canopy_left: {
        // Canopy Left Surface - Side view with company branding
        elements: [
          // Background gradient
          {
            id: 'corporate-bg-gradient-left',
            type: 'rect',
            x: 0,
            y: 0,
            width: 1160,
            height: 1049,
            fill: {
              type: 'linear',
              startPoint: { x: 0, y: 0 },
              endPoint: { x: 1160, y: 1049 },
              colorStops: [
                { offset: 0, color: '#1e3a8a' },
                { offset: 0.5, color: '#3b82f6' },
                { offset: 1, color: '#1e40af' }
              ]
            },
            clipFunc: 'triangular'
          },
          // Company logo area (top center of canopy) - same as front
          {
            id: 'corporate-logo-bg-left',
            type: 'rect',
            x: 480, // Same as front
            y: 215, // Same as front
            width: 200, // Same as front
            height: 120, // Same as front
            fill: '#ffffff',
            cornerRadius: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10,
            shadowOffset: { x: 0, y: 4 }
          },
          // Company name - same as front
          {
            id: 'corporate-company-name-left',
            type: 'text',
            x: 508, // Same as front
            y: 260, // Same as front
            text: 'BUYPRINTZ',
            fontSize: 24, // Same as front
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e3a8a',
            align: 'center',
            width: 'auto',
            height: 'auto'
          },
          // Main headline (center of canopy) - same as front
          {
            id: 'corporate-headline-left',
            type: 'text',
            x: 333, // Same as front
            y: 416, // Same as front
            text: 'CUSTOM PRINTING\nSOLUTIONS\nEXCELLENCE',
            fontSize: 36, // Same as front
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            lineHeight: 1.2,
            width: 500, // Same as front
            height: 'auto'
          },
          // Corporate Tagline (bottom of canopy) - same as front
          {
            id: 'corporate-contact-left',
            type: 'text',
            x: 278, // Same as front
            y: 680, // Same as front
            text: 'BRANDING, MARKETING, PRINTING',
            fontSize: 36, // Same as front
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            lineHeight: 1.4,
            width: 'auto',
            height: 'auto',
            wrap: 'none'
          },
          // Valence section
          {
            id: 'corporate-valence-bg-left',
            type: 'rect',
            x: 0,
            y: 809,
            width: 1160,
            height: 200,
            fill: '#1e40af'
          },
          // Valence text - Contact Information (same as front)
          {
            id: 'corporate-valence-text-left',
            type: 'text',
            x: 270, // Same as front
            y: 875, // Same as front
            text: 'WWW.BUYPRINTZ.COM\n617-505-0603',
            fontSize: 36, // Same as front
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 600, // Same as front
            height: 'auto',
            wrap: 'word' // Same as front
          },
          // Instagram logo placeholder (left side - same coordinates as QR codes)
          {
            id: 'corporate-instagram-left',
            type: 'rect',
            x: 40, // Same as left QR code
            y: 850, // Same as QR codes
            width: 120, // Same as QR codes
            height: 120, // Same as QR codes
            fill: '#E4405F', // Instagram brand color
            stroke: '#ffffff',
            strokeWidth: 2,
            cornerRadius: 8
          },
          {
            id: 'corporate-instagram-label-left',
            type: 'text',
            x: 180, // Same as left QR label
            y: 900, // Same as QR labels
            text: 'INSTAGRAM',
            fontSize: 16, // Same as QR labels
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'right', // Same as left QR label
            width: 'auto',
            height: 'auto',
            wrap: 'none'
          },
          // Facebook logo placeholder (right side - same coordinates as QR codes)
          {
            id: 'corporate-facebook-left',
            type: 'rect',
            x: 1000, // Same as right QR code
            y: 850, // Same as QR codes
            width: 120, // Same as QR codes
            height: 120, // Same as QR codes
            fill: '#1877F2', // Facebook brand color
            stroke: '#ffffff',
            strokeWidth: 2,
            cornerRadius: 8
          },
          {
            id: 'corporate-facebook-label-left',
            type: 'text',
            x: 880, // Same as right QR label
            y: 900, // Same as QR labels
            text: 'FACEBOOK',
            fontSize: 16, // Same as QR labels
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'left', // Same as right QR label
            width: 'auto',
            height: 'auto',
            wrap: 'none'
          }
        ]
      },
      canopy_right: {
        // Canopy Right Surface - Mirror of left side
        elements: [
          // Background gradient
          {
            id: 'corporate-bg-gradient-right',
            type: 'rect',
            x: 0,
            y: 0,
            width: 1160,
            height: 1049,
            fill: {
              type: 'linear',
              startPoint: { x: 0, y: 0 },
              endPoint: { x: 1160, y: 1049 },
              colorStops: [
                { offset: 0, color: '#1e3a8a' },
                { offset: 0.5, color: '#3b82f6' },
                { offset: 1, color: '#1e40af' }
              ]
            },
            clipFunc: 'triangular'
          },
          // Company logo area (top center of canopy) - same as front
          {
            id: 'corporate-logo-bg-right',
            type: 'rect',
            x: 480, // Same as front
            y: 215, // Same as front
            width: 200, // Same as front
            height: 120, // Same as front
            fill: '#ffffff',
            cornerRadius: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10,
            shadowOffset: { x: 0, y: 4 }
          },
          // Company name - same as front
          {
            id: 'corporate-company-name-right',
            type: 'text',
            x: 508, // Same as front
            y: 260, // Same as front
            text: 'BUYPRINTZ',
            fontSize: 24, // Same as front
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e3a8a',
            align: 'center',
            width: 'auto',
            height: 'auto'
          },
          // Main headline (center of canopy) - same as front
          {
            id: 'corporate-headline-right',
            type: 'text',
            x: 333, // Same as front
            y: 416, // Same as front
            text: 'CUSTOM PRINTING\nSOLUTIONS\nEXCELLENCE',
            fontSize: 36, // Same as front
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            lineHeight: 1.2,
            width: 500, // Same as front
            height: 'auto'
          },
          // Corporate Tagline (bottom of canopy) - same as front
          {
            id: 'corporate-contact-right',
            type: 'text',
            x: 278, // Same as front
            y: 680, // Same as front
            text: 'BRANDING, MARKETING, PRINTING',
            fontSize: 36, // Same as front
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            lineHeight: 1.4,
            width: 'auto',
            height: 'auto',
            wrap: 'none'
          },
          // Valence section
          {
            id: 'corporate-valence-bg-right',
            type: 'rect',
            x: 0,
            y: 809,
            width: 1160,
            height: 200,
            fill: '#1e40af'
          },
          // Valence text - Contact Information (same as front)
          {
            id: 'corporate-valence-text-right',
            type: 'text',
            x: 270, // Same as front
            y: 875, // Same as front
            text: 'WWW.BUYPRINTZ.COM\n617-505-0603',
            fontSize: 36, // Same as front
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 600, // Same as front
            height: 'auto',
            wrap: 'word' // Same as front
          },
          // Instagram logo placeholder (left side - same coordinates as QR codes)
          {
            id: 'corporate-instagram-right',
            type: 'rect',
            x: 40, // Same as left QR code
            y: 850, // Same as QR codes
            width: 120, // Same as QR codes
            height: 120, // Same as QR codes
            fill: '#E4405F', // Instagram brand color
            stroke: '#ffffff',
            strokeWidth: 2,
            cornerRadius: 8
          },
          {
            id: 'corporate-instagram-label-right',
            type: 'text',
            x: 180, // Same as left QR label
            y: 900, // Same as QR labels
            text: 'INSTAGRAM',
            fontSize: 16, // Same as QR labels
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'right', // Same as left QR label
            width: 'auto',
            height: 'auto',
            wrap: 'none'
          },
          // Facebook logo placeholder (right side - same coordinates as QR codes)
          {
            id: 'corporate-facebook-right',
            type: 'rect',
            x: 1000, // Same as right QR code
            y: 850, // Same as QR codes
            width: 120, // Same as QR codes
            height: 120, // Same as QR codes
            fill: '#1877F2', // Facebook brand color
            stroke: '#ffffff',
            strokeWidth: 2,
            cornerRadius: 8
          },
          {
            id: 'corporate-facebook-label-right',
            type: 'text',
            x: 880, // Same as right QR label
            y: 900, // Same as QR labels
            text: 'FACEBOOK',
            fontSize: 16, // Same as QR labels
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'left', // Same as right QR label
            width: 'auto',
            height: 'auto',
            wrap: 'none'
          }
        ]
      },
      sidewall_left: {
        // Left Sidewall - Rectangular design
        // Dimensions: 1150 x 430px (includes 20px margin on each side for safe print zone)
        canvasSize: { width: 1150, height: 430 },
        elements: [
          // Background
          {
            id: 'corporate-sidewall-bg-left',
            type: 'rect',
            x: 0,
            y: 0,
            width: 1150,
            height: 430,
            fill: '#1e40af'
          },
          // Company logo
          {
            id: 'corporate-sidewall-logo',
            type: 'rect',
            x: 70,
            y: 70,
            width: 200,
            height: 100,
            fill: '#ffffff',
            cornerRadius: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10,
            shadowOffset: { x: 0, y: 4 }
          },
          // Company name
          {
            id: 'corporate-sidewall-company',
            type: 'text',
            x: 120,
            y: 110,
            text: 'BUYPRINTZ',
            fontSize: 18,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e40af',
            align: 'center',
            width: 'auto',
            height: 'auto',
            wrap: 'none'
          },
          // Main text
          {
            id: 'corporate-sidewall-text',
            type: 'text',
            x: 70,
            y: 320,
            text: 'DESIGN\nFAST DELIVERY & QUALITY\nBRANDING, MARKETING & PRINTING',
            fontSize: 24,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'left',
            width: 500,
            height: 'auto',
            lineHeight: 1.3,
            wrap: 'word'
          },
          // Contact info
          {
            id: 'corporate-sidewall-contact',
            type: 'text',
            x: 855,
            y: 405,
            text: 'www.buyprintz.com | 617-505-0603',
            fontSize: 16,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'left',
            width: 'auto',
            height: 'auto',
            wrap: 'none'
          },
          // QR code
          {
            id: 'corporate-sidewall-qr',
            type: 'rect',
            x: 900,
            y: 70,
            width: 200,
            height: 200,
            fill: '#ffffff',
            stroke: '#1e40af',
            strokeWidth: 2,
            cornerRadius: 6
          },
          {
            id: 'corporate-sidewall-qr-label',
            type: 'text',
            x: 825,
            y: 170,
            text: 'SCAN ME',
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            width: 100,
            height: 'auto',
            lineHeight: 1.2,
            wrap: 'word'
          }
        ]
      },
      sidewall_right: {
        // Right Sidewall - Mirror of left
        // Dimensions: 1150 x 430px (includes 20px margin on each side for safe print zone)
        canvasSize: { width: 1150, height: 430 },
        elements: [
          // Background
          {
            id: 'corporate-sidewall-bg-right',
            type: 'rect',
            x: 0,
            y: 0,
            width: 1150,
            height: 430,
            fill: '#1e40af'
          },
          // Company logo
          {
            id: 'corporate-sidewall-logo-right',
            type: 'rect',
            x: 70,
            y: 70,
            width: 200,
            height: 100,
            fill: '#ffffff',
            cornerRadius: 8,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 10,
            shadowOffset: { x: 0, y: 4 }
          },
          // Company name
          {
            id: 'corporate-sidewall-company-right',
            type: 'text',
            x: 120,
            y: 110,
            text: 'BUYPRINTZ',
            fontSize: 18,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e40af',
            align: 'center',
            width: 'auto',
            height: 'auto',
            wrap: 'none'
          },
          // Main text
          {
            id: 'corporate-sidewall-text-right',
            type: 'text',
            x: 70,
            y: 320,
            text: 'DESIGN\nFAST DELIVERY & QUALITY\nBRANDING, MARKETING & PRINTING',
            fontSize: 24,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'left',
            width: 500,
            height: 'auto',
            lineHeight: 1.3,
            wrap: 'word'
          },
          // Contact info
          {
            id: 'corporate-sidewall-contact-right',
            type: 'text',
            x: 855,
            y: 405,
            text: 'www.buyprintz.com | 617-505-0603',
            fontSize: 16,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'left',
            width: 'auto',
            height: 'auto',
            wrap: 'none'
          },
          // QR code
          {
            id: 'corporate-sidewall-qr-right',
            type: 'rect',
            x: 900,
            y: 70,
            width: 200,
            height: 200,
            fill: '#ffffff',
            stroke: '#1e40af',
            strokeWidth: 2,
            cornerRadius: 6
          },
          {
            id: 'corporate-sidewall-qr-label-right',
            type: 'text',
            x: 825,
            y: 170,
            text: 'SCAN ME',
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            width: 'auto',
            height: 'auto',
            lineHeight: 1.2,
            wrap: 'none'
          }
        ]
      },
      backwall: {
        // Back Wall - Full height design
        // Dimensions: 1150 x 820px (includes 20px margin on each side for safe print zone)
        canvasSize: { width: 1150, height: 820 },
        elements: [
          // Background
          {
            id: 'corporate-backwall-bg',
            type: 'rect',
            x: 0,
            y: 0,
            width: 1150,
            height: 820,
            fill: '#1e40af'
          },
          // Company logo (large)
          {
            id: 'corporate-backwall-logo',
            type: 'rect',
            x: 70,
            y: 170,
            width: 300,
            height: 500,
            fill: '#ffffff',
            cornerRadius: 12,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 15,
            shadowOffset: { x: 0, y: 6 }
          },
          // Company name
          {
            id: 'corporate-backwall-company',
            type: 'text',
            x: 78,
            y: 420,
            text: 'PLACE LOGO HERE',
            fontSize: 28,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e40af',
            align: 'center',
            width: 'auto',
            height: 'auto',
            wrap: 'none'
          },
          // Hero Title
          {
            id: 'corporate-backwall-headline',
            type: 'text',
            x: 332,
            y: 170,
            text: 'YOUR BRAND\nDESERVES\nEXCELLENCE',
            fontSize: 52,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 500,
            height: 'auto',
            lineHeight: 1.1,
            wrap: 'word'
          },
          // Hero Slogan
          {
            id: 'corporate-backwall-description',
            type: 'text',
            x: 332,
            y: 420,
            text: 'FAST 2-3 DAY DELIVERY\nPROFESSIONAL QUALITY\nCUSTOM PRINTING SOLUTIONS',
            fontSize: 24,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 500,
            height: 'auto',
            lineHeight: 1.3,
            wrap: 'word'
          },
          // Call to Action
          {
            id: 'corporate-backwall-contact',
            type: 'text',
            x: 365,
            y: 570,
            text: 'GET YOUR QUOTE TODAY!\nwww.buyprintz.com\n617-505-0603\norder@buyprintz.com',
            fontSize: 20,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 400,
            height: 'auto',
            lineHeight: 1.4,
            wrap: 'word'
          },
          // QR code (large)
          {
            id: 'corporate-backwall-qr',
            type: 'rect',
            x: 840,
            y: 170,
            width: 250,
            height: 250,
            fill: '#ffffff',
            stroke: '#1e40af',
            strokeWidth: 3,
            cornerRadius: 8
          },
          {
            id: 'corporate-backwall-qr-label',
            type: 'text',
            x: 920,
            y: 445,
            text: 'SCAN ME',
            fontSize: 14,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 150,
            height: 'auto',
            lineHeight: 1.2,
            wrap: 'word'
          }
        ]
      }
    },
    thumbnail: '/assets/images/tent-templates/professional-corporate-tent.jpg',
    tags: ['corporate', 'professional', 'business', 'trade-show', 'blue']
  }
]
