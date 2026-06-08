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
      <p className="mb-1.5 text-xs font-semibold text-slate-600">
        {label}
      </p>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
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
        className="h-4 w-4 shrink-0 cursor-pointer rounded accent-slate-600"
      />
      <span className="text-sm text-slate-700">{label}</span>
      {note && <span className="ml-1 text-xs text-slate-400">({note})</span>}
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
        <div className="mb-4 flex shrink-0 items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-base font-semibold text-slate-800">
              {form.id ? "Editar producto" : "Nuevo producto"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onRequestClose}
            disabled={saving}
            className="flex h-7 w-7 items-center justify-center rounded border border-slate-300 bg-white text-slate-500 hover:bg-slate-50 disabled:opacity-40"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>


        {/* ── Scrollable body ──────────────────────────────────── */}
        <div
          className={`${modalFormBodyScrollPlainClass} space-y-4`}
          style={{ maxHeight: "min(48dvh, 380px)" }}
        >

          {/* ══ SECCIONES ══════════════════════════════════════════ */}
          <>
            {/* Información Básica */}
            <div className="mb-4 rounded border border-slate-300 bg-white p-3">
              <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Información Básica</h4>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Código" hint={!form.id ? "Vacío = auto-generado" : undefined}>
                  <input
                    value={form.codigo}
                    onChange={(e) => setForm((f) => ({ ...f, codigo: e.target.value }))}
                    placeholder={form.id ? form.codigo || "—" : "Ej. PRD-001"}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                    disabled={Boolean(form.id)}
                    autoComplete="off"
                  />
                </Field>

                <Field label="Nombre *">
                  <input
                    value={form.nombre}
                    onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
                    placeholder="Nombre del producto"
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
                    required
                    autoComplete="off"
                  />
                </Field>

                <Field label="Categoría *">
                  <select
                    value={form.categoriaProductoId}
                    onChange={(e) => setForm((f) => ({ ...f, categoriaProductoId: e.target.value }))}
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
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
                    className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
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

              <div className="mt-3 flex gap-4">
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
            </div>

            {/* Precios */}
            {(() => {
              // Si hay opciones especiales con precio, el precio base no aplica
              const usaPreciosPorOpcion =
                form.opcionesEspecialesOn &&
                (form.opcionesEspecialesPrices ?? []).some((p) => Number(p) > 0);
              return (
                <div className="mb-4 rounded border border-slate-300 bg-white p-3">
                  <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Precios</h4>
                  {usaPreciosPorOpcion && (
                    <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                      <span className="mt-0.5 shrink-0 text-amber-500">ⓘ</span>
                      <p className="text-xs text-amber-700">
                        El precio de venta lo define cada opción especial. El precio base se establece en <strong>C$ 0</strong> automáticamente.
                      </p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label={`Precio de venta * (${currencySymbol})`}>
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        onWheel={(e) => e.target.blur()}
                        value={usaPreciosPorOpcion ? "0" : form.precioVenta}
                        onChange={(e) => {
                          if (!usaPreciosPorOpcion) setForm((f) => ({ ...f, precioVenta: e.target.value }));
                        }}
                        placeholder="0.00"
                        disabled={usaPreciosPorOpcion}
                        className={`w-full rounded border px-3 py-2 text-sm focus:outline-none ${
                          usaPreciosPorOpcion
                            ? "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
                            : "border-slate-300 text-slate-700 focus:border-slate-500"
                        }`}
                        required={!usaPreciosPorOpcion}
                      />
                      {usaPreciosPorOpcion && (
                        <p className="mt-1 text-[10px] text-slate-400">Definido por opciones especiales</p>
                      )}
                    </Field>

                    <Field label={`Precio de compra (${currencySymbol})`}>
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        onWheel={(e) => e.target.blur()}
                        value={form.precioCompra}
                        onChange={(e) => setForm((f) => ({ ...f, precioCompra: e.target.value }))}
                        placeholder="0.00"
                        className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
                      />
                    </Field>
                  </div>
                </div>
              );
            })()}

            {/* Inventario */}
            <div className="mb-4 rounded border border-slate-300 bg-white p-3">
              <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Inventario</h4>
              <div className="mb-3">
                <SimpleCheck
                  label="Controlar stock"
                  note="activa alertas y movimientos"
                  checked={form.controlarStock}
                  onChange={(val) => setForm((f) => ({ ...f, controlarStock: val }))}
                />
              </div>
              {form.controlarStock && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field
                    label="Stock actual"
                    hint={form.id ? "Ajusta desde Entrada / Salida / Ajuste" : undefined}
                  >
                    <input
                      type="number"
                      inputMode="numeric"
                      onWheel={(e) => e.target.blur()}
                      value={form.stock}
                      onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                      placeholder="0"
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400"
                      disabled={Boolean(form.id)}
                    />
                  </Field>
                  <Field label="Stock mínimo (alerta)">
                    <input
                      type="number"
                      inputMode="numeric"
                      onWheel={(e) => e.target.blur()}
                      value={form.stockMinimo}
                      onChange={(e) => setForm((f) => ({ ...f, stockMinimo: e.target.value }))}
                      placeholder="0"
                      className="w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
                    />
                  </Field>
                </div>
              )}
            </div>

            {/* Extras */}
            <div className="mb-4 rounded border border-slate-300 bg-white p-3">
              <h4 className="mb-3 text-xs font-semibold uppercase text-slate-500">Extras</h4>
              
              <div className="mb-4">
                <Field label="Descripción">
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Notas, ingredientes u observaciones…"
                    className="w-full resize-none rounded border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
                    rows={2}
                  />
                </Field>
              </div>

              {/* Opciones especiales */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="text-xs font-semibold text-slate-600">Opciones especiales</span>
                    <p className="text-[10px] text-slate-400 mt-0.5">Cada opción tiene su precio final de venta</p>
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
                        opcionesEspecialesPrices:
                          !f.opcionesEspecialesOn && (!f.opcionesEspecialesPrices?.length)
                            ? [""]
                            : f.opcionesEspecialesPrices,
                      }))
                    }
                    className={`inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full px-0.5 transition-all focus:outline-none ${
                      form.opcionesEspecialesOn ? "justify-end bg-slate-600" : "justify-start bg-slate-300"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full bg-white shadow" />
                  </button>
                </div>

                {form.opcionesEspecialesOn && (
                  <div className="mt-3 space-y-2">
                    {/* Encabezados de columnas */}
                    <div className="flex items-center gap-2 px-1">
                      <span className="w-12 shrink-0" />
                      <span className="flex-1 text-[10px] font-semibold text-slate-400 uppercase">Nombre variante</span>
                      <span className="w-24 shrink-0 text-[10px] font-semibold text-slate-400 uppercase text-right">Precio ({currencySymbol})</span>
                      <span className="w-6 shrink-0" />
                    </div>

                    {form.opcionesEspecialesLines.map((line, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-12 shrink-0 text-xs text-slate-500">Op. {idx + 1}</span>
                        {/* Nombre */}
                        <input
                          value={line}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...f.opcionesEspecialesLines];
                              next[idx] = e.target.value;
                              return { ...f, opcionesEspecialesLines: next };
                            })
                          }
                          placeholder="Ej. Doble Carne"
                          className="flex-1 rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-700 focus:border-slate-500 focus:outline-none"
                          autoComplete="off"
                        />
                        {/* Precio final */}
                        <input
                          type="number"
                          step="0.01"
                          inputMode="decimal"
                          onWheel={(e) => e.target.blur()}
                          value={(form.opcionesEspecialesPrices ?? [])[idx] ?? ""}
                          onChange={(e) =>
                            setForm((f) => {
                              const next = [...(f.opcionesEspecialesPrices ?? f.opcionesEspecialesLines.map(() => ""))];
                              next[idx] = e.target.value;
                              return { ...f, opcionesEspecialesPrices: next };
                            })
                          }
                          placeholder="0.00"
                          className="w-24 shrink-0 rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-700 focus:border-slate-500 focus:outline-none text-right"
                        />
                        {/* Eliminar */}
                        <button
                          type="button"
                          disabled={form.opcionesEspecialesLines.length <= 1}
                          onClick={() =>
                            setForm((f) => {
                              const nextLines = f.opcionesEspecialesLines.filter((_, j) => j !== idx);
                              const nextPrices = (f.opcionesEspecialesPrices ?? []).filter((_, j) => j !== idx);
                              return {
                                ...f,
                                opcionesEspecialesLines: nextLines.length ? nextLines : [""],
                                opcionesEspecialesPrices: nextPrices.length ? nextPrices : [""],
                              };
                            })
                          }
                          className="w-6 h-6 flex items-center justify-center rounded border border-slate-300 text-slate-400 hover:border-red-300 hover:text-red-500 disabled:opacity-30"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({
                        ...f,
                        opcionesEspecialesLines: [...f.opcionesEspecialesLines, ""],
                        opcionesEspecialesPrices: [...(f.opcionesEspecialesPrices ?? []), ""],
                      }))}
                      className="text-xs text-slate-600 hover:text-slate-800"
                    >
                      + Agregar opción
                    </button>
                  </div>
                )}
              </div>

              {/* Foto */}
              <div>
                <span className="text-xs font-semibold text-slate-600">Foto del producto</span>
                {imagePreviewSrc ? (
                  <div className="mt-2 relative overflow-hidden rounded border border-slate-300 bg-slate-50" style={{ height: "120px" }}>
                    <img
                      src={imagePreviewSrc}
                      alt={form.nombre || "Vista previa"}
                      className="h-full w-full object-contain p-2"
                    />
                    <button
                      type="button"
                      onClick={() => setImageUploadFile(null)}
                      className="absolute right-2 top-2 h-6 w-6 flex items-center justify-center rounded bg-white border border-slate-300 text-slate-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="mt-2 flex h-20 w-full cursor-pointer items-center justify-center gap-2 rounded border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100">
                    <Upload className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-500">Seleccionar imagen</span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/jpeg,image/png,image/webp"
                      multiple={false}
                      onChange={(e) => setImageUploadFile(e.target.files?.[0] || null)}
                    />
                  </label>
                )}
              </div>
            </div>
          </>
        </div>

        {/* ── Footer ─────────────────────────────────────────────── */}
        <div className={`${modalFormFooterClass} gap-2 pt-4`}>
          <button
            type="button"
            onClick={onRequestClose}
            disabled={saving}
            className="inline-flex min-h-[44px] w-full items-center justify-center rounded border border-slate-300 px-5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 sm:min-h-0 sm:w-auto sm:py-2"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded bg-slate-700 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50 sm:min-h-0 sm:w-auto sm:py-2"
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
