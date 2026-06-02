import { Language, EmailStyle, BrandKit } from "../../types";
import { sanitizeContext, getLangName, EMAIL_SUBJECT_BLACKLIST, getMimeTypeFromBase64 } from "../aiCore";

// --- Meta / Facebook Ads ---

export const getMetaAdSystemInstruction = (lang: Language): string => 
  `You are an elite direct-response copywriter. Your goal is extreme clarity and impact. Strictly use ${getLangName(lang)}. Use informal direct address.`;

export const buildMetaAdPrompt = (
  context: string,
  location: string,
  style: string,
  lang: Language,
  strategicPillar?: string,
  isRefresh: boolean = false
): string => {
  let specificInstruction = "";

  if (style === 'YouTube-Thumbnail') {
      specificInstruction = "YOUTUBE THUMBNAIL FOCUS: Escreve um título incrivelmente curto, impactante e que gere curiosidade extrema (inspiração Mr. Beast). O foco deve estar em pouquíssimas palavras que causem choque ou desejo. O subtítulo deve apenas reforçar o choque e o copy principal deve ser direto e vibrante.";
  } else if (style === 'Pop-Culture-Twist') {
      specificInstruction = "POP CULTURE TWIST: Create clever pop culture wordplay inspired by movies, music, or iconic phrases. Use humor that fits the product. Twist references creatively, never copy quotes exactly. Goal: Stop the scroll with a smart cultural wink.";
  } else if (style === 'Short-Human') {
      specificInstruction = "SHORT-HUMAN: RAW EMOTION. Write as a real person sharing a visceral moment related to the product and the specific ICP journey. Vulnerable, urgent, and unfiltered. Use any emojis that fit the mood. TOTAL CHARACTERS must be strictly under 240. It should feel like an authentic, honest message from one human to another.";
  } else if (style === 'UGC/Raw') {
      specificInstruction = "UGC/RAW FOCUS: O estilo deve ser extremamente real, amador, credível e orgânico. CRITICAL REQUIREMENT FOR visualPrompt: O campo \"visualPrompt\" de retorno DEVE obrigatoriamente começar por: \"foto natural raw unedited tirada do iphone ugc style, com fundo simples com pouco ruído visual\" e descrever o produto ou uma pessoa em contexto de uso real de forma amadora.";
  } else if (style === 'Unique-Mechanism') {
      specificInstruction = `UNIQUE MECHANISM FOCUS: Your core focus is to explain and sell the UNIQUE MECHANISM of this product. Use this specific concept provided: "${strategicPillar}". Explain why this makes the result inevitable and superior to all common alternatives.`;
  } else if (style === 'Emotional-Driver') {
      specificInstruction = `EMOTIONAL DRIVER FOCUS: Your core focus is the deep emotional benefit of the product. Use this specific psychological trigger: "${strategicPillar}". Don't just list features; paint the picture of the final emotional state of the buyer.`;
  } else if (style === 'Viral-Angle') {
      specificInstruction = `VIRAL ANGLE FOCUS: Use this high-potential viral spark: "${strategicPillar}". Design the ad to be highly shareable, using controversy, massive results, or unique visual hooks.`;
  } else if (style === 'Product-First') {
      specificInstruction = "PRODUCT-FIRST FOCUS: Your goal is to write a perfect ad copy focusing 100% on the product itself. Keep it extremely pragmatic, short, direct, and written at a 4th grade level (simple vocabulary, short sentences, direct statements, objective and easy to read). Highlight direct utility, features, and specs clearly. No complex metaphors, stories, or emotional fluff.";
  } else if (style === 'Storytelling') {
      specificInstruction = "STORYTELLING FOCUS: Weave a captivating narrative context, starting with an immersive story hook that puts the reader in a high-stakes scenario. Build tension and reveal the product naturally as the hero/solution of the story.";
  } else if (style === 'Product-Hero' || style === 'Minimalist') {
      specificInstruction = "PRAGMATIC. Focus 100% on technical features, design, and direct utility. Ignore emotional hooks.";
  } else {
      specificInstruction = "ICP-FOCUSED. Use empathy, pain points, desires, and psychological transformation. Focus 100% on potential psychological triggers derived from the product description.";
  }

  const refreshPrompt = isRefresh ? "REFRESH REQUEST: The user wants a DIFFERENT variation. Do not repeat previous copy." : "";

  return `Generate a high-conversion advertisement for social media (Facebook/Instagram).
  
  STYLE/ANGLE: ${style}
  LOCATION/MARKET: ${location}
  
  PRODUCT DATA:
  ${sanitizeContext(context)}
  
  COPYWRITING GUIDELINES:
  ${specificInstruction}
  ${refreshPrompt}
  
  INSTRUÇÕES CRÍTICAS DE LINGUAGEM:
  1. O copy deve ser persuasivo e focado no estilo "${style}". STRICT REQUIREMENT: Answer strictly in ${getLangName(lang)}.
  2. Não uses placeholders. Escreve texto final pronto para publicar.
  3. REGRAS DE TRATAMENTO OBRIGATÓRIO: Dirige-te ao utilizador estritamente por "TU". NÃO uses "Você".
  4. RESTRIÇÃO DE ESPAÇO: 
     - "headline": ${style === 'YouTube-Thumbnail' ? 'Máximo 3/4 palavras. Muito curto e chocante (ex: "Fiz isto durante 30 dias!", "O segredo revelado!").' : 'Máximo 35 caracteres.'}
     - "subheadline": ${style === 'YouTube-Thumbnail' ? 'Máximo 25 caracteres.' : 'Máximo 40 caracteres.'}
  
  ${style !== 'YouTube-Thumbnail' && style !== 'Product-First' && style !== 'Storytelling' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST start exactly with: "foto natural raw unedited tirada do iphone ugc style, com fundo simples com pouco ruído visual, " followed by a description of the scene in a realistic, amateur, and candid setting. Never describe generic commercial studio setups, stock photos, clean-cut vectors, or 3D renderings.` : style === 'Product-First' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe a high-quality professional product photography setup. The "visualPrompt" field MUST start exactly with: "fotografia de alta qualidade do produto, tirada numa canon eos r50, lente 85mm com shallow depth of field, iluminação de estúdio profissional, cinematic, fundo clean sem ruído, " followed by a description of the product in a pristine and elegant studio setting. Do NOT include or describe any text, lettering, or overlays on the image itself. The prompt description must contain exactly zero text overlay instructions. Keep it strictly visual.` : style === 'Storytelling' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe an epic, high-end cinematic Hollywood scene. The "visualPrompt" field MUST start exactly with: "foto cinematográfica estilo hollywood, ângulo inclinado de dutch angle dramático, iluminação de estúdio estilosa com alto contraste, cores premium com tonalidades teal e orange e sombras profundas, composição dinâmica e elegante, " followed by a storytelling scene description that matches the core narrative.` : ''}`;
};

// --- Image Generation ---

export const buildCreativeImagePrompt = (
  prompt: string,
  style?: string,
  composition?: string,
  brandKit?: any,
  lang: Language = 'en',
  hasBaseImages: boolean = false
): string => {
  let styleRules = "";

  if (style === 'Direct-Response') {
    styleRules = `
    High-Converting Instagram Image Ad
    ROLE
    Create a static Instagram ad that instantly stops scrolling, triggers emotion and communicates a clear, strong value proposition.
    ${hasBaseImages ? 'The design must follow the visual style of the reference image (colors, fonts, shapes, background, composition and mood).' : ''}

    OBJECTIVE
    The ad must:
    • Capture attention within 1 second
    • Deliver a strong transformation or BIG PROMISE
    • Clearly show how the result is achieved
    • Be emotionally engaging and instantly understandable

    STRUCTURE
    Headline: Primary scroll stopper. Must carry most of the conversion weight. Clear, concise, bold, emotion or outcome focused, curiosity or desire driven.
    Visual Context: Must reinforce the promise through product display, transformation moment, lifestyle outcome, usage demonstration or before/after effect.
    Call to Action: Clear, natural and visually noticeable. Encourages immediate action.
    CRITICAL CONSTRAINT: Do NOT include any secondary subheadlines, secondary subtitles, or extra supporting text blocks on the visual image itself. Only show the primary main Headline and the CTA to ensure maximum aesthetic purity and direct response power.

    COPY RULES
    Focus on outcomes and transformation. Use short, punchy and clear messaging. Combine emotional trigger with logical credibility. Avoid generic marketing language. Do NOT write or place a subheadline.

    TEXT QUALITY
    All text must be fully legible, error-free, and use correct language. Text must be optimized for mobile readability and maintain strong contrast.
    CRITICAL: ALL GENERATED TEXT INSIDE THE IMAGE MUST BE IN ${getLangName(lang).toUpperCase()}.

    VISUAL RULES
    ${hasBaseImages ? 'Replicate the reference visual style. Maintain brand consistency and clean hierarchy. Ensure balanced layout, strong contrast and Instagram feed optimization.' : 'Maintain brand consistency and clean hierarchy. Ensure balanced layout, strong contrast and Instagram feed optimization.'}

    OUTPUT
    Generate a cohesive, emotionally persuasive, high-converting Instagram ad with a single scroll-stopping headline, NO subheadline, and perfectly legible text ${hasBaseImages ? 'aligned with the reference style' : ''}.
    `;
  } else if (style === 'Stop-the-Scroll') {
    styleRules = `
    Stop the Scroll Rules:
    The ad must interrupt scrolling within 1 second through strong visual hierarchy and composition.
    Use one dominant focal point. Avoid clutter or competing elements.

    Apply at least one of the following techniques:
    • Extreme scale contrast (oversized headline, macro detail, large emotional subject)
    • Off-center or cropped framing to create tension and curiosity
    • Directional gaze, motion or visual flow guiding attention toward headline or product
    • Strong contrast between subject and background
    • Visible transformation or action moment
    • Strategic negative space to highlight the message
    • Depth and layering to create realism and immersion

    Mobile readability is mandatory. The focal point and headline must remain clear when viewed quickly on a phone.
    Avoid symmetrical, static or overcrowded layouts.
    Goal: create immediate attention, curiosity and message clarity.
    `;
  } else if (style === 'Short-Human') {
    styleRules = `
    Short-Human / High-Converting Facial Emotion & Body Language Rules:
    If people appear, their facial expression and body language must reinforce the emotional promise of the ad.
    Emotion must be instantly readable. Neutral or passive expressions are not allowed.

    Facial expressions must:
    • Match the headline emotion
    • Feel authentic and natural
    • Be clearly visible on mobile

    Use emotional alignment:
    • Desire or success → confident smile, proud posture
    • Relief or solution → relaxed face, soft smile
    • Curiosity → focused gaze, subtle surprise
    • Emotional bonding → laughter, touch, eye contact
    • Pain point → visible frustration before transformation

    Body language must communicate engagement, confidence, connection or product interaction. Avoid stiff or stock-like poses.

    Eye direction must be intentional:
    • Toward viewer for connection
    • Toward product or headline for guidance
    • Between subjects for storytelling

    Faces must be large enough, well lit and clearly visible.
    Goal: create emotional resonance, trust and identification with the viewer.
    `;
  } else if (style === 'Secret Insider' || style === 'Secret Info') {
    styleRules = `
    Secret Info / Insider Rules:
    Confidential aesthetic, report overlay, blurred sensitive sections, highlighted areas, secondary inset image, subtle grain.
    Goal: Create a sense of exclusivity, leaked information, or insider knowledge.
    `;
  } else if (style === 'Social Gossip') {
    styleRules = `
    Social Gossip Rules:
    Viral social post layout, primary image plus small secondary inset image, expressive faces, gossip/news vibe, high contrast, scroll-stopping composition.
    CRITICAL: NO UI ELEMENTS. Do not include share icons, comment buttons, likes counts, footer text, or app interface overlays.
    `;
  } else if (style === 'Breaking News') {
    styleRules = `
    Breaking News Rules:
    News broadcast aesthetic, breaking news lower third graphic style, 'LIVE' or 'URGENT' visual indicators, high contrast, bold typography, journalistic photography style.
    Goal: Create an immediate sense of urgency and importance that stops the scroll.
    `;
  } else if (style === 'YouTube-Thumbnail') {
    styleRules = `
    YouTube Thumbnail Rules:
    highly expressive face (shock, awe, confident smirk, or intense stare), dynamic and exaggerated pose, bold lighting, punchy extreme contrast, MASSIVE focus entirely on the subject. CRITICAL FOR BACKGROUND: Use ultra-simple, vibrant, solid or gradient flat backgrounds (like solid Mr Beast style blue, yellow, or red) with ZERO clutter. Huge negative space for text. Viral youtube thumbnail style. Add a thick, high-contrast stroke outline (white or vibrant color) around the main person/subject to cut them out perfectly. CRITICAL FOR TEXT: Incorporate exactly ONE very short headline (1 to 3 words max). The text MUST have extreme 3D effects, massive bold fonts, embossed pop effects, thick outlines, and heavy drop shadows to make it pop aggressively off the background.
    Goal: Create a Mr Beast style high-click-through-rate visual that triggers intense curiosity and urgency. The subject must be huge and pop aggressively against a very simple, solid/gradient impactful background with highly readable, prominent clickbait 3D 1-3 word text.
    `;
  } else if (style === 'Highlight Method') {
    styleRules = `
    Highlight Method Rules:
    Focus on a specific feature, benefit, or word. Use visual highlighters (like a neon marker effect), circles, or arrows to draw immediate attention to the most important part of the image or text.
    High contrast, clean background to make the highlighted element pop.
    Goal: Direct the viewer's eye instantly to the core value proposition or key feature.
    `;
  } else if (style === 'UGC/Raw') {
    styleRules = `
    UGC / Raw Aesthetic Rules:
    visualPrompt: O estilo de imagem DEVE ser: "foto natural raw unedited tirada do iphone ugc style, com fundo simples com pouco ruído visual".
    No professional studio lighting, 3D renderings, stock photos, clean-cut synthetic graphics or commercial setup.
    It must look real, authentic, casual and natural, as if taken directly by an everyday user on a smartphone.
    `;
  } else if (style === 'Product-First') {
    styleRules = `
    Product-First Creative Rules:
    Goal: Attention grabbing Professional Realistic product presentation focusing 100% on the physical product
    • STYLE: a Scroll Stopper Realistic studio photography with raw unedited look.
    • LIGHTING: Professional studio lighting, cinematic, clean gradients, soft highlights.
    • CAMERA: Captured on a Canon EOS R50 with an 85mm lens, shallow depth of field, sharp detail on the product itself.
    • COMPOSITION: Clean background with zero noise, minimal modern setting.
    • NO TEXT OVERLAYS: There must be absolutely no text, typography, letters, words, or overlays in the image prompt or scene. Focus strictly on any visual/realistic details of the physical product. Do not place any text.
    `;
  } else if (style === 'Storytelling') {
    styleRules = `
    Storytelling Creative Rules:
    Goal: Create an epic, premium cinematic scene with extreme mood and high aesthetic quality.
    • STYLE: Exquisite Hollywood movie still aesthetic with movie LUT. Stylish, premium, sophisticated.
    • COMPOSITION & CAMERA WORK: Exaggerated dramatics Dutch angle (tilted camera level), dynamic and non-traditional composition that breaks rules of balance to create high tension, cinematic wide lens perspective.
    • LIGHTING: Dramatic high-contrast studio lighting, backlighting, moody shadows, rim light.
    • COLOR GRADING: Stylish premium color tones LUT, deep rich black levels.
    • THEME: Artistic narrative representation that tells a powerful story in a single stylish shot.
    `;
  } else {
    // Default / General fallback
    styleRules = `
    TASK: Professional Commercial Photography.
    SCENE & SETTING: ${prompt}.
    TECHNICAL: Photorealistic, 8k, studio lighting.
    `;
  }

  const rawUgcOverride = (style !== 'YouTube-Thumbnail' && style !== 'Product-First' && style !== 'Storytelling') ? `
    CRITICAL IMAGE STYLE OVERRIDE (INSTAGRAM MANDATORY STYLE):
    • OVERRIDE ESTHETIC: "foto natural raw unedited tirada do iphone ugc style, com fundo simples com pouco ruído visual".
    • The scene must look completely real, raw, candid, authentic, and amateur as if taken on an everyday smartphone camera (iPhone).
    • The background MUST have minimal details, a simple setting, and very low visual noise / clutter.
    • Avoid all signs of: professional studio setups, artificial lighting, sterile stock setups, clean 3D renderings, flawless commercial design setups, or pristine synthetic visuals.
  ` : "";

  return `
    ${rawUgcOverride}
    ${styleRules}

    SPECIFIC CONTEXT FOR THIS GENERATION:
    VISUAL DESCRIPTION: ${prompt}
    CAMERA ANGLE: ${composition || "Medium Shot"}.
    ${hasBaseImages ? `FOUNDATION ASSET(S): Use the provided product image(s) as the absolute base and hero of the composition. You may be provided with multiple reference images; use them to understand the product from different angles or contexts.
    CRITICAL RULE: The product from the image reference MUST be the primary focus and foundation shot. 
    CONSTRAINT: DO NOT PLACE reference images on the back of computers, smartphones, etc.` : 'FOUNDATION ASSET(S): No reference images provided. Generate a high-quality visual based strictly on the description.'}
    ${brandKit ? `Mood/Tone: ${brandKit.tone}.` : ''}
    
    LANGUAGE RULE:
    CRITICAL: IF ANY TEXT IS GENERATED INSIDE THE IMAGE, IT MUST BE IN ${getLangName(lang).toUpperCase()}.
    `;
};

// --- Search Ads ---

export const buildSearchAdsPrompt = (
  productContext: string,
  location: string,
  lang: Language,
  customDirection?: string
): string => {
  const directionContext = customDirection ? `\n\nUSER DIRECTION: ${customDirection}\n\n` : "";
  return `Generate high-performance RSAs for product (Excluding Strategy):\n${sanitizeContext(productContext)}.\nMarket: ${location}.${directionContext}
            STRICT REQUIREMENT: Answer strictly in ${getLangName(lang)}.
            REQUISITOS OBRIGATÓRIOS:
            1. Identifica INTENÇÕES DE PESQUISA. DEVES GERAR OBRIGATORIAMENTE UMA CATEGORIA DE INTENT "GLOBAL", que seja mais pragmática, otimizada para CTR máximo e com keyword research altamente preciso e focado em conversão. Inclui outras intenções (Price, Brand, Comparison, Urgent).
            2. Para cada intenção, gera EXATAMENTE 4 anúncios RSAs distintos.
            3. Títulos (Headlines): Máximo 30 caracteres.
            4. Descrições (Descriptions): Máximo 90 caracteres.
            5. Caminhos (Paths): Máximo 15 caracteres.
            6. Para cada anúncio individual dentro do grupo, fornece uma lista de 6 a 8 palavras-chave de intenção de busca específicas e NÃO genéricas (especialmente na categoria GLOBAL, onde a precisão é crítica).
            7. Inclui ativos (Sitelinks, Callouts, Structured Snippets).
            `;
};

// --- Email Marketing ---

export const buildEmailCampaignPrompt = (
  context: string,
  location: string,
  category: string,
  style: EmailStyle,
  lang: Language
): string => {
  const styleInstruction = style === 'Human-Written' 
      ? "Write as a personal, one-on-one message. Plain text only. No HTML. Direct and warm. Focus on authentic human connection. STYLE: Short sentences. Few commas. Avoid complex clauses. Write like a human typing quickly on a phone. Use short paragraphs (max 2-3 sentences) for better pacing and white space. The call-to-action or link at the end must be in **bold text** without any special color." 
      : "Write as a structured rich-text Newsletter. USE HTML FORMATTING TAGS for the body content: use <h3> for subheadings, <p> for paragraphs, <ul> and <li> for feature lists, <strong> for emphasis. Organize the content into clear semantic sections. Make it look professional and well-formatted.";

  const blacklistInstruction = `CRITICAL: The email 'subject' field MUST NOT contain any of the following restricted terms to ensure high deliverability (Blacklist): ${EMAIL_SUBJECT_BLACKLIST.join(', ')}. Use creative alternatives.`;
  
  const varianceInstruction = `VARIETY RULE: This is a REFRESH request. Do not use the same hooks, subject lines, or opening sentences as a standard template. Create a unique narrative path for this specific sequence.`;

  return `You are a senior email strategist. Create a sequence (3-4 emails) for category/angle: "${category}".
            
            STYLE: ${styleInstruction}
            ${blacklistInstruction}
            ${varianceInstruction}

            PRODUCT CONTEXT (Excluding Strategy):
            ${sanitizeContext(context)}
            
            Market: ${location}
            
            RULES:
            1. NO marketing jargon.
            2. For HTML Newsletter style: The 'body' field must contain valid HTML tags (p, h3, ul, li, strong, etc.).
            3. For Human-Written style: Plain text with natural line breaks. NO HTML TAGS.
            4. Sound human.
            5. Primary Action: A natural next step suggested at the end of the content. NO button labels.
            
            Output strictly in ${getLangName(lang)}.`;
};

// --- Storyboard ---

export const buildStoryboardPrompt = (
  context: string,
  location: string,
  lang: Language
): string => {
  return `Generate a high-conversion Storyboard for a 30-45s TikTok/Reels video.
            
            STRATEGY CONTEXT:
            ${sanitizeContext(context)}
            
            CINEMATIC VARIETY IS MANDATORY. 
            DIRETRIZES DE SCRIPT E VISUAIS:
            1. Usa o framework de Direct Response (Hook -> Pain -> Mechanism -> Proof -> CTA).
            2. O Voiceover deve ser conversacional e rápido.
            3. O On-Screen Text deve ser curto e impactante.
            4. CINEMATIC VARIETY (MANDATÓRIO): Cada cena deve tel um enquadramento diferente.
            5. O "imagePrompt" deve ser extremamente descritivo para uma IA geradora.
            6. Forneça uma sugestão de "viralMusicTrack" (música viral em alta) que se encaixe perfeitamente no vídeo.
            STRICT REQUIREMENT: Respond exactly in ${getLangName(lang)}. 
            Use local nuances for ${location}.`;
};

export const buildSceneRefreshPrompt = (
  context: string,
  scene: any,
  lang: Language
): string => {
  return `Rewrite specific Scene ${scene.number} for this storyboard.
            
            PRODUCT CONTEXT:
            ${sanitizeContext(context)}
            
            CURRENT SCENE (To Refresh/Change):
            ${JSON.stringify(scene)}
            
            TASK: Generate a NEW version of this scene. Keep the same "energyTag" and role in the story, but change the specific copy, visual action, and image prompt to offer a different creative option.
            
            STRICT REQUIREMENT: Answer exactly in ${getLangName(lang)}.`;
};

// --- Industry News ---

export const buildNewsStreamPrompt = (
  industry: string,
  location: string,
  productContext: string,
  buyerContext: string,
  lang: Language,
  existingHeadlines?: string[]
): string => {
  const excludeHeadlines = existingHeadlines || [];
  return `Find at least 7 distinct, highly relevant items for ${location}.
    
    CONTEXT:
    1. INDUSTRY: ${industry}. 
    2. PRODUCT: ${productContext || 'N/A'}. 
    3. TARGET AUDIENCE: ${buyerContext || 'N/A'}.
    ${excludeHeadlines.length > 0 ? `4. EXCLUDE HEADLINES: ${excludeHeadlines.join(', ')}` : ''}
    
    STRATEGY:
    1. First, attempt to find as many REAL NEWS articles from the last 15 days as possible using Google Search.
    2. IF YOU CAN FIND 7 NEWS ARTICLES, you MUST fill the remaining slots with 'DATA-BACKED INDUSTRY TRENDS'.
    
    FOR REAL NEWS:
    - Must be from last 15 days.
    - 'url': Copy the EXACT URL returned by Google Search.
    - 'snippet': Summarize the news event clearly.
    
    FOR TRENDS (Fallback):
    - Title: The Trend Name (e.g. 'Rise of AI in Manufacturing').
    - Source: Set this to 'Market Trend' or the name of a Study/Report.
    - Date: 'Current' or 'Q3 2024'.
    - Snippet: THIS IS CRITICAL. The snippet MUST contain HARD NUMBERS, STATISTICS, or citations of specific studies. (e.g. "Market grew by 45%...", "Study by X shows...", "$5B valuation...").
    - URL: Link to a relevant report or authority page on this topic.
    
    IMPORTANT SORTING RULE:
    - ORDER BY DATE DESCENDING (NEWEST FIRST). The most recent news or most current trends must be at the beginning of the list.
    
    OUTPUT:
    - Return valid JSON Array.
    - Response strictly in ${getLangName(lang)}.`;
};

// --- LinkedIn ---

export const buildLinkedInPrompt = (
  context: string,
  buyerContext: string,
  newsItem: any | null,
  style: string,
  lang: Language
): string => {
  let specificAngleInstruction = "";
    if (style === 'Congratulations / Achievement') {
        specificAngleInstruction = `CONGRATULATIONS ANGLE: Write a post celebrating a milestone or achievement relevant to the industry. 
        CRITICAL: DO NOT MENTION YOUR PRODUCT. DO NOT SELL. 
        Focus purely on networking, community support, and professional recognition. 
        Be sincerely happy for others in the industry. It's about relationship building.`;
    } else if (style === 'News Commentary') {
        specificAngleInstruction = `NEWS COMMENTARY ANGLE: Provide a thoughtful, expert perspective on recent industry changes or a specific news item.
        CRITICAL: DO NOT PITCH THE PRODUCT. DO NOT LINK TO THE PRODUCT.
        Focus on adding value through analysis, predicting trends, or asking intellectual questions.
        Be an authoritative observer, not a vendor. 
        STRUCTURAL RULE: Use whitespace.`;
    } else if (style === 'Short / Provocative (Tweet)') {
        specificAngleInstruction = `SHORT / PROVOCATIVE ANGLE: Write a very short, punchy, Twitter-style LinkedIn post (under 280 characters).
        CRITICAL: Use a provocative, slightly humorous, or ironic statement about the industry or a common pain point.
        TONE: Intelligent and acidic (witty/sarcastic) but use accessible language (8th grade reading level).
        STYLE ELEMENTS: Incorporate logical fallacies (used ironically), funny terms, sharp analogies, or adapt popular sayings (ditados populares) to the business context.
        Structure: One or two sentences maximum. No fluff. Maybe one emoji.
        Goal: Get a quick laugh or a "so true" reaction. High engagement through brevity and wit.`;
    }

    const newsContext = newsItem 
        ? `LINKED NEWS CONTEXT: Title: "${newsItem.title}". Snippet: "${newsItem.snippet}". Source: ${newsItem.source}. URL: ${newsItem.url}. TASK: Use this news as the springboard/hook for the post.`
        : `NO NEWS SELECTED. TASK: Choose a relevant topic based on the style "${style}" relevant to the ICP described below.`;

  return `Write a B2B LinkedIn post that feels RAW, AUTHENTIC, and HUMAN. 
            
            STYLE/ANGLE: ${style}
            ${specificAngleInstruction}
            PRODUCT CONTEXT: ${sanitizeContext(context)}
            BUYER CONTEXT: ${sanitizeContext(buyerContext)}
            ${newsContext}
            
            CRITICAL "ANTI-AI" & READABILITY RULES:
            1. NO "In the world of..." or "Let's dive in" intros. Start directly with the core insight.
            2. NO MARKDOWN LISTS WITH DASHES (-). Use natural paragraphs or simple line breaks.
            3. NO DEFINITIONS. Assume the audience is expert but keep language extremely simple (7th grade level).
            4. TONE: Informal and conversational. Speak generally about the industry or the topic. 
            5. ADDRESSING THE READER: DO NOT address the reader directly as "you", "tu", or "você". Use first-person plural ("we", "nós") or objective/neutral third-person phrasing. 
            6. STYLE: Short sentences. Very few commas. Eliminate complex clauses.
            7. PACING: Natural whitespace. Avoid big blocks of text.
            8. STRUCTURE: Short hook. Raw insight. Strong conclusion. End with a statement or open thought.
            9. AVOID: "Unlock", "Unleash", "Elevate", "Game-changer", "Landscape", "Realm", "Foster".
            
            Output strictly in ${getLangName(lang)}.`;
};

