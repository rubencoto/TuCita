# ?? Guía de Despliegue en AWS Amplify

## ? Pre-requisitos completados

- ? Código subido a GitHub (rama `master`)
- ? Frontend configurado con Vite
- ? Archivo `amplify.yml` configurado
- ? Variables de entorno configuradas

## ?? Pasos para desplegar en AWS Amplify

### 1. **Acceder a AWS Amplify Console**

1. Ir a: https://console.aws.amazon.com/amplify/
2. Click en **"Create new app"** o **"New app" ? "Host web app"**

### 2. **Conectar repositorio de GitHub**

1. Seleccionar **GitHub**
2. Autorizar AWS Amplify a acceder a tu cuenta de GitHub
3. Seleccionar:
   - **Repository**: `rubencoto/TuCita`
   - **Branch**: `master`
4. Click en **"Next"**

### 3. **Configurar Build Settings**

AWS Amplify detectará automáticamente el archivo `amplify.yml` en `TuCita/ClientApp/amplify.yml`

**IMPORTANTE**: Editar la configuración de build:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd ClientApp
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: ClientApp/dist
    files:
      - '**/*'
  cache:
    paths:
      - ClientApp/node_modules/**/*
```

### 4. **Configurar Variables de Entorno**

En **"Advanced settings"** ? **"Environment variables"**, agregar:

| Variable | Valor | Descripción |
|----------|-------|-------------|
| `VITE_API_URL` | `https://tu-backend-url.com/api` | URL de tu backend en producción |

**Ejemplo**:
- Si tu backend está en AWS Elastic Beanstalk: `https://tucita-api.elasticbeanstalk.com/api`
- Si usas AWS API Gateway: `https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/prod/api`
- Si usas AWS Lambda + ALB: `https://your-alb-url.amazonaws.com/api`

### 5. **Configurar dominio personalizado (Opcional)**

Después del despliegue:

1. Ir a **"Domain management"**
2. Click en **"Add domain"**
3. Seguir las instrucciones para configurar tu dominio

### 6. **Deploy**

1. Click en **"Next"** y luego **"Save and deploy"**
2. AWS Amplify comenzará a:
   - Clonar el repositorio
   - Instalar dependencias (`npm ci`)
   - Compilar el proyecto (`npm run build`)
   - Desplegar los archivos estáticos

### 7. **Verificar despliegue**

Una vez completado, AWS Amplify te dará una URL como:
```
https://master.xxxxxxxxxxxxx.amplifyapp.com
```

## ?? Configuración del Backend

### Opción 1: AWS Elastic Beanstalk (Recomendado para .NET)

1. Crear aplicación Elastic Beanstalk
2. Seleccionar plataforma: **.NET Core on Linux**
3. Subir el proyecto backend
4. Configurar variables de entorno en Elastic Beanstalk
5. Copiar la URL del backend y configurarla en Amplify

### Opción 2: AWS App Runner

1. Crear servicio en App Runner
2. Conectar con GitHub (carpeta `TuCita`)
3. Configurar variables de entorno
4. Copiar la URL y configurarla en Amplify

### Opción 3: AWS ECS/Fargate con Docker

1. Crear imagen Docker del backend
2. Subir a ECR
3. Configurar servicio ECS
4. Configurar ALB
5. Copiar URL del ALB y configurarla en Amplify

## ?? Variables de entorno necesarias en el Backend

**IMPORTANTE**: Estas son variables de EJEMPLO. Usar tus propios valores reales.

```bash
# Base de Datos
DB_SERVER=tu-servidor-rds.amazonaws.com
DB_PORT=1433
DB_NAME=tu_base_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_password_seguro

# JWT
JWT_KEY=Tu-Clave-Secreta-JWT-Minimo-32-Caracteres
JWT_ISSUER=TuCita
JWT_AUDIENCE=TuCitaUsers
JWT_EXPIRY_MINUTES=60

# SMTP (AWS SES)
# Obtener credenciales desde: AWS Console ? SES ? SMTP settings
SMTP_USERNAME=tu_smtp_username
SMTP_PASSWORD=tu_smtp_password
SMTP_SERVER=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
DEFAULT_SENDER=no-reply@tudominio.com

# Frontend URL
FRONTEND_URL=https://master.xxxxxxxxxxxxx.amplifyapp.com
```

## ?? Despliegue continuo

AWS Amplify está configurado para:
- ? Detectar cambios en la rama `master`
- ? Construir y desplegar automáticamente
- ? Crear preview para cada Pull Request (opcional)

## ?? IMPORTANTE: CORS

Asegúrate de configurar CORS en tu backend para permitir solicitudes desde:
```
https://master.xxxxxxxxxxxxx.amplifyapp.com
```

En `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://master.xxxxxxxxxxxxx.amplifyapp.com",
            "https://www.tucitaonline.com"  // Si tienes dominio personalizado
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});
```

## ?? Monitoreo

AWS Amplify proporciona:
- Logs de build en tiempo real
- Métricas de tráfico
- Estadísticas de errores
- Alertas de fallos en build

## ?? Solución de problemas

### Error: "Build failed"
- Verificar logs en AWS Amplify Console
- Verificar que `amplify.yml` esté en la raíz correcta
- Verificar que `npm run build` funcione localmente

### Error: "API calls failing"
- Verificar `VITE_API_URL` en variables de entorno
- Verificar CORS en el backend
- Verificar que el backend esté activo

### Error: "404 on page refresh"
- AWS Amplify maneja esto automáticamente para SPAs
- Si persiste, verificar la configuración de rewrites

## ?? Recursos

- [AWS Amplify Docs](https://docs.aws.amazon.com/amplify/)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html)
- [.NET on AWS](https://aws.amazon.com/developer/language/net/)
