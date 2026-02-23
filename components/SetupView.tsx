
import React, { useState } from 'react';
import { MarketAudit, Competitor } from '../types';
import { createCompetitor, processScores } from '../services/dataProcessor';
import { fetchSeoZoomData } from '../services/seoZoomService';
import { analyzeCompetitorAI } from '../services/geminiService';
import { fetchPageSpeedData } from '../services/googleService';
import { QUALITATIVE_SCALES, METRIC_DESCRIPTIONS, INDUSTRY_SECTORS } from '../constants';

const MetricLabel: React.FC<{ name: string }> = ({ name }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const info = METRIC_DESCRIPTIONS[name];

  return (
    <div className="flex items-center space-x-1.5 relative mb-2">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{name}</span>
      {info && (
        <div 
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="cursor-help text-slate-600 hover:text-indigo-400 transition-colors"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          {showTooltip && (
            <div className="absolute left-0 bottom-full mb-2 w-64 p-4 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-2xl shadow-2xl z-[100] animate-in fade-in zoom-in duration-200">
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{name}</p>
              <div className="flex items-center space-x-1 mb-2">
                 <span className="text-[8px] font-bold bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 uppercase tracking-tighter">Fonte: {info.source}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3 font-medium">{info.desc}</p>
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Importanza:</p>
                <p className="text-[10px] text-slate-400 italic leading-snug">{info.importance}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const SetupView: React.FC<{
  data: MarketAudit, 
  onUpdate: (d: MarketAudit) => void,
  onSnapshot: () => void
}> = ({ data, onUpdate, onSnapshot }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isBulkSyncing, setIsBulkSyncing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);
  const [justSaved, setJustSaved] = useState(false);

  const updateComp = (id: string, updates: Partial<Competitor>) => {
    onUpdate({ ...data, competitors: data.competitors.map(c => c.id === id ? { ...c, ...updates } : c) });
  };

  const handleManualSave = () => {
    onSnapshot();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  };

  const performSingleSync = async (comp: Competitor, currentData: MarketAudit): Promise<Competitor | null> => {
    if (!comp.domain) return null;
    
    try {
      const technicalMetrics = await fetchPageSpeedData(comp.domain);
      const [sz, ai] = await Promise.all([
        fetchSeoZoomData(comp.domain, currentData.seoZoomKey),
        analyzeCompetitorAI(comp.domain, technicalMetrics)
      ]);

      let updated = { ...comp };
      
      if (sz) {
        updated.organicTraffic = sz.traffic;
        if (sz.traffic > 0) {
          updated.brandedShare = Math.round((sz.branded / sz.traffic) * 100);
        }
      }

      if (ai && ai.branded_share !== undefined) {
        updated.brandedShare = ai.branded_share;
      }

      updated.clusters = updated.clusters.map(cl => ({
        ...cl,
        metrics: cl.metrics.map(m => {
          const mName = m.name.toLowerCase();
          
          if (sz) {
            if (mName === 'authority score') return { ...m, score: sz.za };
            if (mName === 'trust') return { ...m, score: sz.trust };
            if (mName === 'opportunity') return { ...m, score: sz.opportunity };
            if (mName === 'stability') return { ...m, score: sz.stability };
            
            if (mName === 'site health') {
              const szHealth = sz.health || 0;
              const googlePerf = technicalMetrics?.performance || szHealth; 
              const hybridScore = Math.round((szHealth * 0.6) + (googlePerf * 0.4));
              return { ...m, score: hybridScore, rawValue: `SZ: ${szHealth} | Google: ${googlePerf}` };
            }

            if (mName === 'menzioni ai') return { ...m, score: sz.aiMentions };
            if (mName === 'visibilità ai') return { ...m, score: sz.aiVisibility };
          }
          
          if (ai) {
            if (mName === 'website grader') {
              const ps = technicalMetrics;
              const qualUX = ai.qualitative_ux || 50;
              const contentQ = ai.content_quality || 50;

              if (ps) {
                const compositeScore = Math.round(
                  (ps.performance * 0.30) + 
                  (ps.seo * 0.15) + 
                  (ps.accessibility * 0.10) + 
                  (ps.bestPractices * 0.10) + 
                  (qualUX * 0.20) +
                  (contentQ * 0.15)
                );
                return { 
                  ...m, 
                  score: compositeScore, 
                  rawValue: `P:${ps.performance} S:${ps.seo} A:${ps.accessibility} BP:${ps.bestPractices} | UX:${qualUX} C:${contentQ}` 
                };
              } else {
                const compositeScore = Math.round((qualUX * 0.6) + (contentQ * 0.4));
                return { ...m, score: compositeScore, rawValue: `AI Audit: UX ${qualUX}, Content ${contentQ}` };
              }
            }
            if (mName === 'chatgpt score') return { ...m, score: ai.chatgpt };
            if (mName === 'perplexity score') return { ...m, score: ai.perplexity };
            if (mName === 'gemini score') return { ...m, score: ai.gemini };
            if (mName.includes('stack')) return { ...m, score: ai.tech_stack };
          }
          return m;
        })
      }));

      return processScores(updated);
    } catch (err) {
      console.error(`Error syncing ${comp.name}:`, err);
      return null;
    }
  };

  const syncAll = async (comp: Competitor) => {
    setLoadingId(comp.id);
    const updated = await performSingleSync(comp, data);
    if (updated) {
      onUpdate({ ...data, competitors: data.competitors.map(c => c.id === comp.id ? updated : c) });
    } else {
      alert("Errore durante la sincronizzazione dati.");
    }
    setLoadingId(null);
  };

  const bulkSync = async () => {
    if (!data.seoZoomKey) return alert("Inserisci la SEOZoom API Key prima di procedere.");
    if (data.competitors.length === 0) return alert("Aggiungi almeno un competitor.");

    setIsBulkSyncing(true);
    setBulkProgress(0);

    let workingCompetitors = [...data.competitors];
    for (let i = 0; i < workingCompetitors.length; i++) {
      const comp = workingCompetitors[i];
      setLoadingId(comp.id);
      const updated = await performSingleSync(comp, data);
      if (updated) {
        workingCompetitors[i] = updated;
        onUpdate({ ...data, competitors: [...workingCompetitors] });
      }
      setBulkProgress(Math.round(((i + 1) / workingCompetitors.length) * 100));
    }

    setLoadingId(null);
    setIsBulkSyncing(false);
    onSnapshot(); 
    setTimeout(() => setBulkProgress(0), 2000);
  };

  const renderMetricInput = (comp: Competitor, clIdx: number, mIdx: number, metric: any) => {
    const isTech = metric.name.includes('Stack') || metric.name.includes('Lead Gen');
    const scale = isTech ? QUALITATIVE_SCALES.tech : QUALITATIVE_SCALES.standard;
    const isSeoZoom = metric.type === 'seozoom';
    const isAi = metric.type === 'ai';
    const isHybrid = metric.name.toLowerCase() === 'site health';
    const isPrecision = metric.name.toLowerCase() === 'website grader';

    const setVal = (v: number) => {
      const updatedClusters = comp.clusters.map((cl, i) => {
        if (i !== clIdx) return cl;
        return {
          ...cl,
          metrics: cl.metrics.map((m, j) => {
            if (j !== mIdx) return m;
            return { ...m, score: v };
          })
        };
      });
      updateComp(comp.id, processScores({ ...comp, clusters: updatedClusters }));
    };

    if (metric.name === 'Engagement social') {
      return (
        <select 
          className="w-full bg-slate-900 border border-slate-700 text-[10px] p-2 rounded-lg font-bold text-indigo-400 focus:ring-1 focus:ring-indigo-500"
          value={metric.score}
          onChange={e => setVal(parseInt(e.target.value))}
        >
          {QUALITATIVE_SCALES.engagement.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      );
    }

    if (metric.type === 'qualitative' || metric.name.includes('Strategy')) {
      return (
        <div className="flex flex-wrap gap-1">
          {scale.map(s => (
            <button 
              key={s} 
              onClick={() => setVal(s)} 
              className={`flex-1 min-w-[28px] h-6 flex items-center justify-center text-[9px] font-black rounded-md transition-all ${
                metric.score === s ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      );
    }

    return (
      <div className="relative group/input">
        <input 
          type="number" 
          className={`w-full bg-slate-900 border ${isHybrid || isPrecision ? 'border-emerald-500/50' : (isSeoZoom || isAi ? 'border-indigo-500/30' : 'border-slate-700')} text-right text-xs p-2 rounded-lg font-bold text-indigo-400 focus:ring-1 focus:ring-indigo-500 transition-all`}
          value={metric.score}
          onChange={e => setVal(parseInt(e.target.value) || 0)}
        />
        {(isHybrid || isPrecision) && (
          <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            <span className="text-[7px] font-black text-emerald-500 uppercase tracking-tighter cursor-help" title={isPrecision ? "Punteggio Composito" : "Punteggio Ibrido"}>
              {isPrecision ? 'PRECISION' : 'HYBRID'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-800/40 p-6 rounded-[2rem] border border-slate-700/50 backdrop-blur-sm relative">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">SEOZoom API Key</label>
              <input type="password" value={data.seoZoomKey} onChange={e => onUpdate({...data, seoZoomKey: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-xs font-mono outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Inserisci Key..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cliente / Progetto</label>
              <input value={data.clientName} onChange={e => onUpdate({...data, clientName: e.target.value})} className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500" placeholder="Mio Cliente" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Settore Merceologico</label>
              <div className="relative">
                <select 
                  value={data.industry} 
                  onChange={e => onUpdate({...data, industry: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-xs font-bold outline-none focus:ring-1 focus:ring-indigo-500 appearance-none text-slate-200"
                >
                  <option value="">Seleziona Settore...</option>
                  {INDUSTRY_SECTORS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <button 
              onClick={handleManualSave}
              disabled={justSaved}
              className={`absolute -top-3 right-8 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all shadow-xl border ${
                justSaved 
                ? 'bg-emerald-500 border-emerald-400 text-white' 
                : 'bg-slate-900 border-slate-700 text-indigo-400 hover:bg-slate-800'
              }`}
            >
              {justSaved ? '✅ Salvato' : '💾 Salva in Cronologia'}
            </button>
          </div>
          
          <button 
            onClick={bulkSync}
            disabled={isBulkSyncing}
            className={`lg:w-64 flex flex-col items-center justify-center p-6 rounded-[2rem] border transition-all ${
              isBulkSyncing ? 'bg-slate-800 text-slate-500' : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-xl'
            }`}
          >
            <span className="text-2xl mb-1">{isBulkSyncing ? '⏳' : '🚀'}</span>
            <span className="text-[10px] font-black uppercase tracking-widest leading-tight text-center">
              {isBulkSyncing ? 'Analisi in corso...' : 'Analisi Massiva Mercato'}
            </span>
          </button>
        </div>

        {bulkProgress > 0 && (
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${bulkProgress}%` }} />
          </div>
        )}
      </div>

      <div className="space-y-10">
        {data.competitors.map((comp) => (
          <div key={comp.id} className={`bg-[#1e293b] rounded-[3rem] border transition-all shadow-2xl relative overflow-hidden ${loadingId === comp.id ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-700'}`}>
            <div className="flex flex-col lg:flex-row min-h-[600px]">
              <div className="lg:w-80 bg-slate-900/50 p-8 border-r border-slate-700/50 flex flex-col justify-between">
                <div>
                  <div className="space-y-1 mb-6">
                    <input className="text-2xl font-black bg-transparent border-none p-0 text-white w-full uppercase tracking-tighter focus:ring-0" value={comp.name} onChange={e => updateComp(comp.id, { name: e.target.value })} />
                    <input className="text-sm text-indigo-500 bg-transparent border-none p-0 w-full font-bold focus:ring-0" value={comp.domain} onChange={e => updateComp(comp.id, { domain: e.target.value })} placeholder="dominio.it" />
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl group hover:border-indigo-500/30 transition-colors">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Traffico Organico</p>
                      <input type="number" className="bg-transparent border-none p-0 text-xl font-black text-white w-full focus:ring-0" value={comp.organicTraffic} onChange={e => updateComp(comp.id, { organicTraffic: parseInt(e.target.value) || 0 })} />
                    </div>
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl group hover:border-indigo-500/30 transition-colors">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Branded Share %</p>
                      <input type="number" className="bg-transparent border-none p-0 text-xl font-black text-indigo-400 w-full focus:ring-0" value={comp.brandedShare} onChange={e => updateComp(comp.id, { brandedShare: parseInt(e.target.value) || 0 })} />
                    </div>
                  </div>

                  <button onClick={() => syncAll(comp)} disabled={loadingId === comp.id} className="w-full mt-8 py-4 rounded-2xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/10">
                    {loadingId === comp.id ? 'Sincronizzazione...' : 'Audit Profondo (AI + SEO)'}
                  </button>
                </div>

                <div className="mt-12 pt-8 border-t border-slate-800">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Omnichannel Score</p>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-6xl font-black text-white tracking-tighter">{comp.totalScore}</span>
                    <span className="text-lg font-black text-slate-700">/1000</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 p-8 bg-slate-800/20">
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {comp.clusters.map((cl, clIdx) => (
                    <div key={cl.id} className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 flex flex-col h-full group hover:border-indigo-500/40 transition-all backdrop-blur-sm">
                      <div className="flex justify-between items-start mb-6 border-b border-slate-700/50 pb-4">
                        <div className="space-y-1">
                          <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-wider leading-tight w-full">
                            {cl.name}
                          </h4>
                          <p className="text-[8px] font-bold text-slate-500 uppercase">Avg: {cl.avgScore}%</p>
                        </div>
                        <span className="text-[8px] font-black bg-slate-800 px-2 py-1 rounded-md text-slate-400 border border-slate-700">W:{cl.weight}</span>
                      </div>
                      
                      <div className="space-y-6 flex-1">
                        {cl.metrics.map((m, mIdx) => (
                          <div key={m.name} className="flex flex-col space-y-1">
                            <MetricLabel name={m.name} />
                            <div>{renderMetricInput(comp, clIdx, mIdx, m)}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => onUpdate({ ...data, competitors: data.competitors.filter(c => c.id !== comp.id) })} 
              className="absolute top-4 right-8 text-slate-600 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Rimuovi Competitor ×
            </button>
          </div>
        ))}

        <button 
          onClick={() => onUpdate({ ...data, competitors: [...data.competitors, createCompetitor()] })} 
          className="w-full py-16 border-2 border-dashed border-slate-800 rounded-[3rem] text-slate-600 font-black uppercase text-xs tracking-[0.2em] hover:bg-slate-800/40 hover:text-indigo-400 hover:border-indigo-500/50 transition-all flex items-center justify-center space-x-4 shadow-inner"
        >
          <span className="text-2xl">+</span>
          <span>Aggiungi nuovo competitor all'analisi</span>
        </button>
      </div>
    </div>
  );
};

export default SetupView;
