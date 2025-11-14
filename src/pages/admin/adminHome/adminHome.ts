import {
  getTotalPedidosMes,
  getTotalVentasMes,
  getUltimosPedidos,
} from "../../../services/pedido.service";
import { getTotalProductos } from "../../../services/products.service";
import { getTotalClientes } from "../../../services/user.service";
import type { IPedido } from "../../../types/IPedido";
import { cerrarSesion } from "../../../utils/auth";

class AdminApp {
  botonCerrarSesion: HTMLButtonElement | null;
  totalClientes: HTMLSpanElement | null;
  totalPedidos: HTMLSpanElement | null;
  totalVentas: HTMLSpanElement | null;
  totalProductos: HTMLSpanElement | null;
  tablaPedidos: HTMLTableSectionElement| null;

  constructor() {
    this.botonCerrarSesion = document.getElementById(
      "boton-cerrar-sesion"
    ) as HTMLButtonElement;
    this.totalClientes = document.getElementById(
      "stat-clientes"
    ) as HTMLSpanElement;
    this.totalPedidos = document.getElementById(
      "stat-pedidos"
    ) as HTMLSpanElement;
    this.totalVentas = document.getElementById(
      "stat-ventas"
    ) as HTMLSpanElement;
    this.totalProductos = document.getElementById(
      "stat-productos"
    ) as HTMLSpanElement;
    this.tablaPedidos = document.getElementById("lista-pedidos-recientes") as HTMLTableSectionElement;
  }

  inicializar(): void {
    this.adjuntarEventos();
    this.cargarStats();
    this.renderizarTabla();
  }

  adjuntarEventos(): void {
    this.botonCerrarSesion?.addEventListener("click", () => cerrarSesion());
  }
  async cargarStats(): Promise<void> {
    try {
      // ejecutar las peticiones en paralelo
      const [clientes, ventas, pedidos, productos] = await Promise.all([
        getTotalClientes(),
        getTotalVentasMes(),
        getTotalPedidosMes(),
        getTotalProductos(),
      ]);

      console.log(ventas);
      // actualizar iu
      this.actualizarStat(this.totalClientes, clientes);
      this.actualizarStat(this.totalVentas, `$ ${ventas.toFixed(2)}`);
      this.actualizarStat(this.totalPedidos, pedidos);
      this.actualizarStat(this.totalProductos, productos);
    } catch (error) {
      console.error("Error al cargar las estadísticas:", error);
      // Si algo falla, actualiza todos los stats con un error
      this.actualizarStat(this.totalClientes, null);
      this.actualizarStat(this.totalVentas, null);
      this.actualizarStat(this.totalPedidos, null);
      this.actualizarStat(this.totalProductos, null);
    }
  }
  private actualizarStat(
    elemento: HTMLSpanElement | null,
    valor: string | number | null
  ): void {
    if (elemento) {
      // Usamos '??' (Nullish Coalescing) para mostrar 'Error' si el valor es null/undefined
      elemento.textContent = valor?.toString() ?? "Error";
    }
  }
  async renderizarTabla(): Promise<void> {
    try {
      if (this.tablaPedidos) {
        this.tablaPedidos.innerHTML = '<tr><td colspan="4">Cargando...</td></tr>';
      }

      const pedidos: IPedido[] = await getUltimosPedidos();

      if (this.tablaPedidos) {
        this.tablaPedidos.innerHTML = "";

        // Si no hay pedidos, muestra un mensaje
        if (pedidos.length === 0) { // <-- check redundante de tablaPedidos quitado
          this.tablaPedidos.innerHTML =
            '<tr><td colspan="4">No se encontraron pedidos recientes.</td></tr>';
          return;
        }

        // Tu lógica de renderizado está perfecta
        pedidos.forEach((pedido) => {
          const tr = document.createElement("tr");
          const totalFormateado = `$ ${pedido.total.toFixed(2)}`;

          tr.innerHTML = `
            <td>${pedido.id}</td>
            <td>${pedido.usuarioNombre}</td>
            <td>${totalFormateado}</td>
            <td>${pedido.estado}</td>
          `;
          if (this.tablaPedidos) {
            this.tablaPedidos.appendChild(tr);
          }
        });
      }
    } catch (error) {
        console.error("Error al renderizar la tabla de pedidos:", error);
        if (this.tablaPedidos) {
            this.tablaPedidos.innerHTML = '<tr><td colspan="4">Error al cargar pedidos.</td></tr>';
        }
    }
  }
}

const homeApp: AdminApp = new AdminApp();
homeApp.inicializar();
const totalProductos = await getTotalProductos();
console.log(totalProductos);
