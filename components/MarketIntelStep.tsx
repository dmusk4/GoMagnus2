
import React, { useRef, useEffect } from 'react';
import { BarChart2, Sparkles, Loader2, RefreshCw, TrendingUp, AlertTriangle, Zap, Grid, DollarSign, ArrowDownCircle, ArrowUpCircle, Globe, Star, ExternalLink, ShieldCheck, ShieldAlert, MessageCircle, Instagram, Facebook, Linkedin, Twitter, Quote, ThumbsUp, ThumbsDown, CheckCircle2, ChevronDown, Link as LinkIcon, Trash2, X, MoveRight, Tag, Percent, Layers, Sliders } from 'lucide-react';
import { Product, MarketIntel, Language } from '../types';
import { SectionSkeleton } from './Common';
import { getTranslation } from '../translations';

interface MarketIntelStepProps {
  product: Product;
  language: Language;
  loading: boolean;
  taskQueue: Set<string>;
  onRunAnalysis: () => void | Promise<void>;
  onSeeMore: () => void | Promise<void>;
  onUpdate: (intel: MarketIntel) => void;
  onClear: () => void;
  onCancel: () => void;
  error?: string | null;
  showValidation?: boolean;
  validationTrigger?: number;
  onRefreshPatterns?: () => void;
  onRefreshCanvas?: () => void;
  onRefreshBrand?: () => void;
  onRefreshPricing?: () => void;
  onDeleteCompetitor?: (idx: number) => void;
}

const ensureUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    return `https://${url}`;
};

