import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChefHat, RefreshCw, Search, History, LayoutGrid, Clock } from "lucide-react";
import { backofficeApi } from "../services/backofficeApi.js";
import { BackofficeListSkeletonLoading } from "../components/index.js";
import { useSnackbar } from "../../../contexts/SnackbarContext.jsx";
import { opcionesResumenSoloTextoOpcion } from "../utils/productoOpciones.js";

const resolveMesaNombre = (o) => {
  const mesaRaw = o?.mesa ?? o?.Mesa ?? o?.mesaNombre;
  const origen = o?.origenPedido ?? o?.OrigenPedido;
  
  if (origen && origen.toLowerCase() === "delivery") {
    return "Delivery 🛵";
  }
  if (origen && origen.toLowerCase() === "para llevar") {
    return "Para Llevar 🛍️";
  }
  if (!mesaRaw || mesaRaw === "S/M") {
    return origen || "S/M";
  }
  return mesaRaw;
};

const getKdsCards = (orders) => {
  const cards = [];
  orders.forEach((o) => {
    const orderId = o?.id ?? o?.Id;
    const allItems = Array.isArray(o?.items ?? o?.Items) ? (o?.items ?? o?.Items) : [];

    const batches = {};
    allItems.forEach((item) => {
      const rawTime = item?.fechaEnvioCocina ?? item?.FechaEnvioCocina ?? o?.fechaCreacion ?? o?.FechaCreacion ?? "unknown";
      const batchKey = typeof rawTime === "string" ? rawTime : new Date(rawTime).toISOString();
      if (!batches[batchKey]) batches[batchKey] = [];
      batches[batchKey].push(item);
    });

    Object.entries(batches).forEach(([batchKey, batchItems]) => {
      const activeItems = batchItems.filter((it) => {
        const est = it?.estado ?? it?.Estado ?? "Pendiente";
        return est === "Pendiente" || est === "En Preparación";
      });

      const readyItems = batchItems.filter((it) => {
        const est = it?.estado ?? it?.Estado ?? "Pendiente";
        return est === "Listo";
      });

      if (activeItems.length > 0) {
        cards.push({
          id: `${orderId}-preparar-${batchKey}`,
          orderId,
          numero: o?.numero ?? o?.Numero ?? `#${orderId}`,
          mesa: resolveMesaNombre(o),
          mesaOrigen: o?.mesaOrigen ?? o?.MesaOrigen ?? null,
          mesero: o?.mesero ?? o?.Mesero ?? "",
          fechaCreacion: batchKey !== "unknown" ? batchKey : o?.fechaCreacion ?? o?.FechaCreacion,
          estadoCocina: "En Preparación",
          items: activeItems,
          originalOrder: o
        });
      }

      if (readyItems.length > 0) {
        cards.push({
          id: `${orderId}-listo-${batchKey}`,
          orderId,
          numero: o?.numero ?? o?.Numero ?? `#${orderId}`,
          mesa: resolveMesaNombre(o),
          mesaOrigen: o?.mesaOrigen ?? o?.MesaOrigen ?? null,
          mesero: o?.mesero ?? o?.Mesero ?? "",
          fechaCreacion: batchKey !== "unknown" ? batchKey : o?.fechaCreacion ?? o?.FechaCreacion,
          estadoCocina: "Listo",
          items: readyItems,
          originalOrder: o
        });
      }
    });
  });
  cards.sort((a, b) => new Date(a.fechaCreacion).getTime() - new Date(b.fechaCreacion).getTime());
  return cards;
};

function stateStyle(state) {
  return "bg-white border border-slate-200/80 shadow-[0_2px_12px_rgb(0,0,0,0.04)]";
}

function stateTopBorder(state) {
  if (state === "Pendiente") return "border-t-[4px] border-t-amber-400";
  if (state === "En Preparación") return "border-t-[4px] border-t-blue-500";
  if (state === "Listo") return "border-t-[4px] border-t-emerald-500";
  return "border-t-[4px] border-t-slate-400";
}

function stateBadge(state) {
  if (state === "Pendiente") return "text-amber-700 bg-amber-100 border border-amber-200";
  if (state === "En Preparación") return "text-blue-700 bg-blue-100 border border-blue-200";
  if (state === "Listo") return "text-emerald-700 bg-emerald-100 border border-emerald-200";
  return "text-slate-700 bg-slate-200 border border-slate-300";
}

function stateButton(state) {
  if (state === "Pendiente") return "bg-amber-500 hover:bg-amber-600 text-white shadow-sm shadow-amber-300/50";
  if (state === "En Preparación") return "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-300/50";
  if (state === "Listo") return "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-300/50";
  return "bg-slate-600 hover:bg-slate-700 text-white";
}

