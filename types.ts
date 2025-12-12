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

export interface CardData extends GithubUser {
  seniority: number; // calculated years active
}

export type StatType = 'public_repos' | 'followers' | 'following' | 'public_gists' | 'seniority';

export interface GameState {
  status: 'LOBBY' | 'CONNECTING' | 'PLAYING' | 'GAME_OVER';
  mode: 'SINGLE' | 'HOST' | 'CLIENT';
  myDeck: CardData[];
  opponentDeckCount: number;
  currentMyCard: CardData | null;
  currentOpponentCard: CardData | null;
  pot: CardData[]; // Cards held in limbo during draws
  turn: 'ME' | 'OPPONENT';
  lastWinner: 'ME' | 'OPPONENT' | 'DRAW' | null;
  lastStat: StatType | null;
  log: string[];
  peerId: string | null;
  opponentPeerId: string | null;
  aiCommentary: string | null;
}

export interface PeerMessage {
  type: 'HANDSHAKE' | 'MOVE' | 'RESULT' | 'RESTART' | 'REVEAL' | 'GAME_OVER_ACK';
  payload?: any;
}