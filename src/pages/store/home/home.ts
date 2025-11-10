import type { ICategoria } from "../../../types/ICategoria";
import type { IProducto } from "../../../types/IProduct";
import { cerrarSesion, isAdminUser, isLoggedIn } from "../../../utils/auth";

// --- URLs - Usa los endpoints que YA TIENES ---
const API_BASE_URL_PRODUCTOS = "http://localhost:8080/api/productos";
const API_BASE_URL_CATEGORIAS = "http://localhost:8080/api/categorias";

// --- Clase Principal HomeApp ---
class HomeApp {
  productos: IProducto[] = [];
  categorias: ICategoria[] = [];
  productosFiltrados: IProducto[] = [];
  gridProductos: HTMLElement | null;
  buscador: HTMLInputElement | null;
  filtroCategoria: HTMLSelectElement | null;
  contadorCarrito: HTMLElement | null;
  linkAdmin: HTMLLinkElement | null;
  botonCerrarSesion: HTMLButtonElement | null;
  infoUsuarioContenedor: HTMLDivElement | null;
  linkLogin: HTMLAnchorElement | null;
  linkPedidos: HTMLAnchorElement | null;
  linkProfile: HTMLAnchorElement | null;


  constructor() {
    console.log("Home App cargada.");

    this.gridProductos = document.getElementById("grid-productos");
    this.buscador = document.getElementById(
      "buscador-productos"
    ) as HTMLInputElement;
    this.filtroCategoria = document.getElementById(
      "filtro-categoria"
    ) as HTMLSelectElement;
    this.contadorCarrito = document.getElementById("contador-carrito-header");
    this.linkAdmin = document.getElementById("link-admin") as HTMLLinkElement;
    this.botonCerrarSesion = document.getElementById(
      "btn-cerrar-sesion"
    ) as HTMLButtonElement;
    this.infoUsuarioContenedor = document.getElementById(
      "info-usuario"
    ) as HTMLDivElement;
    this.linkLogin = document.getElementById("link-login") as HTMLAnchorElement;
    this.linkPedidos = document.getElementById('link-pedidos') as HTMLAnchorElement;
    this.linkProfile = document.getElementById('link-profile') as HTMLAnchorElement;
  }

  // --- Inicialización ---
  async inicializarApp(): Promise<void> {
    this.adjuntarEventos();
    await this.verificarAutenticacion();
    await this.cargarCategorias();
    await this.cargarProductos();
    this.actualizarContadorCarrito();
  }

  verificarAutenticacion(): void {
    if (isLoggedIn()) {
      const usuario = this.getUsuarioLogueado();
      if (!usuario) return;

      this.infoUsuarioContenedor?.classList.remove("oculto");
      this.linkLogin?.classList.add("oculto");
      this.actualizarNombreUsuario(usuario.nombre);

      if (isAdminUser() && this.linkAdmin) {
        this.linkAdmin.classList.remove("oculto");
        this.linkPedidos?.classList.add("oculto");

      }
    } else {
      this.infoUsuarioContenedor?.classList.add("oculto");
      this.linkLogin?.classList.remove("oculto");
    }
  }

  getUsuarioLogueado(): any {
    const userData = localStorage.getItem("food_store_user");
    return userData ? JSON.parse(userData) : null;
  }

  actualizarNombreUsuario(nombre: string): void {
    const elementoUsuario = document.getElementById("nombre-usuario");
    if (elementoUsuario) {
      elementoUsuario.textContent = `Bienvenido, ${nombre}`;
    }
  }

