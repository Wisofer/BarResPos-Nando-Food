import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, ChefHat, RefreshCw, Send } from "lucide-react";
import { backofficeApi } from "../services/backofficeApi.js";
import { BackofficeListSkeletonLoading } from "../components/index.js";
import { useSnackbar } from "../../../contexts/SnackbarContext.jsx";
import { opcionesResumenSoloTextoOpcion } from "../utils/productoOpciones.js";

const KDS_SECTIONS = [
  { key: "por_preparar", label: "Por preparar", states: ["Pendiente", "En Preparación"] },
  { key: "listo", label: "Listo para entregar", states: ["Listo"] },
];

const getKdsCards = (orders) => {
  const cards = [];
  orders.forEach((o) => {
    const orderId = o?.id ?? o?.Id;
    const allItems = Array.isArray(o?.items ?? o?.Items) ? (o?.items ?? o?.Items) : [];
    
    // Group items by FechaEnvioCocina (fallback to fechaCreacion if null)
    const batches = {};
    allItems.forEach((item) => {
      const rawTime = item?.fechaEnvioCocina ?? item?.FechaEnvioCocina ?? o?.fechaCreacion ?? o?.FechaCreacion ?? "unknown";
      const batchKey = typeof rawTime === "string" ? rawTime : new Date(rawTime).toISOString();
      if (!batches[batchKey]) {
        batches[batchKey] = [];
      }
      batches[batchKey].push(item);
    });

    // Generate separate cards for each batch depending on item status
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
          mesa: o?.mesa ?? o?.mesaNombre ?? o?.Mesa ?? "Mesa",
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
          mesa: o?.mesa ?? o?.mesaNombre ?? o?.Mesa ?? "Mesa",
          fechaCreacion: batchKey !== "unknown" ? batchKey : o?.fechaCreacion ?? o?.FechaCreacion,
          estadoCocina: "Listo",
          items: readyItems,
          originalOrder: o
        });
      }
    });
  });
  return cards;
};

