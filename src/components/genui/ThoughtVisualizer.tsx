
import React, { useState } from 'react';
import { ChevronDownIcon, SparklesIcon } from '../shared/Icons.tsx';

interface ThoughtVisualizerProps {
    thought: string;
}

const ThoughtVisualizer: React.FC<ThoughtVisualizerProps> = ({ thought }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!thought) return null;

    return (
        <div className="mb-4 animate-fade-in">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 border ${
                    isExpanded 
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
            >
                <div className="flex items-center gap-3">
                    <div className={`p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 ${!isExpanded && 'animate-pulse'}`}>
                        <SparklesIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Deep Reasoning Trace</span>
                        <p className="text-[10px] text-gray-500 leading-none">Internal thought process captured</p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform duration-500 ${isExpanded ? 'rotate-180 text-indigo-400' : ''}`} />
            </button>
            
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                <div className="bg-black/40 border border-indigo-500/20 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-indigo-200/80 shadow-inner">
                    <div className="flex items-center gap-2 mb-3 border-b border-indigo-500/10 pb-2">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></span>
                        <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tighter">Thinking Log // Dec 2025</span>
                    </div>
                    <p className="whitespace-pre-wrap italic">
                        {thought}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ThoughtVisualizer;
