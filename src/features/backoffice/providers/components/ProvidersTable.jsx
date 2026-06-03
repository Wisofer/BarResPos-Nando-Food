import { Pencil, Trash2, Search } from "lucide-react";

function providerLabel(p) {
  return p.nombre || p.razonSocial || `Proveedor ${p.id}`;
}

function isActivo(p) {
  return (p.activo ?? p.Activo) !== false;
}

function estadoClass(activo) {
  return activo
    ? "bg-emerald-100 text-emerald-700"
    : "bg-slate-100 text-slate-600";
}

export function ProvidersTable({ providers, busy, onEdit, onRequestDelete }) {
  return (
    <section className="rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-lg shadow-slate-200/40">
      <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm">
        <table className="min-w-[920px] w-full text-sm">
          <thead className="bg-gradient-to-b from-slate-50 to-slate-100/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-5 py-4">Proveedor</th>
              <th className="px-5 py-4">Contacto</th>
              <th className="px-5 py-4">Teléfono</th>
              <th className="px-5 py-4">Email</th>
              <th className="px-5 py-4">Dirección</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/60">
            {providers.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center">
                  <Search className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium text-slate-500">Sin proveedores registrados todavía</p>
                  <p className="mt-1 text-xs text-slate-400">Registrá tu primer proveedor</p>
                </td>
              </tr>
            )}
            {providers.map((p) => {
              const activo = isActivo(p);
              const dir = p.direccion || p.Direccion || "";
              const label = providerLabel(p);
              return (
                <tr key={p.id} className={`group transition-all duration-200 hover:bg-slate-50/80 ${!activo ? "bg-slate-50/40" : ""}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
                        {label?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-900">{label}</p>
                        <p className="text-xs text-slate-400">ID {p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-700">{p.contacto || p.Contacto || "—"}</td>
                  <td className="px-5 py-4 text-slate-600">{p.telefono || p.Telefono || "—"}</td>
                  <td className="max-w-[200px] px-5 py-4 text-slate-700">
                    <span className="line-clamp-2 break-all">{p.email || p.Email || "—"}</span>
                  </td>
                  <td className="max-w-[220px] px-5 py-4 text-slate-600">
                    <span className="line-clamp-2 text-xs leading-relaxed">{dir || "—"}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${estadoClass(activo)}`}>
                      {activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(p.id)}
                        disabled={busy}
                        title="Editar proveedor"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-200 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-40"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRequestDelete(p.id, providerLabel(p))}
                        disabled={busy}
                        title="Desactivar proveedor"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600 transition-all duration-200 hover:bg-rose-200 hover:text-rose-700 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
