
import React, { useRef, useState, useEffect } from 'react';
import { GeminiModel, UploadedFile, PresetConfig, ModelConfig } from '../../types/index.ts';
import { XCircleIcon, QuestionMarkCircleIcon, ChevronDownIcon, SparklesIcon, BeakerIcon, ShieldCheckIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, ArrowPathIcon, Bars3BottomLeftIcon, TrashIcon, CheckIcon, KeyIcon, ScaleIcon, UsersIcon, GlobeAltIcon, PauseCircleIcon } from './Icons.tsx';
import FileUploader from '../workflow/FileUploader.tsx';

interface ModelSettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    anchorRef: React.RefObject<HTMLElement>;
    
    selectedModel: GeminiModel;
    onModelChange: (model: GeminiModel) => void;
    temperature: number;
    onTemperatureChange: (temp: number) => void;
    topP: number;
    onTopPChange: (topP: number) => void;
    topK: number;
    onTopKChange: (k: number) => void;
    frequencyPenalty: number;
    onFrequencyPenaltyChange: (val: number) => void;
    presencePenalty: number;
    onPresencePenaltyChange: (val: number) => void;
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
    responseSchema: string;
    onResponseSchemaChange: (schema: string) => void;
    isCodeExecutionEnabled: boolean;
    onIsCodeExecutionEnabledChange: (enabled: boolean) => void;
    isFunctionCallingEnabled: boolean;
    onIsFunctionCallingEnabledChange: (enabled: boolean) => void;
    onOpenSafetySettings: () => void;
    onSaveSettings: () => void; 
    onLoadSettings: () => void; 
    disabled: boolean;

    // SOTA v5.0 Props (Passed from App)
    toneShift: number; setToneShift: (v: number) => void;
    draftMode: boolean; setDraftMode: (v: boolean) => void;
    promptAutoRefine: boolean; setPromptAutoRefine: (v: boolean) => void;
    verificationLoop: boolean; setVerificationLoop: (v: boolean) => void;
    outputVerbosity: number; setOutputVerbosity: (v: number) => void;
    expertiseLevel: number; setExpertiseLevel: (v: number) => void;
    forceMarkdown: boolean; setForceMarkdown: (v: boolean) => void;
    citationStyle: 'none' | 'apa' | 'inline' | 'url'; setCitationStyle: (v: any) => void;
    lateralThinking: boolean; setLateralThinking: (v: boolean) => void;
    memoryRecall: boolean; setMemoryRecall: (v: boolean) => void;
    useGoogleMaps: boolean; setUseGoogleMaps: (v: boolean) => void;
    agentMathMode: boolean; setAgentMathMode: (v: boolean) => void;
    agentDebateMode: boolean; setAgentDebateMode: (v: boolean) => void;
    recursiveRefinement: number; setRecursiveRefinement: (v: number) => void;
    agentReflection: boolean; setAgentReflection: (v: boolean) => void;
    agentPlanningMode: boolean; setAgentPlanningMode: (v: boolean) => void;
    searchRecency: 'any'|'day'|'week'|'month'|'year'; setSearchRecency: (v: any) => void;
    groundingThreshold: number; setGroundingThreshold: (v: number) => void;
}

const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 glass-panel text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-50 shadow-xl border border-white/10 text-center">
        {text}
        <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-800 rotate-45 border-r border-b border-white/10"></div>
    </div>
);

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-4 pt-2">
        <div className="p-1.5 bg-white/5 rounded-lg text-teal-400 border border-teal-500/20">
            {icon}
        </div>
        <h4 className="font-bold text-gray-200 text-sm uppercase tracking-widest">{title}</h4>
        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent ml-2"></div>
    </div>
);

const SliderControl: React.FC<{
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (val: number) => void;
    tooltip: string;
    disabled: boolean;
    highlight?: boolean;
}> = ({ label, value, min, max, step, onChange, tooltip, disabled, highlight }) => (
    <div className={`space-y-2 group ${highlight ? 'bg-teal-500/5 p-2 rounded-lg border border-teal-500/10' : ''}`}>
        <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-gray-400 flex items-center gap-1.5 cursor-help relative group/tooltip">
                {label}
                <QuestionMarkCircleIcon className="w-3.5 h-3.5 text-gray-600 group-hover/tooltip:text-teal-400 transition-colors" />
                <Tooltip text={tooltip} />
            </label>
            <input
                type="number"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                        onChange(val);
                    } else if (e.target.value === '') {
                        // Allow temporary empty string
                    }
                }}
                className="w-20 bg-black/30 border border-white/10 rounded-md px-2 py-1 text-right text-xs font-mono text-teal-400 focus:outline-none focus:border-teal-500/50 transition-all hover:bg-black/40 hover:border-white/20"
                disabled={disabled}
            />
        </div>
        <div className="flex items-center gap-3">
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value || 0}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="flex-1 accent-teal-500 bg-white/5 h-1.5 rounded-lg cursor-pointer hover:accent-teal-400 transition-all"
                disabled={disabled}
            />
        </div>
    </div>
);

