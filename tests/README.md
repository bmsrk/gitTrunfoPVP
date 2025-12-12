# Test Suite Documentation

This directory contains the end-to-end test suite for GitTrunfo PVP, built with Playwright.

## Test Organization

The test suite is organized into focused modules:

### `helpers.ts`
Common utilities and helper functions used across all tests:
- Navigation helpers (goToLobby, goToDeckSelection, etc.)
- Theme and viewport management
- Game setup utilities
- Constants (THEMES, DECKS, VIEWPORTS)

### `visual.spec.ts`
Visual regression and responsive design tests:
- Theme screenshot tests for all 8 themes
- Responsive design tests across multiple viewports
- Layout verification tests
- Contrast and visibility checks

### `game-flow.spec.ts`
Functional game flow tests:
- Navigation through game screens
- Deck selection and game mode selection
- Single player game initialization
- Settings and configuration
- Multiplayer UI presence

### `ui-interactions.spec.ts`
UI component and interaction tests:
- Card hover effects and 3D tilt
- Stat button interactions
- Event handling validation
- Visual effects (foil cards)
- Basic accessibility checks

## Running Tests

**Important:** Make sure the dev server is running before executing tests:

```bash
# Start the dev server in one terminal
npm run dev

# In another terminal, run tests
npm test
```

Or run specific tests:

```bash
# Run all tests
npm test

# Run tests in headed mode (see browser)
npm run test:headed

# Run tests in UI mode (interactive)
npm run test:ui

# Run specific test file
npx playwright test visual.spec.ts

# Run tests matching a pattern
npx playwright test --grep "theme"
```

## Test Philosophy

### Minimal Waits
Tests use Playwright's built-in waiting mechanisms (`waitForSelector`, `waitForLoadState`) instead of arbitrary `waitForTimeout` calls wherever possible.

### Helper Functions
Common operations are extracted into reusable helper functions to:
- Reduce code duplication
- Improve test readability
- Make tests easier to maintain
- Ensure consistent test patterns

### Focused Tests
Each test file focuses on a specific aspect of the application:
- **Visual tests** verify appearance and responsive design
- **Functional tests** verify game logic and flow
- **Interaction tests** verify UI components and user interactions

### Meaningful Assertions
Tests include assertions beyond just screenshots:
- Visibility checks for key elements
- State verification (turn indicators, game progression)
- Layout validation (no overflow, proper responsive behavior)

## Screenshot Management

Screenshots are saved to the `screenshots/` directory:
- Theme screenshots: `{theme}-{view}.png`
- Responsive screenshots: `responsive-{viewport}.png`
- Gameplay screenshots: `gameplay-*.png`
- Effect screenshots: `card-tilt-hover.png`, `foil-card-example.png`

## Adding New Tests

When adding new tests:

1. **Use helper functions** from `helpers.ts` for common operations
2. **Add to the appropriate spec file** based on test focus
3. **Use proper waiting strategies** instead of arbitrary timeouts
4. **Include meaningful assertions** beyond just screenshots
5. **Document complex test scenarios** with comments

### Example: Adding a New Test

```typescript
import { test, expect } from '@playwright/test';
import { setupGame } from './helpers';

test('my new feature works', async ({ page }) => {
  // Setup
  await setupGame(page);
  
  // Action
  await page.click('button:has-text("MY FEATURE")');
  
  // Assertion
  await expect(page.locator('.my-feature-result')).toBeVisible();
});
```

## Configuration

Test configuration is in `playwright.config.ts`:
- Base URL: `http://localhost:5173`
- Projects: chromium (desktop) and mobile
- Dev server starts automatically
- Retries: 2 in CI, 0 locally

## Troubleshooting

### Tests Timing Out
- Check if dev server is running
- Increase timeout in test with `{ timeout: 30000 }`
- Verify selectors are correct

### Flaky Tests
- Use proper waiting strategies instead of `waitForTimeout`
- Check for race conditions
- Use `page.waitForLoadState('networkidle')` for stable page state

### Screenshot Differences
- Screenshots may vary slightly between environments
- Focus on functional assertions over pixel-perfect screenshots
- Use screenshots for manual review, not strict comparison

## Best Practices

1. **Keep tests independent**: Each test should be able to run standalone
2. **Clean up after tests**: Tests should not affect each other
3. **Use descriptive test names**: Clearly state what is being tested
4. **Group related tests**: Use `test.describe` blocks
5. **Avoid test interdependencies**: Don't rely on execution order
6. **Test user journeys**: Test realistic user flows, not just individual functions

## Migration Notes

The original `ui-ux.spec.ts` has been refactored into three focused modules:
- Reduced code duplication through helper functions
- Improved test reliability with proper waiting strategies
- Better organization for easier maintenance
- Enhanced assertions for more comprehensive validation

The old file is preserved as `ui-ux.spec.ts.old` for reference.
