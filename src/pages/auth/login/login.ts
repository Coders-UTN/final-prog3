import { login } from "../../../utils/auth";
import { saveUser } from "../../../utils/localStorage"; 
import { navigateTo } from "../../../utils/navigate";     

// Espera a que el DOM esté cargado para asignar los eventos
document.addEventListener('DOMContentLoaded', () => {
    
    // Busca:

    // "login-form" 
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    
    // inputs
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    
    // p error: 
    const mensajeError = document.getElementById('error-message') as HTMLParagraphElement;

    // Conexion formulario
    loginForm.addEventListener('submit', async (event) => {
        
        event.preventDefault();  //Evita que se recargue la pagina (no tocar)

        mensajeError.textContent = ''; //Limpia errores previos
        const credentials = {
            email: emailInput.value,
            password: passwordInput.value
        };

        try {
            // Intenta hacer login
            const loggedInUser = await login(credentials);

            // Si ta todo ok:
            console.log("Inicio de sesión exitoso:", loggedInUser);
            saveUser(loggedInUser); 
            
            mensajeError.textContent = `¡Bienvenido, ${loggedInUser.nombre}!`;
            mensajeError.style.color = 'green';

            setTimeout(() => {
                navigateTo('/client/home/home.html'); 
            }, 1500); 

        } catch (error: any) {
            // si no: 
            console.error("Error de login:", error);
            mensajeError.textContent = error.mensaje || "Error al iniciar sesión.";
            mensajeError.style.color = 'red';
        }
    });
});