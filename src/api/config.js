export const getApiUrl = () => {
  // Si está corriendo en Electron (file://), usa la dirección del backend local empaquetado (puerto 5000)
  if (window.location.protocol === "file:") {
    return "http://localhost:5000";
  }
  // En desarrollo (Vite), necesita URL absoluta al backend de desarrollo
  if (import.meta.env.DEV) {
    const raw = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return raw.replace(/\/+$/, "");
  }
  // En producción web (tablet navegador), usa URL relativa (mismo origen)
  return "";
};
