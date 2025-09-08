import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Package, Crown, Layers } from 'lucide-react'
import SEOHead from './SEOHead'

const AllProducts = () => {
  const featuredProducts = [
    {
      name: "Vinyl Banners",
      price: "From $25",
      description: "Professional outdoor and indoor banners with weather resistance and vibrant colors",
      image: "/assets/images/13oz Vinyl Banner.jpg",
      link: "/products",
      badge: "Best Seller",
      badgeColor: "bg-red-500",
      icon: <Package className="w-8 h-8" />
    },
    {
      name: "Business Card Tins",
      price: "From $89",
      description: "Premium metal tins with custom vinyl graphics - perfect for business cards, promotional items, and premium packaging",
      image: "/assets/images/SKINS_DESIGN 00_FRONT OR BACK.png",
      link: "/tin-products",
      badge: "New",
      badgeColor: "bg-green-500",
      icon: <Crown className="w-8 h-8" />
    },
    {
      name: "Tradeshow Tents",
      price: "From $299",
      description: "Professional event tents with 360-degree branding coverage and heavy-duty aluminum frames",
      image: "/assets/images/tent_complete-buyprintz.jpg",
      link: "/tent-products",
      badge: "Coming Soon",
      badgeColor: "bg-purple-500",
      icon: <Layers className="w-8 h-8" />
    }
  ]

  return (
    <>
      <SEOHead 
        title="All Products - BuyPrintz"
        description="Explore our complete range of professional business branding solutions: vinyl banners, business card tins, and tradeshow tents."
        keywords="business branding, vinyl banners, business card tins, tradeshow tents, custom printing, promotional products"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Our Business Branding Solutions
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto drop-shadow-md">
              Professional banners, premium business card tins, and tradeshow tents - everything you need for complete business branding
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Choose Your Product Category
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                From outdoor banners to premium packaging and event displays, we have the perfect solution for your business branding needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {featuredProducts.map((product, index) => (
                <div key={index} className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl rounded-3xl group hover:bg-white/90 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col min-h-[600px]">
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className={`${product.badgeColor} text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg`}>
                        {product.badge}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-8 flex flex-col flex-grow">
                    <div className="flex items-center mb-4">
                      <div className="text-blue-600 mr-3">
                        {product.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                    </div>
                    
                    <div className="text-3xl font-bold text-blue-600 mb-4">
                      {product.price}
                    </div>
                    
                    <p className="text-gray-600 mb-6 flex-grow leading-relaxed">
                      {product.description}
                    </p>
                    
                    <Link
                      to={product.link}
                      className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 border border-blue-500 hover:border-blue-600 w-full text-center py-3 px-6 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-2xl text-base shadow-lg mt-auto"
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
        <section className="py-24 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Create Your Perfect Branding?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Start designing your custom banners, tins, or tents today with our professional design tools
            </p>
            <div className="flex justify-center">
              <Link
                to="/editor"
                onClick={() => sessionStorage.setItem('newDesign', 'true')}
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2"
              >
                Start Designing
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default AllProducts
