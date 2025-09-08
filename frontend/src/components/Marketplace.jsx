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
import authService from '../services/auth'

const Marketplace = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [priceRange, setPriceRange] = useState({ min: 0, max: 25 })
  const [viewMode, setViewMode] = useState('grid')
  const [showFilters, setShowFilters] = useState(false)

  const categories = [
    'Restaurant & Food',
    'Retail & Shopping', 
    'Service Businesses',
    'Events & Community',
    'Seasonal',
    'Industry Specific'
  ]

  useEffect(() => {
    loadTemplates()
  }, [selectedCategory, priceRange])

  const loadTemplates = async () => {
    try {
      setLoading(true)
      
      const filters = {
        is_approved: true,
        is_active: true
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
        setTemplates(data.templates)
      } else {
        setError('Failed to load templates')
      }
    } catch (error) {
      console.error('Error loading templates:', error)
      setError('Network error loading templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    loadTemplates()
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
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-600 bg-clip-text text-transparent">
            Creator Marketplace
          </h1>
          <p className="text-gray-600 mt-1">
            Discover amazing templates created by talented designers
          </p>
        </div>

        {/* Search and Filters */}
        <GlassCard className="p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                />
              </div>
            </form>

            {/* Filters Toggle */}
            <GlassButton
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </GlassButton>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <GlassButton
                onClick={() => setViewMode('grid')}
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
              >
                <Grid className="w-4 h-4" />
              </GlassButton>
              <GlassButton
                onClick={() => setViewMode('list')}
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
              >
                <List className="w-4 h-4" />
              </GlassButton>
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
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
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
                      className="w-full"
                    />
                    <input
                      type="range"
                      min="0"
                      max="25"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Templates Grid/List */}
        {templates.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Templates Found</h2>
            <p className="text-gray-600">
              Try adjusting your search criteria or browse all categories
            </p>
          </GlassCard>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {templates.map((template) => (
              <GlassCard key={template.id} className={`p-6 ${viewMode === 'list' ? 'flex items-center gap-6' : ''}`}>
                {viewMode === 'grid' ? (
                  // Grid View
                  <>
                    {/* Template Preview */}
                    <div className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <div className="text-4xl mb-2">🎨</div>
                        <p className="text-sm">Template Preview</p>
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

                      <GlassButton
                        onClick={() => window.location.href = `/marketplace/template/${template.id}`}
                        className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        View Details
                      </GlassButton>
                    </div>
                  </>
                ) : (
                  // List View
                  <>
                    <div className="w-32 h-24 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <div className="text-center text-gray-400">
                        <div className="text-2xl mb-1">🎨</div>
                        <p className="text-xs">Preview</p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 mb-1">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {template.description}
                          </p>
                        </div>
                        <span className="font-bold text-lg text-gray-900 ml-4">
                          {formatCurrency(template.price)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {template.creators?.display_name || 'Unknown'}
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {template.view_count || 0}
                          </span>
                          <span className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {template.category}
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

                    <GlassButton
                      onClick={() => window.location.href = `/marketplace/template/${template.id}`}
                      className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white flex-shrink-0"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      View
                    </GlassButton>
                  </>
                )}
              </GlassCard>
            ))}
          </div>
        )}

        {/* Load More Button */}
        {templates.length > 0 && (
          <div className="text-center mt-8">
            <GlassButton variant="outline">
              Load More Templates
            </GlassButton>
          </div>
        )}
      </div>
    </div>
  )
}

export default Marketplace
