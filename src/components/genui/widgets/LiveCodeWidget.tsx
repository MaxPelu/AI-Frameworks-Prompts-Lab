
import React, { useState, useEffect, useRef } from 'react';
import { ArrowsPointingOutIcon, ArrowsPointingInIcon } from '../../shared/Icons.tsx';

interface LiveCodeWidgetProps {
    code: string;
}

const LiveCodeWidget: React.FC<LiveCodeWidgetProps> = ({ code }) => {
    const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        if (iframeRef.current) {
            const doc = iframeRef.current.contentDocument;
            if (doc) {
                doc.open();
                doc.write(`
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <style>
                            body { background-color: #0f1016; color: white; }
                            ::-webkit-scrollbar { width: 6px; }
                            ::-webkit-scrollbar-track { background: #0f1016; }
                            ::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
                        </style>
                    </head>
                    <body>
                        ${code}
                    </body>
                    </html>
                `);
                doc.close();
            }
        }
    }, [code]);

    return (
        <div className="flex flex-col h-full bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-2xl animate-fade-in">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="ml-2 text-xs text-gray-400 font-mono">Live Preview</span>
                </div>
                <div className="flex bg-slate-700/50 rounded-lg p-1">
                    <button 
                        onClick={() => setMode('desktop')}
                        className={`p-1.5 rounded-md transition-all ${mode === 'desktop' ? 'bg-slate-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        title="Vista de Escritorio"
                    >
                         <ArrowsPointingOutIcon className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setMode('mobile')}
                        className={`p-1.5 rounded-md transition-all ${mode === 'mobile' ? 'bg-slate-600 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                        title="Vista Móvil"
                    >
                        <ArrowsPointingInIcon className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 bg-neutral-900 flex justify-center items-center p-4 overflow-hidden relative bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]">
                <iframe 
                    ref={iframeRef}
                    title="GenUI Preview"
                    className={`transition-all duration-500 ease-in-out bg-white shadow-2xl border border-slate-700 ${
                        mode === 'mobile' 
                        ? 'w-[375px] h-[667px] rounded-[30px] border-4 border-slate-800' 
                        : 'w-full h-full rounded-lg'
                    }`}
                    sandbox="allow-scripts"
                />
            </div>
        </div>
    );
};

export default LiveCodeWidget;
