// Professional Banner Templates Library
export const bannerTemplates = [
    // Business Grand Opening
    {
      id: 'grand-opening-burst',
      name: 'Grand Opening - Burst',
      category: 'Business Events',
      description: 'Eye-catching design with starburst background',
      tags: ['grand opening', 'business', 'celebration'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_background',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#1e3a8a'
        },
        {
          id: 'template_star_burst',
          type: 'star',
          x: 400, y: 200,
          numPoints: 16,
          innerRadius: 60,
          outerRadius: 120,
          fill: '#fbbf24',
          strokeWidth: 3,
          stroke: '#f59e0b',
          width: 240,
          height: 240
        },
        {
          id: 'template_main_text',
          type: 'text',
          x: 197, y: 160,
          text: 'GRAND OPENING',
          fontSize: 48,
          fontFamily: 'Impact',
          fontStyle: 'bold',
          fill: '#ffffff',
          align: 'center',
          strokeWidth: 3,
          stroke: '#1e3a8a',
          width: 400,
          height: 60,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_subtitle',
          type: 'text',
          x: 243, y: 235,
          text: 'NOW OPEN!',
          fontSize: 36,
          fontFamily: 'Arial Black',
          fontStyle: 'bold',
          fill: '#dc2626',
          align: 'center',
          strokeWidth: 2,
          stroke: '#ffffff',
          width: 300,
          height: 45,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_company_name',
          type: 'text',
          x: 30, y: 30,
          text: 'BUYPRINTZ',
          fontSize: 24,
          fontFamily: 'Arial Black',
          fontStyle: 'bold',
          fill: '#fbbf24',
          align: 'left',
          width: 200,
          height: 30,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_tagline',
          type: 'text',
          x: 30, y: 60,
          text: 'Custom Printing Solutions',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'left',
          width: 250,
          height: 25,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_contact_info',
          type: 'text',
          x: 490, y: 304,
          text: '📞 (617) 505-0603\n📧 order@buyprintz.com\n🌐 www.buyprintz.com',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'right',
          width: 275,
          height: 80,
          wrap: 'word',
          lineHeight: 1.4,
          verticalAlign: 'top'
        },
        {
          id: 'template_qr_placeholder',
          type: 'rect',
          x: 30, y: 288,
          width: 80, height: 80,
          fill: '#ffffff',
          stroke: '#1e3a8a',
          strokeWidth: 2
        },
        {
          id: 'template_qr_label',
          type: 'text',
          x: 120, y: 350,
          text: 'SCAN ME',
          fontSize: 12,
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fill: '#ffffff',
          align: 'left',
          width: 100,
          height: 15,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        }
      ]
    },

    // Retail Sale
    {
      id: 'mega-sale-red',
      name: 'Mega Sale - Red Alert',
      category: 'Retail Sales',
      description: 'High-impact red design for maximum attention',
      tags: ['sale', 'discount', 'retail', 'urgent'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_background',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#dc2626'
        },
        {
          id: 'template_accent_strip',
          type: 'rect',
          x: 0, y: 0,
          width: 120, height: 400,
          fill: '#991b1b'
        },
        {
          id: 'template_main_text',
          type: 'text',
          x: 197, y: 120,
          text: 'MEGA SALE',
          fontSize: 64,
          fontFamily: 'Impact',
          fontStyle: 'bold',
          fill: '#ffffff',
          align: 'center',
          strokeWidth: 3,
          stroke: '#991b1b',
          width: 400,
          height: 80,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_subtitle',
          type: 'text',
          x: 245, y: 200,
          text: 'UP TO 70% OFF',
          fontSize: 36,
          fontFamily: 'Arial Black',
          fontStyle: 'bold',
          fill: '#fbbf24',
          align: 'center',
          strokeWidth: 2,
          stroke: '#dc2626',
          width: 300,
          height: 45,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_company_name',
          type: 'text',
          x: 30, y: 30,
          text: 'BUYPRINTZ',
          fontSize: 28,
          fontFamily: 'Arial Black',
          fontStyle: 'bold',
          fill: '#fbbf24',
          align: 'left',
          width: 200,
          height: 30,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_tagline',
          type: 'text',
          x: 30, y: 60,
          text: 'Custom Printing Solutions',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'left',
          width: 250,
          height: 25,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_contact_info',
          type: 'text',
          x: 490, y: 304,
          text: '📞 (617) 505-0603\n📧 order@buyprintz.com\n🌐 www.buyprintz.com',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'right',
          width: 275,
          height: 80,
          wrap: 'word',
          lineHeight: 1.4,
          verticalAlign: 'top'
        },
        {
          id: 'template_qr_placeholder',
          type: 'rect',
          x: 30, y: 288,
          width: 80, height: 80,
          fill: '#ffffff',
          stroke: '#dc2626',
          strokeWidth: 2
        },
        {
          id: 'template_qr_label',
          type: 'text',
          x: 120, y: 350,
          text: 'SCAN ME',
          fontSize: 12,
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fill: '#ffffff',
          align: 'left',
          width: 100,
          height: 15,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        }
      ]
    },

    // Real Estate Professional
    {
      id: 'real-estate-modern',
      name: 'Real Estate - Modern Blue',
      category: 'Real Estate',
      description: 'Professional design for property listings',
      tags: ['real estate', 'for sale', 'professional', 'contact'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_background',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#1e40af'
        },
        {
          id: 'template_accent_strip',
          type: 'rect',
          x: 0, y: 0,
          width: 120, height: 400,
          fill: '#0f172a'
        },
        {
          id: 'template_main_text',
          type: 'text',
          x: 197, y: 120,
          text: 'FOR SALE',
          fontSize: 48,
          fontFamily: 'Arial Black',
          fontStyle: 'bold',
          fill: '#1e40af',
          align: 'center',
          strokeWidth: 2,
          stroke: '#ffffff',
          width: 400,
          height: 60,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_subtitle',
          type: 'text',
          x: 243, y: 200,
          text: 'PROFESSIONAL LISTING',
          fontSize: 24,
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fill: '#1e40af',
          align: 'center',
          width: 300,
          height: 30,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_house_icon',
          type: 'text',
          x: 348, y: 200,
          text: '🏠',
          fontSize: 64,
          align: 'center',
          width: 100,
          height: 80,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_company_name',
          type: 'text',
          x: 30, y: 30,
          text: 'BUYPRINTZ',
          fontSize: 28,
          fontFamily: 'Arial Black',
          fontStyle: 'bold',
          fill: '#ffffff',
          align: 'left',
          width: 200,
          height: 30,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_tagline',
          type: 'text',
          x: 30, y: 60,
          text: 'Custom Printing Solutions',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'left',
          width: 250,
          height: 25,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_contact_info',
          type: 'text',
          x: 490, y: 304,
          text: '📞 (617) 505-0603\n📧 order@buyprintz.com\n🌐 www.buyprintz.com',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'right',
          width: 275,
          height: 80,
          wrap: 'word',
          lineHeight: 1.4,
          verticalAlign: 'top'
        },
        {
          id: 'template_qr_placeholder',
          type: 'rect',
          x: 30, y: 288,
          width: 80, height: 80,
          fill: '#ffffff',
          stroke: '#1e40af',
          strokeWidth: 2
        },
        {
          id: 'template_qr_label',
          type: 'text',
          x: 120, y: 350,
          text: 'SCAN ME',
          fontSize: 12,
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fill: '#ffffff',
          align: 'left',
          width: 100,
          height: 15,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        }
      ]
    },

    // Restaurant Special
    {
      id: 'restaurant-special',
      name: 'Restaurant Special',
      category: 'Food & Dining',
      description: 'Appetizing design for restaurant promotions',
      tags: ['restaurant', 'food', 'special', 'dining'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_background_image',
          type: 'image',
          x: 0, y: 0,
          width: 800, height: 400,
          src: '/assets/images/Healthy_Food_banner.png'
        },
        {
          id: 'template_main_text',
          type: 'text',
          x: 30, y: 100,
          text: 'DAILY SPECIAL',
          fontSize: 42,
          fontFamily: 'Impact',
          fontStyle: 'bold',
          fill: '#ffffff',
          align: 'left',
          strokeWidth: 1,
          stroke: '#fbbf24',
          width: 350,
          height: 60,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_subtitle',
          type: 'text',
          x: 30, y: 180,
          text: 'LIME CHICKEN SALAD',
          fontSize: 32,
          fontFamily: 'Arial Black',
          fontStyle: 'bold',
          fill: '#fbbf24',
          align: 'left',
          strokeWidth: 1,
          stroke: '#ffffff',
          width: 400,
          height: 40,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_price',
          type: 'text',
          x: 30, y: 240,
          text: '$12.99',
          fontSize: 36,
          fontFamily: 'Arial Black',
          fontStyle: 'bold',
          fill: '#05D327',
          align: 'left',
          strokeWidth: 1,
          stroke: '#fbbf24',
          width: 200,
          height: 45,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_company_name',
          type: 'text',
          x: 30, y: 30,
          text: 'BUYPRINTZ',
          fontSize: 28,
          fontFamily: 'Arial Black',
          fontStyle: 'bold',
          fill: '#ffffff',
          align: 'left',
          width: 200,
          height: 30,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_tagline',
          type: 'text',
          x: 30, y: 60,
          text: 'Custom Printing Solutions',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'left',
          width: 250,
          height: 25,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        },
        {
          id: 'template_contact_info',
          type: 'text',
          x: 490, y: 304,
          text: '📞 (617) 505-0603\n📧 order@buyprintz.com\n🌐 www.buyprintz.com',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'right',
          width: 275,
          height: 80,
          wrap: 'word',
          lineHeight: 1.4,
          verticalAlign: 'top'
        },
        {
          id: 'template_qr_placeholder',
          type: 'rect',
          x: 30, y: 288,
          width: 80, height: 80,
          fill: '#ffffff',
          stroke: '#000000',
          strokeWidth: 2
        },
        {
          id: 'template_qr_label',
          type: 'text',
          x: 120, y: 350,
          text: 'SCAN ME',
          fontSize: 12,
          fontFamily: 'Arial',
          fontStyle: 'bold',
          fill: '#ffffff',
          align: 'left',
          width: 100,
          height: 15,
          wrap: 'none',
          lineHeight: 1.2,
          verticalAlign: 'middle'
        }
      ]
    },

    // Construction/Contractor
    {
      id: 'construction-professional',
      name: 'Construction Pro',
      category: 'Construction',
      description: 'Bold design for construction companies',
      tags: ['construction', 'contractor', 'professional', 'services'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#f97316'
        },
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 250,
          width: 800, height: 150,
          fill: '#1f2937',
          rotation: -15
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 400, y: 100,
          text: 'ABC CONSTRUCTION',
          fontSize: 32,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center',
          strokeWidth: 2,
          stroke: '#1f2937'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 400, y: 150,
          text: 'RESIDENTIAL • COMMERCIAL',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#1f2937',
          align: 'center',
          fontStyle: 'bold'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 400, y: 200,
          text: '📞 (555) BUILD-NOW',
          fontSize: 20,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 400, y: 320,
          text: 'LICENSED • INSURED • BONDED',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#fbbf24',
          align: 'center'
        }
      ]
    },

    // Auto Dealership
    {
      id: 'auto-dealership',
      name: 'Auto Dealership Sale',
      category: 'Automotive',
      description: 'Dynamic design for car sales events',
      tags: ['auto', 'cars', 'dealership', 'sale'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#1f2937'
        },
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 100,
          fill: '#dc2626'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 400, y: 50,
          text: 'SUMMER SALE EVENT',
          fontSize: 28,
          fontFamily: 'Impact',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 180,
          text: '🚗',
          fontSize: 80,
          align: 'center'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 550, y: 150,
          text: 'SAVE UP TO\n$5,000 OFF',
          fontSize: 32,
          fontFamily: 'Arial Black',
          fill: '#dc2626',
          align: 'center',
          lineHeight: 1.2
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 400, y: 280,
          text: 'ALL NEW & USED VEHICLES',
          fontSize: 18,
          fontFamily: 'Arial',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 400, y: 320,
          text: '📞 (555) AUTO-SALE',
          fontSize: 16,
          fontFamily: 'Arial Black',
          fill: '#fbbf24',
          align: 'center'
        }
      ]
    },

    // Medical Clinic
    {
      id: 'medical-clinic',
      name: 'Medical Clinic',
      category: 'Healthcare',
      description: 'Clean, professional healthcare design',
      tags: ['medical', 'healthcare', 'clinic', 'professional'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#ffffff'
        },
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 80,
          fill: '#2563eb'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 400, y: 40,
          text: 'CITY MEDICAL CLINIC',
          fontSize: 24,
          fontFamily: 'Arial Black',
          fill: '#ffffff',
          align: 'center'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 150,
          text: '🏥',
          fontSize: 60,
          align: 'center'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 550, y: 120,
          text: 'ACCEPTING NEW PATIENTS',
          fontSize: 20,
          fontFamily: 'Arial Black',
          fill: '#2563eb',
          align: 'center'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 550, y: 160,
          text: 'Family Medicine • Urgent Care\nWalk-ins Welcome',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#374151',
          align: 'center',
          lineHeight: 1.3
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 400, y: 280,
          text: '📞 (555) MED-CARE • 📍 123 Main St',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#2563eb',
          align: 'center'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 400, y: 320,
          text: 'Mon-Fri 8AM-6PM • Sat 9AM-2PM',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#6b7280',
          align: 'center'
        }
      ]
    },

    // Portrait Templates for variety
    // Real Estate Portrait
    {
      id: 'real-estate-portrait',
      name: 'Real Estate - Portrait',
      category: 'Real Estate',
      description: 'Tall design perfect for property listings',
      tags: ['real estate', 'portrait', 'property', 'vertical'],
      orientation: 'portrait',
      recommendedSizes: ['3x2', '4x2', '5x2', '6x2'],
      elements: [
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 400, height: 800,
          fill: '#1e40af'
        },
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 25, y: 25,
          width: 350, height: 750,
          fill: '#ffffff'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 80,
          text: 'FOR SALE',
          fontSize: 28,
          fontFamily: 'Arial Black',
          fill: '#0f172a',
          align: 'center'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 200,
          text: '🏠',
          fontSize: 60,
          align: 'center'
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 350,
          text: 'BEAUTIFUL HOME\n3 BED • 2 BATH\n1,500 SQ FT',
          fontSize: 18,
          fontFamily: 'Arial Black',
          fill: '#0f172a',
          align: 'center',
          lineHeight: 1.3
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 500,
          text: 'CALL TODAY\n(617) 505-0603',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#0f172a',
          align: 'center',
          lineHeight: 1.2
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 650,
          text: 'OPEN HOUSE\nSUNDAY 2-4PM',
          fontSize: 14,
          fontFamily: 'Arial Black',
          fill: '#dc2626',
          align: 'center',
          lineHeight: 1.2
        }
      ]
    },

    // Restaurant Portrait - Professional Daily Special Design
    {
      id: 'restaurant-portrait',
      name: 'Daily Special - Portrait',
      category: 'Food & Dining',
      description: 'Professional portrait design for daily specials with proper typography and visual hierarchy',
      tags: ['restaurant', 'portrait', 'food', 'vertical', 'daily special'],
      orientation: 'portrait',
      recommendedSizes: ['3x2', '4x2', '5x2', '6x2'],
      elements: [
        // Main background - dark brown
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 400, height: 800,
          fill: '#8B4513'
        },
        // Top header section - golden yellow
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 400, height: 200,
          fill: '#DAA520'
        },
        // Main content background - dark brown
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 200,
          width: 400, height: 600,
          fill: '#8B4513'
        },
        // Daily Special header - bold, centered
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 100,
          text: 'DAILY SPECIAL',
          fontSize: 32,
          fontFamily: 'Impact',
          fontStyle: 'bold',
          fill: '#8B4513',
          align: 'center',
          width: 300,
          height: 50
        },
        // Pizza emoji - large and centered
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 280,
          text: '🍕',
          fontSize: 100,
          align: 'center',
          width: 100,
          height: 100
        },
        // Wood Fired main text - white, bold
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 420,
          text: 'WOOD FIRED',
          fontSize: 36,
          fontFamily: 'Arial Black',
          fontStyle: 'bold',
          fill: '#FFFFFF',
          align: 'center',
          width: 300,
          height: 50
        },
        // Availability text - golden yellow
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 520,
          text: 'Available 11AM - 9PM Daily',
          fontSize: 16,
          fontFamily: 'Arial',
          fill: '#DAA520',
          align: 'center',
          width: 300,
          height: 30
        },
        // Contact info - white, smaller
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 200, y: 650,
          text: '📞 (555) PIZZA-NOW\n📍 123 Main Street',
          fontSize: 14,
          fontFamily: 'Arial',
          fill: '#FFFFFF',
          align: 'center',
          lineHeight: 1.4,
          width: 300,
          height: 60
        }
      ]
    },

    // NEW PROFESSIONAL TEMPLATES - Built with Real Assets
    // RESTAURANT & FOOD TEMPLATES
    {
      id: 'pizza-special-offer',
      name: 'Pizza Special Offer',
      category: 'Restaurant & Food',
      description: 'Eye-catching pizza promotion with food icons and special pricing',
      tags: ['pizza', 'restaurant', 'food', 'special offer'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#FF6B35'
        },
        {
          id: 'template_pizza_bg_placeholder',
          type: 'image',
          x: 50, y: 50,
          width: 200, height: 200,
          src: '/assets/images/food/Pizza.svg',
          opacity: 0.1
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 300, y: 80,
          text: 'PIZZA SPECIAL',
          fontSize: 48,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#FFFFFF',
          stroke: '#000000',
          strokeWidth: 2
        },
        {
          id: 'template_text2_placeholder',
          type: 'text',
          x: 300, y: 140,
          text: 'Buy 2 Get 1 FREE',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#FFD700',
          stroke: '#000000',
          strokeWidth: 1
        },
        {
          id: 'template_text3_placeholder',
          type: 'text',
          x: 300, y: 200,
          text: 'Starting at $12.99',
          fontSize: 20,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: 'template_text4_placeholder',
          type: 'text',
          x: 300, y: 250,
          text: 'Call: (617) 505-0603',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: 'template_qrcode_placeholder',
          type: 'qrcode',
          x: 600, y: 250,
          width: 120, height: 120,
          qrData: {
            text: 'https://www.buyprintz.com',
            color: '#FFFFFF',
            backgroundColor: '#000000'
          }
        }
      ]
    },

    {
      id: 'coffee-shop-opening',
      name: 'Coffee Shop Grand Opening',
      category: 'Restaurant & Food',
      description: 'Elegant coffee shop announcement with warm colors and coffee icons',
      tags: ['coffee', 'grand opening', 'restaurant', 'cafe'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#8B4513'
        },
        {
          id: 'template_coffee_bg_placeholder',
          type: 'image',
          x: 50, y: 100,
          width: 150, height: 150,
          src: '/assets/images/food/Coffee.svg',
          opacity: 0.2
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 250, y: 60,
          text: 'GRAND OPENING',
          fontSize: 42,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#FFFFFF',
          stroke: '#8B4513',
          strokeWidth: 2
        },
        {
          id: 'template_text2_placeholder',
          type: 'text',
          x: 250, y: 120,
          text: 'Brew & Bean Café',
          fontSize: 32,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#FFD700'
        },
        {
          id: 'template_text3_placeholder',
          type: 'text',
          x: 250, y: 170,
          text: 'Saturday, March 15th',
          fontSize: 20,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: 'template_text4_placeholder',
          type: 'text',
          x: 250, y: 200,
          text: '10:00 AM - 6:00 PM',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: 'template_text5_placeholder',
          type: 'text',
          x: 250, y: 240,
          text: 'FREE Coffee for First 100 Customers!',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FFD700',
          fontStyle: 'bold'
        },
        {
          id: 'template_text6_placeholder',
          type: 'text',
          x: 250, y: 280,
          text: '123 Main Street, Downtown',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        }
      ]
    },

    {
      id: 'construction-safety-first',
      name: 'Construction Safety First',
      category: 'Construction',
      description: 'Professional construction safety banner with industry icons',
      tags: ['construction', 'safety', 'professional', 'building'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#FFA500'
        },
        {
          id: 'template_construction_bg',
          type: 'image',
          x: 50, y: 50,
          width: 200, height: 200,
          src: '/assets/images/Construction/BANNER-1_Constr.svg',
          opacity: 0.15
        },
        {
          id: 'template_text_placeholder',
          type: 'text',
          x: 300, y: 80,
          text: 'SAFETY FIRST',
          fontSize: 48,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#FFFFFF',
          stroke: '#000000',
          strokeWidth: 3
        },
        {
          id: 'template_text2_placeholder',
          type: 'text',
          x: 300, y: 140,
          text: 'BuildRight Construction',
          fontSize: 28,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#000000'
        },
        {
          id: 'template_text3_placeholder',
          type: 'text',
          x: 300, y: 180,
          text: 'Building Tomorrow, Safely Today',
          fontSize: 20,
          fontFamily: 'Inter',
          fill: '#000000'
        },
        {
          id: 'template_text4_placeholder',
          type: 'text',
          x: 300, y: 220,
          text: 'Licensed & Insured • 20+ Years Experience',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#000000'
        },
        {
          id: 'template_text5_placeholder',
          type: 'text',
          x: 300, y: 250,
          text: 'Call: (617) 505-0603',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#000000',
          fontStyle: 'bold'
        },
        {
          id: 'template_text6_placeholder',
          type: 'text',
          x: 300, y: 280,
          text: 'www.buyprintz.com',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#000000'
        }
      ]
    },

    // ENHANCED PROFESSIONAL TEMPLATES - Showcasing All Editor Features
    {
      id: 'tech-startup-launch',
      name: 'Tech Startup Launch',
      category: 'Business & Tech',
      description: 'Modern tech startup with icons, shapes, and QR code integration',
      tags: ['startup', 'tech', 'launch', 'modern'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#1E293B'
        },
        {
          id: 'template_gradient_shape',
          type: 'rect',
          x: 0, y: 0,
          width: 300, height: 400,
          fill: '#3B82F6',
          opacity: 0.8
        },
        {
          id: 'template_tech_icon',
          type: 'image',
          x: 50, y: 100,
          width: 120, height: 120,
          src: '/assets/images/icons/Cloud Computing.svg',
          opacity: 0.9
        },
        {
          id: 'template_main_text_placeholder',
          type: 'text',
          x: 350, y: 80,
          text: 'TECHNOVATE',
          fontSize: 48,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#FFFFFF',
          stroke: '#1E293B',
          strokeWidth: 2
        },
        {
          id: 'template_sub_text',
          type: 'text',
          x: 350, y: 140,
          text: 'Revolutionary AI Platform',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#60A5FA',
          stroke: '#1E293B',
          strokeWidth: 1
        },
        {
          id: 'template_features_text',
          type: 'text',
          x: 350, y: 180,
          text: '✓ Machine Learning ✓ Real-time Analytics ✓ Cloud Integration',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#E2E8F0'
        },
        {
          id: 'template_cta_text',
          type: 'text',
          x: 350, y: 220,
          text: 'Join the Future Today!',
          fontSize: 20,
          fontFamily: 'Inter',
          fill: '#FBBF24',
          fontStyle: 'bold',
          stroke: '#1E293B',
          strokeWidth: 1
        },
        {
          id: 'template_website_text',
          type: 'text',
          x: 350, y: 260,
          text: 'www.buyprintz.com',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: 'template_qr_code',
          type: 'qrcode',
          x: 600, y: 200,
          width: 120, height: 120,
          qrData: {
            text: 'https://technovate.ai/signup',
            color: '#FFFFFF',
            backgroundColor: '#1E293B'
          }
        }
      ]
    },

    {
      id: 'fitness-gym-promotion',
      name: 'Fitness Gym Promotion',
      category: 'Health & Fitness',
      description: 'Dynamic fitness promotion with icons, shapes, and modern design',
      tags: ['fitness', 'gym', 'health', 'promotion'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#DC2626'
        },
        {
          id: 'template_circle_bg',
          type: 'circle',
          x: 600, y: 50,
          width: 150, height: 150,
          fill: '#FBBF24',
          opacity: 0.3
        },
        {
          id: 'template_fitness_icon',
          type: 'image',
          x: 50, y: 100,
          width: 150, height: 150,
          src: '/assets/images/medical assets/DrawKit Vector Medical Health Icons/medical-1.svg',
          opacity: 0.2
        },
        {
          id: 'template_main_text_placeholder',
          type: 'text',
          x: 250, y: 60,
          text: 'POWER GYM',
          fontSize: 52,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#FFFFFF',
          stroke: '#DC2626',
          strokeWidth: 3
        },
        {
          id: 'template_offer_text',
          type: 'text',
          x: 250, y: 130,
          text: 'NEW YEAR SPECIAL',
          fontSize: 28,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#FBBF24',
          stroke: '#DC2626',
          strokeWidth: 2
        },
        {
          id: 'template_deal_text',
          type: 'text',
          x: 250, y: 180,
          text: '50% OFF First Month',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#FFFFFF',
          stroke: '#DC2626',
          strokeWidth: 1
        },
        {
          id: 'template_features_text',
          type: 'text',
          x: 250, y: 220,
          text: '✓ 24/7 Access ✓ Personal Training ✓ Group Classes',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FEF2F2'
        },
        {
          id: 'template_contact_text',
          type: 'text',
          x: 250, y: 260,
          text: 'Call: (617) 505-0603',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#FFFFFF',
          fontStyle: 'bold'
        },
        {
          id: 'template_address_text',
          type: 'text',
          x: 250, y: 290,
          text: '789 Fitness Street, Health District',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: 'template_qr_code',
          type: 'qrcode',
          x: 600, y: 220,
          width: 120, height: 120,
          qrData: {
            text: 'https://www.buyprintz.com',
            color: '#FFFFFF',
            backgroundColor: '#DC2626'
          }
        }
      ]
    },

    {
      id: 'real-estate-luxury',
      name: 'Luxury Real Estate',
      category: 'Real Estate',
      description: 'Premium real estate listing with elegant design and QR code',
      tags: ['real estate', 'luxury', 'property', 'elegant'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#0F172A'
        },
        {
          id: 'template_gold_accent',
          type: 'rect',
          x: 0, y: 0,
          width: 200, height: 400,
          fill: '#FBBF24',
          opacity: 0.9
        },
        {
          id: 'template_luxury_icon',
          type: 'image',
          x: 50, y: 120,
          width: 100, height: 100,
          src: '/assets/images/icons/Home.svg',
          opacity: 0.8
        },
        {
          id: 'template_main_text_placeholder',
          type: 'text',
          x: 250, y: 80,
          text: 'LUXURY LIVING',
          fontSize: 48,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#FFFFFF',
          stroke: '#0F172A',
          strokeWidth: 2
        },
        {
          id: 'template_property_text',
          type: 'text',
          x: 250, y: 140,
          text: 'Exclusive Waterfront Estate',
          fontSize: 28,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#FBBF24',
          stroke: '#0F172A',
          strokeWidth: 1
        },
        {
          id: 'template_price_text',
          type: 'text',
          x: 250, y: 180,
          text: 'Starting at $2.5M',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#FFFFFF',
          stroke: '#0F172A',
          strokeWidth: 1
        },
        {
          id: 'template_features_text',
          type: 'text',
          x: 250, y: 220,
          text: '✓ 5 Bedrooms ✓ 4 Bathrooms ✓ Ocean View ✓ Private Dock',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#E2E8F0'
        },
        {
          id: 'template_agent_text',
          type: 'text',
          x: 250, y: 260,
          text: 'Sarah Johnson, Luxury Specialist',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#FBBF24',
          fontStyle: 'bold'
        },
        {
          id: 'template_contact_text',
          type: 'text',
          x: 250, y: 290,
          text: 'Call: (617) 505-0603',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#FFFFFF'
        },
        {
          id: 'template_qr_code',
          type: 'qrcode',
          x: 600, y: 200,
          width: 120, height: 120,
          qrData: {
            text: 'https://www.buyprintz.com',
            color: '#FFFFFF',
            backgroundColor: '#0F172A'
          }
        }
      ]
    },

    {
      id: 'wedding-announcement',
      name: 'Wedding Announcement',
      category: 'Events & Parties',
      description: 'Elegant wedding announcement with romantic design and QR code',
      tags: ['wedding', 'announcement', 'romantic', 'elegant'],
      orientation: 'landscape',
      recommendedSizes: ['2x3', '3x4', '4x5', '5x6'],
      elements: [
        {
          id: 'template_rect_placeholder',
          type: 'rect',
          x: 0, y: 0,
          width: 800, height: 400,
          fill: '#F8FAFC'
        },
        {
          id: 'template_romantic_bg',
          type: 'circle',
          x: 100, y: 100,
          width: 120, height: 120,
          fill: '#FECACA',
          opacity: 0.3
        },
        {
          id: 'template_romantic_bg2',
          type: 'circle',
          x: 600, y: 200,
          width: 100, height: 100,
          fill: '#FED7D7',
          opacity: 0.3
        },
        {
          id: 'template_heart_icon',
          type: 'image',
          x: 50, y: 150,
          width: 80, height: 80,
          src: '/assets/images/icons/Heart.svg',
          opacity: 0.4
        },
        {
          id: 'template_main_text_placeholder',
          type: 'text',
          x: 200, y: 80,
          text: 'SAVE THE DATE',
          fontSize: 42,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#DC2626',
          stroke: '#FFFFFF',
          strokeWidth: 2
        },
        {
          id: 'template_couple_text',
          type: 'text',
          x: 200, y: 130,
          text: 'Sarah & Michael',
          fontSize: 36,
          fontFamily: 'Inter',
          fontStyle: 'bold',
          fill: '#1E293B',
          stroke: '#FFFFFF',
          strokeWidth: 1
        },
        {
          id: 'template_date_text',
          type: 'text',
          x: 200, y: 180,
          text: 'June 15th, 2024',
          fontSize: 24,
          fontFamily: 'Inter',
          fill: '#DC2626',
          stroke: '#FFFFFF',
          strokeWidth: 1
        },
        {
          id: 'template_time_text',
          type: 'text',
          x: 200, y: 210,
          text: '4:00 PM Ceremony',
          fontSize: 20,
          fontFamily: 'Inter',
          fill: '#1E293B'
        },
        {
          id: 'template_venue_text',
          type: 'text',
          x: 200, y: 240,
          text: 'Garden Manor Estate',
          fontSize: 18,
          fontFamily: 'Inter',
          fill: '#1E293B'
        },
        {
          id: 'template_rsvp_text',
          type: 'text',
          x: 200, y: 280,
          text: 'RSVP by May 1st',
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#DC2626',
          fontStyle: 'bold'
        },
        {
          id: 'template_qr_code',
          type: 'qrcode',
          x: 600, y: 200,
          width: 120, height: 120,
          qrData: {
            text: 'https://www.buyprintz.com',
            color: '#DC2626',
            backgroundColor: '#FFFFFF'
          }
        }
      ]
    }
  ]