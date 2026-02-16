
import { GoogleGenAI, Part, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Framework, UploadedFile, CritiqueResult, GeminiModel, QualityAnalysisResult, SafetySettings, SafetySettingValue, TokenUsage, ConfigSnapshot } from '../types/index.ts';
import { USE_CASES, FRAMEWORKS } from '../config/constants.ts';
import { CONTEXT_FRAMEWORKS } from '../config/contextConstants.ts';
import { AGENT_FRAMEWORKS } from '../config/agentConstants.ts';
import { CODING_FRAMEWORKS } from '../config/codingConstants.ts';
import { BUSINESS_FRAMEWORKS } from '../config/businessConstants.ts';
import { DATA_FRAMEWORKS } from '../config/dataConstants.ts';

const API_KEY = process.env.API_KEY;

export const IS_API_KEY_AVAILABLE = !!API_KEY;

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

if (!ai) {
  console.warn("API_KEY environment variable not set. Gemini features will not work.");
}

const ALL_FRAMEWORKS_LIST = [
    ...FRAMEWORKS, 
    ...CONTEXT_FRAMEWORKS, 
    ...AGENT_FRAMEWORKS,
    ...CODING_FRAMEWORKS,
    ...BUSINESS_FRAMEWORKS,
    ...DATA_FRAMEWORKS
];

const getErrorMessage = (feature: string) => `Error: La API Key de Gemini no está configurada. La función "${feature}" no está disponible.`;

const resolveModel = (model: string): string => {
    const modelMap: Record<string, string> = {
        'gemini-agent': 'gemini-3-pro-preview',
        'google-antigravity-engine': 'gemini-3-pro-preview',
        'gemini-3-deep-think-preview': 'gemini-3-pro-preview',
        'gemini-3-visual-layout': 'gemini-3-flash-preview',
        'gemini-3-pro-preview': 'gemini-3-pro-preview',
        'gemini-3-flash-preview': 'gemini-3-flash-preview',
        'gemini-2.5-pro-latest': 'gemini-2.5-pro-latest',
        'gemini-2.5-flash-latest': 'gemini-2.5-flash-latest',
        'gemini-2.5-flash-lite-latest': 'gemini-2.5-flash-lite-latest',
        'gemini-2.5-flash-native-audio-preview-09-2025': 'gemini-2.5-flash-native-audio-preview-09-2025',
        'gemma-3-27b-it': 'gemma-3-27b-it',
        'gemma-3-12b-it': 'gemma-3-12b-it',
        'gemma-3-4b-it': 'gemma-3-4b-it',
        'imagen-4.0-generate-001': 'imagen-4.0-generate-001',
        'veo-3.1-generate-preview': 'veo-3.1-generate-preview',
        'gemini-flash': 'gemini-3-flash-preview',
        'gemini-pro': 'gemini-3-pro-preview'
    };
    return modelMap[model] || model;
};

const fileToPart = (file: UploadedFile): Part => {
  if (file.base64) {
    return { inlineData: { mimeType: file.type, data: file.base64 } };
  }
  return {} as Part;
};

