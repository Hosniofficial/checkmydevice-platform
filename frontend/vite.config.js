import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api':     'http://localhost:5000',
      '/uploads': 'http://localhost:5000',
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  define: {
    __API_BASE__: JSON.stringify(
      mode === 'production'
        ? (process.env.VITE_API_URL || 'https://checkmydevice-api.onrender.com')
        : 'http://localhost:5000'
    ),
  },
}));
