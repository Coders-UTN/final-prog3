import type { ItemCarrito } from "../../../types/ICart";
import type { IUser } from "../../../types/IUser";

import * as CartService from "../../../services/cart.service"; 

class CartApp {
  carrito: ItemCarrito[] = []; 
  modal: HTMLElement | null;

  btnFinalizar: HTMLButtonElement | null;
  btnVaciar: HTMLButtonElement | null;
  btnCerrarSesion: HTMLButtonElement | null;
  btnModalCerrarX: HTMLElement | null;
  btnModalSeguir: HTMLButtonElement | null;
  btnModalVerPedidos: HTMLButtonElement | null;
  nombreUsuarioEl: HTMLElement | null;

  constructor() {
    console.log("Cart App cargada.");
    
    this.modal = document.getElementById("modal-compra");
    this.nombreUsuarioEl = document.getElementById("nombre-usuario");
    this.btnFinalizar = document.getElementById("btn-finalizar") as HTMLButtonElement;
    this.btnVaciar = document.getElementById("btn-vaciar-carrito") as HTMLButtonElement;
    this.btnCerrarSesion = document.getElementById("btn-cerrar-sesion") as HTMLButtonElement;
    this.btnModalCerrarX = document.querySelector("#modal-compra .modal-cerrar");
    this.btnModalSeguir = document.getElementById("btn-seguir-comprando") as HTMLButtonElement;
    this.btnModalVerPedidos = document.getElementById("btn-ver-pedidos") as HTMLButtonElement;    
  }

  // --- Inicialización ---
  async inicializarApp(): Promise<void> {
    await this.verificarAutenticacion();
    this.cargarCarrito(); // Carga el estado inicial
    this.actualizarUI();
    this.adjuntarEventos(); 
  }

  async verificarAutenticacion(): Promise<void> {
    const usuario = this.getUsuarioLogueado();
    if (!usuario) {
      window.location.href = "/src/pages/store/home/home.html";
      return;
    }
    this.actualizarNombreUsuario(usuario.nombre);
  }

  getUsuarioLogueado(): IUser | null {
    const userData = localStorage.getItem("food_store_user");
    return userData ? (JSON.parse(userData) as IUser) : null;
  }

  actualizarNombreUsuario(nombre: string): void {
    if (this.nombreUsuarioEl) {
      this.nombreUsuarioEl.textContent = `Bienvenido, ${nombre}`;
    }
  }

  cargarCarrito(): void {
    this.carrito = CartService.getCartItems(); 
    console.log("🛒 Carrito cargado:", this.carrito);
  }

  actualizarUI(): void {
    this.renderizarCarrito();
    this.actualizarResumen();
    this.actualizarBotonFinalizar();
  }

  renderizarCarrito(): void {
    const listaCarrito = document.getElementById("lista-carrito");
    if (!listaCarrito) return;
    listaCarrito.innerHTML = "";

    if (this.carrito.length === 0) {
      listaCarrito.appendChild(this.crearCarritoVacio());
      return;
    }
    
    const fragment = document.createDocumentFragment();
    this.carrito.forEach((item, index) => {
      // Pasamos el ID del producto, no el índice
      const elementoItem = this.crearElementoItem(item); 
      fragment.appendChild(elementoItem);
    });
    listaCarrito.appendChild(fragment);
  }
  
