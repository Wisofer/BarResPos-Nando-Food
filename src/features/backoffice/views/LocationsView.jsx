import { useEffect, useState } from "react";
import { ArrowLeft, Pencil, Trash2, MapPin, RefreshCw, Eye, EyeOff } from "lucide-react";
import { backofficeApi } from "../services/backofficeApi.js";
import { useSnackbar } from "../../../contexts/SnackbarContext.jsx";
import { ConfirmModal } from "../../../components/ui/ConfirmModal.jsx";

export function LocationsView({ openView }) {
  const snackbar = useSnackbar();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationForm, setLocationForm] = useState({ id: null, nombre: "", descripcion: "", activo: true });
  const [confirmDeleteLocation, setConfirmDeleteLocation] = useState({ open: false, id: null, name: "" });
  const [showInactiveLocations, setShowInactiveLocations] = useState(false);

  const normalizeLocation = (l) => ({
    id: l?.id ?? l?.Id,
    nombre: l?.nombre ?? l?.Nombre ?? "",
    descripcion: l?.descripcion ?? l?.Descripcion ?? "",
    activo: l?.activo ?? l?.Activo ?? true,
  });

  const loadLocations = async () => {
    setLoading(true);
    try {
      const ubic = await backofficeApi.catalogoUbicaciones();
      const raw = Array.isArray(ubic) ? ubic : ubic?.items || [];
      setLocations(raw.map(normalizeLocation));
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

  const toggleLocationActive = async (loc, nextActive) => {
    setSaving(true);
    try {
      await backofficeApi.updateUbicacion(loc.id, {
        nombre: loc.nombre || "",
        descripcion: loc.descripcion || null,
        activo: Boolean(nextActive),
      });
      await loadLocations();
      snackbar.success(nextActive ? "Ubicación reactivada." : "Ubicación desactivada.");
    } catch (e) {
      snackbar.error(e.message || "No se pudo actualizar estado de ubicación.");
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
            onClick={loadLocations}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-250 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition active:scale-95 shadow-sm"
            title="Recargar datos"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-500" : ""}`} />
          </button>
          
          <button
            type="button"
            onClick={() => setShowInactiveLocations(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition shadow-sm active:scale-95 ${
              showInactiveLocations 
                ? "bg-slate-800 border-slate-900 text-white hover:bg-slate-900" 
                : "bg-white border-slate-250 text-slate-750 hover:bg-slate-50"
            }`}
          >
            {showInactiveLocations ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            <span>{showInactiveLocations ? "Ocultar inactivas" : "Ver inactivas"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[340px_1fr] flex-1 min-h-0">
        
        {/* Left Column: Glassmorphic Form Card */}
        <div className="bg-white/90 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4 self-start">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              {locationForm.id ? "Editar ubicación" : "Nueva ubicación"}
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Crea o modifica zonas para agrupar tus mesas operativas.
            </p>
          </div>

          <form onSubmit={saveLocation} className="space-y-4">
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

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setLocationForm({ id: null, nombre: "", descripcion: "", activo: true })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-650 hover:bg-slate-50 transition active:scale-95"
              >
                Limpiar
              </button>
              <button 
                type="submit"
                disabled={saving} 
                className="w-full rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow shadow-indigo-150 transition active:scale-95 disabled:opacity-60"
              >
                {saving ? "Guardando..." : (locationForm.id ? "Guardar" : "Crear")}
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Premium Locations Card Grid */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-4 min-h-[300px]">
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
                  <p className="text-xs text-slate-400">Crea una zona en el panel lateral izquierdo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 overflow-y-auto max-h-[60vh] pr-1">
                  {locations
                    .filter((l) => showInactiveLocations || l.activo !== false)
                    .map((l) => (
                      <article
                        key={l.id}
                        className={`group relative flex flex-col justify-between gap-4 rounded-xl border p-4 transition-all duration-300 ${
                          l.activo === false 
                            ? "border-slate-200 bg-slate-50/60 opacity-75 shadow-sm" 
                            : "border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-slate-200"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <div className={`h-1.5 w-1.5 rounded-full ${l.activo === false ? "bg-slate-400" : "bg-emerald-500 animate-pulse shadow shadow-emerald-500/30"}`} />
                            <h4 className="text-sm font-bold text-slate-800 truncate uppercase tracking-wider">{l.nombre || `Zona ${l.id}`}</h4>
                          </div>
                          <p className="text-xs text-slate-500 leading-relaxed min-h-[32px] line-clamp-2">{l.descripcion || "Sin descripción"}</p>
                        </div>

                        <div className="flex items-center justify-between border-t border-slate-100/80 pt-3">
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                            l.activo === false 
                              ? "bg-slate-100 border-slate-200 text-slate-500" 
                              : "bg-emerald-50 border-emerald-100/60 text-emerald-700"
                          }`}>
                            {l.activo === false ? "Inactiva" : "Activa"}
                          </span>

                          <div className="flex gap-1.5">
                            {l.activo === false ? (
                              <button
                                type="button"
                                onClick={() => toggleLocationActive(l, true)}
                                className="inline-flex h-7 px-2.5 items-center justify-center gap-1 rounded-lg bg-emerald-600/10 text-emerald-700 border border-emerald-100 hover:bg-emerald-600 hover:text-white transition text-[10px] font-bold active:scale-95"
                              >
                                Reactivar
                              </button>
                            ) : null}
                            <button
                              type="button"
                              onClick={() => editLocation(l.id)}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition active:scale-95 shadow-sm"
                              title="Editar"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteLocation({ open: true, id: l.id, name: l.nombre || `Ubicación ${l.id}` })}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition active:scale-95 shadow-sm"
                              title="Eliminar"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
