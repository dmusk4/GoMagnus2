import { Language, EmailStyle, BrandKit } from "../../types";
import { sanitizeContext, getLangName, EMAIL_SUBJECT_BLACKLIST, getMimeTypeFromBase64 } from "../aiCore";

// --- Meta / Facebook Ads ---

export const getMetaAdSystemInstruction = (lang: Language): string => 
  `You are an elite direct-response copywriter. Your goal is extreme clarity, emotional resonance, and conversion. Strictly use ${getLangName(lang)}. Use informal direct address ("tu"). In direct response copywriting, always articulate the customer's real problem using the EXACT words they speak to themselves in their internal monologue, written with radical simplicity at a 4th-grade reading level (short sentences, simple everyday words, zero marketing jargon).`;

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
  } else if (style === 'Direct-Response' || style === 'Direct Response') {
      specificInstruction = `DIRECT RESPONSE FOCUS (CUSTOMER'S RAW PROBLEM IN THEIR EXACT SELF-TALK & 4TH-GRADE WRITING LEVEL):
      • MENÇÃO OBRIGATÓRIA DO PROBLEMA COM AS PALAVRAS EXATAS DO DIÁLOGO INTERNO:
        - DEVES mencionar e expor o problema e a dor do cliente usando com precisão as PALAVRAS EXATAS que ele fala para ele próprio na sua cabeça (o seu diálogo interno cru, sem filtros, quando está sozinho ou frustrado a lidar com o problema).
        - Capta o que ele murmura para si mesmo no momento de maior desespero, cansaço ou frustração (ex: "Porque é que nada disto funciona comigo?", "Não aguento mais deitar dinheiro ao lixo", "Estou farto de acordar exausto todos os dias", "Tenho vergonha disto", "Já tentei de tudo e nada muda").
        - PROIBIDO usar descrições de marketing limpas, corporativas, académicas ou genéricas sobre o problema. O Hook e o primeiro parágrafo do anúncio devem atacar imediatamente com essa frase de diálogo interno exata que o cliente reconhece na hora.
      • NÍVEL DE LEITURA 4º ANO (4TH-GRADE LEVEL WRITING - MANDATÓRIO):
        - Escrita ultra simples, limpa e direta que uma criança de 9 anos (4º ano de escolaridade) entende de imediato.
        - Frases curtas. Vocabulário comum do dia a dia.
        - ZERO jargão de marketing, ZERO palavras sofisticadas, ZERO floreados intelectuais ou metáforas complicadas.
        - Ritmo ágil: afirmação direta, constatação crua da dor, solução simples.
      • ESTRUTURA DO COPY (Hook -> Dor Real / Diálogo Interno -> Mecanismo Único Simples -> CTA):
        - Hook: A frase ou pergunta curta que ecoa exatamente o que o cliente fala para si próprio na sua mente.
        - Caption: 2 a 3 parágrafos curtos a validar essa frustração interna sem rodeios, apresentando a solução de forma simples e descomplicada (nível 4º ano), terminando com uma chamada à ação clara e sem atrito.
        - Headline: Promessa direta ou pergunta impactante com palavras simples do quotidiano (máx 40 caracteres).
        - Subheadline: Reforço direto e tranquilizador (máx 40 caracteres).
        - CTA: Chamada para ação simples, direta e de baixa fricção.`;
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
  } else if (style === 'Versus') {
      specificInstruction = "VERSUS FOCUS: Compare this product directly with a traditional, expensive alternative side-by-side. Focus on explaining how our clone/alternative delivers equivalent or superior results with massive value, superior practicality, or premium features, without using numeric pricing.";
  } else if (style === 'Product-Hero' || style === 'Minimalist') {
      specificInstruction = "PRAGMATIC. Focus 100% on technical features, design, and direct utility. Ignore emotional hooks.";
  } else if (style === 'SMS-Mockup') {
      specificInstruction = "SMS-MOCKUP FOCUS: SMS notification format (personal 1:1 conversation). Create an ad that mimics an incoming personal text message on a smartphone. Write a sender name in the 'headline' field (e.g., 'Wifey', 'Mãe', 'Amigo', 'Cliente', 'Boss'). In the 'subheadline' field, write the actual short text message content (under 35 characters) that triggers extreme curiosity or urgency (e.g. 'Temos de falar disto urgentemente...' or 'Tens de ver isto agora!'). In the 'caption' field, write a highly personal, raw, direct message from 'tu' to a friend sharing the secret discovery of the product. The 'hook' should be conversational, casual, and direct.";
  } else if (style === 'Secret Info') {
      specificInstruction = "SECRET INFO / REVEAL FOCUS: Mimic high-authority leaked information or secret reports. Create copy with a massive curiosity gap. The headline should present a 'reveal' or 'leaked' style statement (e.g., 'Metodologia secreta revelada...', 'O segredo de X revelado...', 'Mapa secreto de...'). The text must imply proprietary data, a chart, a graph, a map, or a crucial document screenshot that is being uncovered. Avoid generic sales copy; make it feel exclusive, secret, and authoritative.";
  } else if (style === 'Native-Social') {
      specificInstruction = "NATIVE SOCIAL POST FOCUS: Mimic the dominant style of major news or gossip pages on Meta. The headline must be written in a dramatic, punchy news/gossip/community style . CRITICAL: Do NOT use or repeat generic clickbait clichés like 'chocante', 'alerta', or 'urgente' in the headline. The primary text should look like an organic public announcement or a social gossip report, using casual, bold language that completely bypasses ad blindness. Max 80 characters";
  } else if (style === 'Sign Meme' || style === 'Dude With Sign') {
      specificInstruction = `SIGN MEME / DUDE WITH SIGN / RITMO RÁPIDO & DIRETO:
      • RITMO E FORMA DO TEXTO: Frases curtas, pensamento rápido, sem rodeios, ritmo ágil e dinâmico. O estilo deve refletir a cadência natural de alguém a partilhar uma observação direta e sem filtros (como um tweet afiado ou um post perspicaz).
      • PROIBIÇÃO DE META-FRASES: NUNCA uses frases literais como "Escrevi isto no telemóvel", "a escrever no telemóvel" ou "estava aqui a pensar no telemóvel". O efeito de rapidez deve transparecer no RITMO, na objetividade e nas frases curtas, nunca em menções literais ao telemóvel.
      • HEADLINE (NO CARTAZ/PLACA): A declaração central, curta, em maiúsculas e sem filtros (máx 45 caracteres, e.g. 'PAREM DE GASTAR 50€ EM X', 'A TUA ROTINA É UMA MENTIRA', 'X É MELHOR QUE Y, CHANGE MY MIND', 'NINGUÉM TE AVISA DISTO').
      • SUBHEADLINE (MIC-DROP): Remate irónico, assertivo ou sagaz em menos de 35 caracteres (e.g. 'Alguém tinha de dizer.', 'Facto indiscutível.', 'Quem discorda mente.').
      • CAPTION: 2 a 3 parágrafos curtos, diretos e afiados de 'tu' para 'tu'. Começa logo a atacar o erro comum ou o mito do mercado sem introduções mornas, desmistifica a situação em poucas linhas com bom senso prático, e apresenta o produto como a alternativa óbvia e inteligente. Proibido jargão de marketing ou tom corporativo.`;
  } else if (style === 'Handwritten Note' || style === 'Journal Note' || style === 'Journal Inspiration' || style === 'Redacted Truth' || style === 'Censored Truth') {
      specificInstruction = `HANDWRITTEN JOURNAL NOTE / RAW PERSONAL REFLECTION (GRADE 5 READING LEVEL & 100% AMATEUR HUMAN TONE):
      • CONCEITO: Uma nota rápida, crua, honesta e inspiradora escrita à mão num bloco de notas, caderno simples ou papel, como se fosse um desabafo ou pensamento genuíno partilhado nas redes por uma pessoa real (e NÃO por uma agência ou IA).
      • TOM 100% HUMANO E AMADOR (PROIBIDO PARECER IA OU MARKETING):
        - Escreve como uma pessoa normal a falar no dia a dia com um amigo.
        - Zero jargão publicitário, zero palavras polidas ou frases clichê de marketing.
        - Sem introduções robóticas. Linguagem descontraída, simples, crua e autêntica.
      • NÍVEL DE LEITURA 5º ANO (MANDATÓRIO): Palavras comuns, fáceis de ler instantaneamente.
      • FRASES SUPER CURTAS: Cadência rápida, frases diretas de uma linha.
      • HEADLINE (O TEXTO ESCRITO À MÃO NO PAPEL): A frase inspiradora, controversa ou constatação simples escrita à mão no papel (ex: 'O teu maior erro é complicar.', 'Regra básica: menos ruído, mais foco.', 'Pára de tentar agradar a toda a gente.', 'X é muito mais simples do que pensas.'). Máx. 45 caracteres.
      • SUBHEADLINE (NOTA RÁPIDA / PUNCHLINE): Um remate descontraído e curto (máx. 30 caracteres, e.g. 'Anotado para não esquecer.', 'A verdade nua e crua.', 'Simples assim.').
      • CAPTION (TEXTO DO POST - ULTRA AMADOR & NATURAL):
        - 2 a 3 parágrafos muito curtos (1 a 2 linhas cada), a falar de 'tu'.
        - Começa logo com o desabafo ou a reflexão como quem acabou de anotar aquilo e quis partilhar.
        - Menciona como o produto facilitou a vida de forma prática e simples, sem parecer um anúncio forçado.
        - Termina com uma chamada de ação leve, natural e humana.`;
  } else if (style === 'Highlight Method') {
      specificInstruction = `HIGHLIGHT METHOD FOCUS (ASSINALAR PARTE IMPORTANTE COM CÍRCULO OU SETA DE MARCADOR):
      • CONCEITO: Direcionar o foco visual instantaneamente para uma parte fundamental, detalhe, mecanismo ou ingrediente da imagem ou produto através de uma demarcação visual autêntica (como um círculo ou seta desenhados com caneta marcador).
      • DEMARCAÇÃO VISUAL (CÍRCULO / SETA / ANOTAÇÃO): A imagem DEVE assinalar uma parte importante da foto/produto com um círculo desenhado à mão ou uma seta marcante de caneta marcador (estilo marca-texto amarelo fluorescente, verde-limão vibrante ou laranja vivo). NÃO é para escrever frases longas com o marcador — a função do marcador é assinalar visualmente o elemento-chave da imagem (círculo, seta, loop de destaque).
      • PROIBIDO GLOWS / NEON ARTIFICIAL: O traço do marcador deve ter a textura autêntica e fosca de tinta de caneta marca-texto real desenhada sobre a imagem ou superfície.
      • HEADLINE: Frase direta de alto impacto focada na parte assinalada ou na sua transformação (máx 40 caracteres).
      • SUBHEADLINE: Reforço direto e conciso (máx 35 caracteres).
      • CAPTION: Copy persuasivo e afiado explicando exatamente por que aquele detalhe assinalado é o divisor de águas.`;
  } else if (style === 'Positive Vibe') {
      specificInstruction = `POSITIVE VIBE / UPLIFTING QUOTE & WHOLESOME REFLECTION:
      • CONCEITO: Criar um post altamente partilhável e reconfortante com uma mensagem curta, positiva e inspiradora de mindset/vida (estilo citações virais do Instagram/Pinterest como @positivelypresent ou @werenotreallystrangers). O objetivo é conectar pela empatia, positividade, encorajamento e perspetiva saudável.
      • ADAPTAÇÃO TOTAL AO PRODUTO & NICHO (CRÍTICO): As cores de fundo, o estilo tipográfico (tipo de letra) e as ilustrações (doodles) DEVEM variar e ser personalizadas conforme o produto específico e a sua área de atuação:
        - Bem-estar, Skincare & Beleza: tons suaves e elegantes (blush, pêssego, lavanda) com tipografia clássica/delicada e doodles botânicos, gotas de sérum, pétalas ou espelhos gentis.
        - Produtividade, Software, Apps & Negócios: tons limpos e serenos (azul pastel, verde menta, creme/aveia) com tipografia moderna geométrica ou editorial limpa e doodles de faíscas de ideias, lâmpadas amigáveis, chávenas de café ou listas de conquistas.
        - Fitness, Saúde & Desporto: tons energéticos e solares (terracota quente, amarelo dourado, tangerina) com tipografia marcante e doodles de nascer do sol, ténis, gotas de água ou setas dinâmicas.
        - Alimentação, Café & Gastronomia: tons quentes e reconfortantes (mocha/café, caramelo, terracota, manteiga) com tipografia acolhedora e doodles de chávenas fumegantes, croissants, aromas ou pequenos corações.
        - Animais & Pets: tons carinhosos e acolhedores com tipografia lúdica/arredondada e doodles de patinhas, caudas a abanar ou laços.
        - Mindset, Coaching & Desenvolvimento Pessoal: tons de calma ou noites estreladas (matcha acolhedor, lilás sereno ou azul marinho profundo com texto branco) com tipografia editorial/livro e doodles de sementes a brotar, regadores, nuvens ou caminhos.
      • RITMO E FORMA: Frases curtas, leves, humanas, acolhedoras e sem rodeios. Uma reflexão positiva conectada ao universo do produto que faça o utilizador parar o scroll, sentir-se bem, refletir e querer partilhar/guardar.
      • HEADLINE (A CITAÇÃO / FRASE CENTRAL NA IMAGEM): A mensagem positiva curta e inspiradora personalizada para o nicho do produto (máx 60 caracteres, e.g. 'Life is a journey, not a competition.', 'Tu podes crescer ao teu próprio ritmo.', 'Foca no que te traz paz e energia.', 'Pequenos passos diários mudam tudo.').
      • SUBHEADLINE (LEMBRETE / PUNCHLINE SUAVE): Um remate carinhoso e curto (máx 35 caracteres, e.g. 'Lembrete suave para hoje.', 'Guarda para reler.', 'Respira fundo e confia.').
      • CAPTION: 2 a 3 parágrafos curtos, calorosos e humanos de 'tu' para 'tu'. Começa por aprofundar essa perspetiva positiva com empatia real, e liga com leveza a como o produto/serviço apoia uma vida mais simples, tranquila e equilibrada. Zero pressão de vendas agressiva ou jargão corporativo.`;
  } else if (style === 'Humor') {
      specificInstruction = "Create a split-screen comparison copy that directly addresses the competitor/alternative while praising our product. The 'headline' should be a pattern interrupt scroll stopping statement. The 'subheadline' should be a punchline.";
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
  
  INSTRUÇÕES CRÍTICAS DE LINGUAGEM & DIREÇÃO:
  1. O copy deve ser persuasivo e focado no estilo "${style}". STRICT REQUIREMENT: Answer strictly in ${getLangName(lang)}.
  2. Não uses placeholders. Escreve texto final pronto para publicar.
  3. REGRAS DE TRATAMENTO OBRIGATÓRIO: Dirige-te ao utilizador estritamente por "TU". NÃO uses "Você".
  4. DIREÇÃO ESTRATÉGICA (CRÍTICO PARA visualPrompt): Se existir "USER SPECIFIC DIRECTION" ou Direção Estratégica nos dados acima, DEVES obrigatoriamente refletir e incorporar essa direção estratégica na descrição visual do campo "visualPrompt" para que a imagem gerada execute essa estratégia exata!
  5. RESTRICÕES DE CAMPO:
     - "headline": ${style === 'SMS-Mockup' ? 'Nome do remetente fictício ou contacto (e.g. "Wifey 💬", "Mãe 🧑", "Amigo", "Boss").' : style === 'YouTube-Thumbnail' ? 'Máximo 3/4 palavras. Muito curto e chocante (ex: "Fiz isto durante 30 dias!", "O segredo revelado!").' : style === 'Native-Social' ? 'Título estilo notícia, direto e conciso.' : style === 'Sign Meme' || style === 'Dude With Sign' ? 'A mensagem EXATA escrita no cartaz/placa (curto, maiúsculas, máx 45 caracteres).' : style === 'Handwritten Note' || style === 'Journal Note' || style === 'Journal Inspiration' || style === 'Redacted Truth' || style === 'Censored Truth' ? 'A frase inspiradora/controversa exata escrita à mão no papel/bloco (curto, máx 45 caracteres).' : style === 'Positive Vibe' ? 'A citação/afirmação positiva curta e inspiradora na imagem (curto, máx 60 caracteres).' : style === 'Direct-Response' || style === 'Direct Response' ? 'Promessa direta ou pergunta impactante em palavras simples do 4º ano (máx 40 caracteres).' : 'Máximo 40 caracteres.'}
     - "subheadline": ${style === 'SMS-Mockup' ? 'A mensagem de texto SMS curta e instigante (máximo 35 caracteres).' : style === 'YouTube-Thumbnail' ? 'Máximo 25 caracteres.' : 'Máximo 40 caracteres.'}
  
  ${style !== 'YouTube-Thumbnail' && style !== 'Product-First' && style !== 'Storytelling' && style !== 'Versus' && style !== 'Short-Human' && style !== 'Direct-Response' && style !== 'Direct Response' && style !== 'SMS-Mockup' && style !== 'Secret Info' && style !== 'Native-Social' && style !== 'Humor' && style !== 'Sign Meme' && style !== 'Dude With Sign' && style !== 'Handwritten Note' && style !== 'Journal Note' && style !== 'Journal Inspiration' && style !== 'Redacted Truth' && style !== 'Censored Truth' && style !== 'Highlight Method' && style !== 'Positive Vibe' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST start exactly with: "foto natural raw unedited tirada do iphone ugc style, com fundo simples com pouco ruído visual, " followed by a description of the scene in a realistic, amateur, and candid setting. Never describe generic commercial studio setups, stock photos, clean-cut vectors, or 3D renderings.` : style === 'Positive Vibe' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe a warm, uplifting, aesthetically pleasing editorial social media quote graphic with charming hand-drawn doodles, colors, and typography tailored specifically to the PRODUCT, niche, and story of the quote with centered typography on a clean, solid background.

  PRODUCT-DRIVEN ADAPTATION FOR COLORS, TYPOGRAPHY & DOODLE ILLUSTRATIONS (CRITICAL):
  - The background color palette, typography font style, and doodle drawings MUST vary dynamically based on the specific PRODUCT and its industry:
    * Skincare, Beauty & Self-care: soft blush rose, lavender mist, peach cream, or warm cream; delicate classic/editorial serif typography; cute botanical leaves, skincare serum drops, gentle mirrors, or blooming petals doodles.
    * Productivity, Software & Tech: calming pastel sky blue, mint sage, or oat cream; crisp modern geometric sans-serif or refined editorial typography; friendly lightbulbs, sparks, organized checklist items, or cozy coffee mug doodles.
    * Health, Fitness & Energy: warm terracotta rust, sunny golden yellow, or energetic coral; bold inspiring typography; vibrant sunrise, sneakers, water bottles, and dynamic energy burst doodles.
    * Food, Coffee & Lifestyle: warm mocha/espresso, rich caramel, or warm terracotta; cozy rustic serif typography; steaming mugs, croissants, cheerful bakery, and heart steam doodles.
    * Pets & Animals: warm honey, sage green, or soft lilac; playful friendly rounded typography; cute paw prints, wagging tails, little hearts, and playful pet accessory doodles.
    * Coaching, Mindfulness & Mental Health: soothing matcha green, serene lilac, or deep midnight blue with ivory text; elegant classic book serif; cozy tea cups, peaceful clouds/stars, sprouting seedlings, and watering can doodles.
  - TEXT CONTRAST GUARANTEE: The text color MUST alternate intelligently between deep charcoal/black (on light/pastel backgrounds) and crisp pure white / ivory (on dark/deep backgrounds) to guarantee flawless 100% reading legibility and optical contrast.

  The "visualPrompt" field MUST start exactly with: "design gráfico minimalista e acolhedor estilo ilustração editorial de redes sociais, fundo de cor sólida " followed by the specific chosen background color tailored to the product (e.g. "amarelo manteiga suave", "pêssego acolhedor", "azul pastel sereno", "lavanda suave", "terracota quente", "azul marinho profundo", "verde matcha suave", "rosa blush suave", or "café mocha"), " com texto da citação inspiradora perfeitamente centralizado com tipografia " followed by the high-contrast font style tailored to the product (e.g. "elegante clássica serifada em preto/carvão escuro", "moderna limpa sem serifa em preto/carvão escuro", "editorial sofisticada em branco puro brilhante", or "lúdica arredondada em preto/carvão escuro") that says: " followed by the exact headline quote in quotes in ${getLangName(lang)}, ", acompanhado na borda inferior por ilustrações fofas de doodles desenhados à mão com contornos nítidos e expressivos diretamente conectados ao produto e à metáfora da citação, com detalhes coloridos em tons harmoniosos e pequenos brilhos/estrelinhas desenhados à mão, composição limpa, simétrica e espaçosa com margens generosas e zero ruído visual."` : style === 'Highlight Method' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe a clean, realistic, high-impact photo where an important physical part, feature, or mechanism of the product/scene is clearly and unmistakably demarcated with a hand-drawn marker annotation (such as a bold drawn marker circle enclosing the key detail or a thick marker arrow pointing directly to the breakthrough part). The "visualPrompt" field MUST start exactly with: "foto natural de alta qualidade com foco nítido e iluminação limpa, fundo simples e minimalista sem ruído visual, com uma parte importante do produto ou da cena claramente assinalada e demarcada por uma anotação de caneta marcador (como um círculo grosso desenhado à mão a rodear o detalhe crucial ou uma seta de caneta marca-texto fluorescente amarela ou verde vibrante a apontar diretamente para o elemento-chave), " followed by a description of the clean scene, the sharp product in focus, and the specific circled or arrow-pointed detail.` : style === 'Product-First' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe an ultra-realistic advertising photo taken from iPhone with active physical interaction. The "visualPrompt" field MUST start exactly with: "Create an ultra-realistic, high-impact taken from iphone photo advertising image using the provided product reference image as the absolute visual truth. Preserve the product’s exact design, colors, materials, proportions, shape, finish, texture and visible details. The product must be physically engaged with at all times — held, used, applied, consumed, opened, worn or interacted with in a way that clearly communicates its purpose. Shadows must feel natural and anchor the product and model realistically in the scene. The final image should look like ultra-high-resolution advertising photography with extreme clarity, crisp detail, realistic material textures, natural skin texture and visible fabric detail. Avoid CGI look, illustration, floating product, lack of interaction, neutral facial expression, generic wardrobe, disconnected styling, artificial skin smoothing or over-stylization. simple background without noise. closeup on product, " followed by a description of the product in physical engagement and interaction. Do NOT include or describe any text, lettering, or overlays on the image itself. The prompt description must contain exactly zero text overlay instructions. Keep it strictly visual.` : style === 'Storytelling' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe an epic, high-end cinematic Hollywood scene. The "visualPrompt" field MUST start exactly with: "foto cinematográfica estilo hollywood, ângulo inclinado de dutch angle dramático, iluminação de estúdio estilosa com alto contraste, cores premium com tonalidades teal e orange e sombras profundas, composition dinâmica e elegante, " followed by a storytelling scene description that matches the core narrative.` : style === 'Versus' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe a highly polished side-by-side comparison layout. The "visualPrompt" field MUST start exactly with: "foto de comparação lado a lado de dois produtos, split-screen split vertical, fundo limpo de estúdio com tom cinza suave na esquerda e tom creme suave na direita, com um distintivo circular preto minimalista no centro contendo o texto 'VS' escrito de forma limpa, no lado esquerdo uma embalagem premium mas tradicional de concorrente caro, and no lado direito o nosso produto como alternativa inovadora e moderna de alta qualidade, " followed by a detailed visual comparison describing our product on the right and the expensive version on the left. CRITICAL: Do NOT show any prices, pricing symbols, currency signs, or dollar/euro amounts anywhere on the image. Keep all text labels extremely brief (under 3 words per label), clean, highly legible and sophisticated, showing red cross icons on the left list and green checkmark icons on the right list.` : style === 'Short-Human' || style === 'Direct-Response' || style === 'Direct Response' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe an ultra-realistic, high-impact advertising image with a smiling model interacting with the product. The "visualPrompt" field MUST start exactly with: "foto publicitária de alta qualidade e impacto, plano aberto com perspectiva de lente grande angular dramática, iluminação de estúdio profissional limpa e de alto contraste focalizando a expressão sincera do modelo sorrindo de forma natural, com o modelo interagindo fisicamente com e segurando o produto, e uma faixa ou caixa escura de destaque na imagem com um título em letras brancas maiúsculas e negrito de alto impacto, " followed by a detailed description of the scene highlighting the authentic smiling model, product contact, headline banner, and premium environment.` : style === 'SMS-Mockup' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe a realistic iOS/Android SMS message popup mockup. The "visualPrompt" field MUST start exactly with: "a raw unedited candid iPhone photo of a real person smiling or a realistic lifestyle scene, overlaid in the upper center with a pristine semi-transparent white iOS-style SMS text message notification popup card with rounded corners, a green message app icon, a 'MESSAGES' header on the left and 'now' on the right, displaying a bold sender name and the text message text in quotes, " followed by a detailed description of the background lifestyle scene and the specific text message overlay content.` : style === 'Secret Info' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe a secret reveal or leak layout with an inset. The "visualPrompt" field MUST start exactly with: "foto de estilo relatório confidencial ou revelação secreta, plano de fundo com uma foto aérea ou foto realista do cenário, com um overlay semitransparente contendo um mapa esquemático detalhado, um gráfico científico ou um screenshot de documento analítico em destaque no canto superior direito, com uma faixa ou badge preta marcante na parte inferior escrito REVEALED de forma limpa, " followed by a description of the background scene, the specific map or chart details, and the product being revealed.` : style === 'Native-Social' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe an organic social media news post format. The "visualPrompt" field MUST start exactly with: "foto natural estilo publicação de notícias das redes sociais, uma imagem principal de alta qualidade de uma pessoa de frente ou de um cenário real, com uma imagem circular secundária embutida no canto superior direito mostrando um detalhe do produto ou pessoa focada, e uma faixa ou caixa escura flutuante posicionada na parte inferior com margem de segurança de 15% acima da borda para o texto ficar 100% legível e nunca cortado em baixo, contendo um título em letras brancas maiúsculas e negrito no estilo notícia de impacto followed by a detailed description of the main person, the circle inset content, the bottom news banner with headline text (max 72 characters), and the product.` : style === 'Sign Meme' || style === 'Dude With Sign' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe a viral statement/sign meme photo in a realistic, candid lifestyle setting with visual variety and a complementary circular inset image. The "visualPrompt" field MUST start exactly with: "foto natural candid tirada do iphone estilo meme viral real, " followed by a creative scene setup choosing dynamically among: (1) a person holding up a cardboard sign with bold handwritten black marker text, (2) a person sitting outdoors at a folding table with a banner/sign in a 'Change My Mind' style with a coffee mug, (3) a person holding a dry-erase whiteboard or large notepad in a modern office/home setting, or (4) a stylish wooden sidewalk A-frame chalkboard outside a shop. Describe the person with an engaging, attention-grabbing expression that feels natural and scroll-stopping without being over the top (such as a knowing playful smirk, an intrigued eye contact, a witty eyebrow raise, a confident authentic smile, or a relatable reactive expression), the exact headline text clearly written on the sign in ${getLangName(lang)}, a secondary circular inset image embedded in the top-right corner with a clean thin border displaying a close-up detail of the product or relevant reaction, and the product subtly present or held naturally.` : style === 'Handwritten Note' || style === 'Journal Note' || style === 'Journal Inspiration' || style === 'Redacted Truth' || style === 'Censored Truth' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe a raw, unedited, candid photo taken with an iPhone of a handwritten note with minimal background noise. The "visualPrompt" field MUST start exactly with: "foto natural raw unedited tirada do iphone em close-up de um pedaço de papel ou bloco de notas simples sobre uma mesa limpa com fundo minimalista e quase nenhum ruído visual, com uma frase curta escrita à mão com caneta preta ou azul de forma 100% nítida e legível que diz: " followed by the exact headline text in quotes in ${getLangName(lang)}, "iluminação natural sem filtros artificiais, com a folha em foco absoluto e fundo limpo e desfocado."` : style === 'Humor' ? `CRITICAL REQUIREMENT FOR visualPrompt:
  The "visualPrompt" field MUST describe a split-screen comparison layout. The "visualPrompt" field MUST start exactly with: "foto de comparação lado a lado, split-screen vertical claramente dividido ao meio. Uma cor de fundo vibrante e limpa na esquerda (adequada ao contexto do produto) e uma cor de fundo escura contrastante na direita. No lado esquerdo, o nosso produto ou a solução ideal com uma seta estilizada e texto positivo. No lado direito, uma alternativa comum ou produto tradicional relacionado ao mesmo nicho (por exemplo, se o produto é comida fresca para cães, o lado direito é ração seca), com texto descontraído, " followed by a description of the two distinct objects/scenarios, background colors suitable for the context, and the specific short text labels. Ensure the text labels are relatable and lighthearted, completely avoiding overly negative, aggressive, or sarcastic words like 'lixo' or 'trash'.` : ''}`;
};

// --- Image Generation ---

export const buildCreativeImagePrompt = (
  prompt: string,
  style?: string,
  composition?: string | string[],
  brandKit?: any,
  lang: Language = 'en',
  hasBaseImages: boolean = false
): string => {
  const isPriorityOverride = prompt.includes("IMPORTANTE:") || prompt.includes("CRITICAL OVERRIDE:") || prompt.includes("Direção Estratégica") || prompt.includes("Strategic Direction");
  const priorityHeader = isPriorityOverride ? `
🚨 CRITICAL PRIORITY INSTRUCTION / STRATEGIC DIRECTION & DIRECT VISUAL MODIFICATION:
${prompt}
CRITICAL MANDATE: The instruction above contains explicit strategic direction and modifications. It is STRICTLY MANDATORY and takes absolute precedence over all other generic stylistic guidelines. You MUST visibly, faithfully, and completely reflect this strategic direction and visual modification using the provided reference/base image(s) as the foundation.
` : "";

  // Normalize composition / framing (supports up to 2 simultaneous framings)
  const rawAngles: string[] = Array.isArray(composition)
    ? composition.filter(Boolean)
    : (composition ? [composition] : []);
  const selectedAngles = rawAngles.length > 0 ? rawAngles.slice(0, 2) : ["Medium Shot"];

  const getAngleDirective = (angle: string): string => {
    switch (angle) {
      case "Close-Up":
        return "STRICT CLOSE-UP FRAMING: Tight shot focusing closely on the primary subject/product/face, capturing fine textures, high-definition surface details, and tactile qualities while tightly cropping background surroundings.";
      case "Macro Shot":
        return "STRICT MACRO SHOT FRAMING: Extreme close-up macro perspective revealing microscopic textures, fine craftsmanship, droplet/grain detail, and ultra-crisp focus with beautiful shallow depth of field.";
      case "Medium Shot":
        return "STRICT MEDIUM SHOT FRAMING: Waist-up or mid-distance framing capturing the product/subject in clear focus while authentically grounding it within its immediate functional environment.";
      case "3/4 Angle Shot":
        return "STRICT 3/4 ANGLE SHOT FRAMING: Dynamic three-quarter volumetric perspective showing dimensional side profile, spatial depth, and sculpted form of the subject/product.";
      case "Full Shot":
        return "STRICT FULL SHOT FRAMING: Complete scene where the entire product/subject is fully visible from head-to-toe / top-to-bottom within its atmospheric context.";
      case "Wide Establishing Shot":
        return "STRICT WIDE ESTABLISHING SHOT: Expansive cinematic field of view establishing the environmental world, spatial architecture, and spacious natural context.";
      case "Low Angle":
        return "STRICT LOW ANGLE (WORM'S-EYE) PERSPECTIVE: Camera placed distinctly below the subject looking upward, creating a heroic, monumental, powerful, and commanding visual presence.";
      case "High Angle":
        return "STRICT HIGH ANGLE (BIRD'S-EYE / TOP-DOWN) PERSPECTIVE: Camera positioned directly above or at a steep downward incline looking onto the subject/tabletop arrangement.";
      case "Over the Shoulder":
        return "STRICT OVER-THE-SHOULDER PERSPECTIVE: Immersive first-person point of view captured from right behind a person's shoulder/back looking directly at the product or action.";
      case "Dutch Angle":
        return "STRICT DUTCH ANGLE PERSPECTIVE: Noticeably tilted, slanted camera roll generating high-energy cinematic tension, motion, and visual drama.";
      case "Faceless":
      case "Faceless Shot":
        return "STRICT FACELESS FRAMING (MANDATORY: NO VISIBLE FACE / NÃO MOSTRAR CARA): Absolutely DO NOT show the model's or person's face. The visual must be 100% faceless. Frame the shot strictly without showing any eyes, nose, mouth, head, or recognizable facial features — crop carefully from the neck or chest down, capture from behind or over-the-shoulder, show hands/arms/torso interacting naturally with the product, or focus exclusively on the product and tactile physical interaction. Under NO circumstances should any human face or facial identity be recognizable or visible in the composition.";
      default:
        return `STRICT CAMERA ANGLE & FRAMING: Explicitly execute a ${angle} framing with crisp geometric discipline.`;
    }
  };

  const angleDetailedDirectives = selectedAngles.map(a => getAngleDirective(a));
  const combinedAngleLabel = selectedAngles.join(" + ");
  const framingInstructionsCombined = selectedAngles.length > 1
    ? `DUAL-FRAMING SYNTHESIS: Seamlessly unify and harmonize both requested angles [${selectedAngles[0]}] AND [${selectedAngles[1]}]. Specifically:
    1) Primary Framing (${selectedAngles[0]}): ${angleDetailedDirectives[0]}
    2) Secondary Framing & Perspective Modulation (${selectedAngles[1]}): ${angleDetailedDirectives[1]}
    Synthesize these two camera perspectives into one cohesive, visually striking shot (e.g. combine camera elevation with shot distance, or tilt with subject proximity).`
    : `SINGLE CAMERA DIRECTIVE: ${angleDetailedDirectives[0]}`;

  let styleRules = "";

  if (style === 'Direct-Response') {
    styleRules = `
    Create an ultra-realistic, high-impact taken from iphone photo advertising image using the provided product reference image as the absolute visual truth. Clean simple background. Preserve the products exact design, colors, materials, proportions, shape, finish, texture and visible details. The product must be physically engaged with at all times — held, used, applied, consumed, opened, worn or interacted with in a way that clearly communicates its purpose. The product must never feel passive, floating, decorative or secondary. The model must be smiling naturally, with genuine candid natural expression. Hand positioning, grip tension, fingers, posture, fabric contact and product contact points must feel physically accurate and realistic. Clean, simple clothing. The outfit must never feel random or generic. Build a cinematic, premium advertising scene where the model, product, wardrobe and environment feel like one coherent visual narrative. Use a bold but believable creative concept based on the product’s color palette, material, shape and function. Use wide-angle advertising photography with subtle fisheye-inspired perspective distortion. The product may appear slightly larger when closer to the lens to increase visual impact. Maintain clear separation between foreground, midground and background. Lighting must be clean, high-contrast and premium. The model’s face should be well-lit, showing natural skin texture, pores and expression detail. The contact points between hands, product, wardrobe and environment must be clearly visible. Shadows must feel natural and anchor the product and model realistically in the scene. The final image should look like ultra-high-resolution cinematic advertising photography with extreme clarity, crisp detail, realistic material textures, natural skin texture and visible fabric detail. Avoid CGI look, illustration, floating product, lack of interaction, neutral facial expression, generic wardrobe, disconnected styling, artificial skin smoothing or over-stylization.
