import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Asegura que las rutas se resuelvan correctamente
  plugins: [react()],
  server: {
    historyApiFallback: true, // Esto redirige todas las rutas a index.html para que React Router las maneje
  },
});
