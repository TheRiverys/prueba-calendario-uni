# =====================================================
# Dockerfile para Calendario Entregas Universitarias
# Simula exactamente el despliegue de Vercel
# =====================================================

# Multi-stage build para optimización
FROM node:20-alpine AS builder

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración primero (para cache de layers)
COPY package*.json ./

# Instalar dependencias (incluyendo devDependencies para build)
RUN npm ci --frozen-lockfile

# Copiar código fuente
COPY . .

# Build de producción (exactamente como hace Vercel)
RUN npm run build

# =====================================================
# Stage de producción - servidor web estático
# =====================================================
FROM nginx:alpine AS production

# Instalar curl para health checks
RUN apk add --no-cache curl

# Copiar configuración de nginx optimizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar build de producción desde stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto (igual que Vercel)
EXPOSE 80

# Comando por defecto (nginx ya está configurado)
CMD ["nginx", "-g", "daemon off;"]
