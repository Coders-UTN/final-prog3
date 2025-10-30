const API_BASE_URL = 'http://localhost:8080/api/categorias';
// Estructura de datos de una Categoría (la misma)
interface Categoria {
    id: number;
    imagen: string; 
    nombre: string;
    descripcion: string;
}

class ComponenteCategorias { // INICIO DE LA CLASE
    categorias: Categoria[] = [
        { id: 1, imagen: 'ruta/a/imagen_hamburguesa.jpg', nombre: 'Hamburguesas', descripcion: 'Diferentes hamburguesas de tipo smash' }
    ];

    modal: HTMLElement | null;
    formulario: HTMLFormElement | null;
    tablaCuerpo: HTMLElement | null;
    
    constructor() {
        console.log('Componente de Categorías cargado.');
        this.modal = document.getElementById('modal-categoria');
        this.formulario = document.getElementById('formulario-categoria') as HTMLFormElement;
        this.tablaCuerpo = document.querySelector('.tarjeta table tbody');

        this.cargarCategorias();
        this.adjuntarEventos();
    }
    
    async cargarCategorias(): Promise<void> {
        try {
            const response = await fetch(API_BASE_URL);
            
            // Verifica si la respuesta es exitosa (código 200-299)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Convierte la respuesta a JSON
            this.categorias = await response.json(); 
            
            // Dibuja la tabla con los datos del backend
            this.renderizarCategorias();
        } catch (error) {
            console.error("Error al cargar las categorías:", error);
            alert("No se pudieron cargar las categorías desde el servidor.");
        }
    }

    // --- MÉTODOS DE RENDERIZADO ---
    renderizarCategorias(): void {
        if (!this.tablaCuerpo) return;

        this.tablaCuerpo.innerHTML = '';

        this.categorias.forEach(cat => {
            const row = this.crearFilaCategoria(cat);
            this.tablaCuerpo!.appendChild(row);
        });
    }

