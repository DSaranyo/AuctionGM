
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Team, Category } from '../types';

interface StatsBoardProps {
  team: Team;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b'];

const StatsBoard: React.FC<StatsBoardProps> = ({ team }) => {
  const counts = {
    [Category.BATSMAN]: team.players.filter(p => p.category === Category.BATSMAN).length,
    [Category.BOWLER]: team.players.filter(p => p.category === Category.BOWLER).length,
    [Category.ALL_ROUNDER]: team.players.filter(p => p.category === Category.ALL_ROUNDER).length,
    [Category.WICKET_KEEPER]: team.players.filter(p => p.category === Category.WICKET_KEEPER).length,
  };

  const data = Object.keys(counts).map((key, index) => ({
    name: key,
    value: counts[key as Category],
  }));

  return (
    <div className="bg-slate-900/80 p-8 rounded-[2.5rem] border border-slate-800 h-full shadow-2xl backdrop-blur-xl">
      <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-10">Roster Distribution</h3>
      <div className="flex flex-col items-center">
        <div className="h-56 w-full mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px', fontWeight: 'bold' }}
                itemStyle={{ color: '#fff' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="w-full space-y-6">
           <div className="grid grid-cols-2 gap-4">
              {data.map((item, idx) => (
                <div key={idx} className="flex flex-col p-3 bg-slate-950/50 rounded-2xl border border-slate-800/50">
                   <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-[8px] text-slate-500 font-black uppercase tracking-widest truncate">{item.name}</span>
                   </div>
                   <span className="text-xl font-black text-white italic">{item.value}</span>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBoard;
