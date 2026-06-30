import { test, expect } from "@playwright/test";

test.describe("Flujo de Cocina (KDS)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería renderizar el KDS con todas las secciones", async ({ page }) => {
    await page.click('button:has-text("Cocina")');
    await expect(page.locator("h2").first()).toContainText("Cocina (KDS)");

    await expect(page.locator("span", { hasText: "Por preparar" }).first()).toBeVisible();
    await expect(page.locator("button", { hasText: "Cocina en vivo" })).toBeVisible();
    await expect(page.locator("button", { hasText: "Historial" })).toBeHidden();
  });

  test("Debería mostrar el buscador y botón de actualizar en el KDS", async ({ page }) => {
    await page.click('button:has-text("Cocina")');
    await expect(page.locator("h2").first()).toContainText("Cocina (KDS)");

    const searchInput = page.locator('input[placeholder="Buscar por orden o mesa"]');
    await expect(searchInput).toBeVisible();

    const refreshBtn = page.locator('button:has-text("Actualizar")');
    await expect(refreshBtn).toBeVisible();
  });

  test("Debería mostrar mensaje de 'Sin órdenes' cuando no hay pedidos en cocina", async ({ page }) => {
    await page.click('button:has-text("Cocina")');
    await expect(page.locator("h2").first()).toContainText("Cocina (KDS)");

    const sinOrdenesMsg = page.locator("text=Sin órdenes en esta sección");
    const existingCards = page.locator("article .rounded-2xl.bg-white");

    const cardsCount = await existingCards.count();
    if (cardsCount === 0) {
      await expect(sinOrdenesMsg.first()).toBeVisible();
    }
  });
});