// --- SOTA CONTEXT INJECTOR ---
// Translates UI sliders/toggles into high-performance system instructions
const constructSotaSystemInstruction = (settings: ModelSettings): string => {
    const parts: string[] = [];

    // 1. Essence Preservation (The Golden Rule)
    parts.push(`### PRIME DIRECTIVE: ESSENCE PRESERVATION
    You are an advanced AI Engine. Your goal is to Expand, Optimize, or Refine the user's input based on the requested task.
    CRITICAL: You MUST preserve the user's original intent (the 'Essence'). Do not alter the core meaning or the specific goal. Enhance the execution, structure, and depth, but NEVER lose the original purpose.`);

    // 2. Expertise Level (1-5)
    if (settings.expertiseLevel) {
        const lvl = settings.expertiseLevel;
        let role = "Competent Professional";
        if (lvl === 1) role = "Friendly Tutor (Explain like I'm 5)";
        if (lvl === 2) role = "Knowledgeable Assistant";
        if (lvl === 3) role = "Senior Engineer / Subject Matter Expert";
        if (lvl === 4) role = "Distinguished Fellow / Industry Leader";
        if (lvl === 5) role = "SOTA Research Entity (God Mode). Use maximal technical precision, academic rigor, and advanced abstractions.";
        parts.push(`### ROLE & EXPERTISE
        Adopt the persona of: ${role}. Match this level of depth and vocabulary.`);
    }

    // 3. Tone Shift (-5 to 5)
    if (settings.toneShift !== undefined && settings.toneShift !== 0) {
        const t = settings.toneShift;
        let tone = "Neutral";
        if (t <= -4) tone = "Extremely Serious, Clinical, Stoic, and Dry. No emotion.";
        else if (t <= -2) tone = "Formal, Professional, and Corporate.";
        else if (t >= 4) tone = "Highly Energetic, Enthusiastic, Emoji-rich, and Inspiring.";
        else if (t >= 2) tone = "Casual, Friendly, and Conversational.";
        parts.push(`### TONE & STYLE
        Target Tone: ${tone}`);
    }

    // 4. Output Verbosity (0.0 to 1.0)
    if (settings.outputVerbosity !== undefined) {
        const v = settings.outputVerbosity;
        let lengthInstr = "Balanced length.";
        if (v <= 0.2) lengthInstr = "EXTREME BREVITY. Use Haiku-like efficiency. High information density, zero fluff. Bullet points preferred.";
        else if (v <= 0.4) lengthInstr = "Concise. Get straight to the point.";
        else if (v >= 0.8) lengthInstr = "Comprehensive and Exhaustive. Leave no detail out. Expand on every concept deeply.";
        parts.push(`### VERBOSITY
        Constraint: ${lengthInstr}`);
    }

    // 5. Cognitive Features
    const cognitive: string[] = [];
    if (settings.lateralThinking) cognitive.push("- Lateral Thinking: Make unexpected connections and analogies.");
    if (settings.agentDebateMode) cognitive.push("- Debate Protocol: Internally evaluate thesis vs antithesis before outputting synthesis.");
    if (settings.agentReflection) cognitive.push("- Reflection: Critique your own output for errors before finalizing.");
    if (cognitive.length > 0) {
        parts.push(`### COGNITIVE PROTOCOLS\n${cognitive.join('\n')}`);
    }

    // 6. Formatting
    if (settings.forceMarkdown) {
        parts.push(`### FORMATTING
        Strictly use Markdown. Use Headers (H1-H3), Tables, Code Blocks, and Bold text for readability.`);
    }

    return parts.join('\n\n');
};

export interface ModelSettings {
    selectedModel: GeminiModel;
    temperature: number;
    topP: number;
    topK: number;
    frequencyPenalty: number;
    presencePenalty: number;
    maxOutputTokens: number;
    systemInstruction: string;
    systemInstructionFiles: UploadedFile[];
    stopSequences: string[];
    seed: number | null;
    thinkingBudget: number;
    useGoogleSearch: boolean;
    isStructuredOutputEnabled: boolean;
    responseSchema?: string;
    isCodeExecutionEnabled: boolean;
    isFunctionCallingEnabled: boolean;
    safetySettings: SafetySettings;
    isThinkingMode: boolean;
    // New Props SOTA v5.0
    toneShift?: number;
    outputVerbosity?: number;
    verificationLoop?: boolean;
    promptAutoRefine?: boolean;
    draftMode?: boolean;
    expertiseLevel?: number;
    forceMarkdown?: boolean;
    citationStyle?: string;
    lateralThinking?: boolean;
    memoryRecall?: boolean;
    useGoogleMaps?: boolean;
    agentMathMode?: boolean;
    agentDebateMode?: boolean;
    recursiveRefinement?: number;
    agentReflection?: boolean;
    agentPlanningMode?: boolean;
    searchRecency?: string;
    groundingThreshold?: number;
    // Audio
    responseModalities?: ('TEXT' | 'AUDIO' | 'IMAGE')[];
    speechConfig?: { voiceName: string };
    enableLogprobs?: boolean;
    topLogprobs?: number;
}

