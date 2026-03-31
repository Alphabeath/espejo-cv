# Espejo CV

Espejo CV es una plataforma de práctica de entrevistas impulsada por Inteligencia Artificial. Analiza tu currículum (CV) y utiliza modelos de IA avanzados para simular entrevistas de trabajo, ofreciendo un entorno interactivo y retroalimentación inteligente para mejorar tus habilidades de comunicación y empleabilidad.

## 🚀 ¿Qué hace este proyecto?

- **Análisis de Perfil:** Lee y extrae información de tus CVs en formato PDF para contextualizar las simulaciones.
- **Simulación de Entrevistas Asistida por IA:** Practica mediante interacciones fluidas (texto y voz) impulsadas por LLMs rápidos como Groq / Cerebras.
- **Interacción por Voz:** Utiliza reconocimiento de voz avanzado (Deepgram) para una experiencia de entrevista más inmersiva e interactiva.
- **Panel de Retroalimentación (*Dashboard*):** Revisa el historial de tus prácticas y recibe insights detallados sobre tu desempeño y áreas de mejora.
- **Autenticación y Backend Seguro:** Gestión de datos y usuarios soportada bajo la infraestructura y bases de datos de Appwrite.

## 🛠️ Stack tecnológico

El proyecto está construido con un enfoque moderno y altamente optimizado:

**Frontend:**
- **Framework:** [Next.js 16](https://nextjs.org/) (App Router, Soporte experimental de Turbopack)
- **Librería UI:** [React 19](https://react.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/) y Componentes base tipo [shadcn/ui](https://ui.shadcn.com/)
- **Animaciones:** [Motion](https://motion.dev/) y Rive (`@rive-app/react-webgl2`)

**Manejo de estado y datos:**
- [TanStack React Query v5](https://tanstack.com/query/latest) (Gestión de estado asíncrono y caché web)

**Inteligencia artificial:**
- [Vercel AI SDK](https://sdk.vercel.ai/docs)
- Modelos LLM a través de **Groq** y **Cerebras**
- Procesamiento de Voz con **Deepgram**

**Backend / BaaS:**
- [Appwrite](https://appwrite.io/) (Autenticación, Storage, Base de Datos)

## 💻 Instalación local

Para correr este proyecto en tu entorno de desarrollo local, sigue estos pasos:

### 1. Clonar el repositorio

```bash
git clone https://github.com/Alphabeath/espejo-cv.git
cd espejo-cv
```

### 2. Instalar dependencias

Asegúrate de tener Node.js instalado en tu sistema.

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto y copia las variables necesarias (consulta con el equipo o un archivo `.env.example` si está disponible). 
Normalmente necesitarás: 
- `NEXT_PUBLIC_APPWRITE_ENDPOINT`
- `NEXT_PUBLIC_APPWRITE_PROJECT`
- Claves de API de Deepgram, Groq, Cerebras, etc.

### 4. Configurar Appwrite (Provisionamiento)

El proyecto incluye un script para inicializar la base de datos y colecciones necesarias en tu servidor de Appwrite:

```bash
npm run appwrite:provision
```

### 5. Iniciar el servidor de desarrollo

Inicia la aplicación en modo desarrollo (utilizando Turbopack para mayor velocidad):

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación corriendo.

---

### Scripts útiles disponibles:

- `npm run dev`: Inicia servidor local con Turbopack.
- `npm run build`: Construye la versión de producción.
- `npm run lint` & `npm run format`: Revisa errores y formatea el código via Eslint/Prettier.
- `npm run typecheck`: Validación estática de TypeScript sin emitir archivos emitidos.