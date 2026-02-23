
export interface Metric {
  name: string;
  score: number;
  rawValue?: any;
  type: 'seozoom' | 'qualitative' | 'ai' | 'calculated';
}

export interface Cluster {
  id: string;
  name: string;
  weight: number;
  metrics: Metric[];
  avgScore: number;
}

export interface Competitor {
  id: string;
  name: string;
  domain: string;
  totalScore: number;
  organicTraffic: number;
  brandedTraffic: number;
  brandedShare: number;
  clusters: Cluster[];
}

export interface MarketAudit {
  clientName: string;
  industry: string;
  seoZoomKey: string;
  competitors: Competitor[];
  lastUpdated?: string;
}
