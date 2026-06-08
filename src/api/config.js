export const getApiUrl = () => {
  // En desarrollo (Vite) o Electron (file://), necesita URL absoluta al backend
  if (import.meta.env.DEV || window.location.protocol === "file:") {
    const raw = import.meta.env.VITE_API_URL || "http://localhost:5000";
    return raw.replace(/\/+$/, "");
  }
  // En producción web (tablet navegador), usa URL relativa (mismo origen)
  return "";
};
