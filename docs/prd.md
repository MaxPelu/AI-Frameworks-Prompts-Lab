
# Documento de Requisitos del Producto (PRD): v4.3.3

## 1. Visión del Producto
Convertir el Laboratorio de Prompts en una **Estación de Trabajo de Ingeniería de IA** completa y definitiva para 2026. El objetivo ya no es solo escribir prompts, sino arquitecturar sistemas de IA complejos, diseñar flujos de datos, evaluar el rendimiento de los modelos y definir estrategias de negocio asistidas por modelos SOTA (State of the Art) de Google.

## 2. Requisitos Funcionales (Q1-Q2 2026)

### 2.0 Optimización de Rendimiento y Streaming (v4.3.3)
*   **Arquitectura de Streaming**: Implementación de respuestas en tiempo real para procesos largos (expansión de ideas, optimización y evolución de prompts) para eliminar tiempos de espera y mejorar la percepción de latencia.
*   **Resiliencia de API**: Sistema robusto de reintentos automáticos con *exponential backoff* para manejar límites de cuota (HTTP 429) y errores de red de forma transparente.
*   **Optimización de Utilidades (Fast Settings)**: Aceleración de funciones secundarias (sugerencias, formateo, refinamiento rápido) forzando el uso de modelos ligeros (`gemini-3-flash-preview`) y desactivando características pesadas (búsqueda, modo pensamiento) cuando no son estrictamente necesarias.
*   **Resolución Dinámica de Modelos**: Capacidad de adaptar dinámicamente el modelo utilizado según la tarea, garantizando el mejor equilibrio entre velocidad y capacidad de razonamiento.

### 2.1 Robustecimiento Estratégico (v4.3.2)
*   **Motor de Expansión Conceptual**: Capacidad de transformar una idea inicial en una estructura robusta y detallada sin perder el hilo original, enfocándose en la arquitectura de la idea más que en la respuesta directa.
*   **Sanitización de Datos (PII Scrubbing)**: Protección automática de la privacidad del usuario mediante la eliminación de información sensible antes del procesamiento por IA.
*   **Entrada de Voz**: Integración de dictado por voz para capturar ideas de forma rápida y natural.
*   **Análisis de Calidad de Idea**: Herramientas para evaluar la viabilidad y robustez de una idea antes de proceder a la optimización del prompt.

### 2.1 Onboarding e Instrucción (v4.3.1)
*   **Guía de Usuario Interactiva**: Dashboard multi-sección con navegación lateral que explica los flujos de trabajo clave (Prompting, RAG, Agentes, Evaluación).
*   **Glosario de Ingeniería**: Centro de terminología para estandarizar el lenguaje de IA dentro de la plataforma.
*   **Atajos de Productividad**: Documentación interactiva de comandos rápidos para acelerar el flujo de trabajo del ingeniero.
*   **Accesibilidad de Navegación**: Implementación de controles de salida rápidos (tecla Escape y botones de cierre redundantes) para garantizar que el Hub de instrucción no interrumpa el flujo de trabajo creativo.

### 2.1 Dashboards de Ingeniería Especializados (v4.3.0)
*   **Módulo de Datos & RAG**: Sistema de gestión de conocimiento que permita la carga de archivos, visualización de chunks y configuración de infraestructura vectorial.
*   **Módulo de Evaluación**: Laboratorio para ejecutar suites de pruebas contra prompts, utilizando modelos de lenguaje como jueces para obtener puntuaciones cualitativas y cuantitativas.
*   **Módulo de Agentes**: Interfaz para la definición de agentes autónomos, asignación de herramientas (Function Calling) y selección de patrones de orquestación.
*   **Módulo de Seguridad (Guardrails)**: Implementación de capas de seguridad para prevenir inyecciones de prompts y filtrar información sensible.

### 2.2 Gestión de Espacios de Trabajo (Workspaces)
*   **Dashboard de Espacio**: Cada espacio debe proporcionar una vista general de su salud (prompts, tokens, frameworks).
*   **Scratchpad Contextual**: Bloc de notas persistente y único para cada espacio de trabajo.
*   **Exportación de Espacio**: Capacidad de descargar todo el contexto de un espacio en un solo archivo portable.

### 2.3 Biblioteca de Conocimiento Expandida (Omni-Dominio)
*   **Soporte Multi-Dominio**: La biblioteca debe soportar, categorizar y filtrar eficientemente más de 500 frameworks divididos en: Prompting, Contexto/RAG, Agentes, Codificación, Negocios y Datos.
*   **Búsqueda Semántica Local**: Capacidad de filtrar frameworks por acrónimo, nombre, descripción o categoría en tiempo real sin latencia perceptible.
*   **Niveles de Dificultad**: Clasificación visual de frameworks desde "Fundamentos" hasta "Frontier/SOTA", permitiendo a los usuarios escalar su aprendizaje.

### 2.2 Agent Skills Hub & Toolkit
*   **Repositorio de Habilidades**: Sistema para gestionar capacidades de agentes, permitiendo guardar, editar y organizar instrucciones complejas y herramientas.
*   **Generador de Skills**: Integración con Gemini para crear nuevas habilidades a partir de descripciones de alto nivel.
*   **Soporte de Conceptos Técnicos**: El sistema debe reconocer y sugerir estructuras para herramientas de ingeniería modernas como DSPy, LangGraph, Unsloth, vLLM y LlamaIndex.
*   **Meta-Docs Generator**: Capacidad de generar archivos de documentación estándar para agentes y sistemas de IA (`AGENT.md`, `CONTEXT.md`, `MEMORY.md`, `SYSTEM_PROMPT.txt`).
*   **Evaluación de Calidad**: Integración de un módulo de "Quality Analysis" que evalúe los prompts generados basándose en métricas como Claridad, Especificidad, Robustez y Riesgo Ético.

### 2.3 Meta-Alquimia & Deep Research
*   **Generador de Frameworks (Meta-Alquimia)**: Algoritmo para destilar problemas abstractos o de nicho en acrónimos memorables y pasos estructurados, devolviendo un JSON Schema estricto.
*   **Agente de Investigación (Deep Research)**: Uso de la herramienta `googleSearch` de Gemini para buscar papers recientes (2025-2026), repositorios y artículos técnicos, y convertirlos automáticamente en tarjetas de framework usables en la biblioteca.

### 2.4 Engine Room & Tokenomics
*   **Soporte Gemini 3.1 Series**: Configuración nativa para aprovechar las capacidades de razonamiento profundo de `gemini-3.1-pro-preview`, la velocidad de `gemini-3-flash-preview` y la eficiencia de `gemini-3.1-flash-lite-preview`.
*   **Thinking Budget Control**: Interfaz de usuario para ajustar el presupuesto de tokens de pensamiento (Thinking Tokens) con niveles preestablecidos (Low, Medium, High, Super High), permitiendo al usuario decidir cuánta "reflexión" debe hacer el modelo antes de responder.
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
