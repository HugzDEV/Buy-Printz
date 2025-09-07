import React, { useState, useCallback, useRef, useEffect } from 'react';
import { 
  Square, 
  Circle, 
  Star, 
  Triangle,
  FileText,
  QrCode,
  Upload,
  Palette,
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Element, ProductType, CanvasSize } from '../types';

interface SidebarProps {
  productType: 'banner' | 'tin' | 'tent';
  canvasSize: CanvasSize;
  selectedElement: Element | null;
  onAddElement: (element: Omit<Element, 'id'>) => void;
  onUpdateElement: (id: string, updates: Partial<Element>) => void;
  onLoadTemplate: (template: any) => void;
  onImageUpload: (file: File) => void;
  onClearCanvas: () => void;
  templates?: any[];
  userTemplates?: any[];
  className?: string;
  style?: React.CSSProperties;
}

export const Sidebar: React.FC<SidebarProps> = ({
  productType,
  canvasSize,
  selectedElement,
  onAddElement,
  onUpdateElement,
  onLoadTemplate,
  onImageUpload,
  onClearCanvas,
  templates = [],
  userTemplates = [],
  className,
  style
}) => {
  const [expandedSections, setExpandedSections] = useState({
    specifications: false,
    shapes: false,
    text: false,
    qrcode: false,
    templates: false,
    assets: false,
    upload: false
  });

  const [textInput, setTextInput] = useState('');
  const [qrText, setQrText] = useState('');
  const [qrColor, setQrColor] = useState('#000000');
  const [qrBackgroundColor, setQrBackgroundColor] = useState('#ffffff');

  // Toggle section expansion
  const toggleSection = useCallback((section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Add text element
  const handleAddText = useCallback(() => {
    if (!textInput.trim()) return;

    onAddElement({
      type: 'text',
      x: canvasSize.width / 2 - 100,
      y: canvasSize.height / 2 - 20,
      width: 200,
      height: 'auto',
      text: textInput,
      fontSize: 24,
      fontFamily: 'Arial',
      fontStyle: 'normal',
      textDecoration: 'none',
      fill: '#000000',
      stroke: null,
      strokeWidth: 0,
      align: 'center',
      verticalAlign: 'middle',
      lineHeight: 1.2,
      letterSpacing: 0,
      padding: 0,
      wrap: 'word',
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      draggable: true,
      selectable: true
    });

    setTextInput('');
  }, [textInput, canvasSize, onAddElement]);

  // Add shape element
  const handleAddShape = useCallback((type: 'rect' | 'circle' | 'star' | 'polygon') => {
    const baseProps = {
      x: canvasSize.width / 2 - 50,
      y: canvasSize.height / 2 - 50,
      width: 100,
      height: 100,
      fillColor: '#000000',
      strokeColor: null,
      strokeWidth: 0,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
      opacity: 1,
      visible: true,
      draggable: true,
      selectable: true
    };

    switch (type) {
      case 'rect':
        onAddElement({
          ...baseProps,
          type: 'rect',
          cornerRadius: 0
        });
        break;
      case 'circle':
        onAddElement({
          ...baseProps,
          type: 'circle'
        });
        break;
      case 'star':
        onAddElement({
          ...baseProps,
          type: 'star',
          innerRadius: 30,
          outerRadius: 50,
          numPoints: 5
        });
        break;
      case 'polygon':
        onAddElement({
          ...baseProps,
          type: 'polygon',
          sides: 6,
          radius: 50
        });
        break;
    }
  }, [canvasSize, onAddElement]);

  // Handle text property changes
  const handleTextPropertyChange = useCallback((property: string, value: any) => {
    if (!selectedElement || selectedElement.type !== 'text') return;
    onUpdateElement(selectedElement.id, { [property]: value });
  }, [selectedElement, onUpdateElement]);

  // Handle shape property changes
  const handleShapePropertyChange = useCallback((property: string, value: any) => {
    if (!selectedElement || selectedElement.type === 'text') return;
    onUpdateElement(selectedElement.id, { [property]: value });
  }, [selectedElement, onUpdateElement]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  // Render section header
  const renderSectionHeader = (title: string, icon: React.ReactNode, section: string) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100 rounded-lg transition-colors"
    >
      <div className="flex items-center space-x-2">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      {expandedSections[section as keyof typeof expandedSections] ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className={`w-80 bg-white border-r border-gray-200 flex flex-col ${className}`} style={style}>
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          {productType === 'banner' && 'Banner Editor'}
          {productType === 'tin' && 'Business Card Tin Editor'}
          {productType === 'tent' && 'Tradeshow Tent Editor'}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Specifications Section */}
        <div className="border border-gray-200 rounded-lg">
          {renderSectionHeader('Specifications', <Settings className="w-4 h-4" />, 'specifications')}
          {expandedSections.specifications && (
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Canvas Size
                </label>
                <div className="text-sm text-gray-600">
                  {canvasSize.width} × {canvasSize.height}px
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Type
                </label>
                <div className="text-sm text-gray-600 capitalize">
                  {productType}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Shapes Section */}
        <div className="border border-gray-200 rounded-lg">
          {renderSectionHeader('Shapes', <Square className="w-4 h-4" />, 'shapes')}
          {expandedSections.shapes && (
            <div className="p-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddShape('rect')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Square className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Rectangle</span>
              </button>
              <button
                onClick={() => handleAddShape('circle')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Circle className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Circle</span>
              </button>
              <button
                onClick={() => handleAddShape('star')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Star className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Star</span>
              </button>
              <button
                onClick={() => handleAddShape('polygon')}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Triangle className="w-6 h-6 mx-auto mb-1" />
                <span className="text-xs">Polygon</span>
              </button>
            </div>
          )}
        </div>

        {/* Text Section */}
        <div className="border border-gray-200 rounded-lg">
          {renderSectionHeader('Text', <FileText className="w-4 h-4" />, 'text')}
          {expandedSections.text && (
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Text
                </label>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Enter text..."
                  className="w-full p-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddText();
                    }
                  }}
                />
                <button
                  onClick={handleAddText}
                  disabled={!textInput.trim()}
                  className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Text
                </button>
              </div>

              {/* Text Properties for Selected Element */}
              {selectedElement && selectedElement.type === 'text' && (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Size
                    </label>
                    <input
                      type="number"
                      value={selectedElement.fontSize || 24}
                      onChange={(e) => handleTextPropertyChange('fontSize', parseInt(e.target.value))}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      min="8"
                      max="200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Font Family
                    </label>
                    <select
                      value={selectedElement.fontFamily || 'Arial'}
                      onChange={(e) => handleTextPropertyChange('fontFamily', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Verdana">Verdana</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selectedElement.fill || '#000000'}
                      onChange={(e) => handleTextPropertyChange('fill', e.target.value)}
                      className="w-full h-10 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* QR Code Section */}
        <div className="border border-gray-200 rounded-lg">
          {renderSectionHeader('QR Code', <QrCode className="w-4 h-4" />, 'qrcode')}
          {expandedSections.qrcode && (
            <div className="p-3 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  QR Code Text/URL
                </label>
                <input
                  type="text"
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  placeholder="Enter text or URL..."
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    QR Color
                  </label>
                  <input
                    type="color"
                    value={qrColor}
                    onChange={(e) => setQrColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Background
                  </label>
                  <input
                    type="color"
                    value={qrBackgroundColor}
                    onChange={(e) => setQrBackgroundColor(e.target.value)}
                    className="w-full h-10 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  if (qrText.trim()) {
                    // Add QR code element (simplified for now)
                    onAddElement({
                      type: 'rect',
                      x: canvasSize.width / 2 - 50,
                      y: canvasSize.height / 2 - 50,
                      width: 100,
                      height: 100,
                      fillColor: qrBackgroundColor,
                      strokeColor: qrColor,
                      strokeWidth: 2,
                      rotation: 0,
                      scaleX: 1,
                      scaleY: 1,
                      opacity: 1,
                      visible: true,
                      draggable: true,
                      selectable: true
                    });
                  }
                }}
                disabled={!qrText.trim()}
                className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add QR Code
              </button>
            </div>
          )}
        </div>

        {/* Templates Section */}
        <div className="border border-gray-200 rounded-lg">
          {renderSectionHeader('Templates', <Palette className="w-4 h-4" />, 'templates')}
          {expandedSections.templates && (
            <div className="p-3 space-y-3">
              {templates.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Professional Templates</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {templates.slice(0, 4).map((template, index) => (
                      <button
                        key={index}
                        onClick={() => onLoadTemplate(template)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-full h-16 bg-gray-100 rounded mb-1"></div>
                        <span className="text-xs text-gray-600">{template.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {userTemplates.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">My Templates</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {userTemplates.slice(0, 4).map((template, index) => (
                      <button
                        key={index}
                        onClick={() => onLoadTemplate(template)}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-full h-16 bg-gray-100 rounded mb-1"></div>
                        <span className="text-xs text-gray-600">{template.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upload Section */}
        <div className="border border-gray-200 rounded-lg">
          {renderSectionHeader('Upload', <Upload className="w-4 h-4" />, 'upload')}
          {expandedSections.upload && (
            <div className="p-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
