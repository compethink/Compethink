
import { Competitor, Cluster, Metric } from '../types';
import { CLUSTERS_DEFINITION } from '../constants';

// Crea un nuovo competitor basandosi sulla definizione dei cluster
export const createCompetitor = (name = "Nuovo Competitor", domain = ""): Competitor => {
  const clusters: Cluster[] = CLUSTERS_DEFINITION.map(c => ({
    id: c.id,
    name: c.name,
    weight: c.weight,
    avgScore: 0,
    metrics: c.metrics.map(m => ({
      name: m.name,
      score: 0,
      type: m.type as any // Usiamo as any solo se necessario per il compilatore, ma evitiamo se possibile
    }))
  }));

  return {
    id: crypto.randomUUID(),
    name,
    domain,
    totalScore: 0,
    organicTraffic: 0,
    brandedTraffic: 0,
    brandedShare: 0,
    clusters
  };
};

// Calcola i punteggi ponderati per cluster e totale
export const processScores = (comp: Competitor): Competitor => {
  let weightedSum = 0;
  let totalWeight = 0;

  const updatedClusters = comp.clusters.map(cluster => {
    const sum = cluster.metrics.reduce((acc, m) => acc + m.score, 0);
    const avg = cluster.metrics.length > 0 ? Math.round(sum / cluster.metrics.length) : 0;
    
    weightedSum += avg * cluster.weight;
    totalWeight += 100 * cluster.weight;

    return { ...cluster, avgScore: avg };
  });

  const totalScore = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 1000) : 0;
  const brandedShare = comp.organicTraffic > 0 ? Math.round((comp.brandedTraffic / comp.organicTraffic) * 100) : 0;

  return { ...comp, clusters: updatedClusters, totalScore, brandedShare };
};

// Alias per compatibilità
export const calculateScores = processScores;
