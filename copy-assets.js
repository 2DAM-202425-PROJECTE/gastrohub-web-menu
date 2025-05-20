// copy-assets.js
const fs = require('fs-extra')
const path = require('path')

async function copyAssets() {
  console.log('Iniciando copia de assets...')
  
  try {
    // Directorio de origen y destino para imágenes
    const sourceImgDir = path.resolve(__dirname, 'assets/img')
    const outputImgDir = path.resolve(__dirname, 'dist/assets/img')
    
    // Asegúrate de que el directorio de destino existe
    await fs.ensureDir(outputImgDir)
    
    // Verifica si la carpeta de origen existe
    if (fs.existsSync(sourceImgDir)) {
      console.log(`Copiando imágenes de ${sourceImgDir} a ${outputImgDir}`)
      
      // Copia todo el contenido de la carpeta de imágenes
      await fs.copy(sourceImgDir, outputImgDir)
      console.log('✅ Imágenes copiadas correctamente')
    } else {
      console.error('❌ Error: La carpeta assets/img no existe en la raíz del proyecto')
    }
    
    // También puedes copiar otros assets si es necesario
    // Por ejemplo, si tienes assets/fonts, assets/videos, etc.
    const otherAssetFolders = ['fonts', 'videos', 'documents', 'audio']
    
    for (const folder of otherAssetFolders) {
      const sourcePath = path.resolve(__dirname, `assets/${folder}`)
      
      if (fs.existsSync(sourcePath)) {
        const outputPath = path.resolve(__dirname, `dist/assets/${folder}`)
        console.log(`Copiando assets de ${sourcePath} a ${outputPath}`)
        await fs.ensureDir(outputPath)
        await fs.copy(sourcePath, outputPath)
        console.log(`✅ Assets de ${folder} copiados correctamente`)
      }
    }
    
    console.log('✅ Proceso de copia de assets completado')
  } catch (err) {
    console.error('❌ Error al copiar assets:', err)
    process.exit(1)
  }
}

// Ejecuta la función
copyAssets()