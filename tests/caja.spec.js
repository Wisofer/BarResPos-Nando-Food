import { test, expect } from "@playwright/test";

test.describe("Flujo de Caja", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('input[placeholder="ej. admin"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería acceder al módulo de Caja", async ({ page }) => {
    await page.click('button:has-text("Caja")');
    await expect(page.locator("h1")).toContainText("Caja");
  });

  test("Debería ver el estado actual de la caja", async ({ page }) => {
    await page.click('button:has-text("Caja")');
    await expect(page.locator("h1")).toContainText("Caja");
    await page.waitForTimeout(2000);

    const estadoSection = page.locator("text=/Caja|Apertura|Cierre|Estado/i");
    await expect(estadoSection.first()).toBeVisible();
  });
});
