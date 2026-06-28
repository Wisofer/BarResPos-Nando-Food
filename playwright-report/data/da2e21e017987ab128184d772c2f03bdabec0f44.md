# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pos.spec.js >> Roles y permisos del sistema >> Debería iniciar sesión como mesero y ver solo Mesas y Delivery
- Location: tests/pos.spec.js:67:3

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
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Flujo de Autenticación y Navegación del POS", () => {
  4   |   test("Debería iniciar sesión correctamente con credenciales admin y navegar al Dashboard", async ({ page }) => {
  5   |     await page.goto("/login");
  6   |     await page.fill('input[placeholder="ej. admin"]', "admin");
  7   |     await page.fill('input[placeholder="••••••••"]', "admin");
  8   |     await page.click('button[type="submit"]');
  9   |     await expect(page).toHaveURL(/.*app/);
  10  |     const dashboardHeader = page.locator("h1");
  11  |     await expect(dashboardHeader).toContainText("Dashboard");
  12  |   });
  13  | 
  14  |   test("Debería rechazar credenciales incorrectas y mostrar mensaje de error", async ({ page }) => {
  15  |     await page.goto("/login");
  16  |     await page.fill('input[placeholder="ej. admin"]', "usuario_invalido");
  17  |     await page.fill('input[placeholder="••••••••"]', "clave_incorrecta");
  18  |     await page.click('button[type="submit"]');
  19  |     await expect(page).not.toHaveURL(/.*dashboard/);
  20  |   });
  21  | 
  22  |   test("Debería navegar entre todas las secciones del sidebar como admin", async ({ page }) => {
  23  |     await page.goto("/login");
  24  |     await page.fill('input[placeholder="ej. admin"]', "admin");
  25  |     await page.fill('input[placeholder="••••••••"]', "admin");
  26  |     await page.click('button[type="submit"]');
  27  |     await expect(page).toHaveURL(/.*app/);
  28  | 
  29  |     const sections = [
  30  |       { name: "Dashboard", title: "Dashboard" },
  31  |       { name: "Pedidos", title: "Gestion de pedidos" },
  32  |       { name: "Mesas", title: "Gestion de mesas" },
  33  |       { name: "Delivery", title: "Delivery" },
  34  |       { name: "Clientes", title: "Clientes" },
  35  |       { name: "Productos", title: "Gestion de productos" },
  36  |       { name: "Cocina", title: "Cocina" },
  37  |       { name: "Caja", title: "Caja" },
  38  |       { name: "Usuarios", title: "Usuarios" },
  39  |       { name: "Configuraciones", title: "Configuraciones" },
  40  |       { name: "Reportes", title: "Reportes" },
  41  |     ];
  42  | 
  43  |     for (const section of sections) {
  44  |       const sidebarBtn = page.locator(`button:has-text("${section.name}")`).first();
  45  |       if (await sidebarBtn.isVisible()) {
  46  |         await sidebarBtn.click();
  47  |         await expect(page.locator("h1")).toContainText(section.title);
  48  |       }
  49  |     }
  50  |   });
  51  | 
  52  |   test("Debería navegar al Dashboard y ver las tarjetas de estadísticas", async ({ page }) => {
  53  |     await page.goto("/login");
  54  |     await page.fill('input[placeholder="ej. admin"]', "admin");
  55  |     await page.fill('input[placeholder="••••••••"]', "admin");
  56  |     await page.click('button[type="submit"]');
  57  |     await expect(page).toHaveURL(/.*app/);
  58  | 
  59  |     await expect(page.locator("h1")).toContainText("Dashboard");
  60  |     const statCards = page.locator("main section > section > div > div");
  61  |     const count = await statCards.count();
  62  |     expect(count).toBeGreaterThanOrEqual(1);
  63  |   });
  64  | });
  65  | 
  66  | test.describe("Roles y permisos del sistema", () => {
  67  |   test("Debería iniciar sesión como mesero y ver solo Mesas y Delivery", async ({ page }) => {
  68  |     await page.goto("/login");
  69  |     await page.fill('input[placeholder="ej. admin"]', "mesero1");
  70  |     await page.fill('input[placeholder="••••••••"]', "mesero1");
  71  |     await page.click('button[type="submit"]');
> 72  |     await expect(page).toHaveURL(/.*app/);
      |                        ^ Error: expect(page).toHaveURL(expected) failed
  73  | 
  74  |     const sidebar = page.locator("aside, nav");
  75  |     await expect(sidebar.locator('button', { hasText: 'Dashboard' })).toBeHidden();
  76  |     await expect(sidebar.locator('button', { hasText: 'Productos' })).toBeHidden();
  77  |     await expect(sidebar.locator('button', { hasText: 'Usuarios' })).toBeHidden();
  78  |     await expect(sidebar.locator('button', { hasText: 'Configuraciones' })).toBeHidden();
  79  |     await expect(sidebar.locator('button', { hasText: 'Mesas' })).toBeVisible();
  80  |     await expect(sidebar.locator('button', { hasText: 'Delivery' })).toBeVisible();
  81  |   });
  82  | 
  83  |   test("Debería iniciar sesión como cocinero y ver solo Cocina", async ({ page }) => {
  84  |     await page.goto("/login");
  85  |     await page.fill('input[placeholder="ej. admin"]', "cocina1");
  86  |     await page.fill('input[placeholder="••••••••"]', "cocina1");
  87  |     await page.click('button[type="submit"]');
  88  |     await expect(page).toHaveURL(/.*app/);
  89  | 
  90  |     const sidebar = page.locator("aside, nav");
  91  |     await expect(sidebar.locator('button', { hasText: 'Mesas' })).toBeHidden();
  92  |     await expect(sidebar.locator('button', { hasText: 'Delivery' })).toBeHidden();
  93  |     await expect(sidebar.locator('button', { hasText: 'Dashboard' })).toBeHidden();
  94  |     await expect(sidebar.locator('button', { hasText: 'Productos' })).toBeHidden();
  95  |     await expect(sidebar.locator('button', { hasText: 'Cocina' })).toBeVisible();
  96  |   });
  97  | 
  98  |   test("Debería iniciar sesión como administrador y ver todas las secciones", async ({ page }) => {
  99  |     await page.goto("/login");
  100 |     await page.fill('input[placeholder="ej. admin"]', "admin");
  101 |     await page.fill('input[placeholder="••••••••"]', "admin");
  102 |     await page.click('button[type="submit"]');
  103 |     await expect(page).toHaveURL(/.*app/);
  104 | 
  105 |     const sidebar = page.locator("aside, nav");
  106 |     await expect(sidebar.locator('button', { hasText: 'Dashboard' })).toBeVisible();
  107 |     await expect(sidebar.locator('button', { hasText: 'Mesas' })).toBeVisible();
  108 |     await expect(sidebar.locator('button', { hasText: 'Delivery' })).toBeVisible();
  109 |     await expect(sidebar.locator('button', { hasText: 'Clientes' })).toBeVisible();
  110 |     await expect(sidebar.locator('button', { hasText: 'Productos' })).toBeVisible();
  111 |     await expect(sidebar.locator('button', { hasText: 'Cocina' })).toBeVisible();
  112 |     await expect(sidebar.locator('button', { hasText: 'Caja' })).toBeVisible();
  113 |     await expect(sidebar.locator('button', { hasText: 'Usuarios' })).toBeVisible();
  114 |     await expect(sidebar.locator('button', { hasText: 'Configuraciones' })).toBeVisible();
  115 |     await expect(sidebar.locator('button', { hasText: 'Reportes' })).toBeVisible();
  116 |   });
  117 | });
  118 | 
```