const buildConfig = (settings: ModelSettings, overrideJsonMode: boolean = false) => {
    const config: any = {};
    
    // Basic Params
    if (typeof settings.temperature === 'number') config.temperature = settings.temperature;
    if (typeof settings.topP === 'number') config.topP = settings.topP;
    if (typeof settings.topK === 'number') config.topK = Math.floor(settings.topK);
    if (typeof settings.frequencyPenalty === 'number') config.frequencyPenalty = settings.frequencyPenalty;
    if (typeof settings.presencePenalty === 'number') config.presencePenalty = settings.presencePenalty;
    
    // Output Limits
    if (settings.maxOutputTokens) config.maxOutputTokens = Math.floor(settings.maxOutputTokens);
    
    if (settings.stopSequences && settings.stopSequences.length > 0) config.stopSequences = settings.stopSequences;
    if (settings.seed !== null) config.seed = Math.floor(settings.seed);

    // Thinking Logic (Gemini 3/2.5)
    const isThinkingModel = settings.selectedModel.includes('gemini-3') || settings.selectedModel.includes('gemini-2.5');
    if (settings.isThinkingMode && settings.thinkingBudget > 0 && isThinkingModel) {
        config.thinkingConfig = { thinkingBudget: Math.floor(settings.thinkingBudget) };
        // Validar que maxOutputTokens sea mayor que thinkingBudget
        if (config.maxOutputTokens && config.maxOutputTokens <= config.thinkingConfig.thinkingBudget) {
             config.maxOutputTokens = config.thinkingConfig.thinkingBudget + 2048; // Ensure buffer
        }
    }

    // Tools
    const tools: any[] = [];
    if (settings.useGoogleSearch) tools.push({ googleSearch: {} });
    if (settings.isCodeExecutionEnabled) tools.push({ codeExecution: {} });
    if (tools.length > 0) config.tools = tools;

    // JSON Mode Logic
    // If overrideJsonMode is true (e.g. for text-based tools like Optimize/Expand), force undefined.
    // Otherwise respect user setting.
    if (!overrideJsonMode && settings.isStructuredOutputEnabled && !settings.useGoogleSearch) {
        config.responseMimeType = "application/json";
        if (settings.responseSchema) {
            try { config.responseSchema = JSON.parse(settings.responseSchema); } catch (e) {}
        }
    } else {
        // Explicitly undefined to ensure text output for generative tasks
        config.responseMimeType = undefined;
        config.responseSchema = undefined; 
    }

    // SOTA Context Injection into System Instruction
    const sotaInstruction = constructSotaSystemInstruction(settings);
    const userInstruction = settings.systemInstruction || "";
    
    // Combine SOTA directives with User directives
    config.systemInstruction = `${sotaInstruction}\n\n### USER DEFINED SYSTEM INSTRUCTION:\n${userInstruction}`;

    // Audio / Speech
    if (settings.responseModalities && settings.responseModalities.length > 0) {
        config.responseModalities = settings.responseModalities;
        if (settings.responseModalities.includes('AUDIO') && settings.speechConfig) {
            config.speechConfig = {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: settings.speechConfig.voiceName }
                }
            };
        }
    }

    // Logprobs
    if (settings.enableLogprobs) {
        config.responseLogprobs = true;
        if (settings.topLogprobs) {
            config.logprobs = settings.topLogprobs;
        }
    }

    return config;
};

