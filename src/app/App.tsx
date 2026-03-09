
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
// Extreme Tuning v5.0
import { motion, AnimatePresence } from 'motion/react';
import TopHeader from '../components/shared/TopHeader.tsx';
import WorkflowPanel from '../components/workflow/WorkflowPanel.tsx';
import KnowledgePanel from '../components/knowledge/KnowledgePanel.tsx';
import ArenaModal from '../components/arena/ArenaModal.tsx';
import ComparisonTray from '../components/shared/ComparisonTray.tsx';
import BuilderCanvas from '../components/shared/BuilderCanvas.tsx';
import ExportModal from '../components/shared/ExportModal.tsx';
import SafetySettingsModal from '../components/shared/SafetySettingsModal.tsx';
import ModelSettingsPanel from '../components/shared/ModelSettingsPanel.tsx';
import BatchTestingModal from '../components/batch/BatchTestingModal.tsx';
import TokenUsageDashboard from '../components/metrics/TokenUsageDashboard.tsx';
import SessionNamingModal from '../components/shared/SessionNamingModal.tsx';
import HistoryDashboard from '../components/history/HistoryDashboard.tsx';
import AgentSkillsDashboard from '../components/skills/AgentSkillsDashboard.tsx';
import RedTeamDashboard from '../components/shared/RedTeamDashboard.tsx';
import ForensicDashboard from '../components/shared/ForensicDashboard.tsx';
import GuideDashboard from '../components/shared/GuideDashboard.tsx';
import ActionDashboardModal, { DashboardActionType } from '../components/workflow/ActionDashboardModal.tsx';
import CreateSessionDashboardModal, { SessionTemplate } from '../components/workflow/CreateSessionDashboardModal.tsx';
import { Toast, ToastType } from '../components/shared/Toast.tsx';
import { SavedPrompt, PromptVersion, Framework, UploadedFile, GeminiModel, SafetySettings, ModelConfig, ArenaBattleConfig, TokenUsage, AgentSkill } from '../types/index.ts';
import { summarizeChanges, generateSessionTitle } from '../lib/geminiService.ts';
import { FRAMEWORKS, CATEGORIES, CATEGORIZED_USE_CASES } from '../config/constants.ts';
import { CONTEXT_FRAMEWORKS, CONTEXT_CATEGORIES } from '../config/contextConstants.ts';
import { CODING_FRAMEWORKS, CODING_CATEGORIES } from '../config/codingConstants.ts';
import { CYBERSECURITY_FRAMEWORKS } from '../config/cybersecurityConstants.ts';
import { AI_OPS_FRAMEWORKS } from '../config/aiOpsConstants.ts';
import { CONTEXT_ENGINEERING_FRAMEWORKS } from '../config/contextEngineeringConstants.ts';
import { EDUCATION_FRAMEWORKS } from '../config/educationConstants.ts';
import { BUSINESS_FRAMEWORKS, BUSINESS_CATEGORIES } from '../config/businessConstants.ts';
import { MARKETING_FRAMEWORKS } from '../config/marketingConstants.ts';
import { AGENT_FRAMEWORKS, AGENT_CATEGORIES } from '../config/agentConstants.ts';
import { DATA_FRAMEWORKS, DATA_CATEGORIES } from '../config/dataConstants.ts';

const ALL_FRAMEWORKS = [
    ...FRAMEWORKS,
    ...CONTEXT_FRAMEWORKS,
    ...CODING_FRAMEWORKS,
    ...CYBERSECURITY_FRAMEWORKS,
    ...AI_OPS_FRAMEWORKS,
    ...CONTEXT_ENGINEERING_FRAMEWORKS,
    ...EDUCATION_FRAMEWORKS,
    ...BUSINESS_FRAMEWORKS,
    ...MARKETING_FRAMEWORKS,
    ...AGENT_FRAMEWORKS,
    ...DATA_FRAMEWORKS
];

const ALL_CATEGORIES = Array.from(new Set([
    ...CATEGORIES,
    ...CONTEXT_CATEGORIES,
    ...CODING_CATEGORIES,
    'Ciberseguridad',
    'Operaciones de IA',
    'Ingeniería de Contexto',
    'Educación y Aprendizaje',
    ...BUSINESS_CATEGORIES,
    'Marketing y Growth',
    ...AGENT_CATEGORIES,
    ...DATA_CATEGORIES
]));
import { ChevronDownIcon, CodeBracketIcon, BookOpenIcon, WrenchScrewdriverIcon, SaveDiskIcon, CheckIcon, SparklesIcon, DocumentTextIcon, ChartBarIcon, CloudArrowUpIcon, PauseCircleIcon, TableCellsIcon, BeakerIcon, SearchIcon, PlusIcon, ClockIcon, FingerPrintIcon, XMarkIcon } from '../components/shared/Icons.tsx';

