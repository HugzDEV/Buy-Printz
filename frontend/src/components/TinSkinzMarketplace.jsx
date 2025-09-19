import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, NeumorphicButton } from './ui';
import TinSkinzMockupViewer from './TinSkinzMockupViewer';
import { calculateTinSkinzPricing, getPricingBreakdown, formatCurrency, getBulkSavings } from '../utils/tinSkinzPricing';
import { loadStripe } from '@stripe/stripe-js';

// All Tin Skinz designs
const tinSkinzDesigns = {
  'abstract-art': [
    {
      id: 'abstract-1',
      name: 'Abstract 1',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 1_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 1_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 1_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-2',
      name: 'Abstract 2',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 2_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 2_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 2_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-3',
      name: 'Abstract 3',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 3_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 3_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 3_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-4',
      name: 'Abstract 4',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 4_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 4_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 4_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-5',
      name: 'Abstract 5',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 5_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 5_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 5_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-6',
      name: 'Abstract 6',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 6_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 6_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 6_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-9',
      name: 'Abstract 9',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 9_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 9_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 9_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-10',
      name: 'Abstract 10',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 10_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 10_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 10_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-11',
      name: 'Abstract 11',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 11_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 11_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 11_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-12',
      name: 'Abstract 12',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 12_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 12_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 12_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-16',
      name: 'Abstract 16',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 16_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 16_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 16_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-17',
      name: 'Abstract 17',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 17_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 17_Back.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 17_Double.png',
      category: 'abstract-art',
       price: 9.99
    }
  ],
  'zodiac': [
    {
      id: 'cancer',
      name: 'Cancer',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'taurus',
      name: 'Taurus',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/2_Taurus_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/2_Taurus_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/2_Taurus_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'capricornus',
      name: 'Capricorn',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/3_Capricornus_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/3_Capricornus_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/3_Capricornus_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'pisces',
      name: 'Pisces',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/4_Pisces_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/4_Pisces_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/4_Pisces_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'leo',
      name: 'Leo',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'aquarius',
      name: 'Aquarius',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/6_Aquarius_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/6_Aquarius_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/6_Aquarius_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'libra',
      name: 'Libra',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/7_Libra_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/7_Libra_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/7_Libra_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'sagittarius',
      name: 'Sagittarius',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/8_Sagittarius_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/8_Sagittarius_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/8_Sagittarius_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'gemini',
      name: 'Gemini',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/9_Gemini_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/9_Gemini_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/9_Gemini_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'aries',
      name: 'Aries',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/10_Aries_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/10_Aries_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/10_Aries_Cancer_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'virgo',
      name: 'Virgo',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/11_Virgo_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/11_Virgo_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/11_Virgo_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'scorpio',
      name: 'Scorpio',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/12_Scorpio_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/12_Scorpio_Back.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/12_Scorpio_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    }
  ],
  'animals': [
    {
      id: 'bee',
      name: 'Bee',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/1_Bee_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/1_Bee_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/1_Bee_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'wolf',
      name: 'Wolf',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/2_Wolf_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/2_Wolf_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/2_Wolf_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'hummingbird',
      name: 'Hummingbird',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/3_Hummingbird_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/3_Hummingbird_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/3_Hummingbird_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'bunny',
      name: 'Bunny',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/4_Bunny_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/4_Bunny_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/4_Bunny_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'butterfly',
      name: 'Butterfly',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/5_Butterfly_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/5_Butterfly_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/5_Butterfly_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'cat',
      name: 'Cat',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/6_Cat_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/6_Cat_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/6_Cat_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'puppy',
      name: 'Puppy',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/9_Puppy_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/9_Puppy_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/9_Puppy_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'horse',
      name: 'Horse',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/10_Horse_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/10_Horse_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/10_Horse_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'lion',
      name: 'Lion',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/11_Lion_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/11_Lion_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/11_Lion_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'owl',
      name: 'Owl',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/12_Owl_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/12_Owl_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/12_Owl_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'parrot',
      name: 'Parrot',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/13_Parrot_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/13_Parrot_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/13_Parrot_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'peacock-14',
      name: 'Peacock',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/14_Peacock_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/14_Peacock_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/14_Peacock_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'peacock-15',
      name: 'Peacock 2',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/15_Peacock_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/15_Peacock_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/15_Peacock_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'turtle',
      name: 'Turtle',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/16_Turtle_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/16_Turtle_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/16_Turtle_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'frog',
      name: 'Frog',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/17_Frog_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/17_Frog_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/17_Frog_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'ladybugs',
      name: 'Ladybugs',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/18_Ladybugs_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/18_Ladybugs_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/18_Ladybugs_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'monkey',
      name: 'Monkey',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/19_Monkey_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/19_Monkey_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/19_Monkey_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'elephant',
      name: 'Elephant',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/20_Elephant_Front.png',
      backThumbnailUrl: '/assets/tin-skinz/designs/Animals/20_Elephant_Back.png',
      designUrl: '/assets/tin-skinz/designs/Animals/20_Elephant_Double_Both.png',
      category: 'animals',
       price: 9.99
    }
  ]
};

