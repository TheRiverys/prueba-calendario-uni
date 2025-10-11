# Componente de Ayuda - Estructura Modular

Este directorio contiene el componente de ayuda dividido en módulos más pequeños y manejables para facilitar el mantenimiento y la escalabilidad.

## 📁 Estructura de Archivos

```
help/
├── HelpPage.tsx              # Componente principal que orquesta toda la página
├── TableOfContents.tsx       # Índice lateral de navegación
├── SectionRenderer.tsx       # Renderizador de secciones con lógica de colapso
├── types.ts                  # Tipos TypeScript compartidos
├── sections/                 # Contenido de las secciones
│   ├── IntroSection.tsx      # Introducción y inicio rápido
│   ├── MainFeaturesSection.tsx    # Funcionalidades principales
│   ├── AIFeaturesSection.tsx      # Funcionalidades de IA
│   ├── TipsAndAdvancedSection.tsx # Consejos y características avanzadas
│   └── index.ts              # Exportación centralizada de todas las secciones
└── README.md                 # Este archivo
```

## 🎯 Componentes Principales

### `HelpPage.tsx`

Componente principal que:

- Gestiona el estado de secciones expandidas/colapsadas
- Controla la navegación y scroll suave
- Renderiza el layout con índice lateral fijo y contenido principal

### `TableOfContents.tsx`

Índice de navegación lateral que:

- Muestra la estructura jerárquica de secciones
- Resalta la sección activa
- Permite navegación rápida con scroll suave

### `SectionRenderer.tsx`

Renderizador recursivo que:

- Muestra secciones y subsecciones
- Gestiona el estado de colapso/expansión
- Mantiene la jerarquía visual

### `types.ts`

Definiciones de tipos TypeScript:

- `Section`: Interfaz para secciones de contenido
- Incluye soporte para subsecciones anidadas

## 📝 Secciones de Contenido

### `IntroSection.tsx`

- ¿Qué es el Calendario Universitario?
- Inicio Rápido

### `MainFeaturesSection.tsx`

- Gestión de Entregas
- Vistas Disponibles
- Configuración del Semestre
- Gestión de Perfil

### `AIFeaturesSection.tsx`

- Asistente de IA
- Cómo obtener clave API de OpenAI
- Configuración en la aplicación
- Costos de uso
- Solución de problemas con IA
- Estadísticas generales

### `TipsAndAdvancedSection.tsx`

- Consejos prácticos (organización y gestión del tiempo)
- Características avanzadas (importación, sincronización, diseño responsivo)
- Solución de problemas generales
- Consejos para el éxito académico
- Conclusión

## 🔧 Cómo Añadir Nueva Sección

1. **Crear el contenido de la sección** en el archivo apropiado dentro de `sections/`:

```tsx
export const nuevaSeccion: Section = {
  id: 'nueva-seccion',
  title: 'Título de la Nueva Sección',
  content: (
    <div className='space-y-4'>
      <p className='text-muted-foreground leading-relaxed'>
        Contenido de la sección...
      </p>
    </div>
  ),
};
```

2. **Exportar la sección** en `sections/index.ts`:

```tsx
import { nuevaSeccion } from './NuevaSeccion';

export const allSections = [
  // ... secciones existentes
  nuevaSeccion,
];
```

3. La sección aparecerá automáticamente en el índice y en el contenido principal.

## 🎨 Estilos y Diseño

- **Índice lateral**: Fijo a la izquierda, 224px de ancho
- **Contenido principal**: Centrado, máximo 1024px de ancho
- **Secciones colapsables**: Con iconos de chevron para indicar estado
- **Scroll suave**: Navegación animada entre secciones
- **Responsive**: Índice oculto en móvil, contenido adaptativo

## 🚀 Ventajas de esta Estructura

1. **Mantenibilidad**: Cada sección es independiente y fácil de modificar
2. **Escalabilidad**: Añadir nuevas secciones es simple y no afecta al resto
3. **Legibilidad**: Archivos más pequeños y enfocados en una responsabilidad
4. **Reutilización**: Componentes como `SectionRenderer` son reutilizables
5. **Testing**: Más fácil probar secciones individuales
6. **Performance**: Mejor tree-shaking y code-splitting potencial

## 📚 Convenciones

- Usar `&quot;` en lugar de `"` para comillas dentro de JSX
- Mantener el espaciado consistente con `space-y-*`
- Usar clases semánticas de Tailwind (`text-foreground`, `text-muted-foreground`)
- Incluir `leading-relaxed` en párrafos para mejor legibilidad
- Usar cajas con `bg-muted/30` para destacar información importante
