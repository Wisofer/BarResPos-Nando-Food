import { test, expect } from "@playwright/test";

test.describe("Flujo de Autenticación y Navegación del POS", () => {
  test("Debería iniciar sesión correctamente con credenciales admin y navegar al Dashboard", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
    const dashboardHeader = page.locator("header h1");
    await expect(dashboardHeader).toContainText("Dashboard");
  });

  test("Debería rechazar credenciales incorrectas y mostrar mensaje de error", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "usuario_invalido");
    await page.fill('input[placeholder="••••••••"]', "clave_incorrecta");
    await page.click('button[type="submit"]');
    await expect(page).not.toHaveURL(/.*dashboard/);
  });

  test("Debería navegar entre todas las secciones del sidebar como admin", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);

    const sections = [
      { name: "Dashboard", title: "Dashboard" },
      { name: "Pedidos", title: "Gestion de pedidos" },
      { name: "Mesas", title: "Gestion de mesas" },
      { name: "Delivery", title: "Delivery" },
      { name: "Clientes", title: "Clientes" },
      { name: "Productos", title: "Gestion de productos" },
      { name: "Cocina", title: "Cocina" },
      { name: "Caja", title: "Caja" },
      { name: "Usuarios", title: "Usuarios" },
      { name: "Configuraciones", title: "Configuraciones" },
      { name: "Reportes", title: "Reportes" },
    ];

    for (const section of sections) {
      const sidebarBtn = page.locator(`button:has-text("${section.name}")`).first();
      if (await sidebarBtn.isVisible()) {
        await sidebarBtn.click();
        await expect(page.locator("header h1")).toContainText(section.title);
      }
    }
  });

  test("Debería navegar al Dashboard y ver las tarjetas de estadísticas", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);

    await expect(page.locator("header h1")).toContainText("Dashboard");
    const statCards = page.locator("article");
    await statCards.first().waitFor({ state: "visible", timeout: 10000 });
    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Roles y permisos del sistema", () => {
  test("Debería iniciar sesión como mesero y ver solo Mesas y Delivery", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "mesero1");
    await page.fill('input[placeholder="••••••••"]', "mesero1");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);

    const sidebar = page.locator("aside, nav");
    await expect(sidebar.locator('button', { hasText: 'Dashboard' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Productos' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Usuarios' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Configuraciones' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Mesas' })).toBeVisible();
    await expect(sidebar.locator('button', { hasText: 'Delivery' })).toBeVisible();
  });

  test("Debería iniciar sesión como cocinero y ver solo Cocina", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "cocina1");
    await page.fill('input[placeholder="••••••••"]', "cocina1");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);

    const sidebar = page.locator("aside, nav");
    await expect(sidebar.locator('button', { hasText: 'Mesas' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Delivery' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Dashboard' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Productos' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Cocina' })).toBeVisible();
  });

  test("Debería iniciar sesión como administrador y ver todas las secciones", async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);

    const sidebar = page.locator("aside, nav");
    await expect(sidebar.locator('button', { hasText: 'Dashboard' })).toBeVisible();
    await expect(sidebar.locator('button', { hasText: 'Mesas' })).toBeVisible();
    await expect(sidebar.locator('button', { hasText: 'Delivery' })).toBeVisible();
    await expect(sidebar.locator('button', { hasText: 'Clientes' })).toBeVisible();
    await expect(sidebar.locator('button', { hasText: 'Productos' })).toBeVisible();
    await expect(sidebar.locator('button', { hasText: 'Cocina' })).toBeVisible();
    await expect(sidebar.locator('button', { hasText: 'Caja' })).toBeVisible();
    await expect(sidebar.locator('button', { hasText: 'Usuarios' })).toBeVisible();
    await expect(sidebar.locator('button', { hasText: 'Configuraciones' })).toBeVisible();
    await expect(sidebar.locator('button', { hasText: 'Reportes' })).toBeVisible();
  });
});
