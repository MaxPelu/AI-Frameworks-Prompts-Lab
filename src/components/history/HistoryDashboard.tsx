
import React, { useState, useMemo } from 'react';
import { SavedPrompt, GeminiModel } from '../../types/index.ts';
import SavedPromptCard from '../knowledge/SavedPromptCard.tsx';
import { XMarkIcon, SearchIcon, BookOpenIcon, TrashIcon } from '../shared/Icons.tsx';

interface HistoryDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    savedPrompts: SavedPrompt[];
    onDeletePrompt: (id: string) => void;
    onDeleteVersion: (promptId: string, versionId: string) => void;
    onIteratePrompt: (id: string, versionId?: string) => void;
    onExportPrompt: (prompt: SavedPrompt) => void;
    onRenamePrompt: (id: string) => void;
}

const HistoryDashboard: React.FC<HistoryDashboardProps> = ({
    isOpen,
    onClose,
    savedPrompts,
    onDeletePrompt,
    onDeleteVersion,
    onIteratePrompt,
    onExportPrompt,
    onRenamePrompt
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPrompts = useMemo(() => {
        const lowerQuery = searchQuery.toLowerCase();
        return savedPrompts.filter(prompt => 
            (prompt.name && prompt.name.toLowerCase().includes(lowerQuery)) ||
            prompt.baseIdea.toLowerCase().includes(lowerQuery) ||
            prompt.versions.some(v => v.optimizedPrompt.toLowerCase().includes(lowerQuery))
        ).sort((a, b) => new Date(b.versions[0].createdAt).getTime() - new Date(a.versions[0].createdAt).getTime());
    }, [savedPrompts, searchQuery]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-50 flex flex-col animate-fade-in">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-slate-900/50">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-indigo-400">
                        <BookOpenIcon className="w-8 h-8" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-white tracking-tighter italic">Historial de Sesiones</h2>
                        <p className="text-gray-400 text-sm">Gestiona, recupera y audita tus sesiones de ingeniería anteriores.</p>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-3 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-all border border-transparent hover:border-white/10"
                >
                    <XMarkIcon className="w-8 h-8" />
                </button>
            </div>

            {/* Controls & Search */}
            <div className="p-6 pb-2 max-w-7xl mx-auto w-full">
                <div className="relative">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, idea o contenido del prompt..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-gray-200 placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 transition-all text-lg"
                        autoFocus
                    />
                </div>
                <div className="mt-4 flex gap-4 text-sm text-gray-500 font-mono uppercase tracking-widest">
                    <span>Total Sesiones: <span className="text-white font-bold">{savedPrompts.length}</span></span>
                    <span>•</span>
                    <span>Filtradas: <span className="text-white font-bold">{filteredPrompts.length}</span></span>
                </div>
            </div>

            {/* Grid Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <div className="max-w-7xl mx-auto">
                    {filteredPrompts.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6 pb-20">
                            {filteredPrompts.map(prompt => (
                                <SavedPromptCard 
                                    key={prompt.id} 
                                    prompt={prompt} 
                                    onDelete={onDeletePrompt} 
                                    onDeleteVersion={onDeleteVersion}
                                    onIterate={(id, vid) => {
                                        onIteratePrompt(id, vid);
                                        onClose(); // Close dashboard when opening a prompt
                                    }} 
                                    onExport={onExportPrompt}
                                    onRename={onRenamePrompt}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-96 text-gray-500 opacity-60">
                            <BookOpenIcon className="w-24 h-24 mb-6 stroke-1" />
                            <p className="text-xl font-light">No se encontraron sesiones.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HistoryDashboard;
