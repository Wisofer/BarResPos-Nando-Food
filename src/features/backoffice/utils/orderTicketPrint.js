import { backofficeApi } from "../services/backofficeApi.js";
import {
  PRECUENTA_PRINT_READY_INFO,
  openBackendPrintUrl,
  tryPrintPrecuentaFromPayload,
} from "./backofficePrint.js";
import {
  pedidoPagosLista,
} from "./pedidoCobro.js";

/**
 * Imprime pre-cuenta o recibo llamando al backend.
 */
export async function printOrderTicket({ order, snackbar }) {
  const orderId = order?.id ?? order?.Id ?? null;
  if (orderId) {
    try {
      // Si el pedido ya está pagado o tiene pagos asociados, priorizamos imprimir el recibo final
      const pagos = pedidoPagosLista(order);
      const esPagado = String(order.estado || "").toLowerCase() === "pagado" || pagos.length > 0;
      if (esPagado && pagos.length > 0) {
        const pagoId = pagos[0]?.id ?? pagos[0]?.Id;
        if (pagoId) {
          const receiptUrl = `/api/v1/impresion/recibo/${pagoId}`;
          if (await openBackendPrintUrl(receiptUrl)) {
            snackbar?.info("Recibo de pago listo para imprimir.");
            return;
          }
        }
      }

      const pre = await backofficeApi.pedidoPrecuenta(orderId);
      if (await tryPrintPrecuentaFromPayload(pre)) {
        snackbar?.info(PRECUENTA_PRINT_READY_INFO);
        return;
      }

      // Si no retornó antes, es que el backend no logró imprimir
      snackbar?.warning("No se pudo imprimir automáticamente. Revise la impresora.");
    } catch (err) {
      if (err?.message === "CANCEL_BY_USER") {
        return;
      }
      snackbar?.error(err.message || "Error de conexión con el servidor de impresión.");
    }
  }
}