function stateStyle(state) {
  if (state === "Pendiente") return "border-amber-200 bg-amber-50 text-amber-800";
  if (state === "En Preparación") return "border-blue-200 bg-blue-50 text-blue-800";
  if (state === "Listo") return "border-emerald-200 bg-emerald-50 text-emerald-800";
  return "border-violet-200 bg-violet-50 text-violet-800";
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
          : "bg-slate-100 border-slate-200 text-slate-600"
      }`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {isDelayed && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${isDelayed ? "bg-rose-500" : "bg-slate-400"}`}></span>
      </span>
      <span>{elapsed} min</span>
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
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const toggleItemCheck = async (order, item) => {
    const orderId = order?.orderId ?? order?.id ?? order?.Id;
    const itemId = item?.id ?? item?.Id;
    if (!orderId || !itemId) return;
    const currentItemState = item?.Estado ?? item?.estado ?? "Pendiente";
    const nextStateVal = currentItemState === "Listo" ? "Pendiente" : "Listo";
    try {
      await backofficeApi.cocinaItemEstado(itemId, nextStateVal);
      await loadKitchen();
    } catch (e) {
      snackbar.error(e.message || "Error al cambiar estado del producto.");
    }
  };

  const loadKitchen = useCallback(async () => {
    try {
      const data = await backofficeApi.cocinaOrdenes();
      const items = Array.isArray(data) ? data : data?.items || [];
      if (isMounted.current) {
        setOrders(items);
      }
    } catch (e) {
      if (isMounted.current) {
        setError(e.message || "No se pudo cargar cocina.");
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [isMounted]);

  useEffect(() => {
    let mounted = true;
    let timer = null;

    const startPolling = () => {
      if (timer) clearInterval(timer);
      const intervalMs = document.hidden ? 15000 : 3000;
      timer = setInterval(() => {
        loadKitchen().catch(() => {});
      }, intervalMs);
    };

    (async () => {
      await loadKitchen();
      if (!mounted) return;
      startPolling();
    })();

    const handleVisibilityChange = () => {
      if (!mounted) return;
      // Reconfigura el intervalo según si la pestaña está visible o no.
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
        // Marcar todos los ítems de esta comanda como "Listo"
        await Promise.all(
          card.items.map(item => backofficeApi.cocinaItemEstado(item.id ?? item.Id, "Listo"))
        );
        snackbar.success(`Comanda de mesa ${card.mesa} marcada como lista`);
      } else if (current === "Listo") {
        // Marcar todos los ítems de esta comanda como "Entregado"
        await Promise.all(
          card.items.map(item => backofficeApi.cocinaItemEstado(item.id ?? item.Id, "Entregado"))
        );
        snackbar.success(`Comanda de mesa ${card.mesa} marcada como entregada`);
      }
      await loadKitchen();
    } catch (e) {
      const msg = e?.message || "No se pudo actualizar estado de la comanda.";
      if (isMounted.current) {
        snackbar.error(msg);
      }
    } finally {
      if (isMounted.current) {
        setBusyId(null);
      }
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = orders.filter((o) => {
      const state = o?.estadoCocina ?? o?.EstadoCocina ?? "Pendiente";
      if (mode === "history") {
        if (state !== "Entregado") return false;
      } else if (state === "Entregado") {
        return false;
      }
      if (!q) return true;
      const text = `${o?.numero || o?.id || ""} ${o?.mesa || o?.mesaNombre || ""}`.toLowerCase();
      return text.includes(q);
    });
    if (mode === "history") {
      list.sort((a, b) => {
        const da = new Date(a?.fechaCreacion ?? a?.FechaCreacion ?? 0).getTime();
        const db = new Date(b?.fechaCreacion ?? b?.FechaCreacion ?? 0).getTime();
        return db - da;
      });
    }
    return list;
  }, [orders, search, mode]);

  const liveCards = useMemo(() => {
    if (mode !== "live") return [];
    return getKdsCards(filtered);
  }, [filtered, mode]);

  const grouped = useMemo(() => {
    const base = Object.fromEntries(KDS_SECTIONS.map((s) => [s.key, []]));
    liveCards.forEach((c) => {
      const state = c.estadoCocina;
      const section = KDS_SECTIONS.find((s) => s.states.includes(state));
      if (!section) return;
      base[section.key].push(c);
    });
    return base;
  }, [liveCards]);

  if (loading) return <BackofficeListSkeletonLoading rows={6} />;
  return (
    <div className="min-w-0 space-y-4">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">Cocina (KDS)</h2>
            <p className="text-xs text-slate-500">
              Solo aparecen ítems de categorías marcadas para cocina; bebidas u otras categorías “solo barra” no se listan aquí.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadKitchen()}
            className="inline-flex min-h-[44px] items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizar
          </button>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por orden o mesa"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setMode("live")}
              className={`min-h-[44px] rounded-full px-3 py-1 text-xs font-semibold ${mode === "live" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Cocina en vivo
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("history");
              }}
              className={`min-h-[44px] rounded-full px-3 py-1 text-xs font-semibold ${mode === "history" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"}`}
            >
              Historial
            </button>
          </div>
        </div>
      </section>

      {mode === "live" ? (
      <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {KDS_SECTIONS.map((section) => (
          <article key={section.key} className="min-h-[400px] rounded-[24px] border border-slate-200/80 bg-slate-50/40 p-4 shadow-inner">
            <div className="mb-4 flex items-center justify-between px-1">
              <span className={`rounded-xl border px-3 py-1 text-xs font-bold ${stateStyle(section.states[0])}`}>{section.label}</span>
              <span className="rounded-full bg-slate-200/80 px-2 py-0.5 text-xs font-bold text-slate-600 tabular-nums">
                {grouped[section.key]?.length || 0}
              </span>
            </div>
            <div className="space-y-3">
              {(grouped[section.key] || []).length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 py-10 px-4 text-center">
                  <ChefHat className="h-8 w-8 text-slate-300 animate-pulse" />
                  <p className="mt-2 text-xs font-medium text-slate-400">Sin órdenes en esta sección</p>
                </div>
              )}
              {(grouped[section.key] || []).map((o, i) => {
                const id = o?.id ?? o?.Id ?? i;
                const numero = o?.numero || o?.Numero || `#${id}`;
                const mesa = o?.mesa || o?.mesaNombre || o?.Mesa || "Mesa";
                const createdAt = o?.fechaCreacion ?? o?.FechaCreacion;
                const current = o?.estadoCocina ?? o?.EstadoCocina ?? "Pendiente";
                const rawItems = o?.Items ?? o?.items ?? [];
                const items = Array.isArray(rawItems) ? rawItems : [];
                const next = nextState(current);

                const borderTopClass = current === "Pendiente" 
                  ? "border-t-[5px] border-t-amber-400" 
                  : current === "En Preparación" 
                    ? "border-t-[5px] border-t-blue-500" 
                    : "border-t-[5px] border-t-emerald-500";

                const buttonStyleClass = current === "Pendiente"
                  ? "bg-amber-500 hover:bg-amber-600 shadow-sm shadow-amber-200/40 text-white"
                  : current === "En Preparación"
                    ? "bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200/40 text-white"
                    : "bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-200/40 text-white";

                return (
                  <div key={id} className={`relative rounded-2xl bg-white border border-slate-200/60 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 ${borderTopClass}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-extrabold text-slate-800 tracking-tight">{numero}</p>
                      <div className="flex items-center gap-1.5">
                        <OrderTimer date={createdAt} />
                        <span className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold ${stateStyle(current)}`}>
                          {current}
                        </span>
                      </div>
                    </div>

                    <div className="mt-1 flex items-center justify-between">
                      <p className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <span>📍</span>
                        <span>{mesa}</span>
                      </p>
                      <p className="text-[10px] font-medium text-slate-400">{formatDate(createdAt)}</p>
                    </div>

                    <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Productos</p>
                      {items.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Sin items en la orden.</p>
                      ) : (
                        <ul className="space-y-1.5">
                          {items.map((it, idx) => {
                            const itemId = it?.Id ?? it?.id ?? `${id}-${idx}`;
                            const qty = Number(it?.Cantidad ?? it?.cantidad ?? 0);
                            const producto = it?.Producto ?? it?.producto ?? "Producto";
                            const rawOpciones = it?.opcionesResumen ?? it?.OpcionesResumen ?? "";
                            const opcionesTexto = opcionesResumenSoloTextoOpcion(rawOpciones);
                            const notas = it?.Notas ?? it?.notas ?? "";
                            const isChecked = (it?.Estado ?? it?.estado ?? "") === "Listo";

                            return (
                              <li
                                key={itemId}
                                onClick={() => toggleItemCheck(o, it)}
                                className={`flex items-start gap-2.5 rounded-xl border p-2 cursor-pointer transition select-none min-h-[44px] ${
                                  isChecked
                                    ? "border-emerald-100 bg-emerald-50/40 text-slate-400"
                                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                                }`}
                              >
                                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                                  isChecked
                                    ? "border-emerald-500 bg-emerald-500 text-white"
                                    : "border-slate-300 bg-white"
                                }`}>
                                  {isChecked && (
                                    <svg className="h-3 w-3 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  )}
                                </span>
                                <div className="min-w-0 flex-1">
                                  <p className={`text-xs font-semibold leading-tight ${isChecked ? "line-through opacity-60 text-slate-400" : "text-slate-800"}`}>
                                    {qty > 0 && <span className="text-indigo-600 font-extrabold mr-1.5">{qty}x</span>}
                                    {producto}
                                  </p>
                                  {opcionesTexto ? (
                                    <p className={`mt-0.5 text-[11px] font-bold text-indigo-600 ${isChecked ? "line-through opacity-50 text-indigo-400" : ""}`}>
                                      {opcionesTexto}
                                    </p>
                                  ) : null}
                                  {notas ? (
                                    <p className="mt-0.5 text-[10px] text-amber-600 font-medium">Nota: {notas}</p>
                                  ) : null}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </div>

                    {next ? (
                      <div className="space-y-1">
                        <button
                          type="button"
                          onClick={() => patchState(o)}
                          disabled={busyId === id}
                          className={`mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition active:scale-95 disabled:opacity-50 cursor-pointer ${buttonStyleClass}`}
                        >
                          {current === "Pendiente" && <ChefHat className="h-3.5 w-3.5" />}
                          {current === "En Preparación" && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {current === "Listo" && <Send className="h-3.5 w-3.5" />}
                          {busyId === id ? "Procesando..." : `Marcar ${next}`}
                        </button>
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl bg-violet-50 border border-violet-100 px-3 py-2 text-center text-xs font-bold text-violet-700">
                        ✓ Orden entregada
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </section>
      ) : (
        <section className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="space-y-2 md:hidden">
            {filtered.length === 0 && <p className="rounded-lg border border-slate-200 px-3 py-5 text-center text-sm text-slate-500">No hay órdenes entregadas para mostrar.</p>}
            {filtered.map((o, i) => {
              const id = o?.id ?? o?.Id ?? i;
              const numero = o?.numero ?? o?.Numero ?? `#${id}`;
              const mesa = o?.mesa || o?.Mesa || "S/M";
              const estado = o?.estadoCocina ?? o?.EstadoCocina ?? "Entregado";
              const fecha = o?.fechaCreacion ?? o?.FechaCreacion;
              const itemsRaw = o?.Items ?? o?.items ?? [];
              const items = Array.isArray(itemsRaw) ? itemsRaw : [];
              return (
                <article key={id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{numero}</p>
                    <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-700">{estado}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{mesa}</p>
                  <p className="text-xs text-slate-500">{formatDate(fecha)}</p>
                  <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2">
                    <p className="text-[11px] font-semibold text-slate-700">Productos</p>
                    {items.length === 0 ? (
                      <p className="mt-1 text-[11px] text-slate-400">Sin productos</p>
                    ) : (
                      <ul className="mt-1 space-y-1">
                        {items.map((it, idx) => {
                          const itemId = it?.Id ?? it?.id ?? `${id}-${idx}`;
                          const qty = Number(it?.Cantidad ?? it?.cantidad ?? 0);
                          const producto = it?.Producto ?? it?.producto ?? "Producto";
                          const rawOpciones = it?.opcionesResumen ?? it?.OpcionesResumen ?? "";
                          const opcionesTexto = opcionesResumenSoloTextoOpcion(rawOpciones);
                          return (
                            <li key={itemId} className="text-[11px] text-slate-700">
                              {qty > 0 ? `${qty}x ` : ""}{producto}
                              {opcionesTexto ? <span className="ml-1 text-[10px] font-bold text-indigo-600">({opcionesTexto})</span> : null}
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">Orden</th>
                  <th className="px-4 py-3 font-semibold">Mesa</th>
                  <th className="px-4 py-3 font-semibold">Fecha</th>
                  <th className="px-4 py-3 font-semibold">Estado</th>
                  <th className="px-4 py-3 font-semibold">Productos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                      No hay órdenes entregadas para mostrar.
                    </td>
                  </tr>
                )}
                {filtered.map((o, i) => {
                  const id = o?.id ?? o?.Id ?? i;
                  const numero = o?.numero ?? o?.Numero ?? `#${id}`;
                  const mesa = o?.mesa || o?.Mesa || "S/M";
                  const estado = o?.estadoCocina ?? o?.EstadoCocina ?? "Entregado";
                  const fecha = o?.fechaCreacion ?? o?.FechaCreacion;
                  const itemsRaw = o?.Items ?? o?.items ?? [];
                  const items = Array.isArray(itemsRaw) ? itemsRaw : [];
                  return (
                    <tr key={id} className="align-top">
                      <td className="px-4 py-3 font-semibold text-slate-800">{numero}</td>
                      <td className="px-4 py-3 text-slate-700">{mesa}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(fecha)}</td>
                      <td className="px-4 py-3">
                        <span className="rounded-md border border-violet-200 bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700">{estado}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {items.length === 0 ? (
                          "-"
                        ) : (
                          <ul className="space-y-1">
                            {items.map((it, idx) => {
                              const itemId = it?.Id ?? it?.id ?? `${id}-${idx}`;
                              const qty = Number(it?.Cantidad ?? it?.cantidad ?? 0);
                              const producto = it?.Producto ?? it?.producto ?? "Producto";
                              const rawOpciones = it?.opcionesResumen ?? it?.OpcionesResumen ?? "";
                              const opcionesTexto = opcionesResumenSoloTextoOpcion(rawOpciones);
                              return (
                                <li key={itemId} className="text-xs">
                                  {qty > 0 ? `${qty}x ` : ""}{producto}
                                  {opcionesTexto ? <span className="ml-1 text-[11px] font-bold text-indigo-600">({opcionesTexto})</span> : null}
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
