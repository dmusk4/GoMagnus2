import { Type } from "@google/genai";
import { Language, GenerationMode, EmailStyle, IndustryNews, SoftwareRecommendation } from "../types";
import { getAI, getModel, extractJSON, extractJsonArrayObjects, imageUrlToBase64 } from "./aiCore";
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
  buildPhoneScriptPrompt,
  buildSoftwareRecommendationsPrompt
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

const cropImageCenter = (base64: string, targetAspectRatio: number): Promise<string> => {
    return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(base64);

            let sourceWidth = img.width;
            let sourceHeight = img.height;
            let targetWidth = sourceWidth;
            let targetHeight = sourceHeight;

            const currentRatio = sourceWidth / sourceHeight;
            
            if (currentRatio > targetAspectRatio) {
                // Image is wider than target, crop width
                targetWidth = sourceHeight * targetAspectRatio;
            } else {
                // Image is taller than target, crop height
                targetHeight = sourceWidth / targetAspectRatio;
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;

            const startX = (sourceWidth - targetWidth) / 2;
            const startY = (sourceHeight - targetHeight) / 2;

            ctx.drawImage(img, startX, startY, targetWidth, targetHeight, 0, 0, targetWidth, targetHeight);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(base64);
        img.src = base64;
    });
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
        // Handle single string or array of strings
        const rawImages = Array.isArray(baseImages) 
            ? baseImages 
            : (baseImages ? [baseImages] : []);

        const validBase64Images: string[] = [];
        for (const img of rawImages) {
            if (!img) continue;
            if (img.startsWith('data:')) {
                validBase64Images.push(img);
            } else if (img.startsWith('http://') || img.startsWith('https://')) {
                const converted = await imageUrlToBase64(img);
                if (converted) validBase64Images.push(converted);
            } else {
                validBase64Images.push(img);
            }
        }

        const finalPrompt = buildCreativeImagePrompt(prompt, style, composition, brandKit, lang, validBase64Images.length > 0);

        const parts: any[] = [{ text: finalPrompt }];
        
        if (validBase64Images.length > 0) {
            validBase64Images.forEach(img => {
                // strip prefix if present
                const b64 = img.split(',')[1] || img;
                parts.push({
                    inlineData: {
                        mimeType: "image/png",
                        data: b64
                    }
                });
            });
            parts.push({ text: `Use the above ${validBase64Images.length} image(s) as the primary base/reference to modify and transform according to the exact instructions and visual alterations.` });
        }
        
        const imageModels = ['gemini-3.1-flash-image', 'gemini-2.5-flash-image'];
        
        for (const model of imageModels) {
            try {
                // Map "4:5" or "4x5" to "3:4" as it is the closest officially supported portrait aspect ratio in Gemini Image models
                let finalRatio = aspectRatio;
                if (finalRatio === "4:5" || finalRatio === "4x5") {
                    finalRatio = "3:4";
                }

                const response = await ai.models.generateContent({
                    model: model,
                    contents: { parts },
                    config: {
                        imageConfig: { aspectRatio: finalRatio as any } 
                    }
                });

                if (response.candidates?.[0]?.content?.parts) {
                    for (const part of response.candidates[0].content.parts) {
                        if (part.inlineData?.data) {
                            let resultBase64 = `data:image/png;base64,${part.inlineData.data}`;
                            if (aspectRatio === "4:5" || aspectRatio === "4x5") {
                                resultBase64 = await cropImageCenter(resultBase64, 4/5);
                            }
                            return resultBase64;
                        }
                    }
                }
            } catch (err: any) {
                console.warn(`Creative Image Generation with model ${model} failed, trying next...`, err.message || err);
            }
        }
        return null;
    } catch (e) {
        console.error("Image gen failed entirely", e);
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
            viralMusicTrack: { type: Type.STRING },
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
            model: 'gemini-3.1-pro-preview', // Force Pro for better search
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

export const generateSoftwareRecommendations = async (
    productContext: string,
    campaignContext: string,
    location: string,
    lang: Language,
    mode: GenerationMode,
    customDirection?: string
): Promise<{ tools: SoftwareRecommendation[] } | null> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            tools: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        category: { type: Type.STRING },
                        overview: { type: Type.STRING },
                        objective: { type: Type.STRING },
                        ultimateOutcome: { type: Type.STRING },
                        why: { type: Type.STRING },
                        aiAgent: { type: Type.STRING },
                        subAgents: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    role: { type: Type.STRING },
                                    skills: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["name", "role", "skills"]
                            }
                        },
                        initialPrompt: { type: Type.STRING },
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["name", "category", "overview", "objective", "ultimateOutcome", "why", "aiAgent", "initialPrompt", "tasks"]
                }
            }
        },
        required: ["tools"]
    };

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: buildSoftwareRecommendationsPrompt(productContext, campaignContext, location, lang, customDirection),
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) {
        console.error("Failed generating software recommendations", e);
        return null;
    }
};

