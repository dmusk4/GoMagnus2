
import React from 'react';
import { Loader2, Search, FileDown, Copy, Check, Compass, Plus } from 'lucide-react';
import { Product, SearchAdGroup, SearchAd, Language } from '../../types';
import { getTranslation } from '../../translations';

interface GoogleAdsStudioProps {
  product: Product;
  language: Language;
  isSearchLoading: boolean;
  onGenerateSearchAds: (dir: string) => void;
  exportToCSV: () => void;
  handleCopySearchAd: (ad: SearchAd, idx: string) => void;
  searchAdCopyStatus: string | null;
  customSearchDirection: string;
  setCustomSearchDirection: (val: string) => void;
}

export const GoogleAdsStudio: React.FC<GoogleAdsStudioProps> = ({
  product, language, isSearchLoading, onGenerateSearchAds, exportToCSV, handleCopySearchAd, searchAdCopyStatus,
  customSearchDirection, setCustomSearchDirection
}) => {
  const t = getTranslation(language);

  return (
    <div className="animate-fade-in w-full">
      <div className="flex items-center justify-between mb-6">
        <div><h2 className="text-4xl font-display font-bold text-gray-900">{t.creativesStep.searchTitle}</h2><p className="text-lg text-gray-500 mt-2">{t.creativesStep.searchSubtitle}</p></div>
        <div className="flex gap-3">
          {product.searchAds.length > 0 && <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl font-bold text-sm border border-emerald-100 hover:bg-emerald-100 shadow-sm"><FileDown size={16} /> {t.creativesStep.exportCsv}</button>}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Compass size={12} className="text-indigo-500" /> {t.creativesStep.customDirection}
          </label>
          <input
            type="text"
            value={customSearchDirection}
            onChange={(e) => setCustomSearchDirection(e.target.value)}
            placeholder="E.g. Focus on high-intent keywords for immediate purchase..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300"
          />
        </div>
        <button onClick={() => onGenerateSearchAds(customSearchDirection)} disabled={isSearchLoading} className={`flex justify-center items-center gap-2 px-8 py-3 w-full xl:w-auto rounded-xl font-bold transition-all shadow-lg shrink-0 ${isSearchLoading ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 active:scale-95'}`}>
            {isSearchLoading ? <Loader2 className="animate-spin" size={18} /> : (product.searchAds.length > 0 ? <Plus size={18} /> : <Search size={18} />)}
            {product.searchAds.length > 0 ? (isSearchLoading ? t.common.analyzing : t.creativesStep.refreshSearch) : (isSearchLoading ? t.common.building : t.creativesStep.buildSearch)}
        </button>
      </div>

      {product.searchAds.map((group, gIdx) => (
        <div key={gIdx} className="mb-16">
          <div className="flex items-center gap-4 mb-8"><div className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm">Intent: {group.intent}</div><div className="h-px flex-1 bg-gray-100"></div></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {Array.isArray(group.ads) && group.ads.map((ad, aIdx) => (
              <div key={aIdx} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:border-indigo-300 transition-all flex flex-col relative pt-12 group/ad">
                <button onClick={() => handleCopySearchAd(ad, `${gIdx}-${aIdx}`)} className={`absolute top-4 right-4 p-2 rounded-lg transition-all ${searchAdCopyStatus === `${gIdx}-${aIdx}` ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400 hover:text-indigo-600'}`}>{searchAdCopyStatus === `${gIdx}-${aIdx}` ? <Check size={14} /> : <Copy size={14} />}</button>
                <div className="flex items-center gap-2 mb-1.5"><span className="text-[11px] font-bold text-gray-900">{t.creativesStep.adLabel}</span><span className="text-gray-300 text-xs">·</span><span className="text-[11px] text-gray-500 font-medium">{product.websiteUrl?.replace(/https?:\/\//, '') || 'www.market-hero.app'}/{ad.path1 || ''}/{ad.path2 || ''}</span></div>
                <h3 className="text-xl font-display text-blue-800 hover:underline cursor-pointer leading-tight mb-2">{Array.isArray(ad.headlines) ? ad.headlines.slice(0, 3).join(' | ') : ''}</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">{ad.descriptions?.[0] || ''}</p>
                {group.assets && (
                  <div className="space-y-4 mb-6 pt-4 border-t border-gray-50">
                    <div className="grid grid-cols-2 gap-4">{Array.isArray(group.assets.sitelinks) && group.assets.sitelinks.slice(0, 4).map((s, i) => (<div key={i} className="group/site"><p className="text-[13px] font-bold text-blue-700 hover:underline cursor-pointer leading-none mb-1">{s.title}</p><p className="text-[10px] text-gray-500 leading-tight line-clamp-1">{s.desc1}</p></div>))}</div>
                    <div className="flex flex-wrap gap-x-2 gap-y-1 text-[11px] text-gray-500">
                      {Array.isArray(group.assets.callouts) && group.assets.callouts.map((c, i) => (<span key={i} className="after:content-['·'] after:ml-2 last:after:content-none">{c}</span>))}
                      {Array.isArray(group.assets.structuredSnippets) && group.assets.structuredSnippets.map((snip, i) => (
                        <span key={i} className="after:content-['·'] after:ml-2 last:after:content-none">
                          <span className="font-bold">{snip.header}:</span> {Array.isArray(snip.values) ? snip.values.join(', ') : ''}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-auto pt-6 border-t border-gray-50 flex flex-wrap gap-2">{Array.isArray(ad.keywords) && ad.keywords.map((kw, kwIdx) => (<span key={kwIdx} className="px-2.5 py-1 bg-gray-50 border border-gray-100 rounded-lg text-[10px] font-medium text-gray-500">{kw.toLowerCase()}</span>))}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
