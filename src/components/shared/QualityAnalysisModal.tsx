
import React, { useEffect, useRef, useMemo } from 'react';
import { QualityAnalysisResult } from '../../types';
import { XMarkIcon, SparklesIcon, ShieldCheckIcon, BeakerIcon, LightBulbIcon, ScaleIcon, AcademicCapIcon, CheckIcon } from './Icons.tsx';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface QualityAnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    isLoading: boolean;
    result: QualityAnalysisResult | null;
    error: string | null;
    promptText: string | null;
    onImprovePrompt: () => void;
    isImproving: boolean;
}

const getScoreColor = (score: number, alpha = 1) => {
    if (score < 40) return `rgba(239, 68, 68, ${alpha})`; // red-500
    if (score < 75) return `rgba(250, 204, 21, ${alpha})`; // yellow-400
    return `rgba(45, 212, 191, ${alpha})`; // teal-400
};

// Robust score access helper to prevent crashes
const getScore = (metric: any) => {
    if (metric && typeof metric.score === 'number') return metric.score;
    return 0;
};

const MetricRow: React.FC<{ label: string; score: number; feedback: string }> = ({ label, score, feedback }) => (
    <div className="group flex flex-col gap-1 p-2 rounded-lg hover:bg-white/5 transition-colors">
        <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-gray-400 group-hover:text-gray-200 transition-colors">{label}</span>
            <div className="flex items-center gap-2">
                <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                    <div className="h-full transition-all duration-1000" style={{ width: `${score}%`, backgroundColor: getScoreColor(score) }}></div>
                </div>
                <span className="text-xs font-bold font-mono" style={{ color: getScoreColor(score) }}>{score}%</span>
            </div>
        </div>
        <p className="text-[10px] text-gray-500 leading-tight line-clamp-1 group-hover:line-clamp-none transition-all">{feedback || 'Sin feedback disponible.'}</p>
    </div>
);

const CategoryCard: React.FC<{ title: string; icon: React.ReactNode; colorClass: string; children: React.ReactNode }> = ({ title, icon, colorClass, children }) => (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 shadow-inner">
        <div className="flex items-center gap-2 border-b border-white/5 pb-2 mb-1">
            <div className={`p-1.5 rounded-lg ${colorClass} bg-opacity-10`}>{icon}</div>
            <h4 className="text-xs font-black uppercase tracking-widest text-gray-200">{title}</h4>
        </div>
        <div className="flex flex-col gap-1">
            {children}
        </div>
    </div>
);

