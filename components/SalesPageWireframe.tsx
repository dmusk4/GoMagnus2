
import React, { useRef } from 'react';
import { LandingPageCopy, BuilderSectionId, Language } from '../types';
import { Check, Star, ChevronDown, HelpCircle, User, ArrowRight, ShieldCheck, Quote, ArrowDown, BarChart2, XCircle, CheckCircle2, Package, Image as ImageIcon, ArrowRight as ArrowRightIcon, RefreshCw, Loader2, Trash2, MessageSquare, Mail, Phone, MapPin, Zap, ArrowUpRight, ChevronLeft } from 'lucide-react';

interface WireframeProps {
    copy: LandingPageCopy;
    sections: BuilderSectionId[];
    onRefreshSection?: (id: BuilderSectionId) => void;
    onRemoveSection?: (id: BuilderSectionId) => void;
    onChatWithSection?: (id: BuilderSectionId) => void;
    onChatWithItem?: (sectionId: BuilderSectionId, itemContext: string) => void;
    onAutoRefreshItem?: (sectionId: BuilderSectionId, instruction: string) => void;
    onUpdateCopy?: (newCopy: LandingPageCopy) => void;
    loadingSections?: Set<string>;
    productId?: string;
    language?: Language;
    isGlobalBusy?: boolean;
    isSolutionAware?: boolean;
}

// Inline Editable Component
const EditableElement = ({ 
    tagName: Tag = 'div',
    text, 
    className = "", 
    onChange,
    disabled = false,
    placeholder = "Empty"
}: { 
    tagName?: any, 
    text: string, 
    className?: string, 
    onChange?: (val: string) => void,
    disabled?: boolean,
    placeholder?: string
}) => {
    if (!onChange || disabled) {
        return <Tag className={className}>{text}</Tag>;
    }

    return (
        <Tag
            contentEditable
            suppressContentEditableWarning
            onBlur={(e: React.FocusEvent<HTMLElement>) => {
                const newVal = e.currentTarget.innerText;
                if (newVal !== text) {
                    onChange(newVal);
                }
            }}
            className={`outline-none hover:bg-yellow-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/50 focus:text-gray-900 transition-colors cursor-text rounded-sm empty:before:content-['${placeholder}'] empty:before:text-gray-300 ${className}`}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
                if (e.key === 'Enter' && e.currentTarget.tagName !== 'TEXTAREA') {
                    e.preventDefault();
                    e.currentTarget.blur();
                }
            }}
        >
            {text}
        </Tag>
    );
};

const PlaceholderImage = ({ label = "Image", className = "h-64" }: { label?: string, className?: string }) => (
    <div className={`bg-gray-200 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 ${className}`}>
        <ImageIcon size={32} className="mb-2 opacity-50" />
        <span className="text-xs font-bold uppercase tracking-widest text-center px-4">{label}</span>
    </div>
);

const Eyebrow = ({ text, className = "mb-8", onChange, disabled }: { text: string, className?: string, onChange?: (val: string) => void, disabled?: boolean }) => (
    <div className={`inline-block px-3 py-1 ${className} text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase bg-slate-50 rounded-full border border-slate-200`}>
        <EditableElement tagName="span" text={text} onChange={onChange} disabled={disabled} />
    </div>
);

interface SectionWrapperProps { 
    children?: React.ReactNode;
    onRefresh?: () => void;
    onRemove?: () => void;
    onChat?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    label: string;
    id?: string;
}

const SectionWrapper: React.FC<SectionWrapperProps> = ({ children, onRefresh, onRemove, onChat, isLoading, disabled, label, id }) => (
    <div id={id} className="relative group/section scroll-mt-24">
        <div className={`absolute top-4 right-4 z-30 opacity-0 group-hover/section:opacity-100 transition-opacity flex items-center gap-2 ${disabled ? 'pointer-events-none opacity-50' : ''}`}>
            <span className="text-[9px] font-bold text-slate-900 bg-white px-3 py-1.5 rounded-lg shadow-sm uppercase tracking-widest pointer-events-none border border-slate-100">{label}</span>
            {onRefresh && (
                <button 
                    onClick={(e) => { e.stopPropagation(); if(!disabled) onRefresh(); }}
                    disabled={isLoading || disabled}
                    className={`p-2 bg-white rounded-lg shadow-md text-gray-400 hover:text-slate-900 hover:bg-slate-50 transition-all border border-gray-100 hover:border-slate-200 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    title="Regenerate Section"
                >
                    <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                </button>
            )}
            {onChat && (
                <button 
                    onClick={(e) => { e.stopPropagation(); if(!disabled) onChat(); }}
                    disabled={disabled}
                    className={`p-2 bg-white rounded-lg shadow-md text-gray-400 hover:text-slate-900 hover:bg-slate-50 transition-all border border-gray-100 hover:border-slate-200 group/chat ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    title="Chat with AI"
                >
                    <MessageSquare size={14} className="group-hover/chat:scale-110 transition-transform" />
                </button>
            )}
            {onRemove && (
                <button 
                    onClick={(e) => { e.stopPropagation(); if(!disabled) onRemove(); }}
                    disabled={disabled}
                    className={`p-2 bg-white rounded-lg shadow-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all border border-gray-100 hover:border-red-200 ${disabled ? 'cursor-not-allowed opacity-50' : ''}`}
                    title="Remove Section"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
        <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-50 pointer-events-none grayscale blur-[1px]' : ''}`}>
            {children}
        </div>
        {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2 border border-gray-100 animate-in fade-in zoom-in duration-300">
                    <Loader2 size={16} className="animate-spin text-slate-900" />
                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Refining...</span>
                </div>
            </div>
        )}
    </div>
);

interface ItemActionOverlayProps {
    children?: React.ReactNode;
    onChat?: () => void;
    onRefresh?: () => void;
    onRemove?: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    className?: string;
}

const ItemActionOverlay: React.FC<ItemActionOverlayProps> = ({ children, onChat, onRefresh, onRemove, isLoading, disabled, className = "" }) => (
    <div className={`relative group/item ${className} ${isLoading ? 'pointer-events-none' : ''}`}>
        <div className={isLoading ? 'opacity-50 blur-[2px] transition-all duration-300' : 'transition-all duration-300'}>
            {children}
        </div>
        {!disabled && <div className="absolute inset-0 border-2 border-indigo-500 rounded-[inherit] opacity-0 group-hover/item:opacity-100 pointer-events-none transition-opacity z-10 mix-blend-multiply"></div>}
        {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-lg border border-indigo-100 animate-in fade-in zoom-in">
                    <Loader2 size={16} className="animate-spin text-indigo-600" />
                </div>
            </div>
        ) : !disabled ? (
            <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover/item:opacity-100 transition-opacity z-20 scale-90 group-hover/item:scale-100">
                {onRefresh && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRefresh(); }}
                        className="p-1.5 bg-indigo-600 text-white rounded-md shadow-lg hover:bg-indigo-700 transition-colors"
                        title="Refresh this specific item"
                    >
                        <RefreshCw size={12} />
                    </button>
                )}
                {onChat && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onChat(); }}
                        className="p-1.5 bg-white text-indigo-600 rounded-md shadow-lg border border-indigo-100 hover:bg-indigo-50 transition-colors"
                        title="Refine this specific item"
                    >
                        <MessageSquare size={12} />
                    </button>
                )}
                {onRemove && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onRemove(); }}
                        className="p-1.5 bg-white text-red-500 rounded-md shadow-lg border border-red-100 hover:bg-red-50 transition-colors"
                        title="Delete this item"
                    >
                        <Trash2 size={12} />
                    </button>
                )}
            </div>
        ) : null}
    </div>
);

