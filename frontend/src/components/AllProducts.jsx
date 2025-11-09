import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Package, Crown, Layers, Sparkles } from 'lucide-react'
import SEOHead from './SEOHead'

const AllProducts = () => {
  const featuredProducts = [
    {
      name: "Vinyl Banners",
      price: "From $2.25/sqft",
      description: "Professional outdoor and indoor banners with weather resistance and vibrant colors",
      image: "/assets/images/13oz Vinyl Banner.jpg",
      link: "/banner-products",
      badge: "Best Seller",
      badgeColor: "bg-red-500",
      icon: <Package className="w-8 h-8" />
    },
    {
      name: "Business Card Tins",
      price: "From $399.99",
      description: "Premium metal tins with custom vinyl graphics - perfect for business cards, promotional items, and premium packaging (100 unit minimum)",
      image: "/assets/images/Tins_BC_v2_new%20phone%20number.png",
      link: "/business-card-tins",
      badge: "New",
      badgeColor: "bg-green-500",
      icon: <Crown className="w-8 h-8" />
    },
    {
      name: "Tradeshow Tents",
      price: "From $325.00",
      description: "Professional event tents with canopy-only option and 360-degree branding coverage with heavy-duty aluminum frames",
      image: "/assets/images/Tent_images/Tent_Tradeshow.jpg",
      link: "/tradeshow-tents",
      badge: "New",
      badgeColor: "bg-purple-500",
      icon: <Layers className="w-8 h-8" />
    },
    {
      name: "Custom Stickers",
      price: "From $0.25",
      description: "Professional vinyl stickers in 8 shapes with Roland premium materials. Die-cut, kiss-cut, and custom gang sheets available.",
      image: "/assets/images/sticker_samples/stickers_standard_shapes.jpg",
      link: "/stickers",
      badge: "New",
      badgeColor: "bg-blue-500",
      icon: <Sparkles className="w-8 h-8" />
    }
  ]

  // Structured Data for All Products Collection Page
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.buyprintz.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "All Products",
            "item": "https://www.buyprintz.com/all-products"
          }
        ]
      },
      {
        "@type": "CollectionPage",
        "name": "BuyPrintz Product Categories",
        "description": "Complete range of professional business branding solutions including vinyl banners, business card tins, tradeshow tents, custom stickers, and Tin Skinz candy tins.",
        "url": "https://www.buyprintz.com/all-products",
        "mainEntity": {
          "@type": "ItemList",
          "numberOfItems": 5,
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "url": "https://www.buyprintz.com/banner-products",
              "name": "Vinyl Banners",
              "description": "Professional outdoor and indoor banners with weather resistance and vibrant colors"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "url": "https://www.buyprintz.com/business-card-tins",
              "name": "Business Card Tins",
              "description": "Premium metal tins with custom vinyl graphics - perfect for business cards, promotional items, and premium packaging"
            },
            {
              "@type": "ListItem",
              "position": 3,
              "url": "https://www.buyprintz.com/tradeshow-tents",
              "name": "Tradeshow Tents",
              "description": "Professional event tents with canopy-only option and 360-degree branding coverage with heavy-duty aluminum frames"
            },
            {
              "@type": "ListItem",
              "position": 4,
              "url": "https://www.buyprintz.com/stickers",
              "name": "Custom Stickers",
              "description": "Professional vinyl stickers in 8 shapes with Roland premium materials"
            },
            {
              "@type": "ListItem",
              "position": 5,
              "url": "https://www.buyprintz.com/tin-skinz",
              "name": "Tin Skinz",
              "description": "Pre-designed tins filled with candy for every occasion - weddings, birthdays, holidays, and special events"
            }
          ]
        }
      }
    ]
  }

  return (
    <>
      <SEOHead 
        title="All Products - BuyPrintz"
        description="Explore our complete range of professional business branding solutions: vinyl banners, business card tins, tradeshow tents, and Tin Skinz pre-designed candy tins."
        keywords="business branding, vinyl banners, business card tins, tradeshow tents, tin skinz, custom printing, promotional products, candy tins"
        structuredData={structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Hero Section */}
        <section className="relative py-10 md:py-16 lg:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 drop-shadow-lg">
              Our Business Branding Solutions
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-100 mb-6 sm:mb-8 max-w-4xl mx-auto drop-shadow-md px-4">
              Professional banners, premium business card tins, tradeshow tents, custom stickers, and Tin Skinz candy tins - everything you need for complete business branding
            </p>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-12 md:py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12 lg:mb-20">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
                Choose Your Product Category
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
                From outdoor banners to premium packaging, event displays, custom stickers, and pre-designed candy tins, we have the perfect solution for your business branding needs
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
              {featuredProducts.map((product, index) => (
                <div key={index} className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl rounded-3xl group hover:bg-white/90 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col min-h-[400px] sm:min-h-[450px] lg:min-h-[550px]">
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <img 
                      src={product.image} 
                      alt={product.name}
                      className="w-full h-48 sm:h-64 lg:h-80 xl:h-96 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4">
                      <span className={`${product.badgeColor} text-white px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold shadow-lg`}>
                        {product.badge}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-4 sm:p-6 lg:p-8 flex flex-col flex-grow">
                    <div className="flex items-center mb-3 sm:mb-4">
                      <div className="text-blue-600 mr-2 sm:mr-3">
                        {product.icon}
                      </div>
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{product.name}</h3>
                    </div>
                    
                    <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-3 sm:mb-4">
                      {product.price}
                    </div>
                    
                    <p className="text-gray-600 mb-4 sm:mb-6 flex-grow leading-relaxed text-sm sm:text-base">
                      {product.description}
                    </p>
                    
                    <Link
                      to={product.link}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 border border-green-500 hover:border-green-600 w-full text-center py-2.5 sm:py-3 px-4 sm:px-6 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-2xl text-sm sm:text-base shadow-lg mt-auto"
                    >
                      {product.name === 'Vinyl Banners' ? 'View Banner Products' :
                       product.name === 'Business Card Tins' ? 'View Tin Products' :
                       product.name === 'Tradeshow Tents' ? 'View Tent Products' :
                       product.name === 'Custom Stickers' ? 'View Sticker Products' :
                       'View Products'}
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tin Skinz Featured Section */}
        <section className="py-24 bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Tin Skinz
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Pre-designed tins filled with candy for every occasion. Perfect for weddings, birthdays, holidays, and special events.
              </p>
            </div>
            
            <div className="max-w-6xl mx-auto">
              <div className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl rounded-3xl group hover:bg-white/90 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative overflow-hidden">
                    <img 
                      src="/assets/tin-skinz/Tin Skinz_logo_full color_Secondary logo.png" 
                      alt="Tin Skinz"
                      className="w-full h-96 object-contain bg-gray-100 group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                        Featured
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center mb-4">
                      <div className="text-yellow-600 mr-3">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Tin Skinz</h3>
                    </div>
                    
                    <div className="text-3xl font-bold text-yellow-600 mb-4">
                      From $9.99
                    </div>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Pre-designed tins filled with candy for every occasion. Perfect for weddings, birthdays, holidays, and special events.
                    </p>
                    
                    <Link
                      to="/tin-skinz"
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 border border-yellow-500 hover:border-yellow-600 w-full text-center py-3 px-6 text-white font-bold rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105 hover:shadow-2xl text-base shadow-lg"
                    >
                      Explore Tin Skinz
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
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
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2"
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
