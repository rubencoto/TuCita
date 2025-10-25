#!/usr/bin/env pwsh
# Script de Prueba de Conexión a Azure SQL Database
# Uso: .\test-database.ps1

param(
    [Parameter()]
    [string]$BaseUrl = "http://localhost:5000",
    
    [Parameter()]
    [switch]$Full,
    
    [Parameter()]
    [switch]$Connection,
    
    [Parameter()]
    [switch]$Tables,
    
    [Parameter()]
    [switch]$Data,
    
    [Parameter()]
    [switch]$Health,
    
    [Parameter()]
    [switch]$Status,
    
    [Parameter()]
    [switch]$Watch,
    
    [Parameter()]
    [int]$WatchInterval = 5
)

function Write-ColorOutput {
    param(
        [Parameter(Mandatory=$true)]
        [string]$Message,
        [Parameter()]
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Write-Header {
    param([string]$Title)
    Write-Host ""
    Write-ColorOutput "???????????????????????????????????????????????????????????" "Cyan"
    Write-ColorOutput "  $Title" "Cyan"
    Write-ColorOutput "???????????????????????????????????????????????????????????" "Cyan"
    Write-Host ""
}

function Test-Connection {
    Write-Header "?? TEST DE CONEXIÓN"
    
    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/api/DatabaseTest/connection" -Method Get -ErrorAction Stop
        
        if ($result.success) {
            Write-ColorOutput "? CONEXIÓN EXITOSA" "Green"
            Write-Host ""
            Write-Host "  ?? Base de datos: " -NoNewline
            Write-ColorOutput $result.databaseName "Yellow"
            Write-Host "  ???  Servidor: " -NoNewline
            Write-ColorOutput $result.dataSource "Yellow"
            Write-Host "  ?? Versión: " -NoNewline
            Write-ColorOutput $result.serverVersion "Yellow"
            Write-Host "  ??  Tiempo de respuesta: " -NoNewline
            Write-ColorOutput $result.responseTime "Yellow"
        } else {
            Write-ColorOutput "? CONEXIÓN FALLIDA" "Red"
            Write-Host ""
            Write-ColorOutput "  Mensaje: $($result.message)" "Red"
        }
        
        return $result.success
    } catch {
        Write-ColorOutput "? ERROR AL CONECTAR" "Red"
        Write-ColorOutput "  $($_.Exception.Message)" "Red"
        return $false
    }
}

function Test-Tables {
    Write-Header "?? TEST DE ESTRUCTURA"
    
    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/api/DatabaseTest/tables" -Method Get -ErrorAction Stop
        
        if ($result.success) {
            Write-ColorOutput "? TODAS LAS TABLAS EXISTEN" "Green"
            Write-Host ""
            Write-Host "  Total: " -NoNewline
            Write-ColorOutput "$($result.existingTables.Count)/17" "Yellow"
            Write-Host ""
            Write-Host "  Tablas encontradas:"
            foreach ($table in $result.existingTables) {
                Write-ColorOutput "    ? $table" "Gray"
            }
        } else {
            Write-ColorOutput "??  FALTAN TABLAS" "Yellow"
            Write-Host ""
            Write-Host "  Existentes: " -NoNewline
            Write-ColorOutput $result.existingTables.Count "Yellow"
            Write-Host "  Faltantes: " -NoNewline
            Write-ColorOutput $result.missingTables.Count "Red"
            Write-Host ""
            if ($result.missingTables.Count -gt 0) {
                Write-ColorOutput "  Tablas faltantes:" "Red"
                foreach ($table in $result.missingTables) {
                    Write-ColorOutput "    ? $table" "Red"
                }
                Write-Host ""
                Write-ColorOutput "  ?? Ejecuta: dotnet ef database update --project TuCita" "Cyan"
            }
        }
        
        return $result.success
    } catch {
        Write-ColorOutput "? ERROR AL VERIFICAR TABLAS" "Red"
        Write-ColorOutput "  $($_.Exception.Message)" "Red"
        return $false
    }
}

