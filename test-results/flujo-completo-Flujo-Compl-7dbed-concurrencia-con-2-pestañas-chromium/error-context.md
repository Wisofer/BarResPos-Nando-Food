# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: flujo-completo.spec.js >> Flujo Completo Restaurante - Multi-mesero >> MeseroA y MeseroB: Simulación de concurrencia con 2 pestañas
- Location: tests\flujo-completo.spec.js:246:3

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.fill: Test timeout of 120000ms exceeded.
Call log:
  - waiting for locator('input[placeholder="••••••••"]')
    - locator resolved to <input value="" required="" type="password" placeholder="••••••••" class="w-full rounded-2xl border border-slate-200/80 bg-slate-50/60 py-3.5 pl-12 pr-12 text-slate-800 font-semibold placeholder:text-slate-400/80 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-100/50 transition-all duration-200"/>
    - fill("mesero1")
  - attempting fill action
    - waiting for element to be visible, enabled and editable
  - element was detached from the DOM, retrying

```

# Page snapshot

```yaml
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
        - button "Mesas" [ref=e20]:
          - img [ref=e21]
          - generic [ref=e23]: Mesas
        - button "Delivery" [ref=e24]:
          - img [ref=e25]
          - generic [ref=e30]: Delivery
      - button "Cerrar sesión" [ref=e31]:
        - img [ref=e32]
        - generic [ref=e35]: Cerrar sesión
    - generic [ref=e36]:
      - generic [ref=e38]:
        - heading "Gestion de mesas" [level=1] [ref=e40]
        - generic [ref=e42]:
          - button "Pantalla completa" [ref=e43]:
            - img [ref=e44]
          - button "Notificaciones" [ref=e51]:
            - img [ref=e52]
          - button "Perfil" [ref=e56]:
            - img [ref=e57]
      - generic [ref=e63]:
        - generic [ref=e65]:
          - generic [ref=e66]:
            - generic [ref=e69]: "Total: 20"
            - generic [ref=e72]: "Libres: 19"
            - generic [ref=e77]: "Ocupadas: 1"
            - generic [ref=e80]: "Reservadas: 0"
            - generic [ref=e85]: "Caja: Abierta"
          - generic [ref=e87]:
            - button "Zonas" [ref=e88]:
              - img [ref=e89]
              - text: Zonas
            - button "Plano" [ref=e94]:
              - img [ref=e95]
              - text: Plano
        - generic [ref=e97]:
          - generic [ref=e98]:
            - generic [ref=e99]: Barra
            - generic [ref=e100]:
              - article [ref=e101]:
                - generic [ref=e102]:
                  - paragraph [ref=e103]: Barra 1
                  - generic [ref=e104]: "1"
                - button "Mesa Barra 1" [ref=e105]:
                  - img "Mesa Barra 1" [ref=e106]
              - article [ref=e107]:
                - paragraph [ref=e109]: Barra 10
                - button "Mesa Barra 10" [ref=e110]:
                  - img "Mesa Barra 10" [ref=e111]
              - article [ref=e112]:
                - paragraph [ref=e114]: Barra 2
                - button "Mesa Barra 2" [ref=e115]:
                  - img "Mesa Barra 2" [ref=e116]
              - article [ref=e117]:
                - paragraph [ref=e119]: Barra 3
                - button "Mesa Barra 3" [ref=e120]:
                  - img "Mesa Barra 3" [ref=e121]
              - article [ref=e122]:
                - paragraph [ref=e124]: Barra 4
                - button "Mesa Barra 4" [ref=e125]:
                  - img "Mesa Barra 4" [ref=e126]
              - article [ref=e127]:
                - paragraph [ref=e129]: Barra 5
                - button "Mesa Barra 5" [ref=e130]:
                  - img "Mesa Barra 5" [ref=e131]
              - article [ref=e132]:
                - paragraph [ref=e134]: Barra 6
                - button "Mesa Barra 6" [ref=e135]:
                  - img "Mesa Barra 6" [ref=e136]
              - article [ref=e137]:
                - paragraph [ref=e139]: Barra 7
                - button "Mesa Barra 7" [ref=e140]:
                  - img "Mesa Barra 7" [ref=e141]
              - article [ref=e142]:
                - paragraph [ref=e144]: Barra 8
                - button "Mesa Barra 8" [ref=e145]:
                  - img "Mesa Barra 8" [ref=e146]
              - article [ref=e147]:
                - paragraph [ref=e149]: Barra 9
                - button "Mesa Barra 9" [ref=e150]:
                  - img "Mesa Barra 9" [ref=e151]
          - generic [ref=e152]:
            - generic [ref=e153]: Sala
            - generic [ref=e154]:
              - article [ref=e155]:
                - paragraph [ref=e157]: Sala 1
                - button "Mesa Sala 1" [ref=e158]:
                  - img "Mesa Sala 1" [ref=e159]
              - article [ref=e160]:
                - paragraph [ref=e162]: Sala 10
                - button "Mesa Sala 10" [ref=e163]:
                  - img "Mesa Sala 10" [ref=e164]
              - article [ref=e165]:
                - paragraph [ref=e167]: Sala 2
                - button "Mesa Sala 2" [ref=e168]:
                  - img "Mesa Sala 2" [ref=e169]
              - article [ref=e170]:
                - paragraph [ref=e172]: Sala 3
                - button "Mesa Sala 3" [ref=e173]:
                  - img "Mesa Sala 3" [ref=e174]
              - article [ref=e175]:
                - paragraph [ref=e177]: Sala 4
                - button "Mesa Sala 4" [ref=e178]:
                  - img "Mesa Sala 4" [ref=e179]
              - article [ref=e180]:
                - paragraph [ref=e182]: Sala 5
                - button "Mesa Sala 5" [ref=e183]:
                  - img "Mesa Sala 5" [ref=e184]
              - article [ref=e185]:
                - paragraph [ref=e187]: Sala 6
                - button "Mesa Sala 6" [ref=e188]:
                  - img "Mesa Sala 6" [ref=e189]
              - article [ref=e190]:
                - paragraph [ref=e192]: Sala 7
                - button "Mesa Sala 7" [ref=e193]:
                  - img "Mesa Sala 7" [ref=e194]
              - article [ref=e195]:
                - paragraph [ref=e197]: Sala 8
                - button "Mesa Sala 8" [ref=e198]:
                  - img "Mesa Sala 8" [ref=e199]
              - article [ref=e200]:
                - paragraph [ref=e202]: Sala 9
                - button "Mesa Sala 9" [ref=e203]:
                  - img "Mesa Sala 9" [ref=e204]
