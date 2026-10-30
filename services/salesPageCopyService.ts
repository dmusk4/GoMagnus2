
import { Type } from "@google/genai";
import { Language, LandingPageCopy, BuilderSectionId, Product } from "../types";
import { getAI, extractJSON, sanitizeContext, getLangName } from "./aiCore";

// Helper to construct the dynamic schema based on selected sections
const buildSchema = (selectedSections: BuilderSectionId[]) => {
    const properties: Record<string, any> = {};
    const required: string[] = [];

    // AI Design Recommendations
    properties.designRecommendation = {
        type: Type.OBJECT,
        properties: {
            style: { 
                type: Type.STRING, 
                description: "The recommended 'Design Style' (e.g., 'Modern Corporate / Refined', 'AI-Native / Tech Calm', 'Minimalism / Modern Editorial'). Choose the absolute best fit for the product niche." 
            },
            typography: { 
                type: Type.STRING, 
                description: "The recommended 'Typography Style' (e.g., 'Sans-Serif (Clean & Modern)', 'Serif (Editorial & Trust)', 'Monospace (Tech & Raw)')." 
            },
            visualIntensity: { 
                type: Type.STRING, 
                description: "The recommended 'Visual FX' level (e.g., 'Low (Subtle)', 'Medium (Balanced)', 'High (Immersive)')." 
            }
        },
        required: ["style", "typography", "visualIntensity"]
    };
    required.push('designRecommendation');

    if (selectedSections.includes('header')) {
        properties.header = {
            type: Type.OBJECT,
            properties: {
                logo: { type: Type.STRING, description: "Brand name or logo text." },
                navLinks: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "5-6 Very short, concise nav links (max 1-2 words e.g. 'Features', 'Pricing', 'Reviews')."
                },
                cta: { type: Type.STRING, description: "Short CTA button text." }
            },
            required: ["logo", "navLinks", "cta"]
        };
        required.push('header');
    }

    if (selectedSections.includes('hero')) {
        properties.hero = {
            type: Type.OBJECT,
            properties: {
                eyebrow: { 
                    type: Type.STRING, 
                    description: "A short, pragmatic pill label describing what the product is and for whom (e.g. 'AI Tool for Marketers'). Concisely state the category and target audience." 
                },
                headline: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                trustSignals: { type: Type.ARRAY, items: { type: Type.STRING } },
                cta: { type: Type.STRING },
                ctaSubtext: { type: Type.STRING, description: "Short microcopy (max 4 words) below the CTA." },
                // Solution Aware Form Fields
                formTitle: { type: Type.STRING, description: "Pragmatic title for the embedded hero form." },
                formSubtitle: { type: Type.STRING, description: "Short persuasive subtext for the form." },
                formButtonText: { type: Type.STRING, description: "Action button text for the form." },
                formTrustText: { type: Type.STRING, description: "Short microcopy (max 4 words) below button. Example: 'No credit card required'" }
            },
            required: ["eyebrow", "headline", "subtitle", "trustSignals", "cta"]
        };
        required.push('hero');
    }

    if (selectedSections.includes('numbers_bar')) {
        properties.numbers_bar = {
            type: Type.OBJECT,
            properties: {
                metrics: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { label: { type: Type.STRING }, value: { type: Type.STRING } },
                        required: ["label", "value"]
                    }
                }
            },
            required: ["metrics"]
        };
        required.push('numbers_bar');
    }

    if (selectedSections.includes('categories')) {
        properties.categories = {
            type: Type.OBJECT,
            properties: {
                sectionTitle: { type: Type.STRING, description: "A high-impact, product-specific title for the categories/collections. AVOID 'Categories' or 'Our Services'." },
                sectionSubtitle: { type: Type.STRING, description: "A contextual sub-headline explaining the value within these categories for the specific ICP." },
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            linkText: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        },
                        required: ["title", "description", "linkText", "imagePrompt"]
                    },
                    description: "Exactly 6 specific categories of interest related to the product/service."
                }
            },
            required: ["sectionTitle", "sectionSubtitle", "items"]
        };
        required.push('categories');
    }

    if (selectedSections.includes('intro_pain')) {
        properties.intro_pain = {
            type: Type.OBJECT,
            description: "Cinematic Pain section. Should focus on visceral storytelling.",
            properties: {
                sectionTitle: { type: Type.STRING, description: "A high-hierarchy narrative eyebrow. Purposeful and contextual (e.g., 'THE HIDDEN COST OF INACTION')." },
                sectionSubtitle: { type: Type.STRING, description: "Pragmatic narrative bridge." },
                hook: { type: Type.STRING, description: "A massive, punchy, high-impact emotional realization or question. Max 12 words." },
                painStory: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "A sequence of 2-3 short, connected narrative sentences that describe the visceral reality of the problem."
                },
                agitation: { type: Type.STRING, description: "The single 'Turning Point' sentence that connects this pain to the solution." },
                problemImagePrompts: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["sectionTitle", "painStory", "hook", "agitation"]
        };
        required.push('intro_pain');
    }

    if (selectedSections.includes('solution')) {
        properties.solution = {
            type: Type.OBJECT,
            description: "The 'Aha!' moment. Transition from emotion to pragmatic value.",
            properties: {
                sectionTitle: { type: Type.STRING, description: "Contextual eyebrow (e.g., 'THE PERFORMANCE BREAKTHROUGH' or 'SYSTEM ARCHITECTURE'). NO generic titles." },
                headline: { type: Type.STRING, description: "The definitive answer. Bold, direct, and triumphant." },
                description: { type: Type.STRING, description: "A concise, pragmatic summary of the core mechanism. No fluff." },
                specLabel: { type: Type.STRING, description: "HINT: Not rendered in UI. Use for logic internal to copy generation." },
                keyBenefits: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "A list of 4-5 concrete, functional technical benefits."
                },
                imagePrompt: { type: Type.STRING },
                resultBox: {
                    type: Type.OBJECT,
                    properties: { 
                        label: { type: Type.STRING, description: "Internal descriptor." }, 
                        text: { type: Type.STRING, description: "The specific objective result (e.g. '+45% Retention' or 'Error-Free Deployment')." } 
                    },
                    required: ["label", "text"]
                }
            },
            required: ["sectionTitle", "headline", "description", "keyBenefits", "resultBox"]
        };
        required.push('solution');
    }

    if (selectedSections.includes('features')) {
        properties.features = {
            type: Type.OBJECT,
            properties: {
                sectionTitle: { type: Type.STRING, description: "Narrative-driven title for the main features. AVOID 'Features' or 'Benefits'. Use the unique mechanism name if possible." },
                sectionSubtitle: { type: Type.STRING, description: "A high-conversion bridge explaining the logic of the transformation through these features." },
                sectionParagraph: { type: Type.STRING, description: "A paragraph introducing the capabilities." },
                mainFeatures: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            headline: { type: Type.STRING }, 
                            body: { type: Type.STRING },
                            imagePrompt: { type: Type.STRING }
                        }, 
                        required: ["headline", "body", "imagePrompt"] 
                    },
                    description: "4 Major Deep-Dive Features."
                },
                secondaryFeaturesTitle: { type: Type.STRING, description: "A descriptive, benefit-driven title for the grid of additional features." },
                secondaryFeatures: { 
                    type: Type.ARRAY, 
                    items: { 
                        type: Type.OBJECT, 
                        properties: { 
                            title: { type: Type.STRING }, 
                            benefit: { type: Type.STRING } 
                        }, 
                        required: ["title", "benefit"] 
                    }, 
                    description: "At least 6 secondary features." 
                }
            },
            required: ["sectionTitle", "mainFeatures", "secondaryFeatures", "secondaryFeaturesTitle"]
        };
        required.push('features');
    }

    if (selectedSections.includes('who_transformation')) {
        properties.who_transformation = {
            type: Type.OBJECT,
            properties: {
                sectionTitle: { type: Type.STRING },
                sectionSubtitle: { type: Type.STRING },
                sectionParagraph: { type: Type.STRING },
                whoIsItFor: { type: Type.STRING },
                audienceSegments: { type: Type.ARRAY, items: { type: Type.STRING } },
                whoIsNotFor: { type: Type.STRING },
                beforeState: { type: Type.STRING },
                afterState: { type: Type.STRING },
                bridge: { type: Type.STRING },
                labels: {
                    type: Type.OBJECT,
                    properties: { before: { type: Type.STRING }, after: { type: Type.STRING }, bridge: { type: Type.STRING } },
                    required: ["before", "after", "bridge"]
                }
            },
            required: ["whoIsItFor", "audienceSegments", "beforeState", "afterState", "bridge", "labels"]
        };
        required.push('who_transformation');
    }

    if (selectedSections.includes('comparison_vs')) {
        properties.comparison_vs = {
            type: Type.OBJECT,
            properties: {
                sectionTitle: { type: Type.STRING },
                sectionSubtitle: { type: Type.STRING },
                sectionParagraph: { type: Type.STRING },
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { feature: { type: Type.STRING }, us: { type: Type.STRING }, them: { type: Type.STRING } },
                        required: ["feature", "us", "them"]
                    }
                }
            },
            required: ["items"]
        };
        required.push('comparison_vs');
    }

    if (selectedSections.includes('process')) {
        properties.process = {
            type: Type.OBJECT,
            properties: {
                sectionTitle: { type: Type.STRING },
                sectionSubtitle: { type: Type.STRING },
                sectionParagraph: { type: Type.STRING },
                headline: { type: Type.STRING },
                steps: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { title: { type: Type.STRING }, description: { type: Type.STRING } },
                        required: ["title", "description"]
                    }
                }
            },
            required: ["headline", "steps"]
        };
        required.push('process');
    }

    if (selectedSections.includes('about_author')) {
        properties.about_author = {
            type: Type.OBJECT,
            properties: {
                sectionTitle: { type: Type.STRING },
                authorName: { type: Type.STRING },
                authorTitle: { type: Type.STRING },
                authorBio: { type: Type.STRING },
                signatureText: { type: Type.STRING },
                stats: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { label: { type: Type.STRING }, value: { type: Type.STRING } },
                        required: ["label", "value"]
                    }
                },
                imagePrompt: { type: Type.STRING }
            },
            required: ["sectionTitle", "authorName", "authorTitle", "authorBio", "signatureText", "stats", "imagePrompt"]
        };
        required.push('about_author');
    }

    if (selectedSections.includes('offer')) {
        properties.offer = {
            type: Type.OBJECT,
            properties: {
                sectionTitle: { type: Type.STRING },
                sectionSubtitle: { type: Type.STRING },
                sectionParagraph: { type: Type.STRING },
                whatYouGet: { type: Type.STRING },
                stack: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { item: { type: Type.STRING }, value: { type: Type.STRING } },
                        required: ["item", "value"]
                    }
                },
                pricingTiers: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { 
                            name: { type: Type.STRING }, 
                            price: { type: Type.STRING }, 
                            deliverables: { type: Type.ARRAY, items: { type: Type.STRING } } 
                        },
                        required: ["name", "price", "deliverables"]
                    }
                },
                guaranteeTitle: { type: Type.STRING },
                guaranteeText: { type: Type.STRING },
                finalCta: { type: Type.STRING }
            },
            required: ["whatYouGet", "stack", "pricingTiers", "guaranteeTitle", "guaranteeText", "finalCta"]
        };
        required.push('offer');
    }

    if (selectedSections.includes('full_width_cta')) {
        properties.full_width_cta = {
            type: Type.OBJECT,
            description: "A high-impact, single-focus call to action section designed to break the visual rhythm and force a decision. Use an imperative headline and a compelling reason to click now.",
            properties: {
                headline: { type: Type.STRING, description: "A punchy, imperative headline commanding attention (e.g. 'Stop Waiting. Start Growing.')." },
                description: { type: Type.STRING, description: "A short, 1-2 sentence reinforcement of the urgency or value." },
                ctaText: { type: Type.STRING, description: "High-conversion button text." }
            },
            required: ["headline", "description", "ctaText"]
        };
        required.push('full_width_cta');
    }

    if (selectedSections.includes('lead_form')) {
        properties.lead_form = {
            type: Type.OBJECT,
            description: "A dedicated lead capture section. The copy must sell the 'Lead Magnet' or 'Consultation' value to justify the user giving their data.",
            properties: {
                sectionTitle: { type: Type.STRING },
                sectionSubtitle: { type: Type.STRING },
                headline: { type: Type.STRING, description: "The core promise of the lead magnet or offer." },
                subheadline: { type: Type.STRING, description: "Why they should grab it now." },
                deliverables: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-4 bullet points of exactly what they get after signing up." },
                formTitle: { type: Type.STRING, description: "Title above the input fields (e.g. 'Get Instant Access')." },
                buttonText: { type: Type.STRING }
            },
            required: ["headline", "deliverables", "formTitle", "buttonText"]
        };
        required.push('lead_form');
    }

    if (selectedSections.includes('social_proof')) {
        properties.social_proof = {
            type: Type.OBJECT,
            properties: {
                sectionTitle: { type: Type.STRING },
                sectionSubtitle: { type: Type.STRING },
                sectionParagraph: { type: Type.STRING },
                testimonials: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { quote: { type: Type.STRING }, author: { type: Type.STRING }, role: { type: Type.STRING } },
                        required: ["quote", "author", "role"]
                    }
                },
                summaryMetric: { type: Type.STRING }
            },
            required: ["testimonials", "summaryMetric"]
        };
        required.push('social_proof');
    }

    if (selectedSections.includes('faq')) {
        properties.faq = {
            type: Type.OBJECT,
            properties: {
                sectionTitle: { type: Type.STRING },
                sectionSubtitle: { type: Type.STRING },
                sectionParagraph: { type: Type.STRING },
                items: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { q: { type: Type.STRING }, a: { type: Type.STRING } },
                        required: ["q", "a"]
                    }
                }
            },
            required: ["items"]
        };
        required.push('faq');
    }

    if (selectedSections.includes('footer_contact')) {
        properties.footer_contact = {
            type: Type.OBJECT,
            properties: {
                sectionTitle: { type: Type.STRING },
                sectionSubtitle: { type: Type.STRING },
                sectionParagraph: { type: Type.STRING },
                contactInfo: {
                    type: Type.OBJECT,
                    properties: {
                        email: { type: Type.STRING },
                        phone: { type: Type.STRING },
                        address: { type: Type.STRING }
                    },
                    required: ["email"]
                },
                socialLinks: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: { platform: { type: Type.STRING }, url: { type: Type.STRING } },
                        required: ["platform", "url"]
                    }
                },
                copyrightText: { 
                    type: Type.STRING, 
                    description: "The brand name and standard 'All rights reserved' text. DO NOT include the year or the copyright symbol, as the UI Builder adds these automatically (e.g. 'MarketHero. All rights reserved.')." 
                },
                formTitle: { type: Type.STRING },
                formButtonText: { type: Type.STRING }
            },
            required: ["contactInfo", "socialLinks", "copyrightText", "formTitle", "formButtonText"]
        };
        required.push('footer_contact');
    }

    return {
        type: Type.OBJECT,
        properties,
        required
    };
};

