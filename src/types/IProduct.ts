export interface IProducto {
    id: number;
    nombre: string;
    precio: number; 
    categoriaid: number;
    categoriaNombre: string,
    stock : number,
    descripcion : string,
    imagen: string
}

export interface ICreateProducto {
    nombre : string,
    precio : number,
    categoriaid: number,
    stock : number,
    descripcion : string,
    imagen: string
}