import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
    XMarkIcon, CircleStackIcon, DocumentTextIcon, PlusIcon,
    CloudArrowUpIcon, ServerIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon
} from './Icons.tsx';

interface DataModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const DataModal: React.FC<DataModalProps> = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<'files' | 'vectordb' | 'embeddings' | 'settings'>('files');

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
                    {/* Sidebar */}
                    <div className="w-64 bg-black/40 border-r border-white/10 flex flex-col">
                        <div className="p-4 border-b border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
                                    <CircleStackIcon className="w-5 h-5 text-blue-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">Datos & RAG</h2>
                            </div>
                            <button className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm font-bold">
                                <PlusIcon className="w-4 h-4" />
                                Nueva Fuente
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider px-3 py-2">Fuentes Activas</div>
                            {['Manual de Usuario.pdf', 'API_Docs_v2.md', 'Base de Conocimiento (Notion)'].map(src => (
                                <button key={src} className="w-full flex items-center gap-3 p-3 rounded-lg border border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200 transition-all">
                                    <DocumentTextIcon className="w-4 h-4 shrink-0" />
                                    <span className="font-mono text-xs truncate">{src}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col bg-slate-900/50">
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                            <div>
                                <h1 className="text-2xl font-bold text-white font-mono">Gestor de Conocimiento</h1>
                                <p className="text-sm text-gray-400 mt-1">Administra documentos, bases de datos vectoriales y modelos de embeddings para RAG.</p>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <XMarkIcon className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 border-b border-white/10 bg-black/20">
                            {[
                                { id: 'files', label: 'Archivos', icon: DocumentTextIcon },
                                { id: 'vectordb', label: 'Vector DB', icon: ServerIcon },
                                { id: 'embeddings', label: 'Embeddings', icon: MagnifyingGlassIcon },
                                { id: 'settings', label: 'Configuración', icon: AdjustmentsHorizontalIcon },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                                        activeTab === tab.id 
                                        ? 'border-blue-500 text-blue-400' 
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
                            {activeTab === 'files' && (
                                <div className="space-y-6">
                                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer">
                                        <CloudArrowUpIcon className="w-12 h-12 text-gray-500 mb-4" />
                                        <h3 className="text-lg font-bold text-white mb-2">Sube tus documentos</h3>
                                        <p className="text-sm text-gray-400 max-w-md">Arrastra archivos PDF, TXT, MD o CSV aquí para procesarlos y añadirlos a tu base de conocimiento.</p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">TOTAL DOCUMENTOS</div>
                                            <div className="text-2xl font-bold text-white">12</div>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">CHUNKS GENERADOS</div>
                                            <div className="text-2xl font-bold text-blue-400">1,450</div>
                                        </div>
                                        <div className="bg-black/40 border border-white/10 rounded-xl p-4">
                                            <div className="text-gray-400 text-xs font-mono mb-1">ESTADO INDEXACIÓN</div>
                                            <div className="text-2xl font-bold text-emerald-400">Completado</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'vectordb' && (
                                <div className="text-center py-12 text-gray-500">
                                    <ServerIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Conexión a Vector DB</h3>
                                    <p>Configura tu conexión a Pinecone, ChromaDB o Qdrant (Próximamente).</p>
                                </div>
                            )}
                            {activeTab === 'embeddings' && (
                                <div className="text-center py-12 text-gray-500">
                                    <MagnifyingGlassIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Modelos de Embeddings</h3>
                                    <p>Selecciona y configura el modelo de embeddings (ej. text-embedding-004).</p>
                                </div>
                            )}
                            {activeTab === 'settings' && (
                                <div className="text-center py-12 text-gray-500">
                                    <AdjustmentsHorizontalIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <h3 className="text-xl font-bold text-white mb-2">Configuración de Chunking</h3>
                                    <p>Ajusta el tamaño de los chunks y el overlap para la ingesta de datos.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default DataModal;
