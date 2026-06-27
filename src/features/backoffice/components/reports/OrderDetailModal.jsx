import { Modal } from "../../../../components/ui/Modal.jsx";
import { formatCurrency } from "../../utils/currency.js";
import { formatDateTime } from "../../utils/reportDates.js";
import { reporteMetodoPagoLabel, reporteMonedaLabel } from "../../utils/reportUtils.js";
import { tableHorizontalScrollClass } from "../../utils/modalResponsiveClasses.js";
import { opcionesResumenSoloTextoOpcion } from "../../utils/productoOpciones.js";

export function OrderDetailModal({ open, onClose, loading, data }) {
  const d = data || {};
  return (
    <Modal open={open} onClose={onClose} title="Detalle de venta" size="xl">
      {loading ? (
        <p className="text-sm text-slate-500">Cargando detalle...</p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">Número</p>
              <p className="font-semibold text-slate-900">{d.numero || "—"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">Fecha</p>
              <p className="font-semibold text-slate-900">{formatDateTime(d.fecha)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">Origen / Ref.</p>
              <p className="font-semibold text-slate-900">
                {d.origen?.toLowerCase() === "mesa" && d.referenciaOrigen && d.referenciaOrigen !== "-" ? (
                  d.referenciaOrigen
                ) : (
                  <>
                    <span className="capitalize">{d.origen || "—"}</span>
                    {d.referenciaOrigen && d.referenciaOrigen !== "-" ? <span className="text-slate-500 font-normal"> · {d.referenciaOrigen}</span> : null}
                  </>
                )}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">Atendido por</p>
              <p className={`font-semibold ${d.mesero ? "text-slate-900" : "text-slate-400 italic font-normal"}`}>{d.mesero || "Sistema / Cajero"}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">Método</p>
              <p className="font-semibold text-slate-900">{reporteMetodoPagoLabel(d.metodoPago)}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
              <p className="text-slate-500">Moneda</p>
              <p className="font-semibold text-slate-900">{reporteMonedaLabel(d.moneda)}</p>
            </div>
          </div>
          <div className={tableHorizontalScrollClass}>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-3 py-2">Producto</th>
                  <th className="px-3 py-2">Cantidad</th>
                  <th className="px-3 py-2">P. unitario</th>
                  <th className="px-3 py-2">Monto</th>
                </tr>
              </thead>
              <tbody>
                {(d.items || []).length ? (
                  (d.items || []).map((it, idx) => (
                    <tr key={idx} className="border-t border-slate-100">
                      <td className="px-3 py-2">
                        <span>{it.producto || "—"}</span>
                        {it.variante && (
                          <span className="ml-1.5 text-xs text-slate-400">— {it.variante}</span>
                        )}
                        {it.opcionesResumen ? (
                          <div className="mt-0.5 text-[11px] font-medium text-indigo-600 leading-tight">
                            {opcionesResumenSoloTextoOpcion(it.opcionesResumen)}
                          </div>
                        ) : null}
                      </td>
                      <td className="px-3 py-2">{it.cantidad ?? 0}</td>
                      <td className="px-3 py-2">{formatCurrency(it.precioUnitario ?? 0)}</td>
                      <td className="px-3 py-2 font-medium">{formatCurrency(it.monto ?? 0)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-slate-500">
                      No hay líneas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-right">
              <p className="text-xs uppercase tracking-wide text-emerald-700">Total cobrado</p>
              <p className="text-lg font-bold text-emerald-800">{formatCurrency(d.totalCobrado ?? 0)}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