export const generateLandingPageCopy = async (
    productContext: any,
    selectedSections: BuilderSectionId[],
    tone: string,
    creativityLevel: number,
    language: Language,
    customDirection?: string,
    isSolutionAware?: boolean,
    pageObjective?: string,
    additionalTool?: string
): Promise<any> => {
    const ai = getAI();
    const schema = buildSchema(selectedSections);

    const requiredNavLinks = [];
    if (selectedSections.includes('features')) requiredNavLinks.push("Features");
    if (selectedSections.includes('process')) requiredNavLinks.push("How");
    if (selectedSections.includes('who_transformation')) requiredNavLinks.push("Who");
    if (selectedSections.includes('comparison_vs')) requiredNavLinks.push("Why");
    if (selectedSections.includes('social_proof')) requiredNavLinks.push("Reviews");
    if (selectedSections.includes('faq')) requiredNavLinks.push("FAQ");
    
    const linksToEnforce = requiredNavLinks.slice(0, 6);

    const navInstruction = linksToEnforce.length > 0 
        ? `4. **HEADER NAVIGATION**: Must include: ${linksToEnforce.join(', ')} (Localized).` 
        : "";

    const solutionAwareInstruction = isSolutionAware 
        ? `SOLUTION AWARE HERO MODE ACTIVE:
           - The Hero section MUST act as a high-conversion Lead Capture Form.
           - formTitle: A direct, pragmatic instruction (e.g. "Book Your Demo").
           - formSubtitle: Reinforce value (e.g. "Get instant access.").
           - formButtonText: High friction reducer (e.g. "Show Me The Platform").
           - formTrustText: Only the text itself, e.g. "100% Secure" or "No credit card needed". Do NOT output instructions.
           - The headline should focus on the IMMEDIATE benefit of solving the known problem.
           - Assume the user knows what they are looking for and just needs to be converted.`
        : "";

    const prompt = `You are a senior direct-response copywriter, SEO architect, and premium web designer with 10+ years of experience.

Your mission is to generate a single, complete sales landing page that is conversion rate optimized and SEO-FIRST.
    
    PRODUCT CONTEXT:
    ${sanitizeContext(productContext)}
    
    TONE: ${tone}
    CREATIVITY: ${creativityLevel}
    LANGUAGE: ${getLangName(language)}
    PAGE OBJECTIVE: ${pageObjective || 'Direct Sale'}
    ADDITIONAL TOOL/INTEGRATION: ${additionalTool || 'None'}
    
    STRATEGIC DIRECTION:
    ${customDirection ? customDirection : "None provided. Focus on high conversion best practices."}
    ${solutionAwareInstruction}
    
    IMPORTANT: The generated copy MUST align with the PAGE OBJECTIVE. If the objective is Lead Capture, emphasize lead generation mechanisms (forms, freebies). If it's Booking/Scheduling, emphasize the call/meeting value. If it's a Simulator/Tool, structure the copy around engaging with that tool. The forms generated (e.g. Lead Form, Hero Form) MUST reflect the ADDITIONAL TOOL/INTEGRATION requested.

Your style is: Confident, empathetic, and direct.
- Assume the audience is expert but keep language simple (8th grade level).
- Eliminate "fluff" adjectives (e.g., "amazing", "revolutionary", "game-changing"). 
- Use specific verbs and nouns.
- Focus on the "Mechanics of Value": How it works and what it gets them.
NO MARKETING JARGON: Use human, natural language only.
LOCALIZATION: Use the specific currency and conventions of the target country.

CRITICAL TEXT LENGTH CONSTRAINTS (NEVER EXCEED - ESSENTIAL TO PREVENT LAYOUT OVERFLOW OR COLLAPSE):
1. **Headlines (H1, H2, H3, headlines, segment titles, hero titles)**: Must be highly punchy and direct, strictly MAX 8-10 words. NEVER write multi-line run-on sentences as headlines.
2. **Subtitles & Subheadlines (hero subtitles, section descriptions)**: Strictly MAX 15-20 words. Focus on a single impact-heavy statement.
3. **Pills & Eyebrows (such as hero eyebrow, badges)**: Strictly MAX 2-4 words.
4. **All Section Body Paragraphs / Paragraphs**: Strictly MAX 2 short sentences (MAX 30 words total per paragraph). Ensure readability by being ultra-concise.
5. **Feature/Category/Step Cards**: 
   - Card titles: MAX 3-5 words.
   - Card descriptions/benefits: MAX 12-15 words. Keep them to a single concise line or action bullet point.
6. **CTA Buttons**: MAX 2-3 words (e.g., "Start Free", "Book Demo").
7. **Trust Text / Microcopy below forms & buttons (ctaSubtext, formTrustText)**: STRICTLY MAX 2-6 words (e.g., "No credit card required", "100% secure"). MUST BE EXTREMELY CONCISE AND NOT INCLUDE PROMPT INSTRUCTIONS.
8. **Testimonials**: Keep each quote concise, MAX 2 sentences (MAX 25 words).
9. **FAQs**: Answer must be MAX 2 sentences (MAX 30 words).

Every word must count. Eliminate all redundant phrasing. Punchy, high-impact, short.

SEMANTIC STRUCTURE: Ensure the copy is structured with logical heading hierarchies (H1, H2, H3).

ADVANCED SEO COPYWRITING & ON-PAGE OPTIMIZATION:
1. Primary Keyword Placement: Ensure the primary search intent keyword naturally appears in the main Hero Headline (H1), at least one Section Title (H2), and within the first 100 words (intro/pain section).
2. Semantic Variations (LSI Keywords): Use synonyms, related terms, and contextual phrases throughout the body paragraphs and subtitles to build topical authority without keyword stuffing.
3. Optimal Keyword Density: Maintain a natural, conversational keyword density. Do not force keywords where they break the direct-response copy flow.
4. High-Intent Commercial Keywords: Integrate transactional and intent-based modifiers naturally where appropriate for the niche.
5. Readability & UX: Keep sentences short and highly scannable for both humans and search engine crawlers to keep bounce rates low and dwell time high.

FINAL OBJECTIVE:
Create a landing page that ranks high in relevance for search engines and converts at a high rate for humans.


CRITICAL FORMATTING RULES:
1. **SECTION TITLES**: NEVER use basic titles like "Features", "About Us", or "Categories". Use descriptive, benefit-driven headlines that act as a narrative bridge between sections (e.g., "Stop Wasting Hours on Manual Data Entry" instead of "The Problem"). Titles must be contextual to the product niche.
2. **SECTION SUBTITLES**: Use complete sentences that add context and are related to the section title and product value. Avoid generic phrases.
3. **SECTION PARAGRAPHS**: Every section (except Hero/Numbers) MUST have a 'sectionParagraph'. This is a short intro (2-3 sentences) that sets the stage for the content below it.
${navInstruction ? navInstruction : ''}
5. Generate at least 4 testimonials and 8 FAQs. 

SECTION SPECIFIC RULES:
1. **CATEGORIES (categories)**: 
   - 'sectionTitle' and 'sectionSubtitle' must NOT be generic. Use terms that evoke the specific problem or solution types for this product. 
   - Provide exactly 6 specific categories.
2. **FEATURES (features)**:
   - 'sectionTitle' and 'sectionSubtitle' must follow the product narrative. If there is a unique mechanism, reference it here. NO generic titles like "Our Features".
3. **TRANSFORMATION SECTION**: 
   - Provide an accurate list of specific "Audience Segments" (e.g., "Agency Owners", "Freelancers").
   - Generate localized labels for "Before", "After", and "The Bridge" in the target language.
4. **COPYRIGHT**: In 'copyrightText', do NOT include any year or symbol. Just the brand name and the 'All rights reserved' notice.
5. **ABOUT AUTHOR**: Write in the first person. Make it authoritative yet accessible.
    - Focus on benefits, outcomes and psychological triggers.
    - For pricing, use the currency appropriate for the language/location.
    - Ensure all fields in the schema are populated with high-quality content.
    - The output must be a valid JSON object matching the provided schema.
Context first: always use the full project context (product, audience, goal).
Copy before design: structure and messaging lead; visuals support.
Conversion-driven: every section exists to reduce friction and move the user forward.
Mobile-first by default: clarity and readability on small screens first.
SEO-aware: natural keywords, semantic variations, clear heading hierarchy.

CRITICAL FORMATTING RULES:
1. **PAIN SECTION (intro_pain)**: 
   - Focus on STORYTELLING. 
   - 'hook': A short, massive realization or question that stops the reader.
   - 'sectionTitle': MUST be a purposeful, niche-specific eyebrow (e.g., 'THE REAL COST OF SLOW PIPELINES'). 
   - 'painStory': 2-3 short, cinematic sentences that describe the feeling of the problem.
   - Less is more. Use impact over volume. 

2. **SOLUTION SECTION (solution)**:
   - 'sectionTitle': MUST be a purposeful, niche-specific eyebrow (for who, what, why)
   - Visceral pain transition leading into highly specific, forensic-level solution value.
   - 'headline': Lead with THE ANSWER. Bold, direct. 
   - 'resultBox': The statement in this card MUST be concrete and pragmatic. Address the specific ICP and the exact problem solved. AVOID generic clichés like "Next Gen Performance" or "Core Mechanics". Instead use specific, tangible outcomes (e.g., "Eliminates Manual Data Entry" or "Automates 90% of Payroll").

DESIGN INTELLIGENCE:
Recommend the ideal Style, Typography, and Visual Intensity based on the niche.
CRITICAL AESTHETIC RULE: Favor monochromatic (Slate, Charcoal, Black, Zinc). AVOID purple, indigo
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.7 + (creativityLevel * 0.3),
                systemInstruction: `És um Copywriter Direct Response de elite e Especialista em SEO. Criar uma narrativa que flui da dor emocional visceral para a solução pragmática e técnica, perfeitamente otimizada para motores de busca.`
            }
        });
        
        return extractJSON(response.text);
    } catch (e) {
        console.error("Error generating landing page copy:", e);
        return {};
    }
};

export const refineLandingPageCopy = async (
    currentCopy: any,
    instruction: string,
    productContext: any,
    language: Language,
    sectionId?: BuilderSectionId
): Promise<any> => {
    const ai = getAI();
    const sectionsToRefine = sectionId ? [sectionId] : Object.keys(currentCopy) as unknown as BuilderSectionId[];
    const schema = buildSchema(sectionsToRefine);

    const currentSectionContent = sectionId && currentCopy ? currentCopy[sectionId] : currentCopy;

    const prompt = `You are a professional Copy Editor. 
    
    TASK: Update the copy based on the user instruction: "${instruction}".
    
    CURRENT CONTENT (Source of Truth):
    ${sanitizeContext(currentSectionContent)}
    
    PRODUCT CONTEXT:
    ${sanitizeContext(productContext)}
    
    CRITICAL RULES:
    1. Only modify the fields relevant to the user's instruction.
    2. KEEP ALL OTHER FIELDS EXACTLY AS THEY ARE in the Current Content. Do not hallucinate new content for fields not mentioned.
    3. Return the full JSON object for this section (or the whole page if no section specified), with the necessary updates applied.
    4. Language: ${getLangName(language)}.
    5. STRICT LENGTH LIMITS (ESSENTIAL TO PREVENT LAYOUT BLOCK SPEECH/OVERFLOW):
       - Headlines/Titles: MAX 8-10 words. Must be punchy.
       - Subtitles: MAX 15-20 words.
       - Body paragraphs: MAX 2 short sentences (MAX 30 words total).
       - Features / Cards: Title MAX 3-5 words, Description MAX 12-15 words.
       - Action buttons: MAX 2-3 words.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
                temperature: 0.7
            }
        });
        
        return extractJSON(response.text);
    } catch (e) {
        return {};
    }
};

