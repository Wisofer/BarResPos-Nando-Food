import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ChefHat,
  Eye,
  Minus,
  Pencil,
  Plus,
  Printer,
  Save,
  Search,
  ShoppingBag,
  Trash2,
  Lock,
  X,
  XCircle,
} from "lucide-react";
import { backofficeApi } from "../services/backofficeApi.js";
import {
  BackofficeDialog,
  ListSkeleton,
  PosInlineOpcionesPanel,
  PosProductCatalogTile,
  PosProductOpcionesModal,
  PosProcesarVentaModal,
  PosActionLoadingOverlay,
  CancelPedidoPinModal,
} from "../components/index.js";
import { PAGINATION } from "../constants/pagination.js";
import { DEFAULT_TIPO_CAMBIO_USD, formatCurrency } from "../utils/currency.js";
import {
  PRECUENTA_PRINT_READY_INFO,
  openBackendPrintUrl,
  pagoResponseHasReciboPrintChannel,
  printKitchenTicketAfterEnviarCocina,
  tryPrintPrecuentaFromPayload,
  tryPrintReciboFromPagoResponse,
} from "../utils/backofficePrint.js";
import { buildPagoPayload } from "../utils/paymentPayload.js";
import { clearBusyUi, runWithBusyUi } from "../utils/runWithBusyUi.js";
import {
  getPedidoMontoNumeric,
  isPosOrdenVacioResponse,
  mapBackendItemsToCart,
  parsePosBackendLineId,
  posCartToModalLines,
} from "../utils/posPedido.js";
import { buildDeliveryPedidoBody, mapDeliveryListRow } from "../utils/deliveryPedido.js";
import { fetchPosProductosYCategorias } from "../utils/posCatalogLoad.js";
import {
  pagoDescuentoAtribuidoCordobas,
  pagoDescuentoMotivo,
  pagoFecha,
  pagoMontoNetoCobradoCordobas,
  pagoTipo,
  pedidoDescuentoCobroCordobas,
  pedidoPagosLista,
  pedidoSubtotalConsumoCordobas,
  pedidoTotalNetoCobradoCordobas,
} from "../utils/pedidoCobro.js";
import {
  buildOpcionesResumenLocal,
  genPosLineId,
  getSingleGrupoOpcionesForPosInline,
  normalizeOpcionesGrupos,
  normalizeOpcionesSeleccionadas,
  opcionesSeleccionadasKey,
  productoTieneOpcionesVisibles,
  calcularPreciosOpciones,
} from "../utils/productoOpciones.js";
import { useSnackbar } from "../../../contexts/SnackbarContext.jsx";
import { useDebouncedListRefetch } from "../hooks/useDebouncedListRefetch.js";
import {
  getCachedClients,
  saveCachedClient,
  seedClientsFromPastOrders,
} from "../utils/clientStorage.js";

function statusClass(status) {
  if (status === "Listo") return "bg-emerald-50 text-emerald-700";
  if (status === "Entregado") return "bg-blue-50 text-blue-700";
  if (status === "Despacho") return "bg-violet-50 text-violet-700";
  if (status === "Pagado") return "bg-emerald-50 text-emerald-700";
  if (status === "Cancelado") return "bg-rose-50 text-rose-700";
  return "bg-amber-50 text-amber-700";
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  const date = d.toLocaleDateString("es-NI");
  const time = d.toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit", hour12: false });
  return { date, time };
}

function formatDateTimeLabel(value) {
  const parsed = formatDateTime(value);
  if (parsed === "-") return "-";
  return `${parsed.date} ${parsed.time}`;
}

