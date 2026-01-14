
export enum Category {
  BATSMAN = 'Batsman',
  BOWLER = 'Bowler',
  ALL_ROUNDER = 'All-Rounder',
  WICKET_KEEPER = 'Wicket Keeper'
}

export interface Player {
  id: string;
  name: string;
  price: number;
  category: Category;
  impactScore: number; // 0-100 rating
  isOverseas: boolean;
}

export interface Team {
  name: string;
  players: Player[];
  budget: number;
  rating: number;
}

export enum GameState {
  SETUP = 'SETUP',
  MARKET = 'MARKET',
  BIDDING = 'BIDDING',
  FINISH = 'FINISH'
}

export interface AuctionSession {
  currentPlayer: Player | null;
  currentBid: number;
  cpuInterested: boolean;
  waitingForUser: boolean;
  log: string[];
}
