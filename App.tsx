import React, { useState, useEffect, useRef } from 'react';
import { 
  X,
  ArrowRight,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  ShieldAlert,
  ExternalLink,
  Key
} from 'lucide-react';
import { Product, StrategyStep, UniqueOffer, BigIdea, ProductType, Creative, MarketIntel, SalesPageAesthetic, SearchAdGroup, Storyboard, Scene, Language, GenerationMode, CampaignPlan, EmailCampaign, EmailStyle, LaunchBlueprint, IndustryNews, LandingPageBuilderData, BuilderSectionId, PhoneCampaign } from './types';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ProductStep } from './components/ProductStep';
import { DreamBuyerStep } from './components/DreamBuyerStep';
import { MarketIntelStep } from './components/MarketIntelStep';
import { PowerOfferStep } from './components/PowerOfferStep';
import { CampaignPlanStep } from './components/CampaignPlanStep';
import { CreativesStep } from './components/CreativesStep';
import { SalesPageStep } from './components/SalesPageStep';
import { LaunchBlueprintStep } from './components/LaunchBlueprintStep';
import { COUNTRIES } from './components/Common';
import { getTranslation } from './translations';

import { 
  generateDreamBuyerStream, 
  generateAvatarVisuals,
  generateBigIdea, 
  generateMarketPatterns,
  generateLeanCanvas,
  generateBrandReputation,
  generateCreativeText,
  generateCreativeImage,
  analyzeProductUrl,
  fetchPageMetadata,
  fileToBase64,
  generateUniqueOffer,
  imageUrlToBase64,
  generateSalesPage,
  generateSearchAds,
  generateStoryboard,
  generateCampaignPlan,
  generateEmailCampaign,
  generateLaunchBlueprint,
  fetchIndustryNewsStream,
  generateLinkedInPost,
  refreshStoryboardScene
} from './services/geminiService';
import { generateCompetitorAnalysis, generatePricingSuggestions } from './services/competitorService';
import { generateLandingPageCopy } from './services/salesPageCopyService';
import { analyzeDesignReferences, generateVibecodingPrompt, generateElementorCode, generateElementorSiteSettings, DesignSettings, BrandKitAnalysis } from './services/designService';

const initialProduct: Product = {
  id: '1',
  name: 'Sample Product',
  type: 'Physical',
  description: 'A premium coffee subscription for remote workers.',
  websiteUrl: '',
  images: [],
  audienceType: null,
  location: 'United States',
  decisionMaker: '',
  goal: '',
  creatives: [],
  searchAds: [],
  storyboards: [],
  lastUpdated: Date.now()
};

