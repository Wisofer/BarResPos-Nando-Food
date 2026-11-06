import React from 'react';
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Wallet,
  PiggyBank,
} from 'lucide-react';

const NO_SPINNER_CLASS =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function CostosCalculadoraSheet({
  calculadoraInfo,
  onBackHome,
  onUpdateSalesQty,
  onResetSales,
  onLoadMonthlyGoals,
}) {
  if (!calculadoraInfo) return null;

  const formatCellCurrency = (amount, highlightClass = 'text-slate-800') => {
    if (!amount || amount <= 0) {
      return <span className="text-slate-300 font-medium">C$ —</span>;
    }
    return (
      <span className={`font-extrabold ${highlightClass}`}>
        C$ {Math.round(amount).toLocaleString('en-US')}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Cabecera Limpia */}
      <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all cursor-pointer"
          >
            <ArrowLeft size={15} />
            Volver
          </button>

          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
              Simulador y Calculadora de Utilidades
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ingresa las unidades vendidas por producto para proyectar ventas brutas, costos operativos y ganancia neta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onLoadMonthlyGoals}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 px-3.5 py-2 text-xs font-bold text-indigo-700 transition-colors cursor-pointer"
          >
            <Sparkles size={14} />
            Cargar Metas de 30 Días
          </button>

          <button
            type="button"
            onClick={onResetSales}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors cursor-pointer active:scale-95"
          >
            <RotateCcw size={14} />
            Resetear Ventas
          </button>
        </div>
      </div>

      {/* Cuerpo en 2 Columnas: Tabla a la Izquierda + 3 Tarjetas de Resultados y Botón RESET a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLUMNA IZQUIERDA (8 cols): Tabla de Simulación */}
        <div className="lg:col-span-8 rounded-[24px] border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3 px-4">Producto</th>
                  <th className="py-3 px-3 text-center w-28">Ventas (Uds)</th>
                  <th className="py-3 px-3 text-right w-28">Precio</th>
                  <th className="py-3 px-3 text-right w-32">Total Ventas</th>
                  <th className="py-3 px-3 text-right w-32">Gastos / Costo</th>
                  <th className="py-3 px-4 text-right w-32">Ganancia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calculadoraInfo.rows.map((row) => {
                  const hasSales = row.ventas > 0;
                  return (
                    <tr
                      key={row.row}
                      className={
                        hasSales ? 'bg-indigo-50/30 hover:bg-indigo-50/50' : 'hover:bg-slate-50/70'
                      }
                    >
                      <td className="py-2 px-4 font-extrabold text-slate-800 uppercase text-xs">
                        {row.name}
                      </td>

                      <td className="py-1.5 px-2 text-center">
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={row.ventas === 0 ? '' : row.ventas}
                          onChange={(e) =>
                            onUpdateSalesQty(
                              row.row,
                              e.target.value === '' ? 0 : Math.max(0, Number(e.target.value) || 0)
                            )
                          }
                          className={`w-20 rounded-xl border px-2.5 py-1 text-center text-xs sm:text-sm font-black transition-all focus:outline-none ${NO_SPINNER_CLASS} ${
                            hasSales
                              ? 'border-indigo-400 bg-white text-indigo-950 ring-2 ring-indigo-500/15'
                              : 'border-slate-200/80 bg-slate-50/60 text-slate-700 focus:bg-white focus:border-indigo-400'
                          }`}
                        />
                      </td>

                      <td className="py-2 px-3 text-right font-semibold text-slate-600">
                        C$ {Math.round(row.precio).toLocaleString('en-US')}
                      </td>

                      <td className="py-2 px-3 text-right">
                        {formatCellCurrency(row.total, 'text-slate-900')}
                      </td>

                      <td className="py-2 px-3 text-right">
                        {formatCellCurrency(row.gastos, 'text-amber-700')}
                      </td>

                      <td className="py-2 px-4 text-right">
                        {formatCellCurrency(row.ganancia, 'text-emerald-600')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50 font-black text-slate-900 text-xs sm:text-sm">
                  <td className="py-3 px-4 uppercase">TOTALES</td>
                  <td className="py-3 px-3 text-center text-indigo-700">
                    {calculadoraInfo.totalVentasUnidades.toLocaleString('en-US')}
                  </td>
                  <td className="py-3 px-3" />
                  <td className="py-3 px-3 text-right text-slate-900">
                    C$ {Math.round(calculadoraInfo.totalIngresos).toLocaleString('en-US')}
                  </td>
                  <td className="py-3 px-3 text-right text-amber-800">
                    C$ {Math.round(calculadoraInfo.totalCostos).toLocaleString('en-US')}
                  </td>
                  <td className="py-3 px-4 text-right text-emerald-700">
                    C$ {Math.round(calculadoraInfo.totalGanancias).toLocaleString('en-US')}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* COLUMNA DERECHA (4 cols): Tarjetas Ejecutivas de Resultados + Botón RESET */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-5">
          {/* Tarjeta 1: TOTAL DE VENTAS */}
          <div className="rounded-[22px] border border-emerald-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-extrabold text-xs uppercase tracking-wider border border-emerald-200/60">
                Total de Ventas
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
              C$ {Math.round(calculadoraInfo.totalIngresos).toLocaleString('en-US')}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {calculadoraInfo.totalVentasUnidades.toLocaleString('en-US')} unidades simuladas
            </p>
          </div>

          {/* Tarjeta 2: COSTOS */}
          <div className="rounded-[22px] border border-amber-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-extrabold text-xs uppercase tracking-wider border border-amber-200/60">
                Costos Operativos
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wallet size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-3 tracking-tight">
              C$ {Math.round(calculadoraInfo.totalCostos).toLocaleString('en-US')}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Materia prima + absorción de gastos fijos
            </p>
          </div>

          {/* Tarjeta 3: GANANCIAS */}
          <div className="rounded-[22px] border border-indigo-200/80 bg-gradient-to-br from-indigo-600 to-blue-700 p-5 shadow-md text-white">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-white/15 text-white font-extrabold text-xs uppercase tracking-wider">
                Ganancias Netas
              </span>
              <div className="h-9 w-9 rounded-xl bg-white/15 text-white flex items-center justify-center">
                <PiggyBank size={18} />
              </div>
            </div>
            <p className="text-3xl font-black text-white mt-3 tracking-tight">
              C$ {Math.round(calculadoraInfo.totalGanancias).toLocaleString('en-US')}
            </p>
            <p className="text-xs text-indigo-100 font-medium mt-1">
              Rentabilidad promedio aplicada: {calculadoraInfo.avgGainPercent.toFixed(1)}%
            </p>
          </div>

          {/* Botón RESET Limpio y Destacado */}
          <button
            type="button"
            onClick={onResetSales}
            className="w-full py-3.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.99] text-white font-extrabold text-sm uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw size={17} />
            RESET (Limpiar Unidades Vendidas)
          </button>
        </div>
      </div>
    </div>
  );
}
