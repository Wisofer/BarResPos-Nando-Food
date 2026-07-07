import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRightLeft,
  Bookmark,
  ChefHat,
  Minimize2,
  Minus,
  MoreVertical,
  Plus,
  Printer,
  Save,
  Trash2,
  Lock,
  XCircle,
  X,
} from "lucide-react";
import { backofficeApi } from "../services/backofficeApi.js";
import {
  BackofficeDialog,
  BackofficeStatCardsListSkeleton,
  ListSkeleton,
  PosInlineOpcionesPanel,
  PosProductCatalogTile,
  PosProductOpcionesModal,
  PosProcesarVentaModal,
  PosActionLoadingOverlay,
  CancelPedidoPinModal,
  SplitOrderModal,
} from "../components/index.js";
import { TableFormDialog, LocationsManagerDialog, DetailDialog } from "./TablesViewDialogs.jsx";
import { useSnackbar } from "../../../contexts/SnackbarContext.jsx";
import { ConfirmModal } from "../../../components/ui/ConfirmModal.jsx";
import { PAGINATION } from "../constants/pagination.js";
import { DEFAULT_TIPO_CAMBIO_USD, formatCurrency } from "../utils/currency.js";
import { clearBusyUi, runWithBusyUi } from "../utils/runWithBusyUi.js";
import { buildUpdatePedidoPayloadForMesaChange } from "../utils/pedidoMesa.js";
import {
  extractPosOrdenResponseId,
  getOrdenItems,
  getOrdenPedidoId,
  getPedidoMontoNumeric,
  isCajaCerradaMessageNormalized,
  isPosOrdenVacioResponse,
  isStockShortageConflict409,
  mapBackendItemsToCart,
  normalizeApiErrorMessage,
  parsePosBackendLineId,
  posCartToModalLines,
  posCartToPedidoItemsPayload,
  posCartToPosOrdenProductos,
  unwrapEnvelope,
} from "../utils/posPedido.js";
import { isAdminUser, isCajeroUser } from "../utils/auth.js";
import {
  PRECUENTA_PRINT_READY_INFO,
  pagoResponseHasReciboPrintChannel,
  printKitchenTicketAfterEnviarCocina,
  tryPrintReciboFromPagoResponse,
  openBackendPrintUrl,
  resolveBackendAssetUrl,
  withImpressionAccessTokenQuery,
} from "../utils/backofficePrint.js";
import { getToken } from "../../../api/token.js";
import { buildPagoPayload } from "../utils/paymentPayload.js";
import { fetchPosProductosYCategorias } from "../utils/posCatalogLoad.js";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import {
  mesaEsOcupadaVisual,
  mesaEsReservada,
  normalizeMesaEstado,
  TablesMesasFloorPlan,
  TablesMesasStatsBar,
  TablesMesasZonesGrid,
} from "../tables/index.js";
import {
  buildOpcionesResumenLocal,
  genPosLineId,
  getSingleGrupoOpcionesForPosInline,
  normalizeOpcionesGrupos,
  normalizeOpcionesSeleccionadas,
  opcionesSeleccionadasKey,
  posLineMergeKey,
  productoTieneOpcionesVisibles,
  calcularPreciosOpciones,
  withOpcionesNormalizadas,
} from "../utils/productoOpciones.js";