function Test-Data {
    Write-Header "?? TEST DE DATOS INICIALES"
    
    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/api/DatabaseTest/data" -Method Get -ErrorAction Stop
        
        if ($result.success) {
            Write-ColorOutput "? DATOS INICIALIZADOS CORRECTAMENTE" "Green"
        } else {
            Write-ColorOutput "??  FALTAN DATOS INICIALES" "Yellow"
        }
        
        Write-Host ""
        Write-Host "  ?? Roles: " -NoNewline
        Write-ColorOutput $result.rolesCount "Yellow"
        Write-Host "  ?? Usuarios: " -NoNewline
        Write-ColorOutput $result.usuariosCount "Yellow"
        Write-Host "  ?? Especialidades: " -NoNewline
        Write-ColorOutput $result.especialidadesCount "Yellow"
        Write-Host "  ????? Médicos: " -NoNewline
        Write-ColorOutput $result.medicosCount "Yellow"
        Write-Host "  ????? Pacientes: " -NoNewline
        Write-ColorOutput $result.pacientesCount "Yellow"
        Write-Host "  ?? Citas: " -NoNewline
        Write-ColorOutput $result.citasCount "Yellow"
        Write-Host ""
        Write-Host "  Roles básicos: " -NoNewline
        if ($result.hasBasicRoles) {
            Write-ColorOutput "? Configurados" "Green"
        } else {
            Write-ColorOutput "? Faltantes" "Red"
            Write-Host ""
            Write-ColorOutput "  ?? Reinicia la aplicación para ejecutar DbInitializer" "Cyan"
        }
        
        return $result.success
    } catch {
        Write-ColorOutput "? ERROR AL VERIFICAR DATOS" "Red"
        Write-ColorOutput "  $($_.Exception.Message)" "Red"
        return $false
    }
}

function Test-Health {
    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/api/DatabaseTest/health" -Method Get -ErrorAction Stop
        
        Write-Host "  Estado: " -NoNewline
        if ($result.status -eq "Healthy") {
            Write-ColorOutput "? $($result.status)" "Green"
        } else {
            Write-ColorOutput "? $($result.status)" "Red"
        }
        
        if ($result.database) {
            Write-Host "  Base de datos: " -NoNewline
            Write-ColorOutput $result.database "Gray"
        }
        
        if ($result.responseTime) {
            Write-Host "  Tiempo: " -NoNewline
            Write-ColorOutput $result.responseTime "Gray"
        }
        
        return $result.status -eq "Healthy"
    } catch {
        Write-Host "  Estado: " -NoNewline
        Write-ColorOutput "? Error" "Red"
        return $false
    }
}

function Get-Status {
    Write-Header "?? ESTADO DE LA BASE DE DATOS"
    
    try {
        $result = Invoke-RestMethod -Uri "$BaseUrl/api/DatabaseTest/status" -Method Get -ErrorAction Stop
        
        Write-Host "  Estado: " -NoNewline
        if ($result.status -eq "Connected") {
            Write-ColorOutput "? Conectado" "Green"
        } else {
            Write-ColorOutput "? $($result.status)" "Red"
        }
        
        if ($result.database) {
            Write-Host ""
            Write-Host "  ?? Base de datos: " -NoNewline
            Write-ColorOutput $result.database "Yellow"
            Write-Host "  ???  Servidor: " -NoNewline
            Write-ColorOutput $result.server "Yellow"
            Write-Host "  ?? Versión: " -NoNewline
            Write-ColorOutput $result.version "Yellow"
            Write-Host "  ??  Respuesta: " -NoNewline
            Write-ColorOutput $result.responseTime "Yellow"
        }
        
        if ($result.statistics) {
            Write-Host ""
            Write-Host "  ?? Estadísticas:"
            Write-Host "    Roles: " -NoNewline
            Write-ColorOutput $result.statistics.roles "Gray"
            Write-Host "    Usuarios: " -NoNewline
            Write-ColorOutput $result.statistics.usuarios "Gray"
            Write-Host "    Especialidades: " -NoNewline
            Write-ColorOutput $result.statistics.especialidades "Gray"
            Write-Host "    Médicos: " -NoNewline
            Write-ColorOutput $result.statistics.medicos "Gray"
            Write-Host "    Pacientes: " -NoNewline
            Write-ColorOutput $result.statistics.pacientes "Gray"
            Write-Host "    Citas: " -NoNewline
            Write-ColorOutput $result.statistics.citas "Gray"
        }
        
        Write-Host ""
        Write-Host "  Inicializado: " -NoNewline
        if ($result.initialized) {
            Write-ColorOutput "? Sí" "Green"
        } else {
            Write-ColorOutput "??  No" "Yellow"
        }
    } catch {
        Write-ColorOutput "? ERROR AL OBTENER ESTADO" "Red"
        Write-ColorOutput "  $($_.Exception.Message)" "Red"
    }
}

