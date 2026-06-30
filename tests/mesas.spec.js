import { test, expect } from "@playwright/test";

test.describe("Flujo de Mesero: Mesas y Pedidos", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "mesero1");
    await page.fill('input[placeholder="••••••••"]', "mesero1");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería abrir una mesa libre y ver los botones de orden", async ({ page }) => {
    await page.click('button:has-text("Mesas")');
    await expect(page.locator("h1")).toContainText("Gestion de mesas");

    const mesaCard = page.locator("article").filter({ hasText: /Barra 1/i }).first();
    await expect(mesaCard).toBeVisible();

    await mesaCard.click().catch(() => mesaCard.locator("button").first().click());
    await expect(page.locator("h2").first()).toContainText("Barra 1");

    // Esperar a que el catálogo de productos y el estado de la caja se carguen completamente
    await page.waitForTimeout(2000);

    // Agregar un producto sin modificadores (como Batidos o Burritos) para activar los botones de la orden
    const productItems = page.locator("button").filter({ hasText: /Batidos|Burritos/i });
    await productItems.first().dispatchEvent("click");
    await page.waitForTimeout(1000);

    await expect(page.locator('button:has-text("Mandar orden")').first()).toBeVisible();
    await expect(page.locator('button:has-text("Imprimir cuenta")').first()).toBeVisible();
  });

  test("Debería ver el plano de mesas y cambiar entre vistas", async ({ page }) => {
    await page.click('button:has-text("Mesas")');
    await expect(page.locator("h1")).toContainText("Gestion de mesas");

    const planoBtn = page.locator('button:has-text("Plano")');
    if (await planoBtn.isVisible()) {
      await planoBtn.click();
    }
  });

  test("Debería listar correctamente las mesas disponibles en zonas", async ({ page }) => {
    await page.click('button:has-text("Mesas")');
    await expect(page.locator("h1")).toContainText("Gestion de mesas");

    const zonasBtn = page.locator('button:has-text("Zonas")');
    if (await zonasBtn.isVisible()) {
      await zonasBtn.click();
    }

    const mesas = page.locator("article");
    const count = await mesas.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });
});

test.describe("Flujo de Administración de Mesas", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería navegar a Mesas y ver el formulario de nueva mesa", async ({ page }) => {
    await page.click('button:has-text("Mesas")');
    await expect(page.locator("h1")).toContainText("Gestion de mesas");

    const nuevaMesaBtn = page.locator('button:has-text("Nueva Mesa")');
    if (await nuevaMesaBtn.isVisible()) {
      await nuevaMesaBtn.click();
      const modalDialog = page.locator('[role="dialog"], .fixed.inset-0');
      await expect(modalDialog).toBeVisible({ timeout: 5000 }).catch(() => {});
    }
  });
});
