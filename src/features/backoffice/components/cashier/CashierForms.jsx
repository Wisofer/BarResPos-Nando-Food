import React, { useMemo } from "react";
import { formatCurrency } from "../../utils/currency.js";
import { computeArqueoPreview } from "../../utils/cashierArqueo.js";

export function CashierForms({
  showApertura,
  setShowApertura,
  montoInicial,
  setMontoInicial,
  handleAperturaCaja,
  showCierreForm,
  cierreForm,
  setCierreForm,
  handleCerrarCaja,
  processing,
  currencySymbol,
  montoEsperadoEnCaja = 0,
}) {
  const arqueoPreview = useMemo(
    () => computeArqueoPreview(cierreForm?.montoReal, montoEsperadoEnCaja),
    [cierreForm?.montoReal, montoEsperadoEnCaja],
  );

  if (showApertura) {
    return (
      <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Apertura de Caja</h2>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">Registra el monto inicial para comenzar la jornada.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowApertura(false)}
            className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
          >
            Volver
          </button>
        </div>
        <form onSubmit={handleAperturaCaja} className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-4 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Monto Inicial ({currencySymbol})</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={montoInicial}
              onChange={(e) => setMontoInicial(e.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-3xl font-black font-mono tabular-nums text-slate-800 placeholder:text-slate-350 focus:outline-none"
              required
              autoFocus
            />
          </div>
          <p className="text-[11px] font-medium text-slate-500">🛡️ Fondo base de efectivo en caja registradora indispensable para dar cambio.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="submit"
              disabled={processing}
              className="rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition active:scale-95 cursor-pointer"
            >
              Iniciar Operaciones
            </button>
            <button
              type="button"
              onClick={() => setShowApertura(false)}
              className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition active:scale-95 cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      </article>
    );
  }

  if (showCierreForm) {
    return (
      <article className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-1.5">
          <span className="text-base">💼</span>
          <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Cierre y Arqueo de Turno</h3>
        </div>
        <form onSubmit={handleCerrarCaja} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Efectivo Contado ({currencySymbol})</label>
              <input
                type="number"
                step="0.01"
                value={cierreForm.montoReal}
                onChange={(e) => setCierreForm((s) => ({ ...s, montoReal: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-transparent text-2xl font-black font-mono tabular-nums text-slate-800 focus:outline-none placeholder:text-slate-350 mt-1"
                required
              />
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all flex flex-col justify-center">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Observaciones</label>
              <input
                value={cierreForm.observaciones}
                onChange={(e) => setCierreForm((s) => ({ ...s, observaciones: e.target.value }))}
                placeholder="Ej. Sencillo extra en caja"
                className="w-full bg-transparent text-sm font-semibold text-slate-700 focus:outline-none placeholder:text-slate-350 mt-1.5"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
            <p className="text-xs font-semibold text-slate-500">
              Monto esperado según sistema:{" "}
              <span className="font-extrabold text-slate-800 tabular-nums ml-1">
                {formatCurrency(montoEsperadoEnCaja, currencySymbol)}
              </span>
            </p>
            {arqueoPreview === null ? (
              <p className="mt-2 text-xs font-medium text-slate-400">Ingresa un monto válido para ver la diferencia.</p>
            ) : arqueoPreview.kind === "empty" ? (
              <p className="mt-2 text-xs font-medium text-slate-400">
                Al escribir el efectivo contado verás si falta, sobra o cuadra respecto al esperado.
              </p>
            ) : arqueoPreview.kind === "cuadra" ? (
              <div className="mt-3 rounded-xl border border-emerald-150 bg-emerald-50/40 p-4 shadow-inner text-emerald-900">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">✓ {arqueoPreview.label}</p>
                <p className="mt-1 text-sm font-bold">{arqueoPreview.detail}</p>
              </div>
            ) : arqueoPreview.kind === "sobra" ? (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm text-emerald-950">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">💰 {arqueoPreview.label}</p>
                <p className="mt-1 text-2xl font-black font-mono tabular-nums text-emerald-850">
                  +{formatCurrency(arqueoPreview.diff, currencySymbol)}
                </p>
                <p className="mt-1 text-xs font-semibold text-emerald-750/90">{arqueoPreview.detail}</p>
              </div>
            ) : (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm text-rose-950 animate-pulse">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-700">🚨 {arqueoPreview.label}</p>
                <p className="mt-1 text-2xl font-black font-mono tabular-nums text-rose-850">
                  {formatCurrency(arqueoPreview.diff, currencySymbol)}
                </p>
                <p className="mt-1 text-xs font-semibold text-rose-750/90">{arqueoPreview.detail}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={processing}
            className="w-full rounded-xl bg-rose-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 transition active:scale-95 cursor-pointer sm:w-auto"
          >
            {processing ? "Procesando..." : "Finalizar Turno de Caja"}
          </button>
        </form>
      </article>
    );
  }

  return null;
}
