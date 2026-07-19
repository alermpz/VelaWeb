/*
   AURA - MAIN APPLICATION SCRIPT
   Handles: Cart state, Google Sheets loading, GSAP ScrollTrigger animations, and WhatsApp Checkout.
*/

// --- CONFIGURATION ---
// Change this to Montserrat's real WhatsApp number (include country code, no spaces or symbols, e.g. "521234567890")
const WHATSAPP_NUMBER = "521234567890";

// Google Sheets CSV URL. Once Montserrat publishes her sheet to the web as CSV, paste the URL here.
// Example: "https://docs.google.com/spreadsheets/d/e/2PACX-1v.../pub?output=csv"
const GOOGLE_SHEET_CSV_URL = ""; 

// --- STATE MANAGEMENT ---
let products = [];
let cart = JSON.parse(localStorage.getItem('aura_cart')) || [];

// --- DOM ELEMENTS ---
const cartToggle = document.getElementById('cart-toggle');
const cartClose = document.getElementById('cart-close');
const cartOverlay = document.getElementById('cart-overlay');
const cartDrawer = document.getElementById('cart-drawer');
const cartItemsContainer = document.getElementById('cart-items-container');
const cartCount = document.getElementById('cart-count');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartTotal = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-whatsapp');
const productsGrid = document.getElementById('products-grid');

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 1. Fetch products & Render Catalog
    loadProducts();

    // 2. Setup Cart Event Listeners
    setupCartListeners();
    updateCartUI();

    // 3. Initialize GSAP ScrollTrigger Animations
    initScrollAnimations();
}

// --- PRODUCT LOADING (Sheets / Local Fallback) ---
async function loadProducts() {
    try {
        if (GOOGLE_SHEET_CSV_URL) {
            const response = await fetch(GOOGLE_SHEET_CSV_URL);
            if (!response.ok) throw new Error("Network response was not OK");
            const csvText = await response.text();
            products = parseCSV(csvText);
        } else {
            // Fallback to local products.json
            const response = await fetch('products.json');
            products = await response.json();
        }
        renderCatalog(products);
    } catch (error) {
        console.error("Error al cargar los productos. Usando fallback de emergencia.", error);
        // Emergency direct memory fallback in case products.json fails to fetch
        products = [
            {
                "id": 1,
                "nombre": "Aura de Lavanda & Manzanilla",
                "descripcion": "Relajante y floral, ideal para inducir paz.",
                "precio": 280,
                "categoria": "Relajante",
                "imagen": "https://images.unsplash.com/photo-1603006905003-be475563bc59?q=80&w=600&auto=format&fit=crop",
                "detalles": "Cerámica blanca | 250g"
            },
            {
                "id": 2,
                "nombre": "Vainilla Orgánica & Macadamia",
                "descripcion": "Aroma dulce y acogedor con mecha de madera.",
                "precio": 310,
                "categoria": "Cálido",
                "imagen": "https://images.unsplash.com/photo-1596435764253-652a20a9a08a?q=80&w=600&auto=format&fit=crop",
                "detalles": "Vidrio esmerilado | 280g"
            }
        ];
        renderCatalog(products);
    }
}

// Simple and robust CSV parser
function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    if (lines.length < 2) return [];

    // Retrieve headers and normalize them
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').toLowerCase());
    const resultList = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Parse line respecting quotes
        const values = [];
        let currentValue = '';
        let insideQuotes = false;

        for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
                insideQuotes = !insideQuotes;
            } else if (char === ',' && !insideQuotes) {
                values.push(currentValue.trim().replace(/^"|"$/g, ''));
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim().replace(/^"|"$/g, ''));

        if (values.length >= headers.length) {
            const product = {};
            headers.forEach((header, index) => {
                let value = values[index];
                // Map values
                if (header === 'precio' || header === 'id') {
                    product[header] = parseFloat(value) || 0;
                } else {
                    product[header] = value;
                }
            });
            resultList.push(product);
        }
    }
    return resultList;
}

