# Colecciones de Appwrite para Espejo de CV

Este documento define una estructura recomendada para persistencia en Appwrite usando relationships como eje del modelo. La idea es que la sesión sea el agregado principal y que desde ella puedas resolver oferta, turnos y reporte sin depender de ids manuales repetidos en todas partes.

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

## Modelo de relaciones recomendado

La colección raíz debe ser `cv_sessions`. Todo lo demás cuelga de esa sesión.

### Relaciones

| Origen | Campo | Destino | Cardinalidad | Dirección recomendada | On delete | Motivo |
| --- | --- | --- | --- | --- | --- | --- |
| `cv_sessions` | `jobOffer` | `job_offers` | 1:1 | bidireccional | cascade | Cada sesión debe tener como máximo una oferta estructurada. |
| `job_offers` | `cvSession` | `cv_sessions` | 1:1 inversa | bidireccional | restrict | Permite consultar la oferta desde la sesión y ubicar su sesión padre. |
| `cv_sessions` | `interviewTurns` | `interview_turns` | 1:N | bidireccional | cascade | Una sesión genera muchos turnos. |
| `interview_turns` | `cvSession` | `cv_sessions` | N:1 inversa | bidireccional | restrict | Hace posible listar y ordenar turnos por sesión. |
| `cv_sessions` | `report` | `reports` | 1:1 | bidireccional | cascade | Una sesión termina en un solo reporte final. |
| `reports` | `cvSession` | `cv_sessions` | 1:1 inversa | bidireccional | restrict | Permite obtener el reporte desde la sesión o validar unicidad por sesión. |

### Criterio práctico

- Usa relationships bidireccionales para navegación desde ambos lados.
- Usa `cv_sessions` como documento raíz que se lista primero en dashboard e historial.
- Mantén en `cv_sessions` solo los atributos propios de la sesión; lee `title`, `company` y scores expandiendo `jobOffer` y `report` desde la query.
- Guarda el texto pesado y el detalle estructurado en `job_offers`, `interview_turns` y `reports`.
- No mezcles relationship con un `sessionId` string paralelo para el mismo vínculo; termina duplicando reglas, índices y validaciones.
- Appwrite no permite crear índices manuales sobre atributos `relationship`; la navegación relacional se resuelve por expansión y por la propia cardinalidad de la relación.

## Colección 1: `cv_sessions`

Representa el estado completo de una sesión de análisis y funciona como documento raíz. Solo contiene atributos propios de la sesión; los datos de la oferta y el reporte se obtienen expandiendo las relationships correspondientes.

### Atributos de `cv_sessions`

| Atributo | Tipo | Requerido | Único | Descripción |
| --- | --- | ---: | ---: | --- |
| `userId` | string | sí | no | ID del usuario de Appwrite `Account` |
| `cvFileId` | string | sí | no | Archivo del CV en `cv-files` |
| `cvText` | string | sí | no | Texto extraído del CV |
| `jobOffer` | relationship | no | sí | Relación 1:1 con `job_offers` |
| `report` | relationship | no | sí | Relación 1:1 con `reports` |
| `interviewTurns` | relationship | no | no | Relación 1:N inversa con `interview_turns` |
| `jobOfferSource` | string | sí | no | `paste`, `url` o `manual` |
| `status` | string | sí | no | `draft`, `analyzing`, `interviewing`, `completed`, `failed` |
| `startedAt` | datetime | sí | no | Inicio de la sesión |
| `completedAt` | datetime | no | no | Cierre de la sesión |
| `lastActivityAt` | datetime | sí | no | Última actividad registrada |

> **Campos eliminados respecto a la versión anterior:** `jobOfferTitle`, `jobOfferCompany`, `matchScore`, `strengthsCount`, `gapsCount` y `questionCount`. Eran copias denormalizadas que generaban una segunda fuente de verdad. El dashboard debe leer esos valores expandiendo `jobOffer` y `report`; Appwrite lo resuelve en una sola query sin necesidad de mantener duplicados sincronizados.

### Índices de `cv_sessions`

