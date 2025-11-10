// login.ts (CORREGIDO - Solo ADMIN/USUARIO)

import { login } from "../../../utils/auth";
import { saveUser } from "../../../utils/localStorage";
import { navigateTo } from "../../../utils/navigate";
// --- Rutas de destino ---
const ADMIN_PATH = "/src/pages/admin/products/products.html";
const CLIENT_PATH = "/src/pages/store/home/home.html";

// Espera a que el DOM esté cargado para asignar los eventos
document.addEventListener("DOMContentLoaded", () => {
  // Busca:
  const loginForm = document.getElementById("login-form") as HTMLFormElement;
  const emailInput = document.getElementById("email") as HTMLInputElement;
  const passwordInput = document.getElementById("password") as HTMLInputElement;
  const mensajeError = document.getElementById(
    "error-message"
  ) as HTMLParagraphElement;

  // Conexion formulario
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    mensajeError.textContent = "";
    const credentials = {
      email: emailInput.value,
      password: passwordInput.value,
    };

    try {
      const loggedInUser = await login(credentials);

      console.log("Inicio de sesión exitoso:", loggedInUser);
      saveUser(loggedInUser);

      mensajeError.textContent = `¡Bienvenido, ${loggedInUser.nombre}!`;
      mensajeError.style.color = "green";

      // --- LÓGICA DE REDIRECCIÓN POR ROL (SIMPLIFICADA) ---
      setTimeout(() => {
        // Compara directamente con el rol "ADMIN"
        if (loggedInUser.rol === "ADMIN") {
          navigateTo(ADMIN_PATH);
        } else {
          // Si es cualquier otro rol (asumimos USUARIO)
          navigateTo(CLIENT_PATH);
        }
      }, 1500);
    } catch (error: any) {
      console.error("Error de login:", error);
      mensajeError.textContent = error.message;
      mensajeError.style.color = "red";
    }
  });
});