const candyOptions = [
  { id: 'chocolate-mix', name: 'Chocolate Mix', price: 3.00 },
  { id: 'gummy-bears', name: 'Gummy Bears', price: 2.00 },
  { id: 'sour-patch', name: 'Sour Patch Kids', price: 2.50 },
  { id: 'mints', name: 'Peppermint Mints', price: 1.50 }
];

const TinSkinzMarketplace = () => {
  const [selectedCategory, setSelectedCategory] = useState('abstract-art');
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedCandy, setSelectedCandy] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const [stripe, setStripe] = useState(null);

  const currentDesigns = tinSkinzDesigns[selectedCategory] || [];

  // Initialize Stripe
  useEffect(() => {
    const initializeStripe = async () => {
      const stripeInstance = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);
      setStripe(stripeInstance);
    };
    initializeStripe();
  }, []);

  // Calculate pricing whenever relevant values change
  useEffect(() => {
    if (selectedDesign) {
      const hasCandy = selectedCandy !== '';
      const hasCustomMessage = customMessage.trim() !== '';
      
      try {
        const calculatedPricing = calculateTinSkinzPricing(quantity, hasCandy, hasCustomMessage);
        setPricing(calculatedPricing);
      } catch (error) {
        console.error('Error calculating pricing:', error);
        setPricing(null);
      }
    }
  }, [selectedDesign, selectedCandy, customMessage, quantity]);

  const handleDesignSelect = (design) => {
    setSelectedDesign(design);
  };

  const getBulkSavingsInfo = () => {
    if (!pricing || quantity < 3) return null;
    return getBulkSavings(quantity);
  };

  const handlePurchase = async () => {
    if (!selectedDesign) {
      alert('Please select a design first');
      return;
    }

    if (!stripe) {
      alert('Payment system is not ready. Please try again.');
      return;
    }

    if (!pricing) {
      alert('Unable to calculate pricing. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      // Create order and get payment intent
      const orderData = {
        design_id: selectedDesign.id,
        custom_message: customMessage.trim() || null,
        candy_id: selectedCandy || null,
        quantity: quantity,
        shipping_address: {
          // This would be collected from a form in a real implementation
          name: "John Doe",
          line1: "123 Main St",
          city: "Anytown",
          state: "CA",
          postal_code: "12345",
          country: "US"
        },
        billing_address: {
          // This would be collected from a form in a real implementation
          name: "John Doe",
          line1: "123 Main St",
          city: "Anytown",
          state: "CA",
          postal_code: "12345",
          country: "US"
        }
      };

      const response = await fetch('/api/tin-skinz/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const { order_id, payment_intent_id, client_secret, total_amount } = await response.json();

      // Confirm payment with Stripe
      const { error } = await stripe.confirmPayment({
        clientSecret: client_secret,
        confirmParams: {
          return_url: `${window.location.origin}/tin-skinz/success?order_id=${order_id}`,
        },
      });

      if (error) {
        console.error('Payment failed:', error);
        alert(`Payment failed: ${error.message}`);
      } else {
        // Payment succeeded
        window.location.href = `/tin-skinz/success?order_id=${order_id}`;
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          {/* Tin Skinz Logo */}
          <div className="mb-6 flex justify-center">
            <img 
              src="/assets/tin-skinz/Tin Skinz_logo_full color_Secondary logo.png" 
              alt="Tin Skinz Logo" 
              className="h-32 w-auto"
            />
          </div>
          
           <p className="text-xl text-white/90 max-w-2xl mx-auto mb-6">
             Pre-designed tins filled with candy for every occasion. Perfect for weddings, 
             birthdays, holidays, and special events. Customize with your own message or use our <a href="/editor?product=tin" className="text-yellow-500 font-semibold hover:underline">full editor</a>.
           </p>
           
           {/* Pricing Overview */}
           <div className="backdrop-blur-md bg-white/20 border border-white/30 rounded-2xl p-4 max-w-4xl mx-auto">
             <h3 className="text-lg font-semibold text-white mb-3">Pricing Tiers</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
               <div className="text-center">
                 <div className="text-yellow-400 font-bold">1-2 tins</div>
                 <div className="text-white">$9.99 each</div>
                 <div className="text-white/70">+ $3.00 candy</div>
                 <div className="text-white/70">+ $0.99 message</div>
               </div>
               <div className="text-center">
                 <div className="text-yellow-400 font-bold">3 tins</div>
                 <div className="text-white">$6.67 each</div>
                 <div className="text-white/70">+ $1.67 candy</div>
                 <div className="text-white/70">+ $0.99 message</div>
               </div>
               <div className="text-center">
                 <div className="text-yellow-400 font-bold">20-50 tins</div>
                 <div className="text-white">$6.00 each</div>
                 <div className="text-white/70">No candy</div>
                 <div className="text-white/70">+ $0.99 message</div>
               </div>
               <div className="text-center">
                 <div className="text-yellow-400 font-bold">51+ tins</div>
                 <div className="text-white">$5.50 each</div>
                 <div className="text-white/70">No candy</div>
                 <div className="text-white/70">Free message</div>
               </div>
             </div>
           </div>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Design Selection */}
        <div className="space-y-6">
           {/* Category Selection */}
           <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Choose Category</h3>
            </div>
              <select 
                value={selectedCategory} 
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent transition-all duration-200"
              >
                <option value="abstract-art">Abstract Art</option>
                <option value="zodiac">Zodiac Signs</option>
                <option value="animals">Animals</option>
              </select>
          </div>

           {/* Design Selection */}
           <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Select Design</h3>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {currentDesigns.map((design) => (
                <div
                  key={design.id}
                  className={`cursor-pointer rounded-xl p-2 transition-all duration-300 ${
                    selectedDesign?.id === design.id
                      ? 'shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(0,0,0,0.1)] bg-yellow-100 border-2 border-yellow-500/30'
                      : 'shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(0,0,0,0.1)] bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => handleDesignSelect(design)}
                >
                  <div className="aspect-square bg-gray-200 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    <img 
                      src={design.thumbnailUrl} 
                      alt={design.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                      <span className="text-gray-500 text-xs">Preview</span>
                    </div>
                  </div>
                  <h3 className="font-medium text-xs text-gray-900 truncate">{design.name}</h3>
                  <p className="text-yellow-600 font-bold text-xs">${design.price}</p>
                </div>
              ))}
            </div>
          </div>

           {/* Custom Message */}
           <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Custom Message (Optional)</h3>
            </div>
            <label htmlFor="custom-message" className="block text-sm font-medium text-gray-700 mb-2">
              Add a personal message
            </label>
            <input
              id="custom-message"
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your custom message..."
              maxLength={50}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent transition-all duration-200"
            />
             <p className="text-sm text-gray-500 mt-1">
               {customMessage.length}/50 characters
               {customMessage.trim() && quantity < 51 && (
                 <span className="text-yellow-600 font-medium ml-2">
                   (+$0.99 per tin)
                 </span>
               )}
               {customMessage.trim() && quantity >= 51 && (
                 <span className="text-green-600 font-medium ml-2">
                   (Free on orders 51+)
                 </span>
               )}
             </p>
          </div>

           {/* Candy Selection */}
           <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Choose Candy</h3>
            </div>
            <select 
              value={selectedCandy} 
              onChange={(e) => setSelectedCandy(e.target.value)}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent transition-all duration-200"
            >
              <option value="">Select candy type</option>
              {candyOptions.map((candy) => (
                <option key={candy.id} value={candy.id}>
                  {candy.name} - ${candy.price}
                </option>
               ))}
             </select>
             <p className="text-sm text-gray-500 mt-2">
               Candy available for orders 1-19 tins. Bulk orders (20+) focus on the tin design.
             </p>
           </div>

        </div>

         {/* Right Column: Live Mockup */}
         <div className="space-y-6">
           <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Live Preview</h3>
            </div>
            <div className="flex items-center justify-center min-h-[400px]">
              <TinSkinzMockupViewer
                selectedDesign={selectedDesign}
                customMessage={customMessage}
                displayWidth={400}
                displayHeight={400}
              />
            </div>
          </div>

           {/* Purchase Summary */}
           <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Order Summary</h3>
            </div>
             <div className="space-y-4">
               {selectedDesign && (
                 <div className="flex justify-between text-gray-700">
                   <span>{selectedDesign.name}</span>
                   <span>{formatCurrency(pricing?.unitPrice || 0)}</span>
                 </div>
               )}
               {selectedCandy && (
                 <div className="flex justify-between text-gray-700">
                   <span>{candyOptions.find(c => c.id === selectedCandy)?.name}</span>
                   <span>{formatCurrency(pricing?.candyUnitPrice || 0)}</span>
                 </div>
               )}
               {customMessage.trim() && (
                 <div className="flex justify-between text-gray-700">
                   <span>Custom Message</span>
                   <span>{formatCurrency(pricing?.messageUnitPrice || 0)}</span>
                 </div>
               )}
               
               {/* Quantity Selector */}
               <div className="flex items-center justify-between text-gray-700">
                 <span>Quantity</span>
                 <div className="flex items-center space-x-3">
                   <NeumorphicButton
                     variant="default"
                     onClick={() => setQuantity(Math.max(1, quantity - 1))}
                     className="w-8 h-8 text-sm"
                   >
                     -
                   </NeumorphicButton>
                   <span className="text-lg font-medium text-gray-900 min-w-[2rem] text-center">{quantity}</span>
                   <NeumorphicButton
                     variant="default"
                     onClick={() => setQuantity(quantity + 1)}
                     className="w-8 h-8 text-sm"
                   >
                     +
                   </NeumorphicButton>
                 </div>
               </div>

               {/* Bulk Savings Info */}
               {getBulkSavingsInfo() && (
                 <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                   <div className="text-sm text-green-800 font-medium">
                     🎉 {getBulkSavingsInfo().description}
                   </div>
                 </div>
               )}

               {/* Pricing Tier Info */}
               {pricing?.tier && (
                 <div className="text-xs text-gray-500 text-center">
                   {pricing.tier.description}
                 </div>
               )}
               
              <hr className="border-white/20" />
              <div className="flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(pricing?.totalAmount || 0)}</span>
              </div>
              
              <button
                onClick={handlePurchase}
                disabled={!selectedDesign || isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Purchase Tin Skinz'}
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default TinSkinzMarketplace;
