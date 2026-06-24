import { formatCurrency } from "../../utils/currency.js";
import { CircleDollarSign, ShoppingBag, CheckCircle2 } from "lucide-react";

/**
 * Tres cifras compactas: cobrado neto, total de pedidos, pagados.
 * Estilo Apple — minimalista, limpio, con jerarquía clara.
 */
export function OrdersKpiGrid({ cards, currencySymbol }) {
  const kpis = [
    {
      label: "Cobrado (neto)",
      value:
        cards.montoTotalCobradoNeto != null && Number.isFinite(cards.montoTotalCobradoNeto)
          ? formatCurrency(cards.montoTotalCobradoNeto, currencySymbol)
          : "—",
      icon: CircleDollarSign,
      accent: "text-emerald-600",
      iconBg: "bg-emerald-50",
      iconRing: "ring-emerald-100",
    },
    {
      label: "Pedidos",
      value: cards.totalPedidos ?? "—",
      icon: ShoppingBag,
      accent: "text-indigo-600",
      iconBg: "bg-indigo-50",
      iconRing: "ring-indigo-100",
    },
    {
      label: "Pagados",
      value: cards.pagados ?? "—",
      icon: CheckCircle2,
      accent: "text-sky-600",
      iconBg: "bg-sky-50",
      iconRing: "ring-sky-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {/* eslint-disable-next-line no-unused-vars */}
      {kpis.map(({ label, value, icon: Icon, accent, iconBg, iconRing }) => (
        <div
          key={label}
          className="group flex items-center gap-3.5 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-px"
        >
          <div className={`shrink-0 rounded-xl p-2 ring-1 ${iconBg} ${iconRing}`}>
            <Icon className={`h-4 w-4 ${accent}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
            <p className={`mt-0.5 text-xl font-bold tabular-nums leading-tight ${accent}`}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
