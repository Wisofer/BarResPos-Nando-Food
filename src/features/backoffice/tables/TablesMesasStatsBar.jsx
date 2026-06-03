import { LayoutGrid, Map, Maximize2, Layers, Plus } from "lucide-react";

export function TablesMesasStatsBar({
  total,
  libres,
  ocupadas,
  reservadas,
  cajaAbierta,
  onUbicaciones,
  onNuevaMesa,
  layoutMode = "zonas",
  onLayoutModeChange,
  onToggleMaximize,
  enableVistaZonas = true,
  enableVistaPlano = true,
  isAdmin = false,
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between bg-white/70 backdrop-blur-md border border-slate-100 p-3 rounded-xl shadow-sm">
      {/* KPI stats */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 border border-slate-200/50 px-3.5 py-1.5 text-[11px] font-bold text-slate-600 shadow-sm transition">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
          <span>Total: {total}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100/60 px-3.5 py-1.5 text-[11px] font-bold text-emerald-700 shadow-sm transition">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shadow shadow-emerald-500/30"></span>
          <span>Libres: {libres}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100/60 px-3.5 py-1.5 text-[11px] font-bold text-rose-700 shadow-sm transition relative">
          <span className="relative flex h-1.5 w-1.5 items-center justify-center">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
          </span>
          <span>Ocupadas: {ocupadas}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 border border-violet-100/60 px-3.5 py-1.5 text-[11px] font-bold text-violet-750 shadow-sm transition">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-500 shadow shadow-violet-500/30"></span>
          <span>Reservadas: {reservadas}</span>
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-bold shadow-sm transition ${
            cajaAbierta 
              ? "bg-emerald-50/60 border-emerald-250 text-emerald-800" 
              : "bg-rose-50/60 border-rose-250 text-rose-800"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5 items-center justify-center">
            {cajaAbierta && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cajaAbierta ? "bg-emerald-500" : "bg-rose-500"}`}></span>
          </span>
          <span>Caja: {cajaAbierta ? "Abierta" : "Cerrada"}</span>
        </span>
      </div>

      {/* Control Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        {typeof onLayoutModeChange === "function" && enableVistaZonas && enableVistaPlano && (
          <div className="inline-flex rounded-lg border border-slate-200/80 bg-slate-100 p-0.5 shadow-inner">
            <button
              type="button"
              onClick={() => onLayoutModeChange("zonas")}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-bold transition-all duration-200 ${
                layoutMode === "zonas" 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/10" 
                  : "text-slate-650 hover:text-slate-900"
              }`}
              title="Vista por zonas"
            >
              <LayoutGrid className="h-3.5 sm:h-4 sm:w-4 w-3.5" />
              Zonas
            </button>
            <button
              type="button"
              onClick={() => onLayoutModeChange("plano")}
              className={`inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-bold transition-all duration-200 ${
                layoutMode === "plano" 
                  ? "bg-white text-slate-800 shadow-sm border border-slate-200/10" 
                  : "text-slate-650 hover:text-slate-900"
              }`}
              title="Vista plano (arrastrar mesas)"
            >
              <Map className="h-3.5 sm:h-4 sm:w-4 w-3.5" />
              Plano
            </button>
          </div>
        )}

        {layoutMode === "plano" && typeof onToggleMaximize === "function" && (
          <button
            type="button"
            onClick={onToggleMaximize}
            className="rounded-lg border border-slate-250 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 inline-flex items-center gap-1.5 shadow-sm transition active:scale-95"
            title="Pantalla completa del plano"
          >
            <Maximize2 className="h-3.5 sm:h-4 sm:w-4 w-3.5 text-slate-500" />
            Ampliar
          </button>
        )}

        {isAdmin && (
          <>
            <button
              type="button"
              onClick={onUbicaciones}
              className="rounded-lg border border-slate-250 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 hover:bg-slate-50 shadow-sm transition active:scale-95 inline-flex items-center gap-1.5"
            >
              <Layers className="h-3.5 sm:h-4 sm:w-4 w-3.5 text-slate-500" />
              Ubicaciones
            </button>
            <button
              type="button"
              onClick={onNuevaMesa}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-[11px] font-bold text-white hover:bg-indigo-700 shadow shadow-indigo-150 transition active:scale-95 inline-flex items-center gap-1"
            >
              <Plus className="h-3.5 sm:h-4 sm:w-4 w-3.5" />
              Nueva mesa
            </button>
          </>
        )}
      </div>
    </div>
  );
}
