// Sticker Templates - Circle Stickers
export const stickerTemplates = [
  {
    id: 'circle-business-logo',
    name: 'Business Logo Circle',
    description: 'Professional business logo in a clean circle design',
    category: 'business',
    thumbnail: '/assets/images/templates/circle-business-logo.jpg',
    elements: [
      {
        id: 'circle-logo-bg',
        type: 'circle',
        x: 150,
        y: 150,
        radius: 80,
        fill: '#1e3a8a',
        stroke: '#ffffff',
        strokeWidth: 4
      },
      {
        id: 'circle-logo-text',
        type: 'text',
        x: 150,
        y: 150,
        text: 'YOUR LOGO',
        fontSize: 24,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },
  {
    id: 'circle-contact-info',
    name: 'Contact Info Circle',
    description: 'Contact information in a professional circle format',
    category: 'business',
    thumbnail: '/assets/images/templates/circle-contact-info.jpg',
    elements: [
      {
        id: 'circle-contact-bg',
        type: 'circle',
        x: 150,
        y: 150,
        radius: 75,
        fill: '#ffffff',
        stroke: '#1e3a8a',
        strokeWidth: 3
      },
      {
        id: 'circle-contact-name',
        type: 'text',
        x: 150,
        y: 120,
        text: 'YOUR NAME',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#1e3a8a',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'circle-contact-phone',
        type: 'text',
        x: 150,
        y: 150,
        text: '(555) 123-4567',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fill: '#374151',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'circle-contact-email',
        type: 'text',
        x: 150,
        y: 180,
        text: 'email@company.com',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fill: '#6b7280',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 37, y: 37, width: 225, height: 225 }
  },
  {
    id: 'circle-event-badge',
    name: 'Event Badge Circle',
    description: 'Event or conference badge in circle format',
    category: 'event',
    thumbnail: '/assets/images/templates/circle-event-badge.jpg',
    elements: [
      {
        id: 'circle-event-bg',
        type: 'circle',
        x: 150,
        y: 150,
        radius: 85,
        fill: '#dc2626',
        stroke: '#ffffff',
        strokeWidth: 5
      },
      {
        id: 'circle-event-title',
        type: 'text',
        x: 150,
        y: 105,
        text: 'EVENT 2024',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'circle-event-name',
        type: 'text',
        x: 150,
        y: 150,
        text: 'YOUR NAME',
        fontSize: 20,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'circle-event-company',
        type: 'text',
        x: 150,
        y: 195,
        text: 'COMPANY NAME',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 22, y: 22, width: 255, height: 255 }
  },
  {
    id: 'circle-social-media',
    name: 'Social Media Circle',
    description: 'Social media handle in circle format',
    category: 'social',
    thumbnail: '/assets/images/templates/circle-social-media.jpg',
    elements: [
      {
        id: 'circle-social-bg',
        type: 'circle',
        x: 150,
        y: 150,
        radius: 80,
        fill: '#3b82f6',
        stroke: '#ffffff',
        strokeWidth: 4
      },
      {
        id: 'circle-social-icon',
        type: 'text',
        x: 150,
        y: 120,
        text: '@',
        fontSize: 32,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'circle-social-handle',
        type: 'text',
        x: 150,
        y: 180,
        text: 'YOURHANDLE',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },
  {
    id: 'circle-warning',
    name: 'Warning Circle',
    description: 'Warning or caution sticker in circle format',
    category: 'safety',
    thumbnail: '/assets/images/templates/circle-warning.jpg',
    elements: [
      {
        id: 'circle-warning-bg',
        type: 'circle',
        x: 150,
        y: 150,
        radius: 85,
        fill: '#fbbf24',
        stroke: '#000000',
        strokeWidth: 4
      },
      {
        id: 'circle-warning-symbol',
        type: 'text',
        x: 150,
        y: 120,
        text: '⚠',
        fontSize: 40,
        fontFamily: 'Arial, sans-serif',
        fill: '#000000',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'circle-warning-text',
        type: 'text',
        x: 150,
        y: 180,
        text: 'WARNING',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#000000',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 22, y: 22, width: 255, height: 255 }
  },
  {
    id: 'circle-decorative',
    name: 'Decorative Circle',
    description: 'Decorative circle with pattern or design',
    category: 'decorative',
    thumbnail: '/assets/images/templates/circle-decorative.jpg',
    elements: [
      {
        id: 'circle-decorative-bg',
        type: 'circle',
        x: 150,
        y: 150,
        radius: 80,
        fill: '#8b5cf6',
        stroke: '#ffffff',
        strokeWidth: 3
      },
      {
        id: 'circle-decorative-pattern',
        type: 'circle',
        x: 150,
        y: 150,
        radius: 60,
        fill: 'transparent',
        stroke: '#ffffff',
        strokeWidth: 2
      },
      {
        id: 'circle-decorative-center',
        type: 'circle',
        x: 150,
        y: 150,
        radius: 20,
        fill: '#ffffff'
      },
      {
        id: 'circle-decorative-text',
        type: 'text',
        x: 150,
        y: 150,
        text: 'DESIGN',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#8b5cf6',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },

  // Square Sticker Templates
  {
    id: 'square-business-logo',
    name: 'Business Logo Square',
    description: 'Professional business logo in a clean square design',
    category: 'business',
    thumbnail: '/assets/images/templates/square-business-logo.jpg',
    elements: [
      {
        id: 'square-logo-bg',
        type: 'rect',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        fill: '#1e3a8a',
        stroke: '#ffffff',
        strokeWidth: 4,
        cornerRadius: 10
      },
      {
        id: 'square-logo-text',
        type: 'text',
        x: 150,
        y: 150,
        text: 'YOUR LOGO',
        fontSize: 24,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },
  {
    id: 'square-contact-info',
    name: 'Contact Info Square',
    description: 'Contact information in a professional square format',
    category: 'business',
    thumbnail: '/assets/images/templates/square-contact-info.jpg',
    elements: [
      {
        id: 'square-contact-bg',
        type: 'rect',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        fill: '#059669',
        stroke: '#ffffff',
        strokeWidth: 4,
        cornerRadius: 10
      },
      {
        id: 'square-contact-text',
        type: 'text',
        x: 150,
        y: 120,
        text: 'COMPANY NAME',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'square-phone-text',
        type: 'text',
        x: 150,
        y: 150,
        text: '(555) 123-4567',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'square-email-text',
        type: 'text',
        x: 150,
        y: 180,
        text: 'info@company.com',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },
  {
    id: 'square-event-badge',
    name: 'Event Badge Square',
    description: 'Square badge design for events and conferences',
    category: 'event',
    thumbnail: '/assets/images/templates/square-event-badge.jpg',
    elements: [
      {
        id: 'square-event-bg',
        type: 'rect',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        fill: '#dc2626',
        stroke: '#ffffff',
        strokeWidth: 4,
        cornerRadius: 15
      },
      {
        id: 'square-event-text',
        type: 'text',
        x: 150,
        y: 120,
        text: 'EVENT',
        fontSize: 20,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'square-event-name',
        type: 'text',
        x: 150,
        y: 150,
        text: 'CONFERENCE 2024',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'square-event-date',
        type: 'text',
        x: 150,
        y: 180,
        text: 'JAN 15-17',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },
  {
    id: 'square-warning-label',
    name: 'Warning Label Square',
    description: 'Square warning or safety label design',
    category: 'safety',
    thumbnail: '/assets/images/templates/square-warning-label.jpg',
    elements: [
      {
        id: 'square-warning-bg',
        type: 'rect',
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        fill: '#f59e0b',
        stroke: '#000000',
        strokeWidth: 3,
        cornerRadius: 5
      },
      {
        id: 'square-warning-icon',
        type: 'text',
        x: 150,
        y: 120,
        text: '⚠️',
        fontSize: 40,
        fontFamily: 'Arial, sans-serif',
        fill: '#000000',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'square-warning-text',
        type: 'text',
        x: 150,
        y: 170,
        text: 'WARNING',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#000000',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      },
      {
        id: 'square-warning-desc',
        type: 'text',
        x: 150,
        y: 200,
        text: 'HOT SURFACE',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fill: '#000000',
        align: 'center',
        verticalAlign: 'middle',
        width: 'auto',
        height: 'auto',
        wrap: 'none'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },

  // Rectangle Sticker Templates
  {
    id: 'rectangle-business-logo',
    name: 'Business Logo Rectangle',
    description: 'Professional business logo in a horizontal rectangle format',
    category: 'business',
    thumbnail: '/assets/images/templates/rectangle-business-logo.jpg',
    elements: [
      {
        id: 'rectangle-logo-bg',
        type: 'rect',
        x: 50,
        y: 100,
        width: 200,
        height: 100,
        fill: '#1e3a8a',
        stroke: '#ffffff',
        strokeWidth: 3,
        cornerRadius: 8
      },
      {
        id: 'rectangle-logo-text',
        type: 'text',
        x: 150,
        y: 150,
        text: 'YOUR LOGO',
        fontSize: 24,
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 150 },
    safeZone: { x: 20, y: 20, width: 260, height: 110 }
  },

  {
    id: 'rectangle-contact-info',
    name: 'Contact Info Rectangle',
    description: 'Contact information in a horizontal rectangle format',
    category: 'business',
    thumbnail: '/assets/images/templates/rectangle-contact-info.jpg',
    elements: [
      {
        id: 'rectangle-contact-bg',
        type: 'rect',
        x: 20,
        y: 20,
        width: 260,
        height: 110,
        fill: '#f8fafc',
        stroke: '#1e3a8a',
        strokeWidth: 2,
        cornerRadius: 6
      },
      {
        id: 'rectangle-contact-name',
        type: 'text',
        x: 150,
        y: 45,
        text: 'JOHN SMITH',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#1e3a8a',
        align: 'center',
        verticalAlign: 'middle',
        width: 240,
        height: 'auto'
      },
      {
        id: 'rectangle-contact-phone',
        type: 'text',
        x: 150,
        y: 70,
        text: '(555) 123-4567',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fill: '#374151',
        align: 'center',
        verticalAlign: 'middle',
        width: 240,
        height: 'auto'
      },
      {
        id: 'rectangle-contact-email',
        type: 'text',
        x: 150,
        y: 95,
        text: 'john@company.com',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fill: '#374151',
        align: 'center',
        verticalAlign: 'middle',
        width: 240,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 150 },
    safeZone: { x: 20, y: 20, width: 260, height: 110 }
  },

  {
    id: 'rectangle-event-badge',
    name: 'Event Badge Rectangle',
    description: 'Event badge in a horizontal rectangle format',
    category: 'events',
    thumbnail: '/assets/images/templates/rectangle-event-badge.jpg',
    elements: [
      {
        id: 'rectangle-event-bg',
        type: 'rect',
        x: 30,
        y: 30,
        width: 240,
        height: 90,
        fill: '#dc2626',
        stroke: '#ffffff',
        strokeWidth: 3,
        cornerRadius: 10
      },
      {
        id: 'rectangle-event-text',
        type: 'text',
        x: 150,
        y: 60,
        text: 'CONFERENCE 2024',
        fontSize: 20,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 220,
        height: 'auto'
      },
      {
        id: 'rectangle-event-name',
        type: 'text',
        x: 150,
        y: 90,
        text: 'ATTENDEE',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 220,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 150 },
    safeZone: { x: 20, y: 20, width: 260, height: 110 }
  },

  {
    id: 'rectangle-warning-label',
    name: 'Warning Label Rectangle',
    description: 'Warning label in a horizontal rectangle format',
    category: 'safety',
    thumbnail: '/assets/images/templates/rectangle-warning-label.jpg',
    elements: [
      {
        id: 'rectangle-warning-bg',
        type: 'rect',
        x: 20,
        y: 20,
        width: 260,
        height: 110,
        fill: '#fef3c7',
        stroke: '#f59e0b',
        strokeWidth: 3,
        cornerRadius: 8
      },
      {
        id: 'rectangle-warning-icon',
        type: 'text',
        x: 50,
        y: 50,
        text: '⚠️',
        fontSize: 24,
        fontFamily: 'Arial, sans-serif',
        fill: '#f59e0b',
        align: 'center',
        verticalAlign: 'middle',
        width: 40,
        height: 'auto'
      },
      {
        id: 'rectangle-warning-text',
        type: 'text',
        x: 150,
        y: 50,
        text: 'CAUTION',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#92400e',
        align: 'center',
        verticalAlign: 'middle',
        width: 200,
        height: 'auto'
      },
      {
        id: 'rectangle-warning-desc',
        type: 'text',
        x: 150,
        y: 80,
        text: 'HOT SURFACE',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fill: '#92400e',
        align: 'center',
        verticalAlign: 'middle',
        width: 200,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 150 },
    safeZone: { x: 20, y: 20, width: 260, height: 110 }
  },

  // Triangle Sticker Templates
  {
    id: 'triangle-business-logo',
    name: 'Business Logo Triangle',
    description: 'Professional business logo in a triangular format',
    category: 'business',
    thumbnail: '/assets/images/templates/triangle-business-logo.jpg',
    elements: [
      {
        id: 'triangle-logo-bg',
        type: 'triangle',
        x: 150,
        y: 50,
        width: 200,
        height: 200,
        fill: '#1e3a8a',
        stroke: '#ffffff',
        strokeWidth: 3
      },
      {
        id: 'triangle-logo-text',
        type: 'text',
        x: 150,
        y: 120,
        text: 'YOUR LOGO',
        fontSize: 20,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },

  {
    id: 'triangle-contact-info',
    name: 'Contact Info Triangle',
    description: 'Contact information in a triangular format',
    category: 'business',
    thumbnail: '/assets/images/templates/triangle-contact-info.jpg',
    elements: [
      {
        id: 'triangle-contact-bg',
        type: 'triangle',
        x: 150,
        y: 50,
        width: 200,
        height: 200,
        fill: '#f8fafc',
        stroke: '#1e3a8a',
        strokeWidth: 2
      },
      {
        id: 'triangle-contact-name',
        type: 'text',
        x: 150,
        y: 100,
        text: 'JOHN SMITH',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#1e3a8a',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      },
      {
        id: 'triangle-contact-phone',
        type: 'text',
        x: 150,
        y: 130,
        text: '(555) 123-4567',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fill: '#374151',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      },
      {
        id: 'triangle-contact-email',
        type: 'text',
        x: 150,
        y: 160,
        text: 'john@company.com',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fill: '#374151',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },

  {
    id: 'triangle-event-badge',
    name: 'Event Badge Triangle',
    description: 'Event badge in a triangular format',
    category: 'events',
    thumbnail: '/assets/images/templates/triangle-event-badge.jpg',
    elements: [
      {
        id: 'triangle-event-bg',
        type: 'triangle',
        x: 150,
        y: 50,
        width: 200,
        height: 200,
        fill: '#dc2626',
        stroke: '#ffffff',
        strokeWidth: 3
      },
      {
        id: 'triangle-event-text',
        type: 'text',
        x: 150,
        y: 100,
        text: 'CONFERENCE 2024',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      },
      {
        id: 'triangle-event-name',
        type: 'text',
        x: 150,
        y: 130,
        text: 'ATTENDEE',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },

  {
    id: 'triangle-warning-label',
    name: 'Warning Label Triangle',
    description: 'Warning label in a triangular format',
    category: 'safety',
    thumbnail: '/assets/images/templates/triangle-warning-label.jpg',
    elements: [
      {
        id: 'triangle-warning-bg',
        type: 'triangle',
        x: 150,
        y: 50,
        width: 200,
        height: 200,
        fill: '#fef3c7',
        stroke: '#f59e0b',
        strokeWidth: 3
      },
      {
        id: 'triangle-warning-icon',
        type: 'text',
        x: 150,
        y: 100,
        text: '⚠️',
        fontSize: 20,
        fontFamily: 'Arial, sans-serif',
        fill: '#f59e0b',
        align: 'center',
        verticalAlign: 'middle',
        width: 40,
        height: 'auto'
      },
      {
        id: 'triangle-warning-text',
        type: 'text',
        x: 150,
        y: 130,
        text: 'CAUTION',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#92400e',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      },
      {
        id: 'triangle-warning-desc',
        type: 'text',
        x: 150,
        y: 160,
        text: 'HOT SURFACE',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fill: '#92400e',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },

  // Oval Sticker Templates
  {
    id: 'oval-business-logo',
    name: 'Business Logo Oval',
    description: 'Professional business logo in an oval format',
    category: 'business',
    thumbnail: '/assets/images/templates/oval-business-logo.jpg',
    elements: [
      {
        id: 'oval-logo-bg',
        type: 'ellipse',
        x: 150,
        y: 100,
        radiusX: 100,
        radiusY: 67,
        fill: '#1e3a8a',
        stroke: '#ffffff',
        strokeWidth: 3
      },
      {
        id: 'oval-logo-text',
        type: 'text',
        x: 150,
        y: 100,
        text: 'YOUR LOGO',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 200 },
    safeZone: { x: 20, y: 20, width: 260, height: 160 }
  },

  {
    id: 'oval-contact-info',
    name: 'Contact Info Oval',
    description: 'Contact information in an oval format',
    category: 'business',
    thumbnail: '/assets/images/templates/oval-contact-info.jpg',
    elements: [
      {
        id: 'oval-contact-bg',
        type: 'ellipse',
        x: 150,
        y: 100,
        radiusX: 100,
        radiusY: 67,
        fill: '#f8fafc',
        stroke: '#1e3a8a',
        strokeWidth: 2
      },
      {
        id: 'oval-contact-name',
        type: 'text',
        x: 150,
        y: 80,
        text: 'JOHN SMITH',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#1e3a8a',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      },
      {
        id: 'oval-contact-phone',
        type: 'text',
        x: 150,
        y: 100,
        text: '(555) 123-4567',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fill: '#374151',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      },
      {
        id: 'oval-contact-email',
        type: 'text',
        x: 150,
        y: 120,
        text: 'john@company.com',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fill: '#374151',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 200 },
    safeZone: { x: 20, y: 20, width: 260, height: 160 }
  },

  {
    id: 'oval-event-badge',
    name: 'Event Badge Oval',
    description: 'Event badge in an oval format',
    category: 'events',
    thumbnail: '/assets/images/templates/oval-event-badge.jpg',
    elements: [
      {
        id: 'oval-event-bg',
        type: 'ellipse',
        x: 150,
        y: 100,
        radiusX: 100,
        radiusY: 67,
        fill: '#dc2626',
        stroke: '#ffffff',
        strokeWidth: 3
      },
      {
        id: 'oval-event-text',
        type: 'text',
        x: 150,
        y: 90,
        text: 'CONFERENCE 2024',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      },
      {
        id: 'oval-event-name',
        type: 'text',
        x: 150,
        y: 110,
        text: 'ATTENDEE',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 200 },
    safeZone: { x: 20, y: 20, width: 260, height: 160 }
  },

  {
    id: 'oval-warning-label',
    name: 'Warning Label Oval',
    description: 'Warning label in an oval format',
    category: 'safety',
    thumbnail: '/assets/images/templates/oval-warning-label.jpg',
    elements: [
      {
        id: 'oval-warning-bg',
        type: 'ellipse',
        x: 150,
        y: 100,
        radiusX: 100,
        radiusY: 67,
        fill: '#fef3c7',
        stroke: '#f59e0b',
        strokeWidth: 3
      },
      {
        id: 'oval-warning-icon',
        type: 'text',
        x: 150,
        y: 85,
        text: '⚠️',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fill: '#f59e0b',
        align: 'center',
        verticalAlign: 'middle',
        width: 40,
        height: 'auto'
      },
      {
        id: 'oval-warning-text',
        type: 'text',
        x: 150,
        y: 105,
        text: 'CAUTION',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#92400e',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      },
      {
        id: 'oval-warning-desc',
        type: 'text',
        x: 150,
        y: 125,
        text: 'HOT SURFACE',
        fontSize: 10,
        fontFamily: 'Arial, sans-serif',
        fill: '#92400e',
        align: 'center',
        verticalAlign: 'middle',
        width: 180,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 200 },
    safeZone: { x: 20, y: 20, width: 260, height: 160 }
  },

  // Diamond Sticker Templates
  {
    id: 'diamond-business-logo',
    name: 'Business Logo Diamond',
    description: 'Professional business logo in a diamond format',
    category: 'business',
    thumbnail: '/assets/images/templates/diamond-business-logo.jpg',
    elements: [
      {
        id: 'diamond-logo-bg',
        type: 'diamond',
        x: 150,
        y: 150,
        width: 160,
        height: 160,
        fill: '#1e3a8a',
        stroke: '#ffffff',
        strokeWidth: 3
      },
      {
        id: 'diamond-logo-text',
        type: 'text',
        x: 150,
        y: 150,
        text: 'YOUR LOGO',
        fontSize: 18,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 140,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },

  {
    id: 'diamond-contact-info',
    name: 'Contact Info Diamond',
    description: 'Contact information in a diamond format',
    category: 'business',
    thumbnail: '/assets/images/templates/diamond-contact-info.jpg',
    elements: [
      {
        id: 'diamond-contact-bg',
        type: 'diamond',
        x: 150,
        y: 150,
        width: 160,
        height: 160,
        fill: '#f8fafc',
        stroke: '#1e3a8a',
        strokeWidth: 2
      },
      {
        id: 'diamond-contact-name',
        type: 'text',
        x: 150,
        y: 130,
        text: 'JOHN SMITH',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#1e3a8a',
        align: 'center',
        verticalAlign: 'middle',
        width: 140,
        height: 'auto'
      },
      {
        id: 'diamond-contact-phone',
        type: 'text',
        x: 150,
        y: 150,
        text: '(555) 123-4567',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fill: '#374151',
        align: 'center',
        verticalAlign: 'middle',
        width: 140,
        height: 'auto'
      },
      {
        id: 'diamond-contact-email',
        type: 'text',
        x: 150,
        y: 170,
        text: 'john@company.com',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fill: '#374151',
        align: 'center',
        verticalAlign: 'middle',
        width: 140,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },

  {
    id: 'diamond-event-badge',
    name: 'Event Badge Diamond',
    description: 'Event badge in a diamond format',
    category: 'events',
    thumbnail: '/assets/images/templates/diamond-event-badge.jpg',
    elements: [
      {
        id: 'diamond-event-bg',
        type: 'diamond',
        x: 150,
        y: 150,
        width: 160,
        height: 160,
        fill: '#dc2626',
        stroke: '#ffffff',
        strokeWidth: 3
      },
      {
        id: 'diamond-event-text',
        type: 'text',
        x: 150,
        y: 130,
        text: 'CONFERENCE 2024',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 140,
        height: 'auto'
      },
      {
        id: 'diamond-event-name',
        type: 'text',
        x: 150,
        y: 170,
        text: 'ATTENDEE',
        fontSize: 12,
        fontFamily: 'Arial, sans-serif',
        fill: '#ffffff',
        align: 'center',
        verticalAlign: 'middle',
        width: 140,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  },

  {
    id: 'diamond-warning-label',
    name: 'Warning Label Diamond',
    description: 'Warning label in a diamond format',
    category: 'safety',
    thumbnail: '/assets/images/templates/diamond-warning-label.jpg',
    elements: [
      {
        id: 'diamond-warning-bg',
        type: 'diamond',
        x: 150,
        y: 150,
        width: 160,
        height: 160,
        fill: '#fef3c7',
        stroke: '#f59e0b',
        strokeWidth: 3
      },
      {
        id: 'diamond-warning-icon',
        type: 'text',
        x: 150,
        y: 130,
        text: '⚠️',
        fontSize: 16,
        fontFamily: 'Arial, sans-serif',
        fill: '#f59e0b',
        align: 'center',
        verticalAlign: 'middle',
        width: 40,
        height: 'auto'
      },
      {
        id: 'diamond-warning-text',
        type: 'text',
        x: 150,
        y: 150,
        text: 'CAUTION',
        fontSize: 14,
        fontFamily: 'Arial, sans-serif',
        fontStyle: 'bold',
        fill: '#92400e',
        align: 'center',
        verticalAlign: 'middle',
        width: 140,
        height: 'auto'
      },
      {
        id: 'diamond-warning-desc',
        type: 'text',
        x: 150,
        y: 170,
        text: 'HOT SURFACE',
        fontSize: 10,
        fontFamily: 'Arial, sans-serif',
        fill: '#92400e',
        align: 'center',
        verticalAlign: 'middle',
        width: 140,
        height: 'auto'
      }
    ],
    canvasSize: { width: 300, height: 300 },
    safeZone: { x: 30, y: 30, width: 240, height: 240 }
  }
]
