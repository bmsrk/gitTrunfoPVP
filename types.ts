export interface GithubUser {
  login: string;
  avatar_url: string;
  name: string;
  public_repos: number;
  followers: number;
  following: number;
  public_gists: number;
  created_at: string;
  bio: string;
}

export interface GitHubRepoStats {
  totalStars: number;
  totalForks: number;
  avgStarsPerRepo: number;
  topRepoStars: number;
  recentCommits: number;
  lastCommitDate: string | null;
}

export interface GitHubLanguageStats {
  languages: Record<string, number>; // language name -> bytes
  topLanguage: string | null;
  languageCount: number;
}

export interface CardData extends GithubUser {
  seniority: number; // calculated years active
  // Strategic Attributes (normalized 0-100)
  followersScore: number;
  repositoriesScore: number;
  influenceScore: number;
  activityScore: number;
  techBreadth: number;
  // Enriched data (optional, may be missing due to rate limits)
  repoStats?: GitHubRepoStats;
  languageStats?: GitHubLanguageStats;
}

export type StatType = 
  | 'followersScore' 
  | 'repositoriesScore' 
  | 'influenceScore' 
  | 'activityScore' 
  | 'techBreadth'
  // Keep old stats for backward compatibility during migration
  | 'public_repos' 
  | 'followers' 
  | 'following' 
  | 'public_gists' 
  | 'seniority';

export type DeckType = 'Standard' | 'Web' | 'LegacyLanguages' | 'Esoteric' | 'Corporate';

export interface DeckConfig {
  id: DeckType;
  name: string;
  description: string;
  icon: string;
  users: string[];
}

export interface BattleLogEvent {
  type: 'SYSTEM' | 'BATTLE' | 'ROUND_END' | 'GAME_START';
  message: string;
  details?: {
    stat?: StatType;
    myValue?: number;
    oppValue?: number;
    myNormalized?: number;
    oppNormalized?: number;
    myScore?: number;
    oppScore?: number;
    winner?: 'ME' | 'OPPONENT' | 'DRAW';
    deckType?: DeckType;
  };
}

export interface GameState {
  status: 'LOBBY' | 'DECK_SELECT' | 'CONNECTING' | 'PLAYING' | 'GAME_OVER';
  mode: 'SINGLE' | 'HOST' | 'CLIENT';
  gameMode: 'CASUAL' | 'TOURNAMENT';
  selectedDeck: DeckType | null;
  myDeck: CardData[];
  opponentDeckCount: number;
  currentMyCard: CardData | null;
  currentOpponentCard: CardData | null;
  pot: CardData[]; // Cards held in limbo during draws
  turn: 'ME' | 'OPPONENT';
  lastWinner: 'ME' | 'OPPONENT' | 'DRAW' | null;
  lastStat: StatType | null;
  log: BattleLogEvent[];
  peerId: string | null;
  opponentPeerId: string | null;
  aiCommentary: string | null;
  // Tournament mode
  tournamentRound: number;
  tournamentWins: number;
  tournamentLosses: number;
}

export interface PeerMessage {
  type: 'HANDSHAKE' | 'MOVE' | 'RESULT' | 'RESTART' | 'REVEAL' | 'GAME_OVER_ACK';
  payload?: any;
}