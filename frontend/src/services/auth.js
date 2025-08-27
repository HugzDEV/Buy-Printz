import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with error handling
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// API Configuration
const apiUrl = import.meta.env.VITE_API_URL || 'https://buy-printz-production.up.railway.app'

// Debug: Log environment variables (remove in production)
console.log('Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseKey,
  urlPrefix: supabaseUrl?.substring(0, 20),
  keyPrefix: supabaseKey?.substring(0, 20),
  apiUrl: apiUrl
})

// Check if environment variables are loaded
if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase environment variables not found. Please check your .env file.')
  console.warn('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required.')
}

// Create Supabase client only if environment variables are available
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

class AuthService {
  constructor() {
    this.supabase = supabase
  }

  // Register new user using Supabase Auth
  async register(email, password, fullName) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized. Please check your environment variables.')
    }

    console.log('Attempting registration with:', { 
      email, 
      fullName, 
      supabaseUrl: this.supabase.supabaseUrl,
      passwordLength: password ? password.length : 0
    })

    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/email-confirmed`
        }
      })

      console.log('Registration response:', { data, error })

      if (error) {
        console.error('Registration error details:', error)
        throw new Error(error.message)
      }

      return {
        user_id: data.user.id,
        email: data.user.email,
        access_token: data.session?.access_token
      }
    } catch (error) {
      throw error
    }
  }

  // Resend confirmation email
  async resendConfirmation(email) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized. Please check your environment variables.')
    }

    try {
      const { error } = await this.supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/email-confirmed`
        }
      })

      if (error) {
        console.error('Resend confirmation error:', error)
        throw new Error(error.message)
      }

      return { success: true }
    } catch (error) {
      throw error
    }
  }

  // Login user using Supabase Auth
  async login(email, password) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized. Please check your environment variables.')
    }

    console.log('Attempting login with:', { email, supabaseUrl: this.supabase.supabaseUrl })

    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      })

      console.log('Login response:', { data, error })

      if (error) {
        console.error('Login error details:', error)
        throw new Error(error.message)
      }

      // Store session data
      if (data.session) {
        localStorage.setItem('access_token', data.session.access_token)
        localStorage.setItem('refresh_token', data.session.refresh_token)
        localStorage.setItem('user_id', data.user.id)
        localStorage.setItem('user_email', data.user.email)
      }

      return {
        user_id: data.user.id,
        email: data.user.email,
        access_token: data.session?.access_token
      }
    } catch (error) {
      throw error
    }
  }

  // Logout user using Supabase Auth
  async logout() {
    if (!this.supabase) {
      return
    }

    try {
      await this.supabase.auth.signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local storage
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_id')
      localStorage.removeItem('user_email')
    }
  }

  // Get current user from Supabase
  async getCurrentUser() {
    if (!this.supabase) {
      return null
    }

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting user:', error)
        return null
      }

      if (user) {
        return {
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name
        }
      }

      return null
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    if (!this.supabase) {
      return false
    }

    try {
      const { data: { session } } = await this.supabase.auth.getSession()
      return !!session
    } catch (error) {
      console.error('Error checking authentication:', error)
      return false
    }
  }

  // Get access token
  getAccessToken() {
    return localStorage.getItem('access_token')
  }

  // Get refresh token
  getRefreshToken() {
    return localStorage.getItem('refresh_token')
  }

  // Refresh access token using Supabase
  async refreshToken() {
    if (!this.supabase) {
      throw new Error('Supabase not initialized')
    }

    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      
      if (error) {
        throw new Error('Token refresh failed')
      }

      if (data.session) {
        localStorage.setItem('access_token', data.session.access_token)
        localStorage.setItem('refresh_token', data.session.refresh_token)
        return data.session.access_token
      }

      throw new Error('No session available')
    } catch (error) {
      // If refresh fails, logout user
      await this.logout()
      throw error
    }
  }

  // Get authenticated headers for API requests
  async getAuthHeaders() {
    if (!this.supabase) {
      throw new Error('Supabase not initialized')
    }

    const { data: { session } } = await this.supabase.auth.getSession()
    
    if (!session) {
      throw new Error('No access token available')
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  // Make authenticated API request with automatic token refresh
  async authenticatedRequest(url, options = {}) {
    if (!this.supabase) {
      throw new Error('Supabase not initialized')
    }

    try {
      const headers = await this.getAuthHeaders()
      // Construct full URL if it's a relative path
      const fullUrl = url.startsWith('http') ? url : `${apiUrl}${url}`
      const response = await fetch(fullUrl, {
        ...options,
        headers: {
          ...headers,
          ...options.headers
        }
      })

      // If token is expired, try to refresh
      if (response.status === 401) {
        try {
          await this.refreshToken()
          const newHeaders = await this.getAuthHeaders()
          const retryResponse = await fetch(fullUrl, {
            ...options,
            headers: {
              ...newHeaders,
              ...options.headers
            }
          })
          return retryResponse
        } catch (refreshError) {
          // If refresh fails, redirect to login
          await this.logout()
          window.location.href = '/login'
          throw refreshError
        }
      }

      return response
    } catch (error) {
      throw error
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback) {
    if (!this.supabase) {
      return () => {}
    }

    return this.supabase.auth.onAuthStateChange(callback)
  }
}

// Create singleton instance
const authService = new AuthService()
export default authService
