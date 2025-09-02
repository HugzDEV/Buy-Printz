// Simple UI components for the print preview modal
import React from 'react'

// Dialog components with minimal mobile fixes
export const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden my-4 mx-auto"
        onClick={(e) => e.stopPropagation()}
        style={{
          minHeight: 'min-content',
          maxHeight: 'calc(100vh - 2rem)',
          // Only essential mobile fixes that don't break desktop
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      >
        {children}
      </div>
    </div>
  )
}

export const DialogContent = ({ className = '', children }) => (
  <div className={`overflow-y-auto w-full ${className}`} style={{ minHeight: 'min-content' }}>
    {children}
  </div>
)

export const DialogHeader = ({ children }) => (
  <div className="p-6 border-b">
    {children}
  </div>
)

export const DialogTitle = ({ children, className = '' }) => (
  <h2 className={`text-xl font-semibold ${className}`}>
    {children}
  </h2>
)

export const DialogFooter = ({ children, className = '' }) => (
  <div className={`p-6 border-t bg-gray-50 flex justify-end gap-2 ${className}`}>
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
  <div className={`p-6 ${className}`}>
    {children}
  </div>
)

export const CardHeader = ({ children, className = '' }) => (
  <div className={`p-6 pb-3 ${className}`}>
    {children}
  </div>
)

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`font-semibold ${className}`}>
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
  const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
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
    <span className={`inline-flex items-center px-2 py-1 rounded-md text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export const Separator = ({ className = '' }) => (
  <div className={`border-t border-gray-200 ${className}`} />
)

export const Alert = ({ children, className = '' }) => (
  <div className={`border border-blue-200 bg-blue-50 rounded-lg p-4 ${className}`}>
    {children}
  </div>
)

export const AlertDescription = ({ children, className = '' }) => (
  <div className={`text-sm text-blue-800 ${className}`}>
    {children}
  </div>
)
