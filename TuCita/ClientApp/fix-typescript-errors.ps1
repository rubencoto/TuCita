# Script para resolver errores de TypeScript en VS Code
# Ejecutar como: .\fix-typescript-errors.ps1

Write-Host "?? Resolviendo errores de TypeScript en VS Code..." -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-not (Test-Path "package.json")) {
    Write-Host "? Error: No se encontró package.json" -ForegroundColor Red
    Write-Host "   Asegúrate de ejecutar este script desde TuCita/ClientApp" -ForegroundColor Yellow
    exit 1
}

Write-Host "?? Paso 1: Reinstalando dependencias..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   Eliminando node_modules..."
    Remove-Item -Recurse -Force node_modules
}

if (Test-Path "package-lock.json") {
    Write-Host "   Eliminando package-lock.json..."
    Remove-Item -Force package-lock.json
}

Write-Host "   Instalando dependencias..."
npm install

Write-Host ""
Write-Host "? Dependencias reinstaladas correctamente" -ForegroundColor Green
Write-Host ""

Write-Host "?? Paso 2: Verificando compilación..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "? Compilación exitosa" -ForegroundColor Green
} else {
    Write-Host "??  Advertencia: Hubo problemas en la compilación" -ForegroundColor Yellow
    Write-Host $buildResult
}

Write-Host ""
Write-Host "?? Paso 3: Instrucciones finales" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para completar la corrección en VS Code, sigue estos pasos:" -ForegroundColor White
Write-Host ""
Write-Host "1. En VS Code, presiona Ctrl+Shift+P" -ForegroundColor White
Write-Host "2. Escribe: 'TypeScript: Select TypeScript Version'" -ForegroundColor White
Write-Host "3. Selecciona: 'Use Workspace Version (5.7.2)'" -ForegroundColor White
Write-Host ""
Write-Host "4. Luego presiona Ctrl+Shift+P nuevamente" -ForegroundColor White
Write-Host "5. Escribe: 'TypeScript: Restart TS Server'" -ForegroundColor White
Write-Host ""
Write-Host "6. Finalmente presiona Ctrl+Shift+P" -ForegroundColor White
Write-Host "7. Escribe: 'Developer: Reload Window'" -ForegroundColor White
Write-Host ""
Write-Host "? ¡Listo! Los errores deberían desaparecer." -ForegroundColor Green
Write-Host ""
Write-Host "?? Si siguen apareciendo errores, lee el archivo TYPESCRIPT_ERRORS.md" -ForegroundColor Yellow
