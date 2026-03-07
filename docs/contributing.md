# Guía de Contribución: v4.2.0

¡Gracias por tu interés en contribuir al **Laboratorio de Prompts 2026**! Estamos construyendo el estándar de facto para la Ingeniería de IA Multimodal, Orquestación de Agentes y Alquimia de Metodologías. Tu ayuda es fundamental para mantener este proyecto a la vanguardia.

## ¿Cómo puedes ayudar?

### 1. Inventores de Frameworks (Knowledge Base)
¿Has usado la **Meta-Alquimia** para crear una metodología increíble o has descubierto un nuevo paper revolucionario? Considera proponer su inclusión como framework estándar en nuestra base de datos estática:
*   `src/config/constants.ts` (Prompts generales y estructuras base).
*   `src/config/contextConstants.ts` (RAG, Memoria y Recuperación).
*   `src/config/agentConstants.ts` (Sistemas Multi-Agente y Autonomía).
*   `src/config/codingConstants.ts` (Ingeniería de Software y LLM Ops).
*   `src/config/businessConstants.ts` (Estrategia y Negocios).
*   `src/config/dataConstants.ts` (Ingeniería de Datos y Analytics).

**Requisito**: Todo nuevo framework debe incluir un `id` único, un `acronym` memorable, una `description` clara y un `example` práctico.

### 2. Nuevos Widgets de GenUI (Generative UI)
Buscamos expandir la capacidad visual del motor de renderizado. Puedes añadir widgets en `src/components/genui/widgets/`:
*   Visores de mapas interactivos (GeoJSON, Leaflet).
*   Consolas de ejecución de Python real en el navegador (Pyodide).
*   Visualizadores de arquitecturas de redes neuronales o grafos de conocimiento complejos.
*   Reproductores de audio/video generados por IA.

### 3. Optimizadores de IA (Core Engine)
Mejora las instrucciones de sistema (System Prompts) en `src/lib/geminiService.ts` para que la expansión, optimización y análisis de prompts sea aún más precisa, aprovechando las nuevas capacidades de razonamiento de los modelos Gemini 3.1 Pro y Flash Lite.

### 4. Reporte de Bugs y Mejoras de UI/UX
Si encuentras un error o tienes una idea para mejorar la interfaz "Liquid Glass", abre un Issue detallando el problema o la propuesta.

## Estándares de Código

Para mantener la calidad y consistencia del proyecto, te pedimos que sigas estas directrices:

*   **Estilos (Tailwind CSS 4)**: Usa las clases de utilidad del sistema "Neon Aurora" y "Liquid Glass" (ej. `glass-panel`, `glass-button`, `text-teal-400`). Evita CSS personalizado a menos que sea estrictamente necesario.
*   **TypeScript**: Tipado estricto es obligatorio. Evita el uso de `any`. Define interfaces claras en `src/types/index.ts`.
*   **Componentes React**: Usa componentes funcionales y Hooks. Mantén los componentes pequeños y enfocados en una sola responsabilidad.
*   **UX/UI**: Mantén la filosofía de "mínima fricción" y alineación superior en modales de alta densidad. Asegúrate de que la interfaz sea responsiva y accesible.
*   **Manejo de Errores**: Proporciona mensajes de error claros y amigables para el usuario, especialmente en las llamadas a la API de Gemini.

## Proceso de Pull Request (PR)

1.  **Haz un Fork** del repositorio a tu cuenta de GitHub.
2.  **Crea tu rama** desde `main` con un nombre descriptivo: `git checkout -b feature/mi-mejor-funcion` o `fix/correccion-bug`.
3.  **Desarrolla** tu funcionalidad o corrección.
4.  **Prueba** exhaustivamente el renderizado y la lógica en la **Arena de Pruebas** localmente. Asegúrate de que no haya errores en la consola.
5.  **Haz Commit** de tus cambios con mensajes claros y convencionales (ej. `feat: añade widget de mapas`, `fix: corrige error en exportación CSV`).
6.  **Haz Push** a tu rama: `git push origin feature/mi-mejor-funcion`.
7.  **Envía tu PR** hacia la rama `main` del repositorio original. Incluye una descripción detallada de la lógica de IA añadida, capturas de pantalla si hay cambios visuales, y el problema que resuelve.

## Revisión de Código

El equipo principal revisará tu PR lo antes posible. Es posible que te pidamos realizar algunos cambios antes de fusionarlo. ¡Agradecemos tu paciencia y colaboración!