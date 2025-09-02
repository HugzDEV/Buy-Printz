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
  SendToBack,
  MoveDown,
  MoveUp,
  Layers,
  Settings
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
  onCreateOrder
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
        const viewportWidth = window.innerWidth - 48 // Account for padding
        const viewportHeight = window.innerHeight - 320 // Account for header, toolbar, bottom actions, and safe area
        
        const scaleX = (viewportWidth * 0.85) / canvasSize.width // Use 85% of available width
        const scaleY = (viewportHeight * 0.85) / canvasSize.height // Use 85% of available height
        
        // Use the smaller scale to ensure canvas fits completely
        const newScale = Math.min(scaleX, scaleY, 1)
        setScale(Math.max(0.12, newScale)) // Minimum scale of 0.12 for mobile
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
  const [isStatusBarHidden, setIsStatusBarHidden] = useState(false)
  
  // Text editing state - moved to top to fix hoisting issue
  // Removed unused state variables - using simple prompt approach instead
  
  // Show status bar when element is selected
  useEffect(() => {
    if (selectedId || selectedIds.length > 0) {
      setIsStatusBarHidden(false)
    }
  }, [selectedId, selectedIds])

  // Keep status bar visible when text editing modal is open
  useEffect(() => {
    // Removed isEditingText dependency - no longer needed
  }, [])

  // Handle touch/click outside canvas to hide status bar - using Konva's container
  useEffect(() => {
    const handleOutsideInteraction = (e) => {
      // Removed isEditingText check - no longer needed

      // Check if the click is outside the canvas area
      const canvasContainer = stageRef.current?.container()
      if (canvasContainer && !canvasContainer.contains(e.target)) {
        // Check if click is outside the status bar area
        const statusBar = document.querySelector('[data-status-bar]')
        if (statusBar && !statusBar.contains(e.target)) {
          setIsStatusBarHidden(true)
        }
      }
    }

    // Add event listeners for both mouse and touch
    document.addEventListener('click', handleOutsideInteraction)
    document.addEventListener('touchstart', handleOutsideInteraction)
    
    return () => {
      document.removeEventListener('click', handleOutsideInteraction)
      document.removeEventListener('touchstart', handleOutsideInteraction)
    }
  }, []) // Removed isEditingText dependency

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

  // Text editing state for custom modal
  const [isEditingText, setIsEditingText] = useState(false);
  const [editingTextId, setEditingTextId] = useState(null);
  const [editingTextValue, setEditingTextValue] = useState('');

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
    console.log('Selecting element:', id, 'Type:', elements.find(el => el.id === id)?.type)
    setSelectedId(id)
    setSelectedIds([])
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

  const handleTransformEnd = (e, id) => {
    const node = e.target
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    
    const element = elements.find(el => el.id === id)
    if (!element) return

    // Reset scale to 1 to prevent double scaling
    node.scaleX(1)
    node.scaleY(1)
    
    const baseUpdate = {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation()
    }

    // Determine if this was a corner handle (proportional scaling) or center handle (stretching)
    // Corner handles: top-left, top-right, bottom-left, bottom-right
    // Center handles: top-center, middle-left, middle-right, bottom-center
    const isCornerHandle = Math.abs(scaleX - scaleY) < 0.1 // If scales are very similar, it's likely a corner handle
    
    // For corner handles, use uniform scaling (average of X and Y)
    // For center handles, allow independent X and Y scaling
    const uniformScale = (scaleX + scaleY) / 2

    // Handle different element types
    switch (element.type) {


      case 'rect':
      case 'image':
        // For rectangles and images
        if (isCornerHandle) {
          // Corner handles: proportional scaling
          handleElementChange(id, {
            ...baseUpdate,
            width: Math.max(10, (element.width || 100) * uniformScale),
            height: Math.max(10, (element.height || 100) * uniformScale)
          })
        } else {
          // Center handles: independent scaling (stretching)
          handleElementChange(id, {
            ...baseUpdate,
            width: Math.max(10, (element.width || 100) * scaleX),
            height: Math.max(10, (element.height || 100) * scaleY)
          })
        }
        break

      case 'circle':
        // For circles, always use uniform scaling to maintain circular shape
        handleElementChange(id, {
          ...baseUpdate,
          radius: Math.max(5, (element.radius || 50) * uniformScale)
        })
        break

      case 'star':
        // For stars, always use uniform scaling to maintain star shape
        handleElementChange(id, {
          ...baseUpdate,
          innerRadius: Math.max(5, (element.innerRadius || 30) * uniformScale),
          outerRadius: Math.max(10, (element.outerRadius || 50) * uniformScale)
        })
        break

      case 'triangle':
      case 'hexagon':
        // For regular polygons, always use uniform scaling to maintain shape
        handleElementChange(id, {
          ...baseUpdate,
          radius: Math.max(5, (element.radius || 50) * uniformScale)
        })
        break

      case 'line':
        // For line-based shapes (heart, diamond, arrow)
        if (element.points && Array.isArray(element.points)) {
          if (isCornerHandle) {
            // Corner handles: proportional scaling
            const scaledPoints = element.points.map((point, index) => {
              return index % 2 === 0 ? point * uniformScale : point * uniformScale
            })
            handleElementChange(id, {
              ...baseUpdate,
              points: scaledPoints
            })
          } else {
            // Center handles: independent scaling
            const scaledPoints = element.points.map((point, index) => {
              return index % 2 === 0 ? point * scaleX : point * scaleY
            })
            handleElementChange(id, {
              ...baseUpdate,
              points: scaledPoints
            })
          }
        }
        break

      default:
        // Fallback for other elements
        if (isCornerHandle) {
          handleElementChange(id, {
            ...baseUpdate,
            width: Math.max(5, (element.width || 100) * uniformScale),
            height: Math.max(5, (element.height || 100) * uniformScale)
          })
        } else {
          handleElementChange(id, {
            ...baseUpdate,
            width: Math.max(5, (element.width || 100) * scaleX),
            height: Math.max(5, (element.height || 100) * scaleY)
          })
        }
        break
    }

    // saveToHistory() // This was removed from dependencies, so it's no longer called here
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
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



  // Update transformer when selection or elements change
  useEffect(() => {
    const updateTransformer = () => {
      if (selectedIds.length > 0 && stageRef.current && transformerRef.current) {
        const selectedNodes = selectedIds.map(id => stageRef.current.findOne(`#${id}`)).filter(Boolean)
        if (selectedNodes.length > 0) {
          transformerRef.current.nodes(selectedNodes)
          transformerRef.current.getLayer()?.batchDraw()
        }
      } else if (selectedId && stageRef.current && transformerRef.current) {
        const selectedNode = stageRef.current.findOne(`#${selectedId}`)
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode])
          transformerRef.current.getLayer()?.batchDraw()
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
  }, [selectedId, selectedIds]) // Remove 'elements' from dependencies to prevent re-renders

  // Remove the TextEditor component since we're using vanilla DOM approach

  // Render elements
  const renderElement = (element) => {
    const commonProps = {
      id: element.id,
      x: element.x,
      y: element.y,
      draggable: true,
      onClick: (e) => {
        handleSelect(element.id)
      },
      onTap: (e) => {
        handleSelect(element.id)
      },
      onDragEnd: (e) => handleDragEnd(e, element.id),
      onTransformEnd: (e) => handleTransformEnd(e, element.id)
    }

    switch (element.type) {
      case 'text':
        return (
          <Text
            key={element.id}
            {...commonProps}
            text={element.text || 'Text'}
            fontSize={element.fontSize || 24}
            fontFamily={element.fontFamily || 'Arial'}
            fill={element.fill || '#000000'}
            align={element.align || 'left'}
            verticalAlign={element.verticalAlign || 'top'}
            width={element.width || 200}
            height={element.height || 50}
            padding={element.padding || 0}
            listening={true}
            onDblClick={() => {
              handleTextEdit(element.id);
            }}
            onDblTap={() => {
              handleTextEdit(element.id);
            }}
          />
        )
      
      case 'rect':
        return (
          <Rect
            key={element.id}
            {...commonProps}
            width={element.width}
            height={element.height}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation}
          />
        )
      
      case 'circle':
        return (
          <Circle
            key={element.id}
            {...commonProps}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation}
          />
        )
      
      case 'star':
        return (
          <Star
            key={element.id}
            {...commonProps}
            numPoints={element.numPoints || 5}
            innerRadius={element.innerRadius}
            outerRadius={element.outerRadius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation}
          />
        )
      
      case 'triangle':
      case 'hexagon':
        return (
          <RegularPolygon
            key={element.id}
            {...commonProps}
            sides={element.sides}
            radius={element.radius}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation}
          />
        )
      
      case 'line':
        return (
          <Line
            key={element.id}
            {...commonProps}
            points={element.points}
            closed={element.closed}
            fill={element.fill}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth}
            rotation={element.rotation}
            scaleX={element.scaleX}
            scaleY={element.scaleY}
          />
        )
      
      case 'image':
        return (
          <Image
            key={element.id}
            {...commonProps}
            image={element.image}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
          />
        )
      
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

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 relative">
      
      {/* Top Toolbar - Mobile Responsive */}
      <div className="p-2 sm:p-4 border-b border-white/20">
        <GlassPanel className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-0">
          
          {/* Left Controls - Mobile Stacked */}
          <div className="flex items-center gap-2 sm:gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <GlassButton onClick={undo} disabled={historyStep <= 0} className="p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Undo2 className="w-4 h-4 sm:w-4 sm:h-4" />
            </GlassButton>
            
            <GlassButton onClick={redo} disabled={historyStep >= history.length - 1} className="p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Redo2 className="w-4 h-4 sm:w-4 sm:h-4" />
            </GlassButton>
            
            <div className="w-px h-6 sm:h-6 bg-white/20 mx-1 sm:mx-2" />
            
            <GlassButton onClick={zoomOut} className="p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ZoomOut className="w-4 h-4 sm:w-4 sm:h-4" />
            </GlassButton>
            
            <GlassButton onClick={resetZoom} className="px-3 sm:px-3 py-2 sm:py-2 text-sm sm:text-sm min-w-[60px] min-h-[44px] flex items-center justify-center">
              {Math.round(scale * 100)}%
            </GlassButton>
            
            <GlassButton onClick={zoomIn} className="p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <ZoomIn className="w-4 h-4 sm:w-4 sm:h-4" />
            </GlassButton>
          </div>

          {/* Center Info - Mobile Hidden */}
          <div className="hidden sm:block text-center">
            <p className="text-sm text-gray-600">
              {canvasSize.width} × {canvasSize.height}px
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {canvasSize.width > canvasSize.height ? 'Landscape' : canvasSize.width < canvasSize.height ? 'Portrait' : 'Square'}
              </span>
            </p>
          </div>

          {/* Right Controls - Mobile Stacked */}
          <div className="flex items-center gap-2 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <GlassButton 
              onClick={() => setShowGrid(!showGrid)} 
              variant={showGrid ? "primary" : "default"}
              className="p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title={showGrid ? "Hide Grid" : "Show Grid"}
            >
              <Grid3X3 className="w-4 h-4 sm:w-4 sm:h-4" />
            </GlassButton>
            
            <GlassButton 
              onClick={() => setShowGuides(!showGuides)} 
              variant={showGuides ? "primary" : "default"}
              className="p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              title={showGuides ? "Hide Safe Zone" : "Show Safe Zone"}
            >
              {showGuides ? <Eye className="w-4 h-4 sm:w-4 sm:h-4" /> : <EyeOff className="w-4 h-4 sm:w-4 sm:h-4" />}
            </GlassButton>
            
            <div className="w-px h-6 sm:h-6 bg-white/20 mx-1 sm:mx-2" />
            
            <GlassButton onClick={onSave} variant="success" className="p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Save className="w-4 h-4 sm:w-4 sm:h-4" />
            </GlassButton>
            
            <GlassButton onClick={onExport} variant="primary" className="p-2 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center">
              <Download className="w-4 h-4 sm:w-4 sm:h-4" />
            </GlassButton>
          </div>
          
        </GlassPanel>
      </div>

      {/* Canvas Area - Mobile Optimized */}
      <div className={`flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden relative transition-all duration-300 ease-in-out ${
        selectedId || selectedIds.length > 0 ? 'pb-32 sm:pb-32' : 'pb-20 sm:pb-20'
      }`}>
        <GlassPanel className="relative max-w-full max-h-full w-full h-full flex items-center justify-center">
          
          

          {/* Canvas - Mobile Responsive Scaling */}
          <div 
            className="relative rounded-xl overflow-hidden"
            style={{
              width: canvasSize.width * scale,
              height: canvasSize.height * scale,
              maxWidth: '100%',
              maxHeight: '100%',
              userSelect: 'none' // Prevent text selection
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
                  keepRatio={false}
                  enabledAnchors={[
                    'top-left', 'top-center', 'top-right',
                    'middle-right', 'middle-left',
                    'bottom-left', 'bottom-center', 'bottom-right'
                  ]}
                  rotateEnabled={true}
                  borderEnabled={true}
                  borderStroke="#0066cc"
                  borderStrokeWidth={2}
                  anchorFill="#0066cc"
                  anchorStroke="#004499"
                  anchorStrokeWidth={1}
                  anchorSize={8}
                  visible={true}
                  // Show single bounding box for multiple selections
                  boundBoxFunc={(oldBox, newBox) => {
                    // For multiple selections, ensure we get a single bounding box
                    if (selectedIds.length > 1) {
                      // Calculate the bounding box of all selected elements
                      const selectedElements = elements.filter(el => selectedIds.includes(el.id))
                      if (selectedElements.length > 1) {
                        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
                        
                        selectedElements.forEach(element => {
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
                          
                          minX = Math.min(minX, elemX)
                          minY = Math.min(minY, elemY)
                          maxX = Math.max(maxX, elemX + elemWidth)
                          maxY = Math.max(maxY, elemY + elemHeight)
                        })
                        
                        // Return the calculated bounding box
                        return {
                          x: minX,
                          y: minY,
                          width: maxX - minX,
                          height: maxY - minY
                        }
                      }
                    }
                    
                    // For single selection or no selection, use default behavior
                    if (newBox.width < 5 || newBox.height < 5) {
                      return oldBox
                    }
                    return newBox
                  }}
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

      {/* Status Bar Toggle Button - Shows when status bar is hidden but elements are selected */}
      {(selectedId || selectedIds.length > 0) && isStatusBarHidden && (
        <div className="absolute bottom-4 right-4 z-50">
          <GlassButton
            onClick={() => setIsStatusBarHidden(false)}
            className="p-3 rounded-full shadow-lg"
            title="Show element properties"
          >
            <Settings className="w-5 h-5" />
          </GlassButton>
        </div>
      )}

      {/* Bottom Actions - Mobile Optimized */}
      <div className={`
        absolute bottom-0 left-0 right-0 p-2 sm:p-4 border-t border-white/20 
        bg-gradient-to-br from-gray-50 to-gray-100
        transform transition-transform duration-300 ease-in-out
        max-h-[40vh] overflow-y-auto
        ${(selectedId || selectedIds.length > 0) && !isStatusBarHidden ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <GlassPanel className="flex flex-col gap-3 sm:gap-4 max-h-full">
          
                {/* Text Editing Hint */}
      {selectedId && selectedElement?.type === 'text' && (
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded text-center">
          💡 Use the Edit Text button below to edit text
        </div>
      )}
          
          {/* Top Row - DPI Info, Selection Count, and Close Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            {/* Close Button */}
            <GlassButton
              onClick={() => setIsStatusBarHidden(true)}
              className="p-2 rounded-full self-start sm:self-center"
              title="Hide element properties"
            >
              <EyeOff className="w-4 h-4" />
            </GlassButton>
            {/* DPI Information for Selected Image */}
            {selectedId && getSelectedElementDPI() && (
              <div className="flex items-center gap-2 p-2 bg-white/20 rounded-lg border border-white/30">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 p-3 bg-white/20 rounded-lg border border-white/30 overflow-x-auto">
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
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 p-3 bg-white/20 rounded-lg border border-white/30 overflow-x-auto">
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
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 w-full overflow-x-auto">
            {/* Layer Controls */}
            <div className="flex gap-1">
              <GlassButton 
                onClick={sendToBack} 
                disabled={!canSendBack}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Send to Back"
              >
                <SendToBack className="w-4 h-4" />
              </GlassButton>
              
              <GlassButton 
                onClick={sendBack} 
                disabled={!canSendBack}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Send Back"
              >
                <MoveDown className="w-4 h-4" />
              </GlassButton>
              
              <GlassButton 
                onClick={bringForward} 
                disabled={!canBringForward}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Bring Forward"
              >
                <MoveUp className="w-4 h-4" />
              </GlassButton>
              
              <GlassButton 
                onClick={bringToFront} 
                disabled={!canBringForward}
                className="p-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                title="Bring to Front"
              >
                <Layers className="w-4 h-4" />
              </GlassButton>
            </div>
            
            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
            
            {/* Text Edit Button */}
            {selectedId && selectedElement?.type === 'text' && (
              <GlassButton 
                onClick={() => {
                  console.log('Edit Text button clicked for:', selectedId)
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
            <div className="flex gap-2">
              <GlassButton onClick={duplicateSelected} className="px-3 py-2 flex items-center justify-center">
                <Copy className="w-4 h-4 mr-1" />
                <span className="text-xs">Duplicate</span>
              </GlassButton>
              
              <GlassButton onClick={deleteSelected} variant="danger" className="px-3 py-2 flex items-center justify-center">
                <Trash2 className="w-4 h-4 mr-1" />
                <span className="text-xs">Delete</span>
              </GlassButton>
            </div>
            

          </div>
        </GlassPanel>
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
