import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    XMarkIcon, FolderIcon, PlusIcon, ChartBarIcon, DocumentTextIcon, 
    WrenchScrewdriverIcon, CloudArrowUpIcon, ClockIcon, SparklesIcon,
    AdjustmentsHorizontalIcon, BeakerIcon
} from './Icons.tsx';

import { SavedPrompt } from '../../types/index.ts';

interface WorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentWorkspace: string;
    onWorkspaceChange: (workspace: string) => void;
    savedPrompts: SavedPrompt[];
    onNavigateToLibrary: () => void;
}

const WorkspaceModal: React.FC<WorkspaceModalProps> = ({ isOpen, onClose, currentWorkspace, onWorkspaceChange, savedPrompts, onNavigateToLibrary }) => {
    const [workspaces, setWorkspaces] = useState(['DEFAULT', 'PROYECTO A', 'OPTIMIZACIÓN E-COMMERCE']);
    const [newWorkspace, setNewWorkspace] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'prompts' | 'settings' | 'notes'>('overview');
    
    // Scratchpad state per workspace
    const [workspaceNotes, setWorkspaceNotes] = useState<Record<string, string>>({});

    const handleAddWorkspace = () => {
        if (newWorkspace.trim() && !workspaces.includes(newWorkspace.trim().toUpperCase())) {
            setWorkspaces([...workspaces, newWorkspace.trim().toUpperCase()]);
            setNewWorkspace('');
            onWorkspaceChange(newWorkspace.trim().toUpperCase());
        }
    };

    const handleDeleteWorkspace = () => {
        if (currentWorkspace === 'DEFAULT') {
            alert("No puedes eliminar el espacio DEFAULT.");
            return;
        }
        const updatedWorkspaces = workspaces.filter(ws => ws !== currentWorkspace);
        setWorkspaces(updatedWorkspaces);
        onWorkspaceChange('DEFAULT');
        setActiveTab('overview');
    };

    const handleArchiveWorkspace = () => {
        if (currentWorkspace === 'DEFAULT') {
            alert("No puedes archivar el espacio DEFAULT.");
            return;
        }
        alert(`Espacio ${currentWorkspace} archivado (simulado).`);
    };

    const handleExportWorkspace = () => {
        const data = {
            workspace: currentWorkspace,
            prompts: savedPrompts.filter(p => p.workspace === currentWorkspace || (!p.workspace && currentWorkspace === 'DEFAULT')),
            notes: workspaceNotes[currentWorkspace] || ''
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `workspace-${currentWorkspace.toLowerCase().replace(/\s+/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setWorkspaceNotes(prev => ({
            ...prev,
            [currentWorkspace]: e.target.value
        }));
    };

    // Filter prompts for current workspace
    const workspacePrompts = savedPrompts.filter(p => 
        p.workspace === currentWorkspace || (!p.workspace && currentWorkspace === 'DEFAULT')
    );

    // Calculate stats
    const totalTokens = workspacePrompts.reduce((acc, p) => acc + (p.versions[0]?.metrics?.totalTokens || 0), 0);
    const uniqueFrameworks = new Set(workspacePrompts.map(p => p.framework.acronym)).size;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-6xl h-[85vh] shadow-2xl flex overflow-hidden"
                >
                    {/* Sidebar: Workspace List */}
                    <div className="w-64 bg-black/40 border-r border-white/10 flex flex-col">
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
                                    <FolderIcon className="w-5 h-5 text-purple-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Espacios</h2>
                            </div>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newWorkspace}
                                    onChange={(e) => setNewWorkspace(e.target.value)}
                                    placeholder="Nuevo..."
                                    className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-purple-500/50"
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddWorkspace(); }}
                                />
                                <button
                                    onClick={handleAddWorkspace}
                                    className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                                >
                                    <PlusIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            {workspaces.map(ws => (
                                <button
                                    key={ws}
                                    onClick={() => onWorkspaceChange(ws)}
                                    className={`w-full flex items-center justify-between p-3 rounded-lg border transition-all ${
                                        currentWorkspace === ws
                                        ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                                        : 'border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 truncate">
                                        <FolderIcon className="w-4 h-4 shrink-0" />
                                        <span className="font-mono text-xs truncate">{ws}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col bg-slate-900/50">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div>
                                <h1 className="text-2xl font-bold text-white font-mono">{currentWorkspace}</h1>
                                <p className="text-sm text-gray-400 mt-1">Gestiona los recursos, configuraciones y métricas de este entorno.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 border-b border-white/10 bg-black/20">
                            {[
                                { id: 'overview', label: 'Vista General', icon: ChartBarIcon },
                                { id: 'prompts', label: 'Prompts Guardados', icon: DocumentTextIcon },
                                { id: 'notes', label: 'Scratchpad', icon: SparklesIcon },
                                { id: 'settings', label: 'Configuración', icon: AdjustmentsHorizontalIcon },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.id 
                                        ? 'border-purple-500 text-purple-400' 
                                        : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-white/20'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">PROMPTS GUARDADOS</div>
                                            <div className="text-2xl font-bold text-white">{workspacePrompts.length}</div>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">TOKENS CONSUMIDOS</div>
                                            <div className="text-2xl font-bold text-teal-400">{(totalTokens / 1000).toFixed(1)}K</div>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">FRAMEWORKS USADOS</div>
                                            <div className="text-2xl font-bold text-purple-400">{uniqueFrameworks}</div>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">TIEMPO ACTIVO</div>
                                            <div className="text-2xl font-bold text-orange-400">12h 45m</div>
                                        </div>
                                    </div>

                                    {/* Features Grid */}
                                    <h3 className="text-lg font-bold text-white mt-8 mb-4">Herramientas del Espacio</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        <FeatureCard icon={DocumentTextIcon} title="Exportar Espacio" desc="Descarga todos los prompts y configuraciones en JSON." onClick={handleExportWorkspace} />
                                        <FeatureCard icon={CloudArrowUpIcon} title="Importar Datos" desc="Carga un backup previo de este espacio." onClick={() => alert('Importación en desarrollo')} />
                                        <FeatureCard icon={ClockIcon} title="Historial de Actividad" desc="Revisa los últimos cambios realizados aquí." onClick={() => alert('Historial en desarrollo')} />
                                        <FeatureCard icon={BeakerIcon} title="Variables de Entorno" desc="Configura API Keys específicas para este espacio." onClick={() => alert('Variables en desarrollo')} />
                                        <FeatureCard icon={WrenchScrewdriverIcon} title="Modelo por Defecto" desc="Asigna un LLM predeterminado para nuevas sesiones." onClick={() => alert('Configuración de modelo en desarrollo')} />
                                        <FeatureCard icon={SparklesIcon} title="Auto-etiquetado" desc="Clasifica automáticamente los prompts guardados." onClick={() => alert('Auto-etiquetado en desarrollo')} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'prompts' && (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-bold text-white">Prompts Recientes</h3>
                                        <button 
                                            onClick={() => {
                                                onClose();
                                                onNavigateToLibrary();
                                            }}
                                            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                                        >
                                            Ver Biblioteca Completa
                                        </button>
                                    </div>
                                    {workspacePrompts.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500">
                                            No hay prompts guardados en este espacio.
                                        </div>
                                    ) : (
                                        workspacePrompts.slice(0, 5).map(prompt => (
                                            <div key={prompt.id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex justify-between items-center hover:border-purple-500/50 transition-colors cursor-pointer">
                                                <div>
                                                    <h4 className="text-white font-medium">{prompt.title}</h4>
                                                    <p className="text-sm text-gray-400 mt-1">Framework: {prompt.framework.acronym} | Modelo: {prompt.versions[0]?.model?.name || 'Desconocido'}</p>
                                                </div>
                                                <div className="text-xs font-mono text-gray-500">
                                                    {new Date(prompt.updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'notes' && (
                                <div className="h-full flex flex-col">
                                    <h3 className="text-lg font-bold text-white mb-2">Scratchpad del Espacio</h3>
                                    <p className="text-sm text-gray-400 mb-4">Anota ideas rápidas, fragmentos de contexto o tareas pendientes para este proyecto.</p>
                                    <textarea
                                        value={workspaceNotes[currentWorkspace] || ''}
                                        onChange={handleNotesChange}
                                        placeholder="Escribe aquí tus notas..."
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl p-4 text-gray-200 focus:outline-none focus:border-purple-500/50 resize-none font-mono text-sm"
                                    />
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-6 max-w-2xl">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4">Configuración del Espacio</h3>
                                        <div className="space-y-4">
                                            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Nombre del Espacio</label>
                                                <input type="text" value={currentWorkspace} readOnly className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white opacity-50 cursor-not-allowed" />
                                            </div>
                                            <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                                <label className="block text-sm font-medium text-gray-300 mb-1">Directorio de Exportación</label>
                                                <input type="text" defaultValue={`/exports/${currentWorkspace.toLowerCase().replace(/\s+/g, '-')}`} className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500/50" />
                                            </div>
                                            <div className="bg-black/40 border border-white/10 rounded-xl p-4 flex items-center justify-between">
                                                <div>
                                                    <div className="text-white font-medium">Archivar Espacio</div>
                                                    <div className="text-sm text-gray-400">Oculta este espacio de la lista principal.</div>
                                                </div>
                                                <button 
                                                    onClick={handleArchiveWorkspace}
                                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    Archivar
                                                </button>
                                            </div>
                                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                                                <div>
                                                    <div className="text-red-400 font-medium">Eliminar Espacio</div>
                                                    <div className="text-sm text-red-400/70">Esta acción no se puede deshacer.</div>
                                                </div>
                                                <button 
                                                    onClick={handleDeleteWorkspace}
                                                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

const FeatureCard = ({ icon: Icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick?: () => void }) => (
    <div 
        onClick={onClick}
        className="bg-black/40 border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-colors cursor-pointer group"
    >
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/5 rounded-lg group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors">
                <Icon className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
            </div>
            <h4 className="text-white font-medium">{title}</h4>
        </div>
        <p className="text-sm text-gray-400">{desc}</p>
    </div>
);

export default WorkspaceModal;
