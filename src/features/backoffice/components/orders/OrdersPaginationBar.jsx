import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Pie del listado: total de registros y paginación solo si hay más de una página.
 */
export function OrdersPaginationBar({ page, setPage, pageInfo, disabled }) {
  const totalItems = Number(pageInfo?.totalItems ?? 0);
  const rawTotalPages = Number(pageInfo?.totalPages ?? 1);
  const totalPages = Math.max(1, rawTotalPages || 1);
  const showPageNav = totalItems > 0 && totalPages > 1;

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <p className="text-xs text-slate-400">
        <span className="font-semibold text-slate-600 tabular-nums">{totalItems}</span>{" "}
        registro{totalItems === 1 ? "" : "s"} en total
        {showPageNav ? (
          <span className="ml-1 text-slate-300">· Pág. {page}/{totalPages}</span>
        ) : null}
      </p>
      {showPageNav && (
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1 || disabled}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="min-w-[4rem] px-2 text-center text-xs font-semibold tabular-nums text-slate-500">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || disabled}
            onClick={() => setPage((p) => p + 1)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-40"
            aria-label="Página siguiente"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
