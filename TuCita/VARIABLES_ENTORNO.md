# ?? Guía de Variables de Entorno - TuCita

## ?? Resumen de Cambios Aplicados

Se ha configurado el sistema para cargar **todas las credenciales y configuraciones sensibles** desde un archivo `.env`, eliminando el hardcoding de valores críticos en el código.

---

## ? Archivos Modificados

### 1. **`Program.cs`**
- ? Agregado `using DotNetEnv;`
- ? Agregado `Env.Load();` al inicio
- ? Cadena de conexión a la base de datos construida desde variables de entorno
- ? Configuración JWT lee desde `Environment.GetEnvironmentVariable()`

### 2. **`Services/AuthService.cs`**
- ? Eliminada dependencia de `IConfiguration`
- ? Método `GenerateJwtToken()` usa variables de entorno para JWT

### 3. **`Services/EmailService.cs`**
- ? Eliminada dependencia de `IConfiguration`
- ? Constructor lee credenciales SMTP desde variables de entorno

### 4. **`.gitignore`**
- ? Agregadas reglas para proteger archivos `.env*`

### 5. **`.env` (NUEVO)**
- ? Archivo creado con valores de ejemplo
- ?? **IMPORTANTE**: Actualiza con tus valores reales

---

## ?? Configuración Requerida

### 1. Instalar Paquete NuGet (? Ya instalado)
```bash
dotnet add package DotNetEnv
```

### 2. Actualizar el archivo `.env`

**?? CRÍTICO**: Reemplaza los valores de ejemplo con tus credenciales reales:

```env
# AWS SES - Credenciales reales
SMTP_USERNAME=AKIAX4YLG4CCZSXLRAFQ
SMTP_PASSWORD=TU_CONTRASEÑA_SMTP_REAL_AQUÍ

# Base de Datos - Contraseña real
DB_PASSWORD=TU_CONTRASEÑA_DB_REAL_AQUÍ

# JWT - Clave secreta fuerte (mínimo 32 caracteres)
JWT_KEY=Tu-Clave-Super-Secreta-Aquí-Minimo-32-Caracteres
```

### 3. Verificar que `.env` esté en `.gitignore`

Ejecuta este comando para verificar:
```bash
git status
```

**El archivo `.env` NO debe aparecer en la lista.** Si aparece:
```bash
git rm --cached .env
```

---

## ?? Variables de Entorno Disponibles

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `SMTP_USERNAME` | Usuario SMTP de AWS SES | `AKIAX4YLG4CCZSXLRAFQ` |
| `SMTP_PASSWORD` | Contraseña SMTP de AWS SES | `BNJr...` |
| `SMTP_SERVER` | Servidor SMTP | `email-smtp.us-east-1.amazonaws.com` |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `DEFAULT_SENDER` | Remitente por defecto | `no-reply@tucitaonline.org` |
| `DB_SERVER` | Servidor de base de datos | `db-mysql-tc-do-...` |
| `DB_PORT` | Puerto de MySQL | `25060` |
| `DB_NAME` | Nombre de la base de datos | `tco_db` |
| `DB_USER` | Usuario de la base de datos | `doadmin` |
| `DB_PASSWORD` | Contraseña de la base de datos | `AVNS_...` |
| `JWT_KEY` | Clave secreta para JWT | (mínimo 32 caracteres) |
| `JWT_ISSUER` | Emisor del token JWT | `TuCita` |
| `JWT_AUDIENCE` | Audiencia del token JWT | `TuCitaUsers` |
| `JWT_EXPIRY_MINUTES` | Minutos de expiración | `60` |
| `ASPNETCORE_ENVIRONMENT` | Entorno de ejecución | `Development` / `Production` |
| `ASPNETCORE_URLS` | URLs de escucha | `https://localhost:7063` |

---

## ?? Cómo Funciona

### Flujo de Carga

