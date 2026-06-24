/** Nombre del grupo que crea el formulario «Opciones especiales» (debe coincidir con lo que espera el catálogo). */
export const OPCIONES_ESPECIALES_GRUPO_NOMBRE = "Opciones especiales";

function normalizeGruposPayload(raw) {
  if (Array.isArray(raw)) return raw;
  return raw?.items ?? raw?.Items ?? [];
}

export function parseOpcionesEspecialesFromGruposApi(gruposRaw) {
  const grupos = normalizeGruposPayload(gruposRaw);
  const key = OPCIONES_ESPECIALES_GRUPO_NOMBRE.toLowerCase();
  let g = grupos.find((x) => String(x?.nombre ?? x?.Nombre ?? "").trim().toLowerCase() === key) || null;
  
  // Si no se encuentra "Opciones especiales" pero el producto tiene algún grupo, tomamos el primero como fallback
  if (!g && grupos.length > 0) {
    g = grupos[0];
  }
  
  if (!g) {
    return { grupoId: null, lineas: [""], precios: [""] };
  }
  const gid = g.id ?? g.Id;
  const rawOpts = g.opciones ?? g.Opciones ?? [];
  const filtered = [...rawOpts]
    .filter((o) => o?.activo !== false && o?.Activo !== false)
    .sort((a, b) => Number(a?.orden ?? a?.Orden ?? 0) - Number(b?.orden ?? b?.Orden ?? 0));
  const lineas = filtered
    .map((o) => String(o?.nombre ?? o?.Nombre ?? "").trim())
    .filter(Boolean);
  const precios = filtered
    .map((o) => {
      const p = Number(o?.precioAdicional ?? o?.PrecioAdicional ?? 0);
      return p > 0 ? String(p) : "";
    });
  const imagenes = filtered
    .map((o) => o?.imagenUrl ?? o?.ImagenUrl ?? "");
  return {
    grupoId: gid != null && gid !== "" ? gid : null,
    lineas: lineas.length > 0 ? lineas : [""],
    precios: precios.length > 0 ? precios : [""],
    imagenes: imagenes.length > 0 ? imagenes : [""],
    reemplazaPrecioBase: g.reemplazaPrecioBase ?? g.ReemplazaPrecioBase ?? false,
  };
}

function findGrupoById(gruposRaw, grupoId) {
  const grupos = normalizeGruposPayload(gruposRaw);
  return grupos.find((x) => String(x?.id ?? x?.Id) === String(grupoId)) ?? null;
}

