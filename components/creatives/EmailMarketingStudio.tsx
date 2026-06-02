import React from 'react';
/* Added Plus to imports */
import { Mail, Trash2, Zap, Star, Layers, Pencil, Newspaper, Compass, Loader2, Send, Inbox, Check, Copy, ArrowUpRight, Plus, RefreshCw } from 'lucide-react';
import { Product, Language, EmailStyle } from '../../types';
import { getTranslation } from '../../translations';

interface EmailMarketingStudioProps {
  product: Product;
  language: Language;
  isEmailLoading: boolean;
  onUpdate: (val: any) => void;
  onGenerateEmailCampaign: (cat: string, style: EmailStyle, dir: string) => void;
  emailAngles: string[];
  activeEmailAngle: string;
  setActiveEmailAngle: (val: string) => void;
  activeEmailStyle: EmailStyle;
  setActiveEmailStyle: (style: EmailStyle) => void;
  customEmailDirection: string;
  setCustomEmailDirection: (val: string) => void;
  handleCopyEmail: (email: any, idx: number) => void;
  emailCopyStatus: string | null;
  EMAIL_STYLES: EmailStyle[];
}

export const EmailMarketingStudio: React.FC<EmailMarketingStudioProps> = ({
  product, language, isEmailLoading, onUpdate, onGenerateEmailCampaign,
  emailAngles, activeEmailAngle, setActiveEmailAngle, activeEmailStyle, setActiveEmailStyle,
  customEmailDirection, setCustomEmailDirection, handleCopyEmail, emailCopyStatus, EMAIL_STYLES
}) => {
  const t = getTranslation(language);

  // Trigger a full refresh of the campaign
  const handleRefreshCampaign = () => {
    onGenerateEmailCampaign(activeEmailAngle, activeEmailStyle, customEmailDirection);
  };

  return (
    <div className="animate-fade-in w-full">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900">{t.creativesStep.emailTitle}</h2>
          <p className="text-lg text-gray-500 mt-2">{t.creativesStep.emailSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
            {product.emailCampaign && (
            <button
                onClick={() => onUpdate({ ...product, emailCampaign: undefined } as any)}
                className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-2 transition-all bg-white border border-gray-100 rounded-xl"
            >
                <Trash2 size={14} /> {t.common.clearData}
            </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 w-full">
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Zap size={12} className="text-indigo-500" /> {t.creativesStep.chooseAngle}
          </label>
          <div className="flex gap-2 flex-wrap">
            {emailAngles.map(angle => {
              const isRecommended = product.campaignPlan && angle === product.campaignPlan.direction;
              return (
                <button
                  key={angle}
                  onClick={() => setActiveEmailAngle(angle)}
                  className={`relative px-4 py-2 rounded-xl text-[10px] font-bold transition-all border flex items-center gap-2 ${activeEmailAngle === angle
                    ? isRecommended ? 'bg-amber-500 text-white border-amber-600 shadow-lg' : 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : isRecommended ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-sm' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {isRecommended && <Star size={10} className={activeEmailAngle === angle ? 'fill-white' : 'fill-amber-500'} />}
                  <span className="">{angle}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Layers size={12} className="text-indigo-500" /> {t.creativesStep.selectStyle}
          </label>
          <div className="flex gap-2">
            {EMAIL_STYLES.map(style => (
              <button
                key={style}
                onClick={() => setActiveEmailStyle(style)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${activeEmailStyle === style ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
              >
                {style === 'Human-Written' ? <Pencil size={14} /> : <Newspaper size={14} />}
                {style}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Compass size={12} className="text-indigo-500" /> {t.creativesStep.customDirection}
          </label>
          <input
            type="text"
            value={customEmailDirection}
            onChange={(e) => setCustomEmailDirection(e.target.value)}
            placeholder="E.g. Focus on low barrier to entry, or emphasize a 14-day free trial..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300"
          />
        </div>
        <button 
          onClick={handleRefreshCampaign} 
          disabled={isEmailLoading} 
          className={`flex items-center justify-center gap-2 px-8 py-3 w-full xl:w-auto rounded-xl font-bold transition-all shadow-lg whitespace-nowrap shrink-0 ${isEmailLoading ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 active:scale-95'}`}
        >
          {isEmailLoading ? <Loader2 className="animate-spin" size={18} /> : (product.emailCampaign ? <RefreshCw size={18} /> : <Send size={18} />)}
          {product.emailCampaign ? (isEmailLoading ? t.common.analyzing : t.creativesStep.refreshEmail) : (isEmailLoading ? t.common.building : t.creativesStep.buildEmail)}
        </button>
      </div>

      {!product.emailCampaign && !isEmailLoading && (
        <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30 w-full">
          <Inbox size={64} className="text-gray-200 mx-auto mb-6" />
          <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{t.creativesStep.crmStrategy}</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">{t.creativesStep.crmDesc}</p>
          <button onClick={handleRefreshCampaign} className="bg-white border border-gray-200 px-10 py-4 rounded-2xl font-bold text-indigo-600 shadow-xl hover:shadow-indigo-100 flex items-center mx-auto transition-transform active:scale-95">
            <Plus size={18} className="mr-2" /> {t.creativesStep.startSequence}
          </button>
        </div>
      )}

      {product.emailCampaign && (
        <div className="space-y-12 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {[...(product.emailCampaign.emails || [])].reverse().map((email, idx) => (
              <div key={idx} className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col hover:shadow-[0_30px_70px_rgba(79,70,229,0.1)] transition-all duration-500 group/email ${product.emailCampaign?.style === 'Human-Written' ? 'border-t-2 border-t-gray-200' : 'border-t-4 border-t-indigo-600'}`}>
                <div className="bg-gray-50/80 p-8 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-sm ${product.emailCampaign?.style === 'Human-Written' ? 'bg-gray-200 text-gray-600' : 'bg-indigo-100 text-indigo-600'}`}>
                        {product.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-gray-900">{product.name}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium">To: {product.dreamBuyer?.name || 'Customer'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyEmail(email, idx)}
                        className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                      >
                        {emailCopyStatus === idx.toString() ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 leading-tight">
                    {email.subject || ''}
                  </h4>
                </div>

                <div className="flex-1 bg-white">
                  {product.emailCampaign?.style === 'HTML Newsletter' && (
                    <div className="w-full h-24 bg-gradient-to-r from-indigo-50 to-purple-600 flex items-center justify-center">
                      <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.4em]">Newsletter Banner</span>
                    </div>
                  )}

                  <div className={`p-10 md:p-14 ${product.emailCampaign?.style === 'Human-Written' ? 'font-sans' : 'font-sans'}`}>
                    {product.emailCampaign?.style === 'HTML Newsletter' ? (
                      <div
                        className="email-html-content text-slate-800 leading-[1.7] font-medium text-lg prose prose-indigo max-w-none 
                                            [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-3 
                                            [&>p]:mb-4 
                                            [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6
                                            [&>li]:mb-2"
                        dangerouslySetInnerHTML={{ __html: email.body || '' }}
                      />
                    ) : (
                      <div className="text-slate-800 leading-[1.7] font-medium text-lg whitespace-pre-wrap">
                        {email.body || ''}
                      </div>
                    )}

                    {product.emailCampaign?.style === 'HTML Newsletter' && (
                      <div className="mt-12 pt-10 border-t border-gray-50 text-center">
                        <p className="text-indigo-600 font-bold text-lg hover:underline cursor-pointer transition-all inline-flex items-center gap-2 group/action">
                          {email.primaryAction || ''}
                          <ArrowUpRight size={18} className="group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5 transition-transform" />
                        </p>
                      </div>
                    )}
                  </div>

                  {product.emailCampaign?.style === 'HTML Newsletter' && (
                    <div className="p-8 bg-gray-50/50 border-t border-gray-100 flex items-center justify-center gap-6 opacity-30 grayscale pointer-events-none">
                      <div className="w-8 h-8 rounded-lg bg-gray-300" />
                      <div className="w-8 h-8 rounded-lg bg-gray-300" />
                      <div className="w-8 h-8 rounded-lg bg-gray-300" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};