import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath, URL } from 'node:url';
import { viteSqlitePlugin } from './vite-plugin-sqlite.ts';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), viteSqlitePlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});

