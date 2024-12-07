// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/': {
        target: 'http://localhost:5000/tasks', // Ensure this server is running
        changeOrigin: true,
      },
    },
  },
});