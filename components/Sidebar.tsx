
import React, { useRef, useMemo, useState } from 'react';
import { Plus, Zap, Award, Globe, Download, Upload, Pin, Trash2, AlertTriangle, X, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Product, Language, GenerationMode } from '../types';
import { getTranslation } from '../translations';

interface SidebarProps {
  products: Product[];
  activeProductId: string;
  setActiveProductId: (id: string) => void;
  handleAddProduct: () => void;
  handleTogglePin: (id: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  generationMode: GenerationMode;
  setGenerationMode: (mode: GenerationMode) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteProduct: (id: string) => void;
  isMobileOpen?: boolean;
  closeMobileSidebar?: () => void;
  taskQueue?: Set<string>;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  products, 
  activeProductId, 
  setActiveProductId, 
  handleAddProduct, 
  handleTogglePin, 
  language, 
  setLanguage, 
  generationMode, 
  setGenerationMode, 
  onExportData, 
  onImportData, 
  onDeleteProduct,
  isMobileOpen = false,
  closeMobileSidebar,
  taskQueue
}) => {
  const t = getTranslation(language);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const sortedProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      // 1. Pinned items always first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      
      // 2. Sort by Creation Time (ID) for stability instead of Last Updated
      // This prevents the active item from jumping to the top while editing
      const idA = Number(a.id);
      const idB = Number(b.id);
      
      if (!isNaN(idA) && !isNaN(idB)) {
          return idB - idA; // Newest created first
      }
      
      // Fallback for non-numeric IDs (e.g. imports or UUIDs)
      return b.lastUpdated - a.lastUpdated;
    });
  }, [products]);

  const confirmDelete = () => {
    if (productToDelete) {
      onDeleteProduct(productToDelete);
      setProductToDelete(null);
    }
  };

  // Determine width classes based on state
  // Mobile: Fixed full width or slide-in logic handled via transforms
  // Desktop: Relative width based on collapse state
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-[100] bg-white border-r border-gray-200 flex flex-col flex-shrink-0 no-print 
    transition-transform duration-300 ease-in-out md:translate-x-0 md:relative
    ${isMobileOpen ? 'translate-x-0 w-72 shadow-2xl' : '-translate-x-full w-72'} 
    ${!isMobileOpen ? (isCollapsed ? 'md:w-20' : 'md:w-72') : ''}
  `;

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-[90] md:hidden backdrop-blur-sm transition-opacity" 
            onClick={closeMobileSidebar}
        />
      )}

      <div className={sidebarClasses}>
        {productToDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setProductToDelete(null)}>
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 w-full max-w-sm animate-slide-up" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3 text-red-600 mb-4">
                        <div className="p-2 bg-red-50 rounded-xl"><AlertTriangle size={24} /></div>
                        <h3 className="font-bold text-lg">Delete Product?</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 leading-relaxed">
                        Are you sure you want to delete this product strategy? This action cannot be undone.
                    </p>
                    <div className="flex gap-3">
                        <button onClick={() => setProductToDelete(null)} className="flex-1 px-4 py-3 rounded-xl border border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                        <button onClick={confirmDelete} className="flex-1 px-4 py-3 rounded-xl bg-red-600 font-bold text-sm text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-200">Delete</button>
                    </div>
                </div>
            </div>
        )}

        <div className={`border-b border-gray-100 flex items-center transition-all h-20 shrink-0 ${isCollapsed ? 'px-2 justify-center gap-1' : 'px-4 justify-between'}`}>
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'w-full space-x-2'}`}>
                <img src={isCollapsed ? "/favicon-markethero.png" : "/market-hero2x.png"} alt="MarketHero" className={`object-contain transition-all duration-300 ${isCollapsed ? 'h-8 w-auto' : 'h-11 w-auto'}`} />
            </div>
            
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className={`text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-gray-50 hidden md:flex shrink-0 ${isCollapsed ? 'p-1' : 'p-1.5'}`}
                title={isCollapsed ? "Expand" : "Collapse"}
            >
                {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={20} />}
            </button>

            {/* Mobile Close Button */}
            {!isCollapsed && (
                <button 
                    onClick={closeMobileSidebar}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50 md:hidden shrink-0"
                >
                    <X size={20} />
                </button>
            )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {(!isCollapsed || isMobileOpen) && <div className="px-2 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-fade-in">{t.sidebar.products}</div>}
            {sortedProducts.map(p => {
              const isProductGenerating = taskQueue && Array.from(taskQueue).some(taskKey => taskKey.endsWith(`-${p.id}`));
              return (
              <div key={p.id} className="relative group">
                <button 
                onClick={() => setActiveProductId(p.id)} 
                className={`w-full text-left rounded-xl text-sm font-medium transition-all flex items-center ${(isCollapsed && !isMobileOpen) ? 'justify-center p-3' : 'px-4 py-3 justify-between'} ${activeProductId === p.id ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
                title={(isCollapsed && !isMobileOpen) ? p.name : undefined}
                >
                {(isCollapsed && !isMobileOpen) ? (
                    <div className="relative font-bold text-xs">
                      {p.name.charAt(0).toUpperCase()}
                      {isProductGenerating && (
                        <span className="absolute -top-1 -right-1.5 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      )}
                    </div>
                ) : (
                    <div className="flex items-center gap-2 truncate mr-16 animate-fade-in">
                      <span className="truncate font-bold">{p.name}</span>
                      {isProductGenerating && (
                        <span title="A gerar conteúdos...">
                          <Loader2 size={13} className={`animate-spin shrink-0 ${activeProductId === p.id ? 'text-white/80' : 'text-indigo-500'}`} />
                        </span>
                      )}
                    </div>
                )}
                </button>
                {(!isCollapsed || isMobileOpen) && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <button 
                        onClick={(e) => { e.stopPropagation(); handleTogglePin(p.id); }}
                        className={`p-1.5 rounded-lg transition-all ${p.isPinned ? 'text-indigo-400 opacity-100' : 'text-gray-300 opacity-0 group-hover:opacity-100 hover:text-indigo-400 hover:bg-white'}`}
                        title={p.isPinned ? "Unpin product" : "Pin product to top"}
                        >
                        <Pin size={14} className={p.isPinned ? "fill-current rotate-45" : ""} />
                        </button>
                        <button 
                        onClick={(e) => { e.stopPropagation(); setProductToDelete(p.id); }}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
                        title="Delete product"
                        >
                        <Trash2 size={14} />
                        </button>
                    </div>
                )}
            </div>
            );
            })}
            <button 
            onClick={handleAddProduct} 
            className={`w-full mt-6 flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50 text-sm font-bold transition-all ${(isCollapsed && !isMobileOpen) ? 'p-3' : 'p-3 space-x-2'}`}
            title={t.sidebar.addProduct}
            >
            <Plus size={16} />
            {(!isCollapsed || isMobileOpen) && <span className="animate-fade-in">{t.sidebar.addProduct}</span>}
            </button>
        </div>

        <div className={`p-4 border-t border-gray-100 bg-gray-50/50 space-y-5 transition-all ${(isCollapsed && !isMobileOpen) ? 'items-center flex flex-col py-6' : ''}`}>
            <div className={`flex gap-2 ${(isCollapsed && !isMobileOpen) ? 'flex-col w-full' : ''}`}>
                <button 
                    onClick={onExportData}
                    className={`flex-1 flex items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group ${(isCollapsed && !isMobileOpen) ? 'flex-row' : 'flex-col'}`}
                    title="Export all data to JSON"
                >
                    <Download size={16} className={`text-gray-400 group-hover:text-indigo-500 ${(isCollapsed && !isMobileOpen) ? '' : 'mb-1'}`} />
                    {(!isCollapsed || isMobileOpen) && <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-indigo-600 animate-fade-in">{t.sidebar.export}</span>}
                </button>
                <button 
                    onClick={handleImportClick}
                    className={`flex-1 flex items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:text-indigo-600 transition-all shadow-sm group ${(isCollapsed && !isMobileOpen) ? 'flex-row' : 'flex-col'}`}
                    title="Import data from JSON"
                >
                    <Upload size={16} className={`text-gray-400 group-hover:text-indigo-500 ${(isCollapsed && !isMobileOpen) ? '' : 'mb-1'}`} />
                    {(!isCollapsed || isMobileOpen) && <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wide group-hover:text-indigo-600 animate-fade-in">{t.sidebar.import}</span>}
                </button>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={onImportData} 
                />
            </div>

            {(!isCollapsed || isMobileOpen) ? (
                <div className="animate-fade-in space-y-5">
                    <div>
                    <div className="px-2 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-1.5">
                        <Globe size={10} className="mr-1.5" /> {t.sidebar.language}
                    </div>
                    <div className="bg-gray-200/50 p-1 rounded-xl flex gap-1">
                        {(['en', 'pt', 'es'] as Language[]).map((lang) => (
                        <button 
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase ${language === lang ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {lang}
                        </button>
                        ))}
                    </div>
                    </div>

                    <div>
                    <div className="px-2 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center mb-1.5">
                        <Zap size={10} className="mr-1.5" /> {t.sidebar.engine}
                    </div>
                    <div className="bg-gray-200/50 p-1 rounded-xl flex gap-1">
                        <button 
                        onClick={() => setGenerationMode('Fast')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${generationMode === 'Fast' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                        <Zap size={10} className={generationMode === 'Fast' ? 'fill-slate-900' : ''} />
                        {t.sidebar.fast}
                        </button>
                        <button 
                        onClick={() => setGenerationMode('Quality')}
                        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg text-[10px] font-bold transition-all ${generationMode === 'Quality' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                        <Award size={10} className={generationMode === 'Quality' ? 'fill-slate-900' : ''} />
                        {t.sidebar.quality}
                        </button>
                    </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex-shrink-0" />
                    <div className="flex-col flex">
                        <span className="text-xs font-bold text-gray-900">{t.sidebar.workspace}</span>
                        <span className="text-[10px] text-gray-500 font-medium">{t.sidebar.plan}</span>
                    </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-4 items-center animate-fade-in">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex-shrink-0" />
                </div>
            )}
        </div>
      </div>
    </>
  );
};
