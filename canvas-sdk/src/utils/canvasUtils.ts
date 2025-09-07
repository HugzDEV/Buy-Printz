import { CanvasData, Element, CanvasSize, ExportOptions } from '../types';

export const validateCanvasData = (canvasData: CanvasData): boolean => {
  // Check if canvasData has required properties
  if (!canvasData.elements || !Array.isArray(canvasData.elements)) {
    return false;
  }

  if (!canvasData.canvasSize || typeof canvasData.canvasSize !== 'object') {
    return false;
  }

  if (typeof canvasData.canvasSize.width !== 'number' || typeof canvasData.canvasSize.height !== 'number') {
    return false;
  }

  // Validate each element
  for (const element of canvasData.elements) {
    if (!validateElement(element)) {
      return false;
    }
  }

  return true;
};

export const validateElement = (element: Element): boolean => {
  // Check required properties
  if (!element.id || typeof element.id !== 'string') {
    return false;
  }

  if (!element.type || typeof element.type !== 'string') {
    return false;
  }

  if (typeof element.x !== 'number' || typeof element.y !== 'number') {
    return false;
  }

  if (typeof element.width !== 'number') {
    return false;
  }

  if (element.height !== 'auto' && typeof element.height !== 'number') {
    return false;
  }

  return true;
};

export const exportCanvasData = (
  canvasData: CanvasData,
  options: ExportOptions = { format: 'png' }
): string => {
  // This would typically use Konva's toDataURL method
  // For now, return a placeholder
  return `data:image/${options.format};base64,placeholder`;
};

export const importCanvasData = (data: string): CanvasData | null => {
  try {
    const parsed = JSON.parse(data);
    
    if (validateCanvasData(parsed)) {
      return parsed;
    }
    
    return null;
  } catch (error) {
    console.error('Failed to import canvas data:', error);
    return null;
  }
};

export const clearCanvas = (canvasData: CanvasData): CanvasData => {
  return {
    ...canvasData,
    elements: [],
    selectedId: undefined,
    selectedIds: []
  };
};

export const getCanvasBounds = (canvasData: CanvasData): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} => {
  if (canvasData.elements.length === 0) {
    return {
      minX: 0,
      minY: 0,
      maxX: canvasData.canvasSize.width,
      maxY: canvasData.canvasSize.height
    };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const element of canvasData.elements) {
    const elementMaxX = element.x + element.width;
    const elementMaxY = element.y + (typeof element.height === 'number' ? element.height : 0);

    minX = Math.min(minX, element.x);
    minY = Math.min(minY, element.y);
    maxX = Math.max(maxX, elementMaxX);
    maxY = Math.max(maxY, elementMaxY);
  }

  return { minX, minY, maxX, maxY };
};

export const centerElements = (canvasData: CanvasData): CanvasData => {
  const bounds = getCanvasBounds(canvasData);
  const canvasCenterX = canvasData.canvasSize.width / 2;
  const canvasCenterY = canvasData.canvasSize.height / 2;
  
  const elementsCenterX = (bounds.minX + bounds.maxX) / 2;
  const elementsCenterY = (bounds.minY + bounds.maxY) / 2;
  
  const offsetX = canvasCenterX - elementsCenterX;
  const offsetY = canvasCenterY - elementsCenterY;

  return {
    ...canvasData,
    elements: canvasData.elements.map(element => ({
      ...element,
      x: element.x + offsetX,
      y: element.y + offsetY
    }))
  };
};

export const resizeCanvas = (
  canvasData: CanvasData,
  newSize: CanvasSize
): CanvasData => {
  return {
    ...canvasData,
    canvasSize: newSize
  };
};

export const getElementCount = (canvasData: CanvasData): number => {
  return canvasData.elements.length;
};

export const getElementCountByType = (canvasData: CanvasData): Record<string, number> => {
  const counts: Record<string, number> = {};
  
  for (const element of canvasData.elements) {
    counts[element.type] = (counts[element.type] || 0) + 1;
  }
  
  return counts;
};

export const findElementsInArea = (
  canvasData: CanvasData,
  area: { x: number; y: number; width: number; height: number }
): Element[] => {
  return canvasData.elements.filter(element => {
    const elementMaxX = element.x + element.width;
    const elementMaxY = element.y + (typeof element.height === 'number' ? element.height : 0);
    
    return (
      element.x < area.x + area.width &&
      elementMaxX > area.x &&
      element.y < area.y + area.height &&
      elementMaxY > area.y
    );
  });
};
