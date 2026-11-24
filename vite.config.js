import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  optimizeDeps: {
    // Exclude heavy/non-browser packages from pre-bundling.
    // onnxruntime-web is a ~40MB WASM package.
    // puppeteer is a Node-only browser automation tool used in test scripts.
    exclude: ['onnxruntime-web', 'puppeteer'],
  },
  server: {
    proxy: {
      '/api/esg': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/api/carbon': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/predict': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/health': { target: 'http://127.0.0.1:8000', changeOrigin: true },
      '/api/farmers-ai': { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/api/registry-bridge': { target: 'http://127.0.0.1:8001', changeOrigin: true },
      '/api/diagnose': { target: 'http://127.0.0.1:8001', changeOrigin: true },
    },
    watch: {
      // Exclude large backend folders, virtual environments, and test scripts
      // from the file watcher to prevent high memory/CPU usage and heap out of memory crashes.
      ignored: [
        '**/backend/venv/**',
        '**/backend/ml_pipeline/**',
        '**/inference/**',
        '**/test_*.cjs',
      ],
    },
  },
  build: {
    // Don't warn about the large ONNX chunks in production builds
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        // [COMMENTED OUT FOR PERSONAL REFERENCE — Vite 8 / Rolldown requires function manualChunks(id) instead of object map]
        manualChunks(id) {
          const norm = id.replace(/\\/g, '/');
          if (!norm.includes('/node_modules/')) return undefined;
          if (norm.includes('/react/') || norm.includes('/react-dom/') || norm.includes('/react-router')) return 'vendor-react';
          if (norm.includes('/framer-motion/')) return 'vendor-motion';
          if (norm.includes('/gsap/')) return 'vendor-gsap';
          if (norm.includes('/leaflet/')) return 'vendor-leaflet';
          if (norm.includes('/recharts/')) return 'vendor-recharts';
          return undefined;
        },
      },
    },
  },
})
