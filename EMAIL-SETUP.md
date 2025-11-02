# ?? Configuración de Email con Gmail para TuCita

Esta guía te ayudará a configurar el servicio de email de TuCita usando Gmail SMTP.

## ?? Paso 1: Crear App Password en Gmail

Google requiere "App Passwords" para aplicaciones externas. Sigue estos pasos:

### 1. Habilitar 2FA (Verificación en 2 Pasos)

Primero, debes tener activada la verificación en 2 pasos en tu cuenta de Gmail.

1. Ve a https://myaccount.google.com/security
2. En "Cómo inicias sesión en Google", selecciona **Verificación en 2 pasos**
3. Si no está activada, haz clic en **Empezar** y sigue las instrucciones

### 2. Crear App Password

1. Ve a https://myaccount.google.com/apppasswords
   - O busca "App Passwords" en la configuración de tu cuenta de Google

2. Si te pide iniciar sesión nuevamente, hazlo

3. En "Seleccionar app", elige **Correo**

4. En "Seleccionar dispositivo", elige **Otro (nombre personalizado)**
   - Escribe: `TuCita App`

5. Haz clic en **Generar**

6. Google te mostrará una contraseña de 16 caracteres como esta:
   ```
   abcd efgh ijkl mnop
   ```

7. **¡IMPORTANTE!** Copia esta contraseña inmediatamente. No podrás verla de nuevo.

## ?? Paso 2: Configurar Variables de Entorno

### Opción A: Archivo `.env` (Recomendado)

Edita el archivo `.env` en la raíz del proyecto:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USERNAME=tu-email@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=noreply@tucita.com
EMAIL_FROM_NAME=TuCita Sistema de Citas
```

**Notas**:
- `EMAIL_USERNAME`: Tu dirección de Gmail completa
- `EMAIL_PASSWORD`: La App Password de 16 caracteres (con o sin espacios)
- `EMAIL_FROM`: Puede ser diferente a tu Gmail
- `EMAIL_FROM_NAME`: Nombre que verán los destinatarios

### Opción B: Variables de Entorno del Sistema

**Windows (PowerShell)**:
```powershell
$env:EMAIL_HOST="smtp.gmail.com"
$env:EMAIL_PORT="587"
$env:EMAIL_USERNAME="tu-email@gmail.com"
$env:EMAIL_PASSWORD="abcd efgh ijkl mnop"
```

**Linux/Mac (Bash)**:
```bash
export EMAIL_HOST="smtp.gmail.com"
export EMAIL_PORT="587"
export EMAIL_USERNAME="tu-email@gmail.com"
export EMAIL_PASSWORD="abcd efgh ijkl mnop"
```

### Opción C: Docker Compose

Si usas Docker, las variables ya están configuradas en `docker-compose.yml`. Solo actualiza el archivo `.env`.

## ?? Paso 3: Probar la Configuración

### 1. Verificar el Endpoint de Test

La aplicación tiene un endpoint para probar el email:

```bash
# Si la app está corriendo localmente
curl -X POST http://localhost:5000/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"destinatario":"tu-email-prueba@gmail.com","asunto":"Test TuCita","cuerpo":"Este es un email de prueba"}'
```

### 2. Verificar los Logs

Revisa los logs de la aplicación para ver si hay errores:

```bash
# Con Docker
docker-compose logs -f tucita-app

# Sin Docker (en Visual Studio)
# Revisa la ventana de Output
```

### 3. Probar desde la Aplicación

1. Registra un nuevo usuario
2. Solicita recuperación de contraseña
3. Crea una nueva cita
4. Verifica que lleguen los emails

## ?? Solución de Problemas

### Error: "Authentication failed"

**Causa**: App Password incorrecta o no habilitada

**Solución**:
1. Verifica que hayas copiado correctamente la App Password
2. Asegúrate de que la verificación en 2 pasos esté activada
3. Genera una nueva App Password si es necesario

### Error: "SMTP connection timeout"

**Causa**: Puerto bloqueado o firewall

**Solución**:
1. Verifica que el puerto 587 no esté bloqueado
2. Si estás en una red corporativa, puede que SMTP esté bloqueado
3. Intenta usar el puerto 465 con SSL:
   ```env
   EMAIL_PORT=465
   # Requiere cambios en EmailService para usar SSL
   ```

### Error: "Gmail blocked sign-in attempt"

**Causa**: Google detectó un inicio de sesión sospechoso

**Solución**:
1. Revisa tu email de Gmail para un mensaje de seguridad
2. Permite el acceso si es legítimo
3. Usa App Password en lugar de tu contraseña regular

### Emails van a Spam

**Solución**:
1. Configura SPF, DKIM y DMARC en tu dominio (para producción)
2. Usa un servicio profesional como SendGrid, Mailgun, o AWS SES
3. Marca los emails como "No es spam" en las pruebas

## ?? Alternativas para Producción

Para producción, considera usar servicios profesionales:

### 1. SendGrid (Azure)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=<tu-api-key>
```

### 2. Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USERNAME=<tu-usuario>@<tu-dominio>
EMAIL_PASSWORD=<tu-password>
```

### 3. AWS SES
```env
EMAIL_HOST=email-smtp.<region>.amazonaws.com
EMAIL_PORT=587
EMAIL_USERNAME=<tu-smtp-username>
EMAIL_PASSWORD=<tu-smtp-password>
```

## ?? Seguridad

### ?? NUNCA:
- Subas tu App Password a Git
- Compartas tu App Password públicamente
- Uses tu contraseña regular de Gmail (solo App Password)
- Dejes credenciales hardcodeadas en el código

### ? SIEMPRE:
- Usa variables de entorno o archivos `.env`
- Mantén `.env` en `.gitignore`
- Usa diferentes cuentas para desarrollo y producción
- Revoca App Passwords cuando no las uses

## ?? Tipos de Emails que Envía TuCita

La aplicación envía estos tipos de emails:

1. **Registro de Usuario**
   - Confirmación de cuenta
   - Código de seguridad

2. **Recuperación de Contraseña**
   - Link para restablecer contraseña

3. **Gestión de Citas**
   - Confirmación de cita creada
   - Recordatorio 24 horas antes
   - Recordatorio 4 horas antes
   - Notificación de cancelación
   - Notificación de reprogramación

4. **Historial Médico**
   - Resultados disponibles
   - Documentos subidos

## ?? Referencias

- [Gmail SMTP Settings](https://support.google.com/mail/answer/7126229)
- [Google App Passwords](https://support.google.com/accounts/answer/185833)
- [ASP.NET Core Email](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/mail)

## ?? Soporte

Si sigues teniendo problemas:

1. Revisa los logs de la aplicación
2. Verifica que la configuración sea correcta
3. Prueba con otra cuenta de Gmail
4. Consulta la documentación de Gmail
5. Abre un issue en el repositorio

---

**¡Tu servicio de email está listo!** ??
