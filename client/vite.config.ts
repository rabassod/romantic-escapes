import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: "/", // 👈 importante para que genere rutas correctas
  build: {
    outDir: "dist"
  }
})
