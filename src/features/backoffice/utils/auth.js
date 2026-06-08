export function getUserRoleText(user) {
  if (!user || typeof user !== "object") return "";
  return String(
    user.rol ??
      user.Rol ??
      user.role ??
      user.Role ??
      user.nombreRol ??
      user.NombreRol ??
      user.perfil ??
      user.Perfil ??
      ""
  )
    .trim()
    .toLowerCase();
}

export function isAdminUser(user) {
  const role = getUserRoleText(user);
  return role.includes("admin") || role.includes("administrador");
}

export function isMeseroUser(user) {
  const role = getUserRoleText(user);
  return role.includes("mesero") || role.includes("waiter");
}

export function isCajeroUser(user) {
  const role = getUserRoleText(user);
  return role.includes("cajero") || role.includes("cashier") || role.includes("caja");
}

export function isCocineroUser(user) {
  const role = getUserRoleText(user);
  return (
    role.includes("cocinero") ||
    role.includes("cocina") ||
    role.includes("cook") ||
    role.includes("chef")
  );
}

export function getAllowedViewIds(user) {
  let ids = [];
  if (isAdminUser(user)) {
    ids = [
      "dashboard",
      "orders",
      "tables",
      "delivery",
      "clients",
      "products",
      "providers",
      "kitchen",
      "cashier",
      "users",
      "settings",
      "reports",
    ];
  } else if (isCajeroUser(user)) {
    ids = ["dashboard", "orders", "tables", "delivery", "clients", "cashier"];
  } else if (isCocineroUser(user)) {
    ids = ["kitchen"];
  } else if (isMeseroUser(user)) {
    ids = ["tables", "delivery"];
  } else {
    ids = ["dashboard", "tables", "delivery"];
  }

  if (ids.includes("tables")) {
    ids.push("locations");
  }
  return ids;
}

export function canAccessView(user, viewId) {
  if (viewId === "locations") {
    return getAllowedViewIds(user).includes("tables");
  }
  return getAllowedViewIds(user).includes(viewId);
}