export const generateSingleSoftwareRecommendation = async (
    productContext: string,
    campaignContext: string,
    location: string,
    lang: Language,
    mode: GenerationMode,
    toolToReplace: any,
    customDirection?: string
): Promise<SoftwareRecommendation | null> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            overview: { type: Type.STRING },
            objective: { type: Type.STRING },
            ultimateOutcome: { type: Type.STRING },
            why: { type: Type.STRING },
            aiAgent: { type: Type.STRING },
            subAgents: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        role: { type: Type.STRING },
                        skills: { type: Type.ARRAY, items: { type: Type.STRING } }
                    },
                    required: ["name", "role", "skills"]
                }
            },
            initialPrompt: { type: Type.STRING },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["name", "category", "overview", "objective", "ultimateOutcome", "why", "aiAgent", "initialPrompt", "tasks"]
    };

    try {
        const prompt = buildSoftwareRecommendationsPrompt(productContext, campaignContext, location, lang, customDirection);
        const systemPrompt = `You are an expert digital tool consultant. Please generate exactly ONE alternative, high-value web tool, software platform, or browser extension recommendation to REPLACE this existing suggestion: 
        - Existing Tool Name: ${toolToReplace?.name}
        - Existing Category: ${toolToReplace?.category}
        - Existing Objective: ${toolToReplace?.objective}
        
        The replacement must be completely distinct, offering alternative value to solve the user's workflow puzzles or support their final-customer experience better. Make it highly personalized, comprehensive, with clear setup guidelines and 4-6 task lists.`;

        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `${prompt}\n\nREPLACEMENT TARGET:\n${systemPrompt}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return extractJSON(response.text) as SoftwareRecommendation;
    } catch (e) {
        console.error("Failed generating single software recommendation", e);
        return null;
    }
};

export const regenerateSinglePrompt = async (
    fullContext: string,
    currentPrompt: string,
    language: Language,
    mode: GenerationMode
): Promise<string | null> => {
    const ai = getAI();
    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `You are an elite AI Architect and Senior Systems Prompt Engineer.
            Your task is to take an existing AI system/orchestration prompt and completely rewrite and expand it to be FAR MORE descriptive, comprehensive, and highly-optimized.
            
            PRODUCT/CAMPAIGN CONTEXT:
            ${fullContext}
            
            CURRENT PROMPT TO ENHANCE:
            """
            ${currentPrompt}
            """
            
            CRITICAL GUIDELINES:
            1. Keep the same core intent and goal of the original prompt, but make it extremely detailed, tactical, and robust.
            2. Add explicit step-by-step guidance, input specifications, expected output formats, constraints (no placeholders, etc.), and quality benchmarks.
            3. Optimize the prompt phrasing so it is highly descriptive and produces maximum performance when executed by an LLM or sub-agents.
            4. Respond in Portuguese (Portugal) if language is 'pt', Spanish (Castellano) if 'es', or English (US) otherwise.
            5. Provide ONLY the final rewritten, enhanced prompt as plain text. Do not wrap it in JSON, markdown code blocks, or include any preamble/meta-commentary. Return ONLY the enhanced prompt.`,
        });
        return response.text ? response.text.trim() : null;
    } catch (e) {
        console.error("Failed to regenerate single prompt", e);
        return null;
    }
};


