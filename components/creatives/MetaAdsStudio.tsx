import React from 'react';
import { Palette, Loader2, Sparkles, RefreshCw, Trash2, Video, Download, Copy, Layout, Star, Zap, Heart, Share2, Compass, Image as ImageIcon, ToggleLeft, ToggleRight, UserX, ChevronLeft, ChevronRight, Type, Pencil } from 'lucide-react';
import { Product, Creative, Language } from '../../types';
import { getTranslation } from '../../translations';
import { CanvaImageEditorModal } from './CanvaImageEditorModal';

interface MetaAdsStudioProps {
  product: Product;
  language: Language;
  isSocialLoading: boolean;
  taskQueue: Set<string>;
  socialStyles: Creative['style'][];
  activeStyle: Creative['style'];
  setActiveStyle: (style: Creative['style']) => void;
  customMetaDirection: string;
  setCustomMetaDirection: (val: string) => void;
  onGenerateCreative: (style: Creative['style'], dir?: string) => void;
  onRefreshText: (id: string, style: Creative['style']) => void;
  onGenerateImage: (id: string, prompt: string, base: string | string[] | undefined, comp: string, style?: string) => void;
  onUpdate: (creatives: Creative[]) => void;
  handleCopyText: (c: Creative) => void;
  handleDownloadImage: (url: string, name: string) => void;
  copiedId: string | null;
  FoundationPicker: any;
  COMPOSITIONS: any[];
  globalBaseImages: string[];
  setGlobalBaseImages: (val: string[]) => void;
  globalShotType: string;
  setGlobalShotType: (val: string) => void;
  excludeBuyerContext?: boolean;
  setExcludeBuyerContext?: (val: boolean) => void;
  setLightboxImage?: (url: string | null) => void;
  metaImagesCount?: number;
  onUpdateMetaImagesCount?: (v: number) => void;
  onImagesPasted?: (files: File[]) => Promise<string | null | undefined>;
  metaTextLength?: 'tweet' | 'short' | 'medium' | 'long';
  setMetaTextLength?: (val: 'tweet' | 'short' | 'medium' | 'long') => void;
}

