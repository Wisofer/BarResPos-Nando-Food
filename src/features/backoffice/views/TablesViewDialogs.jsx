import { Pencil, Trash2 } from "lucide-react";
import { BackofficeDialog } from "../components/index.js";

export function TableFormDialog({ open, form, setForm, saving, locations, onClose, onSave }) {
  if (!open) return null;
  return (
    <BackofficeDialog maxWidthClass="max-w-md" onBackdropClick={saving ? undefined : onClose}>
      <form onSubmit={onSave} className="w-full min-w-0 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
            {form.id ? "Editar mesa" : "Nueva mesa"}
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {form.id ? "Modifica los atributos de esta mesa en el sistema." : "Registra una nueva mesa en el catálogo operacional."}
          </p>
        </div>

        <div className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Número de Mesa / Identificador</label>
            <input
              value={form.numero}
              onChange={(e) => setForm((f) => ({ ...f, numero: e.target.value }))}
              placeholder="Ej: M-10, Barra 3"
              className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm placeholder:text-slate-400"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ubicación / Zona</label>
            <select
              value={form.ubicacionId}
              onChange={(e) => setForm((f) => ({ ...f, ubicacionId: e.target.value }))}
              className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white"
              required
            >
              <option value="">Selecciona una ubicación</option>
              {locations.filter((l) => l.activo !== false).map((l) => (
                <option key={l.id} value={l.id}>{l.nombre || l.descripcion || `Ubicación ${l.id}`}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado Inicial</label>
            <select
              value={form.estado}
              onChange={(e) => setForm((f) => ({ ...f, estado: e.target.value }))}
              className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm bg-white"
            >
              <option value="Libre">Libre</option>
              <option value="Ocupada">Ocupada</option>
              <option value="Reservada">Reservada</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Capacidad (Personas)</label>
            <input
              type="number"
              min="1"
              onWheel={(e) => e.target.blur()}
              value={form.capacidad}
              onChange={(e) => setForm((f) => ({ ...f, capacidad: e.target.value }))}
              placeholder="Capacidad"
              className="w-full rounded-lg border border-slate-250 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-sm"
              required
            />
          </div>
        </div>

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-650 hover:bg-slate-50 transition active:scale-95 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            disabled={saving}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow shadow-indigo-150 transition active:scale-95 disabled:opacity-55 sm:w-auto"
          >
            {saving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </form>
    </BackofficeDialog>
  );
}

export function LocationsManagerDialog({
  open, saving, locations, locationForm, setLocationForm,
  showInactiveLocations, setShowInactiveLocations,
  onClose, onSaveLocation, onEditLocation, onToggleActive, onDeleteClick
}) {
  if (!open) return null;
  return (
    <BackofficeDialog maxWidthClass="max-w-3xl" onBackdropClick={saving ? undefined : onClose}>
      <div className="w-full min-w-0">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-800">Ubicaciones de mesas</h3>
            <p className="text-xs text-slate-500">Listado actual de ubicaciones registradas.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
          >
            Cerrar
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px_1fr]">
          <form onSubmit={onSaveLocation} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <h4 className="text-sm font-semibold text-slate-800">{locationForm.id ? "Editar ubicación" : "Nueva ubicación"}</h4>
            <input
              value={locationForm.nombre}
              onChange={(e) => setLocationForm((s) => ({ ...s, nombre: e.target.value }))}
              placeholder="Nombre (ej: Terraza)"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              required
            />
            <textarea
              value={locationForm.descripcion}
              onChange={(e) => setLocationForm((s) => ({ ...s, descripcion: e.target.value }))}
              placeholder="Descripción (opcional)"
              rows={3}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="inline-flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={locationForm.activo}
                onChange={(e) => setLocationForm((s) => ({ ...s, activo: e.target.checked }))}
              />
              Activa
            </label>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setLocationForm({ id: null, nombre: "", descripcion: "", activo: true })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 sm:w-auto"
              >
                Limpiar
              </button>
              <button disabled={saving} className="w-full rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-60 sm:w-auto">
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>

          <div className="space-y-2 rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-600">
                {showInactiveLocations ? "Mostrando activas e inactivas" : "Mostrando solo activas"}
              </p>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={showInactiveLocations}
                  onChange={(e) => setShowInactiveLocations(e.target.checked)}
                />
                Ver inactivas
              </label>
            </div>
            {locations.length === 0 && <p className="text-sm text-slate-500">No hay ubicaciones.</p>}
            {locations
              .filter((l) => showInactiveLocations || l.activo !== false)
              .map((l) => (
                <article
                  key={l.id}
                  className={`flex items-start justify-between gap-3 rounded-lg border p-3 ${l.activo === false ? "border-slate-200 bg-slate-50 opacity-80" : "border-slate-200 bg-white"
                    }`}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{l.nombre || l.descripcion || `Ubicación ${l.id}`}</p>
                    <p className="truncate text-xs text-slate-500">{l.descripcion || "-"}</p>
                  </div>
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    {l.activo === false ? (
                      <button
                        type="button"
                        onClick={() => onToggleActive(l, true)}
                        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700"
                      >
                        Reactivar
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => onEditLocation(l.id)}
                      className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteClick(l.id, l.nombre || `Ubicación ${l.id}`)}
                      className="inline-flex items-center gap-1 rounded-md bg-red-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Eliminar
                    </button>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </div>
    </BackofficeDialog>
  );
}

export function DetailDialog({ open, table, activeOrder, onClose }) {
  if (!open || !table) return null;
  return (
    <BackofficeDialog maxWidthClass="max-w-lg" onBackdropClick={onClose}>
      <div className="w-full min-w-0">
        <h3 className="text-lg font-semibold text-slate-800">{table.displayId}</h3>
        <p className="mt-1 text-sm text-slate-600">Estado: {table.status} | Capacidad: {table.capacity}</p>
        <div className="mt-4 rounded-lg border border-slate-200 p-3 text-sm">
          {activeOrder ? (
            <>
              <p className="font-semibold text-slate-800">Orden activa: {activeOrder.numero || activeOrder.id}</p>
              <p className="text-slate-600">Estado: {activeOrder.estado || "Pendiente"}</p>
            </>
          ) : (
            <p className="text-slate-500">Sin orden activa.</p>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button type="button" onClick={onClose} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 sm:w-auto">Cerrar</button>
        </div>
      </div>
    </BackofficeDialog>
  );
}
