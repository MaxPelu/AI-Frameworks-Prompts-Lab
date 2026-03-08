
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { SaveDiskIcon, XMarkIcon } from './Icons.tsx';

interface SessionNamingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string) => void;
    onDiscard: () => void;
    initialName?: string;
    isRenameMode?: boolean;
}

const SessionNamingModal: React.FC<SessionNamingModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    onDiscard,
    initialName = '',
    isRenameMode = false
}) => {
    const [name, setName] = useState(initialName);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen, initialName]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name);
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSave();
        if (e.key === 'Escape') onClose();
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-slate-900 border border-teal-500/30 rounded-2xl shadow-[0_0_50px_rgba(20,184,166,0.1)] w-full max-w-md p-6 relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                >
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-teal-500/10 rounded-xl text-teal-400">
                            <SaveDiskIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                {isRenameMode ? 'Renombrar Sesión' : 'Guardar Sesión'}
                            </h3>
                            <p className="text-sm text-gray-400">
                                {isRenameMode 
                                    ? 'Asigna un nuevo nombre a esta sesión.'
                                    : 'Dale un nombre a tu sesión antes de comenzar una nueva.'}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Nombre de la Sesión</label>
                        <input
                            ref={inputRef}
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ej: Campaña Marketing Café..."
                            className="glass-input w-full rounded-xl p-3 text-white placeholder-gray-600 focus:border-teal-500 transition-all text-lg font-medium"
                        />
                    </div>

                    <div className="flex gap-3 mt-4">
                        {!isRenameMode && (
                            <button
                                onClick={onDiscard}
                                className="flex-1 px-4 py-3 rounded-xl border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold text-sm transition-all"
                            >
                                Descartar y Nuevo
                            </button>
                        )}
                        <button
                            onClick={handleSave}
                            disabled={!name.trim()}
                            className="flex-1 bg-teal-600/20 border border-teal-500/30 text-teal-100 hover:bg-teal-600/30 text-white font-bold py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {isRenameMode ? 'Actualizar Nombre' : 'Guardar y Nuevo'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default SessionNamingModal;
