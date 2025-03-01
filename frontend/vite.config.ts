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
