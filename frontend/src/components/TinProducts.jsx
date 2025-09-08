import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Filter, Search, Star, Truck, Award, Clock, Sparkles, ArrowLeft } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const TinProducts = () => {
  const [selectedFinish, setSelectedFinish] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const finishes = [
    { id: 'all', name: 'All Products', count: 6 },
    { id: 'silver', name: 'Silver', count: 6 },
    { id: 'black', name: 'Black', count: 0 },
    { id: 'gold', name: 'Gold', count: 0 }
  ]

  const tinProducts = [
    {
      id: 'tin-100-front-back-silver',
      finish: 'silver',
      name: "Business Card Tin - 100 Units (Front + Back)",
      price: "$399.99",
      description: "Premium silver aluminum business card tins with custom vinyl stickers - perfect for professional networking. Includes 100 units with front and back surface coverage.",
      image: "/assets/images/Tins_BC_v2_new phone number.png",
      features: ["100 units", "Front + Back coverage", "Premium vinyl stickers", "Silver finish"],
      bestseller: true,
      specs: {
        material: "Premium Silver Aluminum",
        finish: "Silver",
        quantity: "100 units",
        surfaceCoverage: "Front + Back",
        durability: "Lifetime",
        applications: ["Networking", "Business cards", "Promotional items"]
      },
      vinylTypes: [
        "Premium Vinyl Stickers - High-quality vinyl stickers for tin application",
        "Premium Clear Vinyl Stickers - Clear vinyl stickers for transparent effect"
      ]
    },
    {
      id: 'tin-250-front-back-silver',
      finish: 'silver',
      name: "Business Card Tin - 250 Units (Front + Back)",
      price: "$749.99",
      description: "Premium silver aluminum business card tins with custom vinyl stickers - perfect for professional networking. Includes 250 units with front and back surface coverage.",
      image: "/assets/images/Tins_BC_v2_new phone number.png",
      features: ["250 units", "Front + Back coverage", "Premium vinyl stickers", "Silver finish"],
      popular: true,
      specs: {
        material: "Premium Silver Aluminum",
        finish: "Silver",
        quantity: "250 units",
        surfaceCoverage: "Front + Back",
        durability: "Lifetime",
        applications: ["Networking", "Business cards", "Promotional items"]
      },
      vinylTypes: [
        "Premium Vinyl Stickers - High-quality vinyl stickers for tin application",
        "Premium Clear Vinyl Stickers - Clear vinyl stickers for transparent effect"
      ]
    },
    {
      id: 'tin-500-front-back-silver',
      finish: 'silver',
      name: "Business Card Tin - 500 Units (Front + Back)",
      price: "$1000.00",
      description: "Premium silver aluminum business card tins with custom vinyl stickers - perfect for professional networking. Includes 500 units with front and back surface coverage.",
      image: "/assets/images/Tins_BC_v2_new phone number.png",
      features: ["500 units", "Front + Back coverage", "Premium vinyl stickers", "Silver finish"],
      premium: true,
      specs: {
        material: "Premium Silver Aluminum",
        finish: "Silver",
        quantity: "500 units",
        surfaceCoverage: "Front + Back",
        durability: "Lifetime",
        applications: ["Networking", "Business cards", "Promotional items"]
      },
      vinylTypes: [
        "Premium Vinyl Stickers - High-quality vinyl stickers for tin application",
        "Premium Clear Vinyl Stickers - Clear vinyl stickers for transparent effect"
      ]
    },
    {
      id: 'tin-100-all-sides-silver',
      finish: 'silver',
      name: "Business Card Tin - 100 Units (All Sides)",
      price: "$499.99",
      description: "Premium silver aluminum business card tins with custom vinyl stickers - perfect for professional networking. Includes 100 units with complete surface coverage (front, back, inside, lid).",
      image: "/assets/images/Tins_BC_v2_new phone number.png",
      features: ["100 units", "All Sides coverage", "Premium vinyl stickers", "Silver finish"],
      bestseller: true,
      specs: {
        material: "Premium Silver Aluminum",
        finish: "Silver",
        quantity: "100 units",
        surfaceCoverage: "All Sides",
        durability: "Lifetime",
        applications: ["Networking", "Business cards", "Promotional items"]
      },
      vinylTypes: [
        "Premium Vinyl Stickers - High-quality vinyl stickers for tin application",
        "Premium Clear Vinyl Stickers - Clear vinyl stickers for transparent effect"
      ]
    },
    {
      id: 'tin-250-all-sides-silver',
      finish: 'silver',
      name: "Business Card Tin - 250 Units (All Sides)",
      price: "$849.99",
      description: "Premium silver aluminum business card tins with custom vinyl stickers - perfect for professional networking. Includes 250 units with complete surface coverage (front, back, inside, lid).",
      image: "/assets/images/Tins_BC_v2_new phone number.png",
      features: ["250 units", "All Sides coverage", "Premium vinyl stickers", "Silver finish"],
      popular: true,
      specs: {
        material: "Premium Silver Aluminum",
        finish: "Silver",
        quantity: "250 units",
        surfaceCoverage: "All Sides",
        durability: "Lifetime",
        applications: ["Networking", "Business cards", "Promotional items"]
      },
      vinylTypes: [
        "Premium Vinyl Stickers - High-quality vinyl stickers for tin application",
        "Premium Clear Vinyl Stickers - Clear vinyl stickers for transparent effect"
      ]
    },
    {
      id: 'tin-500-all-sides-silver',
      finish: 'silver',
      name: "Business Card Tin - 500 Units (All Sides)",
      price: "$1100.00",
      description: "Premium silver aluminum business card tins with custom vinyl stickers - perfect for professional networking. Includes 500 units with complete surface coverage (front, back, inside, lid).",
      image: "/assets/images/Tins_BC_v2_new phone number.png",
      features: ["500 units", "All Sides coverage", "Premium vinyl stickers", "Silver finish"],
      premium: true,
      specs: {
        material: "Premium Silver Aluminum",
        finish: "Silver",
        quantity: "500 units",
        surfaceCoverage: "All Sides",
        durability: "Lifetime",
        applications: ["Networking", "Business cards", "Promotional items"]
      },
      vinylTypes: [
        "Premium Vinyl Stickers - High-quality vinyl stickers for tin application",
        "Premium Clear Vinyl Stickers - Clear vinyl stickers for transparent effect"
      ]
    }
  ]

  // Filter products based on finish and search
  const filteredProducts = tinProducts.filter(product => {
    const matchesFinish = selectedFinish === 'all' || product.finish === selectedFinish
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesFinish && matchesSearch
  })

  return (
    <>
      <SEOHead {...seoConfigs.products} />
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
              Business Card Tins
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto drop-shadow-md">
              Premium aluminum business card tins with custom vinyl stickers - choose from 100, 250, or 500 units with front+back or all-sides coverage for professional networking
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Premium Quality</span>
              </div>
              <p className="text-primary-100">High-grade aluminum construction</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Flexible Options</span>
              </div>
              <p className="text-primary-100">100-500 units, front+back or all-sides</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Fast Delivery</span>
              </div>
              <p className="text-primary-100">5-7 business days production</p>
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
                  placeholder="Search tin products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-inner"
                />
              </div>
              
              {/* Finish Filters */}
              <div className="flex flex-wrap gap-2">
                {finishes.map((finish) => (
                  <button
                    key={finish.id}
                    onClick={() => setSelectedFinish(finish.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedFinish === finish.id
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                        : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {finish.name} ({finish.count})
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
              Showing {filteredProducts.length} of {tinProducts.length} tin products
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:bg-white/80 h-full flex flex-col transform hover:scale-105 active:scale-95">
                  {/* Product Image */}
                  <div className="relative h-80">
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
                      {product.popular && (
                        <div className="bg-orange-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Popular
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
                    
                    {/* Vinyl Types */}
                    <div className="mb-6 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Available Vinyl Types</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        {product.vinylTypes.slice(0, 2).map((vinyl, index) => (
                          <div key={index}>• {vinyl}</div>
                        ))}
                        <div className="text-primary-600 font-medium">+ 2 more types</div>
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
                        to="/editor?product=tin"
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

      {/* Vinyl Types Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Professional Vinyl Sticker Options
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Choose from our premium vinyl sticker types to create the perfect finish for your business card tins
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                name: "Premium Vinyl Stickers",
                description: "High-quality vinyl stickers for tin application with professional finish",
                features: ["High-quality vinyl", "Professional finish", "Durable application"]
              },
              {
                name: "Premium Clear Vinyl Stickers", 
                description: "Clear vinyl stickers for transparent effect that lets the tin show through",
                features: ["Transparent effect", "Unique design", "Modern appearance"]
              }
            ].map((vinyl, index) => (
              <div key={index} className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6 text-center hover:shadow-2xl hover:scale-105 transition-all duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{vinyl.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{vinyl.description}</p>
                <div className="space-y-1">
                  {vinyl.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="text-xs text-primary-600 flex items-center justify-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {feature}
                    </div>
                  ))}
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
              Ready to Create Your Perfect Business Card Tins?
            </h2>
            <p className="text-xl mb-12 text-white/90 leading-relaxed">
              Choose from 100, 250, or 500 units with front+back or all-sides coverage. Start designing with our professional tools and make a lasting impression at your next networking event
            </p>
            <div className="flex flex-col sm:flex-row gap-8 justify-center">
              <Link 
                to="/editor?product=tin" 
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

export default TinProducts