// --- HELPER PARA EXTRAER USO Y SNAPSHOT ---
const extractUsage = (
    response: any, 
    model: string, 
    actionType: TokenUsage['actionType'],
    settings?: ModelSettings, 
    inputPreview?: string
): TokenUsage | undefined => {
    if (response && response.usageMetadata) {
        const usage = response.usageMetadata;
        
        let thinkingTokens = 0;
        if ((usage as any).candidatesTokensDetails?.thinkingTokenCount) {
            thinkingTokens = (usage as any).candidatesTokensDetails.thinkingTokenCount;
        } else if ((usage as any).candidatesTokenDetails?.thinkingTokenCount) {
            thinkingTokens = (usage as any).candidatesTokenDetails.thinkingTokenCount;
        }

        const snapshot: ConfigSnapshot | undefined = settings ? {
            temperature: settings.temperature,
            topP: settings.topP,
            topK: settings.topK,
            maxOutputTokens: settings.maxOutputTokens,
            thinkingBudget: settings.thinkingBudget,
            isThinkingMode: settings.isThinkingMode,
            useGoogleSearch: settings.useGoogleSearch,
            systemInstructionSnippet: settings.systemInstruction ? settings.systemInstruction.substring(0, 100) : undefined,
            voiceName: settings.speechConfig?.voiceName
        } : undefined;

        const outputText = response.text || '';

        return {
            promptTokens: usage.promptTokenCount || 0,
            candidatesTokens: usage.candidatesTokenCount || 0,
            thinkingTokens: thinkingTokens,
            totalTokens: usage.totalTokenCount || 0,
            cachedContentTokens: (usage as any).cachedContentTokenCount || 0,
            model: model,
            timestamp: Date.now(),
            actionType,
            snapshot,
            contextPreview: {
                inputSnippet: inputPreview ? inputPreview.substring(0, 200) : '',
                outputSnippet: outputText.substring(0, 200)
            }
        };
    }
    return undefined;
};

export const generateSessionTitle = async (text: string, model: GeminiModel = 'gemini-3-flash-preview'): Promise<{text: string}> => {
    if (!ai) return { text: "Sesión sin Título" };
    const fastModel = 'gemini-3-flash-preview'; 
    const prompt = `Tarea: Genera un TÍTULO corto (3-5 palabras) para este texto. Solo el título, sin comillas ni intro. Texto: "${text.substring(0, 500)}"`;

    try {
        const response = await ai.models.generateContent({
            model: resolveModel(fastModel),
            contents: prompt,
            config: { temperature: 0.3, maxOutputTokens: 20 }
        });
        return { text: (response.text || 'Nueva Sesión').trim() };
    } catch (e) {
        return { text: text.substring(0, 30) + (text.length > 30 ? '...' : '') };
    }
};

export const quickRefine = async (text: string, action: 'magic' | 'fix' | 'translate', settings: ModelSettings): Promise<{text: string, usage?: TokenUsage}> => {
    if (!ai) throw new Error("API Key no disponible");
    
    let instruction = "";
    switch (action) {
        case 'magic': instruction = "Goal: Elevate the writing. Make it clear, impactful, and professional while keeping the original intent."; break;
        case 'fix': instruction = "Goal: Strictly correct grammar, spelling, and punctuation. Do not change style."; break;
        case 'translate': instruction = "Goal: Translate accurately between English and Spanish, maintaining tone."; break;
    }

    const prompt = `${instruction}\n\n[INPUT TEXT START]\n"${text}"\n[INPUT TEXT END]`;

    // Force override JSON mode to ensure we get text back
    const config = buildConfig(settings, true);

    const response = await ai.models.generateContent({ 
        model: resolveModel(settings.selectedModel), 
        contents: prompt,
        config: config 
    });
    
    return { text: response.text || text, usage: extractUsage(response, settings.selectedModel, 'generation', settings, text) };
};

