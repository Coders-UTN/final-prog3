import type { IErrorResponse } from "../types/IErrorResponse";
import type { IPedido } from "../types/IPedido";

const API_BASE_URL_PEDIDOS = "http://localhost:8080/api/pedidos";

export const findAllOrders = async (): Promise<IPedido[]> => {
  const response = await fetch(API_BASE_URL_PEDIDOS);
  if (!response.ok) {
    const errorBody: IErrorResponse = await response.json();
    throw new Error(errorBody.mensaje);
  }
  return await response.json();
};

export const buscarPedidosCliente = async (
  idUsuario: number
): Promise<IPedido[]> => {
  const response = await fetch(
    `${API_BASE_URL_PEDIDOS}?usuarioId=${idUsuario}`
  );

  if (!response.ok) {
    const errorBody: IErrorResponse = await response.json();
    throw new Error(errorBody.mensaje);
  }

  return await response.json();
};

export const updateOrderStatus = async (
  id: number,
  estado: string
): Promise<IPedido> => {
  const response = await fetch(`${API_BASE_URL_PEDIDOS}/${id}/estado`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: estado }),
  });

  if (!response.ok) {
    const errorBody: IErrorResponse = await response.json();
    throw new Error(errorBody.mensaje);
  }
  return await response.json();
};

export const cancelOrder = async (id: number): Promise<IPedido> => {
  const response = await fetch(`${API_BASE_URL_PEDIDOS}/${id}/cancelar`, {
    method: "PUT",
  });

  if (!response.ok) {
    const errorBody: IErrorResponse = await response.json();
    throw new Error(errorBody.mensaje);
  }
  return await response.json();
};