export const MetaAdsStudio: React.FC<MetaAdsStudioProps> = ({
  product, language, isSocialLoading, taskQueue, socialStyles, activeStyle, setActiveStyle,
  customMetaDirection, setCustomMetaDirection, onGenerateCreative, onRefreshText, onGenerateImage,
  onUpdate, handleCopyText, handleDownloadImage, copiedId, FoundationPicker, COMPOSITIONS,
  globalBaseImages, setGlobalBaseImages, globalShotType, setGlobalShotType,
  excludeBuyerContext, setExcludeBuyerContext, setLightboxImage,
  metaImagesCount = 1, onUpdateMetaImagesCount, onImagesPasted,
  metaTextLength = 'medium', setMetaTextLength
}) => {
  const t = getTranslation(language);
  const creatives = Array.isArray(product.creatives) ? product.creatives : [];
  const [editingCreative, setEditingCreative] = React.useState<Creative | null>(null);
  const [visualAdjustments, setVisualAdjustments] = React.useState<Record<string, string>>({});

  const handleTriggerImageGen = (creative: Creative, baseImg: any, shot: string, style?: string) => {
    const adjustment = (visualAdjustments[creative.id] || '').trim();
    const strategicDir = (customMetaDirection || '').trim();
    
    // Determine reference images: if modifying an existing image, pass the active image as direct baseline
    const activeIndex = creative.activeImageIndex || 0;
    const urlsList = creative.imageUrls && creative.imageUrls.length > 0 ? creative.imageUrls : (creative.imageUrl ? [creative.imageUrl] : []);
    const currentActiveUrl = urlsList[activeIndex] || creative.imageUrl;

    let baseImagesToUse = baseImg;
    if (adjustment && currentActiveUrl) {
      const existingBases = Array.isArray(baseImg) ? baseImg : (baseImg ? [baseImg] : []);
      const combined = [currentActiveUrl, ...existingBases.filter((b: string) => b !== currentActiveUrl)].slice(0, 3);
      baseImagesToUse = combined;
    }

    let promptToUse = creative.visualPrompt || "Professional product visualization";

    if (adjustment) {
      promptToUse = `IMPORTANTE: ${adjustment}.${strategicDir ? ` Direção Estratégica: ${strategicDir}.` : ''} Modifica e transforma a imagem diretamente a partir da imagem base/referência fornecida aplicando com máxima fidelidade esta alteração visual. Descrição base da cena: ${creative.visualPrompt}`;
    } else if (strategicDir) {
      promptToUse = `IMPORTANTE: Direção Estratégica: ${strategicDir}. ${creative.visualPrompt}`;
    }

    onGenerateImage(creative.id, promptToUse, baseImagesToUse, shot, style);
  };

  const handleSaveToCreative = (creativeId: string, newImageUrl: string, targetIndex?: number) => {
    const updated = creatives.map(c => {
      if (c.id === creativeId) {
        const existingUrls = c.imageUrls && c.imageUrls.length > 0 ? c.imageUrls : [c.imageUrl || ''];
        let updatedUrls = [...existingUrls];
        let newActiveIndex = targetIndex;

        const foundIndex = existingUrls.indexOf(newImageUrl);
        if (foundIndex !== -1) {
          // Keep original order of variations without moving chosen image to first
          newActiveIndex = foundIndex;
        } else if (targetIndex !== undefined && targetIndex >= 0 && targetIndex < existingUrls.length) {
          // Update the variation at targetIndex in place
          updatedUrls[targetIndex] = newImageUrl;
          newActiveIndex = targetIndex;
        } else {
          // Add new variation to the end without shuffling existing ones
          updatedUrls = [...existingUrls, newImageUrl];
          newActiveIndex = updatedUrls.length - 1;
        }

        return {
          ...c,
          imageUrl: newImageUrl,
          imageUrls: updatedUrls,
          activeImageIndex: newActiveIndex ?? 0
        };
      }
      return c;
    });
    onUpdate(updated);
  };

  React.useEffect(() => {
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
      if (files.length > 0 && onImagesPasted) {
        // Prevent default to stop duplicating the image into inputs if an input is focused
        e.preventDefault();
        const url = await onImagesPasted(files);
        if (url) {
          // If the user pastes an image, we assume they want to use it as the base visual
          setGlobalBaseImages([...globalBaseImages, url]);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [globalBaseImages, setGlobalBaseImages, onImagesPasted]);

  return (
    <div className="animate-fade-in w-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900">{t.creativesStep.socialTitle}</h2>
          <p className="text-lg text-gray-500 mt-2">{t.creativesStep.socialSubtitle}</p>
        </div>

        {setExcludeBuyerContext && (
            <button 
                onClick={() => setExcludeBuyerContext(!excludeBuyerContext)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${!excludeBuyerContext ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-gray-200 text-gray-500'}`}
                title="Toggle to use Dream Buyer context for this generation"
            >
                {!excludeBuyerContext ? <ToggleRight className="text-indigo-500" /> : <ToggleLeft className="text-gray-400" />}
                <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{!excludeBuyerContext ? "Strategy: Active" : "Strategy: Disabled"}</span>
                    <span className="text-[9px] opacity-70 font-medium leading-none">{!excludeBuyerContext ? "Using Dream Buyer" : "Ignoring Dream Buyer"}</span>
                </div>
            </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Palette size={12} className="text-indigo-500" /> {t.creativesStep.engagementAngle}
              </label>
              <div className="flex gap-2 flex-wrap">
                {socialStyles.map(s => {
                  const isRecommended = product.campaignPlan && s === product.campaignPlan.direction;
                  return (
                    <button
                      key={s}
                      onClick={() => setActiveStyle(s)}
                      className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${activeStyle === s
                        ? isRecommended ? 'bg-amber-500 text-white border-amber-600 shadow-lg' : 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                        : isRecommended ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      {isRecommended && <Star size={10} className={activeStyle === s ? 'fill-white' : 'fill-amber-500'} />}
                      <span className="">{s}</span>
                    </button>
                  );
                })}

                {product.bigIdea?.uniqueMechanism && (
                  <button
                    onClick={() => setActiveStyle('Unique-Mechanism')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${activeStyle === 'Unique-Mechanism' ? 'bg-indigo-900 text-white border-indigo-950 shadow-lg' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}
                  >
                    <Zap size={10} className={activeStyle === 'Unique-Mechanism' ? 'fill-white' : 'fill-indigo-600'} />
                    <span className="">Unique Mechanism</span>
                  </button>
                )}
                {product.bigIdea?.emotionalDriver && (
                  <button
                    onClick={() => setActiveStyle('Emotional-Driver')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${activeStyle === 'Emotional-Driver' ? 'bg-pink-600 text-white border-pink-700 shadow-lg' : 'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100'}`}
                  >
                    <Heart size={10} className={activeStyle === 'Emotional-Driver' ? 'fill-white' : 'fill-pink-600'} />
                    <span className="">Emotional Driver</span>
                  </button>
                )}
                {product.bigIdea?.viralStrategy && (
                  <button
                    onClick={() => setActiveStyle('Viral-Angle')}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${activeStyle === 'Viral-Angle' ? 'bg-fuchsia-600 text-white border-fuchsia-700 shadow-lg' : 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 hover:bg-fuchsia-100'}`}
                  >
                    <Share2 size={10} className={activeStyle === 'Viral-Angle' ? 'fill-white' : 'fill-fuchsia-600'} />
                    <span className="">Viral Growth</span>
                  </button>
                )}
              </div>
            </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-end gap-6 pt-4 border-t border-gray-50">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Compass size={12} className="text-indigo-500" /> {t.creativesStep.customDirection}
            </label>
            <input
              type="text"
              value={customMetaDirection}
              onChange={(e) => setCustomMetaDirection(e.target.value)}
              placeholder="E.g. Focus on cold audience pain points, or emphasize 24-hour delivery..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300"
            />
          </div>

          <div className="flex flex-col gap-2 min-w-[100px]">
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Layout size={12} className="text-indigo-500" /> {language === 'pt' ? 'Extensão' : language === 'es' ? 'Longitud' : 'Length'}
             </label>
             <div className="relative">
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-xs font-bold text-gray-700 outline-none cursor-pointer hover:border-indigo-300 transition-all appearance-none h-[46px]"
                  value={metaTextLength}
                  onChange={(e) => setMetaTextLength?.(e.target.value as 'tweet' | 'short' | 'medium' | 'long')}
                >
                  <option value="tweet">{language === 'pt' ? 'Tweet (<140)' : language === 'es' ? 'Tweet (<140)' : 'Tweet (<140)'}</option>
                  <option value="short">{language === 'pt' ? 'Curto' : language === 'es' ? 'Corto' : 'Short'}</option>
                  <option value="medium">{language === 'pt' ? 'Médio' : language === 'es' ? 'Medio' : 'Medium'}</option>
                  <option value="long">{language === 'pt' ? 'Longo' : language === 'es' ? 'Largo' : 'Long'}</option>
                </select>
                <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none rotate-90" />
             </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[130px]">
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Layout size={12} className="text-indigo-500" /> Imagens / Anúncio
             </label>
             <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200 h-[46px] items-center justify-between w-full">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => onUpdateMetaImagesCount?.(num)}
                    className={`flex-1 h-full rounded-lg text-xs font-bold transition-all ${
                      metaImagesCount === num
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {num}x
                  </button>
                ))}
             </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[200px]">
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon size={12} className="text-indigo-500"/> {t.creativesStep.foundationShot} ({globalBaseImages.length} selected)
             </label>
             <div className="bg-gray-50 rounded-xl px-2 border border-gray-200 h-[46px] flex items-center">
                <FoundationPicker 
                    selected={globalBaseImages} 
                    onSelect={(val: string[]) => setGlobalBaseImages(val)} 
                    type="social" 
                    id="global-social"
                />
             </div>
          </div>

          <div className="flex flex-col gap-2 min-w-[160px]">
             <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Video size={12} className="text-indigo-500"/> {t.creativesStep.cameraShot}
             </label>
             <div className="relative">
                <select
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-xs font-bold text-gray-700 outline-none cursor-pointer hover:border-indigo-300 transition-all appearance-none h-[46px]"
                  value={globalShotType}
                  onChange={(e) => setGlobalShotType(e.target.value)}
                >
                  {COMPOSITIONS.map(comp => (<option key={comp.value} value={comp.value}>{comp.label}</option>))}
                </select>
                <Video size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
             </div>
          </div>

          <button onClick={() => onGenerateCreative(activeStyle, customMetaDirection)} disabled={isSocialLoading} className={`flex w-full xl:w-auto justify-center items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg shrink-0 ${isSocialLoading ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 active:scale-95'}`}>
            {isSocialLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            {isSocialLoading ? t.common.analyzing : t.common.generate}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
        {creatives.map((creative) => {
          const isImgLoading = taskQueue.has(`image-gen-${creative.id}`);
          const isTextLoading = taskQueue.has(`creative-refresh-text-${creative.id}`);
          // Fallback logic for per-creative base images: prefer its own array, then single, then global
          const creativeBase = creative.selectedBaseImages !== undefined
            ? creative.selectedBaseImages 
            : (creative.selectedBaseImage !== undefined ? (creative.selectedBaseImage ? [creative.selectedBaseImage] : []) : globalBaseImages);

          return (
            <div key={creative.id} className="bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden flex flex-col relative group hover:shadow-2xl transition-all duration-500">
              <div className="p-3 flex items-center justify-between border-b border-gray-50 bg-white/80 backdrop-blur-sm sticky top-0 z-[20]">
                <div className="flex items-center gap-2 max-w-[70%]">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner shrink-0">
                    {product.name.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-gray-900 leading-none truncate">{product.name}</p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1.5">
                      <span>{t.creativesStep.sponsored}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                      <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50/70 px-1.5 py-0.5 rounded tracking-wide">{creative.style}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => handleCopyText(creative)} className={`p-1.5 rounded-lg transition-all ${copiedId === creative.id ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}><Copy size={12} /></button>
                  <button
                    onClick={() => onRefreshText(creative.id, creative.style)}
                    disabled={isTextLoading}
                    className={`p-1.5 rounded-lg transition-all ${isTextLoading ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                  >
                    <RefreshCw size={12} className={isTextLoading ? 'animate-spin' : ''} />
                  </button>
                  <button onClick={() => onUpdate(creatives.filter(c => c.id !== creative.id))} className="p-1.5 rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={12} /></button>
                </div>
              </div>
              <div className={`p-4 relative min-h-[100px] text-sm text-gray-800 leading-relaxed whitespace-pre-wrap transition-opacity ${isTextLoading ? 'opacity-30' : 'opacity-100'}`}>
                <span className="font-bold mr-1">{creative.hook}</span>{creative.caption}
                {isTextLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                    <Loader2 size={18} className="text-indigo-600 animate-spin" />
                  </div>
                )}
              </div>
              <div className="aspect-[4/5] bg-gray-50 relative overflow-hidden group/image border-y border-gray-50">
                {creative.imageUrl ? (
                  (() => {
                    const activeIndex = creative.activeImageIndex || 0;
                    const urlsList = creative.imageUrls && creative.imageUrls.length > 0 ? creative.imageUrls : [creative.imageUrl];
                    const activeUrl = urlsList[activeIndex] || creative.imageUrl;
                    const isMulti = urlsList.length > 1;

                    return (
                      <div 
                        className="w-full h-full relative cursor-pointer group" 
                        onClick={() => {
                          if (setLightboxImage) {
                            setLightboxImage(activeUrl);
                          } else {
                            setEditingCreative(creative);
                          }
                        }}
                      >
                        <img src={activeUrl} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Ad Visual" />
                        
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCreative(creative);
                          }}
                          className="absolute top-3 right-3 bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-xl font-semibold text-xs shadow-lg flex items-center gap-1.5 z-20 backdrop-blur-md transition-all border border-white/20 hover:scale-105 cursor-pointer"
                          title="Abrir no Editor Canva"
                        >
                          <Pencil size={12} />
                          <span>Editor Canva</span>
                        </button>

                        {isMulti && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const prevIdx = (activeIndex - 1 + urlsList.length) % urlsList.length;
                                onUpdate(creatives.map(c => c.id === creative.id ? { ...c, activeImageIndex: prevIdx } : c));
                              }}
                              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all z-20 shadow-md flex items-center justify-center cursor-pointer"
                              title="Anterior"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const nextIdx = (activeIndex + 1) % urlsList.length;
                                onUpdate(creatives.map(c => c.id === creative.id ? { ...c, activeImageIndex: nextIdx } : c));
                              }}
                              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all z-20 shadow-md flex items-center justify-center cursor-pointer"
                              title="Próxima"
                            >
                              <ChevronRight size={16} />
                            </button>

                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-[10px] text-white font-bold px-2.5 py-1 rounded-full z-20 flex items-center gap-1.5 shadow-sm">
                              {urlsList.map((_, idx) => (
                                <span
                                  key={idx}
                                  className={`w-1.5 h-1.5 rounded-full transition-all ${idx === activeIndex ? 'bg-indigo-400 scale-125' : 'bg-white/60'}`}
                                />
                              ))}
                            </div>
                          </>
                        )}

                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform flex items-center gap-1.5">
                                <ImageIcon size={14} className="text-gray-900" />
                                <span className="text-xs font-bold text-gray-900">Ver Imagem</span>
                            </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-8 bg-indigo-50/20">
                    <button 
                      onClick={() => handleTriggerImageGen(creative, creativeBase, globalShotType, creative.style)} 
                      disabled={isImgLoading} 
                      className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-xs font-bold shadow-lg hover:bg-gray-900 transition-all flex items-center disabled:opacity-50"
                    >
                      <Palette className="mr-2" size={14} />
                      {isImgLoading ? t.common.building : t.creativesStep.craftVisual}
                    </button>
                  </div>
                )}
                {isImgLoading && (<div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-[30] animate-fade-in"><Loader2 size={32} className="text-white animate-spin mb-4" /><p className="text-[10px] font-bold text-white uppercase tracking-widest">{t.creativesStep.renderingVisual}</p></div>)}
              </div>
              <div className="p-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                {creative.imageUrl ? (
                  (() => {
                    const activeIndex = creative.activeImageIndex || 0;
                    const urlsList = creative.imageUrls && creative.imageUrls.length > 0 ? creative.imageUrls : [creative.imageUrl];
                    const activeUrl = urlsList[activeIndex] || creative.imageUrl;

                    return (
                      <button 
                        onClick={() => handleDownloadImage(activeUrl, `Ad-${creative.id}-${activeIndex + 1}.png`)}
                        className="flex items-center justify-center p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-2xs shrink-0"
                        title={t.common.download}
                      >
                        <Download size={13} />
                      </button>
                    );
                  })()
                ) : (
                    <div className="flex items-center gap-1 text-gray-400 shrink-0 px-1" title={globalShotType}>
                        <Video size={13} />
                    </div>
                )}

                {/* Input text for suggesting alterations, added to visual prompt */}
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={visualAdjustments[creative.id] || ''}
                    onChange={(e) => setVisualAdjustments(prev => ({ ...prev, [creative.id]: e.target.value }))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isImgLoading) {
                        e.preventDefault();
                        handleTriggerImageGen(creative, creativeBase, globalShotType, creative.style);
                      }
                    }}
                    placeholder={
                      language === 'pt' 
                        ? 'Sugerir alterações...' 
                        : language === 'es' 
                        ? 'Sugerir cambios...' 
                        : 'Suggest visual adjustments...'
                    }
                    className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-[11px] font-medium text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
                  />
                </div>

                <button
                  onClick={() => handleTriggerImageGen(creative, creativeBase, globalShotType, creative.style)}
                  disabled={isImgLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-2xs shrink-0 disabled:opacity-50 font-bold"
                  title="Atualizar Visual com alterações"
                >
                  <RefreshCw size={12} className={isImgLoading ? 'animate-spin' : ''} />
                  <span className="text-[10px] uppercase tracking-tight whitespace-nowrap">{t.common.refresh} Visual</span>
                </button>
              </div>
              <div className={`bg-white p-4 flex items-center justify-between h-[90px] gap-3 transition-opacity ${isTextLoading ? 'opacity-30' : 'opacity-100'}`}><div className="flex-1 min-w-0 flex flex-col justify-center"><p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1 truncate">{product.websiteUrl?.replace(/https?:\/\//, '') || 'MARKETHERO.APP'}</p><h4 className="text-[13px] font-bold text-gray-900 leading-tight truncate mb-0.5">{creative.headline}</h4><p className="text-[10px] text-gray-500 leading-tight truncate">{creative.subheadline}</p></div><button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold shrink-0">{t.creativesStep.learnMore}</button></div>
            </div>
          );
        })}
      </div>

      {editingCreative && (() => {
        const activeEditingCreative = creatives.find(c => c.id === editingCreative.id) || editingCreative;
        return (
          <CanvaImageEditorModal
            isOpen={!!editingCreative}
            onClose={() => setEditingCreative(null)}
            creative={activeEditingCreative}
            language={language}
            onSaveToCreative={handleSaveToCreative}
            handleDownloadImage={handleDownloadImage}
            onGenerateImage={onGenerateImage}
            onRefreshText={onRefreshText}
            globalBaseImages={globalBaseImages}
            globalShotType={globalShotType}
            isImgLoading={taskQueue.has(`image-gen-${activeEditingCreative.id}`)}
            isTextLoading={taskQueue.has(`creative-refresh-text-${activeEditingCreative.id}`)}
          />
        );
      })()}
    </div>
  );
};
