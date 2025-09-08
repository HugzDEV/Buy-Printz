import React, { useState, useEffect } from 'react'
import { 
  CheckCircle, 
  XCircle, 
  Eye, 
  User, 
  Calendar,
  DollarSign,
  Tag,
  Loader2,
  AlertCircle,
  FileText
} from 'lucide-react'
import { GlassCard, GlassButton } from './ui'
import authService from '../services/auth'

const AdminTemplateReview = () => {
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    loadPendingTemplates()
  }, [])

  const loadPendingTemplates = async () => {
    try {
      setLoading(true)
      const response = await authService.authenticatedRequest('/api/creator-marketplace/admin/pending-templates')
      
      if (response.ok) {
        const data = await response.json()
        setTemplates(data.templates)
      } else {
        setError('Failed to load pending templates')
      }
    } catch (error) {
      console.error('Error loading pending templates:', error)
      setError('Network error loading templates')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (templateId) => {
    try {
      setActionLoading(templateId)
      const response = await authService.authenticatedRequest(`/api/creator-marketplace/admin/templates/${templateId}/approve`, {
        method: 'POST'
      })
      
      if (response.ok) {
        // Remove template from list
        setTemplates(prev => prev.filter(t => t.id !== templateId))
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null)
        }
      } else {
        setError('Failed to approve template')
      }
    } catch (error) {
      console.error('Error approving template:', error)
      setError('Network error approving template')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (templateId, reason) => {
    try {
      setActionLoading(templateId)
      const formData = new FormData()
      formData.append('reason', reason)
      
      const response = await authService.authenticatedRequest(`/api/creator-marketplace/admin/templates/${templateId}/reject`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        // Remove template from list
        setTemplates(prev => prev.filter(t => t.id !== templateId))
        if (selectedTemplate?.id === templateId) {
          setSelectedTemplate(null)
        }
      } else {
        setError('Failed to reject template')
      }
    } catch (error) {
      console.error('Error rejecting template:', error)
      setError('Network error rejecting template')
    } finally {
      setActionLoading(null)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading pending templates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-purple-700 to-blue-600 bg-clip-text text-transparent">
            Template Review
          </h1>
          <p className="text-gray-600 mt-1">
            Review and approve templates for the marketplace
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        )}

        {templates.length === 0 ? (
          <GlassCard className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">All Caught Up! 🎉</h2>
            <p className="text-gray-600">
              No templates are currently pending review.
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Templates List */}
            <div className="lg:col-span-1">
              <GlassCard className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Pending Templates ({templates.length})
                </h2>
                
                <div className="space-y-3">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedTemplate?.id === template.id
                          ? 'bg-purple-100 border-2 border-purple-300'
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {template.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center">
                              <User className="w-3 h-3 mr-1" />
                              {template.creator_name}
                            </span>
                            <span className="flex items-center">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {formatCurrency(template.price)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {formatDate(template.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* Template Details */}
            <div className="lg:col-span-2">
              {selectedTemplate ? (
                <GlassCard className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {selectedTemplate.name}
                      </h2>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {selectedTemplate.creator_name}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(selectedTemplate.created_at)}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1" />
                          {formatCurrency(selectedTemplate.price)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <GlassButton
                        onClick={() => handleApprove(selectedTemplate.id)}
                        disabled={actionLoading === selectedTemplate.id}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {actionLoading === selectedTemplate.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        Approve
                      </GlassButton>
                      
                      <GlassButton
                        onClick={() => {
                          const reason = prompt('Reason for rejection:')
                          if (reason) {
                            handleReject(selectedTemplate.id, reason)
                          }
                        }}
                        disabled={actionLoading === selectedTemplate.id}
                        variant="outline"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </GlassButton>
                    </div>
                  </div>

                  {/* Template Preview */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Template Preview</h3>
                    <div className="bg-gray-100 rounded-xl p-8 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Template preview would be displayed here
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        Canvas data: {selectedTemplate.canvas_data ? 'Available' : 'Not available'}
                      </p>
                    </div>
                  </div>

                  {/* Template Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                      <p className="text-gray-700 leading-relaxed">
                        {selectedTemplate.description}
                      </p>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{selectedTemplate.category}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price:</span>
                          <span className="font-medium">{formatCurrency(selectedTemplate.price)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Creator:</span>
                          <span className="font-medium">{selectedTemplate.creator_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Submitted:</span>
                          <span className="font-medium">{formatDate(selectedTemplate.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedTemplate.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                          >
                            <Tag className="w-3 h-3 inline mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Review Guidelines */}
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <h4 className="font-semibold text-blue-800 mb-2">Review Guidelines</h4>
                    <ul className="text-sm text-blue-700 space-y-1">
                      <li>• Check for original, high-quality design</li>
                      <li>• Ensure appropriate for business use</li>
                      <li>• Verify no copyrighted material</li>
                      <li>• Confirm clear, readable text</li>
                      <li>• Check proper color contrast</li>
                    </ul>
                  </div>
                </GlassCard>
              ) : (
                <GlassCard className="p-8 text-center">
                  <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-gray-800 mb-2">Select a Template</h2>
                  <p className="text-gray-600">
                    Choose a template from the list to review its details
                  </p>
                </GlassCard>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminTemplateReview
