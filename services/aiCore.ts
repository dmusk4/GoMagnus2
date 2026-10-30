
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language, GenerationMode } from "../types";

/**
 * Ensures we always create a fresh instance right before a call.
 * This handles potential API key updates from the user UI.
 */
export const getAI = () => {
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY || (typeof window !== 'undefined' ? ((window as any).__GEMINI_API_KEY__ || localStorage.getItem('gemini_api_key') || '') : '');
    return new GoogleGenAI({ apiKey });
};

export const getModel = (mode: GenerationMode): string => {
    return mode === 'Fast' ? 'gemini-3.8-flash' : 'gemini-3.1-pro-preview';
};

/**
 * Returns an ordered fallback chain for model generation.
 * If the primary model (e.g. gemini-3.8-flash) encounters rate limits (429), resource exhaustion,
 * or temporary unavailability, the system falls back automatically to proven fallback models.
 */
export const getModelFallbackChain = (primaryModel: string): string[] => {
    const fallbacks: string[] = [primaryModel];
    if (primaryModel === 'gemini-3.8-flash') {
        fallbacks.push('gemini-2.5-flash', 'gemini-3.1-pro-preview');
    } else if (primaryModel === 'gemini-3.1-pro-preview') {
        fallbacks.push('gemini-3.8-flash', 'gemini-2.5-pro');
    } else {
        fallbacks.push('gemini-3.8-flash', 'gemini-2.5-flash');
    }
    return Array.from(new Set(fallbacks));
};

/**
 * Helper to call ai.models.generateContent with automatic fallback through the candidate models
 * when encountering quota/rate-limit (429), capacity errors (503), or model-specific unavailability.
 */
export const generateWithFallback = async (
    ai: GoogleGenAI,
    params: {
        model: string;
        contents: any;
        config?: any;
    },
    signal?: AbortSignal
): Promise<GenerateContentResponse> => {
    const chain = getModelFallbackChain(params.model);
    let lastError: any = null;

    for (let i = 0; i < chain.length; i++) {
        if (signal?.aborted) throw new Error("Aborted");
        const currentModel = chain[i];
        try {
            const response = await ai.models.generateContent({
                ...params,
                model: currentModel
            });
            return response;
        } catch (err: any) {
            lastError = err;
            const errStr = (err?.message || err?.toString() || "").toLowerCase();
            const isLimitOrUnavailable = 
                errStr.includes("429") || 
                errStr.includes("quota") || 
                errStr.includes("rate limit") || 
                errStr.includes("resource_exhausted") || 
                errStr.includes("unavailable") || 
                errStr.includes("503") || 
                errStr.includes("overloaded") ||
                errStr.includes("model not found") ||
                errStr.includes("not supported");

            if (isLimitOrUnavailable && i < chain.length - 1) {
                console.warn(`Model ${currentModel} reached limit or error. Falling back to ${chain[i + 1]}...`, err?.message || err);
                continue;
            }
            // If it's another non-recoverable error or we exhausted all fallbacks, throw
            throw err;
        }
    }
    throw lastError;
};

/**
 * Email Subject Blacklist (Common Spam Triggers)
 * These words or patterns often hurt deliverability.
 */
export const EMAIL_SUBJECT_BLACKLIST = [
    "FREE", "GRÁTIS", "GUARANTEE", "GARANTIA", "WINNER", "GANHADOR", "CASH", "DINHEIRO",
    "MAKE MONEY", "GANHAR DINHEIRO", "URGENT", "URGENTE", "ACT NOW", "AGORA", "100%",
    "PROFIT", "LUCRO", "INVESTMENT", "INVESTIMENTO", "RISK-FREE", "SEM RISCO", "MILLION", "MILHÃO"
];

export const getLangName = (lang: Language) => {
    if (lang === 'pt') return 'Português (Portugal)';
    if (lang === 'es') return 'Español (Castellano)';
    return 'English (US)';
};

/**
 * Aggressively sanitizes context by removing ALL large base64 strings and nested image data.
 * Also handles exclusion of strategic pillars (Power Offer & Action Plan) if requested.
 * Prevents RangeError / string length memory issues by using safe replacer functions.
 */
export const sanitizeContext = (context: string | any, options?: { excludeStrategy?: boolean }): string => {
    if (!context) return "";
    
    // If context is an object, serialize safely using a JSON replacer that skips base64 strings and oversized items
    if (typeof context === 'object' && context !== null) {
        try {
            return JSON.stringify(context, (key, value) => {
                if (options?.excludeStrategy && (key === 'bigIdea' || key === 'offer' || key === 'campaignPlan')) {
                    return undefined;
                }
                if (key === 'creatives' || key === 'storyboards') {
                    if (Array.isArray(value)) {
                        return value.map((c: any) => ({
                            id: c.id,
                            style: c.style,
                            headline: c.headline,
                            subheadline: c.subheadline
                        }));
                    }
                }
                if (typeof value === 'string') {
                    if (value.startsWith('data:image/') || value.length > 2000) {
                        if (value.includes('data:image') || value.includes('base64')) {
                            return '[Image Data Removed]';
                        }
                    }
                }
                return value;
            });
        } catch (e) {
            return "";
        }
    }

    if (typeof context === 'string') {
        let str = context;
        // Strip out large data URI strings if present
        if (str.includes('data:image/')) {
            str = str.replace(/data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+/g, '[Image Data Removed]');
        }
        // Protect from oversized string payloads
        if (str.length > 30000) {
            str = str.substring(0, 30000) + '... [context truncated]';
        }
        return str;
    }

    return "";
};

