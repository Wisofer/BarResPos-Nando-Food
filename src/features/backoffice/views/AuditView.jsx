import { useState, useEffect, useCallback } from "react";
import { 
  ShieldAlert, 
  Search, 
  Calendar, 
  Trash2, 
  Lock, 
  Key, 
  DollarSign, 
  FileClock, 
  DoorOpen, 
  PlusCircle, 
  ArrowLeftRight, 
  AlertTriangle, 
  ClipboardList, 
  RefreshCw,
  User,
  Coffee,
  Package
} from "lucide-react";
import { BackofficePageShell } from "../components/Skeletons.jsx";
import { backofficeApi } from "../services/backofficeApi.js";
import { useSnackbar } from "../../../contexts/SnackbarContext.jsx";
import { formatDateTime } from "../../../utils/format.js";
import { formatCurrency } from "../utils/currency.js";

const actionMetadata = {
  AperturaMesa: { label: "Apertura de Mesa", icon: DoorOpen, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  AdicionProducto: { label: "Adición de Producto", icon: PlusCircle, color: "text-blue-600 bg-blue-50 border-blue-100" },
  CancelacionPedido: { label: "Cancelación de Pedido", icon: Trash2, color: "text-rose-600 bg-rose-50 border-rose-100" },
  CancelacionLineaConPin: { label: "Cancelación con PIN", icon: Lock, color: "text-amber-600 bg-amber-50 border-amber-100" },
  TrasladoMesa: { label: "Traslado de Mesa", icon: ArrowLeftRight, color: "text-purple-600 bg-purple-50 border-purple-100" },
  PagoProcesado: { label: "Pago Procesado", icon: DollarSign, color: "text-cyan-600 bg-cyan-50 border-cyan-100" },
  AperturaCaja: { label: "Apertura de Caja", icon: Key, color: "text-teal-600 bg-teal-50 border-teal-100" },
  CierreCaja: { label: "Cierre de Caja", icon: FileClock, color: "text-slate-600 bg-slate-50 border-slate-100" },
  DiferenciaCierre: { label: "Diferencia de Cierre", icon: AlertTriangle, color: "text-orange-600 bg-orange-50 border-orange-100" },
  CambioEstadoMesa: { label: "Cambio Estado Mesa", icon: Coffee, color: "text-indigo-600 bg-indigo-50 border-indigo-100" },
  InventarioEntrada: { label: "Entrada de Inventario", icon: Package, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
  InventarioSalida: { label: "Salida de Inventario (Merma)", icon: Package, color: "text-rose-600 bg-rose-50 border-rose-100" },
  InventarioAjuste: { label: "Ajuste de Inventario", icon: Package, color: "text-amber-600 bg-amber-50 border-amber-100" },
  SeparacionCuenta: { label: "Separación de Cuenta", icon: ArrowLeftRight, color: "text-fuchsia-600 bg-fuchsia-50 border-fuchsia-100" }
};

export function AuditView() {
  const snackbar = useSnackbar();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters State
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [usuario, setUsuario] = useState("");
  const [mesa, setMesa] = useState("");
  const [accion, setAccion] = useState("");
  const [severidad, setSeveridad] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (desde) params.desde = `${desde}T00:00:00`;
      if (hasta) params.hasta = `${hasta}T23:59:59`;
      if (accion) params.accion = accion;
      if (usuario) params.usuario = usuario;
      if (mesa) params.mesa = mesa;
      if (severidad) params.severidad = severidad;
      params.limit = 150;

      const data = await backofficeApi.listAuditoria(params);
      setLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      snackbar.error(e.message || "Error al cargar la bitácora de auditoría.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [desde, hasta, accion, usuario, mesa, severidad, snackbar]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleResetFilters = () => {
    setDesde("");
    setHasta("");
    setUsuario("");
    setMesa("");
    setAccion("");
    setSeveridad("");
  };

  const getEventIcon = (accionName) => {
    const meta = actionMetadata[accionName];
    if (meta) {
      const IconComp = meta.icon;
      return <IconComp className="h-5 w-5" />;
    }
    return <ClipboardList className="h-5 w-5" />;
  };

  const getEventColorClass = (accionName) => {
    return actionMetadata[accionName]?.color || "text-slate-600 bg-slate-50 border-slate-100";
  };

  const formatDetails = (log) => {
    if (!log.detallesJson) return null;
    try {
      const details = JSON.parse(log.detallesJson);
      
      switch (log.accion) {
        case "AdicionProducto":
          return (
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              agregó {details.cantidad}x {details.producto} ({formatCurrency(details.precio)}) {details.notas ? ` - "${details.notas}"` : ""}
            </span>
          );
        case "CancelacionLineaConPin":
          return (
            <span className="font-semibold text-red-600 dark:text-red-400">
              eliminó con PIN {details.cantidad}x {details.producto} ({formatCurrency(details.monto)})
            </span>
          );
        case "CancelacionPedido":
          return (
            <span className="font-semibold text-red-600 dark:text-red-400">
              canceló la orden completa {details.numero} (Monto: {formatCurrency(details.monto)})
            </span>
          );
        case "TrasladoMesa":
          return (
            <span>
              trasladó la cuenta desde <strong className="text-slate-800 dark:text-slate-200">{details.desdeMesa}</strong> hacia <strong className="text-slate-800 dark:text-slate-200">{details.haciaMesa}</strong>
            </span>
          );
        case "SeparacionCuenta":
          return (
            <span>
              separó la cuenta de la orden <strong className="text-slate-800 dark:text-slate-200">#{details.desdeOrden}</strong>, creando la nueva orden <strong className="text-slate-800 dark:text-slate-200">#{details.haciaOrden}</strong> (Monto: {formatCurrency(details.montoTrasladado)})
            </span>
          );
        case "PagoProcesado":
          return (
            <span>
              procesó el pago de {formatCurrency(details.monto)} en <strong>{details.tipoPago}</strong> (Facturas: {details.facturas?.join(", ")})
            </span>
          );
        case "AperturaCaja":
          return (
            <span>
              abrió la sesión de caja con un monto inicial de <strong>{formatCurrency(details.montoInicial)}</strong>
            </span>
          );
        case "CierreCaja":
          return (
            <span>
              cerró la caja con total general de <strong>{formatCurrency(details.totalGeneral)}</strong> (Diferencia: {details.diferencia != null ? formatCurrency(details.diferencia) : "Cero"})
            </span>
          );
        case "DiferenciaCierre":
          return (
            <span className="font-bold text-orange-600 dark:text-orange-400">
              ¡Alerta! Diferencia de arqueo de caja de {formatCurrency(details.diferencia)} (Esperado: {formatCurrency(details.esperado)}, Real: {formatCurrency(details.real)})
            </span>
          );
        case "CambioEstadoMesa":
          return (
            <span>
              cambió el estado de la mesa a <strong>{details.nuevo}</strong> (estaba en: {details.anterior})
            </span>
          );
        case "InventarioEntrada":
          return (
            <span>
              registró entrada de inventario manual de <strong>{details.cantidad} uds</strong> de <strong className="text-slate-800 dark:text-slate-200">{details.producto}</strong> (Stock: {details.stockAnterior} → {details.stockNuevo}) {details.obs ? ` — "${details.obs}"` : ""}
            </span>
          );
        case "InventarioSalida":
          return (
            <span>
              registró salida de inventario manual ({details.subtipo}) de <strong>{Math.abs(details.cantidad)} uds</strong> de <strong className="text-slate-800 dark:text-slate-200">{details.producto}</strong> (Stock: {details.stockAnterior} → {details.stockNuevo}) {details.obs ? ` — "${details.obs}"` : ""}
            </span>
          );
        case "InventarioAjuste":
          return (
            <span>
              ajustó manualmente el inventario de <strong className="text-slate-800 dark:text-slate-200">{details.producto}</strong> (Stock: {details.stockAnterior} → {details.stockNuevo}, Diferencia: {details.diferencia}) {details.obs ? ` — "${details.obs}"` : ""}
            </span>
          );
        case "AperturaMesa":
          return (
            <span>
              abrió la mesa y creó la orden <strong className="text-slate-800 dark:text-slate-200">{details.numero}</strong>
            </span>
          );
        default:
          return <span className="text-slate-600 dark:text-slate-400">{log.detallesJson}</span>;
      }
    } catch {
      return <span className="text-slate-600 dark:text-slate-400">{log.detallesJson}</span>;
    }
  };

  return (
    <BackofficePageShell maxWidth="7xl" className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-slate-700 dark:text-slate-300" />
            Bitácora de Auditoría
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Historial detallado y trazabilidad de las acciones y seguridad en tiempo real.
          </p>
        </div>
        <button
          type="button"
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Actualizar
        </button>
      </div>

      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
          {/* Desde */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Desde
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Hasta */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Hasta
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Usuario */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <User className="h-3.5 w-3.5" /> Mesero / Usuario
            </label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Ej. Juan"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
              />
            </div>
          </div>

          {/* Mesa */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">
              Mesa / Origen
            </label>
            <input
              type="text"
              placeholder="Ej. Mesa 4"
              value={mesa}
              onChange={(e) => setMesa(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            />
          </div>

          {/* Acción */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">
              Acción
            </label>
            <select
              value={accion}
              onChange={(e) => setAccion(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <option value="">Todas las acciones</option>
              {Object.entries(actionMetadata).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>

          {/* Severidad */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-500 mb-1">
              Importancia
            </label>
            <select
              value={severidad}
              onChange={(e) => setSeveridad(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200"
            >
              <option value="">Todos los eventos</option>
              <option value="critica">Solo Críticos / Alertas PIN</option>
            </select>
          </div>
        </div>

        {(desde || hasta || usuario || mesa || accion || severidad) && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-350 transition font-medium"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Timeline Section */}
      <div className="rounded-2xl border border-slate-200/80 bg-white dark:bg-slate-900 dark:border-slate-800 p-6 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <RefreshCw className="h-8 w-8 text-slate-400 animate-spin" />
            <p className="text-sm text-slate-500 dark:text-slate-400">Cargando bitácora...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
            <ClipboardList className="h-10 w-10 text-slate-300 dark:text-slate-650" />
            <p className="font-semibold text-slate-600 dark:text-slate-400">Sin registros de auditoría.</p>
            <p className="text-xs text-slate-400 max-w-sm">No se encontraron eventos para los filtros seleccionados o no hay acciones registradas.</p>
          </div>
        ) : (
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-4 pl-6 space-y-6">
            {logs.map((log) => (
              <div key={log.id} className="relative group">
                {/* Timeline dot with icon */}
                <span className={`absolute -left-[45px] top-1 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white dark:border-slate-900 shadow-sm transition-all group-hover:scale-105 ${getEventColorClass(log.accion)}`}>
                  {getEventIcon(log.accion)}
                </span>

                {/* Event Card */}
                <div className="rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-850 dark:bg-slate-900/60 p-4 hover:border-slate-200 dark:hover:border-slate-700 transition">
                  <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                    {/* Timestamp & User */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                        {formatDateTime(log.fecha)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200/60 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                        {log.nombreUsuario || "Sistema"}
                      </span>
                      {log.rolUsuario && (
                        <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500">
                          {log.rolUsuario}
                        </span>
                      )}
                    </div>

                    {/* Table / Context Badge */}
                    {log.mesaNumero && (
                      <div className="flex items-center">
                        <span className="inline-flex rounded-md bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700 px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                          {log.mesaNumero}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Log Content Description */}
                  <div className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {formatDetails(log)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BackofficePageShell>
  );
}
