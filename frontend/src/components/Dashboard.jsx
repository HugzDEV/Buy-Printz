import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  User, Palette, ShoppingBag, Settings, LogOut, Plus, 
  Eye, Download, Calendar, DollarSign, Package, 
  FileText, BarChart3, TrendingUp, Activity, 
  Star, Edit, Trash2, RefreshCw, Archive,
  Filter, Search, Clock, CheckCircle, XCircle,
  AlertCircle, Truck, Crown, Layers, Layout,
  PaintBucket, Ruler, Tag, MapPin, ShoppingCart
} from 'lucide-react'
import toast from 'react-hot-toast'
import authService from '../services/auth'

const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [designs, setDesigns] = useState([])
  const [orders, setOrders] = useState([])
  const [templates, setTemplates] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [preferences, setPreferences] = useState(null)
  const [pendingOrders, setPendingOrders] = useState([])
  const [completedDesigns, setCompletedDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingStates, setLoadingStates] = useState({
    designs: true,
    orders: true,
    templates: true,
    pendingOrders: true,
    completedDesigns: true,
    stats: true,
    preferences: true
  })
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileModalType, setProfileModalType] = useState('')
  const [profileForm, setProfileForm] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadDashboardData()
  }, [])

  // Check for URL parameters to set active tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const tabParam = searchParams.get('tab')
    if (tabParam && ['overview', 'designs', 'templates', 'orders', 'pending', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam)
    }
  }, [location.search])

  const loadDashboardData = async () => {
    try {
      // Since we're already protected by ProtectedRoute, just get user info
      const currentUser = await authService.getCurrentUser()
      
      if (!currentUser) {
        // This should rarely happen since ProtectedRoute handles auth
        console.warn('No user found in dashboard, redirecting to login')
        navigate('/login')
        return
      }

      setUser(currentUser)

      // Load essential data first to show basic dashboard
      setLoading(false)

      // Load data progressively to avoid overwhelming mobile connections
      await loadDataProgressively()

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
      setLoading(false)
      
      // Set all loading states to false to show empty states
      setLoadingStates({
        designs: false,
        orders: false,
        templates: false,
        pendingOrders: false,
        completedDesigns: false,
        stats: false,
        preferences: false
      })
    }
  }

  const loadDataProgressively = async () => {
    const loadDataSafely = async (apiCall, setter, fallback, loadingKey) => {
      try {
        // Add timeout to prevent infinite loading
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        )
        
        const response = await Promise.race([apiCall(), timeoutPromise])
        const data = await response.json()
        if (data.success) {
          setter(data.designs || data.orders || data.templates || data.preferences || data)
        } else {
          console.warn(`API returned error for ${loadingKey}:`, data)
          setter(fallback)
        }
      } catch (error) {
        console.warn(`API call failed for ${loadingKey}, using fallback:`, error)
        setter(fallback)
        
        // Only show error toast for critical data
        if (['designs', 'orders'].includes(loadingKey)) {
          toast.error(`Failed to load ${loadingKey}. Using offline mode.`)
        }
      } finally {
        setLoadingStates(prev => ({ ...prev, [loadingKey]: false }))
      }
    }

    // Load core data first (designs and orders)
    await Promise.all([
      loadDataSafely(
        () => authService.authenticatedRequest('/api/designs'),
        (data) => setDesigns(data.designs || []),
        [],
        'designs'
      ),
      loadDataSafely(
        () => authService.authenticatedRequest('/api/orders'),
        (data) => setOrders(data.orders || []),
        [],
        'orders'
      )
    ])

    // Small delay to prevent overwhelming mobile connections
    await new Promise(resolve => setTimeout(resolve, 100))

    // Load secondary data
    await Promise.all([
      loadDataSafely(
        () => authService.authenticatedRequest('/api/templates/user'),
        (data) => setTemplates(data.templates || []),
        [],
        'templates'
      ),
      loadDataSafely(
        () => authService.authenticatedRequest('/api/orders/pending'),
        (data) => setPendingOrders(data.orders || []),
        [],
        'pendingOrders'
      )
    ])

    // Another small delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // Load tertiary data
    await Promise.all([
      loadDataSafely(
        () => authService.authenticatedRequest('/api/designs/completed'),
        (data) => setCompletedDesigns(data.designs || []),
        [],
        'completedDesigns'
      ),
      loadDataSafely(
        () => authService.authenticatedRequest('/api/user/stats'),
        (data) => setUserStats(data),
        null,
        'stats'
      ),
      loadDataSafely(
        () => authService.authenticatedRequest('/api/user/preferences'),
        (data) => setPreferences(data.preferences || null),
        null,
        'preferences'
      )
    ])
  }

  const handleLogout = async () => {
    try {
      await authService.logout()
      toast.success('Logged out successfully')
      navigate('/login')
    } catch (error) {
      toast.error('Logout failed')
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'payment_failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4" />
      case 'pending':
        return <Clock className="w-4 h-4" />
      case 'processing':
        return <Activity className="w-4 h-4" />
      case 'shipped':
        return <Truck className="w-4 h-4" />
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'payment_failed':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Package className="w-4 h-4" />
    }
  }

  const getBannerTypeColor = (bannerType) => {
    if (bannerType?.includes('vinyl')) return 'bg-blue-100 text-blue-800'
    if (bannerType?.includes('mesh')) return 'bg-green-100 text-green-800'
    if (bannerType?.includes('fabric')) return 'bg-purple-100 text-purple-800'
    if (bannerType?.includes('indoor')) return 'bg-orange-100 text-orange-800'
    return 'bg-gray-100 text-gray-800'
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Filter orders based on search and status - only show completed orders
  const completedOrders = orders.filter(order => 
    ['completed', 'paid', 'approved', 'shipped', 'delivered'].includes(order.status)
  )
  
  const filteredOrders = completedOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.banner_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.banner_material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const loadDesignInEditor = (design) => {
    // Store design data for the editor to load
    localStorage.setItem('loadDesign', JSON.stringify(design))
    navigate('/editor')
  }

  const deleteTemplate = async (templateId) => {
    if (!confirm('Are you sure you want to delete this template?')) return
    
    try {
      const response = await authService.authenticatedRequest(`/api/templates/${templateId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Template deleted successfully')
        setTemplates(templates.filter(t => t.id !== templateId))
      } else {
        throw new Error('Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    setShowOrderModal(true)
  }

  const closeOrderModal = () => {
    setSelectedOrder(null)
    setShowOrderModal(false)
  }

  const reorderItem = (order) => {
    // Store order data for reordering
    localStorage.setItem('reorderData', JSON.stringify(order))
    navigate('/editor')
    toast.success('Order data loaded for reordering')
  }

  const reorderDesign = (design) => {
    // Store design data for reordering  
    localStorage.setItem('reorderData', JSON.stringify(design))
    navigate('/editor')
    toast.success('Design loaded for reordering')
  }

  const deleteDesign = async (designId) => {
    if (!confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      return
    }

    try {
      const response = await authService.authenticatedRequest(`/api/designs/${designId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast.success('Design deleted successfully')
        // Remove from local state
        setDesigns(designs.filter(d => d.id !== designId))
        // Reload dashboard data to update counts
        loadDashboardData()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to delete design')
      }
    } catch (error) {
      console.error('Error deleting design:', error)
      toast.error(`Failed to delete design: ${error.message}`)
    }
  }

  const getStatusClass = (status) => {
    return getStatusColor(status) // Use the same function as getStatusColor
  }

  // Profile Management Functions
  const openProfileModal = (type) => {
    setProfileModalType(type)
    if (type === 'update') {
      setProfileForm({
        fullName: user?.full_name || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    }
    setShowProfileModal(true)
  }

  const closeProfileModal = () => {
    setShowProfileModal(false)
    setProfileModalType('')
    setProfileForm({
      fullName: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const updateProfile = async () => {
    try {
      const response = await authService.authenticatedRequest('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: profileForm.fullName,
          email: profileForm.email
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success('Profile updated successfully')
          setUser(prev => ({
            ...prev,
            full_name: profileForm.fullName,
            email: profileForm.email
          }))
          closeProfileModal()
        } else {
          throw new Error(data.error || 'Failed to update profile')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to update profile')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(error.message || 'Failed to update profile')
    }
  }

  const changePassword = async () => {
    if (profileForm.newPassword !== profileForm.confirmPassword) {
      toast.error('New passwords do not match')
      return
    }

    if (profileForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      const response = await authService.authenticatedRequest('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: profileForm.currentPassword,
          new_password: profileForm.newPassword
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success('Password changed successfully')
          closeProfileModal()
        } else {
          throw new Error(data.error || 'Failed to change password')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to change password')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error(error.message || 'Failed to change password')
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone and will delete all your designs, orders, and data.')) {
      return
    }

    const confirmText = prompt('Type "DELETE" to confirm account deletion:')
    if (confirmText !== 'DELETE') {
      toast.error('Account deletion cancelled')
      return
    }

    try {
      const response = await authService.authenticatedRequest('/api/user/delete-account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: profileForm.currentPassword
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          toast.success('Account deleted successfully')
          await authService.logout()
          navigate('/register')
        } else {
          throw new Error(data.error || 'Failed to delete account')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error(error.message || 'Failed to delete account')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading dashboard...</p>
          <p className="text-gray-400 text-xs mt-2">This may take a moment on mobile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile-Optimized Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-8">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src="/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png" 
                  alt="Buy Printz" 
                  className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 object-contain hover:opacity-80 transition-opacity cursor-pointer"
                />
              </Link>
              <h1 className="ml-2 sm:ml-3 text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-gray-600 text-sm lg:text-base">
                Welcome, {user?.email?.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-gray-900 text-sm lg:text-base"
              >
                <LogOut className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile-Optimized Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-2 sm:space-x-8 overflow-x-auto">
            {[
              { id: 'overview', name: 'Overview', shortName: 'Home', icon: BarChart3 },
              { id: 'designs', name: 'My Designs', shortName: 'Designs', icon: Palette },
              { id: 'templates', name: 'Templates', shortName: 'Templates', icon: Layout },
              { id: 'orders', name: 'Orders', shortName: 'Orders', icon: ShoppingBag },
              { id: 'pending', name: 'Pending Orders', shortName: 'Pending', icon: Clock },
              { id: 'profile', name: 'Profile', shortName: 'Profile', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="sm:hidden">{tab.shortName}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8 bg-gradient-to-br from-gray-100 to-gray-200 min-h-screen p-6 -m-6">
            {/* Welcome Section */}
            <div className="neumorphic-container p-8 rounded-2xl bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">
                    Welcome back, {user?.email?.split('@')[0]}! 👋
                  </h2>
                  <p className="text-gray-600">
                    Your banner design studio dashboard
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Link
                    to="/editor"
                    onClick={() => sessionStorage.setItem('newDesign', 'true')}
                    className="neumorphic-button-primary px-6 py-3 rounded-xl text-white font-medium flex items-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    New Banner
                  </Link>
                  <button
                    onClick={loadDashboardData}
                    className="neumorphic-button p-3 rounded-xl text-gray-600"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="neumorphic-container p-6 rounded-xl bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Designs</p>
                    {loadingStates.designs || loadingStates.completedDesigns ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-gray-900">{userStats?.total_designs || (completedDesigns.length + designs.length)}</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Active creations
                        </p>
                      </>
                    )}
                  </div>
                  <div className="neumorphic-button p-4 rounded-xl bg-blue-50">
                    <Palette className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="neumorphic-container p-6 rounded-xl bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Templates</p>
                    <p className="text-3xl font-bold text-gray-900">{userStats?.total_templates || templates.length}</p>
                    <p className="text-xs text-purple-600 flex items-center mt-1">
                      <Star className="w-3 h-3 mr-1" />
                      Custom saved
                    </p>
                  </div>
                  <div className="neumorphic-button p-4 rounded-xl bg-purple-50">
                    <Layout className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="neumorphic-container p-6 rounded-xl bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Orders</p>
                    <p className="text-3xl font-bold text-gray-900">{userStats?.total_orders || 0}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {userStats?.order_stats?.paid || userStats?.order_stats?.completed || 0} completed
                    </p>
                  </div>
                  <div className="neumorphic-button p-4 rounded-xl bg-green-50">
                    <ShoppingBag className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="neumorphic-container p-6 rounded-xl bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">Total Spent</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {formatCurrency(userStats?.total_spent || 0)}
                    </p>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <DollarSign className="w-3 h-3 mr-1" />
                      This year
                    </p>
                  </div>
                  <div className="neumorphic-button p-4 rounded-xl bg-yellow-50">
                    <Crown className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status Breakdown */}
            {userStats?.order_stats && (
              <div className="neumorphic-container p-6 rounded-xl bg-white">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Order Status Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(userStats.order_stats).map(([status, count]) => (
                    <div key={status} className="neumorphic-inset p-4 rounded-lg text-center">
                      <div className="flex items-center justify-center mb-2">
                        {getStatusIcon(status)}
                      </div>
                      <p className="text-2xl font-bold text-gray-900">{count}</p>
                      <p className="text-xs text-gray-600 capitalize">{status.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/editor"
                    onClick={() => sessionStorage.setItem('newDesign', 'true')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <Plus className="w-6 h-6 text-primary-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">Create New Design</h4>
                      <p className="text-sm text-gray-600">Start designing a new sign</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => setActiveTab('designs')}
                    className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors w-full text-left"
                  >
                    <Eye className="w-6 h-6 text-primary-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-900">View My Designs</h4>
                      <p className="text-sm text-gray-600">Browse your saved designs</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              </div>
              <div className="p-6">
                {orders.slice(0, 5).length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="font-medium text-gray-900">
                              {order.product_type} - Qty: {order.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${order.total_amount} • {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-4">No orders yet. Create your first design!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Templates</h2>
                <p className="text-gray-600">Custom banner templates you've created</p>
              </div>
              <Link
                to="/editor"
                onClick={() => sessionStorage.setItem('newDesign', 'true')}
                className="neumorphic-button-primary flex items-center px-4 py-2 rounded-xl text-white font-medium"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Link>
            </div>

            {templates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div key={template.id} className="neumorphic-container bg-white rounded-xl overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{template.name}</h3>
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                          <div className="flex items-center space-x-2">
                            <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-medium">
                              {template.category}
                            </span>
                            {template.banner_type && (
                              <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getBannerTypeColor(template.banner_type)}`}>
                                {template.banner_type}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="neumorphic-button p-2 rounded-lg text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Created {formatDate(template.created_at)}</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatDate(template.updated_at)}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => loadDesignInEditor(template)}
                          className="neumorphic-button flex-1 p-3 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Use Template
                        </button>
                        <button className="neumorphic-button p-3 rounded-lg text-gray-600 hover:bg-gray-50">
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="neumorphic-container bg-white rounded-xl p-12 text-center">
                <Layout className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No templates yet</h3>
                <p className="text-gray-600 mb-6">Create your first custom template to reuse designs</p>
                <Link 
                  to="/editor" 
                  onClick={() => sessionStorage.setItem('newDesign', 'true')}
                  className="neumorphic-button-primary px-6 py-3 rounded-xl text-white font-medium inline-flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create First Template
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Designs Tab */}
        {activeTab === 'designs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Designs</h2>
                <p className="text-sm text-gray-600 mt-1">
                  {designs.length} of 10 saved designs
                  {designs.length >= 8 && (
                    <span className="text-orange-600 ml-2 font-medium">
                      {designs.length >= 10 ? 'Storage limit reached!' : 'Nearly full!'}
                    </span>
                  )}
                </p>
              </div>
              <Link
                to="/editor"
                onClick={() => sessionStorage.setItem('newDesign', 'true')}
                className={`btn-primary flex items-center ${designs.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={designs.length >= 10 ? 'Delete some designs first to create new ones' : 'Create new design'}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Design
              </Link>
            </div>

            {(completedDesigns.length > 0 || designs.length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Show completed designs from orders */}
                {completedDesigns.map((design) => (
                  <div key={design.id} className="neumorphic-container bg-white rounded-xl overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{design.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Banner Design
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getStatusClass(design.status)}`}>
                              {design.status.charAt(0).toUpperCase() + design.status.slice(1)}
                            </span>
                            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                              {design.banner_size}
                            </span>
                            <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                              {formatCurrency(design.total_amount)}
                            </span>
                          </div>
                        </div>
                        <div className="neumorphic-button p-2 rounded-lg">
                          <Palette className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      
                      {design.canvas_image && (
                        <div className="mb-4 neumorphic-inset rounded-lg overflow-hidden">
                          <img 
                            src={design.canvas_image} 
                            alt="Design Preview" 
                            className="w-full h-32 object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Completed {formatDate(design.created_at)}</span>
                        <span className="flex items-center">
                          <Ruler className="w-3 h-3 mr-1" />
                          Order #{design.order_id.slice(-8)}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedOrder(design)
                            setShowOrderModal(true)
                          }}
                          className="neumorphic-button flex-1 p-3 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button 
                          onClick={() => reorderDesign(design)}
                          className="neumorphic-button p-3 rounded-lg text-gray-600 hover:bg-gray-50"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            if (design.canvas_image) {
                              const link = document.createElement('a')
                              link.href = design.canvas_image
                              link.download = `design-${design.order_id.slice(-8)}.png`
                              link.click()
                            }
                          }}
                          className="neumorphic-button p-3 rounded-lg text-gray-600 hover:bg-gray-50"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Show saved designs from editor */}
                {designs.map((design) => (
                  <div key={`saved-${design.id}`} className="neumorphic-container bg-white rounded-xl overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">{design.name || 'Untitled Design'}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            Saved Design
                          </p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                              Draft
                            </span>
                            {design.banner_size && (
                              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                                {design.banner_size}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="neumorphic-button p-2 rounded-lg">
                          <Palette className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                        <span>Saved {formatDate(design.created_at)}</span>
                        <span className="flex items-center">
                          <Ruler className="w-3 h-3 mr-1" />
                          {design.product_type || 'Banner'}
                        </span>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            localStorage.setItem('loadDesign', JSON.stringify(design))
                            navigate('/editor')
                          }}
                          className="neumorphic-button flex-1 p-3 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </button>
                        <button 
                          onClick={() => {
                            // Create an order from this design
                            localStorage.setItem('designToOrder', JSON.stringify(design))
                            navigate('/editor')
                          }}
                          className="neumorphic-button p-3 rounded-lg text-gray-600 hover:bg-gray-50"
                        >
                          <ShoppingCart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteDesign(design.id)}
                          className="neumorphic-button p-3 rounded-lg text-red-600 hover:bg-red-50"
                          title="Delete design"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Palette className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No designs yet</h3>
                <p className="text-gray-600 mb-6">Create your first design to see it here!</p>
                <Link 
                  to="/editor" 
                  onClick={() => sessionStorage.setItem('newDesign', 'true')}
                  className="btn-primary">
                  Create Design
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Pending Orders Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Pending Orders</h2>
                <p className="text-gray-600 text-sm mt-1">Orders that require payment to complete</p>
              </div>
              <span className="neumorphic-container px-4 py-2 rounded-lg bg-yellow-50 text-yellow-800 font-medium w-fit">
                {pendingOrders.filter(order => order.status === 'pending' || order.status === 'payment_failed' || order.status === 'incomplete').length} Pending
              </span>
            </div>

            {/* Show actual pending orders count and filter client-side for safety */}
            {pendingOrders.filter(order => order.status === 'pending' || order.status === 'payment_failed' || order.status === 'incomplete').length === 0 ? (
               <div className="neumorphic-container p-12 rounded-xl bg-white text-center">
                 <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                 <h3 className="text-lg font-medium text-gray-900 mb-2">No pending orders</h3>
                 <p className="text-gray-600 mb-6">All your orders are complete! Pending orders appear here when you create a design but haven't completed payment.</p>
                <Link 
                  to="/editor" 
                  onClick={() => sessionStorage.setItem('newDesign', 'true')}
                  className="neumorphic-button px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Order
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingOrders.filter(order => order.status === 'pending' || order.status === 'payment_failed' || order.status === 'incomplete').map((order) => (
                  <div key={order.id} className="neumorphic-container p-6 rounded-xl bg-white">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">Order #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">
                          Created {formatDate(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`neumorphic-container px-3 py-1 rounded-lg text-sm font-medium ${
                          order.status === 'payment_failed' 
                            ? 'bg-red-50 text-red-800' 
                            : 'bg-yellow-50 text-yellow-800'
                        }`}>
                          {order.status === 'payment_failed' ? 'Payment Failed' : 
                           order.status === 'incomplete' ? 'Incomplete' : 'Pending Payment'}
                        </span>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="neumorphic-inset p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Banner Size</div>
                        <div className="font-medium text-gray-900">
                          {order.order_details?.banner_size || 'Not specified'}
                        </div>
                      </div>
                      <div className="neumorphic-inset p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Material</div>
                        <div className="font-medium text-gray-900">
                          {order.order_details?.banner_material || 'Standard Vinyl'}
                        </div>
                      </div>
                      <div className="neumorphic-inset p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1">Finish</div>
                        <div className="font-medium text-gray-900">
                          {order.order_details?.banner_finish || 'Standard'}
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => reorderDesign(order)}
                        className="neumorphic-button flex-1 px-4 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Resume & Complete Order
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order)
                          setShowOrderModal(true)
                        }}
                        className="neumorphic-button px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Order History</h2>
                <p className="text-gray-600">{userStats?.total_orders || 0} completed orders</p>
              </div>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="neumorphic-input-container pl-10 pr-4 py-2 rounded-lg border-none bg-white text-sm focus:outline-none w-full sm:w-64"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="neumorphic-input-container pl-10 pr-8 py-2 rounded-lg border-none bg-white text-sm focus:outline-none appearance-none"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {filteredOrders.length > 0 ? (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="neumorphic-container bg-white rounded-xl p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            Order #{order.id.slice(-8)}
                          </h3>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(order.status)}
                            <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                              {order.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                          <div className="neumorphic-inset p-3 rounded-lg">
                            <div className="flex items-center text-xs text-gray-600 mb-1">
                              <Tag className="w-3 h-3 mr-1" />
                              Banner Type
                            </div>
                            <p className="font-medium text-gray-900">
                              {order.banner_material || order.product_type}
                            </p>
                            {order.banner_finish && (
                              <p className="text-xs text-gray-600">{order.banner_finish} finish</p>
                            )}
                          </div>
                          
                          <div className="neumorphic-inset p-3 rounded-lg">
                            <div className="flex items-center text-xs text-gray-600 mb-1">
                              <Ruler className="w-3 h-3 mr-1" />
                              Size & Quantity
                            </div>
                            <p className="font-medium text-gray-900">
                              {order.banner_size || 'Custom Size'}
                            </p>
                            <p className="text-xs text-gray-600">Qty: {order.quantity}</p>
                          </div>
                          
                          <div className="neumorphic-inset p-3 rounded-lg">
                            <div className="flex items-center text-xs text-gray-600 mb-1">
                              <DollarSign className="w-3 h-3 mr-1" />
                              Order Total
                            </div>
                            <p className="font-bold text-gray-900 text-lg">
                              {formatCurrency(order.total_amount)}
                            </p>
                            <p className="text-xs text-gray-600">{formatDate(order.created_at)}</p>
                          </div>
                        </div>
                        
                        {order.banner_type && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            <span className={`inline-block text-xs px-2 py-1 rounded-full font-medium ${getBannerTypeColor(order.banner_type)}`}>
                              {order.banner_type}
                            </span>
                            {order.banner_category && (
                              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full font-medium">
                                {order.banner_category}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button 
                          onClick={() => viewOrderDetails(order)}
                          className="neumorphic-button px-4 py-2 rounded-lg text-sm font-medium text-blue-600 hover:bg-blue-50 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                        {order.status === 'delivered' && (
                          <button 
                            onClick={() => reorderItem(order)}
                            className="neumorphic-button px-4 py-2 rounded-lg text-sm font-medium text-green-600 hover:bg-green-50 flex items-center"
                          >
                            <RefreshCw className="w-4 h-4 mr-1" />
                            Reorder
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">Create your first design and place an order</p>
                <Link 
                  to="/editor" 
                  onClick={() => sessionStorage.setItem('newDesign', 'true')}
                  className="btn-primary"
                >
                  Start Designing
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
              <div className="flex items-center space-x-2">
                <User className="w-6 h-6 text-gray-400" />
                <span className="text-sm text-gray-600">Manage your account</span>
              </div>
            </div>
            
            {/* Profile Information Card */}
            <div className="neumorphic-container bg-white rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="neumorphic-inset p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <p className="text-gray-900 font-medium">{user?.full_name || 'Not set'}</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                  <p className="text-gray-600 text-xs font-mono">{user?.user_id}</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Account Actions Card */}
            <div className="neumorphic-container bg-white rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Account Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => openProfileModal('update')}
                  className="neumorphic-button p-6 rounded-xl text-center hover:bg-blue-50 transition-colors group"
                >
                  <Edit className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-medium text-gray-900 mb-1">Update Profile</h4>
                  <p className="text-sm text-gray-600">Edit your name and email</p>
                </button>

                <button 
                  onClick={() => openProfileModal('password')}
                  className="neumorphic-button p-6 rounded-xl text-center hover:bg-yellow-50 transition-colors group"
                >
                  <Settings className="w-8 h-8 text-yellow-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-medium text-gray-900 mb-1">Change Password</h4>
                  <p className="text-sm text-gray-600">Update your password</p>
                </button>

                <button 
                  onClick={() => openProfileModal('delete')}
                  className="neumorphic-button p-6 rounded-xl text-center hover:bg-red-50 transition-colors group"
                >
                  <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-medium text-gray-900 mb-1">Delete Account</h4>
                  <p className="text-sm text-gray-600">Permanently delete account</p>
                </button>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="neumorphic-container bg-white rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Account Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="neumorphic-inset p-4 rounded-lg text-center">
                  <Palette className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                     <p className="text-2xl font-bold text-gray-900">{completedDesigns.length + designs.length}</p>
                   <p className="text-xs text-gray-600">Total Designs</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg text-center">
                  <Layout className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{templates.length}</p>
                  <p className="text-xs text-gray-600">Templates Saved</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg text-center">
                  <ShoppingBag className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                  <p className="text-xs text-gray-600">Orders Placed</p>
                </div>
                <div className="neumorphic-inset p-4 rounded-lg text-center">
                  <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(userStats?.total_spent || 0)}
                  </p>
                  <p className="text-xs text-gray-600">Total Spent</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Order Details #{selectedOrder.id.slice(-8)}
                </h2>
                <button
                  onClick={closeOrderModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {/* Order Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedOrder.status)}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(selectedOrder.total_amount)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formatDate(selectedOrder.created_at)}
                    </p>
                  </div>
                </div>

                {/* Product Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      Product Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{selectedOrder.product_type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Material:</span>
                        <span className="font-medium">{selectedOrder.banner_material || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Finish:</span>
                        <span className="font-medium">{selectedOrder.banner_finish || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Quantity:</span>
                        <span className="font-medium">{selectedOrder.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <Ruler className="w-4 h-4 mr-2" />
                      Specifications
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Size:</span>
                        <span className="font-medium">{selectedOrder.banner_size || 'Custom'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">{selectedOrder.banner_category || 'N/A'}</span>
                      </div>
                      {selectedOrder.banner_type && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Type:</span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getBannerTypeColor(selectedOrder.banner_type)}`}>
                            {selectedOrder.banner_type}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Customer Information */}
                {selectedOrder.customer_info && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Name:</p>
                        <p className="font-medium">{selectedOrder.customer_info.fullName}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email:</p>
                        <p className="font-medium">{selectedOrder.customer_info.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Phone:</p>
                        <p className="font-medium">{selectedOrder.customer_info.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Company:</p>
                        <p className="font-medium">{selectedOrder.customer_info.company || 'N/A'}</p>
                      </div>
                      {selectedOrder.customer_info.address && (
                        <div className="md:col-span-2">
                          <p className="text-gray-600">Address:</p>
                          <p className="font-medium">{selectedOrder.customer_info.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Order Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => reorderItem(selectedOrder)}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reorder This Item
                  </button>
                  <button
                    onClick={closeOrderModal}
                    className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Management Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {profileModalType === 'update' && 'Update Profile'}
                  {profileModalType === 'password' && 'Change Password'}
                  {profileModalType === 'delete' && 'Delete Account'}
                </h2>
                <button
                  onClick={closeProfileModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {/* Update Profile Form */}
              {profileModalType === 'update' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.fullName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={updateProfile}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Update Profile
                    </button>
                    <button
                      onClick={closeProfileModal}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Change Password Form */}
              {profileModalType === 'password' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter current password"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.newPassword}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter new password (min 6 characters)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={profileForm.confirmPassword}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Confirm new password"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={changePassword}
                      className="flex-1 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={closeProfileModal}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Delete Account Confirmation */}
              {profileModalType === 'delete' && (
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                      <p className="text-sm text-red-800 font-medium">Warning: This action cannot be undone!</p>
                    </div>
                    <p className="text-sm text-red-700 mt-2">
                      Deleting your account will permanently remove all your designs, orders, templates, and account data.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter your password to confirm
                    </label>
                    <input
                      type="password"
                      value={profileForm.currentPassword}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter your password"
                    />
                  </div>
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={deleteAccount}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete Account
                    </button>
                    <button
                      onClick={closeProfileModal}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default Dashboard
