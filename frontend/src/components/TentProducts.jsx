import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Star, Award, Clock, Truck, Sparkles } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const TentProducts = () => {
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
              Professional tradeshow tents with custom graphics - coming soon to complete your business branding solutions
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Professional Quality</span>
              </div>
              <p className="text-primary-100">Commercial-grade tent construction</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 mr-3">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">Custom Graphics</span>
              </div>
              <p className="text-primary-100">Full-color custom printing</p>
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

      {/* Coming Soon Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-12">
              <div className="mb-8">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="w-12 h-12 text-primary-600" />
                </div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                  Coming Soon
                </h2>
                <p className="text-xl text-gray-600 mb-8">
                  We're working hard to bring you professional tradeshow tent solutions. 
                  Stay tuned for our complete tent product line with custom graphics and hardware.
                </p>
              </div>
              
              {/* Tent Features Preview */}
              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Planned Features</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      10x10 and 10x20 tent sizes
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      Full-color custom graphics
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      Professional tent hardware
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      Easy setup and breakdown
                    </li>
                  </ul>
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Applications</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      Trade shows and exhibitions
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      Outdoor events and festivals
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      Farmers markets and fairs
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                      Corporate outdoor events
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link 
                  to="/products"
                  className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  View Current Products
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link 
                  to="/contact"
                  className="bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 inline-flex items-center justify-center gap-2"
                >
                  Get Notified
                  <Star className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}

export default TentProducts
