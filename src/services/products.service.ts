import type { IProducto, ICreateProducto } from "../types/IProduct";

const API_BASE_URL_PRODUCTOS = "http://localhost:8080/api/productos";

// Llama a: GET /api/productos
export const buscarTodosProductos = async (): Promise<IProducto[]> => {
  const response = await fetch(API_BASE_URL_PRODUCTOS);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Llama a: POST /api/productos
export const crearProducto = async (
  producto: ICreateProducto
): Promise<IProducto> => {
  const response = await fetch(API_BASE_URL_PRODUCTOS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Llama a: PUT /api/productos/{id}
export const modificarProducto = async (
  id: number,
  producto: ICreateProducto
): Promise<IProducto> => {
  const response = await fetch(`${API_BASE_URL_PRODUCTOS}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(producto),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

// Llama a: DELETE /api/productos/{id}
export const eliminarProducto = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL_PRODUCTOS}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
};

// Llama a: GET /api/productos/categoria/{id}
export const buscarProductosPorCategoria = async (id: number): Promise<IProducto[]> => {
  const response = await fetch(`${API_BASE_URL_PRODUCTOS}/categoria/${id}`);
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return await response.json();
};

// Llama a: GET /api/productos/{id}
export const buscarProductoPorId = async (id: string): Promise<IProducto> => {
  const response = await fetch(`${API_BASE_URL_PRODUCTOS}/${id}`);
  if (!response.ok) {
    throw new Error(`Error: ${response.status}`);
  }
  return await response.json();
};