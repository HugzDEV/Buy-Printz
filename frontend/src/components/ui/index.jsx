// Simple UI components for the print preview modal
import React from 'react'

// Dialog components
export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[98vh] sm:max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export const DialogContent = ({ className = '', children }) => (
  <div className={`overflow-y-auto flex-1 ${className}`}>
    {children}
  </div>
)

export const DialogHeader = ({ children }) => (
  <div className="p-4 sm:p-6 border-b flex-shrink-0">
    {children}
  </div>
)

export const DialogTitle = ({ children, className = '' }) => (
  <h2 className={`text-lg sm:text-xl font-semibold ${className}`}>
    {children}
  </h2>
)

export const DialogFooter = ({ children, className = '' }) => (
  <div className={`p-4 sm:p-6 border-t bg-gray-50 flex justify-end gap-2 flex-shrink-0 ${className}`}>
    {children}
  </div>
)

// Card components
export const Card = ({ children, className = '' }) => (
  <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
    {children}
  </div>
)

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-3 sm:p-6 ${className}`}>
    {children}
  </div>
)

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-3 sm:p-6 pb-2 sm:pb-3 ${className}`}>
    {children}
  </div>
)

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`font-semibold text-sm sm:text-base ${className}`}>
    {children}
  </h3>
)

// Other components
export const Button = ({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'default', 
  className = '',
  ...props 
}) => {
  const baseClasses = 'px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700 bg-white'
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export const Separator = ({ className = '' }) => (
  <div className={`border-t border-gray-200 ${className}`} />
)

export const Alert = ({ children, className = '', variant = 'default' }) => {
  const variants = {
    default: 'border border-blue-200 bg-blue-50',
    success: 'border border-green-200 bg-green-50',
    warning: 'border border-amber-200 bg-amber-50',
    error: 'border border-red-200 bg-red-50'
  }
  
  return (
    <div className={`rounded-lg p-3 sm:p-4 ${variants[variant]} ${className}`}>
      {children}
    </div>
  )
}

export const AlertDescription = ({ children, className = '' }) => (
  <div className={`text-sm text-gray-800 ${className}`}>
    {children}
  </div>
)

// Glass UI Components
export const GlassButton = ({ children, onClick, className = "", variant = "default", disabled = false }) => {
  const variants = {
    default: "bg-white/20 hover:bg-white/30 text-gray-700 border-white/30",
    primary: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 border-blue-400/30",
    success: "bg-green-500/20 hover:bg-green-500/30 text-green-700 border-green-400/30",
    danger: "bg-red-500/20 hover:bg-red-500/30 text-red-700 border-red-400/30"
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
        backdrop-blur-sm
        border
        rounded-xl
        p-3
        font-medium
        transition-all duration-200
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {children}
    </button>
  )
}

export const GlassCard = ({ children, className = "" }) => (
  <div className={`
    backdrop-blur-xl bg-white/10 
    border border-white/20 
    rounded-2xl 
    shadow-[0_8px_32px_rgba(0,0,0,0.1)]
    p-4
    ${className}
  `}>
    {children}
  </div>
)

export const GlassPanel = ({ children, className = "" }) => (
  <div className={`
    backdrop-blur-xl bg-white/10 
    border border-white/20 
    rounded-2xl 
    shadow-[0_8px_32px_rgba(0,0,0,0.1)]
    p-4
    ${className}
  `}>
    {children}
  </div>
)

export const NeumorphicButton = ({ children, onClick, className = "", variant = "default", disabled = false }) => {
  const variants = {
    default: "bg-gray-100 hover:bg-gray-200 text-gray-700 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(0,0,0,0.1)]",
    primary: "bg-blue-100 hover:bg-blue-200 text-blue-700 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(59,130,246,0.2)]",
    success: "bg-green-100 hover:bg-green-200 text-green-700 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(34,197,94,0.2)]",
    danger: "bg-red-100 hover:bg-red-200 text-red-700 shadow-[inset_-2px_-2px_4px_rgba(255,255,255,0.7),inset_2px_2px_4px_rgba(239,68,68,0.2)]"
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.7)]'}
        rounded-xl
        p-3
        font-medium
        transition-all duration-200
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {children}
    </button>
  )
}

// Export the 3D Card components
export { default as ProductCard3D } from './ProductCard3D'
export { default as FeatureCard3D } from './FeatureCard3D'
export { default as WideFeatureCard3D } from './WideFeatureCard3D'
