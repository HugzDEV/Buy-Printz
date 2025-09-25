import React from 'react';

const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  loading = 'lazy',
  width,
  height,
  priority = false,
  sizes = '100vw'
}) => {
  // Generate WebP and AVIF versions (these are now available)
  const getOptimizedSrc = (originalSrc, format) => {
    const baseName = originalSrc.replace(/\.[^/.]+$/, '');
    return `${baseName}.${format}`;
  };

  // Check if browser supports modern formats
  const supportsWebP = () => {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  };

  const supportsAVIF = () => {
    if (typeof window === 'undefined') return false;
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
  };

  // Generate responsive srcset
  const generateSrcSet = (baseSrc, format) => {
    const baseName = baseSrc.replace(/\.[^/.]+$/, '');
    return `${baseName}.${format} 1x, ${baseName}@2x.${format} 2x`;
  };

  return (
    <picture>
      {/* AVIF format (best compression) - now available */}
      <source 
        srcSet={getOptimizedSrc(src, 'avif')} 
        type="image/avif"
        sizes={sizes}
      />
      
      {/* Fallback to original format */}
      <img
        src={src}
        alt={alt}
        className={className}
        loading={priority ? 'eager' : loading}
        width={width}
        height={height}
        sizes={sizes}
        decoding="async"
      />
    </picture>
  );
};

export default OptimizedImage;
