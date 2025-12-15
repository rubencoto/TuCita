@echo off
REM Script PowerShell para configurar variables SMTP en Heroku
REM Uso: setup-smtp-heroku.bat tu-app-name

if "%1"=="" (
    echo ? Error: Debes especificar el nombre de tu app de Heroku
    echo Uso: setup-smtp-heroku.bat tu-app-name
    exit /b 1
)

set APP_NAME=%1

echo ?? Configurando variables SMTP para la app: %APP_NAME%
echo.

echo ?? Configurando SMTP_SERVER...
heroku config:set SMTP_SERVER=smtp.gmail.com --app %APP_NAME%

echo ?? Configurando SMTP_PORT...
heroku config:set SMTP_PORT=587 --app %APP_NAME%

echo ?? Configurando SMTP_USERNAME...
heroku config:set SMTP_USERNAME=serviciocontactoventaonline@gmail.com --app %APP_NAME%

echo ?? Configurando SMTP_PASSWORD...
heroku config:set SMTP_PASSWORD="hbon bfqz wroe bmzm" --app %APP_NAME%

echo ?? Configurando DEFAULT_SENDER...
heroku config:set DEFAULT_SENDER=serviciocontactoventaonline@gmail.com --app %APP_NAME%

echo.
echo ? Variables SMTP configuradas correctamente!
echo.

echo ?? Verificando configuración...
heroku config --app %APP_NAME% | findstr /i "SMTP SENDER"

echo.
echo ?? Reiniciando aplicación...
heroku restart --app %APP_NAME%

echo.
echo ? ¡Configuración completada!
echo.
echo ?? Prueba el servicio de emails:
echo    1. Ve a tu app y prueba recuperación de contraseña
echo    2. Crea una cita y verifica que llegue el email
echo    3. Revisa los logs: heroku logs --tail --app %APP_NAME%

pause
