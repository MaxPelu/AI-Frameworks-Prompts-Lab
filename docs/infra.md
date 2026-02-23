
# Infraestructura y Seguridad (v4.0.0)

## Arquitectura del Sistema

El Laboratorio de Prompts 2026 está diseñado con una arquitectura "Edge-First SPA" (Single Page Application), priorizando la velocidad, la privacidad y la ejecución en el lado del cliente.

### 1. Despliegue SPA (Client-Side)
*   **Sin Backend Propio**: La aplicación se sirve como un conjunto de archivos estáticos (HTML, CSS, JS). No hay un servidor Node.js o Python intermedio gestionando el estado de la aplicación.
*   **Llamadas Directas a API**: Todas las interacciones con los modelos de IA se realizan directamente desde el navegador del usuario hacia la API de Google Gemini, utilizando el SDK `@google/genai`.

### 2. Gestión de Datos y Estado
Con la introducción de **+500 frameworks** en múltiples dominios:
*   **Base de Conocimiento Estática**: Los frameworks están codificados (hardcoded) en archivos de constantes (`src/config/*Constants.ts`). Esto permite que el bundler (Vite) los empaquete eficientemente.
*   **Ventaja de Latencia**: Al no depender de una base de datos externa para leer los frameworks, la búsqueda, el filtrado y la navegación por la biblioteca tienen una latencia de cero milisegundos.
*   **Estado Local**: El estado de la aplicación (sesiones activas, configuraciones de UI) se gestiona mediante React State y Context.

### 3. Persistencia de Datos (Local-First)
Para garantizar la privacidad y la soberanía de los datos del usuario:
*   **`localStorage`**: Se utiliza para almacenar:
    *   `savedPrompts`: El historial de sesiones y versiones de prompts creados por el usuario.
    *   `customFrameworks`: Los frameworks generados a través de Meta-Alquimia o Deep Research.
    *   `modelSettings`: Las preferencias de configuración de los modelos (temperatura, modelo por defecto, etc.).
*   **Exportación/Importación**: Los usuarios pueden exportar sus datos (prompts y métricas) en formatos JSON o CSV para realizar copias de seguridad o análisis externos.

## Integración de Servicios Externos (SOTA)

1.  **Google Gemini API (v3.1 / v2.5)**: El motor de inteligencia principal.
    *   **Thinking Tokens**: La infraestructura soporta la configuración y recepción de tokens de pensamiento (razonamiento oculto), crucial para tareas complejas.
    *   **Grounding (Google Search)**: Se utiliza la herramienta `googleSearch` nativa de la API para habilitar la función de "Deep Research", permitiendo al modelo acceder a información en tiempo real.
2.  **Mermaid.ink**: Servicio externo sin estado utilizado para renderizar diagramas de arquitectura basados en la sintaxis de Mermaid.js generada por la IA.

## Seguridad y Privacidad

*   **Gestión de API Keys**: 
    *   En el entorno de desarrollo, la API Key se carga desde un archivo `.env` (`VITE_GEMINI_API_KEY`).
    *   En un entorno de producción (si se despliega), se recomienda implementar un mecanismo seguro para que el usuario introduzca su propia API Key, la cual se almacenaría temporalmente en la memoria de la sesión (Session Storage) y **nunca** se enviaría a servidores de terceros (excepto a Google).
*   **Cero Telemetría**: La aplicación no incluye scripts de seguimiento (tracking) ni envía datos de uso a servidores propios. Toda la analítica (Tokenomics) se calcula y almacena localmente.
*   **Ejecución de Código (Live Code)**: El widget de "Live Code" renderiza HTML/JS/CSS en un `iframe` aislado (sandbox) para prevenir ataques XSS (Cross-Site Scripting) al ejecutar código generado por la IA.

## Gestión de Cuotas y Costos

*   **Client-Side Metering (Tokenomics)**: Debido al uso intensivo de modelos avanzados (Gemini 3.1 Pro) y la habilitación del "Thinking Budget", el consumo de tokens puede ser significativo.
*   El dashboard de Tokenomics intercepta las respuestas de la API para extraer los metadatos de uso (`usageMetadata`) y calcula estimaciones de costo basadas en los precios públicos de la API de Gemini, ayudando al usuario a mantener el control sobre su facturación.
