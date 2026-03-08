import React, { useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { AgentSkill, GeminiModel, ALL_GEMINI_MODELS } from '../../types/index.ts';
import { XCircleIcon, PlusIcon, PencilIcon, TrashIcon, SparklesIcon, DocumentTextIcon, KeyIcon, ArrowDownTrayIcon, SearchIcon } from '../shared/Icons.tsx';
import { GoogleGenAI } from '@google/genai';

interface AgentSkillsDashboardProps {
    isOpen: boolean;
    onClose: () => void;
    agentSkills: AgentSkill[];
    setAgentSkills: (skills: AgentSkill[]) => void;
    apiKey: string | null;
    inlineMode?: boolean;
}

const AgentSkillsDashboard: React.FC<AgentSkillsDashboardProps> = ({
    isOpen,
    onClose,
    agentSkills,
    setAgentSkills,
    apiKey,
    inlineMode = false
}) => {
    const [editingSkill, setEditingSkill] = useState<Partial<AgentSkill> | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationPrompt, setGenerationPrompt] = useState('');
    const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-2.5-flash-latest');
    const [searchQuery, setSearchQuery] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const filteredSkills = useMemo(() => {
        if (!searchQuery.trim()) return agentSkills;
        const query = searchQuery.toLowerCase();
        return agentSkills.filter(skill => 
            skill.name.toLowerCase().includes(query) || 
            skill.description.toLowerCase().includes(query)
        );
    }, [agentSkills, searchQuery]);

    if (!isOpen) return null;

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;

        Array.from(files as FileList).forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target?.result as string;
                let format: 'text' | 'json' | 'yaml' | 'xml' | 'python' = 'text';
                
                if (file.name.endsWith('.json')) format = 'json';
                else if (file.name.endsWith('.yaml') || file.name.endsWith('.yml')) format = 'yaml';
                else if (file.name.endsWith('.xml')) format = 'xml';
                else if (file.name.endsWith('.py')) format = 'python';

                const newSkill: AgentSkill = {
                    id: crypto.randomUUID(),
                    name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
                    description: `Imported from ${file.name}`,
                    content: content,
                    format: format,
                    enabled: true
                };
                setAgentSkills(prev => [...prev, newSkill]);
            };
            reader.readAsText(file);
        });
        
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleGenerateSkill = async () => {
        if (!apiKey || !generationPrompt) return;
        
        setIsGenerating(true);
        try {
            const ai = new GoogleGenAI({ apiKey });
            const response = await ai.models.generateContent({
                model: selectedModel,
                contents: `Create an agent skill definition based on this request: "${generationPrompt}".
                Return ONLY the raw skill content (markdown, json, yaml, or python) without any conversational text or markdown code blocks around it.
                Make it highly detailed and ready to be used as a system instruction or tool definition for an AI agent.`,
                config: {
                    temperature: 0.7
                }
            });

            const generatedContent = response.text || '';
            
            setEditingSkill({
                id: crypto.randomUUID(),
                name: 'Generated Skill',
                description: generationPrompt,
                content: generatedContent,
                format: 'text',
                enabled: true
            });
            setGenerationPrompt('');
        } catch (error) {
            console.error("Error generating skill:", error);
            alert("Failed to generate skill. Please check your API key and try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const saveSkill = () => {
        if (editingSkill && editingSkill.name && editingSkill.content) {
            const newSkill = editingSkill as AgentSkill;
            const existingIndex = agentSkills.findIndex(s => s.id === newSkill.id);
            
            let updated;
            if (existingIndex >= 0) {
                updated = [...agentSkills];
                updated[existingIndex] = newSkill;
            } else {
                updated = [...agentSkills, newSkill];
            }
            
            setAgentSkills(updated);
            setEditingSkill(null);
        }
    };

    const toggleSkillEnabled = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setAgentSkills(agentSkills.map(skill => 
            skill.id === id ? { ...skill, enabled: !skill.enabled } : skill
        ));
    };

    const exportSkill = (skill: AgentSkill) => {
        let extension = '.txt';
        if (skill.format === 'json') extension = '.json';
        else if (skill.format === 'yaml') extension = '.yaml';
        else if (skill.format === 'xml') extension = '.xml';
        else if (skill.format === 'python') extension = '.py';
        else if (skill.format === 'text') extension = '.md';

        const blob = new Blob([skill.content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${skill.name.replace(/\s+/g, '_').toLowerCase()}${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const content = (
        <div className={`${inlineMode ? 'h-full flex flex-col' : 'fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in'}`}>
            <div className={`${inlineMode ? 'flex-1 flex flex-col overflow-hidden' : 'bg-slate-900 w-full max-w-5xl h-[85vh] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col'}`}>
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-teal-500/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-teal-500/20 rounded-xl text-teal-400">
                            <KeyIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white tracking-tight">Agent Skills Hub</h2>
                            <p className="text-sm text-teal-200/60 font-medium">Manage capabilities for Gemini, Claude, Codex, Antigravity, etc.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                        <XCircleIcon className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar - List of Skills */}
                    <div className="w-1/3 border-r border-white/10 flex flex-col bg-black/20">
                        <div className="p-4 border-b border-white/10 space-y-3">
                            <button 
                                onClick={() => setEditingSkill({ id: crypto.randomUUID(), name: '', description: '', content: '', format: 'text', enabled: true })}
                                className="w-full flex items-center justify-center gap-2 bg-teal-500 text-slate-900 px-4 py-3 rounded-xl text-sm font-bold hover:bg-teal-400 transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                            >
                                <PlusIcon className="w-5 h-5" /> Create New Skill
                            </button>
                            
                            <div className="flex gap-2">
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileUpload} 
                                    className="hidden" 
                                    multiple 
                                    accept=".md,.txt,.json,.yaml,.yml,.xml,.py"
                                />
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-gray-300 px-3 py-2 rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                                >
                                    <DocumentTextIcon className="w-4 h-4" /> Import Files (.md, .json...)
                                </button>
                            </div>
                            
                            <div className="relative">
                                <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input 
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search skills..."
                                    className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-teal-500/50"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {filteredSkills.length === 0 ? (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    {searchQuery ? "No skills found." : "No skills added yet."}
                                </div>
                            ) : (
                                filteredSkills.map(skill => (
                                    <div 
                                        key={skill.id} 
                                        onClick={() => setEditingSkill(skill)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all ${editingSkill?.id === skill.id ? 'bg-teal-500/10 border-teal-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={(e) => toggleSkillEnabled(e, skill.id)}
                                                    className={`w-3 h-3 rounded-full ${skill.enabled ? 'bg-teal-500 shadow-[0_0_8px_rgba(20,184,166,0.6)]' : 'bg-gray-600'}`}
                                                    title={skill.enabled ? "Disable skill" : "Enable skill"}
                                                />
                                                <h4 className="font-bold text-gray-200 text-sm truncate">{skill.name}</h4>
                                            </div>
                                            <span className="text-[9px] uppercase tracking-wider bg-black/40 px-1.5 py-0.5 rounded text-gray-400">{skill.format}</span>
                                        </div>
                                        <p className="text-xs text-gray-500 line-clamp-2 pl-5">{skill.description}</p>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Main Content - Editor */}
                    <div className="flex-1 flex flex-col bg-slate-900/50 relative">
                        {editingSkill ? (
                            <div className="flex-1 flex flex-col p-6 overflow-y-auto custom-scrollbar">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-white">Edit Skill</h3>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => exportSkill(editingSkill as AgentSkill)}
                                            disabled={!editingSkill.name || !editingSkill.content}
                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 text-gray-300 hover:bg-white/10 transition-all flex items-center gap-2 disabled:opacity-50"
                                            title="Export Skill"
                                        >
                                            <ArrowDownTrayIcon className="w-4 h-4" /> Export
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setAgentSkills(agentSkills.filter(s => s.id !== editingSkill.id));
                                                setEditingSkill(null);
                                            }}
                                            className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                                        >
                                            Delete
                                        </button>
                                        <button 
                                            onClick={saveSkill}
                                            disabled={!editingSkill.name || !editingSkill.content}
                                            className="px-6 py-2 rounded-xl text-sm font-bold bg-teal-600/20 border border-teal-500/30 text-teal-100 hover:bg-teal-600/30 disabled:opacity-50 transition-all shadow-lg"
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">Skill Name</label>
                                            <input 
                                                type="text" 
                                                value={editingSkill.name || ''} 
                                                onChange={e => setEditingSkill({...editingSkill, name: e.target.value})}
                                                className="glass-input w-full p-3 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500/50" 
                                                placeholder="e.g. Vercel AI SDK Expert"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">Format</label>
                                            <select 
                                                value={editingSkill.format || 'text'} 
                                                onChange={e => setEditingSkill({...editingSkill, format: e.target.value as any})}
                                                className="glass-input w-full p-3 rounded-xl text-sm bg-slate-800 text-white focus:ring-2 focus:ring-teal-500/50"
                                            >
                                                <option value="text">Markdown / Text</option>
                                                <option value="json">JSON</option>
                                                <option value="yaml">YAML</option>
                                                <option value="python">Python</option>
                                                <option value="xml">XML</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase tracking-wider">Description</label>
                                        <input 
                                            type="text" 
                                            value={editingSkill.description || ''} 
                                            onChange={e => setEditingSkill({...editingSkill, description: e.target.value})}
                                            className="glass-input w-full p-3 rounded-xl text-sm text-white focus:ring-2 focus:ring-teal-500/50" 
                                            placeholder="Brief description of what this skill enables..."
                                        />
                                    </div>

                                    <div className="flex-1 flex flex-col min-h-[300px]">
                                        <label className="text-xs font-bold text-gray-400 block mb-1.5 uppercase tracking-wider flex justify-between items-center">
                                            <span>Content / Definition</span>
                                            <span className="text-[10px] text-teal-400/70 normal-case">Paste raw markdown, code, or JSON here</span>
                                        </label>
                                        <textarea 
                                            value={editingSkill.content || ''} 
                                            onChange={e => setEditingSkill({...editingSkill, content: e.target.value})}
                                            className="glass-input w-full flex-1 p-4 rounded-xl text-sm font-mono leading-relaxed resize-none text-teal-100/90 focus:ring-2 focus:ring-teal-500/50 min-h-[300px]" 
                                            placeholder="Paste the skill definition here..."
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mb-6 border border-teal-500/20">
                                    <SparklesIcon className="w-10 h-10 text-teal-400" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-2">Generate a Skill with Gemini</h3>
                                <p className="text-gray-400 max-w-md mb-8">
                                    Describe the capability you want to add, and Gemini will generate a structured skill definition for you.
                                </p>
                                
                                <div className="w-full max-w-xl bg-black/40 p-2 rounded-2xl border border-white/10 flex flex-col gap-2 shadow-inner">
                                    <div className="flex items-center gap-2 px-2 pt-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Model:</label>
                                        <select 
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
                                            className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 border border-white/10 focus:ring-1 focus:ring-teal-500/50 outline-none"
                                            disabled={isGenerating}
                                        >
                                            {ALL_GEMINI_MODELS.map(model => (
                                                <option key={model} value={model}>{model}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <input 
                                            type="text"
                                            value={generationPrompt}
                                            onChange={(e) => setGenerationPrompt(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleGenerateSkill()}
                                            placeholder="e.g. Create a skill for analyzing React performance..."
                                            className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder-gray-500"
                                            disabled={isGenerating}
                                        />
                                        <button 
                                            onClick={handleGenerateSkill}
                                            disabled={isGenerating || !generationPrompt}
                                            className="bg-teal-500 text-slate-900 px-6 py-3 rounded-xl font-bold hover:bg-teal-400 disabled:opacity-50 transition-all flex items-center gap-2"
                                        >
                                            {isGenerating ? (
                                                <><div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div> Generating...</>
                                            ) : (
                                                <><SparklesIcon className="w-4 h-4" /> Generate</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    if (inlineMode) return content;
    return createPortal(content, document.body);
};

export default AgentSkillsDashboard;
