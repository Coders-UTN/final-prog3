import { type ICategoria, type ICreateCategoria } from "../types/ICategoria";
import type { IErrorResponse } from "../types/IErrorResponse";
const API_BASE_URL = "http://localhost:8080/api/categorias";

export async function crearCategoria(
  datos: ICreateCategoria
): Promise<ICategoria> {
  const res = await fetch(API_BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    const errorBody: IErrorResponse = await res.json();
    throw new Error(errorBody.mensaje);
  }
  return await res.json();
}

export async function buscarTodasCategorias(): Promise<ICategoria[]> {
  const res = await fetch(API_BASE_URL);

  if (!res.ok) {
    const errorBody: IErrorResponse = await res.json();
    throw new Error(errorBody.mensaje);
  }
  return await res.json();
}

export async function buscarCategoriaId(id: number): Promise<ICategoria> {
  const url = `${API_BASE_URL}/${id}`;

  const res = await fetch(url);

  if (!res.ok) {
    const errorBody: IErrorResponse = await res.json();
    throw new Error(errorBody.mensaje);
  }

  return await res.json();
}

export async function buscarCategoriaNombre(
  nombre: string
): Promise<ICategoria> {
  const url = `${API_BASE_URL}/nombre/${nombre}`;

  const res = await fetch(url);

  if (!res.ok) {
    const errorBody: IErrorResponse = await res.json();
    throw new Error(errorBody.mensaje);
  }

  return await res.json();
}

export async function modificarCategoria(
  id: number,
  datos: ICreateCategoria
): Promise<ICategoria> {
  const url = `${API_BASE_URL}/${id}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });

  if (!res.ok) {
    const errorBody: IErrorResponse = await res.json();
    throw new Error(errorBody.mensaje);
  }
  return await res.json();
}

export async function eliminarCategoria(id: number) {
  const url = `${API_BASE_URL}/${id}`;

  const res = await fetch(url, {
    method: "DELETE",
  });

  if (!res.ok) {
    const errorBody: IErrorResponse = await res.json();
    throw new Error(errorBody.mensaje);
  }
}