export async function syncOpcionesEspecialesBackend(api, productoId, { habilitado, nombres, precios, archivos, grupoIdConocido, reemplazaPrecioBase }) {
  const names = [...new Set(nombres.map((s) => String(s || "").trim()).filter(Boolean))];
  // precios y archivos: array 1:1 con nombres (antes del dedup), los tomamos en orden
  const rawPrices = Array.isArray(precios) ? precios : [];
  const rawArchivos = Array.isArray(archivos) ? archivos : [];

  if (!habilitado) {
    if (grupoIdConocido == null || grupoIdConocido === "") return { ok: true, grupoId: null };
    try {
      await api.deleteProductoOpcionGrupo(productoId, grupoIdConocido);
      return { ok: true, grupoId: null };
    } catch (e) {
      if (e?.status === 404) return { ok: true, grupoId: null };
      if (e?.status === 409) {
        try {
          await api.updateProductoOpcionGrupo(productoId, grupoIdConocido, {
            nombre: OPCIONES_ESPECIALES_GRUPO_NOMBRE,
            activo: false,
          });
          return { ok: true, grupoId: grupoIdConocido };
        } catch (e2) {
          return { ok: false, error: e2?.message || e?.message || "No se pudieron desactivar las opciones." };
        }
      }
      return { ok: false, error: e?.message || "No se pudo quitar el grupo de opciones." };
    }
  }

  if (names.length === 0) {
    return { ok: false, error: "Agrega al menos una opción o desactiva «Opciones especiales»." };
  }

  try {
    let gid = grupoIdConocido;
    const grupoBody = {
      nombre: OPCIONES_ESPECIALES_GRUPO_NOMBRE,
      orden: 0,
      obligatorio: true,
      minSeleccion: 1,
      maxSeleccion: 1,
      reemplazaPrecioBase: Boolean(reemplazaPrecioBase),
      activo: true,
    };

    if (gid == null || gid === "") {
      const created = await api.createProductoOpcionGrupo(productoId, grupoBody);
      gid = created?.id ?? created?.Id;
    } else {
      await api.updateProductoOpcionGrupo(productoId, gid, grupoBody);
    }

    if (gid == null || gid === "") {
      return { ok: false, error: "No se obtuvo el id del grupo de opciones en el servidor." };
    }

    const listado = await api.listProductoOpcionesGrupos(productoId);
    const g = findGrupoById(listado, gid);
    const existing = g ? g.opciones ?? g.Opciones ?? [] : [];

    const existingNormalized = existing.map((o) => ({
      id: o?.id ?? o?.Id,
      nombre: String(o?.nombre ?? o?.Nombre ?? "").trim(),
      nombreLower: String(o?.nombre ?? o?.Nombre ?? "").trim().toLowerCase(),
      orden: Number(o?.orden ?? o?.Orden ?? 0),
      precioAdicional: Number(o?.precioAdicional ?? o?.PrecioAdicional ?? 0),
      activo: o?.activo !== false && o?.Activo !== false,
    }));

    // Construir mapa nombre→precio y nombre→archivo considerando duplicados que se eliminaron con dedup
    // Usamos los nombres originales (con duplicados) para mapear precios y archivos correctamente
    const nombrePrecioMap = new Map();
    const nombreArchivoMap = new Map();
    nombres.forEach((n, i) => {
      const trimmed = String(n || "").trim();
      if (trimmed && !nombrePrecioMap.has(trimmed)) {
        nombrePrecioMap.set(trimmed, Number(rawPrices[i] || 0));
        if (rawArchivos[i]) {
          nombreArchivoMap.set(trimmed, rawArchivos[i]);
        }
      }
    });

    const reusedIds = new Set();
    let currentOrden = 1;

    for (const nombre of names) {
      const precioFinal = nombrePrecioMap.get(nombre) ?? 0;
      const precioAdicional = Number.isFinite(precioFinal) && precioFinal > 0 ? precioFinal : 0;

      // Buscar una coincidencia por nombre en las existentes que no haya sido ya reusada
      const matched = existingNormalized.find(
        (x) => x.nombreLower === nombre.toLowerCase() && !reusedIds.has(x.id)
      );

      let itemId = null;

      if (matched) {
        reusedIds.add(matched.id);
        itemId = matched.id;
        // Actualizar el item existente
        await api.updateProductoOpcionItem(productoId, gid, matched.id, {
          nombre,
          orden: currentOrden++,
          precioAdicional,
          activo: true,
        });
      } else {
        // Crear uno nuevo
        const created = await api.createProductoOpcionItem(productoId, gid, {
          nombre,
          orden: currentOrden++,
          precioAdicional,
          activo: true,
        });
        itemId = created?.id ?? created?.Id;
      }

      const archivo = nombreArchivoMap.get(nombre);
      if (archivo && itemId) {
        try {
          await api.subirImagenProductoOpcionItem(productoId, gid, itemId, archivo);
        } catch (eImg) {
          console.error("Error al subir imagen de opcion:", eImg);
        }
      }
    }

    // Limpiar o desactivar las opciones que ya no se usan
    for (const item of existingNormalized) {
      if (reusedIds.has(item.id)) continue;
      try {
        // Intentar borrarlo
        await api.deleteProductoOpcionItem(productoId, gid, item.id);
      } catch {
        // Si falla (por estar en uso), marcarlo como inactivo
        try {
          await api.updateProductoOpcionItem(productoId, gid, item.id, {
            nombre: item.nombre,
            orden: item.orden,
            precioAdicional: item.precioAdicional,
            activo: false,
          });
        } catch {
          // Ignorar silenciosamente para no romper el flujo
        }
      }
    }

    return { ok: true, grupoId: gid };
  } catch (e) {
    if (e?.status === 404) {
      return { ok: false, skipped: true, error: e?.message || "La API de opciones no está disponible." };
    }
    return { ok: false, error: e?.message || "No se pudieron guardar las opciones especiales." };
  }
}

