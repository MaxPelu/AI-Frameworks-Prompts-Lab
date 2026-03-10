
# Estructura del Proyecto: Laboratorio de Prompts v4.3.1

La arquitectura del proyecto está diseñada para ser escalable, modular y fácil de mantener, separando claramente la interfaz de usuario, la lógica de negocio (IA) y la base de conocimiento estática.

## Árbol de Directorios Principal

```
/
├── docs/                     # Documentación técnica, PRD, guías de contribución y diseño
├── src/                      # Código fuente principal de la aplicación
│   ├── app/                  # Punto de entrada y orquestación global
│   │   ├── styles/           # Archivos CSS globales (Neon Aurora y Liquid Glass)
│   │   └── App.tsx           # Componente raíz, gestión de estado global y enrutamiento básico
│   ├── components/           # Componentes React organizados por dominio funcional
│   │   ├── shared/           # Componentes UI reutilizables y Dashboards de Ingeniería
│   │   │   ├── AgentsModal.tsx      # Dashboard de Orquestación de Agentes
│   │   │   ├── DataModal.tsx        # Dashboard de Gestión de Datos y RAG
│   │   │   ├── EvalModal.tsx        # Dashboard de Evaluación y Métricas
│   │   │   ├── SecurityModal.tsx    # Dashboard de Guardrails y Seguridad
│   │   │   ├── WorkspaceModal.tsx   # Dashboard de Gestión de Espacios de Trabajo
│   │   │   ├── GuideDashboard.tsx   # Dashboard de Guía Interactiva (v4.3.1)
│   │   │   ├── BuilderCanvas.tsx
│   │   │   ├── Icons.tsx
│   │   │   └── ...
│   │   ├── skills/           # Módulo para gestión de habilidades de agentes
│   │   │   └── AgentSkillsDashboard.tsx
│   │   └── workflow/         # Pipeline principal de creación y refinamiento de prompts
│   │       ├── FileUploader.tsx
│   │       └── WorkflowPanel.tsx
│   ├── config/               # Base de datos estática de Conocimiento (Frameworks)
│   │   ├── constants.ts          # Prompting General y Estructuras Clásicas
│   │   ├── contextConstants.ts   # RAG, Memoria y Recuperación de Contexto
│   │   ├── agentConstants.ts     # Agentes AI, Sistemas Multi-Agente y Autonomía
│   │   ├── codingConstants.ts    # Ingeniería de Software, LLM Ops y Patrones de Código
│   │   ├── businessConstants.ts  # Estrategia Corporativa, Innovación y Negocios
│   │   └── dataConstants.ts      # Data Engineering, Analytics y Arquitectura de Datos
│   ├── lib/                  # Lógica de negocio, servicios externos y utilidades
│   │   ├── geminiService.ts  # Cliente principal para la API de Google GenAI (Incluye lógica de reintentos)
│   │   └── batchUtils.ts     # Utilidades para el procesamiento de archivos CSV y plantillas
│   └── types/                # Definiciones de tipos TypeScript (Interfaces, Enums)
│       └── index.ts          # Tipos globales compartidos en toda la aplicación
├── index.html                # Plantilla HTML principal
├── package.json              # Dependencias y scripts del proyecto
├── tsconfig.json             # Configuración del compilador TypeScript
└── vite.config.ts            # Configuración del bundler Vite
```

## Módulos Clave y Patrones de Diseño

*   **`config/*Constants.ts`**: Estos archivos actúan como la "Base de Datos" de la aplicación. Contienen más de 500 frameworks estructurados como objetos TypeScript. Esta separación por dominios evita tener un único archivo monolítico inmanejable.
*   **`lib/geminiService.ts`**: Centraliza todas las llamadas a la API de Gemini. Implementa un patrón de "Wrapper" (`callGeminiWithRetry`) para manejar de forma robusta los errores de red y los límites de tasa (HTTP 429) mediante Exponential Backoff.
*   **Gestión de Estado**: La aplicación utiliza un enfoque híbrido. El estado global complejo (sesiones, configuraciones) se gestiona en `App.tsx` y se pasa mediante props o Context, mientras que el estado local de la UI se mantiene dentro de los componentes específicos.
*   **Componentes Modulares**: La carpeta `components/shared/` contiene elementos agnósticos al dominio que garantizan la consistencia visual (Liquid Glass UI) en toda la aplicación.
