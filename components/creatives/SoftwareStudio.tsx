import React, { useState } from 'react';
import { 
  Terminal, Bot, Zap, Copy, CheckCircle2, Loader2, RefreshCw, 
  Trash2, Compass, Layers, Check, ExternalLink, HelpCircle 
} from 'lucide-react';
import { Product, Language, SoftwareRecommendation } from '../../types';

interface SoftwareStudioProps {
  product: Product;
  language: Language;
  isSoftwareLoading: boolean;
  onUpdate: (val: any) => void;
  onGenerateSoftware: (direction: string) => void;
  customSoftwareDirection: string;
  setCustomSoftwareDirection: (val: string) => void;
}

export const SoftwareStudio: React.FC<SoftwareStudioProps> = ({
  product,
  language,
  isSoftwareLoading,
  onUpdate,
  onGenerateSoftware,
  customSoftwareDirection,
  setCustomSoftwareDirection
}) => {
  const isPt = language === 'pt';
  const recommendations = product.softwareRecommendations || [];
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);
  const [isRefreshingTool, setIsRefreshingTool] = useState<boolean>(false);

  const handleRefreshSingleTool = async (idxToReplace: number) => {
    if (isRefreshingTool) return;
    setIsRefreshingTool(true);
    try {
      const targetTool = recommendations[idxToReplace];
      if (!targetTool) return;

      const productContext = `Product: ${product.name}. Description: ${product.description}. ICP: ${product.decisionMaker}`;
      const campaignContext = product.campaignPlan 
        ? `Direction: ${product.campaignPlan.direction}. Core Message: ${product.campaignPlan.coreMessage}` 
        : "";

      const { generateSingleSoftwareRecommendation } = await import('../../services/geminiService');
      const updatedTool = await generateSingleSoftwareRecommendation(
        productContext,
        campaignContext,
        product.location || "Global",
        language,
        'Quality',
        targetTool,
        customSoftwareDirection
      );

      if (updatedTool) {
        const copy = [...recommendations];
        copy[idxToReplace] = updatedTool;
        onUpdate({
          ...product,
          softwareRecommendations: copy
        } as any);
      }
    } catch (e) {
      console.error("Error refreshing single software recommendation:", e);
    } finally {
      setIsRefreshingTool(false);
    }
  };

  // Labels based on language selection
  const labels = {
    title: isPt ? 'Ferramentas & Software' : 'Tools & Software',
    subtitle: isPt 
      ? 'Sugestões de ferramentas web, softwares ou outras aplicações digitais para o seu utilizador cliente final' 
      : 'Suggested web tools, software, or digital applications for your end-user/target client',
    customDirection: isPt ? 'Instruções / Preferências para Ferramentas' : 'Tool Preferences / Guidelines',
    placeholder: isPt 
      ? 'Focar em ferramentas gratuitas, extensões Chrome úteis, apps móveis, etc...' 
      : 'Focus on free tools, useful Chrome extensions, mobile apps...',
    generateBtn: isPt ? 'Gerar Ferramentas' : 'Generate Tools',
    refreshBtn: isPt ? 'Adicionar Novas Ferramentas' : 'Add More Tools',
    generating: isPt ? 'Gerando Ferramentas...' : 'Generating Tools...',
    analyzing: isPt ? 'Adicionando Novas Ferramentas...' : 'Adding New Tools...',
    clearData: isPt ? 'Limpar Dados' : 'Clear Data',
    emptyTitle: isPt ? 'Nenhuma Recomendação de Ferramenta' : 'No Tool Recommendations yet',
    emptyDesc: isPt 
      ? 'Deseja sugerir utilitários digitais, extensões e softwares fantásticos para o seu cliente final utilizar no dia a dia? Vamos mapear as melhores soluções.' 
      : 'Want to suggest useful digital utilities, extensions, and software for your end-user to use in their daily workflow? Let\'s map the best solutions.',
    emptyBtn: isPt ? 'Mapear Ferramentas Recomendadas' : 'Map Recommended Tools',
    overview: isPt ? 'Visão Geral (Aplicações Práticas)' : 'Overview (Practical Applications)',
    objective: isPt ? 'Objetivo / Função Principal' : 'Objective / Main Feature',
    ultimateOutcome: isPt ? 'Resultado Prático para o Cliente' : 'Practical Benefit for the Client',
    why: isPt ? 'Por que esta ferramenta é fantástica para ele?' : 'Why is this tool fantastic for them?',
    mainSystem: isPt ? 'Utilidade Digital Principal' : 'Primary Digital Utility',
    subAgents: isPt ? 'Componentes ou Extensões Recomendadas' : 'Recommended Components or Extensions',
    masterPrompt: isPt ? 'Instruções de Uso Prático ou Prompt Exemplo' : 'Practical Usage Instructions or Example Prompt',
    tasks: isPt ? 'Tutorial Passo a Passo para o Cliente Final' : 'Step-by-Step Tutorial for the End-User',
    copiedLabel: isPt ? 'Copiado!' : 'Copied!',
    copyLabel: isPt ? 'Copiar Prompt' : 'Copy Prompt',
    category: isPt ? 'Categoria' : 'Category'
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const currentIdx = activeIdx < recommendations.length ? activeIdx : 0;
  const tool = recommendations[currentIdx];

  return (
    <div className="animate-fade-in w-full text-left" id="software-studio-root">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-6">
        <div>
          <h2 className="text-4xl font-display font-bold text-gray-900 flex items-center gap-3" id="software-studio-title">
            <Layers size={32} className="text-indigo-600" />
            {labels.title}
          </h2>
          <p className="text-lg text-gray-500 mt-2">{labels.subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          {recommendations.length > 0 && (
            <button
              id="clear-software-recommendations-btn"
              onClick={() => onUpdate({ ...product, softwareRecommendations: undefined } as any)}
              className="px-4 py-2 text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-2 transition-all bg-white border border-gray-100 rounded-xl"
            >
              <Trash2 size={14} /> {labels.clearData}
            </button>
          )}
        </div>
      </div>

      {/* INPUT CONTROLS */}
      <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm mb-12 flex flex-col xl:flex-row xl:items-end justify-between gap-6">
        <div className="flex-1">
          <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2" id="software-custom-direction-label">
            <Compass size={12} className="text-indigo-500" /> {labels.customDirection}
          </label>
          <input
            id="software-custom-direction-input"
            type="text"
            value={customSoftwareDirection}
            onChange={(e) => setCustomSoftwareDirection(e.target.value)}
            placeholder={labels.placeholder}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-gray-300"
          />
        </div>
        <button
          id="generate-software-recommendations-btn"
          onClick={() => onGenerateSoftware(customSoftwareDirection)}
          disabled={isSoftwareLoading}
          className={`flex justify-center items-center gap-2 px-8 py-3 w-full xl:w-auto rounded-xl font-bold transition-all shadow-lg shrink-0 ${
            isSoftwareLoading 
              ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:scale-105 active:scale-95'
          }`}
        >
          {isSoftwareLoading ? <Loader2 className="animate-spin" size={18} /> : (recommendations.length > 0 ? <RefreshCw size={18} /> : <Layers size={18} />)}
          {recommendations.length > 0 
            ? (isSoftwareLoading ? labels.analyzing : labels.refreshBtn) 
            : (isSoftwareLoading ? labels.generating : labels.generateBtn)
          }
        </button>
      </div>

      {/* EMPTY STATE */}
      {recommendations.length === 0 && !isSoftwareLoading && (
        <div className="py-24 text-center border-2 border-dashed border-gray-100 rounded-[3rem] bg-gray-50/30 w-full" id="software-empty-state">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-gray-50">
            <Layers size={32} className="text-indigo-300 animate-pulse" />
          </div>
          <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">{labels.emptyTitle}</h3>
          <p className="text-gray-400 max-w-sm mx-auto mb-8 text-sm">{labels.emptyDesc}</p>
          <button 
            id="empty-generate-software-btn"
            onClick={() => onGenerateSoftware(customSoftwareDirection)} 
            className="bg-white border border-gray-200 px-10 py-4 rounded-2xl font-bold text-indigo-600 shadow-xl hover:shadow-indigo-100/50 flex items-center mx-auto transition-transform active:scale-95 hover:border-indigo-200"
          >
            <Zap size={18} className="mr-2 text-amber-500" /> {labels.emptyBtn}
          </button>
        </div>
      )}

      {/* RENDER ACTIVE RECOMMENDATIONS IN GROWTH HACK STYLE */}
      {recommendations.length > 0 && (
        <div className="space-y-6" id="software-recommendations-wrapper">
          {/* TABS SELECTOR */}
          <div className="flex flex-wrap gap-2 pb-4 mb-2">
            {recommendations.map((rec, idx) => {
              const tabName = rec.name || `Tool ${idx + 1}`;
              return (
                <button
                  id={`software-tab-button-${idx}`}
                  key={idx}
                  onClick={() => setActiveIdx(idx)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                    currentIdx === idx 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                      : 'bg-indigo-50/50 text-indigo-600 hover:bg-indigo-100 border border-indigo-100/20'
                  }`}
                >
                  {tabName}
                </button>
              );
            })}
          </div>

          {tool && (
            <div className="space-y-8 animate-fade-in" id={`software-item-details-${currentIdx}`}>
              {/* PRIMARY INFRASTRUCTURE GRID */}
              <div className="bg-slate-50 border border-slate-200 rounded-[2rem] p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: Conceptual Strategy */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{labels.category}</span>
                        <span className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full text-xs font-bold leading-none uppercase tracking-wider">
                          {tool.category}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRefreshSingleTool(currentIdx)}
                        disabled={isRefreshingTool}
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        title={isPt ? 'Regerar esta sugestão de software com IA' : 'Regenerate this software recommendation with AI'}
                      >
                        <RefreshCw size={11} className={isRefreshingTool ? "animate-spin text-indigo-500" : ""} />
                        {isPt ? 'Recriar esta Sugestão' : 'Regenerate Tool'}
                      </button>
                    </div>

                    {tool.overview && (
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">{labels.overview}</span>
                        <p className="text-[14px] font-medium text-gray-800 leading-relaxed bg-white p-4 rounded-xl shadow-sm border border-gray-100">{tool.overview}</p>
                      </div>
                    )}

                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{labels.objective}</span>
                      <h4 className="text-xl font-bold text-gray-900 leading-tight">{tool.objective}</h4>
                    </div>

                    {tool.ultimateOutcome && (
                      <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl relative overflow-hidden group/success">
                        <div className="absolute -right-2 -bottom-2 opacity-10 group-hover/success:scale-110 transition-transform">
                          <CheckCircle2 size={60} className="text-emerald-600" />
                        </div>
                        <div className="relative z-10 text-left">
                          <span className="text-[9px] font-black text-emerald-600 uppercase tracking-[0.2em] block mb-1">{labels.ultimateOutcome}</span>
                          <p className="text-sm font-bold text-emerald-900 leading-relaxed">{tool.ultimateOutcome}</p>
                        </div>
                      </div>
                    )}

                    {tool.why && (
                      <div>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">{labels.why}</span>
                        <p className="text-[14px] font-medium text-gray-600 leading-relaxed">{tool.why}</p>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Bot / System Architecture */}
                  <div className="flex flex-col justify-start bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                      <Bot size={100} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center justify-center text-center pb-4 border-b border-gray-100 mb-4">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">{labels.mainSystem}</span>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                          <Bot size={24} />
                        </div>
                        <span className="text-xl font-black text-gray-900">{tool.aiAgent}</span>
                      </div>
                    </div>

                    {tool.subAgents && tool.subAgents.length > 0 && (
                      <div className="relative z-10 pt-2 space-y-4">
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block border-b border-gray-100 pb-2 flex items-center gap-2">
                          <Zap size={12} className="text-amber-500" /> {labels.subAgents}
                        </span>
                        <div className="flex flex-col gap-3">
                          {tool.subAgents.map((agent, aIdx) => (
                            <div key={aIdx} className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex justify-center items-center font-bold text-[10px] shrink-0">
                                  <Terminal size={12} />
                                </div>
                                <h5 className="font-bold text-sm text-gray-900">{agent.name}</h5>
                                <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full ml-auto whitespace-nowrap">{agent.role}</span>
                              </div>
                              {agent.skills && agent.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {agent.skills.map((skill, sIdx) => (
                                    <span key={sIdx} className="text-[9px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md font-medium border border-indigo-100/50 flex items-center gap-0.5">
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

              {/* SETUP PROMPT WORKSPACE */}
              {tool.initialPrompt && (
                <div id={`software-prompt-card-${currentIdx}`}>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">{labels.masterPrompt}</span>
                  <div className="bg-gray-900 rounded-[2.5rem] p-8 relative group shadow-lg text-left overflow-hidden">
                    <pre className="text-gray-300 font-mono text-xs whitespace-pre-wrap leading-relaxed max-h-[300px] overflow-y-auto no-scrollbar pb-16">{tool.initialPrompt}</pre>
                    <button
                      className="absolute bottom-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-sm flex items-center gap-2 shadow"
                      onClick={() => handleCopyPrompt(tool.initialPrompt)}
                      title={labels.copyLabel}
                    >
                      {copiedPrompt ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {copiedPrompt ? labels.copiedLabel : labels.copyLabel}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* IMPLEMENTATION TASKS */}
              {tool.tasks && tool.tasks.length > 0 && (
                <div id={`software-tasks-card-${currentIdx}`}>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-emerald-500" /> {labels.tasks}
                  </span>
                  <ul className="space-y-4 text-left">
                    {tool.tasks.map((task, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-black text-xs mt-0.5">
                          {i + 1}
                        </div>
                        <span className="text-[15px] text-gray-700 font-medium leading-relaxed">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
