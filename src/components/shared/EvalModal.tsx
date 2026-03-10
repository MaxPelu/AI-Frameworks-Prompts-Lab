import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    XMarkIcon, ScaleIcon, CheckCircleIcon, XCircleIcon,
    ChartBarIcon, DocumentTextIcon, AdjustmentsHorizontalIcon, PlayIcon
} from './Icons.tsx';

interface EvalModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const EvalModal: React.FC<EvalModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'suites' | 'metrics' | 'results' | 'settings'>('suites');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-6xl h-[85vh] shadow-2xl flex overflow-hidden"
                >
                    {/* Sidebar */}
                    <div className="w-64 bg-black/40 border-r border-white/10 flex flex-col">
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
                                    <ScaleIcon className="w-5 h-5 text-emerald-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Evaluación</h2>
                            </div>
                            <button className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-bold">
                                <PlayIcon className="w-4 h-4" />
                                Ejecutar Eval
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-2">Suites de Prueba</div>
                            {['Precisión RAG', 'Toxicidad', 'Formato JSON'].map(suite => (
                                <button key={suite} className="w-full flex items-center gap-3 p-3 rounded-lg border border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all">
                                    <DocumentTextIcon className="w-4 h-4 shrink-0" />
                                    <span className="font-mono text-xs truncate">{suite}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col bg-slate-900/50">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div>
                                <h1 className="text-2xl font-bold text-white font-mono">Laboratorio de Evaluación</h1>
                                <p className="text-sm text-gray-400 mt-1">Mide el rendimiento, precisión y seguridad de tus prompts usando LLM-as-a-judge y métricas deterministas.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 border-b border-white/10 bg-black/20">
                            {[
                                { id: 'suites', label: 'Test Suites', icon: DocumentTextIcon },
                                { id: 'metrics', label: 'Métricas', icon: ChartBarIcon },
                                { id: 'results', label: 'Resultados', icon: CheckCircleIcon },
                                { id: 'settings', label: 'Configuración', icon: AdjustmentsHorizontalIcon },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.id 
                                        ? 'border-emerald-500 text-emerald-400' 
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {activeTab === 'suites' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">TESTS PASADOS</div>
                                            <div className="text-2xl font-bold text-emerald-400">85%</div>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">TOTAL EVALUACIONES</div>
                                            <div className="text-2xl font-bold text-white">1,204</div>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">LLM JUEZ</div>
                                            <div className="text-xl font-bold text-purple-400">Gemini 3.1 Pro</div>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">Última Ejecución: Precisión RAG</h3>
                                        <div className="space-y-3">
                                            {[
                                                { name: 'Relevancia del Contexto', score: 0.92, pass: true },
                                                { name: 'Fidelidad (Alucinaciones)', score: 0.88, pass: true },
                                                { name: 'Formato de Salida', score: 0.45, pass: false },
                                            ].map((metric, i) => (
                                                <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                        {metric.pass ? <CheckCircleIcon className="w-5 h-5 text-emerald-400" /> : <XCircleIcon className="w-5 h-5 text-red-400" />}
                                                        <span className="text-gray-200">{metric.name}</span>
                                                    </div>
                                                    <span className={`font-mono font-bold ${metric.pass ? 'text-emerald-400' : 'text-red-400'}`}>
                                                        {metric.score.toFixed(2)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'metrics' && (
                                <div className="text-center py-12 text-gray-500">
                                    <ChartBarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Definición de Métricas</h3>
                                    <p>Crea métricas personalizadas usando LLM-as-a-judge o funciones en Python/JS.</p>
                                </div>
                            )}
                            {activeTab === 'results' && (
                                <div className="text-center py-12 text-gray-500">
                                    <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Historial de Resultados</h3>
                                    <p>Explora el registro histórico de todas las evaluaciones ejecutadas.</p>
                                </div>
                            )}
                            {activeTab === 'settings' && (
                                <div className="text-center py-12 text-gray-500">
                                    <AdjustmentsHorizontalIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Configuración del Juez</h3>
                                    <p>Ajusta el modelo, temperatura y prompts del sistema evaluador.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default EvalModal;
