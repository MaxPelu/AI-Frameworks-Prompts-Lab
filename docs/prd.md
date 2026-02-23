
# Documento de Requisitos del Producto (PRD): v4.0.0

## 1. Visión del Producto
Convertir el Laboratorio de Prompts en una **Estación de Trabajo de Ingeniería de IA** completa y definitiva para 2026. El objetivo ya no es solo escribir prompts, sino arquitecturar sistemas de IA complejos, diseñar flujos de datos, evaluar el rendimiento de los modelos y definir estrategias de negocio asistidas por modelos SOTA (State of the Art) de Google.

## 2. Requisitos Funcionales (Q1-Q2 2026)

### 2.1 Biblioteca de Conocimiento Expandida (Omni-Dominio)
*   **Soporte Multi-Dominio**: La biblioteca debe soportar, categorizar y filtrar eficientemente más de 500 frameworks divididos en: Prompting, Contexto/RAG, Agentes, Codificación, Negocios y Datos.
*   **Búsqueda Semántica Local**: Capacidad de filtrar frameworks por acrónimo, nombre, descripción o categoría en tiempo real sin latencia perceptible.
*   **Niveles de Dificultad**: Clasificación visual de frameworks desde "Fundamentos" hasta "Frontier/SOTA", permitiendo a los usuarios escalar su aprendizaje.

### 2.2 Integración LLM Engineer Toolkit
*   **Soporte de Conceptos Técnicos**: El sistema debe reconocer y sugerir estructuras para herramientas de ingeniería modernas como DSPy, LangGraph, Unsloth, vLLM y LlamaIndex.
*   **Meta-Docs Generator**: Capacidad de generar archivos de documentación estándar para agentes y sistemas de IA (`AGENT.md`, `CONTEXT.md`, `MEMORY.md`, `SYSTEM_PROMPT.txt`).
*   **Evaluación de Calidad**: Integración de un módulo de "Quality Analysis" que evalúe los prompts generados basándose en métricas como Claridad, Especificidad, Robustez y Riesgo Ético.

### 2.3 Meta-Alquimia & Deep Research
*   **Generador de Frameworks (Meta-Alquimia)**: Algoritmo para destilar problemas abstractos o de nicho en acrónimos memorables y pasos estructurados, devolviendo un JSON Schema estricto.
*   **Agente de Investigación (Deep Research)**: Uso de la herramienta `googleSearch` de Gemini para buscar papers recientes (2025-2026), repositorios y artículos técnicos, y convertirlos automáticamente en tarjetas de framework usables en la biblioteca.

### 2.4 Engine Room & Tokenomics
*   **Soporte Gemini 3.1 Series**: Configuración nativa para aprovechar las capacidades de razonamiento profundo de `gemini-3.1-pro-preview` y la velocidad de `gemini-3-flash-preview`.
*   **Thinking Budget Control**: Interfaz de usuario para ajustar el presupuesto de tokens de pensamiento (Thinking Tokens), permitiendo al usuario decidir cuánta "reflexión" debe hacer el modelo antes de responder.
*   **Contabilidad de Tokens y Costos**: Dashboard detallado que diferencie entre tokens de entrada, salida, caché y pensamiento, calculando un costo estimado por sesión.

### 2.5 Generative UI (GenUI) y Visualización
*   **Widgets Dinámicos**: Renderizado automático de código (Live Code), gráficos (Chart.js) y diagramas (Mermaid.js) basados en la detección de patrones en el texto generado por la IA.
*   **Lienzo de Edición (Builder Canvas)**: Un editor de texto a pantalla completa para refinar prompts largos sin distracciones.

## 3. Experiencia de Usuario (UX)
*   **Navegación por Pestañas**: Panel de conocimiento organizado por dominios (Tabs) para manejar la alta densidad de información sin abrumar al usuario.
*   **Liquid Glass UI**: Estética inmersiva de cristal (glassmorphism), con paletas de colores específicas por dominio (Teal para Prompting, Azul para Código, Amarillo para Negocios, etc.) para mejorar el reconocimiento cognitivo.
*   **Flujo de Trabajo Iterativo**: El panel principal debe permitir un ciclo de "Idea -> Generación -> Evaluación -> Refinamiento" fluido y sin interrupciones.

## 4. Rendimiento y Privacidad
*   **Optimización de Carga**: Carga eficiente de las constantes de configuración masivas para no bloquear el hilo principal al inicio de la aplicación.
*   **Local-First Architecture**: Persistencia de frameworks personalizados, historial de sesiones y configuraciones en `localStorage`, garantizando la soberanía de los datos del usuario y el funcionamiento offline (para la UI, no para la IA).
*   **Gestión de Errores Resiliente**: Implementación de reintentos automáticos (Exponential Backoff) para manejar límites de tasa (Rate Limits) de la API de Gemini de forma transparente para el usuario.
