import React, { useState } from 'react';
import { MarketAudit } from '../types';

interface SidebarProps {
  active: string;
  onChange: (t: string) => void;
  lastSaved?: string;
  history: MarketAudit[];
  onLoadHistory: (item: MarketAudit) => void;
  onNewAnalysis: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, onChange, lastSaved, history, onLoadHistory, onNewAnalysis }) => {
  const [showConfirmNew, setShowConfirmNew] = useState(false);

  const nav = [
    { id: 'setup', icon: '⚙️', label: 'Configurazione' },
    { id: 'dashboard', icon: '📊', label: 'Market View' },
    { id: 'insights', icon: '💡', label: 'AI Strategy' },
    { id: 'history', icon: '📜', label: 'Archivio Analisi' },
  ];

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/D';
    const d = new Date(dateStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' });
  };

  const confirmNew = () => {
    onNewAnalysis();
    setShowConfirmNew(false);
  };

  return (
    <>
      <aside className="w-72 bg-[#1e293b] border-r border-slate-800 flex flex-col h-full overflow-hidden relative">
        <div className="p-8 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-black text-white">C</div>
            <h1 className="text-xl font-black tracking-tighter text-white">COMPETHINK</h1>
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase mt-1 tracking-widest">Market View Engine</p>
        </div>

        <nav className="px-4 space-y-2 mt-4">
          {nav.map(item => (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                active === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Pulsante Nuova Analisi */}
        <div className="px-4 mt-8">
          <button 
            onClick={() => setShowConfirmNew(true)}
            className="w-full group flex items-center justify-center space-x-2 py-3 px-4 bg-slate-800/50 border border-indigo-500/30 text-indigo-400 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-lg hover:shadow-indigo-600/20"
          >
            <span className="text-sm">+</span>
            <span>Nuova Analisi</span>
          </button>
        </div>

        <div className="flex-1 mt-6 px-4 overflow-y-auto custom-scrollbar">
          <div className="px-4 mb-4 flex items-center justify-between">
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Accesso Rapido</span>
          </div>
          
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="px-4 py-6 text-center border border-dashed border-slate-800 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-600 uppercase">Nessuna analisi</p>
              </div>
            ) : (
              history.map((item, idx) => (
                <div 
                  key={idx} 
                  className="group bg-slate-800/40 border border-slate-800 rounded-2xl p-3 hover:border-indigo-500/50 hover:bg-slate-800 transition-all cursor-pointer"
                  onClick={() => onLoadHistory(item)}
                >
                  <p className="text-[11px] font-black text-slate-200 truncate uppercase tracking-tight">{item.clientName}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[8px] font-bold text-indigo-500 truncate uppercase">{item.industry}</p>
                    <p className="text-[8px] text-slate-500 font-mono">{formatDate(item.lastUpdated)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-8 border-t border-slate-800 space-y-4 bg-[#1e293b]/80 backdrop-blur-sm">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase mb-2">System Status</div>
            <div className="flex items-center space-x-2 text-xs text-emerald-500 font-bold">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Core Ready</span>
            </div>
          </div>
          
          <div className="pt-4 border-t border-slate-800/50">
            <div className="flex items-center justify-between">
              <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Auto-save</span>
              <span className="text-[9px] text-indigo-400 font-bold">{lastSaved}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Confirmation Modal */}
      {showConfirmNew && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#1e293b] border border-slate-700 w-full max-w-md rounded-[2.5rem] shadow-2xl p-10 transform animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-indigo-600/20 rounded-full flex items-center justify-center mb-6 mx-auto">
              <span className="text-3xl">🚀</span>
            </div>
            <h3 className="text-2xl font-black text-white text-center uppercase tracking-tighter mb-2 italic">Avviare Nuova Analisi?</h3>
            <p className="text-slate-400 text-sm text-center leading-relaxed mb-8">
              L'attuale attività verrà resettata. <br/>
              <span className="text-indigo-400 font-bold italic">Tranquillo:</span> se hai già iniziato a inserire dati, l'app salverà automaticamente una copia nell'Archivio prima di procedere.
            </p>
            <div className="flex flex-col space-y-3">
              <button 
                onClick={confirmNew}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 transition-all"
              >
                Sì, procedi al reset
              </button>
              <button 
                onClick={() => setShowConfirmNew(false)}
                className="w-full py-4 bg-transparent text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all"
              >
                Annulla e resta qui
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;