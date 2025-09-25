import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  envDir: '../', // Look for .env files in the parent directory (root)
  base: '/', // Ensure correct base path for routing
  
  // Modern browser support - avoid legacy JavaScript
  esbuild: {
    target: 'es2020', // Target modern browsers
    supported: {
      'top-level-await': true
    }
  },
  server: {
    host: '0.0.0.0', // Bind to all interfaces
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Modern browser target - avoid legacy JavaScript
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          // Supabase
          'supabase': ['@supabase/supabase-js'],
          // Heavy libraries
          'jspdf': ['jspdf'],
          'stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js'],
          // UI libraries
          'ui-libs': ['lucide-react', 'react-hot-toast', 'sonner'],
          // Canvas libraries
          'canvas-libs': ['konva', 'react-konva'],
          // QR Code
          'qrcode': ['qrcode.react']
        }
      }
    },
    // Optimize bundle size
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        // Modern JavaScript optimizations
        ecma: 2020,
        module: true
      },
      mangle: {
        // Preserve modern JavaScript features
        keep_fnames: false,
        module: true
      },
      format: {
        // Output modern JavaScript
        ecma: 2020,
        comments: false
      }
    },
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true,
    // Additional CSS optimization
    css: {
      postcss: {
        plugins: [
          // Add PostCSS plugins for CSS optimization
          require('autoprefixer'),
          // Uncomment the following for CSS purging (requires postcss-purgecss)
          // require('@fullhuman/postcss-purgecss')({
          //   content: [
          //     './src/**/*.{js,jsx,ts,tsx}',
          //     './index.html'
          //   ],
          //   defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
          //   safelist: [
          //     /^bg-/,
          //     /^text-/,
          //     /^border-/,
          //     /^hover:/,
          //     /^focus:/,
          //     /^active:/
          //   ]
          // })
        ]
      }
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
})
