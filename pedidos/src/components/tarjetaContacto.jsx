
function TarjetaContacto({ pedido, onEditar, onEliminar }) {
  return (
    <div className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold text-gray-800">
          {pedido.nombre}
        </h3>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            pedido.estado === "Entregado"
              ? "bg-green-100 text-green-700"
              : pedido.estado === "En camino"
              ? "bg-blue-100 text-blue-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {pedido.estado}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <p>
          <strong>📍 Dirección:</strong> {pedido.direccion}
        </p>

        <p>
          <strong>📞 Teléfono:</strong> {pedido.telefono}
        </p>

        <p>
          <strong>🛒 Pedido:</strong> {pedido.pedido}
        </p>
      </div>

      <div className="flex gap-3 mt-5">
        <button
          onClick={onEditar}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Editar
        </button>

        <button
          onClick={onEliminar}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
}

export default TarjetaContacto;
