import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer, Circle, Star, Line, RegularPolygon } from 'react-konva'
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Save, 
  Undo, 
  Redo,
  Move,
  Eye,
  EyeOff,
  Grid,
  Trash2,
  Copy,
  Clipboard,
  MoveUp,
  MoveDown,
  Layers,
  SendToBack
} from 'lucide-react'

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

  // Mobile-responsive canvas scaling
  useEffect(() => {
    const updateCanvasScale = () => {
      const isMobile = window.innerWidth < 768
      
      if (isMobile) {
        // Mobile scaling - ensure canvas fits within viewport
        const viewportWidth = window.innerWidth - 32 // Account for padding
        const viewportHeight = window.innerHeight - 200 // Account for header, toolbar, and bottom actions
        
        const scaleX = viewportWidth / canvasSize.width
        const scaleY = viewportHeight / canvasSize.height
        
        // Use the smaller scale to ensure canvas fits completely
        const newScale = Math.min(scaleX, scaleY, 1)
        setScale(Math.max(0.2, newScale)) // Minimum scale of 0.2 for mobile
      } else {
        // Desktop scaling - maintain current behavior
        setScale(1.0)
      }
    }

    updateCanvasScale()
    window.addEventListener('resize', updateCanvasScale)
    return () => window.removeEventListener('resize', updateCanvasScale)
  }, [canvasSize, window.innerWidth, window.innerHeight])
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(0)
  const [showGrid, setShowGrid] = useState(true)
  const [showGuides, setShowGuides] = useState(true)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionRect, setSelectionRect] = useState(null)
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [lastClickTime, setLastClickTime] = useState(0)
  const [lastClickId, setLastClickId] = useState(null)
  
  // Text editing modal state
  const [isTextModalOpen, setIsTextModalOpen] = useState(false)
  const [editingTextId, setEditingTextId] = useState(null)
  const [editingTextValue, setEditingTextValue] = useState('')

  // Glass UI Components
  const GlassButton = ({ children, onClick, className = "", variant = "default", disabled = false }) => {
    const variants = {
      default: "bg-white/20 hover:bg-white/30 text-gray-700 border-white/30",
      primary: "bg-blue-500/20 hover:bg-blue-500/30 text-blue-700 border-blue-400/30",
      success: "bg-green-500/20 hover:bg-green-500/30 text-green-700 border-green-400/30",
      danger: "bg-red-500/20 hover:bg-red-500/30 text-red-700 border-red-400/30"
    }
    
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`
          ${variants[variant]}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
          backdrop-blur-sm
          border
          rounded-xl
          p-3
          font-medium
          transition-all duration-200
          flex items-center justify-center gap-2
          ${className}
        `}
      >
        {children}
      </button>
    )
  }

  const GlassPanel = ({ children, className = "" }) => (
    <div className={`
      backdrop-blur-xl bg-white/10 
      border border-white/20 
      rounded-2xl 
      shadow-[0_8px_32px_rgba(0,0,0,0.1)]
      p-4
      ${className}
    `}>
      {children}
    </div>
  )

  // Canvas utilities
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyStep + 1)
    newHistory.push({ elements: [...elements] })
    setHistory(newHistory)
    setHistoryStep(newHistory.length - 1)
  }, [elements, history, historyStep])

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
    console.log('Starting selection at:', pos)
    setIsSelecting(true)
    setSelectionStart(pos)
    setSelectionRect({
      x: pos.x,
      y: pos.y,
      width: 0,
      height: 0
    })
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
    console.log('Updating selection:', newRect, 'from start:', selectionStart, 'to current:', pos)
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
      console.log('Selection too small, ignoring')
      setIsSelecting(false)
      setSelectionRect(null)
      setSelectionStart(null)
      return
    }

    console.log('Finishing selection with rect:', selectionRect)
    console.log('Normalized rect:', normalizedRect)
    console.log('Available elements:', elements.length)

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
      
      if (intersects) {
        console.log('Element intersects:', element.id, element.type, { 
          elemX, elemY, elemWidth, elemHeight,
          rectX: normalizedRect.x, rectY: normalizedRect.y, rectWidth: normalizedRect.width, rectHeight: normalizedRect.height
        })
      }
      
      return intersects
    })

    console.log('Selected elements:', selectedElements.length)

    if (selectedElements.length > 1) {
      const ids = selectedElements.map(el => el.id)
      console.log('Setting multi-selection:', ids)
      setSelectedIds(ids)
      setSelectedId(null) // Clear single selection
    } else if (selectedElements.length === 1) {
      console.log('Setting single selection:', selectedElements[0].id)
      setSelectedId(selectedElements[0].id)
      setSelectedIds([])
    } else {
      console.log('No elements selected')
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
    // Don't select elements if we're in the middle of a selection
    if (isSelecting) {
      console.log('Ignoring element selection during selection process:', id)
      return
    }
    
    console.log('Element selected:', id)
    setSelectedId(id)
    setSelectedIds([])
  }

  const handleElementChange = (id, changes) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...changes } : el
    ))
  }

  // Manual double-click detection
  const handleTextClick = (elementId, elementText) => {
    const now = Date.now()
    const timeDiff = now - lastClickTime
    const isDoubleClick = timeDiff < 300 && lastClickId === elementId // 300ms threshold
    
    if (isDoubleClick) {
      setLastClickTime(0)
      setLastClickId(null)
      handleTextEdit(elementId, elementText)
    } else {
      setLastClickTime(now)
      setLastClickId(elementId)
    }
  }

  // Text editing modal functions
  const openTextModal = (elementId, currentText) => {
    setEditingTextId(elementId)
    const cleanText = currentText || ''
    setEditingTextValue(cleanText)
    setIsTextModalOpen(true)
  }

  const closeTextModal = () => {
    setIsTextModalOpen(false)
    setEditingTextId(null)
    setEditingTextValue('')
  }

  const saveTextEdit = () => {
    if (editingTextId && editingTextValue !== undefined) {
      handleElementChange(editingTextId, { text: editingTextValue })
    }
    closeTextModal()
  }

  const cancelTextEdit = () => {
    closeTextModal()
  }

  // Text editing trigger function
  const handleTextEdit = (elementId, currentText) => {
    openTextModal(elementId, currentText)
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
      case 'text':
        // For text elements, ensure minimum width for long words
        const newWidth = Math.max(50, node.width() * scaleX)
        const newHeight = Math.max(20, node.height() * scaleY)
        handleElementChange(id, {
          ...baseUpdate,
          width: newWidth,
          height: newHeight
        })
        break

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

    saveToHistory()
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      if (e.key === 'Delete' && selectedId) {
        deleteSelected()
      } else if (e.key === 'Enter' && selectedId) {
        // Trigger text editing when Enter is pressed on a selected text element
        const selectedElement = elements.find(el => el.id === selectedId)
        if (selectedElement && selectedElement.type === 'text') {
          handleTextEdit(selectedElement.id, selectedElement.text)
        }
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
  }, [selectedId])



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
  }, [selectedId, selectedIds, elements])

  // Render elements
  const renderElement = (element) => {
    const commonProps = {
      id: element.id,
      x: element.x,
      y: element.y,
      draggable: true,
      onClick: (e) => {
        // Only handle clicks if not selecting
        if (!isSelecting) {
          console.log('Element clicked:', element.id)
          handleSelect(element.id)
        }
      },
      onTap: (e) => {
        // Only handle taps if not selecting
        if (!isSelecting) {
          console.log('Element tapped:', element.id)
          handleSelect(element.id)
        }
      },
      onTouchStart: (e) => {
        // Handle touch start for mobile
        if (!isSelecting) {
          console.log('Element touch start:', element.id)
          handleSelect(element.id)
        }
      },
      onDragEnd: (e) => handleDragEnd(e, element.id),
      onTransformEnd: (e) => handleTransformEnd(e, element.id)
    }

    switch (element.type) {
      case 'text':
        return (
          <Text
            key={element.id}
            id={element.id}
            x={element.x}
            y={element.y}
            draggable={true}
            text={element.text}
            fontSize={element.fontSize}
            fontFamily={element.fontFamily}
            fill={element.fill}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
            wrap="none"
            ellipsis={false}
            align={element.align || 'left'}
            verticalAlign={element.verticalAlign || 'top'}
            lineHeight={element.lineHeight || 1.2}
            letterSpacing={element.letterSpacing || 0}
            padding={element.padding || 0}
            onClick={(e) => {
              // Only handle clicks if not selecting
              if (!isSelecting) {
                handleSelect(element.id)
              }
              
              // Handle manual double-click detection
              handleTextClick(element.id, element.text)
            }}
            onTap={(e) => {
              // Only handle taps if not selecting
              if (!isSelecting) {
                console.log('Text element tapped:', element.id)
                handleSelect(element.id)
              }
            }}
            onTouchStart={(e) => {
              // Handle touch start for mobile
              if (!isSelecting) {
                console.log('Text element touch start:', element.id)
                handleSelect(element.id)
              }
            }}
            onDragEnd={(e) => handleDragEnd(e, element.id)}
            onTransformEnd={(e) => handleTransformEnd(e, element.id)}
            onDblClick={(e) => {
              e.evt.preventDefault()
              e.evt.stopPropagation()
              handleTextEdit(element.id, element.text)
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
          <KonvaImage
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
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center sm:justify-start">
            <GlassButton onClick={undo} disabled={historyStep <= 0} className="p-1 sm:p-2">
              <Undo className="w-3 h-3 sm:w-4 sm:h-4" />
            </GlassButton>
            
            <GlassButton onClick={redo} disabled={historyStep >= history.length - 1} className="p-1 sm:p-2">
              <Redo className="w-3 h-3 sm:w-4 sm:h-4" />
            </GlassButton>
            
            <div className="w-px h-4 sm:h-6 bg-white/20 mx-1 sm:mx-2" />
            
            <GlassButton onClick={zoomOut} className="p-1 sm:p-2">
              <ZoomOut className="w-3 h-3 sm:w-4 sm:h-4" />
            </GlassButton>
            
            <GlassButton onClick={resetZoom} className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm">
              {Math.round(scale * 100)}%
            </GlassButton>
            
            <GlassButton onClick={zoomIn} className="p-1 sm:p-2">
              <ZoomIn className="w-3 h-3 sm:w-4 sm:h-4" />
            </GlassButton>
          </div>

          {/* Center Info - Mobile Hidden */}
          <div className="hidden sm:block text-center">
            <h3 className="font-semibold text-gray-800">Banner Editor</h3>
            <p className="text-sm text-gray-600">
              {canvasSize.width} × {canvasSize.height}px
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {canvasSize.width > canvasSize.height ? 'Landscape' : canvasSize.width < canvasSize.height ? 'Portrait' : 'Square'}
              </span>
            </p>
          </div>

          {/* Right Controls - Mobile Stacked */}
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-center sm:justify-end">
            <GlassButton 
              onClick={() => setShowGrid(!showGrid)} 
              variant={showGrid ? "primary" : "default"}
              className="p-1 sm:p-2"
              title={showGrid ? "Hide Grid" : "Show Grid"}
            >
              <Grid className="w-3 h-3 sm:w-4 sm:h-4" />
            </GlassButton>
            
            <GlassButton 
              onClick={() => setShowGuides(!showGuides)} 
              variant={showGuides ? "primary" : "default"}
              className="p-1 sm:p-2"
              title={showGuides ? "Hide Safe Zone" : "Show Safe Zone"}
            >
              {showGuides ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
            </GlassButton>
            
            <div className="w-px h-4 sm:h-6 bg-white/20 mx-1 sm:mx-2" />
            
            <GlassButton onClick={onSave} variant="success" className="p-1 sm:p-2">
              <Save className="w-3 h-3 sm:w-4 sm:h-4" />
            </GlassButton>
            
            <GlassButton onClick={onExport} variant="primary" className="p-1 sm:p-2">
              <Download className="w-3 h-3 sm:w-4 sm:h-4" />
            </GlassButton>
          </div>
          
        </GlassPanel>
      </div>

      {/* Canvas Area - Mobile Optimized */}
      <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-hidden pb-16 sm:pb-20">
        <GlassPanel className="relative max-w-full max-h-full">
          
          

          {/* Canvas - Mobile Responsive Scaling */}
          <div 
            className="relative rounded-xl overflow-hidden"
            style={{
              width: canvasSize.width * scale,
              height: canvasSize.height * scale,
              maxWidth: '100%',
              maxHeight: '100%'
            }}
          >
            <Stage
              ref={stageRef}
              width={canvasSize.width}
              height={canvasSize.height}
              scale={{ x: scale, y: scale }}
              draggable={true}
              onTouchMove={(e) => {
                // Handle touch move for mobile dragging
                const stage = e.target.getStage()
                const pos = stage.getPointerPosition()
                
                if (pos && isSelecting) {
                  updateSelection({
                    x: pos.x / scale,
                    y: pos.y / scale
                  })
                }
              }}
              onTouchEnd={(e) => {
                // Handle touch end for mobile
                if (isSelecting) {
                  finishSelection()
                }
              }}
              onMouseDown={(e) => {
                const stage = e.target.getStage()
                console.log('Stage mouse down on:', e.target, 'target === stage:', e.target === stage)
                
                // Check if clicking on stage background, grid, or safe zone
                const isElement = elements.some(el => el.id === e.target.attrs.id)
                const clickedOnEmpty = !isElement && (
                  e.target === stage || 
                  e.target.attrs.fill === backgroundColor ||
                  e.target.attrs.fill === 'rgba(0,0,0,0.1)' ||
                  e.target.attrs.stroke === '#dc2626' // Safe zone border
                )
                
                console.log('Clicked on empty:', clickedOnEmpty, 'target fill:', e.target.attrs.fill)
                
                if (clickedOnEmpty) {
                  // Prevent event from bubbling to elements
                  e.evt.preventDefault()
                  e.evt.stopPropagation()
                  
                  // Clear selections when clicking on empty canvas
                  setSelectedId(null)
                  setSelectedIds([])
                  
                  // Start selection rectangle
                  const pos = stage.getPointerPosition()
                  console.log('Stage pointer position:', pos, 'scale:', scale)
                  if (pos) {
                    startSelection({
                      x: pos.x / scale,
                      y: pos.y / scale
                    })
                  }
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
                    console.log('Background rect clicked')
                    
                    // Prevent event from bubbling to elements
                    e.evt.preventDefault()
                    e.evt.stopPropagation()
                    
                    // Clear selections when clicking on background
                    setSelectedId(null)
                    setSelectedIds([])
                    
                    // Start selection rectangle
                    const stage = e.target.getStage()
                    const pos = stage.getPointerPosition()
                    console.log('Background click - Pointer position:', pos, 'scale:', scale)
                    if (pos) {
                      startSelection({
                        x: pos.x / scale,
                        y: pos.y / scale
                      })
                    }
                  }}
                  onTouchStart={(e) => {
                    console.log('Background rect touched')
                    
                    // Prevent event from bubbling to elements
                    e.evt.preventDefault()
                    e.evt.stopPropagation()
                    
                    // Clear selections when touching background
                    setSelectedId(null)
                    setSelectedIds([])
                    
                    // Start selection rectangle
                    const stage = e.target.getStage()
                    const pos = stage.getPointerPosition()
                    console.log('Background touch - Pointer position:', pos, 'scale:', scale)
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
                  onTouchMove={(e) => {
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
                  onTouchEnd={(e) => {
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

            {/* Text Editing Modal */}
            {isTextModalOpen && (
              <div 
                className="fixed inset-0 flex items-center justify-center z-50"
                style={{
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(4px)'
                }}
                onClick={(e) => {
                  // Close modal when clicking backdrop
                  if (e.target === e.currentTarget) {
                    cancelTextEdit()
                  }
                }}
              >
                <div 
                  className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4 border border-gray-200"
                  style={{ direction: 'ltr', textAlign: 'left' }}
                  onClick={(e) => {
                    // Prevent closing when clicking inside the modal
                    e.stopPropagation()
                  }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Edit Text</h3>
                    <button
                      onClick={cancelTextEdit}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    value={editingTextValue}
                    onChange={(e) => setEditingTextValue(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your text here..."
                    autoFocus
                    dir="ltr"
                    style={{ 
                      direction: 'ltr', 
                      textAlign: 'left',
                      unicodeBidi: 'normal',
                      textDirection: 'ltr',
                      writingMode: 'horizontal-tb',
                      textOrientation: 'mixed'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        saveTextEdit()
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault()
                        cancelTextEdit()
                      }
                    }}
                  />
                  
                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={saveTextEdit}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelTextEdit}
                      className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-2 text-center">
                    Press Enter to save, Esc to cancel
                  </div>
                </div>
              </div>
            )}
 
          </div>
          

          
        </GlassPanel>
      </div>

      {/* Bottom Actions - Mobile Optimized */}
      <div className={`
        absolute bottom-0 left-0 right-0 p-2 sm:p-4 border-t border-white/20 
        bg-gradient-to-br from-gray-50 to-gray-100
        transform transition-transform duration-300 ease-in-out
        ${selectedId || selectedIds.length > 0 ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <GlassPanel className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
          
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
          
          <div className="flex gap-2 sm:gap-4 w-full sm:w-auto justify-center">
            {/* Layer Controls */}
            <div className="flex gap-1 sm:gap-2">
              <GlassButton 
                onClick={sendToBack} 
                disabled={!canSendBack}
                className="p-2 sm:p-3"
                title="Send to Back"
              >
                <SendToBack className="w-4 h-4 sm:w-5 sm:h-5" />
              </GlassButton>
              
              <GlassButton 
                onClick={sendBack} 
                disabled={!canSendBack}
                className="p-2 sm:p-3"
                title="Send Back"
              >
                <MoveDown className="w-4 h-4 sm:w-5 sm:h-5" />
              </GlassButton>
              
              <GlassButton 
                onClick={bringForward} 
                disabled={!canBringForward}
                className="p-2 sm:p-3"
                title="Bring Forward"
              >
                <MoveUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </GlassButton>
              
              <GlassButton 
                onClick={bringToFront} 
                disabled={!canBringForward}
                className="p-2 sm:p-3"
                title="Bring to Front"
              >
                <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
              </GlassButton>
            </div>
            
            {/* Divider */}
            <div className="w-px h-8 bg-gray-300 mx-1 sm:mx-2"></div>
            
            {/* Duplicate and Delete */}
            <GlassButton onClick={duplicateSelected} className="flex-1 sm:flex-none p-2 sm:p-3">
              <Copy className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm ml-1 sm:ml-2">Duplicate</span>
            </GlassButton>
            
            <GlassButton onClick={deleteSelected} variant="danger" className="flex-1 sm:flex-none p-2 sm:p-3">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm ml-1 sm:ml-2">Delete</span>
            </GlassButton>
          </div>
        </GlassPanel>
      </div>

    </div>
  )
}

export default BannerCanvas
