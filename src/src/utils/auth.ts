// auth.ts

import { type IUser } from "../types/IUser";
import type { IUserData } from "../types/IUserData";

// La URL base de tu backend Spring Boot
const API_URL = "http://localhost:8080/api/auth";

// --- 1. REGISTRO ---

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

// --- 2. INICIO DE SESIÓN ---

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

    // Devuelve los datos del usuario logueado (IUser), incluyendo el token JWT.
    return response.json();
};

// --- 3. VERIFICACIÓN DE SESIÓN ---

/**
 * Verifica si el usuario tiene un token de sesión válido almacenado.
 * Se asume que el token y datos del usuario están en localStorage bajo la clave 'user_data'.
 */
export const isLoggedIn = async (): Promise<boolean> => {
    // 1. Obtener los datos del usuario almacenados en localStorage
    const storedUser = localStorage.getItem('user_data');
    if (!storedUser) {
        return false;
    }
    
    let token: string;
    try {
        // Asumimos que los datos parseados tienen una propiedad 'token'
        const userData: IUser = JSON.parse(storedUser); 
        if (!userData.token) { 
            return false;
        }
        token = userData.token;
    } catch (e) {
        // Fallo al parsear el JSON
        return false; 
    }

    // 2. Si no hay token, no está logueado
    if (!token) {
        return false;
    }

    // 3. Validar el token contra el servidor (Backend Spring Boot)
    try {
        // El backend debe tener un endpoint '/validate' para verificar el JWT
        const response = await fetch(`${API_URL}/validate`, { 
            method: 'POST',
            headers: {
                // Envía el token en el encabezado Authorization
                'Authorization': `Bearer ${token}` 
            }
        });

        // El backend devuelve 200 OK si el token es válido
        return response.ok; 

    } catch (error) {
        console.error("Error de red durante la validación del token:", error);
        return false;
    }
};