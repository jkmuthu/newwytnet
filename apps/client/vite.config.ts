import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000, // Changed from 5000 to avoid conflict
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Proxy to actual server
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../shared'),
    },
  },
  // Remove process.env exposure - SECURITY CRITICAL
  // Only VITE_ prefixed env vars are exposed to client
})