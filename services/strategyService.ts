
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
            paretoFocus: {
                 type: Type.OBJECT,
                 properties: {
                     the20Percent: { type: Type.STRING },
                     the80PercentOutcome: { type: Type.STRING },
                     innovationStrategy: { type: Type.STRING },
                     focusAction: { type: Type.STRING }
                 },
                 required: ["the20Percent", "the80PercentOutcome", "innovationStrategy", "focusAction"],
                 description: "Pareto Principle (80/20 rule) applied to the product strategy."
            },
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
            priceAnchor: { type: Type.STRING },
            moat: {
                type: Type.OBJECT,
                properties: {
                    coreAdvantage: { type: Type.STRING, description: "Your core defensive advantage (MOAT) - the compounding, sustainable structural barrier that protects market share, pricing power, and profits long-term (e.g., network effects, high switching costs, or massive scale advantage)." },
                    whyDefensible: { type: Type.STRING, description: "Defensibility of the Moat: The deep, structural reasons why competitors cannot replicate or copy this defensive barrier in under 6 months." },
                    whereUnbeatable: { type: Type.STRING, description: "Unbeatable Domain: The precise targeted customer segment or hyper-niche market position where this strategic advantage is absolutely undefeated." },
                    gapExploited: { type: Type.STRING, description: "The Gap Exploited: The exact operational, pricing, or product gap left by standard competitors that we uniquely conquer." },
                    rightToWin: { type: Type.STRING, description: "Right to Win (Offense): The offensive strategy explaining the distinct reason why a customer chooses us over alternatives right now. Focuses on market penetration, execution speed, unique UI, proprietary algorithm, or niche support, and shows how we reinvest this traction to build the Moat over time." }
                },
                required: ["coreAdvantage", "whyDefensible", "whereUnbeatable", "gapExploited", "rightToWin"],
                description: "Estratégia MOAT e Right to Win - Strategic competitive analysis of offensive (Right to Win) and defensive (Moat) forces."
            }
        },
        required: ["paretoFocus", "headline", "corePromise", "timeframe", "bonuses", "riskReversal", "scarcity", "priceAnchor", "moat"]
    };
    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `Create a Unique Offer for: ${sanitizeContext(productContext)}. Location: ${location}. Big Idea: ${sanitizeContext(bigIdeaContext)}. Buyer: ${sanitizeContext(buyerContext)}.
 
STRICT REQUIREMENTS:
1. Use official currency of ${location}.
2. Answer strictly in ${getLangName(lang)}.
3. PARETO 80/20 RULE: At the very beginning of the offer generation, analyze the product context and apply the Pareto Principle (80/20 rule). Identify the 20% of focus/effort/features that will generate 80% of the maximum possible outcome. Tell the marketer exactly where to focus and innovate for maximum leverage. Focus is key.
4. ESTRUTURA DE MOAT E RIGHT TO WIN (OFFENSE vs. DEFENSE): Act as an elite competitive business strategist. Analyze the business context deeply to formulate a highly defensible, realistic defensive Moat and a concrete offensive Right to Win, based strictly on these frameworks:
   - RIGHT TO WIN (Offense): This is our offensive strategy—the specific, unreplicable advantage that allows us to acquire customers and beat competitors today.
     * What it is: The distinct reason why a customer chooses us over the alternative right now.
     * Core Focus: Market penetration, execution speed, and unique go-to-market strategies.
     * Examples to adapt: A radically better user interface, an exclusive sales partnership, a proprietary algorithm, or superior customer support for a specific niche.
     * When it matters: Essential for early-stage startups and new product launches to establish a foothold and break into a crowded market.
   - MOAT (Defense): This is our defensive strategy—the compounding, sustainable structural barrier that protects our market share, pricing power, and profits from being competed away over the long term.
     * What it is: The compounding, sustainable advantage that makes it nearly impossible for competitors to replicate our success or steal our customers later on.
     * Core Focus: Long-term profitability, structural defense, and compounding value.
     * Examples to adapt: Network effects, high switching costs (deep workflow integration), or a massive scale advantage.
     * When it matters: Essential for scaling into a mature, highly profitable business protected from commoditization.
   - HOW THEY WORK TOGETHER: Detail how the business uses its Right to Win to gain traction and generate revenue today, and how it reinvests that capital and market presence to build a Moat, shifting from a fast-growing startup to a protected, durable market leader.

Please populate these fields:
   - coreAdvantage: One sentence defining our solid, highly realistic defensive advantage (Moat) protecting the business from being copied.
   - whyDefensible: Two specific, realistic, and structural reasons why competitors cannot copy this Moat in under 6 months.
   - whereUnbeatable: The specific, targeted customer segment or hyper-niche market position where our advantage is absolutely strongest and undefeated.
   - gapExploited: The exact operational or marketing gap in what standard competitors are doing that we uniquely capture.
   - rightToWin: A profound, highly strategic, capability-driven 'Right to Win' offensive analysis (minimum 2-3 sentences). Detail the exact offensive tactics (such as superior UI, execution speed, exclusive GTM strategies, or niche support) that win customer choice today, and outline how this offensive foothold is strategically reinvested to build the defensive Moat over time.`,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema,
                systemInstruction: `You are an elite business strategist, direct-response copywriter, and competitive strategy advisor. Your goal is to engineer offers that are impossible to refuse, apply the 80/20 Pareto rule, and build a defensible competitive Moat (Defense) paired with a deep, offensive 'Right to Win' (Offense) analysis. Make sure all insights are highly specific, structural, and unique to the business context rather than vague marketing fluff. Adapt values and currencies. Respond only in ${getLangName(lang)}.`
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
            },
            growthHackAutomation: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING, description: "Short title (1-3 words) for the pill menu" },
                        overview: { type: Type.STRING, description: "Overview of how this helps the user's jobs to be done" },
                        objective: { type: Type.STRING },
                        ultimateOutcome: { type: Type.STRING, description: "The specific 'Ultimate Outcome' or definition of success for this automation (e.g. '100 qualified leads enriched and pushed to CRM without manual intervention')" },
                        why: { type: Type.STRING },
                        aiAgent: { type: Type.STRING, description: "Suggests 'Claude Code', 'Cursor/Codex', or 'Antigravity' depending on the task" },
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
                            },
                            description: "Recommended sub-agents (including Orchestrator Agent) and their skills."
                        },
                        initialPrompt: { type: Type.STRING, description: "A highly elaborate, extensive, and comprehensive master prompt to feed the AI agent. It MUST read like a full project brief. It MUST clearly describe what needs to be built, what it is for, context of the business, the ultimate goal, step-by-step instructions, and provide enough constraints for the agentic system to understand exactly what to do." },
                        tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific steps/tasks for the agent to execute" }
                    },
                    required: ["title", "overview", "objective", "ultimateOutcome", "why", "aiAgent", "subAgents", "initialPrompt", "tasks"]
                }
            }
        },
        required: ["direction", "goal", "coreMessage", "marketNuance", "viralInitiative", "channelSetup", "launchSteps", "quickWins", "firstSignals", "nextMove", "creativeRecommendations", "b2bSuggestions", "keywords", "plgStrategy", "growthHackAutomation"]
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
            
            9. GROWTH HACK AUTOMATION:
               - Suggest **at least 3 different** specific campaigns of growth hack automation that can be initiated relating to this project to accelerate and automate it. Each should have a distinct purpose (e.g., Lead generation, Data enrichment, Cold outreach, Content scaling, etc.).
               - For each, provide an 'overview' explaining how this automation directly facilitates exactly what the user needs to achieve (their 'Jobs to be done') and how it makes their work significantly easier.
               - Describe the 'objective' and 'why' it is useful. Define the 'ultimateOutcome' clearly: what exactly constitutes a 100% successful and "amazing" delivery for the client.
               - Focus on new projects to be built with 'Claude Code', 'Cursor/Codex', or 'Antigravity'. Define the main 'aiAgent'.
               - IMPORTANT: Under 'subAgents', you MUST define an 'Orchestrator Agent' to manage workflow, as well as specialized sub-agents with their specific 'skills' needed to make the project a success.
               - Provide the exact 'initialPrompt' to kickstart the project. The prompt MUST be a MASSIVE, EXTREMELY highly elaborate, extensive, and comprehensive master prompt. It is going to be fed directly into an agentic system, so it must leave no room for ambiguity.
                 The prompt MUST be several paragraphs long and include:
                 1) System Persona: establish a clear, expert role for the agent.
                 2) Business Context: explain the product, the market, and why this is being built.
                 3) What is to be built: a crystal-clear, exhaustive description of the automation, feature or tool.
                 4) ULTIMATE OUTCOME/GOAL: explicitly state the expected final result and success criteria at the very beginning.
                 5) Guardrails: robust constraints to prevent hallucination, scope creep, or redundant work.
                 6) Instructions: explicitly tell the AI agent to: a) analyze the request and create a structured plan before coding, b) execute 'step-by-step', and c) at the end, clearly describe the final output it generated.
                 7) Next Steps: instruct the agent to guide the user towards the fastest "time to value" (happy path) avoiding unnecessary friction (like connecting excessive APIs until the core works).
                 Make this prompt rich in detail, contextual awareness, and directive clarity.
            
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

