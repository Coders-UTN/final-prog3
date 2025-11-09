export interface IItemPedido {
    id: number,
    cantidad: number,
    productoId: number,
    nombreProducto: string,
    precioUnitario: number,
    subtotal: number
}

export type IEstadoPedido = 'PENDIENTE' | 'CONFIRMADO' | 'TERMINADO' | 'CANCELADO';

export interface IPedido {
    id: number,
    fecha: string,
    estado: IEstadoPedido,
    total: number,
    detallePedidoDTO: IItemPedido[],
    usuarioId: number,
    usuarioNombre: string
}

export interface CreateItemPedido {
    productoId: number;
    cantidad: number
}

export interface CreatePedido {
    usuarioId: number;
    items: CreateItemPedido[];
}