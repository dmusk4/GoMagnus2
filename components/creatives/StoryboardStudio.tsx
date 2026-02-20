
import React, { useRef } from 'react';
import { Clapperboard, Compass, Loader2, Star, Plus, ChevronLeft, ChevronRight, ImageIcon, RefreshCw, Download, Timer, MessageSquare, Video, Palette, Zap, Heart, Share2, Trash2, ToggleRight, ToggleLeft, Layers } from 'lucide-react';
import { Product, Storyboard, Language } from '../../types';
import { getTranslation } from '../../translations';

interface StoryboardStudioProps {
  product: Product;
  language: Language;
  isStoryboardLoading: boolean;
  taskQueue: Set<string>;
  customStoryboardDirection: string;
  setCustomStoryboardDirection: (val: string) => void;
  onGenerateStoryboard: (style: string, dir: string) => void;
  onGenerateSceneImage: (num: number, prompt: string, base: string | undefined, storyboardId?: string) => void;
  handleDownloadImage: (url: string, name: string) => void;
  onUpdateStoryboard: (sb: Storyboard) => void;
  scroll: (dir: 'left' | 'right') => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
  FoundationPicker: any;
  getEnergyColor: (tag: string) => string;
  storyboardStyles: string[];
  activeStoryboardStyle: string;
  setActiveStoryboardStyle: (style: string) => void;
  onRefreshScene: (sceneNumber: number, storyboardId?: string) => void;
  storyboardIgnoreContext?: boolean;
  setStoryboardIgnoreContext?: (val: boolean) => void;
}

