# Colecciones de Appwrite para Espejo de CV

Este documento define la estructura mínima recomendada para crear la persistencia del proyecto directamente en Appwrite.

## Resumen

Usa una sola base de datos y cuatro colecciones principales:

- `cv_sessions`
- `job_offers`
- `interview_turns`
- `reports`

Y un bucket de Storage:

- `cv-files`

La identidad del usuario se resuelve con Appwrite `Account`, sin una colección `profiles`.

## Base de datos

### Database ID

- `espejo_cv`

### Recomendación

Crear una sola base de datos para todo el proyecto y mantener allí las colecciones de la sesión, la oferta, los turnos y el reporte.

## Bucket de Storage

### Bucket ID

- `cv-files`

### Uso

- subir PDFs del CV,
- guardar archivos temporales de extracción,
- mantener el `fileId` vinculado a la sesión.

### Permisos recomendados

- lectura: solo el usuario dueño del archivo,
- escritura: solo el usuario dueño o backend con API key.

## Colección 1: `cv_sessions`

Representa el estado completo de una sesión de análisis.

### Atributos

| Atributo | Tipo | Requerido | Único | Descripción |
|---|---|---:|---:|---|
| `userId` | string | sí | no | ID del usuario de Appwrite `Account` |
| `cvFileId` | string | sí | no | Archivo del CV en `cv-files` |
| `cvText` | string | sí | no | Texto extraído del CV |
| `jobOfferText` | string | sí | no | Texto de la oferta laboral |
| `jobOfferSource` | string | sí | no | `paste`, `url` o `manual` |
| `jobOfferTitle` | string | no | no | Título del cargo |
| `status` | string | sí | no | `draft`, `analyzing`, `interviewing`, `completed`, `failed` |
| `matchScore` | integer | no | no | Score total de match |
| `strengthsCount` | integer | no | no | Número de fortalezas detectadas |
| `gapsCount` | integer | no | no | Número de brechas detectadas |
| `questionCount` | integer | no | no | Número total de preguntas |
| `startedAt` | datetime | sí | no | Inicio de la sesión |
| `completedAt` | datetime | no | no | Cierre de la sesión |
| `lastActivityAt` | datetime | sí | no | Última actividad registrada |

### Índices

| Índice | Campos | Tipo | Objetivo |
|---|---|---|---|
| `idx_user_startedAt` | `userId`, `startedAt` | key | Listar sesiones del usuario por fecha |
| `idx_user_status` | `userId`, `status` | key | Filtrar sesiones por estado |
| `idx_status` | `status` | key | Buscar sesiones activas o fallidas |

### Permisos

- lectura: `user:{userId}`
- escritura: `user:{userId}`
- eliminación: `user:{userId}` o backend con API key

## Colección 2: `job_offers`

Guarda la oferta laboral asociada a una sesión.

### Atributos

| Atributo | Tipo | Requerido | Único | Descripción |
|---|---|---:|---:|---|
| `sessionId` | string | sí | no | ID de la sesión asociada |
| `title` | string | no | no | Título de la vacante |
| `company` | string | no | no | Nombre de la empresa |
| `sourceUrl` | string | no | no | URL de la oferta, si existe |
| `rawText` | string | sí | no | Texto original pegado por el usuario |
| `normalizedText` | string | sí | no | Texto procesado y limpio |
| `requirementsJson` | string | no | no | Requisitos estructurados serializados |
| `seniority` | string | no | no | Nivel esperado |
| `keywords` | string | no | no | Palabras clave serializadas |
| `riskSignals` | string | no | no | Señales de riesgo serializadas |
| `createdAt` | datetime | sí | no | Fecha de creación |

### Índices

| Índice | Campos | Tipo | Objetivo |
|---|---|---|---|
| `idx_sessionId` | `sessionId` | key | Recuperar oferta por sesión |
| `idx_title` | `title` | key | Búsqueda simple por cargo |

