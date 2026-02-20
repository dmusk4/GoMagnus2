import { Type } from "@google/genai";
import { Language, GenerationMode, EmailStyle, IndustryNews } from "../types";
import { getAI, getModel, extractJSON, extractJsonArrayObjects } from "./aiCore";
import { 
  buildMetaAdPrompt, 
  getMetaAdSystemInstruction, 
  buildCreativeImagePrompt, 
  buildSearchAdsPrompt, 
  buildEmailCampaignPrompt, 
  buildStoryboardPrompt, 
  buildSceneRefreshPrompt, 
  buildNewsStreamPrompt, 
  buildLinkedInPrompt, 
  buildPhoneScriptPrompt 
} from "./prompts/creativePrompts";

export const generateCreativeText = async (context: string, style: string, location: string, lang: Language, mode: GenerationMode, strategicPillar?: string, isRefresh: boolean = false): Promise<any> => {
    const ai = getAI();
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            hook: { type: Type.STRING },
            headline: { type: Type.STRING },
            subheadline: { type: Type.STRING },
            caption: { type: Type.STRING },
            cta: { type: Type.STRING },
            visualPrompt: { type: Type.STRING, description: "A highly detailed, photorealistic AI image prompt to generate the visual for this ad. Describe lighting, composition, subject, and mood." }
        },
        required: ["hook", "headline", "subheadline", "caption", "cta", "visualPrompt"]
    };

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: buildMetaAdPrompt(context, location, style, lang, strategicPillar, isRefresh),
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: getMetaAdSystemInstruction(lang)
            }
        });
        return extractJSON(response.text);
    } catch (e) { return null; }
};

export const generateCreativeImage = async (
    prompt: string, 
    baseImages?: string | string[], 
    aspectRatio: string = "1:1", 
    composition?: string, 
    brandKit?: any, 
    style?: string,
    lang: Language = 'en'
): Promise<string | null> => {
    const ai = getAI();
    try {
        const finalPrompt = buildCreativeImagePrompt(prompt, style, composition, brandKit, lang);

        const parts: any[] = [{ text: finalPrompt }];
        
        // Handle single string or array of strings
        const imagesToProcess = Array.isArray(baseImages) 
            ? baseImages 
            : (baseImages ? [baseImages] : []);

        if (imagesToProcess.length > 0) {
            imagesToProcess.forEach(img => {
                // strip prefix if present
                const b64 = img.split(',')[1] || img;
                parts.push({
                    inlineData: {
                        mimeType: "image/png",
                        data: b64
                    }
                });
            });
            parts.push({ text: `Use the above ${imagesToProcess.length} image(s) as the main reference/foundation for the product/subject.` });
        }
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts },
            config: {
                imageConfig: { aspectRatio: aspectRatio as any } 
            }
        });

        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData?.data) {
                    return `data:image/png;base64,${part.inlineData.data}`;
                }
            }
        }
        return null;
    } catch (e) {
        console.error("Image gen failed", e);
        return null;
    }
};

export const generateSearchAds = async (productContext: string, location: string, lang: Language, mode: GenerationMode, customDirection?: string): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            adGroups: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        intent: { type: Type.STRING },
                        keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
                        ads: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    descriptions: { type: Type.ARRAY, items: { type: Type.STRING } },
                                    path1: { type: Type.STRING },
                                    path2: { type: Type.STRING },
                                    keywords: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["headlines", "descriptions", "path1", "path2", "keywords"]
                            }
                        },
                        assets: {
                            type: Type.OBJECT,
                            properties: {
                                sitelinks: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, desc1: { type: Type.STRING }, desc2: { type: Type.STRING } }, required: ["title", "desc1", "desc2"] } },
                                callouts: { type: Type.ARRAY, items: { type: Type.STRING } },
                                structuredSnippets: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { header: { type: Type.STRING }, values: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["header", "values"] } }
                            },
                            required: ["sitelinks", "callouts", "structuredSnippets"]
                        }
                    },
                    required: ["intent", "keywords", "ads", "assets"]
                }
            }
        },
        required: ["adGroups"]
    };

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: buildSearchAdsPrompt(productContext, location, lang, customDirection),
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) { return null; }
};

export const generateEmailCampaign = async (context: string, location: string, industry: string, category: string, style: EmailStyle, lang: Language, mode: GenerationMode): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            category: { type: Type.STRING },
            emails: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        subject: { type: Type.STRING },
                        body: { type: Type.STRING },
                        primaryAction: { type: Type.STRING }
                    },
                    required: ["subject", "body", "primaryAction"]
                }
            }
        },
        required: ["category", "emails"]
    };

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: buildEmailCampaignPrompt(context, location, category, style, lang),
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) { return null; }
};

