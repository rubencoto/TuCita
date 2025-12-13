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

## ?? Deploy

### ?? AWS Amplify (Frontend)

Para más información sobre el deploy en AWS Amplify, consulta:

- **[AWS_AMPLIFY_DEPLOY.md](./AWS_AMPLIFY_DEPLOY.md)** - Guía rápida de deploy
- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Checklist completo paso a paso
- **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - Variables de entorno

### ?? Heroku (Full Stack)

Para desplegar la aplicación completa (Backend + Frontend) en Heroku:

- **[HEROKU_DEPLOY.md](../HEROKU_DEPLOY.md)** - Guía completa de despliegue en Heroku
- **Dominio:** https://www.tucitaonline.org

**Deploy rápido:**
```bash
# Login en Heroku
heroku login

# Crear app
heroku create tucita-online

# Configurar stack Docker
heroku stack:set container -a tucita-online

# Configurar variables de entorno (ver HEROKU_DEPLOY.md)
heroku config:set DB_SERVER=... -a tucita-online

# Desplegar
git push heroku ParteRuben:main

# Configurar dominio
heroku domains:add www.tucitaonline.org -a tucita-online
heroku certs:auto:enable -a tucita-online
```

---

## ?? Documentación Adicional

Para más información sobre el deploy, consulta:

- **[AWS_AMPLIFY_DEPLOY.md](./AWS_AMPLIFY_DEPLOY.md)** - Guía rápida de deploy
- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Checklist completo paso a paso
- **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - Variables de entorno
- **[HEROKU_DEPLOY.md](../HEROKU_DEPLOY.md)** - Guía completa de despliegue en Heroku

### ?? Recursos Adicionales

- **AWS Amplify Docs:** https://docs.aws.amazon.com/amplify/
- **Vite Deployment Guide:** https://vitejs.dev/guide/static-deploy.html
- **React + Vite Best Practices:** https://vitejs.dev/guide/

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
?   ?       ??? admin/       # Módulo administración
?   ?
?   ??? services/            # Servicios API
?   ?   ??? api/
?   ?       ??? auth/
?   ?       ??? patient/
?   ?       ??? doctor/
?   ?       ??? admin/
?   ?
?   ??? styles/
?   ??? App.tsx
?   ??? main.tsx
?
??? package.json
??? vite.config.ts
??? tailwind.config.js
??? amplify.yml             # ? Configuración AWS Amplify
??? README.md               # ? Estás aquí
```

---

## ?? Convenciones de Código

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
npm run type-check # Verificación de tipos TypeScript
```

---

## ?? Configuración

### Variables de Entorno

**Desarrollo (Opcional):**

Si deseas usar variables de entorno en desarrollo local, crea el archivo `.env.local`:

```bash
# Crear .env.local en TuCita/ClientApp/
VITE_API_URL=https://localhost:7063
```

> ?? **Nota:** El proyecto funciona sin variables de entorno en desarrollo gracias al proxy en `vite.config.ts`.

**Producción (AWS Amplify):**
```
VITE_API_URL=https://api.tucitaonline.com
```

### Proxy API (Solo Desarrollo)

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

> ?? **Nota:** El proxy solo funciona en `npm run dev`, no afecta producción.

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

---

## ?? Recursos

- **React:** https://react.dev/
- **TypeScript:** https://www.typescriptlang.org/
- **Vite:** https://vitejs.dev/
- **Tailwind:** https://tailwindcss.com/
- **shadcn/ui:** https://ui.shadcn.com/
- **AWS Amplify:** https://aws.amazon.com/amplify/

---

## ?? Contribuir

1. Seguir convenciones de código
2. Ejecutar linter antes de commit:
   ```bash
   npm run lint
   npx tsc --noEmit
   ```

---

## ? Estado del Proyecto

- ? Estructura profesional
- ? Documentación completa
- ? TypeScript configurado
- ? Compilación exitosa
- ? Listo para deploy en AWS Amplify

---

**Proyecto:** TuCita Online Web System  
**Repositorio:** https://github.com/rubencoto/TuCita  
**Branch:** ParteRuben

**Última actualización:** 2025