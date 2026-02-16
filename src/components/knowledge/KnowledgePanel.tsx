
import React, { useState, useEffect, useMemo } from 'react';
import { CATEGORIES, FRAMEWORKS, ROMAN_NUMERALS } from '../../config/constants.ts';
import { CONTEXT_CATEGORIES, CONTEXT_FRAMEWORKS } from '../../config/contextConstants.ts';
import { AGENT_CATEGORIES, AGENT_FRAMEWORKS } from '../../config/agentConstants.ts';
import { CODING_CATEGORIES, CODING_FRAMEWORKS } from '../../config/codingConstants.ts';
import { BUSINESS_CATEGORIES, BUSINESS_FRAMEWORKS } from '../../config/businessConstants.ts';
import { DATA_CATEGORIES, DATA_FRAMEWORKS } from '../../config/dataConstants.ts';
import { Framework, SavedPrompt, GeminiModel, TokenUsage } from '../../types/index.ts';
import FrameworkCard from './FrameworkCard.tsx';
import DeepResearchModal from './DeepResearchModal.tsx';
import MetaFrameworkModal from './MetaFrameworkModal.tsx';
import { SearchIcon, ChevronDownIcon, GlobeAltIcon, AcademicCapIcon, SparklesIcon, BeakerIcon, LightBulbIcon, DiceIcon } from '../shared/Icons.tsx';

type ActiveTab = 'promptFrameworks' | 'contextFrameworks' | 'agentFrameworks' | 'codingFrameworks' | 'businessFrameworks' | 'dataFrameworks';

interface KnowledgePanelProps {
    activeTab: ActiveTab;
    onTabChange: (tab: ActiveTab) => void;
    savedPrompts: SavedPrompt[];
    customFrameworks?: Framework[];
    onAddCustomFramework?: (framework: Framework) => void;
    onDeletePrompt: (id: string) => void;
    onDeleteVersion: (promptId: string, versionId: string) => void;
    onIteratePrompt: (id: string, versionId?: string) => void;
    onSelectFrameworkForBuild: (framework: Framework) => void;
    onToggleFrameworkForCompare: (framework: Framework) => void;
    frameworksInCompareList: string[];
    onExportPrompt: (prompt: SavedPrompt) => void;
    currentModel: GeminiModel;
    onTokenUsageReceived?: (usage: TokenUsage) => void;
    onRenamePrompt: (id: string) => void; 
}

const DIFFICULTY_LEVELS = [
    { id: 1, label: "Nivel 1: Fundamentos", color: "text-teal-400", icon: <LightBulbIcon className="w-5 h-5" />, bg: "from-teal-500/20 to-teal-900/5" },
    { id: 2, label: "Nivel 2: Técnicas Intermedias", color: "text-blue-400", icon: <AcademicCapIcon className="w-5 h-5" />, bg: "from-blue-500/20 to-blue-900/5" },
    { id: 3, label: "Nivel 3: Ingeniería Avanzada", color: "text-purple-400", icon: <BeakerIcon className="w-5 h-5" />, bg: "from-purple-500/20 to-purple-900/5" },
    { id: 4, label: "Nivel 4: SOTA / Frontier", color: "text-pink-400", icon: <SparklesIcon className="w-5 h-5" />, bg: "from-pink-500/20 to-pink-900/5" },
];

const getDifficultyForCategory = (category: string): number => {
    const lowerCat = category.toLowerCase();
    // Simplified logic for brevity, expands to new categories implicitly by keywords
    if (lowerCat.includes('fundamentos') || lowerCat.includes('básic') || lowerCat.includes('estructuración') || lowerCat.includes('estrategia') || lowerCat.includes('introducción')) return 1;
    if (lowerCat.includes('intermedio') || lowerCat.includes('gestión') || lowerCat.includes('análisis') || lowerCat.includes('optimización') || lowerCat.includes('test')) return 2;
    if (lowerCat.includes('avanzad') || lowerCat.includes('arquitectura') || lowerCat.includes('integración') || lowerCat.includes('mlops') || lowerCat.includes('seguridad')) return 3;
    if (lowerCat.includes('sota') || lowerCat.includes('complejo') || lowerCat.includes('meta') || lowerCat.includes('autónom') || lowerCat.includes('multi-agente')) return 4;
    return 2; // Default
};

