# 🛠️ Instalación y Configuración Local

Esta guía completa te ayudará a configurar el entorno de desarrollo para Academic Suite.

## 📋 Requisitos Previos

### Hardware Mínimo Recomendado
- **Procesador**: 2 núcleos o superior
- **Memoria RAM**: 4 GB mínimo, 8 GB recomendado
- **Espacio en disco**: 2 GB disponible
- **Sistema operativo**: Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)

### Software Requerido

#### Node.js
- **Versión**: 18.x o superior (LTS recomendado)
- **Instalación**: [nodejs.org](https://nodejs.org/)

```bash
# Verificar instalación
node --version
npm --version
```

#### Git
- **Versión**: 2.30.0 o superior
- **Instalación**: [git-scm.com](https://git-scm.com/)

```bash
# Verificar instalación
git --version
```

#### Editor de Código Recomendado
- **Visual Studio Code** con extensiones:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Tailwind CSS IntelliSense
  - TypeScript Hero

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
# Clonar desde GitHub (ajusta la URL según corresponda)
git clone https://github.com/tu-usuario/calendario-entregas-uni.git
cd calendario-entregas-uni

# Verificar rama activa
git branch
```

### 2. Instalar Dependencias

```bash
# Instalar todas las dependencias del proyecto
npm install

# Verificación de instalación correcta
npm list --depth=0
```

**Dependencias clave instaladas**:
- **React 19.2.0**: Framework principal
- **TypeScript 5.9.3**: Tipado estático
- **Vite 7.1.9**: Servidor de desarrollo y bundler
- **Tailwind CSS 4.1.14**: Framework de estilos
- **Supabase 2.74.0**: Backend como servicio
- **Radix UI**: Componentes accesibles

### 3. Configuración del Entorno

#### Archivo `.env` (Crear si no existe)

```bash
# Crear archivo de variables de entorno
touch .env

# Contenido básico requerido
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_OPENAI_API_KEY=tu_openai_api_key  # Opcional para funciones IA
```

#### Configuración de Supabase

1. **Crear proyecto en Supabase**:
   - Ve a [supabase.com](https://supabase.com)
   - Crea un nuevo proyecto
   - Copia las credenciales (URL y anon key)

2. **Configurar base de datos**:
   ```sql
   -- Ejecutar en el SQL Editor de Supabase
   -- Los esquemas están disponibles en /database-schema.sql y /supabase-schema.sql
   ```

3. **Configurar autenticación**:
   - Habilitar proveedores necesarios (email/password por defecto)
   - Configurar políticas RLS para seguridad de datos

### 4. Verificar Instalación

```bash
# Ejecutar pruebas para verificar todo funciona
npm run test:run

# Verificar linting
npm run lint

# Construir proyecto para verificar configuración
npm run build
```

## 🏃‍♂️ Desarrollo Local

### Comandos Disponibles

```bash
# Desarrollo con hot reload
npm run dev

# Servidor de producción local
npm run preview

# Ejecutar pruebas con cobertura
npm run test:coverage

# Ejecutar solo linting
npm run lint

# Auto-fix de problemas de linting
npm run lint:fix

# Formatear código
npm run format
```

### Acceso a la Aplicación

1. **Iniciar servidor de desarrollo**:
   ```bash
   npm run dev
   ```

2. **Abrir navegador**:
   - URL: `http://localhost:3000`
   - La aplicación debería cargar automáticamente

3. **Características del entorno de desarrollo**:
   - ✅ Hot Module Replacement (HMR)
   - ✅ Recarga automática del navegador
   - ✅ Source maps para debugging
   - ✅ TypeScript checking en tiempo real

## 🐛 Solución de Problemas Comunes

### Error: "Cannot resolve module"
```bash
# Limpiar cache de npm y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: "Port already in use"
```bash
# Encontrar proceso usando el puerto
lsof -ti:3000

# Matar proceso (Linux/macOS)
kill -9 PID_NUMBER

# O usar otro puerto
PORT=3001 npm run dev
```

### Error: "Supabase connection failed"
```bash
# Verificar variables de entorno
cat .env

# Verificar configuración de Supabase
# Asegurar que las políticas RLS permiten acceso
```

### Error: "Build failed"
```bash
# Limpiar cache de Vite
rm -rf dist .vite node_modules/.vite

# Reconstruir
npm run build
```

## 🔧 Configuración Avanzada

### TypeScript

El proyecto utiliza configuración estricta de TypeScript:
- **Archivo**: `tsconfig.json`
- **Características**:
  - Stric mode habilitado
  - Path mapping con `@/` para imports
  - Soporte completo para React JSX

### ESLint y Prettier

**Configuración automática**:
```bash
# Pre-commit hooks configurados con Husky
# Se ejecutan automáticamente antes de cada commit

# Ejecutar manualmente
npm run lint:fix  # Corrige problemas automáticamente
npm run format    # Formatea código
```

**Reglas principales**:
- ✅ Comillas simples obligatorias
- ✅ Punto y coma obligatorio
- ✅ Indentación de 2 espacios
- ✅ Líneas máximas de 120 caracteres

### Tailwind CSS 4

**Configuración moderna**:
- Archivo: `tailwind.config.js` (si existe)
- CSS principal: `src/index.css`
- Soporte para temas oscuros integrado

## 🧪 Testing

### Configuración de Pruebas

```bash
# Ejecutar todas las pruebas
npm run test

# Con cobertura detallada
npm run test:coverage

# Modo watch para desarrollo
npm run test:watch
```

**Tecnologías utilizadas**:
- **Vitest**: Framework de testing moderno
- **React Testing Library**: Utilidades para testing de componentes React
- **jsdom**: Entorno DOM para pruebas

### Tipos de Pruebas

1. **Unit Tests**: Funciones individuales y utilidades
2. **Component Tests**: Componentes React aislados
3. **Integration Tests**: Flujos completos de usuario

## 🚀 Despliegue

### Construcción para Producción

```bash
# Construir aplicación optimizada
npm run build

# Archivos generados en /dist
# Listo para desplegar en cualquier hosting estático
```

### Despliegue Recomendado

**Opciones recomendadas**:
- **Vercel**: Despliegue automático desde Git
- **Netlify**: Integración con GitHub/GitLab
- **GitHub Pages**: Opción gratuita para proyectos open source

## 🔒 Seguridad y Privacidad

### Variables de Entorno Sensibles
```bash
# NUNCA commitear estas variables
.env.local        # Variables locales
.env.production   # Variables de producción
dist/            # Build de producción
```

### Configuración de CORS
- Configurar apropiadamente en Supabase
- Revisar políticas de seguridad del hosting

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. **Revisa los logs** del servidor de desarrollo
2. **Verifica versiones** de dependencias
3. **Consulta la documentación** en `/Documentation`
4. **Reporta issues** en el repositorio correspondiente

---

**⏱️ Tiempo estimado**: 15-30 minutos
**📚 Nivel**: Desarrollador principiante
**🎯 Prerrequisitos**: Conocimientos básicos de terminal y Git
