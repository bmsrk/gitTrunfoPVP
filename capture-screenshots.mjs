import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const themes = [
  'cyberpunk',
  'snes',
  'dreamcast',
  'n64',
  'psx',
  'xbox',
  'winxp',
  'pc98'
];

const screenshotsDir = join(__dirname, 'screenshots');
if (!existsSync(screenshotsDir)) {
  mkdirSync(screenshotsDir, { recursive: true });
}

async function captureScreenshots() {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  try {
    // Navigate to the built app
    const distPath = join(__dirname, 'dist', 'index.html');
    console.log(`Opening: file://${distPath}`);
    await page.goto(`file://${distPath}`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    for (const theme of themes) {
      console.log(`\nCapturing ${theme} theme...`);
      
      // Open settings
      const settingsBtn = await page.locator('button:has-text("SETTINGS")').first();
      if (await settingsBtn.isVisible()) {
        await settingsBtn.click();
        await page.waitForTimeout(500);
        
        // Select theme
        const themeBtn = await page.locator(`button:has-text("${theme}")`).first();
        if (await themeBtn.isVisible()) {
          await themeBtn.click();
          await page.waitForTimeout(500);
        }
        
        // Close settings
        const closeBtn = await page.locator('button:has-text("CLOSE")').first();
        if (await closeBtn.isVisible()) {
          await closeBtn.click();
          await page.waitForTimeout(500);
        }
      }
      
      // Take lobby screenshot
      console.log(`  - Capturing ${theme} lobby...`);
      await page.screenshot({
        path: join(screenshotsDir, `${theme}-lobby.png`),
        fullPage: false,
      });

      // Go to deck selection
      const deckBtn = await page.locator('button:has-text(">> CLICK TO SELECT DECK <<")').first();
      if (await deckBtn.isVisible()) {
        await deckBtn.click();
        await page.waitForTimeout(1000);
        
        // Take deck selection screenshot
        console.log(`  - Capturing ${theme} deck selection...`);
        await page.screenshot({
          path: join(screenshotsDir, `${theme}-deck-selection.png`),
          fullPage: false,
        });
        
        // Go back to lobby
        const backBtn = await page.locator('button[title="Back to Lobby"]').first();
        if (await backBtn.isVisible()) {
          await backBtn.click();
          await page.waitForTimeout(500);
        }
      }
    }

    // Capture responsive views
    console.log('\nCapturing responsive views...');
    const viewports = [
      { name: 'mobile', width: 375, height: 812 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ];

    for (const vp of viewports) {
      console.log(`  - Capturing ${vp.name} (${vp.width}x${vp.height})...`);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(500);
      
      await page.screenshot({
        path: join(screenshotsDir, `responsive-${vp.name}.png`),
        fullPage: false,
      });
    }

    console.log('\n✓ All screenshots captured successfully!');
    console.log(`Screenshots saved to: ${screenshotsDir}`);
    
  } catch (error) {
    console.error('Error capturing screenshots:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

captureScreenshots().catch(console.error);
