import type { IUser } from "../types/IUser";

const API_BASE_URL = "http://localhost:8080/api/usuario";
export async function buscarUsuarioLogueado(): Promise<IUser> {
    const res = await fetch(`${API_BASE_URL}/me`, {
        method: 'GET',
        credentials: 'include' 
    });

    if (!res.ok){
        throw new Error("No se pudieron obtener los datos del usuario")
    }
    return await res.json();
}

export async function buscarUsuarioPorId(id: string) {
    const res = await fetch(`${API_BASE_URL}/${id}`)
    if (!res.ok) {
        throw new Error("No se pudieron obtener los datos del usuario")
    }
    return await res.json();
}