```

# Test source

```ts
  162 | 
  163 |       // Buscar botón para marcar como "Listo" en cada item
  164 |       const listoBtns = page.locator('button:has-text("Listo")');
  165 |       const btnCount = await listoBtns.count().catch(() => 0);
  166 |       if (btnCount > 0) {
  167 |         // Marcar algunos como Listo
  168 |         for (let i = 0; i < Math.min(btnCount, 3); i++) {
  169 |           await listoBtns.nth(0).click().catch(() => {});
  170 |           await page.waitForTimeout(500);
  171 |         }
  172 |         console.log(`   ${Math.min(btnCount, 3)} item(s) marcados como Listo`);
  173 |       }
  174 | 
  175 |       // También buscar botón "Atender" o "En preparación"
  176 |       const atenderBtns = page.locator('button:has-text("Atender")');
  177 |       const atenderCount = await atenderBtns.count().catch(() => 0);
  178 |       if (atenderCount > 0) {
  179 |         await atenderBtns.first().click().catch(() => {});
  180 |         await page.waitForTimeout(500);
  181 |         console.log("   Item marcado como 'En preparación'");
  182 |       }
  183 |     } else {
  184 |       console.log("   ℹ️ No hay items pendientes en cocina");
  185 |     }
  186 | 
  187 |     // Verificar vista de Historial
  188 |     const historialBtn = page.locator('button:has-text("Historial")');
  189 |     if (await historialBtn.isVisible().catch(() => false)) {
  190 |       await historialBtn.click();
  191 |       await page.waitForTimeout(1000);
  192 |       await expect(page.locator("text=Historial").first()).toBeVisible({ timeout: 3000 }).catch(() => {});
  193 |       console.log("   Vista de historial funciona");
  194 |     }
  195 |   });
  196 | 
  197 |   test("Admin: Verificar Dashboard después de operaciones", async ({ page }) => {
  198 |     test.setTimeout(60000);
  199 | 
  200 |     await page.goto("/login");
  201 |     await page.fill('input[placeholder="ej. admin"]', "admin");
  202 |     await page.fill('input[placeholder="••••••••"]', "admin");
  203 |     await page.click('button[type="submit"]');
  204 |     await expect(page).toHaveURL(/.*app/);
  205 | 
  206 |     // Ver Dashboard
  207 |     await expect(page.locator("h1")).toContainText("Dashboard", { timeout: 5000 });
  208 |     await page.waitForTimeout(2000);
  209 | 
  210 |     // Verificar que las tarjetas de estadísticas están visibles
  211 |     const statCards = page.locator("article");
  212 |     await statCards.first().waitFor({ state: "visible", timeout: 10000 }).catch(() => {});
  213 |     const count = await statCards.count().catch(() => 0);
  214 |     expect(count).toBeGreaterThanOrEqual(1);
  215 |     console.log(`   Dashboard: ${count} tarjeta(s) de estadísticas visibles`);
  216 |   });
  217 | 
  218 |   test("Cajero: Ver flujo de caja - estado y cierre", async ({ page }) => {
  219 |     test.setTimeout(60000);
  220 | 
  221 |     await page.goto("/login");
  222 |     await page.fill('input[placeholder="ej. admin"]', "admin");
  223 |     await page.fill('input[placeholder="••••••••"]', "admin");
  224 |     await page.click('button[type="submit"]');
  225 |     await expect(page).toHaveURL(/.*app/);
  226 | 
  227 |     // Ir a Caja
  228 |     await page.click('button:has-text("Caja")');
  229 |     await expect(page.locator("h1")).toContainText("Caja", { timeout: 5000 });
  230 | 
  231 |     await page.waitForTimeout(2000);
  232 | 
  233 |     // Ver estado actual de caja
  234 |     const estadoSection = page.locator("text=/Caja|Apertura|Cierre|Estado|Abierto|Abierta/i");
  235 |     await expect(estadoSection.first()).toBeVisible({ timeout: 5000 }).catch(() => {
  236 |       console.log("   ⚠️ Sección de estado de caja no visible");
  237 |     });
  238 | 
  239 |     // Verificar órdenes pendientes si existe
  240 |     const pendientesSection = page.locator("text=/Pendientes|Ordenes/i");
  241 |     if (await pendientesSection.first().isVisible().catch(() => false)) {
  242 |       console.log("   Vista de órdenes pendientes visible");
  243 |     }
  244 |   });
  245 | 
  246 |   test("MeseroA y MeseroB: Simulación de concurrencia con 2 pestañas", async ({ page, context }) => {
  247 |     test.setTimeout(120000);
  248 | 
  249 |     // Abrir una segunda página (nueva pestaña) para el segundo mesero
  250 |     const page2 = await context.newPage();
  251 | 
  252 |     // Login meseroA en page1
  253 |     await page.goto("/login");
  254 |     await page.fill('input[placeholder="ej. admin"]', "mesero1");
  255 |     await page.fill('input[placeholder="••••••••"]', "mesero1");
  256 |     await page.click('button[type="submit"]');
  257 |     await expect(page).toHaveURL(/.*app/);
  258 | 
  259 |     // Login mesero1 (mismo usuario) en page2 - testing concurrent access
  260 |     await page2.goto("/login");
  261 |     await page2.fill('input[placeholder="ej. admin"]', "mesero1");
> 262 |     await page2.fill('input[placeholder="••••••••"]', "mesero1");
      |                 ^ Error: page.fill: Test timeout of 120000ms exceeded.
  263 |     await page2.click('button[type="submit"]');
  264 |     await expect(page2).toHaveURL(/.*app/);
  265 | 
  266 |     // Ambos navegan a Mesas
  267 |     await page.click('button:has-text("Mesas")');
  268 |     await page2.click('button:has-text("Mesas")');
  269 | 
  270 |     // Verificar que ambos ven el plano de mesas sin errores
  271 |     await expect(page.locator("h1")).toContainText("Gestion de mesas", { timeout: 5000 });
  272 |     await expect(page2.locator("h1")).toContainText("Gestion de mesas", { timeout: 5000 });
  273 |     console.log("   Ambos meseros accedieron a Mesas simultáneamente sin errores");
  274 | 
  275 |     // Verificar que no hay errores 5xx en ninguna de las dos páginas
  276 |     const pageErrors1 = [];
  277 |     const pageErrors2 = [];
  278 |     page.on("response", async (res) => {
  279 |       if (res.status() >= 500) pageErrors1.push(`${res.status()} ${res.url()}`);
  280 |     });
  281 |     page2.on("response", async (res) => {
  282 |       if (res.status() >= 500) pageErrors2.push(`${res.status()} ${res.url()}`);
  283 |     });
  284 | 
  285 |     await page.waitForTimeout(3000);
  286 |     await page2.waitForTimeout(3000);
  287 | 
  288 |     if (pageErrors1.length === 0 && pageErrors2.length === 0) {
  289 |       console.log("   ✅ Sin errores HTTP 5xx en acceso concurrente");
  290 |     } else {
  291 |       console.log(`   ⚠️ Errores detectados - P1: ${pageErrors1.length}, P2: ${pageErrors2.length}`);
  292 |     }
  293 | 
  294 |     await page2.close();
  295 |   });
  296 | });
  297 | 
```