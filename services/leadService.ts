
import { GoogleGenAI, Type } from "@google/genai";
import { Language, GenerationMode } from "../types";

/**
 * Lead Service
 * Specialized logic for B2B Lead Scouting, N8N Webhooks, and Apify Actor integrations.
 */

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Strict list of allowed industries for Apify/LinkedIn Scraping
export const VALID_INDUSTRIES = [
    "information technology & services", "construction", "marketing & advertising", "real estate", "health, wellness & fitness", 
    "management consulting", "computer software", "internet", "retail", "financial services", "consumer services", 
    "hospital & health care", "automotive", "restaurants", "education management", "food & beverages", "design", "hospitality", 
    "accounting", "events services", "nonprofit organization management", "entertainment", "electrical/electronic manufacturing", 
    "leisure, travel & tourism", "professional training & coaching", "transportation/trucking/railroad", "law practice", 
    "apparel & fashion", "architecture & planning", "mechanical or industrial engineering", "insurance", "telecommunications", 
    "human resources", "staffing & recruiting", "sports", "legal services", "oil & energy", "media production", "machinery", 
    "wholesale", "consumer goods", "music", "photography", "medical practice", "cosmetics", "environmental services", 
    "graphic design", "business supplies & equipment", "renewables & environment", "facilities services", "publishing", 
    "food production", "arts & crafts", "building materials", "civil engineering", "religious institutions", 
    "public relations & communications", "higher education", "printing", "furniture", "mining & metals", 
    "logistics & supply chain", "research", "pharmaceuticals", "individual & family services", "medical devices", 
    "civic & social organization", "e-learning", "security & investigations", "chemicals", "government administration", 
    "online media", "investment management", "farming", "writing & editing", "textiles", "mental health care", 
    "primary/secondary education", "broadcast media", "biotechnology", "information services", "international trade & development", 
    "motion pictures & film", "consumer electronics", "banking", "import & export", "industrial automation", 
    "recreational facilities & services", "performing arts", "utilities", "sporting goods", "fine art", "airlines/aviation", 
    "computer & network security", "maritime", "luxury goods & jewelry", "veterinary", "venture capital & private equity", 
    "wine & spirits", "plastics", "aviation & aerospace", "commercial real estate", "computer games", "packaging & containers", 
    "executive office", "computer hardware", "computer networking", "market research", "outsourcing/offshoring", 
    "program development", "translation & localization", "philanthropy", "public safety", "alternative medicine", 
    "museums & institutions", "warehousing", "defense & space", "newspapers", "paper & forest products", "law enforcement", 
    "investment banking", "government relations", "fund-raising", "think tanks", "glass, ceramics & concrete", "capital markets", 
    "semiconductors", "animation", "political organization", "package/freight delivery", "wireless", "international affairs", 
    "public policy", "libraries", "gambling & casinos", "railroad manufacture", "ranching", "military", "fishery", 
    "supermarkets", "dairy", "tobacco", "shipbuilding", "judiciary", "alternative dispute resolution", "nanotechnology", 
    "agriculture", "legislative office"
];

const extractJSON = (text: string | undefined | null): any => {
    if (!text) return null;
    const trimmed = text.trim();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try { return JSON.parse(trimmed); } catch (e) {}
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

/**
 * Searches for B2B leads using external scrapers via N8N/Apify if available,
 * otherwise falls back to Gemini grounding for research.
 */
export const searchRealLeads = async (industries: string[], location: string, titles: string[], webhookUrl?: string): Promise<any[]> => {
    // 1. Try N8N/Apify Webhook if URL provided
    if (webhookUrl && webhookUrl.trim().length > 0) {
        try {
            // Lowercase location for Apify Actor validation
            const formattedLocation = location.toLowerCase().trim();
            
            console.log(`[LeadScout] Sending request to: ${webhookUrl}`, { industries, location: formattedLocation, jobTitles: titles });
            
            const response = await fetch(webhookUrl, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    industries,
                    location: formattedLocation,
                    jobTitles: titles
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log(`[LeadScout] Received data:`, data);
                // Expecting N8N to return array of leads
                // Mapping generic response to our Lead interface
                const rawLeads = Array.isArray(data) ? data : data.leads || [];
                return rawLeads.map((l: any, i: number) => ({
                    id: l.id || `real-${Date.now()}-${i}`,
                    name: l.name || l.fullName || "Unknown",
                    jobTitle: l.jobTitle || l.title || "Executive",
                    location: l.location || location,
                    companyName: l.companyName || l.company || "Company",
                    linkedinUrl: l.linkedinUrl || l.linkedin || "#",
                    avatarUrl: l.avatarUrl || l.photoUrl || undefined,
                    status: 'new'
                }));
            } else {
                console.warn(`[LeadScout] Webhook error ${response.status}: ${response.statusText}`);
            }
        } catch (e) {
            console.error("N8N/Apify Webhook connection failed. Ensure CORS is enabled on the server or use a proxy.", e);
        }
    } else {
        console.log("[LeadScout] No Webhook URL provided, skipping external fetch.");
    }

    // 2. Fallback to Gemini (AI Forensic Search)
    // This is useful if the user hasn't set up the N8N webhook yet
    console.log("[LeadScout] Falling back to AI Search.");
    return findB2BLeads(industries, location, titles, 'en', 'Quality');
};

export const findB2BLeads = async (industries: string[], location: string, titles: string[], lang: Language, mode: GenerationMode): Promise<any[]> => {
    const ai = getAI();
    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                jobTitle: { type: Type.STRING },
                location: { type: Type.STRING },
                companyName: { type: Type.STRING },
                linkedinUrl: { type: Type.STRING },
                avatarUrl: { type: Type.STRING }
            },
            required: ["id", "name", "jobTitle", "location", "companyName", "linkedinUrl"]
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: `Scrape and identify REAL key decision makers.
            Target Industries: ${industries.join(', ')}.
            Target Geographic Scope: ${location}. (Search for specific districts, cities, or regions within this location if specified).
            Target Job Titles: ${titles.join(', ')}. 
            
            CRITICAL: Use Google Search to find ACTUAL names of executives at real companies currently active in the specific regions of "${location}" within these specific industries.
            - LinkedIn URL must be a valid pattern.
            - Provide 15-20 high-quality leads.
            - Search for specific companies in the target location districts for each industry.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                tools: [{googleSearch: {}}]
            }
        });
        return extractJSON(response.text) || [];
    } catch (e) { return []; }
};
