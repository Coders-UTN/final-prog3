import * as CartService from "../../../services/cart.service";
import type { ICartItem } from "../../../types/ICart";

class CartComponent {

    itemsListEl: HTMLElement | null;
    totalEl: HTMLElement | null;
    modalEl: HTMLElement | null;

    constructor() {
        this.itemsListEl = document.getElementById("lista-items-carrito");
        this.totalEl = document.getElementById("carrito-total");
        this.modalEl = document.getElementById("modal-carrito");
        
        if (this.itemsListEl) {
            this.inicializarCarrito();
            this.adjuntarEventos();
        }
    }

    inicializarCarrito(): void {
        this.renderizarItemsCarrito();
        window.addEventListener('cartUpdated', () => {
            this.renderizarItemsCarrito();
        });
    }

    renderizarItemsCarrito(): void {
        if (!this.itemsListEl || !this.totalEl) return;
        
        const carrito = CartService.getCartItems();
        this.itemsListEl.innerHTML = ""; 
        let totalCalculado = 0;

        if (carrito.length === 0) {
            this.itemsListEl.innerHTML = "<li>Tu carrito está vacío.</li>";
        } else {
            carrito.forEach((item: ICartItem) => {
                const li = document.createElement('li');
                li.textContent = `${item.cantidad}x ${item.nombre} - $${(item.precio * item.cantidad).toFixed(2)}`;
                this.itemsListEl!.appendChild(li);
                totalCalculado += item.precio * item.cantidad;
            });
        }
        
        this.totalEl.textContent = `Total: $${totalCalculado.toFixed(2)}`;
    }

    cerrarModal(): void {
        if (this.modalEl) {
            this.modalEl.style.display = 'none';
        }
    }

    adjuntarEventos(): void {
        const btnFinalizar = document.getElementById('btn-finalizar-compra');
        if (btnFinalizar) {
            btnFinalizar.addEventListener('click', async () => {
                try {
                    await CartService.finalizePurchase();
                    alert("¡Pedido realizado con éxito!");
                    this.cerrarModal();
                } catch (error: any) {
                    alert(`Error al finalizar la compra:\n${error.message}`);
                }
            });
        }
        
        const btnVaciar = document.getElementById('btn-vaciar-carrito');
        if (btnVaciar) {
            btnVaciar.addEventListener('click', () => {
                if (confirm("¿Vaciar el carrito?")) {
                    CartService.clearCart();
                }
            });
        }

        const btnCerrar = document.getElementById('btn-cerrar-modal-carrito');
        if (btnCerrar) {
            btnCerrar.addEventListener('click', () => this.cerrarModal());
        }

        const btnCancelar = document.getElementById('btn-cerrar-modal-cancelar');
        if (btnCancelar) {
            btnCancelar.addEventListener('click', () => this.cerrarModal());
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CartComponent();
});