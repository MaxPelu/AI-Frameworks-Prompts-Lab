
import React, { useState, useEffect } from 'react';
import { XMarkIcon, TableCellsIcon, CheckIcon, ArrowPathIcon } from '../shared/Icons.tsx';
import { BatchResult, BatchRow, GeminiModel, SafetySettings, UploadedFile } from '../../types/index.ts';
import { parseCSV, extractVariables, interpolatePrompt, exportToCSV } from '../../lib/batchUtils.ts';
import { generateContent, ModelSettings } from '../../lib/geminiService.ts';

interface BatchTestingModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialPrompt: string;
    // Model Settings
    selectedModel: GeminiModel;
    temperature: number;
    topP: number;
    topK: number;
    // Added missing frequencyPenalty property
    frequencyPenalty: number;
    // Added missing presencePenalty property
    presencePenalty: number;
    maxOutputTokens: number;
    systemInstruction: string;
    systemInstructionFiles: UploadedFile[];
    stopSequences: string[];
    seed: number | null;
    thinkingBudget: number;
    isThinkingMode: boolean;
    useGoogleSearch: boolean;
    isStructuredOutputEnabled: boolean;
    // Added responseSchema which is optional in ModelSettings but present in allModelSettings
    responseSchema: string;
    isCodeExecutionEnabled: boolean;
    isFunctionCallingEnabled: boolean;
    safetySettings: SafetySettings;
}

