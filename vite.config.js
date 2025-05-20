import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    // Directorio de salida
    outDir: 'dist',
    
    // Copiar todos los archivos de la carpeta public sin transformación
    copyPublicDir: true,
    
    // Asegurar que se incluyan todos los assets
    assetsInlineLimit: 0,
    
    // Configuración para asegurar que se incluyan todos los archivos HTML
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        404: resolve(__dirname, '404.html'),
        // Añade aquí cualquier otro archivo HTML que necesites incluir
      }
    }
  },
  
  // Carpeta para archivos estáticos que se copiarán tal cual
  publicDir: 'public',
  
  // Base URL - importante para Netlify
  base: '/',
  
  // Configuración para variables de entorno
  envPrefix: 'VITE_'
})