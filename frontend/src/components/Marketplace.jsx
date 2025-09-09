import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Filter, 
  Star, 
  Eye, 
  ShoppingCart, 
  User,
  DollarSign,
  Tag,
  Grid,
  List,
  SlidersHorizontal,
  Loader2
} from 'lucide-react'
import { GlassCard, GlassButton } from './ui'
import ProtectedImage from './ProtectedImage'
import useImageProtection from '../hooks/useImageProtection'
import authService from '../services/auth'

const Marketplace = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 25 })
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalTemplates, setTotalTemplates] = useState(0)

  // Enable image protection
  useImageProtection()

  const categories = [
    'Restaurant & Food',
    'Retail & Shopping', 
    'Service Businesses',
    'Events & Community',
    'Seasonal',
    'Industry Specific'
  ]

  useEffect(() => {
    // Reset pagination when filters change
    setCurrentPage(0)
    setTemplates([])
    setHasMore(true)
    loadTemplates(0, true)
  }, [selectedCategory, priceRange])


  const loadTemplates = async (page = 0, reset = false) => {
    try {
      if (reset) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      const limit = 20
      const offset = page * limit
      
      const filters = {
        is_approved: true,
        is_active: true,
        limit: limit,
        offset: offset
      }
      
      if (selectedCategory) {
        filters.category = selectedCategory
      }
      
      if (priceRange.min > 0) {
        filters.min_price = priceRange.min
      }
      
      if (priceRange.max < 25) {
        filters.max_price = priceRange.max
      }
      
      if (searchTerm) {
        filters.search = searchTerm
      }
      
      const queryParams = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          queryParams.append(key, value)
        }
      })
      
      // Use the same API URL as authService but without authentication
      const apiUrl = import.meta.env.VITE_API_URL || 'https://buy-printz-production.up.railway.app'
      const response = await fetch(`${apiUrl}/api/creator-marketplace/templates/marketplace?${queryParams}`)
      
      if (response.ok) {
        const data = await response.json()
        
        if (reset) {
          setTemplates(data.templates || [])
        } else {
          setTemplates(prev => [...prev, ...(data.templates || [])])
        }
        
        setTotalTemplates(data.total || 0)
        setHasMore((data.templates || []).length === limit)
        setCurrentPage(page)
      } else {
        setError('Failed to load templates')
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      setError('Network error loading templates')
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    // Reset pagination when searching
    setCurrentPage(0)
    setTemplates([])
    setHasMore(true)
    loadTemplates(0, true)
  }

  const loadMoreTemplates = () => {
    if (!loadingMore && hasMore) {
      loadTemplates(currentPage + 1, false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 text-yellow-400 fill-current opacity-50" />)
    }
    
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />)
    }
    
    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 flex items-center justify-center">
        <div className="backdrop-blur-md bg-white/20 border border-white/30 shadow-xl rounded-3xl p-12 text-center">
          <Loader2 className="w-12 h-12 animate-spin text-buyprint-brand mx-auto mb-6" />
          <p className="text-white text-lg">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-700 to-primary-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Creator Marketplace
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover amazing templates created by talented designers
          </p>
        </div>

        {/* Search and Filters */}
        <div className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl rounded-3xl p-4 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent transition-all duration-200"
                />
              </div>
            </form>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-3 bg-white/20 hover:bg-white/30 border border-white/30 rounded-xl text-gray-700 font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 sm:p-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                  viewMode === 'grid' 
                    ? 'bg-buyprint-brand/20 border border-buyprint-brand/30 text-buyprint-brand' 
                    : 'bg-white/20 hover:bg-white/30 border border-white/30 text-gray-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 sm:p-3 rounded-xl transition-all duration-200 backdrop-blur-sm ${
                  viewMode === 'list' 
                    ? 'bg-buyprint-brand/20 border border-buyprint-brand/30 text-buyprint-brand' 
                    : 'bg-white/20 hover:bg-white/30 border border-white/30 text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-buyprint-brand/50 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category} className="bg-gray-800 text-white">{category}</option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range: {formatCurrency(priceRange.min)} - {formatCurrency(priceRange.max)}
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                      className="w-full accent-buyprint-brand"
                    />
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="w-full accent-buyprint-brand"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 backdrop-blur-md bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Templates Grid/List */}
        {templates.length === 0 ? (
          <div className="backdrop-blur-md bg-white/80 border border-white/30 shadow-xl rounded-3xl p-12 text-center">
            <div className="text-gray-400 mb-6">
              <Search className="w-20 h-20 mx-auto" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">No Templates Found</h2>
            <p className="text-gray-600 text-lg">
              Try adjusting your search criteria or browse all categories
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {templates.map((template) => (
              <div key={template.id} className={`backdrop-blur-md bg-white/80 border border-white/30 shadow-xl rounded-3xl p-4 sm:p-6 group hover:bg-white/90 hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 ${viewMode === 'list' ? 'flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6' : ''}`}>
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    {/* Template Preview */}
                    <div className="aspect-video bg-gray-100 rounded-xl mb-4 overflow-hidden">
                      {template.preview_image_url ? (
                        <ProtectedImage
                          src={template.preview_image_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                          watermark={true}
                          watermarkType="custom"
                          watermarkOpacity={0.15}
                          isPreview={true}
                          highResSrc={template.preview_image_url_high_res}
                          onUpgrade={() => window.location.href = `/marketplace/template/${template.id}`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full flex items-center justify-center ${template.preview_image_url ? 'hidden' : 'flex'}`}
                        style={{ display: template.preview_image_url ? 'none' : 'flex' }}
                      >
                        <div className="text-center text-gray-400">
                          <div className="text-4xl mb-2">🎨</div>
                          <p className="text-sm">Template Preview</p>
                        </div>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {template.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1" />
                          {template.creators?.display_name || 'Unknown'}
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          {template.view_count || 0}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {renderStars(template.rating || 0)}
                          <span className="text-sm text-gray-500 ml-2">
                            ({template.rating_count || 0})
                          </span>
                        </div>
                        <span className="font-bold text-lg text-gray-900">
                          {formatCurrency(template.price)}
                        </span>
                      </div>

                      <button
                        onClick={() => window.location.href = `/marketplace/template/${template.id}`}
                        className="w-full px-4 py-3 bg-buyprint-brand hover:bg-buyprint-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </>
                ) : (
                  // List View
                  <>
                    <div className="w-full sm:w-32 h-24 sm:h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {template.preview_image_url ? (
                        <ProtectedImage
                          src={template.preview_image_url}
                          alt={template.name}
                          className="w-full h-full object-cover"
                          watermark={true}
                          watermarkType="custom"
                          watermarkOpacity={0.15}
                          isPreview={true}
                          highResSrc={template.preview_image_url_high_res}
                          onUpgrade={() => window.location.href = `/marketplace/template/${template.id}`}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-full h-full flex items-center justify-center ${template.preview_image_url ? 'hidden' : 'flex'}`}
                        style={{ display: template.preview_image_url ? 'none' : 'flex' }}
                      >
                        <div className="text-center text-gray-400">
                          <div className="text-2xl mb-1">🎨</div>
                          <p className="text-xs">Preview</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 w-full sm:w-auto">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-2 gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                        <span className="font-bold text-lg text-gray-900 sm:ml-4 self-start sm:self-auto">
                          {formatCurrency(template.price)}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-500 gap-2">
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            <span className="truncate">{template.creators?.display_name || 'Unknown'}</span>
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {template.view_count || 0}
                          </span>
                          <span className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            <span className="truncate">{template.category}</span>
                          </span>
                        </div>
                        <div className="flex items-center">
                          {renderStars(template.rating || 0)}
                          <span className="text-sm text-gray-500 ml-2">
                            ({template.rating_count || 0})
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => window.location.href = `/marketplace/template/${template.id}`}
                      className="w-full sm:w-auto px-4 py-3 bg-buyprint-brand hover:bg-buyprint-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl flex-shrink-0"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="sm:hidden">View Details</span>
                      <span className="hidden sm:inline">View</span>
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {templates.length > 0 && hasMore && (
          <div className="text-center mt-8">
            <button 
              onClick={loadMoreTemplates}
              disabled={loadingMore}
              className="px-4 sm:px-8 py-3 sm:py-4 bg-buyprint-brand hover:bg-buyprint-600 text-white font-medium rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl w-full sm:w-auto sm:min-w-[200px] mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="sm:hidden">Loading...</span>
                  <span className="hidden sm:inline">Loading More...</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">Load More ({totalTemplates - templates.length})</span>
                  <span className="hidden sm:inline">Load More Templates ({totalTemplates - templates.length} remaining)</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Results Summary */}
        {templates.length > 0 && (
          <div className="text-center mt-4 text-sm text-white/90">
            Showing {templates.length} of {totalTemplates} templates
          </div>
        )}
      </div>
    </div>
  )
}

export default Marketplace
