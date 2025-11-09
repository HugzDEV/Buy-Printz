import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, Star, Truck, Award, Sparkles, Package, ArrowLeft } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const StickerProducts = () => {
  const navigate = useNavigate()

  const stickerProducts = [
    {
      id: 'standard-shapes',
      name: "Standard Shape Stickers",
      price: "$0.25 - $0.50",
      description: "Professional vinyl stickers in 7 standard shapes with die-cut or kiss-cut options. Perfect for branding, events, and promotional use.",
      image: "/assets/images/sticker_samples/stickers_standard_shapes.jpg",
      gtin: "0085001236005",
      features: [
        "7 Standard Shapes: Circle, Square, Rectangle, Oval, Triangle, Diamond, Star",
        "Die-cut or Kiss-cut options",
        "Roland Premium Vinyl materials",
        "Custom sizes 1\" to 6\"",
        "Landscape or portrait options for Rectangle & Oval"
      ],
      bestseller: true,
      materials: [
        {
          name: "Roland Premium Vinyl",
          description: "Professional-grade vinyl with 3-5 year outdoor durability. Weather-resistant, UV resistant, and waterproof.",
          bestFor: "Outdoor applications, long-term use"
        },
        {
          name: "Roland Clear Vinyl",
          description: "Transparent vinyl for window applications and see-through designs. Maintains clarity while providing durability.",
          bestFor: "Window decals, transparent designs"
        },
        {
          name: "Roland Paper",
          description: "High-quality paper material for indoor use. Cost-effective option for temporary applications.",
          bestFor: "Indoor use, temporary applications"
        },
        {
          name: "Orajet Premium Vinyl",
          description: "Premium vinyl with enhanced adhesive properties. Superior performance for challenging surfaces.",
          bestFor: "Difficult surfaces, premium applications"
        }
      ],
      cuttingOptions: [
        {
          name: "Die-Cut",
          description: "Precisely cut to your exact shape with clean, professional edges. No background material around your design.",
          bestFor: "Custom shapes, professional appearance"
        },
        {
          name: "Kiss-Cut",
          description: "Cut through the vinyl but not the backing paper. Easy to apply with transfer tape included.",
          bestFor: "Easy application, bulk orders"
        }
      ],
      sizes: [
        "1\" - Perfect for small logos and details",
        "2\" - Ideal for product labels and small branding",
        "3\" - Most popular size for general use",
        "4\" - Great for medium-sized applications",
        "5\" - Perfect for larger branding needs",
        "6\" - Maximum size for standard shapes"
      ]
    },
    {
      id: 'custom-gang-sheet',
      name: "Custom Gang Sheet Stickers",
      price: "$15.00 - $25.00",
      description: "Large 20\" x 20\" gang sheets for custom die-cutting. Perfect for unique shapes, large quantities, and complex designs.",
      image: "/assets/images/sticker_samples/gang_sheet_sample.jpg",
      gtin: "0085001236012",
      features: [
        "20\" x 20\" gang sheet with 17\" x 17\" printable area",
        "Custom die-cutting for any shape",
        "Perfect for large quantity orders",
        "Unique shapes and complex designs",
        "Professional gang sheet production"
      ],
      materials: [
        {
          name: "Roland Premium Vinyl",
          description: "Professional-grade vinyl with 3-5 year outdoor durability. Weather-resistant, UV resistant, and waterproof.",
          bestFor: "Outdoor applications, long-term use"
        },
        {
          name: "Roland Clear Vinyl",
          description: "Transparent vinyl for window applications and see-through designs. Maintains clarity while providing durability.",
          bestFor: "Window decals, transparent designs"
        },
        {
          name: "Roland Paper",
          description: "High-quality paper material for indoor use. Cost-effective option for temporary applications.",
          bestFor: "Indoor use, temporary applications"
        },
        {
          name: "Orajet Premium Vinyl",
          description: "Premium vinyl with enhanced adhesive properties. Superior performance for challenging surfaces.",
          bestFor: "Difficult surfaces, premium applications"
        }
      ],
      cuttingOptions: [
        {
          name: "Custom Die-Cut",
          description: "Precisely cut to your exact custom shape with clean, professional edges. Perfect for unique designs and complex shapes.",
          bestFor: "Custom shapes, unique designs"
        }
      ],
      sizes: [
        "20\" x 20\" gang sheet",
        "17\" x 17\" printable area",
        "1.5\" margins on all sides",
        "Perfect for large quantity orders"
      ]
    }
  ]


  // Breadcrumb Schema (no @context here - defined in parent @graph)
  const breadcrumbSchema = {
    "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.buyprintz.com/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Products",
          "item": "https://www.buyprintz.com/all-products"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Custom Stickers",
          "item": "https://www.buyprintz.com/stickers"
        }
      ]
  }

  // Product Collection Schema - ItemList with Products (no @context here - defined in parent @graph)
  const productListSchema = {
    "@type": "ItemList",
    "name": "Custom Stickers - Vinyl Stickers & Decals",
    "description": "Professional custom stickers and vinyl decals. Weather-resistant, durable stickers for business, events, and personal use. Starting at $0.25 per sticker. Fast 2-3 day delivery.",
    "url": "https://www.buyprintz.com/stickers",
      "numberOfItems": stickerProducts.length,
      "itemListElement": stickerProducts.map((sticker, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "@id": `https://www.buyprintz.com/stickers#${sticker.id}`,
          "name": sticker.name,
          "description": sticker.description,
          "image": [
            `https://www.buyprintz.com${sticker.image}`,
            "https://www.buyprintz.com/assets/images/sticker-showcase.jpg"
          ],
          "sku": `STICKER-${sticker.id.toUpperCase()}`,
          "gtin": sticker.gtin,
          "mpn": `STICKER${sticker.id.replace('-', '').toUpperCase()}`,
          "brand": {
            "@type": "Brand",
            "name": "BuyPrintz",
            "logo": "https://www.buyprintz.com/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png"
          },
          "manufacturer": {
            "@type": "Organization",
            "name": "BuyPrintz",
            "url": "https://www.buyprintz.com"
          },
          "category": "Stickers & Decals > Vinyl Stickers",
          "material": "Roland Premium Vinyl",
          "color": "Custom",
          "offers": {
            "@type": "Offer",
            "url": `https://www.buyprintz.com/stickers#${sticker.id}`,
            "price": "0.25",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "priceValidUntil": "2026-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {
              "@type": "Organization",
              "@id": "https://www.buyprintz.com",
              "name": "BuyPrintz"
            },
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "applicableCountry": "US",
              "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted",
              "returnMethod": "https://schema.org/ReturnByMail"
            },
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": {
                "@type": "MonetaryAmount",
                "value": "0",
                "currency": "USD"
              },
              "shippingDestination": {
                "@type": "DefinedRegion",
                "addressCountry": "US"
              },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 2,
                  "maxValue": 3,
                  "unitCode": "DAY"
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 1,
                  "maxValue": 2,
                  "unitCode": "DAY"
                }
              }
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "89",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Sarah Johnson"
              },
              "datePublished": "2025-09-15",
              "reviewBody": "Excellent quality stickers! The vinyl is thick and durable, perfect for outdoor use. The printing is crisp and colors are vibrant.",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              }
            },
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Mike Chen"
              },
              "datePublished": "2025-09-20",
              "reviewBody": "Great stickers for our business events. Fast turnaround and excellent customer service. Will definitely order again!",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              }
            }
          ],
          "additionalProperty": [
            ...sticker.features.map(feature => ({
              "@type": "PropertyValue",
              "name": "Feature",
              "value": feature
            })),
            {
              "@type": "PropertyValue",
              "name": "Material",
              "value": "Roland Premium Vinyl"
            },
            {
              "@type": "PropertyValue",
              "name": "Finish",
              "value": "Matte or Glossy"
            },
            {
              "@type": "PropertyValue",
              "name": "Shape",
              "value": sticker.id === 'standard-shapes' ? '7 Standard Shapes' : 'Custom Gang Sheet'
            },
            {
              "@type": "PropertyValue",
              "name": "Size Range",
              "value": sticker.id === 'standard-shapes' ? '1" to 6"' : '20" x 20" gang sheet'
            },
            {
              "@type": "PropertyValue",
              "name": "Production Time",
              "value": "2-3 business days"
            }
          ]
        }
      }))
  }

  // How-To Schema for ordering stickers
  const howToSchema = {
    "@type": "HowTo",
    "name": "How to Order Custom Stickers",
    "description": "Step-by-step guide to ordering custom stickers from BuyPrintz with 8 shapes and Roland premium materials",
    "totalTime": "PT15M",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Choose Your Sticker Shape",
        "text": "Select from 8 shapes: circle, square, rectangle, oval, triangle, diamond, star, or custom gang sheet. Each shape has different design considerations and applications.",
        "url": "https://www.buyprintz.com/stickers"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Design Your Sticker",
        "text": "Use our custom editor to create your sticker design. Upload files in any format, use our design tools, or purchase assets from our creator marketplace.",
        "url": "https://www.buyprintz.com/editor?product=sticker"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Select Materials & Cutting",
        "text": "Choose from Roland Premium Vinyl, Roland Clear Vinyl, Roland Paper, or Orajet Premium Vinyl. Select die-cut or kiss-cut options for professional finishing.",
        "url": "https://www.buyprintz.com/stickers"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Choose Size & Orientation",
        "text": "Select size from 1\" to 6\" for standard shapes, or 20\" x 20\" gang sheets for custom shapes. Choose landscape or portrait for rectangles and ovals.",
        "url": "https://www.buyprintz.com/editor?product=sticker"
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Review and Order",
        "text": "Preview your design, get instant pricing based on quantity, size, and materials, then complete your order. Production begins immediately.",
        "url": "https://www.buyprintz.com/editor?product=sticker"
      },
      {
        "@type": "HowToStep",
        "position": 6,
        "name": "Receive Your Stickers",
        "text": "Your custom stickers will be produced in 2-3 business days with professional die-cutting and shipped with application instructions.",
        "url": "https://www.buyprintz.com/stickers"
      }
    ]
  }

  // Combine schemas
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbSchema,
      productListSchema,
      howToSchema
    ]
  }

  return (
    <>
      <SEOHead {...seoConfigs.stickers} structuredData={combinedSchema} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="/assets/images/sticker_samples/printer_backdrop.jpg" 
            alt="Professional sticker printing equipment"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-primary-800/30 backdrop-blur-sm">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white/5 to-transparent"></div>
          </div>
        </div>
        
        <div className="relative container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Link 
              to="/all-products" 
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200 group"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
              <span className="font-medium">Back to All Products</span>
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Custom Stickers & Decals
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto drop-shadow-md">
              Professional vinyl stickers in 8 shapes with Roland premium materials. Die-cut, kiss-cut, and custom gang sheets available. Starting at $0.25 per sticker.
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-4 gap-6 mt-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Roland Premium</span>
              </div>
              <p className="text-primary-100">Professional vinyl materials</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">8 Shapes</span>
              </div>
              <p className="text-primary-100">Circle to custom gang sheets</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Die-Cut & Kiss-Cut</span>
              </div>
              <p className="text-primary-100">Professional cutting options</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-white">Fast Production</span>
              </div>
              <p className="text-primary-100">2-3 business day turnaround</p>
            </div>
          </div>
        </div>
      </section>


      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {stickerProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:bg-white/80 h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative h-80">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&sig=${product.id}`
                      }}
                    />
                    
                    {/* Badges */}
                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                      <div className="bg-primary-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        {product.price}
                      </div>
                      {product.bestseller && (
                        <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Best Seller
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-6 text-base">
                      {product.description}
                    </p>
                    
                    {/* Price */}
                    <div className="mb-6">
                      <span className="text-2xl font-bold text-primary-600">{product.price}</span>
                      <span className="text-gray-500 text-sm ml-2">starting price</span>
                    </div>
                    
                    {/* Key Features */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {product.features.slice(0, 3).map((feature, featureIndex) => (
                          <span 
                            key={featureIndex}
                            className="inline-flex items-center bg-primary-50/80 backdrop-blur-sm text-primary-700 text-xs px-2 py-1 rounded-full border border-primary-200/50"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Quick Specs */}
                    <div className="mb-6 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Specifications</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div><strong>Materials:</strong> Roland Premium Vinyl, Clear Vinyl, Paper</div>
                        <div><strong>Cutting:</strong> Die-cut & Kiss-cut options</div>
                        <div><strong>Sizes:</strong> {product.id === 'standard-shapes' ? '1" to 6"' : '20" x 20" gang sheet'}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-auto">
                      <Link 
                        to={`/sticker-product/${product.id}`}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        View Details
                      </Link>
                      {product.id === 'standard-shapes' ? (
                        <div className="flex-1 relative">
                          <select 
                            onChange={(e) => {
                              if (e.target.value) {
                                navigate(`/editor?product=sticker&shape=${e.target.value}`)
                              }
                            }}
                            className="w-full bg-buyprint-brand hover:bg-buyprint-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 appearance-none cursor-pointer text-center pr-8 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:ring-offset-2"
                          >
                            <option value="">Choose Shape</option>
                            <option value="circle">Circle Stickers</option>
                            <option value="square">Square Stickers</option>
                            <option value="rectangle">Rectangle Stickers</option>
                            <option value="oval">Oval Stickers</option>
                            <option value="triangle">Triangle Stickers</option>
                            <option value="diamond">Diamond Stickers</option>
                            <option value="star">Star Stickers</option>
                          </select>
                          <ArrowRight className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 pointer-events-none" />
                        </div>
                      ) : (
                        <Link 
                          to="/editor?product=sticker&shape=custom"
                          className="flex-1 bg-buyprint-brand hover:bg-buyprint-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:ring-offset-2"
                        >
                          Design Now
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8">
              Ready to Create Your Perfect Stickers?
            </h2>
            <p className="text-xl mb-12 text-white/90 leading-relaxed">
              Choose from 8 professional shapes, Roland premium materials, and our custom editor. Upload your files or design from scratch with our creator marketplace assets.
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link 
                to="/editor?product=sticker" 
                className="bg-white/90 backdrop-blur-sm text-primary-600 hover:bg-white hover:shadow-xl text-lg px-8 py-4 rounded-xl inline-flex items-center gap-2 transition-all duration-200 shadow-lg hover:scale-105"
              >
                Start Designing
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link 
                to="/all-products"
                className="bg-transparent border-2 border-white/50 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-xl inline-flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
              >
                View All Products
                <Star className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}

export default StickerProducts
