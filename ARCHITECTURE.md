# GitTrunfo P2P - Architecture Documentation

## Overview

GitTrunfo P2P is a browser-based multiplayer card game built with React, TypeScript, and WebRTC. Players battle using GitHub profiles as cards, comparing developer statistics in a Top Trumps-style game.

## Technology Stack

- **Frontend Framework**: React 19.2.1 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (via CDN)
- **P2P Communication**: PeerJS 1.5.5 (WebRTC wrapper)
- **UI Icons**: Lucide React
- **Effects**: Canvas Confetti
- **Fonts**: Silkscreen, VT323, Press Start 2P (Google Fonts)

## Project Structure

```
gitTrunfoPVP/
├── App.tsx                 # Main application component and game logic
├── index.tsx              # React entry point
├── index.html             # HTML template with Tailwind and theme styles
├── types.ts               # TypeScript type definitions
├── components/
│   └── Card.tsx           # Card component for displaying GitHub profiles
├── services/
│   ├── githubService.ts   # GitHub API integration and deck generation
│   ├── geminiService.ts   # Battle commentary generation
│   └── soundService.ts    # Retro sound effects manager
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
└── README.md              # Project documentation
```

## Core Components

### App.tsx

The main application component managing:

- **Game State**: Single state object (`GameState`) controlling the entire game flow
- **Game Modes**: 
  - `SINGLE`: Player vs CPU
  - `HOST`: Player hosting a P2P game
  - `CLIENT`: Player joining a P2P game
- **Game Phases**:
  - `LOBBY`: Initial screen for mode selection
  - `CONNECTING`: Establishing P2P connection
  - `PLAYING`: Active gameplay
  - `GAME_OVER`: End game screen
- **Theme System**: 8 retro themes (cyberpunk, SNES, Dreamcast, N64, PSX, Xbox, WinXP, PC98)
- **P2P Management**: PeerJS connection handling with error recovery

### Card.tsx

Reusable card component featuring:

- GitHub profile display with avatar
- 5 battle statistics (repos, followers, following, gists, seniority)
- Interactive stat selection for battles
- Winner/loser visual effects
- Hidden card state for opponent's unrevealed cards
- Responsive design for mobile and desktop
- Theme-aware styling

### Services

#### githubService.ts
- Fetches GitHub user data via REST API
- Generates decks from fallback user list
- Calculates seniority (years since account creation)
- Handles API rate limits with mock data fallback

#### geminiService.ts
- Generates battle commentary using template-based system
- Simulates AI commentary for better UX
- Provides context-aware messages for wins/draws

#### soundService.ts
- Web Audio API-based retro sound effects
- Event sounds: hover, select, start, win, lose
- Frequency-modulated tones for authentic retro feel

## Game Logic

### Turn Flow

1. **Card Reveal**: Player or opponent reveals their current card
2. **Stat Selection**: Active player chooses a stat to battle with
3. **Comparison**: Both cards' chosen stat values are compared
4. **Result Processing**:
   - Winner takes both cards (shuffled to prevent loops)
   - Draw: Cards go to the "pot" (buffer)
   - Next winner takes pot cards
5. **Deck Update**: Cards redistributed, next card drawn
6. **Turn Swap**: Winner gets next turn (or turn stays same on draw)
7. **Victory Check**: Player with no cards loses

### P2P Communication

**Message Types**:
- `HANDSHAKE`: Initial game setup with deck distribution
- `MOVE`: Player sends their stat choice and card
- `REVEAL`: Response revealing the card
- `GAME_OVER_ACK`: Acknowledge opponent's victory

**Connection Flow**:
```
HOST                          CLIENT
  |                              |
  | <--- Peer.connect(id) ---    |
  |                              |
  | --- HANDSHAKE (decks) --->   |
  |                              |
  | <--- MOVE (stat, card) ---   |
  |                              |
  | --- REVEAL (card) --->       |
  |                              |
  (Both process result locally)
  |                              |
  | <--- GAME_OVER_ACK ---       |
  (if client runs out of cards)
```

### State Management

Single `GameState` object managed with React's `useState`:

```typescript
interface GameState {
  status: 'LOBBY' | 'CONNECTING' | 'PLAYING' | 'GAME_OVER';
  mode: 'SINGLE' | 'HOST' | 'CLIENT';
  myDeck: CardData[];
  opponentDeckCount: number;
  currentMyCard: CardData | null;
  currentOpponentCard: CardData | null;
  pot: CardData[];
  turn: 'ME' | 'OPPONENT';
  lastWinner: 'ME' | 'OPPONENT' | 'DRAW' | null;
  lastStat: StatType | null;
  log: string[];
  peerId: string | null;
  opponentPeerId: string | null;
  aiCommentary: string | null;
}
```

## Theme System

Themes are CSS custom properties defined in `index.html`:

```css
:root {
  --bg: #0d1117;
  --panel: #161b22;
  --border: #30363d;
  --text: #c9d1d9;
  --primary: #58a6ff;
  --success: #3fb950;
  --danger: #da3633;
  --radius: 0px;
  --shadow: 4px 4px 0px rgba(0,0,0,0.8);
  --glow: 0 0 10px rgba(88, 166, 255, 0.3);
}
```

Each theme overrides these variables with `[data-theme='name']` selectors.

## Build & Deployment

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm run build
```

### GitHub Pages Deployment

Automatic deployment via GitHub Actions on push to `main`:
- Builds production bundle
- Deploys to GitHub Pages at `/gitTrunfoPVP/` base path
- Configured in `vite.config.ts`

## Browser Compatibility

- **WebRTC**: Required for P2P mode (modern browsers)
- **Web Audio API**: Required for sound effects
- **ES6+**: Modern JavaScript features used throughout
- **Recommended**: Chrome, Firefox, Safari, Edge (latest versions)

## Performance Considerations

- **Card Animations**: CSS-based for smooth 60fps
- **Deck Size**: Limited to prevent memory issues (12-16 cards)
- **API Rate Limiting**: GitHub API has 60 requests/hour unauthenticated
- **Mock Data**: Fallback when API limits hit
- **Connection Timeout**: 15s safety timeout for P2P connections

## Future Enhancement Areas

1. **Authentication**: GitHub OAuth for higher API limits
2. **Deck Themes**: Stack-based decks (Python, JavaScript, etc.)
3. **Persistent Stats**: Track win/loss records
4. **Tournaments**: Multi-player bracket system
5. **Custom Decks**: User-curated card collections
6. **Replay System**: Save and replay battles
7. **Sound Toggle**: User preference for audio
8. **Accessibility**: ARIA labels, keyboard navigation
