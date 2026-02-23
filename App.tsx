import React, { useState, useEffect, useRef } from 'react';
import { MarketAudit } from './types';
import { createCompetitor } from './services/dataProcessor';
import SetupView from './components/SetupView';
import MarketDashboard from './components/MarketDashboard';
import AiStrategyView from './components/AiStrategyView';
import HistoryView from './components/HistoryView';
import Sidebar from './components/Sidebar';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('setup');
  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString());
  
  // Stato Cronologia (Limite 20)
  const [history, setHistory] = useState<MarketAudit[]>(() => {
    const saved = localStorage.getItem('compethink_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Stato Dati Correnti
  const [data, setData] = useState<MarketAudit>(() => {
    const saved = localStorage.getItem('compethink_v2_data');
    if (saved) return JSON.parse(saved);
    return {
      clientName: 'Nuovo Cliente',
      industry: '',
      seoZoomKey: '',
      competitors: [createCompetitor('Mio Brand', '')],
      lastUpdated: new Date().toISOString()
    };
  });

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Persistenza Cronologia
  useEffect(() => {
    localStorage.setItem('compethink_history', JSON.stringify(history));
  }, [history]);

  // Auto-save sessione corrente (Reboot Safety)
  useEffect(() => {
    localStorage.setItem('compethink_v2_data', JSON.stringify(data));
  }, [data]);

  const saveToHistory = () => {
    const snapshot: MarketAudit = JSON.parse(JSON.stringify(dataRef.current));
    snapshot.lastUpdated = new Date().toISOString();

    setHistory(prev => {
      // Evitiamo duplicati identici se l'ultimo salvato è uguale (opzionale)
      const newHistory = [snapshot, ...prev];
      return newHistory.slice(0, 20);
    });
    
    setLastSaved(new Date().toLocaleTimeString());
  };

  const loadFromHistory = (item: MarketAudit) => {
    setData(JSON.parse(JSON.stringify(item)));
    setActiveTab('setup');
  };

  const removeFromHistory = (index: number) => {
    setHistory(prev => prev.filter((_, i) => i !== index));
  };

  const handleNewAnalysis = () => {
    // PROTEZIONE: Se ci sono dati, salviamo automaticamente nello storico prima di pulire
    const current = dataRef.current;
    const hasData = current.clientName !== 'Nuovo Cliente' || current.competitors.some(c => c.domain);
    
    if (hasData) {
      saveToHistory();
    }

    setData({
      clientName: 'Nuovo Cliente',
      industry: '',
      seoZoomKey: data.seoZoomKey, // Manteniamo la chiave API per continuità
      competitors: [createCompetitor('Mio Brand', '')],
      lastUpdated: new Date().toISOString()
    });
    setActiveTab('setup');
  };

  return (
    <div className="flex h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500/30 overflow-hidden">
      <Sidebar 
        active={activeTab} 
        onChange={setActiveTab} 
        lastSaved={lastSaved} 
        history={history.slice(0, 5)} 
        onLoadHistory={loadFromHistory}
        onNewAnalysis={handleNewAnalysis}
      />
      
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {activeTab === 'setup' && (
            <SetupView 
              data={data} 
              onUpdate={setData} 
              onSnapshot={saveToHistory} 
            />
          )}
          {activeTab === 'dashboard' && <MarketDashboard data={data} />}
          {activeTab === 'insights' && <AiStrategyView data={data} />}
          {activeTab === 'history' && (
            <HistoryView 
              history={history} 
              onLoad={loadFromHistory} 
              onRemove={removeFromHistory} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;