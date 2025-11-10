import { buscarUsuarioLogueado } from '../../../services/user.service';
import { isLoggedIn, cerrarSesion, isAdminUser } from '../../../utils/auth';
import { navigateTo } from '../../../utils/navigate';
import * as CartService from '../../../services/cart.service';
import type { IUser } from '../../../types/IUser';

class ProfileApp {
    nombreUsuarioEl: HTMLElement | null;
    infoUsuarioContenedor: HTMLElement | null;
    btnCerrarSesion: HTMLButtonElement | null;
    linkAdmin: HTMLAnchorElement | null;
    contadorCarrito: HTMLElement | null;

    spanNombre: HTMLElement | null;
    spanApellido: HTMLElement | null;
    spanEmail: HTMLElement | null;
    spanTelefono: HTMLElement | null;
    layoutContenedor: HTMLElement | null; 

    constructor() {        
        this.nombreUsuarioEl = document.getElementById('nombre-usuario');
        this.infoUsuarioContenedor = document.getElementById('info-usuario');
        this.btnCerrarSesion = document.getElementById('btn-cerrar-sesion') as HTMLButtonElement;
        this.linkAdmin = document.getElementById('link-admin') as HTMLAnchorElement;
        this.contadorCarrito = document.getElementById('contador-carrito-header');

        this.spanNombre = document.getElementById('nombre');
        this.spanApellido = document.getElementById('apellido');
        this.spanEmail = document.getElementById('email');
        this.spanTelefono = document.getElementById('telefono');
        this.layoutContenedor = document.querySelector('.pagina-perfil__layout-simple');
    }

    async inicializar(): Promise<void> {
        // 1. ¡Guardia de Ruta!
        // Esta es una página protegida. Si no hay login, redirige.
        if (!isLoggedIn()) {
            alert("Debes iniciar sesión para ver tu perfil.");
            navigateTo('/src/pages/auth/login/login.html');
            return;
        }

        // 2. Si está logueado, configuramos la UI estática
        this.setupHeader();
        this.adjuntarEventosEstaticos();
        this.actualizarContadorCarrito();

        // 3. Cargamos los datos dinámicos (el perfil)
        await this.cargarDatosUsuario();
    }

    /**
     * Configura el header para un usuario logueado
     */
    setupHeader(): void {
        const usuario = JSON.parse(localStorage.getItem("food_store_user")!) as IUser;
        
        this.infoUsuarioContenedor?.classList.remove('oculto');
        
        if (this.nombreUsuarioEl) {
            this.nombreUsuarioEl.textContent = `Bienvenid@ ${usuario.nombre}`;
        }

        if (isAdminUser() && this.linkAdmin) {
            this.linkAdmin.classList.remove('oculto');
        }
    }
    

    adjuntarEventosEstaticos(): void {
        this.btnCerrarSesion?.addEventListener('click', () => cerrarSesion());
    }

    actualizarContadorCarrito(): void {
        if (!this.contadorCarrito) return;
        const carrito = CartService.getCartItems();
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        this.contadorCarrito.textContent = totalItems.toString();
    }


    async cargarDatosUsuario(): Promise<void> {
        try {
            const usuario: IUser = await buscarUsuarioLogueado();
            console.log(usuario);
            
            this.renderizarDatos(usuario);

        } catch (error) {
            console.error("Error al cargar datos del perfil:", error);
            this.mostrarError("No se pudieron cargar tus datos. Intenta recargar la página.");
        }
    }


    renderizarDatos(usuario: IUser): void {
        if (this.spanNombre) {
            this.spanNombre.textContent = usuario.nombre;
            this.spanNombre.classList.remove('cargando');
        }
        if (this.spanApellido) {
            this.spanApellido.textContent = usuario.apellido;
            this.spanApellido.classList.remove('cargando');
        }
        if (this.spanEmail) {
            this.spanEmail.textContent = usuario.email;
            this.spanEmail.classList.remove('cargando');
        }
        if (this.spanTelefono) {
            this.spanTelefono.textContent = (usuario.celular) ? usuario.celular.toString() : "Sin telefono";
            this.spanTelefono.classList.remove('cargando');
        }
    }


    mostrarError(mensaje: string): void {
        if (this.layoutContenedor) {
            this.layoutContenedor.innerHTML = `
                <div class="tarjeta-perfil" style="text-align: center; color: #e53e3e;">
                    ${mensaje}
                </div>
            `;
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const app = new ProfileApp();
    app.inicializar();
});