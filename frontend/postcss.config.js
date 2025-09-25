module.exports = {
  plugins: {
    autoprefixer: {},
    // Uncomment to enable CSS purging (requires @fullhuman/postcss-purgecss)
    // '@fullhuman/postcss-purgecss': {
    //   content: [
    //     './src/**/*.{js,jsx,ts,tsx}',
    //     './index.html'
    //   ],
    //   defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
    //   safelist: [
    //     // Keep these classes even if they appear unused
    //     /^bg-/,
    //     /^text-/,
    //     /^border-/,
    //     /^hover:/,
    //     /^focus:/,
    //     /^active:/,
    //     /^group-hover:/,
    //     /^md:/,
    //     /^lg:/,
    //     /^xl:/,
    //     /^sm:/,
    //     // Keep animation classes
    //     /^animate-/,
    //     // Keep transition classes
    //     /^transition-/,
    //     // Keep transform classes
    //     /^transform/,
    //     /^scale-/,
    //     /^rotate-/,
    //     /^translate-/
    //   ],
    //   // Don't purge these files
    //   rejected: true,
    //   // Print removed selectors for debugging
    //   printRejected: false
    // }
  }
}