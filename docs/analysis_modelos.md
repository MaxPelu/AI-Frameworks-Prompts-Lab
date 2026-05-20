# Análisis de Modelos en Google AI Studio (Google I/O 2026)

Este documento detalla el análisis de la disponibilidad de modelos de Google y su integración en la plataforma, asegurando soporte para la frontera SOTA de modelos y las actualizaciones más recientes anunciadas en el Google I/O 2026.

## Nueva Frontera de Modelos (Google I/O 2026)
La alineación insignia (flagship lineup) de Google se ha expandido para redefinir el rendimiento en tiempo real, el razonamiento multimodal nativo y la lógica compleja mediante "Thinking Mode":

1. **Gemini 3.5 Flash (`gemini-3.5-flash`)**:
   El nuevo modelo por defecto de la industria. Ofrece mejoras exponenciales en velocidad de inferencia, destilación avanzada de contexto largo (hasta 2 millones de tokens) y una latencia media de respuesta inferior a 100ms. Es ideal para refinamiento dinámico de prompts.

2. **Gemini 3.5 Flash Thinking (`gemini-3.5-flash-thinking`)**:
   La vertiente de razonamiento optimizada con "Chain of Thought" (CoT) nativo integrado. Ofrece soluciones matemáticas avanzadas, depurado lógico de código y estructuras sintácticas de prompts hiper-segmentadas de forma automática.

3. **Gemini 3.5 Pro (`gemini-3.5-pro`)**:
   El súper cerebro capaz de resolver problemas complejos de múltiples capas con tasas de alucinación mínimas. Excele en la síntesis de arquitecturas de software y la generación de prompts para agentes autónomos.

4. **Gemini Omni (`gemini-omni`)**:
   El modelo unificado multimodal nativo más avanzado de Google. Capaz de interpretar y retornar flujos fluidos de audio estéreo y comprensión de video síncrona, abriendo la puerta a interfaces interactivas por voz real en tiempo real.

## Ecosistema de Modelos (Gemini 3.1)
Establecido en la frontera de eficiencia, razonamiento y multimodalidad:
*   **Gemini 3.1 Pro (`gemini-3.1-pro`)**
*   **Gemini 3.1 Flash (`gemini-3.1-flash`)**
*   **Gemini 3.1 Flash Lite (`gemini-3.1-flash-lite`)**

## Ecosistema Open-Weights (Gemma 4)
Considerando los avances en LLMs destilados, la alineación **Gemma 4** marca la evolución directa con destilación nativa de los checkpoints base de Gemini 3.1:
*   **Gemma 4 (27B) (`gemma-4-27b-it`)**
*   **Gemma 4 (12B) (`gemma-4-12b-it`)**
*   **Gemma 4 (4B) (`gemma-4-4b-it`)**

## Resoluciones Técnicas Implementadas
El tablero de ajustes de esta aplicación ha sido sincronizado completamente con AI Studio:
*   Se añadieron los tipos estrictos a `GeminiModel` en `/src/types/index.ts`.
*   Se registraron en el motor de auto-corrección de rutas en `geminiService.ts` (`resolveModel()`) previniendo caídas de SDK y garantizando la de inyección correcta de la arquitectura subyacente.
*   Se han expuesto las selecciones en `ModelSettingsPanel.tsx`, con un UI pulido para clasificar en bloques limpios de "Gemini 3.5 & Omni" (I/O 2026), "Gemini 3.1", variantes Lite, subseries especializadas "Gemma 4", y los nuevos presupuestos adaptativos de pensamiento (**Low, Medium, High y Super High**) para Gemini 3.5 Flash.
*   Se configuró **Gemini 3.5 Flash Medium** como el motor predeterminado (default) en toda la aplicación para garantizar un balance óptimo entre razonamiento analítico y latencia ultrarrápida.

## Escalabilidad del Budget de Pensamiento (Thinking Mode)
Aunque 3.5 incorpora perfiles por defecto, el sistema local mantiene soporte para especificar la demanda tokenómica de thinking, inyectando buffers (e.g. +2048 tokens de output para evitar el error nativo *Invalid Argument* de la API sobre los budgets).
