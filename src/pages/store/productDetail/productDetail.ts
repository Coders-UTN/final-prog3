
import type { IProducto } from "../../../types/IProduct";
import type { IUser } from "../../../types/IUser";
import * as CartService from "../../../services/cart.service";
import { cerrarSesion } from "../../../utils/auth";

const API_BASE_URL_PRODUCTOS = 'http://localhost:8080/api/productos';

class ProductDetailApp {
    producto: IProducto | null = null;
    productosRelacionados: IProducto[] = [];
    cantidad: number = 1;

    modal: HTMLElement | null;
    contadorCarrito: HTMLElement | null;
    btnCerrarSesion: HTMLButtonElement | null;
    btnModalSeguir: HTMLButtonElement | null;
    btnModalCarrito: HTMLButtonElement | null;
    nombreUsuarioEl: HTMLElement | null;

    constructor() {
        console.log('Product Detail App cargada.');
        
        this.modal = document.getElementById('modal-agregado');
        this.contadorCarrito = document.getElementById('contador-carrito-header');
        this.nombreUsuarioEl = document.getElementById('nombre-usuario');
        this.btnCerrarSesion = document.getElementById('btn-cerrar-sesion') as HTMLButtonElement;
        this.btnModalSeguir = document.getElementById('btn-modal-seguir') as HTMLButtonElement;
        this.btnModalCarrito = document.getElementById('btn-modal-carrito') as HTMLButtonElement;
    }

    async inicializarApp(): Promise<void> {
        this.adjuntarEventosEstaticos(); 
        await this.verificarAutenticacion();
        await this.cargarProducto();
        this.actualizarContadorCarrito();
    }

    async verificarAutenticacion(): Promise<void> {
        const usuario = this.getUsuarioLogueado();
        if (!usuario) {
            window.location.href = '/src/pages/auth/login/login.html';
            return;
        }
        this.actualizarNombreUsuario(usuario.nombre);
    }

    getUsuarioLogueado(): IUser | null {
        const userData = localStorage.getItem('food_store_user');
        return userData ? (JSON.parse(userData) as IUser) : null;
    }

    actualizarNombreUsuario(nombre: string): void {
        if (this.nombreUsuarioEl) {
            this.nombreUsuarioEl.textContent = `Bienvenido, ${nombre}`;
        }
    }

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
            const response = await fetch(`${API_BASE_URL_PRODUCTOS}/categoria/${this.producto.categoriaid}`);
            console.log(`${API_BASE_URL_PRODUCTOS}/categoria/${this.producto.categoriaid}`);
            if (!response.ok) throw new Error(`Error: ${response.status}`);
            
            const todosProductos: IProducto[] = await response.json();
            
            this.productosRelacionados = todosProductos
                .filter((p: IProducto) => p.id !== this.producto!.id && p.stock > 0)
                .slice(0, 4); 
            
