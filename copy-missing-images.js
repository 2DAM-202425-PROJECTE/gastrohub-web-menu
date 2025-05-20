// copy-missing-images.js
const fs = require('fs-extra')
const path = require('path')

async function copyMissingImages() {
  // Lista de imágenes que faltan (ajusta estas rutas a tus imágenes específicas)
  const missingImages = [
    'ruta/a/imagen1.png',
    'otra/ruta/imagen2.jpg',
    // Añade aquí todas las imágenes que faltan
  ]
  
  for (const imgPath of missingImages) {
    const sourcePath = path.resolve(__dirname, imgPath)
    const destPath = path.resolve(__dirname, 'dist/assets/img', path.basename(imgPath))
    
    console.log(`Copiando imagen faltante: ${sourcePath} → ${destPath}`)
    
    try {
      await fs.ensureDir(path.dirname(destPath))
      await fs.copy(sourcePath, destPath)
      console.log(`✅ Copiada correctamente: ${path.basename(imgPath)}`)
    } catch (err) {
      console.error(`❌ Error al copiar ${imgPath}:`, err)
    }
  }
}

copyMissingImages()