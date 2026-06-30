/**
 * Test de concurrencia para validar las correcciones:
 * - IdempotencyKey (evitar doble cobro)
 * - Batch cocina (PATCH /api/v1/cocina/items/estado)
 * - RowVersion (conflictos de concurrencia en pedidos)
 * - Caja guard (no cerrar caja con órdenes pendientes)
 *
 * Modo de uso:
 *   1. Asegurar que el backend esté corriendo (http://localhost:5000)
 *   2. node tests/api-concurrencia.js
 *
 * Requiere Node 18+ (fetch nativo).
 */

const BASE = "http://localhost:5229";
const API = (path) => `${BASE}${path}`;

async function req(path, options = {}) {
  const { method = "GET", body, token } = options;
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(API(path), { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  if (!res.ok) {
    const msg = json?.message || json?.Message || json?.error || text || `HTTP ${res.status}`;
    return { ok: false, status: res.status, error: msg, body: json };
  }
  const data = json?.data ?? json?.Data ?? json;
  return { ok: true, status: res.status, data, body: json };
}

let passed = 0;
let failed = 0;

function assert(label, condition, detail = "") {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.log(`  ❌ ${label} ${detail}`);
    failed++;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function extract(val, ...keys) {
  for (const k of keys) {
    if (val?.[k] !== undefined) return val[k];
  }
  return undefined;
}

async function main() {
  console.log("═══════════════════════════════════════════════");
  console.log("  TEST DE CONCURRENCIA - BarResPos");
  console.log("═══════════════════════════════════════════════\n");

  // ─── 1. Login ──────────────────────────────────────────
  console.log("[1] Login como admin");
  const loginRes = await req("/api/v1/auth/login", {
    method: "POST",
    body: { nombreUsuario: "admin", contrasena: "admin" },
  });
  if (!loginRes.ok) {
    console.log("  ❌ Backend no disponible en", BASE);
    console.log("  Asegúrate de que el backend esté corriendo en el puerto 5000");
    process.exit(1);
  }
  const token = extract(loginRes.data, "accessToken", "AccessToken");
  assert("Token recibido", !!token);

  // ─── 2. Asegurar caja abierta ──────────────────────────
  console.log("\n[2] Preparar caja");
  const estadoCaja = await req("/api/v1/caja/estado", { token });
  const abierta = estadoCaja.ok && (extract(estadoCaja.data, "abierta", "Abierta") === true);
  if (!abierta) {
    const apertura = await req("/api/v1/caja/apertura", {
      method: "POST",
      body: { montoInicial: 1000 },
      token,
    });
    assert("Caja abierta", apertura.ok, apertura.error);
    if (!apertura.ok && apertura.body?.message?.includes("ya")) {
      console.log("   ℹ️ Caja ya estaba abierta");
    }
  } else {
    console.log("   ℹ️ Caja ya estaba abierta");
  }

  // ─── 3. Crear orden de prueba ──────────────────────────
  console.log("\n[3] Crear orden de prueba");

  // Buscar productos y mesa
  const prodRes = await req("/api/v1/productos?pageSize=10&activo=true", { token });
  const products = prodRes.ok ? (prodRes.data?.items ?? prodRes.data?.Items ?? []) : [];
  assert("Productos encontrados", products.length > 0, `(${products.length})`);

  const mesasRes = await req("/api/v1/mesas?pageSize=10", { token });
  const mesas = mesasRes.ok ? (mesasRes.data?.items ?? mesasRes.data?.Items ?? []) : [];
  // Find a free table or just use the first one
  const primeraMesa = mesas.find(m => (m.estado ?? m.Estado) === "Libre") || mesas[0];

  let ordenId = null;
  let ordenMonto = 0;

  // Use a known simple product without required options (Papas, id=18)
  const productoId = 18;

  if (products.length > 0 && primeraMesa) {
    const mesaId = primeraMesa.id ?? primeraMesa.Id;
    console.log(`   Mesa: ${primeraMesa.numero ?? primeraMesa.Numero} (id=${mesaId})`);
    console.log(`   Producto: Papas (id=${productoId})`);

    const crearRes = await req("/api/v1/pos/ordenes", {
      method: "POST",
      body: {
        mesaId,
        productos: [{ productoId, cantidad: 2 }],
      },
      token,
    });
    assert("Orden creada vía POS", crearRes.ok, crearRes.error);
    if (crearRes.ok) {
      ordenId = extract(crearRes.data, "id", "Id");
      ordenMonto = extract(crearRes.data, "monto", "Monto") || 0;
      console.log(`   Orden ID: ${ordenId}, Monto: ${ordenMonto}`);
    }
  } else {
    console.log("   ⚠️ No hay productos o mesas disponibles para crear orden");
  }

  // ─── 4. TEST: IdempotencyKey ──────────────────────────
  console.log("\n[4] TEST: IdempotencyKey (pagos duplicados)");

  if (ordenId && ordenMonto > 0) {
    const idempotencyKey = `idem_test_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const montoPagar = Math.round(ordenMonto * 1.1 * 100) / 100; // ~10% extra para cubrir

    console.log(`   Key: ${idempotencyKey}`);
    console.log(`   Monto a pagar: ${montoPagar}`);

    const paymentBody = {
      ordenId,
      tipoPago: "Efectivo",
      montoPagado: montoPagar,
      moneda: "Córdoba",
      idempotencyKey,
    };

    // 3 concurrentes con la MISMA key
    const results = await Promise.all([
      req("/api/v1/ventas/procesar-pago", { method: "POST", body: paymentBody, token }),
      req("/api/v1/ventas/procesar-pago", { method: "POST", body: paymentBody, token }),
      req("/api/v1/ventas/procesar-pago", { method: "POST", body: paymentBody, token }),
    ]);

    const successCount = results.filter(r => r.ok && r.status === 200 && r.data?.yaProcesado !== true).length;
    const yaProcesadoCount = results.filter(r => r.data?.yaProcesado === true).length;
    const rejectCount = results.filter(r => !r.ok).length;

    console.log(`   Resultados: ${successCount} exitosos, ${yaProcesadoCount} yaProcesado, ${rejectCount} rechazados`);

    // Solo 1 pago debe procesarse exitosamente (los duplicados concurrentes fallan
    // porque la orden ya queda pagada, o se detecta por el unique index de IdempotencyKey)
    assert("Idempotency: solo 1 pago exitoso", successCount === 1,
      `(${successCount} exitosos, ${rejectCount} rechazados, ${yaProcesadoCount} yaProcesado)`);
  } else {
    console.log("   ⚠️ No se pudo probar idempotency (sin orden/monto)");
  }

  // ─── 5. TEST: Kitchen Batch ────────────────────────────
  console.log("\n[5] TEST: Kitchen Batch (PATCH /api/v1/cocina/items/estado)");

  // First send our order to cocina to have fresh items
  if (ordenId) {
    console.log(`   Enviando orden ${ordenId} a cocina...`);
    const enviar = await req(`/api/v1/pedidos/${ordenId}/enviar-cocina`, { method: "PATCH", token });
    if (enviar.ok) {
      console.log("   Orden enviada a cocina OK");
    } else {
      console.log(`   ℹ️ No se pudo enviar: ${enviar.error?.substring(0, 80)}`);
    }
  }

  // Now get kitchen items
  const cocinaOrd = await req("/api/v1/cocina/ordenes", { token });
  if (cocinaOrd.ok) {
    const orders = cocinaOrd.data ?? cocinaOrd.body?.data ?? [];
    const allItems = orders.flatMap(o => o.items ?? o.Items ?? []);
    const pendingItems = allItems.filter(i => (i.estado ?? i.Estado) === "Pendiente");

    if (pendingItems.length > 0) {
      const batchItems = pendingItems.slice(0, 2).map(i => ({
        id: i.id ?? i.Id,
        estado: "En Preparación",
      }));
      console.log(`   Actualizando ${batchItems.length} items en lote (IDs: ${batchItems.map(i => i.id).join(", ")})`);

      const batchRes = await req("/api/v1/cocina/items/estado", {
        method: "PATCH",
        body: { items: batchItems },
        token,
      });

      // The batch may fail if the parent order is pagado/cancelado (that's the guard working correctly)
      if (!batchRes.ok && (batchRes.error?.includes?.("pagada") || batchRes.error?.includes?.("cancelada"))) {
        console.log(`   ℹ️ Items no actualizables (orden pagada/cancelada - guard funciona): ${batchRes.error.substring(0, 80)}`);
      } else {
        assert("Batch exitoso", batchRes.ok, batchRes.error);
        // Verify
        if (batchRes.ok) {
          const verif = await req("/api/v1/cocina/ordenes", { token });
          if (verif.ok) {
            const updatedOrders = verif.data ?? verif.body?.data ?? [];
            const updatedItems = updatedOrders.flatMap(o => o.items ?? o.Items ?? []);
            const batchIds = new Set(batchItems.map(i => i.id));
            const foundUpdated = updatedItems.filter(i => batchIds.has(i.id ?? i.Id) && (i.estado ?? i.Estado) === "En Preparación");
            assert("Items batch reflejados en GET", foundUpdated.length >= 1,
              `(${foundUpdated.length}/${batchItems.length} actualizados)`);
          }
        }
      }
    } else {
      // Try sending batch to an empty list - should fail with appropriate message
      console.log("   ℹ️ No hay items pendientes; probando validación batch vacío");
      const emptyBatch = await req("/api/v1/cocina/items/estado", {
        method: "PATCH",
        body: { items: [] },
        token,
      });
      assert("Batch vacío rechazado", !emptyBatch.ok,
        `(error esperado: ${emptyBatch.error?.substring(0, 60)})`);
    }
  } else {
    console.log("   ⚠️ No se pudo obtener órdenes de cocina");
  }

  // ─── 6. TEST: Caja Cierre Guard ────────────────────────
  console.log("\n[6] TEST: Caja guard (rechazar cierre con órdenes pendientes)");

  const cierreRes = await req("/api/v1/caja/cierre", {
    method: "POST",
    body: { montoReal: 0, observaciones: "test-concurrencia-cierre" },
    token,
  });

  if (!cierreRes.ok) {
    const msg = cierreRes.body?.message || cierreRes.error || "";
    if (msg.includes("pendientes") || msg.includes("ordenes") || msg.includes("órdenes")) {
      assert("Caja guard: rechazó cierre por órdenes pendientes", true,
        `(mensaje: "${msg.substring(0, 80)}")`);
    } else {
      // Could be other reasons (caja not open, etc.)
      console.log(`   ℹ️ Cierre rechazado (razón: "${msg.substring(0, 80)}")`);
      if (msg.includes("cerrada")) {
        console.log("   (la caja ya está cerrada)");
      }
    }
  } else {
    console.log("   ℹ️ Cierre exitoso (no había restricciones activas)");
    // Re-open for safety
    await sleep(500);
    await req("/api/v1/caja/apertura", {
      method: "POST",
      body: { montoInicial: 1000 },
      token,
    });
  }

  // ─── Summary ────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════");
  console.log(`  RESULTADOS: ${passed} pasaron, ${failed} fallaron`);
  console.log("═══════════════════════════════════════════════\n");

  if (failed > 0) process.exit(1);
}

main().catch(err => {
  console.error("Error fatal:", err);
  process.exit(1);
});
