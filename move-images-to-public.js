// move-images-to-public.js
const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')

async function moveImagesToPublic() {
  console.log('🔍 Moviendo todas las imágenes a public/assets/img...')
  
  try {
    // Crear carpeta public/assets/img si no existe
    const publicImgDir = path.resolve(__dirname, 'public/assets/img')
    await fs.ensureDir(publicImgDir)
    
    // Buscar todas las imágenes en el proyecto (excepto en node_modules, dist y public)
    const imageFiles = glob.sync('**/*.{png,jpg,jpeg,gif,svg,webp,ico,bmp,tiff}', {
      ignore: ['node_modules/**', 'dist/**', 'build/**', 'public/**']
    })
    
    console.log(`🖼️ Encontradas ${imageFiles.length} imágenes para mover`)
    
    // Copiar cada imagen a public/assets/img
    for (const file of imageFiles) {
      const sourcePath = path.resolve(__dirname, file)
      const destPath = path.resolve(publicImgDir, path.basename(file))
      
      console.log(`📋 Copiando: ${sourcePath} → ${destPath}`)
      await fs.copy(sourcePath, destPath)
    }
    
    console.log('✅ Todas las imágenes han sido movidas a public/assets/img')
    console.log('⚠️ IMPORTANTE: Actualiza las referencias a las imágenes en tu código a /assets/img/nombre-imagen.ext')
  } catch (err) {
    console.error('❌ Error al mover imágenes:', err)
    process.exit(1)
  }
}

// Ejecutar la función
moveImagesToPublic()