// Render Products Grid
function renderCatalog(items) {
    if (!productsGrid) return;
    
    if (items.length === 0) {
        productsGrid.innerHTML = `
            <div class="loading-state">
                <p>No se encontraron velas aromáticas en esta categoría.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = items.map(product => `
        <div class="product-card" data-category="${product.categoria}">
            <div class="product-image-container">
                <span class="product-tag">${product.categoria}</span>
                <img src="${product.imagen}" alt="${product.nombre}" class="product-image" loading="lazy">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.nombre}</h3>
                <p class="product-desc">${product.descripcion}</p>
                <div class="product-meta">${product.detalles || 'Vela artesanal vertida a mano'}</div>
                <div class="product-price-action">
                    <span class="product-price">$${product.precio.toFixed(2)} MXN</span>
                    <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                        Añadir
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Catalog Filter Logic
    setupFilters();
}

// Catalog Category Filtering
function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active classes
            filterBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');

            const filterValue = e.currentTarget.getAttribute('data-filter');
            const cards = document.querySelectorAll('.product-card');

            cards.forEach(card => {
                if (filterValue === 'todos' || card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}


// --- CART ACTIONS & LOGIC ---
function setupCartListeners() {
    cartToggle.addEventListener('click', toggleCart);
    cartClose.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    
    // Close cart when clicking link in empty state
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('close-cart-link')) {
            toggleCart();
        }
    });

    checkoutBtn.addEventListener('click', checkoutWhatsApp);
}

function toggleCart() {
    cartDrawer.classList.toggle('active');
}

window.addToCart = function(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.cantidad += 1;
    } else {
        cart.push({
            id: product.id,
            nombre: product.nombre,
            precio: product.precio,
            imagen: product.imagen,
            detalles: product.detalles,
            cantidad: 1
        });
    }

    saveCart();
    updateCartUI();
    
    // Open cart drawer immediately to show user feedback
    cartDrawer.classList.add('active');
};

window.updateQuantity = function(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;

    item.cantidad += delta;
    if (item.cantidad <= 0) {
        cart = cart.filter(item => item.id !== productId);
    }

    saveCart();
    updateCartUI();
};

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
};

function saveCart() {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
}

function updateCartUI() {
    // 1. Update count badge
    const totalItems = cart.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = totalItems;

    // 2. Render items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty-state">
                <p>Tu bolsa está vacía.</p>
                <button class="btn btn-secondary close-cart-link">Explorar velas</button>
            </div>
        `;
        cartSubtotal.textContent = "$0.00 MXN";
        cartTotal.textContent = "$0.00 MXN";
        checkoutBtn.style.opacity = "0.5";
        checkoutBtn.style.pointerEvents = "none";
        return;
    }

    checkoutBtn.style.opacity = "1";
    checkoutBtn.style.pointerEvents = "auto";

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-meta">
                    <h4>${item.nombre}</h4>
                    <p>${item.detalles || 'Vela Aromática'}</p>
                </div>
                <div class="cart-item-actions">
                    <div class="quantity-selector">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">−</button>
                        <span class="qty-val">${item.cantidad}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-item-btn" onclick="removeFromCart(${item.id})">Eliminar</button>
                </div>
            </div>
            <div class="cart-item-price">
                $${(item.precio * item.cantidad).toFixed(2)}
            </div>
        </div>
    `).join('');

    // 3. Update totals
    const subtotal = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    cartSubtotal.textContent = `$${subtotal.toFixed(2)} MXN`;
    cartTotal.textContent = `$${subtotal.toFixed(2)} MXN`;
}

