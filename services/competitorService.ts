
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

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `You are a specialized Market Research Analyst. Perform a Google Search to find DIRECT COMPETITORS for the product defined below.

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

            Output strictly in ${getLangName(lang)}.`,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema, 
                tools: [{googleSearch: {}}]
            }
        });
        return extractJSON(response.text);
    } catch (e) { return { competitors: [] }; }
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
