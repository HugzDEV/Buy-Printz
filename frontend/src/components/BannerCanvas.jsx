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
  Clipboard
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
  const [history, setHistory] = useState([])
  const [historyStep, setHistoryStep] = useState(0)
  const [showGrid, setShowGrid] = useState(true)
  const [showGuides, setShowGuides] = useState(true)
  const [isSelecting, setIsSelecting] = useState(false)
  const [selectionRect, setSelectionRect] = useState(null)
  const [selectionStart, setSelectionStart] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])

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

  // Update transformer
  useEffect(() => {
    const updateTransformer = () => {
      if (selectedIds.length > 0 && stageRef.current && transformerRef.current) {
        const selectedNodes = selectedIds.map(id => stageRef.current.findOne(`#${id}`)).filter(Boolean)
        console.log('Multi-selection transformer update:', selectedNodes.length, 'nodes')
        if (selectedNodes.length > 0) {
          transformerRef.current.nodes(selectedNodes)
          transformerRef.current.getLayer()?.batchDraw()
        }
      } else if (selectedId && stageRef.current && transformerRef.current) {
        const selectedNode = stageRef.current.findOne(`#${selectedId}`)
        console.log('Single selection transformer update:', selectedNode ? 'found' : 'not found')
        if (selectedNode) {
          transformerRef.current.nodes([selectedNode])
          transformerRef.current.getLayer()?.batchDraw()
        }
      } else if (transformerRef.current) {
        console.log('Clearing transformer')
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
      onDragEnd: (e) => handleDragEnd(e, element.id),
      onTransformEnd: (e) => handleTransformEnd(e, element.id)
    }

    switch (element.type) {
      case 'text':
        return (
          <Text
            key={element.id}
            {...commonProps}
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
            onDblClick={() => {
              // Enable text editing on double click
              const newText = prompt('Edit text:', element.text)
              if (newText !== null && newText !== element.text) {
                handleElementChange(element.id, { text: newText })
              }
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

  return (
    <div className="flex-1 flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 relative">
      
      {/* Top Toolbar */}
      <div className="p-4 border-b border-white/20">
        <GlassPanel className="flex items-center justify-between">
          
          {/* Left Controls */}
          <div className="flex items-center gap-2">
            <GlassButton onClick={undo} disabled={historyStep <= 0} className="p-2">
              <Undo className="w-4 h-4" />
            </GlassButton>
            
            <GlassButton onClick={redo} disabled={historyStep >= history.length - 1} className="p-2">
              <Redo className="w-4 h-4" />
            </GlassButton>
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            <GlassButton onClick={zoomOut} className="p-2">
              <ZoomOut className="w-4 h-4" />
            </GlassButton>
            
            <GlassButton onClick={resetZoom} className="px-3 py-2 text-sm">
              {Math.round(scale * 100)}%
            </GlassButton>
            
            <GlassButton onClick={zoomIn} className="p-2">
              <ZoomIn className="w-4 h-4" />
            </GlassButton>
          </div>

          {/* Center Info */}
          <div className="text-center">
            <h3 className="font-semibold text-gray-800">Banner Editor</h3>
            <p className="text-sm text-gray-600">
              {canvasSize.width} × {canvasSize.height}px
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                {canvasSize.width > canvasSize.height ? 'Landscape' : canvasSize.width < canvasSize.height ? 'Portrait' : 'Square'}
              </span>
            </p>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <GlassButton 
              onClick={() => setShowGrid(!showGrid)} 
              variant={showGrid ? "primary" : "default"}
              className="p-2"
              title={showGrid ? "Hide Grid" : "Show Grid"}
            >
              <Grid className="w-4 h-4" />
            </GlassButton>
            
            <GlassButton 
              onClick={() => setShowGuides(!showGuides)} 
              variant={showGuides ? "primary" : "default"}
              className="p-2"
              title={showGuides ? "Hide Safe Zone" : "Show Safe Zone"}
            >
              {showGuides ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </GlassButton>
            
            <div className="w-px h-6 bg-white/20 mx-2" />
            
            <GlassButton onClick={onSave} variant="success" className="p-2">
              <Save className="w-4 h-4" />
            </GlassButton>
            
            <GlassButton onClick={onExport} variant="primary" className="p-2">
              <Download className="w-4 h-4" />
            </GlassButton>
          </div>
          
        </GlassPanel>
      </div>

      {/* Canvas Area */}
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden pb-20">
        <GlassPanel className="relative">
          
          {/* Canvas */}
          <div 
            className="relative rounded-xl overflow-hidden"
            style={{
              width: canvasSize.width * scale,
              height: canvasSize.height * scale
            }}
          >
            <Stage
              ref={stageRef}
              width={canvasSize.width}
              height={canvasSize.height}
              scale={{ x: scale, y: scale }}
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
          </div>
          

          
        </GlassPanel>
      </div>

      {/* Bottom Actions - Fixed Position with Smooth Transition */}
      <div className={`
        absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 
        bg-gradient-to-br from-gray-50 to-gray-100
        transform transition-transform duration-300 ease-in-out
        ${selectedId || selectedIds.length > 0 ? 'translate-y-0' : 'translate-y-full'}
      `}>
        <GlassPanel className="flex items-center justify-center gap-4">
          {selectedIds.length > 0 && (
            <div className="text-sm text-gray-600 font-medium">
              {selectedIds.length} elements selected
            </div>
          )}
          
          <GlassButton onClick={duplicateSelected} className="p-2">
            <Copy className="w-4 h-4" />
            <span className="text-sm">Duplicate</span>
          </GlassButton>
          
          <GlassButton onClick={deleteSelected} variant="danger" className="p-2">
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Delete</span>
          </GlassButton>
        </GlassPanel>
      </div>

    </div>
  )
}

export default BannerCanvas