export function DeliveryView({ currencySymbol = "C$", exchangeRate }) {
  const snackbar = useSnackbar();
  const tc = Number(exchangeRate) > 0 ? Number(exchangeRate) : DEFAULT_TIPO_CAMBIO_USD;
  const [openBuilder, setOpenBuilder] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState({ id: null, nombre: "", telefono: "", direccion: "", observaciones: "" });
  const [listRows, setListRows] = useState([]);
  const [listSearch, setListSearch] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [deliveryPedidoId, setDeliveryPedidoId] = useState(null);
  const deliveryPedidoIdRef = useRef(null);
  const cartRef = useRef([]);
  const deliverySyncChainRef = useRef(Promise.resolve());
  const [deliveryCodigo, setDeliveryCodigo] = useState("");
  const [pedidoEstado, setPedidoEstado] = useState("");
  const [actionBusy, setActionBusy] = useState(false);
  const [deliveryBusyMessage, setDeliveryBusyMessage] = useState("");
  const [customerModalOpen, setCustomerModalOpen] = useState(false);

  const [clientSearchQuery, setClientSearchQuery] = useState("");

  const allCachedClients = useMemo(() => {
    if (!customerModalOpen) return [];
    return getCachedClients();
  }, [customerModalOpen]);

  const clientSuggestions = useMemo(() => {
    const q = clientSearchQuery.trim().toLowerCase();
    if (!q) return [];
    return allCachedClients.filter(c =>
      String(c.nombre || "").toLowerCase().includes(q) ||
      String(c.telefono || "").toLowerCase().includes(q)
    ).slice(0, 5);
  }, [clientSearchQuery, allCachedClients]);
  const [deliveryOpcionesModal, setDeliveryOpcionesModal] = useState({ open: false, product: null });
  const [deliveryInlineOpcionesProduct, setDeliveryInlineOpcionesProduct] = useState(null);
  const [saleModalOpen, setSaleModalOpen] = useState(false);
  const [saleModalLines, setSaleModalLines] = useState([]);
  const [saleBackendTotal, setSaleBackendTotal] = useState(null);
  const [saleProcessing, setSaleProcessing] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [cancelDeliveryPin, setCancelDeliveryPin] = useState({ open: false, row: null });
  const [cajaAbierta, setCajaAbierta] = useState(true);
  const [posCancelItemPinOpen, setPosCancelItemPinOpen] = useState(false);
  const [pendingCancelItemLineId, setPendingCancelItemLineId] = useState(null);
  const cajaAbiertaRef = useRef(true);
  cajaAbiertaRef.current = cajaAbierta;

  const syncCajaEstado = useCallback(async () => {
    try {
      const caja = await backofficeApi.cajaEstado();
      const abierta = Boolean(
        caja?.abierta ?? caja?.Abierta ?? (String(caja?.estado ?? caja?.Estado ?? "").toLowerCase() === "abierto")
      );
      setCajaAbierta(abierta);
      return abierta;
    } catch {
      return cajaAbiertaRef.current;
    }
  }, []);

  useEffect(() => {
    void syncCajaEstado();
  }, [syncCajaEstado]);

  useEffect(() => {
    const onFocus = () => {
      void syncCajaEstado();
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [syncCajaEstado]);

  useEffect(() => {
    deliveryPedidoIdRef.current = deliveryPedidoId;
  }, [deliveryPedidoId]);

  useEffect(() => {
    cartRef.current = cart;
  }, [cart]);

  const loadDeliveryList = useCallback(async () => {
    setListLoading(true);
    try {
      const params = {
        page: 1,
        pageSize: Math.min(PAGINATION.LIST_LARGE, 200),
      };
      const q = listSearch.trim();
      if (q) params.q = q;
      const data = await backofficeApi.listDeliveryPedidos(params);
      const raw = data?.items ?? data?.Items ?? [];
      const mapped = raw.map(mapDeliveryListRow).filter(Boolean);
      setListRows(mapped);
      seedClientsFromPastOrders(mapped);
    } catch (e) {
      snackbar.error(e?.message || "No se pudo cargar pedidos delivery.");
      setListRows([]);
    } finally {
      setListLoading(false);
    }
  }, [listSearch, snackbar]);

  const { requestImmediateRefetch } = useDebouncedListRefetch({
    active: !openBuilder,
    debounceKey: listSearch,
    fetchList: loadDeliveryList,
    setLoading: setListLoading,
    debounceMs: 300,
  });

  const closeDeliveryBuilderToList = useCallback(() => {
    requestImmediateRefetch();
    setOpenBuilder(false);
    setDeliveryInlineOpcionesProduct(null);
  }, [requestImmediateRefetch]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      const categoryMatch = !category || String(p.categoriaProductoId || "") === String(category);
      if (!categoryMatch) return false;
      if (!q) return true;
      return `${p.nombre || ""} ${p.codigo || ""}`.toLowerCase().includes(q);
    });
  }, [products, category, search]);

  const subtotal = useMemo(
    () => cart.reduce((sum, x) => sum + Number(x.price || 0) * Number(x.qty || 0), 0),
    [cart]
  );

  const isPedidoBloqueado = pedidoEstado === "Pagado" || pedidoEstado === "Cancelado";

  const deliveryProductGridClass =
    "grid auto-rows-min grid-cols-2 gap-2 overflow-auto content-start items-stretch sm:grid-cols-3";
  /** Solo selector de opciones (sin imagen de producto). */
  const deliveryOpcionTileShell =
    "flex min-h-[96px] w-full flex-col justify-end gap-0.5 rounded-lg border border-slate-200/90 bg-gradient-to-b from-slate-200 to-slate-500 px-2.5 py-2.5 text-left text-[10px] font-bold leading-tight text-white shadow sm:min-h-[104px] [text-shadow:0_0_6px_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.08),0_0_1px_rgba(255,255,255,0.4)]";

  const deliveryInlineOpcionesPick = useMemo(
    () => (deliveryInlineOpcionesProduct ? getSingleGrupoOpcionesForPosInline(deliveryInlineOpcionesProduct) : null),
    [deliveryInlineOpcionesProduct]
  );

  useEffect(() => {
    if (deliveryInlineOpcionesProduct && !deliveryInlineOpcionesPick) {
      setDeliveryInlineOpcionesProduct(null);
    }
  }, [deliveryInlineOpcionesProduct, deliveryInlineOpcionesPick]);

  const applyPedidoDetail = (detail) => {
    const id = Number(detail?.id ?? detail?.Id);
    setDeliveryPedidoId(Number.isFinite(id) ? id : null);
    setDeliveryCodigo(String(detail?.codigo ?? detail?.Codigo ?? "").trim() || (Number.isFinite(id) ? `#${id}` : ""));
    setPedidoEstado(String(detail?.estado ?? detail?.Estado ?? ""));
    const name = detail?.clienteNombre ?? detail?.ClienteNombre ?? "";
    const tel = detail?.clienteTelefono ?? detail?.ClienteTelefono ?? "";
    const dir = detail?.clienteDireccion ?? detail?.ClienteDireccion ?? "";
    const obs = detail?.observaciones ?? detail?.Observaciones ?? "";
    
    let restoredId = null;
    if (name || tel) {
      const cached = getCachedClients();
      const match = cached.find(c => 
        (tel && c.telefono === tel) || 
        (!tel && String(c.nombre || "").trim().toLowerCase() === name.trim().toLowerCase())
      );
      if (match) restoredId = match.id;
    }

    setCustomer({
      id: restoredId,
      nombre: name,
      telefono: tel,
      direccion: dir,
      observaciones: obs,
    });
    const items = detail?.items ?? detail?.Items ?? [];
    setCart(mapBackendItemsToCart(items));
  };

  const openNewDelivery = async () => {
    const ok = await syncCajaEstado();
    if (!ok) {
      snackbar.error("Caja cerrada. Abrí caja desde el menú Caja para tomar pedidos delivery.");
      return;
    }
    setOpenBuilder(true);
    setDeliveryPedidoId(null);
    deliveryPedidoIdRef.current = null;
    setDeliveryCodigo("Nuevo pedido");
    setPedidoEstado("");
    setCart([]);
    setSearch("");
    setCategory("");
    setCustomer({ id: null, nombre: "", telefono: "", direccion: "", observaciones: "" });
    setDeliveryInlineOpcionesProduct(null);
    setLoading(true);
    try {
      const { products: p, categories: c } = await fetchPosProductosYCategorias(
        backofficeApi,
        PAGINATION.POS_PRODUCTOS
      );
      setProducts(p);
      setCategories(c);
    } catch (e) {
      snackbar.error(e?.message || "No se pudo cargar el catalogo para delivery.");
    } finally {
      setLoading(false);
    }
  };

  const ensureCatalogLoaded = async () => {
    if (products.length > 0 && categories.length > 0) return;
    setLoading(true);
    try {
      const { products: p, categories: c } = await fetchPosProductosYCategorias(
        backofficeApi,
        PAGINATION.POS_PRODUCTOS
      );
      setProducts(p);
      setCategories(c);
    } catch (e) {
      snackbar.error(e?.message || "No se pudo cargar el catalogo para delivery.");
    } finally {
      setLoading(false);
    }
  };

  const persistDelivery = async ({ manageBusy = true } = {}) => {
    if (cart.length === 0) {
      snackbar.info("Agrega productos para el pedido delivery.");
      return null;
    }
    if (!cajaAbierta) {
      snackbar.error("Caja cerrada. No se puede guardar el pedido.");
      return null;
    }
    const body = buildDeliveryPedidoBody(customer, cart);
    if (manageBusy) {
      setDeliveryBusyMessage("Guardando pedido…");
      setActionBusy(true);
    }
    try {
      const currentId = deliveryPedidoIdRef.current;
      if (!currentId) {
        const data = await backofficeApi.createDeliveryPedido(body);
        const id = Number(data?.id ?? data?.Id);
        const codigo = String(data?.codigo ?? data?.Codigo ?? "").trim();
        if (!Number.isFinite(id)) throw new Error("Respuesta inválida al crear pedido.");
        deliveryPedidoIdRef.current = id;
        setDeliveryPedidoId(id);
        setDeliveryCodigo(codigo || `#${id}`);
        setPedidoEstado(String(data?.estado ?? data?.Estado ?? "Guardado"));
        await loadDeliveryList();
        if (customer && (customer.nombre || customer.telefono)) {
          const saved = saveCachedClient(customer, true);
          if (saved) setCustomer(saved);
        }
        snackbar.success("Pedido guardado.");
        return id;
      }
      await backofficeApi.updateDeliveryPedido(currentId, body);
      const fresh = await backofficeApi.getDeliveryPedido(currentId);
      setPedidoEstado(String(fresh?.estado ?? fresh?.Estado ?? ""));
      await loadDeliveryList();
      if (customer && (customer.nombre || customer.telefono)) {
        const saved = saveCachedClient(customer);
        if (saved) setCustomer(saved);
      }
      snackbar.success("Pedido actualizado.");
      return currentId;
    } catch (e) {
      snackbar.error(e?.message || "No se pudo guardar el pedido.");
      return null;
    } finally {
      if (manageBusy) {
        clearBusyUi(setActionBusy, setDeliveryBusyMessage);
      }
    }
  };

  const addCartLine = (product, opcionesSeleccionadas = []) => {
    if (isPedidoBloqueado) return;
    if (!cajaAbierta) {
      snackbar.error("Caja cerrada. No se pueden agregar productos.");
      return;
    }
    const id = Number(product?.id ?? product?.Id);
    const grupos = normalizeOpcionesGrupos(product);
    const opsNorm = normalizeOpcionesSeleccionadas(opcionesSeleccionadas);
    const opsKey = opcionesSeleccionadasKey(opsNorm);
    const { sumaExtras, precioReemplazo, tieneReemplazo } = calcularPreciosOpciones(grupos, opsNorm);
    const base = Number(product?.precio ?? product?.Precio ?? 0);
    const finalPrice = (tieneReemplazo ? precioReemplazo : base) + sumaExtras;
    const resumen = buildOpcionesResumenLocal(grupos, opsNorm);
    setCart((prev) => {
      const idx = prev.findIndex(
        (x) =>
          Number(x.id) === id && String(x.opcionesKey ?? "") === String(opsKey) && String(x.notas ?? "").trim() === ""
      );
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: copy[idx].qty + 1 };
        return copy;
      }
      return [
        ...prev,
        {
          lineId: genPosLineId(),
          id,
          name: String(product?.nombre || product?.Nombre || "Producto"),
          qty: 1,
          price: finalPrice,
          notas: "",
          opcionesSeleccionadas: opsNorm,
          opcionesKey: opsKey,
          opcionesResumen: resumen,
        },
      ];
    });
  };

  const addToCart = (product) => {
    if (isPedidoBloqueado) return;
    if (!cajaAbierta) {
      snackbar.error("Caja cerrada. No se pueden agregar productos.");
      return;
    }
    if (productoTieneOpcionesVisibles(product)) {
      if (getSingleGrupoOpcionesForPosInline(product)) {
        setDeliveryInlineOpcionesProduct(product);
        return;
      }
      setDeliveryOpcionesModal({ open: true, product });
      return;
    }
    addCartLine(product, []);
  };

  const pickDeliveryInlineOpcion = (product, grupoId, opcion) => {
    const oid = Number(opcion?.id ?? opcion?.Id);
    if (!Number.isFinite(oid) || !Number.isFinite(Number(grupoId))) return;
    setDeliveryInlineOpcionesProduct(null);
    addCartLine(product, [{ grupoId: Number(grupoId), opcionId: oid }]);
  };

  const removeCartLine = (lineId) => {
    if (isPedidoBloqueado || actionBusy || !cajaAbierta) return;
    const item = cart.find((x) => x.lineId === lineId);
    const isSentToKitchen = item && item.estado !== "Pendiente" && parsePosBackendLineId(lineId) !== null;

    if (isSentToKitchen) {
      setPendingCancelItemLineId(lineId);
      setPosCancelItemPinOpen(true);
      return;
    }
    executeRemoveCartLine(lineId);
  };

  const executeRemoveCartLine = (lineId) => {
    const prev = cartRef.current;
    const next = prev.filter((x) => x.lineId !== lineId);
    if (next.length === prev.length) return;

    cartRef.current = next;
    setCart(next);

    const pedidoId = deliveryPedidoIdRef.current;
    if (!pedidoId) return;

    const lineaId = parsePosBackendLineId(lineId);
    deliverySyncChainRef.current = deliverySyncChainRef.current
      .then(async () => {
        if (lineaId) {
          const resp = await backofficeApi.deliveryEliminarLinea(pedidoId, lineaId);
          if (isPosOrdenVacioResponse(resp)) {
            if (next.length === 0) {
              setCart([]);
              cartRef.current = [];
            } else {
              snackbar.error("El pedido quedó vacío en el servidor; recargando.");
              const fresh = await backofficeApi.getDeliveryPedido(pedidoId);
              applyPedidoDetail(fresh);
            }
          } else {
            const fresh = await backofficeApi.getDeliveryPedido(pedidoId);
            const items = fresh?.items ?? fresh?.Items ?? [];
            const mapped = mapBackendItemsToCart(items);
            setCart(mapped);
            cartRef.current = mapped;
          }
          await loadDeliveryList();
          return;
        }
        if (next.length > 0) {
          const savedCart = cartRef.current;
          if (savedCart.length === 0) return;
          const body = buildDeliveryPedidoBody(customer, savedCart);
          await backofficeApi.updateDeliveryPedido(pedidoId, body);
          await loadDeliveryList();
        }
      })
      .catch((e) => {
        snackbar.error(e?.message || "No se pudo quitar el producto.");
      });

    void deliverySyncChainRef.current;
  };

  const confirmCancelItemWithPin = async (codigo) => {
    const lineId = pendingCancelItemLineId;
    if (!lineId) return;

    const item = cart.find((x) => x.lineId === lineId);
    if (!item) return;

    const lineaId = parsePosBackendLineId(lineId);
    const pedidoId = deliveryPedidoIdRef.current;

    if (!lineaId || !pedidoId) return;

    setActionBusy(true);
    setDeliveryBusyMessage("Cancelando producto...");
    try {
      const resp = await backofficeApi.pedidoCancelarLineaConPin(pedidoId, lineaId, codigo);
      const data = unwrapEnvelope(resp);
      const vacio = data?.vacio ?? data?.Vacio;
      
      const prev = cartRef.current;
      const next = prev.filter((x) => x.lineId !== lineId);
      cartRef.current = next;
      setCart(next);

      if (vacio) {
        setCart([]);
        cartRef.current = [];
        snackbar.success("Línea eliminada. Pedido vacío.");
      } else {
        const fresh = await backofficeApi.getDeliveryPedido(pedidoId);
        const items = fresh?.items ?? fresh?.Items ?? [];
        const mapped = mapBackendItemsToCart(items);
        setCart(mapped);
        cartRef.current = mapped;
        snackbar.success("Línea cancelada e impresa correctamente.");
      }
      await loadDeliveryList();
      setPosCancelItemPinOpen(false);
      setPendingCancelItemLineId(null);
    } catch (e) {
      throw e;
    } finally {
      setActionBusy(false);
      setDeliveryBusyMessage("");
    }
  };

  const updateQty = (lineId, delta) => {
    if (isPedidoBloqueado) return;
    if (!cajaAbierta) return;
    const prev = cartRef.current;
    const item = prev.find((x) => x.lineId === lineId);
    if (!item) return;
    const newQty = Math.max(0, Number(item.qty || 0) + delta);
    if (newQty <= 0) {
      removeCartLine(lineId);
      return;
    }
    const next = prev.map((x) => (x.lineId === lineId ? { ...x, qty: newQty } : x));
    cartRef.current = next;
    setCart(next);
  };

  const editSavedDelivery = async (row) => {
    if (row.estado === "Pagado" || row.estado === "Cancelado") {
      snackbar.info("Este pedido no se puede editar.");
      return;
    }
    const ok = await syncCajaEstado();
    if (!ok) {
      snackbar.error("Caja cerrada. Abrí caja para editar pedidos delivery.");
      return;
    }
    try {
      await runWithBusyUi(
        { setBusy: setActionBusy, setMessage: setDeliveryBusyMessage, caption: "Cargando pedido…" },
        async () => {
          const detail = await backofficeApi.getDeliveryPedido(row.pedidoId);
          applyPedidoDetail(detail);
          setOpenBuilder(true);
          setSearch("");
          setCategory("");
          setDeliveryInlineOpcionesProduct(null);
          await ensureCatalogLoaded();
        },
      );
    } catch (e) {
      snackbar.error(e?.message || "No se pudo cargar el pedido.");
    }
  };

  const viewSavedDelivery = async (row) => {
    try {
      await runWithBusyUi(
        { setBusy: setActionBusy, setMessage: setDeliveryBusyMessage, caption: "Cargando detalle…" },
        async () => {
          const detail = await backofficeApi.getDeliveryPedido(row.pedidoId);
          setDetailOrder(detail);
          setShowDetail(true);
        },
      );
    } catch (e) {
      snackbar.error(e?.message || "No se pudo cargar el detalle del pedido.");
    }
  };

  const openBuilderFromDetail = async () => {
    if (!detailOrder) return;
    const estado = String(detailOrder?.estado ?? detailOrder?.Estado ?? "");
    if (estado === "Pagado" || estado === "Cancelado") {
      snackbar.info("Este pedido no se puede editar.");
      return;
    }
    const ok = await syncCajaEstado();
    if (!ok) {
      snackbar.error("Caja cerrada. Abrí caja para editar pedidos delivery.");
      return;
    }
    await runWithBusyUi(
      { setBusy: setActionBusy, setMessage: setDeliveryBusyMessage, caption: "Abriendo editor…" },
      async () => {
        applyPedidoDetail(detailOrder);
        setShowDetail(false);
        setOpenBuilder(true);
        setSearch("");
        setCategory("");
        setDeliveryInlineOpcionesProduct(null);
        await ensureCatalogLoaded();
      },
    );
  };

  const openCancelDeliveryPin = (row) => {
    if (row.estado === "Pagado") {
      snackbar.info("Un pedido pagado no se cancela desde aquí.");
      return;
    }
    if (row.estado === "Cancelado") return;
    setCancelDeliveryPin({ open: true, row });
  };

  const sendDeliveryWhatsapp = async (row) => {
    if (!row?.pedidoId) return;
    const phone = String(row?.customer?.telefono || "").trim();
    if (!phone) {
      snackbar.info("El pedido no tiene teléfono de cliente.");
      return;
    }
    try {
      await runWithBusyUi(
        { setBusy: setActionBusy, setMessage: setDeliveryBusyMessage, caption: "Preparando WhatsApp…" },
        async () => {
          const resp = await backofficeApi.deliveryPedidoWhatsappLink(row.pedidoId);
          const waLink = resp?.waLink ?? resp?.WaLink ?? resp?.data?.waLink ?? resp?.data?.WaLink;
          if (!waLink) {
            throw new Error("No se pudo obtener el enlace de WhatsApp desde el servidor.");
          }

          // Usar shell.openExternal de Electron para abrir enlaces externos
          if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal(waLink);
            snackbar.success("Abriendo WhatsApp.");
          } else {
            // Fallback a window.open si no está en Electron
            const win = window.open(waLink, "_blank", "noopener,noreferrer");
            if (!win) {
              snackbar.error("Permite ventanas emergentes para abrir WhatsApp.");
              return;
            }
            snackbar.success("Abriendo WhatsApp.");
          }
        },
      );
    } catch (e) {
      snackbar.error(e?.message || "No se pudo generar el ticket de WhatsApp.");
    }
  };

  const executeDeliveryCancelConPin = async (codigo) => {
    const row = cancelDeliveryPin.row;
    if (!row?.pedidoId) throw new Error("Pedido no seleccionado.");
    await runWithBusyUi(
      { setBusy: setActionBusy, setMessage: setDeliveryBusyMessage, caption: "Cancelando pedido…" },
      async () => {
        await backofficeApi.deliveryPedidoCancelar(row.pedidoId, codigo);
        snackbar.success("Pedido cancelado.");
        setCancelDeliveryPin({ open: false, row: null });
        await loadDeliveryList();
      },
    );
  };

  const handleCancelar = () => {
    if (deliveryPedidoIdRef.current) {
      snackbar.info("Este pedido ya está guardado. Usá la lista para cancelarlo o seguí editando.");
      return;
    }
    setCart([]);
    setCustomer({ id: null, nombre: "", telefono: "", direccion: "", observaciones: "" });
    snackbar.info("Borrador limpiado.");
  };

  const handleImprimirCuenta = async () => {
    if (cart.length === 0) {
      snackbar.info("No hay productos para imprimir.");
      return;
    }
    try {
      await runWithBusyUi(
        { setBusy: setActionBusy, setMessage: setDeliveryBusyMessage, caption: "Imprimiendo cuenta…" },
        async () => {
          const pid = await persistDelivery({ manageBusy: false });
          if (!pid) return;
          await printDeliveryPrecuenta(pid);
        },
      );
    } catch (e) {
      snackbar.error(e?.message || "No se pudo imprimir la cuenta.");
    }
  };

  const printDeliveryPrecuenta = async (pid) => {
    try {
      const pre = await backofficeApi.deliveryPedidoPrecuenta(pid);
      if (await tryPrintPrecuentaFromPayload(pre)) {
        snackbar.info(PRECUENTA_PRINT_READY_INFO);
        return true;
      }
    } catch (err) {
      if (err?.message === "CANCEL_BY_USER") return false;
    }

    // Fallback: generar ticket local
    const companyName = (() => { try { return localStorage.getItem("pos_app_name") || "BarRestPOS"; } catch { return "BarRestPOS"; } })();
    const hasLogo = (() => { try { return !!localStorage.getItem("pos_logo_url"); } catch { return false; } })();
    const logoLine = hasLogo ? `       [LOGO]` : `       ${companyName}`;
    const fechaLocal = new Date().toLocaleString("es-NI", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
    const lines = posCartToModalLines(cart);
    const total = lines.reduce((s, x) => s + x.lineTotal, 0);
    const sym = currencySymbol;
    let fallbackText = `${logoLine}\n       ${companyName}\n------------------------------------------------\nCOMANDA: Delivery #${pid}\nFECHA:  ${fechaLocal}\n------------------------------------------------\nCANT PRODUCTO                PRECIO\n------------------------------------------------\n`;
    lines.forEach(x => {
      fallbackText += `${String(x.qty).padEnd(6)}${String(x.name).substring(0,25).padEnd(28)}${formatCurrency(x.lineTotal, sym).padStart(14)}\n`;
    });
    fallbackText += `------------------------------------------------\nTOTAL:                                ${formatCurrency(total, sym).padStart(14)}\n------------------------------------------------\n       Comanda Delivery\n       ${fechaLocal}`;

    window.dispatchEvent(
      new CustomEvent("show-ticket-preview", {
        detail: {
          text: fallbackText,
          onConfirmPrint: async () => {
            const printed = await openBackendPrintUrl(`/api/v1/impresion/comanda/${pid}`);
            if (printed) snackbar.success("Enviado a la impresora física.");
            else snackbar.warning("No se pudo imprimir. Verifique la impresora.");
          },
          onCancelPrint: () => {},
        },
      })
    );
    return true;
  };

  const handleEnviarCocina = async () => {
    if (cart.length === 0) {
      snackbar.info("Agrega productos para enviar a cocina.");
      return;
    }
    if (isPedidoBloqueado) return;
    try {
      await runWithBusyUi(
        { setBusy: setActionBusy, setMessage: setDeliveryBusyMessage, caption: "Enviando a cocina…" },
        async () => {
          const pid = await persistDelivery({ manageBusy: false });
          if (!pid) return;
          const { data, message } = await backofficeApi.deliveryPedidoEnviarCocina(pid);
          const infoMsg = typeof message === "string" ? message.trim() : "";
          if (infoMsg) snackbar.info(infoMsg);
          else snackbar.success("Pedido enviado a cocina.");

          await printKitchenTicketAfterEnviarCocina(data, snackbar);

          const fresh = await backofficeApi.getDeliveryPedido(pid);
          setPedidoEstado(String(fresh?.estado ?? fresh?.Estado ?? ""));
          await loadDeliveryList();
        },
      );
    } catch (e) {
      snackbar.error(e?.message || "No se pudo enviar a cocina.");
    }
  };

  const handleGuardar = async () => {
    const pid = await persistDelivery();
    if (pid) {
      closeDeliveryBuilderToList();
      setDeliveryPedidoId(null);
      deliveryPedidoIdRef.current = null;
      setDeliveryCodigo("");
      setPedidoEstado("");
      setCart([]);
      setCustomer({ id: null, nombre: "", telefono: "", direccion: "", observaciones: "" });
    }
  };

  const handleProcesarOrden = async () => {
    if (cart.length === 0) {
      snackbar.info("Agrega productos para procesar la orden.");
      return;
    }
    if (isPedidoBloqueado) return;
    try {
      await runWithBusyUi(
        { setBusy: setActionBusy, setMessage: setDeliveryBusyMessage, caption: "Preparando cobro…" },
        async () => {
          const pid = await persistDelivery({ manageBusy: false });
          if (!pid) return;
          const detail = await backofficeApi.getDeliveryPedido(pid);
          const rawItems = detail?.items ?? detail?.Items;
          const lineCart =
            Array.isArray(rawItems) && rawItems.length > 0 ? mapBackendItemsToCart(rawItems) : cart;
          setSaleModalLines(posCartToModalLines(lineCart));
          setSaleBackendTotal(getPedidoMontoNumeric(detail));
          setSaleModalOpen(true);
        },
      );
    } catch (e) {
      snackbar.error(e?.message || "No se pudo abrir el cobro.");
    }
  };

  const handleGuardarVenta = async (form) => {
    const pid = deliveryPedidoIdRef.current;
    if (!pid) return;
    setSaleProcessing(true);
    try {
      const payload = buildPagoPayload({
        ordenId: pid,
        form,
        defaultObservaciones: "Pago delivery",
      });

      let resp;
      try {
        resp = await backofficeApi.deliveryPedidoGestionarPago(pid, payload);
      } catch {
        resp = await backofficeApi.deliveryPedidoProcesarPago(pid, payload);
      }

      if (pagoResponseHasReciboPrintChannel(resp)) {
        const printed = await tryPrintReciboFromPagoResponse(resp);
        if (!printed) snackbar.warning("Venta procesada, pero no se pudo imprimir el recibo.");
      }

      snackbar.success("Venta procesada.");
      window.dispatchEvent(new CustomEvent("barrest-inventory-updated"));
      setSaleModalOpen(false);
      setSaleBackendTotal(null);
      requestImmediateRefetch();
      setOpenBuilder(false);
      setDeliveryPedidoId(null);
      deliveryPedidoIdRef.current = null;
      setDeliveryCodigo("");
      setPedidoEstado("");
      setCart([]);
    } catch (e) {
      snackbar.error(e?.message || "No se pudo registrar el pago.");
    } finally {
      setSaleProcessing(false);
    }
  };

  const printDeliveryFromDetail = async (detail) => {
    const pid = Number(detail?.id ?? detail?.Id);
    if (!Number.isFinite(pid)) {
      snackbar.error("No se encontró el ID del pedido.");
      return;
    }
    try {
      await runWithBusyUi(
        { setBusy: setActionBusy, setMessage: setDeliveryBusyMessage, caption: "Imprimiendo cuenta…" },
        async () => {
          const printed = await printDeliveryPrecuenta(pid);
          if (printed) return;
        },
      );
    } catch (e) {
      snackbar.error(e?.message || "No se pudo imprimir la cuenta.");
    }
  };

  const deliveryBusyOverlay = (
    <PosActionLoadingOverlay
      open={Boolean(actionBusy || saleProcessing)}
      saleProcessing={saleProcessing}
      detailMessage={deliveryBusyMessage}
    />
  );

  if (showDetail && detailOrder) {
    const createdAtLabel = formatDateTimeLabel(detailOrder.fechaCreacion ?? detailOrder.createdAt ?? detailOrder.CreatedAt);
    const paidAtLabel = formatDateTimeLabel(detailOrder.fechaPagado ?? detailOrder.FechaPagado);
    const listoAtLabel = ["Listo", "Servido", "Entregado", "Pagado"].includes(String(detailOrder.estado || ""))
      ? paidAtLabel
      : "-";
    const items = Array.isArray(detailOrder.items ?? detailOrder.Items) ? detailOrder.items ?? detailOrder.Items : [];
    const subtotalLines = items.reduce((acc, it) => acc + Number(it.subtotal ?? it.Subtotal ?? it.monto ?? it.Monto ?? 0), 0);
    const subConsumoDetalle = pedidoSubtotalConsumoCordobas(detailOrder) || subtotalLines;
    const descCobroDetalle = pedidoDescuentoCobroCordobas(detailOrder);
    const netoCobradoDetalle = pedidoTotalNetoCobradoCordobas(detailOrder);
    const pagosDetalle = pedidoPagosLista(detailOrder);
    const estadoDetalle = String(detailOrder.estado ?? detailOrder.Estado ?? "");
    const codigo = detailOrder.codigo ?? detailOrder.Codigo ?? `#${detailOrder.id ?? detailOrder.Id}`;
    return (
      <>
        {deliveryBusyOverlay}
        <div className="min-w-0 max-w-full space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Detalle de pedido</p>
                <h2 className="mt-1 text-xl font-bold text-slate-800">{codigo}</h2>
                <p className="text-sm text-slate-500">Vista completa del pedido delivery y sus productos.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDetail(false);
                    setDetailOrder(null);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
                  Volver
                </button>
                <button
                  type="button"
                  onClick={() => void printDeliveryFromDetail(detailOrder)}
                  disabled={actionBusy}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-white hover:shadow-md transition-all duration-200 disabled:opacity-50"
                >
                  <Printer className="h-3.5 w-3.5 shrink-0" />
                  Imprimir
                </button>
                <button
                  type="button"
                  onClick={() => void openBuilderFromDetail()}
                  disabled={actionBusy || estadoDetalle === "Pagado" || estadoDetalle === "Cancelado"}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  <Pencil className="h-3.5 w-3.5 shrink-0" />
                  Editar
                </button>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-[1.7fr_1fr]">
            <section className="space-y-4">
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Informacion del Pedido</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <article className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-3 shadow-sm"><p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Numero</p><p className="font-bold text-slate-800">{codigo}</p></article>
                  <article className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-3 shadow-sm"><p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Fecha y Hora</p><p className="font-bold text-slate-800">{createdAtLabel}</p></article>
                  <article className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-3 shadow-sm"><p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Origen</p><p className="font-bold text-slate-800">Delivery</p></article>
                  <article className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-3 shadow-sm"><p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cliente</p><p className="font-bold text-slate-800">{detailOrder.clienteNombre ?? detailOrder.ClienteNombre ?? "-"}</p></article>
                  <article className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-3 shadow-sm"><p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Telefono</p><p className="font-bold text-slate-800">{detailOrder.clienteTelefono ?? detailOrder.ClienteTelefono ?? "-"}</p></article>
                  <article className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-3 shadow-sm"><p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Estado</p><span className={`rounded-lg px-2 py-1 text-xs font-bold ${statusClass(estadoDetalle || "Pendiente")}`}>{estadoDetalle || "Pendiente"}</span></article>
                  <article className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-3 shadow-sm sm:col-span-2 xl:col-span-3"><p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Direccion / observaciones</p><p className="font-semibold text-slate-700">{detailOrder.clienteDireccion ?? detailOrder.ClienteDireccion ?? detailOrder.observaciones ?? detailOrder.Observaciones ?? "-"}</p></article>
                </div>
              </article>

              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Productos del Pedido</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-[760px] w-full text-sm">
                    <thead className="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Producto</th>
                        <th className="px-3 py-2 font-semibold">Cantidad</th>
                        <th className="px-3 py-2 font-semibold">Precio Unit.</th>
                        <th className="px-3 py-2 font-semibold">Subtotal</th>
                        <th className="px-3 py-2 font-semibold">Notas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {items.map((it, idx) => (
                        <tr key={it.id ?? it.Id ?? `${it.servicioId ?? it.ServicioId ?? "it"}-${idx}`}>
                          <td className="px-3 py-2"><p className="font-medium text-slate-800">{it.servicio ?? it.Servicio ?? it.producto ?? it.Producto ?? "-"}</p></td>
                          <td className="px-3 py-2 text-slate-700">{it.cantidad ?? it.Cantidad ?? 0}</td>
                          <td className="px-3 py-2 text-slate-700">{formatCurrency(it.precioUnitario ?? it.PrecioUnitario ?? 0, currencySymbol)}</td>
                          <td className="px-3 py-2 font-semibold text-slate-800">{formatCurrency(it.subtotal ?? it.Subtotal ?? it.monto ?? it.Monto ?? 0, currencySymbol)}</td>
                          <td className="px-3 py-2 text-slate-700">{it.notas ?? it.Notas ?? "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan={3} className="px-3 py-2 text-right text-sm font-semibold text-slate-700">Total consumo (subtotal):</td>
                        <td className="px-3 py-2 text-sm font-bold text-slate-900">{formatCurrency(subConsumoDetalle, currencySymbol)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </article>
            </section>

            <section className="space-y-4">
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Resumen (cobro)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-slate-500">Subtotal consumo</span>
                    <span className="font-semibold text-slate-800">{formatCurrency(subConsumoDetalle, currencySymbol)}</span>
                  </div>
                  {descCobroDetalle > 0.0001 && (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-500">Descuento en cobro</span>
                      <span className="font-semibold text-amber-800">−{formatCurrency(descCobroDetalle, currencySymbol)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2">
                    <span className="text-slate-600">Total pagado (neto)</span>
                    <span className="font-bold text-emerald-900">
                      {estadoDetalle === "Pagado" && netoCobradoDetalle != null ? formatCurrency(netoCobradoDetalle, currencySymbol) : "—"}
                    </span>
                  </div>
                </div>
              </article>
              {pagosDetalle.length > 0 && (
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="mb-3 text-sm font-semibold text-slate-800">Pagos</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-xs">
                      <thead className="border-b border-slate-200 text-left text-slate-500">
                        <tr>
                          <th className="py-1.5 pr-2 font-medium">Fecha</th>
                          <th className="py-1.5 pr-2 font-medium">Tipo</th>
                          <th className="py-1.5 pr-2 font-medium text-right">Neto ({currencySymbol})</th>
                          <th className="py-1.5 font-medium text-right">Desc. atrib.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {pagosDetalle.map((pg, idx) => {
                          const pid = pg.id ?? pg.Id ?? `pago-${idx}`;
                          const netoP = pagoMontoNetoCobradoCordobas(pg);
                          const descA = pagoDescuentoAtribuidoCordobas(pg);
                          const motivo = pagoDescuentoMotivo(pg);
                          return (
                            <tr key={pid}>
                              <td className="py-1.5 pr-2 whitespace-nowrap">{formatDateTimeLabel(pagoFecha(pg))}</td>
                              <td className="py-1.5 pr-2">{pagoTipo(pg)}</td>
                              <td className="py-1.5 pr-2 text-right font-medium">{netoP != null ? formatCurrency(netoP, currencySymbol) : "—"}</td>
                              <td className="py-1.5 text-right" title={motivo || undefined}>
                                {descA > 0.0001 ? `−${formatCurrency(descA, currencySymbol)}` : "—"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </article>
              )}
              <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <h3 className="mb-3 text-sm font-semibold text-slate-800">Fechas</h3>
                <div className="space-y-2 text-sm text-slate-700">
                  <p>Creado: {createdAtLabel}</p>
                  <p>Listo: {listoAtLabel}</p>
                  <p>Pagado: {paidAtLabel}</p>
                </div>
              </article>
            </section>
          </div>
        </div>
      </>
    );
  }

  if (!openBuilder) {
    return (
      <>
        {deliveryBusyOverlay}
        <section className="space-y-5 rounded-2xl border border-slate-200/60 bg-white/80 backdrop-blur-sm p-5 shadow-lg shadow-slate-200/40">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">Delivery</h2>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${cajaAbierta ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                    }`}
                >
                  <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${cajaAbierta ? "bg-emerald-500" : "bg-rose-500"}`} />
                  Caja: {cajaAbierta ? "Abierta" : "Cerrada"}
                </span>
              </div>
              <p className="text-sm text-slate-500">Gestión de pedidos a domicilio</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <label className="group relative inline-flex min-h-[44px] w-full items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-500 transition-all duration-200 focus-within:border-indigo-300 focus-within:bg-white focus-within:shadow-md sm:w-[320px]">
                <Search className="h-4 w-4 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
                <input
                  value={listSearch}
                  onChange={(e) => setListSearch(e.target.value)}
                  placeholder="Buscar código, cliente o teléfono"
                  className="w-full bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none transition-all"
                />
              </label>
              <button
                type="button"
                onClick={() => void openNewDelivery()}
                disabled={actionBusy || !cajaAbierta}
                title={!cajaAbierta ? "Abrí caja en el menú Caja para tomar pedidos" : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:from-emerald-600 hover:to-emerald-700 hover:shadow-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
              >
                <ShoppingBag className="h-4 w-4" />
                Nuevo pedido
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm shadow-sm">
            <table className="min-w-[920px] w-full text-sm">
              <thead className="bg-gradient-to-b from-slate-50 to-slate-100/50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4">Código</th>
                  <th className="px-5 py-4">Cliente</th>
                  <th className="px-5 py-4">Teléfono</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4 text-right">Total</th>
                  <th className="px-5 py-4">Hora</th>
                  <th className="px-5 py-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {listLoading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8">
                      <ListSkeleton rows={5} />
                    </td>
                  </tr>
                ) : listRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center">
                      <ShoppingBag className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                      <p className="text-sm font-medium text-slate-500">
                        {listSearch.trim() ? "Sin resultados para la búsqueda" : "Sin pedidos delivery todavía"}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {listSearch.trim() ? "Probá con otros términos" : "Creá tu primer pedido delivery"}
                      </p>
                    </td>
                  </tr>
                ) : (
                  listRows.map((x) => (
                    <tr key={x.pedidoId} className="group transition-all duration-200 hover:bg-slate-50/80">
                      <td className="px-5 py-4">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-900">{x.codigo}</p>
                          <p className="text-xs text-slate-400">ID {x.pedidoId}</p>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-semibold text-slate-600 shadow-sm">
                            {x.customer?.nombre?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-slate-700">{x.customer?.nombre || "—"}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{x.customer?.telefono || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusClass(x.estado)}`}>
                          {x.estado || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold tabular-nums text-slate-900">{formatCurrency(x.total, currencySymbol)}</td>
                      <td className="px-5 py-4 text-slate-500">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                          {new Date(x.createdAt).toLocaleTimeString("es-NI", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => void viewSavedDelivery(x)}
                            disabled={actionBusy}
                            title="Ver detalle"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-200 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-40"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void editSavedDelivery(x)}
                            disabled={actionBusy || x.estado === "Pagado" || x.estado === "Cancelado"}
                            title="Editar pedido"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-all duration-200 hover:bg-slate-200 hover:text-slate-800 disabled:opacity-40"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => void sendDeliveryWhatsapp(x)}
                            disabled={actionBusy || !String(x.customer?.telefono || "").trim()}
                            title="Enviar por WhatsApp"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 transition-all duration-200 hover:bg-emerald-200 hover:text-emerald-700 disabled:opacity-40"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 16 16"
                              fill="currentColor"
                              className="h-4 w-4"
                            >
                              <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.9 7.9 0 0 0 13.6 2.326zM7.994 14.521a6.6 6.6 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.691.677-.691 1.654s.71 1.916.81 2.049c.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={() => openCancelDeliveryPin(x)}
                            disabled={actionBusy || x.estado === "Pagado" || x.estado === "Cancelado"}
                            title="Cancelar pedido"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600 transition-all duration-200 hover:bg-rose-200 hover:text-rose-700 disabled:opacity-40"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
        {cancelDeliveryPin.open && (
          <CancelPedidoPinModal
            open
            onClose={() => !actionBusy && setCancelDeliveryPin({ open: false, row: null })}
            loading={actionBusy}
            title="Cancelar pedido delivery"
            message={
              cancelDeliveryPin.row
                ? `Pedido ${cancelDeliveryPin.row.codigo || cancelDeliveryPin.row.pedidoId}. Ingresá el PIN de autorización.`
                : "Ingresá el PIN de autorización."
            }
            onConfirm={executeDeliveryCancelConPin}
          />
        )}
      </>
    );
  }

  return (
    <>
      {deliveryBusyOverlay}
      <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-3 shadow-sm lg:h-[calc(100vh-10.5rem)]">
        {!cajaAbierta && (
          <div
            className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-900"
            role="status"
          >
            <strong className="font-semibold">Caja cerrada.</strong> No podés agregar productos ni guardar. Abrí caja (menú
            Caja) o volvé al listado.
          </div>
        )}
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-slate-800">
                DELIVERY | {deliveryCodigo || "Pedido"}
                {customer?.nombre && (
                  <span className="text-slate-500 font-normal text-xs sm:text-sm"> — Cliente: {customer.nombre}</span>
                )}
              </h2>
              <span
                className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${cajaAbierta ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                  }`}
              >
                Caja {cajaAbierta ? "abierta" : "cerrada"}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">Seleccioná productos para este pedido.</p>
            {pedidoEstado ? (
              <p className="mt-0.5 text-[11px] font-medium text-slate-600">Estado: {pedidoEstado}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCustomerModalOpen(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
            >
              Cliente
            </button>
            <button
              type="button"
              onClick={() => closeDeliveryBuilderToList()}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a delivery
            </button>
          </div>
        </div>

        <div className="mb-3 overflow-x-auto rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm p-2 shadow-sm">
          <div className="flex w-max min-w-full gap-2">
            <button
              type="button"
              onClick={() => setCategory("")}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-[11px] font-bold transition-all duration-200 ${!category ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              TODOS
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(String(c.id))}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-[11px] font-bold transition-all duration-200 ${String(category) === String(c.id) ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {(c.nombre || c.descripcion || "Categoria").toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-0 flex-1 grid grid-cols-1 gap-3 lg:grid-cols-[1.45fr_1fr]">
          <article className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm p-4 shadow-lg shadow-slate-200/50">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Orden</h3>
            <div className="min-h-0 flex-1 overflow-auto rounded-xl border border-slate-100">
              {loading ? (
                <ListSkeleton rows={6} />
              ) : (
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-left text-slate-600">
                    <tr>
                      <th className="px-2 py-2">Producto</th>
                      <th className="w-[min(28vw,9rem)] px-1 py-2">Nota</th>
                      <th className="px-2 py-2">CNT</th>
                      <th className="px-2 py-2">P/U</th>
                      <th className="px-2 py-2">PT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-2 py-6 text-center text-slate-500">
                          Sin productos en la orden.
                        </td>
                      </tr>
                    )}
                    {cart.map((item) => (
                      <tr key={item.lineId ?? item.id} className="border-t border-slate-100">
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
                            onChange={(e) =>
                              setCart((prev) =>
                                prev.map((x) => (x.lineId === item.lineId ? { ...x, notas: e.target.value } : x))
                              )
                            }
                            disabled={loading || isPedidoBloqueado || !cajaAbierta}
                            placeholder="ej. sin cebolla"
                            className="box-border w-full min-w-0 rounded border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-800 placeholder:text-slate-400"
                          />
                        </td>
                        <td className="px-2 py-2 align-middle">
                          <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/90 backdrop-blur-sm p-0.5 shadow-sm">
                            <button
                              type="button"
                              onClick={() => updateQty(item.lineId, -1)}
                              disabled={isPedidoBloqueado || actionBusy || !cajaAbierta}
                              className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="min-w-5 text-center font-semibold text-slate-800">{item.qty}</span>
                            <button
                              type="button"
                              onClick={() => updateQty(item.lineId, 1)}
                              disabled={isPedidoBloqueado || actionBusy || !cajaAbierta}
                              className="inline-flex h-5 w-5 items-center justify-center rounded text-slate-700 hover:bg-slate-100 disabled:opacity-40"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-2 py-2 align-middle">{formatCurrency(item.price, currencySymbol)}</td>
                        <td className="whitespace-nowrap px-2 py-2 align-middle font-semibold">
                          <div className="flex items-center justify-between gap-2">
                            <span>{formatCurrency(Number(item.price || 0) * Number(item.qty || 0), currencySymbol)}</span>
                            {item.estado !== "Pending" && item.estado !== "Pendiente" && parsePosBackendLineId(item.lineId) !== null ? (
                              <button
                                type="button"
                                onClick={() => removeCartLine(item.lineId)}
                                disabled={isPedidoBloqueado || actionBusy || !cajaAbierta}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 disabled:opacity-40"
                                title="Autorización requerida (PIN)"
                              >
                                <Lock className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => removeCartLine(item.lineId)}
                                disabled={isPedidoBloqueado || actionBusy || !cajaAbierta}
                                className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-red-200 text-red-600 disabled:opacity-40"
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
            {cart.length > 0 && (
              <>
                <div className="mt-2 ml-auto w-full max-w-[220px] space-y-1 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal, currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span className="font-bold">{formatCurrency(subtotal, currencySymbol)}</span>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={handleCancelar}
                    disabled={actionBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-red-500/20 transition-all duration-200 hover:bg-red-600 disabled:opacity-60"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleImprimirCuenta()}
                    disabled={actionBusy || saleProcessing || isPedidoBloqueado || !cajaAbierta}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-500 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-sky-500/20 transition-all duration-200 hover:bg-sky-600 disabled:opacity-60"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    Imprimir cuenta
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleEnviarCocina()}
                    disabled={actionBusy || saleProcessing || isPedidoBloqueado || !cajaAbierta}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-amber-500/20 transition-all duration-200 hover:bg-amber-600 disabled:opacity-60"
                  >
                    <ChefHat className="h-3.5 w-3.5" />
                    Mandar orden
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleProcesarOrden()}
                    disabled={actionBusy || saleProcessing || isPedidoBloqueado || !cajaAbierta}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-emerald-500/20 transition-all duration-200 hover:bg-emerald-700 disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Procesar orden
                  </button>
                  <button
                    type="button"
                    onClick={handleGuardar}
                    disabled={actionBusy || saleProcessing || isPedidoBloqueado || !cajaAbierta}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-[11px] font-bold text-white shadow-md shadow-violet-500/20 transition-all duration-200 hover:bg-violet-700 disabled:opacity-60"
                  >
                    <Save className="h-3.5 w-3.5" />
                    Guardar
                  </button>
                </div>
              </>
            )}
          </article>

          <article className="flex min-h-0 flex-col rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-sm p-4 shadow-lg shadow-slate-200/50">
            <h3 className="mb-3 text-sm font-bold text-slate-800">Búsqueda de productos</h3>
            <label className="mb-3 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar producto"
                disabled={isPedidoBloqueado || !cajaAbierta}
                className="w-full bg-transparent text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400"
              />
            </label>
            <div
              className={
                deliveryInlineOpcionesPick && deliveryInlineOpcionesProduct
                  ? "flex min-h-0 flex-1 flex-col rounded-xl border border-slate-200 p-3"
                  : `min-h-0 flex-1 rounded-xl border border-slate-200 p-3 ${deliveryProductGridClass}`
              }
            >
              {deliveryInlineOpcionesPick && deliveryInlineOpcionesProduct ? (
                <PosInlineOpcionesPanel
                  product={deliveryInlineOpcionesProduct}
                  grupoId={deliveryInlineOpcionesPick.grupoId}
                  opciones={deliveryInlineOpcionesPick.opciones}
                  onPickOpcion={pickDeliveryInlineOpcion}
                  onBack={() => setDeliveryInlineOpcionesProduct(null)}
                  currencySymbol={currencySymbol}
                  disabled={isPedidoBloqueado || !cajaAbierta}
                  gridClassName={`min-h-[220px] flex-1 ${deliveryProductGridClass}`}
                  tileClassName={deliveryOpcionTileShell}
                />
              ) : loading ? (
                <ListSkeleton rows={8} />
              ) : (
                filteredProducts.map((p) => (
                  <PosProductCatalogTile
                    key={p.id}
                    product={p}
                    onClick={() => addToCart(p)}
                    disabled={isPedidoBloqueado || !cajaAbierta}
                  />
                ))
              )}
            </div>
          </article>
        </div>
        <PosProcesarVentaModal
          open={saleModalOpen}
          onClose={() => !saleProcessing && setSaleModalOpen(false)}
          mesaLabel={`DELIVERY | ${deliveryCodigo || "Pedido"}`}
          currencySymbol={currencySymbol}
          lines={saleModalLines}
          totalOrdenBackend={saleBackendTotal}
          exchangeRate={tc}
          busy={saleProcessing}
          onGuardar={handleGuardarVenta}
        />
        <PosProductOpcionesModal
          open={deliveryOpcionesModal.open}
          product={deliveryOpcionesModal.product}
          currencySymbol={currencySymbol}
          onClose={() => setDeliveryOpcionesModal({ open: false, product: null })}
          onConfirm={(opcionesSeleccionadas) => {
            const p = deliveryOpcionesModal.product;
            setDeliveryOpcionesModal({ open: false, product: null });
            if (!p) return;
            addCartLine(p, opcionesSeleccionadas);
          }}
        />
        {customerModalOpen && (
          <BackofficeDialog maxWidthClass="max-w-md" onBackdropClick={() => {
            setCustomerModalOpen(false);
            setClientSearchQuery("");
          }}>
            <div className="w-full min-w-0">
              <h3 className="text-lg font-semibold text-slate-800">Cliente delivery</h3>

              {/* Buscador inteligente de clientes recurrentes */}
              <div className="mt-3 border-b border-slate-100 pb-3 mb-3">
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  ¿Cliente Recurrente? Buscar por Teléfono o Nombre
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    value={clientSearchQuery}
                    onChange={(e) => setClientSearchQuery(e.target.value)}
                    placeholder="Ingresá nombre o teléfono para buscar..."
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none shadow-sm transition-all"
                  />
                  {clientSuggestions.length > 0 && (
                    <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                      {clientSuggestions.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setCustomer({
                              id: c.id,
                              nombre: c.nombre || "",
                              telefono: c.telefono || "",
                              direccion: c.direccion || "",
                              observaciones: c.observaciones || ""
                            });
                            setClientSearchQuery("");
                            setCustomerModalOpen(false);
                            snackbar.success(`Cliente "${c.nombre}" seleccionado.`);
                          }}
                          className="flex w-full flex-col px-4 py-2 text-left hover:bg-slate-50 border-b border-slate-50 last:border-0"
                        >
                          <span className="text-sm font-semibold text-slate-800">{c.nombre}</span>
                          <span className="text-xs text-slate-500">{c.telefono} · {c.direccion || "Sin dirección"}</span>
                        </button>
                      ))}
                    </div>
                  )}
                  {clientSearchQuery.trim() && clientSuggestions.length === 0 && (
                    <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-slate-200 bg-white p-3 text-center text-xs text-slate-400 shadow-lg">
                      Sin resultados. Ingresá los datos abajo para registrarlo.
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <input
                  value={customer.nombre}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre cliente"
                  disabled={isPedidoBloqueado}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none shadow-sm transition-all"
                />
                <input
                  value={customer.telefono}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, telefono: e.target.value }))}
                  placeholder="Teléfono"
                  disabled={isPedidoBloqueado}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none shadow-sm transition-all"
                />
                <input
                  value={customer.direccion}
                  onChange={(e) => setCustomer((prev) => ({ ...prev, direccion: e.target.value }))}
                  placeholder="Dirección / referencia"
                  disabled={isPedidoBloqueado}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none shadow-sm transition-all"
                />
                <label className="block text-xs font-medium text-slate-600">
                  Observaciones del pedido
                  <textarea
                    value={customer.observaciones}
                    onChange={(e) => setCustomer((prev) => ({ ...prev, observaciones: e.target.value }))}
                    rows={2}
                    disabled={isPedidoBloqueado}
                    placeholder="Ej. tocar timbre"
                    className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none shadow-sm transition-all"
                  />
                </label>
              </div>
              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white/80 backdrop-blur-sm px-3 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-white hover:shadow-md transition-all duration-200"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerModalOpen(false);
                    snackbar.success("Datos de cliente listos.");
                  }}
                  className="rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white hover:bg-violet-700"
                >
                  Guardar cliente
                </button>
              </div>
            </div>
          </BackofficeDialog>
        )}
        {posCancelItemPinOpen && (
          <CancelPedidoPinModal
            open
            onClose={() => !actionBusy && setPosCancelItemPinOpen(false)}
            loading={actionBusy}
            title="Cancelar producto"
            message="Ingresá el PIN de autorización para eliminar el producto de esta orden."
            onConfirm={confirmCancelItemWithPin}
          />
        )}

      </section>
    </>
  );
}
