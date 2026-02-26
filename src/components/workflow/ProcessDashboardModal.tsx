import React, { useState, useEffect, useRef } from 'react';
import { Framework, GeminiModel, UploadedFile, TokenUsage } from '../../types/index.ts';
import { XCircleIcon, SparklesIcon, CheckCircleIcon, ArrowPathIcon, DocumentTextIcon, CpuChipIcon, ListBulletIcon, PlayIcon, ArrowsPointingOutIcon } from '../shared/Icons.tsx';
import { optimizePrompt, expandIdea, ModelSettings } from '../../lib/geminiService.ts';

interface ProcessDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    actionType: 'expand' | 'optimize';
    ideaText: string;
    useCase: string;
    framework: Framework | null;
    files: UploadedFile[];
    optimizationStyle: string;
    targetAudience: string;
    outputLanguage: string;
    keyInfo: string;
    negativeConstraints: string;
    modelSettings: ModelSettings;
    onComplete: (resultText: string, usage?: TokenUsage) => void;
    onRunAutoFlow: (resultText: string) => void;
}

interface LogEntry {
    timestamp: Date;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

const ProcessDashboardModal: React.FC<ProcessDashboardModalProps> = ({
    isOpen,
    onClose,
    actionType,
    ideaText,
    useCase,
    framework,
    files,
    optimizationStyle,
    targetAudience,
    outputLanguage,
    keyInfo,
    negativeConstraints,
    modelSettings,
    onComplete,
    onRunAutoFlow
}) => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
    const [result, setResult] = useState<string>('');
    const [usage, setUsage] = useState<TokenUsage | undefined>(undefined);
    const logsEndRef = useRef<HTMLDivElement>(null);

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

    const runProcess = async () => {
        setStatus('running');
        setLogs([]);
        setResult('');
        
        addLog(`Iniciando proceso de ${actionType === 'expand' ? 'Expansión' : 'Optimización'}...`, 'info');
        addLog(`Modelo seleccionado: ${modelSettings.selectedModel}`, 'info');
        
        if (framework) {
            addLog(`Aplicando Framework: ${framework.name} (${framework.acronym})`, 'info');
        } else {
            addLog(`Framework: Auto-selección`, 'info');
        }

        addLog(`Analizando prompt base (${ideaText.length} caracteres)...`, 'info');
        if (files.length > 0) {
            addLog(`Procesando ${files.length} archivos adjuntos...`, 'info');
        }

        try {
            let response;
            if (actionType === 'expand') {
                addLog('Generando expansión de contenido y enriquecimiento...', 'info');
                response = await expandIdea(ideaText, files, framework, modelSettings);
            } else {
                addLog('Aplicando técnicas de Prompt Engineering...', 'info');
                if (optimizationStyle) addLog(`Estilo: ${optimizationStyle}`, 'info');
                if (targetAudience !== 'general') addLog(`Audiencia: ${targetAudience}`, 'info');
                
                response = await optimizePrompt(
                    ideaText,
                    useCase,
                    framework!, // Assuming framework is selected for optimize
                    files,
                    optimizationStyle,
                    targetAudience,
                    outputLanguage,
                    keyInfo,
                    negativeConstraints,
                    modelSettings
                );
            }

            addLog('Proceso completado con éxito.', 'success');
            setResult(response.text);
            setUsage(response.usage);
            setStatus('completed');
            
            // Auto-complete to parent after a short delay or let user click
            onComplete(response.text, response.usage);

        } catch (error: any) {
            addLog(`Error: ${error.message || 'Fallo en la comunicación con la API'}`, 'error');
            setStatus('error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-slate-900 w-full max-w-5xl h-[85vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-indigo-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
                            {actionType === 'expand' ? <ArrowsPointingOutIcon className="w-6 h-6" /> : <SparklesIcon className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">
                                {actionType === 'expand' ? 'Expansión de Idea' : 'Optimización de Prompt'}
                            </h2>
                            <p className="text-sm text-indigo-200/60 font-medium">Procesamiento en tiempo real</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar - Process Info & Logs */}
                    <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/20">
                        <div className="p-4 border-b border-white/10">
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                                <ListBulletIcon className="w-4 h-4" /> Detalles del Proceso
                            </h3>
                            <div className="space-y-2 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Modelo:</span>
                                    <span className="text-indigo-400 font-mono">{modelSettings.selectedModel}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Framework:</span>
                                    <span className="text-teal-400">{framework?.acronym || 'Auto'}</span>
                                </div>
                                {actionType === 'optimize' && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Estilo:</span>
                                        <span className="text-gray-300">{optimizationStyle || 'Normal'}</span>
                                    </div>
                                )}
                            </div>
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
                                    <div className="flex gap-2 text-indigo-400 animate-pulse">
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
                                    <div className="absolute inset-0 border-4 border-indigo-500/20 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin"></div>
                                    <CpuChipIcon className="w-8 h-8 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Generando Output Robusto...</h3>
                                <p className="text-gray-400 max-w-md">
                                    Aplicando el framework {framework?.name} y optimizando la estructura para obtener los mejores resultados.
                                </p>
                            </div>
                        ) : status === 'completed' ? (
                            <div className="flex-1 flex flex-col p-6 overflow-hidden">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                        <CheckCircleIcon className="w-5 h-5 text-green-400" /> Resultado Listo
                                    </h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onRunAutoFlow(result)}
                                            className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-500 text-white hover:bg-indigo-400 transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                                        >
                                            <PlayIcon className="w-4 h-4" /> Correr Flujo Automático
                                        </button>
                                        <button 
                                            onClick={onClose}
                                            className="px-4 py-2 rounded-xl text-sm font-bold bg-white/10 text-white hover:bg-white/20 transition-all"
                                        >
                                            Usar Prompt
                                        </button>
                                    </div>
                                </div>
                                <div className="flex-1 bg-black/40 border border-white/10 rounded-2xl p-4 overflow-y-auto custom-scrollbar text-gray-300 whitespace-pre-wrap text-sm">
                                    {result}
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

export default ProcessDashboardModal;
