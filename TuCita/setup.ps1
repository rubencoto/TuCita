#!/usr/bin/env pwsh

Write-Host "Iniciando TuCita - Sistema de Citas Médicas" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Verificar que Node.js esté instalado
try {
    $nodeVersion = node --version
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: Node.js no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

# Verificar que .NET esté instalado
try {
    $dotnetVersion = dotnet --version
    Write-Host ".NET version: $dotnetVersion" -ForegroundColor Cyan
} catch {
    Write-Host "Error: .NET no está instalado o no está en el PATH" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configurando el proyecto..." -ForegroundColor Yellow

# Cambiar al directorio ClientApp
Set-Location "ClientApp"

# Instalar dependencias de Node.js si node_modules no existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Instalando dependencias de npm..." -ForegroundColor Yellow
    npm install
}

# Cambiar de vuelta al directorio raíz
Set-Location ".."

Write-Host ""
Write-Host "¡Configuración completada!" -ForegroundColor Green
Write-Host ""
Write-Host "Para ejecutar el proyecto:" -ForegroundColor Cyan
Write-Host "  1. Frontend (React): dotnet run" -ForegroundColor White
Write-Host "  2. O ejecutar manualmente:" -ForegroundColor White
Write-Host "     - Backend: dotnet run" -ForegroundColor White
Write-Host "     - Frontend: cd ClientApp && npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "  - Aplicación: https://localhost:7001" -ForegroundColor White
Write-Host "  - API: https://localhost:7001/api" -ForegroundColor White
Write-Host "  - React Dev Server: http://localhost:3000" -ForegroundColor White