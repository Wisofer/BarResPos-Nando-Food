#!/usr/bin/env node
/**
 * Seed script para BarRestPOS
 * Puebla la base de datos con datos de demostración realistas.
 *
 * Uso:
 *   node scripts/seed-demo.js                          # Poblar datos
 *   node scripts/seed-demo.js --reset                  # Limpiar todo
 *   node scripts/seed-demo.js --base=http://localhost:5000  # URL personalizada
 *
 * Requisitos:
 *   - Backend .NET corriendo (puerto 5000 por defecto)
 *   - Usuario admin/admin (se crea automáticamente al iniciar)
 *   - Node.js 18+
 */

import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const BASE_URL = (process.argv.find(a => a.startsWith('--base=')) || '').replace('--base=', '') || 'http://localhost:5000';
const API = (path) => `${BASE_URL}${path}`;
const RESET_MODE = process.argv.includes('--reset');

let TOKEN = null;
let createdIds = { productos: [], clientes: [], proveedores: [], usuarios: [], pedidos: [], pagos: [] };

// ── Helpers ──────────────────────────────────────────────────────────────────

async function api(method, path, body = undefined) {
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(API(path), opts);
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = null; }
  if (!res.ok) {
    const msg = json?.message || json?.Message || json?.error || json?.Error || text || `HTTP ${res.status}`;
    throw new Error(`${method} ${path} → ${res.status}: ${msg}`);
  }
  if (res.status === 204) return null;
  const unwrapped = json?.data ?? json?.Data ?? json;
  return unwrapped;
}

function log(emoji, msg) {
  const date = new Date().toLocaleTimeString('es-NI');
  console.log(`  ${emoji} [${date}] ${msg}`);
}

function step(n, total, label) {
  console.log(`\n━━━ [${n}/${total}] ${label} ━━━`);
}

// ── Reset Mode ───────────────────────────────────────────────────────────────

async function resetAll() {
  console.log('\n🧹 MODO RESET — Limpiando datos de demostración...\n');
  
  await api('POST', '/api/v1/auth/login', { nombreUsuario: 'admin', contrasena: 'admin' }).then(r => {
    TOKEN = r?.accessToken || r?.AccessToken || r?.token || r?.Token;
    if (!TOKEN) throw new Error('No se obtuvo token en reset');
  });

  // 1. Pagar/cancelar órdenes abiertas
  try {
    const pedidos = await api('GET', '/api/v1/pedidos?pageSize=100');
    const items = pedidos?.items || pedidos?.Items || pedidos || [];
    for (const p of items) {
      const estado = p.estado || p.Estado;
      if (estado && !['Cancelado', 'Pagado'].includes(estado)) {
        try {
          await api('POST', `/api/v1/pedidos/${p.id || p.Id}/cancelar`, { codigo: '0000' });
          log('🗑️', `Pedido #${p.numero || p.Numero || p.id} cancelado`);
        } catch { /* ignore */ }
      }
    }
  } catch { /* no pedidos */ }

  // 2. Cerrar caja si está abierta
  try {
    const estado = await api('GET', '/api/v1/caja/estado');
    if (estado?.abierta || estado?.Abierta || estado?.estado === 'Abierto') {
      await api('POST', '/api/v1/caja/cierre', { montoReal: 0, observaciones: 'Reset demo' });
      log('🗑️', 'Caja cerrada');
    }
  } catch { /* no caja abierta */ }

  // 3. Eliminar pagos
  // No hay endpoint directo, se limpian junto con los pedidos

  // 4. Eliminar delivery pedidos
  try {
    const dels = await api('GET', '/api/v1/delivery/pedidos?pageSize=100');
    const dItems = dels?.items || dels?.Items || dels || [];
    for (const d of dItems) {
      try {
        await api('POST', `/api/v1/delivery/pedidos/${d.id || d.Id}/cancelar`, { codigo: '0000' });
        log('🗑️', `Delivery #${d.codigo || d.id} cancelado`);
      } catch { /* ignore */ }
    }
  } catch { /* no delivery */ }

  // 5. Eliminar productos (solo los que tienen controlarStock=false o stock=0 para evitar FK)
  try {
    const prods = await api('GET', '/api/v1/productos?pageSize=200');
    const pItems = prods?.items || prods?.Items || prods || [];
    for (const p of pItems) {
      try {
        await api('DELETE', `/api/v1/productos/${p.id || p.Id}`);
        log('🗑️', `Producto #${p.id || p.Id} eliminado`);
      } catch { /* ignore FK constraints */ }
    }
  } catch { /* no productos */ }

  // 6. Eliminar clientes (DB directo)
  try {
    const db = new DatabaseSync(DB_PATH);
    db.prepare('DELETE FROM Clientes').run();
    db.close();
    log('🗑️', 'Clientes eliminados (DB directo)');
  } catch { /* no clientes */ }

  // 7. Eliminar proveedores
  try {
    const provs = await api('GET', '/api/v1/catalogos/proveedores');
    const prvItems = provs?.items || provs?.Items || provs || [];
    for (const p of prvItems) {
      try {
        await api('DELETE', `/api/v1/catalogos/proveedores/${p.id || p.Id}`);
        log('🗑️', `Proveedor #${p.id || p.Id} eliminado`);
      } catch { /* ignore */ }
    }
  } catch { /* no proveedores */ }

  // 8. Eliminar usuarios extra (no el admin)
  try {
    const users = await api('GET', '/api/v1/usuarios?pageSize=200');
    const uItems = users?.items || users?.Items || users || [];
    for (const u of uItems) {
      const name = (u.nombreUsuario || u.NombreUsuario || '').toLowerCase();
      if (name !== 'admin') {
        try {
          await api('DELETE', `/api/v1/usuarios/${u.id || u.Id}`);
          log('🗑️', `Usuario "${name}" eliminado`);
        } catch { /* ignore */ }
      }
    }
  } catch { /* no usuarios extra */ }

  // 9. Limpiar movimientos de inventario
  try {
    const movs = await api('GET', '/api/v1/productos/movimientos?pageSize=200');
    const mItems = movs?.items || movs?.Items || movs || [];
    for (const m of mItems) {
      try {
        await api('DELETE', `/api/v1/productos/movimientos/${m.id || m.Id}`);
      } catch { /* ignore */ }
    }
    log('🗑️', 'Movimientos de inventario limpiados');
  } catch { /* no movimientos */ }

  log('✨', 'Reset completado. Los datos de estructura (categorías, mesas, ubicaciones) se conservan.');
  process.exit(0);
}

