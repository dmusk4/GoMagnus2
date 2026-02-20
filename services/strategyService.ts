
import { Type } from "@google/genai";
import { Language, GenerationMode } from "../types";
import { getAI, getModel, extractJSON, sanitizeContext, getLangName } from "./aiCore";
import { VALID_INDUSTRIES } from "./leadService";

export const generateBigIdea = async (productContext: string, buyerContext: string, location: string, lang: Language, mode: GenerationMode): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            uniqueMechanism: { type: Type.STRING },
            uniqueMechanismDescription: { type: Type.STRING },
            emotionalDriver: { type: Type.STRING },
            tagline: { type: Type.STRING },
            viralStrategy: { type: Type.STRING },
        },
        required: ["uniqueMechanism", "uniqueMechanismDescription", "emotionalDriver", "tagline", "viralStrategy"],
    };
    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `Generate Big Idea for: ${sanitizeContext(productContext)}. Location: ${location}. Buyer: ${sanitizeContext(buyerContext)}.\n\nSTRICT REQUIREMENT: Answer strictly in ${getLangName(lang)}.`,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema,
                systemInstruction: `You are a senior direct-response strategist. Your goal is to create offers that feel stupid to say no to. Adapt values and currencies. Respond only in ${getLangName(lang)}.`
            }
        });
        return extractJSON(response.text);
    } catch (e) { throw e; }
}

export const generateUniqueOffer = async (productContext: string, buyerContext: string, bigIdeaContext: string, location: string, lang: Language, mode: GenerationMode): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            headline: { type: Type.STRING },
            corePromise: { type: Type.STRING },
            timeframe: { type: Type.STRING },
            bonuses: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, value: { type: Type.STRING }, description: { type: Type.STRING } },
                    required: ["title", "value", "description"]
                }
            },
            riskReversal: { type: Type.STRING },
            scarcity: { type: Type.STRING },
            priceAnchor: { type: Type.STRING }
        },
        required: ["headline", "corePromise", "timeframe", "bonuses", "riskReversal", "scarcity", "priceAnchor"]
    };
    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `Create a Unique Offer for: ${sanitizeContext(productContext)}. Location: ${location}. Big Idea: ${sanitizeContext(bigIdeaContext)}. Buyer: ${sanitizeContext(buyerContext)}.\n\nSTRICT REQUIREMENT: Use official currency of ${location}. Answer strictly in ${getLangName(lang)}.`,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema,
                systemInstruction: `You are a senior direct-response strategist. Your goal is to create offers that feel stupid to say no to. Adapt values and currencies. Respond only in ${getLangName(lang)}.`
            }
        });
        return extractJSON(response.text);
    } catch (e) { throw e; }
}

