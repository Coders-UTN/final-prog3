import type { IErrorResponse } from "../types/IErrorResponse";
import type { IUser } from "../types/IUser";

const API_BASE_URL = "http://localhost:8080/api/usuario";
export async function buscarUsuarioLogueado(): Promise<IUser> {
    const res = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        credentials: 'include' 
    });

  if (!res.ok) {
    const errorBody: IErrorResponse = await res.json();
    throw new Error(errorBody.mensaje);
  }
    return await res.json();
}

export async function buscarUsuarioPorId(id: string) {
    const res = await fetch(`${API_BASE_URL}/${id}`)
  if (!res.ok) {
    const errorBody: IErrorResponse = await res.json();
    throw new Error(errorBody.mensaje);
  }
    return await res.json();
}

export async function getTotalClientes(): Promise<number> {
  const res = await fetch(`${API_BASE_URL}/stats/total-clientes`)
  if (!res.ok){
    const errorBody: IErrorResponse = await res.json()
    throw new Error(errorBody.mensaje)
  }
  return await res.json()
}