import React from 'react';
import { ArrowLeft, ExternalLink, TrendingUp } from 'lucide-react';

const NO_SPINNER_CLASS =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function CostosPreciosSheet({
  preciosInfo,
  onBackHome,
  onUpdateGainPercent,
  onOpenRecipe,
}) {
  if (!preciosInfo) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-4">
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
              Lista Oficial de Precios y Márgenes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ajusta el porcentaje de ganancia elegido para cada plato y obtén al instante su Precio de Venta en C$
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/70 px-4 py-2 text-right">
          <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600">
            Margen Promedio del Menú
          </span>
          <span className="text-base font-black text-emerald-800">
            {preciosInfo.avgGainPercent.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Tabla Moderna de Precios Oficiales */}
      <div className="rounded-[24px] border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4">Producto / Plato</th>
                <th className="py-3 px-4 text-right w-36">Costo Real (F24)</th>
                <th className="py-3 px-4 text-center w-44">% Ganancia Elegido</th>
                <th className="py-3 px-4 text-right w-36">Ganancia / Plato</th>
                <th className="py-3 px-4 text-right w-40">Precio Oficial (C$)</th>
                <th className="py-3 px-4 text-right w-28">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {preciosInfo.rows.map((row, idx) => {
                const roundedPrice = Math.round(row.officialPrice);
                const profitPerUnit = row.officialPrice - row.unitCostF24;

                return (
                  <tr key={row.row} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-4 text-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="py-2.5 px-4 font-extrabold text-slate-800 uppercase text-xs sm:text-sm">
                      {row.name}
                    </td>

                    <td className="py-2.5 px-4 text-right font-semibold text-slate-500 text-xs sm:text-sm">
                      C$ {row.unitCostF24.toFixed(2)}
                    </td>

                    {/* % de Ganancia Limpio (Sin recortar dígitos) */}
                    <td className="py-2 px-4 text-center">
                      <div className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50/70 focus-within:bg-white focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/15 px-3 py-1">
                        <input
                          type="number"
                          step="0.1"
                          min="1"
                          max="95"
                          value={row.gainPercent}
                          onChange={(e) =>
                            onUpdateGainPercent(
                              row.row,
                              Math.min(Math.max(Number(e.target.value) || 0, 0), 95)
                            )
                          }
                          className={`w-16 text-right font-extrabold text-slate-900 bg-transparent focus:outline-none text-xs sm:text-sm ${NO_SPINNER_CLASS}`}
                        />
                        <span className="font-bold text-slate-500 ml-1 text-xs sm:text-sm">
                          %
                        </span>
                      </div>
                    </td>

                    <td className="py-2.5 px-4 text-right font-semibold text-indigo-600 text-xs sm:text-sm">
                      +C$ {profitPerUnit.toFixed(2)}
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      <span className="inline-flex items-center justify-between min-w-[96px] rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-sm font-black text-emerald-700">
                        <span>C$</span>
                        <span>{roundedPrice.toLocaleString('en-US')}</span>
                      </span>
                    </td>

                    <td className="py-2.5 px-4 text-right">
                      {row.recipeSheet && (
                        <button
                          type="button"
                          onClick={() => onOpenRecipe(row.recipeSheet, null)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 px-2.5 py-1 text-xs font-bold text-slate-600 transition-colors cursor-pointer"
                        >
                          <span>Ficha</span>
                          <ExternalLink size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-extrabold text-slate-900 text-xs sm:text-sm">
                <td className="py-3 px-4 text-center text-slate-400">—</td>
                <td className="py-3 px-4 uppercase" colSpan={2}>
                  Promedio General de Rentabilidad (Base de Calculadora)
                </td>
                <td className="py-3 px-4 text-center text-emerald-700 font-black">
                  {preciosInfo.avgGainPercent.toFixed(1)}%
                </td>
                <td colSpan={3} className="py-3 px-4 text-right text-xs text-slate-400 font-medium">
                  Fórmula: Precio Oficial = Costo Real ÷ (1 - % Ganancia)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
