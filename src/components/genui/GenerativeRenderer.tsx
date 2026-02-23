
import React, { useMemo } from 'react';
import LiveCodeWidget from './widgets/LiveCodeWidget.tsx';
import SmartChartWidget from './widgets/SmartChartWidget.tsx';
import MermaidWidget from './widgets/MermaidWidget.tsx';

// Simple JSON Viewer component
const JsonViewerWidget: React.FC<{ data: any }> = ({ data }) => {
    return (
        <div className="h-full w-full bg-slate-900 rounded-xl border border-slate-700 p-4 overflow-auto">
            <h3 className="text-sm font-semibold text-teal-400 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
                Visor JSON Estructurado
            </h3>
            <pre className="text-xs font-mono text-gray-300 whitespace-pre-wrap">
                {JSON.stringify(data, null, 2)}
            </pre>
        </div>
    );
};

interface GenerativeRendererProps {
    content: string;
}

const GenerativeRenderer: React.FC<GenerativeRendererProps> = ({ content }) => {
    
    const detectedContent = useMemo(() => {
        // 1. Detect HTML/JSX
        const htmlMatch = content.match(/```(html|jsx|tsx|xml)([\s\S]*?)```/);
        if (htmlMatch && htmlMatch[2].trim().length > 10) {
            return { type: 'code', data: htmlMatch[2] };
        }

        // 2. Detect JSON Data
        const jsonMatch = content.match(/```json([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[1]);
                // Check if it looks like data for a chart (array or object with numbers)
                const isArrayData = Array.isArray(parsed) && parsed.length > 0;
                const isObjectData = !Array.isArray(parsed) && typeof parsed === 'object' && Object.values(parsed).some(v => typeof v === 'number');
                
                if (isArrayData || isObjectData) {
                     return { type: 'chart', data: parsed };
                } else {
                     return { type: 'json', data: parsed };
                }
            } catch (e) {
                // Not valid JSON, ignore
            }
        }

        // 3. Detect Mermaid
        const mermaidMatch = content.match(/```mermaid([\s\S]*?)```/);
        if (mermaidMatch) {
            return { type: 'mermaid', data: mermaidMatch[1] };
        }

        return null;
    }, [content]);


    if (!detectedContent) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-800 rounded-xl">
                 <div className="text-6xl mb-4 animate-pulse">✨</div>
                 <h3 className="text-xl font-bold text-gray-300">Esperando contenido visual...</h3>
                 <p className="text-gray-500 mt-2 max-w-xs">
                    Intenta pedirle a la IA: "Crea un componente de botón en HTML", "Genera un gráfico de ventas en JSON", o "Dibuja un diagrama de flujo".
                 </p>
            </div>
        );
    }

    return (
        <div className="h-full w-full p-2">
            {detectedContent.type === 'code' && <LiveCodeWidget code={detectedContent.data} />}
            {detectedContent.type === 'chart' && <SmartChartWidget data={detectedContent.data} />}
            {detectedContent.type === 'mermaid' && <MermaidWidget chart={detectedContent.data} />}
            {detectedContent.type === 'json' && <JsonViewerWidget data={detectedContent.data} />}
        </div>
    );
};

export default GenerativeRenderer;