// ── Login ────────────────────────────────────────────────────────────────────

async function doLogin() {
  step(1, 10, 'Iniciando sesión como admin');
  const data = await api('POST', '/api/v1/auth/login', { nombreUsuario: 'admin', contrasena: 'admin' });
  TOKEN = data?.accessToken || data?.AccessToken || data?.token || data?.Token;
  if (!TOKEN) throw new Error('No se obtuvo token de acceso');
  log('🔑', 'Sesión iniciada correctamente');
}

// ── Leer datos existentes ───────────────────────────────────────────────────

async function loadExistingData() {
  step(2, 10, 'Cargando datos existentes del sistema');

  const [ catsRaw, mesasRaw, ubicRaw, configRaw ] = await Promise.all([
    api('GET', '/api/v1/catalogos/categorias-producto').catch(() => ({ items: [] })),
    api('GET', '/api/v1/mesas?pageSize=50').catch(() => ({ items: [] })),
    api('GET', '/api/v1/catalogos/ubicaciones').catch(() => ({ items: [] })),
    api('GET', '/api/v1/configuraciones').catch(() => []),
  ]);

  const cats = (catsRaw?.items || catsRaw?.Items || catsRaw || []);
  const mesas = (mesasRaw?.items || mesasRaw?.Items || mesasRaw || []);
  const _ubicaciones = (ubicRaw?.items || ubicRaw?.Items || ubicRaw || []);
  const configs = Array.isArray(configRaw) ? configRaw : (configRaw?.items || configRaw?.Items || []);

  const catMap = {};
  for (const c of cats) {
    const name = c.nombre || c.Nombre;
    const id = c.id || c.Id;
    const reqCocina = c.requiereCocina ?? c.RequiereCocina ?? true;
    const color = c.colorHex || c.ColorHex || '#cccccc';
    catMap[name] = { id, requiereCocina: reqCocina, color };
  }

  const mesaList = mesas.map(m => ({
    id: m.id || m.Id,
    numero: m.numero || m.Numero,
    estado: m.estado || m.Estado || 'Libre',
  }));

  log('📦', `${Object.keys(catMap).length} categorías encontradas`);
  log('🪑', `${mesaList.length} mesas encontradas`);

  return { catMap, mesaList, configs };
}

