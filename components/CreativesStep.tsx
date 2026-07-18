import React, { useRef, useState, useMemo, useEffect } from 'react';
/* Added Plus and Layers to imports */
import { 
    Layout, MousePointer, Clapperboard, Check, Mail, Linkedin, Plus, Slash, Phone, Layers
} from 'lucide-react';
import { Product, Creative, SearchAdGroup, SearchAd, Storyboard, Scene, Language, EmailStyle, LinkedInPost, PhoneCampaign, CreativeSettings, SoftwareRecommendation } from '../types';
import { getTranslation } from '../translations';
import { generatePhoneScripts, generateSoftwareRecommendations } from '../services/geminiService';

// Import sub-modules
import { MetaAdsStudio } from './creatives/MetaAdsStudio';
import { GoogleAdsStudio } from './creatives/GoogleAdsStudio';
import { LinkedInStudio } from './creatives/LinkedInStudio';
import { EmailMarketingStudio } from './creatives/EmailMarketingStudio';
import { PhoneCallStudio } from './creatives/PhoneCallStudio';
import { StoryboardStudio } from './creatives/StoryboardStudio';
import { SoftwareStudio } from './creatives/SoftwareStudio';

interface CreativesStepProps {
  product: Product;
  language: Language;
  loading: boolean;
  taskQueue: Set<string>;
  onGenerateCreative: (style: Creative['style'], customDirection?: string) => void | Promise<void>;
  onRefreshText: (id: string, style: Creative['style']) => void | Promise<void>;
  onGenerateImage: (id: string, prompt: string, base: string | string[] | undefined, composition: string, style?: string) => void | Promise<void>;
  onGenerateSearchAds: (customDirection?: string) => void | Promise<void>;
  onGenerateEmailCampaign: (category: string, style: EmailStyle, customDirection?: string) => void | Promise<void>;
  onGenerateStoryboard: (style: string, customDirection?: string) => void | Promise<void>;
  onGenerateSceneImage: (sceneNumber: number, prompt: string, base: string | undefined, storyboardId?: string) => void | Promise<void>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => Promise<string | null | undefined>;
  onImagesPasted?: (files: File[]) => Promise<string | null | undefined>;
  onUpdate: (creatives: Creative[]) => void;
  onUpdateSearchAds: (searchAds: SearchAdGroup[]) => void;
  onUpdateStoryboard: (storyboard: Storyboard) => void;
  onFetchIndustryNews?: (isLoadMore?: boolean) => void | Promise<void>;
  onClearNews?: () => void;
  onGenerateLinkedInPost?: (newsItem: any | null, style: string, customDirection?: string) => void | Promise<void>;
  onRefreshLinkedInPost?: (postId: string, category: string, linkedNewsId?: string) => void | Promise<void>;
  onDeleteLinkedInPost?: (postId: string) => void;
  onUpdatePhoneCampaign?: (campaign: PhoneCampaign) => void;
  onRefreshScene?: (sceneNumber: number, storyboardId?: string) => void;
  onUpdateProduct?: (updates: Partial<Product>) => void;
  showValidation?: boolean;
  setLightboxImage?: (url: string | null) => void;
}

const COMPOSITIONS = [
  { label: "Close-Up", value: "Close-Up" },
  { label: "Medium Shot", value: "Medium Shot" },
  { label: "3/4 Angle Shot", value: "3/4 Angle Shot" },
  { label: "Macro Shot", value: "Macro Shot" },
  { label: "Full Shot", value: "Full Shot" },
  { label: "Wide Establishing Shot", value: "Wide Establishing Shot" },
  { label: "Low Angle", value: "Low Angle" },
  { label: "High Angle", value: "High Angle" },
  { label: "Over the Shoulder", value: "Over the Shoulder" },
  { label: "Dutch Angle", value: "Dutch Angle" }
];

const BASE_EMAIL_ANGLES = [
  "Launch",
  "Promotion / Discount",
  "New feature or product",
  "Evergreen",
  "Community / Personal",
  "Thank you / Post-purchase"
];

