# ====================================================================
# Script: ManageDoctors.ps1
# Descripción: Gestión de usuarios médicos (listar, eliminar, activar/desactivar)
# ====================================================================

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("list", "delete", "activate", "deactivate", "stats")]
    [string]$Action = "list",
    
    [Parameter(Mandatory=$false)]
    [string]$Email,
    
    [Parameter(Mandatory=$false)]
    [string]$EnvFile = ".env"
)

# Colores
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Warning { Write-Host $args -ForegroundColor Yellow }
function Write-Error { Write-Host $args -ForegroundColor Red }

Clear-Host
Write-Info "=========================================="
Write-Info "   TuCita - Gestión de Doctores"
Write-Info "=========================================="
Write-Host ""

# ====================================================================
# Verificar y cargar módulo SqlServer
# ====================================================================
if (-not (Get-Module -ListAvailable -Name SqlServer)) {
    Write-Info "Instalando módulo SqlServer..."
    Install-Module -Name SqlServer -Scope CurrentUser -Force -AllowClobber
}
Import-Module SqlServer -ErrorAction SilentlyContinue

# ====================================================================
# Cargar .env
# ====================================================================
if (-not (Test-Path $EnvFile)) {
    Write-Error "No se encontró $EnvFile"
    exit 1
}

$envVars = @{}
Get-Content $EnvFile | ForEach-Object {
    if ($_ -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $envVars[$key] = $value
    }
}

$DB_SERVER = $envVars["DB_SERVER"]
$DB_NAME = $envVars["DB_NAME"]
$DB_USER = $envVars["DB_USER"]
$DB_PASSWORD = $envVars["DB_PASSWORD"]

$connectionString = "Server=$DB_SERVER;Database=$DB_NAME;User Id=$DB_USER;Password=$DB_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# ====================================================================
# Funciones de gestión
# ====================================================================

function List-Doctors {
    Write-Info "?? Listando todos los doctores..."
    Write-Host ""
    
    $query = @"
SELECT 
    u.id,
    u.email,
    u.nombre + ' ' + u.apellido AS nombre_completo,
    u.telefono,
    u.activo,
    pm.numero_licencia,
    STRING_AGG(e.nombre, ', ') AS especialidades,
    COUNT(DISTINCT at.id) AS turnos_disponibles,
    COUNT(DISTINCT c.id) AS citas_totales,
    u.creado_en
FROM usuarios u
JOIN roles_usuarios ru ON u.id = ru.usuario_id
JOIN roles r ON ru.rol_id = r.id
LEFT JOIN perfil_medico pm ON u.id = pm.usuario_id
LEFT JOIN medico_especialidad me ON u.id = me.medico_id
LEFT JOIN especialidades e ON me.especialidad_id = e.id
LEFT JOIN agenda_turnos at ON u.id = at.medico_id AND at.estado = 0
LEFT JOIN citas c ON u.id = c.medico_id
WHERE r.nombre = 'DOCTOR'
GROUP BY 
    u.id, u.email, u.nombre, u.apellido, u.telefono, 
    u.activo, pm.numero_licencia, u.creado_en
ORDER BY u.creado_en DESC;
"@
    
    try {
        $doctors = Invoke-Sqlcmd -ConnectionString $connectionString -Query $query -ErrorAction Stop
        
        if ($doctors.Count -eq 0) {
            Write-Warning "No hay doctores registrados"
            return
        }
        
        Write-Success "Total de doctores: $($doctors.Count)"
        Write-Host ""
        
        $doctors | Format-Table -Property @(
            @{Label="ID"; Expression={$_.id}; Width=5},
            @{Label="Email"; Expression={$_.email}; Width=30},
            @{Label="Nombre"; Expression={$_.nombre_completo}; Width=25},
            @{Label="Licencia"; Expression={$_.numero_licencia}; Width=15},
            @{Label="Especialidades"; Expression={$_.especialidades}; Width=30},
            @{Label="Activo"; Expression={if($_.activo){"?"}else{"?"}}; Width=6},
            @{Label="Turnos"; Expression={$_.turnos_disponibles}; Width=7},
            @{Label="Citas"; Expression={$_.citas_totales}; Width=6}
        ) -AutoSize
        
    } catch {
        Write-Error "Error al listar doctores: $($_.Exception.Message)"
    }
}

