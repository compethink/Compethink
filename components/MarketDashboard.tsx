
import React, { useState, useMemo } from 'react';
import { MarketAudit, Competitor } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend
} from 'recharts';

const MarketDashboard: React.FC<{data: MarketAudit}> = ({ data }) => {
  const [selectedId, setSelectedId] = useState<string | null>(data.competitors[0]?.id || null);

  const competitors = useMemo(() => 
    [...data.competitors].sort((a, b) => b.totalScore - a.totalScore), 
    [data.competitors]
  );

  const selectedCompetitor = useMemo(() => 
    competitors.find(c => c.id === selectedId) || competitors[0],
    [competitors, selectedId]
  );

  const marketAverages = useMemo(() => {
    if (competitors.length === 0) return {};
    const clusterIds = competitors[0].clusters.map(cl => cl.id);
    const avgs: Record<string, number> = {};
    
    clusterIds.forEach(id => {
      const sum = competitors.reduce((acc, comp) => {
        const cl = comp.clusters.find(c => c.id === id);
        return acc + (cl?.avgScore || 0);
      }, 0);
      avgs[id] = Math.round(sum / competitors.length);
    });
    
    return avgs;
  }, [competitors]);

  const radarData = useMemo(() => {
    if (!selectedCompetitor) return [];
    return selectedCompetitor.clusters.map(cl => ({
      subject: cl.name.split(' & ')[0].split(' (')[0], // Accorciamo i nomi per il radar
      fullId: cl.id,
      score: cl.avgScore,
      average: marketAverages[cl.id] || 0,
      fullMark: 100
    }));
  }, [selectedCompetitor, marketAverages]);

  const stats = useMemo(() => {
    const avgScore = Math.round(competitors.reduce((acc, c) => acc + c.totalScore, 0) / competitors.length);
    const topPerformer = competitors[0];
    const mostBranded = [...competitors].sort((a, b) => b.brandedShare - a.brandedShare)[0];
    
    return { avgScore, topPerformer, mostBranded };
  }, [competitors]);

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">Market Command</h2>
          <p className="text-indigo-400 font-bold mt-4 uppercase tracking-[0.2em] text-xs">Visualizzazione interattiva dati per {data.clientName}</p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-slate-800/50 border border-slate-700 p-4 rounded-3xl min-w-[140px] backdrop-blur-sm">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Market Avg</p>
            <p className="text-3xl font-black text-white">{stats.avgScore}<span className="text-xs text-slate-600 ml-1">/1000</span></p>
          </div>
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-3xl min-w-[140px] backdrop-blur-sm">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">Leader</p>
            <p className="text-xl font-black text-white truncate max-w-[120px]">{stats.topPerformer?.name}</p>
          </div>
        </div>
      </header>

      {/* Main Grid: Bar Chart & Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Ranking Bar Chart */}
        <div className="bg-[#1e293b] p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl h-[500px] flex flex-col relative group">
          <div className="mb-6 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Punteggio Totale Market View</h3>
            <span className="text-[10px] text-indigo-400 font-bold animate-pulse">Clicca per esplorare</span>
          </div>
          <div className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={competitors} layout="vertical" margin={{ left: 10, right: 40 }}>
                <XAxis type="number" hide domain={[0, 1000]} />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={120} 
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const isSelected = competitors.find(c => c.name === payload.value)?.id === selectedId;
                    return (
                      <text 
                        x={x} y={y} 
                        fill={isSelected ? '#818cf8' : '#64748b'} 
                        fontSize={11} 
                        fontWeight={isSelected ? 900 : 700} 
                        textAnchor="end" 
                        alignmentBaseline="middle"
                        className="transition-all duration-300"
                      >
                        {payload.value}
                      </text>
                    );
                  }}
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }} 
                  itemStyle={{ color: '#818cf8', fontWeight: 'bold' }}
                />
                <Bar 
                  dataKey="totalScore" 
                  barSize={32} 
                  radius={[0, 16, 16, 0]}
                  onClick={(data) => setSelectedId(data.id)}
                  className="cursor-pointer"
                  isAnimationActive={true}
                  animationDuration={1000}
                >
                  {competitors.map((entry, index) => {
                    const isSelected = entry.id === selectedId;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={isSelected ? '#6366f1' : '#334155'} 
                        fillOpacity={isSelected ? 1 : 0.6}
                        stroke={isSelected ? '#818cf8' : 'none'}
                        strokeWidth={isSelected ? 3 : 0}
                        className="transition-all duration-500 hover:fill-indigo-400"
                        style={{ filter: isSelected ? 'drop-shadow(0 0 8px rgba(99, 102, 241, 0.5))' : 'none' }}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cluster Radar Chart */}
        <div className="bg-[#1e293b] p-10 rounded-[3.5rem] border border-slate-800 shadow-2xl h-[500px] flex flex-col transition-all duration-500">
          <div className="mb-2 flex justify-between items-center">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Competitor Performance Radar</h3>
            <span className="text-[10px] text-indigo-400 font-black uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              {selectedCompetitor?.name}
            </span>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  key={`radar-market-${selectedId}`}
                  name="Media Mercato"
                  dataKey="average"
                  stroke="#94a3b8"
                  fill="#94a3b8"
                  fillOpacity={0.1}
                  isAnimationActive={true}
                  animationDuration={1000}
                />
                <Radar
                  key={`radar-comp-${selectedId}`}
                  name={selectedCompetitor?.name}
                  dataKey="score"
                  stroke="#6366f1"
                  strokeWidth={3}
                  fill="#6366f1"
                  fillOpacity={0.4}
                  isAnimationActive={true}
                  animationDuration={1200}
                  animationEasing="ease-out"
                />
                <Tooltip 
                  contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detail Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {selectedCompetitor?.clusters.map((cl) => (
          <div 
            key={cl.id} 
            className="bg-slate-800/40 p-6 rounded-[2.5rem] border border-slate-700/50 hover:border-indigo-500/30 transition-all flex flex-col group"
          >
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest max-w-[70%] group-hover:text-indigo-400 transition-colors">
                {cl.name}
              </h4>
              <span className={`text-sm font-black transition-all ${cl.avgScore >= 70 ? 'text-emerald-400' : cl.avgScore >= 40 ? 'text-indigo-400' : 'text-rose-400'}`}>
                {cl.avgScore}%
              </span>
            </div>
            <div className="mt-auto">
              <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden mb-1 p-0.5">
                <div 
                  className={`h-full transition-all duration-1000 rounded-full ${cl.avgScore >= 70 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : cl.avgScore >= 40 ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`}
                  style={{ width: `${cl.avgScore}%` }}
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[8px] font-bold text-slate-600 uppercase tracking-widest">Market Benchmark</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase">{marketAverages[cl.id]}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Traffic & Awareness Focus */}
      <div className="bg-gradient-to-br from-indigo-600/10 via-slate-900/40 to-transparent p-12 rounded-[4rem] border border-indigo-500/20 shadow-xl backdrop-blur-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="flex flex-col md:flex-row gap-12 items-center relative z-10">
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-4 leading-none">Market Intelligence Focus</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
              Analisi incrociata tra traffico organico e notorietà del brand (Branded Share). Un valore elevato di Branded Share indica un'autorità consolidata e una forte indipendenza dai soli algoritmi di ranking, definendo la resilienza digitale del brand.
            </p>
          </div>
          
          <div className="flex gap-8">
            <div className="text-center group">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Traffic Leader</p>
              <div className="w-24 h-24 rounded-full border-4 border-indigo-500/20 bg-slate-900 flex items-center justify-center p-3 transition-all duration-500 group-hover:border-indigo-500 group-hover:scale-110 shadow-lg">
                <p className="text-[10px] font-black text-white leading-tight">{[...competitors].sort((a,b) => b.organicTraffic - a.organicTraffic)[0]?.name}</p>
              </div>
            </div>
            <div className="text-center group">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Brand Strength</p>
              <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 bg-slate-900 flex items-center justify-center p-3 transition-all duration-500 group-hover:border-purple-500 group-hover:scale-110 shadow-lg">
                <p className="text-[10px] font-black text-white leading-tight">{stats.mostBranded?.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDashboard;
