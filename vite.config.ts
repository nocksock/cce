import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: 'esnext',
    lib: {
      entry: './lib/main.ts',
      name: 'moep',
      fileName: 'moep',
      formats: ['es'],
    },
  },
})