const EMAIL_STYLES: EmailStyle[] = ["Human-Written", "HTML Newsletter"];

const BASE_SOCIAL_STYLES: Creative['style'][] = [
    'Product-First',
    'Direct-Response', 
    'Short-Human',
    'Minimalist',
    'Storytelling',
    'UGC/Raw',
    'YouTube-Thumbnail',
    'Breaking News',
    'Highlight Method',
    'Secret Info',
    'Social Gossip',
    'Pop-Culture-Twist', 
    'Humor', 
    'Versus',
    'SMS-Mockup',
    'Native-Social'
];

const BASE_STORYBOARD_STYLES = ['Viral-Hook', 'Humor/Skit', 'Trending-Audio', 'Problem-Solution', 'ASMR/Satisfying'];

const LINKEDIN_STYLES = [
    "Short / Provocative (Tweet)",
    "Thought Leadership", 
    "Contrarian View", 
    "News Commentary",
    "Congratulations / Achievement",
    "Case Study/Results", 
    "Personal Story", 
    "Industry Analysis"
];

export const CreativesStep: React.FC<CreativesStepProps> = (props) => {
  const { product, language, taskQueue, onFileUpload, onUpdate, onUpdateSearchAds, onUpdateStoryboard, onUpdateProduct, setLightboxImage } = props;
  const [activeTab, setActiveTab] = useState<'social' | 'search' | 'email' | 'storyboard' | 'linkedin' | 'phone' | 'software'>('social');
  
  // Safe Access to Product Settings
  const creativeSettings = product.creativeSettings || {};

  const updateSettings = (updates: Partial<CreativeSettings>) => {
      if (onUpdateProduct) {
          onUpdateProduct({ 
              creativeSettings: { ...creativeSettings, ...updates } 
          });
      }
  };

  const socialStyles = useMemo(() => {
    const base = [...BASE_SOCIAL_STYLES];
    if (!product.campaignPlan) return base;
    const planAngle = product.campaignPlan.direction as any;
    const filtered = base.filter(s => s !== planAngle);
    return [...filtered, planAngle];
  }, [product.campaignPlan]);

  const emailAngles = useMemo(() => {
    const base = [...BASE_EMAIL_ANGLES];
    if (!product.campaignPlan) return base;
    const planAngle = product.campaignPlan.direction;
    const filtered = base.filter(a => a !== planAngle);
    return [...filtered, planAngle];
  }, [product.campaignPlan]);

  const storyboardStyles = useMemo(() => {
    return [...BASE_STORYBOARD_STYLES];
  }, []);

  // State Mapped to Product Settings
  const activeStyle = (creativeSettings.metaActiveStyle as Creative['style']) || socialStyles[0];
  const setActiveStyle = (val: Creative['style']) => updateSettings({ metaActiveStyle: val });

  const activeEmailAngle = creativeSettings.emailActiveAngle || emailAngles[0];
  const setActiveEmailAngle = (val: string) => updateSettings({ emailActiveAngle: val });

  const activeEmailStyle = creativeSettings.emailActiveStyle || "Human-Written";
  const setActiveEmailStyle = (val: EmailStyle) => updateSettings({ emailActiveStyle: val });

  const activeLinkedInStyle = creativeSettings.linkedinActiveStyle || LINKEDIN_STYLES[0];
  const setActiveLinkedInStyle = (val: string) => updateSettings({ linkedinActiveStyle: val });

  const activeStoryboardStyle = creativeSettings.storyboardActiveStyle || storyboardStyles[0];
  const setActiveStoryboardStyle = (val: string) => updateSettings({ storyboardActiveStyle: val });

  // Custom Directions Mapped to Product Settings
  const customMetaDirection = creativeSettings.metaDirection || "";
  const setCustomMetaDirection = (val: string) => updateSettings({ metaDirection: val });

  const metaTextLength = creativeSettings.metaTextLength || "medium";
  const setMetaTextLength = (val: 'tweet' | 'short' | 'medium' | 'long') => updateSettings({ metaTextLength: val });

  const customLinkedInDirection = creativeSettings.linkedinDirection || "";
  const setCustomLinkedInDirection = (val: string) => updateSettings({ linkedinDirection: val });

  const customEmailDirection = creativeSettings.emailDirection || "";
  const setCustomEmailDirection = (val: string) => updateSettings({ emailDirection: val });

  const customPhoneDirection = creativeSettings.phoneDirection || "";
  const setCustomPhoneDirection = (val: string) => updateSettings({ phoneDirection: val });

  const customStoryboardDirection = creativeSettings.storyboardDirection || "";
  const setCustomStoryboardDirection = (val: string) => updateSettings({ storyboardDirection: val });

  const customSearchDirection = creativeSettings.searchDirection || "";
  const setCustomSearchDirection = (val: string) => updateSettings({ searchDirection: val });

  const customSoftwareDirection = creativeSettings.softwareDirection || "";
  const setCustomSoftwareDirection = (val: string) => updateSettings({ softwareDirection: val });

  // Visual Controls (Meta Ads)
  const metaShotType = creativeSettings.metaShotType || "Medium Shot";
  const setMetaShotType = (val: string) => updateSettings({ metaShotType: val });
  const metaImagesCount = creativeSettings.metaImagesCount || 1;
  const setMetaImagesCount = (val: number) => updateSettings({ metaImagesCount: val });

  // Determine effective base image. 
  // If explicit selection exists (even empty string or empty array for "none"), use it.
  // We use metaBaseImages (array) preferred, fallback to metaBaseImage (string) if array empty
  const metaBaseImages = creativeSettings.metaBaseImages !== undefined
      ? creativeSettings.metaBaseImages 
      : (creativeSettings.metaBaseImage !== undefined ? (creativeSettings.metaBaseImage ? [creativeSettings.metaBaseImage] : []) : (product.images.length > 0 ? [product.images[0]] : []));
  
  const setMetaBaseImages = (val: string[]) => updateSettings({ metaBaseImages: val });

  // Exclude Buyer Context (Meta) - Default to TRUE
  const excludeBuyerContext = creativeSettings.excludeBuyerContext !== undefined ? creativeSettings.excludeBuyerContext : true;
  const setExcludeBuyerContext = (val: boolean) => updateSettings({ excludeBuyerContext: val });

  // Ignore Context (Storyboard) - Default to TRUE
  const storyboardIgnoreContext = creativeSettings.storyboardIgnoreContext !== undefined ? creativeSettings.storyboardIgnoreContext : true;
  const setStoryboardIgnoreContext = (val: boolean) => updateSettings({ storyboardIgnoreContext: val });

  // Ignore Context (LinkedIn) - Default to TRUE
  const linkedinExcludeContext = creativeSettings.linkedinExcludeContext !== undefined ? creativeSettings.linkedinExcludeContext : true;
  const setLinkedinExcludeContext = (val: boolean) => updateSettings({ linkedinExcludeContext: val });

  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchAdCopyStatus, setSearchAdCopyStatus] = useState<string | null>(null);
  const [emailCopyStatus, setEmailCopyStatus] = useState<string | null>(null);
  const [linkedInCopyStatus, setLinkedInCopyStatus] = useState<string | null>(null);
  
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [isSoftwareLoading, setIsSoftwareLoading] = useState(false);

  const internalFileRef = useRef<HTMLInputElement>(null);
  const [targetIdForUpload, setTargetIdForUpload] = useState<{ type: 'social' | 'scene', id: string | number, storyboardId?: string } | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Refs for tab auto-centering
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const t = getTranslation(language);

  const isSocialLoading = taskQueue.has(`creative-gen-${product.id}`);
  const isSearchLoading = taskQueue.has(`search-ads-gen-${product.id}`);
  const isEmailLoading = taskQueue.has(`email-gen-${product.id}`);
  const isStoryboardLoading = taskQueue.has(`storyboard-gen-${product.id}`);
  const isNewsLoading = taskQueue.has(`news-fetch-${product.id}`);
  const isLinkedInLoading = taskQueue.has(`linkedin-gen-${product.id}`);

  const isB2B = product.audienceType === 'B2B' || product.audienceType === 'Both';

  useEffect(() => {
    if (!socialStyles.includes(activeStyle) && !['Unique-Mechanism', 'Emotional-Driver', 'Viral-Angle', 'YouTube-Thumbnail'].includes(activeStyle)) {
        setActiveStyle(socialStyles[0]);
    }
  }, [socialStyles]);

  useEffect(() => {
    if (!emailAngles.includes(activeEmailAngle)) setActiveEmailAngle(emailAngles[0]);
  }, [emailAngles]);

  // Auto-scroll active tab to center
  useEffect(() => {
    if (tabsContainerRef.current && tabRefs.current[activeTab]) {
      const container = tabsContainerRef.current;
      const activeElement = tabRefs.current[activeTab];
      
      if (activeElement) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();
        
        const scrollOffset = (activeRect.left + activeRect.width / 2) - (containerRect.left + containerRect.width / 2);
        
        container.scrollBy({
          left: scrollOffset,
          behavior: 'smooth'
        });
      }
    }
  }, [activeTab]);

  const handleCopyText = (creative: Creative) => {
    const text = `HOOK: ${creative.hook}\nCAPTION: ${creative.caption}\n\nHEADLINE: ${creative.headline}\nSUBHEADLINE: ${creative.subheadline}\nCTA: ${creative.cta}`;
    navigator.clipboard.writeText(text);
    setCopiedId(creative.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopySearchAd = (ad: SearchAd, idx: string) => {
    const text = `HEADLINES:\n${ad.headlines?.join('\n') || ''}\n\nDESCRIPTIONS:\n${ad.descriptions?.join('\n') || ''}\n\nPATHS: ${ad.path1 || ''} / ${ad.path2 || ''}\n\nKEYWORDS:\n${ad.keywords?.join(', ') || ''}`;
    navigator.clipboard.writeText(text);
    setSearchAdCopyStatus(idx);
    setTimeout(() => setSearchAdCopyStatus(null), 2000);
  };

  const handleCopyEmail = (email: any, idx: number) => {
    const text = `SUBJECT: ${email.subject || ''}\n\n${email.body || ''}\n\n${email.primaryAction || ''}`;
    navigator.clipboard.writeText(text);
    setEmailCopyStatus(idx.toString());
    setTimeout(() => setEmailCopyStatus(null), 2000);
  };

  const handleCopyLinkedIn = (post: LinkedInPost, idx: string) => {
    const text = `${post.hook}\n\n${post.content}`;
    navigator.clipboard.writeText(text);
    setLinkedInCopyStatus(idx);
    setTimeout(() => setLinkedInCopyStatus(null), 2000);
  };

  const handleDownloadImage = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToCSV = () => {
    if (!product.searchAds || product.searchAds.length === 0) return;
    const BOM = "\uFEFF";
    let csvContent = BOM + "Intent,Ad Keywords,Headline 1,Headline 2,Headline 3,Description 1,Description 2,Path 1,Path 2\n";
    product.searchAds.forEach(group => {
        group.ads?.forEach(ad => {
            const row = [group.intent, `"${ad.keywords?.join(', ') || ''}"`, `"${ad.headlines?.[0] || ''}"`, `"${ad.headlines?.[1] || ''}"`, `"${ad.headlines?.[2] || ''}"`, `"${ad.descriptions?.[0] || ''}"`, `"${ad.descriptions?.[1] || ''}"`, `"${ad.path1 || ''}"`, `"${ad.path2 || ''}"`].join(",");
            csvContent += row + "\n";
        });
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${product.name.replace(/\s+/g, '_')}_google_ads.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getEnergyColor = (tag: Scene['energyTag']) => {
    switch (tag) {
      case 'Hook': return 'bg-purple-600';
      case 'Pain': return 'bg-red-600';
      case 'Logic': return 'bg-indigo-600';
      case 'Proof': return 'bg-emerald-600';
      case 'CTA': return 'bg-orange-600';
      default: return 'bg-gray-600';
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
        const container = scrollContainerRef.current;
        const firstCard = container.firstElementChild as HTMLElement;
        if (firstCard) {
            const cardWidth = firstCard.offsetWidth;
            const gap = 32; 
            const scrollDistance = cardWidth + gap;
            container.scrollBy({ left: direction === 'left' ? -scrollDistance : scrollDistance, behavior: 'smooth' });
        }
    }
  };

  // Support multi-select via array if passed as array
  const FoundationPicker = ({ selected, onSelect, type, id, storyboardId }: { selected?: string | string[], onSelect: (img?: string | string[]) => void, type: 'social' | 'scene', id: string | number, storyboardId?: string }) => {
    
    // Normalize to array for easier checking, but respect string/array type for callback
    const selectedArray = Array.isArray(selected) ? selected : (selected ? [selected] : []);

    const toggleSelection = (img: string) => {
        if (!img) {
            // Selecting "none" clears everything
            onSelect(type === 'social' ? [] : "");
            return;
        }

        if (type === 'social') {
            // Multi-select for social
            if (selectedArray.includes(img)) {
                // Remove
                onSelect(selectedArray.filter(i => i !== img));
            } else {
                // Add
                onSelect([...selectedArray, img]);
            }
        } else {
            // Single select for Scene (legacy behavior)
            onSelect(img);
        }
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2">
          <button onClick={() => toggleSelection("")} className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all shrink-0 ${selectedArray.length === 0 ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-400 hover:border-gray-300'}`} title="No foundation shot"><Slash size={14} /></button>
          {product.images.map((img, i) => {
            const isSelected = selectedArray.includes(img);
            return (
                <button key={i} onClick={() => toggleSelection(img)} className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all shrink-0 relative ${isSelected ? 'border-indigo-600 scale-105 shadow-md ring-2 ring-indigo-500/20' : 'border-gray-100 opacity-60 hover:opacity-100'}`}>
                    <img src={img} className="w-full h-full object-cover" />
                    {isSelected && <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center"><Check size={14} className="text-white drop-shadow-md" strokeWidth={3} /></div>}
                </button>
            );
          })}
          <button onClick={() => { setTargetIdForUpload({ type, id, storyboardId }); internalFileRef.current?.click(); }} className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 flex items-center justify-center hover:border-indigo-600 hover:text-indigo-600 transition-all shrink-0" title="Add more product images"><Plus size={14} /></button>
        </div>
    );
  };
  
  return (
    <div className="animate-slide-up pb-12 w-full">
        <input type="file" ref={internalFileRef} className="hidden" accept="image/*" onChange={async (e) => { 
            const base64 = await onFileUpload(e); 
            if (base64 && targetIdForUpload) { 
                if (targetIdForUpload.type === 'social') {
                    // When uploading for specific creative, set as single selected base image (legacy behavior for specific card)
                    // Or add to array? Let's just set it as single for simplicity on specific card overrides
                    onUpdate(product.creatives.map(c => c.id === targetIdForUpload.id ? { ...c, selectedBaseImage: base64 } : c));
                }
                else if (targetIdForUpload.type === 'scene' && targetIdForUpload.storyboardId && product.storyboards) {
                    const updatedStoryboards = product.storyboards.map(sb => {
                        if (sb.id === targetIdForUpload.storyboardId) {
                            return {
                                ...sb,
                                scenes: sb.scenes.map(s => s.number === targetIdForUpload.id ? { ...s, selectedBaseImage: base64 } : s)
                            };
                        }
                        return sb;
                    });
                    if (onUpdateProduct) onUpdateProduct({ storyboards: updatedStoryboards });
                }
            } 
            setTargetIdForUpload(null); 
        }}/>
        
        {/* STICKY TABS */}
        <div className="sticky top-[-4rem] z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 mb-10 -mx-8 px-8">
            <div 
                ref={tabsContainerRef}
                className="flex gap-4 overflow-x-auto no-scrollbar pt-2 pb-1 items-center"
            >
                <button 
                    ref={el => { tabRefs.current['social'] = el; }}
                    onClick={() => setActiveTab('social')} 
                    className={`flex items-center gap-3 px-8 py-4 rounded-t-2xl text-sm font-bold transition-all relative whitespace-nowrap flex-shrink-0 ${activeTab === 'social' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Layout size={18} /> Meta Ads
                    {product.creatives.length > 0 && <Check size={16} className="text-emerald-500 shrink-0 stroke-[3px]" />}
                </button>
                <button 
                    ref={el => { tabRefs.current['search'] = el; }}
                    onClick={() => setActiveTab('search')} 
                    className={`flex items-center gap-3 px-8 py-4 rounded-t-2xl text-sm font-bold transition-all relative whitespace-nowrap flex-shrink-0 ${activeTab === 'search' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <MousePointer size={18} /> Google Ads
                    {product.searchAds.length > 0 && <Check size={16} className="text-emerald-500 shrink-0 stroke-[3px]" />}
                </button>
                {isB2B && (
                    <button 
                        ref={el => { tabRefs.current['linkedin'] = el; }}
                        onClick={() => setActiveTab('linkedin')} 
                        className={`flex items-center gap-3 px-8 py-4 rounded-t-2xl text-sm font-bold transition-all relative whitespace-nowrap flex-shrink-0 ${activeTab === 'linkedin' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Linkedin size={18} /> {t.creativesStep.linkedinTitle}
                        {!!product.linkedinPosts?.length && <Check size={16} className="text-emerald-500 shrink-0 stroke-[3px]" />}
                    </button>
                )}
                <button 
                    ref={el => { tabRefs.current['email'] = el; }}
                    onClick={() => setActiveTab('email')} 
                    className={`flex items-center gap-3 px-8 py-4 rounded-t-2xl text-sm font-bold transition-all relative whitespace-nowrap flex-shrink-0 ${activeTab === 'email' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Mail size={18} /> E-mail
                    {!!product.emailCampaign && <Check size={16} className="text-emerald-500 shrink-0 stroke-[3px]" />}
                </button>
                {isB2B && (
                    <button 
                        ref={el => { tabRefs.current['phone'] = el; }}
                        onClick={() => setActiveTab('phone')} 
                        className={`flex items-center gap-3 px-8 py-4 rounded-t-2xl text-sm font-bold transition-all relative whitespace-nowrap flex-shrink-0 ${activeTab === 'phone' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <Phone size={18} /> {t.creativesStep.phoneTitle}
                        {!!product.phoneCampaign && <Check size={16} className="text-emerald-500 shrink-0 stroke-[3px]" />}
                    </button>
                )}
                <button 
                    ref={el => { tabRefs.current['storyboard'] = el; }}
                    onClick={() => setActiveTab('storyboard')} 
                    className={`flex items-center gap-3 px-8 py-4 rounded-t-2xl text-sm font-bold transition-all relative whitespace-nowrap flex-shrink-0 ${activeTab === 'storyboard' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Clapperboard size={18} /> TikTok/Reels
                    {(product.storyboards && product.storyboards.length > 0) && <Check size={16} className="text-emerald-500 shrink-0 stroke-[3px]" />}
                </button>
                <button 
                    ref={el => { tabRefs.current['software'] = el; }}
                    onClick={() => setActiveTab('software')} 
                    className={`flex items-center gap-3 px-8 py-4 rounded-t-2xl text-sm font-bold transition-all relative whitespace-nowrap flex-shrink-0 ${activeTab === 'software' ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
                >
                    <Layers size={18} /> Software
                    {(product.softwareRecommendations && product.softwareRecommendations.length > 0) && <Check size={16} className="text-emerald-500 shrink-0 stroke-[3px]" />}
                </button>
            </div>
        </div>

        {activeTab === 'social' && (
          <MetaAdsStudio 
            {...props}
            isSocialLoading={isSocialLoading}
            socialStyles={socialStyles}
            activeStyle={activeStyle}
            setActiveStyle={setActiveStyle}
            customMetaDirection={customMetaDirection}
            setCustomMetaDirection={setCustomMetaDirection}
            handleCopyText={handleCopyText}
            handleDownloadImage={handleDownloadImage}
            copiedId={copiedId}
            FoundationPicker={FoundationPicker}
            COMPOSITIONS={COMPOSITIONS}
            globalBaseImages={metaBaseImages}
            setGlobalBaseImages={setMetaBaseImages}
            globalShotType={metaShotType}
            setGlobalShotType={setMetaShotType}
            excludeBuyerContext={excludeBuyerContext}
            setExcludeBuyerContext={setExcludeBuyerContext}
            onGenerateImage={(id, prompt, base, comp) => props.onGenerateImage(id, prompt, base, comp, activeStyle)}
            setLightboxImage={setLightboxImage}
            metaImagesCount={metaImagesCount}
            onUpdateMetaImagesCount={setMetaImagesCount}
            metaTextLength={metaTextLength}
            setMetaTextLength={setMetaTextLength}
          />
        )}

        {activeTab === 'linkedin' && isB2B && (
          <LinkedInStudio 
            {...props}
            onFetchIndustryNews={props.onFetchIndustryNews!}
            onClearNews={props.onClearNews!}
            onGenerateLinkedInPost={props.onGenerateLinkedInPost!}
            onRefreshLinkedInPost={props.onRefreshLinkedInPost!}
            onDeleteLinkedInPost={props.onDeleteLinkedInPost!}
            isNewsLoading={isNewsLoading}
            isLinkedInLoading={isLinkedInLoading}
            selectedNewsId={selectedNewsId}
            setSelectedNewsId={setSelectedNewsId}
            activeLinkedInStyle={activeLinkedInStyle}
            setActiveLinkedInStyle={setActiveLinkedInStyle}
            customLinkedInDirection={customLinkedInDirection}
            setCustomLinkedInDirection={setCustomLinkedInDirection}
            handleCopyLinkedIn={handleCopyLinkedIn}
            linkedInCopyStatus={linkedInCopyStatus}
            LINKEDIN_STYLES={LINKEDIN_STYLES}
            linkedinExcludeContext={linkedinExcludeContext}
            setLinkedinExcludeContext={setLinkedinExcludeContext}
          />
        )}

        {activeTab === 'search' && (
          <GoogleAdsStudio 
            {...props}
            isSearchLoading={isSearchLoading}
            exportToCSV={exportToCSV}
            handleCopySearchAd={handleCopySearchAd}
            searchAdCopyStatus={searchAdCopyStatus}
            customSearchDirection={customSearchDirection}
            setCustomSearchDirection={setCustomSearchDirection}
            onGenerateSearchAds={props.onGenerateSearchAds}
          />
        )}

        {activeTab === 'email' && (
          <EmailMarketingStudio 
            {...props}
            isEmailLoading={isEmailLoading}
            emailAngles={emailAngles}
            activeEmailAngle={activeEmailAngle}
            setActiveEmailAngle={setActiveEmailAngle}
            activeEmailStyle={activeEmailStyle}
            setActiveEmailStyle={setActiveEmailStyle}
            customEmailDirection={customEmailDirection}
            setCustomEmailDirection={setCustomEmailDirection}
            handleCopyEmail={handleCopyEmail}
            emailCopyStatus={emailCopyStatus}
            EMAIL_STYLES={EMAIL_STYLES}
          />
        )}

        {activeTab === 'phone' && isB2B && (
            <PhoneCallStudio 
                product={product}
                language={language}
                isPhoneLoading={isPhoneLoading}
                onUpdate={(val) => props.onUpdatePhoneCampaign?.(val)}
                onGeneratePhoneScripts={async (dir) => {
                    setIsPhoneLoading(true);
                    try {
                        const context = `Product: ${product.name}. Description: ${product.description}. ICP: ${product.decisionMaker}`;
                        const result = await generatePhoneScripts(context, product.location, dir, language, 'Quality');
                        if (result && result.scripts) {
                             const currentScripts = product.phoneCampaign?.scripts || [];
                             // Changed: Place new scripts at the TOP of the list
                             props.onUpdatePhoneCampaign?.({ scripts: [...result.scripts, ...currentScripts] });
                        }
                    } catch(e) {
                        console.error(e);
                    } finally {
                        setIsPhoneLoading(false);
                    }
                }}
                customPhoneDirection={customPhoneDirection}
                setCustomPhoneDirection={setCustomPhoneDirection}
            />
        )}

        {activeTab === 'storyboard' && (
          <StoryboardStudio 
            {...props}
            isStoryboardLoading={isStoryboardLoading}
            customStoryboardDirection={customStoryboardDirection}
            setCustomStoryboardDirection={setCustomStoryboardDirection}
            onGenerateStoryboard={(style, dir) => props.onGenerateStoryboard(style, dir)}
            storyboardStyles={storyboardStyles}
            activeStoryboardStyle={activeStoryboardStyle}
            setActiveStoryboardStyle={setActiveStoryboardStyle}
            handleDownloadImage={handleDownloadImage}
            scroll={scroll}
            scrollContainerRef={scrollContainerRef}
            FoundationPicker={FoundationPicker}
            getEnergyColor={getEnergyColor}
            onRefreshScene={props.onRefreshScene!}
            onGenerateSceneImage={(num, prompt, base, storyboardId) => props.onGenerateSceneImage(num, prompt, base, storyboardId)}
            onUpdateStoryboard={(sb) => {
               if (onUpdateProduct && product.storyboards) {
                   const updated = product.storyboards.map(s => s.id === sb.id ? sb : s);
                   onUpdateProduct({ storyboards: updated });
               } else {
                   // Fallback for singular
                   onUpdateStoryboard(sb);
               }
            }}
            storyboardIgnoreContext={storyboardIgnoreContext}
            setStoryboardIgnoreContext={setStoryboardIgnoreContext}
          />
        )}

        {activeTab === 'software' && (
          <SoftwareStudio 
            product={product}
            language={language}
            isSoftwareLoading={isSoftwareLoading}
            onUpdate={(updatedData) => {
              if (onUpdateProduct) {
                onUpdateProduct(updatedData);
              }
            }}
            customSoftwareDirection={customSoftwareDirection}
            setCustomSoftwareDirection={setCustomSoftwareDirection}
            onGenerateSoftware={async (dir) => {
              setIsSoftwareLoading(true);
              try {
                const productContext = `Product: ${product.name}. Description: ${product.description}. ICP: ${product.decisionMaker}`;
                const campaignContext = product.campaignPlan
                   ? `Direction: ${product.campaignPlan.direction}. Core Message: ${product.campaignPlan.coreMessage}. Goal: ${product.campaignPlan.goal}`
                   : "";
                const result = await generateSoftwareRecommendations(productContext, campaignContext, product.location, language, 'Quality', dir);
                if (result && result.tools) {
                  const existing = product.softwareRecommendations || [];
                  const newTools = result.tools.map((t, idx) => ({ 
                    ...t, 
                    id: `tool-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`
                  }));
                  if (onUpdateProduct) {
                    onUpdateProduct({ softwareRecommendations: [...newTools, ...existing] });
                  }
                }
              } catch (e) {
                console.error("Error generating software recommendations:", e);
              } finally {
                setIsSoftwareLoading(false);
              }
            }}
          />
        )}
    </div>
  );
};