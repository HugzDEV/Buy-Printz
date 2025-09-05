import React, { useState } from 'react'
import { X, Save, Layout, CheckCircle, AlertCircle } from 'lucide-react'

const SaveModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  type = 'design', // 'design' or 'template'
  initialName = '',
  isLoading = false,
  error = null
}) => {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim()) {
      onSave(name.trim(), description.trim())
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl shadow-lg border border-white/30">
                  {type === 'template' ? (
                    <Layout className="w-6 h-6 text-purple-600" />
                  ) : (
                    <Save className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Save {type === 'template' ? 'Template' : 'Design'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {type === 'template' 
                      ? 'Save this design as a reusable template' 
                      : 'Save your current design to your collection'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-gray-600 hover:text-gray-700 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50/80 border border-red-200/50 rounded-xl backdrop-blur-sm">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                {type === 'template' ? 'Template Name' : 'Design Name'} *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter ${type === 'template' ? 'template' : 'design'} name...`}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200"
                required
                disabled={isLoading}
              />
            </div>

            {/* Description Input (for templates) */}
            {type === 'template' && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your template..."
                  rows={3}
                  className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl backdrop-blur-sm text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50 transition-all duration-200 resize-none"
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 bg-white/20 hover:bg-white/30 text-gray-700 rounded-xl font-semibold transition-all duration-200 border border-white/30 hover:border-white/50"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isLoading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:via-gray-500 disabled:to-gray-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-xl hover:shadow-2xl border border-blue-400/20 flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save {type === 'template' ? 'Template' : 'Design'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default SaveModal
