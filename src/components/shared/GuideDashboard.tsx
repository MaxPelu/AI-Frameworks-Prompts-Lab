import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    QuestionMarkCircleIcon, XMarkIcon, SparklesIcon, CommandLineIcon, 
    BookOpenIcon, ChartBarIcon, BeakerIcon, ShieldCheckIcon, 
    CircleStackIcon, CpuChipIcon, ScaleIcon, FolderIcon,
    ChevronRightIcon, LightBulbIcon, WrenchScrewdriverIcon,
    AcademicCapIcon, RocketLaunchIcon, ArrowLeftOnRectangleIcon
} from './Icons';

interface GuideDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    inlineMode?: boolean;
}

type GuideSection = 'quickstart' | 'prompting' | 'rag' | 'agents' | 'eval' | 'workspaces' | 'shortcuts';

const GuideDashboard: React.FC<GuideDashboardProps> = ({ isOpen, onClose, inlineMode = false }) => {
    const [activeSection, setActiveSection] = useState<GuideSection>('quickstart');

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    const sections = [
        { id: 'quickstart', label: 'Inicio Rápido', icon: RocketLaunchIcon, color: 'text-teal-400' },
        { id: 'prompting', label: 'Ingeniería de Prompts', icon: SparklesIcon, color: 'text-purple-400' },
        { id: 'rag', label: 'RAG & Datos', icon: CircleStackIcon, color: 'text-blue-400' },
        { id: 'agents', label: 'Agentes AI', icon: CpuChipIcon, color: 'text-orange-400' },
        { id: 'eval', label: 'Evaluación & Seguridad', icon: ScaleIcon, color: 'text-emerald-400' },
        { id: 'workspaces', label: 'Espacios de Trabajo', icon: FolderIcon, color: 'text-indigo-400' },
        { id: 'shortcuts', label: 'Atajos & Comandos', icon: CommandLineIcon, color: 'text-gray-400' },
    ];

    const renderContent = () => {
        switch (activeSection) {
            case 'quickstart':
                return (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="relative p-8 rounded-[2.5rem] bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/20 overflow-hidden">
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">BIENVENIDO AL HUB DE INGENIERÍA</h3>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                                    Esta plataforma está diseñada para transformar ideas abstractas en sistemas de IA deterministas y potentes. Sigue estos flujos para dominar el arte de la orquestación.
                                </p>
                            </div>
                            <RocketLaunchIcon className="absolute -right-8 -bottom-8 w-64 h-64 text-teal-500/5 -rotate-12" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { title: '1. La Idea', desc: 'Escribe tu requerimiento en lenguaje natural. No te preocupes por el formato inicial.', icon: LightBulbIcon, color: 'bg-yellow-500/20 text-yellow-400' },
                                { title: '2. El Framework', desc: 'Aplica una estructura de la biblioteca (ej. Chain of Thought) para dar lógica al modelo.', icon: BookOpenIcon, color: 'bg-teal-500/20 text-teal-400' },
                                { title: '3. El Refinado', desc: 'Usa las herramientas de IA para expandir, corregir o mejorar el prompt generado.', icon: WrenchScrewdriverIcon, color: 'bg-blue-500/20 text-blue-400' },
                            ].map((step, i) => (
                                <div key={i} className="glass-panel p-6 rounded-3xl border-white/5 hover:border-white/10 transition-all group">
                                    <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-white font-bold mb-2">{step.title}</h4>
                                    <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'prompting':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-purple-500/20 rounded-2xl border border-purple-500/30">
                                <SparklesIcon className="w-8 h-8 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">INGENIERÍA DE PROMPTS</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Flujo de diseño estructurado</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { title: 'Selección de Framework', desc: 'Navega por las categorías (Prompting, Coding, Business) para encontrar la estructura ideal. Cada framework añade "railes" cognitivos al modelo.' },
                                { title: 'Configuración del Modelo', desc: 'Ajusta la Temperatura (Creatividad) y el Thinking Budget (Razonamiento). Un presupuesto alto es vital para tareas lógicas complejas.' },
                                { title: 'Iteración con IA', desc: 'Usa el botón "Mejorar" para que Gemini analice tu prompt y sugiera mejoras basadas en principios de ingeniería de contexto.' },
                                { title: 'Control de Versiones', desc: 'Guarda versiones de tus prompts para comparar resultados en la Arena y evitar regresiones.' },
                            ].map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors group">
                                    <div className="text-purple-500 font-mono text-lg font-black opacity-30 group-hover:opacity-100 transition-opacity">0{i+1}</div>
                                    <div>
                                        <h4 className="text-sm font-bold text-gray-200 mb-1">{item.title}</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'rag':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-blue-500/20 rounded-2xl border border-blue-500/30">
                                <CircleStackIcon className="w-8 h-8 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">RAG & GESTIÓN DE DATOS</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Conecta tu conocimiento externo</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-panel p-6 rounded-3xl border-white/5">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <AcademicCapIcon className="w-4 h-4 text-blue-400" />
                                    Flujo de Ingesta
                                </h4>
                                <ul className="space-y-3">
                                    {['Carga de archivos (PDF, MD, TXT)', 'Segmentación (Chunking)', 'Generación de Embeddings', 'Indexación en Vector DB'].map((step, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs text-gray-500">
                                            <div className="w-1 h-1 rounded-full bg-blue-500" />
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="glass-panel p-6 rounded-3xl border-white/5">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <WrenchScrewdriverIcon className="w-4 h-4 text-blue-400" />
                                    Optimización RAG
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Ajusta el tamaño de los fragmentos y el solapamiento para mejorar la precisión de la recuperación. Usa el dashboard de Datos para monitorear el estado de tu base de conocimiento.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'agents':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-orange-500/20 rounded-2xl border border-orange-500/30">
                                <CpuChipIcon className="w-8 h-8 text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">AGENTES AI</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Orquestación de sistemas autónomos</p>
                            </div>
                        </div>

                        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="text-2xl font-black text-white mb-2">1. Perfil</div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Define el rol y el system prompt</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-white mb-2">2. Tools</div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Asigna funciones y APIs externas</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-black text-white mb-2">3. Memoria</div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Configura la retención de contexto</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'eval':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                                <ScaleIcon className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">EVALUACIÓN & SEGURIDAD</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Garantiza la calidad y protección</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Métricas de Calidad</h4>
                                <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <div className="text-xs font-bold text-emerald-400 mb-2">LLM-as-a-Judge</div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">Usa modelos superiores para evaluar la fidelidad, relevancia y tono de las respuestas generadas.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Guardrails</h4>
                                <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <div className="text-xs font-bold text-red-400 mb-2">Protección Activa</div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">Activa filtros de PII y políticas anti-jailbreak para asegurar que tu IA sea segura para producción.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'workspaces':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
                                <FolderIcon className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">ESPACIOS DE TRABAJO</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Organización profesional de proyectos</p>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl border-white/5">
                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                Los espacios de trabajo te permiten aislar contextos. Cada espacio tiene su propio historial, notas, archivos y configuración de agentes.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl">
                                    <div className="text-xs font-bold text-white mb-1">Aislamiento de Datos</div>
                                    <p className="text-[10px] text-gray-500">Las notas y prompts de un espacio no son visibles en otros.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl">
                                    <div className="text-xs font-bold text-white mb-1">Exportación Rápida</div>
                                    <p className="text-[10px] text-gray-500">Descarga todo el contexto de tu proyecto en un solo clic.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 'shortcuts':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-gray-500/20 rounded-2xl border border-gray-500/30">
                                <CommandLineIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">ATAJOS & COMANDOS</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Productividad extrema para ingenieros</p>
                            </div>
                        </div>

                        <div className="glass-panel rounded-3xl overflow-hidden border-white/5">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-white/5 text-gray-400 font-bold uppercase tracking-tighter">
                                    <tr>
                                        <th className="px-6 py-4">Comando</th>
                                        <th className="px-6 py-4">Acción</th>
                                        <th className="px-6 py-4">Atajo</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {[
                                        { cmd: 'Nuevo Espacio', action: 'Inicia un proyecto limpio.', shortcut: '⌘ + N' },
                                        { cmd: 'Optimizar Prompt', action: 'Mejora el prompt actual con IA.', shortcut: '⌘ + O' },
                                        { cmd: 'Abrir Arena', action: 'Compara modelos en paralelo.', shortcut: '⌘ + A' },
                                        { cmd: 'Guardar Versión', action: 'Crea un punto de restauración.', shortcut: '⌘ + S' },
                                        { cmd: 'Buscar Framework', action: 'Abre la biblioteca de conocimiento.', shortcut: '⌘ + F' },
                                        { cmd: 'Cerrar Todo', action: 'Vuelve a la vista principal.', shortcut: 'ESC' },
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
                    </div>
                );
            default:
                return null;
        }
    };

    const content = (
        <div className="flex h-full">
            {/* Sidebar Navigation */}
            <div className="w-72 border-r border-white/10 p-6 flex flex-col gap-2 overflow-y-auto">
                <div className="flex items-center gap-3 mb-8 px-2">
                    <div className="p-2 bg-teal-500/20 rounded-lg">
                        <QuestionMarkCircleIcon className="w-5 h-5 text-teal-400" />
                    </div>
                    <span className="font-black text-white tracking-tighter text-lg uppercase">GUÍA HUB</span>
                </div>

                {sections.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveSection(section.id as GuideSection)}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all group ${
                            activeSection === section.id 
                                ? 'bg-white/10 text-white' 
                                : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'
                        }`}
                    >
                        <div className="flex items-center gap-3">
                            <section.icon className={`w-4 h-4 ${activeSection === section.id ? section.color : 'text-gray-600 group-hover:text-gray-400'}`} />
                            <span className="text-xs font-bold uppercase tracking-wider">{section.label}</span>
                        </div>
                        {activeSection === section.id && <ChevronRightIcon className="w-4 h-4 text-gray-600" />}
                    </button>
                ))}

                <button
                    onClick={onClose}
                    className="flex items-center gap-3 p-3 rounded-xl text-red-400/60 hover:text-red-400 hover:bg-red-400/10 transition-all mt-2"
                >
                    <ArrowLeftOnRectangleIcon className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Cerrar Guía</span>
                </button>

                <div className="mt-auto p-4 bg-teal-500/5 rounded-2xl border border-teal-500/10">
                    <div className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-2">Tip del Día</div>
                    <p className="text-[10px] text-gray-500 leading-relaxed italic">
                        "Usa la Arena para comparar Gemini 3.1 Pro contra Flash y encontrar el equilibrio perfecto entre costo y calidad."
                    </p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                <div className="h-16 border-b border-white/10 flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase tracking-widest">Sección:</span>
                        <span className="text-[10px] text-white font-black uppercase tracking-widest">
                            {sections.find(s => s.id === activeSection)?.label}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <XMarkIcon className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {renderContent()}
                </div>
            </div>
        </div>
    );

    if (inlineMode) return <div className="h-full bg-black/20 rounded-[2.5rem] overflow-hidden border border-white/5">{content}</div>;

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/80 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div 
                initial={{ scale: 0.95, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="glass-panel w-full max-w-6xl h-[85vh] rounded-[3rem] overflow-hidden shadow-2xl border-white/10"
                onClick={e => e.stopPropagation()}
            >
                {content}
            </motion.div>
        </motion.div>
    );
};

export default GuideDashboard;

