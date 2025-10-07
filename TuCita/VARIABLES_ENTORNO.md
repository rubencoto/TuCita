# ?? Gu�a de Variables de Entorno - TuCita

## ?? Resumen de Cambios Aplicados

Se ha configurado el sistema para cargar **todas las credenciales y configuraciones sensibles** desde un archivo `.env`, eliminando el hardcoding de valores cr�ticos en el c�digo.

---

## ? Archivos Modificados

### 1. **`Program.cs`**
- ? Agregado `using DotNetEnv;`
- ? Agregado `Env.Load();` al inicio
- ? Cadena de conexi�n a la base de datos construida desde variables de entorno
- ? Configuraci�n JWT lee desde `Environment.GetEnvironmentVariable()`

### 2. **`Services/AuthService.cs`**
- ? Eliminada dependencia de `IConfiguration`
- ? M�todo `GenerateJwtToken()` usa variables de entorno para JWT

### 3. **`Services/EmailService.cs`**
- ? Eliminada dependencia de `IConfiguration`
- ? Constructor lee credenciales SMTP desde variables de entorno

### 4. **`.gitignore`**
- ? Agregadas reglas para proteger archivos `.env*`

### 5. **`.env` (NUEVO)**
- ? Archivo creado con valores de ejemplo
- ?? **IMPORTANTE**: Actualiza con tus valores reales

---

## ?? Configuraci�n Requerida

### 1. Instalar Paquete NuGet (? Ya instalado)
```bash
dotnet add package DotNetEnv
```

### 2. Actualizar el archivo `.env`

**?? CR�TICO**: Reemplaza los valores de ejemplo con tus credenciales reales:

```env
# AWS SES - Credenciales reales
SMTP_USERNAME=AKIAX4YLG4CCZSXLRAFQ
SMTP_PASSWORD=TU_CONTRASE�A_SMTP_REAL_AQU�

# Base de Datos - Contrase�a real
DB_PASSWORD=TU_CONTRASE�A_DB_REAL_AQU�

# JWT - Clave secreta fuerte (m�nimo 32 caracteres)
JWT_KEY=Tu-Clave-Super-Secreta-Aqu�-Minimo-32-Caracteres
```

### 3. Verificar que `.env` est� en `.gitignore`

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

| Variable | Descripci�n | Ejemplo |
|----------|-------------|---------|
| `SMTP_USERNAME` | Usuario SMTP de AWS SES | `AKIAX4YLG4CCZSXLRAFQ` |
| `SMTP_PASSWORD` | Contrase�a SMTP de AWS SES | `BNJr...` |
| `SMTP_SERVER` | Servidor SMTP | `email-smtp.us-east-1.amazonaws.com` |
| `SMTP_PORT` | Puerto SMTP | `587` |
| `DEFAULT_SENDER` | Remitente por defecto | `no-reply@tucitaonline.org` |
| `DB_SERVER` | Servidor de base de datos | `db-mysql-tc-do-...` |
| `DB_PORT` | Puerto de MySQL | `25060` |
| `DB_NAME` | Nombre de la base de datos | `tco_db` |
| `DB_USER` | Usuario de la base de datos | `doadmin` |
| `DB_PASSWORD` | Contrase�a de la base de datos | `AVNS_...` |
| `JWT_KEY` | Clave secreta para JWT | (m�nimo 32 caracteres) |
| `JWT_ISSUER` | Emisor del token JWT | `TuCita` |
| `JWT_AUDIENCE` | Audiencia del token JWT | `TuCitaUsers` |
| `JWT_EXPIRY_MINUTES` | Minutos de expiraci�n | `60` |
| `ASPNETCORE_ENVIRONMENT` | Entorno de ejecuci�n | `Development` / `Production` |
| `ASPNETCORE_URLS` | URLs de escucha | `https://localhost:7063` |

---

## ?? C�mo Funciona

### Flujo de Carga

```mermaid
graph LR
    A[Aplicaci�n Inicia] --> B[Env.Load en Program.cs]
    B --> C[Lee archivo .env]
    C --> D[Establece variables de entorno]
    D --> E[Services usan Environment.GetEnvironmentVariable]
    E --> F[? Valores disponibles sin hardcoding]
```

### Ejemplo de Uso en el C�digo

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

## ?? Deploy en Producci�n

### Opci�n 1: Variables de Entorno del Sistema
En el servidor de producci�n, configura las variables directamente:

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

### Opci�n 2: Archivo `.env` en Producci�n
1. Copia `.env.template` a `.env` en el servidor
2. Actualiza con valores de producci�n
3. **Aseg�rate de que el archivo tenga permisos restrictivos:**
   ```bash
   chmod 600 .env
   ```

### Opci�n 3: Azure App Service / AWS
Configura las variables en el panel de configuraci�n:
- Azure: **Configuration ? Application Settings**
- AWS: **Environment Variables en Elastic Beanstalk**

---

## ??? Seguridad

### ? Buenas Pr�cticas Aplicadas
- ? Credenciales fuera del c�digo fuente
- ? `.env` en `.gitignore`
- ? Valores de ejemplo en `.env.template`
- ? Excepciones si faltan variables cr�ticas
- ? Sin hardcoding de secretos

### ?? Recordatorios Importantes
1. **NUNCA** subir el archivo `.env` a Git
2. **NUNCA** compartir credenciales en Slack/Email
3. **ROTAR** las claves peri�dicamente
4. **USAR** claves diferentes para dev/staging/production
5. **VERIFICAR** que `.env` tenga permisos restrictivos (600)

---

## ?? Testing

### Verificar que las variables se cargan correctamente

Agrega temporalmente en `Program.cs` (despu�s de `Env.Load()`):
```csharp
Console.WriteLine($"? JWT_KEY cargado: {Environment.GetEnvironmentVariable("JWT_KEY")?.Substring(0, 10)}...");
Console.WriteLine($"? DB_SERVER cargado: {Environment.GetEnvironmentVariable("DB_SERVER")}");
Console.WriteLine($"? SMTP_SERVER cargado: {Environment.GetEnvironmentVariable("SMTP_SERVER")}");
```

Ejecuta:
```bash
dotnet run
```

Deber�as ver:
```
? JWT_KEY cargado: Tu-Cita-O...
? DB_SERVER cargado: db-mysql-tc-do-user-24289380-0.k.db.ondigitalocean.com
? SMTP_SERVER cargado: email-smtp.us-east-1.amazonaws.com
```

---

## ?? Soporte

Si tienes problemas:
1. Verifica que `.env` est� en la ra�z del proyecto (mismo nivel que `TuCita.csproj`)
2. Verifica que no haya espacios extra en las variables
3. Verifica que el paquete `DotNetEnv` est� instalado
4. Revisa los logs de la aplicaci�n para ver excepciones espec�ficas

---

## ?? Checklist de Configuraci�n

- [ ] Paquete `DotNetEnv` instalado
- [ ] Archivo `.env` creado en la ra�z
- [ ] Variables actualizadas con valores reales
- [ ] `.env` en `.gitignore`
- [ ] `.env` NO aparece en `git status`
- [ ] Aplicaci�n compila sin errores
- [ ] Variables se cargan correctamente (verificado con console logs)
- [ ] Credenciales de producci�n configuradas en el servidor

---

**? �Configuraci�n Completa!** Ahora tu aplicaci�n carga todas las credenciales de forma segura desde variables de entorno.
