import React, { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { GameState, CardData, StatType, PeerMessage, DeckType } from './types';
import { generateDeck, DECK_CONFIGS } from './services/githubService';
import { getBattleCommentary } from './services/geminiService';
import { soundManager } from './services/soundService';
import Card from './components/Card';
import { Copy, Wifi, User, Cpu, RotateCcw, Swords, Trophy, Loader2, Disc, HelpCircle, X, Layers, Settings, Gamepad2, Terminal, ChevronUp, ChevronDown, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

type Theme = 'cyberpunk' | 'snes' | 'dreamcast' | 'n64' | 'psx' | 'xbox' | 'winxp' | 'pc98';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('cyberpunk');
  const [showSettings, setShowSettings] = useState(false);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const [showLogMobile, setShowLogMobile] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    status: 'LOBBY',
    mode: 'SINGLE',
    gameMode: 'CASUAL',
    selectedDeck: null,
    myDeck: [],
    opponentDeckCount: 0,
    currentMyCard: null,
    currentOpponentCard: null,
    pot: [],
    turn: 'ME',
    lastWinner: null,
    lastStat: null,
    log: [],
    peerId: null,
    opponentPeerId: null,
    aiCommentary: null,
    tournamentRound: 1,
    tournamentWins: 0,
    tournamentLosses: 0
  });

  const [inputPeerId, setInputPeerId] = useState('');
  const [isLoadingDeck, setIsLoadingDeck] = useState(false);
  const [isWaitingForOpponent, setIsWaitingForOpponent] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Refs for PeerJS
  const peerRef = useRef<Peer | null>(null);
  const connRef = useRef<DataConnection | null>(null);
  const stateRef = useRef<GameState>(gameState);
  const pendingStatRef = useRef<StatType | null>(null);

  useEffect(() => {
    stateRef.current = gameState;
    // Auto-scroll terminal log
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [gameState]);

  // --- Initialization ---

  const initializePeer = (): Peer => {
    if (peerRef.current && !peerRef.current.destroyed) return peerRef.current;

    const peer = new Peer();
    
    peer.on('open', (id) => {
      setGameState(prev => ({ ...prev, peerId: id }));
      setConnectionError(null);
    });

    peer.on('connection', (conn) => {
      if (stateRef.current.status === 'PLAYING') {
        // Busy - reject connection
        conn.close();
        return;
      }

      connRef.current = conn;
      setupConnection(conn);
      setGameState(prev => ({ 
        ...prev, 
        mode: 'HOST',
        status: 'PLAYING',
        opponentPeerId: conn.peer 
      }));
      setConnectionError(null);
      soundManager.playStart();
    });

    peer.on('disconnected', () => {
       console.warn('Peer disconnected from signaling server.');
       setConnectionError('Connection to server lost. Reconnecting...');
       peer.reconnect();
    });

    peer.on('error', (err) => {
       console.error('Peer error:', err);
       let msg = 'An unknown network error occurred.';
       if (err.type === 'peer-unavailable') {
         msg = 'Lobby ID not found. The host may be offline.';
         // Reset to lobby if we were trying to connect
         if (stateRef.current.status === 'CONNECTING') {
            setGameState(prev => ({ ...prev, status: 'LOBBY' }));
         }
       } else if (err.type === 'unavailable-id') {
         msg = 'ID generation failed. Please refresh.';
       } else if (err.type === 'network') {
         msg = 'Network connection lost.';
       } else if (err.type === 'server-error') {
         msg = 'Unable to reach signaling server.';
       }
       setConnectionError(msg);
       // Auto-clear transient errors after 5s unless it's critical
       if (err.type !== 'unavailable-id') {
         setTimeout(() => setConnectionError(null), 5000);
       }
    });
    
    peerRef.current = peer;
    return peer;
  };

  const initHost = () => {
    soundManager.playSelect();
    initializePeer();
    // No specific action needed, peer.on('connection') handles the start
  };

  const connectToPeer = () => {
    soundManager.playSelect();
    if (!inputPeerId.trim()) return;
    
    const peer = initializePeer();
    
    const proceed = () => {
        // Check for self-connect
        if (inputPeerId === stateRef.current.peerId) {
          setConnectionError("Cannot connect to yourself! Please use a different lobby ID.");
          return;
        }
        
        setGameState(prev => ({ 
            ...prev, 
            mode: 'CLIENT', 
            status: 'CONNECTING' 
        }));
        setConnectionError(null);
        
        const conn = peer.connect(inputPeerId, { reliable: true });
        connRef.current = conn;

        // Connection Timeout Safety
        const timeoutId = setTimeout(() => {
            if (stateRef.current.status === 'CONNECTING') {
                conn.close();
                setGameState(prev => ({ ...prev, status: 'LOBBY' }));
                setConnectionError("Connection timed out. Host did not respond.");
            }
        }, 15000);

        setupConnection(conn, timeoutId);
    };

    if (peer.open) {
        proceed();
    } else {
        peer.once('open', proceed);
    }
  };

  const setupConnection = (conn: DataConnection, timeoutId?: ReturnType<typeof setTimeout>) => {
    conn.on('open', () => {
      if (timeoutId) clearTimeout(timeoutId);
      setConnectionError(null);

      if (stateRef.current.mode === 'HOST') {
        startGameAsHost(conn);
      }
    });

    conn.on('data', (data: any) => {
      handlePeerMessage(data as PeerMessage);
    });

    conn.on('close', () => {
      if (timeoutId) clearTimeout(timeoutId);
      
      if (stateRef.current.status === 'PLAYING') {
          // If in game, this is a forfeit/disconnect win
          setGameState(prev => ({ ...prev, status: 'GAME_OVER', lastWinner: 'ME' }));
          setConnectionError("Opponent Disconnected!");
          soundManager.playWin(); // Tech victory
      } else {
          // If in lobby or connecting, reset
          setGameState(prev => ({ ...prev, status: 'LOBBY' }));
          if (stateRef.current.status === 'CONNECTING') {
              setConnectionError("Connection failed or rejected.");
          }
      }
    });

    conn.on('error', (err) => {
        if (timeoutId) clearTimeout(timeoutId);
        console.error("Connection Error:", err);
        setConnectionError("Data connection error occurred.");
    });
  };

  // --- Game Logic ---
  const startGameAsHost = async (conn: DataConnection) => {
    setIsLoadingDeck(true);
    // Increased delay slightly to ensure connection is stable
    await new Promise(resolve => setTimeout(resolve, 500)); 
    const fullDeck = await generateDeck(16, gameState.selectedDeck || 'Standard');
    setIsLoadingDeck(false);

    const deck1 = fullDeck.slice(0, fullDeck.length / 2);
    const deck2 = fullDeck.slice(fullDeck.length / 2);

    const initialState: Partial<GameState> = {
      myDeck: deck1.slice(1),
      currentMyCard: deck1[0],
      opponentDeckCount: deck2.length,
      pot: [],
      turn: Math.random() > 0.5 ? 'ME' : 'OPPONENT',
      status: 'PLAYING',
      currentOpponentCard: null,
      lastWinner: null,
      lastStat: null
    };

    setGameState(prev => ({ ...prev, ...initialState }));
    conn.send({
      type: 'HANDSHAKE',
      payload: { 
        deck: deck2, 
        turn: initialState.turn === 'ME' ? 'OPPONENT' : 'ME',
        deckType: gameState.selectedDeck,
        gameMode: gameState.gameMode
      }
    });
    soundManager.playStart();
  };

  const startSinglePlayer = async () => {
    soundManager.playSelect();
    setIsLoadingDeck(true);
    const fullDeck = await generateDeck(12, gameState.selectedDeck || 'Standard');
    setIsLoadingDeck(false);

    const deck1 = fullDeck.slice(0, fullDeck.length / 2);
    const deck2 = fullDeck.slice(fullDeck.length / 2);

    setGameState(prev => ({
      ...prev,
      mode: 'SINGLE',
      status: 'PLAYING',
      myDeck: deck1.slice(1),
      currentMyCard: deck1[0],
      opponentDeckCount: deck2.length,
      pot: [],
      currentOpponentCard: null, 
      turn: 'ME',
      lastWinner: null,
      lastStat: null,
      log: [
        { type: 'SYSTEM', message: '> System Initialized' },
        { type: 'SYSTEM', message: '> CPU Opponent Loaded' },
        { type: 'GAME_START', message: `> Deck: ${gameState.selectedDeck || 'Standard'}`, details: { deckType: gameState.selectedDeck || 'Standard' } }
      ],
    }));

    (window as any).cpuDeck = deck2;
    (window as any).cpuCurrentCard = deck2[0];
    (window as any).cpuDeck.shift(); 
    
    soundManager.playStart();
  };

  const handlePeerMessage = async (msg: PeerMessage) => {
    const state = stateRef.current;
    switch (msg.type) {
      case 'HANDSHAKE':
        setGameState(prev => ({
          ...prev,
          status: 'PLAYING',
          myDeck: msg.payload.deck.slice(1),
          currentMyCard: msg.payload.deck[0],
          opponentDeckCount: msg.payload.deck.length,
          pot: [],
          turn: msg.payload.turn,
          selectedDeck: msg.payload.deckType || prev.selectedDeck,
          gameMode: msg.payload.gameMode || prev.gameMode,
          log: [
            { type: 'SYSTEM', message: '> Connection Established' },
            { type: 'GAME_START', message: '> Game Started' },
            { type: 'GAME_START', message: `> Deck: ${msg.payload.deckType || 'Standard'}`, details: { deckType: msg.payload.deckType || 'Standard' } }
          ]
        }));
        soundManager.playStart();
        break;
      case 'MOVE':
        {
          const oppCard = msg.payload.card;
          const stat = msg.payload.stat as StatType;
          const myCard = state.currentMyCard;
          if (!myCard) return;
          connRef.current?.send({ type: 'REVEAL', payload: { card: myCard } });
          await processTurnResult(stat, myCard, oppCard, 'THEM');
        }
        break;
      case 'REVEAL':
        {
          const oppCard = msg.payload.card;
          const myCard = state.currentMyCard;
          const stat = pendingStatRef.current;
          if (!myCard || !stat) return;
          await processTurnResult(stat, myCard, oppCard, 'ME');
          setIsWaitingForOpponent(false);
          pendingStatRef.current = null;
        }
        break;
      case 'GAME_OVER_ACK':
        setGameState(prev => ({ ...prev, status: 'GAME_OVER', lastWinner: 'ME' }));
        soundManager.playWin();
        break;
    }
  };

  const playTurn = (stat: StatType) => {
    if (gameState.turn !== 'ME' || isWaitingForOpponent || gameState.lastWinner) return;
    
    if (gameState.mode === 'SINGLE') {
      const cpuCard = (window as any).cpuCurrentCard;
      processTurnResult(stat, gameState.currentMyCard!, cpuCard, 'ME');
    } else {
      setIsWaitingForOpponent(true);
      pendingStatRef.current = stat;
      connRef.current?.send({ type: 'MOVE', payload: { stat, card: gameState.currentMyCard! } });
    }
  };

  const processTurnResult = async (stat: StatType, myCard: CardData, oppCard: CardData, initiator: 'ME' | 'THEM') => {
    // 1. REVEAL PHASE
    // Immediately show the opponent's card. This triggers the component mount and the 'card-reveal' animation.
    setGameState(prev => ({
      ...prev,
      currentOpponentCard: oppCard,
      aiCommentary: null,
      lastWinner: null // Ensure no winner state is set yet
    }));

    // Wait for the flip/reveal animation to largely complete before showing the result
    await new Promise(resolve => setTimeout(resolve, 800));

    // 2. RESULT PHASE
    const myValue = myCard[stat];
    const oppValue = oppCard[stat];
    
    let winner: 'ME' | 'OPPONENT' | 'DRAW' = 'DRAW';
    if (myValue > oppValue) winner = 'ME';
    if (oppValue > myValue) winner = 'OPPONENT';
    
    if (winner === 'ME') soundManager.playWin();
    else if (winner === 'OPPONENT') soundManager.playLose();
    else soundManager.playSelect(); // Neutral sound for draw

    const commentary = await getBattleCommentary(
      winner === 'ME' ? myCard : oppCard,
      winner === 'ME' ? oppCard : myCard,
      stat,
      winner === 'ME' ? 'Player' : 'Opponent'
    );

    // Create detailed battle log event
    const statLabel = stat.replace('Score', '').replace(/([A-Z])/g, ' $1').trim().toUpperCase();
    const battleLogEvent = {
      type: 'BATTLE' as const,
      message: `> ${statLabel}: ${myCard.login}(${myValue}) vs ${oppCard.login}(${oppValue}) → ${winner === 'ME' ? 'WIN' : (winner === 'DRAW' ? 'DRAW' : 'LOSS')}`,
      details: {
        stat,
        myValue,
        oppValue,
        winner
      }
    };

    setGameState(prev => ({
      ...prev,
      lastWinner: winner,
      lastStat: stat,
      aiCommentary: commentary,
      log: [...prev.log, battleLogEvent]
    }));

    setTimeout(() => nextRound(winner, myCard, oppCard), 3500);
  };

  const nextRound = (winner: 'ME' | 'OPPONENT' | 'DRAW', myCard: CardData, oppCard: CardData) => {
    setGameState(prev => {
      let newMyDeck = [...prev.myDeck];
      // Randomize the order of won cards to prevent infinite strategy loops
      const loot = [myCard, oppCard, ...prev.pot].sort(() => Math.random() - 0.5);
      
      let newPot: CardData[] = [];

      // --- SINGLE PLAYER LOGIC ---
      if (prev.mode === 'SINGLE') {
        const cpuDeck = (window as any).cpuDeck as CardData[];
        
        if (winner === 'ME') {
           newMyDeck.push(...loot);
           newPot = [];
        } else if (winner === 'OPPONENT') {
           cpuDeck.push(...loot);
           newPot = [];
        } else {
           // Draw: Cards go to pot
           newPot = loot; 
        }
        
        // Strict bankruptcy check
        if (newMyDeck.length === 0) return { ...prev, status: 'GAME_OVER', lastWinner: 'OPPONENT' };
        if (cpuDeck.length === 0) return { ...prev, status: 'GAME_OVER', lastWinner: 'ME' };

        const nextMyCard = newMyDeck.shift()!;
        (window as any).cpuCurrentCard = cpuDeck.shift();
        
        return {
          ...prev,
          myDeck: newMyDeck,
          pot: newPot,
          opponentDeckCount: cpuDeck.length + 1, // Deck + Card in Hand
          currentMyCard: nextMyCard,
          currentOpponentCard: null,
          lastWinner: null,
          lastStat: null,
          aiCommentary: null,
          turn: winner === 'ME' ? 'ME' : (winner === 'OPPONENT' ? 'OPPONENT' : prev.turn)
        };
      } 
      
      // --- MULTIPLAYER LOGIC ---
      else {
        if (winner === 'ME') {
           newMyDeck.push(...loot);
           newPot = [];
        } else if (winner === 'OPPONENT') {
           newPot = [];
        } else {
           newPot = loot;
        }
        
        // Bankruptcy check
        if (newMyDeck.length === 0) {
           connRef.current?.send({ type: 'GAME_OVER_ACK' });
           return { ...prev, status: 'GAME_OVER', lastWinner: 'OPPONENT' };
        }
        
        // Accurate Opponent Count Logic
        let oppChange = -1;
        if (winner === 'OPPONENT') {
             oppChange += loot.length;
        }
        
        const newOppCount = prev.opponentDeckCount + oppChange;

        if (newOppCount <= 0 && winner === 'ME') {
             return { ...prev, status: 'GAME_OVER', lastWinner: 'ME' };
        }

        const nextMyCard = newMyDeck.shift()!;
        
        return {
           ...prev,
           myDeck: newMyDeck,
           pot: newPot,
           opponentDeckCount: newOppCount,
           currentMyCard: nextMyCard,
           currentOpponentCard: null,
           lastWinner: null,
           lastStat: null,
           aiCommentary: null,
           turn: winner === 'ME' ? 'ME' : (winner === 'OPPONENT' ? 'OPPONENT' : prev.turn)
        };
      }
    });
  };

  useEffect(() => {
    if (gameState.status === 'PLAYING' && 
        gameState.mode === 'SINGLE' && 
        gameState.turn === 'OPPONENT' && 
        !gameState.lastWinner) {
       
       const timer = setTimeout(() => {
           const cpuCard = (window as any).cpuCurrentCard as CardData;
           if(!cpuCard) return;
           const stats: StatType[] = ['followersScore', 'repositoriesScore', 'influenceScore', 'activityScore', 'techBreadth'];
           const randomStat = stats[Math.floor(Math.random() * stats.length)];
           const myCard = stateRef.current.currentMyCard!;
           processTurnResult(randomStat, myCard, cpuCard, 'THEM');
       }, 2000);
       return () => clearTimeout(timer);
    }
  }, [gameState.status, gameState.mode, gameState.turn, gameState.lastWinner]);
  
  useEffect(() => {
    if (gameState.status === 'GAME_OVER' && gameState.lastWinner === 'ME') {
      soundManager.playWin();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#58a6ff', '#238636', '#ffffff']
      });
    } else if (gameState.status === 'GAME_OVER' && gameState.lastWinner === 'OPPONENT') {
      soundManager.playLose();
    }
  }, [gameState.status]);

  // --- Render Components ---

  const renderTutorialModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
       <div className="w-full max-w-2xl bg-theme-bg border-4 border-theme-primary shadow-theme relative flex flex-col max-h-[90vh] rounded-theme">
          <div className="bg-theme-primary text-theme-bg p-4 flex justify-between items-center border-b-4 border-theme-bg rounded-t-[calc(var(--radius)-4px)]">
             <h2 className="font-pixel text-xl md:text-2xl flex items-center gap-2">
               <Cpu size={24} /> MISSION_BRIEFING
             </h2>
             <button onClick={() => { soundManager.playSelect(); setShowTutorial(false); }} className="hover:text-white transition-colors">
               <X size={28} />
             </button>
          </div>
          <div className="p-6 md:p-8 overflow-y-auto space-y-6 bg-theme-panel rounded-b-theme">
             <div className="space-y-4 font-retro text-lg md:text-xl text-theme-text">
                <p>
                  <span className="text-theme-primary">OBJECTIVE:</span> Bankrupt your opponent by acquiring all their Repository Cards.
                </p>
                <hr className="border-theme-border border-dashed" />
                <div className="flex gap-4">
                   <div className="w-12 h-12 bg-theme-bg border-2 border-theme-border flex items-center justify-center shrink-0 rounded-theme">
                      <Swords size={24} className="text-theme-success" />
                   </div>
                   <div>
                      <h3 className="font-pixel text-theme-text text-sm mb-1">1. BATTLE</h3>
                      <p>Choose the stat with the <strong className="text-theme-primary">HIGHEST VALUE</strong> on your card.</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <div className="w-12 h-12 bg-theme-bg border-2 border-theme-border flex items-center justify-center shrink-0 rounded-theme">
                      <Layers size={24} className="text-theme-accent" />
                   </div>
                   <div>
                      <h3 className="font-pixel text-theme-text text-sm mb-1">3. THE BUFFER</h3>
                      <p>Draws go to the <span className="text-theme-accent">BUFFER</span>. Next winner takes ALL.</p>
                   </div>
                </div>
             </div>
             <button 
                onClick={() => { soundManager.playSelect(); setShowTutorial(false); }}
                className="w-full bg-theme-primary text-theme-bg font-pixel py-3 mt-4 hover:bg-white transition-colors border-b-4 border-theme-border active:border-b-0 active:translate-y-1 rounded-theme"
             >
                ACKNOWLEDGE_RULES
             </button>
          </div>
       </div>
    </div>
  );

  const renderSettingsModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
       <div className="w-full max-w-2xl bg-theme-bg border-4 border-theme-primary shadow-theme relative flex flex-col max-h-[90vh] rounded-theme">
          <div className="bg-theme-primary text-theme-bg p-4 flex justify-between items-center border-b-4 border-theme-bg rounded-t-[calc(var(--radius)-4px)]">
             <h2 className="font-pixel text-xl md:text-2xl flex items-center gap-2">
               <Settings size={24} /> SETTINGS
             </h2>
             <button onClick={() => { soundManager.playSelect(); setShowSettings(false); }} className="hover:text-white transition-colors">
               <X size={28} />
             </button>
          </div>
          <div className="p-6 md:p-8 overflow-y-auto bg-theme-panel rounded-b-theme">
             <h3 className="font-pixel text-theme-text text-sm md:text-lg mb-4">SELECT THEME_MODULE:</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(['cyberpunk', 'snes', 'dreamcast', 'n64', 'psx', 'xbox', 'winxp', 'pc98'] as Theme[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      soundManager.playSelect();
                      setTheme(t);
                    }}
                    className={`
                      p-4 border-4 text-left transition-all rounded-theme flex items-center justify-between group
                      ${theme === t 
                        ? 'border-theme-primary bg-theme-primary/20 shadow-glow' 
                        : 'border-theme-border bg-theme-bg hover:border-theme-text'
                      }
                    `}
                  >
                    <span className={`font-pixel text-xs md:text-sm uppercase ${theme === t ? 'text-theme-primary' : 'text-theme-muted group-hover:text-theme-text'}`}>
                      {t}
                    </span>
                    {theme === t && <div className="w-3 h-3 md:w-4 md:h-4 bg-theme-primary animate-pulse shadow-[0_0_10px_var(--primary)]"></div>}
                  </button>
                ))}
             </div>
             
             <button 
                onClick={() => { soundManager.playSelect(); setShowSettings(false); }}
                className="w-full bg-theme-primary text-theme-bg font-pixel py-3 mt-8 hover:bg-white transition-colors border-b-4 border-theme-border active:border-b-0 active:translate-y-1 rounded-theme"
             >
                CLOSE
             </button>
          </div>
       </div>
    </div>
  );

  const renderDeckSelection = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 md:space-y-12 w-full max-w-6xl 2xl:max-w-7xl mx-auto relative">
      
      {/* Top Bar Controls */}
      <div className="absolute top-4 right-4 flex gap-4">
         <button 
           onClick={() => { soundManager.playSelect(); setShowSettings(true); }}
           className="bg-theme-panel border-2 border-theme-border p-2 md:p-3 rounded-theme hover:border-theme-primary hover:text-theme-primary transition-all group shadow-theme"
           title="Settings"
         >
           <div className="flex items-center gap-2">
             <Settings className="w-6 h-6 2xl:w-10 2xl:h-10" />
           </div>
         </button>

         <button 
           onClick={() => { 
             soundManager.playSelect(); 
             setGameState(prev => ({ ...prev, status: 'LOBBY', selectedDeck: null })); 
           }}
           className="bg-theme-panel border-2 border-theme-border p-2 md:p-3 rounded-theme hover:border-theme-danger hover:text-theme-danger transition-all shadow-theme"
           title="Back to Lobby"
         >
           <div className="flex items-center gap-2">
             <X className="w-6 h-6 2xl:w-10 2xl:h-10" />
           </div>
         </button>
      </div>

      <div className="text-center space-y-4 md:space-y-6 2xl:space-y-12 mt-12 md:mt-0">
        <div className="inline-block p-4 md:p-6 2xl:p-10 border-4 border-theme-primary bg-theme-bg shadow-theme rounded-theme">
             <Layers className="text-theme-primary drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] w-12 h-12 md:w-16 md:h-16 2xl:w-32 2xl:h-32" />
        </div>
        
        <h1 className="text-3xl md:text-6xl 2xl:text-8xl font-pixel tracking-tighter text-theme-text drop-shadow-[4px_4px_0_var(--shadow)] text-glow leading-none">
          SELECT_DECK
        </h1>
        
        <p className="font-retro text-lg md:text-xl 2xl:text-3xl text-theme-muted tracking-widest uppercase">
          {gameState.gameMode === 'TOURNAMENT' ? 'Tournament Mode' : 'Casual Mode'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full px-4">
        {Object.values(DECK_CONFIGS).map((deck) => (
          <button 
            key={deck.id}
            onClick={() => {
              soundManager.playSelect();
              setGameState(prev => ({ ...prev, selectedDeck: deck.id, status: 'LOBBY' }));
            }}
            onMouseEnter={() => soundManager.playHover()}
            className="group relative bg-theme-panel p-6 md:p-8 2xl:p-12 border-4 border-theme-border hover:border-theme-primary active:translate-y-2 transition-all shadow-theme hover:shadow-glow text-left rounded-theme"
          >
            <div className="flex items-start gap-4 md:gap-6">
               <div className="text-5xl md:text-6xl 2xl:text-8xl group-hover:scale-110 transition-transform">
                 {deck.icon}
               </div>
               <div className="flex-1">
                 <h3 className="text-xl md:text-2xl 2xl:text-4xl font-pixel text-theme-text mb-2">{deck.name}</h3>
                 <p className="font-retro text-sm md:text-base 2xl:text-xl text-theme-muted">{deck.description}</p>
                 <div className="mt-3 flex flex-wrap gap-1">
                   {deck.users.slice(0, 5).map((user, i) => (
                     <span key={i} className="text-[10px] md:text-xs 2xl:text-sm font-retro bg-theme-bg text-theme-primary px-2 py-0.5 rounded-theme border border-theme-border">
                       {user}
                     </span>
                   ))}
                   <span className="text-[10px] md:text-xs 2xl:text-sm font-retro text-theme-muted">
                     +{deck.users.length - 5} more
                   </span>
                 </div>
               </div>
            </div>
          </button>
        ))}
      </div>
      
      <div className="font-retro text-theme-muted/40 text-xs md:text-sm 2xl:text-xl">
        SELECT_YOUR_PREFERRED_STACK
      </div>
    </div>
  );

  const renderLobby = () => {
    const hasSelectedDeck = gameState.selectedDeck !== null;
    
    return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 md:space-y-12 w-full max-w-4xl 2xl:max-w-7xl mx-auto relative">
      
      {/* Top Bar Controls */}
      <div className="absolute top-4 right-4 flex gap-4">
         <button 
           onClick={() => { soundManager.playSelect(); setShowSettings(true); }}
           className="bg-theme-panel border-2 border-theme-border p-2 md:p-3 rounded-theme hover:border-theme-primary hover:text-theme-primary transition-all group shadow-theme"
           title="Settings"
         >
           <div className="flex items-center gap-2">
             <Settings className="w-6 h-6 2xl:w-10 2xl:h-10" />
             <span className="font-pixel text-xs 2xl:text-xl hidden group-hover:block uppercase">SETTINGS</span>
           </div>
         </button>

         <button 
           onClick={() => { soundManager.playSelect(); setShowTutorial(true); }}
           className="bg-theme-panel border-2 border-theme-border p-2 md:p-3 rounded-theme hover:border-theme-primary hover:text-theme-primary transition-all group shadow-theme"
         >
           <div className="flex items-center gap-2">
             <span className="font-pixel text-xs 2xl:text-xl hidden group-hover:block">RULES</span>
             <HelpCircle className="w-6 h-6 2xl:w-10 2xl:h-10" />
           </div>
         </button>
      </div>

      {/* Error Banner */}
      {connectionError && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 animate-bounce z-50">
              <div className="bg-theme-danger text-theme-bg p-4 border-4 border-theme-border shadow-theme rounded-theme flex items-center justify-center gap-3">
                  <AlertTriangle className="w-6 h-6" />
                  <span className="font-pixel text-xs md:text-sm 2xl:text-lg text-center uppercase">{connectionError}</span>
              </div>
          </div>
      )}

      <div className="text-center space-y-4 md:space-y-6 2xl:space-y-12 mt-12 md:mt-0">
        <div className="inline-block p-4 md:p-6 2xl:p-10 border-4 border-theme-primary bg-theme-bg shadow-theme rounded-theme animate-bounce">
             <Trophy className="text-theme-primary drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] w-12 h-12 md:w-16 md:h-16 2xl:w-32 2xl:h-32" />
        </div>
        
        <h1 className="text-4xl md:text-8xl 2xl:text-[10rem] font-pixel tracking-tighter text-theme-text drop-shadow-[4px_4px_0_var(--shadow)] flex flex-col md:flex-row items-center justify-center gap-4 text-glow leading-none">
          GitTrunfo
          <span className="bg-theme-accent text-theme-bg px-4 py-1 text-2xl md:text-5xl 2xl:text-7xl -rotate-6 border-4 border-white shadow-lg rounded-theme">
            PVP
          </span>
        </h1>
        
        <p className="font-retro text-lg md:text-2xl 2xl:text-4xl text-theme-muted tracking-widest uppercase text-glow">
          {'>> Insert Coin to Initialize P2P Battle'}
        </p>
      </div>

      {/* Game Mode Selection */}
      <div className="w-full max-w-xl 2xl:max-w-4xl bg-theme-bg p-1 border-4 border-theme-border shadow-theme rounded-theme mx-4">
        <div className="bg-theme-panel p-4 md:p-6 flex flex-col gap-4 rounded-[calc(var(--radius)-4px)]">
            <h3 className="font-pixel text-xs md:text-sm 2xl:text-xl text-theme-text flex items-center gap-2">
              <Gamepad2 size={16} className="2xl:w-6 2xl:h-6" /> GAME_MODE:
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => {
                  soundManager.playSelect();
                  setGameState(prev => ({ ...prev, gameMode: 'CASUAL' }));
                }}
                className={`p-4 border-4 transition-all rounded-theme ${
                  gameState.gameMode === 'CASUAL'
                    ? 'border-theme-primary bg-theme-primary/20 shadow-glow'
                    : 'border-theme-border bg-theme-bg hover:border-theme-text'
                }`}
              >
                <span className={`font-pixel text-xs md:text-sm 2xl:text-xl uppercase ${gameState.gameMode === 'CASUAL' ? 'text-theme-primary' : 'text-theme-muted'}`}>
                  Casual
                </span>
              </button>
              <button
                onClick={() => {
                  soundManager.playSelect();
                  setGameState(prev => ({ ...prev, gameMode: 'TOURNAMENT' }));
                }}
                className={`p-4 border-4 transition-all rounded-theme ${
                  gameState.gameMode === 'TOURNAMENT'
                    ? 'border-theme-primary bg-theme-primary/20 shadow-glow'
                    : 'border-theme-border bg-theme-bg hover:border-theme-text'
                }`}
              >
                <span className={`font-pixel text-xs md:text-sm 2xl:text-xl uppercase ${gameState.gameMode === 'TOURNAMENT' ? 'text-theme-primary' : 'text-theme-muted'}`}>
                  Tournament
                </span>
              </button>
            </div>
        </div>
      </div>

      {/* Deck Selection Display */}
      <div className="w-full max-w-xl 2xl:max-w-4xl bg-theme-bg p-1 border-4 border-theme-border shadow-theme rounded-theme mx-4">
        <div className="bg-theme-panel p-4 md:p-6 flex flex-col gap-4 rounded-[calc(var(--radius)-4px)]">
            <h3 className="font-pixel text-xs md:text-sm 2xl:text-xl text-theme-text flex items-center gap-2">
              <Layers size={16} className="2xl:w-6 2xl:h-6" /> SELECTED_DECK:
            </h3>
            {hasSelectedDeck ? (
              <div className="flex items-center justify-between p-4 bg-theme-bg border-2 border-theme-primary rounded-theme">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{gameState.selectedDeck ? DECK_CONFIGS[gameState.selectedDeck].icon : '⭐'}</span>
                  <div>
                    <p className="font-pixel text-sm md:text-base 2xl:text-xl text-theme-primary">
                      {gameState.selectedDeck ? DECK_CONFIGS[gameState.selectedDeck].name : 'Unknown'}
                    </p>
                    <p className="font-retro text-xs md:text-sm 2xl:text-lg text-theme-muted">
                      {gameState.selectedDeck ? DECK_CONFIGS[gameState.selectedDeck].description : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    soundManager.playSelect();
                    setGameState(prev => ({ ...prev, status: 'DECK_SELECT' }));
                  }}
                  className="bg-theme-primary text-theme-bg font-pixel px-4 py-2 2xl:px-6 2xl:py-3 2xl:text-xl rounded-theme hover:bg-theme-text hover:text-theme-primary transition-colors"
                >
                  CHANGE
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  soundManager.playSelect();
                  setGameState(prev => ({ ...prev, status: 'DECK_SELECT' }));
                }}
                className="p-4 bg-theme-bg border-2 border-dashed border-theme-border hover:border-theme-primary rounded-theme transition-all"
              >
                <span className="font-pixel text-sm md:text-base 2xl:text-xl text-theme-muted hover:text-theme-primary">
                  {'>> CLICK TO SELECT DECK <<'}
                </span>
              </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full px-4">
        <button 
             onClick={hasSelectedDeck ? startSinglePlayer : undefined}
             onMouseEnter={() => hasSelectedDeck && soundManager.playHover()}
             disabled={!hasSelectedDeck}
             className={`group relative bg-theme-panel p-6 md:p-8 2xl:p-16 border-4 border-theme-border transition-all shadow-theme text-left rounded-theme ${
               hasSelectedDeck 
                 ? 'hover:border-theme-primary active:translate-y-2 hover:shadow-glow cursor-pointer' 
                 : 'opacity-50 cursor-not-allowed'
             }`}
        >
          <div className="absolute top-0 left-0 bg-theme-primary text-theme-bg font-pixel text-[10px] md:text-xs 2xl:text-xl px-2 py-1 rounded-tl-[calc(var(--radius)-4px)]">1 PLAYER</div>
          <div className="flex items-center gap-4 md:gap-6 mb-2 md:mb-4 mt-2">
             <Cpu className={`text-theme-primary ${hasSelectedDeck ? 'group-hover:scale-110' : ''} transition-transform w-10 h-10 md:w-12 md:h-12 2xl:w-24 2xl:h-24`} />
             <div>
               <h3 className="text-xl md:text-2xl 2xl:text-5xl font-pixel text-theme-text mb-1">VS CPU</h3>
               <p className="font-retro text-base md:text-lg 2xl:text-2xl text-theme-muted">TRAINING_MODE.EXE</p>
             </div>
          </div>
        </button>

        <button 
             onClick={hasSelectedDeck ? initHost : undefined}
             onMouseEnter={() => hasSelectedDeck && soundManager.playHover()}
             disabled={!hasSelectedDeck}
             className={`group relative bg-theme-panel p-6 md:p-8 2xl:p-16 border-4 border-theme-border transition-all shadow-theme text-left rounded-theme ${
               hasSelectedDeck 
                 ? 'hover:border-theme-success active:translate-y-2 hover:shadow-[0_0_15px_var(--success)] cursor-pointer' 
                 : 'opacity-50 cursor-not-allowed'
             }`}
        >
          <div className="absolute top-0 left-0 bg-theme-success text-theme-bg font-pixel text-[10px] md:text-xs 2xl:text-xl px-2 py-1 rounded-tl-[calc(var(--radius)-4px)]">2 PLAYER</div>
          <div className="flex items-center gap-4 md:gap-6 mb-2 md:mb-4 mt-2">
             <Wifi className={`text-theme-success ${hasSelectedDeck ? 'group-hover:scale-110' : ''} transition-transform w-10 h-10 md:w-12 md:h-12 2xl:w-24 2xl:h-24`} />
             <div>
               <h3 className="text-xl md:text-2xl 2xl:text-5xl font-pixel text-theme-text mb-1">HOST GAME</h3>
               <p className="font-retro text-base md:text-lg 2xl:text-2xl text-theme-muted">CREATE_LOBBY.BAT</p>
             </div>
          </div>
        </button>
      </div>

      <div className="w-full max-w-xl 2xl:max-w-4xl bg-theme-bg p-1 border-4 border-theme-border shadow-theme rounded-theme mx-4">
        <div className="bg-theme-panel p-4 md:p-6 flex flex-col gap-4 rounded-[calc(var(--radius)-4px)]">
            <h3 className="font-pixel text-xs md:text-sm 2xl:text-xl text-theme-text flex items-center gap-2">
              <User size={16} className="2xl:w-6 2xl:h-6" /> JOIN_EXISTING_LOBBY:
            </h3>
            <div className="flex gap-0">
              <input 
                type="text" 
                placeholder="PASTE_LOBBY_ID_HERE..." 
                className="flex-1 bg-theme-bg border-2 border-r-0 border-theme-border p-3 md:p-4 font-retro text-lg md:text-xl 2xl:text-3xl text-theme-text focus:outline-none focus:border-theme-primary focus:border-r-2 placeholder:text-theme-muted/50 rounded-l-theme min-w-0"
                value={inputPeerId}
                onChange={(e) => setInputPeerId(e.target.value)}
                disabled={!hasSelectedDeck}
              />
              <button 
                onClick={hasSelectedDeck ? connectToPeer : undefined}
                disabled={!hasSelectedDeck}
                className={`bg-theme-primary text-theme-bg font-pixel font-bold px-4 md:px-8 2xl:px-12 2xl:text-2xl border-2 border-theme-primary rounded-r-theme ${
                  hasSelectedDeck ? 'hover:bg-theme-text hover:text-theme-primary' : 'opacity-50 cursor-not-allowed'
                } transition-colors`}
              >
                {gameState.status === 'CONNECTING' ? '...' : 'CONNECT'}
              </button>
            </div>
        </div>
      </div>
      
      {gameState.peerId && (
        <div className="w-full max-w-xl 2xl:max-w-4xl border-4 border-dashed border-theme-primary/50 p-6 bg-theme-primary/10 flex flex-col items-center animate-fade-in text-center rounded-theme mx-4">
           <p className="font-pixel text-xs 2xl:text-lg text-theme-primary mb-2 text-glow">{'>> YOUR_LOBBY_COORDINATES:'}</p>
           <div className="flex items-center gap-2 w-full justify-center bg-theme-bg border-2 border-theme-primary/30 p-4 mb-2 cursor-pointer hover:bg-theme-bg/80 rounded-theme shadow-theme"
                onClick={() => { navigator.clipboard.writeText(gameState.peerId!); soundManager.playSelect(); }}>
              <code className="text-theme-primary font-retro text-sm md:text-xl 2xl:text-3xl truncate break-all">{gameState.peerId}</code>
              <Copy size={16} className="text-theme-primary shrink-0 2xl:w-6 2xl:h-6" />
           </div>
           <p className="font-retro text-theme-primary/60 animate-pulse 2xl:text-xl">WAITING_FOR_CHALLENGER...</p>
        </div>
      )}
      
      <div className="font-retro text-theme-muted/40 text-xs md:text-sm 2xl:text-xl">v.2.1.0 THEME_ENGINE // {theme.toUpperCase()}</div>
    </div>
    );
  };

  const renderGame = () => {
    if (isLoadingDeck) return (
       <div className="min-h-screen flex items-center justify-center flex-col gap-6">
         <div className="relative">
             <div className="w-24 h-24 border-8 border-theme-border border-t-theme-primary animate-spin rounded-full"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                 <Disc className="animate-spin text-theme-muted/20" size={32} />
             </div>
         </div>
         <p className="font-pixel text-xl animate-pulse text-theme-primary text-glow">LOADING_ASSETS...</p>
       </div>
    );

    // Connection Status Logic
    const getConnStatus = () => {
         if (gameState.mode === 'SINGLE') return { label: 'CPU', color: 'bg-theme-success', pulse: false };
         if (connectionError) return { label: 'ERR', color: 'bg-theme-danger', pulse: true };
         if (gameState.status === 'CONNECTING') return { label: 'SYNC', color: 'bg-theme-primary', pulse: true };
         if (gameState.status === 'PLAYING') return { label: 'LIVE', color: 'bg-theme-success', pulse: false };
         return { label: 'OFF', color: 'bg-theme-muted', pulse: false };
    };
    const connStatus = getConnStatus();
    
    // Determine hidden card label
    let hiddenCardLabel: string | null = null;
    if (gameState.turn === 'OPPONENT') {
        hiddenCardLabel = "OPPONENT THINKING...";
    } else if (isWaitingForOpponent) {
        hiddenCardLabel = "SYNCING DATA...";
    }

    // Helper for Pot Stack
    const renderPotStack = () => {
        if (gameState.pot.length === 0) return <div className="h-2"></div>;
        
        // Visual cap to prevent stack from getting too high/wide
        const stackSize = Math.min(gameState.pot.length, 6);
        
        return (
            <div className="relative mt-2 mb-1 group" title={`${gameState.pot.length} cards in buffer`}>
                <div className="relative w-8 h-10 md:w-12 md:h-16">
                    {Array.from({ length: stackSize }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute bg-theme-accent border border-theme-bg rounded-[3px] shadow-sm flex items-center justify-center transition-all duration-300"
                            style={{
                                width: '100%',
                                height: '100%',
                                top: `${i * -2}px`,
                                left: `${i * 2}px`, // Stacking diagonally to the right
                                zIndex: i
                            }}
                        >
                             {/* Card Back Pattern */}
                             <div className="w-full h-full opacity-30 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000)] bg-[length:6px_6px] bg-[position:0_0,3px_3px]"></div>
                        </div>
                    ))}
                    
                    {/* Count Badge on the top card */}
                    <div 
                        className="absolute flex items-center justify-center z-20"
                        style={{
                            top: `${(stackSize - 1) * -2}px`,
                            left: `${(stackSize - 1) * 2}px`,
                            width: '100%',
                            height: '100%'
                        }}
                    >
                        <span className="font-pixel font-bold text-theme-bg text-sm md:text-xl drop-shadow-[0_2px_0_rgba(255,255,255,0.5)]">
                            {gameState.pot.length}
                        </span>
                    </div>
                </div>
                
                {/* Label */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 md:mt-2 bg-theme-bg/80 px-1 rounded backdrop-blur-sm">
                   <span className="font-pixel text-[8px] md:text-[10px] text-theme-accent tracking-widest whitespace-nowrap block text-center">BUFFER</span>
                </div>
            </div>
        );
    };

    return (
      <div className="min-h-screen flex flex-col p-2 md:p-4 max-w-7xl 2xl:max-w-[120rem] mx-auto overflow-hidden md:overflow-visible">
         {/* HUD */}
         <div className="flex flex-row md:flex-row justify-between items-start md:items-center mb-4 md:mb-12 border-b-4 border-theme-border pb-2 md:pb-6 bg-theme-bg/90 sticky top-0 z-50 backdrop-blur-sm px-2 md:px-4 rounded-b-theme shadow-theme">
            {/* Player 1 Status */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-6 w-1/3 md:w-auto">
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 md:w-16 md:h-16 2xl:w-24 2xl:h-24 bg-theme-primary border-4 border-white shadow-theme flex items-center justify-center font-pixel font-bold text-theme-bg text-lg md:text-2xl 2xl:text-4xl rounded-theme">P1</div>
                 <div className="md:hidden flex flex-col">
                   <div className="h-2 w-16 bg-theme-panel border border-theme-border relative overflow-hidden rounded-full">
                      <div className="absolute inset-0 bg-theme-primary w-full"></div>
                   </div>
                   <span className="font-pixel text-[10px] text-theme-primary leading-none mt-1">{gameState.myDeck.length}</span>
                 </div>
               </div>
               
               <div className="hidden md:flex flex-col">
                 <div className="h-4 w-32 md:w-48 2xl:w-64 bg-theme-panel border-2 border-theme-border relative overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-theme-primary" style={{ width: '100%' }}></div>
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:4px_100%]"></div>
                 </div>
                 <span className="font-pixel text-xs 2xl:text-xl text-theme-primary mt-1 text-glow">DECK: {gameState.myDeck.length + (gameState.currentMyCard ? 1 : 0)}</span>
               </div>
            </div>
            
            {/* Center Status & Pot */}
            <div className="flex flex-col items-center z-10 w-1/3 md:w-auto pt-2 md:pt-0">
               <div className={`px-2 md:px-6 py-1 md:py-2 border-2 md:border-4 border-b-4 md:border-b-8 font-pixel text-[10px] md:text-sm 2xl:text-2xl tracking-widest mb-1 md:mb-2 transition-all rounded-theme text-center whitespace-nowrap
                  ${gameState.turn === 'ME' 
                    ? 'bg-theme-success border-theme-success/50 text-theme-bg shadow-glow' 
                    : 'bg-theme-danger border-theme-danger/50 text-theme-bg'
                  }`}>
                 {gameState.turn === 'ME' ? 'YOUR TURN' : 'OPP TURN'}
               </div>
               
               {/* POT DISPLAY STACK */}
               {gameState.pot.length > 0 && renderPotStack()}

               {isWaitingForOpponent && <span className="font-retro text-[10px] md:text-xs 2xl:text-lg animate-pulse text-theme-muted mt-1">SYNCING...</span>}
            </div>

            {/* Player 2 Status */}
            <div className="flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-6 w-1/3 md:w-auto justify-end">
               <div className="hidden md:flex flex-col items-end">
                 <div className="h-4 w-32 md:w-48 2xl:w-64 bg-theme-panel border-2 border-theme-border relative overflow-hidden rounded-full">
                    <div className="absolute inset-0 bg-theme-danger" style={{ width: '100%' }}></div>
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:4px_100%]"></div>
                 </div>
                 <div className="flex justify-between w-full">
                    <span className="font-pixel text-xs 2xl:text-xl text-theme-danger mt-1 text-glow">DECK: {gameState.opponentDeckCount}</span>
                    <div className="flex items-center gap-1.5 mt-1 bg-theme-bg border border-theme-border px-2 py-0.5 rounded-full shadow-sm">
                        <div className={`w-2 h-2 rounded-full ${connStatus.color} ${connStatus.pulse ? 'animate-pulse' : ''}`}></div>
                        <span className="font-pixel text-[8px] 2xl:text-xs text-theme-muted tracking-wider">{connStatus.label}</span>
                    </div>
                 </div>
               </div>
               
               <div className="flex items-center gap-2">
                 <div className="md:hidden flex flex-col items-end">
                   <div className="h-2 w-16 bg-theme-panel border border-theme-border relative overflow-hidden rounded-full">
                      <div className="absolute inset-0 bg-theme-danger w-full"></div>
                   </div>
                   <span className="font-pixel text-[10px] text-theme-danger leading-none mt-1">{gameState.opponentDeckCount}</span>
                 </div>
                 <div className="relative">
                    <div className="w-10 h-10 md:w-16 md:h-16 2xl:w-24 2xl:h-24 bg-theme-danger border-4 border-white shadow-theme flex items-center justify-center font-pixel font-bold text-white text-lg md:text-2xl 2xl:text-4xl rounded-theme">P2</div>
                     {/* Mobile Connection Indicator */}
                     <div className="md:hidden absolute -bottom-1.5 -right-1.5 bg-theme-bg border border-theme-border rounded-full p-1 shadow-sm flex items-center justify-center">
                        <div className={`w-2.5 h-2.5 rounded-full ${connStatus.color} ${connStatus.pulse ? 'animate-pulse' : ''}`}></div>
                     </div>
                 </div>
               </div>
            </div>
            
             {/* Settings Button in Game */}
             <button 
               onClick={() => { soundManager.playSelect(); setShowSettings(true); }}
               className="absolute right-0 top-16 md:top-20 bg-theme-panel border-2 border-theme-border p-2 rounded-theme hover:border-theme-primary text-theme-muted hover:text-theme-primary transition-all shadow-theme z-50"
             >
               <Settings className="w-4 h-4 2xl:w-6 2xl:h-6" />
             </button>
         </div>

         {/* Battle Arena */}
         <div className="flex-1 flex flex-col md:flex-row items-center justify-start md:justify-center gap-6 md:gap-16 2xl:gap-32 relative py-4 md:py-8 min-h-0">
            {/* Opponent Card (Top on Mobile) */}
            <div className="relative z-10 order-1 md:order-3">
               {gameState.currentOpponentCard ? (
                  <Card 
                    key={gameState.currentOpponentCard.login}
                    data={gameState.currentOpponentCard} 
                    disabled={true}
                    isWinner={gameState.lastWinner === 'OPPONENT'}
                    isLoser={gameState.lastWinner === 'ME'}
                    animationType="reveal"
                    highlightStat={gameState.lastStat}
                  />
               ) : (
                  <div className="md:block hidden">
                      <Card 
                        key="hidden-opponent"
                        data={gameState.currentMyCard!} // Dummy data
                        hidden={true} 
                        processingLabel={hiddenCardLabel}
                      />
                  </div>
               )}
                {/* Mobile Hidden Opponent Indicator */}
                {!gameState.currentOpponentCard && (
                    <div className="md:hidden w-[80vw] h-16 bg-theme-panel border-4 border-theme-border border-dashed flex items-center justify-center rounded-theme animate-pulse">
                        <span className={`font-pixel text-xs ${hiddenCardLabel ? 'text-theme-primary' : 'text-theme-muted'}`}>
                            {hiddenCardLabel || "OPPONENT WAITING..."}
                        </span>
                    </div>
                )}
            </div>

            {/* VS Graphic */}
            <div className="flex items-center justify-center z-0 order-2 md:order-2 my-2 md:my-0">
               <div className="relative md:block hidden">
                  <Swords className="text-theme-border opacity-50 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 2xl:w-48 2xl:h-48" />
                  <h1 className="font-pixel text-6xl 2xl:text-9xl text-theme-text italic drop-shadow-[4px_4px_0_#000] z-10 relative text-glow">VS</h1>
               </div>
               <div className="md:hidden font-pixel text-xl text-theme-muted opacity-50">VS</div>
            </div>

             {/* Player Card (Bottom on Mobile) */}
            <div className="relative group z-10 order-3 md:order-1">
               {gameState.turn === 'ME' && !gameState.lastWinner && (
                 <div className="absolute -top-8 md:-top-12 left-1/2 -translate-x-1/2 font-pixel text-theme-primary animate-bounce text-xs 2xl:text-xl whitespace-nowrap text-glow">
                    VV SELECT STAT VV
                 </div>
               )}
               <div className="transition-transform duration-300 md:hover:scale-[1.02]">
                 {gameState.currentMyCard && (
                   <Card 
                     key={gameState.currentMyCard.login}
                     data={gameState.currentMyCard} 
                     onSelectStat={playTurn}
                     disabled={gameState.turn !== 'ME' || isWaitingForOpponent || !!gameState.lastWinner}
                     isWinner={gameState.lastWinner === 'ME'}
                     isLoser={gameState.lastWinner === 'OPPONENT'}
                     highlightStat={gameState.lastStat}
                   />
                 )}
               </div>
            </div>
         </div>

         {/* Commentary Box / Terminal Log */}
         {/* Desktop Log */}
         <div className="hidden md:flex mt-8 2xl:mt-16 mb-4 justify-center">
            <div className="w-full max-w-3xl 2xl:max-w-5xl bg-theme-bg border-4 border-theme-border p-1 shadow-theme rounded-theme">
               <div className="bg-theme-panel h-48 2xl:h-64 rounded-[calc(var(--radius)-4px)] flex flex-col overflow-hidden relative">
                  {/* Terminal Header */}
                  <div className="flex gap-2 p-2 border-b border-theme-border/30 bg-theme-bg/30">
                     <div className="w-3 h-3 2xl:w-5 2xl:h-5 rounded-full bg-theme-danger"></div>
                     <div className="w-3 h-3 2xl:w-5 2xl:h-5 rounded-full bg-theme-primary"></div>
                     <div className="w-3 h-3 2xl:w-5 2xl:h-5 rounded-full bg-theme-success"></div>
                     <span className="font-retro text-theme-muted/50 text-xs 2xl:text-lg ml-auto">BATTLE_LOG.EXE</span>
                  </div>
                  
                  {/* Log Output */}
                  <div ref={logContainerRef} className="flex-1 p-4 overflow-y-auto font-retro text-lg 2xl:text-2xl space-y-1">
                    {gameState.log.map((event, i) => (
                      <div key={i} className={`${i === gameState.log.length - 1 ? 'text-theme-primary animate-pulse' : 'text-theme-text/70'}`}>
                        {event.message}
                      </div>
                    ))}
                    <div className="text-theme-primary animate-pulse">_</div>
                  </div>
               </div>
            </div>
         </div>

         {/* Mobile Log Drawer */}
         <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-300 ${showLogMobile ? 'translate-y-0' : 'translate-y-[calc(100%-2.5rem)]'}`}>
            <div className="bg-theme-panel border-t-4 border-theme-primary shadow-[0_-4px_10px_rgba(0,0,0,0.5)] rounded-t-theme mx-2">
                 <button 
                    onClick={() => setShowLogMobile(!showLogMobile)}
                    className="w-full flex items-center justify-center p-2 bg-theme-primary/10 text-theme-primary font-pixel text-xs border-b border-theme-border/50"
                 >
                    {showLogMobile ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    <span className="ml-2">BATTLE LOG</span>
                 </button>
                 <div className="h-48 p-4 overflow-y-auto font-retro text-sm space-y-1 bg-theme-bg">
                    {gameState.log.map((event, i) => (
                      <div key={i} className={`${i === gameState.log.length - 1 ? 'text-theme-primary' : 'text-theme-text/70'}`}>
                        {event.message}
                      </div>
                    ))}
                 </div>
            </div>
         </div>
      </div>
    );
  };
  
  const renderGameOver = () => (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-theme-bg relative overflow-hidden p-4">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20 animate-pulse"></div>
        
        <h1 className={`text-5xl md:text-8xl 2xl:text-[12rem] font-pixel text-transparent bg-clip-text drop-shadow-[8px_8px_0_rgba(255,255,255,0.2)] z-10 text-center
           ${gameState.lastWinner === 'ME' 
             ? 'bg-gradient-to-b from-yellow-300 to-yellow-600' 
             : 'bg-gradient-to-b from-gray-400 to-gray-700'
           }`}>
          {gameState.lastWinner === 'ME' ? 'VICTORY' : 'GAME OVER'}
        </h1>
        
        <div className="z-10 bg-theme-panel p-8 2xl:p-16 border-4 border-theme-text shadow-theme text-center max-w-lg 2xl:max-w-4xl rounded-theme">
          <p className="font-retro text-xl md:text-2xl 2xl:text-5xl text-theme-text mb-6 2xl:mb-12 uppercase tracking-widest border-b-2 border-dashed border-theme-border pb-4">
            {connectionError ? (
               <span className="text-theme-danger animate-pulse flex items-center justify-center gap-2">
                   <AlertTriangle className="w-8 h-8" /> {connectionError}
               </span>
            ) : (
               gameState.lastWinner === 'ME' ? 'ALL REPOSITORIES MERGED' : 'BRANCH DELETED BY ADMIN'
            )}
          </p>
          
          <button 
            onClick={resetGame}
            className="w-full bg-theme-primary text-theme-bg font-pixel py-4 2xl:py-8 2xl:text-4xl border-b-8 border-theme-border hover:border-b-4 hover:translate-y-1 active:border-b-0 active:translate-y-2 transition-all flex items-center justify-center gap-4 rounded-theme"
          >
            <RotateCcw className="w-6 h-6 2xl:w-12 2xl:h-12" /> INSERT COIN (RESTART)
          </button>
        </div>
        
        <div className="font-retro text-theme-muted/30 mt-8 animate-pulse text-sm md:text-base 2xl:text-2xl">PRESS RESTART TO CONTINUE...</div>
    </div>
  );

  const resetGame = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-theme-bg text-theme-text font-sans scanlines" data-theme={theme}>
      {gameState.status === 'LOBBY' && renderLobby()}
      {gameState.status === 'DECK_SELECT' && renderDeckSelection()}
      {(gameState.status === 'PLAYING' || gameState.status === 'CONNECTING') && renderGame()}
      {gameState.status === 'GAME_OVER' && renderGameOver()}
      {showTutorial && renderTutorialModal()}
      {showSettings && renderSettingsModal()}
    </div>
  );
};

export default App;