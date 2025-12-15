# ?? Configuración SMTP de Gmail en Heroku

## ? El código YA está listo

El servicio `EmailService.cs` ya está configurado para leer las credenciales desde variables de entorno. **NO necesitas cambiar código**, solo configurar las variables en Heroku.

## ?? Variables de Entorno para Heroku

Configura las siguientes variables en tu aplicación de Heroku:

### Variables SMTP Requeridas:

```bash
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=serviciocontactoventaonline@gmail.com
SMTP_PASSWORD=hbon bfqz wroe bmzm
DEFAULT_SENDER=serviciocontactoventaonline@gmail.com
```

### Variable Adicional (Frontend URL):

```bash
FRONTEND_URL=https://tu-app.herokuapp.com
```

## ?? Cómo Configurar en Heroku

### Opción 1: Desde el Dashboard Web

1. Ve a tu aplicación en Heroku Dashboard
2. Click en **"Settings"**
3. Scroll hasta **"Config Vars"**
4. Click en **"Reveal Config Vars"**
5. Agrega cada variable:
   - KEY: `SMTP_SERVER` ? VALUE: `smtp.gmail.com`
   - KEY: `SMTP_PORT` ? VALUE: `587`
   - KEY: `SMTP_USERNAME` ? VALUE: `serviciocontactoventaonline@gmail.com`
   - KEY: `SMTP_PASSWORD` ? VALUE: `hbon bfqz wroe bmzm`
   - KEY: `DEFAULT_SENDER` ? VALUE: `serviciocontactoventaonline@gmail.com`
   - KEY: `FRONTEND_URL` ? VALUE: `https://tu-app.herokuapp.com`

### Opción 2: Desde la Terminal (Heroku CLI)

```bash
# Configurar variables SMTP
heroku config:set SMTP_SERVER=smtp.gmail.com --app tu-app-name
heroku config:set SMTP_PORT=587 --app tu-app-name
heroku config:set SMTP_USERNAME=serviciocontactoventaonline@gmail.com --app tu-app-name
heroku config:set SMTP_PASSWORD="hbon bfqz wroe bmzm" --app tu-app-name
heroku config:set DEFAULT_SENDER=serviciocontactoventaonline@gmail.com --app tu-app-name
heroku config:set FRONTEND_URL=https://tu-app.herokuapp.com --app tu-app-name
```

### Verificar Configuración:

```bash
heroku config --app tu-app-name
```

## ?? Seguridad de la Contraseña de Gmail

### ?? IMPORTANTE: Contraseña de Aplicación

La contraseña que estás usando (`hbon bfqz wroe bmzm`) parece ser una **App Password** de Gmail, lo cual es correcto y más seguro que usar la contraseña real de la cuenta.

### Características de la App Password:

? **Ventajas:**
- No expone la contraseña real de Gmail
- Puede ser revocada en cualquier momento
- Funciona con autenticación de 2 factores
- Es específica para esta aplicación

### Si necesitas generar una nueva App Password:

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad ? Verificación en 2 pasos (debe estar activada)
3. Contraseñas de aplicación
4. Selecciona "Otra (nombre personalizado)"
5. Nombra: "TuCitaOnline Heroku"
6. Copia la contraseña de 16 caracteres

## ?? Formato del Remitente

El código configura automáticamente:
- **Display Name:** "TuCitaOnline"
- **Email:** `serviciocontactoventaonline@gmail.com`

Los emails saldrán como:
```
From: TuCitaOnline <serviciocontactoventaonline@gmail.com>
```

## ?? Probar el Servicio SMTP

Una vez configuradas las variables, prueba el envío de emails:

### 1. Recuperación de Contraseña
- Ve a la página de login
- Click en "¿Olvidaste tu contraseña?"
- Ingresa un email
- Verifica que llegue el correo

### 2. Confirmación de Citas
- Crea una nueva cita
- Verifica que llegue el email de confirmación

### 3. Recordatorios
- Los recordatorios se envían automáticamente por un servicio background
- Verifica los logs de Heroku para ver si se están enviando:

```bash
heroku logs --tail --app tu-app-name | grep "Email"
```

## ?? Troubleshooting SMTP

### Error: "Authentication failed"
```
Causa: Credenciales incorrectas
Solución: Verifica que la App Password esté correctamente configurada
```

### Error: "Timeout"
```
Causa: Puerto bloqueado o firewall
Solución: Heroku debe permitir conexiones SMTP por puerto 587
```

### Error: "Less secure app access"
```
Causa: Gmail bloquea apps no seguras
Solución: Usa App Password en lugar de la contraseña normal
```

## ?? Verificar Variables en Heroku

```bash
# Ver todas las variables configuradas
heroku config --app tu-app-name

# Verificar específicamente las SMTP
heroku config:get SMTP_SERVER --app tu-app-name
heroku config:get SMTP_USERNAME --app tu-app-name
```

## ?? Configuración Actual del Código

El `EmailService.cs` está configurado con:

```csharp
// Lee automáticamente de variables de entorno
var smtpServer = Environment.GetEnvironmentVariable("SMTP_SERVER") ?? "smtp.gmail.com";
var smtpPort = int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587");
var smtpUsername = Environment.GetEnvironmentVariable("SMTP_USERNAME") ?? "";
var smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD") ?? "";
var remitenteDefault = Environment.GetEnvironmentVariable("DEFAULT_SENDER") ?? "no-reply@tucitaonline.org";

// Configuración SMTP
_smtpClient = new SmtpClient(smtpServer, smtpPort)
{
    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
    EnableSsl = true,  // ? SSL habilitado para Gmail
    DeliveryMethod = SmtpDeliveryMethod.Network,
    Timeout = 30000    // 30 segundos
};
```

## ?? Checklist de Configuración

- [ ] Variables SMTP configuradas en Heroku
- [ ] App Password de Gmail generada
- [ ] FRONTEND_URL configurada correctamente
- [ ] Verificar que lleguen emails de prueba
- [ ] Revisar logs de Heroku para confirmar envíos
- [ ] Probar recuperación de contraseña
- [ ] Probar confirmación de citas
- [ ] Verificar que no haya errores SMTP en logs

## ?? Resultado Esperado

Una vez configurado correctamente, deberías ver en los logs de Heroku:

```
EmailService inicializado con servidor SMTP: smtp.gmail.com:587
Preparando envío de correo a: usuario@example.com, Asunto: Nueva Cita Médica Creada
Correo enviado exitosamente a: usuario@example.com
```

## ?? Deploy y Restart

Después de configurar las variables, reinicia la aplicación:

```bash
heroku restart --app tu-app-name
```

Las variables de entorno se aplicarán inmediatamente sin necesidad de hacer un nuevo deploy del código.

---

**Nota:** El código ya está completamente listo. Solo necesitas configurar las variables de entorno en Heroku y el servicio de emails funcionará automáticamente. ???