const App: React.FC = () => {
    // Workspace View State
    const [currentView, setCurrentView] = useState<'home' | 'arena' | 'batch' | 'metrics' | 'history' | 'skills' | 'library' | 'guide' | 'redteam' | 'forensic'>('home');
    
    // Global App State
    const [savedPrompts, setSavedPrompts] = useState<SavedPrompt[]>([]);
    const [customFrameworks, setCustomFrameworks] = useState<Framework[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false); // Visual feedback state
    const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(true); // New Auto-save state
    
    // Notification State
    const [notification, setNotification] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false
    });
    
    const showNotification = (message: string, type: ToastType = 'success') => {
        setNotification({ message, type, isVisible: true });
    };
    
    const hideNotification = () => {
        setNotification(prev => ({ ...prev, isVisible: false }));
    };
    
    // Workflow State (Lifted)
    const [ideaText, setIdeaText] = useState('');
    const [useCase, setUseCase] = useState(CATEGORIZED_USE_CASES[0].useCases[0]);
    const [files, setFiles] = useState<UploadedFile[]>([]);
    
    // Generated Output State (Lifted from WorkflowPanel)
    const [generatedPrompt, setGeneratedPrompt] = useState('');
    const [selectedFrameworkAcronym, setSelectedFrameworkAcronym] = useState<string>(FRAMEWORKS[0].acronym);
    const [generatedSources, setGeneratedSources] = useState<any[]>([]);

    const { frameworkCounts, totalFrameworks } = useMemo(() => {
        const counts: Record<string, number> = {};
        ALL_FRAMEWORKS.forEach(f => {
            counts[f.category] = (counts[f.category] || 0) + 1;
        });
        return { frameworkCounts: counts, totalFrameworks: ALL_FRAMEWORKS.length };
    }, []);

    // Arena State
    const [isArenaOpen, setIsArenaOpen] = useState(false);
    const [arenaTestPrompt, setArenaTestPrompt] = useState('');
    const [arenaBattleConfig, setArenaBattleConfig] = useState<ArenaBattleConfig | undefined>(undefined);
    
    // Iteration & Reset State
    const [promptToIterateId, setPromptToIterateId] = useState<string | null>(null);
    const [resetKey, setResetKey] = useState(0);
    
    // Knowledge Panel & History Interaction State
    const [activeTab, setActiveTab] = useState<'promptFrameworks' | 'contextFrameworks' | 'agentFrameworks' | 'codingFrameworks' | 'businessFrameworks' | 'dataFrameworks' | 'cybersecurityFrameworks' | 'contextEngineeringFrameworks' | 'aiOpsFrameworks' | 'marketingFrameworks' | 'educationFrameworks'>('promptFrameworks');
    const [frameworksToCompare, setFrameworksToCompare] = useState<Framework[]>([]);
    const [builderCanvasState, setBuilderCanvasState] = useState<{ isOpen: boolean; framework: Framework | null }>({ isOpen: false, framework: null });
    const [exportModalState, setExportModalState] = useState<{ isOpen: boolean; prompt: SavedPrompt | null }>({ isOpen: false, prompt: null });
    const [isHistoryDashboardOpen, setIsHistoryDashboardOpen] = useState(false);
    
    // Batch Testing State
    const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
    const [batchInitialPrompt, setBatchInitialPrompt] = useState('');

    // Token Metrics State
    const [tokenUsageHistory, setTokenUsageHistory] = useState<TokenUsage[]>([]);
    const [isMetricsDashboardOpen, setIsMetricsDashboardOpen] = useState(false);

    // Session Naming State
    const [sessionNamingState, setSessionNamingState] = useState<{ isOpen: boolean; initialName: string; isRenameMode: boolean; promptId?: string }>({
        isOpen: false,
        initialName: '',
        isRenameMode: false
    });

    // Centralized Model Settings - Updated to Gemini 3 Flash Default for Dec 2025
    const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3-flash-preview');
    const [temperature, setTemperature] = useState(0.8);
    const [topP, setTopP] = useState(0.95);
    const [topK, setTopK] = useState(40);
    const [frequencyPenalty, setFrequencyPenalty] = useState(0);
    const [presencePenalty, setPresencePenalty] = useState(0);
    const [maxOutputTokens, setMaxOutputTokens] = useState(8192);
    const [systemInstruction, setSystemInstruction] = useState('');
    const [systemInstructionFiles, setSystemInstructionFiles] = useState<UploadedFile[]>([]);
    const [stopSequences, setStopSequences] = useState<string[]>([]);
    const [seed, setSeed] = useState<number | null>(null);
    const [thinkingBudget, setThinkingBudget] = useState(0);
    const [isThinkingMode, setIsThinkingMode] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Tools
    const [useGoogleSearch, setUseGoogleSearch] = useState(false);
    const [isStructuredOutputEnabled, setIsStructuredOutputEnabled] = useState(false);
    const [responseSchema, setResponseSchema] = useState<string>(''); // JSON string representation
    const [isCodeExecutionEnabled, setIsCodeExecutionEnabled] = useState(false);
    const [isFunctionCallingEnabled, setIsFunctionCallingEnabled] = useState(false);

    // SOTA v5.0 Features - HOISTED
    const [toneShift, setToneShift] = useState(0);
    const [draftMode, setDraftMode] = useState(false);
    const [promptAutoRefine, setPromptAutoRefine] = useState(false);
    const [verificationLoop, setVerificationLoop] = useState(false);
    const [outputVerbosity, setOutputVerbosity] = useState(0.5);
    const [expertiseLevel, setExpertiseLevel] = useState(3);
    const [forceMarkdown, setForceMarkdown] = useState(true);
    const [citationStyle, setCitationStyle] = useState<'none' | 'apa' | 'inline' | 'url'>('url');
    const [lateralThinking, setLateralThinking] = useState(false);
    const [memoryRecall, setMemoryRecall] = useState(false);
    const [useGoogleMaps, setUseGoogleMaps] = useState(false);
    const [agentMathMode, setAgentMathMode] = useState(false);
    const [agentDebateMode, setAgentDebateMode] = useState(false);
    const [recursiveRefinement, setRecursiveRefinement] = useState(0);
    const [agentReflection, setAgentReflection] = useState(false);
    const [agentPlanningMode, setAgentPlanningMode] = useState(false);
    const [searchRecency, setSearchRecency] = useState<'any'|'day'|'week'|'month'|'year'>('any');
    const [groundingThreshold, setGroundingThreshold] = useState(0.5);
    const [agentSkills, setAgentSkills] = useState<AgentSkill[]>([]);
    const [isSkillsDashboardOpen, setIsSkillsDashboardOpen] = useState(false);

    // Safety Settings
    const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
    const [safetySettings, setSafetySettings] = useState<SafetySettings>({
      HARM_CATEGORY_HARASSMENT: 'BLOCK_MEDIUM_AND_ABOVE',
      HARM_CATEGORY_HATE_SPEECH: 'BLOCK_MEDIUM_AND_ABOVE',
      HARM_CATEGORY_SEXUALLY_EXPLICIT: 'BLOCK_MEDIUM_AND_ABOVE',
      HARM_CATEGORY_DANGEROUS_CONTENT: 'BLOCK_MEDIUM_AND_ABOVE',
    });
    
    // Refs for U interaction
    const settingsButtonRef = useRef<HTMLButtonElement>(null);
    const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Process Dashboard State for Header Actions
    const [processDashboardState, setProcessDashboardState] = useState<{
        isOpen: boolean;
        actionType: DashboardActionType;
    }>({ isOpen: false, actionType: 'save' });

    const [isCreateSessionModalOpen, setIsCreateSessionModalOpen] = useState(false);
    const [pendingSessionTemplate, setPendingSessionTemplate] = useState<SessionTemplate | null>(null);

    // Command Palette State
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [commandSearch, setCommandSearch] = useState('');

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
            }
            if (e.key === 'Escape') {
                setIsCommandPaletteOpen(false);
                if (currentView !== 'home') {
                    setCurrentView('home');
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentView]);

    useEffect(() => {
        try {
            // Load Saved Prompts
            const storedPrompts = localStorage.getItem('savedPrompts');
            if (storedPrompts) {
                const parsedPrompts = JSON.parse(storedPrompts);
                const migratedPrompts = parsedPrompts.map((p: any) => {
                    if (p.versions && Array.isArray(p.versions)) {
                        p.versions = p.versions.map((v: any) => ({ ...v, model: v.model || 'gemini-3-flash-preview' }));
                        return p;
                    }
                    const version: PromptVersion = {
                        versionId: crypto.randomUUID(),
                        idea: p.idea,
                        useCase: p.useCase,
                        frameworkAcronym: p.frameworkAcronym,
                        optimizedPrompt: p.optimizedPrompt,
                        model: 'gemini-3-flash-preview',
                        createdAt: p.createdAt,
                        changeSummary: "Versión importada."
                    };
                    return { id: p.id, name: p.name, baseIdea: p.idea, createdAt: p.createdAt, versions: [version] };
                });
                setSavedPrompts(migratedPrompts);
            }

            // Load Custom Frameworks
            const storedFrameworks = localStorage.getItem('customFrameworks');
            if (storedFrameworks) {
                setCustomFrameworks(JSON.parse(storedFrameworks));
            }

            // Load Auto-Save preference
            const storedAutoSave = localStorage.getItem('isAutoSaveEnabled');
            if (storedAutoSave !== null) {
                setIsAutoSaveEnabled(JSON.parse(storedAutoSave));
            }
        } catch (error) {
            console.error("Could not load data from localStorage", error);
        }
    }, []);

    // --- LOGIC FOR SAVING ---
    const handleSavePrompt = useCallback(async (
        promptData: Omit<PromptVersion, 'versionId' | 'createdAt' | 'changeSummary'>,
        isAutoSave: boolean = false,
        sessionName?: string,
        forceDraft: boolean = false
    ) => {
        setIsSaving(true);
        let updatedPrompts = [...savedPrompts];
        let successMessage = "";

        // Determine if it's a draft
        const isDraft = forceDraft || (!promptData.optimizedPrompt && !!promptData.idea);
        const finalOptimizedPrompt = promptData.optimizedPrompt || promptData.idea; 
        const finalFramework = isDraft ? 'BORRADOR' : (promptData.frameworkAcronym || 'GENERAL');

        if (promptToIterateId) {
            const collectionIndex = savedPrompts.findIndex(p => p.id === promptToIterateId);
            if (collectionIndex > -1) {
                const collection = { ...savedPrompts[collectionIndex] };
                
                if (sessionName) {
                    collection.name = sessionName;
                }

                if (isAutoSave) {
                    collection.versions[0] = {
                        ...collection.versions[0],
                        idea: promptData.idea,
                        useCase: promptData.useCase,
                        frameworkAcronym: finalFramework,
                        optimizedPrompt: finalOptimizedPrompt,
                        model: promptData.model,
                        isDraft: isDraft
                    };
                    collection.baseIdea = promptData.idea;
                    updatedPrompts[collectionIndex] = collection;
                } else {
                    const previousPrompt = collection.versions[0]?.optimizedPrompt || "";
                    let changeSummary = isDraft ? "Borrador actualizado." : "Actualización manual.";
                    if (!isDraft && previousPrompt && previousPrompt !== finalOptimizedPrompt) {
                         changeSummary = await summarizeChanges(previousPrompt, finalOptimizedPrompt, promptData.model);
                    }

                    const newVersion: PromptVersion = { 
                        ...promptData, 
                        optimizedPrompt: finalOptimizedPrompt,
                        frameworkAcronym: finalFramework,
                        versionId: crypto.randomUUID(), 
                        createdAt: new Date().toISOString(), 
                        changeSummary,
                        isDraft: isDraft
                    };
                    collection.versions.unshift(newVersion);
                    updatedPrompts[collectionIndex] = collection;
                    successMessage = isDraft ? "¡Borrador guardado!" : "¡Nueva versión guardada!";
                }
            }
        } else {
            const newVersion: PromptVersion = { 
                ...promptData, 
                optimizedPrompt: finalOptimizedPrompt,
                frameworkAcronym: finalFramework,
                versionId: crypto.randomUUID(), 
                createdAt: new Date().toISOString(), 
                changeSummary: isDraft ? "Borrador inicial." : "Versión inicial.",
                isDraft: isDraft
            };
            const newCollection: SavedPrompt = { 
                id: crypto.randomUUID(), 
                name: sessionName, 
                baseIdea: promptData.idea, 
                createdAt: newVersion.createdAt, 
                versions: [newVersion] 
            };
            updatedPrompts.unshift(newCollection);
            setPromptToIterateId(newCollection.id);
            successMessage = isDraft ? "¡Borrador guardado!" : "¡Nueva sesión guardada!";
        }

        setSavedPrompts(updatedPrompts);
        localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
        
        setIsSaving(false);
        
        if (!isAutoSave) {
            setSaveSuccess(true);
            showNotification(successMessage, 'success');
            setTimeout(() => setSaveSuccess(false), 2500);
        }

    }, [savedPrompts, promptToIterateId]);

    const handleGlobalSave = useCallback(async (isAutoSave: boolean = false, name?: string, forceDraft: boolean = false) => {
        if (!ideaText && !generatedPrompt) return;
        
        let sessionName = name;

        // AUTO-TITLE GENERATION FOR NEW SESSIONS
        // If we are auto-saving a NEW session (no ID yet), no explicit name given, and we have enough text context
        if (!promptToIterateId && !sessionName && ideaText.length > 15 && isAutoSave) {
             try {
                 // Generate a short title in background
                 // We use the prompt generation logic to create a title
                 const titleData = await generateSessionTitle(ideaText, selectedModel);
                 sessionName = titleData.text;
             } catch (e) {
                 // Fallback to truncated text if generation fails or is too slow (though async await handles order)
                 // This ensures we always have *some* name, but ideally the AI name takes precedence.
                 sessionName = ideaText.substring(0, 30) + (ideaText.length > 30 ? '...' : '');
             }
        }

        const promptData = {
            idea: ideaText,
            useCase: useCase,
            frameworkAcronym: selectedFrameworkAcronym,
            optimizedPrompt: generatedPrompt,
            model: selectedModel,
        };
        
        await handleSavePrompt(promptData, isAutoSave, sessionName, forceDraft);
    }, [generatedPrompt, ideaText, useCase, selectedFrameworkAcronym, selectedModel, handleSavePrompt, promptToIterateId]);

    // --- AUTO-SAVE EFFECT ---
    useEffect(() => {
        if (!isAutoSaveEnabled) return;
        // Prevent auto-save if everything is empty
        if (!ideaText.trim() && !generatedPrompt.trim()) return;

        // Clear existing timer
        if (autoSaveTimerRef.current) {
            clearTimeout(autoSaveTimerRef.current);
        }

        // Set new timer (2 seconds debounce)
        autoSaveTimerRef.current = setTimeout(() => {
            handleGlobalSave(true); // True for Auto-save mode
        }, 2000);

        return () => {
            if (autoSaveTimerRef.current) {
                clearTimeout(autoSaveTimerRef.current);
            }
        };
    }, [ideaText, generatedPrompt, handleGlobalSave, isAutoSaveEnabled]);

    const toggleAutoSave = () => {
        setIsAutoSaveEnabled(prev => {
            const newValue = !prev;
            localStorage.setItem('isAutoSaveEnabled', JSON.stringify(newValue));
            showNotification(newValue ? "Auto-guardado activado" : "Auto-guardado pausado", 'info');
            return newValue;
        });
    };


    const handleAddCustomFramework = useCallback((framework: Framework) => {
        setCustomFrameworks(prev => {
            const updated = [...prev, framework];
            localStorage.setItem('customFrameworks', JSON.stringify(updated));
            return updated;
        });
    }, []);
    
    const handleDeletePrompt = useCallback((id: string) => {
        setSavedPrompts(prevPrompts => {
            const updatedPrompts = prevPrompts.filter(p => p.id !== id);
            localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
            return updatedPrompts;
        });
        
        // If we deleted the active prompt, reset iteration state
        if (promptToIterateId === id) {
            setPromptToIterateId(null);
            setIdeaText('');
            setGeneratedPrompt('');
        }
        
        showNotification("Sesión eliminada correctamente.", 'info');
    }, [promptToIterateId]);

    const handleDeleteVersion = useCallback((promptId: string, versionId: string) => {
        setSavedPrompts(prevPrompts => {
            const updatedPrompts = prevPrompts.map(p => {
                if (p.id === promptId) {
                    const newVersions = p.versions.filter(v => v.versionId !== versionId);
                    // If no versions left, the prompt itself will be removed by the parent component or handled here
                    if (newVersions.length === 0) return null; 
                    return { ...p, versions: newVersions };
                }
                return p;
            }).filter((p): p is SavedPrompt => p !== null);
            
            localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
            return updatedPrompts;
        });
        showNotification("Versión eliminada.", 'info');
    }, []);

    const handleTestInArena = (prompt: string) => {
        setArenaBattleConfig(undefined);
        setArenaTestPrompt(prompt);
        setFrameworksToCompare([]);
        setCurrentView('arena');
    };

    const handleStartModelBattle = (config: ArenaBattleConfig) => {
        setArenaTestPrompt('');
        setFrameworksToCompare([]);
        setArenaBattleConfig(config);
        setCurrentView('arena');
    };

    const handleOpenBatchTesting = (prompt: string) => {
        setBatchInitialPrompt(prompt);
        setCurrentView('batch');
    };

    const handleExportPrompt = (prompt: SavedPrompt) => {
        setExportModalState({ isOpen: true, prompt });
    };
    
    const handleSetPromptToIterate = useCallback((promptId: string, versionId?: string) => {
        setPromptToIterateId(promptId);
        const promptToLoad = savedPrompts.find(p => p.id === promptId);
        if (promptToLoad && promptToLoad.versions.length > 0) {
            let versionToLoad = promptToLoad.versions[0];
            let message = "Sesión cargada. Auto-guardado activo.";

            if (versionId) {
                const specificVersion = promptToLoad.versions.find(v => v.versionId === versionId);
                if (specificVersion) {
                    versionToLoad = specificVersion;
                    const versionIndex = promptToLoad.versions.length - promptToLoad.versions.indexOf(specificVersion);
                    message = `Versión ${versionIndex} cargada. Los cambios actualizarán la versión actual.`;
                }
            }

            setIdeaText(versionToLoad.idea);
            setUseCase(versionToLoad.useCase);
            setSelectedFrameworkAcronym(versionToLoad.frameworkAcronym);
            setGeneratedPrompt(versionToLoad.optimizedPrompt);
            setSelectedModel(versionToLoad.model);
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
            showNotification(message, 'info');
        }
    }, [savedPrompts]);

    const handleCancelIteration = useCallback(() => {
        setPromptToIterateId(null);
        showNotification("Edición cancelada. Estás en una nueva sesión.", 'info');
    }, []);

    const handleSelectFrameworkForBuild = useCallback((framework: Framework) => {
        setBuilderCanvasState({ isOpen: true, framework });
    }, []);

    const handleBuildCompleteInCanvas = (builtPrompt: string) => {
        setIdeaText(builtPrompt);
        setBuilderCanvasState({ isOpen: false, framework: null });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleToggleFrameworkForCompare = useCallback((framework: Framework) => {
        setFrameworksToCompare(prev => {
            const isAlreadySelected = prev.some(f => f.id === framework.id);
            if (isAlreadySelected) {
                return prev.filter(f => f.id !== framework.id);
            } else {
                return [...prev, framework];
            }
        });
    }, []);

    const handleClearCompare = useCallback(() => {
        setFrameworksToCompare([]);
    }, []);

    const handleOpenArenaForCompare = () => {
        if (frameworksToCompare.length > 0) {
            setArenaBattleConfig(undefined);
            setCurrentView('arena');
        }
    };

    const closeArena = () => {
        setCurrentView('home');
        setArenaBattleConfig(undefined);
        if (frameworksToCompare.length > 0) {
            setFrameworksToCompare([]);
        }
    };

    // --- SESSION NAMING LOGIC ---

    const handleCreateSession = () => {
        setIsCreateSessionModalOpen(true);
    };

    const confirmCreateSession = async (template: SessionTemplate) => {
        setIsCreateSessionModalOpen(false);
        setPendingSessionTemplate(template);

        // If there is content, trigger the naming flow instead of immediately resetting
        if (ideaText.trim() || generatedPrompt.trim()) {
            setSessionNamingState({
                isOpen: true,
                initialName: '',
                isRenameMode: false
            });
        } else {
            // Nothing to save, just reset
            performReset(template);
        }
    };

    const performReset = (template?: SessionTemplate) => {
        const tpl = template || pendingSessionTemplate;
        
        setIdeaText(tpl?.ideaText || '');
        setSystemInstruction(tpl?.systemInstruction || '');
        setGeneratedPrompt('');
        setGeneratedSources([]);
        setSelectedFrameworkAcronym(FRAMEWORKS[0].acronym);
        setUseCase(CATEGORIZED_USE_CASES[0].useCases[0]);
        setFiles([]);
        setPromptToIterateId(null);
        setResetKey(k => k + 1);
        setPendingSessionTemplate(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
             showNotification(tpl?.id === 'empty' ? "✨ Lienzo limpio. Nueva sesión iniciada." : `✨ Sesión iniciada con plantilla: ${tpl?.title}`, 'info');
        }, 500);
    };

    const handleModalSave = async (name: string) => {
        if (sessionNamingState.isRenameMode && sessionNamingState.promptId) {
            // Renaming Logic
            const updatedPrompts = savedPrompts.map(p => 
                p.id === sessionNamingState.promptId ? { ...p, name: name } : p
            );
            setSavedPrompts(updatedPrompts);
            localStorage.setItem('savedPrompts', JSON.stringify(updatedPrompts));
            showNotification("Sesión renombrada correctamente.", 'success');
        } else {
            // Save & New Logic
            await handleGlobalSave(false, name);
            performReset();
        }
        setSessionNamingState({ isOpen: false, initialName: '', isRenameMode: false });
    };

    const handleModalDiscard = () => {
        setSessionNamingState({ isOpen: false, initialName: '', isRenameMode: false });
        performReset();
    };

    const handleRenameSession = (id: string) => {
        const prompt = savedPrompts.find(p => p.id === id);
        if (prompt) {
            setSessionNamingState({
                isOpen: true,
                initialName: prompt.name || '',
                isRenameMode: true,
                promptId: id
            });
        }
    };

    const handleOpenHistory = () => {
        setIsHistoryDashboardOpen(true);
    };

    const commandActions = useMemo(() => [
        { id: 'new', label: 'Nueva Sesión', description: 'Inicia un lienzo limpio o usa una plantilla', icon: <SparklesIcon className="w-5 h-5" />, color: 'sky', onRun: handleCreateSession },
        { id: 'history', label: 'Historial', description: 'Ver biblioteca de prompts guardados', icon: <BookOpenIcon className="w-5 h-5" />, color: 'purple', onRun: handleOpenHistory },
        { id: 'metrics', label: 'Métricas', description: 'Dashboard de consumo de tokens', icon: <ChartBarIcon className="w-5 h-5" />, color: 'emerald', onRun: () => setIsMetricsDashboardOpen(true) },
        { id: 'skills', label: 'Agent Skills', description: 'Gestionar habilidades del agente', icon: <SparklesIcon className="w-5 h-5" />, color: 'indigo', onRun: () => setIsSkillsDashboardOpen(true) },
        { id: 'batch', label: 'Batch Testing', description: 'Pruebas masivas con CSV', icon: <TableCellsIcon className="w-5 h-5" />, color: 'orange', onRun: () => setIsBatchModalOpen(true) },
        { id: 'arena', label: 'Model Arena', description: 'Comparar modelos en tiempo real', icon: <BeakerIcon className="w-5 h-5" />, color: 'rose', onRun: () => setIsArenaOpen(true) },
        { id: 'settings', label: 'Ajustes de Modelo', description: 'Configurar parámetros de la IA', icon: <WrenchScrewdriverIcon className="w-5 h-5" />, color: 'slate', onRun: () => setIsSettingsOpen(true) },
    ], [handleCreateSession, handleOpenHistory]);

    const filteredCommands = commandActions.filter(a => 
        a.label.toLowerCase().includes(commandSearch.toLowerCase()) || 
        a.description.toLowerCase().includes(commandSearch.toLowerCase())
    );

    // Config Persistence Handlers
    const handleSaveSettings = () => {
        const config: ModelConfig = {
            selectedModel, temperature, topP, topK, 
            frequencyPenalty, presencePenalty,
            maxOutputTokens,
            systemInstruction, stopSequences, seed, thinkingBudget,
            isThinkingMode, useGoogleSearch, isStructuredOutputEnabled, responseSchema,
            isCodeExecutionEnabled, isFunctionCallingEnabled, safetySettings,
            toneShift, draftMode, promptAutoRefine, verificationLoop
        };
        try {
            localStorage.setItem('userModelConfig', JSON.stringify(config));
            showNotification('¡Configuración guardada exitosamente!', 'success');
        } catch (error) {
            console.error("Error saving settings:", error);
            showNotification('Error al guardar la configuración.', 'error');
        }
    };

    const handleLoadSettings = () => {
        try {
            const saved = localStorage.getItem('userModelConfig');
            if (saved) {
                const config = JSON.parse(saved) as ModelConfig;
                setSelectedModel(config.selectedModel);
                setTemperature(config.temperature);
                setTopP(config.topP);
                setTopK(config.topK);
                setFrequencyPenalty(config.frequencyPenalty || 0);
                setPresencePenalty(config.presencePenalty || 0);
                setMaxOutputTokens(config.maxOutputTokens);
                setSystemInstruction(config.systemInstruction);
                setStopSequences(config.stopSequences || []);
                setSeed(config.seed);
                setThinkingBudget(config.thinkingBudget || 0);
                setIsThinkingMode(config.isThinkingMode || false);
                setUseGoogleSearch(config.useGoogleSearch);
                setIsStructuredOutputEnabled(config.isStructuredOutputEnabled);
                setResponseSchema(config.responseSchema || '');
                setIsCodeExecutionEnabled(config.isCodeExecutionEnabled);
                setIsFunctionCallingEnabled(config.isFunctionCallingEnabled);
                setSafetySettings(config.safetySettings);
                
                // New Features
                if (config.toneShift !== undefined) setToneShift(config.toneShift);
                if (config.draftMode !== undefined) setDraftMode(config.draftMode);
                if (config.promptAutoRefine !== undefined) setPromptAutoRefine(config.promptAutoRefine);
                if (config.verificationLoop !== undefined) setVerificationLoop(config.verificationLoop);

                showNotification('¡Configuración cargada correctamente!', 'success');
            } else {
                showNotification('No se encontró ninguna configuración guardada.', 'info');
            }
        } catch (error) {
            console.error("Error loading settings:", error);
            showNotification('Error al cargar la configuración.', 'error');
        }
    };

    // Token Metrics Handler
    const handleTokenUsage = useCallback((usage: TokenUsage) => {
        setTokenUsageHistory(prev => [usage, ...prev]);
        showNotification(`Métricas actualizadas: ${usage.totalTokens} tokens`, 'info');
    }, []);

    // State updaters for Settings Panel
    const stateSetters = {
        setToneShift, setDraftMode, setPromptAutoRefine, setVerificationLoop,
        setOutputVerbosity, setExpertiseLevel, setForceMarkdown, setCitationStyle,
        setLateralThinking, setMemoryRecall, setUseGoogleMaps, setAgentMathMode,
        setAgentDebateMode, setRecursiveRefinement, setAgentReflection,
        setAgentPlanningMode, setSearchRecency, setGroundingThreshold
    };

    // Combine all settings to pass down
    const allModelSettings = {
        selectedModel, onModelChange: setSelectedModel,
        temperature, onTemperatureChange: setTemperature,
        topP, onTopPChange: setTopP,
        topK, onTopKChange: setTopK,
        frequencyPenalty, onFrequencyPenaltyChange: setFrequencyPenalty,
        presencePenalty, onPresencePenaltyChange: setPresencePenalty,
        maxOutputTokens, onMaxOutputTokensChange: setMaxOutputTokens,
        systemInstruction, onSystemInstructionChange: setSystemInstruction,
        systemInstructionFiles, onSystemInstructionFilesChange: setSystemInstructionFiles,
        stopSequences, onStopSequencesChange: setStopSequences,
        seed, onSeedChange: setSeed,
        thinkingBudget, onThinkingBudgetChange: setThinkingBudget,
        isThinkingMode, onIsThinkingModeChange: setIsThinkingMode,
        useGoogleSearch, onUseGoogleSearchChange: setUseGoogleSearch,
        isStructuredOutputEnabled, onIsStructuredOutputEnabledChange: setIsStructuredOutputEnabled,
        responseSchema, onResponseSchemaChange: setResponseSchema,
        isCodeExecutionEnabled, onIsCodeExecutionEnabledChange: setIsCodeExecutionEnabled,
        isFunctionCallingEnabled, onIsFunctionCallingEnabledChange: setIsFunctionCallingEnabled,
        safetySettings, onSafetySettingsChange: setSafetySettings,
        
        // SOTA v5.0 Props
        toneShift, setToneShift,
        draftMode, setDraftMode,
        promptAutoRefine, setPromptAutoRefine,
        verificationLoop, setVerificationLoop,
        outputVerbosity, setOutputVerbosity,
        expertiseLevel, setExpertiseLevel,
        forceMarkdown, setForceMarkdown,
        citationStyle, setCitationStyle,
        lateralThinking, setLateralThinking,
        memoryRecall, setMemoryRecall,
        useGoogleMaps, setUseGoogleMaps,
        agentMathMode, setAgentMathMode,
        agentDebateMode, setAgentDebateMode,
        recursiveRefinement, setRecursiveRefinement,
        agentReflection, setAgentReflection,
        agentPlanningMode, setAgentPlanningMode,
        searchRecency, setSearchRecency,
        groundingThreshold, setGroundingThreshold,
        agentSkills, setAgentSkills,

        onOpenSafetySettings: () => setIsSafetyModalOpen(true),
        onSaveSettings: handleSaveSettings,
        onLoadSettings: handleLoadSettings,
    };

    const totalResults = savedPrompts.reduce((acc, p) => acc + p.versions.length, 0);
    
    // Determine Save Button State
    let saveButtonLabel = "Guardar";
    let saveButtonIcon = <SaveDiskIcon className="w-5 h-5" />;
    let saveButtonStyle = "bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed";
    let isSaveDisabled = true;

    if (saveSuccess) {
        saveButtonLabel = "¡Guardado!";
        saveButtonIcon = <CheckIcon className="w-5 h-5" />;
        saveButtonStyle = "bg-green-500/20 border-green-500 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.4)]";
        isSaveDisabled = true;
    } else if (isSaving) {
        saveButtonLabel = "Guardando...";
        saveButtonStyle = "glass-btn-orange opacity-80 cursor-wait";
        isSaveDisabled = true;
    } else if (promptToIterateId) {
        saveButtonLabel = "Guardar Versión";
        saveButtonStyle = "bg-indigo-500/20 border-indigo-500 text-indigo-300 hover:bg-indigo-500/30 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all";
        isSaveDisabled = false;
    } else if (generatedPrompt) {
        saveButtonLabel = "Guardar Resultado";
        saveButtonStyle = "glass-btn-orange";
        isSaveDisabled = false;
    } else if (ideaText) {
        saveButtonLabel = "Guardar Borrador";
        saveButtonStyle = "bg-yellow-500/10 border-yellow-500/50 text-yellow-200 hover:bg-yellow-500/20 hover:shadow-[0_0_15px_rgba(234,179,8,0.3)] transition-all";
        saveButtonIcon = <DocumentTextIcon className="w-5 h-5" />;
        isSaveDisabled = false;
    }

    const totalTokens = tokenUsageHistory.reduce((acc, curr) => acc + curr.totalTokens, 0);

    return (
        <div className="min-h-screen text-gray-100 font-sans selection:bg-teal-500/30 selection:text-teal-200 aurora-background overflow-x-hidden flex flex-col">
            <TopHeader 
                sessionCount={savedPrompts.length}
                promptCount={totalResults}
                tokenCount={totalTokens}
                onToggleAutoSave={toggleAutoSave}
                isAutoSaveEnabled={isAutoSaveEnabled}
                onOpenHistory={() => setCurrentView('history')}
                onOpenMetrics={() => setCurrentView('metrics')}
                onSave={() => handleGlobalSave(false)}
                onOpenArena={() => setCurrentView('arena')}
                onOpenSkills={() => setCurrentView('skills')}
                onOpenBatch={() => setCurrentView('batch')}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onNewSession={handleCreateSession}
                onOpenCommands={() => setIsCommandPaletteOpen(true)}
                onOpenLibrary={() => setCurrentView('library')}
                onOpenGuide={() => setCurrentView('guide')}
                onOpenRedTeam={() => setCurrentView('redteam')}
                onOpenForensic={() => setCurrentView('forensic')}
                onOpenExport={() => {
                    if (promptToIterateId) {
                        const prompt = savedPrompts.find(p => p.id === promptToIterateId);
                        if (prompt) handleExportPrompt(prompt);
                    } else {
                        showNotification('Selecciona un prompt del historial para exportar', 'info');
                    }
                }}
            />

            {/* Main Content Area */}
            <div className="flex-1 w-full transition-all duration-300 pt-[76px]">
                <AnimatePresence>
                {isCommandPaletteOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="command-palette-overlay" 
                        onClick={() => setIsCommandPaletteOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.95, opacity: 0, y: -20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: -20 }}
                            className="command-palette-content" 
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-5 border-b border-white/10 flex items-center gap-4">
                                <SearchIcon className="w-6 h-6 text-teal-400" />
                                <input 
                                    autoFocus
                                    placeholder="¿Qué quieres hacer hoy? Busca comandos..."
                                    className="bg-transparent border-none outline-none text-white w-full text-xl placeholder:text-gray-600"
                                    value={commandSearch}
                                    onChange={e => setCommandSearch(e.target.value)}
                                />
                                <div className="flex items-center gap-1 px-2 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-500 font-mono">
                                    <span className="text-xs">⌘</span>K
                                </div>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto p-3 space-y-1">
                                {filteredCommands.map((action) => (
                                    <button 
                                        key={action.id}
                                        onClick={() => { action.onRun(); setIsCommandPaletteOpen(false); }}
                                        className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all group text-left border border-transparent hover:border-white/5"
                                    >
                                        <div className={`p-3 rounded-xl bg-${action.color}-500/10 text-${action.color}-400 border border-${action.color}-500/20 group-hover:scale-110 transition-transform shadow-lg`}>
                                            {action.icon}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-base font-bold text-gray-200">{action.label}</div>
                                            <div className="text-xs text-gray-500">{action.description}</div>
                                        </div>
                                        <div className="text-[10px] text-gray-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                            <span className="text-xs">↵</span> ENTER
                                        </div>
                                    </button>
                                ))}
                                {filteredCommands.length === 0 && (
                                    <div className="p-12 text-center">
                                        <SparklesIcon className="w-12 h-12 text-gray-700 mx-auto mb-4 animate-pulse" />
                                        <div className="text-gray-500 text-sm">No se encontraron comandos para "{commandSearch}"</div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 bg-black/20 border-t border-white/5 flex justify-between items-center text-[10px] text-gray-500 uppercase tracking-widest font-bold">
                                <span>Laboratorio de Prompts v5.0</span>
                                <div className="flex gap-4">
                                    <span>↑↓ Navegar</span>
                                    <span>↵ Ejecutar</span>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                </AnimatePresence>

                <div className="max-w-[1920px] mx-auto px-4 py-4 md:px-8 md:py-6">
                    <main className="animate-fade-in min-h-[90vh]">
                        <AnimatePresence mode="wait">
                            {currentView === 'home' && (
                                <motion.div 
                                    key="home"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="flex flex-col gap-6"
                                >
                                    {/* Frameworks Count Marquee */}
                                    <div className="w-full overflow-hidden bg-black/20 border border-white/5 rounded-xl py-2 px-4 flex items-center gap-4">
                                        <div className="text-teal-400 font-bold text-sm whitespace-nowrap flex items-center gap-2">
                                            <SparklesIcon className="w-4 h-4" />
                                            {totalFrameworks} Frameworks:
                                        </div>
                                        <div className="flex-1 overflow-hidden relative">
                                            <div className="flex animate-marquee whitespace-nowrap w-max hover:[animation-play-state:paused]">
                                                <div className="flex gap-6 pr-6">
                                                    {ALL_CATEGORIES.map(category => {
                                                        const count = frameworkCounts[category] || 0;
                                                        if (count === 0) return null;
                                                        return (
                                                            <span key={category} className="text-xs text-gray-400 flex items-center gap-1.5">
                                                                <span className="text-gray-300">{category}</span>
                                                                <span className="text-teal-500 font-mono bg-teal-500/10 px-1.5 py-0.5 rounded-md">{count}</span>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                                <div className="flex gap-6 pr-6">
                                                    {ALL_CATEGORIES.map(category => {
                                                        const count = frameworkCounts[category] || 0;
                                                        if (count === 0) return null;
                                                        return (
                                                            <span key={`${category}-dup`} className="text-xs text-gray-400 flex items-center gap-1.5">
                                                                <span className="text-gray-300">{category}</span>
                                                                <span className="text-teal-500 font-mono bg-teal-500/10 px-1.5 py-0.5 rounded-md">{count}</span>
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setCurrentView('library')}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg transition-all text-xs font-bold uppercase tracking-wider shrink-0"
                                        >
                                            <BookOpenIcon className="w-4 h-4" />
                                            Explorar
                                        </button>
                                    </div>

                                    <div className="w-full bg-gradient-to-r from-teal-900/20 via-purple-900/20 to-orange-900/20 border border-white/10 rounded-2xl p-4 flex items-center justify-between backdrop-blur-sm shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                                            <span className="text-teal-300 font-mono text-xs uppercase tracking-widest">Sistema Operativo: SOTA Ready</span>
                                        </div>
                                        <div className="flex gap-4 text-gray-400 font-mono text-xs">
                                            <span>LATENCIA: 42ms</span>
                                            <span>MODELO: GEMINI 3.1 FLASH</span>
                                            <span>TOKENS: ACTIVO</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
                                    {/* Left Column: Workflow (Idea, Use Case, Files) */}
                                    <div className="xl:col-span-7 space-y-6 md:space-y-8">
                                        <WorkflowPanel
                                            key={resetKey}
                                            ideaText={ideaText}
                                            onIdeaChange={setIdeaText}
                                            useCase={useCase}
                                            onUseCaseChange={setUseCase}
                                            files={files}
                                            onFilesChange={setFiles}
                                            
                                            generatedPrompt={generatedPrompt}
                                            setGeneratedPrompt={setGeneratedPrompt}
                                            selectedFrameworkAcronym={selectedFrameworkAcronym}
                                            setSelectedFrameworkAcronym={setSelectedFrameworkAcronym}
                                            generatedSources={generatedSources}
                                            setGeneratedSources={setGeneratedSources}

                                            onSavePrompt={(data, forceDraft) => handleSavePrompt(data, false, undefined, forceDraft)} 
                                            onTestInArena={handleTestInArena}
                                            onBatchTest={handleOpenBatchTesting}
                                            onModelBattle={handleStartModelBattle}
                                            isSaving={isSaving}
                                            promptToIterateId={promptToIterateId}
                                            savedPrompts={savedPrompts}
                                            onCancelIteration={handleCancelIteration}
                                            onRenameSession={handleRenameSession}
                                            onDeleteSession={handleDeletePrompt}
                                            onTokenUsageReceived={handleTokenUsage}
                                            
                                            // New Header Actions
                                            onOpenHistory={() => setCurrentView('history')}
                                            onOpenMetrics={() => setCurrentView('metrics')}
                                            onOpenSkills={() => setCurrentView('skills')}
                                            onOpenArena={() => setCurrentView('arena')}
                                            onOpenBatch={() => setCurrentView('batch')}
                                            isAutoSaveEnabled={isAutoSaveEnabled}
                                            onToggleAutoSave={toggleAutoSave}

                                            {...allModelSettings}
                                        />
                                    </div>

                                    {/* Right Column: Knowledge & History */}
                                    <div className="xl:col-span-5 space-y-6 md:space-y-8">
                                        <KnowledgePanel 
                                            activeTab={activeTab} 
                                            onTabChange={setActiveTab} 
                                            savedPrompts={savedPrompts}
                                            customFrameworks={customFrameworks}
                                            onAddCustomFramework={handleAddCustomFramework}
                                            onDeletePrompt={handleDeletePrompt}
                                            onDeleteVersion={handleDeleteVersion}
                                            onIteratePrompt={handleSetPromptToIterate}
                                            onSelectFrameworkForBuild={handleSelectFrameworkForBuild}
                                            onToggleFrameworkForCompare={handleToggleFrameworkForCompare}
                                            frameworksInCompareList={frameworksToCompare.map(f => f.id)}
                                            onExportPrompt={handleExportPrompt}
                                            currentModel={selectedModel}
                                            onTokenUsageReceived={handleTokenUsage}
                                            onRenamePrompt={handleRenameSession}
                                        />
                                    </div>
                                    </div>
                                </motion.div>
                            )}

                        {currentView === 'arena' && (
                            <motion.div 
                                key="arena"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="glass-panel rounded-[3rem] p-8 min-h-[80vh]"
                            >
                                <ArenaModal 
                                    onClose={() => setCurrentView('home')}
                                    testConfig={!arenaBattleConfig && frameworksToCompare.length === 0 ? { prompt: arenaTestPrompt } : undefined}
                                    compareConfig={!arenaBattleConfig && frameworksToCompare.length > 0 ? { frameworks: frameworksToCompare, idea: ideaText, useCase: useCase } : undefined}
                                    battleConfig={arenaBattleConfig}
                                    onTokenUsageReceived={handleTokenUsage}
                                    inlineMode={true}
                                    {...allModelSettings}
                                />
                            </motion.div>
                        )}

                        {currentView === 'batch' && (
                            <motion.div 
                                key="batch"
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -50 }}
                                className="glass-panel rounded-[3rem] p-8 min-h-[80vh]"
                            >
                                <BatchTestingModal
                                    isOpen={true}
                                    onClose={() => setCurrentView('home')}
                                    initialPrompt={batchInitialPrompt}
                                    inlineMode={true}
                                    {...allModelSettings}
                                />
                            </motion.div>
                        )}

                        {currentView === 'metrics' && (
                            <motion.div 
                                key="metrics"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                className="glass-panel rounded-[3rem] p-8 min-h-[80vh]"
                            >
                                <TokenUsageDashboard 
                                    isOpen={true}
                                    onClose={() => setCurrentView('home')}
                                    history={tokenUsageHistory}
                                    inlineMode={true}
                                />
                            </motion.div>
                        )}

                        {currentView === 'history' && (
                            <motion.div 
                                key="history"
                                initial={{ opacity: 0, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, filter: 'blur(10px)' }}
                                className="glass-panel rounded-[3rem] p-8 min-h-[80vh]"
                            >
                                <HistoryDashboard
                                    isOpen={true}
                                    onClose={() => setCurrentView('home')}
                                    savedPrompts={savedPrompts}
                                    onDeletePrompt={handleDeletePrompt}
                                    onDeleteVersion={handleDeleteVersion}
                                    onIteratePrompt={(p) => { handleSetPromptToIterate(p); setCurrentView('home'); }}
                                    onExportPrompt={handleExportPrompt}
                                    onRenamePrompt={handleRenameSession}
                                    inlineMode={true}
                                />
                            </motion.div>
                        )}

                        {currentView === 'skills' && (
                            <motion.div 
                                key="skills"
                                initial={{ opacity: 0, rotateX: 45 }}
                                animate={{ opacity: 1, rotateX: 0 }}
                                exit={{ opacity: 0, rotateX: -45 }}
                                className="glass-panel rounded-[3rem] p-8 min-h-[80vh]"
                            >
                                <AgentSkillsDashboard
                                    isOpen={true}
                                    onClose={() => setCurrentView('home')}
                                    agentSkills={agentSkills}
                                    setAgentSkills={setAgentSkills}
                                    apiKey={process.env.GEMINI_API_KEY || null}
                                    inlineMode={true}
                                />
                            </motion.div>
                        )}

                        {currentView === 'library' && (
                            <motion.div 
                                key="library"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="glass-panel rounded-[3rem] p-8 min-h-[80vh]"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                                            <BookOpenIcon className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-white tracking-tight uppercase">BIBLIOTECA DE CONOCIMIENTO</h2>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest">Explora Frameworks de Ingeniería de Prompts</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setCurrentView('home')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <XMarkIcon className="w-6 h-6 text-gray-400" />
                                    </button>
                                </div>
                                <KnowledgePanel 
                                    activeTab={activeTab} 
                                    onTabChange={setActiveTab} 
                                    savedPrompts={savedPrompts}
                                    customFrameworks={customFrameworks}
                                    onAddCustomFramework={handleAddCustomFramework}
                                    onDeletePrompt={handleDeletePrompt}
                                    onDeleteVersion={handleDeleteVersion}
                                    onIteratePrompt={handleSetPromptToIterate}
                                    onSelectFrameworkForBuild={handleSelectFrameworkForBuild}
                                    onToggleFrameworkForCompare={handleToggleFrameworkForCompare}
                                    frameworksInCompareList={frameworksToCompare.map(f => f.id)}
                                    onExportPrompt={handleExportPrompt}
                                    currentModel={selectedModel}
                                    onTokenUsageReceived={handleTokenUsage}
                                    onRenamePrompt={handleRenameSession}
                                />
                            </motion.div>
                        )}

                        {currentView === 'guide' && (
                            <motion.div 
                                key="guide"
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 50 }}
                                className="glass-panel rounded-[3rem] p-8 min-h-[80vh]"
                            >
                                <GuideDashboard 
                                    isOpen={true}
                                    onClose={() => setCurrentView('home')}
                                    inlineMode={true}
                                />
                            </motion.div>
                        )}

                        {currentView === 'redteam' && (
                            <motion.div 
                                key="redteam"
                                initial={{ opacity: 0, scale: 1.1 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.1 }}
                                className="glass-panel rounded-[3rem] p-8 min-h-[80vh]"
                            >
                                <RedTeamDashboard 
                                    isOpen={true}
                                    onClose={() => setCurrentView('home')}
                                    inlineMode={true}
                                />
                            </motion.div>
                        )}

                        {currentView === 'forensic' && (
                            <motion.div 
                                key="forensic"
                                initial={{ opacity: 0, filter: 'blur(20px)' }}
                                animate={{ opacity: 1, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, filter: 'blur(20px)' }}
                                className="glass-panel rounded-[3rem] p-8 min-h-[80vh]"
                            >
                                <ForensicDashboard 
                                    isOpen={true}
                                    onClose={() => setCurrentView('home')}
                                    inlineMode={true}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </div>

            {/* Modals & Overlays */}
            {isSettingsOpen && (
                <ModelSettingsPanel
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    anchorRef={settingsButtonRef}
                    disabled={isSaving}
                    {...allModelSettings}
                />
            )}

            {frameworksToCompare.length > 0 && (
                <ComparisonTray 
                    frameworks={frameworksToCompare}
                    onCompare={handleOpenArenaForCompare}
                    onRemove={handleToggleFrameworkForCompare}
                    onClear={handleClearCompare}
                />
            )}

            {builderCanvasState.isOpen && builderCanvasState.framework && (
                <BuilderCanvas
                    framework={builderCanvasState.framework}
                    onClose={() => setBuilderCanvasState({ isOpen: false, framework: null })}
                    onSendToWorkflow={handleBuildCompleteInCanvas}
                />
            )}

            {exportModalState.isOpen && exportModalState.prompt && (
                <ExportModal
                    prompt={exportModalState.prompt}
                    onClose={() => setExportModalState({ isOpen: false, prompt: null })}
                />
            )}

            {isSafetyModalOpen && (
                <SafetySettingsModal
                    isOpen={isSafetyModalOpen}
                    onClose={() => setIsSafetyModalOpen(false)}
                    settings={safetySettings}
                    onSettingsChange={setSafetySettings}
                />
            )}

            <SessionNamingModal
                isOpen={sessionNamingState.isOpen}
                onClose={() => setSessionNamingState(prev => ({ ...prev, isOpen: false }))}
                onSave={handleModalSave}
                onDiscard={handleModalDiscard}
                initialName={sessionNamingState.initialName}
                isRenameMode={sessionNamingState.isRenameMode}
            />

            <CreateSessionDashboardModal
                isOpen={isCreateSessionModalOpen}
                onClose={() => setIsCreateSessionModalOpen(false)}
                onCreateSession={confirmCreateSession}
            />

            <ActionDashboardModal
                isOpen={processDashboardState.isOpen}
                onClose={() => setProcessDashboardState({ ...processDashboardState, isOpen: false })}
                actionType={processDashboardState.actionType}
                ideaText={ideaText}
                modelSettings={allModelSettings}
                onComplete={() => {}}
                localAction={() => {
                    if (processDashboardState.actionType === 'create_session') {
                        handleCreateSession();
                    } else if (processDashboardState.actionType === 'save') {
                        const isDraft = !generatedPrompt;
                        handleGlobalSave(false, undefined, isDraft);
                    }
                }}
            />

            <AnimatePresence>
                {notification.isVisible && (
                    <Toast
                        message={notification.message}
                        type={notification.type}
                        onClose={hideNotification}
                    />
                )}
            </AnimatePresence>
        </div>
    </div>
    );
};

export default App;
