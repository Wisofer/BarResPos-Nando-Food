import { useState } from "react";
import { Pencil, History, Trash2, Image as ImageIcon } from "lucide-react";
import { formatCurrency } from "../../utils/currency.js";
import { getProductImageUrl } from "../../utils/productImage.js";

/**
 * Tarjeta de producto (mismo criterio visual que sistema-de-tienda: imagen, nombre, categoría•código, precio, stock, acciones al hover).
 */
export function ProductCard({ product, currencySymbol, openEdit, openProductHistory, setConfirmAction, readOnly = false }) {
  const p = product;
  const [imgFailed, setImgFailed] = useState(false);
  const stock = Number(p.stock || 0);
  const min = Number(p.stockMinimo || 0);
  const lowStock = Boolean(p.controlarStock) && min > 0 && stock <= min;
  const criticalStock = Boolean(p.controlarStock) && min > 0 && stock <= min * 0.5;
  const img = getProductImageUrl(p);
  const categoriaLabel = String(p.categoriaProducto?.nombre ?? p.categoriaProducto ?? p.categoriaNombre ?? p.categoria ?? p.Categoria ?? "Sin categoría");

  const stockClass = lowStock 
    ? (criticalStock ? "bg-rose-50 border-rose-100 text-rose-600 font-extrabold" : "bg-amber-50 border-amber-100 text-amber-600 font-extrabold") 
    : "bg-slate-50 border-slate-200 text-slate-500 font-bold";

  return (
    <article
      className={`group relative flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-sm hover:shadow-lg hover:shadow-slate-100/60 hover:border-slate-300/80 hover:-translate-y-1 transition-all duration-300 ${
        p.activo === false ? "opacity-50" : ""
      }`}
    >
      {lowStock && (
        <div
          className={`absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[8px] font-black tracking-widest shadow-md border ${
            criticalStock 
              ? "animate-pulse bg-rose-500 border-rose-400 text-white" 
              : "bg-amber-500 border-amber-400 text-white"
          }`}
        >
          {criticalStock ? "CRÍTICO" : "BAJO STOCK"}
        </div>
      )}

      <div className="relative flex h-32 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-50 border border-slate-200/60 sm:h-36">
        {img && !imgFailed ? (
          <img
            src={img}
            alt={p.nombre || "Producto"}
            className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            onError={() => setImgFailed(true)}
            loading="lazy"
          />
        ) : (
          <ImageIcon className="h-8 w-8 text-slate-300" />
        )}
      </div>

      <div className="min-w-0 space-y-1.5 flex-1 flex flex-col justify-between">
        <div className="space-y-1">
          <p className="line-clamp-2 text-xs font-extrabold leading-snug text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors" title={p.nombre}>
            {p.nombre || "Producto"}
          </p>
          <div className="flex flex-wrap items-center gap-1">
            <span className="rounded-full bg-slate-100/80 border border-slate-200/40 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase tracking-wide">
              {categoriaLabel}
            </span>
            {p.codigo && (
              <span className="font-mono text-[9px] font-bold bg-blue-50 border border-blue-100/50 text-blue-600 rounded-md px-1.5 py-0.5">
                {p.codigo}
              </span>
            )}
          </div>
          {p.talla && (
            <span className="inline-block rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[8px] font-bold text-slate-500">
              Talla: {p.talla}
            </span>
          )}
        </div>

        <div className="mt-1 border-t border-slate-100 pt-2 flex flex-col gap-1.5">
          <p className="text-base font-black tabular-nums text-slate-850">
            {formatCurrency(p.precioVenta ?? p.precio ?? 0, currencySymbol)}
          </p>
          <div className="flex items-center justify-between gap-2 h-7">
            <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] uppercase tracking-wide border transition ${stockClass}`}>
              {p.controlarStock ? `Stock: ${stock}` : "Sin control"}
            </span>
            {!readOnly && (
              <div className="flex shrink-0 items-center gap-0.5 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 inline-flex rounded-lg border border-slate-200 bg-white/95 backdrop-blur-sm p-0.5 shadow-sm">
                <button
                  type="button"
                  onClick={() => openEdit(p.id)}
                  className="rounded-md p-1 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition active:scale-90 cursor-pointer"
                  title="Editar"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => openProductHistory(p)}
                  className="rounded-md p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition active:scale-90 cursor-pointer"
                  title="Historial"
                >
                  <History className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setConfirmAction({
                      open: true,
                      type: "product",
                      id: p.id,
                      name: p.nombre || "Producto",
                    })
                  }
                  className="rounded-md p-1 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition active:scale-90 cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

