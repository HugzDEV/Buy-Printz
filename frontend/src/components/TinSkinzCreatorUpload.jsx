import React, { useState } from 'react'
import { Upload, Image, X, Plus, Save, Eye } from 'lucide-react'
import { authService } from '../services/auth'

const TinSkinzCreatorUpload = ({ onUploadSuccess = () => {} }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'custom',
    description: '',
    base_price: 12.99,
    frontImage: null,
    backImage: null,
    fullDesign: null
  })
  const [previews, setPreviews] = useState({
    front: null,
    back: null,
    full: null
  })
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState({})

  const categories = [
    { value: 'custom', label: 'Custom Design' },
    { value: 'business', label: 'Business' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'sports', label: 'Sports' },
    { value: 'abstract', label: 'Abstract Art' },
    { value: 'nature', label: 'Nature' },
    { value: 'vintage', label: 'Vintage' },
    { value: 'modern', label: 'Modern' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({
        ...prev,
        [`${type}Image`]: 'Please select a valid image file'
      }))
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({
        ...prev,
        [`${type}Image`]: 'Image must be less than 5MB'
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [`${type}Image`]: file
    }))

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviews(prev => ({
        ...prev,
        [type]: e.target.result
      }))
    }
    reader.readAsDataURL(file)

    // Clear error
    if (errors[`${type}Image`]) {
      setErrors(prev => ({
        ...prev,
        [`${type}Image`]: ''
      }))
    }
  }

  const removeImage = (type) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Image`]: null
    }))
    setPreviews(prev => ({
      ...prev,
      [type]: null
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Design name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.frontImage) {
      newErrors.frontImage = 'Front image is required'
    }

    if (!formData.backImage) {
      newErrors.backImage = 'Back image is required'
    }

    if (!formData.fullDesign) {
      newErrors.fullDesign = 'Full design image is required'
    }

    if (formData.base_price < 5 || formData.base_price > 50) {
      newErrors.base_price = 'Price must be between $5 and $50'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsUploading(true)

    try {
      const uploadData = new FormData()
      uploadData.append('name', formData.name)
      uploadData.append('category', formData.category)
      uploadData.append('description', formData.description)
      uploadData.append('base_price', formData.base_price.toString())
      uploadData.append('front_image', formData.frontImage)
      uploadData.append('back_image', formData.backImage)
      uploadData.append('full_design', formData.fullDesign)

      const response = await authService.authenticatedRequest('/api/tin-skinz/creator/upload', {
        method: 'POST',
        body: uploadData
      })

      if (response.ok) {
        const result = await response.json()
        onUploadSuccess(result)
        
        // Reset form
        setFormData({
          name: '',
          category: 'custom',
          description: '',
          base_price: 12.99,
          frontImage: null,
          backImage: null,
          fullDesign: null
        })
        setPreviews({
          front: null,
          back: null,
          full: null
        })
        setErrors({})
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.detail || 'Upload failed' })
      }
    } catch (error) {
      console.error('Upload error:', error)
      setErrors({ submit: 'Upload failed. Please try again.' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="backdrop-blur-xl bg-white/20 rounded-2xl border border-white/30 shadow-xl p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl shadow-lg border border-white/30">
            <Upload className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upload Tin Skinz Design</h2>
            <p className="text-gray-600">Share your custom tin skinz designs with the community</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Design Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/30 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 ${
                  errors.name ? 'border-red-400' : 'border-white/30'
                }`}
                placeholder="Enter design name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-white/30 border border-white/30 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
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
              rows={3}
              className={`w-full px-4 py-3 bg-white/30 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 ${
                errors.description ? 'border-red-400' : 'border-white/30'
              }`}
              placeholder="Describe your design..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price ($5 - $50) *
            </label>
            <input
              type="number"
              name="base_price"
              value={formData.base_price}
              onChange={handleInputChange}
              min="5"
              max="50"
              step="0.01"
              className={`w-full px-4 py-3 bg-white/30 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200 ${
                errors.base_price ? 'border-red-400' : 'border-white/30'
              }`}
            />
            {errors.base_price && <p className="text-red-500 text-xs mt-1">{errors.base_price}</p>}
          </div>

          {/* Image Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Front Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Front Image *
              </label>
              <div className="relative">
                {previews.front ? (
                  <div className="relative">
                    <img 
                      src={previews.front} 
                      alt="Front preview" 
                      className="w-full h-32 object-cover rounded-xl border border-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('front')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-orange-400 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload front image</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'front')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {errors.frontImage && <p className="text-red-500 text-xs mt-1">{errors.frontImage}</p>}
            </div>

            {/* Back Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Back Image *
              </label>
              <div className="relative">
                {previews.back ? (
                  <div className="relative">
                    <img 
                      src={previews.back} 
                      alt="Back preview" 
                      className="w-full h-32 object-cover rounded-xl border border-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('back')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-orange-400 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload back image</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'back')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {errors.backImage && <p className="text-red-500 text-xs mt-1">{errors.backImage}</p>}
            </div>

            {/* Full Design */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Design *
              </label>
              <div className="relative">
                {previews.full ? (
                  <div className="relative">
                    <img 
                      src={previews.full} 
                      alt="Full design preview" 
                      className="w-full h-32 object-cover rounded-xl border border-white/30"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage('full')}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/30 rounded-xl cursor-pointer hover:border-orange-400 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Image className="w-8 h-8 mb-2 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload full design</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'full')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {errors.fullDesign && <p className="text-red-500 text-xs mt-1">{errors.fullDesign}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-gray-700 font-medium rounded-xl transition-all duration-200 border border-white/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg disabled:shadow-none flex items-center space-x-2"
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Upload Design</span>
                </>
              )}
            </button>
          </div>

          {errors.submit && (
            <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-xl">
              {errors.submit}
            </div>
          )}
        </form>
      </div>
    </div>
  )
}

export default TinSkinzCreatorUpload
