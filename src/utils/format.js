// Nicaragua: Córdobas (NIO), locale es-NI
export function formatCurrency(amount, currency = "NIO") {
  if (amount == null || !Number.isFinite(Number(amount))) return "—";
  return new Intl.NumberFormat("es-NI", { style: "currency", currency }).format(amount);
}

/**
 * Formatea un monto según la forma de pago: Dólares/TransferenciaDolares → USD ($), resto → NIO (C$).
 * paymentMethod: "Dolares" | "TransferenciaDolares" → USD; "Cordobas" | "Transferencia" | "TransferenciaCordobas" | null → NIO
 */
export function formatAmountByPaymentMethod(amount, paymentMethod) {
  const isDollars =
    paymentMethod === "Dolares" ||
    paymentMethod === "Dólares" ||
    paymentMethod === "TransferenciaDolares";
  return formatCurrency(amount, isDollars ? "USD" : "NIO");
}

function safeFormatDate(value, formatter) {
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "—";
    return formatter.format(d);
  } catch {
    return "—";
  }
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  return safeFormatDate(dateStr, new Intl.DateTimeFormat("es-NI", { day: "2-digit", month: "short", year: "numeric" }));
}

export function formatDateTime(dateStr) {
  if (!dateStr) return "—";
  const normalized = typeof dateStr === "string" ? dateStr.replace(" ", "T") : dateStr;
  return safeFormatDate(normalized, new Intl.DateTimeFormat("es-NI", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }));
}
