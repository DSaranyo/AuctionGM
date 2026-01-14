
import React from 'react';
import { Player, Category } from '../types';

interface PlayerCardProps {
  player: Player;
  onBid: (player: Player) => void;
  disabled: boolean;
  canAfford: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onBid, disabled, canAfford }) => {
  const getCategoryColor = (cat: Category) => {
    switch (cat) {
      case Category.BATSMAN: return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case Category.BOWLER: return 'text-red-400 border-red-400/30 bg-red-400/10';
      case Category.ALL_ROUNDER: return 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10';
      case Category.WICKET_KEEPER: return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
      default: return 'text-slate-400 border-slate-400/30 bg-slate-400/10';
    }
  };

  return (
    <div className={`group relative p-5 rounded-3xl border border-slate-700 bg-slate-800/40 backdrop-blur-md transition-all duration-500 
      ${disabled ? 'opacity-30 grayscale pointer-events-none' : 'hover:border-blue-500/50 hover:bg-slate-800/80 hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-500/20'}`}>
      
      {player.isOverseas && (
        <div className="absolute -top-2 -right-2 px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase rounded-full shadow-lg z-10 border border-blue-400 animate-bounce">
          ✈️ Overseas
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <span className={`text-[10px] tracking-widest uppercase font-black px-3 py-1.5 rounded-2xl border ${getCategoryColor(player.category)}`}>
          {player.category}
        </span>
        <div className="flex flex-col items-end">
          <span className="text-emerald-400 font-black text-xl italic leading-none">₹{player.price} Cr</span>
          <span className="text-[10px] text-slate-500 font-bold">START PRICE</span>
        </div>
      </div>
      
      <div className="mb-6 h-12 flex flex-col justify-center">
        <h4 className="text-white font-black text-xl leading-tight group-hover:text-blue-400 transition-colors uppercase italic" title={player.name}>
          {player.name}
        </h4>
      </div>

      <div className="mb-6 flex items-center justify-between p-3 bg-slate-900/50 rounded-2xl border border-slate-700/50">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 font-black uppercase">Impact Score</span>
          <div className="flex gap-1 mt-1">
             <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: `${player.impactScore}%` }} />
             </div>
             <span className="text-[10px] text-white font-black">{player.impactScore}</span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onBid(player)}
        disabled={disabled || !canAfford}
        className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 border-b-4 
          ${!canAfford 
            ? 'bg-slate-700 text-slate-500 cursor-not-allowed border-slate-800' 
            : 'bg-blue-600 hover:bg-blue-500 text-white border-blue-800'}`}
      >
        {!canAfford ? 'INSUFFICIENT FUNDS' : 'START BIDDING'}
      </button>
    </div>
  );
};

export default PlayerCard;