const QualityAnalysisModal: React.FC<QualityAnalysisModalProps> = ({ isOpen, onClose, isLoading, result, error, promptText, onImprovePrompt, isImproving }) => {
    const chartsRef = useRef<{ [key: string]: Chart | null }>({});
    const scoreChartRef = useRef<HTMLCanvasElement>(null);
    const radarChartRef = useRef<HTMLCanvasElement>(null);
    const riskGaugeChartRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        
        Object.keys(chartsRef.current).forEach((key) => {
            chartsRef.current[key]?.destroy();
        });
        chartsRef.current = {};

        if (!result) return;
        
        // --- 1. Overall Score Doughnut ---
        const scoreCtx = scoreChartRef.current?.getContext('2d');
        if (scoreCtx) {
            chartsRef.current.score = new Chart(scoreCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [result.overallScore || 0, 100 - (result.overallScore || 0)],
                        backgroundColor: [getScoreColor(result.overallScore || 0), 'rgba(255, 255, 255, 0.05)'],
                        borderColor: 'transparent',
                        borderWidth: 0,
                        circumference: 240,
                        rotation: 240,
                        cutout: '85%',
                        borderRadius: 20
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }
            });
        }

        // --- 2. Radar Chart ---
        const radarCtx = radarChartRef.current?.getContext('2d');
        if (radarCtx) {
            chartsRef.current.radar = new Chart(radarCtx, {
                type: 'radar',
                data: {
                    labels: ['Instrucción', 'Fiabilidad', 'Creatividad', 'Eficiencia'],
                    datasets: [{
                        data: [
                            (getScore(result.clarity) + getScore(result.specificity) + getScore(result.completeness)) / 3,
                            (getScore(result.safety) + getScore(result.robustness) + getScore(result.potentialForBias)) / 3,
                            (getScore(result.creativity) + getScore(result.toneAndStyle) + getScore(result.contextRichness)) / 3,
                            (getScore(result.efficiency) + getScore(result.actionability) + (100 - getScore(result.taskComplexity))) / 3
                        ],
                        backgroundColor: 'rgba(45, 212, 191, 0.1)',
                        borderColor: 'rgba(45, 212, 191, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(45, 212, 191, 1)',
                        pointBorderColor: '#fff',
                        pointRadius: 4,
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            pointLabels: { color: '#94a3b8', font: { size: 10, weight: 'bold' } },
                            ticks: { display: false },
                            min: 0, max: 100
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        }

        // --- 3. Risk Gauge ---
        const riskCtx = riskGaugeChartRef.current?.getContext('2d');
        const riskScore = 100 - ((getScore(result.safety) + getScore(result.robustness)) / 2);
        if (riskCtx) {
            chartsRef.current.risk = new Chart(riskCtx, {
                type: 'doughnut',
                data: {
                    datasets: [{
                        data: [riskScore, 100 - riskScore],
                        backgroundColor: [riskScore > 50 ? 'rgba(239, 68, 68, 1)' : 'rgba(129, 140, 248, 1)', 'rgba(255, 255, 255, 0.05)'],
                        borderColor: 'transparent',
                        circumference: 180,
                        rotation: 270,
                        cutout: '80%',
                        borderRadius: 10
                    }]
                },
                options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { enabled: false } } }
            });
        }
        
    }, [isOpen, result]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true">
            <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.8)] w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden ring-1 ring-white/5">
                
                {/* Header Industrial */}
                <header className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-pink-500/20">
                            <AcademicCapIcon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-100 tracking-tighter uppercase italic">Auditoría Técnica</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Protocolo Dec 2025 // Gemini Analysis</p>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white">
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                </header>

                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                    
                    {/* Panel Izquierdo: Resumen Ejecutivo */}
                    <aside className="w-full lg:w-80 border-r border-white/5 bg-black/20 p-6 flex flex-col gap-8 overflow-y-auto custom-scrollbar">
                        
                        {/* Overall Score Large */}
                        <div className="relative flex flex-col items-center">
                            <div className="w-48 h-48">
                                <canvas ref={scoreChartRef}></canvas>
                            </div>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                                <span className="text-6xl font-black font-mono tracking-tighter" style={{ color: getScoreColor(result?.overallScore || 0) }}>
                                    {result?.overallScore || 0}
                                </span>
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Global Score</span>
                            </div>
                        </div>

                        {/* Radar Chart Summary */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 text-center">Perfil Semántico</h5>
                            <div className="h-40">
                                <canvas ref={radarChartRef}></canvas>
                            </div>
                        </div>

                        {/* Risk Indicator */}
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 flex flex-col items-center">
                            <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Potencial de Derivación (Riesgo)</h5>
                            <div className="w-full h-24 relative">
                                <canvas ref={riskGaugeChartRef}></canvas>
                                <div className="absolute inset-0 flex items-end justify-center pb-2">
                                    <span className="text-2xl font-black font-mono text-gray-200">
                                        {result ? (100 - ((getScore(result.safety) + getScore(result.robustness)) / 2)).toFixed(0) : 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Panel Derecho: Desglose por Categorías */}
                    <main className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/10">
                        {isLoading ? (
                            <div className="h-full flex flex-col items-center justify-center gap-6">
                                <div className="relative">
                                    <div className="w-20 h-20 border-4 border-white/5 rounded-full animate-spin border-t-pink-500"></div>
                                    <SparklesIcon className="w-8 h-8 text-pink-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                                </div>
                                <p className="text-gray-400 font-bold uppercase tracking-[0.3em] text-xs animate-pulse">Deconstruyendo Semántica...</p>
                            </div>
                        ) : error ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-10">
                                <div className="p-5 bg-red-500/10 rounded-full mb-4">
                                    <XMarkIcon className="w-12 h-12 text-red-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Error Crítico de Auditoría</h3>
                                <p className="text-gray-500 max-w-sm">{error}</p>
                                <button onClick={onClose} className="mt-6 glass-button px-8 py-3 rounded-xl font-black uppercase text-xs">Cerrar Protocolo</button>
                            </div>
                        ) : result && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up">
                                
                                {/* 1. CATEGORÍA INSTRUCCIONAL */}
                                <CategoryCard title="Arquitectura Instruccional" icon={<LightBulbIcon className="w-4 h-4" />} colorClass="text-teal-400">
                                    <MetricRow label="Claridad Semántica" score={getScore(result.clarity)} feedback={result.clarity?.feedback} />
                                    <MetricRow label="Especificidad Técnica" score={getScore(result.specificity)} feedback={result.specificity?.feedback} />
                                    <MetricRow label="Completitud de Contexto" score={getScore(result.completeness)} feedback={result.completeness?.feedback} />
                                    <MetricRow label="Definición de Audiencia" score={getScore(result.audienceDefinition)} feedback={result.audienceDefinition?.feedback} />
                                </CategoryCard>

                                {/* 2. CATEGORÍA FIABILIDAD */}
                                <CategoryCard title="Fiabilidad y Seguridad" icon={<ShieldCheckIcon className="w-4 h-4" />} colorClass="text-indigo-400">
                                    <MetricRow label="Protocolos de Seguridad" score={getScore(result.safety)} feedback={result.safety?.feedback} />
                                    <MetricRow label="Robustez (Anti-Prompt Injection)" score={getScore(result.robustness)} feedback={result.robustness?.feedback} />
                                    <MetricRow label="Sesgo Algorítmico" score={getScore(result.potentialForBias)} feedback={result.potentialForBias?.feedback} />
                                    <MetricRow label="Riesgo Ético" score={getScore(result.ethicalRisk)} feedback={result.ethicalRisk?.feedback} />
                                </CategoryCard>

                                {/* 3. CATEGORÍA CREATIVIDAD/CONTEXTO */}
                                <CategoryCard title="Voz y Creatividad" icon={<BeakerIcon className="w-4 h-4" />} colorClass="text-pink-400">
                                    <MetricRow label="Riqueza de Contexto" score={getScore(result.contextRichness)} feedback={result.contextRichness?.feedback} />
                                    <MetricRow label="Índice de Creatividad" score={getScore(result.creativity)} feedback={result.creativity?.feedback} />
                                    <MetricRow label="Alineación de Tono" score={getScore(result.toneAndStyle)} feedback={result.toneAndStyle?.feedback} />
                                    <MetricRow label="Definición de Formato" score={getScore(result.formatDefinition)} feedback={result.formatDefinition?.feedback} />
                                </CategoryCard>

                                {/* 4. CATEGORÍA EFICIENCIA */}
                                <CategoryCard title="Eficiencia Operativa" icon={<ScaleIcon className="w-4 h-4" />} colorClass="text-orange-400">
                                    <MetricRow label="Uso de Tokens (Eficiencia)" score={getScore(result.efficiency)} feedback={result.efficiency?.feedback} />
                                    <MetricRow label="Accionabilidad Inmediata" score={getScore(result.actionability)} feedback={result.actionability?.feedback} />
                                    <MetricRow label="Complejidad Cognitiva" score={getScore(result.taskComplexity)} feedback={result.taskComplexity?.feedback} />
                                </CategoryCard>

                                {/* Recomendación Principal Full-Width */}
                                <div className="col-span-full mt-4 bg-teal-500/10 border border-teal-500/30 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6 shadow-[0_10px_30px_-5px_rgba(45,212,191,0.2)]">
                                    <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center flex-shrink-0 animate-bounce">
                                        <CheckIcon className="w-10 h-10 text-slate-900" />
                                    </div>
                                    <div className="text-center md:text-left">
                                        <h4 className="text-teal-400 font-black uppercase tracking-widest text-xs mb-1">Recomendación Prioritaria</h4>
                                        <p className="text-gray-100 text-lg font-medium leading-tight">"{result.overallFeedback}"</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {/* Footer con Acción Principal */}
                <footer className="p-6 border-t border-white/10 bg-white/5 flex flex-wrap justify-between items-center gap-4">
                    <div className="hidden sm:block">
                        <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">© Prompt Lab Audit Engine // Release 3.1.2</p>
                    </div>
                    <div className="flex gap-3 w-full sm:w-auto">
                        <button onClick={onClose} disabled={isImproving} className="flex-1 sm:flex-none glass-button px-8 py-3 rounded-xl font-bold text-gray-400 hover:text-white text-sm transition-all border border-white/10">
                            Cerrar
                        </button>
                        {result && (
                            <button 
                                onClick={onImprovePrompt}
                                disabled={isImproving || !result}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-3 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-black px-10 py-3 rounded-xl hover:shadow-[0_0_30px_rgba(45,212,191,0.5)] transition-all duration-500 disabled:opacity-30 disabled:cursor-not-allowed transform active:scale-95 text-sm uppercase tracking-tighter italic"
                            >
                                <SparklesIcon className="w-5 h-5 text-white animate-pulse" />
                                {isImproving ? 'Ejecutando Mejoras...' : 'Mejorar Prompt con IA'}
                            </button>
                        )}
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default QualityAnalysisModal;
