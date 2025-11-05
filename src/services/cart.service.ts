import type { IProducto } from "../types/IProduct";
import type { ICartItem } from "../types/ICart";

const API_PEDIDOS_URL = 'http://localhost:8080/api/pedidos';
const CART_KEY = 'miCarrito';

function getCart(): ICartItem[] {
    const cartStr = localStorage.getItem(CART_KEY);
    return cartStr ? JSON.parse(cartStr) : [];
}

function saveCart(cart: ICartItem[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
}

export function addToCart(producto: IProducto, quantity: number = 1): void {
    const cart = getCart();
    const existingItem = cart.find(item => item.productoId === producto.id);

    if (existingItem) {
        existingItem.cantidad += quantity;
    } else {
        cart.push({
            productoId: producto.id,
            cantidad: quantity,
            nombre: producto.nombre,
            precio: producto.precio
        });
    }
    saveCart(cart);
}

export function clearCart(): void {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event('cartUpdated'));
}

export function getCartItems(): ICartItem[] {
    return getCart();
}

export async function finalizePurchase(): Promise<any> {
    const cart = getCart();
    
    const usuarioIdStr = localStorage.getItem('usuarioId'); 

    if (!usuarioIdStr) {
        alert("Error: Debes iniciar sesión para poder comprar.");
        throw new Error("Usuario no logueado");
    }

    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        throw new Error("Carrito vacío");
    }

    const createPedidoDTO = {
        usuarioId: parseInt(usuarioIdStr),
        items: cart.map(item => ({
            productoId: item.productoId,
            cantidad: item.cantidad
        }))
    };

    try {
        const response = await fetch(API_PEDIDOS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(createPedidoDTO)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Error al crear el pedido");
        }

        const pedidoCreado = await response.json();
        clearCart();
        return pedidoCreado;

    } catch (error) {
        console.error("Error en finalizePurchase:", error);
        throw error;
    }
}