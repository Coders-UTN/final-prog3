import { type ICategoria } from "../../../types/ICategoria";
import * as CategoriaService from "../../../services/categories.service";
import { cerrarSesion } from "../../../utils/auth";

const IMAGEN_DEFAULT = "/assets/img/generic-category.png";

class ComponenteCategorias {
  categorias: ICategoria[] = [];
  modal: HTMLElement | null;
  formulario: HTMLFormElement | null;
  tablaCuerpo: HTMLElement | null;
  idCategoriaEnEdicion: number | null = null;
  botonCerrarSesion : HTMLButtonElement | null;

  constructor() {
    console.log("Componente de Categorías cargado.");
    this.modal = document.getElementById("modal-categoria");
    this.formulario = document.getElementById(
      "formulario-categoria"
    ) as HTMLFormElement;
    this.tablaCuerpo = document.querySelector(".tarjeta table tbody");
    this.botonCerrarSesion = document.getElementById('boton-cerrar-sesion') as HTMLButtonElement;
    
  }

  public async inicializar() {
    console.log("Componente inicializando...");
    await this.cargarCategorias();
    this.adjuntarEventos();
  }

  async cargarCategorias(): Promise<void> {
    try {
      this.categorias = await CategoriaService.buscarTodasCategorias();
      this.renderizarCategorias();
    } catch (error) {
      console.error("Error al cargar las categorías:", error);
      alert("No se pudieron cargar las categorías desde el servidor.");
    }
  }

  renderizarCategorias(): void {
    if (!this.tablaCuerpo) return;

    this.tablaCuerpo.innerHTML = "";

    this.categorias.forEach((cat) => {
      const fila = this.crearFilaCategoria(cat);
      this.tablaCuerpo!.appendChild(fila);
    });
  }

  crearFilaCategoria(cat: ICategoria): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td class="col-id">${cat.id}</td>
            <td class="col-imagen">
                <img src="${cat.imagen}" alt="${cat.nombre}" class="img-categoria">
            </td>
            <td>${cat.nombre}</td>
            <td>${cat.descripcion}</td>
            <td class="col-acciones">
                <button class="btn-editar">Editar</button>
                <button class="btn-eliminar">Eliminar</button>
            </td>
        `;
    row.querySelector(".btn-editar")?.addEventListener("click", () => {
      this.abrirModalParaEditar(cat.id);
    });

    row.querySelector(".btn-eliminar")?.addEventListener("click", () => {
      this.manejarEliminar(cat.id);
    });
    return row;
  }

  abrirModalParaCrear(): void {
    if (!this.modal || !this.formulario) return;

    this.idCategoriaEnEdicion = null;
    this.formulario.reset();

    document.querySelector(
      ".modal-encabezado h3"
    )!.textContent = `Nueva Categoría`;
    (document.querySelector(".btn-guardar") as HTMLButtonElement).textContent =
      "Guardar Categoría";

    this.modal.style.display = "flex";
  }

  cerrarModal(): void {
    if (this.modal) {
      this.modal.style.display = "none";
    }
    this.idCategoriaEnEdicion = null;
  }

  abrirModalParaEditar(idCategoria: number): void {
    const cat = this.categorias.find((c) => c.id === idCategoria);

    if (!cat || !this.modal || !this.formulario) return;

    this.idCategoriaEnEdicion = idCategoria;
    this.formulario.reset();

    (document.getElementById("nombre-categoria") as HTMLInputElement).value =
      cat.nombre;
    (
      document.getElementById("descripcion-categoria") as HTMLTextAreaElement
    ).value = cat.descripcion;
    (document.getElementById("imagen-categoria") as HTMLInputElement).value =
      cat.imagen;

    document.querySelector(
      ".modal-encabezado h3"
    )!.textContent = `Editar Categoría ID: ${idCategoria}`;
    (document.querySelector(".btn-guardar") as HTMLButtonElement).textContent =
      "Guardar Cambios";

    this.modal.style.display = "flex";
  }

  async manejarEliminar(idCategoria: number): Promise<void> {
    const cat = this.categorias.find((c) => c.id === idCategoria);
    if (!cat) return;

    if (
      !confirm(`¿Estás seguro que deseas eliminar la categoría: ${cat.nombre}?`)
    ) {
      return;
    }

    try {
      await CategoriaService.eliminarCategoria(idCategoria);
      alert("Categoría eliminada.");
      await this.cargarCategorias();
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);

      let mensajeError = "No se pudo eliminar la categoría.";
      if (error instanceof Error) {
        mensajeError = error.message;
      }
      alert(mensajeError);
    }
  }

  async manejarSubmit(event: Event): Promise<void> {
    event.preventDefault();

    const datosForm = {
      nombre: (document.getElementById("nombre-categoria") as HTMLInputElement)
        .value,
      descripcion: (
        document.getElementById("descripcion-categoria") as HTMLTextAreaElement
      ).value,
      imagen:
        (document.getElementById("imagen-categoria") as HTMLInputElement)
          .value || IMAGEN_DEFAULT,
    };

    try {
      if (this.idCategoriaEnEdicion === null) {
        console.log("Creando nueva categoría...");
        await CategoriaService.crearCategoria(datosForm);
        alert("Categoría creada exitosamente.");
      } else {
        console.log(
          `Actualizando categoría ID: ${this.idCategoriaEnEdicion}...`
        );
        await CategoriaService.modificarCategoria(
          this.idCategoriaEnEdicion,
          datosForm
        );
        alert("Categoría actualizada exitosamente.");
      }

      this.cerrarModal();
      await this.cargarCategorias();
    } catch (error) {
      console.error("Error al guardar la categoría:", error);

      let mensajeError = "Error al guardar la categoría.";
      if (error instanceof Error) {
        mensajeError = error.message;
      }
      alert(mensajeError);
    }
  }
    cerrarSesion(): void {
    if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
      localStorage.removeItem("food_store_user");
      window.location.href = "../../login/login.html";
    }
  }

  adjuntarEventos(): void {
    const newBtn = document.querySelector(".btn-nueva-categoria");
    newBtn?.addEventListener("click", () => this.abrirModalParaCrear());

    this.formulario?.addEventListener("submit", (e) => this.manejarSubmit(e));

    this.modal?.addEventListener("click", (e: Event) => {
      if (e.target === this.modal) {
        this.cerrarModal();
      }
    });
    const closeBtn = document.querySelector(".modal-cerrar");
    const cancelBtn = document.querySelector(".btn-cancelar");

    this.botonCerrarSesion?.addEventListener("click", () => cerrarSesion())
    cancelBtn?.addEventListener("click", () => this.cerrarModal());
    closeBtn?.addEventListener("click", () => this.cerrarModal());
  }
}

//Inicializar
const categoriasApp = new ComponenteCategorias();
categoriasApp.inicializar();
