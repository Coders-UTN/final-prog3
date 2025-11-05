import { login } from "../../../utils/auth";
import { saveUser } from "../../../utils/localStorage"; 
import { navigateTo } from "../../../utils/navigate";     
import type { IUser } from "../../../types/IUser";

document.addEventListener('DOMContentLoaded', () => {
    
    const loginForm = document.getElementById('login-form') as HTMLFormElement;
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const mensajeError = document.getElementById('error-message') as HTMLParagraphElement;

    loginForm.addEventListener('submit', async (event) => {
        
        event.preventDefault();

        mensajeError.textContent = ''; 
        const credentials = {
            email: emailInput.value,
            password: passwordInput.value
        };

        try {
            const loggedInUser: IUser = await login(credentials);

            console.log("Inicio de sesión exitoso:", loggedInUser);
            saveUser(loggedInUser); 

            if (loggedInUser && loggedInUser.id) {
                localStorage.setItem('usuarioId', loggedInUser.id.toString());
            } else {
                console.warn("El objeto 'loggedInUser' no tiene un campo 'id'. El carrito puede fallar.");
            }
            
            mensajeError.textContent = `¡Bienvenido, ${loggedInUser.nombre}!`;
            mensajeError.style.color = 'green';

            setTimeout(() => {
                navigateTo('/client/home/home.html'); 
            }, 1500); 

        } catch (error: any) {
            console.error("Error de login:", error);
            mensajeError.textContent = error.message
            mensajeError.style.color = 'red';
        }
    });
});