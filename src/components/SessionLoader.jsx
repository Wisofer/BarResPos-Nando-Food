import { useAppLogo } from "../hooks/useAppLogo";
import { useAppName } from "../hooks/useAppName";

export function SessionLoader({ message = "Cargando..." }) {
  const logoUrl = useAppLogo();
  const appName = useAppName();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFC]/90 backdrop-blur-md transition-all duration-300 overflow-hidden">
      {/* Auroras Pasteles en Movimiento */}
      <div className="pointer-events-none absolute -left-10 top-10 h-[350px] w-[350px] rounded-full bg-sky-200/50 blur-[100px] animate-float-aurora-1" />
      <div className="pointer-events-none absolute -right-10 bottom-10 h-[400px] w-[400px] rounded-full bg-purple-200/40 blur-[120px] animate-float-aurora-2" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 h-[300px] w-[300px] rounded-full bg-amber-100/40 blur-[100px] animate-float-aurora-1" />

      {/* Partículas de luz flotantes (Emergen detrás de la tarjeta) */}
      <div className="pointer-events-none absolute left-[45%] top-[60%] h-3 w-3 rounded-full bg-sky-300/40 blur-[1px] animate-particle-1" />
      <div className="pointer-events-none absolute left-[52%] top-[55%] h-2.5 w-2.5 rounded-full bg-indigo-300/50 blur-[1px] animate-particle-2" />
      <div className="pointer-events-none absolute left-[48%] top-[65%] h-3.5 w-3.5 rounded-full bg-purple-300/40 blur-[1px] animate-particle-3" />

      {/* Tarjeta de Cristal Claro Premium */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-[40px] border border-white bg-white/70 p-10 text-center shadow-[0_32px_64px_-16px_rgba(15,23,42,0.08),inset_0_1px_1px_rgba(255,255,255,0.9)] backdrop-blur-3xl">
        {/* Contenedor del Logo con Flotación Magnética y Anillo SVG Gradiente */}
        <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
          
          {/* Anillo SVG de carga neón pastel */}
          <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" stroke="rgba(15,23,42,0.03)" strokeWidth="3" fill="transparent" />
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="url(#loaderGradient)"
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray="283"
              strokeDashoffset="120"
              strokeLinecap="round"
              className="animate-spin origin-center"
              style={{ animationDuration: "2.2s", transformOrigin: "50px 50px" }}
            />
            <defs>
              <linearGradient id="loaderGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="50%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#c084fc" />
              </linearGradient>
            </defs>
          </svg>

          {/* Halo difuso que pulsa detrás del logo */}
          <div className="absolute h-20 w-20 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-400 opacity-20 blur-xl animate-pulse" />
          
          {/* Contenedor interno del Logo */}
          <div className="relative flex h-22 w-22 items-center justify-center rounded-full border border-white bg-white shadow-md animate-float-logo">
            <img src={logoUrl} alt={`${appName} logo`} className="h-12 w-12 object-contain" />
          </div>
        </div>
        
        {/* Nombre de la Aplicación con gradiente moderno */}
        <h2 className="relative mt-8 text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-600 bg-clip-text text-transparent">
          {appName}
        </h2>
        
        {/* Mensaje de carga descriptivo */}
        <p className="relative mt-2 text-sm font-semibold tracking-wide text-slate-500/80 animate-pulse">
          {message}
        </p>
      </div>
    </div>
  );
}
