import React, { useState, useEffect, useRef } from 'react';
import { Framework, GeminiModel, UploadedFile, TokenUsage } from '../../types/index.ts';
import { XCircleIcon, SparklesIcon, CheckCircleIcon, ArrowPathIcon, DocumentTextIcon, CpuChipIcon, ListBulletIcon, PlayIcon, ArrowsPointingOutIcon, WrenchScrewdriverIcon, GlobeAltIcon, TableCellsIcon, SaveDiskIcon, ClipboardIcon, CloudArrowUpIcon, BookOpenIcon } from '../shared/Icons.tsx';
import { optimizePrompt, expandIdea, ModelSettings, quickRefine, modifyContentLength } from '../../lib/geminiService.ts';

export type DashboardActionType = 'expand' | 'optimize' | 'magic' | 'fix' | 'translate' | 'simplify' | 'save' | 'copy' | 'create_session' | 'auto_save';

interface ActionDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    actionType: DashboardActionType;
    ideaText: string;
    useCase?: string;
    framework?: Framework | null;
    files?: UploadedFile[];
    optimizationStyle?: string;
    targetAudience?: string;
    outputLanguage?: string;
    keyInfo?: string;
    negativeConstraints?: string;
    modelSettings: ModelSettings;
    onComplete: (resultText: string, usage?: TokenUsage) => void;
    onRunAutoFlow?: (resultText: string) => void;
    localAction?: () => void; // For local actions like copy, save
}

interface LogEntry {
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

const ActionDashboardModal: React.FC<ActionDashboardModalProps> = ({
    isOpen,
    onClose,
    actionType,
    ideaText,
    useCase = '',
    framework = null,
    files = [],
    optimizationStyle = '',
    targetAudience = '',
    outputLanguage = '',
    keyInfo = '',
    negativeConstraints = '',
    modelSettings,
    onComplete,
    onRunAutoFlow,
    localAction
}) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
    const [result, setResult] = useState<string>('');
    const [usage, setUsage] = useState<TokenUsage | undefined>(undefined);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Custom Parameters State
    const [customInstructions, setCustomInstructions] = useState('');
    const [targetLang, setTargetLang] = useState(outputLanguage || 'Inglés');
    const [temperature, setTemperature] = useState(modelSettings.temperature);

    const addLog = (message: string, type: LogEntry['type'] = 'info') => {
        setLogs(prev => [...prev, { timestamp: new Date(), message, type }]);
    };

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    useEffect(() => {
        if (isOpen && status === 'idle') {
            runProcess();
        }
    }, [isOpen, status]);

    const getActionDetails = () => {
        switch (actionType) {
            case 'expand': return { title: 'Expansión de Idea', icon: <ArrowsPointingOutIcon className="w-6 h-6" />, color: 'indigo' };
            case 'optimize': return { title: 'Optimización de Prompt', icon: <SparklesIcon className="w-6 h-6" />, color: 'purple' };
            case 'magic': return { title: 'Mejora Mágica', icon: <SparklesIcon className="w-6 h-6" />, color: 'fuchsia' };
            case 'fix': return { title: 'Corrección Ortográfica', icon: <WrenchScrewdriverIcon className="w-6 h-6" />, color: 'blue' };
            case 'translate': return { title: 'Traducción', icon: <GlobeAltIcon className="w-6 h-6" />, color: 'green' };
            case 'simplify': return { title: 'Simplificación', icon: <TableCellsIcon className="w-6 h-6" />, color: 'yellow' };
            case 'save': return { title: 'Guardado de Sesión', icon: <SaveDiskIcon className="w-6 h-6" />, color: 'orange' };
            case 'copy': return { title: 'Copiado al Portapapeles', icon: <ClipboardIcon className="w-6 h-6" />, color: 'teal' };
            case 'create_session': return { title: 'Nueva Sesión', icon: <SparklesIcon className="w-6 h-6" />, color: 'sky' };
            case 'auto_save': return { title: 'Configuración de Auto-Guardado', icon: <CloudArrowUpIcon className="w-6 h-6" />, color: 'blue' };
            default: return { title: 'Procesando...', icon: <CpuChipIcon className="w-6 h-6" />, color: 'gray' };
        }
    };

