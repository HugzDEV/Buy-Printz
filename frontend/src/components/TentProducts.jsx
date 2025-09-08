import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Filter, Search, Star, Truck, Award, Clock, Sparkles, Package, Layers } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const TentProducts = () => {
  const [selectedSize, setSelectedSize] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const sizes = [
    { id: 'all', name: 'All Sizes', count: 2 },
    { id: '10x10', name: '10x10', count: 1 },
    { id: '10x20', name: '10x20', count: 1 }
  ]

  const tentProducts = [
    {
      id: 'tent-10x10',
      size: '10x10',
      name: "10x10 Event Tent",
      price: "From $299",
      description: "Professional 10x10 event tent with heavy duty aluminum hex frame and custom dye sublimated graphics",
      image: "/assets/images/tent_complete-buyprintz.jpg",
      features: ["Heavy duty aluminum hex frame", "6oz weatherproof fabric", "Dye sublimated graphics", "Carry bag included"],
      bestseller: true,
      specs: {
        material: "6oz Tent Fabric (600x600 denier)",
        frame: "40mm Aluminum Hex Hardware",
        print: "Dye-Sublimation Graphic",
        durability: "Weather resistant (waterproof coated fabric)",
        weight: "51 lbs (Full Package)",
        dimensions: "120\"w x 120\"d x 124.5\"-137\"h"
      },
      accessories: [
        "Carrying Bag w/ Wheels",
        "Sandbags (Sand not included)",
        "Reinforced Strip",
        "Full Wall",
        "Half Wall"
      ]
    },
    {
      id: 'tent-10x20',
      size: '10x20',
      name: "10x20 Event Tent",
      price: "From $499",
      description: "Large 10x20 event tent perfect for major trade shows and outdoor events with maximum branding impact",
      image: "/assets/images/full_10x20_tent-buyprintz.jpg",
      features: ["Heavy duty aluminum hex frame", "6oz weatherproof fabric", "Dye sublimated graphics", "Carry bag included"],
      premium: true,
      specs: {
        material: "6oz Tent Fabric (600x600 denier)",
        frame: "40mm Aluminum Hex Hardware",
        print: "Dye-Sublimation Graphic",
        durability: "Weather resistant (waterproof coated fabric)",
        weight: "85 lbs (Full Package)",
        dimensions: "240\"w x 120\"d x 124.5\"-137\"h"
      },
      accessories: [
        "Carrying Bag w/ Wheels",
        "Sandbags (Sand not included)",
        "Reinforced Strip",
        "Full Wall",
        "Half Wall"
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
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
              Tradeshow Tents
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto drop-shadow-md">
              Professional tradeshow tents with custom graphics - achieve 360 degrees of branding with heavy duty aluminum frames
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
                <span className="text-2xl font-bold text-white">Complete Package</span>
              </div>
              <p className="text-primary-100">Tent, graphics, and hardware included</p>
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
              
              {/* Size Filters */}
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
                  <div className="relative h-64">
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
                    
                    {/* Specifications */}
                    <div className="mb-6 p-3 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-200/50">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Specifications</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div><strong>Material:</strong> {product.specs.material}</div>
                        <div><strong>Weight:</strong> {product.specs.weight}</div>
                        <div><strong>Dimensions:</strong> {product.specs.dimensions}</div>
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
