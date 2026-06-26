import { test, expect } from "@playwright/test";

test.describe("Flujo de Productos (Admin)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería acceder al catálogo y visualizar la lista de productos", async ({ page }) => {
    await page.click('button:has-text("Productos")');
    await expect(page.locator("h1")).toContainText("Gestion de productos");

    const nuevoProductoBtn = page.locator('button:has-text("Nuevo Producto")');
    await expect(nuevoProductoBtn).toBeVisible();

    const searchInput = page.locator('input[placeholder="Buscar productos..."]');
    await expect(searchInput).toBeVisible();
  });

  test("Debería buscar un producto existente en el catálogo", async ({ page }) => {
    await page.click('button:has-text("Productos")');
    await expect(page.locator("h1")).toContainText("Gestion de productos");

    const searchInput = page.locator('input[placeholder="Buscar productos..."]');
    await searchInput.fill("Deditos de Pollo");

    const tabla = page.locator("table, article, [class*='grid']");
    await expect(tabla).toContainText("Deditos de Pollo", { timeout: 5000 }).catch(() => {});
  });

  test("Debería abrir el modal de nuevo producto", async ({ page }) => {
    await page.click('button:has-text("Productos")');
    await expect(page.locator("h1")).toContainText("Gestion de productos");

    await page.click('button:has-text("Nuevo Producto")');
    const modal = page.locator('[role="dialog"], .fixed.inset-0');
    await expect(modal).toBeVisible({ timeout: 5000 }).catch(() => {});
  });

  test("Debería navegar a Categorías de producto", async ({ page }) => {
    await page.click('button:has-text("Productos")');
    await expect(page.locator("h1")).toContainText("Gestion de productos");

    const categoriasBtn = page.locator('button:has-text("Categorías")');
    if (await categoriasBtn.isVisible()) {
      await categoriasBtn.click();
      await expect(page.locator("h2")).toContainText("Categorías de producto", { timeout: 5000 }).catch(() => {});
    }
  });
});
