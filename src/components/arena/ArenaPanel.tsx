
import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { generateStream, generateContent, optimizePrompt, critiqueResponse, IS_API_KEY_AVAILABLE, formatText, FormatType, modifyContentLength, LengthModifier } from '../../lib/geminiService.ts';
import { SparklesIcon, AcademicCapIcon, ArrowsPointingOutIcon, ClipboardIcon, CheckIcon, Bars3BottomLeftIcon, EyeIcon, ArrowPathIcon, ClockIcon } from '../shared/Icons.tsx';
import { Framework, CritiqueResult, GeminiModel, SafetySettings, UploadedFile, TokenUsage } from '../../types/index.ts';
import CanvasModal from '../shared/CanvasModal.tsx';
import GenerativeRenderer from '../genui/GenerativeRenderer.tsx';
import LengthModifierDropdown from '../shared/LengthModifierDropdown.tsx';
import ThoughtVisualizer from '../genui/ThoughtVisualizer.tsx';

interface ArenaPanelProps {
    title: string;
    initialPrompt?: string;
    framework?: Framework;
    idea?: string;
    useCase?: string;
    overrideModel?: GeminiModel; // Prop para forzar un modelo en modo batalla
    
    // Model Settings
    selectedModel: GeminiModel;
    onModelChange: (model: GeminiModel) => void;
    temperature: number;
    onTemperatureChange: (temp: number) => void;
    topP: number;
    onTopPChange: (topP: number) => void;
    topK: number;
    onTopKChange: (k: number) => void;
    maxOutputTokens: number;
    onMaxOutputTokensChange: (tokens: number) => void;
    systemInstruction: string;
    onSystemInstructionChange: (instruction: string) => void;
    systemInstructionFiles: UploadedFile[];
    onSystemInstructionFilesChange: (files: UploadedFile[]) => void;
    stopSequences: string[];
    onStopSequencesChange: (sequences: string[]) => void;
    seed: number | null;
    onSeedChange: (seed: number | null) => void;
    thinkingBudget: number;
    onThinkingBudgetChange: (budget: number) => void;
    isThinkingMode: boolean;
    onIsThinkingModeChange: (enabled: boolean) => void;
    useGoogleSearch: boolean;
    onUseGoogleSearchChange: (use: boolean) => void;
    isStructuredOutputEnabled: boolean;
    onIsStructuredOutputEnabledChange: (enabled: boolean) => void;
    isCodeExecutionEnabled: boolean;
    onIsCodeExecutionEnabledChange: (enabled: boolean) => void;
    isFunctionCallingEnabled: boolean;
    onIsFunctionCallingEnabledChange: (enabled: boolean) => void;
    safetySettings: SafetySettings;
    onSafetySettingsChange: (settings: SafetySettings) => void;
    onOpenSafetySettings: () => void;
    onTokenUsageReceived?: (usage: TokenUsage) => void;
}

const getModelDescriptor = (model: GeminiModel) => {
    if (model.includes('pro')) return { label: 'Reasoning', color: 'text-purple-400 bg-purple-500/10' };
    if (model.includes('flash')) return { label: 'Speed SOTA', color: 'text-teal-400 bg-teal-500/10' };
    if (model.includes('gemma')) return { label: 'Open Weights', color: 'text-pink-400 bg-pink-500/10' };
    return { label: 'Standard', color: 'text-gray-400 bg-white/5' };
};

const useSimulatedProgress = (isLoading: boolean) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isLoading) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(old => {
                    if (old >= 90) return 90;
                    const diff = 90 - old;
                    return old + Math.max(0.5, diff * 0.1); 
                })
            }, 300);
            return () => clearInterval(interval);
        } else {
            setProgress(100);
            const timeout = setTimeout(() => setProgress(0), 1000); 
            return () => clearTimeout(timeout);
        }
    }, [isLoading]);

    return progress > 0 ? Math.floor(progress) : 0;
};