export const generateCampaignPlan = async (fullContext: string, location: string, industry: string, lang: Language, mode: GenerationMode): Promise<any> => {
    const ai = getAI();
    
    // Import industries strictly from service
    const validIndustriesString = VALID_INDUSTRIES.join(', ');
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            direction: { 
                type: Type.STRING,
                description: "A short, concise creative angle (e.g., 'Product-Hero', 'Before/After', 'Direct-Response'). MAX 2-3 WORDS."
            },
            goal: { type: Type.STRING },
            coreMessage: { type: Type.STRING },
            marketNuance: { type: Type.STRING },
            viralInitiative: { 
                type: Type.STRING,
                description: "A high-potential viral spark idea specifically for social media (Reels/TikTok/Shorts) related to this launch sequence."
            },
            channelSetup: {
                type: Type.OBJECT,
                properties: {
                    platform: { type: Type.STRING },
                    budgetRange: { type: Type.STRING },
                    testDuration: { type: Type.STRING },
                    whyThisPlatform: { type: Type.STRING }
                },
                required: ["platform", "budgetRange", "testDuration", "whyThisPlatform"]
            },
            launchSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
            quickWins: {
                type: Type.OBJECT,
                properties: {
                    tactics: { type: Type.ARRAY, items: { type: Type.STRING } },
                    partnerships: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["tactics", "partnerships"]
            },
            firstSignals: {
                type: Type.OBJECT,
                properties: {
                    goodSigns: { type: Type.ARRAY, items: { type: Type.STRING } },
                    redFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["goodSigns", "redFlags"]
            },
            keywords: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        term: { type: Type.STRING },
                        volume: { type: Type.STRING, description: "Monthly search volume estimate, e.g. '12.5k'" },
                        cpc: { type: Type.STRING, description: "Average cost per click with currency symbol" },
                        relevance: { type: Type.STRING, description: "High, Medium, or Low" }
                    },
                    required: ["term", "volume", "cpc", "relevance"]
                }
            },
            plgStrategy: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        stage: { type: Type.STRING },
                        goal: { type: Type.STRING },
                        actions: { type: Type.ARRAY, items: { type: Type.STRING } },
                        impactScore: { type: Type.NUMBER },
                        effortScore: { type: Type.NUMBER }
                    },
                    required: ["stage", "goal", "actions", "impactScore", "effortScore"]
                },
                description: "5 Sequential Stages: Attract Attention, Activate Users, Convert to Paid, Drive Recurring Usage, Create Advocates."
            },
            nextMove: { type: Type.STRING },
            creativeRecommendations: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        type: { type: Type.STRING },
                        count: { type: Type.STRING },
                        priority: { type: Type.STRING },
                        reason: { type: Type.STRING }
                    },
                    required: ["type", "count", "priority", "reason"]
                }
            },
            b2bSuggestions: {
                type: Type.OBJECT,
                properties: {
                    industries: { type: Type.ARRAY, items: { type: Type.STRING } },
                    seniorityLevels: { type: Type.ARRAY, items: { type: Type.STRING } },
                    jobTitles: { type: Type.ARRAY, items: { type: Type.STRING } }
                },
                required: ["industries", "seniorityLevels", "jobTitles"]
            },
            b2bTriggers: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        date: { type: Type.STRING },
                        type: { type: Type.STRING },
                        description: { type: Type.STRING }
                    },
                    required: ["name", "date", "type", "description"]
                }
            }
        },
        required: ["direction", "goal", "coreMessage", "marketNuance", "viralInitiative", "channelSetup", "launchSteps", "quickWins", "firstSignals", "nextMove", "creativeRecommendations", "b2bSuggestions", "keywords", "plgStrategy"]
    };
    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `You are a Chief Strategy Officer who has launched 20+ products across B2B and B2C markets.
            Create an actionable Campaign Action Plan specifically grounded for the market in ${location} and industry ${industry}.
            
            CONTEXT:
            ${sanitizeContext(fullContext)}
            
            CRITICAL GUIDELINES FOR REALISM:
            1. LOCAL MARKET NUANCE: Consider local advertising costs, cultural buying behavior, and platform dominance in ${location}.
            2. INDUSTRY REALISM: Don't suggest generic tactics.
            3. SEARCH ENGINE INTEL: Generate 6-8 high-potential keywords. For each, provide a realistic estimated monthly search volume and CPC based on ${location} market data. Use local currency symbol.
            4. VIRAL INITIATIVE: Propose one specific, highly shareable creative tactic.
            5. QUICK WINS & PARTNERSHIPS:
               - Quick wins: 3 to 5 tactics that can generate traction within the first 14 days. Be specific.
               - Partnership opportunities: 5 strategic partners types (e.g. specific influencer niches, complementary software, local communities) that could accelerate growth.
            6. B2B LEAD FINDER:
               - Industries: Select exactly 3 industries. YOU MUST STRICTLY CHOOSE FROM THIS LIST: [${validIndustriesString}]. Do not invent new industries.
               - Seniority Levels: Provide seniority levels (e.g., 'C-Level', 'VP', 'Head of').
               - Job Titles: Provide specific titles. CRITICAL: For every identified role, output it TWICE in the list: once in ${getLangName(lang)} and once in English. They must be separate strings. Example: ["Diretor Comercial", "Sales Director"].
            7. B2B INTELLIGENCE: If the target audience is B2B, identify 3-4 REAL upcoming industry events, trade fairs, or conferences in or relevant to ${location} for this niche. Also list specific business triggers (e.g. fiscal year end, regulatory changes). If B2C, leave 'b2bTriggers' empty.
            8. PRODUCT-LED GROWTH (PLG) ACTIONS:
               - Generate exactly 5 blocks in this sequence: Attention, Users, Buyers, Recurrence, Advocacy.
               - For each block, provide a short specific Goal and 4-5 CONCRETE actions (not generic advice) that help the product sell itself.
               - Avoid generic advice or vague growth tips.
               - Every action must be:
                 * Specific enough to implement immediately
                 * Clearly tied to a measurable outcome (traffic, activation, conversion, retention or referrals)
                 * Feasible for an early-stage SaaS team
                 * Written as concrete steps, not theory
               - Balance practicality with creative tactics that can produce real attention and momentum.
               - Tone: confident, precise, no hype, no buzzwords, no generic “best practices”.
               - Output actions that feel like advice from an experienced growth operator who has actually shipped products — not a textbook.
               - Assign realistic Impact Score (1-10) and Effort Score (1-10) for data purposes.
            
            Output strictly in ${getLangName(lang)}.`,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema,
                systemInstruction: `You are an experienced senior growth strategist. Goal: clear, practical, LOCALIZED plan. Strictly use ${getLangName(lang)}.`
            }
        });
        return extractJSON(response.text);
    } catch (e) { throw e; }
}

