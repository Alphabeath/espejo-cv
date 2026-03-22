# espejoCV

espejoCV es una aplicación web construida con Next.js que simula entrevistas laborales a partir del CV del usuario y del puesto al que postula. El flujo actual toma un CV en PDF, extrae su contenido, genera un plan de entrevista personalizado con IA, permite responder por texto o voz y presenta una evaluación visual del desempeño.

El proyecto está orientado a una experiencia de práctica clara, editorial y premium, con autenticación en Appwrite y una base preparada para persistir sesiones, ofertas laborales, turnos de entrevista y reportes.

## Estado actual del proyecto

### Implementado

- Landing pública con narrativa de producto y diseño propio.
- Autenticación con Appwrite usando email y contraseña.
- Rutas protegidas con guard centralizado.
- Carga de CV en PDF desde la práctica.
- Extracción de texto desde PDF usando `pdfreader`.
- Generación de plan de entrevista con IA usando Groq.
- Transcripción de respuestas por voz usando Deepgram.
- Dashboard conectado a Appwrite mediante un service dedicado.
- Script de provisionamiento para crear base de datos, colecciones, relaciones y bucket en Appwrite.
- Design system documentado y aplicado en la UI.

### Parcial o pendiente

- La entrevista todavía no evalúa respuestas con IA en tiempo real.
- El resultado final mostrado al terminar la práctica es actualmente mock.
- El flujo de práctica todavía no persiste de punta a punta en Appwrite.
- La navegación incluye la idea de una sección de feedback, pero esa vista todavía no está implementada.

En otras palabras: la base técnica importante ya existe, pero la práctica completa todavía mezcla piezas reales de IA con resultados simulados en frontend.

## Problema que resuelve

Preparar una entrevista suele ser abstracto: el usuario sabe que debe mejorar su CV o practicar, pero rara vez recibe una simulación concreta basada en su perfil y en una vacante real.

espejoCV busca cerrar ese hueco con un flujo simple:

1. El usuario sube su CV.
2. Describe el puesto al que postula.
3. La IA genera preguntas personalizadas a partir de ambos insumos.
4. El usuario responde por texto o voz.
5. La aplicación lo encamina hacia una evaluación posterior y un historial de práctica.

## Experiencia actual del usuario

### 1. Landing pública

La página principal presenta la propuesta de valor, el flujo de uso y el tono visual del producto.

### 2. Registro e inicio de sesión

La autenticación usa Appwrite `Account` desde cliente. Las páginas de `login` y `register` son guest-only, y si el usuario intenta entrar a una ruta protegida sin sesión activa, se redirige automáticamente al login con `redirectTo`.

### 3. Dashboard protegido

Las rutas bajo `app/(protected)` comparten layout protegido y sidebar. El dashboard está preparado para leer sesiones desde Appwrite y derivar métricas resumidas como score promedio, sesiones activas y simulaciones completadas.

### 4. Práctica de entrevista

La vista de práctica tiene tres pasos:

1. Subida del CV y descripción del puesto.
2. Entrevista con entrevistador IA, entrada por texto o voz.
3. Resultado visual.

Hoy el paso 1 sí usa backend real para analizar el CV y el puesto, y el dictado por voz sí usa backend real para transcribir. El avance de preguntas y el resultado final todavía se resuelven en frontend con delays y datos mock.

## Stack técnico

### Frontend

- Next.js 16 con App Router.
- React 19.
- TypeScript.
- Tailwind CSS 4.
- shadcn/ui.
- Radix UI.
- Motion.
- next-themes.

### Estado y datos

- TanStack Query para auth y consultas cliente.
- `useState` para estado local del flujo de práctica.
- Zustand instalado, pero documentado para uso futuro y no forzado todavía.

### Backend y servicios

- Route Handlers de Next.js.
- Appwrite para auth, storage y tablas relacionales.
- AI SDK (`ai`) para orquestar generación y transcripción.
- Groq como proveedor para generación estructurada.
- Deepgram como proveedor de transcripción.
- `pdfreader` para extracción de texto desde CV en PDF.

## Modelos y proveedores de IA en uso

La implementación actual en `services/ai.service.ts` usa:

- Groq con el modelo `moonshotai/kimi-k2-instruct-0905` para generar el plan de entrevista.
- Deepgram con el modelo `nova-3` para transcribir audio.

El plan de entrevista se genera como objeto estructurado validado con Zod. El backend devuelve:

- resumen del CV,
- resumen del rol,
- áreas de foco,
- exactamente 5 preguntas personalizadas.

## Arquitectura general

El proyecto está dividido en capas relativamente claras:

### `app/`

Contiene las rutas del App Router.

- `app/page.tsx`: landing pública.
- `app/auth/*`: login y registro.
- `app/(protected)/*`: área autenticada.
- `app/api/ai/analyze/route.ts`: generación del plan de entrevista.
- `app/api/ai/transcribe/route.ts`: transcripción de audio.

