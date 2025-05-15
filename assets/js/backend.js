document.addEventListener("DOMContentLoaded", () => {
  // Elementos para la pantalla de carga
  const loadingScreen = document.getElementById("loading-screen")
  const mainContent = document.getElementById("main-content")

  // Verificar que los elementos existen
  if (!loadingScreen || !mainContent) {
    console.error("No se encontraron los elementos de carga o contenido principal")
    return
  }

  console.log("Iniciando carga de datos...")

  let id
  // obtener id de la url
  try {
    const urlParams = new URLSearchParams(window.location.search)
    id = urlParams.get("id").split("-")[0]
    console.log(id)

    // Si no hay ID, redirigir a 404
    if (!id) {
      window.location.href = "404.html"
      return
    }
  } catch (error) {
    window.location.href = "404.html"
    return
  }

  function base64ToArrayBuffer(base64) {
    const binary = atob(base64)
    const len = binary.length
    const buffer = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      buffer[i] = binary.charCodeAt(i)
    }
    return buffer
  }

  async function decrypt(encryptedBase64, keyString, ivString) {
    const keyBuffer = new TextEncoder().encode(keyString) // 16 bytes
    const ivBuffer = new TextEncoder().encode(ivString) // 16 bytes
    const encryptedBuffer = base64ToArrayBuffer(encryptedBase64)

    const cryptoKey = await crypto.subtle.importKey("raw", keyBuffer, { name: "AES-CBC" }, false, ["decrypt"])

    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: "AES-CBC",
        iv: ivBuffer,
      },
      cryptoKey,
      encryptedBuffer,
    )

    const decoder = new TextDecoder()
    return decoder.decode(decryptedBuffer)
  }

  const key = "1234567890123456" // debe coincidir con el backend
  const iv = "1234567890123456" // debe coincidir con el backend

  let products = []
  let productIngredientMap = []
  let ingredientMap = []
  let restaurantData = []
  const allProductCards = [] // Para almacenar todas las tarjetas de productos

  // Elementos del DOM para filtros
  const searchInput = document.querySelector(".buscador-container input")
  const searchButton = document.querySelector(".buscador-container button")
  const categorySelect = document.getElementById("categories")
  const glutenCheckbox = document.getElementById("gluten")
  const lactoseCheckbox = document.getElementById("lactose")

  // Establecer un tiempo máximo de carga (10 segundos)
  const loadingTimeout = setTimeout(() => {
    // Si después de 10 segundos no se han cargado los datos, redirigir a 404
    window.location.href = "404.html"
  }, 10000)

  fetch(`http://localhost:8001/api/restaurant/getWebMenu/${id}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok")
      }
      return response.json()
    })
    .then((data) => {
      clearTimeout(loadingTimeout) // Cancelar el timeout ya que la respuesta llegó

      decrypt(data["encrypted"], key, iv)
        .then((decrypted) => {
          console.log("Datos desencriptados correctamente")

          try {
            const parsedData = JSON.parse(decrypted)
            console.log("Datos parseados:", parsedData)

            products = parsedData["products"]
            productIngredientMap = parsedData["productIngredientMap"]
            ingredientMap = parsedData["ingredientMap"]
            restaurantData = parsedData["restaurantData"]

            setData()
            setupEventListeners()

            // Ocultar pantalla de carga y mostrar contenido después de procesar los datos
            console.log("Ocultando pantalla de carga...")
            loadingScreen.style.display = "none"
            mainContent.style.display = "block"
            console.log("Contenido principal mostrado")
          } catch (error) {
            console.error("Error al procesar los datos JSON:", error)
            window.location.href = "404.html"
          }
        })
        .catch((err) => {
          console.error("Error al desencriptar:", err)
          window.location.href = "404.html"
        })
    })
    .catch((error) => {
      console.error("Error fetching data:", error)
      window.location.href = "404.html"
    })

  function setupEventListeners() {
    // Evento para el botón de búsqueda
    searchButton.addEventListener("click", filterProducts)

    // Evento para buscar al presionar Enter en el campo de búsqueda
    searchInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        filterProducts()
      }
      // Opcionalmente, filtrar mientras se escribe
      filterProducts()
    })

    // Evento para el selector de categorías
    categorySelect.addEventListener("change", filterProducts)

    // Eventos para los checkboxes de alérgenos
    glutenCheckbox.addEventListener("change", filterProducts)
    lactoseCheckbox.addEventListener("change", filterProducts)
  }

  // Modificar la función filterProducts() para cambiar la lógica de filtrado
  function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase()
    const selectedCategory = categorySelect.value
    const glutenFilter = glutenCheckbox.checked
    const lactoseFilter = lactoseCheckbox.checked

    // Recorrer todas las tarjetas de productos
    allProductCards.forEach((card) => {
      const productId = card.dataset.productId
      const product = products.find((p) => p.id_product == productId)

      if (!product) return

      // Verificar si el producto cumple con todos los filtros
      let visible = true

      // Filtro de búsqueda por nombre o ingredientes
      if (searchTerm) {
        const nameMatch = product.name.toLowerCase().includes(searchTerm)

        // Buscar en ingredientes
        const ingredientIds = productIngredientMap[product.id_product] || []
        let ingredientMatch = false

        for (const entry of ingredientIds) {
          const ingredient = ingredientMap[entry.id_ingredient]
          if (ingredient && ingredient.name.toLowerCase().includes(searchTerm)) {
            ingredientMatch = true
            break
          }
        }

        // Si no coincide ni con nombre ni con ingredientes, ocultar
        if (!nameMatch && !ingredientMatch) {
          visible = false
        }
      }

      // Filtro por categoría
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        visible = false
      }

      // Filtro por alérgenos - LÓGICA INVERTIDA
      // Ahora mostramos productos que CONTIENEN el alérgeno seleccionado
      if (glutenFilter || lactoseFilter) {
        const ingredientIds = productIngredientMap[product.id_product] || []
        let hasGluten = false
        let hasLactose = false

        ingredientIds.forEach((entry) => {
          const ingredient = ingredientMap[entry.id_ingredient]
          if (ingredient) {
            if (ingredient.gluten) hasGluten = true
            if (ingredient.lactose) hasLactose = true
          }
        })

        // Si se seleccionó "gluten" pero el producto NO tiene gluten, ocultar
        if (glutenFilter && !hasGluten) {
          visible = false
        }

        // Si se seleccionó "lactosa" pero el producto NO tiene lactosa, ocultar
        if (lactoseFilter && !hasLactose) {
          visible = false
        }
      }

      // Mostrar u ocultar la tarjeta según los filtros
      card.style.display = visible ? "flex" : "none"
    })
  }

  function setData() {
    const restaurantName = document.querySelector(".restaurant-name h1")
    const restaurantAddress = document.querySelector(".restaurant-address p")
    const restaurantPhone = document.querySelector(".restaurant-phone p")
    restaurantName.innerHTML = restaurantData.name
    restaurantAddress.innerHTML = restaurantData.address
    restaurantPhone.innerHTML = restaurantData.phone

    const header = document.querySelector("header")
    header.style.backgroundImage = `url(data:image/png;base64,${restaurantData.banner})`

    if (restaurantData.banner === null || restaurantData.banner === "") {
      header.style.backgroundImage = `url(assets/img/default-banner.png)`
    }

    document.title = restaurantData.name

    const restaurantImg = document.querySelector(".restaurant-img img")
    restaurantImg.src = "data:image/png;base64," + restaurantData.logo

    if (restaurantData.logo === null || restaurantData.logo === "") {
      restaurantImg.src = "assets/img/default-pfp.jpg"
    }

    const productContainer = document.querySelector("section.products")
    // Limpiar el contenedor de productos
    productContainer.innerHTML = ""

    const productCategories = []
    products.forEach((product) => {
      if (!productCategories.includes(product.category)) {
        productCategories.push(product.category)
      }
    })

    const selector = document.getElementById("categories")
    // Limpiar el selector excepto la opción "all"
    selector.innerHTML = '<option value="all">All</option>'

    productCategories.forEach((category) => {
      const option = document.createElement("option")
      option.value = category
      option.text = category
      selector.appendChild(option)
    })

    console.log(productCategories)

    products.forEach((product) => {
      const productCard = document.createElement("div")
      productCard.classList.add("product-card")
      // Añadir el ID del producto como atributo de datos para facilitar el filtrado
      productCard.dataset.productId = product.id_product

      const productImg = document.createElement("div")
      productImg.classList.add("product-img")

      const img = document.createElement("img")
      img.src = "data:image/png;base64," + product.image
      img.alt = product.name

      if (product.image === null || product.image === "") {
        img.src = "assets/img/default-dish.png"
      }

      const allergensDiv = document.createElement("div")
      allergensDiv.classList.add("allergens")
      const glutenFree = document.createElement("img")
      glutenFree.src = "assets/img/gluten-free.svg"
      glutenFree.alt = "Gluten Free"
      const lactoseFree = document.createElement("img")
      lactoseFree.src = "assets/img/lactose-free.svg"
      lactoseFree.alt = "Lactose Free"

      glutenFree.style.display = "none"
      lactoseFree.style.display = "none"

      allergensDiv.appendChild(glutenFree)
      allergensDiv.appendChild(lactoseFree)

      productImg.appendChild(allergensDiv)

      productImg.appendChild(img)
      productCard.appendChild(productImg)

      const dishName = document.createElement("h1")
      dishName.classList.add("dish-name")
      dishName.innerHTML = product.name
      productCard.appendChild(dishName)

      const dishIngredients = document.createElement("p")
      dishIngredients.classList.add("dish-ingredients")
      dishIngredients.innerHTML = ""

      const ingredientIds = productIngredientMap[product.id_product] || []
      const ingredientNames = ingredientIds.map((entry) => {
        const ingredient = ingredientMap[entry.id_ingredient]
        return ingredient ? ingredient.name : "Desconocido"
      })

      let hasGluten = false
      let hasLactose = false

      ingredientIds.forEach((entry) => {
        const ingredient = ingredientMap[entry.id_ingredient]
        if (ingredient) {
          if (ingredient.lactose) {
            hasLactose = true
            lactoseFree.style.display = "block"
          }
          if (ingredient.gluten) {
            hasGluten = true
            glutenFree.style.display = "block"
          }
        }
      })

      // Guardar información de alérgenos en atributos de datos
      productCard.dataset.hasGluten = hasGluten
      productCard.dataset.hasLactose = hasLactose

      if (ingredientNames.length > 0) {
        dishIngredients.innerHTML += ingredientNames.join(", ")
      } else {
        dishIngredients.innerHTML += "No disponibles."
      }

      productCard.appendChild(dishIngredients)

      const dishPrice = document.createElement("p")
      dishPrice.classList.add("dish-price")
      dishPrice.innerHTML = "$" + Number.parseFloat(product.price).toFixed(2)
      productCard.appendChild(dishPrice)

      productContainer.appendChild(productCard)

      // Añadir la tarjeta al array de todas las tarjetas
      allProductCards.push(productCard)

      // Añadir evento de clic para expandir/contraer
      productCard.addEventListener("click", function () {
        document.querySelectorAll(".product-card.expanded").forEach((expandedCard) => {
          if (expandedCard !== this) {
            expandedCard.classList.remove("expanded")
          }
        })
        this.classList.toggle("expanded")
      })
    })
  }

  // Añadir un respaldo para asegurarse de que la pantalla de carga se oculta
  window.addEventListener("load", () => {
    setTimeout(() => {
      const loadingScreen = document.getElementById("loading-screen")
      if (loadingScreen && loadingScreen.style.display !== "none") {
        console.log("Forzando ocultación de la pantalla de carga después de 15 segundos")
        loadingScreen.style.display = "none"
        document.getElementById("main-content").style.display = "block"
      }
    }, 15000) // 15 segundos como respaldo
  })
})
