// Tin Skinz Configuration
// Fixed 1200x1200 canvas for perfect masking and consistent sizing

export const TIN_SKINZ_CONFIG = {
  // Fixed canvas dimensions
  CANVAS_SIZE: 1200,
  
  // Asset paths
  ASSETS: {
    TIN_SPINE: '/assets/tin-skinz/tin-frames/Vertical_Frame.png',
    FRONT_MASK: '/assets/tin-skinz/tin-frames/Vertical_Frame_Panels.png',
    BACK_MASK: '/assets/tin-skinz/tin-frames/Vertical_Frame_Panels.png' // Same mask for both front and back
  },
  
  // Positioning for 1200x1200 canvas
  POSITIONS: {
    TIN_SPINE: {
      x: 0,
      y: 0,
      width: 1200,
      height: 1200
    },
    CUSTOM_MESSAGE: {
      x: 600,  // Center of canvas
      y: 800,  // Bottom area for text
      fontSize: 48,  // Scaled for 1200x1200 canvas
      fontFamily: 'Arial',
      fill: '#000000'
    }
  },
  
  // Display scaling options
  DISPLAY_SIZES: {
    SMALL: { width: 300, height: 300 },
    MEDIUM: { width: 400, height: 400 },
    LARGE: { width: 600, height: 600 }
  },
  
  // Export settings
  EXPORT: {
    pixelRatio: 1,  // Full 1200x1200 resolution
    mimeType: 'image/png'
  }
};

// Helper function to get scaled positions for display
export const getScaledPositions = (displayWidth, displayHeight) => {
  const scaleX = displayWidth / TIN_SKINZ_CONFIG.CANVAS_SIZE;
  const scaleY = displayHeight / TIN_SKINZ_CONFIG.CANVAS_SIZE;
  
  return {
    tinSpine: {
      ...TIN_SKINZ_CONFIG.POSITIONS.TIN_SPINE,
      scaleX,
      scaleY
    },
    customMessage: {
      ...TIN_SKINZ_CONFIG.POSITIONS.CUSTOM_MESSAGE,
      fontSize: TIN_SKINZ_CONFIG.POSITIONS.CUSTOM_MESSAGE.fontSize * Math.min(scaleX, scaleY)
    }
  };
};