function nextState(state) {
  if (state === "Pendiente") return "En Preparación";
  if (state === "En Preparación") return "Listo";
  if (state === "Listo") return "Entregado";
  return null;
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleString("es-NI", { dateStyle: "short", timeStyle: "short" });
}

function OrderTimer({ date }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!date) return;
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return;
    const calculate = () => {
      const diffMs = Date.now() - d.getTime();
      setElapsed(Math.max(0, Math.floor(diffMs / 60000)));
    };
    calculate();
    const interval = setInterval(calculate, 15000);
    return () => clearInterval(interval);
  }, [date]);

  const isDelayed = elapsed >= 15;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border transition ${
        isDelayed
          ? "bg-rose-50 border-rose-200 text-rose-600 animate-pulse"
          : "bg-white/60 border-slate-200 text-slate-500"
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {isDelayed && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isDelayed ? "bg-rose-500" : "bg-slate-400"}`} />
      </span>
      {elapsed} min
    </span>
  );
}

export function KitchenView() {
  const snackbar = useSnackbar();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("live");

  const isMounted = useRef(true);
  const fetchSeqRef = useRef(0);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const toggleItemCheck = async (order, item, e) => {
    e.stopPropagation();
    const orderId = order?.orderId ?? order?.id ?? order?.Id;
    const itemId = item?.id ?? item?.Id;
    if (!orderId || !itemId) return;
    const currentItemState = item?.Estado ?? item?.estado ?? "Pendiente";
    const nextStateVal = currentItemState === "Listo" ? "Pendiente" : "Listo";
    try {
      await backofficeApi.cocinaItemEstado(itemId, nextStateVal);
      await loadKitchen();
    } catch (err) {
      snackbar.error(err.message || "Error al cambiar estado del producto.");
    }
  };

  const loadKitchen = useCallback(async () => {
    const seq = ++fetchSeqRef.current;
    try {
      const data = await backofficeApi.cocinaOrdenes();
      if (seq !== fetchSeqRef.current) return;
      const items = Array.isArray(data) ? data : data?.items || [];
      if (isMounted.current) setOrders(items);
    } catch (err) {
      if (seq !== fetchSeqRef.current) return;
      if (isMounted.current) setError(err.message || "No se pudo cargar cocina.");
    } finally {
      if (seq === fetchSeqRef.current && isMounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let timer = null;
    const startPolling = () => {
      if (timer) clearInterval(timer);
      const intervalMs = document.hidden ? 15000 : 3000;
      timer = setInterval(() => { loadKitchen().catch(() => { }); }, intervalMs);
    };
    (async () => {
      await loadKitchen();
      if (!mounted) return;
      startPolling();
    })();
    const handleVisibilityChange = () => {
      if (!mounted) return;
      startPolling();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      mounted = false;
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (timer) clearInterval(timer);
    };
  }, [loadKitchen]);

  const patchState = async (card) => {
    const orderId = card?.orderId;
    const current = card?.estadoCocina;
    const next = nextState(current);
    if (!orderId || !next) return;
    setBusyId(card.id);
    setError("");
    try {
      if (current === "En Preparación") {
        const batchItems = card.items.map(item => ({ id: item.id ?? item.Id, estado: "Listo" }));
        await backofficeApi.cocinaItemsEstado(batchItems);
        snackbar.success(`Comanda de ${card.mesa} marcada como lista`);
      } else if (current === "Listo") {
        const batchItems = card.items.map(item => ({ id: item.id ?? item.Id, estado: "Entregado" }));
        await backofficeApi.cocinaItemsEstado(batchItems);
        snackbar.success(`Comanda de ${card.mesa} entregada`);
      }
      await loadKitchen();
    } catch (err) {
      const msg = err?.message || "No se pudo actualizar estado.";
      if (isMounted.current) snackbar.error(msg);
    } finally {
      if (isMounted.current) setBusyId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = orders.filter((o) => {
      const state = o?.estadoCocina ?? o?.EstadoCocina ?? "Pendiente";
      if (mode === "history" && state !== "Entregado") return false;
      if (mode === "live" && state === "Entregado") return false;
      if (!q) return true;
      const text = `${o?.numero || o?.id || ""} ${o?.mesa || o?.mesaNombre || ""}`.toLowerCase();
      return text.includes(q);
    });
    if (mode === "history") {
      list.sort((a, b) => new Date(b?.fechaCreacion ?? b?.FechaCreacion ?? 0).getTime() - new Date(a?.fechaCreacion ?? a?.FechaCreacion ?? 0).getTime());
    }
    return list;
  }, [orders, search, mode]);

  const liveCards = useMemo(() => {
    if (mode !== "live") return [];
    return getKdsCards(filtered);
  }, [filtered, mode]);

  if (loading) return <BackofficeListSkeletonLoading rows={6} />;

  return (
    <div className="min-w-0 flex flex-col h-[calc(100vh-80px)]">
      {error && <div className="shrink-0 mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <section className="shrink-0 mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">KDS <span className="font-medium text-slate-400">/ Cocina</span></h2>
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar mesa o # orden..."
                className="w-full rounded-xl border border-slate-300 bg-slate-50 pl-9 pr-3 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition outline-none"
              />
            </div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setMode("live")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${mode === "live" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-800"}`}
              >
                <LayoutGrid className="h-4 w-4" /> En vivo
              </button>
              <button
                type="button"
                onClick={() => setMode("history")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${mode === "history" ? "bg-white text-slate-800 shadow" : "text-slate-500 hover:text-slate-800"}`}
              >
                <History className="h-4 w-4" /> Historial
              </button>
            </div>
            <button
              type="button"
              onClick={() => loadKitchen()}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-xl border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {mode === "live" ? (
        <section className="flex-1 min-h-0 overflow-y-auto">
          {liveCards.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white/50 rounded-2xl border border-dashed border-slate-200">
              <ChefHat className="h-16 w-16 mb-4 opacity-30" />
              <h3 className="text-lg font-semibold text-slate-600">Cocina despejada</h3>
              <p className="text-sm">No hay órdenes pendientes en este momento.</p>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-max pb-10">
              {liveCards.map((c) => {
                const isBusy = busyId === c.id;
                const current = c.estadoCocina;
                const next = nextState(current);

                return (
                  <article
                    key={c.id}
                    className={`relative flex flex-col rounded-2xl overflow-hidden select-none transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${stateStyle(current)} ${stateTopBorder(current)} ${isBusy ? "opacity-50 pointer-events-none" : ""}`}
                  >
                    {/* Card Body */}
                    <div className="p-4 flex-1">
                      {/* Header: Mesa + State Badge */}
                      <div className="flex items-start justify-between mb-1.5">
                        <div className="min-w-0 flex-1">
                          <p className="text-[18px] font-extrabold text-slate-800 tracking-tight leading-none truncate">{c.mesa}</p>
                          {c.mesaOrigen && c.mesaOrigen !== c.mesa && (
                            <p className="text-[10px] font-semibold text-orange-500 mt-1 flex items-center gap-1">
                              🔀 De: {c.mesaOrigen}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${stateBadge(current)}`}>
                            {current}
                          </span>
                          <OrderTimer date={c.fechaCreacion} />
                        </div>
                      </div>

                      {/* Sub-header: Orden + Mesero */}
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium mb-3 pb-3 border-b border-black/5">
                        <span className="font-semibold text-slate-700 shrink-0">{c.numero}</span>
                        <span className="text-slate-300 shrink-0">•</span>
                        {c.mesero && <span className="truncate">{c.mesero}</span>}
                      </div>

                      {/* Products List */}
                      <ul className="space-y-0.5">
                        {c.items.map((it, idx) => {
                          const itemId = it?.Id ?? it?.id ?? `${c.id}-${idx}`;
                          const qty = Number(it?.Cantidad ?? it?.cantidad ?? 0);
                          const producto = it?.Producto ?? it?.producto ?? "Producto";
                          const opts = opcionesResumenSoloTextoOpcion(it?.opcionesResumen ?? it?.OpcionesResumen ?? "");
                          const notas = it?.Notas ?? it?.notas ?? "";
                          const isChecked = (it?.Estado ?? it?.estado ?? "") === "Listo";

                          return (
                            <li
                              key={itemId}
                              onClick={(e) => toggleItemCheck(c, it, e)}
                              className={`flex items-start gap-2.5 rounded-xl border p-2 cursor-pointer transition-all duration-200 select-none min-h-[40px] ${
                                isChecked
                                  ? "border-emerald-200/60 bg-emerald-50/60 opacity-70"
                                  : "border-black/5 bg-white/60 hover:bg-white hover:shadow-sm"
                              }`}
                            >
                              <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                                isChecked
                                  ? "border-emerald-500 bg-emerald-500 text-white"
                                  : "border-slate-300 bg-white"
                              }`}>
                                {isChecked && (
                                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </span>
                              <div className="min-w-0 flex-1">
                                <p className={`text-[13px] font-semibold leading-tight transition-all duration-300 ${
                                  isChecked ? "line-through text-slate-400" : "text-slate-800"
                                }`}>
                                  {qty > 0 && <span className={`font-extrabold mr-1 ${
                                    isChecked ? "text-slate-400" : (current === "En Preparación" ? "text-blue-600" : current === "Listo" ? "text-emerald-600" : "text-amber-600")
                                  }`}>{qty}x</span>}
                                  {producto}
                                </p>
                                {opts && (
                                  <p className={`mt-0.5 text-[11px] font-semibold ${
                                    isChecked ? "line-through text-slate-400 opacity-60" : "text-indigo-600"
                                  }`}>{opts}</p>
                                )}
                                {notas && (
                                  <p className="mt-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200/60 inline-block">Nota: {notas}</p>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    {/* Action Button */}
                    {next ? (
                      <div className="px-4 pb-4">
                        <button
                          type="button"
                          onClick={() => patchState(c)}
                          disabled={isBusy}
                          className={`mt-1 w-full min-h-[44px] rounded-xl px-4 py-2.5 text-[13px] font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer ${stateButton(current)}`}
                        >
                          {current === "Pendiente" && <ChefHat className="h-4 w-4" />}
                          {current === "En Preparación" && <CheckCircle2 className="h-4 w-4" />}
                          {current === "Listo" && (
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                          )}
                          {isBusy ? "Procesando..." : `Marcar ${next}`}
                        </button>
                      </div>
                    ) : (
                      <div className="px-4 pb-4">
                        <div className="mt-1 rounded-xl bg-violet-100 border border-violet-200 px-3 py-2.5 text-center text-[12px] font-bold text-violet-700">
                          ✓ Orden entregada
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      ) : (
        <section className="flex-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-y-auto">
          {filtered.length === 0 && <p className="text-center text-sm text-slate-500 mt-10">No hay órdenes entregadas para mostrar.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((o, i) => {
              const id = o?.id ?? o?.Id ?? i;
              const numero = o?.numero ?? o?.Numero ?? `#${id}`;
              const mesa = resolveMesaNombre(o);
              const items = Array.isArray(o?.Items ?? o?.items) ? (o?.Items ?? o?.items) : [];
              return (
                <article key={id} className="relative flex flex-col rounded-2xl overflow-hidden bg-white border border-slate-200/80 shadow-[0_2px_12px_rgb(0,0,0,0.04)] border-t-[4px] border-t-slate-400">
                  {/* Card Body */}
                  <div className="p-4 flex-1">
                    {/* Header: Mesa + State Badge */}
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-[18px] font-extrabold text-slate-800 tracking-tight leading-none truncate">{mesa}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 border border-slate-200 shrink-0">
                        Entregado
                      </span>
                    </div>

                    {/* Sub-header: Orden + Fecha */}
                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500 font-medium mb-3 pb-3 border-b border-black/5">
                      <span className="font-semibold text-slate-700 shrink-0">{numero}</span>
                      <span className="text-slate-300 shrink-0">•</span>
                      <span className="shrink-0">{formatDate(o?.fechaCreacion ?? o?.FechaCreacion)}</span>
                      {o?.mesero && (
                        <>
                          <span className="text-slate-300 shrink-0">•</span>
                          <span className="truncate">{o.mesero}</span>
                        </>
                      )}
                    </div>

                    {/* Products Container */}
                    <div className="rounded-xl border border-black/5 bg-slate-50/50 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Productos</p>
                      {items.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Sin items.</p>
                      ) : (
                        <ul className="space-y-1">
                          {items.map((it, idx) => {
                            const qty = Number(it?.Cantidad ?? it?.cantidad ?? 0);
                            const producto = it?.Producto ?? it?.producto ?? "Producto";
                            const rawOpciones = it?.opcionesResumen ?? it?.OpcionesResumen ?? "";
                            const opcionesTexto = opcionesResumenSoloTextoOpcion(rawOpciones);
                            return (
                              <li key={idx} className="flex items-start gap-2 text-xs font-medium text-slate-500 line-through opacity-85">
                                <span className="text-emerald-500 shrink-0 mt-0.5">✓</span>
                                <div className="min-w-0 flex-1">
                                  <span>
                                    {qty > 0 && <span className="font-bold mr-1">{qty}x</span>}
                                    {producto}
                                  </span>
                                  {opcionesTexto && (
                                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">({opcionesTexto})</p>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Bottom static banner */}
                  <div className="px-4 pb-4">
                    <div className="mt-1 rounded-xl bg-slate-100 border border-slate-200 px-3 py-2 text-center text-[12px] font-bold text-slate-600">
                      ✓ Orden finalizada
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
