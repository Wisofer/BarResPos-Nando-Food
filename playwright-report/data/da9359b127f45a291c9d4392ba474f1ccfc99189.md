# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: usuarios.spec.js >> Flujo de Usuarios (Admin) >> Debería ver el listado de usuarios del sistema
- Location: tests\usuarios.spec.js:17:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('table')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('table')

```

```yaml
- main:
  - complementary:
    - img "BarRestPOS logo"
    - paragraph: BarRestPOS
    - text: Panel administrativo
    - button "Contraer menú lateral"
    - navigation:
      - button "Dashboard"
      - button "Pedidos"
      - button "Mesas"
      - button "Delivery"
      - button "Clientes"
      - button "Productos"
      - button "Proveedores"
      - button "Cocina"
      - button "Caja"
      - button "Usuarios"
      - button "Configuraciones"
      - button "Reportes"
    - button "Cerrar sesión"
  - heading "Usuarios" [level=1]
  - button "Pantalla completa"
  - button "Notificaciones"
  - button "Perfil"
  - heading "Usuarios" [level=2]
  - button "Nuevo usuario"
  - textbox "Buscar usuario"
  - combobox:
    - option "Todos los roles" [selected]
    - option "Administrador"
    - option "Mesero"
    - option "Cajero"
    - option "Cocinero"
  - combobox:
    - option "Todos" [selected]
    - option "Activos"
    - option "Inactivos"
  - button "Filtrar"
  - article:
    - paragraph: admin
    - paragraph: "Nombre: Administrador del Sistema | Rol: Administrador | Estado: Activo"
    - button "Editar usuario"
    - button "Eliminar usuario"
  - article:
    - paragraph: cajero1
    - paragraph: "Nombre: Carmen Rivas | Rol: Cajero | Estado: Activo"
    - button "Editar usuario"
    - button "Eliminar usuario"
  - article:
    - paragraph: cocina1
    - paragraph: "Nombre: Don José | Rol: Cocinero | Estado: Activo"
    - button "Editar usuario"
    - button "Eliminar usuario"
  - article:
    - paragraph: mesero1
    - paragraph: "Nombre: Juan Pérez | Rol: Mesero | Estado: Activo"
    - button "Editar usuario"
    - button "Eliminar usuario"
  - article:
    - paragraph: meseroA_1782840874437
    - paragraph: "Nombre: Mesero A Test | Rol: Mesero | Estado: Activo"
    - button "Editar usuario"
    - button "Eliminar usuario"
  - article:
    - paragraph: meseroA_1782845795469
    - paragraph: "Nombre: Mesero A Test | Rol: Mesero | Estado: Activo"
    - button "Editar usuario"
    - button "Eliminar usuario"
  - article:
    - paragraph: meseroB_1782840874437
    - paragraph: "Nombre: Mesero B Test | Rol: Mesero | Estado: Activo"
    - button "Editar usuario"
    - button "Eliminar usuario"
  - article:
    - paragraph: meseroB_1782845795469
    - paragraph: "Nombre: Mesero B Test | Rol: Mesero | Estado: Activo"
    - button "Editar usuario"
    - button "Eliminar usuario"
  - button "Anterior" [disabled]
  - text: Página 1 de 1
  - button "Siguiente" [disabled]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | 
  3  | test.describe("Flujo de Usuarios (Admin)", () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.goto("/login");
  6  |     await page.fill('input[placeholder="ej. admin"]', "admin");
  7  |     await page.fill('input[placeholder="••••••••"]', "admin");
  8  |     await page.click('button[type="submit"]');
  9  |     await expect(page).toHaveURL(/.*app/);
  10 |   });
  11 | 
  12 |   test("Debería acceder a la gestión de usuarios", async ({ page }) => {
  13 |     await page.click('button:has-text("Usuarios")');
  14 |     await expect(page.locator("h1")).toContainText("Usuarios");
  15 |   });
  16 | 
  17 |   test("Debería ver el listado de usuarios del sistema", async ({ page }) => {
  18 |     await page.click('button:has-text("Usuarios")');
  19 |     await expect(page.locator("h1")).toContainText("Usuarios");
  20 | 
  21 |     const tabla = page.locator("table");
> 22 |     await expect(tabla).toBeVisible();
     |                         ^ Error: expect(locator).toBeVisible() failed
  23 | 
  24 |     const filas = tabla.locator("tbody tr");
  25 |     const count = await filas.count();
  26 |     expect(count).toBeGreaterThanOrEqual(1);
  27 |   });
  28 | 
  29 |   test("Debería ver el botón de nuevo usuario", async ({ page }) => {
  30 |     await page.click('button:has-text("Usuarios")');
  31 |     await expect(page.locator("h1")).toContainText("Usuarios");
  32 | 
  33 |     const nuevoUsuarioBtn = page.locator('button:has-text("Nuevo Usuario")');
  34 |     await expect(nuevoUsuarioBtn).toBeVisible();
  35 |   });
  36 | 
  37 |   test("Debería abrir el modal de nuevo usuario", async ({ page }) => {
  38 |     await page.click('button:has-text("Usuarios")');
  39 |     await expect(page.locator("h1")).toContainText("Usuarios");
  40 | 
  41 |     await page.click('button:has-text("Nuevo Usuario")');
  42 |     const modal = page.locator('[role="dialog"], .fixed.inset-0');
  43 |     await expect(modal).toBeVisible({ timeout: 5000 }).catch(() => {});
  44 |   });
  45 | 
  46 |   test("Debería filtrar usuarios por rol", async ({ page }) => {
  47 |     await page.click('button:has-text("Usuarios")');
  48 |     await expect(page.locator("h1")).toContainText("Usuarios");
  49 | 
  50 |     const rolSelect = page.locator("select").first();
  51 |     if (await rolSelect.isVisible()) {
  52 |       await rolSelect.selectOption("Mesero");
  53 |       await page.waitForTimeout(1000);
  54 |     }
  55 |   });
  56 | });
  57 | 
```