    crearFilaCategoria(cat: Categoria): HTMLTableRowElement {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="col-id">${cat.id}</td>
            <td class="col-imagen">
                <img src="${cat.imagen}" alt="${cat.nombre}" class="img-categoria">
            </td>
            <td>${cat.nombre}</td>
            <td>${cat.descripcion}</td>
            <td class="col-acciones">
                <button class="btn-editar" data-id="${cat.id}" onclick="categoriasApp.manejarEditar(${cat.id})">Editar</button>
                <button class="btn-eliminar" data-id="${cat.id}" onclick="categoriasApp.manejarEliminar(${cat.id})">Eliminar</button>
            </td>
        `;
        return row;
    }

    // --- MÉTODOS DE MODAL Y FORMULARIO ---
    manejarNuevaCategoria(): void {
        if (this.modal) {
            this.modal.style.display = 'flex';
            
            // Al abrir el modal, reiniciamos el título y el botón por si estaba en modo Edición
            document.querySelector('.modal-encabezado h3')!.textContent = `Nueva Categoría`;
            (document.querySelector('.btn-guardar') as HTMLButtonElement).textContent = 'Guardar Categoría';
        }
    }

    cerrarModal(): void {
        if (this.modal) {
            this.modal.style.display = 'none';
            if (this.formulario) {
                this.formulario.reset();
            }
            // Asegura que, al cerrar, el formulario vuelva a escuchar el método de CREACIÓN original
            this.adjuntarEventos(); 
        }
    }

async guardarCategoria(event: Event): Promise<void> {
    event.preventDefault();

    if (this.formulario) {
        const nuevoNombre = (document.getElementById('nombre-categoria') as HTMLInputElement).value;
        const nuevaDescripcion = (document.getElementById('descripcion-categoria') as HTMLTextAreaElement).value;
        const nuevaImagen = (document.getElementById('imagen-categoria') as HTMLInputElement).value || 'ruta/a/imagen_por_defecto.jpg';
        
        // Objeto de datos a enviar a Spring Boot (JSON)
        const nuevaCategoriaData = {
            nombre: nuevoNombre,
            descripcion: nuevaDescripcion,
            imagen: nuevaImagen // Asegúrate que estos nombres coincidan con tu clase Java
        };

        try {
            const response = await fetch(API_BASE_URL, {
                method: 'POST', // Tipo de petición
                headers: {
                    'Content-Type': 'application/json' // Indicamos que enviamos JSON
                },
                body: JSON.stringify(nuevaCategoriaData) // Convertimos el objeto a JSON string
            });

            if (!response.ok) {
                throw new Error(`Fallo al crear la categoría. Status: ${response.status}`);
            }

            // Opcional: El backend puede devolver la categoría con su ID generado.
            // const categoriaCreada = await response.json(); 
            
            console.log('Categoría creada exitosamente.');

            // Después de guardar, recargamos la lista para actualizar la tabla
            await this.cargarCategorias(); 
            this.cerrarModal(); 

        } catch (error) {
            console.error("Error al guardar la categoría:", error);
            alert("Error al intentar guardar la categoría.");
        }
    }
}
    
    // --- MÉTODOS DE ACCIONES (ELIMINAR Y EDITAR) ---

    async manejarEliminar(idCategoria: number): Promise<void> {
    const categoriaAEliminar = this.categorias.find(c => c.id === idCategoria);

    if (categoriaAEliminar && confirm(`¿Estás seguro que deseas eliminar la categoría: ${categoriaAEliminar.nombre} (ID: ${idCategoria})?`)) {
        
        try {
            const response = await fetch(`${API_BASE_URL}/${idCategoria}`, {
                method: 'DELETE' // Tipo de petición
            });

            if (!response.ok) {
                throw new Error(`Fallo al eliminar la categoría. Status: ${response.status}`);
            }

            console.log(`Categoría ID ${idCategoria} eliminada.`);

            // Recargamos la lista desde el servidor para actualizar el DOM
            await this.cargarCategorias(); 

        } catch (error) {
            console.error("Error al eliminar la categoría:", error);
            alert("Error al intentar eliminar la categoría.");
        }
    }
}

   manejarEditar(idCategoria: number): void {
    const categoriaAEditar = this.categorias.find(c => c.id === idCategoria);

    if (categoriaAEditar) {
        // 1. Mostrar el modal y llenar los campos
        this.manejarNuevaCategoria(); 
        
        (document.getElementById('nombre-categoria') as HTMLInputElement).value = categoriaAEditar.nombre;
        (document.getElementById('descripcion-categoria') as HTMLTextAreaElement).value = categoriaAEditar.descripcion;
        (document.getElementById('imagen-categoria') as HTMLInputElement).value = categoriaAEditar.imagen;

        // 2. Preparamos el modal para la acción de EDICIÓN
        const btnGuardar = document.querySelector('.btn-guardar') as HTMLButtonElement;
        const form = this.formulario as HTMLFormElement;

        // Cambiar el texto del botón y el título del modal temporalmente
        document.querySelector('.modal-encabezado h3')!.textContent = `Editar Categoría ID: ${idCategoria}`;
        btnGuardar.textContent = 'Guardar Cambios';

        // 3. Reemplazar el listener de submit
        // Solución de JS puro: Clonar para limpiar listeners
        const newForm = form.cloneNode(true) as HTMLFormElement;
        form.parentNode!.replaceChild(newForm, form);
        this.formulario = newForm;
        
        // Adjuntar el nuevo listener que manejará la edición (PUT a la API)
        this.formulario.addEventListener('submit', (e) => this.guardarEdicion(e, idCategoria));
        
        // Reconfigurar los listeners de cierre
        this.adjuntarEventos(true); 
    }
}

async guardarEdicion(event: Event, idCategoria: number): Promise<void> {
    event.preventDefault(); 
    
    // 1. Recopilar datos del formulario
    const datosActualizados = {
        nombre: (document.getElementById('nombre-categoria') as HTMLInputElement).value,
        descripcion: (document.getElementById('descripcion-categoria') as HTMLTextAreaElement).value,
        imagen: (document.getElementById('imagen-categoria') as HTMLInputElement).value
        // NOTA: El ID no se envía en el cuerpo, sino en la URL (path variable)
    };

    try {
        const response = await fetch(`${API_BASE_URL}/${idCategoria}`, {
            method: 'PUT', // Tipo de petición para ACTUALIZAR
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        });

        if (!response.ok) {
            throw new Error(`Fallo al actualizar la categoría. Status: ${response.status}`);
        }

        console.log(`Categoría ID ${idCategoria} actualizada exitosamente.`);

        // 2. Recargar datos y cerrar modal
        await this.cargarCategorias(); // Recarga toda la lista desde el servidor
        this.cerrarModal(); 

        // 3. Volver a configurar el formulario para la CREACIÓN (POST)
        this.adjuntarEventos(); 

    } catch (error) {
        console.error("Error al guardar la edición:", error);
        alert("Error al intentar actualizar la categoría.");
    }
}

    // --- MÉTODOS DE INICIALIZACIÓN ---
    adjuntarEventos(skipFormListeners: boolean = false): void {
        // Evento para el botón "Nueva Categoría"
        const newBtn = document.querySelector('.btn-nueva-categoria');
        if (newBtn) {
            newBtn.removeEventListener('click', () => this.manejarNuevaCategoria()); // Limpiar antes de re-adjuntar
            newBtn.addEventListener('click', () => this.manejarNuevaCategoria());
        }

        // Evento para el envío del formulario: SOLO LO AÑADIMOS EN MODO CREACIÓN
        if (this.formulario && !skipFormListeners) {
            // Limpiamos cualquier listener de submit anterior para evitar duplicidad o conflicto
            this.formulario.removeEventListener('submit', (e) => this.guardarCategoria(e)); 
            this.formulario.addEventListener('submit', (e) => this.guardarCategoria(e));
        }

        // Para cerrar el modal haciendo clic fuera de él
        if (this.modal) {
            // Es buena práctica remover y volver a añadir el listener para evitar duplicidad
            const modalCloseHandler = (e: Event) => {
                if (e.target === this.modal) {
                    this.cerrarModal();
                }
            };
            this.modal.removeEventListener('click', modalCloseHandler);
            this.modal.addEventListener('click', modalCloseHandler);
        }
    }
} // CIERRE DE LA CLASE CORREGIDO

// Inicialización de la aplicación al cargar la página
const categoriasApp = new ComponenteCategorias();
