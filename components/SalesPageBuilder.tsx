
import React, { useState, useRef, useEffect } from 'react';
import { Product, Language, LandingPageBuilderData, BuilderSectionId, LandingPageCopy } from '../types';
import { SalesPageWireframe } from './SalesPageWireframe';
import { Loader2, Sparkles, LayoutTemplate, Type, Eye, Globe, Check, Zap, GripVertical, ToggleLeft, ToggleRight, Square, Plus, Trash2, MessageSquare, Send, Bot, User, X, Compass, Undo, Redo, Maximize2, FileText, ChevronRight, ChevronDown, Save, Magnet } from 'lucide-react';
import { refineLandingPageCopy } from '../services/salesPageCopyService';
import { getTranslation } from '../translations';

interface BuilderProps {
    product: Product;
    language: Language;
    onUpdate: (data: LandingPageBuilderData) => void;
    onGenerate?: () => void | Promise<void>;
    loading?: boolean;
    onSectionRefresh?: (sectionId: BuilderSectionId) => void | Promise<void>;
    refreshTasks?: Set<string>;
}

const AVAILABLE_SECTIONS: { id: BuilderSectionId }[] = [
    { id: 'header' },
    { id: 'hero' },
    { id: 'numbers_bar' },
    { id: 'intro_pain' },
    { id: 'solution' },
    { id: 'features' },
    { id: 'categories' },
    { id: 'who_transformation' },
    { id: 'comparison_vs' },
    { id: 'process' },
    { id: 'offer' },
    { id: 'social_proof' },
    { id: 'lead_form' }, // Moved before about_author
    { id: 'about_author' },
    { id: 'faq' },
    { id: 'full_width_cta' },
    { id: 'footer_contact' },
];

const TONES_VALUES = ['Direct Response', 'Empathetic', 'Authoritative', 'Minimalist', 'Story-Driven', 'Bold / Contrarian'];
const LANGUAGES: { id: Language; label: string }[] = [
    { id: 'en', label: 'English' },
    { id: 'pt', label: 'Português' },
    { id: 'es', label: 'Español' }
];

const CREATIVITY_VALUES = [0, 0.25, 0.5, 0.75, 1];

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    text: string;
}

// --- SUB-COMPONENT: BRIEFING MODAL ---
interface BriefingModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentValue: string;
    onSave: (val: string) => void;
    activeSections: BuilderSectionId[];
    t: any;
}

