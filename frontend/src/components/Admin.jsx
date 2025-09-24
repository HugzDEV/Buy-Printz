import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Users, FileText, BarChart3, Settings, 
  CheckCircle, XCircle, AlertTriangle, Eye, 
  Trash2, Ban, UserCheck, TrendingUp, DollarSign,
  Package, Palette, Calendar, Activity, RefreshCw,
  Menu, X, ChevronLeft, ChevronRight, Search, Filter, Crown, User, ChevronDown, ChevronUp, Edit, Save, X as XIcon
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    pendingTemplates: true,
    recentUsers: true,
    allTemplates: true,
    users: true
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedUser, setExpandedUser] = useState(null)
  const [userDetails, setUserDetails] = useState({})
  const [adminNotes, setAdminNotes] = useState({})
  const [editingNotes, setEditingNotes] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    checkAdminAccess()
  }, [])


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
      setLoadingStates(prev => ({ ...prev, users: true }))
      
      const response = await authService.authenticatedRequest('/api/admin/users?limit=50')
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
      setLoadingStates(prev => ({ ...prev, users: false }))
    }
  }

  const loadAllTemplates = async () => {
    try {
      setLoadingStates(prev => ({ ...prev, allTemplates: true }))
      
      const response = await authService.authenticatedRequest('/api/admin/templates/all')
      const result = await response.json()
      
      if (result.success) {
        setAllTemplates(result.templates || [])
      } else {
        console.error('Failed to load templates:', result)
        setAllTemplates([])
      }
    } catch (error) {
      console.error('Error loading all templates:', error)
      setAllTemplates([])
    } finally {
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

  const handleDeleteTemplate = async (templateId) => {
    if (!window.confirm('Are you sure you want to permanently delete this template? This action cannot be undone.')) {
      return
    }

    try {
      const response = await authService.authenticatedRequest(`/api/admin/templates/${templateId}/delete`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Template deleted successfully')
        await loadPendingTemplates()
        await loadAllTemplates()
        await loadAdminStats()
      } else {
        throw new Error('Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedTemplates.length === 0) {
      toast.error('Please select templates to delete')
      return
    }

    if (!window.confirm(`Are you sure you want to permanently delete ${selectedTemplates.length} templates? This action cannot be undone.`)) {
      return
    }

    try {
      const promises = selectedTemplates.map(templateId => 
        authService.authenticatedRequest(`/api/admin/templates/${templateId}/delete`, {
          method: 'DELETE'
        })
      )
      
      await Promise.all(promises)
      toast.success(`${selectedTemplates.length} templates deleted successfully`)
      setSelectedTemplates([])
      await loadPendingTemplates()
      await loadAllTemplates()
      await loadAdminStats()
    } catch (error) {
      console.error('Error bulk deleting templates:', error)
      toast.error('Failed to delete templates')
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

  const handleBanUser = async (userId) => {
    if (!confirm('Are you sure you want to ban this user?')) return
    
    try {
      const response = await authService.authenticatedRequest(`/api/admin/users/${userId}/ban`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: 'Platform abuse'
        })
      })
      
      if (response.ok) {
        toast.success('User banned successfully')
        await loadRecentUsers()
        await loadAdminStats()
      } else {
        throw new Error('Failed to ban user')
      }
    } catch (error) {
      console.error('Error banning user:', error)
      toast.error('Failed to ban user')
    }
  }

  const handleUnbanUser = async (userId) => {
    if (!confirm('Are you sure you want to unban this user?')) return
    
    try {
      const response = await authService.authenticatedRequest(`/api/admin/users/${userId}/unban`, {
        method: 'PUT'
      })
      
      if (response.ok) {
        toast.success('User unbanned successfully')
        await loadRecentUsers()
        await loadAdminStats()
      } else {
        throw new Error('Failed to unban user')
      }
    } catch (error) {
      console.error('Error unbanning user:', error)
      toast.error('Failed to unban user')
    }
  }

  const loadUserDetails = async (userId) => {
    try {
      // Load user's personal templates (banner_templates) and marketplace templates (creator_templates)
      const [bannerTemplatesResponse, creatorTemplatesResponse] = await Promise.all([
        authService.authenticatedRequest(`/api/templates?user_id=${userId}`), // Personal templates from banner_templates table
        authService.authenticatedRequest(`/api/admin/templates/all`) // All creator templates to filter by user
      ])
      
      const bannerTemplatesData = await bannerTemplatesResponse.json()
      const creatorTemplatesData = await creatorTemplatesResponse.json()
      
      // Handle different possible response structures
      const userBannerTemplates = Array.isArray(bannerTemplatesData) ? bannerTemplatesData : (bannerTemplatesData?.templates || [])
      const allCreatorTemplates = Array.isArray(creatorTemplatesData) ? creatorTemplatesData : (creatorTemplatesData?.templates || [])
      
      // Filter creator templates by user ID to show only this user's marketplace uploads
      const userCreatorTemplates = allCreatorTemplates.filter(template => template.creator_id === userId)
      
      setUserDetails(prev => ({
        ...prev,
        [userId]: {
          userTemplates: userBannerTemplates, // Personal templates from banner_templates
          creatorTemplates: userCreatorTemplates, // Marketplace uploads from creator_templates
          lastLogin: recentUsers.find(u => u.user_id === userId)?.last_login
        }
      }))
    } catch (error) {
      console.error('Error loading user details:', error)
      setUserDetails(prev => ({
        ...prev,
        [userId]: {
          userTemplates: [],
          creatorTemplates: [],
          lastLogin: null,
          error: 'Failed to load details'
        }
      }))
    }
  }

  const loadAdminNotes = async (userId) => {
    try {
      const response = await authService.authenticatedRequest(`/api/admin/notes/${userId}`)
      if (response.ok) {
        const result = await response.json()
        if (result.notes && result.notes.length > 0) {
          setAdminNotes(prev => ({
            ...prev,
            [userId]: result.notes[0] // Get the most recent note
          }))
        }
      }
    } catch (error) {
      console.error('Error loading admin notes:', error)
    }
  }

  const toggleUserExpansion = (userId) => {
    if (expandedUser === userId) {
      setExpandedUser(null)
    } else {
      setExpandedUser(userId)
      if (!userDetails[userId]) {
        loadUserDetails(userId)
      }
      if (!adminNotes[userId]) {
        loadAdminNotes(userId)
      }
    }
  }

  const saveAdminNote = async (userId, note) => {
    try {
      const response = await authService.authenticatedRequest(`/api/admin/notes/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note })
      })
      
      if (response.ok) {
        const result = await response.json()
        setAdminNotes(prev => ({
          ...prev,
          [userId]: result.note
        }))
        setEditingNotes(null)
        toast.success('Admin note saved successfully')
      } else {
        throw new Error('Failed to save admin note')
      }
    } catch (error) {
      console.error('Error saving admin note:', error)
      toast.error('Failed to save admin note')
    }
  }

  const startEditingNotes = (userId) => {
    setEditingNotes(userId)
  }

  const cancelEditingNotes = () => {
    setEditingNotes(null)
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex">
      <SEOHead 
        title="Admin Portal - BuyPrintz"
        description="Administrative dashboard for platform management"
        keywords="admin, management, platform, buyprintz"
      />
      
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out bg-gradient-to-b from-blue-600 via-purple-600 to-indigo-700 backdrop-blur-xl border-r border-white/20 shadow-2xl flex flex-col relative`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center justify-center w-full">
                <div className="w-24 h-24 rounded-xl shadow-lg flex items-center justify-center">
                    <img 
                      src="/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png" 
                      alt="BuyPrintz Logo" 
                      className="w-20 h-20 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'block'
                      }}
                    />
                  <div className="w-20 h-20 bg-white rounded-lg flex items-center justify-center text-[#00D755] font-bold text-2xl" style={{display: 'none'}}>
                    BP
                  </div>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-white/20 rounded-lg transition-all duration-200 text-white hover:text-white/80"
            >
              {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
            </button>
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
                  className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === tab.id
                      ? 'bg-white/20 text-white shadow-lg border border-white/30 backdrop-blur-sm'
                      : 'text-white/80 hover:bg-white/10 hover:text-white hover:shadow-md'
                  }`}
                  title={sidebarCollapsed ? tab.label : ''}
                >
                  <Icon className="w-5 h-5" />
                  {!sidebarCollapsed && <span className="font-medium">{tab.label}</span>}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-white/20">
          {!sidebarCollapsed && (
            <div className="text-xs text-white/60 mb-3">
              Welcome, {user?.full_name || user?.email}
            </div>
          )}
          <Link
            to="/dashboard"
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'justify-center space-x-2'} px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md border border-white/20`}
            title={sidebarCollapsed ? 'Back to Dashboard' : ''}
          >
            <span>←</span>
            {!sidebarCollapsed && <span>Back to Dashboard</span>}
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}
        <div className="backdrop-blur-xl bg-white/70 border-b border-white/40 shadow-lg">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
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
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-[#00D755] rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Admin Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { label: 'Total Users', value: adminStats.totalUsers, icon: Users, color: 'blue', bgGradient: 'from-blue-50 to-blue-100' },
                { label: 'Total Creators', value: adminStats.totalCreators, icon: UserCheck, color: 'green', bgGradient: 'from-[#00D755]/10 to-[#00D755]/20' },
                { label: 'Total Templates', value: adminStats.totalTemplates, icon: FileText, color: 'purple', bgGradient: 'from-purple-50 to-purple-100' },
                { label: 'Pending Templates', value: adminStats.pendingTemplates, icon: AlertTriangle, color: 'yellow', bgGradient: 'from-yellow-50 to-yellow-100' },
                { label: 'Total Orders', value: adminStats.totalOrders, icon: Package, color: 'indigo', bgGradient: 'from-indigo-50 to-indigo-100' },
                { label: 'Total Revenue', value: `$${(adminStats.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: 'emerald', bgGradient: 'from-[#00D755]/10 to-[#00D755]/20' }
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      </div>
                      <div className={`p-3 bg-gradient-to-br ${stat.bgGradient} rounded-xl shadow-md border border-white/50`}>
                        <Icon className={`w-6 h-6 ${stat.color === 'green' || stat.color === 'emerald' ? 'text-[#00D755]' : `text-${stat.color}-600`}`} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pending Templates */}
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Pending Templates</h3>
                  <button
                    onClick={loadPendingTemplates}
                    className="p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:shadow-md"
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
                      <div key={template.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-white/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-[#00D755]/20 to-[#00D755]/30 rounded-lg flex items-center justify-center shadow-sm">
                            <Palette className="w-5 h-5 text-[#00D755]" />
                          </div>
                            <div>
                              <p className="font-medium text-gray-900">{template.name}</p>
                              <div className="text-sm text-gray-600">
                                <span>by {template.creator?.display_name || 'Unknown'}</span>
                                {/* Debug info - remove after fixing */}
                                {process.env.NODE_ENV === 'development' && (
                                  <span className="text-xs text-gray-400 ml-2">
                                    (Debug: {template.creator ? 'Has creator data' : 'No creator data'})
                                  </span>
                                )}
                              </div>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveTemplate(template.id)}
                            className="p-2 bg-gradient-to-br from-[#00D755]/20 to-[#00D755]/30 hover:from-[#00D755]/30 hover:to-[#00D755]/40 rounded-lg text-[#00D755] transition-all duration-200 shadow-sm hover:shadow-md"
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRejectTemplate(template.id)}
                            className="p-2 bg-gradient-to-br from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 rounded-lg text-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
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
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
                  <button
                    onClick={loadRecentUsers}
                    className="p-2 hover:bg-white/60 rounded-lg transition-all duration-200 hover:shadow-md"
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
                      <div key={user.user_id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-white/50 shadow-sm hover:shadow-md transition-all duration-200">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center shadow-sm">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.email}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(user.created_at).toLocaleDateString()}
                              {user.is_creator && <span className="ml-2 text-[#00D755] font-medium">Creator</span>}
                              {user.full_name && <span className="ml-2 text-gray-500">({user.full_name})</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 rounded-lg text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md"
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
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Template Management</h2>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkApprove}
                    disabled={selectedTemplates.length === 0}
                    className="px-4 py-2 bg-gradient-to-r from-[#00D755]/20 to-[#00D755]/30 hover:from-[#00D755]/30 hover:to-[#00D755]/40 disabled:bg-gray-100 disabled:text-gray-400 text-[#00D755] rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md font-medium"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approve Selected ({selectedTemplates.length})
                  </button>
                  <button
                    onClick={handleBulkReject}
                    disabled={selectedTemplates.length === 0}
                    className="px-4 py-2 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 disabled:bg-gray-100 disabled:text-gray-400 text-red-700 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Selected ({selectedTemplates.length})
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    disabled={selectedTemplates.length === 0}
                    className="px-4 py-2 bg-gradient-to-r from-red-200 to-red-300 hover:from-red-300 hover:to-red-400 disabled:bg-gray-100 disabled:text-gray-400 text-red-800 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedTemplates.length})
                  </button>
                  <button
                    onClick={loadAllTemplates}
                    className="px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 hover:from-blue-200 hover:to-indigo-200 text-blue-700 rounded-lg transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md font-medium"
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
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
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
                      <div key={template.id} className="bg-white/70 rounded-xl p-4 border border-white/50 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
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
                              ? 'bg-[#00D755]/20 text-[#00D755]'
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
                              <div className="flex items-center space-x-2">
                                <span>by {template.creator?.display_name || 'Unknown'}</span>
                                {/* Debug info - remove after fixing */}
                                {process.env.NODE_ENV === 'development' && (
                                  <span className="text-xs text-gray-400">
                                    (Debug: {template.creator ? 'Has creator data' : 'No creator data'})
                                  </span>
                                )}
                              </div>
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
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-[#00D755]/20 to-[#00D755]/30 hover:from-[#00D755]/30 hover:to-[#00D755]/40 disabled:bg-gray-100 disabled:text-gray-400 text-[#00D755] rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1 shadow-sm hover:shadow-md font-medium"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectTemplate(template.id)}
                            disabled={!template.is_active}
                            className="flex-1 px-3 py-2 bg-gradient-to-r from-red-100 to-red-200 hover:from-red-200 hover:to-red-300 disabled:bg-gray-100 disabled:text-gray-400 text-red-700 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1 shadow-sm hover:shadow-md font-medium"
                          >
                            <XCircle className="w-4 h-4" />
                            Reject
                          </button>
                          <button
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="px-3 py-2 bg-gradient-to-r from-red-200 to-red-300 hover:from-red-300 hover:to-red-400 text-red-800 rounded-lg transition-all duration-200 text-sm flex items-center justify-center gap-1 shadow-sm hover:shadow-md font-medium"
                            title="Delete Template"
                          >
                            <Trash2 className="w-4 h-4" />
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
          <div className="space-y-6">
            {/* Users Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">User Management</h2>
                <p className="text-gray-600">Manage platform users, creators, and permissions</p>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg bg-white/30 backdrop-blur-sm border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 w-full sm:w-64"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="pl-10 pr-8 py-2 rounded-lg bg-white/30 backdrop-blur-sm border border-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50 appearance-none"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active Users</option>
                    <option value="banned">Banned Users</option>
                    <option value="creators">Creators Only</option>
                    <option value="regular">Regular Users</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers || 0}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-md border border-white/50">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">{recentUsers.filter(u => u.is_active).length}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-[#00D755]/10 to-[#00D755]/20 rounded-xl shadow-md border border-white/50">
                    <CheckCircle className="w-6 h-6 text-[#00D755]" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Creators</p>
                    <p className="text-2xl font-bold text-gray-900">{recentUsers.filter(u => u.is_creator).length}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-md border border-white/50">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Banned Users</p>
                    <p className="text-2xl font-bold text-gray-900">{recentUsers.filter(u => !u.is_active).length}</p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 rounded-xl shadow-md border border-white/50">
                    <XCircle className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Users List */}
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">All Users</h3>
                <button
                  onClick={() => loadRecentUsers()}
                  disabled={loadingStates.users}
                  className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-gray-600 hover:text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 hover:border-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh users"
                >
                  <RefreshCw className={`w-4 h-4 ${loadingStates.users ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loadingStates.users ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 rounded-lg h-16 mb-2"></div>
                    </div>
                  ))}
                </div>
              ) : recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers
                    .filter(user => {
                      const matchesSearch = searchTerm === '' || 
                        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        user.user_id.toLowerCase().includes(searchTerm.toLowerCase())
                      
                      const matchesStatus = statusFilter === 'all' || 
                        (statusFilter === 'active' && user.is_active) ||
                        (statusFilter === 'banned' && !user.is_active) ||
                        (statusFilter === 'creators' && user.is_creator) ||
                        (statusFilter === 'regular' && !user.is_creator)
                      
                      return matchesSearch && matchesStatus
                    })
                    .map((user) => (
                    <div key={user.user_id} className="bg-white/50 rounded-lg border border-white/50 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
                      {/* User Header - Clickable */}
                      <div 
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/30 transition-colors"
                        onClick={() => toggleUserExpansion(user.user_id)}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-sm">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.email}</p>
                            <p className="text-sm text-gray-600">
                              {new Date(user.created_at).toLocaleDateString()}
                              {user.is_creator && <span className="ml-2 text-[#00D755] font-medium">Creator</span>}
                              {user.full_name && <span className="ml-2 text-gray-500">({user.full_name})</span>}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.is_active 
                              ? 'bg-[#00D755]/20 text-[#00D755]' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.is_active ? 'Active' : 'Banned'}
                          </span>
                          <div className="flex space-x-1">
                            {user.is_active ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleBanUser(user.user_id)
                                }}
                                className="p-2 bg-red-100 hover:bg-red-200 rounded-lg text-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Ban user"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleUnbanUser(user.user_id)
                                }}
                                className="p-2 bg-[#00D755]/20 hover:bg-[#00D755]/30 rounded-lg text-[#00D755] transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Unban user"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <button className="p-1 text-gray-400 hover:text-gray-600 transition-colors">
                            {expandedUser === user.user_id ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded User Details */}
                      {expandedUser === user.user_id && (
                        <div className="border-t border-white/30 bg-white/20 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Login & Activity Data */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 flex items-center">
                                <Activity className="w-4 h-4 mr-2 text-blue-600" />
                                Login & Activity
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/30 rounded-lg">
                                  <span className="text-sm text-gray-600">Last Login:</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {userDetails[user.user_id]?.lastLogin 
                                      ? new Date(userDetails[user.user_id].lastLogin).toLocaleString()
                                      : 'Never'
                                    }
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/30 rounded-lg">
                                  <span className="text-sm text-gray-600">Account Created:</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {new Date(user.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/30 rounded-lg">
                                  <span className="text-sm text-gray-600">User ID:</span>
                                  <span className="text-xs font-mono text-gray-500">
                                    {user.user_id}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Template & Marketplace Stats */}
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900 flex items-center">
                                <FileText className="w-4 h-4 mr-2 text-purple-600" />
                                Templates & Uploads
                              </h4>
                              <div className="space-y-3">
                                <div className="flex justify-between items-center p-3 bg-white/30 rounded-lg">
                                  <span className="text-sm text-gray-600">Personal Templates:</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {userDetails[user.user_id]?.userTemplates?.length || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/30 rounded-lg">
                                  <span className="text-sm text-gray-600">Marketplace Uploads:</span>
                                  <span className="text-sm font-medium text-gray-900">
                                    {userDetails[user.user_id]?.creatorTemplates?.length || 0}
                                  </span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-white/30 rounded-lg">
                                  <span className="text-sm text-gray-600">Total Templates:</span>
                                  <span className="text-sm font-bold text-[#00D755]">
                                    {(userDetails[user.user_id]?.userTemplates?.length || 0) + 
                                     (userDetails[user.user_id]?.creatorTemplates?.length || 0)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                        {/* Admin Notes Section */}
                        <div className="mt-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-semibold text-gray-900 flex items-center">
                              <Edit className="w-4 h-4 mr-2 text-orange-600" />
                              Admin Notes
                            </h4>
                            {!editingNotes && (
                              <button
                                onClick={() => startEditingNotes(user.user_id)}
                                className="p-2 bg-orange-100 hover:bg-orange-200 rounded-lg text-orange-600 transition-all duration-200 shadow-sm hover:shadow-md"
                                title="Add/Edit admin note"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          {editingNotes === user.user_id ? (
                            <div className="space-y-3">
                              <textarea
                                placeholder="Add admin notes for customer service reference..."
                                defaultValue={adminNotes[user.user_id]?.note || ''}
                                className="w-full p-3 bg-white/30 border border-white/30 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 resize-none"
                                rows={3}
                                id={`admin-note-${user.user_id}`}
                              />
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => {
                                    const note = document.getElementById(`admin-note-${user.user_id}`).value
                                    saveAdminNote(user.user_id, note)
                                  }}
                                  className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                                >
                                  <Save className="w-4 h-4" />
                                  Save Note
                                </button>
                                <button
                                  onClick={cancelEditingNotes}
                                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium flex items-center gap-1"
                                >
                                  <XIcon className="w-4 h-4" />
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="p-4 bg-white/30 rounded-lg border border-white/30">
                              {adminNotes[user.user_id]?.note ? (
                                <div>
                                  <p className="text-sm text-gray-900 mb-2">{adminNotes[user.user_id].note}</p>
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span>Last updated: {new Date(adminNotes[user.user_id].updated_at).toLocaleString()}</span>
                                    <span>By: {adminNotes[user.user_id].updated_by || 'Admin'}</span>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No admin notes yet. Click edit to add notes for customer service reference.</p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Recent Templates Preview */}
                          {userDetails[user.user_id]?.userTemplates?.length > 0 && (
                            <div className="mt-6">
                              <h5 className="font-medium text-gray-900 mb-3">Recent Personal Templates</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {userDetails[user.user_id].userTemplates.slice(0, 4).map((template) => (
                                  <div key={template.id} className="p-3 bg-white/30 rounded-lg border border-white/30">
                                    <p className="text-sm font-medium text-gray-900 truncate">{template.name}</p>
                                    <p className="text-xs text-gray-500">{template.category}</p>
                                    <p className="text-xs text-gray-400">
                                      {new Date(template.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Recent Marketplace Uploads Preview */}
                          {userDetails[user.user_id]?.creatorTemplates?.length > 0 && (
                            <div className="mt-6">
                              <h5 className="font-medium text-gray-900 mb-3">Recent Marketplace Uploads</h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {userDetails[user.user_id].creatorTemplates.slice(0, 4).map((template) => (
                                  <div key={template.id} className="p-3 bg-white/30 rounded-lg border border-white/30">
                                    <p className="text-sm font-medium text-gray-900 truncate">{template.name}</p>
                                    <p className="text-xs text-gray-500">{template.category}</p>
                                    <div className="flex items-center justify-between mt-1">
                                      <span className="text-xs text-gray-400">
                                        {new Date(template.created_at).toLocaleDateString()}
                                      </span>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        template.is_approved 
                                          ? 'bg-[#00D755]/20 text-[#00D755]' 
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {template.is_approved ? 'Approved' : 'Pending'}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Loading State */}
                          {!userDetails[user.user_id] && (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                              <span className="ml-2 text-sm text-gray-600">Loading user details...</span>
                            </div>
                          )}

                          {/* Error State */}
                          {userDetails[user.user_id]?.error && (
                            <div className="flex items-center justify-center py-8">
                              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                              <span className="text-sm text-red-600">Failed to load user details</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Platform Analytics</h2>
            <p className="text-gray-600">Analytics dashboard coming soon...</p>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300">
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
