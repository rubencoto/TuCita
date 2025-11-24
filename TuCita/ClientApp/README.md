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

## ?? Deploy en AWS Amplify

### ?? Requisitos Previos

1. ? Cuenta de AWS activa ([Crear cuenta](https://aws.amazon.com/))
2. ? Repositorio en GitHub con tu código
3. ? Backend API desplegado y accesible (URL de producción)

---

### ?? Paso 1: Preparación del Proyecto

#### 1.1 Configurar Variables de Entorno

**Para desarrollo local (Opcional):**

El proyecto ya tiene configurado el backend en `TuCita/.env`. Si deseas usar variables de entorno en el frontend, crea un archivo `.env.local` en `TuCita/ClientApp/`:

```bash
# Crear archivo .env.local
echo "VITE_API_URL=https://localhost:7063" > .env.local
```

> ?? **Nota:** El proyecto actualmente funciona sin variables de entorno en desarrollo (usa el proxy configurado en `vite.config.ts`).

**Para producción (se configuran en AWS Amplify):**
```
VITE_API_URL=https://api.tucitaonline.com
```

> ?? **IMPORTANTE:** Las variables en Vite deben tener el prefijo `VITE_` para ser expuestas al cliente.

#### 1.2 Verificar Build Local

Antes de desplegar, asegúrate que el build funciona:

```bash
# Limpiar instalación anterior
npm ci

# Ejecutar build
npm run build

# Verificar que se generó la carpeta 'dist'
ls dist

# (Opcional) Preview local del build
npm run preview
```

Si el build falla, corrige los errores antes de continuar.

---

### ?? Paso 2: Crear Aplicación en AWS Amplify

#### 2.1 Acceder a AWS Amplify Console

1. Inicia sesión en [AWS Console](https://console.aws.amazon.com/)
2. Busca y selecciona **AWS Amplify**
3. Click en **"Host web app"** (o "New app" ? "Host web app")

#### 2.2 Conectar GitHub

1. Selecciona **GitHub** como proveedor
2. Click en **"Connect to GitHub"**
3. Autoriza AWS Amplify en tu cuenta de GitHub
4. Selecciona el repositorio: **`rubencoto/TuCita`**
5. Selecciona la rama: **`main`** (o la rama que uses para producción)
6. Click en **"Next"**

#### 2.3 Configurar Build Settings

AWS Amplify detectará automáticamente el archivo `amplify.yml` en la ruta:
```
TuCita/ClientApp/amplify.yml
```

? **Verificar que la configuración muestre:**
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

**?? IMPORTANTE:** Actualiza el **App build specification** para apuntar a la carpeta `ClientApp`:

En la sección "Build settings", edita el archivo `amplify.yml` y asegúrate que incluya:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd TuCita/ClientApp
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: TuCita/ClientApp/dist
    files:
      - '**/*'
  cache:
    paths:
      - TuCita/ClientApp/node_modules/**/*
```

#### 2.4 Configurar Variables de Entorno

1. En la misma pantalla, desplázate a **"Environment variables"**
2. Click en **"Add environment variable"**
3. Agrega las siguientes variables:

| Nombre de Variable | Valor de Producción | Descripción |
|-------------------|---------------------|-------------|
| `VITE_API_URL` | `https://api.tucitaonline.com` | URL del backend API en producción |

> ?? **Nota:** Reemplaza `https://api.tucitaonline.com` con la URL real de tu backend desplegado.

4. Click en **"Next"**

#### 2.5 Revisar y Desplegar

1. Revisa todas las configuraciones
2. Click en **"Save and deploy"**
3. Espera a que AWS Amplify:
   - Clone el repositorio
   - Instale dependencias
   - Ejecute el build
   - Despliegue la aplicación

?? **Tiempo estimado:** 3-5 minutos

---

### ?? Paso 3: Verificar Despliegue

#### 3.1 Acceder a la Aplicación

Una vez completado el despliegue:

1. AWS Amplify te mostrará una **URL única**, por ejemplo:
   ```
   https://main.d1a2b3c4d5e6f7.amplifyapp.com
   ```

2. Click en la URL para abrir tu aplicación

#### 3.2 Verificar Funcionamiento

? **Checklist de verificación:**
- [ ] La página principal carga correctamente
- [ ] Los estilos Tailwind CSS se aplican
- [ ] Las llamadas a la API funcionan (verificar Network en DevTools)
- [ ] La navegación entre páginas funciona
- [ ] El login/registro funciona correctamente

#### 3.3 Configurar Dominio Personalizado (Opcional)

1. En AWS Amplify Console, ve a **"Domain management"**
2. Click en **"Add domain"**
3. Sigue los pasos para agregar tu dominio (ej: `www.tucitaonline.com`)
4. Configura los registros DNS según las instrucciones

---

### ?? Paso 4: Despliegues Automáticos

#### ? Cómo Funciona

Una vez configurado, **cada vez que hagas `git push` a la rama `main`**, AWS Amplify:

1. ?? Detecta el cambio en GitHub automáticamente
2. ?? Clona la última versión del código
3. ??? Ejecuta `npm ci` y `npm run build`
4. ?? Despliega la nueva versión
5. ? Actualiza la URL de producción

#### ?? Workflow de Desarrollo

```bash
# 1. Hacer cambios en tu código local
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Subir a GitHub
git push origin main

# 3. ¡Listo! AWS Amplify despliega automáticamente
# Puedes ver el progreso en AWS Amplify Console
```

#### ?? Monitorear Despliegues

1. Ve a **AWS Amplify Console**
2. Selecciona tu aplicación
3. En la pestaña **"Deployments"** verás:
   - ? Estado de cada build (Succeeded, Failed, etc.)
   - ?? Duración del build
   - ?? Logs completos de cada fase

---

### ?? Solución de Problemas

#### ? Build Falla en AWS Amplify

**Problema:** El build falla con errores de TypeScript o ESLint

**Solución:**
1. Ejecuta `npm run build` localmente y corrige errores
2. Haz commit y push de los cambios
3. AWS Amplify volverá a intentar el build automáticamente

#### ? La aplicación carga pero no conecta con el backend

**Problema:** Error 404 o CORS en las llamadas API

**Solución:**
1. Verifica que `VITE_API_URL` esté configurada correctamente en AWS Amplify
2. Verifica que el backend esté desplegado y accesible
3. Verifica la configuración CORS en el backend (.NET)

#### ? Cambios en variables de entorno no se reflejan

**Problema:** Actualicé `VITE_API_URL` pero la app sigue usando el valor anterior

**Solución:**
1. Ve a AWS Amplify Console
2. Click en **"Redeploy this version"**
3. Las variables se aplicarán en el nuevo build

#### ?? Logs Detallados

Para ver logs completos:
1. AWS Amplify Console ? Tu app
2. Click en el build específico
3. Revisa cada fase: Provision, Build, Deploy, Verify

---

## ?? Documentación Adicional

Para más información sobre el deploy, consulta:

- **[AWS_AMPLIFY_DEPLOY.md](./AWS_AMPLIFY_DEPLOY.md)** - Guía rápida de deploy
- **[DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md)** - Checklist completo paso a paso
- **[ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md)** - Variables de entorno

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