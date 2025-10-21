import { type Rol } from "./Rol";
export interface IUser {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    celular: number;
    rol: Rol; }