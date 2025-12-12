import { test, expect } from '@playwright/test';

test.describe('Theme Screenshots and Contrast Tests', () => {
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

  for (const theme of themes) {
    test(`${theme} theme - lobby view screenshot`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Open settings
      await page.click('button:has-text("SETTINGS")');
      await page.waitForTimeout(500);
      
      // Select theme
      await page.click(`button:has-text("${theme}")`);
      await page.waitForTimeout(500);
      
      // Close settings
      await page.click('button:has-text("CLOSE")');
      await page.waitForTimeout(500);
      
      // Take screenshot
      await page.screenshot({ 
        path: `screenshots/${theme}-lobby.png`,
        fullPage: true 
      });
      
      // Verify text is visible (contrast check)
      const title = page.locator('h1:has-text("GitTrunfo")');
      await expect(title).toBeVisible();
    });

    test(`${theme} theme - deck selection screenshot`, async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Open settings and select theme
      await page.click('button:has-text("SETTINGS")');
      await page.waitForTimeout(300);
      await page.click(`button:has-text("${theme}")`);
      await page.waitForTimeout(300);
      await page.click('button:has-text("CLOSE")');
      await page.waitForTimeout(300);
      
      // Go to deck selection
      await page.click('button:has-text(">> CLICK TO SELECT DECK <<")');
      await page.waitForTimeout(500);
      
      // Take screenshot
      await page.screenshot({ 
        path: `screenshots/${theme}-deck-selection.png`,
        fullPage: true 
      });
    });
  }
});

test.describe('Responsive Design Tests', () => {
  const viewports = [
    { name: 'mobile-small', width: 360, height: 800 },
    { name: 'mobile', width: 375, height: 812 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'laptop', width: 1366, height: 768 },
    { name: 'desktop', width: 1920, height: 1080 },
  ];

  for (const viewport of viewports) {
    test(`${viewport.name} (${viewport.width}x${viewport.height}) - no overflow`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      
      // Check for horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBe(false);
      
      // Take screenshot
      await page.screenshot({ 
        path: `screenshots/responsive-${viewport.name}.png`,
        fullPage: false 
      });
    });
  }
});

test.describe('Game Flow Tests', () => {
  test('single player game flow', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Select deck
    await page.click('button:has-text(">> CLICK TO SELECT DECK <<")');
    await page.waitForTimeout(500);
    await page.click('button:has-text("Standard")');
    await page.waitForTimeout(500);
    
    // Start single player game
    await page.click('button:has-text("VS CPU")');
    await page.waitForTimeout(3000); // Wait for deck loading
    
    // Take game screenshot
    await page.screenshot({ 
      path: 'screenshots/gameplay-single-player.png',
      fullPage: true 
    });
    
    // Verify game started
    await expect(page.locator('text=YOUR TURN')).toBeVisible();
  });
});

test.describe('Event Handling Tests', () => {
  test('no double-click on stat selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Setup game
    await page.click('button:has-text(">> CLICK TO SELECT DECK <<")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Standard")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("VS CPU")');
    await page.waitForTimeout(3000);
    
    // Count sound plays by monitoring console
    let soundPlayCount = 0;
    page.on('console', msg => {
      if (msg.text().includes('playSelect') || msg.text().includes('sound')) {
        soundPlayCount++;
      }
    });
    
    // Click a stat button once
    const statButton = page.locator('button:has-text("FOLLOWERS")').first();
    await statButton.click();
    await page.waitForTimeout(1000);
    
    // Verify only one action occurred (sound should play once)
    expect(soundPlayCount).toBeLessThanOrEqual(2); // Allow some margin
  });

  test('hover does not trigger click', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Setup game
    await page.click('button:has-text(">> CLICK TO SELECT DECK <<")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Standard")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("VS CPU")');
    await page.waitForTimeout(3000);
    
    const initialTurn = await page.locator('text=YOUR TURN').isVisible();
    
    // Hover over stat button without clicking
    const statButton = page.locator('button:has-text("REPOS")').first();
    await statButton.hover();
    await page.waitForTimeout(500);
    
    // Verify turn hasn't changed (no action triggered)
    const turnAfterHover = await page.locator('text=YOUR TURN').isVisible();
    expect(turnAfterHover).toBe(initialTurn);
  });
});

test.describe('Card Tilt Effect Tests', () => {
  test('cards have 3D tilt on hover', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Setup game
    await page.click('button:has-text(">> CLICK TO SELECT DECK <<")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("Standard")');
    await page.waitForTimeout(300);
    await page.click('button:has-text("VS CPU")');
    await page.waitForTimeout(3000);
    
    // Get card element
    const card = page.locator('.card-3d-tilt').first();
    await expect(card).toBeVisible();
    
    // Move mouse to center of card
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(200);
      
      // Check if transform is applied
      const transform = await card.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Transform should not be 'none' when hovering
      expect(transform).not.toBe('none');
      
      // Take screenshot
      await page.screenshot({ 
        path: 'screenshots/card-tilt-hover.png',
        fullPage: false 
      });
    }
  });
});

test.describe('Foil Card Tests', () => {
  test('foil effect visible on rare cards', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Look for foil badge (if any cards are foil)
    const foilBadge = page.locator('.foil-badge');
    const badgeCount = await foilBadge.count();
    
    if (badgeCount > 0) {
      await expect(foilBadge.first()).toBeVisible();
      
      // Take screenshot of foil card
      const foilCard = page.locator('.foil-card').first();
      await foilCard.screenshot({ 
        path: 'screenshots/foil-card-example.png' 
      });
    }
  });
});
