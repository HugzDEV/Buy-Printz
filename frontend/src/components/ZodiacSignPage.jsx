import React, { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { 
  Star, 
  ArrowLeft, 
  ArrowRight,
  Gift,
  Heart,
  Sparkles,
  Calendar,
  Users,
  Award,
  CheckCircle
} from 'lucide-react'
import SEOHead from './SEOHead'
import TinSkinzMockupViewer from './TinSkinzMockupViewer'

const ZodiacSignPage = () => {
  const { sign } = useParams()
  const [currentSign, setCurrentSign] = useState(null)
  const [nextSign, setNextSign] = useState(null)
  const [prevSign, setPrevSign] = useState(null)

  const zodiacSigns = [
    {
      name: 'Aries',
      dates: 'March 21 - April 19',
      element: 'Fire',
      traits: 'Bold, energetic, pioneering',
      colors: 'Red, orange, bright colors',
      image: '/assets/tin-skinz/designs/Zodiac Final/10_Aries_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/10_Aries_Cancer_Double_Both.png',
      description: 'The ram leads with courage and determination. Perfect for the natural-born leader in your life.',
      personality: 'Aries are natural leaders who love to take charge. They are bold, energetic, and always ready for a new adventure.',
      giftIdeas: 'Perfect for the Aries who loves to lead and inspire others.',
      compatibility: 'Best with Leo, Sagittarius, Gemini, Aquarius',
      rulingPlanet: 'Mars',
      symbol: 'Ram',
      quality: 'Cardinal',
      season: 'Spring'
    },
    {
      name: 'Taurus',
      dates: 'April 20 - May 20',
      element: 'Earth',
      traits: 'Reliable, practical, sensual',
      colors: 'Green, earth tones, pastels',
      image: '/assets/tin-skinz/designs/Zodiac Final/2_Taurus_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/2_Taurus_Double_Both.png',
      description: 'The bull values stability and comfort. Ideal for those who appreciate the finer things in life.',
      personality: 'Taurus individuals are known for their reliability and love of comfort. They appreciate beauty and have a strong connection to nature.',
      giftIdeas: 'Perfect for the Taurus who values quality and comfort.',
      compatibility: 'Best with Virgo, Capricorn, Cancer, Pisces',
      rulingPlanet: 'Venus',
      symbol: 'Bull',
      quality: 'Fixed',
      season: 'Spring'
    },
    {
      name: 'Gemini',
      dates: 'May 21 - June 20',
      element: 'Air',
      traits: 'Curious, adaptable, communicative',
      colors: 'Yellow, silver, light blue',
      image: '/assets/tin-skinz/designs/Zodiac Final/9_Gemini_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/9_Gemini_Double_Both.png',
      description: 'The twins bring wit and versatility. Perfect for the social butterfly who loves to chat.',
      personality: 'Gemini are known for their quick wit and adaptability. They love to communicate and are always curious about the world around them.',
      giftIdeas: 'Perfect for the Gemini who loves to learn and share ideas.',
      compatibility: 'Best with Libra, Aquarius, Aries, Leo',
      rulingPlanet: 'Mercury',
      symbol: 'Twins',
      quality: 'Mutable',
      season: 'Spring'
    },
    {
      name: 'Cancer',
      dates: 'June 21 - July 22',
      element: 'Water',
      traits: 'Intuitive, protective, nurturing',
      colors: 'Silver, white, sea green',
      image: '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Double_Both.png',
      description: 'The crab is deeply emotional and caring. Ideal for the family-oriented soul.',
      personality: 'Cancer individuals are deeply intuitive and protective of their loved ones. They have a strong connection to home and family.',
      giftIdeas: 'Perfect for the Cancer who values family and emotional connections.',
      compatibility: 'Best with Scorpio, Pisces, Taurus, Virgo',
      rulingPlanet: 'Moon',
      symbol: 'Crab',
      quality: 'Cardinal',
      season: 'Summer'
    },
    {
      name: 'Leo',
      dates: 'July 23 - August 22',
      element: 'Fire',
      traits: 'Confident, generous, dramatic',
      colors: 'Gold, orange, bright yellow',
      image: '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Double_Both.png',
      description: 'The lion rules with charisma and warmth. Perfect for the natural performer.',
      personality: 'Leo individuals are natural performers who love to be the center of attention. They are generous, confident, and have a big heart.',
      giftIdeas: 'Perfect for the Leo who loves to shine and be appreciated.',
      compatibility: 'Best with Aries, Sagittarius, Gemini, Libra',
      rulingPlanet: 'Sun',
      symbol: 'Lion',
      quality: 'Fixed',
      season: 'Summer'
    },
    {
      name: 'Virgo',
      dates: 'August 23 - September 22',
      element: 'Earth',
      traits: 'Analytical, practical, perfectionist',
      colors: 'Brown, navy, muted tones',
      image: '/assets/tin-skinz/designs/Zodiac Final/11_Virgo_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/11_Virgo_Double_Both.png',
      description: 'The maiden brings order and precision. Ideal for the detail-oriented perfectionist.',
      personality: 'Virgo individuals are known for their attention to detail and practical approach to life. They are analytical and always strive for perfection.',
      giftIdeas: 'Perfect for the Virgo who appreciates quality and attention to detail.',
      compatibility: 'Best with Taurus, Capricorn, Cancer, Scorpio',
      rulingPlanet: 'Mercury',
      symbol: 'Virgin',
      quality: 'Mutable',
      season: 'Summer'
    },
    {
      name: 'Libra',
      dates: 'September 23 - October 22',
      element: 'Air',
      traits: 'Diplomatic, charming, balanced',
      colors: 'Pink, blue, pastels',
      image: '/assets/tin-skinz/designs/Zodiac Final/7_Libra_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/7_Libra_Double_Both.png',
      description: 'The scales seek harmony and beauty. Perfect for the peacemaker and aesthete.',
      personality: 'Libra individuals are natural diplomats who seek balance and harmony in all relationships. They have a strong appreciation for beauty and art.',
      giftIdeas: 'Perfect for the Libra who values beauty and harmony.',
      compatibility: 'Best with Gemini, Aquarius, Leo, Sagittarius',
      rulingPlanet: 'Venus',
      symbol: 'Scales',
      quality: 'Cardinal',
      season: 'Fall'
    },
    {
      name: 'Scorpio',
      dates: 'October 23 - November 21',
      element: 'Water',
      traits: 'Intense, passionate, mysterious',
      colors: 'Deep red, black, burgundy',
      image: '/assets/tin-skinz/designs/Zodiac Final/12_Scorpio_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/12_Scorpio_Double_Both.png',
      description: 'The scorpion brings depth and transformation. Ideal for the intense and passionate soul.',
      personality: 'Scorpio individuals are known for their intensity and passion. They are mysterious, transformative, and have a deep understanding of life.',
      giftIdeas: 'Perfect for the Scorpio who values depth and transformation.',
      compatibility: 'Best with Cancer, Pisces, Virgo, Capricorn',
      rulingPlanet: 'Pluto',
      symbol: 'Scorpion',
      quality: 'Fixed',
      season: 'Fall'
    },
    {
      name: 'Sagittarius',
      dates: 'November 22 - December 21',
      element: 'Fire',
      traits: 'Adventurous, optimistic, philosophical',
      colors: 'Purple, turquoise, bright colors',
      image: '/assets/tin-skinz/designs/Zodiac Final/8_Sagittarius_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/8_Sagittarius_Double_Both.png',
      description: 'The archer seeks truth and adventure. Perfect for the free-spirited explorer.',
      personality: 'Sagittarius individuals are natural explorers who love adventure and learning. They are optimistic, philosophical, and always seeking truth.',
      giftIdeas: 'Perfect for the Sagittarius who loves adventure and learning.',
      compatibility: 'Best with Aries, Leo, Libra, Aquarius',
      rulingPlanet: 'Jupiter',
      symbol: 'Archer',
      quality: 'Mutable',
      season: 'Fall'
    },
    {
      name: 'Capricorn',
      dates: 'December 22 - January 19',
      element: 'Earth',
      traits: 'Ambitious, disciplined, practical',
      colors: 'Brown, black, dark green',
      image: '/assets/tin-skinz/designs/Zodiac Final/3_Capricornus_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/3_Capricornus_Double_Both.png',
      description: 'The goat climbs with determination. Ideal for the ambitious achiever.',
      personality: 'Capricorn individuals are known for their ambition and discipline. They are practical, hardworking, and always striving for success.',
      giftIdeas: 'Perfect for the Capricorn who values achievement and quality.',
      compatibility: 'Best with Taurus, Virgo, Scorpio, Pisces',
      rulingPlanet: 'Saturn',
      symbol: 'Goat',
      quality: 'Cardinal',
      season: 'Winter'
    },
    {
      name: 'Aquarius',
      dates: 'January 20 - February 18',
      element: 'Air',
      traits: 'Independent, innovative, humanitarian',
      colors: 'Electric blue, silver, bright colors',
      image: '/assets/tin-skinz/designs/Zodiac Final/6_Aquarius_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/6_Aquarius_Double_Both.png',
      description: 'The water bearer brings innovation and progress. Perfect for the forward-thinking individual.',
      personality: 'Aquarius individuals are innovative and independent thinkers. They are humanitarian, progressive, and always looking toward the future.',
      giftIdeas: 'Perfect for the Aquarius who values innovation and progress.',
      compatibility: 'Best with Gemini, Libra, Aries, Sagittarius',
      rulingPlanet: 'Uranus',
      symbol: 'Water Bearer',
      quality: 'Fixed',
      season: 'Winter'
    },
    {
      name: 'Pisces',
      dates: 'February 19 - March 20',
      element: 'Water',
      traits: 'Compassionate, artistic, intuitive',
      colors: 'Sea green, lavender, soft pastels',
      image: '/assets/tin-skinz/designs/Zodiac Final/4_Pisces_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/4_Pisces_Double_Both.png',
      description: 'The fish swims in dreams and intuition. Ideal for the creative and empathetic soul.',
      personality: 'Pisces individuals are deeply intuitive and compassionate. They are artistic, dreamy, and have a strong connection to the spiritual realm.',
      giftIdeas: 'Perfect for the Pisces who values creativity and intuition.',
      compatibility: 'Best with Cancer, Scorpio, Taurus, Capricorn',
      rulingPlanet: 'Neptune',
      symbol: 'Fish',
      quality: 'Mutable',
      season: 'Winter'
    }
  ]

  useEffect(() => {
    const signData = zodiacSigns.find(s => s.name.toLowerCase() === sign?.toLowerCase())
    if (signData) {
      setCurrentSign(signData)
      
      // Find next and previous signs
      const currentIndex = zodiacSigns.findIndex(s => s.name === signData.name)
      const nextIndex = (currentIndex + 1) % zodiacSigns.length
      const prevIndex = (currentIndex - 1 + zodiacSigns.length) % zodiacSigns.length
      
      setNextSign(zodiacSigns[nextIndex])
      setPrevSign(zodiacSigns[prevIndex])
    }
  }, [sign])

  // Generate structured data following the exact pattern of working StickerProductDetail
  const structuredData = currentSign ? {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `${currentSign.name} Tin Skinz`,
    "description": `Custom ${currentSign.name} Tin Skinz featuring ${currentSign.name} astrological sign design. Perfect for ${currentSign.name} birthday gifts, party favors, and astrology lovers.`,
    "image": `https://www.buyprintz.com${currentSign.image}`,
    "brand": {
      "@type": "Brand",
      "name": "Tin Skinz"
    },
    "offers": {
      "@type": "Offer",
      "price": "19.99",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    }
  } : null


  if (!currentSign) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Zodiac Sign Not Found</h1>
          <p className="text-gray-600 mb-8">The zodiac sign you're looking for doesn't exist.</p>
          <Link to="/zodiac-tin-skinz" className="text-blue-600 hover:text-blue-800 underline">
            Back to Zodiac Tin Skinz
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <SEOHead
        title={`${currentSign.name} Tin Skinz - Custom ${currentSign.name} Zodiac Birthday Gifts & Party Favors`}
        description={`Custom ${currentSign.name} Tin Skinz featuring ${currentSign.name} astrological sign design. Perfect for ${currentSign.name} birthday gifts, party favors, and astrology lovers. Premium aluminum tins with personalized ${currentSign.name} designs.`}
        keywords={`${currentSign.name} tin skinz, ${currentSign.name} gifts, ${currentSign.name} birthday gifts, ${currentSign.name} zodiac tins, ${currentSign.name} party favors, ${currentSign.name} astrology gifts, ${currentSign.name} personalized gifts, ${currentSign.name} stocking stuffers, ${currentSign.name} horoscope gifts, ${currentSign.name} zodiac collection`}
        image={`https://www.buyprintz.com${currentSign.image}`}
        url={`https://www.buyprintz.com/zodiac-tin-skinz/${currentSign.name.toLowerCase()}`}
        type="product"
        structuredData={null}
      />
        
        {/* Hero Section */}
        <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 opacity-90"></div>
          <div className="relative max-w-7xl mx-auto px-4 py-6 md:py-12 lg:py-20">
              <Link 
              to="/zodiac-tin-skinz"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white mb-4 md:mb-6 transition-colors"
              >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              <span className="text-sm md:text-base">Back to Zodiac Collection</span>
              </Link>
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-12">
            <div className="lg:w-1/2 w-full">
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                <img
                  src="/assets/tin-skinz/Tin Skinz_logo_full color_Secondary logo.png"
                  alt="Tin Skinz Logo"
                  className="h-12 sm:h-16 lg:h-20 w-auto"
                />
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white text-center sm:text-left">
                  {currentSign.name} Tin Skinz
                </h1>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-white/90 mb-4 sm:mb-6 text-center sm:text-left">
                {currentSign.description}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4">
                  <p className="text-white/80 text-xs sm:text-sm">Dates</p>
                  <p className="text-white font-semibold text-xs sm:text-sm lg:text-base">{currentSign.dates}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4">
                  <p className="text-white/80 text-xs sm:text-sm">Element</p>
                  <p className="text-white font-semibold text-xs sm:text-sm lg:text-base">{currentSign.element}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4">
                  <p className="text-white/80 text-xs sm:text-sm">Ruling Planet</p>
                  <p className="text-white font-semibold text-xs sm:text-sm lg:text-base">{currentSign.rulingPlanet}</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 sm:p-3 lg:p-4">
                  <p className="text-white/80 text-xs sm:text-sm">Quality</p>
                  <p className="text-white font-semibold text-xs sm:text-sm lg:text-base">{currentSign.quality}</p>
                </div>
              </div>
              <Link
                to="/tin-skinz?category=zodiac"
                className="bg-white text-purple-600 px-6 py-3 sm:px-8 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                Browse Zodiac Tin Skinz
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8">
                <div className="mb-4 sm:mb-6 flex items-center justify-center">
                  <TinSkinzMockupViewer
                    selectedDesign={{
                      designUrl: currentSign.designUrl
                    }}
                    displayWidth={280}
                    displayHeight={280}
                  />
                </div>
                
                {/* Navigation Buttons */}
                <div className="flex justify-between items-center pt-3 sm:pt-4 border-t border-white/20 gap-4 relative z-10">
                  {prevSign ? (
                    <Link
                      to={`/zodiac-tin-skinz/${prevSign.name.toLowerCase()}`}
                      className="flex items-center gap-1 sm:gap-2 text-white/90 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg min-w-[80px] sm:min-w-[100px] cursor-pointer"
                      onClick={(e) => {
                        console.log('Prev clicked:', prevSign.name);
                      }}
                    >
                      <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm font-medium">{prevSign.name}</span>
                    </Link>
                  ) : (
                    <div className="w-[80px] sm:w-[100px]"></div>
                  )}
                  
                  {nextSign ? (
                    <Link
                      to={`/zodiac-tin-skinz/${nextSign.name.toLowerCase()}`}
                      className="flex items-center gap-1 sm:gap-2 text-white/90 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg min-w-[80px] sm:min-w-[100px] justify-end cursor-pointer"
                      onClick={(e) => {
                        console.log('Next clicked:', nextSign.name);
                      }}
                    >
                      <span className="text-xs sm:text-sm font-medium">{nextSign.name}</span>
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    </Link>
                  ) : (
                    <div className="w-[80px] sm:w-[100px]"></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Zodiac Guide */}
      <div className="py-12 md:py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-8 md:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6">
              The Complete {currentSign.name} Zodiac Guide
              </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
              Discover everything about the {currentSign.name} zodiac sign - from personality traits to compatibility, 
              ruling planets to key characteristics. Born between {currentSign.dates}.
            </p>
          </div>

          {/* Astrological Details Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-8 md:mb-12 lg:mb-16">
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-buyprint-brand flex-shrink-0" />
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">Element</h3>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-buyprint-brand mb-1 sm:mb-2">{currentSign.element}</p>
              <p className="text-gray-600 text-xs sm:text-sm">
                {currentSign.element} signs are known for their {
                  currentSign.element === 'Fire' ? 'passion, enthusiasm, and dynamic energy' :
                  currentSign.element === 'Earth' ? 'practicality, stability, and grounded nature' :
                  currentSign.element === 'Air' ? 'intellectual curiosity and social connections' :
                  'emotional depth, intuition, and sensitivity'
                }.
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-buyprint-brand flex-shrink-0" />
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">Ruling Planet</h3>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-buyprint-brand mb-1 sm:mb-2">{currentSign.rulingPlanet}</p>
              <p className="text-gray-600 text-xs sm:text-sm">
                {currentSign.rulingPlanet} governs {currentSign.name}, influencing their core characteristics and life approach.
              </p>
            </div>
            
            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-buyprint-brand flex-shrink-0" />
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">Quality</h3>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-buyprint-brand mb-1 sm:mb-2">{currentSign.quality}</p>
              <p className="text-gray-600 text-xs sm:text-sm">
                {currentSign.quality} signs are {
                  currentSign.quality === 'Cardinal' ? 'initiators who start new cycles' :
                  currentSign.quality === 'Fixed' ? 'stable and determined maintainers' :
                  'adaptable and flexible change-makers'
                }.
              </p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 shadow-lg border border-gray-200">
              <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-buyprint-brand flex-shrink-0" />
                <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">Season</h3>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-buyprint-brand mb-1 sm:mb-2">{currentSign.season}</p>
              <p className="text-gray-600 text-xs sm:text-sm">
                Born during {currentSign.season.toLowerCase()}, embodying the energies of this time.
              </p>
            </div>
          </div>

          {/* Personality & Compatibility */}
          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 mb-8 md:mb-12 lg:mb-16">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                {currentSign.name} Personality & Traits
              </h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                {currentSign.personality}
              </p>
              <div className="space-y-4">
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-buyprint-brand" />
                    Key Traits
                  </h4>
                  <p className="text-gray-700">{currentSign.traits}</p>
                </div>
                <div className="bg-white rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-buyprint-brand" />
                    Signature Colors
                  </h4>
                  <p className="text-gray-700">{currentSign.colors}</p>
          </div>
        </div>
      </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                {currentSign.name} Compatibility & Relationships
              </h3>
              <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                Understanding zodiac compatibility helps {currentSign.name} individuals build stronger connections and relationships.
              </p>
              <div className="bg-white rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-buyprint-brand" />
                  Best Zodiac Matches
                </h4>
                <p className="text-gray-700">{currentSign.compatibility}</p>
              </div>
              <div className="bg-white rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-3">Perfect Gift for {currentSign.name}</h4>
                <p className="text-gray-700 mb-4">
                  {currentSign.giftIdeas}
                </p>
                <p className="text-sm text-gray-600">
                  Our {currentSign.name} Tin Skinz celebrates their unique astrological identity with custom zodiac designs and personalization options.
                </p>
              </div>
            </div>
          </div>

          {/* Why This Makes the Perfect Gift */}
          <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-12 text-center">
            <h3 className="text-3xl font-bold text-white mb-6">
              Why {currentSign.name} Will Love Their Zodiac Tin
            </h3>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Designed specifically for {currentSign.name} individuals, combining their zodiac symbolism with practical functionality.
            </p>
            <div className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <CheckCircle className="w-8 h-8 text-white mx-auto mb-3" />
                <p className="text-white font-semibold mb-2">Personalized Design</p>
                <p className="text-white/80 text-sm">Custom {currentSign.name} zodiac artwork</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <Star className="w-8 h-8 text-white mx-auto mb-3" />
                <p className="text-white font-semibold mb-2">Astrological Meaning</p>
                <p className="text-white/80 text-sm">Celebrates their zodiac identity</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <Gift className="w-8 h-8 text-white mx-auto mb-3" />
                <p className="text-white font-semibold mb-2">Thoughtful Gift</p>
                <p className="text-white/80 text-sm">Shows you know them well</p>
            </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6">
                <Award className="w-8 h-8 text-white mx-auto mb-3" />
                <p className="text-white font-semibold mb-2">Premium Quality</p>
                <p className="text-white/80 text-sm">Aluminum with custom vinyl</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Your {currentSign.name} Tin Skinz?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Browse our zodiac collection and find the perfect {currentSign.name} Tin Skinz that celebrates the stars 
            and brings joy to astrology lovers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tin-skinz?category=zodiac"
              className="bg-white text-purple-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center gap-2"
            >
              Browse Zodiac Tin Skinz
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/zodiac-tin-skinz"
              className="bg-white/20 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition-colors"
            >
              View All Zodiac Signs
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ZodiacSignPage
