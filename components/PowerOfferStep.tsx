
import React, { useRef } from 'react';
import { Loader2, Sparkles, RefreshCw, Star, Gift, CheckCircle2, ShieldCheck, Shield, Hourglass, Zap, Megaphone, Trash2, Compass } from 'lucide-react';
import { Product, UniqueOffer, BigIdea, Language } from '../types';
import { getTranslation } from '../translations';

interface PowerOfferStepProps {
  product: Product;
  language: Language;
  loading: boolean;
  onGenerate: (focus?: string) => void | Promise<void>;
  onUpdateOffer: (offer: UniqueOffer) => void;
  onUpdateIdea: (idea: BigIdea) => void;
  onClear: () => void;
  showValidation?: boolean;
  validationTrigger?: number;
  // Added helper to persist text while typing without triggering generation
  onUpdateFocus?: (focus: string) => void;
  taskQueue: Set<string>;
  onRefreshOffer?: () => void;
  onRefreshBigIdea?: () => void;
}

const parseBulletPoints = (text: string): string[] => {
    if (!text) return [];
    const raw = text.split(/\n|•|\r/).map(line => line.trim().replace(/^[-*•\d+.]\s*/, '').trim()).filter(line => line.length > 0);
    if (raw.length > 1) return raw;
    const sentences = text.split(/(?<=\.)\s+(?=[A-ZÀ-Ú])/).map(s => s.trim()).filter(s => s.length > 0);
    if (sentences.length > 1 && text.length > 90) return sentences;
    return [text];
};

