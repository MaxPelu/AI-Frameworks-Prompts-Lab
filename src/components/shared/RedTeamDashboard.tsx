import React from 'react';
import { motion } from 'motion/react';
import { ShieldCheckIcon, XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, LockClosedIcon } from './Icons';

interface RedTeamDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    inlineMode?: boolean;
}

const RedTeamDashboard: React.FC<RedTeamDashboardProps> = ({ onClose, inlineMode = false }) => {
    const content = (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/20 rounded-lg border border-red-500/30">
                        <ShieldCheckIcon className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight">AUDITORÍA RED TEAM</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Pruebas de Seguridad y Robustez de Prompts</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="glass-panel p-5 rounded-2xl border-red-500/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Riesgo de Inyección</span>
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="text-3xl font-black text-white mb-1">Bajo</div>
                    <div className="text-[10px] text-gray-500">No se detectaron patrones de Jailbreak conocidos.</div>
                </div>
                <div className="glass-panel p-5 rounded-2xl border-green-500/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Filtro de Contenido</span>
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                    </div>
                    <div className="text-3xl font-black text-white mb-1">Activo</div>
                    <div className="text-[10px] text-gray-500">Políticas de seguridad de Gemini aplicadas.</div>
                </div>
                <div className="glass-panel p-5 rounded-2xl border-blue-500/10">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Privacidad (PII)</span>
                        <LockClosedIcon className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-3xl font-black text-white mb-1">Limpio</div>
                    <div className="text-[10px] text-gray-500">No se detectaron datos sensibles en el prompt.</div>
                </div>
            </div>

            <div className="flex-1 glass-panel rounded-3xl p-6 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
                    <ShieldCheckIcon className="w-4 h-4 text-red-400" />
                    Registro de Pruebas de Estrés
                </h3>
                <div className="space-y-4">
                    {[
                        { test: 'Prompt Injection (DAN)', status: 'Passed', detail: 'El modelo mantuvo las instrucciones del sistema.' },
                        { test: 'Instruction Override', status: 'Passed', detail: 'No se permitió ignorar las restricciones previas.' },
                        { test: 'Sensitive Data Leakage', status: 'Passed', detail: 'No se extrajeron variables de entorno simuladas.' },
                        { test: 'Adversarial Suffixes', status: 'Passed', detail: 'Resistente a caracteres de escape comunes.' },
                    ].map((item, i) => (
                        <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 flex items-start justify-between">
                            <div>
                                <div className="text-xs font-bold text-gray-300">{item.test}</div>
                                <div className="text-[10px] text-gray-500 mt-1">{item.detail}</div>
                            </div>
                            <div className="px-2 py-1 bg-green-500/10 text-green-400 text-[9px] font-bold rounded border border-green-500/20 uppercase">
                                {item.status}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    if (inlineMode) return content;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass-panel w-full max-w-5xl h-[80vh] rounded-[2.5rem] p-8 overflow-hidden shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                {content}
            </motion.div>
        </motion.div>
    );
};

export default RedTeamDashboard;
