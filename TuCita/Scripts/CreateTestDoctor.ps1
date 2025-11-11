# ====================================================================
# Script: CreateTestDoctor.ps1
# Descripción: Script rápido para crear un doctor de prueba
# ====================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$EnvFile = ".env",
    
    [Parameter(Mandatory=$false)]
    [string]$Email = "doctor.test@tucitaonline.com",
    
    [Parameter(Mandatory=$false)]
    [string]$Password = "Doctor123!",
    
    [Parameter(Mandatory=$false)]
    [string]$Nombre = "Test",
    
    [Parameter(Mandatory=$false)]
    [string]$Apellido = "Doctor",
    
    [Parameter(Mandatory=$false)]
    [string]$Especialidad = "Medicina General"
)

# Colores
function Write-Success { Write-Host $args -ForegroundColor Green }
function Write-Info { Write-Host $args -ForegroundColor Cyan }
function Write-Error { Write-Host $args -ForegroundColor Red }

Clear-Host
Write-Info "=========================================="
Write-Info "   TuCita - Doctor de Prueba"
Write-Info "=========================================="
Write-Host ""

# ====================================================================
# 1. Verificar módulo SqlServer
# ====================================================================
if (-not (Get-Module -ListAvailable -Name SqlServer)) {
    Write-Info "Instalando módulo SqlServer..."
    Install-Module -Name SqlServer -Scope CurrentUser -Force -AllowClobber
}
Import-Module SqlServer -ErrorAction SilentlyContinue

# ====================================================================
# 2. Cargar .env
# ====================================================================
Write-Info "Cargando configuración..."

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

Write-Success "? Conectado a: $DB_SERVER/$DB_NAME"

# ====================================================================
# 3. Generar hash de contraseña
# ====================================================================
Write-Info "Generando hash de contraseña..."

$tempDir = [System.IO.Path]::GetTempPath()
$projectDir = Join-Path $tempDir "TuCitaHasher_$([Guid]::NewGuid().ToString('N'))"

New-Item -ItemType Directory -Path $projectDir | Out-Null
Push-Location $projectDir

& dotnet new console --force 2>&1 | Out-Null
& dotnet add package BCrypt.Net-Next 2>&1 | Out-Null

$programCs = @"
using System;
var password = args.Length > 0 ? args[0] : "default";
var hash = BCrypt.Net.BCrypt.HashPassword(password, 11);
Console.WriteLine(hash);
"@

Set-Content -Path "Program.cs" -Value $programCs
& dotnet build --verbosity quiet 2>&1 | Out-Null
$passwordHash = & dotnet run -- $Password

Pop-Location
Remove-Item -Path $projectDir -Recurse -Force

Write-Success "? Hash generado"

# ====================================================================
# 4. Crear doctor en BD
# ====================================================================
Write-Info "Creando doctor de prueba..."

$emailNormalizado = $Email.ToLower()
$ahora = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss")

$sqlScript = @"
-- Verificar si ya existe
IF EXISTS (SELECT 1 FROM usuarios WHERE email = '$Email')
BEGIN
    -- Eliminar doctor existente
    DECLARE @ExistingId BIGINT;
    SELECT @ExistingId = id FROM usuarios WHERE email = '$Email';
    
    DELETE FROM agenda_turnos WHERE medico_id = @ExistingId;
    DELETE FROM medico_especialidad WHERE medico_id = @ExistingId;
    DELETE FROM perfil_medico WHERE usuario_id = @ExistingId;
    DELETE FROM roles_usuarios WHERE usuario_id = @ExistingId;
    DELETE FROM usuarios WHERE id = @ExistingId;
    
    PRINT 'Doctor existente eliminado';
END

-- Crear rol DOCTOR si no existe
IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'DOCTOR')
BEGIN
    INSERT INTO roles (nombre) VALUES ('DOCTOR');
END

DECLARE @RolDoctorId BIGINT;
SELECT @RolDoctorId = id FROM roles WHERE nombre = 'DOCTOR';

-- Crear usuario
DECLARE @DoctorId BIGINT;

INSERT INTO usuarios (
    email, password_hash, nombre, apellido,
    telefono, activo, creado_en, actualizado_en
) VALUES (
    '$Email', '$passwordHash',
    '$Nombre', '$Apellido', '+52 55 0000 0000',
    1, '$ahora', '$ahora'
);

SET @DoctorId = SCOPE_IDENTITY();

-- Asignar rol
INSERT INTO roles_usuarios (usuario_id, rol_id)
VALUES (@DoctorId, @RolDoctorId);

-- Crear perfil médico
INSERT INTO perfil_medico (
    usuario_id, numero_licencia, biografia, direccion,
    creado_en, actualizado_en
) VALUES (
    @DoctorId,
    'LIC-TEST-' + CAST(@DoctorId AS VARCHAR),
    'Doctor de prueba para testing y desarrollo',
    'Consultorio de Prueba',
    '$ahora', '$ahora'
);

