# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mesas.spec.js >> Flujo de Mesero: Mesas y Pedidos >> Debería abrir una mesa libre y ver los botones de orden
- Location: tests/mesas.spec.js:12:3

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
  3  | test.describe("Flujo de Mesero: Mesas y Pedidos", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/login");
  6  |     await page.fill('input[placeholder="ej. admin"]', "mesero1");
  7  |     await page.fill('input[placeholder="••••••••"]', "mesero1");
  8  |     await page.click('button[type="submit"]');
> 9  |     await expect(page).toHaveURL(/.*app/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  10 |   });
  11 | 
  12 |   test("Debería abrir una mesa libre y ver los botones de orden", async ({ page }) => {
  13 |     await page.click('button:has-text("Mesas")');
  14 |     await expect(page.locator("h1")).toContainText("Gestion de mesas");
  15 | 
  16 |     const mesaCard = page.locator("article").filter({ hasText: /Barra 1/i }).first();
  17 |     await expect(mesaCard).toBeVisible();
  18 | 
  19 |     await mesaCard.locator("button").filter({ hasText: /Ocupada|Doble clic|Atender|Abrir/i }).click().catch(() => mesaCard.click());
  20 |     await expect(page.locator("h2").first()).toContainText("Barra 1");
  21 | 
  22 |     await expect(page.locator('button:has-text("Mandar orden")').first()).toBeVisible();
  23 |     await expect(page.locator('button:has-text("Imprimir cuenta")').first()).toBeVisible();
  24 |   });
  25 | 
  26 |   test("Debería ver el plano de mesas y cambiar entre vistas", async ({ page }) => {
  27 |     await page.click('button:has-text("Mesas")');
  28 |     await expect(page.locator("h1")).toContainText("Gestion de mesas");
  29 | 
  30 |     const planoBtn = page.locator('button:has-text("Plano")');
  31 |     if (await planoBtn.isVisible()) {
  32 |       await planoBtn.click();
  33 |     }
  34 |   });
  35 | 
  36 |   test("Debería listar correctamente las mesas disponibles en zonas", async ({ page }) => {
  37 |     await page.click('button:has-text("Mesas")');
  38 |     await expect(page.locator("h1")).toContainText("Gestion de mesas");
  39 | 
  40 |     const zonasBtn = page.locator('button:has-text("Zonas")');
  41 |     if (await zonasBtn.isVisible()) {
  42 |       await zonasBtn.click();
  43 |     }
  44 | 
  45 |     const mesas = page.locator("article");
  46 |     const count = await mesas.count();
  47 |     expect(count).toBeGreaterThanOrEqual(1);
  48 |   });
  49 | });
  50 | 
  51 | test.describe("Flujo de Administración de Mesas", () => {
  52 |   test.beforeEach(async ({ page }) => {
  53 |     await page.goto("/login");
  54 |     await page.fill('input[placeholder="ej. admin"]', "admin");
  55 |     await page.fill('input[placeholder="••••••••"]', "admin");
  56 |     await page.click('button[type="submit"]');
  57 |     await expect(page).toHaveURL(/.*app/);
  58 |   });
  59 | 
  60 |   test("Debería navegar a Mesas y ver el formulario de nueva mesa", async ({ page }) => {
  61 |     await page.click('button:has-text("Mesas")');
  62 |     await expect(page.locator("h1")).toContainText("Gestion de mesas");
  63 | 
  64 |     const nuevaMesaBtn = page.locator('button:has-text("Nueva Mesa")');
  65 |     if (await nuevaMesaBtn.isVisible()) {
  66 |       await nuevaMesaBtn.click();
  67 |       const modalDialog = page.locator('[role="dialog"], .fixed.inset-0');
  68 |       await expect(modalDialog).toBeVisible({ timeout: 5000 }).catch(() => {});
  69 |     }
  70 |   });
  71 | });
  72 | 
```