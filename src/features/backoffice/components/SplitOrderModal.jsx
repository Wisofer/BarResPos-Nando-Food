import React, { useState } from "react";
import { BackofficeDialog } from "./BackofficeDialog.jsx";
import { parsePosBackendLineId } from "../utils/posPedido.js";

export default function SplitOrderModal({
  open,
  onClose,
  posCart,
  posActionBusy,
  onConfirmSeparar,
  currencySymbol = "C$",
}) {
  const [selectedQtys, setSelectedQtys] = useState({});

  if (!open) return null;

  const canSplitItem = (item) => !!parsePosBackendLineId(item.lineId);
  const hasUnsyncedItems = posCart.some((item) => !canSplitItem(item));

  const handleQtyChange = (idx, delta, maxQty) => {
    setSelectedQtys((prev) => {
      const current = prev[idx] || 0;
      let nextQty = current + delta;
      if (nextQty < 0) nextQty = 0;
      if (nextQty > maxQty) nextQty = maxQty;
      
      const next = { ...prev };
      if (nextQty === 0) delete next[idx];
      else next[idx] = nextQty;
      return next;
    });
  };

  const handleToggleAll = (idx, maxQty) => {
    setSelectedQtys((prev) => {
      const next = { ...prev };
      if (next[idx] === maxQty) delete next[idx];
      else next[idx] = maxQty;
      return next;
    });
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    const lineasAMover = posCart
      .map((item, idx) => {
        const backendLineId = parsePosBackendLineId(item.lineId);
        const qtyToMove = selectedQtys[idx];
        if (qtyToMove > 0 && backendLineId) {
          return {
            facturaServicioId: backendLineId,
            cantidad: qtyToMove,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (lineasAMover.length === 0) return;
    onConfirmSeparar(lineasAMover);
  };

  const selectedSplittable = posCart.some(
    (item, idx) => selectedQtys[idx] > 0 && canSplitItem(item)
  );

  return (
    <BackofficeDialog maxWidthClass="max-w-md" onBackdropClick={posActionBusy ? undefined : onClose}>
      <form onSubmit={handleConfirm} className="w-full min-w-0">
        <h3 className="text-lg font-semibold text-slate-800">Separar Cuenta</h3>
        <p className="mt-2 text-sm text-slate-600">
          Selecciona cuántos productos deseas mover a una cuenta separada.
        </p>
        {hasUnsyncedItems && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5">
            Productos recién agregados deben guardarse primero (usa "Enviar a cocina") antes de poder separarlos.
          </p>
        )}
        <div className="mt-4 max-h-60 overflow-y-auto rounded border p-2 space-y-1">
          {posCart.map((item, idx) => {
            const splittable = canSplitItem(item);
            const qtySelected = selectedQtys[idx] || 0;
            const isSelected = qtySelected > 0;
            return (
              <div
                key={item.lineId ?? idx}
                className={`flex items-center gap-3 rounded p-2 transition-colors ${
                  splittable ? "hover:bg-slate-50" : "opacity-50"
                } ${isSelected ? "bg-violet-50/50 border border-violet-100" : "border border-transparent"}`}
              >
                <button
                  type="button"
                  onClick={() => handleToggleAll(idx, item.qty)}
                  disabled={!splittable}
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                    isSelected ? "bg-violet-600 border-violet-600 text-white" : "border-slate-300 bg-white text-transparent"
                  } disabled:cursor-not-allowed disabled:opacity-30`}
                >
                  <svg className="h-3 w-3 fill-current" viewBox="0 0 16 16"><path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l2.552 2.553 5.92-6.907z"/></svg>
                </button>
                <div className="flex-1 text-sm font-medium text-slate-700 truncate" onClick={() => handleToggleAll(idx, item.qty)}>
                  <span className="text-slate-400 mr-1">{item.qty}x</span> {item.name}
                </div>
                
                {splittable ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border border-slate-200 bg-white shadow-sm overflow-hidden h-7">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(idx, -1, item.qty)}
                        disabled={qtySelected <= 0}
                        className="flex h-full w-7 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                      >
                        -
                      </button>
                      <span className="flex h-full w-6 items-center justify-center text-xs font-semibold text-slate-700 border-x border-slate-100 bg-slate-50">
                        {qtySelected}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQtyChange(idx, 1, item.qty)}
                        disabled={qtySelected >= item.qty}
                        className="flex h-full w-7 items-center justify-center text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 shrink-0">
                    <span className="text-[10px] font-medium text-amber-600" title="Guarda la orden primero">
                      pendiente
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={posActionBusy}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={posActionBusy || !selectedSplittable}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60 transition-colors shadow-sm"
          >
            Separar Cuenta
          </button>
        </div>
      </form>
    </BackofficeDialog>
  );
}
