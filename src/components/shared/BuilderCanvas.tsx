import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Framework } from '../../types';
import { XMarkIcon, ChevronDownIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from './Icons';
import { FRAMEWORKS } from '../../config/constants';
import { CONTEXT_FRAMEWORKS } from '../../config/contextConstants';
import { AGENT_FRAMEWORKS } from '../../config/agentConstants';

interface BuilderCanvasProps {
    framework: Framework;
    onClose: () => void;
    onSendToWorkflow: (builtPrompt: string) => void;
}

const generateTemplate = (fw: Framework): string => {
    const acronym = (fw?.acronym || '').toUpperCase();
    let template = `Usa el framework ${acronym} (${fw?.name || ''}) para la siguiente tarea:\n\n`;
    
    switch (acronym) {
        case 'RACE':
            template += '**Rol:** \n**Acción:** \n**Contexto:** \n**Expectativa:** ';
            break;
        case 'CRAFT':
            template += '**Contexto:** \n**Rol:** \n**Acción:** \n**Formato:** \n**Objetivo (Target):** ';
            break;
        case 'COT':
            template += 'Pregunta: \n\nInstrucción: Piensa paso a paso para resolver esto.';
            break;
        case 'RISE':
             template += '**Rol:** \n**Entrada (Input):** \n**Pasos (Steps):** \n**Expectativa:** ';
            break;
        default:
            const parts = fw.name.split(/, | y /).map(p => `**${p.trim()}:** `);
            if (parts.length > 1 && parts.length < 8) {
                template += parts.join('\n');
            } else {
                 template += `**Tarea:** [Describe tu tarea aquí]`
            }
            break;
    }
    return template;
}

const allFrameworks = [...FRAMEWORKS, ...CONTEXT_FRAMEWORKS, ...AGENT_FRAMEWORKS].sort((a,b) => (a?.acronym || '').localeCompare(b?.acronym || ''));

const BuilderCanvas: React.FC<BuilderCanvasProps> = ({ framework, onClose, onSendToWorkflow }) => {
    const [promptText, setPromptText] = useState('');
    const [referenceFramework, setReferenceFramework] = useState<Framework>(framework);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        setPromptText(generateTemplate(framework));
    }, [framework]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape' && !document.fullscreenElement) {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const handleFullscreen = () => {
        if (!canvasRef.current) return;
        if (!document.fullscreenElement) {
            canvasRef.current.requestFullscreen().catch(err => {
                alert(`Error al intentar activar el modo de pantalla completa: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };
    
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const handleFrameworkChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedFw = allFrameworks.find(f => f.id === e.target.value);
        if (selectedFw) {
            setReferenceFramework(selectedFw);
        }
    };
    
    const handleSend = () => {
        onSendToWorkflow(promptText);
    };

    return createPortal(
        <div 
            ref={canvasRef}
            className="fixed inset-0 bg-slate-950 z-50 flex animate-fade-in" 
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-slate-950 w-full h-full flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-white/10 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100">
                        Constructor de Prompts: <span className="text-teal-400">{framework?.acronym}</span>
                    </h2>
                     <div className="flex items-center gap-4">
                        <button onClick={handleFullscreen} className="text-gray-400 hover:text-teal-400 transition-colors" title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
                           {isFullscreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <XMarkIcon className="w-7 h-7" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 min-h-0">
                    {/* Reference Panel */}
                    <aside className="w-full lg:w-1/3 flex flex-col gap-4 bg-white/5 border border-white/10 rounded-xl p-4 overflow-y-auto">
                        <div className="relative">
                            <label className="text-sm text-gray-400 mb-1 block">Framework de Referencia:</label>
                             <select
                                value={referenceFramework.id}
                                onChange={handleFrameworkChange}
                                className="appearance-none w-full bg-slate-900 border border-white/10 rounded-lg pl-4 pr-10 py-2.5 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            >
                                {allFrameworks.map(fw => (
                                    <option key={fw?.id || Math.random()} value={fw?.id}>{fw?.acronym || 'N/A'}: {fw?.name || 'N/A'}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-10 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                        <div className="border-t border-white/10 pt-4">
                            <h3 className="text-lg font-bold text-teal-400">{referenceFramework?.acronym}</h3>
                            <p className="font-semibold text-gray-200">{referenceFramework?.name}</p>
                            <p className="text-sm text-gray-400 mt-2">{referenceFramework?.description}</p>
                            {referenceFramework?.example && (
                                <div className="mt-4">
                                    <h4 className="font-semibold text-teal-300 mb-2 text-sm">Ejemplo de Uso:</h4>
                                    <div className="bg-black/40 p-3 rounded-lg text-xs text-gray-300 whitespace-pre-wrap font-mono border border-white/5">
                                        <code>{referenceFramework.example.prompt}</code>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>

                    {/* Editor Panel */}
                    <section className="w-full lg:w-2/3 flex flex-col">
                         <textarea
                            value={promptText}
                            onChange={(e) => setPromptText(e.target.value)}
                            className="w-full h-full flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none font-mono text-base"
                            placeholder="Construye tu prompt aquí..."
                        />
                    </section>
                </main>

                <footer className="p-4 border-t border-white/10 flex-shrink-0 flex justify-end gap-4 bg-black/20">
                    <button 
                        onClick={onClose}
                        className="bg-white/5 hover:bg-white/10 text-gray-300 px-4 py-2 rounded-lg transition-colors font-semibold"
                    >
                        Cerrar
                    </button>
                    <button 
                        onClick={handleSend}
                        className="bg-teal-600/20 border border-teal-500/30 text-teal-100 hover:bg-teal-600/30 font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                        Enviar a Flujo de Trabajo
                    </button>
                </footer>
            </div>
        </div>,
        document.body
    );
};

export default BuilderCanvas;