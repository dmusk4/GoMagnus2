
import React, { useState, useRef, useEffect } from 'react';
import { 
    Palette, Type, Layout, MousePointer2, Sparkles, Upload, 
    ImageIcon, RefreshCw, Layers, Check, Copy, X, Terminal, ChevronDown, Lock, Loader2, Code, FileJson, Download, AlertTriangle, HelpCircle, Settings, Eye, FileCode, Zap, RotateCcw,
    Sun, Moon, Contrast, Info, ExternalLink, Monitor
} from 'lucide-react';
import { 
    DESIGN_STYLES, TYPOGRAPHY_STYLES, VISUAL_INTENSITY, THEME_MODES,
    DesignSettings, analyzeDesignReferences, generateVibecodingPrompt, generateElementorCode, generateElementorSiteSettings, BrandKitAnalysis 
} from '../services/designService';
import { fileToBase64 } from '../services/geminiService';
import { LandingPageBuilderData, Language, DesignDirectorData } from '../types';
import { getTranslation } from '../translations';

interface DesignDirectorProps {
    productName: string;
    builderData: LandingPageBuilderData;
    language: Language;
    hasCopy: boolean;
    designData?: DesignDirectorData;
    onUpdate: (data: DesignDirectorData) => void;
    onGenerate?: (type: 'vibecoding' | 'elementor', settings: DesignSettings, brandKit?: BrandKitAnalysis) => void;
    isGeneratingVibecoding?: boolean;
    isGeneratingElementor?: boolean;
}