export const optimizePrompt = async (
    idea: string, 
    useCase: string, 
    framework: Framework, 
    files: UploadedFile[],
    optimizationStyle: string,
    targetAudience: string,
    outputLanguage: string,
    keyInfo: string,
    negativeConstraints: string,
    settings: ModelSettings
): Promise<{ text: string; thought?: string; sources: any[]; usage?: TokenUsage }> => {
  if (!ai) return { text: getErrorMessage("Optimizar Prompt"), sources: [] };
  
  const base64Files = files.filter(f => f.base64);
  
  let promptContent = `
  **TASK: PROMPT ENGINEERING OPTIMIZATION**
  
  Act as a World-Class Prompt Engineer. Apply the ${framework.name} (${framework.acronym}) framework to the user's idea.
  
  **INPUT DATA:**
  - Original Idea: "${idea}"
  - Use Case: ${useCase}
  - Optimization Style: ${optimizationStyle}
  ${targetAudience !== 'general' ? `- Target Audience: ${targetAudience}` : ''}
  ${outputLanguage !== 'es' ? `- Output Language: ${outputLanguage}` : ''}
  ${keyInfo ? `- Key Info to Include: ${keyInfo}` : ''}
  ${negativeConstraints ? `- Negative Constraints: ${negativeConstraints}` : ''}
  
  **FRAMEWORK INSTRUCTION:**
  ${framework.description}
  
  **OUTPUT INSTRUCTION:**
  Generate ONLY the optimized prompt. No preamble. Ensure the result is ready to use.
  `;

  const textPart = { text: promptContent };
  const fileParts = base64Files.map(fileToPart).filter(p => p.inlineData);
  
  // Force override JSON mode
  const config = buildConfig(settings, true);

  try {
    const response = await ai.models.generateContent({
      model: resolveModel(settings.selectedModel),
      contents: { parts: [textPart, ...fileParts] }, 
      config: config
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    let thought = "";
    // Thinking extraction logic depends on API version; simplified here
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if ((part as any).thought === true || (part as any).role === 'thought') thought += part.text;
    }

    const usage = extractUsage(response, settings.selectedModel, 'optimization', settings, idea);

    return { text: response.text || '', thought: thought || undefined, sources: sources, usage };

  } catch (error) {
    console.error("Optimize Error", error);
    throw new Error("Falló la comunicación con la API de Gemini.");
  }
};

export const expandIdea = async (
    idea: string, 
    files: UploadedFile[], 
    framework: Framework | null,
    settings: ModelSettings,
): Promise<{ text: string; usage?: TokenUsage }> => {
    if (!ai) return { text: getErrorMessage("Expandir Idea") };

    const availableFrameworksList = ALL_FRAMEWORKS_LIST.map(f => `- ${f.acronym}: ${f.name}`).join('\n');
    
    const textBasedFiles = files.filter(f => f.textContent);
    const contextFromFiles = textBasedFiles.map(f => `[CONTEXT FILE: ${f.name}]\n${f.textContent?.substring(0, 8000)}`).join('\n\n');

    const textPart = {
      text: `
        **TASK: CONTENT EXPANSION & ENRICHMENT**
        
        You are a Master Content Architect. Your goal is to take a seed idea and expand it into a fully realized, detailed, and professional artifact.
        
        **SEED IDEA:**
        "${idea}"
        
        ${contextFromFiles ? `**CONTEXT FILES:**\n${contextFromFiles}` : ''}

        **METHODOLOGY:**
        1. **Intent Analysis**: Understand the user's core goal.
        2. **Gap Filling**: Identify missing information and intelligently infer it based on best practices.
        3. **Structuring**: Use Markdown. Use Headers. Use Lists.
        
        ${framework 
            ? `**MANDATORY FRAMEWORK:** Apply ${framework.acronym} structure.`
            : `**AUTO-FRAMEWORK:** Select the best structure from this list: \n${availableFrameworksList.substring(0, 500)}...`
        }

        **OUTPUT:**
        Produce the FINAL expanded content. Ensure high density and value.
      `
    };
    
    // Force override JSON mode
    const config = buildConfig(settings, true);
    
    const modelToUse = resolveModel(settings.selectedModel);
    
    try {
        const response = await ai.models.generateContent({
            model: modelToUse, 
            contents: { parts: [textPart, ...files.map(fileToPart).filter(p => p.inlineData)] },
            config: config
        });
        
        const usage = extractUsage(response, modelToUse, 'expansion', settings, idea);
        return { text: response.text || '', usage };

    } catch (error) {
        console.error("Error en expansión:", error);
        throw new Error("La expansión ha fallado. Verifica tu conexión.");
    }
};

export const evaluatePromptQuality = async (promptText: string, model: GeminiModel): Promise<QualityAnalysisResult> => {
  if (!ai) throw new Error("API Key no disponible");
  
  const qualitySchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: { type: Type.NUMBER },
        clarity: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        completeness: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        safety: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        efficiency: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        specificity: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        actionability: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        potentialForBias: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        ethicalRisk: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        robustness: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        creativity: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        toneAndStyle: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        audienceDefinition: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        formatDefinition: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        taskComplexity: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        contextRichness: { type: Type.OBJECT, properties: { score: { type: Type.NUMBER }, feedback: { type: Type.STRING } } },
        overallFeedback: { type: Type.STRING }
    }
  };

  const prompt = `Analiza la calidad técnica del siguiente prompt para un LLM. Proporciona puntuaciones del 0 al 100 y feedback conciso.\n\nPrompt: "${promptText}"`;

  try {
    const result = await ai.models.generateContent({
      model: resolveModel(model),
      contents: prompt, 
      config: { 
          responseMimeType: "application/json",
          responseSchema: qualitySchema
      }
    });
    
    const parsed = JSON.parse(result.text || '{}') as QualityAnalysisResult;
    parsed.usage = extractUsage(result, model, 'analysis', undefined, promptText);
    return parsed;
  } catch (error) {
    throw new Error("Falló el análisis técnico de calidad.");
  }
};