function Get-DoctorStats {
    Write-Info "?? Estadísticas de doctores..."
    Write-Host ""
    
    $statsQuery = @"
SELECT 
    COUNT(DISTINCT u.id) AS total_doctores,
    COUNT(DISTINCT CASE WHEN u.activo = 1 THEN u.id END) AS doctores_activos,
    COUNT(DISTINCT e.id) AS total_especialidades,
    COUNT(DISTINCT at.id) AS turnos_disponibles,
    COUNT(DISTINCT c.id) AS citas_totales,
    COUNT(DISTINCT CASE WHEN c.estado = 1 THEN c.id END) AS citas_confirmadas,
    COUNT(DISTINCT CASE WHEN c.estado = 2 THEN c.id END) AS citas_completadas
FROM usuarios u
JOIN roles_usuarios ru ON u.id = ru.usuario_id
JOIN roles r ON ru.rol_id = r.id
LEFT JOIN medico_especialidad me ON u.id = me.medico_id
LEFT JOIN especialidades e ON me.especialidad_id = e.id
LEFT JOIN agenda_turnos at ON u.id = at.medico_id AND at.estado = 0
LEFT JOIN citas c ON u.id = c.medico_id
WHERE r.nombre = 'DOCTOR';

-- Especialidades más comunes
SELECT TOP 5
    e.nombre AS especialidad,
    COUNT(DISTINCT me.medico_id) AS cantidad_doctores
FROM especialidades e
JOIN medico_especialidad me ON e.id = me.especialidad_id
GROUP BY e.nombre
ORDER BY cantidad_doctores DESC;
"@
    
    try {
        $stats = Invoke-Sqlcmd -ConnectionString $connectionString -Query $statsQuery -ErrorAction Stop
        
        Write-Success "=== Estadísticas Generales ==="
        Write-Host "Total de doctores:       $($stats[0].total_doctores)"
        Write-Host "Doctores activos:        $($stats[0].doctores_activos)"
        Write-Host "Especialidades:          $($stats[0].total_especialidades)"
        Write-Host "Turnos disponibles:      $($stats[0].turnos_disponibles)"
        Write-Host "Citas totales:           $($stats[0].citas_totales)"
        Write-Host "  - Confirmadas:         $($stats[0].citas_confirmadas)"
        Write-Host "  - Completadas:         $($stats[0].citas_completadas)"
        Write-Host ""
        
        if ($stats.Count -gt 1) {
            Write-Success "=== Top Especialidades ==="
            for ($i = 1; $i -lt $stats.Count; $i++) {
                Write-Host "$($stats[$i].especialidad): $($stats[$i].cantidad_doctores) doctores"
            }
        }
        
    } catch {
        Write-Error "Error al obtener estadísticas: $($_.Exception.Message)"
    }
}

