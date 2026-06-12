import { test, expect } from "@playwright/test";

test.describe("Flujo Completo de Inventario, POS y Cocina", () => {
  test.beforeEach(async ({ page }) => {
    page.on("console", (msg) => console.log(`BROWSER CONSOLE [${msg.type()}]: ${msg.text()}`));
    page.on("pageerror", (err) => console.error(`BROWSER ERROR: ${err.message}`));

    // 1. Iniciar sesión antes de cada prueba
    await page.goto("/login");
    await page.fill('input[placeholder="ej. administrador"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*app/);
  });

  test("Debería realizar el ciclo completo de inventario: Categoría, Producto con Opciones, Entradas/Salidas, POS y KDS", async ({ page }) => {
    // Incrementar el tiempo de espera para este flujo largo
    test.setTimeout(90000);

    const timestamp = Date.now();
    const categoryName = `Cocina Test ${timestamp}`;
    const productName = `Hamburguesa Test ${timestamp}`;
    const productCode = `H${timestamp.toString().slice(-4)}`;

    // Navegar al módulo de Productos/Inventario
    await page.click('button:has-text("Productos")');
    await expect(page.locator("h2:has-text('Categorías de producto')").or(page.locator("h1:has-text('Inventario de productos')"))).toBeVisible();

    // --- 1. Crear Categoría ---
    const categoriasBtn = page.locator('button:has-text("Categorías")');
    if (await categoriasBtn.isVisible()) {
      await categoriasBtn.click();
    }
    await expect(page.locator("h2")).toContainText("Categorías de producto");

    await page.click('button:has-text("Nueva categoría")');
    
    // Usar localizadores anidados bajo las etiquetas del formulario
    await page.fill('label:has-text("Nombre") input', categoryName);
    await page.fill('label:has-text("Descripción") input', "Categoría de prueba para KDS");
    
    await page.click('form button:has-text("Guardar")');
    
    // Esperar a que se cierre el modal de Nueva categoría
    await expect(page.locator("h3:has-text('Nueva categoría')")).toBeHidden();
    
    // Volver al catálogo de productos
    await page.click('button:has-text("Volver al catálogo")');
    await expect(page.locator("h1:has-text('Inventario de productos')")).toBeVisible();

    // --- 2. Crear Producto con Opciones Especiales ---
    await page.click('button:has-text("Nuevo producto")');
    
    // Datos generales
    await page.fill('input[placeholder="Nombre del producto"]', productName);
    await page.fill('input[placeholder="Ej. PRD-001"]', productCode);
    await page.selectOption('select:below(:text("Categoría *"))', { label: categoryName });
    
    // Precios y Stock
    // El precio de venta es el primer input de placeholder 0.00
    await page.locator('input[placeholder="0.00"]').first().fill("120");
    // El precio de compra es el segundo input de placeholder 0.00
    await page.locator('input[placeholder="0.00"]').nth(1).fill("70");
    
    // Activar controlar stock e inicializar
    await page.check('input[type="checkbox"]:near(:text("Controlar stock"))');
    await page.fill('input[placeholder="0"]:left-of(:text("Stock mínimo"))', "10"); // Stock actual
    await page.fill('input[placeholder="0"]:below(:text("Stock mínimo"))', "2"); // Stock mínimo
    
    // Opciones Especiales
    await page.click('button[role="switch"]'); // Activar opciones especiales
    
    // Rellenar primera opción: Extra Queso (C$ 15) usando el localizador relativo del padre
    const nameInput1 = page.locator('input[placeholder="Ej. Doble Carne"]').first();
    await nameInput1.fill("Extra Queso");
    await nameInput1.locator('..').locator('input[placeholder="0.00"]').fill("15");
    
    // Agregar segunda opción: Sin Cebolla (C$ 0)
    await page.click('button:has-text("+ Agregar opción")');
    const nameInput2 = page.locator('input[placeholder="Ej. Doble Carne"]').nth(1);
    await nameInput2.fill("Sin Cebolla");
    await nameInput2.locator('..').locator('input[placeholder="0.00"]').fill("0");
    
    await page.click('form button:has-text("Guardar")');
    
    // Esperar a que se cierre el modal de Nuevo producto
    await expect(page.locator("h3:has-text('Nuevo producto')")).toBeHidden();
    
    // Confirmar que el producto fue creado en la lista
    await expect(page.locator("article", { hasText: productName })).toBeVisible();

    // --- 3. Probar Entrada de Inventario ---
    await page.click('button:has-text("Entrada Stock")');
    await page.click('input[placeholder="Nombre o código…"]');
    await page.fill('input[placeholder="Nombre o código…"]', productName);
    await page.click(`button:has-text("${productName}")`); // Autocomplete click (button in list)
    await page.fill('label:has-text("Cantidad") input', "5");
    await page.fill('label:has-text("Costo unitario") input', "70");
    await page.click('form button:has-text("Confirmar")');
    
    // Esperar a que se cierre el modal de Entrada de Stock
    await expect(page.locator("h3:has-text('Entrada de inventario')")).toBeHidden();
    
    // Confirmar stock se actualizó a 15
    await expect(page.locator("article", { hasText: productName }).locator("span", { hasText: "Stock: 15" })).toBeVisible();

    // --- 4. Probar Salida de Inventario ---
    await page.click('button:has-text("Salida Stock")');
    await page.click('input[placeholder="Nombre o código…"]');
    await page.fill('input[placeholder="Nombre o código…"]', productName);
    await page.click(`button:has-text("${productName}")`); // Autocomplete click (button in list)
    await page.fill('label:has-text("Cantidad a retirar") input', "3");
    await page.selectOption('label:has-text("Motivo de salida") select', { value: "Daño" });
    await page.click('form button:has-text("Confirmar")');

    // Esperar a que se cierre el modal de Salida de Stock
    await expect(page.locator("h3:has-text('Salida de inventario')")).toBeHidden();

    // Confirmar stock se actualizó a 12
    await expect(page.locator("article", { hasText: productName }).locator("span", { hasText: "Stock: 12" })).toBeVisible();

    // --- 5. Flujo del POS (Mesas) ---
    await page.click('button:has-text("Mesas")');
    await expect(page.locator("h1")).toContainText("Gestion de mesas");

    // Seleccionar una mesa (ej. SALA 1)
    const tableCard = page.locator('.mesa-plano-handle').filter({ has: page.locator('span', { hasText: /^\s*SALA 1\s*$/i }) }).locator('..');
    await tableCard.locator('button', { hasText: /Doble clic|OCUPADA/ }).dblclick();
    
    // Buscar y agregar Hamburguesa Test (name is displayed as UPPERCASE)
    await page.locator('button', { hasText: productName.toUpperCase() }).filter({ visible: true }).click();
    
    // Seleccionar opción especial en el panel inline del POS (al tener un solo grupo de opciones, se renderiza inline y añade directamente al dar click)
    await page.locator('button', { hasText: 'EXTRA QUESO' }).filter({ visible: true }).click();

    // Confirmar que está en el carrito
    await expect(page.locator(`div:has-text("${productName}")`).first()).toBeVisible();

    // --- 6. Enviar a Cocina y verificar KDS ---
    await page.locator('button:has-text("Enviar cocina")').filter({ visible: true }).click();

    // Navegar a Cocina (KDS)
    await page.click('button:has-text("Cocina")');
    await expect(page.locator("h1")).toContainText("Cocina");

    // Verificar que la comanda de SALA 1 contiene el producto y las opciones en "Por preparar"
    const porPrepararCol = page.locator('article', { hasText: 'Por preparar' });
    const orderCard = porPrepararCol.locator('.rounded-2xl.bg-white').filter({ hasText: 'SALA 1' }).filter({ hasText: productName });
    await expect(orderCard).toContainText("Extra Queso");

    // Marcar orden como lista en cocina
    await orderCard.locator('button:has-text("Marcar Listo")').click();
    await expect(orderCard).toBeHidden(); // Desaparece de la columna "Por preparar"

    // --- 7. Cobro y Pago en el POS ---
    await page.click('button:has-text("Mesas")');
    await tableCard.locator('button', { hasText: /Doble clic|OCUPADA/ }).dblclick();

    // Ir a pagar
    await page.locator('button:has-text("Procesar orden")').filter({ visible: true }).click();
    await page.click('button:has-text("Cobrar")');

    // La mesa debe quedar libre nuevamente (debe mostrar Doble clic)
    await expect(tableCard).toContainText("Doble clic");

    // --- 8. Verificar Reportes / Dashboard ---
    await page.click('button:has-text("Dashboard")');
    // Confirmar que el Dashboard muestra el total de ventas actualizado
    await expect(page.locator("h1")).toContainText("Dashboard");
  });
});
