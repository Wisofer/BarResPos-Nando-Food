import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { User, Eye, EyeOff, Lock, Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { SessionLoader } from "../components/SessionLoader";
import { useAppLogo } from "../hooks/useAppLogo";
import { useAppName } from "../hooks/useAppName";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, sessionLoading, login } = useAuth();
  const logoUrl = useAppLogo();
  const appName = useAppName();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    if (!loading && user) navigate(location.state?.from?.pathname || "/app", { replace: true });
  }, [user, loading, navigate, location.state?.from?.pathname]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(form.username.trim(), form.password);
      navigate(location.state?.from?.pathname || "/app", { replace: true });
    } catch (e) {
      const msg = e?.message || "";
      if (msg.includes("fetch") || msg.includes("Failed") || msg.includes("Connection") || msg.includes("Network")) {
        setError("No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.");
      } else {
        setError(msg || "Usuario o contraseña incorrectos.");
      }
    }
  };

  if (sessionLoading) return <SessionLoader message="Iniciando sesión..." />;
  if (loading) return <SessionLoader message="Verificando sesión..." />;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50/50 flex items-center justify-center">
      {/* Estilos CSS embebidos para animaciones orbitales fluidas de auras (Estilo Siri/macOS Sequoia) */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-c1 {
          0%, 100% { transform: translateY(0px) rotate(-6deg); }
          50% { transform: translateY(-10px) rotate(-5deg); }
        }
        @keyframes float-c2 {
          0%, 100% { transform: translateY(0px) rotate(6deg); }
          50% { transform: translateY(10px) rotate(5deg); }
        }
        @keyframes float-c3 {
          0%, 100% { transform: translateY(-10px) scale(1); }
          50% { transform: translateY(-22px) scale(1.02); }
        }
        .animate-float-card-1 { animation: float-c1 6s ease-in-out infinite; }
        .animate-float-card-2 { animation: float-c2 8s ease-in-out infinite; }
        .animate-float-card-3 { animation: float-c3 7s ease-in-out infinite; }
      `}} />

      {/* Patrón de fondo de rejilla de puntos estilo minimalista moderno */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px] opacity-60" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-slate-50/80 via-white to-slate-50/80" />

      {/* Luces de fondo difusas (Auras celestes y violetas ultra suaves) */}
      <div className="pointer-events-none absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full bg-blue-100/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-[600px] w-[600px] rounded-full bg-indigo-100/30 blur-3xl" />
      <div className="pointer-events-none absolute left-[40%] top-[25%] h-[350px] w-[350px] rounded-full bg-sky-100/30 blur-3xl" />

      <div className="relative mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-8 p-4 md:p-8 lg:grid-cols-[1.15fr_0.85fr]">

        {/* Panel Izquierdo: Escenario de Tarjetas Apiladas Interactivas (Estilo Apple Card Stack) */}
        <section className="hidden h-[600px] rounded-[32px] border border-slate-300 bg-white/70 backdrop-blur-md p-10 shadow-2xl shadow-slate-300/50 lg:flex lg:flex-col lg:justify-between relative overflow-hidden group transition-all duration-500 hover:shadow-2xl hover:shadow-slate-400/50">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100 p-1.5">
                <img src={logoUrl} alt={`${appName} logo`} className="h-7 w-7 object-contain" />
              </div>
              <p className="text-xl font-black text-slate-800 tracking-tight">{appName}</p>
            </div>
            <h2 className="text-3xl font-black tracking-tight text-slate-800 leading-tight font-sans">
              Diseñado para operar a la velocidad de tu servicio.
            </h2>
          </div>

          {/* El Escenario de Tarjetas Capas Flotantes (Efecto Interactivo de Levitación Continua) */}
          <div className="relative w-full h-[320px] my-auto flex items-center justify-center">

            {/* Capa 1: Gráfico de Ventas (Fondo Izquierda) */}
            <div className="absolute left-2 top-6 w-[230px] rounded-2xl border border-slate-300 bg-white/90 p-4 shadow-2xl shadow-slate-300/50 backdrop-blur-md transition-all duration-500 animate-float-card-1 group-hover:!animate-none group-hover:-rotate-3 group-hover:translate-x-[-15px] group-hover:translate-y-[-15px] z-10">
              <div className="flex items-center justify-between">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Ventas Semanales</p>
                <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-extrabold text-emerald-600 shadow-sm border border-emerald-100/30">
                  <span>↗</span> +14.2%
                </span>
              </div>
              <p className="text-lg font-black text-slate-800 mt-1">C$ 45,820.00</p>
              <div className="mt-3 flex items-end gap-2 h-16">
                <div className="w-full bg-blue-100/60 rounded-t-md h-8 transition-all duration-300 hover:bg-blue-400" />
                <div className="w-full bg-blue-100/60 rounded-t-md h-12 transition-all duration-300 hover:bg-blue-400" />
                <div className="w-full bg-blue-200/60 rounded-t-md h-10 transition-all duration-300 hover:bg-blue-400" />
                <div className="w-full bg-primary-500 rounded-t-md h-16 shadow-[0_4px_12px_rgba(59,130,246,0.2)]" />
                <div className="w-full bg-blue-100/60 rounded-t-md h-14 transition-all duration-300 hover:bg-blue-400" />
              </div>
            </div>

            {/* Capa 2: Estado de Mesas (Fondo Derecha) */}
            <div className="absolute right-2 bottom-6 w-[220px] rounded-2xl border border-slate-300 bg-white/90 p-4 shadow-2xl shadow-slate-300/50 backdrop-blur-md transition-all duration-500 transform rotate-6 animate-float-card-2 group-hover:!animate-none group-hover:rotate-3 group-hover:translate-x-[15px] group-hover:translate-y-[15px] z-10">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Distribución de Salón</p>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="flex flex-col p-1.5 rounded-xl border border-emerald-100 bg-emerald-50/40 text-center">
                  <span className="text-[8px] font-bold text-emerald-600">Mesa 1</span>
                  <span className="text-[10px] font-black text-emerald-800">Libre</span>
                </div>
                <div className="flex flex-col p-1.5 rounded-xl border border-amber-100 bg-amber-50/40 text-center relative overflow-hidden">
                  <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[8px] font-bold text-amber-600">Mesa 2</span>
                  <span className="text-[10px] font-black text-amber-800">Ocupada</span>
                </div>
                <div className="flex flex-col p-1.5 rounded-xl border border-emerald-100 bg-emerald-50/40 text-center">
                  <span className="text-[8px] font-bold text-emerald-600">Mesa 3</span>
                  <span className="text-[10px] font-black text-emerald-800">Libre</span>
                </div>
                <div className="flex flex-col p-1.5 rounded-xl border border-blue-100 bg-blue-50/40 text-center">
                  <span className="text-[8px] font-bold text-blue-600">Mesa 4</span>
                  <span className="text-[10px] font-black text-blue-800">Reservada</span>
                </div>
              </div>
              {/* Barra de progreso de ocupación */}
              <div className="mt-3.5 space-y-1">
                <div className="flex justify-between text-[8px] font-extrabold text-slate-400">
                  <span>MOP (Ocupación)</span>
                  <span>45%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/20">
                  <div className="h-full bg-primary-500 rounded-full" style={{ width: "45%" }} />
                </div>
              </div>
            </div>

            {/* Capa 3: Ticket Flotante (Centro / Destacado) */}
            <div className="absolute w-[210px] rounded-2xl border border-slate-300 bg-white p-4 shadow-2xl shadow-slate-300/50 transition-all duration-500 animate-float-card-3 group-hover:!animate-none group-hover:scale-105 group-hover:translate-y-[-24px] z-20">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div>
                  <p className="text-xs font-black text-slate-800">Pedido #1042</p>
                  <p className="text-[9px] font-semibold text-slate-400">Mesa 2 · Salon</p>
                </div>
                <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-bold text-amber-700 animate-pulse">En Cocina</span>
              </div>
              <div className="mt-3 space-y-1.5">
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>1x Hamburguesa</span>
                  <span>C$ 180</span>
                </div>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                  <span>1x Té Helado</span>
                  <span>C$ 40</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-slate-800 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-primary-600">C$ 220.00</span>
                </div>
              </div>
              
              {/* Código de barras simulado premium */}
              <div className="mt-4 pt-3.5 border-t border-dashed border-slate-200 flex flex-col items-center gap-1.5">
                <div className="flex gap-[1.5px] h-5 opacity-40">
                  <div className="w-[1.5px] bg-slate-800 h-full" />
                  <div className="w-[2.5px] bg-slate-800 h-full" />
                  <div className="w-[1px] bg-slate-800 h-full" />
                  <div className="w-[3px] bg-slate-800 h-full" />
                  <div className="w-[1px] bg-slate-800 h-full" />
                  <div className="w-[2px] bg-slate-800 h-full" />
                  <div className="w-[4px] bg-slate-800 h-full" />
                  <div className="w-[1px] bg-slate-800 h-full" />
                  <div className="w-[2px] bg-slate-800 h-full" />
                </div>
                <span className="text-[7px] font-extrabold text-slate-400 tracking-[0.25em]">#1042-NANDO-FOOD</span>
              </div>
            </div>

          </div>

          <div className="text-slate-400 text-xs font-medium border-t border-slate-100 pt-5 flex items-center justify-between">
            <span>Sencillo · Veloz · Confiable</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </section>

        {/* Panel Derecho: Tarjeta de Iniciar Sesión (Glassmorphism Claro) */}
        <section className="mx-auto w-full max-w-md rounded-[32px] border border-slate-300 bg-white/90 backdrop-blur-md p-8 shadow-2xl shadow-slate-300/50 md:p-10 transition-all duration-300">
          <div className="mb-6 flex justify-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-[24px] bg-white shadow-sm border border-slate-100 p-2.5">
              <img
                src={logoUrl}
                alt={`${appName} logo`}
                className="h-20 w-auto object-contain"
              />
            </div>
          </div>
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-black tracking-tight text-slate-800">Iniciar sesión</h1>
            <p className="mt-1.5 text-sm font-semibold text-slate-400">Accede al panel administrativo</p>
          </div>

          {import.meta.env.VITE_STATIC_MODE === "true" && (
            <div className="mb-6 flex items-center gap-2.5 rounded-2xl border border-emerald-100 bg-emerald-50/50 px-4 py-3.5 text-xs font-semibold text-emerald-700 shadow-sm">
              <Sparkles className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
              <span>Modo estático activo: puedes entrar con cualquier credencial.</span>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3.5 shadow-sm">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Usuario</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-primary-500">
                  <User className="h-5 w-5" />
                </span>
                <input
                  type="text"
                  placeholder="ej. admin"
                  value={form.username}
                  onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
                  required
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/60 py-3.5 pl-12 pr-4 text-slate-800 font-semibold placeholder:text-slate-400/80 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100/50 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Contraseña</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors duration-200 group-focus-within:text-primary-500">
                  <Lock className="h-5 w-5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  className="w-full rounded-2xl border border-slate-200/80 bg-slate-50/60 py-3.5 pl-12 pr-12 text-slate-800 font-semibold placeholder:text-slate-400/80 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100/50 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="mt-3 w-full rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 px-5 py-4 text-sm font-extrabold text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)] transition-all duration-300 hover:scale-[1.01] hover:brightness-105 active:scale-[0.99] cursor-pointer"
            >
              Entrar al sistema
            </button>
          </form>

          <p className="mt-8 text-center text-xs font-bold text-slate-400">© {new Date().getFullYear()} {appName}</p>
          <p className="mt-2 text-center text-xs font-semibold text-slate-400">
            Desarrollado por{" "}
            <a
              href="https://www.cowib.es"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary-600 hover:underline hover:text-indigo-600 transition-colors"
            >
              COWIB
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
