@echo off
REM ========================================
REM Script de Actualizacion Rapida
REM ========================================

echo.
echo ================================================
echo   TUCITA - ACTUALIZACION RAPIDA
echo ================================================
echo.

set /p COMMIT_MSG="Mensaje del commit: "
if "%COMMIT_MSG%"=="" set COMMIT_MSG=Actualizacion

echo.
echo [1/4] Agregando archivos...
git add .

echo.
echo [2/4] Creando commit...
git commit -m "%COMMIT_MSG%"

echo.
echo [3/4] Desplegando a Heroku...
echo      Esto puede tardar 5-10 minutos...
git push heroku master

echo.
echo [4/4] Verificando despliegue...
timeout /t 5 >nul
heroku logs --tail -a tucita-app

echo.
echo ================================================
echo   DESPLIEGUE COMPLETADO
echo ================================================
echo.
pause
