/**
 * Utilidades para manejar imágenes predeterminadas
 */

// Función para manejar errores de carga de imágenes y mostrar una imagen predeterminada
function handleImageError(imgElement, defaultImagePath) {
    imgElement.onerror = () => {
      console.warn(`Error al cargar la imagen: ${imgElement.src}`)
      imgElement.src = defaultImagePath
      // Evitar bucle infinito si la imagen predeterminada también falla
      imgElement.onerror = null
    }
  
    // Si la imagen ya está en error o vacía, cargar la predeterminada inmediatamente
    if (!imgElement.src || imgElement.src === "" || imgElement.src === "data:image/png;base64,") {
      imgElement.src = defaultImagePath
    }
  }
  
  // Función para manejar errores en imágenes de fondo (background-image)
  function handleBackgroundImageError(element, defaultImagePath) {
    // Crear una imagen temporal para verificar si la imagen de fondo carga correctamente
    const tempImg = new Image()
  
    // Obtener la URL actual del background-image
    const style = window.getComputedStyle(element)
    const bgImage = style.backgroundImage
  
    // Extraer la URL de la cadena 'url("...")'
    const bgUrl = bgImage.replace(/^url$$['"]?/, "").replace(/['"]?$$$/, "")
  
    // Si la URL está vacía o es inválida, establecer la imagen predeterminada inmediatamente
    if (!bgUrl || bgUrl === "none" || bgUrl === "data:image/png;base64,") {
      element.style.backgroundImage = `url(${defaultImagePath})`
      return
    }
  
    tempImg.onerror = () => {
      console.warn(`Error al cargar la imagen de fondo: ${bgUrl}`)
      element.style.backgroundImage = `url(${defaultImagePath})`
    }
  
    tempImg.src = bgUrl
  }
  
  // Función para verificar y manejar imágenes base64
  function handleBase64Image(imgElement, base64Data, defaultImagePath) {
    if (!base64Data || base64Data === "" || base64Data === "undefined") {
      console.warn("Datos base64 no válidos, usando imagen predeterminada")
      imgElement.src = defaultImagePath
    } else {
      imgElement.src = "data:image/png;base64," + base64Data
      // Agregar manejador de error por si la decodificación base64 falla
      imgElement.onerror = () => {
        console.warn("Error al decodificar imagen base64, usando imagen predeterminada")
        imgElement.src = defaultImagePath
        imgElement.onerror = null
      }
    }
  }
  