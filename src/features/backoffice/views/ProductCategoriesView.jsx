import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, Plus, PowerOff, Trash2 } from "lucide-react";
import { backofficeApi } from "../services/backofficeApi.js";
import { BackofficeListSkeletonLoading } from "../components/Skeletons.jsx";
import { BackofficeDialog } from "../components/BackofficeDialog.jsx";
import { useSnackbar } from "../../../contexts/SnackbarContext.jsx";
import { ConfirmModal } from "../../../components/ui/ConfirmModal.jsx";

function categoriaRequiereCocina(c) {
  const v = c?.requiereCocina ?? c?.RequiereCocina;
  return v !== false;
}

function categoriaRequiereBar(c) {
  if (c?.requiereBar !== undefined && c?.requiereBar !== null) return Boolean(c.requiereBar);
  if (c?.RequiereBar !== undefined && c?.RequiereBar !== null) return Boolean(c.RequiereBar);
  return !categoriaRequiereCocina(c);
}

function formatCatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("es-NI", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export function ProductCategoriesView({ onBackToProducts, onOpenProducts, onCategoriesMutated }) {
  const snackbar = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [countsByCatId, setCountsByCatId] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({
    id: null,
    nombre: "",
    descripcion: "",
    iconoNombre: "",
    requiereCocina: true,
    requiereBar: false,
    activo: true,
  });
  const [confirmAction, setConfirmAction] = useState({ open: false, type: "", id: null, name: "" });

  const reload = useCallback(async () => {
    setError("");
    const [cat, prodData] = await Promise.all([
      backofficeApi.catalogoCategoriasProducto(),
      backofficeApi.listProductos({ page: 1, pageSize: 3000, activos: true }),
    ]);
    const list = Array.isArray(cat) ? cat : cat?.items || [];
    setCategories(list);
    const items = Array.isArray(prodData?.items) ? prodData.items : [];
    const map = {};
    items.forEach((p) => {
      const cid = p.categoriaProductoId ?? p.CategoriaProductoId;
      if (cid == null) return;
      const k = String(cid);
      map[k] = (map[k] || 0) + 1;
    });
    setCountsByCatId(map);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await reload();
      } catch (e) {
        if (mounted) setError(e.message || "No se pudo cargar categorías.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [reload]);

  const rows = useMemo(() => {
    return categories.map((c, idx) => {
      const id = c.id ?? c.Id;
      const count = countsByCatId[String(id)] ?? 0;
      const reqCocina = categoriaRequiereCocina(c);
      const reqBar = categoriaRequiereBar(c);
      const activo = (c.activo ?? c.Activo) !== false;
      const created = c.fechaCreacion ?? c.FechaCreacion ?? c.createdAt ?? c.CreatedAt ?? null;
      return { c, idx, id, count, reqCocina, reqBar, activo, created };
    });
  }, [categories, countsByCatId]);

  const openCreate = () => {
    setCategoryForm({ id: null, nombre: "", descripcion: "", iconoNombre: "", requiereCocina: true, requiereBar: false, activo: true });
    setModalOpen(true);
  };

  const openEdit = async (id) => {
    setSaving(true);
    setError("");
    try {
      const c = await backofficeApi.getCategoriaProducto(id);
      setCategoryForm({
        id: c.id ?? c.Id,
        nombre: c.nombre || c.Nombre || "",
        descripcion: c.descripcion || c.Descripcion || "",
        iconoNombre: c.iconoNombre || c.IconoNombre || "",
        requiereCocina: categoriaRequiereCocina(c),
        requiereBar: categoriaRequiereBar(c),
        activo: (c.activo ?? c.Activo) !== false,
      });
      setModalOpen(true);
    } catch (e) {
      snackbar.error(e.message || "No se pudo cargar la categoría.");
    } finally {
      setSaving(false);
    }
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        nombre: categoryForm.nombre,
        descripcion: categoryForm.descripcion || null,
        iconoNombre: categoryForm.iconoNombre || null,
        requiereCocina: Boolean(categoryForm.requiereCocina),
        requiereBar: Boolean(categoryForm.requiereBar),
        activo: Boolean(categoryForm.activo),
      };
      if (categoryForm.id) await backofficeApi.updateCategoriaProducto(categoryForm.id, body);
      else await backofficeApi.createCategoriaProducto(body);
      await reload();
      onCategoriesMutated?.();
      setModalOpen(false);
      snackbar.success("Categoría guardada.");
    } catch (e2) {
      snackbar.error(e2.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const deactivateCategory = async (id) => {
    setSaving(true);
    setError("");
    try {
      const c = await backofficeApi.getCategoriaProducto(id);
      await backofficeApi.updateCategoriaProducto(id, {
        nombre: c.nombre || c.Nombre || "",
        descripcion: c.descripcion || c.Descripcion || null,
        iconoNombre: c.iconoNombre || c.IconoNombre || null,
        requiereCocina: categoriaRequiereCocina(c),
        requiereBar: categoriaRequiereBar(c),
        activo: false,
      });
      await reload();
      onCategoriesMutated?.();
      snackbar.success("Categoría desactivada.");
    } catch (e) {
      snackbar.error(e.message || "No se pudo desactivar.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id) => {
    setSaving(true);
    setError("");
    try {
      await backofficeApi.deleteCategoriaProducto(id);
      await reload();
      onCategoriesMutated?.();
      snackbar.success("Categoría desactivada (eliminar).");
    } catch (e) {
      snackbar.error(e.message || "No se pudo eliminar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <BackofficeListSkeletonLoading rows={8} />;

  return (
    <div className="space-y-4">
      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Categorías de producto</h2>
            <p className="text-xs text-slate-500">Gestiona categorías e impresiones de comanda (Cocina, Bar o Solo Cobro).</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {typeof onBackToProducts === "function" && (
              <button
                type="button"
                onClick={onBackToProducts}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al catálogo
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenProducts?.("")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Ver todos los productos
            </button>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white hover:bg-primary-700"
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva categoría
            </button>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Destino Comanda</th>
                <th className="px-4 py-3">Productos</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Fecha creación</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No hay categorías. Crea una con «Nueva categoría».
                  </td>
                </tr>
              )}
              {rows.map(({ c, idx, id, count, reqCocina, reqBar, activo, created }) => (
                <tr key={id} className={activo ? "bg-white" : "bg-slate-50/80"}>
                  <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOpenProducts?.(String(id))}
                      className="text-left font-semibold text-primary-700 hover:underline"
                    >
                      {c.nombre || `Categoría ${id}`}
                    </button>
                    {c.descripcion && <p className="text-xs text-slate-400 line-clamp-1">{c.descripcion}</p>}
                  </td>
                  <td className="px-4 py-3">
                    {reqCocina ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200/60">
                        🍳 Cocina
                      </span>
                    ) : reqBar ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-800 border border-blue-200/60">
                        🍹 Bar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
                        🚫 Solo Cobro (Sin Comanda)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onOpenProducts?.(String(id))}
                      className="text-primary-700 hover:underline font-medium"
                    >
                      {count} producto{count === 1 ? "" : "s"}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    {activo ? (
                      <span className="inline-flex rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">
                        Activa
                      </span>
                    ) : (
                      <span className="inline-flex rounded-md bg-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700">
                        Inactiva
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatCatDate(created)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        title="Editar"
                        aria-label="Editar categoría"
                        onClick={() => openEdit(id)}
                        disabled={saving}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      {activo && (
                        <button
                          type="button"
                          title="Desactivar"
                          aria-label="Desactivar categoría"
                          onClick={() => setConfirmAction({ open: true, type: "deactivate", id, name: c.nombre || "" })}
                          disabled={saving}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-amber-200 text-amber-800 hover:bg-amber-50 disabled:opacity-50"
                        >
                          <PowerOff className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        type="button"
                        title="Eliminar (desactivar en servidor)"
                        aria-label="Eliminar categoría"
                        onClick={() => setConfirmAction({ open: true, type: "delete", id, name: c.nombre || "" })}
                        disabled={saving}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {modalOpen && (
        <BackofficeDialog maxWidthClass="max-w-lg" onBackdropClick={saving ? undefined : () => setModalOpen(false)}>
          <form onSubmit={saveCategory} className="w-full min-w-0">
            <h3 className="text-lg font-semibold text-slate-800">{categoryForm.id ? "Editar categoría" : "Nueva categoría"}</h3>
            <div className="mt-4 grid grid-cols-1 gap-3">
              <label className="text-xs font-semibold text-slate-600">
                Nombre
                <input
                  value={categoryForm.nombre}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, nombre: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Descripción
                <input
                  value={categoryForm.descripcion}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, descripcion: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Icono (opcional)
                <input
                  value={categoryForm.iconoNombre}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, iconoNombre: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  placeholder="Ej. glass-water"
                />
              </label>

              {/* Selector de Destino de Comanda */}
              <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Destino de Comanda / Impresión</span>
                
                <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                  <input
                    type="radio"
                    name="destinoImpresion"
                    checked={categoryForm.requiereCocina && !categoryForm.requiereBar}
                    onChange={() => setCategoryForm((f) => ({ ...f, requiereCocina: true, requiereBar: false }))}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">🍳 Cocina (Platillos, Alimentos)</p>
                    <p className="text-[11px] text-slate-500">Se imprime en la comanda de Cocina / KDS</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                  <input
                    type="radio"
                    name="destinoImpresion"
                    checked={!categoryForm.requiereCocina && categoryForm.requiereBar}
                    onChange={() => setCategoryForm((f) => ({ ...f, requiereCocina: false, requiereBar: true }))}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">🍹 Bar (Bebidas, Licores, Tragos)</p>
                    <p className="text-[11px] text-slate-500">Se imprime en la comanda de la Barra</p>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300">
                  <input
                    type="radio"
                    name="destinoImpresion"
                    checked={!categoryForm.requiereCocina && !categoryForm.requiereBar}
                    onChange={() => setCategoryForm((f) => ({ ...f, requiereCocina: false, requiereBar: false }))}
                    className="mt-1"
                  />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">🚫 Ninguno (Solo Cobro / Sin Comanda)</p>
                    <p className="text-[11px] text-slate-500">Para Envíos, Propinas y Servicios. No genera comanda impresa.</p>
                  </div>
                </label>
              </div>

              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={categoryForm.activo}
                  onChange={(e) => setCategoryForm((f) => ({ ...f, activo: e.target.checked }))}
                />
                Activa
              </label>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 sm:w-auto"
              >
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="w-full rounded-lg bg-primary-600 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50 sm:w-auto">
                {saving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </BackofficeDialog>
      )}

      <ConfirmModal
        open={confirmAction.open}
        onClose={() => setConfirmAction({ open: false, type: "", id: null, name: "" })}
        onConfirm={async () => {
          if (confirmAction.type === "deactivate" && confirmAction.id) await deactivateCategory(confirmAction.id);
          if (confirmAction.type === "delete" && confirmAction.id) await deleteCategory(confirmAction.id);
        }}
        title={confirmAction.type === "delete" ? "Eliminar categoría" : "Desactivar categoría"}
        message={
          confirmAction.type === "delete"
            ? `¿Desactivar la categoría "${confirmAction.name}"? Si tiene productos activos, el servidor puede rechazar la operación.`
            : `¿Desactivar la categoría "${confirmAction.name}"? Podrás reactivarla editándola y marcando Activa.`
        }
        confirmLabel={confirmAction.type === "delete" ? "Eliminar" : "Desactivar"}
        variant="danger"
        loading={saving}
      />
    </div>
  );
}
