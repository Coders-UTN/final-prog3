import type { IEstadoPedido } from "../types/IPedido";

 
export const formatFecha = (fechaString: string): string => {
  const fecha = new Date(fechaString);
  return fecha.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};


export const formatMoneda = (valor: number): string => {
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
  });
};


export const getInfoEstado = (estado: IEstadoPedido): { texto: string; clase: string } => {
  const claseBase = estado.toLowerCase().replace("_", "-");
  const texto = estado.replace("_", " ").toLowerCase();
  const textoCapitalizado = texto.charAt(0).toUpperCase() + texto.slice(1);

  return {
    texto: textoCapitalizado,
    clase: `pedido-card__estado--${claseBase}`, 
  };
};