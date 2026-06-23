import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Exclude heavy/non-browser packages from pre-bundling.
    // onnxruntime-web is a ~40MB WASM package.
    // puppeteer is a Node-only browser automation tool used in test scripts.
    exclude: ['onnxruntime-web', 'puppeteer'],
  },
  server: {
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
  },
})
