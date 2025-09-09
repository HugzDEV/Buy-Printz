import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Package, Crown, Layers } from 'lucide-react'
import SEOHead from './SEOHead'
import { ProductCard3D } from './ui'

const AllProducts = () => {
  const featuredProducts = [
    {
      title: "Vinyl Banners",
      price: "From $25",
      description: "Professional outdoor and indoor banners with weather resistance and vibrant colors",
      image: "/assets/images/13oz Vinyl Banner.jpg",
      link: "/banner-products",
      features: ["Weather resistant", "Vibrant colors", "Professional quality", "Fast delivery"]
    },
    {
      title: "Business Card Tins",
      price: "From $399.99",
      description: "Premium metal tins with custom vinyl graphics - perfect for business cards, promotional items, and premium packaging",
      image: "/assets/images/Tins_BC_v2_new phone number.png",
      link: "/tin-products",
      features: ["Premium aluminum", "Custom vinyl graphics", "Professional finish", "Memorable branding"]
    },
    {
      title: "Tradeshow Tents",
      price: "From $299.99",
      description: "Professional event tents with 360-degree branding coverage and heavy-duty aluminum frames",
      image: "/assets/images/tent_complete-buyprintz.jpg",
      link: "/tent-products",
      features: ["Heavy duty frame", "360° branding", "Weather resistant", "Complete package"]
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
                <div key={index} className="parent">
                  <ProductCard3D
                    title={product.title}
                    price={product.price}
                    description={product.description}
                    image={product.image}
                    features={product.features}
                    link={product.link}
                    color={index === 0 ? "yellow" : index === 1 ? "emerald" : "red"}
                  />
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
                className="bg-gradient-to-r from-buyprint-brand to-buyprint-600 hover:from-buyprint-600 hover:to-buyprint-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl flex items-center justify-center gap-2"
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
