import { useCallback, useEffect, useRef, useState } from "react";
import { Printer, X } from "lucide-react";

export function TicketPreviewModal() {
  const [open, setOpen] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");
  const [onConfirm, setOnConfirm] = useState(null);
  const [onCancel, setOnCancel] = useState(null);
  const [iframeHeight, setIframeHeight] = useState(400);
  const iframeRef = useRef(null);

  useEffect(() => {
    const handleShowPreview = (e) => {
      const { html, onConfirmPrint, onCancelPrint } = e.detail || {};
      if (!html) return;

      // Eliminar scripts automáticos de impresión del backend para evitar doble diálogo
      const sanitized = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
      
      // Inyectar estilos de reset dentro del HTML para que el ticket se vea perfecto en el iframe
      const styledHtml = sanitized.replace(
        /<body([^>]*)>/i,
        `<body$1 style="margin:0;padding:8px 10px;background:transparent;box-sizing:border-box;">
        <style>
          * { box-sizing: border-box !important; word-wrap: break-word !important; }
          body { margin: 0 !important; padding: 8px 10px !important; background: transparent !important; }
          .ticket { width: 100% !important; max-width: 100% !important; margin: 0 auto !important; padding: 0 !important; background: transparent !important; box-shadow: none !important; }
          img { max-width: 130px !important; max-height: 70px !important; object-fit: contain !important; display: block !important; margin: 0 auto 10px !important; }
          table { width: 100% !important; max-width: 100% !important; }
          td, th { overflow-wrap: break-word !important; word-break: break-word !important; }
        </style>`
      );

      setHtmlContent(styledHtml);
      setIframeHeight(400);
      setOnConfirm(() => onConfirmPrint);
      setOnCancel(() => onCancelPrint);
      setOpen(true);
    };

    window.addEventListener("show-ticket-preview", handleShowPreview);
    return () => window.removeEventListener("show-ticket-preview", handleShowPreview);
  }, []);

  // Auto-redimensiona el iframe a la altura de su contenido al cargar
  const handleIframeLoad = useCallback(() => {
    try {
      const iframe = iframeRef.current;
      if (!iframe) return;
      const doc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!doc) return;
      const height = doc.documentElement.scrollHeight || doc.body.scrollHeight;
      if (height && height > 50) {
        setIframeHeight(height + 16); // pequeño padding extra
      }
    } catch {
      // Cross-origin fallback — usar altura predeterminada
    }
  }, []);

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
      <div className="flex w-full max-w-sm flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 max-h-[92vh]">

        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-3.5 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <Printer className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Previsualización de Ticket</h3>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Formato Térmico 80mm</p>
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
            className="w-full max-w-[340px] mx-auto rounded-sm overflow-hidden"
            style={{
              background: "#fdfdfb",
              boxShadow: "0 2px 8px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.06)",
              borderTop: "3px dashed #cbd5e1",
              borderBottom: "3px dashed #cbd5e1",
            }}
          >
            {/* Iframe auto-redimensionable — renderiza el HTML completo del backend correctamente */}
            <iframe
              ref={iframeRef}
              title="ticket-preview"
              srcDoc={htmlContent}
              onLoad={handleIframeLoad}
              scrolling="no"
              style={{
                display: "block",
                width: "100%",
                height: `${iframeHeight}px`,
                border: "none",
                background: "transparent",
                overflow: "hidden",
              }}
              sandbox="allow-same-origin"
            />
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
