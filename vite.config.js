// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        // Esta es tu página principal
        main: resolve(__dirname, 'index.html'),

        // Aquí le dices a Vite dónde están tus otras páginas HTML
        login: resolve(__dirname, 'pages/auth/login/login.html'),
        register: resolve(__dirname, 'pages/auth/register/register.html'),
        
        // ...puedes añadir más páginas aquí si las tienes
      },
    },
  },
})