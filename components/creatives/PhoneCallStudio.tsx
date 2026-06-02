
import React from 'react';
import { Phone, Compass, Loader2, RefreshCw, Trash2, Send, CheckCircle2, MessageSquare, Hand, Mic, User, LogOut, Zap } from 'lucide-react';
import { Product, Language, PhoneCampaign } from '../../types';
import { getTranslation } from '../../translations';

interface PhoneCallStudioProps {
  product: Product;
  language: Language;
  isPhoneLoading: boolean;
  onUpdate: (val: any) => void;
  onGeneratePhoneScripts: (direction: string) => void;
  customPhoneDirection: string;
  setCustomPhoneDirection: (val: string) => void;
}

export const PhoneCallStudio: React.FC<PhoneCallStudioProps> = ({
  product, language, isPhoneLoading, onUpdate, onGeneratePhoneScripts,
  customPhoneDirection, setCustomPhoneDirection
}) => {
  const t = getTranslation(language);
  const scripts = product.phoneCampaign?.scripts || [];

  return (
    <div className="animate-fade-in w-full">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900 flex items-center gap-3">
            <Phone size={32} className="text-indigo-600" />
            {t.creativesStep.phoneTitle}
          </h2>
          <p className="text-lg text-gray-500 mt-2">{t.creativesStep.phoneSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
            {scripts.length > 0 && (
            <button
                onClick={() => onUpdate({ ...product, phoneCampaign: undefined } as any)}
                className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-2 transition-all bg-white border border-gray-100 rounded-xl"
            >
                <Trash2 size={14} /> {t.common.clearData}
            </button>
            )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Compass size={12} className="text-indigo-500" /> {t.creativesStep.customDirection}
          </label>
          <input
            type="text"
            value={customPhoneDirection}
            onChange={(e) => setCustomPhoneDirection(e.target.value)}
            placeholder="E.g. Focus on recent funding round, or mention a common industry struggle..."
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300"
          />
        </div>
        <button 
          onClick={() => onGeneratePhoneScripts(customPhoneDirection)} 
          disabled={isPhoneLoading} 
          className={`flex justify-center items-center gap-2 px-8 py-3 w-full xl:w-auto rounded-xl font-bold transition-all shadow-lg shrink-0 ${isPhoneLoading ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 active:scale-95'}`}
        >
          {isPhoneLoading ? <Loader2 className="animate-spin" size={18} /> : (scripts.length > 0 ? <RefreshCw size={18} /> : <Phone size={18} />)}
          {scripts.length > 0 ? (isPhoneLoading ? t.common.analyzing : t.creativesStep.refreshPhone) : (isPhoneLoading ? t.common.building : t.creativesStep.buildPhone)}
        </button>
      </div>

      {!scripts.length && !isPhoneLoading && (
        <div className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30 w-full">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
             <Phone size={32} className="text-indigo-200" />
          </div>
          <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{t.creativesStep.phoneTitle}</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-8">{t.creativesStep.phoneDesc}</p>
          <button onClick={() => onGeneratePhoneScripts(customPhoneDirection)} className="bg-white border border-gray-200 px-10 py-4 rounded-2xl font-bold text-indigo-600 shadow-xl hover:shadow-indigo-100 flex items-center mx-auto transition-transform active:scale-95">
            <Mic size={18} className="mr-2" /> {t.creativesStep.generateScripts}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {scripts.map((script, idx) => (
            <div key={idx} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.03)] overflow-hidden hover:shadow-[0_20px_60px_rgba(79,70,229,0.08)] transition-all duration-500">
                <div className="bg-gray-50/50 p-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-md">{idx + 1}</span>
                        <h4 className="font-bold text-gray-900">Script Option {idx + 1}</h4>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">B2B Cold Call</span>
                </div>
                
                <div className="p-8 space-y-8">
                    {/* 1. Opening */}
                    <div className="flex gap-6 relative">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm shrink-0 z-10 border border-emerald-100">
                                <Hand size={18} />
                            </div>
                            <div className="w-0.5 bg-gray-100 flex-1 my-2"></div>
                        </div>
                        <div className="flex-1 pb-4">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.creativesStep.opening}</h5>
                            <p className="text-lg font-medium text-gray-800 leading-relaxed">"{script.opening}"</p>
                        </div>
                    </div>

                    {/* 2. Reason */}
                    <div className="flex gap-6 relative">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm shrink-0 z-10 border border-indigo-100">
                                <CheckCircle2 size={18} />
                            </div>
                            <div className="w-0.5 bg-gray-100 flex-1 my-2"></div>
                        </div>
                        <div className="flex-1 pb-4">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.creativesStep.reason}</h5>
                            <p className="text-lg font-medium text-gray-800 leading-relaxed">"{script.reason}"</p>
                        </div>
                    </div>

                    {/* 3. Observation */}
                    <div className="flex gap-6 relative">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm shrink-0 z-10 border border-amber-100">
                                <User size={18} />
                            </div>
                            <div className="w-0.5 bg-gray-100 flex-1 my-2"></div>
                        </div>
                        <div className="flex-1 pb-4">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.creativesStep.observation}</h5>
                            <p className="text-lg font-medium text-gray-800 leading-relaxed">"{script.observation}"</p>
                        </div>
                    </div>

                    {/* 4. Value Prop */}
                    <div className="flex gap-6 relative">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-sm shrink-0 z-10 border border-blue-100">
                                <Zap size={18} />
                            </div>
                            <div className="w-0.5 bg-gray-100 flex-1 my-2"></div>
                        </div>
                        <div className="flex-1 pb-4">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.creativesStep.valueProp}</h5>
                            <p className="text-lg font-medium text-gray-800 leading-relaxed">"{script.valueProp}"</p>
                        </div>
                    </div>

                    {/* 5. Question */}
                    <div className="flex gap-6 relative">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shadow-sm shrink-0 z-10 border border-purple-100">
                                <MessageSquare size={18} />
                            </div>
                            <div className="w-0.5 bg-gray-100 flex-1 my-2"></div>
                        </div>
                        <div className="flex-1 pb-4">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.creativesStep.question}</h5>
                            <p className="text-lg font-medium text-gray-800 leading-relaxed">"{script.question}"</p>
                        </div>
                    </div>

                    {/* 6. Exit */}
                    <div className="flex gap-6">
                        <div className="flex flex-col items-center">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shadow-sm shrink-0 z-10 border border-gray-200">
                                <LogOut size={18} />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.creativesStep.exit}</h5>
                            <p className="text-lg font-medium text-gray-800 leading-relaxed">"{script.exit}"</p>
                        </div>
                    </div>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};