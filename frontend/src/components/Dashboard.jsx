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
import cacheService from '../services/cache'
import LoadingSpinner, { SkeletonCard, SkeletonTemplateCard } from './LoadingSpinner'

const Dashboard = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [orders, setOrders] = useState([])
  const [templates, setTemplates] = useState([])
  
  // Debug: Log templates state changes
  useEffect(() => {
    console.log('🔄 Templates state updated:', templates.length, 'templates:', templates)
  }, [templates])
  const [userStats, setUserStats] = useState(null)
  const [preferences, setPreferences] = useState(null)
  const [checkoutOrders, setCheckoutOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingStates, setLoadingStates] = useState({
    designs: true,
    orders: true,
    templates: true,
    checkoutOrders: true,
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
    if (tabParam && ['overview', 'templates', 'orders', 'profile'].includes(tabParam)) {
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
        checkoutOrders: false,
        stats: false,
        preferences: false
      })
    }
  }

  const loadDataProgressively = async () => {
  const loadDataSafely = async (apiCall, setter, fallback, loadingKey, cacheKey = null) => {
    try {
      // Check cache first if cacheKey is provided
      if (cacheKey && user?.id) {
        const cachedData = cacheService.get(cacheKey)
        if (cachedData) {
          console.log(`📦 Using cached data for ${loadingKey}`)
          setter(cachedData)
          setLoadingStates(prev => ({ ...prev, [loadingKey]: false }))
          return
        }
      }

      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), 30000)
      )
      
      const response = await Promise.race([apiCall(), timeoutPromise])
      const data = await response.json()
      
      // Debug: Log the raw data structure
      console.log(`🔍 Raw API response for ${loadingKey}:`, data)
      console.log(`🔍 Data type:`, typeof data)
      console.log(`🔍 Is array:`, Array.isArray(data))
      console.log(`🔍 Data keys:`, Object.keys(data || {}))
      
      if (data.success) {
        let processedData = null
        
        // Handle different response formats
        if (data.templates) {
          console.log(`✅ Found data.templates:`, data.templates)
          processedData = data.templates
        } else if (data.designs) {
          console.log(`✅ Found data.designs:`, data.designs)
          processedData = data.designs
        } else if (data.orders) {
          console.log(`✅ Found data.orders:`, data.orders)
          processedData = data.orders
        } else if (data.preferences) {
          console.log(`✅ Found data.preferences:`, data.preferences)
          processedData = data.preferences
        } else if (Array.isArray(data)) {
          // Handle direct array responses
          console.log(`✅ Found direct array:`, data)
          processedData = data
        } else {
          console.log(`⚠️ Fallback to full data:`, data)
          processedData = data
        }
        
        // Cache the data if cacheKey is provided
        if (cacheKey && user?.id && processedData) {
          cacheService.set(cacheKey, processedData)
          console.log(`💾 Cached data for ${loadingKey}`)
        }
        
        setter(processedData)
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

    // Load core data first (orders)
    await Promise.all([
      loadDataSafely(
        () => authService.authenticatedRequest('/api/orders'),
        (data) => {
          const orders = data.orders || []
          setOrders(orders)
        },
        [],
        'orders',
        `orders_${user?.id}`
      ),
      
      // Load checkout orders (orders that reached checkout but may not be paid)
      loadDataSafely(
        () => authService.authenticatedRequest('/api/orders/pending'),
        (data) => {
          const checkoutOrders = data.orders || []
          setCheckoutOrders(checkoutOrders)
        },
        [],
        'checkoutOrders',
        `checkout_orders_${user?.id}`
      )
    ])

    // Small delay to prevent overwhelming mobile connections
    await new Promise(resolve => setTimeout(resolve, 100))

    // Load secondary data
    await Promise.all([
      loadDataSafely(
        () => authService.authenticatedRequest('/api/templates/user'),
        (data) => {
          console.log('Dashboard: Received templates data:', data)
          console.log('Dashboard: Setting templates state with:', data)
          setTemplates(data)
        },
        [],
        'templates',
        `templates_${user?.id}`
      )
    ])

    // Another small delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // Load tertiary data - use main endpoints and filter on frontend
    await Promise.all([
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
      case 'checkout':
        return 'bg-orange-100 text-orange-800'
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
      case 'checkout':
        return <ShoppingCart className="w-4 h-4" />
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

  // Create unified orders list (completed orders + checkout orders)
  const allOrders = [
    ...orders.filter(order => 
      ['completed', 'paid', 'approved', 'shipped', 'delivered'].includes(order.status)
    ),
    ...checkoutOrders.map(order => ({
      ...order,
      status: order.status || 'checkout', // Mark as checkout if no status
      isCheckoutOrder: true // Flag to identify checkout orders
    }))
  ]
  
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.banner_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.banner_material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const loadDesignInEditor = (item) => {
    // Check if it's a template or design
    if (item.canvas_data) {
      // It's a template - store template data in sessionStorage and navigate
      // Parse canvas_data if it's a string, otherwise use as-is
      const parsedCanvasData = typeof item.canvas_data === 'string' 
        ? JSON.parse(item.canvas_data) 
        : item.canvas_data
      
      // Store template data in sessionStorage to avoid URL encoding issues
      sessionStorage.setItem('templateData', JSON.stringify(parsedCanvasData))
      navigate(`/editor?template=${item.id}`)
    } else {
      // It's a design - navigate with design ID
      navigate(`/editor?design=${item.id}`)
    }
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
        
        // Invalidate cache
        if (user?.id) {
          cacheService.invalidateTemplates(user.id)
          cacheService.invalidateTemplate(templateId)
        }
      } else {
        throw new Error('Failed to delete template')
      }
    } catch (error) {
      console.error('Error deleting template:', error)
      toast.error('Failed to delete template')
    }
  }

  const refreshTemplates = async () => {
    if (!user?.id) return
    
    setLoadingStates(prev => ({ ...prev, templates: true }))
    
    // Invalidate cache and reload
    cacheService.invalidateTemplates(user.id)
    
    try {
      const response = await authService.authenticatedRequest('/api/templates/user')
      const data = await response.json()
      
      if (data.success || Array.isArray(data)) {
        const templatesData = data.templates || data
        setTemplates(templatesData)
        cacheService.setTemplates(user.id, templatesData)
        toast.success('Templates refreshed')
      }
    } catch (error) {
      console.error('Error refreshing templates:', error)
      toast.error('Failed to refresh templates')
    } finally {
      setLoadingStates(prev => ({ ...prev, templates: false }))
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
    // Navigate to editor with order ID in URL
    navigate(`/editor?order=${order.id}`)
    toast.success('Order data loaded for reordering')
  }

  const editCheckoutOrder = (order) => {
    // Navigate to editor with checkout order data
    if (order.canvas_data) {
      // Store the order data in sessionStorage for the editor to load
      sessionStorage.setItem('checkoutOrderData', JSON.stringify({
        orderId: order.id,
        canvasData: order.canvas_data,
        orderDetails: order.order_details,
        bannerSpecs: order.banner_specs
      }))
      navigate('/editor')
      toast.success('Checkout order loaded for editing')
    } else {
      toast.error('Order data not available for editing')
    }
  }

  const reorderDesign = (design) => {
    // Navigate to editor with design ID in URL
    navigate(`/editor?design=${design.id}`)
    toast.success('Design loaded for reordering')
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
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center backdrop-blur-xl bg-white/20 rounded-2xl p-8 border border-white/30">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-sm sm:text-base font-medium">Loading dashboard...</p>
          <p className="text-gray-500 text-xs mt-2">This may take a moment on mobile</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      {/* GlassUI Header - Mobile optimized */}
      <div className="backdrop-blur-xl bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4 lg:py-6">
            <div className="flex items-center min-w-0 flex-1">
              <Link to="/" className="flex items-center">
                <img 
                  src="/assets/images/BuyPrintz_LOGO_Final-Social Media_Transparent.png" 
                  alt="Buy Printz" 
                  className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 object-contain hover:opacity-80 transition-opacity cursor-pointer flex-shrink-0"
                />
              </Link>
              <div className="ml-2 sm:ml-3 lg:ml-4 min-w-0">
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate">
                  Dashboard
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Professional Design Studio</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
              <div className="hidden md:block backdrop-blur-sm bg-white/20 rounded-xl px-3 lg:px-4 py-2 border border-white/30">
                <span className="text-gray-700 text-sm font-medium">
                  Welcome, {user?.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 sm:px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl transition-all duration-200 text-gray-700 hover:text-gray-900"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* GlassUI Navigation Tabs - Mobile optimized */}
        <div className="backdrop-blur-sm bg-white/30 rounded-xl sm:rounded-2xl p-1 sm:p-2 mb-4 sm:mb-6 lg:mb-8 border border-white/30">
          <nav className="flex space-x-1 overflow-x-auto scrollbar-hide">
            {[
              { id: 'overview', name: 'Overview', shortName: 'Home', icon: BarChart3 },
              { id: 'templates', name: 'Templates', shortName: 'Templates', icon: Layout },
              { id: 'orders', name: 'Orders', shortName: 'Orders', icon: ShoppingBag },
              { id: 'profile', name: 'Profile', shortName: 'Profile', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center py-2 sm:py-3 px-3 sm:px-4 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm whitespace-nowrap transition-all duration-200 flex-shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-white/50 text-blue-700 shadow-lg border border-white/40'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 flex-shrink-0" />
                <span className="sm:hidden">{tab.shortName}</span>
                <span className="hidden sm:inline">{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Welcome Section - Mobile optimized */}
            <div className="backdrop-blur-xl bg-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/30 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                    Welcome back, {user?.email?.split('@')[0]}! 👋
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Your professional banner design studio
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                  <Link
                    to="/editor"
                    onClick={() => sessionStorage.setItem('newDesign', 'true')}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg sm:rounded-xl text-white font-medium flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    New Banner
                  </Link>
                  <button
                    onClick={loadDashboardData}
                    className="p-2 sm:p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-lg sm:rounded-xl text-gray-600 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards - Mobile optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="backdrop-blur-xl bg-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Designs</p>
                    {loadingStates.designs || loadingStates.completedDesigns ? (
                      <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                    ) : (
                      <>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-800">{userStats?.total_designs || designs.length}</p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Active creations
                        </p>
                      </>
                    )}
                  </div>
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-lg sm:rounded-xl border border-blue-200/30 flex-shrink-0">
                    <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Templates</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{userStats?.total_templates || templates.length}</p>
                    <p className="text-xs text-purple-600 flex items-center mt-1">
                      <Star className="w-3 h-3 mr-1" />
                      Custom saved
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-lg sm:rounded-xl border border-purple-200/30 flex-shrink-0">
                    <Layout className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Orders</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">{userStats?.total_orders || 0}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {userStats?.order_stats?.paid || userStats?.order_stats?.completed || 0} completed
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-lg sm:rounded-xl border border-green-200/30 flex-shrink-0">
                    <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="backdrop-blur-xl bg-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-2">Total Spent</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-800">
                      {formatCurrency(userStats?.total_spent || 0)}
                    </p>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <DollarSign className="w-3 h-3 mr-1" />
                      This year
                    </p>
                  </div>
                  <div className="p-3 sm:p-4 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-lg sm:rounded-xl border border-yellow-200/30 flex-shrink-0">
                    <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Order Status Breakdown */}
            {userStats?.order_stats && (
              <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Order Status Overview
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(userStats.order_stats).map(([status, count]) => (
                    <div key={status} className="backdrop-blur-sm bg-white/30 p-4 rounded-xl text-center border border-white/30 hover:bg-white/40 transition-all duration-200">
                      <div className="flex items-center justify-center mb-2">
                        {getStatusIcon(status)}
                      </div>
                      <p className="text-2xl font-bold text-gray-800">{count}</p>
                      <p className="text-xs text-gray-600 capitalize">{status.replace('_', ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="backdrop-blur-xl bg-white/20 rounded-2xl border border-white/30 shadow-xl">
              <div className="px-6 py-4 border-b border-white/30">
                <h3 className="text-lg font-bold text-gray-800">Quick Actions</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/editor"
                    onClick={() => sessionStorage.setItem('newDesign', 'true')}
                    className="flex items-center p-4 backdrop-blur-sm bg-white/30 rounded-xl border border-white/30 hover:bg-white/40 transition-all duration-200"
                  >
                    <Plus className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-800">Create New Design</h4>
                      <p className="text-sm text-gray-600">Start designing a new banner</p>
                    </div>
                  </Link>

                  <button
                    onClick={() => setActiveTab('templates')}
                    className="flex items-center p-4 backdrop-blur-sm bg-white/30 rounded-xl border border-white/30 hover:bg-white/40 transition-all duration-200 w-full text-left"
                  >
                    <Layout className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h4 className="font-medium text-gray-800">View Templates</h4>
                      <p className="text-sm text-gray-600">Browse your saved templates</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="backdrop-blur-xl bg-white/20 rounded-2xl border border-white/30 shadow-xl">
              <div className="px-6 py-4 border-b border-white/30">
                <h3 className="text-lg font-bold text-gray-800">Recent Orders</h3>
              </div>
              <div className="p-6">
                {orders.slice(0, 5).length > 0 ? (
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 backdrop-blur-sm bg-white/30 rounded-xl border border-white/30 hover:bg-white/40 transition-all duration-200">
                        <div className="flex items-center">
                          <Package className="w-5 h-5 text-gray-500 mr-3" />
                          <div>
                            <p className="font-medium text-gray-800">
                              {order.product_type} - Qty: {order.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              ${order.total_amount} • {new Date(order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No orders yet. Create your first design!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {/* Mobile-optimized header */}
            <div className="mb-6 sm:mb-8">
              {/* Title section */}
              <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-0">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl sm:rounded-2xl shadow-lg border border-white/30">
                  <Layout className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-600 bg-clip-text text-transparent">
                    My Templates
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">Custom banner templates you've created and saved</p>
                </div>
              </div>
              
              {/* Action buttons - responsive layout */}
              <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                <button
                  onClick={refreshTemplates}
                  disabled={loadingStates.templates}
                  className="p-2 sm:p-3 bg-white/20 hover:bg-white/40 rounded-lg sm:rounded-xl text-gray-600 hover:text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 hover:border-white/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refresh templates"
                >
                  <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loadingStates.templates ? 'animate-spin' : ''}`} />
                </button>
                <Link
                  to="/editor"
                  onClick={() => sessionStorage.setItem('newDesign', 'true')}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 rounded-lg sm:rounded-xl text-white font-semibold flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-blue-400/20 text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden xs:inline">Create Template</span>
                  <span className="xs:hidden">Create</span>
                </Link>
              </div>
            </div>

            {console.log('Dashboard: Rendering templates, count:', templates.length, 'templates:', templates)}
            {loadingStates.templates ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <SkeletonTemplateCard key={i} />
                ))}
              </div>
            ) : templates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                {templates.map((template) => (
                  <div key={template.id} className="group relative">
                    {/* Main Template Card */}
                    <div className="backdrop-blur-xl bg-white/10 rounded-3xl overflow-hidden border border-white/20 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      <div className="relative p-4 sm:p-6 lg:p-8">
                        {/* Header Section - Mobile optimized */}
                        <div className="flex items-start justify-between mb-4 sm:mb-6">
                          <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-bold text-gray-800 text-lg sm:text-xl mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent truncate">
                              {template.name}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed line-clamp-2">{template.description}</p>
                            
                            {/* Enhanced Tags - Mobile responsive */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200/50 shadow-sm">
                                <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-400 rounded-full mr-1.5 sm:mr-2"></div>
                                {template.category}
                              </span>
                              {template.banner_type && (
                                <span className={`inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full border shadow-sm ${getBannerTypeColor(template.banner_type)}`}>
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-current rounded-full mr-1.5 sm:mr-2 opacity-60"></div>
                                  <span className="hidden sm:inline">{template.banner_type}</span>
                                  <span className="sm:hidden">{template.banner_type.split(' ')[0]}</span>
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Enhanced Delete Button - Mobile optimized */}
                          <button
                            onClick={() => deleteTemplate(template.id)}
                            className="p-2 sm:p-3 bg-white/20 hover:bg-red-50/80 rounded-lg sm:rounded-xl text-red-500 hover:text-red-600 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 hover:border-red-200/50 flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                        
                        {/* Timestamp Section - Mobile optimized */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-gray-500 mb-4 sm:mb-6 px-3 sm:px-4 py-2 sm:py-3 bg-white/10 rounded-lg sm:rounded-xl border border-white/20 space-y-1 sm:space-y-0">
                          <span className="flex items-center">
                            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mr-1.5 sm:mr-2"></div>
                            <span className="hidden sm:inline">Created </span>
                            {formatDate(template.created_at)}
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {formatDate(template.updated_at)}
                          </span>
                        </div>

                        {/* Action Buttons - Mobile optimized */}
                        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                          <button
                            onClick={() => loadDesignInEditor(template)}
                            className="flex-1 p-3 sm:p-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 rounded-lg sm:rounded-xl text-sm font-semibold text-white flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-blue-400/20"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            <span className="hidden sm:inline">Use Template</span>
                            <span className="sm:hidden">Use</span>
                          </button>
                          <button className="p-3 sm:p-4 bg-white/20 hover:bg-white/40 rounded-lg sm:rounded-xl text-gray-600 hover:text-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl border border-white/30 hover:border-white/50">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Subtle Bottom Accent */}
                      <div className="h-1 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-16 text-center border border-white/20 shadow-2xl">
                {/* Decorative Background Elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50/20 via-transparent to-blue-50/20 rounded-3xl"></div>
                <div className="absolute top-8 right-8 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-8 left-8 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-purple-200/20 rounded-full blur-2xl"></div>
                
                <div className="relative">
                  {/* Enhanced Icon */}
                  <div className="inline-flex p-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl shadow-xl border border-white/30 mb-8">
                    <Layout className="w-16 h-16 text-purple-600" />
                  </div>
                  
                  <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-600 bg-clip-text text-transparent mb-4">
                    No templates yet
                  </h3>
                  <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto leading-relaxed">
                    Create your first custom template to save and reuse your favorite banner designs
                  </p>
                  
                  <Link 
                    to="/editor" 
                    onClick={() => sessionStorage.setItem('newDesign', 'true')}
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-purple-600 hover:from-blue-600 hover:via-blue-700 hover:to-purple-700 rounded-xl text-white font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 border border-blue-400/20"
                  >
                    <Plus className="w-6 h-6 mr-3" />
                    Create First Template
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}



        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Orders</h2>
                <p className="text-gray-600">{allOrders.length} total orders ({checkoutOrders.length} checkout, {orders.filter(o => ['completed', 'paid', 'approved', 'shipped', 'delivered'].includes(o.status)).length} completed)</p>
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
                    <option value="all">All Orders</option>
                    <option value="checkout">Checkout (Unpaid)</option>
                    <option value="pending">Pending Payment</option>
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
                  <div key={order.id} className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl hover:shadow-2xl transition-all duration-300">
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
                          <div className="backdrop-blur-sm bg-white/30 p-3 rounded-xl border border-white/30">
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
                          
                          <div className="backdrop-blur-sm bg-white/30 p-3 rounded-xl border border-white/30">
                            <div className="flex items-center text-xs text-gray-600 mb-1">
                              <Ruler className="w-3 h-3 mr-1" />
                              Size & Quantity
                            </div>
                            <p className="font-medium text-gray-900">
                              {order.banner_size || 'Custom Size'}
                            </p>
                            <p className="text-xs text-gray-600">Qty: {order.quantity}</p>
                          </div>
                          
                          <div className="backdrop-blur-sm bg-white/30 p-3 rounded-xl border border-white/30">
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
                          className="px-4 py-2 rounded-lg text-sm font-medium text-blue-600 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all duration-200 flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </button>
                        {order.isCheckoutOrder && (
                          <button 
                            onClick={() => editCheckoutOrder(order)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-orange-600 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all duration-200 flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit Order
                          </button>
                        )}
                        {order.status === 'delivered' && (
                          <button 
                            onClick={() => reorderItem(order)}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-green-600 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 transition-all duration-200 flex items-center"
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
              <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-12 text-center border border-white/30 shadow-xl">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-6">Create your first design and place an order</p>
                <Link 
                  to="/editor" 
                  onClick={() => sessionStorage.setItem('newDesign', 'true')}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-xl text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
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
              <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">Profile Settings</h2>
              <div className="flex items-center space-x-2 backdrop-blur-sm bg-white/20 rounded-xl px-4 py-2 border border-white/30">
                <User className="w-6 h-6 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">Manage your account</span>
              </div>
            </div>
            
            {/* Profile Information Card */}
            <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="backdrop-blur-sm bg-white/30 p-4 rounded-xl border border-white/30">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <p className="text-gray-800 font-medium">{user?.full_name || 'Not set'}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/30 p-4 rounded-xl border border-white/30">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <p className="text-gray-800 font-medium">{user?.email}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/30 p-4 rounded-xl border border-white/30">
                  <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                  <p className="text-gray-600 text-xs font-mono">{user?.user_id}</p>
                </div>
                <div className="backdrop-blur-sm bg-white/30 p-4 rounded-xl border border-white/30">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-400/20 text-green-800 border border-green-200/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Account Actions Card */}
            <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                Account Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => openProfileModal('update')}
                  className="p-6 backdrop-blur-sm bg-white/30 rounded-xl text-center hover:bg-white/40 transition-all duration-200 group border border-white/30"
                >
                  <Edit className="w-8 h-8 text-blue-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-medium text-gray-800 mb-1">Update Profile</h4>
                  <p className="text-sm text-gray-600">Edit your name and email</p>
                </button>

                <button 
                  onClick={() => openProfileModal('password')}
                  className="p-6 backdrop-blur-sm bg-white/30 rounded-xl text-center hover:bg-white/40 transition-all duration-200 group border border-white/30"
                >
                  <Settings className="w-8 h-8 text-yellow-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-medium text-gray-800 mb-1">Change Password</h4>
                  <p className="text-sm text-gray-600">Update your password</p>
                </button>

                <button 
                  onClick={() => openProfileModal('delete')}
                  className="p-6 backdrop-blur-sm bg-white/30 rounded-xl text-center hover:bg-white/40 transition-all duration-200 group border border-white/30"
                >
                  <Trash2 className="w-8 h-8 text-red-600 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <h4 className="font-medium text-gray-800 mb-1">Delete Account</h4>
                  <p className="text-sm text-gray-600">Permanently delete account</p>
                </button>
              </div>
            </div>

            {/* Account Statistics */}
            <div className="backdrop-blur-xl bg-white/20 rounded-2xl p-6 border border-white/30 shadow-xl">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Account Statistics
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="backdrop-blur-sm bg-white/30 p-4 rounded-xl text-center border border-white/30">
                  <Palette className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{userStats?.total_designs || designs.length}</p>
                  <p className="text-xs text-gray-600">Total Designs</p>
                </div>
                <div className="backdrop-blur-sm bg-white/30 p-4 rounded-xl text-center border border-white/30">
                  <Layout className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{userStats?.total_templates || templates.length}</p>
                  <p className="text-xs text-gray-600">Templates Saved</p>
                </div>
                <div className="backdrop-blur-sm bg-white/30 p-4 rounded-xl text-center border border-white/30">
                  <ShoppingBag className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">{userStats?.total_orders || 0}</p>
                  <p className="text-xs text-gray-600">Orders Placed</p>
                </div>
                <div className="backdrop-blur-sm bg-white/30 p-4 rounded-xl text-center border border-white/30">
                  <DollarSign className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-800">
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
