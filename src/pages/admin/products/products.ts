// --- 1. URLs y Estructuras de Datos ---
const API_BASE_URL_PRODUCTOS = 'http://localhost:8080/api/productos';
const API_BASE_URL_CATEGORIAS = 'http://localhost:8080/api/categorias';

interface Categoria { // Se mantiene, ya que los Productos la usan
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
    categoriaId: number; 
    categoriaNombre?: string; 
}

// --- 2. Clase Principal ComponenteProductos (CORREGIDO) ---
class ComponenteProductos {
    productos: Producto[] = []; // Array de productos
    categoriasDisponibles: Categoria[] = [];

    modal: HTMLElement | null;
    formulario: HTMLFormElement | null;
    tablaCuerpo: HTMLElement | null;
    
    constructor() {
        console.log('Componente de Productos cargado.');
        this.modal = document.getElementById('modal-producto'); // ID CORREGIDO en el HTML
        this.formulario = document.getElementById('formulario-producto') as HTMLFormElement; // ID CORREGIDO en el HTML
        this.tablaCuerpo = document.querySelector('.tarjeta table tbody');

        this.inicializarApp();
        this.adjuntarEventos();
    }
    
    // --- LÓGICA DE CARGA DE DATOS ---
    async inicializarApp(): Promise<void> {
        await this.cargarCategoriasParaDesplegable(); 
        await this.cargarProductos();
    }
    
    async cargarCategoriasParaDesplegable(): Promise<void> {
        // ... (La lógica de carga de categorías se mantiene igual)
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

    async cargarProductos(): Promise<void> {
        // ... (La lógica de carga de productos se mantiene igual)
        try {
            const response = await fetch(API_BASE_URL_PRODUCTOS);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const productosData: Producto[] = await response.json(); 
            
            this.productos = productosData.map(p => {
                const cat = this.categoriasDisponibles.find(c => c.id === p.categoriaId);
                return {
                    ...p,
                    categoriaNombre: cat ? cat.nombre : `ID: ${p.categoriaId}`
                };
            });
            
            this.renderizarProductos();
        } catch (error) {
            console.error("Error al cargar los productos:", error);
            alert("No se pudieron cargar los productos desde el servidor.");
        }
    }

    // --- MÉTODOS DE RENDERIZADO ---
    renderizarProductos(): void { 
        if (!this.tablaCuerpo) return;
        this.tablaCuerpo.innerHTML = '';

        this.productos.forEach(prod => {
            const row = this.crearFilaProducto(prod);
            this.tablaCuerpo!.appendChild(row);
        });
    }

    crearFilaProducto(prod: Producto): HTMLTableRowElement {
        const row = document.createElement('tr');
        // ... (el HTML interno se mantiene igual, usando prod.nombre, etc.)
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
        if (this.modal) {
            this.modal.style.display = 'flex';
            if (this.formulario) { this.formulario.reset(); }

            document.querySelector('.modal-encabezado h3')!.textContent = `Nuevo Producto`;
            (document.querySelector('.btn-guardar') as HTMLButtonElement).textContent = 'Guardar Producto';

            this.llenarDesplegableCategorias();
        }
    }
    
    llenarDesplegableCategorias(): void {
        const select = document.getElementById('categoria-producto') as HTMLSelectElement;
        // ... (la lógica se mantiene igual)
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
            this.adjuntarEventos(); 
        }
    }

    async guardarProducto(event: Event): Promise<void> {
        event.preventDefault();

        if (this.formulario) {
            // IDs de inputs deben ser *-producto para ser coherentes
            const nuevoPrecio = parseFloat((document.getElementById('precio-producto') as HTMLInputElement).value);
            const nuevoStock = parseInt((document.getElementById('stock-producto') as HTMLInputElement).value);
            const nuevaCategoriaId = parseInt((document.getElementById('categoria-producto') as HTMLSelectElement).value);
            
            if (isNaN(nuevoPrecio) || nuevoPrecio <= 0 || isNaN(nuevoStock) || nuevoStock < 0 || isNaN(nuevaCategoriaId)) {
                alert("Por favor, ingrese valores válidos.");
                return;
            }

            const nuevoProductoData = {
                nombre: (document.getElementById('nombre-producto') as HTMLInputElement).value,
                descripcion: (document.getElementById('descripcion-producto') as HTMLTextAreaElement).value,
                imagen: (document.getElementById('imagen-producto') as HTMLInputElement).value || '',
                precio: nuevoPrecio, 
                stock: nuevoStock,
                categoriaId: nuevaCategoriaId
            };

            try {
                const response = await fetch(API_BASE_URL_PRODUCTOS, {
                    method: 'POST', 
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(nuevoProductoData) 
                });

                if (!response.ok) {
                    throw new Error(`Fallo al crear el producto. Status: ${response.status}`);
                }
                
                console.log('Producto creado exitosamente.');
                await this.cargarProductos(); 
                this.cerrarModal(); 

            } catch (error) {
                console.error("Error al guardar el producto:", error);
                alert("Error al intentar guardar el producto.");
            }
        }
    }
    