const ITEMS_PER_PAGE = 9;

const PaginationControls: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
    const pageNumbers: (number | string)[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow + 2) {
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        let startPage = Math.max(2, currentPage - 1);
        let endPage = Math.min(totalPages - 1, currentPage + 1);
        pageNumbers.push(1);
        if (startPage > 2) pageNumbers.push('...');
        if (currentPage <= 3) { startPage = 2; endPage = 4; }
        if (currentPage >= totalPages - 2) { startPage = totalPages - 3; endPage = totalPages - 1; }
        for (let i = startPage; i <= endPage; i++) pageNumbers.push(i);
        if (endPage < totalPages - 1) pageNumbers.push('...');
        pageNumbers.push(totalPages);
    }
    
    return (
        <div className="flex justify-center items-center gap-2 mt-8 pb-4">
            <button 
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 glass-button rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-300"
            >
                Anterior
            </button>
            {pageNumbers.map((page, index) => 
                page === '...' ? (
                    <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">...</span>
                ) : (
                    <button 
                        key={index}
                        onClick={() => onPageChange(page as number)}
                        className={`px-3 py-1 rounded-md transition-colors text-sm font-semibold border ${currentPage === page ? 'bg-teal-500 border-teal-400 text-white shadow-lg' : 'glass-button text-gray-300'}`}
                    >
                        {page}
                    </button>
                )
            )}
            <button 
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 glass-button rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm text-gray-300"
            >
                Siguiente
            </button>
        </div>
    );
};