export const generateRecommendedTool = async (product: Product, pageObjective: string, language: Language): Promise<string> => {
    const ai = getAI();
    const prompt = `You are an expert marketing strategist and growth hacker.
Given the product context and the page objective, recommend the single most effective "Additional Tool" or "Integration" (e.g. ROI Calculator, Free Audit Quiz, Pricing Estimator, Lead Magnet Download, Setup Simulator) that should be integrated into the landing page to maximize conversions for this objective.

PRODUCT CONTEXT:
Name: ${product.name}
Description: ${product.description}
Goal: ${product.goal}
Target Audience: ${product.audienceType || product.decisionMaker || ''}

PAGE OBJECTIVE: ${pageObjective}
LANGUAGE: ${getLangName(language)}

CRITICAL CONSTRAINTS:
- Output ONLY the name/description of the tool.
- Be EXTREMELY concise and objective.
- MAXIMUM length: 100 characters.
- DO NOT include any introductory or concluding text, just the tool name/short concept.
- Examples: "Interactive ROI Calculator", "Free 2-Minute Audit Quiz", "Dynamic Pricing Estimator".`;

    try {
        const result = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: prompt,
            config: {
                temperature: 0.7,
            }
        });
        
        return result.text ? result.text.trim().substring(0, 100) : "";
    } catch (e) {
        console.error("Failed to generate recommended tool", e);
        return "";
    }
};
