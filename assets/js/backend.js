document.addEventListener("DOMContentLoaded", function () {


    let id;
    // obtener id de la url
    try {
        const urlParams = new URLSearchParams(window.location.search);
        id = urlParams.get('id').split('-')[0];
        console.log(id);
    } catch (error) {
        window.location.href = "404.html";
    }


    function base64ToArrayBuffer(base64) {
        const binary = atob(base64);
        const len = binary.length;
        const buffer = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            buffer[i] = binary.charCodeAt(i);
        }
        return buffer;
    }

    async function decrypt(encryptedBase64, keyString, ivString) {
        const keyBuffer = new TextEncoder().encode(keyString); // 16 bytes
        const ivBuffer = new TextEncoder().encode(ivString);   // 16 bytes
        const encryptedBuffer = base64ToArrayBuffer(encryptedBase64);

        const cryptoKey = await crypto.subtle.importKey(
            "raw",
            keyBuffer,
            { name: "AES-CBC" },
            false,
            ["decrypt"]
        );

        const decryptedBuffer = await crypto.subtle.decrypt(
            {
                name: "AES-CBC",
                iv: ivBuffer,
            },
            cryptoKey,
            encryptedBuffer
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedBuffer);
    }

    const key = "1234567890123456"; // debe coincidir con el backend
    const iv = "1234567890123456";  // debe coincidir con el backend

    let products = [];
    let productIngredientMap = [];
    let ingredientMap = [];
    let restaurantData = [];


    fetch(`http://localhost:8001/api/restaurant/getWebMenu/${id}`)
        .then(response => response.json())
        .then(data => {
            console.log(decrypt(data['encrypted'], key, iv)
                .then(decrypted => {

                    console.log(JSON.parse(decrypted));

                    products = JSON.parse(decrypted)['products'];
                    productIngredientMap = JSON.parse(decrypted)['productIngredientMap'];
                    ingredientMap = JSON.parse(decrypted)['ingredientMap'];
                    restaurantData = JSON.parse(decrypted)['restaurantData'];
                    setData();



                })
                .catch(err => {
                    console.error("Error al desencriptar:", err);
                }));
        })
        .catch(error => {
            window.location.href = "404.html";
        }
        );




    function setData() {
        const restaurantName = document.querySelector('.restaurant-name h1');
        const restaurantAddress = document.querySelector('.restaurant-address p');
        const restaurantPhone = document.querySelector('.restaurant-phone p');
        restaurantName.innerHTML = restaurantData.name;
        restaurantAddress.innerHTML = restaurantData.address;
        restaurantPhone.innerHTML = restaurantData.phone;

        const header = document.querySelector('header');
        header.style.backgroundImage = `url(data:image/png;base64,${restaurantData.banner})`;


        if (restaurantData.banner === null || restaurantData.banner === "") {
            header.style.backgroundImage = `url(assets/img/default-banner.png)`;
        }


        document.title = restaurantData.name;


        // const restaurantAddress = document.querySelector('.restaurant-address');
        //restaurantAddress.innerHTML = restaurantData.address;

        const restaurantImg = document.querySelector('.restaurant-img img');
        restaurantImg.src = "data:image/png;base64," + restaurantData.logo;

        if (restaurantData.logo === null || restaurantData.logo === "") {
            restaurantImg.src = "assets/img/default-pfp.jpg";
        }

        const productContainer = document.querySelector('section.products');

        const productCategories = []
        products.forEach(product => {
            if (!productCategories.includes(product.category)) {
                productCategories.push(product.category);
            }
        });

        const selector = document.getElementById('categories');
        productCategories.forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.text = category;
            selector.appendChild(option);
        });

        console.log(productCategories);

        products.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');

            const productImg = document.createElement('div');
            productImg.classList.add('product-img');

            const img = document.createElement('img');
            img.src = "data:image/png;base64," + product.image;
            img.alt = product.name;


            const allergensDiv = document.createElement('div');
            allergensDiv.classList.add('allergens');
            const glutenFree = document.createElement('img');
            glutenFree.src = "assets/img/gluten-free.svg";
            glutenFree.alt = "Gluten Free";
            const lactoseFree = document.createElement('img');
            lactoseFree.src = "assets/img/lactose-free.svg";
            lactoseFree.alt = "Lactose Free";

            glutenFree.style.display = "none";
            lactoseFree.style.display = "none";


            allergensDiv.appendChild(glutenFree);
            allergensDiv.appendChild(lactoseFree);

            productImg.appendChild(allergensDiv);

            productImg.appendChild(img);
            productCard.appendChild(productImg);

            const dishName = document.createElement('h1');
            dishName.classList.add('dish-name');
            dishName.innerHTML = product.name;
            productCard.appendChild(dishName);

            const dishIngredients = document.createElement('p');
            dishIngredients.classList.add('dish-ingredients');
            dishIngredients.innerHTML = "";

            const ingredientIds = productIngredientMap[product.id_product] || [];
            const ingredientNames = ingredientIds.map(entry => {
                const ingredient = ingredientMap[entry.id_ingredient];
                return ingredient ? ingredient.name : "Desconocido";
            });

            ingredientIds.forEach(entry => {
                const ingredient = ingredientMap[entry.id_ingredient];
                if (ingredient.lactose) {
                    lactoseFree.style.display = "block";
                }
                if (ingredient.gluten) {
                    glutenFree.style.display = "block";
                }
            })

            if (ingredientNames.length > 0) {
                dishIngredients.innerHTML += ingredientNames.join(", ");
            } else {
                dishIngredients.innerHTML += "No disponibles.";
            }

            productCard.appendChild(dishIngredients);


            const dishPrice = document.createElement('p');
            dishPrice.classList.add('dish-price');
            dishPrice.innerHTML = "$" + parseFloat(product.price).toFixed(2);
            productCard.appendChild(dishPrice);

            productContainer.appendChild(productCard);
        });
    }




});