import React, { useState, useEffect } from 'react'
import { Heart, Users, Bell, BellOff } from 'lucide-react'
import { authService } from '../services/auth'

const CreatorFollowButton = ({ 
  creatorId, 
  creatorName, 
  followersCount = 0, 
  isVerified = false,
  onFollowChange = () => {} 
}) => {
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [preferences, setPreferences] = useState({
    notify_new_templates: true,
    notify_sales: false,
    notify_updates: true
  })

  // Check follow status on mount
  useEffect(() => {
    checkFollowStatus()
  }, [creatorId])

  const checkFollowStatus = async () => {
    try {
      const response = await authService.authenticatedRequest(`/api/creator-marketplace/creators/${creatorId}/follow-status`)
      if (response.ok) {
        const result = await response.json()
        setIsFollowing(result.is_following)
      }
    } catch (error) {
      console.error('Error checking follow status:', error)
    }
  }

  const handleFollow = async () => {
    if (isLoading) return
    
    setIsLoading(true)
    try {
      const endpoint = isFollowing 
        ? `/api/creator-marketplace/creators/${creatorId}/follow`
        : `/api/creator-marketplace/creators/${creatorId}/follow`
      
      const method = isFollowing ? 'DELETE' : 'POST'
      
      const response = await authService.authenticatedRequest(endpoint, {
        method: method
      })
      
      if (response.ok) {
        const result = await response.json()
        setIsFollowing(!isFollowing)
        onFollowChange(result.followers_count)
        
        // Show success message
        // You can add a toast notification here
        console.log(result.message)
      }
    } catch (error) {
      console.error('Error following/unfollowing creator:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = async (key, value) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    
    try {
      await authService.authenticatedRequest(`/api/creator-marketplace/creators/${creatorId}/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPreferences)
      })
    } catch (error) {
      console.error('Error updating preferences:', error)
    }
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Followers Count */}
      <div className="flex items-center space-x-1 text-sm text-gray-600">
        <Users className="w-4 h-4" />
        <span>{followersCount.toLocaleString()}</span>
      </div>

      {/* Follow Button */}
      <button
        onClick={handleFollow}
        disabled={isLoading}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
          ${isFollowing 
            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-700 border border-red-400/30' 
            : 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 border border-blue-400/30'
          }
          ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        `}
      >
        <Heart className={`w-4 h-4 ${isFollowing ? 'fill-current' : ''}`} />
        <span>{isFollowing ? 'Following' : 'Follow'}</span>
      </button>

      {/* Notification Preferences (only show if following) */}
      {isFollowing && (
        <div className="relative">
          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            title="Notification Preferences"
          >
            {preferences.notify_new_templates ? (
              <Bell className="w-4 h-4 text-blue-600" />
            ) : (
              <BellOff className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {/* Preferences Dropdown */}
          {showPreferences && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-xl border border-white/30 shadow-2xl p-4 z-50">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 text-sm">Notification Preferences</h4>
                
                <div className="space-y-2">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">New Templates</span>
                    <input
                      type="checkbox"
                      checked={preferences.notify_new_templates}
                      onChange={(e) => handlePreferenceChange('notify_new_templates', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Sales Updates</span>
                    <input
                      type="checkbox"
                      checked={preferences.notify_sales}
                      onChange={(e) => handlePreferenceChange('notify_sales', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Creator Updates</span>
                    <input
                      type="checkbox"
                      checked={preferences.notify_updates}
                      onChange={(e) => handlePreferenceChange('notify_updates', e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verification Badge */}
      {isVerified && (
        <div className="flex items-center space-x-1 text-blue-600">
          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          <span className="text-xs font-medium">Verified</span>
        </div>
      )}
    </div>
  )
}

export default CreatorFollowButton
