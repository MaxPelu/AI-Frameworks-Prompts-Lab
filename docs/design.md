
# Especificaciones de Diseño (UI/UX): Liquid Glass v4.3.3

## Concepto Visual: "Omni-Forge"
La interfaz se expande para acomodar múltiples dominios de conocimiento sin perder la coherencia estética. El diseño "Liquid Glass" busca transmitir una sensación de tecnología avanzada, limpieza y enfoque profesional, utilizando transparencias, desenfoques de fondo (backdrop-blur) y bordes sutiles.

### Sistema de Colores por Dominio & Dashboard
Para facilitar la navegación rápida y el reconocimiento cognitivo, se han asignado colores temáticos a los nuevos dashboards:

1.  **Guía (Teal)**: `#2DD4BF`. Representa aprendizaje, claridad y soporte.
2.  **Datos & RAG (Azul)**: `#3B82F6`. Representa flujo, almacenamiento y profundidad.
3.  **Evaluación (Esmeralda)**: `#10B981`. Representa precisión, éxito y validación.
4.  **Agentes (Naranja)**: `#F97316`. Representa acción, autonomía y energía.
5.  **Seguridad (Rojo)**: `#EF4444`. Representa protección, alerta y límites.

### Componentes de UX Críticos

#### 0. Optimización de Rendimiento y Streaming (v4.3.3)
*   **Streaming UI**: Visualización progresiva del texto generado (efecto máquina de escribir) para mantener al usuario enganchado durante procesos largos (ej. evolución de prompts).
*   **Botones de Acción Rápida (Fast Settings)**: Botones secundarios (como "Sugerir Framework" o "Sugerir Caso de Uso") que responden casi instantáneamente gracias a la optimización de latencia en el backend, mejorando la fluidez del flujo de trabajo.
*   **Indicadores de Reintento**: Feedback visual sutil cuando una llamada a la API falla y se está reintentando automáticamente en segundo plano (Exponential Backoff).

#### 1. Robustecimiento Estratégico (v4.3.2)
*   **Motor de Robustez UI**: Panel con gradiente Indigo-Teal y borde sutil de cristal líquido. Incluye un indicador de estado animado ("SOTA v5.1") para transmitir precisión técnica.
*   **Botón de Acción "Robustecer"**: Botón de alto impacto con gradiente Teal-Indigo, efecto de brillo al pasar el mouse (hover shine) y animación de escala al hacer clic.
*   **Selectores de Framework**: Dropdown estilizado con iconos integrados (CpuChipIcon) y agrupamiento por categorías para facilitar la selección de la metodología de expansión.
*   **Feedback de Proceso**: Modal de dashboard especializado que muestra el progreso del robustecimiento con una barra de progreso indefinida y mensajes de estado contextuales.
*   **Indicadores de Entrada**: Iconos de micrófono (voz) y escudo (PII) integrados en el área de texto para una experiencia de entrada multimodal y segura.

#### 1. Guía de Usuario Interactiva (v4.3.1)
*   **Sidebar de Navegación**: Menú vertical izquierdo con iconos minimalistas y etiquetas en mayúsculas para una navegación rápida entre secciones de aprendizaje.
*   **Contenido Enriquecido**: Uso de grids, tablas de atajos y tarjetas de pasos para presentar información densa de forma digerible.
*   **Modo Dual**: Capacidad de visualizarse como un modal centralizado o como un panel integrado en el flujo de trabajo.
*   **Controles de Salida**: Botón de cierre (X) en el encabezado y botón de "Cerrar Guía" en la base del sidebar con acento de color rojo sutil para indicar salida.

#### 1. Dashboards de Ingeniería (Modales 2.0 - v4.3.0)
*   **Layout de Doble Panel**: Sidebar izquierdo para navegación por categorías y área principal derecha para visualización de datos y controles.
*   **Micro-Dashboard de Status**: Grid de 3 columnas en la parte superior de cada modal para mostrar KPIs rápidos (ej. "Tests Pasados", "Documentos Subidos").
*   **Tabs de Navegación**: Pestañas horizontales con bordes inferiores animados para cambiar entre sub-vistas (ej. de "Archivos" a "Vector DB").

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

#### 6. Layout de Inicio (Home View)
*   **Encabezado Descriptivo**: Se ha incorporado una sección introductoria prominente debajo del Header principal y antes del área de trabajo.
*   **Tipografía**: Título "Workbench de Ingeniería & Estrategia de AI" con gradiente (Orange-Pink) y estilo itálico/uppercase para impacto visual.
*   **Propósito**: Clarificar la propuesta de valor de la herramienta ("Suite integral para diseñar, optimizar y evaluar sistemas de IA") de inmediato al usuario.

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
