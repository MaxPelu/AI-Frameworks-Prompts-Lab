
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { SavedPrompt, PromptVersion, Framework, UploadedFile, GeminiModel, QualityAnalysisResult, SafetySettings, ArenaBattleConfig, TokenUsage } from '../../types/index.ts';
import { FRAMEWORKS, CATEGORIZED_USE_CASES, FRAMEWORK_RECOMMENDATIONS_BY_CATEGORY } from '../../config/constants.ts';
import { CONTEXT_FRAMEWORKS } from '../../config/contextConstants.ts';
import { AGENT_FRAMEWORKS } from '../../config/agentConstants.ts';
import { CODING_FRAMEWORKS } from '../../config/codingConstants.ts';
import { BUSINESS_FRAMEWORKS } from '../../config/businessConstants.ts';
import { DATA_FRAMEWORKS } from '../../config/dataConstants.ts';
import { optimizePrompt, expandIdea, suggestUseCase, suggestFramework, IS_API_KEY_AVAILABLE, evolvePrompt, evaluatePromptQuality, suggestRelatedIdeas, extractKeyEntities, generateTitles, summarizeContext, improvePromptBasedOnAnalysis, formatText, FormatType, generateRandomIdea, evaluateIdeaQuality, modifyContentLength, LengthModifier, quickRefine } from '../../lib/geminiService.ts';
import { SparklesIcon, BeakerIcon, LightBulbIcon, ArrowPathIcon, QuestionMarkCircleIcon, HelixIcon, SaveDiskIcon, ClipboardIcon, CheckIcon, PaperAirplaneIcon, ArrowsPointingOutIcon, AcademicCapIcon, ChatBubbleLeftRightIcon, KeyIcon, NewspaperIcon, DocumentTextIcon, UsersIcon, GlobeAltIcon, CheckBadgeIcon, NoSymbolIcon, Bars3BottomLeftIcon, DiceIcon, TableCellsIcon, ChevronDownIcon, PencilIcon, TrashIcon, MicrophoneIcon, FingerPrintIcon, WrenchScrewdriverIcon, ClockIcon } from '../shared/Icons.tsx';
import FileUploader from './FileUploader.tsx';
import CanvasModal from '../shared/CanvasModal.tsx';
import QualityAnalysisModal from '../shared/QualityAnalysisModal.tsx';
import LengthModifierDropdown from '../shared/LengthModifierDropdown.tsx';
import ThoughtVisualizer from '../genui/ThoughtVisualizer.tsx';


interface WorkflowPanelProps {
    ideaText: string;
    onIdeaChange: (text: string) => void;
    useCase: string;
    onUseCaseChange: (useCase: string) => void;
    files: UploadedFile[];
    onFilesChange: (files: UploadedFile[]) => void;
    
    // Lifted State Props
    generatedPrompt: string;
    setGeneratedPrompt: (prompt: string) => void;
    selectedFrameworkAcronym: string;
    setSelectedFrameworkAcronym: (acronym: string) => void;
    generatedSources: any[];
    setGeneratedSources: (sources: any[]) => void;

    onSavePrompt: (promptData: Omit<PromptVersion, 'versionId' | 'createdAt' | 'changeSummary'>) => void;
    onTestInArena: (prompt: string) => void;
    onBatchTest: (prompt: string) => void;
    onModelBattle: (config: ArenaBattleConfig) => void;
    isSaving: boolean;
    promptToIterateId: string | null;
    savedPrompts: SavedPrompt[];
    onCancelIteration: () => void;
    onRenameSession: (id: string) => void;
    onDeleteSession: (id: string) => void;
    
    // New Metrics Prop
    onTokenUsageReceived?: (usage: TokenUsage) => void;

    // Model Settings Props
    selectedModel: GeminiModel;
    onModelChange: (model: GeminiModel) => void;
    temperature: number;
    onTemperatureChange: (temp: number) => void;
    topP: number;
    onTopPChange: (topP: number) => void;
    topK: number;
    onTopKChange: (k: number) => void;
    frequencyPenalty: number; // Added
    onFrequencyPenaltyChange: (val: number) => void; // Added
    presencePenalty: number; // Added
    onPresencePenaltyChange: (val: number) => void; // Added
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

    // SOTA v5.0 Props
    toneShift: number;
    outputVerbosity: number;
    draftMode: boolean;
    promptAutoRefine: boolean;
    verificationLoop: boolean;
    expertiseLevel: number;
    forceMarkdown: boolean;
    citationStyle: 'none' | 'apa' | 'inline' | 'url';
    lateralThinking: boolean;
    memoryRecall: boolean;
    useGoogleMaps: boolean;
    agentMathMode: boolean;
    agentDebateMode: boolean;
    recursiveRefinement: number;
    agentReflection: boolean;
    agentPlanningMode: boolean;
    searchRecency: 'any'|'day'|'week'|'month'|'year';
    groundingThreshold: number;
}

// Consolidated list of all frameworks
const allFrameworks = [
    ...FRAMEWORKS, 
    ...CONTEXT_FRAMEWORKS, 
    ...AGENT_FRAMEWORKS,
    ...CODING_FRAMEWORKS,
    ...BUSINESS_FRAMEWORKS,
    ...DATA_FRAMEWORKS
];

// ... (OPTIMIZATION_STYLE_DESCRIPTIONS remain the same) ...
const OPTIMIZATION_STYLE_DESCRIPTIONS: { [key: string]: string } = {
    default: "Estilo equilibrado. Genera un prompt bien estructurado y de longitud media, ideal para la mayoría de los casos.",
    // ... rest of styles
    brief: "Extremadamente conciso. Para cuando necesitas la respuesta más corta y directa posible.",
    short: "Corto y al punto. Elimina detalles innecesarios para una respuesta rápida.",
    medium: "Longitud estándar. Un buen balance entre detalle y brevedad.",
    long: "Detallado y con contexto. Proporciona a la IA más información para una respuesta más elaborada.",
    very_long: "Exhaustivo. Cubre todos los detalles posibles para una respuesta completa.",
    max_length: "Expansión máxima. Genera el prompt más largo y completo que la IA pueda crear a partir de la idea.",
    markdown: "Formatea la salida en Markdown. Ideal para generar contenido estructurado como posts de blog o documentación.",
    json: "Instruye a la IA para que responda en formato JSON. Esencial para la integración con aplicaciones.",
    xml: "Instruye a la IA para que responda en formato XML. Útil para sistemas heredados o específicos.",
    yaml: "Instruye a la IA para que responda en formato YAML. Bueno para archivos de configuración o datos legibles.",
    step_by_step: "Pide una guía paso a paso. Perfecto para tutoriales, recetas o planes de acción.",
    table: "Diseñado para generar una tabla. Útil para comparaciones o visualización de datos.",
    script: "Formato de guion. Para diálogos, videos o podcasts, con indicaciones de escena o personajes.",
    formal: "Tono profesional y académico. Adecuado para comunicaciones de negocios, papers o reportes.",
    casual: "Tono relajado y conversacional. Ideal para redes sociales, blogs personales o chatbots amigables.",
    persuasive: "Tono persuasivo. Optimizado para marketing, ventas o textos argumentativos.",
    empathetic: "Tono empático y comprensivo. Para soporte al cliente, comunicaciones sensibles o coaching.",
    creative: "Fomenta la originalidad. Para brainstorming, escritura creativa o generación de ideas fuera de lo común.",
    technical: "Lenguaje técnico y preciso. Dirigido a una audiencia de expertos en un campo específico.",
    socratic: "Método socrático. Guía al usuario a través de preguntas para fomentar el pensamiento crítico.",
    simple: "Explicación simple (ELi5). Como si se lo explicaras a un niño de 5 años, ideal para conceptos complejos.",
    deep_analysis: "Análisis profundo. Solicita una respuesta detallada, con múltiples facetas y consideraciones.",
    cot: "Chain of Thought. Pide a la IA que 'piense en voz alta' antes de responder, mejorando el razonamiento.",
    multi_perspective: "Múltiples perspectivas. Analiza el tema desde diferentes puntos de vista (económico, social, etc.).",
    problem_solving: "Resolución de problemas. Estructura el prompt para delinear un problema y guiar hacia una solución.",
    for_beginners: "Para principiantes. Evita la jerga y usa analogías simples para explicar un tema.",
    for_experts: "Para expertos. Asume conocimiento previo y se enfoca en detalles avanzados y matices.",
    for_kids: "Para una audiencia infantil. Usa un lenguaje simple, divertido y apropiado para niños.",
    for_executives: "Para ejecutivos. Solicita un resumen (TL;DR) al principio, seguido de los detalles importantes.",
    code_generation: "Generación de código. Optimizado para especificar lenguaje, librerías y requerimientos de forma clara.",
};

