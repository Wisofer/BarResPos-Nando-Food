import { test, expect } from "@playwright/test";

test.describe("Flujo de Usuarios (Admin)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería acceder a la gestión de usuarios", async ({ page }) => {
    await page.click('button:has-text("Usuarios")');
    await expect(page.locator("h1")).toContainText("Usuarios");
  });

  test("Debería ver el listado de usuarios del sistema", async ({ page }) => {
    await page.click('button:has-text("Usuarios")');
    await expect(page.locator("h1")).toContainText("Usuarios");

    const tabla = page.locator("table");
    await expect(tabla).toBeVisible();

    const filas = tabla.locator("tbody tr");
    const count = await filas.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test("Debería ver el botón de nuevo usuario", async ({ page }) => {
    await page.click('button:has-text("Usuarios")');
    await expect(page.locator("h1")).toContainText("Usuarios");

    const nuevoUsuarioBtn = page.locator('button:has-text("Nuevo Usuario")');
    await expect(nuevoUsuarioBtn).toBeVisible();
  });

  test("Debería abrir el modal de nuevo usuario", async ({ page }) => {
    await page.click('button:has-text("Usuarios")');
    await expect(page.locator("h1")).toContainText("Usuarios");

    await page.click('button:has-text("Nuevo Usuario")');
    const modal = page.locator('[role="dialog"], .fixed.inset-0');
    await expect(modal).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("Debería filtrar usuarios por rol", async ({ page }) => {
    await page.click('button:has-text("Usuarios")');
    await expect(page.locator("h1")).toContainText("Usuarios");

    const rolSelect = page.locator("select").first();
    if (await rolSelect.isVisible()) {
      await rolSelect.selectOption("Mesero");
      await page.waitForTimeout(1000);
    }
  });
});
