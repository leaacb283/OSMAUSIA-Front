import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@contexts': '/src/contexts',
      '@data': '/src/data',
      '@utils': '/src/utils',
      '@styles': '/src/styles',
      '@i18n': '/src/i18n',
      '@services': '/src/services'
    }
  },
  server: {
    port: 5173,
    // Proxy pour éviter les problèmes CORS en développement
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/ws-chat': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true
      }
    }
  }
})
