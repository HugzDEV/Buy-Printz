import React, { useState } from 'react';
import WatermarkOverlay from './WatermarkOverlay';

const ProtectedImage = ({ 
  src, 
  alt, 
  className = '', 
  watermark = true, 
  watermarkText = 'BuyPrintz',
  watermarkPosition = 'bottom-right',
  watermarkType = 'custom',
  watermarkOpacity = 0.2,
  isPreview = true,
  highResSrc = null,
  onUpgrade = null,
  ...props 
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const handleContextMenu = (e) => {
    e.preventDefault();
    return false;
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    return false;
  };

  const handleSelectStart = (e) => {
    e.preventDefault();
    return false;
  };

  const getWatermarkPosition = () => {
    switch (watermarkPosition) {
      case 'bottom-left':
        return 'bottom-2 left-2';
      case 'top-right':
        return 'top-2 right-2';
      case 'top-left':
        return 'top-2 left-2';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'bottom-2 right-2';
    }
  };

  return (
    <div className="relative overflow-hidden group">
      <img
        src={src}
        alt={alt}
        className={`select-none pointer-events-none ${className} transition-all duration-300`}
        draggable="false"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onSelectStart={handleSelectStart}
        onLoad={() => setImageLoaded(true)}
        {...props}
      />
      
      {/* Watermark */}
      {watermark && (
        <WatermarkOverlay 
          type={watermarkType}
          opacity={watermarkOpacity}
          customText={watermarkText}
        />
      )}
      
      {/* Upgrade prompt for high-res - only show on hover for previews */}
      {isPreview && highResSrc && onUpgrade && (
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={onUpgrade}
            className="bg-buyprint-brand hover:bg-buyprint-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 shadow-lg"
          >
            Purchase for High-Res
          </button>
        </div>
      )}
    </div>
  );
};

export default ProtectedImage;
