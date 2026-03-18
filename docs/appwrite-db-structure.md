# Estructura de Base de Datos en Appwrite para Espejo de CV

Este documento define cómo estructurar la persistencia del proyecto en Appwrite para una implementación simple, robusta y viable en una hackathon de una semana.

## Objetivo

Persistir todo el flujo principal del producto:

- autenticación del usuario,
- carga del CV,
- análisis de la oferta laboral,
- entrevista con IA,
- turnos de conversación,
- reporte final,
- archivos temporales o finales asociados a la sesión.

La idea es usar Next.js como orquestador y Appwrite como backend gestionado para auth, base de datos y storage.

## Principios de diseño

1. Mantener el modelo pequeño.
2. Separar sesión, turnos y reportes.
3. Guardar el archivo del CV en Storage, no dentro de la base de datos.
4. Usar IDs claros y consistentes.
5. Evitar relaciones complejas que agreguen fricción en la demo.
6. Diseñar pensando en lectura rápida y recuperación fácil del estado de una sesión.

## Resumen de entidades

### Colecciones principales

- `cv_sessions`
- `job_offers`
- `interview_turns`
- `reports`

### Storage

- `cv-files`

### Auth

- `Account` de Appwrite para login y sesión.

## Flujo de persistencia

1. El usuario inicia sesión con Appwrite `Account`.
2. Sube su CV en PDF.
3. El archivo se guarda en `cv-files`.
4. Se crea una sesión en `cv_sessions`.
5. Se guarda la oferta en `job_offers`.
6. Cada pregunta y respuesta se registra en `interview_turns`.
7. Al final se genera un `report` con scoring, brechas y recomendaciones.

## Colecciones en detalle

## 1) `cv_sessions`

Es la entidad central de la app. Cada vez que un usuario sube un CV y una oferta, se crea una sesión.

### Campos

- `userId` string, requerido.
- `cvFileId` string, requerido.
- `cvText` string, requerido.
- `jobOfferText` string, requerido.
- `jobOfferSource` string, valores posibles: `paste`, `url`, `manual`.
- `jobOfferTitle` string opcional.
- `status` string, valores posibles: `draft`, `analyzing`, `interviewing`, `completed`, `failed`.
- `matchScore` integer opcional.
- `strengthsCount` integer opcional.
- `gapsCount` integer opcional.
- `questionCount` integer opcional.
- `startedAt` datetime.
- `completedAt` datetime opcional.
- `lastActivityAt` datetime.

### Uso

- seguir el estado global del análisis,
- recuperar una sesión después de recargar la página,
- mostrar progreso y resultados finales.

### Permisos

- lectura: solo el dueño de la sesión.
- escritura: solo el dueño de la sesión o backend con API key.

### Índices sugeridos

- índice sobre `userId`.
- índice sobre `status`.
- índice compuesto sobre `userId` + `startedAt` para listar sesiones recientes.

## 2) `job_offers`

Guarda la oferta laboral asociada a una sesión. En una versión simple podría vivir dentro de `cv_sessions`, pero separarla ayuda a mantener el esquema limpio si luego quieres comparar múltiples ofertas con el mismo CV.

### Campos

- `sessionId` string, requerido.
- `title` string.
- `company` string opcional.
- `sourceUrl` string opcional.
- `rawText` string, requerido.
- `normalizedText` string, requerido.
- `requirementsJson` string o JSON serializado.
- `seniority` string opcional.
- `keywords` array o string serializado.
- `riskSignals` array o string serializado.
- `createdAt` datetime.

### Uso

- guardar la versión original y la normalizada de la oferta,
- reutilizar la misma oferta para reanálisis,
- separar parsing de persistencia.

### Permisos

- lectura: dueño de la sesión.
- escritura: dueño de la sesión o backend.

### Índices sugeridos

- índice sobre `sessionId`.
- índice sobre `title` si quieres búsqueda.

## 3) `interview_turns`

Guarda cada intercambio de la entrevista. Esta colección es la que te da trazabilidad y permite reconstruir la conversación.

### Campos

- `sessionId` string, requerido.
- `turnIndex` integer, requerido.
- `question` string, requerido.
- `answer` string opcional.
- `expectedSignal` string opcional.
- `score` integer opcional.
- `feedback` string opcional.
- `status` string, valores posibles: `pending`, `answered`, `reviewed`.
- `askedAt` datetime.
- `answeredAt` datetime opcional.

### Uso

- reconstruir el chat,
- alimentar el scoring por respuesta,
- mostrar en la interfaz qué tan bien respondió el usuario.

### Permisos

- lectura: dueño de la sesión.
- escritura: dueño de la sesión o backend.

### Índices sugeridos

- índice sobre `sessionId`.
- índice compuesto sobre `sessionId` + `turnIndex`.

## 4) `reports`

Representa el resultado final de la IA. Debe ser muy fácil de leer por un juez o por el usuario.

### Campos

