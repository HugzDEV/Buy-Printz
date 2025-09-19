import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, NeumorphicButton } from './ui';
import TinSkinzMockupViewer from './TinSkinzMockupViewer';
import { calculateTinSkinzPricing, getPricingBreakdown, formatCurrency, getBulkSavings, CANDY_OPTIONS, calculateCandyPricing } from '../utils/tinSkinzPricing';
import { useStripe } from '@stripe/react-stripe-js';

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
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('abstract-art');
  const [selectedDesigns, setSelectedDesigns] = useState({}); // { designId: { design, quantity, candyId, customMessage } }
  const [selectedDesign, setSelectedDesign] = useState(null); // For live preview
  const [isLoading, setIsLoading] = useState(false);
  const [pricing, setPricing] = useState(null);
  const stripe = useStripe();

  const currentDesigns = tinSkinzDesigns[selectedCategory] || [];

  // Restore selections from URL parameters (when coming back from checkout)
  useEffect(() => {
    const selectedDesignsParam = searchParams.get('selected_designs');
    if (selectedDesignsParam) {
      try {
        const restoredDesigns = JSON.parse(selectedDesignsParam);
        const restoredSelections = {};
        
        // Convert the array format back to object format
        restoredDesigns.forEach(item => {
          // Find the design object from all categories
          let design = null;
          for (const category in tinSkinzDesigns) {
            design = tinSkinzDesigns[category].find(d => d.id === item.design_id);
            if (design) {
              setSelectedCategory(category); // Set the correct category
              break;
            }
          }
          
          if (design) {
            restoredSelections[design.id] = {
              design,
              quantity: item.quantity,
              candyId: item.candy_id || null,
              customMessage: item.custom_message || null
            };
          }
        });
        
        setSelectedDesigns(restoredSelections);
        
        // Set the first restored design as preview
        if (restoredDesigns.length > 0) {
          const firstDesign = tinSkinzDesigns[selectedCategory].find(d => d.id === restoredDesigns[0].design_id);
          if (firstDesign) {
            setSelectedDesign(firstDesign);
          }
        }
        
        // Clean up URL parameters after restoring
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      } catch (error) {
        console.error('Error restoring selections from URL:', error);
      }
    }
  }, [searchParams]);

  // Set first design as preview when category changes
  useEffect(() => {
    if (currentDesigns.length > 0 && !selectedDesign) {
      setSelectedDesign(currentDesigns[0]);
    }
  }, [selectedCategory, currentDesigns, selectedDesign]);


  // Calculate total quantity and pricing whenever relevant values change
  useEffect(() => {
    const totalQuantity = Object.values(selectedDesigns).reduce((sum, item) => sum + item.quantity, 0);
    
    if (totalQuantity > 0) {
      const hasCustomMessage = Object.values(selectedDesigns).some(item => item.customMessage && item.customMessage.trim() !== '');
      
      try {
        // Calculate base tin pricing (no candy in base calculation)
        const calculatedPricing = calculateTinSkinzPricing(totalQuantity, false, hasCustomMessage);
        
        // Add candy costs per design with bulk discounts based on total quantity
        let totalCandyCost = 0;
        Object.values(selectedDesigns).forEach(item => {
          if (item.candyId && item.quantity > 0) {
            // Use total quantity for discount calculation, but apply to individual design quantity
            const candyPricing = calculateCandyPricing(item.candyId, totalQuantity);
            const candyCostForThisDesign = candyPricing.unitPrice * item.quantity;
            totalCandyCost += candyCostForThisDesign;
          }
        });
        
        // Update pricing with candy costs
        const finalPricing = {
          ...calculatedPricing,
          subtotal: calculatedPricing.subtotal + totalCandyCost,
          taxAmount: (calculatedPricing.subtotal + totalCandyCost) * 0.0625, // 6.25% MA tax
          totalAmount: calculatedPricing.subtotal + totalCandyCost + ((calculatedPricing.subtotal + totalCandyCost) * 0.0625)
        };
        
        setPricing(finalPricing);
      } catch (error) {
        console.error('Error calculating pricing:', error);
        setPricing(null);
      }
    } else {
      setPricing(null);
    }
  }, [selectedDesigns]);

  const handleQuantityChange = (design, newQuantity) => {
    setSelectedDesigns(prev => {
      const updated = { ...prev };
      
      if (newQuantity <= 0) {
        delete updated[design.id];
      } else {
        updated[design.id] = { 
          design, 
          quantity: newQuantity, 
          candyId: updated[design.id]?.candyId || '' // Preserve existing candy selection
        };
      }
      
      return updated;
    });
  };

  const handleCandyChange = (design, candyId) => {
    setSelectedDesigns(prev => {
      const updated = { ...prev };
      
      if (updated[design.id]) {
        updated[design.id] = { 
          ...updated[design.id], 
          candyId 
        };
      }
      
      return updated;
    });
  };

  const handleCustomMessageChange = (design, message) => {
    setSelectedDesigns(prev => {
      const updated = { ...prev };
      
      if (updated[design.id]) {
        updated[design.id] = { 
          ...updated[design.id], 
          customMessage: message.trim() || null
        };
      }
      
      return updated;
    });
  };

  const getTotalQuantity = () => {
    return Object.values(selectedDesigns).reduce((sum, item) => sum + item.quantity, 0);
  };

  const getBulkSavingsInfo = () => {
    const totalQuantity = getTotalQuantity();
    if (!pricing || totalQuantity < 3) return null;
    return getBulkSavings(totalQuantity);
  };

  const handlePurchase = async () => {
    const totalQuantity = getTotalQuantity();
    
    if (totalQuantity === 0) {
      alert('Please select at least one design with quantity');
      return;
    }

    if (!pricing) {
      alert('Unable to calculate pricing. Please try again.');
      return;
    }

    // Prepare order data for checkout with multiple designs and candy selections
    const orderData = {
      selected_designs: Object.values(selectedDesigns).map(item => ({
        design_id: item.design.id,
        design_name: item.design.name,
        design_thumbnail: item.design.thumbnailUrl,
        quantity: item.quantity,
        candy_id: item.candyId || null,
        candy_name: item.candyId ? CANDY_OPTIONS.find(c => c.id === item.candyId)?.name : null,
        custom_message: item.customMessage || null
      })),
      total_quantity: totalQuantity,
      pricing: {
        unit_price: pricing.unitPrice,
        message_unit_price: pricing.messageUnitPrice,
        subtotal: pricing.subtotal,
        tax_amount: pricing.taxAmount,
        total_amount: pricing.totalAmount
      }
    };

    // Navigate to checkout with order data
    const params = new URLSearchParams();
    params.set('selected_designs', JSON.stringify(orderData.selected_designs));
    params.set('custom_message', orderData.custom_message || '');
    params.set('total_quantity', orderData.total_quantity.toString());
    params.set('pricing', JSON.stringify(orderData.pricing));
    
    const checkoutUrl = `/tin-skinz/checkout?${params.toString()}`;
    console.log('TinSkinzMarketplace - Navigating to checkout:', {
      orderData,
      checkoutUrl,
      params: Object.fromEntries(params.entries())
    });
    
    window.location.href = checkoutUrl;
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
          
           <p className="text-xl text-white/90 max-w-2xl mx-auto">
             Pre-designed tins filled with candy for every occasion. Perfect for weddings, 
             birthdays, holidays, and special events. Customize with your own message or use our <a href="/editor?product=tin" className="text-yellow-500 font-semibold hover:underline">full editor</a>.
           </p>
        </div>

      <div className="space-y-8">
        {/* Design Selection Section */}
        <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-6">
          {/* Category Selection */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 text-lg mb-3">Choose Category</h3>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full max-w-xs px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent transition-all duration-200"
            >
              <option value="abstract-art">Abstract Art</option>
              <option value="zodiac">Zodiac Signs</option>
              <option value="animals">Animals</option>
            </select>
          </div>

          {/* Design Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 text-lg mb-3">Select Designs & Quantities</h3>
            <p className="text-sm text-gray-600 mb-4">Choose multiple designs and quantities to get bulk discounts</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {currentDesigns.map((design) => {
                const selectedItem = selectedDesigns[design.id];
                const quantity = selectedItem?.quantity || 0;
                const candyId = selectedItem?.candyId || '';
                
                return (
                  <div
                    key={design.id}
                    className={`rounded-xl p-4 transition-all duration-300 cursor-pointer ${
                      quantity > 0
                        ? 'shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(0,0,0,0.1)] bg-yellow-100 border-2 border-yellow-500/30'
                        : selectedDesign?.id === design.id
                        ? 'shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(0,0,0,0.1)] bg-blue-100 border-2 border-blue-500/30'
                        : 'shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(0,0,0,0.1)] bg-gray-100 hover:bg-gray-200'
                    }`}
                    onClick={() => {
                      // Set as selected design for live preview
                      setSelectedDesign(design);
                    }}
                  >
                    <div className="aspect-square bg-gradient-to-br from-amber-100/40 to-yellow-100/40 rounded-lg mb-3 flex items-center justify-center overflow-hidden shadow-inner">
                      <img 
                        src={design.thumbnailUrl} 
                        alt={design.name}
                        className="w-full h-full object-cover object-center"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full flex items-center justify-center" style={{ display: 'none' }}>
                        <span className="text-gray-500 text-xs">Preview</span>
                      </div>
                    </div>
                    
                    <h3 className="font-medium text-sm text-gray-900 truncate text-center mb-2">{design.name}</h3>
                    <p className="text-yellow-600 font-bold text-sm text-center mb-3">${design.price}</p>
                    
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-center space-x-2 mb-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(design, Math.max(0, quantity - 1));
                        }}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
                        disabled={quantity <= 0}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      
                      <span className="w-8 text-center font-medium text-gray-900 text-sm">{quantity}</span>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuantityChange(design, quantity + 1);
                        }}
                        className="w-8 h-8 rounded-full bg-yellow-500 hover:bg-yellow-600 flex items-center justify-center text-white transition-colors duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </div>

                    {/* Candy Selection Dropdown */}
                    {quantity > 0 && (
                      <div className="mb-1">
                        <select
                          value={candyId}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCandyChange(design, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-2 text-sm bg-white/20 border border-white/30 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        >
                          <option value="">No Candy</option>
                          {CANDY_OPTIONS.map((candy) => (
                            <option key={candy.id} value={candy.id}>
                              {candy.name} (+${candy.price.toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Custom Message Input */}
                    {quantity > 0 && (
                      <div className="mb-1">
                        <input
                          type="text"
                          placeholder="Custom message..."
                          value={selectedItem?.customMessage || ''}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleCustomMessageChange(design, e.target.value);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full px-2 py-2 text-sm bg-white/20 border border-white/30 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-yellow-500 focus:border-transparent transition-all duration-200"
                        />
                      </div>
                    )}
                    
                    {quantity > 0 && (
                      <div className="text-center">
                        <span className="text-xs text-gray-600">
                          Total: {formatCurrency(design.price * quantity)}
                          {candyId && (
                            <span className="block text-green-600 text-xs">
                              + Candy: {formatCurrency(calculateCandyPricing(candyId, getTotalQuantity()).unitPrice * quantity)}
                              {calculateCandyPricing(candyId, getTotalQuantity()).discountPercent > 0 && (
                                <span className="block text-xs text-green-500">
                                  ({calculateCandyPricing(candyId, getTotalQuantity()).discountPercent}% off)
                                </span>
                              )}
                            </span>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Section: Live Preview and Order Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
           <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Live Preview</h3>
            </div>
            <div className="flex items-center justify-center min-h-[400px]">
              <TinSkinzMockupViewer
                selectedDesign={selectedDesign}
                customMessage={Object.values(selectedDesigns)[0]?.customMessage || ''}
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
               {Object.keys(selectedDesigns).length > 0 ? (
                 <>
                   {/* Selected Designs */}
                   {Object.values(selectedDesigns).map((item) => {
                     const candy = item.candyId ? CANDY_OPTIONS.find(c => c.id === item.candyId) : null;
                     const candyPricing = item.candyId ? calculateCandyPricing(item.candyId, getTotalQuantity()) : null;
                     const candyCostForThisDesign = candyPricing ? candyPricing.unitPrice * item.quantity : 0;
                     
                     return (
                       <div key={item.design.id} className="space-y-1">
                         <div className="flex justify-between text-gray-700">
                           <span>{item.design.name} ({item.quantity} × {formatCurrency(pricing?.unitPrice || 0)})</span>
                           <span>{formatCurrency((pricing?.unitPrice || 0) * item.quantity)}</span>
                         </div>
                         {candy && candyPricing && (
                           <div className="flex justify-between text-gray-600 text-sm ml-4">
                             <span>
                               + {candy.name} ({item.quantity} × {formatCurrency(candyPricing.unitPrice)})
                               {candyPricing.discountPercent > 0 && (
                                 <span className="text-green-600 ml-1">({candyPricing.discountPercent}% off)</span>
                               )}
                             </span>
                             <span>{formatCurrency(candyCostForThisDesign)}</span>
                           </div>
                         )}
                         {item.customMessage && (
                           <div className="flex justify-between text-gray-600 text-sm ml-4">
                             <span>Custom Message: "{item.customMessage}"</span>
                             <span className="text-xs text-gray-500">+ {formatCurrency((pricing?.messageUnitPrice || 0) * item.quantity)}</span>
                           </div>
                         )}
                       </div>
                     );
                   })}


                   {/* Quantity Discount Info */}
                   {getTotalQuantity() >= 3 && (
                     <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                       <div className="text-sm text-blue-800 font-medium">
                         💰 Bulk Discount Applied - {pricing?.tier?.description}
                       </div>
                     </div>
                   )}


                   {/* Subtotal */}
                   <div className="flex justify-between text-gray-700 border-t border-gray-200 pt-2">
                     <span>Subtotal</span>
                     <span>{formatCurrency(pricing?.subtotal || 0)}</span>
                   </div>

                  {/* Tax */}
                  <div className="flex justify-between text-gray-700">
                    <span>Tax (6.25%)</span>
                    <span>{formatCurrency(pricing?.taxAmount || 0)}</span>
                  </div>
                 </>
               ) : (
                 <div className="text-center text-gray-500 py-8">
                   <p>Select designs and quantities to see pricing</p>
                 </div>
               )}
               
              <hr className="border-white/20" />
              <div className="flex justify-between font-bold text-lg text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(pricing?.totalAmount || 0)}</span>
              </div>
              
              <button
                onClick={handlePurchase}
                disabled={Object.keys(selectedDesigns).length === 0 || isLoading}
                className="w-full px-4 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Processing...' : 'Continue to Checkout'}
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
