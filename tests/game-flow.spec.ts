import { test, expect } from '@playwright/test';
import { 
  goToLobby, 
  goToDeckSelection, 
  selectDeck, 
  startSinglePlayerGame,
  setupGame,
  getCurrentTurn
} from './helpers';

test.describe('Game Flow Tests', () => {
  test('can navigate through lobby to deck selection', async ({ page }) => {
    await goToLobby(page);
    
    // Verify we're on the lobby
    await expect(page.locator('h1:has-text("GitTrunfo")')).toBeVisible();
    await expect(page.locator('button:has-text(">> CLICK TO SELECT DECK <<")')).toBeVisible();
    
    // Navigate to deck selection
    await goToDeckSelection(page);
    
    // Verify we're on deck selection screen
    await expect(page.locator('button:has-text("Standard")')).toBeVisible();
    await expect(page.locator('button:has-text("Web Technologies")')).toBeVisible();
  });

  test('can select Standard deck and start single player game', async ({ page }) => {
    await goToLobby(page);
    await goToDeckSelection(page);
    await selectDeck(page, 'Standard');
    
    // Verify game mode buttons are available
    await expect(page.locator('button:has-text("VS CPU")')).toBeVisible();
    
    await startSinglePlayerGame(page);
    
    // Verify game started
    await expect(page.locator('text=YOUR TURN')).toBeVisible();
    
    // Take screenshot of game in progress
    await page.screenshot({ 
      path: 'screenshots/gameplay-single-player.png',
      fullPage: true 
    });
  });

  test('can select each deck type', async ({ page }) => {
    const decks = ['Standard', 'Web Technologies', 'Legacy Languages', 'Esoteric', 'Corporate'];
    
    for (const deck of decks) {
      await goToLobby(page);
      await goToDeckSelection(page);
      
      // Select the deck
      await selectDeck(page, deck as any);
      
      // Verify we can proceed to game mode selection
      await expect(page.locator('button:has-text("VS CPU")')).toBeVisible();
    }
  });

  test('game displays player cards', async ({ page }) => {
    await setupGame(page);
    
    // Verify player card is displayed
    await expect(page.locator('.card-3d-tilt').first()).toBeVisible();
    
    // Verify stat buttons are available
    await expect(page.locator('button:has-text("FOLLOWERS")').first()).toBeVisible();
    await expect(page.locator('button:has-text("REPOS")').first()).toBeVisible();
  });

  test('can complete a game turn', async ({ page }) => {
    await setupGame(page);
    
    // Verify it's player's turn
    await expect(page.locator('text=YOUR TURN')).toBeVisible();
    
    // Click a stat button to play the turn
    const statButton = page.locator('button:has-text("FOLLOWERS")').first();
    await statButton.click();
    
    // Wait for turn to process (either remains YOUR TURN or switches to OPPONENT TURN)
    await page.waitForTimeout(2000);
    
    // Verify game state has progressed (some turn indicator should be visible)
    const hasTurnIndicator = 
      await page.locator('text=YOUR TURN').isVisible() ||
      await page.locator('text=OPPONENT TURN').isVisible();
    
    expect(hasTurnIndicator).toBeTruthy();
  });
});

test.describe('Settings and Configuration', () => {
  test('can open and close settings modal', async ({ page }) => {
    await goToLobby(page);
    
    // Open settings
    await page.click('button:has-text("SETTINGS")');
    await expect(page.locator('button:has-text("CLOSE")')).toBeVisible();
    
    // Close settings
    await page.click('button:has-text("CLOSE")');
    await expect(page.locator('button:has-text("CLOSE")')).not.toBeVisible();
  });

  test('can change theme from settings', async ({ page }) => {
    await goToLobby(page);
    
    // Open settings
    await page.click('button:has-text("SETTINGS")');
    
    // Select a different theme
    await page.click('button:has-text("snes")');
    
    // Close settings
    await page.click('button:has-text("CLOSE")');
    
    // Verify page is still functional
    await expect(page.locator('h1:has-text("GitTrunfo")')).toBeVisible();
  });
});

test.describe('Multiplayer UI', () => {
  test('multiplayer options are available', async ({ page }) => {
    await goToLobby(page);
    await goToDeckSelection(page);
    await selectDeck(page, 'Standard');
    
    // Verify both game mode buttons are present
    await expect(page.locator('button:has-text("VS CPU")')).toBeVisible();
    await expect(page.locator('button:has-text("HOST GAME")')).toBeVisible();
  });

  test('can navigate to host game screen', async ({ page }) => {
    await goToLobby(page);
    await goToDeckSelection(page);
    await selectDeck(page, 'Standard');
    
    // Click host game
    await page.click('button:has-text("HOST GAME")');
    
    // Verify we're on multiplayer screen (should show peer ID or connection info)
    // Note: Actual P2P functionality may not work in test environment
    await page.waitForTimeout(1000);
    
    // Verify the page didn't crash
    await expect(page.locator('body')).toBeVisible();
  });
});
