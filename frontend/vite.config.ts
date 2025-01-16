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
        target: mode === 'production' ? 'https://theacj.com.ng' : 'http://127.0.0.1:8000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