### `components/`

Componentes de UI y secciones de producto.

- `landing/`: home pública.
- `auth/`: formularios y guardas de sesión.
- `dashboard/`: sidebar, header, paneles y tabla de historial.
- `practice/`: pasos de la práctica.
- `ai-elements/`: persona IA y captura de voz.
- `ui/`: primitives reutilizables.

### `hooks/`

Hooks cliente para orquestación.

- `useAuth.ts`: sesión de usuario con React Query.
- `useAI.ts`: consumo de endpoints de IA.
- `useDashboard.ts`: consulta y refresco del dashboard.

### `services/`

Capa de servicios desacoplada de la UI.

- `auth.service.ts`: login, registro, logout y usuario actual.
- `ai.service.ts`: extracción de PDF, generación de preguntas y transcripción.
- `dashboard.service.ts`: lectura y transformación de datos desde Appwrite para el dashboard.

### `lib/`

Utilidades y configuración compartida.

- `appwrite.ts`: cliente y servicios de Appwrite.
- `ai-types.ts`: tipos del flujo de IA.
- `utils.ts`: helpers generales.

### `docs/`

Documentación interna del proyecto.

- `docs/DESIGN.md`: sistema visual “The Quiet Authority”.
- `docs/appwrite-collections.md`: modelo de datos en Appwrite.
- `docs/zustand-usage.md`: criterio para introducir Zustand.

## Flujo técnico actual

### Análisis de CV y puesto

El endpoint `POST /api/ai/analyze`:

1. recibe `cvFile` y `jobPosition` por `FormData`,
2. valida la presencia del archivo y el texto del puesto,
3. extrae texto del PDF,
4. normaliza y trunca el contenido,
5. genera un plan estructurado de entrevista,
6. devuelve 5 preguntas personalizadas.

### Transcripción de audio

El endpoint `POST /api/ai/transcribe`:

1. recibe el blob de audio como archivo,
2. valida que exista y no esté vacío,
3. lo envía a Deepgram,
4. devuelve texto normalizado, idioma, duración y segmentos.

### Dashboard

El dashboard no consulta directamente Appwrite desde la UI. En su lugar:

1. `useDashboard` obtiene el usuario autenticado,
2. `dashboard.service.ts` consulta la tabla raíz `cv_sessions`,
3. expande relaciones mínimas de `jobOffer` y `report`,
4. resuelve el nombre del archivo en Storage,
5. transforma todo a un view model listo para renderizar.

Este enfoque evita que los componentes conozcan detalles del modelo relacional o de las queries de Appwrite.

## Autenticación y autorización

La autenticación está basada en Appwrite y encapsulada en servicios y hooks.

### Comportamiento relevante

- `signIn`, `signUp`, `signOut` y `getCurrentUser` viven en `services/auth.service.ts`.
- Los errores 401 se interpretan como estado no autenticado, no como fallo técnico.
- Las rutas protegidas están centralizadas en `app/(protected)/layout.tsx` usando `AuthGuard`.
- Las páginas guest-only viven en `app/auth/layout.tsx`.
- El login respeta `redirectTo` después de autenticarse.

## Persistencia en Appwrite

El proyecto ya define una estructura de datos consistente para Appwrite.

### Base de datos

- Database ID: `espejo_cv`

### Bucket

- Bucket ID: `cv-files`

### Colecciones principales

- `cv_sessions`
- `job_offers`
- `interview_turns`
- `reports`

### Relaciones principales

- `cv_sessions` -> `job_offers` (1:1)
- `cv_sessions` -> `interview_turns` (1:N)
- `cv_sessions` -> `reports` (1:1)

El detalle completo del modelo está en `docs/appwrite-collections.md`.

## Sistema visual

La aplicación no usa un tema genérico de dashboard. El sistema visual del proyecto está definido como “The Quiet Authority”.

### Rasgos principales

- Jerarquía editorial con mucho aire.
- Paleta neutral con acento índigo profundo.
- Superficies tonales en lugar de cajas pesadas con borde.
- Tipografía dual: Inter para contenido y Manrope para titulares.
- Sombras suaves y capas con profundidad tonal.

La implementación base de estos tokens vive en `app/globals.css` y la justificación visual está en `docs/DESIGN.md`.

## Requisitos previos

- Node.js 20 o superior recomendado.
- npm.
- Proyecto de Appwrite accesible.
- Claves válidas para Groq y Deepgram.

## Instalación local

```bash
cd espejo-cv
npm install
```

## Variables de entorno

El proyecto necesita estas variables:

```env
NEXT_PUBLIC_APPWRITE_ENDPOINT=
NEXT_PUBLIC_APPWRITE_PROJECT_ID=
NEXT_PUBLIC_APPWRITE_PROJECT_NAME=
APPWRITE_API_KEY=
GROQ_API_KEY=
DEEPGRAM_API_KEY=
```