// ── Productos ────────────────────────────────────────────────────────────────

const PRODUCTOS = [
  // Entradas
  { nombre: 'Nacos con Queso', desc: 'Nachos crujientes con queso cheddar, frijoles y pico de gallo', precio: 120, compra: 45, cat: 'Entradas', stock: 50, controlStock: true, esPreparado: true },
  { nombre: 'Alitas BBQ (6 pz)', desc: 'Alitas de pollo bañadas en salsa BBQ ahumada', precio: 180, compra: 75, cat: 'Entradas', stock: 40, controlStock: true, esPreparado: true },
  { nombre: 'Papas Fritas con Queso', desc: 'Papas fritas crujientes con queso derretido y toppings', precio: 90, compra: 30, cat: 'Entradas', stock: 60, controlStock: true, esPreparado: true },
  // Platos Fuertes
  { nombre: "Nando's Burger Clásica", desc: 'Carne 200g, queso suizo, lechuga, tomate y nuestra salsa especial', precio: 220, compra: 95, cat: 'Platos Fuertes', stock: 0, controlStock: false, esPreparado: true },
  { nombre: 'Costillas BBQ', desc: 'Costillas de cerdo glaseadas con miel y BBQ, servidas con papas', precio: 350, compra: 150, cat: 'Platos Fuertes', stock: 0, controlStock: false, esPreparado: true },
  { nombre: 'Fajitas de Pollo', desc: 'Tiras de pollo salteadas con pimientos y cebolla, acompañadas de tortillas', precio: 280, compra: 120, cat: 'Platos Fuertes', stock: 0, controlStock: false, esPreparado: true },
  // Bebidas Frías
  { nombre: 'Coca-Cola 500ml', desc: 'Gaseosa Coca-Cola personal 500ml', precio: 35, compra: 18, cat: 'Bebidas Frías', stock: 200, controlStock: true, esPreparado: false },
  { nombre: 'Naranjada Natural', desc: 'Jugo de naranja natural recién exprimido', precio: 45, compra: 15, cat: 'Bebidas Frías', stock: 80, controlStock: true, esPreparado: false },
  { nombre: 'Agua Emb. 500ml', desc: 'Agua purificada embotellada 500ml', precio: 25, compra: 10, cat: 'Bebidas Frías', stock: 200, controlStock: true, esPreparado: false },
  // Bebidas Calientes
  { nombre: 'Café Americano', desc: 'Café americano recién preparado', precio: 40, compra: 12, cat: 'Bebidas Calientes', stock: 100, controlStock: true, esPreparado: false },
  { nombre: 'Capuchino', desc: 'Capuchino espresso con leche vaporizada y espuma', precio: 60, compra: 20, cat: 'Bebidas Calientes', stock: 100, controlStock: true, esPreparado: false },
  { nombre: 'Té Helado', desc: 'Té negro helado con limón', precio: 35, compra: 10, cat: 'Bebidas Calientes', stock: 60, controlStock: true, esPreparado: false },
  // Cócteles
  { nombre: 'Mojito Clásico', desc: 'Mojito con ron, hierbabuena, lima, azúcar y soda', precio: 150, compra: 50, cat: 'Cócteles', stock: 0, controlStock: false, esPreparado: false },
  { nombre: 'Margarita', desc: 'Margarita con tequila, triple sec, limón y sal en el borde', precio: 180, compra: 65, cat: 'Cócteles', stock: 0, controlStock: false, esPreparado: false },
  { nombre: 'Piña Colada', desc: 'Piña Colada con ron, crema de coco y piña', precio: 160, compra: 55, cat: 'Cócteles', stock: 0, controlStock: false, esPreparado: false },
  // Postres
  { nombre: 'Tres Leches', desc: 'Pastel de tres leches con vainilla y crema batida', precio: 100, compra: 35, cat: 'Postres', stock: 0, controlStock: false, esPreparado: true },
  { nombre: 'Flan de la Casa', desc: 'Flan casero con caramelo y vainilla', precio: 80, compra: 25, cat: 'Postres', stock: 0, controlStock: false, esPreparado: true },
  { nombre: 'Brownie con Helado', desc: 'Brownie de chocolate caliente con helado de vainilla', precio: 120, compra: 40, cat: 'Postres', stock: 0, controlStock: false, esPreparado: true },
];

