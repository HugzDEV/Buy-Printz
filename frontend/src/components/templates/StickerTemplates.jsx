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
        x: 100,
        y: 100,
        radius: 80,
        fill: '#1e3a8a',
        stroke: '#ffffff',
        strokeWidth: 4
      },
      {
        id: 'circle-logo-text',
        type: 'text',
        x: 100,
        y: 100,
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
    canvasSize: { width: 200, height: 200 },
    safeZone: { x: 20, y: 20, width: 160, height: 160 }
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
        x: 100,
        y: 100,
        radius: 75,
        fill: '#ffffff',
        stroke: '#1e3a8a',
        strokeWidth: 3
      },
      {
        id: 'circle-contact-name',
        type: 'text',
        x: 100,
        y: 80,
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
        x: 100,
        y: 100,
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
        x: 100,
        y: 120,
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
    canvasSize: { width: 200, height: 200 },
    safeZone: { x: 25, y: 25, width: 150, height: 150 }
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
        x: 100,
        y: 100,
        radius: 85,
        fill: '#dc2626',
        stroke: '#ffffff',
        strokeWidth: 5
      },
      {
        id: 'circle-event-title',
        type: 'text',
        x: 100,
        y: 70,
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
        x: 100,
        y: 100,
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
        x: 100,
        y: 130,
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
    canvasSize: { width: 200, height: 200 },
    safeZone: { x: 15, y: 15, width: 170, height: 170 }
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
        x: 100,
        y: 100,
        radius: 80,
        fill: '#3b82f6',
        stroke: '#ffffff',
        strokeWidth: 4
      },
      {
        id: 'circle-social-icon',
        type: 'text',
        x: 100,
        y: 80,
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
        x: 100,
        y: 120,
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
    canvasSize: { width: 200, height: 200 },
    safeZone: { x: 20, y: 20, width: 160, height: 160 }
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
        x: 100,
        y: 100,
        radius: 85,
        fill: '#fbbf24',
        stroke: '#000000',
        strokeWidth: 4
      },
      {
        id: 'circle-warning-symbol',
        type: 'text',
        x: 100,
        y: 80,
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
        x: 100,
        y: 120,
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
    canvasSize: { width: 200, height: 200 },
    safeZone: { x: 15, y: 15, width: 170, height: 170 }
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
        x: 100,
        y: 100,
        radius: 80,
        fill: '#8b5cf6',
        stroke: '#ffffff',
        strokeWidth: 3
      },
      {
        id: 'circle-decorative-pattern',
        type: 'circle',
        x: 100,
        y: 100,
        radius: 60,
        fill: 'transparent',
        stroke: '#ffffff',
        strokeWidth: 2
      },
      {
        id: 'circle-decorative-center',
        type: 'circle',
        x: 100,
        y: 100,
        radius: 20,
        fill: '#ffffff'
      },
      {
        id: 'circle-decorative-text',
        type: 'text',
        x: 100,
        y: 100,
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
    canvasSize: { width: 200, height: 200 },
    safeZone: { x: 20, y: 20, width: 160, height: 160 }
  }
]
