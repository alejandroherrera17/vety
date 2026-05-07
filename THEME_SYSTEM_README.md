# VetyCare Theme System

Un sistema de temas dinámicos premium para personalizar completamente la apariencia de VetyCare.

## 🎨 Características

- **8 Temas Premium**: Midnight Vet, Emerald Care, Royal Purple, Arctic Blue, Sunset Orange, Forest Dark, Rose Gold, Graphite Pro
- **Modo Claro/Oscuro**: Soporte completo para light y dark mode
- **Persistencia**: Guardado automático en localStorage y base de datos
- **Tiempo Real**: Cambios instantáneos sin recargar la página
- **PDF Theming**: Los PDFs se generan con los colores del tema seleccionado
- **CSS Variables**: Arquitectura escalable usando variables CSS
- **TypeScript**: Tipado fuerte completo
- **Zustand**: Estado global eficiente

## 🏗️ Arquitectura

### Estructura de Archivos

```
lib/themes/
├── themes.ts          # Definiciones de todos los temas
├── store.ts           # Store de Zustand para estado global
└── index.ts           # Exportaciones

providers/
└── ThemeProvider.tsx  # Proveedor de contexto React

hooks/
└── useTheme.ts        # Hooks personalizados para temas

components/theme/
├── ThemeCustomizer.tsx # Interfaz completa de personalización
└── theme-toggle.tsx    # Toggle rápido light/dark

actions/
└── theme.ts           # Server actions para persistencia
```

### Variables CSS

El sistema usa variables CSS dinámicas que se actualizan automáticamente:

```css
:root {
  --background: hsl(...);
  --foreground: hsl(...);
  --primary: hsl(...);
  --secondary: hsl(...);
  /* ... más variables */
}
```

### Base de Datos

Se agregó el campo `theme` al modelo `Veterinarian`:

```prisma
model Veterinarian {
  // ... otros campos
  theme Theme @default(midnight_vet)
}

enum Theme {
  midnight_vet
  emerald_care
  royal_purple
  arctic_blue
  sunset_orange
  forest_dark
  rose_gold
  graphite_pro
}
```

## 🎯 Temas Disponibles

### 1. Midnight Vet
- **Estilo**: Moderno, tecnológico, premium oscuro
- **Colores**: Azul eléctrico, cyan, gris oscuro
- **Inspiración**: Vercel, Linear, Stripe

### 2. Emerald Care
- **Estilo**: Veterinario, natural, confiable
- **Colores**: Verde esmeralda, mint, blanco suave

### 3. Royal Purple
- **Estilo**: Sofisticado, premium moderno
- **Colores**: Morado profundo, violeta, lavanda

### 4. Arctic Blue
- **Estilo**: Minimalista médico, ultra limpio
- **Colores**: Azul hielo, cyan suave, blanco

### 5. Sunset Orange
- **Estilo**: Amigable, cálido, energético
- **Colores**: Naranja elegante, coral, beige

### 6. Forest Dark
- **Estilo**: Naturaleza premium, elegante
- **Colores**: Verde bosque, olive, beige oscuro

### 7. Rose Gold
- **Estilo**: Boutique grooming, lujo
- **Colores**: Rose, gold suave, beige premium

### 8. Graphite Pro
- **Estilo**: Corporativo futurista, minimalista
- **Colores**: Negro grafito, gris humo, blanco

## 🚀 Uso

### Acceder al Customizer

1. Ve al sidebar → "Temas"
2. Explora los temas disponibles
3. Haz clic en un tema para previsualizar
4. Guarda la configuración

### Toggle Rápido Light/Dark

- Botón en el footer del sidebar
- Cambia instantáneamente entre modos

### Programáticamente

```tsx
import { useTheme } from '@/hooks/useTheme'

function MyComponent() {
  const { theme, mode, setTheme, toggleMode } = useTheme()

  return (
    <div>
      <p>Tema actual: {theme}</p>
      <p>Modo: {mode}</p>
      <button onClick={() => setTheme('emerald_care')}>
        Cambiar a Emerald
      </button>
      <button onClick={toggleMode}>
        Toggle Light/Dark
      </button>
    </div>
  )
}
```

## 🎨 Integración con Componentes

Los componentes usan automáticamente las variables CSS. Ejemplo:

```tsx
// Antes (hardcoded)
<div className="bg-black text-white">

// Después (temático)
<div className="bg-background text-foreground">
```

### Clases CSS Personalizadas

```css
.gradient-primary {
  background: var(--gradient-primary);
}

.shadow-theme {
  box-shadow: 0 4px 6px -1px var(--shadow);
}

.glow-theme {
  box-shadow: 0 0 20px var(--glow);
}
```

## 📄 PDFs Temáticos

Los PDFs se generan automáticamente con el tema del usuario:

```tsx
// En routes PDF
const veterinarian = await prisma.veterinarian.findUnique({
  where: { id: session.user.id },
  select: { theme: true }
});

const styles = createPdfStyles(veterinarian.theme, 'light');
```

## 🔧 Desarrollo

### Agregar Nuevo Tema

1. Agregar al enum `Theme` en `schema.prisma`
2. Definir colores en `lib/themes/themes.ts`
3. Ejecutar `npx prisma generate`
4. Ejecutar `npx prisma db push`

### Modificar Colores

Editar el objeto correspondiente en `themes.ts`:

```tsx
midnight_vet: {
  light: {
    primary: 'hsl(195, 100%, 50%)', // Nuevo color
    // ... otros colores
  },
  dark: { /* ... */ }
}
```

## 📱 Responsive & Accesible

- Diseño completamente responsive
- Soporte para high contrast
- Animaciones suaves de transición
- Accesible con keyboard navigation

## 🎯 Próximos Pasos

- [ ] Animaciones de transición entre temas
- [ ] Preview de PDFs en el customizer
- [ ] Temas personalizados por usuario
- [ ] Sincronización en tiempo real (WebSocket)
- [ ] Exportar/importar configuraciones de tema