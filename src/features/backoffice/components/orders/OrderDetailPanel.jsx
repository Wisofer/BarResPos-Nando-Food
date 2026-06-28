import { ArrowLeft, Printer, XCircle } from "lucide-react";
import { formatCurrency } from "../../utils/currency.js";
import {
  pagoDescuentoAtribuidoCordobas,
  pagoDescuentoMotivo,
  pagoFecha,
  pagoMontoNetoCobradoCordobas,
  pagoTipo,
  pedidoDescuentoCobroCordobas,
  pedidoPagosLista,
  pedidoSubtotalConsumoCordobas,
  pedidoTotalNetoCobradoCordobas,
} from "../../utils/pedidoCobro.js";
import { orderStatusPillClass, formatDateTimeLabel, labelTipoPedido, isPedidoEstadoBloqueadoParaEdicion } from "../../utils/ordersViewFormatters.js";

const ESTADOS_PEDIDO = ["Pendiente", "En cocina", "Despacho", "Listo", "Entregado", "Pagado", "Cancelado"];

function infoCard(label, children) {
  return (
    <article className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3 transition hover:bg-slate-50">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <div className="mt-1">{children}</div>
    </article>
  );
}

export function OrderDetailPanel({
  error,
  detailOrder,
  isAdmin,
  busyAction,
  currencySymbol,
  onBack,
  onPrint,
  onCancelPedido,
}) {
  const createdAtLabel = formatDateTimeLabel(detailOrder.fechaCreacion);
  const paidAtLabel = formatDateTimeLabel(detailOrder.fechaPagado);
  const listoAtLabel = ["Listo", "Servido", "Entregado", "Pagado"].includes(String(detailOrder.estado || "")) ? paidAtLabel : "—";
  const items = Array.isArray(detailOrder.items) ? detailOrder.items : [];
  const subtotalLines = items.reduce((acc, it) => acc + Number(it.monto || 0), 0);
  const subConsumoDetalle = pedidoSubtotalConsumoCordobas(detailOrder) || subtotalLines;
  const descCobroDetalle = pedidoDescuentoCobroCordobas(detailOrder);
  const netoCobradoDetalle = pedidoTotalNetoCobradoCordobas(detailOrder);
  const pagosDetalle = pedidoPagosLista(detailOrder);
  const estadoDetalle = String(detailOrder.estado || "");
  const puedeCancelarPedido = isAdmin && !isPedidoEstadoBloqueadoParaEdicion(estadoDetalle);

  return (
    <div className="min-w-0 max-w-full space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}

      <header className="flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Detalle de pedido</p>
          <h1 className="mt-1 text-[22px] font-bold leading-tight tracking-tight text-slate-900">{detailOrder.numero || `#${detailOrder.id}`}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow-md active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
            Volver
          </button>
          {estadoDetalle !== "Cancelado" && (
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow-md active:scale-95"
            >
              <Printer className="h-3.5 w-3.5 shrink-0" />
              Imprimir
            </button>
          )}

          {typeof onCancelPedido === "function" && puedeCancelarPedido && (
            <button
              type="button"
              onClick={onCancelPedido}
              disabled={busyAction}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 disabled:opacity-50 active:scale-95"
            >
              <XCircle className="h-3.5 w-3.5 shrink-0" />
              Cancelar pedido
            </button>
          )}
        </div>
      </header>


        <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[1fr_300px] xl:grid-cols-[1.6fr_1fr]">
          <section className="min-w-0 space-y-4">
            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-semibold text-slate-800">Información del pedido</h2>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                {infoCard(
                  "Número",
                  <p className="font-semibold text-slate-800">{detailOrder.numero || `#${detailOrder.id}`}</p>,
                )}
                {infoCard(
                  "Tipo / origen",
                  <p className="font-semibold text-slate-800">
                    {labelTipoPedido(detailOrder.tipo ?? detailOrder.Tipo, detailOrder.origenPedido ?? detailOrder.OrigenPedido)}
                  </p>,
                )}
                {infoCard("Fecha y hora", <p className="font-semibold text-slate-800">{createdAtLabel}</p>)}
                {infoCard("Mesa", <p className={`font-semibold ${detailOrder.mesa ? "text-slate-800" : "text-slate-400 italic font-normal"}`}>{detailOrder.mesa || "Para llevar"}</p>)}
                {infoCard("Mesero", <p className={`font-semibold ${detailOrder.mesero ? "text-slate-800" : "text-slate-400 italic font-normal"}`}>{detailOrder.mesero || "Sistema / Cajero"}</p>)}
                {infoCard(
                  "Estado",
                  <span className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-medium ${orderStatusPillClass(detailOrder.estado || "Pendiente")}`}>
                    {detailOrder.estado || "Pendiente"}
                  </span>,
                )}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3 sm:col-span-2 lg:col-span-2 xl:col-span-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Observaciones</p>
                  <div className="mt-1"><p className={`font-medium ${detailOrder.observaciones ? "text-slate-700" : "text-slate-400 italic font-normal"}`}>{detailOrder.observaciones || "Sin observaciones"}</p></div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="text-sm font-semibold text-slate-800">Productos</h2>
              <div className="mt-3 min-w-0 overflow-x-auto">
                <table className="min-w-[720px] w-full text-sm">
                  <thead className="text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    <tr>
                      <th className="pb-2 pl-0 pr-3">Producto</th>
                      <th className="pb-2 pr-3">Cant.</th>
                      <th className="pb-2 pr-3">P. unit.</th>
                      <th className="pb-2 pr-3">Subtotal</th>
                      <th className="pb-2 pr-0">Notas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    {items.map((it) => (
                      <tr key={it.id || `${it.servicioId}-${it.servicio}`}>
                        <td className="py-2.5 pr-3 font-medium">{it.servicio || <span className="text-slate-400 italic font-normal">Desconocido</span>}</td>
                        <td className="py-2.5 pr-3 text-slate-600">{it.cantidad || 0}</td>
                        <td className="py-2.5 pr-3 text-slate-600">{formatCurrency(it.precioUnitario || 0, currencySymbol)}</td>
                        <td className="py-2.5 pr-3 font-semibold tabular-nums">{formatCurrency(it.monto || 0, currencySymbol)}</td>
                        <td className="max-w-xs py-2.5 text-slate-600">{it.notas || <span className="text-slate-400 italic">Sin observaciones</span>}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3} className="pt-2 text-right text-sm font-medium text-slate-600">
                        Total consumo
                      </td>
                      <td className="pt-2 text-sm font-bold tabular-nums text-slate-900">{formatCurrency(subConsumoDetalle, currencySymbol)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </section>

          <aside className="min-w-0 space-y-3">

            {/* ── Cobro ── */}
            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cobro</h2>
              <dl className="mt-3 space-y-0">
                <div className="flex min-w-0 items-center justify-between gap-2 py-2">
                  <dt className="min-w-0 truncate text-sm text-slate-500">Subtotal consumo</dt>
                  <dd className="shrink-0 font-semibold tabular-nums text-slate-900">{formatCurrency(subConsumoDetalle, currencySymbol)}</dd>
                </div>
                {descCobroDetalle > 0.0001 && (
                  <div className="flex min-w-0 items-center justify-between gap-2 py-2">
                    <dt className="min-w-0 truncate text-sm text-slate-500">Descuento</dt>
                    <dd className="shrink-0 font-semibold text-amber-700">−{formatCurrency(descCobroDetalle, currencySymbol)}</dd>
                  </div>
                )}
                <div className="flex min-w-0 items-center justify-between gap-2 rounded-xl bg-emerald-50/70 px-3 py-2.5 mt-1">
                  <dt className="min-w-0 truncate text-sm font-semibold text-emerald-800">Total pagado</dt>
                  <dd className="shrink-0 font-bold tabular-nums text-emerald-700">
                    {estadoDetalle === "Pagado" && netoCobradoDetalle != null ? formatCurrency(netoCobradoDetalle, currencySymbol) : "—"}
                  </dd>
                </div>
              </dl>
            </div>

            {/* ── Pagos ── */}
            {pagosDetalle.length > 0 && (
              <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Pagos</h2>
                <div className="mt-3 space-y-2">
                  {pagosDetalle.map((pg, idx) => {
                    const pid = pg.id ?? pg.Id ?? `pago-${idx}`;
                    const netoP = pagoMontoNetoCobradoCordobas(pg);
                    const descA = pagoDescuentoAtribuidoCordobas(pg);
                    const motivo = pagoDescuentoMotivo(pg);
                    return (
                      <div key={pid} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                        <div className="flex min-w-0 items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold text-slate-700">{pagoTipo(pg)}</p>
                            <p className="mt-0.5 text-[11px] text-slate-400">{formatDateTimeLabel(pagoFecha(pg))}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-sm font-bold tabular-nums text-slate-800">{netoP != null ? formatCurrency(netoP, currencySymbol) : "—"}</p>
                            {descA > 0.0001 && (
                              <p className="text-[11px] text-amber-700" title={motivo || undefined}>−{formatCurrency(descA, currencySymbol)}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Fechas ── */}
            <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Fechas</h2>
              <ul className="mt-3 space-y-2">
                {[
                  { label: "Creado", value: createdAtLabel },
                  { label: "Listo",  value: listoAtLabel  },
                  { label: "Pagado", value: paidAtLabel   },
                ].map(({ label, value }) => (
                  <li key={label} className="flex min-w-0 items-start justify-between gap-2">
                    <span className="shrink-0 text-sm text-slate-400">{label}</span>
                    <span className="min-w-0 break-all text-right text-sm font-medium text-slate-700">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
    </div>
  );
}

