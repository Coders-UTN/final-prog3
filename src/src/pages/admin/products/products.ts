// --- 1. URLs y Estructuras de Datos ---
const API_BASE_URL_PRODUCTOS = 'http://localhost:8080/api/productos';
const API_BASE_URL_CATEGORIAS = 'http://localhost:8080/api/categorias';

interface Categoria {
    id: number;
    nombre: string;
}

interface Producto {
    id: number;
    imagen: string; 
    nombre: string;
    descripcion: string;
    precio: number; 
    stock: number;
    categoriaid: number; 
    categoriaNombre?: string; 
}

class ComponenteProductos {
    productos: Producto[] = []; 
    categoriasDisponibles: Categoria[] = [];

    modal: HTMLElement | null;
    formulario: HTMLFormElement | null;
    tablaCuerpo: HTMLElement | null;
    
    // Almacena el ID si estamos en modo edición, o null para creación.
    private idEnEdicion: number | null = null; 
    
    // Almacenamos la referencia para el evento submit.
    private submitHandler: (e: Event) => void;
    
    constructor() {
        console.log('Componente de Productos cargado.');
        this.modal = document.getElementById('modal-producto'); 
        this.formulario = document.getElementById('formulario-producto') as HTMLFormElement; 
        this.tablaCuerpo = document.querySelector('.tarjeta table tbody');

        // Asignación de la función binded para usar como handler
        this.submitHandler = this.manejarSubmitGlobal.bind(this);
        
        this.inicializarApp();
        // Adjuntamos eventos del formulario y botones principales una sola vez.
        this.adjuntarEventosBase(); 
    }
    
    // --- LÓGICA DE CARGA DE DATOS ---
    async inicializarApp(): Promise<void> {
        await this.cargarCategoriasParaDesplegable(); 
        await this.cargarProductos();
    }
    
    // Lógica de cargarCategoriasParaDesplegable... (sin cambios)
    async cargarCategoriasParaDesplegable(): Promise<void> {
        try {
            const response = await fetch(API_BASE_URL_CATEGORIAS);
            if (!response.ok) {
                throw new Error(`HTTP error al cargar categorías: status ${response.status}`);
            }
            this.categoriasDisponibles = await response.json() as Categoria[];
        } catch (error) {
            console.error("Error al cargar categorías para el desplegable:", error);
        }
    }

    // Lógica de cargarProductos... (sin cambios)
    async cargarProductos(): Promise<void> {
        try {
            const response = await fetch(API_BASE_URL_PRODUCTOS);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const productosData: Producto[] = await response.json(); 
            
            this.productos = productosData.map(p => {
                const cat = this.categoriasDisponibles.find(c => c.id === p.categoriaid);
                return {
                    ...p,
                    categoriaNombre: cat ? cat.nombre : `ID: ${p.categoriaid}`
                };
            });
            
            this.renderizarProductos();
        } catch (error) {
            console.error("Error al cargar los productos:", error);
            alert("No se pudieron cargar los productos desde el servidor.");
        }
    }

    // Lógica de renderizarProductos... (sin cambios)
    renderizarProductos(): void { 
        if (!this.tablaCuerpo) return;
        this.tablaCuerpo.innerHTML = '';

        this.productos.forEach(prod => {
            const row = this.crearFilaProducto(prod);
            this.tablaCuerpo!.appendChild(row);
        });
    }

