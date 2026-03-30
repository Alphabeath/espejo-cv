# Cuándo usar Zustand en Espejo de CV

Este documento define en qué partes de la aplicación tiene sentido usar Zustand y en qué casos es mejor seguir con `useState`, React Query o el estado que ya ofrece la librería de terceros.

## Regla principal

Usa Zustand para estado de cliente compartido, efímero y transversal entre componentes, pantallas o flujos.

No lo uses para datos que vienen del backend, caché de requests o formularios simples que solo viven dentro de un componente.

## Qué ya resuelve el proyecto hoy

En este repositorio ya existen estas capas:

- React Query para auth y sincronización con Appwrite en [hooks/useAuth.ts](../hooks/useAuth.ts).
- `useState` para UI local en formularios y menús, por ejemplo en [app/dashboard/layout.tsx](../app/dashboard/layout.tsx).

Por eso, Zustand no debería reemplazar esas piezas. Debe cubrir huecos donde el estado local empieza a duplicarse o a saltar entre pantallas.

## Dónde sí usarlo

### 1. Flujo de práctica en tiempo real

La pantalla de práctica en [app/practica/page.tsx](../app/practica/page.tsx) y sus componentes de [components/practice](../components/practice) son el mejor candidato.

Usa Zustand para:

- pregunta activa actual,
- historial de conversación en memoria,
- respuesta que el usuario está escribiendo,
- estado de conexión con el motor de IA,
- timer de la sesión,
- banderas de UI como `isListening`, `isGenerating`, `isSubmitting`.

Motivo: esos datos se comparten entre `ConversationStream`, `ResponseBar`, `InterviewHeader` e `InterviewerPanel`, y no conviene pasar props por toda la cadena.

### 2. Estado de UI del dashboard

La vista del panel en [app/dashboard/page.tsx](../app/dashboard/page.tsx) tiene bastante estado visual que puede crecer con el tiempo.

Buen uso de Zustand:

- sidebar colapsado o expandido,
- filtro activo de historial,
- ordenamiento de sesiones,
- selección de una práctica para abrir detalle,
- estado de modales o drawers globales.

Si ese estado empieza a ser compartido entre el layout, la tabla y paneles laterales, Zustand simplifica mucho el acoplamiento.

### 3. Estado de feedback y reproducción

En la sección de feedback en [app/feedback/page.tsx](../app/feedback/page.tsx) puedes usar Zustand para:

- segmento activo del playback,
- tarjeta o métrica seleccionada,
- modo de comparación entre sesiones,
- filtros de recomendaciones.

Esto es útil si después agregas una experiencia más interactiva, por ejemplo una línea de tiempo de la entrevista o un reproductor de respuestas.

### 4. Estado global de UX

También vale la pena para estado de aplicación que no pertenece a Appwrite ni a React Query:

- drawer lateral global,
- toasts personalizados si no usas otra librería,
- banners globales,
- onboarding mostrado una sola vez,
- preferencias locales como densidad visual o vista compacta.

## Dónde no usarlo

### 1. Auth y sesión remota

No lo uses para reemplazar [hooks/useAuth.ts](../hooks/useAuth.ts).

La identidad del usuario y su sesión deben seguir viniendo de Appwrite y React Query. Eso evita duplicar una fuente de verdad que ya existe.

### 2. Datos de backend

No guardes en Zustand:

- CVs persistidos,
- sesiones de Appwrite,
- turnos de entrevista,
- reportes finales,
- catálogos o colecciones que deban sobrevivir a un refresh.

Eso debe vivir en Appwrite y, si hace falta, en el caché de React Query.

### 3. Formularios simples aislados

Para inputs locales como login, registro o un modal pequeño, `useState` sigue siendo más simple.

Ejemplos actuales:

- formulario de login,
- formulario de registro,
- menú de usuario en dashboard,
- contadores simples o toggles dentro de un solo componente.

## Criterio práctico de decisión

Usa Zustand cuando se cumplan al menos dos de estas condiciones:

1. El estado lo consumen 2 o más componentes que no son padre e hijo directos.
2. El estado debe sobrevivir a cambios de ruta o a re-montajes parciales de UI.
3. El estado representa interacción del usuario, no datos persistentes del servidor.
4. El estado se actualiza con frecuencia y empieza a generar prop drilling o duplicación.

Si solo cumple una condición, probablemente `useState` sea suficiente.

## Stores sugeridos para este repo

### `practice-store`

Responsabilidad:

- sesión activa de práctica,
- pregunta actual,
- respuesta en edición,
- mensajes temporales,
- flags de carga.

Dónde se usaría:

- [components/practice/conversation-stream.tsx](../components/practice/conversation-stream.tsx),
- [components/practice/response-bar.tsx](../components/practice/response-bar.tsx),
- [components/practice/interview-header.tsx](../components/practice/interview-header.tsx),
- [components/practice/interviewer-panel.tsx](../components/practice/interviewer-panel.tsx).

### `dashboard-ui-store`

Responsabilidad:

- navegación interna del dashboard,
- filtros y orden,
- estado de paneles y modales,
- preferencias de visualización.

Dónde se usaría:

- [app/dashboard/layout.tsx](../app/dashboard/layout.tsx),
- [app/dashboard/page.tsx](../app/dashboard/page.tsx).

### `feedback-ui-store`

Responsabilidad:

- reproducción de feedback,
- selección de insights,
- comparación entre sesiones,
- navegación interna de la vista de resultados.

Dónde se usaría:

- [app/feedback/page.tsx](../app/feedback/page.tsx),
- componentes dentro de [components/feedback](../components/feedback).

## Qué no movería todavía

No crearía un store global gigante para toda la app.

Eso solo haría más difícil mantener la separación entre:

- estado remoto de Appwrite,
- estado derivado de React Query,
- estado visual local,
- estado compartido real de UI.

La app todavía es lo bastante pequeña como para empezar con 1 o 2 stores bien definidos.

## Recomendación final

En esta base de código, Zustand debería entrar primero en la experiencia de práctica en tiempo real. Después, si el dashboard y feedback empiezan a compartir filtros, selección y paneles, ahí sí conviene sumar stores adicionales.

La regla es simple: si el estado no necesita persistencia en servidor, pero sí coordinación entre varias piezas de UI, probablemente pertenece a Zustand.