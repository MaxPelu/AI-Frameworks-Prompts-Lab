
# Estructura del Proyecto: Laboratorio de Prompts v3.5.0

## Árbol de Directorios

```
/
├── docs/                     # Documentación técnica y de diseño
├── src/
    ├── app/
    │   ├── styles/           # Neon Aurora y Liquid Glass CSS
    │   └── App.tsx           # Estado Global y Orquestación
    ├── components/
    │   ├── arena/            # Entorno de pruebas y ejecución
    │   │   ├── ArenaModal.tsx
    │   │   └── ArenaPanel.tsx
    │   ├── batch/            # Pruebas masivas CSV
    │   │   └── BatchTestingModal.tsx
    │   ├── genui/            # Motor de Generative UI
    │   │   ├── GenerativeRenderer.tsx
    │   │   └── widgets/
    │   │       ├── LiveCodeWidget.tsx
    │   │       ├── MermaidWidget.tsx
    │   │       └── SmartChartWidget.tsx
    │   ├── knowledge/        # Biblioteca de Conocimiento Omni-Dominio
    │   │   ├── DeepResearchModal.tsx
    │   │   ├── MetaFrameworkModal.tsx
    │   │   ├── FrameworkCard.tsx
    │   │   ├── KnowledgePanel.tsx
    │   │   └── SavedPromptCard.tsx
    │   ├── metrics/          # Tokenomics y Dashboard
    │   │   └── TokenUsageDashboard.tsx
    │   ├── shared/           # Componentes UI reutilizables
    │   │   ├── BuilderCanvas.tsx
    │   │   ├── CanvasModal.tsx
    │   │   ├── ComparisonTray.tsx
    │   │   ├── ExportModal.tsx
    │   │   ├── Icons.tsx
    │   │   ├── LengthModifierDropdown.tsx
    │   │   ├── ModelSettingsPanel.tsx
    │   │   ├── QualityAnalysisModal.tsx
    │   │   ├── SafetySettingsModal.tsx
    │   │   └── Toast.tsx
    │   └── workflow/         # Pipeline de creación
    │       ├── FileUploader.tsx
    │       └── WorkflowPanel.tsx
    ├── config/               # Base de datos de Conocimiento (SOTA)
    │   ├── constants.ts          # Prompting General
    │   ├── contextConstants.ts   # RAG & Contexto
    │   ├── agentConstants.ts     # Agentes AI & Multi-Agente
    │   ├── codingConstants.ts    # Ingeniería de Software & LLM Ops
    │   ├── businessConstants.ts  # Estrategia & Negocios
    │   └── dataConstants.ts      # Data Engineering & Analytics
    ├── lib/                  # Lógica de IA y Utilidades
    │   ├── geminiService.ts  # Cliente Google GenAI (Thinking, Grounding)
    │   └── batchUtils.ts     # Procesador de plantillas
    └── types/                # Tipado estricto TypeScript
```

## Módulos Clave Nuevos
*   **`config/*Constants.ts`**: Contienen la base de datos estática de más de 500 frameworks, clasificados y con metadatos de fuente.
*   **`codingConstants.ts`**: Específicamente contiene los frameworks del "LLM Engineer Toolkit" (DSPy, Unsloth, etc.).
*   **`KnowledgePanel.tsx`**: Reestructurado para soportar navegación por pestañas y búsqueda profunda.
