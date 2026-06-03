import { useState } from "react";
import { Check, ChefHat, ClipboardList, Coins, ImageIcon, Package, Pencil, Plus, Sparkles, Trash2, Upload, X } from "lucide-react";
import { BackofficeDialog } from "../BackofficeDialog.jsx";
import { useObjectUrlForFile } from "../../hooks/useObjectUrlForFile.js";
import { getProductImageUrl } from "../../utils/productImage.js";
import { modalFormBodyScrollPlainClass, modalFormFooterClass, modalFormRootClass } from "../../utils/modalResponsiveClasses.js";

function categoriaRequiereCocina(c) {
  const v = c?.requiereCocina ?? c?.RequiereCocina;
  return v !== false;
}

/* ── Minimal Field ───────────────────────────────────────────────── */
function Field({ label, hint, children }) {
  return (
    <div className="group min-w-0">
      <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400 transition-colors group-focus-within:text-indigo-500">
        {label}
      </p>
      <div className="border-b border-slate-200 pb-1.5 transition-colors group-focus-within:border-indigo-400">
        {children}
      </div>
      {hint && <p className="mt-1 text-[10px] text-slate-400">{hint}</p>}
    </div>
  );
}

/* ── Minimal Checkbox ────────────────────────────────────────────── */
function SimpleCheck({ label, note, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-3.5 w-3.5 shrink-0 cursor-pointer rounded accent-indigo-600"
      />
      <span>
        <span className="text-sm text-slate-700">{label}</span>
        {note && <span className="ml-1 text-xs text-slate-400">— {note}</span>}
      </span>
    </label>
  );
}

/* ── Tab definitions ─────────────────────────────────────────────── */
const TABS = [
  { id: "general",  label: "General",        icon: ClipboardList },
  { id: "precios",  label: "Precios & Stock", icon: Coins },
  { id: "extras",   label: "Extras",          icon: Sparkles },
];