export const generateLaunchBlueprint = async (fullContext: string, lang: Language, mode: GenerationMode): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            productSummary: { type: Type.STRING }, // Serves as the Overview
            currentState: { type: Type.STRING },
            priorityInitiatives: { type: Type.ARRAY, items: { type: Type.STRING } },
            resourceRequirements: { type: Type.STRING },
            decisionFramework: { type: Type.STRING },
            oneHourBrief: { type: Type.STRING },
            buyerSummary: { type: Type.STRING },
            marketSummary: { type: Type.STRING },
            offerSummary: { type: Type.STRING },
            planSummary: { type: Type.STRING },
            creativeSummary: { type: Type.STRING },
            salesSummary: { type: Type.STRING },
            bottomLine: { type: Type.STRING },
        },
        required: ["productSummary", "currentState", "priorityInitiatives", "resourceRequirements", "decisionFramework", "oneHourBrief", "buyerSummary", "marketSummary", "offerSummary", "planSummary", "creativeSummary", "salesSummary", "bottomLine"]
    };
    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `You are the senior partner at McKinsey & Company presenting to a CEO. I need you to synthesize everything about business into one strategic recommendation.

            Please provide:

            1. Executive summary ('productSummary'): 3-paragraph strategic overview a CEO can read in 2 minutes.
            2. Current state assessment ('currentState'): Where the business stands today (be brutally honest).
            3. Priority initiatives ('priorityInitiatives'): The 5 highest-impact actions to take in the next 90 days, ranked.
            4. Resource requirements ('resourceRequirements'): People, money, and tools needed.
            5. Decision framework ('decisionFramework'): A simple matrix/heuristic for making the next 10 strategic decisions.
            6. "If I only had 1 hour" brief ('oneHourBrief'): The single most important insight and action.

            IMPORTANT DATA INCLUSION:
            - Ensure 'buyerSummary' includes insights about Media Consumption if available in the context.
            - Ensure 'marketSummary' includes insights about Competitor Strategic Moves if available in the context.

            STRICT REQUIREMENT: Answer exactly in ${getLangName(lang)}.

            CONTEXT OF ALL DATA:
            ${sanitizeContext(fullContext)}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                systemInstruction: `You are an elite business architect. Provide a final campaign synthesis. Be precise, strategic, and authoritative. Strictly use ${getLangName(lang)}.`
            }
        });
        return extractJSON(response.text);
    } catch (e) { throw e; }
};
