import path from 'node:path'
import { crx } from '@crxjs/vite-plugin'
import react from '@vitejs/plugin-react'
import UnoCSS from 'unocss/vite'
import { defineConfig } from 'vite'

import manifest from './src/manifest'

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: 'build',
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/chunk-[hash].js',
      },
    },
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src/'),
    },
  },

  plugins: [crx({ manifest }), react(), UnoCSS()],

  // https://github.com/guocaoyi/create-chrome-ext/issues/74
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
})
