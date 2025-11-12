// auth.ts

import type { IUser, Rol } from "../types/IUser";
import type { IUserData } from "../types/IUserData";
import { navigateTo } from "./navigate";

const API_URL = "http://localhost:8080/api/auth";

export const register = async (userData: IUserData): Promise<IUser> => {
  const response = await fetch(`${API_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    throw new Error(`Error en el registro: ${response.statusText}`);
  }

  return response.json();
};

export const login = async (credentials: any): Promise<IUser> => {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error("Email o contraseña inválidos");
  }

  return response.json();
};

export const isLoggedIn = (): IUser | null => {
  const storedUser = localStorage.getItem("food_store_user");
  if (!storedUser) {
    return null;
  }

  const user: IUser = JSON.parse(storedUser);

  const usuario: Rol = "USUARIO";
  const admin: Rol = "ADMIN";
  if (user.activo && (user.rol == usuario || user.rol == admin)) {
    return user;
  }
  navigateTo("/src/pages/store/home/home.html");
  return null;
};

export const isAdminUser = (): boolean => {
  const storedUser = localStorage.getItem("food_store_user");
  if (!storedUser) {
    return false;
  }

  const user: IUser = JSON.parse(storedUser);
  
  const admin: Rol = "ADMIN";
  if (user.activo && user.rol == admin) {
    return true;
  }

  return false;
};

export const cerrarSesion = (): void => {
  if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
    localStorage.removeItem("food_store_user");
    window.location.href = "/src/pages/store/home/home.html";
  }
};
