import React from 'react';
import { Palette, Loader2, Sparkles, RefreshCw, Trash2, Video, Download, Copy, Layout, Star, Zap, Heart, Share2, Compass, Image as ImageIcon, ToggleLeft, ToggleRight, UserX } from 'lucide-react';
import { Product, Creative, Language } from '../../types';
import { getTranslation } from '../../translations';

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
}

export const MetaAdsStudio: React.FC<MetaAdsStudioProps> = ({
  product, language, isSocialLoading, taskQueue, socialStyles, activeStyle, setActiveStyle,
  customMetaDirection, setCustomMetaDirection, onGenerateCreative, onRefreshText, onGenerateImage,
  onUpdate, handleCopyText, handleDownloadImage, copiedId, FoundationPicker, COMPOSITIONS,
  globalBaseImages, setGlobalBaseImages, globalShotType, setGlobalShotType,
  excludeBuyerContext, setExcludeBuyerContext
}) => {
  const t = getTranslation(language);
  const creatives = Array.isArray(product.creatives) ? product.creatives : [];

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
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${excludeBuyerContext ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-gray-200 text-gray-500'}`}
                title="Toggle to ignore Dream Buyer context for this generation"
            >
                {excludeBuyerContext ? <ToggleRight className="text-amber-500" /> : <ToggleLeft className="text-gray-400" />}
                <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{excludeBuyerContext ? "Raw Product Mode" : "Strategy Aware"}</span>
                    <span className="text-[9px] opacity-70 font-medium leading-none">{excludeBuyerContext ? "Ignoring Dream Buyer" : "Using Full Context"}</span>
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

          <button onClick={() => onGenerateCreative(activeStyle, customMetaDirection)} disabled={isSocialLoading} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg whitespace-nowrap h-[46px] shrink-0 ${isSocialLoading ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 active:scale-95'}`}>
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
                <div className="flex items-center gap-2 max-w-[70%]"><div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-50 to-purple-50 flex items-center justify-center text-white font-bold text-xs shadow-inner shrink-0">{product.name.charAt(0)}</div><div className="overflow-hidden"><p className="text-xs font-bold text-gray-900 leading-none truncate">{product.name}</p><p className="text-[10px] text-gray-400 mt-1">{t.creativesStep.sponsored}</p></div></div>
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
              <div className="aspect-square bg-gray-50 relative overflow-hidden group/image border-y border-gray-50">
                {creative.imageUrl ? (
                  <div className="w-full h-full relative">
                    <img src={creative.imageUrl} className="w-full h-full object-cover" alt="Ad Visual" />
                  </div>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-end p-8 bg-indigo-50/20"><button onClick={() => onGenerateImage(creative.id, creative.visualPrompt, creativeBase, globalShotType, creative.style)} disabled={isImgLoading} className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-xs font-bold shadow-lg hover:bg-gray-900 transition-all flex items-center disabled:opacity-50"><Palette className="mr-2" size={14} />{isImgLoading ? t.common.building : t.creativesStep.craftVisual}</button></div>
                )}
                {isImgLoading && (<div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center z-[30] animate-fade-in"><Loader2 size={32} className="text-white animate-spin mb-4" /><p className="text-[10px] font-bold text-white uppercase tracking-widest">{t.creativesStep.renderingVisual}</p></div>)}
              </div>
              <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                {creative.imageUrl ? (
                    <button 
                      onClick={() => handleDownloadImage(creative.imageUrl!, `Ad-${creative.id}.png`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm shrink-0"
                      title={t.common.download}
                    >
                      <Download size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-tight">{t.common.download}</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                        <Video size={12} />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{globalShotType}</span>
                    </div>
                )}
                <button
                  onClick={() => onGenerateImage(creative.id, creative.visualPrompt, creativeBase, globalShotType, creative.style)}
                  disabled={isImgLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all shadow-sm shrink-0 disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isImgLoading ? 'animate-spin' : ''} />
                  <span className="text-[10px] font-bold uppercase tracking-tight">{t.common.refresh} Visual</span>
                </button>
              </div>
              <div className={`bg-white p-4 flex items-center justify-between h-[90px] gap-3 transition-opacity ${isTextLoading ? 'opacity-30' : 'opacity-100'}`}><div className="flex-1 min-w-0 flex flex-col justify-center"><p className="text-[8px] text-gray-400 uppercase tracking-widest mb-1 truncate">{product.websiteUrl?.replace(/https?:\/\//, '') || 'MARKETHERO.APP'}</p><h4 className="text-[13px] font-bold text-gray-900 leading-tight truncate mb-0.5">{creative.headline}</h4><p className="text-[10px] text-gray-500 leading-tight truncate">{creative.subheadline}</p></div><button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold shrink-0">{t.creativesStep.learnMore}</button></div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
