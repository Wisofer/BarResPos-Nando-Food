import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  FolderPlus,
  Utensils,
  CupSoda,
  Sparkles,
  ChevronRight,
  Pencil,
  Trash2,
  Layers,
  MoreVertical,
  FolderOpen,
  X,
} from 'lucide-react';
import { calculateRecipeSheet } from '../utils/costosData';

export default function CostosHomeMenu({
  categories,
  recipes,
  porcentajesInfo,
  onOpenSubmenu,
  onOpenRecipe,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onCreateRecipe,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'food' | 'drink' | 'extra'
  const [openMenuCatId, setOpenMenuCatId] = useState(null);
  const menuContainerRef = useRef(null);

  // Cerrar menú de 3 puntitos al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target)) {
        setOpenMenuCatId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Modal de Crear / Editar Categoría
  const [catModal, setCatModal] = useState({
    open: false,
    mode: 'create',
    id: null,
    name: '',
    description: '',
    type: 'food',
    initialRecipeName: '',
  });

  // Modal de Crear Nuevo Plato dentro de una Categoría
  const [recipeModal, setRecipeModal] = useState({
    open: false,
    categoryId: categories[0]?.id || '',
    categoryName: categories[0]?.name || '',
    name: '',
    batchQty: 60,
    gainPercent: 30,
  });

  const openNewCategoryModal = () => {
    setOpenMenuCatId(null);
    setCatModal({
      open: true,
      mode: 'create',
      id: null,
      name: '',
      description: '',
      type: 'food',
      initialRecipeName: '',
    });
  };

  const openEditCategoryModal = (cat, e) => {
    e.stopPropagation();
    setOpenMenuCatId(null);
    setCatModal({
      open: true,
      mode: 'edit',
      id: cat.id,
      name: cat.name,
      description: cat.description || '',
      type: cat.type || 'food',
      initialRecipeName: '',
    });
  };

  const handleSaveCategory = (e) => {
    e.preventDefault();
    if (!catModal.name.trim()) return;
    if (catModal.mode === 'create') {
      onCreateCategory({
        name: catModal.name.trim(),
        description: catModal.description.trim(),
        type: catModal.type,
        initialRecipeName: catModal.initialRecipeName.trim(),
      });
    } else {
      onUpdateCategory(catModal.id, {
        name: catModal.name.trim(),
        description: catModal.description.trim(),
        type: catModal.type,
      });
    }
    setCatModal((prev) => ({ ...prev, open: false }));
  };

  const openNewRecipeModal = (cat, e) => {
    if (e) e.stopPropagation();
    setOpenMenuCatId(null);
    setRecipeModal({
      open: true,
      categoryId: cat?.id || categories[0]?.id || '',
      categoryName: cat?.name || categories[0]?.name || '',
      name: '',
      batchQty: 60,
      gainPercent: 30,
    });
  };

  const handleSaveNewRecipe = (e) => {
    e.preventDefault();
    if (!recipeModal.name.trim() || !recipeModal.categoryId) return;
    onCreateRecipe({
      categoryId: recipeModal.categoryId,
      name: recipeModal.name.trim(),
      batchQty: Number(recipeModal.batchQty) || 60,
      gainPercent: Number(recipeModal.gainPercent) || 30,
    });
    setRecipeModal((prev) => ({ ...prev, open: false }));
  };

  // Filtrado de categorías
  const filteredCategories = categories.filter((cat) => {
    if (typeFilter !== 'all' && cat.type !== typeFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchCat =
      cat.name.toLowerCase().includes(q) || (cat.description || '').toLowerCase().includes(q);
    const matchRecipe = (cat.recipeIds || []).some((rid) => {
      const r = recipes[rid];
      if (!r) return false;
      return (
        (r.displayName || '').toLowerCase().includes(q) ||
        (r.sheetName || '').toLowerCase().includes(q) ||
        (r.title || '').toLowerCase().includes(q)
      );
    });
    return matchCat || matchRecipe;
  });

  // Coincidencias directas de platos cuando el usuario escribe en el buscador
  const directMatchingRecipes =
    searchQuery.trim().length > 1
      ? Object.values(recipes || {}).filter((r) => {
          const q = searchQuery.toLowerCase();
          return (
            (r.displayName || '').toLowerCase().includes(q) ||
            (r.sheetName || '').toLowerCase().includes(q)
          );
        })
      : [];

  const getCategoryIcon = (type) => {
    if (type === 'drink') {
      return {
        icon: <CupSoda size={20} className="text-emerald-600" />,
        bg: 'bg-emerald-50 border-emerald-100 group-hover:bg-emerald-100/70',
      };
    }
    if (type === 'extra') {
      return {
        icon: <Sparkles size={20} className="text-amber-600" />,
        bg: 'bg-amber-50 border-amber-100 group-hover:bg-amber-100/70',
      };
    }
    return {
      icon: <Utensils size={20} className="text-indigo-600" />,
      bg: 'bg-indigo-50 border-indigo-100 group-hover:bg-indigo-100/70',
    };
  };

  const handleCategoryCardClick = (cat, catRecipes) => {
    // Si tiene exactamente 1 receta (como Alitas, Nachos, Salchipapas), entra directo a la ficha de ese plato
    if (catRecipes.length === 1) {
      onOpenRecipe(catRecipes[0].id, cat.id);
    } else {
      onOpenSubmenu(cat.id);
    }
  };

  return (
    <div className="space-y-4" ref={menuContainerRef}>
      {/* Barra Única de Control: Buscador + Filtros + [+ Nueva Categoría] */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar categoría o plato…"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-10 pr-8 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl self-start sm:self-auto">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'food', label: 'Comidas' },
                { id: 'drink', label: 'Bebidas' },
                { id: 'extra', label: 'Snacks & Extras' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setTypeFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    typeFilter === tab.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={openNewCategoryModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition-all cursor-pointer active:scale-95 self-end lg:self-auto"
          >
            <FolderPlus size={15} />
            Nueva Categoría
          </button>
        </div>

        {/* Resultados rápidos de platos si el usuario está buscando por nombre de plato */}
        {directMatchingRecipes.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Platos encontrados:
            </span>
            {directMatchingRecipes.slice(0, 6).map((rec) => {
              const calc = calculateRecipeSheet(rec, porcentajesInfo);
              return (
                <button
                  key={rec.id}
                  type="button"
                  onClick={() => onOpenRecipe(rec.id, null)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200/80 bg-indigo-50/50 hover:bg-indigo-100/80 px-2.5 py-1 text-xs font-bold text-indigo-900 transition-colors cursor-pointer"
                >
                  <span>{rec.displayName || rec.sheetName}</span>
                  <span className="text-[11px] font-extrabold text-indigo-600">
                    (C$ {calc ? calc.egresoPorProducto.toFixed(0) : '0'})
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Cuadrícula Minimalista y Uniforme de Categorías (Con menú de 3 puntitos ⋮) */}
      {filteredCategories.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto h-11 w-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
            <Layers size={22} />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No se encontraron categorías</h3>
          <p className="text-xs text-slate-500 mt-1">
            Crea una nueva categoría con el botón «Nueva Categoría».
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredCategories.map((cat) => {
            const theme = getCategoryIcon(cat.type);
            const catRecipes = (cat.recipeIds || [])
              .map((rid) => recipes[rid])
              .filter(Boolean);
            const isMenuOpen = openMenuCatId === cat.id;

            // Resumen limpio de 1 sola línea (ej. "Res · Pollo · Nando")
            const dishNamesPreview =
              catRecipes.length > 0
                ? catRecipes
                    .slice(0, 3)
                    .map((r) => r.displayName || r.sheetName)
                    .join(' · ') + (catRecipes.length > 3 ? ` +${catRecipes.length - 3}` : '')
                : 'Sin platos todavía';

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryCardClick(cat, catRecipes)}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                {/* Izquierda: Icono + Nombre + Subtítulo limpio */}
                <div className="flex items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`h-11 w-11 rounded-xl border ${theme.bg} flex items-center justify-center shrink-0 transition-colors`}
                  >
                    {theme.icon}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                        {cat.name}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                      {dishNamesPreview}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-bold text-[11px]">
                        {catRecipes.length} {catRecipes.length === 1 ? 'plato' : 'platos'}
                      </span>
                      <span className="text-[11px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center">
                        Abrir <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Derecha: Botón de 3 Puntitos (⋮) */}
                <div className="relative shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setOpenMenuCatId(isMenuOpen ? null : cat.id)}
                    title="Opciones de categoría"
                    className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                      isMenuOpen
                        ? 'bg-slate-100 text-slate-900'
                        : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <MoreVertical size={17} />
                  </button>

                  {/* Menú Desplegable de los 3 Puntitos */}
                  {isMenuOpen && (
                    <div className="absolute right-0 top-9 z-30 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-xl">
                      <button
                        type="button"
                        onClick={(e) => openNewRecipeModal(cat, e)}
                        className="w-full px-3.5 py-2 text-left text-xs font-bold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Plus size={14} className="text-indigo-600" />
                        Agregar plato aquí
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuCatId(null);
                          onOpenSubmenu(cat.id);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <FolderOpen size={14} className="text-slate-400" />
                        Ver lista de platos ({catRecipes.length})
                      </button>

                      <button
                        type="button"
                        onClick={(e) => openEditCategoryModal(cat, e)}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Pencil size={14} className="text-slate-400" />
                        Editar categoría
                      </button>

                      <div className="my-1 border-t border-slate-100" />

                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuCatId(null);
                          onDeleteCategory(cat.id, cat.name);
                        }}
                        className="w-full px-3.5 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                      >
                        <Trash2 size={14} />
                        Eliminar categoría
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: Crear o Editar Categoría */}
      {catModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-800">
                {catModal.mode === 'create' ? 'Nueva Categoría' : 'Editar Categoría'}
              </h3>
              <button
                type="button"
                onClick={() => setCatModal((prev) => ({ ...prev, open: false }))}
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre de la Categoría *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={catModal.name}
                  onChange={(e) => setCatModal((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Pizzas, Postres, Combos..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Descripción opcional
                </label>
                <input
                  type="text"
                  value={catModal.description}
                  onChange={(e) =>
                    setCatModal((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Ej. Especialidades horneadas de la casa"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Tipo de Familia
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'food', label: 'Comida' },
                    { id: 'drink', label: 'Bebida' },
                    { id: 'extra', label: 'Snack / Extra' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setCatModal((prev) => ({ ...prev, type: opt.id }))}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        catModal.type === opt.id
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {catModal.mode === 'create' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primer Plato (Opcional)
                  </label>
                  <input
                    type="text"
                    value={catModal.initialRecipeName}
                    onChange={(e) =>
                      setCatModal((prev) => ({ ...prev, initialRecipeName: e.target.value }))
                    }
                    placeholder="Ej. Pizza Pepperoni"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCatModal((prev) => ({ ...prev, open: false }))}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs"
                >
                  {catModal.mode === 'create' ? 'Crear Categoría' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Agregar Plato a una Categoría */}
      {recipeModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-extrabold text-slate-800">
                Nuevo Plato en {recipeModal.categoryName}
              </h3>
              <button
                type="button"
                onClick={() => setRecipeModal((prev) => ({ ...prev, open: false }))}
                className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveNewRecipe} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre del Plato *
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={recipeModal.name}
                  onChange={(e) => setRecipeModal((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej. Hamburguesa Doble Tocino"
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
                    value={recipeModal.batchQty}
                    onChange={(e) =>
                      setRecipeModal((prev) => ({ ...prev, batchQty: e.target.value }))
                    }
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
                    value={recipeModal.gainPercent}
                    onChange={(e) =>
                      setRecipeModal((prev) => ({ ...prev, gainPercent: e.target.value }))
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRecipeModal((prev) => ({ ...prev, open: false }))}
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
