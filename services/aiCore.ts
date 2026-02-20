
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Language, GenerationMode } from "../types";

/**
 * Ensures we always create a fresh instance right before a call.
 * This handles potential API key updates from the user UI.
 */
export const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getModel = (mode: GenerationMode): string => {
    return mode === 'Fast' ? 'gemini-3-flash-preview' : 'gemini-3-pro-preview';
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
 * Enhanced to recursively check ALL string values for base64 patterns.
 */
export const sanitizeContext = (context: string | any, options?: { excludeStrategy?: boolean }): string => {
    if (!context) return "";
    
    let parsed: any = null;
    let isJson = false;
    let preText = "";
    let postText = "";

    try {
        if (typeof context === 'object' && context !== null) {
            parsed = context;
            isJson = true;
        } else if (typeof context === 'string') {
            const trimmed = context.trim();
            // Try to parse the whole string first
            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                try {
                    parsed = JSON.parse(trimmed);
                    isJson = true;
                } catch(e) { /* ignore */ }
            }
            
            // If strict parse failed, try to find embedded JSON
            if (!isJson) {
                const firstBrace = context.indexOf('{');
                const lastBrace = context.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace > firstBrace) {
                    const potentialJson = context.substring(firstBrace, lastBrace + 1);
                    try {
                        parsed = JSON.parse(potentialJson);
                        if (parsed && (typeof parsed === 'object')) {
                            isJson = true;
                            preText = context.substring(0, firstBrace);
                            postText = context.substring(lastBrace + 1);
                        }
                    } catch (e) {
                        // Ignore
                    }
                }
            }
        }
    } catch (e) {
        isJson = false;
    }

    if (isJson && parsed && typeof parsed === 'object') {
        const recursiveSanitize = (obj: any) => {
            if (!obj || typeof obj !== 'object') return;
            
            // Exclude strategic pillars if requested at the top level
            if (options?.excludeStrategy) {
                if ('bigIdea' in obj) delete obj.bigIdea;
                if ('offer' in obj) delete obj.offer;
                if ('campaignPlan' in obj) delete obj.campaignPlan;
            }

            if (Array.isArray(obj)) {
                obj.forEach((item, index) => {
                    if (typeof item === 'string' && item.length > 500 && item.includes('data:image')) {
                        obj[index] = "[Image Data Removed]";
                    } else {
                        recursiveSanitize(item);
                    }
                });
            } else {
                Object.keys(obj).forEach(key => {
                    const val = obj[key];
                    if (typeof val === 'string' && val.length > 500 && val.includes('data:image')) {
                        obj[key] = "[Image Data Removed]";
                    } else if (typeof val === 'object' && val !== null) {
                        recursiveSanitize(val);
                    }
                });
            }
        };
        
        try {
            const copy = JSON.parse(JSON.stringify(parsed));
            recursiveSanitize(copy);
            const sanitizedJson = JSON.stringify(copy);
            return preText + sanitizedJson + postText;
        } catch (e) {
            return typeof context === 'string' ? context : JSON.stringify(context);
        }
    }

    // Fallback: If it's a string we couldn't parse, just return it (or truncate if extremely long)
    return typeof context === 'string' ? context : JSON.stringify(context);
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
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

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
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (blob) resolve(blob);
                        else reject(new Error('Canvas to Blob failed'));
                    },
                    'image/jpeg',
                    quality
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

export const imageUrlToBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    // Compress before converting to base64
    const compressedBlob = await compressImage(blob);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(compressedBlob);
    });
  } catch (e) { return null; }
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
