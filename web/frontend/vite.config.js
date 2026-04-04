import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Proxy all /api/* calls to the Node.js backend (no CORS issues in dev)
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      // Proxy uploaded images
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
})
