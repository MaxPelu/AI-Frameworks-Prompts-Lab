
# Especificaciones de Diseño (UI/UX): Liquid Glass v3.5.0

## Concepto Visual: "Omni-Forge"
La interfaz se expande para acomodar múltiples dominios de conocimiento sin perder la coherencia estética.

### Sistema de Colores por Dominio
Para facilitar la navegación rápida en la Biblioteca de Conocimiento:
1.  **Prompting (Teal)**: `#2DD4BF`. El núcleo de la aplicación.
2.  **Contexto/RAG (Púrpura)**: `#A855F7`. Conexión y memoria.
3.  **Agentes (Rosa)**: `#EC4899`. Autonomía y simulación.
4.  **Codificación (Azul)**: `#3B82F6`. Estructura y lógica técnica.
5.  **Negocios (Amarillo/Oro)**: `#EAB308`. Estrategia y valor.
6.  **Data/SOTA (Verde)**: `#22C55E`. Datos crudos y estado del arte.

### Componentes de UX Críticos

#### 1. Panel de Conocimiento Tabulado (`KnowledgePanel`)
*   **Navegación**: Barra de pestañas superior con indicador de actividad deslizante.
*   **Filtros**: Dropdown de categorías dinámico que cambia según la pestaña activa (ej. muestra categorías de "Negocios" solo cuando la pestaña de Negocios está activa).
*   **Tarjetas**: Diseño unificado `FrameworkCard` que soporta metadatos ricos (fuente, ejemplo, descripción).

#### 2. Modales de Creación (Meta-Alquimia & Deep Research)
*   **Meta-Alquimia**: Estética "Mística/Tecnológica" con gradientes Púrpura-Rosa profundos. Input grande para descripción de problemas de nicho.
*   **Deep Research**: Estética "Cyber-Search" con acentos Teal/Cian. Lista de resultados con acciones rápidas de "Añadir a Biblioteca".

#### 3. Dashboard de Tokenomics
*   **Visualización**: Gráficos de Chart.js optimizados para modo oscuro (colores neón sobre fondo transparente).
*   **KPIs**: Tarjetas de alto contraste para métricas críticas (Coste, Tokens Totales, Thinking Budget).

### Micro-Interacciones
*   **Hover Glow**: Las tarjetas de frameworks emiten un resplandor del color de su categoría al pasar el mouse.
*   **Loading States**: Spinners específicos por contexto (ej. un cubo giratorio para Codificación, destellos para Prompting).