export const generateStoryboard = async (context: string, location: string, lang: Language, mode: GenerationMode): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING },
            narrativeSummary: { type: Type.STRING },
            scenes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        number: { type: Type.NUMBER },
                        timing: { type: Type.STRING },
                        energyTag: { type: Type.STRING, enum: ["Hook", "Pain", "Logic", "Proof", "CTA"] },
                        shotDetails: { type: Type.STRING },
                        onScreenText: { type: Type.STRING },
                        voiceover: { type: Type.STRING },
                        editNotes: { type: Type.STRING },
                        imagePrompt: { type: Type.STRING }
                    },
                    required: ["number", "timing", "energyTag", "shotDetails", "onScreenText", "voiceover", "editNotes", "imagePrompt"]
                }
            },
            retentionChecklist: {
                type: Type.OBJECT,
                properties: {
                    hookUnder2s: { type: Type.BOOLEAN },
                    interruptsEvery3s: { type: Type.BOOLEAN },
                    proofShown: { type: Type.BOOLEAN },
                    loopEnding: { type: Type.BOOLEAN }
                },
                required: ["hookUnder2s", "interruptsEvery3s", "proofShown", "loopEnding"]
            }
        },
        required: ["title", "narrativeSummary", "scenes", "retentionChecklist"]
    };

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: buildStoryboardPrompt(context, location, lang),
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) { return null; }
};

export const refreshStoryboardScene = async (context: string, scene: any, location: string, lang: Language, mode: GenerationMode): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            number: { type: Type.NUMBER },
            timing: { type: Type.STRING },
            energyTag: { type: Type.STRING, enum: ["Hook", "Pain", "Logic", "Proof", "CTA"] },
            shotDetails: { type: Type.STRING },
            onScreenText: { type: Type.STRING },
            voiceover: { type: Type.STRING },
            editNotes: { type: Type.STRING },
            imagePrompt: { type: Type.STRING }
        },
        required: ["number", "timing", "energyTag", "shotDetails", "onScreenText", "voiceover", "editNotes", "imagePrompt"]
    };

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: buildSceneRefreshPrompt(context, scene, lang),
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) { return null; }
};

export const fetchIndustryNewsStream = async (industry: string, location: string, lang: Language, productContext: string, buyerContext: string, onChunk: (news: IndustryNews[]) => void, existingHeadlines?: string[]): Promise<void> => {
    const ai = getAI();
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                source: { type: Type.STRING },
                date: { type: Type.STRING },
                snippet: { type: Type.STRING },
                url: { type: Type.STRING }
            },
            required: ["id", "title", "source", "date", "snippet", "url"]
        }
    };

    try {
        const streamResponse = await ai.models.generateContentStream({
            model: 'gemini-3-pro-preview', // Force Pro for better search
            contents: buildNewsStreamPrompt(industry, location, productContext, buyerContext, lang, existingHeadlines),
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                tools: [{googleSearch: {}}]
            }
        });

        let fullText = "";
        for await (const chunk of streamResponse) {
            fullText += chunk.text;
            const objects = extractJsonArrayObjects(fullText);
            if (objects.length > 0) {
                const newsItems = objects.map((obj: any, i: number) => ({
                    ...obj,
                    id: obj.id || `news-${Date.now()}-${i}`
                }));
                onChunk(newsItems);
            }
        }
    } catch (e) { console.error("News stream failed", e); }
};

export const generateLinkedInPost = async (context: string, buyerContext: string, newsItem: any | null, lang: Language, mode: GenerationMode, style: string): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            hook: { type: Type.STRING },
            content: { type: Type.STRING },
            category: { type: Type.STRING }
        },
        required: ["hook", "content", "category"]
    };

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: buildLinkedInPrompt(context, buyerContext, newsItem, style, lang),
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) { return null; }
};

export const generateSalesPage = async (context: string, lang: Language, mode: GenerationMode, aesthetic?: string): Promise<any> => {
    // Legacy/Stub implementation for compilation compatibility.
    // The main app uses generateLandingPageCopy from salesPageCopyService.ts
    return null;
};

export const generatePhoneScripts = async (context: string, location: string, direction: string, lang: Language, mode: GenerationMode): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            scripts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        opening: { type: Type.STRING },
                        reason: { type: Type.STRING },
                        observation: { type: Type.STRING },
                        valueProp: { type: Type.STRING },
                        question: { type: Type.STRING },
                        exit: { type: Type.STRING }
                    },
                    required: ["opening", "reason", "observation", "valueProp", "question", "exit"]
                }
            }
        },
        required: ["scripts"]
    };

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: buildPhoneScriptPrompt(context, location, direction, lang),
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) { return null; }
};
