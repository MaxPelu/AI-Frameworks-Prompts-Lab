
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
      className={`relative group rounded-xl p-0.5 transition-all duration-300 h-full
      ${isComparing 
        ? 'bg-gradient-to-br from-teal-400 to-cyan-400 shadow-[0_0_20px_rgba(45,212,191,0.3)]' 
        : 'bg-gradient-to-br from-white/10 to-white/5 hover:from-purple-500/50 hover:to-pink-500/50'}`}
    >
      <div className="bg-[#0F111A] rounded-[10px] h-full flex flex-col overflow-hidden relative">
        {/* Bottom Glow Line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500 opacity-80"></div>

        <div className="p-5 flex flex-col h-full">
            <div onClick={() => setIsExpanded(!isExpanded)} className="cursor-pointer flex-grow">
                {/* Tag */}
                <div className="mb-3">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-500/30 text-[10px] font-bold text-purple-300 uppercase tracking-wider">
                        {framework.category || 'PROMPTING'}
                    </span>
                </div>

                {/* Title & Icon */}
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-xl font-black text-white leading-tight tracking-tight group-hover:text-purple-200 transition-colors">
                        {framework.acronym}
                    </h3>
                    <ChevronDownIcon className={`w-5 h-5 text-gray-500 group-hover:text-white transition-all duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {/* Subtitle */}
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">
                    {framework.name}
                </p>

                {/* Description */}
                <p className="text-xs text-gray-400 leading-relaxed line-clamp-3 group-hover:text-gray-300 transition-colors">
                    {framework.description}
                </p>
            </div>
            
            {/* Expanded Content */}
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-96 mt-4 pt-4 border-t border-white/10' : 'max-h-0'}`}>
                {framework.example && (
                    <div className="animate-fade-in mb-4">
                    <h4 className="font-bold text-purple-300 mb-2 text-[10px] uppercase tracking-wider">Ejemplo: {framework.example.title}</h4>
                    <div className="bg-black/40 border border-white/5 p-3 rounded-lg text-xs text-gray-300 whitespace-pre-wrap font-mono shadow-inner">
                        <code>{framework.example.prompt}</code>
                    </div>
                    </div>
                )}
                {framework.source && (
                    <div className="animate-fade-in">
                    <a href={framework.source.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs text-gray-500 hover:text-purple-300 transition-colors group/link">
                        <BookOpenIcon className="w-3 h-3" />
                        <span className="font-bold">Fuente:</span>
                        <span className="truncate underline decoration-gray-700 group-hover/link:decoration-purple-400">{framework.source.name}</span>
                    </a>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-white/5 flex flex-col gap-2">
                <div className="flex gap-2">
                    <button 
                        onClick={() => onBuild(framework)}
                        className="flex-1 flex items-center justify-center gap-2 text-xs bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/50 text-gray-300 hover:text-white px-2 py-2 rounded-lg font-bold transition-all uppercase tracking-wide"
                        title="Usar este framework"
                    >
                        <WrenchScrewdriverIcon className="w-3.5 h-3.5" />
                        Construir
                    </button>
                    <button 
                        onClick={() => onCompare(framework)}
                        className={`flex-1 flex items-center justify-center gap-2 text-xs px-2 py-2 rounded-lg font-bold transition-all border uppercase tracking-wide ${
                            isComparing 
                            ? 'bg-teal-500/20 border-teal-400/50 text-teal-200' 
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-400 hover:text-white'
                        }`}
                        title="Comparar"
                    >
                        <ArrowsRightLeftIcon className="w-3.5 h-3.5" />
                        {isComparing ? 'Listo' : 'Comparar'}
                    </button>
                </div>
                {framework.source && (
                    <a 
                        href={framework.source.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 text-xs bg-orange-600 hover:bg-orange-500 text-white px-2 py-2 rounded-lg font-bold transition-all uppercase tracking-wide"
                    >
                        <BookOpenIcon className="w-3.5 h-3.5" />
                        Documentación
                    </a>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FrameworkCard;
