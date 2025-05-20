import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    // Add bundle visualizer for analyzing bundle size in production
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  base: '/', // Ensure the app is served from the root
  build: {
    assetsDir: '',
    outDir: 'dist',
    // Optimize bundle by splitting vendor code for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
        },
      },
    },
  },
  server: {
    host: true, // Listen on all local IPs
    port: 5174, // Specify default port
    proxy: {
      '/api': {
        target: 'https://theacj.alwaysdata.net/',
        changeOrigin: true,
        secure: false,
      },
    },
    // Preload frequently used files to improve dev and initial load
    warmup: {
      clientFiles: ['./src/App.tsx', './src/components/Home.tsx'],
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'], // Kept as per your config, ensure specific imports in components
  },
});