async function createProductos(catMap) {
  step(3, 10, 'Creando productos del menú');
  const results = [];
  for (const p of PRODUCTOS) {
    const cat = catMap[p.cat];
    if (!cat) {
      log('⚠️', `Categoría "${p.cat}" no encontrada, saltando producto "${p.nombre}"`);
      continue;
    }
    const body = {
      Nombre: p.nombre,
      Descripcion: p.desc,
      Precio: p.precio,
      PrecioCompra: p.compra,
      Categoria: p.cat,
      CategoriaProductoId: cat.id,
      Stock: p.stock,
      StockMinimo: Math.max(3, Math.floor(p.stock * 0.1)),
      ControlarStock: p.controlStock,
      EsPreparado: p.esPreparado,
      Destacado: true,
      Activo: true,
    };
    try {
      const data = await api('POST', '/api/v1/productos', body);
      const id = data?.id || data?.Id;
      if (id) {
        results.push({ id, nombre: p.nombre });
        createdIds.productos.push(id);
      }
    } catch (e) {
      log('⚠️', `Error creando "${p.nombre}": ${e.message}`);
    }
  }
  log('🍽️', `${results.length} productos creados exitosamente`);
  return results;
}

// ── Clientes (directo a SQLite — no hay API controller aún) ────────────────

const DB_PATH = path.join(process.env.APPDATA || process.cwd(), 'BarRestPOS', 'barrestpos.db');

const CLIENTES = [
  { nombre: 'Carlos López García', telefono: '505 8123 4567', email: 'carlos.lopez@email.com', codigo: 'CLI-001' },
  { nombre: 'María José Martínez', telefono: '505 8765 4321', email: 'maria.martinez@email.com', codigo: 'CLI-002' },
  { nombre: 'Pedro Antonio Ruiz', telefono: '505 8888 1234', email: 'pedro.ruiz@email.com', codigo: 'CLI-003' },
  { nombre: 'Ana Cecilia Morales', telefono: '505 7777 5678', email: 'ana.morales@email.com', codigo: 'CLI-004' },
  { nombre: 'Roberto Carlos Hernández', telefono: '505 6666 9012', email: 'roberto.hernandez@email.com', codigo: 'CLI-005' },
  { nombre: 'Laura Patricia Sequeira', telefono: '505 5555 3456', email: 'laura.sequeira@email.com', codigo: 'CLI-006' },
  { nombre: 'Francisco Javier Tórrez', telefono: '505 4444 7890', email: 'francisco.torrez@email.com', codigo: 'CLI-007' },
  { nombre: 'Dora María Blandón', telefono: '505 3333 2345', email: 'dora.blandon@email.com', codigo: 'CLI-008' },
];

function getClienteNextId() {
  try {
    const db = new DatabaseSync(DB_PATH);
    const row = db.prepare('SELECT COALESCE(MAX(Id),0) + 1 AS next FROM Clientes').get();
    db.close();
    return row.next;
  } catch { return 1; }
}

function insertCliente(cliente) {
  const db = new DatabaseSync(DB_PATH);
  const id = getClienteNextId();
  const now = new Date().toISOString();
  db.prepare(
    `INSERT INTO Clientes (Id, Codigo, Nombre, Telefono, Email, Activo, FechaCreacion, TotalFacturas)
     VALUES (?, ?, ?, ?, ?, 1, ?, 0)`
  ).run(id, cliente.codigo, cliente.nombre, cliente.telefono, cliente.email, now);
  db.close();
  return id;
}

// eslint-disable-next-line no-unused-vars
function deleteClientes() {
  try {
    const db = new DatabaseSync(DB_PATH);
    db.prepare('DELETE FROM Clientes').run();
    db.close();
  } catch { /* empty */ }
}

async function createClientes() {
  step(4, 10, 'Creando clientes');
  const results = [];
  for (const c of CLIENTES) {
    try {
      const id = insertCliente(c);
      results.push({ id, nombre: c.nombre });
      createdIds.clientes.push(id);
    } catch (e) {
      log('⚠️', `Error creando cliente "${c.nombre}": ${e.message}`);
    }
  }
  log('👥', `${results.length} clientes creados exitosamente (DB directo)`);
  return results;
}

// ── Proveedores ──────────────────────────────────────────────────────────────

