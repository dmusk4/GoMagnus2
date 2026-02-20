
import React, { useState } from 'react';
import { Sparkles, RefreshCw, Zap } from 'lucide-react';
import { generateRefinement, generateSuggestion } from '../services/geminiService';
import { Language, GenerationMode } from '../types';
import { getTranslation } from '../translations';

interface InputWithAIProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label: string;
  value: string;
  onValueChange: (val: string) => void;
  context: string;
  language: Language;
  mode: GenerationMode;
  multiline?: boolean;
  instruction?: string;
  placeholder?: string;
  containerClassName?: string;
  // Fixed: Changed React.RefNode to React.ReactNode as RefNode is not a valid React member
  icon?: React.ReactNode;
  validationClass?: string;
}

export const InputWithAI: React.FC<InputWithAIProps> = ({
  label,
  value,
  onValueChange,
  context,
  language,
  mode,
  multiline = false,
  instruction,
  placeholder,
  containerClassName = "mb-8",
  icon,
  validationClass = "",
  ...props
}) => {
  const [loading, setLoading] = useState(false);
  const t = getTranslation(language);
  
  const simulateTyping = (fullText: string) => {
    let currentIndex = 0;
    const speed = fullText.length > 100 ? 3 : 8;
    onValueChange("");
    const interval = setInterval(() => {
        if (currentIndex < fullText.length) {
            onValueChange(fullText.substring(0, currentIndex + 1));
            currentIndex++;
        } else {
            clearInterval(interval);
            setLoading(false);
        }
    }, speed);
  };

  const handleAIAction = async () => {
    setLoading(true);
    try {
      let result = "";
      if (!value) {
        result = await generateSuggestion(context, label, language, mode, instruction);
      } else {
        result = await generateRefinement(value, context, label, language, mode);
      }
      if (result) simulateTyping(result);
      else setLoading(false);
    } catch (e) {
      setLoading(false);
    }
  };

  const combinedBorderClass = validationClass 
    ? validationClass 
    : loading 
      ? 'border-indigo-400 ring-2 ring-indigo-500/10' 
      : 'border-gray-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500';

  return (
    <div className={`${containerClassName} group`}>
      <label className="block text-sm font-bold text-gray-800 mb-2 flex items-center justify-between">
        <span className="flex items-center">
            {icon && <span className="mr-1.5">{icon}</span>}
            {label}
        </span>
        {loading ? (
          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full flex items-center animate-pulse">
            <Zap size={10} className="mr-1 fill-indigo-600" /> {t.common.turbo}
          </span>
        ) : (
          <div className="flex items-center gap-3">
             {validationClass && <span className="text-[10px] text-red-500 font-bold uppercase">{t.common.required}</span>}
             <button
                onClick={handleAIAction}
                className="text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors flex items-center opacity-0 group-hover:opacity-100 focus:opacity-100"
                title={value ? t.common.refine : t.common.suggest}
              >
                {value ? (
                  <><RefreshCw size={12} className="mr-1" /> {t.common.refine}</>
                ) : (
                  <><Sparkles size={12} className="mr-1" /> {t.common.suggest}</>
                )}
              </button>
          </div>
        )}
      </label>
      <div className="relative">
        {multiline ? (
          <textarea
            className={`w-full bg-white border rounded-xl px-5 py-4 text-base outline-none transition-all resize-none h-32 text-gray-900 placeholder-gray-400 font-medium shadow-sm hover:border-gray-300 ${combinedBorderClass}`}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            {...(props as any)}
          />
        ) : (
          <input
            type="text"
            className={`w-full bg-white border rounded-xl px-5 py-4 text-base outline-none transition-all text-gray-900 placeholder-gray-400 font-medium shadow-sm hover:border-gray-300 ${combinedBorderClass}`}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            placeholder={placeholder}
            disabled={loading}
            {...(props as any)}
          />
        )}
        {!value && !loading && (
          <div className="absolute right-4 top-4 pointer-events-none text-gray-300">
            <Sparkles size={16} />
          </div>
        )}
      </div>
    </div>
  );
};
