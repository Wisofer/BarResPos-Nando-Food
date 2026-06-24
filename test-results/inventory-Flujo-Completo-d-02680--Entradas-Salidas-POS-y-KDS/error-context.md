# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: inventory.spec.js >> Flujo Completo de Inventario, POS y Cocina >> Debería realizar el ciclo completo de inventario: Categoría, Producto con Opciones, Entradas/Salidas, POS y KDS
- Location: inventory.spec.js:24:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/login", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test.describe("Flujo Completo de Inventario, POS y Cocina", () => {
  4   |   test.beforeEach(async ({ page }) => {
  5   |     page.on("console", (msg) => console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`));
  6   |     page.on("pageerror", (err) => console.error(`BROWSER ERROR: ${err.message}`));
  7   |     page.on("response", async (res) => {
  8   |       if (res.status() >= 400) {
  9   |         console.log(`HTTP ERROR: ${res.status()} ${res.url()}`);
  10  |         try {
  11  |           console.log(`RESPONSE BODY: ${await res.text()}`);
  12  |         } catch {}
  13  |       }
  14  |     });
  15  | 
  16  |     // 1. Iniciar sesión antes de cada prueba
> 17  |     await page.goto("/login");
      |                ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  18  |     await page.fill('input[placeholder="ej. admin"]', "admin");
  19  |     await page.fill('input[placeholder="••••••••"]', "admin");
  20  |     await page.click('button[type="submit"]');
  21  |     await expect(page).toHaveURL(/.*app/);
  22  |   });
  23  | 
  24  |   test("Debería realizar el ciclo completo de inventario: Categoría, Producto con Opciones, Entradas/Salidas, POS y KDS", async ({ page }) => {
  25  |     // Incrementar el tiempo de espera para este flujo largo
  26  |     test.setTimeout(90000);
  27  | 
  28  |     const timestamp = Date.now();
  29  |     const categoryName = `Cocina Test ${timestamp}`;
  30  |     const productName = `Hamburguesa Test ${timestamp}`;
  31  |     const productCode = `H${timestamp.toString().slice(-4)}`;
  32  | 
  33  |     // Navegar al módulo de Productos/Inventario
  34  |     await page.click('button:has-text("Productos")');
  35  |     await expect(page.locator("h2:has-text('Categorías de producto')").or(page.locator("h1:has-text('Inventario de productos')"))).toBeVisible();
  36  | 
  37  |     // --- 1. Crear Categoría ---
  38  |     const categoriasBtn = page.locator('button:has-text("Categorías")');
  39  |     if (await categoriasBtn.isVisible()) {
  40  |       await categoriasBtn.click();
  41  |     }
  42  |     await expect(page.locator("h2")).toContainText("Categorías de producto");
  43  | 
  44  |     await page.click('button:has-text("Nueva categoría")');
  45  |     
  46  |     // Usar localizadores anidados bajo las etiquetas del formulario
  47  |     await page.fill('label:has-text("Nombre") input', categoryName);
  48  |     await page.fill('label:has-text("Descripción") input', "Categoría de prueba para KDS");
  49  |     
  50  |     await page.click('form button:has-text("Guardar")');
  51  |     
  52  |     // Esperar a que se cierre el modal de Nueva categoría
  53  |     await expect(page.locator("h3:has-text('Nueva categoría')")).toBeHidden();
  54  |     
  55  |     // Volver al catálogo de productos
  56  |     await page.click('button:has-text("Volver al catálogo")');
  57  |     await expect(page.locator("h1:has-text('Inventario de productos')")).toBeVisible();
  58  | 
  59  |     // --- 2. Crear Producto con Opciones Especiales ---
  60  |     await page.click('button:has-text("Nuevo producto")');
  61  |     
  62  |     // Datos generales
  63  |     await page.fill('input[placeholder="Nombre del producto"]', productName);
  64  |     await page.fill('input[placeholder="Ej. PRD-001"]', productCode);
  65  |     await page.selectOption('select:below(:text("Categoría *"))', { label: categoryName });
  66  |     
  67  |     // Precios y Stock
  68  |     // El precio de venta es el primer input de placeholder 0.00
  69  |     await page.locator('input[placeholder="0.00"]').first().fill("120");
  70  |     // El precio de compra es el segundo input de placeholder 0.00
  71  |     await page.locator('input[placeholder="0.00"]').nth(1).fill("70");
  72  |     
  73  |     // Activar controlar stock e inicializar
  74  |     await page.check('input[type="checkbox"]:near(:text("Controlar stock"))');
  75  |     await page.fill('input[placeholder="0"]:left-of(:text("Stock mínimo"))', "10"); // Stock actual
  76  |     await page.fill('input[placeholder="0"]:below(:text("Stock mínimo"))', "2"); // Stock mínimo
  77  |     
  78  |     // Opciones Especiales
  79  |     await page.click('button[role="switch"]'); // Activar opciones especiales
  80  |     
  81  |     // Rellenar primera opción: Extra Queso (C$ 15) usando el localizador relativo del padre
  82  |     const nameInput1 = page.locator('input[placeholder="Ej. Doble Carne"]').first();
  83  |     await nameInput1.fill("Extra Queso");
  84  |     await nameInput1.locator('..').locator('input[placeholder="0.00"]').fill("15");
  85  |     
  86  |     // Agregar segunda opción: Sin Cebolla (C$ 0)
  87  |     await page.click('button:has-text("+ Agregar opción")');
  88  |     const nameInput2 = page.locator('input[placeholder="Ej. Doble Carne"]').nth(1);
  89  |     await nameInput2.fill("Sin Cebolla");
  90  |     await nameInput2.locator('..').locator('input[placeholder="0.00"]').fill("0");
  91  |     
  92  |     await page.click('form button:has-text("Guardar")');
  93  |     
  94  |     // Esperar a que se cierre el modal de Nuevo producto
  95  |     await expect(page.locator("h3:has-text('Nuevo producto')")).toBeHidden();
  96  |     
  97  |     // Confirmar que el producto fue creado en la lista
  98  |     await expect(page.locator("article", { hasText: productName })).toBeVisible();
  99  | 
  100 |     // --- 3. Probar Entrada de Inventario ---
  101 |     await page.click('button:has-text("Entrada Stock")');
  102 |     await page.click('input[placeholder="Nombre o código…"]');
  103 |     await page.fill('input[placeholder="Nombre o código…"]', productName);
  104 |     await page.click(`button:has-text("${productName}")`); // Autocomplete click (button in list)
  105 |     await page.fill('label:has-text("Cantidad") input', "5");
  106 |     await page.fill('label:has-text("Costo unitario") input', "70");
  107 |     await page.click('form button:has-text("Confirmar")');
  108 |     
  109 |     // Esperar a que se cierre el modal de Entrada de Stock
  110 |     await expect(page.locator("h3:has-text('Entrada de inventario')")).toBeHidden();
  111 |     
  112 |     // Confirmar stock se actualizó a 15
  113 |     await expect(page.locator("article", { hasText: productName }).locator("span", { hasText: "Stock: 15" })).toBeVisible();
  114 | 
  115 |     // --- 4. Probar Salida de Inventario ---
  116 |     await page.click('button:has-text("Salida Stock")');
  117 |     await page.click('input[placeholder="Nombre o código…"]');
```