import { LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useAppLogo } from "../../../hooks/useAppLogo";
import { useAppName } from "../../../hooks/useAppName";
import { NAV_ITEMS } from "../constants.js";

export function SidebarNav({
  collapsed,
  activeView,
  onChangeView,
  onToggle,
  onLogout,
  sessionLoading,
  navItems = NAV_ITEMS,
}) {
  const logoUrl = useAppLogo();
  const appName = useAppName();
  return (
    <aside className="hidden h-full min-h-0 w-full min-w-0 max-w-full overflow-x-hidden rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-6 lg:flex lg:h-[calc(100vh-3rem)] lg:flex-col transition-all duration-300">
      <div
        className={`flex min-w-0 items-center gap-2 sm:gap-3 ${collapsed ? "justify-center" : "justify-between"}`}
      >
        <img
          src={logoUrl}
          alt={`${appName} logo`}
          className="h-10 w-10 shrink-0 rounded-[14px] object-contain sm:h-11 sm:w-11 shadow-sm border border-slate-100"
        />
        <div className={`min-w-0 flex-1 ${collapsed ? "hidden" : "block"}`}>
          <p className="truncate text-base font-bold leading-tight text-slate-800 sm:text-lg" title={appName}>
            {appName}
          </p>
          <div className="truncate text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>Panel administrativo</span>
          </div>
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-550 hover:bg-slate-50 shadow-sm transition active:scale-90"
            aria-label="Contraer menú lateral"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {collapsed && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={onToggle}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/80 text-slate-550 hover:bg-slate-50 shadow-sm transition active:scale-90"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        </div>
      )}

      <nav className="mt-6 min-w-0 flex-1 space-y-1.5 overflow-y-auto overflow-x-hidden sm:mt-8 pr-0.5">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={`flex w-full min-w-0 max-w-full items-center rounded-xl px-3 py-2 text-sm transition-all duration-200 focus:outline-none border ${isActive
                  ? "bg-indigo-50/80 border-indigo-100/40 text-indigo-700 shadow-sm font-semibold"
                  : "border-transparent text-slate-500 font-medium hover:bg-slate-50 hover:text-slate-800 hover:translate-x-0.5"
                } ${collapsed ? "justify-center" : "gap-3"}`}
            >
              <item.icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span className={`min-w-0 truncate text-left ${collapsed ? "hidden" : "inline"}`}>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onLogout}
        disabled={sessionLoading}
        className={`mt-4 flex w-full min-w-0 max-w-full shrink-0 items-center rounded-xl border border-slate-200/80 bg-white/60 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-rose-50/80 hover:text-rose-600 hover:border-rose-100 transition shadow-sm active:scale-95 disabled:opacity-60 focus:outline-none sm:mt-6 sm:px-4 ${collapsed ? "justify-center" : "justify-start gap-3"
          }`}
      >
        <LogOut className="h-4 w-4 shrink-0 text-slate-400" />
        <span className={`min-w-0 truncate text-left ${collapsed ? "hidden" : "inline"}`}>
          {sessionLoading ? "Cerrando..." : "Cerrar sesión"}
        </span>
      </button>
    </aside>
  );
}