const PROVEEDORES = [
  { nombre: 'Distribuidora San Martín', telefono: '505 2255 1000', email: 'ventas@sanmartin.com', contacto: 'Roberto Sánchez' },
  { nombre: 'Cervecería Nacional', telefono: '505 2255 2000', email: 'pedidos@cervecerianacional.com', contacto: 'Ana Flores' },
  { nombre: 'Carnes y Embutidos Centroamérica', telefono: '505 2255 3000', email: 'ventas@carnesca.com', contacto: 'Pedro Rivas' },
  { nombre: 'La Casita del Pan', telefono: '505 2255 4000', email: 'info@casitapan.com', contacto: 'María Solórzano' },
];

async function createProveedores() {
  step(5, 10, 'Creando proveedores');
  const results = [];
  for (const p of PROVEEDORES) {
    const body = {
      Nombre: p.nombre,
      Telefono: p.telefono,
      Email: p.email,
      Contacto: p.contacto,
      Activo: true,
    };
    try {
      const data = await api('POST', '/api/v1/catalogos/proveedores', body);
      const id = data?.id || data?.Id;
      if (id) {
        results.push({ id, nombre: p.nombre });
        createdIds.proveedores.push(id);
      }
    } catch (e) {
      log('⚠️', `Error creando proveedor "${p.nombre}": ${e.message}`);
    }
  }
  log('🚚', `${results.length} proveedores creados exitosamente`);
  return results;
}

// ── Usuarios adicionales ────────────────────────────────────────────────────

const USUARIOS = [
  { usuario: 'mesero1', nombre: 'Juan Pérez', rol: 'Mesero', pass: 'mesero1' },
  { usuario: 'cajero1', nombre: 'Carmen Rivas', rol: 'Cajero', pass: 'cajero1' },
  { usuario: 'cocina1', nombre: 'Don José', rol: 'Cocinero', pass: 'cocina1' },
];

async function createUsuarios() {
  step(6, 10, 'Creando usuarios adicionales');
  const results = [];
  for (const u of USUARIOS) {
    const body = {
      NombreUsuario: u.usuario,
      NombreCompleto: u.nombre,
      Contrasena: u.pass,
      Rol: u.rol,
      Activo: true,
    };
    try {
      const data = await api('POST', '/api/v1/usuarios', body);
      const id = data?.id || data?.Id;
      if (id) {
        results.push({ id, nombre: u.usuario });
        createdIds.usuarios.push(id);
      }
    } catch (e) {
      log('⚠️', `Error creando usuario "${u.usuario}": ${e.message}`);
    }
  }
  log('👤', `${results.length} usuarios creados exitosamente`);
  return results;
}

// ── Stock inicial ────────────────────────────────────────────────────────────

async function createStockInicial() {
  step(7, 10, 'Registrando entradas de stock inicial');
  let count = 0;
  for (const pid of createdIds.productos) {
    try {
      await api('POST', '/api/v1/productos/entrada-stock', {
        ProductoId: pid,
        Cantidad: 100,
        CostoUnitario: 10,
        Observaciones: 'Stock inicial de demostración',
      });
      count++;
    } catch {
      // producto sin control de stock o ya tiene movimientos
    }
  }
  log('📦', `${count} entradas de stock registradas`);
}

// ── Apertura de Caja ─────────────────────────────────────────────────────────

async function abrirCaja() {
  step(8, 10, 'Abriendo caja del día');
  try {
    const estado = await api('GET', '/api/v1/caja/estado');
    if (estado?.abierta || estado?.Abierta || estado?.estado === 'Abierto') {
      log('ℹ️', 'La caja ya está abierta');
      return;
    }
  } catch { /* no hay caja */ }
  
  await api('POST', '/api/v1/caja/apertura', { MontoInicial: 1000 });
  log('💰', 'Caja abierta con C$1,000.00');
}

// ── Pedidos en mesas ─────────────────────────────────────────────────────────

