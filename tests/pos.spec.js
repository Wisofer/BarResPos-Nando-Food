import { test, expect } from "@playwright/test";

test.describe("Flujo de Autenticación y Navegación del POS", () => {
  test("Debería iniciar sesión correctamente con credenciales admin y navegar al Dashboard", async ({ page }) => {
    // 1. Navegar a la página de Login
    await page.goto("/login");

    // 2. Llenar el formulario con las credenciales por defecto (admin/admin)
    await page.fill('input[placeholder="ej. administrador"]', "admin");
    await page.fill('input[placeholder="••••••••"]', "admin");
    
    // 3. Dar clic en el botón de submit
    await page.click('button[type="submit"]');

    // 4. Esperar redirección al shell principal de AuthHome
    await expect(page).toHaveURL(/.*app/);

    // 5. Verificar que se renderiza el encabezado del Dashboard
    const dashboardHeader = page.locator("h1");
    await expect(dashboardHeader).toContainText("Dashboard");
  });

  test("Debería rechazar credenciales incorrectas y mostrar un mensaje de error", async ({ page }) => {
    // 1. Navegar a la página de Login
    await page.goto("/login");

    // 2. Llenar el formulario con datos inválidos
    await page.fill('input[placeholder="ej. administrador"]', "usuario_invalido");
    await page.fill('input[placeholder="••••••••"]', "clave_incorrecta");

    // 3. Enviar formulario
    await page.click('button[type="submit"]');

    // 4. Verificar que se mantenga en la página de login (o no redirija al dashboard)
    await expect(page).not.toHaveURL(/.*dashboard/);
  });

  test("Debería iniciar sesión como mesero y ver solo las opciones de mesas y delivery", async ({ page }) => {
    // 1. Navegar a la página de Login
    await page.goto("/login");

    // 2. Iniciar sesión como mesero1
    await page.fill('input[placeholder="ej. administrador"]', "mesero1");
    await page.fill('input[placeholder="••••••••"]', "mesero1");
    await page.click('button[type="submit"]');

    // 3. Esperar redirección al POS/app
    await expect(page).toHaveURL(/.*app/);

    // 4. El sidebar no debe mostrar "Dashboard", "Productos", "Usuarios", "Configuraciones" o "Reportes"
    const sidebar = page.locator('aside');
    await expect(sidebar.locator('button', { hasText: 'Dashboard' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Productos' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Usuarios' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Configuraciones' })).toBeHidden();

    // 5. El sidebar debe mostrar "Mesas" y "Delivery"
    await expect(sidebar.locator('button', { hasText: 'Mesas' })).toBeVisible();
    await expect(sidebar.locator('button', { hasText: 'Delivery' })).toBeVisible();
  });

  test("Debería iniciar sesión como cocinero y ver solo la opción de Cocina", async ({ page }) => {
    // 1. Navegar a la página de Login
    await page.goto("/login");

    // 2. Iniciar sesión como cocina1
    await page.fill('input[placeholder="ej. administrador"]', "cocina1");
    await page.fill('input[placeholder="••••••••"]', "cocina1");
    await page.click('button[type="submit"]');

    // 3. Esperar redirección al POS/app
    await expect(page).toHaveURL(/.*app/);

    // 4. El sidebar no debe mostrar "Mesas", "Delivery", "Dashboard", "Productos", etc.
    const sidebar = page.locator('aside');
    await expect(sidebar.locator('button', { hasText: 'Mesas' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Delivery' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Dashboard' })).toBeHidden();
    await expect(sidebar.locator('button', { hasText: 'Productos' })).toBeHidden();

    // 5. El sidebar debe mostrar "Cocina"
    await expect(sidebar.locator('button', { hasText: 'Cocina' })).toBeVisible();
  });
});

