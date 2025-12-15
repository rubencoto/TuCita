# ? Configuración Rápida SMTP - Heroku

## ?? Resumen Ejecutivo

**¿Necesitas cambiar código?** ? NO
**¿Solo configurar variables en Heroku?** ? SÍ

---

## ?? Opción 1: Script Automático (Más Rápido)

### Windows (PowerShell):
```powershell
.\setup-smtp-heroku.bat tu-app-name
```

### Linux/Mac (Bash):
```bash
chmod +x setup-smtp-heroku.sh
./setup-smtp-heroku.sh tu-app-name
```

---

## ??? Opción 2: Dashboard Web de Heroku

1. Ve a: https://dashboard.heroku.com/apps/tu-app-name/settings
2. Scroll a **"Config Vars"**
3. Click **"Reveal Config Vars"**
4. Agrega estas 5 variables:

| KEY | VALUE |
|-----|-------|
| `SMTP_SERVER` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USERNAME` | `serviciocontactoventaonline@gmail.com` |
| `SMTP_PASSWORD` | `hbon bfqz wroe bmzm` |
| `DEFAULT_SENDER` | `serviciocontactoventaonline@gmail.com` |

5. Reinicia la app: Click en **"More" ? "Restart all dynos"**

---

## ?? Opción 3: Heroku CLI Manual

Copia y pega estos comandos (reemplaza `tu-app-name`):

```bash
# Configurar todas las variables SMTP
heroku config:set SMTP_SERVER=smtp.gmail.com --app tu-app-name
heroku config:set SMTP_PORT=587 --app tu-app-name
heroku config:set SMTP_USERNAME=serviciocontactoventaonline@gmail.com --app tu-app-name
heroku config:set SMTP_PASSWORD="hbon bfqz wroe bmzm" --app tu-app-name
heroku config:set DEFAULT_SENDER=serviciocontactoventaonline@gmail.com --app tu-app-name

# Verificar que se configuraron correctamente
heroku config --app tu-app-name | grep -E "SMTP|SENDER"

# Reiniciar la app para aplicar cambios
heroku restart --app tu-app-name
```

---

## ? Verificar que Funciona

### 1?? Ver logs en tiempo real:
```bash
heroku logs --tail --app tu-app-name | grep -i "email"
```

Deberías ver:
```
EmailService inicializado con servidor SMTP: smtp.gmail.com:587
```

### 2?? Probar recuperación de contraseña:
1. Ve a tu app ? Login ? "¿Olvidaste tu contraseña?"
2. Ingresa tu email
3. Verifica que llegue el correo de recuperación

### 3?? Probar creación de cita:
1. Crea una nueva cita
2. Verifica que llegue el email de confirmación

---

## ?? One-Liner (Todo en Uno)

```bash
heroku config:set SMTP_SERVER=smtp.gmail.com SMTP_PORT=587 SMTP_USERNAME=serviciocontactoventaonline@gmail.com SMTP_PASSWORD="hbon bfqz wroe bmzm" DEFAULT_SENDER=serviciocontactoventaonline@gmail.com --app tu-app-name && heroku restart --app tu-app-name
```

---

## ??? Troubleshooting Rápido

### ? No llegan emails

**1. Verificar variables:**
```bash
heroku config --app tu-app-name
```

**2. Ver logs de errores:**
```bash
heroku logs --tail --app tu-app-name | grep -i "error\|smtp"
```

**3. Verificar que el password sea App Password:**
- NO uses la contraseña normal de Gmail
- Debe ser una App Password de 16 caracteres
- Formato: `xxxx xxxx xxxx xxxx`

### ? Error "Authentication failed"

```bash
# Regenera la App Password en Gmail:
# 1. https://myaccount.google.com/security
# 2. Verificación en 2 pasos ? Contraseñas de aplicación
# 3. Genera nueva contraseña para "TuCitaOnline"
# 4. Actualiza en Heroku:
heroku config:set SMTP_PASSWORD="tu-nueva-password" --app tu-app-name
```

### ? Error "Timeout"

```bash
# Verifica que el puerto sea 587 (no 465):
heroku config:set SMTP_PORT=587 --app tu-app-name
heroku restart --app tu-app-name
```

---

## ?? Credenciales Actuales

```
Servidor: smtp.gmail.com
Puerto: 587
Seguridad: STARTTLS (SSL habilitado)
Usuario: serviciocontactoventaonline@gmail.com
Password: hbon bfqz wroe bmzm (App Password)
```

---

## ?? Notas Importantes

1. **No cambies código** - El `EmailService.cs` ya lee las variables de entorno
2. **App Password** - La contraseña es específica de aplicación, más segura
3. **Puerto 587** - Usa STARTTLS, más compatible que 465 (SSL directo)
4. **Reinicio automático** - Heroku reinicia automáticamente al cambiar variables
5. **Sin deploy** - No necesitas hacer push ni build, solo configurar variables

---

## ?? ¡Listo!

Después de configurar las variables:
1. ? Los emails se enviarán automáticamente
2. ? Confirmaciones de citas
3. ? Recuperación de contraseñas
4. ? Recordatorios automáticos (24h y 4h antes)

---

## ?? Documentación Completa

Ver `HEROKU_SMTP_CONFIG.md` para información detallada.
