import React, { useState } from 'react';
import { 
    SparklesIcon, 
    BeakerIcon, 
    TableCellsIcon, 
    ChartBarIcon, 
    ClockIcon, 
    FingerPrintIcon,
    PlusIcon,
    SearchIcon,
    Bars3BottomLeftIcon,
    XMarkIcon
} from './Icons';
import { GeminiModel, TokenUsage } from '../../types';

interface SidebarProps {
    currentView: string;
    setCurrentView: (view: any) => void;
    onNewSession: () => void;
    onOpenCommandPalette: () => void;
    tokenHistory: TokenUsage[];
    selectedModel: GeminiModel;
    isMetricsOpen: boolean;
    setIsMetricsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
    currentView, 
    setCurrentView, 
    onNewSession, 
    onOpenCommandPalette,
    tokenHistory,
    selectedModel,
    setIsMetricsOpen
}) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { id: 'home', label: 'Laboratorio', icon: <SparklesIcon className="w-5 h-5" /> },
        { id: 'arena', label: 'Arena', icon: <BeakerIcon className="w-5 h-5" /> },
        { id: 'batch', label: 'Batch', icon: <TableCellsIcon className="w-5 h-5" /> },
        { id: 'metrics', label: 'Métricas', icon: <ChartBarIcon className="w-5 h-5" /> },
        { id: 'history', label: 'Historial', icon: <ClockIcon className="w-5 h-5" /> },
        { id: 'skills', label: 'Skills', icon: <FingerPrintIcon className="w-5 h-5" /> },
    ];

    const totalTokens = tokenHistory.reduce((acc, curr) => acc + (curr.totalTokens || 0), 0);

    const NavContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo Area */}
            <div className="p-6 flex items-center gap-3 border-b border-white/5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                    <SparklesIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight text-white">Prompt Lab</span>
                {isMobileMenuOpen && (
                    <button 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="ml-auto lg:hidden text-gray-400 hover:text-white"
                    >
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                )}
            </div>

            {/* Main Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
                <button 
                    onClick={() => {
                        onNewSession();
                        setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all group mb-6"
                >
                    <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    <span>Nueva Sesión</span>
                </button>

                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => {
                            setCurrentView(item.id);
                            setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group ${
                            currentView === item.id 
                                ? 'bg-white/10 text-white shadow-inner border border-white/5' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <div className={`transition-colors ${currentView === item.id ? 'text-teal-400' : 'group-hover:text-teal-400'}`}>
                            {item.icon}
                        </div>
                        <span className="font-medium">{item.label}</span>
                        {currentView === item.id && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 shadow-[0_0_10px_var(--color-teal-400)]"></div>
                        )}
                    </button>
                ))}
            </nav>

            {/* HUD & Bottom Actions */}
            <div className="p-4 border-t border-white/5 space-y-4 bg-black/20">
                {/* HUD Info */}
                <div className="space-y-2">
                     <div 
                        className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-colors"
                        onClick={() => setIsMetricsOpen(true)}
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-mono text-gray-300">Tokens</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400">{totalTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span className="text-xs font-mono text-gray-300">Modelo</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-blue-400 truncate max-w-[100px]" title={selectedModel}>
                            {selectedModel.replace('gemini-', '').replace('-preview', '')}
                        </span>
                    </div>
                </div>

                <button 
                    onClick={() => {
                        onOpenCommandPalette();
                        setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all group border border-transparent hover:border-white/10"
                    title="Comandos (Cmd+K)"
                >
                    <SearchIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Buscar...</span>
                    <kbd className="ml-auto text-[10px] font-mono bg-white/5 px-2 py-0.5 rounded border border-white/10 text-gray-500">⌘K</kbd>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900/90 backdrop-blur-xl border-b border-white/10 z-50 flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
                        <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">Prompt Lab</span>
                </div>
                <button 
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg"
                >
                    <Bars3BottomLeftIcon className="w-6 h-6" />
                </button>
            </div>

            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 h-screen fixed left-0 top-0 bg-[#0f172a] border-r border-white/10 z-50">
                <NavContent />
            </div>

            {/* Mobile Drawer Overlay */}
            {isMobileMenuOpen && (
                <div className="lg:hidden fixed inset-0 z-[60]">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                    <div className="absolute left-0 top-0 bottom-0 w-3/4 max-w-xs bg-slate-900 border-r border-white/10 shadow-2xl animate-slide-in-left">
                        <NavContent />
                    </div>
                </div>
            )}
        </>
    );
};

export default Sidebar;
