
import React, { useRef, useEffect } from 'react';
import { StrategyStep } from '../types';
import { CheckCircle2, FileText, Menu, Loader2 } from 'lucide-react';

interface HeaderProps {
  steps: { id: StrategyStep; label: string }[];
  activeStep: StrategyStep;
  setActiveStep: (step: StrategyStep) => void;
  isStepComplete: (stepId: StrategyStep) => boolean;
  onMenuClick?: () => void;
  taskQueue?: Set<string>;
}

export const Header: React.FC<HeaderProps> = ({ steps, activeStep, setActiveStep, isStepComplete, onMenuClick, taskQueue }) => {
  // Split steps into Main Flow (Product -> Sales Page) and Utility (Blueprint)
  const mainSteps = steps.filter(s => s.id !== 'blueprint');
  const blueprintStep = steps.find(s => s.id === 'blueprint');

  // Check if any background generation tasks are active
  const hasActiveTasks = taskQueue && taskQueue.size > 0;

  // Refs for auto-scrolling
  const navContainerRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Only show blueprint if core strategy pillars are ready
  const canShowBlueprint = isStepComplete('dream_buyer') && isStepComplete('market_intel') && isStepComplete('offer') && isStepComplete('campaign_plan');

  // Auto-scroll active step to center on mobile/overflow
  useEffect(() => {
    if (navContainerRef.current && stepRefs.current[activeStep]) {
      const container = navContainerRef.current;
      const activeElement = stepRefs.current[activeStep];
      
      if (activeElement) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();
        
        // Calculate the difference between the center of the element and the center of the container
        const scrollOffset = (activeRect.left + activeRect.width / 2) - (containerRect.left + containerRect.width / 2);
        
        container.scrollBy({
          left: scrollOffset,
          behavior: 'smooth'
        });
      }
    }
  }, [activeStep]);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center px-4 flex-shrink-0 z-10 no-print justify-between gap-4">
      {/* Mobile Menu Button */}
      <button 
        onClick={onMenuClick}
        className="p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg md:hidden"
      >
        <Menu size={24} />
      </button>

      {/* Primary Stepper Flow */}
      <div 
        ref={navContainerRef}
        className="flex items-center overflow-x-auto no-scrollbar mask-linear-fade flex-1 w-full md:w-auto snap-x snap-mandatory scroll-pl-4"
      >
        <div className="flex items-center pr-4 pl-1">
          {mainSteps.map((step, idx) => { 
            const isActive = activeStep === step.id; 
            const isComplete = isStepComplete(step.id); 
            const stepNumber = (idx + 1).toString().padStart(2, '0'); 
            let arrowClass = "nav-arrow-middle"; 
            if (idx === 0) arrowClass = "nav-arrow-start"; 
            
            return (
              <button 
                key={step.id} 
                ref={el => { stepRefs.current[step.id] = el; }}
                onClick={() => setActiveStep(step.id)} 
                className={`flex items-center h-12 px-6 sm:px-8 transition-all duration-300 relative group/nav ${arrowClass} snap-start ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg z-20 scale-105 font-medium' 
                    : isComplete 
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 z-10' 
                      : 'bg-white text-gray-400 hover:bg-gray-50 z-0 border-y border-gray-100'
                } -ml-4 first:ml-0 min-w-fit`}
              >
                <div className="flex items-center">
                  {isComplete && !isActive ? (
                    <CheckCircle2 size={14} className="mr-2 text-emerald-500" />
                  ) : (
                    <span className={`font-display font-bold text-lg mr-2 ${isActive ? 'opacity-100' : 'opacity-40 group-hover/nav:opacity-100'}`}>
                      {stepNumber}
                    </span>
                  )}
                  <span className={`text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap ${isActive ? 'text-white' : isComplete ? 'text-emerald-800' : 'text-gray-400 group-hover/nav:text-gray-600'}`}>
                    {step.label}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Secondary / Utility Section (Blueprint & Background Tasks Status) */}
      <div className="flex items-center gap-3 pl-4 border-l border-gray-200 shrink-0">
        {hasActiveTasks && (
          <div 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/70 text-indigo-700 text-[10px] font-bold tracking-wider animate-pulse shadow-sm"
            title="A IA continua a gerar conteúdos em segundo plano..."
          >
            <Loader2 size={12} className="animate-spin text-indigo-600" />
            <span className="hidden sm:inline">A gerar em segundo plano...</span>
            <span className="sm:hidden">A gerar...</span>
          </div>
        )}

        {blueprintStep && canShowBlueprint && (
          <div className="hidden md:flex items-center">
            <button
                onClick={() => setActiveStep('blueprint')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                    activeStep === 'blueprint'
                    ? 'bg-slate-800 text-white shadow-md'
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                }`}
            >
                <FileText size={14} className={activeStep === 'blueprint' ? 'text-indigo-300' : 'text-gray-400'} />
                {blueprintStep.label}
            </button>
          </div>
        )}
      </div>
    </header>
  );
};