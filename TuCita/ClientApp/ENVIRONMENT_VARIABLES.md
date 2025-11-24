# ?? Variables de Entorno - TuCitaOnline Frontend

## ?? Variables Disponibles

### Variables de Entorno Públicas (VITE_*)

En **Vite**, solo las variables con prefijo `VITE_` son expuestas al código del cliente.

| Variable | Tipo | Descripción | Ejemplo Desarrollo | Ejemplo Producción |
|----------|------|-------------|-------------------|-------------------|
| `VITE_API_URL` | `string` | URL base del backend API | `https://localhost:7063` | `https://api.tucitaonline.com` |

> ?? **IMPORTANTE:** Las variables `VITE_*` son **públicas** y se incluyen en el bundle final. **NO** incluyas secretos o API keys privadas.

---

## ??? Configuración por Entorno

### Desarrollo Local

**Archivo:** `.env.local` (no subir a Git)

```bash
# El proyecto ya tiene configurado el backend en:
# TuCita/.env (Backend .NET)

# Para el frontend, crear .env.local:
VITE_API_URL=https://localhost:7063
```

> ?? **Nota:** El archivo `.env` en la raíz (`TuCita/.env`) es para el backend .NET. Para el frontend React, crea `.env.local` en `TuCita/ClientApp/`.

### Producción (AWS Amplify)

**Configurar en:** AWS Amplify Console ? Environment variables

```
VITE_API_URL=https://api.tucitaonline.com
```

---

## ?? Cómo Usar Variables de Entorno

### En Código TypeScript/React

```typescript
// ? Correcto: Usar import.meta.env en Vite
const API_URL = import.meta.env.VITE_API_URL || 'https://localhost:7063';

// ? Incorrecto: process.env no funciona en Vite
// const API_URL = process.env.VITE_API_URL; // ?? NO usar
```

### Ejemplo en apiConfig.ts

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7063',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

---

## ?? Variables de Entorno Actuales en el Proyecto

### ? Backend (.NET) - TuCita/.env

El backend ya tiene configuradas variables de entorno en `TuCita/.env`:
- ? SMTP (AWS SES)
- ? Base de datos (AWS RDS)
- ? JWT
- ? URLs de la aplicación

### ?? Frontend (React/Vite) - Recomendado

Actualmente **NO** hay variables de entorno en uso en el código frontend.

#### Recomendación: Agregar VITE_API_URL

Para hacer el proyecto más flexible entre entornos:

**1. Crear archivo `.env.local` en `TuCita/ClientApp/`:**

```bash
VITE_API_URL=https://localhost:7063
```

**2. Actualizar `apiConfig.ts`:**

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  }
});

export default api;
```

---

## ?? Configuración en AWS Amplify

### Paso a Paso

1. **Ir a AWS Amplify Console**
   ```
   https://console.aws.amazon.com/amplify/
   ```

2. **Seleccionar tu aplicación**

3. **Ir a "Environment variables"** en el menú lateral

4. **Click en "Manage variables"**

5. **Agregar variables:**
   - Click en **"Add variable"**
   - **Variable name:** `VITE_API_URL`
   - **Value:** `https://api.tucitaonline.com` ? **Cambiar a tu URL real**
   - Click en **"Save"**

6. **Re-desplegar la aplicación**
   - Las variables solo se aplican en nuevos builds
   - Click en **"Redeploy this version"**

---

## ?? Seguridad

### ? Variables Públicas (Safe)

Estas variables **SÍ** pueden incluirse en el código frontend:
- ? URLs públicas del backend
- ? IDs de aplicación pública
- ? Configuraciones de UI

### ? Variables Privadas (NUNCA incluir)

Estas variables **NUNCA** deben estar en el frontend:
- ? API Keys privadas (como las del backend en `TuCita/.env`)
- ? Secretos de JWT
- ? Credenciales de base de datos
- ? Tokens de servicios externos (SMTP, AWS SES, etc.)

> ?? **Regla de oro:** Si es un secreto, debe estar **solo en el backend**.

---

## ?? Archivos de Entorno

### Backend - `TuCita/.env`

**Ubicación:** `TuCita/.env`

Este archivo **NO se sube a Git** (está en `.gitignore`) y contiene variables privadas del backend:
- SMTP_USERNAME, SMTP_PASSWORD
- DB_SERVER, DB_PASSWORD
- JWT_KEY

### Frontend - `.env.local` (Crear)

**Ubicación:** `TuCita/ClientApp/.env.local`

Este archivo **NO se sube a Git** (ya está en `.gitignore`).

```bash
# Crear archivo
cd TuCita/ClientApp
echo "VITE_API_URL=https://localhost:7063" > .env.local
```

---

## ?? Troubleshooting

### Variables no se cargan

**Síntomas:**
- `import.meta.env.VITE_API_URL` retorna `undefined`

**Soluciones:**
1. Verificar que la variable tiene el prefijo `VITE_`
2. Reiniciar el servidor de desarrollo:
   ```bash
   # Detener (Ctrl+C)
   npm run dev
   ```
3. Verificar que `.env.local` existe en `TuCita/ClientApp/`

### Variables de producción no funcionan

**Síntomas:**
- En AWS Amplify la app no conecta al backend

**Soluciones:**
1. Verificar que `VITE_API_URL` está configurada en AWS Amplify Console
2. Re-desplegar después de cambiar variables
3. Revisar logs de build en AWS Amplify

---

## ?? Referencias

- **Vite Env Variables:** https://vitejs.dev/guide/env-and-mode.html
- **AWS Amplify Environment Variables:** https://docs.aws.amazon.com/amplify/latest/userguide/environment-variables.html

---

**Última actualización:** 2025
