@echo off
REM ========================================
REM Script de Despliegue Automático a Heroku
REM TuCita - www.tucitaonline.org
REM ========================================

echo.
echo ================================================
echo   TUCITA - DESPLIEGUE A HEROKU
echo ================================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "TuCita\TuCita.csproj" (
    echo ERROR: Este script debe ejecutarse desde la raiz del proyecto
    echo Directorio actual: %CD%
    pause
    exit /b 1
)

echo [1/8] Verificando Heroku CLI...
heroku --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Heroku CLI no esta instalado
    echo Descarga desde: https://devcenter.heroku.com/articles/heroku-cli
    pause
    exit /b 1
)
echo      OK - Heroku CLI instalado

echo.
echo [2/8] Iniciando sesion en Heroku...
heroku login
if errorlevel 1 (
    echo ERROR: No se pudo iniciar sesion
    pause
    exit /b 1
)
echo      OK - Sesion iniciada

echo.
echo [3/8] Configurando aplicacion...
set /p APP_NAME="Nombre de la app en Heroku (default: tucita-app): "
if "%APP_NAME%"=="" set APP_NAME=tucita-app

REM Verificar si la app existe
heroku apps:info -a %APP_NAME% >nul 2>&1
if errorlevel 1 (
    echo      Creando nueva aplicacion: %APP_NAME%
    heroku create %APP_NAME% --region us
    if errorlevel 1 (
        echo ERROR: No se pudo crear la aplicacion
        pause
        exit /b 1
    )
) else (
    echo      OK - Aplicacion %APP_NAME% ya existe
)

echo.
echo [4/8] Configurando stack de Docker...
heroku stack:set container -a %APP_NAME%
echo      OK - Stack configurado

echo.
echo [5/8] Configurando variables de entorno...
echo      IMPORTANTE: Ingresa las credenciales (se ocultaran en produccion)

set /p DB_SERVER="DB_SERVER (default: tcodb.cleoiq2ws06y.us-east-2.rds.amazonaws.com): "
if "%DB_SERVER%"=="" set DB_SERVER=tcodb.cleoiq2ws06y.us-east-2.rds.amazonaws.com
heroku config:set DB_SERVER=%DB_SERVER% -a %APP_NAME%

set /p DB_NAME="DB_NAME (default: tco_db): "
if "%DB_NAME%"=="" set DB_NAME=tco_db
heroku config:set DB_NAME=%DB_NAME% -a %APP_NAME%

set /p DB_USER="DB_USER (default: tcoadmin): "
if "%DB_USER%"=="" set DB_USER=tcoadmin
heroku config:set DB_USER=%DB_USER% -a %APP_NAME%

set /p DB_PASSWORD="DB_PASSWORD: "
heroku config:set DB_PASSWORD=%DB_PASSWORD% -a %APP_NAME%

echo.
echo      Configurando JWT...
set /p JWT_KEY="JWT_KEY (minimo 32 caracteres): "
heroku config:set JWT_KEY=%JWT_KEY% -a %APP_NAME%
heroku config:set JWT_ISSUER=TuCita -a %APP_NAME%
heroku config:set JWT_AUDIENCE=TuCitaUsers -a %APP_NAME%

echo.
echo      Configurando AWS S3 (opcional - presiona Enter para omitir)...
set /p AWS_KEY="AWS_ACCESS_KEY_ID: "
if not "%AWS_KEY%"=="" (
    heroku config:set AWS_ACCESS_KEY_ID=%AWS_KEY% -a %APP_NAME%
    set /p AWS_SECRET="AWS_SECRET_ACCESS_KEY: "
    heroku config:set AWS_SECRET_ACCESS_KEY=%AWS_SECRET% -a %APP_NAME%
    set /p AWS_REGION="AWS_REGION (default: us-east-1): "
    if "%AWS_REGION%"=="" set AWS_REGION=us-east-1
    heroku config:set AWS_REGION=%AWS_REGION% -a %APP_NAME%
)

heroku config:set ASPNETCORE_ENVIRONMENT=Production -a %APP_NAME%
heroku config:set DB_PORT=1433 -a %APP_NAME%

echo      OK - Variables configuradas

echo.
echo [6/8] Agregando dominio personalizado...
heroku domains:add www.tucitaonline.org -a %APP_NAME%
heroku domains:add tucitaonline.org -a %APP_NAME%
echo      OK - Dominios agregados

echo.
echo [7/8] Configurando Git remote...
git remote remove heroku >nul 2>&1
heroku git:remote -a %APP_NAME%
echo      OK - Remote configurado

echo.
echo [8/8] LISTO PARA DESPLEGAR
echo.
echo ================================================
echo   CONFIGURACION COMPLETADA
echo ================================================
echo.
echo Aplicacion: %APP_NAME%
echo URL temporal: https://%APP_NAME%.herokuapp.com
echo URL final: https://www.tucitaonline.org
echo.
echo PROXIMOS PASOS:
echo 1. Configura DNS (ver DOMAIN-SETUP.md)
echo 2. Ejecuta: git add .
echo 3. Ejecuta: git commit -m "Preparar para produccion"
echo 4. Ejecuta: git push heroku master
echo.
echo Ver logs: heroku logs --tail -a %APP_NAME%
echo Abrir app: heroku open -a %APP_NAME%
echo.
pause
