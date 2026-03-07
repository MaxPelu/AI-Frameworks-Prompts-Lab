
# Especificaciones de Diseño (UI/UX): Liquid Glass v4.2.0

## Concepto Visual: "Omni-Forge"
La interfaz se expande para acomodar múltiples dominios de conocimiento sin perder la coherencia estética. El diseño "Liquid Glass" busca transmitir una sensación de tecnología avanzada, limpieza y enfoque profesional, utilizando transparencias, desenfoques de fondo (backdrop-blur) y bordes sutiles.

### Sistema de Colores por Dominio
Para facilitar la navegación rápida y el reconocimiento cognitivo en la Biblioteca de Conocimiento, cada dominio tiene asignado un color temático:

1.  **Prompting (Teal)**: `#2DD4BF`. El núcleo de la aplicación, representa claridad y estructura.
2.  **Contexto/RAG (Púrpura)**: `#A855F7`. Conexión, memoria y profundidad semántica.
3.  **Agentes (Rosa)**: `#EC4899`. Autonomía, simulación y sistemas dinámicos.
4.  **Codificación (Azul)**: `#3B82F6`. Estructura, lógica técnica y precisión.
5.  **Negocios (Amarillo/Oro)**: `#EAB308`. Estrategia, valor y metodologías corporativas.
6.  **Data/SOTA (Verde)**: `#22C55E`. Datos crudos, estado del arte y flujos de información.

### Componentes de UX Críticos

#### 1. Panel de Conocimiento Tabulado (`KnowledgePanel`)
*   **Navegación**: Barra de pestañas superior con indicador de actividad deslizante para una transición suave entre dominios.
*   **Filtros**: Dropdown de categorías dinámico que cambia según la pestaña activa (ej. muestra categorías de "Negocios" solo cuando la pestaña de Negocios está activa).
*   **Tarjetas (`FrameworkCard`)**: Diseño unificado que soporta metadatos ricos (fuente, ejemplo, descripción). Utilizan un efecto de "glassmorphism" con bordes que se iluminan al hacer hover con el color del dominio correspondiente.

#### 2. Modales de Creación (Meta-Alquimia & Deep Research)
*   **Meta-Alquimia**: Estética "Mística/Tecnológica" con gradientes Púrpura-Rosa profundos. Input grande para descripción de problemas de nicho, enfatizando la creación de algo nuevo.
*   **Deep Research**: Estética "Cyber-Search" con acentos Teal/Cian. Lista de resultados con acciones rápidas de "Añadir a Biblioteca", simulando una terminal de búsqueda avanzada.

#### 3. Dashboard de Tokenomics (`TokenUsageDashboard`)
*   **Visualización**: Gráficos de Chart.js optimizados para modo oscuro (colores neón sobre fondo transparente, líneas de cuadrícula sutiles).
*   **KPIs**: Tarjetas de alto contraste para métricas críticas (Coste Estimado, Tokens Totales, Thinking Budget).
*   **Pestañas**: Separación clara entre "Resumen General", "Uso por Modelo" y "Logs Detallados".

#### 4. Agent Skills Hub (`AgentSkillsDashboard`)
*   **Estética**: "Neural-Forge" con gradientes Teal-Esmeralda.
*   **Layout**: Diseño de panel dividido (Sidebar para lista de habilidades, Main para editor/generador).
*   **Editor**: Integración de un editor de código minimalista con resaltado de sintaxis básico para diferentes lenguajes (.py, .json, .md).

#### 5. Panel de Flujo de Trabajo (`WorkflowPanel`)
*   **Estructura**: Diseño en columnas o paneles colapsables para manejar la complejidad de las opciones sin abrumar al usuario.
*   **Controles de Modelo**: Sliders y toggles estilizados para configurar la temperatura, top-k, y el selector de "Thinking Level" con 4 niveles de intensidad (Low, Medium, High, Super High).
*   **Feedback Visual**: Spinners y mensajes de estado claros durante las llamadas a la API de Gemini.

### Micro-Interacciones y Animaciones
*   **Hover Glow**: Las tarjetas de frameworks y los botones principales emiten un resplandor sutil al pasar el mouse, mejorando la affordance.
*   **Loading States**: Spinners específicos por contexto (ej. un cubo giratorio para Codificación, destellos para Prompting) para mantener al usuario informado durante esperas largas.
*   **Transiciones**: Uso de `framer-motion` (o transiciones CSS nativas) para la apertura de modales, cambio de pestañas y aparición de nuevos elementos en listas.

### Tipografía
*   **Primaria**: `Inter` o fuente sans-serif del sistema para legibilidad en interfaces densas.
*   **Secundaria (Código/Datos)**: `JetBrains Mono` o `Fira Code` para bloques de código, JSON y métricas, reforzando la estética técnica.

### Accesibilidad
*   **Contraste**: Asegurar un contraste adecuado entre el texto y los fondos "glassmorphism".
*   **Navegación por Teclado**: Soporte básico para tabulación a través de los controles principales.
