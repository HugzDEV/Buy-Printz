import React, { useEffect } from 'react'
import { CheckCircle, X } from 'lucide-react'

const SuccessNotification = ({ 
  isVisible, 
  onClose, 
  title, 
  message, 
  type = 'success' // 'success', 'error', 'info'
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 4000) // Auto-close after 4 seconds
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'from-green-500 to-emerald-600',
          icon: 'text-green-100',
          iconBg: 'bg-green-100/20',
          border: 'border-green-400/30'
        }
      case 'error':
        return {
          bg: 'from-red-500 to-rose-600',
          icon: 'text-red-100',
          iconBg: 'bg-red-100/20',
          border: 'border-red-400/30'
        }
      case 'info':
        return {
          bg: 'from-blue-500 to-indigo-600',
          icon: 'text-blue-100',
          iconBg: 'bg-blue-100/20',
          border: 'border-blue-400/30'
        }
      default:
        return {
          bg: 'from-green-500 to-emerald-600',
          icon: 'text-green-100',
          iconBg: 'bg-green-100/20',
          border: 'border-green-400/30'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className={`backdrop-blur-xl bg-gradient-to-r ${styles.bg} rounded-2xl border ${styles.border} shadow-2xl p-4 min-w-[320px] max-w-md`}>
        <div className="flex items-start space-x-3">
          {/* Icon */}
          <div className={`p-2 ${styles.iconBg} rounded-xl`}>
            <CheckCircle className={`w-5 h-5 ${styles.icon}`} />
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-semibold text-sm mb-1">
              {title}
            </h4>
            <p className="text-white/90 text-sm leading-relaxed">
              {message}
            </p>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white/40 rounded-full animate-progress-bar" />
        </div>
      </div>
    </div>
  )
}

export default SuccessNotification
