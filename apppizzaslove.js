
   // --- Variables Globales ---
    const WHATSAPP_PHONE_NUMBER = '5804120403343'; // N\u00FAmero de tel\u00E9fono de WhatsApp (sin + ni espacios)
    let cart = []; // Array para almacenar los productos en el carrito

    // --- Elementos del DOM ---
    const stickyNavbar = document.getElementById("sticky-navbar");
    const floatingButtons = document.querySelector(".floating-buttons");
    const mainCartButton = document.getElementById("main-cart-button");
    const navCartButton = document.getElementById("nav-cart-button");
    const mainCartCount = document.getElementById("main-cart-count");
    const navCartCount = document.getElementById("nav-cart-count");
    const cartModal = document.getElementById("cart-modal");
    const closeCartModalButton = document.getElementById("close-cart-modal");
    const cartItemsContainer = document.getElementById("cart-items-container");
    const cartTotalDisplay = document.getElementById("cart-total");
    const sendWhatsappOrderButton = document.getElementById("send-whatsapp-order");
    const orderForm = document.getElementById("order-form");

    // --- Funciones del Slider (existente, sin cambios) ---
    const sliderWrapper = document.getElementById('slider-wrapper');
    const sliderDotsContainer = document.getElementById('slider-dots');
    const sliderItems = document.querySelectorAll('.slider-item');
    let currentIndex = 0;

    function createDots() {
        sliderDotsContainer.innerHTML = '';
        sliderItems.forEach((_, index) => {
            const dot = document.createElement('span');
            dot.classList.add('dot');
            if (index === 0) {
                dot.classList.add('active');
            }
            dot.addEventListener('click', () => {
                moveToSlide(index);
            });
            sliderDotsContainer.appendChild(dot);
        });
    }

    function updateDots() {
        const dots = document.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function moveToSlide(index) {
        currentIndex = index;
        const offset = -currentIndex * 100;
        sliderWrapper.style.transform = `translateX(${offset}%)`;
        updateDots();
    }

    let autoSlideInterval = setInterval(() => {
        currentIndex = (currentIndex + 1) % sliderItems.length;
        moveToSlide(currentIndex);
    }, 5000);

    sliderWrapper.addEventListener('mouseover', () => {
        clearInterval(autoSlideInterval);
    });
    sliderWrapper.addEventListener('mouseout', () => {
        autoSlideInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % sliderItems.length;
            moveToSlide(currentIndex);
        }, 5000);
    });

    // --- Funciones del Carrito ---

    // Actualiza los contadores del carrito en la interfaz
    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        mainCartCount.textContent = totalItems;
        navCartCount.textContent = totalItems;
    }

    // Renderiza los \u00EDtems del carrito en el modal
    function renderCartItems() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-gray-500 text-center">Tu carrito est\u00E1 vac\u00EDo.</p>';
        } else {
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;

                const itemElement = document.createElement('div');
                itemElement.classList.add('flex', 'items-center', 'justify-between', 'py-2', 'border-b', 'border-gray-200');
                itemElement.innerHTML = `
                    <div class="flex-1">
                        <p class="font-semibold text-gray-900">${item.name}</p>
                        <p class="text-sm text-gray-600">${item.description}</p>
                        ${item.notes ? `<p class="text-xs text-gray-500 italic">Notas: ${item.notes}</p>` : ''}
                        <p class="text-sm text-gray-700">Precio unitario: $${item.price.toFixed(2)}</p>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="quantity-button decrease-cart-quantity" data-index="${index}">-</button>
                        <input type="number" min="1" value="${item.quantity}" data-index="${index}" class="w-16 p-1 border border-gray-300 rounded-md text-center text-sm cart-quantity-input">
                        <button class="quantity-button increase-cart-quantity" data-index="${index}">+</button>
                        <span class="font-bold text-gray-900 ml-2">$${itemTotal.toFixed(2)}</span>
                        <button class="text-red-500 hover:text-red-700 remove-from-cart-btn ml-2" data-index="${index}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </div>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        cartTotalDisplay.textContent = total.toFixed(2);
    }

    // A\u00F1ade un producto al carrito
    function addToCart(event) {
        const productCard = event.target.closest('.product-card');
        const name = productCard.dataset.name;
        const price = parseFloat(productCard.dataset.price);
        const description = productCard.dataset.description;
        const quantity = parseInt(productCard.querySelector('.quantity-input-field').value);
        const notes = productCard.querySelector('.notes-input').value.trim();

        // Validar que la cantidad sea al menos 1
        if (quantity < 1) {
            alert('La cantidad debe ser al menos 1.'); // Using alert as per previous pattern, consider a custom modal.
            return;
        }

        const existingItemIndex = cart.findIndex(item => item.name === name);

        if (existingItemIndex > -1) {
            // Si el producto ya est\u00E1 en el carrito, actualiza la cantidad y las notas
            cart[existingItemIndex].quantity += quantity;
            if (notes) {
                cart[existingItemIndex].notes = cart[existingItemIndex].notes ? `${cart[existingItemIndex].notes}; ${notes}` : notes;
            }
        } else {
            // Si el producto no est\u00E1 en el carrito, a\u00F1\u00E1delo
            cart.push({ name, price, description, quantity, notes });
        }

        updateCartCount();
        alert(`${quantity} x ${name} a\u00F1adido(s) al carrito.`); // Mensaje de confirmaci\u00F3n
        // Reset quantity input to 1 after adding to cart
        productCard.querySelector('.quantity-input-field').value = 1;
        // Reset price display to original price
        const originalPrice = parseFloat(productCard.dataset.originalPrice);
        productCard.querySelector('.price-display').textContent = `$${originalPrice.toFixed(2).replace(/\.00$/, '')}`;
    }

    // Remueve un producto del carrito
    function removeFromCart(index) {
        cart.splice(index, 1);
        renderCartItems();
        updateCartCount();
    }

    // Actualiza la cantidad de un \u00EDtem en el carrito desde el modal
    function updateCartItemQuantity(index, newQuantity) {
        if (newQuantity < 1) {
            alert('La cantidad debe ser al menos 1. Si deseas eliminar el producto, usa el \u00EDcono de la papelera.');
            renderCartItems(); // Re-render to revert invalid input
            return;
        }
        cart[index].quantity = newQuantity;
        renderCartItems();
        updateCartCount();
    }

    // Abre el modal del carrito
    function openCartModal() {
        renderCartItems(); // Renderiza los \u00EDtems cada vez que se abre el modal
        cartModal.style.display = 'flex';
    }

    // Cierra el modal del carrito
    function closeCartModal() {
        cartModal.style.display = 'none';
    }

    // Genera el mensaje de WhatsApp y abre el enlace
    function sendOrderViaWhatsApp(event) {
        event.preventDefault(); // Evita que el formulario se env\u00EDe normalmente

        const customerName = document.getElementById('customer-name').value.trim();
        const customerLastName = document.getElementById('customer-lastname').value.trim();
        const customerAddress = document.getElementById('customer-address').value.trim();
        const extraNotes = document.getElementById('extra-notes').value.trim();

        if (cart.length === 0) {
            alert('Tu carrito est\u00E1 vac\u00EDo. Agrega productos antes de realizar el pedido.');
            return;
        }

        if (!customerName || !customerLastName || !customerAddress) {
            alert('Por favor, completa tu Nombre, Apellido y Direcci\u00F3n.');
            return;
        }

        let orderMessage = `\u00a1Hola! Me gustar\u00EDa hacer un pedido:\n\n`;
        cart.forEach((item, index) => {
            orderMessage += `${index + 1}. ${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}\n`;
            if (item.notes) {
                orderMessage += `   (Notas: ${item.notes})\n`;
            }
        });

        const totalOrder = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        orderMessage += `\nTotal: $${totalOrder.toFixed(2)}\n\n`;
        orderMessage += `--- Datos del Cliente ---\n`;
        orderMessage += `Nombre: ${customerName} ${customerLastName}\n`;
        orderMessage += `Direcci\u00F3n: ${customerAddress}\n`;
        if (extraNotes) {
            orderMessage += `Notas Generales: ${extraNotes}\n`;
        }
        orderMessage += `\n\u00a1Gracias!`;

        // Codificar el mensaje para la URL de WhatsApp
        const encodedMessage = encodeURIComponent(orderMessage);
        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank'); // Abre el enlace de WhatsApp en una nueva pesta\u00F1a
        cart = []; // Vaciar el carrito despu\u00E9s de enviar el pedido
        updateCartCount();
        closeCartModal(); // Cerrar el modal
        alert('Tu pedido ha sido enviado a WhatsApp. \u00a1Gracias!');
    }

    // Maneja los cambios de cantidad en los inputs de producto
    function handleProductQuantityChange(event) {
        const input = event.target;
        let quantity = parseInt(input.value);
        if (isNaN(quantity) || quantity < 1) {
            quantity = 1; // Default to 1 if invalid
            input.value = 1;
        }
        const productCard = input.closest('.product-card');
        const originalPrice = parseFloat(productCard.dataset.originalPrice);
        const priceDisplay = productCard.querySelector('.price-display');
        priceDisplay.textContent = `$${(originalPrice * quantity).toFixed(2).replace(/\.00$/, '')}`;
    }

    // Incrementa la cantidad de un producto en la tarjeta
    function increaseProductQuantity(event) {
        const productCard = event.target.closest('.product-card');
        const quantityInput = productCard.querySelector('.quantity-input-field');
        quantityInput.value = parseInt(quantityInput.value) + 1;
        handleProductQuantityChange({ target: quantityInput });
    }

    // Decrementa la cantidad de un producto en la tarjeta
    function decreaseProductQuantity(event) {
        const productCard = event.target.closest('.product-card');
        const quantityInput = productCard.querySelector('.quantity-input-field');
        if (parseInt(quantityInput.value) > 1) {
            quantityInput.value = parseInt(quantityInput.value) - 1;
            handleProductQuantityChange({ target: quantityInput });
        }
    }

    // Incrementa la cantidad de un producto en el carrito (modal)
    function increaseCartQuantity(event) {
        const index = parseInt(event.target.dataset.index);
        updateCartItemQuantity(index, cart[index].quantity + 1);
    }

    // Decrementa la cantidad de un producto en el carrito (modal)
    function decreaseCartQuantity(event) {
        const index = parseInt(event.target.dataset.index);
        if (cart[index].quantity > 1) {
            updateCartItemQuantity(index, cart[index].quantity - 1);
        } else {
            // If quantity is 1 and user tries to decrease, remove item
            removeFromCart(index);
        }
    }


    // --- Funciones de Utilidad (existente, sin cambios) ---

    // Funci\u00F3n para actualizar el estado del local (Abierto/Cerrado/Pronto a cerrar)
    function updateStoreStatus() {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const statusElement = document.getElementById('store-status');

        // Limpiar clases de color anteriores
        statusElement.classList.remove('bg-green-500', 'bg-yellow-500', 'bg-red-500');

        // L\u00F3gica para determinar el estado
        if (hours >= 9 && hours < 23) { // De 9:00 a 22:59
            statusElement.textContent = 'Abierto ahora';
            statusElement.classList.add('bg-green-500');
        } else if (hours === 23 && minutes >= 0 && minutes < 30) { // De 23:00 a 23:29
            statusElement.textContent = 'Pronto a cerrar';
            statusElement.classList.add('bg-yellow-500');
        } else { // De 23:30 en adelante y antes de las 9:00
            statusElement.textContent = 'Cerrado';
            statusElement.classList.add('bg-red-500');
        }
    }

    // --- Event Listeners ---
    document.addEventListener('DOMContentLoaded', () => {
        createDots(); // Inicializa los puntos del slider
        updateStoreStatus(); // Establece el estado inicial del local
        setInterval(updateStoreStatus, 60 * 1000); // Actualiza el estado cada minuto

        // Event listener para los botones "Agregar"
        document.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', addToCart);
        });

        // Event listeners para los botones de cantidad en las tarjetas de producto
        document.querySelectorAll('.product-card').forEach(card => {
            card.querySelector('.increase-quantity').addEventListener('click', increaseProductQuantity);
            card.querySelector('.decrease-quantity').addEventListener('click', decreaseProductQuantity);
            card.querySelector('.quantity-input-field').addEventListener('change', handleProductQuantityChange);
        });

        // Event listeners para abrir el modal del carrito
        mainCartButton.addEventListener('click', openCartModal);
        navCartButton.addEventListener('click', openCartModal);

        // Event listener para cerrar el modal del carrito
        closeCartModalButton.addEventListener('click', closeCartModal);

        // Cerrar el modal si se hace clic fuera de su contenido
        window.addEventListener('click', (event) => {
            if (event.target === cartModal) {
                closeCartModal();
            }
        });

        // Event listener para enviar el pedido por WhatsApp
        orderForm.addEventListener('submit', sendOrderViaWhatsApp);

        // Event listeners para los botones de cantidad en los \u00EDtems del carrito (modal)
        cartItemsContainer.addEventListener('click', (event) => {
            if (event.target.classList.contains('increase-cart-quantity')) {
                increaseCartQuantity(event);
            } else if (event.target.classList.contains('decrease-cart-quantity')) {
                decreaseCartQuantity(event);
            } else if (event.target.closest('.remove-from-cart-btn')) {
                const index = parseInt(event.target.closest('.remove-from-cart-btn').dataset.index);
                removeFromCart(index);
            }
        });

        // Event listener para cambiar la cantidad en el carrito desde el input num\u00E9rico (modal)
        cartItemsContainer.addEventListener('change', (event) => {
            if (event.target.classList.contains('cart-quantity-input')) {
                const index = parseInt(event.target.dataset.index);
                const newQuantity = parseInt(event.target.value);
                updateCartItemQuantity(index, newQuantity);
            }
        });

        // JavaScript para el scroll suave de las categor\u00EDas y activar la pesta\u00F1a
        document.querySelectorAll('.category-btn').forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.dataset.target;
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    const stickyNavbarHeight = document.getElementById('sticky-navbar').offsetHeight;
                    // Obtener la posici\u00F3n del elemento, ajustando por la altura del navbar fijo y un margen adicional
                    const adjustedOffset = targetElement.getBoundingClientRect().top + window.pageYOffset - stickyNavbarHeight - 20;

                    window.scrollTo({
                        top: adjustedOffset,
                        behavior: 'smooth'
                    });

                    // Actualizar la clase activa de la pesta\u00F1a
                    document.querySelectorAll('.category-btn').forEach(btn => {
                        btn.classList.remove('text-yellow-500', 'border-yellow-500');
                        btn.classList.add('hover:text-red-600', 'border-transparent', 'hover:border-red-600');
                    });
                    this.classList.add('text-yellow-500', 'border-yellow-500');
                    this.classList.remove('hover:text-red-600', 'border-transparent', 'hover:border-red-600');
                }
            });
        });
    });

    // JavaScript para mostrar/ocultar la barra de navegaci\u00F3n fija y los botones flotantes
    window.onscroll = function() {
        const scrollThreshold = 200; // Ajusta este valor si es necesario
        if (window.pageYOffset > scrollThreshold) {
            stickyNavbar.classList.add("show-on-scroll");
            stickyNavbar.classList.remove("hidden-on-scroll");
            floatingButtons.classList.add("show-on-scroll");
            floatingButtons.classList.remove("hidden-on-scroll");
        } else {
            stickyNavbar.classList.add("hidden-on-scroll");
            stickyNavbar.classList.remove("show-on-scroll");
            floatingButtons.classList.add("hidden-on-scroll");
            floatingButtons.classList.remove("show-on-scroll");
        }
    };

