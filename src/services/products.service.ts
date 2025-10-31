import type { ICreateProducto, IProducto } from "../types/IProduct";
const API_BASE_URL = "http://localhost:8080/api/productos";

export async function crearProducto(
  datos: ICreateProducto
): Promise<IProducto> {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    throw new Error("No se pudo crear la categoria");
  }
  return await res.json();
}

export async function buscarTodosProductos(): Promise<IProducto[]> {
  const res = await fetch(API_BASE_URL);

  if (!res.ok) {
    throw new Error("No se pudieron cargar las categoria");
  }
  return await res.json();
}

export async function buscarProductoId(id: number) {
  const url = `${API_BASE_URL}/${id}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `No se pudo encontrar la categoría con id ${id}. Status: ${res.status}`
    );
  }

  return await res.json();
}

export async function buscarProductoNombre(nombre: string) {
  const url = `${API_BASE_URL}/nombre/${nombre}`;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `No se pudo encontrar la categoría con nombre ${nombre}. Status: ${res.status}`
    );
  }

  return await res.json();
}

export async function modificarProducto(
  id: number,
  datos: ICreateProducto
): Promise<IProducto> {
  const url = `${API_BASE_URL}/${id}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    throw new Error("No se pudo modificar la categoria");
  }
  return await res.json();
}

export async function eliminarProducto(id: number) {
  const url = `${API_BASE_URL}/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(
      `No se pudo eliminar la categoría con id ${id}. Status: ${res.status}`
    );
  }
}
