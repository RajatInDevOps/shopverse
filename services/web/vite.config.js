import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite writes dist/, which is what the generated Dockerfile copies into nginx.
export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist' },
})
