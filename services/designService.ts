
import { GoogleGenAI, Type } from "@google/genai";
import { LandingPageBuilderData, Language } from "../types";
import { getLangName } from "./aiCore";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface DesignSettings {
    style: string;
    typography: string;
    colorPalette: string;
    iconSet: string;
    visualIntensity: string;
    borderRadius: string;
    themeMode: string;
}

export interface BrandKitAnalysis {
    colors: string[];
    fontPairingRecommendation: string;
    vibeKeywords: string[];
    suggestion: string;
}

export const DESIGN_STYLES = [
    "Modern Corporate / Refined",
    "Minimalism / Modern Editorial",
    "Glassmorphism (Soft & Controlled)",
    "Light Skeuomorphism / Soft UI",
    "3D / Spatial UI",
    "Neo-Brutalism",
    "Dark Academia",
    "Light Academia",
    "Y2K / Digital Retro",
    "Editorial Luxury",
    "AI-Native / Tech Calm",
    "Playful Minimal"
];

export const THEME_MODES = [
    "Light Mode (Clean White)",
    "Dark Mode (Deep Slate)",
    "Midnight (Pitch Black)",
    "Soft Gray (Low Contrast)",
    "Warm Paper / Sepia",
    "Auto / System Managed"
];

const STYLE_PROMPTS: Record<string, string> = {
    "Modern Corporate / Refined": `STYLE: SaaS / Tech Enterprise
    Characteristics: Clean, systematic, trust-building, scalable.
    Typography: Inter, Plus Jakarta Sans, or Geist. High readability, varying weights for hierarchy.
    Color Palette: Cool neutrals (slate/gray), single strong primary accent (Electric Blue or Indigo). White backgrounds.
    UI Elements: Crisp 1px borders, subtle drop shadows, rounded corners (4px-8px).
    Layout: Structured grids, dashboard-inspired data presentation, reliable and orderly.`,

    "Minimalism / Modern Editorial": `STYLE: Modern Editorial / Luxury
    Characteristics: High contrast, refined, unhurried, art-gallery feel.
    Typography: Distinctive Serif headlines (Playfair Display, Cormorant) paired with minimal Sans body.
    Color Palette: Muted earth tones, cream/charcoal, or stark Black & White.
    UI Elements: Extensive negative space (whitespace), sharp edges (0px radius) or very soft rounding. No clutter.
    Layout: Asymmetrical grids, large typography, text overlapping images slightly.`,

    "Glassmorphism (Soft & Controlled)": `STYLE: Glassmorphism / Frosted
    Characteristics: Translucent, layered, ethereal, depth-focused.
    Typography: Modern Sans-Serif (Manrope, DM Sans).
    Color Palette: Vivid, blurry gradient backgrounds (mesh gradients) overlaid with white/transparent glass cards.
    UI Elements: Backdrop-filter: blur, white borders with low opacity (20%), subtle inner glows.
    Layout: Floating cards, sense of Z-axis depth, soft transitions.`,

    "Light Skeuomorphism / Soft UI": `STYLE: Soft UI / Neumorphism Lite
    Characteristics: Tactile, soft, friendly, physical feel.
    Typography: Rounded Sans (Quicksand, Nunito, Varela Round).
    Color Palette: Very light grays, off-whites, soft pastel accents. Low contrast shadows.
    UI Elements: Soft shadows, pill-shaped buttons, inner shadows for inputs, gentle gradients.
    Layout: Spacious, centered focus, elements feel like they are resting on a surface.`,

    "3D / Spatial UI": `STYLE: 3D / Spatial / Immersive
    Characteristics: Depth, floating elements, perspective, cinematic.
    Typography: Geometric Sans (Spline Sans, Sora).
    Color Palette: Deep, rich backgrounds to make 3D elements pop. Neon or vibrant accents.
    UI Elements: Floating cards with heavy shadows, parallax scrolling effects, layered z-index compositions.
    Layout: Scroll-driven animations, elements entering from different depths.`,

    "Neo-Brutalism": `STYLE: Neo-Brutalism / Dev
    Characteristics: Raw, intentional ugliness, high-impact, anti-design.
    Typography: Monospace (JetBrains Mono, Space Mono, IBM Plex Mono).
    Color Palette: High contrast, primary colors (pure blue, red, yellow) on beige or white.
    UI Elements: Thick black borders (2px-4px), hard shadows (no blur), distinct lack of border-radius.
    Layout: Visible layout grids, marquee text, overlapping elements, stark dividers.`,

    "Dark Academia": `STYLE: Dark Academia / Intellectual
    Characteristics: Moody, classic, studious, timeless.
    Typography: Traditional Serifs (EB Garamond, Merriweather) and classic Sans.
    Color Palette: Deep browns, forest greens, charcoal, warm parchment/paper tones.
    UI Elements: Paper textures, classic borders (double lines), centered layouts, gold/brass accents.
    Layout: Columnar, text-heavy but legible, feels like a library or study.`,

    "Light Academia": `STYLE: Light Academia / Poetic
    Characteristics: Elegant, airy, refined, knowledge-focused.
    Typography: Elegant Serifs (Lora, Noto Serif) with light weights.
    Color Palette: Beige, cream, soft gold, light stone, pale blues.
    UI Elements: Thin lines (0.5px), generous margins, soft separators.
    Layout: Book-like typography, wide leading, calm composition.`,

    "Y2K / Digital Retro": `STYLE: Y2K / Digital Retro
    Characteristics: Chaotic, nostalgic, energetic, early-internet.
    Typography: Pixel fonts, stretched Sans, wide headers (Syne, Clash Display).
    Color Palette: Hot pink, neon green, metallic silver, holographic gradients.
    UI Elements: Glitch effects, vinyl textures, star shapes, marquees, raw HTML elements.
    Layout: 'Broken' grids, overlapping collage style, dense information.`,

    "Editorial Luxury": `STYLE: High Fashion / Editorial Luxury
    Characteristics: Expensive, sparse, confident, whitespace-heavy.
    Typography: Didone Serifs (Bodoni, Prata) mixed with geometric Sans.
    Color Palette: Monochromatic (Black/White), Gold/Bronze accents, deep velvet tones.
    UI Elements: Asymmetrical layouts, huge hero images, tiny navigation text, zero border radius.
    Layout: Image-driven, scrolling tells a visual story, minimal text blocks.`,

    "AI-Native / Tech Calm": `STYLE: AI-Native / Tech Calm / Linear-like
    Characteristics: Futuristic, soothing, precise, glowing.
    Typography: Modern Grotesk (Geist, Inter, Satoshi).
    Color Palette: Dark mode dominant, subtle glowing gradients (purple/blue), text gradients.
    UI Elements: 1px borders with gradients (bento grids), subtle glows, glass accents, dot pattern backgrounds.
    Layout: Bento grids, compact density, highly organized information architecture.`,

    "Playful Minimal": `STYLE: Playful Minimal / Consumer
    Characteristics: Rounded, bouncy, approachable, friendly.
    Typography: Rounded Sans (Outfit, Fredoka, Balsamiq).
    Color Palette: Saturated pastels, multi-color palettes, white background.
    UI Elements: Large border radius (pills/circles), squircle shapes, flat vector illustrations.
    Layout: Open, airy, large buttons, 'bouncy' interaction feel.`
};

