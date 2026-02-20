
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
               <Compass size={14} className="text-indigo-500" /> {t.offerStep.pivotLabel || "Strategic Pivot (Refine Angle)"}
             </label>
             <input 
                type="text" 
                value={strategicFocus}
                onChange={(e) => onUpdateFocus?.(e.target.value)}
                placeholder={t.offerStep.pivotPlaceholder || "Ex: Focus on exclusivity, urgency, or high value..."}
                className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
             />
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
            <div className="flex items-center justify-between mb-6">
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
                    <button 
                        onClick={() => onGenerate(strategicFocus)} 
                        disabled={loading} 
                        className={`text-sm font-bold flex items-center transition-all px-6 py-3 rounded-xl border transition-all duration-300 ${
                        loading 
                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                            : 'text-indigo-600 bg-white border-indigo-100 hover:bg-indigo-50 hover:shadow-md'
                        }`}
                    >
                        {loading ? <Loader2 size={14} className="mr-2 animate-spin" /> : <Zap size={14} className="mr-2 fill-indigo-600 text-indigo-600" />}
                        {loading ? t.common.analyzing : t.dreamBuyerStep.anotherAngle}
                    </button>
                </div>
            </div>

            <div className="mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-500/5">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                <Compass size={14} className="text-indigo-500" /> {t.offerStep.pivotLabel || "Strategic Pivot (Refine Angle)"}
                </label>
                <div className="flex gap-3">
                    <input 
                        type="text" 
                        value={strategicFocus}
                        onChange={(e) => onUpdateFocus?.(e.target.value)}
                        placeholder={t.offerStep.pivotPlaceholder || "Ex: Focus on exclusivity, urgency, or high value..."}
                        className="flex-1 bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                    <button 
                        onClick={() => onGenerate(strategicFocus)}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-100"
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
