
import { Type, GenerateContentResponse } from "@google/genai";
import { Language, GenerationMode } from "../types";
import { getAI, getModel, extractJSON, sanitizeContext, getLangName, parsePartialBuyerJson } from "./aiCore";

export const generateSuggestion = async (context: string, label: string, lang: Language, mode: GenerationMode, instruction?: string): Promise<string> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `Context: ${sanitizeContext(context)}\nField to fill: ${label}\nSpecific Instruction: ${instruction || 'Suggest a creative value.'}\n\nCRITICAL: Ensure the suggestion is 100% consistent with all fields provided in the Context (especially Location, Audience, and Product Name). STRICT REQUIREMENT: Answer ONLY in ${getLangName(lang)}.`,
            config: {
                systemInstruction: `You are an elite copywriter and business strategist. Your task is to suggest a high-conversion value for a specific field based on the provided context of other business variables. Be specific, creative, and professional. Respond ONLY with the suggested text. Strictly use ${getLangName(lang)}.`,
                temperature: 0.8
            }
        });
        return response.text?.trim() || "";
    } catch (e) { return ""; }
};

export const generateRefinement = async (currentValue: string, context: string, label: string, lang: Language, mode: GenerationMode): Promise<string> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `Context (other fields): ${sanitizeContext(context)}\nField being refined: ${label}\nCurrent Value: ${currentValue}\n\nTask: Refine this text to be more impactful, professional, and persuasive. Ensure it aligns perfectly with the other anchors in the Context (e.g. if Context says Location is 'Spain', ensure language and currency nuances match). STRICT REQUIREMENT: Output MUST be in ${getLangName(lang)}.`,
            config: {
                systemInstruction: `You are an experienced business editor and direct-response architect. Improve clarity and emotional impact while maintaining consistency with provided business context. Respond ONLY with the refined text in ${getLangName(lang)}.`,
                temperature: 0.7
            }
        });
        return response.text?.trim() || "";
    } catch (e) { return currentValue; }
};

export const generateDreamBuyerStream = async (productContext: string, previousBuyerContext: string | null, lang: Language, mode: GenerationMode, onChunk: (partial: any) => void, focus?: string): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            archetype: { type: Type.STRING, description: "A catchy ICP archetype name, e.g. 'The Overwhelmed Visionary' or 'The Conscious Early-Adopter'." },
            ageRange: { type: Type.STRING },
            occupation: { type: Type.STRING },
            income: { type: Type.STRING },
            painPoint: { type: Type.STRING },
            desire: { type: Type.STRING },
            objection: { type: Type.STRING },
            trigger: { type: Type.STRING },
            mediaConsumption: { type: Type.STRING, description: "Where they spend time online and offline. Specific platforms, magazines, events, or communities." },
            physicalDescription: { type: Type.STRING },
            selectionReasoning: { type: Type.STRING },
        },
        required: ["name", "archetype", "ageRange", "occupation", "painPoint", "desire", "objection", "trigger", "mediaConsumption", "physicalDescription", "selectionReasoning"],
    };
    const avoidancePrompt = previousBuyerContext ? `\n\nAvoid previous profile and generate a NEW persona with DIFFERENT psychological angle. Focus on another pain point, another demographic or another purchase motive.` : "";
    const focusInstruction = focus ? `\n\nCRITICAL STRATEGIC DIRECTION: The user explicitly wants to focus on: "${focus}". Ensure the generated persona aligns perfectly with this specific angle.` : "";

    try {
        const streamResponse = await ai.models.generateContentStream({
            model: getModel(mode),
            contents: `Analyze: ${sanitizeContext(productContext)}. Define the ideal Dream Buyer. ${avoidancePrompt} ${focusInstruction}\n\nSTRICT RULE: All text fields MUST be in ${getLangName(lang)}. Adapt tone and demographics to the user location. Physical description must be very detailed for image generation. Use psychological depth. The 'archetype' field must be a powerful summary title for this segment. Define Media Consumption: Where they spend time online and offline.`,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema
            }
        });
        let fullText = "";
        for await (const chunk of streamResponse) {
            const part = chunk as GenerateContentResponse;
            fullText += part.text;
            const partialJson = parsePartialBuyerJson(fullText);
            if (partialJson) onChunk(partialJson);
        }
        return extractJSON(fullText);
    } catch (e) { throw e; }
}

