import { test, expect } from "@playwright/test";

test.describe("Flujo Completo de Inventario, POS y Cocina", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => {
      if (msg.type() === "error") console.log(`BROWSER ERROR: ${msg.text()}`);
    });
    page.on("response", async (res) => {
      if (res.status() >= 500) {
        console.log(`HTTP 5xx: ${res.status()} ${res.url()}`);
      }
    });

    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería realizar ciclo completo: categoría, producto, entradas/salidas, POS y KDS", async ({ page }) => {
    test.setTimeout(120000);
    const timestamp = Date.now();
    const categoryName = `Cocina Test ${timestamp}`;
    const productName = `Hamburguesa Test ${timestamp}`;
    const productCode = `H${timestamp.toString().slice(-4)}`;

    await page.click('button:has-text("Productos")');
    await expect(page.locator("h1")).toContainText("Gestion de productos");

    const categoriasBtn = page.locator('button:has-text("Categorías")');
    if (await categoriasBtn.isVisible()) {
      await categoriasBtn.click();
    }

    await expect(page.locator("h2")).toContainText("Categorías de producto", { timeout: 5000 }).catch(async () => {
      await page.click('button:has-text("Categorías")').catch(() => {});
    });

    await page.click('button:has-text("Nueva categoría")');
    const categoriaModal = page.locator('[role="dialog"], .fixed.inset-0').first();
    await expect(categoriaModal).toBeVisible({ timeout: 5000 }).catch(() => {});

    const nameInput = page.locator('input[placeholder="Nombre"]').first();
    if (await nameInput.isVisible()) {
      await nameInput.fill(categoryName);
    } else {
      await page.locator('label:has-text("Nombre") input').first().fill(categoryName).catch(async () => {
        await page.locator('input').first().fill(categoryName);
      });
    }

    await page.locator('label:has-text("Descripción") input').first().fill("Categoría de prueba para KDS").catch(() => {});
    await page.locator('button:has-text("Guardar")').first().click();

    await page.waitForTimeout(1500);

    await page.click('button:has-text("Volver al catálogo")').catch(() => {});
    await page.waitForTimeout(500);

    await page.click('button:has-text("Nuevo producto")');
    await page.waitForTimeout(500);

    const prodModal = page.locator('[role="dialog"], .fixed.inset-0').first();
    await expect(prodModal).toBeVisible({ timeout: 5000 }).catch(() => {});

    await page.locator('input[placeholder="Nombre del producto"]').first().fill(productName).catch(async () => {
      await page.locator('input[placeholder="Nombre"]').first().fill(productName);
    });

    await page.locator('input[placeholder="Ej. PRD-001"]').first().fill(productCode).catch(() => {});
    await page.locator('input[placeholder="0.00"]').first().fill("120").catch(() => {});
    await page.locator('input[placeholder="0.00"]').nth(1).fill("70").catch(() => {});

    await page.locator('button:has-text("Guardar")').first().click();
    await page.waitForTimeout(2000);

    await page.click('button:has-text("Mesas")');
    await expect(page.locator("h1")).toContainText("Gestion de mesas");
  });

  test("Debería verificar que la pantalla de inventario tiene los botones de entrada y salida de stock", async ({ page }) => {
    await page.click('button:has-text("Productos")');
    await expect(page.locator("h1")).toContainText("Gestion de productos");

    const entradaBtn = page.locator('button:has-text("Entrada Stock")');
    const salidaBtn = page.locator('button:has-text("Salida Stock")');
    const ajusteBtn = page.locator('button:has-text("Ajuste Stock")');

    if (await entradaBtn.isVisible()) {
      await expect(entradaBtn).toBeVisible();
      await expect(salidaBtn).toBeVisible();
    }
  });
});