export const generateMoreGrowthHacks = async (fullContext: string, existingHacks: any[], language: Language, mode: GenerationMode): Promise<any[]> => {
    const ai = getAI();
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING, description: "Short title (1-3 words) for the pill menu" },
                overview: { type: Type.STRING, description: "Overview of how this helps the user's jobs to be done" },
                objective: { type: Type.STRING },
                ultimateOutcome: { type: Type.STRING, description: "The specific 'Ultimate Outcome' or definition of success for this automation (e.g. '100 qualified leads enriched and pushed to CRM without manual intervention')" },
                why: { type: Type.STRING },
                aiAgent: { type: Type.STRING, description: "Suggests 'Claude Code', 'Cursor/Codex', or 'Antigravity' depending on the task" },
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
                    },
                    description: "Recommended sub-agents (including Orchestrator Agent) and their skills."
                },
                initialPrompt: { type: Type.STRING, description: "A high-level initial prompt to feed the AI agent expressing intent without overly technical constraints" },
                tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific steps/tasks for the agent to execute" }
            },
            required: ["title", "overview", "objective", "ultimateOutcome", "why", "aiAgent", "subAgents", "initialPrompt", "tasks"]
        }
    };
    
    const existingTitles = existingHacks.map(h => h.title || h.objective).join(", ");

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `You are a Chief Strategy Officer who has launched 20+ products.
            Generate strictly new growth hack automation campaign ideas.
            
            CONTEXT:
            ${sanitizeContext(fullContext)}
            
            EXISTING HACKS TO AVOID REPEATING:
            ${existingTitles}

            INSTRUCTIONS:
            - Suggest **at least 3 different** specific campaigns of growth hack automation that can be initiated relating to this project to accelerate and automate it. Each should have a distinct purpose (e.g., Lead generation, Data enrichment, Cold outreach, Content scaling, etc.) and MUST be conceptually different from the existing hacks listed above.
            - For each, provide an 'overview' explaining how this automation directly facilitates exactly what the user needs to achieve (their 'Jobs to be done') and how it makes their work significantly easier.
            - Describe the 'objective' and 'why' it is useful. Define the 'ultimateOutcome' clearly: what exactly constitutes a 100% successful and "amazing" delivery for the client.
            - Focus on new projects to be built with 'Claude Code', 'Cursor/Codex', or 'Antigravity'. Define the main 'aiAgent'.
            - IMPORTANT: Under 'subAgents', you MUST define an 'Orchestrator Agent' to manage workflow, as well as specialized sub-agents with their specific 'skills' needed to make the project a success.
            - Provide the exact 'initialPrompt' to kickstart the project. The prompt should be highly thorough and comprehensive, establishing a clear system persona, setting robust guardrails, and explaining the exact context, desired outcome, and mentioning the sub-agents and their required skills. It MUST explicitly state the 'ULTIMATE OUTCOME' expected at the very beginning of the prompt to ensure the agentic automation understands the final goal. It should indicate the high-level goal and intention without constraining the agent with overly technical details. It MUST explicitly instruct the AI agent to: 1) analyze the request and create a structured plan before coding, 2) execute 'step-by-step', and 3) at the end, clearly and unambiguously describe the final output it generated. It should also instruct the agent to always guide the user on the next steps to reach the early "time to value" (happy path) as quickly as possible, avoiding unnecessary friction like connecting excessive APIs. Also provide a list of specific 'tasks' to guide the execution, which must include delegation to the sub-agents.
            
            Output strictly in ${getLangName(language)}.`,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema,
                systemInstruction: `You are an experienced senior growth strategist. Goal: clear, practical, LOCALIZED plan. Strictly use ${getLangName(language)}.`
            }
        });
        return extractJSON(response.text);
    } catch (e) { throw e; }
}

