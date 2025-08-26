import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Filter, Search, Star, Truck, Award, Clock } from 'lucide-react'

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const categories = [
    { id: 'all', name: 'All Products', count: 9 },
    { id: 'vinyl', name: 'Vinyl Banners', count: 4 },
    { id: 'fabric', name: 'Fabric Banners', count: 3 },
    { id: 'specialty', name: 'Specialty', count: 2 }
  ]

  const allProducts = [
    {
      id: 'vinyl-13oz',
      category: 'vinyl',
      name: "13oz Vinyl Banner",
      price: "From $25",
      description: "Our most popular banner - perfect for outdoor use with weather resistance and vibrant colors",
      image: "/assets/images/13oz Vinyl Banner.jpg",
      features: ["Weather resistant", "Full color printing", "Grommets included", "UV resistant"],
      bestseller: true,
      specs: {
        material: "13oz Scrim Vinyl",
        finish: "Matte",
        durability: "3-5 years outdoor",
        applications: ["Trade shows", "Retail displays", "Outdoor advertising"]
      }
    },
    {
      id: 'vinyl-18oz',
      category: 'vinyl',
      name: "18oz Blocked Banner", 
      price: "From $35",
      description: "18 oz matte blockout banner - Full color UV printed, indoor and outdoor ready",
      image: "/assets/images/blockout Banner -BuyPrintz.jpg",
      features: ["Single or double sided printing", "Free hemming and grommets", "Additional finishing available", "Welded oversized banners available"],
      premium: true,
      specs: {
        material: "18oz Matte Blockout Vinyl",
        finish: "Full color UV printed",
        durability: "Indoor and outdoor ready",
        applications: ["Double sided front and back", "Permanent signage", "Highway advertising", "Construction sites"]
      }
    },
    {
      id: 'mesh-banner',
      category: 'vinyl',
      name: "Mesh Banner",
      price: "From $30",
      description: "Best seller for windy conditions with 70% air flow for reduced wind load",
      image: "/assets/images/Mesh Banner - BuyPrintz.jpg",
      features: ["Wind resistant", "70% air flow", "Fade resistant", "Lightweight"],
      popular: true,
      specs: {
        material: "Mesh Vinyl",
        finish: "Perforated",
        durability: "3-4 years outdoor",
        applications: ["Fence wraps", "Building wraps", "Windy locations"]
      }
    },
    {
      id: 'indoor-banner',
      category: 'vinyl',
      name: "Indoor Banner", 
      price: "From $20",
      description: "Full and smooth surface vinyl - great for indoor displays and presentations",
      image: "/images/indoor-banner.jpg",
      features: ["Smooth surface", "Vivid colors", "Easy to install", "Lightweight"],
      specs: {
        material: "Smooth Vinyl",
        finish: "Gloss/Matte",
        durability: "Indoor use",
        applications: ["Trade shows", "Retail displays", "Event signage"]
      }
    },
    {
      id: 'pole-banner',
      category: 'specialty',
      name: "Pole Banner",
      price: "From $45", 
      description: "Durable fit banners ready to install with complete hardware kit included",
      image: "/images/pole-banner.jpg",
      features: ["Hardware included", "Easy installation", "Professional look", "Weather resistant"],
      specs: {
        material: "18oz Vinyl",
        finish: "Pole pockets & hardware",
        durability: "5+ years outdoor",
        applications: ["Street poles", "Event venues", "City displays"]
      }
    },
    {
      id: 'step-fabric',
      category: 'fabric',
      name: "Step Fabric Banner",
      price: "From $40",
      description: "Wrinkle resistant and washable dye sublimation print for premium presentations",
      image: "/images/step-fabric-banner.jpg",
      features: ["Wrinkle resistant", "Washable", "Premium fabric", "Vibrant colors"],
      specs: {
        material: "Polyester Fabric",
        finish: "Dye sublimation",
        durability: "Indoor/light outdoor",
        applications: ["Trade shows", "Retail displays", "Corporate events"]
      }
    },
    {
      id: 'backlight-fabric',
      category: 'fabric',
      name: "Backlight Fabric Banner",
      price: "From $50",
      description: "Wrinkle resistant, washable, and blocks back lighting for illuminated displays", 
      image: "/images/backlight-fabric-banner.jpg",
      features: ["Backlight ready", "Washable", "Color blocking", "Premium fabric"],
      specs: {
        material: "Blockout Fabric",
        finish: "Dye sublimation",
        durability: "Indoor use",
        applications: ["Light boxes", "Illuminated displays", "Photography backdrops"]
      }
    },
    {
      id: 'tension-fabric',
      category: 'fabric',
      name: "Tension Fabric",
      price: "From $60",
      description: "3-way stretch material perfect for kiosks, displays, and modern installations",
      image: "/images/tension-fabric.jpg",
      features: ["3-way stretch", "Kiosk ready", "Professional display", "Seamless fit"],
      premium: true,
      specs: {
        material: "Stretch Polyester",
        finish: "Dye sublimation",
        durability: "Indoor use",
        applications: ["Trade show displays", "Kiosks", "Modern installations"]
      }
    },
    {
      id: 'backlit-banner',
      category: 'specialty',
      name: "Backlit Banner", 
      price: "From $45",
      description: "18oz translucent vinyl for illuminated signage with even light distribution",
      image: "/images/backlit-banner.jpg", 
      features: ["Translucent material", "LED compatible", "Even light distribution", "Durable"],
      specs: {
        material: "Translucent Vinyl",
        finish: "Backlit compatible",
        durability: "3-5 years",
        applications: ["Light boxes", "LED displays", "Illuminated signage"]
      }
    }
  ]

  // Filter products based on category and search
  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
    const matchesSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Professional Banner Products
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto">
              Premium quality banners and signage solutions for every application - from outdoor advertising to trade show displays
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">Premium Quality</span>
              </div>
              <p className="text-primary-100">Professional-grade materials</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">Fast Turnaround</span>
              </div>
              <p className="text-primary-100">3-5 business days production</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Truck className="w-6 h-6 mr-2" />
                <span className="text-2xl font-bold">Free Shipping</span>
              </div>
              <p className="text-primary-100">On orders over $100</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-6 flex justify-between items-center">
            <p className="text-gray-600">
              Showing {filteredProducts.length} of {allProducts.length} products
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group">
                {/* Product Image */}
                <div className="relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&sig=${product.id}`
                    }}
                  />
                  
                  {/* Badges */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <div className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {product.price}
                    </div>
                    {product.bestseller && (
                      <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Best Seller
                      </div>
                    )}
                    {product.premium && (
                      <div className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Premium
                      </div>
                    )}
                    {product.popular && (
                      <div className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        Popular
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">
                    {product.description}
                  </p>
                  
                  {/* Key Features */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {product.features.slice(0, 3).map((feature, featureIndex) => (
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
                  
                  {/* Quick Specs */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-800 mb-2">Specifications</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div><strong>Material:</strong> {product.specs.material}</div>
                      <div><strong>Durability:</strong> {product.specs.durability}</div>
                    </div>
                  </div>
                  
                  <Link 
                    to="/editor" 
                    onClick={() => sessionStorage.setItem('newDesign', 'true')}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-center flex items-center justify-center gap-2"
                  >
                    Design This Product
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need Help Choosing the Right Product?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Our experts are here to help you find the perfect banner solution for your needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/editor" 
              onClick={() => sessionStorage.setItem('newDesign', 'true')}
              className="btn-primary bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4 inline-flex items-center gap-2"
            >
              Start Designing
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#contact" 
              className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4"
            >
              Contact Expert
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Products
