# Documentation Screenshot Instructions

## Issue
The automated test environment blocks external CDN resources (Tailwind CSS and Google Fonts), resulting in unstyled screenshots that don't accurately represent the UI improvements.

## Solution
Screenshots need to be captured in an environment where CDN resources are not blocked:

### Option 1: Local Development
1. Run `npm install` and `npm run dev`
2. Open http://localhost:3000/gitTrunfoPVP/ in your browser
3. Take screenshots of:
   - Lobby screen at 1366x768 viewport
   - Game screen (after selecting deck and starting VS CPU) at 1366x768
   - Mobile view at 375x812

### Option 2: Deployed Site
1. Visit the deployed GitHub Pages site
2. Take screenshots directly from the live site

## What to Capture
The UI improvements that should be visible in screenshots:
- **Compact HUD**: Player badges (P1/P2) are smaller, status bar is shorter
- **Better Card Layout**: Cards are narrower with improved spacing between stat buttons
- **Reduced Spacing**: Less gap between cards and VS graphic
- **Smaller Terminal Log**: Log window at bottom is more compact
- **Improved Contrast**: Text is lighter/more readable against dark backgrounds

## Current Status
All code changes are implemented correctly:
- HUD reduced from 96px to 56px height
- Cards reduced from 320px to 300px max width
- Text contrast improved (e.g., Cyberpunk theme text: #c9d1d9 → #e6edf3)
- Battle arena spacing reduced by 50%
- Terminal log height reduced from 192px to 128px

The styling just needs to be captured in a non-sandboxed environment.
