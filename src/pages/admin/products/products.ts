import * as CategoriaService from "../../../services/categories.service";
import * as ProductoService from "../../../services/products.service";
import type { ICategoria } from "../../../types/ICategoria";
import type { ICreateProducto, IProducto } from "../../../types/IProduct";
import { cerrarSesion } from "../../../utils/auth";

const IMAGEN_DEFAULT = "/assets/img/generic-food.png";

class ComponenteProductos {
  productos: IProducto[] = [];
  categoriasDisponibles: ICategoria[] = [];

  modal: HTMLElement | null;
  formulario: HTMLFormElement | null;
  tablaCuerpo: HTMLElement | null;
  botonCerrarSesion: HTMLButtonElement | null;

  private idEnEdicion: number | null = null;
  private submitHandler: (e: Event) => void;

  constructor() {
    console.log("Componente de Productos cargado.");
    this.modal = document.getElementById("modal-producto");
    this.formulario = document.getElementById(
      "formulario-producto"
    ) as HTMLFormElement;
    this.tablaCuerpo = document.querySelector(".tarjeta table tbody");
    this.submitHandler = this.manejarSubmitGlobal.bind(this);
    this.botonCerrarSesion = document.getElementById(
      "boton-cerrar-sesion"
    ) as HTMLButtonElement;
  }

  async inicializarApp(): Promise<void> {
    await this.cargarCategoriasParaDesplegable();
    await this.cargarProductos();

    this.llenarDesplegableCategorias();
    this.adjuntarEventosBase();
  }

  async cargarCategoriasParaDesplegable(): Promise<void> {
    try {
      this.categoriasDisponibles =
        await CategoriaService.buscarTodasCategorias();
    } catch (error) {
      console.error("Error al cargar categorías para el desplegable:", error);
    }
  }

  async cargarProductos(): Promise<void> {
    try {
      const productosData: IProducto[] =
        await ProductoService.buscarTodosProductos();

      this.productos = productosData.map((p) => {
        const cat = this.categoriasDisponibles.find(
          (c) => c.id === p.categoriaid
        );
        return {
          ...p,
          categoriaNombre: cat ? cat.nombre : `ID: ${p.categoriaid}`,
        };
      });

      this.renderizarProductos();
    } catch (error) {
      console.error("Error al cargar los productos:", error);
      alert("No se pudieron cargar los productos desde el servidor.");
    }
  }

  renderizarProductos(): void {
    if (!this.tablaCuerpo) return;
    this.tablaCuerpo.innerHTML = "";

    this.productos.forEach((prod) => {
      const row = this.crearFilaProducto(prod);
      this.tablaCuerpo!.appendChild(row);
    });
  }

