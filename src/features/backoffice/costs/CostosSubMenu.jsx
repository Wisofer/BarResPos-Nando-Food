import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Utensils,
  ChevronRight,
  Trash2,
  MoreVertical,
  ExternalLink,
  X,
} from 'lucide-react';
import { calculateRecipeSheet } from '../utils/costosData';

export default function CostosSubMenu({
  category,
  recipes,
  porcentajesInfo,
  onBackHome,
  onSelectRecipe,
  onCreateRecipe,
  onDeleteRecipe,
}) {
  const [newModalOpen, setNewModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newBatchQty, setNewBatchQty] = useState(60);
  const [newGainPct, setNewGainPct] = useState(30);
  const [openMenuRecipeId, setOpenMenuRecipeId] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenMenuRecipeId(null);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  if (!category) return null;

  const catRecipes = (category.recipeIds || [])
    .map((rid) => recipes[rid])
    .filter(Boolean);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    onCreateRecipe({
      categoryId: category.id,
      name: newName.trim(),
      batchQty: Number(newBatchQty) || 60,
      gainPercent: Number(newGainPct) || 30,
    });
    setNewName('');
    setNewModalOpen(false);
  };

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Cabecera Compacta y Limpia de la Categoría */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:px-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackHome}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-all cursor-pointer"
          >
            <ArrowLeft size={14} />
            Volver
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">
                {category.name}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[11px]">
                {catRecipes.length} {catRecipes.length === 1 ? 'plato' : 'platos'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setNewModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
        >
          <Plus size={14} />
          Nuevo Plato
        </button>
      </div>

      {/* Cuadrícula Limpia de Platos de la Categoría */}
      {catRecipes.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto h-11 w-11 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-500 mb-3">
            <Utensils size={20} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Sin platos en esta categoría</h3>
          <button
            type="button"
            onClick={() => setNewModalOpen(true)}
            className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
          >
            <Plus size={14} />
            Crear Primer Plato
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {catRecipes.map((rec) => {
            const calc = calculateRecipeSheet(rec, porcentajesInfo);
            const activeIngredients = (rec.ingredients || []).filter(
              (i) => (i.name && i.name.trim() !== '') || Number(i.unitCost) > 0
            );
            const price30 = calc?.scenarios?.[0]?.price || 0;
            const isMenuOpen = openMenuRecipeId === rec.id;

            return (
              <div
                key={rec.id}
                onClick={() => onSelectRecipe(rec.id, category.id)}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Fila Superior: Icono + Nombre + Menú 3 Puntitos (⋮) */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                      <Utensils size={17} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {rec.displayName || rec.sheetName}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {activeIngredients.length > 0
                          ? `${activeIngredients.length} ingredientes`
                          : 'Plantilla vacía'}
                      </p>
                    </div>
                  </div>

                  {/* Botón de 3 puntitos (⋮) */}
                  <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => setOpenMenuRecipeId(isMenuOpen ? null : rec.id)}
                      className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 top-9 z-30 w-44 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuRecipeId(null);
                            onSelectRecipe(rec.id, category.id);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2 cursor-pointer"
                        >
                          <ExternalLink size={13} />
                          Abrir ficha de costos
                        </button>
                        <div className="my-1 border-t border-slate-100" />
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuRecipeId(null);
                            onDeleteRecipe(rec.id, rec.displayName || rec.sheetName, category.id);
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 size={13} />
                          Eliminar plato
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Pie Limpio: Costo Real y PVP */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Costo Real
                    </span>
                    <span className="text-sm font-black text-emerald-600">
                      C$ {calc.egresoPorProducto.toFixed(2)}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      PVP (30%)
                    </span>
                    <span className="text-sm font-extrabold text-slate-800 inline-flex items-center gap-1">
                      C$ {price30.toFixed(2)}
                      <ChevronRight
                        size={14}
                        className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all"
                      />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal para Agregar Nuevo Plato */}
      {newModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-800">
                Nuevo Plato en {category.name}
              </h3>
              <button
                type="button"
                onClick={() => setNewModalOpen(false)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Plato *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ej. Tostones con Queso y Carne"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Meta 30 Días (Uds)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newBatchQty}
                    onChange={(e) => setNewBatchQty(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    % Ganancia Oficial
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="95"
                    step="0.5"
                    value={newGainPct}
                    onChange={(e) => setNewGainPct(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  Crear y Configurar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