```mermaid
graph LR
    A[Aplicación Inicia] --> B[Env.Load en Program.cs]
    B --> C[Lee archivo .env]
    C --> D[Establece variables de entorno]
    D --> E[Services usan Environment.GetEnvironmentVariable]
    E --> F[? Valores disponibles sin hardcoding]
```

### Ejemplo de Uso en el Código

**Antes (? Inseguro):**
```csharp
var key = "mi-clave-secreta-hardcoded"; // ? MAL
```

**Ahora (? Seguro):**
```csharp
var key = Environment.GetEnvironmentVariable("JWT_KEY") 
    ?? throw new InvalidOperationException("JWT_KEY no configurada");
```

---

## ?? Deploy en Producción

### Opción 1: Variables de Entorno del Sistema
En el servidor de producción, configura las variables directamente:

**Windows:**
```powershell
setx JWT_KEY "tu-clave-produccion"
setx DB_PASSWORD "tu-password-produccion"
```

**Linux/Docker:**
```bash
export JWT_KEY="tu-clave-produccion"
export DB_PASSWORD="tu-password-produccion"
```

### Opción 2: Archivo `.env` en Producción
1. Copia `.env.template` a `.env` en el servidor
2. Actualiza con valores de producción
3. **Asegúrate de que el archivo tenga permisos restrictivos:**
   ```bash
   chmod 600 .env
   ```

### Opción 3: Azure App Service / AWS
Configura las variables en el panel de configuración:
- Azure: **Configuration ? Application Settings**
- AWS: **Environment Variables en Elastic Beanstalk**

---

## ??? Seguridad

### ? Buenas Prácticas Aplicadas
- ? Credenciales fuera del código fuente
- ? `.env` en `.gitignore`
- ? Valores de ejemplo en `.env.template`
- ? Excepciones si faltan variables críticas
- ? Sin hardcoding de secretos

### ?? Recordatorios Importantes
1. **NUNCA** subir el archivo `.env` a Git
2. **NUNCA** compartir credenciales en Slack/Email
3. **ROTAR** las claves periódicamente
4. **USAR** claves diferentes para dev/staging/production
5. **VERIFICAR** que `.env` tenga permisos restrictivos (600)

---

## ?? Testing

### Verificar que las variables se cargan correctamente

Agrega temporalmente en `Program.cs` (después de `Env.Load()`):
```csharp
Console.WriteLine($"? JWT_KEY cargado: {Environment.GetEnvironmentVariable("JWT_KEY")?.Substring(0, 10)}...");
Console.WriteLine($"? DB_SERVER cargado: {Environment.GetEnvironmentVariable("DB_SERVER")}");
Console.WriteLine($"? SMTP_SERVER cargado: {Environment.GetEnvironmentVariable("SMTP_SERVER")}");
```

Ejecuta:
```bash
dotnet run
```

Deberías ver:
```
? JWT_KEY cargado: Tu-Cita-O...
? DB_SERVER cargado: db-mysql-tc-do-user-24289380-0.k.db.ondigitalocean.com
? SMTP_SERVER cargado: email-smtp.us-east-1.amazonaws.com
```

---

## ?? Soporte

Si tienes problemas:
1. Verifica que `.env` esté en la raíz del proyecto (mismo nivel que `TuCita.csproj`)
2. Verifica que no haya espacios extra en las variables
3. Verifica que el paquete `DotNetEnv` esté instalado
4. Revisa los logs de la aplicación para ver excepciones específicas

---

## ?? Checklist de Configuración

- [ ] Paquete `DotNetEnv` instalado
- [ ] Archivo `.env` creado en la raíz
- [ ] Variables actualizadas con valores reales
- [ ] `.env` en `.gitignore`
- [ ] `.env` NO aparece en `git status`
- [ ] Aplicación compila sin errores
- [ ] Variables se cargan correctamente (verificado con console logs)
- [ ] Credenciales de producción configuradas en el servidor

---

**? ¡Configuración Completa!** Ahora tu aplicación carga todas las credenciales de forma segura desde variables de entorno.
