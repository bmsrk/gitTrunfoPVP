# GitTrunfo P2P - Gameplay Guide

## Game Overview

GitTrunfo P2P is a competitive card game where players battle using GitHub developer profiles. Each card represents a real GitHub user with **strategic attributes** calculated from their GitHub activity. Unlike raw statistics, these normalized attributes (0-100 scale) create balanced, strategic gameplay. The goal is to win all your opponent's cards by choosing your best attributes.

## Game Modes

### Deck Types

Choose from 5 specialized deck types, each with unique strategic weights:

| Deck | Icon | Focus | Best Attributes |
|------|------|-------|-----------------|
| **Standard** | ⭐ | Balanced gameplay | All attributes equally weighted |
| **Web** | 🌐 | Modern web developers | Activity (1.3x), Tech Breadth (1.2x) |
| **Legacy Languages** | 🏛️ | System programming veterans | Repos (1.2x), Seniority |
| **Esoteric** | 🔮 | Niche & emerging tech | Tech Breadth (1.4x), Influence (1.3x) |
| **Corporate** | 🏢 | DevRel & community leaders | Followers (1.5x), Influence (1.4x) |

**Deck Weights**: Different decks multiply certain attributes, making them stronger. For example, Corporate decks have 50% higher follower scores!

### Single Player (vs CPU)
- Practice against a computer opponent
- Random stat selection by CPU
- 12 total cards (6 per player)
- Perfect for learning the game

### Multiplayer (P2P)
- Play against another human online
- Real-time WebRTC connection
- 16 total cards (8 per player)
- Two roles:
  - **Host**: Creates a lobby and gets a Lobby ID
  - **Client**: Joins using the Host's Lobby ID

## How to Play

### Starting a Game

**Single Player:**
1. Click "VS CPU" on the lobby screen
2. Wait for deck generation
3. Game starts immediately

**Multiplayer Host:**
1. Click "HOST GAME"
2. Share your Lobby ID with opponent
3. Wait for opponent to connect
4. Game starts automatically

**Multiplayer Client:**
1. Get Lobby ID from host
2. Paste ID in "JOIN EXISTING LOBBY" field
3. Click "CONNECT"
4. Wait for game to start

### Battle Mechanics

#### Turn Structure

1. **Your Turn**: 
   - Your card is displayed with all stats visible
   - Opponent's card is hidden (shown as "UNKNOWN ENTITY")
   - Select the stat where you have the highest value
   - Wait for opponent's card to reveal

2. **Opponent's Turn**:
   - Your card is visible but greyed out
   - Wait for opponent to choose their stat
   - Both cards reveal simultaneously
   - Result is displayed automatically

#### Stat Comparison

Each card has 5 **strategic attributes** (normalized 0-100 scale):

| Attribute | Description | Based On | Strategy |
|-----------|-------------|----------|----------|
| **FOLLOWERS** | Community influence | Follower count (log-scaled) | Best for popular influencers and educators |
| **REPOS** | Project portfolio | Repository count (log-scaled) | Best for prolific developers |
| **INFLUENCE** | Code impact | Total stars + forks across all repos | Best for maintainers of popular projects |
| **ACTIVITY** | Recent contributions | Recent commits (90 days) + recency bonus | Best for actively contributing developers |
| **TECH BREADTH** | Technology diversity | Number of different languages used | Best for polyglot developers |

**Strategic Attributes System:**
- All attributes are **normalized** to 0-100 scale for fair comparison
- Uses **log scaling** for followers, repos, and influence (prevents outliers from dominating)
- **Activity Score** combines recent commits with a recency decay (favor active developers)
- **Tech Breadth** measures language diversity (rewards polyglot programmers)

**Choose wisely!** Always pick your highest attribute, but remember that different deck types favor different attributes.

#### Winning & Losing Rounds

- **Win** (Green highlight):
  - Your stat value is higher
  - You collect both cards
  - You get the next turn
  - You also win any cards in the BUFFER

- **Loss** (Red highlight):
  - Opponent's stat is higher
  - Opponent collects both cards
  - Opponent gets the next turn

- **Draw** (Yellow highlight):
  - Both stats are equal
  - Cards go to the BUFFER
  - Turn stays with current player
  - Next winner takes all BUFFER cards

### The Buffer System

When rounds end in a draw:
1. Both cards go to the BUFFER (displayed as a card stack)
2. BUFFER cards are held in limbo
3. Next round winner takes ALL BUFFER cards
4. This can create dramatic comebacks!

**Strategic Note**: Multiple draws create a large buffer. The next winner gets a massive advantage!

### Victory Conditions

**You Win If:**
- Opponent runs out of cards
- Opponent disconnects (technical victory)

**You Lose If:**
- You run out of cards
- You disconnect

**Card Distribution:**
- Won cards are shuffled before adding to your deck
- This prevents infinite strategy loops

## Visual Indicators

### Card States

- **Your Turn + Enabled**: Cards have hover effects and glowing borders
- **Hidden Card**: Opponent's unrevealed card shows "UNKNOWN ENTITY"
- **Revealed Card**: Shows full profile with animated flip
- **Winner Card**: Green border, glow effect, "WINNER" arrow
- **Loser Card**: Red border, greyed out, reduced scale
- **Highlighted Stat**: The chosen stat pulses with color (green for win, red for loss)

### HUD Elements

**Top Bar:**
- **P1 (Left)**: Your deck count and progress bar (blue)
- **Turn Indicator (Center)**: "YOUR TURN" (green) or "OPP TURN" (red)
- **Buffer Stack (Center)**: Shows number of cards in buffer
- **P2 (Right)**: Opponent deck count and progress bar (red)
- **Connection Status**: LIVE, CPU, SYNC, ERR, OFF

