import { Download } from "lucide-react";

export function OrdersListHeader({ onExport, exporting }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-[22px] font-bold leading-tight tracking-tight text-slate-900">Pedidos</h1>
        <p className="mt-0.5 text-sm text-slate-400">
          Listado completo · usá filtros y la tabla para el detalle
        </p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2 pt-0.5">
        <button
          type="button"
          onClick={onExport}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-150 hover:bg-slate-50 hover:shadow-md disabled:opacity-50 active:scale-95"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          {exporting ? "Exportando…" : "Exportar Excel"}
        </button>
      </div>
    </div>
  );
}
