# ============================================
# Stage 1: Instalar dependencias
# ============================================
FROM node:22-alpine AS deps

WORKDIR /app

# Copiar solo los archivos de dependencias para aprovechar la caché de Docker
COPY package.json package-lock.json ./

# Instalar dependencias (ci = clean install, respeta el lockfile exacto)
RUN npm ci

# ============================================
# Stage 2: Compilar la aplicación
# ============================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copiar las dependencias ya instaladas desde el stage anterior
COPY --from=deps /app/node_modules ./node_modules

# Copiar el código fuente completo
COPY . .

# Next.js recopila telemetría anónima — la desactivamos
ENV NEXT_TELEMETRY_DISABLED=1

# Las variables NEXT_PUBLIC_* se "hornean" (bake) en el JavaScript del cliente
# durante el build. Hay que pasarlas como ARG para que estén disponibles.
# En Dokploy, las configuras como "Build Arguments".
ARG NEXT_PUBLIC_APPWRITE_PROJECT_ID
ARG NEXT_PUBLIC_APPWRITE_PROJECT_NAME
ARG NEXT_PUBLIC_APPWRITE_ENDPOINT

ENV NEXT_PUBLIC_APPWRITE_PROJECT_ID=$NEXT_PUBLIC_APPWRITE_PROJECT_ID
ENV NEXT_PUBLIC_APPWRITE_PROJECT_NAME=$NEXT_PUBLIC_APPWRITE_PROJECT_NAME
ENV NEXT_PUBLIC_APPWRITE_ENDPOINT=$NEXT_PUBLIC_APPWRITE_ENDPOINT

# Compilar la aplicación → genera .next/standalone
RUN npm run build

# ============================================
# Stage 3: Imagen de producción (mínima)
# ============================================
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root por seguridad
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar los archivos estáticos públicos
COPY --from=builder /app/public ./public

# El output "standalone" de Next.js genera una carpeta autocontenida
# con solo los archivos necesarios (server.js + node_modules mínimos).
# Pero NO copia /public ni /.next/static, así que los copiamos manualmente.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Cambiar al usuario no-root
USER nextjs

# Exponer el puerto (Next.js usa 3000 por defecto)
EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# El standalone output genera un server.js en la raíz
CMD ["node", "server.js"]
