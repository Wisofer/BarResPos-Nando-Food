# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: pos.spec.js >> Flujo de Autenticación y Navegación del POS >> Debería navegar al Dashboard y ver las tarjetas de estadísticas
- Location: tests/pos.spec.js:52:3

# Error details

```
Error: expect(received).toBeGreaterThanOrEqual(expected)

Expected: >= 1
Received:    0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e3]:
    - generic [ref=e4]:
      - complementary [ref=e5]:
        - generic [ref=e6]:
          - img "BarRestPOS logo" [ref=e7]
          - generic [ref=e8]:
            - paragraph [ref=e9]: BarRestPOS
            - generic [ref=e14]: Panel administrativo
          - button "Contraer menú lateral" [ref=e15]:
            - img [ref=e16]
        - navigation [ref=e19]:
          - button "Dashboard" [ref=e20]:
            - img [ref=e21]
            - generic [ref=e24]: Dashboard
          - button "Pedidos" [ref=e25]:
            - img [ref=e26]
            - generic [ref=e29]: Pedidos
          - button "Mesas" [ref=e30]:
            - img [ref=e31]
            - generic [ref=e33]: Mesas
          - button "Delivery" [ref=e34]:
            - img [ref=e35]
            - generic [ref=e40]: Delivery
          - button "Clientes" [ref=e41]:
            - img [ref=e42]
            - generic [ref=e47]: Clientes
          - button "Productos" [ref=e48]:
            - img [ref=e49]
            - generic [ref=e53]: Productos
          - button "Proveedores" [ref=e54]:
            - img [ref=e55]
            - generic [ref=e60]: Proveedores
          - button "Cocina" [ref=e61]:
            - img [ref=e62]
            - generic [ref=e67]: Cocina
          - button "Caja" [ref=e68]:
            - img [ref=e69]
            - generic [ref=e72]: Caja
          - button "Usuarios" [ref=e73]:
            - img [ref=e74]
            - generic [ref=e78]: Usuarios
          - button "Configuraciones" [ref=e79]:
            - img [ref=e80]
            - generic [ref=e83]: Configuraciones
          - button "Reportes" [ref=e84]:
            - img [ref=e85]
            - generic [ref=e87]: Reportes
        - button "Cerrar sesión" [ref=e88]:
          - img [ref=e89]
          - generic [ref=e92]: Cerrar sesión
      - generic [ref=e93]:
        - generic [ref=e95]:
          - heading "Dashboard" [level=1] [ref=e97]
          - generic [ref=e99]:
            - button "Pantalla completa" [ref=e100]:
              - img [ref=e101]
            - button "Notificaciones" [ref=e108]:
              - img [ref=e109]
            - button "Perfil" [ref=e113]:
              - img [ref=e114]
        - generic [ref=e119]:
          - generic [ref=e120]:
            - article [ref=e121]:
              - generic [ref=e122]:
                - generic [ref=e123]: Ventas de Hoy
                - img [ref=e125]
              - generic [ref=e128]:
                - paragraph [ref=e129]: "5"
                - paragraph [ref=e130]: Pedidos completados hoy
            - article [ref=e132]:
              - generic [ref=e133]:
                - generic [ref=e134]: Ingresos de Hoy
                - img [ref=e136]
              - generic [ref=e138]:
                - paragraph [ref=e139]: C$ 1,760.00
                - paragraph [ref=e140]: "Efectivo en caja: C$ 1,760.00"
              - generic [ref=e142]:
                - generic [ref=e143]: Rendimiento
                - generic [ref=e144]: 4%
            - article [ref=e146]:
              - generic [ref=e147]:
                - generic [ref=e148]: Ticket Promedio
                - img [ref=e150]
              - generic [ref=e153]:
                - paragraph [ref=e154]: C$ 352.00
                - paragraph [ref=e155]: Gasto medio por cliente
            - article [ref=e157]:
              - generic [ref=e158]:
                - generic [ref=e159]: Ventas del Mes
                - img [ref=e161]
              - generic [ref=e164]:
                - paragraph [ref=e165]: C$ 1,760.00
                - paragraph [ref=e166]: Total acumulado este mes
              - generic [ref=e168]:
                - generic [ref=e169]: Rendimiento
                - generic [ref=e170]: 0%
          - generic [ref=e172]:
            - generic [ref=e173]:
              - generic [ref=e174]:
                - generic [ref=e175]:
                  - paragraph [ref=e176]: Rendimiento Comercial
                  - heading "Evolución de Ingresos" [level=2] [ref=e177]
                - generic [ref=e178]:
                  - button "Últimos 7 Días" [ref=e179]
                  - generic [ref=e180]: En vivo
              - application [ref=e184]:
                - generic [ref=e196]:
                  - generic [ref=e197]:
                    - generic [ref=e199]: 22/06
                    - generic [ref=e201]: 23/06
                    - generic [ref=e203]: 24/06
                    - generic [ref=e205]: 25/06
                    - generic [ref=e207]: 26/06
                    - generic [ref=e209]: 27/06
                    - generic [ref=e211]: 28/06
                  - generic [ref=e212]:
                    - generic [ref=e214]: "0"
                    - generic [ref=e216]: "450"
                    - generic [ref=e218]: "900"
                    - generic [ref=e220]: "1350"
                    - generic [ref=e222]: "1800"
              - generic [ref=e223]:
                - generic [ref=e224]: Historial semanal consolidado
                - generic [ref=e225]:
                  - text: "Total facturado: C$ 1,760.00"
                  - img [ref=e226]
            - generic [ref=e229]:
              - generic [ref=e230]:
                - paragraph [ref=e231]: Distribución Financiera
                - heading "Cierre de Caja Diario" [level=2] [ref=e232]
              - generic [ref=e234]:
                - img [ref=e235]
                - generic [ref=e238]:
                  - paragraph [ref=e239]: Caja total
                  - paragraph [ref=e240]: C$ 1,760.00
                  - paragraph [ref=e241]: 100% Efectivo
              - generic [ref=e242]:
                - generic [ref=e243]:
                  - generic [ref=e244]:
                    - img [ref=e246]
                    - generic [ref=e251]: Efectivo (Caja)
                  - generic [ref=e252]: C$ 1,760.00
                - generic [ref=e253]:
                  - generic [ref=e254]:
                    - img [ref=e256]
                    - generic [ref=e258]: Tarjeta / Banco
                  - generic [ref=e259]: C$ 0.00
          - generic [ref=e260]:
            - generic [ref=e261]:
              - generic [ref=e262]:
                - paragraph [ref=e263]: Productos Líderes
                - heading "Podio de Ventas 3D" [level=2] [ref=e264]
              - generic [ref=e265]:
                - generic [ref=e266]:
                  - generic:
                    - paragraph: Papas
                    - paragraph: C$ 210.00
                  - generic [ref=e267]: 🥈
                  - generic [ref=e269]:
                    - paragraph [ref=e270]: "#2"
                    - paragraph [ref=e271]: 3 U.
                - generic [ref=e272]:
                  - generic:
                    - paragraph: Hamburguesa de Res
                    - paragraph: C$ 1,200.00
                  - generic [ref=e273]: 🏆
                  - generic [ref=e275]:
                    - paragraph [ref=e276]: "#1"
                    - paragraph [ref=e277]: 6 U.
                - generic [ref=e278]:
                  - generic:
                    - paragraph: Batidos
                    - paragraph: C$ 200.00
                  - generic [ref=e279]: 🥉
                  - generic [ref=e281]:
                    - paragraph [ref=e282]: "#3"
                    - paragraph [ref=e283]: 2 U.
              - generic [ref=e284]:
                - generic [ref=e285]:
                  - generic [ref=e286]: 1º Hamburguesa de Res
                  - generic [ref=e287]: C$ 1,200.00
                - generic [ref=e288]:
                  - generic [ref=e289]: 2º Papas
                  - generic [ref=e290]: C$ 210.00
                - generic [ref=e291]:
                  - generic [ref=e292]: 3º Batidos
                  - generic [ref=e293]: C$ 200.00
            - generic [ref=e294]:
              - generic [ref=e295]:
                - paragraph [ref=e296]: Control de Inventario
                - generic [ref=e297]:
                  - heading "Smart Inventory Shield" [level=2] [ref=e298]
                  - generic [ref=e299]: Nivel Óptimo
              - generic [ref=e300]:
                - img [ref=e302]
                - generic [ref=e305]:
                  - paragraph [ref=e306]: Todo el inventario está seguro
                  - paragraph [ref=e307]: Nivel de insumos óptimo en cocina y bar.
              - generic [ref=e308]: Sincronizado con base de datos
  - generic [ref=e309]: "0"
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
> 62  |     expect(count).toBeGreaterThanOrEqual(1);
      |                   ^ Error: expect(received).toBeGreaterThanOrEqual(expected)
  63  |   });
  64  | });
  65  | 
  66  | test.describe("Roles y permisos del sistema", () => {
  67  |   test("Debería iniciar sesión como mesero y ver solo Mesas y Delivery", async ({ page }) => {
  68  |     await page.goto("/login");
  69  |     await page.fill('input[placeholder="ej. admin"]', "mesero1");
  70  |     await page.fill('input[placeholder="••••••••"]', "mesero1");
  71  |     await page.click('button[type="submit"]');
  72  |     await expect(page).toHaveURL(/.*app/);
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