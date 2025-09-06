import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Stage, Layer, Text, Image, Rect, Circle, Line, Star, RegularPolygon, Transformer } from 'react-konva'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Grid3X3, 
  Eye,
  EyeOff,
  Trash2,
  Copy,
  Undo2, 
  Redo2, 
  FileText,
  Move,
  RotateCw,
  Maximize2,
  Minimize2,
  Save,
  Download,
  ShoppingCart,
  SendToBack,
  MoveDown,
  MoveUp,
  Layers,
  Settings,
  Undo,
  Redo,
  ArrowUp,
  ArrowDown,
  X
} from 'lucide-react'
import { GlassCard, NeumorphicButton, GlassButton, GlassPanel } from './ui'
import Konva from 'konva'




// Enable text rendering fix for better text display
Konva._fixTextRendering = true

// Enable all events on Konva, even when dragging a node
// This is required for proper touch handling on mobile devices
Konva.hitOnDragEnabled = true

// Enable touch event capture for better mobile support
Konva.captureTouchEventsEnabled = true


const BannerCanvas = ({
  elements,
  setElements,
  selectedId,
  setSelectedId,
  canvasSize,
  backgroundColor,
  onExport,
  onSave,
  onCreateOrder,
  onClearCanvas,
  hasElements
}) => {
  const stageRef = useRef()
  const transformerRef = useRef()
  const [scale, setScale] = useState(1.0) // Default to 100% zoom
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 })
  
  // Get the currently selected element
  const selectedElement = elements.find(el => el.id === selectedId)
  
  // Auto-adjust scale when canvas size changes - DISABLED for user control
  // useEffect(() => {
  //   const containerWidth = 800 // Approximate container width
  //   const containerHeight = 600 // Approximate container height
  //   
  //   const scaleX = (containerWidth - 100) / canvasSize.width
  //   const scaleY = (containerHeight - 100) / canvasSize.height
  //   
  //   // Use the smaller scale to ensure canvas fits
  //   const newScale = Math.min(scaleX, scaleY, 1) // Don't scale up beyond 1
  //   setScale(Math.max(0.3, newScale)) // Minimum scale of 0.3
  // }, [canvasSize])



  // Mobile-responsive canvas scaling with better viewport detection
  useEffect(() => {
    const updateCanvasScale = () => {
      const isMobile = window.innerWidth < 768
      const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024
      
      if (isMobile) {
        // Mobile scaling - ensure canvas fits within viewport with proper margins
        const viewportWidth = window.innerWidth - 16 // Minimal padding for mobile
        const viewportHeight = window.innerHeight - 160 // Use existing space efficiently
        
        const scaleX = (viewportWidth * 0.9) / canvasSize.width // Use 90% of available width
        const scaleY = (viewportHeight * 0.9) / canvasSize.height // Use 90% of available height
        
        // Use the smaller scale to ensure canvas fits completely
        const newScale = Math.min(scaleX, scaleY, 1)
        setScale(Math.max(0.15, newScale)) // Slightly higher minimum scale for better interaction
      } else if (isTablet) {
        // Tablet scaling - slightly more generous
        const viewportWidth = window.innerWidth - 48
        const viewportHeight = window.innerHeight - 320
        
        const scaleX = (viewportWidth * 0.85) / canvasSize.width
        const scaleY = (viewportHeight * 0.85) / canvasSize.height
        
        const newScale = Math.min(scaleX, scaleY, 1)
        setScale(Math.max(0.25, newScale))
      } else {
        // Desktop scaling - maintain current behavior but with better fit
        const viewportWidth = window.innerWidth - 100
        const viewportHeight = window.innerHeight - 200
        
        const scaleX = viewportWidth / canvasSize.width
        const scaleY = viewportHeight / canvasSize.height
        
        const newScale = Math.min(scaleX, scaleY, 1)
        setScale(Math.max(0.3, newScale))
      }
    }

    updateCanvasScale()
    window.addEventListener('resize', updateCanvasScale)
    window.addEventListener('orientationchange', updateCanvasScale)
    return () => {
      window.removeEventListener('resize', updateCanvasScale)
      window.removeEventListener('orientationchange', updateCanvasScale)
    }
  }, [canvasSize])
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(0)
  const [showGrid, setShowGrid] = useState(true)
  const [showGuides, setShowGuides] = useState(true)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionRect, setSelectionRect] = useState(null)
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  
  // Text editing state for custom modal
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingTextId, setEditingTextId] = useState(null);
  const [editingTextValue, setEditingTextValue] = useState('');

  // Canvas utilities
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push({ elements: [...elements] })
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }, [elements, history, historyStep])

  // Simple, working text editing implementation - moved here after saveToHistory
  const handleTextEdit = useCallback((id) => {
    const element = elements.find(el => el.id === id);
    if (element && element.type === 'text') {
      // Show custom modal instead of browser prompt
      setEditingTextId(id);
      setEditingTextValue(element.text || 'Text');
      setIsEditingText(true);
    }
  }, [elements, setElements]);

  // Save text changes from modal
  const handleTextSave = useCallback(() => {
    if (editingTextId && editingTextValue !== null) {
      const element = elements.find(el => el.id === editingTextId);
      if (element && element.text !== editingTextValue) {
        const updatedElements = elements.map(el => 
          el.id === editingTextId ? { ...el, text: editingTextValue } : el
        );
        setElements(updatedElements);
        saveToHistory();
      }
    }
    setIsEditingText(false);
    setEditingTextId(null);
    setEditingTextValue('');
  }, [editingTextId, editingTextValue, elements, setElements, saveToHistory]);

  // Cancel text editing
  const handleTextCancel = useCallback(() => {
    setIsEditingText(false);
    setEditingTextId(null);
    setEditingTextValue('');
  }, []);

  // Removed unused text editing functions - using simple prompt approach

  const undo = () => {
    if (historyStep > 0) {
      const prevStep = historyStep - 1
      setElements(history[prevStep].elements)
      setHistoryStep(prevStep)
    }
  }

  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextStep = historyStep + 1
      setElements(history[nextStep].elements)
      setHistoryStep(nextStep)
    }
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.1, 2))
  const zoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.3))
  const resetZoom = () => setScale(0.8)

  const deleteSelected = () => {
    if (selectedIds.length > 0) {
      setElements(prev => prev.filter(el => !selectedIds.includes(el.id)))
      setSelectedIds([])
      setSelectedId(null)
      saveToHistory()
    } else if (selectedId) {
      setElements(prev => prev.filter(el => el.id !== selectedId))
      setSelectedId(null)
      saveToHistory()
    }
  }

  const duplicateSelected = () => {
    if (selectedIds.length > 0) {
      const selectedElements = elements.filter(el => selectedIds.includes(el.id))
      const newElements = selectedElements.map(element => ({
        ...element,
        id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: element.x + 20,
        y: element.y + 20
      }))
      setElements(prev => [...prev, ...newElements])
      setSelectedIds(newElements.map(el => el.id))
      setSelectedId(null)
      saveToHistory()
    } else if (selectedId) {
      const selectedElement = elements.find(el => el.id === selectedId)
      if (selectedElement) {
        const newElement = {
          ...selectedElement,
          id: `${selectedElement.type}-${Date.now()}`,
          x: selectedElement.x + 20,
          y: selectedElement.y + 20
        }
        setElements(prev => [...prev, newElement])
        setSelectedId(newElement.id)
        saveToHistory()
      }
    }
  }

  // Selection rectangle functions
  const getIntersection = (r1, r2) => {
    return !(
      r2.x > r1.x + r1.width ||
      r2.x + r2.width < r1.x ||
      r2.y > r1.y + r1.height ||
      r2.y + r2.height < r1.y
    )
  }

  // Selection rectangle functions (based on working bannersample.jsx)
  const startSelection = (pos) => {
    setIsSelecting(true)
    setSelectionStart(pos)
    setSelectionRect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0
    })
    
    // Auto-clear selection mode after 5 seconds to prevent getting stuck
    setTimeout(() => {
      if (isSelecting) {
        setIsSelecting(false)
        setSelectionRect(null)
        setSelectionStart(null)
      }
    }, 5000)
  }

  const updateSelection = (pos) => {
    if (!isSelecting || !selectionStart) return

    const startX = selectionStart.x
    const startY = selectionStart.y
    const newRect = {
      x: Math.min(startX, pos.x),
      y: Math.min(startY, pos.y),
      width: Math.abs(pos.x - startX),
      height: Math.abs(pos.y - startY)
    }
    setSelectionRect(newRect)
  }

  const finishSelection = () => {
    if (!isSelecting || !selectionRect) return

    // Normalize the selection rectangle to handle negative width/height
    const normalizedRect = {
      x: Math.min(selectionRect.x, selectionRect.x + selectionRect.width),
      y: Math.min(selectionRect.y, selectionRect.y + selectionRect.height),
      width: Math.abs(selectionRect.width),
      height: Math.abs(selectionRect.height)
    }

    // Only process selection if the rectangle is large enough (avoid accidental micro-drags)
    const minSelectionSize = 10
    if (normalizedRect.width < minSelectionSize && normalizedRect.height < minSelectionSize) {
      setIsSelecting(false)
      setSelectionRect(null)
      setSelectionStart(null)
      return
    }

    // Find elements within selection rectangle
    const selectedElements = elements.filter(element => {
      const elemX = element.x || 0
      const elemY = element.y || 0
      let elemWidth = element.width || 50
      let elemHeight = element.height || 50
      
      // Handle different element types for proper bounds
      if (element.type === 'circle') {
        const radius = element.radius || 50
        elemWidth = radius * 2
        elemHeight = radius * 2
      } else if (element.type === 'star') {
        const outerRadius = element.outerRadius || 50
        elemWidth = outerRadius * 2
        elemHeight = outerRadius * 2
      }

      // Check if element intersects with selection rectangle using normalized rect
      const intersects = elemX < normalizedRect.x + normalizedRect.width &&
             elemX + elemWidth > normalizedRect.x &&
             elemY < normalizedRect.y + normalizedRect.height &&
             elemY + elemHeight > normalizedRect.y
      
      return intersects
    })

    if (selectedElements.length > 1) {
      const ids = selectedElements.map(el => el.id)
      setSelectedIds(ids)
      setSelectedId(null) // Clear single selection
    } else if (selectedElements.length === 1) {
      setSelectedId(selectedElements[0].id)
      setSelectedIds([])
    } else {
      setSelectedId(null)
      setSelectedIds([])
    }

    setIsSelecting(false)
    setSelectionRect(null)
    setSelectionStart(null)
  }

  // Element handlers
  // Simple element selection handler
  const handleSelect = (id) => {
    if (selectedIds.includes(id)) {
      // Deselect if already selected
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id))
      setSelectedId(null)
    } else {
      // Select new element
      setSelectedIds([id])
    setSelectedId(id)
    }
  }

  // Clean element change handler
  const handleElementChange = (id, newProps) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...newProps } : el
    ))

    saveToHistory()
  }







  const handleDragEnd = (e, id) => {
    const node = e.target
    handleElementChange(id, {
      x: node.x(),
      y: node.y()
    })
  }

  // Handle element transformation end
  const handleTransformEnd = (e, id) => {
    const element = elements.find(el => el.id === id)
    if (!element) return

    const node = e.target
    

    
    // Update element properties based on transformation
    const updatedElement = { ...element }
    
    // Update position
    updatedElement.x = node.x()
    updatedElement.y = node.y()
    
    // Update rotation
    updatedElement.rotation = node.rotation()
    
    // Handle scaling - Konva transformer changes scaleX/scaleY, not width/height
    if (element.type === 'text') {
      // For text, we need to handle scaling differently
      const newWidth = Math.max(50, node.width() * node.scaleX())
      const newHeight = Math.max(50, node.height() * node.scaleY())
      
      updatedElement.width = newWidth
      updatedElement.height = newHeight
      
      // Reset scale to 1 after updating dimensions
      node.scaleX(1)
      node.scaleY(1)
    } else if (element.type === 'circle') {
      // For circles, update radius based on scale
      const newRadius = Math.max(10, (element.radius || 50) * Math.max(node.scaleX(), node.scaleY()))
      updatedElement.radius = newRadius
      
      // Reset scale to 1
      node.scaleX(1)
      node.scaleY(1)
    } else if (element.type === 'star') {
      // For stars, update outer radius based on scale
      const newOuterRadius = Math.max(10, (element.outerRadius || 50) * Math.max(node.scaleX(), node.scaleY()))
      updatedElement.outerRadius = newOuterRadius
      
      // Reset scale to 1
      node.scaleX(1)
      node.scaleY(1)
    } else if (element.type === 'triangle' || element.type === 'hexagon') {
      // For regular polygons, update radius based on scale
      const newRadius = Math.max(10, (element.radius || 50) * Math.max(node.scaleX(), node.scaleY()))
      updatedElement.radius = newRadius
      
      // Reset scale to 1
      node.scaleX(1)
      node.scaleY(1)
    } else if (element.type === 'line') {
      // For lines, update points based on scale
      const points = element.points || [0, 0, 100, 100]
      const newPoints = points.map((point, index) => {
        if (index % 2 === 0) {
          return point * node.scaleX()
          } else {
          return point * node.scaleY()
        }
      })
      updatedElement.points = newPoints
      
      // Reset scale to 1
      node.scaleX(1)
      node.scaleY(1)
    } else if (element.type === 'icon') {
      // For icons, update width/height based on scale (same as rectangles)
      const newWidth = Math.max(10, (element.width || 60) * node.scaleX())
      const newHeight = Math.max(10, (element.height || 60) * node.scaleY())
      
      updatedElement.width = newWidth
      updatedElement.height = newHeight
      
      // Reset scale to 1
      node.scaleX(1)
      node.scaleY(1)
    } else if (element.type === 'image' && element.imageDataUrl) {
      // For AI-generated QR codes (image type with imageDataUrl)
      const newWidth = Math.max(10, (element.width || 200) * node.scaleX())
      const newHeight = Math.max(10, (element.height || 200) * node.scaleY())
      
      updatedElement.width = newWidth
      updatedElement.height = newHeight
      
      // Reset scale to 1
      node.scaleX(1)
      node.scaleY(1)
        } else {
      // For rectangles and other shapes, update width/height based on scale
      const newWidth = Math.max(10, (element.width || 100) * node.scaleX())
      const newHeight = Math.max(10, (element.height || 100) * node.scaleY())
      
      updatedElement.width = newWidth
      updatedElement.height = newHeight
      
      // Reset scale to 1
      node.scaleX(1)
      node.scaleY(1)
    }

    // Update elements array
    const newElements = elements.map(el => el.id === id ? updatedElement : el)
    setElements(newElements)
    
    // Save to history
    saveToHistory()
    
    // Force transformer update to ensure handles match new element size
    if (transformerRef.current) {
      transformerRef.current.forceUpdate()
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip keyboard shortcuts if user is typing in input fields
      if (e.target.tagName === 'INPUT' || 
          e.target.tagName === 'TEXTAREA' || 
          e.target.tagName === 'SELECT' ||
          e.target.isContentEditable ||
          e.target.closest('input') ||
          e.target.closest('textarea') ||
          e.target.closest('[contenteditable]')) {
        return
      }
      
            if (e.key === 'Delete' && selectedId) {
        deleteSelected()
      } else if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            undo()
            break
          case 'y':
            e.preventDefault()
            redo()
            break
          case 'd':
            e.preventDefault()
            duplicateSelected()
            break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, selectedElement])

  // Ensure new element has proper initial properties
  const createElementWithBounds = (type, x, y, additionalProps = {}) => {
    const baseElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: x || 100,
      y: y || 100,
      rotation: 0,
      fill: '#000000',
      stroke: '#000000',
      strokeWidth: 1,
      ...additionalProps
    }

    // Add type-specific properties
    switch (type) {
      case 'text':
        return {
          ...baseElement,
          text: 'Text',
          fontSize: 24,
          fontFamily: 'Arial',
          width: 200,
          height: 50,
          fill: '#000000',
          align: 'left',
          verticalAlign: 'top',
          padding: 0
        }
      case 'rect':
        return {
          ...baseElement,
          width: 100,
          height: 100,
          fill: '#ff0000'
        }
      case 'circle':
        return {
          ...baseElement,
          radius: 50,
          fill: '#00ff00'
        }
      case 'star':
        return {
          ...baseElement,
          numPoints: 5,
          innerRadius: 30,
          outerRadius: 50,
          fill: '#ffff00'
        }
      case 'triangle':
        return {
          ...baseElement,
          radius: 50,
          fill: '#0000ff'
        }
      case 'hexagon':
        return {
          ...baseElement,
          radius: 50,
          fill: '#800080'
        }
      case 'line':
        return {
          ...baseElement,
          points: [0, 0, 100, 100],
          closed: false,
          strokeWidth: 2
        }
      case 'image':
        return {
          ...baseElement,
          image: imageUrl,
          width: 200,
          height: 200
        }
      case 'qrcode':
        return {
          ...baseElement,
          type: 'image', // QR codes are stored as image type
          width: 200,
          height: 200,
          assetName: 'QR Code',
          qrData: {
            url: 'https://example.com',
            color: '#000000',
            backgroundColor: '#ffffff'
          }
        }
      case 'icon':
        return {
          ...baseElement,
          width: 60,
          height: 60,
          fill: '#666666',
          stroke: '#000000',
          strokeWidth: 1,
          symbol: null,
          imagePath: null
        }

      default:
        return baseElement
    }
  }

  // Calculate proper bounds for an element
  const getElementBounds = (element) => {
    const x = element.x || 0
    const y = element.y || 0
    
    switch (element.type) {
      case 'circle':
        const radius = element.radius || 50
        return {
          x: x - radius,
          y: y - radius,
          width: radius * 2,
          height: radius * 2
        }
      case 'star':
        const outerRadius = element.outerRadius || 50
        return {
          x: x - outerRadius,
          y: y - outerRadius,
          width: outerRadius * 2,
          height: outerRadius * 2
        }
      case 'triangle':
      case 'hexagon':
        const polyRadius = element.radius || 50
        return {
          x: x - polyRadius,
          y: y - polyRadius,
          width: polyRadius * 2,
          height: polyRadius * 2
        }
      case 'line':
        const points = element.points || [0, 0, 100, 100]
        const minX = Math.min(points[0], points[2])
        const maxX = Math.max(points[0], points[2])
        const minY = Math.min(points[1], points[3])
        const maxY = Math.max(points[1], points[3])
        return {
          x: x + minX,
          y: y + minY,
          width: maxX - minX,
          height: maxY - minY
        }
      case 'image':
        return {
          x: x,
          y: y,
          width: element.width || (element.imageDataUrl ? 200 : 100), // QR codes are typically 200x200
          height: element.height || (element.imageDataUrl ? 200 : 100)
        }
      case 'icon':
        return {
          x: x,
          y: y,
          width: element.width || 60,
          height: element.height || 60
        }
      case 'qr':
        return {
          x: x,
          y: y,
          width: element.width || 200,
          height: element.height || 200
        }
      case 'qrcode':
        return {
          x: x,
          y: y,
          width: element.width || 200,
          height: element.height || 200
        }

      default:
        return {
          x: x,
          y: y,
          width: element.width || 100,
          height: element.height || 100
        }
    }
  }

  // Update transformer when selection or elements change
  useEffect(() => {
    const updateTransformer = () => {
      if (selectedIds.length > 0 && stageRef.current && transformerRef.current) {
        const selectedNodes = selectedIds.map(id => {
          const element = elements.find(el => el.id === id)
          if (!element) return null
          
          // Find the actual Konva node
          const node = stageRef.current.findOne(`#${id}`)
          if (node) {

            return node
          }
          return null
        }).filter(Boolean)
        
        if (selectedNodes.length > 0) {
          transformerRef.current.nodes(selectedNodes)
          transformerRef.current.getLayer()?.batchDraw()
          
          // Force update to ensure proper bounds calculation
          setTimeout(() => {
            if (transformerRef.current) {
              transformerRef.current.forceUpdate()
            }
          }, 10)
        }
      } else if (selectedId && stageRef.current && transformerRef.current) {
        const selectedNode = stageRef.current.findOne(`#${selectedId}`)
        if (selectedNode) {

          
          transformerRef.current.nodes([selectedNode])
          transformerRef.current.getLayer()?.batchDraw()
          
          // Force update to ensure proper bounds calculation
          setTimeout(() => {
            if (transformerRef.current) {
              transformerRef.current.forceUpdate()
            }
          }, 10)
        }
      } else if (transformerRef.current) {
        transformerRef.current.nodes([])
        transformerRef.current.getLayer()?.batchDraw()
      }
    }

    // Immediate update
    updateTransformer()
    
    // Delayed update to ensure elements are rendered
    const timeoutId = setTimeout(updateTransformer, 50)
    
    return () => clearTimeout(timeoutId)
  }, [selectedId, selectedIds, elements]) // Include elements for proper updates

  // Additional transformer update when elements array changes
  useEffect(() => {
    if (transformerRef.current && (selectedId || selectedIds.length > 0)) {
      // Force transformer update when elements change
      setTimeout(() => {
        if (transformerRef.current) {
          transformerRef.current.forceUpdate()
        }
      }, 100)
    }
  }, [elements.length]) // Only trigger on elements array length change

  // Remove the TextEditor component since we're using vanilla DOM approach

  // Ensure element has valid properties to prevent disappearing
  const ensureElementProperties = (element) => {
    const defaults = {
      x: 0,
      y: 0,
      rotation: 0,
      fill: '#000000',
      stroke: '#000000',
      strokeWidth: 1
    }
    
    // Apply defaults for missing properties
    Object.keys(defaults).forEach(key => {
      if (element[key] === undefined || element[key] === null) {
        element[key] = defaults[key]
      }
    })
    
    // Type-specific defaults
    switch (element.type) {
      case 'text':
        if (!element.text) element.text = 'Text'
        if (!element.fontSize) element.fontSize = 24
        if (!element.fontFamily) element.fontFamily = 'Arial'
        if (!element.width) element.width = 200
        if (!element.height) element.height = 50
        break
      case 'rect':
        if (!element.width) element.width = 100
        if (!element.height) element.height = 100
        break
      case 'circle':
        if (!element.radius) element.radius = 50
        break
      case 'star':
        if (!element.numPoints) element.numPoints = 5
        if (!element.innerRadius) element.innerRadius = 30
        if (!element.outerRadius) element.outerRadius = 50
        break
      case 'triangle':
      case 'hexagon':
        if (!element.radius) element.radius = 50
        break
      case 'line':
        if (!element.points) element.points = [0, 0, 100, 100]
        break
      case 'image':
        if (!element.width) element.width = 100
        if (!element.height) element.height = 100
        // Handle AI-generated QR codes
        if (element.imageDataUrl && !element.image) {
          // QR codes generated by AI agent have imageDataUrl
          const img = new window.Image()
          img.src = element.imageDataUrl
          element.image = img
        }
        break
      case 'icon':
        if (!element.width) element.width = 60
        if (!element.height) element.height = 60
        if (!element.fill) element.fill = '#666666'
        if (!element.stroke) element.stroke = '#000000'
        if (!element.strokeWidth) element.strokeWidth = 1
        if (!element.symbol) element.symbol = null
        if (!element.imagePath) element.imagePath = null
        break
      case 'qr':
        if (!element.width) element.width = 200
        if (!element.height) element.height = 200
        if (!element.url) element.url = 'https://example.com'
        if (!element.qrColor) element.qrColor = '#000000'
        if (!element.backgroundColor) element.backgroundColor = '#ffffff'
        break
      case 'qrcode':
        // Handle QR codes created by AI agent (stored as image type)
        if (!element.width) element.width = 200
        if (!element.height) element.height = 200
        if (!element.assetName) element.assetName = 'QR Code'
        if (!element.qrData) {
          element.qrData = {
            url: 'https://example.com',
            color: '#000000',
            backgroundColor: '#ffffff'
          }
        }
        break

    }
    
    return element
  }

  // Render elements
  const renderElement = (element) => {
    // Ensure element has all required properties
    const safeElement = ensureElementProperties({ ...element })
    
    const commonProps = {
      id: safeElement.id,
      x: safeElement.x || 0,
      y: safeElement.y || 0,
      draggable: true,
      onClick: (e) => {
        handleSelect(safeElement.id)
      },
      onTap: (e) => {
        handleSelect(safeElement.id)
      },
      onDragEnd: (e) => handleDragEnd(e, safeElement.id),
      onTransformEnd: (e) => handleTransformEnd(e, safeElement.id)
    }



    switch (safeElement.type) {
      case 'text':
        return (
          <Text
            key={safeElement.id}
            {...commonProps}
            text={safeElement.text || 'Text'}
            fontSize={safeElement.fontSize || 24}
            fontFamily={safeElement.fontFamily || 'Arial'}
            fill={safeElement.fill || '#000000'}
            align={safeElement.align || 'left'}
            verticalAlign={safeElement.verticalAlign || 'top'}
            width={safeElement.width || 200}
            height={safeElement.height || 50}
            padding={safeElement.padding || 0}
            listening={true}
            onDblClick={() => {
              handleTextEdit(safeElement.id);
            }}
            onDblTap={() => {
              handleTextEdit(safeElement.id);
            }}
          />
        )
      
      case 'rect':
        return (
          <Rect
            key={safeElement.id}
            {...commonProps}
            width={safeElement.width || 100}
            height={safeElement.height || 100}
            fill={safeElement.fill || '#ff0000'}
            stroke={safeElement.stroke || '#000000'}
            strokeWidth={safeElement.strokeWidth || 1}
            rotation={safeElement.rotation || 0}
          />
        )
      
      case 'circle':
        return (
          <Circle
            key={safeElement.id}
            {...commonProps}
            radius={safeElement.radius || 50}
            fill={safeElement.fill || '#00ff00'}
            stroke={safeElement.stroke || '#000000'}
            strokeWidth={safeElement.strokeWidth || 1}
            rotation={safeElement.rotation || 0}
            // Ensure proper bounds for transformer
            width={safeElement.radius * 2 || 100}
            height={safeElement.radius || 100}
          />
        )
      
      case 'star':
        return (
          <Star
            key={safeElement.id}
            {...commonProps}
            numPoints={safeElement.numPoints || 5}
            innerRadius={safeElement.innerRadius || 30}
            outerRadius={safeElement.outerRadius || 50}
            fill={safeElement.fill || '#ffff00'}
            stroke={safeElement.stroke || '#000000'}
            strokeWidth={safeElement.strokeWidth || 1}
            rotation={safeElement.rotation || 0}
            // Ensure proper bounds for transformer
            width={safeElement.outerRadius * 2 || 100}
            height={safeElement.outerRadius * 2 || 100}
          />
        )
      
      case 'triangle':
      case 'hexagon':
        return (
          <RegularPolygon
            key={safeElement.id}
            {...commonProps}
            sides={safeElement.type === 'triangle' ? 3 : 6}
            radius={safeElement.radius || 50}
            fill={safeElement.fill || '#0000ff'}
            stroke={safeElement.stroke || '#000000'}
            strokeWidth={safeElement.strokeWidth || 1}
            rotation={safeElement.rotation || 0}
            // Ensure proper bounds for transformer
            width={safeElement.radius * 2 || 100}
            height={safeElement.radius * 2 || 100}
          />
        )
      
      case 'line':
        return (
          <Line
            key={safeElement.id}
            {...commonProps}
            points={safeElement.points || [0, 0, 100, 100]}
            closed={safeElement.closed || false}
            fill={safeElement.fill || '#000000'}
            stroke={safeElement.stroke || '#000000'}
            strokeWidth={safeElement.strokeWidth || 2}
            rotation={safeElement.rotation || 0}
            // Ensure proper bounds for transformer
            width={Math.abs(safeElement.points[2] - safeElement.points[0]) || 100}
            height={Math.abs(safeElement.points[3] - safeElement.points[1]) || 100}
          />
        )
      
      case 'image':
        // Handle QR codes generated by AI agent
        if (safeElement.imageDataUrl) {
          // Create image from data URL for AI-generated QR codes
          const img = new window.Image()
          img.src = safeElement.imageDataUrl
        return (
            <Image
              key={safeElement.id}
            {...commonProps}
              image={img}
              width={safeElement.width || 200}
              height={safeElement.height || 200}
              rotation={safeElement.rotation || 0}
            />
          )
        } else {
          // Regular image elements
          return (
            <Image
              key={safeElement.id}
              {...commonProps}
              image={safeElement.image}
              width={safeElement.width || 100}
              height={safeElement.height || 100}
              rotation={safeElement.rotation || 0}
            />
          )
        }
      
      case 'icon':
        // Render icons exactly like shapes - simple and direct
        if (safeElement.imagePath) {
          // Image icons - use Image component like other elements
          return (
            <Image
              key={safeElement.id}
              {...commonProps}
              image={safeElement.imagePath}
              width={safeElement.width || 60}
              height={safeElement.height || 60}
              rotation={safeElement.rotation || 0}
            />
          )
        } else if (safeElement.symbol) {
          // Symbol icons - render the actual symbol as text so transformer can bound to it
          const fontSize = Math.max(12, Math.min(safeElement.width || 60, safeElement.height || 60) * 0.6)
          return (
            <Text
              key={safeElement.id}
              {...commonProps}
              text={safeElement.symbol}
              fontSize={fontSize}
              fontFamily="Arial"
              fill="#000000"
              width={safeElement.width || 60}
              height={safeElement.height || 60}
              align="center"
              verticalAlign="middle"
              rotation={safeElement.rotation || 0}
              // Prevent text editing for icons
              onDblClick={(e) => e.evt.preventDefault()}
              onDblTap={(e) => e.evt.preventDefault()}
            />
          )
        } else {
          // Fallback to styled rectangle
          return (
            <Rect
              key={safeElement.id}
              {...commonProps}
              width={safeElement.width || 60}
              height={safeElement.height || 60}
              fill={safeElement.fill || '#666666'}
              stroke={safeElement.stroke || '#000000'}
              strokeWidth={safeElement.strokeWidth || 1}
              rotation={safeElement.rotation || 0}
              cornerRadius={4}
              shadowColor="black"
              shadowBlur={2}
              shadowOffset={{ x: 2, y: 2 }}
              shadowOpacity={0.3}
            />
          )
        }
      
      case 'qr':
        // Simple QR code placeholder - just a styled rectangle for now
        return (
          <Rect
            key={safeElement.id}
            {...commonProps}
            width={safeElement.width || 200}
            height={safeElement.height || 200}
            fill={safeElement.backgroundColor || '#ffffff'}
            stroke={safeElement.qrColor || '#000000'}
            strokeWidth={3}
            rotation={safeElement.rotation || 0}
            cornerRadius={8}
            shadowColor="black"
            shadowBlur={4}
            shadowOffset={{ x: 2, y: 2 }}
            shadowOpacity={0.3}
          />
        )
      
      case 'qrcode':
        // QR codes created by AI agent (stored as image type with imageDataUrl)
        if (safeElement.imageDataUrl) {
          const img = new window.Image()
          img.src = safeElement.imageDataUrl
          return (
            <Image
              key={safeElement.id}
              {...commonProps}
              image={img}
              width={safeElement.width || 200}
              height={safeElement.height || 200}
              rotation={safeElement.rotation || 0}
            />
          )
        } else {
          // Fallback to styled rectangle if no image data
          return (
            <Rect
              key={safeElement.id}
              {...commonProps}
              width={safeElement.width || 200}
              height={safeElement.height || 200}
              fill={safeElement.qrData?.backgroundColor || '#ffffff'}
              stroke={safeElement.qrData?.color || '#000000'}
              strokeWidth={3}
              rotation={safeElement.rotation || 0}
              cornerRadius={8}
              shadowColor="black"
              shadowBlur={4}
              shadowOffset={{ x: 2, y: 2 }}
              shadowOpacity={0.3}
            />
          )
        }
      
      default:
        return null
    }
  }

  // DPI calculation function
  const calculateDPI = (element) => {
    if (element.type !== 'image' || !element.image) {
      return null
    }
    
    try {
      // Get the original image dimensions
      const originalWidth = element.image.naturalWidth || element.image.width
      const originalHeight = element.image.naturalHeight || element.image.height
      
      // Get the display dimensions on canvas
      const displayWidth = element.width
      const displayHeight = element.height
      
      // Calculate banner dimensions in inches
      // Canvas size is in pixels, we need to convert to actual banner size
      // For banners, we typically use 150 DPI for printing
      const bannerWidthInches = canvasSize.width / 150
      const bannerHeightInches = canvasSize.height / 150
      
      // Calculate what portion of the banner this image covers
      const imageWidthInches = (displayWidth / canvasSize.width) * bannerWidthInches
      const imageHeightInches = (displayHeight / canvasSize.height) * bannerHeightInches
      
      // Calculate DPI for width and height
      const dpiWidth = Math.round(originalWidth / imageWidthInches)
      const dpiHeight = Math.round(originalHeight / imageHeightInches)
      
      // Return the lower DPI (worst case scenario)
      const dpi = Math.min(dpiWidth, dpiHeight)
      
      return {
        dpi,
        originalWidth,
        originalHeight,
        displayWidth,
        displayHeight,
        imageWidthInches: Math.round(imageWidthInches * 100) / 100,
        imageHeightInches: Math.round(imageHeightInches * 100) / 100,
        quality: dpi >= 300 ? 'Excellent' : dpi >= 150 ? 'Good' : dpi >= 72 ? 'Fair' : 'Poor',
        recommendation: dpi >= 300 ? 'Perfect for printing' : 
                       dpi >= 150 ? 'Good for most banners' : 
                       dpi >= 72 ? 'Acceptable for large banners' : 
                       'Consider using a higher resolution image'
      }
    } catch (error) {
      console.error('Error calculating DPI:', error)
      return null
    }
  }

  // Get DPI info for selected element
  const getSelectedElementDPI = () => {
    if (selectedId) {
      const element = elements.find(el => el.id === selectedId)
      if (element && element.type === 'image') {
        return calculateDPI(element)
      }
    }
    return null
  }

  // Layer control functions
  const bringForward = useCallback(() => {
    if (!selectedId) return
    
    setElements(prev => {
      const newElements = [...prev]
      const currentIndex = newElements.findIndex(el => el.id === selectedId)
      
      if (currentIndex < newElements.length - 1) {
        // Swap with the element above
        [newElements[currentIndex], newElements[currentIndex + 1]] = 
        [newElements[currentIndex + 1], newElements[currentIndex]]
      }
      
      return newElements
    })
  }, [selectedId])

  const sendBack = useCallback(() => {
    if (!selectedId) return
    
    setElements(prev => {
      const newElements = [...prev]
      const currentIndex = newElements.findIndex(el => el.id === selectedId)
      
      if (currentIndex > 0) {
        // Swap with the element below
        [newElements[currentIndex], newElements[currentIndex - 1]] = 
        [newElements[currentIndex - 1], newElements[currentIndex]]
      }
      
      return newElements
    })
  }, [selectedId])

  const bringToFront = useCallback(() => {
    if (!selectedId) return
    
    setElements(prev => {
      const newElements = [...prev]
      const currentIndex = newElements.findIndex(el => el.id === selectedId)
      
      if (currentIndex !== -1 && currentIndex < newElements.length - 1) {
        // Move to the end (top layer)
        const element = newElements.splice(currentIndex, 1)[0]
        newElements.push(element)
      }
      
      return newElements
    })
  }, [selectedId])

  const sendToBack = useCallback(() => {
    if (!selectedId) return
    
    setElements(prev => {
      const newElements = [...prev]
      const currentIndex = newElements.findIndex(el => el.id === selectedId)
      
      if (currentIndex > 0) {
        // Move to the beginning (bottom layer)
        const element = newElements.splice(currentIndex, 1)[0]
        newElements.unshift(element)
      }
      
      return newElements
    })
  }, [selectedId])

  // Check if layer controls should be enabled
  const canBringForward = selectedId && elements.findIndex(el => el.id === selectedId) < elements.length - 1
  const canSendBack = selectedId && elements.findIndex(el => el.id === selectedId) > 0

  // Add element functions with proper bounds
  const addText = (text = 'Text', x = 100, y = 100) => {
    const newElement = createElementWithBounds('text', x, y, { text })
    setElements(prev => [...prev, newElement])
    setSelectedId(newElement.id)
    saveToHistory()
  }

  const addShape = (type, x = 100, y = 100) => {
    const newElement = createElementWithBounds(type, x, y)
    setElements(prev => [...prev, newElement])
    setSelectedId(newElement.id)
    saveToHistory()
  }

  const addIcon = (iconName, symbol = null, imagePath = null, x = 100, y = 100) => {
    // For icons, create a proper element that can be resized
    const newElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'icon', // Use a special 'icon' type
      x: x || 100,
      y: y || 100,
      width: 60,
      height: 60,
      iconName: iconName,
      symbol: symbol, // Store the symbol (emoji/unicode)
      imagePath: imagePath, // Store the image path if available
      fill: '#666666',
      stroke: '#000000',
      strokeWidth: 1,
      rotation: 0
    }
    setElements(prev => [...prev, newElement])
    setSelectedId(newElement.id)
    saveToHistory()
  }

  const addImage = (imageUrl, x = 100, y = 100) => {
    const newElement = createElementWithBounds('image', x, y, {
      image: imageUrl,
      width: 200,
      height: 200
    })
    setElements(prev => [...prev, newElement])
    setSelectedId(newElement.id)
    saveToHistory()
  }



  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 relative">
      
      {/* Top Toolbar - Mobile Responsive */}
      <div className="p-1 border-b border-white/20">
        <GlassPanel className="flex items-center justify-between gap-1">
          
          {/* Left Section - Zoom Controls */}
          <div className="zoom-controls flex items-center gap-1">
            {/* Desktop: Undo/Redo + Zoom */}
            <div className="hidden sm:flex items-center gap-1">
              <GlassButton onClick={undo} disabled={historyStep <= 0} className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <Undo2 className="w-3.5 h-3.5" />
            </GlassButton>
            
              <GlassButton onClick={redo} disabled={historyStep >= history.length - 1} className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <Redo2 className="w-3.5 h-3.5" />
            </GlassButton>
            
              <div className="w-px h-5 bg-white/20 mx-1" />
            </div>
            
            {/* Mobile & Desktop: Zoom Controls */}
            <GlassButton onClick={zoomOut} className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <ZoomOut className="w-3.5 h-3.5" />
            </GlassButton>
            
            <GlassButton onClick={resetZoom} className="px-2 py-1.5 text-xs min-w-[50px] min-h-[36px] flex items-center justify-center">
              {Math.round(scale * 100)}%
            </GlassButton>
            
            <GlassButton onClick={zoomIn} className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center">
              <ZoomIn className="w-3.5 h-3.5" />
            </GlassButton>
          </div>

          {/* Center Section - Canvas Info (Desktop Only) */}
          <div className="hidden sm:block text-center">
            <p className="text-sm text-gray-600">
              {canvasSize.width} × {canvasSize.height}px
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {canvasSize.width > canvasSize.height ? 'Landscape' : canvasSize.width < canvasSize.height ? 'Portrait' : 'Square'}
              </span>
            </p>
          </div>

          {/* Right Section - Action Buttons */}
          <div className="flex items-center gap-1">
            {/* Mobile: Clear, Save and Order buttons */}
            <div className="sm:hidden flex items-center gap-1">
              <GlassButton 
                onClick={onClearCanvas} 
                disabled={!hasElements}
                variant="danger" 
                className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
                title="Clear Canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </GlassButton>
              
              <GlassButton onClick={onSave} variant="success" className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center" title="Save Design">
                <Save className="w-3.5 h-3.5" />
              </GlassButton>
              
              <GlassButton onClick={onCreateOrder} variant="primary" className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center" title="Create Order">
                <ShoppingCart className="w-3.5 h-3.5" />
              </GlassButton>
            </div>
            
            {/* Desktop: Full controls */}
            <div className="hidden sm:flex items-center gap-1">
            <GlassButton 
              onClick={() => setShowGrid(!showGrid)} 
              variant={showGrid ? "primary" : "default"}
                className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center"
              title={showGrid ? "Hide Grid" : "Show Grid"}
            >
                <Grid3X3 className="w-3.5 h-3.5" />
            </GlassButton>
            
            <GlassButton 
              onClick={() => setShowGuides(!showGuides)} 
              variant={showGuides ? "primary" : "default"}
                className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center"
              title={showGuides ? "Hide Safe Zone" : "Show Safe Zone"}
            >
                {showGuides ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            </GlassButton>
            
              <div className="w-px h-5 bg-white/20 mx-1" />
            
              <GlassButton 
                onClick={onClearCanvas} 
                disabled={!hasElements}
                variant="danger" 
                className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed" 
                title="Clear Canvas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </GlassButton>
            
              <GlassButton onClick={onSave} variant="success" className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <Save className="w-3.5 h-3.5" />
            </GlassButton>
            
              <GlassButton onClick={onExport} variant="primary" className="p-1.5 min-w-[36px] min-h-[36px] flex items-center justify-center">
                <Download className="w-3.5 h-3.5" />
            </GlassButton>
            </div>
          </div>
          
        </GlassPanel>
      </div>

      {/* Canvas Area - Mobile Optimized */}
      <div className={`element-selection absolute top-16 sm:top-20 left-0 right-0 bottom-4 md:bottom-20 flex items-start justify-center p-1 sm:p-2 overflow-hidden transition-all duration-300 ease-in-out`}>
        <GlassPanel className="relative max-w-full max-h-full w-full h-full flex items-center justify-center">
          
          

          {/* Canvas - Mobile Responsive Scaling */}
          <div 
            className="relative rounded-xl overflow-hidden"
            style={{
              width: canvasSize.width * scale,
              height: canvasSize.height * scale,
              maxWidth: '100%',
              maxHeight: '70vh', // Prevent canvas from taking full height
              userSelect: 'none', // Prevent text selection
              transform: window.innerWidth < 768 ? 'translateY(-20px)' : 'none' // Move canvas content up slightly on mobile only
            }}
          >
            
            <Stage
              ref={stageRef}
              width={canvasSize.width}
              height={canvasSize.height}
              scale={{ x: scale, y: scale }}
              draggable={false}
              listening={true}

              onMouseDown={(e) => {
                const stage = e.target.getStage()
                
                // Only handle if clicking directly on the stage background (not on elements)
                if (e.target === stage) {
                  
                  // Clear selections when clicking on empty canvas
                  setSelectedId(null)
                  setSelectedIds([])
                  
                  // Start selection rectangle
                  const pos = stage.getPointerPosition()
                  if (pos) {
                    startSelection({
                      x: pos.x / scale,
                      y: pos.y / scale
                    })
                  }
                }
                // Don't interfere with element dragging - let elements handle their own events
              }}

              onMouseMove={(e) => {
                if (isSelecting) {
                  const stage = e.target.getStage()
                  const pos = stage.getPointerPosition()
                  if (pos) {
                    updateSelection({
                      x: pos.x / scale,
                      y: pos.y / scale
                    })
                  }
                }
              }}

              onMouseUp={() => {
                if (isSelecting) {
                  finishSelection()
                }
              }}

                              onClick={(e) => {
                  // Only deselect if clicking on the stage background, grid, or safe zone
                  const clickedOnEmpty = e.target === e.target.getStage() || 
                                       e.target.attrs.fill === backgroundColor ||
                                       e.target.attrs.fill === 'rgba(0,0,0,0.1)' ||
                                       e.target.attrs.stroke === '#dc2626' // Safe zone border
                  if (clickedOnEmpty && !isSelecting) {
                    setSelectedId(null)
                    setSelectedIds([])
                  }
                }}
                              onTap={(e) => {
                  // Same logic for touch events
                  const clickedOnEmpty = e.target === e.target.getStage() || 
                                       e.target.attrs.fill === backgroundColor ||
                                       e.target.attrs.fill === 'rgba(0,0,0,0.1)' ||
                                       e.target.attrs.stroke === '#dc2626' // Safe zone border
                  if (clickedOnEmpty && !isSelecting) {
                    setSelectedId(null)
                    setSelectedIds([])
                  }
                }}
            >
              <Layer>
                {/* Background */}
                <Rect
                  width={canvasSize.width}
                  height={canvasSize.height}
                  fill={backgroundColor}
                  onMouseDown={(e) => {
                    
                    // Clear selections when clicking on background
                    setSelectedId(null)
                    setSelectedIds([])
                    
                    // Start selection rectangle
                    const stage = e.target.getStage()
                    const pos = stage.getPointerPosition()
                    if (pos) {
                      startSelection({
                        x: pos.x / scale,
                        y: pos.y / scale
                      })
                    }
                  }}
                  onMouseMove={(e) => {
                    if (isSelecting) {
                      const stage = e.target.getStage()
                      const pos = stage.getPointerPosition()
                      if (pos) {
                        updateSelection({
                          x: pos.x / scale,
                          y: pos.y / scale
                        })
                      }
                    }
                  }}
                  onMouseUp={(e) => {
                    if (isSelecting) {
                      finishSelection()
                    }
                  }}
                />
                
                {/* Grid */}
                {showGrid && (
                  <>
                    {/* Vertical grid lines */}
                    {Array.from({ length: Math.floor(canvasSize.width / 50) + 1 }, (_, i) => (
                      <Rect
                        key={`v-grid-${i}`}
                        x={i * 50}
                        y={0}
                        width={1}
                        height={canvasSize.height}
                        fill="rgba(0,0,0,0.1)"
                        listening={false}
                      />
                    ))}
                    {/* Horizontal grid lines */}
                    {Array.from({ length: Math.floor(canvasSize.height / 50) + 1 }, (_, i) => (
                      <Rect
                        key={`h-grid-${i}`}
                        x={0}
                        y={i * 50}
                        width={canvasSize.width}
                        height={1}
                        fill="rgba(0,0,0,0.1)"
                        listening={false}
                      />
                    ))}
                  </>
                )}
                
                {/* Elements */}
                {elements.map(renderElement)}
                
                {/* Transformer */}
                <Transformer
                  ref={transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Ensure minimum size for all elements (same for all types)
                    const minSize = 10
                    
                        return {
                      ...newBox,
                      width: Math.max(minSize, newBox.width),
                      height: Math.max(minSize, newBox.height)
                    }
                  }}
                  enabledAnchors={['middle-left', 'middle-right', 'top-center', 'bottom-center', 'top-left', 'top-right', 'bottom-left', 'bottom-right']}
                  rotateEnabled={true}
                  keepRatio={false}
                  ignoreStroke={false}
                  useSingleNodeRotation={true}
                  shouldOverdrawWholeArea={false}
                  anchorSize={8}
                  anchorFill="#00a8ff"
                  anchorStroke="#0066cc"
                  anchorStrokeWidth={2}
                  borderStroke="#00a8ff"
                  borderStrokeWidth={2}
                />
                
                {/* Selection rectangle */}
                {selectionRect && (
                  <>
                    <Rect
                      x={Math.min(selectionRect.x, selectionRect.x + selectionRect.width)}
                      y={Math.min(selectionRect.y, selectionRect.y + selectionRect.height)}
                      width={Math.abs(selectionRect.width)}
                      height={Math.abs(selectionRect.height)}
                      fill="rgba(0, 123, 255, 0.2)"
                      stroke="#007bff"
                      strokeWidth={2}
                      dash={[5, 5]}
                      listening={false}
                    />
                    <Text
                      x={Math.min(selectionRect.x, selectionRect.x + selectionRect.width)}
                      y={Math.min(selectionRect.y, selectionRect.y + selectionRect.height) - 20}
                      text={`Selection: ${Math.round(Math.abs(selectionRect.width))}x${Math.round(Math.abs(selectionRect.height))}`}
                      fontSize={10}
                      fill="red"
                      listening={false}
                    />
                  </>
                )}

                {/* Safe Printing Zone - Dotted Red Border (On Top) */}
                {showGuides && (
                  <>
                    {/* Top border */}
                    <Line
                      points={[20, 20, canvasSize.width - 20, 20]}
                      stroke="#dc2626"
                      strokeWidth={2}
                      dash={[8, 4]}
                      lineCap="round"
                      listening={false}
                    />
                    {/* Right border */}
                    <Line
                      points={[canvasSize.width - 20, 20, canvasSize.width - 20, canvasSize.height - 20]}
                      stroke="#dc2626"
                      strokeWidth={2}
                      dash={[8, 4]}
                      lineCap="round"
                      listening={false}
                    />
                    {/* Bottom border */}
                    <Line
                      points={[canvasSize.width - 20, canvasSize.height - 20, 20, canvasSize.height - 20]}
                      stroke="#dc2626"
                      strokeWidth={2}
                      dash={[8, 4]}
                      lineCap="round"
                      listening={false}
                    />
                    {/* Left border */}
                    <Line
                      points={[20, canvasSize.height - 20, 20, 20]}
                      stroke="#dc2626"
                      strokeWidth={2}
                      dash={[8, 4]}
                      lineCap="round"
                      listening={false}
                    />
                    
                    {/* Corner indicators */}
                    <Circle
                      x={20}
                      y={20}
                      radius={3}
                      fill="#dc2626"
                      listening={false}
                    />
                    <Circle
                      x={canvasSize.width - 20}
                      y={20}
                      radius={3}
                      fill="#dc2626"
                      listening={false}
                    />
                    <Circle
                      x={canvasSize.width - 20}
                      y={canvasSize.height - 20}
                      radius={3}
                      fill="#dc2626"
                      listening={false}
                    />
                    <Circle
                      x={20}
                      y={canvasSize.height - 20}
                      radius={3}
                      fill="#dc2626"
                      listening={false}
                    />
                    
                    {/* Safe Zone Label */}
                    <Text
                      x={30}
                      y={canvasSize.height - 15}
                      text="Safe Printing Zone"
                      fontSize={12}
                      fontFamily="Arial"
                      fill="#dc2626"
                      listening={false}
                    />
                  </>
                )}

                {/* Grid - Rendered on Top for Alignment Reference */}
                {showGrid && (
                  <>
                    {Array.from({ length: Math.ceil(canvasSize.width / 50) }, (_, i) => (
                      <Rect
                        key={`grid-v-${i}`}
                        x={i * 50}
                        y={0}
                        width={1}
                        height={canvasSize.height}
                        fill="rgba(0,0,0,0.1)"
                        listening={false}
                      />
                    ))}
                    {Array.from({ length: Math.ceil(canvasSize.height / 50) }, (_, i) => (
                      <Rect
                        key={`grid-h-${i}`}
                        x={0}
                        y={i * 50}
                        width={canvasSize.width}
                        height={1}
                        fill="rgba(0,0,0,0.1)"
                        listening={false}
                      />
                    ))}
                  </>
                )}
              </Layer>
                        </Stage>

            {/* Konva Text Editor - following official documentation pattern */}
            {/* Removed complex text editing - using simple prompt approach instead */}
          </div>
          

          
        </GlassPanel>
      </div>

      {/* Status Bar - REMOVED TO ELIMINATE DUPLICATION */}
      {/* The bottom actions section below provides all the same functionality in a better organized way */}

      {/* Bottom Actions - Consolidated Interface */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 border-t border-white/20 
          bg-gradient-to-br from-gray-50/95 to-gray-100/95 backdrop-blur-md
        transform transition-transform duration-300 ease-in-out
          max-h-[30vh] sm:max-h-[35vh] overflow-y-auto
          shadow-2xl z-50
          ${(selectedId || selectedIds.length > 0) ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        <div className="flex flex-col gap-1.5 sm:gap-3 max-h-full p-1.5 sm:p-3">
          
                {/* Text Editing Hint */}
      {selectedId && selectedElement?.type === 'text' && (
        <div className="text-xs text-blue-600 bg-blue-50 p-1 sm:p-1.5 rounded text-center">
          💡 Use the Edit Text button below to edit text
            </div>
          )}
          
          {/* Top Row - DPI Info, Selection Count, and Close Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-1">
            {/* Close Button */}
            <GlassButton
              onClick={() => {
                // Hide the bottom actions by deselecting all elements
                setSelectedId(null);
                setSelectedIds([]);
              }}
              className="p-1 sm:p-1.5 rounded-full self-start sm:self-center"
              title="Hide element properties"
            >
              <EyeOff className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            </GlassButton>
            {/* DPI Information for Selected Image */}
            {selectedId && getSelectedElementDPI() && (
              <div className="flex items-center gap-1 p-1">
                <div className="text-xs sm:text-sm">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">DPI:</span>
                    <span className={`font-bold ${
                      getSelectedElementDPI().dpi >= 300 ? 'text-green-600' :
                      getSelectedElementDPI().dpi >= 150 ? 'text-yellow-600' :
                      getSelectedElementDPI().dpi >= 72 ? 'text-orange-600' : 'text-red-600'
                    }`}>
                      {getSelectedElementDPI().dpi}
                    </span>
                    <span className={`px-1 py-0.5 rounded text-xs font-medium ${
                      getSelectedElementDPI().quality === 'Excellent' ? 'bg-green-100 text-green-700' :
                      getSelectedElementDPI().quality === 'Good' ? 'bg-yellow-100 text-yellow-700' :
                      getSelectedElementDPI().quality === 'Fair' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {getSelectedElementDPI().quality}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {getSelectedElementDPI().originalWidth}×{getSelectedElementDPI().originalHeight}px
                    {' → '}
                    {getSelectedElementDPI().imageWidthInches}"×{getSelectedElementDPI().imageHeightInches}"
                  </div>
                  {getSelectedElementDPI().dpi < 150 && (
                    <div className="text-xs text-red-600 font-medium">
                      ⚠️ {getSelectedElementDPI().recommendation}
                    </div>
                  )}
                  {getSelectedElementDPI().dpi >= 150 && getSelectedElementDPI().dpi < 300 && (
                    <div className="text-xs text-yellow-600 font-medium">
                      ℹ️ {getSelectedElementDPI().recommendation}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {selectedIds.length > 0 && (
              <div className="text-xs sm:text-sm text-gray-600 font-medium">
                {selectedIds.length} elements selected
              </div>
            )}
          </div>
          
          {/* Middle Row - Text Properties */}
          {selectedId && selectedElement?.type === 'text' && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 p-2 sm:p-3 overflow-x-auto">
              {/* Text Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Color:</span>
                <input
                  type="color"
                  value={selectedElement?.fill || '#000000'}
                  onChange={(e) => handleElementChange(selectedId, { fill: e.target.value })}
                  className="w-8 h-8 rounded border-2 border-white/30 cursor-pointer"
                  title="Choose text color"
                />
                <span className="text-xs text-gray-500 font-mono min-w-[4rem]">
                  {selectedElement?.fill || '#000000'}
                </span>
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              
              {/* Font Size */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Size:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleElementChange(selectedId, { fontSize: Math.max(8, (selectedElement?.fontSize || 24) - 2) })}
                    className="w-6 h-6 bg-white/20 hover:bg-white/30 border border-white/30 rounded flex items-center justify-center text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="text-xs font-medium text-gray-700 min-w-[2rem] text-center">
                    {selectedElement?.fontSize || 24}
                  </span>
                  <button
                    onClick={() => handleElementChange(selectedId, { fontSize: Math.min(200, (selectedElement?.fontSize || 24) + 2) })}
                    className="w-6 h-6 bg-white/20 hover:bg-white/30 border border-white/30 rounded flex items-center justify-center text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              
              {/* Font Family */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Font:</span>
                <select
                  value={selectedElement?.fontFamily || 'Arial'}
                  onChange={(e) => handleElementChange(selectedId, { fontFamily: e.target.value })}
                  className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Impact">Impact</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                </select>
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              
              {/* Text Alignment */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Align:</span>
                <div className="flex gap-1">
                  {[
                    { value: 'left', icon: '⫷', label: 'Left' },
                    { value: 'center', icon: '⫸', label: 'Center' },
                    { value: 'right', icon: '⫹', label: 'Right' }
                  ].map((align) => (
                    <button
                      key={align.value}
                      onClick={() => handleElementChange(selectedId, { align: align.value })}
                      className={`w-6 h-6 rounded text-xs transition-colors duration-200 ${
                        (selectedElement?.align || 'left') === align.value
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title={align.label}
                    >
                      {align.icon}
                    </button>
                  ))}
                </div>
              </div>
              

            </div>
          )}

          {/* Middle Row - Shape Properties with Color Picker */}
          {selectedId && (
            (selectedElement?.type === 'rect' || 
             selectedElement?.type === 'circle' || 
             selectedElement?.type === 'star' || 
             selectedElement?.type === 'triangle' || 
             selectedElement?.type === 'hexagon' || 
             selectedElement?.type === 'octagon' ||
             selectedElement?.type === 'line' ||
             ['heart', 'diamond', 'arrow', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'double-arrow', 'cross', 'crown', 'badge', 'certificate', 'document', 'checkmark', 'target'].includes(selectedElement?.type)
            )
          ) && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-4 p-2 sm:p-3 overflow-x-auto">
              {/* Fill Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Fill:</span>
                <input
                  type="color"
                  value={selectedElement?.fill || '#6B7280'}
                  onChange={(e) => handleElementChange(selectedId, { fill: e.target.value })}
                  className="w-8 h-8 rounded border-2 border-white/30 cursor-pointer"
                  title="Choose fill color"
                />
                <span className="text-xs text-gray-500 font-mono min-w-[4rem]">
                  {selectedElement?.fill || '#6B7280'}
                </span>
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              
              {/* Stroke Color Picker */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Stroke:</span>
                <input
                  type="color"
                  value={selectedElement?.stroke || '#374151'}
                  onChange={(e) => handleElementChange(selectedId, { stroke: e.target.value })}
                  className="w-8 h-8 rounded border-2 border-white/30 cursor-pointer"
                  title="Choose stroke color"
                />
                <span className="text-xs text-gray-500 font-mono min-w-[4rem]">
                  {selectedElement?.stroke || '#374151'}
                </span>
              </div>
              
              {/* Divider */}
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              
              {/* Stroke Width */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-700 whitespace-nowrap">Width:</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleElementChange(selectedId, { strokeWidth: Math.max(0, (selectedElement?.strokeWidth || 2) - 1) })}
                    className="w-6 h-6 bg-white/20 hover:bg-white/30 border border-white/30 rounded flex items-center justify-center text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="text-xs font-medium text-gray-700 min-w-[1.5rem] text-center">
                    {selectedElement?.strokeWidth || 2}
                  </span>
                  <button
                    onClick={() => handleElementChange(selectedId, { strokeWidth: (selectedElement?.strokeWidth || 2) + 1 })}
                    className="w-6 h-6 bg-white/20 hover:bg-white/30 border border-white/30 rounded flex items-center justify-center text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Bottom Row - Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 w-full overflow-x-auto">
            {/* Layer Controls */}
            <div className="flex gap-1">
              <GlassButton 
                onClick={sendToBack} 
                disabled={!canSendBack}
                className="p-1 sm:p-1.5 min-w-[28px] sm:min-w-[32px] min-h-[28px] sm:min-h-[32px] flex items-center justify-center"
                title="Send to Back"
              >
                <SendToBack className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </GlassButton>
              
              <GlassButton 
                onClick={sendBack} 
                disabled={!canSendBack}
                className="p-1 sm:p-1.5 min-w-[28px] sm:min-w-[32px] min-h-[28px] sm:min-h-[32px] flex items-center justify-center"
                title="Send Back"
              >
                <MoveDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </GlassButton>
              
              <GlassButton 
                onClick={bringForward} 
                disabled={!canBringForward}
                className="p-1 sm:p-1.5 min-w-[28px] sm:min-w-[32px] min-h-[28px] sm:min-h-[32px] flex items-center justify-center"
                title="Bring Forward"
              >
                <MoveUp className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </GlassButton>
              
              <GlassButton 
                onClick={bringToFront} 
                disabled={!canBringForward}
                className="p-1 sm:p-1.5 min-w-[28px] sm:min-w-[32px] min-h-[28px] sm:min-h-[32px] flex items-center justify-center"
                title="Bring to Front"
              >
                <Layers className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </GlassButton>
            </div>
            
            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            
            {/* Text Edit Button */}
              {selectedId && selectedElement?.type === 'text' && (
                <GlassButton 
                  onClick={() => {
              
                  handleTextEdit(selectedId);
                  }}
                  variant="primary"
                  className="px-3 py-2 flex items-center justify-center"
                >
                <FileText className="w-4 h-4 mr-1" />
                  <span className="text-xs">Edit Text</span>
                </GlassButton>
              )}
              
            {/* Duplicate and Delete */}
            <div className="flex gap-1 sm:gap-1.5">
              <GlassButton onClick={duplicateSelected} className="px-1.5 sm:px-2 py-1 sm:py-1.5 flex items-center justify-center">
                <Copy className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-1" />
                <span className="text-xs">Duplicate</span>
              </GlassButton>
              
              <GlassButton onClick={deleteSelected} variant="danger" className="px-1.5 sm:px-2 py-1 sm:py-1.5 flex items-center justify-center">
                <Trash2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-1" />
                <span className="text-xs">Delete</span>
              </GlassButton>
            </div>
            
            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            
            {/* Undo/Redo */}
            <div className="flex gap-1">
              <GlassButton 
                onClick={undo} 
                disabled={historyStep <= 0}
                className="p-1 sm:p-1.5 min-w-[28px] sm:min-w-[32px] min-h-[28px] sm:min-h-[32px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                title="Undo"
              >
                <Undo className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </GlassButton>
              
              <GlassButton 
                onClick={redo} 
                disabled={historyStep >= history.length - 1}
                className="p-1 sm:p-1.5 min-w-[28px] sm:min-w-[32px] min-h-[28px] sm:min-h-[32px] flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                title="Redo"
              >
                <Redo className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </GlassButton>
            </div>
          </div>
        </div>
      </div>

      {/* Custom GlassUI Text Editing Modal */}
      {isEditingText && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <GlassPanel className="max-w-md w-full">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Edit Text</h3>
              <p className="text-sm text-gray-600">Modify your text content below</p>
            </div>
            
            <div className="mb-6">
              <textarea
                value={editingTextValue}
                onChange={(e) => setEditingTextValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleTextSave();
                  }
                  if (e.key === 'Escape') {
                    handleTextCancel();
                  }
                }}
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/80 backdrop-blur-sm"
                placeholder="Enter your text..."
                autoFocus
              />
            </div>
            
            <div className="flex gap-3">
              <GlassButton
                onClick={handleTextCancel}
                variant="default"
                className="flex-1 px-4 py-3"
              >
                Cancel
              </GlassButton>
              <GlassButton
                onClick={handleTextSave}
                variant="primary"
                className="flex-1 px-4 py-3"
              >
                Save Changes
              </GlassButton>
          </div>
        </GlassPanel>
      </div>
      )}

    </div>
  )
}

export default BannerCanvas
