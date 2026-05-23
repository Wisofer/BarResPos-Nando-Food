import { getApiUrl } from "../../../api/config.js";

/** URL de imagen de producto (formulario o API, varias formas posibles). */
export function getProductImageUrl(productOrForm) {
  const url = (
    productOrForm?.imagenUrl ??
    productOrForm?.ImagenUrl ??
    productOrForm?.imageUrl ??
    productOrForm?.ImageUrl ??
    productOrForm?.imagen ??
    productOrForm?.Imagen ??
    ""
  );

  if (!url) return "";

  // Si ya es una URL completa (http, https) o un base64, la devolvemos tal cual
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) {
    return url;
  }

  // Si es una ruta relativa, le prepende la URL de la API
  const apiBase = getApiUrl();
  const cleanUrl = url.startsWith("/") ? url : `/${url}`;
  return `${apiBase}${cleanUrl}`;
}