export const TYPOGRAPHY_STYLES = [
    "Sans-Serif (Clean & Modern)",
    "Serif (Editorial & Trust)",
    "Monospace (Tech & Raw)",
    "Display Mixed (Bold & Creative)",
    "Grotesque (Corporate & Swiss)"
];

export const VISUAL_INTENSITY = [
    "Low (Subtle)",
    "Medium (Balanced)",
    "High (Immersive)"
];

// Helper to convert unsupported formats (like AVIF) to PNG
const convertToPng = (base64: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } else {
                reject(new Error('Canvas context failed'));
            }
        };
        img.onerror = reject;
        img.src = base64;
    });
};

/**
 * Analyzes uploaded reference images to generate a Brand Kit.
 */
export const analyzeDesignReferences = async (imageB64s: string[]): Promise<BrandKitAnalysis | null> => {
    const ai = getAI();
    
    // Process images to ensure supported formats (specifically converting AVIF to PNG)
    const parts = await Promise.all(imageB64s.map(async (b64) => {
        let finalB64 = b64;
        let mimeType = b64.match(/^data:([^;]+);/)?.[1] || 'image/png';

        if (mimeType === 'image/avif') {
            try {
                finalB64 = await convertToPng(b64);
                mimeType = 'image/png';
            } catch (e) {
                console.warn("Could not convert AVIF image, skipping.", e);
                return null;
            }
        }

        const data = finalB64.split(',')[1];
        return { inlineData: { data, mimeType } };
    }));

    const validParts = parts.filter(p => p !== null) as { inlineData: { data: string; mimeType: string; } }[];

    if (validParts.length === 0) {
        console.error("No valid images to analyze after processing.");
        return null;
    }

    const schema = {
        type: Type.OBJECT,
        properties: {
            colors: { type: Type.ARRAY, items: { type: Type.STRING } },
            fontPairingRecommendation: { type: Type.STRING },
            vibeKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestion: { type: Type.STRING }
        },
        required: ["colors", "fontPairingRecommendation", "vibeKeywords", "suggestion"]
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    ...validParts,
                    { text: "Analyze the aesthetic essence of these reference images. Extract the core color palette. Identify the mood, emotion, and atmospheric tone (e.g., 'Melancholic yet hopeful', 'Energetic and chaotic', 'Serene and minimalist'). Do NOT provide actionable design instructions. Instead, provide a descriptive summary of the 'Vibe' that captures the feeling of the brand." }
                ]
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });

        return JSON.parse(response.text || "{}");
    } catch (e) {
        console.error("Design analysis failed", e);
        return null;
    }
};

