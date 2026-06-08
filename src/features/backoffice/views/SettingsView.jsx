import { useEffect, useState } from "react";
import { DollarSign, Eye, EyeOff, KeyRound, Pencil, Trash2, Image, Sliders, MessageSquare, Settings, Database, AlertTriangle, Printer, Receipt, ChefHat, ClipboardList } from "lucide-react";
import { backofficeApi } from "../services/backofficeApi.js";
import { authApi } from "../../../api/auth.js";
import { BackofficeDialog, BackofficeListSkeletonLoading, BackofficePageShell } from "../components/index.js";
import { useAuth } from "../../../contexts/AuthContext.jsx";
import { useSnackbar } from "../../../contexts/SnackbarContext.jsx";
import { ConfirmModal } from "../../../components/ui/ConfirmModal.jsx";
import { cn } from "../../../utils/cn.js";
import {
  modalFormBodyScrollClass,
  modalFormFooterClass,
  modalFormRootClass,
  modalInputTouchClass,
} from "../utils/modalResponsiveClasses.js";
import { POS_EXCHANGE_RATE_UPDATED_EVENT } from "../constants/posEvents.js";
import { tipoCambioInputTextFromApi } from "../utils/currency.js";
import { resolveBackendAssetUrl } from "../utils/backofficePrint.js";

const PIN_PEDIDOS_KEY = "PinCancelacionPedidos";

async function persistTipoCambioServidor(n) {
  if (!Number.isFinite(n) || n <= 0) return;
  await backofficeApi.updateTipoCambio(n);
  window.dispatchEvent(new CustomEvent(POS_EXCHANGE_RATE_UPDATED_EVENT));
}

function findPinInSettings(settings) {
  const list = Array.isArray(settings) ? settings : [];
  for (const cfg of list) {
    if (String(cfg?.clave ?? cfg?.Clave ?? "") === PIN_PEDIDOS_KEY) {
      const value = cfg?.valor ?? cfg?.Valor;
      return value != null ? String(value) : "";
    }
  }
  return "";
}

async function persistPinPedidos(code) {
  const raw = String(code ?? "").trim();
  if (!raw) throw new Error("Ingresa el PIN o código de confirmación.");
  await backofficeApi.upsertConfiguracion(
    PIN_PEDIDOS_KEY,
    raw,
    "PIN global para cancelar pedidos (listado, POS y delivery).",
  );
}

