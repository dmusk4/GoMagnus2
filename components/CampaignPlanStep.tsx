
import React, { useRef, useEffect, useState } from 'react';
import { 
    Target, Sparkles, Loader2, RefreshCw, Zap, TrendingUp, CheckCircle2, 
    AlertCircle, List, Layout, Clock, DollarSign, ArrowRight, Lightbulb, Globe, Compass, Share2, Trash2,
    Users, Search, X, Linkedin, Mail, ExternalLink, ShieldCheck, ChevronDown, Check,
    Briefcase, MapPin, FileDown, Plus, Phone, Calendar, Flag, MousePointer2, UserPlus, CreditCard, Heart, Repeat, Rocket, Handshake, Terminal, Bot, Copy, CheckCircle, HelpCircle
} from 'lucide-react';
import { Product, CampaignPlan, Language, Lead } from '../types';
import { getTranslation } from '../translations';
import { searchRealLeads, VALID_INDUSTRIES } from '../services/leadService';
import { COUNTRIES, SearchableCountrySelect } from './Common';

interface CampaignPlanStepProps {
  product: Product;
  language: Language;
  loading: boolean;
  loadingGrowthHacks?: boolean;
  onGenerate: (focus?: string) => void | Promise<void>;
  onGenerateMoreGrowthHacks?: (focus?: string) => void | Promise<void>;
  onClear: () => void;
  showValidation?: boolean;
  validationTrigger?: number;
  onUpdateFocus?: (focus: string) => void;
  onUpdateProduct?: (updates: Partial<Product>) => void;
}