| Índice | Campos | Tipo | Objetivo |
| --- | --- | --- | --- |
| `idx_user_startedAt` | `userId`, `startedAt` | key | Listar sesiones del usuario por fecha |
| `idx_user_status` | `userId`, `status` | key | Filtrar sesiones por estado |
| `idx_status_lastActivityAt` | `status`, `lastActivityAt` | key | Buscar sesiones activas, recientes o atascadas |

### Permisos de `cv_sessions`

- lectura: `user:{userId}`
- escritura: `user:{userId}`
- eliminación: `user:{userId}` o backend con API key

## Colección 2: `job_offers`

Guarda la oferta laboral asociada a una sesión. Aquí deben vivir el texto completo y la versión normalizada producida por el modelo.

### Atributos de `job_offers`

| Atributo | Tipo | Requerido | Único | Descripción |
| --- | --- | ---: | ---: | --- |
| `cvSession` | relationship | sí | sí | Relación 1:1 con `cv_sessions` |
| `title` | string | no | no | Título de la vacante |
| `company` | string | no | no | Nombre de la empresa |
| `sourceUrl` | string | no | no | URL de la oferta, si existe |
| `rawText` | string | sí | no | Texto original pegado por el usuario |
| `normalizedText` | string | sí | no | Texto procesado y limpio por el modelo |
| `seniority` | string | no | no | Nivel esperado |
| `createdAt` | datetime | sí | no | Fecha de creación |

> **Campos eliminados respecto a la versión anterior:** `requirementsJson`, `keywords` y `riskSignals`. Los tres eran JSON serializado dentro de un string, lo que los vuelve texto opaco para Appwrite: no se pueden filtrar, indexar ni consultar parcialmente. Los requisitos estructurados, palabras clave y señales de riesgo son output del análisis del modelo y deben quedar en `normalizedText` o en `reports`, no en campos paralelos que replican el mismo procesamiento.

La cardinalidad 1:1 la resuelve la relationship `cvSession`, no un índice `unique` manual sobre ese atributo.

### Índices de `job_offers`

Esta colección no requiere índices propios. Las ofertas se acceden siempre desde la relationship `jobOffer` de la sesión, nunca de forma directa ni filtrada globalmente.

> **Índices eliminados respecto a la versión anterior:** `idx_title`, `idx_company` e `idx_seniority`. En un modelo de usuario individual las ofertas nunca se listan ni se filtran por cargo o empresa fuera del contexto de su sesión, por lo que esos índices no tienen uso real.

### Permisos de `job_offers`

- lectura: dueño de la sesión
- escritura: dueño de la sesión o backend con API key

## Colección 3: `interview_turns`

Registra cada pregunta y respuesta de la entrevista.

### Atributos de `interview_turns`

| Atributo | Tipo | Requerido | Único | Descripción |
| --- | --- | ---: | ---: | --- |
| `cvSession` | relationship | sí | no | Relación N:1 con `cv_sessions` |
| `turnIndex` | integer | sí | no | Orden de la pregunta |
| `question` | string | sí | no | Pregunta generada por IA |
| `answer` | string | no | no | Respuesta del usuario |
| `score` | integer | no | no | Puntaje de la respuesta |
| `feedback` | string | no | no | Retroalimentación del modelo |
| `status` | string | sí | no | `pending`, `answered`, `reviewed` |
| `askedAt` | datetime | sí | no | Fecha en que se hizo la pregunta |
| `answeredAt` | datetime | no | no | Fecha de respuesta |

> **Campo eliminado respecto a la versión anterior:** `expectedSignal`. El criterio o señal esperada para evaluar una respuesta forma parte del prompt que se le pasa al modelo, no de la persistencia. Si en algún momento necesitas auditarlo, el lugar correcto es incluirlo dentro del campo `feedback` una vez que el modelo produce la evaluación.

### Índices de `interview_turns`

| Índice | Campos | Tipo | Objetivo |
| --- | --- | --- | --- |
| `idx_status_askedAt` | `status`, `askedAt` | key | Revisar colas o monitorear progreso |

Los turnos deben cargarse principalmente desde la relationship `interviewTurns` de la sesión. Si necesitas orden estricto, ordénalos por `turnIndex` al expandir o al leer la colección; no es necesario un índice dedicado para eso.

