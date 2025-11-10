import type { IProducto } from "./IProduct";

export interface ItemCarrito {
  producto: IProducto;
  cantidad: number;
  subtotal: number;
}