const StepIndicator: React.FC<{ step: number; title: string; isActive: boolean }> = ({ step, title, isActive }) => {
    // Cycle colors: 1=Blue, 2=SkyBlue, 3=Orange
    const activeColors = {
        1: 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-blue-500/30',
        2: 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-cyan-500/30',
        3: 'bg-orange-500/20 border-orange-400 text-orange-300 shadow-orange-500/30',
    };
    
    const activeTextColors = {
        1: 'text-blue-300',
        2: 'text-cyan-300',
        3: 'text-orange-300',
    };

    return (
        <div className="flex items-center gap-4">
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-lg ${isActive ? `${activeColors[step as 1|2|3]} scale-110` : 'bg-white/5 border-white/10 text-gray-400'}`}>
                <span className="text-lg font-bold">{step}</span>
            </div>
            <h3 className={`text-lg font-bold transition-colors duration-300 ${isActive ? `${activeTextColors[step as 1|2|3]} drop-shadow-md` : 'text-gray-500'}`}>{title}</h3>
        </div>
    );
};

// --- SIMULATED PROGRESS HOOK ---
const useSimulatedProgress = (isLoading: boolean) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        if (isLoading) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(old => {
                    if (old >= 90) return 90; // Stall at 90%
                    // Logarithmic-ish increment
                    const diff = 90 - old;
                    return old + Math.max(0.5, diff * 0.1); 
                })
            }, 300);
            return () => clearInterval(interval);
        } else {
            setProgress(100);
            const timeout = setTimeout(() => setProgress(0), 1000); // Reset after animation
            return () => clearTimeout(timeout);
        }
    }, [isLoading]);

    return progress > 0 ? Math.floor(progress) : 0;
};

// --- REUSABLE BUTTON COMPONENT WITH PROGRESS ---
const ProgressButton: React.FC<{ 
    onClick: () => void; 
    disabled: boolean; 
    isLoading: boolean; 
    label: string; 
    icon: React.ReactNode; 
    className?: string; 
    progress: number;
}> = ({ onClick, disabled, isLoading, label, icon, className, progress }) => (
    <button onClick={onClick} disabled={disabled} className={className} title={label}>
        {isLoading ? (
            <div className="flex items-center gap-2 text-teal-400 animate-pulse">
                <ClockIcon className="w-4 h-4" />
                <span className="font-mono text-xs">{progress}%</span>
            </div>
        ) : (
            <>
                {icon} <span>{label}</span>
            </>
        )}
    </button>
);


const WorkflowPanel: React.FC<WorkflowPanelProps> = (props) => {
    const { 
        ideaText, onIdeaChange, 
        useCase, onUseCaseChange, 
        files, onFilesChange, 
        
        // Lifted props
        generatedPrompt, setGeneratedPrompt,
        selectedFrameworkAcronym, setSelectedFrameworkAcronym,
        generatedSources, setGeneratedSources,

        onSavePrompt, onTestInArena, 
        onBatchTest, onModelBattle,
        isSaving, promptToIterateId, 
        savedPrompts, onCancelIteration,
        onRenameSession, onDeleteSession, 
        onTokenUsageReceived,
        
        // SOTA Props
        toneShift,
        outputVerbosity,
        draftMode,
        promptAutoRefine,
        verificationLoop,
        
        ...modelSettings
    } = props;
    
    // Internal State
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanding, setIsExpanding] = useState(false);
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [isEvolving, setIsEvolving] = useState(false);
    const [isAutoRunningWorkflow, setIsAutoRunningWorkflow] = useState(false);
    const [isSuggestingIdeas, setIsSuggestingIdeas] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [isGeneratingTitles, setIsGeneratingTitles] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isResultCopied, setIsResultCopied] = useState(false);
    const [isIdeaCopied, setIsIdeaCopied] = useState(false);
    const [isImprovingPrompt, setIsImprovingPrompt] = useState(false);
    const [isFormatting, setIsFormatting] = useState<'idea' | 'result' | null>(null);
    const [isGeneratingIdea, setIsGeneratingIdea] = useState(false);
    const [isModifyingLength, setIsModifyingLength] = useState(false);
    const [isModifyingIdeaLength, setIsModifyingIdeaLength] = useState(false); // NEW STATE
    const [isDraftSaving, setIsDraftSaving] = useState(false);
    
    // NEW: Quick Refine State
    const [isRefining, setIsRefining] = useState(false);
    
    // Progress Hooks
    const refineProgress = useSimulatedProgress(isRefining || isModifyingIdeaLength);
    const optimizationProgress = useSimulatedProgress(isLoading);
    const expandProgress = useSimulatedProgress(isExpanding);
    
    // NEW: Voice & Privacy State
    const [isRecording, setIsRecording] = useState(false);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const recognitionRef = useRef<any>(null);

    // Thought trace state
    const [generatedThought, setGeneratedThought] = useState<string | undefined>(undefined);
    
    // New Idea Feedback State
    const [ideaFeedback, setIdeaFeedback] = useState<string | null>(null);
    const [isGettingIdeaFeedback, setIsGettingIdeaFeedback] = useState(false);

    const [error, setError] = useState('');
    
    // Step 1 - Expansion Framework State
    const [expansionFrameworkAcronym, setExpansionFrameworkAcronym] = useState<string>('auto');
    
    // Step 2 - Fine-tuning State
    const [targetAudience, setTargetAudience] = useState('general');
    const [outputLanguage, setOutputLanguage] = useState('es');
    const [keyInfo, setKeyInfo] = useState('');
    const [negativeConstraints, setNegativeConstraints] = useState('');
    
    // Optimization State
    const [optimizationStyle, setOptimizationStyle] = useState('default');
    
    // UI State
    const [activeStep, setActiveStep] = useState(1);
    const [isIdeaCanvasOpen, setIsIdeaCanvasOpen] = useState(false);
    const [isResultCanvasOpen, setIsResultCanvasOpen] = useState(false);

    // Quality Analysis State
    const [qualityAnalysisState, setQualityAnalysisState] = useState<{
        isOpen: boolean;
        promptText: string | null;
        analysisResult: QualityAnalysisResult | null;
        isLoading: boolean;
        error: string | null;
        source: 'idea' | 'generated' | null;
    }>({ isOpen: false, promptText: null, analysisResult: null, isLoading: false, error: null, source: null });
    
     // Offline Mode & Session State
    const [draftNotification, setDraftNotification] = useState<string | null>(null);
    
    useEffect(() => {
        if (!IS_API_KEY_AVAILABLE) {
            const savedDraft = localStorage.getItem('promptLabDraft');
            if (savedDraft) {
                setDraftNotification('Se encontró un borrador guardado. ¿Quieres restaurarlo?');
            }
        }
    }, []);

    const handleRestoreDraft = () => {
        const savedDraft = localStorage.getItem('promptLabDraft');
        if (savedDraft) {
            const { idea, useCase: savedUseCase, files: savedFiles } = JSON.parse(savedDraft);
            onIdeaChange(idea);
            onUseCaseChange(savedUseCase);
            onFilesChange(savedFiles);
            setDraftNotification('Borrador restaurado.');
            setTimeout(() => setDraftNotification(null), 3000);
        }
    };

    const handleSaveDraft = () => {
        const draft = { idea: ideaText, useCase, files };
        localStorage.setItem('promptLabDraft', JSON.stringify(draft));
        setDraftNotification('¡Borrador guardado localmente!');
        setTimeout(() => setDraftNotification(null), 3000);
    };
    
    const handleSaveDraftStep1 = () => {
        if (!ideaText.trim()) return;
        setIsDraftSaving(true);
        onSavePrompt({
            idea: ideaText,
            useCase: useCase,
            frameworkAcronym: 'BORRADOR',
            optimizedPrompt: '', // Saving draft means no optimized result yet
            model: modelSettings.selectedModel,
        });
        setTimeout(() => setIsDraftSaving(false), 1000);
    };
    
    // --- VOICE INPUT LOGIC ---
    const toggleRecording = useCallback(() => {
        if (isRecording) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsRecording(false);
        } else {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (!SpeechRecognition) {
                alert("Tu navegador no soporta dictado por voz. Intenta usar Chrome.");
                return;
            }
            
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'es-ES'; // Default to Spanish, could be dynamic

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                
                if (finalTranscript) {
                    onIdeaChange(ideaText + (ideaText && !ideaText.endsWith(' ') ? ' ' : '') + finalTranscript);
                }
            };

            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsRecording(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
            setIsRecording(true);
        }
    }, [isRecording, ideaText, onIdeaChange]);

    // --- PII SCRUBBING LOGIC ---
    const handleScrubPII = useCallback(() => {
        if (!ideaText) return;
        setIsScrubbing(true);
        
        // Simple regex-based scrubbing for demonstration. 
        // In a real SOTA app, this might use a local small model (e.g. BERT via ONNX) or a specialized API.
        const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
        const phoneRegex = /(?:\+?\d{1,3}[- ]?)?\(?\d{3}\)?[- ]?\d{3}[- ]?\d{4}/g;
        
        const scrubbedText = ideaText
            .replace(emailRegex, '[EMAIL_REDACTED]')
            .replace(phoneRegex, '[PHONE_REDACTED]');
            
        onIdeaChange(scrubbedText);
        setTimeout(() => setIsScrubbing(false), 600);
    }, [ideaText, onIdeaChange]);

    // --- QUICK REFINE LOGIC (New Feature) ---
    const handleQuickRefine = useCallback(async (action: 'magic' | 'fix' | 'translate') => {
        if (!ideaText.trim()) return;
        setIsRefining(true);
        try {
            // STRICT ALIGNMENT: Construct the full ModelSettings object from all props
            const currentSettings = {
                selectedModel: modelSettings.selectedModel,
                temperature: modelSettings.temperature,
                topP: modelSettings.topP,
                topK: modelSettings.topK,
                frequencyPenalty: modelSettings.frequencyPenalty,
                presencePenalty: modelSettings.presencePenalty,
                maxOutputTokens: modelSettings.maxOutputTokens, // CRITICAL
                systemInstruction: modelSettings.systemInstruction,
                systemInstructionFiles: modelSettings.systemInstructionFiles,
                stopSequences: modelSettings.stopSequences,
                seed: modelSettings.seed,
                thinkingBudget: modelSettings.thinkingBudget,
                isThinkingMode: modelSettings.isThinkingMode,
                useGoogleSearch: modelSettings.useGoogleSearch,
                isStructuredOutputEnabled: modelSettings.isStructuredOutputEnabled,
                isCodeExecutionEnabled: modelSettings.isCodeExecutionEnabled,
                isFunctionCallingEnabled: modelSettings.isFunctionCallingEnabled,
                safetySettings: modelSettings.safetySettings,
                // New SOTA Props
                toneShift,
                outputVerbosity,
                draftMode,
                promptAutoRefine,
                verificationLoop
            };

            const refined = await quickRefine(ideaText, action, currentSettings);
            onIdeaChange(refined.text);
            if (refined.usage && onTokenUsageReceived) onTokenUsageReceived(refined.usage);
        } catch (e: any) {
            setError(e.message || "Error al refinar texto.");
        } finally {
            setIsRefining(false);
        }
    }, [ideaText, modelSettings, toneShift, outputVerbosity, draftMode, promptAutoRefine, verificationLoop, onIdeaChange, onTokenUsageReceived]);

    const promptToIterate = useMemo(() => {
        if (!promptToIterateId) return null;
        return savedPrompts.find(p => p.id === promptToIterateId) || null;
    }, [promptToIterateId, savedPrompts]);

    const currentVersionIndex = promptToIterate ? promptToIterate.versions.length : 0;

    const handleFileChange = (newFiles: UploadedFile[]) => {
        if (newFiles.length > 5) {
            alert("Puedes subir un máximo de 5 archivos.");
            return;
        }
        onFilesChange(newFiles);
    };

    const handleGeneratePrompt = useCallback(async () => {
        if (!ideaText.trim()) {
            setError("Por favor, introduce una idea para el prompt.");
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedSources([]);
        setGeneratedPrompt('');
        setGeneratedThought(undefined);

        try {
            const selectedFramework = allFrameworks.find(f => f.acronym === selectedFrameworkAcronym);
            if (!selectedFramework) {
                throw new Error("Framework seleccionado no válido.");
            }
            
            // Construct full settings for optimizePrompt too
            const currentSettings = {
                selectedModel: modelSettings.selectedModel,
                temperature: modelSettings.temperature,
                topP: modelSettings.topP,
                topK: modelSettings.topK,
                frequencyPenalty: modelSettings.frequencyPenalty,
                presencePenalty: modelSettings.presencePenalty,
                maxOutputTokens: modelSettings.maxOutputTokens,
                systemInstruction: modelSettings.systemInstruction,
                systemInstructionFiles: modelSettings.systemInstructionFiles,
                stopSequences: modelSettings.stopSequences,
                seed: modelSettings.seed,
                thinkingBudget: modelSettings.thinkingBudget,
                isThinkingMode: modelSettings.isThinkingMode,
                useGoogleSearch: modelSettings.useGoogleSearch,
                isStructuredOutputEnabled: modelSettings.isStructuredOutputEnabled,
                isCodeExecutionEnabled: modelSettings.isCodeExecutionEnabled,
                isFunctionCallingEnabled: modelSettings.isFunctionCallingEnabled,
                safetySettings: modelSettings.safetySettings,
                toneShift, outputVerbosity, draftMode, promptAutoRefine, verificationLoop
            };

            const result = await optimizePrompt(
                ideaText, 
                useCase, 
                selectedFramework, 
                files, 
                optimizationStyle, 
                targetAudience,
                outputLanguage,
                keyInfo,
                negativeConstraints,
                currentSettings
            );
            setGeneratedPrompt(result.text);
            setGeneratedThought(result.thought);
            setGeneratedSources(result.sources);
            if (result.usage && onTokenUsageReceived) {
                onTokenUsageReceived(result.usage);
            }
        } catch (err: any) {
            setError(err.message || "Ocurrió un error al generar el prompt.");
            setGeneratedPrompt('');
        } finally {
            setIsLoading(false);
        }
    }, [ideaText, useCase, selectedFrameworkAcronym, files, optimizationStyle, targetAudience, outputLanguage, keyInfo, negativeConstraints, modelSettings, toneShift, outputVerbosity, draftMode, promptAutoRefine, verificationLoop, setGeneratedPrompt, setGeneratedSources, onTokenUsageReceived]);

    const handleExpandIdea = useCallback(async () => {
        if (!ideaText.trim()) return;
        setIsExpanding(true);
        setError('');
        try {
            const selectedFramework = expansionFrameworkAcronym === 'auto'
                ? null
                : allFrameworks.find(f => f.acronym === expansionFrameworkAcronym) || null;

            // Construct full settings
            const currentSettings = {
                selectedModel: modelSettings.selectedModel,
                temperature: modelSettings.temperature,
                topP: modelSettings.topP,
                topK: modelSettings.topK,
                frequencyPenalty: modelSettings.frequencyPenalty, 
                presencePenalty: modelSettings.presencePenalty,
                maxOutputTokens: modelSettings.maxOutputTokens,
                systemInstruction: modelSettings.systemInstruction,
                systemInstructionFiles: modelSettings.systemInstructionFiles,
                stopSequences: modelSettings.stopSequences,
                seed: modelSettings.seed,
                thinkingBudget: modelSettings.thinkingBudget,
                isThinkingMode: modelSettings.isThinkingMode,
                useGoogleSearch: modelSettings.useGoogleSearch,
                isStructuredOutputEnabled: modelSettings.isStructuredOutputEnabled,
                isCodeExecutionEnabled: modelSettings.isCodeExecutionEnabled,
                isFunctionCallingEnabled: modelSettings.isFunctionCallingEnabled,
                safetySettings: modelSettings.safetySettings,
                toneShift, outputVerbosity, draftMode, promptAutoRefine, verificationLoop
            };

            const expanded = await expandIdea(ideaText, files, selectedFramework, currentSettings);
            onIdeaChange(expanded.text);
            if (expanded.usage && onTokenUsageReceived) {
                onTokenUsageReceived(expanded.usage);
            }
        } catch (err: any) {
            setError(err.message || "Ocurrió un error al expandir la idea.");
        } finally {
            setIsExpanding(false);
        }
    }, [ideaText, files, onIdeaChange, expansionFrameworkAcronym, modelSettings, toneShift, outputVerbosity, draftMode, promptAutoRefine, verificationLoop, onTokenUsageReceived]);
    
    // ... [Other Handlers remain the same] ...
    const handleSuggest = useCallback(async (type: 'useCase' | 'framework') => {
        if (!ideaText.trim()) return;
        setIsSuggesting(true);
        setError('');
        try {
            if (type === 'useCase') {
                const suggested = await suggestUseCase(ideaText, modelSettings.selectedModel);
                onUseCaseChange(suggested.text);
                if (suggested.usage && onTokenUsageReceived) onTokenUsageReceived(suggested.usage);
            } else {
                const suggested = await suggestFramework(ideaText, modelSettings.selectedModel);
                setSelectedFrameworkAcronym(suggested.text);
                if (suggested.usage && onTokenUsageReceived) onTokenUsageReceived(suggested.usage);
            }
        } catch (err: any) {
            setError(err.message || `Ocurrió un error al sugerir ${type}.`);
        } finally {
            setIsSuggesting(false);
        }
    }, [ideaText, modelSettings.selectedModel, onUseCaseChange, setSelectedFrameworkAcronym, onTokenUsageReceived]);

    const handleEvolvePrompt = useCallback(async () => {
        if (!generatedPrompt.trim()) return;
        setIsEvolving(true);
        setError('');
        try {
             // Construct settings
             const currentSettings = {
                selectedModel: modelSettings.selectedModel,
                temperature: modelSettings.temperature,
                topP: modelSettings.topP, topK: modelSettings.topK, 
                frequencyPenalty: modelSettings.frequencyPenalty, 
                presencePenalty: modelSettings.presencePenalty,
                maxOutputTokens: modelSettings.maxOutputTokens,
                systemInstruction: modelSettings.systemInstruction, systemInstructionFiles: modelSettings.systemInstructionFiles,
                stopSequences: modelSettings.stopSequences, seed: modelSettings.seed,
                thinkingBudget: modelSettings.thinkingBudget, isThinkingMode: modelSettings.isThinkingMode,
                useGoogleSearch: modelSettings.useGoogleSearch, isStructuredOutputEnabled: modelSettings.isStructuredOutputEnabled,
                isCodeExecutionEnabled: modelSettings.isCodeExecutionEnabled, isFunctionCallingEnabled: modelSettings.isFunctionCallingEnabled,
                safetySettings: modelSettings.safetySettings,
                toneShift, outputVerbosity, draftMode, promptAutoRefine, verificationLoop
            };

            const evolved = await evolvePrompt(generatedPrompt, currentSettings);
            setGeneratedPrompt(evolved.text);
            if (evolved.usage && onTokenUsageReceived) onTokenUsageReceived(evolved.usage);
        } catch (err: any) {
            setError(err.message || "Ocurrió un error al evolucionar el prompt.");
        } finally {
            setIsEvolving(false);
        }
    }, [generatedPrompt, modelSettings, toneShift, outputVerbosity, draftMode, promptAutoRefine, verificationLoop, setGeneratedPrompt, onTokenUsageReceived]);

    const handleAutoRunWorkflow = useCallback(async () => {
        if (!ideaText.trim()) {
            setError("Por favor, introduce una idea para el prompt.");
            return;
        }
        setIsAutoRunningWorkflow(true);
        setError('');
        setGeneratedSources([]);
        setGeneratedPrompt('Ejecutando flujo completo...');
        setGeneratedThought(undefined);

        try {
            setGeneratedPrompt('Paso 1/3: Sugiriendo caso de uso...');
            const suggestedUseCase = await suggestUseCase(ideaText, modelSettings.selectedModel);
            onUseCaseChange(suggestedUseCase.text);
            if (suggestedUseCase.usage && onTokenUsageReceived) onTokenUsageReceived(suggestedUseCase.usage);

            setGeneratedPrompt('Paso 2/3: Sugiriendo framework...');
            const suggestedFramework = await suggestFramework(ideaText, modelSettings.selectedModel);
            setSelectedFrameworkAcronym(suggestedFramework.text);
            if (suggestedFramework.usage && onTokenUsageReceived) onTokenUsageReceived(suggestedFramework.usage);

            setGeneratedPrompt('Paso 3/3: Optimizando el prompt...');
            const selectedFramework = allFrameworks.find(f => f.acronym === suggestedFramework.text);
            if (!selectedFramework) {
                throw new Error("El framework sugerido no es válido.");
            }
            
            const currentSettings = {
                selectedModel: modelSettings.selectedModel,
                temperature: modelSettings.temperature,
                topP: modelSettings.topP, topK: modelSettings.topK, 
                frequencyPenalty: modelSettings.frequencyPenalty, 
                presencePenalty: modelSettings.presencePenalty,
                maxOutputTokens: modelSettings.maxOutputTokens,
                systemInstruction: modelSettings.systemInstruction, systemInstructionFiles: modelSettings.systemInstructionFiles,
                stopSequences: modelSettings.stopSequences, seed: modelSettings.seed,
                thinkingBudget: modelSettings.thinkingBudget, isThinkingMode: modelSettings.isThinkingMode,
                useGoogleSearch: false, // Disable for optimization unless needed
                isStructuredOutputEnabled: modelSettings.isStructuredOutputEnabled,
                isCodeExecutionEnabled: modelSettings.isCodeExecutionEnabled, isFunctionCallingEnabled: modelSettings.isFunctionCallingEnabled,
                safetySettings: modelSettings.safetySettings,
                toneShift, outputVerbosity, draftMode, promptAutoRefine, verificationLoop
            };

            const result = await optimizePrompt(ideaText, suggestedUseCase.text, selectedFramework, files, 'default', 'general', 'es', '', '', currentSettings);
            
            setGeneratedPrompt(result.text);
            setGeneratedThought(result.thought);
            setGeneratedSources(result.sources);
            if (result.usage && onTokenUsageReceived) {
                onTokenUsageReceived(result.usage);
            }

        } catch (err: any) {
            setError(err.message || "Ocurrió un error durante el flujo automático.");
            setGeneratedPrompt('');
        } finally {
            setIsAutoRunningWorkflow(false);
        }
    }, [ideaText, files, onUseCaseChange, modelSettings, setSelectedFrameworkAcronym, setGeneratedPrompt, setGeneratedSources, onTokenUsageReceived, toneShift, outputVerbosity, draftMode, promptAutoRefine, verificationLoop]);
    
    // ... [Rest of handlers unchanged] ...
    
    // ... [The rest of the file remains exactly the same as provided previously] ...
    const handleOpenQualityAnalysis = useCallback(async (textToAnalyze: string, source: 'idea' | 'generated') => {
        if (!textToAnalyze.trim() || !IS_API_KEY_AVAILABLE) return;
        setQualityAnalysisState({
            isOpen: true,
            promptText: textToAnalyze,
            analysisResult: null,
            isLoading: true,
            error: null,
            source: source,
        });
        try {
            const result = await evaluatePromptQuality(textToAnalyze, modelSettings.selectedModel);
            setQualityAnalysisState(prev => ({ ...prev, analysisResult: result, isLoading: false }));
            if (result.usage && onTokenUsageReceived) onTokenUsageReceived(result.usage);
        } catch (err: any) {
            setQualityAnalysisState(prev => ({ ...prev, error: err.message || "Error al analizar", isLoading: false }));
        }
    }, [modelSettings.selectedModel, onTokenUsageReceived]);
    
    const handleImprovePrompt = useCallback(async () => {
        if (!qualityAnalysisState.promptText || !qualityAnalysisState.analysisResult || !qualityAnalysisState.source) return;
        
        setIsImprovingPrompt(true);
        setQualityAnalysisState(prev => ({ ...prev, error: null }));
        
        try {
            const improvedPrompt = await improvePromptBasedOnAnalysis(
                qualityAnalysisState.promptText,
                qualityAnalysisState.analysisResult,
                modelSettings.selectedModel
            );
            
            if (qualityAnalysisState.source === 'idea') {
                onIdeaChange(improvedPrompt.text);
            } else if (qualityAnalysisState.source === 'generated') {
                setGeneratedPrompt(improvedPrompt.text);
            }
            if (improvedPrompt.usage && onTokenUsageReceived) onTokenUsageReceived(improvedPrompt.usage);
    
            setQualityAnalysisState({ isOpen: false, promptText: null, analysisResult: null, isLoading: false, error: null, source: null });
    
        } catch (err: any) {
             setQualityAnalysisState(prev => ({ ...prev, error: err.message || "Error al mejorar el prompt" }));
        } finally {
            setIsImprovingPrompt(false);
        }
    }, [qualityAnalysisState, modelSettings.selectedModel, onIdeaChange, setGeneratedPrompt, onTokenUsageReceived]);

    const handleSuggestIdeas = useCallback(async () => {
        if (!ideaText.trim() && files.length === 0) return;
        setIsSuggestingIdeas(true);
        setError('');
        setGeneratedSources([]);
        setGeneratedPrompt('Buscando ideas relacionadas...');
        try {
            const result = await suggestRelatedIdeas(ideaText, files, modelSettings.selectedModel, modelSettings.maxOutputTokens);
            setGeneratedPrompt(result.text);
            if (result.usage && onTokenUsageReceived) onTokenUsageReceived(result.usage);
        } catch (err: any) {
            setError(err.message || "Ocurrió un error al sugerir ideas.");
            setGeneratedPrompt('');
        } finally {
            setIsSuggestingIdeas(false);
        }
    }, [ideaText, files, modelSettings, setGeneratedPrompt, setGeneratedSources, onTokenUsageReceived]);

    const handleExtractEntities = useCallback(async () => {
        if (!ideaText.trim() && files.length === 0) return;
        setIsExtracting(true);
        setError('');
        setGeneratedSources([]);
        setGeneratedPrompt('Extrayendo entidades clave...');
        try {
            const result = await extractKeyEntities(ideaText, files, modelSettings.selectedModel, modelSettings.maxOutputTokens);
            setGeneratedPrompt(result.text);
            if (result.usage && onTokenUsageReceived) onTokenUsageReceived(result.usage);
        } catch (err: any) {
            setError(err.message || "Ocurrió un error al extraer entidades.");
            setGeneratedPrompt('');
        } finally {
            setIsExtracting(false);
        }
    }, [ideaText, files, modelSettings, setGeneratedPrompt, setGeneratedSources, onTokenUsageReceived]);

    const handleGenerateTitles = useCallback(async () => {
        if (!ideaText.trim()) return;
        setIsGeneratingTitles(true);
        setError('');
        setGeneratedSources([]);
        setGeneratedPrompt('Generando títulos atractivos...');
        try {
            const result = await generateTitles(ideaText, modelSettings.selectedModel, modelSettings.maxOutputTokens);
            setGeneratedPrompt(result.text);
            if (result.usage && onTokenUsageReceived) onTokenUsageReceived(result.usage);
        } catch (err: any) {
            setError(err.message || "Ocurrió un error al generar títulos.");
            setGeneratedPrompt('');
        } finally {
            setIsGeneratingTitles(false);
        }
    }, [ideaText, modelSettings, setGeneratedPrompt, setGeneratedSources, onTokenUsageReceived]);

    const handleSummarize = useCallback(async () => {
        if (!ideaText.trim() && files.length === 0) return;
        setIsSummarizing(true);
        setError('');
        setGeneratedSources([]);
        setGeneratedPrompt('Resumiendo el contexto...');
        try {
            const result = await summarizeContext(ideaText, files, modelSettings.selectedModel, modelSettings.maxOutputTokens);
            setGeneratedPrompt(result.text);
            if (result.usage && onTokenUsageReceived) onTokenUsageReceived(result.usage);
        } catch (err: any)
        {
            setError(err.message || "Ocurrió un error al resumir.");
            setGeneratedPrompt('');
        } finally {
            setIsSummarizing(false);
        }
    }, [ideaText, files, modelSettings, setGeneratedPrompt, setGeneratedSources, onTokenUsageReceived]);

    const handleGetIdeaFeedback = useCallback(async () => {
        if (!ideaText.trim()) return;
        setIsGettingIdeaFeedback(true);
        setError('');
        try {
            const feedback = await evaluateIdeaQuality(ideaText, modelSettings.selectedModel, modelSettings.maxOutputTokens);
            setIdeaFeedback(feedback.text);
            if (feedback.usage && onTokenUsageReceived) onTokenUsageReceived(feedback.usage);
        } catch (err: any) {
            setError(err.message || "Error al obtener feedback de la idea.");
        } finally {
            setIsGettingIdeaFeedback(false);
        }
    }, [ideaText, modelSettings, onTokenUsageReceived]);
    
    const handleFormatText = useCallback(async (text: string, formatType: FormatType, target: 'idea' | 'result') => {
        if (!text.trim()) return;
        setIsFormatting(target);
        setError('');
        try {
            const result = await formatText(text, formatType, modelSettings.selectedModel);
            if (target === 'idea') {
                onIdeaChange(result.text);
            } else {
                setGeneratedPrompt(result.text);
            }
            if (result.usage && onTokenUsageReceived) onTokenUsageReceived(result.usage);
        } catch (err: any) {
            setError(err.message || 'Error al formatear texto.');
        } finally {
            setIsFormatting(null);
        }
    }, [modelSettings.selectedModel, onIdeaChange, setGeneratedPrompt, onTokenUsageReceived]);
    
    const handleModifyLength = useCallback(async (modifier: LengthModifier) => {
        if (!generatedPrompt.trim()) return;
        setIsModifyingLength(true);
        setError('');
        try {
            const result = await modifyContentLength(generatedPrompt, modifier, modelSettings.selectedModel);
            setGeneratedPrompt(result.text);
            if (result.usage && onTokenUsageReceived) onTokenUsageReceived(result.usage);
        } catch (err: any) {
             setError(err.message || 'Error al modificar la longitud.');
        } finally {
            setIsModifyingLength(false);
        }
    }, [generatedPrompt, modelSettings.selectedModel, setGeneratedPrompt, onTokenUsageReceived]);

    const handleModifyIdeaLength = useCallback(async (modifier: LengthModifier) => {
        if (!ideaText.trim()) return;
        setIsModifyingIdeaLength(true);
        setError('');
        try {
            const result = await modifyContentLength(ideaText, modifier, modelSettings.selectedModel);
            onIdeaChange(result.text);
            if (result.usage && onTokenUsageReceived) onTokenUsageReceived(result.usage);
        } catch (err: any) {
             setError(err.message || 'Error al modificar la longitud.');
        } finally {
            setIsModifyingIdeaLength(false);
        }
    }, [ideaText, modelSettings.selectedModel, onIdeaChange, onTokenUsageReceived]);

    const handleGenerateIdea = useCallback(async () => {
        setIsGeneratingIdea(true);
        setError('');
        try {
            const result = await generateRandomIdea(modelSettings.selectedModel);
            onIdeaChange(result.text);
            if (result.usage && onTokenUsageReceived) onTokenUsageReceived(result.usage);
        } catch (err: any) {
            setError(err.message || 'Error al generar idea.');
        } finally {
            setIsGeneratingIdea(false);
        }
    }, [modelSettings.selectedModel, onIdeaChange, onTokenUsageReceived]);

    const handleResetFineTuning = useCallback(() => {
        setTargetAudience('general');
        setOutputLanguage('es');
        setKeyInfo('');
        setNegativeConstraints('');
    }, []);
    
    const handleRandomizeOptimization = useCallback(() => {
        const randomFramework = allFrameworks[Math.floor(Math.random() * allFrameworks.length)];
        setSelectedFrameworkAcronym(randomFramework.acronym);
        
        const styleKeys = Object.keys(OPTIMIZATION_STYLE_DESCRIPTIONS).filter(k => k !== 'default');
        const randomStyle = styleKeys[Math.floor(Math.random() * styleKeys.length)];
        setOptimizationStyle(randomStyle);
    }, [setSelectedFrameworkAcronym]);

    const handleSave = () => {
        const selectedFramework = allFrameworks.find(f => f.acronym === selectedFrameworkAcronym);
        if (generatedPrompt && selectedFramework) {
            onSavePrompt({
                idea: ideaText,
                useCase: useCase,
                frameworkAcronym: selectedFramework.acronym,
                optimizedPrompt: generatedPrompt,
                model: modelSettings.selectedModel,
            });
        }
    };
    
    const handleCopyResult = () => {
        if (!generatedPrompt) return;
        navigator.clipboard.writeText(generatedPrompt);
        setIsResultCopied(true);
        setTimeout(() => setIsResultCopied(false), 2000);
    };

    const handleCopyIdea = () => {
        if (!ideaText) return;
        navigator.clipboard.writeText(ideaText);
        setIsIdeaCopied(true);
        setTimeout(() => setIsIdeaCopied(false), 2000);
    };

    const handleStartModelBattle = () => {
        if (!generatedPrompt.trim()) return;
        onModelBattle({
            prompt: generatedPrompt,
            models: ['gemini-3-pro-preview', 'gemini-3-flash-preview', 'gemma-3-27b-it']
        });
    };
    
    const anyLoading = isLoading || isExpanding || isSuggesting || isEvolving || isAutoRunningWorkflow || isSuggestingIdeas || isExtracting || isGeneratingTitles || isSummarizing || !!isFormatting || isGeneratingIdea || isGettingIdeaFeedback || isModifyingLength || isModifyingIdeaLength || isScrubbing || isRefining;
    
    const recommendedFramework = useMemo(() => {
        const category = CATEGORIZED_USE_CASES.find(cat => cat.useCases.includes(useCase))?.category || 'Default';
        const recommendedAcronym = FRAMEWORK_RECOMMENDATIONS_BY_CATEGORY[category] || FRAMEWORK_RECOMMENDATIONS_BY_CATEGORY['Default'];
        return allFrameworks.find(f => f.acronym.toLowerCase() === recommendedAcronym.toLowerCase()) || null;
    }, [useCase]);

    const selectedFramework = useMemo(() => {
        return allFrameworks.find(f => f.acronym === selectedFrameworkAcronym) || null;
    }, [selectedFrameworkAcronym]);
    
    const frameworksByCategory = useMemo(() => {
        const allCategories = [...new Set(allFrameworks.map(f => f.category))];
        return allCategories.map(category => ({
            category,
            frameworks: allFrameworks.filter(fw => fw.category === category).sort((a,b) => a.acronym.localeCompare(b.acronym))
        }));
    }, []);

    const FormatDropdown: React.FC<{ text: string; onFormat: (type: FormatType) => void; isLoading: boolean; disabled: boolean, customButtonClass?: string, label?: string }> = ({ text, onFormat, isLoading, disabled, customButtonClass, label }) => {
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

        const defaultClasses = "p-1.5 bg-white/5 rounded-md text-gray-400 hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:bg-white/10 transition-all";

        return (
            <div ref={ref} className="relative inline-block">
                <button
                    onClick={() => setIsOpen(prev => !prev)}
                    disabled={!text || disabled || isLoading}
                    className={customButtonClass || defaultClasses}
                    title="Formatear texto con IA"
                >
                    {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white/20 border-t-teal-400 rounded-full animate-spin"></div>
                    ) : (
                        <Bars3BottomLeftIcon className="w-5 h-5" />
                    )}
                    {label && <span>{label}</span>}
                </button>
                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 glass-panel rounded-xl shadow-2xl z-20 animate-fade-in-up py-2">
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
    
    let bottomSaveLabel = "Guardar";
    let bottomSaveIcon = <SaveDiskIcon className="w-5 h-5" />;
    let bottomSaveStyle = "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed";
    
    if (isSaving) {
        bottomSaveLabel = "Guardando...";
        bottomSaveStyle = "glass-btn-orange opacity-80";
    } else if (promptToIterateId) {
        bottomSaveLabel = "Guardar Versión";
        bottomSaveStyle = "bg-indigo-500/20 border-indigo-500 text-indigo-300 hover:bg-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]";
    } else if (generatedPrompt) {
        bottomSaveLabel = "Guardar Sesión";
        bottomSaveStyle = "glass-btn-orange";
    }

    const toolButtonClass = "p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:text-teal-400 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg";
    const headerToolButtonClass = "glass-button px-4 py-2.5 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 hover:border-white/20 shadow-lg flex items-center gap-2 text-sm font-semibold group active:scale-95";

    return (
        <div className="glass-panel rounded-3xl p-8 flex flex-col gap-8 relative shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-t border-white/20">
            {/* ... Modals ... */}
            {qualityAnalysisState.isOpen && (
                <QualityAnalysisModal
                    isOpen={qualityAnalysisState.isOpen}
                    onClose={() => setQualityAnalysisState(prev => ({ ...prev, isOpen: false }))}
                    isLoading={qualityAnalysisState.isLoading}
                    result={qualityAnalysisState.analysisResult}
                    error={qualityAnalysisState.error}
                    promptText={qualityAnalysisState.promptText}
                    onImprovePrompt={handleImprovePrompt}
                    isImproving={isImprovingPrompt}
                />
            )}
            {isIdeaCanvasOpen && (
                <CanvasModal 
                    title="Editor de Idea"
                    content={ideaText}
                    isEditable={true}
                    onClose={() => setIsIdeaCanvasOpen(false)}
                    onSave={(newContent) => {
                        onIdeaChange(newContent);
                        setIsIdeaCanvasOpen(false);
                    }}
                />
            )}
            {isResultCanvasOpen && (
                <CanvasModal
                    title="Visor de Resultado Optimizado"
                    content={generatedPrompt}
                    isEditable={false}
                    onClose={() => setIsResultCanvasOpen(false)}
                />
            )}
             {ideaFeedback && (
                <CanvasModal
                    title="Feedback de Idea"
                    content={ideaFeedback}
                    isEditable={false}
                    onClose={() => setIdeaFeedback(null)}
                />
            )}

            {/* --- STATUS HEADER FOR ITERATION CONTEXT --- */}
            <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${promptToIterateId ? 'bg-indigo-500/20 text-indigo-300' : 'bg-teal-500/20 text-teal-300'}`}>
                        {promptToIterateId ? <PencilIcon className="w-5 h-5" /> : <SparklesIcon className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">
                            {promptToIterateId ? `Editando Sesión: ${promptToIterate?.name || promptToIterate?.baseIdea || 'Sin Título'}` : 'Nueva Sesión (Borrador)'}
                        </h3>
                        <p className="text-xs text-gray-400">
                            {promptToIterateId 
                                ? `Versión Actual: ${currentVersionIndex} • Modificaciones se auto-guardan` 
                                : 'Comienza describiendo tu idea abajo'}
                        </p>
                    </div>
                </div>
                {promptToIterateId && (
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                        <button 
                            onClick={() => onRenameSession(promptToIterateId)}
                            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Renombrar sesión"
                        >
                            <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => {
                                if(window.confirm('¿Eliminar esta sesión y todo su historial?')) {
                                    onDeleteSession(promptToIterateId);
                                }
                            }}
                            className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/10 rounded-lg transition-all"
                            title="Eliminar sesión"
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="w-px h-4 bg-white/10 mx-1"></div>
                        <button 
                            onClick={onCancelIteration} 
                            className="px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            Salir
                        </button>
                    </div>
                )}
            </div>

            {draftNotification && (
                <div className="bg-indigo-500/20 border border-indigo-400/50 shadow-lg backdrop-blur-md rounded-xl p-4 flex justify-between items-center animate-fade-in text-sm">
                    <p className="text-indigo-200 font-medium">{draftNotification}</p>
                    {draftNotification.includes("restaurarlo") && (
                         <button onClick={handleRestoreDraft} className="glass-button bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-semibold">Restaurar</button>
                    )}
                </div>
            )}
            
            <div className="flex flex-col gap-14 mt-4">
                <div className="flex flex-col gap-6" onFocus={() => setActiveStep(1)} onMouseEnter={() => setActiveStep(1)}>
                    
                    {/* Step 1 Header with Tools */}
                    <div className="flex flex-wrap justify-between items-center gap-4 border-b border-white/5 pb-4 mb-2">
                        <div className="flex items-center gap-4 md:gap-6 flex-wrap">
                            <StepIndicator step={1} title="Tu Idea" isActive={activeStep === 1} />
                            
                            {/* Tools moved next to Title */}
                            <div className="flex items-center gap-3 p-1">
                                <button
                                    onClick={handleSaveDraftStep1}
                                    disabled={!ideaText.trim() || isDraftSaving}
                                    className={`${headerToolButtonClass} ${isDraftSaving ? 'text-orange-400 border-orange-400/30' : ''}`}
                                    title="Guardar borrador actual en la biblioteca"
                                >
                                    {isDraftSaving ? <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin" /> : <SaveDiskIcon className="w-5 h-5" />}
                                    <span>Guardar</span>
                                </button>
                                
                                {/* 4 NEW BUTTONS - Ensured Visibility - WITH PROGRESS */}
                                <ProgressButton
                                    onClick={() => handleQuickRefine('magic')}
                                    disabled={!ideaText.trim() || anyLoading}
                                    isLoading={isRefining}
                                    progress={refineProgress}
                                    label="Mejorar"
                                    icon={<SparklesIcon className="w-5 h-5 text-purple-400" />}
                                    className={headerToolButtonClass}
                                />
                                <ProgressButton
                                    onClick={() => handleQuickRefine('fix')}
                                    disabled={!ideaText.trim() || anyLoading}
                                    isLoading={isRefining}
                                    progress={refineProgress}
                                    label="Corregir"
                                    icon={<WrenchScrewdriverIcon className="w-5 h-5 text-blue-400" />}
                                    className={headerToolButtonClass}
                                />
                                <ProgressButton
                                    onClick={() => handleQuickRefine('translate')}
                                    disabled={!ideaText.trim() || anyLoading}
                                    isLoading={isRefining}
                                    progress={refineProgress}
                                    label="Traducir"
                                    icon={<GlobeAltIcon className="w-5 h-5 text-green-400" />}
                                    className={headerToolButtonClass}
                                />
                                <ProgressButton
                                    onClick={() => handleModifyIdeaLength('simple')}
                                    disabled={!ideaText.trim() || anyLoading}
                                    isLoading={isModifyingIdeaLength}
                                    progress={refineProgress}
                                    label="Simplificar"
                                    icon={<TableCellsIcon className="w-5 h-5 text-yellow-400" />}
                                    className={headerToolButtonClass}
                                />

                                <button onClick={handleCopyIdea} title="Copiar texto de la idea" className={headerToolButtonClass}>
                                    {isIdeaCopied ? <CheckIcon className="w-5 h-5 text-teal-400" /> : <ClipboardIcon className="w-5 h-5" />}
                                    <span>Copiar</span>
                                </button>
                                
                                <button onClick={() => setIsIdeaCanvasOpen(true)} title="Abrir editor de pantalla completa" className={headerToolButtonClass}>
                                    <ArrowsPointingOutIcon className="w-5 h-5" />
                                    <span>Expandir</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleGenerateIdea}
                                disabled={anyLoading || !IS_API_KEY_AVAILABLE}
                                className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-200 hover:text-yellow-100 hover:bg-yellow-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(234,179,8,0.1)]"
                                title="Generar una idea aleatoria para empezar a experimentar."
                            >
                                {isGeneratingIdea ? (
                                    <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <LightBulbIcon className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-4">
                            <div className="relative group flex-grow">
                                <textarea
                                    id="idea-input"
                                    value={ideaText}
                                    onChange={(e) => onIdeaChange(e.target.value)}
                                    placeholder="Ej: Crea una campaña de email para el lanzamiento de un nuevo café..."
                                    className="glass-input w-full h-full min-h-[200px] rounded-2xl p-5 text-gray-200 placeholder-gray-500 resize-y text-base leading-relaxed pr-14" // Added pr-14
                                    disabled={anyLoading}
                                    title="Escribe aquí tu idea, tarea o borrador inicial que deseas optimizar."
                                />
                                
                                {/* New Input Actions: Voice & PII */}
                                <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
                                    <button
                                        onClick={toggleRecording}
                                        disabled={anyLoading}
                                        className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 ${
                                            isRecording 
                                            ? 'bg-red-500/20 text-red-400 animate-pulse border-red-500/50 shadow-red-500/20' 
                                            : 'bg-black/30 text-gray-400 hover:text-white hover:bg-black/50'
                                        }`}
                                        title={isRecording ? "Detener grabación" : "Dictar idea (Voz)"}
                                    >
                                        <MicrophoneIcon className="w-5 h-5" />
                                    </button>
                                    
                                    <button
                                        onClick={handleScrubPII}
                                        disabled={!ideaText || anyLoading}
                                        className={`p-3 rounded-full backdrop-blur-md transition-all shadow-lg border border-white/10 ${
                                            isScrubbing
                                            ? 'bg-green-500/20 text-green-400 border-green-500/50'
                                            : 'bg-black/30 text-gray-400 hover:text-teal-400 hover:bg-black/50'
                                        }`}
                                        title="Sanitizar Datos (Eliminar Emails/Teléfonos)"
                                    >
                                        {isScrubbing ? (
                                            <div className="w-5 h-5 border-2 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <FingerPrintIcon className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div title="Adjunta archivos de texto o imágenes para dar más contexto a la IA.">
                                <FileUploader files={files} onFilesChange={handleFileChange} />
                            </div>
                        </div>
                         <div className="flex flex-col gap-4 justify-center">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="expansion-framework-select" className="text-sm font-semibold text-gray-400 ml-1">Guía de Expansión (Opcional)</label>
                                <div className="flex gap-3">
                                    <select
                                        id="expansion-framework-select"
                                        value={expansionFrameworkAcronym}
                                        onChange={(e) => setExpansionFrameworkAcronym(e.target.value)}
                                        disabled={anyLoading || !IS_API_KEY_AVAILABLE}
                                        className="glass-input w-full text-sm rounded-xl px-4 py-3 text-gray-300"
                                        title="Elige un framework para guiar cómo la IA debe expandir tu idea inicial."
                                    >
                                        <option value="auto" className="bg-indigo-950 text-white">Automático (Recomendado)</option>
                                        {frameworksByCategory.map(group => (
                                            <optgroup key={group.category} label={group.category} className="bg-indigo-950 text-white">
                                                {group.frameworks.map(fw => (
                                                    <option key={fw.id} value={fw.acronym} className="bg-indigo-950 text-white">{fw.acronym}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                    <button 
                                        onClick={handleExpandIdea} 
                                        disabled={!ideaText || anyLoading || !IS_API_KEY_AVAILABLE} 
                                        className="glass-button flex items-center justify-center gap-2 text-gray-200 hover:text-teal-300 px-5 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Amplía tu idea breve en un borrador más detallado usando IA."
                                    >
                                        {isExpanding ? (
                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="w-4 h-4 animate-pulse text-teal-400" />
                                                <span className="font-mono text-xs">{expandProgress}%</span>
                                            </div>
                                        ) : (
                                            <>
                                                <LightBulbIcon className="w-5 h-5" /> 
                                                Expandir
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <button 
                                onClick={handleAutoRunWorkflow} 
                                disabled={!ideaText || anyLoading || !IS_API_KEY_AVAILABLE} 
                                className="glass-button w-full text-sm flex items-center justify-center gap-2 bg-teal-500/20 border-teal-400/30 hover:bg-teal-500/30 text-teal-100 px-4 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-lg" 
                                title="Ejecuta automáticamente la sugerencia de caso de uso, framework y la optimización en secuencia."
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                                {isAutoRunningWorkflow ? 'Ejecutando...' : 'Correr Flujo Automático'}
                            </button>
                            <div className="border-t border-white/10 my-3"></div>
                             <div className="grid grid-cols-2 gap-3">
                                <button 
                                    onClick={() => handleOpenQualityAnalysis(ideaText, 'idea')} 
                                    disabled={!ideaText.trim() || anyLoading || !IS_API_KEY_AVAILABLE} 
                                    className="glass-button w-full text-xs flex items-center justify-center gap-2 text-gray-300 hover:text-indigo-300 px-3 py-2.5 rounded-lg font-semibold"
                                    title="Obtén un análisis detallado de calidad y seguridad de tu idea inicial."
                                >
                                    <AcademicCapIcon className="w-4 h-4" />
                                    {qualityAnalysisState.isLoading && qualityAnalysisState.source === 'idea' ? '...' : 'Evaluar Idea'}
                                </button>
                                <button 
                                    onClick={handleGetIdeaFeedback} 
                                    disabled={!ideaText.trim() || anyLoading || !IS_API_KEY_AVAILABLE} 
                                    className="glass-button w-full text-xs flex items-center justify-center gap-2 text-gray-300 hover:text-purple-300 px-3 py-2.5 rounded-lg font-semibold"
                                    title="Recibe feedback cualitativo rápido sobre las fortalezas y debilidades de tu idea."
                                >
                                    <ClipboardIcon className="w-4 h-4" />
                                    {isGettingIdeaFeedback ? '...' : 'Feedback'}
                                </button>
                                <button 
                                    onClick={handleSuggestIdeas} 
                                    disabled={(!ideaText.trim() && files.length === 0) || anyLoading || !IS_API_KEY_AVAILABLE} 
                                    className="glass-button w-full text-xs flex items-center justify-center gap-2 text-gray-300 hover:text-teal-300 px-3 py-2.5 rounded-lg font-semibold"
                                    title="Genera ideas alternativas o relacionadas basadas en tu entrada actual."
                                >
                                    <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                    {isSuggestingIdeas ? '...' : 'Sugerir Ideas'}
                                </button>
                                <button 
                                    onClick={handleExtractEntities} 
                                    disabled={(!ideaText.trim() && files.length === 0) || anyLoading || !IS_API_KEY_AVAILABLE} 
                                    className="glass-button w-full text-xs flex items-center justify-center gap-2 text-gray-300 hover:text-pink-300 px-3 py-2.5 rounded-lg font-semibold"
                                    title="Identifica y extrae personas, lugares y conceptos clave de tu texto."
                                >
                                    <KeyIcon className="w-4 h-4" />
                                    {isExtracting ? '...' : 'Entidades'}
                                </button>
                                <button 
                                    onClick={handleGenerateTitles} 
                                    disabled={!ideaText.trim() || anyLoading || !IS_API_KEY_AVAILABLE} 
                                    className="glass-button w-full text-xs flex items-center justify-center gap-2 text-gray-300 hover:text-yellow-300 px-3 py-2.5 rounded-lg font-semibold"
                                    title="Genera opciones de títulos atractivos para tu contenido."
                                >
                                    <NewspaperIcon className="w-4 h-4" />
                                    {isGeneratingTitles ? '...' : 'Títulos'}
                                </button>
                                <button 
                                    onClick={handleSummarize} 
                                    disabled={(!ideaText.trim() && files.length === 0) || anyLoading || !IS_API_KEY_AVAILABLE} 
                                    className="glass-button w-full text-xs flex items-center justify-center gap-2 text-gray-300 hover:text-cyan-300 px-3 py-2.5 rounded-lg font-semibold"
                                    title="Crea un resumen conciso de tu idea y el contexto de los archivos."
                                >
                                    <DocumentTextIcon className="w-4 h-4" />
                                    {isSummarizing ? '...' : 'Resumir'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6" onFocus={() => setActiveStep(2)} onMouseEnter={() => setActiveStep(2)}>
                    <div className="flex justify-between items-center">
                        <StepIndicator step={2} title="Tu Caso de Uso y Ajuste Fino" isActive={activeStep === 2} />
                        <div className="relative group">
                            <button
                                onClick={handleResetFineTuning}
                                disabled={anyLoading}
                                className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:border-teal-400 hover:text-teal-400 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                title="Restablecer los valores de ajuste fino a sus valores por defecto."
                            >
                                <ArrowPathIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-4">
                            <div className="relative">
                                <select 
                                    id="use-case-select"
                                    value={useCase}
                                    onChange={(e) => onUseCaseChange(e.target.value)}
                                    className="glass-input w-full rounded-xl px-4 py-3 text-gray-300 appearance-none"
                                    disabled={anyLoading}
                                    title="Selecciona la categoría que mejor describa el propósito de tu prompt."
                                >
                                    {CATEGORIZED_USE_CASES.map(category => (
                                        <optgroup key={category.category} label={category.category} className="bg-indigo-950 text-white">
                                            {category.useCases.map(uc => <option key={uc} value={uc} className="bg-indigo-950 text-white">{uc}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                            </div>
                            <button 
                                onClick={() => handleSuggest('useCase')} 
                                disabled={!ideaText || anyLoading || !IS_API_KEY_AVAILABLE} 
                                className="glass-button w-full text-sm flex items-center justify-center gap-2 text-gray-300 hover:text-teal-300 px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Deja que la IA analice tu idea y sugiera la categoría más adecuada."
                            >
                            <SparklesIcon className="w-4 h-4" /> 
                            {isSuggesting ? 'Sugiriendo...' : 'Sugerir Caso de Uso'}
                            </button>
                             <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-400 flex-grow flex flex-col justify-between shadow-inner backdrop-blur-sm">
                                {recommendedFramework ? (
                                    <>
                                        <div>
                                            <h4 className="font-bold text-gray-200 mb-1">Recomendación Inteligente</h4>
                                            <p>Para un caso de uso de <span className="text-teal-300 font-semibold drop-shadow-md">{CATEGORIZED_USE_CASES.find(c => c.useCases.includes(useCase))?.category}</span>, el framework <span className="text-teal-300 font-semibold drop-shadow-md">{recommendedFramework.acronym}</span> suele ser muy efectivo.</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedFrameworkAcronym(recommendedFramework.acronym)}
                                            className="w-full mt-3 text-xs bg-teal-500/20 border border-teal-500/30 hover:bg-teal-500/30 text-teal-200 px-3 py-2 rounded-lg transition-all font-semibold active:scale-95 shadow-lg"
                                            title={`Aplicar automáticamente el framework ${recommendedFramework.acronym} a tu configuración.`}>
                                            Aplicar {recommendedFramework.acronym}
                                        </button>
                                    </>
                                ) : (
                                    <p className="self-center">Selecciona un caso de uso para recibir una recomendación de framework.</p>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-4 h-full shadow-inner backdrop-blur-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label htmlFor="target-audience" className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2 ml-1"><UsersIcon className="w-3.5 h-3.5" /> Audiencia</label>
                                        <select 
                                            id="target-audience" 
                                            value={targetAudience} 
                                            onChange={e => setTargetAudience(e.target.value)} 
                                            className="glass-input w-full text-xs rounded-lg px-3 py-2 text-gray-300" 
                                            disabled={anyLoading}
                                            title="Define a quién va dirigido el resultado (ej. expertos, niños)."
                                        >
                                            <option className="bg-indigo-950 text-white" value="general">General</option>
                                            <option className="bg-indigo-950 text-white" value="principiantes">Principiantes</option>
                                            <option className="bg-indigo-950 text-white" value="expertos">Expertos</option>
                                            <option className="bg-indigo-950 text-white" value="niños">Niños</option>
                                            <option className="bg-indigo-950 text-white" value="ejecutivos">Ejecutivos</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label htmlFor="output-language" className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2 ml-1"><GlobeAltIcon className="w-3.5 h-3.5" /> Idioma</label>
                                        <select 
                                            id="output-language" 
                                            value={outputLanguage} 
                                            onChange={e => setOutputLanguage(e.target.value)} 
                                            className="glass-input w-full text-xs rounded-lg px-3 py-2 text-gray-300" 
                                            disabled={anyLoading}
                                            title="Idioma en el que la IA generará la respuesta final."
                                        >
                                            <option className="bg-indigo-950 text-white" value="es">Español</option>
                                            <option className="bg-indigo-950 text-white" value="en">Inglés</option>
                                            <option className="bg-indigo-950 text-white" value="fr">Francés</option>
                                            <option className="bg-indigo-950 text-white" value="de">Alemán</option>
                                            <option className="bg-indigo-950 text-white" value="pt">Portugués</option>
                                        </select>
                                    </div>
                                </div>
                                 <div>
                                    <label htmlFor="key-info" className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2 ml-1"><CheckBadgeIcon className="w-3.5 h-3.5" /> Info Clave (a incluir)</label>
                                    <textarea 
                                        id="key-info" 
                                        value={keyInfo} 
                                        onChange={e => setKeyInfo(e.target.value)} 
                                        rows={2} 
                                        className="glass-input w-full text-xs rounded-lg p-3 text-gray-300 resize-y" 
                                        placeholder="Ej: Mencionar el descuento del 20%..." 
                                        disabled={anyLoading}
                                        title="Detalles específicos que el prompt final DEBE incluir obligatoriamente."
                                    ></textarea>
                                </div>
                                <div>
                                    <label htmlFor="negative-constraints" className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-2 ml-1"><NoSymbolIcon className="w-3.5 h-3.5" /> Restricciones (a evitar)</label>
                                    <textarea 
                                        id="negative-constraints" 
                                        value={negativeConstraints} 
                                        onChange={e => setNegativeConstraints(e.target.value)} 
                                        rows={2} 
                                        className="glass-input w-full text-xs rounded-lg p-3 text-gray-300 resize-y" 
                                        placeholder="Ej: No usar un tono demasiado formal..." 
                                        disabled={anyLoading}
                                        title="Lo que el prompt final NO debe hacer o mencionar."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-6" onFocus={() => setActiveStep(3)} onMouseEnter={() => setActiveStep(3)}>
                    <div className="flex justify-between items-center">
                        <StepIndicator step={3} title="Optimización" isActive={activeStep === 3} />
                         <div className="relative group">
                            <button
                                onClick={handleRandomizeOptimization}
                                disabled={anyLoading}
                                className="p-3 bg-white/5 border border-white/10 rounded-full text-gray-400 hover:border-teal-400 hover:text-teal-400 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                                title="Seleccionar aleatoriamente un framework y un estilo de optimización."
                            >
                                <DiceIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="framework-select" className="text-sm font-semibold text-gray-400 ml-1">Framework</label>
                                <div className="flex items-center gap-2">
                                <select 
                                    id="framework-select"
                                    value={selectedFrameworkAcronym}
                                    onChange={(e) => setSelectedFrameworkAcronym(e.target.value)}
                                    className="glass-input w-full rounded-xl px-4 py-3 text-gray-300 appearance-none"
                                    disabled={anyLoading}
                                    title="Estructura base que organizará tu prompt."
                                >
                                {allFrameworks.sort((a,b) => a.acronym.localeCompare(b.acronym)).map(fw => <option className="bg-indigo-950 text-white" key={fw.id} value={fw.acronym}>{fw.acronym}</option>)}
                                </select>
                                <button 
                                    onClick={() => handleSuggest('framework')} 
                                    disabled={!ideaText || anyLoading || !IS_API_KEY_AVAILABLE} 
                                    className="p-3 bg-white/5 border border-white/10 rounded-xl hover:border-teal-400 hover:text-teal-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg" 
                                    title="Sugerir el mejor framework basado en tu idea."
                                >
                                    <SparklesIcon className="w-5 h-5"/>
                                </button>
                                </div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-400 flex-grow shadow-inner backdrop-blur-sm">
                                <h4 className="font-bold text-gray-200 mb-1">Descripción del Framework</h4>
                                <p>{selectedFramework?.description || 'Selecciona un framework para ver su descripción.'}</p>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="style-select" className="text-sm font-semibold text-gray-400 ml-1">Estilo de Optimización</label>
                                <select 
                                    id="style-select" 
                                    value={optimizationStyle} 
                                    onChange={e => setOptimizationStyle(e.target.value)} 
                                    className="glass-input w-full rounded-xl px-4 py-3 text-gray-300 appearance-none" 
                                    disabled={anyLoading}
                                    title="Define el tono, formato y longitud del prompt resultante."
                                >
                                <option className="bg-indigo-950 text-white" value="default">Default (Equilibrado)</option>
                                <optgroup className="bg-indigo-950 text-white" label="Longitud">
                                    <option value="brief" className="bg-indigo-950 text-white">Breve</option>
                                    <option value="short" className="bg-indigo-950 text-white">Corto</option>
                                    <option value="medium" className="bg-indigo-950 text-white">Medio</option>
                                    <option value="long" className="bg-indigo-950 text-white">Largo</option>
                                    <option value="very_long" className="bg-indigo-950 text-white">Muy Largo</option>
                                    <option value="max_length" className="bg-indigo-950 text-white">Extremo</option>
                                </optgroup>
                                <optgroup className="bg-indigo-950 text-white" label="Formato de Salida">
                                    <option value="markdown" className="bg-indigo-950 text-white">Markdown</option>
                                    <option value="json" className="bg-indigo-950 text-white">JSON</option>
                                    <option value="xml" className="bg-indigo-950 text-white">XML</option>
                                    <option value="yaml" className="bg-indigo-950 text-white">YAML</option>
                                    <option value="step_by_step" className="bg-indigo-950 text-white">Paso a Paso</option>
                                    <option value="table" className="bg-indigo-950 text-white">Tabla</option>
                                    <option value="script" className="bg-indigo-950 text-white">Guion</option>
                                </optgroup>
                                <optgroup className="bg-indigo-950 text-white" label="Tono">
                                    <option value="formal" className="bg-indigo-950 text-white">Formal</option>
                                    <option value="casual" className="bg-indigo-950 text-white">Casual</option>
                                    <option value="persuasive" className="bg-indigo-950 text-white">Persuasivo</option>
                                    <option value="empathetic" className="bg-indigo-950 text-white">Empático</option>
                                    <option value="creative" className="bg-indigo-950 text-white">Creativo</option>
                                    <option value="technical" className="bg-indigo-950 text-white">Técnico</option>
                                    <option value="socratic" className="bg-indigo-950 text-white">Socrático</option>
                                    <option value="simple" className="bg-indigo-950 text-white">Simple (ELi5)</option>
                                </optgroup>
                                <optgroup className="bg-indigo-950 text-white" label="Enfoque Analítico">
                                    <option value="deep_analysis" className="bg-indigo-950 text-white">Análisis Profundo</option>
                                    <option value="cot" className="bg-indigo-950 text-white">Chain of Thought (CoT)</option>
                                    <option value="multi_perspective" className="bg-indigo-950 text-white">Múltiples Perspectivas</option>
                                    <option value="problem_solving" className="bg-indigo-950 text-white">Resolución de Problemas</option>
                                </optgroup>
                                <optgroup className="bg-indigo-950 text-white" label="Audiencia">
                                    <option value="for_beginners" className="bg-indigo-950 text-white">Principiantes</option>
                                    <option value="for_experts" className="bg-indigo-950 text-white">Expertos</option>
                                    <option value="for_kids" className="bg-indigo-950 text-white">Niños</option>
                                    <option value="for_executives" className="bg-indigo-950 text-white">Ejecutivos (TL;DR)</option>
                                </optgroup>
                                <optgroup className="bg-indigo-950 text-white" label="Especializado">
                                    <option value="code_generation" className="bg-indigo-950 text-white">Generación de Código</option>
                                </optgroup>
                                </select>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-400 flex-grow shadow-inner backdrop-blur-sm">
                                <p>{OPTIMIZATION_STYLE_DESCRIPTIONS[optimizationStyle]}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8">
                {IS_API_KEY_AVAILABLE ? (
                    <div className="flex gap-2">
                        <button
                            onClick={handleGeneratePrompt}
                            disabled={anyLoading || !ideaText.trim()}
                            className="glass-button w-full flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500/80 via-cyan-500/80 to-teal-500/80 border border-blue-400 text-white font-bold py-4 rounded-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_25px_rgba(76,201,240,0.4)] hover:shadow-[0_0_40px_rgba(76,201,240,0.6)] hover:scale-[1.01]"
                            title="Transforma tu idea y configuración en un prompt de ingeniería profesional usando Gemini."
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2 animate-pulse">
                                    <ClockIcon className="w-6 h-6 text-white" />
                                    <span>Optimizando... {optimizationProgress}%</span>
                                </div>
                            ) : (
                                <>
                                    <SparklesIcon className="w-6 h-6 text-white" />
                                    {promptToIterateId ? 'Generar Nueva Versión' : 'Optimizar con Gemini'}
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={handleSaveDraft}
                        className="glass-button w-full flex items-center justify-center gap-3 bg-indigo-600/80 border border-indigo-400 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-lg"
                        title="Guarda tu progreso actual en el navegador para continuar luego sin conexión."
                    >
                        <SaveDiskIcon className="w-6 h-6" />
                        Guardar Borrador (Modo Offline)
                    </button>
                )}
                
                <div className="mt-10">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold text-gray-100 flex items-center gap-3">
                            <span className="w-2 h-8 bg-cyan-400 rounded-full shadow-[0_0_15px_var(--color-neon-blue)]"></span>
                            Resultado Optimizado
                        </h3>
                    </div>

                    {/* Thought Trace Integration */}
                    {generatedThought && (
                        <ThoughtVisualizer thought={generatedThought} />
                    )}

                    <div className="glass-input w-full min-h-[250px] rounded-2xl p-6 pr-16 text-gray-100 whitespace-pre-wrap font-mono text-sm relative group transition-all border border-white/10">
                        {anyLoading && !isLoading && <span className="text-gray-500 loading-cursor">{generatedPrompt}</span>}
                        {isLoading && <span className="text-gray-500 loading-cursor">Generando... {optimizationProgress}%</span>}
                        {error && <span className="text-red-400 animate-fade-in">{error}</span>}
                        {!anyLoading && !error && (generatedPrompt ? <span className="animate-fade-in">{generatedPrompt}</span> : <span className="text-gray-600 italic">El resultado aparecerá aquí...</span>)}
                        {generatedPrompt && !anyLoading && (
                            <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 items-end">
                                <LengthModifierDropdown 
                                    onModify={handleModifyLength} 
                                    isLoading={isModifyingLength} 
                                    disabled={anyLoading || !IS_API_KEY_AVAILABLE}
                                    minimal={false}
                                    placement="left"
                                />
                                <div className="flex gap-2">
                                    <FormatDropdown text={generatedPrompt} onFormat={(type) => handleFormatText(generatedPrompt, type, 'result')} isLoading={isFormatting === 'result'} disabled={anyLoading || !IS_API_KEY_AVAILABLE} />
                                    <button
                                        onClick={handleCopyResult}
                                        title="Copiar prompt optimizado al portapapeles"
                                        className="p-2 bg-white/10 rounded-lg text-gray-300 hover:text-teal-400 hover:bg-white/20 transition-all backdrop-blur-md border border-white/10"
                                    >
                                        {isResultCopied ? <CheckIcon className="w-5 h-5 text-teal-400" /> : <ClipboardIcon className="w-5 h-5" />}
                                    </button>
                                    <button onClick={() => setIsResultCanvasOpen(true)} title="Ver resultado en pantalla completa" className="p-2 bg-white/10 rounded-lg text-gray-300 hover:text-teal-400 hover:bg-white/20 transition-all backdrop-blur-md border border-white/10">
                                        <ArrowsPointingOutIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    {generatedSources.length > 0 && (
                         <div className="mt-3 text-xs text-gray-400 animate-fade-in bg-black/20 p-3 rounded-lg border border-white/5">
                            <span className="font-semibold text-teal-400">Fuentes consultadas:</span>
                            <ul className="list-disc list-inside mt-1 space-y-1">
                                {generatedSources.map((source, index) => (
                                    <li key={index}>
                                        <a href={source.web?.uri} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white hover:underline transition-colors">{source.web?.title || 'Fuente sin título'}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-6">
                         <button 
                            onClick={handleSave} 
                            disabled={isSaving || anyLoading || !generatedPrompt.trim()} 
                            className={`flex items-center justify-center gap-2 font-semibold px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 ${bottomSaveStyle}`}
                            title={promptToIterateId ? "Guardar como una nueva versión en el historial" : "Crear una nueva entrada en la biblioteca"}
                        >
                            {bottomSaveIcon}
                            {bottomSaveLabel}
                        </button>
                         <button 
                            onClick={handleEvolvePrompt} 
                            disabled={anyLoading || isSaving || !generatedPrompt.trim() || !IS_API_KEY_AVAILABLE} 
                            className="glass-btn-magic flex items-center justify-center gap-2 font-semibold px-4 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Inicia un ciclo de auto-mejora donde la IA critica y refina el prompt automáticamente."
                        >
                            <HelixIcon className="w-5 h-5"/>
                            {isEvolving ? 'Evolucionando...' : 'Evolucionar IA'}
                        </button>
                        <button 
                            onClick={handleStartModelBattle}
                            disabled={!generatedPrompt.trim() || !IS_API_KEY_AVAILABLE}
                            className="flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-black px-4 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Compara este prompt contra Gemini 3 Pro, Flash y Gemma 3 en una batalla de latencia y calidad."
                        >
                            <SparklesIcon className="w-5 h-5"/>
                            Batalla SOTA
                        </button>
                        <button 
                            onClick={() => onTestInArena(generatedPrompt)} 
                            disabled={!generatedPrompt.trim()} 
                            className="glass-button flex items-center justify-center gap-2 text-purple-200 hover:text-purple-100 px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-purple-500/20"
                            title="Abre un entorno de pruebas para ejecutar este prompt y ver qué responde la IA."
                        >
                            <BeakerIcon className="w-5 h-5"/>
                            Probar en Arena
                        </button>
                        <button 
                            onClick={() => onBatchTest(generatedPrompt)} 
                            disabled={!generatedPrompt.trim() || !IS_API_KEY_AVAILABLE} 
                            className="glass-button flex items-center justify-center gap-2 text-cyan-200 hover:text-cyan-100 px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-cyan-500/20"
                            title="Ejecuta este prompt múltiples veces con diferentes variables usando un archivo CSV."
                        >
                            <TableCellsIcon className="w-5 h-5" />
                            Batch Test
                        </button>
                    </div>
                    <div className="mt-3">
                        <button 
                            onClick={() => handleOpenQualityAnalysis(generatedPrompt, 'generated')}
                            disabled={anyLoading || isSaving || !generatedPrompt.trim() || !IS_API_KEY_AVAILABLE} 
                            className="glass-button w-full flex items-center justify-center gap-2 text-pink-200 hover:text-pink-100 px-4 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-pink-500/20"
                            title="Obtén un informe detallado de calidad, seguridad y eficiencia de tu prompt optimizado."
                        >
                            <AcademicCapIcon className="w-5 h-5"/>
                            {qualityAnalysisState.isLoading && qualityAnalysisState.source === 'generated' ? 'Evaluando...' : 'Evaluar Calidad del Prompt'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default WorkflowPanel;
