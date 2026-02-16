import React, { useState, useEffect } from 'react';
import { SafetySettings, SafetySettingValue } from '../../types';
import { XMarkIcon, ShieldCheckIcon } from './Icons.tsx';

interface SafetySettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    settings: SafetySettings;
    onSettingsChange: (newSettings: SafetySettings) => void;
}

const SETTING_OPTIONS: { value: SafetySettingValue; label: string; description: string }[] = [
    { value: 'BLOCK_LOW_AND_ABOVE', label: 'Bloquear umbral bajo y superior', description: 'El nivel de seguridad más alto. Bloquea todo el contenido potencialmente dañino.' },
    { value: 'BLOCK_MEDIUM_AND_ABOVE', label: 'Bloquear umbral medio y superior', description: 'Nivel de seguridad recomendado para la mayoría de las aplicaciones.' },
    { value: 'BLOCK_ONLY_HIGH', label: 'Bloquear solo umbral alto', description: 'Bloquea solo el contenido más claramente dañino.' },
    { value: 'BLOCK_NONE', label: 'No bloquear', description: 'No se bloquea ningún contenido. Usar con precaución.' },
];

const CATEGORIES: { key: keyof SafetySettings; label: string; description: string }[] = [
    { key: 'HARM_CATEGORY_HARASSMENT', label: 'Acoso', description: 'Contenido que es despectivo, insultante o intimidatorio.' },
    { key: 'HARM_CATEGORY_HATE_SPEECH', label: 'Incitación al Odio', description: 'Contenido que expresa intolerancia o promueve la discriminación.' },
    { key: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', label: 'Contenido Sexualmente Explícito', description: 'Material que incluye actos sexuales explícitos.' },
    { key: 'HARM_CATEGORY_DANGEROUS_CONTENT', label: 'Contenido Peligroso', description: 'Contenido que promueve actos peligrosos, ilegales o autolesiones.' },
];

const SafetyCategoryControl: React.FC<{
    categoryKey: keyof SafetySettings;
    label: string;
    description: string;
    currentValue: SafetySettingValue;
    onChange: (category: keyof SafetySettings, value: SafetySettingValue) => void;
}> = ({ categoryKey, label, description, currentValue, onChange }) => (
    <div className="border-t border-slate-700 py-4">
        <h4 className="font-semibold text-gray-100">{label}</h4>
        <p className="text-xs text-gray-400 mb-3">{description}</p>
        <div className="space-y-2">
            {SETTING_OPTIONS.map(option => (
                <label key={option.value} className="flex items-start p-3 bg-slate-800/50 rounded-md cursor-pointer hover:bg-slate-700/50 transition-colors">
                    <input
                        type="radio"
                        name={categoryKey}
                        value={option.value}
                        checked={currentValue === option.value}
                        onChange={() => onChange(categoryKey, option.value)}
                        className="mt-1 h-4 w-4 shrink-0 cursor-pointer border-gray-500 bg-slate-900 text-teal-500 focus:ring-teal-500"
                    />
                    <div className="ml-3 text-sm">
                        <span className="font-medium text-gray-200">{option.label}</span>
                        <p className="text-gray-400">{option.description}</p>
                    </div>
                </label>
            ))}
        </div>
    </div>
);


const SafetySettingsModal: React.FC<SafetySettingsModalProps> = ({ isOpen, onClose, settings, onSettingsChange }) => {
    const [localSettings, setLocalSettings] = useState<SafetySettings>(settings);

    useEffect(() => {
        setLocalSettings(settings);
    }, [isOpen, settings]);

    const handleSave = () => {
        onSettingsChange(localSettings);
        onClose();
    };

    const handleSettingChange = (category: keyof SafetySettings, value: SafetySettingValue) => {
        setLocalSettings(prev => ({ ...prev, [category]: value }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
                <header className="flex justify-between items-center p-4 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <ShieldCheckIcon className="w-7 h-7 text-teal-400" />
                        <h2 className="text-xl font-bold text-slate-100">Ajustes de Seguridad del Contenido</h2>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XMarkIcon className="w-7 h-7" />
                    </button>
                </header>

                <div className="p-6 flex-1 min-h-0 overflow-y-auto">
                    <p className="text-sm text-gray-300 mb-4">
                        Ajusta el umbral de bloqueo para cada categoría de contenido. Estas configuraciones ayudan a controlar qué tipo de respuestas se permiten del modelo.
                    </p>
                    <div className="space-y-4">
                        {CATEGORIES.map(cat => (
                            <SafetyCategoryControl
                                key={cat.key}
                                categoryKey={cat.key}
                                label={cat.label}
                                description={cat.description}
                                currentValue={localSettings[cat.key]}
                                onChange={handleSettingChange}
                            />
                        ))}
                    </div>
                </div>

                <footer className="p-4 bg-slate-800/50 border-t border-slate-700 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="bg-slate-700 hover:bg-slate-600 text-gray-200 px-4 py-2 rounded-md transition-colors font-semibold"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        className="bg-teal-600 text-white font-bold px-4 py-2 rounded-md hover:bg-teal-500 transition-colors"
                    >
                        Guardar Ajustes
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default SafetySettingsModal;