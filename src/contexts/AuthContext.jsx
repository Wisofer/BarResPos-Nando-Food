import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { authApi } from "../api/auth.js";
import { setOnUnauthorized } from "../api/client.js";
import { getToken, setToken, setRefreshToken, getRefreshToken, clearToken } from "../api/token.js";
import { normalizeAuthUser } from "../utils/authUser.js";
import { backofficeApi } from "../features/backoffice/services/backofficeApi.js";

async function fetchAndCacheLogo() {
  try {
    const config = await backofficeApi.configuraciones();
    const list = Array.isArray(config) ? config : config?.items || [];
    
    // Cache Logo
    const hasLogo = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "").toLowerCase() === "tickets:logourl");
    const url = hasLogo ? hasLogo.valor || hasLogo.Valor || "" : "";
    if (url) {
      localStorage.setItem("pos_logo_url", url);
    } else {
      localStorage.removeItem("pos_logo_url");
    }
    window.dispatchEvent(new Event("pos_logo_updated"));

    // Cache Company/App Name
    const hasName = list.find(cfg => {
      const k = String(cfg?.clave ?? cfg?.Clave ?? "").toLowerCase();
      return k === "tickets:companyname" || k === "tickets:nombrerestaurante";
    });
    const name = hasName ? hasName.valor || hasName.Valor || "" : "";
    if (name) {
      localStorage.setItem("pos_app_name", name);
    } else {
      localStorage.removeItem("pos_app_name");
    }
    window.dispatchEvent(new Event("pos_app_name_updated"));

    // Cache Address
    const hasAddress = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "").toLowerCase() === "tickets:direccionrestaurante");
    const address = hasAddress ? hasAddress.valor || hasAddress.Valor || "" : "";
    if (address) {
      localStorage.setItem("pos_address", address);
    } else {
      localStorage.removeItem("pos_address");
    }

    // Cache Phone
    const hasPhone = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "").toLowerCase() === "tickets:telefonorestaurante");
    const phone = hasPhone ? hasPhone.valor || hasPhone.Valor || "" : "";
    if (phone) {
      localStorage.setItem("pos_phone", phone);
    } else {
      localStorage.removeItem("pos_phone");
    }
  } catch (e) {
    console.error("No se pudo pre-cargar el logo y nombre al iniciar sesión", e);
  }
}

const AuthContext = createContext(null);
const STATIC_USER_KEY = "barrest-static-user";
const isStaticMode = import.meta.env.VITE_STATIC_MODE === "true";

function getStoredStaticUser() {
  try {
    const raw = localStorage.getItem(STATIC_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredStaticUser(user) {
  localStorage.setItem(STATIC_USER_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionLoading, setSessionLoading] = useState(false);

  const checkAuth = useCallback(async () => {
    if (isStaticMode) {
      const raw = getStoredStaticUser();
      const normalized = raw ? normalizeAuthUser(raw) || raw : null;
      setUser(normalized);
      setLoading(false);
      return normalized;
    }

    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await authApi.me();
      const normalized = normalizeAuthUser(data);
      if (normalized) {
        setUser(normalized);
        void fetchAndCacheLogo();
        return normalized;
      }
      setUser(null);
      return null;
    } catch {
      clearToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setOnUnauthorized(() => {
      clearToken();
      setUser(null);
    });
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (nombreUsuario, contrasena) => {
    setSessionLoading(true);
    try {
      if (isStaticMode) {
        const normalizedName = nombreUsuario?.trim();
        if (!normalizedName || !contrasena) throw new Error("Ingresa usuario y contraseña.");
        const staticUser = normalizeAuthUser({
          id: 1,
          nombreUsuario: normalizedName,
          rol: "admin",
        });
        setStoredStaticUser(staticUser);
        setUser(staticUser);
        return { user: staticUser };
      }

      const data = await authApi.login(nombreUsuario, contrasena);
      if (data?.accessToken) setToken(data.accessToken);
      if (data?.refreshToken) setRefreshToken(data.refreshToken);
      let normalized = normalizeAuthUser(data);
      if (!normalized) {
        try {
          const me = await authApi.me();
          normalized = normalizeAuthUser(me);
        } catch {
          normalized = null;
        }
      }
      if (normalized) {
        setUser(normalized);
        void fetchAndCacheLogo();
      }
      return data;
    } catch (e) {
      // Fallback automatico para demos estaticas sin backend disponible.
      const msg = e?.message || "";
      if (msg.includes("fetch") || msg.includes("Failed") || msg.includes("Connection") || msg.includes("Network")) {
        const normalizedName = nombreUsuario?.trim();
        if (normalizedName && contrasena) {
          const staticUser = normalizeAuthUser({
            id: 1,
            nombreUsuario: normalizedName,
            rol: "admin",
          });
          setStoredStaticUser(staticUser);
          setUser(staticUser);
          return { user: staticUser };
        }
      }
      throw e;
    } finally {
      setSessionLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setSessionLoading(true);
    try {
      if (!isStaticMode) await authApi.logout();
      const refreshToken = getRefreshToken();
      if (!isStaticMode && refreshToken) await authApi.revoke(refreshToken).catch(() => {});
    } catch { /* ignore logout errors */ }
    clearToken();
    localStorage.removeItem(STATIC_USER_KEY);
    setUser(null);
    setSessionLoading(false);
  }, []);

  const value = { user, loading, sessionLoading, login, logout, checkAuth };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
