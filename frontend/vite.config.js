import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envDir: '../', // Look for .env files in the parent directory (root)
  base: '/', // Ensure correct base path for routing
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
        drop_debugger: true
      }
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
})
