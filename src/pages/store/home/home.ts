import * as ProductService from "../../../services/products.service";
import * as CartService from "../../../services/cart.service";
import type { IProducto } from "../../../types/IProduct";

const IMAGEN_DEFAULT = "/assets/img/generic-food.png";

class HomeComponent {
    
    listaProductosEl: HTMLElement | null;
    carritoResumenEl: HTMLElement | null;

    constructor() {
        this.listaProductosEl = document.getElementById("lista-productos");
        this.carritoResumenEl = document.getElementById("carrito-cantidad");
        
        if (this.listaProductosEl) {
            this.inicializarHome();
            this.adjuntarEventosBase();
        }
    }

    async inicializarHome(): Promise<void> {
        await this.cargarProductos();
        this.actualizarResumenCarrito();
        
        window.addEventListener('cartUpdated', () => {
            this.actualizarResumenCarrito();
        });
    }

    async cargarProductos(): Promise<void> {
        try {
            const productos = await ProductService.buscarTodosProductos();
            this.renderizarProductos(productos);
        } catch (error) {
            console.error("Error al cargar productos:", error);
            if (this.listaProductosEl) {
                this.listaProductosEl.innerHTML = "<p>Error al cargar productos.</p>";
            }
        }
    }

    renderizarProductos(productos: IProducto[]): void {
        if (!this.listaProductosEl) return;
        this.listaProductosEl.innerHTML = ""; 

        productos.forEach(prod => {
            const card = document.createElement('div');
            card.className = 'producto-card';
            card.innerHTML = `
                <img src="${prod.imagen || IMAGEN_DEFAULT}" alt="${prod.nombre}">
                <h3>${prod.nombre}</h3>
                <p>${prod.descripcion}</p>
                <p>Precio: $${prod.precio.toFixed(2)}</p>
                <p>Stock: ${prod.stock}</p>
                <button class="btn-agregar-carrito">Agregar al Carrito</button>
            `;

            card.querySelector('.btn-agregar-carrito')?.addEventListener('click', () => {
                if (prod.stock > 0) {
                    alert(`"${prod.nombre}" agregado al carrito!`);
                    CartService.addToCart(prod, 1);
                } else {
                    alert("Producto sin stock.");
                }
            });
            
            this.listaProductosEl.appendChild(card);
        });
    }

    actualizarResumenCarrito(): void {
        const carrito = CartService.getCartItems();
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        
        if (this.carritoResumenEl) {
            this.carritoResumenEl.textContent = totalItems.toString();
        }
    }
    
    adjuntarEventosBase(): void {
        const btnVerCarrito = document.getElementById("btn-ver-carrito");
        if (btnVerCarrito) {
            btnVerCarrito.addEventListener("click", () => {
                // (Asumo que el modal del carrito está en home.html)
                const modalCarrito = document.getElementById("modal-carrito");
                if (modalCarrito) {
                    modalCarrito.style.display = 'flex';
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new HomeComponent();
});