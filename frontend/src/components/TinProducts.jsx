import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Star, Truck, Award, Clock, Sparkles, ArrowLeft, Crown, Package, Layers } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const TinProducts = () => {
  const tinFinishes = [
    {
      id: 'silver',
      name: "Silver",
      price: "$399",
      description: "Premium silver aluminum business card tins with custom vinyl stickers - perfect for professional networking",
      image: "/assets/images/silvertin-buyprintz.jpg",
      features: ["Premium silver aluminum", "Custom vinyl stickers", "Professional finish"],
      bestseller: true,
      icon: <Package className="w-8 h-8" />
    },
    {
      id: 'black',
      name: "Black",
      price: "$425",
      description: "Sleek black aluminum business card tins with custom vinyl stickers - modern and sophisticated",
      image: "/assets/images/black tins-buyprintz.jpg",
      features: ["Premium black aluminum", "Custom vinyl stickers", "Modern finish"],
      popular: true,
      icon: <Layers className="w-8 h-8" />
    },
    {
      id: 'gold',
      name: "Gold",
      price: "$450",
      description: "Luxurious gold aluminum business card tins with custom vinyl stickers - premium and elegant",
      image: "/assets/images/gold tins-buyprintz.jpg",
      features: ["Premium gold aluminum", "Custom vinyl stickers", "Luxury finish"],
      premium: true,
      icon: <Crown className="w-8 h-8" />
    }
  ]

  const availableUnits = [
    { quantity: "100 units", description: "Perfect for small businesses and startups" },
    { quantity: "250 units", description: "Ideal for growing companies and events" },
    { quantity: "500 units", description: "Best value for large organizations" }
  ]

  const businessBenefits = [
    {
      title: "Stand Out in Business",
      description: "Make a lasting impression in a world where everyone does the same things. Your custom tin will be remembered long after the meeting ends.",
      icon: <Star className="w-8 h-8" />
    },
    {
      title: "Eco-Friendly & Sustainable",
      description: "Made from recycled aluminum materials, these tins are environmentally conscious and align with modern sustainability values.",
      icon: <Award className="w-8 h-8" />
    },
    {
      title: "Lasting Keepsakes",
      description: "Even after the candy and goodies are gone, these beautiful tins become cherished keepsakes that clients will use for years to come.",
      icon: <Package className="w-8 h-8" />
    }
  ]

  return (
    <>
      <SEOHead {...seoConfigs.products} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header Section */}
        <section className="relative py-16 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative container mx-auto px-4 text-center">
            <Link 
              to="/all-products" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Products
            </Link>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Business Card Tins
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto drop-shadow-md">
              Premium aluminum tins with custom vinyl stickers - perfect for memorable networking and professional branding
            </p>
          </div>
        </section>

        {/* Tin Finishes Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Choose Your Tin Finish
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                All finishes include premium aluminum construction with custom vinyl stickers. 
                Select your preferred finish and start designing your professional business card tins.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
              {tinFinishes.map((finish) => (
                <div key={finish.id} className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl rounded-3xl group hover:bg-white/90 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col">
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <img 
                      src={finish.image} 
                      alt={`${finish.name} Business Card Tin`}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-4 right-4">
                      {finish.bestseller && (
                        <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          Best Seller
                        </span>
                      )}
                      {finish.popular && (
                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          Popular
                        </span>
                      )}
                      {finish.premium && (
                        <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                          Premium
                        </span>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex items-center mb-4">
                      <div className="text-blue-600 mr-3">
                        {finish.icon}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">{finish.name}</h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4 flex-grow">{finish.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      {finish.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-3xl font-bold text-blue-600">{finish.price}</div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">(4.9)</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Units & Design Now Section */}
            <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Available Units */}
              <div className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  Available Quantities
                </h3>
                <div className="space-y-4">
                  {availableUnits.map((unit, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{unit.quantity}</div>
                        <div className="text-sm text-gray-600">{unit.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Design Now */}
              <div className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl rounded-3xl p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Ready to Design?
                </h3>
                <p className="text-lg text-gray-600 mb-8 text-center">
                  Create custom designs for all tin surfaces (front, back, inside, lid) with our professional canvas editor. 
                  Choose your quantity and finish during the design process.
                </p>
                
                <Link
                  to="/editor?product=tin"
                  className="w-full inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl px-8 py-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
                >
                  <Sparkles className="w-6 h-6" />
                  Design Now
                  <ArrowRight className="w-6 h-6" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Business Benefits Section */}
        <section className="py-16 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Why Business Card Tins Make a Difference
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Stand out in a competitive business world with memorable, sustainable, and lasting networking solutions
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {businessBenefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Features Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Premium Quality & Fast Delivery
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Professional manufacturing with quick turnaround times
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="text-center">
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Premium Quality</h3>
                <p className="text-gray-600">
                  High-grade aluminum construction with professional vinyl sticker application for lasting durability
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Custom Design</h3>
                <p className="text-gray-600">
                  Design all four surfaces (front, back, inside, lid) with our professional canvas editor
                </p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Delivery</h3>
                <p className="text-gray-600">
                  5-7 business days production time with professional packaging and shipping
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default TinProducts