export const suggestUseCase = async (idea: string, model: GeminiModel): Promise<{text: string, usage?: TokenUsage}> => {
    if (!ai) return { text: USE_CASES[0] };
    const prompt = `Basado en esta idea: "${idea}", sugiere la categoría de caso de uso más apropiada de esta lista: ${USE_CASES.join(', ')}. Responde solo con el nombre exacto de la categoría.`;
    const response = await ai.models.generateContent({ model: resolveModel(model), contents: prompt });
    return { text: response.text?.trim() || USE_CASES[0], usage: extractUsage(response, model, 'analysis', undefined, idea) };
};

export const suggestFramework = async (idea: string, model: GeminiModel): Promise<{text: string, usage?: TokenUsage}> => {
    if (!ai) return { text: FRAMEWORKS[0].acronym };
    const prompt = `Basado en esta idea: "${idea}", sugiere el acrónimo del framework de prompting más adecuado de esta lista: ${ALL_FRAMEWORKS_LIST.map(f => f.acronym).join(', ')}. Responde solo con el acrónimo.`;
    const response = await ai.models.generateContent({ model: resolveModel(model), contents: prompt });
    return { text: response.text?.trim() || FRAMEWORKS[0].acronym, usage: extractUsage(response, model, 'analysis', undefined, idea) };
};

export const generateContent = async (p: string, s: any): Promise<{text: string, thought?: string, usage?: TokenUsage}> => {
    if (!ai) return { text: "Error: API no configurada." };
    const response = await ai.models.generateContent({ model: resolveModel(s.selectedModel), contents: p, config: buildConfig(s) });
    
    let thought = "";
    const parts = response.candidates?.[0]?.content?.parts || [];
    for (const part of parts) {
      if ((part as any).thought === true) thought += part.text;
    }

    const usage = extractUsage(response, s.selectedModel, 'generation', s, p); 

    return { text: response.text || '', thought: thought || undefined, usage };
};

// ... Definitions for Length Modifier ...
export const LENGTH_MODIFIERS_CONFIG = {
    'shorter': { label: 'Más Corto', description: 'Condensar información', prompt: 'Reescribe el texto para que sea más breve y directo, eliminando redundancias.' },
    'longer': { label: 'Más Largo', description: 'Añadir detalle', prompt: 'Expande el texto añadiendo explicaciones detalladas, ejemplos y contexto adicional.' },
    'bullets': { label: 'Viñetas', description: 'Lista estructurada', prompt: 'Convierte el texto en una lista de viñetas clara y organizada.' },
    'simple': { label: 'Simplificar', description: 'Lenguaje sencillo', prompt: 'Reescribe el texto usando un lenguaje simple y fácil de entender (Nivel 5to grado).' },
    'formal': { label: 'Formal', description: 'Tono profesional', prompt: 'Reescribe el texto con un tono formal, profesional y corporativo.' },
    'casual': { label: 'Casual', description: 'Tono relajado', prompt: 'Reescribe el texto con un tono casual, amigable y conversacional.' }
} as const;

export type LengthModifier = keyof typeof LENGTH_MODIFIERS_CONFIG;

export const modifyContentLength = async (text: string, modifier: LengthModifier, model: GeminiModel): Promise<{text: string, usage?: TokenUsage}> => {
    if (!ai) throw new Error("API Key no disponible");
    
    const modifierConfig = LENGTH_MODIFIERS_CONFIG[modifier];
    const instruction = modifierConfig ? modifierConfig.prompt : "Modifica el siguiente texto:";
    const prompt = `${instruction}\n\n"${text}"`;

    const response = await ai.models.generateContent({ model: resolveModel(model), contents: prompt });
    return { text: response.text || text, usage: extractUsage(response, model, 'generation', undefined, text) };
};

