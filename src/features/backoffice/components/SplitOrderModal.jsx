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
  const [selectedItems, setSelectedItems] = useState({});

  if (!open) return null;

  const canSplitItem = (item) => !!parsePosBackendLineId(item.lineId);
  const hasUnsyncedItems = posCart.some((item) => !canSplitItem(item));

  const handleToggle = (itemIndex) => {
    const item = posCart[itemIndex];
    if (!item || !canSplitItem(item)) return;
    setSelectedItems((prev) => ({
      ...prev,
      [itemIndex]: !prev[itemIndex],
    }));
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    const lineasAMover = posCart
      .map((item, idx) => {
        const backendLineId = parsePosBackendLineId(item.lineId);
        if (selectedItems[idx] && backendLineId) {
          return {
            facturaServicioId: backendLineId,
            cantidad: item.qty,
          };
        }
        return null;
      })
      .filter(Boolean);

    if (lineasAMover.length === 0) return;
    onConfirmSeparar(lineasAMover);
  };

  const selectedSplittable = posCart.some(
    (item, idx) => selectedItems[idx] && canSplitItem(item)
  );

  return (
    <BackofficeDialog maxWidthClass="max-w-md" onBackdropClick={posActionBusy ? undefined : onClose}>
      <form onSubmit={handleConfirm} className="w-full min-w-0">
        <h3 className="text-lg font-semibold text-slate-800">Separar Cuenta</h3>
        <p className="mt-2 text-sm text-slate-600">
          Selecciona los productos que deseas mover a una cuenta separada.
        </p>
        {hasUnsyncedItems && (
          <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5">
            Productos recién agregados deben guardarse primero (usa "Enviar a cocina") antes de poder separarlos.
          </p>
        )}
        <div className="mt-4 max-h-60 overflow-y-auto rounded border p-2">
          {posCart.map((item, idx) => {
            const splittable = canSplitItem(item);
            return (
              <label
                key={item.lineId ?? idx}
                className={`flex cursor-pointer items-center gap-3 rounded p-2 ${
                  splittable ? "hover:bg-slate-50" : "opacity-50"
                } ${selectedItems[idx] ? "bg-violet-50" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={!!selectedItems[idx] && splittable}
                  onChange={() => handleToggle(idx)}
                  disabled={!splittable}
                  className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
                />
                <div className="flex-1 text-sm font-medium text-slate-700 truncate">
                  {item.qty}x {item.name}
                </div>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 shrink-0">
                  {!splittable && (
                    <span className="text-[10px] font-medium text-amber-600" title="Guarda la orden primero">
                      pendiente
                    </span>
                  )}
                  <span>{currencySymbol} {(item.price * item.qty).toFixed(2)}</span>
                </div>
              </label>
            );
          })}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={posActionBusy}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={posActionBusy || !selectedSplittable}
            className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Separar Cuenta
          </button>
        </div>
      </form>
    </BackofficeDialog>
  );
}