/**
 * Generates a "Vibecoding" prompt for AI Engineers.
 */
export const generateVibecodingPrompt = async (
    designSettings: DesignSettings,
    copyData: any,
    productName: string,
    language: Language,
    brandKit?: BrandKitAnalysis
): Promise<string> => {
    const ai = getAI();
    
    const specificStyleInstruction = STYLE_PROMPTS[designSettings.style] || `STYLE: ${designSettings.style}`;
    
    // Extract section keys to inform the AI about the structure
    const sectionStructure = Object.keys(copyData || {}).join(", ");
    const currentYear = new Date().getFullYear();
    const fullLanguageName = getLangName(language);

    const isHighIntensity = designSettings.visualIntensity === "High (Immersive)";

    const highIntensityInstructions = isHighIntensity ? `
    16. HIGH INTENSITY VISUALS & MOTION:
       - Design in the style of high-end Framer showcase sites — smooth scroll transitions, refined animations, modern typography, and expressive but controlled visual storytelling.
       - Implement Better motion timing, Scroll choreography, and a distinct Design-led feel.
       - Add slow, subtle animated elements that add dynamism without interfering with foreground elements and text.”
       ` : "";

    const context = `
    PRODUCT: ${productName}
    DESIGN STYLE: ${designSettings.style}
    THEME MODE: ${designSettings.themeMode}
    TYPOGRAPHY: ${designSettings.typography}
    VISUAL INTENSITY: ${designSettings.visualIntensity}
    ICON SET: ${designSettings.iconSet}
    COLOR PALETTE: ${designSettings.colorPalette} ${brandKit ? `(Derived from refs: ${brandKit.colors.join(', ')})` : ''}
    
    SECTIONS STRUCTURE: ${sectionStructure}
    `;

    const systemInstruction = `You are a Senior Frontend Architect specialized in prompting other AIs (Cursor, Bolt, Windsurf, Lovable). 
    Your goal is to write a "Master Prompt" that I can paste into an AI coding tool to build this landing page instantly, creating a perfect polished design in one shot.
    
    CRITICAL INSTRUCTION:
    Output ONLY the code prompt. DO NOT include any conversational filler, introductory text, or sign-offs. 
    Your response must start IMMEDIATELY with the preamble below.

    NO DUPLICATION RULE:
    DO NOT output the "CONTENT DATA" JSON block in your response. The application will append it strictly after your output.
    Your output should reference the JSON block, but NOT include it.

    STRICT CONTENT INJECTION PROTOCOL:
    1. You MUST explicitly instruct the target AI to populate the website with the EXACT TEXT provided in the 'CONTENT DATA' block (which will be appended).
    2. Explicitly forbid the use of "Lorem Ipsum" or placeholder text.
    3. Mandate that every section defined in the JSON must be rendered.

    MANDATORY PREAMBLE:
    The generated Master Prompt MUST START with the following text block exactly:

    You are a top-tier digital designer creating one-billion-dollar landing pages featured on Awwwards, Behance and Dribbble.
    Design a bespoke, premium landing page with premium quality like Apple, Linear, Attio, Tesla — never templated, never generic.

    CORE PRINCIPLES
    Design with taste, restraint and intention
    Typography drives hierarchy
    Every element has a reason to exist
    Immersive scroll-driven storytelling.
    Import a distinctive font from Google Fonts in head
    
    AVOID:
    1.basic fonts Inter, Roboto, Lato, Open Sans;
    2. Standard corporate blue and purple colors ai slop
    3. card grids with identical sizing and no visual hierarchy
    4. sticky navs that obscure content on mobile

    BEFORE GENERATING
    2.list the harmonious font combination and color palette
    3.describe layout strategy in one sentence
    4.for tally form style: list hex colors of text color, background color, cta background, cta background hover
  
    CONTENT INJECTION RULE:
    You must populate the website using the EXACT text provided in the JSON data block at the end of this prompt. 
    Do NOT use Lorem Ipsum. Do NOT summarize. Map the JSON keys to the website sections 1:1.

    DESIGN INTELLIGENCE
    Apply expert knowledge of:
    Visual hierarchy & cognitive load
    Advanced typography systems
    Color theory (harmonious, analogous, complementary)
    Proportions, rhythm, balance
    Readability & accessibility (WCAG-aware)
    Mobile-first UX

    VISUAL DIRECTION
    Editorial, grid-based layout
    Refined typography
    Restrained color palette (1 primary color and 1 accent max)
    Minimal, confident components
    Place context images related to product/brand and marketing ICP when needed. No stock-photo or SaaS clichés. 

    Avoid:
    Cookie-cutter layouts
    Trend-for-trend effects
    Overdesigned heroes
    Visual noise
    
    AFTER this preamble, continue with the specific project instructions:

    1. Define the Stack Html, CSS and JS for Landing Page Design optimized for SEO and CRO.
    2. Explicitly describe the Visual Design System based on the "${designSettings.style}" style.
    3. THEME MODE RULE: Strictly implement the "${designSettings.themeMode}" theme. If Dark/Midnight, use deep gradients and high-contrast text. If Light/Warm, use clean airy backgrounds.
    4. Instruct the AI to map the provided JSON content EXACTLY to the sections.
    5. Explicitly list the sections to be built: ${sectionStructure}. Each section container MUST have an ID matching its JSON key (e.g., id="intro_pain") for navigation anchors.
    6. Include specific instructions on animations, spacing, and micro-interactions based on the "${designSettings.visualIntensity}" intensity.
    7. Be structured as a Markdown file.
    8. CRITICAL LAYOUT RULE: The landing page must have a MAXIMUM WIDTH of 1440px (centered container). IMPORTANT: All section content (Hero, Features, Grids, etc.) must occupy this FULL 1440px width. Do not constrict inner content to narrow columns (like 800px or 1000px) unless strictly necessary for a specific text component. The design should feel expansive and premium, utilizing the full 1440px canvas. Must be fully MOBILE RESPONSIVE.
    9. COPYRIGHT RULE: Ensure the footer copyright year is exactly ${currentYear} and does not repeat if the brand name already contains a date.
    10. NAVIGATION: The header navigation links MUST link to the respective section IDs generated in step 4 as anchors (e.g., href="#intro_pain").
    11. LEGAL COMPLIANCE & PAGES (GDPR/RGPD):
        - You MUST generate two additional HTML pages: 'terms.html' and 'privacy.html'.
        - LANGUAGE REQUIREMENT: The content of these pages MUST be written in ${fullLanguageName}.
        - CONTENT: Populate with professional, legally compliant placeholder text respecting RGPD (GDPR) and European Law.
        - FOOTER LINKS: In the main landing page footer, strictly include links to "Terms of Use" and "Privacy Policy" (translated to ${fullLanguageName}).
        

    ADVANCED DESIGN REFINEMENTS:
    12. HERO SECTION: Make the hero content EXTREMELY WIDE. The headline and subheadline should span almost the full width of the container (e.g. max-width: 90% or 1200px). Do not constrain the text to a narrow central column. Ensure headline is visually dominant using large typography, tight line-height, and strong contrast. Ensure no other element competes with it above the fold. Add a slow, subtle animated background (gradient or abstract motion) that adds depth without interfering with foreground text readability. Introduce a minimal scroll indicator that gently animates to suggest continuation without pulling attention away from the hero message.
    13. ICONOGRAPHY: Standardize all icons using a single SVG icon set with consistent stroke weight and add subtle hover animation where relevant.
    14. TYPOGRAPHY & SCALE: Refine typography hierarchy by making all Section Titles (H2) and Section Eyebrows significantly larger and more dominant than standard layouts (e.g., 3.5rem to 5rem for H2). Additionally, ensure section introductory paragraphs (sectionParagraph) use a larger, more authoritative font size (e.g., 1.25rem to 1.5rem) to serve as a high-impact narrative bridge before detailed content blocks.
    15. SPACING: Reduce vertical padding (padding-y) in sections to maintain a high-density, energetic flow (use 40px to 64px instead of massive gaps). Maintain visual balance but eliminate unnecessary air.
    16. NARRATIVE TYPOGRAPHY (PAIN & SOLUTION): 
       - INTRO_PAIN SECTION: STRICTLY NO IMAGES. This section must be a pure typographic experience. Render the 'hook' and 'painStory' as a "Progressive Staggered Statement Stack". Use massive, high-impact display typography (e.g., 6rem to 10rem on desktop) where lines appear sequentially. The focus is entirely on the visceral weight of the words.
       - SOLUTION SECTION: The primary headline must be massive. Subtext must be significantly larger than standard body text (e.g., 1.5rem to 2rem).
    17. SEMANTIC TYPOGRAPHY: Ensure that 'sectionTitle', 'sectionSubtitle', 'headline' and 'subheadline' fields from the JSON are rendered as proper semantic HTML headings (<h1>, <h2>, <h3>) styled with significant font size and weight. Do not render them as plain paragraphs.
    18. BODY TYPOGRAPHY & READABILITY: Body text (paragraphs) must have a minimum font size of 18px (1.125rem) on desktop. STRICT PROHIBITION: Do NOT use 'text-xs' or 'text-sm' classes anywhere in the layout. All text, including labels, footnotes, and secondary details, must be large, legible, and confident (minimum 16px/1rem). Avoid tiny text at all costs.
    19. SECONDARY FEATURES VISIBILITY: CRITICAL RULE for the 'secondaryFeatures' grid. The text for these items MUST be significantly bigger. Use a minimum font size of 1.125rem (18px) for feature descriptions and 1.5rem (24px) for titles. Treat them as primary content, not footnotes. CRITICAL REQUIREMENT: Every secondary feature MUST include a distinct, relevant, context-aware icon (SVG/Lucide) that visually illustrates the specific benefit. Do not use generic checkmarks.
    20. MAIN FEATURES LAYOUT (BENTO GRID): The 'mainFeatures' section contains 4 items. Render them in a distinctive Bento Box Grid layout. CRITICAL VISUAL REQUIREMENT: On desktop, ensure that TWO of the feature cards are WIDER than the others (e.g., utilize 'col-span-2' in a grid or flex-grow) to create visual interest. Avoid a uniform 2x2 grid. The layout must feel asymmetrical and designed. Each card must have a distinct, high-quality, context-aware ICON (Lucide/SVG) as the primary visual anchor alongside the text content.
    
    SPECIAL SECTION LAYOUTS (AS SEEN IN WIREFRAME):
    21. CATEGORIES SECTION (HORIZONTAL SLIDER):
        - Implement as a large, horizontal scrollable slider. 
        - Visual: Cards should be huge, with high-quality imagery (placeholders). 
        - Interaction: Smooth horizontal scroll.
        - Narrative: Title and Subtitle should be positioned to the top left, with custom navigation arrows (Left/Right) positioned to the top right of the section to control the slider. 
        - Typography: Large, confident category titles overlaid or adjacent to the visuals.
    22. ABOUT AUTHOR SECTION (EDITORIAL BIOGRAPHY):
        - Premium editorial split-screen or asymmetrical layout.
        - Visual: One side high-impact author portrait with subtle effects (e.g., grayscale or high contrast). 
        - Content: Bio should use elegant typography with an authoritative feel. 
        - STATS CARD: Include a floating or integrated "Stats Card" (e.g., "10+ Years", "500+ Clients") using bold, large numbers.
    ${highIntensityInstructions}

    CRITICAL:
    Do NOT generate placeholder content. Explicitly instruct the AI to use the "CONTENT DATA" JSON block (which will be provided at the end of the prompt) as the absolute source of truth for all text.

    SPECIFIC STYLE VISUAL DIRECTION TO IMPLEMENT:
    ${specificStyleInstruction}
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate the Ultimate Vibecoding Prompt for this project.\n\nCONTEXT:\n${context}`,
            config: {
                systemInstruction: systemInstruction,
                temperature: 0.7
            }
        });

        const generatedText = response.text || "";
        
        let finalPrompt = generatedText;

        // Explicitly append the visual vibe description to ensuring it's passed exactly
        if (brandKit && brandKit.suggestion) {
            finalPrompt += `\n\n## VISUAL MOODBOARD & ATMOSPHERE (STRICT REFERENCE)\n\nThe design must strictly adhere to the following atmospheric description extracted from reference images:\n\n"${brandKit.suggestion}"\n`;
        }

        // Clean copy data to avoid conflicting design settings and internal metadata
        // IMPORTANT: We explicitly strip 'designRecommendation' to prevent it from leaking into the HTML
        const cleanCopyData = copyData ? JSON.parse(JSON.stringify(copyData)) : {};
        if (cleanCopyData.designRecommendation) {
            delete cleanCopyData.designRecommendation;
        }

        // Append the exact copy data as a JSON block to ensure high fidelity
        // We wrap it in a clear delimiter to ensure the receiving AI knows it's the data source
        finalPrompt += `\n\n## CONTENT DATA (SOURCE OF TRUTH)\n\nUse the following JSON to generate the content for each section exactly. Do not use placeholder text. Map each key in the JSON to a section in the landing page.\n\n\`\`\`json\n${JSON.stringify(cleanCopyData, null, 2)}\n\`\`\``;

        finalPrompt += `\n\nIMPORTANT: take a deep breath and design this step by step. the result should be a premium professional landing page with polished final visuals, ready for launch. use the design and visual style of attached reference images as main inspiration`;

        finalPrompt += `\n\nSTRICT TECH REQUIREMENT: IT IS STRICTLY PROHIBITED TO USE REACT. The code must be pure HTML, CSS, and Vanilla JavaScript.`;

        // Adding user requested rules for Big Typography and Functional Mobile Menu/Animations
        finalPrompt += `\n\nFINAL CRITICAL REQUIREMENTS:\n1. Big Typography: Use large, confident font sizes for headings and key messages to ensure impact.\n2. Functional Interactions: Make sure that the transitions, texts and animations reveal on scroll work perfectly (implement with Vanilla JS). Ensure the mobile menu opens and closes correctly. IMPORTANT: When the mobile menu is open, it must have a proper background (covering the screen) and a clearly visible Close button to exit.`;

        return finalPrompt;
    } catch (e) {
        return "Error generating prompt.";
    }
};