const KnowledgePanel: React.FC<KnowledgePanelProps> = ({ 
    activeTab, 
    onTabChange, 
    customFrameworks = [],
    onAddCustomFramework,
    onSelectFrameworkForBuild,
    onToggleFrameworkForCompare,
    frameworksInCompareList,
    currentModel,
    onTokenUsageReceived,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isDeepResearchOpen, setIsDeepResearchOpen] = useState(false);
  const [isMetaForgeOpen, setIsMetaForgeOpen] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, activeTab]);

  const lowerCaseQuery = searchQuery.toLowerCase();

  const baseFrameworks = useMemo(() => {
      let base: Framework[] = [];
      if (activeTab === 'promptFrameworks') base = FRAMEWORKS;
      else if (activeTab === 'contextFrameworks') base = CONTEXT_FRAMEWORKS;
      else if (activeTab === 'agentFrameworks') base = AGENT_FRAMEWORKS;
      else if (activeTab === 'codingFrameworks') base = CODING_FRAMEWORKS;
      else if (activeTab === 'businessFrameworks') base = BUSINESS_FRAMEWORKS;
      else if (activeTab === 'dataFrameworks') base = DATA_FRAMEWORKS;

      if (customFrameworks.length > 0) {
          // Simple filter for custom ones (improved logic can be added based on user selection metadata)
          // For now, we append custom frameworks to the current tab if they seem generic or user didn't specify category well
          // In a real app, custom frameworks would have a specific 'type' field.
          return [...customFrameworks, ...base];
      }
      return base;
  }, [activeTab, customFrameworks]);

  const filteredFrameworks = useMemo(() => {
    return baseFrameworks.filter(framework => {
      const matchesCategory = selectedCategory === 'all' || framework.category === selectedCategory;
      if (!matchesCategory) return false;

      const matchesSearch = lowerCaseQuery === '' ||
                            framework.acronym.toLowerCase().includes(lowerCaseQuery) ||
                            framework.name.toLowerCase().includes(lowerCaseQuery) ||
                            framework.description.toLowerCase().includes(lowerCaseQuery);
      return matchesSearch;
    });
  }, [baseFrameworks, selectedCategory, lowerCaseQuery]);

  const getCurrentCategories = () => {
    switch(activeTab) {
        case 'promptFrameworks': return CATEGORIES;
        case 'contextFrameworks': return CONTEXT_CATEGORIES;
        case 'agentFrameworks': return AGENT_CATEGORIES;
        case 'codingFrameworks': return CODING_CATEGORIES;
        case 'businessFrameworks': return BUSINESS_CATEGORIES;
        case 'dataFrameworks': return DATA_CATEGORIES;
        default: return [];
    }
  }
  const currentCategories = getCurrentCategories();

  const renderFlatFrameworks = () => {
    const totalPages = Math.ceil(filteredFrameworks.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentFrameworks = filteredFrameworks.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    if (filteredFrameworks.length === 0) {
        return (
            <div className="col-span-full flex flex-col items-center justify-center h-64 text-gray-500">
                <SearchIcon className="w-12 h-12 mb-3 opacity-20" />
                <p>No se encontraron frameworks que coincidan con tu búsqueda.</p>
            </div>
        );
    }
    
    return (
        <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {currentFrameworks.map((fw: Framework) => (
                    <FrameworkCard 
                        key={fw.id} 
                        framework={fw}
                        onBuild={onSelectFrameworkForBuild}
                        onCompare={onToggleFrameworkForCompare}
                        isComparing={frameworksInCompareList.includes(fw.id)}
                    />
                ))}
            </div>
            {totalPages > 1 && (
                <PaginationControls 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
  };

  const renderGroupedFrameworks = () => {
      const grouped: Record<number, Framework[]> = { 1: [], 2: [], 3: [], 4: [] };
      
      filteredFrameworks.forEach(fw => {
          const level = getDifficultyForCategory(fw.category);
          grouped[level].push(fw);
      });

      return (
          <div className="space-y-12 pb-10 animate-fade-in">
              {DIFFICULTY_LEVELS.map(level => {
                  const frameworksInLevel = grouped[level.id];
                  if (frameworksInLevel.length === 0) return null;

                  return (
                      <div key={level.id} className="relative">
                          <div className={`sticky top-0 z-10 py-3 backdrop-blur-xl border-b border-white/5 mb-4 flex items-center gap-3 bg-gradient-to-r ${level.bg} rounded-lg px-4 shadow-lg`}>
                              <div className={`p-2 rounded-lg bg-black/20 ${level.color}`}>
                                  {level.icon}
                              </div>
                              <h3 className={`text-lg font-bold ${level.color} tracking-wide uppercase`}>
                                  {level.label}
                              </h3>
                              <span className="ml-auto text-xs font-mono text-gray-400 bg-black/30 px-2 py-1 rounded-full border border-white/5">
                                  {frameworksInLevel.length} Frameworks
                              </span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 px-2">
                              {frameworksInLevel.map((fw: Framework) => (
                                  <FrameworkCard 
                                      key={fw.id} 
                                      framework={fw}
                                      onBuild={onSelectFrameworkForBuild}
                                      onCompare={onToggleFrameworkForCompare}
                                      isComparing={frameworksInCompareList.includes(fw.id)}
                                  />
                              ))}
                          </div>
                      </div>
                  );
              })}
          </div>
      );
  };

  return (
    <div className="glass-panel rounded-3xl p-6 flex-1 flex flex-col h-full shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative border-t border-white/20">
      <div className="flex flex-wrap justify-between items-start mb-6 gap-4">
        <div>
            <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-3">
                <span className="w-2 h-8 bg-pink-500 rounded-full shadow-[0_0_15px_var(--color-neon-pink)]"></span>
                Biblioteca de Conocimiento
            </h2>
            <p className="text-gray-400 mt-1 ml-5 text-sm">Explora frameworks clasificados por nivel de dificultad, desde fundamentos hasta SOTA.</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setIsMetaForgeOpen(true)}
                className="bg-gradient-to-br from-purple-600/80 to-pink-600/80 hover:from-purple-500 hover:to-pink-500 flex items-center gap-2 text-white px-4 py-2.5 rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.4)] font-bold text-sm border border-white/10"
                title="Crea un framework de prompting totalmente nuevo e inventado para un problema de nicho."
            >
                <DiceIcon className="w-5 h-5 text-white" />
                Meta-Alquimia
            </button>
            <button 
                onClick={() => setIsDeepResearchOpen(true)}
                className="glass-button flex items-center gap-2 text-white px-4 py-2.5 rounded-xl shadow-[0_0_15px_rgba(45,212,191,0.3)] font-semibold text-sm border border-white/10 hover:border-teal-400/50"
                title="Busca en la web nuevos frameworks académicos o técnicos (2024-2025)."
            >
                <GlobeAltIcon className="w-5 h-5 text-teal-400" />
                Deep Research
            </button>
        </div>
      </div>
      
      <div className="flex border-b border-white/10 mb-6 overflow-x-auto scrollbar-hide pb-2 gap-1">
        <button 
          onClick={() => onTabChange('promptFrameworks')}
          className={`px-4 py-2 text-xs font-medium transition-all duration-300 whitespace-nowrap rounded-t-lg ${activeTab === 'promptFrameworks' ? 'text-teal-400 border-b-2 border-teal-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Prompting
        </button>
        <button 
          onClick={() => onTabChange('contextFrameworks')}
          className={`px-4 py-2 text-xs font-medium transition-all duration-300 whitespace-nowrap rounded-t-lg ${activeTab === 'contextFrameworks' ? 'text-purple-400 border-b-2 border-purple-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Context/RAG
        </button>
         <button 
          onClick={() => onTabChange('agentFrameworks')}
          className={`px-4 py-2 text-xs font-medium transition-all duration-300 whitespace-nowrap rounded-t-lg ${activeTab === 'agentFrameworks' ? 'text-pink-400 border-b-2 border-pink-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Agentes
        </button>
        <button 
          onClick={() => onTabChange('codingFrameworks')}
          className={`px-4 py-2 text-xs font-medium transition-all duration-300 whitespace-nowrap rounded-t-lg ${activeTab === 'codingFrameworks' ? 'text-blue-400 border-b-2 border-blue-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Codificación
        </button>
        <button 
          onClick={() => onTabChange('businessFrameworks')}
          className={`px-4 py-2 text-xs font-medium transition-all duration-300 whitespace-nowrap rounded-t-lg ${activeTab === 'businessFrameworks' ? 'text-yellow-400 border-b-2 border-yellow-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Negocios
        </button>
        <button 
          onClick={() => onTabChange('dataFrameworks')}
          className={`px-4 py-2 text-xs font-medium transition-all duration-300 whitespace-nowrap rounded-t-lg ${activeTab === 'dataFrameworks' ? 'text-green-400 border-b-2 border-green-400 bg-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
        >
          Data/Sota
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text"
            placeholder="Buscar frameworks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input w-full rounded-xl pl-10 pr-4 py-3 text-gray-200 text-sm"
          />
        </div>
        <div className="relative sm:w-64">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="glass-input appearance-none w-full rounded-xl pl-4 pr-10 py-3 text-gray-200 text-sm cursor-pointer"
            >
              <option value="all" className="bg-indigo-950 text-white">-- Ver por Niveles (Todos) --</option>
              {currentCategories.map((cat, index) => (
                <option key={index} value={cat} className="bg-indigo-950 text-white">{`${ROMAN_NUMERALS[index] || ''}. ${cat}`}</option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
        {searchQuery === '' && selectedCategory === 'all' 
            ? renderGroupedFrameworks() 
            : renderFlatFrameworks()
        }
      </div>

      <DeepResearchModal 
        isOpen={isDeepResearchOpen}
        onClose={() => setIsDeepResearchOpen(false)}
        onAddFramework={(fw) => {
            if (onAddCustomFramework) onAddCustomFramework(fw);
        }}
        model={currentModel}
        onTokenUsageReceived={onTokenUsageReceived}
      />
      
      <MetaFrameworkModal
        isOpen={isMetaForgeOpen}
        onClose={() => setIsMetaForgeOpen(false)}
        onAddFramework={(fw) => {
            if (onAddCustomFramework) onAddCustomFramework(fw);
        }}
        model={currentModel}
        onTokenUsageReceived={onTokenUsageReceived}
      />
    </div>
  );
};

export default KnowledgePanel;
