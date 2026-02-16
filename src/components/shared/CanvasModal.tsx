import React, { useState, useEffect, useRef } from 'react';
import { XMarkIcon, ClipboardIcon, CheckIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from './Icons';

interface CanvasModalProps {
    title: string;
    content: string;
    isEditable: boolean;
    onClose: () => void;
    onSave?: (newContent: string) => void;
}

const CanvasModal: React.FC<CanvasModalProps> = ({ title, content, isEditable, onClose, onSave }) => {
    const [currentContent, setCurrentContent] = useState(content);
    const [copied, setCopied] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

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
        if (!modalRef.current) return;
        if (!document.fullscreenElement) {
            modalRef.current.requestFullscreen().catch(err => {
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

    const handleSave = () => {
        if (onSave) {
            onSave(currentContent);
        }
        onClose();
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(currentContent);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div 
            ref={modalRef}
            className="fixed inset-0 bg-slate-900 z-50 flex animate-fade-in" 
            aria-modal="true"
            role="dialog"
        >
            <div className="bg-slate-900 w-full h-full flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-100">{title}</h2>
                    <div className="flex items-center gap-4">
                        <button onClick={handleCopy} className="text-gray-400 hover:text-teal-400 transition-colors" title="Copiar al portapapeles">
                           {copied ? <CheckIcon className="w-5 h-5 text-teal-400" /> : <ClipboardIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={handleFullscreen} className="text-gray-400 hover:text-teal-400 transition-colors" title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}>
                           {isFullscreen ? <ArrowsPointingInIcon className="w-5 h-5" /> : <ArrowsPointingOutIcon className="w-5 h-5" />}
                        </button>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <XMarkIcon className="w-7 h-7" />
                        </button>
                    </div>
                </header>
                <div className="flex-1 p-4 min-h-0">
                     <textarea
                        value={currentContent}
                        onChange={(e) => isEditable && setCurrentContent(e.target.value)}
                        readOnly={!isEditable}
                        className="w-full h-full bg-slate-800 border border-slate-700 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none resize-none font-mono text-base"
                        placeholder={isEditable ? "Escribe tu idea aquí..." : "El contenido aparecerá aquí..."}
                    />
                </div>
                <footer className="p-4 border-t border-slate-700 flex-shrink-0 flex justify-end gap-4">
                    <button 
                        onClick={onClose}
                        className="bg-slate-700 hover:bg-slate-600 text-gray-200 px-4 py-2 rounded-md transition-colors font-semibold"
                    >
                        Cerrar
                    </button>
                    {isEditable && (
                        <button 
                            onClick={handleSave}
                            className="bg-teal-500 text-white font-bold px-4 py-2 rounded-md hover:bg-teal-600 transition-colors"
                        >
                            Guardar y Cerrar
                        </button>
                    )}
                </footer>
            </div>
        </div>
    );
};

export default CanvasModal;