export interface IProducto {
    id: number;
    nombre: string;
    descripcion: string;
    imagen: string;
    precio: number;
    stock: number;
    categoriaid: number; // El ID que viene del backend
    categoriaNombre?: string; // El nombre que calculamos en el frontend
}

export interface ICreateProducto {
    nombre: string;
    descripcion: string;
    imagen: string;
    precio: number;
    stock: number;
    categoriaid: number;
}