function Test-FullSuite {
    Write-Header "?? PRUEBA COMPLETA DE BASE DE DATOS"
    
    $results = @{
        Connection = $false
        Tables = $false
        Data = $false
    }
    
    # Test de conexión
    $results.Connection = Test-Connection
    
    if ($results.Connection) {
        # Test de tablas
        $results.Tables = Test-Tables
        
        # Test de datos
        $results.Data = Test-Data
    } else {
        Write-Host ""
        Write-ColorOutput "??  No se pueden ejecutar más pruebas sin conexión" "Yellow"
    }
    
    # Resumen
    Write-Header "?? RESUMEN"
    
    Write-Host "  Conexión: " -NoNewline
    if ($results.Connection) { Write-ColorOutput "? OK" "Green" } else { Write-ColorOutput "? FAIL" "Red" }
    
    Write-Host "  Estructura: " -NoNewline
    if ($results.Tables) { Write-ColorOutput "? OK" "Green" } else { Write-ColorOutput "? FAIL" "Red" }
    
    Write-Host "  Datos: " -NoNewline
    if ($results.Data) { Write-ColorOutput "? OK" "Green" } else { Write-ColorOutput "? FAIL" "Red" }
    
    Write-Host ""
    
    $allPassed = $results.Connection -and $results.Tables -and $results.Data
    
    if ($allPassed) {
        Write-ColorOutput "?? TODAS LAS PRUEBAS PASARON" "Green"
        Write-ColorOutput "   La base de datos está lista para usar" "Green"
    } else {
        Write-ColorOutput "??  ALGUNAS PRUEBAS FALLARON" "Yellow"
        Write-ColorOutput "   Revisa los errores anteriores" "Yellow"
    }
}

function Start-Watch {
    Write-Header "???  MONITOREO CONTINUO (Ctrl+C para detener)"
    Write-Host "  Intervalo: $WatchInterval segundos"
    Write-Host ""
    
    $iteration = 0
    while ($true) {
        $iteration++
        
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Iteración #$iteration - " -NoNewline
        
        $healthy = Test-Health
        
        Start-Sleep -Seconds $WatchInterval
    }
}

# Main
Clear-Host

Write-ColorOutput @"
?????????????????????????????????????????????????????????????
?                                                           ?
?   ?? TEST DE CONEXIÓN A AZURE SQL DATABASE               ?
?      TuCita - Sistema de Gestión de Citas Médicas        ?
?                                                           ?
?????????????????????????????????????????????????????????????
"@ "Cyan"

Write-Host ""
Write-Host "  URL Base: " -NoNewline
Write-ColorOutput $BaseUrl "Yellow"
Write-Host ""

# Verificar que la aplicación esté corriendo
try {
    $null = Invoke-RestMethod -Uri "$BaseUrl/api/DatabaseTest/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
} catch {
    Write-ColorOutput "? La aplicación no está corriendo en $BaseUrl" "Red"
    Write-Host ""
    Write-ColorOutput "?? Ejecuta primero: dotnet run --project TuCita" "Cyan"
    Write-Host ""
    exit 1
}

# Ejecutar pruebas según parámetros
if ($Watch) {
    Start-Watch
} elseif ($Full -or (-not $Connection -and -not $Tables -and -not $Data -and -not $Health -and -not $Status)) {
    Test-FullSuite
} else {
    if ($Connection) { Test-Connection }
    if ($Tables) { Test-Tables }
    if ($Data) { Test-Data }
    if ($Health) {
        Write-Header "?? HEALTH CHECK"
        Test-Health
    }
    if ($Status) { Get-Status }
}

Write-Host ""
Write-ColorOutput "???????????????????????????????????????????????????????????" "Cyan"
Write-Host ""
