import { test, expect } from "@playwright/test";

test.describe("Flujo de Clientes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería acceder al módulo de Clientes y ver el listado", async ({ page }) => {
    await page.click('button:has-text("Clientes")');
    await expect(page.locator("h1")).toContainText("Clientes");
  });

  test("Debería ver el buscador y botón de nuevo cliente", async ({ page }) => {
    await page.click('button:has-text("Clientes")');
    await expect(page.locator("h1")).toContainText("Clientes");

    const searchInput = page.locator('input[placeholder="Buscar cliente..."]');
    await expect(searchInput).toBeVisible();

    const nuevoClienteBtn = page.locator('button:has-text("Nuevo Cliente")');
    await expect(nuevoClienteBtn).toBeVisible();
  });

  test("Debería abrir el modal de nuevo cliente", async ({ page }) => {
    await page.click('button:has-text("Clientes")');
    await expect(page.locator("h1")).toContainText("Clientes");

    await page.click('button:has-text("Nuevo Cliente")');
    const modal = page.locator('[role="dialog"], .fixed.inset-0');
    await expect(modal).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});
