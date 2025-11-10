const STORE_HOME_PATH = "/src/pages/store/home/home.html";

const initializeRootRedirect = () => {
  const currentPath = window.location.pathname;

  if (currentPath === "/") {
    console.log("Redirigiendo a la página principal de la tienda...");

    window.location.replace(STORE_HOME_PATH);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initializeRootRedirect();
});
