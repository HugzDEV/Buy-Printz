import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Globe, 
  Link, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { GlassCard, GlassButton } from './ui'
import authService from '../services/auth'

const CreatorRegistration = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    website: '',
    social_links: {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: ''
    }
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const validateForm = () => {
    if (!formData.display_name.trim()) {
      setError('Display name is required')
      return false
    }
    
    if (formData.display_name.length < 2) {
      setError('Display name must be at least 2 characters')
      return false
    }
    
    if (formData.display_name.length > 50) {
      setError('Display name must be less than 50 characters')
      return false
    }
    
    if (formData.bio && formData.bio.length > 500) {
      setError('Bio must be less than 500 characters')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Clean up social links (remove empty values)
      const cleanSocialLinks = Object.fromEntries(
        Object.entries(formData.social_links).filter(([_, value]) => value.trim())
      )
      
      const registrationData = {
        display_name: formData.display_name.trim(),
        bio: formData.bio.trim() || null,
        website: formData.website.trim() || null,
        social_links: cleanSocialLinks
      }
      
      const response = await authService.authenticatedRequest('/api/creator-marketplace/creators/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registrationData)
      })
      
      if (response.ok) {
        const result = await response.json()
        setSuccess(true)
        
        // Redirect to creator dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard?tab=creator')
        }, 2000)
      } else {
        const errorData = await response.json()
        setError(errorData.detail || 'Failed to register as creator')
      }
    } catch (error) {
      console.error('Creator registration error:', error)
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <GlassCard className="max-w-md w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome to the Creator Community! 🎉
          </h2>
          
          <p className="text-gray-600 mb-6">
            Your creator account has been created successfully. You can now start uploading templates and building your design business!
          </p>
          
          <div className="flex items-center justify-center text-sm text-gray-500">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Redirecting to your creator dashboard...
          </div>
        </GlassCard>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <GlassCard className="max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full">
              <User className="w-12 h-12 text-purple-600" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-600 bg-clip-text text-transparent mb-2">
            Join the Creator Community
          </h1>
          
          <p className="text-gray-600 text-lg">
            Start earning by selling your design templates to small businesses
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="text-center p-4 bg-white/20 rounded-xl">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-gray-800 mb-1">Earn 80%</h3>
            <p className="text-sm text-gray-600">Keep 80% of every sale</p>
          </div>
          
          <div className="text-center p-4 bg-white/20 rounded-xl">
            <div className="text-2xl mb-2">🚀</div>
            <h3 className="font-semibold text-gray-800 mb-1">Quick Start</h3>
            <p className="text-sm text-gray-600">Start selling in minutes</p>
          </div>
          
          <div className="text-center p-4 bg-white/20 rounded-xl">
            <div className="text-2xl mb-2">🤝</div>
            <h3 className="font-semibold text-gray-800 mb-1">Support</h3>
            <p className="text-sm text-gray-600">Help small businesses grow</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Display Name */}
          <div>
            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700 mb-2">
              Display Name *
            </label>
            <input
              type="text"
              id="display_name"
              name="display_name"
              value={formData.display_name}
              onChange={handleInputChange}
              placeholder="Your creative name"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
              maxLength={50}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              This is how buyers will see you (2-50 characters)
            </p>
          </div>

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself and your design style..."
              rows={4}
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 resize-none"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
              <Globe className="w-4 h-4 inline mr-1" />
              Website
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={formData.website}
              onChange={handleInputChange}
              placeholder="https://yourportfolio.com"
              className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Social Links
            </label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Instagram */}
              <div>
                <label htmlFor="instagram" className="block text-xs text-gray-600 mb-1">
                  <Instagram className="w-3 h-3 inline mr-1" />
                  Instagram
                </label>
                <input
                  type="text"
                  id="instagram"
                  value={formData.social_links.instagram}
                  onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                  placeholder="@username"
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>

              {/* Twitter */}
              <div>
                <label htmlFor="twitter" className="block text-xs text-gray-600 mb-1">
                  <Twitter className="w-3 h-3 inline mr-1" />
                  Twitter
                </label>
                <input
                  type="text"
                  id="twitter"
                  value={formData.social_links.twitter}
                  onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                  placeholder="@username"
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>

              {/* Facebook */}
              <div>
                <label htmlFor="facebook" className="block text-xs text-gray-600 mb-1">
                  <Facebook className="w-3 h-3 inline mr-1" />
                  Facebook
                </label>
                <input
                  type="text"
                  id="facebook"
                  value={formData.social_links.facebook}
                  onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                  placeholder="Page name"
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>

              {/* LinkedIn */}
              <div>
                <label htmlFor="linkedin" className="block text-xs text-gray-600 mb-1">
                  <Linkedin className="w-3 h-3 inline mr-1" />
                  LinkedIn
                </label>
                <input
                  type="text"
                  id="linkedin"
                  value={formData.social_links.linkedin}
                  onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                  placeholder="Profile name"
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-200 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-2">Creator Agreement</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• You earn 80% of each template sale</li>
              <li>• Templates must be original designs</li>
              <li>• All templates are reviewed before going live</li>
              <li>• You can set your own prices ($3-$25)</li>
              <li>• Weekly payouts via Stripe</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col sm:flex-row gap-4">
            <GlassButton
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  <User className="w-5 h-5 mr-2" />
                  Become a Creator
                </>
              )}
            </GlassButton>
            
            <GlassButton
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard')}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </GlassButton>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Already a creator? 
            <button 
              onClick={() => navigate('/dashboard?tab=creator')}
              className="text-purple-600 hover:text-purple-700 font-medium ml-1"
            >
              Go to Creator Dashboard
            </button>
          </p>
        </div>
      </GlassCard>
    </div>
  )
}

export default CreatorRegistration
