import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { BackofficeDialog } from "../components/index.js";
import { useSnackbar } from "../../../contexts/SnackbarContext.jsx";
import { ConfirmModal } from "../../../components/ui/ConfirmModal.jsx";
import {
  getCachedClients,
  saveCachedClient,
  deleteCachedClient,
} from "../utils/clientStorage.js";

const renderPedidosBadge = (count) => {
  const num = Number(count || 0);
  if (num === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500 border border-slate-200/50">
        Sin pedidos
      </span>
    );
  }
  if (num <= 2) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
        Casual ({num})
      </span>
    );
  }
  if (num <= 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 border border-indigo-100">
        Frecuente ({num})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-800 border border-amber-200 shadow-sm animate-pulse">
      👑 VIP ({num})
    </span>
  );
};

export function ClientsView() {
  const snackbar = useSnackbar();
  const [clients, setClients] = useState([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    id: null,
    nombre: "",
    telefono: "",
    direccion: "",
    observaciones: "",
  });
  const [confirmDeleteClient, setConfirmDeleteClient] = useState({ open: false, client: null });

  const loadClients = () => {
    const data = getCachedClients();
    setClients(data);
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) =>
      String(c.nombre || "").toLowerCase().includes(q) ||
      String(c.telefono || "").toLowerCase().includes(q) ||
      String(c.direccion || "").toLowerCase().includes(q)
    );
  }, [search, clients]);

  const openCreate = () => {
    setForm({
      id: null,
      nombre: "",
      telefono: "",
      direccion: "",
      observaciones: "",
    });
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setForm({
      id: c.id,
      nombre: c.nombre || "",
      telefono: c.telefono || "",
      direccion: c.direccion || "",
      observaciones: c.observaciones || "",
    });
    setModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const nombre = form.nombre.trim();
    const telefono = form.telefono.trim();

    if (!nombre && !telefono) {
      snackbar.error("Ingresá al menos un Nombre o Teléfono.");
      return;
    }

    try {
      const saved = saveCachedClient({
        id: form.id,
        nombre,
        telefono,
        direccion: form.direccion.trim(),
        observaciones: form.observaciones.trim(),
      });

      if (saved) {
        loadClients();
        setModalOpen(false);
        snackbar.success(form.id ? "Cliente actualizado con éxito." : "Cliente registrado con éxito.");
      } else {
        throw new Error("No se pudo guardar el cliente.");
      }
    } catch (err) {
      snackbar.error(err.message || "Error al guardar el cliente.");
    }
  };

  const handleDelete = () => {
    const target = confirmDeleteClient.client;
    if (!target?.id) return;
    try {
      const ok = deleteCachedClient(target.id);
      if (ok) {
        loadClients();
        setConfirmDeleteClient({ open: false, client: null });
        snackbar.success(`Cliente "${target.nombre || "Sin nombre"}" eliminado.`);
      } else {
        throw new Error("El cliente no pudo ser eliminado.");
      }
    } catch (err) {
      snackbar.error(err.message || "Error al eliminar el cliente.");
    }
  };

  return (
    <>
      <div className="space-y-5 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-lg shadow-slate-200/40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Clientes Delivery</h2>
            <p className="text-sm text-slate-500">Catálogo de clientes registrados para envíos a domicilio</p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:from-indigo-600 hover:to-indigo-700 hover:shadow-indigo-500/40"
          >
            <Plus className="h-4 w-4" />
            Registrar Cliente
          </button>
        </div>

        <div>
          <label className="group relative inline-flex min-h-[44px] w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-500 transition-all duration-200 focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-md sm:w-[320px]">
            <Search className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre, teléfono o dirección..."
              className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all"
            />
          </label>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm">
          <table className="min-w-[760px] w-full text-sm">
            <thead className="bg-gradient-to-b from-slate-50 to-slate-100/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Nombre</th>
                <th className="px-5 py-4">Teléfono</th>
                <th className="px-5 py-4 text-center">Pedidos</th>
                <th className="px-5 py-4">Dirección / Referencia</th>
                <th className="px-5 py-4">Observaciones</th>
                <th className="px-5 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/60">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <Search className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                    <p className="text-sm font-medium text-slate-500">
                      {search.trim() ? "Sin resultados para la búsqueda" : "Sin clientes registrados todavía"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {search.trim() ? "Probá con otros términos" : "Registrá tu primer cliente"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((c) => (
                  <tr key={c.id} className="group transition-all duration-200 hover:bg-slate-50/80">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
                          {c.nombre?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span className="font-semibold text-slate-900">{c.nombre || "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 tabular-nums text-slate-600">{c.telefono || "—"}</td>
                    <td className="px-5 py-4 text-center">{renderPedidosBadge(c.pedidosCount)}</td>
                    <td className="px-5 py-4 max-w-[280px] break-words whitespace-pre-wrap text-slate-700">{c.direccion || "—"}</td>
                    <td className="px-5 py-4 max-w-[220px] break-words text-xs text-slate-500 whitespace-pre-wrap">{c.observaciones || "—"}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(c)}
                          title="Editar cliente"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-200 hover:bg-slate-200 hover:text-slate-800"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteClient({ open: true, client: c })}
                          title="Eliminar cliente"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600 transition-all duration-200 hover:bg-rose-200 hover:text-rose-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <BackofficeDialog maxWidthClass="max-w-md" onBackdropClick={() => setModalOpen(false)}>
          <form onSubmit={handleSave} className="w-full min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {form.id ? "Editar Cliente" : "Registrar Nuevo Cliente"}
              </h3>
              {form.id && renderPedidosBadge(clients.find(c => c.id === form.id)?.pedidosCount)}
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nombre Completo</label>
                <input
                  value={form.nombre}
                  onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Nombre de cliente"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Teléfono</label>
                <input
                  value={form.telefono}
                  onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
                  placeholder="Ej. 88888888"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Dirección / Referencia de Envío</label>
                <textarea
                  value={form.direccion}
                  onChange={(e) => setForm((f) => ({ ...f, direccion: e.target.value }))}
                  placeholder="Dirección exacta para el despacho..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Observaciones recurrentes (Ej. portón verde)</label>
                <textarea
                  value={form.observaciones}
                  onChange={(e) => setForm((f) => ({ ...f, observaciones: e.target.value }))}
                  placeholder="Observaciones de entrega generales..."
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 sm:w-auto transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 sm:w-auto transition"
              >
                Guardar Cliente
              </button>
            </div>
          </form>
        </BackofficeDialog>
      )}

      <ConfirmModal
        open={confirmDeleteClient.open}
        onClose={() => setConfirmDeleteClient({ open: false, client: null })}
        onConfirm={handleDelete}
        title="Eliminar Cliente"
        message={
          confirmDeleteClient.client
            ? `¿Estás seguro de que deseas eliminar al cliente "${confirmDeleteClient.client.nombre || "Sin nombre"}" del directorio?`
            : "¿Eliminar cliente?"
        }
        confirmLabel="Eliminar"
        variant="danger"
      />
    </>
  );
}