export function SettingsView() {
  const { user } = useAuth();
  const snackbar = useSnackbar();
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [configForm, setConfigForm] = useState({ clave: "", valor: "", descripcion: "" });
  const [templates, setTemplates] = useState([]);
  const [templatesActivas, setTemplatesActivas] = useState("");
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateForm, setTemplateForm] = useState({
    id: null,
    nombre: "",
    contenido: "",
    activa: true,
    predeterminada: false,
  });
  const [alertasStockMinimo, setAlertasStockMinimo] = useState(true);
  const [sonidosNotificacion, setSonidosNotificacion] = useState(true);
  const [enableVistaZonas, setEnableVistaZonas] = useState(true);
  const [enableVistaPlano, setEnableVistaPlano] = useState(true);
  const [enablePantallaCocina, setEnablePantallaCocina] = useState(true);
  const [logoUrl, setLogoUrl] = useState("");
  const [appNameInput, setAppNameInput] = useState("");
  const [impresoraCaja, setImpresoraCaja] = useState("");
  const [impresoraCocina, setImpresoraCocina] = useState("");
  const [impresoraComanda, setImpresoraComanda] = useState("");
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [confirmDeleteTemplate, setConfirmDeleteTemplate] = useState({ open: false, id: null });
  const [pinCancelacionInput, setPinCancelacionInput] = useState("");
  const [showPinCancelacion, setShowPinCancelacion] = useState(false);
  const [tipoCambioInput, setTipoCambioInput] = useState(() => tipoCambioInputTextFromApi(null));
  const [activeTab, setActiveTab] = useState("general");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetConfirmText, setResetConfirmText] = useState("");
  const [resetStep, setResetStep] = useState(1);
  const [resetting, setResetting] = useState(false);

  const tabs = [
    { id: "general", label: "General & Moneda", icon: Sliders, desc: "Moneda, tipo de cambio y perfil" },
    { id: "visual", label: "Identidad Visual", icon: Image, desc: "Logo del negocio para tickets" },
    { id: "preferencias", label: "Preferencias POS", icon: Settings, desc: "Alertas, sonidos y vistas" },
    { id: "impresoras", label: "Impresoras", icon: Printer, desc: "Configuración térmica" },
    { id: "seguridad", label: "Seguridad", icon: KeyRound, desc: "PIN de cancelación de pedidos" },
    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare, desc: "Plantillas de facturación" },
    { id: "datos", label: "Datos", icon: Database, desc: "Mantenimiento y limpieza" },
  ];

  const loadAll = async () => {
    const [config, tmpl, tc] = await Promise.all([
      backofficeApi.configuraciones(),
      backofficeApi.listPlantillasWhatsapp(templatesActivas === "" ? {} : { activas: templatesActivas }),
      backofficeApi.configuracionTipoCambio().catch(() => null),
    ]);
    const list = Array.isArray(config) ? config : config?.items || [];
    setSettings(list);
    setPinCancelacionInput(findPinInSettings(list));
    setTemplates(Array.isArray(tmpl) ? tmpl : tmpl?.items || []);
    setTipoCambioInput(tipoCambioInputTextFromApi(tc));

    const hasZonas = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "") === "Mesas:HabilitarVistaZonas");
    const hasPlano = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "") === "Mesas:HabilitarVistaPlano");
    setEnableVistaZonas(hasZonas ? hasZonas.valor !== "false" && hasZonas.Valor !== "false" : true);
    setEnableVistaPlano(hasPlano ? hasPlano.valor !== "false" && hasPlano.Valor !== "false" : true);

    const hasLogo = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "").toLowerCase() === "tickets:logourl");
    setLogoUrl(hasLogo ? hasLogo.valor || hasLogo.Valor || "" : "");

    const hasName = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "").toLowerCase() === "tickets:companyname");
    setAppNameInput(hasName ? hasName.valor || hasName.Valor || "" : "");

    const hasCocina = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "") === "Restaurante:HabilitarPantallaCocina");
    setEnablePantallaCocina(hasCocina ? hasCocina.valor !== "false" && hasCocina.Valor !== "false" : true);

    const impCaja = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "") === "Tickets:ImpresoraCaja");
    setImpresoraCaja(impCaja ? impCaja.valor || impCaja.Valor || "" : "");
    const impCoc = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "") === "Tickets:ImpresoraCocina");
    setImpresoraCocina(impCoc ? impCoc.valor || impCoc.Valor || "" : "");
    const impCom = list.find(cfg => String(cfg?.clave ?? cfg?.Clave ?? "") === "Tickets:ImpresoraComanda");
    setImpresoraComanda(impCom ? impCom.valor || impCom.Valor || "" : "");
  };

  useEffect(() => {
    let mounted = true;
    loadAll()
      .catch((e) => mounted && setError(e.message || "No se pudo cargar configuraciones."))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reloadTemplates = async (activas = templatesActivas) => {
    const data = await backofficeApi.listPlantillasWhatsapp(activas === "" ? {} : { activas });
    setTemplates(Array.isArray(data) ? data : data?.items || []);
  };

  const openConfigEditor = (cfg) => {
    setConfigForm({
      clave: cfg?.clave || "",
      valor: cfg?.valor != null ? String(cfg.valor) : "",
      descripcion: cfg?.descripcion || "",
    });
    setModalOpen(true);
  };

  const saveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await backofficeApi.upsertConfiguracion(configForm.clave, configForm.valor, configForm.descripcion);
      const claveNorm = String(configForm.clave || "").trim().toLowerCase();
      if (claveNorm === "tipocambiodolar") {
        const n = Number(String(configForm.valor).replace(",", "."));
        await persistTipoCambioServidor(n).catch(() => {});
      }
      await loadAll();
      setModalOpen(false);
      snackbar.success("Configuración guardada.");
    } catch (e2) {
      snackbar.error(e2.message || "No se pudo guardar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const openTemplateCreate = () => {
    setTemplateForm({
      id: null,
      nombre: "",
      contenido: "",
      activa: true,
      predeterminada: false,
    });
    setTemplateModalOpen(true);
  };

  const openTemplateEdit = async (id) => {
    setSaving(true);
    setError("");
    try {
      const t = await backofficeApi.getPlantillaWhatsapp(id);
      setTemplateForm({
        id: t.id,
        nombre: t.nombre || "",
        contenido: t.contenido || t.mensaje || "",
        activa: t.activa !== false,
        predeterminada: Boolean(t.predeterminada || t.esDefault),
      });
      setTemplateModalOpen(true);
    } catch (e) {
      setError(e.message || "No se pudo cargar plantilla.");
    } finally {
      setSaving(false);
    }
  };

  const saveTemplate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const nombre = String(templateForm.nombre || "").trim();
      const mensaje = String(templateForm.contenido || "").trim();
      if (!nombre || !mensaje) {
        snackbar.error("Nombre y mensaje son requeridos.");
        return;
      }
      const body = {
        nombre,
        /** Backend actual usa `mensaje`; `contenido` se conserva por compatibilidad. */
        mensaje,
        contenido: mensaje,
        activa: Boolean(templateForm.activa),
      };
      let templateId = templateForm.id;
      if (templateForm.id) {
        await backofficeApi.updatePlantillaWhatsapp(templateForm.id, body);
      } else {
        const created = await backofficeApi.createPlantillaWhatsapp(body);
        templateId = created?.id || created?.plantillaId || null;
      }
      if (templateForm.predeterminada && templateId) {
        await backofficeApi.marcarDefaultPlantillaWhatsapp(templateId);
      }
      await reloadTemplates();
      setTemplateModalOpen(false);
      snackbar.success("Plantilla guardada.");
    } catch (e2) {
      snackbar.error(e2.message || "No se pudo guardar plantilla.");
    } finally {
      setSaving(false);
    }
  };

  const removeTemplate = async (id) => {
    setSaving(true);
    setError("");
    try {
      await backofficeApi.deletePlantillaWhatsapp(id);
      await reloadTemplates();
      snackbar.success("Plantilla eliminada.");
    } catch (e) {
      snackbar.error(e.message || "No se pudo eliminar plantilla.");
    } finally {
      setSaving(false);
    }
  };

  const saveTipoCambioDolar = async () => {
    const n = Number(String(tipoCambioInput).replace(",", ".").trim());
    if (!Number.isFinite(n) || n <= 0) {
      snackbar.error("Ingresa un tipo de cambio válido (mayor que 0).");
      return;
    }
    setSaving(true);
    try {
      await persistTipoCambioServidor(n);
      await loadAll();
      snackbar.success("Tipo de cambio actualizado. El POS usará este valor al cobrar en USD.");
    } catch (e) {
      snackbar.error(e.message || "No se pudo guardar el tipo de cambio.");
    } finally {
      setSaving(false);
    }
  };

  const savePinCancelacion = async () => {
    setSaving(true);
    try {
      await persistPinPedidos(pinCancelacionInput);
      await loadAll();
      snackbar.success("PIN de cancelación actualizado.");
    } catch (e) {
      snackbar.error(e.message || "No se pudo guardar el PIN.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVistaZonas = async () => {
    const newValue = !enableVistaZonas;
    if (!newValue && !enableVistaPlano) {
      snackbar.error("Debe haber al menos una vista de mesas activa.");
      return;
    }
    setSaving(true);
    try {
      await backofficeApi.upsertConfiguracion(
        "Mesas:HabilitarVistaZonas",
        String(newValue),
        "Habilitar la vista de zonas en mesas (true/false)",
      );
      await loadAll();
      snackbar.success(`Vista de Zonas ${newValue ? "habilitada" : "deshabilitada"}.`);
    } catch (err) {
      snackbar.error(err.message || "Error al actualizar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVistaPlano = async () => {
    const newValue = !enableVistaPlano;
    if (!newValue && !enableVistaZonas) {
      snackbar.error("Debe haber al menos una vista de mesas activa.");
      return;
    }
    setSaving(true);
    try {
      await backofficeApi.upsertConfiguracion(
        "Mesas:HabilitarVistaPlano",
        String(newValue),
        "Habilitar la vista de plano físico en mesas (true/false)",
      );
      await loadAll();
      snackbar.success(`Vista de Plano ${newValue ? "habilitada" : "deshabilitada"}.`);
    } catch (err) {
      snackbar.error(err.message || "Error al actualizar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePantallaCocina = async () => {
    const newValue = !enablePantallaCocina;
    setSaving(true);
    try {
      await backofficeApi.upsertConfiguracion(
        "Restaurante:HabilitarPantallaCocina",
        String(newValue),
        "Habilitar la pantalla de cocina (KDS) (true/false)",
      );
      window.dispatchEvent(new Event("pos_config_updated"));
      await loadAll();
      snackbar.success(`Pantalla de Cocina ${newValue ? "habilitada" : "deshabilitada"}.`);
    } catch (err) {
      snackbar.error(err.message || "Error al actualizar la configuración.");
    } finally {
      setSaving(false);
    }
  };

  const savePrinters = async () => {
    setSaving(true);
    try {
      await backofficeApi.upsertConfiguracion("Tickets:ImpresoraCaja", impresoraCaja, "Nombre de impresora Windows para Caja/Recibos");
      await backofficeApi.upsertConfiguracion("Tickets:ImpresoraCocina", impresoraCocina, "Nombre de impresora Windows para Cocina");
      await backofficeApi.upsertConfiguracion("Tickets:ImpresoraComanda", impresoraComanda, "Nombre de impresora Windows para Comandas");
      await loadAll();
      snackbar.success("Configuración de impresoras térmicas actualizada.");
    } catch (err) {
      snackbar.error(err.message || "Error al actualizar impresoras.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      snackbar.error("La imagen del logo no debe superar los 5MB.");
      return;
    }

    setUploadingLogo(true);
    try {
      const data = await backofficeApi.subirLogo(file);
      const newUrl = data?.logoUrl ?? data?.LogoUrl ?? "";
      setLogoUrl(newUrl);
      if (newUrl) {
        localStorage.setItem("pos_logo_url", newUrl);
      } else {
        localStorage.removeItem("pos_logo_url");
      }
      window.dispatchEvent(new Event("pos_logo_updated"));
      await loadAll();
      snackbar.success("Logo subido y configurado correctamente.");
    } catch (err) {
      snackbar.error(err.message || "Error al subir el logo.");
    } finally {
      setUploadingLogo(false);
    }
  };

  const saveAppName = async () => {
    const val = String(appNameInput || "").trim();
    setSaving(true);
    try {
      await backofficeApi.upsertConfiguracion("Tickets:CompanyName", val, "Nombre personalizado del negocio/aplicación");
      if (val) {
        localStorage.setItem("pos_app_name", val);
      } else {
        localStorage.removeItem("pos_app_name");
      }
      window.dispatchEvent(new Event("pos_app_name_updated"));
      await loadAll();
      snackbar.success("Nombre del negocio actualizado correctamente.");
    } catch (err) {
      snackbar.error(err.message || "Error al actualizar el nombre del negocio.");
    } finally {
      setSaving(false);
    }
  };

  const makeDefaultTemplate = async (id) => {
    setSaving(true);
    setError("");
    try {
      await backofficeApi.marcarDefaultPlantillaWhatsapp(id);
      await reloadTemplates();
      snackbar.success("Plantilla marcada como predeterminada.");
    } catch (e) {
      snackbar.error(e.message || "No se pudo marcar como predeterminada.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetData = async () => {
    if (resetStep === 1) {
      if (!resetPassword || resetPassword.length < 1) {
        snackbar.error("Ingresa tu contraseña para continuar.");
        return;
      }
      setResetting(true);
      try {
        const username = user?.nombreUsuario || user?.usuario || "admin";
        if (import.meta.env.VITE_STATIC_MODE !== "true") {
          await authApi.login(username, resetPassword);
        }
        setResetStep(2);
        setResetPassword("");
      } catch (err) {
        const msg = err?.message || "";
        if (
          err?.status === 401 ||
          err?.status === 400 ||
          msg.includes("invalid") ||
          msg.includes("contraseña") ||
          msg.includes("incorrect")
        ) {
          snackbar.error("Contraseña incorrecta.");
        } else {
          snackbar.error(msg || "Error al verificar contraseña.");
        }
      } finally {
        setResetting(false);
      }
    } else if (resetStep === 2) {
      // Step 2: Confirm text
      if (resetConfirmText !== "ELIMINAR") {
        snackbar.error("Debes escribir ELIMINAR para confirmar.");
        return;
      }
      setResetStep(3);
    } else if (resetStep === 3) {
      // Step 3: Final confirmation
      setResetting(true);
      try {
        snackbar.info("Iniciando limpieza de datos...");
        await backofficeApi.resetDatosOperativos();
        snackbar.success("Datos operativos eliminados correctamente. El sistema se reiniciará.");
        setResetModalOpen(false);
        setResetStep(1);
        setResetConfirmText("");
        // Recargar la aplicación después de 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } catch (e) {
        console.error("Error al eliminar datos:", e);
        snackbar.error(e.message || "Error al eliminar datos. Revisa la consola para más detalles.");
      } finally {
        setResetting(false);
      }
    }
  };

  const openResetModal = () => {
    setResetModalOpen(true);
    setResetStep(1);
    setResetPassword("");
    setResetConfirmText("");
  };

  const filteredParametros = settings.filter((s) => {
    const k = String(s?.clave ?? s?.Clave ?? "").toLowerCase();
    return (
      k !== "tipocambiodolar" &&
      k !== "pincancelacionpedidos" &&
      k !== "codigocancelacionventa" &&
      k !== "mesas:habilitarvistazonas" &&
      k !== "mesas:habilitarvistaplano" &&
      k !== "tickets:logourl" &&
      k !== "tickets:companyname" &&
      !k.startsWith("tickets:impresora")
    );
  });

  if (loading) return <BackofficeListSkeletonLoading rows={5} maxWidth="5xl" />;
  return (
    <BackofficePageShell maxWidth="5xl" className="pb-8">
      {error && (
        <div className="mb-6 animate-in slide-in-from-top-2 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-600 fade-in">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-4">
          <nav className="flex flex-row gap-2 overflow-x-auto pb-3 lg:flex-col lg:overflow-x-visible lg:pb-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-xl p-3 text-left transition-all duration-200 cursor-pointer min-w-[160px] lg:min-w-0",
                    isActive
                      ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm shadow-blue-500/5 font-bold"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isActive ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-bold leading-none">{tab.label}</p>
                    <p
                      className={cn(
                        "mt-1.5 hidden text-[9px] font-medium leading-none lg:block",
                        isActive ? "text-blue-500" : "text-slate-400"
                      )}
                    >
                      {tab.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Configurations Pane */}
        <div className="lg:col-span-8">
          {activeTab === "general" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* User Profile Info */}
              <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    <span className="text-sm font-bold uppercase">{user?.nombreUsuario?.[0] || user?.usuario?.[0] || "U"}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{user?.nombreUsuario || user?.usuario || "Usuario"}</h3>
                    <p className="text-xs text-slate-500">{user?.rol || "Administrador"}</p>
                  </div>
                </div>
              </article>

              {/* Currency & Exchange Rate */}
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <DollarSign className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Tipo de cambio (dólar)</h3>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="tipo-cambio-usd" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      1 USD = C$
                    </label>
                    <input
                      id="tipo-cambio-usd"
                      type="text"
                      inputMode="decimal"
                      value={tipoCambioInput}
                      onChange={(e) => setTipoCambioInput(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold tabular-nums text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder={tipoCambioInputTextFromApi(null)}
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => void saveTipoCambioDolar()}
                    disabled={saving}
                    className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    Guardar tipo de cambio
                  </button>
                </div>
              </section>

              {/* System parameters */}
              {filteredParametros.length > 0 && (
                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-4 text-[11px] font-black uppercase tracking-widest text-slate-400">Parámetros del sistema</h3>
                  <ul className="divide-y divide-slate-100">
                    {filteredParametros.map((cfg, i) => {
                      const clave = cfg?.clave ?? cfg?.Clave ?? `cfg-${i}`;
                      const valor = cfg?.valor ?? cfg?.Valor ?? "";
                      return (
                        <li
                          key={String(clave)}
                          className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">{clave}</p>
                            <p className="truncate text-xs text-slate-500">{String(valor)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => openConfigEditor(cfg)}
                            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 hover:bg-slate-50 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Editar
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}
            </div>
          )}

          {activeTab === "visual" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <Image className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Identidad Visual (Logo del POS)</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Tickets y Pantallas</p>
                  </div>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                  {/* Preview */}
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-2 overflow-hidden">
                    {logoUrl ? (
                      <img
                        src={resolveBackendAssetUrl(logoUrl)}
                        alt="Logo del negocio"
                        className="max-h-full max-w-full object-contain"
                      />
                    ) : (
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sin Logo</span>
                    )}
                  </div>
                  {/* Upload button */}
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="logo-file-upload"
                      className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      Seleccionar archivo de imagen
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="logo-file-upload"
                        type="file"
                        accept="image/png, image/jpeg, image/webp"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo || saving}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById("logo-file-upload")?.click()}
                        disabled={uploadingLogo || saving}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                      >
                        {uploadingLogo ? "Subiendo..." : "Subir nuevo logo"}
                      </button>
                      {logoUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            setSaving(true);
                            try {
                              await backofficeApi.upsertConfiguracion("Tickets:LogoUrl", "", "URL relativa para el logo");
                              setLogoUrl("");
                              localStorage.removeItem("pos_logo_url");
                              window.dispatchEvent(new Event("pos_logo_updated"));
                              await loadAll();
                              snackbar.success("Logo eliminado.");
                            } catch (e) {
                              snackbar.error(e.message || "Error al eliminar el logo.");
                            } finally {
                              setSaving(false);
                            }
                          }}
                          disabled={uploadingLogo || saving}
                          className="text-xs font-bold text-red-500 hover:text-red-600 disabled:opacity-50 cursor-pointer"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">PNG, JPG o WEBP (máx. 5MB).</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
                    <Sliders className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Nombre del Negocio</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Personalización del Sistema</p>
                  </div>
                </div>
                <p className="mb-4 text-xs text-slate-500">
                  Ingresa el nombre de tu bar o restaurante. Se mostrará en la barra lateral, en la pantalla de inicio de sesión y en las impresiones térmicas de los tickets.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label htmlFor="company-name-input" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      Nombre comercial
                    </label>
                    <input
                      id="company-name-input"
                      type="text"
                      value={appNameInput}
                      onChange={(e) => setAppNameInput(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="BarRestPOS"
                      autoComplete="off"
                    />
                  </div>
                  <button
                     type="button"
                     onClick={() => void saveAppName()}
                     disabled={saving}
                     className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    Guardar nombre
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === "preferencias" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-5 text-[11px] font-black uppercase tracking-widest text-slate-400">Preferencias del POS</h3>
                <div className="divide-y divide-slate-100">
                  {[
                    { label: "Alertas Stock Mínimo", desc: "Avisar cuando se agota", state: alertasStockMinimo, setter: setAlertasStockMinimo },
                    { label: "Sonidos de Notificación", desc: "Feedback auditivo (Vol 30%)", state: sonidosNotificacion, setter: setSonidosNotificacion },
                  ].map((pref, i) => (
                    <div key={i} className="flex items-center justify-between py-4 first:pt-0">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{pref.label}</p>
                        <p className="text-xs text-slate-500">{pref.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => pref.setter((v) => !v)}
                        className={cn(
                          "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                          pref.state ? "bg-blue-600" : "bg-slate-200",
                        )}
                        aria-pressed={pref.state}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                            pref.state ? "translate-x-6" : "translate-x-1",
                          )}
                        />
                      </button>
                    </div>
                  ))}

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Habilitar Vista de Zonas (Lista)</p>
                      <p className="text-xs text-slate-500">Muestra las mesas organizadas en una cuadrícula por zonas</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleVistaZonas}
                      disabled={saving}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50",
                        enableVistaZonas ? "bg-blue-600" : "bg-slate-200",
                      )}
                      aria-pressed={enableVistaZonas}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                          enableVistaZonas ? "translate-x-6" : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Habilitar Vista de Plano (Distribución)</p>
                      <p className="text-xs text-slate-500">Muestra las mesas distribuidas de forma física e interactiva</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleVistaPlano}
                      disabled={saving}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50",
                        enableVistaPlano ? "bg-blue-600" : "bg-slate-200",
                      )}
                      aria-pressed={enableVistaPlano}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                          enableVistaPlano ? "translate-x-6" : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-4 last:pb-0">
                    <div>
                      <p className="text-sm font-bold text-slate-800">Habilitar Pantalla de Cocina Digital (KDS)</p>
                      <p className="text-xs text-slate-500">Muestra las comandas digitales en la cocina (desactivar si se usa comandas impresas físicas)</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleTogglePantallaCocina}
                      disabled={saving}
                      className={cn(
                        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors disabled:opacity-50",
                        enablePantallaCocina ? "bg-blue-600" : "bg-slate-200",
                      )}
                      aria-pressed={enablePantallaCocina}
                    >
                      <span
                        className={cn(
                          "inline-block h-5 w-5 transform rounded-full bg-white transition-transform",
                          enablePantallaCocina ? "translate-x-6" : "translate-x-1",
                        )}
                      />
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "impresoras" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <div className="border-b border-slate-100 p-5">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Printer className="h-5 w-5 text-blue-500" />
                    Impresoras Térmicas (Nativas)
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Ingresa el nombre exacto de la impresora tal como aparece en Windows (Panel de Control).
                  </p>
                </div>
                
                <div className="p-0">
                  <div className="flex flex-col">
                    {/* Caja */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <div className="sm:w-1/3 flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                          <Receipt className="h-4 w-4" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700">Caja / Recibo</label>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Facturas de clientes finales.</p>
                        </div>
                      </div>
                      <div className="sm:w-2/3">
                        <input
                          type="text"
                          value={impresoraCaja}
                          onChange={(e) => setImpresoraCaja(e.target.value)}
                          placeholder="Ej. POS-80C Caja"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Cocina */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <div className="sm:w-1/3 flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                          <ChefHat className="h-4 w-4" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700">Cocina</label>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Órdenes para chefs.</p>
                        </div>
                      </div>
                      <div className="sm:w-2/3">
                        <input
                          type="text"
                          value={impresoraCocina}
                          onChange={(e) => setImpresoraCocina(e.target.value)}
                          placeholder="Ej. POS-80C Cocina"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Comanda */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors">
                      <div className="sm:w-1/3 flex items-start gap-3">
                        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <ClipboardList className="h-4 w-4" />
                        </div>
                        <div>
                          <label className="text-sm font-bold text-slate-700">Comanda (Mesero)</label>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Pre-cuentas en mesa.</p>
                        </div>
                      </div>
                      <div className="sm:w-2/3">
                        <input
                          type="text"
                          value={impresoraComanda}
                          onChange={(e) => setImpresoraComanda(e.target.value)}
                          placeholder="Ej. POS-80C Barra"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 p-5 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                      💡 <b>Tip:</b> Si tienes solo una impresora, escribe el mismo nombre en todas las cajas.
                    </p>
                    <button
                      type="button"
                      onClick={() => void savePrinters()}
                      disabled={saving}
                      className="w-full sm:w-auto rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
                    >
                      Guardar
                    </button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "seguridad" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                    <KeyRound className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800">Código de devolución/cancelación</h3>
                </div>
                <p className="mb-4 text-xs text-slate-500">Usado al cancelar pedidos desde el listado, el POS (mesas) y delivery.</p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="min-w-0 flex-1">
                    <label
                      htmlFor="pin-cancelacion-venta"
                      className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
                    >
                      PIN / código de confirmación
                    </label>
                    <div className="relative">
                      <input
                        id="pin-cancelacion-venta"
                        type={showPinCancelacion ? "text" : "password"}
                        autoComplete="new-password"
                        value={pinCancelacionInput}
                        onChange={(e) => setPinCancelacionInput(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-3 pr-11 text-sm font-semibold tabular-nums text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Ingresa código"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPinCancelacion((s) => !s)}
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        aria-label={showPinCancelacion ? "Ocultar código" : "Ver código"}
                        title={showPinCancelacion ? "Ocultar" : "Ver"}
                      >
                        {showPinCancelacion ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void savePinCancelacion()}
                    disabled={saving}
                    className="shrink-0 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/10 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
                  >
                    Guardar código
                  </button>
                </div>
              </section>
            </div>
          )}

          {activeTab === "datos" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <section className="rounded-2xl border border-red-200 bg-red-50/50 p-6 shadow-sm">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-700">
                    <AlertTriangle className="h-5 w-5" aria-hidden />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-red-900">Zona de Peligro</h3>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-red-600">Mantenimiento de Datos</p>
                  </div>
                </div>
                <p className="mb-4 text-xs text-red-700">
                  Esta acción eliminará TODOS los datos operativos del sistema. Esta acción es irreversible.
                </p>
                <div className="rounded-xl border border-red-200 bg-white p-4">
                  <h4 className="mb-2 text-xs font-bold text-slate-800">Se eliminará:</h4>
                  <ul className="space-y-1 text-xs text-slate-600">
                    <li>• Todos los productos del menú</li>
                    <li>• Todos los clientes</li>
                    <li>• Todos los proveedores</li>
                    <li>• Todos los usuarios (excepto admin)</li>
                    <li>• Todos los pedidos (mesas y delivery)</li>
                    <li>• Todos los pagos</li>
                    <li>• Todos los movimientos de inventario</li>
                    <li>• Caja se cerrará</li>
                  </ul>
                  <h4 className="mt-3 mb-2 text-xs font-bold text-slate-800">Se mantendrá:</h4>
                  <ul className="space-y-1 text-xs text-slate-600">
                    <li>• Usuario admin/admin</li>
                    <li>• Categorías de productos</li>
                    <li>• Mesas y ubicaciones</li>
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={openResetModal}
                  className="mt-4 w-full rounded-xl border-2 border-red-500 bg-red-500 px-4 py-3 text-xs font-bold text-white hover:bg-red-600 transition-all active:scale-95 cursor-pointer"
                >
                  Eliminar Todos los Datos Operativos
                </button>
              </section>
            </div>
          )}

          {activeTab === "whatsapp" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-800">WhatsApp Marketing</h3>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Plantillas de Factura</p>
                    </div>
                    <select
                      value={templatesActivas}
                      onChange={async (e) => {
                        const v = e.target.value;
                        setTemplatesActivas(v);
                        await reloadTemplates(v);
                      }}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 cursor-pointer"
                    >
                      <option value="">Todas</option>
                      <option value="true">Activas</option>
                      <option value="false">Inactivas</option>
                    </select>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Plantillas</p>
                    <button
                      type="button"
                      onClick={openTemplateCreate}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white transition-all hover:bg-blue-700 shadow-sm shadow-blue-500/10 active:scale-95 cursor-pointer"
                    >
                      + NUEVA
                    </button>
                  </div>

                  <div className="space-y-3">
                    {templates.length === 0 && (
                      <div className="rounded-xl border border-dashed border-slate-200 py-10 text-center">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Vacío</p>
                      </div>
                    )}
                    {templates.map((t, i) => (
                      <div
                        key={t.id || i}
                        className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-sm"
                      >
                        <div className="mb-3">
                          <div className="flex items-center justify-between">
                            <h4 className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                              {t.nombre || "Sin Nombre"}
                              {(t.predeterminada || t.esDefault) && (
                                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-600 ring-1 ring-emerald-100">
                                  DEFAULT
                                </span>
                              )}
                            </h4>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteTemplate({ open: true, id: t.id })}
                              className="text-slate-300 hover:text-red-500 cursor-pointer"
                              aria-label="Eliminar plantilla"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-500">
                            {t.contenido || t.mensaje || "Sin contenido…"}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openTemplateEdit(t.id)}
                            className="text-[10px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                          >
                            EDITAR
                          </button>
                          <button
                            type="button"
                            onClick={() => makeDefaultTemplate(t.id)}
                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                          >
                            DEFAULT
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <BackofficeDialog maxWidthClass="max-w-md" onBackdropClick={saving ? undefined : () => setModalOpen(false)}>
          <form onSubmit={saveConfig} className={modalFormRootClass}>
            <h3 className="shrink-0 text-lg font-semibold text-slate-800">Editar configuración</h3>
            <div className={modalFormBodyScrollClass}>
              <input
                value={configForm.clave}
                onChange={(e) => setConfigForm((f) => ({ ...f, clave: e.target.value }))}
                placeholder="Clave"
                className={modalInputTouchClass}
                required
              />
              <input
                value={configForm.valor}
                onChange={(e) => setConfigForm((f) => ({ ...f, valor: e.target.value }))}
                placeholder="Valor"
                className={modalInputTouchClass}
                required
              />
              <textarea
                value={configForm.descripcion}
                onChange={(e) => setConfigForm((f) => ({ ...f, descripcion: e.target.value }))}
                placeholder="Descripción (opcional)"
                className={modalInputTouchClass}
                rows={3}
              />
            </div>
            <div className={modalFormFooterClass}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-primary-600 px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50 sm:w-auto"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </BackofficeDialog>
      )}
      {templateModalOpen && (
        <BackofficeDialog maxWidthClass="max-w-lg" onBackdropClick={saving ? undefined : () => setTemplateModalOpen(false)}>
          <form onSubmit={saveTemplate} className={modalFormRootClass}>
            <h3 className="shrink-0 text-lg font-semibold text-slate-800">
              {templateForm.id ? "Editar plantilla WhatsApp" : "Nueva plantilla WhatsApp"}
            </h3>
            <div className={modalFormBodyScrollClass}>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Nombre *</label>
                <input
                  value={templateForm.nombre}
                  onChange={(e) => setTemplateForm((f) => ({ ...f, nombre: e.target.value }))}
                  placeholder="Ej: Plantilla por Defecto"
                  className={modalInputTouchClass}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-600">Mensaje *</label>
                <textarea
                  value={templateForm.contenido}
                  onChange={(e) => setTemplateForm((f) => ({ ...f, contenido: e.target.value }))}
                  placeholder={"Hola {NombreCliente},\n\nLe enviamos el detalle de su pedido:\n{DetallePedido}\n…"}
                  className={modalInputTouchClass}
                  rows={8}
                  required
                />
                <p className="mt-1 text-xs text-slate-500">
                  Usa las variables: {"{NombreRestaurante}"}, {"{NombreCliente}"}, {"{NumeroFactura}"}, {"{Monto}"}, {"{Mes}"}, {"{Estado}"},{" "}
                  {"{DetallePedido}"}
                </p>
                <p className="mt-1 text-xs text-primary-700">Puedes personalizar el mensaje libremente y dejar solo las variables que necesites.</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input type="checkbox" checked={templateForm.activa} onChange={(e) => setTemplateForm((f) => ({ ...f, activa: e.target.checked }))} />
                Activa
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={templateForm.predeterminada}
                  onChange={(e) => setTemplateForm((f) => ({ ...f, predeterminada: e.target.checked }))}
                />
                Marcar como predeterminada
              </label>
            </div>
            <div className={modalFormFooterClass}>
              <button
                type="button"
                onClick={() => setTemplateModalOpen(false)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-600 sm:w-auto"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-primary-600 px-3 py-2.5 text-xs font-semibold text-white disabled:opacity-50 sm:w-auto"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </form>
        </BackofficeDialog>
      )}
      <ConfirmModal
        open={confirmDeleteTemplate.open}
        onClose={() => setConfirmDeleteTemplate({ open: false, id: null })}
        onConfirm={async () => {
          if (confirmDeleteTemplate.id) await removeTemplate(confirmDeleteTemplate.id);
        }}
        title="Eliminar plantilla"
        message="¿Deseas eliminar esta plantilla de WhatsApp?"
        confirmLabel="Eliminar"
        variant="danger"
        loading={saving}
      />
      {resetModalOpen && (
        <BackofficeDialog maxWidthClass="max-w-md" onBackdropClick={() => setResetModalOpen(false)}>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-red-900">
                  {resetStep === 1 ? "Confirmar Contraseña" : resetStep === 2 ? "Confirmar Eliminación" : "Confirmación Final"}
                </h3>
                <p className="text-xs text-red-600">
                  {resetStep === 1 ? "Paso 1 de 3" : resetStep === 2 ? "Paso 2 de 3" : "Paso 3 de 3"}
                </p>
              </div>
            </div>

            {resetStep === 1 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-700">Ingresa tu contraseña de administrador para continuar.</p>
                <input
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Contraseña"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  autoComplete="off"
                />
              </div>
            )}

            {resetStep === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-slate-700">
                  Esta acción eliminará TODOS los datos operativos del sistema. Esta acción es irreversible.
                </p>
                <p className="text-sm font-bold text-red-700">
                  Escribe <span className="font-black">ELIMINAR</span> para confirmar.
                </p>
                <input
                  type="text"
                  value={resetConfirmText}
                  onChange={(e) => setResetConfirmText(e.target.value.toUpperCase())}
                  placeholder="Escribe ELIMINAR"
                  className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold uppercase focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                  autoComplete="off"
                />
              </div>
            )}

            {resetStep === 3 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-red-900">
                  ⚠️ ESTÁS A PUNTO DE ELIMINAR TODOS LOS DATOS OPERATIVOS
                </p>
                <p className="text-sm text-slate-700">
                  Esta acción eliminará: productos, clientes, proveedores, usuarios (excepto admin), pedidos, pagos, movimientos de inventario y cerrará la caja.
                </p>
                <p className="text-sm text-slate-700">
                  Se mantendrá: usuario admin, categorías, mesas y ubicaciones.
                </p>
                <p className="text-xs font-bold text-red-700">Esta acción es irreversible.</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setResetModalOpen(false);
                  setResetStep(1);
                  setResetPassword("");
                  setResetConfirmText("");
                }}
                disabled={resetting}
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => void handleResetData()}
                disabled={resetting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {resetting ? "Procesando..." : resetStep === 3 ? "ELIMINAR DATOS" : "Continuar"}
              </button>
            </div>
          </div>
        </BackofficeDialog>
      )}
    </BackofficePageShell>
  );
}
