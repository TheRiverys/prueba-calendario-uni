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
    modulePreload: { polyfill: true },
    cssCodeSplit: true,
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          // React primero
          if (/react|react-dom/.test(id)) return 'react';

          // Librerías grandes independientes
          if (id.includes('date-fns')) return 'date-fns';
          if (id.includes('exceljs')) return 'exceljs';
          if (id.includes('@supabase')) return 'supabase';
          
          // AI SDK (incluye zod y otras dependencias)
          if (id.includes('@ai-sdk') || id.includes('/node_modules/ai/')) return 'ai-sdk';

          // Solo @radix-ui (sin otras bibliotecas mezcladas)
          if (id.includes('@radix-ui')) return 'radix';
          
          // Todo lo demás (incluyendo lucide-react, sonner, clsx, etc.) 
          // va al bundle principal para evitar problemas de inicialización
          return undefined;
        },
      },
    },
  },
});