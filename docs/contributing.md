# Guía de Contribución: v3.2.0

¡Gracias por unirte al Laboratorio de Prompts! Estamos construyendo el estándar para la Ingeniería de IA Multimodal y Alquimia de Metodologías.

## ¿Cómo puedes ayudar?

### 1. Inventores de Frameworks
¿Has usado la **Meta-Alquimia** para crear una metodología increíble? Considera proponer su inclusión como framework estándar en:
*   `src/config/constants.ts` (Prompts generales).
*   `src/config/contextConstants.ts` (RAG y Memoria).
*   `src/config/agentConstants.ts` (Agentes).

### 2. Nuevos Widgets de GenUI
Buscamos expandir la capacidad visual. Puedes añadir widgets en `src/components/genui/widgets/`:
*   Visores de mapas interactivos.
*   Consolas de ejecución de Python real (Pyodide).
*   Visualizadores de arquitecturas de redes neuronales.

### 3. Optimizadores de IA
Mejora las instrucciones de sistema en `geminiService.ts` para que la expansión y optimización de prompts sea aún más precisa según los nuevos modelos Gemini 3.0.

## Estándares de Código
*   **Tailwind**: Usa las clases de utilidad Liquid Glass (`glass-panel`, `glass-button`).
*   **TypeScript**: Tipado estricto. Evita `any`.
*   **UX**: Mantén la filosofía de "mínima fricción" y alineación superior en modales de alta densidad.

## Proceso de Pull Request
1.  Haz un Fork.
2.  Crea tu rama: `feature/mi-mejor-funcion`.
3.  Prueba el renderizado en la **Arena de Pruebas**.
4.  Envía tu PR con una descripción clara de la lógica de IA añadida.