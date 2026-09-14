import { useEffect, useState } from "react";
import Login from "./components/login";
import FormularioPedido from "./components/contacto";
import TarjetaContacto from "./components/tarjetaContacto";
import {
  obtenerPedidos,
  crearPedido,
  actualizarPedido,
  eliminarPedido,
} from "./api";
import "./App.css";

function App() {
  // ==========================================
  // SESIÓN
  // ==========================================

  const [sesionActiva, setSesionActiva] = useState(
    localStorage.getItem("sesionActiva") === "true"
  );

  // ==========================================
  // ESTADOS
  // ==========================================

  const [pedidos, setPedidos] = useState([]);
  const [pedidoEditar, setPedidoEditar] = useState(null);

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState("nombreAsc");

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  // Página actual
  const [pagina, setPagina] = useState("dashboard");

  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  const [estadisticas, setEstadisticas] = useState(() => {
    const guardadas = localStorage.getItem("estadisticasPedidos");

    if (guardadas) {
      return JSON.parse(guardadas);
    }

    return {
      total: 0,
      pendientes: 0,
      enCamino: 0,
      entregados: 0,
    };
  });

  // ==========================================
  // ACTUALIZAR ESTADÍSTICAS
  // ==========================================

  const actualizarEstadisticas = (listaPedidos) => {
    const nuevasEstadisticas = {
      total: listaPedidos.length,

      pendientes: listaPedidos.filter(
        (pedido) => pedido.estado === "Pendiente"
      ).length,

      enCamino: listaPedidos.filter(
        (pedido) => pedido.estado === "En camino"
      ).length,

      entregados: listaPedidos.filter(
        (pedido) => pedido.estado === "Entregado"
      ).length,
    };

    setEstadisticas(nuevasEstadisticas);

    localStorage.setItem(
      "estadisticasPedidos",
      JSON.stringify(nuevasEstadisticas)
    );
  };

  // ==========================================
  // CARGAR PEDIDOS
  // ==========================================

  useEffect(() => {
    if (sesionActiva) {
      cargarPedidos();
    }
  }, [sesionActiva]);

  const cargarPedidos = async () => {
    try {
      setCargando(true);
      setError("");

      const datos = await obtenerPedidos();

      setPedidos(datos);

      actualizarEstadisticas(datos);
    } catch (error) {
      setError(
        "No se pudieron cargar los pedidos. Verifica que la API esté funcionando."
      );
    } finally {
      setCargando(false);
    }
  };

  // ==========================================
  // LOGIN
  // ==========================================

  const iniciarSesion = () => {
    setSesionActiva(true);
    setPagina("dashboard");
  };

  // ==========================================
  // CERRAR SESIÓN
  // ==========================================

  const cerrarSesion = () => {
    localStorage.removeItem("sesionActiva");

    setSesionActiva(false);
    setPedidos([]);
    setPedidoEditar(null);
    setMensaje("");
    setError("");
    setPagina("dashboard");
  };

  // ==========================================
  // CREAR / EDITAR PEDIDO
  // ==========================================

  const guardarPedido = async (pedido) => {
    try {
      setError("");
      setMensaje("");

      // EDITAR
      if (pedidoEditar) {
        const pedidoActualizado = await actualizarPedido(
          pedidoEditar.id,
          pedido
        );

        const pedidosActualizados = pedidos.map((item) =>
          item.id === pedidoEditar.id ? pedidoActualizado : item
        );

        setPedidos(pedidosActualizados);

        actualizarEstadisticas(pedidosActualizados);

        setPedidoEditar(null);

        setMensaje("Pedido actualizado correctamente.");

        // Después de editar vamos a pedidos
        setPagina("pedidos");
      }

      // CREAR
      else {
        const nuevoPedido = await crearPedido(pedido);

        const nuevosPedidos = [...pedidos, nuevoPedido];

        setPedidos(nuevosPedidos);

        actualizarEstadisticas(nuevosPedidos);

        setMensaje("Pedido registrado correctamente.");

        // Después de registrar vamos a pedidos
        setPagina("pedidos");
      }
    } catch (error) {
      setError(
        "No se pudo guardar el pedido. Verifica la conexión con la API."
      );
    }
  };

  // ==========================================
  // ELIMINAR PEDIDO
  // ==========================================

  const borrarPedido = async (id) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que deseas eliminar este pedido?"
    );

    if (!confirmar) {
      return;
    }

    try {
      setError("");
      setMensaje("");

      await eliminarPedido(id);

      const pedidosActualizados = pedidos.filter(
        (pedido) => pedido.id !== id
      );

      setPedidos(pedidosActualizados);

      actualizarEstadisticas(pedidosActualizados);

      setMensaje("Pedido eliminado correctamente.");
    } catch (error) {
      setError(
        "No se pudo eliminar el pedido. Verifica la conexión con la API."
      );
    }
  };

  // ==========================================
  // BUSCAR Y ORDENAR
  // ==========================================

  const pedidosFiltrados = [...pedidos]
    .filter((pedido) => {
      const textoBusqueda = busqueda.toLowerCase().trim();

      return (
        pedido.nombre?.toLowerCase().includes(textoBusqueda) ||
        pedido.direccion?.toLowerCase().includes(textoBusqueda) ||
        pedido.telefono?.toLowerCase().includes(textoBusqueda) ||
        pedido.pedido?.toLowerCase().includes(textoBusqueda) ||
        pedido.estado?.toLowerCase().includes(textoBusqueda)
      );
    })
    .sort((a, b) => {
      if (orden === "nombreAsc") {
        return a.nombre.localeCompare(b.nombre);
      }

      if (orden === "nombreDesc") {
        return b.nombre.localeCompare(a.nombre);
      }

      if (orden === "estado") {
        return a.estado.localeCompare(b.estado);
      }

      return 0;
    });

  // ==========================================
  // SI NO HAY SESIÓN
  // ==========================================

  if (!sesionActiva) {
    return <Login onLogin={iniciarSesion} />;
  }

  // ==========================================
  // CAMBIAR DE PÁGINA
  // ==========================================

  const cambiarPagina = (nuevaPagina) => {
    setPagina(nuevaPagina);

    setMensaje("");
    setError("");

    // Si entramos a registrar y no estamos editando
    if (nuevaPagina === "registrar") {
      setPedidoEditar(null);
    }
  };

  // ==========================================
  // DASHBOARD
  // ==========================================

  const renderDashboard = () => {
    return (
      <div>
        <div className="mb-8">
          <p className="text-orange-500 font-semibold uppercase text-sm tracking-wide">
            Panel administrativo
          </p>

          <h2 className="text-3xl font-bold text-slate-800 mt-1">
            Dashboard
          </h2>

          <p className="text-slate-500 mt-2">
            Resumen general de los pedidos registrados.
          </p>
        </div>

        {/* ESTADÍSTICAS */}

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          {/* TOTAL */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center">

              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Total pedidos
                </p>

                <p className="text-4xl font-bold text-slate-800 mt-2">
                  {estadisticas.total}
                </p>
              </div>

              <div className="bg-orange-100 text-orange-600 rounded-xl p-4 text-2xl">
                🛵
              </div>

            </div>
          </div>

          {/* PENDIENTES */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center">

              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Pendientes
                </p>

                <p className="text-4xl font-bold text-yellow-600 mt-2">
                  {estadisticas.pendientes}
                </p>
              </div>

              <div className="bg-yellow-100 text-yellow-600 rounded-xl p-4 text-2xl">
                ⏳
              </div>

            </div>
          </div>

          {/* EN CAMINO */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center">

              <div>
                <p className="text-slate-500 text-sm font-medium">
                  En camino
                </p>

                <p className="text-4xl font-bold text-blue-600 mt-2">
                  {estadisticas.enCamino}
                </p>
              </div>

              <div className="bg-blue-100 text-blue-600 rounded-xl p-4 text-2xl">
                🚚
              </div>

            </div>
          </div>

          {/* ENTREGADOS */}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex justify-between items-center">

              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Entregados
                </p>

                <p className="text-4xl font-bold text-green-600 mt-2">
                  {estadisticas.entregados}
                </p>
              </div>

              <div className="bg-green-100 text-green-600 rounded-xl p-4 text-2xl">
                ✓
              </div>

            </div>
          </div>

        </section>

        {/* ACCESOS RÁPIDOS */}

        <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">

          <button
            onClick={() => cambiarPagina("registrar")}
            className="text-left bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-orange-300 transition"
          >
            <div className="flex items-center gap-4">

              <div className="bg-orange-100 text-orange-600 rounded-xl p-4 text-2xl">
                📝
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Registrar pedido
                </h3>

                <p className="text-slate-500 mt-1">
                  Crear un nuevo pedido para un cliente.
                </p>
              </div>

            </div>
          </button>

          <button
            onClick={() => cambiarPagina("pedidos")}
            className="text-left bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition"
          >
            <div className="flex items-center gap-4">

              <div className="bg-blue-100 text-blue-600 rounded-xl p-4 text-2xl">
                📋
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800">
                  Ver pedidos
                </h3>

                <p className="text-slate-500 mt-1">
                  Consultar, editar y eliminar pedidos.
                </p>
              </div>

            </div>
          </button>

        </section>
      </div>
    );
  };

  // ==========================================
  // REGISTRAR PEDIDO
  // ==========================================

  const renderRegistrar = () => {
    return (
      <div className="max-w-3xl mx-auto">

        <div className="mb-8">
          <p className="text-orange-500 font-semibold uppercase text-sm tracking-wide">
            Gestión de pedidos
          </p>

          <h2 className="text-3xl font-bold text-slate-800 mt-1">
            {pedidoEditar
              ? "Editar pedido"
              : "Registrar nuevo pedido"}
          </h2>

          <p className="text-slate-500 mt-2">
            {pedidoEditar
              ? "Modifica la información del pedido seleccionado."
              : "Completa la información del cliente y del pedido."}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
            <strong>Error:</strong> {error}
          </div>
        )}

        {mensaje && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl">
            <strong>Correcto:</strong> {mensaje}
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

          <div className="flex items-center gap-4 border-b border-slate-200 pb-6 mb-6">

            <div className="bg-orange-100 text-orange-600 rounded-xl p-4 text-2xl">
              {pedidoEditar ? "✏️" : "📝"}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                {pedidoEditar
                  ? "Información del pedido"
                  : "Datos del pedido"}
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                Todos los campos son importantes.
              </p>
            </div>

          </div>

          <FormularioPedido
            pedidoEditar={pedidoEditar}
            onGuardar={guardarPedido}
            onCancelar={() => {
              setPedidoEditar(null);
              setMensaje("");
              setError("");
              setPagina("pedidos");
            }}
          />

        </section>
      </div>
    );
  };

  // ==========================================
  // LISTA DE PEDIDOS
  // ==========================================

  const renderPedidos = () => {
    return (
      <div>

        <div className="mb-8">
          <p className="text-orange-500 font-semibold uppercase text-sm tracking-wide">
            Gestión de pedidos
          </p>

          <h2 className="text-3xl font-bold text-slate-800 mt-1">
            Pedidos registrados
          </h2>

          <p className="text-slate-500 mt-2">
            Consulta y administra todos los pedidos registrados.
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl">
            <strong>Error:</strong> {error}
          </div>
        )}

        {mensaje && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl">
            <strong>Correcto:</strong> {mensaje}
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">

          {/* BUSCADOR */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">

            <div>
              <h3 className="text-2xl font-bold text-slate-800">
                Lista de pedidos
              </h3>

              <p className="text-slate-500 text-sm mt-1">
                {pedidosFiltrados.length} pedido(s) encontrado(s)
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">

              <div className="relative">

                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔎
                </span>

                <input
                  type="text"
                  placeholder="Buscar pedido..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full sm:w-72 border border-slate-300 rounded-xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                />

              </div>

              <select
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                className="border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 bg-white"
              >
                <option value="nombreAsc">
                  Nombre A-Z
                </option>

                <option value="nombreDesc">
                  Nombre Z-A
                </option>

                <option value="estado">
                  Estado
                </option>
              </select>

            </div>

          </div>

          {/* CARGANDO */}

          {cargando ? (

            <div className="py-16 text-center">
              <div className="text-4xl mb-3">
                🛵
              </div>

              <p className="text-slate-500 font-medium">
                Cargando pedidos...
              </p>
            </div>

          ) : pedidosFiltrados.length === 0 ? (

            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl">

              <div className="text-5xl mb-4">
                📭
              </div>

              <h3 className="text-xl font-bold text-slate-700">
                No hay pedidos registrados
              </h3>

              <p className="text-slate-500 mt-2 mb-5">
                Registra un pedido para que aparezca en esta sección.
              </p>

              <button
                onClick={() => cambiarPagina("registrar")}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-3 rounded-lg transition"
              >
                Registrar pedido
              </button>

            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {pedidosFiltrados.map((pedido) => (

                <TarjetaContacto
                  key={pedido.id}
                  pedido={pedido}

                  onEditar={() => {
                    setPedidoEditar(pedido);
                    setMensaje("");
                    setError("");
                    setPagina("registrar");

                    window.scrollTo({
                      top: 0,
                      behavior: "smooth",
                    });
                  }}

                  onEliminar={() => borrarPedido(pedido.id)}
                />

              ))}

            </div>

          )}

        </section>
      </div>
    );
  };

  // ==========================================
  // INTERFAZ PRINCIPAL
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="bg-slate-900 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-6 py-5">

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

            {/* LOGO */}

            <div className="flex items-center gap-3">

              <div className="bg-orange-500 rounded-xl p-3 text-2xl">
                🛵
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Agenda de Pedidos
                </h1>

                <p className="text-slate-300 text-sm">
                  Sistema de gestión de domicilios
                </p>
              </div>

            </div>

            {/* MENÚ */}

            <nav className="flex flex-wrap gap-2">

              <button
                onClick={() => cambiarPagina("dashboard")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  pagina === "dashboard"
                    ? "bg-orange-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                📊 Dashboard
              </button>

              <button
                onClick={() => cambiarPagina("registrar")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  pagina === "registrar"
                    ? "bg-orange-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                📝 Registrar
              </button>

              <button
                onClick={() => cambiarPagina("pedidos")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  pagina === "pedidos"
                    ? "bg-orange-500 text-white"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                📋 Pedidos
              </button>

              <button
                onClick={cerrarSesion}
                className="px-4 py-2 rounded-lg font-semibold bg-red-500 hover:bg-red-600 transition"
              >
                🚪 Salir
              </button>

            </nav>

          </div>

        </div>

      </header>

      {/* CONTENIDO */}

      <main className="max-w-7xl mx-auto px-6 py-8">

        {pagina === "dashboard" && renderDashboard()}

        {pagina === "registrar" && renderRegistrar()}

        {pagina === "pedidos" && renderPedidos()}

      </main>

      {/* FOOTER */}

      <footer className="bg-slate-900 text-slate-400 text-center py-5 mt-10">

        <p className="text-sm">
          Agenda de Pedidos • Sistema de gestión de domicilios
        </p>

      </footer>

    </div>
  );
}

export default App;

