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
  X,
  File,
  Monitor,
  Package,
  Tent
} from 'lucide-react'
import { GlassCard, GlassButton } from './ui'
import authService from '../services/auth'
import { toast } from 'sonner'

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
    tags: [],
    productType: 'banner' // New field for product type
  })
  
  const [tagInput, setTagInput] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [uploadMethod, setUploadMethod] = useState('file') // 'file' or 'canvas'

  const productTypes = [
    { value: 'banner', label: 'Vinyl Banners', icon: Monitor, description: 'Outdoor advertising banners' },
    { value: 'tin_skinz', label: 'Tin Skinz', icon: Package, description: 'Custom tin designs' },
    { value: 'tent', label: 'Tradeshow Tents', icon: Tent, description: 'Event and tradeshow tents' }
  ]

  // Product-specific categories
  const getCategoriesForProduct = (productType) => {
    const baseCategories = [
      'Restaurant & Food',
      'Retail & Shopping', 
      'Service Businesses',
      'Events & Community',
      'Seasonal',
      'Industry Specific',
      'Business Cards'
    ]
    
    const tinSkinzSpecificCategories = [
      'Gender Reveal',
      'Baby Shower',
      'Graduation',
      'Thank You',
      'Weddings',
      'Sweet 15s & 16s',
      'Birthdays',
      'Valentine\'s Day',
      'Christmas',
      'Hannukah',
      'Halloween',
      'Family Reunion'
    ]
    
    switch (productType) {
      case 'tin_skinz':
        return [...baseCategories, ...tinSkinzSpecificCategories]
      case 'banner':
      case 'tent':
      default:
        return baseCategories
    }
  }
  
  const categories = getCategoriesForProduct(formData.productType)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      }
      
      // If product type changes, reset category since available categories change
      if (name === 'productType') {
        newData.category = ''
      }
      
      return newData
    })
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

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF, WebP, or SVG)')
        return
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB')
        return
      }

      setUploadedFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setFilePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setFilePreview(null)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Template name is required')
      return false
    }
    
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    
    if (!formData.category) {
      setError('Category is required')
      return false
    }
    
    if (uploadMethod === 'file' && !uploadedFile) {
      setError('Please upload a design file')
      return false
    }
    
    if (formData.tags.length === 0) {
      setError('At least one tag is required')
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
      if (uploadMethod === 'file') {
        // Upload file-based template
        const formDataToSend = new FormData()
        formDataToSend.append('name', formData.name.trim())
        formDataToSend.append('description', formData.description.trim())
        formDataToSend.append('category', formData.category)
        formDataToSend.append('price', formData.price.toString())
        formDataToSend.append('productType', formData.productType)
        formDataToSend.append('tags', JSON.stringify(formData.tags))
        formDataToSend.append('file', uploadedFile)
        
        const response = await authService.authenticatedRequest('/api/creator-marketplace/templates/upload-file', {
          method: 'POST',
          body: formDataToSend
        })
        
        if (response.ok) {
          const result = await response.json()
          setSuccess(true)
          toast.success('Template uploaded successfully!')
          
          // Redirect to creator dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard?tab=creator')
          }, 2000)
        } else {
          const errorData = await response.json()
          setError(errorData.detail || 'Failed to upload template')
        }
      } else {
        // Canvas-based upload (existing functionality)
        const uploadData = {
          name: formData.name.trim(),
          description: formData.description.trim(),
          category: formData.category,
          price: formData.price,
          productType: formData.productType,
          canvas_data: null, // This would be loaded from canvas
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
          toast.success('Template uploaded successfully!')
          
          setTimeout(() => {
            navigate('/dashboard?tab=creator')
          }, 2000)
        } else {
          const errorData = await response.json()
          setError(errorData.detail || 'Failed to upload template')
        }
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
        <GlassCard className="max-w-md mx-auto text-center">
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
                Upload Design
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
          {/* Upload Method Selection */}
          <div className="lg:col-span-1">
            <GlassCard className="h-fit">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Upload Method</h3>
              
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setUploadMethod('file')}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    uploadMethod === 'file'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <File className="w-5 h-5 mr-3 text-purple-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-800">Upload File</div>
                      <div className="text-sm text-gray-600">From computer (Canva, Photoshop, etc.)</div>
                    </div>
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setUploadMethod('canvas')}
                  className={`w-full p-4 rounded-xl border-2 transition-all duration-200 ${
                    uploadMethod === 'canvas'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center">
                    <Monitor className="w-5 h-5 mr-3 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-800">Canvas Editor</div>
                      <div className="text-sm text-gray-600">Create in our editor</div>
                    </div>
                  </div>
                </button>
              </div>
            </GlassCard>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2">
            <GlassCard>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Product Type
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {productTypes.map((type) => {
                      const IconComponent = type.icon
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, productType: type.value }))}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.productType === type.value
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-center">
                            {type.value === 'tin_skinz' ? (
                              <img 
                                src="/assets/tin-skinz/Tin Skinz_logo_full color_Secondary logo.png" 
                                alt="Tin Skinz Logo" 
                                className="w-16 h-16 mx-auto mb-2 object-contain"
                              />
                            ) : (
                              <IconComponent className="w-6 h-6 mx-auto mb-2 text-green-600" />
                            )}
                            {type.value !== 'tin_skinz' && (
                              <div className="font-medium text-gray-800 text-sm">{type.label}</div>
                            )}
                            <div className="text-xs text-gray-600 mt-1">{type.description}</div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* File Upload Section */}
                {uploadMethod === 'file' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Design File
                    </label>
                    
                    {!uploadedFile ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="file-upload"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <div className="text-lg font-medium text-gray-700 mb-2">
                            Click to upload your design
                          </div>
                          <div className="text-sm text-gray-500">
                            Supports JPEG, PNG, GIF, WebP, SVG (max 10MB)
                          </div>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="border-2 border-gray-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center">
                              <Image className="w-5 h-5 text-green-600 mr-2" />
                              <span className="font-medium text-gray-800">{uploadedFile.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={removeFile}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {filePreview && (
                            <div className="mt-3">
                              <img 
                                src={filePreview} 
                                alt="Preview" 
                                className="max-w-full max-h-48 rounded-lg mx-auto"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Canvas Upload Section */}
                {uploadMethod === 'canvas' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Canvas Design
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                      <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <div className="text-lg font-medium text-gray-700 mb-2">
                        Canvas Editor Integration
                      </div>
                      <div className="text-sm text-gray-500 mb-4">
                        Create your design using our canvas editor
                      </div>
                      <GlassButton
                        type="button"
                        onClick={() => navigate('/editor')}
                        variant="outline"
                      >
                        Open Canvas Editor
                      </GlassButton>
                    </div>
                  </div>
                )}

                {/* Template Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter template name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Describe your template..."
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handlePriceChange}
                      min="3.00"
                      max="25.00"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Price range: $3.00 - $25.00</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags *
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-purple-600 hover:text-purple-800"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-4 py-2 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Add a tag..."
                    />
                    <GlassButton
                      type="button"
                      onClick={addTag}
                      variant="outline"
                    >
                      Add
                    </GlassButton>
                  </div>
                </div>

                {error && (
                  <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                    <span className="text-red-800">{error}</span>
                  </div>
                )}

                <div className="flex justify-end">
                  <GlassButton
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Template
                      </>
                    )}
                  </GlassButton>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TemplateUpload