- `sessionId` string, requerido.
- `overallScore` integer, requerido.
- `summary` string, requerido.
- `strengths` string o JSON serializado.
- `gaps` string o JSON serializado.
- `recommendations` string o JSON serializado.
- `confidence` integer opcional.
- `generatedAt` datetime.
- `modelVersion` string opcional.

### Uso

- mostrar el cierre de la entrevista,
- permitir volver al informe sin recomputar todo,
- tener un artefacto persistente de la demo.

### Permisos

- lectura: dueño de la sesión.
- escritura: dueño de la sesión o backend.

### Índices sugeridos

- índice único sobre `sessionId`.
- índice sobre `overallScore` para analytics o ranking posterior.

## 5) `history` opcional

Si en el futuro quieres guardar retroalimentación longitudinal o varias versiones de CV, agrega una colección adicional para historial.

### Cuándo vale la pena

- cuando el usuario sube varias versiones de CV,
- cuando quieres comparar resultados entre sesiones,
- cuando implementes aprendizaje progresivo o recomendaciones acumuladas.

## Identity: `Account` de Appwrite

Appwrite `Account` será la identidad única del usuario. No necesitas una colección `profiles` para la primera versión.

### Qué guardar del usuario

- `userId` desde `Account`.
- `email` solo si lo necesitas para mostrarlo en la UI.
- `name` o `displayName` si el usuario lo aporta.

### Cuándo sí crear una colección extra

Solo si más adelante quieres:

- guardar preferencias del usuario,
- almacenar avatar o alias persistente,
- añadir historial de uso o configuración de producto.

## Storage: `cv-files`

Los CV en PDF no deben vivir como texto crudo en la base de datos. Deben subirse a un bucket de Storage y luego procesarse para extraer texto.

### Archivos esperados

- PDF del CV,
- opcionalmente una imagen de portada o preview,
- opcionalmente archivos temporales si haces OCR.

### Metadatos recomendados

- `sessionId` como referencia,
- `userId` como referencia,
- `originalFileName`,
- `mimeType`,
- `size`.

### Permisos

- lectura: solo el dueño del archivo.
- escritura: solo el dueño o backend.

## Modelo de datos mínimo viable

Si quieres simplificar todavía más para la hackathon, puedes quedarte solo con esto:

1. `cv_sessions`
2. `interview_turns`
3. `reports`
4. `cv-files` en Storage

Y usar el usuario de Appwrite `Account` como identidad sin crear `profiles`.

Ese recorte es suficiente para una demo fuerte y reduce el tiempo de implementación.

## Reglas de permisos recomendadas

### Para datos del usuario

- lectura: `user:{userId}`.
- escritura: `user:{userId}`.
- eliminación: opcionalmente solo backend o el mismo usuario.

### Para operaciones administrativas

- usar la API key solo en route handlers de Next.js.
- no exponer la API key al cliente.

### Recomendación práctica

Usa permisos cerrados por defecto. Si el flujo necesita compartir reporte, crea una vista pública separada o un token temporal.

## Convenciones de nombres

- Colecciones en plural y minúscula.
- Campos en camelCase.
- IDs semánticos en variables de entorno.
- Estados con valores fijos y documentados.

Ejemplo:

- `cv_sessions`
- `interview_turns`
- `reportId`
- `matchScore`
- `lastActivityAt`

## Estructura sugerida en Appwrite

### Database

- `espejo_cv`

### Collections

- `cv_sessions`
- `job_offers`
- `interview_turns`
- `reports`

### Bucket

- `cv-files`

## Flujo de escritura recomendado

### Paso 1: crear sesión

Al subir el CV y la oferta, crea primero `cv_sessions` con estado `draft` o `analyzing`.

### Paso 2: guardar oferta

Inserta el documento en `job_offers` y vincúlalo a la sesión.

### Paso 3: subir archivo

Sube el PDF al bucket `cv-files` y guarda el `fileId` en la sesión.

### Paso 4: generar entrevista

Cada pregunta nueva crea un documento en `interview_turns`.

### Paso 5: cerrar reporte

Cuando termina la conversación, crea o actualiza `reports` y cambia el estado de la sesión a `completed`.

## Lo que no conviene guardar en Appwrite

- prompts completos si incluyen información sensible,
- tokens de terceros expuestos al usuario,
- cachés de IA muy pesadas,
- archivos temporales innecesarios por mucho tiempo.

## Recomendación para la hackathon

Para una semana de desarrollo, esta es la mejor combinación:

- `cv_sessions`, `interview_turns`, `reports` y `cv-files` como base obligatoria.
- `profiles` solo si te sobra tiempo.
- lógica de escritura desde Next.js con route handlers.
- lectura directa desde Appwrite solo cuando sea seguro y simple.

## Checklist de implementación

- [ ] Crear la base de datos en Appwrite.
- [ ] Crear el bucket `cv-files`.
- [ ] Crear las colecciones mínimas.
- [ ] Definir permisos por usuario.
- [ ] Añadir índices por `sessionId` y `profileId`.
- [ ] Conectar los route handlers de Next.js.
- [ ] Guardar el PDF del CV en Storage.
- [ ] Persistir preguntas, respuestas y reporte final.
