import { Page } from '@playwright/test';

/**
 * Theme options available in the application
 */
export const THEMES = [
  'cyberpunk',
  'snes',
  'dreamcast',
  'n64',
  'psx',
  'xbox',
  'winxp',
  'pc98',
] as const;

export type Theme = typeof THEMES[number];

/**
 * Deck options available in the application
 */
export const DECKS = ['Standard', 'Web Technologies', 'Legacy Languages', 'Esoteric', 'Corporate'] as const;

export type Deck = typeof DECKS[number];

/**
 * Common viewport sizes for responsive testing
 */
export const VIEWPORTS = [
  { name: 'mobile-small', width: 360, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1366, height: 768 },
  { name: 'desktop', width: 1920, height: 1080 },
] as const;

/**
 * Navigate to the lobby and wait for the page to be ready
 */
export async function goToLobby(page: Page): Promise<void> {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  // Wait for the main title to be visible as a sign the page is ready
  await page.waitForSelector('h1:has-text("GitTrunfo")', { state: 'visible' });
}

/**
 * Open settings modal
 */
export async function openSettings(page: Page): Promise<void> {
  await page.click('button:has-text("SETTINGS")');
  // Wait for settings modal to be visible
  await page.waitForSelector('button:has-text("CLOSE")', { state: 'visible' });
}

/**
 * Close settings modal
 */
export async function closeSettings(page: Page): Promise<void> {
  await page.click('button:has-text("CLOSE")');
  // Wait for settings modal to be hidden
  await page.waitForSelector('button:has-text("CLOSE")', { state: 'hidden' });
}

/**
 * Select a theme from the settings modal
 * Note: Settings modal must be open before calling this
 */
export async function selectTheme(page: Page, theme: Theme): Promise<void> {
  await page.click(`button:has-text("${theme}")`);
  // Give a brief moment for theme to apply
  await page.waitForTimeout(200);
}

/**
 * Apply a theme (opens settings, selects theme, closes settings)
 */
export async function applyTheme(page: Page, theme: Theme): Promise<void> {
  await openSettings(page);
  await selectTheme(page, theme);
  await closeSettings(page);
}

/**
 * Navigate to deck selection screen
 */
export async function goToDeckSelection(page: Page): Promise<void> {
  await page.click('button:has-text(">> CLICK TO SELECT DECK <<")');
  // Wait for deck selection to be visible
  await page.waitForSelector('button:has-text("Standard")', { state: 'visible' });
}

/**
 * Select a deck from the deck selection screen
 */
export async function selectDeck(page: Page, deck: Deck): Promise<void> {
  await page.click(`button:has-text("${deck}")`);
  // Wait for deck selection to complete
  await page.waitForSelector('button:has-text("VS CPU")', { state: 'visible' });
}

/**
 * Start a single player game
 * Note: Deck must be selected before calling this
 */
export async function startSinglePlayerGame(page: Page): Promise<void> {
  await page.click('button:has-text("VS CPU")');
  // Wait for game to start - look for turn indicator
  await page.waitForSelector('text=YOUR TURN', { state: 'visible', timeout: 10000 });
}

/**
 * Complete game setup: navigate to lobby, select deck, and start game
 */
export async function setupGame(page: Page, deck: Deck = 'Standard'): Promise<void> {
  await goToLobby(page);
  await goToDeckSelection(page);
  await selectDeck(page, deck);
  await startSinglePlayerGame(page);
}

/**
 * Set viewport size for responsive testing
 */
export async function setViewport(page: Page, width: number, height: number): Promise<void> {
  await page.setViewportSize({ width, height });
}

/**
 * Check if page has horizontal scroll (overflow)
 */
export async function hasHorizontalScroll(page: Page): Promise<boolean> {
  return await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
}

/**
 * Get the current game state (turn indicator)
 */
export async function getCurrentTurn(page: Page): Promise<'YOUR TURN' | 'OPPONENT TURN' | null> {
  const yourTurn = await page.locator('text=YOUR TURN').isVisible();
  if (yourTurn) return 'YOUR TURN';
  
  const opponentTurn = await page.locator('text=OPPONENT TURN').isVisible();
  if (opponentTurn) return 'OPPONENT TURN';
  
  return null;
}