  crearFilaProducto(prod: IProducto): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td class="col-id">${prod.id}</td>
        <td class="col-imagen">
            <img src="${prod.imagen}" alt="${prod.nombre}" class="img-producto">
        </td>
        <td>${prod.nombre}</td>
        <td>${prod.descripcion}</td>
        <td>$${prod.precio ? prod.precio.toFixed(2) : "N/A"}</td> 
        <td>${prod.stock}</td> 
        <td>${prod.categoriaNombre}</td> 
        <td class="col-acciones">
            <button class="btn-editar">Editar</button>
            <button class="btn-eliminar">Eliminar</button>
        </td>
    `;

    row.querySelector(".btn-editar")?.addEventListener("click", () => {
      this.manejarEditarProducto(prod.id);
    });

    row.querySelector(".btn-eliminar")?.addEventListener("click", () => {
      this.manejarEliminarProducto(prod.id);
    });

    return row;
  }

  manejarNuevoProducto(): void {
    this.idEnEdicion = null;

    if (this.modal) {
      this.modal.style.display = "flex";
      if (this.formulario) {
        this.formulario.reset();
      }

      document.querySelector(
        ".modal-encabezado h3"
      )!.textContent = `Nuevo Producto`;
      (
        document.querySelector(".btn-guardar") as HTMLButtonElement
      ).textContent = "Guardar Producto";
    }
  }

  manejarEditarProducto(idProducto: number): void {
    const productoAEditar = this.productos.find((p) => p.id === idProducto);

    if (productoAEditar) {
      this.idEnEdicion = idProducto;

      if (this.modal) {
        this.modal.style.display = "flex";
      }
      if (this.formulario) {
        this.formulario.reset();
      }

      (document.getElementById("nombre-producto") as HTMLInputElement).value =
        productoAEditar.nombre;
      (
        document.getElementById("descripcion-producto") as HTMLTextAreaElement
      ).value = productoAEditar.descripcion;
      (document.getElementById("imagen-producto") as HTMLInputElement).value =
        productoAEditar.imagen;
      (document.getElementById("precio-producto") as HTMLInputElement).value =
        productoAEditar.precio.toString();
      (document.getElementById("stock-producto") as HTMLInputElement).value =
        productoAEditar.stock.toString();
      (
        document.getElementById("categoria-producto") as HTMLSelectElement
      ).value = productoAEditar.categoriaid.toString();

      document.querySelector(
        ".modal-encabezado h3"
      )!.textContent = `Editar Producto ID: ${idProducto}`;
      (
        document.querySelector(".btn-guardar") as HTMLButtonElement
      ).textContent = "Guardar Cambios";
    }
  }

  llenarDesplegableCategorias(): void {
    const select = document.getElementById(
      "categoria-producto"
    ) as HTMLSelectElement;
    if (!select) return;

    select.innerHTML = "";
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Seleccione Categoría";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    this.categoriasDisponibles.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat.id.toString();
      option.textContent = cat.nombre;
      select.appendChild(option);
    });
  }

  cerrarModal(): void {
    if (this.modal) {
      this.modal.style.display = "none";
      if (this.formulario) {
        this.formulario.reset();
      }
      this.idEnEdicion = null;
    }
  }

  async manejarSubmitGlobal(event: Event): Promise<void> {
    event.preventDefault();

    if (this.idEnEdicion !== null) {
      await this.guardarEdicionProducto(this.idEnEdicion);
    } else {
      await this.guardarProducto();
    }
  }

  private recolectarDatosFormulario(): ICreateProducto | null {
    const nuevoPrecio = parseFloat(
      (document.getElementById("precio-producto") as HTMLInputElement).value
    );
    const nuevoStock = parseInt(
      (document.getElementById("stock-producto") as HTMLInputElement).value
    );
    const nuevaCategoriaId = parseInt(
      (document.getElementById("categoria-producto") as HTMLSelectElement).value
    );

    if (
      isNaN(nuevoPrecio) ||
      nuevoPrecio <= 0 ||
      isNaN(nuevoStock) ||
      nuevoStock < 0 ||
      isNaN(nuevaCategoriaId)
    ) {
      alert("Por favor, ingrese valores válidos.");
      return null;
    }

    return {
      nombre: (document.getElementById("nombre-producto") as HTMLInputElement)
        .value,
      descripcion: (
        document.getElementById("descripcion-producto") as HTMLTextAreaElement
      ).value,
      imagen:
        (document.getElementById("imagen-producto") as HTMLInputElement)
          .value || IMAGEN_DEFAULT,
      precio: nuevoPrecio,
      stock: nuevoStock,
      categoriaid: nuevaCategoriaId,
    };
  }

  async guardarProducto(): Promise<void> {
    const nuevoProductoData = this.recolectarDatosFormulario();
    if (!nuevoProductoData) return;

    try {
      await ProductoService.crearProducto(nuevoProductoData);

      console.log("Producto creado exitosamente.");
      await this.cargarProductos();
      this.cerrarModal();
    } catch (error) {
      console.error("Error al guardar el producto:", error);
      let mensajeError = "Error al guardar la categoría.";
      if (error instanceof Error) {
        mensajeError = error.message;
      }
      alert(mensajeError);
    }
  }

  async guardarEdicionProducto(idProducto: number): Promise<void> {
    const datosActualizados = this.recolectarDatosFormulario();
    if (!datosActualizados) return;

    try {
      await ProductoService.modificarProducto(idProducto, datosActualizados);
      await this.cargarProductos();
      this.cerrarModal();
    } catch (error) {
      console.error("Error al guardar la edición del producto:", error);
      let mensajeError = "Error al intentar actualizar el producto.";
      if (error instanceof Error) {
        mensajeError = error.message;
      }
      alert(mensajeError);
    }
  }

  async manejarEliminarProducto(idProducto: number): Promise<void> {
    const productoAEliminar = this.productos.find((p) => p.id === idProducto);
    if (
      productoAEliminar &&
      confirm(
        `¿Estás seguro que deseas eliminar el producto: ${productoAEliminar.nombre}?`
      )
    ) {
      try {
        await ProductoService.eliminarProducto(idProducto);
        await this.cargarProductos();
      } catch (error) {
        console.error("Error al eliminar el producto:", error);
        let mensajeError = "Error al intentar actualizar el producto.";
        if (error instanceof Error) {
          mensajeError = error.message;
        }
        alert(mensajeError);
      }
    }
  }

  adjuntarEventosBase(): void {
    const newBtn = document.querySelector(".btn-nueva-categoria");

    newBtn?.addEventListener("click", () => this.manejarNuevoProducto());

    this.formulario?.addEventListener("submit", this.submitHandler);

    this.modal?.addEventListener("click", (e: Event) => {
      if (e.target === this.modal) {
        this.cerrarModal();
      }
    });
    const closeBtn = document.querySelector(".modal-cerrar");
    closeBtn?.addEventListener("click", () => this.cerrarModal());

    const cancelBtn = document.querySelector(".btn-cancelar");
    cancelBtn?.addEventListener("click", () => this.cerrarModal());

    this.botonCerrarSesion?.addEventListener("click", () => cerrarSesion());
  }
}

const productosApp = new ComponenteProductos();
productosApp.inicializarApp();
