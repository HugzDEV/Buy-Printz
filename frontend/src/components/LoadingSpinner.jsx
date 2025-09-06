import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  className = '',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-2 ${className}`}>
      <Loader2 className={`${sizeClasses[size]} animate-spin text-blue-600`} />
      {showText && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {text}
        </p>
      )}
    </div>
  )
}

// Skeleton loader for cards
export const SkeletonCard = ({ className = '' }) => (
  <div className={`backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl animate-pulse ${className}`}>
    <div className="flex items-center justify-between mb-4">
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
  </div>
)

// Skeleton loader for template cards
export const SkeletonTemplateCard = ({ className = '' }) => (
  <div className={`backdrop-blur-xl bg-white/20 rounded-2xl p-4 border border-white/30 shadow-xl animate-pulse ${className}`}>
    <div className="aspect-video bg-gray-200 rounded-xl mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      <div className="flex justify-between items-center mt-3">
        <div className="h-6 bg-gray-200 rounded w-16"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
)

// Loading overlay
export const LoadingOverlay = ({ isVisible, text = 'Loading...' }) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="backdrop-blur-xl bg-white/95 rounded-2xl p-8 border border-white/30 shadow-2xl">
        <LoadingSpinner size="xl" text={text} />
      </div>
    </div>
  )
}

export default LoadingSpinner