export const DesignDirector: React.FC<DesignDirectorProps> = ({ 
    productName, builderData, language, hasCopy, designData, onUpdate, 
    onGenerate, isGeneratingVibecoding, isGeneratingElementor 
}) => {
    const t = getTranslation(language);
    
    // AI Recommendations peek from builder data
    const recs = builderData.copy?.designRecommendation;

    // Initial Settings with deep safety
    const [settings, setSettings] = useState<DesignSettings>(() => {
        const base = designData?.settings;
        return {
            style: base?.style || DESIGN_STYLES[0],
            typography: base?.typography || TYPOGRAPHY_STYLES[0],
            colorPalette: base?.colorPalette || 'Modern Minimal (Black/White/Accent)',
            iconSet: base?.iconSet || 'Lucide React (Clean)',
            visualIntensity: base?.visualIntensity || VISUAL_INTENSITY[1],
            borderRadius: base?.borderRadius || 'Medium (Rounded)',
            themeMode: base?.themeMode || THEME_MODES[0]
        };
    });
    
    const [brandKit, setBrandKit] = useState<BrandKitAnalysis | null>(designData?.brandKit || null);
    const [uploadedImages, setUploadedImages] = useState<string[]>(designData?.referenceImages || []);
    
    // Sync from props if product changes externally
    useEffect(() => {
        if (designData?.settings) {
            setSettings({
                style: designData.settings.style || DESIGN_STYLES[0],
                typography: designData.settings.typography || TYPOGRAPHY_STYLES[0],
                colorPalette: designData.settings.colorPalette || 'Modern Minimal (Black/White/Accent)',
                iconSet: designData.settings.iconSet || 'Lucide React (Clean)',
                visualIntensity: designData.settings.visualIntensity || VISUAL_INTENSITY[1],
                borderRadius: designData.settings.borderRadius || 'Medium (Rounded)',
                themeMode: designData.settings.themeMode || THEME_MODES[0]
            });
            setBrandKit(designData.brandKit || null);
            setUploadedImages(designData.referenceImages || []);
        }
    }, [designData]);

    const generatedPrompt = designData?.generatedPrompt || null;
    const generatedElementorJson = designData?.generatedElementorJson || null;
    const generatedSiteSettingsJson = designData?.generatedSiteSettingsJson || null;

    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const [activeGenTab, setActiveGenTab] = useState<'vibecoding' | 'elementor'>('vibecoding');
    const [activeElementorView, setActiveElementorView] = useState<'template' | 'settings'>('template');
    const [showRawJson, setShowRawJson] = useState(false);
    
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isGenerating = activeGenTab === 'vibecoding' ? isGeneratingVibecoding : isGeneratingElementor;

    const persistState = (newSettings?: DesignSettings, newBrandKit?: BrandKitAnalysis | null, newImages?: string[]) => {
        onUpdate({
            settings: newSettings !== undefined ? newSettings : settings,
            brandKit: newBrandKit !== undefined ? (newBrandKit === null ? undefined : newBrandKit) : (brandKit === null ? undefined : brandKit),
            referenceImages: newImages !== undefined ? newImages : uploadedImages,
            generatedPrompt,
            generatedElementorJson,
            generatedSiteSettingsJson
        });
    };

    const handleSettingsChange = (key: keyof DesignSettings, value: string) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        persistState(newSettings);
    };

    const handleRestoreAI = () => {
        if (!recs) return;
        const newSettings = {
            ...settings,
            style: recs.style || settings.style,
            typography: recs.typography || settings.typography,
            visualIntensity: recs.visualIntensity || settings.visualIntensity
        };
        setSettings(newSettings);
        persistState(newSettings);
    };

    const isDivergent = recs && (
        settings.style !== recs.style || 
        settings.typography !== recs.typography || 
        settings.visualIntensity !== recs.visualIntensity
    );

    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const items = e.clipboardData?.items;
            if (!items) return;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.indexOf('image') !== -1) {
                    e.preventDefault();
                    const blob = item.getAsFile();
                    if (blob) {
                        setIsAnalyzing(true);
                        try {
                            const base64 = await fileToBase64(blob as Blob);
                            const newImages = [...uploadedImages, base64];
                            setUploadedImages(newImages);
                            const analysis = await analyzeDesignReferences(newImages);
                            if (analysis) {
                                setBrandKit(analysis);
                                const updatedSettings = { ...settings, colorPalette: `Custom: ${analysis.colors.join(', ')}` };
                                setSettings(updatedSettings);
                                persistState(updatedSettings, analysis, newImages);
                            } else {
                                persistState(undefined, undefined, newImages);
                            }
                        } catch (err) {
                            console.error("Paste error", err);
                        } finally {
                            setIsAnalyzing(false);
                        }
                    }
                    break;
                }
            }
        };
        window.addEventListener('paste', handlePaste);
        return () => window.removeEventListener('paste', handlePaste);
    }, [uploadedImages, settings]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setIsAnalyzing(true);
            try {
                const newFiles = Array.from(e.target.files);
                const newBase64s = await Promise.all(newFiles.map(file => fileToBase64(file as Blob)));
                const newImages = [...uploadedImages, ...newBase64s];
                setUploadedImages(newImages);
                const analysis = await analyzeDesignReferences(newImages);
                if (analysis) {
                    setBrandKit(analysis);
                    const updatedSettings = { ...settings, colorPalette: `Custom: ${analysis.colors.join(', ')}` };
                    setSettings(updatedSettings);
                    persistState(updatedSettings, analysis, newImages);
                } else {
                    persistState(undefined, undefined, newImages);
                }
            } catch (err) { console.error(err); } finally { setIsAnalyzing(false); }
        }
    };

    const handleRemoveImage = (indexToRemove: number) => {
        const newImages = uploadedImages.filter((_, i) => i !== indexToRemove);
        setUploadedImages(newImages);
        if (newImages.length === 0) {
            setBrandKit(null);
            persistState(undefined, null, []);
        } else {
            setIsAnalyzing(true);
            analyzeDesignReferences(newImages).then(analysis => {
                if (analysis) {
                    setBrandKit(analysis);
                    const updatedSettings = { ...settings, colorPalette: `Custom: ${analysis.colors.join(', ')}` };
                    setSettings(updatedSettings);
                    persistState(updatedSettings, analysis, newImages);
                } else {
                    persistState(undefined, undefined, newImages);
                }
                setIsAnalyzing(false);
            });
        }
    };

    const handleGenerateClick = () => {
        if (onGenerate) onGenerate(activeGenTab, settings, brandKit || undefined);
    };

    const getCurrentContent = () => {
        if (activeGenTab === 'vibecoding') return generatedPrompt;
        return activeElementorView === 'template' ? generatedElementorJson : generatedSiteSettingsJson;
    };

    const copyToClipboard = (text?: string) => {
        const content = text || getCurrentContent();
        if (content) {
            navigator.clipboard.writeText(content);
            setCopySuccess(text ? 'value' : 'all');
            setTimeout(() => setCopySuccess(null), 2000);
        }
    };

    const downloadElementorFile = () => {
        const content = getCurrentContent();
        if (!content) return;
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const suffix = activeElementorView === 'template' ? 'Page_Template' : 'Site_Settings';
        a.download = `Elementor_${suffix}_${productName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const renderSiteSettingsVisuals = () => {
        if (!generatedSiteSettingsJson) return null;
        try {
            const data = JSON.parse(generatedSiteSettingsJson);
            const systemColors = data.settings?.system_colors || [];
            const systemTypography = data.settings?.system_typography || [];
            return (
                <div className="space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Palette size={12}/> Global Colors
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {systemColors.map((col: any) => (
                                <div key={col._id} className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                                    <div className="w-10 h-10 rounded-full border-2 border-white/10 shadow-sm shrink-0" style={{ backgroundColor: col.color }} />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[10px] text-slate-400 font-bold uppercase mb-0.5">{col.title}</p>
                                        <div className="flex items-center gap-2 cursor-pointer group" onClick={() => copyToClipboard(col.color)}>
                                            <code className="text-sm text-white font-mono truncate bg-black/20 px-1.5 py-0.5 rounded">{col.color}</code>
                                            {copySuccess === 'value' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-slate-500 group-hover:text-white transition-colors" />}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Type size={12}/> Global Typography
                        </h4>
                        <div className="space-y-2">
                            {systemTypography.map((typo: any) => (
                                <div key={typo._id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors">
                                    <span className="text-[10px] text-slate-400 font-bold uppercase w-24">{typo._id}</span>
                                    <div className="flex items-center gap-2 flex-1 justify-end cursor-pointer group" onClick={() => copyToClipboard(typo.typography_font_family)}>
                                        <span className="text-sm text-white font-medium">{typo.typography_font_family}</span>
                                        {copySuccess === 'value' ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} className="text-slate-500 group-hover:text-white transition-colors" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 leading-relaxed">
                        <p className="font-bold mb-2 flex items-center gap-2"><Settings size={14} /> How to Apply in Elementor:</p>
                        <ol className="list-decimal pl-4 space-y-1 text-[11px] opacity-80">
                            <li>Open Elementor Editor on any page.</li>
                            <li>Click the <strong>Hamburger Menu (≡)</strong> &gt; <strong>Site Settings</strong>.</li>
                            <li>Go to <strong>Global Colors</strong> & <strong>Global Fonts</strong>.</li>
                            <li>Copy/Paste values above.</li>
                        </ol>
                    </div>
                </div>
            )
        } catch (e) { return <div className="text-red-400 text-xs p-4">Error parsing visualizer.</div>; }
    }

    const RecommendationBadge = () => (
        <span className="flex items-center gap-1 text-[8px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 animate-in zoom-in duration-300">
            <Zap size={8} className="fill-indigo-600" /> AI SELECTED
        </span>
    );

    const safeThemeMode = settings.themeMode || THEME_MODES[0];

    return (
        <div className="mt-8 border-t border-gray-100 pt-8 animate-slide-up relative">
            {!hasCopy && (
                <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl border border-gray-100">
                    <Lock className="text-gray-300 mb-4" size={48} />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Design Director Locked</h3>
                    <p className="text-gray-500">Generate copy first to unlock the engine.</p>
                </div>
            )}

            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold text-gray-900 flex items-center gap-3">
                        <Terminal className="text-indigo-600" size={28} />
                        {t.designDirector.title}
                    </h2>
                    <p className="text-gray-500 mt-1">{t.designDirector.subtitle}</p>
                </div>
                {isDivergent && (
                    <button 
                        onClick={handleRestoreAI}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all border border-indigo-100 shadow-sm animate-in fade-in slide-in-from-right-2"
                    >
                        <RotateCcw size={14} /> Restore AI Suggestions
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <ImageIcon size={14} /> {t.designDirector.sections.reference}
                            </h3>
                            <span className="text-[9px] font-bold text-gray-400 opacity-60">Pasted images persisted per product</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 mb-4">
                            {uploadedImages.map((img, i) => (
                                <div key={i} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button onClick={() => handleRemoveImage(i)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                                </div>
                            ))}
                            <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-indigo-400 hover:bg-indigo-50 transition-all flex items-center justify-center text-gray-400 hover:text-indigo-500"><Upload size={20} /></button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileUpload} />
                        </div>
                        {isAnalyzing && <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 animate-pulse mb-3"><RefreshCw size={12} className="animate-spin" /> Analyzing DNA...</div>}
                        {brandKit && (
                            <div className="space-y-3 pt-3 border-t border-gray-100">
                                <div className="flex gap-2">{brandKit.colors.map((c, i) => (<div key={i} className="w-6 h-6 rounded-full border border-gray-200" style={{ backgroundColor: c }} />))}</div>
                                <p className="text-xs text-gray-500 italic">"{brandKit.suggestion}"</p>
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Layout size={12}/> {t.designDirector.sections.aesthetic}</span>
                                {recs?.style === settings.style && <RecommendationBadge />}
                            </label>
                            <div className="relative">
                                <select 
                                    value={settings.style} 
                                    onChange={(e) => handleSettingsChange('style', e.target.value)}
                                    className={`w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-indigo-500 appearance-none transition-all ${recs?.style === settings.style ? 'border-indigo-200 ring-2 ring-indigo-500/5' : 'border-gray-200'}`}
                                >
                                    {DESIGN_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Contrast size={12}/> Theme Mode</span>
                            </label>
                            <div className="relative">
                                <select 
                                    value={safeThemeMode} 
                                    onChange={(e) => handleSettingsChange('themeMode', e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-indigo-500 appearance-none transition-all"
                                >
                                    {THEME_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-400">
                                    {safeThemeMode.includes('Dark') || safeThemeMode.includes('Midnight') ? <Moon size={14} /> : <Sun size={14} />}
                                    <ChevronDown size={16} className="ml-1" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Type size={12}/> {t.designDirector.sections.typography}</span>
                                {recs?.typography === settings.typography && <RecommendationBadge />}
                            </label>
                            <div className="relative">
                                <select 
                                    value={settings.typography} 
                                    onChange={(e) => handleSettingsChange('typography', e.target.value)}
                                    className={`w-full bg-gray-50 border rounded-xl px-3 py-2.5 text-sm font-bold text-gray-700 outline-none focus:border-indigo-500 appearance-none transition-all ${recs?.typography === settings.typography ? 'border-indigo-200 ring-2 ring-indigo-500/5' : 'border-gray-200'}`}
                                >
                                    {TYPOGRAPHY_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                                <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><MousePointer2 size={12}/> {t.designDirector.sections.visualIntensity}</span>
                                {recs?.visualIntensity === settings.visualIntensity && <RecommendationBadge />}
                            </label>
                            <div className="flex gap-2">
                                {VISUAL_INTENSITY.map(v => {
                                    const isRecommended = recs?.visualIntensity === v;
                                    return (
                                        <button 
                                            key={v}
                                            onClick={() => handleSettingsChange('visualIntensity', v)}
                                            className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all border relative ${settings.visualIntensity === v 
                                                ? isRecommended ? 'bg-indigo-600 text-white border-indigo-700' : 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                        >
                                            {v.split(' ')[0]}
                                            {isRecommended && settings.visualIntensity !== v && <div className="absolute -top-1 -right-1 w-2 h-2 bg-indigo-500 rounded-full border border-white" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={handleGenerateClick}
                        disabled={isGenerating || !hasCopy}
                        className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 group"
                    >
                        {isGenerating ? <Loader2 size={18} className="animate-spin" /> : (activeGenTab === 'elementor' ? <Code size={18} /> : <Sparkles size={18} className="group-hover:scale-110 transition-transform" />)}
                        {isGenerating ? "Processing..." : (activeGenTab === 'elementor' ? "Generate Elementor JSON" : t.designDirector.actions.generate)}
                    </button>
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-1 shadow-2xl h-full flex flex-col min-h-[500px]">
                        <div className="flex bg-slate-950/50 rounded-t-[22px] mx-1 mt-1 p-1">
                            <button onClick={() => setActiveGenTab('vibecoding')} disabled={isGenerating} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeGenTab === 'vibecoding' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><Terminal size={12} /> Vibecoding</button>
                            <button onClick={() => setActiveGenTab('elementor')} disabled={isGenerating} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 ${activeGenTab === 'elementor' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}><FileJson size={12} /> Elementor</button>
                        </div>
                        {activeGenTab === 'elementor' && (
                            <div className="flex border-b border-slate-800 px-6 pt-3 pb-0 gap-4">
                                <button onClick={() => setActiveElementorView('template')} className={`text-[10px] font-bold uppercase tracking-widest pb-3 border-b-2 transition-all ${activeElementorView === 'template' ? 'text-indigo-400 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>Template</button>
                                <button onClick={() => setActiveElementorView('settings')} className={`text-[10px] font-bold uppercase tracking-widest pb-3 border-b-2 transition-all ${activeElementorView === 'settings' ? 'text-indigo-400 border-indigo-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>Site Settings</button>
                            </div>
                        )}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
                            <div className="flex items-center gap-2"><div className="flex gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" /></div><span className="ml-3 text-xs font-mono text-slate-400">{activeGenTab === 'vibecoding' ? t.designDirector.actions.generatedLabel : (activeElementorView === 'template' ? "Template JSON" : "Site Settings")}</span></div>
                            {getCurrentContent() && (
                                <div className="flex items-center gap-2">
                                    {activeGenTab === 'elementor' && activeElementorView === 'settings' && (<button onClick={() => setShowRawJson(!showRawJson)} className={`p-1.5 rounded-lg transition-colors ${showRawJson ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-white'}`}><FileCode size={14} /></button>)}
                                    {activeGenTab === 'elementor' && (<button onClick={downloadElementorFile} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-500"><Download size={14} /> Download</button>)}
                                    <button onClick={() => copyToClipboard()} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${copySuccess === 'all' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>{copySuccess === 'all' ? <Check size={14} /> : <Copy size={14} />}{copySuccess === 'all' ? t.designDirector.actions.copied : t.designDirector.actions.copy}</button>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 p-6 relative flex flex-col min-h-0">
                            {isGenerating ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-50"><Loader2 size={48} className="animate-spin mb-4 text-indigo-500" /><p className="text-sm font-mono animate-pulse">Compiling...</p></div>
                            ) : getCurrentContent() ? (
                                <>
                                    {activeGenTab === 'elementor' && activeElementorView === 'settings' && !showRawJson ? (
                                        renderSiteSettingsVisuals()
                                    ) : (
                                        <textarea 
                                            className="w-full flex-1 bg-transparent text-slate-300 font-mono text-xs md:text-sm resize-none outline-none custom-scrollbar leading-relaxed" 
                                            value={getCurrentContent()!} 
                                            readOnly 
                                        />
                                    )}
                                    
                                    {/* Helping Info Footers */}
                                    {activeGenTab === 'vibecoding' && (
                                        <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-start gap-3 shrink-0">
                                            <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shrink-0">
                                                <Monitor size={16} />
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-indigo-400 mb-1 uppercase tracking-tight">HOW TO DEPLOY</h4>
                                                <p className="text-xs text-indigo-100 leading-relaxed opacity-90">
                                                    {t.designDirector.actions.vibeInstructions}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {activeGenTab === 'elementor' && activeElementorView === 'template' && (
                                        <div className="mt-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-3 shrink-0">
                                            <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-bold text-amber-400 mb-1">IMPORT INSTRUCTIONS</h4>
                                                <ol className="text-xs text-amber-100 list-decimal pl-4 space-y-1">
                                                    <li>Go to Templates &gt; Saved Templates.</li>
                                                    <li>Click Import Templates.</li>
                                                    <li>Upload this .json.</li>
                                                </ol>
                                            </div>
                                        </div>
                                    )}

                                    {activeGenTab === 'elementor' && activeElementorView === 'settings' && showRawJson && (
                                        <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl flex items-start gap-3 shrink-0">
                                            <Info size={18} className="text-indigo-400 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="text-sm font-bold text-indigo-400 mb-1">SITE SETTINGS JSON</h4>
                                                <p className="text-xs text-indigo-100 opacity-90">
                                                    This file contains global styles (colors/typography). Some versions of Elementor require manual entry via the 'Site Settings' menu using the visualizer on the previous tab.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-600 p-8 text-center">
                                    {activeGenTab === 'vibecoding' ? (
                                        <Terminal size={48} className="mb-4 opacity-20" />
                                    ) : (
                                        <FileJson size={48} className="mb-4 opacity-20" />
                                    )}
                                    <h3 className="text-xl font-bold text-slate-400 mb-2">{t.designDirector.actions.readyToBuild}</h3>
                                    <p className="max-w-md text-sm">
                                        {activeGenTab === 'vibecoding' 
                                            ? t.designDirector.actions.readyDesc 
                                            : "Generate high-fidelity JSON code to import into Elementor."}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
