export const CLUSTERS_DEFINITION = [
  { 
    id: 'authority', 
    name: 'Autorità & Performance Website', 
    weight: 10, 
    metrics: [
      { name: 'Authority Score', type: 'seozoom' },
      { name: 'Website Grader', type: 'ai' },
      { name: 'Site Health', type: 'seozoom' },
      { name: 'Trust', type: 'seozoom' }
    ]
  },
  { 
    id: 'ai_aeo', 
    name: 'AI Readiness & AEO Grader', 
    weight: 9, 
    metrics: [
      { name: 'Menzioni AI', type: 'seozoom' },
      { name: 'Visibilità AI', type: 'seozoom' },
      { name: 'ChatGPT Score', type: 'ai' },
      { name: 'Perplexity Score', type: 'ai' },
      { name: 'Gemini Score', type: 'ai' }
    ]
  },
  { 
    id: 'content', 
    name: 'Content Strategy & SEO', 
    weight: 10, 
    metrics: [
      { name: 'Presenza blog aziendale', type: 'qualitative' },
      { name: 'Opportunity', type: 'seozoom' },
      { name: 'Stability', type: 'seozoom' }
    ]
  },
  { 
    id: 'social', 
    name: 'Social Media & Community', 
    weight: 8, 
    metrics: [
      { name: 'Social brand image', type: 'qualitative' },
      { name: 'Engagement social', type: 'calculated' },
      { name: 'Profili presidiati', type: 'qualitative' },
      { name: 'Social Verticali', type: 'qualitative' },
      { name: 'Community marketing', type: 'qualitative' },
      { name: 'Utilizzo video', type: 'qualitative' }
    ]
  },
  { 
    id: 'advertising', 
    name: 'Ads (Search & Social)', 
    weight: 8, 
    metrics: [
      { name: 'Social Ads Strategy', type: 'qualitative' },
      { name: 'Search Ads Strategy', type: 'qualitative' }
    ]
  },
  { 
    id: 'stack', 
    name: 'Tech Stack (Mar/Sales/Serv)', 
    weight: 9, 
    metrics: [
      { name: 'Stack Marketing', type: 'qualitative' },
      { name: 'Stack Sales', type: 'qualitative' },
      { name: 'Stack Service', type: 'qualitative' },
      { name: 'Lead Gen Tools', type: 'qualitative' }
    ]
  }
];

