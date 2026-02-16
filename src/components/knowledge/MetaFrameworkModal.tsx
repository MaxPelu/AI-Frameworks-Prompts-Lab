
import React, { useState } from 'react';
import { XMarkIcon, SparklesIcon, DiceIcon, CheckIcon } from '../shared/Icons.tsx';
import { Framework, GeminiModel, TokenUsage } from '../../types/index.ts';
import { generateMetaFramework } from '../../lib/geminiService.ts';

interface MetaFrameworkModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddFramework: (fw: Framework) => void;
    model: GeminiModel;
    onTokenUsageReceived?: (usage: TokenUsage) => void;
}

const MetaFrameworkModal: React.FC<MetaFrameworkModalProps> = ({ isOpen, onClose, onAddFramework, model, onTokenUsageReceived }) => {
    const [nicheProblem, setNicheProblem] = useState('');
    const [isForging, setIsForging] = useState(false);
    const [result, setResult] = useState<Framework | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isAdded, setIsAdded] = useState(false);

    const handleForge = async () => {
        if (!nicheProblem.trim()) return;
        setIsForging(true);
        setError(null);
        setResult(null);
        setIsAdded(false);
        try {
            const forged = await generateMetaFramework(nicheProblem, model);
            setResult(forged);
            if (forged.usage && onTokenUsageReceived) {
                onTokenUsageReceived(forged.usage);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsForging(false);
        }
    };

    const handleAdd = () => {
        if (result) {
            onAddFramework(result);
            setIsAdded(true);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto animate-fade-in" aria-modal="true">
            <div className="bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_0_100px_rgba(114,9,183,0.3)] w-full max-w-4xl min-h-[50vh] flex flex-col overflow-hidden relative mb-12">
                
                {/* Background Decor */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-600 rounded-full blur-[120px]"></div>
                </div>

                <header className="flex justify-between items-center p-8 border-b border-white/5 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <DiceIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Meta-Alquimia</h2>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-0.5">Destilación de Metodologías de Nicho</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white">
                        <XMarkIcon className="w-10 h-10" />
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-8 relative z-10 custom-scrollbar">
                    {!result && !isForging && (
                        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-bold text-gray-100 italic">Describe el Problema de Nicho</h3>
                                <p className="text-gray-400 text-sm">Gemini analizará la estructura semántica del problema para forjar un framework único que no existe en los libros de texto.</p>
                            </div>
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                                <textarea
                                    value={nicheProblem}
                                    onChange={(e) => setNicheProblem(e.target.value)}
                                    placeholder="Ej: 'Necesito una forma sistemática de auditar sesgos culturales en traducciones de poesía persa del siglo XII para una IA de preservación histórica...'"
                                    className="relative glass-input w-full h-48 rounded-2xl p-6 text-lg placeholder-gray-600 leading-relaxed"
                                />
                            </div>
                            <button
                                onClick={handleForge}
                                disabled={!nicheProblem.trim()}
                                className="w-full py-5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl font-black text-white uppercase tracking-tighter text-xl shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transition-all active:scale-[0.98] disabled:opacity-30"
                            >
                                Forjar Metodología
                            </button>
                        </div>
                    )}

                    {isForging && (
                        <div className="h-full flex flex-col items-center justify-center gap-8 py-12">
                            <div className="relative">
                                <div className="w-32 h-32 border-8 border-white/5 rounded-full animate-spin border-t-purple-500 border-r-pink-500"></div>
                                <SparklesIcon className="w-12 h-12 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                            </div>
                            <div className="text-center space-y-2">
                                <p className="text-2xl font-black text-white uppercase tracking-tighter italic animate-pulse">Analizando Dimensiones...</p>
                                <p className="text-gray-500 font-mono text-xs">Destilando lógica semántica // Generando mnemotecnia</p>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="max-w-md mx-auto p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-center space-y-4">
                            <p className="text-red-400 font-bold">{error}</p>
                            <button onClick={() => setError(null)} className="glass-button px-6 py-2 rounded-xl text-sm font-bold">Reintentar Alquimia</button>
                        </div>
                    )}

                    {result && (
                        <div className="animate-fade-in-up space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                    <DiceIcon className="w-32 h-32 text-white" />
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs font-black text-purple-400 uppercase tracking-[0.3em]">Nueva Patente Cognitiva</span>
                                    <h3 className="text-5xl font-black text-white italic tracking-tighter uppercase">{result.acronym}</h3>
                                    <p className="text-xl font-bold text-gray-300">{result.name}</p>
                                </div>
                                
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Base Teórica</h4>
                                        <p className="text-gray-300 text-sm leading-relaxed">{result.description}</p>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Ejemplo de Implementación</h4>
                                        <div className="bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[11px] text-teal-400/80 leading-relaxed max-h-48 overflow-y-auto custom-scrollbar italic">
                                            {result.example?.prompt}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setResult(null)} 
                                    className="flex-1 glass-button py-4 rounded-2xl font-bold text-gray-400 hover:text-white"
                                >
                                    Descartar
                                </button>
                                <button 
                                    onClick={handleAdd}
                                    disabled={isAdded}
                                    className={`flex-[2] py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${isAdded ? 'bg-green-600 text-white' : 'bg-white text-slate-900 hover:bg-gray-200'}`}
                                >
                                    {isAdded ? <><CheckIcon className="w-6 h-6" /> Añadido a Biblioteca</> : "Inyectar en Biblioteca"}
                                </button>
                            </div>
                        </div>
                    )}
                </main>
                
                <footer className="p-6 border-t border-white/5 bg-white/5 text-center">
                     <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">© Meta-Framework Engine // Deep Forge Dec 2025</p>
                </footer>
            </div>
        </div>
    );
};

export default MetaFrameworkModal;