const BatchTestingModal: React.FC<BatchTestingModalProps> = ({ 
    isOpen, onClose, initialPrompt, 
    ...modelSettings 
}) => {
    const [prompt, setPrompt] = useState(initialPrompt);
    const [csvInput, setCsvInput] = useState('');
    const [detectedVariables, setDetectedVariables] = useState<string[]>([]);
    const [csvRows, setCsvRows] = useState<BatchRow[]>([]);
    const [results, setResults] = useState<BatchResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        setDetectedVariables(extractVariables(prompt));
    }, [prompt]);

    useEffect(() => {
        if (csvInput) {
            const parsed = parseCSV(csvInput);
            setCsvRows(parsed);
            // Initialize results with pending status
            setResults(parsed.map(row => ({
                rowId: row.id,
                variables: row,
                finalPrompt: '',
                output: '',
                status: 'pending'
            })));
        }
    }, [csvInput]);

    const handleRunBatch = async () => {
        setIsProcessing(true);
        setProgress(0);
        const total = results.length;

        for (let i = 0; i < total; i++) {
            const row = csvRows[i];
            const interpolated = interpolatePrompt(prompt, row);
            
            // Update status to loading
            setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'loading', finalPrompt: interpolated } : r));

            try {
                // We construct the settings object on the fly
                // FIX: Added missing frequencyPenalty, presencePenalty and responseSchema to match ModelSettings type
                const settings: ModelSettings = { 
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
                    responseSchema: modelSettings.responseSchema,
                    isCodeExecutionEnabled: modelSettings.isCodeExecutionEnabled,
                    isFunctionCallingEnabled: modelSettings.isFunctionCallingEnabled,
                    safetySettings: modelSettings.safetySettings,
                 };
                
                const output = await generateContent(interpolated, settings);
                
                setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'completed', output: output } : r));
            } catch (error: any) {
                setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error', output: 'Error', error: error.message } : r));
            }
            
            setProgress(((i + 1) / total) * 100);
            // Small delay to avoid aggressive rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        setIsProcessing(false);
    };

    const handleDownloadCsv = () => {
        const csvContent = exportToCSV(results, detectedVariables);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'batch_results.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-slate-700 bg-slate-800/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/20 rounded-lg">
                            <TableCellsIcon className="w-6 h-6 text-teal-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Batch Testing</h2>
                            <p className="text-sm text-gray-400">Ejecuta prompts masivos con variables dinámicas</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-slate-700 rounded-lg">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                    
                    {/* Left Panel: Configuration */}
                    <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-700 p-5 flex flex-col gap-6 bg-slate-900/30 overflow-y-auto">
                        
                        {/* Variable Editor */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Prompt con Variables</label>
                            <div className="relative">
                                <textarea 
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    className="w-full h-40 bg-slate-800 border border-slate-600 rounded-lg p-3 text-sm text-gray-200 focus:ring-2 focus:ring-teal-500 outline-none font-mono resize-none"
                                    placeholder="Escribe tu prompt aquí. Usa {{variable}} para insertar valores dinámicos."
                                />
                                <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-slate-900/80 px-2 py-1 rounded">
                                    {detectedVariables.length} variables detectadas
                                </div>
                            </div>
                            {detectedVariables.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {detectedVariables.map(v => (
                                        <span key={v} className="text-xs bg-teal-900/40 text-teal-300 px-2 py-1 rounded border border-teal-700/50 font-mono">
                                            {`{{${v}}}`}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* CSV Upload */}
                        <div className="flex-1 flex flex-col">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Datos CSV</label>
                            <textarea 
                                value={csvInput}
                                onChange={(e) => setCsvInput(e.target.value)}
                                className="flex-1 w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs text-gray-300 focus:ring-2 focus:ring-teal-500 outline-none font-mono resize-none"
                                placeholder={`Pega tu CSV aquí. Ej:\n${detectedVariables.length > 0 ? detectedVariables.join(',') : 'nombre,producto'}\nJuan,Café\nAna,Té`}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Asegúrate que los encabezados del CSV coincidan con los nombres de las variables.
                            </p>
                        </div>

                         <button 
                            onClick={handleRunBatch}
                            disabled={isProcessing || csvRows.length === 0}
                            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-teal-900/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                                    Procesando ({Math.round(progress)}%)...
                                </>
                            ) : (
                                <>
                                    <ArrowPathIcon className="w-5 h-5" />
                                    Ejecutar Lote ({csvRows.length} filas)
                                </>
                            )}
                        </button>
                    </div>

                    {/* Right Panel: Results */}
                    <div className="w-full lg:w-2/3 flex flex-col bg-slate-800">
                        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
                            <h3 className="font-bold text-gray-200">Resultados</h3>
                            {results.some(r => r.status === 'completed') && (
                                <button onClick={handleDownloadCsv} className="text-sm text-teal-400 hover:text-teal-300 flex items-center gap-1">
                                    <CheckIcon className="w-4 h-4" /> Descargar CSV
                                </button>
                            )}
                        </div>
                        
                        <div className="flex-1 overflow-auto p-4">
                            {results.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                    <TableCellsIcon className="w-16 h-16 mb-4" />
                                    <p>Carga datos y ejecuta el lote para ver los resultados aquí.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="sticky top-0 bg-slate-700 p-3 text-xs font-bold text-gray-300 uppercase tracking-wider rounded-tl-lg">Estado</th>
                                            {detectedVariables.map(v => (
                                                <th key={v} className="sticky top-0 bg-slate-700 p-3 text-xs font-bold text-gray-300 uppercase tracking-wider">{v}</th>
                                            ))}
                                            <th className="sticky top-0 bg-slate-700 p-3 text-xs font-bold text-gray-300 uppercase tracking-wider rounded-tr-lg w-1/2">Salida</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700">
                                        {results.map((row) => (
                                            <tr key={row.rowId} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="p-3 align-top">
                                                    {row.status === 'pending' && <span className="inline-block w-2 h-2 bg-gray-500 rounded-full" title="Pendiente"></span>}
                                                    {row.status === 'loading' && <ArrowPathIcon className="w-4 h-4 text-yellow-500 animate-spin" />}
                                                    {row.status === 'completed' && <CheckIcon className="w-4 h-4 text-green-500" />}
                                                    {row.status === 'error' && <span className="text-red-500 font-bold" title={row.error}>!</span>}
                                                </td>
                                                {detectedVariables.map(v => (
                                                    <td key={v} className="p-3 text-xs text-gray-300 align-top font-mono">{row.variables[v] || '-'}</td>
                                                ))}
                                                <td className="p-3 text-sm text-gray-200 align-top">
                                                    {row.status === 'completed' ? (
                                                        <div className="max-h-32 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600">
                                                            {row.output}
                                                        </div>
                                                    ) : row.status === 'error' ? (
                                                        <span className="text-red-400 text-xs">{row.error}</span>
                                                    ) : (
                                                        <span className="text-gray-600 italic text-xs">Esperando...</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BatchTestingModal;
