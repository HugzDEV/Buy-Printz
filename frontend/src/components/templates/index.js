// Template Libraries Index
export { bannerTemplates } from './BannerTemplates.jsx'
export { businessCardTinTemplates } from './BusinessCardTinTemplates.jsx'
export { stickerTemplates } from './StickerTemplates.jsx'

// Template selector function
export const getTemplatesByProductType = (productType) => {
  switch (productType) {
    case 'banner':
      return import('./BannerTemplates.jsx').then(module => module.bannerTemplates)
    case 'tin':
    case 'business_card_tin':
      return import('./BusinessCardTinTemplates.jsx').then(module => module.businessCardTinTemplates)
    case 'tent':
    case 'tradeshow_tent':
      return import('./TentTemplates.jsx').then(module => module.tentTemplates)
    case 'sticker':
    case 'stickers':
      return import('./StickerTemplates.jsx').then(module => module.stickerTemplates)
    default:
      return import('./BannerTemplates.jsx').then(module => module.bannerTemplates)
  }
}

// All templates combined (for backward compatibility)
export const getAllTemplates = async () => {
  const [banner, tin, tent, stickers] = await Promise.all([
    import('./BannerTemplates.jsx').then(module => module.bannerTemplates),
    import('./BusinessCardTinTemplates.jsx').then(module => module.businessCardTinTemplates),
    import('./TentTemplates.jsx').then(module => module.tentTemplates),
    import('./StickerTemplates.jsx').then(module => module.stickerTemplates)
  ])
  
  return {
    banner,
    tin,
    tent,
    stickers
  }
}
