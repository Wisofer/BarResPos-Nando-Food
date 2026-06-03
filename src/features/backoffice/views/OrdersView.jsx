import { BackofficeListSkeletonLoading, BackofficePageShell, CancelPedidoPinModal } from "../components/index.js";
import { useOrdersManagement } from "../hooks/useOrdersManagement.js";
import { OrdersKpiGrid } from "../components/orders/OrdersKpiGrid.jsx";
import { OrdersListHeader } from "../components/orders/OrdersListHeader.jsx";
import { OrdersFilterPanel } from "../components/orders/OrdersFilterPanel.jsx";
import { OrdersListTable } from "../components/orders/OrdersListTable.jsx";
import { OrdersPaginationBar } from "../components/orders/OrdersPaginationBar.jsx";
import { OrderDetailPanel } from "../components/orders/OrderDetailPanel.jsx";

export function OrdersView({ currencySymbol = "C$" }) {
  const om = useOrdersManagement(currencySymbol);

  if (om.showDetail && om.detailOrder) {
    return (
      <BackofficePageShell maxWidth="7xl" className="space-y-4 pb-8">
        <OrderDetailPanel
          error={om.error}
          detailOrder={om.detailOrder}
          showEdit={om.showEdit}
          setShowEdit={om.setShowEdit}
          isAdmin={om.isAdmin}
          busyAction={om.busyAction}
          currencySymbol={currencySymbol}
          onBack={om.backFromDetail}
          onPrint={om.printDetail}
          onStartEdit={() => om.openEdit(om.detailOrder)}
          editForm={om.editForm}
          setEditForm={om.setEditForm}
          onSubmitEdit={om.saveEdit}
          onCancelPedido={() => {
            const d = om.detailOrder;
            if (!d?.id) return;
            om.cancelOrder({
              rowId: d.id,
              id: d.numero ?? d.codigo ?? String(d.id),
            });
          }}
        />
        {om.confirmCancel.open && (
          <CancelPedidoPinModal
            open
            onClose={() => om.setConfirmCancel({ open: false, order: null })}
            loading={om.busyAction}
            title="Cancelar pedido"
            message={
              om.confirmCancel.order
                ? `Pedido ${om.confirmCancel.order.id}. Ingresá el PIN de autorización.`
                : "Ingresá el PIN de autorización."
            }
            confirmLabel="Cancelar pedido"
            onConfirm={om.onCancelPedidoConfirm}
          />
        )}
      </BackofficePageShell>
    );
  }

  if (om.loading && !om.listHasLoadedOnce) {
    return <BackofficeListSkeletonLoading rows={6} maxWidth="7xl" />;
  }

  const listBusy = om.loading && om.listHasLoadedOnce;

  return (
    <BackofficePageShell
      maxWidth="7xl"
      className={`space-y-3 pb-8 transition-opacity ${listBusy ? "pointer-events-none opacity-60" : ""}`}
      aria-busy={listBusy || undefined}
    >
      {om.error && (
        <div
          className="rounded-2xl border border-red-100 bg-red-50/80 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {om.error}
        </div>
      )}

      {/* Card principal: título + KPIs + filtros */}
      <div className="space-y-5 overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <OrdersListHeader onExport={om.handleExport} exporting={om.exporting} />
        <OrdersKpiGrid cards={om.cards} currencySymbol={currencySymbol} />
        <div className="h-px bg-slate-100" aria-hidden />
        <OrdersFilterPanel
          filters={om.filters}
          setFilters={om.setFilters}
          searchTerm={om.searchTerm}
          setSearchTerm={om.setSearchTerm}
          applyQuickStatus={om.applyQuickStatus}
          applyTipoFilter={om.applyTipoFilter}
          showEmptyDrafts={om.showEmptyDrafts}
          setShowEmptyDrafts={om.setShowEmptyDrafts}
        />
      </div>

      {/* Card de la tabla */}
      <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <OrdersListTable
          rows={om.filteredOrders}
          isAdmin={om.isAdmin}
          busyAction={om.busyAction}
          onView={om.openDetail}
          onEdit={om.openEditFromRow}
          onCancel={om.cancelOrder}
        />
        <div className="border-t border-slate-100 px-5 py-3.5">
          <OrdersPaginationBar
            page={om.page}
            setPage={om.setPage}
            pageInfo={om.pageInfo}
            disabled={om.loading}
          />
        </div>
      </div>

      {om.confirmCancel.open && (
        <CancelPedidoPinModal
          open
          onClose={() => om.setConfirmCancel({ open: false, order: null })}
          loading={om.busyAction}
          title="Cancelar pedido"
          message={
            om.confirmCancel.order
              ? `Pedido ${om.confirmCancel.order.id}. Ingresá el PIN de autorización.`
              : "Ingresá el PIN de autorización."
          }
          confirmLabel="Cancelar pedido"
          onConfirm={om.onCancelPedidoConfirm}
        />
      )}
    </BackofficePageShell>
  );
}
