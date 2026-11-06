import React from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  CopyCheck,
  Utensils,
  Users,
  Building2,
  TrendingUp,
  Check,
} from 'lucide-react';
import { calculateRecipeSheet } from '../utils/costosData';

const NO_SPINNER_CLASS =
  '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none';

export default function CostosRecipeSheet({
  recipe,
  porcentajesInfo,
  officialGainPercent,
  onBack,
  onUpdateRecipe,
  onUpdatePorcentajesDays30,
  onSyncIndirectsToAll,
  onApplyMarginToPrecios,
}) {
  if (!recipe) return null;

  const calc = calculateRecipeSheet(recipe, porcentajesInfo);

  const handleBatchQtyChange = (val) => {
    const num = Math.max(0, Number(val) || 0);
    if (recipe.batchLinkedToPorcentajes && recipe.porcentajesRow) {
      onUpdatePorcentajesDays30(recipe.porcentajesRow, num);
    }
    onUpdateRecipe(recipe.id, { batchQty: num });
  };

  const handleIngredientChange = (index, field, val) => {
    const updated = recipe.ingredients.map((item, idx) =>
      idx === index
        ? { ...item, [field]: field === 'unitCost' ? (val === '' ? 0 : Number(val)) : val }
        : item
    );
    onUpdateRecipe(recipe.id, { ingredients: updated });
  };

  const handleAddIngredientRow = () => {
    const nextIdx = (recipe.ingredients?.length || 0) + 1;
    onUpdateRecipe(recipe.id, {
      ingredients: [
        ...(recipe.ingredients || []),
        { id: `ing-${Date.now()}-${nextIdx}`, name: '', unitCost: 0 },
      ],
    });
  };

  const handleRemoveIngredientRow = (index) => {
    if ((recipe.ingredients?.length || 0) <= 1) return;
    const updated = recipe.ingredients.filter((_, idx) => idx !== index);
    onUpdateRecipe(recipe.id, { ingredients: updated });
  };

  const handleWorkerChange = (index, field, val) => {
    const updated = recipe.workers.map((w, idx) =>
      idx === index
        ? { ...w, [field]: field === 'amount' ? (val === '' ? 0 : Number(val)) : val }
        : w
    );
    onUpdateRecipe(recipe.id, { workers: updated });
  };

  const handleExpenseChange = (index, field, val) => {
    const updated = recipe.monthlyExpenses.map((e, idx) =>
      idx === index
        ? { ...e, [field]: field === 'amount' ? (val === '' ? 0 : Number(val)) : val }
        : e
    );
    onUpdateRecipe(recipe.id, { monthlyExpenses: updated });
  };

  const handleCustomMarginChange = (val) => {
    const num = Math.min(Math.max(Number(val) || 0, 0), 99);
    onUpdateRecipe(recipe.id, { customMarginPercent: num });
  };

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR COMPACTA DEL PLATO (Nombre completo sin cortarse + Productos por generar + Porcentaje G/V) */}
      <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 sm:px-6 shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition-all shrink-0 cursor-pointer"
          >
            <ArrowLeft size={15} />
            Volver
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                Ficha de Costeo
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Hoja: {recipe.sheetName}
              </span>
            </div>
            <input
              type="text"
              value={recipe.displayName || recipe.title}
              onChange={(e) =>
                onUpdateRecipe(recipe.id, {
                  displayName: e.target.value,
                  title: `COSTOS Y PRECIO DE VENTA ${e.target.value.toUpperCase()}`,
                })
              }
              className="w-full text-lg sm:text-xl font-extrabold text-slate-800 tracking-tight bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none py-0.5 mt-0.5"
            />
          </div>
        </div>

        {/* Controles Superiores: Productos por generar (C4) y Porcentaje G/V (G4) */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200/90 bg-slate-50/70 px-3.5 py-2">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Productos por generar
              </span>
              <span className="text-[11px] text-slate-500">Meta mensual (30 días)</span>
            </div>
            <input
              type="number"
              min="1"
              value={calc.batchQty}
              onChange={(e) => handleBatchQtyChange(e.target.value)}
              className={`w-20 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-center text-sm font-black text-slate-800 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none ${NO_SPINNER_CLASS}`}
            />
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3.5 py-2">
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-indigo-400">
                Porcentaje G/V
              </span>
              <span className="text-[11px] text-indigo-600/80">Prorrateo absorbido</span>
            </div>
            <span className="rounded-lg bg-white border border-indigo-200/80 px-3 py-1.5 text-sm font-black text-indigo-700">
              {calc.pctPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* DISEÑO DE 3 COLUMNAS EN ESCRITORIO: Todo visible en una sola pantalla sin hacer scroll */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* COLUMNA 1 (5 cols): COSTOS DIRECTOS (Materia Prima e Ingredientes) */}
        <div className="lg:col-span-5 rounded-[22px] border border-slate-200/80 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Utensils size={16} className="text-indigo-600" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Costos Directos (Ingredientes)
              </h3>
            </div>
            <button
              type="button"
              onClick={handleAddIngredientRow}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 text-xs font-bold transition-colors cursor-pointer"
            >
              <Plus size={13} />
              Fila
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold uppercase">
                  <th className="py-2 px-3 text-left">Ingrediente</th>
                  <th className="py-2 px-2 text-right w-24">Monto UND</th>
                  <th className="py-2 px-3 text-right w-28">Monto Total</th>
                  <th className="w-7" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {calc.ingredients.map((ing, idx) => (
                  <tr key={ing.id || idx} className="hover:bg-slate-50/70 group">
                    <td className="py-1 px-2">
                      <input
                        type="text"
                        value={ing.name}
                        placeholder={`Ingrediente ${idx + 1}...`}
                        onChange={(e) => handleIngredientChange(idx, 'name', e.target.value)}
                        className="w-full rounded-md px-2 py-1 text-xs font-semibold text-slate-700 bg-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                      />
                    </td>
                    <td className="py-1 px-1.5">
                      <div className="flex items-center rounded-md border border-transparent focus-within:border-indigo-300 focus-within:bg-white px-1.5 py-0.5">
                        <span className="text-[11px] text-slate-400 mr-1">C$</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={ing.unitCost === 0 ? '' : ing.unitCost}
                          placeholder="0.00"
                          onChange={(e) =>
                            handleIngredientChange(idx, 'unitCost', e.target.value)
                          }
                          className={`w-full text-right text-xs font-bold text-slate-800 bg-transparent focus:outline-none ${NO_SPINNER_CLASS}`}
                        />
                      </div>
                    </td>
                    <td className="py-1.5 px-3 text-right font-semibold text-slate-600">
                      C$ {ing.totalCost.toFixed(2)}
                    </td>
                    <td className="pr-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveIngredientRow(idx)}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-500 transition-opacity"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-indigo-50/60 font-extrabold text-slate-900 text-xs">
                  <td className="py-2.5 px-4 uppercase text-indigo-950">TOTAL DIRECTO</td>
                  <td className="py-2.5 px-2 text-right text-indigo-700">
                    C$ {calc.totalDirectUnit.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-indigo-950">
                    C$ {calc.totalDirectBatch.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* COLUMNA 2 (4 cols): COSTOS INDIRECTOS (NÓMINA) Y GASTOS MENSUALES (SERVICIOS) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Sub-tarjeta 1: Costos Indirectos (Nómina) */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Users size={15} className="text-violet-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Costos Indirectos (Nómina)
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Total: C$ {calc.totalWorkers.toLocaleString('en-US')}
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {calc.workers.map((w, idx) => (
                <div key={w.id || idx} className="flex items-center justify-between px-3 py-1.5">
                  <input
                    type="text"
                    value={w.name}
                    onChange={(e) => handleWorkerChange(idx, 'name', e.target.value)}
                    className="flex-1 font-semibold text-slate-700 bg-transparent focus:outline-none px-1 py-0.5 rounded focus:bg-slate-50"
                  />
                  <div className="flex items-center gap-1 w-28">
                    <span className="text-[11px] text-slate-400">C$</span>
                    <input
                      type="number"
                      step="100"
                      value={w.amount}
                      onChange={(e) => handleWorkerChange(idx, 'amount', e.target.value)}
                      className={`w-full text-right font-bold text-slate-800 bg-transparent focus:outline-none px-1 py-0.5 rounded focus:bg-slate-50 ${NO_SPINNER_CLASS}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 bg-amber-50/80 border-t border-amber-200/70 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">
                Proporcional ({calc.pctPercent.toFixed(1)}%)
              </span>
              <span className="text-xs font-black text-amber-950 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs">
                C$ {calc.proportionalWorkers.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Sub-tarjeta 2: Gastos Mensuales (Servicios) */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Building2 size={15} className="text-emerald-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Gastos Mensuales
                </h3>
              </div>
              <span className="text-[11px] font-bold text-slate-400">
                Total: C$ {calc.totalMonthlyExpenses.toLocaleString('en-US')}
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {calc.monthlyExpenses.map((exp, idx) => (
                <div key={exp.id || idx} className="flex items-center justify-between px-3 py-1">
                  <input
                    type="text"
                    value={exp.name}
                    onChange={(e) => handleExpenseChange(idx, 'name', e.target.value)}
                    className="flex-1 font-semibold text-slate-700 bg-transparent focus:outline-none px-1 py-0.5 rounded focus:bg-slate-50"
                  />
                  <div className="flex items-center gap-1 w-28">
                    <span className="text-[11px] text-slate-400">C$</span>
                    <input
                      type="number"
                      step="100"
                      value={exp.amount}
                      onChange={(e) => handleExpenseChange(idx, 'amount', e.target.value)}
                      className={`w-full text-right font-bold text-slate-800 bg-transparent focus:outline-none px-1 py-0.5 rounded focus:bg-slate-50 ${NO_SPINNER_CLASS}`}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-2.5 bg-amber-50/80 border-t border-amber-200/70 flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">
                Proporcional ({calc.pctPercent.toFixed(1)}%)
              </span>
              <span className="text-xs font-black text-amber-950 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs">
                C$ {calc.proportionalExpenses.toFixed(2)}
              </span>
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => onSyncIndirectsToAll(recipe.workers, recipe.monthlyExpenses)}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 py-1.5 px-3 text-[11px] font-bold text-slate-600 transition-colors cursor-pointer"
              >
                <CopyCheck size={13} />
                Sincronizar estos gastos fijos en todas las recetas
              </button>
            </div>
          </div>
        </div>

        {/* COLUMNA 3 (3 cols): RESUMEN DE EGRESOS Y LOS 4 ESCENARIOS DE PRECIO DE VENTA */}
        <div className="lg:col-span-3 space-y-4">
          {/* Tarjeta de Egreso Mensual y Egreso por Producto */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white p-4 shadow-sm space-y-3">
            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Egreso Mensual Total (Lote)
              </p>
              <p className="text-lg font-extrabold text-slate-800 mt-0.5">
                C$ {Math.round(calc.egresoMensual).toLocaleString('en-US')}
                <span className="text-xs font-medium text-slate-400 ml-1.5">
                  ({calc.egresoMensual.toFixed(2)})
                </span>
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50/90 border border-emerald-200 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                Egreso por Producto (Costo Real)
              </p>
              <p className="text-2xl font-black text-emerald-700 mt-0.5">
                C$ {calc.egresoPorProducto.toFixed(2)}
              </p>
              <p className="text-[11px] font-medium text-emerald-800/80 mt-0.5">
                Directo C$ {calc.totalDirectUnit.toFixed(2)} + Indirecto C${' '}
                {(calc.egresoPorProducto - calc.totalDirectUnit).toFixed(2)}
              </p>
            </div>
          </div>

          {/* Tarjeta de los 4 Escenarios de % de Ganancia vs Precio de Venta */}
          <div className="rounded-[22px] border border-slate-200/80 bg-white overflow-hidden shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <TrendingUp size={15} className="text-indigo-600" />
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Precios por % de Ganancia
                </h3>
              </div>
              {officialGainPercent !== null && officialGainPercent !== undefined && (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                  Actual: {officialGainPercent}%
                </span>
              )}
            </div>

            <div className="p-3.5 space-y-2.5">
              {calc.scenarios.map((sc) => {
                const isSelectedOfficial =
                  officialGainPercent !== null &&
                  Math.abs(Number(officialGainPercent) - Number(sc.marginPercent)) < 0.05;

                return (
                  <div
                    key={sc.id}
                    className={`rounded-xl border p-3 transition-all ${
                      sc.editable
                        ? 'border-indigo-200 bg-indigo-50/40'
                        : 'border-slate-200/80 bg-slate-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {sc.editable ? '% Personalizado' : '% de Ganancia'}
                        </span>
                        {sc.editable ? (
                          <div className="mt-1 inline-flex items-center gap-1 rounded-lg border border-indigo-300 bg-white px-2 py-0.5">
                            <input
                              type="number"
                              min="1"
                              max="95"
                              step="0.5"
                              value={sc.marginPercent}
                              onChange={(e) => handleCustomMarginChange(e.target.value)}
                              className={`w-12 text-center text-sm font-black text-indigo-700 bg-transparent focus:outline-none ${NO_SPINNER_CLASS}`}
                            />
                            <span className="text-xs font-black text-indigo-700">%</span>
                          </div>
                        ) : (
                          <span className="text-sm font-extrabold text-slate-800">
                            {sc.marginPercent} %
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Precio de Venta
                        </span>
                        <span className="text-base font-black text-rose-600">
                          C$ {sc.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {onApplyMarginToPrecios && (
                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onApplyMarginToPrecios(recipe.id, sc.marginPercent)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                            isSelectedOfficial
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
                          }`}
                        >
                          {isSelectedOfficial ? (
                            <>
                              <Check size={12} /> Fijado en Precios ({sc.marginPercent}%)
                            </>
                          ) : (
                            <>Fijar {sc.marginPercent}% en Precios Oficiales</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
