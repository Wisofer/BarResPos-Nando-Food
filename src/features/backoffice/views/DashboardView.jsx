import { CircleDollarSign, ClipboardList, Clock3, ShoppingBag, Sparkles, BarChart3, Activity, Zap, AlertTriangle, CheckCircle2, TrendingUp, Coins, CreditCard, ArrowUpRight, Database } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { backofficeApi } from "../services/backofficeApi.js";
import { BackofficePageShell, BackofficeStatCardsListSkeleton } from "../components/index.js";
import { formatCurrency } from "../utils/currency.js";
import { buildDashboardSalesSeries, dashboardTransaccionesHoy } from "../utils/dashboardResumen.js";

const icons = [ClipboardList, BarChart3, CircleDollarSign, Clock3];
const TOP_PRODUCTOS = 3;

function readKpi(dashboard, kpis, ...keys) {
  for (const k of keys) {
    const v = kpis?.[k] ?? dashboard?.[k];
    if (v !== undefined && v !== null) return v;
  }
  return undefined;
}

/**
 * Rellena/Autocompleta la serie temporal para asegurar que siempre dibuje los últimos 7 días.
 * Esto evita el desbalance visual cuando solo hay datos de un día.
 */
function padSalesSeriesToLast7Days(series) {
  const padded = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    
    // Formatear como dd/MM (e.g. 25/05)
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const label = `${day}/${month}`;
    
    // Buscar coincidencia inteligente en la serie original
    const match = (series || []).find((item) => {
      const itemName = String(item.name || item.key || "").trim();
      if (itemName === label) return true;
      if (itemName.replace(/^0/, "") === label.replace(/^0/, "")) return true;
      
      // Si viene formateada como YYYY-MM-DD
      if (itemName.includes("-")) {
        const parts = itemName.split("-");
        if (parts.length === 3) {
          const itemDay = parts[2].padStart(2, "0");
          const itemMonth = parts[1].padStart(2, "0");
          return `${itemDay}/${itemMonth}` === label;
        }
      }
      return false;
    });
    
    padded.push({
      key: label,
      name: label,
      total: match ? Number(match.total || 0) : 0,
    });
  }
  return padded;
}