const ArenaPanel: React.FC<ArenaPanelProps> = ({ 
    title, 
    initialPrompt = '', 
    framework, 
    idea, 
    useCase,
    overrideModel,
    onTokenUsageReceived,
    ...modelSettings
}) => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [result, setResult] = useState('');
    const [thought, setThought] = useState<string | undefined>(undefined);
    const [critique, setCritique] = useState<CritiqueResult | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isCritiquing, setIsCritiquing] = useState(false);
    const [critiqueError, setCritiqueError] = useState('');
    const [isFormatting, setIsFormatting] = useState(false);
    const [isModifyingPromptLength, setIsModifyingPromptLength] = useState(false);
    const [isModifyingResultLength, setIsModifyingResultLength] = useState(false);
    
    // Performance Metrics
    const [latency, setLatency] = useState<number | null>(null);

    // GenUI State
    const [isGenUIActive, setIsGenUIActive] = useState(false);

    const [isPromptCanvasOpen, setIsPromptCanvasOpen] = useState(false);
    const [isResultCanvasOpen, setIsResultCanvasOpen] = useState(false);
    const [isPromptCopied, setIsPromptCopied] = useState(false);
    const [isResultCopied, setIsResultCopied] = useState(false);

    const activeModel = overrideModel || modelSettings.selectedModel;
    const modelBadge = getModelDescriptor(activeModel);
    
    // Progress
    const generationProgress = useSimulatedProgress(isGenerating);

    const serviceModelSettings = useMemo(() => ({
        selectedModel: activeModel,
        temperature: modelSettings.temperature,
        topP: modelSettings.topP,
        topK: modelSettings.topK,
        maxOutputTokens: modelSettings.maxOutputTokens,
        systemInstruction: modelSettings.systemInstruction,
        systemInstructionFiles: modelSettings.systemInstructionFiles,
        stopSequences: modelSettings.stopSequences,
        seed: modelSettings.seed,
        thinkingBudget: modelSettings.thinkingBudget,
        useGoogleSearch: modelSettings.useGoogleSearch,
        isStructuredOutputEnabled: modelSettings.isStructuredOutputEnabled,
        isCodeExecutionEnabled: modelSettings.isCodeExecutionEnabled,
        isFunctionCallingEnabled: modelSettings.isFunctionCallingEnabled,
        safetySettings: modelSettings.safetySettings,
        isThinkingMode: modelSettings.isThinkingMode,
    }), [activeModel, modelSettings]);


    useEffect(() => {
        if (framework && idea && useCase) {
            const generateInitialPrompt = async () => {
                setIsOptimizing(true);
                setPrompt(`Optimizando con ${framework.acronym}...`);
                try {
                    const result = await optimizePrompt(
                        idea, useCase, framework, [], 'default', 
                        'general', 'es', '', '',
                        serviceModelSettings
                    );
                    setPrompt(result.text);
                    if (result.usage && onTokenUsageReceived) {
                        onTokenUsageReceived(result.usage);
                    }
                } catch (e) {
                    setPrompt(`Error al optimizar con ${framework.acronym}.`);
                } finally {
                    setIsOptimizing(false);
                }
            };
            generateInitialPrompt();
        }
    }, [framework, idea, useCase, serviceModelSettings, onTokenUsageReceived]);
    
    useEffect(() => {
        setCritique(null);
        setCritiqueError('');
    }, [prompt])

    const handleGenerate = useCallback(async () => {
        if (!prompt || isGenerating || isOptimizing) return;
        setIsGenerating(true);
        setResult('');
        setThought(undefined);
        setCritique(null);
        setCritiqueError('');
        setLatency(null);
        
        const startTime = performance.now();
        
        try {
            const response = await generateContent(prompt, serviceModelSettings);
            const endTime = performance.now();
            setLatency(endTime - startTime);
            setResult(response.text);
            setThought(response.thought);
            if (response.usage && onTokenUsageReceived) {
                onTokenUsageReceived(response.usage);
            }
        } catch (error) {
            console.error("Error in generation:", error);
            setResult("Hubo un error al generar la respuesta.");
        } finally {
            setIsGenerating(false);
        }
    }, [prompt, isGenerating, isOptimizing, serviceModelSettings, onTokenUsageReceived]);

    const handleCritique = useCallback(async () => {
        if (!prompt || !result || isCritiquing) return;
        setIsCritiquing(true);
        setCritiqueError('');
        try {
            const critiqueResult = await critiqueResponse(prompt, result, activeModel);
            setCritique(critiqueResult);
            if (critiqueResult.usage && onTokenUsageReceived) onTokenUsageReceived(critiqueResult.usage);
        } catch (error) {
            console.error("Error critiquing response:", error);
            setCritiqueError("No se pudo obtener la crítica. Intenta de nuevo.");
        } finally {
            setIsCritiquing(false);
        }
    }, [prompt, result, isCritiquing, activeModel, onTokenUsageReceived]);
    
    const handleFormatPrompt = useCallback(async (formatType: FormatType) => {
        if (!prompt) return;
        setIsFormatting(true);
        try {
            const formattedResult = await formatText(prompt, formatType, activeModel);
            setPrompt(formattedResult.text);
            if (formattedResult.usage && onTokenUsageReceived) onTokenUsageReceived(formattedResult.usage);
        } catch (error) {
            console.error("Failed to format prompt in arena:", error);
        } finally {
            setIsFormatting(false);
        }
    }, [prompt, activeModel, onTokenUsageReceived]);
    
    const handleModifyPromptLength = useCallback(async (modifier: LengthModifier) => {
        if (!prompt) return;
        setIsModifyingPromptLength(true);
        try {
            const modifiedResult = await modifyContentLength(prompt, modifier, activeModel);
            setPrompt(modifiedResult.text);
            if (modifiedResult.usage && onTokenUsageReceived) onTokenUsageReceived(modifiedResult.usage);
        } catch (error) {
            console.error("Failed to modify prompt length:", error);
        } finally {
            setIsModifyingPromptLength(false);
        }
    }, [prompt, activeModel, onTokenUsageReceived]);

    const handleModifyResultLength = useCallback(async (modifier: LengthModifier) => {
        if (!result) return;
        setIsModifyingResultLength(true);
        try {
            const modifiedResult = await modifyContentLength(result, modifier, activeModel);
            setResult(modifiedResult.text);
            if (modifiedResult.usage && onTokenUsageReceived) onTokenUsageReceived(modifiedResult.usage);
        } catch (error) {
            console.error("Failed to modify result length:", error);
        } finally {
            setIsModifyingResultLength(false);
        }
    }, [result, activeModel, onTokenUsageReceived]);

    const handleCopyPrompt = () => {
        if (!prompt) return;
        navigator.clipboard.writeText(prompt);
        setIsPromptCopied(true);
        setTimeout(() => setIsPromptCopied(false), 2000);
    };

    const handleCopyResult = () => {
        if (!result) return;
        navigator.clipboard.writeText(result);
        setIsResultCopied(true);
        setTimeout(() => setIsResultCopied(false), 2000);
    };

    const FormatDropdown: React.FC<{ text: string; onFormat: (type: FormatType) => void; isLoading: boolean; disabled: boolean }> = ({ text, onFormat, isLoading, disabled }) => {
        const [isOpen, setIsOpen] = useState(false);
        const ref = useRef<HTMLDivElement>(null);

        useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (ref.current && !ref.current.contains(event.target as Node)) {
                    setIsOpen(false);
                }
            };
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }, []);

        const options: { label: string; type: FormatType }[] = [
            { label: 'Organizar Texto', type: 'organize' },
            { label: 'Formatear a Markdown', type: 'markdown' },
            { label: 'Crear JSON', type: 'json' },
        ];

        return (
            <div ref={ref} className="relative inline-block">
                <button
                    onClick={() => setIsOpen(prev => !prev)}
                    disabled={!text || disabled || isLoading}
                    className="p-1.5 bg-white/5 rounded-md text-gray-400 hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10"
                    title="Formatear texto con IA"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-teal-400 rounded-full animate-spin"></div>
                    ) : (
                        <Bars3BottomLeftIcon className="w-5 h-5" />
                    )}
                </button>
                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 glass-panel rounded-xl z-20 animate-fade-in-up py-2">
                        {options.map(opt => (
                            <button
                                key={opt.type}
                                onClick={() => { onFormat(opt.type); setIsOpen(false); }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 hover:text-white"
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`flex-1 flex flex-col glass-panel rounded-[2rem] p-5 h-full relative border transition-all duration-500 overflow-hidden ${isGenerating ? 'border-teal-500/30' : 'border-white/5'}`}>
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-black text-gray-100 italic tracking-tighter uppercase mb-1">{title}</h3>
                    <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border border-white/5 uppercase tracking-widest ${modelBadge.color}`}>
                            {modelBadge.label}
                        </span>
                        {latency !== null && (
                            <span className="text-[9px] font-mono text-gray-500 bg-black/30 px-2 py-0.5 rounded-full border border-white/5">
                                Latencia: <span className="text-teal-400">{(latency / 1000).toFixed(2)}s</span>
                            </span>
                        )}
                    </div>
                </div>
                <button
                    onClick={() => setIsGenUIActive(!isGenUIActive)}
                    disabled={!result}
                    className={`flex items-center gap-2 px-3 py-1.5 text-xs rounded-full border transition-all ${
                        isGenUIActive 
                        ? 'bg-purple-600/50 border-purple-400 text-white shadow-lg' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                    title="Generative UI: Renderiza visualmente código, datos y diagramas."
                >
                    <EyeIcon className="w-3 h-3" />
                    {isGenUIActive ? 'GenUI ✨' : 'View'}
                </button>
            </div>

            <div className="flex flex-col gap-4 flex-grow min-h-0">
                <div className="relative group h-32 shrink-0">
                    <textarea
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        className="glass-input w-full h-full rounded-2xl p-4 pr-12 text-gray-300 resize-none font-mono text-[11px] leading-relaxed shadow-inner"
                        placeholder="Escribe o modifica tu prompt aquí..."
                        readOnly={isOptimizing}
                        title="Edita el prompt para esta variante."
                    />
                     <div className="absolute top-3 right-3 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <LengthModifierDropdown onModify={handleModifyPromptLength} isLoading={isModifyingPromptLength} disabled={isGenerating || isOptimizing || !IS_API_KEY_AVAILABLE} minimal placement="left" />
                        <FormatDropdown text={prompt} onFormat={handleFormatPrompt} isLoading={isFormatting} disabled={isGenerating || isOptimizing || !IS_API_KEY_AVAILABLE} />
                        <button onClick={handleCopyPrompt} title="Copiar prompt" className="p-1.5 bg-white/10 rounded-md text-gray-400 hover:text-teal-400 backdrop-blur-md border border-white/5">
                            {isPromptCopied ? <CheckIcon className="w-4 h-4 text-teal-400" /> : <ClipboardIcon className="w-4 h-4" />}
                        </button>
                        <button onClick={() => setIsPromptCanvasOpen(true)} title="Expandir a lienzo" className="p-1.5 bg-white/10 rounded-md text-gray-400 hover:text-teal-400 backdrop-blur-md border border-white/5">
                            <ArrowsPointingOutIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                {isPromptCanvasOpen && (
                    <CanvasModal
                        title={`Editar Prompt (${title})`}
                        content={prompt}
                        isEditable={true}
                        onClose={() => setIsPromptCanvasOpen(false)}
                        onSave={(newContent) => {
                            setPrompt(newContent);
                            setIsPromptCanvasOpen(false);
                        }}
                    />
                )}

                <div className="flex gap-2">
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || isOptimizing || !prompt || isFormatting || isModifyingPromptLength}
                        className={`flex-1 flex items-center justify-center gap-2 font-black py-3 rounded-2xl transition-all text-xs uppercase tracking-tighter shadow-lg ${isGenerating ? 'bg-white/10 text-teal-400' : 'bg-teal-500 hover:bg-teal-400 text-slate-900 active:scale-95'}`}
                        title="Ejecuta el prompt y genera una respuesta."
                    >
                        {isGenerating ? (
                            <>
                                <ClockIcon className="w-4 h-4 animate-pulse" />
                                <span>{generationProgress}%</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-4 h-4" />
                                <span>Generar</span>
                            </>
                        )}
                    </button>
                    <button
                        onClick={handleCritique}
                        disabled={isCritiquing || !result || !IS_API_KEY_AVAILABLE}
                        className="flex-1 flex items-center justify-center gap-2 glass-button text-gray-300 px-4 py-3 rounded-2xl font-bold disabled:opacity-50 disabled:cursor-not-allowed text-xs uppercase"
                        title="Analiza la calidad de la respuesta generada por la IA."
                    >
                        <AcademicCapIcon className="w-4 h-4" />
                         {isCritiquing ? '...' : 'Auditar'}
                    </button>
                </div>

                {/* Thought Trace Visualizer in Arena */}
                {thought && (
                    <ThoughtVisualizer thought={thought} />
                )}
                
                <div className={`relative group flex-1 mt-1 flex gap-4 overflow-hidden`}>
                    {/* Raw Text View */}
                    <div className={`relative transition-all duration-500 ease-in-out flex flex-col h-full ${isGenUIActive ? 'w-0 opacity-0 pointer-events-none' : 'w-full'}`}>
                        <div className="w-full h-full overflow-y-auto bg-black/40 p-4 rounded-2xl text-gray-200 whitespace-pre-wrap font-mono text-[11px] leading-relaxed border border-white/5 shadow-inner custom-scrollbar">
                            {result || <span className="text-gray-600 italic">Esperando instrucción...</span>}
                            {isGenerating && <span className="inline-block w-2 h-4 bg-teal-400 animate-pulse ml-1 rounded-sm" />}
                        </div>
                         <div className="absolute top-3 right-3 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <LengthModifierDropdown onModify={handleModifyResultLength} isLoading={isModifyingResultLength} disabled={isGenerating || !result || !IS_API_KEY_AVAILABLE} minimal placement="left" />
                            <button onClick={handleCopyResult} title="Copiar resultado" className="p-1.5 bg-black/40 rounded-md text-gray-400 hover:text-teal-400 backdrop-blur-md border border-white/10 shadow-xl">
                                {isResultCopied ? <CheckIcon className="w-4 h-4 text-teal-400" /> : <ClipboardIcon className="w-4 h-4" />}
                            </button>
                            <button onClick={() => setIsResultCanvasOpen(true)} title="Ver en lienzo" className="p-1.5 bg-black/40 rounded-md text-gray-400 hover:text-teal-400 backdrop-blur-md border border-white/10 shadow-xl">
                                <ArrowsPointingOutIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* GenUI View */}
                    {isGenUIActive && (
                        <div className="w-full h-full animate-fade-in-up">
                            <GenerativeRenderer content={result} />
                        </div>
                    )}
                </div>
                
                 {isResultCanvasOpen && (
                    <CanvasModal
                        title={`Resultado (${title})`}
                        content={result}
                        isEditable={false}
                        onClose={() => setIsResultCanvasOpen(false)}
                    />
                )}


                {(critique || isCritiquing || critiqueError) && (
                    <div className="mt-2 border-t border-white/5 pt-3 overflow-y-auto max-h-32 shrink-0 animate-fade-in">
                        <div className="flex items-center gap-2 mb-2">
                             <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                             <h4 className="font-black text-gray-300 text-[10px] uppercase tracking-[0.2em]">Auditoría de Sesión</h4>
                        </div>
                         {isCritiquing && <p className="text-gray-500 text-xs italic animate-pulse">Deconstruyendo respuesta...</p>}
                         {critiqueError && <p className="text-red-500 text-xs bg-red-500/10 p-2 rounded-lg">{critiqueError}</p>}
                        {critique && (
                            <div className="text-[11px] space-y-2">
                                <div className="flex items-center gap-4">
                                    <div className="bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                                        <span className="font-black text-indigo-400">{critique.score}/10</span>
                                    </div>
                                    <span className="text-gray-400 leading-tight italic">"{critique.suggestion}"</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}

export default ArenaPanel;
