import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Upload, 
  Image, 
  Tag, 
  DollarSign, 
  FileText, 
  Save,
  AlertCircle,
  CheckCircle,
  Loader2,
  X
} from 'lucide-react'
import { GlassCard, GlassButton } from './ui'
import authService from '../services/auth'

const TemplateUpload = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 5.00,
    tags: []
  })
  
  const [tagInput, setTagInput] = useState('')
  const [canvasData, setCanvasData] = useState(null)

  const categories = [
    'Restaurant & Food',
    'Retail & Shopping', 
    'Service Businesses',
    'Events & Community',
    'Seasonal',
    'Industry Specific'
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handlePriceChange = (e) => {
    const value = parseFloat(e.target.value)
    if (value >= 3.00 && value <= 25.00) {
      setFormData(prev => ({
        ...prev,
        price: value
      }))
    }
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }))
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const loadCanvasData = () => {
    // In a real implementation, this would load the current canvas state
    // For now, we'll create a mock canvas data structure
    const mockCanvasData = {
      version: "1.0",
      elements: [
        {
          id: "text_1",
          type: "text",
          x: 100,
          y: 100,
          text: "Sample Text",
          fontSize: 24,
          fontFamily: "Arial",
          fill: "#000000"
        }
      ],
      canvas: {
        width: 800,
        height: 600,
        backgroundColor: "#ffffff"
      }
    }
    
    setCanvasData(mockCanvasData)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Template name is required')
      return false
    }
    
    if (formData.name.length < 3) {
      setError('Template name must be at least 3 characters')
      return false
    }
    
    if (!formData.description.trim()) {
      setError('Template description is required')
      return false
    }
    
    if (formData.description.length < 10) {
      setError('Template description must be at least 10 characters')
      return false
    }
    
    if (!formData.category) {
      setError('Please select a category')
      return false
    }
    
    if (!canvasData) {
      setError('Please load your design from the canvas editor')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      const uploadData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        category: formData.category,
        price: formData.price,
        canvas_data: canvasData,
        tags: formData.tags
      }
      
      const response = await authService.authenticatedRequest('/api/creator-marketplace/templates/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(uploadData)
      })
      
      if (response.ok) {
        const result = await response.json()
        setSuccess(true)
        
        // Redirect to creator dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard?tab=creator')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to upload template')
      }
    } catch (error) {
      console.error('Template upload error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Template Uploaded! 🎉
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your template has been submitted for review. It will be available in the marketplace once approved.
          </p>
          
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to your dashboard...
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-600 bg-clip-text text-transparent">
                Upload Template
              </h1>
              <p className="text-gray-600 mt-1">
                Share your design with the community and start earning
              </p>
            </div>
            
            <GlassButton
              variant="outline"
              onClick={() => navigate('/dashboard?tab=creator')}
            >
              Cancel
            </GlassButton>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <GlassCard className="p-8">
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}

              {/* Upload Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Template Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter a catchy name for your template"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.name.length}/100 characters
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your template and what makes it special..."
                    rows={4}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 resize-none"
                    maxLength={500}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {formData.description.length}/500 characters
                  </p>
                </div>

                {/* Category */}
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Price ($3 - $25) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handlePriceChange}
                    min="3.00"
                    max="25.00"
                    step="0.01"
                    className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    You'll earn 80% of this price (${(formData.price * 0.8).toFixed(2)})
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Tag className="w-4 h-4 inline mr-1" />
                    Tags
                  </label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Add a tag and press Enter"
                      className="flex-1 px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm"
                    />
                    <GlassButton
                      type="button"
                      onClick={addTag}
                      size="sm"
                    >
                      Add
                    </GlassButton>
                  </div>
                  
                  {formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-purple-500 hover:text-purple-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Canvas Data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Image className="w-4 h-4 inline mr-1" />
                    Design Data
                  </label>
                  
                  {!canvasData ? (
                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">
                        Load your design from the canvas editor
                      </p>
                      <GlassButton
                        type="button"
                        onClick={loadCanvasData}
                        variant="outline"
                      >
                        Load Current Design
                      </GlassButton>
                    </div>
                  ) : (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                        <span className="text-green-700 font-medium">Design loaded successfully</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {canvasData.elements?.length || 0} elements ready to upload
                      </p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                  <GlassButton
                    type="submit"
                    disabled={isLoading || !canvasData}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Template
                      </>
                    )}
                  </GlassButton>
                </div>
              </form>
            </GlassCard>
          </div>

          {/* Guidelines Sidebar */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Upload Guidelines</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Quality Standards</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• High-resolution designs (300 DPI)</li>
                    <li>• Professional appearance</li>
                    <li>• Clear, readable text</li>
                    <li>• Proper color contrast</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Content Rules</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Original designs only</li>
                    <li>• No copyrighted material</li>
                    <li>• Appropriate for business use</li>
                    <li>• No offensive content</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-700 mb-2">Pricing Tips</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Start with $5-10 for simple designs</li>
                    <li>• Complex designs can go up to $25</li>
                    <li>• Consider your time investment</li>
                    <li>• You can adjust prices later</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-semibold text-blue-800 mb-2">Review Process</h4>
                  <p className="text-sm text-blue-700">
                    All templates are reviewed within 24-48 hours. You'll be notified once approved!
                  </p>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateUpload
