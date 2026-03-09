import React from 'react';
import { FRAMEWORKS, CATEGORIES } from '../../config/constants';
import { SparklesIcon, BeakerIcon, CpuChipIcon } from './Icons';

const AppDescription: React.FC = () => {
    // Calculate counts
    const counts = CATEGORIES.reduce((acc, category) => {
        acc[category] = FRAMEWORKS.filter(f => f.category === category).length;
        return acc;
    }, {} as Record<string, number>);

    const totalFrameworks = FRAMEWORKS.length;

    return (
        <div className="w-full mb-8 animate-fade-in col-span-full">
            <div className="glass-panel rounded-3xl p-8 relative overflow-hidden">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                                <span className="title-gradient">Laboratorio de Prompts</span> v5.0
                            </h1>
                            <h2 className="text-xl md:text-2xl text-teal-400 font-light tracking-wide flex items-center gap-2">
                                <CpuChipIcon className="w-6 h-6" />
                                Workbench de Ingeniería & Estrategia de AI
                            </h2>
                        </div>
                        <div className="flex items-center gap-4 bg-black/20 p-4 rounded-2xl border border-white/5 backdrop-blur-sm">
                            <div className="text-right">
                                <div className="text-3xl font-bold text-white leading-none">{totalFrameworks}</div>
                                <div className="text-xs text-gray-400 uppercase tracking-wider">Frameworks Totales</div>
                            </div>
                            <div className="h-10 w-px bg-white/10" />
                            <div className="p-3 bg-teal-500/20 rounded-xl">
                                <BeakerIcon className="w-6 h-6 text-teal-400" />
                            </div>
                        </div>
                    </div>

                    <div className="mb-6 p-4 bg-teal-900/20 border border-teal-500/30 rounded-xl">
                        <h3 className="text-teal-300 font-bold mb-2 flex items-center gap-2">
                            <SparklesIcon className="w-5 h-5" />
                            Distribución de Frameworks por Categoría
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                            {CATEGORIES.map(category => {
                                const count = counts[category] || 0;
                                if (count === 0) return null;
                                return (
                                    <div key={category} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                        <span className="text-xs text-gray-400 font-medium truncate pr-2 group-hover:text-gray-200 transition-colors" title={category}>
                                            {category}
                                        </span>
                                        <span className="text-xs font-bold text-teal-500 bg-teal-500/10 px-2 py-1 rounded-lg">
                                            {count}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppDescription;
