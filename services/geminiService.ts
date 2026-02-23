
import { GoogleGenAI, Type } from "@google/genai";
import { MarketAudit } from "../types";

/**
 * Analisi AEO e Brand Authority potenziata con distinzione tra Qualitativo e Tecnico
 */
export const getDomainQualityAI = async (domain: string, technicalMetrics?: any) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Agisci come un Senior Web Auditor e Strategist Digitale. Analizza il dominio: ${domain}.
    
    Esegui una ricerca approfondita per valutare questi parametri QUALITATIVI (0-100):
    1. qualitative_ux: Valuta il design, la facilità di navigazione, la gerarchia visiva e l'efficacia del messaggio (non la velocità).
    2. brand_authority: Forza del brand online, citazioni su siti terzi autorevoli e autorevolezza percepita.
    3. tech_stack: Livello di innovazione degli strumenti utilizzati (MarTech, CRM, Tracking).
    4. content_quality: Freschezza dei contenuti, profondità delle informazioni e utilità per l'utente.

    Valuta inoltre la presenza del brand nei motori di ricerca AI (ChatGPT, Perplexity, Gemini).

    RESTITUISCI SOLO JSON:
    {
      "qualitative_ux": number,
      "brand_authority": number, 
      "chatgpt": number, 
      "perplexity": number,
      "gemini": number,
      "tech_stack": number,
      "content_quality": number,
      "branded_share": number,
      "ai_justification": string 
    }`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: { 
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            qualitative_ux: { type: Type.NUMBER },
            brand_authority: { type: Type.NUMBER },
            chatgpt: { type: Type.NUMBER },
            perplexity: { type: Type.NUMBER },
            gemini: { type: Type.NUMBER },
            tech_stack: { type: Type.NUMBER },
            content_quality: { type: Type.NUMBER },
            branded_share: { type: Type.NUMBER },
            ai_justification: { type: Type.STRING }
          },
          required: ['qualitative_ux', 'brand_authority', 'chatgpt', 'perplexity', 'gemini', 'tech_stack', 'content_quality', 'branded_share', 'ai_justification']
        },
        tools: [{ googleSearch: {} }] 
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (e) {
    console.error("Gemini Analysis Error:", e);
    return null;
  }
};

export const analyzeCompetitorAI = getDomainQualityAI;

export const generateAuditInsights = async (data: MarketAudit, competitorName: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const competitor = data.competitors.find(c => c.name === competitorName);
    if (!competitor) return 'Competitor non trovato.';

    const prompt = `Fornisci 3 azioni prioritarie e CONCRETE per migliorare il posizionamento AEO di ${competitorName}.
    Evita consigli generici. Basati sui dati: ${JSON.stringify(competitor)}`;
    
    const res = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });
    return res.text || 'Non disponibile.';
  } catch (e) {
    return 'Errore durante la generazione degli insight.';
  }
};

export const generateMarketViewAnalysis = async (data: MarketAudit) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Analisi strategica di mercato per ${data.clientName}. 
    Esegui un'analisi SWOT comparativa basata sui punteggi AI e SEO: ${JSON.stringify(data.competitors)}`;
    
    const res = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt
    });
    return res.text || 'Report non disponibile.';
  } catch (e) {
    return 'Errore durante la generazione del report di mercato.';
  }
};
