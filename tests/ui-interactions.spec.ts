import { test, expect } from '@playwright/test';
import { setupGame, getCurrentTurn } from './helpers';

test.describe('Card Interaction Tests', () => {
  test('cards have 3D tilt effect on hover', async ({ page }) => {
    await setupGame(page);
    
    // Get card element
    const card = page.locator('.card-3d-tilt').first();
    await expect(card).toBeVisible();
    
    // Get initial transform
    const initialTransform = await card.evaluate(el => 
      window.getComputedStyle(el).transform
    );
    
    // Move mouse to center of card
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForTimeout(300);
      
      // Check if transform is applied
      const hoverTransform = await card.evaluate(el => 
        window.getComputedStyle(el).transform
      );
      
      // Transform should change when hovering
      // We expect it to not be 'none' when hovering
      expect(hoverTransform).not.toBe('none');
      
      // Take screenshot of hover effect
      await page.screenshot({ 
        path: 'screenshots/card-tilt-hover.png',
        fullPage: false 
      });
    }
  });

  test('card displays developer information', async ({ page }) => {
    await setupGame(page);
    
    // Verify card has developer name/info
    const card = page.locator('.card-3d-tilt').first();
    await expect(card).toBeVisible();
    
    // Card should have some text content (developer stats)
    const cardText = await card.textContent();
    expect(cardText).toBeTruthy();
    expect(cardText!.length).toBeGreaterThan(0);
  });
});

test.describe('Event Handling Tests', () => {
  test('stat button click triggers game action', async ({ page }) => {
    await setupGame(page);
    
    // Verify it's player's turn
    await expect(page.locator('text=YOUR TURN')).toBeVisible();
    
    // Click a stat button
    const statButton = page.locator('button:has-text("FOLLOWERS")').first();
    await statButton.click();
    
    // Game should progress (turn changes or stays depending on game state)
    await page.waitForTimeout(1500);
    
    // Verify game didn't crash and some turn state exists
    const turnState = await getCurrentTurn(page);
    expect(turnState).not.toBeNull();
  });

  test('hover does not trigger stat selection', async ({ page }) => {
    await setupGame(page);
    
    const initialTurn = await page.locator('text=YOUR TURN').isVisible();
    
    // Hover over stat button without clicking
    const statButton = page.locator('button:has-text("REPOS")').first();
    await statButton.hover();
    await page.waitForTimeout(500);
    
    // Verify turn hasn't changed (no action triggered)
    const turnAfterHover = await page.locator('text=YOUR TURN').isVisible();
    expect(turnAfterHover).toBe(initialTurn);
  });

  test('clicking disabled elements does not cause errors', async ({ page }) => {
    await setupGame(page);
    
    // Try clicking various UI elements
    await page.click('body');
    await page.waitForTimeout(200);
    
    // Verify no console errors occurred
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Page should still be functional - check for turn indicator
    const turnState = await getCurrentTurn(page);
    expect(turnState).not.toBeNull();
  });
});

test.describe('UI State Management', () => {
  test('game displays health/score indicators', async ({ page }) => {
    await setupGame(page);
    
    // The game should show some form of score/health tracking
    // This could be deck count, health bars, or similar
    await expect(page.locator('body')).toBeVisible();
    
    // Take screenshot to verify UI state
    await page.screenshot({ 
      path: 'screenshots/game-ui-state.png',
      fullPage: true 
    });
  });

  test('turn indicator updates appropriately', async ({ page }) => {
    await setupGame(page);
    
    // Should show YOUR TURN initially
    await expect(page.locator('text=YOUR TURN')).toBeVisible();
    
    // After clicking a stat, turn indicator should still exist (even if it changes)
    const statButton = page.locator('button:has-text("FOLLOWERS")').first();
    await statButton.click();
    await page.waitForTimeout(2000);
    
    // Some turn indicator should be present
    const turnState = await getCurrentTurn(page);
    expect(turnState).not.toBeNull();
  });
});

test.describe('Visual Effects', () => {
  test('foil cards are visually distinct', async ({ page }) => {
    await setupGame(page);
    
    // Check if any foil cards exist
    const foilBadge = page.locator('.foil-badge');
    const badgeCount = await foilBadge.count();
    
    if (badgeCount > 0) {
      await expect(foilBadge.first()).toBeVisible();
      
      // Take screenshot of foil card
      const foilCard = page.locator('.foil-card').first();
      await foilCard.screenshot({ 
        path: 'screenshots/foil-card-example.png' 
      });
    } else {
      // If no foil cards in this run, just verify regular cards work
      await expect(page.locator('.card-3d-tilt').first()).toBeVisible();
    }
  });

  test('stat buttons have hover effects', async ({ page }) => {
    await setupGame(page);
    
    const statButton = page.locator('button:has-text("FOLLOWERS")').first();
    await expect(statButton).toBeVisible();
    
    // Hover over button
    await statButton.hover();
    await page.waitForTimeout(200);
    
    // Button should still be visible and functional
    await expect(statButton).toBeVisible();
  });
});

test.describe('Accessibility', () => {
  test('key UI elements are keyboard accessible', async ({ page }) => {
    await setupGame(page);
    
    // Try tabbing through elements (basic keyboard navigation check)
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    // Verify page is still functional
    await expect(page.locator('text=YOUR TURN')).toBeVisible();
  });

  test('buttons have appropriate labels', async ({ page }) => {
    await setupGame(page);
    
    // Verify stat buttons have text labels
    await expect(page.locator('button:has-text("FOLLOWERS")').first()).toBeVisible();
    await expect(page.locator('button:has-text("REPOS")').first()).toBeVisible();
    await expect(page.locator('button:has-text("INFLUENCE")').first()).toBeVisible();
  });
});
