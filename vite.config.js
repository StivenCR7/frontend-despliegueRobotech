import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Esto asegura que las rutas se resuelvan correctamente
  plugins: [react()],
})
