import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle, FileText, Settings, Info, Download, Upload } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const ProductDetail = () => {
  const { productId } = useParams()

  const productDetails = {
    'vinyl-13oz': {
      name: "13oz Vinyl Banner",
      price: "From $25",
      image: "/assets/images/13oz Vinyl Banner.jpg",
      description: "We use a premium heavyweight 13 oz. scrim vinyl banner. This material looks great indoors, but designed to stand up to the elements outdoors. This material is typically used for billboards, building wraps, banners, event flags, trade show signage, parades, and more.\n\nStandard hems and grommets are no extra charge, and we offer a lineup of finishing options to satisfy specialty applications and city ordinances.\n\nPlease Note:\n• All banners 89\" or larger on their shortest side will be shipped folded.\n• All banners 88\" and under on their shortest side will be shipped rolled.",
      spec: {
        features: [
          "Single-Sided single piece maximum size 10' x 145' w/o pocket and 9.5' x 145' w/ pocket",
          "Double-Sided banners maximum size 9.5' x 145'",
          "Oversized banners will be welded together (Double-Sided Banners are not available oversized)",
          "Indoor and outdoor use, waterproof and UV safe",
          "Double sided banners are single-ply banner printed front and back"
        ],
        material: "UV Printed 13 oz. Matte Vinyl Banner",
        printOptions: ["Single or Double Sided"],
        optionalMaterials: [
          "Number 2 brass grommets (Stimpson)",
          "White double stitched thread",
          "1\" White Velcro (Loop side attached to banner)",
          "1\" White nylon webbing and silver d-rings",
          "Clear plastic Banner-ups banner tabs for reinforced corners",
          "3/16\" and 5/16\" Sewn in nylon rope"
        ],
        optionalFinishing: [
          "Hems and Grommets",
          "Pole Pockets",
          "Velcro",
          "Webbing and D-rings",
          "Sewn-in Rope",
          "Windslits",
          "Reinforced Corners",
          "Welded oversized banners"
        ]
      },
      fileSetup: {
        acceptedFormats: ["JPEG", "PDF (single page only)"],
        colorSpace: "CMYK",
        resolution: "150dpi for raster images (More than enough for large format)",
        maxFileSize: "300MB",
        requirements: [
          "Submit artwork built to ordered size - Scaled artwork is automatically detected and fit to order",
          "Do not include crop marks or bleeds",
          "Double sided products will be uploaded as two separate files unless otherwise specified in the artwork template"
        ],
        additionalTips: [
          "Do not submit with Pantones/Spot Colors - Convert to CMYK",
          "Convert live fonts to outlines",
          "Use provided design templates when available"
        ]
      }
    },
    'vinyl-18oz': {
      name: "18oz Blocked Banner",
      price: "From $35",
      image: "/assets/images/blockout Banner -BuyPrintz.jpg",
      description: "Our premium 18 oz. matte blockout vinyl banner provides superior opacity and durability. This heavyweight material is perfect for applications where light transmission needs to be blocked, such as double-sided banners, window graphics, and applications where the background needs to be completely concealed.\n\nThis material offers excellent print quality and is designed for both indoor and outdoor use with superior weather resistance.\n\nPlease Note:\n• All banners 89\" or larger on their shortest side will be shipped folded.\n• All banners 88\" and under on their shortest side will be shipped rolled.",
      spec: {
        features: [
          "Superior opacity for double-sided applications",
          "Maximum size 10' x 145' for single-sided",
          "Maximum size 9.5' x 145' for double-sided",
          "Excellent light blocking properties",
          "Superior weather resistance and durability",
          "Perfect for window graphics and backlit applications"
        ],
        material: "UV Printed 18 oz. Matte Blockout Vinyl Banner",
        printOptions: ["Single or Double Sided"],
        optionalMaterials: [
          "Number 2 brass grommets (Stimpson)",
          "White double stitched thread",
          "1\" White Velcro (Loop side attached to banner)",
          "1\" White nylon webbing and silver d-rings",
          "Clear plastic Banner-ups banner tabs for reinforced corners",
          "3/16\" and 5/16\" Sewn in nylon rope"
        ],
        optionalFinishing: [
          "Hems and Grommets",
          "Pole Pockets",
          "Velcro",
          "Webbing and D-rings",
          "Sewn-in Rope",
          "Windslits",
          "Reinforced Corners",
          "Welded oversized banners"
        ]
      },
      fileSetup: {
        acceptedFormats: ["JPEG", "PDF (single page only)"],
        colorSpace: "CMYK",
        resolution: "150dpi for raster images (More than enough for large format)",
        maxFileSize: "300MB",
        requirements: [
          "Submit artwork built to ordered size - Scaled artwork is automatically detected and fit to order",
          "Do not include crop marks or bleeds",
          "Double sided products will be uploaded as two separate files unless otherwise specified in the artwork template"
        ],
        additionalTips: [
          "Do not submit with Pantones/Spot Colors - Convert to CMYK",
          "Convert live fonts to outlines",
          "Use provided design templates when available"
        ]
      }
    },
    'mesh-banner': {
      name: "Mesh Banner",
      price: "From $30",
      image: "/assets/images/Mesh Banner - BuyPrintz.jpg",
      description: "Our mesh banner material features a perforated design that allows wind to pass through, making it ideal for windy locations and building wraps. The 70% air flow reduces wind load while maintaining excellent print quality and visibility.\n\nThis material is perfect for fence wraps, building wraps, and any application where wind resistance is crucial.\n\nPlease Note:\n• All banners 89\" or larger on their shortest side will be shipped folded.\n• All banners 88\" and under on their shortest side will be shipped rolled.",
      spec: {
        features: [
          "70% air flow for reduced wind load",
          "Maximum size 10' x 145' for single-sided",
          "Maximum size 9.5' x 145' for double-sided",
          "Ideal for windy locations and building wraps",
          "Excellent for fence wraps and construction sites",
          "UV resistant and weather durable"
        ],
        material: "UV Printed Mesh Vinyl Banner",
        printOptions: ["Single or Double Sided"],
        optionalMaterials: [
          "Number 2 brass grommets (Stimpson)",
          "White double stitched thread",
          "1\" White Velcro (Loop side attached to banner)",
          "1\" White nylon webbing and silver d-rings",
          "Clear plastic Banner-ups banner tabs for reinforced corners",
          "3/16\" and 5/16\" Sewn in nylon rope"
        ],
        optionalFinishing: [
          "Hems and Grommets",
          "Pole Pockets",
          "Velcro",
          "Webbing and D-rings",
          "Sewn-in Rope",
          "Windslits",
          "Reinforced Corners",
          "Welded oversized banners"
        ]
      },
      fileSetup: {
        acceptedFormats: ["JPEG", "PDF (single page only)"],
        colorSpace: "CMYK",
        resolution: "150dpi for raster images (More than enough for large format)",
        maxFileSize: "300MB",
        requirements: [
          "Submit artwork built to ordered size - Scaled artwork is automatically detected and fit to order",
          "Do not include crop marks or bleeds",
          "Double sided products will be uploaded as two separate files unless otherwise specified in the artwork template"
        ],
        additionalTips: [
          "Do not submit with Pantones/Spot Colors - Convert to CMYK",
          "Convert live fonts to outlines",
          "Use provided design templates when available"
        ]
      }
    },
    'indoor-banner': {
      name: "Indoor Banner",
      price: "From $20",
      image: "/assets/images/Indoor Banner - BuyPrintz.jpg",
      description: "Our indoor banner material features a smooth surface that provides vibrant colors and excellent print quality for indoor applications. This lightweight material is perfect for trade shows, retail displays, event signage, and presentations.\n\nThis material offers superior color reproduction and is designed specifically for indoor use where weather resistance is not required.\n\nPlease Note:\n• All banners 89\" or larger on their shortest side will be shipped folded.\n• All banners 88\" and under on their shortest side will be shipped rolled.",
      spec: {
        features: [
          "Smooth surface for vibrant colors",
          "Maximum size 10' x 145' for single-sided",
          "Maximum size 9.5' x 145' for double-sided",
          "Superior color reproduction",
          "Lightweight and easy to install",
          "Perfect for indoor applications"
        ],
        material: "UV Printed Smooth Vinyl Banner",
        printOptions: ["Single or Double Sided"],
        optionalMaterials: [
          "Number 2 brass grommets (Stimpson)",
          "White double stitched thread",
          "1\" White Velcro (Loop side attached to banner)",
          "1\" White nylon webbing and silver d-rings",
          "Clear plastic Banner-ups banner tabs for reinforced corners",
          "3/16\" and 5/16\" Sewn in nylon rope"
        ],
        optionalFinishing: [
          "Hems and Grommets",
          "Pole Pockets",
          "Velcro",
          "Webbing and D-rings",
          "Sewn-in Rope",
          "Windslits",
          "Reinforced Corners",
          "Welded oversized banners"
        ]
      },
      fileSetup: {
        acceptedFormats: ["JPEG", "PDF (single page only)"],
        colorSpace: "CMYK",
        resolution: "150dpi for raster images (More than enough for large format)",
        maxFileSize: "300MB",
        requirements: [
          "Submit artwork built to ordered size - Scaled artwork is automatically detected and fit to order",
          "Do not include crop marks or bleeds",
          "Double sided products will be uploaded as two separate files unless otherwise specified in the artwork template"
        ],
        additionalTips: [
          "Do not submit with Pantones/Spot Colors - Convert to CMYK",
          "Convert live fonts to outlines",
          "Use provided design templates when available"
        ]
      }
    },
    'pole-banner': {
      name: "Pole Banner",
      price: "From $45",
      image: "/assets/images/Pole Banner - BuyPrintz.jpg",
      description: "Our pole banners are designed with pole pockets and complete hardware kits for easy installation. These durable banners are perfect for street poles, event venues, city displays, and any application requiring professional pole mounting.\n\nThe pole pockets are sewn with reinforced stitching and include all necessary hardware for secure installation.\n\nPlease Note:\n• All banners 89\" or larger on their shortest side will be shipped folded.\n• All banners 88\" and under on their shortest side will be shipped rolled.",
      spec: {
        features: [
          "Pole pockets with reinforced stitching",
          "Complete hardware kit included",
          "Maximum size 10' x 145' for single-sided",
          "Maximum size 9.5' x 145' for double-sided",
          "Professional installation ready",
          "Weather resistant and durable"
        ],
        material: "UV Printed 18 oz. Vinyl Banner with Pole Pockets",
        printOptions: ["Single or Double Sided"],
        optionalMaterials: [
          "Number 2 brass grommets (Stimpson)",
          "White double stitched thread",
          "1\" White Velcro (Loop side attached to banner)",
          "1\" White nylon webbing and silver d-rings",
          "Clear plastic Banner-ups banner tabs for reinforced corners",
          "3/16\" and 5/16\" Sewn in nylon rope"
        ],
        optionalFinishing: [
          "Hems and Grommets",
          "Pole Pockets",
          "Velcro",
          "Webbing and D-rings",
          "Sewn-in Rope",
          "Windslits",
          "Reinforced Corners",
          "Welded oversized banners"
        ]
      },
      fileSetup: {
        acceptedFormats: ["JPEG", "PDF (single page only)"],
        colorSpace: "CMYK",
        resolution: "150dpi for raster images (More than enough for large format)",
        maxFileSize: "300MB",
        requirements: [
          "Submit artwork built to ordered size - Scaled artwork is automatically detected and fit to order",
          "Do not include crop marks or bleeds",
          "Double sided products will be uploaded as two separate files unless otherwise specified in the artwork template"
        ],
        additionalTips: [
          "Do not submit with Pantones/Spot Colors - Convert to CMYK",
          "Convert live fonts to outlines",
          "Use provided design templates when available"
        ]
      }
    },
    'fabric-9oz': {
      name: "9oz Fabric Banner",
      price: "From $35",
      image: "/assets/images/9oz Fabric Banner - BuyPrintz.jpg",
      description: "Our lightweight 9 oz. polyester fabric banner provides vibrant colors and excellent print quality through dye sublimation printing. This material is wrinkle resistant and offers a premium look perfect for trade shows, retail displays, and corporate events.\n\nThis fabric material provides a more elegant appearance compared to vinyl and is ideal for indoor applications.\n\nPlease Note:\n• All banners 89\" or larger on their shortest side will be shipped folded.\n• All banners 88\" and under on their shortest side will be shipped rolled.",
      spec: {
        features: [
          "Lightweight polyester fabric",
          "Dye sublimation printing for vibrant colors",
          "Wrinkle resistant material",
          "Maximum size 10' x 145' for single-sided",
          "Maximum size 9.5' x 145' for double-sided",
          "Premium appearance for indoor use"
        ],
        material: "Dye Sublimation Printed 9 oz. Polyester Fabric",
        printOptions: ["Single or Double Sided"],
        optionalMaterials: [
          "Number 2 brass grommets (Stimpson)",
          "White double stitched thread",
          "1\" White Velcro (Loop side attached to banner)",
          "1\" White nylon webbing and silver d-rings",
          "Clear plastic Banner-ups banner tabs for reinforced corners",
          "3/16\" and 5/16\" Sewn in nylon rope"
        ],
        optionalFinishing: [
          "Hems and Grommets",
          "Pole Pockets",
          "Velcro",
          "Webbing and D-rings",
          "Sewn-in Rope",
          "Windslits",
          "Reinforced Corners",
          "Welded oversized banners"
        ]
      },
      fileSetup: {
        acceptedFormats: ["JPEG", "PDF (single page only)"],
        colorSpace: "RGB (for dye sublimation printing)",
        resolution: "150dpi for raster images (More than enough for large format)",
        maxFileSize: "300MB",
        requirements: [
          "Submit artwork built to ordered size - Scaled artwork is automatically detected and fit to order",
          "Do not include crop marks or bleeds",
          "Double sided products will be uploaded as two separate files unless otherwise specified in the artwork template"
        ],
        additionalTips: [
          "RGB color space is preferred for dye sublimation printing",
          "Convert live fonts to outlines",
          "Use provided design templates when available"
        ]
      }
    },
    'fabric-blockout': {
      name: "Fabric Banner (9.5oz Blockout)",
      price: "From $45",
      image: "/assets/images/Fabric Banner (9.5oz. Blockout) - BuyPrintz.jpg",
      description: "Our premium 9.5 oz. blockout fabric banner provides superior opacity and color blocking properties. This material is perfect for applications where light transmission needs to be blocked, such as double-sided banners, window graphics, and applications where the background needs to be completely concealed.\n\nThis fabric material offers excellent print quality and is designed for both indoor and outdoor use with superior weather resistance.\n\nPlease Note:\n• All banners 89\" or larger on their shortest side will be shipped folded.\n• All banners 88\" and under on their shortest side will be shipped rolled.",
      spec: {
        features: [
          "Superior opacity for double-sided applications",
          "Color blocking properties",
          "Maximum size 10' x 145' for single-sided",
          "Maximum size 9.5' x 145' for double-sided",
          "Excellent light blocking properties",
          "Superior weather resistance and durability"
        ],
        material: "Dye Sublimation Printed 9.5 oz. Blockout Fabric",
        printOptions: ["Single or Double Sided"],
        optionalMaterials: [
          "Number 2 brass grommets (Stimpson)",
          "White double stitched thread",
          "1\" White Velcro (Loop side attached to banner)",
          "1\" White nylon webbing and silver d-rings",
          "Clear plastic Banner-ups banner tabs for reinforced corners",
          "3/16\" and 5/16\" Sewn in nylon rope"
        ],
        optionalFinishing: [
          "Hems and Grommets",
          "Pole Pockets",
          "Velcro",
          "Webbing and D-rings",
          "Sewn-in Rope",
          "Windslits",
          "Reinforced Corners",
          "Welded oversized banners"
        ]
      },
      fileSetup: {
        acceptedFormats: ["JPEG", "PDF (single page only)"],
        colorSpace: "RGB (for dye sublimation printing)",
        resolution: "150dpi for raster images (More than enough for large format)",
        maxFileSize: "300MB",
        requirements: [
          "Submit artwork built to ordered size - Scaled artwork is automatically detected and fit to order",
          "Do not include crop marks or bleeds",
          "Double sided products will be uploaded as two separate files unless otherwise specified in the artwork template"
        ],
        additionalTips: [
          "RGB color space is preferred for dye sublimation printing",
          "Convert live fonts to outlines",
          "Use provided design templates when available"
        ]
      }
    },
    'tension-fabric': {
      name: "Tension Fabric",
      price: "From $60",
      image: "/assets/images/Tension Fabric - Buy Printz.jpg",
      description: "Our tension fabric features a 3-way stretch material perfect for kiosks, displays, and modern installations. This material provides seamless fit and professional appearance for trade show displays, kiosks, and modern installations.\n\nThis fabric material offers excellent stretch properties and is designed for indoor use with superior print quality.\n\nPlease Note:\n• All banners 89\" or larger on their shortest side will be shipped folded.\n• All banners 88\" and under on their shortest side will be shipped rolled.",
      spec: {
        features: [
          "3-way stretch material",
          "Seamless fit for kiosks and displays",
          "Maximum size 10' x 145' for single-sided",
          "Maximum size 9.5' x 145' for double-sided",
          "Professional appearance",
          "Perfect for modern installations"
        ],
        material: "Dye Sublimation Printed Stretch Polyester Fabric",
        printOptions: ["Single or Double Sided"],
        optionalMaterials: [
          "Number 2 brass grommets (Stimpson)",
          "White double stitched thread",
          "1\" White Velcro (Loop side attached to banner)",
          "1\" White nylon webbing and silver d-rings",
          "Clear plastic Banner-ups banner tabs for reinforced corners",
          "3/16\" and 5/16\" Sewn in nylon rope"
        ],
        optionalFinishing: [
          "Hems and Grommets",
          "Pole Pockets",
          "Velcro",
          "Webbing and D-rings",
          "Sewn-in Rope",
          "Windslits",
          "Reinforced Corners",
          "Welded oversized banners"
        ]
      },
      fileSetup: {
        acceptedFormats: ["JPEG", "PDF (single page only)"],
        colorSpace: "RGB (for dye sublimation printing)",
        resolution: "150dpi for raster images (More than enough for large format)",
        maxFileSize: "300MB",
        requirements: [
          "Submit artwork built to ordered size - Scaled artwork is automatically detected and fit to order",
          "Do not include crop marks or bleeds",
          "Double sided products will be uploaded as two separate files unless otherwise specified in the artwork template"
        ],
        additionalTips: [
          "RGB color space is preferred for dye sublimation printing",
          "Convert live fonts to outlines",
          "Use provided design templates when available"
        ]
      }
    },
    'backlit-banner': {
      name: "Backlit Banner",
      price: "From $45",
      image: "/assets/images/Backlit Banner -BuyPrintz.jpg",
      description: "Our backlit banner material features translucent vinyl designed for illuminated signage with even light distribution. This material is perfect for light boxes, LED displays, and illuminated signage applications.\n\nThis material allows light to pass through while maintaining excellent print quality and is designed for both indoor and outdoor use.\n\nPlease Note:\n• All banners 89\" or larger on their shortest side will be shipped folded.\n• All banners 88\" and under on their shortest side will be shipped rolled.",
      spec: {
        features: [
          "Translucent material for light transmission",
          "Even light distribution",
          "Maximum size 10' x 145' for single-sided",
          "Maximum size 9.5' x 145' for double-sided",
          "LED compatible",
          "Perfect for illuminated signage"
        ],
        material: "UV Printed Translucent Vinyl Banner",
        printOptions: ["Single or Double Sided"],
        optionalMaterials: [
          "Number 2 brass grommets (Stimpson)",
          "White double stitched thread",
          "1\" White Velcro (Loop side attached to banner)",
          "1\" White nylon webbing and silver d-rings",
          "Clear plastic Banner-ups banner tabs for reinforced corners",
          "3/16\" and 5/16\" Sewn in nylon rope"
        ],
        optionalFinishing: [
          "Hems and Grommets",
          "Pole Pockets",
          "Velcro",
          "Webbing and D-rings",
          "Sewn-in Rope",
          "Windslits",
          "Reinforced Corners",
          "Welded oversized banners"
        ]
      },
      fileSetup: {
        acceptedFormats: ["JPEG", "PDF (single page only)"],
        colorSpace: "CMYK",
        resolution: "150dpi for raster images (More than enough for large format)",
        maxFileSize: "300MB",
        requirements: [
          "Submit artwork built to ordered size - Scaled artwork is automatically detected and fit to order",
          "Do not include crop marks or bleeds",
          "Double sided products will be uploaded as two separate files unless otherwise specified in the artwork template"
        ],
        additionalTips: [
          "Do not submit with Pantones/Spot Colors - Convert to CMYK",
          "Convert live fonts to outlines",
          "Use provided design templates when available"
        ]
      }
    }
  }

  const product = productDetails[productId]

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/products" className="text-primary-600 hover:text-primary-700">
            Back to Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead 
        title={`${product.name} - BuyPrintz`}
        description={product.description.split('\n')[0]}
        keywords={`${product.name}, banner printing, custom banners, ${product.spec.material}`}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90 backdrop-blur-sm">
            <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/10 to-transparent"></div>
          </div>
          
          <div className="relative container mx-auto px-4">
            <div className="flex items-center mb-8">
              <Link 
                to="/products" 
                className="flex items-center text-white hover:text-primary-100 transition-colors mr-6"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Products
              </Link>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
                  {product.name}
                </h1>
                <p className="text-2xl font-semibold text-primary-100 mb-6">
                  {product.price}
                </p>
                <div className="flex gap-4">
                  <Link 
                    to="/editor" 
                    onClick={() => sessionStorage.setItem('newDesign', 'true')}
                    className="bg-white/90 backdrop-blur-sm text-primary-600 hover:bg-white hover:shadow-xl px-8 py-4 rounded-xl inline-flex items-center gap-2 transition-all duration-200 shadow-lg hover:scale-105 font-semibold"
                  >
                    Design This Product
                  </Link>
                  <button className="bg-transparent border-2 border-white/80 backdrop-blur-sm text-white hover:bg-white/20 px-8 py-4 rounded-xl transition-all duration-200 shadow-lg hover:scale-105 font-semibold">
                    Get Quote
                  </button>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Description */}
              <div className="lg:col-span-2">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 mb-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-full bg-primary-100/50 mr-4">
                      <Info className="w-6 h-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Description</h2>
                  </div>
                  <div className="prose prose-lg max-w-none">
                    {product.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="text-gray-700 mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* Spec */}
              <div className="lg:col-span-1">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 mb-8">
                  <div className="flex items-center mb-6">
                    <div className="p-3 rounded-full bg-primary-100/50 mr-4">
                      <Settings className="w-6 h-6 text-primary-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Spec</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Features</h3>
                      <ul className="space-y-2">
                        {product.spec.features.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Material</h3>
                      <p className="text-gray-700">{product.spec.material}</p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Print Options</h3>
                      <ul className="space-y-1">
                        {product.spec.printOptions.map((option, index) => (
                          <li key={index} className="text-gray-700">• {option}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Optional Materials</h3>
                      <ul className="space-y-1">
                        {product.spec.optionalMaterials.map((material, index) => (
                          <li key={index} className="text-gray-700">• {material}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Optional Finishing</h3>
                      <ul className="space-y-1">
                        {product.spec.optionalFinishing.map((finishing, index) => (
                          <li key={index} className="text-gray-700">• {finishing}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* File Setup */}
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 rounded-full bg-primary-100/50 mr-4">
                  <FileText className="w-6 h-6 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">File Setup</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Accepted File Formats</h3>
                  <ul className="space-y-1">
                    {product.fileSetup.acceptedFormats.map((format, index) => (
                      <li key={index} className="text-gray-700">• {format}</li>
                    ))}
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">Color Space</h3>
                  <p className="text-gray-700">{product.fileSetup.colorSpace}</p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">Resolution</h3>
                  <p className="text-gray-700">{product.fileSetup.resolution}</p>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">Max File Upload Size</h3>
                  <p className="text-gray-700">{product.fileSetup.maxFileSize}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                  <ul className="space-y-2">
                    {product.fileSetup.requirements.map((requirement, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{requirement}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 mt-6">Additional Tips</h3>
                  <ul className="space-y-2">
                    {product.fileSetup.additionalTips.map((tip, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default ProductDetail
