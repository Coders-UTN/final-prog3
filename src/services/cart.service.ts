
import type { IProducto } from "../types/IProduct";
import type { ItemCarrito } from "../types/ICart";
import type { CreatePedido } from "../types/IPedido";
import type { IUser } from "../types/IUser";

const CART_KEY = 'carrito'; 
const API_BASE_URL_PEDIDOS = "http://localhost:8080/api/pedidos";


function getUsuarioLogueado(): IUser | null {
    const userData = localStorage.getItem("food_store_user");
    return userData ? (JSON.parse(userData) as IUser) : null;
}

function saveCart(cart: ItemCarrito[]): void {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    // Notificar al header (o a cualquier otro componente) que el carrito cambió
    window.dispatchEvent(new Event('cartUpdated')); 
}

export function getCartItems(): ItemCarrito[] {
    const cartStr = localStorage.getItem(CART_KEY);
    return cartStr ? JSON.parse(cartStr) : [];
}

export function addToCart(producto: IProducto, quantity: number = 1): void {
    const cart = getCartItems();
    const existingItem = cart.find(item => item.producto.id === producto.id);

    if (existingItem) {
        existingItem.cantidad += quantity;
        existingItem.subtotal = existingItem.producto.precio * existingItem.cantidad;
    } else {
        cart.push({
            producto: producto,
            cantidad: quantity,
            subtotal: producto.precio * quantity
        });
    }
    saveCart(cart);
}

export function updateItemQuantity(productoId: number, newQuantity: number): ItemCarrito[] {
    const cart = getCartItems();
    const itemIndex = cart.findIndex(item => item.producto.id === productoId);

    if (itemIndex > -1) {
        if (newQuantity > 0 && newQuantity <= cart[itemIndex].producto.stock) {
            cart[itemIndex].cantidad = newQuantity;
            cart[itemIndex].subtotal = cart[itemIndex].producto.precio * newQuantity;
        } else if (newQuantity === 0) {
            cart.splice(itemIndex, 1);
        }
    }
    saveCart(cart);
    return cart; 
}

export function removeItemFromCart(productoId: number): ItemCarrito[] {
    let cart = getCartItems();
    cart = cart.filter(item => item.producto.id !== productoId);
    saveCart(cart);
    return cart; 
}

export function clearCart(): void {
    localStorage.removeItem(CART_KEY);
    window.dispatchEvent(new Event('cartUpdated'));
}


export async function finalizePurchase(): Promise<any> {
    const cart = getCartItems();
    const usuario = getUsuarioLogueado();

    if (!usuario || !usuario.id) {
        alert("Error: Debes iniciar sesión para poder comprar.");
        throw new Error("Usuario no logueado");
    }
    if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        throw new Error("Carrito vacío");
    }

    const pedidoRequest: CreatePedido = {
        usuarioId: usuario.id,
        items: cart.map((item) => ({
            productoId: item.producto.id,
            cantidad: item.cantidad,
        })),
    };

    const response = await fetch(API_BASE_URL_PEDIDOS, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedidoRequest),
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.message || "Error al procesar la compra."); 
        throw new Error(errorData.message || "Error al crear pedido");
    }

    const pedidoCreado = await response.json();
    clearCart(); 
    return pedidoCreado;
}