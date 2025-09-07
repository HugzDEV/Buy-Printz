import React from 'react';
import { Editor, getProduct, calculatePricing } from '@buyprintz/canvas-sdk';

// Basic Banner Editor Example
export const BannerEditorExample: React.FC = () => {
  const handleSave = (design: any) => {
    console.log('Banner design saved:', design);
  };

  const handleExport = (design: any) => {
    console.log('Banner design exported:', design);
  };

  const handleElementSelect = (element: any) => {
    console.log('Element selected:', element);
  };

  return (
    <div className="h-screen">
      <Editor
        productType="banner"
        canvasSize={{ width: 800, height: 400 }}
        backgroundColor="#ffffff"
        onSave={handleSave}
        onExport={handleExport}
        onElementSelect={handleElementSelect}
        showGrid={true}
        showGuides={true}
      />
    </div>
  );
};

// Business Card Tin Editor Example
export const TinEditorExample: React.FC = () => {
  const handleSave = (design: any) => {
    console.log('Tin design saved:', design);
  };

  const handleExport = (design: any) => {
    console.log('Tin design exported:', design);
  };

  return (
    <div className="h-screen">
      <Editor
        productType="tin"
        canvasSize={{ width: 350, height: 250 }}
        backgroundColor="#ffffff"
        onSave={handleSave}
        onExport={handleExport}
        showGrid={true}
        showGuides={true}
      />
    </div>
  );
};

// Tradeshow Tent Editor Example
export const TentEditorExample: React.FC = () => {
  const handleSave = (design: any) => {
    console.log('Tent design saved:', design);
  };

  const handleExport = (design: any) => {
    console.log('Tent design exported:', design);
  };

  return (
    <div className="h-screen">
      <Editor
        productType="tent"
        canvasSize={{ width: 1200, height: 1200 }}
        backgroundColor="#ffffff"
        onSave={handleSave}
        onExport={handleExport}
        showGrid={true}
        showGuides={true}
      />
    </div>
  );
};

// Product Information Example
export const ProductInfoExample: React.FC = () => {
  const bannerProduct = getProduct('banner');
  const tinProduct = getProduct('business-card-tin');
  const tentProduct = getProduct('tradeshow-tent');

  const tinPrice = calculatePricing({
    productType: 'tin',
    quantity: 250,
    surfaceCoverage: 'all-sides',
    finish: 'gold'
  });

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Product Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">{bannerProduct?.name}</h3>
          <p className="text-sm text-gray-600">{bannerProduct?.description}</p>
          <p className="text-sm">Default Size: {bannerProduct?.defaultSize.width} × {bannerProduct?.defaultSize.height}px</p>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">{tinProduct?.name}</h3>
          <p className="text-sm text-gray-600">{tinProduct?.description}</p>
          <p className="text-sm">Default Size: {tinProduct?.defaultSize.width} × {tinProduct?.defaultSize.height}px</p>
        </div>

        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold">{tentProduct?.name}</h3>
          <p className="text-sm text-gray-600">{tentProduct?.description}</p>
          <p className="text-sm">Default Size: {tentProduct?.defaultSize.width} × {tentProduct?.defaultSize.height}px</p>
        </div>
      </div>

      <div className="p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900">Pricing Example</h3>
        <p className="text-blue-800">
          Business Card Tin (250 units, all sides, gold finish): ${tinPrice}
        </p>
      </div>
    </div>
  );
};

// Custom Template Example
export const CustomTemplateExample: React.FC = () => {
  const customTemplates = [
    {
      id: 'custom-1',
      name: 'My Custom Banner',
      category: 'Custom',
      description: 'A custom banner template',
      thumbnail: '/path/to/thumbnail.png',
      canvasData: {
        elements: [
          {
            id: 'text-1',
            type: 'text',
            x: 100,
            y: 100,
            width: 200,
            height: 'auto',
            text: 'Custom Text',
            fontSize: 32,
            fontFamily: 'Arial',
            fill: '#000000'
          }
        ],
        canvasSize: { width: 800, height: 400 },
        backgroundColor: '#ffffff'
      },
      productType: 'banner',
      tags: ['custom', 'banner'],
      isPublic: false
    }
  ];

  return (
    <div className="h-screen">
      <Editor
        productType="banner"
        canvasSize={{ width: 800, height: 400 }}
        backgroundColor="#ffffff"
        templates={customTemplates}
        onSave={(design) => console.log('Saved:', design)}
        onExport={(design) => console.log('Exported:', design)}
      />
    </div>
  );
};

export default BannerEditorExample;
