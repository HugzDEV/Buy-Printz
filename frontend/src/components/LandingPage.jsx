import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Star, Truck, Shield, Palette, Zap, Award, Users, Sparkles } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'
import Footer from './Footer'

const LandingPage = () => {
  const features = [
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: "Professional Design Tools",
      description: "Advanced canvas editor with text, shapes, and color manipulation"
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Lightning Fast Delivery",
      description: "Order by 12pm → 2 business days. Order by 4pm → 3 business days including shipping"
    },
    {
      icon: <Award className="w-7 h-7" />,
      title: "Quality Guarantee",
      description: "Premium materials with 100% satisfaction guarantee"
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Expert Support",
      description: "Dedicated customer service and professional design assistance"
    }
  ]

  // Showcase our four main services
  const featuredProducts = [
    {
      name: "Vinyl Banners",
      price: "From $1.60/sqft",
      description: "Professional outdoor and indoor banners with weather resistance and vibrant colors",
      image: "/assets/images/13oz Vinyl Banner.jpg",
      hoverImage: "/assets/images/banner_assets/banner_image_2.jpg", // Different banner angle
      badge: "Best Seller",
      category: "banner",
      link: "/banner-products"
    },
    {
      name: "Business Card Tins",
      price: "From $399.99",
      description: "Premium aluminum tins with custom vinyl stickers - perfect for memorable networking (100 unit minimum)",
      image: "/assets/images/Tins_BC_v2_new%20phone%20number.png",
      hoverImage: "/assets/images/Tins_BC_v2_new%20phone%20number.png", // You can add a different tin image here
      badge: "New",
      category: "tin",
      link: "/business-cards"
    },
    {
      name: "Tradeshow Tents",
      price: "From $325.00",
      description: "Professional tradeshow tents with custom graphics for maximum event impact (canopy-only option available)",
      image: "/assets/images/Tent_images/Tent_Tradeshow.jpg",
      hoverImage: "/assets/images/Tent_images/tent_mockup_2.jpg", // Different tent angle
      badge: "New",
      category: "tent",
      link: "/tradeshow-tents"
    },
    {
      name: "Custom Stickers",
      price: "From $0.25",
      description: "Professional vinyl stickers in 8 shapes with Roland premium materials. Die-cut, kiss-cut, and custom gang sheets available.",
      image: "/assets/images/sticker_samples/stickers_standard_shapes.jpg",
      hoverImage: "/assets/images/sticker_samples/gang_sheet_sample.jpg", // Gang sheet on hover
      badge: "New",
      category: "sticker",
      link: "/stickers"
    }
  ]

  // Business structured data for homepage
  const businessStructuredData = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": "https://buyprintz.com",
    "name": "BuyPrintz",
    "description": "Professional banner printing with lightning-fast 2-3 business day delivery. Custom vinyl banners, trade show displays, and outdoor signage with advanced design tools.",
    "url": "https://buyprintz.com",
    "telephone": "+1-617-505-0603",
    "email": "order@buyprintz.com",
    "logo": "https://buyprintz.com/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png",
    "image": "https://buyprintz.com/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png",
    "priceRange": "$1.60-$7.00 per sqft",
    "paymentAccepted": "Credit Card, Debit Card",
    "currenciesAccepted": "USD",
    "areaServed": "United States",
    "serviceType": "Banner Printing Service",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Banner Printing Services",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service",
            "name": "13oz Vinyl Banner Printing",
            "description": "Weather resistant vinyl banners perfect for outdoor use. Priced per square foot."
          },
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "1.60",
            "priceCurrency": "USD",
            "unitText": "square foot"
          },
          "availability": "InStock"
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Service",
            "name": "Mesh Banner Printing",
            "description": "Wind resistant mesh banners with 70% air flow. Priced per square foot."
          },
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "1.80",
            "priceCurrency": "USD",
            "unitText": "square foot"
          },
          "availability": "InStock"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "18oz Blockout Banner Printing",
            "description": "Premium double-sided blockout banners. Priced per square foot."
          },
          "priceSpecification": {
            "@type": "UnitPriceSpecification",
            "price": "2.50",
            "priceCurrency": "USD",
            "unitText": "square foot"
          },
          "availability": "InStock"
        },
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Service", 
            "name": "Business Card Tins",
            "description": "Custom aluminum business card tins with mints"
          },
          "price": "399.00",
          "priceCurrency": "USD",
          "availability": "InStock"
        }
      ]
    },
    "makesOffer": {
      "@type": "Offer",
      "description": "Fast banner printing with 2-3 business day delivery",
      "deliveryLeadTime": "P2D",
      "availableDeliveryMethod": "OnSitePickup"
    }
  }

  return (
    <>
      <SEOHead {...seoConfigs.home} structuredData={businessStructuredData} />
      <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900">
      {/* Hero Section */}
      <section className="text-white py-10 md:py-14 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 leading-tight">
            Professional Business Branding Solutions
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-7 md:mb-8 text-primary-100 max-w-4xl mx-auto px-2">
            Create custom banners, business card tins, and tradeshow tents with professional design tools
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-5 lg:gap-6 justify-center items-center max-w-3xl mx-auto">
            <Link 
              to="/editor" 
              onClick={() => {
                sessionStorage.setItem('newDesign', 'true')
                sessionStorage.setItem('fromLandingPage', 'true')
              }}
              className="neumorphic-button-hero bg-buyprint-700 text-white hover:bg-buyprint-800 text-base sm:text-lg md:text-lg lg:text-xl px-8 py-4 sm:px-9 sm:py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 inline-flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto whitespace-nowrap"
            >
              Start Designing
              <ArrowRight className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </Link>
            <Link 
              to="/all-products"
              className="neumorphic-button-hero-secondary bg-transparent border-2 border-buyprint-brand text-buyprint-brand hover:bg-buyprint-brand hover:text-white text-base sm:text-lg md:text-lg lg:text-xl px-8 py-4 sm:px-9 sm:py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 rounded-2xl font-bold transition-all duration-300 inline-flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 w-full sm:w-auto whitespace-nowrap"
            >
              View Products
              <Star className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-8 md:mb-10 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight">
              Our Business Branding Solutions
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed px-2 sm:px-4">
              Professional banners, premium business card tins, tradeshow tents, and custom stickers - everything you need for complete business branding
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto justify-items-center">
            {featuredProducts.map((product, index) => (
              <div key={index} className="backdrop-blur-md bg-white/20 border border-white/30 shadow-xl rounded-3xl group hover:bg-white/30 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col min-h-[400px] w-full max-w-[500px]">
                <div className="relative overflow-hidden rounded-t-3xl">
                  {/* Primary Image */}
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className={`w-full h-48 sm:h-56 md:h-64 lg:h-80 object-cover group-hover:opacity-0 transition-all duration-500 ${
                      product.category === 'tin' ? 'object-contain bg-gray-100' : ''
                    }`}
                    onError={(e) => {
                      e.target.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&sig=${index}`
                    }}
                  />
                  {/* Hover Image */}
                  <img 
                    src={product.hoverImage} 
                    alt={`${product.name} - Hover view`}
                    className={`absolute top-0 left-0 w-full h-48 sm:h-56 md:h-64 lg:h-80 object-cover opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500 ${
                      product.category === 'tin' ? 'object-contain bg-gray-100' : ''
                    }`}
                    onError={(e) => {
                      e.target.src = product.image // Fallback to primary image
                    }}
                  />
                  <div className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-3 md:right-3 flex flex-col gap-1 sm:gap-1.5 md:gap-2">
                    <div className="backdrop-blur-md bg-white/95 border border-white/50 text-buyprint-brand px-2 py-1 sm:px-2.5 sm:py-1 md:px-3 md:py-1.5 text-xs sm:text-xs md:text-sm font-bold rounded-full shadow-lg whitespace-nowrap">
                      {product.price}
                    </div>
                    <div className={`backdrop-blur-md border text-white px-2 py-0.5 sm:px-2.5 sm:py-0.5 md:px-3 md:py-1 text-xs font-semibold rounded-full shadow-lg ${
                      product.badge === 'Best Seller' ? 'bg-buyprint-600/90 border-buyprint-500/50' :
                      product.badge === 'New' ? 'bg-green-500/90 border-green-400/50' :
                      product.badge === 'Coming Soon' ? 'bg-purple-500/90 border-purple-400/50' :
                      product.badge === 'Popular' ? 'bg-orange-500/90 border-orange-400/50' : 'bg-purple-500/90 border-purple-400/50'
                    }`}>
                      {product.badge}
                    </div>
                  </div>
                </div>
                
                <div className="p-4 sm:p-5 md:p-5 lg:p-6 flex-grow flex flex-col">
                  <h3 className="text-lg sm:text-xl md:text-xl font-bold text-white mb-2 sm:mb-2.5 md:mb-3 leading-tight">
                    {product.name}
                  </h3>
                  
                  <div className="text-2xl sm:text-2xl md:text-3xl font-bold text-buyprint-brand mb-3 sm:mb-3 md:mb-4">
                    {product.price}
                  </div>
                  
                  <p className="text-white/80 mb-4 sm:mb-5 md:mb-6 leading-relaxed text-sm sm:text-base flex-grow">
                    {product.description}
                  </p>
                  
                  <Link 
                    to={product.link} 
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border border-green-500 hover:border-green-600 w-full text-center py-2.5 sm:py-2.5 md:py-3 px-4 sm:px-5 md:px-6 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-2xl text-sm sm:text-sm md:text-base shadow-lg mt-auto"
                  >
                    {product.category === 'banner' ? 'View Banner Products' :
                     product.category === 'tin' ? 'View Tin Products' :
                     product.category === 'tent' ? 'View Tent Products' :
                     product.category === 'sticker' ? 'View Sticker Products' :
                     'View Products'}
                    <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="text-center mb-8 md:mb-10 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 md:mb-5 lg:mb-6 leading-tight">
              Why Choose BuyPrintz?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-white/90 max-w-4xl mx-auto leading-relaxed px-2 sm:px-4">
              Professional-grade design tools combined with premium printing materials and lightning-fast delivery
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6 lg:gap-8 max-w-7xl mx-auto justify-items-center">
            {features.map((feature, index) => (
              <div key={index} className="backdrop-blur-md bg-white/20 border border-white/30 shadow-xl text-center p-4 sm:p-5 md:p-6 lg:p-8 rounded-3xl group hover:bg-white/30 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col min-h-[220px] sm:min-h-[240px] md:min-h-[250px] lg:min-h-[280px] w-full max-w-[350px]">
                <div className="w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14 lg:w-16 lg:h-16 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-3.5 md:mb-4 lg:mb-6 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-base sm:text-lg md:text-lg lg:text-xl font-bold text-white mb-2 sm:mb-2.5 md:mb-3 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-white/80 leading-relaxed text-sm sm:text-sm md:text-base flex-grow">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Promise Section */}
      <section className="py-8 md:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-xl rounded-3xl p-6 sm:p-7 md:p-8 lg:p-12 text-center">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-tight">
                ⚡ Lightning Fast Delivery Promise
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 justify-items-center max-w-4xl mx-auto">
                <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 w-full max-w-[400px]">
                  <div className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-3 md:mb-4">🚀</div>
                  <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-2 md:mb-3">Super Rush</h3>
                  <p className="text-white/90 text-sm sm:text-base md:text-base lg:text-lg mb-1 sm:mb-1.5 md:mb-2">Order by <span className="font-bold text-buyprint-brand">12:00 PM</span></p>
                  <p className="text-white font-bold text-base sm:text-lg md:text-lg lg:text-xl">2 business days</p>
                  <p className="text-white/80 text-xs sm:text-sm md:text-sm mt-1">(Mon-Fri delivery)</p>
                </div>
                <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-5 md:p-6 lg:p-8 w-full max-w-[400px]">
                  <div className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl mb-3 sm:mb-3 md:mb-4">📦</div>
                  <h3 className="text-lg sm:text-xl md:text-xl lg:text-2xl font-bold text-white mb-2 sm:mb-2 md:mb-3">Standard Rush</h3>
                  <p className="text-white/90 text-sm sm:text-base md:text-base lg:text-lg mb-1 sm:mb-1.5 md:mb-2">Order by <span className="font-bold text-buyprint-brand">4:00 PM</span></p>
                  <p className="text-white font-bold text-base sm:text-lg md:text-lg lg:text-xl">3 business days</p>
                  <p className="text-white/80 text-xs sm:text-sm md:text-sm mt-1">(Printed, shipped & delivered)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 lg:py-24 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-tight">
              Ready to Create Your Perfect Branding?
            </h2>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-7 md:mb-8 lg:mb-12 text-white/90 leading-relaxed px-2 sm:px-4">
              Start designing with our professional tools and get your order in minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 md:gap-6 lg:gap-8 justify-center items-center max-w-3xl mx-auto">
              <Link 
                to="/editor" 
                onClick={() => {
                  sessionStorage.setItem('newDesign', 'true')
                  sessionStorage.setItem('fromLandingPage', 'true')
                }}
                className="neumorphic-button-hero bg-buyprint-700 text-white hover:bg-buyprint-800 text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl px-8 py-4 sm:px-9 sm:py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 xl:px-14 xl:py-7 inline-flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 rounded-3xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto hover:scale-105 whitespace-nowrap"
              >
                Start Designing Now
                <ArrowRight className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
              </Link>
              <Link 
                to="/all-products" 
                className="neumorphic-button-hero-secondary bg-transparent border-2 border-buyprint-brand text-buyprint-brand hover:bg-buyprint-brand hover:text-white text-base sm:text-lg md:text-xl lg:text-xl xl:text-2xl px-8 py-4 sm:px-9 sm:py-4 md:px-10 md:py-5 lg:px-12 lg:py-6 xl:px-14 xl:py-7 rounded-3xl font-bold transition-all duration-300 inline-flex items-center justify-center gap-2 sm:gap-2.5 md:gap-3 lg:gap-4 w-full sm:w-auto hover:scale-105 whitespace-nowrap"
              >
                Browse Products
                <Palette className="w-5 h-5 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      </div>
      
      <Footer />
    </>
  )
}

export default LandingPage
