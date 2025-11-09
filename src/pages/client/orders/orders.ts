import { buscarPedidosCliente } from "../../../services/pedido.service";
import type { IPedido } from "../../../types/IPedido";
import type { IUser } from "../../../types/IUser";
import { navigateTo } from "../../../utils/navigate";
import {
  formatMoneda,
  formatFecha,
  getInfoEstado,
} from "../../../utils/formatUtils";
import { cerrarSesion, isLoggedIn } from "../../../utils/auth";


class ClientOrdersApp {
  pedidosGuardados: IPedido[] = [];

  nombreUsuario: HTMLSpanElement | null;
  listaPedidos: HTMLUListElement | null;
  modal: HTMLDialogElement | null;
  modalTitulo: HTMLHeadingElement | null;
  modalBtnCerrar: HTMLButtonElement | null;
  modalFecha: HTMLSpanElement | null;
  modalEstado: HTMLSpanElement | null;
  modalListaProductos: HTMLUListElement | null;
  modalTotal: HTMLSpanElement | null;
  botonCerrarSesion: HTMLButtonElement | null;

  constructor() {
    console.log("Client Orders App cargada.");
    
    this.nombreUsuario = document.getElementById("nombre-usuario") as HTMLSpanElement;
    this.listaPedidos = document.getElementById("lista-pedidos") as HTMLUListElement;
    this.modal = document.getElementById("modal-detalle-pedido") as HTMLDialogElement;
    this.modalTitulo = document.getElementById("modal-id-pedido") as HTMLHeadingElement;
    this.modalBtnCerrar = document.getElementById("modal-btn-cerrar") as HTMLButtonElement;
    this.modalFecha = document.getElementById("modal-fecha") as HTMLSpanElement;
    this.modalEstado = document.getElementById("modal-estado") as HTMLSpanElement;
    this.modalListaProductos = document.getElementById("modal-lista-productos") as HTMLUListElement;
    this.modalTotal = document.getElementById("modal-total") as HTMLSpanElement;
    this.botonCerrarSesion = document.getElementById("boton-cerrar-sesion") as HTMLButtonElement;
  }


  async iniciarPagina(): Promise<void> {
    const usuario = this.verificarUsuario();
    if (!usuario) return; 

    this.adjuntarEventos();

    try {
      const pedidos = await this.obtenerPedidos(usuario.id);
      this.renderizarPedidos(pedidos);
    } catch (error) {
      if (this.listaPedidos) {
        this.listaPedidos.innerHTML = `
          <div class="pagina-pedidos__estado-error">
            Hubo un error al cargar tus pedidos. Intenta de nuevo más tarde.
          </div>
        `;
      }
    }
  }

  verificarUsuario(): IUser | null {
    const user: IUser | null = isLoggedIn();
    
    if (user && this.nombreUsuario) {
      this.nombreUsuario.textContent = `Bienvenid@ ${user.nombre}`;
      return user;
    } else {
      navigateTo("/src/pages/store/home/home.html"); // Ruta a tu home
      return null;
    }
  }

  async obtenerPedidos(idUsuario: number): Promise<IPedido[]> {
    try {
      const pedidos: IPedido[] = await buscarPedidosCliente(idUsuario);
      this.pedidosGuardados = pedidos;
      return pedidos;
    } catch (error) {
      console.error("Error al interno al obtener los pedidos:" + error);
      throw error;
    }
  }

  renderizarPedidos(pedidos: IPedido[]): void {
    
    if (!this.listaPedidos) return;

    if (pedidos.length === 0) {
      this.listaPedidos.innerHTML = `
        <div class="pagina-pedidos__estado-carga">
          Todavía no tienes ningún pedido.
        </div>
      `;
      return;
    }

    this.listaPedidos.innerHTML = "";
    const fragment = document.createDocumentFragment();

    pedidos.forEach((pedido) => {
      const infoEstado = getInfoEstado(pedido.estado);

      const detallesHTML = pedido.detallePedidoDTO
        .map((detalle) => {
          return `
            <li class="pedido-card__detalle-item">
              <span class="pedido-card__detalle-nombre">
                ${detalle.cantidad}x ${detalle.nombreProducto}
              </span>
            </li>
          `;
        })
        .join("");

      const li = document.createElement("li");
      li.className = "pedido-card";
      li.dataset.id = pedido.id.toString();
      li.title = "Click para ver detalle";
      
      li.innerHTML = `
        <div class="pedido-card__header">
          <div>
            <span class="pedido-card__id">Pedido #${pedido.id}</span>
            <span class="pedido-card__fecha">Fecha: ${formatFecha(pedido.fecha)}</span>
          </div>
          <span class="pedido-card__estado ${infoEstado.clase}">
            ${infoEstado.texto}
          </span>
        </div>
        <div class="pedido-card__body">
          <ul class="pedido-card__detalles-lista">
            ${detallesHTML}
          </ul>
        </div>
        <div class="pedido-card__footer">
          <span class="pedido-card__total-etiqueta">Total:</span>
          <span class="pedido-card__total-monto">
            ${formatMoneda(pedido.total)}
          </span>
        </div>
      `;
      fragment.appendChild(li);
    });
    
    this.listaPedidos.appendChild(fragment);
  }

  abrirModalDetalle(pedido: IPedido): void {
    if (!this.modalTitulo || !this.modalFecha || !this.modalEstado || !this.modalTotal || !this.modalListaProductos || !this.modal) return;

    this.modalTitulo.textContent = `Pedido #${pedido.id}`;
    this.modalFecha.textContent = `Fecha: ${formatFecha(pedido.fecha)}`;

    const infoEstado = getInfoEstado(pedido.estado);
    this.modalEstado.innerHTML = `Estado: <span class="pedido-card__estado ${infoEstado.clase}" style="font-size: 0.9rem;">${infoEstado.texto}</span>`;

    this.modalTotal.textContent = formatMoneda(pedido.total);

    this.modalListaProductos.innerHTML = pedido.detallePedidoDTO
      .map(
        (detalle) => `
          <li>
            <span>${detalle.cantidad}x ${detalle.nombreProducto}</span>
            <span>${formatMoneda(detalle.subtotal)}</span>
          </li>
        `
      )
      .join("");

    this.modal.showModal();
  }

  adjuntarEventos(): void {
    this.modalBtnCerrar?.addEventListener("click", () => {
      this.modal?.close();
    });

    this.modal?.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.modal?.close();
      }
    });

    this.listaPedidos?.addEventListener("click", (e) => {
      const tarjeta = (e.target as HTMLElement).closest<HTMLLIElement>(
        ".pedido-card"
      );

      if (!tarjeta) return;
      const pedidoId = tarjeta.dataset.id;
      if (!pedidoId) return;

      const pedidoSeleccionado = this.pedidosGuardados.find(
        (p) => p.id === Number(pedidoId)
      );

      if (pedidoSeleccionado) {
        this.abrirModalDetalle(pedidoSeleccionado);
      }
    });
    
    this.botonCerrarSesion?.addEventListener("click", () => {
      cerrarSesion();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const app = new ClientOrdersApp();
  app.iniciarPagina();
});