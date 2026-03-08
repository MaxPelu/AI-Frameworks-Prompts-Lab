import React from 'react';
import { motion } from 'motion/react';
import { MagnifyingGlassIcon, XMarkIcon, CpuChipIcon, SparklesIcon, ChartBarIcon } from './Icons';

interface ForensicDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    inlineMode?: boolean;
}

const ForensicDashboard: React.FC<ForensicDashboardProps> = ({ onClose, inlineMode = false }) => {
    const content = (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
                        <MagnifyingGlassIcon className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">ANÁLISIS FORENSE</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Traza de Razonamiento y Atribución de Salida</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[
                    { icon: <CpuChipIcon className="w-4 h-4" />, label: 'Tokens', value: '1,240', color: 'blue' },
                    { icon: <SparklesIcon className="w-4 h-4" />, label: 'Probabilidad', value: '98.2%', color: 'teal' },
                    { icon: <ChartBarIcon className="w-4 h-4" />, label: 'Latencia', value: '1.4s', color: 'purple' },
                    { icon: <MagnifyingGlassIcon className="w-4 h-4" />, label: 'Confianza', value: 'Alta', color: 'green' },
                ].map((stat, i) => (
                    <div key={i} className="glass-panel p-4 rounded-xl border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`text-${stat.color}-400`}>{stat.icon}</div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</span>
                        </div>
                        <div className="text-xl font-black text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                <div className="glass-panel rounded-2xl p-5 overflow-y-auto border-white/5">
                    <h3 className="text-xs font-bold text-gray-300 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                        Cadena de Pensamiento (CoT)
                    </h3>
                    <div className="space-y-4 font-mono text-[11px] leading-relaxed text-gray-400">
                        <p className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-blue-400 font-bold">[STEP 1]</span> Analizando la intención del usuario... Identificado como solicitud de código Python para análisis de datos.
                        </p>
                        <p className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-blue-400 font-bold">[STEP 2]</span> Recuperando esquemas de la biblioteca Pandas... Cargando funciones read_csv y groupby.
                        </p>
                        <p className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-blue-400 font-bold">[STEP 3]</span> Evaluando restricciones de seguridad... No se detectaron solicitudes de acceso a archivos del sistema.
                        </p>
                        <p className="p-3 bg-white/5 rounded-lg border border-white/5">
                            <span className="text-blue-400 font-bold">[STEP 4]</span> Generando respuesta estructurada... Aplicando formato Markdown y comentarios explicativos.
                        </p>
                    </div>
                </div>

                <div className="glass-panel rounded-2xl p-5 overflow-y-auto border-white/5">
                    <h3 className="text-xs font-bold text-gray-300 mb-4 uppercase tracking-widest flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                        Mapa de Atribución
                    </h3>
                    <div className="space-y-3">
                        {[
                            { source: 'Entrenamiento Base', weight: '70%', color: 'blue' },
                            { source: 'Contexto del Usuario', weight: '20%', color: 'teal' },
                            { source: 'Herramientas Externas', weight: '8%', color: 'purple' },
                            { source: 'Refinamiento de Sistema', weight: '2%', color: 'orange' },
                        ].map((item, i) => (
                            <div key={i} className="space-y-1">
                                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                                    <span>{item.source}</span>
                                    <span>{item.weight}</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full bg-${item.color}-500`} style={{ width: item.weight }} />
                                </div>
                            </div>
                        ))}
                    </div>
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

export default ForensicDashboard;
