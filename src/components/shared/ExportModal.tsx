import React, { useState, useEffect } from 'react';
import { SavedPrompt, GeminiModel } from '../../types';
import { XMarkIcon, ClipboardIcon, CheckIcon } from './Icons.tsx';
// A simple syntax highlighter is needed for display. We'll use CSS classes for basic highlighting.
// For a real app, a library like Prism.js or highlight.js would be better.

const escapeStringForTemplateLiteral = (str: string) => {
  return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
};

const escapeStringForPythonTripleQuote = (str: string) => {
    // First escape backslashes, then specifically escape triple-quotes to avoid breaking the string literal.
    return str.replace(/\\/g, '\\\\').replace(/"""/g, '\\"\\"\\"');
}


const getJsCode = (prompt: string, model: GeminiModel) => `
import { GoogleGenAI } from "@google/genai";

// Asegúrate de que process.env.API_KEY esté disponible
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY no encontrada en las variables de entorno");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const prompt = \`${escapeStringForTemplateLiteral(prompt)}\`;

async function run() {
  try {
    console.log("Generando respuesta con el modelo ${model}...");
    const response = await ai.models.generateContent({
      model: '${model}',
      contents: prompt,
    });
    console.log("Respuesta de Gemini:", response.text);
    return response.text;
  } catch (error) {
    console.error("Error al llamar a la API de Gemini:", error);
  }
}

run();
`;

const getPythonCode = (prompt: string, model: GeminiModel) => `
import os
import google.generativeai as genai

# Asegúrate de que la variable de entorno API_KEY esté configurada
api_key = os.environ.get("API_KEY")
if not api_key:
    raise ValueError("La variable de entorno API_KEY no está configurada.")

genai.configure(api_key=api_key)

prompt = """${escapeStringForPythonTripleQuote(prompt)}"""

def run():
    try:
        print(f"Generando respuesta con el modelo {model}...")
        model = genai.GenerativeModel('${model}')
        response = model.generate_content(prompt)
        print("Respuesta de Gemini:", response.text)
        return response.text
    except Exception as e:
        print(f"Error al llamar a la API de Gemini: {e}")

if __name__ == "__main__":
    run()
`;


const CodeSnippet: React.FC<{ code: string }> = ({ code }) => {
    const [copied, setCopied] = useState(false);

    // Simple keyword based highlighting
    const highlight = (code: string) => {
        const keywords = ['import', 'from', 'const', 'let', 'if', 'throw', 'new', 'async', 'function', 'await', 'try', 'catch', 'return', 'def', 'import', 'os', 'if', 'not', 'raise', 'try', 'except', 'as', 'print', 'if', '__name__', 'in'];
        const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
        
        let highlightedCode = code
            .replace(keywordRegex, '<span class="token keyword">$1</span>')
            .replace(/('.*?'|".*?"|`.*?`)/gs, '<span class="token string">$1</span>')
            .replace(/(\/\/.*|\#.*)/g, '<span class="token comment">$1</span>');
            
        return highlightedCode;
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    
    return (
        <div className="relative group">
            <pre className="bg-slate-900 text-sm text-gray-200 p-4 rounded-lg overflow-x-auto">
                <code dangerouslySetInnerHTML={{ __html: highlight(code.trim()) }} />
            </pre>
            <button
                onClick={handleCopy}
                className="absolute top-3 right-3 p-2 bg-slate-700/50 rounded-md text-gray-300 hover:text-teal-400 opacity-0 group-hover:opacity-100 transition-all"
                title="Copiar código"
            >
                {copied ? <CheckIcon className="w-5 h-5 text-teal-400" /> : <ClipboardIcon className="w-5 h-5" />}
            </button>
        </div>
    )
}

interface ExportModalProps {
    prompt: SavedPrompt;
    onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ prompt, onClose }) => {
    const [activeTab, setActiveTab] = useState<'js' | 'py'>('js');
    
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
           if (event.key === 'Escape') {
              onClose();
           }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    const latestVersion = prompt.versions[0];
    const latestPrompt = latestVersion.optimizedPrompt;
    const latestModel = latestVersion.model || 'gemini-2.5-flash';

    return (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true">
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl flex flex-col p-6">
                 <header className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-100">Exportar Prompt a Código</h2>
                        <p className="text-slate-400 text-sm truncate max-w-md">Exportando prompt para: "{prompt.baseIdea}"</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XMarkIcon className="w-8 h-8" />
                    </button>
                </header>

                <div className="flex border-b border-slate-700 mb-4">
                    <button
                        onClick={() => setActiveTab('js')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'js' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        JavaScript
                    </button>
                     <button
                        onClick={() => setActiveTab('py')}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === 'py' ? 'text-teal-400 border-b-2 border-teal-400' : 'text-gray-400 hover:text-gray-200'}`}
                    >
                        Python
                    </button>
                </div>
                
                <div className="flex-1 min-h-0">
                    {activeTab === 'js' && <CodeSnippet code={getJsCode(latestPrompt, latestModel)} />}
                    {activeTab === 'py' && <CodeSnippet code={getPythonCode(latestPrompt, latestModel)} />}
                </div>

                <footer className="mt-6 text-center">
                    <button 
                        onClick={onClose}
                        className="bg-slate-700 hover:bg-slate-600 text-gray-200 px-6 py-2 rounded-md transition-colors font-semibold"
                    >
                        Cerrar
                    </button>
                </footer>
            </div>
        </div>
    )
}

export default ExportModal;