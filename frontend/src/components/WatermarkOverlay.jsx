import React from 'react';

const WatermarkOverlay = ({ 
  type = 'custom', 
  opacity = 0.2, 
  size = '200px',
  position = 'repeat',
  customText = 'BuyPrintz'
}) => {
  if (type === 'custom') {
    return (
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url('/assets/images/BuyPrintz_Watermark_1200px_72dpi.png')`,
          backgroundSize: size,
          backgroundRepeat: position,
          backgroundPosition: '0 0',
          mixBlendMode: 'overlay',
          opacity: opacity
        }}
      />
    );
  }

  if (type === 'text') {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(0,0,0,0.1) 10px,
              rgba(0,0,0,0.1) 20px
            )`,
            opacity: opacity
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="text-gray-400 font-bold text-2xl transform -rotate-12"
            style={{ opacity: opacity * 2 }}
          >
            {customText}
          </div>
        </div>
      </div>
    );
  }

  if (type === 'diagonal') {
    return (
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(0,0,0,0.05) 20px,
            rgba(0,0,0,0.05) 40px
          )`,
          opacity: opacity
        }}
      />
    );
  }

  return null;
};

export default WatermarkOverlay;
