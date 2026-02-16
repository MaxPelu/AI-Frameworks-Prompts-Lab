
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import { TokenUsage } from '../../types/index.ts';
import { 
    XMarkIcon, 
    ChartBarIcon, 
    SparklesIcon, 
    ArrowDownTrayIcon, 
    TableCellsIcon, 
    DocumentTextIcon, 
    BeakerIcon,
    ScaleIcon
} from '../shared/Icons.tsx';

Chart.register(...registerables);

interface TokenUsageDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    history: TokenUsage[];
}

// --- PRICING CONSTANTS (Est. per 1M tokens) ---
// Note: These are approximate public rates for estimation purposes
const PRICING_MAP: Record<string, { in: number, out: number }> = {
    'gemini-3-pro': { in: 1.25, out: 5.00 }, // Est. Pro Tier
    'gemini-3-flash': { in: 0.075, out: 0.30 }, // Est. Flash Tier
    'gemini-2.5-pro': { in: 1.25, out: 5.00 },
    'gemini-2.5-flash': { in: 0.075, out: 0.30 },
    'gemma': { in: 0, out: 0 }, // Open weights usually hosted, treat as 0 or low cost
    'default': { in: 0.50, out: 1.50 }
};

const calculateCost = (entry: TokenUsage) => {
    const modelKey = Object.keys(PRICING_MAP).find(k => entry.model.includes(k)) || 'default';
    const rates = PRICING_MAP[modelKey];
    const inputCost = (entry.promptTokens / 1_000_000) * rates.in;
    const outputCost = (entry.candidatesTokens / 1_000_000) * rates.out;
    return inputCost + outputCost;
};