// --- Phone Scripts ---

export const buildPhoneScriptPrompt = (
  context: string,
  location: string,
  direction: string,
  lang: Language
): string => {
  return `Generate 4 distinct Phone Outreach Scripts.
            
            PRODUCT CONTEXT:
            ${sanitizeContext(context)}
            
            CUSTOM DIRECTION: ${direction || 'Focus on value and help.'}
            LOCATION: ${location}
            
            OUTPUT:
            Return exactly 4 script variations.
            Output strictly in ${getLangName(lang)}.
            
            CORE PRINCIPLES (NON-NEGOTIABLE)
            No sales talk
            No hype
            No clichés ("how are you?", "I'm calling because...", "to present a solution")
            No long introductions
            No pressure

            Tone:
            Calm
            Direct
            Respectful
            Curious
            Human

            REQUIRED OUTPUT STRUCTURE PER SCRIPT:
            1. Opening Line (Permission-based): Short, natural, acknowledges interruption, gives control. Example style (do not copy): "I'll be very direct so I don't take up your time..."
            2. Reason for the Call (Relevance): One clear reason, based on context, focused on them.
            3. Helpful Observation: Simple, grounded observation showing homework. No assumptions.
            4. Soft Question (Conversation Starter): Open-ended, easy to answer, designed to understand not pitch.
            5. Exit Line (Low Pressure): Easy out, removes tension, preserves trust.`;
};

