
# Documento de Requisitos del Producto (PRD): v3.5.0

## 1. Visión del Producto
Convertir el Laboratorio de Prompts en una **Estación de Trabajo de Ingeniería de IA** completa. El objetivo ya no es solo escribir prompts, sino arquitecturar sistemas de IA, diseñar flujos de datos y definir estrategias de negocio asistidas por modelos SOTA.

## 2. Requisitos Funcionales (Q1 2026)

### 2.1 Biblioteca de Conocimiento Expandida
*   **Soporte Multi-Dominio**: La biblioteca debe soportar y filtrar eficientemente más de 500 frameworks divididos en: Prompting, Contexto, Agentes, Codificación, Negocios y Datos.
*   **Búsqueda Semántica Local**: Capacidad de filtrar frameworks por acrónimo, nombre, descripción o categoría en tiempo real.
*   **Niveles de Dificultad**: Clasificación visual de frameworks desde "Fundamentos" hasta "Frontier/SOTA".

### 2.2 Integración LLM Engineer Toolkit
*   **Soporte de Conceptos Técnicos**: El sistema debe reconocer y sugerir estructuras para herramientas de ingeniería como DSPy, LangGraph, y Unsloth.
*   **Meta-Docs Generator**: Capacidad de generar archivos de documentación estándar para agentes (`AGENT.md`, `CONTEXT.md`, `MEMORY.md`).

### 2.3 Meta-Alquimia & Deep Research
*   **Generador de Frameworks**: Algoritmo para destilar problemas abstractos en acrónimos y pasos estructurados (JSON Schema).
*   **Agente de Investigación**: Uso de `googleSearch` tool para encontrar papers recientes (2024-2026) y convertirlos en tarjetas de framework usables.

### 2.4 Engine Room & Tokenomics
*   **Soporte Gemini 3.0/2.5**: Configuración nativa para `thinking_budget` y modelos `flash-lite`.
*   **Contabilidad de Tokens**: Dashboard detallado que diferencie entre tokens de entrada, salida, caché y pensamiento (thinking tokens).

### 2.5 Generative UI (GenUI)
*   **Widgets Dinámicos**: Renderizado automático de código, gráficos y diagramas Mermaid basados en la detección de patrones en el stream de respuesta.

## 3. Experiencia de Usuario (UX)
*   **Navegación por Pestañas**: Panel de conocimiento organizado por dominios (Tabs) para manejar la densidad de información.
*   **Liquid Glass UI**: Estética de cristal inmersiva, con paletas de colores específicas por dominio (Teal para Datos, Azul para Código, Amarillo para Negocios).

## 4. Rendimiento y Privacidad
*   **Optimización de JSON**: Carga perezosa o paginada de las constantes de configuración para no bloquear el hilo principal al inicio.
*   **Local-First**: Persistencia de frameworks personalizados y sesiones en `localStorage`, garantizando soberanía de datos.
