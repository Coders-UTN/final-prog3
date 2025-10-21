// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Esta es tu página principal (asumiendo que está en la raíz)
        main: resolve(__dirname, 'index.html'),

        // Aquí le decimos a Vite dónde están tus otras páginas HTML
        // ✅ RUTA CORREGIDA (agregamos 'src/')
        login: resolve(__dirname, 'src/pages/auth/login/login.html'),
        
        // ✅ RUTA CORREGIDA (agregamos 'src/')
        register: resolve(__dirname, 'src/pages/auth/register/register.html'),
        
        // ...puedes añadir más páginas aquí si las tienes
      },
    },
  },
})