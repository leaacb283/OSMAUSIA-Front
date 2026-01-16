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
      '@i18n': '/src/i18n'
    }
  }
})