function Delete-Doctor {
    param([string]$DoctorEmail)
    
    if (-not $DoctorEmail) {
        Write-Error "Debe especificar el email del doctor a eliminar"
        Write-Host "Uso: .\ManageDoctors.ps1 -Action delete -Email doctor@ejemplo.com"
        return
    }
    
    Write-Warning "??  ADVERTENCIA: Está a punto de eliminar permanentemente al doctor"
    Write-Host "   Email: $DoctorEmail"
    Write-Host ""
    
    $confirm = Read-Host "¿Confirma la eliminación? (escriba 'ELIMINAR' para confirmar)"
    
    if ($confirm -ne "ELIMINAR") {
        Write-Warning "Operación cancelada"
        return
    }
    
    $deleteQuery = @"
DECLARE @DoctorId BIGINT;

SELECT @DoctorId = u.id 
FROM usuarios u
WHERE u.email_normalizado = LOWER('$DoctorEmail');

IF @DoctorId IS NULL
BEGIN
    RAISERROR('Doctor no encontrado', 16, 1);
    RETURN;
END

-- Eliminar en cascada
DELETE FROM agenda_turnos WHERE medico_id = @DoctorId;
DELETE FROM medico_especialidad WHERE medico_id = @DoctorId;
DELETE FROM perfil_medico WHERE usuario_id = @DoctorId;
DELETE FROM citas WHERE medico_id = @DoctorId;
DELETE FROM roles_usuarios WHERE usuario_id = @DoctorId;
DELETE FROM usuarios WHERE id = @DoctorId;

SELECT 'Doctor eliminado exitosamente' AS Mensaje;
"@
    
    try {
        Invoke-Sqlcmd -ConnectionString $connectionString -Query $deleteQuery -ErrorAction Stop
        Write-Success "? Doctor eliminado exitosamente"
    } catch {
        Write-Error "Error al eliminar doctor: $($_.Exception.Message)"
    }
}

function Toggle-DoctorStatus {
    param(
        [string]$DoctorEmail,
        [bool]$Activate
    )
    
    if (-not $DoctorEmail) {
        $action = if ($Activate) { "activar" } else { "desactivar" }
        Write-Error "Debe especificar el email del doctor a $action"
        Write-Host "Uso: .\ManageDoctors.ps1 -Action $action -Email doctor@ejemplo.com"
        return
    }
    
    $status = if ($Activate) { 1 } else { 0 }
    $statusText = if ($Activate) { "activado" } else { "desactivado" }
    
    $updateQuery = @"
UPDATE usuarios
SET activo = $status, actualizado_en = GETUTCDATE()
WHERE email_normalizado = LOWER('$DoctorEmail')
AND id IN (
    SELECT usuario_id FROM roles_usuarios ru
    JOIN roles r ON ru.rol_id = r.id
    WHERE r.nombre = 'DOCTOR'
);

IF @@ROWCOUNT = 0
BEGIN
    RAISERROR('Doctor no encontrado', 16, 1);
    RETURN;
END

SELECT 'Doctor $statusText exitosamente' AS Mensaje;
"@
    
    try {
        Invoke-Sqlcmd -ConnectionString $connectionString -Query $updateQuery -ErrorAction Stop
        Write-Success "? Doctor $statusText exitosamente"
    } catch {
        Write-Error "Error al modificar estado del doctor: $($_.Exception.Message)"
    }
}

# ====================================================================
# Ejecutar acción solicitada
# ====================================================================

switch ($Action.ToLower()) {
    "list" {
        List-Doctors
    }
    "stats" {
        Get-DoctorStats
    }
    "delete" {
        Delete-Doctor -DoctorEmail $Email
    }
    "activate" {
        Toggle-DoctorStatus -DoctorEmail $Email -Activate $true
    }
    "deactivate" {
        Toggle-DoctorStatus -DoctorEmail $Email -Activate $false
    }
    default {
        Write-Error "Acción no válida: $Action"
        Write-Host ""
        Write-Info "Acciones disponibles:"
        Write-Host "  list        - Listar todos los doctores"
        Write-Host "  stats       - Mostrar estadísticas"
        Write-Host "  delete      - Eliminar un doctor (requiere -Email)"
        Write-Host "  activate    - Activar un doctor (requiere -Email)"
        Write-Host "  deactivate  - Desactivar un doctor (requiere -Email)"
        Write-Host ""
        Write-Info "Ejemplos:"
        Write-Host "  .\ManageDoctors.ps1 -Action list"
        Write-Host "  .\ManageDoctors.ps1 -Action stats"
        Write-Host "  .\ManageDoctors.ps1 -Action delete -Email doctor@ejemplo.com"
        Write-Host "  .\ManageDoctors.ps1 -Action activate -Email doctor@ejemplo.com"
    }
}

Write-Host ""
