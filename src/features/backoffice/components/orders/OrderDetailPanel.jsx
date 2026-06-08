import { ArrowLeft, Check, Pencil, Printer, X, XCircle } from "lucide-react";
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
const ESTADOS_COCINA = ["Pendiente", "En cocina", "Listo", "Entregado", "Cancelado"];
const ESTADOS_LINEA = ["Pendiente", "En cocina", "Listo", "Entregado", "Cancelado"];

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
  showEdit,
  setShowEdit,
  isAdmin,
  busyAction,
  currencySymbol,
  onBack,
  onPrint,
  onStartEdit,
  onCancelPedido,
  editForm,
  setEditForm,
  onSubmitEdit,
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
  const puedeEditarPedido = isAdmin && !isPedidoEstadoBloqueadoParaEdicion(estadoDetalle);
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
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:shadow-md active:scale-95"
          >
            <Printer className="h-3.5 w-3.5 shrink-0" />
            Imprimir
          </button>
          {puedeEditarPedido && !showEdit && (
            <button
              type="button"
              onClick={onStartEdit}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 active:scale-95"
            >
              <Pencil className="h-3.5 w-3.5 shrink-0" />
              Editar
            </button>
          )}
          {typeof onCancelPedido === "function" && puedeCancelarPedido && !showEdit && (
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

      {!showEdit ? (
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
                {infoCard("Mesa", <p className="font-semibold text-slate-800">{detailOrder.mesa || "—"}</p>)}
                {infoCard("Mesero", <p className="font-semibold text-slate-800">{detailOrder.mesero || "—"}</p>)}
                {infoCard(
                  "Estado",
                  <span className={`inline-flex rounded-md px-2.5 py-0.5 text-xs font-medium ${orderStatusPillClass(detailOrder.estado || "Pendiente")}`}>
                    {detailOrder.estado || "Pendiente"}
                  </span>,
                )}
                <div className="rounded-xl border border-slate-100 bg-slate-50/60 px-3.5 py-3 sm:col-span-2 lg:col-span-2 xl:col-span-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Observaciones</p>
                  <div className="mt-1"><p className="font-medium text-slate-700">{detailOrder.observaciones || "—"}</p></div>
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
                        <td className="py-2.5 pr-3 font-medium">{it.servicio || "—"}</td>
                        <td className="py-2.5 pr-3 text-slate-600">{it.cantidad || 0}</td>
                        <td className="py-2.5 pr-3 text-slate-600">{formatCurrency(it.precioUnitario || 0, currencySymbol)}</td>
                        <td className="py-2.5 pr-3 font-semibold tabular-nums">{formatCurrency(it.monto || 0, currencySymbol)}</td>
                        <td className="max-w-xs py-2.5 text-slate-600">{it.notas || "—"}</td>
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
      ) : (
        <form onSubmit={onSubmitEdit} className="space-y-4">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
            <p className="font-semibold">Modo edición</p>
            <p className="mt-0.5 text-xs text-amber-900/90">Guardá los cambios o cancelá para volver al detalle.</p>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900">Datos del pedido</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="text-xs font-semibold text-slate-600">
                Mesa ID
                <input
                  type="number"
                  min="1"
                  onWheel={(e) => e.target.blur()}
                  value={editForm.mesaId}
                  onChange={(e) => setEditForm((s) => ({ ...s, mesaId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Cliente ID
                <input
                  type="number"
                  min="0"
                  onWheel={(e) => e.target.blur()}
                  value={editForm.clienteId}
                  onChange={(e) => setEditForm((s) => ({ ...s, clienteId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Mesero ID
                <input
                  type="number"
                  min="0"
                  onWheel={(e) => e.target.blur()}
                  value={editForm.meseroId}
                  onChange={(e) => setEditForm((s) => ({ ...s, meseroId: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200/60"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Estado del pedido
                <select
                  value={editForm.estado}
                  onChange={(e) => setEditForm((s) => ({ ...s, estado: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
                >
                  {ESTADOS_PEDIDO.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Estado cocina
                <select
                  value={editForm.estadoCocina}
                  onChange={(e) => setEditForm((s) => ({ ...s, estadoCocina: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
                >
                  <option value="">Sin definir</option>
                  {ESTADOS_COCINA.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-4 block text-xs font-semibold text-slate-600">
              Observaciones
              <textarea
                value={editForm.observaciones}
                onChange={(e) => setEditForm((s) => ({ ...s, observaciones: e.target.value }))}
                rows={3}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-6">
            <h2 className="text-sm font-semibold text-slate-900">Líneas</h2>
            <div className="mt-4 space-y-4">
              {editForm.items.map((it, idx) => {
                const q = Number(it.cantidad) || 0;
                const pu = Number(it.precioUnitario) || 0;
                const sub = q * pu;
                return (
                  <div key={`${it.servicioId}-${idx}`} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-800">{it.servicio || "Producto"}</p>
                        <p className="text-xs text-slate-500">Línea {idx + 1}</p>
                      </div>
                      <span className="rounded-md bg-white px-2.5 py-0.5 text-xs font-semibold tabular-nums text-slate-800 ring-1 ring-slate-200">
                        {formatCurrency(sub, currencySymbol)}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <label className="text-xs font-semibold text-slate-600 sm:col-span-2 lg:col-span-1">
                        ID servicio
                        <input
                          type="number"
                          min="1"
                          onWheel={(e) => e.target.blur()}
                          value={it.servicioId === undefined || it.servicioId === null ? "" : String(it.servicioId)}
                          onChange={(e) =>
                            setEditForm((s) => ({
                              ...s,
                              items: s.items.map((x, i) => (i === idx ? { ...x, servicioId: e.target.value } : x)),
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-xs font-semibold text-slate-600">
                        Cantidad
                        <input
                          type="number"
                          min="1"
                          onWheel={(e) => e.target.blur()}
                          value={it.cantidad}
                          onChange={(e) =>
                            setEditForm((s) => ({
                              ...s,
                              items: s.items.map((x, i) => (i === idx ? { ...x, cantidad: e.target.value } : x)),
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-xs font-semibold text-slate-600">
                        P. unit. ({currencySymbol})
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          onWheel={(e) => e.target.blur()}
                          value={it.precioUnitario}
                          onChange={(e) =>
                            setEditForm((s) => ({
                              ...s,
                              items: s.items.map((x, i) => (i === idx ? { ...x, precioUnitario: e.target.value } : x)),
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        />
                      </label>
                      <label className="text-xs font-semibold text-slate-600">
                        Estado línea
                        <select
                          value={it.estado}
                          onChange={(e) =>
                            setEditForm((s) => ({
                              ...s,
                              items: s.items.map((x, i) => (i === idx ? { ...x, estado: e.target.value } : x)),
                            }))
                          }
                          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        >
                          <option value="">Sin definir</option>
                          {ESTADOS_LINEA.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label className="mt-3 block text-xs font-semibold text-slate-600">
                      Notas
                      <input
                        value={it.notas}
                        onChange={(e) =>
                          setEditForm((s) => ({
                            ...s,
                            items: s.items.map((x, i) => (i === idx ? { ...x, notas: e.target.value } : x)),
                          }))
                        }
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
            <button
              type="button"
              onClick={() => setShowEdit(false)}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 transition hover:bg-slate-50 sm:w-auto w-full"
            >
              <X className="h-4 w-4 shrink-0" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busyAction}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 sm:w-auto w-full"
            >
              <Check className="h-4 w-4 shrink-0" />
              {busyAction ? "Guardando…" : "Guardar"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