export const SalesPageWireframe: React.FC<WireframeProps> = ({ copy, sections, onRefreshSection, onRemoveSection, onChatWithSection, onChatWithItem, onAutoRefreshItem, onUpdateCopy, loadingSections, productId, language = 'en', isGlobalBusy, isSolutionAware = false }) => {
    
    const sliderRef = useRef<HTMLDivElement>(null);

    const tLabels = {
        en: { 
            included: 'Included', bestValue: 'Best Value', choose: 'Choose', feature: 'Feature', others: 'Others', us: 'Us', 
            name: 'Name', email: 'Email', phone: 'Phone', message: 'Message',
            namePlaceholder: 'Your Full Name', emailPlaceholder: 'work@email.com'
        },
        pt: { 
            included: 'Incluído', bestValue: 'Melhor Valor', choose: 'Escolher', feature: 'Funcionalidade', others: 'Outros', us: 'Nós', 
            name: 'Nome', email: 'E-mail', phone: 'Telemóvel', message: 'Mensagem',
            namePlaceholder: 'O seu nome completo', emailPlaceholder: 'seu@email.com'
        },
        es: { 
            included: 'Incluido', bestValue: 'Mejor Valor', choose: 'Elegir', feature: 'Característica', others: 'Otros', us: 'Nosotros', 
            name: 'Nombre', email: 'Correo', phone: 'Teléfono', message: 'Mensaje',
            namePlaceholder: 'Tu nombre completo', emailPlaceholder: 'tu@email.com'
        },
    }[language] || { 
        included: 'Included', bestValue: 'Best Value', choose: 'Choose', feature: 'Feature', others: 'Others', us: 'Us', 
        name: 'Name', email: 'Email', phone: 'Phone', message: 'Message',
        namePlaceholder: 'Your Full Name', emailPlaceholder: 'work@email.com'
    };

    const isItemLoading = (sectionId: BuilderSectionId, textContent: string) => {
        if (!loadingSections) return false;
        return loadingSections.has(`${sectionId}-${textContent.substring(0, 15)}`);
    };

    const handleItemChat = (sectionId: BuilderSectionId, content: string) => {
        if (!isGlobalBusy && onChatWithItem) {
            onChatWithItem(sectionId, content);
        }
    };

    const handleItemRefresh = (sectionId: BuilderSectionId, instruction: string) => {
        if (!isGlobalBusy && onAutoRefreshItem) {
            onAutoRefreshItem(sectionId, instruction);
        }
    };

    const handleRemoveItem = (sectionId: BuilderSectionId, fieldKey: string, index: number) => {
        if (isGlobalBusy || !onUpdateCopy) return;
        const sectionData = copy[sectionId] as any;
        if (!sectionData || !Array.isArray(sectionData[fieldKey])) return;
        
        const newArray = [...sectionData[fieldKey]];
        newArray.splice(index, 1);
        
        const newCopy = {
            ...copy,
            [sectionId]: {
                ...sectionData,
                [fieldKey]: newArray
            }
        };
        onUpdateCopy(newCopy);
    };

    const handleTextUpdate = (sectionId: BuilderSectionId, path: (string | number)[], newVal: string) => {
        if (!onUpdateCopy || isGlobalBusy) return;
        
        const newCopy = JSON.parse(JSON.stringify(copy));
        let target = newCopy[sectionId];
        for (let i = 0; i < path.length - 1; i++) {
            target = target[path[i]];
        }
        target[path[path.length - 1]] = newVal;
        onUpdateCopy(newCopy);
    };

    const scrollSlider = (direction: 'left' | 'right') => {
        if (sliderRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const renderSection = (id: BuilderSectionId) => {
        const data = copy[id];
        if (!data) return null;

        const wrapperProps = {
            onRefresh: onRefreshSection ? () => onRefreshSection(id) : undefined,
            onRemove: onRemoveSection ? () => onRemoveSection(id) : undefined,
            onChat: onChatWithSection ? () => onChatWithSection(id) : undefined,
            isLoading: loadingSections?.has(`section-${id}`),
            disabled: isGlobalBusy,
            label: id.replace('_', ' '),
            id: id
        };

        const itemOverlayProps = {
            disabled: isGlobalBusy
        };

        switch (id) {
            case 'header':
                const header = data as NonNullable<LandingPageCopy['header']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <header className="h-20 border-b border-gray-200 bg-white flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
                            <div className="font-black text-xl text-gray-900 tracking-tight uppercase">
                                <EditableElement text={header.logo || "LOGO"} onChange={(v) => handleTextUpdate('header', ['logo'], v)} disabled={isGlobalBusy} />
                            </div>
                            <nav className="hidden md:flex gap-8">
                                {header.navLinks?.map((link, i) => (
                                    <div key={i} className="text-sm font-bold text-gray-600 hover:text-gray-900 cursor-pointer uppercase tracking-wide bg-transparent border-none p-0">
                                        <EditableElement text={link} onChange={(v) => handleTextUpdate('header', ['navLinks', i], v)} disabled={isGlobalBusy} />
                                    </div>
                                ))}
                            </nav>
                            <div className="px-6 py-2.5 bg-gray-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-gray-800 transition-colors">
                                <EditableElement text={header.cta || "Get Started"} onChange={(v) => handleTextUpdate('header', ['cta'], v)} disabled={isGlobalBusy} />
                            </div>
                        </header>
                    </SectionWrapper>
                );

            case 'hero':
                const h = data as NonNullable<LandingPageCopy['hero']>;
                if (isSolutionAware) {
                    // Solution Aware / Lead Form on Hero Layout
                    return (
                        <SectionWrapper {...wrapperProps}>
                            <section className="py-20 px-8 border-b border-gray-200 bg-white">
                                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                    {/* Left Column: Copy */}
                                    <div className="text-left">
                                        {h.eyebrow && (
                                            <ItemActionOverlay 
                                                {...itemOverlayProps}
                                                onChat={() => handleItemChat('hero', `Eyebrow: ${h.eyebrow}`)}
                                                onRefresh={() => handleItemRefresh('hero', `Rewrite this eyebrow: ${h.eyebrow}`)}
                                                isLoading={isItemLoading('hero', `Rewrite this eyebrow: ${h.eyebrow}`)}
                                                className="inline-block"
                                            >
                                                <Eyebrow text={h.eyebrow} onChange={(v) => handleTextUpdate('hero', ['eyebrow'], v)} disabled={isGlobalBusy} />
                                            </ItemActionOverlay>
                                        )}
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            onChat={() => handleItemChat('hero', `Headline: ${h.headline}`)}
                                            onRefresh={() => handleItemRefresh('hero', `Rewrite this headline: ${h.headline}`)}
                                            isLoading={isItemLoading('hero', `Rewrite this headline: ${h.headline}`)}
                                        >
                                            <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-8 leading-[0.95] tracking-tighter">
                                                <EditableElement text={h.headline || ""} onChange={(v) => handleTextUpdate('hero', ['headline'], v)} disabled={isGlobalBusy} />
                                            </h1>
                                        </ItemActionOverlay>
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            onChat={() => handleItemChat('hero', `Subtitle: ${h.subtitle}`)}
                                            onRefresh={() => handleItemRefresh('hero', `Rewrite this subtitle: ${h.subtitle}`)}
                                            isLoading={isItemLoading('hero', `Rewrite this subtitle: ${h.subtitle}`)}
                                        >
                                            <p className="text-xl md:text-2xl text-gray-600 mb-10 leading-relaxed font-medium max-w-xl">
                                                <EditableElement text={h.subtitle || ""} onChange={(v) => handleTextUpdate('hero', ['subtitle'], v)} disabled={isGlobalBusy} />
                                            </p>
                                        </ItemActionOverlay>
                                        <div className="flex flex-wrap gap-x-8 gap-y-3 mt-8">
                                            {h.trustSignals?.map((sig, i) => (
                                                <span key={i} className="text-xs font-bold text-gray-500 flex items-center uppercase tracking-wider">
                                                    <Check size={14} className="mr-2 text-indigo-600" /> 
                                                    <EditableElement text={sig} onChange={(v) => handleTextUpdate('hero', ['trustSignals', i], v)} disabled={isGlobalBusy} />
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Right Column: Lead Form Card */}
                                    <div className="relative">
                                        <div className="bg-white p-10 rounded-[2rem] shadow-2xl border border-gray-100 relative z-10 max-w-md mx-auto lg:ml-auto">
                                            <ItemActionOverlay 
                                                {...itemOverlayProps}
                                                onChat={() => handleItemChat('hero', `Form Title: ${h.formTitle}`)}
                                                onRefresh={() => handleItemRefresh('hero', `Rewrite form title: ${h.formTitle}`)}
                                                isLoading={isItemLoading('hero', `Rewrite form title: ${h.formTitle}`)}
                                            >
                                                <h3 className="text-2xl font-black text-gray-900 mb-2 text-center tracking-tight">
                                                    <EditableElement text={h.formTitle || "Get Started Now"} onChange={(v) => handleTextUpdate('hero', ['formTitle'], v)} disabled={isGlobalBusy} />
                                                </h3>
                                            </ItemActionOverlay>
                                            <ItemActionOverlay 
                                                {...itemOverlayProps}
                                                onChat={() => handleItemChat('hero', `Form Subtitle: ${h.formSubtitle}`)}
                                                onRefresh={() => handleItemRefresh('hero', `Rewrite form subtitle: ${h.formSubtitle}`)}
                                                isLoading={isItemLoading('hero', `Rewrite form subtitle: ${h.formSubtitle}`)}
                                            >
                                                <p className="text-center text-sm text-gray-500 mb-8">
                                                    <EditableElement text={h.formSubtitle || "Fill the form below to unlock immediate access."} onChange={(v) => handleTextUpdate('hero', ['formSubtitle'], v)} disabled={isGlobalBusy} />
                                                </p>
                                            </ItemActionOverlay>
                                            
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{tLabels.name}</label>
                                                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full text-sm text-gray-400">{tLabels.namePlaceholder}</div>
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">{tLabels.email}</label>
                                                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 w-full text-sm text-gray-400">{tLabels.emailPlaceholder}</div>
                                                </div>
                                                
                                                <ItemActionOverlay 
                                                    {...itemOverlayProps}
                                                    onChat={() => handleItemChat('hero', `Form Button: ${h.formButtonText}`)}
                                                    onRefresh={() => handleItemRefresh('hero', `Rewrite form button: ${h.formButtonText}`)}
                                                    isLoading={isItemLoading('hero', `Rewrite form button: ${h.formButtonText}`)}
                                                >
                                                    <div className="mt-4 w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg uppercase tracking-wide text-sm text-center cursor-pointer hover:bg-gray-800 transition-colors">
                                                        <EditableElement text={h.formButtonText || h.cta || "Submit Request"} onChange={(v) => handleTextUpdate('hero', ['formButtonText'], v)} disabled={isGlobalBusy} />
                                                    </div>
                                                </ItemActionOverlay>
                                                
                                                <ItemActionOverlay 
                                                    {...itemOverlayProps}
                                                    onChat={() => handleItemChat('hero', `Trust Text: ${h.formTrustText}`)}
                                                    onRefresh={() => handleItemRefresh('hero', `Rewrite trust text: ${h.formTrustText}`)}
                                                    isLoading={isItemLoading('hero', `Rewrite trust text: ${h.formTrustText}`)}
                                                >
                                                    <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-1.5">
                                                        <ShieldCheck size={12} /> <EditableElement text={h.formTrustText || "No credit card required"} onChange={(v) => handleTextUpdate('hero', ['formTrustText'], v)} disabled={isGlobalBusy} />
                                                    </p>
                                                </ItemActionOverlay>
                                            </div>
                                        </div>
                                        {/* Decorative blob behind form */}
                                        <div className="absolute top-10 -right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10"></div>
                                        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl -z-10"></div>
                                    </div>
                                </div>
                            </section>
                        </SectionWrapper>
                    );
                }
                
                // Default Centered Layout
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-16 px-8 text-center border-b border-gray-200 bg-white">
                            <div className="max-w-6xl mx-auto">
                                {h.eyebrow && (
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('hero', `Eyebrow: ${h.eyebrow}`)}
                                        onRefresh={() => handleItemRefresh('hero', `Rewrite this eyebrow: ${h.eyebrow}`)}
                                        isLoading={isItemLoading('hero', `Rewrite this eyebrow: ${h.eyebrow}`)}
                                        className="inline-block"
                                    >
                                        <Eyebrow text={h.eyebrow} onChange={(v) => handleTextUpdate('hero', ['eyebrow'], v)} disabled={isGlobalBusy} />
                                    </ItemActionOverlay>
                                )}
                                <ItemActionOverlay 
                                    {...itemOverlayProps}
                                    onChat={() => handleItemChat('hero', `Headline: ${h.headline}`)}
                                    onRefresh={() => handleItemRefresh('hero', `Rewrite this headline: ${h.headline}`)}
                                    isLoading={isItemLoading('hero', `Rewrite this headline: ${h.headline}`)}
                                >
                                    <h1 className="text-6xl md:text-8xl font-black text-gray-900 mb-8 leading-[0.95] tracking-tighter">
                                        <EditableElement text={h.headline || ""} onChange={(v) => handleTextUpdate('hero', ['headline'], v)} disabled={isGlobalBusy} />
                                    </h1>
                                </ItemActionOverlay>
                                <ItemActionOverlay 
                                    {...itemOverlayProps}
                                    onChat={() => handleItemChat('hero', `Subtitle: ${h.subtitle}`)}
                                    onRefresh={() => handleItemRefresh('hero', `Rewrite this subtitle: ${h.subtitle}`)}
                                    isLoading={isItemLoading('hero', `Rewrite this subtitle: ${h.subtitle}`)}
                                    className="max-w-4xl mx-auto"
                                >
                                    <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed font-medium">
                                        <EditableElement text={h.subtitle || ""} onChange={(v) => handleTextUpdate('hero', ['subtitle'], v)} disabled={isGlobalBusy} />
                                    </p>
                                </ItemActionOverlay>
                                <div className="flex flex-col items-center gap-2">
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('hero', `CTA: ${h.cta}`)}
                                        onRefresh={() => handleItemRefresh('hero', `Rewrite this CTA: ${h.cta}`)}
                                        isLoading={isItemLoading('hero', `Rewrite this CTA: ${h.cta}`)}
                                        className="inline-block"
                                    >
                                        <div className="px-14 py-6 bg-gray-900 text-white font-bold rounded-2xl shadow-xl w-fit mx-auto uppercase tracking-wide text-lg hover:bg-gray-800 transition-colors cursor-pointer active:scale-95">
                                            <EditableElement text={h.cta || "Click Here"} onChange={(v) => handleTextUpdate('hero', ['cta'], v)} disabled={isGlobalBusy} />
                                        </div>
                                    </ItemActionOverlay>
                                    {h.ctaSubtext && (
                                        <span className="text-xs text-gray-500 italic mt-2">
                                            <EditableElement text={h.ctaSubtext} onChange={(v) => handleTextUpdate('hero', ['ctaSubtext'], v)} disabled={isGlobalBusy} />
                                        </span>
                                    )}
                                </div>
                                <div className="mt-16 pt-8 border-t border-gray-100 flex flex-wrap justify-center gap-x-10 gap-y-4">
                                    {h.trustSignals?.map((sig, i) => (
                                        <span key={i} className="text-xs font-bold text-gray-400 flex items-center uppercase tracking-wider">
                                            <Check size={14} className="mr-2 text-gray-900" /> 
                                            <EditableElement text={sig} onChange={(v) => handleTextUpdate('hero', ['trustSignals', i], v)} disabled={isGlobalBusy} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'numbers_bar':
                const nb = data as NonNullable<LandingPageCopy['numbers_bar']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-10 px-8 bg-gray-100 border-b border-gray-200">
                            <div className="max-w-6xl mx-auto flex flex-wrap justify-center md:justify-around gap-16">
                                {nb.metrics?.map((metric, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-5xl md:text-7xl font-black text-gray-900 mb-2 font-mono tracking-tighter">
                                            <EditableElement text={metric.value} onChange={(v) => handleTextUpdate('numbers_bar', ['metrics', i, 'value'], v)} disabled={isGlobalBusy} />
                                        </div>
                                        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.3em]">
                                            <EditableElement text={metric.label} onChange={(v) => handleTextUpdate('numbers_bar', ['metrics', i, 'label'], v)} disabled={isGlobalBusy} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'categories':
                const cat = data as NonNullable<LandingPageCopy['categories']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-20 px-8 bg-white border-b border-gray-200">
                            <div className="max-w-7xl mx-auto">
                                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                                    <div className="max-w-2xl">
                                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tighter">
                                            <EditableElement text={cat.sectionTitle} onChange={(v) => handleTextUpdate('categories', ['sectionTitle'], v)} disabled={isGlobalBusy} />
                                        </h2>
                                        <p className="text-xl text-gray-500 font-medium leading-relaxed">
                                            <EditableElement text={cat.sectionSubtitle} onChange={(v) => handleTextUpdate('categories', ['sectionSubtitle'], v)} disabled={isGlobalBusy} />
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => scrollSlider('left')} className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"><ChevronLeft size={20}/></button>
                                        <button onClick={() => scrollSlider('right')} className="p-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"><ArrowRightIcon size={20}/></button>
                                    </div>
                                </div>
                                <div ref={sliderRef} className="flex gap-8 overflow-x-auto no-scrollbar pb-8 snap-x scroll-smooth">
                                    {cat.items?.map((item, i) => (
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            key={i} 
                                            onChat={() => handleItemChat('categories', `Category: ${item.title}`)}
                                            onRefresh={() => handleItemRefresh('categories', `Rewrite category: ${item.title}`)}
                                            onRemove={() => handleRemoveItem('categories', 'items', i)}
                                            className="min-w-[320px] md:min-w-[400px] snap-start"
                                        >
                                            <div className="group/cat-card flex flex-col gap-6">
                                                <PlaceholderImage label={item.imagePrompt || "Category Visual"} className="h-96 rounded-[2.5rem] grayscale group-hover/cat-card:grayscale-0 transition-all duration-500" />
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-3 flex items-center justify-between">
                                                        <EditableElement text={item.title} onChange={(v) => handleTextUpdate('categories', ['items', i, 'title'], v)} disabled={isGlobalBusy} />
                                                        <ArrowUpRight size={20} className="text-gray-300 group-hover/cat-card:text-gray-900 transition-colors" />
                                                    </h3>
                                                    <p className="text-gray-500 leading-relaxed font-medium mb-4">
                                                        <EditableElement text={item.description} onChange={(v) => handleTextUpdate('categories', ['items', i, 'description'], v)} disabled={isGlobalBusy} />
                                                    </p>
                                                    <span className="text-xs font-bold text-gray-900 uppercase tracking-widest border-b-2 border-gray-900 pb-1 cursor-pointer">
                                                        <EditableElement text={item.linkText} onChange={(v) => handleTextUpdate('categories', ['items', i, 'linkText'], v)} disabled={isGlobalBusy} />
                                                    </span>
                                                </div>
                                            </div>
                                        </ItemActionOverlay>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'intro_pain':
                const p = data as NonNullable<LandingPageCopy['intro_pain']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-20 px-8 bg-gray-950 text-white border-b border-gray-800 overflow-hidden">
                            <div className="max-w-7xl mx-auto text-center">
                                {p.sectionTitle && (
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('intro_pain', `Section Title: ${p.sectionTitle}`)}
                                        onRefresh={() => handleItemRefresh('intro_pain', `Rewrite this section title: ${p.sectionTitle}`)}
                                        isLoading={isItemLoading('intro_pain', `Rewrite this section title: ${p.sectionTitle}`)}
                                        className="inline-block"
                                    >
                                        <Eyebrow text={p.sectionTitle} onChange={(v) => handleTextUpdate('intro_pain', ['sectionTitle'], v)} disabled={isGlobalBusy} />
                                    </ItemActionOverlay>
                                )}
                                
                                <ItemActionOverlay 
                                    {...itemOverlayProps}
                                    onChat={() => handleItemChat('intro_pain', `Hook: ${p.hook}`)}
                                    onRefresh={() => handleItemRefresh('intro_pain', `Rewrite this hook: ${p.hook}`)}
                                    isLoading={isItemLoading('intro_pain', `Rewrite this hook: ${p.hook}`)}
                                >
                                    <div className="text-6xl md:text-8xl font-black mb-10 leading-[0.95] tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-gray-600">
                                        <EditableElement text={p.hook || ""} onChange={(v) => handleTextUpdate('intro_pain', ['hook'], v)} disabled={isGlobalBusy} />
                                    </div>
                                </ItemActionOverlay>

                                <div className="space-y-6 max-w-4xl mx-auto mb-16">
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('intro_pain', `Pain Story: ${p.painStory?.join(' ')}`)}
                                        onRefresh={() => handleItemRefresh('intro_pain', `Rewrite this pain story: ${p.painStory?.join(' ')}`)}
                                        isLoading={isItemLoading('intro_pain', `Rewrite this pain story: ${p.painStory?.join(' ')}`)}
                                    >
                                        {p.painStory?.map((line, i) => (
                                            <p key={i} className="text-xl md:text-2xl text-gray-400 font-medium leading-relaxed italic opacity-80">
                                                <EditableElement text={line} onChange={(v) => handleTextUpdate('intro_pain', ['painStory', i], v)} disabled={isGlobalBusy} />
                                            </p>
                                        ))}
                                    </ItemActionOverlay>
                                </div>

                                <div className="pt-8 border-t border-white/5 inline-block">
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('intro_pain', `Agitation: ${p.agitation}`)}
                                        onRefresh={() => handleItemRefresh('intro_pain', `Rewrite this agitation: ${p.agitation}`)}
                                        isLoading={isItemLoading('intro_pain', `Rewrite this agitation: ${p.agitation}`)}
                                    >
                                        <p className="text-lg md:text-xl font-bold text-white uppercase tracking-[0.3em] animate-pulse-slow">
                                            <EditableElement text={p.agitation || ""} onChange={(v) => handleTextUpdate('intro_pain', ['agitation'], v)} disabled={isGlobalBusy} />
                                        </p>
                                    </ItemActionOverlay>
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'solution':
                const s = data as NonNullable<LandingPageCopy['solution']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-20 px-8 bg-white border-b border-gray-200">
                            <div className="max-w-6xl mx-auto">
                                <div className="text-center mb-20">
                                    {s.sectionTitle && (
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            onChat={() => handleItemChat('solution', `Section Title: ${s.sectionTitle}`)}
                                            onRefresh={() => handleItemRefresh('solution', `Rewrite this section title: ${s.sectionTitle}`)}
                                            isLoading={isItemLoading('solution', `Rewrite this section title: ${s.sectionTitle}`)}
                                            className="inline-block"
                                        >
                                            <Eyebrow text={s.sectionTitle} onChange={(v) => handleTextUpdate('solution', ['sectionTitle'], v)} disabled={isGlobalBusy} />
                                        </ItemActionOverlay>
                                    )}
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('solution', `Headline: ${s.headline}`)}
                                        onRefresh={() => handleItemRefresh('solution', `Rewrite this headline: ${s.headline}`)}
                                        isLoading={isItemLoading('solution', `Rewrite this headline: ${s.headline}`)}
                                    >
                                        <h2 className="text-6xl md:text-8xl font-black text-gray-900 mb-10 tracking-tighter leading-[0.95]">
                                            <EditableElement text={s.headline || ""} onChange={(v) => handleTextUpdate('solution', ['headline'], v)} disabled={isGlobalBusy} />
                                        </h2>
                                    </ItemActionOverlay>
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('solution', `Description: ${s.description}`)}
                                        onRefresh={() => handleItemRefresh('solution', `Rewrite this description: ${s.description}`)}
                                        isLoading={isItemLoading('solution', `Rewrite this description: ${s.description}`)}
                                        className="max-w-5xl mx-auto"
                                    >
                                        <p className="text-2xl md:text-3xl text-gray-500 font-medium leading-relaxed">
                                            <EditableElement text={s.description || ""} onChange={(v) => handleTextUpdate('solution', ['description'], v)} disabled={isGlobalBusy} />
                                        </p>
                                    </ItemActionOverlay>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-start">
                                    <div className="lg:col-span-7">
                                        <div className="relative group">
                                            <div className="absolute -inset-4 bg-gray-50 rounded-[3rem] transform -rotate-1 group-hover:rotate-0 transition-transform"></div>
                                            <PlaceholderImage label={s.imagePrompt || "Product Solution Visual"} className="h-[550px] relative z-10 bg-gray-100 rounded-[2.5rem] shadow-2xl border border-gray-200" />
                                            {s.resultBox && (
                                                <div className="absolute -bottom-8 -right-8 bg-gray-900 text-white p-8 rounded-3xl shadow-2xl z-20 max-w-sm animate-slide-up border border-gray-700">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center shrink-0 shadow-lg shadow-white/5">
                                                            <CheckCircle2 size={28} className="text-white" />
                                                        </div>
                                                        <div>
                                                            <p className="font-black text-xl leading-tight tracking-tight">
                                                                <EditableElement text={s.resultBox.text || ""} onChange={(v) => handleTextUpdate('solution', ['resultBox', 'text'], v)} disabled={isGlobalBusy} />
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-5 space-y-12">
                                        <div className="space-y-4">
                                            <div className="h-1 w-12 bg-slate-900"></div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 gap-5">
                                            {s.keyBenefits?.map((benefit, i) => (
                                                <ItemActionOverlay 
                                                    {...itemOverlayProps}
                                                    key={i} 
                                                    onChat={() => handleItemChat('solution', `Benefit: ${benefit}`)}
                                                    onRefresh={() => handleItemRefresh('solution', `Rewrite this benefit: ${benefit}`)}
                                                    isLoading={isItemLoading('solution', `Rewrite this benefit: ${benefit}`)}
                                                >
                                                    <div className="flex items-start gap-5 p-6 bg-gray-50 border border-gray-200 rounded-[2rem] hover:border-slate-900 hover:bg-white transition-all group/benefit">
                                                        <div className="mt-1 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 group-hover/benefit:bg-slate-900 group-hover/benefit:border-slate-900 group-hover/benefit:text-white transition-all shadow-sm">
                                                            <Check size={14} strokeWidth={4} />
                                                        </div>
                                                        <span className="text-gray-800 font-bold text-lg leading-snug">
                                                            <EditableElement text={benefit} onChange={(v) => handleTextUpdate('solution', ['keyBenefits', i], v)} disabled={isGlobalBusy} />
                                                        </span>
                                                    </div>
                                                </ItemActionOverlay>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'features':
                const f = data as NonNullable<LandingPageCopy['features']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-20 px-8 bg-white border-b border-gray-200">
                            <div className="text-center max-w-5xl mx-auto mb-20">
                                {f.sectionSubtitle && (
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('features', `Subtitle: ${f.sectionSubtitle}`)}
                                        onRefresh={() => handleItemRefresh('features', `Rewrite this subtitle: ${f.sectionSubtitle}`)}
                                        isLoading={isItemLoading('features', `Rewrite this subtitle: ${f.sectionSubtitle}`)}
                                        className="inline-block"
                                    >
                                        <Eyebrow text={f.sectionSubtitle} onChange={(v) => handleTextUpdate('features', ['sectionSubtitle'], v)} disabled={isGlobalBusy} />
                                    </ItemActionOverlay>
                                )}
                                {f.sectionTitle && (
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('features', `Title: ${f.sectionTitle}`)}
                                        onRefresh={() => handleItemRefresh('features', `Rewrite this title: ${f.sectionTitle}`)}
                                        isLoading={isItemLoading('features', `Rewrite this title: ${f.sectionTitle}`)}
                                    >
                                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tighter">
                                            <EditableElement text={f.sectionTitle} onChange={(v) => handleTextUpdate('features', ['sectionTitle'], v)} disabled={isGlobalBusy} />
                                        </h2>
                                    </ItemActionOverlay>
                                )}
                                {f.sectionParagraph && (
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('features', `Paragraph: ${f.sectionParagraph}`)}
                                        onRefresh={() => handleItemRefresh('features', `Rewrite this paragraph: ${f.sectionParagraph}`)}
                                        isLoading={isItemLoading('features', `Rewrite this paragraph: ${f.sectionParagraph}`)}
                                        className="max-w-4xl mx-auto"
                                    >
                                        <p className="text-xl text-gray-600 leading-relaxed font-medium">
                                            <EditableElement text={f.sectionParagraph} onChange={(v) => handleTextUpdate('features', ['sectionParagraph'], v)} disabled={isGlobalBusy} />
                                        </p>
                                    </ItemActionOverlay>
                                )}
                            </div>
                            <div className="max-w-6xl mx-auto space-y-24 mb-24">
                                {f.mainFeatures?.map((feat, i) => (
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        key={i} 
                                        onChat={() => handleItemChat('features', `Feature: ${feat.headline} - ${feat.body}`)}
                                        onRefresh={() => handleItemRefresh('features', `Rewrite this feature: ${feat.headline}`)}
                                        onRemove={() => handleRemoveItem('features', 'mainFeatures', i)}
                                        isLoading={isItemLoading('features', `Rewrite this feature: ${feat.headline}`)}
                                    >
                                        <div className={`flex flex-col ${i % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-16 items-center`}>
                                            <div className="flex-1 w-full"><PlaceholderImage label={feat.imagePrompt || "Feature Visual"} className="h-80 md:h-96 bg-gray-100 rounded-[2.5rem]" /></div>
                                            <div className="flex-1 space-y-6">
                                                <div className="w-12 h-12 bg-gray-900 text-white flex items-center justify-center font-bold rounded-2xl mb-6 shadow-lg">{i + 1}</div>
                                                <h3 className="text-4xl font-bold text-gray-900 tracking-tight">
                                                    <EditableElement text={feat.headline} onChange={(v) => handleTextUpdate('features', ['mainFeatures', i, 'headline'], v)} disabled={isGlobalBusy} />
                                                </h3>
                                                <p className="text-gray-600 leading-relaxed text-lg font-medium">
                                                    <EditableElement text={feat.body} onChange={(v) => handleTextUpdate('features', ['mainFeatures', i, 'body'], v)} disabled={isGlobalBusy} />
                                                </p>
                                            </div>
                                        </div>
                                    </ItemActionOverlay>
                                ))}
                            </div>
                            <div className="max-w-6xl mx-auto">
                                <h4 className="text-center text-xs font-bold text-gray-400 uppercase tracking-[0.4em] mb-12">
                                    <EditableElement text={f.secondaryFeaturesTitle || "Capabilities"} onChange={(v) => handleTextUpdate('features', ['secondaryFeaturesTitle'], v)} disabled={isGlobalBusy} />
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {f.secondaryFeatures?.map((item, i) => (
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            key={i} 
                                            onChat={() => handleItemChat('features', `Secondary Feature: ${item.title} - ${item.benefit}`)}
                                            onRefresh={() => handleItemRefresh('features', `Rewrite this secondary feature: ${item.title}`)}
                                            onRemove={() => handleRemoveItem('features', 'secondaryFeatures', i)}
                                            isLoading={isItemLoading('features', `Rewrite this secondary feature: ${item.title}`)}
                                        >
                                            <div className="p-10 border border-gray-200 rounded-[2rem] hover:border-gray-900 transition-all bg-gray-50 hover:bg-white hover:shadow-xl group">
                                                <CheckCircle2 size={32} className="text-gray-900 mb-6 group-hover:scale-110 transition-transform" />
                                                <h5 className="font-bold text-gray-900 mb-3 text-xl tracking-tight">
                                                    <EditableElement text={item.title} onChange={(v) => handleTextUpdate('features', ['secondaryFeatures', i, 'title'], v)} disabled={isGlobalBusy} />
                                                </h5>
                                                <p className="text-base text-gray-500 leading-relaxed font-medium">
                                                    <EditableElement text={item.benefit} onChange={(v) => handleTextUpdate('features', ['secondaryFeatures', i, 'benefit'], v)} disabled={isGlobalBusy} />
                                                </p>
                                            </div>
                                        </ItemActionOverlay>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'who_transformation':
                const w = data as NonNullable<LandingPageCopy['who_transformation']>;
                const transLabels = w.labels || { before: "BEFORE", after: "AFTER", bridge: "THE BRIDGE" };
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-20 px-8 bg-gray-50 border-b border-gray-200">
                            <div className="text-center max-w-5xl mx-auto mb-16">
                                {w.sectionSubtitle && (
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('who_transformation', `Subtitle: ${w.sectionSubtitle}`)}
                                        onRefresh={() => handleItemRefresh('who_transformation', `Rewrite this subtitle: ${w.sectionSubtitle}`)}
                                        isLoading={isItemLoading('who_transformation', `Rewrite this subtitle: ${w.sectionSubtitle}`)}
                                        className="inline-block"
                                    >
                                        <Eyebrow text={w.sectionSubtitle} onChange={(v) => handleTextUpdate('who_transformation', ['sectionSubtitle'], v)} disabled={isGlobalBusy} />
                                    </ItemActionOverlay>
                                )}
                                {w.sectionTitle && (
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('who_transformation', `Title: ${w.sectionTitle}`)}
                                        onRefresh={() => handleItemRefresh('who_transformation', `Rewrite this title: ${w.sectionTitle}`)}
                                        isLoading={isItemLoading('who_transformation', `Rewrite this title: ${w.sectionTitle}`)}
                                    >
                                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tighter">
                                            <EditableElement text={w.sectionTitle} onChange={(v) => handleTextUpdate('who_transformation', ['sectionTitle'], v)} disabled={isGlobalBusy} />
                                        </h2>
                                    </ItemActionOverlay>
                                )}
                                {w.sectionParagraph && (
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('who_transformation', `Paragraph: ${w.sectionParagraph}`)}
                                        onRefresh={() => handleItemRefresh('who_transformation', `Rewrite this paragraph: ${w.sectionParagraph}`)}
                                        isLoading={isItemLoading('who_transformation', `Rewrite this paragraph: ${w.sectionParagraph}`)}
                                        className="max-w-4xl mx-auto"
                                    >
                                        <p className="text-xl text-gray-600 leading-relaxed font-medium">
                                            <EditableElement text={w.sectionParagraph} onChange={(v) => handleTextUpdate('who_transformation', ['sectionParagraph'], v)} disabled={isGlobalBusy} />
                                        </p>
                                    </ItemActionOverlay>
                                )}
                            </div>
                            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
                                <div className="bg-white p-12 rounded-[2.5rem] border border-gray-200 shadow-sm flex flex-col justify-between h-full">
                                    <div>
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            onChat={() => handleItemChat('who_transformation', `Who Is It For: ${w.whoIsItFor}`)}
                                            onRefresh={() => handleItemRefresh('who_transformation', `Rewrite 'Who Is It For': ${w.whoIsItFor}`)}
                                            isLoading={isItemLoading('who_transformation', `Rewrite 'Who Is It For': ${w.whoIsItFor}`)}
                                        >
                                            <p className="text-3xl font-bold text-gray-900 mb-10 leading-tight tracking-tight">
                                                <EditableElement text={w.whoIsItFor} onChange={(v) => handleTextUpdate('who_transformation', ['whoIsItFor'], v)} disabled={isGlobalBusy} />
                                            </p>
                                        </ItemActionOverlay>
                                        {w.audienceSegments && w.audienceSegments.length > 0 && (
                                            <div className="space-y-5 mb-8">
                                                {w.audienceSegments.map((segment, i) => (
                                                    <ItemActionOverlay 
                                                        {...itemOverlayProps}
                                                        key={i} 
                                                        onChat={() => handleItemChat('who_transformation', `Segment: ${segment}`)} 
                                                        onRefresh={() => handleItemRefresh('who_transformation', `Rewrite segment: ${segment}`)}
                                                        onRemove={() => handleRemoveItem('who_transformation', 'audienceSegments', i)}
                                                        isLoading={isItemLoading('who_transformation', `Rewrite segment: ${segment}`)}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center shrink-0 shadow-md"><Check size={12} className="text-white" /></div>
                                                            <span className="font-bold text-gray-800 text-lg">
                                                                <EditableElement text={segment} onChange={(v) => handleTextUpdate('who_transformation', ['audienceSegments', i], v)} disabled={isGlobalBusy} />
                                                            </span>
                                                        </div>
                                                    </ItemActionOverlay>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col justify-between gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch h-full">
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            onChat={() => handleItemChat('who_transformation', `Before State: ${w.beforeState}`)}
                                            onRefresh={() => handleItemRefresh('who_transformation', `Rewrite before state: ${w.beforeState}`)}
                                            isLoading={isItemLoading('who_transformation', `Rewrite before state: ${w.beforeState}`)}
                                            className="h-full"
                                        >
                                            <div className="p-10 bg-gray-200 rounded-[2rem] border border-gray-300 opacity-70 flex flex-col h-full">
                                                <div className="text-[10px] font-bold uppercase tracking-widest mb-4 text-gray-500">
                                                    <EditableElement text={transLabels.before} onChange={(v) => handleTextUpdate('who_transformation', ['labels', 'before'], v)} disabled={isGlobalBusy} />
                                                </div>
                                                <p className="font-bold text-gray-800 text-xl leading-relaxed flex-1">
                                                    <EditableElement text={w.beforeState} onChange={(v) => handleTextUpdate('who_transformation', ['beforeState'], v)} disabled={isGlobalBusy} />
                                                </p>
                                            </div>
                                        </ItemActionOverlay>
                                        
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            onChat={() => handleItemChat('who_transformation', `After State: ${w.afterState}`)}
                                            onRefresh={() => handleItemRefresh('who_transformation', `Rewrite after state: ${w.afterState}`)}
                                            isLoading={isItemLoading('who_transformation', `Rewrite after state: ${w.afterState}`)}
                                            className="h-full"
                                        >
                                            <div className="relative p-10 bg-gray-900 text-white rounded-[2rem] shadow-2xl flex flex-col h-full">
                                                <div className="hidden md:flex absolute top-1/2 -left-6 -translate-y-1/2 z-10 bg-white rounded-full p-3 border border-gray-200 shadow-xl"><ArrowRightIcon className="text-gray-900" size={24} /></div>
                                                <div className="text-[10px] font-bold uppercase tracking-widest mb-4 text-gray-400">
                                                    <EditableElement text={transLabels.after} onChange={(v) => handleTextUpdate('who_transformation', ['labels', 'after'], v)} disabled={isGlobalBusy} />
                                                </div>
                                                <p className="font-black text-2xl leading-relaxed flex-1 tracking-tight">
                                                    <EditableElement text={w.afterState} onChange={(v) => handleTextUpdate('who_transformation', ['afterState'], v)} disabled={isGlobalBusy} />
                                                </p>
                                            </div>
                                        </ItemActionOverlay>
                                    </div>
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('who_transformation', `Bridge: ${w.bridge}`)}
                                        onRefresh={() => handleItemRefresh('who_transformation', `Rewrite bridge: ${w.bridge}`)}
                                        isLoading={isItemLoading('who_transformation', `Rewrite bridge: ${w.bridge}`)}
                                    >
                                        <p className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] bg-white py-4 px-8 rounded-full border border-gray-200 w-full shadow-sm flex items-center justify-center gap-2">
                                            <span className="text-gray-900">
                                                <EditableElement text={transLabels.bridge} onChange={(v) => handleTextUpdate('who_transformation', ['labels', 'bridge'], v)} disabled={isGlobalBusy} />:
                                            </span> 
                                            <EditableElement text={w.bridge} onChange={(v) => handleTextUpdate('who_transformation', ['bridge'], v)} disabled={isGlobalBusy} />
                                        </p>
                                    </ItemActionOverlay>
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'comparison_vs':
                const comp = data as NonNullable<LandingPageCopy['comparison_vs']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-20 px-8 bg-white border-b border-gray-200">
                            <div className="text-center max-w-5xl mx-auto mb-16">
                                {comp.sectionSubtitle && <Eyebrow text={comp.sectionSubtitle} onChange={(v) => handleTextUpdate('comparison_vs', ['sectionSubtitle'], v)} disabled={isGlobalBusy} />}
                                {comp.sectionTitle && <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tighter">
                                    <EditableElement text={comp.sectionTitle} onChange={(v) => handleTextUpdate('comparison_vs', ['sectionTitle'], v)} disabled={isGlobalBusy} />
                                </h2>}
                            </div>
                            <div className="max-w-5xl mx-auto">
                                <div className="bg-white rounded-[2.5rem] border-2 border-gray-100 overflow-hidden shadow-sm">
                                    <div className="grid grid-cols-3 bg-gray-50 p-8 border-b border-gray-200 text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
                                        <div className="pl-4">{tLabels.feature}</div>
                                        <div className="text-center opacity-50">{tLabels.others}</div>
                                        <div className="text-center text-gray-900">{tLabels.us}</div>
                                    </div>
                                    <div className="divide-y divide-gray-100">
                                        {comp.items?.map((item, i) => (
                                            <div key={i} className="grid grid-cols-3 p-8 items-center hover:bg-gray-50 transition-colors">
                                                <div className="pl-4 font-black text-gray-900 text-lg pr-4">
                                                    <EditableElement text={item.feature} onChange={(v) => handleTextUpdate('comparison_vs', ['items', i, 'feature'], v)} disabled={isGlobalBusy} />
                                                </div>
                                                <div className="text-center text-gray-400 text-sm px-2 flex items-center justify-center gap-2">
                                                    <XCircle size={18} className="shrink-0" /> 
                                                    <EditableElement text={item.them} onChange={(v) => handleTextUpdate('comparison_vs', ['items', i, 'them'], v)} disabled={isGlobalBusy} />
                                                </div>
                                                <div className="text-center text-gray-900 font-black text-lg px-2 flex items-center justify-center gap-2">
                                                    <CheckCircle2 size={24} className="shrink-0 fill-gray-900 text-white" /> 
                                                    <EditableElement text={item.us} onChange={(v) => handleTextUpdate('comparison_vs', ['items', i, 'us'], v)} disabled={isGlobalBusy} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'process':
                const proc = data as NonNullable<LandingPageCopy['process']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-20 px-8 bg-white border-b border-gray-200">
                            <div className="text-center max-w-5xl mx-auto mb-16">
                                {proc.sectionSubtitle && <Eyebrow text={proc.sectionSubtitle} onChange={(v) => handleTextUpdate('process', ['sectionSubtitle'], v)} disabled={isGlobalBusy} />}
                                {proc.sectionTitle && <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tighter">
                                    <EditableElement text={proc.sectionTitle} onChange={(v) => handleTextUpdate('process', ['sectionTitle'], v)} disabled={isGlobalBusy} />
                                </h2>}
                            </div>
                            <div className="max-w-4xl mx-auto">
                                <ItemActionOverlay 
                                    {...itemOverlayProps}
                                    onChat={() => handleItemChat('process', `Headline: ${proc.headline}`)}
                                    onRefresh={() => handleItemRefresh('process', `Rewrite this headline: ${proc.headline}`)}
                                    isLoading={isItemLoading('process', `Rewrite this headline: ${proc.headline}`)}
                                >
                                    <h2 className="text-3xl font-black text-center mb-20 tracking-tight">
                                        <EditableElement text={proc.headline} onChange={(v) => handleTextUpdate('process', ['headline'], v)} disabled={isGlobalBusy} />
                                    </h2>
                                </ItemActionOverlay>
                                <div className="space-y-16 relative before:absolute before:left-6 before:top-0 before:bottom-0 before:w-0.5 before:bg-gray-200">
                                    {proc.steps?.map((step, i) => (
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            key={i} 
                                            onChat={() => handleItemChat('process', `Step: ${step.title} - ${step.description}`)}
                                            onRefresh={() => handleItemRefresh('process', `Rewrite this step: ${step.title}`)}
                                            onRemove={() => handleRemoveItem('process', 'steps', i)}
                                            isLoading={isItemLoading('process', `Rewrite this step: ${step.title}`)}
                                        >
                                            <div className="flex gap-12 relative bg-white pl-4">
                                                <div className="w-12 h-12 rounded-2xl bg-gray-900 text-white flex items-center justify-center font-bold text-lg shrink-0 z-10 ring-[12px] ring-white shadow-xl">{i + 1}</div>
                                                <div className="pt-1 w-full">
                                                    <h4 className="font-black text-2xl mb-3 text-gray-900 tracking-tight">
                                                        <EditableElement text={step.title} onChange={(v) => handleTextUpdate('process', ['steps', i, 'title'], v)} disabled={isGlobalBusy} />
                                                    </h4>
                                                    <p className="text-gray-600 leading-relaxed text-lg font-medium">
                                                        <EditableElement text={step.description} onChange={(v) => handleTextUpdate('process', ['steps', i, 'description'], v)} disabled={isGlobalBusy} />
                                                    </p>
                                                </div>
                                            </div>
                                        </ItemActionOverlay>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'about_author':
                const about = data as NonNullable<LandingPageCopy['about_author']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-24 px-8 bg-gray-50 border-b border-gray-200">
                            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                                <div className="relative">
                                    <div className="absolute -inset-6 bg-white/50 rounded-[3rem] blur-xl"></div>
                                    <PlaceholderImage label={about.imagePrompt || "Author Portrait"} className="h-[600px] relative z-10 rounded-[3rem] shadow-2xl border border-gray-200 grayscale contrast-125" />
                                    <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-xl z-20 border border-gray-100 max-w-[280px]">
                                        <div className="flex flex-col gap-6">
                                            {about.stats?.map((s, i) => (
                                                <div key={i}>
                                                    <p className="text-3xl font-black text-gray-900 leading-none">
                                                        <EditableElement text={s.value} onChange={(v) => handleTextUpdate('about_author', ['stats', i, 'value'], v)} disabled={isGlobalBusy} />
                                                    </p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                                                        <EditableElement text={s.label} onChange={(v) => handleTextUpdate('about_author', ['stats', i, 'label'], v)} disabled={isGlobalBusy} />
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-10">
                                    <div className="space-y-4">
                                        <Eyebrow text={about.sectionTitle} onChange={(v) => handleTextUpdate('about_author', ['sectionTitle'], v)} disabled={isGlobalBusy} className="mb-2" />
                                        <h2 className="text-5xl font-black text-gray-900 tracking-tighter">
                                            <EditableElement text={about.authorName} onChange={(v) => handleTextUpdate('about_author', ['authorName'], v)} disabled={isGlobalBusy} />
                                        </h2>
                                        <p className="text-xl font-bold text-indigo-600 uppercase tracking-widest">
                                            <EditableElement text={about.authorTitle} onChange={(v) => handleTextUpdate('about_author', ['authorTitle'], v)} disabled={isGlobalBusy} />
                                        </p>
                                    </div>
                                    <div className="space-y-6 text-xl text-gray-600 leading-relaxed font-medium">
                                        <EditableElement tagName="p" text={about.authorBio} onChange={(v) => handleTextUpdate('about_author', ['authorBio'], v)} disabled={isGlobalBusy} className="italic border-l-4 border-gray-200 pl-8" />
                                    </div>
                                    <div className="pt-6">
                                        <p className="text-3xl font-serif text-gray-900 italic">
                                            <EditableElement text={about.signatureText} onChange={(v) => handleTextUpdate('about_author', ['signatureText'], v)} disabled={isGlobalBusy} />
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'offer':
                const o = data as NonNullable<LandingPageCopy['offer']>;
                const hasPricing = o.pricingTiers && o.pricingTiers.length > 0;
                const oGridCols = o.pricingTiers?.length === 2 ? 'md:grid-cols-2' : o.pricingTiers?.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-1 max-w-md mx-auto';
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-20 px-8 bg-gray-50 border-y border-gray-200">
                            <div className="text-center max-w-5xl mx-auto mb-16">
                                {o.sectionSubtitle && (
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('offer', `Subtitle: ${o.sectionSubtitle}`)}
                                        onRefresh={() => handleItemRefresh('offer', `Rewrite this subtitle: ${o.sectionSubtitle}`)}
                                        isLoading={isItemLoading('offer', `Rewrite this subtitle: ${o.sectionSubtitle}`)}
                                        className="inline-block"
                                    >
                                        <Eyebrow text={o.sectionSubtitle} onChange={(v) => handleTextUpdate('offer', ['sectionSubtitle'], v)} disabled={isGlobalBusy} />
                                    </ItemActionOverlay>
                                )}
                                {o.sectionTitle && (
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('offer', `Title: ${o.sectionTitle}`)}
                                        onRefresh={() => handleItemRefresh('offer', `Rewrite this title: ${o.sectionTitle}`)}
                                        isLoading={isItemLoading('offer', `Rewrite this title: ${o.sectionTitle}`)}
                                    >
                                        <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tighter">
                                            <EditableElement text={o.sectionTitle} onChange={(v) => handleTextUpdate('offer', ['sectionTitle'], v)} disabled={isGlobalBusy} />
                                        </h2>
                                    </ItemActionOverlay>
                                )}
                            </div>
                            <div className="max-w-6xl mx-auto text-center">
                                {o.stack && o.stack.length > 0 && (
                                    <div className="max-w-lg mx-auto bg-white border border-gray-300 rounded-[2.5rem] p-10 mb-16 shadow-[0_20px_60px_rgba(0,0,0,0.05)] relative transform rotate-1 hover:rotate-0 transition-transform">
                                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.4em] px-6 py-2 rounded-full shadow-xl">{tLabels.included}</div>
                                        <h3 className="text-2xl font-black text-gray-900 mb-8 border-b border-gray-100 pb-6 tracking-tight">The Value Stack</h3>
                                        <div className="space-y-5">
                                            {o.stack.map((item, i) => (
                                                <ItemActionOverlay
                                                    {...itemOverlayProps}
                                                    key={i}
                                                    onChat={() => handleItemChat('offer', `Stack Item: ${item.item} - ${item.value}`)}
                                                    onRefresh={() => handleItemRefresh('offer', `Rewrite stack item: ${item.item}`)}
                                                    onRemove={() => handleRemoveItem('offer', 'stack', i)}
                                                    isLoading={isItemLoading('offer', `Rewrite stack item: ${item.item}`)}
                                                >
                                                    <div className="flex justify-between text-base items-center border-b border-dashed border-gray-200 pb-4 last:border-0">
                                                        <span className="text-gray-600 font-bold text-left">
                                                            <EditableElement text={item.item} onChange={(v) => handleTextUpdate('offer', ['stack', i, 'item'], v)} disabled={isGlobalBusy} />
                                                        </span>
                                                        <span className="font-black text-gray-900 whitespace-nowrap ml-6">
                                                            <EditableElement text={item.value} onChange={(v) => handleTextUpdate('offer', ['stack', i, 'value'], v)} disabled={isGlobalBusy} />
                                                        </span>
                                                    </div>
                                                </ItemActionOverlay>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <ItemActionOverlay 
                                    {...itemOverlayProps}
                                    onChat={() => handleItemChat('offer', `What You Get: ${o.whatYouGet}`)}
                                    onRefresh={() => handleItemRefresh('offer', `Rewrite this: ${o.whatYouGet}`)}
                                    isLoading={isItemLoading('offer', `Rewrite this: ${o.whatYouGet}`)}
                                    className="max-w-4xl mx-auto"
                                >
                                    <p className="text-2xl text-gray-700 mb-16 font-bold leading-relaxed tracking-tight">
                                        <EditableElement text={o.whatYouGet} onChange={(v) => handleTextUpdate('offer', ['whatYouGet'], v)} disabled={isGlobalBusy} />
                                    </p>
                                </ItemActionOverlay>
                                <div className={`grid grid-cols-1 ${oGridCols} gap-8 mb-16 items-end`}>
                                    {o.pricingTiers?.map((tier, i) => (
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            key={i} 
                                            onChat={() => handleItemChat('offer', `Pricing Tier: ${tier.name} - ${tier.price}`)}
                                            onRefresh={() => handleItemRefresh('offer', `Rewrite this pricing tier: ${tier.name}`)}
                                            onRemove={() => handleRemoveItem('offer', 'pricingTiers', i)}
                                            isLoading={isItemLoading('offer', `Rewrite this pricing tier: ${tier.name}`)}
                                        >
                                            <div className={`p-10 bg-white border rounded-[2.5rem] ${i === 1 && o.pricingTiers?.length === 3 ? 'border-gray-900 ring-[12px] ring-gray-900/5 relative z-10 shadow-2xl scale-105' : 'border-gray-200 shadow-sm'}`}>
                                                {i === 1 && o.pricingTiers?.length === 3 && <div className="absolute -top-4 inset-x-0 mx-auto w-fit px-5 py-1.5 bg-gray-900 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full shadow-xl">{tLabels.bestValue}</div>}
                                                <h3 className="font-black text-2xl mb-3 text-gray-900 tracking-tight">
                                                    <EditableElement text={tier.name} onChange={(v) => handleTextUpdate('offer', ['pricingTiers', i, 'name'], v)} disabled={isGlobalBusy} />
                                                </h3>
                                                <div className="text-5xl font-black mb-10 text-gray-900 tracking-tighter">
                                                    <EditableElement text={tier.price} onChange={(v) => handleTextUpdate('offer', ['pricingTiers', i, 'price'], v)} disabled={isGlobalBusy} />
                                                </div>
                                                <ul className="text-left space-y-5 text-base text-gray-600 mb-10">
                                                    {tier.deliverables?.map((d, j) => (
                                                        <li key={j} className="flex gap-4 items-start font-medium leading-snug">
                                                            <Check size={20} className="shrink-0 mt-0.5 text-gray-900" />
                                                            <EditableElement text={d} onChange={(v) => handleTextUpdate('offer', ['pricingTiers', i, 'deliverables', j], v)} disabled={isGlobalBusy} />
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button className="w-full py-5 bg-gray-100 font-black text-xs rounded-2xl hover:bg-gray-900 hover:text-white uppercase tracking-[0.2em] border border-gray-200 transition-all">{tLabels.choose} {tier.name}</button>
                                            </div>
                                        </ItemActionOverlay>
                                    ))}
                                </div>
                                {!hasPricing && (
                                    <div className="px-14 py-6 bg-gray-900 text-white font-bold rounded-2xl shadow-xl w-fit mx-auto uppercase tracking-widest text-lg hover:bg-gray-800 transition-all cursor-pointer active:scale-95">
                                        <EditableElement text={o.finalCta || "Get Access Now"} onChange={(v) => handleTextUpdate('offer', ['finalCta'], v)} disabled={isGlobalBusy} />
                                    </div>
                                )}
                                <div className="mt-20 p-10 bg-gray-100 rounded-[2.5rem] border border-gray-200 max-w-3xl mx-auto flex flex-col items-center">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6 shadow-md"><ShieldCheck size={40} className="text-gray-900" /></div>
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('offer', `Guarantee Title: ${o.guaranteeTitle}`)}
                                        onRefresh={() => handleItemRefresh('offer', `Rewrite this guarantee title: ${o.guaranteeTitle}`)}
                                        isLoading={isItemLoading('offer', `Rewrite this guarantee title: ${o.guaranteeTitle}`)}
                                    >
                                        <h4 className="font-black text-gray-900 uppercase tracking-[0.3em] text-sm mb-3">
                                            <EditableElement text={o.guaranteeTitle} onChange={(v) => handleTextUpdate('offer', ['guaranteeTitle'], v)} disabled={isGlobalBusy} />
                                        </h4>
                                    </ItemActionOverlay>
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('offer', `Guarantee Text: ${o.guaranteeText}`)}
                                        onRefresh={() => handleItemRefresh('offer', `Rewrite this guarantee text: ${o.guaranteeText}`)}
                                        isLoading={isItemLoading('offer', `Rewrite this guarantee text: ${o.guaranteeText}`)}
                                    >
                                        <p className="text-base text-gray-500 leading-relaxed font-medium text-center">
                                            <EditableElement text={o.guaranteeText} onChange={(v) => handleTextUpdate('offer', ['guaranteeText'], v)} disabled={isGlobalBusy} />
                                        </p>
                                    </ItemActionOverlay>
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'social_proof':
                const sp = data as NonNullable<LandingPageCopy['social_proof']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-20 px-8 bg-white border-b border-gray-200">
                            <div className="text-center max-w-5xl mx-auto mb-20">
                                {sp.sectionSubtitle && <Eyebrow text={sp.sectionSubtitle} onChange={(v) => handleTextUpdate('social_proof', ['sectionSubtitle'], v)} disabled={isGlobalBusy} />}
                                {sp.sectionTitle && <h2 className="text-5xl md:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tighter">
                                    <EditableElement text={sp.sectionTitle} onChange={(v) => handleTextUpdate('social_proof', ['sectionTitle'], v)} disabled={isGlobalBusy} />
                                </h2>}
                            </div>
                            <div className="max-w-6xl mx-auto">
                                {sp.summaryMetric && <div className="text-center mb-16 font-black text-3xl md:text-5xl text-gray-900 tracking-tighter leading-none">
                                    <EditableElement text={sp.summaryMetric} onChange={(v) => handleTextUpdate('social_proof', ['summaryMetric'], v)} disabled={isGlobalBusy} />
                                </div>}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                                    {sp.testimonials?.map((test, i) => (
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            key={i} 
                                            onChat={() => handleItemChat('social_proof', `Testimonial: ${test.author} - ${test.quote}`)}
                                            onRefresh={() => handleItemRefresh('social_proof', `Rewrite this testimonial: ${test.quote}`)}
                                            onRemove={() => handleRemoveItem('social_proof', 'testimonials', i)}
                                            isLoading={isItemLoading('social_proof', `Rewrite this testimonial: ${test.quote}`)}
                                        >
                                            <div className="p-10 bg-gray-50 rounded-[2.5rem] border border-gray-200 relative flex flex-col hover:bg-white hover:shadow-2xl transition-all duration-500 group">
                                                <Quote size={40} className="text-gray-200 absolute top-8 left-8 group-hover:text-indigo-50 transition-colors" />
                                                <div className="flex gap-1 mb-8 text-gray-900 justify-center pt-4"><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/><Star size={18} fill="currentColor"/></div>
                                                <p className="text-xl font-bold text-gray-800 mb-10 italic text-center relative z-10 flex-1 leading-relaxed tracking-tight">
                                                    "<EditableElement text={test.quote} onChange={(v) => handleTextUpdate('social_proof', ['testimonials', i, 'quote'], v)} disabled={isGlobalBusy} />"
                                                </p>
                                                <div className="flex flex-col items-center gap-3 border-t border-gray-200 pt-8">
                                                    <div className="w-14 h-14 bg-gray-300 rounded-full flex items-center justify-center font-bold text-gray-500 text-lg">{test.author.charAt(0)}</div>
                                                    <div className="text-center">
                                                        <div className="font-bold text-gray-900 uppercase tracking-wide text-sm">
                                                            <EditableElement text={test.author} onChange={(v) => handleTextUpdate('social_proof', ['testimonials', i, 'author'], v)} disabled={isGlobalBusy} />
                                                        </div>
                                                        <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">
                                                            <EditableElement text={test.role} onChange={(v) => handleTextUpdate('social_proof', ['testimonials', i, 'role'], v)} disabled={isGlobalBusy} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </ItemActionOverlay>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'faq':
                const fq = data as NonNullable<LandingPageCopy['faq']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-20 px-8 bg-gray-50 border-b border-gray-200">
                            <div className="max-w-4xl mx-auto">
                                <div className="text-center mb-16">
                                    {fq.sectionSubtitle && <Eyebrow text={fq.sectionSubtitle} onChange={(v) => handleTextUpdate('faq', ['sectionSubtitle'], v)} disabled={isGlobalBusy} />}
                                    {fq.sectionTitle && <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                                        <EditableElement text={fq.sectionTitle} onChange={(v) => handleTextUpdate('faq', ['sectionTitle'], v)} disabled={isGlobalBusy} />
                                    </h2>}
                                </div>
                                <div className="space-y-6">
                                    {fq.items?.map((item, i) => (
                                        <ItemActionOverlay
                                            {...itemOverlayProps}
                                            key={i}
                                            onChat={() => handleItemChat('faq', `FAQ: ${item.q} - ${item.a}`)}
                                            onRefresh={() => handleItemRefresh('faq', `Rewrite this FAQ: ${item.q}`)}
                                            onRemove={() => handleRemoveItem('faq', 'items', i)}
                                            isLoading={isItemLoading('faq', `Rewrite this FAQ: ${item.q}`)}
                                        >
                                            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                                                <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-start gap-3">
                                                    <HelpCircle size={24} className="text-indigo-600 shrink-0 mt-0.5" />
                                                    <EditableElement text={item.q} onChange={(v) => handleTextUpdate('faq', ['items', i, 'q'], v)} disabled={isGlobalBusy} />
                                                </h4>
                                                <p className="text-lg text-gray-600 leading-relaxed font-medium pl-9">
                                                    <EditableElement text={item.a} onChange={(v) => handleTextUpdate('faq', ['items', i, 'a'], v)} disabled={isGlobalBusy} />
                                                </p>
                                            </div>
                                        </ItemActionOverlay>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'footer_contact':
                const fc = data as NonNullable<LandingPageCopy['footer_contact']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <footer className="bg-gray-900 text-white pt-20 pb-10 px-8">
                            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 mb-20">
                                <div>
                                    <ItemActionOverlay
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('footer_contact', `Title: ${fc.sectionTitle}`)}
                                        onRefresh={() => handleItemRefresh('footer_contact', `Rewrite title: ${fc.sectionTitle}`)}
                                        isLoading={isItemLoading('footer_contact', `Rewrite title: ${fc.sectionTitle}`)}
                                    >
                                        <h3 className="text-3xl font-black mb-8 tracking-tight">
                                            <EditableElement text={fc.sectionTitle} onChange={(v) => handleTextUpdate('footer_contact', ['sectionTitle'], v)} disabled={isGlobalBusy} />
                                        </h3>
                                    </ItemActionOverlay>
                                    <ItemActionOverlay
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('footer_contact', `Paragraph: ${fc.sectionParagraph}`)}
                                        onRefresh={() => handleItemRefresh('footer_contact', `Rewrite paragraph: ${fc.sectionParagraph}`)}
                                        isLoading={isItemLoading('footer_contact', `Rewrite paragraph: ${fc.sectionParagraph}`)}
                                    >
                                        <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-md">
                                            <EditableElement text={fc.sectionParagraph} onChange={(v) => handleTextUpdate('footer_contact', ['sectionParagraph'], v)} disabled={isGlobalBusy} />
                                        </p>
                                    </ItemActionOverlay>
                                    <div className="space-y-4">
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            onChat={() => handleItemChat('footer_contact', `Email: ${fc.contactInfo?.email}`)}
                                            onRefresh={() => handleItemRefresh('footer_contact', `Rewrite email: ${fc.contactInfo?.email}`)}
                                            isLoading={isItemLoading('footer_contact', `Rewrite email: ${fc.contactInfo?.email}`)}
                                        >
                                            <div className="flex items-center gap-4 text-gray-300 font-medium">
                                                <Mail size={20} />
                                                <EditableElement text={fc.contactInfo?.email || "email@example.com"} onChange={(v) => handleTextUpdate('footer_contact', ['contactInfo', 'email'], v)} disabled={isGlobalBusy} />
                                            </div>
                                        </ItemActionOverlay>
                                        {fc.contactInfo?.phone && (
                                            <ItemActionOverlay 
                                                {...itemOverlayProps}
                                                onChat={() => handleItemChat('footer_contact', `Phone: ${fc.contactInfo?.phone}`)}
                                                onRefresh={() => handleItemRefresh('footer_contact', `Rewrite phone: ${fc.contactInfo?.phone}`)}
                                                isLoading={isItemLoading('footer_contact', `Rewrite phone: ${fc.contactInfo?.phone}`)}
                                            >
                                                <div className="flex items-center gap-4 text-gray-300 font-medium">
                                                    <Phone size={20} />
                                                    <EditableElement text={fc.contactInfo.phone} onChange={(v) => handleTextUpdate('footer_contact', ['contactInfo', 'phone'], v)} disabled={isGlobalBusy} />
                                                </div>
                                            </ItemActionOverlay>
                                        )}
                                        {fc.contactInfo?.address && (
                                            <ItemActionOverlay 
                                                {...itemOverlayProps}
                                                onChat={() => handleItemChat('footer_contact', `Address: ${fc.contactInfo?.address}`)}
                                                onRefresh={() => handleItemRefresh('footer_contact', `Rewrite address: ${fc.contactInfo?.address}`)}
                                                isLoading={isItemLoading('footer_contact', `Rewrite address: ${fc.contactInfo?.address}`)}
                                            >
                                                <div className="flex items-center gap-4 text-gray-300 font-medium">
                                                    <MapPin size={20} />
                                                    <EditableElement text={fc.contactInfo.address} onChange={(v) => handleTextUpdate('footer_contact', ['contactInfo', 'address'], v)} disabled={isGlobalBusy} />
                                                </div>
                                            </ItemActionOverlay>
                                        )}
                                    </div>
                                    <div className="flex gap-4 mt-10">
                                        {fc.socialLinks?.map((link, i) => (
                                            <ItemActionOverlay {...itemOverlayProps} key={i} onRemove={() => handleRemoveItem('footer_contact', 'socialLinks', i)}>
                                                <a href={link.url} className="p-3 bg-gray-800 rounded-full hover:bg-white hover:text-gray-900 transition-all block"><ArrowUpRight size={20} /></a>
                                            </ItemActionOverlay>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-gray-800 p-10 rounded-[2.5rem] border border-gray-700">
                                    <ItemActionOverlay 
                                        {...itemOverlayProps}
                                        onChat={() => handleItemChat('footer_contact', `Form Title: ${fc.formTitle}`)}
                                        onRefresh={() => handleItemRefresh('footer_contact', `Rewrite form title: ${fc.formTitle}`)}
                                        isLoading={isItemLoading('footer_contact', `Rewrite form title: ${fc.formTitle}`)}
                                    >
                                        <h4 className="text-xl font-bold mb-6">
                                            <EditableElement text={fc.formTitle} onChange={(v) => handleTextUpdate('footer_contact', ['formTitle'], v)} disabled={isGlobalBusy} />
                                        </h4>
                                    </ItemActionOverlay>
                                    <div className="space-y-4">
                                        <input type="text" placeholder={tLabels.namePlaceholder} className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-white transition-colors" />
                                        <input type="email" placeholder={tLabels.emailPlaceholder} className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-white transition-colors" />
                                        <textarea placeholder={tLabels.message} rows={4} className="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 outline-none focus:border-white transition-colors"></textarea>
                                        <ItemActionOverlay 
                                            {...itemOverlayProps}
                                            onChat={() => handleItemChat('footer_contact', `Button: ${fc.formButtonText}`)}
                                            onRefresh={() => handleItemRefresh('footer_contact', `Rewrite button: ${fc.formButtonText}`)}
                                            isLoading={isItemLoading('footer_contact', `Rewrite button: ${fc.formButtonText}`)}
                                        >
                                            <button className="w-full py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-200 transition-colors uppercase tracking-widest text-sm">
                                                <EditableElement text={fc.formButtonText} onChange={(v) => handleTextUpdate('footer_contact', ['formButtonText'], v)} disabled={isGlobalBusy} />
                                            </button>
                                        </ItemActionOverlay>
                                    </div>
                                </div>
                            </div>
                            <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">
                                <ItemActionOverlay 
                                    {...itemOverlayProps}
                                    onChat={() => handleItemChat('footer_contact', `Copyright: ${fc.copyrightText}`)}
                                    onRefresh={() => handleItemRefresh('footer_contact', `Rewrite copyright: ${fc.copyrightText}`)}
                                    isLoading={isItemLoading('footer_contact', `Rewrite copyright: ${fc.copyrightText}`)}
                                >
                                    &copy; {new Date().getFullYear()} <EditableElement text={fc.copyrightText} onChange={(v) => handleTextUpdate('footer_contact', ['copyrightText'], v)} disabled={isGlobalBusy} />
                                </ItemActionOverlay>
                            </div>
                        </footer>
                    </SectionWrapper>
                );

            case 'full_width_cta':
                const fw = data as NonNullable<LandingPageCopy['full_width_cta']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-20 px-8 bg-gray-900 text-white text-center">
                            <div className="max-w-5xl mx-auto">
                                <ItemActionOverlay 
                                    {...itemOverlayProps}
                                    onChat={() => handleItemChat('full_width_cta', `Headline: ${fw.headline}`)}
                                    onRefresh={() => handleItemRefresh('full_width_cta', `Rewrite this headline: ${fw.headline}`)}
                                    isLoading={isItemLoading('full_width_cta', `Rewrite this headline: ${fw.headline}`)}
                                >
                                    <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[0.95] tracking-tighter">
                                        <EditableElement text={fw.headline} onChange={(v) => handleTextUpdate('full_width_cta', ['headline'], v)} disabled={isGlobalBusy} />
                                    </h2>
                                </ItemActionOverlay>
                                <ItemActionOverlay 
                                    {...itemOverlayProps}
                                    onChat={() => handleItemChat('full_width_cta', `Description: ${fw.description}`)}
                                    onRefresh={() => handleItemRefresh('full_width_cta', `Rewrite this description: ${fw.description}`)}
                                    isLoading={isItemLoading('full_width_cta', `Rewrite this description: ${fw.description}`)}
                                    className="max-w-3xl mx-auto"
                                >
                                    <p className="text-xl text-gray-400 mb-12 leading-relaxed font-medium">
                                        <EditableElement text={fw.description} onChange={(v) => handleTextUpdate('full_width_cta', ['description'], v)} disabled={isGlobalBusy} />
                                    </p>
                                </ItemActionOverlay>
                                <ItemActionOverlay 
                                    {...itemOverlayProps}
                                    onChat={() => handleItemChat('full_width_cta', `CTA Text: ${fw.ctaText}`)}
                                    onRefresh={() => handleItemRefresh('full_width_cta', `Rewrite this CTA: ${fw.ctaText}`)}
                                    isLoading={isItemLoading('full_width_cta', `Rewrite this CTA: ${fw.ctaText}`)}
                                    className="inline-block"
                                >
                                    <div className="px-14 py-6 bg-white text-gray-900 font-bold rounded-[1.5rem] shadow-[0_20px_50px_rgba(255,255,255,0.1)] w-fit mx-auto uppercase tracking-widest text-lg hover:bg-gray-100 transition-all cursor-pointer active:scale-95 scale-110">
                                        <EditableElement text={fw.ctaText} onChange={(v) => handleTextUpdate('full_width_cta', ['ctaText'], v)} disabled={isGlobalBusy} />
                                    </div>
                                </ItemActionOverlay>
                            </div>
                        </section>
                    </SectionWrapper>
                );

            case 'lead_form':
                const lf = data as NonNullable<LandingPageCopy['lead_form']>;
                return (
                    <SectionWrapper {...wrapperProps}>
                        <section className="py-16 px-8 bg-white border-b border-gray-200">
                            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
                                <div>
                                    {lf.sectionSubtitle && <Eyebrow text={lf.sectionSubtitle} onChange={(v) => handleTextUpdate('lead_form', ['sectionSubtitle'], v)} disabled={isGlobalBusy} />}
                                    <h2 className="text-5xl md:text-6xl font-black text-gray-900 mb-8 leading-[0.95] tracking-tighter">
                                        <EditableElement text={lf.headline} onChange={(v) => handleTextUpdate('lead_form', ['headline'], v)} disabled={isGlobalBusy} />
                                    </h2>
                                    <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
                                        <EditableElement text={lf.subheadline} onChange={(v) => handleTextUpdate('lead_form', ['subheadline'], v)} disabled={isGlobalBusy} />
                                    </p>
                                    <ul className="space-y-5 mb-8">
                                        {lf.deliverables?.map((del, i) => (
                                            <li key={i} className="flex gap-4 text-gray-800 font-bold text-lg">
                                                <CheckCircle2 size={24} className="text-slate-900 shrink-0" />
                                                <EditableElement text={del} onChange={(v) => handleTextUpdate('lead_form', ['deliverables', i], v)} disabled={isGlobalBusy} />
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-gray-200">
                                    <h3 className="text-2xl font-black text-gray-900 mb-8 text-center tracking-tight">
                                        <EditableElement text={lf.formTitle} onChange={(v) => handleTextUpdate('lead_form', ['formTitle'], v)} disabled={isGlobalBusy} />
                                    </h3>
                                    <div className="space-y-5">
                                        <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{tLabels.name}</label><div className="h-14 bg-gray-50 border border-gray-200 rounded-xl w-full shadow-inner"></div></div>
                                        <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{tLabels.email}</label><div className="h-14 bg-gray-50 border border-gray-200 rounded-xl w-full shadow-inner"></div></div>
                                        <div><label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{tLabels.phone}</label><div className="h-14 bg-gray-50 border border-gray-200 rounded-xl w-full shadow-inner"></div></div>
                                        <button className="w-full h-16 bg-slate-900 text-white font-bold rounded-xl mt-6 hover:bg-black transition-all shadow-xl text-lg tracking-wide">
                                            <EditableElement text={lf.buttonText} onChange={(v) => handleTextUpdate('lead_form', ['buttonText'], v)} disabled={isGlobalBusy} />
                                        </button>
                                        <p className="text-[10px] text-gray-400 text-center mt-5 font-bold uppercase tracking-widest">Secured & Encrypted • 100% Privacy</p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </SectionWrapper>
                );
        }
    };

    return (
        <div className="space-y-0 pb-20 bg-gray-100">
            {sections.map(sectionId => (
                <div key={sectionId}>
                    {renderSection(sectionId)}
                </div>
            ))}
        </div>
    );
};
