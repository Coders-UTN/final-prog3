
document.addEventListener('DOMContentLoaded', () => {
   const nombre = document.getElementById('nombre') as HTMLInputElement | null;
   const email = document.getElementById('email') as HTMLInputElement | null;
   const password = document.getElementById('password') as HTMLInputElement | null;
   const botonRegistro= document.getElementById('boton-registro') as HTMLButtonElement;

   botonRegistro?.addEventListener('click', () => {
    if (!password) {
        alert("Falta completar la contraseña");
        return;
    }
    if (password.value.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres de largo");
        return;
    }
    console.log(nombre?.value);
    console.log(email?.value);  
   })
});