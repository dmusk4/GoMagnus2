
import React, { useRef, useEffect, useState } from 'react';
import { Users, Sparkles, MapPin, Camera, Loader2, Zap, Trash2, RefreshCw, Compass, Monitor } from 'lucide-react';
import { Product, DreamBuyer, Language } from '../types';
import { fileToBase64, generateAvatarVisuals } from '../services/geminiService';
import { getTranslation } from '../translations';

interface DreamBuyerStepProps {
  product: Product;
  language: Language;
  taskQueue: Set<string>;
  onGenerate: () => void | Promise<void>;
  onUpdate: (buyer: DreamBuyer) => void;
  onClear: () => void;
  showValidation?: boolean;
  validationTrigger?: number;
  onUpdateFocus?: (focus: string) => void;
}

export const DreamBuyerStep: React.FC<DreamBuyerStepProps> = ({ product, language, taskQueue, onGenerate, onUpdate, onClear, showValidation = false, validationTrigger = 0, onUpdateFocus }) => {
  const buyer = product.dreamBuyer;
  const isTextLoading = taskQueue.has(`buyer-text-gen-${product.id}`);
  const isVisualLoading = taskQueue.has(`buyer-visual-gen-${product.id}`);
  const [isRefreshingVisual, setIsRefreshingVisual] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const generationCardRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(language);
  
  // Use persistent state from product
  const strategicFocus = product.buyerFocus || "";
  
  const currentSubtitle = buyer?.archetype 
    ? buyer.archetype 
    : isTextLoading ? t.dreamBuyerStep.pivoting : t.dreamBuyerStep.subtitle;

  useEffect(() => {
    // Scrolling logic removed as blocking validation is disabled
  }, [validationTrigger]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => { 
    if (e.target.files && e.target.files[0] && buyer) { 
      try { 
        const base64 = await fileToBase64(e.target.files[0]); 
        onUpdate({ ...buyer, avatarUrl: base64 }); 
      } catch(err) { 
        console.error("Upload failed", err); 
      } 
    } 
  };

  const handleRefreshVisual = async () => {
    if (!buyer || isVisualLoading || isRefreshingVisual) return;
    
    setIsRefreshingVisual(true);
    const descToUse = buyer.physicalDescription || `${buyer.name} in their ${buyer.ageRange}, ${buyer.occupation}. Professional look.`;
    
    try {
        const visuals = await generateAvatarVisuals(descToUse, product.name);
        if (visuals && visuals.length > 0) {
            onUpdate({ ...buyer, avatarOptions: visuals, avatarUrl: visuals[0] });
        }
    } catch (e) {
        console.error("Visual refresh failed", e);
    } finally {
        setIsRefreshingVisual(false);
    }
  };

  if (!buyer && !isTextLoading) {
    return (
      <div className="animate-slide-up w-full"><h2 className="text-4xl font-display font-bold mb-3 tracking-tight text-gray-900">{t.productStep.title}</h2><p className="text-lg text-gray-500 mb-6">{t.dreamBuyerStep.subtitle}</p>
        
        <div className="mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-500/5">
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
               <Compass size={14} className="text-indigo-500" /> {t.dreamBuyerStep.pivotLabel || "Strategic Direction (Optional)"}
             </label>
             <input 
                type="text" 
                value={strategicFocus}
                onChange={(e) => onUpdateFocus?.(e.target.value)}
                placeholder={t.dreamBuyerStep.pivotPlaceholder}
                className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
             />
        </div>

        <div ref={generationCardRef} className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all group border-gray-200 bg-gray-50/50 hover:bg-gray-50`}>
            <div className={`w-20 h-20 rounded-full shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 bg-white text-indigo-600`}>
                <Users size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t.dreamBuyerStep.emptyTitle}</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">{t.dreamBuyerStep.emptyDesc}</p>
            <button onClick={onGenerate} className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center mx-auto hover:-translate-y-1 active:translate-y-0 shadow-lg">
                <Sparkles className="mr-2" size={18}/> {t.dreamBuyerStep.generateBtn}
            </button>
        </div>
      </div>
    );
  }

  const anyVisualLoading = isVisualLoading || isRefreshingVisual;

  return (
    <div className="animate-slide-up pb-12 w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900">
            {isTextLoading ? (buyer?.name ? `${t.dreamBuyerStep.meeting} ${buyer.name}...` : t.common.analyzing) : `${t.dreamBuyerStep.meeting} ${buyer?.name || "Target Client"}`}
          </h2>
          <p className="text-lg text-indigo-600 font-bold mt-2 animate-fade-in">
            {currentSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onClear}
            disabled={isTextLoading}
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
          <div className="flex gap-3">
              <input 
                  type="text" 
                  value={strategicFocus}
                  onChange={(e) => onUpdateFocus?.(e.target.value)}
                  placeholder={t.dreamBuyerStep.pivotPlaceholder}
                  className="flex-1 bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
              />
              <button 
                  onClick={onGenerate}
                  disabled={isTextLoading}
                  className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-indigo-100 whitespace-nowrap"
              >
                  {isTextLoading ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                  {isTextLoading ? t.dreamBuyerStep.pivoting : t.dreamBuyerStep.anotherAngle}
              </button>
          </div>
      </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
             <div className="bg-white rounded-3xl border border-gray-100 p-2 shadow-lg relative group overflow-hidden">
                {(anyVisualLoading || !buyer?.avatarUrl) ? (
                    <div className="aspect-square bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-center p-6 transition-all duration-700">
                        <div className="relative mb-4">
                           <Users size={40} className="text-indigo-100" />
                           {anyVisualLoading && (
                             <div className="absolute inset-0 flex items-center justify-center">
                                <Loader2 className="animate-spin text-indigo-600" size={24} />
                             </div>
                           )}
                        </div>
                        <p className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest">
                           {anyVisualLoading ? t.dreamBuyerStep.renderingFace : isTextLoading ? t.dreamBuyerStep.waitingDescription : "..."}
                        </p>
                    </div>
                ) : (
                    <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden relative">
                        <img src={buyer.avatarUrl} alt={buyer.name} className="w-full h-full object-cover animate-fade-in transition-opacity duration-1000" />
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] text-gray-900 font-bold z-20 shadow-sm border border-gray-100">{t.dreamBuyerStep.heroFace}</div>
                    </div>
                )}
                {buyer && !isTextLoading && !anyVisualLoading && (
                  <div className="absolute top-4 right-4 z-30 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2">
                      <button 
                        onClick={handleRefreshVisual}
                        disabled={anyVisualLoading}
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all transform hover:rotate-180 duration-500 disabled:opacity-50"
                        title="Re-generate Visual"
                      >
                        <RefreshCw size={16} className={isRefreshingVisual ? "animate-spin" : ""} />
                      </button>
                      <button 
                        onClick={() => fileInputRef.current?.click()} 
                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                        title="Upload Custom Photo"
                      >
                        <Camera size={16}/>
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload}/>
                  </div>
                )}
                
                {/* Visual feedback overlay for refresh */}
                {isRefreshingVisual && (
                  <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white animate-fade-in">
                    <Loader2 size={32} className="animate-spin mb-4" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em]">{t.dreamBuyerStep.renderingFace}</span>
                  </div>
                )}
             </div>
             {buyer?.selectionReasoning && (
               <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-3xl shadow-sm animate-fade-in flex items-start space-x-4 border-l-4 border-l-indigo-500">
                 <div className="p-2 bg-white rounded-xl text-indigo-600 shadow-sm shrink-0"><Users size={20} /></div>
                 <div><h4 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-1">{t.dreamBuyerStep.strategicLogic}</h4><p className="text-sm text-indigo-800 font-medium leading-relaxed italic">"{buyer.selectionReasoning}"</p></div>
               </div>
             )}
          </div>

          <div className="lg:col-span-2 grid grid-cols-1 gap-6 content-start">
              <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-lg relative overflow-hidden transition-all duration-500">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10 opacity-50 pointer-events-none"></div>
                  <div className="flex items-center space-x-5 mb-6">
                    <div>
                      <h3 className="font-display font-bold text-2xl text-gray-900 min-h-[32px]">{buyer?.name || (isTextLoading ? "..." : "")}</h3>
                      <p className="text-gray-500 font-medium min-h-[20px]">{buyer?.occupation || ""}</p>
                      {buyer?.name && <div className="flex items-center text-gray-400 text-sm mt-2"><MapPin size={14} className="mr-1" />{product.location}</div>}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between py-3 border-b border-gray-100"><span className="text-gray-500 font-medium">{t.dreamBuyerStep.ageRange}</span><span className="font-bold text-gray-900">{buyer?.ageRange || "..."}</span></div>
                    <div className="flex justify-between py-3 border-b border-gray-100"><span className="text-gray-500 font-medium">{t.dreamBuyerStep.income}</span><span className="font-bold text-gray-900">{buyer?.income || "..."}</span></div>
                    {buyer?.mediaConsumption && (
                        <div className="py-3">
                            <span className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5"><Monitor size={12} /> {t.dreamBuyerStep.mediaConsumption}</span>
                            <p className="font-medium text-sm text-gray-800 leading-snug">{buyer.mediaConsumption}</p>
                        </div>
                    )}
                    <div className="pt-3"><span className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-2">{t.dreamBuyerStep.primaryTrigger}</span><p className="font-medium text-lg text-indigo-900 leading-snug">{buyer?.trigger || "..."}</p></div>
                  </div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden transition-all duration-500">
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20 -mr-16 -mb-16 pointer-events-none"></div>
                <h3 className="font-display font-bold text-xl mb-6 flex items-center">{t.dreamBuyerStep.psychProfile}</h3>
                <div className="space-y-6 relative z-10">
                  <div><span className="text-[10px] font-bold text-red-300 uppercase tracking-widest block mb-2">{t.dreamBuyerStep.painPoint}</span><div className="text-white text-lg font-medium leading-relaxed border-l-2 border-red-500 pl-4 min-h-[28px]">{buyer?.painPoint || "..."}</div></div>
                  <div><span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block mb-2">{t.dreamBuyerStep.desire}</span><div className="text-white text-lg font-medium leading-relaxed border-l-2 border-emerald-500 pl-4 min-h-[28px]">{buyer?.desire || "..."}</div></div>
                  <div><span className="text-[10px] font-bold text-orange-300 uppercase tracking-widest block mb-2">{t.dreamBuyerStep.objection}</span><div className="text-white/80 font-medium leading-relaxed min-h-[24px]">{buyer?.objection || "..."}</div></div>
                </div>
              </div>
          </div>
       </div>
    </div>
  );
};
