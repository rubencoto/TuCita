# ==================================================
# TuCita - Scripts de Utilidad (PowerShell)
# ==================================================

Write-Host "TuCita - Docker Helper Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

function Show-Menu {
    Write-Host "Selecciona una opción:" -ForegroundColor Yellow
    Write-Host "1. Construir imágenes Docker" -ForegroundColor White
    Write-Host "2. Iniciar aplicación (Producción)" -ForegroundColor White
    Write-Host "3. Iniciar aplicación (Desarrollo)" -ForegroundColor White
    Write-Host "4. Detener aplicación" -ForegroundColor White
    Write-Host "5. Ver logs" -ForegroundColor White
    Write-Host "6. Ver estado de contenedores" -ForegroundColor White
    Write-Host "7. Aplicar migraciones" -ForegroundColor White
    Write-Host "8. Hacer backup de la BD" -ForegroundColor White
    Write-Host "9. Limpiar todo (¡CUIDADO!)" -ForegroundColor Red
    Write-Host "0. Salir" -ForegroundColor White
    Write-Host ""
}

function Build-Images {
    Write-Host "Construyendo imágenes Docker..." -ForegroundColor Green
    docker-compose build
}

function Start-Production {
    Write-Host "Iniciando aplicación en modo producción..." -ForegroundColor Green
    docker-compose up -d
    Write-Host ""
    Write-Host "? Aplicación iniciada" -ForegroundColor Green
    Write-Host "  - Web: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "  - SQL: localhost:1433" -ForegroundColor Cyan
}

function Start-Development {
    Write-Host "Iniciando aplicación en modo desarrollo..." -ForegroundColor Green
    docker-compose -f docker-compose.dev.yml up
}

function Stop-Application {
    Write-Host "Deteniendo aplicación..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "? Aplicación detenida" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "Mostrando logs (Ctrl+C para salir)..." -ForegroundColor Green
    docker-compose logs -f
}

function Show-Status {
    Write-Host "Estado de contenedores:" -ForegroundColor Green
    docker-compose ps
}

function Apply-Migrations {
    Write-Host "Aplicando migraciones de Entity Framework..." -ForegroundColor Green
    
    # Verificar si el contenedor está corriendo
    $container = docker ps --filter "name=tucita-app" --format "{{.Names}}"
    
    if ($container) {
        Write-Host "Ejecutando migraciones en el contenedor..." -ForegroundColor Cyan
        docker-compose exec tucita-app dotnet ef database update
    } else {
        Write-Host "El contenedor no está corriendo. Aplicando migraciones localmente..." -ForegroundColor Cyan
        Push-Location TuCita
        dotnet ef database update
        Pop-Location
    }
}

function Backup-Database {
    Write-Host "Creando backup de la base de datos..." -ForegroundColor Green
    
    # Crear directorio de backups si no existe
    if (-not (Test-Path ".\backups")) {
        New-Item -ItemType Directory -Path ".\backups" | Out-Null
    }
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupName = "TuCitaDb_$timestamp.bak"
    
    Write-Host "Generando backup: $backupName" -ForegroundColor Cyan
    
    docker-compose exec -T sqlserver /opt/mssql-tools/bin/sqlcmd `
        -S localhost -U sa -P "TuCita@2025!Secure" `
        -Q "BACKUP DATABASE TuCitaDb TO DISK = '/var/opt/mssql/backup/$backupName'"
    
    Write-Host "Copiando backup al host..." -ForegroundColor Cyan
    docker cp "tucita-sqlserver:/var/opt/mssql/backup/$backupName" ".\backups\$backupName"
    
    Write-Host "? Backup completado: .\backups\$backupName" -ForegroundColor Green
}

function Clean-All {
    Write-Host "¡ADVERTENCIA! Esto eliminará TODOS los contenedores y volúmenes." -ForegroundColor Red
    $confirmation = Read-Host "¿Estás seguro? (escribe 'SI' para confirmar)"
    
    if ($confirmation -eq "SI") {
        Write-Host "Eliminando contenedores y volúmenes..." -ForegroundColor Yellow
        docker-compose down -v
        Write-Host "? Limpieza completada" -ForegroundColor Green
    } else {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
    }
}

# Loop principal
do {
    Show-Menu
    $choice = Read-Host "Opción"
    Write-Host ""
    
    switch ($choice) {
        "1" { Build-Images }
        "2" { Start-Production }
        "3" { Start-Development }
        "4" { Stop-Application }
        "5" { Show-Logs }
        "6" { Show-Status }
        "7" { Apply-Migrations }
        "8" { Backup-Database }
        "9" { Clean-All }
        "0" { 
            Write-Host "¡Hasta luego!" -ForegroundColor Cyan
            exit 
        }
        default { Write-Host "Opción inválida" -ForegroundColor Red }
    }
    
    Write-Host ""
    Write-Host "Presiona Enter para continuar..." -ForegroundColor Gray
    $null = Read-Host
    Clear-Host
} while ($true)
