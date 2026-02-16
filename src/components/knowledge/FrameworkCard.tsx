
import React, { useState } from 'react';
import { Framework } from '../../types/index.ts';
import { ChevronDownIcon, BookOpenIcon, WrenchScrewdriverIcon, ArrowsRightLeftIcon } from '../shared/Icons.tsx';

interface FrameworkCardProps {
  framework: Framework;
  onBuild: (framework: Framework) => void;
  onCompare: (framework: Framework) => void;
  isComparing: boolean;
}

const FrameworkCard: React.FC<FrameworkCardProps> = ({ framework, onBuild, onCompare, isComparing }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={`glass-card rounded-xl p-5 flex flex-col justify-between h-full
      ${isComparing 
        ? 'border-indigo-400/50 ring-1 ring-indigo-400/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
        : ''}`}
    >
      <div>
        <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer group">
            <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 drop-shadow-sm">{framework.acronym}</h3>
            <ChevronDownIcon className={`w-5 h-5 text-gray-500 group-hover:text-teal-400 transition-all duration-300 ${isExpanded ? 'rotate-180 text-teal-400' : ''}`} />
            </div>
            <p className="text-sm font-semibold text-gray-200 group-hover:text-white transition-colors">{framework.name}</p>
            <p className="text-xs text-gray-400 mt-2 min-h-[40px] group-hover:text-gray-300 transition-colors line-clamp-3">{framework.description}</p>
        </div>
        
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-4 pt-4 border-t border-white/10' : 'max-h-0'}`}>
            {framework.example && (
                <div className="animate-fade-in mb-4">
                <h4 className="font-semibold text-teal-300 mb-2 text-xs shadow-cyan-glow">Ejemplo: {framework.example.title}</h4>
                <div className="bg-black/30 border border-white/5 p-3 rounded-lg text-xs text-gray-300 whitespace-pre-wrap font-mono shadow-inner">
                    <code>{framework.example.prompt}</code>
                </div>
                </div>
            )}
            {framework.source && (
                <div className="animate-fade-in">
                <a href={framework.source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-400 hover:text-teal-300 transition-colors group">
                    <BookOpenIcon className="w-3 h-3 text-gray-500 group-hover:text-teal-400 transition-colors" />
                    <span className="font-semibold">Fuente:</span>
                    <span className="truncate underline decoration-gray-600 group-hover:decoration-teal-400">{framework.source.name}</span>
                </a>
                </div>
            )}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 flex gap-2">
         <button 
            onClick={() => onBuild(framework)}
            className="flex-1 flex items-center justify-center gap-2 text-xs glass-button text-gray-300 hover:text-teal-300 px-2 py-2 rounded-lg font-semibold"
            title="Usar este framework en el panel de trabajo"
        >
            <WrenchScrewdriverIcon className="w-4 h-4" />
            Construir
        </button>
        <button 
            onClick={() => onCompare(framework)}
            className={`flex-1 flex items-center justify-center gap-2 text-xs px-2 py-2 rounded-lg font-semibold transition-all border ${
                isComparing 
                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 shadow-md' 
                : 'glass-button text-gray-300 hover:text-indigo-300'
            }`}
            title="Añadir a la comparación"
        >
            <ArrowsRightLeftIcon className="w-4 h-4" />
            {isComparing ? 'Seleccionado' : 'Comparar'}
        </button>
      </div>
    </div>
  );
};

export default FrameworkCard;
