
import React, { useRef, useEffect } from 'react';
import { Link as LinkIcon, Sparkles, AlertCircle, CheckCircle2, Tag, Box, ChevronDown, Upload, Trash2, MapPin, Loader2, ShieldCheck } from 'lucide-react';
import { Product, ProductType, Language, GenerationMode } from '../types';
import { InputWithAI } from './InputWithAI';
import { SearchableCountrySelect } from './Common';
import { getTranslation } from '../translations';
import { fileToBase64 } from '../services/aiCore';

interface ProductStepProps {
  activeProduct: Product;
  updateProduct: (updates: Partial<Product>) => void;
  language: Language;
  mode: GenerationMode;
  analyzingUrl: boolean;
  urlError: string | null;
  urlSuccess: boolean;
  handleUrlAnalysis: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: (img: string) => void;
  setLightboxImage: (img: string) => void;
  showValidation?: boolean;
  validationTrigger?: number;
  analyzingBrand: boolean;
  onImagesPasted?: (files: File[]) => void;
}

const PRODUCT_TYPES: ProductType[] = ['Physical', 'Digital', 'Service', 'Event', 'Subscription', 'Software', 'Other'];

const CAMPAIGN_GOALS = [
  { id: 'Increase Sales', labelKey: 'increaseSales' },
  { id: 'Launch Product', labelKey: 'launchProduct' },
  { id: 'Generate Leads', labelKey: 'generateLeads' },
  { id: 'Brand Awareness', labelKey: 'brandAwareness' }
] as const;

