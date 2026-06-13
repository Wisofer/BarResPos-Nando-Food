import { useAppLogo } from "../hooks/useAppLogo";
import { useAppName } from "../hooks/useAppName";

export function SessionLoader({ message = "Cargando..." }) {
  const logoUrl = useAppLogo();
  const appName = useAppName();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm transition-all duration-300">
      <div className="relative w-full max-w-sm overflow-hidden rounded-[32px] border border-white/20 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        {/* Luces decorativas */}
        <div className="pointer-events-none absolute -left-12 -top-12 h-32 w-32 rounded-full bg-blue-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-indigo-400/20 blur-3xl" />
        
        {/* Contenedor del Logo */}
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-[24px] border border-white bg-white/60 shadow-lg backdrop-blur-md">
          <img src={logoUrl} alt={`${appName} logo`} className="h-12 w-12 object-contain animate-pulse" />
        </div>
        
        <p className="relative mt-6 text-xl font-black tracking-tight text-slate-800">{appName}</p>
        <p className="relative mt-1.5 text-sm font-semibold text-slate-500">{message}</p>
        
        {/* Spinner Circular Moderno */}
        <div className="relative mx-auto mt-6 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary-500" />
        </div>
      </div>
    </div>
  );
}
