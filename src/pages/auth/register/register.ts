
import type { IUserData } from "../../../types/IUserData";
import { register } from "../../../utils/auth";
import { saveUser } from "../../../utils/localStorage"; 
import { navigateTo } from "../../../utils/navigate";     

// Espera a que el DOM esté cargado para asignar los eventos

document.addEventListener('DOMContentLoaded', () => {
    
    
    const registerForm = document.getElementById('register-form') as HTMLFormElement;
    
    const nombreInput = document.getElementById('nombre') as HTMLInputElement;
    
    const apellidoInput = document.getElementById('apellido') as HTMLInputElement;
    
    const emailInput = document.getElementById('email') as HTMLInputElement;
    
    const celularInput = document.getElementById('celular') as HTMLInputElement;
    
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    
    // Elemento errores
    const mensajeError = document.getElementById('error-message') as HTMLParagraphElement;

    // Conectarse al evento 'submit'
    registerForm.addEventListener('submit', async (event) => {
        
        // Para evitar recargue y que este limpio
        event.preventDefault(); 
        mensajeError.textContent = ''

        // Crea el objeto con los datos del usuario
        const userData: IUserData = {
            nombre: nombreInput.value,
            apellido: apellidoInput.value,
            email: emailInput.value,
            celular: parseInt(celularInput.value, 10), 
            password: passwordInput.value
            
        };

        try {
            
            const registrarUsuario = await register(userData);

            // Registro exitoso
            console.log("Usuario registrado:", registrarUsuario);
            
            //Auto-login. (Esto no se si iria  Podriamos hacer que redireccione al login)
            saveUser(registrarUsuario); 

            mensajeError.textContent = `¡Registro exitoso! Bienvenido, ${registrarUsuario.nombre}.`;
            mensajeError.style.color = 'green';

            // Luego de 2 segundos te manda al inicio
            setTimeout(() => {
                navigateTo('/client/home/home.html'); 
            }, 2000);

        } catch (error: any) {
            
            // Error si algun campo unico se ya esta registrado.
            console.error("Error de registro:", error);
            mensajeError.textContent = error.message || "Error al registrarse.";
            mensajeError.style.color = 'red';
        }
    });
});
