
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { INITIAL_PLAYERS, INITIAL_BUDGET, MIN_PLAYERS, MAX_PLAYERS } from './constants';
import { Player, Team, GameState, AuctionSession, Category } from './types';
import PlayerCard from './components/PlayerCard';
import StatsBoard from './components/StatsBoard';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.SETUP);
  const [teamName, setTeamName] = useState('');
  const [userTeam, setUserTeam] = useState<Team>({ name: '', players: [], budget: INITIAL_BUDGET, rating: 0 });
  const [cpuTeam, setCpuTeam] = useState<Team>({ name: 'CPU', players: [], budget: INITIAL_BUDGET, rating: 0 });
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>(INITIAL_PLAYERS);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'All'>('All');
  const [recentSignings, setRecentSignings] = useState<string[]>([]);
  const [biddingWarLevel, setBiddingWarLevel] = useState(0);

  const [auction, setAuction] = useState<AuctionSession>({
    currentPlayer: null,
    currentBid: 0,
    cpuInterested: false,
    waitingForUser: false,
    log: []
  });

  // PROTECT BUDGET: User must have at least 1 Cr for each remaining player needed to hit MIN_PLAYERS
  const calculateMaxSafeBid = useCallback((currentBudget: number, currentTeamSize: number) => {
    const playersRemainingToMin = Math.max(0, MIN_PLAYERS - currentTeamSize - 1);
    return currentBudget - playersRemainingToMin;
  }, []);

  const calculateTeamRating = (players: Player[]) => {
    if (players.length === 0) return 0;
    const avgImpact = players.reduce((sum, p) => sum + p.impactScore, 0) / players.length;
    // Scale 0-100 to 0-10
    return Math.round(avgImpact / 10 * 10) / 10;
  };

  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    setUserTeam(prev => ({ ...prev, name: teamName }));
    setGameState(GameState.MARKET);
  };

  const initiateBidding = (player: Player) => {
    const maxSafe = calculateMaxSafeBid(userTeam.budget, userTeam.players.length);
    if (userTeam.budget < player.price || maxSafe < player.price) {
      alert("⚠️ BUDGET PROTECTION: You must reserve at least ₹1 Cr for each slot in your minimum squad (11 players). Buying this player would leave you unable to fill your team!");
      return;
    }

    const cpuInterested = cpuTeam.budget >= player.price && Math.random() < 0.6;
    
    setAuction({
      currentPlayer: player,
      currentBid: player.price,
      cpuInterested,
      waitingForUser: cpuInterested,
      log: cpuInterested 
        ? [`⚡ AUCTION START: Battle for ${player.name} begins! Base Price ₹${player.price}Cr.`] 
        : [`💎 SOLD! You secured ${player.name} uncontested for ₹${player.price} crore.`]
    });

    if (!cpuInterested) {
      const purchasedPlayer = player;
      setAvailablePlayers(prev => prev.filter(p => p.id !== purchasedPlayer.id));
      setUserTeam(prev => {
        const newPlayers = [...prev.players, purchasedPlayer];
        return {
          ...prev,
          budget: prev.budget - purchasedPlayer.price,
          players: newPlayers,
          rating: calculateTeamRating(newPlayers)
        };
      });
      setRecentSignings(prev => [`${teamName} signed ${purchasedPlayer.name}`, ...prev].slice(0, 8));
      setGameState(GameState.BIDDING);
    } else {
      setBiddingWarLevel(1);
      setGameState(GameState.BIDDING);
    }
  };

  const handleUserBid = (decision: 'yes' | 'no') => {
    if (!auction.currentPlayer) return;
    const player = auction.currentPlayer;
    let currentPrice = auction.currentBid;

    if (decision === 'yes') {
      // Logic from original code: Raise price by 1 initially
      currentPrice += 1;
      
      const maxSafe = calculateMaxSafeBid(userTeam.budget, userTeam.players.length);
      // Logic from original code: CPU checks if it can raise +20
      if (cpuTeam.budget >= currentPrice + 20 && Math.random() < 0.5) {
        currentPrice += 20;
        setBiddingWarLevel(prev => Math.min(prev + 1, 5));
        setAuction(prev => ({
          ...prev,
          currentBid: currentPrice,
          log: [...prev.log, `🔥 CPU STRIKES BACK: High intensity bid of ₹${currentPrice}Cr!`]
        }));
      } else {
        // User wins
        const finalPrice = currentPrice;
        setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
        setUserTeam(prev => {
          const newPlayers = [...prev.players, player];
          return {
            ...prev,
            budget: prev.budget - finalPrice,
            players: newPlayers,
            rating: calculateTeamRating(newPlayers)
          };
        });
        setRecentSignings(prev => [`${teamName} won ${player.name} (₹${finalPrice}Cr)`, ...prev].slice(0, 8));
        setAuction(prev => ({
          ...prev,
          waitingForUser: false,
          log: [...prev.log, `🏆 HAMMER DOWN! ${player.name} belongs to ${userTeam.name} for ₹${finalPrice}Cr.`]
        }));
      }
    } else {
      // CPU wins
      const finalPrice = auction.currentBid;
      setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
      setCpuTeam(prev => {
        const newPlayers = [...prev.players, player];
        return {
          ...prev,
          budget: prev.budget - finalPrice,
          players: newPlayers,
          rating: calculateTeamRating(newPlayers)
        };
      });
      setRecentSignings(prev => [`CPU won ${player.name} (₹${finalPrice}Cr)`, ...prev].slice(0, 8));
      setAuction(prev => ({
        ...prev,
        waitingForUser: false,
        log: [...prev.log, `🤖 CPU DOMINATED: Secured ${player.name} for ₹${finalPrice} crore.`]
      }));
    }
  };

  const closeAuction = () => {
    setAuction({ currentPlayer: null, currentBid: 0, cpuInterested: false, waitingForUser: false, log: [] });
    setBiddingWarLevel(0);
    setGameState(GameState.MARKET);
    if (userTeam.players.length >= MAX_PLAYERS || cpuTeam.players.length >= MAX_PLAYERS) {
      setGameState(GameState.FINISH);
    }
  };

  const filteredPlayers = useMemo(() => {
    return availablePlayers.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterCategory === 'All' || p.category === filterCategory;
      return matchesSearch && matchesFilter;
    });
  }, [availablePlayers, searchQuery, filterCategory]);

  const squadRequirements = useMemo(() => {
    const counts = {
      [Category.BATSMAN]: userTeam.players.filter(p => p.category === Category.BATSMAN).length,
      [Category.BOWLER]: userTeam.players.filter(p => p.category === Category.BOWLER).length,
      [Category.ALL_ROUNDER]: userTeam.players.filter(p => p.category === Category.ALL_ROUNDER).length,
      [Category.WICKET_KEEPER]: userTeam.players.filter(p => p.category === Category.WICKET_KEEPER).length,
    };
    return {
      needsWK: counts[Category.WICKET_KEEPER] < 1,
      needsBats: counts[Category.BATSMAN] < 3,
      needsBowls: counts[Category.BOWLER] < 3,
    };
  }, [userTeam.players]);

  const SetupView = () => (
    <div className="flex flex-col items-center justify-center min-h-[85vh] text-center px-4">
      <div className="relative mb-12 animate-pulse">
        <div className="absolute -inset-10 bg-blue-500/20 blur-[80px] rounded-full"></div>
        <div className="relative px-12 py-6 border-4 border-white transform skew-x-[-12deg] bg-blue-900 shadow-2xl">
           <h1 className="text-8xl font-black text-white italic tracking-tighter leading-none">IPL 2025</h1>
           <p className="text-xl text-yellow-400 font-black tracking-[0.5em] mt-2 ml-4">AUCTION PRO</p>
        </div>
      </div>
      <form onSubmit={handleStartGame} className="w-full max-w-md bg-slate-800/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-slate-700/50">
        <div className="text-left mb-10">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Franchise Designation</label>
          <input 
            type="text" 
            autoFocus
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Royal Challengers Bangalore"
            className="w-full px-8 py-5 rounded-2xl bg-slate-950/50 border border-slate-700 text-white font-black italic placeholder:text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-lg"
          />
        </div>
        <button className="w-full py-6 bg-gradient-to-br from-blue-600 to-indigo-700 hover:from-blue-500 hover:to-indigo-600 text-white rounded-2xl font-black text-2xl tracking-tighter uppercase transition-all transform hover:scale-[1.05] shadow-2xl shadow-blue-600/30 active:scale-95 border-b-8 border-blue-900">
          ENTER THE ARENA
        </button>
      </form>
    </div>
  );

  const MarketView = () => (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-3">
          <div className="bg-slate-900/60 border border-slate-800 rounded-[2rem] p-8 mb-10 backdrop-blur-xl">
            <div className="flex flex-col xl:flex-row gap-8 justify-between items-center mb-10">
              <div className="relative w-full xl:w-[450px]">
                <input 
                  type="text"
                  placeholder="SEARCH FOR A SUPERSTAR..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-3xl px-14 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-black italic placeholder:text-slate-700"
                />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl grayscale brightness-50">🔍</span>
              </div>
              <div className="flex gap-3 overflow-x-auto pb-4 xl:pb-0 w-full xl:w-auto scrollbar-hide">
                {['All', Category.BATSMAN, Category.BOWLER, Category.ALL_ROUNDER, Category.WICKET_KEEPER].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat as any)}
                    className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${filterCategory === cat ? 'bg-blue-600 text-white border-blue-400 shadow-xl shadow-blue-600/20' : 'bg-slate-800/40 text-slate-500 border-slate-700 hover:bg-slate-800'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Warning Section */}
            {(squadRequirements.needsBats || squadRequirements.needsBowls || squadRequirements.needsWK) && (
              <div className="flex gap-4 p-5 bg-yellow-500/5 rounded-3xl border border-yellow-500/20 mb-8 items-center">
                 <span className="text-2xl">⚠️</span>
                 <div>
                    <p className="text-yellow-400 font-black text-xs uppercase tracking-widest">Strategy Warning</p>
                    <div className="flex gap-4 mt-1">
                      {squadRequirements.needsBats && <span className="text-[10px] font-bold text-slate-400">• Need 3+ Batsmen</span>}
                      {squadRequirements.needsBowls && <span className="text-[10px] font-bold text-slate-400">• Need 3+ Bowlers</span>}
                      {squadRequirements.needsWK && <span className="text-[10px] font-bold text-slate-400">• Missing Wicket Keeper</span>}
                    </div>
                 </div>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredPlayers.map(player => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                onBid={initiateBidding} 
                disabled={userTeam.players.length >= MAX_PLAYERS}
                canAfford={calculateMaxSafeBid(userTeam.budget, userTeam.players.length) >= player.price}
              />
            ))}
            {filteredPlayers.length === 0 && (
              <div className="col-span-full py-32 text-center">
                <p className="text-4xl font-black text-slate-800 italic uppercase">No Talent Found</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-8 sticky top-32 h-fit">
           <div className="bg-slate-900/80 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="text-6xl grayscale italic font-black">PURSE</span>
            </div>
            <h3 className="text-[10px] font-black text-blue-400 uppercase tracking-[0.4em] mb-6">Financial Status</h3>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-end mb-4">
                  <p className="text-3xl font-black text-white italic tabular-nums">₹{userTeam.budget}Cr</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">REMAINING</p>
                </div>
                <div className="h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 transition-all duration-1000 shadow-lg shadow-emerald-500/20" style={{ width: `${(userTeam.budget / 150) * 100}%` }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 py-6 border-y border-slate-800">
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Squad Power</p>
                  <p className="text-2xl font-black text-yellow-400">{userTeam.rating}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Roster Count</p>
                  <p className="text-2xl font-black text-white">{userTeam.players.length} / {MAX_PLAYERS}</p>
                </div>
              </div>
              {userTeam.players.length >= MIN_PLAYERS && (
                <button 
                  onClick={() => setGameState(GameState.FINISH)}
                  className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-slate-700"
                >
                  Finalize Roster Early
                </button>
              )}
            </div>
          </div>

          <div className="bg-slate-900/40 p-8 rounded-[2.5rem] border border-slate-800/50">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Market Ticker</h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
              {recentSignings.map((sig, i) => (
                <div key={i} className="text-[11px] font-black p-4 bg-slate-950/40 rounded-2xl border border-slate-800/50 text-slate-400 italic">
                  <span className="text-blue-500 mr-2">▶</span> {sig}
                </div>
              ))}
              {recentSignings.length === 0 && <p className="text-[10px] italic text-slate-700 text-center py-10 uppercase font-black">Bidding yet to commence</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const BiddingView = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-3xl p-4 overflow-y-auto">
      <div className="bg-[#0f172a] w-full max-w-2xl rounded-[3rem] border border-slate-800 shadow-[0_0_100px_rgba(37,99,235,0.15)] overflow-hidden animate-in zoom-in fade-in duration-500 my-auto">
        
        {/* Dynamic Header based on "Bidding War Intensity" */}
        <div className={`p-10 text-center relative overflow-hidden transition-colors duration-500 ${biddingWarLevel > 3 ? 'bg-red-700' : biddingWarLevel > 1 ? 'bg-indigo-700' : 'bg-blue-700'}`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
          <div className="relative z-10">
            <h2 className="text-6xl font-black text-white italic tracking-tighter mb-2 leading-none">
              {biddingWarLevel > 3 ? 'INTENSE BATTLE' : 'LIVE AUCTION'}
            </h2>
            <div className="flex justify-center gap-2 mt-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${i < biddingWarLevel ? 'bg-white' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
        </div>
        
        <div className="p-12 text-center">
          <div className="mb-12">
            <h3 className="text-6xl font-black text-white mb-4 tracking-tighter uppercase italic">{auction.currentPlayer?.name}</h3>
            <div className="flex items-center justify-center gap-4">
              <span className="px-6 py-2 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-black uppercase tracking-widest">
                {auction.currentPlayer?.category}
              </span>
              <span className="px-6 py-2 rounded-full bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-black uppercase tracking-widest">
                Impact Score: {auction.currentPlayer?.impactScore}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-12">
            <div className="p-8 bg-slate-900 rounded-[2rem] border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-3">Base Price</p>
              <p className="text-3xl font-black text-white tabular-nums">₹{auction.currentPlayer?.price}Cr</p>
            </div>
            <div className="p-8 bg-blue-600 rounded-[2rem] shadow-2xl shadow-blue-600/30 transform scale-110 border-4 border-blue-400">
              <p className="text-[10px] text-blue-100 uppercase font-black tracking-widest mb-3 italic">Highest Bid</p>
              <p className="text-5xl font-black text-white tabular-nums">₹{auction.currentBid}Cr</p>
            </div>
          </div>

          <div className="bg-slate-950/80 rounded-[2.5rem] p-8 mb-12 min-h-[160px] border border-slate-800/50 shadow-inner">
            <div className="space-y-4">
              {auction.log.slice(-4).map((entry, idx) => (
                <p key={idx} className={`text-sm leading-relaxed ${idx === auction.log.slice(-4).length - 1 ? 'text-blue-400 font-black italic scale-105' : 'text-slate-600 font-bold opacity-50'}`}>
                  {entry}
                </p>
              ))}
            </div>
          </div>

          {auction.waitingForUser ? (
            <div className="space-y-8">
              <div className="flex flex-col gap-6">
                 {calculateMaxSafeBid(userTeam.budget, userTeam.players.length) >= auction.currentBid + 20 ? (
                    <button 
                      onClick={() => handleUserBid('yes')}
                      className="w-full py-7 bg-emerald-600 hover:bg-emerald-500 text-white rounded-[2rem] font-black text-2xl tracking-tighter transition-all active:scale-95 shadow-2xl shadow-emerald-600/30 uppercase italic border-b-8 border-emerald-900"
                    >
                      RAISE TO ₹{auction.currentBid + 20}Cr
                    </button>
                 ) : (
                    <div className="p-6 bg-red-900/20 border border-red-900/50 rounded-3xl text-red-500 font-black uppercase text-xs">
                      BUDGET LIMIT REACHED: CANNOT RAISE FURTHER
                    </div>
                 )}
                <button 
                  onClick={() => handleUserBid('no')}
                  className="w-full py-5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-[2rem] font-black text-sm tracking-widest transition-all active:scale-95 uppercase border border-slate-700"
                >
                  ABANDON BIDDING
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={closeAuction}
              className="w-full py-7 bg-white text-slate-950 rounded-[2rem] font-black text-2xl tracking-tighter transition-all active:scale-95 uppercase italic shadow-2xl shadow-white/10"
            >
              CONTINUE TO MARKET
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const FinishView = () => (
    <div className="container mx-auto py-20 px-4 max-w-7xl">
      <div className="text-center mb-24">
        <h1 className="text-9xl font-black text-white italic tracking-tighter mb-4 leading-none transform -rotate-2">AUCTION COMPLETE</h1>
        <p className="text-slate-500 text-2xl font-black uppercase tracking-[0.5em] mt-8">Squad Manifest Locked</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="bg-slate-900 p-12 rounded-[4rem] border-8 border-blue-600 shadow-[0_0_100px_rgba(37,99,235,0.2)] relative overflow-hidden">
          <div className="absolute top-[-5%] right-[-5%] w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full" />
          <div className="flex justify-between items-end mb-12 border-b-4 border-slate-800 pb-10">
            <div>
              <h2 className="text-6xl font-black text-white italic tracking-tighter leading-none mb-4 uppercase">{userTeam.name}</h2>
              <div className="flex gap-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`h-2 w-6 rounded-full ${i < userTeam.rating ? 'bg-yellow-400' : 'bg-slate-800'}`} />
                ))}
              </div>
            </div>
            <div className="text-right">
              <p className="text-emerald-400 font-black text-4xl italic tabular-nums">₹{userTeam.budget}Cr</p>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Remaining Purse</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userTeam.players.map((p, i) => (
              <div key={i} className="flex justify-between items-center p-5 bg-slate-950/60 rounded-3xl border border-slate-800">
                <div>
                  <p className="text-white font-black text-sm italic uppercase">{p.name}</p>
                  <p className="text-[10px] text-slate-600 uppercase font-black tracking-widest mt-0.5">{p.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-blue-500 font-black text-sm italic">₹{p.price}Cr</p>
                  <p className="text-[8px] text-slate-700 font-black">IMPACT: {p.impactScore}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 p-12 rounded-[4rem] border-2 border-slate-800 shadow-xl opacity-60 flex flex-col">
          <div className="flex justify-between items-end mb-12 border-b border-slate-800 pb-10">
            <h2 className="text-4xl font-black text-slate-600 italic tracking-tighter uppercase">AI Opposition</h2>
            <div className="text-right">
               <p className="text-slate-600 font-black text-2xl italic tabular-nums">₹{cpuTeam.budget}Cr</p>
               <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest mt-1">AI PURSE</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 opacity-50">
            {cpuTeam.players.map((p, i) => (
              <div key={i} className="p-4 bg-slate-950/30 rounded-2xl border border-slate-800/50">
                <p className="text-slate-600 font-black text-xs italic uppercase truncate">{p.name}</p>
                <p className="text-[8px] text-slate-700 font-black tracking-widest">₹{p.price}Cr</p>
              </div>
            ))}
          </div>
          <div className="mt-auto pt-10 text-center">
             <div className="p-8 bg-slate-950/50 rounded-3xl border border-slate-800/50">
                <p className="text-slate-600 font-black text-[10px] uppercase tracking-widest">AI Team Power</p>
                <p className="text-4xl font-black text-slate-700 mt-2">{cpuTeam.rating}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="mt-32 text-center">
        <button 
          onClick={() => window.location.reload()}
          className="px-24 py-8 bg-white text-slate-950 rounded-[2.5rem] font-black text-3xl tracking-tighter uppercase italic transition-all transform hover:scale-110 shadow-2xl shadow-white/10 active:scale-95"
        >
          SIMULATE NEW DRAFT
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 selection:bg-blue-500/30 font-['Inter'] scroll-smooth">
      <header className="py-6 px-8 border-b border-slate-900/50 bg-slate-950/80 sticky top-0 z-40 backdrop-blur-3xl shadow-2xl shadow-black/50">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-700 rounded-2xl flex items-center justify-center font-black text-3xl italic shadow-2xl shadow-blue-600/40 transform -rotate-6 border-b-4 border-blue-900">IPL</div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black tracking-tighter text-white italic leading-none">PRO SIMULATOR</h1>
              <div className="flex gap-2 items-center mt-1">
                 <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />
                 <p className="text-[8px] text-slate-500 font-black uppercase tracking-[0.4em]">Broadcast Live 2025</p>
              </div>
            </div>
          </div>
          
          {gameState !== GameState.SETUP && (
            <div className="flex items-center gap-10">
              <div className="text-right">
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Available Funds</p>
                <p className="text-3xl font-black text-emerald-400 tabular-nums italic">₹{userTeam.budget}Cr</p>
              </div>
              <div className="h-12 w-1 bg-slate-900 rounded-full" />
              <div className="text-right hidden md:block">
                <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest mb-1">Roster Power</p>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                    <div className="h-full bg-blue-600 shadow-lg shadow-blue-500/30" style={{ width: `${(userTeam.rating / 10) * 100}%` }} />
                  </div>
                  <span className="text-xs font-black text-white italic">{userTeam.rating}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 pb-20">
        {gameState === GameState.SETUP && <SetupView />}
        {gameState === GameState.MARKET && <MarketView />}
        {gameState === GameState.BIDDING && <BiddingView />}
        {gameState === GameState.FINISH && <FinishView />}
      </main>

      {/* Atmospheric FX */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden opacity-30">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-700/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-700/10 blur-[150px] rounded-full" />
        <div className="absolute top-[30%] left-[40%] w-[20%] h-[20%] bg-blue-500/5 blur-[80px] rounded-full" />
      </div>
    </div>
  );
};

export default App;