export const ProductStep: React.FC<ProductStepProps> = ({
  activeProduct,
  updateProduct,
  language,
  mode,
  analyzingUrl,
  urlError,
  urlSuccess,
  handleUrlAnalysis,
  fileInputRef,
  handleFileUpload,
  handleRemoveImage,
  setLightboxImage,
  showValidation = false,
  validationTrigger = 0,
  analyzingBrand,
  onImagesPasted
}) => {
  const t = getTranslation(language);

  const getTypeLabel = (type: ProductType) => {
    const key = type.toLowerCase() as keyof typeof t.productTypes;
    return t.productTypes[key] || type;
  };

  // Helper to generate context that includes all other filled fields
  const getDynamicContext = (currentField: string) => {
    const fields: any = {
      name: activeProduct.name !== 'New Product' ? activeProduct.name : '',
      type: activeProduct.type || '',
      description: activeProduct.description || '',
      audience: activeProduct.audienceType || '',
      location: activeProduct.location || '',
      decisionMaker: activeProduct.decisionMaker || '',
      goal: activeProduct.goal || ''
    };
    
    // Remove the field we are currently editing from the "context" list to avoid circular logic
    // and focus only on the "anchors" provided by other inputs.
    const contextEntries = Object.entries(fields)
      .filter(([key, val]) => key !== currentField && val)
      .map(([key, val]) => `${key.toUpperCase()}: ${val}`);
      
    return contextEntries.length > 0 
      ? `Current Product State:\n${contextEntries.join('\n')}` 
      : "Starting a new product definition.";
  };

  const sectionRefs = {
    product: useRef<HTMLElement>(null),
    audience: useRef<HTMLElement>(null),
    objective: useRef<HTMLElement>(null),
    images: useRef<HTMLDivElement>(null)
  };

  useEffect(() => {
    if (showValidation && validationTrigger > 0) {
      if (!activeProduct.name || activeProduct.name === 'New Product') {
        sectionRefs.product.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (!activeProduct.type) {
        sectionRefs.product.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (!activeProduct.description) {
        sectionRefs.product.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (activeProduct.type === 'Physical' && activeProduct.images.length === 0) {
        sectionRefs.images.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (!activeProduct.audienceType || !activeProduct.decisionMaker) {
        sectionRefs.audience.current?.scrollIntoView({ behavior: 'smooth' });
      } else if (!activeProduct.goal) {
        sectionRefs.objective.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [validationTrigger, showValidation, activeProduct]);

  // Handle Paste Event for Images
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
        const items = e.clipboardData?.items;
        if (!items) return;
        
        const files: File[] = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) files.push(file);
            }
        }

        if (files.length > 0) {
            if (onImagesPasted) {
                onImagesPasted(files);
            } else {
                try {
                    const base64s = await Promise.all(files.map(f => fileToBase64(f as Blob)));
                    updateProduct({ images: [...activeProduct.images, ...base64s] });
                } catch (err) {
                    console.error("Paste image failed", err);
                }
            }
        }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [activeProduct.images, updateProduct, onImagesPasted]);

  const getValidationClass = (val: any) => {
    if (!showValidation) return '';
    const isEmpty = Array.isArray(val) ? val.length === 0 : !val;
    return isEmpty ? 'border-red-500 bg-red-50/10 ring-2 ring-red-500/10 animate-pulse' : 'border-emerald-500 ring-2 ring-emerald-500/10';
  };

  return (
    <div className="animate-slide-up pb-12 w-full">
      <h2 className="text-4xl font-display font-bold mb-3 tracking-tight text-gray-900">{t.productStep.title}</h2>
      <p className="text-lg text-gray-500 mb-6 leading-relaxed">{t.productStep.subtitle}</p>
      
      <div className={`bg-white p-1 rounded-2xl border transition-all duration-300 transform hover:-translate-y-1 mb-12 shadow-xl shadow-indigo-100/50 ${urlError ? 'border-red-300 ring-2 ring-red-100' : urlSuccess ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-200 hover:border-indigo-300'}`}>
         <div className="p-6 bg-gradient-to-br from-white to-gray-50 rounded-xl relative overflow-hidden">
              {analyzingUrl && (
                <div className="absolute inset-0 bg-indigo-600/5 backdrop-blur-[1px] flex items-center justify-center z-10 animate-fade-in">
                   <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
                      <Loader2 className="animate-spin text-indigo-600" size={28} />
                      <div className="text-center">
                        <p className="text-xs font-bold text-gray-900 uppercase tracking-widest">{t.common.analyzing}</p>
                        <p className="text-[10px] text-gray-400 font-medium">Extracting brand forensic data...</p>
                      </div>
                   </div>
                </div>
              )}
              <label className="block text-sm font-bold text-gray-900 mb-3 flex items-center uppercase tracking-wide">
                  <LinkIcon size={14} className="mr-2 text-indigo-500"/>
                  {t.productStep.urlLabel}
              </label>
              <div className="flex gap-3 mb-2 flex-col sm:flex-row">
                  <input type="url" className="flex-1 bg-white border border-gray-200 rounded-xl px-5 py-4 text-base focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all placeholder-gray-400 text-gray-900 shadow-sm" placeholder={t.productStep.urlPlaceholder} value={activeProduct.websiteUrl || ''}
                      onChange={(e) => updateProduct({ websiteUrl: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUrlAnalysis(); }}
                  />
                  <button onClick={handleUrlAnalysis} disabled={!activeProduct.websiteUrl || analyzingUrl}
                      className={`bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 duration-200 ${urlError ? 'bg-red-600 hover:bg-red-700' : ''} ${urlSuccess ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
                  >
                      {analyzingUrl ? <Loader2 className="animate-spin mr-2" size={18}/> : <Sparkles className="mr-2" size={18}/>}
                      {analyzingUrl ? t.common.analyzing : urlSuccess ? t.common.success : t.productStep.autoFill}
                  </button>
              </div>
              {urlError && <div className="flex items-center text-red-500 text-xs font-bold mt-3 animate-fade-in pl-1"><AlertCircle size={14} className="mr-1.5" />{urlError}</div>}
              {urlSuccess && <div className="flex items-center text-emerald-600 text-xs font-bold mt-3 animate-fade-in pl-1"><CheckCircle2 size={14} className="mr-1.5" />{t.common.success} {t.productStep.forensicsComplete}</div>}
         </div>
      </div>

      <div className="space-y-14">
          <section ref={sectionRefs.product}>
              <div className="flex items-center mb-6 justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold font-display mr-3 text-sm">1</div>
                  <h3 className="text-xl font-display font-bold text-gray-900">{t.productStep.section1}</h3>
                </div>
                {urlSuccess && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 animate-in zoom-in slide-in-from-right-4 duration-500">
                    <ShieldCheck size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{t.productStep.brandVerified}</span>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <InputWithAI 
                    label={t.productStep.nameLabel} 
                    value={activeProduct.name} 
                    onValueChange={(v) => updateProduct({ name: v })} 
                    context={getDynamicContext('name')} 
                    language={language} 
                    mode={mode} 
                    placeholder={t.productStep.namePlaceholder} 
                    containerClassName="mb-0" 
                    icon={<Tag size={14} className="text-gray-400" />} 
                    validationClass={getValidationClass(activeProduct.name && activeProduct.name !== 'New Product')} 
                  />
                  <div>
                    <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center justify-between">
                      <span className="flex items-center"><Box size={14} className="mr-1.5 text-gray-400" />{t.productStep.typeLabel}</span>
                    </label>
                    <div className="relative group/select">
                      <select className={`w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-base outline-none transition-all text-gray-900 font-medium shadow-sm hover:border-gray-300 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 appearance-none ${getValidationClass(activeProduct.type)}`} value={activeProduct.type || ''} onChange={(e) => updateProduct({ type: e.target.value as ProductType })}>
                        <option value="" disabled>{t.productStep.typeSelect}</option>
                        {PRODUCT_TYPES.map(pt => (<option key={pt} value={pt}>{getTypeLabel(pt)}</option>))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover/select:text-gray-600" size={18} />
                    </div>
                  </div>
              </div>
              <InputWithAI 
                label={t.productStep.descLabel} 
                value={activeProduct.description} 
                onValueChange={(v) => updateProduct({ description: v })} 
                context={getDynamicContext('description')} 
                language={language} 
                mode={mode} 
                instruction={t.productStep.descInstruction} 
                multiline 
                placeholder={t.productStep.descPlaceholder} 
                validationClass={getValidationClass(activeProduct.description)} 
              />
              
              <div className="mb-8" ref={sectionRefs.images}>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                  <span className="flex items-center">{t.productStep.visualsLabel}{activeProduct.type === 'Physical' && (<span className="ml-2 px-1.5 py-0.5 rounded bg-red-50 text-red-500 text-[9px] font-bold border border-red-100 flex items-center"><AlertCircle size={8} className="mr-1" /> {t.productStep.visualsRequired}</span>)}</span>
                  <span className="text-[9px] font-bold text-gray-400 opacity-60">TIP: Paste image directly from clipboard (Ctrl+V)</span>
                </label>
                <div className={`flex flex-wrap gap-4 p-2 rounded-2xl transition-all ${activeProduct.type === 'Physical' ? getValidationClass(activeProduct.images) : ''}`}>
                  <div onClick={() => fileInputRef.current?.click()} className="w-24 h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-all flex-shrink-0 group border-gray-300 text-gray-400 hover:border-indigo-500 hover:text-indigo-600">
                    <Upload size={20} className="mb-2 group-hover:scale-110 transition-transform"/>
                    <span className="text-[10px] font-bold uppercase tracking-wide">{t.common.upload}</span>
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload}/>
                  {activeProduct.images.map((img, idx) => (
                    <div key={idx} className="w-24 h-24 rounded-2xl border border-gray-200 overflow-hidden relative group flex-shrink-0 bg-white shadow-sm hover:shadow-md transition-all cursor-zoom-in">
                      <img 
                          src={img} 
                          alt={`Product ${idx}`} 
                          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                          onClick={() => setLightboxImage(img)}
                      />
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleRemoveImage(img); }} 
                        className="absolute top-1.5 right-1.5 p-1 bg-white/90 backdrop-blur rounded-full shadow-sm text-gray-400 hover:text-red-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>

                {analyzingBrand ? (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl animate-pulse max-w-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Loader2 size={14} className="animate-spin text-indigo-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Analyzing Visual DNA...</span>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="flex gap-1.5 p-1 bg-white rounded-lg border border-gray-100">
                                {[1,2,3,4,5].map(i => <div key={i} className="w-6 h-6 rounded-md bg-gray-200" />)}
                            </div>
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ) : activeProduct.brandKit && (
                    <div className="mt-6 p-4 bg-gray-50 border border-gray-100 rounded-xl animate-fade-in max-w-2xl">
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} className="text-indigo-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Image Analysis</span>
                        </div>
                        <div className="flex flex-wrap gap-3 items-center">
                            <div className="flex gap-1.5 p-1 bg-white rounded-lg border border-gray-100 shadow-sm">
                                {activeProduct.brandKit.colors.map((c, i) => (
                                    <div key={i} className="w-6 h-6 rounded-md shadow-inner border border-black/5" style={{ backgroundColor: c }} title={c} />
                                ))}
                            </div>
                            <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                            <p className="text-xs font-medium text-gray-600 italic">"{activeProduct.brandKit.tone}"</p>
                        </div>
                    </div>
                )}
              </div>
          </section>

          <div className="w-full h-px bg-gray-200"></div>

          <section ref={sectionRefs.audience}>
            <div className="flex items-center mb-6"><div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold font-display mr-3 text-sm">2</div><h3 className="text-xl font-display font-bold text-gray-900">{t.productStep.section2}</h3></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center justify-between">
                  {t.productStep.marketType}
                </label>
                <div className={`flex gap-2 bg-gray-100 p-1.5 rounded-xl border transition-all ${getValidationClass(activeProduct.audienceType)}`}>
                  {['B2C', 'B2B', 'Both'].map((type) => (
                    <button key={type} onClick={() => updateProduct({ audienceType: type as any })} className={`flex-1 py-2.5 px-2 rounded-lg text-sm font-bold transition-all shadow-sm ${activeProduct.audienceType === type ? 'bg-white text-indigo-600 shadow-md ring-1 ring-black/5' : 'bg-transparent text-gray-500 hover:text-gray-900'}`}>{type}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center"><MapPin size={14} className="mr-1 text-gray-400"/>{t.productStep.location}</label>
                <SearchableCountrySelect language={language} value={activeProduct.location} onChange={(val) => updateProduct({ location: val })}/>
              </div>
            </div>
            <InputWithAI 
              label={t.productStep.icpLabel} 
              value={activeProduct.decisionMaker} 
              onValueChange={(v) => updateProduct({ decisionMaker: v })} 
              context={getDynamicContext('decisionMaker')} 
              language={language}
              mode={mode}
              instruction={t.productStep.icpInstruction} 
              placeholder={t.productStep.icpPlaceholder} 
              validationClass={getValidationClass(activeProduct.decisionMaker)}
            />
          </section>

          <div className="w-full h-px bg-gray-200"></div>

          <section ref={sectionRefs.objective}>
            <div className="flex items-center mb-6 justify-between w-full">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center font-bold font-display mr-3 text-sm">3</div>
                <h3 className="text-xl font-display font-bold text-gray-900">{t.productStep.section3}</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CAMPAIGN_GOALS.map((goalItem) => (
                <div key={goalItem.id} onClick={() => updateProduct({ goal: goalItem.id })} className={`p-5 rounded-xl border-2 cursor-pointer flex items-center justify-between transition-all duration-200 group ${activeProduct.goal === goalItem.id ? 'border-indigo-600 bg-indigo-50/30 shadow-md' : 'border-gray-100 bg-white hover:border-gray-300 hover:shadow-md'} ${showValidation && !activeProduct.goal ? 'border-red-500 bg-red-50/10' : ''}`}>
                  <span className={`text-sm font-bold ${activeProduct.goal === goalItem.id ? 'text-indigo-900' : 'text-gray-600'}`}>{t.campaignGoals[goalItem.labelKey]}</span>
                  {activeProduct.goal === goalItem.id ? (<CheckCircle2 size={20} className="text-indigo-600" />) : (<div className={`w-5 h-5 rounded-full border-2 ${showValidation && !activeProduct.goal ? 'border-red-300' : 'border-gray-200 group-hover:border-gray-400'}`}></div>)}
                </div>
              ))}
            </div>
          </section>
      </div>
    </div>
  );
};
