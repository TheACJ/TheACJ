import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/', // Ensure the app is served from the root
  build: {
    assetsDir: '',
    outDir: 'dist',
  },
  server: {
    host: true, // Listen on all local IPs
    port: 5175, // Specify default port (optional)
    proxy: {
      '/api': {
        target: 'https://theacj.alwaysdata.net/',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
