import { useEffect } from "react";
import { ArrowLeft, Download } from "lucide-react";
import { BackofficePageShell } from "../components/Skeletons.jsx";
import { ReportCatalog } from "../components/reports/ReportCatalog.jsx";
import { ReportFilters } from "../components/reports/ReportFilters.jsx";
import { ReportTables } from "../components/reports/ReportTables.jsx";
import { OrderDetailModal } from "../components/reports/OrderDetailModal.jsx";
import { CategoriaProductosModal } from "../components/reports/CategoriaProductosModal.jsx";
import { useReports } from "../hooks/useReports.js";
import { useSnackbar } from "../../../contexts/SnackbarContext.jsx";
import { formatCurrency } from "../utils/currency.js";

export function ReportsView({ currencySymbol = "C$" }) {
  const snackbar = useSnackbar();
  const {
    activeReport,
    setActiveReport,
    loading,
    search,
    setSearch,
    filtroVentas,
    setFiltroVentas,
    topN,
    setTopN,
    peores,
    setPeores,
    orden,
    setOrden,
    dateFilters,
    setDateFilters,
    reportData,
    ventasResumenVista,
    loadReportData,
    exportReport,
    exportCategoriaDesglose,
    resetFilters,
    ventasRows,
    productosTopRows,
    meserosRows,
    categoriasRows,
    movimientosRows,
    ventaDetailOpen,
    setVentaDetailOpen,
    ventaDetailLoading,
    ventaDetailData,
    onOpenVentaDetail,
    categoriaProductosOpen,
    setCategoriaProductosOpen,
    categoriaProductosLoading,
    categoriaSeleccionada,
    categoriaProductos,
    onOpenCategoriaProductos,
  } = useReports(snackbar.success, snackbar.error);

  useEffect(() => {
    if (activeReport) loadReportData();
  }, [activeReport, loadReportData]);

  return (
    <BackofficePageShell maxWidth="7xl" className="space-y-4">
      {!activeReport ? (
        <ReportCatalog setActiveReport={setActiveReport} />
      ) : (
        <>
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  className="mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-slate-800 transition"
                >
                  &larr; Volver al catálogo de reportes
                </button>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  {activeReport === "ventas" && "Reporte General de Ventas"}
                  {activeReport === "productos-top" && "Análisis Completo de Ventas por Producto"}
                  {activeReport === "meseros" && "Reporte de Ventas por Mesero"}
                  {activeReport === "categorias" && "Reporte de Ventas por Categoría"}
                  {activeReport === "caja" && "Historial de Cierres de Caja"}
                  {activeReport === "movimientos" && "Movimientos de Inventario"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={loadReportData}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
                >
                  {loading ? "Cargando..." : "Actualizar"}
                </button>
                <button
                  type="button"
                  onClick={exportReport}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition shadow-sm"
                >
                  <Download className="h-4 w-4" /> Exportar Excel
                </button>
              </div>
            </div>

            {activeReport === "ventas" && ventasResumenVista && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Ventas Totales</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {formatCurrency(ventasResumenVista.totalVentas ?? 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Órdenes Realizadas</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {ventasResumenVista.totalOrdenes ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-slate-500">Ticket Promedio</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {formatCurrency(ventasResumenVista.promedioTicket ?? 0)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <ReportFilters
            activeReport={activeReport}
            dateFilters={dateFilters}
            setDateFilters={setDateFilters}
            search={search}
            setSearch={setSearch}
            filtroVentas={filtroVentas}
            setFiltroVentas={setFiltroVentas}
            topN={topN}
            setTopN={setTopN}
            peores={peores}
            setPeores={setPeores}
            orden={orden}
            setOrden={setOrden}
            loading={loading}
            resetFilters={resetFilters}
          />

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <ReportTables
              activeReport={activeReport}
              loading={loading}
              reportData={reportData}
              ventasRows={ventasRows}
              productosTopRows={productosTopRows}
              meserosRows={meserosRows}
              categoriasRows={categoriasRows}
              movimientosRows={movimientosRows}
              onOpenVentaDetail={onOpenVentaDetail}
              onOpenCategoriaProductos={onOpenCategoriaProductos}
              currencySymbol={currencySymbol}
            />
          </div>
        </>
      )}

      <OrderDetailModal
        open={ventaDetailOpen}
        onClose={() => setVentaDetailOpen(false)}
        loading={ventaDetailLoading}
        data={ventaDetailData}
      />
      <CategoriaProductosModal
        open={categoriaProductosOpen}
        onClose={() => setCategoriaProductosOpen(false)}
        loading={categoriaProductosLoading}
        categoria={categoriaSeleccionada}
        productos={categoriaProductos}
      />
    </BackofficePageShell>
  );
}
