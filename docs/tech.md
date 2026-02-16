
# Especificaciones Técnicas: Laboratorio de Prompts v3.5.0

## 1. Integración de IA Avanzada (`geminiService.ts`)

### 1.1 Modelos y Capacidades
El servicio ahora soporta explícitamente la familia **Gemini 3.0** y modelos especializados:
*   **Gemini 3.0 Pro/Flash**: Motores principales para razonamiento y velocidad.
*   **Thinking Config**: Implementación de `thinking_budget` para permitir cadenas de pensamiento ocultas antes de la respuesta (útil para Codificación y Lógica).
*   **Modelos Especializados**: Mapeo interno para modelos como `gemini-2.5-flash-native-audio` (aunque la UI es texto, el backend está preparado).

### 1.2 Motores de Investigación y Creación
*   **Meta-Alquimia (`generateMetaFramework`)**: Utiliza `responseSchema` estricto para forzar al modelo a inventar un objeto JSON válido con estructura de framework (Acrónimo, Pasos, Ejemplo).
*   **Deep Research (`performDeepResearch`)**: Activa `googleSearch` tool para buscar información *actualizada* (2024-2026) sobre nuevos papers y repositorios, inyectando los resultados en el flujo de la aplicación.

## 2. Gestión de Datos Estáticos (Config)
Dada la expansión a +500 frameworks, los archivos de configuración se han dividido por dominio (`coding`, `business`, `data`, etc.) para mantener la mantenibilidad.
*   **Carga**: Se importan estáticamente. En futuras versiones, esto podría moverse a un `Lazy Load` o base de datos si el tamaño del bundle afecta el rendimiento (actualmente <1MB de texto, aceptable).
*   **Tipado**: Todos los frameworks comparten la interfaz `Framework` para polimorfismo en las tarjetas UI.

## 3. Motor de Renderizado Generativo (GenUI)
Se mantiene el pipeline de Regex para detectar bloques de código, pero se han optimizado los widgets:
*   **Mermaid Widget**: Renderizado mediante `mermaid.ink` (stateless) para diagramas de arquitectura de agentes.
*   **Smart Chart**: Detección heurística mejorada para arrays JSON de datos.

## 4. Telemetría (Tokenomics)
El sistema de métricas ahora distingue explícitamente:
*   **Thinking Tokens**: Tokens generados internamente por el modelo durante el proceso de razonamiento (no visibles en la salida final, pero facturables).
*   **Cached Tokens**: Tokens que se sirven desde la caché de contexto de Google (ahorro de costes).

## 5. Persistencia
*   **Local Storage**: Se mantiene el enfoque *local-first*. Los frameworks personalizados creados por el usuario se guardan en `customFrameworks` en el navegador.
