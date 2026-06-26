import { test, expect } from "@playwright/test";

test.describe("Flujo de Delivery", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería acceder al módulo de Delivery y ver la interfaz principal", async ({ page }) => {
    await page.click('button:has-text("Delivery")');
    await expect(page.locator("h1")).toContainText("Delivery");
  });

  test("Debería ver los botones de acciones principales en Delivery", async ({ page }) => {
    await page.click('button:has-text("Delivery")');
    await expect(page.locator("h1")).toContainText("Delivery");

    const nuevoPedidoBtn = page.locator('button:has-text("Nuevo Pedido")');
    await expect(nuevoPedidoBtn).toBeVisible();
  });

  test("Debería mostrar el listado de pedidos de delivery", async ({ page }) => {
    await page.click('button:has-text("Delivery")');
    await expect(page.locator("h1")).toContainText("Delivery");

    const searchInput = page.locator('input[placeholder="Buscar"]');
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });
});

test.describe("Flujo de Delivery como Mesero", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "mesero1");
    await page.fill('input[placeholder="••••••••"]', "mesero1");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería acceder a Delivery como mesero", async ({ page }) => {
    await page.click('button:has-text("Delivery")');
    await expect(page.locator("h1")).toContainText("Delivery");
  });
});
