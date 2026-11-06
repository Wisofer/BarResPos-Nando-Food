import React from 'react';
import { ArrowLeft, Plus, Percent } from 'lucide-react';

const NO_SPINNER_CLASS =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function CostosPorcentajesSheet({
  porcentajesInfo,
  onBackHome,
  onUpdateRow,
  onAddRow,
}) {
  if (!porcentajesInfo) return null;

  const handleDays15Change = (rowNumber, val, autoDouble) => {
    const d15 = val === '' ? 0 : Math.max(0, Number(val) || 0);
    if (autoDouble) {
      onUpdateRow(rowNumber, { days15: d15, days30: d15 * 2 });
    } else {
      onUpdateRow(rowNumber, { days15: d15 });
    }
  };

  const handleDays30Change = (rowNumber, val) => {
    const d30 = val === '' ? 0 : Math.max(0, Number(val) || 0);
    onUpdateRow(rowNumber, { days30: d30, autoDouble: false });
  };

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
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight">
                Porcentajes de Ventas y Prorrateo (G/V)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Define las unidades vendidas cada 15 y 30 días para distribuir proporcionalmente la nómina y los gastos fijos
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50/70 border border-indigo-100 px-3.5 py-2 text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400">
              Total 15 Días
            </span>
            <span className="text-sm font-black text-indigo-900">
              {porcentajesInfo.totalDays15.toLocaleString('en-US')} uds
            </span>
          </div>
          <div className="rounded-xl bg-emerald-50/80 border border-emerald-200/70 px-3.5 py-2 text-right">
            <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Total 30 Días (Base 100%)
            </span>
            <span className="text-sm font-black text-emerald-800">
              {porcentajesInfo.totalDays30.toLocaleString('en-US')} platos
            </span>
          </div>
        </div>
      </div>

      {/* Tabla Moderna de Porcentajes */}
      <div className="rounded-[24px] border border-slate-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4 text-center w-16">TOP</th>
                <th className="py-3 px-4">Producto / Plato</th>
                <th className="py-3 px-4 text-right w-32">Ventas 15 Días</th>
                <th className="py-3 px-4 text-right w-32">Ventas 30 Días</th>
                <th className="py-3 px-4 text-right w-36">Porcentaje G/V</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {porcentajesInfo.rows.map((row) => {
                const isActive = row.days30 > 0 || (row.name && row.name.trim() !== '');
                return (
                  <tr
                    key={row.row}
                    className={isActive ? 'bg-white hover:bg-slate-50/70' : 'bg-slate-50/30'}
                  >
                    <td className="py-2 px-4 text-center">
                      <span className="inline-flex h-6 w-7 items-center justify-center rounded-md bg-slate-100 text-xs font-extrabold text-slate-600">
                        {row.top}
                      </span>
                    </td>

                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={row.name}
                        placeholder="Espacio disponible para nuevo producto..."
                        onChange={(e) => onUpdateRow(row.row, { name: e.target.value })}
                        className="w-full rounded-lg px-2.5 py-1 text-xs sm:text-sm font-bold text-slate-800 placeholder:text-slate-300 placeholder:font-normal bg-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </td>

                    <td className="py-1.5 px-3">
                      <input
                        type="number"
                        min="0"
                        value={row.days15 === 0 && !row.name ? '' : row.days15}
                        placeholder="0"
                        onChange={(e) =>
                          handleDays15Change(row.row, e.target.value, row.autoDouble)
                        }
                        className={`w-full rounded-lg border border-slate-200/70 bg-slate-50/50 focus:bg-white px-2.5 py-1 text-right text-xs sm:text-sm font-bold text-slate-700 focus:border-indigo-500 focus:outline-none ${NO_SPINNER_CLASS}`}
                      />
                    </td>

                    <td className="py-1.5 px-3">
                      <input
                        type="number"
                        min="0"
                        value={row.days30 === 0 && !row.name ? '' : row.days30}
                        placeholder="0"
                        onChange={(e) => handleDays30Change(row.row, e.target.value)}
                        className={`w-full rounded-lg border border-slate-200/90 bg-white px-2.5 py-1 text-right text-xs sm:text-sm font-extrabold text-slate-900 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none ${NO_SPINNER_CLASS}`}
                      />
                    </td>

                    <td className="py-2 px-4 text-right">
                      <span
                        className={`inline-flex items-center justify-end px-2.5 py-1 rounded-lg text-xs font-extrabold min-w-[64px] ${
                          row.pctDecimal > 0
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            : 'text-slate-400'
                        }`}
                      >
                        {row.pctDisplay}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 bg-slate-50 font-extrabold text-slate-900 text-xs sm:text-sm">
                <td className="py-3 px-4 text-center text-slate-400">—</td>
                <td className="py-3 px-4 uppercase">TOTAL MENSUAL ACUMULADO</td>
                <td className="py-3 px-4 text-right">
                  {porcentajesInfo.totalDays15.toLocaleString('en-US')}
                </td>
                <td className="py-3 px-4 text-right text-indigo-700">
                  {porcentajesInfo.totalDays30.toLocaleString('en-US')}
                </td>
                <td className="py-3 px-4 text-right text-emerald-700">100.0%</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onAddRow}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <Plus size={14} className="text-indigo-600" />
            Agregar fila adicional
          </button>
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Percent size={12} /> Fórmula: Porcentaje G/V = Ventas 30 Días ÷ Suma Total (
            {porcentajesInfo.totalDays30} platos)
          </span>
        </div>
      </div>
    </div>
  );
}