### Permisos

- lectura: dueño de la sesión
- escritura: dueño de la sesión o backend con API key

## Colección 3: `interview_turns`

Registra cada pregunta y respuesta de la entrevista.

### Atributos

| Atributo | Tipo | Requerido | Único | Descripción |
|---|---|---:|---:|---|
| `sessionId` | string | sí | no | ID de la sesión asociada |
| `turnIndex` | integer | sí | no | Orden de la pregunta |
| `question` | string | sí | no | Pregunta generada por IA |
| `answer` | string | no | no | Respuesta del usuario |
| `expectedSignal` | string | no | no | Señal o criterio esperado |
| `score` | integer | no | no | Puntaje de la respuesta |
| `feedback` | string | no | no | Retroalimentación del modelo |
| `status` | string | sí | no | `pending`, `answered`, `reviewed` |
| `askedAt` | datetime | sí | no | Fecha en que se hizo la pregunta |
| `answeredAt` | datetime | no | no | Fecha de respuesta |

### Índices

| Índice | Campos | Tipo | Objetivo |
|---|---|---|---|
| `idx_sessionId` | `sessionId` | key | Cargar los turnos de una sesión |
| `idx_session_turnIndex` | `sessionId`, `turnIndex` | key | Ordenar y reconstruir la conversación |

### Permisos

- lectura: dueño de la sesión
- escritura: dueño de la sesión o backend con API key

## Colección 4: `reports`

Guarda el resultado final de la IA.

### Atributos

| Atributo | Tipo | Requerido | Único | Descripción |
|---|---|---:|---:|---|
| `sessionId` | string | sí | sí | Una sesión debe tener un solo reporte final |
| `overallScore` | integer | sí | no | Score global |
| `summary` | string | sí | no | Resumen general |
| `strengths` | string | no | no | Fortalezas serializadas |
| `gaps` | string | no | no | Brechas serializadas |
| `recommendations` | string | no | no | Recomendaciones serializadas |
| `confidence` | integer | no | no | Confianza del análisis |
| `generatedAt` | datetime | sí | no | Fecha de generación |
| `modelVersion` | string | no | no | Versión del modelo utilizado |

### Índices

| Índice | Campos | Tipo | Objetivo |
|---|---|---|---|
| `idx_sessionId_unique` | `sessionId` | unique | Evitar duplicar el reporte final |
| `idx_overallScore` | `overallScore` | key | Analítica o ranking posterior |

### Permisos

- lectura: dueño de la sesión
- escritura: dueño de la sesión o backend con API key

## Identidad con Appwrite Account

No hace falta una colección `profiles`.

### Qué usar como identidad

- `userId` obtenido de `Account`
- `email` solo para mostrarlo en UI si lo deseas
- `name` o `displayName` si la app lo necesita en pantalla

### Recomendación

Usa `userId` en todas las colecciones donde necesites relacionar datos con el usuario.

## Configuración mínima para hackathon

Si quieres acelerar al máximo la implementación, crea solo esto:

1. Base de datos `espejo_cv`
2. Bucket `cv-files`
3. Colección `cv_sessions`
4. Colección `interview_turns`
5. Colección `reports`

`job_offers` es recomendable, pero si el tiempo aprieta puedes incrustar la oferta dentro de `cv_sessions`.

## Orden recomendado de implementación

1. Crear la base de datos.
2. Crear el bucket `cv-files`.
3. Crear `cv_sessions`.
4. Crear `interview_turns`.
5. Crear `reports`.
6. Agregar `job_offers` si hay tiempo.
7. Conectar Next.js para escribir y leer los documentos.

## Notas prácticas

- Mantén los permisos cerrados por usuario desde el principio.
- Guarda el CV como archivo, no como blob en la base de datos.
- Evita relaciones complejas en Appwrite para la primera versión.
- Usa `sessionId` como eje principal para reconstruir toda la experiencia.