-- Asegurar especialidad
DECLARE @EspecialidadId INT;

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = '$Especialidad')
BEGIN
    INSERT INTO especialidades (nombre) VALUES ('$Especialidad');
END

SELECT @EspecialidadId = id FROM especialidades WHERE nombre = '$Especialidad';

-- Asignar especialidad
INSERT INTO medico_especialidad (medico_id, especialidad_id)
VALUES (@DoctorId, @EspecialidadId);

-- Crear horarios (próximos 3 días laborables)
DECLARE @FechaBase DATE = CAST(GETUTCDATE() AS DATE);
DECLARE @DiaActual INT = 0;
DECLARE @DiasCreados INT = 0;

WHILE @DiasCreados < 3
BEGIN
    DECLARE @Fecha DATE = DATEADD(DAY, @DiaActual, @FechaBase);
    DECLARE @FechaDateTime DATETIME = CAST(@Fecha AS DATETIME);
    DECLARE @DiaSemana INT = DATEPART(WEEKDAY, @Fecha);
    
    IF @DiaSemana NOT IN (1, 7) -- Lunes a Viernes
    BEGIN
        -- Mañana: 9:00-13:00
        DECLARE @Hora INT = 9;
        WHILE @Hora < 13
        BEGIN
            DECLARE @Minuto INT = 0;
            WHILE @Minuto < 60
            BEGIN
                INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en)
                VALUES (
                    @DoctorId,
                    DATEADD(MINUTE, @Minuto, DATEADD(HOUR, @Hora, @FechaDateTime)),
                    DATEADD(MINUTE, @Minuto + 30, DATEADD(HOUR, @Hora, @FechaDateTime)),
                    0, GETUTCDATE(), GETUTCDATE()
                );
                SET @Minuto = @Minuto + 30;
            END
            SET @Hora = @Hora + 1;
        END
        
        -- Tarde: 15:00-18:00
        SET @Hora = 15;
        WHILE @Hora < 18
        BEGIN
            SET @Minuto = 0;
            WHILE @Minuto < 60
            BEGIN
                INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en)
                VALUES (
                    @DoctorId,
                    DATEADD(MINUTE, @Minuto, DATEADD(HOUR, @Hora, @FechaDateTime)),
                    DATEADD(MINUTE, @Minuto + 30, DATEADD(HOUR, @Hora, @FechaDateTime)),
                    0, GETUTCDATE(), GETUTCDATE()
                );
                SET @Minuto = @Minuto + 30;
            END
            SET @Hora = @Hora + 1;
        END
        
        SET @DiasCreados = @DiasCreados + 1;
    END
    
    SET @DiaActual = @DiaActual + 1;
END

SELECT @DoctorId AS DoctorId;
"@

try {
    $result = Invoke-Sqlcmd -ConnectionString $connectionString -Query $sqlScript -ErrorAction Stop
    $doctorId = $result.DoctorId
    
    Write-Success "? Doctor de prueba creado (ID: $doctorId)"
    
    # Verificar
    $verifyScript = @"
SELECT 
    u.id, u.email, u.nombre, u.apellido,
    r.nombre as rol, pm.numero_licencia,
    e.nombre as especialidad,
    COUNT(at.id) as turnos
FROM usuarios u
JOIN roles_usuarios ru ON u.id = ru.usuario_id
JOIN roles r ON ru.rol_id = r.id
JOIN perfil_medico pm ON u.id = pm.usuario_id
LEFT JOIN medico_especialidad me ON u.id = me.medico_id
LEFT JOIN especialidades e ON me.especialidad_id = e.id
LEFT JOIN agenda_turnos at ON u.id = at.medico_id AND at.estado = 0
WHERE u.id = $doctorId
GROUP BY u.id, u.email, u.nombre, u.apellido, r.nombre, pm.numero_licencia, e.nombre;
"@
    
    $doctor = Invoke-Sqlcmd -ConnectionString $connectionString -Query $verifyScript -ErrorAction Stop
    
    Write-Host ""
    Write-Success "=========================================="
    Write-Success "? Doctor de Prueba Creado"
    Write-Success "=========================================="
    Write-Host "ID:             $($doctor.id)"
    Write-Host "Email:          $($doctor.email)"
    Write-Host "Password:       $Password"
    Write-Host "Nombre:         $($doctor.nombre) $($doctor.apellido)"
    Write-Host "Rol:            $($doctor.rol)"
    Write-Host "Licencia:       $($doctor.numero_licencia)"
    Write-Host "Especialidad:   $($doctor.especialidad)"
    Write-Host "Turnos:         $($doctor.turnos)"
    Write-Host ""
    Write-Info "Login URL: http://localhost:3000/doctor-auth"
    Write-Host ""
    
} catch {
    Write-Error "? Error: $($_.Exception.Message)"
    exit 1
}

Write-Success "?? Completado"
