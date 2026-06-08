import { useEffect, useState } from "react";
import { Printer, X } from "lucide-react";
import { resolveBackendAssetUrl } from "../../features/backoffice/utils/backofficePrint.js";

export function TicketPreviewModal() {
  const [open, setOpen] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [onConfirm, setOnConfirm] = useState(null);
  const [onCancel, setOnCancel] = useState(null);

  useEffect(() => {
    const handleShowPreview = (e) => {
      const { text, onConfirmPrint, onCancelPrint } = e.detail || {};
      if (!text) return;

      setTextContent(text);
      setOnConfirm(() => onConfirmPrint);
      setOnCancel(() => onCancelPrint);
      setOpen(true);
    };

    window.addEventListener("show-ticket-preview", handleShowPreview);
    return () => window.removeEventListener("show-ticket-preview", handleShowPreview);
  }, []);

  const companyName = (() => { try { return localStorage.getItem("pos_app_name") || "BarRestPOS"; } catch { return "BarRestPOS"; } })();
  const hasLogo = (() => { try { return !!localStorage.getItem("pos_logo_url"); } catch { return false; } })();
  const logoUrl = (() => { try { return localStorage.getItem("pos_logo_url"); } catch { return null; } })();

  if (!open) return null;

  const handleClose = () => {
    if (typeof onCancel === "function") onCancel();
    setOpen(false);
  };

  const handlePrint = () => {
    if (typeof onConfirm === "function") onConfirm();
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-end justify-center sm:items-center bg-slate-900/60 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="flex w-full max-w-[420px] flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh]">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Printer className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{companyName}</h3>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Previsualización de Ticket · Formato Térmico 80mm
                {hasLogo && <span className="ml-1.5 inline-flex items-center gap-0.5 text-emerald-600">· Logo ✓</span>}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            aria-label="Cerrar previsualización"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cuerpo: rollo de papel térmico simulado */}
        <div className="flex-1 overflow-y-auto bg-slate-100 py-5 px-4">
          {/* Simulación del rollo de papel */}
          <div
            className="w-full max-w-[380px] mx-auto rounded-sm overflow-x-auto p-5"
            style={{
              background: "#fdfdfb",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
              borderTop: "3px dashed #cbd5e1",
              borderBottom: "3px dashed #cbd5e1",
            }}
          >
            {hasLogo && logoUrl && (
              <div className="flex justify-center mb-3">
                <img src={resolveBackendAssetUrl(logoUrl)} alt="Logo del negocio" className="max-h-20 max-w-[280px] object-contain" onError={(e) => { e.target.style.display = "none"; }} />
              </div>
            )}
            <pre className="whitespace-pre font-mono text-[11px] leading-[14px] sm:text-[12px] sm:leading-[16px] text-black" style={{fontFamily: "'Courier New', Courier, monospace"}}>
              {textContent}
            </pre>
          </div>
        </div>

        {/* Footer: botones de acción */}
        <div className="shrink-0 flex items-center gap-3 border-t border-slate-100 bg-white px-5 py-4">
          <button
            type="button"
            onClick={handleClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-all"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-sm"
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </button>
        </div>

      </div>
    </div>
  );
}
