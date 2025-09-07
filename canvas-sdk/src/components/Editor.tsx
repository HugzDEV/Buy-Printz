import React, { useState, useCallback, useRef } from 'react';
import { CanvasEditor } from '../core/CanvasEditor';
import { Sidebar } from './Sidebar';
import { Element, CanvasData, CanvasSize, ProductType } from '../types';

interface EditorProps {
  productType: 'banner' | 'tin' | 'tent';
  canvasSize: CanvasSize;
  backgroundColor?: string;
  onSave?: (design: CanvasData) => void;
  onExport?: (design: CanvasData) => void;
  onElementSelect?: (element: Element) => void;
  onElementChange?: (element: Element) => void;
  readOnly?: boolean;
  showGrid?: boolean;
  showGuides?: boolean;
  templates?: any[];
  userTemplates?: any[];
  className?: string;
  style?: React.CSSProperties;
}

export const Editor: React.FC<EditorProps> = ({
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
  templates = [],
  userTemplates = [],
  className,
  style
}) => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [canvasData, setCanvasData] = useState<CanvasData>({
    elements: [],
    canvasSize,
    backgroundColor,
    selectedId: null,
    selectedIds: []
  });

  const canvasRef = useRef<any>(null);

  // Get selected element
  const selectedElement = elements.find(el => el.id === selectedId);

  // Handle element selection
  const handleElementSelect = useCallback((element: Element) => {
    setSelectedId(element.id);
    if (onElementSelect) {
      onElementSelect(element);
    }
  }, [onElementSelect]);

  // Handle element changes
  const handleElementChange = useCallback((element: Element) => {
    setElements(prev => prev.map(el => el.id === element.id ? element : el));
    if (onElementChange) {
      onElementChange(element);
    }
  }, [onElementChange]);

  // Add element
  const handleAddElement = useCallback((element: Omit<Element, 'id'>) => {
    const newElement: Element = {
      ...element,
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };

    setElements(prev => [...prev, newElement]);
    setSelectedId(newElement.id);
  }, []);

  // Update element
  const handleUpdateElement = useCallback((id: string, updates: Partial<Element>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  }, []);

  // Delete element
  const handleDeleteElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) {
      setSelectedId(null);
    }
  }, [selectedId]);

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    setElements([]);
    setSelectedId(null);
  }, []);

  // Load template
  const handleLoadTemplate = useCallback((template: any) => {
    if (template.canvasData && template.canvasData.elements) {
      setElements(template.canvasData.elements);
      setSelectedId(null);
    }
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string;
      handleAddElement({
        type: 'image',
        x: canvasSize.width / 2 - 100,
        y: canvasSize.height / 2 - 100,
        width: 200,
        height: 200,
        src: imageUrl,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        visible: true,
        draggable: true,
        selectable: true
      });
    };
    reader.readAsDataURL(file);
  }, [canvasSize, handleAddElement]);

  // Handle save
  const handleSave = useCallback(() => {
    const currentCanvasData: CanvasData = {
      elements,
      canvasSize,
      backgroundColor,
      selectedId,
      selectedIds: selectedId ? [selectedId] : []
    };

    setCanvasData(currentCanvasData);
    if (onSave) {
      onSave(currentCanvasData);
    }
  }, [elements, canvasSize, backgroundColor, selectedId, onSave]);

  // Handle export
  const handleExport = useCallback(() => {
    const currentCanvasData: CanvasData = {
      elements,
      canvasSize,
      backgroundColor,
      selectedId,
      selectedIds: selectedId ? [selectedId] : []
    };

    setCanvasData(currentCanvasData);
    if (onExport) {
      onExport(currentCanvasData);
    }
  }, [elements, canvasSize, backgroundColor, selectedId, onExport]);

  return (
    <div className={`flex h-full ${className}`} style={style}>
      {/* Sidebar */}
      <Sidebar
        productType={productType}
        canvasSize={canvasSize}
        selectedElement={selectedElement}
        onAddElement={handleAddElement}
        onUpdateElement={handleUpdateElement}
        onLoadTemplate={handleLoadTemplate}
        onImageUpload={handleImageUpload}
        onClearCanvas={handleClearCanvas}
        templates={templates}
        userTemplates={userTemplates}
      />

      {/* Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-semibold text-gray-900">
                {productType === 'banner' && 'Banner Editor'}
                {productType === 'tin' && 'Business Card Tin Editor'}
                {productType === 'tent' && 'Tradeshow Tent Editor'}
              </h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={handleExport}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-gray-100 p-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 inline-block">
            <CanvasEditor
              ref={canvasRef}
              productType={productType}
              canvasSize={canvasSize}
              backgroundColor={backgroundColor}
              onSave={handleSave}
              onExport={handleExport}
              onElementSelect={handleElementSelect}
              onElementChange={handleElementChange}
              readOnly={readOnly}
              showGrid={showGrid}
              showGuides={showGuides}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