export function DashboardView({ currencySymbol = "C$" }) {
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState([]);
  const [salesSeries, setSalesSeries] = useState([]);
  const [salesByCategory, setSalesByCategory] = useState([]); // eslint-disable-line no-unused-vars
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [stats, setStats] = useState([]);
  const [rangeLabel, setRangeLabel] = useState(""); // eslint-disable-line no-unused-vars
  const [monthRevenue, setMonthRevenue] = useState(0);
  const [weekRevenue, setWeekRevenue] = useState(0); // eslint-disable-line no-unused-vars

  // Estados específicos para métodos de pago
  const [todaySales, setTodaySales] = useState(0);
  const [todayCash, setTodayCash] = useState(0);

  useEffect(() => {
    let mounted = true;
    backofficeApi
      .dashboardResumen({ topProductos: TOP_PRODUCTOS })
      .then((dashboard) => {
        if (!mounted) return;
        const kpis = dashboard?.kpis || {};
        const topItems = dashboard?.topProductos || [];
        const serieItems = dashboard?.serieVentas || [];
        const categoriasItems = dashboard?.ventasPorCategoria || kpis?.ventasPorCategoria || [];
        const lowStockItems = dashboard?.productosStockBajoLista || [];
        const rango = dashboard?.rango || {};

        const totalVentasValor = Number(
          readKpi(dashboard, kpis, "totalVentasHoy", "TotalVentasHoy") ?? 0
        );
        const ticketPromedio = Number(
          readKpi(dashboard, kpis, "ticketPromedioHoy", "TicketPromedioHoy") ?? 0
        );
        const ventasHoyCount = dashboardTransaccionesHoy(dashboard);
        const totalCajaHoy = Number(
          readKpi(dashboard, kpis, "totalCajaHoy", "TotalCajaHoy") ?? 0
        );
        const ventasMes = Number(readKpi(dashboard, kpis, "ventasMes", "VentasMes") ?? 0);
        const ventasSemana = Number(readKpi(dashboard, kpis, "ventasSemana", "VentasSemana") ?? 0);

        const desdeLabel = String(rango?.desde ?? rango?.Desde ?? "").slice(0, 10);
        const hastaLabel = String(rango?.hasta ?? rango?.Hasta ?? "").slice(0, 10);
        setRangeLabel(desdeLabel && hastaLabel ? `${desdeLabel} - ${hastaLabel}` : "Rango por defecto");

        setTodaySales(totalVentasValor);
        setTodayCash(totalCajaHoy);

        setTopProducts(
          topItems.slice(0, TOP_PRODUCTOS).map((x) => ({
            name: x.producto || x.nombre || x.Producto || "Producto",
            sold: x.cantidad ?? x.Cantidad ?? 0,
            amount: formatCurrency(x.venta || x.Venta || x.total || 0, currencySymbol),
          }))
        );
        setSalesByCategory(
          categoriasItems.slice(0, 4).map((c) => ({
            name: c.nombreCategoria || c.NombreCategoria || "Categoría",
            total: formatCurrency(c.total ?? c.Total ?? 0, currencySymbol),
          }))
        );
        setLowStockProducts(
          lowStockItems.slice(0, 4).map((p) => ({
            name: p.nombre || p.Nombre || "Producto",
            stock: p.stock ?? p.Stock ?? 0,
            min: p.stockMinimo ?? p.StockMinimo ?? 0,
          }))
        );

        setSalesSeries(buildDashboardSalesSeries(serieItems, ventasMes));
        setStats([
          { title: "Ventas de Hoy", value: String(ventasHoyCount), detail: "Pedidos completados hoy" },
          {
            title: "Ingresos de Hoy",
            value: formatCurrency(totalVentasValor, currencySymbol),
            detail: `Efectivo en caja: ${formatCurrency(totalCajaHoy, currencySymbol)}`,
          },
          { title: "Ticket Promedio", value: formatCurrency(ticketPromedio, currencySymbol), detail: "Gasto medio por cliente" },
          { title: "Ventas del Mes", value: formatCurrency(ventasMes, currencySymbol), detail: "Total acumulado este mes" },
        ]);
        setMonthRevenue(ventasMes);
        setWeekRevenue(ventasSemana);
      })
      .catch(() => {
        if (!mounted) return;
        setStats([
          { title: "Ventas de Hoy", value: "0", detail: "Sin transacciones" },
          { title: "Ingresos de Hoy", value: formatCurrency(0, currencySymbol), detail: "Sin ingresos" },
          { title: "Ticket Promedio", value: formatCurrency(0, currencySymbol), detail: "Sin promedio" },
          { title: "Ventas del Mes", value: formatCurrency(0, currencySymbol), detail: "Sin ventas este mes" },
        ]);
        setSalesSeries([]);
        setSalesByCategory([]);
        setLowStockProducts([]);
        setMonthRevenue(0);
        setWeekRevenue(0);
        setTodaySales(0);
        setTodayCash(0);
        setRangeLabel("Sin datos");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [currencySymbol]);

  const safeProducts = useMemo(() => topProducts.slice(0, TOP_PRODUCTOS), [topProducts]);

  // Serie de ventas procesada y autocompletada
  const processedSeries = useMemo(() => {
    if (!salesSeries || salesSeries.length <= 1) {
      return padSalesSeriesToLast7Days(salesSeries || []);
    }
    const hasDailyLabels = salesSeries.some(item => {
      const name = String(item.name || "");
      return name.includes("/") || name.includes("-") || /^\d+$/.test(name);
    });
    if (hasDailyLabels && salesSeries.length < 7) {
      return padSalesSeriesToLast7Days(salesSeries);
    }
    return salesSeries;
  }, [salesSeries]);

  const totalIncomeSinceStart = useMemo(
    () => processedSeries.reduce((sum, point) => sum + Number(point.total || 0), 0),
    [processedSeries]
  );

  // Fórmulas para métodos de pago
  const cashAmount = Math.max(0, todayCash);
  const bankAmount = Math.max(0, todaySales - todayCash);
  const totalPaymentAmount = cashAmount + bankAmount;
  
  const cashPercent = totalPaymentAmount > 0 ? (cashAmount / totalPaymentAmount) * 100 : 0;

  const circleRadius = 56;
  const circumference = 2 * Math.PI * circleRadius;
  const cashStrokeDashoffset = circumference - (cashPercent / 100) * circumference;

  if (loading) {
    return <BackofficeStatCardsListSkeleton listRows={4} maxWidth="7xl" />;
  }

  return (
    <BackofficePageShell maxWidth="7xl" className="space-y-6">
      {/* 1. Bento Panel de Métricas KPI Integradas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, idx) => {
          const Icon = icons[idx];
          let progressColor = "bg-gradient-to-r from-emerald-500 to-teal-500";
          let iconBg = "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm shadow-emerald-500/20";
          let meterVal = 0;
          let meterMax = 1;
          let showMeter = false;

          if (idx === 0) {
            progressColor = "bg-gradient-to-r from-blue-500 to-indigo-500";
            iconBg = "bg-gradient-to-tr from-blue-500 to-indigo-400 text-white shadow-sm shadow-blue-500/20";
          } else if (idx === 1) {
            progressColor = "bg-gradient-to-r from-emerald-500 to-teal-500";
            iconBg = "bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-sm shadow-emerald-500/20";
            meterVal = todaySales;
            meterMax = 40000;
            showMeter = true;
          } else if (idx === 2) {
            progressColor = "bg-gradient-to-r from-amber-500 to-orange-500";
            iconBg = "bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-sm shadow-amber-500/20";
          } else if (idx === 3) {
            progressColor = "bg-gradient-to-r from-violet-500 to-fuchsia-500";
            iconBg = "bg-gradient-to-tr from-violet-500 to-fuchsia-400 text-white shadow-sm shadow-violet-500/20";
            meterVal = monthRevenue;
            meterMax = 500000;
            showMeter = true;
          }

          const percent = showMeter ? Math.round(Math.min(100, (meterVal / meterMax) * 100)) : 0;

          return (
            <article 
              key={item.title} 
              className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  {item.title}
                </span>
                <div className={`rounded-2xl p-2.5 transition-transform duration-300 group-hover:scale-110 shrink-0 ${iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div>
                <p className="text-2xl lg:text-xl xl:text-3xl font-black text-slate-800 tracking-tight leading-none whitespace-nowrap overflow-hidden text-ellipsis">
                  {item.value}
                </p>
                <p className="mt-1.5 text-xs font-semibold text-slate-400 truncate">
                  {item.detail}
                </p>
              </div>

              {/* Flex spacer to push the meter to the bottom and align all numbers horizontally */}
              <div className="flex-1"></div>

              {showMeter && (
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 mb-1">
                    <span>Rendimiento</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 flex border border-slate-200/25">
                    <div 
                      className={`h-full rounded-full ${progressColor}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {/* 2. Bento Grid Principal: Fila de Gráficos y Diales */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* BENTO BOX A: Glowing Area Chart (colspan 2) */}
        <section className="lg:col-span-2 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Rendimiento Comercial</p>
              <h2 className="text-lg font-extrabold text-slate-800 tracking-tight mt-0.5">Evolución de Ingresos</h2>
            </div>
            
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 p-1 border border-slate-100 shadow-inner">
              <button className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm border border-slate-100/50">
                Últimos 7 Días
              </button>
              <span className="text-[10px] font-bold text-slate-400 px-2 animate-pulse">
                En vivo
              </span>
            </div>
          </div>

          <div className="h-64 rounded-2xl border border-slate-50 bg-gradient-to-b from-slate-50/30 to-white p-2 shadow-inner">
            {processedSeries.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-400 font-semibold">Sin datos registrados</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={processedSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaSalesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f8fafc" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} axisLine={{ stroke: '#f1f5f9' }} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: "bold" }} axisLine={{ stroke: '#f1f5f9' }} tickLine={false} />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value || 0), currencySymbol)}
                    contentStyle={{ borderRadius: "1rem", border: "1px solid #f1f5f9", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.05)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#areaSalesFill)"
                    activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2, fill: '#6366f1' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="mt-3 flex items-center justify-between text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-3">
            <span>Historial semanal consolidado</span>
            <span className="text-indigo-600 font-extrabold flex items-center gap-0.5">
              Total facturado: {formatCurrency(totalIncomeSinceStart, currencySymbol)}
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </section>

        {/* BENTO BOX B: Live Cash Flow Circular Gauge (colspan 1) */}
        <section className="lg:col-span-1 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Distribución Financiera</p>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight mt-0.5">Cierre de Caja Diario</h2>
          </div>

          <div className="my-4 flex flex-col items-center justify-center">
            {totalPaymentAmount === 0 ? (
              <div className="flex h-44 w-full items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-xs text-slate-400 font-semibold">
                Sin transacciones cobradas hoy.
              </div>
            ) : (
              <div className="relative flex items-center justify-center">
                {/* SVG circular track */}
                <svg className="w-36 h-36 transform -rotate-90">
                  <circle cx="72" cy="72" r="56" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                  {/* Cash track */}
                  <circle 
                    cx="72" 
                    cy="72" 
                    r="56" 
                    stroke="#10b981" 
                    strokeWidth="10" 
                    fill="transparent" 
                    strokeDasharray={`${circumference}`}
                    strokeDashoffset={`${cashStrokeDashoffset}`}
                    style={{
                      transition: 'stroke-dashoffset 1s ease-in-out'
                    }}
                    strokeLinecap="round"
                  />
                </svg>
                
                {/* Inner center labels */}
                <div className="absolute text-center">
                  <p className="text-[9px] font-bold text-slate-400 uppercase leading-none">Caja total</p>
                  <p className="text-lg font-extrabold text-slate-800 mt-1 leading-none">
                    {formatCurrency(totalPaymentAmount, currencySymbol)}
                  </p>
                  <p className="text-[9px] font-extrabold text-emerald-600 mt-1.5 uppercase bg-emerald-50 px-2 py-0.5 rounded-full w-fit mx-auto border border-emerald-100/50 shadow-sm shadow-emerald-500/5">
                    {cashPercent.toFixed(0)}% Efectivo
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 border-t border-slate-50 pt-4 mt-2">
            <div className="flex items-center justify-between rounded-xl bg-slate-50/50 p-2.5 border border-slate-100 hover:border-emerald-200 hover:bg-white hover:shadow-sm transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-emerald-500 p-1.5 text-white shadow-sm shadow-emerald-500/20">
                  <Coins className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-600">Efectivo (Caja)</span>
              </div>
              <span className="text-xs font-extrabold text-slate-800">{formatCurrency(cashAmount, currencySymbol)}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-slate-50/50 p-2.5 border border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-sm transition-all duration-300">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-500 p-1.5 text-white shadow-sm shadow-blue-500/20">
                  <CreditCard className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-600">Tarjeta / Banco</span>
              </div>
              <span className="text-xs font-extrabold text-slate-800">{formatCurrency(bankAmount, currencySymbol)}</span>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Bento Grid Secundario: Módulos de Productos y Stock */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* BENTO BOX C: 3D Product Podium */}
        <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Productos Líderes</p>
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight mt-0.5">Podio de Ventas 3D</h2>
          </div>

          <div className="my-6 min-h-[170px] flex items-end justify-center gap-4 border-b border-slate-100 pb-1 pt-4">
            {safeProducts.length === 0 ? (
              <p className="text-xs text-slate-400 py-10 font-semibold">Sin datos de productos.</p>
            ) : (
              (() => {
                // Mapear productos para orden del podio: 2º lugar (izquierda), 1º lugar (centro), 3º lugar (derecha)
                const podiumItems = [];
                if (safeProducts[1]) podiumItems.push({ ...safeProducts[1], rank: 2, height: "h-24", color: "from-purple-500 to-purple-400 border-purple-500 text-purple-900", medal: "🥈" });
                if (safeProducts[0]) podiumItems.push({ ...safeProducts[0], rank: 1, height: "h-32", color: "from-amber-400/90 to-yellow-300/80 border-amber-300/40 text-amber-700", medal: "🏆" });
                if (safeProducts[2]) podiumItems.push({ ...safeProducts[2], rank: 3, height: "h-20", color: "from-orange-400/80 to-orange-300/70 border-orange-300/40 text-orange-700", medal: "🥉" });

                return podiumItems.map((item) => (
                  <div key={item.name} className="flex-1 flex flex-col items-center group/pod">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover/pod:opacity-100 transition-opacity duration-300 text-center mb-2 pointer-events-none">
                      <p className="text-[10px] font-extrabold text-slate-800 truncate max-w-[100px]">{item.name}</p>
                      <p className="text-[9px] text-indigo-600 font-extrabold">{item.amount}</p>
                    </div>
                    
                    {/* Medal */}
                    <span className="text-2xl mb-1 filter drop-shadow-sm transition-transform duration-300 group-hover/pod:scale-125 select-none">{item.medal}</span>
                    
                    {/* Column */}
                    <div className={`w-full ${item.height} rounded-t-2xl bg-gradient-to-t ${item.color} shadow-lg relative flex flex-col justify-end p-2 transition-all duration-500 group-hover/pod:-translate-y-1`}>
                      {/* Reflection shine */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-t-2xl pointer-events-none" />
                      
                      <div className="text-center text-white mix-blend-overlay">
                        <p className="text-[9px] font-bold uppercase tracking-wider">#{item.rank}</p>
                        <p className="text-xs font-black truncate max-w-[90px] mx-auto">{item.sold} U.</p>
                      </div>
                    </div>
                  </div>
                ));
              })()
            )}
          </div>
          
          <div className="space-y-1 mt-2">
            {safeProducts.map((p, idx) => (
              <div key={p.name} className="flex items-center justify-between text-xs py-1.5 hover:bg-slate-50 rounded-lg px-2 transition-colors">
                <span className="text-slate-500 font-medium">{idx + 1}º {p.name}</span>
                <span className="font-extrabold text-slate-700">{p.amount}</span>
              </div>
            ))}
          </div>
        </section>

        {/* BENTO BOX D: Smart Stock Alert Center */}
        {(() => {
          const countLowStock = lowStockProducts.length;
          const hasAlerts = countLowStock > 0;
          const cardBg = hasAlerts 
            ? "border-amber-100 hover:border-amber-200" 
            : "border-slate-100 hover:border-emerald-100";
          const statusText = hasAlerts ? "Acción Requerida" : "Nivel Óptimo";

          return (
            <section className={`rounded-3xl border bg-white p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between ${cardBg}`}>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Control de Inventario</p>
                <div className="flex items-center justify-between mt-0.5">
                  <h2 className="text-lg font-extrabold text-slate-800 tracking-tight">Smart Inventory Shield</h2>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border uppercase ${hasAlerts ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                    {statusText}
                  </span>
                </div>
              </div>

              <div className="my-4 flex flex-col items-center justify-center gap-2">
                <div className={`h-16 w-16 rounded-full bg-slate-50 flex items-center justify-center shadow-md relative ${hasAlerts ? 'animate-bounce' : ''}`}>
                  {hasAlerts ? (
                    <>
                      <span className="absolute animate-ping inline-flex h-full w-full rounded-full bg-amber-400 opacity-20"></span>
                      <AlertTriangle className="h-8 w-8 text-amber-500" />
                    </>
                  ) : (
                    <CheckCircle2 className="h-8 w-8 text-emerald-500 animate-pulse" />
                  )}
                </div>
                
                {lowStockProducts.length === 0 ? (
                  <div className="text-center py-2">
                    <p className="text-xs font-bold text-slate-700">Todo el inventario está seguro</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Nivel de insumos óptimo en cocina y bar.</p>
                  </div>
                ) : (
                  <div className="w-full space-y-2 mt-2">
                    {lowStockProducts.map((p) => (
                      <div 
                        key={p.name} 
                        className="flex items-center justify-between text-xs rounded-xl border border-slate-50 bg-slate-50/50 p-2.5 hover:bg-slate-100/50 transition-colors"
                      >
                        <span className="font-bold text-slate-600 truncate max-w-[150px]">{p.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold text-slate-400">Stock: {p.stock}</span>
                          <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-800">
                            Min {p.min}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="text-[10px] font-bold text-slate-400 border-t border-slate-50 pt-3">
                {hasAlerts ? `Atención: ${countLowStock} producto(s) crítico(s)` : "Sincronizado con base de datos"}
              </div>
            </section>
          );
        })()}
      </div>
    </BackofficePageShell>
  );
}
