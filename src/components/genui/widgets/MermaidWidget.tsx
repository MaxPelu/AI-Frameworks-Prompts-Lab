
import React, { useState, useEffect } from 'react';
import { ArrowsPointingOutIcon } from '../../shared/Icons.tsx';

interface MermaidWidgetProps {
    chart: string;
}

const MermaidWidget: React.FC<MermaidWidgetProps> = ({ chart }) => {
    const [imageUrl, setImageUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use mermaid.ink to render the diagram as an image
        // We encode the graph definition to base64
        const graphDefinition = chart.trim();
        const state = {
            code: graphDefinition,
            mermaid: {
                theme: 'dark',
                themeVariables: {
                    primaryColor: '#0f172a',
                    primaryTextColor: '#f8fafc',
                    primaryBorderColor: '#00f0ff',
                    lineColor: '#00f0ff',
                    secondaryColor: '#1e293b',
                    tertiaryColor: '#1e293b'
                }
            }
        };
        const json = JSON.stringify(state);
        const serialized = btoa(unescape(encodeURIComponent(json)));
        setImageUrl(`https://mermaid.ink/img/${serialized}`);
        setLoading(true);
    }, [chart]);

    return (
        <div className="flex flex-col h-full bg-slate-900/90 border border-indigo-500/30 rounded-xl p-4 shadow-[0_0_30px_-10px_rgba(99,102,241,0.2)] animate-fade-in">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-2">
                <h3 className="font-bold text-indigo-300 flex items-center gap-2">
                    <span className="text-lg">☊</span> Diagrama de Flujo
                </h3>
                <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    <ArrowsPointingOutIcon className="w-4 h-4" />
                </a>
            </div>
            <div className="flex-1 flex items-center justify-center overflow-auto bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:20px_20px] rounded-lg p-4">
                {loading && <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin absolute"></div>}
                <img 
                    src={imageUrl} 
                    alt="Mermaid Diagram" 
                    className="max-w-full max-h-full object-contain transition-opacity duration-300"
                    onLoad={() => setLoading(false)}
                    style={{ opacity: loading ? 0 : 1 }}
                />
            </div>
        </div>
    );
};

export default MermaidWidget;
