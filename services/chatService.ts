
import { getAI, getModel, sanitizeContext } from "./aiCore";
import { Product, Language, StrategyStep, ChatMessage } from "../types";

export const generateExpertChatStream = async function* (
  product: Product,
  history: ChatMessage[],
  language: Language = 'en'
): AsyncGenerator<string> {
  const ai = getAI();
  const context = sanitizeContext(product);
  const langName = language === 'pt' ? 'Português (Portugal)' : (language === 'es' ? 'Español' : 'English');

  const systemInstructionText = `
    You are a Strategic Growth Advisor. Your goal is to provide high-impact strategy to scale "${product.name || 'this product'}".
    
    CRITICAL CONTEXT (MANDATORY SOURCE OF TRUTH):
    ${context}
    
    STRICT RULES:
    1. EXCLUSIVE CONTEXT: Every recommendation must be derived from the product data provided above. Never give general marketing advice.
    2. DEPTH & SUBSTANCE: Provide well-developed, insightful strategic advice. Explain the "why" behind your suggestions using the product's specific strengths or market positioning.
    3. NO LABELS: Never use terms like "Pragmatic Action", "Quick Win", or "Core Insight" as headers. 
    4. NO PERSONA MENTIONS: Do not introduce yourself or mention your persona (e.g., don't say "As a growth hacker...").
    5. BREVITY & SCANMABILITY: Max 200 words. Use bullet points for tactical steps and bold text for key priorities. Use H4 headers for main strategic pillars only.
    6. TONE: Strategic, direct, and elite partner. No fluff, no "I am an AI". Jump straight to the strategy.
    7. LANGUAGE: Speak fluently in ${langName}. Use "TU" (PT) or "YOU" (EN).
  `;

  const contents = history.map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }]
  }));

  const responseStream = await ai.models.generateContentStream({
    model: "gemini-3.5-flash",
    config: {
      systemInstruction: systemInstructionText
    },
    contents: contents,
  });

  for await (const chunk of responseStream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
};

export const generateDynamicSuggestions = async (
  product: Product,
  history: ChatMessage[],
  language: Language = 'en'
): Promise<string[]> => {
  const ai = getAI();
  const context = sanitizeContext(product);
  const langName = language === 'pt' ? 'Português (Portugal)' : (language === 'es' ? 'Español' : 'English');

  const systemInstruction = `
    You are a Strategic Growth Advisor. Based on the product and chat history, suggest 3 short, punchy follow-up questions or actions.
    
    PRODUCT CONTEXT:
    ${context}
    
    RULES:
    1. Suggestions must be EXTREMELY specific to the product and the last exchange.
    2. Max 6 words per suggestion.
    3. Return ONLY a JSON array of strings.
    4. Language: ${langName}.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      },
      contents: history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })),
    });

    const suggestions = JSON.parse(response.text || "[]");
    return Array.isArray(suggestions) ? suggestions.slice(0, 3) : [];
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return [];
  }
};

export const getSuggestedPrompts = (product: Product, language: Language = 'en', activeStep?: StrategyStep): string[] => {
    const isPT = language === 'pt';
    
    const stepSuggestions: Record<StrategyStep, string[]> = {
        product: isPT 
            ? ["Como posso melhorar a descrição do produto?", "Que outros nichos posso explorar?", "Este produto é escalável?"]
            : ["How can I improve the product description?", "What other niches can I explore?", "Is this product scalable?"],
        dream_buyer: isPT
            ? ["Onde é que este avatar passa o tempo online?", "Quais são as 3 maiores dores deste público?", "Como posso validar este avatar rapidamente?"]
            : ["Where does this avatar spend time online?", "What are the top 3 pains of this audience?", "How can I validate this avatar quickly?"],
        market_intel: isPT
            ? ["Qual é a maior fraqueza dos meus concorrentes?", "Analisa o meu Lean Canvas", "Como posso diferenciar-me no preço?"]
            : ["What is the biggest weakness of my competitors?", "Analyze my Lean Canvas", "How can I differentiate on price?"],
        offer: isPT
            ? ["Cria um bónus irresistível para esta oferta", "Como reduzir o risco para o cliente?", "Esta oferta é demasiado complexa?"]
            : ["Create an irresistible bonus for this offer", "How to reduce risk for the customer?", "Is this offer too complex?"],
        campaign_plan: isPT
            ? ["Sugere um Growth Hack para 24h", "Qual o melhor canal para começar?", "Como automatizar este funil?"]
            : ["Suggest a 24h Growth Hack", "What is the best channel to start?", "How to automate this funnel?"],
        creatives: isPT
            ? ["Cria um hook viral para este anúncio", "Que imagens funcionam melhor aqui?", "Analisa o tom deste creative"]
            : ["Create a viral hook for this ad", "What images work best here?", "Analyze the tone of this creative"],
        sales_page: isPT
            ? ["Melhora a headline da minha sales page", "Falta prova social aqui?", "Como aumentar a conversão no checkout?"]
            : ["Improve my sales page headline", "Is social proof missing here?", "How to increase checkout conversion?"],
        blueprint: isPT
            ? ["Qual é o próximo passo prático?", "Ajuda-me a priorizar as tarefas", "Como escalar esta operação?"]
            : ["What is the next practical step?", "Help me prioritize tasks", "How to scale this operation?"]
    };

    if (activeStep && stepSuggestions[activeStep]) {
        return stepSuggestions[activeStep];
    }

    if (isPT) {
        return [
            "Quais são os 3 quick wins para este produto?",
            "Sugere um funil de automação agentic para leads",
            "Como posso 'hackear' o crescimento no LinkedIn?",
            "Encontra falhas na minha lógica de Power Offer",
            "Cria uma estratégia de conteúdo viral e escalável"
        ];
    }
    return [
        "What are 3 quick wins for this product?",
        "Suggest an agentic automation funnel for leads",
        "How can I 'hack' growth on LinkedIn?",
        "Find flaws in my Power Offer logic",
        "Create a viral and scalable content strategy"
    ];
};
