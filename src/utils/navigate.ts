// utils/navigate.ts (VERSIÓN MEJORADA)
export const navigateTo = (path: string) => {
    // Si la ruta ya empieza con http, usarla directamente
    if (path.startsWith('http')) {
        window.location.href = path;
    } 
    // Si empieza con /, asumir que es desde la raíz del dominio
    else if (path.startsWith('/')) {
        window.location.href = `${window.location.origin}${path}`;
    }
    // Si es una ruta relativa, agregar el origen
    else {
        window.location.href = `${window.location.origin}/${path}`;
    }
};