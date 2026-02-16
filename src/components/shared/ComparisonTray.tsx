import React from 'react';
import { Framework } from '../../types';
import { BeakerIcon, XCircleIcon, TrashIcon } from './Icons';

interface ComparisonTrayProps {
    frameworks: Framework[];
    onCompare: () => void;
    onRemove: (framework: Framework) => void;
    onClear: () => void;
}

const ComparisonTray: React.FC<ComparisonTrayProps> = ({ frameworks, onCompare, onRemove, onClear }) => {
    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-11/12 max-w-4xl z-40">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-lg shadow-2xl p-4 flex items-center justify-between gap-4 animate-fade-in-up">
                <div className="flex items-center gap-3 flex-wrap flex-1">
                    <span className="text-sm font-semibold text-gray-200">Comparando:</span>
                    {frameworks.map(fw => (
                        <div key={fw.id} className="flex items-center gap-1.5 bg-indigo-900/50 text-indigo-200 text-xs font-bold px-2 py-1 rounded-full">
                            <span>{fw.acronym}</span>
                            <button onClick={() => onRemove(fw)} className="hover:text-white">
                                <XCircleIcon className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={onClear} 
                        className="p-2 text-gray-400 hover:text-white transition-colors"
                        title="Limpiar selección"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={onCompare}
                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-md transition-colors font-semibold glow-box-secondary-interactive"
                    >
                        <BeakerIcon className="w-5 h-5" />
                        Comparar ({frameworks.length})
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ComparisonTray;