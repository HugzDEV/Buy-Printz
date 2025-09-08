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

  // Showcase our three main services
  const featuredProducts = [
    {
      name: "Vinyl Banners",
      price: "From $25",
      description: "Professional outdoor and indoor banners with weather resistance and vibrant colors",
      image: "/assets/images/13oz Vinyl Banner.jpg",
      features: ["Weather resistant", "Full color printing", "Grommets included"],
      badge: "Best Seller",
      category: "banner",
      link: "/products"
    },
    {
      name: "Business Card Tins",
      price: "From $399.99",
      description: "Premium aluminum tins with custom vinyl stickers - perfect for memorable networking",
      image: "/assets/images/13oz Vinyl Banner.jpg", // Placeholder - will need tin image
      features: ["Premium aluminum", "Custom vinyl stickers", "100-500 units"],
      badge: "New",
      category: "tin",
      link: "/tin-products"
    },
    {
      name: "Tradeshow Tents",
      price: "From $299.99",
      description: "Professional tradeshow tents with custom graphics for maximum event impact",
      image: "/assets/images/tent_complete-buyprintz.jpg",
      features: ["10x10 & 10x20 sizes", "Custom graphics", "Complete package"],
      badge: "New",
      category: "tent",
      link: "/tent-products"
    }
  ]

  return (
    <>
      <SEOHead {...seoConfigs.home} />
      <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900">
      {/* Hero Section */}
      <section className="text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Professional Business Branding Solutions
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Create custom banners, business card tins, and tradeshow tents with professional design tools
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link 
              to="/editor" 
              onClick={() => {
                sessionStorage.setItem('newDesign', 'true')
                sessionStorage.setItem('fromLandingPage', 'true')
              }}
              className="neumorphic-button-hero bg-buyprint-brand text-white hover:bg-buyprint-600 text-xl px-12 py-6 inline-flex items-center justify-center gap-3 rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[240px]"
            >
              Start Designing
              <ArrowRight className="w-6 h-6" />
            </Link>
            <Link 
              to="/all-products"
              className="neumorphic-button-hero-secondary bg-transparent border-2 border-buyprint-brand text-buyprint-brand hover:bg-buyprint-brand hover:text-white text-xl px-12 py-6 rounded-2xl font-bold transition-all duration-300 inline-flex items-center justify-center gap-3 min-w-[240px]"
            >
              View Products
              <Star className="w-6 h-6" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Why Choose BuyPrintz?
            </h2>
            <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Professional-grade design tools combined with premium printing materials and lightning-fast delivery
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <div key={index} className="backdrop-blur-md bg-white/20 border border-white/30 shadow-xl text-center p-8 rounded-3xl group hover:bg-white/30 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col min-h-[280px]">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:bg-white/30 transition-all duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                  {feature.title}
                </h3>
                <p className="text-white/80 leading-relaxed text-base flex-grow">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Promise Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-xl rounded-3xl p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
                ⚡ Lightning Fast Delivery Promise
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Super Rush</h3>
                  <p className="text-white/90 text-lg mb-2">Order by <span className="font-bold text-buyprint-brand">12:00 PM</span></p>
                  <p className="text-white font-bold text-xl">2 business days</p>
                  <p className="text-white/80 text-sm mt-1">(Mon-Fri delivery)</p>
                </div>
                <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl p-8">
                  <div className="text-6xl mb-4">📦</div>
                  <h3 className="text-2xl font-bold text-white mb-3">Standard Rush</h3>
                  <p className="text-white/90 text-lg mb-2">Order by <span className="font-bold text-buyprint-brand">4:00 PM</span></p>
                  <p className="text-white font-bold text-xl">3 business days</p>
                  <p className="text-white/80 text-sm mt-1">(Printed, shipped & delivered)</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="products" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Business Branding Solutions
            </h2>
            <p className="text-xl text-white/90 max-w-4xl mx-auto leading-relaxed">
              Professional banners, premium business card tins, and tradeshow tents - everything you need for complete business branding
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {featuredProducts.map((product, index) => (
              <div key={index} className="backdrop-blur-md bg-white/20 border border-white/30 shadow-xl rounded-3xl group hover:bg-white/30 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col min-h-[600px]">
                <div className="relative overflow-hidden rounded-t-3xl">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&sig=${index}`
                    }}
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <div className="backdrop-blur-md bg-white/95 border border-white/50 text-buyprint-brand px-3 py-1.5 text-sm font-bold rounded-full shadow-lg">
                      {product.price}
                    </div>
                    <div className={`backdrop-blur-md border text-white px-3 py-1 text-xs font-semibold rounded-full shadow-lg ${
                      product.badge === 'Best Seller' ? 'bg-buyprint-600/90 border-buyprint-500/50' :
                      product.badge === 'New' ? 'bg-green-500/90 border-green-400/50' :
                      product.badge === 'Coming Soon' ? 'bg-purple-500/90 border-purple-400/50' :
                      product.badge === 'Popular' ? 'bg-orange-500/90 border-orange-400/50' : 'bg-purple-500/90 border-purple-400/50'
                    }`}>
                      {product.badge}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-3 leading-tight">
                    {product.name}
                  </h3>
                  <p className="text-white/80 mb-4 leading-relaxed text-base">
                    {product.description}
                  </p>
                  
                  {/* Features */}
                  <div className="mb-6 flex-grow">
                    <div className="flex flex-wrap gap-2">
                      {product.features.map((feature, featureIndex) => (
                        <span 
                          key={featureIndex}
                          className="backdrop-blur-sm bg-white/20 border border-white/30 inline-flex items-center text-white text-xs px-3 py-1.5 rounded-full"
                        >
                          <CheckCircle className="w-3 h-3 mr-1 text-buyprint-brand" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Link 
                    to={product.link} 
                    className="bg-buyprint-brand hover:bg-buyprint-600 border border-buyprint-brand hover:border-buyprint-600 w-full text-center py-3 px-6 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-2xl text-base shadow-lg mt-auto"
                  >
                    View Products
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>


        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 text-white relative overflow-hidden">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-6xl font-bold mb-8">
              Ready to Create Your Perfect Branding?
            </h2>
            <p className="text-2xl mb-12 text-white/90 leading-relaxed">
              Start designing with our professional tools and get your order in minutes
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link 
                to="/editor" 
                onClick={() => {
                  sessionStorage.setItem('newDesign', 'true')
                  sessionStorage.setItem('fromLandingPage', 'true')
                }}
                className="neumorphic-button-hero bg-buyprint-brand text-white hover:bg-buyprint-600 text-2xl px-14 py-7 inline-flex items-center justify-center gap-4 rounded-3xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 min-w-[280px] hover:scale-105"
              >
                Start Designing Now
                <ArrowRight className="w-7 h-7" />
              </Link>
              <Link 
                to="/all-products" 
                className="neumorphic-button-hero-secondary bg-transparent border-2 border-buyprint-brand text-buyprint-brand hover:bg-buyprint-brand hover:text-white text-2xl px-14 py-7 rounded-3xl font-bold transition-all duration-300 inline-flex items-center justify-center gap-4 min-w-[280px] hover:scale-105"
              >
                Browse Products
                <Palette className="w-7 h-7" />
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
