import { type IUser } from "../types/IUser";
import type { IUserData } from "../types/IUserData";

// La URL base de tu backend Spring Boot
const API_URL = "http://localhost:8080/api/auth";

/**
 * Registra un nuevo usuario.
 * 'userData' es un objeto con los datos del formulario de registro.
 */
export const register = async (userData: IUserData): Promise<IUser> => {
    const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        // Lanza un error para que el .catch() lo reciba
        throw new Error(`Error en el registro: ${response.statusText}`);
    }

    return response.json(); // Devuelve el usuario creado (IUser)
};

/**
 * Inicia sesión.
 * 'credentials' es un objeto con { email, password }
 */
export const login = async (credentials: any): Promise<IUser> => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
    });

    if (!response.ok) { // Ej: 401 Unauthorized
        throw new Error('Email o contraseña inválidos');
    }

    // Devuelve los datos del usuario logueado (IUser)
    return response.json();
};