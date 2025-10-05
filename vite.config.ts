// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
// Opcional: npm i -D rollup-plugin-visualizer
// import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // visualizer({
    //   filename: 'stats.html',
    //   gzipSize: true,
    //   brotliSize: true,
    // }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    modulePreload: { polyfill: false },
    cssCodeSplit: true,
    reportCompressedSize: true,
    // chunkSizeWarningLimit: 1200, // opcional, si el warning te molesta
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // Agrupamos librerías grandes para mejorar el rendimiento y caché
          if (/react|react-dom/.test(id)) return 'react';
          if (id.includes('date-fns')) return 'date-fns';
          if (id.includes('@radix-ui')) return 'radix';
          if (id.includes('lucide-react')) return 'icons';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('exceljs')) return 'exceljs';
          if (id.includes('@ai-sdk') || id.includes('/node_modules/ai/')) return 'ai-sdk';

          return 'vendor';
        },
      },
    },
  },
});
