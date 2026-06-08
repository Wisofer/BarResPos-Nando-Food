import { getApiUrl } from "../../../api/config.js";
import { getToken } from "../../../api/token.js";

const KITCHEN_PRINT_AUTO_FAIL_INFO =
  "No se pudo imprimir automáticamente. Verifique la impresora de la cocina en Preferencias.";

/** Mensaje común tras imprimir pre-cuenta vía backend */
export const PRECUENTA_PRINT_READY_INFO = "Pre-cuenta enviada a la impresora.";

/**
 * Rutas de tickets bajo API REST:
 * POST /api/v1/impresion/recibo/{pagoId}, /comanda/{ordenId}, /cocina/{ordenId}
 */
function normalizeImpresionPathname(pathname) {
  if (!pathname || typeof pathname !== "string") return pathname;
  if (pathname.includes("/api/v1/impresion/")) return pathname;
  if (pathname.startsWith("/impresion/")) {
    return `/api/v1${pathname}`;
  }
  return pathname;
}

function isImpressionPathname(pathname) {
  if (!pathname) return false;
  return pathname.includes("/api/v1/impresion/") || pathname.startsWith("/impresion/");
}

/** Resuelve URL del API (ruta relativa o absoluta). Normaliza URLs de impresión al prefijo /api/v1/impresion/. */
export function resolveBackendAssetUrl(url) {
  if (!url || typeof url !== "string") return "";
  if (url.startsWith("http")) {
    try {
      const u = new URL(url);
      const next = normalizeImpresionPathname(u.pathname);
      if (next !== u.pathname) u.pathname = next;
      return u.toString();
    } catch {
      return url;
    }
  }
  let path = url.startsWith("/") ? url : `/${url}`;
  path = normalizeImpresionPathname(path);
  return `${getApiUrl()}${path}`;
}

/** Añade access_token para rutas de impresión */
export function withImpressionAccessTokenQuery(absoluteUrl) {
  if (!absoluteUrl || typeof absoluteUrl !== "string") return absoluteUrl;
  const token = getToken();
  if (!token) return absoluteUrl;
  try {
    const base = absoluteUrl.startsWith("http") ? undefined : getApiUrl();
    const u = new URL(absoluteUrl, base);
    if (!isImpressionPathname(u.pathname)) return absoluteUrl;
    u.searchParams.set("access_token", token);
    return u.toString();
  } catch {
    return absoluteUrl;
  }
}

/**
 * Dispara la impresión nativa (ESC/POS) en el backend enviando un POST silencioso.
 */
export async function openBackendPrintUrl(url, options = {}) {
  if (!url) return false;
  const token = getToken();
  const resolved = resolveBackendAssetUrl(url);
  const fetchUrl = withImpressionAccessTokenQuery(resolved);
  if (!fetchUrl) return false;
  
  try {
    const res = await fetch(fetchUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    
    if (!res.ok) return false;
    
    const data = await res.json().catch(() => ({}));
    console.log("Impresión nativa exitosa:", data);
    return true;
  } catch (err) {
    console.error("Error en impresión nativa:", err);
    return false;
  }
}

/** URL del ticket devuelta por PATCH `.../enviar-cocina`. */
export function extractUrlImpresionCocina(data) {
  if (!data || typeof data !== "object") return "";
  const u = data.urlImpresionCocina ?? data.UrlImpresionCocina ?? "";
  return String(u || "").trim();
}

/** URL del ticket bar devuelta por PATCH `.../enviar-cocina`. */
export function extractUrlImpresionBar(data) {
  if (!data || typeof data !== "object") return "";
  const u = data.urlImpresionBar ?? data.UrlImpresionBar ?? "";
  return String(u || "").trim();
}

/**
 * Tras enviar a cocina (200 + data): manda a imprimir al hardware de cocina y/o bar.
 * @param {object} data — `data` del envelope API
 * @param {{ info?: (msg: string) => void }} [snackbar] — si falla, muestra aviso
 */
export async function printKitchenTicketAfterEnviarCocina(data, snackbar) {
  const urlCocina = extractUrlImpresionCocina(data);
  const urlBar = extractUrlImpresionBar(data);
  
  if (!urlCocina && !urlBar) return false;

  let printedCocina = true;
  let printedBar = true;

  if (urlCocina) {
      printedCocina = await openBackendPrintUrl(urlCocina);
  }

  if (urlBar) {
      printedBar = await openBackendPrintUrl(urlBar);
  }

  if ((!printedCocina || !printedBar) && typeof snackbar?.warning === "function") {
    snackbar.warning(KITCHEN_PRINT_AUTO_FAIL_INFO);
  }
  return printedCocina || printedBar;
}

/** Extrae URL de impresión desde respuesta de precuenta. */
export function extractPrecuentaUrlFromPayload(pre) {
  if (!pre || typeof pre !== "object") return "";
  const u = pre.urlImpresionPrecuenta ?? pre.UrlImpresionPrecuenta ?? pre.urlImpresion ?? pre.UrlImpresion ?? "";
  return String(u || "").trim();
}

/** Intenta imprimir precuenta (comanda) llamando a la API nativa. */
export async function tryPrintPrecuentaFromPayload(pre, options = {}) {
  const url = extractPrecuentaUrlFromPayload(pre);
  if (url && (await openBackendPrintUrl(url, options))) return true;
  return false;
}

export function extractReciboUrlFromPagoResponse(resp) {
  if (!resp || typeof resp !== "object") return "";
  return String(resp.urlImpresionRecibo ?? resp.UrlImpresionRecibo ?? resp.url ?? resp.Url ?? "").trim();
}

/** Tras cobro: imprime recibo llamando a la API nativa. */
export async function tryPrintReciboFromPagoResponse(resp) {
  const url = extractReciboUrlFromPagoResponse(resp);
  if (url && (await openBackendPrintUrl(url))) return true;
  return false;
}

export function pagoResponseHasReciboPrintChannel(resp) {
  return !!extractReciboUrlFromPagoResponse(resp);
}