export const generateMetaFramework = async (nicheProblem: string, model: GeminiModel): Promise<Framework> => {
    if (!ai) throw new Error("API Key no disponible");
    
    const prompt = `Inventa un framework de Prompt Engineering ÚNICO y NUEVO diseñado específicamente para resolver este problema de nicho: "${nicheProblem}".
    El framework debe tener un acrónimo memorable (4-6 letras).
    
    Responde en JSON con este esquema:
    {
      "id": "slug-unico",
      "acronym": "ACRONIMO",
      "name": "Nombre Completo del Framework",
      "description": "Descripción teórica breve",
      "category": "Meta-Framework",
      "example": {
        "title": "Ejemplo de uso",
        "prompt": "Un prompt de ejemplo aplicando este framework..."
      }
    }`;

    const response = await ai.models.generateContent({ 
        model: resolveModel(model), 
        contents: prompt, 
        config: { responseMimeType: "application/json" } 
    });
    const result = JSON.parse(response.text || '{}') as Framework;
    result.usage = extractUsage(response, model, 'generation', undefined, nicheProblem);
    return result;
};

export type FormatType = 'organize' | 'markdown' | 'json';

export const formatText = async (text: string, format: FormatType, model: GeminiModel) => {
    if (!ai) throw new Error("API Key no disponible");
    let instruction = "";
    switch (format) {
        case 'organize': instruction = "Organiza y estructura el siguiente texto de manera lógica con encabezados:"; break;
        case 'markdown': instruction = "Convierte el siguiente texto a formato Markdown limpio:"; break;
        case 'json': instruction = "Convierte el contenido del siguiente texto a una estructura JSON válida:"; break;
    }
    const prompt = `${instruction}\n\n"${text}"`;
    const response = await ai.models.generateContent({model: resolveModel(model), contents: prompt});
    return { text: response.text || text, usage: extractUsage(response, model, 'generation', undefined, text) };
}

export const generateRandomIdea = async (model: GeminiModel) => {
    const response = await ai!.models.generateContent({model: resolveModel(model), contents: 'Genera una idea creativa, única y específica para un prompt de IA útil. Solo la idea, sin introducción.'});
    return { text: response.text || '', usage: extractUsage(response, model, 'generation') };
}

export const evaluateIdeaQuality = async (idea: string, model: GeminiModel, maxTokens: number) => {
    const prompt = `Evalúa la siguiente idea para un prompt. Dame 3 puntos fuertes y 1 debilidad. Sé breve.\nIdea: "${idea}"`;
    const response = await ai!.models.generateContent({model: resolveModel(model), contents: prompt, config: { maxOutputTokens: maxTokens }});
    return { text: response.text || '', usage: extractUsage(response, model, 'analysis', undefined, idea) };
}

export const suggestRelatedIdeas = async (idea: string, files: any[], model: GeminiModel, maxTokens: number) => {
    const prompt = `Basado en la idea: "${idea}", sugiere 3 ideas alternativas o relacionadas que podrían ser interesantes de explorar.`;
    const response = await ai!.models.generateContent({model: resolveModel(model), contents: prompt, config: { maxOutputTokens: maxTokens }});
    return { text: response.text || '', usage: extractUsage(response, model, 'generation', undefined, idea) };
}

export const extractKeyEntities = async (idea: string, files: any[], model: GeminiModel, maxTokens: number) => {
    const prompt = `Extrae las entidades clave (personas, lugares, conceptos técnicos) del siguiente texto en una lista separada por comas:\n"${idea}"`;
    const response = await ai!.models.generateContent({model: resolveModel(model), contents: prompt, config: { maxOutputTokens: maxTokens }});
    return { text: response.text || '', usage: extractUsage(response, model, 'analysis', undefined, idea) };
}

export const generateTitles = async (idea: string, model: GeminiModel, maxTokens: number) => {
    const prompt = `Genera 5 títulos atractivos y cortos para esta idea:\n"${idea}"`;
    const response = await ai!.models.generateContent({model: resolveModel(model), contents: prompt, config: { maxOutputTokens: maxTokens }});
    return { text: response.text || '', usage: extractUsage(response, model, 'generation', undefined, idea) };
}

