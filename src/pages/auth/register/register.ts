
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
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const telefonoInput = document.getElementById('telefono') as HTMLInputElement;
    const passwordVerify = document.getElementById('password-verify') as HTMLInputElement;
    const mensajeError = document.getElementById('error-message') as HTMLParagraphElement;
    const mostrarContrasena = document.getElementById('mostrar-contrasena') as HTMLInputElement;

    mostrarContrasena.checked = false;

    registerForm.addEventListener('submit', async (event) => {
        
        // Para evitar recargue y que este limpio
        event.preventDefault(); 
        mensajeError.textContent = ''

        // Crea el objeto con los datos del usuario
        const userData: IUserData = {
            nombre: nombreInput.value,
            apellido: apellidoInput.value,
            email: emailInput.value,
            telefono: telefonoInput.value,
            password: passwordInput.value
        };

        if (passwordInput.value != passwordVerify.value){
            mensajeError.textContent = "Las contraseñas no coinciden";
            return;
        }

        if (passwordInput.value.length < 6 ){
            mensajeError.textContent = "La contraseña debe tener al menos 6 caracteres";
            return;
        }

        try {
            
            const registrarUsuario = await register(userData);

            // Registro exitoso
            console.log("Usuario registrado:", registrarUsuario);
            
            //Auto-login. (Esto no se si iria  Podriamos hacer que redireccione al login)
            saveUser(registrarUsuario); 

            mensajeError.textContent = `Bienvenido, ${registrarUsuario.nombre}, serás redireccionado al home...`;
            mensajeError.style.color = 'green';

            // Luego de 2 segundos te manda al login
            setTimeout(() => {
                navigateTo('src/pages/store/home/home.html'); 
            }, 2000);

        } catch (error: any) {
            
            // Error si algun campo unico se ya esta registrado.
            console.error("Error de registro:", error);
            mensajeError.textContent = error.message || "Error al registrarse.";
        }
    });

    mostrarContrasena.addEventListener('change', () => {
       const tipo: string =  mostrarContrasena.checked ? 'text' : 'password';

       passwordInput.type = tipo;
       passwordVerify.type = tipo;
    })
});
