import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Star, Truck, Shield, Palette } from 'lucide-react'

const LandingPage = () => {
  const features = [
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Professional Design Tools",
      description: "Advanced canvas editor with text, shapes, and color manipulation"
    },
    {
      icon: <Truck className="w-6 h-6" />,
      title: "Fast Production",
      description: "High-quality printing and quick turnaround times"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Quality Guarantee",
      description: "Premium materials and professional finishing"
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: "Expert Support",
      description: "Dedicated customer service and design assistance"
    }
  ]

  // Showcase only the 3 most common banners
  const featuredProducts = [
    {
      name: "13oz Vinyl Banner",
      price: "From $25",
      description: "Our most popular banner - perfect for outdoor use with weather resistance",
      image: "/images/13oz-vinyl-banner.jpg",
      features: ["Weather resistant", "Full color printing", "Grommets included"],
      badge: "Best Seller"
    },
    {
      name: "Mesh Banner",
      price: "From $30",
      description: "Best seller for windy conditions with 70% air flow",
      image: "/images/mesh-banner.jpg",
      features: ["Wind resistant", "70% air flow", "Fade resistant"],
      badge: "Popular"
    },
    {
      name: "18oz Blocked Banner", 
      price: "From $35",
      description: "Our most durable banner - built to last with maximum durability",
      image: "/images/18oz-blocked-banner.jpg",
      features: ["Maximum durability", "Block-out backing", "Professional finish"],
      badge: "Premium"
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Professional Banner Printing for Business
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-primary-100">
            Create custom vinyl banners, trade show displays, and outdoor signage with professional design tools
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/editor" 
              onClick={() => sessionStorage.setItem('newDesign', 'true')}
              className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Create Banner
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              to="/products"
              className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4"
            >
              View Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Professional-grade design tools combined with high-quality printing and fast delivery
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Most Popular Banners
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our top 3 banner types - covering 90% of customer needs
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredProducts.map((product, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden">
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      e.target.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&sig=${index}`
                    }}
                  />
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {product.price}
                    </div>
                    <div className={`text-white px-3 py-1 rounded-full text-xs font-semibold ${
                      product.badge === 'Best Seller' ? 'bg-green-500' :
                      product.badge === 'Popular' ? 'bg-orange-500' : 'bg-purple-500'
                    }`}>
                      {product.badge}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {product.description}
                  </p>
                  
                  {/* Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {product.features.map((feature, featureIndex) => (
                        <span 
                          key={featureIndex}
                          className="inline-flex items-center bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <Link 
                    to="/editor" 
                    onClick={() => sessionStorage.setItem('newDesign', 'true')}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-center block"
                  >
                    Design Now
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* View All Products CTA */}
          <div className="text-center">
            <div className="bg-white rounded-xl p-8 shadow-md">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Need Something Different?
              </h3>
              <p className="text-gray-600 mb-6">
                Explore our complete catalog of 9+ banner types including fabric, backlit, and specialty options
              </p>
              <Link 
                to="/products" 
                className="inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                View All Products
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Ready to Create Your Perfect Sign?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Start designing with our professional tools and get your order in minutes
          </p>
          <Link 
            to="/editor" 
            onClick={() => sessionStorage.setItem('newDesign', 'true')}
            className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4 inline-flex items-center gap-2"
          >
            Start Designing Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
