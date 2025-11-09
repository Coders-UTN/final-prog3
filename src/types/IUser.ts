export type Rol = "USUARIO" | "ADMIN";

export interface IUser {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular: number;
  rol: Rol;
  activo: boolean;
}

