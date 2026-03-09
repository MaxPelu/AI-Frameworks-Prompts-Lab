
# Especificaciones Técnicas: Laboratorio de Prompts v4.2.3

Este documento detalla las decisiones arquitectónicas y técnicas clave que sustentan la versión 4.2.3 del Laboratorio de Prompts.

## 1. Integración de IA Avanzada (`src/lib/geminiService.ts`)

El núcleo de la aplicación es la integración con la API de Google Gemini a través del SDK `@google/genai`.

### 1.1 Modelos y Capacidades SOTA
El servicio soporta explícitamente la familia **Gemini 3.1** y modelos especializados:
*   **Gemini 3.1 Pro**: Motor principal para tareas de razonamiento complejo, generación de código y evaluación de calidad.
*   **Gemini 3.1 Flash**: Optimizado para tareas de alta velocidad y baja latencia.
*   **Gemini 3.1 Flash Lite**: El modelo más eficiente de la serie 3.1, ideal para tareas rápidas y de bajo costo.
*   **Thinking Config (Presupuesto de Pensamiento)**: Implementación nativa de `thinking_budget`. Para los modelos que lo soportan (ej. `gemini-3.1-pro-preview`, `gemini-3.1-flash-lite-preview`), se puede configurar el nivel de pensamiento con opciones de **Low**, **Medium**, **High** y **Super High**, permitiendo al modelo realizar cadenas de pensamiento ocultas antes de emitir la respuesta final. Esto es crucial para tareas de codificación y lógica matemática.

### 1.2 Motores de Investigación y Creación (Agentes)
*   **Meta-Alquimia (`generateMetaFramework`)**: Utiliza `responseSchema` estricto (JSON Schema) para forzar al modelo a inventar un objeto JSON válido que represente un nuevo framework (Acrónimo, Pasos, Ejemplo). Esto garantiza que la salida sea directamente parseable y renderizable en la UI sin necesidad de expresiones regulares frágiles.
*   **Deep Research (`performDeepResearch`)**: Activa la herramienta `googleSearch` (Grounding) para buscar información *actualizada* y en tiempo real sobre nuevos papers, repositorios y metodologías. Los resultados de la búsqueda se inyectan en el contexto del modelo para generar una tarjeta de framework precisa y referenciada.

### 1.3 Resiliencia y Manejo de Errores
*   **Exponential Backoff (`callGeminiWithRetry`)**: Todas las llamadas a la API de Gemini están envueltas en una función de reintento automático. Si la API devuelve un error 429 (Too Many Requests) o un error de red transitorio, el sistema espera un tiempo exponencialmente creciente antes de reintentar, mejorando drásticamente la estabilidad de la aplicación bajo carga.

## 2. Gestión de Datos Estáticos (Configuración Omni-Dominio)

Dada la expansión a más de 500 frameworks, los archivos de configuración se han dividido por dominio lógico (`codingConstants.ts`, `businessConstants.ts`, `dataConstants.ts`, etc.) para mantener la mantenibilidad del código fuente.

*   **Carga Estática**: Los frameworks se importan estáticamente en tiempo de compilación. Aunque esto aumenta ligeramente el tamaño del bundle inicial, garantiza una latencia de búsqueda de cero milisegundos en el cliente.
*   **Tipado Estricto**: Todos los frameworks implementan la interfaz `Framework` (definida en `src/types/index.ts`), lo que permite el polimorfismo en las tarjetas UI (`FrameworkCard`) y previene errores en tiempo de ejecución.

## 3. Motor de Renderizado Generativo (GenUI)

El componente `GenerativeRenderer` analiza el texto generado por la IA en tiempo real y lo transforma en componentes interactivos.

*   **Live Code Widget**: Detecta bloques de código HTML/JS/CSS y los renderiza de forma segura dentro de un `iframe` aislado (sandbox).
*   **Mermaid Widget**: Detecta bloques de código `mermaid` y utiliza la API de `mermaid.ink` (stateless) para renderizar diagramas de arquitectura, flujos de datos y mapas mentales como imágenes SVG.
*   **Smart Chart Widget**: Detección heurística mejorada para arrays JSON de datos. Si la IA genera un JSON con una estructura tabular reconocible, se renderiza automáticamente un gráfico interactivo utilizando `Chart.js`.

## 4. Telemetría y Tokenomics (`TokenUsageDashboard`)

El sistema de métricas intercepta las respuestas de la API para extraer el objeto `usageMetadata`.

*   **Diferenciación de Tokens**: El dashboard distingue explícitamente entre:
    *   `promptTokenCount`: Tokens de entrada.
    *   `candidatesTokenCount`: Tokens de salida visibles.
    *   `totalTokenCount`: Tokens totales facturables.
*   **Estimación de Costos**: Calcula un costo aproximado basado en los precios públicos de la API de Gemini, multiplicando el uso de tokens por las tarifas específicas de cada modelo.

## 5. Persistencia y Estado Local

*   **Local Storage**: Se mantiene el enfoque *local-first*. Los frameworks personalizados creados por el usuario (`customFrameworks`), el historial de sesiones (`savedPrompts`), las habilidades de agentes (`agentSkills`) y las configuraciones del modelo (`modelSettings`) se serializan y guardan en el `localStorage` del navegador.
*   **Gestión de Estado React**: Se utiliza una combinación de `useState` para el estado local de los componentes y elevación del estado (Lifting State Up) hacia `App.tsx` para el estado global de la sesión activa, evitando la complejidad innecesaria de librerías externas como Redux para este caso de uso.

## 6. Arquitectura de Interfaz Avanzada

*   **React Portals**: Todos los modales y dashboards de alta densidad (Arena, Tokenomics, Skills Hub, etc.) se renderizan utilizando `createPortal`. Esto garantiza que los elementos superpuestos se monten directamente en el `body`, evitando problemas de apilamiento (z-index) y recortes por contenedores con `overflow: hidden`.
*   **Liquid Glass UI System**: Implementación de un sistema de diseño basado en Tailwind CSS 4 que utiliza variables de tema dinámicas para cambiar la estética de la aplicación según el dominio activo, manteniendo una coherencia visual a través de efectos de cristal líquido y neón.