export const extractJSON = (text: string | undefined | null): any => {
    if (!text) return null;
    
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            return JSON.parse(trimmed);
        } catch (e) {}
    }

    const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/gi;
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
        try {
            const parsed = JSON.parse(match[1].trim());
            if (parsed) return parsed;
        } catch (e) {}
    }

    const firstBrace = trimmed.indexOf('{');
    const lastBrace = trimmed.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const potential = trimmed.substring(firstBrace, lastBrace + 1);
        try {
            return JSON.parse(potential);
        } catch (e) {
            let end = lastBrace;
            while (end > firstBrace) {
                try {
                    return JSON.parse(trimmed.substring(firstBrace, end + 1));
                } catch (innerE) {
                    end = trimmed.lastIndexOf('}', end - 1);
                    if (end === -1) break;
                }
            }
        }
    }
    return null;
};

// Helper for extracting valid JSON objects from a streaming string buffer
export const extractJsonArrayObjects = (text: string) => {
    const objects = [];
    let depth = 0;
    let start = -1;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') {
            if (depth === 0) start = i;
            depth++;
        } else if (text[i] === '}') {
            depth--;
            if (depth === 0 && start !== -1) {
                try {
                    const jsonStr = text.substring(start, i + 1);
                    const obj = JSON.parse(jsonStr);
                    objects.push(obj);
                } catch (e) {
                    // Ignore parsing errors for incomplete chunks
                }
                start = -1;
            }
        }
    }
    return objects;
};

export const parsePartialBuyerJson = (text: string): any => {
    const fields = ["name", "archetype", "ageRange", "occupation", "income", "painPoint", "desire", "objection", "trigger", "physicalDescription", "selectionReasoning"];
    const result: any = {};
    fields.forEach(field => {
        const regex = new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`, 'i');
        const match = text.match(regex);
        if (match && match[1]) result[field] = match[1];
    });
    return Object.keys(result).length > 0 ? result : null;
};

export const getMimeTypeFromBase64 = (base64: string): string => {
    const match = base64.match(/^data:([^;]+);/);
    return match ? match[1] : 'image/png';
};

export const fetchPageMetadata = async (url: string): Promise<any> => {
    try {
        const target = `https://api.microlink.io?url=${encodeURIComponent(url)}&screenshot=true&meta=true`;
        const response = await fetch(target);
        if (!response.ok) {
            // Silently fail to allow Gemini fallback
            return null;
        }
        const data = await response.json();
        if (data.status === 'success') return data.data;
        return null;
    } catch (e) { return null; }
};

/**
 * Compresses an image blob to a maximum dimension while maintaining aspect ratio.
 * Significantly reduces token usage/payload size for API calls.
 */
const compressImage = async (file: Blob, maxDimension = 1024, quality = 0.8): Promise<Blob> => {
    if (!file || file.size <= 300 * 1024) return file;
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (!width || !height) return resolve(file);

                if (width > height) {
                    if (width > maxDimension) {
                        height *= maxDimension / width;
                        width = maxDimension;
                    }
                } else {
                    if (height > maxDimension) {
                        width *= maxDimension / height;
                        height = maxDimension;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) return resolve(file);

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else resolve(file);
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = () => resolve(file);
        };
        reader.onerror = () => resolve(file);
    });
};

export const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  if (!url) return null;

  // If already base64 data URL
  if (url.startsWith('data:')) {
    return url;
  }

  // If local blob URL
  if (url.startsWith('blob:')) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        const blob = await response.blob();
        let compressedBlob = blob;
        try {
          compressedBlob = await compressImage(blob);
        } catch (_) {}
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(compressedBlob);
        });
      }
    } catch (_) {}
  }

  try {
    let response: Response | null = null;
    try {
      response = await fetch(url);
    } catch (e) {
      // Direct fetch failed (likely CORS)
    }

    if (!response || !response.ok) {
      // Try multiple CORS proxies in order
      const proxies = [
        (target: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(target)}`,
        (target: string) => `https://corsproxy.io/?${encodeURIComponent(target)}`,
        (target: string) => `https://wsrv.nl/?url=${encodeURIComponent(target)}`
      ];

      for (const proxyFn of proxies) {
        try {
          const proxyUrl = proxyFn(url);
          const res = await fetch(proxyUrl);
          if (res.ok) {
            response = res;
            break;
          }
        } catch (_) {}
      }
    }

    if (!response || !response.ok) {
      // Try Canvas Image loading fallback as last resort
      try {
        const fallbackBase64 = await new Promise<string | null>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              canvas.width = img.naturalWidth || img.width || 500;
              canvas.height = img.naturalHeight || img.height || 500;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/jpeg', 0.85));
              } else {
                resolve(null);
              }
            } catch (_) {
              resolve(null);
            }
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
        if (fallbackBase64) return fallbackBase64;
      } catch (_) {}

      console.warn("Could not fetch image from url:", url);
      return null;
    }

    const blob = await response.blob();
    let compressedBlob = blob;
    try {
      compressedBlob = await compressImage(blob);
    } catch (_) {}

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(compressedBlob);
    });
  } catch (e) {
    console.warn("Error processing image from url:", url, e);
    return null;
  }
};

export const fileToBase64 = async (file: Blob): Promise<string> => {
    try {
        // Compress input file before converting
        const compressedBlob = await compressImage(file);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(compressedBlob);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    } catch (e) {
        // Fallback to original if compression fails
        console.error("Compression failed, using original", e);
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    }
};
