
export type GeminiModel = 
    | 'gemini-3-pro-preview' 
    | 'gemini-3-flash-preview' 
    | 'gemini-3-deep-think-preview' 
    | 'gemini-3-visual-layout'
    | 'gemini-2.5-pro-latest'
    | 'gemini-2.5-flash-latest'
    | 'gemini-2.5-flash-lite-latest'
    | 'gemini-2.5-flash-native-audio-preview-09-2025'
    | 'gemma-3-27b-it'
    | 'gemma-3-12b-it'
    | 'gemma-3-4b-it'
    | 'gemini-agent'
    | 'google-antigravity-engine'
    | 'veo-3.1-generate-preview'
    | 'imagen-4.0-generate-001';

export interface ConfigSnapshot {
    temperature: number;
    topP: number;
    topK: number;
    maxOutputTokens: number;
    thinkingBudget: number;
    isThinkingMode: boolean;
    useGoogleSearch: boolean;
    systemInstructionSnippet?: string;
    voiceName?: string;
}

// Token Metrics
export interface TokenUsage {
    promptTokens: number;
    candidatesTokens: number;
    thinkingTokens?: number; // New field for thinking budget tracking
    totalTokens: number;
    cachedContentTokens?: number;
    model: string;
    timestamp: number;
    costEstimate?: number; // Placeholder for future implementation
    actionType: 'optimization' | 'generation' | 'expansion' | 'analysis' | 'chat';
    snapshot?: ConfigSnapshot;
    contextPreview?: {
        inputSnippet: string;
        outputSnippet: string;
    };
}

export interface Framework {
    id: string;
    acronym: string;
    name: string;
    description: string;
    category: string;
    example?: {
        title: string;
        prompt: string;
    };
    source?: {
        name: string;
        url: string;
    };
    usage?: TokenUsage; // Added for tracking creation cost
}

export interface PromptVersion {
    versionId: string;
    idea: string;
    useCase: string;
    frameworkAcronym: string;
    optimizedPrompt: string;
    model: GeminiModel;
    createdAt: string;
    changeSummary: string;
}

export interface SavedPrompt {
    id: string;
    name?: string; // Nombre personalizado de la sesión
    baseIdea: string;
    createdAt: string;
    versions: PromptVersion[];
}

export interface UploadedFile {
    name: string;
    type: string;
    size: number;
    base64?: string;
    textContent?: string;
}

export interface CritiqueResult {
    score: number;
    pros: string[];
    cons: string[];
    suggestion: string;
    usage?: TokenUsage; // Added for tracking
}

interface QualityMetric {
    score: number;
    feedback: string;
}

export interface QualityAnalysisResult {
    overallScore: number;
    clarity: QualityMetric;
    completeness: QualityMetric;
    safety: QualityMetric;
    efficiency: QualityMetric;
    specificity: QualityMetric;
    actionability: QualityMetric;
    potentialForBias: QualityMetric;
    ethicalRisk: QualityMetric;
    robustness: QualityMetric;
    creativity: QualityMetric;
    toneAndStyle: QualityMetric;
    audienceDefinition: QualityMetric;
    formatDefinition: QualityMetric;
    taskComplexity: QualityMetric;
    contextRichness: QualityMetric;
    overallFeedback: string;
    usage?: TokenUsage; // Added for tracking
}

// New types for Safety Settings
export type SafetySettingValue = 'BLOCK_NONE' | 'BLOCK_ONLY_HIGH' | 'BLOCK_MEDIUM_AND_ABOVE' | 'BLOCK_LOW_AND_ABOVE';

export interface SafetySettings {
  HARM_CATEGORY_HARASSMENT: SafetySettingValue;
  HARM_CATEGORY_HATE_SPEECH: SafetySettingValue;
  HARM_CATEGORY_SEXUALLY_EXPLICIT: SafetySettingValue;
  HARM_CATEGORY_DANGEROUS_CONTENT: SafetySettingValue;
}

// Batch Testing Types
export interface BatchRow {
    id: string;
    [key: string]: string; // Dynamic keys for CSV columns
}

export interface BatchResult {
    rowId: string;
    variables: { [key: string]: string };
    finalPrompt: string;
    output: string;
    thought?: string; // Captura el razonamiento si está disponible
    status: 'pending' | 'loading' | 'completed' | 'error';
    error?: string;
}

// Arena Battle Types
export interface ArenaBattleConfig {
    prompt: string;
    models: GeminiModel[];
}

// Configuration Persistence Type
export interface ModelConfig {
    selectedModel: GeminiModel;
    
    // Core Sampling
    temperature: number;
    topP: number;
    topK: number;
    
    // Penalties (Restored)
    frequencyPenalty: number;
    presencePenalty: number;
    
    // Advanced Sampling (New SOTA)
    minP?: number;
    topA?: number;
    tfsZ?: number; // Tail Free Sampling
    mirostatMode?: 'disabled' | 'v1' | 'v2';
    mirostatEta?: number;
    mirostatTau?: number;
    repetitionPenalty?: number;
    
    // Output Constraints
    maxOutputTokens: number;
    stopSequences: string[];
    seed: number | null;
    jsonSchema?: string; // Enhanced JSON control
    
    // System & Context
    systemInstruction: string;
    contextWindowSize?: number; // Simulated limit
    
    // Thinking (CoT)
    thinkingBudget: number;
    isThinkingMode: boolean;
    thinkingDepth?: 'shallow' | 'medium' | 'deep'; // Simulated heuristic
    
    // Tools & Grounding
    useGoogleSearch: boolean;
    useGoogleMaps?: boolean; // New 1
    searchRecency?: 'any' | 'month' | 'week' | 'day'; 
    groundingThreshold?: number; 
    
    // Agent Capabilities
    isStructuredOutputEnabled: boolean;
    responseSchema: string; // JSON string representation
    isCodeExecutionEnabled: boolean;
    isFunctionCallingEnabled: boolean;
    agentReflection?: boolean; 
    agentPlanningMode?: boolean; 
    agentDebateMode?: boolean; // New 2
    agentMathMode?: boolean; // New 3
    recursiveRefinement?: number; // New 4 (0-3 loops)
    memoryRecall?: boolean; // New 5
    lateralThinking?: boolean; // New 6
    promptAutoRefine?: boolean; // New Feature 1
    verificationLoop?: boolean; // New Feature 2
    
    // Output Shaping
    expertiseLevel?: number; // New 7 (1-5)
    outputVerbosity?: number; // New 8 (0.0-1.0)
    forceMarkdown?: boolean; // New 9
    citationStyle?: 'none' | 'apa' | 'inline' | 'url'; // New 10
    toneShift?: number; // New Feature 3 (-5 to 5)
    draftMode?: boolean; // New Feature 4

    // Audio (Enhanced)
    responseModalities?: ('TEXT' | 'AUDIO' | 'IMAGE')[];
    speechConfig?: {
        voiceName: string; // 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr'
        speakingRate?: number; // 0.5 to 2.0
        pitch?: number; // -20 to 20
        volumeGainDb?: number;
    };
    
    // Observability
    enableLogprobs?: boolean;
    topLogprobs?: number;
    
    // Safety
    safetySettings: SafetySettings;
}

export interface PresetConfig extends ModelConfig {
    id: string;
    name: string;
    createdAt: number;
}
