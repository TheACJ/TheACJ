import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '' : '/static/', // Only use /static/ for production builds
  build: {
    assetsDir: '',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));