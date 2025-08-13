import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://your-backend-api.com',
        changeOrigin: true,
        secure: false, // Set to true if your backend has valid SSL certificate
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
