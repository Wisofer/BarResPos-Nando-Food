import React, { useState, useMemo, useEffect } from 'react';
import {
  Calculator,
  RotateCcw,
  Save,
  ChevronRight,
  Percent,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { BackofficePageShell } from '../components/Skeletons.jsx';
import { ConfirmModal } from '../../../components/ui/ConfirmModal.jsx';
import {
  INITIAL_CATEGORIES,
  INITIAL_PORCENTAJES,
  INITIAL_RECIPES,
  INITIAL_PRECIOS,
  calculatePorcentajesTable,
  calculatePreciosTable,
  calculateCalculadoraTable,
} from '../utils/costosData';
import CostosHomeMenu from '../costs/CostosHomeMenu';
import CostosSubMenu from '../costs/CostosSubMenu';
import CostosRecipeSheet from '../costs/CostosRecipeSheet';
import CostosPorcentajesSheet from '../costs/CostosPorcentajesSheet';
import CostosPreciosSheet from '../costs/CostosPreciosSheet';
import CostosCalculadoraSheet from '../costs/CostosCalculadoraSheet';

const STORAGE_KEY = 'nando_costos_saas_v4';

export function CostosView({ showMessage }) {
  // 1. Estado de Categorías Dinámicas
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.categories) && parsed.categories.length > 0) {
          return parsed.categories;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_CATEGORIES;
  });

  // 2. Estado de Porcentajes
  const [porcentajesRows, setPorcentajesRows] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.porcentajesRows) && parsed.porcentajesRows.length > 0) {
          return parsed.porcentajesRows;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_PORCENTAJES;
  });

  // 3. Estado de Recetas / Fichas Técnicas
  const [recipes, setRecipes] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.recipes && Object.keys(parsed.recipes).length > 0) {
          return parsed.recipes;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_RECIPES;
  });

  // 4. Estado de Precios Oficiales
  const [preciosRows, setPreciosRows] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.preciosRows) && parsed.preciosRows.length > 0) {
          return parsed.preciosRows;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_PRECIOS;
  });

  // 5. Estado de Simulación de Ventas en Calculadora
  const [salesByRow, setSalesByRow] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.salesByRow) return parsed.salesByRow;
      }
    } catch {
      // Fallback
    }
    return { 3: 900 };
  });

  // Navegación limpia entre pantallas
  const [screen, setScreen] = useState({
    type: 'home', // 'home' | 'submenu' | 'recipe' | 'porcentajes' | 'precios' | 'calculadora'
    categoryId: null,
    recipeId: null,
    fromCategoryId: null,
  });

  // Confirmación de eliminación
  const [confirmState, setConfirmState] = useState({
    open: false,
    kind: null, // 'category' | 'recipe'
    id: null,
    name: '',
    extraCategoryId: null,
  });

  // Guardado automático en localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          categories,
          porcentajesRows,
          recipes,
          preciosRows,
          salesByRow,
        })
      );
    } catch {
      // ignore quota errors
    }
  }, [categories, porcentajesRows, recipes, preciosRows, salesByRow]);

  // Cálculos matemáticos en tiempo real
  const porcentajesInfo = useMemo(
    () => calculatePorcentajesTable(porcentajesRows),
    [porcentajesRows]
  );

  const preciosInfo = useMemo(
    () => calculatePreciosTable(preciosRows, recipes, porcentajesInfo),
    [preciosRows, recipes, porcentajesInfo]
  );

  const calculadoraInfo = useMemo(
    () => calculateCalculadoraTable(preciosInfo, salesByRow),
    [preciosInfo, salesByRow]
  );

  // Navegación
  const goHome = () =>
    setScreen({ type: 'home', categoryId: null, recipeId: null, fromCategoryId: null });

  const openCategory = (categoryId) =>
    setScreen({
      type: 'submenu',
      categoryId,
      recipeId: null,
      fromCategoryId: categoryId,
    });

  const openRecipe = (recipeId, fromCategoryId = null) =>
    setScreen({
      type: 'recipe',
      categoryId: null,
      recipeId,
      fromCategoryId,
    });

  const openTool = (toolId) =>
    setScreen({
      type: toolId,
      categoryId: null,
      recipeId: null,
      fromCategoryId: null,
    });

  const handleBackFromRecipe = () => {
    if (screen.fromCategoryId && categories.some((c) => c.id === screen.fromCategoryId)) {
      openCategory(screen.fromCategoryId);
    } else {
      goHome();
    }
  };

  // ========================================================================
  // CRUD DE CATEGORÍAS Y RECETAS (Crear desde cero, Editar, Eliminar)
  // ========================================================================

  const createNewRecipeInternal = ({ categoryId, name, batchQty = 60, gainPercent = 30 }) => {
    const cleanName = name.trim();
    const sheetCode = cleanName.toUpperCase().slice(0, 18);
    const uniqueId = recipes[sheetCode] ? `${sheetCode}-${Date.now().toString().slice(-3)}` : sheetCode;

    // Tomar como base los costos indirectos y gastos mensuales de H. RES (o valores estándar)
    const refRecipe = recipes['H. RES'] || Object.values(recipes)[0];
    const baseWorkers = refRecipe?.workers
      ? refRecipe.workers.map((w) => ({ ...w }))
      : [
          { id: 'w-1', name: 'trabajador 1', amount: 16000 },
          { id: 'w-2', name: 'trabajador 2', amount: 14400 },
          { id: 'w-3', name: 'trabajador 3', amount: 26800 },
        ];
    const baseExpenses = refRecipe?.monthlyExpenses
      ? refRecipe.monthlyExpenses.map((e) => ({ ...e }))
      : [
          { id: 'exp-1', name: 'Gas', amount: 12000 },
          { id: 'exp-2', name: 'aceite', amount: 12600 },
          { id: 'exp-3', name: 'luz', amount: 6000 },
          { id: 'exp-4', name: 'agua', amount: 1200 },
          { id: 'exp-5', name: 'PRESTAMO', amount: 54000 },
          { id: 'exp-6', name: 'internet', amount: 1300 },
          { id: 'exp-7', name: 'Envios', amount: 8000 },
        ];

    // Buscar una fila vacía en PORCENTAJES o crear una nueva al final
    let targetPctRow = null;
    const emptyPct = porcentajesRows.find((r) => !r.name || r.name.trim() === '');
    if (emptyPct) {
      targetPctRow = emptyPct.row;
      setPorcentajesRows((prev) =>
        prev.map((r) =>
          r.row === targetPctRow
            ? {
                ...r,
                name: cleanName.toUpperCase(),
                days15: Math.round(batchQty / 2),
                days30: batchQty,
                autoDouble: true,
              }
            : r
        )
      );
    } else {
      const maxRow = porcentajesRows.reduce((m, r) => Math.max(m, r.row), 35);
      targetPctRow = maxRow + 1;
      setPorcentajesRows((prev) => [
        ...prev,
        {
          row: targetPctRow,
          top: targetPctRow,
          name: cleanName.toUpperCase(),
          days15: Math.round(batchQty / 2),
          days30: batchQty,
          autoDouble: true,
        },
      ]);
    }

    // Crear la ficha de la receta con 8 filas iniciales listas para llenar
    const newRecipeObj = {
      id: uniqueId,
      sheetName: uniqueId,
      displayName: cleanName,
      title: `COSTOS Y PRECIO DE VENTA ${cleanName.toUpperCase()}`,
      batchQty,
      batchLinkedToPorcentajes: true,
      porcentajesRow: targetPctRow,
      customMarginPercent: gainPercent,
      ingredients: Array.from({ length: 8 }, (_, idx) => ({
        id: `ing-${idx + 1}`,
        name: '',
        unitCost: 0,
      })),
      workers: baseWorkers,
      monthlyExpenses: baseExpenses,
    };

    setRecipes((prev) => ({
      ...prev,
      [uniqueId]: newRecipeObj,
    }));

    // Vincular a la categoría seleccionada
    if (categoryId) {
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, recipeIds: [...(c.recipeIds || []), uniqueId] }
            : c
        )
      );
    }

    // Agregar también a la tabla PRECIOS
    setPreciosRows((prev) => {
      const maxRow = prev.reduce((m, r) => Math.max(m, r.row), 26);
      return [
        ...prev,
        {
          row: maxRow + 1,
          name: cleanName.toUpperCase(),
          gainPercent,
          recipeSheet: uniqueId,
          defaultCalculadoraSales: 0,
        },
      ];
    });

    return uniqueId;
  };

  const handleCreateCategory = ({ name, description, type, initialRecipeName }) => {
    const newCatId = `cat-${Date.now()}`;
    const newCategory = {
      id: newCatId,
      name,
      description,
      type: type || 'food',
      recipeIds: [],
    };

    setCategories((prev) => [newCategory, ...prev]);

    if (initialRecipeName) {
      const createdRecipeId = createNewRecipeInternal({
        categoryId: newCatId,
        name: initialRecipeName,
        batchQty: 60,
        gainPercent: 30,
      });
      openRecipe(createdRecipeId, newCatId);
      if (showMessage) {
        showMessage(
          `Categoría «${name}» y plato «${initialRecipeName}» creados.`,
          'success'
        );
      }
    } else {
      if (showMessage) {
        showMessage(`Categoría «${name}» creada correctamente.`, 'success');
      }
    }
  };

  const handleUpdateCategory = (catId, changes) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, ...changes } : c))
    );
    if (showMessage) {
      showMessage('Categoría actualizada.', 'success');
    }
  };

  const requestDeleteCategory = (catId, catName) => {
    setConfirmState({
      open: true,
      kind: 'category',
      id: catId,
      name: catName,
      extraCategoryId: null,
    });
  };

  const handleCreateRecipe = ({ categoryId, name, batchQty, gainPercent }) => {
    const newId = createNewRecipeInternal({ categoryId, name, batchQty, gainPercent });
    openRecipe(newId, categoryId);
    if (showMessage) {
      showMessage(`Ficha de costos para «${name}» creada.`, 'success');
    }
  };

  const requestDeleteRecipe = (recipeId, recipeName, categoryId) => {
    setConfirmState({
      open: true,
      kind: 'recipe',
      id: recipeId,
      name: recipeName,
      extraCategoryId: categoryId,
    });
  };

  const executeConfirmedDelete = () => {
    if (confirmState.kind === 'category') {
      setCategories((prev) => prev.filter((c) => c.id !== confirmState.id));
      if (screen.categoryId === confirmState.id) {
        goHome();
      }
      if (showMessage) {
        showMessage(`Categoría «${confirmState.name}» eliminada.`, 'info');
      }
    } else if (confirmState.kind === 'recipe') {
      const rid = confirmState.id;
      setCategories((prev) =>
        prev.map((c) => ({
          ...c,
          recipeIds: (c.recipeIds || []).filter((id) => id !== rid),
        }))
      );
      setRecipes((prev) => {
        const next = { ...prev };
        delete next[rid];
        return next;
      });
      setPreciosRows((prev) => prev.filter((r) => r.recipeSheet !== rid));
      if (screen.recipeId === rid) {
        handleBackFromRecipe();
      }
      if (showMessage) {
        showMessage(`Receta «${confirmState.name}» eliminada.`, 'info');
      }
    }
    setConfirmState({ open: false, kind: null, id: null, name: '', extraCategoryId: null });
  };

  // ========================================================================
  // HANDLERS DE EDICIÓN DE RECETAS, PORCENTAJES, PRECIOS Y CALCULADORA
  // ========================================================================

  const handleUpdateRecipe = (recipeId, changes) => {
    setRecipes((prev) => ({
      ...prev,
      [recipeId]: {
        ...prev[recipeId],
        ...changes,
      },
    }));
  };

  const handleUpdatePorcentajesRow = (rowNumber, changes) => {
    setPorcentajesRows((prev) =>
      prev.map((r) => (r.row === rowNumber ? { ...r, ...changes } : r))
    );
  };

  const handleAddPorcentajesRow = () => {
    setPorcentajesRows((prev) => {
      const maxRow = prev.reduce((m, r) => Math.max(m, r.row), 35);
      const nextRow = maxRow + 1;
      return [
        ...prev,
        {
          row: nextRow,
          top: nextRow,
          name: '',
          days15: 0,
          days30: 0,
          autoDouble: true,
        },
      ];
    });
  };

  const handleUpdatePorcentajesDays30 = (rowNumber, days30) => {
    setPorcentajesRows((prev) =>
      prev.map((r) =>
        r.row === rowNumber ? { ...r, days30, days15: Math.round(days30 / 2) } : r
      )
    );
  };

  const handleSyncIndirectsToAll = (workers, monthlyExpenses) => {
    setRecipes((prev) => {
      const next = {};
      for (const [key, rec] of Object.entries(prev)) {
        next[key] = {
          ...rec,
          workers: workers.map((w) => ({ ...w })),
          monthlyExpenses: monthlyExpenses.map((e) => ({ ...e })),
        };
      }
      return next;
    });
    if (showMessage) {
      showMessage(
        'Nómina y Gastos Mensuales sincronizados en todas las fichas de recetas.',
        'success'
      );
    }
  };

  const handleUpdateGainPercent = (rowNumber, gainPercent) => {
    setPreciosRows((prev) =>
      prev.map((r) => (r.row === rowNumber ? { ...r, gainPercent } : r))
    );
  };

  const handleApplyMarginToPrecios = (recipeId, marginPercent) => {
    const existing = preciosRows.find((r) => r.recipeSheet === recipeId);
    if (existing) {
      handleUpdateGainPercent(existing.row, marginPercent);
    } else {
      const rec = recipes[recipeId];
      if (!rec) return;
      const maxRow = preciosRows.reduce((m, r) => Math.max(m, r.row), 26);
      setPreciosRows((prev) => [
        ...prev,
        {
          row: maxRow + 1,
          name: (rec.displayName || rec.sheetName).toUpperCase(),
          gainPercent: marginPercent,
          recipeSheet: recipeId,
          defaultCalculadoraSales: 0,
        },
      ]);
    }
    if (showMessage) {
      showMessage(`Margen de ${marginPercent}% fijado en la tabla de Precios Oficiales.`, 'success');
    }
  };

  const handleUpdateSalesQty = (rowNumber, qty) => {
    setSalesByRow((prev) => ({
      ...prev,
      [rowNumber]: qty,
    }));
  };

  const handleResetCalculadora = () => {
    setSalesByRow({});
    if (showMessage) {
      showMessage('Unidades vendidas limpiadas en la Calculadora.', 'info');
    }
  };

  const handleLoadMonthlyGoalsToCalculadora = () => {
    const nextSales = {};
    for (const pRow of preciosRows) {
      const rec = recipes[pRow.recipeSheet];
      if (rec) {
        const pctRow = rec.porcentajesRow
          ? porcentajesInfo.rowsByRowNumber[rec.porcentajesRow]
          : null;
        nextSales[pRow.row] = pctRow ? pctRow.days30 : rec.batchQty || 0;
      }
    }
    setSalesByRow(nextSales);
    if (showMessage) {
      showMessage('Metas mensuales (30 días) cargadas en la Calculadora.', 'success');
    }
  };

  const handleSaveManual = () => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          categories,
          porcentajesRows,
          recipes,
          preciosRows,
          salesByRow,
        })
      );
      if (showMessage) {
        showMessage('Cambios guardados correctamente.', 'success');
      }
    } catch {
      if (showMessage) {
        showMessage('No se pudo guardar en almacenamiento local.', 'error');
      }
    }
  };

  const handleResetToFactoryExcel = () => {
    setCategories(INITIAL_CATEGORIES);
    setPorcentajesRows(INITIAL_PORCENTAJES);
    setRecipes(INITIAL_RECIPES);
    setPreciosRows(INITIAL_PRECIOS);
    setSalesByRow({ 3: 900 });
    localStorage.removeItem(STORAGE_KEY);
    goHome();
    if (showMessage) {
      showMessage('Catálogo restaurado a los datos base de Nando V3.', 'info');
    }
  };

  const activeCategoryObj = categories.find((c) => c.id === screen.categoryId);
  const fromCategoryObj = categories.find((c) => c.id === screen.fromCategoryId);
  const activeRecipeObj = screen.recipeId ? recipes[screen.recipeId] : null;
  const activeRecipeOfficialPriceRow = activeRecipeObj
    ? preciosRows.find((r) => r.recipeSheet === activeRecipeObj.id)
    : null;

  return (
    <BackofficePageShell maxWidth="7xl" className="min-w-0 space-y-4 pb-10">
      {/* BARRA SUPERIOR UNIFICADA (Estilo Nando POS) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Ruta de Navegación Interactiva */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={goHome}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all cursor-pointer ${
              screen.type === 'home'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers size={14} />
            Categorías y Recetas
          </button>

          {screen.type === 'submenu' && activeCategoryObj && (
            <>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="rounded-xl bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 text-xs font-extrabold text-indigo-800">
                {activeCategoryObj.name}
              </span>
            </>
          )}

          {screen.type === 'recipe' && activeRecipeObj && (
            <>
              {fromCategoryObj && (
                <>
                  <ChevronRight size={14} className="text-slate-400" />
                  <button
                    type="button"
                    onClick={() => openCategory(fromCategoryObj.id)}
                    className="rounded-xl bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
                  >
                    {fromCategoryObj.name}
                  </button>
                </>
              )}
              <ChevronRight size={14} className="text-slate-400" />
              <span className="rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs font-extrabold text-emerald-800">
                {activeRecipeObj.displayName || activeRecipeObj.sheetName}
              </span>
            </>
          )}

          {screen.type === 'porcentajes' && (
            <>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="rounded-xl bg-indigo-50 border border-indigo-200/80 px-3 py-1.5 text-xs font-extrabold text-indigo-800">
                Porcentajes (G/V)
              </span>
            </>
          )}

          {screen.type === 'precios' && (
            <>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 text-xs font-extrabold text-emerald-800">
                Precios Oficiales
              </span>
            </>
          )}

          {screen.type === 'calculadora' && (
            <>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="rounded-xl bg-blue-50 border border-blue-200/80 px-3 py-1.5 text-xs font-extrabold text-blue-800">
                Calculadora
              </span>
            </>
          )}
        </div>

        {/* Pestañas de Herramientas Globales + Acciones */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => openTool('porcentajes')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              screen.type === 'porcentajes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Percent size={13} />
            Porcentajes
          </button>

          <button
            type="button"
            onClick={() => openTool('precios')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              screen.type === 'precios'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <TrendingUp size={13} />
            Precios
          </button>

          <button
            type="button"
            onClick={() => openTool('calculadora')}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
              screen.type === 'calculadora'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Calculator size={13} />
            Calculadora
          </button>

          <div className="h-4 w-px bg-slate-200 mx-0.5 hidden sm:block" />

          <button
            type="button"
            onClick={handleResetToFactoryExcel}
            title="Restaurar catálogo original"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            Restaurar
          </button>

          <button
            type="button"
            onClick={handleSaveManual}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Save size={13} />
            Guardar
          </button>
        </div>
      </div>

      {/* CONTENIDO DE LA PANTALLA ACTIVA */}
      {screen.type === 'home' && (
        <CostosHomeMenu
          categories={categories}
          recipes={recipes}
          porcentajesInfo={porcentajesInfo}
          preciosInfo={preciosInfo}
          calculadoraInfo={calculadoraInfo}
          onOpenSubmenu={openCategory}
          onOpenRecipe={openRecipe}
          onOpenTool={openTool}
          onCreateCategory={handleCreateCategory}
          onUpdateCategory={handleUpdateCategory}
          onDeleteCategory={requestDeleteCategory}
          onCreateRecipe={handleCreateRecipe}
        />
      )}

      {screen.type === 'submenu' && (
        <CostosSubMenu
          category={activeCategoryObj}
          recipes={recipes}
          porcentajesInfo={porcentajesInfo}
          onBackHome={goHome}
          onSelectRecipe={openRecipe}
          onCreateRecipe={handleCreateRecipe}
          onDeleteRecipe={requestDeleteRecipe}
        />
      )}

      {screen.type === 'recipe' && (
        <CostosRecipeSheet
          recipe={activeRecipeObj}
          porcentajesInfo={porcentajesInfo}
          officialGainPercent={activeRecipeOfficialPriceRow?.gainPercent ?? null}
          onBack={handleBackFromRecipe}
          onUpdateRecipe={handleUpdateRecipe}
          onUpdatePorcentajesDays30={handleUpdatePorcentajesDays30}
          onSyncIndirectsToAll={handleSyncIndirectsToAll}
          onApplyMarginToPrecios={handleApplyMarginToPrecios}
        />
      )}

      {screen.type === 'porcentajes' && (
        <CostosPorcentajesSheet
          porcentajesInfo={porcentajesInfo}
          onBackHome={goHome}
          onUpdateRow={handleUpdatePorcentajesRow}
          onAddRow={handleAddPorcentajesRow}
        />
      )}

      {screen.type === 'precios' && (
        <CostosPreciosSheet
          preciosInfo={preciosInfo}
          onBackHome={goHome}
          onUpdateGainPercent={handleUpdateGainPercent}
          onOpenRecipe={openRecipe}
        />
      )}

      {screen.type === 'calculadora' && (
        <CostosCalculadoraSheet
          calculadoraInfo={calculadoraInfo}
          onBackHome={goHome}
          onUpdateSalesQty={handleUpdateSalesQty}
          onResetSales={handleResetCalculadora}
          onLoadMonthlyGoals={handleLoadMonthlyGoalsToCalculadora}
        />
      )}

      {/* Modal de Confirmación para Eliminar Categoría o Receta */}
      <ConfirmModal
        open={confirmState.open}
        title={
          confirmState.kind === 'category'
            ? 'Eliminar categoría de costos'
            : 'Eliminar ficha de receta'
        }
        message={
          confirmState.kind === 'category'
            ? `¿Seguro que deseas eliminar la categoría «${confirmState.name}»?`
            : `¿Seguro que deseas eliminar la ficha de costos «${confirmState.name}»?`
        }
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        variant="danger"
        onConfirm={executeConfirmedDelete}
        onCancel={() =>
          setConfirmState({
            open: false,
            kind: null,
            id: null,
            name: '',
            extraCategoryId: null,
          })
        }
      />
    </BackofficePageShell>
  );
}

export default CostosView;
