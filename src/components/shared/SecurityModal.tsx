import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    XMarkIcon, ShieldCheckIcon, PlusIcon, ExclamationTriangleIcon,
    DocumentTextIcon, AdjustmentsHorizontalIcon, LockClosedIcon, CodeBracketIcon
} from './Icons.tsx';

interface SecurityModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SecurityModal: React.FC<SecurityModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'policies' | 'filters' | 'validation' | 'settings'>('policies');

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
                                <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                                    <ShieldCheckIcon className="w-5 h-5 text-red-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Seguridad</h2>
                            </div>
                            <button className="w-full py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-bold">
                                <PlusIcon className="w-4 h-4" />
                                Nueva Política
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-2">Políticas Activas</div>
                            {['Anti-Jailbreak', 'Filtro PII (Datos Personales)', 'Validación JSON'].map(policy => (
                                <button key={policy} className="w-full flex items-center gap-3 p-3 rounded-lg border border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all">
                                    <LockClosedIcon className="w-4 h-4 shrink-0" />
                                    <span className="font-mono text-xs truncate">{policy}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col bg-slate-900/50">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div>
                                <h1 className="text-2xl font-bold text-white font-mono">Guardrails & Seguridad</h1>
                                <p className="text-sm text-gray-400 mt-1">Implementa defensas contra inyecciones, filtra contenido tóxico y asegura el formato de salida.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 border-b border-white/10 bg-black/20">
                            {[
                                { id: 'policies', label: 'Políticas', icon: ShieldCheckIcon },
                                { id: 'filters', label: 'Filtros (Input)', icon: ExclamationTriangleIcon },
                                { id: 'validation', label: 'Validación (Output)', icon: CodeBracketIcon },
                                { id: 'settings', label: 'Configuración', icon: AdjustmentsHorizontalIcon },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.id 
                                        ? 'border-red-500 text-red-400' 
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
                            {activeTab === 'policies' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">ATAQUES BLOQUEADOS</div>
                                            <div className="text-2xl font-bold text-red-400">42</div>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">POLÍTICAS ACTIVAS</div>
                                            <div className="text-2xl font-bold text-white">3</div>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">NIVEL DE SEGURIDAD</div>
                                            <div className="text-xl font-bold text-emerald-400">ESTRICTO</div>
                                        </div>
                                    </div>
                                    <div className="bg-black/40 border border-white/10 rounded-xl p-6">
                                        <h3 className="text-lg font-bold text-white mb-4">Anti-Jailbreak (Heurística)</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-red-500/30">
                                                <div>
                                                    <div className="text-white font-medium">Bloqueo de "Ignore Previous Instructions"</div>
                                                    <div className="text-sm text-gray-400">Detecta y bloquea intentos comunes de sobreescritura de sistema.</div>
                                                </div>
                                                <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-bold">ACTIVO</div>
                                            </div>
                                            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                                <div>
                                                    <div className="text-white font-medium">Detección de Base64/Hex</div>
                                                    <div className="text-sm text-gray-400">Analiza payloads ofuscados en el prompt del usuario.</div>
                                                </div>
                                                <div className="px-3 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-bold">INACTIVO</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'filters' && (
                                <div className="text-center py-12 text-gray-500">
                                    <ExclamationTriangleIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Filtros de Entrada (PII & Toxicidad)</h3>
                                    <p>Configura la redacción automática de correos, tarjetas de crédito y lenguaje ofensivo.</p>
                                </div>
                            )}
                            {activeTab === 'validation' && (
                                <div className="text-center py-12 text-gray-500">
                                    <CodeBracketIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Validación Estructurada</h3>
                                    <p>Asegura que la salida del modelo cumpla con un JSON Schema específico usando TypeChat o Zod.</p>
                                </div>
                            )}
                            {activeTab === 'settings' && (
                                <div className="text-center py-12 text-gray-500">
                                    <AdjustmentsHorizontalIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Configuración Global</h3>
                                    <p>Ajusta el comportamiento general de los guardrails (bloquear vs. advertir).</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default SecurityModal;