> **Índice eliminado respecto a la versión anterior:** `idx_turnIndex`. El orden por `turnIndex` se resuelve con un `orderBy` al expandir la relación o al listar la colección filtrada por sesión; un índice separado solo añade overhead de escritura sin beneficio real.

### Permisos de `interview_turns`

- lectura: dueño de la sesión
- escritura: dueño de la sesión o backend con API key

## Colección 4: `reports`

Guarda el resultado final de la IA.

### Atributos de `reports`

| Atributo | Tipo | Requerido | Único | Descripción |
| --- | --- | ---: | ---: | --- |
| `cvSession` | relationship | sí | sí | Relación 1:1 con `cv_sessions` |
| `overallScore` | integer | sí | no | Score global |
| `summary` | string | sí | no | Resumen general |
| `strengths` | string | no | no | Fortalezas serializadas |
| `gaps` | string | no | no | Brechas serializadas |
| `recommendations` | string | no | no | Recomendaciones serializadas |
| `confidence` | integer | no | no | Confianza del análisis |
| `generatedAt` | datetime | sí | no | Fecha de generación |
| `modelVersion` | string | no | no | Versión del modelo utilizado |

Los campos `strengths`, `gaps` y `recommendations` mantienen serialización porque son output de lectura: nunca se filtran ni se indexan, solo se deserializan para renderizar en UI.

### Índices de `reports`

| Índice | Campos | Tipo | Objetivo |
| --- | --- | --- | --- |
| `idx_overallScore` | `overallScore` | key | Analítica o ranking posterior |
| `idx_generatedAt` | `generatedAt` | key | Ordenar reportes por fecha en panel interno |

La unicidad 1:1 entre sesión y reporte la resuelve la relationship, no un índice `unique` manual sobre `cvSession`.

### Permisos de `reports`

- lectura: dueño de la sesión
- escritura: dueño de la sesión o backend con API key

## Identidad con Appwrite Account

No hace falta una colección `profiles`.

### Qué usar como identidad

- `userId` obtenido de `Account`
- `email` solo para mostrarlo en UI si lo deseas
- `name` o `displayName` si la app lo necesita en pantalla

### Recomendación de identidad

Usa `userId` en `cv_sessions` como llave de partición funcional. El resto de colecciones deben enlazarse por relationship a la sesión, no repetir `userId` salvo que luego tengas un caso fuerte de reporting o permisos administrativos.

## Configuración mínima para hackathon

Si quieres acelerar al máximo la implementación, crea esto:

1. Base de datos `espejo_cv`
2. Bucket `cv-files`
3. Colección `cv_sessions`
4. Colección `job_offers`
5. Colección `interview_turns`
6. Colección `reports`

Si el tiempo aprieta mucho, puedes omitir la relación 1:1 con `job_offers` y dejar la oferta embebida en `cv_sessions`, pero sería una simplificación temporal y no el modelo recomendado.

## Orden recomendado de implementación

1. Crear la base de datos.
2. Crear el bucket `cv-files`.
3. Crear `cv_sessions`.
4. Crear `job_offers` y la relación 1:1 con `cv_sessions`.
5. Crear `interview_turns` y la relación N:1 con `cv_sessions`.
6. Crear `reports` y la relación 1:1 con `cv_sessions`.
7. Agregar índices después de validar nombres finales de atributos.
8. Conectar Next.js para escribir y leer documentos con relationships expandidas.

## Notas prácticas

- Mantén los permisos cerrados por usuario desde el principio.
- Guarda el CV como archivo, no como blob en la base de datos.
- Usa relationships para navegación y consistencia.
- No uses campos denormalizados en `cv_sessions`; expande `jobOffer` y `report` en la query del dashboard en lugar de mantener copias sincronizadas manualmente.
- No serialices JSON dentro de strings para datos que el modelo procesa como output; ese contenido pertenece a `normalizedText` o a `reports`.
- Si Appwrite te obliga a elegir entre simplicidad y profundidad de expansión, prioriza que el dashboard lea desde `cv_sessions` y que la vista detallada expanda `jobOffer`, `report` e `interviewTurns`.
- Usa la sesión como eje principal para reconstruir toda la experiencia.