TEXT & OVERLAYS:
    • PLACEMENT & LAYOUT: Position the primary SCROLL-STOPPING pattern interrupt Headline (Title) near the top of the image, using a bold, heavy, and highly impactful display typeface. CRITICAL: Leave generous negative space (margin) at the very top of the image so the text is NOT glued to the top edge. Ensure breathing room above the headline.
    • TITLE CONTRAST OVERLAY (MANDATORY): The Title MUST have a background gradient or solid overlay behind the text using the visual's primary color to ensure EXTREME HIGH CONTRAST and pop!
    • CALL-TO-ACTION (CTA): Position the CTA near the bottom of the image, designed and styled to look exactly like a physical, clean, premium clickable button (with a filled background container, rounded corners/pill-shaped, and centered text). CRITICAL: Leave generous negative space (margin) at the very bottom of the image so the button is NOT glued to the bottom edge. Ensure breathing room below the CTA.
    • CRITICAL CONSTRAINT: Do NOT include any secondary subheadlines, secondary subtitles, or extra supporting text blocks on the visual image itself to ensure maximum aesthetic purity and direct response power.
    • Text must be optimized for mobile readability and maintain strong contrast.
    • ALL GENERATED TEXT INSIDE THE IMAGE MUST BE IN ${getLangName(lang).toUpperCase()}.
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
    Create an ultra-realistic, high-impact taken from iphone photo advertising image using the provided product reference image as the absolute visual truth. Preserve the products exact design, colors, materials, proportions, shape, finish, texture and visible details. The product must be physically engaged with at all times — held, used, applied, consumed, opened, worn or interacted with in a way that clearly communicates its purpose. The product must never feel passive, floating, decorative or secondary. The model must be smiling naturally, with genuine candid natural expression. Hand positioning, grip tension, fingers, posture, fabric contact and product contact points must feel physically accurate and realistic. Clean, simple clothing. The outfit must never feel random or generic. Build a cinematic, premium advertising scene where the model, product, wardrobe and environment feel like one coherent visual narrative. Use a bold but believable creative concept based on the product’s color palette, material, shape and function. Use wide-angle advertising photography with subtle fisheye-inspired perspective distortion. The product may appear slightly larger when closer to the lens to increase visual impact. Maintain clear separation between foreground, midground and background. Lighting must be clean, high-contrast and premium. The model’s face should be well-lit, showing natural skin texture, pores and expression detail. The contact points between hands, product, wardrobe and environment must be clearly visible. Shadows must feel natural and anchor the product and model realistically in the scene. The final image should look like ultra-high-resolution cinematic advertising photography with extreme clarity, crisp detail, realistic material textures, natural skin texture and visible fabric detail. Avoid CGI look, illustration, floating product, lack of interaction, neutral facial expression, generic wardrobe, disconnected styling, artificial skin smoothing or over-stylization.
    `;
  } else if (style === 'Secret Insider' || style === 'Secret Info') {
    styleRules = `
    Secret Info / Reveal Creative Rules (Format 6):
    Goal: Create an elite, high-converting secret reveal or leak ad that conveys instant authority and intense curiosity.
    • STYLE: A highly engaging hybrid layout containing a realistic background photograph combined with a high-contrast authoritative inset.
    • INSET ELEMENT (CRITICAL):
      - In the top-right corner, incorporate a detailed secondary inset
      - The inset should have a subtle border or light shadow to separate it beautifully from the main background.
    • BOTTOM BANNER & HEADLINE:
      - At the bottom of the image, include a clean black or extremely dark high-contrast horizontal banner overlay spanning the full width.
      - Just above or on the banner, have a small red or white tag that says "REVEALED" or "REVELADO" (depending on the language).
      - The main headline on the dark banner must be written in huge, clean, bold white and red/accent uppercase sans-serif display typography (e.g. "THIS SECRET SUBURB IS SET TO BOOM" or "ESTE SEGREDO REVELADO...").
    • BACKGROUND SCENE: An eye-catching, high-resolution realistic aerial view, real-world setting, or candid shot that sets the perfect context for the secret discovery.
    • NO PRICE: There must be absolutely no prices or currency labels.
    `;
  } else if (style === 'Native-Social') {
    styleRules = `
    Native Social Post Creative Rules (Format 5):
    Goal: Create an organic social media news/gossip-style ad that completely bypasses ad blindness by mimicking a standard native platform format.
    • STYLE: Primary candid portrait or lifestyle photograph combined with a circular secondary inset image.
    • CIRCULAR INSET (CRITICAL):
      - In the top-right or center-right area, display a perfect circular inset frame with a clean border.
      - Inside this circle, show a secondary closeup or action shot of the product, or the person using the product.
    • BOTTOM HEADLINE (NEWS/GOSSIP STYLE):
      - Near the bottom, overlay a dramatic high-contrast horizontal background box or solid text backing.
      - Write a short, 5thgrade level sensational headline inside in bold, prominent white uppercase letters.
    • BACKGROUND SCENE: A raw, candid, unedited look. Features a real, expressive person or lifestyle situation in focus. High contrast and clean composition.
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
    Highlight Method Creative Rules (VISUAL ANNOTATION: CIRCLE / ARROW / MARKER POINTER):
    Goal: Direct the viewer's eye instantly to a crucial physical part, mechanism, ingredient, or key feature of the image using a hand-drawn marker circle or arrow.
    • VISUAL DEMARCATION (CIRCLE / ARROW / CALLOUT):
      - Prominently demarcate an important part of the product or image with an authentic, bold marker annotation (such as a thick, hand-drawn highlighter circle enclosing a key component/detail, or a bold marker arrow pointing directly at the breakthrough feature).
      - Do NOT force writing sentences with the marker. The marker is used to visually circle, point to, or frame the important part of the image/product.
      - Use high-contrast vibrant marker colors (such as fluorescent highlighter yellow, neon lime, vivid red or orange) with authentic marker ink texture.
    • ZERO SCI-FI GLOWS OR NEON HALOS:
      - The marker stroke must have the physical texture of real highlighter/marker ink drawn on the surface — NOT synthetic sci-fi laser beams, neon light tubes, or digital glow flares.
    • COMPOSITION & LIGHTING:
      - High-contrast, clean, uncluttered background with minimal visual noise to make the circled/arrowed detail pop aggressively.
      - Crisp, natural studio or daylight lighting with soft natural shadows.
    • FOCAL ELEMENT: The circled or arrow-pointed part of the product is tack-sharp, vivid, and unmistakable in the frame.
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
    Create an ultra-realistic, high-impact taken from iphone photo advertising image using the provided product reference image as the absolute visual truth. Preserve the product’s exact design, colors, materials, proportions, shape, finish, texture and visible details. The product must be physically engaged with at all times — held, used, applied, consumed, opened, worn or interacted with in a way that clearly communicates its purpose. Shadows must feel natural and anchor the product and model realistically in the scene. The final image should look like ultra-high-resolution advertising photography with extreme clarity, crisp detail, realistic material textures, natural skin texture and visible fabric detail. Avoid CGI look, illustration, floating product, lack of interaction, neutral facial expression, generic wardrobe, disconnected styling, artificial skin smoothing or over-stylization. simple background without noise. closeup on product
    • NO TEXT OVERLAYS: There must be absolutely no text, typography, letters, words, or overlays in the image prompt or scene. Focus strictly on any visual/realistic details of the physical product. Do not place any text.
    `;
  } else if (style === 'Storytelling') {
    styleRules = `
    Storytelling Creative Rules:
    Goal: Create an epic, premium cinematic scene with extreme mood and high aesthetic quality.
    • STYLE: Exquisite Hollywood movie still aesthetic with movie LUT. Stylish, premium, sophisticated.
    • COMPOSITION & CAMERA WORK: Exaggerated dramatics Dutch angle (tilted camera level), dynamic and non-traditional composition that breaks rules of balance to create high tension, cinematic wide lens perspective.
    • LIGHTING: Dramatic high-contrast three point lighting, backlighting, moody shadows, rim light.
    • COLOR GRADING: Stylish premium color tones LUT, deep rich black levels.
    • THEME: Artistic narrative representation that tells a powerful story in a single stylish shot.
    `;
  } else if (style === 'Versus') {
    styleRules = `
    Versus / Side-by-Side Product Comparison Creative Rules:
    Goal: Create a highly polished, high-contrast, side-by-side split screen comparison layout.
    • STYLE: Pristine, sharp, elegant commercial-tier studio product photography on a split screen. Minimalist and structured layout.
    • TITLE & HOOK: Place a HUGE, extremely short, and highly impactful Title/Hook at the very top of the image to grab attention.
    • COMPOSITION: Two distinct sides compared split horizontally or vertically (split split-screen). On the left side: the traditional competitor product on a muted background. On the right side: our modern product. In the exact center where they meet: a minimalist, sophisticated circular badge displaying the clean lettering 'VS'.
    • BACKGROUND (MANDATORY): The background MUST feature a high-contrast gradient utilizing the primary colors from the visual's established color palette. DO NOT use plain white or flat cream; make the colors pop with intensity to amplify the comparison drama.
    • HIGHLIGHT VALUE: Under each product, write clean aesthetic text labels highlighting the contrasting value: competitor has 2-3 brief labels with red indicator markings (such as minimalist cross icons), and our premium alternative has 2-3 brief labels with green indicator markings (such as minimalist checkmark icons). CRITICAL CONSTRAINTS: DO NOT use circular bullet points for the lists. Strictly text or cross/checkmarks without circles.
    • NO BRAND LABELS: DO NOT place broad titles like "Competitor", "Our Solution", "Them", "Us", or brand names above the products. Keep the space above the products clean except for the main Title/Hook at the very top.
    • STRICT NO PRICE CONSTRAINT: There must be absolutely no numerical prices, currency labels (like $, €, £), or price tags anywhere on either product or background. Keep all text labels extremely micro, minimalist, and descriptive of product performance (e.g., '12-hour wear', 'Guaranteed Quality', 'All-Day Performance').
    `;
  } else if (style === 'SMS-Mockup') {
    styleRules = `
    SMS Mockup Creative Rules:
    Goal: Create a highly engaging, personal, and clickable SMS/text message mockup advertisement.
    • STYLE: Ultra-realistic photograph overlaid in the upper center with a realistic, semi-transparent iOS-style SMS text message notification card.
    • OVERLAY CARD DESIGN (CRITICAL):
      - The notification card must look like a floating iOS text message alert.
      - It must have rounded corners and a pristine white/off-white semi-transparent background with soft backdrop blur.
      - Top Left: A small circular bright green Messages app icon (or standard chat icon).
      - Top Center/Right: The word 'MESSAGES' in clean, uppercase gray lettering, and a time indicator like 'now' or 'agora' (depending on the language) on the far right.
      - Main Content: A bold Sender Name (e.g. 'Wifey', 'Mãe', 'Amigo', 'Cliente', or 'Boss') and underneath it, the highly intriguing direct message.
    • BACKGROUND SCENE: 
      - The background behind the notification popup must be a raw, candid, unedited iPhone-style photograph (UGC style).
      - It should feature a real person with a natural smiling, surprised, or candid expression, or a realistic scenario of someone using or reacting to the product.
      - The background should have realistic depth of field, with the person or setting slightly out of focus, making the text message card in the foreground pop beautifully with perfect contrast and readability.
    • TEXT CONSTRAINT: The text on the notification bubble must be extremely clear, sharp, high-contrast, and 100% legible. Do NOT place any other text, prices, or secondary overlays anywhere on the image.
    `;
  } else if (style === 'Humor') {
    styleRules = `
    Humor / Relatable Split-Screen Comparison Rules:
    Goal: Create a highly engaging, funny, side-by-side comparison meme format showing a stark contrast between two very different things.
    • STYLE: Split-screen vertical layout (two halves clearly divided).
    • LEFT SIDE (THE GOOD OPTION / OUR SOLUTION):
      - Bright, vibrant, clean background (color should match/complement the product's context or vibe).
      - Top text: A punchy positive statement (e.g., "Power of Real [Product]").
      - Center: A clear, bright image of the high-quality product/solution.
      - Decorator: A casual, hand-drawn colored arrow pointing directly to the product.
      - Bottom text: A powerful benefit (e.g., "One Complete Meal", "Ultimate Comfort").
    • RIGHT SIDE (THE OLD WAY / COMMON ALTERNATIVE):
      - Dark, contrasting background (e.g., deep purple, dark grey).
      - Top text: Playful dismissal (e.g., "Nah..", "Hmm..", "Wait what?").
      - Center: A basic image of a related but distinct competing product or traditional alternative in the same category (e.g., if our product is fresh dog food, the right side is dry kibble). It must be visually distinct from the left side but clearly the "old way" of doing things.
      - Bottom text: A lighthearted punchline (e.g., "What?", "Not quite", "Try again").
    • TYPOGRAPHY: Clean, bold, highly legible sans-serif font.
    • NO BRAND LABELS: Do NOT use literal labels like "Our Product" or "Competitor".
    • TONE: Lighthearted, meme-like, relatable, and extremely fast to read. Avoid overly aggressive or negative words.
    `;
  } else if (style === 'Sign Meme' || style === 'Dude With Sign') {
    styleRules = `
    Sign Meme / Statement Cardboard / Change My Mind Creative Rules:
    Goal: Create a viral, candid, scroll-stopping social meme photograph featuring a bold statement on a sign, board, or table setup (inspired by viral phenomena like 'Dude With Sign' or 'Change My Mind').
    • REALISTIC PHOTOGRAPHY: Raw, unedited, candid iPhone lifestyle photo aesthetic (UGC feel). Natural lighting, authentic depth of field, real-world street, cafe, park, campus, home, or office setting with clean visual balance.
    • VISUAL VARIETY (DYNAMIC SCENE SETUP):
      - Format 1 (Street Cardboard / Dude With Sign): A relatable person standing in a city street, sidewalk, or cafe holding up a classic kraft brown cardboard sign with bold black handwritten marker letters.
      - Format 2 (Change My Mind Table): A person sitting outdoors at a folding table in a park or university plaza, with a banner or table sign and a coffee mug, looking relaxed with a confident smirk.
      - Format 3 (Office / Studio Whiteboard / Notepad): A person holding up a whiteboard, legal notepad, or clipboard with handwritten text.
      - Format 4 (Sidewalk Chalkboard): A stylish wooden A-frame cafe chalkboard sitting outside on a pavement with clean, legible chalk lettering.
    • THE STATEMENT / TEXT (CRITICAL):
      - The text on the sign MUST be 100% sharp, bold, high-contrast, and legible.
      - All text on the sign MUST be in ${getLangName(lang).toUpperCase()}.
      - The text must state the exact, punchy headline statement described in the visual prompt.
    • SECONDARY CIRCULAR INSET IMAGE (CRITICAL COMPLEMENTARY DETAIL):
      - In the top-right corner or upper-right area, display a stylish secondary circular inset image frame (with a clean thin white/dark border).
      - Inside this circular inset, show a sharp close-up detail of the physical product, key texture/feature, or a candid relatable reaction shot that complements the statement on the sign.
    • SUBJECT & EXPRESSION (ENGAGING & ATTENTION-GRABBING WITHOUT BEING OVER THE TOP): The person does NOT need to look strictly bored or deadpan. Give them a lively, captivating expression that stops the scroll naturally without looking exaggerated or cartoonish (e.g., a knowing playful smirk, an amused or intrigued direct eye contact, a witty eyebrow raise, a confident authentic smile, or a relatable 'aha' reaction).
    • PRODUCT INTEGRATION: If a base product image is provided, integrate the physical product naturally (in the circular inset and/or held casually in one hand or sitting on the table next to the coffee mug).
    • NO CLUTTER: Do not add unnecessary digital stickers, app UI overlays, fake buttons, or synthetic badges. Keep it looking like a real, viral social media photo.
    `;
  } else if (style === 'Positive Vibe') {
    // Dynamic palette variations for Positive Vibe
    const positiveVibePalettes = [
      { bg: "soft warm buttercup yellow (#FFF4BD)", text: "deep charcoal black (#111111)", accent: "cheerful orange and soft coral doodles" },
      { bg: "soft apricot peach (#FFE5D9)", text: "deep charcoal black (#111111)", accent: "warm terracotta and gentle gold doodles" },
      { bg: "serene pastel sky blue (#E0F2FE)", text: "deep charcoal black (#111111)", accent: "soft navy, sunny yellow and white cloud doodles" },
      { bg: "delicate lavender lilac (#EDE9FE)", text: "deep charcoal black (#111111)", accent: "purple, warm pink and butter yellow doodles" },
      { bg: "soft blush rose (#FCE7F3)", text: "deep charcoal black (#111111)", accent: "vibrant strawberry, tangerine and sage doodles" },
      { bg: "creamy mint foam / matcha sage (#D1FAE5)", text: "deep charcoal black (#111111)", accent: "forest green, warm amber and apricot doodles" },
      { bg: "warm terracotta rust (#C2593F)", text: "crisp pure white (#FFFFFF)", accent: "cream, mustard yellow and peach doodles" },
      { bg: "deep midnight navy blue (#1E293B)", text: "crisp pure white (#FFFFFF)", accent: "glowing gold, soft sky blue and warm cream doodles" },
      { bg: "rich plum / berry wine (#581C87)", text: "crisp pure white (#FFFFFF)", accent: "soft lilac, pastel yellow and warm pink doodles" },
      { bg: "warm deep mocha / espresso (#451A03)", text: "crisp pure white / bright cream (#FFFBEB)", accent: "warm honey, amber and soft peach doodles" },
      { bg: "vibrant sunset tangerine coral (#EA580C)", text: "crisp pure white (#FFFFFF)", accent: "warm cream, golden yellow and soft blush doodles" },
      { bg: "rich deep forest olive (#14532D)", text: "crisp pure white / ivory (#F0FDF4)", accent: "mint, soft gold and light peach doodles" }
    ];
    const randomPalette = positiveVibePalettes[Math.floor(Math.random() * positiveVibePalettes.length)];

    styleRules = `
    Positive Vibe / Wholesome Illustrated Quote Graphic Rules:
    Goal: Create a warm, uplifting, comforting, aesthetically pleasing editorial social media quote graphic with charming hand-drawn doodles directly inspired by the quote's story/metaphor and centered typography on a beautiful, clean, solid background with flawless reading contrast.
    • PRODUCT-ALIGNED PALETTE, TYPOGRAPHY & DOODLE ART:
      - The color palette, typography font style, and doodle illustrations MUST dynamically adapt to the specific PRODUCT, industry, and emotional mood:
        * Wellness / Skincare / Beauty: soft blush, peach, lavender, or sage tones with delicate serif typography and botanical leaves, skincare drops, or self-care doodles.
        * Productivity / Tech / Apps: calm sky blue, clean mint, or oat cream with clean modern sans-serif typography and friendly sparks, lightbulbs, or organized task doodles.
        * Fitness / Health / Energy: warm terracotta, sunny buttercup, or coral tones with bold inspiring typography and sunrise, sneakers, or dynamic energy doodles.
        * Food / Beverage / Coffee: warm mocha/espresso, caramel, or honey tones with cozy rustic serif typography and steaming cups, croissants, or bakery doodles.
        * Pets / Animals: warm friendly tones with playful rounded typography and cute paw prints, wagging tails, or pet accessory doodles.
        * Mindset / Coaching / Growth: soothing matcha green, serene lilac, or deep night blue with elegant book serif typography and sprouting seedlings, watering cans, tea mugs, or winding trail doodles.
    • DYNAMIC COLOR VARIETY: Use diverse, aesthetically pleasing solid color backgrounds across generations (such as ${randomPalette.bg} or other vibrant/pastel solid colors). The background must be smooth, clean, solid, and pleasant with zero harsh digital gradients or noisy artifacts.
    • TEXT CONTRAST & TYPOGRAPHY:
      - Display the short uplifting quote/affirmation in clear, crisp, elegant typography with generous line-height and centered alignment.
      - CONTRAST GUARANTEE: The text color MUST provide maximum optical contrast against the background:
        * On light / pastel backgrounds: typography MUST be deep charcoal black (#111111) for crisp readability.
        * On dark / rich / saturated backgrounds (such as terracotta, deep navy, rich plum, olive, or mocha): typography MUST be crisp pure white (#FFFFFF) or bright ivory for brilliant high contrast.
      - Recommended pairing for this generation: Background: ${randomPalette.bg} with Typography in ${randomPalette.text}.
    • HAND-DRAWN DOODLES & STORYTELLING ART: At the bottom edge or gently framing the canvas, include charming minimalist hand-drawn doodle illustrations with clean outlines and cheerful colored fills (${randomPalette.accent}). The doodles MUST relate directly to the product context, storytelling, and visual metaphor of the quote.
    • COMPOSITION: Symmetrical, balanced, breathable layout with generous negative space. Clean margins so text and doodles never touch the outer canvas borders.
    • NO PHOTOREALISTIC 3D GLOSS / NO SCI-FI: Pure charming illustrated graphic design that feels heartfelt, artistic, wholesome, and instantly shareable on Instagram/Pinterest/Facebook.
    • IGNORE BASE IMAGES / ZERO REALISTIC PRODUCT PHOTOS: Strictly do NOT composite or force real photo cutouts or product packaging photos into this graphic. Keep the entire artwork purely illustrated in clean graphic doodle style.
    `;
  } else if (style === 'Handwritten Note' || style === 'Journal Note' || style === 'Journal Inspiration' || style === 'Redacted Truth' || style === 'Censored Truth') {
    styleRules = `
    Handwritten Note / Raw iPhone Photo / Clean Minimal Background Creative Rules:
    Goal: Create an authentic, raw, unedited candid photo taken with an everyday iPhone of a handwritten note or notepad on a clean surface with minimal/low background noise.
    • COMPOSITION & SETTING (IPHONE PHOTO WITH VERY LOW VISUAL NOISE):
      - Candid top-down flatlay or slight macro angle taken directly from an iPhone camera.
      - A clean, simple piece of paper, notepad, post-it, or minimalist open notebook resting on a clean plain surface (e.g. clean neutral desk, minimalist tabletop, or bedsheet).
      - MINIMAL BACKGROUND NOISE / VERY LOW CLUTTER: Keep the background extremely clean, calm, and uncluttered without distracting props or busy textures.
      - Natural everyday lighting (soft natural daylight from a nearby window, no artificial glossy studio lights).
    • THE HANDWRITTEN NOTE (THE HERO):
      - The text on the paper MUST look genuinely HANDWRITTEN by a real person with a black or dark blue ballpoint pen, gel pen, or marker.
      - The handwriting must be 100% CLEAR, LEGIBLE, and natural (not robotic digital fonts, but real human handwriting).
      - The statement MUST state the exact headline text in ${getLangName(lang).toUpperCase()}.
      - Can include subtle authentic touches like a natural quick underline under 1-2 words or a small star/bullet point.
    • PRODUCT INTEGRATION:
      - If a base product image is provided, integrate the physical product naturally and subtly next to the paper on the clean surface.
    • NO ARTIFICIAL CLUTTER: Zero synthetic badges, fake 3D stickers, digital overlays, or corporate marketing banners. It must look like a real photo snapped on a smartphone.
    `;
  } else {
    // Default / General fallback
    styleRules = `
    TASK: Professional Commercial Photography taken from iphone.
    SCENE & SETTING: ${prompt}.
    TECHNICAL: Photorealistic, 8k, studio lighting.
    `;
  }

  const rawUgcOverride = (style !== 'YouTube-Thumbnail' && style !== 'Product-First' && style !== 'Storytelling' && style !== 'Versus' && style !== 'Short-Human' && style !== 'SMS-Mockup' && style !== 'Secret Info' && style !== 'Secret Insider' && style !== 'Native-Social' && style !== 'Humor' && style !== 'Sign Meme' && style !== 'Dude With Sign' && style !== 'Handwritten Note' && style !== 'Journal Note' && style !== 'Journal Inspiration' && style !== 'Redacted Truth' && style !== 'Censored Truth' && style !== 'Highlight Method' && style !== 'Positive Vibe') ? `
    CRITICAL IMAGE STYLE OVERRIDE (INSTAGRAM MANDATORY STYLE):
    • OVERRIDE ESTHETIC: "foto natural raw unedited tirada do iphone ugc style, com fundo simples com pouco ruído visual".
    • The scene must look completely real, raw, candid, authentic, and amateur as if taken on an everyday smartphone camera (iPhone).
    • The background MUST have minimal details, a simple setting, and very low visual noise / clutter.
    • Avoid all signs of: professional studio setups, artificial lighting, sterile stock setups, clean 3D renderings, flawless commercial design setups, or pristine synthetic visuals.
  ` : "";

  const isFaceless = selectedAngles.some(a => a.toLowerCase().includes("faceless"));
  const facelessOverride = isFaceless ? `
    🚫 ABSOLUTE MANDATORY NEGATIVE CONSTRAINT — FACELESS FRAMING (ZERO FACES / NÃO MOSTRAR CARA):
    • DO NOT SHOW ANY HUMAN FACE. 
    • The visual and model MUST be completely faceless. 
    • Frame the visual strictly without any human face visible: crop carefully from the neck or chest down, position the camera behind the person/over-the-shoulder, show hands and arms interacting with the product, or focus directly on the product in its environment.
    • OVERRIDE: Completely disregard and discard any other instruction that mentions smiling, facial expressions, eye contact, looking into the camera, or lighting on a face. Absolutely zero facial features (eyes, nose, mouth) may appear anywhere in the final image.
  ` : "";

  let processedStyleRules = styleRules;
  let sanitizedVisualPrompt = prompt;

  if (isFaceless) {
    processedStyleRules = processedStyleRules
      .replace(/The model must be smiling naturally, with genuine candid natural expression\./g, "The shot must be strictly faceless (crop below neck or show hands/body interacting without visible face).")
      .replace(/The model’s face should be well-lit, showing natural skin texture, pores and expression detail\./g, "The subject is faceless; focus lighting on the hands, product, and material textures.");

    sanitizedVisualPrompt = sanitizedVisualPrompt
      .replace(/focalizando a expressão sincera do modelo sorrindo de forma natural/gi, "enquadramento faceless sem mostrar a cara, foco no produto e mãos")
      .replace(/expressão sincera do modelo sorrindo/gi, "interação natural sem mostrar a cara (faceless)")
      .replace(/smiling model/gi, "faceless model (no visible face)")
      .replace(/smiling naturally/gi, "faceless interaction (no face visible)");
  }

  return `
    ${priorityHeader}
    
    📸 CRITICAL MANDATORY CAMERA ANGLE & FRAMING DIRECTIVE (HIGHEST PRIORITY):
    • MANDATORY CAMERA ANGLE(S): >> ${combinedAngleLabel.toUpperCase()} <<
    • FRAMING EXECUTION INSTRUCTION:
      ${framingInstructionsCombined}
    • ABSOLUTE COMPOSITION MANDATE: The camera framing is the most decisive visual factor in this image. You MUST strictly compose, align, and shoot the scene adhering 100% to this exact camera perspective (${combinedAngleLabel}). Do NOT revert to a generic angle or default shot. The entire optical composition, camera distance, focal perspective, lens tilt/elevation, and depth-of-field MUST unambiguously embody this ${combinedAngleLabel} framing!
    ${facelessOverride}

    ${rawUgcOverride}
    ${processedStyleRules}

    SPECIFIC CONTEXT FOR THIS GENERATION:
    VISUAL DESCRIPTION: ${sanitizedVisualPrompt}
    CAMERA ANGLE / ENQUADRAMENTO: ${combinedAngleLabel}
    ${isFaceless ? 'FACELESS MANDATE: DO NOT SHOW ANY FACES. Frame strictly without showing head/face.' : ''}
    FRAMING DIRECTIVES: ${selectedAngles.map((a, i) => `[${i + 1}] ${a}: ${angleDetailedDirectives[i]}`).join(" | ")}
    FRAMING CONSTRAINT: This image will be explicitly cropped to a tight vertical 4:5 aspect ratio (Instagram/Meta Portrait format). Ensure the main subject, texts, and CTA are centered and vertically aligned so they fit perfectly within a 4:5 vertical portrait screen layout with the requested ${combinedAngleLabel} perspective.
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
            1. Usa o framework de Direct Response (Hook -> Pain -> Mechanism -> Proof -> CTA). No Hook e Pain, menciona o problema do cliente com as palavras exatas que ele fala para ele próprio no seu diálogo interno, com escrita simples ao nível do 4º ano (4th-grade level writing, sem jargão).
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
            
            CRITICAL DESIGN REQUIREMENT FOR THE 3 SUGGESTIONS:
            - EXACTLY ONE OF THE SUGGESTIONS (strictly the first one) MUST be a completely original, highly creative, custom software or digital tool concept developed exclusively for the Dream Buyers of this product. It must be a bespoke, brand new software idea that directly addresses and solves their primary pain point and main Jobs-to-be-Done (JTBD) in a spectacular, innovative way. Give it a highly creative, unique, and professional original name.
            - The other 2 suggestions should be existing, highly curated digital utilities or platforms (e.g., specialized set-ups on platforms like Notion, Canva, Loom, Trello, ChatGPT, or niche tools) that complement their day-to-day work or experience.
            
            For each recommended tool, you MUST provide:
            1. name: Name of the software/extension/tool (For the first suggestion: a completely new, original app name. For others: Notion, Canva, Loom, Trello, ChatGPT, Miro, or specialized niche apps fitting the product's audience)
            2. category: The category (e.g. Productivity, Financial Tracker, Content Design, Communication, Deep Work, Bespoke Custom Solution)
            3. overview: Explain what this tool is and how it helps the customer achieve their Jobs to be done in their day-to-day life/workflow. For the first suggestion, highlight how this brand new original tool specifically solves their main pain point.
            4. objective: Clear objective of why they should use this specific digital tool.
            5. ultimateOutcome: What constitutes a spectacular outcome of using this tool successfully (e.g. "A beautifully organized content calendar updated in under 10 minutes a week").
            6. why: Why this tool is a perfect fit for this specific audience or problem.
            7. aiAgent: Specify the primary digital utility, main feature, or integrated AI assistant they should use within that tool (e.g. "ChatGPT Copywriting Assistant", "Notion AI Content Organizer", "Loom Video Recorder").
            8. subAgents: Recommended companion tools or browser extensions (name, role, and a list of skills) to maximize their experience with the primary tool.
            9. initialPrompt:
               - For the FIRST suggestion (the custom original software concept): This field MUST be an extremely extensive, high-fidelity, complete, and highly structured initial prompt formatted as a thorough Product Requirement Document (PRD) designed to guide any AI coding assistant to build/code this app seamlessly ("vibecoding"). It MUST follow this exact PRD structure and contain these detailed sections:
                 • 1. SUMÁRIO EXECUTIVO (Executive Summary): Short high-impact introduction of the tool and the main problem it solves.
                 • 2. GOAL FINAL (The Ultimate Goal): The core vision and ultimate business/personal value it delivers.
                 • 3. CUSTOMER JOURNEY & USER STORIES: Map the user's emotional and operational path, including specific user stories outlining their pain points, actions, and successful resolutions.
                 • 4. PRINCÍPIO DE PARETO (80/20 Pareto Features): Define the critical 20% of features that will deliver 80% of the value. Do not overcomplicate; keep the scope highly focused on the core utility while listing precise stateful widgets, inputs, and interactive panels.
                 • 5. ESTRUTURA DE LAYOUTS (Focus on the Main Interface): Explicit description of the primary user interface layout. Focus 100% on the central screen/view, step-by-step element hierarchy, side panels, and content blocks.
                 • 6. DIRETRIZES VISUAIS (Visual Guidelines & UI/UX): Specific custom Tailwind theme, refined CSS color combinations, elegant modern typography pairings (e.g. Space Grotesk/Inter), aesthetic lighting effects (e.g. glassmorphism or sleek dark/light theme), hover behaviors, micro-interactions, responsive grids, and clean borders.
                 • 7. COMPLETE CODING PROMPT DIRECTIVE: Authoritative and directive prompt copy-paste wording written in a direct coding style, instructing the AI to output a fully functional, highly polished, zero-bug React/Tailwind/TypeScript implementation on the first attempt.
               - For the other 2 standard suggestions: A high-quality, practical setup prompt or template guide (minimum 2 paragraphs) customized for that platform.
            10. tasks: A list of 4-6 specific, actionable steps/tasks they can follow to config and run this tool.
            `;
};

