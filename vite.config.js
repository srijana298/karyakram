import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  optimizeDeps: {
    include: ['flatpickr']
  },
  server: {
    proxy: {
      '/v1': 'https://cloud.appwrite.io'
    },
    host: '127.0.0.1'
  }
});
