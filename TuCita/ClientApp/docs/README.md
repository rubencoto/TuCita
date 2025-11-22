# ?? Documentación ClientApp - TuCita

## ?? Guías Disponibles

### 1. ?? **REORGANIZATION_PLAN.md**
Plan detallado de la reorganización del proyecto.

**Contiene:**
- Estructura antigua vs nueva
- Beneficios de la reorganización
- Pasos de implementación
- Archivos que permanecen en su ubicación

[Ver documento ?](./REORGANIZATION_PLAN.md)

---

### 2. ? **REORGANIZATION_SUMMARY.md**
Resumen ejecutivo de los cambios realizados.

**Contiene:**
- Nueva estructura de carpetas
- Archivos modificados (26 archivos)
- Carpetas eliminadas
- Estado de la compilación
- Próximos pasos recomendados

[Ver documento ?](./REORGANIZATION_SUMMARY.md)

---

### 3. ?? **STRUCTURE_GUIDE.md**
Guía práctica para trabajar con la nueva estructura.

**Contiene:**
- ¿Dónde va cada tipo de archivo?
- Reglas de imports
- Convenciones de nombres
- Ejemplos prácticos (crear páginas, servicios, hooks)
- Checklist para nuevos archivos

**? Recomendado para:**
- Nuevos desarrolladores en el equipo
- Agregar nuevas funcionalidades
- Crear componentes y servicios

[Ver documento ?](./STRUCTURE_GUIDE.md)

---

### 4. ??? **COMMANDS.md**
Comandos útiles para desarrollo diario.

**Contiene:**
- Gestión de dependencias
- Comandos de desarrollo
- Linting y formato
- Git y control de versiones
- Debugging
- Solución de problemas comunes

**? Recomendado para:**
- Desarrollo diario
- Troubleshooting
- Aprender comandos útiles

[Ver documento ?](./COMMANDS.md)

---

### 5. ?? **STRUCTURE.txt**
Estructura completa del proyecto en formato árbol.

**Contiene:**
- Visualización completa de carpetas y archivos
- Generado automáticamente con `tree`

[Ver archivo ?](./STRUCTURE.txt)

---

## ?? Inicio Rápido

### Para Nuevos Desarrolladores

1. **Leer primero:**
   - ? [REORGANIZATION_SUMMARY.md](./REORGANIZATION_SUMMARY.md) - Entender los cambios
   - ? [STRUCTURE_GUIDE.md](./STRUCTURE_GUIDE.md) - Aprender la estructura

2. **Comandos iniciales:**
   ```bash
   npm install        # Instalar dependencias
   npm run dev        # Iniciar desarrollo
   ```

3. **Desarrollo:**
   - ?? Consultar [STRUCTURE_GUIDE.md](./STRUCTURE_GUIDE.md) para ubicar archivos
   - ??? Consultar [COMMANDS.md](./COMMANDS.md) para comandos

---

### Para Desarrolladores Existentes

1. **Revisar cambios:**
   - ? [REORGANIZATION_SUMMARY.md](./REORGANIZATION_SUMMARY.md)

2. **Actualizar conocimientos:**
   - ? [STRUCTURE_GUIDE.md](./STRUCTURE_GUIDE.md) - Nueva ubicación de archivos

3. **Continuar desarrollo:**
   - Usar imports absolutos: `@/components/...`
   - Seguir convenciones de carpetas
   - Consultar [COMMANDS.md](./COMMANDS.md) si es necesario

---

## ?? Estructura del Proyecto

```
ClientApp/
??? src/
?   ??? components/
?   ?   ??? layout/          # Navegación y estructura
?   ?   ??? common/          # Componentes reutilizables
?   ?   ??? ui/              # shadcn/ui (no modificar)
?   ?   ??? pages/           # Páginas por dominio
?   ?       ??? auth/
?   ?       ??? patient/
?   ?       ??? doctor/
?   ?
?   ??? services/
?   ?   ??? api/             # Servicios por dominio
?   ?       ??? auth/
?   ?       ??? patient/
?   ?       ??? doctor/
?   ?
?   ??? styles/
?   ??? guidelines/
?   ??? App.tsx
?   ??? main.tsx
?
??? public/
??? docs/                    # ?? ESTA CARPETA
?   ??? REORGANIZATION_PLAN.md
?   ??? REORGANIZATION_SUMMARY.md
?   ??? STRUCTURE_GUIDE.md
?   ??? COMMANDS.md
?   ??? STRUCTURE.txt
?   ??? README.md           # ?? Estás aquí
?
??? package.json
??? vite.config.ts
??? tailwind.config.js
```

---

## ?? Ubicaciones Rápidas

### Crear Nueva Funcionalidad

| Tipo | Ubicación |
|------|-----------|
| Página de paciente | `src/components/pages/patient/` |
| Página de doctor | `src/components/pages/doctor/` |
| Servicio de paciente | `src/services/api/patient/` |
| Servicio de doctor | `src/services/api/doctor/` |
| Componente reutilizable | `src/components/common/` |
| Layout | `src/components/layout/` |

### Archivos de Configuración

| Archivo | Ubicación | Propósito |
|---------|-----------|-----------|
| `vite.config.ts` | Raíz | Configuración Vite |
| `tsconfig.json` | Raíz | TypeScript |
| `tailwind.config.js` | Raíz | Tailwind CSS |
| `package.json` | Raíz | Dependencias |

---

## ?? Comandos Esenciales

```bash
# Desarrollo
npm run dev              # Iniciar servidor desarrollo

# Build
npm run build            # Compilar para producción
npm run preview          # Preview del build

# Calidad de código
npm run lint             # Verificar código
npx tsc --noEmit        # Verificar tipos

# Dependencias
npm install              # Instalar dependencias
npx shadcn@latest add   # Agregar componente UI
```

---

## ?? Convenciones

### Imports
```typescript
// ? Usar imports absolutos
import { Button } from '@/components/ui/button';
import { HomePage } from '@/components/pages/patient/home-page';

// ?? Imports relativos solo en misma carpeta
import { Helper } from './helper';
```

### Nombres de Archivos
```
? kebab-case.tsx       home-page.tsx
? kebab-case.ts        auth-service.ts
??  PascalCase.tsx     ImageWithFallback.tsx (componentes especiales)
```

### Componentes
```typescript
// ? BIEN
export function HomePage() { ... }

// ? MAL
export function homePage() { ... }
```

---

## ?? Ayuda

### Problemas Comunes

1. **Error de imports**
   - Ver: [COMMANDS.md](./COMMANDS.md) ? Solución de Problemas

2. **¿Dónde va este archivo?**
   - Ver: [STRUCTURE_GUIDE.md](./STRUCTURE_GUIDE.md) ? Ubicación de Archivos

3. **Comandos de npm**
   - Ver: [COMMANDS.md](./COMMANDS.md)

4. **Nuevas funcionalidades**
   - Ver: [STRUCTURE_GUIDE.md](./STRUCTURE_GUIDE.md) ? Ejemplos Prácticos

---

## ?? Contacto

**Proyecto:** TuCita Online Web System  
**Repositorio:** https://github.com/rubencoto/TuCita  
**Branch:** ParteRuben

---

## ?? Estado del Proyecto

- ? Reorganización completa
- ? Compilación exitosa
- ? 26 archivos actualizados
- ? Estructura profesional
- ? Documentación completa

---

**Última actualización:** 2025  
**Versión de la estructura:** 1.0.0
