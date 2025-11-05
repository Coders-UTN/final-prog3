// --- Interfaces ---
interface Producto {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    stock: number;
    imagen: string;
    categoriaId: number;
}

interface ItemCarrito {
    producto: Producto;
    cantidad: number;
    subtotal: number;
}

interface PedidoRequest {
    items: Array<{
        productoId: number;
        cantidad: number;
        precioUnitario: number;
    }>;
    total: number;
}

// --- URLs ---
const API_BASE_URL_PEDIDOS = 'http://localhost:8080/api/pedidos';

// --- Clase Principal CartApp ---
class CartApp {
    carrito: ItemCarrito[] = [];
    modal: HTMLElement | null;

    constructor() {
        console.log('Cart App cargada.');
        
        this.modal = document.getElementById('modal-compra');
        this.inicializarApp();
        this.adjuntarEventos();
    }

    // --- Inicialización ---
    async inicializarApp(): Promise<void> {
        await this.verificarAutenticacion();
        this.cargarCarrito();
        this.actualizarUI();
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

    // --- Manejo del Carrito ---
    cargarCarrito(): void {
        const carritoGuardado = localStorage.getItem('carrito');
        this.carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
        console.log('🛒 Carrito cargado:', this.carrito);
    }

    guardarCarrito(): void {
        localStorage.setItem('carrito', JSON.stringify(this.carrito));
    }

    // --- Renderizado ---
    actualizarUI(): void {
        this.renderizarCarrito();
        this.actualizarResumen();
        this.actualizarBotonFinalizar();
    }

    renderizarCarrito(): void {
    const listaCarrito = document.getElementById('lista-carrito');
    const carritoVacio = document.getElementById('carrito-vacio');
    
    if (!listaCarrito) return;

    // Siempre limpiar el contenido
    listaCarrito.innerHTML = '';

    if (this.carrito.length === 0) {
        // Crear el elemento carrito vacío dinámicamente
        const carritoVacioElement = this.crearCarritoVacio();
        listaCarrito.appendChild(carritoVacioElement);
        return;
    }

    // Renderizar items del carrito
    this.carrito.forEach((item, index) => {
        const elementoItem = this.crearElementoItem(item, index);
        listaCarrito.appendChild(elementoItem);
    });
}

crearCarritoVacio(): HTMLElement {
    const elemento = document.createElement('div');
    elemento.className = 'carrito-vacio';
    elemento.id = 'carrito-vacio'; // Mantener el ID para referencia
    
    elemento.innerHTML = `
        <i class="fas fa-shopping-cart"></i>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega algunos productos deliciosos</p>
        <a href="../home/home.html" class="btn-comenzar-comprar">
            <i class="fas fa-store"></i> Comenzar a Comprar
        </a>
    `;
    
    return elemento;
}

    crearElementoItem(item: ItemCarrito, index: number): HTMLElement {
        const elemento = document.createElement('div');
        elemento.className = 'item-carrito';
        
        elemento.innerHTML = `
            <div class="item-imagen">
                <img src="${item.producto.imagen || '/img/placeholder.jpg'}" 
                     alt="${item.producto.nombre}"
                     onerror="this.src='/img/placeholder.jpg'">
            </div>
            <div class="item-info">
                <h4>${item.producto.nombre}</h4>
                <p class="item-descripcion">${item.producto.descripcion}</p>
                <div class="item-precio">$${item.producto.precio.toFixed(2)} c/u</div>
            </div>
            <div class="item-controles">
                <button class="btn-cantidad" onclick="cartApp.disminuirCantidad(${index})" 
                        ${item.cantidad <= 1 ? 'disabled' : ''}>-</button>
                <span class="cantidad-actual">${item.cantidad}</span>
                <button class="btn-cantidad" onclick="cartApp.aumentarCantidad(${index})"
                        ${item.cantidad >= item.producto.stock ? 'disabled' : ''}>+</button>
            </div>
            <div class="item-subtotal">$${item.subtotal.toFixed(2)}</div>
            <button class="btn-eliminar-item" onclick="cartApp.eliminarItem(${index})"
                    title="Eliminar producto">
                <i class="fas fa-trash"></i>
            </button>
        `;

        return elemento;
    }

    actualizarResumen(): void {
        const subtotal = this.carrito.reduce((sum, item) => sum + item.subtotal, 0);
        const envio = subtotal > 5000 ? 0 : 500; // Envio gratis sobre $5000
        const total = subtotal + envio;

        // Actualizar elementos del DOM
        const subtotalElement = document.getElementById('subtotal');
        const envioElement = document.getElementById('envio');
        const totalElement = document.getElementById('total');

        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toFixed(2)}`;
        if (envioElement) envioElement.textContent = envio === 0 ? 'Gratis' : `$${envio.toFixed(2)}`;
        if (totalElement) totalElement.textContent = `$${total.toFixed(2)}`;
    }

    actualizarBotonFinalizar(): void {
        const btnFinalizar = document.getElementById('btn-finalizar') as HTMLButtonElement;
        if (btnFinalizar) {
            btnFinalizar.disabled = this.carrito.length === 0;
        }
    }

    // --- Acciones del Carrito ---
    aumentarCantidad(index: number): void {
        if (this.carrito[index].cantidad < this.carrito[index].producto.stock) {
            this.carrito[index].cantidad++;
            this.carrito[index].subtotal = this.carrito[index].cantidad * this.carrito[index].producto.precio;
            this.guardarCarrito();
            this.actualizarUI();
        }
    }

    disminuirCantidad(index: number): void {
        if (this.carrito[index].cantidad > 1) {
            this.carrito[index].cantidad--;
            this.carrito[index].subtotal = this.carrito[index].cantidad * this.carrito[index].producto.precio;
            this.guardarCarrito();
            this.actualizarUI();
        }
    }

    eliminarItem(index: number): void {
        if (confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
            this.carrito.splice(index, 1);
            this.guardarCarrito();
            this.actualizarUI();
        }
    }

    vaciarCarrito(): void {
        if (this.carrito.length === 0) return;
        
        if (confirm('¿Estás seguro de que quieres vaciar todo el carrito?')) {
            this.carrito = [];
            this.guardarCarrito();
            this.actualizarUI();
        }
    }

    // --- Finalizar Compra ---
    async finalizarCompra(): Promise<void> {
        if (this.carrito.length === 0) return;

        try {
            const pedidoRequest: PedidoRequest = {
                items: this.carrito.map(item => ({
                    productoId: item.producto.id,
                    cantidad: item.cantidad,
                    precioUnitario: item.producto.precio
                })),
                total: this.carrito.reduce((sum, item) => sum + item.subtotal, 0)
            };

            console.log('📦 Enviando pedido:', pedidoRequest);

            const response = await fetch(API_BASE_URL_PEDIDOS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pedidoRequest)
            });

            if (!response.ok) {
                throw new Error(`Error al crear pedido: ${response.status}`);
            }

            const pedidoCreado = await response.json();
            console.log('✅ Pedido creado:', pedidoCreado);

            // Mostrar modal de confirmación
            this.mostrarModalConfirmacion(pedidoCreado);

            // Vaciar carrito después de compra exitosa
            this.carrito = [];
            this.guardarCarrito();

        } catch (error) {
            console.error('❌ Error finalizando compra:', error);
            alert('Error al procesar la compra. Por favor, intenta nuevamente.');
        }
    }

    // --- Modal ---
    mostrarModalConfirmacion(pedido: any): void {
        if (!this.modal) return;

        // Actualizar información del modal
        const numeroPedido = document.getElementById('numero-pedido');
        const totalPedido = document.getElementById('total-pedido');
        const fechaEntrega = document.getElementById('fecha-entrega');

        if (numeroPedido) numeroPedido.textContent = `#${pedido.id?.toString().padStart(6, '0') || '000001'}`;
        if (totalPedido) totalPedido.textContent = `$${pedido.total?.toFixed(2) || '0.00'}`;
        
        if (fechaEntrega) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() + 3); // Entrega en 3 días
            fechaEntrega.textContent = fecha.toLocaleDateString('es-ES');
        }

        this.modal.style.display = 'flex';
    }

    cerrarModal(): void {
        if (this.modal) {
            this.modal.style.display = 'none';
        }
    }

    seguirComprando(): void {
        this.cerrarModal();
        window.location.href = '../home/home.html';
    }

    verPedidos(): void {
        this.cerrarModal();
        // Redirigir a la página de pedidos (si existe)
        // window.location.href = '../orders/orders.html';
        alert('Funcionalidad de pedidos en desarrollo');
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
const cartApp = new CartApp();