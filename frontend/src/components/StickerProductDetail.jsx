import React from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowRight, CheckCircle, Star, Truck, Award, Clock, ArrowLeft, Package, Layers } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const StickerProductDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const stickerProducts = [
    {
      id: 'standard-shapes',
      name: "Standard Shape Stickers",
      price: "$0.25 - $0.50",
      description: "Professional vinyl stickers in 7 standard shapes with die-cut or kiss-cut options. Perfect for branding, events, and promotional use.",
      image: "/assets/images/sticker_samples/stickers_standard_shapes.jpg",
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
          description: "Transparent vinyl perfect for window applications and see-through designs. Maintains clarity and adhesion.",
          bestFor: "Window decals, transparent designs"
        },
        {
          name: "Roland Paper",
          description: "High-quality paper material for indoor applications. Perfect for temporary signage and indoor displays.",
          bestFor: "Indoor use, temporary applications"
        },
        {
          name: "Orajet Premium Vinyl",
          description: "Premium cast vinyl with exceptional durability and color retention. Professional-grade material for demanding applications.",
          bestFor: "Professional applications, high-end projects"
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
          description: "Cut through the vinyl but not the backing paper, making application easier with pre-cut stickers on a sheet.",
          bestFor: "Multiple stickers, easy application"
        }
      ],
      sizes: [
        "1\" - Perfect for small logos and details",
        "2\" - Ideal for product labels and small branding",
        "3\" - Great for medium-sized logos and designs",
        "4\" - Perfect for promotional stickers and branding",
        "5\" - Large format for eye-catching displays",
        "6\" - Maximum size for maximum impact"
      ]
    },
    {
      id: 'custom-gang-sheet',
      name: "Custom Gang Sheet Stickers",
      price: "$15.00 - $25.00",
      description: "Large 20\" x 20\" gang sheets for custom die-cutting. Perfect for unique shapes, large quantities, and complex designs.",
      image: "/assets/images/sticker_samples/sticker_die-cut.jpg",
      features: [
        "20\" x 20\" gang sheet with 17\" x 17\" printable area",
        "Custom die-cutting for any shape",
        "Perfect for large quantity orders",
        "1.5\" margins on all sides for safe printing",
        "Ideal for unique designs and complex shapes"
      ],
      materials: [
        {
          name: "Roland Premium Vinyl",
          description: "Professional-grade vinyl with 3-5 year outdoor durability. Weather-resistant, UV resistant, and waterproof.",
          bestFor: "Outdoor applications, long-term use"
        },
        {
          name: "Roland Clear Vinyl",
          description: "Transparent vinyl perfect for window applications and see-through designs. Maintains clarity and adhesion.",
          bestFor: "Window decals, transparent designs"
        },
        {
          name: "Roland Paper",
          description: "High-quality paper material for indoor applications. Perfect for temporary signage and indoor displays.",
          bestFor: "Indoor use, temporary applications"
        },
        {
          name: "Orajet Premium Vinyl",
          description: "Premium cast vinyl with exceptional durability and color retention. Professional-grade material for demanding applications.",
          bestFor: "Professional applications, high-end projects"
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

  const product = stickerProducts.find(p => p.id === id)

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link to="/stickers" className="text-primary-600 hover:text-primary-700">
            Back to Sticker Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <SEOHead 
        title={`${product.name} - Custom Stickers | BuyPrintz`}
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
          "sku": `STICKER-${product.id.toUpperCase()}`,
          "offers": {
            "@type": "AggregateOffer",
            "lowPrice": product.price.match(/\$([0-9.]+)/)[1],
            "highPrice": product.price.match(/- \$([0-9.]+)/)[1],
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "priceValidUntil": "2026-12-31",
            "offerCount": "50",
            "url": `https://www.buyprintz.com/sticker-product/${product.id}`
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.8",
            "reviewCount": "156",
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
                "name": "Sarah Martinez"
              },
              "reviewBody": "Amazing quality stickers! The die-cut precision is perfect and the colors are vibrant. Used them for our product packaging and they look professional.",
              "datePublished": "2025-10-15"
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
                "name": "Michael Chen"
              },
              "reviewBody": "Fast turnaround and excellent quality. The Roland vinyl is weather-resistant and has held up perfectly outdoors for months. Highly recommend!",
              "datePublished": "2025-09-22"
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
                to="/stickers" 
                className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors duration-200 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium">Back to Sticker Products</span>
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
                        e.target.src = `https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&sig=${product.id}`
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
                    {product.id === 'standard-shapes' ? (
                      <div className="flex-1 relative">
                         <select 
                           onChange={(e) => {
                             if (e.target.value) {
                               navigate(`/editor?product=sticker&shape=${e.target.value}`)
                             }
                           }}
                          className="w-full bg-buyprint-brand hover:bg-buyprint-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 appearance-none cursor-pointer text-center pr-10 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:ring-offset-2"
                        >
                          <option value="">Choose Shape & Start Designing</option>
                          <option value="circle">Circle Stickers</option>
                          <option value="square">Square Stickers</option>
                          <option value="rectangle">Rectangle Stickers</option>
                          <option value="oval">Oval Stickers</option>
                          <option value="triangle">Triangle Stickers</option>
                          <option value="diamond">Diamond Stickers</option>
                          <option value="star">Star Stickers</option>
                        </select>
                        <ArrowRight className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 pointer-events-none" />
                      </div>
                    ) : (
                      <Link 
                        to="/editor?product=sticker&shape=custom"
                        className="flex-1 bg-buyprint-brand hover:bg-buyprint-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 text-center flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:ring-offset-2"
                      >
                        Start Designing Gang Sheet
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="mt-16 max-w-4xl mx-auto space-y-8">
                {/* Material Options */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Package className="w-6 h-6 mr-3 text-primary-500" />
                    Material Options
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

                {/* Cutting Options */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Layers className="w-6 h-6 mr-3 text-primary-500" />
                    Cutting Options
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {product.cuttingOptions.map((option, index) => (
                      <div key={index} className="p-6 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50">
                        <div className="font-semibold text-gray-900 mb-3 text-lg">{option.name}</div>
                        <div className="text-gray-600 mb-3">{option.description}</div>
                        <div className="text-primary-600 font-medium">Best for: {option.bestFor}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Size Options */}
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                    <Award className="w-6 h-6 mr-3 text-primary-500" />
                    Size Options
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {product.sizes.map((size, index) => (
                      <div key={index} className="p-4 bg-gray-50/80 backdrop-blur-sm rounded-lg border border-gray-200/50 text-center">
                        <div className="font-medium text-gray-900">{size}</div>
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
                Ready to Create Your Perfect Stickers?
              </h2>
              <p className="text-xl mb-12 text-white/90 leading-relaxed">
                Choose from professional shapes, Roland premium materials, and our custom editor. Upload your files or design from scratch with our creator marketplace assets.
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
                  to="/stickers"
                  className="bg-transparent border-2 border-white/50 text-white hover:bg-white/10 text-lg px-8 py-4 rounded-xl inline-flex items-center gap-2 transition-all duration-200 backdrop-blur-sm"
                >
                  View All Stickers
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

export default StickerProductDetail
