
import { Category, Player } from './types';

export const INITIAL_PLAYERS: Player[] = [
  // Batsmen
  { id: '1', name: "Virat Kohli 🏏", price: 15, category: Category.BATSMAN, impactScore: 98, isOverseas: false },
  { id: '2', name: "Rohit Sharma 🏏", price: 16, category: Category.BATSMAN, impactScore: 95, isOverseas: false },
  { id: '3', name: "David Warner 🏏", price: 12, category: Category.BATSMAN, impactScore: 92, isOverseas: true },
  { id: '4', name: "Shubman Gill 🏏", price: 13, category: Category.BATSMAN, impactScore: 89, isOverseas: false },
  { id: '5', name: "Suryakumar Yadav 🏏", price: 11, category: Category.BATSMAN, impactScore: 94, isOverseas: false },
  { id: '6', name: "KL Rahul 🏏", price: 14, category: Category.BATSMAN, impactScore: 88, isOverseas: false },
  { id: '7', name: "Faf du Plessis 🏏", price: 10, category: Category.BATSMAN, impactScore: 87, isOverseas: true },
  { id: '8', name: "Devdutt Padikkal 🏏", price: 8, category: Category.BATSMAN, impactScore: 78, isOverseas: false },
  { id: '9', name: "Ruturaj Gaikwad 🏏", price: 12, category: Category.BATSMAN, impactScore: 90, isOverseas: false },
  { id: '10', name: "Shikhar Dhawan 🏏", price: 9, category: Category.BATSMAN, impactScore: 85, isOverseas: false },
  { id: '11', name: "Steve Smith 🏏", price: 10, category: Category.BATSMAN, impactScore: 86, isOverseas: true },
  { id: '12', name: "Kane Williamson 🏏", price: 11, category: Category.BATSMAN, impactScore: 88, isOverseas: true },
  
  // Wicket Keepers
  { id: '13', name: "MS Dhoni 🧤", price: 12, category: Category.WICKET_KEEPER, impactScore: 99, isOverseas: false },
  { id: '14', name: "Rishabh Pant 🧤", price: 16, category: Category.WICKET_KEEPER, impactScore: 93, isOverseas: false },
  { id: '15', name: "Jos Buttler 🧤", price: 14, category: Category.WICKET_KEEPER, impactScore: 96, isOverseas: true },
  { id: '16', name: "Quinton de Kock 🧤", price: 11, category: Category.WICKET_KEEPER, impactScore: 89, isOverseas: true },
  { id: '17', name: "Ishan Kishan 🧤", price: 15, category: Category.WICKET_KEEPER, impactScore: 87, isOverseas: false },
  { id: '18', name: "Sanju Samson 🧤", price: 13, category: Category.WICKET_KEEPER, impactScore: 88, isOverseas: false },

  // Bowlers
  { id: '19', name: "Jasprit Bumrah ⚡", price: 17, category: Category.BOWLER, impactScore: 98, isOverseas: false },
  { id: '20', name: "Rashid Khan 🌀", price: 15, category: Category.BOWLER, impactScore: 97, isOverseas: true },
  { id: '21', name: "Yuzvendra Chahal 🦊", price: 10, category: Category.BOWLER, impactScore: 91, isOverseas: false },
  { id: '22', name: "Mohammed Shami 🔥", price: 12, category: Category.BOWLER, impactScore: 92, isOverseas: false },
  { id: '23', name: "Trent Boult ❄️", price: 13, category: Category.BOWLER, impactScore: 93, isOverseas: true },
  { id: '24', name: "Kagiso Rabada 🦁", price: 12, category: Category.BOWLER, impactScore: 90, isOverseas: true },
  { id: '25', name: "Anrich Nortje 🚅", price: 11, category: Category.BOWLER, impactScore: 88, isOverseas: true },
  { id: '26', name: "Kuldeep Yadav 🎩", price: 10, category: Category.BOWLER, impactScore: 89, isOverseas: false },
  { id: '27', name: "Mohammed Siraj 🧨", price: 11, category: Category.BOWLER, impactScore: 87, isOverseas: false },
  { id: '28', name: "Josh Hazlewood 🎯", price: 11, category: Category.BOWLER, impactScore: 91, isOverseas: true },

  // All-Rounders
  { id: '29', name: "Hardik Pandya 💎", price: 15, category: Category.ALL_ROUNDER, impactScore: 95, isOverseas: false },
  { id: '30', name: "Ravindra Jadeja 🤺", price: 16, category: Category.ALL_ROUNDER, impactScore: 96, isOverseas: false },
  { id: '31', name: "Glenn Maxwell 🎇", price: 14, category: Category.ALL_ROUNDER, impactScore: 94, isOverseas: true },
  { id: '32', name: "Ben Stokes 🏴󠁧󠁢󠁥󠁮󠁧󠁿", price: 13, category: Category.ALL_ROUNDER, impactScore: 92, isOverseas: true },
  { id: '33', name: "Andre Russell 🦖", price: 12, category: Category.ALL_ROUNDER, impactScore: 95, isOverseas: true },
  { id: '34', name: "Marcus Stoinis 💪", price: 10, category: Category.ALL_ROUNDER, impactScore: 86, isOverseas: true },
  { id: '35', name: "Liam Livingstone 🚀", price: 11, category: Category.ALL_ROUNDER, impactScore: 87, isOverseas: true },
  { id: '36', name: "Axar Patel 🕯️", price: 12, category: Category.ALL_ROUNDER, impactScore: 89, isOverseas: false },
  { id: '37', name: "Sam Curran 🏴󠁧󠁢󠁥󠁮󠁧󠁿", price: 14, category: Category.ALL_ROUNDER, impactScore: 85, isOverseas: true },
  { id: '38', name: "Cameron Green 🌿", price: 13, category: Category.ALL_ROUNDER, impactScore: 88, isOverseas: true },
];

export const MIN_PLAYERS = 11;
export const MAX_PLAYERS = 15;
export const INITIAL_BUDGET = 150;
