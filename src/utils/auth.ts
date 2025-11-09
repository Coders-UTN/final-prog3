// auth.ts

import type { IUser, Rol } from "../types/IUser";
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
export const isLoggedIn =  (): IUser | null => {
    const storedUser = localStorage.getItem('food_store_user');
    if (!storedUser) {
        return null;
    }

    const user:IUser = JSON.parse(storedUser);

    const usuario: Rol = "USUARIO";
    const admin: Rol = "ADMIN"
   if ( user.activo && (user.rol == usuario || user.rol == admin) ) {
        return user;
    }
    
    return null;
};

export const isAdminUser = (): boolean => {
      const storedUser = localStorage.getItem('food_store_user');
    if (!storedUser) {
        return false;
    }

    const user:IUser = JSON.parse(storedUser);

    const admin: Rol = "ADMIN"
   if ( user.activo && user.rol == admin )  {
        return true
    }
    
    return false;
}

export const cerrarSesion = ():void =>{
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("food_store_user");
      window.location.href = "/src/pages/store/home/home.html";
    }
  }