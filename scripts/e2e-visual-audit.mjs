import { chromium } from "playwright";
import { login, openModule } from "./playwright-helpers.mjs";
import path from "path";

const baseUrl = "http://localhost:5173";
const artifactsDir = "C:/Users/william/.gemini/antigravity-ide/brain/bb0a9afe-e4fd-4906-8c0d-40f7e6d6cc36";

async function runAudit() {
  console.log("Iniciando auditoría visual automatizada...");
  
  let browser;
  try {
    console.log("Intentando lanzar con canal de Chrome del sistema...");
    browser = await chromium.launch({ headless: true, channel: "chrome" });
  } catch (errChrome) {
    console.log("No se pudo iniciar con Chrome del sistema. Intentando con Edge del sistema...");
    try {
      browser = await chromium.launch({ headless: true, channel: "msedge" });
    } catch (errEdge) {
      console.log("No se pudo iniciar con Edge. Intentando lanzamiento estándar de Playwright...");
      browser = await chromium.launch({ headless: true });
    }
  }
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  try {
    // 1. Ir a la página de login
    console.log("Navegando a la página de login...");
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForTimeout(2000);
    const loginPath = path.join(artifactsDir, "audit_1_login.png");
    await page.screenshot({ path: loginPath });
    console.log(`Capturada pantalla de login en: ${loginPath}`);

    // 2. Iniciar sesión
    console.log("Iniciando sesión con admin/admin...");
    await login(page, "admin", "admin");
    await page.waitForTimeout(3000);
    
    // 3. Capturar Dashboard
    console.log("Navegando a Dashboard...");
    await openModule(page, "Dashboard");
    await page.waitForTimeout(3000);
    const dashboardPath = path.join(artifactsDir, "audit_2_dashboard.png");
    await page.screenshot({ path: dashboardPath });
    console.log(`Capturada pantalla de Dashboard en: ${dashboardPath}`);

    // 4. Navegar a Delivery
    console.log("Navegando a Delivery...");
    await openModule(page, "Delivery");
    await page.waitForTimeout(3000);
    const deliveryPath = path.join(artifactsDir, "audit_3_delivery.png");
    await page.screenshot({ path: deliveryPath });
    console.log(`Capturada pantalla de Delivery en: ${deliveryPath}`);

    // 5. Ver detalle del pedido (primer botón de ojo / detalle)
    console.log("Abriendo detalle de pedido...");
    const eyeBtn = page.locator('button[title*="detalle" i], button:has(svg)').first();
    const hasDetailButton = (await page.getByRole("button", { name: /ver detalle/i }).count()) > 0 || (await page.locator('button[title="Ver detalle"]').count()) > 0;
    
    if (hasDetailButton || (await eyeBtn.count()) > 0) {
      const btn = (await page.locator('button[title="Ver detalle"]').count()) > 0
        ? page.locator('button[title="Ver detalle"]').first()
        : eyeBtn;
      
      await btn.click();
      await page.waitForTimeout(2000);
      const detailPath = path.join(artifactsDir, "audit_4_delivery_detail.png");
      await page.screenshot({ path: detailPath });
      console.log(`Capturada pantalla de detalle de pedido en: ${detailPath}`);
      
      // Cerrar detalle
      console.log("Cerrando modal de detalle...");
      const volverBtn = page.getByRole("button", { name: /volver/i }).first();
      if ((await volverBtn.count()) > 0) {
        await volverBtn.click();
      } else {
        await page.keyboard.press("Escape").catch(() => {});
      }
      await page.waitForTimeout(1000);
    } else {
      console.log("ADVERTENCIA: No se encontró botón para ver detalle. Quizás no hay pedidos de delivery en la lista.");
    }

    // 6. Navegar a Configuraciones
    console.log("Navegando a Configuraciones...");
    await openModule(page, "Configuraciones");
    await page.waitForTimeout(3000);
    
    // Si hay pestañas, intentar buscar la de WhatsApp o scroll para ver el panel
    console.log("Buscando sección de WhatsApp en configuración...");
    const whatsappTab = page.getByRole("button", { name: /whatsapp|plantillas/i }).first();
    if ((await whatsappTab.count()) > 0) {
      await whatsappTab.click();
      await page.waitForTimeout(1500);
    }
    
    const settingsPath = path.join(artifactsDir, "audit_5_settings.png");
    await page.screenshot({ path: settingsPath });
    console.log(`Capturada pantalla de Configuraciones en: ${settingsPath}`);

    // 7. Abrir editor de plantilla
    console.log("Abriendo editor de plantilla de WhatsApp...");
    const editBtn = page.getByRole("button", { name: /editar/i }).first();
    if ((await editBtn.count()) > 0) {
      await editBtn.click();
      await page.waitForTimeout(1500);
      const editorPath = path.join(artifactsDir, "audit_6_template_editor.png");
      await page.screenshot({ path: editorPath });
      console.log(`Capturada pantalla de editor de plantilla en: ${editorPath}`);
    }

  } catch (error) {
    console.error("Error durante la auditoría visual:", error);
  } finally {
    await browser.close();
    console.log("Auditoría visual finalizada.");
  }
}

runAudit();
