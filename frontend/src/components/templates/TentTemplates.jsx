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
            x: 480,
            y: 215, // Moved down 20% (110 + 22 = 132)
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
          // Contact information (bottom of canopy)
          {
            id: 'corporate-contact',
            type: 'text',
            x: 454, // Moved 2% more to the right (445 + 9 = 454)
            y: 680, // Moved 20% more down (569 + 111 = 680)
            text: 'www.buyprintz.com\n617-505-0603',
            fontSize: 18,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            lineHeight: 1.4,
            width: 250, // Fixed width like new text elements
            height: 'auto' // Auto height like new text elements
          },
          // Valence section (rectangular area below canopy)
          {
            id: 'corporate-valence-bg',
            type: 'rect',
            x: 0,
            y: 809, // Start of valence (789 + 20 gap)
            width: 1160,
            height: 200,
            fill: '#1e40af'
          },
          // Valence text
          {
            id: 'corporate-valence-text',
            type: 'text',
            x: 390, // Moved 50% to the left (580 - 290 = 290px left)
            y: 900,
            text: 'FAST 2-3 DAY DELIVERY',
            fontSize: 28,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 400, // Fixed width like new text elements
            height: 'auto' // Auto height like new text elements
          },
          // QR code placeholder (bottom right of valence)
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
            width: 100, // Fixed width like new text elements
            height: 'auto' // Auto height like new text elements
          },
          // Second QR code placeholder (bottom left of valence)
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
            width: 100, // Fixed width like new text elements
            height: 'auto' // Auto height like new text elements
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
            y: 175, // Same as front
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
            x: 480,
            y: 215, // Exact same as front
            text: 'BUYPRINTZ',
            fontSize: 24,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e3a8a',
            align: 'center',
            width: 200,
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
          // Contact information (exact same as front)
          {
            id: 'corporate-contact-back',
            type: 'text',
            x: 454, // Exact same as front
            y: 680, // Exact same as front
            text: 'www.buyprintz.com\n617-505-0603',
            fontSize: 18,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            lineHeight: 1.4,
            width: 250,
            height: 'auto'
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
          // Valence text (exact same as front)
          {
            id: 'corporate-valence-text-back',
            type: 'text',
            x: 290, // Exact same as front
            y: 900,
            text: 'FAST 2-3 DAY DELIVERY',
            fontSize: 24,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 400,
            height: 'auto'
          },
          // QR code placeholder (left side - exact same as front)
          {
            id: 'corporate-qr-left-back',
            type: 'rect',
            x: 40, // Exact same as front
            y: 850,
            width: 80,
            height: 80,
            fill: '#ffffff',
            cornerRadius: 8,
            stroke: '#1e3a8a',
            strokeWidth: 2
          },
          // QR code label (left side - exact same as front)
          {
            id: 'corporate-qr-label-left-back',
            type: 'text',
            x: 180, // Exact same as front
            y: 940,
            text: 'SCAN ME',
            fontSize: 14,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 80,
            height: 'auto'
          },
          // QR code placeholder (right side - exact same as front)
          {
            id: 'corporate-qr-right-back',
            type: 'rect',
            x: 1040, // Exact same as front
            y: 850,
            width: 80,
            height: 80,
            fill: '#ffffff',
            cornerRadius: 8,
            stroke: '#1e3a8a',
            strokeWidth: 2
          },
          // QR code label (right side - exact same as front)
          {
            id: 'corporate-qr-label-right-back',
            type: 'text',
            x: 910, // Exact same as front
            y: 940,
            text: 'SCAN ME',
            fontSize: 14,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 80,
            height: 'auto'
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
          // Company logo (larger for side view)
          {
            id: 'corporate-logo-bg-left',
            type: 'rect',
            x: 430,
            y: 100,
            width: 300,
            height: 150,
            fill: '#ffffff',
            cornerRadius: 12,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 15,
            shadowOffset: { x: 0, y: 6 }
          },
          // Company name (larger for side view)
          {
            id: 'corporate-company-name-left',
            type: 'text',
            x: 580,
            y: 170,
            text: 'BUYPRINTZ',
            fontSize: 32,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e3a8a',
            align: 'center',
            width: 300,
            height: 50
          },
          // Side headline
          {
            id: 'corporate-headline-left',
            type: 'text',
            x: 580,
            y: 250,
            text: 'BANNER PRINTING\nSERVICES',
            fontSize: 42,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 400,
            height: 100,
            lineHeight: 1.2
          },
          // Contact info
          {
            id: 'corporate-contact-left',
            type: 'text',
            x: 580,
            y: 400,
            text: 'Visit us at Booth #123\nwww.buyprintz.com\n617-505-0603',
            fontSize: 20,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            width: 350,
            height: 80,
            lineHeight: 1.4
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
          // Valence text
          {
            id: 'corporate-valence-text-left',
            type: 'text',
            x: 580,
            y: 900,
            text: 'EXPERIENCE THE DIFFERENCE',
            fontSize: 28,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 600,
            height: 40
          },
          // QR code placeholder
          {
            id: 'corporate-qr-code-left',
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
            id: 'corporate-qr-label-left',
            type: 'text',
            x: 1060,
            y: 980,
            text: 'SCAN FOR\nMORE INFO',
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            width: 120,
            height: 40,
            lineHeight: 1.2
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
          // Company logo
          {
            id: 'corporate-logo-bg-right',
            type: 'rect',
            x: 430,
            y: 100,
            width: 300,
            height: 150,
            fill: '#ffffff',
            cornerRadius: 12,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 15,
            shadowOffset: { x: 0, y: 6 }
          },
          // Company name
          {
            id: 'corporate-company-name-right',
            type: 'text',
            x: 580,
            y: 170,
            text: 'BUYPRINTZ',
            fontSize: 32,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e3a8a',
            align: 'center',
            width: 300,
            height: 50
          },
          // Side headline
          {
            id: 'corporate-headline-right',
            type: 'text',
            x: 580,
            y: 250,
            text: 'FAST DELIVERY\nQUALITY',
            fontSize: 42,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 400,
            height: 100,
            lineHeight: 1.2
          },
          // Contact info
          {
            id: 'corporate-contact-right',
            type: 'text',
            x: 580,
            y: 400,
            text: 'Visit us at Booth #123\nwww.buyprintz.com\n617-505-0603',
            fontSize: 20,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            width: 350,
            height: 80,
            lineHeight: 1.4
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
          // Valence text
          {
            id: 'corporate-valence-text-right',
            type: 'text',
            x: 580,
            y: 900,
            text: 'CONNECT WITH US TODAY',
            fontSize: 28,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'center',
            width: 600,
            height: 40
          },
          // QR code placeholder
          {
            id: 'corporate-qr-code-right',
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
            id: 'corporate-qr-label-right',
            type: 'text',
            x: 1060,
            y: 980,
            text: 'SCAN FOR\nMORE INFO',
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            width: 120,
            height: 40,
            lineHeight: 1.2
          }
        ]
      },
      sidewall_left: {
        // Left Sidewall - Rectangular design
        // Dimensions: 1110 x 390px
        elements: [
          // Background
          {
            id: 'corporate-sidewall-bg-left',
            type: 'rect',
            x: 0,
            y: 0,
            width: 1110,
            height: 390,
            fill: '#1e40af'
          },
          // Company logo
          {
            id: 'corporate-sidewall-logo',
            type: 'rect',
            x: 50,
            y: 50,
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
            x: 150,
            y: 100,
            text: 'BUYPRINTZ',
            fontSize: 18,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e40af',
            align: 'center',
            width: 200,
            height: 30
          },
          // Main text
          {
            id: 'corporate-sidewall-text',
            type: 'text',
            x: 300,
            y: 100,
            text: 'BANNER PRINTING\nFAST DELIVERY & QUALITY\nVisit us at Booth #123',
            fontSize: 24,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'left',
            width: 500,
            height: 120,
            lineHeight: 1.3
          },
          // Contact info
          {
            id: 'corporate-sidewall-contact',
            type: 'text',
            x: 300,
            y: 250,
            text: 'www.buyprintz.com | 617-505-0603',
            fontSize: 16,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'left',
            width: 400,
            height: 30
          },
          // QR code
          {
            id: 'corporate-sidewall-qr',
            type: 'rect',
            x: 900,
            y: 50,
            width: 100,
            height: 100,
            fill: '#ffffff',
            stroke: '#1e40af',
            strokeWidth: 2,
            cornerRadius: 6
          },
          {
            id: 'corporate-sidewall-qr-label',
            type: 'text',
            x: 950,
            y: 170,
            text: 'SCAN\nHERE',
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            width: 100,
            height: 40,
            lineHeight: 1.2
          }
        ]
      },
      sidewall_right: {
        // Right Sidewall - Mirror of left
        elements: [
          // Background
          {
            id: 'corporate-sidewall-bg-right',
            type: 'rect',
            x: 0,
            y: 0,
            width: 1110,
            height: 390,
            fill: '#1e40af'
          },
          // Company logo
          {
            id: 'corporate-sidewall-logo-right',
            type: 'rect',
            x: 50,
            y: 50,
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
            x: 150,
            y: 100,
            text: 'BUYPRINTZ',
            fontSize: 18,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e40af',
            align: 'center',
            width: 200,
            height: 30
          },
          // Main text
          {
            id: 'corporate-sidewall-text-right',
            type: 'text',
            x: 300,
            y: 100,
            text: 'CUSTOM PRINTING\nPROFESSIONAL SERVICE\nConnect with us today',
            fontSize: 24,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'left',
            width: 500,
            height: 120,
            lineHeight: 1.3
          },
          // Contact info
          {
            id: 'corporate-sidewall-contact-right',
            type: 'text',
            x: 300,
            y: 250,
            text: 'www.buyprintz.com | 617-505-0603',
            fontSize: 16,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'left',
            width: 400,
            height: 30
          },
          // QR code
          {
            id: 'corporate-sidewall-qr-right',
            type: 'rect',
            x: 900,
            y: 50,
            width: 100,
            height: 100,
            fill: '#ffffff',
            stroke: '#1e40af',
            strokeWidth: 2,
            cornerRadius: 6
          },
          {
            id: 'corporate-sidewall-qr-label-right',
            type: 'text',
            x: 950,
            y: 170,
            text: 'SCAN\nHERE',
            fontSize: 12,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            width: 100,
            height: 40,
            lineHeight: 1.2
          }
        ]
      },
      backwall: {
        // Back Wall - Full height design
        // Dimensions: 1110 x 780px
        elements: [
          // Background
          {
            id: 'corporate-backwall-bg',
            type: 'rect',
            x: 0,
            y: 0,
            width: 1110,
            height: 780,
            fill: '#1e40af'
          },
          // Company logo (large)
          {
            id: 'corporate-backwall-logo',
            type: 'rect',
            x: 50,
            y: 50,
            width: 300,
            height: 150,
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
            x: 200,
            y: 120,
            text: 'BUYPRINTZ',
            fontSize: 28,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#1e40af',
            align: 'center',
            width: 300,
            height: 40
          },
          // Main headline
          {
            id: 'corporate-backwall-headline',
            type: 'text',
            x: 400,
            y: 150,
            text: 'CUSTOM PRINTING\nSOLUTIONS\nEXCELLENCE',
            fontSize: 48,
            fontFamily: 'Arial, sans-serif',
            fontStyle: 'bold',
            fill: '#ffffff',
            align: 'left',
            width: 500,
            height: 180,
            lineHeight: 1.2
          },
          // Description
          {
            id: 'corporate-backwall-description',
            type: 'text',
            x: 400,
            y: 350,
            text: 'We provide custom printing solutions that drive\nbusiness success with fast 2-3 day delivery\nand professional quality for all your needs.',
            fontSize: 20,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'left',
            width: 500,
            height: 120,
            lineHeight: 1.4
          },
          // Contact information
          {
            id: 'corporate-backwall-contact',
            type: 'text',
            x: 400,
            y: 500,
            text: 'Visit us at Booth #123\nwww.buyprintz.com\n617-505-0603\norder@buyprintz.com',
            fontSize: 18,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'left',
            width: 400,
            height: 120,
            lineHeight: 1.4
          },
          // QR code (large)
          {
            id: 'corporate-backwall-qr',
            type: 'rect',
            x: 900,
            y: 150,
            width: 150,
            height: 150,
            fill: '#ffffff',
            stroke: '#1e40af',
            strokeWidth: 3,
            cornerRadius: 8
          },
          {
            id: 'corporate-backwall-qr-label',
            type: 'text',
            x: 975,
            y: 320,
            text: 'SCAN FOR\nMORE INFO',
            fontSize: 14,
            fontFamily: 'Arial, sans-serif',
            fill: '#ffffff',
            align: 'center',
            width: 150,
            height: 50,
            lineHeight: 1.2
          }
        ]
      }
    },
    thumbnail: '/assets/images/tent-templates/professional-corporate-tent.jpg',
    tags: ['corporate', 'professional', 'business', 'trade-show', 'blue']
  }
]
