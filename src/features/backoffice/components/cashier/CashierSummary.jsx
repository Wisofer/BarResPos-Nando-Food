import React from "react";
import { formatCurrency } from "../../utils/currency.js";

export function CashierSummary({
  totalVentas,
  totalOrdenes,
  totalEfectivo,
  totalTarjeta,
  totalTransferencia,
  montoEsperadoCalculado,
  montoInicialActual,
  currencySymbol,
}) {
  const efectivo = Number(totalEfectivo || 0);
  const tarjeta = Number(totalTarjeta || 0);
  const transf = Number(totalTransferencia || 0);
  const ventas = Number(totalVentas || 0);
  const ordenes = Number(totalOrdenes || 0);
  const tarjetaMasTransf = tarjeta + transf;
  const fondo = Number(montoInicialActual || 0);

  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">📊</span>
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Resumen del Día</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Ventas */}
        <div className="rounded-2xl border border-slate-200/85 bg-slate-50/50 p-4 shadow-sm hover:shadow transition-all">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ventas (neto)</p>
          <p className="mt-1.5 text-xl font-extrabold tabular-nums text-slate-850">
            {formatCurrency(ventas, currencySymbol)}
          </p>
        </div>

        {/* Tickets */}
        <div className="rounded-2xl border border-slate-200/85 bg-slate-50/50 p-4 shadow-sm hover:shadow transition-all">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Tickets</p>
          <p className="mt-1.5 text-xl font-extrabold tabular-nums text-slate-850">
            {ordenes}
          </p>
        </div>

        {/* Efectivo */}
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm hover:shadow transition-all">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
            Efectivo
          </p>
          <p className="mt-1.5 text-xl font-extrabold tabular-nums text-emerald-950">
            {formatCurrency(efectivo, currencySymbol)}
          </p>
        </div>

        {/* Tarjeta + Transf */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-4 shadow-sm hover:shadow transition-all">
          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
            Tarjeta + Transf
          </p>
          <p className="mt-1.5 text-xl font-extrabold tabular-nums text-indigo-950">
            {formatCurrency(tarjetaMasTransf, currencySymbol)}
          </p>
        </div>
      </div>

      {/* Monto Esperado */}
      <div className="mt-5 rounded-2xl border border-indigo-150 bg-gradient-to-br from-indigo-50 to-indigo-100/50 p-5 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 text-3xl opacity-20 select-none">💰</div>
        <p className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Monto Esperado en Caja (Efectivo)</p>
        <p className="mt-2 text-3xl font-black tabular-nums tracking-tight text-indigo-900">
          {formatCurrency(montoEsperadoCalculado, currencySymbol)}
        </p>
        {fondo > 0 ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-750/90">
            <span>🛡️</span>
            <span>Incluye fondo de apertura inicial de {formatCurrency(fondo, currencySymbol)}</span>
          </div>
        ) : null}
      </div>
    </article>
  );
}
