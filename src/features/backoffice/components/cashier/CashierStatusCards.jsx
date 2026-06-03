import React from "react";

export function CashierStatusCards({
  cajaAbierta,
  showApertura,
  setShowApertura,
  showCierreForm,
  setShowCierreForm,
}) {
  if (!cajaAbierta && !showApertura) {
    return (
      <article className="rounded-[28px] border border-slate-200/80 bg-white p-10 text-center shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500" />
        <div className="mx-auto mb-5 inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          Estado del Sistema
        </div>
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-50 border border-slate-200 text-3xl shadow-inner relative">
          <span className="absolute inset-0 rounded-3xl bg-indigo-500/5 blur-xl animate-pulse" />
          <span className="relative select-none">🔒</span>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Caja Cerrada</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm font-medium leading-relaxed text-slate-500">
          La caja registradora se encuentra actualmente cerrada. Abre caja para iniciar la jornada operativa de cobros y facturación.
        </p>
        <button
          type="button"
          onClick={() => setShowApertura(true)}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-slate-900 hover:bg-slate-800 px-6 py-3 text-sm font-bold text-white shadow-sm shadow-slate-950/20 active:scale-95 transition cursor-pointer"
        >
          Abrir Caja Registradora
        </button>
      </article>
    );
  }

  if (cajaAbierta) {
    return (
      <article className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 bottom-0 left-0 w-[4px] bg-emerald-500" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-white text-lg shadow-sm">
              🔓
            </div>
            <div>
              <h2 className="text-base font-extrabold text-emerald-950 tracking-tight flex items-center gap-1.5">
                Caja Abierta y Activa
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </h2>
              <p className="text-xs font-semibold text-emerald-800/80 mt-0.5">Operando correctamente para la jornada del día.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowCierreForm(!showCierreForm)}
            className={`rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-sm active:scale-95 cursor-pointer ${
              showCierreForm 
                ? "bg-slate-700 hover:bg-slate-800 text-white" 
                : "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200/50"
            }`}
          >
            {showCierreForm ? "Ocultar arqueo" : "Cerrar turno de caja"}
          </button>
        </div>
      </article>
    );
  }

  return null;
}
