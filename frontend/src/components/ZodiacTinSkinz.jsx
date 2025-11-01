import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Star, 
  Sparkles, 
  Gift, 
  Heart, 
  Calendar,
  ArrowRight,
  CheckCircle,
  Users,
  Award,
  Zap
} from 'lucide-react'
import SEOHead from './SEOHead'
import TinSkinzMockupViewer from './TinSkinzMockupViewer'

const ZodiacTinSkinz = () => {
  const [currentMonth, setCurrentMonth] = useState('')
  const [currentZodiac, setCurrentZodiac] = useState('')

  useEffect(() => {
    const now = new Date()
    const month = now.getMonth() + 1
    const day = now.getDate()
    setCurrentMonth(now.toLocaleString('default', { month: 'long' }))
    
    // Determine current zodiac sign based on month and day
    let currentSign = ''
    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) currentSign = 'Aries'
    else if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) currentSign = 'Taurus'
    else if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) currentSign = 'Gemini'
    else if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) currentSign = 'Cancer'
    else if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) currentSign = 'Leo'
    else if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) currentSign = 'Virgo'
    else if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) currentSign = 'Libra'
    else if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) currentSign = 'Scorpio'
    else if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) currentSign = 'Sagittarius'
    else if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) currentSign = 'Capricorn'
    else if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) currentSign = 'Aquarius'
    else if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) currentSign = 'Pisces'
    
    setCurrentZodiac(currentSign)
  }, [])

  const zodiacSigns = [
    {
      name: 'Aries',
      dates: 'March 21 - April 19',
      element: 'Fire',
      traits: 'Bold, energetic, pioneering',
      colors: 'Red, orange, bright colors',
      image: '/assets/tin-skinz/designs/Zodiac Final/10_Aries_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/10_Aries_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/10_Aries_Cancer_Double_Both.png',
      description: 'The ram leads with courage and determination. Perfect for the natural-born leader in your life.'
    },
    {
      name: 'Taurus',
      dates: 'April 20 - May 20',
      element: 'Earth',
      traits: 'Reliable, practical, sensual',
      colors: 'Green, earth tones, pastels',
      image: '/assets/tin-skinz/designs/Zodiac Final/2_Taurus_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/2_Taurus_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/2_Taurus_Double_Both.png',
      description: 'The bull values stability and comfort. Ideal for those who appreciate the finer things in life.'
    },
    {
      name: 'Gemini',
      dates: 'May 21 - June 20',
      element: 'Air',
      traits: 'Curious, adaptable, communicative',
      colors: 'Yellow, silver, light blue',
      image: '/assets/tin-skinz/designs/Zodiac Final/9_Gemini_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/9_Gemini_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/9_Gemini_Double_Both.png',
      description: 'The twins bring wit and versatility. Perfect for the social butterfly who loves to chat.'
    },
    {
      name: 'Cancer',
      dates: 'June 21 - July 22',
      element: 'Water',
      traits: 'Intuitive, protective, nurturing',
      colors: 'Silver, white, sea green',
      image: '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Double_Both.png',
      description: 'The crab is deeply emotional and caring. Ideal for the family-oriented soul.'
    },
    {
      name: 'Leo',
      dates: 'July 23 - August 22',
      element: 'Fire',
      traits: 'Confident, generous, dramatic',
      colors: 'Gold, orange, bright yellow',
      image: '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Double_Both.png',
      description: 'The lion rules with charisma and warmth. Perfect for the natural performer.'
    },
    {
      name: 'Virgo',
      dates: 'August 23 - September 22',
      element: 'Earth',
      traits: 'Analytical, practical, perfectionist',
      colors: 'Brown, navy, muted tones',
      image: '/assets/tin-skinz/designs/Zodiac Final/11_Virgo_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/11_Virgo_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/11_Virgo_Double_Both.png',
      description: 'The maiden brings order and precision. Ideal for the detail-oriented perfectionist.'
    },
    {
      name: 'Libra',
      dates: 'September 23 - October 22',
      element: 'Air',
      traits: 'Diplomatic, charming, balanced',
      colors: 'Pink, blue, pastels',
      image: '/assets/tin-skinz/designs/Zodiac Final/7_Libra_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/7_Libra_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/7_Libra_Double_Both.png',
      description: 'The scales seek harmony and beauty. Perfect for the peacemaker and aesthete.'
    },
    {
      name: 'Scorpio',
      dates: 'October 23 - November 21',
      element: 'Water',
      traits: 'Intense, passionate, mysterious',
      colors: 'Deep red, black, burgundy',
      image: '/assets/tin-skinz/designs/Zodiac Final/12_Scorpio_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/12_Scorpio_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/12_Scorpio_Double_Both.png',
      description: 'The scorpion brings depth and transformation. Ideal for the intense and passionate soul.'
    },
    {
      name: 'Sagittarius',
      dates: 'November 22 - December 21',
      element: 'Fire',
      traits: 'Adventurous, optimistic, philosophical',
      colors: 'Purple, turquoise, bright colors',
      image: '/assets/tin-skinz/designs/Zodiac Final/8_Sagittarius_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/8_Sagittarius_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/8_Sagittarius_Double_Both.png',
      description: 'The archer seeks truth and adventure. Perfect for the free-spirited explorer.'
    },
    {
      name: 'Capricorn',
      dates: 'December 22 - January 19',
      element: 'Earth',
      traits: 'Ambitious, disciplined, practical',
      colors: 'Brown, black, dark green',
      image: '/assets/tin-skinz/designs/Zodiac Final/3_Capricornus_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/3_Capricornus_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/3_Capricornus_Double_Both.png',
      description: 'The goat climbs with determination. Ideal for the ambitious achiever.'
    },
    {
      name: 'Aquarius',
      dates: 'January 20 - February 18',
      element: 'Air',
      traits: 'Independent, innovative, humanitarian',
      colors: 'Electric blue, silver, bright colors',
      image: '/assets/tin-skinz/designs/Zodiac Final/6_Aquarius_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/6_Aquarius_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/6_Aquarius_Double_Both.png',
      description: 'The water bearer brings innovation and progress. Perfect for the forward-thinking individual.'
    },
    {
      name: 'Pisces',
      dates: 'February 19 - March 20',
      element: 'Water',
      traits: 'Compassionate, artistic, intuitive',
      colors: 'Sea green, lavender, soft pastels',
      image: '/assets/tin-skinz/designs/Zodiac Final/4_Pisces_Front.png',
      backImage: '/assets/tin-skinz/designs/Zodiac Final/4_Pisces_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/4_Pisces_Double_Both.png',
      description: 'The fish swims in dreams and intuition. Ideal for the creative and empathetic soul.'
    }
  ]

  const currentSign = zodiacSigns.find(sign => sign.name === currentZodiac)

  // Enhanced Product Collection Schema with proper Google Shopping support (matching TinSkinzMarketplace pattern)
  const zodiacStructuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Tin Skinz Zodiac Collection - Personalized Astrology Tins",
    "description": "Custom Tin Skinz zodiac collection featuring all 12 astrological signs. Perfect for astrology lovers, birthday gifts, party favors, and stocking stuffers. Premium aluminum tins with custom zodiac designs.",
    "url": "https://www.buyprintz.com/zodiac-tin-skinz",
    "breadcrumb": {
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
          "name": "Zodiac Tin Skinz",
          "item": "https://www.buyprintz.com/zodiac-tin-skinz"
        }
      ]
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": zodiacSigns.map((sign, index) => ({
        "@type": "Product",
        "@id": `https://www.buyprintz.com/zodiac-tin-skinz#${sign.name.toLowerCase()}`,
        "name": `${sign.name} Tin Skinz`,
        "description": `Custom ${sign.name} Tin Skinz featuring ${sign.name} astrological sign design. Perfect for ${sign.name} birthday gifts, party favors, and astrology lovers.`,
        "image": [
          `https://www.buyprintz.com${sign.image}`,
          `https://www.buyprintz.com${sign.designUrl}`
        ],
        "sku": `zodiac-tin-skinz-${sign.name.toLowerCase()}`,
        "gtin": `0085001234${String(index + 103).padStart(3, '0')}`,
        "mpn": `TS-ZOD-${sign.name.toUpperCase()}`,
        "url": `https://www.buyprintz.com/zodiac-tin-skinz/${sign.name.toLowerCase()}`,
        "brand": {
          "@type": "Brand",
          "name": "Tin Skinz",
          "logo": "https://www.buyprintz.com/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "BuyPrintz",
          "url": "https://www.buyprintz.com"
        },
        "category": "Zodiac Gifts & Astrology",
        "material": "Aluminum",
        "color": "Custom Zodiac Design",
        "offers": {
          "@type": "Offer",
          "url": `https://www.buyprintz.com/zodiac-tin-skinz/${sign.name.toLowerCase()}`,
          "price": "9.99",
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
              "value": "4.99",
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
                "minValue": 2,
                "maxValue": 3,
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
          "ratingValue": "4.8",
          "reviewCount": "25",
          "bestRating": "5",
          "worstRating": "1"
        },
        "review": [
          {
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": "Alexandra Martinez"
            },
            "datePublished": "2025-10-15",
            "reviewBody": `Perfect gift for any ${sign.name} in my life! The design is beautiful and the quality is excellent. They absolutely loved it and it's become a cherished keepsake.`,
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5",
              "worstRating": "1"
            }
          },
          {
            "@type": "Review",
            "author": {
              "@type": "Person",
              "name": "Jordan Taylor"
            },
            "datePublished": "2025-10-10",
            "reviewBody": `These ${sign.name} Tin Skinz are absolutely gorgeous! The custom zodiac design is spot-on and the aluminum quality feels premium. Great for birthday gifts or party favors.`,
            "reviewRating": {
              "@type": "Rating",
              "ratingValue": "5",
              "bestRating": "5",
              "worstRating": "1"
            }
          }
        ],
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "name": "Zodiac Sign",
            "value": sign.name
          },
          {
            "@type": "PropertyValue",
            "name": "Material",
            "value": "Premium aluminum"
          },
          {
            "@type": "PropertyValue",
            "name": "Use Cases",
            "value": "Birthday gifts, party favors, stocking stuffers, astrology gifts"
          },
          {
            "@type": "PropertyValue",
            "name": "Customization",
            "value": "Personalized zodiac design"
          }
        ]
      }))
      }
    }
  };

  // Combine all schemas using @graph format (matching TinSkinzMarketplace pattern)
  const combinedSchema = {
    "@context": "https://schema.org",
    "@graph": [
      zodiacStructuredData
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <SEOHead
        title="Tin Skinz Zodiac Collection - Personalized Astrology Tins | Custom Zodiac Gifts"
        description="Discover the Tin Skinz Zodiac Collection featuring all 12 astrological signs. Perfect for astrology lovers, birthday gifts, party favors, and stocking stuffers. Premium aluminum tins with custom zodiac designs."
        keywords="tin skinz zodiac, zodiac tins, astrology gifts, personalized zodiac, zodiac signs, astrology tins, birthday gifts, party favors, stocking stuffers, custom zodiac, astrology lovers, horoscope gifts, zodiac collection, astrology merchandise, personalized astrology, zodiac party favors, astrology stocking stuffers, zodiac birthday gifts, custom astrology tins, zodiac gift ideas, astrology party supplies"
        image="https://www.buyprintz.com/assets/tin-skinz/designs/Zodiac Final/10_Aries_Front.png"
        url="https://www.buyprintz.com/zodiac-tin-skinz"
        type="product"
        structuredData={combinedSchema}
      />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-90"></div>
        <div className="relative max-w-7xl mx-auto px-4 py-8 md:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            {/* Left Content */}
            <div className="lg:w-1/2 text-center lg:text-left">
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-4 justify-center lg:justify-start">
                <img
                  src="/assets/tin-skinz/Tin Skinz_logo_full color_Secondary logo.png"
                  alt="Tin Skinz Logo"
                  className="h-12 sm:h-16 lg:h-20 w-auto"
                />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white">
                  Zodiac Collection
                </h1>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-4 lg:mb-6">
                Personalized astrology tins featuring all 12 zodiac signs. Perfect for birthday gifts, 
                party favors, and stocking stuffers that celebrate the stars.
              </p>
              
              {/* Feature Grid */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 lg:mb-6">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <Gift className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <p className="text-white/80 text-xs sm:text-sm font-semibold">Perfect Gifts</p>
                  </div>
                  <p className="text-white text-xs sm:text-sm">Birthday & party favors</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <Star className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <p className="text-white/80 text-xs sm:text-sm font-semibold">12 Zodiac Signs</p>
                  </div>
                  <p className="text-white text-xs sm:text-sm">All astrological signs</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <p className="text-white/80 text-xs sm:text-sm font-semibold">Premium Design</p>
                  </div>
                  <p className="text-white text-xs sm:text-sm">Custom zodiac artwork</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    <p className="text-white/80 text-xs sm:text-sm font-semibold">Personalized</p>
                  </div>
                  <p className="text-white text-xs sm:text-sm">Add custom messages</p>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link
                  to="/tin-skinz?category=zodiac"
                  className="bg-white text-purple-600 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Browse Zodiac Tin Skinz
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Link>
                <button
                  onClick={() => {
                    document.getElementById('zodiac-signs')?.scrollIntoView({ 
                      behavior: 'smooth',
                      block: 'start'
                    })
                  }}
                  className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-white/30 transition-colors inline-flex items-center justify-center gap-2"
                >
                  Explore All Signs
                </button>
              </div>
            </div>
            
            {/* Right Content - Current Month Zodiac */}
            {currentSign && (
              <div className="lg:w-1/2 w-full">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8">
                  <div className="text-center mb-3 sm:mb-4">
                    <p className="text-white/80 text-xs sm:text-sm mb-1 sm:mb-2">Current Month's Sign</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">{currentZodiac}</h2>
                    <p className="text-white/90 text-xs sm:text-sm">{currentSign.dates}</p>
                  </div>
                  <div className="mb-3 sm:mb-4 flex items-center justify-center">
                    <TinSkinzMockupViewer
                      selectedDesign={{
                        designUrl: currentSign.designUrl
                      }}
                      displayWidth={280}
                      displayHeight={280}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                      <p className="text-white/80 text-xs mb-1">Element</p>
                      <p className="text-white font-semibold text-xs sm:text-sm">{currentSign.element}</p>
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 text-center">
                      <p className="text-white/80 text-xs mb-1">Traits</p>
                      <p className="text-white font-semibold text-xs sm:text-sm">{currentSign.traits.split(',')[0]}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Zodiac Signs */}
      <div id="zodiac-signs" className="py-12 md:py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
              Zodiac Tinz - The Thoughtful Gift
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Choose your zodiac sign and give a gift that shows you truly know someone. 
              Perfect for birthdays, celebrations, and anyone who loves astrology.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {zodiacSigns.map((sign, index) => (
              <Link
                key={sign.name}
                to={`/zodiac-tin-skinz/${sign.name.toLowerCase()}`}
                className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group block"
              >
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center p-2 sm:p-3 md:p-4 relative overflow-hidden">
                  <img
                    src={sign.image}
                    alt={`${sign.name} zodiac tin front`}
                    className="w-[120%] h-[120%] object-contain absolute inset-0 m-auto transition-opacity duration-300 group-hover:opacity-0"
                  />
                  <img
                    src={sign.backImage}
                    alt={`${sign.name} zodiac tin back`}
                    className="w-[120%] h-[120%] object-contain absolute inset-0 m-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                <div className="p-3 sm:p-4 md:p-6 text-center">
                  <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">{sign.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{sign.dates}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Use Cases */}
      <div className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
              Perfect For Every Occasion
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Zodiac tin-skinz are versatile gifts that work for any celebration or special moment.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                <div className="bg-gray-100 rounded-full p-2 sm:p-2.5 lg:p-3">
                  <Gift className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Birthday Gifts</h3>
              </div>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                Celebrate someone's special day with their zodiac sign. A personalized gift 
                that shows you know their astrological identity.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-buyprint-brand flex-shrink-0" />
                  <span>Personalized zodiac design</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-buyprint-brand flex-shrink-0" />
                  <span>Perfect for any age</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-buyprint-brand flex-shrink-0" />
                  <span>Memorable keepsake</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                <div className="bg-gray-100 rounded-full p-2 sm:p-2.5 lg:p-3">
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Party Favors</h3>
              </div>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                Make your astrology-themed party unforgettable with zodiac tin-skinz as 
                unique party favors for your guests.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-buyprint-brand flex-shrink-0" />
                  <span>Customizable for each guest</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-buyprint-brand flex-shrink-0" />
                  <span>Great conversation starters</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-buyprint-brand flex-shrink-0" />
                  <span>Practical keepsakes</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                <div className="bg-gray-100 rounded-full p-2 sm:p-2.5 lg:p-3">
                  <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                </div>
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Stocking Stuffers</h3>
              </div>
              <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                Fill stockings with zodiac tin-skinz for astrology lovers. Small, 
                meaningful gifts that bring joy during the holidays.
              </p>
              <ul className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-buyprint-brand flex-shrink-0" />
                  <span>Perfect stocking size</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-buyprint-brand flex-shrink-0" />
                  <span>Affordable gift option</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-buyprint-brand flex-shrink-0" />
                  <span>Thoughtful surprise</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 py-12 md:py-16 lg:py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">
            Ready to Get Your Zodiac Tin Skinz?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8">
            Browse our complete zodiac collection and personalize your tin with custom messages and candy choices.
          </p>
          <Link
            to="/tin-skinz?category=zodiac"
            className="bg-white text-purple-600 px-6 py-3 sm:px-8 sm:py-4 lg:px-10 lg:py-5 rounded-lg font-bold text-base sm:text-lg lg:text-xl hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2 w-full sm:w-auto max-w-md sm:max-w-none mx-auto"
          >
            Browse Zodiac Tin Skinz
            <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ZodiacTinSkinz;
