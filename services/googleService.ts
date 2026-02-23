
export interface PageSpeedMetrics {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
}

const MAX_RETRIES = 2;
const INITIAL_BACKOFF = 2000;

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Recupera i dati di Performance da Google PageSpeed con logica di Retry.
 */
export const fetchPageSpeedData = async (url: string): Promise<PageSpeedMetrics | null> => {
  let attempts = 0;
  
  while (attempts <= MAX_RETRIES) {
    try {
      let cleanUrl = url.trim();
      if (!cleanUrl.startsWith('http')) {
        cleanUrl = `https://${cleanUrl}`;
      }
      
      const apiKey = process.env.API_KEY;
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(cleanUrl)}&category=PERFORMANCE&category=SEO&strategy=mobile${apiKey ? `&key=${apiKey}` : ''}`;
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        if (response.status === 429 || response.status >= 500) {
          throw new Error(`Status ${response.status}`);
        }
        return null;
      }
      
      const data = await response.json();
      const categories = data.lighthouseResult?.categories;

      if (!categories) return null;

      return {
        performance: Math.round((categories.performance?.score || 0) * 100),
        seo: Math.round((categories.seo?.score || 0) * 100),
        accessibility: Math.round((categories.accessibility?.score || 0) * 100),
        bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      };
    } catch (error) {
      attempts++;
      if (attempts <= MAX_RETRIES) {
        const wait = INITIAL_BACKOFF * Math.pow(2, attempts - 1);
        console.warn(`PageSpeed fallito (tentativo ${attempts}). Riprovo tra ${wait}ms...`);
        await delay(wait);
      } else {
        console.warn("Connessione a Google PageSpeed fallita definitivamente.");
      }
    }
  }
  
  return null;
};
