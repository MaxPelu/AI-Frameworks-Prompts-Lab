import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    XMarkIcon, CpuChipIcon, WrenchScrewdriverIcon, DocumentTextIcon, PlusIcon,
    UsersIcon, CodeBracketIcon, AdjustmentsHorizontalIcon, PlayIcon
} from './Icons.tsx';

interface AgentsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AgentsModal: React.FC<AgentsModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'agents' | 'tools' | 'memory' | 'settings'>('agents');

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
                                <div className="p-2 bg-orange-500/20 rounded-lg border border-orange-500/30">
                                    <CpuChipIcon className="w-5 h-5 text-orange-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Agentes AI</h2>
                            </div>
                            <button className="w-full py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-bold">
                                <PlusIcon className="w-4 h-4" />
                                Nuevo Agente
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-2">Agentes Activos</div>
                            {['Investigador Web', 'Analista de Datos', 'Revisor de Código'].map(agent => (
                                <button key={agent} className="w-full flex items-center gap-3 p-3 rounded-lg border border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all">
                                    <UsersIcon className="w-4 h-4 shrink-0" />
                                    <span className="font-mono text-xs truncate">{agent}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col bg-slate-900/50">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div>
                                <h1 className="text-2xl font-bold text-white font-mono">Orquestación de Agentes</h1>
                                <p className="text-sm text-gray-400 mt-1">Configura roles, herramientas (Tool Calling) y memoria para sistemas multi-agente.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 border-b border-white/10 bg-black/20">
                            {[
                                { id: 'agents', label: 'Personas', icon: UsersIcon },
                                { id: 'tools', label: 'Herramientas', icon: WrenchScrewdriverIcon },
                                { id: 'memory', label: 'Memoria', icon: DocumentTextIcon },
                                { id: 'settings', label: 'Orquestación', icon: AdjustmentsHorizontalIcon },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.id 
                                        ? 'border-orange-500 text-orange-400' 
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
                            {activeTab === 'agents' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">AGENTES DEFINIDOS</div>
                                            <div className="text-2xl font-bold text-white">3</div>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">HERRAMIENTAS ACTIVAS</div>
                                            <div className="text-2xl font-bold text-orange-400">12</div>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">ARQUITECTURA</div>
                                            <div className="text-xl font-bold text-purple-400">ReAct</div>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">Investigador Web</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-1">System Prompt (Persona)</label>
                                                <textarea 
                                                    readOnly 
                                                    className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-gray-300 font-mono text-sm resize-none"
                                                    value="Eres un investigador experto. Tu objetivo es usar herramientas de búsqueda para encontrar información verificable y resumirla."
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Herramientas Asignadas</label>
                                                <div className="flex gap-2">
                                                    <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-mono border border-orange-500/30">GoogleSearch</span>
                                                    <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-mono border border-orange-500/30">WebScraper</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'tools' && (
                                <div className="text-center py-12 text-gray-500">
                                    <WrenchScrewdriverIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Registro de Herramientas</h3>
                                    <p>Define funciones JSON Schema para que el LLM las ejecute (Function Calling).</p>
                                </div>
                            )}
                            {activeTab === 'memory' && (
                                <div className="text-center py-12 text-gray-500">
                                    <DocumentTextIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Gestión de Memoria</h3>
                                    <p>Configura memoria a corto plazo (Buffer) y largo plazo (Vector DB) para los agentes.</p>
                                </div>
                            )}
                            {activeTab === 'settings' && (
                                <div className="text-center py-12 text-gray-500">
                                    <AdjustmentsHorizontalIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Patrones de Orquestación</h3>
                                    <p>Selecciona entre ReAct, Plan-and-Solve, o flujos secuenciales (Chains).</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default AgentsModal;