export function TablesView({ onPosOpenChange, currencySymbol = "C$", openView }) {
  const snackbar = useSnackbar();
  const { user } = useAuth();
  const [tables, setTables] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedTable] = useState(null);
  const [activeOrder] = useState(null);
  const [posOpen, setPosOpen] = useState(false);
  const [posLoading, setPosLoading] = useState(false);
  const [posTable, setPosTable] = useState(null);
  const [posCategories, setPosCategories] = useState([]);
  const [posProducts, setPosProducts] = useState([]);
  const [posCategory, setPosCategory] = useState("");
  const [posSearch, setPosSearch] = useState("");
  const [posCart, setPosCart] = useState([]);
  const [posOrderId, setPosOrderId] = useState(null);
  const [posCommitted, setPosCommitted] = useState(false);
  const [posActionBusy, setPosActionBusy] = useState(false);
  const [posBusyMessage, setPosBusyMessage] = useState("");
  const [posMobileTab, setPosMobileTab] = useState("products");
  const [activeTableMenu, setActiveTableMenu] = useState(null);
  const posOrderIdRef = useRef(posOrderId);
  /** Cola: cada POST /pos/ordenes se procesa en orden (evita perder clics y desajuste stock/UI). */
  const posSyncChainRef = useRef(Promise.resolve());
  const posSyncPendingCountRef = useRef(0);
  const posCartRef = useRef([]);
  const posTableRef = useRef(posTable);
  const posSyncBufferRef = useRef([]);
  const posSyncTimeoutIdRef = useRef(null);
  const [form, setForm] = useState({
    id: null,
    numero: "",
    capacidad: 4,
    estado: "Libre",
    ubicacionId: "",
  });
  const tableIllustration = "assets/images/minimalist-restaurant-table-icon--front-view--two-.png";
  const [confirmDeleteTable, setConfirmDeleteTable] = useState({ open: false, id: null });
  const [saleModalOpen, setSaleModalOpen] = useState(false);

  const [saleModalLines, setSaleModalLines] = useState([]);
  const [saleBackendTotal, setSaleBackendTotal] = useState(null);
  const [saleOrdenId, setSaleOrdenId] = useState(null);
  const [saleProcessing, setSaleProcessing] = useState(false);
  const saleProcessingGuardRef = useRef(false);
  const [tipoCambio, setTipoCambio] = useState(null);
  const [locationsModalOpen, setLocationsModalOpen] = useState(false);
  const [locationForm, setLocationForm] = useState({ id: null, nombre: "", descripcion: "", activo: true });
  const [confirmDeleteLocation, setConfirmDeleteLocation] = useState({ open: false, id: null, name: "" });
  const [showInactiveLocations, setShowInactiveLocations] = useState(false);
  const [cajaAbierta, setCajaAbierta] = useState(false);
  const [posOpcionesModal, setPosOpcionesModal] = useState({ open: false, product: null });
  const [posActiveOrders, setPosActiveOrders] = useState([]);
  const posActiveOrdersRef = useRef(posActiveOrders);
  useEffect(() => { posActiveOrdersRef.current = posActiveOrders; }, [posActiveOrders]);
  const [splitOrderOpen, setSplitOrderOpen] = useState(false);
  const [posInlineOpcionesProduct, setPosInlineOpcionesProduct] = useState(null);
  const [moveOrderOpen, setMoveOrderOpen] = useState(false);
  const [moveOrderTargetId, setMoveOrderTargetId] = useState("");
  const [moveOrderCandidates, setMoveOrderCandidates] = useState([]);
  const [moveOrderSearch, setMoveOrderSearch] = useState("");
  const [moveOrderSelectedZone, setMoveOrderSelectedZone] = useState("");
  const [posCancelPinOpen, setPosCancelPinOpen] = useState(false);
  const [posCancelItemPinOpen, setPosCancelItemPinOpen] = useState(false);
  const [pendingCancelItemLineId, setPendingCancelItemLineId] = useState(null);
  /** "zonas" | "plano" */
  const [mesasLayoutMode, setMesasLayoutMode] = useState("zonas");
  const [enableVistaZonas, setEnableVistaZonas] = useState(true);
  const [enableVistaPlano, setEnableVistaPlano] = useState(true);
  const [planoFullScreen, setPlanoFullScreen] = useState(false);
  const isAdmin = isAdminUser(user);
  const isCajeroOrAdmin = isAdmin || isCajeroUser(user);

  const syncCajaEstado = useCallback(async () => {
    try {
      const caja = await backofficeApi.cajaEstado();
      const abierta = Boolean(caja?.abierta ?? caja?.Abierta ?? (caja?.estado || "").toLowerCase() === "abierto");
      setCajaAbierta(abierta);
      return abierta;
    } catch {
      setCajaAbierta(false);
      return false;
    }
  }, []);

  const normalizeLocation = (l) => ({
    id: l?.id ?? l?.Id,
    nombre: l?.nombre ?? l?.Nombre ?? "",
    descripcion: l?.descripcion ?? l?.Descripcion ?? "",
    activo: l?.activo ?? l?.Activo ?? true,
  });

  const mapTable = (m, i) => ({
    id: m.id ?? m.Id,
    displayId: m.numero || m.codigo || `M-${String(i + 1).padStart(2, "0")}`,
    capacity: m.capacidad || 4,
    zone: m.ubicacion?.nombre || m.ubicacion || "Salon",
    status: m.estado || "Libre",
    activeOrdersCount: Number(m.ordenesActivas || 0),
    hasActiveOrder: Number(m.ordenesActivas || 0) > 0 || String(m.estado || "").toLowerCase() === "ocupada",
    detail: m.ordenesActivas > 0 ? `${m.ordenesActivas} orden(es) activa(s)` : "Lista para atender",
  });

  const loadTables = async () => {
    const data = await backofficeApi.listMesas({ page: 1, pageSize: PAGINATION.LIST_LARGE });
    const items = data?.items || [];
    setTables(Array.isArray(items) ? items.map(mapTable) : []);
  };

  useEffect(() => {
    let mounted = true;
    let pollTimer = null;
    Promise.all([
      loadTables(),
      backofficeApi.catalogoUbicaciones(),
      backofficeApi.cajaEstado().catch(() => null),
      backofficeApi.configuracionTipoCambio().catch(() => null),
      backofficeApi.configuraciones().catch(() => []),
    ])
      .then(([, ubic, caja, tc, config]) => {
        if (!mounted) return;
        const raw = Array.isArray(ubic) ? ubic : ubic?.items || [];
        setLocations(raw.map(normalizeLocation));
        const abierta = Boolean(caja?.abierta ?? caja?.Abierta ?? (caja?.estado || "").toLowerCase() === "abierto");
        setCajaAbierta(abierta);
        const tcValue = Number(tc?.tipoCambioDolar ?? tc?.TipoCambioDolar ?? tc?.valor ?? 0);
        if (Number.isFinite(tcValue) && tcValue > 0) setTipoCambio(tcValue);
        else setTipoCambio(DEFAULT_TIPO_CAMBIO_USD);

        const list = Array.isArray(config) ? config : config?.items || [];
        const hasZonas = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "") === "Mesas:HabilitarVistaZonas");
        const hasPlano = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "") === "Mesas:HabilitarVistaPlano");
        const ez = hasZonas ? hasZonas.valor !== "false" && hasZonas.Valor !== "false" : true;
        const ep = hasPlano ? hasPlano.valor !== "false" && hasPlano.Valor !== "false" : true;
        setEnableVistaZonas(ez);
        setEnableVistaPlano(ep);

        if (ez && !ep) {
          setMesasLayoutMode("zonas");
        } else if (!ez && ep) {
          setMesasLayoutMode("plano");
        }
        // Poll each 15s so multi‑terminal changes are visible
        pollTimer = setInterval(() => {
          if (!mounted) return;
          loadTables().catch(() => {});
        }, 15000);
      })
      .catch((e) => {
        if (!mounted) return;
        setError(e.message || "No se pudo cargar mesas.");
        // Start poll even on initial load failure
        pollTimer = setInterval(() => {
          if (!mounted) return;
          loadTables().catch(() => {});
        }, 15000);
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
      if (pollTimer) clearInterval(pollTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setForm({ id: null, numero: "", capacidad: 4, estado: "Libre", ubicacionId: locations[0]?.id || "" });
    setFormOpen(true);
  };

  const reloadLocations = async () => {
    const ubic = await backofficeApi.catalogoUbicaciones();
    const raw = Array.isArray(ubic) ? ubic : ubic?.items || [];
    setLocations(raw.map(normalizeLocation));
  };

  const openLocationsManager = () => {
    if (typeof openView === "function") {
      openView("locations");
    } else {
      setLocationsModalOpen(true);
      setLocationForm({ id: null, nombre: "", descripcion: "", activo: true });
    }
  };

  const editLocation = async (id) => {
    setSaving(true);
    setError("");
    try {
      const data = await backofficeApi.getUbicacion(id);
      setLocationForm({
        id: data?.id ?? id,
        nombre: data?.nombre || "",
        descripcion: data?.descripcion || "",
        activo: data?.activo !== false,
      });
    } catch (e) {
      const msg = e?.message || "No se pudo cargar ubicación.";
      snackbar.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const saveLocation = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = {
        nombre: locationForm.nombre.trim(),
        descripcion: locationForm.descripcion?.trim() || null,
        activo: Boolean(locationForm.activo),
      };
      if (locationForm.id) await backofficeApi.updateUbicacion(locationForm.id, body);
      else await backofficeApi.createUbicacion(body);
      await reloadLocations();
      await loadTables();
      setLocationForm({ id: null, nombre: "", descripcion: "", activo: true });
      snackbar.success(locationForm.id ? "Ubicación actualizada." : "Ubicación creada.");
    } catch (e) {
      const msg = e?.message || "No se pudo guardar ubicación.";
      snackbar.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const removeLocation = async (id) => {
    setSaving(true);
    setError("");
    try {
      await backofficeApi.deleteUbicacion(id);
      await reloadLocations();
      await loadTables();
      setConfirmDeleteLocation({ open: false, id: null, name: "" });
      if (locationForm.id === id) setLocationForm({ id: null, nombre: "", descripcion: "", activo: true });
      snackbar.success("Ubicación eliminada/desactivada.");
    } catch (e) {
      const msg = e?.message || "No se pudo eliminar ubicación.";
      snackbar.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const toggleLocationActive = async (loc, nextActive) => {
    setSaving(true);
    setError("");
    try {
      await backofficeApi.updateUbicacion(loc.id, {
        nombre: loc.nombre || "",
        descripcion: loc.descripcion || null,
        activo: Boolean(nextActive),
      });
      await reloadLocations();
      await loadTables();
      snackbar.success(nextActive ? "Ubicación reactivada." : "Ubicación desactivada.");
    } catch (e) {
      const msg = e?.message || "No se pudo actualizar estado de ubicación.";
      snackbar.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const openEdit = async (id) => {
    setSaving(true);
    setError("");
    try {
      const m = await backofficeApi.getMesa(id);
      setForm({
        id: m.id,
        numero: m.numero || "",
        capacidad: m.capacidad || 4,
        estado: m.estado || "Libre",
        ubicacionId: m.ubicacionId || "",
      });
      setFormOpen(true);
    } catch (e) {
      setError(e.message || "No se pudo cargar detalle de mesa.");
    } finally {
      setSaving(false);
    }
  };

  const saveTable = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (!form.ubicacionId) {
        setError("Seleccioná una ubicación para la mesa.");
        setSaving(false);
        return;
      }
      const body = {
        numero: form.numero,
        capacidad: Number(form.capacidad),
        estado: form.estado,
        ubicacionId: Number(form.ubicacionId),
      };
      if (form.id) await backofficeApi.updateMesa(form.id, body);
      else await backofficeApi.createMesa(body);
      await loadTables();
      setFormOpen(false);
      snackbar.success(form.id ? "Mesa actualizada." : "Mesa creada.");
    } catch (e2) {
      snackbar.error(e2.message || "No se pudo guardar la mesa.");
    } finally {
      setSaving(false);
    }
  };

  const refreshPosTableFromBackend = async (mesaId) => {
    try {
      const m = await backofficeApi.getMesa(mesaId);
      if (m) setPosTable(mapTable(m, 0));
    } catch {
      /* ignore */
    }
  };

  const handleReservarMesa = async () => {
    if (!posTable || posOrderId) return;
    if (normalizeMesaEstado(posTable.status) !== "Libre") return;
    try {
      await runWithBusyUi(
        { setBusy: setPosActionBusy, setMessage: setPosBusyMessage, caption: "Reservando mesa…" },
        async () => {
          setError("");
          await backofficeApi.patchMesaEstado(posTable.id, "Reservada");
          await loadTables();
          await refreshPosTableFromBackend(posTable.id);
          snackbar.success("Mesa reservada.");
        },
      );
    } catch (e) {
      const msg = e?.message || "No se pudo reservar la mesa.";
      snackbar.error(msg);
    }
  };

  const handleLiberarReserva = async () => {
    if (!posTable || posOrderId) return;
    if (!mesaEsReservada(posTable)) return;
    try {
      await runWithBusyUi(
        { setBusy: setPosActionBusy, setMessage: setPosBusyMessage, caption: "Quitando reserva…" },
        async () => {
          setError("");
          await backofficeApi.patchMesaEstado(posTable.id, "Libre");
          await loadTables();
          await refreshPosTableFromBackend(posTable.id);
          snackbar.success("Reserva quitada; mesa libre.");
        },
      );
    } catch (e) {
      const msg = e?.message || "No se pudo quitar la reserva.";
      snackbar.error(msg);
    }
  };

  const removeTable = async (id) => {
    setSaving(true);
    setError("");
    try {
      await backofficeApi.deleteMesa(id);
      await loadTables();
      snackbar.success("Mesa eliminada/desactivada.");
    } catch (e) {
      snackbar.error(e.message || "No se pudo eliminar la mesa.");
    } finally {
      setSaving(false);
    }
  };

  const openPosView = async (table) => {
    const abiertaAhora = await syncCajaEstado();
    if (!abiertaAhora) {
      snackbar.info("Caja cerrada: no se puede abrir POS en mesas.");
      return;
    }
    // Cancelar y limpiar cualquier buffer/temporizador de la mesa anterior antes de abrir la nueva.
    if (posSyncTimeoutIdRef.current) {
      clearTimeout(posSyncTimeoutIdRef.current);
      posSyncTimeoutIdRef.current = null;
    }
    posSyncBufferRef.current = [];
    posSyncChainRef.current = Promise.resolve();
    posSyncPendingCountRef.current = 0;
    setPosOpen(true);
    setPosTable(table);
    setActiveTableMenu(null);
    setPosOrderId(null);
    setPosCommitted(false);
    setPosLoading(true);
    setPosSearch("");
    setPosCategory("");
    setPosCart([]);
    setPosMobileTab("products");
    setPosInlineOpcionesProduct(null);
    setPosOpcionesModal({ open: false, product: null });
    try {
      const [ordenesResp, catalog] = await Promise.all([
        backofficeApi.getMesaOrdenesActivas(table.id).catch(() => null),
        fetchPosProductosYCategorias(backofficeApi, PAGINATION.POS_PRODUCTOS),
      ]);
      const ordenes = unwrapEnvelope(ordenesResp) || [];

      if (ordenes.length > 0) {
        const primera = ordenes[0];
        setPosOrderId(getOrdenPedidoId(primera, null));
        const backendItems = getOrdenItems(primera);
        if (backendItems) {
          setPosCart(mapBackendItemsToCart(backendItems));
          setPosCommitted(true);
        } else {
          setPosCart([]);
          setPosCommitted(false);
        }
        if (ordenes.length > 1) {
          setPosActiveOrders(ordenes);
        }
      } else {
        setPosCart([]);
        setPosCommitted(false);
      }

      setPosProducts(catalog.products);
      setPosCategories(catalog.categories);
    } catch (e) {
      snackbar.error(e.message || "No se pudo cargar productos para la mesa.");
    } finally {
      setPosLoading(false);
    }
  };

  const zones = useMemo(() => {
    const grouped = new Map();
    tables.forEach((t) => {
      const zone = String(t.zone || "SALON").trim() || "SALON";
      if (!grouped.has(zone)) grouped.set(zone, []);
      grouped.get(zone).push(t);
    });
    return Array.from(grouped.entries()).map(([name, items]) => ({ name, items }));
  }, [tables]);

  const mesasPlanoList = useMemo(() => {
    return [...tables].sort((a, b) => {
      const z = String(a.zone || "").localeCompare(String(b.zone || ""), "es");
      if (z !== 0) return z;
      return String(a.displayId || "").localeCompare(String(b.displayId || ""), "es", { numeric: true });
    });
  }, [tables]);

  const mesasVistaExpandida = mesasLayoutMode === "plano";

  const mesaStats = useMemo(() => {
    let libres = 0;
    let ocupadas = 0;
    let reservadas = 0;
    for (const t of tables) {
      if (mesaEsOcupadaVisual(t)) ocupadas += 1;
      else if (mesaEsReservada(t)) reservadas += 1;
      else libres += 1;
    }
    return { libres, ocupadas, reservadas };
  }, [tables]);

  const filteredPosProducts = useMemo(() => {
    const q = posSearch.trim().toLowerCase();
    return posProducts.filter((p) => {
      const categoryMatch = !posCategory || String(p.categoriaProductoId || "") === String(posCategory);
      if (!categoryMatch) return false;
      if (!q) return true;
      return `${p.nombre || ""} ${p.codigo || ""}`.toLowerCase().includes(q);
    });
  }, [posProducts, posCategory, posSearch]);

  const posInlineOpcionesPick = useMemo(
    () => (posInlineOpcionesProduct ? getSingleGrupoOpcionesForPosInline(posInlineOpcionesProduct) : null),
    [posInlineOpcionesProduct]
  );

  useEffect(() => {
    if (posInlineOpcionesProduct && !posInlineOpcionesPick) {
      setPosInlineOpcionesProduct(null);
    }
  }, [posInlineOpcionesProduct, posInlineOpcionesPick]);

  const posProductGridClass =
    "grid auto-rows-min grid-cols-2 gap-2 overflow-auto content-start items-stretch sm:grid-cols-3";
  /** Sub-opciones de un producto (sin imagen). Mismo gradiente que `PosProductCatalogTile` sin imagen. */
  const posOpcionTileShell =
    "flex min-h-[96px] w-full flex-col justify-end gap-0.5 rounded-lg border border-slate-200/90 bg-gradient-to-b from-slate-200 to-slate-500 px-2.5 py-2.5 text-left text-[10px] font-bold leading-tight text-white shadow sm:min-h-[104px] [text-shadow:0_0_6px_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.08),0_0_1px_rgba(255,255,255,0.4)] disabled:cursor-not-allowed disabled:opacity-60";

  const rollbackPosLineByLineId = (lineId, cantidad) => {
    if (lineId == null || lineId === "") return;
    setPosCart((prev) => {
      const next = [...prev];
      const idx = next.findIndex((x) => x.lineId === lineId);
      if (idx < 0) return prev;
      const currentQty = Number(next[idx].qty || 0);
      const newQty = Math.max(0, currentQty - Number(cantidad || 1));
      if (newQty <= 0) next.splice(idx, 1);
      else next[idx] = { ...next[idx], qty: newQty };
      posCartRef.current = next;
      return next;
    });
  };

  const flushPosSyncBuffer = () => {
    if (posSyncTimeoutIdRef.current) {
      clearTimeout(posSyncTimeoutIdRef.current);
      posSyncTimeoutIdRef.current = null;
    }
    if (posSyncBufferRef.current.length === 0) return Promise.resolve();

    const buffer = [...posSyncBufferRef.current];
    posSyncBufferRef.current = [];

    const tableForSync = posTableRef.current;
    if (!tableForSync) return Promise.resolve();
    if (!cajaAbierta) return Promise.resolve();

    posSyncPendingCountRef.current += 1;
    posSyncChainRef.current = posSyncChainRef.current
      .then(async () => {
        const currentId = posOrderIdRef.current;
        const productosPayload = buffer.map((item) => {
          const pid = Number(item.product?.id ?? item.product?.Id);
          return withOpcionesNormalizadas(
            { productoId: pid, cantidad: item.cantidad, notas: item.notas },
            item.opsNorm
          );
        });

        const body = {
          mesaId: Number(tableForSync.id),
          ordenId: currentId ?? undefined,
          observaciones: "",
          productos: productosPayload,
        };

        try {
          const data = await backofficeApi.posOrdenes(body);
          const newOrderId = extractPosOrdenResponseId(data, currentId);

          if (newOrderId && newOrderId !== currentId) {
            setPosOrderId(newOrderId);
            posOrderIdRef.current = newOrderId;
          }

          setPosCommitted(true);
          await loadTables();
          try {
            await backofficeApi.patchMesaEstado(Number(tableForSync.id), "Ocupada");
          } catch {
            /* el backend puede haberla marcado ya */
          }
          await refreshPosTableFromBackend(tableForSync.id);
          if (posActiveOrdersRef.current.length > 1) {
            refreshPosActiveOrders().catch(() => {});
          }
        } catch (e) {
          for (const item of buffer) {
            for (const rb of item.rollbackLines) {
              rollbackPosLineByLineId(rb.lineId, rb.cantidad);
            }
          }
          const msg = e?.message || "No se pudo agregar los productos en backend.";
          const status = e?.status;
          const normalized = normalizeApiErrorMessage(msg);
          const cajaCerrada = isCajaCerradaMessageNormalized(normalized);
          if (cajaCerrada) {
            setCajaAbierta(false);
            await syncCajaEstado();
          }
          const stockConflict = isStockShortageConflict409(status, normalized, cajaCerrada);
          snackbar.error(stockConflict && !/^stock\b/i.test(msg) ? `Stock: ${msg}` : msg);
        }
      })
      .catch(() => {})
      .finally(() => {
        posSyncPendingCountRef.current = Math.max(0, posSyncPendingCountRef.current - 1);
      });

    return posSyncChainRef.current;
  };

  const syncPosDeltaAdd = (product, cantidad = 1, opcionesSeleccionadas = [], notas = "", rollbackLineId = null) => {
    const tableForSync = posTableRef.current;
    if (!tableForSync) return;
    if (!cajaAbierta) return;

    const opsNorm = normalizeOpcionesSeleccionadas(opcionesSeleccionadas);
    const notasTrim = String(notas ?? "").trim();
    const pid = Number(product?.id ?? product?.Id);

    if (posSyncTimeoutIdRef.current) {
      clearTimeout(posSyncTimeoutIdRef.current);
    }

    const buf = posSyncBufferRef.current;
    const key = opcionesSeleccionadasKey(opsNorm);
    const existingIdx = buf.findIndex(
      (item) =>
        Number(item.product?.id ?? item.product?.Id) === pid &&
        opcionesSeleccionadasKey(item.opsNorm) === key &&
        item.notas === notasTrim
    );

    if (existingIdx >= 0) {
      buf[existingIdx].cantidad += cantidad;
      if (rollbackLineId) {
        buf[existingIdx].rollbackLines.push({ lineId: rollbackLineId, cantidad });
      }
    } else {
      buf.push({
        product,
        cantidad,
        opsNorm,
        notas: notasTrim,
        rollbackLines: rollbackLineId ? [{ lineId: rollbackLineId, cantidad }] : [],
      });
    }

    posSyncTimeoutIdRef.current = setTimeout(() => {
      posSyncTimeoutIdRef.current = null;
      void flushPosSyncBuffer();
    }, 400);
  };

  const addProductToCart = async (product) => {
    if (posActionBusy || saleProcessing || saleModalOpen) return;
    if (!cajaAbierta) {
      const abiertaAhora = await syncCajaEstado();
      if (!abiertaAhora) {
        snackbar.info("Caja cerrada: no se puede agregar productos.");
        return;
      }
    }
    if (productoTieneOpcionesVisibles(product)) {
      if (getSingleGrupoOpcionesForPosInline(product)) {
        setPosInlineOpcionesProduct(product);
        return;
      }
      setPosOpcionesModal({ open: true, product });
      return;
    }
    const pid = Number(product?.id ?? product?.Id);
    const emptyKey = "";
    const mergeTarget = posLineMergeKey([], "");

    const prev = posCartRef.current;
    const idx = prev.findIndex(
      (x) => Number(x.id) === pid && posLineMergeKey(x.opcionesSeleccionadas, x.notas) === mergeTarget && (!x.estado || x.estado === "Pendiente" || x.estado === "Pending")
    );
    let ops, notas, rollbackLineId, next;
    if (idx >= 0) {
      const line = prev[idx];
      ops = normalizeOpcionesSeleccionadas(line.opcionesSeleccionadas);
      notas = String(line.notas ?? "").trim();
      rollbackLineId = line.lineId;
      next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
    } else {
      const nextLineId = genPosLineId();
      ops = [];
      notas = "";
      rollbackLineId = nextLineId;
      next = [
        ...prev,
        {
          lineId: nextLineId,
          id: pid,
          name: product.nombre || product.Nombre || "Producto",
          price: Number(product.precio ?? product.Precio ?? 0),
          qty: 1,
          opcionesSeleccionadas: [],
          opcionesKey: emptyKey,
          opcionesResumen: "",
          notas: "",
        },
      ];
    }
    posCartRef.current = next;
    setPosCart(next);
    setPosCommitted(false);
    void syncPosDeltaAdd(product, 1, ops, notas, rollbackLineId);
  };

  const pickPosInlineOpcion = (prod, grupoId, opcion) => {
    const oid = Number(opcion?.id ?? opcion?.Id);
    if (!Number.isFinite(oid) || !Number.isFinite(Number(grupoId))) return;
    if (posActionBusy || !cajaAbierta) return;
    setPosInlineOpcionesProduct(null);
    confirmAddProductWithOpciones(prod, [{ grupoId: Number(grupoId), opcionId: oid }]);
  };

  const confirmAddProductWithOpciones = (product, opcionesSeleccionadas) => {
    if (posActionBusy || saleProcessing || saleModalOpen) return;
    const pid = Number(product?.id ?? product?.Id);
    const grupos = normalizeOpcionesGrupos(product);
    const opsNorm = normalizeOpcionesSeleccionadas(opcionesSeleccionadas);
    const key = opcionesSeleccionadasKey(opsNorm);
    const base = Number(product.precio ?? product.Precio ?? 0);
    const { sumaExtras, precioReemplazo, tieneReemplazo } = calcularPreciosOpciones(grupos, opsNorm);
    const finalPrice = (tieneReemplazo ? precioReemplazo : base) + sumaExtras;
    const resumen = buildOpcionesResumenLocal(grupos, opsNorm);
    const mergeTarget = posLineMergeKey(opsNorm, "");

    const prev = posCartRef.current;
    const idx = prev.findIndex(
      (x) => Number(x.id) === pid && posLineMergeKey(x.opcionesSeleccionadas, x.notas) === mergeTarget && (!x.estado || x.estado === "Pendiente" || x.estado === "Pending")
    );
    let ops, notas, rollbackLineId, next;
    if (idx >= 0) {
      const line = prev[idx];
      ops = normalizeOpcionesSeleccionadas(line.opcionesSeleccionadas);
      notas = String(line.notas ?? "").trim();
      rollbackLineId = line.lineId;
      next = [...prev];
      next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
    } else {
      const nextLineId = genPosLineId();
      ops = opsNorm;
      notas = "";
      rollbackLineId = nextLineId;
      next = [
        ...prev,
        {
          lineId: nextLineId,
          id: pid,
          name: product.nombre || product.Nombre || "Producto",
          price: finalPrice,
          qty: 1,
          opcionesSeleccionadas: opsNorm,
          opcionesKey: key,
          opcionesResumen: resumen,
          notas: "",
        },
      ];
    }
    posCartRef.current = next;
    setPosCart(next);
    setPosCommitted(false);
    void syncPosDeltaAdd(product, 1, ops, notas, rollbackLineId);
  };

  const applyPosOrdenVacio = async () => {
    setPosOrderId(null);
    setPosCart([]);
    posCartRef.current = [];
    await loadTables();
    if (posTable) await refreshPosTableFromBackend(posTable.id);
  };

  const refreshPosActiveOrders = async () => {
    if (!posTable) return [];
    const env = await backofficeApi.getMesaOrdenesActivas(posTable.id).catch(() => null);
    const ordenes = unwrapEnvelope(env) || [];
    setPosActiveOrders(ordenes);
    return ordenes;
  };

  const switchPosOrder = async (orderId, skipRefresh, ordenesOverride) => {
    if (!orderId) return;
    await flushPosSyncBuffer();
    if (!skipRefresh && posSyncPendingCountRef.current > 0) {
      try { await posSyncChainRef.current; } catch { /* ignore */ }
    }
    let ordenes = ordenesOverride ?? posActiveOrders;
    if (!skipRefresh && !ordenesOverride && ordenes.length > 1) {
      ordenes = await refreshPosActiveOrders();
    }
    const order = ordenes.find((o) => Number(o.id) === Number(orderId));
    if (!order) return;
    setPosOrderId(order.id);
    posOrderIdRef.current = order.id;
    const backendItems = getOrdenItems(order);
    const mapped = backendItems ? mapBackendItemsToCart(backendItems) : [];
    setPosCart(mapped);
    posCartRef.current = mapped;
    setPosCommitted(true);
  };

  const handleSepararCuenta = async (lineasAMover) => {
    if (lineasAMover.length === 0) return;
    setPosActionBusy(true);
    try {
      let orderId = posOrderId ?? posOrderIdRef.current;
      if (!orderId && posCart.length > 0) {
        await ensurePosOrderSynced();
        orderId = posOrderIdRef.current;
      }
      if (!orderId) {
        snackbar.error("No hay una orden activa para separar.");
        return;
      }
      await backofficeApi.pedidoSeparar(orderId, { lineasAMover });
      snackbar.success("Cuenta separada exitosamente.");
      setSplitOrderOpen(false);
      const env = await backofficeApi.getMesaOrdenesActivas(posTable.id);
      const ordenes = unwrapEnvelope(env) || [];
      setPosActiveOrders(ordenes);
      if (ordenes.length > 0) switchPosOrder(ordenes[0].id, true, ordenes);
    } catch (e) {
      snackbar.error(e?.message || "Error al separar la cuenta.");
    } finally {
      setPosActionBusy(false);
    }
  };

  const reloadPosCartFromMesaActiva = async () => {
    if (!posTable) return;
    const currentId = posOrderIdRef.current;
    if (currentId) {
      await reloadPosCartFromPedido(currentId);
      return;
    }
    const freshRaw = await backofficeApi.getMesaOrdenActiva(posTable.id);
    const fresh = unwrapEnvelope(freshRaw);
    const backendItems = getOrdenItems(fresh);
    const mapped = backendItems ? mapBackendItemsToCart(backendItems) : [];
    setPosCart(mapped);
    posCartRef.current = mapped;
    const oid = getOrdenPedidoId(fresh, null);
    setPosOrderId(oid);
  };

  const reloadPosCartFromPedido = async (ordenId) => {
    const pedido = await backofficeApi.getPedido(ordenId);
    const backendItems = pedido?.items ?? pedido?.Items;
    const mapped = backendItems?.length ? mapBackendItemsToCart(backendItems) : [];
    setPosCart(mapped);
    posCartRef.current = mapped;
  };

  const syncPosCartSnapshot = (nextCart) => {
    const tableForSync = posTableRef.current;
    if (!tableForSync) return;
    const snapshot = Array.isArray(nextCart) ? nextCart : [];
    posCartRef.current = snapshot;

    posSyncPendingCountRef.current += 1;
    posSyncChainRef.current = posSyncChainRef.current
      .then(async () => {
        let currentId = posOrderIdRef.current;

        // Si no existe orden todavía y no hay items, no hay nada que persistir.
        if (!currentId && snapshot.length === 0) {
          setPosCommitted(true);
          return;
        }

        // Crea orden activa solo si hay items locales que persistir.
        if (!currentId && snapshot.length > 0) {
          const productos = posCartToPosOrdenProductos(snapshot);
          const data = await backofficeApi.posOrdenes({
            mesaId: Number(tableForSync.id),
            ordenId: undefined,
            observaciones: "",
            productos,
          });
          const newOrderId = extractPosOrdenResponseId(data, null);
          if (!newOrderId) throw new Error("No se pudo crear la orden activa en backend.");
          currentId = newOrderId;
          setPosOrderId(newOrderId);
          posOrderIdRef.current = newOrderId;
        }

        if (!currentId) {
          setPosCommitted(true);
          return;
        }

        const pedido = await backofficeApi.getPedido(currentId);
        const items = posCartToPedidoItemsPayload(snapshot);

        const updateResp = await backofficeApi.updatePedido(currentId, {
          mesaId: pedido?.mesaId ?? pedido?.MesaId ?? Number(posTable.id),
          clienteId: pedido?.clienteId ?? pedido?.ClienteId ?? null,
          meseroId: pedido?.meseroId ?? pedido?.MeseroId ?? null,
          estado: pedido?.estado ?? pedido?.Estado ?? "Listo",
          estadoCocina: pedido?.estadoCocina ?? pedido?.EstadoCocina ?? "Listo",
          observaciones: pedido?.observaciones ?? pedido?.Observaciones ?? null,
          items,
        });

        if (isPosOrdenVacioResponse(updateResp)) {
          if (snapshot.length > 0) {
                snackbar.error("No se pudo actualizar la orden; recargando desde el servidor.");
            await reloadPosCartFromMesaActiva();
            setPosCommitted(true);
            return;
          }
          await applyPosOrdenVacio();
          setPosCommitted(true);
          return;
        }

        if (posActiveOrdersRef.current.length > 1) {
          refreshPosActiveOrders().catch(() => {});
        }
        setPosCommitted(true);
      })
      .catch(async (e) => {
        const msg = e?.message || "No se pudo actualizar la orden.";
        snackbar.error(msg);
        if (!tableForSync) return;
        try {
          const currentId = posOrderIdRef.current;
          if (currentId) {
            await reloadPosCartFromPedido(currentId);
          } else {
            setPosCart([]);
          }
          setPosCommitted(true);
        } catch {
          /* ignore */
        }
      })
      .finally(() => {
        posSyncPendingCountRef.current = Math.max(0, posSyncPendingCountRef.current - 1);
      });

    void posSyncChainRef.current;
  };

  const updateCartQty = (lineId, delta) => {
    if (posActionBusy) return;
    const prev = posCartRef.current;
    const item = prev.find((x) => x.lineId === lineId);
    if (!item) return;

    const isPending = !item.estado || item.estado === "Pendiente" || item.estado === "Pending";

    if (!isPending) {
      if (delta > 0) {
        // En lugar de modificar la línea bloqueada, buscamos una pendiente o creamos una nueva
        const pIdx = prev.findIndex(
          (x) =>
            Number(x.id) === Number(item.id) &&
            String(x.opcionesKey ?? "") === String(item.opcionesKey ?? "") &&
            String(x.notas ?? "").trim() === String(item.notas ?? "").trim() &&
            (!x.estado || x.estado === "Pendiente" || x.estado === "Pending")
        );
        let next = [...prev];
        if (pIdx >= 0) {
          next[pIdx] = { ...next[pIdx], qty: next[pIdx].qty + delta };
        } else {
          next.push({
            ...item,
            lineId: genPosLineId(),
            qty: delta,
            estado: "Pendiente",
          });
        }
        posCartRef.current = next;
        setPosCart(next);
        setPosCommitted(false);
        syncPosCartSnapshot(next);
        return;
      } else {
        // Bloquear disminución de productos enviados
        snackbar.error("No se puede restar un producto enviado. Anúlelo con la X si es necesario.");
        return;
      }
    }

    const newQty = Math.max(0, Number(item.qty || 0) + delta);
    if (newQty <= 0) {
      removeFromCart(lineId);
      return;
    }
    const next = prev.map((x) => (x.lineId === lineId ? { ...x, qty: newQty } : x));
    posCartRef.current = next;
    setPosCart(next);
    setPosCommitted(false);
    syncPosCartSnapshot(next);
  };

  const removeFromCart = (lineId) => {
    if (posActionBusy || saleProcessing) return;
    const item = posCartRef.current.find((x) => x.lineId === lineId);
    const isSentToKitchen = item && item.estado !== "Pendiente" && parsePosBackendLineId(lineId) !== null;

    if (isSentToKitchen) {
      if (posCancelItemPinOpen) {
        snackbar.info("Ya hay un producto pendiente de cancelación.");
        return;
      }
      setPendingCancelItemLineId(lineId);
      setPosCancelItemPinOpen(true);
      return;
    }
    executeRemoveFromCart(lineId);
  };

  const executeRemoveFromCart = (lineId) => {
    const prev = posCartRef.current;
    const next = prev.filter((item) => item.lineId !== lineId);
    if (next.length === prev.length) return;

    posCartRef.current = next;
    setPosCart(next);
    setPosCommitted(false);

    if (!posTable) {
      // Still sync if we have an order ID
      const oid = posOrderIdRef.current;
      const lineaId = parsePosBackendLineId(lineId);
      if (oid && lineaId) {
        posSyncPendingCountRef.current += 1;
        posSyncChainRef.current = posSyncChainRef.current
          .then(async () => {
            await backofficeApi.pedidoEliminarLinea(oid, lineaId);
          })
          .catch(() => {})
          .finally(() => {
            posSyncPendingCountRef.current = Math.max(0, posSyncPendingCountRef.current - 1);
          });
        void posSyncChainRef.current;
      }
      return;
    }

    const lineaId = parsePosBackendLineId(lineId);
    const ordenId = posOrderIdRef.current;

    if (!lineaId || !ordenId) {
      syncPosCartSnapshot(next);
      return;
    }

    posSyncPendingCountRef.current += 1;
    posSyncChainRef.current = posSyncChainRef.current
      .then(async () => {
        const resp = await backofficeApi.pedidoEliminarLinea(ordenId, lineaId);
        if (isPosOrdenVacioResponse(resp)) {
          if (next.length === 0) {
            await applyPosOrdenVacio();
          } else {
            snackbar.error("La orden quedó vacía en el servidor; recargando.");
            await reloadPosCartFromMesaActiva();
          }
        } else {
          await reloadPosCartFromPedido(ordenId);
        }
        setPosCommitted(true);
      })
      .catch(async (e) => {
        const msg = e?.message || "No se pudo quitar el producto.";
        snackbar.error(msg);
        try {
          await reloadPosCartFromMesaActiva();
          setPosCommitted(true);
        } catch {
          /* ignore */
        }
      })
      .finally(() => {
        posSyncPendingCountRef.current = Math.max(0, posSyncPendingCountRef.current - 1);
      });

    void posSyncChainRef.current;
  };

  const confirmCancelItemWithPin = async (codigo) => {
    await posSyncChainRef.current.catch(() => {});
    const lineId = pendingCancelItemLineId;
    if (!lineId) return;

    const item = posCart.find((x) => x.lineId === lineId);
    if (!item) return;

    const lineaId = parsePosBackendLineId(lineId);
    const ordenId = posOrderIdRef.current;

    if (!lineaId || !ordenId) return;

    setPosActionBusy(true);
    setPosBusyMessage("Cancelando producto...");
    try {
      const resp = await backofficeApi.pedidoCancelarLineaConPin(ordenId, lineaId, codigo);
      const data = unwrapEnvelope(resp);
      const vacio = data?.vacio ?? data?.Vacio;

      const prev = posCartRef.current;
      const next = prev.filter((x) => x.lineId !== lineId);
      posCartRef.current = next;
      setPosCart(next);
      setPosCommitted(true);

      if (vacio) {
        await applyPosOrdenVacio();
        snackbar.success("Línea eliminada. Pedido vacío.");
      } else {
        await reloadPosCartFromPedido(ordenId);
        snackbar.success("Línea cancelada e impresa correctamente.");
      }
      setPosCancelItemPinOpen(false);
      setPendingCancelItemLineId(null);
    } catch (e) {
      snackbar.error(e?.message || "No se pudo cancelar el producto.");
    } finally {
      setPosActionBusy(false);
      setPosBusyMessage("");
    }
  };

  const posNotasSyncTimerRef = useRef(null);
  const updateCartNotas = (lineId, notas) => {
    const next = posCartRef.current.map((item) =>
      item.lineId === lineId ? { ...item, notas: String(notas ?? "") } : item
    );
    posCartRef.current = next;
    setPosCart(next);
    setPosCommitted(false);
    if (posNotasSyncTimerRef.current) clearTimeout(posNotasSyncTimerRef.current);
    posNotasSyncTimerRef.current = setTimeout(() => {
      posNotasSyncTimerRef.current = null;
      syncPosCartSnapshot(next);
    }, 500);
  };

  const posSubtotal = useMemo(() => posCart.reduce((sum, x) => sum + Number(x.price || 0) * Number(x.qty || 0), 0), [posCart]);

  useEffect(() => {
    posOrderIdRef.current = posOrderId;
  }, [posOrderId]);

  useEffect(() => {
    posCartRef.current = posCart;
  }, [posCart]);

  useEffect(() => {
    posTableRef.current = posTable;
  }, [posTable]);

  const closePosView = async () => {
    // Esperar sincronizaciones pendientes antes de limpiar estado (timeout 8s para no bloquear la UI)
    await flushPosSyncBuffer();
    if (posSyncPendingCountRef.current > 0) {
      setPosBusyMessage("Finalizando sincronización…");
      setPosActionBusy(true);
    }
    await Promise.race([
      posSyncChainRef.current.catch(() => {}),
      new Promise((resolve) => setTimeout(resolve, 8000)),
    ]).catch(() => {});
    clearBusyUi(setPosActionBusy, setPosBusyMessage);
    posSyncChainRef.current = Promise.resolve();
    posSyncPendingCountRef.current = 0;
    setPosOpcionesModal({ open: false, product: null });
    setPosInlineOpcionesProduct(null);
    setPosOpen(false);
    setPosTable(null);
    setPosOrderId(null);
    setPosCommitted(false);
    setPosCart([]);
    posCartRef.current = [];
    setPosSearch("");
    setPosCategory("");
    setPosMobileTab("products");
    setSaleModalOpen(false);
    setSaleOrdenId(null);
    setSaleModalLines([]);
    setSaleBackendTotal(null);
    setPosCancelPinOpen(false);
    setSplitOrderOpen(false);
    setPosActiveOrders([]);
    clearBusyUi(setPosActionBusy, setPosBusyMessage);
    // Refresca el listado de mesas para que se vea el cambio de estado (rojo/ocupada).
    await loadTables();
  };

  const openMoveOrderDialog = async () => {
    if (!posTable) return;
    const oid = posOrderId ?? posOrderIdRef.current;
    if (!oid) {
      snackbar.info("No hay un pedido activo para trasladar.");
      return;
    }
    setError("");
    if (posCart.length > 0) {
      try {
        await ensurePosOrderSynced();
      } catch {
        return;
      }
    }
    try {
      const data = await backofficeApi.listMesas({ page: 1, pageSize: PAGINATION.LIST_LARGE });
      const raw = data?.items || [];
      const mapped = raw.map(mapTable);
      const free = mapped.filter((t) => t.id !== posTable.id && t.status === "Libre");
      if (free.length === 0) {
        snackbar.info("No hay mesas libres. Libera una mesa o elige otra estrategia.");
        return;
      }
      setMoveOrderCandidates(free);
      setMoveOrderTargetId(String(free[0].id));
      setMoveOrderSearch("");
      setMoveOrderSelectedZone("");
      setMoveOrderOpen(true);
    } catch (e) {
      const msg = e?.message || "No se pudo cargar mesas para el traslado.";
      snackbar.error(msg);
    }
  };

  const handleConfirmTrasladarPedido = async (e) => {
    e.preventDefault();
    if (!posTable) return;
    const destId = Number(moveOrderTargetId);
    const oid = posOrderId ?? posOrderIdRef.current;
    if (!oid || !Number.isFinite(destId) || destId === posTable.id) {
      snackbar.error("Selecciona una mesa destino válida.");
      return;
    }

    if (posActiveOrders.length > 1) {
      snackbar.warning("Solo la cuenta actual será trasladada. Las demás cuentas permanecerán en esta mesa.");
    }

    try {
      await runWithBusyUi(
        { setBusy: setPosActionBusy, setMessage: setPosBusyMessage, caption: "Trasladando pedido…" },
        async () => {
          setError("");
          if (posCart.length > 0) {
            await ensurePosOrderSynced({ manageBusy: false });
          }

          const orderId = posOrderId ?? posOrderIdRef.current;
          if (!orderId) throw new Error("No se encontró el pedido activo.");

          // Re-validar que la mesa destino siga libre
          const destRaw = await backofficeApi.getMesa(destId).catch(() => null);
          const destMapped = destRaw ? mapTable(destRaw, 0) : null;
          if (!destMapped || destMapped.status !== "Libre") {
            throw new Error(`La mesa "${destMapped?.displayId || destId}" ya no está libre. Se canceló el traslado.`);
          }

          let trasladarMessage = "";
          try {
            const env = await backofficeApi.pedidoTrasladarMesa(orderId, destId);
            trasladarMessage = (env?.message || "").trim();
          } catch (err) {
            const st = err?.status;
            if (st !== 404 && st !== 405) throw err;
            const pedido = await backofficeApi.getPedido(orderId);
            const body = buildUpdatePedidoPayloadForMesaChange(pedido, destId);
            await backofficeApi.updatePedido(orderId, body);
          }

          const [, mesaRes, ordenesActivasRaw] = await Promise.all([
            loadTables(),
            backofficeApi.getMesa(destId).catch(() => null),
            backofficeApi.getMesaOrdenesActivas(destId).catch(() => null),
          ]);

          let newTable;
          if (mesaRes) {
            newTable = mapTable(mesaRes, 0);
          } else {
            const fromList = moveOrderCandidates.find((t) => t.id === destId);
            if (!fromList) throw new Error("No se pudo cargar la mesa destino.");
            newTable = fromList;
          }

          const ordenesActivas = unwrapEnvelope(ordenesActivasRaw);
          const ordenesList = Array.isArray(ordenesActivas) ? ordenesActivas : [];
          const orderActiva = ordenesList.find((o) => getOrdenPedidoId(o, null) === orderId) || ordenesList[0] || null;
          const nextId = getOrdenPedidoId(orderActiva, orderId);
          const backendItems = getOrdenItems(orderActiva);
          let nextCart = posCartRef.current;
          if (backendItems?.length) {
            nextCart = mapBackendItemsToCart(backendItems);
          } else {
            try {
              const p = await backofficeApi.getPedido(nextId ?? orderId);
              const its = p?.items ?? p?.Items;
              if (its?.length) nextCart = mapBackendItemsToCart(its);
            } catch {
              /* mantiene carrito actual */
            }
          }

          setPosActiveOrders(ordenesList.length > 1 ? ordenesList : []);

          // Un solo bloque de estado: evita un frame con mesa nueva y carrito/pedido desalineados
          // (el efecto de carrito vacío podía dispararse mal en ese intervalo).
          setPosTable(newTable);
          setPosOrderId(nextId);
          setPosCart(nextCart);
          posCartRef.current = nextCart;
          setPosMobileTab("order");
          setPosCommitted(true);
          setMoveOrderOpen(false);
          setMoveOrderCandidates([]);
          setMoveOrderTargetId("");
          snackbar.success(
            trasladarMessage || `Pedido trasladado a ${newTable.zone} · ${newTable.displayId}.`,
          );
        },
      );
    } catch (err) {
      const msg = err?.message || "No se pudo trasladar el pedido.";
      snackbar.error(msg);
    }
  };


  const ensurePosOrderSynced = async ({ manageBusy = true } = {}) => {
    const tableForSync = posTableRef.current;
    if (!tableForSync) return posOrderId;
    if (manageBusy && posActionBusy) return posOrderId;

    await flushPosSyncBuffer();
    await posSyncChainRef.current.catch(() => { });

    if (manageBusy) {
      setPosBusyMessage("Sincronizando orden…");
      setPosActionBusy(true);
    }
    let currentId = posOrderId ?? posOrderIdRef.current;
    try {
      // Aseguramos que exista la orden activa (si por algún motivo no existe aún).
      if (!currentId && posCartRef.current.length > 0) {
        const productos = posCartToPosOrdenProductos(posCartRef.current);
        const data = await backofficeApi.posOrdenes({
          mesaId: Number(tableForSync.id),
          ordenId: undefined,
          observaciones: "",
          productos,
        });
        const newOrderId = extractPosOrdenResponseId(data, null);
        if (!newOrderId) throw new Error("No se pudo crear la orden activa en backend.");
        setPosOrderId(newOrderId);
        posOrderIdRef.current = newOrderId;
        currentId = newOrderId;
      }

      if (!currentId) {
        setPosCommitted(true);
        return null;
      }

      // PUT reemplaza items: así queda 1:1 con el carrito (incluye +/-).
      const pedido = await backofficeApi.getPedido(currentId);
      const items = posCartToPedidoItemsPayload(posCartRef.current);

      const updateResp = await backofficeApi.updatePedido(currentId, {
        mesaId: pedido?.mesaId ?? pedido?.MesaId ?? Number(tableForSync.id),
        clienteId: pedido?.clienteId ?? pedido?.ClienteId ?? null,
        meseroId: pedido?.meseroId ?? pedido?.MeseroId ?? null,
        estado: pedido?.estado ?? pedido?.Estado ?? "Listo",
        estadoCocina: pedido?.estadoCocina ?? pedido?.EstadoCocina ?? "Listo",
        observaciones: pedido?.observaciones ?? pedido?.Observaciones ?? null,
        items,
      });

      const vacio = Boolean(updateResp?.vacio ?? updateResp?.Vacio);
      if (vacio) {
        setPosOrderId(null);
        setPosCart([]);
        posCartRef.current = [];
        setPosCommitted(true);
        await loadTables();
        await refreshPosTableFromBackend(tableForSync.id);
        return null;
      }

      const pedidoActualizado = await backofficeApi.getPedido(currentId).catch(() => null);
      const backendItems = getOrdenItems(pedidoActualizado);
      const syncedCart = backendItems ? mapBackendItemsToCart(backendItems) : [];
      posCartRef.current = syncedCart;
      setPosCart(syncedCart);

      setPosCommitted(true);
      await loadTables();
      if (syncedCart.length > 0) {
        try {
          await backofficeApi.patchMesaEstado(Number(tableForSync.id), "Ocupada");
        } catch {
          /* puede ya estar ocupada */
        }
      }
      await refreshPosTableFromBackend(tableForSync.id);
      return currentId;
    } catch (e) {
      const msg = e?.message || "No se pudo enviar la orden.";
      const status = e?.status;
      const normalized = normalizeApiErrorMessage(msg);
      const stockConflict = isStockShortageConflict409(status, normalized, false);
      if (status === 409 && tableForSync) {
        try {
          const pedido = await backofficeApi.getPedido(currentId);
          const backendItems = getOrdenItems(pedido);
          if (backendItems) setPosCart(mapBackendItemsToCart(backendItems));
        } catch {
          /* ignore */
        }
      }
      snackbar.error(stockConflict && !/^stock\b/i.test(msg) ? `Stock: ${msg}` : msg);
      throw e;
    } finally {
      if (manageBusy) {
        clearBusyUi(setPosActionBusy, setPosBusyMessage);
      }
    }
  };

  const openCancelPosPin = () => {
    if (!posTable || posActionBusy || saleProcessing) return;
    if (!posOrderIdRef.current) {
      snackbar.info("No había una orden activa para cancelar.");
      return;
    }
    setPosCancelPinOpen(true);
  };

  const executePosCancelarConPin = async (codigo) => {
    if (!posTable || !posOrderId) throw new Error("No hay orden para cancelar.");
    await runWithBusyUi(
      { setBusy: setPosActionBusy, setMessage: setPosBusyMessage, caption: "Cancelando pedido…" },
      async () => {
        setError("");
        await backofficeApi.posCancelarOrden(posOrderId, codigo);
        snackbar.success("Pedido cancelado.");
        setPosCancelPinOpen(false);
        const remainingOrders = await refreshPosActiveOrders();
        if (remainingOrders.length > 0) {
          await switchPosOrder(remainingOrders[0].id, true);
        } else {
          snackbar.success("Mesa liberada.");
          await closePosView();
          await loadTables();
        }
      },
    );
  };

  const handleEnviarCocina = async () => {
    if (!posTable) return;
    if (posActionBusy) return;
    try {
      await runWithBusyUi(
        { setBusy: setPosActionBusy, setMessage: setPosBusyMessage, caption: "Enviando a cocina…" },
        async () => {
          if (posCart.length > 0) await ensurePosOrderSynced({ manageBusy: false });

          const activeOrderId = posOrderId ?? posOrderIdRef.current;
          if (!activeOrderId) throw new Error("No hay orden activa para enviar a cocina.");

          // Si la orden ya existía (posCart vacío), cargamos items para mantener UI sincronizada.
          if (!posCommitted && posCartRef.current.length === 0) {
            const freshRaw = await backofficeApi.getMesaOrdenActiva(posTable.id).catch(() => null);
            const fresh = unwrapEnvelope(freshRaw);
            const items = getOrdenItems(fresh);
            if (items) setPosCart(mapBackendItemsToCart(items));
            setPosCommitted(true);
          }

          const { data, message } = await backofficeApi.pedidoEnviarCocina(activeOrderId);
          const infoMsg = typeof message === "string" ? message.trim() : "";
          if (infoMsg) snackbar.info(infoMsg);
          else snackbar.success("Orden enviada a cocina.");

          await printKitchenTicketAfterEnviarCocina(data, snackbar);

          await closePosView();
        },
      );
    } catch (e) {
      const msg = e?.message || "No se pudo enviar a cocina.";
      snackbar.error(msg);
    }
  };

  const openProcesarVentaModal = async () => {
    if (!posTable) return;
    if (posActionBusy || saleProcessing) return;
    if (!isCajeroOrAdmin) {
      snackbar.error("Solo cajeros y administradores pueden procesar pagos.");
      return;
    }
    try {
      await runWithBusyUi(
        { setBusy: setPosActionBusy, setMessage: setPosBusyMessage, caption: "Preparando cobro…" },
        async () => {
          setError("");
          if (posCart.length > 0) await ensurePosOrderSynced({ manageBusy: false });

          // Si hay múltiples cuentas en la mesa, refrescar antes de cobrar para evitar
          // cobros duplicados en entornos multi-terminal donde otra terminal pudo
          // haber separado o cobrado una cuenta en el intervalo.
          if (posActiveOrdersRef.current.length > 1) {
            await refreshPosActiveOrders();
          }

          let ordenId = posOrderId ?? posOrderIdRef.current;
          let lines = posCartToModalLines(posCartRef.current);

          if (lines.length === 0) {
            const raw = await backofficeApi.getMesaOrdenActiva(posTable.id);
            const order = unwrapEnvelope(raw);
            if (!order) throw new Error("No hay orden activa para cobrar.");
            ordenId = getOrdenPedidoId(order, ordenId);
            const backendItems = getOrdenItems(order);
            if (!backendItems?.length) throw new Error("La orden no tiene productos.");
            lines = posCartToModalLines(mapBackendItemsToCart(backendItems));
          }

          if (!ordenId) throw new Error("No hay orden activa para cobrar.");

          let totalBackend = null;
          try {
            const pedido = await backofficeApi.getPedido(ordenId);
            totalBackend = getPedidoMontoNumeric(pedido);
          } catch {
            /* ignore */
          }

          setSaleModalLines(lines);
          setSaleBackendTotal(totalBackend);
          setSaleOrdenId(ordenId);
          setSaleModalOpen(true);
        },
      );
    } catch (e) {
      const msg = e?.message || "No se pudo abrir cobro.";
      snackbar.error(msg);
    }
  };

  const handleGuardarVenta = async (form) => {
    if (!posTable || !saleOrdenId) return;
    if (saleProcessingGuardRef.current) return;
    try {
      saleProcessingGuardRef.current = true;
      setSaleProcessing(true);
      setError("");
      const payload = buildPagoPayload({
        ordenId: saleOrdenId,
        form,
        defaultObservaciones: "Pago POS",
      });

      let resp;
      try {
        resp = await backofficeApi.ventasGestionarPago(payload);
      } catch (err) {
        const st = err?.status;
        if (st !== 404 && st !== 405) throw err;
        resp = await backofficeApi.ventasProcesarPago(payload);
      }

      if (pagoResponseHasReciboPrintChannel(resp)) {
        const printed = await tryPrintReciboFromPagoResponse(resp);
        if (!printed) snackbar.warning("Venta procesada, pero no se pudo imprimir el recibo.");
      }

      snackbar.success("Venta procesada.");
      window.dispatchEvent(new CustomEvent("barrest-inventory-updated"));
      setSaleModalOpen(false);
      setSaleOrdenId(null);
      setSaleModalLines([]);
      setSaleBackendTotal(null);
      const remainingOrders = await refreshPosActiveOrders();
      if (remainingOrders.length > 0) {
        await switchPosOrder(remainingOrders[0].id, true);
      } else {
        await closePosView();
        await loadTables();
      }
    } catch (e) {
      const msg = e?.message || "No se pudo registrar el pago.";
      snackbar.error(msg);
    } finally {
      setSaleProcessing(false);
      saleProcessingGuardRef.current = false;
    }
  };

  const handleImprimirCuenta = async () => {
    if (!posTable) return;
    if (posActionBusy || saleProcessing) return;
    try {
      await runWithBusyUi(
        { setBusy: setPosActionBusy, setMessage: setPosBusyMessage, caption: "Cargando pre-cuenta…" },
        async () => {
          setError("");
          if (posCart.length > 0) await ensurePosOrderSynced({ manageBusy: false });
          let ordenId = posOrderId ?? posOrderIdRef.current;

          if (!ordenId) {
            const raw = await backofficeApi.getMesaOrdenActiva(posTable.id);
            const order = unwrapEnvelope(raw);
            if (!order) throw new Error("No hay orden para imprimir.");
            ordenId = getOrdenPedidoId(order, null);
          }
          if (!ordenId) throw new Error("No se encontró el ID de la orden.");

          // 1. Intentamos obtener el TEXTO del backend para la previsualización
          let text = "";
          const companyName = (() => { try { return localStorage.getItem("pos_app_name") || "BarRestPOS"; } catch { return "BarRestPOS"; } })();
          try {
            const fetchUrl = withImpressionAccessTokenQuery(resolveBackendAssetUrl(`/api/v1/impresion/comanda/${ordenId}/preview`));
            const res = await fetch(fetchUrl, {
              headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) {
              const data = await res.json();
              text = data.preview;
              // Reemplazar placeholders hardcodeados del backend con valores reales
              text = text.replace(/^[ \t]*\[LOGO DEL NEGOCIO\][ \t]*\n?/m, "")
                .replace(/BarResPos/gi, companyName);
            }
          } catch {
            /* ignore */
          }

          // Si obtuvimos el texto del backend, abrimos la previsualización nativa
          if (text) {
            window.dispatchEvent(
              new CustomEvent("show-ticket-preview", {
                detail: {
                  text,
                  onConfirmPrint: async () => {
                    const printed = await openBackendPrintUrl(`/api/v1/impresion/comanda/${ordenId}`);
                    if (printed) snackbar.success("Enviado a la impresora física.");
                    else snackbar.warning("No se pudo imprimir. Verifique la impresora.");
                  },
                  onCancelPrint: () => { },
                },
              })
            );
            return;
          }

          // Fallback: Si no hay texto del backend, generamos texto local
          let lines = posCartToModalLines(posCartRef.current);

          if (lines.length === 0) {
            const raw = await backofficeApi.getMesaOrdenActiva(posTable.id);
            const order = unwrapEnvelope(raw);
            if (!order) throw new Error("No hay orden para imprimir.");
            const backendItems = getOrdenItems(order);
            if (!backendItems?.length) throw new Error("No hay productos en la orden.");
            lines = posCartToModalLines(mapBackendItemsToCart(backendItems));
          }

          let total = lines.reduce((s, x) => s + x.lineTotal, 0);
          const oid = posOrderId ?? posOrderIdRef.current;
          if (oid) {
            try {
              const pedido = await backofficeApi.getPedido(oid);
              const m = getPedidoMontoNumeric(pedido);
              if (m != null) total = m;
            } catch {
              /* ignore */
            }
          }

          const sym = currencySymbol;
          const hasLogo = (() => { try { return !!localStorage.getItem("pos_logo_url"); } catch { return false; } })();
          const logoLine = hasLogo ? `       [LOGO]` : `       ${companyName}`;
          const fechaLocal = new Date().toLocaleString("es-NI", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
          let fallbackText = `${logoLine}\n       ${companyName}\n------------------------------------------------\nCOMANDA: ${ordenId}\nMESA:   ${posTable.displayId}\nFECHA:  ${fechaLocal}\n------------------------------------------------\nCANT PRODUCTO                PRECIO\n------------------------------------------------\n`;
          lines.forEach(x => {
            fallbackText += `${String(x.qty).padEnd(6)}${String(x.name).substring(0, 25).padEnd(28)}${formatCurrency(x.lineTotal, sym).padStart(14)}\n`;
          });
          fallbackText += `------------------------------------------------\nTOTAL:                                ${formatCurrency(total, sym).padStart(14)}\n------------------------------------------------\n       Comanda para mesero\n       ${fechaLocal}`;

          window.dispatchEvent(
            new CustomEvent("show-ticket-preview", {
              detail: {
                text: fallbackText,
                onConfirmPrint: async () => {
                  const printed = await openBackendPrintUrl(`/api/v1/impresion/comanda/${ordenId}`);
                  if (printed) snackbar.success("Enviado a la impresora física.");
                  else snackbar.warning("No se pudo imprimir. Verifique la impresora.");
                },
                onCancelPrint: () => { },
              },
            })
          );
        }
      );
    } catch (e) {
      const msg = e?.message || "No se pudo cargar la cuenta.";
      snackbar.error(msg);
    }
  };

  useEffect(() => {
    if (typeof onPosOpenChange === "function") onPosOpenChange(posOpen);
  }, [onPosOpenChange, posOpen]);

  useEffect(() => {
    if (!activeTableMenu) return;
    const onDocMouseDown = (e) => {
      const t = e.target;
      if (t?.closest?.("[data-table-menu-trigger]")) return;
      if (t?.closest?.("[data-table-menu]")) return;
      setActiveTableMenu(null);
    };
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [activeTableMenu]);

  useEffect(() => {
    if (!planoFullScreen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setPlanoFullScreen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [planoFullScreen]);

  if (loading) {
    return <BackofficeStatCardsListSkeleton listRows={5} />;
  }

  if (posOpen && posTable) {
    return (
      <>
        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-3 shadow-sm lg:h-[calc(100vh-10.5rem)]">
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-slate-800">
                {String(posTable.zone || "").toUpperCase()} | {posTable.displayId}
              </h2>
              {mesaEsReservada(posTable) && !posOrderId ? (
                <p className="mt-0.5 text-xs text-violet-800">
                  Mesa <strong>reservada</strong>. Agrega productos a la orden para pasarla a <strong className="text-rose-700">ocupada</strong>.
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-slate-500">Selecciona productos para esta mesa.</p>
              )}
            </div>
            <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-2">
              {!posOrderId && normalizeMesaEstado(posTable.status) === "Libre" && (
                <button
                  type="button"
                  onClick={() => void handleReservarMesa()}
                  disabled={posActionBusy || !cajaAbierta}
                  className="inline-flex items-center gap-1 rounded-lg border border-violet-800 bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Bookmark className="h-3.5 w-3.5 shrink-0" />
                  Reservar mesa
                </button>
              )}
              {!posOrderId && mesaEsReservada(posTable) && (
                <button
                  type="button"
                  onClick={() => void handleLiberarReserva()}
                  disabled={posActionBusy || !cajaAbierta}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Quitar reserva
                </button>
              )}
              {posOrderId && (
                <button
                  type="button"
                  onClick={() => void openMoveOrderDialog()}
                  disabled={posActionBusy}
                  className="inline-flex items-center gap-1 rounded-lg border border-violet-300 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-900 hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 shrink-0" />
                  Trasladar pedido
                </button>
              )}
              {posCart.length >= 1 && (
                <button
                  type="button"
                  onClick={() => setSplitOrderOpen(true)}
                  disabled={posActionBusy}
                  className="inline-flex items-center gap-1 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-xs font-semibold text-orange-900 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" /></svg>
                  Separar cuenta
                </button>
              )}
              <button
                type="button"
                onClick={closePosView}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver a mesas
              </button>
            </div>
          </div>

          <div className="mb-3 overflow-x-auto rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-2 shadow-sm">
            <div className="flex w-max min-w-full gap-2">
              <button
                type="button"
                onClick={() => setPosCategory("")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-[11px] font-bold transition-all duration-200 ${!posCategory ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                TODOS
              </button>
              {posCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setPosCategory(String(c.id))}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-[11px] font-bold transition-all duration-200 ${String(posCategory) === String(c.id) ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                >
                  {(c.nombre || c.descripcion || "Categoria").toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => setPosMobileTab("products")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${posMobileTab === "products" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700"
                }`}
            >
              Productos
            </button>
            <button
              type="button"
              onClick={() => setPosMobileTab("order")}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${posMobileTab === "order" ? "bg-slate-900 text-white" : "border border-slate-300 bg-white text-slate-700"
                }`}
            >
              Orden ({posCart.length})
            </button>
          </div>

          <div className="min-h-0 flex-1 lg:hidden">
            {posMobileTab === "products" ? (
              <article className="h-full rounded-md border border-slate-300 bg-white p-3">
                {posInlineOpcionesPick && posInlineOpcionesProduct ? (
                  <PosInlineOpcionesPanel
                    product={posInlineOpcionesProduct}
                    grupoId={posInlineOpcionesPick.grupoId}
                    opciones={posInlineOpcionesPick.opciones}
                    onPickOpcion={pickPosInlineOpcion}
                    onBack={() => setPosInlineOpcionesProduct(null)}
                    currencySymbol={currencySymbol}
                    disabled={posActionBusy || !cajaAbierta}
                    gridClassName={`max-h-[55vh] ${posProductGridClass}`}
                    tileClassName={posOpcionTileShell}
                  />
                ) : (
                  <>
                    <input
                      value={posSearch}
                      onChange={(e) => setPosSearch(e.target.value)}
                      placeholder="Búsqueda de productos"
                      className="mb-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                    {posLoading ? (
                      <ListSkeleton rows={4} />
                    ) : (
                      <div className={`max-h-[55vh] ${posProductGridClass}`}>
                        {filteredPosProducts.map((p) => (
                          <PosProductCatalogTile
                            key={p.id}
                            product={p}
                            onClick={() => addProductToCart(p)}
                            disabled={posActionBusy || !cajaAbierta}
                          />
                        ))}
                        {filteredPosProducts.length === 0 && (
                          <p className="col-span-2 py-8 text-center text-xs text-slate-500">Sin productos para mostrar.</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </article>
            ) : (
              <article className="flex h-full min-h-[52vh] flex-col rounded-md border border-slate-300 bg-white p-3">
                {posActiveOrders.length > 1 && (
                  <div className="mb-2 flex gap-1 overflow-x-auto">
                    {posActiveOrders.map((ord, idx) => (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => switchPosOrder(ord.id)}
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition-all ${ord.id === posOrderId
                          ? "bg-orange-500 text-white shadow"
                          : "border border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100"
                          }`}
                      >
                        Cuenta {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
                <h3 className="mb-2 text-sm font-semibold text-slate-800">Orden</h3>
                <div className="min-h-0 flex-1 space-y-2 overflow-auto rounded-md border border-slate-200 p-2">
                  {posLoading ? (
                    <ListSkeleton rows={6} />
                  ) : (
                    <>
                      {posCart.length === 0 && <p className="py-8 text-center text-xs text-slate-500">Sin productos en la orden.</p>}
                      {posCart.map((item) => (
                        <div key={item.lineId} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                              {item.opcionesResumen ? (
                                <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{item.opcionesResumen}</p>
                              ) : null}
                              <input
                                type="text"
                                value={item.notas ?? ""}
                                onChange={(e) => updateCartNotas(item.lineId, e.target.value)}
                                disabled={posActionBusy || (item.estado !== "Pending" && item.estado !== "Pendiente" && parsePosBackendLineId(item.lineId) !== null)}
                                placeholder="Nota adicional"
                                className="mt-1.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-800 placeholder:text-slate-400"
                              />
                            </div>
                            {item.estado !== "Pending" && item.estado !== "Pendiente" && parsePosBackendLineId(item.lineId) !== null ? (
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.lineId)}
                                disabled={posActionBusy}
                                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                title="Autorización requerida (PIN)"
                              >
                                <Lock className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.lineId)}
                                disabled={posActionBusy}
                                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-red-200 text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-slate-600">
                            <div className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white p-0.5">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.lineId, -1)}
                                disabled={posActionBusy}
                                className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="min-w-5 text-center font-semibold text-slate-800">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.lineId, 1)}
                                disabled={posActionBusy}
                                className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                            <span>P/U: {formatCurrency(item.price, currencySymbol)}</span>
                            <span className="font-semibold text-slate-800">{formatCurrency(item.price * item.qty, currencySymbol)}</span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
                {posCart.length > 0 && (
                  <>
                    <div className="mt-2 space-y-1 text-xs text-slate-700">
                      <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(posSubtotal, currencySymbol)}</span></div>
                      <div className="flex justify-between"><span>Total</span><span className="font-bold">{formatCurrency(posSubtotal, currencySymbol)}</span></div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-slate-200 pt-2">
                      <button type="button" onClick={openCancelPosPin} disabled={posActionBusy} className="inline-flex items-center justify-center gap-1 rounded-sm bg-red-500 px-2 py-2 text-[11px] font-semibold text-white disabled:opacity-60">
                        <XCircle className="h-3.5 w-3.5" />
                        Cancelar
                      </button>
                      <button type="button" onClick={handleImprimirCuenta} disabled={posActionBusy || saleProcessing} className="inline-flex items-center justify-center gap-1 rounded-sm bg-sky-500 px-2 py-2 text-[11px] font-semibold text-white disabled:opacity-60">
                        <Printer className="h-3.5 w-3.5" />
                        Imprimir cuenta
                      </button>
                      <button type="button" onClick={handleEnviarCocina} disabled={posActionBusy || saleProcessing} className="inline-flex items-center justify-center gap-1 rounded-sm bg-amber-500 px-2 py-2 text-[11px] font-semibold text-white disabled:opacity-60">
                        <ChefHat className="h-3.5 w-3.5" />
                        Mandar orden
                      </button>
                      {isCajeroOrAdmin && (
                        <button type="button" onClick={openProcesarVentaModal} disabled={posActionBusy || saleProcessing} className="inline-flex items-center justify-center gap-1 rounded-sm bg-emerald-600 px-2 py-2 text-[11px] font-semibold text-white disabled:opacity-60">
                          <Save className="h-3.5 w-3.5" />
                          Procesar orden
                        </button>
                      )}
                    </div>
                  </>
                )}

                {(posCart.length === 0 && posOrderId) && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-slate-200 pt-2">
                    <button type="button" onClick={openCancelPosPin} disabled={posActionBusy} className="inline-flex items-center justify-center gap-1 rounded-sm bg-red-500 px-2 py-2 text-[11px] font-semibold text-white disabled:opacity-60">
                      <XCircle className="h-3.5 w-3.5" />
                      Cancelar
                    </button>
                    <button type="button" onClick={handleImprimirCuenta} disabled={posActionBusy || saleProcessing} className="inline-flex items-center justify-center gap-1 rounded-sm bg-sky-500 px-2 py-2 text-[11px] font-semibold text-white disabled:opacity-60">
                      <Printer className="h-3.5 w-3.5" />
                      Imprimir cuenta
                    </button>
                    <button type="button" onClick={handleEnviarCocina} disabled={posActionBusy || saleProcessing} className="inline-flex items-center justify-center gap-1 rounded-sm bg-amber-500 px-2 py-2 text-[11px] font-semibold text-white disabled:opacity-60">
                      <ChefHat className="h-3.5 w-3.5" />
                      Mandar orden
                    </button>
                    {isCajeroOrAdmin && (
                      <button type="button" onClick={openProcesarVentaModal} disabled={posActionBusy || saleProcessing} className="inline-flex items-center justify-center gap-1 rounded-sm bg-emerald-600 px-2 py-2 text-[11px] font-semibold text-white disabled:opacity-60">
                        <Save className="h-3.5 w-3.5" />
                        Procesar orden
                      </button>
                    )}
                  </div>
                )}
              </article>
            )}
          </div>

          {posCart.length > 0 && posMobileTab === "products" && (
            <div className="sticky bottom-0 z-10 mt-3 flex items-center justify-between rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm lg:hidden">
              <div>
                <p className="text-[11px] text-slate-500">Total</p>
                <p className="text-sm font-bold text-slate-800">{formatCurrency(posSubtotal, currencySymbol)}</p>
              </div>
              <button
                type="button"
                onClick={() => setPosMobileTab("order")}
                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
              >
                Ver orden ({posCart.length})
              </button>
            </div>
          )}

          <div className="hidden min-h-0 flex-1 grid-cols-1 gap-3 lg:grid lg:grid-cols-[1.45fr_1fr]">
            <article className="flex min-h-0 h-full flex-col rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm p-4 shadow-lg shadow-slate-200/50">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold text-slate-800">Orden</h3>
                {posActiveOrders.length > 1 && (
                  <div className="flex gap-1 overflow-x-auto">
                    {posActiveOrders.map((ord, idx) => (
                      <button
                        key={ord.id}
                        type="button"
                        onClick={() => switchPosOrder(ord.id)}
                        className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-bold transition-all ${ord.id === posOrderId
                          ? "bg-orange-500 text-white shadow"
                          : "border border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-100"
                          }`}
                      >
                        Cuenta {idx + 1}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-100">
                {posLoading ? (
                  <ListSkeleton rows={7} />
                ) : (
                  <table className="w-full text-xs">
                    <thead className="bg-slate-50 text-left text-slate-500">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Producto</th>
                        <th className="w-[min(28vw,9rem)] px-2 py-2 font-semibold">Nota</th>
                        <th className="px-3 py-2 font-semibold">CNT</th>
                        <th className="px-3 py-2 font-semibold">P/U</th>
                        <th className="px-3 py-2 font-semibold">PT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posCart.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-2 py-6 text-center text-slate-500">
                            Sin productos en la orden.
                          </td>
                        </tr>
                      )}
                      {posCart.map((item) => (
                        <tr key={item.lineId} className="border-t border-slate-100">
                          <td className="px-2 py-2 align-middle">
                            <div className="font-medium text-slate-800">{item.name}</div>
                            {item.opcionesResumen ? (
                              <div className="mt-0.5 text-[10px] text-slate-500">{item.opcionesResumen}</div>
                            ) : null}
                          </td>
                          <td className="px-1 py-2 align-middle">
                            <input
                              type="text"
                              value={item.notas ?? ""}
                              onChange={(e) => updateCartNotas(item.lineId, e.target.value)}
                              disabled={posActionBusy || (item.estado !== "Pending" && item.estado !== "Pendiente" && parsePosBackendLineId(item.lineId) !== null)}
                              placeholder="Nota adicional"
                              className="box-border w-full min-w-0 rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-800 placeholder:text-slate-400"
                            />
                          </td>
                          <td className="px-2 py-2 align-middle">
                            <div className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white p-0.5">
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.lineId, -1)}
                                disabled={posActionBusy}
                                className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="min-w-5 text-center font-semibold text-slate-800">{item.qty}</span>
                              <button
                                type="button"
                                onClick={() => updateCartQty(item.lineId, 1)}
                                disabled={posActionBusy}
                                className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 align-middle">
                            {formatCurrency(item.price, currencySymbol)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 align-middle font-semibold">
                            <div className="flex items-center justify-between gap-2">
                              <span>{formatCurrency(item.price * item.qty, currencySymbol)}</span>
                              {item.estado !== "Pending" && item.estado !== "Pendiente" && parsePosBackendLineId(item.lineId) !== null ? (
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.lineId)}
                                  disabled={posActionBusy}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
                                  title="Autorización requerida (PIN)"
                                >
                                  <Lock className="h-3.5 w-3.5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => removeFromCart(item.lineId)}
                                  disabled={posActionBusy}
                                  className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-red-200 text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              {posCart.length > 0 && (
                <div className="mt-2 ml-auto w-full max-w-[220px] space-y-1 text-xs text-slate-700">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(posSubtotal, currencySymbol)}</span></div>
                  <div className="flex justify-between"><span>Total</span><span className="font-bold">{formatCurrency(posSubtotal, currencySymbol)}</span></div>
                </div>
              )}

              {(posCart.length > 0 || posOrderId) && (
                <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button type="button" onClick={openCancelPosPin} disabled={posActionBusy} className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-red-500/20 transition-all duration-200 hover:bg-red-600 disabled:opacity-60">
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                  <button type="button" onClick={handleImprimirCuenta} disabled={posActionBusy || saleProcessing} className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-sky-500/20 transition-all duration-200 hover:bg-sky-600 disabled:opacity-60">
                    <Printer className="h-3.5 w-3.5" />
                    Imprimir cuenta
                  </button>
                  <button type="button" onClick={handleEnviarCocina} disabled={posActionBusy || saleProcessing} className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-amber-500/20 transition-all duration-200 hover:bg-amber-600 disabled:opacity-60">
                    <ChefHat className="h-3.5 w-3.5" />
                    Mandar orden
                  </button>
                  {isCajeroOrAdmin && (
                    <button type="button" onClick={openProcesarVentaModal} disabled={posActionBusy || saleProcessing} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-700 disabled:opacity-60">
                      <Save className="h-3.5 w-3.5" />
                      Procesar orden
                    </button>
                  )}
                </div>
              )}
            </article>

            <article className="min-h-[340px] rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm p-4 shadow-lg shadow-slate-200/50 lg:min-h-0 lg:h-full">
              {posInlineOpcionesPick && posInlineOpcionesProduct ? (
                <PosInlineOpcionesPanel
                  product={posInlineOpcionesProduct}
                  grupoId={posInlineOpcionesPick.grupoId}
                  opciones={posInlineOpcionesPick.opciones}
                  onPickOpcion={pickPosInlineOpcion}
                  onBack={() => setPosInlineOpcionesProduct(null)}
                  currencySymbol={currencySymbol}
                  disabled={posActionBusy || !cajaAbierta}
                  gridClassName={`max-h-[420px] ${posProductGridClass} lg:h-[calc(100%-5.5rem)] lg:max-h-full`}
                  tileClassName={posOpcionTileShell}
                />
              ) : (
                <>
                  <input
                    value={posSearch}
                    onChange={(e) => setPosSearch(e.target.value)}
                    placeholder="Búsqueda de productos"
                    className="mb-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/10 transition-all"
                  />
                  {posLoading ? (
                    <ListSkeleton rows={4} />
                  ) : (
                    <div className={`max-h-[420px] ${posProductGridClass} lg:h-[calc(100%-2.5rem)] lg:max-h-full`}>
                      {filteredPosProducts.map((p) => (
                        <PosProductCatalogTile
                          key={p.id}
                          product={p}
                          onClick={() => addProductToCart(p)}
                          disabled={posActionBusy || !cajaAbierta}
                        />
                      ))}
                      {filteredPosProducts.length === 0 && (
                        <p className="col-span-2 py-8 text-center text-xs text-slate-500">Sin productos para mostrar.</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </article>
          </div>
        </section>

        <PosProductOpcionesModal
          open={posOpcionesModal.open}
          product={posOpcionesModal.product}
          currencySymbol={currencySymbol}
          onClose={() => setPosOpcionesModal({ open: false, product: null })}
          onConfirm={(opcionesSeleccionadas) => {
            const p = posOpcionesModal.product;
            setPosOpcionesModal({ open: false, product: null });
            if (!p) return;
            confirmAddProductWithOpciones(p, opcionesSeleccionadas);
          }}
        />

        <PosActionLoadingOverlay
          open={Boolean(posActionBusy || saleProcessing)}
          saleProcessing={saleProcessing}
          detailMessage={posBusyMessage}
        />

        <PosProcesarVentaModal
          open={saleModalOpen}
          onClose={() => {
            if (!saleProcessing) {
              setSaleModalOpen(false);
              setSaleOrdenId(null);
              setSaleModalLines([]);
              setSaleBackendTotal(null);
            }
          }}
          mesaLabel={`${String(posTable?.zone || "").toUpperCase()} | ${posTable?.displayId || ""}`}
          currencySymbol={currencySymbol}
          exchangeRate={tipoCambio ?? DEFAULT_TIPO_CAMBIO_USD}
          lines={saleModalLines}
          totalOrdenBackend={saleBackendTotal}
          busy={saleProcessing}
          onGuardar={handleGuardarVenta}
        />


        {posCancelPinOpen && (
          <CancelPedidoPinModal
            open
            onClose={() => !posActionBusy && setPosCancelPinOpen(false)}
            loading={posActionBusy}
            title="Cancelar pedido en mesa"
            message="Ingresá el PIN de autorización para cancelar la orden y liberar la mesa."
            onConfirm={executePosCancelarConPin}
          />
        )}

        {posCancelItemPinOpen && (
          <CancelPedidoPinModal
            open
            onClose={() => !posActionBusy && setPosCancelItemPinOpen(false)}
            loading={posActionBusy}
            title="Cancelar producto"
            message="Ingresá el PIN de autorización para eliminar el producto de esta orden."
            onConfirm={confirmCancelItemWithPin}
          />
        )}

        {moveOrderOpen && posTable && (() => {
          const moveOrderZones = ["", ...new Set(moveOrderCandidates.map((t) => t.zone).filter(Boolean))];
          const filteredCandidates = moveOrderCandidates.filter((t) => {
            const matchesSearch =
              !moveOrderSearch ||
              t.displayId.toLowerCase().includes(moveOrderSearch.toLowerCase()) ||
              (t.zone || "").toLowerCase().includes(moveOrderSearch.toLowerCase());
            const matchesZone = !moveOrderSelectedZone || t.zone === moveOrderSelectedZone;
            return matchesSearch && matchesZone;
          });
          return (
            <BackofficeDialog
              maxWidthClass="max-w-4xl"
              onBackdropClick={posActionBusy ? undefined : () => {
                setMoveOrderOpen(false);
                setMoveOrderCandidates([]);
              }}
            >
              <form onSubmit={handleConfirmTrasladarPedido} className="w-full min-w-0 p-0 overflow-hidden">
                <div className="flex flex-col md:flex-row md:min-h-[500px]">

                  {/* Columna Izquierda: Detalles del Ticket (Fondo Claro Premium) */}
                  <div className="md:w-2/5 bg-slate-50 text-slate-700 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
                    <div className="flex flex-col gap-4">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full border border-violet-100">
                          Ticket Activo
                        </span>
                        <h4 className="text-lg font-extrabold text-slate-850 mt-3 truncate">
                          {posTable.displayId}
                        </h4>
                      </div>

                      {/* Lista de productos en el ticket */}
                      <div className="mt-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Productos a Trasladar
                        </p>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                          {posCart.length === 0 ? (
                            <p className="text-xs text-slate-450 italic py-4">
                              Sin productos en la orden activa.
                            </p>
                          ) : (
                            posCart.map((item) => (
                              <div key={item.lineId} className="flex justify-between items-start text-xs py-1.5 border-b border-slate-200/60 last:border-0">
                                <div className="min-w-0 pr-2">
                                  <p className="font-bold text-slate-700 truncate">{item.name}</p>
                                  {item.opcionesResumen && (
                                    <p className="text-[9px] text-slate-500 truncate leading-snug">{item.opcionesResumen}</p>
                                  )}
                                  <p className="text-[10px] text-slate-500 mt-0.5">
                                    {item.qty} x {formatCurrency(item.price, currencySymbol)}
                                  </p>
                                </div>
                                <span className="font-bold text-violet-600 shrink-0">
                                  {formatCurrency(item.price * item.qty, currencySymbol)}
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Resumen del Total */}
                    <div className="pt-4 border-t border-slate-200 mt-4 md:mt-0">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtotal</span>
                        <span className="text-xl font-black text-violet-600">
                          {formatCurrency(posSubtotal, currencySymbol)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Columna Derecha: Selector de Mesa Destino (Fondo Blanco Limpio) */}
                  <div className="md:w-3/5 bg-white p-6 flex flex-col justify-between">
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-800">
                          Seleccionar Mesa Destino
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Elige una de las mesas libres en el catálogo.
                        </p>
                      </div>

                      {/* Buscador de Mesas */}
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Buscar mesa por nombre o zona..."
                          value={moveOrderSearch}
                          onChange={(e) => setMoveOrderSearch(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/25 focus:border-violet-500 transition bg-slate-50/50 hover:bg-slate-50"
                        />
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                        </span>
                      </div>

                      {/* Selector de Zona (Tabs) */}
                      <div className="flex flex-wrap gap-1 border-b border-slate-100 pb-2">
                        {moveOrderZones.map((z) => (
                          <button
                            key={z}
                            type="button"
                            onClick={() => setMoveOrderSelectedZone(z)}
                            className={`rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${moveOrderSelectedZone === z
                              ? "bg-violet-600 text-white shadow-sm shadow-violet-100"
                              : "bg-slate-50 text-slate-650 hover:bg-slate-100 hover:text-slate-800"
                              }`}
                          >
                            {z || "TODAS"}
                          </button>
                        ))}
                      </div>

                      {/* Grid de Mesas */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50/30 p-2.5">
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto pr-1">
                          {filteredCandidates.length === 0 ? (
                            <div className="col-span-full py-12 text-center text-xs text-slate-400 italic">
                              Ninguna mesa libre coincide con los filtros.
                            </div>
                          ) : (
                            filteredCandidates.map((t) => {
                              const isSelected = String(t.id) === moveOrderTargetId;
                              return (
                                <button
                                  key={t.id}
                                  type="button"
                                  onClick={() => setMoveOrderTargetId(String(t.id))}
                                  className={`relative flex flex-col justify-between rounded-xl border p-3 text-left transition duration-200 ease-in-out cursor-pointer ${isSelected
                                    ? "border-violet-600 bg-violet-50/70 shadow-sm shadow-violet-100"
                                    : "border-slate-200/80 bg-white hover:border-slate-350 hover:bg-slate-50/80 hover:shadow-sm"
                                    }`}
                                >
                                  <div>
                                    <span className={`text-[9px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded ${isSelected
                                      ? "bg-violet-100 text-violet-700"
                                      : "bg-slate-100 text-slate-500"
                                      }`}>
                                      {t.zone}
                                    </span>
                                    <h5 className={`text-xs font-bold mt-2 ${isSelected ? "text-violet-950" : "text-slate-800"}`}>
                                      {t.displayId}
                                    </h5>
                                  </div>

                                  <span className="text-[10px] text-slate-400 mt-2 block font-medium">
                                    Capacidad: {t.capacity} pers.
                                  </span>

                                  {isSelected && (
                                    <span className="absolute top-3 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-white">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                    </span>
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botones inferiores */}
                    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end pt-4 border-t border-slate-100 mt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setMoveOrderOpen(false);
                          setMoveOrderCandidates([]);
                        }}
                        disabled={posActionBusy}
                        className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-650 hover:bg-slate-50 transition active:scale-95 sm:w-auto"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={posActionBusy || !moveOrderTargetId}
                        className="w-full rounded-xl bg-violet-600 px-6 py-2.5 text-xs font-bold text-white hover:bg-violet-700 shadow-md shadow-violet-100 transition active:scale-95 disabled:opacity-50 sm:w-auto"
                      >
                        {posActionBusy ? "Trasladando..." : "Confirmar traslado"}
                      </button>
                    </div>
                  </div>

                </div>
              </form>
            </BackofficeDialog>
          );
        })()}
        {splitOrderOpen && (
          <SplitOrderModal
            open={splitOrderOpen}
            onClose={() => setSplitOrderOpen(false)}
            posCart={posCart}
            posActionBusy={posActionBusy}
            onConfirmSeparar={handleSepararCuenta}
            currencySymbol={currencySymbol}
          />
        )}
      </>
    );
  }

  if (planoFullScreen && !posOpen) {
    return (
      <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 select-none font-sans text-slate-800">
        {/* Cabecera premium en tono claro, ultra-limpia */}
        <header className="shrink-0 bg-white border-b border-slate-200 px-4 py-3.5 md:px-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-2.5 w-2.5 animate-ping rounded-full bg-emerald-500" />
            <h2 className="text-lg font-extrabold tracking-tight text-slate-800 sm:text-xl flex items-center gap-2">
              📍 Plano de Distribución de Mesas
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Stats en tono claro con bordes suaves */}
            <span className="rounded-lg bg-slate-100 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
              Total: <span className="font-bold text-slate-900">{tables.length}</span>
            </span>
            <span className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              Libres: <span className="font-bold text-emerald-950">{mesaStats.libres}</span>
            </span>
            <span className="rounded-lg bg-rose-50 border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700">
              Ocupadas: <span className="font-bold text-rose-950">{mesaStats.ocupadas}</span>
            </span>
            <span className="rounded-lg bg-violet-50 border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-800">
              Reservadas: <span className="font-bold text-violet-950">{mesaStats.reservadas}</span>
            </span>
            <span className={`rounded-lg px-3 py-1.5 text-xs font-semibold border ${cajaAbierta
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-rose-50 border-rose-200 text-rose-700"
              }`}>
              Caja: {cajaAbierta ? "Abierta" : "Cerrada"}
            </span>

            {/* Botón Salir en tono claro premium */}
            <button
              type="button"
              onClick={() => setPlanoFullScreen(false)}
              className="ml-2 rounded-lg bg-slate-100 border border-slate-200 hover:bg-slate-200 active:scale-95 px-4 py-2 text-xs font-bold text-slate-700 inline-flex items-center gap-1.5 transition duration-150 ease-in-out shadow-sm cursor-pointer"
              title="Salir de pantalla completa (Esc)"
            >
              <Minimize2 className="h-3.5 w-3.5 text-slate-600" />
              Salir
            </button>
          </div>
        </header>

        {/* El plano ocupa TODO el espacio restante, eliminamos bordes y márgenes de tarjeta */}
        <div className="flex-1 min-h-0 min-w-0 flex flex-col bg-slate-50 relative">
          <TablesMesasFloorPlan
            tables={mesasPlanoList}
            cajaAbierta={cajaAbierta}
            isAdmin={isAdmin}
            tableIllustration={tableIllustration}
            activeTableMenu={activeTableMenu}
            setActiveTableMenu={setActiveTableMenu}
            onOpenPos={openPosView}
            onOpenEdit={openEdit}
            onRequestDelete={(id) => setConfirmDeleteTable({ open: true, id })}
            isFullscreen={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        mesasVistaExpandida
          ? "flex h-full min-h-0 min-w-0 flex-1 flex-col gap-3 sm:gap-4"
          : "min-w-0 space-y-4"
      }
    >
      <section
        className={
          mesasVistaExpandida
            ? "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4"
            : "min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        }
      >
        <div className={mesasVistaExpandida ? "shrink-0" : ""}>
          <TablesMesasStatsBar
            total={tables.length}
            libres={mesaStats.libres}
            ocupadas={mesaStats.ocupadas}
            reservadas={mesaStats.reservadas}
            cajaAbierta={cajaAbierta}
            onUbicaciones={openLocationsManager}
            onNuevaMesa={openCreate}
            layoutMode={mesasLayoutMode}
            onLayoutModeChange={setMesasLayoutMode}
            onToggleMaximize={() => setPlanoFullScreen(true)}
            enableVistaZonas={enableVistaZonas}
            enableVistaPlano={enableVistaPlano}
            isAdmin={isAdmin}
          />
        </div>

        {mesasLayoutMode === "plano" ? (
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <TablesMesasFloorPlan
              tables={mesasPlanoList}
              cajaAbierta={cajaAbierta}
              isAdmin={isAdmin}
              tableIllustration={tableIllustration}
              activeTableMenu={activeTableMenu}
              setActiveTableMenu={setActiveTableMenu}
              onOpenPos={openPosView}
              onOpenEdit={openEdit}
              onRequestDelete={(id) => setConfirmDeleteTable({ open: true, id })}
            />
          </div>
        ) : (
          <TablesMesasZonesGrid
            zones={zones}
            cajaAbierta={cajaAbierta}
            isAdmin={isAdmin}
            tableIllustration={tableIllustration}
            activeTableMenu={activeTableMenu}
            setActiveTableMenu={setActiveTableMenu}
            onOpenPos={openPosView}
            onOpenEdit={openEdit}
            onRequestDelete={(id) => setConfirmDeleteTable({ open: true, id })}
          />
        )}
      </section>

      <TableFormDialog
        open={formOpen}
        form={form}
        setForm={setForm}
        saving={saving}
        locations={locations}
        onClose={() => setFormOpen(false)}
        onSave={saveTable}
      />
      <LocationsManagerDialog
        open={locationsModalOpen}
        saving={saving}
        locations={locations}
        locationForm={locationForm}
        setLocationForm={setLocationForm}
        showInactiveLocations={showInactiveLocations}
        setShowInactiveLocations={setShowInactiveLocations}
        onClose={() => setLocationsModalOpen(false)}
        onSaveLocation={saveLocation}
        onEditLocation={editLocation}
        onToggleActive={toggleLocationActive}
        onDeleteClick={(id, name) => setConfirmDeleteLocation({ open: true, id, name })}
      />
      <DetailDialog
        open={detailOpen}
        table={selectedTable}
        activeOrder={activeOrder}
        onClose={() => setDetailOpen(false)}
      />
      <ConfirmModal
        open={confirmDeleteTable.open}
        onClose={() => setConfirmDeleteTable({ open: false, id: null })}
        onConfirm={async () => {
          if (confirmDeleteTable.id) await removeTable(confirmDeleteTable.id);
        }}
        title="Eliminar mesa"
        message="¿Deseas desactivar esta mesa?"
        confirmLabel="Eliminar"
        variant="danger"
        loading={saving}
      />
      <ConfirmModal
        open={confirmDeleteLocation.open}
        onClose={() => setConfirmDeleteLocation({ open: false, id: null, name: "" })}
        onConfirm={async () => {
          if (confirmDeleteLocation.id) await removeLocation(confirmDeleteLocation.id);
        }}
        title="Eliminar ubicación"
        message={confirmDeleteLocation.name ? `¿Eliminar ubicación "${confirmDeleteLocation.name}"?` : "¿Eliminar ubicación?"}
        confirmLabel="Eliminar"
        variant="danger"
        loading={saving}
      />
    </div>
  );
}
