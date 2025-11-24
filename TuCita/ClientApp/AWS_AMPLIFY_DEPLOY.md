# ?? Guía Rápida: Deploy AWS Amplify - TuCitaOnline

## ? Checklist Pre-Deploy

Antes de desplegar en AWS Amplify, asegúrate de:

- [ ] ? Build local exitoso (`npm run build` funciona sin errores)
- [ ] ? Código subido a GitHub en la rama `main`
- [ ] ? Backend API desplegado y URL de producción disponible
- [ ] ? Cuenta de AWS activa
- [ ] ? Variables de entorno identificadas

---

## ?? Variables de Entorno Requeridas

### Para Producción (AWS Amplify)

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_API_URL` | `https://api.tucitaonline.com` | URL del backend API en producción |

> ?? **IMPORTANTE:** Reemplaza con tu URL real del backend desplegado.

### Para Desarrollo Local (Opcional)

Si deseas usar variables de entorno en desarrollo local, crea el archivo `.env.local` en `TuCita/ClientApp/`:

```bash
VITE_API_URL=https://localhost:7063
```

> ?? **Nota:** Actualmente el proyecto funciona sin variables de entorno en desarrollo (usa proxy configurado en `vite.config.ts`).

---

## ?? Pasos para Deploy en AWS Amplify

### 1?? Crear App en AWS Amplify

1. Ir a [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Click en **"Host web app"**
3. Seleccionar **GitHub** como proveedor
4. Conectar y autorizar GitHub
5. Seleccionar:
   - **Repositorio:** `rubencoto/TuCita`
   - **Branch:** `main`
6. Click en **"Next"**

---

### 2?? Configurar Build Settings

AWS Amplify detectará automáticamente el archivo `amplify.yml`.

**Verificar que la configuración sea:**
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

Si AWS Amplify no detecta el archivo, cópialo manualmente en la sección **"Build settings"**.

---

### 3?? Configurar Variables de Entorno

En la sección **"Environment variables"**:

1. Click en **"Add environment variable"**
2. Agregar:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://api.tucitaonline.com` ? **Cambiar a tu URL real**
3. Click en **"Next"**

---

### 4?? Revisar y Desplegar

1. Revisar todas las configuraciones
2. Click en **"Save and deploy"**
3. Esperar 3-5 minutos mientras AWS Amplify:
   - ? Clona el repo
   - ? Instala dependencias
   - ? Ejecuta build
   - ? Despliega

---

## ?? Post-Deploy

### Verificar Funcionamiento

Una vez desplegado, AWS Amplify te dará una URL como:
```
https://main.d1a2b3c4d5e6f7.amplifyapp.com
```

**Checklist de verificación:**
- [ ] ? Página principal carga
- [ ] ? Estilos CSS funcionan
- [ ] ? Llamadas API funcionan (verificar Network tab)
- [ ] ? Navegación entre páginas funciona
- [ ] ? Login/Registro funciona

---

## ?? Despliegues Automáticos

### Workflow de Desarrollo

Cada vez que hagas `git push origin main`:

```bash
# 1. Hacer cambios locales
git add .
git commit -m "feat: nueva funcionalidad"

# 2. Subir a GitHub
git push origin main

# 3. ¡AWS Amplify despliega automáticamente! ??
```

### Monitorear Builds

1. Ir a [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. Seleccionar tu app
3. Ver tab **"Deployments"** para:
   - ? Estado del build
   - ?? Duración
   - ?? Logs completos

---

## ?? Solución de Problemas Comunes

### ? Build Falla

**Causa:** Errores de TypeScript o dependencias

**Solución:**
1. Ejecutar localmente:
   ```bash
   cd TuCita/ClientApp
   npm ci
   npm run build
   ```
2. Corregir errores que aparezcan
3. Hacer commit y push

---

### ? No conecta con backend

**Causa:** Variable `VITE_API_URL` mal configurada o backend no accesible

**Solución:**
1. Verificar que `VITE_API_URL` en AWS Amplify apunta a la URL correcta
2. Verificar que el backend está desplegado y responde
3. Verificar CORS en el backend
4. Re-desplegar en AWS Amplify:
   - AWS Amplify Console ? Tu app
   - Click en **"Redeploy this version"**

---

### ? Cambios en variables de entorno no se reflejan

**Causa:** Variables se aplican solo en nuevos builds

**Solución:**
1. Ir a AWS Amplify Console
2. Editar variables de entorno
3. Click en **"Redeploy this version"**

---

## ?? Recursos Útiles

- [AWS Amplify Docs](https://docs.aws.amazon.com/amplify/)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [README completo](./README.md)

---

## ?? Soporte

Si tienes problemas:

1. Revisar logs en AWS Amplify Console
2. Verificar que el build local funciona
3. Revisar sección "Solución de Problemas" en [README.md](./README.md)

---

**Última actualización:** 2025  
**Repositorio:** https://github.com/rubencoto/TuCita