/**
 * Generates a structured JSON object compatible with Elementor's Import Template architecture.
 * Enforces strict Versioning and Template Structure to avoid paste errors.
 */
export const generateElementorCode = async (
    designSettings: DesignSettings,
    copyData: any,
    productName: string,
    brandKit?: BrandKitAnalysis
): Promise<string> => {
    const ai = getAI();
    const sectionsList = Object.keys(copyData).join(', ');
    
    const context = `
    PRODUCT: ${productName}
    DESIGN STYLE: ${designSettings.style}
    COLOR PALETTE: ${designSettings.colorPalette} ${brandKit ? `(Hex Codes from Brand Kit: ${brandKit.colors.join(', ')})` : ''}
    TYPOGRAPHY: ${designSettings.typography}
    VISUAL INTENSITY: ${designSettings.visualIntensity}
    BORDER RADIUS: ${designSettings.borderRadius}
    
    REQUIRED SECTIONS TO GENERATE: ${sectionsList}
    
    COPY CONTENT (JSON): ${JSON.stringify(copyData)}
    `;

    const systemInstruction = `You are an Elementor Core Architect and JSON Compiler.
    
    YOUR MISSION: 
    Convert the provided "Copy Content" and "Design Settings" into a VALID ELEMENTOR TEMPLATE JSON FILE.
    The user will download this JSON and "Import Template" into Elementor. It MUST be a full template structure, not just a widget snippet.

    CRITICAL STYLING RULES (APPLY TO WIDGET SETTINGS):
    1. LAYOUT & SPACING:
       - All Sections MUST be "boxed" content width.
       - Set "boxed_width" to 1440 explicitly in section settings.
       - CRITICAL: Ensure the content inside the section occupies the ENTIRE area (width: 100%) of the 1440px container. Avoid creating narrow inner columns unless necessitated by the grid design.
       - Add generous padding (e.g. 80px-120px top/bottom) to every section to match "${designSettings.visualIntensity}".
    2. COLORS:
       - Extract Hex codes from the Color Palette context.
       - Apply specific "background_color" to alternating sections to create rhythm.
       - Apply "color" to Heading and Text Editor widgets (use dark contrast for light backgrounds, light for dark).
       - Apply "button_text_color" and "button_background_color" to Button widgets.
    3. TYPOGRAPHY:
       - Apply the font family defined in "${designSettings.typography}" to "typography_font_family" settings for all widgets.
       - H1 Headlines: ~48px-64px.
       - Body Text: ~18px minimum.
    4. SHAPES & BORDERS:
       - Apply "border_radius" to buttons and image containers based on "${designSettings.borderRadius}" (e.g. 0px for sharp, 8px for rounded, 50px for pill).

    CRITICAL COMPLETENESS RULE:
    You must generate an Elementor Section for EVERY item in this list: [${sectionsList}].
    Do not skip any section. If a section is "footer_contact", make it a section at the bottom.
    The output MUST be exhaustive.

    CRITICAL CONTENT FIDELITY RULE:
    You MUST USE THE EXACT TEXT provided in the "COPY CONTENT (JSON)". 
    DO NOT SUMMARIZE. DO NOT SHORTEN. DO NOT USE LOREM IPSUM.
    Map the text fields from the JSON to the Elementor Heading and Text Editor widgets.

    CRITICAL JSON STRUCTURE (STRICT ENFORCEMENT):
    The root object MUST follow this schema exactly:
    {
      "content": [ ... array of Elementor sections/widgets ... ],
      "page_settings": {},
      "version": "3.24.0",
      "type": "page",
      "title": "${productName} Landing Page"
    }

    KEY RULES:
    1. "version" MUST be "3.24.0" (or higher) to prevent compatibility errors.
    2. "type" MUST be "page" or "section".
    3. "content": Must be an array of Elementor Section objects ("elType": "section").
    4. "page_settings": Can be empty object {}.
    
    OUTPUT FORMAT:
    - Return ONLY the raw JSON string.
    - Do NOT wrap in markdown code blocks (e.g. no \`\`\`json). 
    - The output must be valid JSON parsable by JSON.parse().
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview', // Using Pro for complex code structure generation
            contents: `Generate the full Elementor Template JSON now. Ensure ALL ${Object.keys(copyData).length} sections are present and populate them with the EXACT text and STYLING provided in the context.\n\nCONTEXT:\n${context}`,
            config: {
                responseMimeType: "application/json",
                systemInstruction: systemInstruction,
                temperature: 0.5 // Lower temp for code accuracy
            }
        });

        let rawText = response.text || "{}";
        
        // Cleanup markdown wrappers if present
        rawText = rawText.replace(/```json\s*/g, "").replace(/```\s*$/g, "");

        return rawText;
    } catch (e) {
        return "Error generating Elementor JSON.";
    }
};

/**
 * Generates Elementor Site Settings JSON (Global Colors/Fonts)
 */
export const generateElementorSiteSettings = async (
    designSettings: DesignSettings,
    productName: string,
    brandKit?: BrandKitAnalysis
): Promise<string> => {
    const ai = getAI();
    const context = `
    PRODUCT: ${productName}
    DESIGN STYLE: ${designSettings.style}
    PRIMARY COLORS: ${brandKit ? brandKit.colors.join(', ') : designSettings.colorPalette}
    TYPOGRAPHY: ${designSettings.typography}
    `;

    const systemInstruction = `You are an Elementor Site Settings Architect.
    Generate a VALID 'site-settings.json' content structure for Elementor.
    
    Structure:
    {
        "settings": {
            "system_colors": [
                { "_id": "primary", "title": "Primary", "color": "#..." },
                { "_id": "secondary", "title": "Secondary", "color": "#..." },
                { "_id": "text", "title": "Text", "color": "#..." },
                { "_id": "accent", "title": "Accent", "color": "#..." }
            ],
            "custom_colors": [],
            "system_typography": [
                { "_id": "primary", "typography_font_family": "..." },
                { "_id": "secondary", "typography_font_family": "..." },
                { "_id": "text", "typography_font_family": "..." },
                { "_id": "accent", "typography_font_family": "..." }
            ],
            "custom_typography": []
        },
        "version": "3.24.0"
    }

    Rules:
    1. Map the provided Color Palette to system_colors (Primary, Secondary, Text, Accent).
    2. Map the Typography settings to system_typography (Primary, Secondary, Text, Accent).
    3. Use appropriate Google Fonts names.
    4. Return ONLY raw JSON.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Generate Elementor Site Settings JSON.\n\nCONTEXT:\n${context}`,
            config: {
                responseMimeType: "application/json",
                systemInstruction: systemInstruction,
                temperature: 0.5
            }
        });

        let rawText = response.text || "{}";
        rawText = rawText.replace(/```json\s*/g, "").replace(/```\s*$/g, "");
        return rawText;
    } catch (e) {
        return "Error generating Site Settings JSON.";
    }
};
