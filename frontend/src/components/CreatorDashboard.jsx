import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Upload, 
  TrendingUp, 
  DollarSign, 
  Eye, 
  Star,
  Calendar,
  BarChart3,
  Package,
  Users,
  Award,
  Settings,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { GlassCard, GlassButton } from './ui'
import authService from '../services/auth'

const CreatorDashboard = () => {
  const [creator, setCreator] = useState(null)
  const [templates, setTemplates] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadCreatorData()
  }, [])

  const loadCreatorData = async () => {
    try {
      setLoading(true)
      
      // Load creator profile
      const creatorResponse = await authService.authenticatedRequest('/api/creator-marketplace/creators/profile')
      if (creatorResponse.ok) {
        const creatorData = await creatorResponse.json()
        setCreator(creatorData.creator)
      }
      
      // Load creator templates
      const templatesResponse = await authService.authenticatedRequest('/api/creator-marketplace/templates/my-templates')
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        setTemplates(templatesData.templates)
      }
      
      // Load analytics
      const analyticsResponse = await authService.authenticatedRequest('/api/creator-marketplace/creators/analytics')
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData.analytics)
      }
      
    } catch (error) {
      console.error('Error loading creator data:', error)
      setError('Failed to load creator data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (isApproved, isActive) => {
    if (!isActive) return { text: 'Inactive', color: 'bg-gray-100 text-gray-700' }
    if (isApproved) return { text: 'Live', color: 'bg-green-100 text-green-700' }
    return { text: 'Pending', color: 'bg-yellow-100 text-yellow-700' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your creator dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <GlassButton onClick={loadCreatorData}>
            Try Again
          </GlassButton>
        </GlassCard>
      </div>
    )
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-purple-100 rounded-full">
              <Users className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Become a Creator
          </h2>
          
          <p className="text-gray-600 mb-6">
            Join our creator community and start earning by selling your design templates to small businesses.
          </p>
          
          <Link to="/creator/register">
            <GlassButton className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white">
              <Plus className="w-5 h-5 mr-2" />
              Register as Creator
            </GlassButton>
          </Link>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-600 bg-clip-text text-transparent">
                Creator Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Welcome back, {creator.display_name}! 👋
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Link to="/creator/upload">
                <GlassButton className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Template
                </GlassButton>
              </Link>
              
              <Link to="/creator/profile">
                <GlassButton variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Profile
                </GlassButton>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(creator.total_earnings || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Templates Sold</p>
                <p className="text-2xl font-bold text-gray-900">
                  {creator.templates_sold || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rating</p>
                <p className="text-2xl font-bold text-gray-900">
                  {creator.rating ? creator.rating.toFixed(1) : '0.0'}
                </p>
                <p className="text-xs text-gray-500">
                  {creator.rating_count || 0} reviews
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Templates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {templates.filter(t => t.is_approved && t.is_active).length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Recent Activity & Templates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* My Templates */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">My Templates</h2>
              <Link to="/creator/upload">
                <GlassButton size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </GlassButton>
              </Link>
            </div>

            {templates.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No templates yet</h3>
                <p className="text-gray-500 mb-4">Start by uploading your first template</p>
                <Link to="/creator/upload">
                  <GlassButton>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Template
                  </GlassButton>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.slice(0, 5).map((template) => {
                  const status = getStatusBadge(template.is_approved, template.is_active)
                  return (
                    <div key={template.id} className="flex items-center justify-between p-4 bg-white/20 rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">{template.name}</h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${status.color}`}>
                            {status.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{template.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {formatCurrency(template.price)}
                          </span>
                          <span className="flex items-center">
                            <Package className="w-3 h-3 mr-1" />
                            {template.sales_count} sales
                          </span>
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {template.view_count} views
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Link to={`/creator/template/${template.id}`}>
                          <GlassButton size="sm" variant="outline">
                            <ExternalLink className="w-3 h-3" />
                          </GlassButton>
                        </Link>
                      </div>
                    </div>
                  )
                })}
                
                {templates.length > 5 && (
                  <div className="text-center pt-4">
                    <Link to="/creator/templates">
                      <GlassButton variant="outline">
                        View All Templates
                      </GlassButton>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          {/* Analytics Overview */}
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Analytics</h2>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>

            {analytics ? (
              <div className="space-y-6">
                {/* Recent Performance */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Recent Performance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white/20 rounded-lg">
                      <p className="text-sm text-gray-600">Last 30 Days</p>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(analytics.recent_sales?.recent_earnings || 0)}
                      </p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-lg">
                      <p className="text-sm text-gray-600">Sales</p>
                      <p className="text-lg font-bold text-gray-900">
                        {analytics.recent_sales?.recent_sales || 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Template Stats */}
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">Template Stats</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Templates</span>
                      <span className="font-medium">{analytics.template_stats?.total_templates || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Approved</span>
                      <span className="font-medium text-green-600">{analytics.template_stats?.approved_templates || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pending</span>
                      <span className="font-medium text-yellow-600">{analytics.template_stats?.pending_templates || 0}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Views</span>
                      <span className="font-medium">{analytics.template_stats?.total_views || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Top Templates */}
                {analytics.top_templates && analytics.top_templates.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">Top Performing</h3>
                    <div className="space-y-2">
                      {analytics.top_templates.slice(0, 3).map((template, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-white/20 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{template.name}</p>
                            <p className="text-xs text-gray-500">{template.sales_count} sales</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{formatCurrency(template.price)}</p>
                            <div className="flex items-center">
                              <Star className="w-3 h-3 text-yellow-500 mr-1" />
                              <span className="text-xs text-gray-500">{template.rating.toFixed(1)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Analytics data will appear here once you start selling templates</p>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/creator/upload">
                <GlassButton className="w-full h-20 flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 mb-2" />
                  <span>Upload Template</span>
                </GlassButton>
              </Link>
              
              <Link to="/creator/profile">
                <GlassButton variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <Settings className="w-6 h-6 mb-2" />
                  <span>Edit Profile</span>
                </GlassButton>
              </Link>
              
              <Link to="/creator/analytics">
                <GlassButton variant="outline" className="w-full h-20 flex flex-col items-center justify-center">
                  <BarChart3 className="w-6 h-6 mb-2" />
                  <span>View Analytics</span>
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default CreatorDashboard
