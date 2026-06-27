import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { BackofficePageShell } from "../components/index.js";
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
                  <ArrowLeft className="h-4 w-4" />
                  Volver
                </button>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 capitalize">
                  {activeReport.replace("-", " ")}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportReport}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 disabled:opacity-70 transition"
                >
                  {activeReport === "categorias" ? "Resumen Excel" : "Exportar Excel"}
                </button>
                {activeReport === "categorias" && typeof exportCategoriaDesglose === "function" && (
                  <button
                    type="button"
                    onClick={exportCategoriaDesglose}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-200 transition"
                  >
                    Desglose
                  </button>
                )}
              </div>
            </div>

            {activeReport === "ventas" && ventasResumenVista && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-md">
                  <p className="text-sm font-medium text-slate-500">Total Ventas</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {formatCurrency(ventasResumenVista.totalVentas ?? 0)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-md">
                  <p className="text-sm font-medium text-slate-500">Órdenes</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                    {ventasResumenVista.totalOrdenes ?? 0}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/40 bg-white/60 p-5 shadow-sm backdrop-blur-md">
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
