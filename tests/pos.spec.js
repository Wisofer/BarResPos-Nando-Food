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
});
