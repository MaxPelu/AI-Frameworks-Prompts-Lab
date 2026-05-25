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
                                <span className="bg-teal-400/20 text-teal-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-teal-500/30 uppercase tracking-widest inline-block mb-3">
                                    Google I/O 2026 Core Flagships Active
                                </span>
                                <h3 className="text-3xl font-black text-white mb-4 tracking-tight">BIENVENIDO AL HUB DE INGENIERÍA</h3>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                                    Esta plataforma está diseñada para transformar ideas abstractas en sistemas de IA deterministas, optimizados y altamente estructurados. Domina el arte de la orquestación a través de flujos automáticos e interactivos.
                                </p>
                            </div>
                            <RocketLaunchIcon className="absolute -right-8 -bottom-8 w-64 h-64 text-teal-500/5 -rotate-12" />
                        </div>

                        <div>
                            <h4 className="text-[10px] font-bold text-teal-400 uppercase tracking-widest pl-1 mb-4">El Flujo de Construcción Interactiva</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { title: '1. Biblioteca Estructurada', desc: 'Selecciona una metodología en el catálogo (ej. Chain of Thought) y cárgala con un clic al lienzo de edición.', icon: LightBulbIcon, color: 'bg-yellow-500/20 text-yellow-400' },
                                    { title: '2. Enrutadores CoT & Budgets', desc: 'Configura el modelo y calibra los Presupuestos Adaptativos de Pensamiento (Low, Medium, High o Super High). El default es 3.5 Flash Medium.', icon: CpuChipIcon, color: 'bg-teal-500/20 text-teal-400' },
                                    { title: '3. Red Teaming & Arena', desc: 'Simula ataques de inyección adversa en el simulador de vulnerabilidades o lanza batallas mano a mano en la Arena.', icon: ShieldCheckIcon, color: 'bg-blue-500/20 text-blue-400' },
                                ].map((step, i) => (
                                    <div key={i} className="glass-panel p-6 rounded-3xl border-white/5 hover:border-white/10 transition-all group">
                                        <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                            <step.icon className="w-6 h-6" />
                                        </div>
                                        <h4 className="text-white font-bold mb-2 text-sm">{step.title}</h4>
                                        <p className="text-xs text-gray-500 leading-relaxed">{step.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl border-white/5 bg-white/5">
                            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                                <SparklesIcon className="w-4 h-4 text-yellow-400" />
                                Novedad: Modelos Estrella de Google I/O 2026
                            </h4>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Soporte para el portafolio de Google insignia: <strong>Gemini 3.5 Flash</strong> (con presupuestos de razonamiento CoT), <strong>Gemini 3.5 Pro</strong> (para la máxima escala analítica) y <strong>Gemini Omni</strong> (inferencia integrada multimodal avanzada).
                            </p>
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
                                <h3 className="text-2xl font-black text-white tracking-tight">INGENIERÍA & MOTORES CoT</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Alineamiento de Pensamiento & Inferencia</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {[
                                { 
                                    title: 'Selección de Framework en Biblioteca', 
                                    desc: 'Escoge entre más de 40 metodologías especializadas. Al pulsar sobre cualquier tarjeta del panel, el prompt de esa metodología se importa instantáneamente al editor activo.' 
                                },
                                { 
                                    title: 'Presupuestos de Pensamiento Adaptativos (Thinking Budgets)', 
                                    desc: 'Asignados especialmente a Gemini 3.5 Flash. Tienes botones dedicados en el panel de control: Low (pensamiento rápido), Medium (el predeterminado balanceado), High (razonamiento analítico profundo) y Super High (máxima deducción analítica).' 
                                },
                                { 
                                    title: 'Alineación Inteligente de Tokens', 
                                    desc: 'Cuando seleccionas motores que requieren CoT, la app incrementa automáticamente de forma virtual el buffer del límite máximo (+2048 tokens de salida) al límite parametrizado. Esto previene de forma automatizada los errores "Invalid Argument" nativos de la API de Google, dando una ejecución completamente blindada.' 
                                },
                                { 
                                    title: 'Tuning de Parámetros Técnicos', 
                                    desc: 'Personaliza todos los valores clave del motor: Temperatura (coeficiente lúdico), Top-P (núcleo probabilístico), Top-K (filtro léxico), Penalización de Frecuencia y Presencia para influir con máxima precisión.' 
                                }
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
                                <h3 className="text-2xl font-black text-white tracking-tight">BIBLIOTECA & NAVEGACIÓN SEMÁNTICA</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Alineamiento y Filtros Rápidos de Frameworks</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-panel p-6 rounded-3xl border-white/5">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <AcademicCapIcon className="w-4 h-4 text-blue-400" />
                                    Categorías de Conocimiento
                                </h4>
                                <ul className="space-y-3">
                                    {['Software Architecture (Hexagonal o Limpios)', 'TDD y Calidad (RGR-Cycle, Mutation, Mutation, Contract Tests)', 'Estrategias Agile, Scrum Avanzado y WSJF', 'Orquestación de Agentes Multi-Rol'].map((step, i) => (
                                        <li key={i} className="flex items-center gap-3 text-xs text-gray-500">
                                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="glass-panel p-6 rounded-3xl border-white/5">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <WrenchScrewdriverIcon className="w-4 h-4 text-blue-400" />
                                    Acciones del Panel de Frameworks
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Puedes filtrar de inmediato todas las fórmulas SOTA, ver la descripción técnica, abrir la URL de la especificación científica en un clic, o inyectar el prompt base estructurado al editor principal usando los botones dedicados.
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
                                <h3 className="text-2xl font-black text-white tracking-tight">AGENTES & SESIONES DE TRABAJO</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Orquestación Colaborativa Multi-Agente</p>
                            </div>
                        </div>

                        <div className="glass-panel p-8 rounded-[2.5rem] border-white/5 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center">
                                    <div className="text-xl font-black text-white mb-2">1. Instanciar Perfil</div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Crea un perfil Senior o SRE</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-black text-white mb-2">2. Asignar Motor</div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Equipa con Gemini 3.5 Flash</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-black text-white mb-2">3. Chat & Iteración</div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Interactúa para obtener código pulido</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="glass-panel p-6 rounded-3xl border-white/5">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <SparklesIcon className="w-4 h-4 text-orange-400" />
                                    Habilidades Generativas
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Establece flujos interactivos para que el modelo actúe con directivas de sistema avanzadas (por ejemplo, el de SRE L3 para diagnosticar problemas o el frontend centrado en buenas prácticas).
                                </p>
                            </div>
                            <div className="glass-panel p-6 rounded-3xl border-white/5">
                                <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                                    <CommandLineIcon className="w-4 h-4 text-orange-400" />
                                    Batallas en la Arena SOTA
                                </h4>
                                <p className="text-xs text-gray-500 leading-relaxed">
                                    Compara en paralelo el rendimiento de Variante A vs Variante B, o pon a prueba las diferencias entre Gemini 3.5 Pro y Gemini 3.5 Flash en términos de precisión lógica y velocidad de respuesta.
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'eval':
                return (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-emerald-500/20 rounded-2xl border border-emerald-500/30">
                                <ShieldCheckIcon className="w-8 h-8 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">RED TEAMING & SEGURIDAD</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Protección Activa de Directivas contra Inyecciones</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Simulación Automatizada</h4>
                                <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <div className="text-xs font-bold text-emerald-400 mb-2">Simulador de Vulnerabilidades</div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">Ejecuta las pruebas contra vectores de inyección clásicos y avanzados para medir el blindaje de tus instrucciones.</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-white uppercase tracking-widest">Vectores de Pruebas</h4>
                                <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
                                    <div className="text-xs font-bold text-red-400 mb-2">Ataques Simulados</div>
                                    <p className="text-[11px] text-gray-500 leading-relaxed">Analiza la resiliencia instructiva sobre: Prompt Injection (DAN), Jailbreak / Bypass, Filtración de Datos Sensibles y Sufijos Adversarios.</p>
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
                                <h3 className="text-2xl font-black text-white tracking-tight">ESPACIOS DE TRABAJO & EXPORTER</h3>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Organización de Contextos e Integración Multilingüe</p>
                            </div>
                        </div>

                        <div className="glass-panel p-6 rounded-3xl border-white/5">
                            <p className="text-sm text-gray-400 leading-relaxed mb-6">
                                Los espacios de trabajo en el panel izquierdo (con selectores y control de cambios) dividen de forma estricta los contextos de tu proyecto. El historial de versiones guarda detalles del modelo utilizado.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl">
                                    <div className="text-xs font-bold text-white mb-1">Avisos de Exportación SOTA</div>
                                    <p className="text-[10px] text-gray-500">Genera código listo para producción en Python (Google GenAI SDK), Node.js (con JavaScript moderno), o la estructura directa en formato JSON.</p>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl">
                                    <div className="text-xs font-bold text-white mb-1 font-mono">test-models.js Suite</div>
                                    <p className="text-[10px] text-gray-500">Contamos con un motor de test automático local que comprueba que todos los presupuestos de CoT de Gemini 3.5 funcionen con el SDK sin riesgo de caída.</p>
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
                                        { cmd: 'Limpiar Consola', action: 'Limpia el buffer temporal del lienzo.', shortcut: '⌘ + L' },
                                        { cmd: 'Cerrar Todo', action: 'Vuelve a la vista principal.', shortcut: 'ESC' },
                                    ].map((item, i) => (
                                        <tr key={i} className="hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4 font-bold text-gray-200">{item.cmd}</td>
                                            <td className="px-6 py-4 text-gray-400">{item.action}</td>
                                            <td className="px-6 py-4 text-teal-400 font-mono text-[10px]">{item.shortcut}</td>
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
                        "Al usar modelos Thinking, el sistema ajustará automáticamente el Max Output Tokens para garantizar que el modelo tenga espacio para responder después de razonar."
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

