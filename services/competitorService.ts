
import { GoogleGenAI, Type } from "@google/genai";
import { Language, GenerationMode } from "../types";
import { getModel } from "./aiCore";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const getLangName = (lang: Language) => {
    if (lang === 'pt') return 'Português (Portugal)';
    if (lang === 'es') return 'Español (Castellano)';
    return 'English (US)';
};

const extractJSON = (text: string | undefined | null): any => {
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
    return null;
};

export const generateCompetitorAnalysis = async (
    name: string, 
    description: string, 
    productType: string,
    location: string, 
    lang: Language, 
    mode: GenerationMode, 
    offset: number = 0
): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            competitors: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        url: { type: Type.STRING },
                        strength: { type: Type.STRING },
                        weakness: { type: Type.STRING },
                        pricePoint: { type: Type.STRING },
                        rating: { type: Type.NUMBER },
                        reviewCount: { type: Type.STRING },
                        socialLinks: { type: Type.ARRAY, items: { type: Type.STRING } },
                        strategicMoves: { type: Type.ARRAY, items: { type: Type.STRING } },
                        reviewInsights: {
                            type: Type.OBJECT,
                            properties: { whatTheyLove: { type: Type.ARRAY, items: { type: Type.STRING } }, commonComplaints: { type: Type.ARRAY, items: { type: Type.STRING } } },
                            required: ["whatTheyLove", "commonComplaints"]
                        }
                    },
                    required: ["name", "url", "strength", "weakness", "pricePoint", "socialLinks", "strategicMoves"]
                }
            }
        },
        required: ["competitors"]
    };

    // Construct a strict context block that forces the AI to acknowledge the specific niche
    const strictContext = `
    TARGET PRODUCT IDENTITY:
    Name: "${name}"
    Category/Type: ${productType}
    Core Function/Description: ${description}
    Target Market Location: ${location}
    `;

    const contents = `You are a specialized Market Research Analyst. Identify DIRECT COMPETITORS for the product defined below.

    ${strictContext}

    CRITICAL NICHE ENFORCEMENT RULES:
    1. READ the "Core Function/Description" above carefully. The competitors MUST solve the SAME problem or sell the SAME type of product.
    2. IF the product is a "Service" (e.g. Agency), do NOT return "Software" (SaaS) competitors unless they are direct substitutes.
    3. IF the product is "Physical" (e.g. Shoes), do NOT return "Repair Shops" or "Blogs".
    4. IGNORE the product URL if it conflicts with the Description. The Description is the Source of Truth.
    
    VERIFICATION TASKS:
    1. Find 3-4 REAL active companies in ${location}.
    2. DOUBLE CHECK: Does this competitor actually do what the target product does? If no, discard it.
    3. Find their official URL and at least one social link.
    4. Look for real pricing and reviews.
    5. Find recent strategic moves (acquisitions, new features, pivots) for each competitor (only if they exist).

    Output strictly in ${getLangName(lang)}.`;

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
        console.warn("generateCompetitorAnalysis failed with search tool, retrying without search tool...", e);
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
        return extractJSON(response.text) || { competitors: [] };
    } catch (e) {
        console.error("generateCompetitorAnalysis fallback failed:", e);
        return { competitors: [] };
    }
}

export const generatePricingSuggestions = async (
    name: string, 
    description: string, 
    productType: string,
    location: string, 
    competitors: any[], 
    lang: Language, 
    mode: GenerationMode
): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            sameForLess: { type: Type.OBJECT, properties: { price: { type: Type.STRING }, logic: { type: Type.STRING } }, required: ["price", "logic"] },
            moreForSame: { type: Type.OBJECT, properties: { price: { type: Type.STRING }, logic: { type: Type.STRING }, valueAdd: { type: Type.ARRAY, items: { type: Type.STRING } } }, required: ["price", "logic", "valueAdd"] },
            monetization: {
                type: Type.OBJECT,
                properties: {
                    discountStrategy: {
                        type: Type.OBJECT,
                        properties: {
                            when: { type: Type.STRING },
                            amount: { type: Type.STRING },
                            audience: { type: Type.STRING }
                        },
                        required: ["when", "amount", "audience"]
                    },
                    opportunities: {
                        type: Type.OBJECT,
                        properties: {
                            upsells: { type: Type.ARRAY, items: { type: Type.STRING } },
                            crossSells: { type: Type.ARRAY, items: { type: Type.STRING } },
                            usageBased: { type: Type.STRING }
                        },
                        required: ["upsells", "crossSells", "usageBased"]
                    }
                },
                required: ["discountStrategy", "opportunities"]
            }
        },
        required: ["sameForLess", "moreForSame", "monetization"]
    };

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `Act as a Pricing Strategist and Monetization Architect.
            
            PRODUCT CONTEXT:
            Name: ${name}
            Type: ${productType}
            Description: ${description}
            Market: ${location}

            COMPETITIVE LANDSCAPE:
            ${JSON.stringify(competitors)}

            TASK:
            1. Propose 2 realistic base pricing strategies (Same for Less vs More for Same).
            2. Design a **Discount Strategy**: Determine the smartest moment to offer a discount, the specific amount/percentage, and the exact audience segment. Do not be generic; be strategic.
            3. Identify **Monetization Opportunities**:
               - Upsells: High-margin additions.
               - Cross-sells: Complementary products.
               - Usage-Based: How to charge for frequency or scale (if applicable, otherwise define a retention lever).
            
            RULES:
            1. Prices must be in the local currency of ${location}.
            2. Logic must reference specific competitor price points found in the landscape.
            3. Ensure the pricing makes sense for a product of type "${productType}".
            
            Answer strictly in ${getLangName(lang)}.`,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) { return null; }
}

