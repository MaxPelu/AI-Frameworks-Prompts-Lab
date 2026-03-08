import React from 'react';
import { motion } from 'motion/react';
import { QuestionMarkCircleIcon, XMarkIcon, SparklesIcon, CommandLineIcon, BookOpenIcon, ChartBarIcon, BeakerIcon, ShieldCheckIcon } from './Icons';

interface GuideDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    inlineMode?: boolean;
}

const GuideDashboard: React.FC<GuideDashboardProps> = ({ onClose, inlineMode = false }) => {
    const content = (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-teal-500/20 rounded-lg border border-teal-500/30">
                        <QuestionMarkCircleIcon className="w-6 h-6 text-teal-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">GUÍA DE USUARIO</h2>
                        <p className="text-xs text-gray-500 uppercase tracking-widest">Domina el Laboratorio de Ingeniería de Prompts</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                    <XMarkIcon className="w-6 h-6 text-gray-400" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-8 pr-4">
                <section>
                    <h3 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <SparklesIcon className="w-4 h-4" />
                        Flujo de Trabajo Principal
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            { step: '1. Definir Idea', desc: 'Describe tu objetivo en lenguaje natural en el panel izquierdo.' },
                            { step: '2. Seleccionar Framework', desc: 'Elige una estructura de la biblioteca para guiar al modelo.' },
                            { step: '3. Generar y Refinar', desc: 'Usa el botón "Generar" y luego optimiza con las herramientas AI.' },
                        ].map((item, i) => (
                            <div key={i} className="glass-panel p-5 rounded-2xl border-white/5">
                                <div className="text-xs font-black text-white mb-2">{item.step}</div>
                                <div className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</div>
                            </div>
                        ))}
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <CommandLineIcon className="w-4 h-4" />
                        Comandos Rápidos (Cmd+K)
                    </h3>
                    <div className="glass-panel rounded-2xl overflow-hidden border-white/5">
                        <table className="w-full text-left text-xs">
                            <thead className="bg-white/5 text-gray-400 font-bold uppercase tracking-tighter">
                                <tr>
                                    <th className="px-6 py-3">Comando</th>
                                    <th className="px-6 py-3">Acción</th>
                                    <th className="px-6 py-3">Atajo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {[
                                    { cmd: 'Crear Sesión', action: 'Inicia un nuevo espacio de trabajo limpio.', shortcut: '⌘ + N' },
                                    { cmd: 'Optimizar Prompt', action: 'Mejora el prompt actual usando IA.', shortcut: '⌘ + O' },
                                    { cmd: 'Abrir Arena', action: 'Compara modelos en tiempo real.', shortcut: '⌘ + A' },
                                    { cmd: 'Guardar Versión', action: 'Crea un punto de restauración del prompt.', shortcut: '⌘ + S' },
                                ].map((item, i) => (
                                    <tr key={i} className="hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4 font-bold text-gray-200">{item.cmd}</td>
                                        <td className="px-6 py-4 text-gray-500">{item.action}</td>
                                        <td className="px-6 py-4 text-gray-400 font-mono text-[10px]">{item.shortcut}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h3 className="text-sm font-bold text-purple-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <BeakerIcon className="w-4 h-4" />
                        Herramientas Avanzadas
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="glass-panel p-6 rounded-3xl border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <ChartBarIcon className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="text-sm font-bold text-white">Dashboard de Métricas</div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Monitorea el consumo de tokens, latencia y costos estimados por modelo. Ideal para optimizar la eficiencia de tus aplicaciones LLM.
                            </p>
                        </div>
                        <div className="glass-panel p-6 rounded-3xl border-white/5">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <ShieldCheckIcon className="w-5 h-5 text-red-400" />
                                </div>
                                <div className="text-sm font-bold text-white">Auditoría Red Team</div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Ejecuta pruebas de estrés automáticas para detectar vulnerabilidades como inyección de prompts o fugas de datos sensibles.
                            </p>
                        </div>
                    </div>
                </section>
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

export default GuideDashboard;
