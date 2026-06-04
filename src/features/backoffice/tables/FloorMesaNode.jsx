import React, { useRef, useCallback } from "react";
import Draggable from "react-draggable";
import { MoreVertical, Pencil, Trash2, Lock, GripVertical } from "lucide-react";
import { useMesaResize } from "./hooks/useMesaResize.js";
import { MESA_PLANO_BASE_H, MESA_PLANO_BASE_W } from "../utils/mesaPlanoLayout.js";

export const FloorMesaNode = React.memo(function FloorMesaNode({
  table,
  position,
  selected,
  onSelect,
  onScaleCommit,
  cajaAbierta,
  isAdmin,
  tableIllustration,
  activeTableMenu,
  setActiveTableMenu,
  onOpenPos,
  onOpenEdit,
  onRequestDelete,
  onDragStop,
}) {
  const nodeRef = useRef(null);
  const { scale, resizing, startResize } = useMesaResize(
    position?.s ?? 1,
    onScaleCommit,
    table.id
  );

  const outerW = MESA_PLANO_BASE_W * scale;
  const outerH = MESA_PLANO_BASE_H * scale;

  const handleStop = useCallback(
    (_, data) => {
      onDragStop(table.id, data.x, data.y);
    },
    [onDragStop, table.id]
  );

  const onResizePointerDown = useCallback((e) => {
    startResize(e, nodeRef.current);
  }, [startResize]);

  const isOcupada = Boolean(table?.hasActiveOrder);
  const isReservada = !isOcupada && String(table?.status ?? "Libre").trim().toLowerCase() === "reservada";
  let localShell = "";
  let dotClass = "";
  let pulseClass = "";

  if (isOcupada) {
    localShell = "border-rose-300 bg-rose-50/85 text-rose-950 shadow-[0_8px_25px_rgba(244,63,94,0.18)] hover:border-rose-400 hover:bg-rose-100/70 transition-all duration-300";
    dotClass = "bg-rose-600 shadow shadow-rose-600/50";
    pulseClass = "bg-rose-500";
  } else if (isReservada) {
    localShell = "border-violet-300 bg-violet-50/85 text-violet-950 shadow-[0_8px_25px_rgba(139,92,246,0.15)] hover:border-violet-400 hover:bg-violet-100/70 transition-all duration-300";
    dotClass = "bg-violet-600 shadow shadow-violet-600/50";
    pulseClass = "bg-violet-500";
  } else {
    localShell = "border-slate-100 bg-white/95 text-slate-800 shadow-[0_8px_25px_rgba(16,185,129,0.06)] hover:border-emerald-200 hover:shadow-[0_8px_25px_rgba(16,185,129,0.10)] transition-all duration-300";
    dotClass = "bg-emerald-500 shadow shadow-emerald-500/40 animate-pulse";
    pulseClass = "bg-emerald-400";
  }

  return (
    <Draggable
      nodeRef={nodeRef}
      handle=".mesa-plano-handle"
      position={{ x: position.x, y: position.y }}
      bounds="parent"
      disabled={resizing}
      onStop={handleStop}
    >
      <div
        ref={nodeRef}
        className={`absolute left-0 top-0 z-10 select-none rounded-lg ${selected ? "ring-2 ring-indigo-500 ring-offset-1" : ""}`}
        style={{ width: outerW, height: outerH }}
        onMouseDown={(e) => {
          if (e.target.closest("[data-plano-resize-handle]")) return;
          e.stopPropagation();
          onSelect(table.id);
        }}
      >
        <div
          className="relative origin-top-left"
          style={{
            width: MESA_PLANO_BASE_W,
            height: MESA_PLANO_BASE_H,
            transform: `scale(${scale})`,
            transformOrigin: "0 0",
          }}
        >
          <div
            className={`group relative h-full w-[6.875rem] overflow-hidden rounded-lg border transition-all duration-300 ${localShell} ${cajaAbierta ? "" : "opacity-90"}
            active:scale-[1.04] active:shadow-2xl active:shadow-slate-900/25 active:z-50 active:-translate-y-0.5`}
          >
            {!cajaAbierta && <div className="pointer-events-none absolute inset-0 z-20 rounded-lg bg-slate-950/[0.03] backdrop-blur-[0.5px]" />}

            <div
              className={`mesa-plano-handle flex cursor-grab items-center gap-1 border-b px-1.5 py-0.5 active:cursor-grabbing transition ${
                isOcupada 
                  ? "border-rose-200 bg-rose-100/60" 
                  : isReservada 
                    ? "border-violet-200 bg-violet-100/60" 
                    : "border-slate-100 bg-slate-50/40"
              }`}
            >
              <GripVertical className="h-2.5 w-2.5 shrink-0 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                {pulseClass && (
                  <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${pulseClass}`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${dotClass}`}></span>
              </span>

              <span className={`min-w-0 flex-1 truncate text-center text-[9px] font-bold uppercase ${
                isOcupada ? "text-rose-950" : isReservada ? "text-violet-950" : "text-slate-700"
              }`}>
                {table.displayId}
              </span>
              
              {table.hasActiveOrder && table.activeOrdersCount > 0 ? (
                <span className="shrink-0 rounded-full bg-rose-600 shadow shadow-rose-500/30 px-1 text-[8px] font-bold leading-none text-white">{table.activeOrdersCount}</span>
              ) : (
                <span className="w-3 shrink-0" />
              )}
            </div>

            {isAdmin && (
              <>
                <div className="absolute right-1 top-7 z-30 hidden gap-1 opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto lg:flex">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onOpenEdit(table.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white/95 text-slate-700 shadow-sm hover:bg-white hover:text-indigo-600 transition"
                    title="Editar"
                  >
                    <Pencil className="h-2.5 w-2.5" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onRequestDelete(table.id);
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="inline-flex h-5 w-5 items-center justify-center rounded border border-rose-200 bg-rose-50/95 text-rose-600 shadow-sm hover:bg-rose-100"
                    title="Eliminar"
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </button>
                </div>
                <div className="absolute right-1 top-7 z-30 lg:hidden">
                  <button
                    type="button"
                    aria-label="Acciones"
                    data-table-menu-trigger
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setActiveTableMenu((curr) => (curr === table.id ? null : table.id));
                    }}
                    onPointerDown={(e) => e.stopPropagation()}
                    className="inline-flex h-5 w-5 items-center justify-center rounded border border-slate-200 bg-white/95 text-slate-700 shadow-sm"
                  >
                    <MoreVertical className="h-2.5 w-2.5" />
                  </button>
                  {activeTableMenu === table.id && (
                    <div className="absolute right-0 top-6 z-40 w-24 overflow-hidden rounded-md border border-slate-200 bg-white text-left shadow-lg">
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTableMenu(null);
                          onOpenEdit(table.id);
                        }}
                        className="flex w-full items-center gap-1 px-1.5 py-1 text-[9px] font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Pencil className="h-2.5 w-2.5" /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveTableMenu(null);
                          onRequestDelete(table.id);
                        }}
                        className="flex w-full items-center gap-1 px-1.5 py-1 text-[9px] font-semibold text-red-600 hover:bg-rose-50 transition"
                      >
                        <Trash2 className="h-2.5 w-2.5" /> Borrar
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(table.id);
              }}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (cajaAbierta) onOpenPos(table);
              }}
              disabled={!cajaAbierta}
              className="relative z-10 flex w-full flex-col items-center px-1.5 pb-1 pt-1.5 disabled:cursor-not-allowed"
            >
              <div className="w-full overflow-hidden rounded group/img mb-1">
                <img 
                  src={tableIllustration} 
                  alt={`Mesa ${table.displayId}`} 
                  className="h-11 w-full object-contain transition-transform duration-500 ease-out group-hover/img:scale-110" 
                  style={{
                    filter: isOcupada 
                      ? "sepia(1) saturate(4) hue-rotate(-50deg) brightness(0.95)" 
                      : isReservada 
                        ? "sepia(1) saturate(3.5) hue-rotate(220deg) brightness(0.95)" 
                        : undefined
                  }}
                />
              </div>
              <span className={`text-[8.5px] font-extrabold tracking-wide ${
                isOcupada 
                  ? "text-rose-600 animate-pulse" 
                  : isReservada 
                    ? "text-violet-600 animate-pulse" 
                    : "text-slate-500"
              }`}>
                {isOcupada 
                  ? "OCUPADA" 
                  : isReservada 
                    ? "RESERVADA" 
                    : cajaAbierta 
                      ? "Doble clic" 
                      : "Caja cerrada"
                }
              </span>
            </button>

            {!cajaAbierta ? (
              <div className="pointer-events-none absolute bottom-0.5 left-0.5 right-0.5 z-20 flex items-center justify-center gap-0.5 rounded bg-white/90 py-px text-[7px] font-semibold text-slate-700">
                <Lock className="h-2 w-2" />
              </div>
            ) : (
              <div className={`absolute bottom-0.5 right-1 pointer-events-none z-10 text-[7.5px] font-bold px-1 py-px rounded border shadow-sm ${
                isOcupada 
                  ? "text-rose-800 bg-rose-100/90 border-rose-200" 
                  : isReservada 
                    ? "text-violet-800 bg-violet-100/90 border-violet-200" 
                    : "text-slate-400 bg-slate-50/90 border-slate-100/50"
              }`}>
                👥 {table.capacity ?? 4}
              </div>
            )}
          </div>
        </div>

        {selected && (
          <>
            <div className="pointer-events-none absolute -left-1 -top-1 z-20 h-2 w-2 rounded-sm border border-indigo-500 bg-white shadow-sm" />
            <div className="pointer-events-none absolute -right-1 -top-1 z-20 h-2 w-2 rounded-sm border border-indigo-500 bg-white shadow-sm" />
            <div className="pointer-events-none absolute -left-1 -bottom-1 z-20 h-2 w-2 rounded-sm border border-indigo-500 bg-white shadow-sm" />
            <div className="pointer-events-none absolute left-1/2 -top-1 z-20 h-2 w-2 -translate-x-1/2 rounded-sm border border-indigo-500 bg-white shadow-sm" />
            <div className="pointer-events-none absolute -left-1 top-1/2 z-20 h-2 w-2 -translate-y-1/2 rounded-sm border border-indigo-500 bg-white shadow-sm" />
            <div className="pointer-events-none absolute -right-1 top-1/2 z-20 h-2 w-2 -translate-y-1/2 rounded-sm border border-indigo-500 bg-white shadow-sm" />
            <div className="pointer-events-none absolute bottom-1 left-1/2 z-20 h-2 w-2 -translate-x-1/2 rounded-sm border border-indigo-500 bg-white shadow-sm" />
            <div
              data-plano-resize-handle
              title="Arrastrar para cambiar tamaño"
              className="absolute -bottom-1.5 -right-1.5 z-30 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border-2 border-indigo-500 bg-white shadow-md hover:bg-indigo-50"
              onPointerDown={onResizePointerDown}
            />
          </>
        )}
      </div>
    </Draggable>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.selected === nextProps.selected &&
    prevProps.position.x === nextProps.position.x &&
    prevProps.position.y === nextProps.position.y &&
    prevProps.position.s === nextProps.position.s &&
    prevProps.cajaAbierta === nextProps.cajaAbierta &&
    prevProps.activeTableMenu === nextProps.activeTableMenu &&
    prevProps.table.estado === nextProps.table.estado &&
    prevProps.table.activeOrdersCount === nextProps.table.activeOrdersCount
  );
});
