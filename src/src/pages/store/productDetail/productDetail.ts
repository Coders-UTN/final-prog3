// --- Interfaces y URLs ---
const API_BASE_URL_PRODUCTOS = 'http://localhost:8080/api/productos';

interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagen: string;
    categoriaid: number;
    categoriaNombre?: string;
}

interface ItemCarrito {
    producto: Producto;
    cantidad: number;
    subtotal: number;
}

// --- Clase Principal ProductDetailApp ---
class ProductDetailApp {
    producto: Producto | null = null;
    productosRelacionados: Producto[] = [];
    cantidad: number = 1;

    modal: HTMLElement | null;
    contadorCarrito: HTMLElement | null;

    constructor() {
        console.log('Product Detail App cargada.');
        
        this.modal = document.getElementById('modal-agregado');
        this.contadorCarrito = document.getElementById('contador-carrito-header');

        this.inicializarApp();
        this.adjuntarEventos();
    }

    // --- Inicialización ---
    async inicializarApp(): Promise<void> {
        await this.verificarAutenticacion();
        await this.cargarProducto();
        this.actualizarContadorCarrito();
    }

    async verificarAutenticacion(): Promise<void> {
        const usuario = this.getUsuarioLogueado();
        if (!usuario) {
            window.location.href = '../../auth/login/login.html';
            return;
        }
        this.actualizarNombreUsuario(usuario.nombre);
    }

    getUsuarioLogueado(): any {
        const userData = localStorage.getItem('food_store_user');
        return userData ? JSON.parse(userData) : null;
    }

    actualizarNombreUsuario(nombre: string): void {
        const elementoUsuario = document.getElementById('nombre-usuario');
        if (elementoUsuario) {
            elementoUsuario.textContent = `Bienvenido, ${nombre}`;
        }
    }