export const PowerOfferStep: React.FC<PowerOfferStepProps> = ({ product, language, loading, onGenerate, onUpdateOffer, onUpdateIdea, onClear, showValidation = false, validationTrigger = 0, onUpdateFocus, taskQueue, onRefreshOffer, onRefreshBigIdea }) => {
    const offer = product.offer;
    const idea = product.bigIdea;
    const containerRef = useRef<HTMLDivElement>(null);
    const t = getTranslation(language);
    
    // Use persistent state from product
    const strategicFocus = product.offerFocus || "";

    const isOfferLoading = taskQueue.has(`offer-gen-${product.id}-offer`);
    const isBigIdeaLoading = taskQueue.has(`offer-gen-${product.id}-bigIdea`);

    const RefreshButton = ({ onClick, loading }: { onClick?: () => void, loading: boolean }) => (
        onClick ? (
            <button 
                onClick={onClick} 
                disabled={loading}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-50"
                title={t.common.refresh}
            >
                <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
        ) : null
    );

    if (!offer && !idea && !loading) { 
      return (
        <div className="animate-slide-up w-full">
          <h2 className="text-4xl font-display font-bold mb-3 tracking-tight text-gray-900">{t.offerStep.title}</h2>
          <p className="text-lg text-gray-500 mb-6">{t.offerStep.subtitle}</p>
          
          <div className="mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-500/5">
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
               <Compass size={14} className="text-indigo-500" /> {t.dreamBuyerStep.pivotLabel || "Strategic Direction (Optional)"}
             </label>
             <div className="flex flex-col md:flex-row gap-3">
                 <input 
                    type="text" 
                    value={strategicFocus}
                    onChange={(e) => onUpdateFocus?.(e.target.value)}
                    placeholder={t.dreamBuyerStep.pivotPlaceholder || "Ex: Focus on affluent urban professionals or parents of twins..."}
                    className="flex-1 bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
                 />
                 <button 
                     onClick={() => onGenerate(strategicFocus)}
                     disabled={loading}
                     className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 w-full md:w-auto shrink-0"
                 >
                     <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                     {t.common.refresh}
                 </button>
             </div>
          </div>

          <div ref={containerRef} className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all group border-gray-200 bg-gray-50/50 hover:bg-gray-50`}>
              <div className={`w-20 h-20 rounded-full shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 bg-white text-indigo-600`}>
                  <Zap size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t.offerStep.emptyTitle}</h3>
              <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">{t.offerStep.emptyDesc}</p>
              <button onClick={() => onGenerate(strategicFocus)} className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center mx-auto hover:-translate-y-1 active:translate-y-0 shadow-lg group">
                <Sparkles className="mr-2 group-hover:scale-110 transition-transform" size={18}/> {t.offerStep.buildBtn}
              </button>
          </div>
        </div>
      );
    }

    if (loading && !offer && !idea) {
      return (
        <div className="animate-slide-up w-full">
          <h2 className="text-4xl font-display font-bold mb-3 tracking-tight text-gray-900">{t.offerStep.title}</h2>
          <p className="text-lg text-gray-500 mb-10">{t.offerStep.subtitle}</p>
          <div className="py-20 text-center animate-pulse w-full bg-white rounded-3xl border border-gray-100">
            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-8" size={48} />
            <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{t.offerStep.engineering}</h3>
            <p className="text-gray-500 italic">Designing your high-conversion mechanism and value stack...</p>
          </div>
        </div>
      );
    }

    return (
        <div className="animate-slide-up relative pb-16 w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-4xl font-display font-bold text-gray-900">{t.offerStep.title}</h2>
                    <p className="text-lg text-gray-500 mt-2">{t.offerStep.subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onClear}
                        disabled={loading}
                        className="p-3 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center gap-2 group/clear shadow-sm bg-white"
                        title={t.common.clearData}
                    >
                        <Trash2 size={16} />
                        <span className="text-xs font-bold hidden sm:inline">{t.common.clearData}</span>
                    </button>
                </div>
            </div>

            <div className="mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-500/5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Compass size={14} className="text-indigo-500" /> {t.dreamBuyerStep.pivotLabel || "Strategic Direction (Optional)"}
                </label>
                <div className="flex flex-col md:flex-row gap-3">
                    <input 
                        type="text" 
                        value={strategicFocus}
                        onChange={(e) => onUpdateFocus?.(e.target.value)}
                        placeholder={t.dreamBuyerStep.pivotPlaceholder || "Ex: Focus on affluent urban professionals or parents of twins..."}
                        className="flex-1 bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                    <button 
                        onClick={() => onGenerate(strategicFocus)}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 w-full md:w-auto shrink-0"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        {t.common.refresh}
                    </button>
                </div>
            </div>
            
            <div className={`space-y-12 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                <section className="space-y-6">
                    <div className="flex items-center justify-between text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">
                        <div className="flex items-center"><div className="w-6 h-px bg-gray-200 mr-2"></div>01. {t.offerStep.theOffer}</div>
                        <RefreshButton onClick={onRefreshOffer} loading={isOfferLoading} />
                    </div>
                    {offer ? (
                      <div className="space-y-6 animate-fade-in w-full">
                          {offer.paretoFocus && (
                              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform duration-500">
                                      <Zap size={160} className="text-indigo-200" />
                                  </div>
                                  <div className="relative z-10">
                                      <div className="flex items-center space-x-2 mb-6">
                                          <div className="p-2 bg-indigo-500/20 backdrop-blur rounded-lg text-indigo-300">
                                              <Compass size={20} />
                                          </div>
                                          <h3 className="text-xl font-bold text-white uppercase tracking-wider">{t.offerStep.paretoTitle}</h3>
                                      </div>
                                      
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
                                              <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2 flex items-center">
                                                  <Zap size={14} className="mr-1" /> {t.offerStep.pareto20}
                                              </div>
                                              <p className="text-white font-medium leading-relaxed">{offer.paretoFocus.the20Percent}</p>
                                          </div>
                                          <div className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700">
                                              <div className="text-xs font-bold text-green-400 uppercase tracking-widest mb-2 flex items-center">
                                                  <CheckCircle2 size={14} className="mr-1" /> {t.offerStep.pareto80}
                                              </div>
                                              <p className="text-white font-medium leading-relaxed">{offer.paretoFocus.the80PercentOutcome}</p>
                                          </div>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div className="bg-indigo-900/40 p-6 rounded-2xl border border-indigo-500/30">
                                              <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">{t.offerStep.paretoInnovation}</div>
                                              <p className="text-indigo-100 font-medium leading-relaxed">{offer.paretoFocus.innovationStrategy}</p>
                                          </div>
                                          <div className="bg-indigo-900/40 p-6 rounded-2xl border border-indigo-500/30">
                                              <div className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">{t.offerStep.paretoAction}</div>
                                              <p className="text-indigo-100 font-medium leading-relaxed">{offer.paretoFocus.focusAction}</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all">
                              <div className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4"><Star size={12} className="mr-1 fill-indigo-700"/> {t.offerStep.corePromise}</div>
                              <h3 className="text-3xl font-display font-bold text-gray-900 mb-2 leading-tight">"{offer.headline}"</h3>
                              <p className="text-gray-500 text-lg">{t.offerStep.deliveredIn} {offer.timeframe}</p>
                          </div>
                          <div className="bg-gradient-to-b from-gray-50 to-white p-8 rounded-3xl border border-gray-200 shadow-inner">
                              <div className="flex items-center mb-6"><h3 className="text-xl font-bold text-gray-900 flex items-center"><Gift size={20} className="mr-2 text-indigo-500"/> {t.offerStep.valueStack}</h3></div>
                              <div className="space-y-4">
                                  {offer.bonuses.map((bonus, idx) => (
                                      <div key={idx} className="flex items-start bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
                                          <div className="p-2 bg-green-50 rounded-lg text-green-600 mr-4 mt-1"><CheckCircle2 size={18} /></div>
                                          <div className="flex-1">
                                              <div className="flex justify-between w-full mb-1">
                                                  <h4 className="font-bold text-gray-900">{bonus.title}</h4>
                                                  <span className="text-xs font-bold bg-gray-900 text-white px-2 py-0.5 rounded ml-2 whitespace-nowrap">{bonus.value}</span>
                                              </div>
                                              <p className="text-sm text-gray-600 leading-relaxed">{bonus.description}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                              <div className="mt-6 pt-6 border-t border-dashed border-gray-300">
                                  <p className="text-sm text-center text-gray-500 font-bold uppercase tracking-wide">{t.offerStep.investmentLogic}</p>
                                  <p className="text-center text-gray-900 font-bold text-xl mt-1">{offer.priceAnchor}</p>
                              </div>
                          </div>
                          <div className="bg-white p-8 rounded-3xl border-2 border-green-500/20 shadow-xl shadow-green-500/5 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 p-8 opacity-10"><ShieldCheck size={120} className="text-green-600" /></div>
                              <div className="relative z-10">
                                  <div className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4"><Shield size={12} className="mr-1 fill-green-700"/> {t.offerStep.guaranteeTitle}</div>
                                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">{t.offerStep.guaranteeTitle}</h3>
                                  <p className="text-xl text-gray-700 font-medium leading-relaxed">{offer.riskReversal}</p>
                              </div>
                          </div>
                          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-start">
                              <div className="p-3 bg-white rounded-xl text-red-500 shadow-sm mr-4"><Hourglass size={24} /></div>
                              <div>
                                  <h4 className="text-sm font-bold text-red-600 uppercase tracking-widest mb-1">{t.offerStep.scarcity}</h4>
                                  <p className="text-gray-900 font-medium">{offer.scarcity}</p>
                              </div>
                          </div>
                      </div>
                    ) : (
                      <div className="h-64 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center animate-pulse"><Loader2 size={24} className="text-gray-300 animate-spin" /></div>
                    )}
                </section>
                <section className="space-y-6">
                    <div className="flex items-center justify-between text-gray-400 font-bold text-xs uppercase tracking-widest mb-2">
                        <div className="flex items-center"><div className="w-6 h-px bg-gray-200 mr-2"></div>02. {t.offerStep.theBigIdea}</div>
                        <RefreshButton onClick={onRefreshBigIdea} loading={isBigIdeaLoading} />
                    </div>
                    {idea ? (
                      <div className="space-y-6 animate-fade-in w-full">
                          {offer?.moat && (
                              <div id="moat-card" className="bg-gradient-to-br from-amber-500/5 via-amber-500/2 to-transparent p-8 rounded-3xl border border-amber-500/20 shadow-xl relative overflow-hidden group">
                                  <div className="absolute top-0 right-0 p-8 opacity-5 transform group-hover:scale-110 transition-transform duration-500">
                                      <Shield size={160} className="text-amber-600" />
                                  </div>
                                  <div className="relative z-10 space-y-6">
                                      {/* Header */}
                                      <div className="flex items-center space-x-2 mb-2 pb-4 border-b border-gray-100">
                                          <div id="moat-icon-badge" className="p-2 bg-amber-500/15 rounded-xl text-amber-700">
                                              <Shield size={22} className="stroke-[2.5]" />
                                          </div>
                                          <div>
                                              <h3 className="text-xl font-bold text-gray-900 tracking-tight leading-none">{t.offerStep.moatTitle}</h3>
                                          </div>
                                      </div>

                                      {/* Grid Layout: Offense vs. Defense */}
                                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                                          {/* RIGHT TO WIN (Offense) - 5 columns */}
                                          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 p-5 rounded-2xl border border-emerald-500/20 shadow-sm flex flex-col justify-between space-y-3">
                                              <div>
                                                  <div className="flex items-center gap-2 mb-1.5">
                                                      <div className="p-1 bg-emerald-500/25 rounded-md text-emerald-800">
                                                          <Zap size={14} className="fill-emerald-800" />
                                                      </div>
                                                      <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">
                                                          {(t.offerStep as any).moatOffenseHeader || "Ataque (Right to Win)"}
                                                      </h4>
                                                  </div>
                                                  <p className="text-[11px] text-emerald-800/80 leading-snug mb-3 font-medium text-left">
                                                      {(t.offerStep as any).moatOffenseSub || "Por que os clientes te escolhem agora em vez de outras alternativas."}
                                                  </p>
                                                  {offer.moat.rightToWin && (
                                                      <div className="bg-white/95 backdrop-blur-sm p-3.5 rounded-xl border border-emerald-200/60 shadow-xs">
                                                          <ul className="space-y-2 text-left">
                                                              {parseBulletPoints(offer.moat.rightToWin).map((point, idx) => (
                                                                  <li key={idx} className="flex items-start gap-2">
                                                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                                                                      <span className="text-xs text-gray-900 font-semibold leading-relaxed">
                                                                          {point}
                                                                      </span>
                                                                  </li>
                                                              ))}
                                                          </ul>
                                                      </div>
                                                  )}
                                              </div>
                                          </div>

                                          {/* MOAT (Defense) - 7 columns */}
                                          <div className="lg:col-span-7 bg-white/80 backdrop-blur-sm p-5 rounded-2xl border border-amber-200/50 shadow-sm space-y-3">
                                              <div>
                                                  <div className="flex items-center gap-2 mb-1.5">
                                                      <div className="p-1 bg-amber-500/20 rounded-md text-amber-800">
                                                          <Shield size={14} />
                                                      </div>
                                                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                                                          {(t.offerStep as any).moatDefenseHeader || "Defesa (Estratégia MOAT)"}
                                                      </h4>
                                                  </div>
                                                  <p className="text-[11px] text-amber-900/80 leading-snug mb-2 font-medium text-left">
                                                      {(t.offerStep as any).moatDefenseSub || "Barreira estrutural e sustentável que protege lucros a longo prazo."}
                                                  </p>
                                              </div>

                                              <div className="space-y-2.5">
                                                  {/* Core Advantage */}
                                                  <div className="bg-amber-500/5 p-3.5 rounded-xl border border-amber-200/40 text-left">
                                                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block mb-1">
                                                          {t.offerStep.moatCoreAdvantage}
                                                      </span>
                                                      <ul className="space-y-1">
                                                          {parseBulletPoints(offer.moat.coreAdvantage).map((pt, idx) => (
                                                              <li key={idx} className="flex items-start gap-2 text-xs text-gray-900 font-bold leading-relaxed">
                                                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                                                                  <span>{pt}</span>
                                                              </li>
                                                          ))}
                                                      </ul>
                                                  </div>

                                                  {/* Grid items: Defensible & Unbeatable */}
                                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
                                                      <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-100">
                                                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                                                              {t.offerStep.moatWhyDefensible}
                                                          </span>
                                                          <ul className="space-y-1.5">
                                                              {parseBulletPoints(offer.moat.whyDefensible).map((pt, idx) => (
                                                                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 leading-snug font-medium">
                                                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                                                      <span>{pt}</span>
                                                                  </li>
                                                              ))}
                                                          </ul>
                                                      </div>
                                                      <div className="bg-gray-50/90 p-3 rounded-xl border border-gray-100">
                                                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider block mb-1.5">
                                                              {t.offerStep.moatWhereUnbeatable}
                                                          </span>
                                                          <ul className="space-y-1.5">
                                                              {parseBulletPoints(offer.moat.whereUnbeatable).map((pt, idx) => (
                                                                  <li key={idx} className="flex items-start gap-2 text-xs text-gray-700 leading-snug font-medium">
                                                                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                                                                      <span>{pt}</span>
                                                                  </li>
                                                              ))}
                                                          </ul>
                                                      </div>
                                                  </div>

                                                  {/* Gap exploited */}
                                                  <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-200/30 text-left">
                                                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider block mb-1.5">
                                                          {t.offerStep.moatGapExploited}
                                                      </span>
                                                      <ul className="space-y-1">
                                                          {parseBulletPoints(offer.moat.gapExploited).map((pt, idx) => (
                                                              <li key={idx} className="flex items-start gap-2 text-xs text-gray-800 font-medium leading-snug">
                                                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                                                                  <span>{pt}</span>
                                                              </li>
                                                          ))}
                                                      </ul>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}

                          <div className="bg-gradient-to-br from-indigo-50 via-white to-white p-8 rounded-3xl border border-indigo-100 shadow-xl shadow-indigo-100/40 relative overflow-hidden group hover:border-indigo-200 transition-all">
                              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100 to-transparent opacity-30 rounded-full blur-3xl -mt-20 -mr-20 pointer-events-none"></div>
                              <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center"><Zap size={14} className="mr-1 fill-indigo-600"/> {t.offerStep.uniqueMechanism}</div>
                              <h3 className="text-3xl font-display font-bold text-indigo-950 mb-3">{idea.uniqueMechanism}</h3>
                              <p className="text-indigo-900/80 text-lg font-medium leading-relaxed w-full">{idea.uniqueMechanismDescription}</p>
                          </div>
                          {idea.viralStrategy && (
                              <div className="bg-gradient-to-r from-fuchsia-50 to-purple-50 p-8 rounded-3xl border border-fuchsia-100 relative overflow-hidden shadow-lg shadow-fuchsia-100/50 hover:scale-[1.01] transition-transform duration-300">
                                  <div className="absolute -top-10 -right-10 p-4 opacity-10 rotate-12"><Megaphone size={180} className="text-fuchsia-600" /></div>
                                  <div className="relative z-10">
                                      <div className="flex items-center space-x-2 mb-4">
                                          <div className="p-2 bg-white/80 backdrop-blur rounded-lg text-fuchsia-600 shadow-sm"><Gift size={20} /></div>
                                          <div className="text-xs font-bold text-fuchsia-700 uppercase tracking-widest">{t.offerStep.viralStrategy}</div>
                                      </div>
                                      <p className="text-gray-800 text-lg leading-relaxed font-medium italic">"{idea.viralStrategy}"</p>
                                  </div>
                              </div>
                          )}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all">
                                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.offerStep.emotionalDriver}</div>
                                  <p className="text-xl font-bold text-gray-900">{idea.emotionalDriver}</p>
                              </div>
                              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg hover:shadow-xl transition-all">
                                  <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{t.offerStep.hookTagline}</div>
                                  <p className="text-xl font-bold text-gray-900 font-display">"{idea.tagline}"</p>
                              </div>
                          </div>
                      </div>
                    ) : (
                      <div className="h-64 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex items-center justify-center animate-pulse"><Loader2 size={24} className="text-gray-300 animate-spin" /></div>
                    )}
                </section>
            </div>
        </div>
    );
};
