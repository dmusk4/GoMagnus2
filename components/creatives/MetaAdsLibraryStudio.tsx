import React, { useState, useEffect } from 'react';
import { 
  Search, Sparkles, ShieldAlert, TrendingUp, BarChart3, Target, Award, 
  CheckCircle2, Zap, Plus, X, ArrowRight, Eye, Flame, Layers, RefreshCw, Copy, Check
} from 'lucide-react';
import { Product, Language, MetaAdsLibraryAnalysis, MetaAdTeardown } from '../../types';
import { getTranslation } from '../../translations';

interface MetaAdsLibraryStudioProps {
  product: Product;
  language: Language;
  isLibraryLoading: boolean;
  onRunAnalysis: (keywords: string, location: string, competitors: string[]) => Promise<void>;
  onApplyHookAsCreative?: (hookText: string, angleText: string) => void;
  onUpdateProduct?: (updates: Partial<Product>) => void;
}

export const MetaAdsLibraryStudio: React.FC<MetaAdsLibraryStudioProps> = ({
  product,
  language,
  isLibraryLoading,
  onRunAnalysis,
  onApplyHookAsCreative,
  onUpdateProduct
}) => {
  const t = getTranslation(language);
  const isPt = language === 'pt';
  const isEs = language === 'es';

  // Initialize input states
  const initialKeywords = product.creativeSettings?.metaLibraryKeywords !== undefined
    ? product.creativeSettings.metaLibraryKeywords
    : (product.campaignPlan?.keywords?.map(k => k.term).slice(0, 5).join(', ') || product.name);

  const initialLocation = product.creativeSettings?.metaLibraryLocation !== undefined
    ? product.creativeSettings.metaLibraryLocation
    : (product.location || 'Portugal');

  const initialCompetitors = product.creativeSettings?.metaLibraryCompetitors !== undefined
    ? product.creativeSettings.metaLibraryCompetitors
    : (product.marketIntel?.competitors?.map(c => c.name) || []);

  const [keywordsInput, setKeywordsInput] = useState(initialKeywords);
  const [locationInput, setLocationInput] = useState(initialLocation);
  const [competitors, setCompetitors] = useState<string[]>(initialCompetitors);
  const [newCompetitorText, setNewCompetitorText] = useState('');
  const [appliedHookId, setAppliedHookId] = useState<string | null>(null);

  const analysis: MetaAdsLibraryAnalysis | undefined = product.metaAdsAnalysis;

  const handleAddCompetitor = () => {
    if (newCompetitorText.trim() && !competitors.includes(newCompetitorText.trim())) {
      const updated = [...competitors, newCompetitorText.trim()];
      setCompetitors(updated);
      setNewCompetitorText('');
      if (onUpdateProduct) {
        onUpdateProduct({
          creativeSettings: {
            ...product.creativeSettings,
            metaLibraryCompetitors: updated
          }
        });
      }
    }
  };

  const handleRemoveCompetitor = (name: string) => {
    const updated = competitors.filter(c => c !== name);
    setCompetitors(updated);
    if (onUpdateProduct) {
      onUpdateProduct({
        creativeSettings: {
          ...product.creativeSettings,
          metaLibraryCompetitors: updated
        }
      });
    }
  };

  const handleRun = () => {
    // Save settings
    if (onUpdateProduct) {
      onUpdateProduct({
        creativeSettings: {
          ...product.creativeSettings,
          metaLibraryKeywords: keywordsInput,
          metaLibraryLocation: locationInput,
          metaLibraryCompetitors: competitors
        }
      });
    }
    onRunAnalysis(keywordsInput, locationInput, competitors);
  };

  const handleUseHook = (ad: MetaAdTeardown) => {
    if (onApplyHookAsCreative) {
      onApplyHookAsCreative(ad.visualHookDescription || ad.adHeadline, `${ad.competitorName}: ${ad.copyAngle}`);
      setAppliedHookId(ad.id);
      setTimeout(() => setAppliedHookId(null), 2500);
    }
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score >= 70) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (score >= 55) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* HEADER CARD */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 shadow-2xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-4 backdrop-blur-md">
            <Search size={14} className="text-indigo-400" />
            Meta Ads Library Intelligence
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
            {isPt ? 'Análise do Meta Ads Library dos Concorrentes' : isEs ? 'Análisis de Meta Ads Library de Competidores' : 'Competitor Meta Ads Library Analysis'}
          </h2>
          <p className="mt-2 text-indigo-200/90 text-sm sm:text-base max-w-2xl leading-relaxed">
            {isPt 
              ? 'Espione e analise os anúncios ativos dos concorrentes na Biblioteca de Anúncios do Meta. Receba pontuações, identificação do que funciona e sugestões acionáveis.' 
              : isEs 
              ? 'Espíe y analice los anuncios activos de la competencia en la Biblioteca de Anuncios de Meta. Obtenga puntuaciones, patrones ganadores y sugerencias.' 
              : 'Spy and analyze active competitor ads in Meta Ads Library. Get scoring, winning pattern identification, and actionable suggestions.'}
          </p>

          {/* INPUT FIELDS PANEL */}
          <div className="mt-6 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Keywords */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1.5">
                  {isPt ? 'Palavras-Chave Específicas' : isEs ? 'Palabras Clave Específicas' : 'Specific Keywords'}
                </label>
                <input 
                  type="text"
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  placeholder={isPt ? 'Ex: software contábil, gestão financeira' : 'e.g. accounting software, financial management'}
                  className="w-full bg-slate-900/80 border border-indigo-300/30 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1.5">
                  {isPt ? 'Localização / Mercado Target' : isEs ? 'Ubicación / Mercado Objetivo' : 'Location / Target Market'}
                </label>
                <input 
                  type="text"
                  value={locationInput}
                  onChange={(e) => setLocationInput(e.target.value)}
                  placeholder="e.g. Portugal, Brasil, United States"
                  className="w-full bg-slate-900/80 border border-indigo-300/30 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all"
                />
              </div>
            </div>

            {/* Competitors List Tagging */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-indigo-200 mb-1.5">
                {isPt ? 'Concorrentes a Analisar' : isEs ? 'Competidores a Analizar' : 'Competitors to Analyze'}
              </label>
              
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {competitors.map((comp, idx) => (
                  <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/30 border border-indigo-300/30 text-xs font-medium text-indigo-100">
                    {comp}
                    <button onClick={() => handleRemoveCompetitor(comp)} className="hover:text-rose-300 transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}

                {competitors.length === 0 && (
                  <span className="text-xs text-indigo-300/70 italic">
                    {isPt ? 'Nenhum concorrente específico adicionado (o Gemini identificará os principais do seu nicho).' : 'No specific competitors added (Gemini will identify top ones in your niche).'}
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <input 
                  type="text"
                  value={newCompetitorText}
                  onChange={(e) => setNewCompetitorText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCompetitor(); } }}
                  placeholder={isPt ? 'Adicionar concorrente (ex: Nome ou Página)' : 'Add competitor name or page'}
                  className="flex-1 bg-slate-900/80 border border-indigo-300/30 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button 
                  onClick={handleAddCompetitor}
                  type="button"
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shrink-0"
                >
                  <Plus size={14} />
                  {isPt ? 'Adicionar' : 'Add'}
                </button>
              </div>
            </div>

            {/* RUN ACTION BUTTON */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleRun}
                disabled={isLibraryLoading}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-500 hover:bg-indigo-400 active:scale-98 disabled:opacity-50 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLibraryLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    {isPt ? 'Escaneando Meta Ads Library...' : 'Scanning Meta Ads Library...'}
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    {isPt ? 'Analisar Meta Ads dos Concorrentes' : 'Analyze Competitor Meta Ads'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ANALYSIS RESULTS SECTION */}
      {analysis && (
        <div className="space-y-8 animate-slide-up">
          {/* SUMMARY & DOMINANT FORMATS GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Landscape Summary */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-3">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <BarChart3 size={18} />
                <h3>{isPt ? 'Visão Geral do Mercado no Meta Ads' : 'Meta Ads Landscape Overview'}</h3>
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">
                {analysis.overallLandscapeSummary}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs text-gray-500 border-t border-gray-50">
                <span className="font-semibold text-gray-700">{isPt ? 'Parâmetros:' : 'Parameters:'}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">KW: {analysis.keywordsUsed}</span>
                <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600">{analysis.locationAnalyzed}</span>
              </div>
            </div>

            {/* Dominant Formats Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                <Layers size={18} />
                <h3>{isPt ? 'Formatos Dominantes' : 'Dominant Formats'}</h3>
              </div>
              <div className="space-y-3">
                {analysis.dominantFormats?.map((fmt, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-gray-700">
                      <span>{fmt.format}</span>
                      <span className="text-indigo-600">{fmt.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(100, Math.max(5, fmt.percentage))}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 italic">{fmt.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* TOP ANALYZED ADS / TEARDOWNS WITH SCORING */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 flex items-center gap-2">
                  <Award className="text-indigo-600" size={20} />
                  {isPt ? 'Teardowns e Scoring dos Anúncios dos Concorrentes' : 'Competitor Ads Teardowns & Scoring'}
                </h3>
                <p className="text-xs text-gray-500">
                  {isPt ? 'Análise detalhada de ganchos, copy, formatos e pontuação de eficácia.' : 'In-depth breakdown of hooks, copy, formats, and performance scores.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {analysis.topAnalyzedAds?.map((ad) => (
                <div key={ad.id} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    {/* Top Header: Competitor & Format Badge */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          {ad.competitorName}
                        </span>
                        <h4 className="text-base font-bold text-gray-900 line-clamp-2">
                          "{ad.adHeadline}"
                        </h4>
                      </div>
                      <div className="shrink-0 flex flex-col items-end gap-1">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getScoreBadgeColor(ad.scores.overallScore)}`}>
                          {ad.scores.overallScore}/100 Score
                        </span>
                        <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-600 text-[11px] font-medium">
                          {ad.format}
                        </span>
                      </div>
                    </div>

                    {/* Scores Detailed Grid */}
                    <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 rounded-xl mb-4 border border-slate-100 text-center">
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">Hook</div>
                        <div className="text-xs font-bold text-gray-800">{ad.scores.hookScore}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">Copy</div>
                        <div className="text-xs font-bold text-gray-800">{ad.scores.copyPersuasionScore}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">Visual</div>
                        <div className="text-xs font-bold text-gray-800">{ad.scores.visualImpactScore}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">Offer</div>
                        <div className="text-xs font-bold text-gray-800">{ad.scores.offerClarityScore}</div>
                      </div>
                    </div>

                    {/* Visual Hook & Copy Angle */}
                    <div className="space-y-2 text-xs text-gray-700 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/60 mb-4">
                      <div>
                        <span className="font-bold text-indigo-900">{isPt ? 'Hook Visual:' : 'Visual Hook:'} </span>
                        <span>{ad.visualHookDescription}</span>
                      </div>
                      <div>
                        <span className="font-bold text-indigo-900">{isPt ? 'Ângulo da Copy:' : 'Copy Angle:'} </span>
                        <span>{ad.copyAngle}</span>
                      </div>
                      <div>
                        <span className="font-bold text-indigo-900">CTA: </span>
                        <span className="font-semibold text-indigo-700">{ad.ctaText}</span>
                      </div>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="space-y-2 mb-4">
                      <div className="flex flex-wrap gap-1.5">
                        {ad.strengths?.map((s, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100">
                            <CheckCircle2 size={10} /> {s}
                          </span>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {ad.weaknesses?.map((w, i) => (
                          <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 text-rose-700 text-[11px] font-medium border border-rose-100">
                            <ShieldAlert size={10} /> {w}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Why It Works */}
                    <p className="text-xs text-gray-600 italic bg-gray-50 p-3 rounded-xl border border-gray-100">
                      <strong>{isPt ? 'Por que funciona:' : 'Why it works:'}</strong> {ad.whyItWorks}
                    </p>
                  </div>

                  {/* ACTION: APPLY HOOK TO CREATIVE */}
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleUseHook(ad)}
                      className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {appliedHookId === ad.id ? (
                        <>
                          <Check size={14} className="text-emerald-600" />
                          {isPt ? 'Inspirado & Aplicado!' : 'Inspired & Applied!'}
                        </>
                      ) : (
                        <>
                          <Zap size={14} className="text-indigo-600" />
                          {isPt ? 'Inspirar-se & Usar este Ângulo no Meta Ads' : 'Use Angle for Meta Ad Creative'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* "O QUE FUNCIONA" (WINNING PATTERNS) SECTION */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white space-y-6 shadow-xl border border-indigo-900/50">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                  <Flame className="text-amber-400" size={22} />
                  {isPt ? 'O Que Funciona no Mercado (Padrões Vencedores)' : 'What Works (Winning Patterns)'}
                </h3>
                <p className="text-xs text-indigo-200 mt-1">
                  {isPt ? 'Padrões de alto desempenho validados na Meta Ads Library para este nicho.' : 'High-performing validated patterns from Meta Ads Library in this niche.'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Best Visual Hooks */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2">
                  <Eye size={16} />
                  {isPt ? 'Melhores Ganchos Visuais' : 'Best Visual Hooks'}
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {analysis.winningPatterns?.bestVisualHooks?.map((hook, i) => (
                    <li key={i} className="flex items-start gap-2 bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                      <span>{hook}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Winning Copy Angles */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-indigo-300 flex items-center gap-2">
                  <Zap size={16} />
                  {isPt ? 'Ângulos de Copy Vencedores' : 'Winning Copy Angles'}
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {analysis.winningPatterns?.winningCopyAngles?.map((angle, i) => (
                    <li key={i} className="flex items-start gap-2 bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0 mt-1.5" />
                      <span>{angle}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Top Call To Actions */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <Target size={16} />
                  {isPt ? 'CTAs de Alta Conversão' : 'Top Call To Actions'}
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {analysis.winningPatterns?.topCallToActions?.map((cta, i) => (
                    <li key={i} className="flex items-start gap-2 bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span>{cta}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Common Offers & Pricing */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <BarChart3 size={16} />
                  {isPt ? 'Ofertas & Preçário Detectados' : 'Common Offers & Pricing'}
                </h4>
                <ul className="space-y-2 text-xs text-slate-200">
                  {analysis.winningPatterns?.commonOffersAndPricing?.map((offer, i) => (
                    <li key={i} className="flex items-start gap-2 bg-white/5 p-2.5 rounded-lg border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0 mt-1.5" />
                      <span>{offer}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* STRATEGIC RECOMMENDATIONS FOR PRODUCT */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <TrendingUp className="text-indigo-600" size={20} />
                {isPt ? 'Sugestões Acionáveis para o seu Produto' : 'Strategic Recommendations for Your Product'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {analysis.strategicRecommendations?.map((rec, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-indigo-600">{rec.title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-700">
                        {rec.impact} {isPt ? 'Impacto' : 'Impact'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {rec.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200">
                    <div className="text-[11px] font-bold text-gray-700 mb-1">
                      {isPt ? 'Gancho Sugerido:' : 'Suggested Hook:'}
                    </div>
                    <p className="text-xs font-semibold text-indigo-900 bg-indigo-50 p-2.5 rounded-xl border border-indigo-100">
                      "{rec.actionableHookToTry}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
