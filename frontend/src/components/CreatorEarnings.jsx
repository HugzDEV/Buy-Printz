import React, { useState, useEffect } from 'react'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { GlassCard, GlassButton } from './ui'
import authService from '../services/auth'

const CreatorEarnings = () => {
  const [earnings, setEarnings] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState('30') // days

  useEffect(() => {
    loadEarnings()
  }, [timeRange])

  const loadEarnings = async () => {
    try {
      setLoading(true)
      
      // Get creator profile first
      const creatorResponse = await authService.authenticatedRequest('/api/creator-marketplace/creators/profile')
      if (!creatorResponse.ok) {
        setError('Failed to load creator profile')
        return
      }
      
      const creatorData = await creatorResponse.json()
      const creatorId = creatorData.creator.id
      
      // Get earnings data
      const earningsResponse = await authService.authenticatedRequest(`/api/creator-marketplace/creators/${creatorId}/earnings`)
      if (earningsResponse.ok) {
        const earningsData = await earningsResponse.json()
        setEarnings(earningsData.earnings)
      }
      
      // Get analytics data
      const analyticsResponse = await authService.authenticatedRequest('/api/creator-marketplace/creators/analytics')
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json()
        setAnalytics(analyticsData.analytics)
      }
      
    } catch (error) {
      console.error('Error loading earnings:', error)
      setError('Network error loading earnings data')
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

  const getTimeRangeLabel = (days) => {
    switch (days) {
      case '7': return 'Last 7 days'
      case '30': return 'Last 30 days'
      case '90': return 'Last 90 days'
      case '365': return 'Last year'
      default: return 'All time'
    }
  }

  const calculateTotalEarnings = () => {
    return earnings.reduce((total, earning) => total + (earning.creator_earnings || 0), 0)
  }

  const calculateTotalCommission = () => {
    return earnings.reduce((total, earning) => total + (earning.commission_amount || 0), 0)
  }

  const getRecentEarnings = () => {
    const now = new Date()
    const daysAgo = new Date(now.getTime() - (parseInt(timeRange) * 24 * 60 * 60 * 1000))
    
    return earnings.filter(earning => 
      new Date(earning.purchased_at) >= daysAgo
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading earnings data...</p>
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Earnings</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <GlassButton onClick={loadEarnings}>
            Try Again
          </GlassButton>
        </GlassCard>
      </div>
    )
  }

  const recentEarnings = getRecentEarnings()
  const totalEarnings = calculateTotalEarnings()
  const totalCommission = calculateTotalCommission()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-600 bg-clip-text text-transparent">
            Earnings Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Track your template sales and earnings
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <GlassCard className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Time Range:</span>
              <div className="flex gap-2">
                {['7', '30', '90', '365'].map((days) => (
                  <GlassButton
                    key={days}
                    onClick={() => setTimeRange(days)}
                    variant={timeRange === days ? 'primary' : 'outline'}
                    size="sm"
                  >
                    {getTimeRangeLabel(days)}
                  </GlassButton>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalEarnings)}
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
                <p className="text-sm font-medium text-gray-600">Recent Earnings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(recentEarnings.reduce((total, earning) => total + (earning.creator_earnings || 0), 0))}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {earnings.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalCommission)}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <PieChart className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Analytics Overview */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Recent Performance */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Performance</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/20 rounded-lg">
                  <span className="text-gray-600">Last 30 Days</span>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(analytics.recent_sales?.recent_earnings || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/20 rounded-lg">
                  <span className="text-gray-600">Sales Count</span>
                  <span className="font-semibold text-gray-900">
                    {analytics.recent_sales?.recent_sales || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/20 rounded-lg">
                  <span className="text-gray-600">Average per Sale</span>
                  <span className="font-semibold text-gray-900">
                    {analytics.recent_sales?.recent_sales > 0 
                      ? formatCurrency((analytics.recent_sales?.recent_earnings || 0) / analytics.recent_sales?.recent_sales)
                      : formatCurrency(0)
                    }
                  </span>
                </div>
              </div>
            </GlassCard>

            {/* Top Templates */}
            <GlassCard className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Top Performing Templates</h2>
              <div className="space-y-3">
                {analytics.top_templates && analytics.top_templates.length > 0 ? (
                  analytics.top_templates.slice(0, 5).map((template, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-white/20 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{template.name}</p>
                        <p className="text-sm text-gray-600">{template.sales_count} sales</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(template.price)}</p>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(template.price * 0.8 * template.sales_count)} earned
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">No sales yet</p>
                )}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Earnings History */}
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Earnings History</h2>
            <GlassButton variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </GlassButton>
          </div>

          {earnings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <DollarSign className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Earnings Yet</h3>
              <p className="text-gray-500">
                Start selling templates to see your earnings here
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Template</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Buyer</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Price</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Your Earnings</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-700">Commission</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {earnings.map((earning) => (
                    <tr key={earning.id} className="border-b border-white/10">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {formatDate(earning.purchased_at)}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{earning.template_name}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {earning.buyer_email || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-gray-900">
                        {formatCurrency(earning.price_paid)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        {formatCurrency(earning.creator_earnings)}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-600">
                        {formatCurrency(earning.commission_amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          earning.status === 'completed' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {earning.status === 'completed' ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Payout Information */}
        <div className="mt-8">
          <GlassCard className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payout Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Payout Schedule</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Earnings are automatically paid out weekly via Stripe. You'll receive 80% of each sale.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Next Payout:</span>
                    <span className="font-medium">Every Monday</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Minimum Payout:</span>
                    <span className="font-medium">$10.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing Time:</span>
                    <span className="font-medium">2-3 business days</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Current Balance</h3>
                <div className="p-4 bg-white/20 rounded-xl">
                  <div className="text-2xl font-bold text-gray-900 mb-2">
                    {formatCurrency(totalEarnings)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Available for payout
                  </p>
                </div>
                <GlassButton className="w-full mt-4" disabled={totalEarnings < 10}>
                  Request Payout
                </GlassButton>
                {totalEarnings < 10 && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Minimum $10 required for payout
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  )
}

export default CreatorEarnings
