// Canvas State API Service
import authService from './auth'

class CanvasStateService {
  /**
   * Save canvas state to database
   * @param {Object} canvasData - Complete canvas state
   * @param {Object} bannerSettings - Banner configuration
   * @param {string} sessionId - Optional session identifier
   * @param {boolean} isCheckoutSession - Whether this is for checkout flow
   */
  async saveCanvasState(canvasData, bannerSettings = null, sessionId = null, isCheckoutSession = false) {
    try {
      const response = await authService.authenticatedRequest('/api/canvas/save', {
        method: 'POST',
        body: JSON.stringify({
          canvas_data: canvasData,
          banner_settings: bannerSettings,
          session_id: sessionId,
          is_checkout_session: isCheckoutSession
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to save canvas state')
      }

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('Error saving canvas state:', error)
      throw error
    }
  }

  /**
   * Load canvas state from database
   * @param {string} sessionId - Optional session identifier
   * @param {boolean} isCheckoutSession - Whether to load checkout-specific state
   */
  async loadCanvasState(sessionId = null, isCheckoutSession = null) {
    try {
      let url = '/api/canvas/load'
      const params = new URLSearchParams()
      
      if (sessionId) params.append('session_id', sessionId)
      if (isCheckoutSession !== null) params.append('is_checkout_session', isCheckoutSession)
      
      if (params.toString()) {
        url += '?' + params.toString()
      }

      const response = await authService.authenticatedRequest(url)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to load canvas state')
      }

      const data = await response.json()
      return data.success ? data.canvas_state : null
    } catch (error) {
      console.error('Error loading canvas state:', error)
      return null // Return null instead of throwing for graceful handling
    }
  }

  /**
   * Clear canvas state from database
   * @param {string} sessionId - Optional session identifier
   */
  async clearCanvasState(sessionId = null) {
    try {
      let url = '/api/canvas/clear'
      if (sessionId) {
        url += '?session_id=' + encodeURIComponent(sessionId)
      }

      const response = await authService.authenticatedRequest(url, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to clear canvas state')
      }

      const data = await response.json()
      return data.success
    } catch (error) {
      console.error('Error clearing canvas state:', error)
      return false
    }
  }

  /**
   * Save canvas state specifically for checkout flow
   * @param {Object} canvasData - Complete canvas state
   * @param {Object} bannerSettings - Banner configuration
   */
  async saveCheckoutCanvasState(canvasData, bannerSettings) {
    return this.saveCanvasState(canvasData, bannerSettings, 'checkout', true)
  }

  /**
   * Load canvas state from checkout flow
   */
  async loadCheckoutCanvasState() {
    return this.loadCanvasState('checkout', true)
  }

  /**
   * Clear checkout canvas state
   */
  async clearCheckoutCanvasState() {
    return this.clearCanvasState('checkout')
  }

  /**
   * Auto-save canvas state with debouncing
   * @param {Object} canvasData - Complete canvas state
   * @param {Object} bannerSettings - Banner configuration
   * @param {number} delay - Debounce delay in milliseconds
   */
  autoSaveCanvasState(canvasData, bannerSettings, delay = 2000) {
    // Clear existing timeout
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
    }

    // Set new timeout for auto-save
    this.autoSaveTimeout = setTimeout(async () => {
      try {
        await this.saveCanvasState(canvasData, bannerSettings)
        console.log('Canvas state auto-saved')
      } catch (error) {
        console.warn('Auto-save failed:', error.message)
      }
    }, delay)
  }

  /**
   * Clear auto-save timeout
   */
  clearAutoSave() {
    if (this.autoSaveTimeout) {
      clearTimeout(this.autoSaveTimeout)
      this.autoSaveTimeout = null
    }
  }
}

export default new CanvasStateService()
