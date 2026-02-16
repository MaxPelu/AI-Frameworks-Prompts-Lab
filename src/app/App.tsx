
import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/app/App.tsx';
import './src/app/styles/index.css';
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
import { Toast, ToastType } from '../components/shared/Toast.tsx';
import { SavedPrompt, PromptVersion, Framework, UploadedFile, GeminiModel, SafetySettings, ModelConfig, ArenaBattleConfig, TokenUsage } from '../types/index.ts';
import { summarizeChanges, generateSessionTitle } from '../lib/geminiService.ts';
import { FRAMEWORKS } from '../config/constants.ts';
import { CATEGORIES, CATEGORIZED_USE_CASES } from '../config/constants.ts';
import { ChevronDownIcon, CodeBracketIcon, BookOpenIcon, WrenchScrewdriverIcon, SaveDiskIcon, CheckIcon, SparklesIcon, DocumentTextIcon, ChartBarIcon, CloudArrowUpIcon, PauseCircleIcon } from '../components/shared/Icons.tsx';

const App: React.FC = () => {
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

    // Arena State
    const [isArenaOpen, setIsArenaOpen] = useState(false);
    const [arenaTestPrompt, setArenaTestPrompt] = useState('');
    const [arenaBattleConfig, setArenaBattleConfig] = useState<ArenaBattleConfig | undefined>(undefined);
    
    // Iteration & Reset State
    const [promptToIterateId, setPromptToIterateId] = useState<string | null>(null);
    const [resetKey, setResetKey] = useState(0);
    
    // Knowledge Panel & History Interaction State
    const [activeTab, setActiveTab] = useState<'promptFrameworks' | 'contextFrameworks' | 'agentFrameworks'>('promptFrameworks');
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
        sessionName?: string
    ) => {
        setIsSaving(true);
        let updatedPrompts = [...savedPrompts];
        let successMessage = "";

        // Determine if it's a draft (no generated prompt yet, but user wants to save idea)
        const isDraft = !promptData.optimizedPrompt && !!promptData.idea;
        const finalOptimizedPrompt = promptData.optimizedPrompt || promptData.idea; // Use idea as prompt if draft
        const finalFramework = promptData.frameworkAcronym || 'BORRADOR';

        if (promptToIterateId) {
            const collectionIndex = savedPrompts.findIndex(p => p.id === promptToIterateId);
            if (collectionIndex > -1) {
                const collection = { ...savedPrompts[collectionIndex] };
                
                // Update Name if provided
                if (sessionName) {
                    collection.name = sessionName;
                }

                if (isAutoSave) {
                    // AUTO-SAVE: Update the LATEST version in place to avoid spamming history
                    collection.versions[0] = {
                        ...collection.versions[0],
                        idea: promptData.idea,
                        useCase: promptData.useCase,
                        frameworkAcronym: finalFramework,
                        optimizedPrompt: finalOptimizedPrompt,
                        model: promptData.model,
                    };
                    // Update base info
                    collection.baseIdea = promptData.idea;
                    updatedPrompts[collectionIndex] = collection;
                } else {
                    // MANUAL SAVE: Create a NEW version (Checkpoint)
                    const previousPrompt = collection.versions[0]?.optimizedPrompt || "";
                    let changeSummary = "Actualización manual.";
                    if (!isDraft && previousPrompt) {
                         changeSummary = await summarizeChanges(previousPrompt, finalOptimizedPrompt, promptData.model);
                    }

                    const newVersion: PromptVersion = { 
                        ...promptData, 
                        optimizedPrompt: finalOptimizedPrompt,
                        frameworkAcronym: finalFramework,
                        versionId: crypto.randomUUID(), 
                        createdAt: new Date().toISOString(), 
                        changeSummary 
                    };
                    collection.versions.unshift(newVersion);
                    updatedPrompts[collectionIndex] = collection;
                    successMessage = "¡Nueva versión guardada!";
                }
            }
        } else {
            // NEW SESSION (First Save)
            const newVersion: PromptVersion = { 
                ...promptData, 
                optimizedPrompt: finalOptimizedPrompt,
                frameworkAcronym: finalFramework,
                versionId: crypto.randomUUID(), 
                createdAt: new Date().toISOString(), 
                changeSummary: isDraft ? "Borrador inicial." : "Versión inicial." 
            };
            const newCollection: SavedPrompt = { 
                id: crypto.randomUUID(), 
                name: sessionName, // Save custom name
                baseIdea: promptData.idea, 
                createdAt: newVersion.createdAt, 
                versions: [newVersion] 
            };
            updatedPrompts.unshift(newCollection);
            
            // Immediately set this as the active iteration ID so subsequent auto-saves update this one
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

    const handleGlobalSave = useCallback(async (isAutoSave: boolean = false, name?: string) => {
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
        
        await handleSavePrompt(promptData, isAutoSave, sessionName);
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
        setIsArenaOpen(true);
    };

    const handleStartModelBattle = (config: ArenaBattleConfig) => {
        setArenaTestPrompt('');
        setFrameworksToCompare([]);
        setArenaBattleConfig(config);
        setIsArenaOpen(true);
    };

    const handleOpenBatchTesting = (prompt: string) => {
        setBatchInitialPrompt(prompt);
        setIsBatchModalOpen(true);
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
            setIsArenaOpen(true);
        }
    };

    const closeArena = () => {
        setIsArenaOpen(false);
        setArenaBattleConfig(undefined);
        if (frameworksToCompare.length > 0) {
            setFrameworksToCompare([]);
        }
    };

    // --- SESSION NAMING LOGIC ---

    const handleCreateSession = async () => {
        // If there is content, trigger the naming flow instead of immediately resetting
        if (ideaText.trim() || generatedPrompt.trim()) {
            setSessionNamingState({
                isOpen: true,
                initialName: '',
                isRenameMode: false
            });
        } else {
            // Nothing to save, just reset
            performReset();
        }
    };

    const performReset = () => {
        setIdeaText('');
        setGeneratedPrompt('');
        setGeneratedSources([]);
        setSelectedFrameworkAcronym(FRAMEWORKS[0].acronym);
        setUseCase(CATEGORIZED_USE_CASES[0].useCases[0]);
        setFiles([]);
        setPromptToIterateId(null);
        setResetKey(k => k + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        setTimeout(() => {
             showNotification("✨ Lienzo limpio. Nueva sesión iniciada.", 'info');
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

    return (
        <div className="aurora-background min-h-screen text-gray-300 p-4 sm:p-6 lg:p-8 font-sans">
            <Toast 
                message={notification.message} 
                type={notification.type} 
                isVisible={notification.isVisible} 
                onClose={hideNotification} 
            />
            
            <div className="max-w-screen-2xl mx-auto">
                
                <div className="mb-8 text-center sm:text-left pl-2">
                    <h1 className="text-5xl font-black title-gradient mb-2 tracking-tight">
                        Laboratorio de Prompts
                    </h1>
                    <p className="text-gray-400 text-sm font-medium tracking-widest uppercase opacity-80 flex items-center gap-2 justify-center sm:justify-start">
                        <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                        Liquid Glass Edition // Gemini 3.0
                    </p>
                </div>

                <header className="glass-panel flex flex-wrap items-center justify-between mb-10 p-4 rounded-3xl z-20 relative gap-4 transition-all duration-500 ease-out">
                    <div className="flex items-center gap-6 text-sm px-4">
                        <div className="flex items-center gap-2" title="Número total de sesiones de prompts guardadas">
                            <ChevronDownIcon className="w-5 h-5 -rotate-90 text-cyan-400" />
                            <span className="font-bold text-white text-lg drop-shadow-lg">{savedPrompts.length}</span>
                            <span className="text-gray-400 font-medium tracking-wide">SESIONES</span>
                        </div>
                        <div className="flex items-center gap-2" title="Número total de versiones de prompts generadas">
                            <CodeBracketIcon className="w-5 h-5 text-pink-400" />
                            <span className="font-bold text-white text-lg drop-shadow-lg">{totalResults}</span>
                            <span className="text-gray-400 font-medium tracking-wide">RESULTADOS</span>
                        </div>
                        <div className="flex items-center gap-2" title="Número total de peticiones a la API">
                            <ChartBarIcon className="w-5 h-5 text-emerald-400" />
                            <span className="font-bold text-white text-lg drop-shadow-lg">{tokenUsageHistory.length}</span>
                            <span className="text-gray-400 font-medium tracking-wide">API REQS</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                        <button
                            onClick={handleCreateSession}
                            className="flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl bg-sky-500/20 border border-sky-400 text-sky-200 hover:bg-sky-500/30 hover:text-white hover:shadow-[0_0_20px_rgba(56,189,248,0.5)] transition-all duration-300 active:scale-95"
                            title="Guarda la sesión actual y abre un lienzo nuevo."
                        >
                            <SparklesIcon className="w-5 h-5" /> Crear Sesión
                        </button>
                        <button
                            onClick={() => handleGlobalSave(false)}
                            disabled={isSaveDisabled}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${saveButtonStyle}`}
                        >
                            {saveButtonIcon}
                            {saveButtonLabel}
                        </button>
                        <button
                            onClick={toggleAutoSave}
                            className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${
                                isAutoSaveEnabled
                                ? 'bg-blue-500/10 border border-blue-500/30 text-blue-300 hover:bg-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                                : 'bg-white/5 border border-white/10 text-gray-500 hover:text-gray-300'
                            }`}
                            title={isAutoSaveEnabled ? "Auto-guardado activo (clic para pausar)" : "Auto-guardado pausado (clic para activar)"}
                        >
                            {isAutoSaveEnabled ? <CloudArrowUpIcon className="w-5 h-5" /> : <PauseCircleIcon className="w-5 h-5" />}
                            {isAutoSaveEnabled ? "Auto-Save ON" : "Auto-Save OFF"}
                        </button>
                        <button
                            onClick={() => setIsMetricsDashboardOpen(true)}
                            className="flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl transition-all duration-300 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                            title="Ver dashboard de métricas de tokens"
                        >
                            <ChartBarIcon className="w-5 h-5" />
                            Métricas
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={handleOpenHistory} className="glass-button flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-2xl" title="Ver tu biblioteca de prompts guardados.">
                            <BookOpenIcon className="w-4 h-4" />
                            Historial
                        </button>
                        <button
                            ref={settingsButtonRef}
                            onClick={() => setIsSettingsOpen(prev => !prev)}
                            className={`glass-button flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-2xl ${isSettingsOpen ? 'border-purple-400/50 text-purple-200 shadow-[0_0_15px_rgba(192,132,252,0.3)]' : ''}`}
                            title="Configura el modelo de IA."
                        >
                            <WrenchScrewdriverIcon className="w-4 h-4" />
                            Ajustes
                        </button>
                    </div>
                </header>

                {isSettingsOpen && (
                    <ModelSettingsPanel
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                        anchorRef={settingsButtonRef}
                        disabled={isSaving}
                        {...allModelSettings}
                    />
                )}

                <main className="flex flex-col gap-10">
                    <div className="w-full">
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

                            onSavePrompt={(data) => handleSavePrompt(data, false)} 
                            onTestInArena={handleTestInArena}
                            onBatchTest={handleOpenBatchTesting}
                            onModelBattle={handleStartModelBattle}
                            isSaving={isSaving}
                            promptToIterateId={promptToIterateId}
                            savedPrompts={savedPrompts}
                            onCancelIteration={handleCancelIteration}
                            // Metrics handler
                            onTokenUsageReceived={handleTokenUsage}
                            {...allModelSettings}
                            onRenameSession={handleRenameSession}
                            onDeleteSession={handleDeletePrompt}
                         />
                    </div>
                    <div className="w-full">
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
                </main>
            </div>
            {frameworksToCompare.length > 0 && (
                <ComparisonTray 
                    frameworks={frameworksToCompare}
                    onCompare={handleOpenArenaForCompare}
                    onRemove={handleToggleFrameworkForCompare}
                    onClear={handleClearCompare}
                />
            )}
            {isArenaOpen && (
                <ArenaModal 
                    onClose={closeArena}
                    testConfig={!arenaBattleConfig && frameworksToCompare.length === 0 ? { prompt: arenaTestPrompt } : undefined}
                    compareConfig={!arenaBattleConfig && frameworksToCompare.length > 0 ? { frameworks: frameworksToCompare, idea: ideaText, useCase: useCase } : undefined}
                    battleConfig={arenaBattleConfig}
                    onTokenUsageReceived={handleTokenUsage}
                    {...allModelSettings}
                />
            )}
             {isBatchModalOpen && (
                <BatchTestingModal
                    isOpen={isBatchModalOpen}
                    onClose={() => setIsBatchModalOpen(false)}
                    initialPrompt={batchInitialPrompt}
                    {...allModelSettings}
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
            <TokenUsageDashboard 
                isOpen={isMetricsDashboardOpen}
                onClose={() => setIsMetricsDashboardOpen(false)}
                history={tokenUsageHistory}
            />
            <SessionNamingModal
                isOpen={sessionNamingState.isOpen}
                onClose={() => setSessionNamingState(prev => ({ ...prev, isOpen: false }))}
                onSave={handleModalSave}
                onDiscard={handleModalDiscard}
                initialName={sessionNamingState.initialName}
                isRenameMode={sessionNamingState.isRenameMode}
            />
            <HistoryDashboard
                isOpen={isHistoryDashboardOpen}
                onClose={() => setIsHistoryDashboardOpen(false)}
                savedPrompts={savedPrompts}
                onDeletePrompt={handleDeletePrompt}
                onDeleteVersion={handleDeleteVersion}
                onIteratePrompt={handleSetPromptToIterate}
                onExportPrompt={handleExportPrompt}
                onRenamePrompt={handleRenameSession}
            />
        </div>
    );
};

export default App;
