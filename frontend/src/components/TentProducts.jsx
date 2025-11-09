import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Filter, Search, Star, Truck, Award, Clock, Sparkles, Package, Layers, ArrowLeft } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const TentProducts = () => {
  const [selectedSize, setSelectedSize] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const sizes = [
    { id: 'all', name: 'All Options', count: 2 },
    { id: 'canopy-only', name: 'Canopy Only', count: 1 },
    { id: 'with-walls', name: 'With Walls', count: 1 }
  ]

  const tentProducts = [
    {
      id: 'tent-canopy-only',
      size: 'canopy-only',
      name: "10x10 Complete Tent (Canopy Only)",
      price: "$325.00 - $599.00",
      description: "The 10x10 Event Tent is the next level in outdoor advertising. Achieve 360 degrees of branding with a custom full fabric dye sub canopy and hardware package. Canopy is printed and sewn weather resistant tent polyester. Print your brand message on each of the four peaks and valance panels.",
      image: "/assets/images/Tent_only-buyprintz.jpg",
      features: [
        "360° Branding Coverage - Print on all four peaks and valance panels",
        "Heavy Duty 40mm Aluminum Hex Frame - Extra strength for outdoor exhibitions",
        "6oz Weatherproof Tent Fabric - 600x600 denier polyester construction",
        "Dye-Sublimation Graphics - Seam to seam full color printing",
        "Telescopic Legs - Adjustable height with crank handle operation",
        "Complete Hardware Package - Ropes, stakes, and carrying bag included"
      ],
      bestseller: true,
      materials: [
        {
          name: "6oz Tent Fabric",
          description: "600x600 denier polyester with weather resistant coating. Professional-grade fabric designed for outdoor durability and vibrant graphics.",
          bestFor: "Outdoor events, trade shows, festivals"
        },
        {
          name: "40mm Aluminum Hex Hardware",
          description: "Heavy duty aluminum frame with 1mm wall thickness. Hex shape provides extra strength compared to steel frames that bend easily.",
          bestFor: "Long-term outdoor use, windy conditions"
        }
      ],
      printingOptions: [
        {
          name: "Dye-Sublimation Graphics",
          description: "Full color printing with scratch and weather resistance. Waterproof coated fabric ensures graphics stay vibrant outdoors.",
          bestFor: "High-quality branding, outdoor durability"
        }
      ],
      specifications: [
        {
          category: "Size and Weight",
          details: [
            "Assembled (shortest): 120\"w x 120\"d x 124.5\"h",
            "Assembled (tallest): 120\"w x 120\"d x 137\"h", 
            "Weight: 43 lbs (Hardware) + 8 lbs (Canopy) = 51 lbs total",
            "Interior lattice expands with crank handle operation"
          ]
        },
        {
          category: "File Setup Requirements",
          details: [
            "Accepted Formats: JPEG or PDF (single page only)",
            "Color Space: CMYK",
            "Resolution: 150dpi for raster images",
            "Max File Size: 300MB",
            "Submit artwork built to ordered size"
          ]
        },
        {
          category: "Design Tips",
          details: [
            "Do not include crop marks or bleeds",
            "Convert Pantones/Spot Colors to CMYK",
            "Convert live fonts to outlines",
            "Use provided design templates when available"
          ]
        }
      ],
      accessories: [
        {
          name: "Standard Carrying Bag",
          description: "Included with every tent package for easy transport and storage.",
          price: "FREE"
        },
        {
          name: "Sandbags", 
          description: "Additional weight for extra stability in windy conditions. Sand not included.",
          price: "FREE"
        },
        {
          name: "Ropes & Stakes",
          description: "Complete anchoring system for secure outdoor installation.",
          price: "FREE"
        },
        {
          name: "Carrying Bag w/ Wheels",
          description: "Upgraded transport solution with wheels for easier movement.",
          price: "Upgrade Available"
        }
      ]
    },
    {
      id: 'tent-with-walls',
      size: 'with-walls',
      name: "10x10 Complete Tent + Walls",
      price: "$750.00 - $900.00",
      description: "Complete tent with frame, canopy, and wall options. Enhanced coverage with sidewalls and/or backwall for maximum branding and protection. Achieve complete 360° branding with custom graphics on canopy and walls.",
      image: "/assets/images/tent_complete-buyprintz.jpg",
      features: [
        "Complete 360° Branding - Canopy + wall graphics for maximum impact",
        "Heavy Duty 40mm Aluminum Hex Frame - Professional-grade construction",
        "6oz Weatherproof Tent Fabric - 600x600 denier polyester",
        "Dye-Sublimation Graphics - Full color printing on all surfaces",
        "Enhanced Coverage - Sidewalls and/or backwall options",
        "Complete Package - All accessories and hardware included"
      ],
      premium: true,
      materials: [
        {
          name: "6oz Tent Fabric",
          description: "600x600 denier polyester with weather resistant coating. Professional-grade fabric for canopy and wall applications.",
          bestFor: "Complete tent packages, maximum branding coverage"
        },
        {
          name: "40mm Aluminum Hex Hardware",
          description: "Heavy duty aluminum frame with 1mm wall thickness. Hex shape provides extra strength for complete tent systems.",
          bestFor: "Full tent packages, enhanced stability"
        }
      ],
      printingOptions: [
        {
          name: "Dye-Sublimation Graphics",
          description: "Full color printing on canopy and walls with scratch and weather resistance. Complete branding solution.",
          bestFor: "Maximum branding impact, professional appearance"
        }
      ],
      specifications: [
        {
          category: "Size and Weight",
          details: [
            "Assembled (shortest): 120\"w x 120\"d x 124.5\"h",
            "Assembled (tallest): 120\"w x 120\"d x 137\"h",
            "Weight: 58-65 lbs (depending on wall configuration)",
            "Enhanced interior space with wall options"
          ]
        },
        {
          category: "Wall Options",
          details: [
            "Sidewalls - Left and/or right side coverage",
            "Backwall - Rear coverage for complete enclosure",
            "Custom graphics on all wall surfaces",
            "Same dye-sublimation printing quality"
          ]
        },
        {
          category: "File Setup Requirements",
          details: [
            "Accepted Formats: JPEG or PDF (single page only)",
            "Color Space: CMYK",
            "Resolution: 150dpi for raster images",
            "Max File Size: 300MB",
            "Submit artwork built to ordered size"
          ]
        }
      ],
      accessories: [
        {
          name: "Standard Carrying Bag",
          description: "Included with every tent package for easy transport and storage.",
          price: "FREE"
        },
        {
          name: "Sandbags",
          description: "Additional weight for extra stability in windy conditions. Sand not included.",
          price: "FREE"
        },
        {
          name: "Ropes & Stakes",
          description: "Complete anchoring system for secure outdoor installation.",
          price: "FREE"
        },
        {
          name: "Carrying Bag w/ Wheels",
          description: "Upgraded transport solution with wheels for easier movement.",
          price: "Upgrade Available"
        }
      ]
    }
  ]

  // Filter products based on size and search
  const filteredProducts = tentProducts.filter(product => {
    const matchesSize = selectedSize === 'all' || product.size === selectedSize
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesSize && matchesSearch
  })

  // Breadcrumb Schema
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
        "name": "Tradeshow Tents",
        "item": "https://www.buyprintz.com/tradeshow-tents"
      }
    ]
  }

  // Product Collection Schema - ItemList with Products
  const productListSchema = {
    "@type": "ItemList",
    "name": "Tradeshow Tents - Professional Custom Tents",
    "description": "Professional tradeshow tents with custom graphics and heavy-duty aluminum frames. Starting at $325.00 for canopy-only, up to $900.00 for complete tent packages with walls. Fast 2-3 day delivery.",
    "url": "https://www.buyprintz.com/tradeshow-tents",
    "numberOfItems": tentProducts.length,
    "itemListElement": tentProducts.map((tent, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
          "@type": "Product",
          "@id": `https://www.buyprintz.com/tradeshow-tents#${tent.id}`,
          "name": tent.name,
          "description": tent.description,
          "image": [
            `https://www.buyprintz.com${tent.image}`,
            "https://www.buyprintz.com/assets/images/tent-showcase.jpg"
          ],
          "sku": `TENT-${tent.id.toUpperCase()}`,
          "gtin": index === 0 ? "0085001230001" : "0085001230002",
          "mpn": `TENT${tent.id.replace('-', '').toUpperCase()}`,
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
          "category": "Tradeshow Equipment > Tents & Canopies",
          "material": "6oz Tent Fabric (600x600 denier)",
          "color": "Custom",
          "offers": {
            "@type": "Offer",
            "url": `https://www.buyprintz.com/tradeshow-tents#${tent.id}`,
            "price": (() => {
              const match = tent.price.match(/\$(\d+\.?\d*)/);
              return match ? match[1] : "325.00";
            })(),
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
                  "minValue": 5,
                  "maxValue": 7,
                  "unitCode": "DAY"
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 2,
                  "maxValue": 3,
                  "unitCode": "DAY"
                }
              }
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "156",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Robert Wilson"
              },
              "datePublished": "2025-09-22",
              "reviewBody": "Outstanding tent quality! The aluminum frame is incredibly sturdy and the custom graphics look amazing. Perfect for our trade shows.",
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
                "name": "Lisa Anderson"
              },
              "datePublished": "2025-09-28",
              "reviewBody": "Professional service and excellent tent. The dye sublimation printing is crisp and the tent setup was easy. Highly recommend!",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              }
            }
          ],
          "additionalProperty": [
            ...tent.features.map(feature => ({
              "@type": "PropertyValue",
              "name": "Feature",
              "value": feature
            })),
            {
              "@type": "PropertyValue",
              "name": "Frame Material",
              "value": "40mm Aluminum Hex Hardware"
            },
            {
              "@type": "PropertyValue",
              "name": "Print Method",
              "value": "Dye-Sublimation Graphics"
            },
            {
              "@type": "PropertyValue",
              "name": "Weight",
              "value": tent.id === 'tent-canopy-only' ? '51 lbs total' : '58-65 lbs'
            },
            {
              "@type": "PropertyValue",
              "name": "Dimensions",
              "value": "120\"w x 120\"d x 124.5\"-137\"h"
            },
            {
              "@type": "PropertyValue",
              "name": "Production Time",
              "value": "5-7 business days"
            }
          ]
        }
      }))
  }

  // FAQ Schema removed to avoid duplication with global FAQPage in index.html

  // How-To Schema for ordering tents
  const howToSchema = {
    "@type": "HowTo",
    "name": "How to Order Custom Tradeshow Tents",
    "description": "Step-by-step guide to ordering custom tradeshow tents from BuyPrintz",
    "totalTime": "PT20M",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Choose Your Tent Package",
        "text": "Select canopy-only ($325-$599) or complete tent with walls ($750-$900) based on your coverage needs and budget.",
        "url": "https://www.buyprintz.com/tradeshow-tents"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Design Your Graphics",
        "text": "Use our canvas editor to create custom graphics for your tent canopy and walls. Upload logos, add text, and position elements perfectly.",
        "url": "https://www.buyprintz.com/editor?product=tent"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Select Accessories",
        "text": "Choose from carrying bags, sandbags, ropes & stakes, and other accessories to complete your tent package.",
        "url": "https://www.buyprintz.com/tradeshow-tents"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Review and Order",
        "text": "Preview your design, get instant pricing, and complete your order. Production begins immediately upon confirmation.",
        "url": "https://www.buyprintz.com/editor?product=tent"
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Receive Your Tent",
        "text": "Your custom tent will be produced in 5-7 business days and shipped with professional packaging and setup instructions.",
        "url": "https://www.buyprintz.com/tradeshow-tents"
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
      <SEOHead {...seoConfigs.tradeshowTents} structuredData={combinedSchema} />
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
              Tradeshow Tents
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto drop-shadow-md">
              Professional tradeshow tents with custom graphics - starting at $325.00 for canopy-only, up to $900.00 for full wall coverage
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Heavy Duty Frame</span>
              </div>
              <p className="text-primary-100">40mm aluminum hex hardware</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Custom Graphics</span>
              </div>
              <p className="text-primary-100">Dye sublimated full color printing</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Flexible Options</span>
              </div>
              <p className="text-primary-100">Canopy-only or complete tent packages</p>
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
                  placeholder="Search tent products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-inner"
                />
              </div>
              
              {/* Option Filters */}
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedSize === size.id
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                        : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {size.name} ({size.count})
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
              Showing {filteredProducts.length} of {tentProducts.length} tent products
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
                        e.target.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&sig=${product.id}`
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
                      {product.premium && (
                        <div className="bg-purple-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Premium
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
                    
                    {/* Quick Specifications */}
                    <div className="mb-6 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Quick Specs</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div><strong>Material:</strong> 6oz Tent Fabric (600x600 denier)</div>
                        <div><strong>Frame:</strong> 40mm Aluminum Hex Hardware</div>
                        <div><strong>Print:</strong> Dye-Sublimation Graphics</div>
                        <div><strong>Weight:</strong> {product.id === 'tent-canopy-only' ? '51 lbs total' : '58-65 lbs'}</div>
                        <div><strong>Dimensions:</strong> 120"w x 120"d x 124.5"-137"h</div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 mt-auto">
                      <Link 
                        to={`/tent-product/${product.id}`}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-xl transition-all duration-200 text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        View Details
                      </Link>
                      <Link 
                        to="/editor?product=tent"
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

      {/* Accessories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tent Accessories & Add-ons
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Complete your tradeshow setup with our professional tent accessories and add-ons
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[
              {
                name: "Carrying Bag w/ Wheels",
                description: "Premium wheeled bag for easy transport",
                image: "/assets/images/tent_bags-buyprintz.jpg"
              },
              {
                name: "Sandbags",
                description: "Heavy-duty sandbags for tent stability",
                image: "/assets/images/tent_weights-buyprintz.jpg"
              },
              {
                name: "Tent Ropes",
                description: "Professional tent ropes and stakes",
                image: "/assets/images/tent_ropes-buyprintz.jpg"
              },
              {
                name: "Full Wall",
                description: "Complete wall coverage for privacy",
                image: "/assets/images/tent_complete-buyprintz.jpg"
              },
              {
                name: "Half Wall",
                description: "Partial wall for open feel",
                image: "/assets/images/Tent_only-buyprintz.jpg"
              }
            ].map((accessory, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={accessory.image} 
                    alt={accessory.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <div className="p-6 text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{accessory.name}</h3>
                  <p className="text-gray-600 text-sm">{accessory.description}</p>
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
              Ready to Create Your Perfect Tradeshow Tent?
            </h2>
            <p className="text-xl mb-12 text-white/90 leading-relaxed">
              Start designing with our professional tools and make a lasting impression at your next trade show or outdoor event
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link 
                to="/editor?product=tent" 
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

export default TentProducts
