const STORAGE_KEY = "barrest_delivery_customers";

export function getCachedClients() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => {
      const nameA = String(a.nombre || "").toLowerCase();
      const nameB = String(b.nombre || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  } catch (e) {
    console.error("Error al obtener clientes del cache:", e);
    return [];
  }
}

export function saveCachedClient(client, isNewOrder = false) {
  if (!client || typeof client !== "object") return null;
  const nombre = String(client.nombre || "").trim();
  const telefono = String(client.telefono || "").trim();
  const direccion = String(client.direccion || "").trim();
  const observaciones = String(client.observaciones || "").trim();

  if (!nombre && !telefono) return null;

  const clients = getCachedClients();
  const id = client.id || `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  let idx = -1;
  if (client.id) {
    idx = clients.findIndex((c) => c.id === client.id);
  } else if (telefono) {
    idx = clients.findIndex((c) => c.telefono === telefono);
  } else if (nombre) {
    idx = clients.findIndex((c) => String(c.nombre || "").trim().toLowerCase() === nombre.toLowerCase());
  }

  const existingCount = idx >= 0 ? (clients[idx].pedidosCount || 0) : 0;
  const newCount = isNewOrder 
    ? (existingCount + 1) 
    : (client.pedidosCount !== undefined ? client.pedidosCount : existingCount);

  const updatedClient = {
    id,
    nombre,
    telefono,
    direccion,
    observaciones,
    pedidosCount: newCount,
    updatedAt: new Date().toISOString(),
  };

  if (idx >= 0) {
    clients[idx] = { ...clients[idx], ...updatedClient };
  } else {
    clients.push(updatedClient);
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  return updatedClient;
}

export function deleteCachedClient(id) {
  if (!id) return false;
  const clients = getCachedClients();
  const filtered = clients.filter((c) => c.id !== id);
  if (filtered.length === clients.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}

export function seedClientsFromPastOrders(pastOrders) {
  if (!Array.isArray(pastOrders) || pastOrders.length === 0) return false;

  const clients = getCachedClients();
  
  // Calcular la frecuencia de pedidos por teléfono en el array de pedidos históricos
  const phoneCounts = {};
  pastOrders.forEach((order) => {
    const cust = order.customer ?? order.Customer;
    if (cust) {
      const tel = String(cust.telefono ?? "").trim();
      if (tel) {
        phoneCounts[tel] = (phoneCounts[tel] || 0) + 1;
      }
    }
  });

  const phoneMap = new Map();
  clients.forEach((c) => {
    if (c.telefono) phoneMap.set(c.telefono, c);
  });

  let modified = false;

  // 1. Cosechar nuevos clientes y asignarles su conteo inicial calculado
  pastOrders.forEach((order) => {
    const cust = order.customer ?? order.Customer;
    if (cust) {
      const tel = String(cust.telefono ?? "").trim();
      const nom = String(cust.nombre ?? "").trim();
      const dir = String(cust.direccion ?? cust.clienteDireccion ?? "").trim();
      const obs = String(cust.observaciones ?? order.observaciones ?? "").trim();

      if (!nom) return;

      if (tel) {
        const calculatedCount = phoneCounts[tel] || 1;
        if (!phoneMap.has(tel)) {
          const newClient = {
            id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            nombre: nom,
            telefono: tel,
            direccion: dir,
            observaciones: obs,
            pedidosCount: calculatedCount,
            createdAt: new Date().toISOString(),
          };
          phoneMap.set(tel, newClient);
          clients.push(newClient);
          modified = true;
        } else {
          // Sincronizar conteo al valor real calculado de la lista actual
          const existing = phoneMap.get(tel);
          if (existing.pedidosCount !== calculatedCount) {
            existing.pedidosCount = calculatedCount;
            modified = true;
          }
        }
      }
    }
  });

  // 2. Sincronizar conteo para clientes que aparecen en la lista actual
  clients.forEach((c) => {
    if (c.telefono && phoneCounts[c.telefono] !== undefined) {
      const calc = phoneCounts[c.telefono];
      if (c.pedidosCount !== calc) {
        c.pedidosCount = calc;
        modified = true;
      }
    } else if (c.pedidosCount === undefined) {
      c.pedidosCount = 0;
      modified = true;
    }
  });

  if (modified) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clients));
  }
  return modified;
}
