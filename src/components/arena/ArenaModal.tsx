
import React from 'react';
import { XMarkIcon, SparklesIcon } from '../shared/Icons.tsx';
import { Framework, GeminiModel, SafetySettings, UploadedFile, ArenaBattleConfig } from '../../types/index.ts';
import ArenaPanel from './ArenaPanel.tsx';

interface ArenaModalProps {
    onClose: () => void;
    testConfig?: {
      prompt: string;
    };
    compareConfig?: {
      frameworks: Framework[];
      idea: string;
      useCase: string;
    };
    battleConfig?: ArenaBattleConfig;
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
}

const ArenaModal: React.FC<ArenaModalProps> = ({ 
    onClose, 
    testConfig, 
    compareConfig, 
    battleConfig,
    ...modelSettings
}) => {
    const isComparisonMode = !!compareConfig && compareConfig.frameworks.length > 0;
    const isBattleMode = !!battleConfig && battleConfig.models.length > 0;

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true">
            <div className="bg-slate-900 border border-white/10 rounded-[3rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.9)] w-full max-w-[95vw] h-[92vh] flex flex-col p-6 overflow-hidden ring-1 ring-white/5">
                <header className="flex justify-between items-center mb-6 flex-shrink-0 px-4">
                    <div className="flex items-center gap-5">
                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${isBattleMode ? 'bg-gradient-to-br from-pink-500 to-indigo-600 shadow-pink-500/20' : 'bg-gradient-to-br from-teal-500 to-blue-600 shadow-teal-500/20'}`}>
                            <SparklesIcon className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-gray-100 tracking-tighter uppercase italic">
                                {isBattleMode ? 'Batalla Multimodelo' : 'Arena de Pruebas'}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em]">
                                    {isBattleMode ? 'Comparativa de Latencia y Razonamiento // 2025' : 'Testbench Pro // Aurora Edition'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-4 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white">
                        <XMarkIcon className="w-10 h-10" />
                    </button>
                </header>

                <div className="flex-1 flex gap-6 min-h-0 overflow-x-auto pb-4 custom-scrollbar px-2">
                    {isBattleMode ? (
                        battleConfig.models.map((modelId, index) => (
                            <div key={`${modelId}-${index}`} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                                <ArenaPanel 
                                    title={modelId.split('-')[0].toUpperCase()}
                                    initialPrompt={battleConfig.prompt}
                                    overrideModel={modelId}
                                    {...modelSettings}
                                />
                            </div>
                        ))
                    ) : isComparisonMode ? (
                        compareConfig.frameworks.map((fw, index) => (
                            <div key={fw.id} className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
                                <ArenaPanel 
                                    title={`${String.fromCharCode(65 + index)}: ${fw.acronym}`}
                                    framework={fw}
                                    idea={compareConfig.idea}
                                    useCase={compareConfig.useCase}
                                    {...modelSettings}
                                />
                            </div>
                        ))
                    ) : testConfig ? (
                        <>
                            <div className="w-full md:w-1/2 flex-shrink-0">
                               <ArenaPanel title="Variante A" initialPrompt={testConfig.prompt} {...modelSettings} />
                            </div>
                             <div className="w-full md:w-1/2 flex-shrink-0">
                               <ArenaPanel title="Variante B" initialPrompt={testConfig.prompt} {...modelSettings} />
                            </div>
                        </>
                    ) : null}
                </div>
                
                <footer className="mt-4 pt-4 border-t border-white/5 flex justify-center opacity-50">
                     <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">© Prompt Lab Battle System // SOTA Pipeline Dec 2025</p>
                </footer>
            </div>
        </div>
    );
};

export default ArenaModal;
