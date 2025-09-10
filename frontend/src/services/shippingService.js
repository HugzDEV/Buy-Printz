/**
 * Shipping Service
 * Handles real-time shipping quotes from B2Sign and other partners
 */

class ShippingService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000'
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Get shipping quote for a single product
   */
  async getShippingQuote(orderData) {
    try {
      console.log('🚚 Getting shipping quote for:', orderData.product_type)
      
      // Check cache first
      const cacheKey = this.generateCacheKey(orderData)
      const cachedQuote = this.getCachedQuote(cacheKey)
      if (cachedQuote) {
        console.log('📦 Using cached shipping quote')
        return { ...cachedQuote, cache_hit: true }
      }

      // Prepare request data
      const requestData = this.prepareShippingRequest(orderData)
      
      // Make API request
      const response = await fetch(`${this.baseURL}/api/shipping/quote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get shipping quote')
      }

      const quote = await response.json()
      
      // Cache the result
      this.cacheQuote(cacheKey, quote)
      
      console.log('✅ Shipping quote received:', quote)
      return quote

    } catch (error) {
      console.error('❌ Error getting shipping quote:', error)
      throw error
    }
  }

  /**
   * Get shipping quotes for multiple products
   */
  async getBulkShippingQuotes(orders) {
    try {
      console.log('🚚 Getting bulk shipping quotes for', orders.length, 'orders')
      
      // Prepare request data
      const requestData = {
        orders: orders.map(order => this.prepareShippingRequest(order))
      }
      
      // Make API request
      const response = await fetch(`${this.baseURL}/api/shipping/quote/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        },
        body: JSON.stringify(requestData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get bulk shipping quotes')
      }

      const result = await response.json()
      console.log('✅ Bulk shipping quotes received:', result)
      return result

    } catch (error) {
      console.error('❌ Error getting bulk shipping quotes:', error)
      throw error
    }
  }

  /**
   * Prepare shipping request data from order data
   */
  prepareShippingRequest(orderData) {
    const request = {
      product_type: orderData.product_type || 'banner',
      dimensions: orderData.dimensions || { width: 2, height: 4 },
      quantity: orderData.quantity || 1,
      zip_code: orderData.zip_code || '10001',
      job_name: orderData.job_name || `BuyPrintz Order ${Date.now()}`,
      print_options: {},
      customer_info: {},
      accessories: []
    }

    // Add material for banners
    if (orderData.product_type === 'banner' && orderData.material) {
      request.material = orderData.material
    }

    // Add print options from banner options
    if (orderData.print_options) {
      request.print_options = { ...orderData.print_options }
    }

    // Add tent-specific options
    if (orderData.product_type === 'tent' || orderData.product_type === 'tradeshow_tent') {
      if (orderData.tent_design_option) {
        request.print_options.tent_design_option = orderData.tent_design_option
      }
      if (orderData.tent_size) {
        request.print_options.tent_size = orderData.tent_size
      }
      if (orderData.accessories) {
        request.accessories = orderData.accessories
      }
    }

    // Add tin-specific options
    if (orderData.product_type === 'tin') {
      if (orderData.tin_surface_coverage) {
        request.print_options.tin_surface_coverage = orderData.tin_surface_coverage
      }
    }

    // Add customer info
    if (orderData.customer_info) {
      request.customer_info = { ...orderData.customer_info }
    }

    return request
  }

  /**
   * Generate cache key for order data
   */
  generateCacheKey(orderData) {
    const keyData = {
      product_type: orderData.product_type,
      material: orderData.material,
      dimensions: orderData.dimensions,
      quantity: orderData.quantity,
      zip_code: orderData.zip_code,
      print_options: orderData.print_options
    }
    return JSON.stringify(keyData)
  }

  /**
   * Get cached quote if available and not expired
   */
  getCachedQuote(cacheKey) {
    const cached = this.cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    if (cached) {
      this.cache.delete(cacheKey)
    }
    return null
  }

  /**
   * Cache shipping quote
   */
  cacheQuote(cacheKey, quote) {
    this.cache.set(cacheKey, {
      data: quote,
      timestamp: Date.now()
    })
  }

  /**
   * Get available shipping partners
   */
  async getShippingPartners() {
    try {
      const response = await fetch(`${this.baseURL}/api/shipping/partners`)
      if (!response.ok) {
        throw new Error('Failed to get shipping partners')
      }
      return await response.json()
    } catch (error) {
      console.error('❌ Error getting shipping partners:', error)
      throw error
    }
  }

  /**
   * Check shipping service health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/api/shipping/health`)
      if (!response.ok) {
        throw new Error('Shipping service unhealthy')
      }
      return await response.json()
    } catch (error) {
      console.error('❌ Shipping service health check failed:', error)
      return { status: 'unhealthy', error: error.message }
    }
  }

  /**
   * Test shipping integration
   */
  async testIntegration() {
    try {
      const response = await fetch(`${this.baseURL}/api/shipping/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      })
      if (!response.ok) {
        throw new Error('Test failed')
      }
      return await response.json()
    } catch (error) {
      console.error('❌ Shipping integration test failed:', error)
      throw error
    }
  }

  /**
   * Get authentication token
   */
  getAuthToken() {
    return localStorage.getItem('authToken') || sessionStorage.getItem('authToken')
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
    console.log('🗑️ Shipping quote cache cleared')
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout,
      entries: Array.from(this.cache.keys())
    }
  }
}

// Create singleton instance
const shippingService = new ShippingService()

export default shippingService
