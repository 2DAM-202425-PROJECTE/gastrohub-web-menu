// vite.config.js
import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  // Configuración básica
  build: {
    outDir: 'dist',
    emptyOutDir: true, // Limpia el directorio de salida antes de construir
    copyPublicDir: true,
    
    // No convertir imágenes a base64
    assetsInlineLimit: 0,
    
    // Configuración para mantener la estructura de carpetas
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Mantener la estructura para imágenes
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return 'assets/img/[name].[hash].[ext]'
          }
          
          // Para otros tipos de archivos
          const extType = {
            'css': 'css',
            'js': 'js',
            'woff': 'fonts',
            'woff2': 'fonts',
            'ttf': 'fonts',
            'eot': 'fonts',
            'mp4': 'videos',
            'webm': 'videos',
            'mp3': 'audio',
            'wav': 'audio'
          }
          
          const ext = assetInfo.name.split('.').pop()
          const folder = extType[ext] || 'other'
          
          return `assets/${folder}/[name].[hash].[ext]`
        }
      }
    }
  },
  
  // Carpeta para archivos estáticos
  publicDir: 'public',
  
  // Base URL
  base: '/',
  
  // Resolver alias para facilitar las importaciones
  resolve: {
    alias: {
      '@': resolve(__dirname, './'),
      '@assets': resolve(__dirname, './assets'),
      '@img': resolve(__dirname, './assets/img')
    }
  },
  
  // Configuración para SASS (ya que lo tienes instalado)
  css: {
    preprocessorOptions: {
      scss: {
        // Puedes añadir opciones de SASS aquí si es necesario
      }
    }
  },
  
  // Configuración para variables de entorno (ya que tienes dotenv)
  envPrefix: 'APP_'
})