# ? FIX APLICADO: Vite Build en Heroku

## ?? PROBLEMA IDENTIFICADO

El build de Vite fallaba en Heroku con el error:
```
[vite:build-html] Failed to resolve ./src/main.tsx from /tmp/build_.../TuCita/ClientApp/index.html
```

**Causa raíz:** El `index.html` usaba una ruta **relativa** (`./src/main.tsx`) en lugar de una ruta **absoluta del proyecto** (`/src/main.tsx`).

---

## ?? SOLUCIÓN APLICADA

### Archivo modificado: `TuCita/ClientApp/index.html`

**ANTES:**
```html
<script type="module" src="./src/main.tsx"></script>
```

**DESPUÉS:**
```html
<script type="module" src="/src/main.tsx"></script>
```

**Explicación:** 
- En Vite, las rutas en `index.html` que comienzan con `/` se resuelven desde la raíz del proyecto
- Las rutas relativas (`./`) pueden causar problemas de resolución en diferentes entornos (local vs CI)
- La ruta absoluta del proyecto (`/src/main.tsx`) funciona consistentemente en todos los entornos

---

## ? ARCHIVOS VERIFICADOS

### 1. **TuCita/ClientApp/index.html** ? CORREGIDO
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TuCitaOnline - Sistema de Gestión de Citas Médicas</title>
</head>

<body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
</body>
</html>
```

**Cambios:**
- ? Ruta cambiada de `./src/main.tsx` a `/src/main.tsx`
- ? Eliminado comentario innecesario
- ? `<div id="root"></div>` presente y correcto

### 2. **TuCita/ClientApp/src/main.tsx** ? YA EXISTÍA CORRECTAMENTE
```tsx
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./services/api/axiosConfig";

createRoot(document.getElementById("root")!).render(<App />);
```

**Estado:**
- ? Usa React 18 `createRoot`
- ? Importa `App` correctamente
- ? Importa estilos existentes (`index.css`)
- ? Importa configuración de Axios
- ? **NO REQUIRIÓ MODIFICACIONES**

### 3. **TuCita/ClientApp/package.json** ? YA ESTABA CORRECTO
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    // ... otras dependencias
  },
  "devDependencies": {
    "vite": "6.3.5",
    "@vitejs/plugin-react-swc": "^3.10.2",
    "typescript": "^5.7.2",
    // ... otras dev dependencies
  }
}
```

**Estado:**
- ? Scripts correctos (`build: vite build`)
- ? React y React-DOM presentes
- ? Vite 6.3.5 instalado
- ? Plugin React configurado
- ? TypeScript presente
- ? **NO REQUIRIÓ MODIFICACIONES**

### 4. **TuCita/ClientApp/vite.config.ts** ? YA ESTABA CORRECTO
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
      // ... otros aliases
    },
  },
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  // ... server config
});
```

**Estado:**
- ? Plugin React configurado: `react()`
- ? `base: './'` correcto para rutas relativas en producción
- ? Extensiones `.tsx` incluidas
- ? Alias `@` apunta a `./src`
- ? Output configurado correctamente
- ? **NO REQUIRIÓ MODIFICACIONES**

---

## ? VERIFICACIÓN LOCAL

### Build test realizado:
```bash
cd TuCita/ClientApp
npm run build
```

### Resultado:
```
? 3264 modules transformed.
dist/index.html                     0.52 kB ? gzip:   0.34 kB
dist/assets/index-DLLCiDrg.css     98.29 kB ? gzip:  15.92 kB
dist/assets/index-CrD58hzx.js   1,284.67 kB ? gzip: 345.65 kB
? built in 5.16s
```

**? BUILD EXITOSO**

### index.html generado:
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TuCitaOnline - Sistema de Gestión de Citas Médicas</title>
  <script type="module" crossorigin src="./assets/index-CrD58hzx.js"></script>
  <link rel="stylesheet" crossorigin href="./assets/index-DLLCiDrg.css">
</head>
<body>
    <div id="root"></div>
</body>
</html>
```

**? Paths relativos correctos en producción**

---

## ?? ESTRUCTURA DE ARCHIVOS VERIFICADA

```
TuCita/ClientApp/
??? package.json          ? Scripts correctos
??? index.html            ? CORREGIDO (ruta absoluta /src/main.tsx)
??? vite.config.ts        ? Configuración correcta
??? src/
?   ??? main.tsx          ? Entry point correcto (React 18)
?   ??? App.tsx           ? Existe
?   ??? index.css         ? Existe
?   ??? ...
??? dist/                 ? Build generado correctamente
    ??? index.html
    ??? assets/
```

---

## ?? CAMBIOS APLICADOS Y PUSHEADOS

**Commit:** `03ab963` - "Fix Vite build: Change script src from relative ./src/main.tsx to absolute /src/main.tsx"

**Branch:** `ParteRuben`

**Archivo modificado:** `TuCita/ClientApp/index.html` (1 línea cambiada)

---

## ?? RESULTADO ESPERADO EN HEROKU

Con este fix, el build en Heroku debería:

1. ? Node.js buildpack instala Node 20.x
2. ? .NET buildpack ejecuta `dotnet publish`
3. ? MSBuild ejecuta `npm install` en `ClientApp/`
4. ? MSBuild ejecuta `npm run build` en `ClientApp/`
5. ? **Vite resuelve `/src/main.tsx` correctamente**
6. ? **Build completa exitosamente**
7. ? Archivos copiados a `wwwroot/`
8. ? App despliega correctamente

---

## ?? RESUMEN

| Archivo | Estado | Acción |
|---------|--------|--------|
| `index.html` | ? **CORREGIDO** | Cambio de ruta relativa a absoluta |
| `src/main.tsx` | ? Ya correcto | Sin cambios |
| `package.json` | ? Ya correcto | Sin cambios |
| `vite.config.ts` | ? Ya correcto | Sin cambios |
| **Build local** | ? **EXITOSO** | Verificado |
| **Commit/Push** | ? **COMPLETADO** | En branch ParteRuben |

---

## ?? LECCIÓN APRENDIDA

**Problema:** Vite no podía resolver `./src/main.tsx` en el entorno de build de Heroku.

**Solución:** Usar ruta absoluta del proyecto `/src/main.tsx` en `index.html`.

**Por qué funciona:**
- Vite trata las rutas que comienzan con `/` como relativas a la raíz del proyecto
- Esto es consistente entre desarrollo local y CI/Heroku
- Durante el build, Vite transforma estas rutas correctamente a paths relativos para producción

**Referencia:** [Vite - index.html and Project Root](https://vitejs.dev/guide/#index-html-and-project-root)