const MultiSelectDropdown = ({ 
    label, 
    icon: Icon, 
    options, 
    selected, 
    onChange, 
    placeholder,
    allowCustom = false,
    maxSelection
}: {
    label: string;
    icon: React.ElementType;
    options: string[];
    selected: string[];
    onChange: (val: string[]) => void;
    placeholder: string;
    allowCustom?: boolean;
    maxSelection?: number;
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => 
        opt.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (option: string) => {
        if (selected.includes(option)) {
            onChange(selected.filter(item => item !== option));
        } else {
            if (maxSelection && selected.length >= maxSelection) return;
            onChange([...selected, option]);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && allowCustom && searchTerm.trim()) {
            if (!selected.includes(searchTerm.trim())) {
                if (maxSelection && selected.length >= maxSelection) return;
                onChange([...selected, searchTerm.trim()]);
                setSearchTerm("");
            }
        }
    };

    return (
        <div className="space-y-2 relative" ref={wrapperRef}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Icon size={12} /> {label}
            </label>
            
            <div className="relative">
                <div 
                    className={`bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 flex items-center justify-between cursor-text transition-all ${isOpen ? 'ring-2 ring-indigo-500/20 border-indigo-500' : 'hover:border-indigo-300'}`}
                    onClick={() => setIsOpen(prev => !prev)}
                >
                    <input 
                        type="text"
                        className="bg-transparent w-full text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                        placeholder={selected.length === 0 ? placeholder : `${selected.length} active (Type to add...)`}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => setIsOpen(true)}
                        onClick={(e) => { e.stopPropagation(); setIsOpen(true); }}
                        onKeyDown={handleKeyDown}
                    />
                    <ChevronDown size={16} className={`text-slate-400 pointer-events-none shrink-0 ml-2 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto custom-scrollbar animate-fade-in">
                        {allowCustom && searchTerm && !options.includes(searchTerm) && !selected.includes(searchTerm) && (
                            <button 
                                className="w-full text-left px-4 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 transition-colors border-b border-slate-50"
                                onClick={() => {
                                    handleSelect(searchTerm);
                                    setSearchTerm("");
                                }}
                            >
                                Add "{searchTerm}"...
                            </button>
                        )}
                        
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((opt, idx) => {
                                const isSelected = selected.includes(opt);
                                return (
                                    <button 
                                        key={idx} 
                                        className={`w-full text-left px-4 py-2.5 text-xs font-medium hover:bg-slate-50 transition-colors flex items-center justify-between ${isSelected ? 'bg-indigo-50/50 text-indigo-700' : 'text-slate-600'}`}
                                        onClick={() => handleSelect(opt)}
                                    >
                                        <span>{opt}</span>
                                        {isSelected && <Check size={12} className="text-indigo-600" />}
                                    </button>
                                )
                            })
                        ) : (
                            !allowCustom && <div className="px-4 py-3 text-xs text-gray-400 italic">No matches found.</div>
                        )}
                    </div>
                )}
            </div>

            {selected.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 animate-fade-in">
                    {selected.map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-lg text-[11px] font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-100">
                            {item}
                            <button 
                                onClick={(e) => { e.stopPropagation(); onChange(selected.filter(i => i !== item)); }} 
                                className="text-indigo-400 hover:text-red-500 transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

const N8N_WEBHOOK_URL = "https://n8n.srv1217103.hstgr.cloud/webhook-test/market-hero";

export const CampaignPlanStep: React.FC<CampaignPlanStepProps> = ({ 
    product, language, loading, loadingGrowthHacks = false, onGenerate, onGenerateMoreGrowthHacks, onClear, showValidation = false, validationTrigger = 0, onUpdateFocus, onUpdateProduct
}) => {
  const plan = product.campaignPlan;
  const containerRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(language);

  const [showLeadsModal, setShowLeadsModal] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isSearchingLeads, setIsSearchingLeads] = useState(false);
  
  // Use persistent state
  const strategicFocus = product.planFocus || "";
  
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [targetLocation, setTargetLocation] = useState<string>("");
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [growthHackFocus, setGrowthHackFocus] = useState<string>("");
  const [activeAutomationIdx, setActiveAutomationIdx] = useState(0);
  const [isRefreshingSingle, setIsRefreshingSingle] = useState(false);

  const handleRefreshSingleAutomation = async (idxToReplace: number) => {
    if (!onUpdateProduct || isRefreshingSingle) return;
    setIsRefreshingSingle(true);
    try {
        const automations = Array.isArray(plan?.growthHackAutomation) ? plan.growthHackAutomation : [plan?.growthHackAutomation];
        const targetHack = automations[idxToReplace];
        if (!targetHack) return;

        const productContext = `Product: ${product.name}. Description: ${product.description}. ICP: ${product.decisionMaker}`;
        const campaignContext = plan
           ? `Direction: ${plan.direction}. Core Message: ${plan.coreMessage}. Goal: ${plan.goal}`
           : "";
        const fullContext = `${productContext}\n${campaignContext}`;
        
        const { generateSingleGrowthHack } = await import('../services/geminiService');
        const updatedHack = await generateSingleGrowthHack(fullContext, targetHack, language, 'Quality');
        
        if (updatedHack) {
            const copy = [...automations];
            copy[idxToReplace] = updatedHack;
            onUpdateProduct({
                campaignPlan: {
                    ...plan!,
                    growthHackAutomation: copy
                }
            });
        }
    } catch (e) {
        console.error("Error refreshing single growth hack:", e);
    } finally {
        setIsRefreshingSingle(false);
    }
  };

  useEffect(() => {
    if (plan?.b2bSuggestions) {
        // Robust protection for missing industries array
        const industrySuggestions = plan.b2bSuggestions.industries || [];
        const validSuggestions = industrySuggestions.filter(i => i && VALID_INDUSTRIES.includes(i));
        
        if (validSuggestions.length > 0 && selectedIndustries.length === 0) {
            setSelectedIndustries(validSuggestions.slice(0, 3));
        }
        
        if (product.location && !targetLocation) {
            setTargetLocation(product.location);
        }

        if (plan.b2bSuggestions.jobTitles && jobTitles.length === 0) {
            setJobTitles(plan.b2bSuggestions.jobTitles);
        }
    }
  }, [plan, product.location]);

  const handleResetFilters = () => {
    if (plan?.b2bSuggestions) {
        const industrySuggestions = plan.b2bSuggestions.industries || [];
        const validSuggestions = industrySuggestions.filter(i => i && VALID_INDUSTRIES.includes(i));
        setSelectedIndustries(validSuggestions.slice(0, 3));
        setJobTitles(plan.b2bSuggestions.jobTitles || []);
    } else {
        setSelectedIndustries([]);
        setJobTitles([]);
    }

    if (product.location) {
        setTargetLocation(product.location);
    } else {
        setTargetLocation("");
    }
  };

  const handleSearchLeads = async () => {
    if (selectedIndustries.length === 0) return;
    setIsSearchingLeads(true);
    setShowLeadsModal(true);
    setLeads([]); 
    
    try {
        const results = await searchRealLeads(
            selectedIndustries, 
            targetLocation || product.location || "Global", 
            jobTitles,
            N8N_WEBHOOK_URL
        );
        setLeads(results);
    } catch (e) {
        console.error("Lead Search Failed", e);
    } finally {
        setIsSearchingLeads(false);
    }
  };

  const handleLoadMore = async () => {
    setIsLoadingMore(true);
    try {
        const moreResults = await searchRealLeads(
            selectedIndustries, 
            targetLocation || product.location || "Global", 
            jobTitles,
            N8N_WEBHOOK_URL
        );
        setLeads(prev => {
            const existingUrls = new Set(prev.map(l => l.linkedinUrl));
            const newLeads = (moreResults || []).filter(l => !existingUrls.has(l.linkedinUrl));
            return [...prev, ...newLeads];
        });
    } finally {
        setIsLoadingMore(false);
    }
  };

  const exportLeadsToCSV = () => {
    const BOM = "\uFEFF";
    let csvContent = BOM + "Name,Job Title,Location,Company,LinkedIn URL,Email,Phone\n";
    leads.forEach(l => {
        const row = [`"${l.name}"`, `"${l.jobTitle}"`, `"${l.location}"`, `"${l.companyName}"`, `"${l.linkedinUrl}"`, `"${l.email || ''}"`, `"${l.phone || ''}"`].join(",");
        csvContent += row + "\n";
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Leads_${targetLocation || 'B2B'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const enrichLead = (id: string) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: 'enriching' } : l));
    setTimeout(() => {
      setLeads(prev => prev.map(l => {
        if (l.id === id) {
          const domain = l.companyName.replace(/\s+/g, '').toLowerCase() + ".com";
          const email = `${l.name.split(' ')[0].toLowerCase()}.${l.name.split(' ')[1]?.toLowerCase() || 'exec'}@${domain}`;
          const phone = `+${Math.floor(Math.random() * 90) + 10} ${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 9000) + 1000}`;
          return { ...l, status: 'verified', email, phone };
        }
        return l;
      }));
    }, 1500);
  };

  const getStageIcon = (index: number) => {
      switch(index) {
          case 0: return <Zap size={24} />; // Attention
          case 1: return <UserPlus size={24} />; // Users/Acquisition
          case 2: return <CreditCard size={24} />; // Buyers/Conversion
          case 3: return <Repeat size={24} />; // Recurrence/Retention
          case 4: return <Heart size={24} />; // Advocacy/Referral
          default: return <Target size={24} />;
      }
  };

  const getStageColor = (idx: number) => {
      const colors = [
          'bg-purple-600 border-purple-200 text-white',
          'bg-blue-600 border-blue-200 text-white',
          'bg-emerald-600 border-emerald-200 text-white',
          'bg-amber-500 border-amber-200 text-white',
          'bg-rose-500 border-rose-200 text-white'
      ];
      return colors[idx % colors.length];
  };

  const RefreshButton = ({ onClick, isLoading = loading }: { onClick: () => void, isLoading?: boolean }) => (
    <button 
        onClick={onClick} 
        disabled={isLoading}
        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all disabled:opacity-50"
        title="Regenerate Plan"
    >
        <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
    </button>
  );

  if (!plan && !loading) {
    return (
      <div className="animate-slide-up w-full">
        <h2 className="text-4xl font-display font-bold mb-3 tracking-tight text-gray-900">{t.campaignPlanStep.title}</h2>
        <p className="text-lg text-gray-500 mb-6">{t.campaignPlanStep.subtitle}</p>
        
        <div className="mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-500/5">
             <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
               <Target size={14} className="text-indigo-500" /> {t.dreamBuyerStep.pivotLabel || "Strategic Direction (Optional)"}
             </label>
             <input 
                type="text" 
                value={strategicFocus}
                onChange={(e) => onUpdateFocus?.(e.target.value)}
                placeholder={t.dreamBuyerStep.pivotPlaceholder || "Ex: Focus on affluent urban professionals or parents of twins..."}
                className="w-full bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all placeholder:text-gray-300"
             />
        </div>

        <div ref={containerRef} className={`border-2 border-dashed rounded-3xl p-16 text-center transition-all group border-gray-200 bg-gray-50/50 hover:bg-gray-50`}>
            <div className={`w-20 h-20 rounded-full shadow-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 bg-white text-indigo-600`}>
                <Target size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t.campaignPlanStep.emptyTitle}</h3>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">{t.campaignPlanStep.emptyDesc}</p>
            <button 
                onClick={() => onGenerate(strategicFocus)} 
                className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-xl hover:shadow-indigo-200 transition-all flex items-center justify-center mx-auto hover:-translate-y-1 active:translate-y-0 shadow-lg"
            >
                <Sparkles className="mr-2" size={18}/> {t.campaignPlanStep.generateBtn}
            </button>
        </div>
      </div>
    );
  }

  if (loading && !plan) {
    return (
      <div className="py-20 text-center animate-pulse w-full">
        <Loader2 className="animate-spin text-indigo-600 mx-auto mb-8" size={48} />
        <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{t.campaignPlanStep.designing}</h3>
        <p className="text-gray-500 italic">{t.campaignPlanStep.mapping}</p>
      </div>
    );
  }

  const isB2B = product.audienceType === 'B2B' || product.audienceType === 'Both';

  return (
    <div className="animate-slide-up pb-12 w-full">
      {/* Lead Modal */}
      {showLeadsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white w-full max-w-[95vw] h-full max-h-[92vh] rounded-[2.5rem] shadow-[0_50px_100px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col border border-white/20 animate-slide-up">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-lg">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-slate-900 tracking-tight leading-none mb-1">{t.campaignPlanStep.leadFinderTitle}</h3>
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">{isSearchingLeads ? "Scanning Databases..." : `${leads.length} Decision Makers Identified`}</p>
                </div>
              </div>
              <button onClick={() => setShowLeadsModal(false)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-red-500 hover:border-red-100 transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-auto bg-white custom-scrollbar">
              {isSearchingLeads && leads.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full pb-20">
                      <Loader2 size={48} className="text-indigo-600 animate-spin mb-4" />
                      <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">Connecting to Data Providers...</p>
                  </div>
              ) : (
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-slate-50/95 backdrop-blur-md border-b border-slate-200">
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200/50">
                      <div className="flex items-center gap-2"><Users size={12} /> {t.campaignPlanStep.resultsTable.name}</div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200/50">
                      <div className="flex items-center gap-2"><Briefcase size={12} /> {t.campaignPlanStep.resultsTable.jobTitle}</div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200/50">
                      <div className="flex items-center gap-2"><MapPin size={12} /> {t.campaignPlanStep.resultsTable.location}</div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200/50">
                      <div className="flex items-center gap-2"><Globe size={12} /> {t.campaignPlanStep.resultsTable.company}</div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] border-r border-slate-200/50">
                      <div className="flex items-center gap-2"><Linkedin size={12} /> LinkedIn</div>
                    </th>
                    <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                      <div className="flex items-center gap-2"><Mail size={12} /> Contact Info</div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((lead, idx) => (
                    <tr key={idx} className="hover:bg-indigo-50/40 transition-colors group">
                      <td className="px-6 py-3.5 border-r border-slate-100/50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex-shrink-0">
                            {lead.avatarUrl ? (
                              <img src={lead.avatarUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-sm">{lead.name.charAt(0)}</div>
                            )}
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{lead.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 border-r border-slate-100/50">
                        <span className="text-xs font-bold text-slate-600 px-2.5 py-1 bg-slate-100 rounded-lg">{lead.jobTitle}</span>
                      </td>
                      <td className="px-6 py-3.5 border-r border-slate-100/50">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                           <MapPin size={10} className="text-indigo-400" /> {lead.location}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 border-r border-slate-100/50">
                        <span className="text-sm font-bold text-slate-900">{lead.companyName}</span>
                      </td>
                      <td className="px-6 py-3.5 border-r border-slate-100/50">
                        <a href={lead.linkedinUrl} target="_blank" className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2">
                           <Linkedin size={14} className="fill-blue-600 text-white" /> {lead.name.split(' ')[0].toLowerCase()}
                        </a>
                      </td>
                      <td className="px-6 py-3.5">
                        {lead.status === 'verified' ? (
                          <div className="flex flex-col gap-1.5">
                             <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                                <Mail size={10} className="text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-600 font-mono">{lead.email}</span>
                             </div>
                             <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm animate-in slide-in-from-bottom-2 duration-300 delay-100">
                                <Phone size={10} className="text-slate-400" />
                                <span className="text-[11px] font-bold text-slate-600 font-mono">{lead.phone}</span>
                             </div>
                          </div>
                        ) : lead.status === 'enriching' ? (
                          <div className="flex items-center gap-2 text-slate-400 animate-pulse bg-slate-50 px-3 py-1.5 rounded-xl w-fit">
                            <Loader2 size={12} className="animate-spin" />
                            <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Enriching...</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => enrichLead(lead.id)}
                            className="text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 bg-slate-400 hover:bg-slate-500 text-white rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
                          >
                             <Zap size={10} className="fill-white" /> Enrich Data
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              )}

              {leads.length > 0 && (
                  <div className="p-12 flex justify-center bg-slate-50/30 border-t border-slate-100">
                     <button 
                       onClick={handleLoadMore} 
                       disabled={isLoadingMore}
                       className="px-12 py-5 bg-white border border-slate-200 rounded-2xl text-slate-600 font-bold text-base hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-xl shadow-slate-200/50 flex items-center gap-3 active:scale-95 disabled:opacity-50"
                     >
                        {isLoadingMore ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
                        {isLoadingMore ? "Loading more leaders..." : "Load More Decisions Makers"}
                     </button>
                  </div>
              )}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
               <button 
                onClick={exportLeadsToCSV} 
                disabled={leads.length === 0}
                className="px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200/50 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
               >
                  <FileDown size={18} /> {t.creativesStep.exportCsv}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900">{t.campaignPlanStep.title}</h2>
          <p className="text-lg text-gray-500 mt-2">{t.campaignPlanStep.blueprintSubtitle}</p>
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
        </div>
      </div>

      <div className="mb-8 bg-white p-6 rounded-3xl border border-gray-100 shadow-xl shadow-indigo-500/5">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <Compass size={14} className="text-indigo-500" /> {t.dreamBuyerStep.pivotLabel || "Strategic Direction (Optional)"}
          </label>
          <div className="flex flex-col md:flex-row gap-3">
              <input 
                  type="text" 
                  value={strategicFocus}
                  onChange={(e) => onUpdateFocus?.(e.target.value)}
                  placeholder={t.dreamBuyerStep.pivotPlaceholder || "Ex: Focus on affluent urban professionals or parents of twins..."}
                  className="flex-1 bg-slate-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
              <button 
                  onClick={() => onGenerate(strategicFocus)}
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 w-full md:w-auto shrink-0"
              >
                  <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                  {t.common.refresh}
              </button>
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5"><Target size={120} className="text-indigo-600" /></div>
             <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                   <div className="flex items-center gap-4">
                       <div className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-lg">{plan?.direction}</div>
                       <div className="px-4 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-100">{t.campaignPlanStep.goalLabel}: {plan?.goal}</div>
                       <div className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1.5"><Globe size={10} /> {product.location}</div>
                   </div>
                   <RefreshButton onClick={() => onGenerate(strategicFocus)} />
                </div>
                <h3 className="text-3xl font-display font-bold text-gray-900 mb-4 leading-tight">"{plan?.coreMessage}"</h3>
                
                {plan?.marketNuance && (
                  <div className="mt-6 p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-3">
                    <Compass size={18} className="text-indigo-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">{t.campaignPlanStep.marketContext} ({product.location})</p>
                      <p className="text-sm text-gray-700 font-medium italic">"{plan.marketNuance}"</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                   <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center"><Layout size={12} className="mr-1.5"/> {t.campaignPlanStep.primaryPlatform}</div>
                      <p className="font-bold text-gray-900">{plan?.channelSetup.platform}</p>
                   </div>
                   <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center"><DollarSign size={12} className="mr-1.5"/> {t.campaignPlanStep.dailyBudget}</div>
                      <p className="font-bold text-gray-900">{plan?.channelSetup.budgetRange}</p>
                   </div>
                   <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center"><Clock size={12} className="mr-1.5"/> {t.campaignPlanStep.initialTest}</div>
                      <p className="font-bold text-gray-900">{plan?.channelSetup.testDuration}</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><List size={20} className="text-indigo-600" /> {t.campaignPlanStep.launchSteps}</h3>
                 <RefreshButton onClick={() => onGenerate(strategicFocus)} />
             </div>
             <div className="space-y-4">
                {(plan?.launchSteps || []).map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-5 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 group hover:bg-indigo-50 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white border border-indigo-200 flex items-center justify-center font-bold text-indigo-600 shadow-sm shrink-0">{idx + 1}</div>
                    <p className="text-gray-800 font-medium leading-relaxed">{step}</p>
                  </div>
                ))}
             </div>
          </div>

          {plan?.quickWins && (plan.quickWins.tactics?.length > 0 || plan.quickWins.partnerships?.length > 0) && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm relative group/quickwins animate-fade-in">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 border border-emerald-100">
                        <Rocket size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{t.campaignPlanStep.quickWinsTitle}</h3>
                        <p className="text-sm text-gray-500">{t.campaignPlanStep.quickWinsSubtitle}</p>
                    </div>
                    <RefreshButton onClick={() => onGenerate(strategicFocus)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Zap size={12} /> {t.campaignPlanStep.tacticsLabel}
                        </h4>
                        <div className="space-y-3">
                            {plan.quickWins.tactics?.map((tactic, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-emerald-50/30 rounded-xl border border-emerald-100/50">
                                    <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-gray-700 font-medium leading-snug">{tactic}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Handshake size={12} /> {t.campaignPlanStep.partnershipsLabel}
                        </h4>
                        <div className="space-y-3">
                            {plan.quickWins.partnerships?.map((partner, idx) => (
                                <div key={idx} className="flex items-start gap-3 p-4 bg-indigo-50/30 rounded-xl border border-indigo-100/50">
                                    <Users size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                                    <p className="text-sm text-gray-700 font-medium leading-snug">{partner}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          )}

          {isB2B && plan?.b2bTriggers && plan.b2bTriggers.length > 0 && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm relative group/triggers animate-fade-in">
               <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                        <Calendar size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{t.campaignPlanStep.b2bTriggersTitle}</h3>
                        <p className="text-sm text-gray-500">{t.campaignPlanStep.b2bTriggersSubtitle}</p>
                    </div>
                    <RefreshButton onClick={() => onGenerate(strategicFocus)} />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plan.b2bTriggers.map((trigger, idx) => (
                        <div key={idx} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl hover:border-amber-200 hover:bg-amber-50/30 transition-colors group">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-white text-xs font-bold text-slate-700 rounded-lg shadow-sm border border-slate-200 flex items-center gap-1.5">
                                        <Calendar size={12} className="text-slate-400"/> {trigger.date}
                                    </span>
                                    <span className="px-3 py-1 bg-indigo-100 text-[10px] font-bold text-indigo-700 uppercase tracking-wide rounded-lg">
                                        {trigger.type}
                                    </span>
                                </div>
                                <Flag size={16} className="text-slate-300 group-hover:text-amber-400 transition-colors" />
                            </div>
                            <h4 className="text-lg font-bold text-slate-900 mb-2">{trigger.name}</h4>
                            <p className="text-sm text-slate-600 leading-relaxed font-medium">{trigger.description}</p>
                        </div>
                    ))}
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-8">
           <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl text-white relative overflow-hidden">
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600 rounded-full blur-3xl opacity-20 pointer-events-none"></div>
             <div className="flex items-center justify-between mb-6 relative z-10">
                 <h3 className="text-xl font-display font-bold flex items-center gap-2"><Zap size={20} className="text-indigo-400" /> {t.campaignPlanStep.creativeRecs}</h3>
                 <button onClick={() => onGenerate(strategicFocus)} disabled={loading} className="text-white/50 hover:text-white transition-colors disabled:opacity-30"><RefreshCw size={14} className={loading ? "animate-spin" : ""} /></button>
             </div>
             <div className="space-y-4 relative z-10">
                {(plan?.creativeRecommendations || []).map((rec, idx) => (
                  <div key={idx} className="p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group">
                    <div className="flex items-center justify-between mb-2">
                       <span className="text-xs font-bold text-indigo-300">{rec.count} {rec.type}</span>
                       <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${rec.priority === 'High' ? 'bg-red-500/20 text-red-300' : 'bg-white/10 text-white/40'}`}>{rec.priority}</span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed font-medium">{rec.reason}</p>
                  </div>
                ))}
             </div>
             <div className="mt-8 pt-8 border-t border-white/10">
                <div className="p-4 bg-indigo-600/20 rounded-2xl border border-indigo-500/30 flex items-start gap-3">
                   <Lightbulb size={18} className="text-indigo-300 shrink-0 mt-0.5" />
                   <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">{t.campaignPlanStep.strategistTip}</p>
                      <p className="text-xs text-white/80 leading-relaxed">{plan?.nextMove}</p>
                   </div>
                </div>
             </div>
           </div>

           <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm">
             <div className="flex items-center justify-between mb-6">
                 <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2"><TrendingUp size={20} className="text-emerald-600" /> {t.campaignPlanStep.signals}</h3>
                 <RefreshButton onClick={() => onGenerate(strategicFocus)} />
             </div>
             <div className="space-y-6">
                <div>
                   <h4 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3">{t.campaignPlanStep.goodSigns}</h4>
                   <div className="space-y-2">
                      {(plan?.firstSignals?.goodSigns || []).map((s, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 font-medium">
                           <CheckCircle2 size={12} className="text-emerald-500 mt-0.5 shrink-0" /> {s}
                        </div>
                      ))}
                   </div>
                </div>
                <div>
                   <h4 className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-3">{t.campaignPlanStep.redFlags}</h4>
                   <div className="space-y-2">
                      {(plan?.firstSignals?.redFlags || []).map((s, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-600 font-medium">
                           <AlertCircle size={12} className="text-red-400 mt-0.5 shrink-0" /> {s}
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           </div>

           {plan?.keywords && plan.keywords.length > 0 && (
            <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MousePointer2 size={20} className="text-indigo-600" />
                    {t.campaignPlanStep.searchIntelligenceTitle}
                  </h3>
                  <RefreshButton onClick={() => onGenerate(strategicFocus)} />
              </div>
              <div className="space-y-4">
                {plan.keywords.map((kw, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:border-indigo-200 hover:bg-white transition-all group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-800">{kw.term}</span>
                      <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${kw.relevance === 'High' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'}`}>
                        {kw.relevance || t.campaignPlanStep.relevanceLabel}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp size={10} className="text-indigo-400" />
                        <span className="text-[10px] font-bold text-slate-500">{kw.volume} ({t.campaignPlanStep.monthlyVolume})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <DollarSign size={10} className="text-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-500">{kw.cpc} ({t.campaignPlanStep.avgCpc})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
           )}
        </div>
      </div>

      {/* PLG Strategy Panel */}
      {plan?.plgStrategy && plan.plgStrategy.length > 0 && (
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-10 rounded-[2.5rem] border border-slate-100 shadow-sm mb-12 w-full animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
                <RefreshCw size={140} className="text-indigo-600" />
            </div>
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2.5 bg-white rounded-xl text-indigo-600 shadow-sm border border-indigo-100">
                                <Repeat size={20} />
                            </div>
                            <h3 className="text-2xl font-display font-bold text-gray-900 tracking-tight">{t.campaignPlanStep.plgTitle}</h3>
                        </div>
                        <p className="text-sm text-gray-500 font-medium max-w-2xl">{t.campaignPlanStep.plgSubtitle}</p>
                    </div>
                    <RefreshButton onClick={() => onGenerate(strategicFocus)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {plan.plgStrategy.map((block, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-lg hover:border-indigo-100 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative group">
                            {idx < 4 && (
                                <div className="hidden lg:block absolute -right-4 top-1/2 -translate-y-1/2 z-20 text-indigo-200">
                                    <ArrowRight size={16} />
                                </div>
                            )}
                            
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 shadow-lg border transition-colors ${getStageColor(idx)}`}>
                                {getStageIcon(idx)}
                            </div>
                            
                            <h4 className="text-xl font-bold text-gray-900 mb-3 leading-tight">{block.stage}</h4>
                            
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">{t.campaignPlanStep.plgGoalLabel}</span>
                            <p className="text-sm text-gray-600 font-medium italic mb-8 leading-relaxed border-l-4 border-gray-100 pl-4 py-1">"{block.goal}"</p>
                            
                            <ul className="space-y-4 mb-8 flex-1">
                                {block.actions.map((action, i) => (
                                    <li key={i} className="flex items-start gap-3 text-[15px] text-gray-800 font-medium leading-normal">
                                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${idx % 2 === 0 ? 'bg-indigo-500' : 'bg-slate-400'}`}></div>
                                        {action}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      )}

      {/* Growth Hack Automation Panel */}
      {plan?.growthHackAutomation && (
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-200 shadow-xl relative group w-full mb-12">
            <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                    <Terminal size={140} className="text-gray-900" />
                </div>
            </div>
            
            <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-6">
                    <div className="flex flex-col gap-1 shrink-0">
                        <div className="flex items-center gap-3">
                            <span className="p-2 bg-gray-100 rounded-xl text-gray-700"><Terminal size={24} /></span>
                            <h3 className="text-2xl font-black text-gray-900 tracking-tight">{t.campaignPlanStep.growthHack.title}</h3>
                        </div>
                        <p className="text-sm text-gray-500 font-medium ml-14">{t.campaignPlanStep.growthHack.subtitle}</p>
                    </div>
                    
                    <div className="flex items-end gap-3 w-full md:max-w-md">
                        <div className="w-full">
                            <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{t.campaignPlanStep.growthHack.directionPlaceholder}</label>
                            <div className="relative group/input w-full">
                                <input 
                                    type="text" 
                                    value={growthHackFocus} 
                                    onChange={(e) => setGrowthHackFocus(e.target.value)}
                                    placeholder={t.campaignPlanStep.growthHack.directionPlaceholder}
                                    className="pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-400"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            setActiveAutomationIdx(0);
                                            (onGenerateMoreGrowthHacks || onGenerate)(growthHackFocus ? `Focus specifically on Growth Hack Automation tracking this direction: ${growthHackFocus}` : strategicFocus);
                                        }
                                    }}
                                />
                                <Terminal size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/input:text-indigo-500 transition-colors" />
                            </div>
                        </div>
                        <div className="mb-0.5">
                            <RefreshButton 
                                isLoading={loadingGrowthHacks}
                                onClick={() => {
                                    setActiveAutomationIdx(0);
                                    (onGenerateMoreGrowthHacks || onGenerate)(growthHackFocus ? `Focus specifically on Growth Hack Automation tracking this direction: ${growthHackFocus}` : strategicFocus);
                                }} 
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {(() => {
                        const automations = Array.isArray(plan.growthHackAutomation) ? plan.growthHackAutomation : [plan.growthHackAutomation];
                        if (!automations || automations.length === 0 || !automations[0]) return null;
                        
                        // Ensure active index is within bounds
                        const activeIndex = activeAutomationIdx < automations.length ? activeAutomationIdx : 0;
                        const automation = automations[activeIndex];
                        
                        return (
                            <>
                                {automations.length > 1 && (
                                    <div className="flex flex-wrap gap-2 pb-4 mb-4">
                                        {automations.map((auto, idx) => {
                                            const buttonText = auto?.title || auto?.objective || `Automation ${idx + 1}`;
                                            const displayText = buttonText.length > 35 ? buttonText.substring(0, 35) + "..." : buttonText;
                                            return (
                                                <button
                                                    key={idx}
                                                    onClick={() => setActiveAutomationIdx(idx)}
                                                    className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                                                        activeIndex === idx 
                                                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                                                        : 'bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100'
                                                    }`}
                                                    title={buttonText}
                                                >
                                                    {displayText}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                                
                                <div className="automation-block">
                                    <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8 mb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                {automation.overview && (
                                                    <div className="mb-6">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{t.campaignPlanStep.growthHack.overview}</span>
                                                        <p className="text-[15px] font-medium text-gray-800 leading-relaxed bg-white p-4 rounded-xl shadow-sm border border-gray-100">{automation.overview}</p>
                                                    </div>
                                                )}
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">{t.campaignPlanStep.growthHack.objective}</span>
                                                    <button
                                                        onClick={() => handleRefreshSingleAutomation(activeIndex)}
                                                        disabled={isRefreshingSingle}
                                                        className="px-3 py-1 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                                                        title={language === 'pt' ? 'Regerar esta automação com IA' : 'Regenerate this automation with AI'}
                                                    >
                                                        <RefreshCw size={11} className={isRefreshingSingle ? "animate-spin text-indigo-500" : ""} />
                                                        {language === 'pt' ? 'Recriar esta Automação' : 'Regenerate Automation'}
                                                    </button>
                                                </div>
                                                <h4 className="text-xl font-bold text-gray-900 leading-tight mb-4">{automation.objective}</h4>
                                                
                                                {automation.ultimateOutcome && (
                                                    <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-xl relative overflow-hidden group/success">
                                                        <div className="absolute -right-2 -bottom-2 opacity-10 group-hover/success:scale-110 transition-transform">
                                                            <CheckCircle2 size={60} className="text-emerald-600" />
                                                        </div>
                                                        <div className="relative z-10">
                                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] block mb-1">Ultimate Outcome (Success Definition)</span>
                                                            <p className="text-sm font-bold text-emerald-900 leading-relaxed">{automation.ultimateOutcome}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{t.campaignPlanStep.growthHack.why}</span>
                                                <p className="text-[15px] font-medium text-gray-600 leading-relaxed">{automation.why}</p>
                                            </div>
                                            <div className="flex flex-col justify-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                                                <div className="absolute -right-4 -bottom-4 opacity-5">
                                                    <Bot size={100} />
                                                </div>
                                                <div className="relative z-10 flex flex-col items-center justify-center text-center pb-4 border-b border-gray-100 mb-4">
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">Main System</span>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200"><Bot size={24} /></div>
                                                        <span className="text-2xl font-black text-gray-900">{automation.aiAgent}</span>
                                                    </div>
                                                </div>
                                                
                                                {automation.subAgents && automation.subAgents.length > 0 && (
                                                    <div className="relative z-10 pt-2">
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
                                                        <Zap size={12} className="text-amber-500" /> System Architecture & Sub-Agents
                                                        </span>
                                                        <div className="flex flex-col gap-4">
                                                            {automation.subAgents.map((agent, aIdx) => (
                                                                <div key={aIdx} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex justify-center items-center font-bold text-[10px] shrink-0">
                                                                            {agent.role.includes('Orchestra') ? <Terminal size={12} /> : <Bot size={12} />}
                                                                        </div>
                                                                        <h5 className="font-bold text-sm text-gray-900">{agent.name}</h5>
                                                                        <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full ml-auto whitespace-nowrap">{agent.role}</span>
                                                                    </div>
                                                                    {agent.skills && agent.skills.length > 0 && (
                                                                        <div className="flex flex-wrap gap-1.5 mt-3">
                                                                            {agent.skills.map((skill, sIdx) => (
                                                                                <span key={sIdx} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium border border-indigo-100/50 flex items-center gap-1">
                                                                                    {skill}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">{t.campaignPlanStep.growthHack.copyPrompt}</span>
                                        <div className="bg-gray-900 rounded-[2rem] p-8 relative group/code shadow-lg">
                                            <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap leading-relaxed pb-16">{automation.initialPrompt}</pre>
                                            <button 
                                                className="absolute bottom-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-sm flex items-center gap-2"
                                                onClick={() => {
                                                    navigator.clipboard.writeText(automation.initialPrompt || "");
                                                }}
                                                title={t.campaignPlanStep.growthHack.copyPrompt}
                                            >
                                                <Copy size={16} /> <span className="text-xs font-bold uppercase tracking-wider">Copy</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
                                        <div>
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                                                <CheckCircle size={14} className="text-emerald-500" /> {t.campaignPlanStep.growthHack.tasks}
                                            </span>
                                            <ul className="space-y-4">
                                                {(automation.tasks || []).map((task, i) => (
                                                    <li key={i} className="flex items-start gap-4">
                                                        <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-black text-xs mt-0.5">{i+1}</div>
                                                        <span className="text-[15px] text-gray-700 font-medium leading-relaxed">{task}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>
        </div>
      )}

      {isB2B && plan && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-gray-200 shadow-xl relative group w-full">
           <div className="absolute inset-0 rounded-[2.5rem] overflow-hidden pointer-events-none">
               <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-700">
                  <Search size={140} className="text-indigo-600" />
               </div>
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                    <Users size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-gray-900 tracking-tight">{t.campaignPlanStep.leadFinderTitle}</h3>
                    <p className="text-sm text-gray-500 font-medium">{t.campaignPlanStep.leadFinderSubtitle}</p>
                  </div>
                </div>
                <button 
                  onClick={handleResetFilters}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                  title="Reset Filters"
                >
                  <RefreshCw size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <MultiSelectDropdown 
                    label={t.campaignPlanStep.industriesLabel}
                    icon={Briefcase}
                    options={VALID_INDUSTRIES}
                    selected={selectedIndustries}
                    onChange={setSelectedIndustries}
                    placeholder="Select industries..."
                    maxSelection={3}
                />
                
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <MapPin size={12} /> Country
                    </label>
                    <SearchableCountrySelect 
                        value={targetLocation} 
                        onChange={setTargetLocation} 
                        language={language} 
                    />
                </div>

                <MultiSelectDropdown 
                    label={t.campaignPlanStep.titlesLabel}
                    icon={Target}
                    options={plan.b2bSuggestions?.jobTitles || []}
                    selected={jobTitles}
                    onChange={setJobTitles}
                    placeholder="Type to add job title..."
                    allowCustom={true}
                />
              </div>

              <div className="flex justify-start pt-6 border-t border-gray-100">
                  <button 
                    onClick={handleSearchLeads}
                    disabled={selectedIndustries.length === 0}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:shadow-none"
                  >
                    <Search size={16} />
                    {t.campaignPlanStep.searchLeadsBtn}
                  </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
