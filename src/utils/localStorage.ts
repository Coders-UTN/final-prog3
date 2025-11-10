// Importamos el 'type' para que TypeScript sepa qué guardamos
import { type IUser } from "../types/IUser";

const USER_KEY = "food_store_user";

export const saveUser = (user: IUser) => {
  try {
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error al guardar el usuario:", error);
  }
};

export const getUser = (): IUser | null => {
  try {
    const userString = window.localStorage.getItem(USER_KEY);
    if (userString) {
      return JSON.parse(userString) as IUser;
    }
    return null;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    return null;
  }
};

export const removeUser = () => {
  try {
    window.localStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
  }
};
