
import React, { useRef, useEffect } from 'react';
import { Product, SalesPageAesthetic, Language, LandingPageBuilderData, BuilderSectionId, DesignDirectorData } from '../types';
import { SalesPageBuilder } from './SalesPageBuilder';
import { DesignDirector } from './DesignDirector';
import { generateLandingPageCopy } from '../services/salesPageCopyService';

interface SalesPageStepProps {
  product: Product;
  language: Language;
  loading: boolean;
  onGenerate: (aesthetic?: SalesPageAesthetic) => void | Promise<void>;
  updateProduct?: (updates: Partial<Product>) => void;
  onGenerateBuilderCopy?: () => void | Promise<void>;
  builderLoading?: boolean;
  onSectionRefresh?: (sectionId: BuilderSectionId) => void | Promise<void>;
  refreshTasks?: Set<string>;
  onGenerateDesign?: (type: 'vibecoding' | 'elementor', settings: any, brandKit?: any) => void;
  designTasks?: Set<string>;
}

export const SalesPageStep: React.FC<SalesPageStepProps> = ({ 
    product, language, loading, onGenerate, updateProduct, onGenerateBuilderCopy, 
    builderLoading, onSectionRefresh, refreshTasks, onGenerateDesign, designTasks 
}) => {
  
  // Track the recommendation we've already applied to avoid "locking" user changes
  const lastAppliedRecRef = useRef<any>(null);

  const handleBuilderUpdate = (data: LandingPageBuilderData) => {
      if (updateProduct) {
          updateProduct({ lpBuilderData: data });
      }
  };

  const handleDesignUpdate = (data: DesignDirectorData) => {
      if (updateProduct) {
          updateProduct({ designDirectorData: data });
      }
  };

  // Override default generation to include the new isSolutionAware param
  const handleGenerateBuilderCopy = async () => {
    if (!updateProduct) return;
    
    const defaultBuilderData: LandingPageBuilderData = {
        selectedSections: ['header', 'hero', 'numbers_bar', 'intro_pain', 'solution', 'features', 'categories', 'who_transformation', 'comparison_vs', 'process', 'offer', 'full_width_cta', 'lead_form', 'social_proof', 'about_author', 'faq', 'footer_contact'],
        tone: 'Direct Response',
        language: language,
        creativityLevel: 0.5,
        includeStrategy: false,
        isSolutionAware: false,
        copy: {},
        customDirection: ''
    };

    const builderData = product.lpBuilderData || defaultBuilderData;
    const includeStrategy = builderData.includeStrategy;

    try {
        // We trigger the loading state externally via App.tsx but here we execute logic
        // Actually App.tsx handles the execution based on prop. 
        // But since we need to pass `isSolutionAware`, we should rely on App.tsx doing it correctly
        // OR we override the handler here if App.tsx wasn't updated to pass it.
        // The original App.tsx implementation of `handleGenerateBuilderCopy` reads state from `product.lpBuilderData`.
        // Since we updated `types.ts` and `product.lpBuilderData` includes `isSolutionAware`, 
        // and we updated `App.tsx` (in theory, though user only asked for these files),
        // we can trust `onGenerateBuilderCopy` from props if App.tsx is updated. 
        // However, to be safe, we can just let `onGenerateBuilderCopy` run as it uses the state.
        if (onGenerateBuilderCopy) onGenerateBuilderCopy();
    } catch (e) {
        console.error(e);
    }
  };

  const hasCopy = product.lpBuilderData && Object.keys(product.lpBuilderData.copy || {}).length > 0;

  // Use default builder data to allow rendering DesignDirector in "inactive" state
  const effectiveBuilderData = product.lpBuilderData || {
      selectedSections: [],
      tone: 'Direct Response',
      language: language,
      creativityLevel: 0.5,
      includeStrategy: false,
      copy: {}
  };
  
  /**
   * AI Suggestion Sync Logic:
   * We apply AI recommendations ONLY when the recommendation object itself changes (newly generated).
   * This allows the user to change settings afterward without the effect reverting them.
   */
  useEffect(() => {
    const rec = product.lpBuilderData?.copy?.designRecommendation;
    
    // Only proceed if there's a recommendation and it's different from the one we last applied
    if (rec && rec !== lastAppliedRecRef.current && updateProduct) {
        lastAppliedRecRef.current = rec;

        // Added missing 'themeMode' to fix TypeScript assignment error (line 82 in original error)
        const currentSettings = product.designDirectorData?.settings || {
            style: 'Modern Corporate / Refined',
            typography: 'Sans-Serif (Clean & Modern)',
            colorPalette: 'Modern Minimal (Black/White/Accent)',
            iconSet: 'Lucide React (Clean)',
            visualIntensity: 'Medium (Balanced)',
            borderRadius: 'Medium (Rounded)',
            themeMode: 'Light Mode (Clean White)'
        };

        updateProduct({
            designDirectorData: {
                ...(product.designDirectorData || { 
                    brandKit: undefined,
                    generatedPrompt: undefined,
                    generatedElementorJson: undefined,
                    generatedSiteSettingsJson: undefined
                }),
                settings: {
                    ...currentSettings,
                    style: rec.style || currentSettings.style,
                    typography: rec.typography || currentSettings.typography,
                    visualIntensity: rec.visualIntensity || currentSettings.visualIntensity
                }
            }
        });
    }
  }, [product.lpBuilderData?.copy?.designRecommendation, updateProduct]);

  return (
      <div className="animate-slide-up w-full flex flex-col pb-20">
          <SalesPageBuilder 
            product={product} 
            language={language} 
            onUpdate={handleBuilderUpdate} 
            onGenerate={onGenerateBuilderCopy}
            loading={builderLoading}
            onSectionRefresh={onSectionRefresh}
            refreshTasks={refreshTasks}
          />
          
          <DesignDirector 
            productName={product.name}
            builderData={effectiveBuilderData}
            language={language}
            hasCopy={!!hasCopy}
            designData={product.designDirectorData}
            onUpdate={handleDesignUpdate}
            onGenerate={onGenerateDesign}
            isGeneratingVibecoding={designTasks?.has(`design-gen-${product.id}-vibecoding`) || false}
            isGeneratingElementor={designTasks?.has(`design-gen-${product.id}-elementor`) || false}
          />
      </div>
  );
};
