// Lightweight pattern-based compression for sessionStorage payloads
// Inspired by backend/quantum_compression.py PatternCompression

const KEY_MAP = {
  marketplace_templates: 'mt',
  canvas_data: 'cd',
  backgroundColor: 'bg',
  konvaStageImage: 'ksi',
  surface_elements: 'se',
  surface_images: 'si',
  tent_specs: 'ts',
  tent_design_option: 'tdo',
  design_option: 'do',
  current_surface: 'cs',
  banner_type: 'bt',
  banner_material: 'bm',
  banner_finish: 'bf',
  banner_size: 'bs',
  banner_category: 'bc',
  product_type: 'pt',
  dimensions: 'dm',
  canvasSize: 'cvs',
  background_color: 'bgc',
  elements: 'el'
}

const REVERSE_KEY_MAP = Object.fromEntries(Object.entries(KEY_MAP).map(([k, v]) => [v, k]))

export const compressJsonString = (jsonString) => {
  let out = jsonString
  // Replace JSON property names (with quotes) to avoid false positives
  for (const [longKey, shortKey] of Object.entries(KEY_MAP)) {
    const re = new RegExp(`"${longKey}"`, 'g')
    out = out.replace(re, `"${shortKey}"`)
  }
  return out
}

export const decompressJsonString = (compressedString) => {
  let out = compressedString
  for (const [shortKey, longKey] of Object.entries(REVERSE_KEY_MAP)) {
    const re = new RegExp(`"${shortKey}"`, 'g')
    out = out.replace(re, `"${longKey}"`)
  }
  return out
}