const StatCard: React.FC<{ label: string; value: string | number; sub?: string; color: string; icon?: React.ReactNode }> = ({ label, value, sub, color, icon }) => (
    <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all shadow-lg">
        <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity ${color.replace('bg-', 'text-')}`}>
            {icon || <ChartBarIcon className="w-12 h-12" />}
        </div>
        <div>
            <span className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-1 block">{label}</span>
            <span className="text-2xl md:text-3xl font-black text-gray-100 group-hover:scale-105 transition-transform duration-300 block">{value}</span>
        </div>
        {sub && (
            <div className="mt-2 flex items-center gap-1.5">
                <div className={`w-1.5 h-1.5 rounded-full ${color}`}></div>
                <span className="text-[10px] text-gray-400 font-mono">{sub}</span>
            </div>
        )}
    </div>
);

const TokenUsageDashboard: React.FC<TokenUsageDashboardProps> = ({ isOpen, onClose, history }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'logs'>('overview');
    const chartRefs = useRef<{ [key: string]: HTMLCanvasElement | null }>({});
    const chartInstances = useRef<{ [key: string]: Chart | null }>({});

    // --- AGGREGATION LOGIC ---
    const stats = useMemo(() => {
        const totalInput = history.reduce((acc, curr) => acc + curr.promptTokens, 0);
        const totalOutput = history.reduce((acc, curr) => acc + curr.candidatesTokens, 0);
        const totalThinking = history.reduce((acc, curr) => acc + (curr.thinkingTokens || 0), 0);
        const totalCached = history.reduce((acc, curr) => acc + (curr.cachedContentTokens || 0), 0);
        const totalCost = history.reduce((acc, curr) => acc + calculateCost(curr), 0);
        
        // Cache Hit Rate formula: Cached / (Prompt + Cached) * 100
        const cacheHitRate = (totalInput + totalCached) > 0 
            ? (totalCached / (totalInput + totalCached)) * 100 
            : 0;

        return {
            totalTokens: totalInput + totalOutput,
            input: totalInput,
            output: totalOutput,
            thinking: totalThinking,
            cached: totalCached,
            cost: totalCost,
            cacheHitRate,
            count: history.length
        };
    }, [history]);

    // --- EXPORT FUNCTIONS ---
    const handleDownloadCSV = () => {
        const headers = ['Timestamp', 'Model', 'Action', 'Prompt Tokens', 'Thinking Tokens', 'Output Tokens', 'Cached Tokens', 'Total Tokens', 'Est. Cost ($)'];
        const csvRows = [headers.join(',')];

        history.forEach(row => {
            const date = new Date(row.timestamp).toISOString();
            const cost = calculateCost(row).toFixed(6);
            csvRows.push([
                date,
                row.model,
                row.actionType,
                row.promptTokens,
                row.thinkingTokens || 0,
                row.candidatesTokens,
                row.cachedContentTokens || 0,
                row.totalTokens,
                cost
            ].join(','));
        });

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `token_report_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    const handleDownloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history, null, 2));
        const a = document.createElement('a');
        a.href = dataStr;
        a.download = `token_logs_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    // --- CHART EFFECTS ---
    useEffect(() => {
        if (!isOpen) return;

        // Destroy previous instances
        Object.values(chartInstances.current).forEach((chart) => {
            const chartInstance = chart as Chart | null;
            chartInstance?.destroy();
        });

        if (activeTab === 'overview') {
            // 1. Overview Pie Chart
            const pieCtx = chartRefs.current['pie']?.getContext('2d');
            if (pieCtx) {
                chartInstances.current['pie'] = new Chart(pieCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Input', 'Thinking', 'Pure Output', 'Cached'],
                        datasets: [{
                            data: [stats.input, stats.thinking, stats.output - stats.thinking, stats.cached],
                            backgroundColor: ['#2dd4bf', '#818cf8', '#c084fc', '#fbbf24'],
                            borderWidth: 0,
                            hoverOffset: 10
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { position: 'right', labels: { color: '#94a3b8', font: { family: 'Inter', size: 11 } } } },
                        cutout: '75%'
                    }
                });
            }

            // 2. Velocity Line Chart
            const lineCtx = chartRefs.current['line']?.getContext('2d');
            if (lineCtx) {
                const chrono = [...history].sort((a,b) => a.timestamp - b.timestamp).slice(-20); // Last 20
                chartInstances.current['line'] = new Chart(lineCtx, {
                    type: 'line',
                    data: {
                        labels: chrono.map((_, i) => `#${i+1}`),
                        datasets: [{
                            label: 'Total Tokens',
                            data: chrono.map(h => h.totalTokens),
                            borderColor: '#2dd4bf',
                            backgroundColor: 'rgba(45, 212, 191, 0.1)',
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { grid: { display: false }, ticks: { color: '#64748b' } },
                            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
                        },
                        plugins: { legend: { display: false } }
                    }
                });
            }
        }

        if (activeTab === 'models') {
            // 3. Model Breakdown Bar Chart
            const barCtx = chartRefs.current['bar']?.getContext('2d');
            if (barCtx) {
                // Group by model
                const modelGroups = history.reduce((acc, curr) => {
                    const m = curr.model;
                    if (!acc[m]) acc[m] = { input: 0, output: 0 };
                    acc[m].input += curr.promptTokens;
                    acc[m].output += curr.candidatesTokens;
                    return acc;
                }, {} as Record<string, {input: number, output: number}>);

                const labels = Object.keys(modelGroups);
                
                chartInstances.current['bar'] = new Chart(barCtx, {
                    type: 'bar',
                    data: {
                        labels: labels.map(l => l.replace('gemini-', '').replace('-preview', '')),
                        datasets: [
                            {
                                label: 'Input Tokens',
                                data: labels.map(l => modelGroups[l].input),
                                backgroundColor: '#2dd4bf',
                                borderRadius: 4,
                            },
                            {
                                label: 'Output Tokens',
                                data: labels.map(l => modelGroups[l].output),
                                backgroundColor: '#c084fc',
                                borderRadius: 4,
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: { stacked: true, grid: { display: false }, ticks: { color: '#94a3b8' } },
                            y: { stacked: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b' } }
                        },
                        plugins: { legend: { position: 'top', labels: { color: '#cbd5e1' } } }
                    }
                });
            }
        }

    }, [isOpen, history, activeTab, stats]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-white/10 rounded-[2rem] shadow-[0_0_100px_rgba(45,212,191,0.15)] w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden ring-1 ring-white/5">
                
                {/* --- HEADER --- */}
                <header className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-md flex flex-wrap justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                            <ChartBarIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-100 tracking-tighter uppercase italic">Tokenomics Lab</h2>
                            <div className="flex items-center gap-3 mt-1">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border border-teal-500/30 bg-teal-500/10 text-teal-400`}>
                                    LIVE METRICS
                                </span>
                                <span className="text-gray-500 text-xs font-mono">{new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-800 p-1 rounded-xl border border-white/5">
                            <button 
                                onClick={() => setActiveTab('overview')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'overview' ? 'bg-teal-500 text-slate-900 shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Overview
                            </button>
                            <button 
                                onClick={() => setActiveTab('models')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'models' ? 'bg-teal-500 text-slate-900 shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Modelos
                            </button>
                            <button 
                                onClick={() => setActiveTab('logs')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'logs' ? 'bg-teal-500 text-slate-900 shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Logs
                            </button>
                        </div>
                        <div className="h-8 w-px bg-white/10 mx-2 hidden sm:block"></div>
                        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white border border-transparent hover:border-white/10">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gradient-to-b from-slate-900 to-slate-950">
                    
                    {/* --- KPI CARDS ROW --- */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <StatCard 
                            label="Costo Estimado" 
                            value={`$${stats.cost.toFixed(4)}`} 
                            sub="Basado en tarifas públicas" 
                            color="bg-emerald-500" 
                            icon={<ScaleIcon className="w-12 h-12" />}
                        />
                        <StatCard 
                            label="Tokens Totales" 
                            value={stats.totalTokens.toLocaleString()} 
                            sub={`${history.length} Peticiones`} 
                            color="bg-blue-500" 
                            icon={<ChartBarIcon className="w-12 h-12" />}
                        />
                        <StatCard 
                            label="Thinking Budget" 
                            value={stats.thinking.toLocaleString()} 
                            sub="Tokens de Razonamiento" 
                            color="bg-indigo-500" 
                            icon={<SparklesIcon className="w-12 h-12" />}
                        />
                        <StatCard 
                            label="Eficiencia Caché" 
                            value={`${stats.cacheHitRate.toFixed(1)}%`} 
                            sub={`${stats.cached.toLocaleString()} Tokens Ahorrados`} 
                            color="bg-yellow-500" 
                            icon={<ArrowDownTrayIcon className="w-12 h-12" />}
                        />
                    </div>

                    {/* --- TAB CONTENT --- */}
                    
                    {/* 1. OVERVIEW TAB */}
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up">
                            <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Distribución de Carga</h3>
                                <div className="flex-1 relative min-h-[250px]">
                                    <canvas ref={el => chartRefs.current['pie'] = el}></canvas>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-2">
                                        <span className="text-3xl font-black text-white">{history.length}</span>
                                        <span className="text-[9px] text-gray-500 font-bold uppercase">Reqs</span>
                                    </div>
                                </div>
                            </div>
                            <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/5 flex flex-col">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6">Velocidad de Consumo (Últimas 20 Peticiones)</h3>
                                <div className="flex-1 min-h-[250px]">
                                    <canvas ref={el => chartRefs.current['line'] = el}></canvas>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. MODELS TAB */}
                    {activeTab === 'models' && (
                        <div className="glass-panel p-6 rounded-3xl border border-white/5 flex flex-col h-[500px] animate-fade-in-up">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Comparativa por Modelo</h3>
                                <p className="text-xs text-gray-500">Input vs Output Stacked</p>
                            </div>
                            <div className="flex-1 relative w-full">
                                <canvas ref={el => chartRefs.current['bar'] = el}></canvas>
                            </div>
                        </div>
                    )}

                    {/* 3. LOGS TAB */}
                    {activeTab === 'logs' && (
                        <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden flex flex-col animate-fade-in-up">
                            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                <h3 className="text-sm font-bold text-gray-300 uppercase tracking-widest flex items-center gap-2">
                                    <TableCellsIcon className="w-4 h-4 text-teal-400" />
                                    Registro Detallado
                                </h3>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleDownloadJSON}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <DocumentTextIcon className="w-3.5 h-3.5" /> JSON
                                    </button>
                                    <button 
                                        onClick={handleDownloadCSV}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-teal-500/20 text-xs text-teal-400 hover:bg-teal-500/10 transition-all font-bold"
                                    >
                                        <ArrowDownTrayIcon className="w-3.5 h-3.5" /> CSV
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-black/40 text-[10px] uppercase font-bold text-gray-500">
                                        <tr>
                                            <th className="px-6 py-4">Modelo</th>
                                            <th className="px-6 py-4">Acción</th>
                                            <th className="px-6 py-4 text-right">Input</th>
                                            <th className="px-6 py-4 text-right text-indigo-400">Thinking</th>
                                            <th className="px-6 py-4 text-right">Output</th>
                                            <th className="px-6 py-4 text-right">Total</th>
                                            <th className="px-6 py-4 text-right text-emerald-400">Costo Est.</th>
                                            <th className="px-6 py-4 text-right">Hora</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-xs font-mono text-gray-300">
                                        {[...history].sort((a,b) => b.timestamp - a.timestamp).map((entry, idx) => (
                                            <tr key={idx} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${entry.model.includes('3') ? 'bg-purple-500' : entry.model.includes('flash') ? 'bg-teal-500' : 'bg-gray-500'}`}></div>
                                                        <span className="font-semibold text-white truncate max-w-[150px]" title={entry.model}>
                                                            {entry.model.replace('gemini-', '').replace('-preview', '')}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3">
                                                    <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase font-bold text-gray-400 group-hover:text-white group-hover:border-white/20 transition-all">
                                                        {entry.actionType}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 text-right text-gray-400">{entry.promptTokens}</td>
                                                <td className="px-6 py-3 text-right text-indigo-300 font-bold">{entry.thinkingTokens || '-'}</td>
                                                <td className="px-6 py-3 text-right text-purple-300">{entry.candidatesTokens}</td>
                                                <td className="px-6 py-3 text-right font-bold text-white">{entry.totalTokens}</td>
                                                <td className="px-6 py-3 text-right text-emerald-400">${calculateCost(entry).toFixed(5)}</td>
                                                <td className="px-6 py-3 text-right text-gray-500">{new Date(entry.timestamp).toLocaleTimeString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TokenUsageDashboard;
