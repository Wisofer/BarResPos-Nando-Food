# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: delivery.spec.js >> Flujo de Delivery como Mesero >> Debería acceder a Delivery como mesero
- Location: tests/delivery.spec.js:77:3

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*app/
Received string:  "http://localhost:5173/login#/login"
Timeout: 5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    14 × unexpected value "http://localhost:5173/login#/login"

```

```yaml
- img "BarRestPOS logo"
- paragraph: BarRestPOS
- heading "Diseñado para operar a la velocidad de tu servicio." [level=2]
- paragraph: Ventas Semanales
- text: ↗ +14.2%
- paragraph: C$ 45,820.00
- paragraph: Distribución de Salón
- text: Mesa 1 Libre Mesa 2 Ocupada Mesa 3 Libre Mesa 4 Reservada MOP (Ocupación) 45%
- paragraph: "Pedido #1042"
- paragraph: Mesa 2 · Salon
- text: "En Cocina 1x Hamburguesa C$ 180 1x Té Helado C$ 40 Total C$ 220.00 #1042-NANDO-FOOD Sencillo · Veloz · Confiable"
- img "BarRestPOS logo"
- heading "Iniciar sesión" [level=1]
- paragraph: Accede al panel administrativo
- paragraph: No autorizado
- text: Usuario
- textbox "ej. admin": mesero1
- text: Contraseña
- textbox "••••••••": mesero1
- button "Ver contraseña"
- button "Entrar al sistema"
- paragraph: © 2026 BarRestPOS
- paragraph:
  - text: Desarrollado por
  - link "COWIB":
    - /url: https://www.cowib.es
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Flujo de Delivery", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/login");
  6  |     await page.fill('input[placeholder="ej. admin"]', "admin");
  7  |     await page.fill('input[placeholder="••••••••"]', "admin");
  8  |     await page.click('button[type="submit"]');
  9  |     await expect(page).toHaveURL(/.*app/);
  10 |   });
  11 | 
  12 |   test("Debería acceder al módulo de Delivery y ver la interfaz principal", async ({ page }) => {
  13 |     await page.click('button:has-text("Delivery")');
  14 |     await expect(page.locator("h1")).toContainText("Delivery");
  15 |   });
  16 | 
  17 |   test("Debería ver los botones de acciones principales en Delivery", async ({ page }) => {
  18 |     await page.click('button:has-text("Delivery")');
  19 |     await expect(page.locator("h1")).toContainText("Delivery");
  20 | 
  21 |     const nuevoPedidoBtn = page.locator('button:has-text("Nuevo Pedido")');
  22 |     await expect(nuevoPedidoBtn).toBeVisible();
  23 |   });
  24 | 
  25 |   test("Debería mostrar el listado de pedidos de delivery", async ({ page }) => {
  26 |     await page.click('button:has-text("Delivery")');
  27 |     await expect(page.locator("h1")).toContainText("Delivery");
  28 | 
  29 |     const searchInput = page.locator('input[placeholder="Buscar"]');
  30 |     if (await searchInput.isVisible()) {
  31 |       await expect(searchInput).toBeVisible();
  32 |     }
  33 |   });
  34 | 
  35 |   test("Debería separar en una nueva línea al agregar un producto que ya fue enviado a cocina (Anti-Fraude)", async ({ page }) => {
  36 |     await page.click('button:has-text("Delivery")');
  37 |     await page.click('button:has-text("Nuevo Pedido")');
  38 | 
  39 |     // Simulate clicking a product from the catalog (assuming a product exists)
  40 |     // We mock the state or wait for a product button to be visible
  41 |     const primerProductoBtn = page.locator('.col-span-1 button').first(); 
  42 |     if (await primerProductoBtn.isVisible()) {
  43 |       // 1. Agregar el primer producto
  44 |       await primerProductoBtn.click();
  45 |       
  46 |       // 2. Verificar que se agregó 1 línea al carrito
  47 |       const cartItems = page.locator('.flex.flex-col.gap-2 > div.flex.items-start');
  48 |       await expect(cartItems).toHaveCount(1);
  49 |       
  50 |       // 3. Enviar a cocina
  51 |       const btnEnviarCocina = page.locator('button:has-text("Mandar orden")');
  52 |       if (await btnEnviarCocina.isVisible()) {
  53 |         await btnEnviarCocina.click();
  54 |         
  55 |         // 4. Agregar el MISMO producto nuevamente
  56 |         await primerProductoBtn.click();
  57 |         
  58 |         // 5. Verificar que ahora hay 2 líneas (una enviada, otra nueva pendiente)
  59 |         await expect(cartItems).toHaveCount(2);
  60 |         
  61 |         // 6. Verificar que intentar restar de la enviada lanza un error o no hace nada
  62 |         // (La lógica real asume que el botón '-' en la línea enviada está bloqueado o da error)
  63 |       }
  64 |     }
  65 |   });
  66 | });
  67 | 
  68 | test.describe("Flujo de Delivery como Mesero", () => {
  69 |   test.beforeEach(async ({ page }) => {
  70 |     await page.goto("/login");
  71 |     await page.fill('input[placeholder="ej. admin"]', "mesero1");
  72 |     await page.fill('input[placeholder="••••••••"]', "mesero1");
  73 |     await page.click('button[type="submit"]');
> 74 |     await expect(page).toHaveURL(/.*app/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  75 |   });
  76 | 
  77 |   test("Debería acceder a Delivery como mesero", async ({ page }) => {
  78 |     await page.click('button:has-text("Delivery")');
  79 |     await expect(page.locator("h1")).toContainText("Delivery");
  80 |   });
  81 | });
  82 | 
```