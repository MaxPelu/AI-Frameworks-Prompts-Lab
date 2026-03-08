import React, { useState } from 'react';
import { 
    SparklesIcon, 
    ChartBarIcon, 
    ClockIcon, 
    BeakerIcon, 
    WrenchScrewdriverIcon, 
    SaveDiskIcon, 
    ChevronDownIcon,
    CpuChipIcon,
    CommandLineIcon,
    ShieldCheckIcon,
    ArchiveBoxIcon,
    MagnifyingGlassIcon,
    QuestionMarkCircleIcon,
    BookOpenIcon,
    ArrowDownTrayIcon,
    UsersIcon,
    CircleStackIcon,
    PlusIcon,
    AdjustmentsHorizontalIcon
} from './Icons';

interface TopHeaderProps {
    sessionCount: number;
    promptCount: number;
    tokenCount: number;
    onToggleAutoSave: () => void;
    isAutoSaveEnabled: boolean;
    onOpenHistory: () => void;
    onOpenMetrics: () => void;
    onSave: () => void;
    onOpenArena: () => void;
    onOpenSkills: () => void;
    onOpenBatch: () => void;
    onOpenSettings: () => void;
    onNewSession: () => void;
    onOpenCommands: () => void;
    onOpenLibrary: () => void;
    onOpenGuide: () => void;
    onOpenRedTeam: () => void;
    onOpenForensic: () => void;
    onOpenExport: () => void;
}

