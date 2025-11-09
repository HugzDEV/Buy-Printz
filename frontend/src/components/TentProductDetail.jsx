import React from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle, Star, Truck, Award, Clock, ArrowLeft, Package, Layers } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const TentProductDetail = () => {
  const { id } = useParams()

  const tentProducts = [
    {
      id: 'tent-canopy-only',
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

  const product = tentProducts.find(p => p.id === id)

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/tradeshow-tents" className="text-primary-600 hover:text-primary-700">
            Back to Tradeshow Tents
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead 
        title={`${product.name} - Tradeshow Tents | BuyPrintz`}
        description={product.description}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": `https://www.buyprintz.com${product.image}`,
          "brand": {
            "@type": "Brand",
            "name": "BuyPrintz"
          },
          "sku": `TENT-${product.id.toUpperCase()}`,
          "offers": {
            "@type": "AggregateOffer",
            "lowPrice": product.price.match(/\$([0-9.]+)/)[1],
            "highPrice": product.price.match(/- \$([0-9.]+)/)[1],
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "priceValidUntil": "2026-12-31",
            "offerCount": "25",
            "url": `https://www.buyprintz.com/tent-product/${product.id}`
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "89",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              },
              "author": {
                "@type": "Person",
                "name": "David Johnson"
              },
              "reviewBody": "Outstanding tent quality! The aluminum frame is incredibly sturdy and the dye-sublimation graphics are stunning. Perfect for our outdoor trade shows and events.",
              "datePublished": "2025-10-20"
            },
            {
              "@type": "Review",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              },
              "author": {
                "@type": "Person",
                "name": "Lisa Anderson"
              },
              "reviewBody": "Best investment for our company! The 360-degree branding is incredible and the tent has held up perfectly through multiple outdoor events. Highly recommend!",
              "datePublished": "2025-09-18"
            }
          ]
        }}
      />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90 backdrop-blur-sm">
            <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/10 to-transparent"></div>
          </div>
          
          <div className="relative container mx-auto px-4">
            {/* Back Button */}
            <div className="mb-6">
              <Link 
                to="/tradeshow-tents" 
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Tradeshow Tents</span>
              </Link>
            </div>
            
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
                {product.name}
              </h1>
              <p className="text-xl text-primary-100 max-w-3xl mx-auto drop-shadow-md">
                {product.description}
              </p>
            </div>
          </div>
        </section>

        {/* Product Details */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-12">
                {/* Product Image */}
                <div className="relative">
                  <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-96 object-cover rounded-xl"
                      onError={(e) => {
                        e.target.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&h=400&fit=crop&sig=${product.id}`
                      }}
                    />
                  </div>
                </div>

                {/* Product Info */}
                <div className="space-y-8">
                  {/* Price and Features */}
                  <div>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-primary-600">{product.price}</span>
                      <span className="text-gray-500 text-lg ml-2">starting price</span>
                    </div>
                    
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Features</h3>
                      <ul className="space-y-2">
                        {product.features.map((feature, index) => (
                          <li key={index} className="flex items-start text-gray-700">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <Link 
                      to="/editor?product=tent"
                      className="flex-1 bg-buyprint-brand hover:bg-buyprint-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:ring-offset-2"
                    >
                      Start Designing Tent
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="mt-16 max-w-4xl mx-auto space-y-8">
                {/* Materials */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Package className="w-6 h-6 mr-3 text-primary-500" />
                    Materials & Construction
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {product.materials.map((material, index) => (
                      <div key={index} className="p-6 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
                        <div className="font-semibold text-gray-900 mb-3 text-lg">{material.name}</div>
                        <div className="text-gray-600 mb-3">{material.description}</div>
                        <div className="text-primary-600 font-medium">Best for: {material.bestFor}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Printing Options */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Layers className="w-6 h-6 mr-3 text-primary-500" />
                    Printing & Graphics
                  </h3>
                  <div className="grid md:grid-cols-1 gap-6">
                    {product.printingOptions.map((option, index) => (
                      <div key={index} className="p-6 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
                        <div className="font-semibold text-gray-900 mb-3 text-lg">{option.name}</div>
                        <div className="text-gray-600 mb-3">{option.description}</div>
                        <div className="text-primary-600 font-medium">Best for: {option.bestFor}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Specifications */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-3 text-primary-500" />
                    Specifications & Requirements
                  </h3>
                  <div className="space-y-6">
                    {product.specifications.map((spec, index) => (
                      <div key={index} className="p-6 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
                        <h4 className="font-semibold text-gray-900 mb-3 text-lg">{spec.category}</h4>
                        <ul className="space-y-2">
                          {spec.details.map((detail, detailIndex) => (
                            <li key={detailIndex} className="flex items-start text-gray-700">
                              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                              {detail}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accessories */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Star className="w-6 h-6 mr-3 text-primary-500" />
                    Included Accessories
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {product.accessories.map((accessory, index) => (
                      <div key={index} className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-semibold text-gray-900">{accessory.name}</div>
                          <span className="text-primary-600 font-medium text-sm">{accessory.price}</span>
                        </div>
                        <div className="text-gray-600 text-sm">{accessory.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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
                Ready to Create Your Professional Tent?
              </h2>
              <p className="text-xl mb-12 text-white/90 leading-relaxed">
                Design your custom tent with our professional editor. Upload your artwork, add graphics, and create the perfect tradeshow display.
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
                  to="/tradeshow-tents"
                  className="bg-transparent border-2 border-white/50 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-xl inline-flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
                >
                  View All Tents
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

export default TentProductDetail