const Toggle: React.FC<{ label: string, enabled: boolean, onToggle: (enabled: boolean) => void, disabled: boolean, tooltip: string, warning?: string }> = ({ label, enabled, onToggle, disabled, tooltip, warning }) => (
    <div className="flex items-center justify-between group py-1">
        <div className="flex flex-col">
            <label className={`text-sm font-medium flex items-center gap-1.5 relative cursor-help ${disabled ? 'text-gray-500' : 'text-gray-300 hover:text-teal-300 transition-colors'}`}>
                {label}
                <QuestionMarkCircleIcon className="w-4 h-4 text-gray-600 group-hover:text-teal-400 transition-colors" />
                <Tooltip text={tooltip} />
            </label>
            {warning && <span className="text-orange-400 text-[9px] mt-0.5">{warning}</span>}
        </div>
        <button
            type="button"
            onClick={() => !disabled && onToggle(!enabled)}
            disabled={disabled}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none ${enabled ? 'bg-teal-500' : 'bg-white/10'} disabled:opacity-30`}
        >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${enabled ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
    </div>
);

const ModelButton: React.FC<{ 
    id: GeminiModel; 
    label: string; 
    sub: string; 
    current: GeminiModel; 
    onClick: (m: GeminiModel) => void; 
    disabled?: boolean; 
    highlight?: boolean;
    colorClass?: string;
}> = ({ id, label, sub, current, onClick, disabled, highlight, colorClass }) => (
    <button
        onClick={() => onClick(id)}
        disabled={disabled}
        className={`px-3 py-2.5 rounded-xl transition-all duration-300 font-bold flex items-center justify-center relative overflow-hidden group border
            ${current === id 
                ? (highlight 
                    ? 'bg-gradient-to-br from-teal-500/90 to-blue-600/90 border-teal-400 text-white shadow-[0_0_20px_rgba(45,212,191,0.4)] scale-[1.02]' 
                    : `${colorClass || 'bg-indigo-600/80 border-indigo-400'} text-white shadow-lg scale-[1.02]`) 
                : 'hover:bg-white/10 text-gray-400 bg-white/5 border-white/5 hover:border-white/20 active:scale-95'}`}
    >
        <div className="flex flex-col leading-tight text-center relative z-10">
            <span className="text-[11px] sm:text-xs">{label}</span>
            <span className={`text-[8px] sm:text-[9px] font-medium mt-0.5 ${current === id ? 'text-white/90' : 'text-gray-500 group-hover:text-gray-300'}`}>{sub}</span>
        </div>
        {current === id && <div className="absolute top-0 right-0 p-1"><SparklesIcon className="w-2.5 h-2.5 text-white/50" /></div>}
    </button>
);

const ModelSettingsPanel: React.FC<ModelSettingsPanelProps> = (props) => {
    const {
        isOpen, onClose, anchorRef, disabled,
        onOpenSafetySettings,
        // SOTA v5.0 Props from Parent
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
        
        ...settings
    } = props;
    
    const panelRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState<'params' | 'system' | 'tools' | 'audio' | 'advanced'>('params');
    const [currentStopSequence, setCurrentStopSequence] = useState('');
    const [presets, setPresets] = useState<PresetConfig[]>([]);
    const [newPresetName, setNewPresetName] = useState('');
    const [isSavingPreset, setIsSavingPreset] = useState(false);
    
    // --- ADVANCED SOTA STATE ---
    const [minP, setMinP] = useState(0.0);
    const [topA, setTopA] = useState(0.0);
    const [repetitionPenalty, setRepetitionPenalty] = useState(1.0);
    const [mirostatMode, setMirostatMode] = useState<'disabled'|'v1'|'v2'>('disabled');
    const [voiceName, setVoiceName] = useState('Puck');
    const [speechRate, setSpeechRate] = useState(1.0);
    const [pitch, setPitch] = useState(0);
    const [logprobsEnabled, setLogprobsEnabled] = useState(false);
    const [topLogprobs, setTopLogprobs] = useState(3);
    const [contextWindowLimit, setContextWindowLimit] = useState(100); 
    const [safetyThresholds, setSafetyThresholds] = useState<Record<string, number>>({ harassment: 2, hate: 2, sex: 2, danger: 2 });

    const contextUsagePercent = Math.min(((settings.systemInstruction.length + (settings.systemInstructionFiles.length * 1000)) / 128000) * 100, 100);

    const defaultSettings = {
        temperature: 0.8, topP: 0.95, topK: 40, frequencyPenalty: 0, presencePenalty: 0, maxOutputTokens: 8192,
        systemInstruction: '', stopSequences: [], seed: null, thinkingBudget: 0, isThinkingMode: false,
        useGoogleSearch: false, isStructuredOutputEnabled: false, responseSchema: '',
        isCodeExecutionEnabled: false, isFunctionCallingEnabled: false
    };

    useEffect(() => {
        const savedPresets = localStorage.getItem('userPresets');
        if (savedPresets) setPresets(JSON.parse(savedPresets));
    }, []);

    const handleSavePreset = () => {
        if (!newPresetName.trim()) return;
        const newPreset: PresetConfig = {
            id: crypto.randomUUID(), name: newPresetName, createdAt: Date.now(),
            ...settings, safetySettings: settings.safetySettings,
            groundingThreshold, agentReflection, agentPlanningMode, searchRecency,
            // Save new features
            useGoogleMaps, agentMathMode, agentDebateMode, recursiveRefinement, expertiseLevel,
            outputVerbosity, forceMarkdown, citationStyle, lateralThinking, memoryRecall,
            promptAutoRefine, verificationLoop, toneShift, draftMode
        };
        const updated = [...presets, newPreset];
        setPresets(updated);
        localStorage.setItem('userPresets', JSON.stringify(updated));
        setNewPresetName('');
        setIsSavingPreset(false);
    };

    const handleLoadPreset = (preset: PresetConfig) => {
        settings.onModelChange(preset.selectedModel);
        settings.onTemperatureChange(preset.temperature);
        settings.onTopPChange(preset.topP);
        settings.onTopKChange(preset.topK);
        settings.onFrequencyPenaltyChange(preset.frequencyPenalty);
        settings.onPresencePenaltyChange(preset.presencePenalty);
        settings.onMaxOutputTokensChange(preset.maxOutputTokens);
        settings.onSystemInstructionChange(preset.systemInstruction);
        settings.onStopSequencesChange(preset.stopSequences);
        settings.onSeedChange(preset.seed);
        settings.onThinkingBudgetChange(preset.thinkingBudget);
        settings.onIsThinkingModeChange(preset.isThinkingMode);
        settings.onUseGoogleSearchChange(preset.useGoogleSearch);
        settings.onIsStructuredOutputEnabledChange(preset.isStructuredOutputEnabled);
        settings.onResponseSchemaChange(preset.responseSchema);
        settings.onIsCodeExecutionEnabledChange(preset.isCodeExecutionEnabled);
        settings.onIsFunctionCallingEnabledChange(preset.isFunctionCallingEnabled);
        
        if (preset.groundingThreshold !== undefined) setGroundingThreshold(preset.groundingThreshold);
        if (preset.agentReflection !== undefined) setAgentReflection(preset.agentReflection);
        if (preset.agentPlanningMode !== undefined) setAgentPlanningMode(preset.agentPlanningMode);
        if (preset.searchRecency !== undefined) setSearchRecency(preset.searchRecency as any);
        
        // Load new features
        if (preset.useGoogleMaps !== undefined) setUseGoogleMaps(preset.useGoogleMaps);
        if (preset.agentMathMode !== undefined) setAgentMathMode(preset.agentMathMode);
        if (preset.agentDebateMode !== undefined) setAgentDebateMode(preset.agentDebateMode);
        if (preset.recursiveRefinement !== undefined) setRecursiveRefinement(preset.recursiveRefinement);
        if (preset.expertiseLevel !== undefined) setExpertiseLevel(preset.expertiseLevel);
        if (preset.outputVerbosity !== undefined) setOutputVerbosity(preset.outputVerbosity);
        if (preset.forceMarkdown !== undefined) setForceMarkdown(preset.forceMarkdown);
        if (preset.citationStyle !== undefined) setCitationStyle(preset.citationStyle as any);
        if (preset.lateralThinking !== undefined) setLateralThinking(preset.lateralThinking);
        if (preset.memoryRecall !== undefined) setMemoryRecall(preset.memoryRecall);
        
        if (preset.promptAutoRefine !== undefined) setPromptAutoRefine(preset.promptAutoRefine);
        if (preset.verificationLoop !== undefined) setVerificationLoop(preset.verificationLoop);
        if (preset.toneShift !== undefined) setToneShift(preset.toneShift);
        if (preset.draftMode !== undefined) setDraftMode(preset.draftMode);

        setIsSavingPreset(false);
    };

    const handleDeletePreset = (id: string) => {
        const updated = presets.filter(p => p.id !== id);
        setPresets(updated);
        localStorage.setItem('userPresets', JSON.stringify(updated));
    };

    const handleReset = () => {
        settings.onTemperatureChange(defaultSettings.temperature);
        settings.onTopPChange(defaultSettings.topP);
        settings.onTopKChange(defaultSettings.topK);
        settings.onFrequencyPenaltyChange(defaultSettings.frequencyPenalty);
        settings.onPresencePenaltyChange(defaultSettings.presencePenalty);
        settings.onMaxOutputTokensChange(defaultSettings.maxOutputTokens);
        settings.onSystemInstructionChange(defaultSettings.systemInstruction);
        settings.onSystemInstructionFilesChange([]);
        settings.onStopSequencesChange(defaultSettings.stopSequences);
        settings.onSeedChange(defaultSettings.seed);
        settings.onThinkingBudgetChange(defaultSettings.thinkingBudget);
        settings.onIsThinkingModeChange(defaultSettings.isThinkingMode);
        settings.onModelChange('gemini-3-flash-preview');
        settings.onUseGoogleSearchChange(defaultSettings.useGoogleSearch);
        settings.onIsStructuredOutputEnabledChange(defaultSettings.isStructuredOutputEnabled);
        settings.onResponseSchemaChange(defaultSettings.responseSchema);
        settings.onIsCodeExecutionEnabledChange(defaultSettings.isCodeExecutionEnabled);
        settings.onIsFunctionCallingEnabledChange(defaultSettings.isFunctionCallingEnabled);
        setRepetitionPenalty(1.0);
        setMinP(0.0);
        setTopA(0.0);
        
        // Reset Agent & Tools
        setGroundingThreshold(0.5);
        setAgentReflection(false);
        setAgentPlanningMode(false);
        setSearchRecency('any');
        
        // Reset New Features
        setUseGoogleMaps(false);
        setAgentMathMode(false);
        setAgentDebateMode(false);
        setRecursiveRefinement(0);
        setExpertiseLevel(3);
        setOutputVerbosity(0.5);
        setForceMarkdown(true);
        setCitationStyle('url');
        setLateralThinking(false);
        setMemoryRecall(false);
        
        setPromptAutoRefine(false);
        setVerificationLoop(false);
        setToneShift(0);
        setDraftMode(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node) && anchorRef.current && !anchorRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose, anchorRef]);
    
    const handleAddStopSequence = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentStopSequence.trim()) {
            e.preventDefault();
            if (!settings.stopSequences.includes(currentStopSequence.trim())) {
                settings.onStopSequencesChange([...settings.stopSequences, currentStopSequence.trim()]);
            }
            setCurrentStopSequence('');
        }
    };

    const handleRemoveStopSequence = (sequenceToRemove: string) => {
        settings.onStopSequencesChange(settings.stopSequences.filter(s => s !== sequenceToRemove));
    };

    const handleModelSelect = (model: GeminiModel) => {
        settings.onModelChange(model);
        if (!model.includes('gemini-2.5') && !model.includes('gemini-3') && model !== 'gemini-2.5-flash-lite-latest' && model !== 'gemini-agent' && model !== 'google-antigravity-engine') {
            settings.onIsThinkingModeChange(false);
            settings.onThinkingBudgetChange(0);
        }
    };

    const isThinkingSupported = settings.selectedModel.includes('gemini-2.5') || settings.selectedModel.includes('gemini-3') || settings.selectedModel === 'gemini-2.5-flash-lite-latest' || settings.selectedModel === 'gemini-agent' || settings.selectedModel === 'google-antigravity-engine';
    const isNativeAudioSupported = settings.selectedModel === 'gemini-2.5-flash-native-audio-preview-09-2025';

    return (
        <div ref={panelRef} className="absolute top-24 right-4 w-full max-w-3xl glass-panel rounded-[2rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)] z-50 animate-fade-in overflow-hidden border border-white/10 ring-1 ring-white/5">
            {/* --- HEADER & PRESETS --- */}
            <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-3xl">
                <div className="flex justify-between items-center mb-5">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse shadow-[0_0_15px_#a855f7]"></div>
                        <h3 className="font-black text-xl text-gray-100 tracking-tight">Engine Room <span className="text-teal-400 font-medium text-sm ml-2">SOTA v5.0</span></h3>
                     </div>
                     <button onClick={handleReset} disabled={disabled} className="group flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-teal-400 disabled:opacity-50 transition-all">
                        <ArrowPathIcon className="w-3 h-3 group-hover:rotate-180 transition-transform duration-500" /> Reiniciar
                     </button>
                </div>
                
                {/* PRESET MANAGER */}
                <div className="bg-black/20 p-3 rounded-xl border border-white/5 mb-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1 group">
                            <button className="w-full flex items-center justify-between bg-white/5 px-4 py-2 rounded-lg text-xs font-bold text-gray-300 hover:bg-white/10 transition-all">
                                <span>Cargar Preset ({presets.length})</span> <ChevronDownIcon className="w-4 h-4" />
                            </button>
                            <div className="absolute top-full left-0 w-full mt-2 bg-slate-900 border border-white/10 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto z-20 overflow-hidden max-h-48 overflow-y-auto">
                                {presets.length === 0 && <div className="p-4 text-xs text-gray-500 text-center">No hay presets guardados</div>}
                                {presets.map(p => (
                                    <div key={p.id} className="flex justify-between items-center px-4 py-3 hover:bg-white/5 border-b border-white/5 last:border-0">
                                        <button onClick={() => handleLoadPreset(p)} className="text-left text-xs font-medium text-gray-200 hover:text-teal-400 flex-1">{p.name}</button>
                                        <button onClick={() => handleDeletePreset(p.id)} className="text-gray-600 hover:text-red-400"><TrashIcon className="w-3 h-3" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setIsSavingPreset(!isSavingPreset)} className="bg-teal-500/10 text-teal-400 border border-teal-500/30 px-3 py-2 rounded-lg hover:bg-teal-500/20 transition-all"><ArrowDownTrayIcon className="w-4 h-4" /></button>
                    </div>
                    {isSavingPreset && (
                        <div className="mt-2 flex gap-2 animate-fade-in">
                            <input type="text" value={newPresetName} onChange={(e) => setNewPresetName(e.target.value)} placeholder="Nombre del preset..." className="glass-input flex-1 text-xs p-2 rounded-lg" />
                            <button onClick={handleSavePreset} disabled={!newPresetName} className="bg-teal-500 text-slate-900 px-3 py-2 rounded-lg text-xs font-bold hover:bg-teal-400 disabled:opacity-50">Guardar</button>
                        </div>
                    )}
                </div>

                {/* --- NAVIGATION TABS --- */}
                <div className="flex gap-1 p-1 bg-black/20 rounded-xl overflow-x-auto custom-scrollbar">
                    {[{id: 'params', label: 'Sampling'}, {id: 'system', label: 'System & Safety'}, {id: 'tools', label: 'Tools & Agents'}, {id: 'audio', label: 'Audio & MM'}, {id: 'advanced', label: 'Advanced'}].map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-teal-500 text-slate-900 shadow-lg' : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'}`}>{tab.label}</button>
                    ))}
                </div>
            </div>

            <div className="max-h-[65vh] overflow-y-auto px-6 py-6 custom-scrollbar scroll-smooth">
                {/* --- TAB: SAMPLING PARAMETERS --- */}
                {activeTab === 'params' && (
                    <div className="space-y-6 animate-fade-in">
                        <section>
                            <SectionHeader title="Model Selection" icon={<SparklesIcon className="w-4 h-4" />} />
                            
                            {/* GEMINI 3 SERIES */}
                            <div className="mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Gemini 3.0 (Frontier)</div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                                <ModelButton id="gemini-3-pro-preview" label="3 Pro" sub="Reasoning SOTA" highlight current={settings.selectedModel} onClick={handleModelSelect} disabled={disabled} />
                                <ModelButton id="gemini-3-flash-preview" label="3 Flash" sub="Speed SOTA" highlight current={settings.selectedModel} onClick={handleModelSelect} disabled={disabled} />
                                <ModelButton id="gemini-3-deep-think-preview" label="Deep Think" sub="Math/Code" current={settings.selectedModel} onClick={handleModelSelect} disabled={disabled} />
                            </div>

                            {/* GEMINI 2.5 SERIES */}
                            <div className="mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Gemini 2.5 (Performance)</div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                                <ModelButton id="gemini-2.5-pro-latest" label="2.5 Pro" sub="Balanced" colorClass="bg-blue-600/80 border-blue-400" current={settings.selectedModel} onClick={handleModelSelect} disabled={disabled} />
                                <ModelButton id="gemini-2.5-flash-latest" label="2.5 Flash" sub="High Throughput" colorClass="bg-blue-600/80 border-blue-400" current={settings.selectedModel} onClick={handleModelSelect} disabled={disabled} />
                                <ModelButton id="gemini-2.5-flash-lite-latest" label="2.5 Lite" sub="Cost Efficient" colorClass="bg-blue-600/80 border-blue-400" current={settings.selectedModel} onClick={handleModelSelect} disabled={disabled} />
                                <ModelButton id="gemini-2.5-flash-native-audio-preview-09-2025" label="Native Audio" sub="Multimodal" colorClass="bg-pink-600/80 border-pink-400" current={settings.selectedModel} onClick={handleModelSelect} disabled={disabled} />
                            </div>

                            {/* GEMMA & SPECIAL */}
                            <div className="mb-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Gemma & Specialized</div>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                                <ModelButton id="gemma-3-27b-it" label="Gemma 3" sub="27B Instruct" colorClass="bg-emerald-600/80 border-emerald-400" current={settings.selectedModel} onClick={handleModelSelect} disabled={disabled} />
                                <ModelButton id="gemma-3-12b-it" label="Gemma 3" sub="12B Instruct" colorClass="bg-emerald-600/80 border-emerald-400" current={settings.selectedModel} onClick={handleModelSelect} disabled={disabled} />
                                <ModelButton id="gemma-3-4b-it" label="Gemma 3" sub="4B Instruct" colorClass="bg-emerald-600/80 border-emerald-400" current={settings.selectedModel} onClick={handleModelSelect} disabled={disabled} />
                                <ModelButton id="gemini-agent" label="Agentic" sub="Auto-Loop" current={settings.selectedModel} onClick={handleModelSelect} disabled={disabled} />
                            </div>
                        </section>

                        <section className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-5">
                            <SectionHeader title="Core Sampling" icon={<Bars3BottomLeftIcon className="w-4 h-4" />} />
                            
                            <Toggle label="Draft Mode (Low Cost)" enabled={draftMode} onToggle={setDraftMode} disabled={disabled} tooltip="Modo rápido y económico para iteraciones iniciales." />

                            {/* Max Output Tokens Moved Here */}
                            <SliderControl 
                                label="Max Output Tokens" 
                                value={settings.maxOutputTokens} 
                                min={1} 
                                max={65536} 
                                step={1024} 
                                onChange={settings.onMaxOutputTokensChange} 
                                disabled={disabled} 
                                tooltip="Límite máximo de tokens generados. Gemini 1.5/2.0+ soportan contextos muy largos (hasta 64k+ output)." 
                                highlight
                            />

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <SliderControl label="Temperature" value={settings.temperature} min={0} max={2} step={0.1} onChange={settings.onTemperatureChange} disabled={disabled} tooltip="Aleatoriedad. 0=Determinista, 1+=Creativo." />
                                <SliderControl label="Top P (Nucleus)" value={settings.topP} min={0} max={1} step={0.01} onChange={settings.onTopPChange} disabled={disabled} tooltip="Corte de masa de probabilidad acumulada." />
                                <SliderControl label="Top K" value={settings.topK} min={1} max={100} step={1} onChange={settings.onTopKChange} disabled={disabled} tooltip="Corte de top K tokens." />
                                <SliderControl label="Seed (Determinism)" value={settings.seed || 0} min={0} max={99999} step={1} onChange={(v) => settings.onSeedChange(v)} disabled={disabled} tooltip="Semilla para reproducibilidad." />
                            </div>
                        </section>

                        <section className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-5">
                            <SectionHeader title="Penalties & Advanced" icon={<ScaleIcon className="w-4 h-4" />} />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <SliderControl label="Frequency Penalty" value={settings.frequencyPenalty} min={-2} max={2} step={0.1} onChange={settings.onFrequencyPenaltyChange} disabled={disabled} tooltip="Penaliza tokens frecuentes (reduce repetición)." highlight />
                                <SliderControl label="Presence Penalty" value={settings.presencePenalty} min={-2} max={2} step={0.1} onChange={settings.onPresencePenaltyChange} disabled={disabled} tooltip="Penaliza tokens si ya aparecieron (aumenta variedad)." highlight />
                                <SliderControl label="Repetition Penalty" value={repetitionPenalty} min={1.0} max={2.0} step={0.01} onChange={setRepetitionPenalty} disabled={disabled} tooltip="Penalización multiplicativa." />
                                <SliderControl label="Min P (SOTA)" value={minP} min={0} max={1} step={0.01} onChange={setMinP} disabled={disabled} tooltip="Corte relativo a la probabilidad del top token." />
                                <SliderControl label="Top A" value={topA} min={0} max={1} step={0.01} onChange={setTopA} disabled={disabled} tooltip="Considera tokens con prob^2 > Top A." />
                            </div>
                        </section>
                    </div>
                )}

                {/* --- TAB: SYSTEM & SAFETY --- */}
                {activeTab === 'system' && (
                    <div className="space-y-6 animate-fade-in">
                        <section className="space-y-3">
                            <SectionHeader title="System Persona" icon={<ShieldCheckIcon className="w-4 h-4" />} />
                            <textarea id="system-instruction" value={settings.systemInstruction} onChange={(e) => settings.onSystemInstructionChange(e.target.value)} placeholder="Define el rol y comportamiento de la IA..." rows={6} className="glass-input w-full text-sm rounded-2xl p-4 text-gray-200 resize-none shadow-inner border border-white/5 focus:border-teal-500/50 transition-all font-sans" disabled={disabled} />
                            <FileUploader files={settings.systemInstructionFiles} onSystemInstructionFilesChange={settings.onSystemInstructionFilesChange} />
                        </section>

                        <section className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
                            <SectionHeader title="Context Simulation" icon={<ArrowUpTrayIcon className="w-4 h-4" />} />
                            <div className="mb-4">
                                <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500 mb-1">
                                    <span>Context Window Usage Estimate</span>
                                    <span>{contextUsagePercent.toFixed(1)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-teal-500 to-purple-500 transition-all duration-500" style={{ width: `${contextUsagePercent}%` }}></div>
                                </div>
                            </div>
                            <SliderControl label="Simulated Context Limit (%)" value={contextWindowLimit} min={10} max={100} step={10} onChange={setContextWindowLimit} disabled={disabled} tooltip="Simula una ventana de contexto más pequeña para pruebas." />
                            
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-gray-400">Stop Sequences (Enter to add)</label>
                                <div className="flex gap-2 flex-wrap bg-black/20 p-2 rounded-lg border border-white/5 min-h-[40px]">
                                    {settings.stopSequences.map((seq, idx) => (
                                        <span key={idx} className="bg-red-500/20 text-red-300 px-2 py-1 rounded text-xs flex items-center gap-1 border border-red-500/30">
                                            {seq} <button onClick={() => handleRemoveStopSequence(seq)} className="hover:text-white"><XCircleIcon className="w-3 h-3" /></button>
                                        </span>
                                    ))}
                                    <input type="text" value={currentStopSequence} onChange={(e) => setCurrentStopSequence(e.target.value)} onKeyDown={handleAddStopSequence} className="bg-transparent border-none outline-none text-xs text-white flex-1 min-w-[100px]" placeholder="Ej: 'Usuario:'" />
                                </div>
                            </div>
                        </section>

                        <section className="bg-red-900/10 rounded-2xl p-5 border border-red-500/20 space-y-4">
                            <SectionHeader title="Safety Thresholds" icon={<ShieldCheckIcon className="w-4 h-4 text-red-400" />} />
                            <div className="grid grid-cols-2 gap-4">
                                <SliderControl label="Harassment" value={safetyThresholds.harassment} min={0} max={3} step={1} onChange={(v) => setSafetyThresholds({...safetyThresholds, harassment: v})} disabled={disabled} tooltip="0=None, 3=High" />
                                <SliderControl label="Hate Speech" value={safetyThresholds.hate} min={0} max={3} step={1} onChange={(v) => setSafetyThresholds({...safetyThresholds, hate: v})} disabled={disabled} tooltip="0=None, 3=High" />
                                <SliderControl label="Sexually Explicit" value={safetyThresholds.sex} min={0} max={3} step={1} onChange={(v) => setSafetyThresholds({...safetyThresholds, sex: v})} disabled={disabled} tooltip="0=None, 3=High" />
                                <SliderControl label="Dangerous" value={safetyThresholds.danger} min={0} max={3} step={1} onChange={(v) => setSafetyThresholds({...safetyThresholds, danger: v})} disabled={disabled} tooltip="0=None, 3=High" />
                            </div>
                            <button onClick={onOpenSafetySettings} className="w-full py-2 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold uppercase hover:bg-red-500/20 transition-all">Configuración Avanzada de Seguridad</button>
                        </section>
                    </div>
                )}

                {/* --- TAB: TOOLS & AGENTS --- */}
                {activeTab === 'tools' && (
                    <div className="space-y-6 animate-fade-in">
                        <section className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-5">
                            <SectionHeader title="Native Tools & Grounding" icon={<BeakerIcon className="w-4 h-4" />} />
                            
                            <div className="p-3 bg-teal-900/20 rounded-xl border border-teal-500/10 mb-2">
                                <Toggle label="Grounding: Google Search" enabled={settings.useGoogleSearch} onToggle={settings.onUseGoogleSearchChange} disabled={disabled} tooltip="Búsqueda web en tiempo real con Gemini Grounding." />
                                {settings.useGoogleSearch && (
                                    <div className="mt-3 pl-2 border-l-2 border-teal-500/30 space-y-3 animate-fade-in">
                                        <SliderControl label="Grounding Threshold" value={groundingThreshold} min={0.0} max={1.0} step={0.1} onChange={setGroundingThreshold} disabled={disabled} tooltip="Fidelidad a la fuente: 1.0 es estricto, 0.0 permite alucinación creativa." />
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-400">Search Recency</span>
                                            <select value={searchRecency} onChange={(e) => setSearchRecency(e.target.value as any)} className="bg-black/30 border border-white/10 rounded-md text-[10px] text-teal-400 px-2 py-1 outline-none">
                                                <option value="any">Any Time</option>
                                                <option value="day">Past 24h</option>
                                                <option value="week">Past Week</option>
                                                <option value="month">Past Month</option>
                                                <option value="year">Past Year</option>
                                            </select>
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            <Toggle label="Tool: Google Maps" enabled={useGoogleMaps} onToggle={setUseGoogleMaps} disabled={disabled} tooltip="Acceso a datos geo-espaciales reales." />
                            <Toggle label="Code Sandbox (Python)" enabled={settings.isCodeExecutionEnabled} onToggle={settings.onIsCodeExecutionEnabledChange} disabled={disabled} tooltip="Ejecución de código en sandbox." />
                            <Toggle label="Function Calling (Auto)" enabled={settings.isFunctionCallingEnabled} onToggle={settings.onIsFunctionCallingEnabledChange} disabled={disabled} tooltip="Permite al modelo detectar y llamar funciones." />
                        </section>

                        <section className="bg-purple-900/10 rounded-2xl p-5 border border-purple-500/20 space-y-5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-20"><SparklesIcon className="w-12 h-12 text-purple-500" /></div>
                            <SectionHeader title="Agentic Cognitive Layers" icon={<UsersIcon className="w-4 h-4 text-purple-400" />} />
                            
                            <Toggle label="Prompt Auto-Refine" enabled={promptAutoRefine} onToggle={setPromptAutoRefine} disabled={disabled} tooltip="Mejora automáticamente el prompt antes de enviarlo al modelo." />
                            <Toggle label="Auto-Reflection Loop" enabled={agentReflection} onToggle={setAgentReflection} disabled={disabled} tooltip="El agente critica su propia respuesta antes de enviarla." />
                            <Toggle label="Step-by-Step Planning" enabled={agentPlanningMode} onToggle={setAgentPlanningMode} disabled={disabled} tooltip="Fuerza al modelo a generar un <plan> antes de ejecutar." />
                            <Toggle label="Debate Protocol" enabled={agentDebateMode} onToggle={setAgentDebateMode} disabled={disabled} tooltip="Genera Tesis y Antítesis antes de la Síntesis final." />
                            <Toggle label="Math/Logic Mode" enabled={agentMathMode} onToggle={setAgentMathMode} disabled={disabled} tooltip="Prioriza el uso de herramientas de cálculo y lógica formal." />
                            <Toggle label="Memory Recall (RAG Sim)" enabled={memoryRecall} onToggle={setMemoryRecall} disabled={disabled} tooltip="Simula la inyección de contexto previo relevante." />
                            <Toggle label="Verification Loop" enabled={verificationLoop} onToggle={setVerificationLoop} disabled={disabled} tooltip="Verifica hechos generados contra la base de conocimiento." />
                            <Toggle label="Lateral Thinking" enabled={lateralThinking} onToggle={setLateralThinking} disabled={disabled} tooltip="Fuerza analogías inusuales y soluciones creativas." />
                            
                            <SliderControl label="Recursive Refinement Loop" value={recursiveRefinement} min={0} max={3} step={1} onChange={setRecursiveRefinement} disabled={disabled} tooltip="Número de veces que el modelo iterará sobre su propia respuesta (0 = Off)." />
                        </section>

                        <section className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-5">
                            <SectionHeader title="Output Shaping" icon={<ScaleIcon className="w-4 h-4" />} />
                            <Toggle 
                                label="Force JSON Mode" 
                                enabled={settings.isStructuredOutputEnabled} 
                                onToggle={settings.onIsStructuredOutputEnabledChange} 
                                disabled={disabled || settings.useGoogleSearch} 
                                tooltip="Fuerza salida JSON válida."
                                warning={settings.useGoogleSearch ? "Incompatible con Search" : undefined}
                            />
                            {settings.isStructuredOutputEnabled && (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="text-xs font-semibold text-gray-400">JSON Schema (Optional)</label>
                                    <textarea 
                                        value={settings.responseSchema} 
                                        onChange={(e) => settings.onResponseSchemaChange(e.target.value)} 
                                        placeholder='{"type": "object", "properties": {...}}'
                                        className="glass-input w-full h-32 rounded-xl p-3 text-xs font-mono text-teal-300"
                                    />
                                </div>
                            )}
                            
                            <Toggle label="Force Markdown" enabled={forceMarkdown} onToggle={setForceMarkdown} disabled={disabled} tooltip="Asegura formato rico (listas, headers, código)." />
                            <SliderControl label="Expertise Level" value={expertiseLevel} min={1} max={5} step={1} onChange={setExpertiseLevel} disabled={disabled} tooltip="1=Novato, 5=Súper-Experto (God Mode)." />
                            <SliderControl label="Verbosity" value={outputVerbosity} min={0.0} max={1.0} step={0.1} onChange={setOutputVerbosity} disabled={disabled} tooltip="0=Conciso (Haiku), 1=Extenso (Novela)." />
                            <SliderControl label="Tone Shift" value={toneShift} min={-5} max={5} step={1} onChange={setToneShift} disabled={disabled} tooltip="-5 (Serio/Triste) a +5 (Alegre/Divertido)." />
                            
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400 font-semibold">Citation Style</span>
                                <select value={citationStyle} onChange={(e) => setCitationStyle(e.target.value as any)} className="bg-black/30 border border-white/10 rounded-md text-[10px] text-teal-400 px-2 py-1 outline-none">
                                    <option value="none">None</option>
                                    <option value="url">URL Links</option>
                                    <option value="inline">Inline [1]</option>
                                    <option value="apa">APA Format</option>
                                </select>
                            </div>
                        </section>

                        <section className="bg-indigo-900/20 rounded-2xl p-5 border border-indigo-500/20 space-y-5">
                            <SectionHeader title="Reasoning Engine (CoT)" icon={<SparklesIcon className="w-4 h-4 text-indigo-400" />} />
                            <div className={isThinkingSupported ? 'space-y-4' : 'opacity-30 pointer-events-none'}>
                                <SliderControl label="Thinking Budget" value={settings.thinkingBudget} min={0} max={64000} step={1024} onChange={(v) => { settings.onThinkingBudgetChange(v); settings.onIsThinkingModeChange(v > 0); }} disabled={disabled || !isThinkingSupported} tooltip="Tokens reservados para pensamiento oculto." highlight />
                                <div className="flex gap-2">
                                    {['shallow', 'medium', 'deep'].map(d => (
                                        <button key={d} className="flex-1 py-2 bg-indigo-500/10 border border-indigo-500/30 rounded-lg text-xs text-indigo-300 uppercase font-bold hover:bg-indigo-500/20">{d}</button>
                                    ))}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* --- TAB: AUDIO & MULTIMODAL --- */}
                {activeTab === 'audio' && (
                    <div className="space-y-6 animate-fade-in">
                        <section className={`bg-white/5 rounded-2xl p-5 border border-white/5 space-y-5 ${!isNativeAudioSupported ? 'opacity-50 pointer-events-none' : ''}`}>
                            <SectionHeader title="Native Voice Config" icon={<ArrowUpTrayIcon className="w-4 h-4" />} />
                            {!isNativeAudioSupported && <p className="text-xs text-red-400 font-bold mb-2">Selecciona un modelo 'Native Audio' para habilitar.</p>}
                            
                            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                                {['Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'].map(voice => (
                                    <button
                                        key={voice}
                                        onClick={() => setVoiceName(voice)}
                                        className={`py-3 rounded-xl text-xs font-bold border transition-all ${voiceName === voice ? 'bg-pink-500/20 border-pink-500 text-pink-300 shadow-lg' : 'bg-white/5 border-white/10 text-gray-400'}`}
                                    >
                                        {voice}
                                    </button>
                                ))}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <SliderControl label="Speaking Rate" value={speechRate} min={0.5} max={2.0} step={0.1} onChange={setSpeechRate} disabled={disabled} tooltip="Velocidad del habla." />
                                <SliderControl label="Pitch" value={pitch} min={-20} max={20} step={1} onChange={setPitch} disabled={disabled} tooltip="Tono de la voz." />
                            </div>
                        </section>

                        <section className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-5">
                            <SectionHeader title="Multimodal Inputs" icon={<UsersIcon className="w-4 h-4" />} />
                            <div className="flex gap-4">
                                <div className="flex-1 bg-black/20 p-4 rounded-xl border border-white/5 text-center hover:border-teal-500/30 transition-all cursor-pointer">
                                    <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                                    <span className="text-xs font-bold text-gray-300 block">Upload Image</span>
                                    <span className="text-[9px] text-gray-500">Vision Analysis</span>
                                </div>
                                <div className="flex-1 bg-black/20 p-4 rounded-xl border border-white/5 text-center hover:border-pink-500/30 transition-all cursor-pointer">
                                    <ArrowUpTrayIcon className="w-8 h-8 mx-auto text-gray-500 mb-2" />
                                    <span className="text-xs font-bold text-gray-300 block">Upload Audio</span>
                                    <span className="text-[9px] text-gray-500">Native Listening</span>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* --- TAB: ADVANCED --- */}
                {activeTab === 'advanced' && (
                    <div className="space-y-6 animate-fade-in">
                        <section className="bg-yellow-900/10 rounded-2xl p-5 border border-yellow-500/20 space-y-5">
                            <SectionHeader title="Observability (Logprobs)" icon={<BeakerIcon className="w-4 h-4 text-yellow-400" />} />
                            <Toggle label="Enable Logprobs" enabled={logprobsEnabled} onToggle={setLogprobsEnabled} disabled={disabled} tooltip="Ver probabilidades de tokens." />
                            {logprobsEnabled && (
                                <SliderControl label="Top Logprobs Count" value={topLogprobs} min={1} max={5} step={1} onChange={setTopLogprobs} disabled={disabled} tooltip="Cantidad de alternativas a mostrar." />
                            )}
                        </section>

                        <section className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-5">
                            <SectionHeader title="Experimental" icon={<GlobeAltIcon className="w-4 h-4" />} />
                            <div className="grid grid-cols-2 gap-4">
                                <Toggle label="Mirostat V2" enabled={mirostatMode === 'v2'} onToggle={(v) => setMirostatMode(v ? 'v2' : 'disabled')} disabled={disabled} tooltip="Control dinámico de perplejidad." />
                                <Toggle label="Tail Free Sampling" enabled={false} onToggle={() => {}} disabled={true} tooltip="Experimental: TFS (Coming Soon)." />
                                <Toggle label="Typical P" enabled={false} onToggle={() => {}} disabled={true} tooltip="Experimental: Typical Sampling (Coming Soon)." />
                                <Toggle label="Echo Prompt" enabled={false} onToggle={() => {}} disabled={true} tooltip="Repite el prompt en la salida." />
                            </div>
                        </section>
                        
                        <div className="p-4 bg-black/40 rounded-xl border border-white/10 text-xs text-gray-500 font-mono">
                            DEBUG CONFIG JSON PREVIEW:<br/>
                            {JSON.stringify({ ...settings, minP, topA, repetitionPenalty, voiceName }, null, 2).substring(0, 300)}...
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ModelSettingsPanel;
