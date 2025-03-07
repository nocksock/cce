import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      entry: './lib/main.ts',
      name: 'cce',
      fileName: 'cce',
      formats: ['es'],
    },
  },
})