    // Lógica de crearFilaProducto... (sin cambios)
    crearFilaProducto(prod: Producto): HTMLTableRowElement {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td class="col-id">${prod.id}</td>
            <td class="col-imagen">
                <img src="${prod.imagen}" alt="${prod.nombre}" class="img-producto">
            </td>
            <td>${prod.nombre}</td>
            <td>${prod.descripcion}</td>
            <td>$${prod.precio ? prod.precio.toFixed(2) : 'N/A'}</td> 
            <td>${prod.stock}</td> 
            <td>${prod.categoriaNombre}</td> 
            <td class="col-acciones">
                <button class="btn-editar" data-id="${prod.id}" onclick="productosApp.manejarEditarProducto(${prod.id})">Editar</button>
                <button class="btn-eliminar" data-id="${prod.id}" onclick="productosApp.manejarEliminarProducto(${prod.id})">Eliminar</button>
            </td>
        `;
        return row;
    }

    // --- MÉTODOS DE MODAL Y FORMULARIO ---

    manejarNuevoProducto(): void {
        this.idEnEdicion = null; // MODO CREACIÓN
        
        if (this.modal) {
            this.modal.style.display = 'flex';
            if (this.formulario) { this.formulario.reset(); }

            document.querySelector('.modal-encabezado h3')!.textContent = `Nuevo Producto`;
            (document.querySelector('.btn-guardar') as HTMLButtonElement).textContent = 'Guardar Producto';

            this.llenarDesplegableCategorias();
        }
    }
    
    manejarEditarProducto(idProducto: number): void {
        const productoAEditar = this.productos.find(p => p.id === idProducto);
        
        if (productoAEditar) {
            this.idEnEdicion = idProducto; // Establece el ID para el modo edición
            
            // Reutiliza manejarNuevoProducto para abrir el modal y limpiar/configurar
            this.manejarNuevoProducto(); 

            // Rellenar campos
            (document.getElementById('nombre-producto') as HTMLInputElement).value = productoAEditar.nombre;
            (document.getElementById('descripcion-producto') as HTMLTextAreaElement).value = productoAEditar.descripcion;
            (document.getElementById('imagen-producto') as HTMLInputElement).value = productoAEditar.imagen;
            (document.getElementById('precio-producto') as HTMLInputElement).value = productoAEditar.precio.toString();
            (document.getElementById('stock-producto') as HTMLInputElement).value = productoAEditar.stock.toString();
            (document.getElementById('categoria-producto') as HTMLSelectElement).value = productoAEditar.categoriaid.toString();

            // Actualizar textos del modal
            document.querySelector('.modal-encabezado h3')!.textContent = `Editar Producto ID: ${idProducto}`;
            (document.querySelector('.btn-guardar') as HTMLButtonElement).textContent = 'Guardar Cambios';
            
            // Importante: No se clona el formulario ni se adjuntan nuevos listeners.
        }
    }
    
    // Lógica de llenarDesplegableCategorias... (sin cambios)
    llenarDesplegableCategorias(): void {
        const select = document.getElementById('categoria-producto') as HTMLSelectElement;
        if (!select) return;

        select.innerHTML = ''; 
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = 'Seleccione Categoría';
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        this.categoriasDisponibles.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id.toString();
            option.textContent = cat.nombre;
            select.appendChild(option);
        });
    }

    cerrarModal(): void {
        if (this.modal) {
            this.modal.style.display = 'none';
            if (this.formulario) { this.formulario.reset(); }
            // Limpia el estado de edición al cerrar
            this.idEnEdicion = null; 
        }
    }

    // --- MANEJADOR DE SUBMIT CENTRALIZADO ---
    async manejarSubmitGlobal(event: Event): Promise<void> {
        event.preventDefault();
        
        if (this.idEnEdicion !== null) {
            // Llama a edición si idEnEdicion está seteado
            await this.guardarEdicionProducto(this.idEnEdicion);
        } else {
            // Llama a creación si idEnEdicion es null
            await this.guardarProducto();
        }
    }

    private recolectarDatosFormulario(): any {
        const nuevoPrecio = parseFloat((document.getElementById('precio-producto') as HTMLInputElement).value);
        const nuevoStock = parseInt((document.getElementById('stock-producto') as HTMLInputElement).value);
        const nuevaCategoriaId = parseInt((document.getElementById('categoria-producto') as HTMLSelectElement).value);

        if (isNaN(nuevoPrecio) || nuevoPrecio <= 0 || isNaN(nuevoStock) || nuevoStock < 0 || isNaN(nuevaCategoriaId)) {
            alert("Por favor, ingrese valores válidos.");
            return null;
        }

        return {
            nombre: (document.getElementById('nombre-producto') as HTMLInputElement).value,
            descripcion: (document.getElementById('descripcion-producto') as HTMLTextAreaElement).value,
            imagen: (document.getElementById('imagen-producto') as HTMLInputElement).value || '',
            precio: nuevoPrecio, 
            stock: nuevoStock,
            categoriaid: nuevaCategoriaId 
        };
    }

    async guardarProducto(): Promise<void> {
        const nuevoProductoData = this.recolectarDatosFormulario();
        if (!nuevoProductoData) return;

        try {
            const response = await fetch(API_BASE_URL_PRODUCTOS, {
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nuevoProductoData) 
            });

            if (!response.ok) {
                // Aquí deberías manejar errores 409/400 del servidor
                const errorText = await response.text();
                throw new Error(`Fallo al crear el producto. Status: ${response.status}. Detalle: ${errorText.substring(0, 100)}...`);
            }
            
            console.log('Producto creado exitosamente.');
            await this.cargarProductos(); 
            this.cerrarModal(); 

        } catch (error) {
            console.error("Error al guardar el producto:", error);
            alert("Error al intentar guardar el producto. Verifique la consola para detalles.");
        }
    }

    async guardarEdicionProducto(idProducto: number): Promise<void> {
        // Obtenemos los datos del formulario (la validación se hace dentro de recolectarDatos)
        const datosActualizados = this.recolectarDatosFormulario(); 
        if (!datosActualizados) return;

        try {
            const response = await fetch(`${API_BASE_URL_PRODUCTOS}/${idProducto}`, {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) {
                 // Aquí deberías manejar errores 409/400 del servidor
                const errorText = await response.text();
                throw new Error(`Fallo al actualizar el producto. Status: ${response.status}. Detalle: ${errorText.substring(0, 100)}...`);
            }

            console.log(`Producto ID ${idProducto} actualizado exitosamente.`);
            await this.cargarProductos(); 
            this.cerrarModal(); 

        } catch (error) {
            console.error("Error al guardar la edición del producto:", error);
            alert("Error al intentar actualizar el producto. Verifique la consola para detalles.");
        }
    }
    
    // --- MÉTODOS DE ACCIONES (ELIMINAR) ---
    async manejarEliminarProducto(idProducto: number): Promise<void> {
        const productoAEliminar = this.productos.find(p => p.id === idProducto);
        // ... (Lógica de eliminación se mantiene igual)
        if (productoAEliminar && confirm(`¿Estás seguro que deseas eliminar el producto: ${productoAEliminar.nombre}?`)) {
            try {
                const response = await fetch(`${API_BASE_URL_PRODUCTOS}/${idProducto}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error(`Fallo al eliminar el producto. Status: ${response.status}`);
                }
                await this.cargarProductos(); 
            } catch (error) {
                console.error("Error al eliminar el producto:", error);
                alert("Error al intentar eliminar el producto.");
            }
        }
    }

    // --- MÉTODOS DE INICIALIZACIÓN ---
    adjuntarEventosBase(): void {
        const newBtn = document.querySelector('.btn-nueva-categoria'); 
        if (newBtn) {
            newBtn.addEventListener('click', () => this.manejarNuevoProducto());
        }

        // Adjunta el manejador submit UNA SOLA VEZ
        if (this.formulario) {
            this.formulario.addEventListener('submit', this.submitHandler);
        }

        // Cierre de Modal
        if (this.modal) {
            this.modal.addEventListener('click', (e: Event) => {
                if (e.target === this.modal) {
                    this.cerrarModal();
                }
            });
        }
        
        // CORRECCIÓN: Botón Cerrar Sesión
        const btnCerrarSesion = document.querySelector('.btn-cerrar-sesion');
        if (btnCerrarSesion) {
            // Asigna el evento directamente sin depender del onclick del HTML
            btnCerrarSesion.addEventListener('click', () => this.cerrarSesion());
        }
    }

    cerrarSesion(): void {
        if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            // 1. Limpiar localStorage
            localStorage.removeItem('user_data');
            localStorage.removeItem('token');
            localStorage.removeItem('usuario');
            
            // 2. Redirigir a la página de login
            window.location.href = '../login/login.html';
        }
    }
} 

// Inicialización de la aplicación
const productosApp = new ComponenteProductos();