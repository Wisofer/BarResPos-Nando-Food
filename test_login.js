import { chromium } from "playwright";

async function run() {
  console.log("Starting browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Escuchar logs de consola del navegador
  page.on("console", (msg) => {
    console.log(`[BROWSER CONSOLE] ${msg.type()}: ${msg.text()}`);
  });

  page.on("pageerror", (err) => {
    console.log(`[BROWSER ERROR] ${err.message}`);
  });

  // Log de red completo
  page.on("request", (req) => {
    console.log(`[NETWORK REQ] ${req.method()} ${req.url()}`);
  });

  page.on("response", async (res) => {
    console.log(`[NETWORK RES] ${res.status()} ${res.url()}`);
    if (res.url().includes("/login") || res.url().includes("/auth")) {
      try {
        const text = await res.text();
        console.log(`[NETWORK RES BODY] ${text.slice(0, 500)}`);
      } catch (e) {
        console.log(`[NETWORK RES BODY ERROR] Could not read body: ${e.message}`);
      }
    }
  });

  try {
    console.log("Navigating to http://localhost:5000/#/login...");
    await page.goto("http://localhost:5000/#/login");
    await page.waitForLoadState("networkidle");

    console.log("Filling login credentials...");
    await page.fill('input[placeholder*="admin"]', "admin");
    await page.fill('input[type="password"]', "admin");

    // Esperar un momento para asegurar enlace de estado en React
    await page.waitForTimeout(500);

    console.log("Clicking 'Entrar al sistema'...");
    await page.click('button:text("Entrar al sistema")');

    console.log("Waiting 5 seconds for redirection...");
    await page.waitForTimeout(5000);

    const url = page.url();
    console.log(`Current page URL: ${url}`);

    const screenshotPath = "/home/william/.gemini/antigravity/brain/30d49ac8-e890-46f8-8b05-c97ea534fd1b/scratch/login_result.png";
    await page.screenshot({ path: screenshotPath });
    console.log(`Screenshot saved to: ${screenshotPath}`);

  } catch (error) {
    console.error("Test execution failed:", error);
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

run();
