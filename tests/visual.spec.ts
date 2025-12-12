import { test, expect } from '@playwright/test';
import { 
  goToLobby, 
  goToDeckSelection, 
  applyTheme, 
  THEMES, 
  VIEWPORTS,
  setViewport,
  hasHorizontalScroll,
  type Theme
} from './helpers';

test.describe('Theme Visual Tests', () => {
  /**
   * Test theme rendering in lobby view
   * Takes a screenshot to verify visual appearance
   */
  async function testThemeLobby(page: any, theme: Theme) {
    await goToLobby(page);
    await applyTheme(page, theme);
    
    // Take screenshot
    await page.screenshot({ 
      path: `screenshots/${theme}-lobby.png`,
      fullPage: true 
    });
    
    // Verify key elements are visible (basic contrast check)
    await expect(page.locator('h1:has-text("GitTrunfo")')).toBeVisible();
    await expect(page.locator('button:has-text("SETTINGS")')).toBeVisible();
  }

  /**
   * Test theme rendering in deck selection view
   * Takes a screenshot to verify visual appearance
   */
  async function testThemeDeckSelection(page: any, theme: Theme) {
    await goToLobby(page);
    await applyTheme(page, theme);
    await goToDeckSelection(page);
    
    // Take screenshot
    await page.screenshot({ 
      path: `screenshots/${theme}-deck-selection.png`,
      fullPage: true 
    });
    
    // Verify deck options are visible
    await expect(page.locator('button:has-text("Standard")')).toBeVisible();
  }

  // Generate tests for each theme
  for (const theme of THEMES) {
    test(`${theme} theme - lobby view`, async ({ page }) => {
      await testThemeLobby(page, theme);
    });

    test(`${theme} theme - deck selection view`, async ({ page }) => {
      await testThemeDeckSelection(page, theme);
    });
  }
});

test.describe('Responsive Design Tests', () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name} (${viewport.width}x${viewport.height}) - no horizontal overflow`, async ({ page }) => {
      await setViewport(page, viewport.width, viewport.height);
      await goToLobby(page);
      
      // Check for horizontal scroll
      const hasOverflow = await hasHorizontalScroll(page);
      expect(hasOverflow).toBe(false);
      
      // Take screenshot for visual verification
      await page.screenshot({ 
        path: `screenshots/responsive-${viewport.name}.png`,
        fullPage: false 
      });
      
      // Verify key elements are still visible at this viewport
      await expect(page.locator('h1:has-text("GitTrunfo")')).toBeVisible();
    });
  }

  test('mobile viewport - deck selection is accessible', async ({ page }) => {
    await setViewport(page, 375, 812);
    await goToLobby(page);
    await goToDeckSelection(page);
    
    // Verify all deck buttons are accessible (not cut off)
    await expect(page.locator('button:has-text("Standard")')).toBeVisible();
    await expect(page.locator('button:has-text("Web Technologies")')).toBeVisible();
    
    const hasOverflow = await hasHorizontalScroll(page);
    expect(hasOverflow).toBe(false);
  });

  test('tablet viewport - full game layout', async ({ page }) => {
    await setViewport(page, 768, 1024);
    await goToLobby(page);
    await goToDeckSelection(page);
    
    // Take screenshot of deck selection on tablet
    await page.screenshot({ 
      path: 'screenshots/tablet-deck-selection.png',
      fullPage: false 
    });
    
    const hasOverflow = await hasHorizontalScroll(page);
    expect(hasOverflow).toBe(false);
  });
});
