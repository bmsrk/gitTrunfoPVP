# GitTrunfo P2P - Gameplay Guide

## Game Overview

GitTrunfo P2P is a competitive card game where players battle using GitHub developer profiles. Each card represents a real GitHub user with statistics like repositories, followers, and years of experience. The goal is to win all your opponent's cards by choosing the best stats.

## Game Modes

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

Each card has 5 statistics:

| Stat | Description | Strategy |
|------|-------------|----------|
| **REPOS** | Public repositories | Best for prolific developers |
| **FOLLOWERS** | GitHub followers | Best for influencers/educators |
| **FOLLOWING** | Accounts followed | Variable, sometimes surprisingly high |
| **GISTS** | Public gists | Niche stat, good for tie-breakers |
| **EXP. YEARS** | Years since account creation | Best for veteran developers |

**Choose wisely!** Always pick your highest stat, but consider that different developers excel in different areas.

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
1. **Know Your Cards**: Each developer has different strengths
2. **Think Ahead**: Remember which stats tend to be high/low
3. **Risk vs Reward**: Your second-best stat might still win
4. **Buffer Awareness**: Don't underestimate draw scenarios

### Stat Trends
- **REPOS**: Usually the most reliable high stat
- **FOLLOWERS**: Very variable, can be surprisingly low for good devs
- **FOLLOWING**: Often low (100-300), occasionally very high
- **GISTS**: Usually the lowest stat (0-50)
- **EXP. YEARS**: Stable and predictable, good for safe plays

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

## Advanced: Probability & Math

### Expected Values

Average stat ranges (approximate):
- REPOS: 20-150
- FOLLOWERS: 50-2000
- FOLLOWING: 10-100
- GISTS: 0-30
- EXP. YEARS: 5-15

**Statistical Note**: FOLLOWERS has the highest variance, making it risky but potentially rewarding.

### Win Probability

Assuming random card distribution:
- Equal skill: ~50% win rate
- Stat knowledge: ~60% win rate
- Perfect play: ~70% win rate (can't control card draws)

---

**Ready to Battle?** Open the game and click "VS CPU" to start your first match!
