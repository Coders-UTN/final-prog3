// Importamos el 'type' para que TypeScript sepa qué guardamos
import { type IUser } from "../types/IUser";

// Definimos una clave constante para usar en localStorage
const USER_KEY = "food_store_user";

/**
 * Guarda el objeto del usuario en localStorage.
 * Esta es la función que tu login.ts necesita.
 */
export const saveUser = (user: IUser) => {
    try {
        // localStorage solo guarda strings,
        // así que convertimos el objeto a un string JSON.
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
        console.error("Error al guardar el usuario:", error);
    }
};

/**
 * Obtiene el usuario guardado de localStorage.
 */
export const getUser = (): IUser | null => {
    try {
        const userString = window.localStorage.getItem(USER_KEY);
        if (userString) {
            // Convertimos el string de vuelta a un objeto JSON
            return JSON.parse(userString) as IUser;
        }
        return null;
    } catch (error) {
        console.error("Error al obtener el usuario:", error);
        return null;
    }
};

/**
 * Elimina al usuario de localStorage (para hacer logout).
 */
export const removeUser = () => {
    try {
        window.localStorage.removeItem(USER_KEY);
    } catch (error) {
        console.error("Error al eliminar el usuario:", error);
    }
};