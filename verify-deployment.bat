@echo off
REM ========================================
REM Script de Verificacion Post-Despliegue
REM ========================================

echo.
echo ================================================
echo   VERIFICACION DE DESPLIEGUE
echo ================================================
echo.

set /p APP_NAME="Nombre de la app (default: tucita-app): "
if "%APP_NAME%"=="" set APP_NAME=tucita-app

echo.
echo [1/7] Verificando estado de la aplicacion...
heroku ps -a %APP_NAME%

echo.
echo [2/7] Verificando variables de entorno...
echo      Variables criticas:
heroku config:get DB_SERVER -a %APP_NAME% >nul 2>&1
if errorlevel 1 (
    echo      ERROR - DB_SERVER no configurada
) else (
    echo      OK - DB_SERVER configurada
)

heroku config:get JWT_KEY -a %APP_NAME% >nul 2>&1
if errorlevel 1 (
    echo      ERROR - JWT_KEY no configurada
) else (
    echo      OK - JWT_KEY configurada
)

echo.
echo [3/7] Verificando dominios...
heroku domains -a %APP_NAME%

echo.
echo [4/7] Verificando SSL...
heroku certs:auto -a %APP_NAME%

echo.
echo [5/7] Verificando ultimos logs...
echo      Ultimas 20 lineas:
heroku logs -n 20 -a %APP_NAME%

echo.
echo [6/7] Probando conectividad...
set URL=https://%APP_NAME%.herokuapp.com
echo      Probando: %URL%
curl -I -s %URL% | findstr "HTTP"
if errorlevel 1 (
    echo      ERROR - No se pudo conectar
) else (
    echo      OK - Aplicacion responde
)

echo.
echo [7/7] Resumen
echo ================================================
echo   URL Heroku: https://%APP_NAME%.herokuapp.com
echo   URL Produccion: https://www.tucitaonline.org
echo.
echo   Comandos utiles:
echo   - Ver logs: heroku logs --tail -a %APP_NAME%
echo   - Abrir app: heroku open -a %APP_NAME%
echo   - Reiniciar: heroku restart -a %APP_NAME%
echo.
echo ================================================
echo.

set /p OPEN_APP="Abrir aplicacion en el navegador? (S/N): "
if /i "%OPEN_APP%"=="S" (
    heroku open -a %APP_NAME%
)

echo.
pause
