import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Framework, GeminiModel, UploadedFile, TokenUsage, ALL_GEMINI_MODELS } from '../../types/index.ts';
import { XCircleIcon, SparklesIcon, CheckCircleIcon, ArrowPathIcon, DocumentTextIcon, CpuChipIcon, ListBulletIcon, PlayIcon, ArrowsPointingOutIcon, WrenchScrewdriverIcon, GlobeAltIcon, TableCellsIcon, SaveDiskIcon, ClipboardIcon, CloudArrowUpIcon, BookOpenIcon, ArrowDownTrayIcon, ArrowsRightLeftIcon, ClockIcon, AdjustmentsHorizontalIcon, BeakerIcon } from '../shared/Icons.tsx';
import { optimizePrompt, expandIdea, ModelSettings, quickRefine, modifyContentLength } from '../../lib/geminiService.ts';

export type DashboardActionType = 'expand' | 'optimize' | 'magic' | 'fix' | 'translate' | 'simplify' | 'save' | 'copy' | 'create_session';

interface HistoryItem {
    id: string;
    timestamp: Date;
    result: string;
    usage?: TokenUsage;
    settings: any;
}

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
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [showCompare, setShowCompare] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Custom Parameters State
    const [customInstructions, setCustomInstructions] = useState('');
    const [targetLang, setTargetLang] = useState(outputLanguage || 'Inglés');
    const [temperature, setTemperature] = useState(modelSettings.temperature);
    const [selectedModel, setSelectedModel] = useState<GeminiModel>(modelSettings.selectedModel);
    const [selectedTone, setSelectedTone] = useState<string>('neutral');
    const [maxOutputTokens, setMaxOutputTokens] = useState(modelSettings.maxOutputTokens || 8192);

    const TONES = [
        { id: 'neutral', name: 'Neutral', prompt: 'Mantén un tono neutral y equilibrado.' },
        { id: 'formal', name: 'Formal', prompt: 'Usa un lenguaje formal, profesional y sofisticado.' },
        { id: 'creative', name: 'Creativo', prompt: 'Sé creativo, usa metáforas y un lenguaje inspirador.' },
        { id: 'casual', name: 'Casual', prompt: 'Usa un tono cercano, amigable y conversacional.' },
        { id: 'technical', name: 'Técnico', prompt: 'Sé preciso, técnico y directo al grano.' }
    ];

    const MODELS: GeminiModel[] = ALL_GEMINI_MODELS;

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
            case 'save': return { title: 'Gestión de Guardado', icon: <SaveDiskIcon className="w-6 h-6" />, color: 'orange' };
            case 'copy': return { title: 'Copiado al Portapapeles', icon: <ClipboardIcon className="w-6 h-6" />, color: 'teal' };
            case 'create_session': return { title: 'Nueva Sesión', icon: <SparklesIcon className="w-6 h-6" />, color: 'sky' };
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
            addLog(`Modelo seleccionado: ${selectedModel}`, 'info');
            addLog(`Analizando texto base (${ideaText.length} caracteres)...`, 'info');
        }

        try {
            let response;
            
            const tonePrompt = TONES.find(t => t.id === selectedTone)?.prompt || '';
            const modifiedSettings = {
                ...modelSettings,
                selectedModel,
                temperature,
                maxOutputTokens,
                systemInstruction: `${modelSettings.systemInstruction || ''}
                ${tonePrompt}
                ${customInstructions ? `\n\nInstrucciones adicionales del usuario: ${customInstructions}` : ''}`
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
            } else if (actionType === 'save') {
                addLog('Preparando guardado de sesión...', 'info');
                if (localAction) {
                    localAction();
                    addLog('Sesión procesada correctamente.', 'success');
                }
                await new Promise(resolve => setTimeout(resolve, 1200));
                response = { text: 'Tu trabajo ha sido guardado exitosamente en el historial. Puedes acceder a él desde la biblioteca en cualquier momento.', usage: undefined };
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
            
            // Update History
            const newHistoryItem: HistoryItem = {
                id: Math.random().toString(36).substr(2, 9),
                timestamp: new Date(),
                result: response.text,
                usage: response.usage,
                settings: { selectedModel, temperature, selectedTone, customInstructions }
            };
            setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));

            onComplete(response.text, response.usage);

        } catch (error: any) {
            addLog(`Error: ${error.message || 'Fallo en la comunicación con la API'}`, 'error');
            setStatus('error');
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(result);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([result], {type: 'text/plain'});
        element.href = URL.createObjectURL(file);
        element.download = `resultado_${actionType}_${new Date().getTime()}.txt`;
        document.body.appendChild(element);
        element.click();
    };

    const estimatedCost = useMemo(() => {
        if (!usage) return null;
        const inputCost = (usage.promptTokens / 1000000) * 0.15; // Approx for Flash
        const outputCost = (usage.candidatesTokens / 1000000) * 0.60;
        return (inputCost + outputCost).toFixed(6);
    }, [usage]);

    if (!isOpen) return null;

    const details = getActionDetails();

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 w-full max-w-6xl h-[90vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
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
                            <div className="flex items-center gap-4 mt-1">
                                <p className="text-sm text-gray-400 font-medium">Dashboard de Procesamiento Avanzado</p>
                                {usage && (
                                    <div className="flex items-center gap-2 px-2 py-0.5 bg-white/5 rounded-lg border border-white/10">
                                        <span className="text-[10px] text-gray-500 font-bold uppercase">Costo Est:</span>
                                        <span className="text-[10px] text-emerald-400 font-mono">${estimatedCost}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-black/40 rounded-xl p-1 border border-white/10">
                            <button 
                                onClick={() => setShowCompare(false)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${!showCompare ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Resultado
                            </button>
                            <button 
                                onClick={() => setShowCompare(true)}
                                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${showCompare ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Comparar
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                            <XCircleIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar - Process Info & Logs */}
                    <div className="w-80 border-r border-white/10 flex flex-col bg-black/20">
                        <div className="p-4 border-b border-white/10 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
                                <AdjustmentsHorizontalIcon className="w-4 h-4" /> Parámetros
                            </h3>
                            
                            {['expand', 'optimize', 'magic', 'fix', 'translate', 'simplify'].includes(actionType) && (
                                <>
                                    <div className="space-y-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] text-gray-500 font-bold uppercase">Modelo</label>
                                            <select 
                                                value={selectedModel}
                                                onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
                                                className="bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                            >
                                                {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] text-gray-500 font-bold uppercase">Tono de Voz</label>
                                            <select 
                                                value={selectedTone}
                                                onChange={(e) => setSelectedTone(e.target.value)}
                                                className="bg-black/40 border border-white/10 rounded-lg px-2 py-2 text-xs text-white focus:outline-none focus:border-purple-500/50"
                                            >
                                                {TONES.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] text-gray-500 font-bold uppercase">Temperatura</label>
                                                <span className="text-[10px] text-gray-400 font-mono">{temperature}</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="0" max="2" step="0.1" 
                                                value={temperature} 
                                                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                                                className={`w-full accent-${details.color}-500`}
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex justify-between items-center">
                                                <label className="text-[10px] text-gray-500 font-bold uppercase">Max Tokens</label>
                                                <span className="text-[10px] text-gray-400 font-mono">{maxOutputTokens}</span>
                                            </div>
                                            <input 
                                                type="range" 
                                                min="1" max="65536" step="1024" 
                                                value={maxOutputTokens} 
                                                onChange={(e) => setMaxOutputTokens(parseInt(e.target.value))}
                                                className={`w-full accent-${details.color}-500`}
                                            />
                                        </div>

                                        {actionType === 'translate' && (
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] text-gray-500 font-bold uppercase">Idioma Destino</label>
                                                <input 
                                                    type="text" 
                                                    value={targetLang}
                                                    onChange={(e) => setTargetLang(e.target.value)}
                                                    className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-green-500/50"
                                                    placeholder="Ej. Inglés, Francés..."
                                                />
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] text-gray-500 font-bold uppercase">Instrucciones Adicionales</label>
                                            <textarea 
                                                value={customInstructions}
                                                onChange={(e) => setCustomInstructions(e.target.value)}
                                                className="bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white resize-none h-20 focus:outline-none focus:border-blue-500/50"
                                                placeholder="Añade reglas específicas para esta ejecución..."
                                            />
                                        </div>

                                        <button 
                                            onClick={runProcess}
                                            disabled={status === 'running'}
                                            className={`w-full py-3 rounded-xl bg-${details.color}-500/20 text-${details.color}-300 hover:bg-${details.color}-500/30 text-xs font-black transition-all flex justify-center items-center gap-2 border border-${details.color}-500/30 shadow-lg`}
                                        >
                                            <ArrowPathIcon className={`w-4 h-4 ${status === 'running' ? 'animate-spin' : ''}`} />
                                            EJECUTAR PROCESO
                                        </button>
                                    </div>

                                    {history.length > 0 && (
                                        <div className="mt-6 space-y-3">
                                            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                                <ClockIcon className="w-3 h-3" /> Historial Reciente
                                            </h3>
                                            <div className="space-y-2">
                                                {history.map((item) => (
                                                    <button 
                                                        key={item.id}
                                                        onClick={() => {
                                                            setResult(item.result);
                                                            setUsage(item.usage);
                                                            setSelectedModel(item.settings.selectedModel);
                                                            setTemperature(item.settings.temperature);
                                                            setSelectedTone(item.settings.selectedTone);
                                                            setCustomInstructions(item.settings.customInstructions);
                                                        }}
                                                        className="w-full p-2 bg-white/5 border border-white/5 rounded-lg text-left hover:bg-white/10 transition-all flex flex-col gap-1"
                                                    >
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[10px] text-gray-400">{item.timestamp.toLocaleTimeString()}</span>
                                                            <span className="text-[9px] px-1 bg-white/10 rounded text-gray-300">{item.settings.selectedModel.split('-')[1]}</span>
                                                        </div>
                                                        <p className="text-[10px] text-gray-500 line-clamp-1">{item.result}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-black/40 font-mono text-[10px]">
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
                                <div className="w-24 h-24 relative mb-6">
                                    <div className={`absolute inset-0 border-4 border-${details.color}-500/10 rounded-full`}></div>
                                    <div className={`absolute inset-0 border-4 border-${details.color}-500 rounded-full border-t-transparent animate-spin`}></div>
                                    <BeakerIcon className={`w-10 h-10 text-${details.color}-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2`} />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2">Procesando con IA</h3>
                                <p className="text-gray-400 max-w-md">
                                    Estamos aplicando los parámetros seleccionados para obtener el mejor resultado posible.
                                </p>
                                <div className="mt-8 w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className={`h-full bg-${details.color}-500 animate-progress-indefinite`}></div>
                                </div>
                            </div>
                        ) : status === 'completed' ? (
                            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                <div className="flex justify-between items-center mb-4">
                                    <div className="flex items-center gap-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <CheckCircleIcon className="w-5 h-5 text-green-400" /> Resultado
                                        </h3>
                                        {usage && (
                                            <div className="flex items-center gap-3 text-[10px] text-gray-500 font-mono">
                                                <span className="flex items-center gap-1"><CpuChipIcon className="w-3 h-3" /> {usage.totalTokens} tokens</span>
                                                <div className="w-20 h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-blue-500" 
                                                        style={{ width: `${Math.min(100, (usage.totalTokens / 4096) * 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={handleCopy}
                                            className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all relative group"
                                            title="Copiar resultado"
                                        >
                                            {isCopied ? <CheckCircleIcon className="w-5 h-5 text-green-400" /> : <ClipboardIcon className="w-5 h-5" />}
                                            {isCopied && <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] px-2 py-1 rounded">Copiado!</span>}
                                        </button>
                                        <button 
                                            onClick={handleDownload}
                                            className="p-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                                            title="Descargar como .txt"
                                        >
                                            <ArrowDownTrayIcon className="w-5 h-5" />
                                        </button>
                                        <div className="w-px h-8 bg-white/10 mx-1" />
                                        {onRunAutoFlow && ['expand', 'optimize'].includes(actionType) && (
                                            <button 
                                                onClick={() => onRunAutoFlow(result)}
                                                className={`px-4 py-2 rounded-xl text-sm font-bold bg-${details.color}-500 text-white hover:bg-${details.color}-400 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)]`}
                                            >
                                                <PlayIcon className="w-4 h-4" /> Correr Flujo
                                            </button>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex-1 flex gap-4 overflow-hidden">
                                    {showCompare && (
                                        <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                                            <label className="text-[10px] text-gray-500 font-bold uppercase">Texto Original</label>
                                            <div className="flex-1 bg-black/20 border border-white/5 rounded-2xl p-4 overflow-y-auto custom-scrollbar text-gray-500 text-sm italic">
                                                {ideaText}
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex-1 flex flex-col gap-2 overflow-hidden">
                                        <label className="text-[10px] text-gray-500 font-bold uppercase">{showCompare ? 'Texto Mejorado' : ''}</label>
                                        <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-6 overflow-y-auto custom-scrollbar text-gray-200 whitespace-pre-wrap text-base leading-relaxed selection:bg-purple-500/30">
                                            {result || 'Acción completada exitosamente sin output de texto.'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : status === 'error' ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                                <XCircleIcon className="w-16 h-16 text-red-500 mb-4" />
                                <h3 className="text-xl font-bold text-white mb-2">Ocurrió un Error</h3>
                                <p className="text-gray-400 mb-6">No se pudo completar el proceso. Revisa los logs para más detalles técnicos.</p>
                                <button 
                                    onClick={runProcess}
                                    className="px-6 py-3 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-2 border border-white/10"
                                >
                                    <ArrowPathIcon className="w-4 h-4" /> Reintentar Proceso
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default ActionDashboardModal;