function App() {
  const [products, setProducts] = useState<Product[]>([initialProduct]);
  const [activeProductId, setActiveProductId] = useState<string>(initialProduct.id);
  const [activeStep, setActiveStep] = useState<StrategyStep>('product');
  const [language, setLanguage] = useState<Language>('pt'); // Defaulting to PT as requested
  const [generationMode, setGenerationMode] = useState<GenerationMode>('Fast');
  const [analyzingUrl, setAnalyzingUrl] = useState(false);
  const [analyzingBrand, setAnalyzingBrand] = useState(false); // New state for brand analysis loading
  const [urlError, setUrlError] = useState<string | null>(null);
  const [urlSuccess, setUrlSuccess] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [taskQueue, setTaskQueue] = useState<Set<string>>(new Set());
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [validationTrigger, setValidationTrigger] = useState(0);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  const [intelError, setIntelError] = useState<string | null>(null);
  
  // Mobile Menu State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Ref to track latest products state for async handlers to avoid stale closures
  const productsRef = useRef(products);
  productsRef.current = products;
  
  const activeProduct = products.find(p => p.id === activeProductId) || products[0];
  const t = getTranslation(language);

  const steps: { id: StrategyStep; label: string; }[] = [
    { id: 'product', label: t.steps.product },
    { id: 'dream_buyer', label: t.steps.dream_buyer },
    { id: 'market_intel', label: t.steps.market_intel },
    { id: 'campaign_plan', label: t.steps.campaign_plan },
    { id: 'offer', label: t.steps.offer },
    { id: 'creatives', label: t.steps.creatives },
    { id: 'sales_page', label: t.steps.sales_page },
    { id: 'blueprint', label: t.steps.blueprint },
  ];

  useEffect(() => {
    const checkKey = async () => {
      if ((window as any).aistudio) {
        const has = await (window as any).aistudio.hasSelectedApiKey();
        setHasApiKey(has);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if ((window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const updateProduct = (updates: Partial<Product> | ((prev: Product) => Partial<Product>), targetId?: string) => {
    const pid = targetId || activeProductId;
    setProducts(prev => prev.map(p => {
      if (p.id === pid) {
        const up = typeof updates === 'function' ? updates(p) : updates;
        return { ...p, ...up, lastUpdated: Date.now() };
      }
      return p;
    }));
  };

  const addTask = (key: string) => setTaskQueue(prev => new Set(prev).add(key));
  const removeTask = (key: string) => setTaskQueue(prev => {
    const next = new Set(prev);
    next.delete(key);
    return next;
  });

  const handleAddProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString(),
      name: 'New Product',
      type: 'Physical',
      description: '',
      websiteUrl: '',
      images: [],
      audienceType: null,
      location: 'United States',
      decisionMaker: '',
      goal: '',
      creatives: [],
      searchAds: [],
      storyboards: [],
      lastUpdated: Date.now()
    };
    setProducts([...products, newProduct]);
    setActiveProductId(newProduct.id);
    setActiveStep('product');
    setShowValidation(false);
    setIsMobileMenuOpen(false); // Close menu on mobile after adding
    setIntelError(null);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => {
      const remaining = prev.filter(p => p.id !== id);
      if (remaining.length === 0) {
         // Fallback to initial state if list becomes empty
         const newId = Date.now().toString();
         setActiveProductId(newId);
         return [{...initialProduct, id: newId, lastUpdated: Date.now()}];
      }
      if (activeProductId === id) {
        // If deleting active, switch to first available
        setActiveProductId(remaining[0].id);
      }
      return remaining;
    });
  };

  const handleTogglePin = (id: string) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isPinned: !p.isPinned } : p));
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(products, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `market_hero_data_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsedProducts = JSON.parse(json);
        if (Array.isArray(parsedProducts)) {
            if (parsedProducts.length > 0 && parsedProducts[0].id) {
                setProducts(parsedProducts);
                setActiveProductId(parsedProducts[0].id);
                alert("Data imported successfully!");
            } else { alert("Invalid file format."); }
        } else { alert("Invalid file format."); }
      } catch (err) { alert("Failed to parse JSON file."); }
    };
    reader.readAsText(file);
    e.target.value = ""; 
  };

  const handleUrlAnalysis = async () => {
    const url = activeProduct.websiteUrl;
    if (!url) { setUrlError("Please enter a URL."); return; }
    let validUrl = url;
    try {
        if (!url.startsWith('http://') && !url.startsWith('https://')) { validUrl = `https://${url}`; }
        new URL(validUrl);
    } catch (_) { setUrlError("Please enter a valid URL."); return; }
    setAnalyzingUrl(true);
    setUrlError(null); 
    setUrlSuccess(false);
    if (validUrl !== url) { updateProduct({ websiteUrl: validUrl }); }
    try {
      const metaResult = await fetchPageMetadata(validUrl);
      
      // Pass the metaResult explicitly to the analysis function
      const geminiResult = await analyzeProductUrl(validUrl, language, generationMode, {
        title: metaResult?.title,
        description: metaResult?.description
      });
      
      const updates: Partial<Product> = {};
      if (metaResult) {
          const candidateImage = metaResult.image?.url || metaResult.logo?.url || metaResult.screenshot?.url;
          if (candidateImage) {
              const base64Image = await imageUrlToBase64(candidateImage);
              if (base64Image) { updates.images = [base64Image]; }
          }
      }
      if (geminiResult) {
          let matchedLocation = geminiResult.location;
          if (matchedLocation) {
              const found = COUNTRIES.find(c => c.toLowerCase() === matchedLocation.toLowerCase() || matchedLocation.toLowerCase().includes(c.toLowerCase()));
              if (found) matchedLocation = found;
              else matchedLocation = "Global";
          } else { matchedLocation = "Global"; }
          updates.name = geminiResult.name;
          updates.description = geminiResult.description;
          updates.decisionMaker = geminiResult.decisionMaker;
          updates.location = matchedLocation;
          const supportedGoals = ['Increase Sales', 'Launch Product', 'Generate Leads', 'Brand Awareness'];
          const foundGoal = supportedGoals.find(g => geminiResult.goal && (g.toLowerCase().includes(geminiResult.goal.toLowerCase()) || geminiResult.goal.toLowerCase().includes(g.toLowerCase())));
          if (foundGoal) updates.goal = foundGoal;
          else updates.goal = supportedGoals[0];
          const supportedAudiences = ['B2B', 'B2C', 'Both'];
          const foundAudience = supportedAudiences.find(a => geminiResult.audienceType && (a.toLowerCase() === geminiResult.audienceType.toLowerCase() || geminiResult.audienceType.toLowerCase().includes(a.toLowerCase())));
          if (foundAudience) updates.audienceType = foundAudience as any;
          else updates.audienceType = 'B2C';
          if (geminiResult.type) {
              const PRODUCT_TYPES: ProductType[] = ['Physical', 'Digital', 'Service', 'Event', 'Subscription', 'Software', 'Other'];
              const foundType = PRODUCT_TYPES.find(t => t.toLowerCase() === geminiResult.type.toLowerCase());
              if (foundType) updates.type = foundType;
          }
      }
      if (geminiResult || metaResult) {
          updateProduct(updates);
          setUrlSuccess(true);
          setTimeout(() => setUrlSuccess(false),4000);
      } else { setUrlError("Unable to analyze this page."); }
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) { setHasApiKey(false); }
      setUrlError("API Error occurred.");
    } finally { setAnalyzingUrl(false); }
  };

  const processNewImages = async (files: File[], targetProductId?: string) => {
      try {
          const newImages = await Promise.all(files.map(f => fileToBase64(f as Blob)));
          const pid = targetProductId || activeProductId;
          
          const currentProduct = productsRef.current.find(p => p.id === pid);
          const currentImages = currentProduct ? currentProduct.images : [];
          const combinedImages = [...currentImages, ...newImages];

          updateProduct({ images: combinedImages }, pid);

          // Auto-Analyze Brand Kit if mainly uploading product images (not specific creative target)
          if (!targetProductId || targetProductId === activeProductId) {
              setAnalyzingBrand(true);
              // Perform background analysis without blocking UI
              analyzeDesignReferences(combinedImages).then(analysis => {
                  if (analysis) {
                      // Fixed: satisfy BrandKit interface by renaming fontPairingRecommendation to fontHeadline
                      updateProduct(prev => ({
                          brandKit: {
                              colors: analysis.colors,
                              fontHeadline: analysis.fontPairingRecommendation,
                              fontBody: "Modern Sans",
                              tone: analysis.suggestion
                          }
                      }), pid);
                  }
              }).catch(e => console.error("Auto brand analysis failed", e))
              .finally(() => setAnalyzingBrand(false));
          }

          return newImages[0];
      } catch (err) { console.error(err); return null; }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetProductId?: string) => {
      if (e.target.files && e.target.files.length > 0) {
          const files = Array.from(e.target.files) as File[];
          return processNewImages(files, targetProductId);
      }
      return null;
  };

  const handleRemoveImage = (imgUrl: string, targetId?: string) => {
    const pid = targetId || activeProductId;
    updateProduct(prev => {
        const newImages = prev.images.filter(i => i !== imgUrl);
        // If all images are removed, also clear the brand kit
        return { 
            images: newImages,
            brandKit: newImages.length === 0 ? undefined : prev.brandKit
        };
    }, pid);
  };

  const handleGenerateBuyer = async (productId: string, focus?: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const buyerCtx = p.dreamBuyer ? JSON.stringify(p.dreamBuyer) : null;
    updateProduct({ dreamBuyer: undefined }, productId);
    const textTaskKey = `buyer-text-gen-${productId}`;
    addTask(textTaskKey);
    try {
        let finalResult = null;
        await generateDreamBuyerStream(
            `Product: ${p.name}. Description: ${p.description}. Location: ${p.location}. Goal: ${p.goal}. Decision Maker Profile: ${p.decisionMaker}`,
            buyerCtx,
            language,
            generationMode,
            (partial) => updateProduct(prev => ({ dreamBuyer: { ...partial, avatarUrl: undefined, avatarOptions: [] } }), productId),
            focus
        ).then(res => { finalResult = res; });
        if (finalResult) {
            updateProduct(prev => ({ dreamBuyer: { ...finalResult, avatarUrl: undefined, avatarOptions: [] } }), productId);
            const visualTaskKey = `buyer-visual-gen-${productId}`;
            addTask(visualTaskKey);
            try {
                const descToUse = finalResult.physicalDescription || `${finalResult.name} in their ${finalResult.ageRange}, ${finalResult.occupation}. Professional look.`;
                const visuals = await generateAvatarVisuals(descToUse, p.name);
                if (visuals && visuals.length > 0) {
                    updateProduct(prev => ({
                        dreamBuyer: prev.dreamBuyer ? { ...prev.dreamBuyer, avatarOptions: visuals, avatarUrl: visuals[0] } : undefined
                    }), productId);
                }
            } finally { removeTask(visualTaskKey); }
        }
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasApiKey(false);
      console.error(err);
    } finally { removeTask(textTaskKey); }
  };

  const handleMarketAnalysis = async (productId: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const groundedIdentity = `${p.name} ${p.websiteUrl ? '(' + p.websiteUrl + ')' : ''}`;
    const groundedDescription = `${p.description}. Product Category: ${p.type}. Industry Context: ${p.goal}.`;
    
    // Explicitly pass type context to competitor service
    const productTypeContext = p.type || "General";

    updateProduct({ marketIntel: { workingNow: [], saturated: [], opportunities: [], competitors: [], lastAnalyzed: Date.now() } }, productId);
    const baseKey = `intel-gen-${productId}`;
    const subTasks = ['patterns', 'canvas', 'brand', 'competitors', 'pricing'];
    addTask(baseKey);
    subTasks.forEach(task => addTask(`${baseKey}-${task}`));
    setIntelError(null);

    const tasks = [
        generateMarketPatterns(groundedIdentity, groundedDescription, p.location || "Global", language, generationMode).then(res => {
            if (res) updateProduct(prev => ({ marketIntel: { ...(prev.marketIntel as MarketIntel), workingNow: res.workingNow || [], saturated: res.saturated || [], opportunities: res.opportunities || [] } }), productId);
        }).finally(() => removeTask(`${baseKey}-patterns`)),
        generateLeanCanvas(groundedIdentity, groundedDescription, language, generationMode).then(res => {
            if (res) updateProduct(prev => ({ marketIntel: { ...(prev.marketIntel as MarketIntel), leanCanvas: res } }), productId);
        }).finally(() => removeTask(`${baseKey}-canvas`)),
        generateBrandReputation(groundedIdentity, p.websiteUrl || "", language, generationMode).then(res => {
            if (res) updateProduct(prev => ({ marketIntel: { ...(prev.marketIntel as MarketIntel), ownBrandInsights: res } }), productId);
        }).finally(() => removeTask(`${baseKey}-brand`)),
        generateCompetitorAnalysis(p.name, p.description, productTypeContext, p.location || "Global", language, generationMode).then(async (res) => {
            if (res && res.competitors) {
              const validComps = Array.isArray(res.competitors) ? res.competitors : [];
              updateProduct(prev => ({ marketIntel: { ...(prev.marketIntel as MarketIntel), competitors: validComps } }), productId);
              removeTask(`${baseKey}-competitors`);
              const prRes = await generatePricingSuggestions(p.name, p.description, productTypeContext, p.location || "Global", validComps, language, generationMode);
              if (prRes) updateProduct(prev => ({ marketIntel: { ...(prev.marketIntel as MarketIntel), pricingSuggestions: prRes } }), productId);
              removeTask(`${baseKey}-pricing`);
            } else {
              removeTask(`${baseKey}-competitors`);
              removeTask(`${baseKey}-pricing`);
            }
        })
    ];
    Promise.allSettled(tasks).finally(() => {
        removeTask(baseKey);
        subTasks.forEach(task => removeTask(`${baseKey}-${task}`));
    });
  };

  const handleRefreshMarketPart = async (productId: string, part: 'patterns' | 'canvas' | 'brand' | 'pricing') => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    
    const groundedIdentity = `${p.name} ${p.websiteUrl ? '(' + p.websiteUrl + ')' : ''}`;
    const groundedDescription = `${p.description}. Product Category: ${p.type}. Industry Context: ${p.goal}.`;
    const productTypeContext = p.type || "General";

    const taskKey = `intel-gen-${productId}-${part}`;
    addTask(taskKey);

    try {
        if (part === 'patterns') {
             const res = await generateMarketPatterns(groundedIdentity, groundedDescription, p.location || "Global", language, generationMode);
             if (res) updateProduct(prev => ({ marketIntel: { ...(prev.marketIntel as MarketIntel), workingNow: res.workingNow || [], saturated: res.saturated || [], opportunities: res.opportunities || [] } }), productId);
        }
        if (part === 'canvas') {
             const res = await generateLeanCanvas(groundedIdentity, groundedDescription, language, generationMode);
             if (res) updateProduct(prev => ({ marketIntel: { ...(prev.marketIntel as MarketIntel), leanCanvas: res } }), productId);
        }
        if (part === 'brand') {
             const res = await generateBrandReputation(groundedIdentity, p.websiteUrl || "", language, generationMode);
             if (res) updateProduct(prev => ({ marketIntel: { ...(prev.marketIntel as MarketIntel), ownBrandInsights: res } }), productId);
        }
        if (part === 'pricing') {
             const validComps = p.marketIntel?.competitors || [];
             const res = await generatePricingSuggestions(p.name, p.description, productTypeContext, p.location || "Global", validComps, language, generationMode);
             if (res) updateProduct(prev => ({ marketIntel: { ...(prev.marketIntel as MarketIntel), pricingSuggestions: res } }), productId);
        }
    } catch(e) {
        console.error(e);
    } finally {
        removeTask(taskKey);
    }
  }

  const handleDeleteCompetitor = (productId: string, idx: number) => {
    updateProduct(prev => {
        if (!prev.marketIntel?.competitors) return {};
        const newComps = [...prev.marketIntel.competitors];
        newComps.splice(idx, 1);
        return { marketIntel: { ...prev.marketIntel, competitors: newComps } };
    }, productId);
  };

  const handleRefreshOfferPart = async (productId: string, part: 'offer' | 'bigIdea', focus?: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const taskKey = `offer-gen-${productId}-${part}`;
    addTask(taskKey);
    
    const focusContext = focus ? `\n\nSTRATEGIC FOCUS: ${focus}\n\n` : "";
    const buyerCtx = p.dreamBuyer ? JSON.stringify(p.dreamBuyer) : "";

    try {
        if (part === 'bigIdea') {
            const res = await generateBigIdea(`${focusContext}${p.description}`, buyerCtx, p.location, language, generationMode);
            if (res) updateProduct({ bigIdea: res }, productId);
        }
        if (part === 'offer') {
            const ideaCtx = p.bigIdea ? JSON.stringify(p.bigIdea) : "";
            const res = await generateUniqueOffer(`${focusContext}${p.description}`, buyerCtx, ideaCtx, p.location, language, generationMode);
            if (res) updateProduct({ offer: res }, productId);
        }
    } catch(e) {
        console.error(e);
    } finally {
        removeTask(taskKey);
    }
  }

  const handleCancelMarketAnalysis = (productId: string) => {
    const baseKey = `intel-gen-${productId}`;
    const subTasks = ['patterns', 'canvas', 'brand', 'competitors', 'pricing'];
    removeTask(baseKey);
    subTasks.forEach(task => removeTask(`${baseKey}-${task}`));
  };

  const handleGenerateCampaignPlanTask = async (productId: string, focus?: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const taskKey = `plan-gen-${productId}`;
    addTask(taskKey);
    try {
        const focusContext = focus ? `\n\nCRITICAL STRATEGIC DIRECTION: ${focus}\n\n` : "";
        const fullContext = `${focusContext}Product: ${p.name}. Description: ${p.description}. Audience: ${p.decisionMaker}. Big Idea: ${p.bigIdea?.tagline}. Offer: ${p.offer?.headline}`;
        const result = await generateCampaignPlan(fullContext, p.location, p.type || "Other", language, generationMode);
        if (result) updateProduct({ campaignPlan: result }, productId);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasApiKey(false);
      console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleSeeMoreCompetitors = async (productId: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p || !p.marketIntel) return;
    const taskKey = `intel-more-${productId}`;
    addTask(taskKey);
    setIntelError(null);

    const productTypeContext = p.type || "General";
    try {
        const currentCount = p.marketIntel.competitors?.length || 0;
        const moreRes = await generateCompetitorAnalysis(
            p.name, 
            p.description, 
            productTypeContext, 
            p.location || "Global", 
            language, 
            generationMode, 
            currentCount
        );
        
        if (moreRes && Array.isArray(moreRes.competitors) && moreRes.competitors.length > 0) {
            updateProduct(prev => {
                const currentIntel = prev.marketIntel;
                if (!currentIntel) return {};
                
                const existing = currentIntel.competitors || [];
                const newComps = moreRes.competitors;
                
                // Filter duplicates by name
                const existingNames = new Set(existing.map((c: any) => c.name?.toLowerCase()));
                const uniqueNew = newComps.filter((c: any) => !existingNames.has(c.name?.toLowerCase()));
                
                if (uniqueNew.length === 0) {
                    setIntelError("No new unique competitors found.");
                    return {};
                }

                return { 
                    marketIntel: { 
                        ...currentIntel, 
                        competitors: [...existing, ...uniqueNew] 
                    } 
                };
            }, productId);
        } else {
            setIntelError("No additional competitors found.");
        }
    } catch (e) {
        console.error(e);
        setIntelError("Failed to load more competitors.");
    } finally { 
        removeTask(taskKey); 
    }
  };

  const handleGenerateOfferAndBigIdea = async (productId: string, focus?: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const taskKey = `full-offer-gen-${productId}`;
    addTask(taskKey);
    try {
        const focusContext = focus ? `\n\nSTRATEGIC FOCUS: ${focus}\n\n` : "";
        const buyerCtx = p.dreamBuyer ? JSON.stringify(p.dreamBuyer) : "";
        const ideaResult = await generateBigIdea(`${focusContext}${p.description}`, buyerCtx, p.location, language, generationMode);
        if (ideaResult) updateProduct({ bigIdea: ideaResult }, productId);
        const ideaCtx = ideaResult ? JSON.stringify(ideaResult) : "";
        const offerResult = await generateUniqueOffer(`${focusContext}${p.description}`, buyerCtx, ideaCtx, p.location, language, generationMode);
        if (offerResult) updateProduct({ offer: offerResult }, productId);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasApiKey(false);
      console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleGenerateCreative = async (productId: string, style: Creative['style'], customDirection?: string, existingId?: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    
    const taskKey = existingId ? `creative-refresh-text-${existingId}` : `creative-gen-${productId}`;
    addTask(taskKey);
    
    let strategicPillar = "";
    if (style === 'Unique-Mechanism') strategicPillar = p.bigIdea?.uniqueMechanismDescription || p.bigIdea?.uniqueMechanism || "";
    else if (style === 'Emotional-Driver') strategicPillar = p.bigIdea?.emotionalDriver || "";
    else if (style === 'Viral-Angle') strategicPillar = p.bigIdea?.viralStrategy || "";

    const userDirectionContext = customDirection ? `\n\nUSER SPECIFIC DIRECTION: ${customDirection}\n\n` : "";

    try {
        // Strict whitelist context to prevent leakage if Raw Mode is active (default)
        let contextPayload = "";
        
        // "Raw Mode" is active if excludeBuyerContext is TRUE or UNDEFINED
        if (p.creativeSettings?.excludeBuyerContext !== false) {
             const rawProduct = {
                name: p.name,
                description: p.description,
                type: p.type,
                location: p.location,
                website: p.websiteUrl,
                images: p.images
             };
             contextPayload = JSON.stringify(rawProduct);
        } else {
             contextPayload = JSON.stringify(p);
        }

        const context = userDirectionContext + contextPayload;
        // Added: isRefresh flag (last argument)
        const result = await generateCreativeText(context, style, p.location, language, generationMode, strategicPillar, !!existingId);
        if (result) {
            if (existingId) {
                updateProduct(prev => ({ creatives: prev.creatives.map(c => c.id === existingId ? { ...c, ...result } : c) }), productId);
            } else {
                const newId = Date.now().toString();
                // Get globally selected images or fallback
                // NOTE: metaBaseImages is preferred (array). Fallback to metaBaseImage (string legacy).
                const settings = p.creativeSettings;
                const defaultBase = settings?.metaBaseImages && settings.metaBaseImages.length > 0 
                    ? settings.metaBaseImages 
                    : (settings?.metaBaseImage ? [settings.metaBaseImage] : (p.images.length > 0 ? [p.images[0]] : []));
                
                const shotType = p.creativeSettings?.metaShotType || "Medium Shot";
                
                const newCreative: Creative = { id: newId, style, ...result, selectedBaseImages: defaultBase, shotType: shotType };
                updateProduct(prev => ({ creatives: [newCreative, ...prev.creatives] }), productId);
                const sanitizedPrompt = (result.visualPrompt || "Professional product shot").replace(/["']/g, "").substring(0, 450);
                
                // Pass brandKit to ensure visual DNA is used if base image is missing
                handleGenerateCreativeImageTask(productId, newId, sanitizedPrompt, defaultBase, shotType, style);
            }
        }
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasApiKey(false);
      console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleGenerateSearchAdsTask = async (productId: string, customDirection?: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const taskKey = `search-ads-gen-${productId}`;
    addTask(taskKey);
    try {
      // Clean context to ensure fresh generation based on direction
      const productContext = { ...p };
      delete (productContext as any).searchAds; // Remove existing ads so AI doesn't just copy them
      delete (productContext as any).creatives; // Remove social creatives to focus purely on search intent

      const result = await generateSearchAds(JSON.stringify(productContext), p.location, language, generationMode, customDirection);
      if (result && result.adGroups) {
          // Prepend new ad groups instead of replacing
          updateProduct(prev => ({ 
              searchAds: [...result.adGroups, ...(prev.searchAds || [])] 
          }), productId);
      }
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasApiKey(false);
      console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleGenerateEmailCampaignTask = async (productId: string, category: string, style: EmailStyle, customDirection?: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const taskKey = `email-gen-${productId}`;
    addTask(taskKey);
    try {
      const userDirectionContext = customDirection ? `\n\nUSER SPECIFIC DIRECTION: ${customDirection}\n\n` : "";
      const result = await generateEmailCampaign(userDirectionContext + JSON.stringify(p), p.location, p.type || "Other", category, style, language, generationMode);
      if (result) {
        updateProduct(prev => {
          // Changed: We no longer append currentEmails to newEmails.
          // Clicking "Update" now replaces the sequence entirely to provide a fresh batch of copy.
          return { 
            emailCampaign: { 
              ...result, 
              style, 
              emails: result.emails || [] 
            } 
          };
        }, productId);
      }
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasApiKey(false);
      console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleGenerateStoryboardTask = async (productId: string, style: string, customDirection?: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const taskKey = `storyboard-gen-${productId}`;
    addTask(taskKey);
    try {
      const styleContext = `\n\nSTORYBOARD STYLE: ${style}\nCreate the script specifically using this angle/format.\n\n`;
      const userDirectionContext = customDirection ? `\n\nUSER SPECIFIC DIRECTION: ${customDirection}\n\n` : "";
      
      // Strict whitelist context to prevent leakage if Raw Mode is active (default)
      let contextPayload = "";
      
      // "Raw Mode" is active if storyboardIgnoreContext is TRUE or UNDEFINED
      if (p.creativeSettings?.storyboardIgnoreContext !== false) {
           const rawProduct = {
              name: p.name,
              description: p.description,
              type: p.type,
              location: p.location,
              website: p.websiteUrl,
              images: p.images
           };
           contextPayload = JSON.stringify(rawProduct);
      } else {
           contextPayload = JSON.stringify(p);
      }

      const result = await generateStoryboard(styleContext + userDirectionContext + contextPayload, p.location, language, generationMode);
      if (result) {
        const defaultBase = p.images[0];
        const sb: Storyboard = { ...result, id: Date.now().toString(), scenes: result.scenes.map((s: any) => ({ ...s, selectedBaseImage: defaultBase })) };
        
        // Add new storyboard to the list (prepend for newest first)
        updateProduct(prev => ({ 
            storyboards: [sb, ...(prev.storyboards || [])] 
        }), productId);
      }
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasApiKey(false);
      console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleGenerateSceneImageTask = async (productId: string, storyboardId: string, sceneNumber: number, prompt: string, baseImage?: string) => {
    const taskKey = `scene-img-gen-${sceneNumber}`;
    addTask(taskKey);
    try {
      const sanitizedPrompt = (prompt || "Cinematic scene").replace(/["']/g, "").substring(0, 450);
      const resultUrl = await generateCreativeImage(sanitizedPrompt, baseImage);
      if (resultUrl) {
        updateProduct(prev => ({
          storyboards: prev.storyboards?.map(sb => {
              if (sb.id === storyboardId) {
                  return {
                      ...sb,
                      scenes: sb.scenes.map(s => s.number === sceneNumber ? { ...s, imageUrl: resultUrl } : s)
                  }
              }
              return sb;
          })
        }), productId);
      }
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasApiKey(false);
      console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleGenerateCreativeImageTask = async (productId: string, creativeId: string, prompt: string, baseImage?: string | string[], composition?: string, style?: string) => {
    const taskKey = `image-gen-${creativeId}`;
    addTask(taskKey);
    
    const p = productsRef.current.find(prod => prod.id === productId);
    
    try {
        const sanitizedPrompt = (prompt || "Professional product visualization").replace(/["']/g, "").substring(0, 450);
        
        // Pass brandKit to ensure we generate on-brand visuals even if baseImage is missing
        // Pass language explicitly for text generation inside images
        const resultUrl = await generateCreativeImage(sanitizedPrompt, baseImage, undefined, composition, p?.brandKit, style, language);
        
        if (resultUrl) {
            updateProduct(prev => ({ 
              creatives: prev.creatives.map(c => c.id === creativeId ? { ...c, imageUrl: resultUrl, shotType: composition || c.shotType } : c) 
            }), productId);
        }
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasApiKey(false);
      console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleGenerateSalesPageTask = async (productId: string, preferredAesthetic?: SalesPageAesthetic) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const taskKey = `sales-page-gen-${productId}`;
    addTask(taskKey);
    try {
        const result = await generateSalesPage(JSON.stringify(p), language, generationMode, preferredAesthetic);
        if (result) updateProduct({ salesPage: result }, productId);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasApiKey(false);
      console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleGenerateBuilderCopy = async (productId: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;

    const defaultBuilderData: LandingPageBuilderData = {
        selectedSections: ['header', 'hero', 'numbers_bar', 'intro_pain', 'solution', 'features', 'categories', 'who_transformation', 'comparison_vs', 'process', 'offer', 'full_width_cta', 'lead_form', 'social_proof', 'about_author', 'faq', 'footer_contact'],
        tone: 'Direct Response',
        language: language,
        creativityLevel: 0.5,
        includeStrategy: false,
        copy: {},
        customDirection: ''
    };

    const builderData = p.lpBuilderData || defaultBuilderData;
    const taskKey = `lp-builder-gen-${productId}`;
    addTask(taskKey);

    const includeStrategy = builderData.includeStrategy;

    try {
        const copy = await generateLandingPageCopy(
            {
                name: p.name,
                description: p.description,
                decisionMaker: p.decisionMaker,
                goal: p.goal,
                bigIdea: includeStrategy ? p.bigIdea : undefined,
                offer: includeStrategy ? p.offer : undefined 
            },
            builderData.selectedSections,
            builderData.tone,
            builderData.creativityLevel,
            builderData.language || language,
            builderData.customDirection
        );

        updateProduct(prev => ({
            lpBuilderData: {
                ...builderData,
                ...prev.lpBuilderData,
                copy: copy
            }
        }), productId);
    } catch (e) {
        console.error(e);
    } finally {
        removeTask(taskKey);
    }
  };

  const handleRefreshBuilderSection = async (productId: string, sectionId: BuilderSectionId) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;

    const builderData = p.lpBuilderData;
    if (!builderData) return;

    const taskKey = `lp-refresh-${productId}-${sectionId}`;
    addTask(taskKey);

    const includeStrategy = builderData.includeStrategy;

    try {
        const partialCopy = await generateLandingPageCopy(
            {
                name: p.name,
                description: p.description,
                decisionMaker: p.decisionMaker,
                goal: p.goal,
                bigIdea: includeStrategy ? p.bigIdea : undefined,
                offer: includeStrategy ? p.offer : undefined
            },
            [sectionId],
            builderData.tone,
            builderData.creativityLevel,
            builderData.language || language,
            builderData.customDirection
        );

        if (partialCopy && partialCopy[sectionId]) {
             updateProduct(prev => ({
                lpBuilderData: {
                    ...prev.lpBuilderData!,
                    copy: {
                        ...prev.lpBuilderData!.copy,
                        [sectionId]: partialCopy[sectionId]
                    }
                }
            }), productId);
        }
    } catch (e) {
        console.error(e);
    } finally {
        removeTask(taskKey);
    }
  };

  const handleGenerateDesignAssets = async (productId: string, type: 'vibecoding' | 'elementor', settings: DesignSettings, brandKit?: BrandKitAnalysis) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;

    // Filter copy data to include only selected sections
    const builderData = p.lpBuilderData;
    const selectedSections = builderData?.selectedSections || [];
    const fullCopy = builderData?.copy || {};
    
    const filteredCopy: any = {};
    
    // Always keep designRecommendation if it exists as it is needed for internal logic
    if (fullCopy.designRecommendation) {
        filteredCopy.designRecommendation = fullCopy.designRecommendation;
    }

    // Only copy sections that are selected in the builder
    selectedSections.forEach(sectionId => {
        if (fullCopy[sectionId]) {
            filteredCopy[sectionId] = fullCopy[sectionId];
        }
    });

    const taskKey = `design-gen-${productId}-${type}`;
    addTask(taskKey);

    try {
        if (type === 'vibecoding') {
            const prompt = await generateVibecodingPrompt(settings, filteredCopy, p.name, builderData?.language || language, brandKit);
            updateProduct(prev => ({
                designDirectorData: {
                    ...(prev.designDirectorData || { settings }),
                    settings, 
                    brandKit,
                    generatedPrompt: prompt
                }
            }), productId);
        } else {
            const [json, settingsJson] = await Promise.all([
                generateElementorCode(settings, filteredCopy, p.name, brandKit),
                generateElementorSiteSettings(settings, p.name, brandKit)
            ]);
            updateProduct(prev => ({
                designDirectorData: {
                    ...(prev.designDirectorData || { settings }),
                    settings, 
                    brandKit,
                    generatedElementorJson: json,
                    generatedSiteSettingsJson: settingsJson
                }
            }), productId);
        }
    } catch (e) {
        console.error(e);
    } finally {
        removeTask(taskKey);
    }
  };

  const handleGenerateBlueprintTask = async (productId: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const taskKey = `blueprint-gen-${productId}`;
    addTask(taskKey);
    try {
        const result = await generateLaunchBlueprint(JSON.stringify(p), language, generationMode);
        if (result) updateProduct({ launchBlueprint: result }, productId);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) setHasApiKey(false);
      console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleFetchIndustryNews = async (productId: string, isLoadMore = false) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const taskKey = `news-fetch-${productId}`;
    addTask(taskKey);
    if (!isLoadMore) {
        updateProduct({ industryNews: [] }, productId);
    }
    
    try {
        const buyerContext = p.dreamBuyer ? `ICP Role: ${p.dreamBuyer.occupation}. Industry: ${p.dreamBuyer.archetype}` : "B2B Decision Makers";
        const productContext = `Product: ${p.name}. Niche: ${p.description}. Type: ${p.type}`;
        const existingHeadlines = isLoadMore && p.industryNews ? p.industryNews.map(n => n.title) : [];

        await fetchIndustryNewsStream(
            p.type || "Business", 
            p.location, 
            language, 
            productContext, 
            buyerContext, 
            (newsChunk) => {
                updateProduct(prev => {
                    const existingIds = new Set(prev.industryNews?.map(n => n.id));
                    const newItems = newsChunk.filter(n => !existingIds.has(n.id));
                    if (newItems.length === 0) return {};
                    return { industryNews: [...(prev.industryNews || []), ...newItems] };
                }, productId);
            },
            existingHeadlines
        );
    } catch (err: any) {
        console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleGenerateLinkedInPost = async (productId: string, newsItem: IndustryNews | null, style: string, customDirection?: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const taskKey = `linkedin-gen-${productId}`;
    addTask(taskKey);
    try {
        const userDirectionContext = customDirection ? `\n\nUSER SPECIFIC DIRECTION: ${customDirection}\n\n` : "";
        
        let productContext = "";
        let buyerContext = "";

        // Check for Raw Mode (Defaulting to TRUE if undefined, similar to Meta)
        const isRawMode = p.creativeSettings?.linkedinExcludeContext !== false;

        if (isRawMode) {
             // Raw Product Data
             const rawProduct = {
                name: p.name,
                description: p.description,
                type: p.type,
                location: p.location,
                website: p.websiteUrl
             };
             productContext = userDirectionContext + `PRODUCT DATA: ${JSON.stringify(rawProduct)}`;
             buyerContext = "Target Audience: General B2B Decision Makers (Context Ignored)";
        } else {
             // Full Strategy Context
             productContext = userDirectionContext + `Product: ${p.name}. Description: ${p.description}. Big Idea: ${JSON.stringify(p.bigIdea)}`;
             buyerContext = p.dreamBuyer ? JSON.stringify(p.dreamBuyer) : "Target Audience: B2B Decision Makers";
        }

        const result = await generateLinkedInPost(productContext, buyerContext, newsItem, language, generationMode, style);
        if (result) {
            const newPost = { ...result, id: Date.now().toString(), linkedNewsId: newsItem?.id };
            updateProduct(prev => ({ linkedinPosts: [newPost, ...(prev.linkedinPosts || [])] }), productId);
        }
    } catch (err: any) {
        console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleRefreshLinkedInPost = async (productId: string, postId: string, category: string, linkedNewsId?: string) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p) return;
    const taskKey = `linkedin-gen-${productId}`;
    addTask(taskKey);
    try {
        const newsItem = linkedNewsId ? p.industryNews?.find(n => n.id === linkedNewsId) || null : null;
        const productContext = `Product: ${p.name}. Description: ${p.description}`;
        const buyerContext = p.dreamBuyer ? JSON.stringify(p.dreamBuyer) : "Target Audience: B2B Decision Makers";
        const result = await generateLinkedInPost(productContext, buyerContext, newsItem, language, generationMode, category);
        if (result) {
            updateProduct(prev => ({
                linkedinPosts: prev.linkedinPosts?.map(post => 
                    post.id === postId ? { ...post, hook: result.hook, content: result.content } : post
                )
            }), productId);
        }
    } catch (err: any) {
        console.error(err);
    } finally { removeTask(taskKey); }
  };

  const handleDeleteLinkedInPost = (postId: string) => {
    const p = productsRef.current.find(prod => prod.id === activeProductId);
    if (!p) return;
    updateProduct(prev => ({
        linkedinPosts: prev.linkedinPosts?.filter(post => post.id !== postId)
    }), activeProductId);
  };

  const handleRefreshSceneTask = async (productId: string, storyboardId: string, sceneNumber: number) => {
    const p = productsRef.current.find(prod => prod.id === productId);
    if (!p || !p.storyboards) return;
    
    // Find storyboard
    const storyboard = p.storyboards.find(sb => sb.id === storyboardId);
    if (!storyboard) return;

    const scene = storyboard.scenes.find(s => s.number === sceneNumber);
    if (!scene) return;

    const taskKey = `scene-refresh-${sceneNumber}`;
    addTask(taskKey);

    try {
        const newSceneData = await refreshStoryboardScene(JSON.stringify(p), scene, p.location, language, generationMode);
        if (newSceneData) {
            updateProduct(prev => ({
                storyboards: prev.storyboards?.map(sb => {
                    if (sb.id === storyboardId) {
                        return {
                            ...sb,
                            scenes: sb.scenes.map(s => s.number === sceneNumber ? { ...newSceneData, imageUrl: undefined, selectedBaseImage: s.selectedBaseImage } : s)
                        }
                    }
                    return sb;
                })
            }), productId);
        }
    } catch (e) {
        console.error(e);
    } finally {
        removeTask(taskKey);
    }
  }

  const isStepComplete = (stepId: StrategyStep): boolean => {
    const prod = activeProduct;
    switch (stepId) {
      case 'product': return !!(prod.name && prod.name !== 'New Product' && prod.description && prod.audienceType && prod.type && prod.goal);
      case 'dream_buyer': return !!prod.dreamBuyer;
      case 'market_intel': return !!(prod.marketIntel && ((prod.marketIntel.workingNow && prod.marketIntel.workingNow.length > 0) || (prod.marketIntel.competitors && prod.marketIntel.competitors.length > 0) || prod.marketIntel.leanCanvas));
      case 'offer': return !!prod.offer; 
      case 'campaign_plan': return !!prod.campaignPlan;
      case 'creatives': return prod.creatives.length > 0 || prod.searchAds.length > 0 || !!prod.emailCampaign || (prod.storyboards && prod.storyboards.length > 0);
      case 'sales_page': return !!prod.salesPage || (!!prod.lpBuilderData?.copy && Object.keys(prod.lpBuilderData.copy).length > 0);
      case 'blueprint': return !!prod.launchBlueprint;
      default: return false;
    }
  };

  const currentStepIndex = steps.findIndex(s => s.id === activeStep);
  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  const validateAndNavigate = (targetStepId: StrategyStep) => {
      if (activeStep === 'product' && targetStepId !== 'product') {
          if (!isStepComplete('product')) { setShowValidation(true); setValidationTrigger(prev => prev + 1); return false; }
      }
      if (targetStepId !== 'product' && !isStepComplete('product')) { setShowValidation(true); setActiveStep('product'); setValidationTrigger(prev => prev + 1); return false; }
      setShowValidation(false);
      setActiveStep(targetStepId);
      setIntelError(null);
      return true;
  };

  const handleNextStep = () => {
    const nextIdx = currentStepIndex + 1;
    if (nextIdx < steps.length) { validateAndNavigate(steps[nextIdx].id); }
  };

  const handlePrevStep = () => {
    const prevIdx = currentStepIndex - 1;
    if (prevIdx >= 0) { validateAndNavigate(steps[prevIdx].id); }
  };

  const incompletePrerequisites = steps.slice(0, currentStepIndex).filter(s => !isStepComplete(s.id));
  const showSequenceWarning = isStepComplete('product') && incompletePrerequisites.length > 0 && !warningDismissed;
  const showFloatingNextButton = activeStep !== 'sales_page' && activeStep !== 'blueprint';

  return (
    <div className="flex h-screen bg-[#F9FAFB] font-sans text-slate-900 overflow-hidden selection:bg-slate-800 selection:text-white">
      {/* Mobile Sidebar (Controlled by isMobileMenuOpen) */}
      <Sidebar 
        products={products} 
        activeProductId={activeProductId} 
        setActiveProductId={(id) => { setActiveProductId(id); setIsMobileMenuOpen(false); setIntelError(null); }} 
        handleAddProduct={handleAddProduct}
        handleTogglePin={handleTogglePin}
        language={language}
        setLanguage={setLanguage}
        generationMode={generationMode}
        setGenerationMode={setGenerationMode}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onDeleteProduct={handleDeleteProduct}
        isMobileOpen={isMobileMenuOpen}
        closeMobileSidebar={() => setIsMobileMenuOpen(false)}
      />

      {lightboxImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setLightboxImage(null)}>
          <button className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors bg-white/10 rounded-full p-2" onClick={() => setLightboxImage(null)}><X size={32} /></button>
          <img src={lightboxImage} alt="Full preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-slide-up" onClick={(e) => e.stopPropagation()}/>
        </div>
      )}
      
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-white">
        <Header 
            steps={steps} 
            activeStep={activeStep} 
            setActiveStep={(id) => validateAndNavigate(id)} 
            isStepComplete={isStepComplete} 
            onMenuClick={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-4 lg:p-12 scroll-smooth">
            <div className="w-full mx-auto">
                {activeStep !== 'product' && (
                    <div className="mb-4 animate-fade-in flex items-center justify-between">
                        <h1 className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] leading-none">{activeProduct.name}</h1>
                    </div>
                )}
                {showSequenceWarning && (
                  <div className="mb-6 mx-1 p-3 bg-amber-50/80 backdrop-blur-sm border border-amber-200/60 rounded-xl flex items-center justify-between gap-3 animate-slide-up shadow-sm">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="text-amber-500 shrink-0"><AlertTriangle size={16} /></div>
                        <p className="text-xs text-amber-800 font-medium truncate">
                            {t.sequenceWarning.body} <span className="font-bold">{incompletePrerequisites.map(s => s.label).join(', ')}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                        <button onClick={() => validateAndNavigate(incompletePrerequisites[0].id)} className="text-[10px] font-bold text-amber-700 hover:text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors flex items-center">
                            {incompletePrerequisites[0].label} <ChevronRight size={10} className="ml-1" />
                        </button>
                        <button onClick={() => setWarningDismissed(true)} className="text-amber-400 hover:text-amber-600 transition-colors"><X size={14} /></button>
                    </div>
                  </div>
                )}
                {(() => {
                  switch (activeStep) {
                    case 'product': return <ProductStep activeProduct={activeProduct} updateProduct={updateProduct} language={language} mode={generationMode} analyzingUrl={analyzingUrl} urlError={urlError} urlSuccess={urlSuccess} handleUrlAnalysis={handleUrlAnalysis} fileInputRef={fileInputRef} handleFileUpload={handleFileUpload} handleRemoveImage={handleRemoveImage} setLightboxImage={setLightboxImage} showValidation={showValidation} validationTrigger={validationTrigger} analyzingBrand={analyzingBrand} onImagesPasted={processNewImages} />;
                    case 'dream_buyer': return <DreamBuyerStep 
                      product={activeProduct} 
                      language={language} 
                      taskQueue={taskQueue} 
                      onGenerate={() => handleGenerateBuyer(activeProduct.id, activeProduct.buyerFocus)} 
                      onUpdate={(buyer) => updateProduct({ dreamBuyer: buyer })} 
                      onClear={() => updateProduct({ dreamBuyer: undefined })}
                      onUpdateFocus={(focus) => updateProduct({ buyerFocus: focus })}
                    />;
                    case 'market_intel': return <MarketIntelStep 
                      product={activeProduct} 
                      language={language} 
                      loading={taskQueue.has(`intel-gen-${activeProduct.id}`)} 
                      taskQueue={taskQueue} 
                      onRunAnalysis={() => { handleMarketAnalysis(activeProduct.id); }} 
                      onSeeMore={() => { handleSeeMoreCompetitors(activeProduct.id); }} 
                      onUpdate={(intel) => updateProduct({ marketIntel: intel })} 
                      onClear={() => updateProduct({ marketIntel: undefined })} 
                      onCancel={() => handleCancelMarketAnalysis(activeProduct.id)} 
                      error={intelError}
                      onRefreshPatterns={() => handleRefreshMarketPart(activeProduct.id, 'patterns')}
                      onRefreshCanvas={() => handleRefreshMarketPart(activeProduct.id, 'canvas')}
                      onRefreshBrand={() => handleRefreshMarketPart(activeProduct.id, 'brand')}
                      onRefreshPricing={() => handleRefreshMarketPart(activeProduct.id, 'pricing')}
                      onDeleteCompetitor={(idx) => {
                          updateProduct(prev => {
                              if (!prev.marketIntel?.competitors) return {};
                              const newComps = [...prev.marketIntel.competitors];
                              newComps.splice(idx, 1);
                              return { marketIntel: { ...prev.marketIntel, competitors: newComps } };
                          }, activeProduct.id);
                      }}
                    />;
                    case 'campaign_plan': return <CampaignPlanStep 
                      product={activeProduct} 
                      language={language} 
                      loading={taskQueue.has(`plan-gen-${activeProduct.id}`)} 
                      onGenerate={(focus) => {
                        updateProduct({ planFocus: focus });
                        handleGenerateCampaignPlanTask(activeProduct.id, focus);
                      }} 
                      onClear={() => updateProduct({ campaignPlan: undefined })} 
                      onUpdateFocus={(focus) => updateProduct({ planFocus: focus })}
                    />;
                    case 'offer': return <PowerOfferStep 
                      product={activeProduct} 
                      language={language} 
                      loading={taskQueue.has(`full-offer-gen-${activeProduct.id}`)} 
                      taskQueue={taskQueue}
                      onGenerate={(focus) => {
                        updateProduct({ offerFocus: focus });
                        handleGenerateOfferAndBigIdea(activeProduct.id, focus);
                      }} 
                      onUpdateOffer={(offer) => updateProduct({ offer })} 
                      onUpdateIdea={(idea) => updateProduct({ bigIdea: idea })} 
                      onClear={() => updateProduct({ offer: undefined, bigIdea: undefined })} 
                      onUpdateFocus={(focus) => updateProduct({ offerFocus: focus })}
                      onRefreshOffer={() => handleRefreshOfferPart(activeProduct.id, 'offer', activeProduct.offerFocus)}
                      onRefreshBigIdea={() => handleRefreshOfferPart(activeProduct.id, 'bigIdea', activeProduct.offerFocus)}
                    />;
                    case 'creatives': return <CreativesStep 
                      product={activeProduct} 
                      language={language} 
                      loading={taskQueue.has(`creative-gen-${activeProduct.id}`) || taskQueue.has(`search-ads-gen-${activeProduct.id}`) || taskQueue.has(`email-gen-${activeProduct.id}`) || taskQueue.has(`storyboard-gen-${activeProduct.id}`) || taskQueue.has(`news-fetch-${activeProduct.id}`) || taskQueue.has(`linkedin-gen-${activeProduct.id}`)} 
                      taskQueue={taskQueue} 
                      onGenerateCreative={(style, direction) => handleGenerateCreative(activeProduct.id, style, direction)} 
                      onRefreshText={(id, style) => handleGenerateCreative(activeProduct.id, style, undefined, id)} 
                      onGenerateImage={(cid, prompt, base, comp, style) => handleGenerateCreativeImageTask(activeProduct.id, cid, prompt, base, comp, style)} 
                      onGenerateSearchAds={(dir) => handleGenerateSearchAdsTask(activeProduct.id, dir)} 
                      onGenerateEmailCampaign={(cat, sty, dir) => handleGenerateEmailCampaignTask(activeProduct.id, cat, sty, dir)} 
                      onGenerateStoryboard={(style, dir) => handleGenerateStoryboardTask(activeProduct.id, style, dir)} 
                      onGenerateSceneImage={(num, prompt, base, storyboardId) => {
                          if (storyboardId) handleGenerateSceneImageTask(activeProduct.id, storyboardId, num, prompt, base);
                      }} 
                      onFileUpload={(e) => handleFileUpload(e)} 
                      onUpdate={(creatives) => updateProduct({ creatives })} 
                      onUpdateSearchAds={(searchAds) => updateProduct({ searchAds })} 
                      onUpdateStoryboard={(sb) => {
                          // Handle singular update logic for backwards compat or specific case
                          // Ideally use dedicated updater
                      }} 
                      onFetchIndustryNews={(isLoadMore) => handleFetchIndustryNews(activeProduct.id, isLoadMore)} 
                      onClearNews={() => updateProduct({ industryNews: [] })} 
                      onGenerateLinkedInPost={(news, style, dir) => handleGenerateLinkedInPost(activeProduct.id, news, style, dir)} 
                      onRefreshLinkedInPost={(postId, cat, linkedNewsId) => handleRefreshLinkedInPost(activeProduct.id, postId, cat, linkedNewsId)} 
                      onDeleteLinkedInPost={handleDeleteLinkedInPost} 
                      onUpdatePhoneCampaign={(campaign: PhoneCampaign) => updateProduct({ phoneCampaign: campaign })}
                      onRefreshScene={(sceneNumber, storyboardId) => {
                          if(storyboardId) handleRefreshSceneTask(activeProduct.id, storyboardId, sceneNumber);
                      }}
                      onUpdateProduct={(updates) => updateProduct(updates)}
                    />;
                    case 'sales_page': return <SalesPageStep 
                      product={activeProduct} 
                      language={language} 
                      loading={taskQueue.has(`sales-page-gen-${activeProduct.id}`)} 
                      onGenerate={(aesthetic) => handleGenerateSalesPageTask(activeProduct.id, aesthetic)} 
                      updateProduct={updateProduct} 
                      onGenerateBuilderCopy={() => handleGenerateBuilderCopy(activeProduct.id)} 
                      builderLoading={taskQueue.has(`lp-builder-gen-${activeProduct.id}`)} 
                      onSectionRefresh={(sectionId) => handleRefreshBuilderSection(activeProduct.id, sectionId)} 
                      refreshTasks={taskQueue} 
                      onGenerateDesign={(type, settings, brandKit) => handleGenerateDesignAssets(activeProduct.id, type, settings, brandKit)}
                      designTasks={taskQueue}
                    />;
                    case 'blueprint': return <LaunchBlueprintStep product={activeProduct} language={language} loading={taskQueue.has(`blueprint-gen-${activeProduct.id}`)} onGenerate={() => handleGenerateBlueprintTask(activeProduct.id)} />;
                    default: return null;
                  }
                })()}
            </div>
        </main>
        
        {/* Mobile Navigation Controls */}
        <div className="fixed bottom-6 left-6 right-6 z-20 flex justify-between items-center lg:hidden pointer-events-none">
             <div className="pointer-events-auto">
                {currentStepIndex > 0 && (
                    <button 
                        onClick={handlePrevStep}
                        className="w-14 h-14 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center text-gray-500 active:scale-90 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                )}
             </div>
             
             <div className="pointer-events-auto">
                {showFloatingNextButton && (
                    <button onClick={handleNextStep} className="w-14 h-14 rounded-full shadow-2xl transition-all flex items-center justify-center bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 active:scale-95">
                      <ArrowRight size={24} />
                    </button>
                )}
             </div>
        </div>

        {/* Desktop Next Button */}
        {showFloatingNextButton && (
          <div className="hidden lg:flex absolute bottom-10 right-10 flex-col items-end z-20">
            <button onClick={handleNextStep} className="px-8 py-4 rounded-full shadow-2xl transition-all flex items-center space-x-3 font-display font-bold text-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 active:scale-95">
              <span>{t.common.nextStep}</span><ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;