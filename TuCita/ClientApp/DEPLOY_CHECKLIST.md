# ? Checklist Final - Deploy AWS Amplify

## ?? Archivos Creados/Modificados

- ? `TuCita/ClientApp/amplify.yml` - Configuración de build para AWS Amplify
- ? `TuCita/ClientApp/README.md` - Documentación actualizada con sección de Deploy
- ? `TuCita/ClientApp/AWS_AMPLIFY_DEPLOY.md` - Guía rápida de deploy
- ? `TuCita/ClientApp/ENVIRONMENT_VARIABLES.md` - Documentación de variables de entorno
- ? `TuCita/.gitignore` - Actualizado con comentarios de AWS Amplify
- ? `TuCita/.env` - Ya existente (Backend .NET - NO subir a Git)

---

## ??? Verificación Local

- ? Build local funciona correctamente (`npm run build` ?)
- ? Archivos generados en `TuCita/ClientApp/dist/`
- ?? TypeScript tiene warnings menores (no afectan el build de producción)

---

## ?? Checklist para Deploy en AWS Amplify

### Antes de Iniciar

- [ ] **Backend API desplegado** y accesible desde Internet
  - URL de producción: `_______________________`
  - Endpoint de prueba funciona: `curl https://api.tucitaonline.com/health`

- [ ] **Código subido a GitHub**
  ```bash
  git add .
  git commit -m "chore: preparar para deploy en AWS Amplify"
  git push origin main
  ```

- [ ] **Cuenta de AWS activa**
  - Acceso a: https://console.aws.amazon.com/

---

### Paso 1: Crear Aplicación en AWS Amplify

- [ ] Ir a [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
- [ ] Click en **"Host web app"**
- [ ] Seleccionar **GitHub** como proveedor
- [ ] Conectar cuenta de GitHub (autorizar AWS Amplify)
- [ ] Seleccionar repositorio: **`rubencoto/TuCita`**
- [ ] Seleccionar branch: **`main`**
- [ ] Click **"Next"**

---

### Paso 2: Configurar Build Settings

- [ ] Verificar que AWS Amplify detectó el archivo `amplify.yml`
- [ ] Confirmar que la configuración muestra:
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

- [ ] Si no se detectó, copiar/pegar manualmente desde `TuCita/ClientApp/amplify.yml`

---

### Paso 3: Configurar Variables de Entorno

- [ ] En la sección **"Environment variables"**, click **"Add environment variable"**
- [ ] Agregar variables:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_API_URL` | `https://api.tucitaonline.com` | URL del backend (?? cambiar a tu URL real) |

- [ ] Click **"Next"**

---

### Paso 4: Revisar y Desplegar

- [ ] Revisar todas las configuraciones
- [ ] Click en **"Save and deploy"**
- [ ] Esperar a que el build complete (3-5 minutos)
- [ ] Verificar que no haya errores en el build

---

### Paso 5: Verificación Post-Deploy

- [ ] Copiar la URL generada por AWS Amplify (ej: `https://main.d1a2b3c4d5e6f7.amplifyapp.com`)
- [ ] Abrir la URL en el navegador
- [ ] Verificar que la página principal carga correctamente
- [ ] Verificar estilos CSS (Tailwind)
- [ ] Abrir DevTools ? Network ? Intentar login
- [ ] Verificar que las llamadas API funcionan
- [ ] Probar navegación entre páginas
- [ ] Probar funcionalidad de login/registro
- [ ] Verificar que las citas se pueden crear/ver

---

### Paso 6: Configurar Dominio Personalizado (Opcional)

- [ ] En AWS Amplify Console ? **"Domain management"**
- [ ] Click **"Add domain"**
- [ ] Seguir wizard para agregar dominio (ej: `www.tucitaonline.com`)
- [ ] Configurar registros DNS según instrucciones de AWS
- [ ] Esperar propagación DNS (puede tomar 24-48 horas)
- [ ] Verificar que el dominio personalizado funciona

---

## ?? Workflow de Desarrollo Continuo

### Hacer Cambios y Desplegar

- [ ] Hacer cambios en código local
- [ ] Probar localmente (`npm run dev`)
- [ ] Hacer commit:
  ```bash
  git add .
  git commit -m "feat: descripción del cambio"
  ```
- [ ] Push a GitHub:
  ```bash
  git push origin main
  ```
- [ ] AWS Amplify desplegará automáticamente
- [ ] Monitorear en AWS Amplify Console ? **"Deployments"**
- [ ] Verificar que el build completó exitosamente
- [ ] Probar cambios en la URL de producción

---

## ?? Troubleshooting

### ? Build Falla en AWS Amplify

**Acción:**
- [ ] Revisar logs completos en AWS Amplify Console
- [ ] Ejecutar `npm run build` localmente para replicar error
- [ ] Corregir errores
- [ ] Hacer commit y push
- [ ] AWS Amplify intentará automáticamente

---

### ? Aplicación carga pero no conecta con backend

**Acción:**
- [ ] Verificar que `VITE_API_URL` está configurada en AWS Amplify
- [ ] Verificar que el backend está desplegado y accesible
- [ ] Hacer test manual:
  ```bash
  curl https://api.tucitaonline.com/health
  ```
- [ ] Verificar configuración CORS en backend .NET
- [ ] Re-desplegar en AWS Amplify (click **"Redeploy this version"**)

---

### ? Variables de entorno no se reflejan

**Acción:**
- [ ] Editar variables en AWS Amplify Console
- [ ] Click **"Save"**
- [ ] Click **"Redeploy this version"** (las variables solo se aplican en nuevos builds)

---

## ?? Documentación de Referencia

- ?? [README.md](./README.md) - Documentación completa del proyecto
- ?? [AWS_AMPLIFY_DEPLOY.md](./AWS_AMPLIFY_DEPLOY.md) - Guía rápida de deploy
- ?? [ENVIRONMENT_VARIABLES.md](./ENVIRONMENT_VARIABLES.md) - Variables de entorno
- ?? [amplify.yml](./amplify.yml) - Configuración de build

---

## ? Estado Final

- [x] ? Proyecto listo para deploy
- [x] ? Build local funciona
- [x] ? Archivos de configuración creados
- [x] ? Documentación completa
- [ ] ? Deploy en AWS Amplify (pendiente)
- [ ] ? Verificación en producción (pendiente)
- [ ] ? Dominio personalizado configurado (opcional)

---

## ?? Próximos Pasos

1. **Desplegar el backend** en AWS (EC2, Elastic Beanstalk, o ECS)
2. **Obtener URL del backend** de producción
3. **Seguir este checklist** para desplegar el frontend en AWS Amplify
4. **Configurar dominio personalizado** (opcional)
5. **Monitorear logs y métricas** en AWS Amplify Console

---

**Última actualización:** 2025  
**Repositorio:** https://github.com/rubencoto/TuCita  
**Branch:** ParteRuben
