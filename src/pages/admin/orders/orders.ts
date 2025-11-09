import * as OrderService from "../../../services/pedido.service";
import type { IPedido } from "../../../types/IPedido";
import { cerrarSesion, isAdminUser } from "../../../utils/auth";
import { navigateTo } from "../../../utils/navigate";

class ComponenteOrders {
  orders: IPedido[] = [];

  modal: HTMLElement | null;
  tablaCuerpo: HTMLElement | null;
  listaItemsModal: HTMLElement | null;
  selectEstado: HTMLSelectElement | null;
  botonCerrarSesion: HTMLButtonElement | null;

  private idEnEdicion: number | null = null;
  private submitHandler: (e: Event) => void;

  constructor() {
    console.log("Componente de Pedidos (Orders) cargado.");
    this.modal = document.getElementById("modal-detalle-pedido");
    this.tablaCuerpo = document.querySelector(".tarjeta table tbody");
    this.listaItemsModal = document.getElementById("lista-items-pedido");
    this.selectEstado = document.getElementById(
      "select-estado-pedido"
    ) as HTMLSelectElement;
    this.botonCerrarSesion = document.getElementById(
      "boton-cerrar-sesion"
    ) as HTMLButtonElement;

    this.submitHandler = this.manejarActualizarEstado.bind(this);
  }

  async inicializarApp(): Promise<void> {
    const contenedor = document.querySelector(
      ".contenedor-principal"
    ) as HTMLElement;
    const esAdmin = isAdminUser();
    if (!esAdmin) {
      navigateTo("/src/pages/store/home/home.html");
      return;
    }

    if (contenedor) {
      contenedor.style.display = "flex";
    }

    await this.cargarPedidos();
    this.adjuntarEventosBase();
  }

  async cargarPedidos(): Promise<void> {
    try {
      this.orders = await OrderService.findAllOrders();
      this.renderizarPedidos();
    } catch (error) {
      console.error("Error al cargar los pedidos:", error);

      let mensajeError = "No se pudieron cargar los pedidos desde el servidor.";
      if (error instanceof Error) {
        mensajeError += `\n\nError: ${error.message}`;
      }
      alert(mensajeError);
    }
  }

  renderizarPedidos(): void {
    if (!this.tablaCuerpo) return;
    this.tablaCuerpo.innerHTML = "";

    this.orders.forEach((order) => {
      const row = this.crearFilaPedido(order);
      this.tablaCuerpo!.appendChild(row);
    });
  }

  crearFilaPedido(order: IPedido): HTMLTableRowElement {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td class="col-id">${order.id}</td>
            <td>${new Date(order.fecha).toLocaleDateString()}</td>
            <td> ${order.usuarioNombre}</td>
            <td>$${order.total.toFixed(2)}</td>
            <td><span class="estado ${order.estado.toLowerCase()}">${
      order.estado
    }</span></td>
            <td class="col-acciones">
                <button class="btn-editar">Ver Detalles</button>
            </td>
        `;

    row.querySelector(".btn-editar")?.addEventListener("click", () => {
      this.manejarVerDetalle(order.id);
    });

    return row;
  }

  manejarVerDetalle(idPedido: number): void {
    const pedido = this.orders.find((p) => p.id === idPedido);
    if (!pedido || !this.listaItemsModal || !this.selectEstado) return;

    this.idEnEdicion = idPedido;

    if (this.modal) {
      this.modal.style.display = "flex";
    }

    (
      document.getElementById("modal-titulo-pedido") as HTMLElement
    ).textContent = `Detalle del Pedido #${pedido.id}`;

    this.listaItemsModal.innerHTML = "";
    pedido.detallePedidoDTO.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.cantidad}x ${
        item.nombreProducto
      } ($${item.precioUnitario.toFixed(2)} c/u)`;
      this.listaItemsModal!.appendChild(li);
    });

    this.selectEstado.value = pedido.estado;
  }

  cerrarModal(): void {
    if (this.modal) {
      this.modal.style.display = "none";
      this.idEnEdicion = null;
    }
  }

  async manejarActualizarEstado(): Promise<void> {
    if (!this.idEnEdicion || !this.selectEstado) return;

    const nuevoEstado = this.selectEstado.value;

    try {
      await OrderService.updateOrderStatus(this.idEnEdicion, nuevoEstado);
      await this.cargarPedidos();
      this.cerrarModal();
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      let mensajeError = "Error al intentar actualizar el estado.";
      if (error instanceof Error) {
        mensajeError = error.message;
      }
      alert(mensajeError);
    }
  }

  adjuntarEventosBase(): void {
    const btnGuardar = document.getElementById("btn-guardar-estado");
    if (btnGuardar) {
      btnGuardar.addEventListener("click", this.submitHandler);
    }

    this.botonCerrarSesion?.addEventListener("click", () => cerrarSesion());

    if (this.modal) {
      this.modal.addEventListener("click", (e: Event) => {
        if (e.target === this.modal) {
          this.cerrarModal();
        }
      });
    }

    const closeBtn = document.querySelector(
      "#modal-detalle-pedido .modal-cerrar"
    );
    closeBtn?.addEventListener("click", () => this.cerrarModal());

    const cancelBtn = document.querySelector(
      "#modal-detalle-pedido .btn-cancelar"
    );
    cancelBtn?.addEventListener("click", () => this.cerrarModal());
  }
}

const pedidosApp = new ComponenteOrders();
pedidosApp.inicializarApp();
