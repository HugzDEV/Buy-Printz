import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, Star, Truck, Award, Clock, Sparkles, ArrowLeft, Crown, Package, Layers } from 'lucide-react'
import SEOHead, { seoConfigs } from './SEOHead'

const TinProducts = () => {
  const tinFinishes = [
    {
      id: 'silver',
      name: "Silver",
      price: "$399.99",
      priceValue: 399.99,
      priceNote: "100 unit minimum",
      description: "Premium silver aluminum business card tins with custom vinyl stickers - perfect for professional networking (100 unit minimum)",
      image: "/assets/images/silvertin-buyprintz.jpg",
      features: ["Premium silver aluminum", "Custom vinyl stickers", "Professional finish", "100 unit minimum"],
      bestseller: true,
      icon: <Package className="w-8 h-8" />,
      sku: "BCT-SILVER-100",
      gtin: "0085001234005",
      mpn: "BCTSIL100"
    },
    {
      id: 'black',
      name: "Black",
      price: "$425.00",
      priceValue: 425.00,
      priceNote: "100 unit minimum",
      description: "Sleek black aluminum business card tins with custom vinyl stickers - modern and sophisticated (100 unit minimum)",
      image: "/assets/images/black%20tins-buyprintz.jpg",
      features: ["Premium black aluminum", "Custom vinyl stickers", "Modern finish", "100 unit minimum"],
      popular: true,
      icon: <Layers className="w-8 h-8" />,
      sku: "BCT-BLACK-100",
      gtin: "0085001234012",
      mpn: "BCTBLK100"
    },
    {
      id: 'gold',
      name: "Gold",
      price: "$450.00",
      priceValue: 450.00,
      priceNote: "100 unit minimum",
      description: "Luxurious gold aluminum business card tins with custom vinyl stickers - premium and elegant (100 unit minimum)",
      image: "/assets/images/gold%20tins-buyprintz.jpg",
      features: ["Premium gold aluminum", "Custom vinyl stickers", "Luxury finish", "100 unit minimum"],
      premium: true,
      icon: <Crown className="w-8 h-8" />,
      sku: "BCT-GOLD-100",
      gtin: "0085001234029",
      mpn: "BCTGLD100"
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

  // Breadcrumb Schema (no @context here - defined in parent @graph)
  const breadcrumbSchema = {
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
        "name": "Products",
        "item": "https://www.buyprintz.com/all-products"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Business Card Tins",
        "item": "https://www.buyprintz.com/business-card-tins"
      }
    ]
  }

  // Product Collection Schema - ItemList with Products (no @context here - defined in parent @graph)
  const productListSchema = {
    "@type": "ItemList",
    "name": "Business Card Tins - Custom Aluminum Tins with Mints",
    "description": "Premium aluminum business card tins with custom vinyl stickers and fresh mints. Perfect for professional networking and memorable first impressions. 100 unit minimum orders.",
    "url": "https://www.buyprintz.com/business-card-tins",
    "numberOfItems": tinFinishes.length,
      "itemListElement": tinFinishes.map((tin, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "@id": `https://www.buyprintz.com/business-card-tins#${tin.id}`,
          "name": `${tin.name} Business Card Tin`,
          "description": tin.description,
          "image": [
            tin.image ? encodeURI(`https://www.buyprintz.com${tin.image}`) : "https://www.buyprintz.com/assets/images/Tins_BC_v2_new%20phone%20number.png",
            "https://www.buyprintz.com/assets/images/Tins_BC_v2_new%20phone%20number.png"
          ],
          "sku": tin.sku,
          "gtin": tin.gtin,
          "mpn": tin.mpn,
          "brand": {
            "@type": "Brand",
            "name": "BuyPrintz",
            "logo": "https://www.buyprintz.com/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png"
          },
          "manufacturer": {
            "@type": "Organization",
            "name": "BuyPrintz",
            "url": "https://www.buyprintz.com"
          },
          "category": "Business Supplies > Business Cards & Card Accessories",
          "material": "Aluminum",
          "color": tin.name,
          "offers": {
            "@type": "Offer",
            "url": `https://www.buyprintz.com/business-card-tins#${tin.id}`,
            "price": tin.priceValue,
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock",
            "priceValidUntil": "2026-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "seller": {
              "@type": "Organization",
              "@id": "https://www.buyprintz.com",
              "name": "BuyPrintz"
            },
            "hasMerchantReturnPolicy": {
              "@type": "MerchantReturnPolicy",
              "applicableCountry": "US",
              "returnPolicyCategory": "https://schema.org/MerchantReturnNotPermitted",
              "returnMethod": "https://schema.org/ReturnByMail"
            },
            "shippingDetails": {
              "@type": "OfferShippingDetails",
              "shippingRate": {
                "@type": "MonetaryAmount",
                "value": "0",
                "currency": "USD"
              },
              "shippingDestination": {
                "@type": "DefinedRegion",
                "addressCountry": "US"
              },
              "deliveryTime": {
                "@type": "ShippingDeliveryTime",
                "handlingTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 5,
                  "maxValue": 7,
                  "unitCode": "DAY"
                },
                "transitTime": {
                  "@type": "QuantitativeValue",
                  "minValue": 2,
                  "maxValue": 3,
                  "unitCode": "DAY"
                }
              }
            }
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "reviewCount": "127",
            "bestRating": "5",
            "worstRating": "1"
          },
          "review": [
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Sarah Johnson"
              },
              "datePublished": "2025-09-15",
              "reviewBody": "These business card tins are absolutely amazing! Everyone I hand them to is impressed and they actually keep them. Best networking investment I've made.",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              }
            },
            {
              "@type": "Review",
              "author": {
                "@type": "Person",
                "name": "Michael Chen"
              },
              "datePublished": "2025-09-20",
              "reviewBody": "Quality is top-notch and the vinyl printing looks professional. The 100 unit minimum was perfect for our startup. Fast delivery too!",
              "reviewRating": {
                "@type": "Rating",
                "ratingValue": "5",
                "bestRating": "5"
              }
            }
          ],
          "additionalProperty": [
            ...tin.features.map(feature => ({
              "@type": "PropertyValue",
              "name": "Feature",
              "value": feature
            })),
            {
              "@type": "PropertyValue",
              "name": "Customization",
              "value": "4 surfaces (front, back, inside, lid)"
            },
            {
              "@type": "PropertyValue",
              "name": "Included",
              "value": "Fresh mints"
            },
            {
              "@type": "PropertyValue",
              "name": "Production Time",
              "value": "5-7 business days"
            }
          ]
        }
      }))
  }

  // FAQ Schema removed to avoid duplication with global FAQPage in index.html

  // How-To Schema for designing business card tins (no @context here - defined in parent @graph)
  const howToSchema = {
    "@type": "HowTo",
    "name": "How to Order Custom Business Card Tins",
    "description": "Step-by-step guide to ordering custom business card tins from BuyPrintz",
    "totalTime": "PT10M",
    "step": [
      {
        "@type": "HowToStep",
        "position": 1,
        "name": "Choose Your Finish",
        "text": "Select from Silver, Black, or Gold aluminum finishes based on your brand aesthetic and budget.",
        "url": "https://www.buyprintz.com/business-card-tins"
      },
      {
        "@type": "HowToStep",
        "position": 2,
        "name": "Select Quantity",
        "text": "Choose 100, 250, or 500 units based on your business needs. 100 unit minimum required.",
        "url": "https://www.buyprintz.com/business-card-tins"
      },
      {
        "@type": "HowToStep",
        "position": 3,
        "name": "Design Your Tin",
        "text": "Use our canvas editor to customize all four surfaces (front, back, inside, lid) with your branding, contact info, and QR code.",
        "url": "https://www.buyprintz.com/editor?product=tin"
      },
      {
        "@type": "HowToStep",
        "position": 4,
        "name": "Review and Order",
        "text": "Preview your design, get instant pricing and shipping quotes, then complete your order securely.",
        "url": "https://www.buyprintz.com/editor?product=tin"
      },
      {
        "@type": "HowToStep",
        "position": 5,
        "name": "Receive Your Tins",
        "text": "Your custom tins will be produced in 5-7 business days and shipped with professional packaging.",
        "url": "https://www.buyprintz.com/business-card-tins"
      }
    ]
  }

  // Combine all schemas
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbSchema,
      productListSchema,
      howToSchema
    ]
  }

  return (
    <>
      <SEOHead {...seoConfigs.products} structuredData={combinedSchema} />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        {/* Header Section with Integrated Product Image */}
        <section className="relative py-16 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800"></div>
          <div className="absolute inset-0 bg-black/20"></div>
          
          <div className="relative container mx-auto px-4">
            <Link 
              to="/all-products" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors duration-200 mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to All Products
            </Link>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Text Content */}
              <div className="text-center lg:text-left">
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
                  Business Card Tins
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-8 drop-shadow-md">
                  Premium aluminum tins with custom vinyl stickers - perfect for memorable networking and professional branding
                </p>
                <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-6">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Clock className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold">5-7 Day Production</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Award className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold">Eco-Friendly</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Package className="w-5 h-5 text-white" />
                    <span className="text-white font-semibold">100 Unit Min</span>
                  </div>
                </div>
                <div className="flex justify-center lg:justify-start">
                  <Link
                    to="/editor?product=tin"
                    className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition-colors duration-200 shadow-lg inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    Design Now
                  </Link>
                </div>
              </div>
              
              {/* Product Image */}
              <div className="flex justify-center lg:justify-end">
                <img
                  src="/assets/images/Tins_BC_v2_new phone number.png"
                  alt="Custom Business Card Tins with Mints - Professional Networking Solution"
                  className="w-full max-w-md object-contain drop-shadow-2xl"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Tin Finishes Section */}
        <section className="py-16" id="finishes">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Choose Your Tin Finish
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                All finishes include premium aluminum construction with custom vinyl stickers. 
                <strong> 100 unit minimum order required.</strong> Select your preferred finish and start designing your professional business card tins.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
              {tinFinishes.map((finish) => (
                <article 
                  key={finish.id} 
                  id={finish.id}
                  className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl rounded-3xl group hover:bg-white/90 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 h-full flex flex-col"
                >
                  <div className="relative overflow-hidden rounded-t-3xl">
                    <img 
                      src={finish.image} 
                      alt={`${finish.name} Business Card Tin - Premium ${finish.name} Aluminum with Custom Vinyl Stickers`}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
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
                      <h3 className="text-2xl font-bold text-gray-900">
                        {finish.name} Business Card Tin
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4 flex-grow">
                      {finish.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      {finish.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <div className="text-3xl font-bold text-blue-600">
                          {finish.price}
                        </div>
                        <div className="text-sm text-gray-500 font-medium">{finish.priceNote}</div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                        <span className="text-sm text-gray-600 ml-1">(4.9)</span>
                      </div>
                    </div>
                    
                    <Link
                      to={`/editor?product=tin&finish=${finish.id}`}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-xl text-center inline-flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-5 h-5" />
                      Design {finish.name} Tin
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </div>
                  
                  {/* Microdata removed - using JSON-LD only to prevent duplicate detection */}
                </article>
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
                      <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{unit.quantity}</div>
                        <div className="text-sm text-gray-600">{unit.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-6 text-center">
                  Need larger quantities? <Link to="/contact" className="text-blue-600 hover:underline">Contact us</Link> for volume pricing.
                </p>
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
                  className="w-full inline-flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold text-xl px-8 py-6 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
                >
                  <Sparkles className="w-6 h-6" />
                  Start Designing
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
            
            {/* Related Blog Posts */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Learn More About Business Card Tins
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <Link 
                    to="/blog/eco-friendly-marketing-reusable-tins-beat-disposable-business-cards"
                    className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-green-100 p-3 rounded-lg">
                        <Award className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          Eco-Friendly Marketing Guide
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Discover how reusable tins beat disposable business cards and reduce environmental waste
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                          Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                  
                  <Link 
                    to="/blog/3-essential-marketing-tools-every-startup-needs-before-digital-ads"
                    className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-purple-100 p-3 rounded-lg">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                          Startup Marketing Essentials
                        </h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Learn why business card tins are essential for startups before spending on digital ads
                        </p>
                        <div className="flex items-center text-blue-600 text-sm font-medium">
                          Read Article <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {businessBenefits.map((benefit, index) => (
                <article key={index} className="text-center">
                  <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">
                    {benefit.description}
                  </p>
                </article>
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
                  5-7 business days production time with professional packaging and nationwide shipping
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-white/50 backdrop-blur-sm">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Everything you need to know about our business card tins
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto space-y-6">
              <details className="bg-white rounded-2xl shadow-lg p-6 group">
                <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  <span>What is the minimum order quantity for business card tins?</span>
                  <ArrowRight className="w-5 h-5 text-blue-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  All business card tin finishes require a 100 unit minimum order. We also offer 250 and 500 unit quantities for growing businesses and larger organizations.
                </p>
              </details>

              <details className="bg-white rounded-2xl shadow-lg p-6 group">
                <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  <span>What tin finishes are available?</span>
                  <ArrowRight className="w-5 h-5 text-blue-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  We offer three premium finishes: Silver ($399.99), Black ($425.00), and Gold ($450.00). All finishes include premium aluminum construction with custom vinyl stickers and fresh mints included.
                </p>
              </details>

              <details className="bg-white rounded-2xl shadow-lg p-6 group">
                <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  <span>How long does production take?</span>
                  <ArrowRight className="w-5 h-5 text-blue-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Production time is 5-7 business days, with an additional 2-3 days for shipping. Rush options may be available - contact us for expedited service.
                </p>
              </details>

              <details className="bg-white rounded-2xl shadow-lg p-6 group">
                <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  <span>Can I customize all sides of the tin?</span>
                  <ArrowRight className="w-5 h-5 text-blue-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Yes! Our canvas editor allows you to design all four surfaces: front, back, inside, and lid. Create a completely custom look that matches your brand perfectly.
                </p>
              </details>

              <details className="bg-white rounded-2xl shadow-lg p-6 group">
                <summary className="font-bold text-lg text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  <span>Are the tins eco-friendly?</span>
                  <ArrowRight className="w-5 h-5 text-blue-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Yes! Our business card tins are made from recycled aluminum materials and are fully reusable. They're an environmentally conscious alternative to disposable paper business cards.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-4 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Create Your Custom Business Card Tins?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
              Join hundreds of businesses making memorable first impressions with our premium business card tins
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/editor?product=tin"
                className="inline-flex items-center justify-center gap-3 bg-white text-blue-600 font-bold text-xl px-10 py-5 rounded-2xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
              >
                <Sparkles className="w-6 h-6" />
                Start Designing Now
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm border-2 border-white text-white font-bold text-xl px-10 py-5 rounded-2xl transition-all duration-300 hover:bg-white/20"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default TinProducts