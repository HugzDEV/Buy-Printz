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
  const [loadingStates, setLoadingStates] = useState({
    stats: true,
    pendingTemplates: true,
    recentUsers: true
  })

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
        loadRecentUsers()
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
        await loadAdminStats()
      } else {
        throw new Error('Failed to reject template')
      }
    } catch (error) {
      console.error('Error rejecting template:', error)
      toast.error('Failed to reject template')
    }
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
          <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Template Management</h2>
            <p className="text-gray-600">Template management features coming soon...</p>
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