const BriefingModal: React.FC<BriefingModalProps> = ({ isOpen, onClose, currentValue, onSave, activeSections, t }) => {
    const [globalInstruction, setGlobalInstruction] = useState("");
    const [sectionInstructions, setSectionInstructions] = useState<Record<string, string>>({});
    const [openSections, setOpenSections] = useState<Set<string>>(new Set());

    // Parse the current string into structured data ONLY when opening
    useEffect(() => {
        if (isOpen) {
            const sections: Record<string, string> = {};
            let global = currentValue;

            const regex = /\[([a-zA-Z0-9_]+)\]:\s*([\s\S]*?)(?=\n\[|$)/g;
            let match;
            let firstMatchIndex = Infinity;

            while ((match = regex.exec(currentValue)) !== null) {
                const secId = match[1];
                const content = match[2].trim();
                if (activeSections.includes(secId as any)) {
                    sections[secId] = content;
                }
                if (match.index < firstMatchIndex) firstMatchIndex = match.index;
            }

            if (firstMatchIndex !== Infinity) {
                global = currentValue.substring(0, firstMatchIndex).trim();
            }

            setGlobalInstruction(global);
            setSectionInstructions(sections);
        }
    }, [isOpen]); 

    const handleSave = () => {
        let finalString = globalInstruction.trim();
        
        Object.entries(sectionInstructions).forEach(([secId, content]) => {
            if (typeof content === 'string' && content.trim()) {
                finalString += `\n\n[${secId}]: ${content.trim()}`;
            }
        });

        onSave(finalString);
        onClose();
    };

    const handleClearAll = () => {
        setGlobalInstruction("");
        setSectionInstructions({});
    };

    const toggleSection = (id: string) => {
        setOpenSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-4xl h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up border border-gray-100">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-display font-bold text-gray-900 tracking-tight">AI Briefing Dossier</h3>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Advanced Generation Control</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-white">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe size={16} className="text-indigo-600" />
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Global Direction</h4>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                Define the overall vibe, specific phrasing rules, or critical requirements that apply to the entire page.
                            </p>
                            <textarea 
                                value={globalInstruction}
                                onChange={(e) => setGlobalInstruction(e.target.value)}
                                className="w-full h-96 bg-slate-50 border border-gray-200 rounded-2xl p-6 text-sm font-medium text-gray-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none leading-relaxed shadow-inner"
                                placeholder="E.g., Use short, punchy sentences. Focus heavily on speed of implementation. Avoid the word 'synergy'. Ensure the tone feels like a conversation between friends..."
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <LayoutTemplate size={16} className="text-indigo-600" />
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Section Specifics</h4>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed mb-4">
                                Granular instructions for specific active sections. The AI will prioritize these rules for the respective blocks.
                            </p>
                            <div className="space-y-3">
                                {activeSections.map(secId => {
                                    const hasContent = !!sectionInstructions[secId];
                                    const isOpen = openSections.has(secId) || hasContent;
                                    const label = t.salesPageBuilder.sections[secId] || secId;

                                    return (
                                        <div key={secId} className={`border rounded-xl transition-all duration-300 ${hasContent ? 'border-indigo-200 bg-indigo-50/30' : 'border-gray-200 bg-white'}`}>
                                            <button 
                                                onClick={() => toggleSection(secId)}
                                                className="w-full flex items-center justify-between p-4 text-left"
                                            >
                                                <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${hasContent ? 'text-indigo-700' : 'text-gray-600'}`}>
                                                    {hasContent && <Check size={12} className="text-indigo-600" />}
                                                    {label}
                                                </span>
                                                {isOpen ? <ChevronDown size={14} className="text-gray-400"/> : <ChevronRight size={14} className="text-gray-400"/>}
                                            </button>
                                            
                                            {isOpen && (
                                                <div className="px-4 pb-4 animate-slide-up">
                                                    <textarea 
                                                        value={sectionInstructions[secId] || ""}
                                                        onChange={(e) => setSectionInstructions(prev => ({ ...prev, [secId]: e.target.value }))}
                                                        className="w-full h-24 bg-white border border-gray-200 rounded-xl p-3 text-xs font-medium text-gray-700 focus:border-indigo-400 outline-none resize-none transition-all shadow-sm"
                                                        placeholder={`Specific instructions for ${label}...`}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
                    <button 
                        onClick={handleClearAll}
                        className="px-4 py-3 rounded-xl text-red-500 font-bold text-xs hover:bg-red-50 transition-all flex items-center gap-2"
                        title="Clear all instructions"
                    >
                        <Trash2 size={16} /> Clear All
                    </button>
                    <div className="flex gap-3">
                        <button onClick={onClose} className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 transition-all">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center gap-2">
                            <Save size={16} /> Save Briefing
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const AIChatPanel = ({ product, language, currentCopy, onUpdateCopy, targetedSection, onClearTarget, initialInput, onBusyChange, isExternalBusy }: { 
    product: Product, 
    language: Language, 
    currentCopy: any, 
    onUpdateCopy: (newCopy: any) => void,
    targetedSection: BuilderSectionId | null,
    onClearTarget: () => void,
    initialInput?: string,
    onBusyChange: (busy: boolean) => void,
    isExternalBusy: boolean
}) => {
    const t = getTranslation(language);
    
    const GENERAL_SUGGESTIONS = t.salesPageBuilder.chat.suggestions.general;
    
    const SECTION_SPECIFIC_SUGGESTIONS: Record<string, string[]> = {
        hero: t.salesPageBuilder.chat.suggestions.hero,
        intro_pain: t.salesPageBuilder.chat.suggestions.intro_pain,
        solution: t.salesPageBuilder.chat.suggestions.solution,
        features: t.salesPageBuilder.chat.suggestions.features,
        offer: t.salesPageBuilder.chat.suggestions.offer,
        social_proof: t.salesPageBuilder.chat.suggestions.social_proof,
        faq: t.salesPageBuilder.chat.suggestions.faq
    };

    const [messages, setMessages] = useState<ChatMessage[]>([
        { id: 'welcome', role: 'assistant', text: t.salesPageBuilder.chat.welcome }
    ]);
    const [input, setInput] = useState("");
    const [activeContext, setActiveContext] = useState<string | null>(null);
    const [isRefining, setIsRefining] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeft = useRef(0);

    useEffect(() => {
        if (initialInput) {
            setActiveContext(initialInput);
            setMessages(prev => [
                ...prev, 
                { 
                    id: Date.now().toString(), 
                    role: 'assistant', 
                    text: `I'm ready to refine this element:\n\n"${initialInput}"\n\nHow would you like to change it?` 
                }
            ]);
            setInput("");
        }
    }, [initialInput]);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    useEffect(() => {
        setMessages(prev => {
            if (prev.length === 1 && prev[0].id === 'welcome') {
                return [{ id: 'welcome', role: 'assistant', text: t.salesPageBuilder.chat.welcome }];
            }
            return prev;
        });
    }, [language, t.salesPageBuilder.chat.welcome]);

    const handleSend = async (text: string) => {
        if (!text.trim() || isRefining || isExternalBusy) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setIsRefining(true);
        onBusyChange(true);

        const fullInstruction = activeContext 
            ? `Targeting specific content: "${activeContext}". Instruction: ${text}` 
            : text;

        try {
            const thinkingText = targetedSection 
                ? `${t.salesPageBuilder.chat.analyzingSection} ${t.salesPageBuilder.sections[targetedSection] || targetedSection}...` 
                : t.salesPageBuilder.chat.analyzing;
            setMessages(prev => [...prev, { id: 'thinking', role: 'assistant', text: thinkingText }]);

            const partialUpdate = await refineLandingPageCopy(currentCopy, fullInstruction, {
                name: product.name,
                description: product.description,
                decisionMaker: product.decisionMaker,
                goal: product.goal
            }, language, targetedSection || undefined);

            const newCopy = { ...currentCopy };
            Object.keys(partialUpdate || {}).forEach(key => {
                if (partialUpdate[key]) {
                    newCopy[key] = { ...newCopy[key], ...partialUpdate[key] };
                }
            });
            
            onUpdateCopy(newCopy);
            setActiveContext(null);

            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== 'thinking');
                return [...filtered, { id: Date.now().toString(), role: 'assistant', text: t.salesPageBuilder.chat.done }];
            });
        } catch (e) {
            setMessages(prev => {
                const filtered = prev.filter(m => m.id !== 'thinking');
                return [...filtered, { id: Date.now().toString(), role: 'assistant', text: t.salesPageBuilder.chat.error }];
            });
        } finally {
            setIsRefining(false);
            onBusyChange(false);
        }
    };

    let activeSuggestions = GENERAL_SUGGESTIONS;

    if (activeContext) {
        const type = activeContext.split(':')[0].toLowerCase();
        const elSuggestions = t.salesPageBuilder.chat.suggestions.elements;
        
        if (elSuggestions) {
            if (type.includes('headline') || type.includes('title') || type.includes('hook') || type.includes('eyebrow') || type.includes('who') || type.includes('pricing')) {
                activeSuggestions = elSuggestions.headline;
            } else if (type.includes('cta') || type.includes('button')) {
                activeSuggestions = elSuggestions.cta;
            } else if (type.includes('benefit') || type.includes('feature') || type.includes('step') || type.includes('deliverable') || type.includes('item') || type.includes('segment')) {
                activeSuggestions = elSuggestions.bullet;
            } else if (type.includes('testimonial') || type.includes('quote')) {
                activeSuggestions = elSuggestions.social;
            } else {
                activeSuggestions = elSuggestions.body;
            }
        }
    } else if (targetedSection && SECTION_SPECIFIC_SUGGESTIONS[targetedSection]) {
        activeSuggestions = SECTION_SPECIFIC_SUGGESTIONS[targetedSection];
    }

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!suggestionsRef.current) return;
        isDragging.current = true;
        startX.current = e.pageX - suggestionsRef.current.offsetLeft;
        scrollLeft.current = suggestionsRef.current.scrollLeft;
        suggestionsRef.current.style.cursor = 'grabbing';
    };
    
    const handleMouseLeave = () => {
        isDragging.current = false;
        if(suggestionsRef.current) suggestionsRef.current.style.cursor = 'grab';
    };
    
    const handleMouseUp = () => {
        isDragging.current = false;
        if(suggestionsRef.current) suggestionsRef.current.style.cursor = 'grab';
    };
    
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging.current || !suggestionsRef.current) return;
        e.preventDefault();
        const x = e.pageX - suggestionsRef.current.offsetLeft;
        const walk = (x - startX.current) * 2;
        suggestionsRef.current.scrollLeft = scrollLeft.current - walk;
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (suggestionsRef.current) {
            suggestionsRef.current.scrollLeft += e.deltaY;
        }
    };

    return (
        <div className="flex flex-col h-full bg-white relative">
            {targetedSection && (
                <div className="bg-indigo-600 text-white px-4 py-3 flex items-center justify-center md:justify-between text-xs font-bold shadow-md shrink-0 z-10 animate-in slide-in-from-top-2">
                    <div className="flex items-center gap-2">
                        <Zap size={14} className="fill-yellow-400 text-yellow-400" />
                        <span>{t.salesPageBuilder.chat.focus}: {t.salesPageBuilder.sections[targetedSection] || targetedSection}</span>
                    </div>
                    <button onClick={onClearTarget} className="text-white/70 hover:text-white transition-colors hidden md:block">
                        <X size={14} />
                    </button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-indigo-100 text-indigo-600'}`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`p-3 rounded-2xl text-sm max-w-[85%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-gray-100 text-gray-800 rounded-tr-none' : 'bg-indigo-50 text-indigo-900 rounded-tl-none'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isRefining && <div className="flex justify-center"><Loader2 size={16} className="animate-spin text-indigo-400" /></div>}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                <div 
                    ref={suggestionsRef}
                    className={`flex gap-2 overflow-x-auto thin-scrollbar mb-3 pb-2 cursor-grab active:cursor-grabbing select-none ${isRefining || isExternalBusy ? 'opacity-50 pointer-events-none' : ''}`}
                    onMouseDown={handleMouseDown}
                    onMouseLeave={handleMouseLeave}
                    onMouseUp={handleMouseUp}
                    onMouseMove={handleMouseMove}
                    onWheel={handleWheel}
                >
                    {(activeSuggestions || []).map((s: string, i: number) => (
                        <button 
                            key={i} 
                            onClick={() => handleSend(s)}
                            disabled={isRefining || isExternalBusy}
                            className="whitespace-nowrap px-3 py-1.5 bg-white border border-gray-200 rounded-full text-[10px] font-bold text-gray-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm flex-shrink-0"
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="relative">
                    <input 
                        type="text" 
                        className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-sm disabled:bg-gray-100 disabled:text-gray-400"
                        placeholder={isExternalBusy ? "Action in progress..." : (targetedSection ? `${t.salesPageBuilder.chat.placeholderFocus} ${t.salesPageBuilder.sections[targetedSection] || targetedSection}...` : t.salesPageBuilder.chat.placeholder)}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
                        disabled={isRefining || isExternalBusy}
                    />
                    <button 
                        onClick={() => handleSend(input)}
                        disabled={!input.trim() || isRefining || isExternalBusy}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50 disabled:hover:bg-transparent"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const SalesPageBuilder: React.FC<BuilderProps> = ({ product, language, onUpdate, onGenerate, loading = false, onSectionRefresh, refreshTasks }) => {
    const [activeLeftTab, setActiveLeftTab] = useState<'structure' | 'chat'>('structure');
    const [targetedSection, setTargetedSection] = useState<BuilderSectionId | null>(null);
    const [chatInitialInput, setChatInitialInput] = useState<string>("");
    const [showBriefing, setShowBriefing] = useState(false);
    
    const t = getTranslation(language);

    const data: LandingPageBuilderData = product.lpBuilderData || {
        selectedSections: AVAILABLE_SECTIONS.map(s => s.id) as unknown as BuilderSectionId[],
        tone: 'Direct Response',
        language: language,
        creativityLevel: 0.5,
        includeStrategy: false,
        isSolutionAware: false,
        copy: {},
        customDirection: ''
    };

    const dataRef = useRef(data);
    dataRef.current = data;

    const selectedSections = data.selectedSections || [];

    const hasStrategy = !!(product.offer || product.bigIdea);

    const creativityLabels: Record<number, string> = {
        0: t.salesPageBuilder.creativityLevels.precise,
        0.25: t.salesPageBuilder.creativityLevels.analytical,
        0.5: t.salesPageBuilder.creativityLevels.balanced,
        0.75: t.salesPageBuilder.creativityLevels.engaging,
        1: t.salesPageBuilder.creativityLevels.bold
    };

    const toneMap: Record<string, keyof typeof t.salesPageBuilder.tones> = {
        'Direct Response': 'directResponse',
        'Empathetic': 'empathetic',
        'Authoritative': 'authoritative',
        'Minimalist': 'minimalist',
        'Story-Driven': 'storyDriven',
        'Bold / Contrarian': 'bold'
    };

    const [past, setPast] = useState<LandingPageBuilderData[]>([]);
    const [future, setFuture] = useState<LandingPageBuilderData[]>([]);
    
    const [autoRefreshing, setAutoRefreshing] = useState<Set<string>>(new Set());
    const [chatRefining, setChatRefining] = useState(false);

    const isGlobalBusy = chatRefining || autoRefreshing.size > 0 || loading;

    const handleDataUpdate = (newData: LandingPageBuilderData) => {
        setPast(prev => [...prev, dataRef.current]);
        setFuture([]);
        onUpdate(newData);
    };

    const updateCopySafe = (newCopy: LandingPageCopy) => {
        const currentData = dataRef.current;
        setPast(prev => [...prev, currentData]);
        setFuture([]);
        onUpdate({ ...currentData, copy: newCopy });
    };

    const handleUndo = () => {
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, past.length - 1);
        setPast(newPast);
        setFuture(prev => [data, ...prev]);
        onUpdate(previous);
    };

    const handleRedo = () => {
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);
        setFuture(newFuture);
        setPast(prev => [...prev, data]);
        onUpdate(next);
    };

    const handleAutoRefreshItem = async (sectionId: BuilderSectionId, instruction: string) => {
        if (isGlobalBusy) return;

        const itemKey = `${sectionId}-${instruction.substring(0, 15)}`; 
        setAutoRefreshing(prev => new Set(prev).add(itemKey));

        try {
            const partialUpdate = await refineLandingPageCopy(
                data.copy, 
                instruction, 
                {
                    name: product.name,
                    description: product.description,
                    decisionMaker: product.decisionMaker,
                    goal: product.goal
                }, 
                data.language || language, 
                sectionId
            );

            const currentData = dataRef.current;
            const newCopy = { ...currentData.copy };
            
            if (partialUpdate && partialUpdate[sectionId]) {
                (newCopy as any)[sectionId] = { ...(newCopy[sectionId] as any), ...(partialUpdate[sectionId] as any) };
                setPast(prev => [...prev, currentData]);
                setFuture([]);
                onUpdate({ ...currentData, copy: newCopy });
            }
        } catch (e) {
            console.error("Auto refresh failed", e);
        } finally {
            setAutoRefreshing(prev => {
                const next = new Set(prev);
                next.delete(itemKey);
                return next;
            });
        }
    };

    const handleRefineSection = async (sectionId: BuilderSectionId) => {
        if (isGlobalBusy) return;

        const sectionKey = `section-${sectionId}`;
        setAutoRefreshing(prev => new Set(prev).add(sectionKey));

        try {
            const partialUpdate = await refineLandingPageCopy(
                data.copy, 
                `Improve and refine the "${sectionId}" section. Make it more persuasive, clear, and high-converting. Keep the same structure but upgrade the copy quality.`, 
                {
                    name: product.name,
                    description: product.description,
                    decisionMaker: product.decisionMaker,
                    goal: product.goal,
                    bigIdea: data.includeStrategy ? product.bigIdea : undefined,
                    offer: data.includeStrategy ? product.offer : undefined
                }, 
                data.language || language, 
                sectionId
            );

            const currentData = dataRef.current;
            const newCopy = { ...currentData.copy };
            
            if (partialUpdate && partialUpdate[sectionId]) {
                (newCopy as any)[sectionId] = { ...(newCopy[sectionId] as any), ...(partialUpdate[sectionId] as any) };
                setPast(prev => [...prev, currentData]);
                setFuture([]);
                onUpdate({ ...currentData, copy: newCopy });
            }
        } catch (e) {
            console.error("Section refresh failed", e);
        } finally {
            setAutoRefreshing(prev => {
                const next = new Set(prev);
                next.delete(sectionKey);
                return next;
            });
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('sectionIdx', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIdxStr = e.dataTransfer.getData('sectionIdx');
        if (!dragIdxStr) return;
        
        const dragIndex = parseInt(dragIdxStr, 10);
        if (dragIndex === dropIndex) return;

        const currentSections = [...selectedSections];
        const hasHeader = currentSections.indexOf('header') !== -1;
        const hasHero = currentSections.indexOf('hero') !== -1;
        const hasFooter = currentSections.indexOf('footer_contact') !== -1;
        
        let draggableSubset = currentSections.filter(id => id !== 'header' && id !== 'hero' && id !== 'footer_contact');
        const [movedItem] = draggableSubset.splice(dragIndex, 1);
        draggableSubset.splice(dropIndex, 0, movedItem);

        const newOrder: BuilderSectionId[] = [];
        if (hasHeader) newOrder.push('header');
        if (hasHero) newOrder.push('hero');
        newOrder.push(...draggableSubset);
        if (hasFooter) newOrder.push('footer_contact');

        handleDataUpdate({ ...data, selectedSections: newOrder });
    };

    const toggleSection = (id: BuilderSectionId) => {
        if (selectedSections.includes(id)) {
            handleDataUpdate({ ...data, selectedSections: selectedSections.filter(s => s !== id) });
        } else {
            if (id === 'header') {
                handleDataUpdate({ ...data, selectedSections: ['header', ...selectedSections] });
            } else if (id === 'hero') {
                const hasHeader = selectedSections.includes('header');
                const newSections: BuilderSectionId[] = hasHeader 
                    ? ['header', 'hero', ...selectedSections.filter(s => s !== 'header')]
                    : ['hero', ...selectedSections];
                handleDataUpdate({ ...data, selectedSections: newSections });
            } else if (id === 'footer_contact') {
                handleDataUpdate({ ...data, selectedSections: [...selectedSections, id] });
            } else {
                const hasFooter = selectedSections.includes('footer_contact');
                if (hasFooter) {
                    const newSections = [...selectedSections];
                    const footerIdx = newSections.indexOf('footer_contact');
                    newSections.splice(footerIdx, 0, id);
                    handleDataUpdate({ ...data, selectedSections: newSections });
                } else {
                    handleDataUpdate({ ...data, selectedSections: [...selectedSections, id] });
                }
            }
        }
    };

    const handleRemoveSection = (id: BuilderSectionId) => {
        handleDataUpdate({ ...data, selectedSections: selectedSections.filter(s => s !== id) });
    };

    const handleChatWithSection = (id: BuilderSectionId) => {
        setTargetedSection(id);
        setChatInitialInput(""); 
        setActiveLeftTab('chat');
    };

    const handleChatWithItem = (sectionId: BuilderSectionId, itemContext: string) => {
        setTargetedSection(sectionId);
        setChatInitialInput(itemContext);
        setActiveLeftTab('chat');
    };

    const handleCreativityChange = (val: number) => {
        const closest = CREATIVITY_VALUES.reduce((prev, curr) => 
            Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev
        );
        handleDataUpdate({ ...data, creativityLevel: closest });
    };

    const isHeaderActive = selectedSections.includes('header');
    const isHeroActive = selectedSections.includes('hero');
    const isFooterActive = selectedSections.includes('footer_contact');

    const activeDraggableSections = selectedSections
        .filter((id): id is BuilderSectionId => id !== 'header' && id !== 'hero' && id !== 'footer_contact')
        .map(id => AVAILABLE_SECTIONS.find(s => s.id === id))
        .filter((s): s is { id: BuilderSectionId } => !!s);
    
    const inactiveSections = AVAILABLE_SECTIONS.filter(s => !selectedSections.includes(s.id));

    return (
        <div className="flex flex-col h-auto lg:h-[1200px] min-h-[800px] lg:overflow-hidden">
            <BriefingModal 
                isOpen={showBriefing}
                onClose={() => setShowBriefing(false)}
                currentValue={data.customDirection || ""}
                onSave={(val) => handleDataUpdate({ ...data, customDirection: val })}
                activeSections={selectedSections}
                t={t}
            />

            <div className="bg-white border-b border-gray-100 p-4 flex flex-col md:flex-row items-start md:items-center gap-6 shrink-0 z-10 shadow-sm rounded-2xl mb-6 overflow-x-auto no-scrollbar">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 ${data.includeStrategy ? 'bg-indigo-50 border-indigo-200' : 'bg-gray-50 border-gray-100'} ${!hasStrategy ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex flex-col">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${data.includeStrategy ? 'text-indigo-800' : 'text-gray-500'}`}>
                            <Zap size={14} className={data.includeStrategy ? 'fill-indigo-800' : ''} />
                            {t.salesPageBuilder.settings.strategyIncluded}
                        </span>
                        {data.includeStrategy && <span className="text-[9px] text-indigo-500 font-medium">{t.salesPageBuilder.settings.strategyInjected}</span>}
                    </div>
                    <button 
                        onClick={() => handleDataUpdate({ ...data, includeStrategy: !data.includeStrategy })}
                        className={`transition-colors ${data.includeStrategy ? 'text-indigo-600' : 'text-gray-300'}`}
                    >
                        {data.includeStrategy ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                </div>

                <div className="h-8 w-px bg-gray-200 hidden md:block shrink-0"></div>

                <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all shrink-0 ${data.isSolutionAware ? 'bg-emerald-50 border-emerald-200' : 'bg-gray-50 border-gray-100'}`}>
                    <div className="flex flex-col">
                        <span className={`text-xs font-bold flex items-center gap-1.5 ${data.isSolutionAware ? 'text-emerald-800' : 'text-gray-500'}`}>
                            <Magnet size={14} className={data.isSolutionAware ? 'fill-emerald-800' : ''} />
                            {t.salesPageBuilder.settings.solutionAware}
                        </span>
                        <span className={`text-[9px] font-medium ${data.isSolutionAware ? 'text-emerald-600' : 'text-gray-400'}`}>{t.salesPageBuilder.settings.leadformHero}</span>
                    </div>
                    <button 
                        onClick={() => handleDataUpdate({ ...data, isSolutionAware: !data.isSolutionAware })}
                        className={`transition-colors ${data.isSolutionAware ? 'text-emerald-600' : 'text-gray-300'}`}
                    >
                        {data.isSolutionAware ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                </div>

                <div className="h-8 w-px bg-gray-200 hidden md:block shrink-0"></div>

                <div className="flex flex-col min-w-[160px] shrink-0">
                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Globe size={10} /> {t.salesPageBuilder.settings.language}
                    </label>
                    <select 
                        className="bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2 text-xs font-bold text-gray-700 outline-none focus:border-indigo-500 cursor-pointer hover:bg-100 transition-colors"
                        value={data.language || language}
                        onChange={(e) => handleDataUpdate({ ...data, language: e.target.value as Language })}
                    >
                        {LANGUAGES.map(lang => <option key={lang.id} value={lang.id}>{lang.label}</option>)}
                    </select>
                </div>

                <div className="flex flex-col min-w-[200px] shrink-0">
                    <label className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Type size={10} /> {t.salesPageBuilder.settings.tone}
                    </label>
                    <select 
                        className="bg-gray-50 border border-gray-200 rounded-lg py-1.5 px-2 text-xs font-bold text-gray-700 outline-none focus:border-indigo-500 cursor-pointer hover:bg-100 transition-colors"
                        value={data.tone}
                        onChange={(e) => handleDataUpdate({ ...data, tone: e.target.value })}
                    >
                        {TONES_VALUES.map(tone => (
                            <option key={tone} value={tone}>
                                {t.salesPageBuilder.tones[toneMap[tone]] || tone}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="h-8 w-px bg-gray-200 hidden md:block shrink-0"></div>

                <div className="flex flex-col w-48 shrink-0">
                    <div className="flex justify-between items-center mb-1">
                        <label className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{t.salesPageBuilder.settings.creativity}</label>
                        <span className="text-[8px] font-bold text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                            {creativityLabels[data.creativityLevel] || 'Balanced'}
                        </span>
                    </div>
                    <div className="relative h-4 flex items-center">
                        <input 
                            type="range" 
                            min="0" max="1" step="0.25"
                            className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 relative z-10"
                            value={data.creativityLevel}
                            onChange={(e) => handleCreativityChange(parseFloat(e.target.value))}
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 left-0 w-full flex justify-between px-0.5 pointer-events-none">
                            {CREATIVITY_VALUES.map((step) => (
                                <div key={step} className={`w-1 h-1 rounded-full ${step <= data.creativityLevel ? 'bg-indigo-400' : 'bg-gray-300'}`}></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:overflow-hidden pb-4">
                <div className="w-full lg:w-80 flex-shrink-0 bg-white border border-gray-200 rounded-3xl flex flex-col shadow-sm overflow-hidden h-[600px] lg:h-full">
                    <div className="grid grid-cols-2 border-b border-gray-100">
                        <button 
                            onClick={() => setActiveLeftTab('structure')}
                            className={`py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeLeftTab === 'structure' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            <LayoutTemplate size={14} /> {t.salesPageBuilder.structure}
                        </button>
                        <button 
                            onClick={() => setActiveLeftTab('chat')}
                            className={`py-3 text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-colors ${activeLeftTab === 'chat' ? 'bg-white text-indigo-600 border-b-2 border-indigo-600' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                        >
                            <MessageSquare size={14} /> {t.salesPageBuilder.aiAssistant}
                        </button>
                    </div>

                    {activeLeftTab === 'structure' && (
                        <>
                            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-1.5">
                                <div className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-all shadow-sm border ${isHeaderActive ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                    <div className="flex items-center gap-2.5">
                                        <span className={`text-[9px] font-bold w-4 ${isHeaderActive ? 'text-indigo-400' : 'text-gray-300'}`}>00</span>
                                        <span>Header / Nav</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleChatWithSection('header')} className="p-1 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-colors"><MessageSquare size={14} /></button>
                                        <button onClick={() => toggleSection('header')} className={`transition-colors p-1 ${isHeaderActive ? 'text-indigo-600' : 'text-gray-300 hover:text-gray-500'}`}>{isHeaderActive ? <div className="bg-indigo-600 rounded text-white p-0.5"><Check size={10} strokeWidth={3} /></div> : <Square size={14} />}</button>
                                    </div>
                                </div>
                                <div className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-all shadow-sm border ${isHeroActive ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                    <div className="flex items-center gap-2.5">
                                        <span className={`text-[9px] font-bold w-4 ${isHeroActive ? 'text-indigo-400' : 'text-gray-300'}`}>01</span>
                                        <span>{t.salesPageBuilder.sections.hero}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleChatWithSection('hero')} className="p-1 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-colors"><MessageSquare size={14} /></button>
                                        <button onClick={() => toggleSection('hero')} className={`transition-colors p-1 ${isHeroActive ? 'text-indigo-600' : 'text-gray-300 hover:text-gray-500'}`}>{isHeroActive ? <div className="bg-indigo-600 rounded text-white p-0.5"><Check size={10} strokeWidth={3} /></div> : <Square size={14} />}</button>
                                    </div>
                                </div>
                                {activeDraggableSections.map((section, index) => (
                                    <div key={section.id} draggable onDragStart={(e) => handleDragStart(e, index)} onDragOver={(e) => handleDragOver(e, index)} onDrop={(e) => handleDrop(e, index)} className="flex items-center justify-between p-2.5 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-700 group cursor-move hover:border-indigo-300 hover:shadow-md transition-all shadow-sm">
                                        <div className="flex items-center gap-2.5">
                                            <GripVertical size={12} className="text-gray-300 group-hover:text-indigo-500" />
                                            <span className="text-[9px] font-bold text-indigo-300 w-4 group-hover:text-indigo-500 transition-colors">{(index + (isHeroActive ? 2 : 1)).toString().padStart(2, '0')}</span>
                                            <span>{t.salesPageBuilder.sections[section.id] || section.id.replace('_', ' ')}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button onClick={() => handleChatWithSection(section.id)} className="p-1 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-colors"><MessageSquare size={14} /></button>
                                            <button onClick={() => toggleSection(section.id)} className="text-gray-300 hover:text-indigo-600 transition-colors p-1"><div className="bg-indigo-600 rounded text-white p-0.5"><Check size={10} strokeWidth={3} /></div></button>
                                        </div>
                                    </div>
                                ))}
                                <div className={`flex items-center justify-between p-2.5 rounded-lg text-xs font-medium transition-all shadow-sm border ${isFooterActive ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-gray-50 border-transparent text-gray-400'}`}>
                                    <div className="flex items-center gap-2.5">
                                        <span className={`text-[9px] font-bold w-4 ${isFooterActive ? 'text-indigo-400' : 'text-gray-300'}`}>99</span>
                                        <span>{t.salesPageBuilder.sections.footer_contact}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => handleChatWithSection('footer_contact')} className="p-1 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded transition-colors"><MessageSquare size={14} /></button>
                                        <button onClick={() => toggleSection('footer_contact')} className={`transition-colors p-1 ${isFooterActive ? 'text-indigo-600' : 'text-gray-300 hover:text-gray-500'}`}>{isFooterActive ? <div className="bg-indigo-600 rounded text-white p-0.5"><Check size={10} strokeWidth={3} /></div> : <Square size={14} />}</button>
                                    </div>
                                </div>
                                {inactiveSections.length > 0 && (
                                    <div className="pt-3 mt-3 border-t border-dashed border-gray-200">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 pl-1">{t.salesPageBuilder.settings.availableSections}</p>
                                        <div className="space-y-1">
                                            {inactiveSections.map(section => (
                                                <button key={section.id} onClick={() => toggleSection(section.id)} className="w-full flex items-center justify-between p-2 rounded-lg text-xs font-medium text-gray-400 hover:bg-gray-50 hover:text-gray-600 border border-transparent hover:border-gray-200 transition-all text-left group">
                                                    <div className="flex items-center gap-2 pl-1">
                                                        <Plus size={12} className="text-gray-300 group-hover:text-indigo-500" />
                                                        <span>{t.salesPageBuilder.sections[section.id] || section.id.replace('_', ' ')}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-gray-100 bg-white z-10 flex-shrink-0 space-y-3">
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Compass size={10} className="text-indigo-500" /> {t.creativesStep.customDirection}
                                        </label>
                                        <button 
                                            onClick={() => setShowBriefing(true)}
                                            className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-0.5 rounded transition-all flex items-center gap-1"
                                            title="Open AI Briefing Dossier"
                                        >
                                            <Maximize2 size={10} /> Open Briefing
                                        </button>
                                    </div>
                                    <input type="text" placeholder="E.g. Focus on high urgency, use short sentences..." className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400" value={data.customDirection || ""} onChange={(e) => handleDataUpdate({ ...data, customDirection: e.target.value })} disabled={loading}/>
                                </div>
                                <button onClick={onGenerate} disabled={loading} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95 group">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} className="group-hover:scale-110 transition-transform"/>}
                                    {loading ? t.salesPageBuilder.actions.writingCopy : t.salesPageBuilder.actions.generateCopy}
                                </button>
                            </div>
                        </>
                    )}

                    {activeLeftTab === 'chat' && (
                        <AIChatPanel 
                            product={product} 
                            language={data.language || language}
                            currentCopy={data.copy || {}}
                            onUpdateCopy={updateCopySafe}
                            targetedSection={targetedSection}
                            onClearTarget={() => setTargetedSection(null)}
                            initialInput={chatInitialInput}
                            onBusyChange={setChatRefining}
                            isExternalBusy={autoRefreshing.size > 0 || loading}
                        />
                    )}
                </div>

                <div className="flex-1 min-h-[700px] lg:min-h-0 bg-gray-100 border border-gray-200 rounded-3xl overflow-hidden relative flex flex-col shadow-inner">
                    <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
                                <Eye size={14} /> {t.salesPageBuilder.actions.wireframePreview}
                            </div>
                            <div className="h-4 w-px bg-gray-200 mx-2"></div>
                            <div className="flex items-center gap-1">
                                <button 
                                    onClick={handleUndo} 
                                    disabled={past.length === 0 || isGlobalBusy} 
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Undo"
                                >
                                    <Undo size={16} />
                                </button>
                                <button 
                                    onClick={handleRedo} 
                                    disabled={future.length === 0 || isGlobalBusy} 
                                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                    title="Redo"
                                >
                                    <Redo size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="flex gap-1.5 hidden md:flex">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                        {loading ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 backdrop-blur-sm z-20">
                                <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                                <p className="text-sm font-bold text-indigo-900 uppercase tracking-widest">{t.salesPageBuilder.actions.constructing}</p>
                            </div>
                        ) : !data.copy || Object.keys(data.copy).length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <LayoutTemplate size={48} className="mb-4 opacity-20" />
                                <p className="text-sm font-medium">{t.salesPageBuilder.actions.selectToBuild}</p>
                            </div>
                        ) : (
                            <SalesPageWireframe 
                                copy={data.copy} 
                                sections={selectedSections} 
                                onRefreshSection={handleRefineSection} 
                                onRemoveSection={handleRemoveSection}
                                onChatWithSection={handleChatWithSection}
                                onChatWithItem={handleChatWithItem}
                                onAutoRefreshItem={handleAutoRefreshItem}
                                onUpdateCopy={updateCopySafe}
                                loadingSections={autoRefreshing} 
                                productId={product.id}
                                language={data.language || language}
                                isGlobalBusy={isGlobalBusy}
                                isSolutionAware={data.isSolutionAware}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
