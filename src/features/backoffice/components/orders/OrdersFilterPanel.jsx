import { Search, CalendarDays } from "lucide-react";
import { cn } from "../../../../utils/cn.js";
import { ORDERS_QUICK_STATES, ORDERS_TIPO_FILTERS } from "../../constants/ordersView.js";

/** Chip de segmento estilo iOS — seleccionado se vuelve blanco con sombra sobre fondo gris */
const segmentBtn = (active) =>
  cn(
    "relative inline-flex items-center justify-center rounded-lg px-3 py-1 text-xs font-semibold transition-all duration-200",
    active
      ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/60"
      : "text-slate-500 hover:text-slate-700",
  );

function SegmentedGroup({ label, options, activeValue, onChange }) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <div className="flex items-center rounded-xl bg-slate-100/80 p-1 gap-0.5">
        {options.map((opt) => (
          <button
            key={opt.value ?? opt}
            type="button"
            onClick={() => onChange(opt.value ?? opt)}
            className={segmentBtn(activeValue === (opt.value ?? opt))}
          >
            {opt.label ?? (opt || "Todos")}
          </button>
        ))}
      </div>
    </div>
  );
}

export function OrdersFilterPanel({
  filters,
  setFilters,
  searchTerm,
  setSearchTerm,
  applyQuickStatus,
  applyTipoFilter,
  showEmptyDrafts,
  setShowEmptyDrafts,
}) {
  const quickStateOptions = ORDERS_QUICK_STATES.map((s) => ({
    value: s,
    label: s || "Todos",
  }));

  return (
    <div className="space-y-4">
      {/* Filtros de segmento */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
        <SegmentedGroup
          label="Estado"
          options={quickStateOptions}
          activeValue={filters.estado}
          onChange={applyQuickStatus}
        />
        <div className="hidden h-4 w-px bg-slate-200 sm:block" aria-hidden />
        <SegmentedGroup
          label="Origen"
          options={ORDERS_TIPO_FILTERS}
          activeValue={filters.tipo}
          onChange={applyTipoFilter}
        />
      </div>

      {/* Búsqueda y fechas */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative sm:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar pedido o destino…"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-800 placeholder:text-slate-400 transition focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
          />
        </div>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={filters.desde}
            onChange={(e) => setFilters((prev) => ({ ...prev, desde: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 transition focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
          />
        </div>
        <div className="relative">
          <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="date"
            value={filters.hasta}
            onChange={(e) => setFilters((prev) => ({ ...prev, hasta: e.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 transition focus:bg-white focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
          />
        </div>
      </div>

      {/* Toggle borradores */}
      <label className="inline-flex cursor-pointer items-center gap-2.5">
        <div className="relative">
          <input
            type="checkbox"
            checked={showEmptyDrafts}
            onChange={(e) => setShowEmptyDrafts(Boolean(e.target.checked))}
            className="peer sr-only"
          />
          <div className="h-5 w-9 rounded-full bg-slate-200 transition-colors peer-checked:bg-indigo-500" />
          <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-4" />
        </div>
        <span className="text-xs font-medium text-slate-600">Mostrar borradores/vacíos</span>
      </label>
    </div>
  );
}
