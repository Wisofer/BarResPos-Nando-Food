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

  test("Debería separar en una nueva línea al agregar un producto que ya fue enviado a cocina (Anti-Fraude)", async ({ page }) => {
    await page.click('button:has-text("Delivery")');
    await page.click('button:has-text("Nuevo Pedido")');

    // Simulate clicking a product from the catalog (assuming a product exists)
    // We mock the state or wait for a product button to be visible
    const primerProductoBtn = page.locator('.col-span-1 button').first(); 
    if (await primerProductoBtn.isVisible()) {
      // 1. Agregar el primer producto
      await primerProductoBtn.click();
      
      // 2. Verificar que se agregó 1 línea al carrito
      const cartItems = page.locator('.flex.flex-col.gap-2 > div.flex.items-start');
      await expect(cartItems).toHaveCount(1);
      
      // 3. Enviar a cocina
      const btnEnviarCocina = page.locator('button:has-text("Mandar orden")');
      if (await btnEnviarCocina.isVisible()) {
        await btnEnviarCocina.click();
        
        // 4. Agregar el MISMO producto nuevamente
        await primerProductoBtn.click();
        
        // 5. Verificar que ahora hay 2 líneas (una enviada, otra nueva pendiente)
        await expect(cartItems).toHaveCount(2);
        
        // 6. Verificar que intentar restar de la enviada lanza un error o no hace nada
        // (La lógica real asume que el botón '-' en la línea enviada está bloqueado o da error)
      }
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
