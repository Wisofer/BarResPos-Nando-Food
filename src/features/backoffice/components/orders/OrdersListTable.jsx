import { Eye, Pencil, XCircle } from "lucide-react";
import { formatDateTimeParts, labelDestinoPedido, labelTipoPedido, isPedidoEstadoBloqueadoParaEdicion } from "../../utils/ordersViewFormatters.js";

const th = "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-400";

/** Color del pill de tipo — Delivery vs Mesa */
const tipoPillClass = (tipo, origenPedido) => {
  const t = String(tipo || origenPedido || "").toLowerCase();
  if (t === "delivery") return "bg-violet-50 text-violet-700 ring-violet-200/60";
  return "bg-amber-50 text-amber-700 ring-amber-200/60";
};

/** Mapa de estilos de estado */
const statusStyle = (status) => {
  const s = String(status || "").toLowerCase();
  if (s === "pagado") return "bg-emerald-50 text-emerald-700 ring-emerald-200/60";
  if (s === "cancelado") return "bg-rose-50 text-rose-700 ring-rose-200/60";
  if (s === "en cocina") return "bg-orange-50 text-orange-700 ring-orange-200/60";
  if (s === "listo") return "bg-sky-50 text-sky-700 ring-sky-200/60";
  if (s === "entregado") return "bg-blue-50 text-blue-700 ring-blue-200/60";
  return "bg-slate-100 text-slate-600 ring-slate-200/60";
};

export function OrdersListTable({
  rows,
  isAdmin,
  busyAction,
  onView,
  onEdit,
  onCancel,
}) {
  return (
    <div className="min-w-0 w-full overflow-x-auto">
      <table className="min-w-[820px] w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            <th className={th}>Pedido</th>
            <th className={th}>Tipo</th>
            <th className={th}>Fecha</th>
            <th className={th}>Destino</th>
            <th className={th}>Total</th>
            <th className={th}>Estado</th>
            <th className={`${th} w-[112px] text-right`}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-16 text-center text-sm text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-2xl">📋</span>
                  <span>No hay pedidos con los criterios actuales.</span>
                </div>
              </td>
            </tr>
          )}
          {rows.map((order) => {
            const dt = formatDateTimeParts(order.createdAt);
            const isEmptyDraft =
              String(order.status || "").toLowerCase() === "guardado" &&
              Number(order.total || 0) <= 0 &&
              Number(order.productsCount || 0) <= 0;
            return (
              <tr
                key={order.rowId}
                className="group border-b border-slate-100/80 transition-colors hover:bg-slate-50/70"
              >
                {/* Pedido */}
                <td className="px-4 py-3 align-middle">
                  <p className="font-semibold text-slate-900 tracking-tight">{order.id}</p>
                </td>

                {/* Tipo */}
                <td className="px-4 py-3 align-middle">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${tipoPillClass(order.tipo, order.origenPedido)}`}
                  >
                    {labelTipoPedido(order.tipo, order.origenPedido)}
                  </span>
                </td>

                {/* Fecha */}
                <td className="px-4 py-3 align-middle">
                  <p className="text-[13px] font-medium text-slate-700">{dt.date}</p>
                  {dt.time ? (
                    <p className="text-[11px] tabular-nums text-slate-400">{dt.time}</p>
                  ) : null}
                </td>

                {/* Destino */}
                <td className="px-4 py-3 align-middle">
                  <p className="font-medium text-slate-700">{labelDestinoPedido(order)}</p>
                  {order.tipo === "delivery" && order.clienteNombre ? (
                    <p className="text-[11px] text-slate-400">Cliente delivery</p>
                  ) : null}
                </td>

                {/* Total */}
                <td className="px-4 py-3 align-middle tabular-nums">
                  {order.status === "Pagado" && order.amountNeto != null ? (
                    <span className="font-bold text-emerald-700">{order.amountNeto}</span>
                  ) : (
                    <span className="font-semibold text-slate-800">{order.amount}</span>
                  )}
                </td>

                {/* Estado */}
                <td className="px-4 py-3 align-middle">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold ring-1 ${statusStyle(order.status)}`}
                  >
                    {order.status}
                  </span>
                </td>

                {/* Acciones */}
                <td className="px-3 py-2 align-middle">
                  <div className="flex items-center justify-end gap-0.5 opacity-70 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onView(order)}
                      disabled={busyAction}
                      title="Ver detalle"
                      className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                    >
                      <Eye className="h-[15px] w-[15px]" />
                    </button>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onEdit(order)}
                        disabled={busyAction || isEmptyDraft || isPedidoEstadoBloqueadoParaEdicion(order.status)}
                        title={
                          isPedidoEstadoBloqueadoParaEdicion(order.status)
                            ? "Pedido pagado o cancelado: no se puede editar"
                            : "Editar"
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-800 disabled:opacity-30"
                      >
                        <Pencil className="h-[14px] w-[14px]" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => onCancel(order)}
                        disabled={busyAction || isEmptyDraft || isPedidoEstadoBloqueadoParaEdicion(order.status)}
                        title="Cancelar"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-xl text-rose-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30"
                      >
                        <XCircle className="h-[15px] w-[15px]" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
