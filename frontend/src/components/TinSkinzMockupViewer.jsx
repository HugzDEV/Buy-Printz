import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Image, Text } from 'react-konva';
import useImage from 'use-image';
import { TIN_SKINZ_CONFIG, getScaledPositions } from '../config/tinSkinzConfig';

const TinSkinzMockupViewer = ({ 
  selectedDesign, 
  customMessage, 
  displayWidth = 400,
  displayHeight = 400 
}) => {
  const stageRef = useRef();
  const [tinSpineImage] = useImage(TIN_SKINZ_CONFIG.ASSETS.TIN_SPINE);
  const [defaultPanelsImage] = useImage(TIN_SKINZ_CONFIG.ASSETS.FRONT_MASK); // Default panels
  const [selectedDesignImage] = useImage(selectedDesign?.designUrl || '');
  
  // Get scaled positions for display
  const mockupConfig = getScaledPositions(displayWidth, displayHeight);

  // Determine which design to show: selected design or default panels
  const currentDesignImage = selectedDesignImage || defaultPanelsImage;

  return (
    <div className="tin-skinz-mockup-container flex items-center justify-center">
      <div className="relative">
        <Stage
          ref={stageRef}
          width={TIN_SKINZ_CONFIG.CANVAS_SIZE}
          height={TIN_SKINZ_CONFIG.CANVAS_SIZE}
          scaleX={displayWidth / TIN_SKINZ_CONFIG.CANVAS_SIZE}
          scaleY={displayHeight / TIN_SKINZ_CONFIG.CANVAS_SIZE}
          className="rounded-3xl shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(0,0,0,0.1)] bg-gray-100"
          style={{ 
            width: displayWidth, 
            height: displayHeight,
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
        <Layer>
          {/* Tin Spine Base Asset */}
          {tinSpineImage && (
            <Image
              image={tinSpineImage}
              x={mockupConfig.tinSpine.x}
              y={mockupConfig.tinSpine.y}
              width={mockupConfig.tinSpine.width}
              height={mockupConfig.tinSpine.height}
            />
          )}

          {/* Design Panels - Either selected design or default panels */}
          {/* Both images are 1200x1200 and overlay perfectly */}
          {currentDesignImage && (
            <Image
              image={currentDesignImage}
              x={mockupConfig.tinSpine.x}
              y={mockupConfig.tinSpine.y}
              width={mockupConfig.tinSpine.width}
              height={mockupConfig.tinSpine.height}
            />
          )}

          {/* Custom Message Text */}
          {customMessage && (
            <Text
              text={customMessage}
              x={mockupConfig.customMessage.x}
              y={mockupConfig.customMessage.y}
              fontSize={mockupConfig.customMessage.fontSize}
              fontFamily={mockupConfig.customMessage.fontFamily}
              fill={mockupConfig.customMessage.fill}
              align="center"
            />
          )}
        </Layer>
        </Stage>
      </div>
    </div>
  );
};

export default TinSkinzMockupViewer;