const PEDIDOS_MESA = [
  {
    mesaNumero: 'Mesa 1',
    productos: [
      { nombre: "Nando's Burger Clásica", cant: 2 },
      { nombre: 'Coca-Cola 500ml', cant: 2 },
    ],
    enviarCocina: true,
  },
  {
    mesaNumero: 'Mesa 2',
    productos: [
      { nombre: 'Costillas BBQ', cant: 1 },
      { nombre: 'Naranjada Natural', cant: 1 },
      { nombre: 'Tres Leches', cant: 1 },
    ],
    enviarCocina: true,
  },
  {
    mesaNumero: 'Mesa 3',
    productos: [
      { nombre: 'Alitas BBQ (6 pz)', cant: 1 },
      { nombre: 'Mojito Clásico', cant: 2 },
      { nombre: 'Papas Fritas con Queso', cant: 1 },
    ],
    enviarCocina: true,
  },
  {
    mesaNumero: 'Terraza 1',
    productos: [
      { nombre: 'Fajitas de Pollo', cant: 1 },
      { nombre: 'Capuchino', cant: 1 },
      { nombre: 'Flan de la Casa', cant: 1 },
    ],
    enviarCocina: false,
  },
];

// eslint-disable-next-line no-unused-vars
async function crearPedidosMesa(productosCreados, mesasDisponibles, _clientesCreados) {
  step(9, 10, 'Creando pedidos en mesas');

  const prodMap = {};
  for (const p of productosCreados) prodMap[p.nombre] = p.id;

  const mesaMap = {};
  for (const m of mesasDisponibles) mesaMap[m.numero] = m.id;

  const mesaPedidos = [];

  for (const ped of PEDIDOS_MESA) {
    const mesaId = mesaMap[ped.mesaNumero];
    if (!mesaId) {
      log('⚠️', `Mesa "${ped.mesaNumero}" no encontrada, saltando pedido`);
      continue;
    }

    const items = [];
    for (const prod of ped.productos) {
      const prodId = prodMap[prod.nombre];
      if (!prodId) {
        log('⚠️', `Producto "${prod.nombre}" no encontrado, saltando línea`);
        continue;
      }
      items.push({ ProductoId: prodId, Cantidad: prod.cant });
    }

    if (items.length === 0) {
      log('⚠️', `No hay productos válidos para mesa ${ped.mesaNumero}`);
      continue;
    }

    try {
      const data = await api('POST', '/api/v1/pos/ordenes', {
        MesaId: mesaId,
        Productos: items,
      });
      const ordenId = data?.id || data?.Id;
      if (ordenId) {
        createdIds.pedidos.push(ordenId);
        mesaPedidos.push({ ordenId, mesaNumero: ped.mesaNumero, enviarCocina: ped.enviarCocina });
        log('📋', `Pedido creado en ${ped.mesaNumero} (Orden #${ordenId})`);
      }
    } catch (e) {
      log('⚠️', `Error creando pedido en ${ped.mesaNumero}: ${e.message}`);
    }
  }

  // Enviar a cocina los que requieren
  for (const p of mesaPedidos) {
    if (!p.enviarCocina) continue;
    try {
      await api('PATCH', `/api/v1/pedidos/${p.ordenId}/enviar-cocina`, {});
      log('👨‍🍳', `Pedido de ${p.mesaNumero} enviado a cocina`);
    } catch (e) {
      log('⚠️', `Error enviando a cocina pedido ${p.ordenId}: ${e.message}`);
    }
  }

  log('🍽️', `${mesaPedidos.length} pedidos en mesas creados`);
  return mesaPedidos;
}

// ── Pedidos Delivery ─────────────────────────────────────────────────────────

const PEDIDOS_DELIVERY = [
  {
    clienteNombre: 'Roberto Carlos Hernández',
    telefono: '505 6666 9012',
    direccion: 'Del semáforo de Villa Progreso 2c al este, Managua',
    productos: [
      { nombre: "Nando's Burger Clásica", cant: 2 },
      { nombre: 'Papas Fritas con Queso', cant: 1 },
      { nombre: 'Coca-Cola 500ml', cant: 2 },
    ],
  },
  {
    clienteNombre: 'Laura Patricia Sequeira',
    telefono: '505 5555 3456',
    direccion: 'Costado oeste de la Rotonda, 1c al norte, León',
    productos: [
      { nombre: 'Costillas BBQ', cant: 1 },
      { nombre: 'Naranjada Natural', cant: 1 },
      { nombre: 'Brownie con Helado', cant: 1 },
    ],
  },
];

