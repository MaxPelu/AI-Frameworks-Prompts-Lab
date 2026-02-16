
import React, { useState } from 'react';
import { SavedPrompt, PromptVersion } from '../../types/index.ts';
import { ClipboardIcon, CheckIcon, TrashIcon, ChevronDownIcon, CodeBracketIcon, ArrowsPointingOutIcon, PencilIcon, XMarkIcon, ArrowPathIcon, EyeIcon } from '../shared/Icons.tsx';
import CanvasModal from '../shared/CanvasModal.tsx';

interface SavedPromptCardProps {
  prompt: SavedPrompt;
  onDelete: (id: string) => void;
  onDeleteVersion: (promptId: string, versionId: string) => void;
  onIterate: (id: string, versionId?: string) => void;
  onExport: (prompt: SavedPrompt) => void;
  onRename: (id: string) => void; // New prop
}

const SavedPromptCard: React.FC<SavedPromptCardProps> = ({ prompt, onDelete, onDeleteVersion, onIterate, onExport, onRename }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedVersionId, setCopiedVersionId] = useState<string | null>(null);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [canvasState, setCanvasState] = useState<{isOpen: boolean, content: string, title: string}>({ isOpen: false, content: '', title: '' });

  const handleCopy = (version: PromptVersion) => {
    navigator.clipboard.writeText(version.optimizedPrompt);
    setCopiedVersionId(version.versionId);
    setTimeout(() => setCopiedVersionId(null), 2000);
  };

  const latestVersion = prompt.versions[0];
  
  // Use custom name if available, otherwise use baseIdea (truncated if necessary)
  const displayTitle = prompt.name || prompt.baseIdea || "Sin Título";
  const displaySubtitle = prompt.name ? prompt.baseIdea : "";

  return (
    <>
      <div className={`glass-card rounded-xl p-5 transition-all duration-300 group border border-white/5 ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex-grow pr-4">
            <div className="flex items-center gap-3 group/title cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <h4 className="font-bold text-gray-100 text-lg mb-1 line-clamp-1 group-hover/title:text-teal-300 transition-colors drop-shadow-sm flex-grow">
                    {displayTitle}
                </h4>
            </div>
            
            {displaySubtitle && (
                <p className="text-xs text-gray-500 mb-2 line-clamp-1 italic">"{displaySubtitle}"</p>
            )}

            <p className="text-xs text-gray-400 flex items-center gap-2 mt-1">
              <span>{new Date(latestVersion.createdAt).toLocaleDateString()}</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span className="font-semibold text-teal-400 drop-shadow-sm">{latestVersion.frameworkAcronym}</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span className="font-semibold text-indigo-300 drop-shadow-sm">{latestVersion.model}</span>
              {prompt.versions.length > 1 && (
                   <span className="ml-2 px-1.5 py-0.5 bg-white/10 rounded-md text-[10px] text-gray-300 border border-white/5">{prompt.versions.length} versiones</span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
             <button onClick={() => onRename(prompt.id)} title="Renombrar sesión" className="p-2 text-gray-500 hover:text-teal-400 hover:bg-white/10 rounded-full transition-all">
                <PencilIcon className="w-4 h-4" />
             </button>
             <button onClick={() => setIsExpanded(!isExpanded)} title="Ver historial" className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all">
                <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
             </button>
          </div>
        </div>
        
        <div className="bg-black/30 border border-white/5 p-4 rounded-lg relative group mb-4 shadow-inner backdrop-blur-sm">
          <p className="text-sm text-gray-300 whitespace-pre-wrap font-mono line-clamp-3 group-hover:line-clamp-none transition-all">{latestVersion.optimizedPrompt}</p>
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/80 p-1 rounded-lg backdrop-blur-md border border-white/10 shadow-lg z-10">
            <button onClick={() => handleCopy(latestVersion)} title="Copiar prompt" className="p-1.5 text-gray-300 hover:text-teal-400 transition-colors">
                {copiedVersionId === latestVersion.versionId ? <CheckIcon className="w-4 h-4 text-teal-400" /> : <ClipboardIcon className="w-4 h-4" />}
            </button>
            <button onClick={() => setCanvasState({ isOpen: true, content: latestVersion.optimizedPrompt, title: `Versión más reciente de "${displayTitle}"` })} title="Ver en lienzo" className="p-1.5 text-gray-300 hover:text-teal-400 transition-colors">
                <ArrowsPointingOutIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Bar - Improved UX */}
        <div className="flex items-center gap-3 border-t border-white/10 pt-4">
             <button 
                onClick={() => onIterate(prompt.id)} 
                className="flex-1 flex items-center justify-center gap-2 text-sm font-bold bg-indigo-600/20 border border-indigo-500 text-indigo-200 hover:bg-indigo-600/40 hover:text-white hover:shadow-[0_0_15px_rgba(99,102,241,0.4)] py-2.5 rounded-xl transition-all duration-300 group/btn"
                title="Cargar esta sesión en el editor principal para continuar trabajando"
            >
                  <ArrowPathIcon className="w-4 h-4 group-hover/btn:rotate-180 transition-transform" />
                  Continuar Sesión
            </button>
            
             <button 
                onClick={() => onExport(prompt)} 
                title="Exportar a código" 
                className="p-2.5 text-gray-400 hover:text-teal-300 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
            >
                  <CodeBracketIcon className="w-5 h-5" />
            </button>

            {isConfirmingDelete ? (
                <div className="flex items-center gap-2 animate-fade-in bg-red-500/10 border border-red-500/50 px-2 py-1 rounded-xl shadow-lg">
                    <span className="text-xs text-red-400 font-bold px-1">¿Seguro?</span>
                    <button onClick={() => onDelete(prompt.id)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"><CheckIcon className="w-4 h-4" /></button>
                    <button onClick={() => setIsConfirmingDelete(false)} className="p-1.5 text-gray-400 hover:text-white transition-colors"><XMarkIcon className="w-4 h-4" /></button>
                </div>
            ) : (
                <button onClick={() => setIsConfirmingDelete(true)} title="Eliminar sesión" className="p-2.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-transparent hover:border-red-500/20">
                    <TrashIcon className="w-5 h-5" />
                </button>
            )}
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-white/10 animate-fade-in">
            <h5 className="font-semibold text-xs text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-teal-500 rounded-full shadow-lg"></span>
                Historial de Versiones
            </h5>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
              {prompt.versions.map((version, index) => {
                 const versionNumber = prompt.versions.length - index;
                 const isLatest = index === 0;
                 return (
                <div key={version.versionId} className={`rounded-xl border p-3 transition-all flex flex-col gap-2 group/version ${isLatest ? 'bg-white/5 border-teal-500/30 shadow-sm' : 'bg-black/20 border-white/5 hover:border-white/10'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                         <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${isLatest ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-white/5 border-white/10 text-gray-400'}`}>v{versionNumber}</span>
                         <span className="text-xs text-gray-500">{new Date(version.createdAt).toLocaleTimeString()}</span>
                         {isLatest && <span className="text-[10px] text-teal-500 font-medium ml-1 tracking-wide">ACTUAL</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-60 group-hover/version:opacity-100 transition-opacity">
                        <button onClick={() => setCanvasState({ isOpen: true, content: version.optimizedPrompt, title: `Vista Previa: Versión ${versionNumber}` })} title="Vista previa" className="p-1.5 text-gray-400 hover:text-teal-300 hover:bg-white/10 rounded-lg transition-colors">
                            <EyeIcon className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleCopy(version)} title="Copiar texto" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                             {copiedVersionId === version.versionId ? <CheckIcon className="w-3.5 h-3.5 text-teal-400" /> : <ClipboardIcon className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => onIterate(prompt.id, version.versionId)} title="Restaurar esta versión" className="p-1.5 text-gray-400 hover:text-indigo-300 hover:bg-white/10 rounded-lg transition-colors">
                            <ArrowPathIcon className="w-3.5 h-3.5" />
                        </button>
                        {!isLatest && (
                            <button onClick={() => onDeleteVersion(prompt.id, version.versionId)} title="Eliminar versión" className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-900/10 rounded-lg transition-colors ml-1">
                                <TrashIcon className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                  </div>
                  
                  {version.changeSummary && <p className="text-xs text-indigo-300/80 italic line-clamp-1 pl-1 border-l-2 border-indigo-500/30" title={version.changeSummary}>"{version.changeSummary}"</p>}
                  
                  <div className="bg-black/30 p-3 rounded-lg border border-white/5 text-xs text-gray-400 font-mono line-clamp-2">
                      {version.optimizedPrompt}
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}
      </div>
      {canvasState.isOpen && (
        <CanvasModal
            title={canvasState.title}
            content={canvasState.content}
            isEditable={false}
            onClose={() => setCanvasState({ isOpen: false, content: '', title: '' })}
        />
      )}
    </>
  );
};

export default SavedPromptCard;
