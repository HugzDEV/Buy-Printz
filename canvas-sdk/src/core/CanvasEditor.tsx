import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { Stage, Layer, Rect, Text, Image, Circle, Line, Star, RegularPolygon, Transformer } from 'react-konva';
import Konva from 'konva';
import { 
  CanvasEditorConfig, 
  CanvasData, 
  Element, 
  CanvasSize, 
  Position 
} from '../types';

// Enable text rendering fix for better text display
Konva._fixTextRendering = true;

// Enable all events on Konva, even when dragging a node
// This is required for proper touch handling on mobile devices
Konva.hitOnDragEnabled = true;

// Enable touch event capture for better mobile support
Konva.captureTouchEventsEnabled = true;

interface CanvasEditorProps extends CanvasEditorConfig {
  className?: string;
  style?: React.CSSProperties;
}

export const CanvasEditor: React.FC<CanvasEditorProps> = ({
  productType,
  canvasSize,
  backgroundColor = '#ffffff',
  onSave,
  onExport,
  onElementSelect,
  onElementChange,
  readOnly = false,
  showGrid = true,
  showGuides = true,
  className,
  style
}) => {
  const [canvasData, setCanvasData] = useState<CanvasData>({
    elements: [],
    canvasSize,
    backgroundColor,
    selectedId: undefined,
    selectedIds: []
  });

  const [history, setHistory] = useState<CanvasData[]>([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });
  const [autoScaling, setAutoScaling] = useState(true);
  
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);

  // Save to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push({ ...canvasData });
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [canvasData, history, historyStep]);

  // Add element
  const addElement = useCallback((element: Omit<Element, 'id'>) => {
    const newElement: Element = {
      ...element,
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setCanvasData(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
      selectedId: newElement.id,
      selectedIds: [newElement.id]
    }));

    saveToHistory();
  }, [saveToHistory]);

  // Update element
  const updateElement = useCallback((id: string, updates: Partial<Element>) => {
    setCanvasData(prev => ({
      ...prev,
      elements: prev.elements.map(el => 
        el.id === id ? { ...el, ...updates } : el
      )
    }));

    saveToHistory();
  }, [saveToHistory]);

  // Delete element
  const deleteElement = useCallback((id: string) => {
    setCanvasData(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id),
      selectedId: prev.selectedId === id ? undefined : prev.selectedId,
      selectedIds: prev.selectedIds?.filter(selectedId => selectedId !== id) || []
    }));

    saveToHistory();
  }, [saveToHistory]);

  // Select element
  const selectElement = useCallback((id: string) => {
    setCanvasData(prev => ({
      ...prev,
      selectedId: id,
      selectedIds: [id]
    }));

    const element = canvasData.elements.find(el => el.id === id);
    if (element && onElementSelect) {
      onElementSelect(element);
    }
  }, [canvasData.elements, onElementSelect]);

  // Clear selection
  const clearSelection = useCallback(() => {
    setCanvasData(prev => ({
      ...prev,
      selectedId: undefined,
      selectedIds: []
    }));
  }, []);

  // Handle stage click
  const handleStageClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      clearSelection();
    }
  }, [clearSelection]);

  // Handle element click
  const handleElementClick = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true;
    const id = e.target.id();
    selectElement(id);
  }, [selectElement]);

  // Handle element drag end
  const handleElementDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const id = e.target.id();
    const newPos = e.target.position();
    
    updateElement(id, {
      x: newPos.x,
      y: newPos.y
    });
  }, [updateElement]);

  // Handle element transform end with auto-scaling support
  const handleElementTransformEnd = useCallback((e: Konva.KonvaEventObject<Event>) => {
    const node = e.target;
    const id = node.id();
    
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and update dimensions
    node.scaleX(1);
    node.scaleY(1);
    
    const element = canvasData.elements.find(el => el.id === id);
    if (!element) return;

    let updates: Partial<Element> = {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      rotation: node.rotation()
    };

    // Handle different element types
    if (element.type === 'text') {
      // For text, preserve auto height in auto-scaling mode
      if (autoScaling) {
        updates.height = 'auto';
      } else {
        updates.height = Math.max(5, node.height() * scaleY);
      }
    } else if (element.type === 'star') {
      // For stars, scale both inner and outer radius proportionally
      const currentInnerRadius = element.innerRadius || 30;
      const currentOuterRadius = element.outerRadius || 50;
      const scaleFactor = Math.min(scaleX, scaleY); // Use uniform scaling
      
      updates.innerRadius = Math.max(5, currentInnerRadius * scaleFactor);
      updates.outerRadius = Math.max(10, currentOuterRadius * scaleFactor);
    } else {
      // For other shapes, scale normally
      updates.height = Math.max(5, node.height() * scaleY);
    }
    
    updateElement(id, updates);
  }, [updateElement, canvasData.elements, autoScaling]);

  // Render element with proper Konva properties
  const renderElement = useCallback((element: Element) => {
    const commonProps = {
      id: element.id,
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
      rotation: element.rotation,
      scaleX: element.scaleX,
      scaleY: element.scaleY,
      opacity: element.opacity,
      visible: element.visible,
      draggable: !readOnly && element.draggable,
      onClick: handleElementClick,
      onDragEnd: handleElementDragEnd,
      onTransformEnd: handleElementTransformEnd
    };

    switch (element.type) {
      case 'text':
        return (
          <Text
            {...commonProps}
            text={element.text || 'Text'}
            fontSize={element.fontSize || 24}
            fontFamily={element.fontFamily || 'Arial'}
            fontStyle={element.fontStyle || 'normal'}
            textDecoration={element.textDecoration || 'none'}
            fill={element.fill || '#000000'}
            stroke={element.stroke}
            strokeWidth={element.strokeWidth || 0}
            align={element.align || 'left'}
            verticalAlign={element.verticalAlign || 'top'}
            lineHeight={element.lineHeight || 1.2}
            letterSpacing={element.letterSpacing || 0}
            padding={element.padding || 0}
            wrap={element.wrap || 'word'}
            height={element.height === 'auto' ? 'auto' : element.height}
          />
        );

      case 'rect':
        return (
          <Rect
            {...commonProps}
            fill={element.fillColor || '#000000'}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth || 0}
            cornerRadius={element.cornerRadius || 0}
          />
        );

      case 'circle':
        return (
          <Circle
            {...commonProps}
            radius={element.width / 2}
            fill={element.fillColor || '#000000'}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth || 0}
          />
        );

      case 'star':
        return (
          <Star
            {...commonProps}
            innerRadius={element.innerRadius || 30}
            outerRadius={element.outerRadius || 50}
            numPoints={element.numPoints || 5}
            fill={element.fillColor || '#000000'}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth || 0}
            strokeScaleEnabled={false} // Prevent star distortion during scaling
          />
        );

      case 'line':
        return (
          <Line
            {...commonProps}
            points={element.points || [0, 0, 100, 0]}
            stroke={element.strokeColor || '#000000'}
            strokeWidth={element.strokeWidth || 2}
          />
        );

      case 'polygon':
        return (
          <RegularPolygon
            {...commonProps}
            sides={element.sides || 6}
            radius={element.radius || 50}
            fill={element.fillColor || '#000000'}
            stroke={element.strokeColor}
            strokeWidth={element.strokeWidth || 0}
          />
        );

      case 'image':
        return (
          <Image
            {...commonProps}
            image={element.src ? new Image() : undefined}
          />
        );

      default:
        return null;
    }
  }, [handleElementClick, handleElementDragEnd, handleElementTransformEnd, readOnly]);

  // Export canvas
  const exportCanvas = useCallback((format: 'png' | 'jpg' | 'pdf' | 'svg' = 'png') => {
    if (!stageRef.current) return;

    const dataURL = stageRef.current.toDataURL({
      mimeType: `image/${format}`,
      quality: 1
    });

    if (onExport) {
      onExport(canvasData);
    }

    return dataURL;
  }, [canvasData, onExport]);

  // Save canvas
  const saveCanvas = useCallback(() => {
    if (onSave) {
      onSave(canvasData);
    }
  }, [canvasData, onSave]);

  // Undo/Redo
  const undo = useCallback(() => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setCanvasData(history[historyStep - 1]);
    }
  }, [historyStep, history]);

  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setCanvasData(history[historyStep + 1]);
    }
  }, [historyStep, history]);

  // Update transformer when selection changes
  useEffect(() => {
    if (!transformerRef.current || !stageRef.current) return;

    const transformer = transformerRef.current;
    const stage = stageRef.current;
    
    if (canvasData.selectedId) {
      const selectedNode = stage.findOne(`#${canvasData.selectedId}`);
      if (selectedNode) {
        transformer.nodes([selectedNode]);
        transformer.getLayer()?.batchDraw();
      }
    } else {
      transformer.nodes([]);
      transformer.getLayer()?.batchDraw();
    }
  }, [canvasData.selectedId]);

  // Expose methods via ref
  useEffect(() => {
    if (stageRef.current) {
      (stageRef.current as any).addElement = addElement;
      (stageRef.current as any).updateElement = updateElement;
      (stageRef.current as any).deleteElement = deleteElement;
      (stageRef.current as any).selectElement = selectElement;
      (stageRef.current as any).clearSelection = clearSelection;
      (stageRef.current as any).exportCanvas = exportCanvas;
      (stageRef.current as any).saveCanvas = saveCanvas;
      (stageRef.current as any).undo = undo;
      (stageRef.current as any).redo = redo;
    }
  }, [addElement, updateElement, deleteElement, selectElement, clearSelection, exportCanvas, saveCanvas, undo, redo]);

  return (
    <div className={className} style={style}>
      <Stage
        ref={stageRef}
        width={canvasSize.width}
        height={canvasSize.height}
        onClick={handleStageClick}
        scaleX={scale}
        scaleY={scale}
        x={stagePos.x}
        y={stagePos.y}
      >
        <Layer>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={canvasSize.width}
            height={canvasSize.height}
            fill={backgroundColor}
            listening={false}
          />

          {/* Grid */}
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

          {/* Elements */}
          {canvasData.elements.map(renderElement)}

          {/* Transformer for selected element */}
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              // Limit resize
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
            ignoreStroke={true}
          />
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasEditor;