  crearCarritoVacio(): HTMLElement {
    const elemento = document.createElement("div");
    elemento.className = "carrito-vacio";
    elemento.id = "carrito-vacio";
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

  crearElementoItem(item: ItemCarrito): HTMLElement {
    const elemento = document.createElement("div");
    elemento.className = "item-carrito";

    // 1. HTML sin onclicks
    elemento.innerHTML = `
      <div class="item-imagen">
        <img src="${item.producto.imagen || "/img/placeholder.jpg"}" 
             alt="${item.producto.nombre}"
             onerror="this.src='/img/placeholder.jpg'">
      </div>
      <div class="item-info">
        <h4>${item.producto.nombre}</h4>
        <p class="item-descripcion">${item.producto.descripcion}</p>
        <div class="item-precio">$${item.producto.precio.toFixed(2)} c/u</div>
      </div>
      <div class="item-controles">
        <button class="btn-cantidad btn-disminuir" ${item.cantidad <= 1 ? "disabled" : ""}>-</button>
        <span class="cantidad-actual">${item.cantidad}</span>
        <button class="btn-cantidad btn-aumentar" ${item.cantidad >= item.producto.stock ? "disabled" : ""}>+</button>
      </div>
      <div class="item-subtotal">$${item.subtotal.toFixed(2)}</div>
      <button class="btn-eliminar-item" title="Eliminar producto">
        <i class="fas fa-trash"></i>
      </button>
    `;

    // 2. Adjuntar listeners
    const btnDisminuir = elemento.querySelector(".btn-disminuir");
    const btnAumentar = elemento.querySelector(".btn-aumentar");
    const btnEliminar = elemento.querySelector(".btn-eliminar-item");

    // 3. Los listeners AHORA LLAMAN a los métodos de la clase
    btnDisminuir?.addEventListener("click", () => this.disminuirCantidad(item.producto.id));
    btnAumentar?.addEventListener("click", () => this.aumentarCantidad(item.producto.id, item.producto.stock));
    btnEliminar?.addEventListener("click", () => this.eliminarItem(item.producto.id));

    return elemento;
  }
  
  actualizarResumen(): void {
    const subtotal = this.carrito.reduce((sum, item) => sum + item.subtotal, 0);
    const envio = subtotal > 5000 ? 0 : 500;
    const total = subtotal + envio;

    const subtotalEl = document.getElementById("subtotal");
    const envioEl = document.getElementById("envio");
    const totalEl = document.getElementById("total");

    if(subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    if(envioEl) envioEl.textContent = envio === 0 ? "Gratis" : `$${envio.toFixed(2)}`;
    if(totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
  }

  actualizarBotonFinalizar(): void {
    if (this.btnFinalizar) {
      this.btnFinalizar.disabled = this.carrito.length === 0;
    }
  }

  aumentarCantidad(productoId: number, stock: number): void {
    const item = this.carrito.find(i => i.producto.id === productoId);
    if (item && item.cantidad < stock) {
        this.carrito = CartService.updateItemQuantity(productoId, item.cantidad + 1);
        this.actualizarUI();
    }
  }

  disminuirCantidad(productoId: number): void {
    const item = this.carrito.find(i => i.producto.id === productoId);
    if (item && item.cantidad > 0) { 
        this.carrito = CartService.updateItemQuantity(productoId, item.cantidad - 1);
        this.actualizarUI();
    }
  }

  eliminarItem(productoId: number): void {
    if (confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      this.carrito = CartService.removeItemFromCart(productoId);
      this.actualizarUI();
    }
  }

  vaciarCarrito(): void {
    if (this.carrito.length === 0) return;
    if (confirm("¿Estás seguro de que quieres vaciar todo el carrito?")) {
      CartService.clearCart();
      this.carrito = []; 
      this.actualizarUI();
    }
  }

  async finalizarCompra(): Promise<void> {
    if (this.carrito.length === 0) return;
    
    if(this.btnFinalizar) this.btnFinalizar.disabled = true;

    try {
      const pedidoCreado = await CartService.finalizePurchase(); 
      
      console.log("✅ Pedido creado:", pedidoCreado);
      this.mostrarModalConfirmacion(pedidoCreado);
      
      this.carrito = []; 
      this.actualizarUI();

    } catch (error) {
      console.error("❌ Error finalizando compra:", error);
      
      this.actualizarBotonFinalizar(); 
    }
  }
  

  mostrarModalConfirmacion(pedido: any): void {
    if (!this.modal) return;
    
    const numeroPedido = document.getElementById("numero-pedido");
    const totalPedido = document.getElementById("total-pedido");
    const fechaEntrega = document.getElementById("fecha-entrega");

    if (numeroPedido) numeroPedido.textContent = `#${pedido.id?.toString().padStart(6, "0") || "000001"}`;
    if (totalPedido) totalPedido.textContent = `$${pedido.total?.toFixed(2) || "0.00"}`;
    if (fechaEntrega) {
        const fecha = new Date();
        fecha.setDate(fecha.getDate() + 3); 
        fechaEntrega.textContent = fecha.toLocaleDateString("es-ES");
    }
    
    this.modal.style.display = "flex";
  }

  cerrarModal(): void {
    if (this.modal) {
      this.modal.style.display = "none";
    }
  }

  seguirComprando(): void {
    this.cerrarModal();
    window.location.href = "/src/pages/store/home/home.html";
  }

  verPedidos(): void {
    this.cerrarModal();
    window.location.href = "/src/pages/client/orders/orders.html";
  }

  cerrarSesion(): void {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      CartService.clearCart(); 
      localStorage.removeItem("food_store_user");
      window.location.href = "/src/pages/auth/login/login.html";
    }
  }

  adjuntarEventos(): void {
    this.btnFinalizar?.addEventListener("click", () => this.finalizarCompra());
    this.btnVaciar?.addEventListener("click", () => this.vaciarCarrito());
    this.btnCerrarSesion?.addEventListener("click", () => this.cerrarSesion());

    if (this.modal) {
      this.modal.addEventListener("click", (e: Event) => {
        if (e.target === this.modal) {
          this.cerrarModal();
        }
      });
    }

    this.btnModalCerrarX?.addEventListener("click", () => this.cerrarModal());
    this.btnModalSeguir?.addEventListener("click", () => this.seguirComprando());
    this.btnModalVerPedidos?.addEventListener("click", () => this.verPedidos());
  }
}


document.addEventListener('DOMContentLoaded', () => {
    const cartApp = new CartApp();
    cartApp.inicializarApp();
});