const TopHeader: React.FC<TopHeaderProps> = ({
    sessionCount,
    promptCount,
    tokenCount,
    onToggleAutoSave,
    isAutoSaveEnabled,
    onOpenHistory,
    onOpenMetrics,
    onSave,
    onOpenArena,
    onOpenSkills,
    onOpenBatch,
    onOpenSettings,
    onNewSession,
    onOpenCommands,
    onOpenLibrary,
    onOpenGuide,
    onOpenRedTeam,
    onOpenForensic,
    onOpenExport
}) => {
    const [isToolsOpen, setIsToolsOpen] = useState(false);

    // Format numbers for display (e.g., 1.2k)
    const formatNumber = (num: number) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num.toString();
    };

    const ActionButton = ({ icon, label, onClick, title }: { icon: React.ReactNode, label: string, onClick?: () => void, title?: string }) => (
        <button 
            onClick={onClick}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 text-white shadow-sm min-w-[90px] justify-center"
            title={title || label}
        >
            {icon}
            <span className="text-[11px] font-bold uppercase tracking-wide">{label}</span>
        </button>
    );

    return (
        <header className="bg-orange-600 border-b border-white/20 text-white shadow-xl z-50 fixed top-0 left-0 right-0">
            <div className="flex items-center justify-between px-6 py-4">
                {/* Left: Logo & Stats */}
                <div className="flex items-center gap-8">
                    {/* Logo */}
                    <div className="flex items-center gap-4 cursor-pointer" onClick={onNewSession}>
                        <div className="p-2 bg-white/20 rounded-xl border border-white/20 shadow-inner">
                            <CpuChipIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-black text-lg leading-none tracking-tighter text-white uppercase italic">
                                AI ENGINEERING <span className="text-white/80">HUB</span>
                            </h1>
                        </div>
                    </div>

                    {/* Vertical Divider */}
                    <div className="h-8 w-px bg-white/20 hidden lg:block"></div>

                    {/* Stats Counters */}
                    <div className="hidden lg:flex items-center gap-4">
                        <div className="flex flex-col items-center leading-none px-2">
                            <UsersIcon className="w-4 h-4 text-white/70 mb-1" />
                            <span className="text-xs font-bold">{sessionCount}</span>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="flex flex-col items-center leading-none px-2">
                            <SparklesIcon className="w-4 h-4 text-white/70 mb-1" />
                            <span className="text-xs font-bold">{promptCount}</span>
                        </div>
                        <div className="w-px h-8 bg-white/10"></div>
                        <div className="flex flex-col items-center leading-none px-2">
                            <CircleStackIcon className="w-4 h-4 text-white/70 mb-1" />
                            <span className="text-xs font-bold">{formatNumber(tokenCount)}</span>
                        </div>
                    </div>
                </div>

                {/* Middle: Project Selector */}
                <div className="hidden 2xl:flex items-center gap-0 bg-black/20 rounded-xl p-1 border border-white/10 mx-6">
                    <div className="px-4 py-2 flex items-center gap-2 border-r border-white/10 bg-white/5 rounded-l-lg h-full">
                        <ArchiveBoxIcon className="w-4 h-4 text-white/80" />
                        <span className="text-xs font-bold uppercase text-white/80 tracking-wider">Proyecto</span>
                    </div>
                    <button className="flex items-center gap-4 px-4 py-2 hover:bg-white/5 rounded-r-lg transition-colors text-sm font-medium min-w-[180px] justify-between text-white">
                        <span>STOCK_ANALYSIS_Q1</span>
                        <ChevronDownIcon className="w-4 h-4 opacity-70" />
                    </button>
                </div>

                {/* Right: All Actions */}
                <div className="flex items-center gap-3">
                    
                    {/* Auto Save */}
                    <button 
                        onClick={onToggleAutoSave}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all mr-2 ${
                            isAutoSaveEnabled 
                            ? 'bg-white/20 border-white/30 text-white' 
                            : 'bg-black/10 border-black/5 text-white/60 hover:bg-black/20'
                        }`}
                    >
                        <div className={`w-2 h-2 rounded-full ${isAutoSaveEnabled ? 'bg-white animate-pulse shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/40'}`} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">
                            {isAutoSaveEnabled ? 'AUTO-SAVE' : 'MANUAL'}
                        </span>
                    </button>

                    {/* Action Grid */}
                    <div className="flex items-center gap-2">
                        <ActionButton icon={<PlusIcon className="w-4 h-4" />} label="Crear" onClick={onNewSession} />
                        <ActionButton icon={<CommandLineIcon className="w-4 h-4" />} label="Cmds" onClick={onOpenCommands} title="Comandos (Cmd+K)" />
                        <ActionButton icon={<ClockIcon className="w-4 h-4" />} label="Historial" onClick={onOpenHistory} />
                        <ActionButton icon={<BookOpenIcon className="w-4 h-4" />} label="Biblio" onClick={onOpenLibrary} title="Biblioteca de Prompts" />
                        
                        <div className="w-px h-8 bg-white/20 mx-2"></div>
                        
                        <ActionButton icon={<ChartBarIcon className="w-4 h-4" />} label="Métricas" onClick={onOpenMetrics} />
                        <ActionButton icon={<AdjustmentsHorizontalIcon className="w-4 h-4" />} label="Ajustes" onClick={onOpenSettings} />
                        <ActionButton icon={<QuestionMarkCircleIcon className="w-4 h-4" />} label="Guía" onClick={onOpenGuide} title="Guía de Usuario" />
                    </div>

                    {/* Tools Dropdown */}
                    <div className="relative ml-2">
                        <button 
                            onClick={() => setIsToolsOpen(!isToolsOpen)}
                            className={`flex items-center gap-2 px-5 py-2.5 bg-white text-orange-600 hover:bg-gray-100 rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95 ${isToolsOpen ? 'ring-2 ring-white/50' : ''}`}
                        >
                            <WrenchScrewdriverIcon className="w-4 h-4" />
                            <span className="tracking-wide">TOOLS</span>
                            <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${isToolsOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isToolsOpen && (
                            <div className="absolute top-full right-0 mt-3 w-72 bg-[#0F131F] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100] animate-fade-in-down ring-1 ring-white/5">
                                <div className="p-2 space-y-1">
                                    <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 mb-1">
                                        Suite de Ingeniería
                                    </div>
                                    
                                    {[
                                        { icon: <BeakerIcon className="w-4 h-4 text-orange-400" />, label: 'A/B Testing Arena', sub: 'Comparar modelos SOTA', action: onOpenArena },
                                        { icon: <CpuChipIcon className="w-4 h-4 text-teal-400" />, label: 'Simulador de Agentes', sub: 'Orquestación Multi-Agente', action: onOpenBatch },
                                        { icon: <SparklesIcon className="w-4 h-4 text-purple-400" />, label: 'Gestor de Skills', sub: 'Biblioteca de capacidades', action: onOpenSkills },
                                        { icon: <ShieldCheckIcon className="w-4 h-4 text-red-400" />, label: 'Auditoría Red Team', sub: 'Pruebas de seguridad', action: onOpenRedTeam },
                                        { icon: <MagnifyingGlassIcon className="w-4 h-4 text-blue-400" />, label: 'Análisis Forense', sub: 'Traza de razonamiento', action: onOpenForensic },
                                    ].map((item, idx) => (
                                        <button 
                                            key={idx}
                                            onClick={() => { item.action(); setIsToolsOpen(false); }}
                                            className="w-full flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-lg text-left group transition-all"
                                        >
                                            <div className="p-1.5 bg-black/30 rounded-md border border-white/5 group-hover:border-white/10 transition-colors">
                                                {item.icon}
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-200 group-hover:text-white">{item.label}</div>
                                                <div className="text-[9px] text-gray-500 group-hover:text-gray-400 uppercase tracking-tighter">{item.sub}</div>
                                            </div>
                                        </button>
                                    ))}

                                    <div className="h-px bg-white/5 my-1"></div>

                                    <button 
                                        onClick={() => { onOpenExport(); setIsToolsOpen(false); }}
                                        className="w-full flex items-center gap-3 p-2.5 hover:bg-white/5 rounded-lg text-left group transition-all"
                                    >
                                        <div className="p-1.5 bg-black/30 rounded-md border border-white/5">
                                            <ArrowDownTrayIcon className="w-4 h-4 text-gray-400" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-gray-200 group-hover:text-white">Exportar Artefactos</div>
                                            <div className="text-[9px] text-gray-500 group-hover:text-gray-400 uppercase tracking-tighter">JSON, Markdown, PDF</div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopHeader;
