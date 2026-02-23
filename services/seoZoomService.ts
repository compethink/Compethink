/**
 * Servizio SEOZoom con gestione proxy e fallback avanzato + Retry Logic
 * Ottimizzato per gestire risposte non-JSON (HTML) dai proxy.
 */

const PROXIES = [
  (url: string) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&_=${Date.now()}`,
  (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
  (url: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
];

const MAX_RETRIES = 2; 
const INITIAL_BACKOFF = 1500; 
const REQUEST_TIMEOUT = 25000; // 25 secondi

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithFallback(url: string) {
  let lastError = null;

  for (const proxyFn of PROXIES) {
    let attempts = 0;
    
    while (attempts < MAX_RETRIES) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      try {
        const proxyUrl = proxyFn(url);
        const response = await fetch(proxyUrl, { 
          signal: controller.signal,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          if (response.status >= 500 || response.status === 429) {
            throw new Error(`HTTP ${response.status}`);
          }
          break; 
        }
        
        // Leggiamo come testo per evitare SyntaxError: Unexpected token '<'
        const text = await response.text();
        if (!text || text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
          throw new Error("Il proxy ha restituito HTML invece di JSON");
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error("Errore nel parsing JSON della risposta del proxy");
        }
        
        // Normalizzazione dati AllOrigins
        let contents = data;
        if (data && typeof data.contents === 'string') {
          const innerText = data.contents.trim();
          if (innerText.startsWith('<!DOCTYPE') || innerText.startsWith('<html')) {
            throw new Error("AllOrigins ha catturato una pagina HTML");
          }
          try {
            contents = JSON.parse(innerText);
          } catch (e) {
            contents = data.contents;
          }
        } else if (data && data.contents) {
          contents = data.contents;
        }
        
        // Verifica validità dati SEOZoom
        if (contents && (contents.response || contents.status === 'success' || Array.isArray(contents))) {
          return contents;
        }
        
        throw new Error("Formato dati SEOZoom non riconosciuto");
      } catch (e: any) {
        clearTimeout(timeoutId);
        attempts++;
        lastError = e;
        
        console.warn(`[SEOZoom Sync] Fallimento con proxy ${proxyFn.name} (Tentativo ${attempts}/${MAX_RETRIES}): ${e.message}`);

        if (attempts < MAX_RETRIES) {
          const backoff = INITIAL_BACKOFF * Math.pow(2, attempts - 1);
          await delay(backoff);
        } else {
          // Se abbiamo esaurito i tentativi per questo proxy, usciamo dal ciclo while
          // e il ciclo for passerà al prossimo proxy.
          break;
        }
      }
    }
  }
  throw lastError || new Error("Tutti i proxy hanno fallito o restituito dati non validi.");
}

export const fetchSeoZoomData = async (domain: string, apiKey: string) => {
  if (!apiKey) return null;
  
  const clean = domain.replace(/^https?:\/\//, '').split('/')[0].toLowerCase();
  
  const mUrl = `https://apiv2.seozoom.com/api/v2/domains/?api_key=${apiKey}&action=metrics&domain=${clean}&db=it`;
  const aiUrl = `https://apiv2.seozoom.com/api/v2/domains/?api_key=${apiKey}&action=aikeywords&domain=${clean}&db=it&offset=0&limit=100`;

  try {
    const [mRes, aiResRaw] = await Promise.all([
      fetchWithFallback(mUrl),
      fetchWithFallback(aiUrl)
    ]);

    const m = (mRes && mRes.response && mRes.response[0]) ? mRes.response[0] : {};
    const aiKeywords = (aiResRaw && aiResRaw.response) ? aiResRaw.response : [];
    
    const totalAiVisibility = Array.isArray(aiKeywords) 
      ? aiKeywords.reduce((acc: number, kw: any) => acc + (parseFloat(kw.visibility) || 0), 0)
      : 0;
    const totalAiMentions = Array.isArray(aiKeywords) ? aiKeywords.length : 0;

    return {
      za: parseInt(m.za) || 0,
      trust: parseInt(m.trust) || 0,
      opportunity: parseInt(m.opportunity_val || m.opportunity_score || m.opportunity || 0),
      stability: parseInt(m.stability_val || m.stability_score || m.stability || 0),
      health: parseInt(m.site_health || m.health || 0),
      traffic: parseInt(m.current_month_traffic || 0),
      branded: parseInt(m.branded_traffic || 0),
      aiMentions: totalAiMentions,
      aiVisibility: Math.min(100, Math.round(totalAiVisibility)) 
    };
  } catch (e) {
    console.error("Errore critico SEOZoom dopo retry:", e);
    return null;
  }
};

export const fetchSeoZoomExtended = fetchSeoZoomData;
