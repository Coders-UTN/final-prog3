export type Rol = "USUARIO" | "ADMIN"; // O como se llame en tu enum Rol.java

export interface UsuarioDTO {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  celular: string;
  rol: Rol;
  activo: boolean;
}

export interface AuthResponse {
  token: string;
  usuarioDTO: UsuarioDTO; 
}