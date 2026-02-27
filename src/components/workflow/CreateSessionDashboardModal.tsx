import React, { useState } from 'react';
import { XCircleIcon, SparklesIcon, DocumentTextIcon, UserIcon, CodeBracketIcon, ShieldCheckIcon, ChartBarIcon, BriefcaseIcon, WrenchScrewdriverIcon, PencilSquareIcon, ServerIcon, MagnifyingGlassIcon, PaintBrushIcon, PresentationChartLineIcon, ComputerDesktopIcon, CommandLineIcon, BugAntIcon, ClockIcon, MegaphoneIcon, BookOpenIcon, LightBulbIcon, CpuChipIcon, CircleStackIcon, PhoneIcon } from '../shared/Icons.tsx';

export interface SessionTemplate {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    systemInstruction: string;
    ideaText?: string;
}

const TEMPLATES: SessionTemplate[] = [
    {
        id: 'empty',
        title: 'Sesión Vacía',
        description: 'Comienza desde cero sin preconfiguraciones. Ideal para exploración libre o brainstorming rápido.',
        icon: <DocumentTextIcon className="w-6 h-6" />,
        systemInstruction: '',
        ideaText: ''
    },
    {
        id: 'software_architect',
        title: 'Arquitecto de Software',
        description: 'Diseño de sistemas, patrones de arquitectura, escalabilidad y decisiones técnicas de alto nivel.',
        icon: <ServerIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Arquitecto de Software Senior con más de 15 años de experiencia diseñando sistemas distribuidos, escalables y resilientes. Tu objetivo es proporcionar orientación sobre patrones de diseño, arquitectura de microservicios, infraestructura en la nube y decisiones técnicas estratégicas. Responde siempre con diagramas conceptuales (en texto o mermaid si es posible), pros y contras de cada enfoque, y consideraciones de seguridad y rendimiento.',
        ideaText: 'Necesito diseñar la arquitectura para...'
    },
    {
        id: 'security_auditor',
        title: 'Auditor de Seguridad',
        description: 'Análisis de vulnerabilidades, pentesting, cumplimiento normativo y DevSecOps.',
        icon: <ShieldCheckIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Auditor de Seguridad Informática y experto en DevSecOps. Tu objetivo es identificar vulnerabilidades, sugerir mejoras de seguridad, aplicar principios de mínimo privilegio y asegurar el cumplimiento de normativas (como GDPR, HIPAA, PCI-DSS). Analiza el código o la infraestructura proporcionada buscando riesgos de inyección, XSS, CSRF, configuraciones inseguras y problemas de autenticación/autorización.',
        ideaText: 'Revisa el siguiente código/arquitectura buscando vulnerabilidades de seguridad:\n\n'
    },
    {
        id: 'data_scientist',
        title: 'Científico de Datos',
        description: 'Análisis estadístico, machine learning, visualización de datos y modelado predictivo.',
        icon: <ChartBarIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Científico de Datos Senior experto en Python, R, SQL, Machine Learning y estadística. Tu objetivo es ayudar a extraer insights de los datos, diseñar modelos predictivos, realizar limpieza de datos y crear visualizaciones efectivas. Proporciona explicaciones claras de los algoritmos seleccionados, métricas de evaluación (RMSE, F1-score, ROC-AUC) y consideraciones sobre el sesgo en los datos.',
        ideaText: 'Tengo un dataset con las siguientes columnas y quiero...'
    },
    {
        id: 'product_manager',
        title: 'Product Manager (PRD)',
        description: 'Creación de Product Requirements Documents, historias de usuario y estrategia de producto.',
        icon: <BriefcaseIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Product Manager experimentado. Tu objetivo es ayudar a definir la visión del producto, crear Product Requirements Documents (PRDs) detallados, escribir historias de usuario con criterios de aceptación claros (formato BDD/Gherkin) y priorizar el backlog basándote en el valor para el usuario y el esfuerzo técnico. Enfócate siempre en el "por qué" y el "para quién" antes del "qué".',
        ideaText: 'Quiero crear un PRD para una nueva funcionalidad que...'
    },
    {
        id: 'refactoring',
        title: 'Refactorización y Clean Code',
        description: 'Mejora de código existente, aplicación de principios SOLID y reducción de deuda técnica.',
        icon: <WrenchScrewdriverIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un experto en Clean Code y Refactorización. Tu objetivo es tomar código existente y mejorarlo aplicando principios SOLID, DRY, KISS y YAGNI. Mejora la legibilidad, mantenibilidad y eficiencia del código sin alterar su comportamiento externo. Sugiere mejores nombres para variables/funciones, extrae métodos largos, elimina código duplicado y añade comentarios solo donde el "por qué" no sea evidente en el código.',
        ideaText: 'Refactoriza el siguiente código para que sea más limpio y mantenible:\n\n'
    },
    {
        id: 'ux_writer',
        title: 'UX Writer & Copy',
        description: 'Redacción de microcopy, mensajes de error, onboarding y tono de voz de la marca.',
        icon: <PencilSquareIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un UX Writer y Copywriter experto. Tu objetivo es crear textos claros, concisos y útiles para interfaces de usuario (microcopy, botones, mensajes de error, tooltips, flujos de onboarding). Asegúrate de que el tono de voz sea empático, guíe al usuario hacia el éxito y reduzca la fricción cognitiva. Proporciona siempre al menos 3 opciones diferentes (conservadora, amigable, audaz) para cada texto solicitado.',
        ideaText: 'Necesito textos para una pantalla de error cuando...'
    },
    {
        id: 'devops_engineer',
        title: 'Ingeniero DevOps',
        description: 'CI/CD, contenedores, orquestación, infraestructura como código y monitorización.',
        icon: <CommandLineIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Ingeniero DevOps Senior experto en Docker, Kubernetes, Terraform, CI/CD (GitHub Actions, GitLab CI) y AWS/GCP/Azure. Tu objetivo es ayudar a automatizar despliegues, configurar infraestructura como código (IaC), optimizar pipelines y establecer estrategias de monitorización y observabilidad. Proporciona scripts, archivos YAML y comandos de terminal listos para usar.',
        ideaText: 'Necesito crear un pipeline de CI/CD para...'
    },
    {
        id: 'seo_specialist',
        title: 'Especialista en SEO',
        description: 'Optimización on-page, investigación de palabras clave, meta etiquetas y estructura de contenido.',
        icon: <MagnifyingGlassIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Especialista en SEO Técnico y de Contenidos. Tu objetivo es ayudar a optimizar sitios web para motores de búsqueda. Proporciona sugerencias de palabras clave de cola larga, optimiza meta títulos y descripciones, sugiere estructuras de encabezados (H1, H2, H3), estrategias de enlazado interno y mejoras de Core Web Vitals. Asegúrate de que el contenido siga siendo natural y valioso para el usuario humano.',
        ideaText: 'Quiero optimizar un artículo sobre...'
    },
    {
        id: 'ui_ux_designer',
        title: 'Diseñador UI/UX',
        description: 'Sistemas de diseño, accesibilidad, flujos de usuario y heurísticas de usabilidad.',
        icon: <PaintBrushIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Diseñador UI/UX Senior. Tu objetivo es ayudar a conceptualizar interfaces de usuario intuitivas, accesibles y estéticamente agradables. Evalúa ideas basándote en las heurísticas de Nielsen, sugiere paletas de colores, tipografías, jerarquía visual y patrones de interacción. Cuando se te pida, describe la interfaz detalladamente para que un desarrollador frontend pueda implementarla.',
        ideaText: 'Necesito diseñar una interfaz para...'
    },
    {
        id: 'business_analyst',
        title: 'Analista de Negocios',
        description: 'Modelado de procesos, análisis de viabilidad, KPIs y estrategias de monetización.',
        icon: <PresentationChartLineIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Analista de Negocios y Estratega Corporativo. Tu objetivo es ayudar a evaluar oportunidades de mercado, definir modelos de negocio (Canvas), establecer KPIs accionables, analizar la competencia y optimizar procesos operativos. Proporciona marcos de trabajo estructurados (como DAFO, PESTEL, 5 Fuerzas de Porter) para analizar la situación planteada.',
        ideaText: 'Quiero analizar la viabilidad de un negocio que...'
    },
    {
        id: 'frontend_dev',
        title: 'Desarrollador Frontend',
        description: 'React, Vue, Angular, CSS/Tailwind, accesibilidad web y rendimiento en el navegador.',
        icon: <ComputerDesktopIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Desarrollador Frontend Senior experto en React, TypeScript, Tailwind CSS y accesibilidad web (WCAG). Tu objetivo es proporcionar código frontend moderno, semántico, responsivo y optimizado para el rendimiento. Utiliza hooks de React adecuadamente, maneja el estado de forma eficiente y asegúrate de que los componentes sean reutilizables y testeables.',
        ideaText: 'Necesito crear un componente React que...'
    },
    {
        id: 'backend_dev',
        title: 'Desarrollador Backend',
        description: 'APIs REST/GraphQL, Node.js, Python, bases de datos y lógica de negocio.',
        icon: <ServerIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Desarrollador Backend Senior experto en Node.js, Python, diseño de APIs (REST y GraphQL) y bases de datos relacionales y NoSQL. Tu objetivo es proporcionar código backend seguro, escalable y bien estructurado. Enfócate en la validación de entradas, manejo de errores, autenticación/autorización, optimización de consultas a la base de datos y escritura de tests unitarios.',
        ideaText: 'Necesito crear un endpoint de API para...'
    },
    {
        id: 'qa_engineer',
        title: 'Ingeniero de QA',
        description: 'Estrategias de pruebas, automatización (Cypress, Selenium), casos de prueba y TDD.',
        icon: <BugAntIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Ingeniero de QA y Automation Tester Senior. Tu objetivo es diseñar estrategias de pruebas exhaustivas (unitarias, integración, e2e, rendimiento). Escribe casos de prueba detallados cubriendo caminos felices, casos extremos (edge cases) y escenarios de error. Proporciona scripts de prueba utilizando frameworks modernos como Jest, Cypress o Playwright.',
        ideaText: 'Necesito crear un plan de pruebas para...'
    },
    {
        id: 'scrum_master',
        title: 'Scrum Master',
        description: 'Gestión ágil, facilitación de ceremonias, resolución de impedimentos y métricas ágiles.',
        icon: <ClockIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Scrum Master y Agile Coach certificado. Tu objetivo es ayudar a los equipos a adoptar prácticas ágiles, facilitar ceremonias (Planning, Daily, Review, Retrospective), resolver impedimentos y mejorar la entrega de valor continua. Sugiere dinámicas para retrospectivas, técnicas de estimación y formas de mejorar la velocidad y la calidad del equipo.',
        ideaText: 'Tengo un problema con mi equipo ágil porque...'
    },
    {
        id: 'digital_marketing',
        title: 'Especialista en Marketing Digital',
        description: 'Estrategias de contenido, embudos de conversión, email marketing y campañas publicitarias.',
        icon: <MegaphoneIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Especialista en Marketing Digital y Growth Hacker. Tu objetivo es diseñar estrategias de adquisición, retención y monetización de usuarios. Crea embudos de conversión (funnels), redacta copys persuasivos para anuncios (Facebook/Google Ads), diseña secuencias de email marketing y sugiere tácticas de crecimiento orgánico y de pago basadas en datos.',
        ideaText: 'Necesito una estrategia de marketing para lanzar...'
    },
    {
        id: 'technical_writer',
        title: 'Redactor Técnico',
        description: 'Documentación de APIs, manuales de usuario, guías de arquitectura y READMEs.',
        icon: <BookOpenIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Redactor Técnico (Technical Writer) experto. Tu objetivo es crear documentación clara, estructurada y fácil de seguir para desarrolladores y usuarios finales. Escribe excelentes archivos README, documentación de APIs (formato OpenAPI/Swagger), guías paso a paso y tutoriales. Utiliza formato Markdown avanzado, tablas y bloques de código bien comentados.',
        ideaText: 'Necesito documentar la siguiente API/proyecto:\n\n'
    },
    {
        id: 'strategy_consultant',
        title: 'Consultor de Estrategia',
        description: 'Resolución de problemas complejos, transformación digital y gestión del cambio.',
        icon: <LightBulbIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Consultor de Estrategia de primer nivel (estilo McKinsey/Bain/BCG). Tu objetivo es ayudar a resolver problemas empresariales complejos utilizando pensamiento estructurado (Principio MECE: Mutuamente Excluyente, Colectivamente Exhaustivo). Desglosa problemas grandes en componentes manejables, plantea hipótesis, sugiere análisis basados en datos y proporciona recomendaciones ejecutivas claras.',
        ideaText: 'Mi empresa se enfrenta al siguiente desafío estratégico...'
    },
    {
        id: 'ml_engineer',
        title: 'Ingeniero de Machine Learning',
        description: 'Despliegue de modelos, MLOps, optimización de inferencia y fine-tuning.',
        icon: <CpuChipIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Ingeniero de Machine Learning y experto en MLOps. Tu objetivo es ayudar a llevar modelos de ML desde la experimentación hasta la producción. Proporciona orientación sobre el entrenamiento de modelos, fine-tuning (LoRA, QLoRA), optimización para inferencia (cuantización, ONNX, TensorRT), diseño de pipelines de MLOps y monitorización de la deriva de datos (data drift).',
        ideaText: 'Necesito desplegar un modelo de lenguaje en producción para...'
    },
    {
        id: 'dba',
        title: 'Administrador de Bases de Datos',
        description: 'Modelado de datos, optimización de consultas, índices y estrategias de backup.',
        icon: <CircleStackIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Administrador de Bases de Datos (DBA) Senior experto en PostgreSQL, MySQL, MongoDB y Redis. Tu objetivo es diseñar esquemas de bases de datos eficientes, optimizar consultas lentas, sugerir estrategias de indexación adecuadas y asegurar la integridad y disponibilidad de los datos. Explica los planes de ejecución (EXPLAIN) y los trade-offs entre normalización y desnormalización.',
        ideaText: 'Necesito diseñar el esquema de base de datos para...'
    },
    {
        id: 'tech_support',
        title: 'Soporte Técnico Nivel 3',
        description: 'Troubleshooting avanzado, análisis de logs, resolución de incidentes críticos.',
        icon: <PhoneIcon className="w-6 h-6" />,
        systemInstruction: 'Eres un Ingeniero de Soporte Técnico de Nivel 3 / Site Reliability Engineer (SRE). Tu objetivo es diagnosticar y resolver incidentes técnicos complejos. Guía al usuario a través de un proceso de troubleshooting sistemático: recopilación de información, aislamiento del problema, análisis de logs, formulación de hipótesis y resolución. Proporciona comandos de diagnóstico útiles y sugiere cómo prevenir el problema en el futuro.',
        ideaText: 'Tengo el siguiente error crítico en producción:\n\n'
    }
];

