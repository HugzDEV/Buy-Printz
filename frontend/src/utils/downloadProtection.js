// Download Protection Utilities
// This file provides additional protection against image downloading

export const addGlobalDownloadProtection = () => {
  // Disable right-click context menu globally on images
  document.addEventListener('contextmenu', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('.protected-image')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  })

  // Disable drag and drop globally on images
  document.addEventListener('dragstart', (e) => {
    if (e.target.tagName === 'IMG' && e.target.closest('.protected-image')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  })

  // Disable keyboard shortcuts for saving images
  document.addEventListener('keydown', (e) => {
    // Block Ctrl+S, Cmd+S (Save)
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
    
    // Block Ctrl+A, Cmd+A (Select All) on protected images
    if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
      const activeElement = document.activeElement
      if (activeElement && activeElement.closest('.protected-image')) {
        e.preventDefault()
        e.stopPropagation()
        return false
      }
    }
    
    // Block F12 (Developer Tools)
    if (e.key === 'F12') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
    
    // Block Ctrl+Shift+I (Developer Tools)
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
    
    // Block Ctrl+U (View Source)
    if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  })

  // Disable text selection on protected images
  document.addEventListener('selectstart', (e) => {
    if (e.target && e.target.closest && e.target.closest('.protected-image')) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  })

  // Add CSS to prevent image saving
  const style = document.createElement('style')
  style.textContent = `
    .protected-image {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-user-drag: none !important;
      -khtml-user-drag: none !important;
      -moz-user-drag: none !important;
      -o-user-drag: none !important;
      user-drag: none !important;
      pointer-events: none !important;
    }
    
    .protected-image img {
      -webkit-user-select: none !important;
      -moz-user-select: none !important;
      -ms-user-select: none !important;
      user-select: none !important;
      -webkit-user-drag: none !important;
      -khtml-user-drag: none !important;
      -moz-user-drag: none !important;
      -o-user-drag: none !important;
      user-drag: none !important;
      pointer-events: none !important;
      -webkit-touch-callout: none !important;
    }
    
    .protected-image::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 1;
      pointer-events: auto;
    }
  `
  document.head.appendChild(style)
}

export const removeGlobalDownloadProtection = () => {
  // Remove event listeners (this is a simplified version)
  // In a real implementation, you'd store references to the listeners
  document.removeEventListener('contextmenu', () => {})
  document.removeEventListener('dragstart', () => {})
  document.removeEventListener('keydown', () => {})
  document.removeEventListener('selectstart', () => {})
  
  // Remove the style
  const style = document.querySelector('style[data-download-protection]')
  if (style) {
    style.remove()
  }
}

// Utility function to check if an element is a protected image
export const isProtectedImage = (element) => {
  return element && element.closest('.protected-image')
}

// Utility function to add protection class to an element
export const addProtectionClass = (element) => {
  if (element) {
    element.classList.add('protected-image')
  }
}

// Utility function to remove protection class from an element
export const removeProtectionClass = (element) => {
  if (element) {
    element.classList.remove('protected-image')
  }
}