export const MarketIntelStep: React.FC<MarketIntelStepProps> = ({ 
    product, language, loading, taskQueue, onRunAnalysis, onSeeMore, onUpdate, onClear, onCancel, error, showValidation = false, validationTrigger = 0,
    onRefreshPatterns, onRefreshCanvas, onRefreshBrand, onRefreshPricing, onDeleteCompetitor
}) => {
    const intel = product.marketIntel;
    const containerRef = useRef<HTMLDivElement>(null);
    const t = getTranslation(language);

    const getSocialIcon = (platform: string) => { 
        const p = platform.toLowerCase(); 
        if (p.includes('instagram')) return <Instagram size={14} />; 
        if (p.includes('facebook')) return <Facebook size={14} />; 
        if (p.includes('linkedin')) return <Linkedin size={14} />; 
        if (p.includes('twitter') || p.includes('x')) return <Twitter size={14} />; 
        return <Globe size={14} />; 
    };

    const isTaskLoading = (sub: string) => taskQueue.has(`intel-gen-${product.id}-${sub}`);
    const hasAnyData = intel && ((intel.workingNow && intel.workingNow.length > 0) || (intel.competitors && intel.competitors.length > 0) || intel.leanCanvas || intel.ownBrandInsights);
    const isMoreLoading = taskQueue.has(`intel-more-${product.id}`);

    useEffect(() => {
    }, [validationTrigger]);

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

    if (!hasAnyData && !loading) { 
        return (
            <div className="animate-slide-up w-full">
                <h2 className="text-4xl font-display font-bold mb-3 tracking-tight text-gray-900">{t.marketIntelStep.title}</h2>
                <p className="text-lg text-gray-500 mb-6">{t.marketIntelStep.subtitle}</p>
                <div ref={containerRef} className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all group border-gray-200 bg-gray-50/50 hover:bg-gray-50`}>
                    <div className={`w-20 h-20 rounded-full shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 bg-white text-indigo-600`}>
                        <BarChart2 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{t.marketIntelStep.emptyTitle}</h3>
                    <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">{t.marketIntelStep.emptyDesc}</p>
                    <button 
                        onClick={onRunAnalysis} 
                        disabled={loading}
                        className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center mx-auto hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                    >
                        {loading ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Sparkles className="mr-2" size={18}/>}
                        {loading ? t.marketIntelStep.analyzingMarket : t.marketIntelStep.runAnalysis}
                    </button>
                </div>
            </div>
        ); 
    }

    if (!hasAnyData && loading) {
        return (
            <div className="animate-slide-up pb-12 w-full">
                <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-6">
                    <div>
                        <h2 className="text-4xl font-display font-bold text-gray-900">{t.marketIntelStep.scanning}</h2>
                        <p className="text-lg text-gray-500 mt-2 italic">{t.marketIntelStep.gathering} {product.location}.</p>
                        {product.websiteUrl && (
                          <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl w-fit">
                            <LinkIcon size={14} className="text-indigo-400" />
                            <span className="text-xs font-bold text-indigo-600 truncate max-w-[300px]">{product.websiteUrl}</span>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest ml-2 border-l border-indigo-200 pl-2">Grounded Target</span>
                          </div>
                        )}
                    </div>
                    
                    <div className="w-full md:w-96 p-6 bg-white border border-indigo-100 rounded-3xl shadow-xl shadow-indigo-500/5 space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="flex items-center justify-between text-[11px] font-bold text-indigo-600 uppercase tracking-widest border-b border-indigo-50 pb-3">
                            <span className="flex items-center gap-2"><Zap size={14} className="fill-indigo-600" /> {t.marketIntelStep.analysisProgress}</span>
                            <Loader2 size={12} className="animate-spin" />
                        </div>
                        <div className="space-y-3">
                            {[
                                { id: 'patterns', label: t.marketIntelStep.analysisTasks.patterns },
                                { id: 'canvas', label: t.marketIntelStep.analysisTasks.canvas },
                                { id: 'brand', label: t.marketIntelStep.analysisTasks.brand },
                                { id: 'competitors', label: t.marketIntelStep.analysisTasks.competitors },
                                { id: 'pricing', label: t.marketIntelStep.analysisTasks.pricing }
                            ].map(task => {
                                const isPending = isTaskLoading(task.id);
                                return (
                                    <div key={task.id} className={`flex items-center justify-between text-xs font-bold transition-all duration-500 ${isPending ? 'text-slate-400 bg-slate-50/50 p-2 rounded-xl' : 'text-emerald-600 bg-emerald-50/50 p-2 rounded-xl ring-1 ring-emerald-100'}`}>
                                        <div className="flex items-center">
                                            {isPending ? (
                                                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin mr-3 shrink-0" />
                                            ) : (
                                                <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center mr-3 shrink-0 shadow-sm animate-in zoom-in">
                                                    <CheckCircle2 size={10} className="text-white" />
                                                </div>
                                            )}
                                            {task.label}
                                        </div>
                                        {isPending ? (
                                            <span className="text-[9px] opacity-60 uppercase bg-white px-2 py-1 rounded-md shadow-sm">{t.common.building}</span>
                                        ) : (
                                            <span className="text-[9px] font-bold uppercase bg-white px-2 py-1 rounded-md shadow-sm border border-emerald-100">{t.common.verified}</span>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                        <button onClick={onCancel} className="w-full mt-4 py-3 rounded-xl bg-white border border-red-100 text-red-500 font-bold text-xs hover:bg-red-50 hover:border-red-200 transition-all flex items-center justify-center gap-2 shadow-sm">
                            <X size={14} /> Cancel Analysis
                        </button>
                    </div>
                </div>
                <div className="space-y-12 opacity-30 grayscale pointer-events-none blur-[2px]">
                    <SectionSkeleton title={t.marketIntelStep.scanning} height="h-64" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <SectionSkeleton title="..." />
                        <SectionSkeleton title="..." />
                        <SectionSkeleton title="..." />
                    </div>
                </div>
            </div>
        );
    }
    
    const tasksRemaining = [isTaskLoading('patterns'), isTaskLoading('canvas'), isTaskLoading('brand'), isTaskLoading('competitors'), isTaskLoading('pricing')].filter(Boolean).length;
    
    return (
        <div className="animate-slide-up pb-12 w-full">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                <div>
                    <h2 className="text-4xl font-display font-bold text-gray-900">{t.marketIntelStep.title}</h2>
                    <p className="text-lg text-gray-500 mt-2">{t.marketIntelStep.subtitle} ({product.location}).</p>
                </div>
                 <div className="flex items-center gap-3">
                    {loading && tasksRemaining > 0 && (
                        <div className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full flex items-center animate-pulse border border-indigo-100 shadow-sm">
                            <Loader2 size={12} className="mr-2 animate-spin" />{tasksRemaining} {t.common.analyzing}
                        </div>
                    )}
                    <button 
                        onClick={onClear}
                        disabled={loading}
                        className="p-2.5 rounded-xl border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all flex items-center gap-2 group/clear shadow-sm bg-white"
                        title={t.common.clearData}
                    >
                        <Trash2 size={14} />
                        <span className="text-[10px] font-bold hidden sm:inline uppercase tracking-tight">{t.common.clearData}</span>
                    </button>
                    <button onClick={onRunAnalysis} disabled={loading} className={`text-sm font-bold flex items-center transition-all px-4 py-2.5 rounded-xl ${loading ? 'text-gray-400 bg-gray-100 cursor-not-allowed shadow-none' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:shadow-sm shadow-sm border border-indigo-100'}`}>
                        <RefreshCw size={14} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />{loading ? t.common.analyzing : t.marketIntelStep.refreshAnalysis}
                    </button>
                 </div>
            </div>
            
            {intel?.ownBrandInsights ? (
                <div className="mb-14 bg-white p-8 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden group animate-fade-in">
                    <div className="absolute top-0 right-0 p-8 opacity-5"><Star size={120} className="text-indigo-600" /></div>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-lg"><Sparkles size={20} /></div>
                                <h3 className="font-display font-bold text-2xl text-gray-900">{product.name} {t.marketIntelStep.brandInsights}</h3>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`px-4 py-1.5 rounded-full font-bold text-sm ${intel.ownBrandInsights.sentimentScore >= 70 ? 'bg-emerald-50 text-emerald-700' : intel.ownBrandInsights.sentimentScore >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}`}>
                                    {t.marketIntelStep.sentiment}: {Math.round(intel.ownBrandInsights.sentimentScore || 0)}/100
                                </div>
                                <RefreshButton onClick={onRefreshBrand} loading={isTaskLoading('brand')} />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-emerald-600 uppercase tracking-widest flex items-center"><ThumbsUp size={12} className="mr-2" /> {t.marketIntelStep.praises}</h4>
                                {intel.ownBrandInsights.positives.map((p, i) => (
                                    <div key={i} className="flex items-start text-sm text-gray-700 italic bg-emerald-50/30 p-3 rounded-lg border border-emerald-100"><Quote size={12} className="mr-2 mt-1 shrink-0 text-emerald-400" />{p}</div>
                                ))}
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest flex items-center"><ThumbsDown size={12} className="mr-2" /> {t.marketIntelStep.frictions}</h4>
                                {intel.ownBrandInsights.negatives.map((n, i) => (
                                    <div key={i} className="flex items-start text-sm text-gray-700 italic bg-red-50/30 p-3 rounded-lg border border-red-100"><Quote size={12} className="mr-2 mt-1 shrink-0 text-red-400" />{n}</div>
                                ))}
                            </div>
                        </div>
                     </div>
                </div>
            ) : isTaskLoading('brand') && <SectionSkeleton title={t.marketIntelStep.scanning} />}

            {(intel?.workingNow?.length > 0 || intel?.saturated?.length > 0 || intel?.opportunities?.length > 0) ? (
                <div className="mb-14 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900">{t.marketIntelStep.analysisTasks.patterns}</h3>
                        <RefreshButton onClick={onRefreshPatterns} loading={isTaskLoading('patterns')} />
                    </div>
                    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6`}>
                        <div className="bg-emerald-50 rounded-3xl border border-emerald-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-5"><div className="p-2.5 bg-white rounded-xl text-emerald-600 shadow-sm"><TrendingUp size={20} /></div><h3 className="font-display font-bold text-gray-900 text-lg">{t.marketIntelStep.winningPatterns}</h3></div>
                            <div className="space-y-2">{intel?.workingNow?.map((item, i) => (<div key={i} className="flex items-center bg-white/80 px-4 py-3 rounded-lg border border-emerald-100 shadow-sm backdrop-blur-sm"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-3 shrink-0"></span><span className="text-sm font-medium text-gray-800 leading-snug">{item}</span></div>))}</div>
                        </div>
                        <div className="bg-red-50 rounded-3xl border border-red-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-5"><div className="p-2.5 bg-white rounded-xl text-red-600 shadow-sm"><AlertTriangle size={20} /></div><h3 className="font-display font-bold text-gray-900 text-lg">{t.marketIntelStep.saturatedAngles}</h3></div>
                            <div className="space-y-2">{intel?.saturated?.map((item, i) => (<div key={i} className="flex items-center bg-white/80 px-4 py-3 rounded-lg border border-red-100 shadow-sm backdrop-blur-sm opacity-80 hover:opacity-100 transition-opacity"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-3 shrink-0"></span><span className="text-sm font-medium text-gray-700 leading-snug">{item}</span></div>))}</div>
                        </div>
                        <div className="bg-indigo-50 rounded-3xl border border-indigo-100 p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-3 mb-5"><div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm"><Zap size={20} /></div><h3 className="font-display font-bold text-gray-900 text-lg">{t.marketIntelStep.gapOpportunities}</h3></div>
                            <div className="space-y-2">{intel?.opportunities?.map((item, i) => (<div key={i} className="flex items-center bg-white px-4 py-3 rounded-lg border border-indigo-100 shadow-sm ring-1 ring-indigo-500/10"><span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-3 shrink-0"></span><span className="text-sm font-bold text-gray-900 leading-snug">{item}</span></div>))}</div>
                        </div>
                    </div>
                </div>
            ) : isTaskLoading('patterns') && <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14"><SectionSkeleton title="..."/><SectionSkeleton title="..."/><SectionSkeleton title="..."/></div>}

            {intel?.leanCanvas ? (
                <div className="mb-14 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center"><Grid size={20} className="mr-3 text-indigo-500"/> Lean Canvas</h3>
                        <RefreshButton onClick={onRefreshCanvas} loading={isTaskLoading('canvas')} />
                    </div>
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200">
                            <div className="p-5 md:col-span-1"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Problem</h4><p className="text-sm text-gray-700 leading-relaxed">{intel.leanCanvas.problem}</p></div>
                            <div className="p-5 md:col-span-1"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Solution</h4><p className="text-sm text-gray-700 leading-relaxed">{intel.leanCanvas.solution}</p></div>
                            <div className="p-5 md:col-span-1 bg-indigo-50/30"><h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-2">Unique Value Prop</h4><p className="text-sm text-gray-900 font-bold leading-relaxed">{intel.leanCanvas.uniqueValueProp}</p></div>
                            <div className="p-5 md:col-span-1"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Unfair Advantage</h4><p className="text-sm text-gray-700 leading-relaxed">{intel.leanCanvas.unfairAdvantage}</p></div>
                            <div className="p-5 md:col-span-1"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Customer Segments</h4><p className="text-sm text-gray-700 leading-relaxed">{intel.leanCanvas.customerSegments}</p></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-200 border-b border-gray-200">
                            <div className="p-5 md:col-span-2"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Key Metrics</h4><p className="text-sm text-gray-700 leading-relaxed">{intel.leanCanvas.keyMetrics}</p></div>
                            <div className="p-5 md:col-span-2"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Channels</h4><p className="text-sm text-gray-700 leading-relaxed">{intel.leanCanvas.channels}</p></div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                            <div className="p-5"><h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Cost Structure</h4><p className="text-sm text-gray-700 leading-relaxed">{intel.leanCanvas.costStructure}</p></div>
                            <div className="p-5 bg-green-50/30"><h4 className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Revenue Streams</h4><p className="text-sm text-gray-900 font-bold leading-relaxed">{intel.leanCanvas.revenueStreams}</p></div>
                        </div>
                    </div>
                </div>
            ) : isTaskLoading('canvas') && <SectionSkeleton title="Lean Canvas" height="h-64" />}

            {intel?.pricingSuggestions ? (
              <div className="mb-14 animate-fade-in space-y-8">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center"><DollarSign size={20} className="mr-3 text-indigo-500"/> {t.marketIntelStep.pricingTitle}</h3>
                    <RefreshButton onClick={onRefreshPricing} loading={isTaskLoading('pricing')} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none"><ArrowDownCircle size={80} className="text-indigo-600" /></div>
                    <div className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">{t.marketIntelStep.economy}</div>
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{t.marketIntelStep.sameForLess}</h4>
                    <p className="text-3xl font-display font-bold text-indigo-600 mb-4">{intel.pricingSuggestions.sameForLess.price}</p>
                    <p className="text-sm text-gray-600 leading-relaxed italic">"{intel.pricingSuggestions.sameForLess.logic}"</p>
                  </div>
                  <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 rounded-3xl border border-transparent shadow-xl relative overflow-hidden group text-white">
                    <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none"><ArrowUpCircle size={80} className="text-white" /></div>
                    <div className="inline-flex items-center px-3 py-1 bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-full mb-4">{t.marketIntelStep.recommended}</div>
                    <h4 className="text-2xl font-bold mb-2">{t.marketIntelStep.moreForSame}</h4>
                    <p className="text-3xl font-display font-bold mb-4">{intel.pricingSuggestions.moreForSame.price}</p>
                    <p className="text-sm text-white/80 leading-relaxed mb-6 italic">"{intel.pricingSuggestions.moreForSame.logic}"</p>
                    {intel.pricingSuggestions.moreForSame.valueAdd && (
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200">{t.marketIntelStep.bonusValue}:</p>
                        {intel.pricingSuggestions.moreForSame.valueAdd.map((add, idx) => (
                          <div key={idx} className="flex items-center text-sm font-medium">
                            <CheckCircle2 size={14} className="mr-2 text-emerald-400 shrink-0" /> {add}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* New Monetization & Discount Section */}
                {intel.pricingSuggestions.monetization && (
                    <div className="animate-slide-up">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center mb-6"><TrendingUp size={18} className="mr-2 text-indigo-500"/> {t.marketIntelStep.monetizationTitle}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Discount Strategy */}
                            <div className="bg-amber-50 p-8 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-4 right-4 text-amber-200/50"><Percent size={100} /></div>
                                <h4 className="text-base font-bold text-amber-900 mb-6 flex items-center gap-2 relative z-10"><Tag size={16} /> {t.marketIntelStep.discountStrategy}</h4>
                                <div className="space-y-5 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">{t.marketIntelStep.whenToDiscount}</p>
                                        <p className="text-sm font-bold text-amber-900">{intel.pricingSuggestions.monetization.discountStrategy.when}</p>
                                    </div>
                                    <div className="flex gap-6">
                                        <div>
                                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">{t.marketIntelStep.discountAmount}</p>
                                            <p className="text-lg font-black text-amber-700">{intel.pricingSuggestions.monetization.discountStrategy.amount}</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">{t.marketIntelStep.discountAudience}</p>
                                            <p className="text-sm font-bold text-amber-900">{intel.pricingSuggestions.monetization.discountStrategy.audience}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Monetization Opportunities */}
                            <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 shadow-sm relative overflow-hidden">
                                <div className="absolute top-4 right-4 text-blue-200/50"><Layers size={100} /></div>
                                <h4 className="text-base font-bold text-blue-900 mb-6 flex items-center gap-2 relative z-10"><TrendingUp size={16} /> {t.marketIntelStep.monetizationOps}</h4>
                                <div className="space-y-5 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">{t.marketIntelStep.upsells}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {intel.pricingSuggestions.monetization.opportunities.upsells.map((op, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-white border border-blue-100 rounded-lg text-xs font-bold text-blue-700 shadow-sm">{op}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">{t.marketIntelStep.crossSells}</p>
                                        <div className="flex flex-wrap gap-2">
                                            {intel.pricingSuggestions.monetization.opportunities.crossSells.map((op, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-white border border-blue-100 rounded-lg text-xs font-medium text-blue-600 shadow-sm">{op}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="pt-2 border-t border-blue-100/50">
                                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Sliders size={10} /> {t.marketIntelStep.usageBased}</p>
                                        <p className="text-xs font-medium text-blue-800 italic">"{intel.pricingSuggestions.monetization.opportunities.usageBased}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
              </div>
            ) : isTaskLoading('pricing') && <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14"><SectionSkeleton title={t.marketIntelStep.pricingTitle} /></div>}

            {intel?.competitors && intel.competitors.length > 0 ? (
                <div className="animate-fade-in w-full">
                    <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-bold text-gray-900 flex items-center"><Globe size={20} className="mr-3 text-indigo-500"/> {t.marketIntelStep.competitorRadar} ({product.location})</h3></div>
                    <div className={`grid grid-cols-1 gap-12`}>
                        {intel.competitors.map((comp, idx) => (
                            <div key={idx} className="bg-white p-8 rounded-[2rem] border border-gray-200 shadow-sm hover:shadow-2xl hover:border-indigo-200 transition-all duration-500 flex flex-col gap-6 relative group">
                                {onDeleteCompetitor && (
                                    <button 
                                        onClick={() => onDeleteCompetitor(idx)}
                                        className="absolute top-4 right-4 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                        title="Delete Competitor"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h4 className="font-display font-bold text-2xl text-gray-900">{comp.name}</h4>
                                            {comp.rating && (
                                                <div className="flex items-center text-yellow-600 text-xs font-bold px-3 py-1 bg-yellow-50 rounded-full border border-yellow-100">
                                                    <Star size={14} className="fill-current mr-1.5"/>{comp.rating}{comp.reviewCount && <span className="text-yellow-600/70 ml-1">({comp.reviewCount})</span>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center mt-2 text-indigo-600 font-bold text-sm bg-indigo-50 px-3 py-1 rounded-full w-fit" title="Competitor Price Point"><DollarSign size={14} className="mr-1" />{comp.pricePoint}</div>
                                        {comp.socialLinks && comp.socialLinks.length > 0 && (<div className="flex gap-2 mt-4">{comp.socialLinks.map((link, i) => (<a key={i} href={ensureUrl(link)} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-gray-50 rounded-xl text-gray-500 hover:bg-black hover:text-white transition-all border border-gray-100">{getSocialIcon(link)}</a>))}</div>)}
                                    </div>
                                    {comp.url && (<a href={ensureUrl(comp.url)} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all flex items-center shrink-0 shadow-sm active:scale-95">{t.marketIntelStep.seeWebsite} <ExternalLink size={16} className="ml-2" /></a>)}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4"><div className="bg-green-50/50 p-5 rounded-2xl border border-green-100 h-full"><div className="flex items-center text-xs font-bold text-green-700 uppercase mb-3 tracking-widest"><ShieldCheck size={14} className="mr-2"/> {t.marketIntelStep.coreAdvantage}</div><p className="text-gray-800 font-medium text-base leading-relaxed">{comp.strength}</p></div></div>
                                    <div className="space-y-4"><div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 h-full"><div className="flex items-center text-xs font-bold text-red-700 uppercase mb-3 tracking-widest"><ShieldAlert size={14} className="mr-2"/> {t.marketIntelStep.structuralGap}</div><p className="text-gray-800 font-medium text-base leading-relaxed">{comp.weakness}</p></div></div>
                                </div>
                                {comp.strategicMoves && comp.strategicMoves.length > 0 && (
                                    <div className="mt-2 p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100">
                                        <h5 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3 flex items-center"><MoveRight size={14} className="mr-2" /> {t.marketIntelStep.strategicMoves}</h5>
                                        <ul className="space-y-2">
                                            {comp.strategicMoves.map((move, i) => (
                                                <li key={i} className="flex items-start text-sm text-gray-700 font-medium">
                                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 mr-2 shrink-0"></span>
                                                    {move}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {comp.reviewInsights && (
                                    <div className="mt-2 bg-gray-50/50 p-6 rounded-2xl border border-gray-200">
                                        <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center"><MessageCircle size={14} className="mr-2" /> {t.marketIntelStep.voiceCustomer}</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                            <div>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase mb-2">{t.marketIntelStep.love}:</p>
                                                <ul className="space-y-2">{comp.reviewInsights.whatTheyLove.map((love, i) => (
                                                  <li key={i} className="text-sm text-gray-700 flex items-start">
                                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-1.5 mr-2 shrink-0"></div>
                                                    {love}
                                                  </li>
                                                ))}</ul>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-red-500 uppercase mb-2">{t.marketIntelStep.complaints}:</p>
                                                <ul className="space-y-2">{comp.reviewInsights.commonComplaints.map((hate, i) => (
                                                  <li key={i} className="text-sm text-gray-700 flex items-start">
                                                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5 mr-2 shrink-0"></div>
                                                    {hate}
                                                  </li>
                                                ))}</ul>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    
                    {error && (
                        <div className="mt-8 flex justify-center animate-fade-in">
                            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-3 rounded-xl flex items-center gap-2 text-sm font-medium shadow-sm">
                                <AlertTriangle size={16} />
                                {error}
                            </div>
                        </div>
                    )}

                    <div className="mt-8 flex justify-center">
                        <button onClick={onSeeMore} disabled={isMoreLoading} className="flex items-center space-x-2 px-10 py-4 rounded-full bg-white border border-gray-200 text-gray-600 font-bold text-base hover:bg-gray-50 hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                            {isMoreLoading ? <Loader2 size={18} className="animate-spin" /> : <ChevronDown size={18} />}
                            <span>{isMoreLoading ? t.common.building : t.marketIntelStep.discoverMore}</span>
                        </button>
                    </div>
                </div>
            ) : isTaskLoading('competitors') && <div className="space-y-12 w-full"><SectionSkeleton title="..." height="h-96"/><SectionSkeleton title="..." height="h-96"/></div>}
        </div>
    )
}
