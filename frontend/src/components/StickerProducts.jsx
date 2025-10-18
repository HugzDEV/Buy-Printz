import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Filter, Search, Star, Truck, Award, Clock, Sparkles, Package, Layers, ArrowLeft } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const StickerProducts = () => {
  const [selectedShape, setSelectedShape] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const shapes = [
    { id: 'all', name: 'All Shapes', count: 1 },
    { id: 'circle', name: 'Circle', count: 1 }
  ]

  const stickerProducts = [
    {
      id: 'circle-sticker',
      shape: 'circle',
      name: "Circle Vinyl Stickers",
      price: "$0.25 - $0.45",
      description: "Professional vinyl stickers in perfect circles. Weather-resistant, durable, and perfect for branding, events, and promotional use.",
      image: "/assets/images/circle-sticker-buyprintz.jpg",
      features: ["Weather-resistant vinyl", "UV resistant", "Waterproof", "Custom sizes available"],
      bestseller: true,
      specs: {
        material: "Premium Vinyl",
        finish: "Matte or Glossy",
        shape: "Circle",
        size: "1\" - 6\" diameter",
        printingMethod: "Digital Printing",
        durability: "Outdoor rated (3-5 years)",
        waterproof: true,
        uvResistant: true,
        removable: false,
        indoorOutdoor: "Both"
      },
      accessories: [
        "Die-cut to shape (FREE)",
        "Matte finish (FREE)", 
        "Glossy finish (FREE)",
        "Clear vinyl option (Upgrade)"
      ]
    }
  ]

  // Filter products based on shape and search
  const filteredProducts = stickerProducts.filter(product => {
    const matchesShape = selectedShape === 'all' || product.shape === selectedShape
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesShape && matchesSearch
  })

  // Enhanced Product Collection Schema with proper Google Shopping support
  const stickerProductsStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Custom Stickers - Vinyl Stickers & Decals",
    "description": "Professional custom stickers and vinyl decals. Weather-resistant, durable stickers for business, events, and personal use. Starting at $0.25 per sticker. Fast 2-3 day delivery.",
    "url": "https://www.buyprintz.com/stickers",
    "breadcrumb": {
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
    },
    "mainEntity": {
      "@type": "ItemList",
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
          "gtin": "0085001236001",
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
          "material": sticker.specs.material,
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
              "value": sticker.specs.material
            },
            {
              "@type": "PropertyValue",
              "name": "Finish",
              "value": sticker.specs.finish
            },
            {
              "@type": "PropertyValue",
              "name": "Shape",
              "value": sticker.specs.shape
            },
            {
              "@type": "PropertyValue",
              "name": "Size Range",
              "value": sticker.specs.size
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
  }

  // How-To Schema for ordering stickers
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Order Custom Stickers",
    "description": "Step-by-step guide to ordering custom stickers from BuyPrintz",
    "totalTime": "PT15M",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Choose Your Sticker Shape",
        "text": "Select from circle, square, rectangle, oval, triangle, diamond, or custom shapes. Each shape has different design considerations and applications.",
        "url": "https://www.buyprintz.com/stickers"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Design Your Sticker",
        "text": "Use our canvas editor to create your custom sticker design. Upload logos, add text, and position elements within the circular safe zone.",
        "url": "https://www.buyprintz.com/editor?product=sticker"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Select Specifications",
        "text": "Choose material (vinyl, paper, clear), finish (matte, glossy), and size. Consider indoor vs outdoor use for durability requirements.",
        "url": "https://www.buyprintz.com/stickers"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Review and Order",
        "text": "Preview your design, get instant pricing based on quantity and size, then complete your order. Production begins immediately.",
        "url": "https://www.buyprintz.com/editor?product=sticker"
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Receive Your Stickers",
        "text": "Your custom stickers will be produced in 2-3 business days and shipped with professional packaging and application instructions.",
        "url": "https://www.buyprintz.com/stickers"
      }
    ]
  }

  // Combine schemas
  const combinedSchema = {
    "@graph": [
      stickerProductsStructuredData,
      howToSchema
    ]
  }

  return (
    <>
      <SEOHead {...seoConfigs.stickers} structuredData={combinedSchema} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}
      <section className="relative py-16 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/10 to-transparent"></div>
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
              Custom Stickers
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto drop-shadow-md">
              Professional vinyl stickers and decals - starting at $0.25 per sticker with weather-resistant, durable materials
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Weather Resistant</span>
              </div>
              <p className="text-primary-100">3-5 year outdoor durability</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Custom Shapes</span>
              </div>
              <p className="text-primary-100">Circle, square, custom die-cut</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Fast Production</span>
              </div>
              <p className="text-primary-100">2-3 business day turnaround</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 relative">
        <div className="container mx-auto px-4">
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
            <div className="flex flex-col lg:flex-row gap-6 items-center">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search sticker products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-inner"
                />
              </div>
              
              {/* Shape Filters */}
              <div className="flex flex-wrap gap-2">
                {shapes.map((shape) => (
                  <button
                    key={shape.id}
                    onClick={() => setSelectedShape(shape.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedShape === shape.id
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                        : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {shape.name} ({shape.count})
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600 font-medium">
              Showing {filteredProducts.length} of {stickerProducts.length} sticker products
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:bg-white/80 h-full flex flex-col transform hover:scale-105 active:scale-95">
                  {/* Product Image */}
                  <div className="relative h-96">
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
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm flex-grow">
                      {product.description}
                    </p>
                    
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
                    
                    {/* Specifications */}
                    <div className="mb-6 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Specifications</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div><strong>Material:</strong> {product.specs.material}</div>
                        <div><strong>Shape:</strong> {product.specs.shape}</div>
                        <div><strong>Size:</strong> {product.specs.size}</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-auto">
                      <Link 
                        to={`/product/${product.id}`}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        View Details
                      </Link>
                      <Link 
                        to="/editor?product=sticker"
                        className="flex-1 bg-buyprint-brand hover:bg-buyprint-600 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:ring-offset-2"
                      >
                        Design Now
                        <ArrowRight className="w-4 h-4" />
                      </Link>
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
              Start designing with our professional tools and create lasting impressions with custom stickers
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
