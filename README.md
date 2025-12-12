# GitTrunfo P2P 🎮


[![Deploy to GitHub Pages](https://github.com/bmsrk/gitTrunfoPVP/actions/workflows/deploy.yml/badge.svg)](https://github.com/bmsrk/gitTrunfoPVP/actions/workflows/deploy.yml)

> A browser-based multiplayer card game where you battle using GitHub developer profiles. Choose your deck, select your stats, and dominate the competition!

🎮 **[Play Now](https://bmsrk.github.io/gitTrunfoPVP/)** | 📖 **[Read the Docs](ARCHITECTURE.md)** | 🎯 **[How to Play](GAMEPLAY.md)**

## ✨ Features

- 🎴 **Stack-Based Decks**: Choose from 5 specialized decks
  - ⭐ **Standard**: Popular developers across all languages
  - 🌐 **Web Technologies**: JavaScript, TypeScript, HTML/CSS experts
  - 🏛️ **Legacy Languages**: C, C++, Java, system programming legends
  - 🔮 **Esoteric**: Rust, Go, functional programming enthusiasts
  - 🏢 **Corporate**: DevRel, community leaders, and tech influencers

- ⚔️ **Strategic Attributes**: Normalized scoring system (0-100 scale)
  - **Followers Score**: Community influence (log-scaled)
  - **Repositories Score**: Project portfolio size
  - **Influence Score**: Aggregate stars + forks
  - **Activity Score**: Recent commits + recency bonus
  - **Tech Breadth**: Language diversity

- 🎯 **Deck Weights**: Each deck favors different attributes
  - Corporate excels at Followers (1.5x) and Influence (1.4x)
  - Web favors Activity (1.3x) and Tech Breadth (1.2x)
  - Esoteric masters Tech Breadth (1.4x) and Influence (1.3x)

- 🎮 **Game Modes**:
  - **Casual Mode**: Quick matches for fun

- 👥 **Play Options**:
  - **Single Player**: Battle against AI opponent
  - **Multiplayer**: Real-time P2P battles via WebRTC

- 🎨 **8 Retro Themes**: Cyberpunk, SNES, Dreamcast, N64, PSX, Xbox, WinXP, PC98

- 🔊 **Retro Sound Effects**: Web Audio API-powered 8-bit sounds

- 📱 **Fully Responsive**: Play on desktop, tablet, or mobile

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/bmsrk/gitTrunfoPVP.git
cd gitTrunfoPVP

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser to `http://localhost:3000/gitTrunfoPVP/`

### Build for Production

```bash
npm run build
```

## 🎯 How to Play

1. **Pick Your Deck**: Select a stack-based deck (Web, Legacy, Esoteric, or Standard)
2. **Start Playing**: Choose Single Player (vs CPU) or Multiplayer (P2P)
3. **Battle**: Select the stat where your card has the highest value
4. **Win**: Collect all your opponent's cards to achieve victory!

For detailed gameplay instructions, see [GAMEPLAY.md](GAMEPLAY.md).

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture and code structure
- **[GAMEPLAY.md](GAMEPLAY.md)** - Complete gameplay guide and strategies
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute to the project

## 🛠️ Technology Stack

- **Frontend**: React 19.2.1 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS (CDN)
- **P2P**: PeerJS 1.5.5 (WebRTC)
- **Icons**: Lucide React
- **Effects**: Canvas Confetti

## 🎨 Themes

The game includes 8 carefully crafted retro themes:

- **Cyberpunk** (Default): Dark terminal aesthetic
- **SNES**: 16-bit RPG style
- **Dreamcast**: Clean orange/white
- **N64**: Dark blue console
- **PSX**: Grey PlayStation
- **Xbox**: Green gaming
- **WinXP**: Classic Windows blue
- **PC98**: Retro Japanese PC

## 🌐 Deployment

The app is automatically deployed to GitHub Pages when changes are pushed to the `main` branch.

**Live Demo**: [https://bmsrk.github.io/gitTrunfoPVP/](https://bmsrk.github.io/gitTrunfoPVP/)

### Manual Deployment

Go to the Actions tab and run the "Deploy to GitHub Pages" workflow.

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- GitHub API for developer data
- PeerJS for WebRTC simplification
- All the amazing developers whose profiles are featured in the decks

## 🐛 Known Issues

- GitHub API rate limit: 60 requests/hour (unauthenticated)
- WebRTC may be blocked by some corporate firewalls
- Mobile experience optimized but best on desktop

## 🗺️ Roadmap

- [ ] User authentication for higher API limits
- [ ] Custom deck creation
- [ ] Persistent stats and leaderboards
- [ ] Sound toggle preference
- [ ] Replay system
- [ ] Accessibility improvements

---

**Made with ❤️ by the open source community**