    // --- Carga de Producto ---
    async cargarProducto(): Promise<void> {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        if (!productId) {
            this.mostrarError('No se especificó un producto');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL_PRODUCTOS}/${productId}`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            this.producto = await response.json();
            this.renderizarProducto();
            await this.cargarProductosRelacionados();
            
        } catch (error) {
            console.error('Error cargando producto:', error);
            this.mostrarError('Error al cargar el producto');
        }
    }

    async cargarProductosRelacionados(): Promise<void> {
        if (!this.producto) return;

        try {
            const response = await fetch(`${API_BASE_URL_PRODUCTOS}?categoriaId=${this.producto.categoriaid}`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            const todosProductos = await response.json();
            this.productosRelacionados = todosProductos
                .filter((p: Producto) => p.id !== this.producto!.id && p.stock > 0)
                .slice(0, 4); // Máximo 4 productos relacionados
            
            this.renderizarProductosRelacionados();
            
        } catch (error) {
            console.error('Error cargando productos relacionados:', error);
        }
    }

    // --- Renderizado ---
    renderizarProducto(): void {
        if (!this.producto) return;

        const detalleProducto = document.getElementById('detalle-producto');
        if (!detalleProducto) return;

        const stockClass = this.getStockClass();
        const stockText = this.getStockText();

        detalleProducto.innerHTML = `
            <div class="contenedor-detalle">
                <div class="columna-imagen">
                    <img src="${this.producto.imagen || '/img/placeholder.jpg'}" 
                         alt="${this.producto.nombre}" 
                         class="imagen-grande"
                         onerror="this.src='/img/placeholder.jpg'">
                </div>
                <div class="info-producto">
                    <h1>${this.producto.nombre}</h1>
                    <p class="descripcion-detalle">${this.producto.descripcion}</p>
                    <div class="precio-detalle">$${this.producto.precio.toFixed(2)}</div>
                    <div class="stock-detalle ${stockClass}">${stockText}</div>
                    
                    ${this.producto.stock > 0 ? `
                        <div class="controles-cantidad">
                            <label for="cantidad">Cantidad:</label>
                            <div class="selector-cantidad">
                                <button class="btn-cantidad" onclick="productDetailApp.disminuirCantidad()" 
                                        ${this.cantidad <= 1 ? 'disabled' : ''}>-</button>
                                <input type="number" id="cantidad" class="input-cantidad" 
                                       value="${this.cantidad}" min="1" max="${this.producto.stock}"
                                       onchange="productDetailApp.actualizarCantidad(this.value)">
                                <button class="btn-cantidad" onclick="productDetailApp.aumentarCantidad()"
                                        ${this.cantidad >= this.producto.stock ? 'disabled' : ''}>+</button>
                            </div>
                        </div>
                        
                        <div class="botones-accion">
                            <button class="btn-agregar-carrito" onclick="productDetailApp.agregarAlCarrito()">
                                <i class="fas fa-cart-plus"></i> Agregar al Carrito
                            </button>
                            <button class="btn-volver" onclick="productDetailApp.volverAProductos()">
                                <i class="fas fa-arrow-left"></i> Volver
                            </button>
                        </div>
                    ` : `
                        <div class="botones-accion">
                            <button class="btn-agregar-carrito" disabled>
                                Producto Agotado
                            </button>
                            <button class="btn-volver" onclick="productDetailApp.volverAProductos()">
                                <i class="fas fa-arrow-left"></i> Volver a Productos
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    renderizarProductosRelacionados(): void {
        const gridRelacionados = document.getElementById('grid-relacionados');
        if (!gridRelacionados) return;

        if (this.productosRelacionados.length === 0) {
            gridRelacionados.innerHTML = '<p>No hay productos relacionados disponibles</p>';
            return;
        }

        gridRelacionados.innerHTML = '';
        this.productosRelacionados.forEach(producto => {
            const tarjeta = this.crearTarjetaRelacionada(producto);
            gridRelacionados.appendChild(tarjeta);
        });
    }

    crearTarjetaRelacionada(producto: Producto): HTMLElement {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-relacionada';
        tarjeta.onclick = () => this.verProducto(producto.id);

        tarjeta.innerHTML = `
            <img src="${producto.imagen || '/img/placeholder.jpg'}" 
                 alt="${producto.nombre}" 
                 class="imagen-relacionada"
                 onerror="this.src='/img/placeholder.jpg'">
            <div class="cuerpo-relacionada">
                <h4>${producto.nombre}</h4>
                <div class="precio-relacionado">$${producto.precio.toFixed(2)}</div>
            </div>
        `;

        return tarjeta;
    }

    // --- Control de Cantidad ---
    aumentarCantidad(): void {
        if (!this.producto) return;
        
        if (this.cantidad < this.producto.stock) {
            this.cantidad++;
            this.actualizarControlesCantidad();
        }
    }

    disminuirCantidad(): void {
        if (this.cantidad > 1) {
            this.cantidad--;
            this.actualizarControlesCantidad();
        }
    }

    actualizarCantidad(nuevaCantidad: string): void {
        if (!this.producto) return;

        const cantidad = parseInt(nuevaCantidad) || 1;
        this.cantidad = Math.max(1, Math.min(cantidad, this.producto.stock));
        this.actualizarControlesCantidad();
    }

    actualizarControlesCantidad(): void {
        const inputCantidad = document.getElementById('cantidad') as HTMLInputElement;
        const btnDisminuir = document.querySelector('.btn-cantidad:first-child') as HTMLButtonElement;
        const btnAumentar = document.querySelector('.btn-cantidad:last-child') as HTMLButtonElement;

        if (inputCantidad) inputCantidad.value = this.cantidad.toString();
        if (btnDisminuir) btnDisminuir.disabled = this.cantidad <= 1;
        if (btnAumentar && this.producto) {
            btnAumentar.disabled = this.cantidad >= this.producto.stock;
        }
    }

    // --- Carrito ---
    agregarAlCarrito(): void {
        if (!this.producto) return;

        const carrito: ItemCarrito[] = this.getCarrito();
        const itemExistente = carrito.find(item => item.producto.id === this.producto!.id);

        if (itemExistente) {
            itemExistente.cantidad += this.cantidad;
            itemExistente.subtotal = itemExistente.cantidad * this.producto.precio;
        } else {
            carrito.push({
                producto: this.producto,
                cantidad: this.cantidad,
                subtotal: this.cantidad * this.producto.precio
            });
        }

        this.guardarCarrito(carrito);
        this.actualizarContadorCarrito();
        this.mostrarModalConfirmacion();
    }

    getCarrito(): ItemCarrito[] {
        const carrito = localStorage.getItem('carrito');
        return carrito ? JSON.parse(carrito) : [];
    }

    guardarCarrito(carrito: ItemCarrito[]): void {
        localStorage.setItem('carrito', JSON.stringify(carrito));
    }

    actualizarContadorCarrito(): void {
        if (!this.contadorCarrito) return;
        
        const carrito = this.getCarrito();
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        this.contadorCarrito.textContent = totalItems.toString();
    }

    // --- Helpers ---
    getStockClass(): string {
        if (!this.producto) return '';
        
        if (this.producto.stock === 0) return 'agotado';
        if (this.producto.stock < 10) return 'bajo';
        return '';
    }

    getStockText(): string {
        if (!this.producto) return '';
        
        if (this.producto.stock === 0) return '❌ Agotado';
        if (this.producto.stock < 10) return `⚠️ Solo ${this.producto.stock} disponibles`;
        return `✅ ${this.producto.stock} disponibles`;
    }

    mostrarError(mensaje: string): void {
        const detalleProducto = document.getElementById('detalle-producto');
        if (detalleProducto) {
            detalleProducto.innerHTML = `<div class="estado-error">${mensaje}</div>`;
        }
    }

    // --- Navegación ---
    verProducto(productoId: number): void {
        window.location.href = `productDetail.html?id=${productoId}`;
    }

    volverAProductos(): void {
        window.location.href = '../home/home.html';
    }

    irAlCarrito(): void {
        window.location.href = '../cart/cart.html';
    }

    // --- Modal ---
    mostrarModalConfirmacion(): void {
        if (this.modal) {
            this.modal.style.display = 'flex';
        }
    }

    cerrarModal(): void {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    // --- Eventos ---
    adjuntarEventos(): void {
        // Cierre del modal al hacer click fuera
        if (this.modal) {
            this.modal.addEventListener('click', (e: Event) => {
                if (e.target === this.modal) {
                    this.cerrarModal();
                }
            });
        }
    }

    cerrarSesion(): void {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            localStorage.removeItem('food_store_user');
            localStorage.removeItem('carrito');
            window.location.href = '../../auth/login/login.html';
        }
    }
}

// Inicialización
const productDetailApp = new ProductDetailApp();