async function crearPedidosDelivery(productosCreados, clientesCreados) {
  const prodMap = {};
  for (const p of productosCreados) prodMap[p.nombre] = p.id;

  const nomMap = {};
  for (const c of clientesCreados) nomMap[c.nombre] = c.id;

  for (const ped of PEDIDOS_DELIVERY) {
    const items = [];
    for (const prod of ped.productos) {
      const prodId = prodMap[prod.nombre];
      if (!prodId) {
        log('⚠️', `Producto "${prod.nombre}" no encontrado para delivery`);
        continue;
      }
      items.push({ ServicioId: prodId, Cantidad: prod.cant });
    }
    if (items.length === 0) continue;

    try {
      const data = await api('POST', '/api/v1/delivery/pedidos', {
        ClienteNombre: ped.clienteNombre,
        ClienteTelefono: ped.telefono,
        ClienteDireccion: ped.direccion,
        Items: items,
      });
      const id = data?.id || data?.Id;
      if (id) {
        createdIds.pedidos.push(id);
        log('🛵', `Delivery creado para ${ped.clienteNombre}`);
      }
    } catch (e) {
      log('⚠️', `Error creando delivery: ${e.message}`);
    }
  }
}

// ── Pagos ────────────────────────────────────────────────────────────────────

async function procesarPagos(mesaPedidos, productosCreados) {
  // Pagar solo los que NO se enviaron a cocina (Terraza 1)
  const pagar = mesaPedidos.filter(p => !p.enviarCocina);
  if (pagar.length === 0) return;

  const prodMap = {};
  for (const p of productosCreados) prodMap[p.nombre] = p.id;

  for (const p of pagar) {
    try {
      const data = await api('POST', '/api/v1/ventas/procesar-pago', {
        OrdenId: p.ordenId,
        TipoPago: 'Efectivo',
        MontoPagado: 1000,
        Moneda: 'C$',
      });
      const pagoId = data?.id || data?.Id;
      if (pagoId) {
        createdIds.pagos.push(pagoId);
        log('💵', `Pago procesado para ${p.mesaNumero} — Vuelto: C$${(data?.vuelto || data?.Vuelto || 0).toFixed(2)}`);
      }
    } catch (e) {
      log('⚠️', `Error procesando pago para ${p.mesaNumero}: ${e.message}`);
    }
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║     🌮  BarRestPOS — Seed Demo  🌮       ║');
  console.log('╚══════════════════════════════════════════╝');
  console.log(`   API Base: ${BASE_URL}`);
  console.log(`   Modo:     ${RESET_MODE ? '🧹 RESET' : '🌱 SEMBRAR DATOS'}`);
  console.log('');

  if (RESET_MODE) {
    await resetAll();
    return;
  }

  try {
    // 1. Login
    await doLogin();

    // 2. Cargar datos existentes
    const { catMap, mesaList } = await loadExistingData();

    if (Object.keys(catMap).length === 0) {
      log('⚠️', 'No se encontraron categorías. Asegúrate de que el backend haya inicializado los datos.');
      process.exit(1);
    }

    // 3. Productos
    const prods = await createProductos(catMap);

    // 4. Clientes
    const clients = await createClientes();

    // 5. Proveedores
    await createProveedores();

    // 6. Usuarios
    await createUsuarios();

    // 7. Stock inicial
    await createStockInicial();

    // 8. Abrir caja
    await abrirCaja();

    // 9. Pedidos en mesas + delivery
    const mesaPedidos = await crearPedidosMesa(prods, mesaList, clients);
    await crearPedidosDelivery(prods, clients);

    // 10. Pagos
    await procesarPagos(mesaPedidos, prods);

    // ── Resumen Final ──
    console.log('\n━━━ ✅ RESUMEN DE LA DEMO ─━━');
    console.log(`   🍽️  ${prods.length} productos creados`);
    console.log(`   👥  ${clients.length} clientes creados`);
    console.log(`   🚚  ${createdIds.proveedores.length} proveedores creados`);
    console.log(`   👤  ${createdIds.usuarios.length} usuarios adicionales`);
    console.log(`   📋  ${createdIds.pedidos.length} pedidos creados`);
    console.log(`   💵  ${createdIds.pagos.length} pagos procesados`);
    console.log('');
    console.log('   🔑 Credenciales de prueba:');
    console.log('      admin   / admin     (Administrador)');
    console.log('      mesero1 / mesero1   (Normal/Mesero)');
    console.log('      cajero1 / cajero1   (Caja)');
    console.log('      cocina1 / cocina1   (Normal/Cocina)');
    console.log('');
    console.log('   📌 Para limpiar los datos: node scripts/seed-demo.js --reset');
    console.log('');

  } catch (e) {
    console.error(`\n❌ Error: ${e.message}`);
    process.exit(1);
  }
}

main();
