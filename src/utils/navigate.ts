/**
 * Redirige al usuario a una nueva página dentro del sitio.
 * @param path - La ruta a la que se quiere navegar (ej. "/client/home/home.html")
 */
export const navigateTo = (path: string) => {
    // window.location.origin nos da la base (ej. "http://localhost:5173")
    // y le sumamos la ruta que queremos.
    window.location.href = `${window.location.origin}${path}`;
};