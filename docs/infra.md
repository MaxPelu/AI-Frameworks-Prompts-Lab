
# Infraestructura y Seguridad (v3.5.0)

## Despliegue SPA (Client-Side)
La aplicación mantiene su arquitectura "Edge-First SPA".

### Gestión de Datos Estáticos
Con la introducción de **+500 frameworks** en múltiples archivos de constantes:
*   Los datos se empaquetan con el bundle de la aplicación.
*   No hay base de datos backend. Toda la "inteligencia" de la biblioteca es estática o generada dinámicamente por la IA.
*   **Ventaja**: Latencia cero al navegar por la biblioteca. Búsqueda instantánea en el cliente.

### Servicios Externos SOTA
1.  **Google Gemini API (v3.0/2.5)**: Motor principal.
    *   **Thinking Tokens**: Se gestionan y visualizan en la interfaz, permitiendo al usuario entender el coste del "razonamiento oculto".
    *   **Grounding**: Esencial para las funciones de "Deep Research" y "Expansión Contextual".
2.  **Mermaid.ink**: Renderizado de diagramas.

### Seguridad y Privacidad
*   **API Key**: Permanece en `process.env` o almacenamiento de sesión. No se guarda en localStorage persistente por defecto (salvo configuración de usuario explícita si se implementara).
*   **Datos de Usuario**: Los "Custom Frameworks" y el historial de "Saved Prompts" viven exclusivamente en el `localStorage` del navegador del usuario. No hay telemetría de servidor.

## Gestión de Cuotas
*   **Client-Side Metering**: El dashboard de Tokenomics es crítico en la v3.5.0 debido al uso de modelos de razonamiento (Thinking) que pueden consumir muchos más tokens que los modelos estándar. La app advierte visualmente sobre el uso de estos modelos.