export const summarizeContext = async (idea: string, files: any[], model: GeminiModel, maxTokens: number) => {
    const prompt = `Resume el siguiente texto en un párrafo conciso:\n"${idea}"`;
    const response = await ai!.models.generateContent({model: resolveModel(model), contents: prompt, config: { maxOutputTokens: maxTokens }});
    return { text: response.text || '', usage: extractUsage(response, model, 'analysis', undefined, idea) };
}

export const performDeepResearch = async (model: GeminiModel): Promise<Framework[]> => {
    if (!ai) return [];
    
    const prompt = `Busca en la web (simulado) los 3 frameworks de Prompt Engineering o Agentes de IA más novedosos y técnicos publicados en 2024 o 2025 (papers de arXiv, posts de ingeniería).
    Devuelve un JSON con una lista de objetos Framework:
    [{ "id": "...", "acronym": "...", "name": "...", "description": "...", "category": "Deep Research", "source": { "name": "...", "url": "..." } }]`;

    const response = await ai.models.generateContent({ 
        model: resolveModel(model), 
        contents: prompt, 
        config: { 
            responseMimeType: "application/json", 
            tools: [{googleSearch: {}}] 
        } 
    });
    
    const frameworks = JSON.parse(response.text || '[]') as Framework[];
    const usage = extractUsage(response, model, 'analysis');
    
    if (frameworks.length > 0 && usage) { frameworks[0].usage = usage; }
    return frameworks;
};

export const evolvePrompt = async (currentPrompt: string, settings: ModelSettings) => {
    const metaPrompt = `Actúa como un optimizador de prompts experto.
    Analiza el siguiente prompt y mejóralo aplicando técnicas avanzadas (CoT, delimitadores, especificidad).
    Devuelve SOLO el prompt mejorado.
    
    Prompt Original:
    "${currentPrompt}"`;

    const config = buildConfig(settings, true);
    const response = await ai!.models.generateContent({ model: resolveModel(settings.selectedModel), contents: metaPrompt, config: config });
    return { text: (response.text || '').trim(), usage: extractUsage(response, settings.selectedModel, 'optimization', settings, currentPrompt) };
}

export const critiqueResponse = async (p: string, r: string, model: GeminiModel) => {
    const prompt = `Critica la siguiente respuesta de IA para el prompt dado.
    Prompt: "${p}"
    Respuesta: "${r}"
    
    Evalúa del 1 al 10. Provee pros, contras y una sugerencia de mejora.
    Responde en JSON: { "score": number, "pros": string[], "cons": string[], "suggestion": string }`;

    const response = await ai!.models.generateContent({ model: resolveModel(model), contents: prompt, config: { responseMimeType: "application/json" } });
    const parsed = JSON.parse(response.text || '{}') as CritiqueResult;
    parsed.usage = extractUsage(response, model, 'analysis', undefined, p);
    return parsed;
}

export const summarizeChanges = async (prev: string, current: string, model: GeminiModel) => {
    const prompt = `Resume en una frase muy corta (max 10 palabras) qué cambió entre estas dos versiones del prompt.
    V1: "${prev}"
    V2: "${current}"`;
    const response = await ai!.models.generateContent({ model: resolveModel(model), contents: prompt });
    return (response.text || '').trim();
}

export const improvePromptBasedOnAnalysis = async (t: string, a: any, m: string) => {
    const prompt = `Mejora el siguiente prompt basándote en este análisis de calidad:
    Prompt: "${t}"
    Análisis: ${JSON.stringify(a)}
    
    Aplica las mejoras sugeridas y devuelve SOLO el prompt mejorado.`;

    const response = await ai!.models.generateContent({ model: resolveModel(m), contents: prompt });
    return { text: (response.text || '').trim(), usage: extractUsage(response, m, 'optimization', undefined, t) };
}

export const generateStream = async (p: string, s: any) => {
    return await ai!.models.generateContentStream({ model: resolveModel(s.selectedModel), contents: p, config: buildConfig(s) });
}
