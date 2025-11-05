export interface IOrderItem {
    id: number;
    cantidad: number;
    productoId: number;
    nombreProducto: string;
    precioUnitario: number;
    subtotal: number;
}

export interface IOrder {
    id: number;
    fecha: string; 
    estado: "PENDIENTE" | "CONFIRMADO" | "TERMINADO" | "CANCELADO";
    total: number;
    detallePedidoDTO: IOrderItem[];
    usuarioId: number;
    usuarioNombre: string;
}