export const generateAvatarVisuals = async (physicalDescription: string, productName: string): Promise<string[]> => {
    const ai = getAI();
    const options: string[] = [];
    const imageModels = ['gemini-2.5-flash-image', 'gemini-3.1-flash-image-preview', 'gemini-3-pro-image-preview'];
    
    const prompt = `Extreme minimalist high-definition studio portrait of an ordinary person, ${physicalDescription}.
    MANDATORY: NO BACKGROUND, NO ENVIRONMENT, NO OBJECTS. Ensure there are NO objects in hands, NO objects in background, NO furniture.
    Framing: Close-up head and shoulders only. 
    Lighting: Clean, soft, professional studio light.
    Style: Authentic, photorealistic, 8k resolution.`;
    
    for (const model of imageModels) {
        try {
            const res = await ai.models.generateContent({
                model: model,
                contents: { parts: [{ text: prompt }] },
                config: { 
                    imageConfig: { aspectRatio: "1:1" }
                } 
            });
            
            if (res?.candidates?.[0]?.content?.parts) {
                let found = false;
                for (const part of res.candidates[0].content.parts) {
                    if (part.inlineData?.data) {
                        options.push(`data:image/png;base64,${part.inlineData.data}`);
                        found = true;
                    }
                }
                if (found) {
                    return options;
                }
            }
        } catch (e: any) {
            console.warn(`Avatar Visual Generation failed with model ${model}, trying next...`, e.message || e);
        }
    }
    return options;
}

export const generateMarketPatterns = async (name: string, description: string, location: string, lang: Language, mode: GenerationMode): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            workingNow: { type: Type.ARRAY, items: { type: Type.STRING } },
            saturated: { type: Type.ARRAY, items: { type: Type.STRING } },
            opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["workingNow", "saturated", "opportunities"]
    };
    const contents = `You are a forensic market analyst. Analyze the market conditions for "${name}" in "${location}".
    
    DESCRIPTION: ${description}
    
    CRITICAL INSTRUCTIONS:
    1. RESEARCH REALITY: Identify actual trends and saturation in this niche.
    2. WORKING NOW: Identify specific strategies (not generic) currently working for competitors in ${location}.
    3. SATURATED: Find hooks or angles that are overused in this industry.
    4. OPPORTUNITIES: Identify unmet needs or gaps based on real customer complaints/reviews.
    
    Answer strictly in ${getLangName(lang)}.`;

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema, 
                tools: [{googleSearch: {}}]
            }
        });
        const parsed = extractJSON(response.text);
        if (parsed) return parsed;
    } catch (e) {
        console.warn("generateMarketPatterns failed with search tool, retrying without search tool...", e);
    }

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) {
        console.error("generateMarketPatterns fallback failed:", e);
        return null;
    }
}

export const generateLeanCanvas = async (name: string, description: string, lang: Language, mode: GenerationMode): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            problem: { type: Type.STRING },
            solution: { type: Type.STRING },
            uniqueValueProp: { type: Type.STRING },
            unfairAdvantage: { type: Type.STRING },
            customerSegments: { type: Type.STRING },
            channels: { type: Type.STRING },
            keyMetrics: { type: Type.STRING },
            costStructure: { type: Type.STRING },
            revenueStreams: { type: Type.STRING },
        },
        required: ["problem", "solution", "uniqueValueProp", "unfairAdvantage", "customerSegments", "channels", "keyMetrics", "costStructure", "revenueStreams"]
    };
    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `Generate a Lean Canvas for "${name}". 
            
            CONTEXT: ${description}
            
            CRITICAL: Understand a standard business model, pricing, and distribution for a product like this. Ensure the Problem and Solution are strictly grounded in what this specific product actually does. Avoid generic business jargon.
            
            Answer strictly in ${getLangName(lang)}.`,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) {
        console.error("generateLeanCanvas failed:", e);
        return null;
    }
}

