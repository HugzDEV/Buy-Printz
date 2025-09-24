import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Shield, Users, FileText, BarChart3, Settings, 
  CheckCircle, XCircle, AlertTriangle, Eye, 
  Trash2, Ban, UserCheck, TrendingUp, DollarSign,
  Package, Palette, Calendar, Activity, RefreshCw
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import authService from '../services/auth'
import SEOHead from './SEOHead'

const Admin = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [adminStats, setAdminStats] = useState({
    totalUsers: 0,
    totalCreators: 0,
    totalTemplates: 0,
    pendingTemplates: 0,
    totalOrders: 0,
    totalRevenue: 0
  })
  const [pendingTemplates, setPendingTemplates] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [allTemplates, setAllTemplates] = useState([])
  const [templateFilters, setTemplateFilters] = useState({
    status: 'all', // all, pending, approved, rejected
    category: 'all',
    creator: 'all',
    search: ''
  })
  const [selectedTemplates, setSelectedTemplates] = useState([])
  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    pendingTemplates: true,
    recentUsers: true,
    allTemplates: true
  })

  const navigate = useNavigate()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  // Debug effect to monitor allTemplates state changes
  useEffect(() => {
    console.log('🔄 allTemplates state changed:', allTemplates.length, 'templates')
    console.log('🔄 allTemplates data:', allTemplates)
  }, [allTemplates])

  const checkAdminAccess = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        navigate('/login')
        return
      }

      // Check if user is admin (you can implement your own admin check logic)
      const isAdmin = await checkIfAdmin(currentUser.user_id)
      if (!isAdmin) {
        toast.error('Access denied. Admin privileges required.')
        navigate('/dashboard')
        return
      }

      setUser(currentUser)
      await loadAdminData()
    } catch (error) {
      console.error('Error checking admin access:', error)
      toast.error('Error verifying admin access')
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  const checkIfAdmin = async (userId) => {
    // TODO: Implement proper admin check
    // For now, we'll use a simple check - you can implement your own logic
    const adminUsers = [
      '7be0211e-34c8-4357-946a-60b835586a89', // Brainboxjp - for testing
      // Add other admin user IDs here
    ]
    return adminUsers.includes(userId)
  }

  const loadAdminData = async () => {
    try {
      await Promise.all([
        loadAdminStats(),
        loadPendingTemplates(),
        loadRecentUsers(),
        loadAllTemplates()
      ])
    } catch (error) {
      console.error('Error loading admin data:', error)
      toast.error('Failed to load admin data')
    }
  }

  const loadAdminStats = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, stats: true }))
      
      const response = await authService.authenticatedRequest('/api/admin/stats')
      const result = await response.json()
      
      if (result) {
        setAdminStats({
          totalUsers: result.total_users || 0,
          totalCreators: result.total_creators || 0,
          totalTemplates: result.total_templates || 0,
          pendingTemplates: result.pending_templates || 0,
          totalOrders: result.total_orders || 0,
          totalRevenue: result.total_revenue || 0
        })
      }
    } catch (error) {
      console.error('Error loading admin stats:', error)
      // Fallback to mock data if API fails
      const mockStats = {
        totalUsers: 1247,
        totalCreators: 89,
        totalTemplates: 156,
        pendingTemplates: 12,
        totalOrders: 2341,
        totalRevenue: 45678.90
      }
      setAdminStats(mockStats)
    } finally {
      setLoadingStates(prev => ({ ...prev, stats: false }))
    }
  }

  const loadPendingTemplates = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, pendingTemplates: true }))
      
      const response = await authService.authenticatedRequest('/api/admin/templates/pending')
      const result = await response.json()
      
      if (result.success) {
        setPendingTemplates(result.templates || [])
      }
    } catch (error) {
      console.error('Error loading pending templates:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, pendingTemplates: false }))
    }
  }

  const loadRecentUsers = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, recentUsers: true }))
      
      const response = await authService.authenticatedRequest('/api/admin/users?limit=5')
      const users = await response.json()
      
      if (users && Array.isArray(users)) {
        setRecentUsers(users)
      } else {
        console.error('Invalid users response:', users)
        setRecentUsers([])
      }
    } catch (error) {
      console.error('Error loading recent users:', error)
      setRecentUsers([])
    } finally {
      setLoadingStates(prev => ({ ...prev, recentUsers: false }))
    }
  }

  const loadAllTemplates = async () => {
    try {
      console.log('🔄 Loading all templates...')
      setLoadingStates(prev => ({ ...prev, allTemplates: true }))
      
      const response = await authService.authenticatedRequest('/api/admin/templates/all')
      console.log('📡 Templates API response status:', response.status)
      console.log('📡 Templates API response headers:', response.headers)
      
      const result = await response.json()
      console.log('📦 Templates API result:', result)
      console.log('📦 Templates API result type:', typeof result)
      console.log('📦 Templates API result.success:', result.success)
      console.log('📦 Templates API result.templates:', result.templates)
      
      if (result.success) {
        console.log('✅ Templates loaded successfully:', result.templates?.length || 0, 'templates')
        console.log('📋 Setting allTemplates state with:', result.templates)
        setAllTemplates(result.templates || [])
        console.log('📋 allTemplates state should now be set')
      } else {
        console.error('❌ Failed to load templates:', result)
        setAllTemplates([])
      }
    } catch (error) {
      console.error('💥 Error loading all templates:', error)
      setAllTemplates([])
    } finally {
      console.log('🏁 Templates loading complete')
      setLoadingStates(prev => ({ ...prev, allTemplates: false }))
    }
  }

  const handleApproveTemplate = async (templateId) => {
    try {
      const response = await authService.authenticatedRequest(`/api/admin/templates/${templateId}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Template approved successfully')
        await loadPendingTemplates()
        await loadAdminStats()
      } else {
        throw new Error('Failed to approve template')
      }
    } catch (error) {
      console.error('Error approving template:', error)
      toast.error('Failed to approve template')
    }
  }

  const handleRejectTemplate = async (templateId) => {
    try {
      const response = await authService.authenticatedRequest(`/api/admin/templates/${templateId}/reject`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast.success('Template rejected successfully')
        await loadPendingTemplates()
        await loadAllTemplates()
        await loadAdminStats()
      } else {
        throw new Error('Failed to reject template')
      }
    } catch (error) {
      console.error('Error rejecting template:', error)
      toast.error('Failed to reject template')
    }
  }

  const handleBulkApprove = async () => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select templates to approve')
      return
    }

    try {
      const promises = selectedTemplates.map(templateId => 
        authService.authenticatedRequest(`/api/admin/templates/${templateId}/approve`, {
          method: 'POST'
        })
      )
      
      await Promise.all(promises)
      toast.success(`${selectedTemplates.length} templates approved successfully`)
      setSelectedTemplates([])
      await loadPendingTemplates()
      await loadAllTemplates()
      await loadAdminStats()
    } catch (error) {
      console.error('Error bulk approving templates:', error)
      toast.error('Failed to approve templates')
    }
  }

  const handleBulkReject = async () => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select templates to reject')
      return
    }

    try {
      const promises = selectedTemplates.map(templateId => 
        authService.authenticatedRequest(`/api/admin/templates/${templateId}/reject`, {
          method: 'POST'
        })
      )
      
      await Promise.all(promises)
      toast.success(`${selectedTemplates.length} templates rejected successfully`)
      setSelectedTemplates([])
      await loadPendingTemplates()
      await loadAllTemplates()
      await loadAdminStats()
    } catch (error) {
      console.error('Error bulk rejecting templates:', error)
      toast.error('Failed to reject templates')
    }
  }

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId) 
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    )
  }

  const handleSelectAll = () => {
    const filteredTemplates = getFilteredTemplates()
    if (selectedTemplates.length === filteredTemplates.length) {
      setSelectedTemplates([])
    } else {
      setSelectedTemplates(filteredTemplates.map(t => t.id))
    }
  }

  const getFilteredTemplates = () => {
    let filtered = allTemplates

    // Filter by status
    if (templateFilters.status !== 'all') {
      if (templateFilters.status === 'pending') {
        filtered = filtered.filter(t => !t.is_approved && t.is_active)
      } else if (templateFilters.status === 'approved') {
        filtered = filtered.filter(t => t.is_approved && t.is_active)
      } else if (templateFilters.status === 'rejected') {
        filtered = filtered.filter(t => !t.is_approved && !t.is_active)
      }
    }

    // Filter by category
    if (templateFilters.category !== 'all') {
      filtered = filtered.filter(t => t.category === templateFilters.category)
    }

    // Filter by creator
    if (templateFilters.creator !== 'all') {
      filtered = filtered.filter(t => t.creator?.display_name === templateFilters.creator)
    }

    // Filter by search
    if (templateFilters.search) {
      const searchLower = templateFilters.search.toLowerCase()
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(searchLower) ||
        t.description?.toLowerCase().includes(searchLower) ||
        t.creator?.display_name?.toLowerCase().includes(searchLower)
      )
    }

    return filtered
  }

  const getUniqueCategories = () => {
    const categories = [...new Set(allTemplates.map(t => t.category).filter(Boolean))]
    return categories.sort()
  }

  const getUniqueCreators = () => {
    const creators = [...new Set(allTemplates.map(t => t.creator?.display_name).filter(Boolean))]
    return creators.sort()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <SEOHead 
        title="Admin Portal - BuyPrintz"
        description="Administrative dashboard for platform management"
        keywords="admin, management, platform, buyprintz"
      />
      
      {/* Sidebar */}
      <div className="w-64 backdrop-blur-xl bg-white/80 border-r border-white/30 shadow-lg flex flex-col">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-white/30">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl shadow-lg border border-white/30">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Portal</h1>
              <p className="text-xs text-gray-600">Platform Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-4">
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-600 shadow-md border border-blue-200'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/30">
          <div className="text-xs text-gray-500 mb-2">
            Welcome, {user?.full_name || user?.email}
          </div>
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center px-4 py-2 bg-white/30 hover:bg-white/50 rounded-lg text-gray-700 transition-all duration-200 text-sm"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="backdrop-blur-xl bg-white/80 border-b border-white/30 shadow-sm">
          <div className="px-6 py-4">
            <h2 className="text-2xl font-bold text-gray-900 capitalize">
              {activeTab === 'overview' ? 'Dashboard Overview' : activeTab}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {activeTab === 'overview' && 'Platform statistics and recent activity'}
              {activeTab === 'templates' && 'Manage and approve template submissions'}
              {activeTab === 'users' && 'User management and moderation tools'}
              {activeTab === 'analytics' && 'Platform analytics and reporting'}
              {activeTab === 'settings' && 'Admin settings and configuration'}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Total Users', value: adminStats.totalUsers, icon: Users, color: 'blue' },
                { label: 'Total Creators', value: adminStats.totalCreators, icon: UserCheck, color: 'green' },
                { label: 'Total Templates', value: adminStats.totalTemplates, icon: FileText, color: 'purple' },
                { label: 'Pending Templates', value: adminStats.pendingTemplates, icon: AlertTriangle, color: 'yellow' },
                { label: 'Total Orders', value: adminStats.totalOrders, icon: Package, color: 'indigo' },
                { label: 'Total Revenue', value: `$${(adminStats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'emerald' }
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 bg-${stat.color}-100 rounded-xl`}>
                        <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Templates */}
              <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Templates</h3>
                  <button
                    onClick={loadPendingTemplates}
                    className="p-2 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                {loadingStates.pendingTemplates ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-16"></div>
                      </div>
                    ))}
                  </div>
                ) : pendingTemplates.length > 0 ? (
                  <div className="space-y-3">
                    {pendingTemplates.slice(0, 5).map((template) => (
                      <div key={template.id} className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Palette className="w-5 h-5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{template.name}</p>
                            <p className="text-sm text-gray-600">by {template.creator?.display_name}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveTemplate(template.id)}
                            className="p-2 bg-green-100 hover:bg-green-200 rounded-lg text-green-600 transition-colors"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectTemplate(template.id)}
                            className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 transition-colors"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No pending templates</p>
                )}
              </div>

              {/* Recent Users */}
              <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                  <button
                    onClick={loadRecentUsers}
                    className="p-2 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                {loadingStates.recentUsers ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="bg-gray-200 rounded-lg h-12"></div>
                      </div>
                    ))}
                  </div>
                ) : recentUsers.length > 0 ? (
                  <div className="space-y-3">
                    {recentUsers.map((user) => (
                      <div key={user.user_id} className="flex items-center justify-between p-3 bg-white/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.email}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(user.created_at).toLocaleDateString()}
                              {user.is_creator && <span className="ml-2 text-green-600">Creator</span>}
                              {user.full_name && <span className="ml-2 text-gray-500">({user.full_name})</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="p-2 bg-blue-100 hover:bg-blue-200 rounded-lg text-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No recent users</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Template Filters and Actions */}
            <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Template Management</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkApprove}
                    disabled={selectedTemplates.length === 0}
                    className="px-4 py-2 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 text-green-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Selected ({selectedTemplates.length})
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={selectedTemplates.length === 0}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 text-red-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Selected ({selectedTemplates.length})
                  </button>
                  <button
                    onClick={loadAllTemplates}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search templates..."
                    value={templateFilters.search}
                    onChange={(e) => setTemplateFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={templateFilters.status}
                    onChange={(e) => setTemplateFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Templates</option>
                    <option value="pending">Pending Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={templateFilters.category}
                    onChange={(e) => setTemplateFilters(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    {getUniqueCategories().map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                {/* Creator Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Creator</label>
                  <select
                    value={templateFilters.creator}
                    onChange={(e) => setTemplateFilters(prev => ({ ...prev, creator: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Creators</option>
                    {getUniqueCreators().map(creator => (
                      <option key={creator} value={creator}>{creator}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Templates Grid */}
            <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
              {/* Debug Info */}
              <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                Debug: Loading: {loadingStates.allTemplates ? 'true' : 'false'}, 
                Templates: {allTemplates.length}, 
                Filtered: {getFilteredTemplates().length}
              </div>
              
              {loadingStates.allTemplates ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-64"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {/* Select All */}
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.length === getFilteredTemplates().length && getFilteredTemplates().length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      Select All ({getFilteredTemplates().length} templates)
                    </span>
                  </div>

                  {/* Templates Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredTemplates().map((template) => (
                      <div key={template.id} className="bg-white/30 rounded-xl p-4 border border-white/30 hover:shadow-lg transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <input
                            type="checkbox"
                            checked={selectedTemplates.includes(template.id)}
                            onChange={() => handleTemplateSelect(template.id)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            !template.is_approved && template.is_active 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : template.is_approved && template.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {!template.is_approved && template.is_active 
                              ? 'Pending' 
                              : template.is_approved && template.is_active
                              ? 'Approved'
                              : 'Rejected'
                            }
                          </div>
                        </div>

                        {/* Template Preview */}
                        <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          {template.preview_image_url ? (
                            <img 
                              src={template.preview_image_url} 
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Palette className="w-12 h-12 text-gray-400" />
                          )}
                        </div>

                        {/* Template Info */}
                        <div className="space-y-2">
                          <h3 className="font-semibold text-gray-900 truncate">{template.name}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>by {template.creator?.display_name || 'Unknown'}</span>
                            <span>${template.price}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {template.category} • {new Date(template.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-4">
                          <button
                            onClick={() => handleApproveTemplate(template.id)}
                            disabled={template.is_approved}
                            className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 text-green-700 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectTemplate(template.id)}
                            disabled={!template.is_active}
                            className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 text-red-700 rounded-lg transition-colors text-sm flex items-center justify-center gap-1"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {getFilteredTemplates().length === 0 && (
                    <div className="text-center py-12">
                      <Palette className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
                      <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">User Management</h2>
            <p className="text-gray-600">User management features coming soon...</p>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Analytics</h2>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Settings</h2>
            <p className="text-gray-600">Admin settings coming soon...</p>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}

export default Admin
