import { Search, X } from "lucide-react";

const filtrosVentas = [
  { value: "todas", label: "Todas" },
  { value: "mesa", label: "Mesa" },
  { value: "delivery", label: "Delivery" },
  { value: "anuladas", label: "Anuladas" },
];

const topOptions = [5, 10, 15, 20];

export function ReportFilters({
  activeReport,
  dateFilters,
  setDateFilters,
  search,
  setSearch,
  filtroVentas,
  setFiltroVentas,
  topN,
  setTopN,
  peores,
  setPeores,
}) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 p-4 shadow-sm backdrop-blur-md">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Date and Search */}
        <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center rounded-xl bg-slate-100 p-1 shadow-inner w-full sm:w-auto">
            <input
              type="date"
              value={dateFilters.desde}
              onChange={(e) => setDateFilters((p) => ({ ...p, desde: e.target.value }))}
              className="bg-transparent px-3 py-1.5 text-sm font-medium text-slate-700 outline-none w-full sm:w-auto"
            />
            <span className="text-slate-400 font-medium px-1">-</span>
            <input
              type="date"
              value={dateFilters.hasta}
              onChange={(e) => setDateFilters((p) => ({ ...p, hasta: e.target.value }))}
              className="bg-transparent px-3 py-1.5 text-sm font-medium text-slate-700 outline-none w-full sm:w-auto"
            />
          </div>

          <div className="relative w-full sm:max-w-xs flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar..."
              className="h-10 w-full rounded-xl bg-slate-100 pl-10 pr-10 text-sm outline-none transition focus:ring-2 focus:ring-slate-300"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filters specific to Report Type */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {activeReport === "ventas" && (
            <div className="flex w-full md:w-auto items-center rounded-xl bg-slate-100 p-1 shadow-inner">
              {filtrosVentas.map((op) => (
                <button
                  key={op.value}
                  type="button"
                  onClick={() => setFiltroVentas(op.value)}
                  className={`flex-1 md:flex-none rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                    filtroVentas === op.value
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {op.label}
                </button>
              ))}
            </div>
          )}

          {activeReport === "productos-top" && (
            <div className="flex items-center gap-3">
              <div className="flex items-center rounded-xl bg-slate-100 p-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setPeores(false)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    !peores ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Más Vendidos
                </button>
                <button
                  type="button"
                  onClick={() => setPeores(true)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                    peores ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  Menos Vendidos
                </button>
              </div>
              <div className="flex items-center rounded-xl bg-slate-100 px-3 py-1.5 shadow-inner">
                <span className="text-sm font-medium text-slate-500 mr-2">Top</span>
                <select
                  value={topN}
                  onChange={(e) => setTopN(Number(e.target.value))}
                  className="bg-transparent text-sm font-medium text-slate-900 outline-none"
                >
                  {topOptions.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
