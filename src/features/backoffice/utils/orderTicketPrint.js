import { backofficeApi } from "../services/backofficeApi.js";
import {
  PRECUENTA_PRINT_READY_INFO,
  openBackendPrintUrl,
  tryPrintPrecuentaFromPayload,
} from "./backofficePrint.js";
import {
  pedidoPagosLista,
} from "./pedidoCobro.js";
import { formatCurrency } from "./currency.js";

/**
 * Imprime pre-cuenta o recibo llamando al backend o cae a previsualización en pantalla.
 */
export async function printOrderTicket({ order, currencySymbol = "C$", snackbar }) {
  const orderId = order?.id ?? order?.Id ?? null;
  if (!orderId) return;

  try {
    const pagos = pedidoPagosLista(order);
    const esPagado = String(order.estado || "").toLowerCase() === "pagado" || pagos.length > 0;
    let targetPrintUrl = `/api/v1/impresion/comanda/${orderId}`;
    let successMessage = PRECUENTA_PRINT_READY_INFO;

    if (esPagado && pagos.length > 0) {
      const pagoId = pagos[0]?.id ?? pagos[0]?.Id;
      if (pagoId) {
        targetPrintUrl = `/api/v1/impresion/recibo/${pagoId}`;
        successMessage = "Recibo de pago listo para imprimir.";
        if (await openBackendPrintUrl(targetPrintUrl)) {
          snackbar?.info(successMessage);
          return;
        }
      }
    } else {
      const pre = await backofficeApi.pedidoPrecuenta(orderId);
      if (await tryPrintPrecuentaFromPayload(pre)) {
        snackbar?.info(successMessage);
        return;
      }
    }

    // Fallback: Generación de ticket local si no hay impresora física
    const companyName = (() => { try { return localStorage.getItem("pos_app_name") || "BarRestPOS"; } catch { return "BarRestPOS"; } })();
    const hasLogo = (() => { try { return !!localStorage.getItem("pos_logo_url"); } catch { return false; } })();
    const logoLine = hasLogo ? `       [LOGO]` : `       ${companyName}`;
    const fechaLocal = new Date().toLocaleString("es-NI", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
    
    const items = Array.isArray(order.items ?? order.Items) ? (order.items ?? order.Items) : [];
    const total = order.monto ?? order.Monto ?? 0;
    
    let fallbackText = `${logoLine}\n       ${companyName}\n------------------------------------------------\n${esPagado ? "RECIBO" : "COMANDA"}: #${orderId}\nFECHA:  ${fechaLocal}\n------------------------------------------------\nCANT PRODUCTO                PRECIO\n------------------------------------------------\n`;
    
    items.forEach(x => {
      const qty = x.cantidad ?? x.Cantidad ?? 1;
      const name = x.servicio ?? x.Servicio ?? x.producto ?? x.Producto ?? "Producto";
      const lineTotal = x.monto ?? x.Monto ?? 0;
      fallbackText += `${String(qty).padEnd(6)}${String(name).substring(0, 25).padEnd(28)}${formatCurrency(lineTotal, currencySymbol).padStart(14)}\n`;
    });
    
    fallbackText += `------------------------------------------------\nTOTAL:                                ${formatCurrency(total, currencySymbol).padStart(14)}\n------------------------------------------------\n       ${esPagado ? "Recibo de pago" : "Comanda para cocina/barra"}\n       ${fechaLocal}`;

    window.dispatchEvent(
      new CustomEvent("show-ticket-preview", {
        detail: {
          text: fallbackText,
          onConfirmPrint: async () => {
            const printed = await openBackendPrintUrl(targetPrintUrl);
            if (printed) snackbar?.success("Enviado a la impresora física.");
            else snackbar?.warning("No se pudo imprimir. Verifique la impresora.");
          },
          onCancelPrint: () => {},
        },
      })
    );
  } catch (err) {
    if (err?.message === "CANCEL_BY_USER") return;
    snackbar?.error(err.message || "Error de conexión con el servidor de impresión.");
  }
}

