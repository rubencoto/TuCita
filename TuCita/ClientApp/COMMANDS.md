# ??? Comandos Útiles - ClientApp

## ?? Gestión de Dependencias

### Instalar todas las dependencias
```bash
npm install
```

### Agregar una nueva dependencia
```bash
npm install nombre-paquete
npm install nombre-paquete --save-dev  # Para dependencias de desarrollo
```

### Actualizar dependencias
```bash
npm update
npm outdated  # Ver paquetes desactualizados
```

### Agregar componentes de shadcn/ui
```bash
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
# Ver todos: https://ui.shadcn.com/docs/components
```

---

## ?? Desarrollo

### Iniciar servidor de desarrollo
```bash
npm run dev
```
- URL: `http://localhost:3000`
- Hot reload activado
- Proxy API configurado: `/api` ? `https://localhost:7063`

### Build para producción
```bash
npm run build
```
- Genera carpeta `dist/`
- Optimizado y minificado
- Listo para deployment

### Preview del build
```bash
npm run preview
```
- Simula entorno de producción
- URL: `http://localhost:4173`

---

## ?? Linting y Formato

### Ejecutar linter
```bash
npm run lint
npm run lint:fix  # Auto-corregir errores
```

### Verificar tipos TypeScript
```bash
npx tsc --noEmit
```

---

## ?? Navegación de Archivos

### Estructura actual
```bash
# Ver estructura de carpetas
tree src /F /A

# Ver solo carpetas
tree src /A
```

### Buscar archivos
```bash
# Buscar por nombre
Get-ChildItem -Path src -Recurse -Filter "*nombre*"

# Buscar contenido
Get-ChildItem -Path src -Recurse -Include "*.tsx" | Select-String "texto"
```

---

## ?? Git (Control de Versiones)

### Ver estado
```bash
git status
git diff  # Ver cambios
```

### Commits
```bash
git add .
git commit -m "feat: descripción del cambio"
git push origin ParteRuben
```

### Sincronizar con main
```bash
git fetch origin
git merge origin/main
```

---

## ?? Limpieza

### Limpiar node_modules y reinstalar
```bash
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Limpiar caché de npm
```bash
npm cache clean --force
```

### Limpiar build
```bash
Remove-Item -Recurse -Force dist
```

---

## ?? Información del Proyecto

### Ver dependencias instaladas
```bash
npm list --depth=0
```

### Ver información de un paquete
```bash
npm info nombre-paquete
```

### Ver scripts disponibles
```bash
npm run
```

---

## ?? Herramientas de Desarrollo

### Instalar extensiones recomendadas de VS Code
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)
- Auto Import

### Configurar Prettier (si no existe)
```bash
npm install --save-dev prettier
```

Crear `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
```

---

## ?? Debugging

### Logs en desarrollo
```typescript
console.log('Debug:', variable);
console.table(array);  // Muestra arrays como tabla
console.error('Error:', error);
```

### Ver network requests
- Abrir DevTools: `F12`
- Network tab: Ver llamadas API
- Console tab: Ver logs

### React DevTools
```bash
# Instalar extensión de Chrome/Edge
# Permite inspeccionar componentes React
```

---

## ?? Crear Nuevos Archivos

### Página de paciente
```bash
# Windows PowerShell
New-Item -Path "src\components\pages\patient\nueva-page.tsx" -ItemType File
```

### Servicio
```bash
New-Item -Path "src\services\api\patient\nuevoServicio.ts" -ItemType File
```

### Componente común
```bash
New-Item -Path "src\components\common\nuevo-componente.tsx" -ItemType File
```

---

## ?? Testing (Futuro)

### Instalar Vitest
```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
```

### Ejecutar tests
```bash
npm run test
npm run test:watch  # Modo watch
npm run test:coverage  # Con cobertura
```

---

## ?? Deployment

### Build optimizado
```bash
npm run build
```

### Verificar build
```bash
npm run preview
```

### Desplegar a Azure (con backend .NET)
El build se integra automáticamente con el proyecto .NET:
- Build genera archivos en `dist/`
- .NET los sirve como static files
- Configurado en `Program.cs` del backend

---

## ?? Solución de Problemas Comunes

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
Remove-Item -Recurse -Force node_modules
npm install
```

### Error: "Port already in use"
```bash
# Cambiar puerto en vite.config.ts
server: {
  port: 3001  # Cambiar de 3000 a 3001
}
```

### Error de tipos TypeScript
```bash
# Regenerar tipos
npx tsc --noEmit

# Reinstalar @types
npm install --save-dev @types/react @types/react-dom
```

### Imports no reconocidos
```bash
# Verificar tsconfig.json
# Debe tener:
"paths": {
  "@/*": ["./src/*"]
}

# Reiniciar VS Code
# Ctrl + Shift + P ? "Reload Window"
```

---

## ?? Checklist de Desarrollo

Antes de hacer commit:

- [ ] `npm run lint` - Sin errores
- [ ] `npx tsc --noEmit` - Sin errores de tipos
- [ ] `npm run build` - Build exitoso
- [ ] Probar en desarrollo (`npm run dev`)
- [ ] Verificar que no rompiste rutas existentes
- [ ] Actualizar documentación si agregaste features

---

## ?? Referencias Rápidas

### Configuración Vite
- `vite.config.ts` - Configuración del bundler
- `tsconfig.json` - Configuración TypeScript
- `tailwind.config.js` - Configuración Tailwind CSS

### Variables de Entorno
- Crear `.env.local` para variables locales
- Prefijo requerido: `VITE_`
- Ejemplo: `VITE_API_URL=https://api.example.com`

### Imports Absolutos
- Configurado con `@/` en `vite.config.ts`
- Ejemplo: `@/components/ui/button`
- Equivalente a: `../../components/ui/button`

---

**Última actualización:** 2025  
**Proyecto:** TuCita Online Web System
