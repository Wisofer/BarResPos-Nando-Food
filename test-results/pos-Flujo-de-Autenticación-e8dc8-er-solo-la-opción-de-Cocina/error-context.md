# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pos.spec.js >> Flujo de Autenticación y Navegación del POS >> Debería iniciar sesión como cocinero y ver solo la opción de Cocina
- Location: pos.spec.js:62:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/login", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Flujo de Autenticación y Navegación del POS", () => {
  4  |   test("Debería iniciar sesión correctamente con credenciales admin y navegar al Dashboard", async ({ page }) => {
  5  |     // 1. Navegar a la página de Login
  6  |     await page.goto("/login");
  7  | 
  8  |     // 2. Llenar el formulario con las credenciales por defecto (admin/admin)
  9  |     await page.fill('input[placeholder="ej. admin"]', "admin");
  10 |     await page.fill('input[placeholder="••••••••"]', "admin");
  11 |     
  12 |     // 3. Dar clic en el botón de submit
  13 |     await page.click('button[type="submit"]');
  14 | 
  15 |     // 4. Esperar redirección al shell principal de AuthHome
  16 |     await expect(page).toHaveURL(/.*app/);
  17 | 
  18 |     // 5. Verificar que se renderiza el encabezado del Dashboard
  19 |     const dashboardHeader = page.locator("h1");
  20 |     await expect(dashboardHeader).toContainText("Dashboard");
  21 |   });
  22 | 
  23 |   test("Debería rechazar credenciales incorrectas y mostrar un mensaje de error", async ({ page }) => {
  24 |     // 1. Navegar a la página de Login
  25 |     await page.goto("/login");
  26 | 
  27 |     // 2. Llenar el formulario con datos inválidos
  28 |     await page.fill('input[placeholder="ej. admin"]', "usuario_invalido");
  29 |     await page.fill('input[placeholder="••••••••"]', "clave_incorrecta");
  30 | 
  31 |     // 3. Enviar formulario
  32 |     await page.click('button[type="submit"]');
  33 | 
  34 |     // 4. Verificar que se mantenga en la página de login (o no redirija al dashboard)
  35 |     await expect(page).not.toHaveURL(/.*dashboard/);
  36 |   });
  37 | 
  38 |   test("Debería iniciar sesión como mesero y ver solo las opciones de mesas y delivery", async ({ page }) => {
  39 |     // 1. Navegar a la página de Login
  40 |     await page.goto("/login");
  41 | 
  42 |     // 2. Iniciar sesión como mesero1
  43 |     await page.fill('input[placeholder="ej. admin"]', "mesero1");
  44 |     await page.fill('input[placeholder="••••••••"]', "mesero1");
  45 |     await page.click('button[type="submit"]');
  46 | 
  47 |     // 3. Esperar redirección al POS/app
  48 |     await expect(page).toHaveURL(/.*app/);
  49 | 
  50 |     // 4. El sidebar no debe mostrar "Dashboard", "Productos", "Usuarios", "Configuraciones" o "Reportes"
  51 |     const sidebar = page.locator('aside');
  52 |     await expect(sidebar.locator('button', { hasText: 'Dashboard' })).toBeHidden();
  53 |     await expect(sidebar.locator('button', { hasText: 'Productos' })).toBeHidden();
  54 |     await expect(sidebar.locator('button', { hasText: 'Usuarios' })).toBeHidden();
  55 |     await expect(sidebar.locator('button', { hasText: 'Configuraciones' })).toBeHidden();
  56 | 
  57 |     // 5. El sidebar debe mostrar "Mesas" y "Delivery"
  58 |     await expect(sidebar.locator('button', { hasText: 'Mesas' })).toBeVisible();
  59 |     await expect(sidebar.locator('button', { hasText: 'Delivery' })).toBeVisible();
  60 |   });
  61 | 
  62 |   test("Debería iniciar sesión como cocinero y ver solo la opción de Cocina", async ({ page }) => {
  63 |     // 1. Navegar a la página de Login
> 64 |     await page.goto("/login");
     |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  65 | 
  66 |     // 2. Iniciar sesión como cocina1
  67 |     await page.fill('input[placeholder="ej. admin"]', "cocina1");
  68 |     await page.fill('input[placeholder="••••••••"]', "cocina1");
  69 |     await page.click('button[type="submit"]');
  70 | 
  71 |     // 3. Esperar redirección al POS/app
  72 |     await expect(page).toHaveURL(/.*app/);
  73 | 
  74 |     // 4. El sidebar no debe mostrar "Mesas", "Delivery", "Dashboard", "Productos", etc.
  75 |     const sidebar = page.locator('aside');
  76 |     await expect(sidebar.locator('button', { hasText: 'Mesas' })).toBeHidden();
  77 |     await expect(sidebar.locator('button', { hasText: 'Delivery' })).toBeHidden();
  78 |     await expect(sidebar.locator('button', { hasText: 'Dashboard' })).toBeHidden();
  79 |     await expect(sidebar.locator('button', { hasText: 'Productos' })).toBeHidden();
  80 | 
  81 |     // 5. El sidebar debe mostrar "Cocina"
  82 |     await expect(sidebar.locator('button', { hasText: 'Cocina' })).toBeVisible();
  83 |   });
  84 | });
  85 | 
  86 | 
```