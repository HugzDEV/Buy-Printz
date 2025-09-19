import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from './ui';

const TinSkinzDemo = () => {
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [customMessage, setCustomMessage] = useState('');

  // Demo designs
  const demoDesigns = [
    {
      id: 'abstract-1',
      name: 'Abstract 1',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 1_Front.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 1_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'abstract-2',
      name: 'Abstract 2',
      thumbnailUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 2_Front.png',
      designUrl: '/assets/tin-skinz/designs/Abstract Art/Abstract 2_Double.png',
      category: 'abstract-art',
       price: 9.99
    },
    {
      id: 'cancer',
      name: 'Cancer',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/1_Cancer_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'leo',
      name: 'Leo',
      thumbnailUrl: '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Front.png',
      designUrl: '/assets/tin-skinz/designs/Zodiac Final/5_Leo_Double_Both.png',
      category: 'zodiac',
       price: 9.99
    },
    {
      id: 'cat',
      name: 'Cat',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/6_Cat_Front.png',
      designUrl: '/assets/tin-skinz/designs/Animals/6_Cat_Double_Both.png',
      category: 'animals',
       price: 9.99
    },
    {
      id: 'butterfly',
      name: 'Butterfly',
      thumbnailUrl: '/assets/tin-skinz/designs/Animals/5_Butterfly_Front.png',
      designUrl: '/assets/tin-skinz/designs/Animals/5_Butterfly_Double_Both.png',
      category: 'animals',
       price: 9.99
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          {/* Tin Skinz Logo */}
          <div className="mb-6 flex justify-center">
            <img 
              src="/assets/tin-skinz/Tin Skinz_logo_full color_Secondary logo.png" 
              alt="Tin Skinz Logo" 
              className="h-28 w-auto"
            />
          </div>
          
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            This is a demonstration of the Tin Skinz mockup system. 
            The system uses Konva.js for real-time design previews with masking. 
            You can also use our <a href="/editor?product=tin" className="text-yellow-500 font-semibold hover:underline">full editor</a>.
          </p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Design Selection */}
        <div className="space-y-6">
           <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Select Design</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {demoDesigns.map((design) => (
                <div
                  key={design.id}
                  className={`cursor-pointer rounded-xl p-2 transition-all duration-300 ${
                    selectedDesign?.id === design.id
                      ? 'shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(0,0,0,0.1)] bg-yellow-100 border-2 border-yellow-500/30'
                      : 'shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(0,0,0,0.1)] bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={() => setSelectedDesign(design)}
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
                      <span className="text-gray-600 text-xs font-medium">{design.name}</span>
                    </div>
                  </div>
                  <h3 className="font-medium text-xs text-gray-900 truncate">{design.name}</h3>
                  <p className="text-yellow-600 font-bold text-xs">${design.price}</p>
                </div>
              ))}
            </div>
          </div>

           <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Custom Message</h3>
            </div>
            <input
              type="text"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Enter your custom message..."
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent transition-all duration-200"
              maxLength={50}
            />
            <p className="text-sm text-gray-500 mt-1">
              {customMessage.length}/50 characters
            </p>
          </div>
        </div>

        {/* Right Column: Mockup Preview */}
        <div className="space-y-6">
           <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">Live Preview</h3>
            </div>
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="w-80 h-80 rounded-3xl shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(0,0,0,0.1)] bg-gray-100 flex items-center justify-center">
                {selectedDesign ? (
                  <div className="text-center">
                    <div className="w-32 h-40 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-xs text-gray-600">Tin Spine View</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{selectedDesign.name}</p>
                    {customMessage && (
                      <p className="text-xs text-gray-500">"{customMessage}"</p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <div className="w-32 h-40 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
                      <span className="text-xs">Select a design</span>
                    </div>
                    <p className="text-sm">Choose a design to see the live preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>

           <div className="backdrop-blur-md bg-gradient-to-br from-amber-50/90 to-yellow-50/90 border border-amber-200/50 shadow-xl rounded-3xl p-4 sm:p-6">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 text-lg">How It Works</h3>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <h4 className="font-medium text-gray-900 mb-2">1. Tin Spine Asset</h4>
                <p>Fixed-position tin showing both front and back surfaces simultaneously</p>
              </div>
              
              <div className="text-sm text-gray-600">
                <h4 className="font-medium text-gray-900 mb-2">2. Masking System</h4>
                <p>Cut-out areas are masked to show designs only on the tin surfaces</p>
              </div>
              
              <div className="text-sm text-gray-600">
                <h4 className="font-medium text-gray-900 mb-2">3. Real-Time Updates</h4>
                <p>Konva.js provides instant preview when cycling through designs</p>
              </div>
              
              <div className="text-sm text-gray-600">
                <h4 className="font-medium text-gray-900 mb-2">4. Fixed 1200x1200 Canvas</h4>
                <p>Perfect masking alignment with consistent sizing across all assets</p>
              </div>
            </div>
          </div>
        </div>
      </div>

        <div className="mt-8 text-center">
           <button 
             onClick={() => window.open('/tin-skinz', '_blank')}
             className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mx-auto"
           >
            View Full Tin Skinz Marketplace
          </button>
        </div>
      </div>
    </div>
  );
};

export default TinSkinzDemo;