// Send Order details to WhatsApp
function checkoutWhatsApp() {
    if (cart.length === 0) return;

    let message = `✨ *NUEVO PEDIDO - AURA VELAS* ✨\n\n`;
    message += `Hola, me gustaría realizar un pedido de las siguientes velas aromáticas:\n\n`;

    cart.forEach((item, index) => {
        message += `📍 *${item.nombre}*\n`;
        message += `   Cantidad: ${item.cantidad}\n`;
        message += `   Detalles: ${item.detalles || 'Estándar'}\n`;
        message += `   Subtotal: $${(item.precio * item.cantidad).toFixed(2)} MXN\n`;
        message += `-------------------------------\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    message += `💰 *TOTAL A PAGAR: $${total.toFixed(2)} MXN*\n\n`;
    message += `✍️ *Detalles de envío / entrega:* (Escribe tu dirección o punto de entrega aquí)\n`;
    message += `💳 *Método de pago de preferencia:* (Transferencia / Efectivo)`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Open chat
    window.open(whatsappUrl, '_blank');
}


// --- SCROLL ANIMATIONS (GSAP & ScrollTrigger) ---
function initScrollAnimations() {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);

    const candle = document.getElementById('animated-candle');
    const flameGroup = document.querySelectorAll('.candle-flame, .flame-core, .flame-glow');
    const smokeGroup = document.querySelector('.smoke-group');

    if (!candle) return;

    // Set initial GSAP styles (centered in the Hero)
    gsap.set(candle, {
        xPercent: -50,
        yPercent: -50,
        left: "50%",
        top: "60%",
        scale: 1.05
    });

    // --- WRAPPER MOVEMENT & FADE ANIMATIONS (responsive) ---
    let mm = gsap.matchMedia();

    // Desktop (screens > 768px)
    mm.add("(min-width: 769px)", () => {
        // 1. Hero → Philosophy: candle wrapper moves to the right column
        gsap.to(candle, {
            scrollTrigger: {
                trigger: "#inicio",
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            left: "68%",
            top: "50%",
            scale: 0.85,
            rotation: 8,
            ease: "none"
        });

        // 2. Extinguish Flame & Show Smoke transition
        ScrollTrigger.create({
            trigger: "#inicio",
            start: "bottom 80%",
            onEnter: () => extinguishFlame(flameGroup, smokeGroup),
            onLeaveBack: () => lightFlame(flameGroup, smokeGroup)
        });

        // 3. Philosophy → Catalog: fade out the wrapper
        gsap.to(candle, {
            scrollTrigger: {
                trigger: "#filosofia",
                start: "bottom 90%",
                end: "bottom 20%",
                scrub: 1
            },
            opacity: 0,
            scale: 0.5,
            y: -100,
            ease: "none"
        });
    });

    // Mobile (screens ≤ 768px)
    mm.add("(max-width: 768px)", () => {
        gsap.set(candle, { top: "58%", scale: 0.9 });

        // 1. Hero → Philosophy mobile transition
        gsap.to(candle, {
            scrollTrigger: {
                trigger: "#inicio",
                start: "top top",
                end: "bottom top",
                scrub: 1
            },
            top: "80%",
            scale: 0.6,
            rotation: -5,
            ease: "none"
        });

        // 2. Mobile Extinguish Flame
        ScrollTrigger.create({
            trigger: "#inicio",
            start: "bottom 80%",
            onEnter: () => extinguishFlame(flameGroup, smokeGroup),
            onLeaveBack: () => lightFlame(flameGroup, smokeGroup)
        });

        // 3. Philosophy → Catalog: fade out
        gsap.to(candle, {
            scrollTrigger: {
                trigger: "#filosofia",
                start: "bottom 95%",
                end: "bottom 30%",
                scrub: 1
            },
            opacity: 0,
            scale: 0.4,
            y: -80,
            ease: "none"
        });
    });
}

// Function to animate extinguishing the flame and showing smoke
function extinguishFlame(flameGroup, smokeGroup) {
    // 1. Kill the flame quickly
    gsap.to(flameGroup, {
        scale: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        stagger: 0.05
    });

    // 2. Trigger the smoke CSS animation
    if (smokeGroup) {
        // Remove and re-add class to restart CSS keyframe animation
        smokeGroup.classList.remove('active');
        void smokeGroup.offsetWidth; // Force reflow to restart animation
        smokeGroup.classList.add('active');
    }
}

// Function to re-light the flame if scrolling back up
function lightFlame(flameGroup, smokeGroup) {
    // 1. Hide the smoke
    if (smokeGroup) {
        smokeGroup.classList.remove('active');
    }

    // 2. Relight the flame
    gsap.to(flameGroup, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: "back.out(1.5)",
        stagger: 0.05
    });
}
