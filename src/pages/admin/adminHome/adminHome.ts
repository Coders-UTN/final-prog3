import { cerrarSesion } from "../../../utils/auth";

class AdminApp{
    botonCerrarSesion : HTMLButtonElement | null;

    constructor(){
        this.botonCerrarSesion = document.getElementById("boton-cerrar-sesion") as HTMLButtonElement;
    }

    inicializar(): void {
        this.adjuntarEventos();
    }

    adjuntarEventos(): void{
        this.botonCerrarSesion?.addEventListener("click", () => cerrarSesion())
    }
}

const homeApp: AdminApp = new AdminApp();
homeApp.inicializar() ;