import React from 'react';

const ProtectedImage = ({ 
  src, 
  alt, 
  className = '', 
  watermark = true, 
  watermarkText = 'BuyPrintz',
  watermarkPosition = 'bottom-right',
  ...props 
}) => {
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
    <div className="relative overflow-hidden">
      <img
        src={src}
        alt={alt}
        className={`select-none pointer-events-none ${className}`}
        draggable="false"
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
        onSelectStart={handleSelectStart}
        {...props}
      />
      {watermark && (
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none">
          <div className={`absolute ${getWatermarkPosition()} text-white/60 text-xs font-medium bg-black/30 px-2 py-1 rounded backdrop-blur-sm`}>
            {watermarkText}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProtectedImage;