export const generateBrandReputation = async (name: string, url: string, lang: Language, mode: GenerationMode): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            positives: { type: Type.ARRAY, items: { type: Type.STRING } },
            negatives: { type: Type.ARRAY, items: { type: Type.STRING } },
            sentimentScore: { type: Type.NUMBER },
        },
        required: ["positives", "negatives", "sentimentScore"]
    };
    const contents = `Realiza uma pesquisa sobre a reputação da marca "${name}".
    Analisa reviews genuínos e sentimentos online. 
    INSTRUÇÃO: Fornece insights diretos e acionáveis. Não é necessário repetir o nome da marca em cada ponto da lista. 
    O campo "sentimentScore" deve ser obrigatoriamente um número inteiro de 0 a 100, representando o nível de aprovação pública. 
    Não dês respostas genéricas. Se a marca não tiver reviews suficientes, analisa a reputação do nicho específico para produtos como o de "${name}". Answer strictly in ${getLangName(lang)}.`;

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema, 
                tools: [{googleSearch: {}}]
            }
        });
        const parsed = extractJSON(response.text);
        if (parsed) return parsed;
    } catch (e) {
        console.warn("generateBrandReputation failed with search tool, retrying without search tool...", e);
    }

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) {
        console.error("generateBrandReputation fallback failed:", e);
        return null;
    }
}

/**
 * Enhanced Forensic Marketing Analysis.
 * Now uses explicit metadata (title/description) from Microlink to ground the AI.
 */
export const analyzeProductUrl = async (
    url: string, 
    lang: Language, 
    mode: GenerationMode, 
    metaData?: { title?: string, description?: string }
): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: { 
            name: { type: Type.STRING }, 
            description: { type: Type.STRING }, 
            audienceType: { type: Type.STRING }, 
            location: { type: Type.STRING }, 
            goal: { type: Type.STRING }, 
            type: { type: Type.STRING }, 
            decisionMaker: { type: Type.STRING } 
        },
        required: ["name", "description", "audienceType", "location", "goal", "type", "decisionMaker"]
    };
    
    // Check if metadata is actually present
    const isMetadataMissing = !metaData || (!metaData.title && !metaData.description);
    
    // If metadata is present, use it. If not, fallback to using Gemini Search tool to find it.
    const tools = isMetadataMissing ? [{ googleSearch: {} }] : undefined;
    
    const groundText = !isMetadataMissing
        ? `\n\nSCRAPED METADATA FOR ACCURACY:\nTitle: ${metaData!.title || 'Unknown'}\nMeta Description: ${metaData!.description || 'Unknown'}\n\nUSE THIS DATA TO ENSURE THE DESCRIPTION IS 100% ACCURATE TO THE ACTUAL PAGE CONTENT.`
        : `\n\nMETADATA MISSING. CRITICAL: Use Google Search to find the actual content of ${url}. Do not hallucinate. Extract real title and description from search results to ensure accuracy.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview', // Force Pro for forensic analysis to ensure search capability and quality
            contents: `Forensic Marketing Analysis of: ${url}. ${groundText}
            CRITICAL INSTRUCTIONS:
            1. Extract the EXACT Brand Name or Product Name from H1 tags, titles, and logos. Do NOT use generic terms like "Store" or "Service".
            2. Build a high-resolution profile for the "decisionMaker" based on the brand's voice and product utility. Short and to the point.
            3. Ensure the description captures the unique value proposition (UVP) specifically found on that page.
            4. Verify all extracted data against the actual page content found via metadata or search.
            
            Answer strictly in ${getLangName(lang)}.`,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema,
                tools: tools,
                systemInstruction: `Professional brand forensic analyst. Absolute accuracy required. No hallucination. Synthesize provided metadata or search results with your analysis. Strictly use ${getLangName(lang)}.`
            }
        });
        return extractJSON(response.text);
    } catch (e) { throw e; }
};