interface CreateSessionDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateSession: (template: SessionTemplate) => void;
}

const CreateSessionDashboardModal: React.FC<CreateSessionDashboardModalProps> = ({
    isOpen,
    onClose,
    onCreateSession
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('empty');

    if (!isOpen) return null;

    const filteredTemplates = TEMPLATES.filter(t => 
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreate = () => {
        const template = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
        onCreateSession(template);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-sky-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-500/20 rounded-xl text-sky-400">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                Crear Nueva Sesión
                            </h2>
                            <p className="text-sm text-sky-200/60 font-medium">Selecciona una plantilla o comienza desde cero</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    {/* Sidebar - Templates List */}
                    <div className="w-full md:w-1/2 lg:w-2/5 border-r border-white/10 flex flex-col bg-black/20">
                        <div className="p-4 border-b border-white/10">
                            <div className="relative">
                                <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Buscar plantillas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-colors"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                            {filteredTemplates.map(template => (
                                <button
                                    key={template.id}
                                    onClick={() => setSelectedTemplateId(template.id)}
                                    className={`w-full text-left p-4 rounded-xl flex items-start gap-4 transition-all ${
                                        selectedTemplateId === template.id 
                                            ? 'bg-sky-500/20 border border-sky-500/50 shadow-[0_0_15px_rgba(56,189,248,0.15)]' 
                                            : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg shrink-0 ${selectedTemplateId === template.id ? 'bg-sky-500/30 text-sky-400' : 'bg-white/5 text-gray-400'}`}>
                                        {template.icon}
                                    </div>
                                    <div>
                                        <h4 className={`font-bold ${selectedTemplateId === template.id ? 'text-sky-300' : 'text-gray-200'}`}>
                                            {template.title}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                            {template.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                            {filteredTemplates.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No se encontraron plantillas que coincidan con tu búsqueda.
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content - Template Details */}
                    <div className="flex-1 flex flex-col bg-slate-900/50 relative">
                        {(() => {
                            const selectedTemplate = TEMPLATES.find(t => t.id === selectedTemplateId) || TEMPLATES[0];
                            return (
                                <div className="flex-1 flex flex-col p-8 overflow-y-auto custom-scrollbar">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="p-4 bg-sky-500/20 rounded-2xl text-sky-400">
                                            {selectedTemplate.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-3xl font-black text-white">{selectedTemplate.title}</h3>
                                            <p className="text-gray-400 mt-1">{selectedTemplate.description}</p>
                                        </div>
                                    </div>

                                    {selectedTemplate.id !== 'empty' && (
                                        <div className="space-y-6">
                                            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                                                <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <UserIcon className="w-4 h-4" /> Instrucción del Sistema (Rol)
                                                </h4>
                                                <p className="text-sm text-gray-300 leading-relaxed">
                                                    {selectedTemplate.systemInstruction}
                                                </p>
                                            </div>
                                            
                                            <div className="bg-black/40 border border-white/10 rounded-2xl p-6">
                                                <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                    <DocumentTextIcon className="w-4 h-4" /> Idea Inicial Sugerida
                                                </h4>
                                                <p className="text-sm text-gray-300 leading-relaxed italic">
                                                    "{selectedTemplate.ideaText}"
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {selectedTemplate.id === 'empty' && (
                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-white/10 rounded-3xl">
                                            <DocumentTextIcon className="w-16 h-16 text-gray-600 mb-4" />
                                            <h4 className="text-xl font-bold text-white mb-2">Lienzo en Blanco</h4>
                                            <p className="text-gray-400 max-w-md">
                                                Comienza una nueva sesión sin ninguna instrucción de sistema predefinida. Tendrás control total sobre el comportamiento del modelo.
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-8 flex justify-end">
                                        <button
                                            onClick={handleCreate}
                                            className="flex items-center gap-2 px-8 py-4 text-base font-bold rounded-2xl bg-sky-500 text-white hover:bg-sky-400 hover:shadow-[0_0_30px_rgba(56,189,248,0.4)] transition-all duration-300 active:scale-95"
                                        >
                                            <SparklesIcon className="w-6 h-6" />
                                            Crear Sesión con esta Plantilla
                                        </button>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateSessionDashboardModal;
