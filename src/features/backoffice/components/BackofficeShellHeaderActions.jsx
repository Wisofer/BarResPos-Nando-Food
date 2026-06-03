import { useEffect, useRef, useState } from "react";
import { Bell, Maximize2, Minimize2, Package, UserCircle } from "lucide-react";
import { displayUserName } from "../../../utils/authUser.js";
import { cn } from "../../../utils/cn.js";

/**
 * Campana + perfil con paneles. `variant="topbar"` para la franja móvil; `card` para el header de vista en desktop.
 */
export function BackofficeShellHeaderActions({
  user,
  logout,
  sessionLoading,
  lowStockItems,
  refreshLowStock,
  openView,
  allowedViewIds,
  variant = "card",
}) {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(
    () => Boolean(document.fullscreenElement)
  );
  const rootRef = useRef(null);
  const lowStockCount = lowStockItems.length;

  useEffect(() => {
    const onPointerDown = (e) => {
      if (rootRef.current?.contains(e.target)) return;
      setNotifOpen(false);
      setProfileOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown, { passive: true });
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  const isTopbar = variant === "topbar";
  const btnBase =
    "relative inline-flex shrink-0 items-center justify-center rounded-full text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-900 active:scale-95 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white";
  const btnSize = "h-12 w-12 min-h-[48px] min-w-[48px]";
  const btnActive = "bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white";

  const panelClass =
    "z-[100] max-h-[min(24rem,75dvh)] w-[min(22rem,calc(100vw-1.25rem))] overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-200/40 dark:border-slate-700/50 dark:bg-slate-900/90 dark:shadow-black/30";

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        const target = document.documentElement;
        if (target?.requestFullscreen) await target.requestFullscreen();
      }
    } catch {
      // Puede fallar por políticas del navegador o permisos del sistema.
    }
  };

  return (
    <div ref={rootRef} className={cn("flex shrink-0 items-center gap-1 sm:gap-2", isTopbar && "touch-manipulation")}>
      <button
        type="button"
        onClick={() => void toggleFullscreen()}
        className={cn(btnBase, btnSize, "touch-manipulation")}
        aria-label={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
        title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
      >
        {isFullscreen ? <Minimize2 className="h-6 w-6" strokeWidth={1.5} /> : <Maximize2 className="h-6 w-6" strokeWidth={1.5} />}
      </button>
      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700" />
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setNotifOpen((o) => !o);
            setProfileOpen(false);
            void refreshLowStock();
          }}
          className={cn(btnBase, btnSize, notifOpen && btnActive, "touch-manipulation")}
          aria-label="Notificaciones"
          aria-expanded={notifOpen}
        >
          <Bell className="h-6 w-6" strokeWidth={1.5} />
          {lowStockCount > 0 && (
            <span className="absolute right-0 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 border-2 border-white text-[11px] font-bold text-white shadow-md shadow-red-500/30">
              {lowStockCount > 9 ? "9+" : lowStockCount}
            </span>
          )}
        </button>
        {notifOpen && (
          <div
            className={cn(
              "absolute max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[4.25rem] sm:right-0 sm:top-[calc(100%+0.5rem)]",
              panelClass
            )}
            role="dialog"
            aria-label="Notificaciones"
          >
            <div className="border-b border-slate-200/60 bg-slate-50/50 px-5 py-4 dark:border-slate-700/50 dark:bg-slate-800/50">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notificaciones</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {lowStockCount === 0
                  ? "Sin alertas de inventario"
                  : `${lowStockCount} ${lowStockCount === 1 ? "alerta" : "alertas"} de stock bajo`}
              </p>
            </div>
            <div className="max-h-60 overflow-y-auto py-2 sm:max-h-72">
              {lowStockCount === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-slate-500">Todo en orden por ahora.</p>
              ) : (
                <ul className="divide-y divide-slate-100/60 dark:divide-slate-700/50">
                  {lowStockItems.map((p, idx) => (
                    <li
                      key={p.id != null ? String(p.id) : `stock-${idx}-${p.nombre}`}
                      className="flex gap-3 px-4 py-3 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600 shadow-sm dark:from-blue-950/30 dark:to-blue-900/30 dark:text-blue-400">
                        <Package className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">{p.nombre}</p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          Stock bajo · {p.stock} / {p.stockMinimo} mín.
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {lowStockCount > 0 && allowedViewIds.includes("products") && (
              <div className="border-t border-slate-200/60 px-4 py-3 dark:border-slate-700/50">
                <button
                  type="button"
                  onClick={() => {
                    openView("products");
                    setNotifOpen(false);
                  }}
                  className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-lg dark:bg-blue-500 dark:shadow-blue-500/30 dark:hover:bg-blue-600"
                >
                  Ver productos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setProfileOpen((o) => !o);
            setNotifOpen(false);
          }}
          className={cn(btnBase, btnSize, profileOpen && btnActive, "touch-manipulation")}
          aria-label="Perfil"
          title="Perfil"
          aria-expanded={profileOpen}
        >
          <UserCircle className="h-6 w-6" strokeWidth={1.5} />
        </button>
        {profileOpen && (
          <div
            className={cn(
              "absolute max-sm:fixed max-sm:left-3 max-sm:right-3 max-sm:top-[4.25rem] sm:right-0 sm:top-[calc(100%+0.5rem)]",
              "z-[100] w-[min(19rem,calc(100vw-1.25rem))] overflow-hidden rounded-2xl border border-slate-200/60 bg-white/90 backdrop-blur-xl shadow-2xl shadow-slate-200/40 dark:border-slate-700/50 dark:bg-slate-900/90 dark:shadow-black/30"
            )}
            role="dialog"
            aria-label="Perfil de usuario"
          >
            <div className="flex gap-4 border-b border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-5 dark:border-slate-700/50 dark:from-slate-800/50 dark:to-slate-900/50">
              <div
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30 dark:from-blue-600 dark:to-blue-700 dark:shadow-blue-500/40"
                aria-hidden
              >
                <UserCircle className="h-10 w-10" strokeWidth={1.5} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sesión</p>
                <p className="mt-1 truncate text-base font-bold text-slate-900 dark:text-slate-100">{displayUserName(user)}</p>
                {user?.nombreCompleto &&
                  user?.nombreUsuario &&
                  String(user.nombreCompleto).trim() !== String(user.nombreUsuario).trim() && (
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">@{user.nombreUsuario}</p>
                  )}
                {user?.rol != null && user.rol !== "" && (
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Rol: <span className="font-semibold text-slate-800 dark:text-slate-100">{user.rol}</span>
                  </p>
                )}
                {user?.email != null && user.email !== "" && (
                  <p className="mt-1 break-all text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                )}
              </div>
            </div>
            <div className="p-4">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  void logout();
                }}
                disabled={sessionLoading}
                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {sessionLoading ? "Cerrando…" : "Cerrar sesión"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
