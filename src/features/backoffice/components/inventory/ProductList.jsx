import { useState } from "react";
import { Pencil, History, Trash2, Image as ImageIcon } from "lucide-react";
import { formatCurrency } from "../../utils/currency.js";
import { getProductImageUrl } from "../../utils/productImage.js";
import { productoTieneOpcionesVisibles, normalizeOpcionesGrupos } from "../../utils/productoOpciones.js";

function ProductListRow({ p, currencySymbol, openEdit, openProductHistory, setConfirmAction, readOnly }) {
  const [imgFailed, setImgFailed] = useState(false);
  const stock = Number(p.stock || 0);
  const min = Number(p.stockMinimo || 0);
  const lowStock = Boolean(p.controlarStock) && min > 0 && stock <= min;
  const criticalStock = Boolean(p.controlarStock) && min > 0 && stock <= min * 0.5;
  const img = getProductImageUrl(p);
  const categoriaLabel = String(p.categoriaProducto?.nombre ?? p.categoriaProducto ?? p.categoriaNombre ?? p.categoria ?? p.Categoria ?? "Sin categoría");

  const basePrice = Number(p.precioVenta ?? p.precio ?? 0);
  const tieneOpcionesConPrecio = productoTieneOpcionesVisibles(p) && 
    (basePrice === 0 || normalizeOpcionesGrupos(p).some((g) => {
      const opts = g?.opciones ?? g?.Opciones ?? [];
      return opts.some((o) => o?.activo !== false && o?.Activo !== false && Number(o?.precioAdicional ?? o?.PrecioAdicional ?? 0) > 0);
    }));

  const stockClass = lowStock 
    ? (criticalStock ? "bg-rose-50 border-rose-100 text-rose-600 font-extrabold" : "bg-amber-50 border-amber-100 text-amber-600 font-extrabold") 
    : "bg-slate-50 border-slate-200/80 text-slate-500 font-bold";

  return (
    <article
      className={`group flex flex-col gap-3 rounded-2xl border border-slate-200/60 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all duration-350 hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] hover:border-slate-300 sm:flex-row sm:items-center sm:justify-between ${
        p.activo === false ? "opacity-55" : ""
      }`}
    >
      {/* Left section: Image, Name, Category and Code */}
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 border border-slate-200 shadow-inner">
          {img && !imgFailed ? (
            <img
              src={img}
              alt={p.nombre || "Producto"}
              className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgFailed(true)}
              loading="lazy"
            />
          ) : (
            <ImageIcon className="h-5 w-5 text-slate-300" />
          )}
        </div>
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-bold text-slate-800 tracking-tight truncate max-w-[200px] sm:max-w-[300px] group-hover:text-indigo-650 transition-colors">
              {p.nombre || "Producto"}
            </h4>
            {p.codigo && (
              <span className="font-mono text-[9px] font-bold bg-blue-50 border border-blue-100/50 text-blue-600 rounded px-1.5 py-0.5">
                {p.codigo}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="rounded-full bg-slate-50 border border-slate-200/60 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
              {categoriaLabel}
            </span>
            {p.talla && (
              <span className="text-[10px] font-semibold text-slate-400">Talla: {p.talla}</span>
            )}
          </div>
        </div>
      </div>

      {/* Right section: Stock info, Price and Toolbar Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-3 sm:border-none sm:pt-0">
        {/* Stock management */}
        <div className="flex items-center gap-2">
          {p.controlarStock ? (
            <div className="flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-0.5 text-[10px] uppercase tracking-wide border transition ${stockClass}`}>
                Stock: {stock}
              </span>
              {lowStock && (
                <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[8px] font-black tracking-widest border uppercase ${
                  criticalStock 
                    ? "bg-rose-500 border-rose-400 text-white animate-pulse" 
                    : "bg-amber-500 border-amber-400 text-white"
                }`}>
                  {criticalStock ? "CRÍTICO" : "BAJO"}
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide bg-slate-50 border border-slate-200/65 rounded-lg px-2.5 py-0.5">
              Sin control
            </span>
          )}
        </div>

        {/* Price display */}
        <div className="min-w-[110px] text-left sm:text-right font-black text-slate-800 text-sm">
          {tieneOpcionesConPrecio ? (
            <span className="inline-flex items-center rounded-lg bg-indigo-50 border border-indigo-150/40 px-2.5 py-0.5 text-[10px] font-bold text-indigo-650 uppercase tracking-wider">
              Varios precios
            </span>
          ) : (
            <span className="tabular-nums text-slate-750 font-black">{formatCurrency(basePrice, currencySymbol)}</span>
          )}
        </div>

        {/* Actions Micro-Toolbar */}
        {!readOnly && (
          <div className="flex items-center gap-0.5 rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm ml-auto sm:ml-0">
            <button
              type="button"
              onClick={() => openEdit(p.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 transition active:scale-90 cursor-pointer"
              title="Editar"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => openProductHistory(p)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition active:scale-90 cursor-pointer"
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
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition active:scale-90 cursor-pointer"
              title="Eliminar"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function ProductList({
  products,
  currencySymbol,
  openEdit,
  openProductHistory,
  setConfirmAction,
  readOnly = false,
}) {
  if (products.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-slate-200">
        <p className="text-sm text-slate-500">No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {products.map((p, i) => (
        <ProductListRow
          key={p.id || i}
          p={p}
          currencySymbol={currencySymbol}
          openEdit={openEdit}
          openProductHistory={openProductHistory}
          setConfirmAction={setConfirmAction}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}
