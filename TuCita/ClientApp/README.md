# ?? TuCita - ClientApp

Sistema web de gestión de citas médicas desarrollado con **React + TypeScript + Vite**.

> **Diseño original:** [Figma - TuCitaOnline Web System](https://www.figma.com/design/B4UpmQa7ZX5Izp0KJRrNyV/TuCitaOnline-Web-System-Design)

---

## ?? Inicio Rápido

```bash
# Instalar dependencias
npm install

# Iniciar desarrollo
npm run dev
# ? http://localhost:3000

# Build para producción
npm run build

# Preview del build
npm run preview
```

---

## ?? Documentación

### ?? Guías Disponibles

1. **[REORGANIZATION_SUMMARY.md](./REORGANIZATION_SUMMARY.md)** ?  
   Resumen de la reorganización del proyecto y nueva estructura.

2. **[STRUCTURE_GUIDE.md](./STRUCTURE_GUIDE.md)** ?  
   Guía práctica: ¿Dónde va cada archivo? Ejemplos y convenciones.

3. **[COMMANDS.md](./COMMANDS.md)**  
   Comandos útiles para desarrollo diario.

4. **[REORGANIZATION_PLAN.md](./REORGANIZATION_PLAN.md)**  
   Plan detallado de la reorganización (histórico).

---

## ?? Estructura del Proyecto

```
ClientApp/
??? src/
?   ??? components/
?   ?   ??? layout/          # Navbar, Footer, Layouts
?   ?   ??? common/          # Componentes reutilizables
?   ?   ??? ui/              # shadcn/ui (no modificar)
?   ?   ??? pages/           # Páginas por dominio
?   ?       ??? auth/        # Autenticación
?   ?       ??? patient/     # Módulo pacientes
?   ?       ??? doctor/      # Módulo doctores
?   ?
?   ??? services/            # Servicios API
?   ?   ??? api/
?   ?       ??? auth/
?   ?       ??? patient/
?   ?       ??? doctor/
?   ?
?   ??? styles/
?   ??? App.tsx
?   ??? main.tsx
?
??? package.json
??? vite.config.ts
??? tailwind.config.js
??? README.md               # ?? Estás aquí
```

**Ver estructura completa:** [STRUCTURE.txt](./STRUCTURE.txt)

---

## ?? Convenciones

### Imports
```typescript
// ? Usar imports absolutos
import { Button } from '@/components/ui/button';
import { HomePage } from '@/components/pages/patient/home-page';
```

### Nombres de Archivos
```
? kebab-case.tsx       # home-page.tsx
? kebab-case.ts        # auth-service.ts
```

### ¿Dónde crear archivos?
Ver guía completa: **[STRUCTURE_GUIDE.md](./STRUCTURE_GUIDE.md)**

---

## ??? Tecnologías

- **React 18** - UI Framework
- **TypeScript** - Tipado estático
- **Vite** - Build tool
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes UI
- **Axios** - HTTP Client
- **Lucide React** - Iconos

---

## ?? Scripts Disponibles

```bash
npm run dev        # Desarrollo (puerto 3000)
npm run build      # Build producción
npm run preview    # Preview build
npm run lint       # Linter
```

---

## ?? Configuración

### Variables de Entorno
Crear `.env.local`:
```env
VITE_API_URL=https://localhost:7063
```

### Proxy API
Configurado en `vite.config.ts`:
```typescript
proxy: {
  '/api': {
    target: 'https://localhost:7063',
    changeOrigin: true,
    secure: false
  }
}
```

---

## ?? Agregar Componentes UI (shadcn/ui)

```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

Ver catálogo completo: https://ui.shadcn.com/

---

## ?? Solución de Problemas

### Error: "Cannot find module"
```bash
Remove-Item -Recurse -Force node_modules
npm install
```

### Imports no reconocidos
Reiniciar VS Code:
- `Ctrl + Shift + P` ? "Reload Window"

### Puerto ocupado
Cambiar puerto en `vite.config.ts`:
```typescript
server: {
  port: 3001  // Cambiar de 3000
}
```

**Más soluciones:** [COMMANDS.md](./COMMANDS.md)

---

## ?? Recursos

- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **Vite:** https://vitejs.dev/
- **Tailwind:** https://tailwindcss.com/
- **shadcn/ui:** https://ui.shadcn.com/

---

## ?? Contribuir

1. Leer: [STRUCTURE_GUIDE.md](./STRUCTURE_GUIDE.md)
2. Seguir convenciones de código
3. Ejecutar linter antes de commit:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

---

## ?? Estado del Proyecto

- ? Reorganización completada
- ? Estructura profesional
- ? Documentación completa
- ? TypeScript configurado
- ? Compilación exitosa

---

**Proyecto:** TuCita Online Web System  
**Repositorio:** https://github.com/rubencoto/TuCita  
**Branch:** ParteRuben

**Última actualización:** 2025