// Internal component to handle individual storyboard scrolling state
const StoryboardViewer: React.FC<{
    storyboard: Storyboard;
    index: number;
    total: number;
    t: any;
    taskQueue: Set<string>;
    onGenerateSceneImage: (num: number, prompt: string, base: string | undefined, storyboardId?: string) => void;
    onRefreshScene: (sceneNumber: number, storyboardId?: string) => void;
    handleDownloadImage: (url: string, name: string) => void;
    onUpdateStoryboard: (sb: Storyboard) => void;
    FoundationPicker: any;
    getEnergyColor: (tag: string) => string;
}> = ({ 
    storyboard, index, total, t, taskQueue, onGenerateSceneImage, 
    onRefreshScene, handleDownloadImage, onUpdateStoryboard, 
    FoundationPicker, getEnergyColor 
}) => {
    const rowRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (rowRef.current) {
            const scrollAmount = direction === 'left' ? -420 : 420;
            rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <div className="mb-16 border-t border-gray-100 pt-8 first:border-0 first:pt-0 group/row">
            <div className="flex items-center justify-between mb-6 px-4">
                <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full mb-2 inline-block">
                        Concept {total - index}
                    </span>
                    <h3 className="text-2xl font-bold text-gray-900">{storyboard.title}</h3>
                    <p className="text-sm text-gray-500 mt-1 max-w-2xl">{storyboard.narrativeSummary}</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={() => scroll('left')} 
                        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button 
                        onClick={() => scroll('right')} 
                        className="w-10 h-10 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            <div className="relative min-h-[500px] flex items-center w-full">
                {/* Scroll Buttons Overlay */}
                <button 
                    onClick={() => scroll('left')}
                    className="absolute left-4 z-20 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 flex items-center justify-center text-gray-700 hover:text-indigo-600 hover:scale-110 transition-all opacity-0 group-hover/row:opacity-100 pointer-events-none group-hover/row:pointer-events-auto"
                >
                    <ChevronLeft size={24} />
                </button>
                
                <button 
                    onClick={() => scroll('right')}
                    className="absolute right-4 z-20 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full shadow-xl border border-gray-100 flex items-center justify-center text-gray-700 hover:text-indigo-600 hover:scale-110 transition-all opacity-0 group-hover/row:opacity-100 pointer-events-none group-hover/row:pointer-events-auto"
                >
                    <ChevronRight size={24} />
                </button>

                <div 
                    ref={rowRef}
                    className="flex gap-8 overflow-x-auto pb-12 pt-4 no-scrollbar px-4 snap-x snap-mandatory w-full items-stretch scroll-smooth"
                >
                    {storyboard.scenes.map((scene) => {
                        const isImgLoading = taskQueue.has(`scene-img-gen-${scene.number}`);
                        const isRefreshing = taskQueue.has(`scene-refresh-${scene.number}`);
                        
                        return (
                            <div key={scene.number} className="min-w-[340px] md:min-w-[400px] snap-center animate-slide-up" style={{ animationDelay: `${scene.number * 0.1}s` }}>
                                <div className="bg-white rounded-[2.5rem] border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-2xl hover:border-indigo-200 transition-all duration-500">
                                    <div className="relative aspect-[9/16] bg-gray-900 overflow-hidden group/frame">
                                        {scene.imageUrl ? (
                                            <>
                                                <img src={scene.imageUrl} className="w-full h-full object-cover opacity-90 transition-opacity" />
                                                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover/frame:opacity-100 transition-all duration-300 z-[5]"></div>
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-end pb-12 p-12 text-center">
                                                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 backdrop-blur">
                                                    <ImageIcon size={24} className="text-white/40" />
                                                </div>
                                                <button onClick={() => onGenerateSceneImage(scene.number, scene.imagePrompt, scene.selectedBaseImage, storyboard.id)} disabled={isImgLoading || isRefreshing} className="bg-white text-black px-6 py-3 rounded-xl text-xs font-bold shadow-xl hover:bg-indigo-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-20 disabled:cursor-not-allowed">
                                                    {isImgLoading ? t.common.building : t.creativesStep.craftVisual}
                                                </button>
                                            </div>
                                        )}
                                        
                                        <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                                            <h4 className="text-3xl md:text-4xl font-display font-bold text-white text-center uppercase tracking-tighter drop-shadow-2xl">{scene.onScreenText}</h4>
                                        </div>
                                        
                                        <div className="absolute top-6 left-6 flex items-center gap-2 z-20">
                                            <div className="px-3 py-1 bg-black/60 backdrop-blur rounded-lg text-[10px] font-bold text-white shadow-lg border border-white/10 uppercase tracking-widest">{t.creativesStep.scene} {scene.number}</div>
                                            <div className={`px-3 py-1 ${getEnergyColor(scene.energyTag)} rounded-lg text-[10px] font-bold text-white shadow-lg uppercase tracking-widest`}>{scene.energyTag}</div>
                                        </div>
                                        
                                        <div className="absolute top-6 right-6 z-20 flex gap-2">
                                            <div className="px-3 py-1 bg-white rounded-lg text-[10px] font-bold text-black shadow-lg flex items-center gap-1.5"><Timer size={10} /> {scene.timing}</div>
                                        </div>
                                        
                                        <div className="absolute inset-0 flex flex-col items-center justify-end p-8 gap-4 z-30 opacity-0 group-hover/frame:opacity-100 transition-all duration-300 pointer-events-none">
                                            {scene.imageUrl && (
                                                <>
                                                    <button onClick={() => onGenerateSceneImage(scene.number, scene.imagePrompt, scene.selectedBaseImage, storyboard.id)} className="pointer-events-auto px-6 py-2.5 bg-white text-black rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-xl"><RefreshCw size={14} /> {t.common.refresh}</button>
                                                    <button onClick={() => handleDownloadImage(scene.imageUrl!, `Scene-${scene.number}.png`)} className="pointer-events-auto px-6 py-2.5 bg-white/20 text-white border border-white/40 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/40 transition-all backdrop-blur-md"><Download size={14} /> {t.common.download}</button>
                                                </>
                                            )}
                                            <button onClick={() => onRefreshScene(scene.number, storyboard.id)} className="pointer-events-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-xl mt-2"><Zap size={14} /> Rewrite Copy</button>
                                        </div>
                                        
                                        {isImgLoading && <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-40 animate-fade-in"><Loader2 size={32} className="text-white animate-spin" /></div>}
                                        {isRefreshing && <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-40 animate-fade-in"><Loader2 size={32} className="text-white animate-spin mb-4" /><p className="text-[10px] text-white font-bold uppercase tracking-widest">Rewriting Scene...</p></div>}
                                    </div>
                                    <div className="p-8 space-y-4 flex-1 bg-white relative">
                                        {isRefreshing && <div className="absolute inset-0 bg-white/80 z-10 animate-fade-in"></div>}
                                        <div><p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">{t.creativesStep.foundationShot}</p><FoundationPicker selected={scene.selectedBaseImage} onSelect={(img: any) => onUpdateStoryboard({ ...storyboard, scenes: storyboard.scenes.map(s => s.number === scene.number ? { ...s, selectedBaseImage: img } : s) })} type="scene" id={scene.number} storyboardId={storyboard.id} /></div>
                                        <div className="pt-4 border-t border-gray-50"><div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><MessageSquare size={12} /> {t.creativesStep.voiceover}</div><p className="text-lg font-medium text-gray-900 leading-relaxed italic border-l-4 border-indigo-600 pl-4">"{scene.voiceover}"</p></div>
                                        <div className="pt-4 border-t border-gray-50"><div className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Video size={12} /> {t.creativesStep.actionDetails}</div><p className="text-xs text-gray-600 font-bold leading-relaxed">{scene.shotDetails}</p><div className="mt-4 p-4 bg-orange-50/50 rounded-2xl border border-orange-100"><p className="text-[10px] text-orange-800 leading-relaxed font-medium"><strong>{t.creativesStep.editNotes}:</strong> {scene.editNotes}</p></div></div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export const StoryboardStudio: React.FC<StoryboardStudioProps> = ({
  product, language, isStoryboardLoading, taskQueue, customStoryboardDirection,
  setCustomStoryboardDirection, onGenerateStoryboard, onGenerateSceneImage,
  handleDownloadImage, onUpdateStoryboard, FoundationPicker, getEnergyColor, 
  storyboardStyles, activeStoryboardStyle, setActiveStoryboardStyle, onRefreshScene,
  storyboardIgnoreContext, setStoryboardIgnoreContext
}) => {
  const t = getTranslation(language);
  const storyboards = product.storyboards || [];

  return (
    <div className="animate-fade-in w-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900">TikTok/Reels Studio</h2>
          <p className="text-lg text-gray-500 mt-2">{t.creativesStep.storyboardSubtitle}</p>
        </div>
        
        {setStoryboardIgnoreContext && (
            <button 
                onClick={() => setStoryboardIgnoreContext(!storyboardIgnoreContext)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${storyboardIgnoreContext ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-gray-200 text-gray-500'}`}
                title="Toggle to ignore Dream Buyer and Power Offer context for this generation"
            >
                {storyboardIgnoreContext ? <ToggleRight className="text-amber-500" /> : <ToggleLeft className="text-gray-400" />}
                <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{storyboardIgnoreContext ? "Raw Product Mode" : "Strategy Aware"}</span>
                    <span className="text-[9px] opacity-70 font-medium leading-none">{storyboardIgnoreContext ? "Ignoring Dream Buyer & Offer" : "Using Full Context"}</span>
                </div>
            </button>
        )}
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-12 space-y-6">
        
        {/* Style Selection */}
        <div>
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Palette size={12} className="text-indigo-500" /> {t.creativesStep.selectStyle || "Select Video Style"}
          </label>
          <div className="flex gap-2 flex-wrap">
            {storyboardStyles.map(s => (
                <button
                  key={s}
                  onClick={() => setActiveStoryboardStyle(s)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${activeStoryboardStyle === s 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                >
                  {s}
                </button>
            ))}
            
            {/* Power Offer Specific Styles - Only show if context is NOT ignored */}
            {!storyboardIgnoreContext && product.bigIdea?.uniqueMechanism && (
              <button
                onClick={() => setActiveStoryboardStyle('Unique-Mechanism')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${activeStoryboardStyle === 'Unique-Mechanism' ? 'bg-indigo-900 text-white border-indigo-950 shadow-lg' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}
              >
                <Zap size={10} className={activeStoryboardStyle === 'Unique-Mechanism' ? 'fill-white' : 'fill-indigo-600'} />
                <span className="">Unique Mechanism</span>
              </button>
            )}
            {!storyboardIgnoreContext && product.bigIdea?.emotionalDriver && (
              <button
                onClick={() => setActiveStoryboardStyle('Emotional-Driver')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${activeStoryboardStyle === 'Emotional-Driver' ? 'bg-pink-600 text-white border-pink-700 shadow-lg' : 'bg-pink-50 text-pink-700 border-pink-100 hover:bg-pink-100'}`}
              >
                <Heart size={10} className={activeStoryboardStyle === 'Emotional-Driver' ? 'fill-white' : 'fill-pink-600'} />
                <span className="">Emotional Driver</span>
              </button>
            )}
            {!storyboardIgnoreContext && product.bigIdea?.viralStrategy && (
              <button
                onClick={() => setActiveStoryboardStyle('Viral-Angle')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${activeStoryboardStyle === 'Viral-Angle' ? 'bg-fuchsia-600 text-white border-fuchsia-700 shadow-lg' : 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100 hover:bg-fuchsia-100'}`}
              >
                <Share2 size={10} className={activeStoryboardStyle === 'Viral-Angle' ? 'fill-white' : 'fill-fuchsia-600'} />
                <span className="">Viral Growth</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end gap-6 border-t border-gray-50 pt-4">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Compass size={12} className="text-indigo-500" /> {t.creativesStep.customDirection}
            </label>
            <input
              type="text"
              value={customStoryboardDirection}
              onChange={(e) => setCustomStoryboardDirection(e.target.value)}
              placeholder="E.g. Focus on high-energy transitions, or emphasize product close-ups..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300"
            />
          </div>
          <div className="flex flex-col items-end gap-3 shrink-0">
            <button onClick={() => onGenerateStoryboard(activeStoryboardStyle, customStoryboardDirection)} disabled={isStoryboardLoading} className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg whitespace-nowrap h-[42px] shrink-0 ${isStoryboardLoading ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 active:scale-95'}`}>
              {isStoryboardLoading ? <Loader2 className="animate-spin" size={18} /> : <Clapperboard size={18} />}
              {isStoryboardLoading ? t.common.analyzing : t.creativesStep.buildStoryboard}
            </button>
          </div>
        </div>
      </div>

      {storyboards.length === 0 && !isStoryboardLoading && (
        <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30 w-full">
          <Clapperboard size={64} className="text-gray-200 mx-auto mb-6" /><h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{t.creativesStep.startStoryboard}</h3><p className="text-gray-400 max-w-sm mx-auto mb-8">Engineering high-conversion scripts with varied cinematic angles.</p><button onClick={() => onGenerateStoryboard(activeStoryboardStyle, customStoryboardDirection)} className="bg-white border border-gray-200 px-10 py-4 rounded-2xl font-bold text-indigo-600 shadow-xl hover:shadow-indigo-100 flex items-center mx-auto transition-transform active:scale-95"><Plus size={18} className="mr-2" /> Start Storyboard</button>
        </div>
      )}

      {storyboards.map((storyboard, idx) => (
        <StoryboardViewer 
            key={storyboard.id} 
            storyboard={storyboard}
            index={idx}
            total={storyboards.length}
            t={t}
            taskQueue={taskQueue}
            onGenerateSceneImage={onGenerateSceneImage}
            onRefreshScene={onRefreshScene}
            handleDownloadImage={handleDownloadImage}
            onUpdateStoryboard={onUpdateStoryboard}
            FoundationPicker={FoundationPicker}
            getEnergyColor={getEnergyColor}
        />
      ))}
    </div>
  );
};