/* ── Main Modal ──────────────────────────────────────────────────── */
export function ProductFormModal({
  saving,
  form,
  setForm,
  onSubmit,
  onRequestClose,
  categories,
  providers,
  imageUploadFile,
  setImageUploadFile,
  currencySymbol = "C$",
}) {
  const [activeTab, setActiveTab] = useState("general");
  const imageFilePreviewUrl = useObjectUrlForFile(imageUploadFile);
  const existingImageUrl = getProductImageUrl(form);
  const imagePreviewSrc = imageFilePreviewUrl || existingImageUrl;

  return (
    <BackofficeDialog
      maxWidthClass="max-w-lg"
      panelClassName="sm:mx-auto"
      onBackdropClick={saving ? undefined : onRequestClose}
    >
      <form onSubmit={onSubmit} className={modalFormRootClass}>

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="mb-5 flex shrink-0 items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {form.id ? "Editar producto" : "Nuevo producto"}
            </h3>
            <p className="text-xs text-slate-400">
              {form.id ? "Modifica los datos del producto" : "Completa la información básica"}
            </p>
          </div>
          <button
            type="button"
            onClick={onRequestClose}
            disabled={saving}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Tabs (underline style) ───────────────────────────── */}
        <div className="mb-5 flex shrink-0 border-b border-slate-200">
          {TABS.map(({ id, label, icon }) => {
            const IconComp = icon;
            return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 border-b-2 px-3 pb-2.5 text-xs font-semibold transition-all -mb-px ${
                activeTab === id
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <IconComp className="h-3.5 w-3.5 shrink-0" />
              {label}
            </button>
            );
          })}
        </div>

        {/* ── Scrollable body ──────────────────────────────────── */}
        <div
          className={`${modalFormBodyScrollPlainClass} space-y-4`}
          style={{ maxHeight: "min(48dvh, 380px)" }}
        >

          {/* ══ GENERAL ══════════════════════════════════════════ */}
          {activeTab === "general" && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Código" hint={!form.id ? "Vacío = auto-generado" : undefined}>
                  <input
                    value={form.codigo}
                    onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                    placeholder={form.id ? form.codigo || "—" : "Ej. PRD-001"}
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:text-slate-400"
                    disabled={Boolean(form.id)}
                    autoComplete="off"
                  />
                </Field>

                <Field label="Nombre *">
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    placeholder="Nombre del producto"
                    className="w-full bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    required
                    autoComplete="off"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Categoría *">
                  <select
                    value={form.categoriaProductoId}
                    onChange={(e) => setForm((f) => ({ ...f, categoriaProductoId: e.target.value }))}
                    className="w-full bg-transparent text-sm text-slate-800 focus:outline-none"
                    required
                  >
                    <option value="">Seleccionar…</option>
                    {categories.map((c) => {
                      const label = c.nombre || c.descripcion || `Cat. ${c.id}`;
                      return (
                        <option key={c.id} value={c.id}>
                          {label}{categoriaRequiereCocina(c) ? "" : " (solo barra)"}
                        </option>
                      );
                    })}
                  </select>
                </Field>

                <Field label="Proveedor">
                  <select
                    value={form.proveedorId}
                    onChange={(e) => setForm((f) => ({ ...f, proveedorId: e.target.value }))}
                    className="w-full bg-transparent text-sm text-slate-800 focus:outline-none"
                  >
                    <option value="">Sin proveedor</option>
                    {providers.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre || p.descripcion || `Proveedor ${p.id}`}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              {/* Checkboxes simples */}
              <div className="flex flex-wrap gap-x-6 gap-y-2.5 pt-1">
                <SimpleCheck
                  label="Activo"
                  note="visible en el POS"
                  checked={form.activo}
                  onChange={(val) => setForm((f) => ({ ...f, activo: val }))}
                />
                <SimpleCheck
                  label="Es preparado"
                  note="pasa a cocina"
                  checked={form.esPreparado}
                  onChange={(val) => setForm((f) => ({ ...f, esPreparado: val }))}
                />
              </div>
            </>
          )}

          {/* ══ PRECIOS & STOCK ══════════════════════════════════ */}
          {activeTab === "precios" && (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label={`Precio de venta * (${currencySymbol})`}>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={form.precioVenta}
                    onChange={(e) => setForm((f) => ({ ...f, precioVenta: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-transparent text-sm tabular-nums text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    required
                  />
                </Field>

                <Field label={`Precio de compra (${currencySymbol})`}>
                  <input
                    type="number"
                    step="0.01"
                    inputMode="decimal"
                    value={form.precioCompra}
                    onChange={(e) => setForm((f) => ({ ...f, precioCompra: e.target.value }))}
                    placeholder="0.00"
                    className="w-full bg-transparent text-sm tabular-nums text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  />
                </Field>
              </div>

              <div className="pt-1">
                <SimpleCheck
                  label="Controlar stock"
                  note="activa alertas y movimientos de inventario"
                  checked={form.controlarStock}
                  onChange={(val) => setForm((f) => ({ ...f, controlarStock: val }))}
                />
              </div>

              {form.controlarStock && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field
                    label="Stock actual"
                    hint={form.id ? "Ajusta desde Entrada / Salida / Ajuste" : undefined}
                  >
                    <input
                      type="number"
                      inputMode="numeric"
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                      placeholder="0"
                      className="w-full bg-transparent text-sm tabular-nums text-slate-800 placeholder:text-slate-400 focus:outline-none disabled:text-slate-400"
                      disabled={Boolean(form.id)}
                    />
                  </Field>
                  <Field label="Stock mínimo (alerta)">
                    <input
                      type="number"
                      inputMode="numeric"
                      value={form.stockMinimo}
                      onChange={(e) => setForm((f) => ({ ...f, stockMinimo: e.target.value }))}
                      placeholder="0"
                      className="w-full bg-transparent text-sm tabular-nums text-slate-800 placeholder:text-slate-400 focus:outline-none"
                    />
                  </Field>
                </div>
              )}
            </>
          )}

          {/* ══ EXTRAS ═══════════════════════════════════════════ */}
          {activeTab === "extras" && (
            <>
              <Field label="Descripción">
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Notas, ingredientes u observaciones…"
                  className="w-full resize-none bg-transparent text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                  rows={2}
                />
              </Field>

              {/* Opciones especiales */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                      Opciones especiales
                    </p>
                    <p className="text-xs text-slate-400">Ej. salsas, puntos de cocción, tamaños</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={form.opcionesEspecialesOn}
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        opcionesEspecialesOn: !f.opcionesEspecialesOn,
                        opcionesEspecialesLines:
                          !f.opcionesEspecialesOn && (!f.opcionesEspecialesLines?.length)
                            ? [""]
                            : f.opcionesEspecialesLines,
                      }))
                    }
                    className={`inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-all duration-200 focus:outline-none ${
                      form.opcionesEspecialesOn ? "justify-end bg-indigo-500" : "justify-start bg-slate-200"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full bg-white shadow" />
                  </button>
                </div>

                {form.opcionesEspecialesOn && (
                  <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
                    {form.opcionesEspecialesLines.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-14 shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Op. {idx + 1}
                        </span>
                        <input
                          value={line}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...f.opcionesEspecialesLines];
                              next[idx] = e.target.value;
                              return { ...f, opcionesEspecialesLines: next };
                            })
                          }
                          placeholder="Ej. Barbacoa"
                          className="flex-1 border-b border-slate-200 bg-transparent pb-1 text-sm text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none transition-colors"
                          autoComplete="off"
                        />
                        <button
                          type="button"
                          disabled={form.opcionesEspecialesLines.length <= 1}
                          onClick={() =>
                            setForm((f) => {
                              const next = f.opcionesEspecialesLines.filter((_, j) => j !== idx);
                              return { ...f, opcionesEspecialesLines: next.length ? next : [""] };
                            })
                          }
                          className="text-slate-300 transition hover:text-rose-400 disabled:cursor-not-allowed disabled:opacity-30"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, opcionesEspecialesLines: [...f.opcionesEspecialesLines, ""] }))}
                      className="mt-1 flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Agregar opción
                    </button>
                  </div>
                )}
              </div>

              {/* Foto */}
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Foto del producto
                </p>
                {imagePreviewSrc ? (
                  <div className="relative mb-2 overflow-hidden rounded-xl bg-slate-50" style={{ height: "8rem" }}>
                    <img
                      src={imagePreviewSrc}
                      alt={form.nombre || "Vista previa"}
                      className="h-full w-full object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUploadFile(null)}
                      className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 text-slate-500 shadow transition hover:text-rose-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-20 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 transition hover:border-indigo-300 hover:bg-indigo-50/20">
                    <Upload className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-400">Seleccionar imagen — JPG, PNG, WEBP · máx. 5MB</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      multiple={false}
                      onChange={(e) => setImageUploadFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
                <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {imagePreviewSrc ? "Reemplazar imagen" : "Elegir imagen"}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/jpeg,image/png,image/webp"
                    multiple={false}
                    onChange={(e) => setImageUploadFile(e.target.files?.[0] || null)}
                  />
                </label>
                {imageUploadFile && (
                  <p className="mt-0.5 text-[10px] text-slate-400">{imageUploadFile.name}</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className={`${modalFormFooterClass} gap-2 pt-4`}>
          {/* Progress dots */}
          <div className="flex flex-1 items-center gap-1">
            {TABS.map((tab) => (
              <div
                key={tab.id}
                className={`h-1 rounded-full transition-all duration-300 ${
                  activeTab === tab.id ? "w-4 bg-indigo-400" : "w-1 bg-slate-200"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={onRequestClose}
            disabled={saving}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-slate-200 px-5 text-sm text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:min-h-0 sm:w-auto sm:py-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 sm:min-h-0 sm:w-auto sm:py-2"
          >
            {saving ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Guardando…
              </>
            ) : (
              "Guardar"
            )}
          </button>
        </div>
      </form>
    </BackofficeDialog>
  );
}
