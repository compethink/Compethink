
import React from 'react';
import { MarketAudit, Competitor } from '../types';

interface HistoryViewProps {
  history: MarketAudit[];
  onLoad: (item: MarketAudit) => void;
  onRemove: (idx: number) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, onLoad, onRemove }) => {
  const formatDateFull = (dateStr?: string) => {
    if (!dateStr) return 'Data non disponibile';
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMetrics = (data: MarketAudit) => {
    if (data.competitors.length === 0) return { avg: 0, count: 0, top: null, avgTraffic: 0, avgBranded: 0 };
    
    const count = data.competitors.length;
    const avg = Math.round(data.competitors.reduce((acc, c) => acc + c.totalScore, 0) / count);
    const top = [...data.competitors].sort((a, b) => b.totalScore - a.totalScore)[0];
    const avgTraffic = Math.round(data.competitors.reduce((acc, c) => acc + c.organicTraffic, 0) / count);
    const avgBranded = Math.round(data.competitors.reduce((acc, c) => acc + c.brandedShare, 0) / count);

    return { avg, count, top, avgTraffic, avgBranded };
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header>
        <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">Cronologia</h2>
        <p className="text-indigo-400 font-bold mt-4 uppercase tracking-[0.2em] text-xs">Archivio storico delle ultime 20 analisi di mercato</p>
      </header>

      {history.length === 0 ? (
        <div className="py-32 text-center bg-[#1e293b] rounded-[3.5rem] border-2 border-dashed border-slate-800">
           <span className="text-5xl mb-6 block opacity-20">📜</span>
           <p className="text-slate-500 font-black uppercase tracking-widest">Nessuna analisi salvata in archivio</p>
           <p className="text-slate-600 text-sm mt-2">Le analisi compaiono qui dopo il Bulk Sync o il salvataggio manuale.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {history.map((item, idx) => {
            const m = getMetrics(item);
            return (
              <div 
                key={idx} 
                className="group bg-[#1e293b] rounded-[3rem] border border-slate-800 p-8 hover:border-indigo-500/50 transition-all flex flex-col shadow-2xl relative overflow-hidden"
              >
                {/* Visual indicator of the market health in this snapshot */}
                <div className={`absolute top-0 right-0 w-2 h-full ${m.avg >= 600 ? 'bg-emerald-500' : m.avg >= 400 ? 'bg-indigo-500' : 'bg-rose-500'} opacity-20 group-hover:opacity-100 transition-opacity`}></div>

                <div className="flex justify-between items-start mb-6">
                  <div className="bg-indigo-600/10 text-indigo-400 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-500/20">
                    Snapshot #{history.length - idx}
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
                    className="text-slate-700 hover:text-rose-500 p-2 transition-colors relative z-10"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="mb-6">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter leading-tight mb-1 truncate">{item.clientName}</h3>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">{item.industry}</p>
                </div>
                
                <div className="space-y-3 mb-8">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Market Avg</p>
                        <p className="text-2xl font-black text-white">{m.avg}</p>
                    </div>
                    <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Competitors</p>
                        <p className="text-2xl font-black text-white">{m.count}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Top Performer</p>
                      <span className="text-[9px] font-black text-emerald-400">{m.top?.totalScore} pts</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{m.top?.name || 'N/D'}</p>
                  </div>

                  <div className="flex items-center justify-between px-2">
                    <div className="text-center">
                      <p className="text-[8px] font-black text-slate-600 uppercase">Avg Traffic</p>
                      <p className="text-[10px] font-bold text-slate-400">{m.avgTraffic.toLocaleString()}</p>
                    </div>
                    <div className="h-4 w-px bg-slate-800"></div>
                    <div className="text-center">
                      <p className="text-[8px] font-black text-slate-600 uppercase">Avg Branded</p>
                      <p className="text-[10px] font-bold text-slate-400">{m.avgBranded}%</p>
                    </div>
                  </div>
                </div>

                <div className="mt-auto space-y-4">
                  <p className="text-[10px] text-slate-600 font-mono text-center tracking-tighter">{formatDateFull(item.lastUpdated)}</p>
                  <button 
                    onClick={() => onLoad(item)}
                    className="w-full py-4 bg-slate-900 border border-slate-700 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-indigo-600 hover:border-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all shadow-lg"
                  >
                    Ripristina Sessione ⚡
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-indigo-600/5 p-10 rounded-[4rem] border border-indigo-500/10 text-center backdrop-blur-sm">
        <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl mx-auto">
          I dati sono archiviati in totale privacy nel <span className="text-indigo-400 font-bold">LocalStorage</span> del tuo dispositivo. 
          Ricorda di esportare i tuoi report in PDF prima di cambiare browser o pulire la cronologia del sito.
        </p>
      </div>
    </div>
  );
};

export default HistoryView;
