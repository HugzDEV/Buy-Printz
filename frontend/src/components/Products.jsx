import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Filter, Search, Star, Truck, Award, Clock, ArrowLeft } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'
import { ProductCard3D } from './ui'

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
      title: "13oz Vinyl Banner",
      price: "From $25",
      description: "Our most popular banner - perfect for outdoor use with weather resistance and vibrant colors",
      image: "/assets/images/13oz Vinyl Banner.jpg",
      features: ["Weather resistant", "Full color printing", "Grommets included", "UV resistant"],
      link: "/product/vinyl-13oz",
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
      title: "18oz Blocked Banner", 
      price: "From $35",
      description: "18 oz matte blockout banner - Full color UV printed, indoor and outdoor ready",
      image: "/assets/images/blockout Banner -BuyPrintz.jpg",
      features: ["Single or double sided printing", "Free hemming and grommets", "Additional finishing available", "Welded oversized banners available"],
      link: "/product/vinyl-18oz",
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
      title: "Mesh Banner",
      price: "From $30",
      description: "Best seller for windy conditions with 70% air flow for reduced wind load",
      image: "/assets/images/Mesh Banner - BuyPrintz.jpg",
      features: ["Wind resistant", "70% air flow", "Fade resistant", "Lightweight"],
      link: "/product/mesh-banner",
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
      title: "Indoor Banner", 
      price: "From $20",
      description: "Full and smooth surface vinyl - great for indoor displays and presentations",
      image: "/assets/images/Indoor Banner - BuyPrintz.jpg",
      features: ["Smooth surface", "Vivid colors", "Easy to install", "Lightweight"],
      link: "/product/indoor-banner",
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
      title: "Pole Banner",
      price: "From $45", 
      description: "Durable fit banners ready to install with complete hardware kit included",
      image: "/assets/images/Pole Banner - BuyPrintz.jpg",
      features: ["Hardware included", "Easy installation", "Professional look", "Weather resistant"],
      link: "/product/pole-banner",
      specs: {
        material: "18oz Vinyl",
        finish: "Pole pockets & hardware",
        durability: "5+ years outdoor",
        applications: ["Street poles", "Event venues", "City displays"]
      }
    },
    {
      id: 'fabric-9oz',
      category: 'fabric',
      title: "9oz Fabric Banner",
      price: "From $35",
      description: "Lightweight fabric banner with vibrant dye sublimation printing for premium presentations",
      image: "/assets/images/9oz Fabric Banner - BuyPrintz.jpg",
      features: ["Lightweight fabric", "Vibrant colors", "Wrinkle resistant", "Professional finish"],
      link: "/product/fabric-9oz",
      specs: {
        material: "9oz Polyester Fabric",
        finish: "Dye sublimation",
        durability: "Indoor/light outdoor",
        applications: ["Trade shows", "Retail displays", "Corporate events"]
      }
    },
    {
      id: 'fabric-blockout',
      category: 'fabric',
      title: "Fabric Banner (9.5oz Blockout)",
      price: "From $45",
      description: "Premium blockout fabric with superior color blocking and professional finish",
      image: "/assets/images/Fabric Banner (9.5oz. Blockout) - BuyPrintz.jpg",
      features: ["Color blocking", "Premium fabric", "Professional finish", "Wrinkle resistant"],
      link: "/product/fabric-blockout",
      premium: true,
      specs: {
        material: "9.5oz Blockout Fabric",
        finish: "Dye sublimation",
        durability: "Indoor/light outdoor",
        applications: ["Trade shows", "Retail displays", "Corporate events"]
      }
    },
    {
      id: 'tension-fabric',
      category: 'fabric',
      title: "Tension Fabric",
      price: "From $60",
      description: "3-way stretch material perfect for kiosks, displays, and modern installations",
      image: "/assets/images/Tension Fabric - Buy Printz.jpg",
      features: ["3-way stretch", "Kiosk ready", "Professional display", "Seamless fit"],
      link: "/product/tension-fabric",
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
      title: "Backlit Banner", 
      price: "From $45",
      description: "18oz translucent vinyl for illuminated signage with even light distribution",
      image: "/assets/images/Backlit Banner -BuyPrintz.jpg", 
      features: ["Translucent material", "LED compatible", "Even light distribution", "Durable"],
      link: "/product/backlit-banner",
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
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
    
    return matchesCategory && matchesSearch
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
              Professional Banner Products
            </h1>
            <p className="text-xl text-primary-100 max-w-3xl mx-auto drop-shadow-md">
              Premium quality banners and signage solutions for every application - from outdoor advertising to trade show displays
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
              <p className="text-primary-100">Professional-grade materials</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Fast Turnaround</span>
              </div>
              <p className="text-primary-100">3-5 business days production</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Truck className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Free Shipping</span>
              </div>
              <p className="text-primary-100">On orders over $100</p>
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
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-inner"
                />
              </div>
              
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                        : 'bg-white/80 backdrop-blur-sm border border-gray-200/50 text-gray-700 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {category.name} ({category.count})
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
              Showing {filteredProducts.length} of {allProducts.length} products
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="parent">
                <ProductCard3D
                  title={product.title}
                  price={product.price}
                  description={product.description}
                  image={product.image}
                  features={product.features}
                  link={product.link}
                />
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-8 max-w-md mx-auto">
                <div className="text-gray-400 mb-4">
                  <Filter className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 to-primary-800/90 backdrop-blur-sm">
          <div className="absolute inset-0 opacity-30 bg-gradient-to-br from-white/10 to-transparent"></div>
        </div>
        
        <div className="relative container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-white drop-shadow-lg">
            Need Help Choosing the Right Product?
          </h2>
          <p className="text-xl mb-8 text-primary-100 drop-shadow-md">
            Our experts are here to help you find the perfect banner solution for your needs
          </p>
          <div className="flex flex-col sm:flex-row gap-8 justify-center">
            <Link 
              to="/editor?product=banner" 
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
      </section>
      </div>
    </>
  )
}

export default Products
