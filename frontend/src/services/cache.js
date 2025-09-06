// Simple in-memory cache service for templates and designs
class CacheService {
  constructor() {
    this.cache = new Map()
    this.timestamps = new Map()
    this.defaultTTL = 5 * 60 * 1000 // 5 minutes default TTL
  }

  // Set cache with TTL
  set(key, value, ttl = this.defaultTTL) {
    const timestamp = Date.now()
    this.cache.set(key, value)
    this.timestamps.set(key, timestamp + ttl)
    
    // Clean up expired entries
    this.cleanup()
  }

  // Get from cache
  get(key) {
    const timestamp = this.timestamps.get(key)
    
    if (!timestamp || Date.now() > timestamp) {
      // Expired or doesn't exist
      this.cache.delete(key)
      this.timestamps.delete(key)
      return null
    }
    
    return this.cache.get(key)
  }

  // Check if key exists and is valid
  has(key) {
    const timestamp = this.timestamps.get(key)
    return timestamp && Date.now() <= timestamp
  }

  // Delete specific key
  delete(key) {
    this.cache.delete(key)
    this.timestamps.delete(key)
  }

  // Clear all cache
  clear() {
    this.cache.clear()
    this.timestamps.clear()
  }

  // Clean up expired entries
  cleanup() {
    const now = Date.now()
    for (const [key, timestamp] of this.timestamps.entries()) {
      if (now > timestamp) {
        this.cache.delete(key)
        this.timestamps.delete(key)
      }
    }
  }

  // Get cache stats
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }

  // Cache templates with longer TTL (10 minutes)
  setTemplates(userId, templates) {
    this.set(`templates_${userId}`, templates, 10 * 60 * 1000)
  }

  getTemplates(userId) {
    return this.get(`templates_${userId}`)
  }

  // Cache designs with medium TTL (5 minutes)
  setDesigns(userId, designs) {
    this.set(`designs_${userId}`, designs, 5 * 60 * 1000)
  }

  getDesigns(userId) {
    return this.get(`designs_${userId}`)
  }

  // Cache individual template/design with long TTL (15 minutes)
  setTemplate(templateId, template) {
    this.set(`template_${templateId}`, template, 15 * 60 * 1000)
  }

  getTemplate(templateId) {
    return this.get(`template_${templateId}`)
  }

  setDesign(designId, design) {
    this.set(`design_${designId}`, design, 15 * 60 * 1000)
  }

  getDesign(designId) {
    return this.get(`design_${designId}`)
  }

  // Invalidate cache when data changes
  invalidateTemplates(userId) {
    this.delete(`templates_${userId}`)
  }

  invalidateDesigns(userId) {
    this.delete(`designs_${userId}`)
  }

  invalidateTemplate(templateId) {
    this.delete(`template_${templateId}`)
  }

  invalidateDesign(designId) {
    this.delete(`design_${designId}`)
  }
}

// Create singleton instance
const cacheService = new CacheService()

export default cacheService
