// src/main.ts (CORREGIDO - Solo ADMIN/USUARIO)

import { isLoggedIn } from "./utils/auth";
import { navigateTo } from "./utils/navigate";
import { getUser } from "./utils/localStorage"; // <-- Necesitas esta función

// --- Rutas de destino ---
const ADMIN_PATH = '/src/pages/admin/products/products.html'; 
const CLIENT_PATH = '/src/pages/client/home/home.html'; 
const LOGIN_PATH = '/src/pages/auth/login/login.html'; 

// Función que inyecta el HTML del Login
const renderLoginView = () => {
    const appRoot = document.getElementById('app');
    if (appRoot) {
        appRoot.innerHTML = '';
        
        // Redirecciona al login si no está allí
        if (!window.location.pathname.endsWith(LOGIN_PATH)) {
             console.log('Usuario no autenticado, redirigiendo a login.');
             window.location.replace(LOGIN_PATH); 
             return;
        }
    }
};

// Función de redirección condicional basada en el rol
const renderAdminPanel = (userRole: string) => {
    
    // CORRECCIÓN CLAVE: Lógica de redirección basada en el rol
    if (userRole === 'ADMIN') {
        console.log('Usuario ADMIN autenticado. Redirigiendo al panel de productos.');
        navigateTo(ADMIN_PATH);
    } else {
        // Si es USUARIO (o cualquier otro rol que no sea ADMIN)
        console.log('Usuario CLIENTE autenticado. Redirigiendo a la interfaz de cliente.');
        navigateTo(CLIENT_PATH);
    }
};

// --- FUNCIÓN DE INICIALIZACIÓN ASÍNCRONA ---
const initializeApp = async () => {
    
    const estaLogueado = await isLoggedIn(); 
    const usuario = getUser(); // Obtener el objeto de usuario para el rol

    if (estaLogueado && usuario) {
        // Si está logueado, redirige según el rol
        renderAdminPanel(usuario.rol);
    } else {
        // Si no está logueado, redirige al Login
        renderLoginView(); 
    }
};


// Lógica de Inicialización de la Aplicación
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});