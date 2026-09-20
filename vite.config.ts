import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      // Proxy Bulbapedia Mediawiki API requests to avoid CORS issues in dev.
      // The browser sees same-origin /bulbapedia-api/*, Vite forwards to Bulbapedia.
      '/bulbapedia-api': {
        target: 'https://bulbapedia.bulbagarden.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bulbapedia-api/, ''),
        secure: true,
      },
    },
  },
});