**Bottom Panel (Desktop):**
- **Battle Log**: Terminal-style scrolling log of all moves
- Shows stat comparisons and results

**Bottom Drawer (Mobile):**
- Collapsible battle log
- Tap to expand/collapse

### Themes

8 retro themes available via Settings (⚙️ icon):

- **Cyberpunk**: Dark terminal (default)
- **SNES**: 16-bit RPG purple/gold
- **Dreamcast**: Clean orange/white
- **N64**: Dark blue console-style
- **PSX**: Grey PlayStation aesthetic
- **Xbox**: Green gaming theme
- **WinXP**: Classic Windows blue
- **PC98**: Retro Japanese PC beige/black

## Tips & Strategy

### General Strategy
1. **Understand Normalization**: All scores are 0-100, so a 75 in FOLLOWERS beats a 70 in REPOS
2. **Know Your Deck**: Corporate decks excel at Followers, Web decks at Activity
3. **Read the Tooltips**: Hover over attributes to see raw values (stars, actual follower count, etc.)
4. **Balance is Key**: With normalization, no single attribute dominates every match
5. **Buffer Awareness**: Don't underestimate draw scenarios

### Attribute Trends (Normalized Scores)
- **FOLLOWERS**: High variance (10-95) - risky but rewarding for influencers
- **REPOS**: Consistent (40-80) - reliable middle ground
- **INFLUENCE**: Spiky (20-90) - very high for popular project maintainers
- **ACTIVITY**: Variable (25-85) - favors currently active developers
- **TECH BREADTH**: Moderate (30-70) - rewards polyglot programmers

### Deck-Specific Strategy
- **Corporate Deck**: Prioritize Followers and Influence (50% bonus!)
- **Web Deck**: Favor Activity and Tech Breadth (modern tech stack)
- **Legacy Deck**: Repos and seniority (veteran developers)
- **Esoteric Deck**: Tech Breadth and Influence (niche language experts)
- **Standard Deck**: No bias - balanced gameplay

### Single Player Tips
- CPU chooses randomly, so any high stat works
- Good for learning stat distributions
- Practice makes perfect!

### Multiplayer Tips
- Experienced players will always choose their highest stat
- Psychological pressure can cause mistakes
- Fast connections prevent timeouts
- Clear communication via external chat recommended

## Troubleshooting

### Connection Issues

**"Lobby ID not found"**
- Host might be offline
- ID might be mistyped
- Host's browser might have closed

**"Connection timed out"**
- Firewall blocking WebRTC
- Network issues
- Host's peer server down

**"Connection to server lost"**
- Temporary signaling server issue
- Will auto-reconnect
- Wait a few seconds

**"Opponent Disconnected"**
- Opponent closed browser
- Network failure
- You win by technical victory!

### Gameplay Issues

**Cards not loading**
- GitHub API rate limit hit (60/hour)
- Fallback mock cards will be used
- Completely normal behavior

**Animations laggy**
- Reduce browser zoom level
- Close other tabs
- Use hardware-accelerated browser

**Sound not working**
- Browser might block autoplay
- Click anywhere to resume audio
- Check browser audio settings

## Accessibility

- **Keyboard Navigation**: Limited support (mouse/touch recommended)
- **Screen Readers**: Limited support
- **Color Blind Mode**: Not yet implemented (planned)
- **Sound Toggle**: Not yet implemented (planned)

## Game Etiquette

**Do:**
- Share your Lobby ID accurately
- Wait for opponent's turn patiently
- Congratulate good plays
- Have fun!

**Don't:**
- Disconnect mid-game (poor sportsmanship)
- Spam connections to busy hosts
- Complain about "lucky" draws (it's part of the game)

## Advanced: Scoring System & Math

### How Attributes Are Calculated

**1. Data Enrichment:**
- Fetches user profile, repositories, commit activity, and language stats
- Caches results for 15 minutes to respect GitHub API limits
- Falls back to deterministic mock data if API unavailable

**2. Normalization (0-100 scale):**
- **Log Scaling**: Used for followers, repos, and influence (heavy-tail distributions)
  - Formula: `normalized = (log10(value + 1) - log10(min + 1)) / (log10(max + 1) - log10(min + 1)) * 100`
  - Prevents mega-stars like Linus Torvalds from having unbeatable scores
- **Linear Scaling**: Used for language count and activity
  - Formula: `normalized = (value - min) / (max - min) * 100`

**3. Reference Ranges:**
- Followers: 0-10,000 → normalized 0-100
- Repos: 0-500 → normalized 0-100
- Influence (stars+forks): 0-50,000 → normalized 0-100
- Activity (recent commits): 0-50 → normalized 0-100 (+ recency bonus)
- Tech Breadth (languages): 0-20 → normalized 0-100

**4. Deck Weight Multipliers:**
Different decks apply multipliers to certain attributes:
- Corporate: Followers ×1.5, Influence ×1.4
- Web: Activity ×1.3, Tech Breadth ×1.2
- Esoteric: Tech Breadth ×1.4, Influence ×1.3
- Legacy: Repos ×1.2
- Standard: All ×1.0 (balanced)

### Expected Score Ranges

After normalization, typical score distributions:
- **Top 10% developers**: 75-95 in their specialty
- **Average developers**: 40-60 across most attributes
- **Niche specialists**: 80+ in 1-2 attributes, 20-40 in others

### Win Probability

Assuming random card distribution:
- Equal skill + deck knowledge: ~55% win rate
- Understanding normalization: ~65% win rate
- Deck-attribute synergy: ~75% win rate
- Perfect play: ~80% win rate (still luck-dependent on card draws)

---

**Ready to Battle?** Open the game and click "VS CPU" to start your first match!