### Notas importantes

- `NEXT_PUBLIC_APPWRITE_ENDPOINT` y `NEXT_PUBLIC_APPWRITE_PROJECT_ID` son obligatorias para inicializar el SDK.
- `NEXT_PUBLIC_APPWRITE_PROJECT_NAME` es opcional.
- `APPWRITE_API_KEY` se usa para tareas de provisionamiento y operaciones server-side que la necesiten.
- `GROQ_API_KEY` es obligatoria para generar el plan de entrevista.
- `DEEPGRAM_API_KEY` es obligatoria para transcripción.

## Provisionamiento de Appwrite

El proyecto incluye un script para crear automáticamente base de datos, colecciones, relaciones, atributos, índices y bucket.

```bash
npm run appwrite:provision
```

### Qué hace el script

- crea `espejo_cv` si no existe,
- crea el bucket `cv-files`,
- crea las colecciones necesarias,
- crea atributos e índices,
- crea las relaciones bidireccionales entre las tablas.

### Importante

El script lee variables desde `.env` en la raíz de `espejo-cv`. Si tu equipo usa `.env.local`, conviene mantener también un `.env` con las variables necesarias para el provisionamiento.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run format
npm run appwrite:provision
```

### Descripción rápida

- `dev`: inicia Next.js en desarrollo con Turbopack.
- `build`: genera la build de producción.
- `start`: levanta la build generada.
- `lint`: ejecuta ESLint.
- `typecheck`: corre TypeScript sin emitir archivos.
- `format`: aplica Prettier a archivos TypeScript y TSX.
- `appwrite:provision`: prepara la infraestructura mínima en Appwrite.

## Cómo levantar el proyecto

1. Instala dependencias.
2. Define las variables de entorno.
3. Provisiona Appwrite si todavía no existe la estructura.
4. Inicia el servidor de desarrollo.

```bash
cd espejo-cv
npm install
npm run appwrite:provision
npm run dev
```

Luego abre `http://localhost:3000`.

## Estructura resumida del proyecto

```text
espejo-cv/
├── app/
│   ├── (protected)/
│   │   ├── dashboard/
│   │   ├── layout.tsx
│   ├── api/
│   │   └── ai/
│   │       ├── analyze/route.ts
│   │       └── transcribe/route.ts
│   ├── auth/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ai-elements/
│   ├── auth/
│   ├── dashboard/
│   ├── landing/
│   ├── practice/
│   └── ui/
├── docs/
├── hooks/
├── lib/
├── scripts/
├── services/
└── public/
```

## Decisiones de implementación relevantes

### React Query para auth

La sesión del usuario no está duplicada en un store global manual. `useAuth` usa React Query como fuente de verdad del usuario actual y separa `isCheckingAuth` de las mutaciones como `isLoggingOut`.

### Services para Appwrite

La UI no conoce directamente los detalles de Appwrite. Los servicios encapsulan acceso, parsing y transformación de datos.

### Zod para salida estructurada

El plan de entrevista no se consume como texto libre, sino como objeto validado. Esto reduce ambigüedad en frontend y fuerza una salida más estable desde IA.

### PDF solo con texto seleccionable

El extractor actual requiere PDFs con texto. Si el CV es una imagen escaneada o no contiene texto seleccionable, el backend devuelve error.

## Limitaciones conocidas

- No existe todavía un pipeline completo de scoring persistido de entrevista.
- No hay endpoint final para crear reportes completos con fortalezas, brechas y recomendaciones reales.
- La persistencia del flujo de práctica hacia `cv_sessions`, `interview_turns` y `reports` todavía no está cableada desde la UI.
- La carpeta `components/feedback/` existe, pero está vacía por ahora.
- El menú del dashboard contempla una ruta de feedback que aún no tiene pantalla implementada.

## Documentación complementaria

- `docs/DESIGN.md`: fundamentos visuales.
- `docs/appwrite-collections.md`: modelo de datos recomendado y ya provisionado por script.
- `docs/zustand-usage.md`: criterios para introducir estado global compartido.

## Próximos pasos naturales del proyecto

1. Persistir una sesión real al iniciar la práctica.
2. Guardar cada turno de entrevista en `interview_turns`.
3. Reemplazar el resultado mock por evaluación real con IA.
4. Generar y guardar `reports` completos en Appwrite.
5. Implementar la vista de feedback/historial detallado.

## Resumen

espejoCV ya tiene resuelta buena parte de la base seria del producto: diseño propio, auth real, modelo de datos definido, integración con Appwrite, generación de preguntas con IA y transcripción de audio. Lo que falta cerrar es la última milla del flujo de negocio: convertir la práctica actual en una sesión persistida con evaluación real y feedback completo.
