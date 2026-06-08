import { Boxes, Eye } from "lucide-react";
import { formatCurrency } from "../../utils/currency.js";
import { formatDateTime } from "../../utils/reportDates.js";
import { reporteFilaMontoCategoria, reporteFilaNombreCategoria } from "../../utils/reportUtils.js";
import { tableHorizontalScrollClass } from "../../utils/modalResponsiveClasses.js";
import {
  cierreFechaRaw,
  cierreHistorialDiferencia,
  cierreHistorialMontoInicial,
  cierreHistorialMontoEsperado,
  cierreHistorialMontoReal,
  cierreHistorialTotalVentas,
  cierreId,
} from "../../utils/caja.js";

function EmptyRow({ colSpan, loading, hint }) {
  return (
    <tr>
      <td colSpan={colSpan} className="py-8 text-center text-sm text-slate-500">
        {loading ? "Cargando…" : "Sin resultados."}
        {!loading && hint ? <p className="mt-2 max-w-md text-xs text-slate-400">{hint}</p> : null}
      </td>
    </tr>
  );
}

export function ReportTables({
  activeReport,
  loading,
  reportData,
  ventasRows,
  productosTopRows,
  meserosRows,
  categoriasRows,
  movimientosRows,
  onOpenVentaDetail,
  onOpenCategoriaProductos,
  currencySymbol = "C$",
}) {
  if (loading) {
    return <p className="py-10 text-center text-sm text-slate-500">Cargando reporte…</p>;
  }

  if (activeReport === "ventas") {
    return (
      <div className={tableHorizontalScrollClass}>
        <table className="min-w-full text-sm">
          <thead className="bg-transparent text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Fecha</th>
              <th className="px-4 py-3 font-medium">Documento</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Método</th>
              <th className="px-4 py-3 font-medium">Moneda</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {ventasRows.length ? (
              ventasRows.map((x, idx) => {
                const estadoStr = String(x.estado ?? x.Estado ?? "—");
                const isPagado = estadoStr.toLowerCase() === "pagado";
                return (
                  <tr key={`${x.id ?? x.Id ?? idx}-${idx}`} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4 text-slate-600">
                      {formatDateTime(x.fecha ?? x.Fecha ?? x.fechaVenta ?? x.FechaVenta ?? x.fechaCierre ?? x.FechaCierre)}
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">{x.numero ?? x.Numero ?? "—"}</td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${isPagado ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                        {estadoStr}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{x.metodoPago ?? x.MetodoPago ?? "—"}</td>
                    <td className="px-4 py-4 text-slate-600">{x.moneda ?? x.Moneda ?? "—"}</td>
                    <td className="px-4 py-4 font-bold text-slate-900">
                      {formatCurrency(x.totalCobrado ?? x.TotalCobrado ?? x.total ?? x.Total ?? 0)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => onOpenVentaDetail(x.id ?? x.Id ?? x.ventaId ?? x.VentaId)}
                        className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
                        title="Ver detalle"
                        aria-label="Ver detalle de la venta"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <EmptyRow colSpan={7} />
            )}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeReport === "productos-top") {
    return (
      <div className={tableHorizontalScrollClass}>
        <table className="min-w-full text-sm">
          <thead className="bg-transparent text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Producto</th>
              <th className="px-4 py-3 font-medium">Cantidad</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {productosTopRows.length ? (
              productosTopRows.map((x, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-slate-900">{x.producto || x.nombre || "—"}</td>
                  <td className="px-4 py-4 text-slate-600">{x.cantidad ?? x.unidades ?? 0}</td>
                  <td className="px-4 py-4 font-bold text-slate-900">{formatCurrency(x.total ?? x.venta ?? 0)}</td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={3} />
            )}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeReport === "meseros") {
    return (
      <div className={tableHorizontalScrollClass}>
        <table className="min-w-full text-sm">
          <thead className="bg-transparent text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Mesero</th>
              <th className="px-4 py-3 font-medium">Ventas</th>
              <th className="px-4 py-3 font-medium">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {meserosRows.length ? (
              meserosRows.map((x, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-slate-900">{x.mesero || x.vendedor || x.usuario || "—"}</td>
                  <td className="px-4 py-4 text-slate-600">{x.cantidadOrdenes ?? x.CantidadOrdenes ?? x.cantidadVentas ?? x.ordenes ?? 0}</td>
                  <td className="px-4 py-4 font-bold text-slate-900">{formatCurrency(x.totalNeto ?? x.TotalNeto ?? x.total ?? x.monto ?? 0)}</td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={3} />
            )}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeReport === "categorias") {
    return (
      <div className={tableHorizontalScrollClass}>
        <table className="min-w-full text-sm">
          <thead className="bg-transparent text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Categoría</th>
              <th className="px-4 py-3 font-medium">Cantidad</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {categoriasRows.length ? (
              categoriasRows.map((x, idx) => (
                <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 font-semibold text-slate-900">{reporteFilaNombreCategoria(x)}</td>
                  <td className="px-4 py-4 text-slate-600">{x.cantidad ?? x.Cantidad ?? 0}</td>
                  <td className="px-4 py-4 font-bold text-slate-900">{formatCurrency(reporteFilaMontoCategoria(x))}</td>
                  <td className="px-4 py-4 text-right">
                    <button
                      type="button"
                      onClick={() => onOpenCategoriaProductos(x)}
                      className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
                      title="Ver productos"
                      aria-label="Ver productos de la categoría"
                    >
                      <Boxes className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <EmptyRow colSpan={4} />
            )}
          </tbody>
        </table>
      </div>
    );
  }

  if (activeReport === "caja") {
    const rows = reportData.cajaHistorial || [];
    return (
      <>
        <h4 className="mb-4 text-base font-bold uppercase tracking-tight text-slate-800">Historial de Caja</h4>
        <div className={tableHorizontalScrollClass}>
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-transparent text-left text-xs uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Cierre</th>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium text-right">Apertura</th>
                <th className="px-4 py-3 font-medium text-right">Ventas</th>
                <th className="px-4 py-3 font-medium text-right">Esperado</th>
                <th className="px-4 py-3 font-medium text-right">Contado</th>
                <th className="px-4 py-3 font-medium text-right">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length ? (
                rows.map((row, idx) => {
                  const diff = cierreHistorialDiferencia(row);
                  const real = cierreHistorialMontoReal(row);
                  const diffClass =
                    diff == null
                      ? "text-slate-500"
                      : diff < 0
                        ? "text-red-600"
                        : diff > 0
                          ? "text-emerald-600"
                          : "text-slate-700";
                  return (
                    <tr key={cierreId(row) ?? idx} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-4 font-bold text-slate-400">#{cierreId(row) ?? "—"}</td>
                      <td className="px-4 py-4 font-semibold text-slate-600">
                        {String(cierreFechaRaw(row) || "—").slice(0, 10)}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          {row.estado || row.Estado || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-slate-600">
                        {formatCurrency(cierreHistorialMontoInicial(row), currencySymbol)}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">
                        {formatCurrency(cierreHistorialTotalVentas(row), currencySymbol)}
                      </td>
                      <td className="px-4 py-4 text-right font-medium text-slate-600">
                        {formatCurrency(cierreHistorialMontoEsperado(row), currencySymbol)}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">
                        {real == null ? "—" : formatCurrency(real, currencySymbol)}
                      </td>
                      <td className={`px-4 py-4 text-right font-bold ${diffClass}`}>
                        {diff == null ? "—" : formatCurrency(diff, currencySymbol)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <EmptyRow colSpan={8} />
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return (
    <div className={tableHorizontalScrollClass}>
      <table className="min-w-full text-sm">
        <thead className="bg-transparent text-left text-xs uppercase tracking-wider text-slate-400">
          <tr>
            <th className="px-4 py-3 font-medium">Fecha</th>
            <th className="px-4 py-3 font-medium">Producto</th>
            <th className="px-4 py-3 font-medium">Tipo</th>
            <th className="px-4 py-3 font-medium">Cantidad</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {movimientosRows.length ? (
            movimientosRows.map((x, idx) => (
              <tr key={idx} className="group hover:bg-slate-50 transition-colors">
                <td className="px-4 py-4 text-slate-600">{formatDateTime(x.fecha)}</td>
                <td className="px-4 py-4 font-semibold text-slate-900">{x.productoNombre || "—"}</td>
                <td className="px-4 py-4 text-slate-600">{x.tipo || "—"}</td>
                <td className="px-4 py-4 font-bold text-slate-900">{x.cantidad ?? 0}</td>
              </tr>
            ))
          ) : (
            <EmptyRow colSpan={4} />
          )}
        </tbody>
      </table>
    </div>
  );
}