            this.renderizarProductosRelacionados();
            
        } catch (error) {
            console.error('Error cargando productos relacionados:', error);
        }
    }

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
                         alt="${this.producto.nombre}" class="imagen-grande"
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
                                <button class="btn-cantidad btn-disminuir" 
                                        ${this.cantidad <= 1 ? 'disabled' : ''}>-</button>
                                <input type="number" id="cantidad" class="input-cantidad" 
                                       value="${this.cantidad}" min="1" max="${this.producto.stock}">
                                <button class="btn-cantidad btn-aumentar"
                                        ${this.cantidad >= this.producto.stock ? 'disabled' : ''}>+</button>
                            </div>
                        </div>
                        <div class="botones-accion">
                            <button class="btn-agregar-carrito" id="btn-agregar-carrito">
                                <i class="fas fa-cart-plus"></i> Agregar al Carrito
                            </button>
                            <button class="btn-volver" id="btn-volver">
                                <i class="fas fa-arrow-left"></i> Volver
                            </button>
                        </div>
                    ` : `
                        <div class="botones-accion">
                            <button class="btn-agregar-carrito" disabled>
                                Producto Agotado
                            </button>
                            <button class="btn-volver" id="btn-volver">
                                <i class="fas fa-arrow-left"></i> Volver a Productos
                            </button>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        this.adjuntarEventosProducto();
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

    crearTarjetaRelacionada(producto: IProducto): HTMLElement {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta-relacionada';
        
        tarjeta.innerHTML = `
            <img src="${producto.imagen || '/img/placeholder.jpg'}" 
                 alt="${producto.nombre}" class="imagen-relacionada"
                 onerror="this.src='/img/placeholder.jpg'">
            <div class="cuerpo-relacionada">
                <h4>${producto.nombre}</h4>
                <div class="precio-relacionado">$${producto.precio.toFixed(2)}</div>
            </div>
        `;

        tarjeta.addEventListener('click', () => this.verProducto(producto.id));

        return tarjeta;
    }

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

        let cantidadNum = parseInt(nuevaCantidad);
        if (isNaN(cantidadNum)) {
            cantidadNum = 1;
        }

        this.cantidad = Math.max(1, Math.min(cantidadNum, this.producto.stock));
        this.actualizarControlesCantidad();
    }

    actualizarControlesCantidad(): void {
        const inputCantidad = document.getElementById('cantidad') as HTMLInputElement;
        const btnDisminuir = document.querySelector('.btn-disminuir') as HTMLButtonElement;
        const btnAumentar = document.querySelector('.btn-aumentar') as HTMLButtonElement;

        if (inputCantidad) inputCantidad.value = this.cantidad.toString();
        if (btnDisminuir) btnDisminuir.disabled = this.cantidad <= 1;
        if (btnAumentar && this.producto) {
            btnAumentar.disabled = this.cantidad >= this.producto.stock;
        }
    }

    agregarAlCarrito(): void {
        if (!this.producto) return;

        CartService.addToCart(this.producto, this.cantidad);
        
        this.actualizarContadorCarrito();
        this.mostrarModalConfirmacion();
    }

    actualizarContadorCarrito(): void {
        if (!this.contadorCarrito) return;
        
        const carrito = CartService.getCartItems();
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        this.contadorCarrito.textContent = totalItems.toString();
    }

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

    verProducto(productoId: number): void {
        window.location.href = `productDetail.html?id=${productoId}`;
    }

    volverAProductos(): void {
        window.location.href = '../home/home.html';
    }

    irAlCarrito(): void {
        window.location.href = '../cart/cart.html';
    }

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

    adjuntarEventosEstaticos(): void {
        this.modal?.addEventListener('click', (e: Event) => {
            if (e.target === this.modal) {
                this.cerrarModal();
            }
        });

        this.btnModalSeguir?.addEventListener('click', () => this.cerrarModal());
        this.btnModalCarrito?.addEventListener('click', () => this.irAlCarrito());

        this.btnCerrarSesion?.addEventListener('click', () => cerrarSesion());
    }

    adjuntarEventosProducto(): void {
        const btnDisminuir = document.querySelector('.btn-disminuir') as HTMLButtonElement;
        const btnAumentar = document.querySelector('.btn-aumentar') as HTMLButtonElement;
        const inputCantidad = document.getElementById('cantidad') as HTMLInputElement;
        const btnAgregar = document.getElementById('btn-agregar-carrito') as HTMLButtonElement;
        const btnVolver = document.getElementById('btn-volver') as HTMLButtonElement;

        btnDisminuir?.addEventListener('click', () => this.disminuirCantidad());
        btnAumentar?.addEventListener('click', () => this.aumentarCantidad());
        inputCantidad?.addEventListener('change', () => this.actualizarCantidad(inputCantidad.value));
        btnAgregar?.addEventListener('click', () => this.agregarAlCarrito());
        btnVolver?.addEventListener('click', () => this.volverAProductos());
    }

}

document.addEventListener("DOMContentLoaded", () => {
    const productDetailApp = new ProductDetailApp();
    productDetailApp.inicializarApp();
});