export const METRIC_DESCRIPTIONS = {
  'Authority Score': {
    desc: 'Indica la forza autorevole del dominio basata sul profilo backlink e posizionamenti storici.',
    source: 'SEOZoom (ZA)',
    importance: 'Fondamentale per capire la fiducia dei motori verso il dominio.'
  },
  'Website Grader': {
    desc: 'Analisi ibrida di Performance, SEO, UX e Accessibilità.',
    source: 'Google PageSpeed + Gemini AI',
    importance: 'Misura la capacità tecnica del sito di convertire traffico.'
  },
  'Site Health': {
    desc: 'Stato di salute tecnica (errori 404, duplicazioni, velocità di scansione).',
    source: 'SEOZoom Audit + Google Best Practices',
    importance: 'Influenza direttamente la capacità di posizionamento.'
  },
  'Trust': {
    desc: 'Affidabilità percepita dai motori di ricerca.',
    source: 'SEOZoom Trust Score',
    importance: 'Un trust alto facilita il ranking di nuovi contenuti.'
  },
  'Menzioni AI': {
    desc: 'Frequenza con cui il brand appare nei dataset di training degli LLM.',
    source: 'SEOZoom AI Dataset Analysis',
    importance: 'Essenziale per essere citati nelle risposte AI.'
  },
  'Visibilità AI': {
    desc: 'Quota di presenza nelle risposte generate (AEO).',
    source: 'SEOZoom AEO Tracking',
    importance: 'Definisce la visibilità nel nuovo paradigma di ricerca.'
  },
  'ChatGPT Score': {
    desc: 'Efficacia del brand nel posizionarsi su OpenAI.',
    source: 'Gemini AI Simulation',
    importance: 'Cruciale per intercettare l\'audience di ChatGPT.'
  },
  'Perplexity Score': {
    desc: 'Capacità del brand di apparire come fonte su Perplexity AI.',
    source: 'Gemini AI Simulation',
    importance: 'Cruciale per i brand B2B e informativi.'
  },
  'Gemini Score': {
    desc: 'Ottimizzazione per l\'ecosistema generativo di Google.',
    source: 'Gemini AI Simulation',
    importance: 'Essenziale per mantenere la visibilità Google.'
  },
  'Opportunity': {
    desc: 'Potenziale di crescita stimato su keyword non presidiate.',
    source: 'SEOZoom Opportunity Metric',
    importance: 'Aiuta a individuare le lacune dei competitor.'
  },
  'Stability': {
    desc: 'Capacità della SEO di resistere agli update algoritmici.',
    source: 'SEOZoom Stability Score',
    importance: 'Indica la resilienza della strategia SEO.'
  },
  'Engagement social': {
    desc: 'Rapporto tra follower e interazioni reali.',
    source: 'Calcolo Social',
    importance: 'Distingue fan passivi da community attive.'
  },
  'Social brand image': {
    desc: 'Coerenza visiva e comunicativa sui canali social.',
    source: 'Analisi Qualitativa',
    importance: 'Influenza la percezione di affidabilità.'
  },
  'Profili presidiati': {
    desc: 'Ampiezza della presenza sui principali canali social.',
    source: 'Analisi Qualitativa',
    importance: 'Misura la copertura dei punti di contatto.'
  },
  'Social Verticali': {
    desc: 'Utilizzo di canali specifici di settore.',
    source: 'Analisi Qualitativa',
    importance: 'Indica la capacità di parlare a nicchie specifiche.'
  },
  'Community marketing': {
    desc: 'Presenza di strategie di gestione community attive.',
    source: 'Analisi Qualitativa',
    importance: 'Fiducia e fidelizzazione degli utenti.'
  },
  'Utilizzo video': {
    desc: 'Efficacia nell\'uso di formati video (Shorts, Reels, YouTube).',
    source: 'Analisi Qualitativa',
    importance: 'Il video è il formato a più alto engagement attuale.'
  },
  'Social Ads Strategy': {
    desc: 'Maturità delle campagne pubblicitarie social.',
    source: 'Analisi Qualitativa',
    importance: 'Misura la capacità di scalare l\'acquisizione.'
  },
  'Search Ads Strategy': {
    desc: 'Utilizzo di Google Ads e strategie di search advertising.',
    source: 'Analisi Qualitativa',
    importance: 'Cruciale per intercettare la domanda diretta.'
  },
  'Stack Marketing': {
    desc: 'Strumenti di automation e tracking.',
    source: 'Analisi MarTech',
    importance: 'Maturità dei processi digitali.'
  },
  'Stack Sales': {
    desc: 'Integrazione CRM e pipeline di vendita.',
    source: 'Analisi SalesTech',
    importance: 'Efficacia nella gestione dei lead.'
  },
  'Stack Service': {
    desc: 'Strumenti di customer care e assistenza.',
    source: 'Analisi ServiceTech',
    importance: 'Fidelizzazione post-vendita.'
  },
  'Lead Gen Tools': {
    desc: 'Efficacia di form e strumenti di conversione.',
    source: 'Analisi Qualitativa',
    importance: 'Capacità di trasformare visite in business.'
  },
  'Presenza blog aziendale': {
    desc: 'Attualità e rilevanza dei contenuti del blog.',
    source: 'Analisi Content',
    importance: 'Fondamentale per la top-of-funnel awareness.'
  }
};

export const QUALITATIVE_SCALES = {
  standard: [0, 25, 50, 75, 100],
  tech: [0, 50, 100],
  engagement: [
    { label: '> 5', value: 100 },
    { label: '4 - 5', value: 75 },
    { label: '2 - 3', value: 50 },
    { label: '1 - 2', value: 25 },
    { label: '< 1', value: 0 }
  ]
};

export const INDUSTRY_SECTORS = [
  "Agricoltura e Silvicoltura",
  "Allevamento",
  "Pesca e Acquacoltura",
  "Estrazione",
  "Edilizia e Costruzioni",
  "Manifatturiero e Meccanica",
  "Chimica e Farmaceutica",
  "Tessile, Moda e Abbigliamento",
  "Arredamento e Legno",
  "Alimentari e Vini",
  "Automotive",
  "Artigianato",
  "Commercio e Retail",
  "Turismo e Alberghiero",
  "Trasporti e Logistica",
  "Sanità e Assistenza Sociale",
  "Istruzione e Formazione",
  "Finanza e Assicurazioni",
  "Information Technology (IT) e Digitale",
  "Marketing, Pubblicità e Comunicazione",
  "Amministrazione Pubblica",
  "Servizi Avanzati (Quaternario)",
  "Green Economy e Sostenibilità",
  "Intelligenza Artificiale e Robotica",
  "Sanità e Biotecnologie",
  "Servizi al Cliente (Customer Care)"
];

export const COLORS = {
  primary: '#6366f1',
  secondary: '#a855f7',
  accent: '#ec4899',
  dark: '#1a1a2e',
  gray: '#f3f4f6'
};