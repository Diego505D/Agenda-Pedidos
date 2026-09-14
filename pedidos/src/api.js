import { API_URL } from "./config";

export const obtenerPedidos = async () => {
  const respuesta = await fetch(API_URL);

  if (!respuesta.ok) {
    throw new Error("No se pudieron cargar los pedidos");
  }

  return await respuesta.json();
};

export const crearPedido = async (pedido) => {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pedido),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo registrar el pedido");
  }

  return await respuesta.json();
};

export const actualizarPedido = async (id, pedido) => {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(pedido),
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo actualizar el pedido");
  }

  return await respuesta.json();
};

export const eliminarPedido = async (id) => {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!respuesta.ok) {
    throw new Error("No se pudo eliminar el pedido");
  }
};