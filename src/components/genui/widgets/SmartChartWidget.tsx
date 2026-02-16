
import React, { useEffect, useRef, useState } from 'react';
import { Chart, registerables } from 'chart.js';
import { TableCellsIcon } from '../../shared/Icons.tsx';

Chart.register(...registerables);

interface SmartChartWidgetProps {
    data: any;
}

const SmartChartWidget: React.FC<SmartChartWidgetProps> = ({ data }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartInstanceRef = useRef<Chart | null>(null);
    const [chartType, setChartType] = useState<'bar' | 'line' | 'doughnut'>('bar');

    // Helper to infer data structure
    const processData = (rawData: any) => {
        let labels: string[] = [];
        let values: number[] = [];
        let label = 'Data';

        if (Array.isArray(rawData)) {
            // Case: [{"month": "Jan", "sales": 10}, ...]
            if (rawData.length > 0 && typeof rawData[0] === 'object') {
                const keys = Object.keys(rawData[0]);
                const labelKey = keys.find(k => typeof rawData[0][k] === 'string') || keys[0];
                const valueKey = keys.find(k => typeof rawData[0][k] === 'number') || keys[1];
                
                labels = rawData.map((item: any) => item[labelKey]);
                values = rawData.map((item: any) => item[valueKey]);
                label = valueKey;
            }
            // Case: Simple array [10, 20, 30]
            else if (rawData.length > 0 && typeof rawData[0] === 'number') {
                 labels = rawData.map((_, i) => `Item ${i + 1}`);
                 values = rawData;
            }
        } else if (typeof rawData === 'object') {
            // Case: {"Jan": 10, "Feb": 20}
            labels = Object.keys(rawData);
            values = Object.values(rawData) as number[];
        }
        return { labels, values, label };
    };

    useEffect(() => {
        if (!canvasRef.current) return;
        
        // Cleanup previous chart
        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        const { labels, values, label } = processData(data);
        
        // Neon Colors
        const borderColor = 'rgba(0, 240, 255, 1)';
        const backgroundColor = chartType === 'doughnut' 
            ? [
                'rgba(0, 240, 255, 0.6)',
                'rgba(255, 0, 153, 0.6)',
                'rgba(57, 255, 20, 0.6)',
                'rgba(250, 255, 0, 0.6)',
                'rgba(188, 19, 254, 0.6)',
              ] 
            : 'rgba(0, 240, 255, 0.2)';

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            chartInstanceRef.current = new Chart(ctx, {
                type: chartType,
                data: {
                    labels,
                    datasets: [{
                        label: label.charAt(0).toUpperCase() + label.slice(1),
                        data: values,
                        backgroundColor: backgroundColor,
                        borderColor: borderColor,
                        borderWidth: 2,
                        tension: 0.4, // Curvy lines
                        pointBackgroundColor: '#fff',
                        pointBorderColor: borderColor,
                        pointRadius: 4,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            labels: { color: '#cbd5e1', font: { family: 'Inter' } }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                            titleColor: '#fff',
                            bodyColor: '#cbd5e1',
                            borderColor: 'rgba(0, 240, 255, 0.3)',
                            borderWidth: 1,
                            padding: 10,
                            displayColors: false,
                        }
                    },
                    scales: chartType !== 'doughnut' ? {
                        y: {
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#94a3b8' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#94a3b8' }
                        }
                    } : undefined
                }
            });
        }

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [data, chartType]);

    return (
        <div className="flex flex-col h-full bg-slate-900/80 border border-teal-500/30 rounded-xl p-4 shadow-[0_0_30px_-10px_rgba(0,240,255,0.15)] animate-fade-in relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-teal-500 via-purple-500 to-pink-500"></div>
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                     <TableCellsIcon className="w-5 h-5 text-teal-400" />
                     <h3 className="font-bold text-gray-200">Visualización de Datos</h3>
                </div>
                <div className="flex bg-slate-800 rounded-lg p-1 gap-1">
                    {(['bar', 'line', 'doughnut'] as const).map((t) => (
                        <button
                            key={t}
                            onClick={() => setChartType(t)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${chartType === t ? 'bg-teal-600 text-white shadow-[0_0_10px_rgba(45,212,191,0.4)]' : 'text-gray-400 hover:text-white'}`}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 w-full min-h-[250px]">
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
};

export default SmartChartWidget;