export const generateMetaAdsLibraryAnalysis = async (
    productName: string,
    productDescription: string,
    keywords: string,
    location: string,
    competitors: string[],
    lang: Language,
    mode: GenerationMode
): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            overallLandscapeSummary: { type: Type.STRING },
            dominantFormats: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        format: { type: Type.STRING },
                        percentage: { type: Type.NUMBER },
                        rationale: { type: Type.STRING }
                    },
                    required: ["format", "percentage", "rationale"]
                }
            },
            topAnalyzedAds: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        competitorName: { type: Type.STRING },
                        adHeadline: { type: Type.STRING },
                        format: { type: Type.STRING },
                        hookType: { type: Type.STRING },
                        visualHookDescription: { type: Type.STRING },
                        copyAngle: { type: Type.STRING },
                        ctaText: { type: Type.STRING },
                        scores: {
                            type: Type.OBJECT,
                            properties: {
                                hookScore: { type: Type.NUMBER },
                                copyPersuasionScore: { type: Type.NUMBER },
                                visualImpactScore: { type: Type.NUMBER },
                                offerClarityScore: { type: Type.NUMBER },
                                overallScore: { type: Type.NUMBER }
                            },
                            required: ["hookScore", "copyPersuasionScore", "visualImpactScore", "offerClarityScore", "overallScore"]
                        },
                        strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                        weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
                        whyItWorks: { type: Type.STRING }
                    },
                    required: ["id", "competitorName", "adHeadline", "format", "hookType", "visualHookDescription", "copyAngle", "ctaText", "scores", "strengths", "weaknesses", "whyItWorks"]
                }
            },
            winningPatterns: {
                type: Type.OBJECT,
                properties: {
                    bestVisualHooks: { type: Type.ARRAY, items: { type: Type.STRING } },
                    winningCopyAngles: { type: Type.ARRAY, items: { type: Type.STRING } },
                    topCallToActions: { type: Type.ARRAY, items: { type: Type.STRING } },
                    commonOffersAndPricing: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["bestVisualHooks", "winningCopyAngles", "topCallToActions", "commonOffersAndPricing"]
            },
            strategicRecommendations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        impact: { type: Type.STRING },
                        actionableHookToTry: { type: Type.STRING }
                    },
                    required: ["title", "description", "impact", "actionableHookToTry"]
                }
            }
        },
        required: ["overallLandscapeSummary", "dominantFormats", "topAnalyzedAds", "winningPatterns", "strategicRecommendations"]
    };

    const prompt = `Act as a senior Performance Marketing Specialist and Meta Ads Intelligence Director.
    
    PRODUCT TO OUTPERFORM:
    - Name: "${productName}"
    - Core Offer/Value: "${productDescription}"
    - Target Location: "${location}"
    
    META ADS LIBRARY SEARCH PARAMETERS:
    - Specific Keywords: "${keywords || productName}"
    - Target Competitors: ${competitors.length ? competitors.join(", ") : "Main direct competitors in " + location}
    
    TASK:
    Conduct a comprehensive Meta Ads Library benchmark & competitor ads teardown for this niche in ${location}.
    
    1. Overall Landscape Summary: Concise analysis of active advertising activity on Meta (Facebook/Instagram/Audience Network).
    2. Dominant Formats: Percentage breakdown (e.g., Video/Reels, Carousel, Static Image, UGC/Story) with rationale on why these formats dominate in this niche.
    3. Top Analyzed Ads (3-5 ad teardowns): For each competitor/ad pattern found in Meta Ads Library:
       - Give realistic ad headline, format, hook type, visual hook description, copy angle, CTA text.
       - Provide detailed Scoring out of 100 for: Hook Score, Copy Persuasion Score, Visual Impact Score, Offer Clarity Score, and Overall Score.
       - Highlight key Strengths, Weaknesses, and Why It Works.
    4. "O que Funciona" (Winning Patterns):
       - Best Visual Hooks: 3-4 specific visual opening ideas that capture attention.
       - Winning Copy Angles: 3-4 persuasive copy formulas working right now.
       - Top Call To Actions: 3 CTAs that drive conversion.
       - Common Offers & Pricing tactics seen in active Meta Ads.
    5. Strategic Recommendations: 3 actionable recommendations with high impact for "${productName}", including an "actionableHookToTry" that can be turned directly into a Meta Ad Creative.
    
    Answer strictly in ${getLangName(lang)}.`;

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                tools: [{ googleSearch: {} }]
            }
        });
        const parsed = extractJSON(response.text);
        if (parsed) return parsed;
    } catch (e) {
        console.warn("generateMetaAdsLibraryAnalysis with search tool failed, retrying without search tool:", e);
    }

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        return extractJSON(response.text);
    } catch (e) {
        console.error("generateMetaAdsLibraryAnalysis failed:", e);
        return null;
    }
};
