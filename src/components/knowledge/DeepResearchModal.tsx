
import React, { useState } from 'react';
import { Framework, GeminiModel, TokenUsage } from '../../types';
import { XMarkIcon, GlobeAltIcon, ArrowPathIcon, CheckIcon } from '../shared/Icons.tsx';
import { performDeepResearch } from '../../lib/geminiService.ts';

interface DeepResearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddFramework: (framework: Framework) => void;
    model: GeminiModel;
    onTokenUsageReceived?: (usage: TokenUsage) => void;
}

const DeepResearchModal: React.FC<DeepResearchModalProps> = ({ isOpen, onClose, onAddFramework, model, onTokenUsageReceived }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<Framework[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

    const handleSearch = async () => {
        setIsLoading(true);
        setError(null);
        setResults([]);
        try {
            const foundFrameworks = await performDeepResearch(model);
            setResults(foundFrameworks);
            // Check if usage is attached to first item as per service logic
            if (foundFrameworks.length > 0 && foundFrameworks[0].usage && onTokenUsageReceived) {
                onTokenUsageReceived(foundFrameworks[0].usage);
            }
        } catch (err: any) {
            setError(err.message || "Error desconocido durante la investigación.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAdd = (fw: Framework) => {
        onAddFramework(fw);
        setAddedIds(prev => new Set(prev).add(fw.id));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-400 flex items-center gap-3">
                            <GlobeAltIcon className="w-8 h-8 text-teal-400" />
                            Deep Research: Frameworks
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Busca en arXiv, GitHub y la web técnica nuevos frameworks (2024-2025) con Gemini.</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 p-6 overflow-y-auto">
                    {results.length === 0 && !isLoading && !error && (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 text-center">
                            <div className="p-4 bg-slate-900/50 rounded-full border border-slate-700">
                                <GlobeAltIcon className="w-16 h-16 text-teal-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-200">Exploración Profunda</h3>
                                <p className="text-gray-400 max-w-md mx-auto mt-2">
                                    Usa el motor de búsqueda de Gemini para encontrar las últimas técnicas en Prompt Engineering, Agentes y Contexto.
                                </p>
                            </div>
                            <button 
                                onClick={handleSearch} 
                                className="px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-lg transition-all shadow-lg shadow-teal-900/50 hover:scale-105"
                            >
                                Iniciar Investigación
                            </button>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex flex-col items-center justify-center h-full space-y-4">
                            <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-teal-300 font-medium animate-pulse">Analizando papers y repositorios...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-center p-8">
                            <p className="text-red-400 font-semibold mb-4">{error}</p>
                            <button onClick={handleSearch} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm">Reintentar</button>
                        </div>
                    )}

                    {results.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                            {results.map((fw) => (
                                <div key={fw.id} className="bg-slate-900/60 border border-slate-700 p-5 rounded-lg hover:border-teal-500/50 transition-colors flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-lg font-bold text-teal-300">{fw.acronym}</h3>
                                        <span className="text-[10px] uppercase tracking-wider bg-slate-800 px-2 py-1 rounded text-gray-400 border border-slate-700">{fw.category?.split(' ')[0] || 'Framework'}</span>
                                    </div>
                                    <h4 className="font-semibold text-gray-200 mb-2 text-sm">{fw.name}</h4>
                                    <p className="text-sm text-gray-400 mb-4 flex-grow">{fw.description}</p>
                                    
                                    {fw.source && (
                                        <a href={fw.source.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-400 hover:underline mb-4 block truncate">
                                            Fuente: {fw.source.name}
                                        </a>
                                    )}

                                    <button
                                        onClick={() => handleAdd(fw)}
                                        disabled={addedIds.has(fw.id)}
                                        className={`w-full py-2 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2 ${
                                            addedIds.has(fw.id) 
                                            ? 'bg-green-900/30 text-green-400 border border-green-800 cursor-default'
                                            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-900/20'
                                        }`}
                                    >
                                        {addedIds.has(fw.id) ? (
                                            <>
                                                <CheckIcon className="w-4 h-4" /> Añadido
                                            </>
                                        ) : (
                                            "Añadir a Biblioteca"
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                
                {results.length > 0 && (
                    <div className="p-4 border-t border-slate-700 flex justify-center">
                        <button 
                            onClick={handleSearch}
                            className="flex items-center gap-2 text-slate-400 hover:text-teal-400 transition-colors text-sm font-semibold"
                        >
                            <ArrowPathIcon className="w-4 h-4" />
                            Nueva Búsqueda
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeepResearchModal;
