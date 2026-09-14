
import { useEffect, useState } from "react";

function FormularioPedido({ pedidoEditar, onGuardar, onCancelar }) {
  const [formulario, setFormulario] = useState({
    nombre: "",
    direccion: "",
    telefono: "",
    pedido: "",
    estado: "Pendiente",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (pedidoEditar) {
      setFormulario(pedidoEditar);
    } else {
      setFormulario({
        nombre: "",
        direccion: "",
        telefono: "",
        pedido: "",
        estado: "Pendiente",
      });
    }

    setError("");
  }, [pedidoEditar]);

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setFormulario({
      ...formulario,
      [name]: value,
    });

    setError("");
  };

  const enviarFormulario = (e) => {
    e.preventDefault();

    if (!formulario.nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    if (!formulario.direccion.trim()) {
      setError("La dirección es obligatoria");
      return;
    }

    if (!formulario.telefono.trim()) {
      setError("El teléfono es obligatorio");
      return;
    }

    if (!formulario.pedido.trim()) {
      setError("Debes indicar el pedido");
      return;
    }

    if (formulario.telefono.length < 7) {
      setError("El teléfono debe tener al menos 7 números");
      return;
    }

    setError("");
    onGuardar(formulario);
  };

  return (
    <form onSubmit={enviarFormulario} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Nombre del cliente
        </label>

        <input
          type="text"
          name="nombre"
          value={formulario.nombre}
          onChange={manejarCambio}
          placeholder="Ejemplo: Carlos Pérez"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Dirección
        </label>

        <input
          type="text"
          name="direccion"
          value={formulario.direccion}
          onChange={manejarCambio}
          placeholder="Ejemplo: Calle 50 #45-20"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Teléfono
        </label>

        <input
          type="tel"
          name="telefono"
          value={formulario.telefono}
          onChange={manejarCambio}
          placeholder="Ejemplo: 3001234567"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Pedido
        </label>

        <textarea
          name="pedido"
          value={formulario.pedido}
          onChange={manejarCambio}
          placeholder="Describe el pedido"
          rows="4"
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Estado
        </label>

        <select
          name="estado"
          value={formulario.estado}
          onChange={manejarCambio}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Pendiente">Pendiente</option>
          <option value="En camino">En camino</option>
          <option value="Entregado">Entregado</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition"
        >
          {pedidoEditar ? "Guardar cambios" : "Registrar pedido"}
        </button>

        {pedidoEditar && (
          <button
            type="button"
            onClick={onCancelar}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition"
          >
            Cancelar edición
          </button>
        )}
      </div>
    </form>
  );
}

export default FormularioPedido;