// --- Software Recommendations ---

export const buildSoftwareRecommendationsPrompt = (
  productContext: string,
  campaignContext: string,
  location: string,
  lang: Language,
  customDirection?: string
): string => {
  return `Generate exactly 3 recommended web tools, software platforms, mobile applications, or Google Chrome extensions specifically curated for the end-user/final target customer of this product. These should provide extreme value to the end-users, helping them achieve their goals, simplify their workflows, or solve their core pain points in relation to this business.
            
            PRODUCT CONTEXT:
            ${sanitizeContext(productContext)}
            
            CAMPAIGN CONTEXT:
            ${sanitizeContext(campaignContext)}
            
            CUSTOM DIRECTION/PREFERENCES: ${customDirection || 'Focus on useful, practical digital tools, mobile apps, or browser extensions that make the end-user\'s life significantly easier.'}
            LOCATION: ${location}
            
            OUTPUT:
            Return exactly 3 tools/platforms/extensions.
            Output strictly in ${getLangName(lang)}.
            
            CRITICAL: This is NOT a growth hack or marketing outreach bot clone for outbound prospecting. Instead, suggest highly practical digital utilities, software, or tools that the end-user (your client\'s customer) can use to get maximum value. 
            
            For each recommended tool, you MUST provide:
            1. name: Name of the software/extension/tool (e.g. Notion, Canva, Loom, Trello, ChatGPT, Miro, or specialized niche apps fitting the product\'s audience)
            2. category: The category (e.g. Productivity, Financial Tracker, Content Design, Communication, Deep Work)
            3. overview: Explain what this tool is and how it helps the customer achieve their Jobs to be done in their day-to-day life/workflow.
            4. objective: Clear objective of why they should use this specific digital tool.
            5. ultimateOutcome: What constitutes a spectacular outcome of using this tool successfully (e.g. "A beautifully organized content calendar updated in under 10 minutes a week").
            6. why: Why this tool is a perfect fit for this specific audience or problem.
            7. aiAgent: Specify the primary digital utility, main feature, or integrated AI assistant they should use within that tool (e.g. "ChatGPT Copywriting Assistant", "Notion AI Content Organizer", "Loom Video Recorder").
            8. subAgents: Recommended companion tools or browser extensions (name, role, and a list of skills) to maximize their experience with the primary tool.
            9. initialPrompt: Practical setup instructions, custom templates, or copy-paste prompts (minimum 2 paragraphs) that the user can copy into that tool or an AI platform to get started immediately.
            10. tasks: A list of 4-6 specific, actionable steps/tasks they can follow to config and run this tool.
            `;
};