    const runProcess = async () => {
        setStatus('running');
        setLogs([]);
        setResult('');
        
        const details = getActionDetails();
        addLog(`Iniciando proceso: ${details.title}...`, 'info');
        
        const isAIAction = ['expand', 'optimize', 'magic', 'fix', 'translate', 'simplify'].includes(actionType);
        
        if (isAIAction) {
            addLog(`Modelo seleccionado: ${modelSettings.selectedModel}`, 'info');
            addLog(`Analizando texto base (${ideaText.length} caracteres)...`, 'info');
        }

        try {
            let response;
            
            const modifiedSettings = {
                ...modelSettings,
                temperature,
                systemInstruction: customInstructions 
                    ? `${modelSettings.systemInstruction || ''}\n\nInstrucciones adicionales del usuario: ${customInstructions}` 
                    : modelSettings.systemInstruction
            };

            if (actionType === 'translate' && targetLang) {
                modifiedSettings.systemInstruction = `${modifiedSettings.systemInstruction || ''}\n\nIMPORTANTE: Traduce el texto al idioma: ${targetLang}.`;
            }
            
            if (actionType === 'expand') {
                addLog('Generando expansión de contenido y enriquecimiento...', 'info');
                response = await expandIdea(ideaText, files, framework, modifiedSettings);
            } else if (actionType === 'optimize') {
                addLog('Aplicando técnicas de Prompt Engineering...', 'info');
                response = await optimizePrompt(ideaText, useCase, framework!, files, optimizationStyle, targetAudience, outputLanguage, keyInfo, negativeConstraints, modifiedSettings);
            } else if (actionType === 'magic' || actionType === 'fix' || actionType === 'translate') {
                addLog(`Aplicando refinamiento rápido: ${actionType}...`, 'info');
                response = await quickRefine(ideaText, actionType as any, modifiedSettings);
            } else if (actionType === 'simplify') {
                addLog('Simplificando el contenido...', 'info');
                response = await modifyContentLength(ideaText, 'simple', modifiedSettings);
            } else {
                // Local actions
                addLog('Ejecutando acción local...', 'info');
                if (localAction) {
                    localAction();
                }
                await new Promise(resolve => setTimeout(resolve, 800)); // Fake delay for UX
                response = { text: ideaText, usage: undefined };
            }

            addLog('Proceso completado con éxito.', 'success');
            setResult(response.text);
            setUsage(response.usage);
            setStatus('completed');
            
            onComplete(response.text, response.usage);

        } catch (error: any) {
            addLog(`Error: ${error.message || 'Fallo en la comunicación con la API'}`, 'error');
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    const details = getActionDetails();

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 w-full max-w-5xl h-[85vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className={`p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-${details.color}-500/10 to-transparent`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${details.color}-500/20 rounded-xl text-${details.color}-400`}>
                            {details.icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                {details.title}
                            </h2>
                            <p className="text-sm text-gray-400 font-medium">Dashboard de Procesamiento en Tiempo Real</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar - Process Info & Logs */}
                    <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/20">
                        <div className="p-4 border-b border-white/10 flex flex-col gap-3">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <WrenchScrewdriverIcon className="w-4 h-4" /> Configuración
                            </h3>
                            
                            {['expand', 'optimize', 'magic', 'fix', 'translate', 'simplify'].includes(actionType) && (
                                <>
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">Temperatura: {temperature}</label>
                                        <input 
                                            type="range" 
                                            min="0" max="2" step="0.1" 
                                            value={temperature} 
                                            onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                            className={`w-full accent-${details.color}-500`}
                                        />
                                    </div>
                                    {actionType === 'translate' && (
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs text-gray-500">Idioma Destino</label>
                                            <input 
                                                type="text" 
                                                value={targetLang}
                                                onChange={(e) => setTargetLang(e.target.value)}
                                                className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                                placeholder="Ej. Inglés, Francés..."
                                            />
                                        </div>
                                    )}
                                    <div className="flex flex-col gap-1">
                                        <label className="text-xs text-gray-500">Instrucciones Adicionales</label>
                                        <textarea 
                                            value={customInstructions}
                                            onChange={(e) => setCustomInstructions(e.target.value)}
                                            className="bg-black/40 border border-white/10 rounded px-2 py-1 text-xs text-white resize-none h-16"
                                            placeholder="Añade reglas específicas..."
                                        />
                                    </div>
                                    <button 
                                        onClick={runProcess}
                                        disabled={status === 'running'}
                                        className={`mt-2 py-1.5 rounded bg-${details.color}-500/20 text-${details.color}-300 hover:bg-${details.color}-500/30 text-xs font-bold transition-all flex justify-center items-center gap-2`}
                                    >
                                        <ArrowPathIcon className={`w-3 h-3 ${status === 'running' ? 'animate-spin' : ''}`} />
                                        Re-ejecutar
                                    </button>
                                </>
                            )}
                            {['save', 'copy', 'create_session', 'auto_save'].includes(actionType) && (
                                <div className="text-xs text-gray-400">
                                    Esta es una acción local. No requiere parámetros adicionales.
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/40 font-mono text-xs">
                            <div className="space-y-2">
                                {logs.map((log, i) => (
                                    <div key={i} className={`flex gap-2 ${
                                        log.type === 'error' ? 'text-red-400' : 
                                        log.type === 'success' ? 'text-green-400' : 
                                        log.type === 'warning' ? 'text-yellow-400' : 'text-gray-300'
                                    }`}>
                                        <span className="text-gray-600 shrink-0">[{log.timestamp.toLocaleTimeString()}]</span>
                                        <span>{log.message}</span>
                                    </div>
                                ))}
                                {status === 'running' && (
                                    <div className={`flex gap-2 text-${details.color}-400 animate-pulse`}>
                                        <span className="text-gray-600">[{new Date().toLocaleTimeString()}]</span>
                                        <span className="flex items-center gap-2">
                                            <ArrowPathIcon className="w-3 h-3 animate-spin" /> Procesando...
                                        </span>
                                    </div>
                                )}
                                <div ref={logsEndRef} />
                            </div>
                        </div>
                    </div>

                    {/* Main Content - Result */}
                    <div className="flex-1 flex flex-col bg-slate-900/50 relative">
                        {status === 'running' ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <div className="w-20 h-20 relative mb-6">
                                    <div className={`absolute inset-0 border-4 border-${details.color}-500/20 rounded-full`}></div>
                                    <div className={`absolute inset-0 border-4 border-${details.color}-500 rounded-full border-t-transparent animate-spin`}></div>
                                    <CpuChipIcon className={`w-8 h-8 text-${details.color}-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Ejecutando Acción...</h3>
                                <p className="text-gray-400 max-w-md">
                                    Por favor espera mientras se procesa tu solicitud.
                                </p>
                            </div>
                        ) : status === 'completed' ? (
                            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-400" /> Resultado Listo
                                    </h3>
                                    <div className="flex gap-2">
                                        {onRunAutoFlow && ['expand', 'optimize'].includes(actionType) && (
                                            <button 
                                                onClick={() => onRunAutoFlow(result)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold bg-${details.color}-500 text-white hover:bg-${details.color}-400 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)]`}
                                            >
                                                <PlayIcon className="w-4 h-4" /> Correr Flujo Automático
                                            </button>
                                        )}
                                        <button 
                                            onClick={onClose}
                                            className="px-4 py-2 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all"
                                        >
                                            Cerrar Dashboard
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 overflow-y-auto custom-scrollbar text-gray-300 whitespace-pre-wrap text-sm">
                                    {result || 'Acción completada exitosamente sin output de texto.'}
                                </div>
                            </div>
                        ) : status === 'error' ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Ocurrió un Error</h3>
                                <p className="text-gray-400 mb-6">No se pudo completar el proceso. Revisa los logs para más detalles.</p>
                                <button 
                                    onClick={runProcess}
                                    className="px-6 py-2 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-2"
                                >
                                    <ArrowPathIcon className="w-4 h-4" /> Reintentar
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActionDashboardModal;