    // --- MÉTODOS DE ACCIONES (ELIMINAR Y EDITAR) ---
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

    manejarEditarProducto(idProducto: number): void {
        const productoAEditar = this.productos.find(p => p.id === idProducto);

        if (productoAEditar) {
            this.manejarNuevoProducto(); 
            
            // Llenar campos con IDs CORREGIDOS
            (document.getElementById('nombre-producto') as HTMLInputElement).value = productoAEditar.nombre;
            (document.getElementById('descripcion-producto') as HTMLTextAreaElement).value = productoAEditar.descripcion;
            (document.getElementById('imagen-producto') as HTMLInputElement).value = productoAEditar.imagen;
            (document.getElementById('precio-producto') as HTMLInputElement).value = productoAEditar.precio.toString();
            (document.getElementById('stock-producto') as HTMLInputElement).value = productoAEditar.stock.toString();
            (document.getElementById('categoria-producto') as HTMLSelectElement).value = productoAEditar.categoriaId.toString();

            // Configurar Modal para Edición (se mantiene la lógica de clonar)
            const btnGuardar = document.querySelector('.btn-guardar') as HTMLButtonElement;
            const form = this.formulario as HTMLFormElement;

            document.querySelector('.modal-encabezado h3')!.textContent = `Editar Producto ID: ${idProducto}`;
            btnGuardar.textContent = 'Guardar Cambios';

            const newForm = form.cloneNode(true) as HTMLFormElement;
            form.parentNode!.replaceChild(newForm, form);
            this.formulario = newForm;
            
            this.formulario.addEventListener('submit', (e) => this.guardarEdicionProducto(e, idProducto));
            
            this.adjuntarEventos(true); 
        }
    }

    async guardarEdicionProducto(event: Event, idProducto: number): Promise<void> {
        event.preventDefault(); 
        
        // ... (La lógica de actualización se mantiene igual, usando los IDs corregidos)
        const datosActualizados = {
            nombre: (document.getElementById('nombre-producto') as HTMLInputElement).value,
            descripcion: (document.getElementById('descripcion-producto') as HTMLTextAreaElement).value,
            imagen: (document.getElementById('imagen-producto') as HTMLInputElement).value,
            precio: parseFloat((document.getElementById('precio-producto') as HTMLInputElement).value),
            stock: parseInt((document.getElementById('stock-producto') as HTMLInputElement).value),
            categoriaId: parseInt((document.getElementById('categoria-producto') as HTMLSelectElement).value)
        };

        if (isNaN(datosActualizados.precio) || isNaN(datosActualizados.stock) || isNaN(datosActualizados.categoriaId)) {
            alert("Por favor, ingrese valores válidos.");
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL_PRODUCTOS}/${idProducto}`, {
                method: 'PUT', 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosActualizados)
            });

            if (!response.ok) {
                throw new Error(`Fallo al actualizar el producto. Status: ${response.status}`);
            }

            await this.cargarProductos(); 
            this.cerrarModal(); 
            this.adjuntarEventos(); 

        } catch (error) {
            console.error("Error al guardar la edición del producto:", error);
            alert("Error al intentar actualizar el producto.");
        }
    }

    // --- MÉTODOS DE INICIALIZACIÓN ---
    adjuntarEventos(skipFormListeners: boolean = false): void {
        // El botón usa la clase CSS antigua, pero el handler llama al método correcto
        const newBtn = document.querySelector('.btn-nueva-categoria'); 
        if (newBtn) {
            const handler = () => this.manejarNuevoProducto();
            newBtn.removeEventListener('click', handler); 
            newBtn.addEventListener('click', handler);
        }

        // El formulario usa el ID correcto
        if (this.formulario && !skipFormListeners) {
            const handler = (e: Event) => this.guardarProducto(e);
            this.formulario.removeEventListener('submit', handler as EventListener);
            this.formulario.addEventListener('submit', handler as EventListener);
        }

        // Cierre de Modal
        if (this.modal) {
            const modalCloseHandler = (e: Event) => {
                if (e.target === this.modal) {
                    this.cerrarModal();
                }
            };
            this.modal.removeEventListener('click', modalCloseHandler as EventListener);
            this.modal.addEventListener('click', modalCloseHandler as EventListener);
        }
    }
} 

// Inicialización de la aplicación al cargar la página (CORREGIDO)
const productosApp = new ComponenteProductos();