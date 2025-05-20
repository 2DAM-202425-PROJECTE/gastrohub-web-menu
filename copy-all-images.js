// copy-all-images.js
const fs = require('fs-extra')
const path = require('path')
const glob = require('glob')

async function copyAllImages() {
  console.log('🔍 Buscando y copiando TODAS las imágenes del proyecto...')
  
  try {
    // 1. Primero, asegurarse de que la carpeta principal de imágenes se copie
    const mainImgDir = path.resolve(__dirname, 'assets/img')
    const outputImgDir = path.resolve(__dirname, 'dist/assets/img')
    
    if (fs.existsSync(mainImgDir)) {
      console.log(`📁 Copiando carpeta principal de imágenes: ${mainImgDir} → ${outputImgDir}`)
      await fs.ensureDir(outputImgDir)
      await fs.copy(mainImgDir, outputImgDir)
      console.log('✅ Carpeta principal de imágenes copiada')
    }
    
    // 2. Buscar TODAS las imágenes en el proyecto (excepto en node_modules y dist)
    console.log('🔍 Buscando imágenes adicionales en todo el proyecto...')
    const imageFiles = glob.sync('**/*.{png,jpg,jpeg,gif,svg,webp,ico,bmp,tiff}', {
      ignore: ['node_modules/**', 'dist/**', 'build/**']
    })
    
    console.log(`🖼️ Encontradas ${imageFiles.length} imágenes adicionales`)
    
    // 3. Copiar cada imagen encontrada manteniendo su ruta relativa
    for (const file of imageFiles) {
      // Verificar si la imagen ya está en assets/img para evitar duplicados
      if (file.startsWith('assets/img/')) {
        continue // Ya la copiamos en el paso 1
      }
      
      const sourcePath = path.resolve(__dirname, file)
      
      // Determinar la ruta de destino
      let destPath
      
      // Si la imagen está en una carpeta 'img' o 'images', mantener esa estructura
      if (file.includes('/img/') || file.includes('/images/')) {
        // Extraer la parte de la ruta después de 'img/' o 'images/'
        const match = file.match(/(\/img\/|\/images\/)(.*)/);
        if (match) {
          const imgSubPath = match[2];
          destPath = path.resolve(__dirname, 'dist/assets/img', imgSubPath);
        } else {
          destPath = path.resolve(__dirname, 'dist/assets/img', path.basename(file));
        }
      } else {
        // Para otras imágenes, colocarlas directamente en assets/img
        destPath = path.resolve(__dirname, 'dist/assets/img', path.basename(file))
      }
      
      // Asegurarse de que el directorio de destino existe
      await fs.ensureDir(path.dirname(destPath))
      
      console.log(`📋 Copiando: ${sourcePath} → ${destPath}`)
      await fs.copy(sourcePath, destPath)
    }
    
    console.log('✅ Todas las imágenes han sido copiadas correctamente')
    
    // 4. Listar todas las imágenes en dist/assets/img para verificación
    const copiedImages = glob.sync('**/*.{png,jpg,jpeg,gif,svg,webp,ico,bmp,tiff}', {
      cwd: path.resolve(__dirname, 'dist')
    })
    
    console.log(`📊 Total de imágenes en dist: ${copiedImages.length}`)
    console.log('🎉 Proceso completado con éxito')
  } catch (err) {
    console.error('❌ Error al copiar imágenes:', err)
    process.exit(1)
  }
}

// Instalar glob si no está instalado
try {
  require.resolve('glob')
} catch (e) {
  console.error('El módulo "glob" no está instalado. Instalándolo ahora...')
  require('child_process').execSync('npm install glob --save-dev')
  console.log('✅ Módulo "glob" instalado correctamente')
}

// Instalar fs-extra si no está instalado
try {
  require.resolve('fs-extra')
} catch (e) {
  console.error('El módulo "fs-extra" no está instalado. Instalándolo ahora...')
  require('child_process').execSync('npm install fs-extra --save-dev')
  console.log('✅ Módulo "fs-extra" instalado correctamente')
}

// Ejecutar la función
copyAllImages()