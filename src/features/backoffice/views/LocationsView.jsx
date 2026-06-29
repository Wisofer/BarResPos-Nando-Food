import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Trash2, MapPin, RefreshCw, Plus, X } from "lucide-react";
import { backofficeApi } from "../services/backofficeApi.js";
import { useSnackbar } from "../../../contexts/SnackbarContext.jsx";
import { ConfirmModal } from "../../../components/ui/ConfirmModal.jsx";
import { BackofficeDialog } from "../components/index.js";

export function LocationsView({ openView }) {
  const snackbar = useSnackbar();
  const [locations, setLocations] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationForm, setLocationForm] = useState({ id: null, nombre: "", descripcion: "", activo: true });
  const [confirmDeleteLocation, setConfirmDeleteLocation] = useState({ open: false, id: null, name: "" });
  const [isFormOpen, setIsFormOpen] = useState(false);

  const normalizeLocation = (l) => ({
    id: l?.id ?? l?.Id,
    nombre: l?.nombre ?? l?.Nombre ?? "",
    descripcion: l?.descripcion ?? l?.Descripcion ?? "",
    activo: l?.activo ?? l?.Activo ?? true,
  });

  const loadLocations = async () => {
    setLoading(true);
    try {
      const [ubic, mesas] = await Promise.all([
        backofficeApi.catalogoUbicaciones(),
        backofficeApi.listMesas()
      ]);
      const rawUbic = Array.isArray(ubic) ? ubic : ubic?.items || [];
      const rawMesas = Array.isArray(mesas) ? mesas : mesas?.items || [];
      setLocations(rawUbic.map(normalizeLocation));
      setTables(rawMesas);
    } catch (e) {
      snackbar.error(e.message || "No se pudieron cargar ubicaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLocations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const editLocation = async (id) => {
    setSaving(true);
    try {
      const data = await backofficeApi.getUbicacion(id);
      setLocationForm({
        id: data?.id ?? id,
        nombre: data?.nombre || "",
        descripcion: data?.descripcion || "",
        activo: data?.activo !== false,
      });
      setIsFormOpen(true);
    } catch (e) {
      snackbar.error(e.message || "No se pudo cargar ubicación.");
    } finally {
      setSaving(false);
    }
  };

  const saveLocation = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        nombre: locationForm.nombre.trim(),
        descripcion: locationForm.descripcion?.trim() || null,
        activo: Boolean(locationForm.activo),
      };
      if (locationForm.id) {
        await backofficeApi.updateUbicacion(locationForm.id, body);
      } else {
        await backofficeApi.createUbicacion(body);
      }
      await loadLocations();
      setLocationForm({ id: null, nombre: "", descripcion: "", activo: true });
      setIsFormOpen(false);
      snackbar.success(locationForm.id ? "Ubicación actualizada correctamente." : "Ubicación creada correctamente.");
    } catch (e) {
      snackbar.error(e.message || "No se pudo guardar la ubicación.");
    } finally {
      setSaving(false);
    }
  };

  const removeLocation = async (id) => {
    setSaving(true);
    try {
      await backofficeApi.deleteUbicacion(id);
      await loadLocations();
      setConfirmDeleteLocation({ open: false, id: null, name: "" });
      if (locationForm.id === id) {
        setLocationForm({ id: null, nombre: "", descripcion: "", activo: true });
      }
      snackbar.success("Ubicación desactivada/eliminada correctamente.");
    } catch (e) {
      snackbar.error(e.message || "No se pudo eliminar la ubicación.");
    } finally {
      setSaving(false);
    }
  };



  return (
    <div className="flex flex-col gap-4 sm:gap-6 min-h-0 min-w-0 flex-1">
      {/* Apple-style Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/85 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openView("tables")}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-250 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition active:scale-95 shadow-sm"
            title="Volver a mesas"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-800 tracking-wide uppercase">Ubicaciones de Mesas</h2>
            <p className="text-xs text-slate-500">Configura y gestiona las distintas zonas de tu establecimiento.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setLocationForm({ id: null, nombre: "", descripcion: "", activo: true });
              setIsFormOpen(true);
            }}
            className="inline-flex h-9 items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 border border-indigo-700 text-white text-xs font-bold transition shadow-sm active:scale-95 hover:bg-indigo-700"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Nueva Ubicación</span>
          </button>
        </div>
      </div>

      {/* Main Grid View - Full Width */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4 min-h-[300px] flex-1">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">Zonas Registradas</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Listado completo de áreas operacionales para la asignación de mesas.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
            <p className="text-xs font-semibold">Cargando catálogo...</p>
          </div>
        ) : (
          <>
            {locations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-1.5 border border-dashed border-slate-200 rounded-xl">
                <MapPin className="h-8 w-8 text-slate-300" />
                <p className="text-sm font-bold text-slate-555">No hay ubicaciones registradas</p>
                <p className="text-xs text-slate-400">Haz clic en el botón superior para crear una zona.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 overflow-y-auto max-h-[75vh] pr-1">
                {locations
                  .filter((l) => l.activo !== false)
                  .map((l) => {
                    const zoneTables = tables.filter((t) => (t.ubicacionId ?? t.UbicacionId) === l.id);

                    return (
                      <article
                        key={l.id}
                        className="group relative flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:border-slate-200"
                      >
                        <div className="space-y-4">
                          {/* Title and Top Actions */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2 py-0.5 text-[9px] font-bold text-indigo-650 uppercase tracking-wide">
                                {zoneTables.length} {zoneTables.length === 1 ? "mesa" : "mesas"}
                              </span>
                              <h4 className="text-sm font-bold text-slate-800 tracking-tight uppercase">
                                {l.nombre || `Zona ${l.id}`}
                              </h4>
                            </div>

                            {/* Apple/Google-like clean actions toolbar */}
                            <div className="flex gap-0.5 bg-slate-50 p-0.5 rounded-lg border border-slate-100">
                              <button
                                type="button"
                                onClick={() => editLocation(l.id)}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-white hover:text-indigo-650 hover:shadow-sm transition active:scale-95 cursor-pointer"
                                title="Editar"
                              >
                                <Pencil className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteLocation({ open: true, id: l.id, name: l.nombre || `Ubicación ${l.id}` })}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-white hover:text-rose-650 hover:shadow-sm transition active:scale-95 cursor-pointer"
                                title="Eliminar"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 min-h-[48px]">
                            {l.descripcion || "Sin descripción de la zona."}
                          </p>
                        </div>

                        {/* Card Footer: Simple status/indicator */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4">
                          <span className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">Área Operativa</span>
                          <div className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow shadow-emerald-500/20" />
                            <span className="text-[9px] font-bold text-slate-650 uppercase">Activa</span>
                          </div>
                        </div>
                      </article>
                    );
                  })}
              </div>
            )}
          </>
        )}
      </div>

      {isFormOpen && (
        <BackofficeDialog maxWidthClass="max-w-md" onBackdropClick={saving ? undefined : () => {
          setIsFormOpen(false);
          setLocationForm({ id: null, nombre: "", descripcion: "", activo: true });
        }}>
          <form onSubmit={saveLocation} className="w-full min-w-0 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  {locationForm.id ? "Editar ubicación" : "Nueva ubicación"}
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Crea o modifica zonas para agrupar tus mesas operativas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setLocationForm({ id: null, nombre: "", descripcion: "", activo: true });
                }}
                className="text-slate-400 hover:text-slate-650 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nombre de la Zona</label>
                <input
                  value={locationForm.nombre}
                  onChange={(e) => setLocationForm((s) => ({ ...s, nombre: e.target.value }))}
                  placeholder="Nombre (ej: Terraza, Salón Principal)"
                  className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm placeholder:text-slate-400"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Descripción (Opcional)</label>
                <textarea
                  value={locationForm.descripcion}
                  onChange={(e) => setLocationForm((s) => ({ ...s, descripcion: e.target.value }))}
                  placeholder="Ej: Área al aire libre con vista y ventilación"
                  rows={3}
                  className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm placeholder:text-slate-400 resize-none"
                />
              </div>

              <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={locationForm.activo}
                  onChange={(e) => setLocationForm((s) => ({ ...s, activo: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition"
                />
                <span className="text-xs font-semibold text-slate-700">Esta ubicación está activa</span>
              </label>
            </div>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setLocationForm({ id: null, nombre: "", descripcion: "", activo: true });
                }}
                className="w-full rounded-lg border border-slate-250 bg-white px-4 py-2 text-xs font-bold text-slate-650 hover:bg-slate-50 transition active:scale-95 sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow shadow-indigo-150 transition active:scale-95 disabled:opacity-60 sm:w-auto"
              >
                {saving ? "Guardando..." : (locationForm.id ? "Guardar" : "Crear")}
              </button>
            </div>
          </form>
        </BackofficeDialog>
      )}

      <ConfirmModal
        open={confirmDeleteLocation.open}
        onClose={() => setConfirmDeleteLocation({ open: false, id: null, name: "" })}
        onConfirm={async () => {
          if (confirmDeleteLocation.id) await removeLocation(confirmDeleteLocation.id);
        }}
        title="Eliminar ubicación"
        message={confirmDeleteLocation.name ? `¿Eliminar ubicación "${confirmDeleteLocation.name}"?` : "¿Eliminar ubicación?"}
        confirmLabel="Eliminar"
        variant="danger"
        loading={saving}
      />
    </div>
  );
}