  // --- Carga de Datos - LLAMANDO TUS ENDPOINTS EXISTENTES ---
  async cargarCategorias(): Promise<void> {
    try {
      const response = await fetch(API_BASE_URL_CATEGORIAS);
      if (!response.ok) throw new Error("Error al cargar categorías");

      this.categorias = await response.json();
      this.llenarFiltroCategorias();
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  }

  async cargarProductos(): Promise<void> {
    console.log("🔄 cargarProductos() ejecutándose...");

    try {
      if (this.productos.length === 0 && this.gridProductos) {
        this.gridProductos.innerHTML =
          '<div class="estado-carga">Cargando productos...</div>';
      }

      const response = await fetch(API_BASE_URL_PRODUCTOS);
      if (!response.ok) throw new Error(`Error: ${response.status}`);

      this.productos = await response.json();
      this.productosFiltrados = [...this.productos];

      console.log(`✅ Productos cargados: ${this.productos.length}`);
      this.renderizarProductos();
    } catch (error) {
      console.error("❌ Error cargando productos:", error);
      if (this.gridProductos) {
        this.gridProductos.innerHTML =
          '<div class="estado-error">Error al cargar los productos</div>';
      }
    }
  }

  // --- Renderizdo ---
  llenarFiltroCategorias(): void {
    if (!this.filtroCategoria) return;

    this.filtroCategoria.innerHTML =
      '<option value="">Todas las categorías</option>';
    this.categorias.forEach((categoria) => {
      const option = document.createElement("option");
      option.value = categoria.id.toString();
      option.textContent = categoria.nombre;
      this.filtroCategoria!.appendChild(option);
    });
  }

  renderizarProductos(): void {
    if (!this.gridProductos) return;

    console.log("🎨 Renderizando productos...");

    this.gridProductos.innerHTML = "";

    if (this.productosFiltrados.length === 0) {
      this.gridProductos.innerHTML =
        '<div class="estado-carga">No se encontraron productos</div>';
      return;
    }

    const fragment = document.createDocumentFragment();

    this.productosFiltrados.forEach((producto) => {
      const tarjeta = this.crearTarjetaProducto(producto);
      fragment.appendChild(tarjeta);
    });

    this.gridProductos.appendChild(fragment);
    console.log("✅ Productos renderizados");
  }

  crearTarjetaProducto(producto: IProducto): HTMLElement {
    const tarjeta = document.createElement("div");
    tarjeta.className = "tarjeta-producto";
    tarjeta.style.cursor = "pointer";
    tarjeta.title = "Click para ver detalle"

    const stockClass = producto.stock < 10 ? "stock bajo" : "stock";
    const stockText =
      producto.stock > 0 ? `${producto.stock} disponibles` : "Agotado";

    const imagenUrl = producto.imagen || "/img/placeholder.jpg";

    tarjeta.innerHTML = `
        <div class="contenedor-imagen">
            <img src="${imagenUrl}" 
                 alt="${producto.nombre}" 
                 class="imagen-producto"
                 loading="lazy"
                 onerror="this.src='/img/placeholder.jpg'; this.onerror=null;">
        </div>
        <div class="cuerpo-producto">
            <h3>${producto.nombre}</h3>
            <p class="descripcion-producto">${producto.descripcion}</p>
            <div class="precio-stock">
                <span class="precio">$${producto.precio.toFixed(2)}</span>
                <span class="${stockClass}">${stockText}</span>
            </div>
            <button class="btn-ver-detalle">
                Ver Detalle
            </button>
        </div>
    `;
    const botonDetalle = tarjeta.querySelector(
      ".btn-ver-detalle"
    ) as HTMLButtonElement;

    if (botonDetalle) {
      botonDetalle.addEventListener("click", () => {
        this.verDetalleProducto(producto.id);
      });
    }
    tarjeta.addEventListener("click", () => {
      this.verDetalleProducto(producto.id);
    });

    return tarjeta;
  }

  filtrarProductos(): void {
    const textoBusqueda = this.buscador?.value.toLowerCase() || "";
    const categoriaId = this.filtroCategoria?.value || "";

    this.productosFiltrados = this.productos.filter((producto) => {
      const coincideTexto =
        producto.nombre.toLowerCase().includes(textoBusqueda) ||
        producto.descripcion.toLowerCase().includes(textoBusqueda);

      const coincideCategoria =
        !categoriaId || producto.categoriaid.toString() === categoriaId;

      return coincideTexto && coincideCategoria;
    });

    this.renderizarProductos();
  }

  verDetalleProducto(id: number): void {
    window.location.href = `../productDetail/productDetail.html?id=${id}`;
  }

  actualizarContadorCarrito(): void {
    if (!this.contadorCarrito) return;

    const carrito = this.getCarrito();
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    this.contadorCarrito.textContent = totalItems.toString();
  }

  getCarrito(): any[] {
    const carrito = localStorage.getItem("carrito");
    return carrito ? JSON.parse(carrito) : [];
  }

  // --- Eventos ---
  adjuntarEventos(): void {
    this.buscador?.addEventListener("input", () => this.filtrarProductos());
    this.filtroCategoria?.addEventListener("change", () =>
      this.filtrarProductos()
    );
    this.botonCerrarSesion?.addEventListener("click", () => cerrarSesion());
  }
}

// Inicialización
const homeApp = new HomeApp();
homeApp.inicializarApp();
