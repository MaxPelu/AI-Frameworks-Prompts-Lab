import React, { useEffect } from 'react';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from './Icons.tsx';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
    message: string;
    type: ToastType;
    isVisible: boolean;
    onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    if (!isVisible) return null;

    const bgColors = {
        success: 'bg-teal-900/90 border-teal-500',
        error: 'bg-red-900/90 border-red-500',
        info: 'bg-slate-800/90 border-indigo-500'
    };

    const icons = {
        success: <CheckCircleIcon className="w-6 h-6 text-teal-400" />,
        error: <XCircleIcon className="w-6 h-6 text-red-400" />,
        info: <div className="w-6 h-6 text-indigo-400">ℹ️</div>
    };

    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl backdrop-blur-md animate-fade-in-up ${bgColors[type]} transition-all duration-300`}>
            <div className="flex-shrink-0">
                {icons[type]}
            </div>
            <p className="text-sm font-medium text-white">{message}</p>
            <button onClick={onClose} className="ml-4 text-white/60 hover:text-white">
                <XMarkIcon className="w-4 h-4" />
            </button>
        </div>
    );
};
