import path from 'path'
import { defineConfig } from 'vitest/config'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    // React Compiler : mémoïsation automatique (runtime fourni par React 19).
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // vendors lourds dans des chunks séparés, mis en cache indépendamment
        manualChunks(id) {
          if (!id.includes('node_modules/')) return
          if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(id)) return 'react'
          if (id.includes('node_modules/pdf-lib') || id.includes('node_modules/@pdf-lib/')) return 'pdf'
        },
      },
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
  },
})
