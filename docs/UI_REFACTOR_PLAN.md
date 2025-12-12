# UI/UX Refactor Plan

## Problem Statement

The GitTrunfo PVP game has several UI/UX issues that need to be addressed:

1. **UI too big / not fitting on screen**
   - Excessive use of 2xl breakpoint styles causing overflow
   - Cards and text don't fit on mobile (360x800) or small laptop screens
   - Hardcoded large sizes break responsive design

2. **Theme contrast issues**
   - WinXP theme has low contrast (dark green on white, hard to read)
   - Some themes don't properly distinguish text from backgrounds
   - No systematic approach to light vs dark themes

3. **UX double clicks / messy event handling**
   - Multiple event handlers triggering simultaneously (onClick + onMouseEnter)
   - Sound effects playing multiple times
   - Inconsistent use of pointer vs click events
   - State updates causing event replays

4. **Code quality issues**
   - Monolithic App.tsx (1286 lines)
   - Peer connection logic mixed with rendering
   - Game state updates scattered throughout
   - No clear separation of concerns

5. **Missing 6th stat**
   - Currently only 5 stats, need 6 for better game balance
   - Add "Impact Score" - measures developer impact through contributions

## Acceptance Criteria

### Responsive Design
- ✅ Gameplay view fits on mobile (360x800px) without overflow or required zoom
- ✅ Gameplay view fits on small laptop (1366x768px) comfortably
- ✅ Cards scale appropriately across all breakpoints
- ✅ Typography uses fluid/clamped sizes instead of fixed 2xl
- ✅ No horizontal scroll on any standard viewport

### Theme Contrast
- ✅ All themes have defined base (light/dark)
- ✅ WinXP theme text is readable (meets WCAG AA contrast ratio best-effort)
- ✅ All theme text/UI elements clearly distinguishable from backgrounds
- ✅ CSS variables systematically derived from theme base

### Event Handling
- ✅ Single click triggers single action (no double-moves)
- ✅ Sound effects play once per action
- ✅ Consistent event pattern (pointer OR click, not both)
- ✅ No duplicate event bindings

### Game Balance
- ✅ 6 stats total (added Impact Score)
- ✅ Card layout accommodates 6 stats (3x2 grid)
- ✅ Impact Score properly calculated from GitHub data

### Code Quality
- ✅ App.tsx split into focused components/hooks
- ✅ Peer connection logic extracted to custom hook
- ✅ Game state managed by reducer
- ✅ Sound triggers centralized
- ✅ Clear component hierarchy

### Testing & Documentation
- ✅ Playwright tests cover key UX flows
- ✅ Screenshots taken for all themes
- ✅ README updated with working screenshots
- ✅ Responsive behavior validated

## Implementation Strategy

### Phase 0: Add 6th Stat (Impact Score)
1. **Update types**
   - Add `impactScore` to CardData interface
   - Add to StatType union
   
2. **Update card generation**
   - Calculate impact score in githubService
   - Based on: public gists, account age, followers/repos ratio
   
3. **Update UI**
   - Add Impact icon and label to Card component
   - Adjust grid to 3x2 layout (was 2x2 + 1 full width)

### Phase 1: Documentation & Analysis
1. Create this refactor plan document
2. Document current issues with examples
3. Define clear acceptance criteria

### Phase 2: Responsive Design Fixes (Minimal Changes)
1. **Typography audit**
   - Replace excessive `2xl:text-[large]` with `md:text-[medium] lg:text-[large]`
   - Use `clamp()` for fluid typography where appropriate
   - Reduce base sizes for mobile-first approach

2. **Card sizing**
   - Reduce card dimensions to fit mobile viewports
   - Adjust min-height constraints
   - Ensure 6 stat buttons fit without overflow

3. **Spacing adjustments**
   - Reduce padding/margins on mobile
   - Use responsive gap utilities
   - Fix HUD layout for mobile

### Phase 3: Theme Contrast Fixes
1. **Add theme metadata**
   - Define `base: 'light' | 'dark'` for each theme
   - Store in theme configuration object

2. **Derive CSS variables**
   - Adjust text colors based on theme base
   - Ensure muted text has sufficient contrast
   - Fix WinXP primary color for button text

3. **Test each theme**
   - Visual inspection for readability
   - Contrast ratio checks (WCAG AA best-effort)

### Phase 4: Event Handling Cleanup
1. **Audit event handlers**
   - List all onClick, onPointerDown, onMouseEnter handlers
   - Identify duplicates and conflicts

2. **Consolidate events**
   - Choose pointer events consistently OR click events
   - Remove redundant sound triggers
   - Ensure hover sounds don't interfere with click sounds

3. **Prevent double-triggers**
   - Add debouncing where necessary
   - Check state guards in handlers

### Phase 5: Code Refactoring (Minimal scope)
1. **Extract smaller components**
   - Keep changes minimal
   - Focus on most problematic areas
   - Preserve existing functionality

### Phase 6: Testing & Validation
1. **Playwright tests**
   - Install Playwright
   - Create test suite for:
     - Theme switching
     - Responsive breakpoints
     - Event handling (no double-clicks)
     - Game flow
   - Take screenshots of all themes

2. **Manual testing**
   - Test on mobile device/emulator (360x800)
   - Test on small laptop (1366x768)
   - Verify all themes are readable
   - Click through entire game flow

3. **Update documentation**
   - Replace README screenshots
   - Add responsive design notes
   - Document theme system

### Phase 7: Code Review & Security
1. Run code review tool
2. Run CodeQL security scan
3. Address any findings

## New Stat: Impact Score

**Concept**: Measures a developer's impact on the GitHub community through various contribution metrics.

**Calculation Formula**:
```typescript
impactScore = normalize(
  (public_gists * 2) +           // Sharing knowledge
  (accountAge * 5) +              // Years active (max 10 years)
  (followers / public_repos) +    // Follower efficiency
  (following_ratio_bonus)         // Community engagement
)
```

**Icon**: Target/Crosshair icon from Lucide (represents hitting the target/making impact)

**Strategic Value**: 
- Rewards consistent, long-term contributors
- Balances raw numbers with quality engagement
- Provides alternative strategy for veteran accounts

## Technical Details

### Responsive Breakpoints
- Mobile: 360px - 767px (base styles)
- Tablet: 768px - 1023px (md:)
- Desktop: 1024px+ (lg:) - **avoid xl: and 2xl: for critical sizing**

### Card Layout (6 stats)
```
[Stat 1] [Stat 2] [Stat 3]
[Stat 4] [Stat 5] [Stat 6]
```
All stats same size, 3x2 grid layout.

### Theme Base Attribute
```typescript
type ThemeBase = 'light' | 'dark';

interface ThemeConfig {
  id: Theme;
  base: ThemeBase;
  name: string;
  // ... CSS variables
}
```

### Event Handler Pattern
Use pointer events consistently:
- onPointerEnter (hover)
- onPointerDown (click)
- Remove onClick and onMouseEnter

## Progress Tracking

- [x] Phase 0: Add 6th Stat (Impact Score)
- [x] Phase 1: Documentation & Analysis
- [ ] Phase 2: Responsive Design Fixes
- [ ] Phase 3: Theme Contrast Fixes
- [ ] Phase 4: Event Handling Cleanup
- [ ] Phase 5: Code Refactoring (minimal)
- [ ] Phase 6: Testing & Validation
- [ ] Phase 7: Code Review & Security