export const generateSingleGrowthHack = async (
    fullContext: string, 
    hackToReplace: any, 
    language: Language, 
    mode: GenerationMode
): Promise<any> => {
    const ai = getAI();
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "Short title (1-3 words) for the pill menu" },
            overview: { type: Type.STRING, description: "Overview of how this helps the user's jobs to be done" },
            objective: { type: Type.STRING },
            ultimateOutcome: { type: Type.STRING, description: "The specific 'Ultimate Outcome' or definition of success for this automation (e.g. '100 qualified leads enriched and pushed to CRM without manual intervention')" },
            why: { type: Type.STRING },
            aiAgent: { type: Type.STRING, description: "Suggests 'Claude Code', 'Cursor/Codex', or 'Antigravity' depending on the task" },
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
            initialPrompt: { type: Type.STRING, description: "A high-level initial prompt to feed the AI agent expressing intent without overly technical constraints" },
            tasks: { type: Type.ARRAY, items: { type: Type.STRING }, description: "List of specific steps/tasks for the agent to execute" }
        },
        required: ["title", "overview", "objective", "ultimateOutcome", "why", "aiAgent", "subAgents", "initialPrompt", "tasks"]
    };

    try {
        const response = await ai.models.generateContent({
            model: getModel(mode),
            contents: `You are a Chief Strategy Officer who has launched 20+ products.
            Generate a single brand-new or heavily revamped/improved growth hack automation campaign to REPLACE the following existing campaign.
            
            PRODUCT CONTEXT:
            ${sanitizeContext(fullContext)}
            
            CAMPAIGN TO REPLACE:
            - Current Title: ${hackToReplace?.title}
            - Current Objective: ${hackToReplace?.objective}
            - Current Overview: ${hackToReplace?.overview}
            
            INSTRUCTIONS:
            - Suggest a highly competent, creative alternative growth hack automation campaign.
            - Ensure it has a distinct setup, with a clear ultimateOutcome, main aiAgent and detailed subAgents.
            - The initialPrompt should be extremely robust and comprehensive. It MUST explicitly state the 'ULTIMATE OUTCOME' at the very beginning of the prompt.
            - Provide 4-6 specific tasks to execute.
            
            Output strictly in ${getLangName(language)}.`,
            config: { 
                responseMimeType: "application/json", 
                responseSchema: schema,
                systemInstruction: `You are an experienced senior growth strategist. Goal: clear, practical, LOCALIZED plan. Strictly use ${getLangName(language)}.`
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
