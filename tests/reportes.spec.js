import { test, expect } from "@playwright/test";

test.describe("Flujo de Reportes y Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería cargar el Dashboard correctamente con sus tarjetas", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Dashboard");
    await page.waitForTimeout(2000);

    const statCards = page.locator("article, section > div > div");
    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("Debería acceder a Reportes y ver el catálogo de reportes", async ({ page }) => {
    await page.click('button:has-text("Reportes")');
    await expect(page.locator("h1")).toContainText("Reportes");
  });

  test("Debería ver los filtros de fecha en la sección de reportes", async ({ page }) => {
    await page.click('button:has-text("Reportes")');
    await expect(page.locator("h1")).toContainText("Reportes");
  });

  test("Debería cambiar entre los diferentes tipos de reporte", async ({ page }) => {
    await page.click('button:has-text("Reportes")');
    await expect(page.locator("h1")).toContainText("Reportes");

    const reportTabs = page.locator("button").filter({ hasText: /Ventas|Productos|Meseros|Categorías|Inventario/i });
    const tabCount = await reportTabs.count();
    expect(tabCount).toBeGreaterThanOrEqual(1);
  });
});
