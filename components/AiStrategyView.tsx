
import React, { useState, useEffect } from 'react';
import { MarketAudit } from '../types';
import { generateMarketViewAnalysis } from '../services/geminiService';

const AiStrategyView: React.FC<{ data: MarketAudit }> = ({ data }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await generateMarketViewAnalysis(data);
      setAnalysis(res);
      setLoading(false);
    };
    load();
  }, [data]);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
      <header>
        <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase leading-none">AI Strategy</h2>
        <p className="text-indigo-400 font-bold mt-4 uppercase tracking-[0.2em] text-xs">Final Market Intelligence Report</p>
      </header>

      <div className="bg-[#1e293b] p-12 rounded-[3.5rem] border border-slate-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
          <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>

        {loading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-slate-800 rounded-2xl w-1/3"></div>
            <div className="space-y-3">
              <div className="h-4 bg-slate-800 rounded-lg w-full"></div>
              <div className="h-4 bg-slate-800 rounded-lg w-5/6"></div>
              <div className="h-4 bg-slate-800 rounded-lg w-4/6"></div>
            </div>
            <div className="pt-10">
              <div className="h-8 bg-slate-800 rounded-2xl w-1/4"></div>
              <div className="mt-6 space-y-3">
                <div className="h-4 bg-slate-800 rounded-lg w-full"></div>
                <div className="h-4 bg-slate-800 rounded-lg w-3/4"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="prose prose-invert prose-indigo max-w-none">
            <div className="text-slate-300 leading-relaxed text-lg whitespace-pre-wrap font-medium">
              {analysis}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 bg-indigo-600 rounded-[2.5rem] text-white">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Focus Analisi</p>
          <p className="text-2xl font-black mt-2">Content Strategy</p>
          <p className="text-xs mt-2 opacity-80 leading-relaxed">Valutazione profonda dei valori di Opportunity e Stability estratti da SEOZoom per ogni brand.</p>
        </div>
        <div className="p-8 bg-slate-800 rounded-[2.5rem] text-white border border-slate-700">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Metodologia</p>
          <p className="text-2xl font-black mt-2">Compethink V3</p>
          <p className="text-xs mt-2 text-slate-400 leading-relaxed">Analisi cross-data tra Authority Score, AI Visibility e maturità tecnologica.</p>
        </div>
        <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white border border-slate-800">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Status Report</p>
          <p className="text-2xl font-black mt-2">Ready for Pitch</p>
          <button 
            onClick={() => window.print()}
            className="mt-4 px-6 py-2 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-black uppercase rounded-xl hover:bg-indigo-500 hover:text-white transition-all"
          >
            Esporta PDF Audit
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiStrategyView;
