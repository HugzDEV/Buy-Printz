import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Star, Truck, Shield, Palette, Zap, Award, Users, Sparkles, Clock, Package, Target, MapPin, CheckCircle2 } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'
import Footer from './Footer'
import { ProductCard3D, FeatureCard3D, WideFeatureCard3D } from './ui'

const LandingPage = () => {
  const features = [
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: "Professional Design Tools",
      description: "Advanced canvas editor with text, shapes, and color manipulation",
      color: "blue"
    },
    {
      icon: <Award className="w-7 h-7" />,
      title: "Quality Guarantee",
      description: "Premium materials with 100% satisfaction guarantee",
      color: "purple"
    },
    {
      icon: <Users className="w-7 h-7" />,
      title: "Expert Support",
      description: "Dedicated customer service and professional design assistance",
      color: "pink"
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
      link: "/banner-products",
      color: "yellow"
    },
    {
      name: "Business Card Tins",
      price: "From $399.99",
      description: "Premium aluminum tins with custom vinyl stickers - perfect for memorable networking",
      image: "/assets/images/Tins_BC_v2_new phone number.png",
      features: ["Premium aluminum", "Custom vinyl stickers", "100-500 units"],
      badge: "New",
      category: "tin",
      link: "/tin-products",
      color: "emerald"
    },
    {
      name: "Tradeshow Tents",
      price: "From $299.99",
      description: "Professional tradeshow tents with custom graphics for maximum event impact",
      image: "/assets/images/tent_complete-buyprintz.jpg",
      features: ["10x10 & 10x20 sizes", "Custom graphics", "Complete package"],
      badge: "New",
      category: "tent",
      link: "/tent-products",
      color: "red"
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

      {/* Featured Products Section - Enhanced with 3D Interactive Cards */}
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
          
          <div className="grid md:grid-cols-3 gap-12 max-w-7xl mx-auto">
            {featuredProducts.map((product, index) => (
              <ProductCard3D
                key={index}
                title={product.name}
                description={product.description}
                price={product.price}
                image={product.image}
                features={product.features}
                link={product.link}
                color={product.color}
              />
            ))}
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
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <FeatureCard3D
                key={index}
                title={feature.title}
                description={feature.description}
                icon={feature.icon}
                color={feature.color}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Promise Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ⚡ Lightning Fast Delivery Promise
            </h2>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Choose your delivery speed based on your timeline needs
            </p>
          </div>
          
          <div className="max-w-5xl mx-auto">
            <WideFeatureCard3D
              title="⚡ Lightning Fast Delivery Promise"
              description="Choose your delivery speed based on your timeline needs"
              icons={[
                <Clock className="w-7 h-7" />,
                <Package className="w-7 h-7" />,
                <Target className="w-7 h-7" />,
                <MapPin className="w-7 h-7" />,
                <CheckCircle2 className="w-7 h-7" />
              ]}
              options={[
                "🚀 SUPER RUSH: Order by 12:00 PM → 2 business days (Mon-Fri delivery)",
                "📦 STANDARD RUSH: Order by 4:00 PM → 3 business days (Printed, shipped & delivered)",
                "🎯 FREE SHIPPING: On orders over $150",
                "📍 NATIONWIDE DELIVERY: To all 50 states",
                "✅ REAL-TIME TRACKING: Included with every order"
              ]}
              color="orange"
              className="w-full"
            />
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
