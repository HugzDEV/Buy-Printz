import { Element, Position, CanvasSize } from '../types';

export const createElement = (
  type: Element['type'],
  position: Position,
  size: { width: number; height: number },
  options: Partial<Element> = {}
): Element => {
  const baseElement: Element = {
    id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    x: position.x,
    y: position.y,
    width: size.width,
    height: size.height,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    visible: true,
    draggable: true,
    selectable: true,
    ...options
  };

  // Add type-specific defaults
  switch (type) {
    case 'text':
      return {
        ...baseElement,
        text: options.text || 'Sample Text',
        fontSize: options.fontSize || 24,
        fontFamily: options.fontFamily || 'Arial',
        fontStyle: options.fontStyle || 'normal',
        textDecoration: options.textDecoration || 'none',
        fill: options.fill || '#000000',
        stroke: options.stroke || null,
        strokeWidth: options.strokeWidth || 0,
        align: options.align || 'left',
        verticalAlign: options.verticalAlign || 'top',
        lineHeight: options.lineHeight || 1.2,
        letterSpacing: options.letterSpacing || 0,
        padding: options.padding || 0,
        wrap: options.wrap || 'word',
        height: 'auto'
      };

    case 'rect':
      return {
        ...baseElement,
        fillColor: options.fillColor || '#000000',
        strokeColor: options.strokeColor || null,
        strokeWidth: options.strokeWidth || 0,
        cornerRadius: options.cornerRadius || 0
      };

    case 'circle':
      return {
        ...baseElement,
        fillColor: options.fillColor || '#000000',
        strokeColor: options.strokeColor || null,
        strokeWidth: options.strokeWidth || 0
      };

    case 'star':
      return {
        ...baseElement,
        fillColor: options.fillColor || '#000000',
        strokeColor: options.strokeColor || null,
        strokeWidth: options.strokeWidth || 0,
        innerRadius: options.innerRadius || 30,
        outerRadius: options.outerRadius || 50,
        numPoints: options.numPoints || 5
      };

    case 'line':
      return {
        ...baseElement,
        strokeColor: options.strokeColor || '#000000',
        strokeWidth: options.strokeWidth || 2,
        points: options.points || [0, 0, 100, 0]
      };

    case 'polygon':
      return {
        ...baseElement,
        fillColor: options.fillColor || '#000000',
        strokeColor: options.strokeColor || null,
        strokeWidth: options.strokeWidth || 0,
        sides: options.sides || 6,
        radius: options.radius || 50
      };

    case 'image':
      return {
        ...baseElement,
        src: options.src || ''
      };

    default:
      return baseElement;
  }
};

export const updateElement = (
  element: Element,
  updates: Partial<Element>
): Element => {
  return { ...element, ...updates };
};

export const deleteElement = (
  elements: Element[],
  elementId: string
): Element[] => {
  return elements.filter(element => element.id !== elementId);
};

export const duplicateElement = (
  element: Element,
  offset: Position = { x: 20, y: 20 }
): Element => {
  return {
    ...element,
    id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    x: element.x + offset.x,
    y: element.y + offset.y
  };
};

export const moveElement = (
  element: Element,
  newPosition: Position
): Element => {
  return {
    ...element,
    x: newPosition.x,
    y: newPosition.y
  };
};

export const resizeElement = (
  element: Element,
  newSize: { width: number; height: number }
): Element => {
  return {
    ...element,
    width: newSize.width,
    height: newSize.height
  };
};

export const rotateElement = (
  element: Element,
  rotation: number
): Element => {
  return {
    ...element,
    rotation
  };
};

export const scaleElement = (
  element: Element,
  scale: { scaleX: number; scaleY: number }
): Element => {
  return {
    ...element,
    scaleX: scale.scaleX,
    scaleY: scale.scaleY
  };
};

export const getElementBounds = (element: Element): {
  x: number;
  y: number;
  width: number;
  height: number;
} => {
  return {
    x: element.x,
    y: element.y,
    width: element.width,
    height: typeof element.height === 'number' ? element.height : 0
  };
};

export const isElementInBounds = (
  element: Element,
  bounds: { x: number; y: number; width: number; height: number }
): boolean => {
  const elementBounds = getElementBounds(element);
  
  return (
    elementBounds.x >= bounds.x &&
    elementBounds.y >= bounds.y &&
    elementBounds.x + elementBounds.width <= bounds.x + bounds.width &&
    elementBounds.y + elementBounds.height <= bounds.y + bounds.height
  );
};
