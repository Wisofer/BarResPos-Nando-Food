import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "../utils/currency.js";
import { getApiUrl } from "../../../api/config.js";

const defaultBackClass =
  "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50 lg:min-h-9 lg:py-1.5";

/**
 * Selector táctil de una opción cuando el producto tiene un solo grupo (mismo flujo móvil/desktop).
 */
export function PosInlineOpcionesPanel({
  product,
  grupoId,
  opciones,
  onPickOpcion,
  onBack,
  currencySymbol = "C$",
  disabled = false,
  gridClassName,
  tileClassName,
  backButtonClassName = defaultBackClass,
}) {
  const nombre = String(product?.nombre ?? product?.Nombre ?? "Producto");

  return (
    <>
      <div className="mb-2 flex items-center gap-2">
        <button type="button" onClick={onBack} className={backButtonClassName}>
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Volver
        </button>
      </div>
      <p className="mb-1 text-center text-xs font-bold text-slate-800">{nombre}</p>
      <p className="mb-2 text-center text-[10px] text-slate-500">Elegí una opción</p>
      <div className={gridClassName}>
        {(opciones ?? []).map((op) => {
          const oid = op?.id ?? op?.Id;
          const oname = String(op?.nombre ?? op?.Nombre ?? "").trim() || "Opción";
          const add = Number(op?.precioAdicional ?? op?.PrecioAdicional ?? 0);
          const extra = Number.isFinite(add) && add > 0 ? `+${formatCurrency(add, currencySymbol)}` : "";
          const imgUrl = op?.imagenUrl ?? op?.ImagenUrl;
          const fullImgUrl = imgUrl ? encodeURI(imgUrl.startsWith('http') ? imgUrl : getApiUrl() + imgUrl) : null;

          return (
            <button
              key={oid}
              type="button"
              disabled={disabled}
              onClick={() => onPickOpcion?.(product, grupoId, op)}
              className={`${tileClassName} overflow-hidden`}
              style={fullImgUrl ? {
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url("${fullImgUrl}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: 'white',
                border: 'none',
                textShadow: '0 1px 3px rgba(0,0,0,0.9), 0 0 8px rgba(0,0,0,0.7)'
              } : {}}
            >
              <span className="line-clamp-3 break-words drop-shadow-sm">{oname.toUpperCase()}</span>
              {extra ? <span className="text-[11px] font-bold text-white drop-shadow-md">{extra}</span> : null}
            </button>
          );
        })}
      </div>
    </>
  );
}
