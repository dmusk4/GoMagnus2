import React from 'react';
import { Linkedin, Newspaper, Trash2, RefreshCw, Search, Loader2, TrendingUp, ExternalLink, ArrowDown, Check, Copy, Star, Compass, Link, Palette, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';
import { Product, IndustryNews, LinkedInPost, Language } from '../../types';
import { getTranslation } from '../../translations';

interface LinkedInStudioProps {
  product: Product;
  language: Language;
  isNewsLoading: boolean;
  isLinkedInLoading: boolean;
  onClearNews: () => void;
  onFetchIndustryNews: (loadMore?: boolean) => void;
  selectedNewsId: string | null;
  setSelectedNewsId: (id: string | null) => void;
  activeLinkedInStyle: string;
  setActiveLinkedInStyle: (style: string) => void;
  customLinkedInDirection: string;
  setCustomLinkedInDirection: (val: string) => void;
  onGenerateLinkedInPost: (news: IndustryNews | null, style: string, dir: string) => void;
  onRefreshLinkedInPost: (postId: string, cat: string, newsId?: string) => void;
  onDeleteLinkedInPost: (postId: string) => void;
  handleCopyLinkedIn: (post: LinkedInPost, id: string) => void;
  linkedInCopyStatus: string | null;
  LINKEDIN_STYLES: string[];
  linkedinExcludeContext?: boolean;
  setLinkedinExcludeContext?: (val: boolean) => void;
}

export const LinkedInStudio: React.FC<LinkedInStudioProps> = ({
  product, language, isNewsLoading, isLinkedInLoading, onClearNews, onFetchIndustryNews,
  selectedNewsId, setSelectedNewsId, activeLinkedInStyle, setActiveLinkedInStyle,
  customLinkedInDirection, setCustomLinkedInDirection, onGenerateLinkedInPost,
  onRefreshLinkedInPost, onDeleteLinkedInPost, handleCopyLinkedIn, linkedInCopyStatus, LINKEDIN_STYLES,
  linkedinExcludeContext, setLinkedinExcludeContext
}) => {
  const t = getTranslation(language);

  return (
    <div className="animate-fade-in w-full">
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900 flex items-center gap-3">
            <Linkedin size={32} className="text-indigo-600" />
            {t.creativesStep.linkedinTitle}
          </h2>
          <p className="text-lg text-gray-500 mt-2">{t.creativesStep.linkedinSubtitle}</p>
        </div>

        {setLinkedinExcludeContext && (
            <button 
                onClick={() => setLinkedinExcludeContext(!linkedinExcludeContext)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${linkedinExcludeContext ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-gray-200 text-gray-500'}`}
                title="Toggle to ignore Dream Buyer context for this generation"
            >
                {linkedinExcludeContext ? <ToggleRight className="text-amber-500" /> : <ToggleLeft className="text-gray-400" />}
                <div className="flex flex-col items-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest">{linkedinExcludeContext ? "Raw Product Mode" : "Strategy Aware"}</span>
                    <span className="text-[9px] opacity-70 font-medium leading-none">{linkedinExcludeContext ? "Ignoring Dream Buyer" : "Using Full Context"}</span>
                </div>
            </button>
        )}
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Newspaper size={16} className="text-indigo-600" />
                {t.creativesStep.industryNews}
                {product.industryNews && product.industryNews.length > 0 && (
                  <span className="bg-indigo-100 text-indigo-700 text-[10px] px-2 py-0.5 rounded-full">
                    {product.industryNews.length}
                  </span>
                )}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={onClearNews}
                  disabled={isNewsLoading || !product.industryNews?.length}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  title={t.common.clearData}
                >
                  <Trash2 size={14} />
                </button>
                <button
                  onClick={() => onFetchIndustryNews(true)}
                  disabled={isNewsLoading}
                  className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                  title={t.common.refresh}
                >
                  <RefreshCw size={14} className={isNewsLoading ? "animate-spin" : ""} />
                </button>
              </div>
            </div>

            {(!product.industryNews || product.industryNews.length === 0) ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                <Search size={32} className="mb-3 opacity-20" />
                <p className="text-xs font-medium mb-4">{isNewsLoading ? t.creativesStep.fetchingNews : t.common.noResults}</p>
                <button
                  onClick={() => onFetchIndustryNews(false)}
                  disabled={isNewsLoading}
                  className="text-xs font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  {isNewsLoading ? <Loader2 size={12} className="animate-spin" /> : "Fetch Recent News"}
                </button>
              </div>
            ) : (
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar pb-2">
                {isNewsLoading && (
                  <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-full flex items-center justify-center animate-pulse mb-2">
                    <Loader2 size={10} className="mr-2 animate-spin" /> {t.creativesStep.fetchingNews}
                  </div>
                )}
                {product.industryNews.map((news) => {
                  const isTrend = news.source?.toLowerCase().includes('trend') || news.source?.toLowerCase().includes('analysis');
                  return (
                    <div
                      key={news.id}
                      onClick={() => setSelectedNewsId(selectedNewsId === news.id ? null : news.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all hover:shadow-md relative group ${selectedNewsId === news.id ? 'border-indigo-500 bg-indigo-50/50 ring-1 ring-indigo-500' : 'border-gray-100 bg-white hover:border-gray-300'}`}
                    >
                      {isTrend && (
                        <div className="absolute top-2 right-2">
                          <TrendingUp size={12} className="text-emerald-500" />
                        </div>
                      )}
                      <h4 className="text-xs font-bold text-gray-900 leading-snug mb-1 line-clamp-2">{news.title}</h4>
                      <p className="text-[10px] text-gray-500 line-clamp-3 mb-3 leading-relaxed">{news.snippet}</p>

                      <div className="flex items-end justify-between border-t border-gray-50 pt-2 mt-auto">
                        <div className="flex flex-col">
                          <a href={news.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className={`text-[9px] font-bold uppercase tracking-wider hover:underline transition-colors w-fit flex items-center gap-1 ${isTrend ? 'text-emerald-600 hover:text-emerald-800' : 'text-indigo-600 hover:text-indigo-800'}`}>
                            {isTrend ? <TrendingUp size={8} /> : <ExternalLink size={8} />} {news.source}
                          </a>
                          <span className="text-[10px] font-bold text-gray-700 mt-0.5">{news.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${selectedNewsId === news.id ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                            {selectedNewsId === news.id && <Check size={12} className="text-white" />}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => onFetchIndustryNews(true)}
                  disabled={isNewsLoading}
                  className="w-full py-3 mt-4 text-xs font-bold text-gray-500 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl border border-dashed border-gray-200 hover:border-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                  {isNewsLoading ? <Loader2 size={12} className="animate-spin" /> : <ArrowDown size={12} />}
                  Load More News
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Palette size={12} className="text-indigo-500" /> {t.creativesStep.chooseAngle}
              </label>
              <div className="flex gap-2 flex-wrap">
                {LINKEDIN_STYLES.map(style => (
                  <button
                    key={style}
                    onClick={() => setActiveLinkedInStyle(style)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${activeLinkedInStyle === style ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
                  >
                    {activeLinkedInStyle === style && <Star size={10} className="fill-white" />}
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pt-4 border-t border-gray-50">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Compass size={12} className="text-indigo-500" /> {t.creativesStep.customDirection}
                </label>
                <input
                  type="text"
                  value={customLinkedInDirection}
                  onChange={(e) => setCustomLinkedInDirection(e.target.value)}
                  placeholder="E.g. Focus on a specific success story, or leverage a recent case study..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300"
                />
              </div>
              <button
                onClick={() => onGenerateLinkedInPost(product.industryNews?.find(n => n.id === selectedNewsId) || null, activeLinkedInStyle, customLinkedInDirection)}
                disabled={isLinkedInLoading}
                className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all shadow-lg whitespace-nowrap h-[42px] shrink-0 ${isLinkedInLoading ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 active:scale-95'}`}
              >
                {isLinkedInLoading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                {selectedNewsId ? "Generate from News" : t.creativesStep.generatePost}
              </button>
            </div>
          </div>

          {(!product.linkedinPosts || product.linkedinPosts.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-[2rem] bg-gray-50/50">
              <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center mb-4 text-indigo-600">
                <Linkedin size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Build Your Authority</h3>
              <p className="text-gray-500 max-w-sm text-center text-sm mb-6">Generate professional, human-sounding posts. Select a news item for context or let AI pick a relevant topic.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {product.linkedinPosts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-lg">
                        {product.decisionMaker ? product.decisionMaker.charAt(0) : "U"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">You <span className="text-gray-400 font-normal">• 1st</span></p>
                        <p className="text-xs text-gray-500">{product.type} Expert • {product.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRefreshLinkedInPost(post.id, post.category, post.linkedNewsId)}
                        disabled={isLinkedInLoading}
                        className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                        title={t.common.refresh}
                      >
                        <RefreshCw size={16} className={isLinkedInLoading ? "animate-spin" : ""} />
                      </button>
                      <button
                        onClick={() => handleCopyLinkedIn(post, post.id)}
                        className={`p-2 rounded-lg transition-all ${linkedInCopyStatus === post.id ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-400 hover:text-indigo-600'}`}
                        title={t.common.copy}
                      >
                        {linkedInCopyStatus === post.id ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                      <button 
                        onClick={() => onDeleteLinkedInPost(post.id)}
                        className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Delete Post"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="prose prose-sm max-w-none mb-6 text-gray-800 whitespace-pre-wrap font-medium">
                    <p className="font-bold text-gray-900 mb-4">{post.hook}</p>
                    {post.content}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                      {post.category}
                    </span>
                    {post.linkedNewsId && (
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Link size={10} /> Contextualized
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};