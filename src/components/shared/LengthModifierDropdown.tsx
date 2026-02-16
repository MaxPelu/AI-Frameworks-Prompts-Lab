
import React, { useState, useRef, useEffect } from 'react';
import { ScaleIcon } from './Icons.tsx';
import { LengthModifier, LENGTH_MODIFIERS_CONFIG } from '../../lib/geminiService.ts';

interface LengthModifierDropdownProps {
    onModify: (modifier: LengthModifier) => void;
    isLoading: boolean;
    disabled: boolean;
    minimal?: boolean;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    customButtonClass?: string;
}

const LengthModifierDropdown: React.FC<LengthModifierDropdownProps> = ({ 
    onModify, 
    isLoading, 
    disabled, 
    minimal = false,
    placement = 'bottom',
    customButtonClass
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const getPlacementClasses = () => {
        switch (placement) {
            case 'top': return 'bottom-full left-0 mb-2';
            case 'left': return 'right-full top-0 mr-2';
            case 'right': return 'left-full top-0 ml-2';
            case 'bottom':
            default: return 'top-full left-0 mt-2';
        }
    };

    const defaultClasses = `flex items-center justify-center gap-2 transition-all duration-200 border 
        ${minimal ? 'p-2 rounded-lg' : 'px-3 py-1.5 text-xs font-semibold rounded-lg'}
        ${isOpen 
            ? 'bg-indigo-600/80 border-indigo-400 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' 
            : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/10'
        } disabled:opacity-50 disabled:cursor-not-allowed`;

    return (
        <div ref={ref} className="relative inline-block">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={disabled || isLoading}
                className={customButtonClass || defaultClasses}
                title="Ajustar la longitud y verbosidad del texto (20 opciones)"
            >
                {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-indigo-400 rounded-full animate-spin"></div>
                ) : (
                    <ScaleIcon className="w-5 h-5" />
                )}
                {!minimal && "Ajustar Largo"}
            </button>

            {isOpen && (
                <div className={`absolute ${getPlacementClasses()} w-72 max-h-80 overflow-y-auto glass-panel rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] border border-white/10 z-50 animate-fade-in-up bg-indigo-950/95 backdrop-blur-xl custom-scrollbar`}>
                    <div className="sticky top-0 bg-indigo-950/95 p-3 border-b border-white/10 backdrop-blur-md z-10">
                        <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Modificadores de Longitud</h4>
                    </div>
                    <div className="p-2 space-y-1">
                        {(Object.entries(LENGTH_MODIFIERS_CONFIG) as [LengthModifier, { label: string, description: string }][]).map(([key, config]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    onModify(key);
                                    setIsOpen(false);
                                }}
                                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/10 group transition-colors flex flex-col border border-transparent hover:border-white/5"
                            >
                                <span className="text-sm text-gray-200 group-hover:text-white font-medium">{config.label}</span>
                                <span className="text-[10px] text-gray-500 group-hover:text-gray-400">{config.description}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LengthModifierDropdown;
