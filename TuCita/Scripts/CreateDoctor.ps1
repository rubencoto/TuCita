# ====================================================================
# Script: CreateDoctor.ps1
# Descripción: Script interactivo para crear usuarios médicos en TuCita
# Requisitos: SqlServer PowerShell Module
# ====================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$EnvFile = ".env"
)

# Colores para mejor visualización
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Success { Write-ColorOutput Green $args }
function Write-Info { Write-ColorOutput Cyan $args }
function Write-Warning { Write-ColorOutput Yellow $args }
function Write-Error { Write-ColorOutput Red $args }

# ====================================================================
# Banner
# ====================================================================
Clear-Host
Write-Info "=========================================="
Write-Info "   TuCita - Creación de Usuario Médico"
Write-Info "=========================================="
Write-Host ""

# ====================================================================
# 1. Verificar módulo SqlServer
# ====================================================================
Write-Info "?? Verificando módulo SqlServer..."
if (-not (Get-Module -ListAvailable -Name SqlServer)) {
    Write-Warning "El módulo SqlServer no está instalado."
    $install = Read-Host "¿Desea instalarlo ahora? (S/N)"
    if ($install -eq "S" -or $install -eq "s") {
        Write-Info "Instalando módulo SqlServer..."
        Install-Module -Name SqlServer -Scope CurrentUser -Force -AllowClobber
        Write-Success "? Módulo SqlServer instalado correctamente"
    } else {
        Write-Error "? No se puede continuar sin el módulo SqlServer"
        exit 1
    }
}

Import-Module SqlServer -ErrorAction SilentlyContinue

# ====================================================================
# 2. Cargar variables de entorno desde .env
# ====================================================================
Write-Info "?? Cargando configuración desde $EnvFile..."

if (-not (Test-Path $EnvFile)) {
    Write-Error "? No se encontró el archivo $EnvFile"
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

if (-not $DB_SERVER -or -not $DB_NAME -or -not $DB_USER -or -not $DB_PASSWORD) {
    Write-Error "? Faltan variables de entorno en el archivo .env"
    Write-Error "   Asegúrate de que existan: DB_SERVER, DB_NAME, DB_USER, DB_PASSWORD"
    exit 1
}

Write-Success "? Configuración cargada correctamente"
Write-Host "   Servidor: $DB_SERVER"
Write-Host "   Base de datos: $DB_NAME"
Write-Host ""

# ====================================================================
# 3. Construir cadena de conexión
# ====================================================================
$connectionString = "Server=$DB_SERVER;Database=$DB_NAME;User Id=$DB_USER;Password=$DB_PASSWORD;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

# ====================================================================
# 4. Recopilar información del doctor
# ====================================================================
Write-Info "?? Ingrese los datos del nuevo médico:"
Write-Host ""

$email = Read-Host "Email"
$nombre = Read-Host "Nombre"
$apellido = Read-Host "Apellido"
$telefono = Read-Host "Teléfono (ej: +52 55 1234 5678)"
$numeroLicencia = Read-Host "Número de Licencia Médica"
$biografia = Read-Host "Biografía/Descripción profesional"
$direccion = Read-Host "Dirección del consultorio"

# Solicitar contraseña de forma segura
$securePassword = Read-Host "Contraseña" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
$password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)

Write-Host ""
Write-Info "Especialidades disponibles:"
Write-Host "  1. Medicina General"
Write-Host "  2. Cardiología"
Write-Host "  3. Dermatología"
Write-Host "  4. Pediatría"
Write-Host "  5. Ginecología"
Write-Host "  6. Traumatología"
Write-Host "  7. Neurología"
Write-Host "  8. Psiquiatría"
Write-Host "  9. Oftalmología"
Write-Host " 10. Otorrinolaringología"

$especialidadNum = Read-Host "Seleccione número de especialidad (1-10)"

$especialidades = @(
    "Medicina General",
    "Cardiología",
    "Dermatología",
    "Pediatría",
    "Ginecología",
    "Traumatología",
    "Neurología",
    "Psiquiatría",
    "Oftalmología",
    "Otorrinolaringología"
)

if ([int]$especialidadNum -lt 1 -or [int]$especialidadNum -gt 10) {
    Write-Error "? Número de especialidad inválido"
    exit 1
}

$especialidadNombre = $especialidades[[int]$especialidadNum - 1]

Write-Host ""
$createSchedule = Read-Host "¿Desea crear horarios disponibles para los próximos 3 días? (S/N)"

# ====================================================================
# 5. Confirmación
# ====================================================================
Write-Host ""
Write-Info "=========================================="
Write-Info "Resumen de datos a crear:"
Write-Info "=========================================="
Write-Host "Email: $email"
Write-Host "Nombre: $nombre $apellido"
Write-Host "Teléfono: $telefono"
Write-Host "Licencia: $numeroLicencia"
Write-Host "Especialidad: $especialidadNombre"
Write-Host "Dirección: $direccion"
Write-Host "Biografía: $biografia"
Write-Host ""

$confirm = Read-Host "¿Es correcta la información? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Warning "?? Operación cancelada por el usuario"
    exit 0
}

# ====================================================================
# 6. Hash de contraseña con BCrypt
# ====================================================================
Write-Info "?? Generando hash de contraseña..."

# Instalar BCrypt si no está disponible
if (-not (Get-Command "dotnet" -ErrorAction SilentlyContinue)) {
    Write-Error "? .NET CLI no está instalado. Por favor instala .NET SDK"
    exit 1
}

# Generar hash usando C# inline
$hashCode = @"
using System;
using BCrypt.Net;

public class PasswordHasher {
    public static string HashPassword(string password) {
        return BCrypt.Net.BCrypt.HashPassword(password, 11);
    }
}
"@

# Crear proyecto temporal para hash
$tempDir = [System.IO.Path]::GetTempPath()
$projectDir = Join-Path $tempDir "TuCitaHasher"

if (Test-Path $projectDir) {
    Remove-Item -Path $projectDir -Recurse -Force
}

New-Item -ItemType Directory -Path $projectDir | Out-Null
Set-Location $projectDir

# Crear proyecto console
& dotnet new console --force | Out-Null
& dotnet add package BCrypt.Net-Next | Out-Null

# Crear código para hash
$programCs = @"
using System;

var password = args.Length > 0 ? args[0] : "default";
var hash = BCrypt.Net.BCrypt.HashPassword(password, 11);
Console.WriteLine(hash);
"@

Set-Content -Path "Program.cs" -Value $programCs

# Compilar y ejecutar
& dotnet build --verbosity quiet | Out-Null
$passwordHash = & dotnet run -- $password

# Limpiar
Set-Location $PSScriptRoot
Remove-Item -Path $projectDir -Recurse -Force

Write-Success "? Hash generado correctamente"

# ====================================================================
# 7. Preparar y ejecutar script SQL
# ====================================================================
Write-Info "?? Creando usuario médico en la base de datos..."

$emailNormalizado = $email.ToLower()
$ahora = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss")

$sqlScript = @"
-- Verificar si el email ya existe
IF EXISTS (SELECT 1 FROM usuarios WHERE email = '$email')
BEGIN
    RAISERROR('El email ya está registrado', 16, 1);
    RETURN;
END

-- Asegurar que existe el rol DOCTOR
IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'DOCTOR')
BEGIN
    INSERT INTO roles (nombre) VALUES ('DOCTOR');
END

DECLARE @RolDoctorId BIGINT;
SELECT @RolDoctorId = id FROM roles WHERE nombre = 'DOCTOR';

-- Crear usuario
DECLARE @DoctorUsuarioId BIGINT;

INSERT INTO usuarios (
    email,
    password_hash,
    nombre,
    apellido,
    telefono,
    activo,
    creado_en,
    actualizado_en
) VALUES (
    '$email',
    '$passwordHash',
    '$nombre',
    '$apellido',
    '$telefono',
    1,
    '$ahora',
    '$ahora'
);

SET @DoctorUsuarioId = SCOPE_IDENTITY();

-- Asignar rol DOCTOR
INSERT INTO roles_usuarios (usuario_id, rol_id)
VALUES (@DoctorUsuarioId, @RolDoctorId);

-- Crear perfil médico
INSERT INTO perfil_medico (
    usuario_id,
    numero_licencia,
    biografia,
    direccion,
    creado_en,
    actualizado_en
) VALUES (
    @DoctorUsuarioId,
    '$numeroLicencia',
    '$biografia',
    '$direccion',
    '$ahora',
    '$ahora'
);

-- Asegurar que existe la especialidad
DECLARE @EspecialidadId INT;

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = '$especialidadNombre')
BEGIN
    INSERT INTO especialidades (nombre) VALUES ('$especialidadNombre');
END

SELECT @EspecialidadId = id FROM especialidades WHERE nombre = '$especialidadNombre';

-- Asignar especialidad
INSERT INTO medico_especialidad (medico_id, especialidad_id)
VALUES (@DoctorUsuarioId, @EspecialidadId);

SELECT @DoctorUsuarioId AS DoctorId;
"@

try {
    $result = Invoke-Sqlcmd -ConnectionString $connectionString -Query $sqlScript -ErrorAction Stop
    $doctorId = $result.DoctorId
    
    Write-Success "? Usuario médico creado exitosamente (ID: $doctorId)"
    
    # ====================================================================
    # 8. Crear horarios disponibles (opcional)
    # ====================================================================
    if ($createSchedule -eq "S" -or $createSchedule -eq "s") {
        Write-Info "?? Creando horarios disponibles..."
        
        $scheduleScript = @"
DECLARE @MedicoId BIGINT = $doctorId;
DECLARE @FechaBase DATE = CAST(GETUTCDATE() AS DATE);
DECLARE @DiaActual INT = 0;
DECLARE @DiasCreados INT = 0;

WHILE @DiasCreados < 3
BEGIN
    DECLARE @Fecha DATE = DATEADD(DAY, @DiaActual, @FechaBase);
    DECLARE @FechaDateTime DATETIME = CAST(@Fecha AS DATETIME);
    DECLARE @DiaSemana INT = DATEPART(WEEKDAY, @Fecha);
    
    -- Solo días laborables (lunes a viernes)
    IF @DiaSemana NOT IN (1, 7)
    BEGIN
        -- Turnos de mañana: 9:00 a 13:00 (cada 30 minutos)
        DECLARE @Hora INT = 9;
        WHILE @Hora < 13
        BEGIN
            DECLARE @Minuto INT = 0;
            WHILE @Minuto < 60
            BEGIN
                INSERT INTO agenda_turnos (
                    medico_id,
                    inicio,
                    fin,
                    estado,
                    creado_en,
                    actualizado_en
                ) VALUES (
                    @MedicoId,
                    DATEADD(MINUTE, @Minuto, DATEADD(HOUR, @Hora, @FechaDateTime)),
                    DATEADD(MINUTE, @Minuto + 30, DATEADD(HOUR, @Hora, @FechaDateTime)),
                    0, -- DISPONIBLE
                    GETUTCDATE(),
                    GETUTCDATE()
                );
                
                SET @Minuto = @Minuto + 30;
            END
            SET @Hora = @Hora + 1;
        END
        
        -- Turnos de tarde: 15:00 a 18:00 (cada 30 minutos)
        SET @Hora = 15;
        WHILE @Hora < 18
        BEGIN
            SET @Minuto = 0;
            WHILE @Minuto < 60
            BEGIN
                INSERT INTO agenda_turnos (
                    medico_id,
                    inicio,
                    fin,
                    estado,
                    creado_en,
                    actualizado_en
                ) VALUES (
                    @MedicoId,
                    DATEADD(MINUTE, @Minuto, DATEADD(HOUR, @Hora, @FechaDateTime)),
                    DATEADD(MINUTE, @Minuto + 30, DATEADD(HOUR, @Hora, @FechaDateTime)),
                    0, -- DISPONIBLE
                    GETUTCDATE(),
                    GETUTCDATE()
                );
                
                SET @Minuto = @Minuto + 30;
            END
            SET @Hora = @Hora + 1;
        END
        
        SET @DiasCreados = @DiasCreados + 1;
    END
    
    SET @DiaActual = @DiaActual + 1;
END

SELECT COUNT(*) AS TurnosCreados FROM agenda_turnos WHERE medico_id = @MedicoId;
"@
        
        $scheduleResult = Invoke-Sqlcmd -ConnectionString $connectionString -Query $scheduleScript -ErrorAction Stop
        Write-Success "? Se crearon $($scheduleResult.TurnosCreados) turnos disponibles"
    }
    
    # ====================================================================
    # 9. Verificación final
    # ====================================================================
    Write-Info "?? Verificando creación..."
    
    $verifyScript = @"
SELECT 
    u.id,
    u.email,
    u.nombre,
    u.apellido,
    u.telefono,
    r.nombre as rol,
    pm.numero_licencia,
    e.nombre as especialidad,
    COUNT(at.id) as turnos_disponibles
FROM usuarios u
JOIN roles_usuarios ru ON u.id = ru.usuario_id
JOIN roles r ON ru.rol_id = r.id
JOIN perfil_medico pm ON u.id = pm.usuario_id
LEFT JOIN medico_especialidad me ON u.id = me.medico_id
LEFT JOIN especialidades e ON me.especialidad_id = e.id
LEFT JOIN agenda_turnos at ON u.id = at.medico_id AND at.estado = 0
WHERE u.id = $doctorId
GROUP BY u.id, u.email, u.nombre, u.apellido, u.telefono, r.nombre, pm.numero_licencia, e.nombre;
"@
    
    $verification = Invoke-Sqlcmd -ConnectionString $connectionString -Query $verifyScript -ErrorAction Stop
    
    Write-Host ""
    Write-Success "=========================================="
    Write-Success "? Doctor creado exitosamente"
    Write-Success "=========================================="
    Write-Host "ID: $($verification.id)"
    Write-Host "Email: $($verification.email)"
    Write-Host "Nombre: $($verification.nombre) $($verification.apellido)"
    Write-Host "Teléfono: $($verification.telefono)"
    Write-Host "Rol: $($verification.rol)"
    Write-Host "Licencia: $($verification.numero_licencia)"
    Write-Host "Especialidad: $($verification.especialidad)"
    Write-Host "Turnos disponibles: $($verification.turnos_disponibles)"
    Write-Host ""
    Write-Info "Credenciales de acceso:"
    Write-Host "  Email: $email"
    Write-Host "  Password: [la contraseña ingresada]"
    Write-Host ""
    Write-Success "El médico puede iniciar sesión en: http://localhost:3000/doctor-auth"
    
} catch {
    Write-Error "? Error al crear el usuario médico:"
    Write-Error $_.Exception.Message
    exit 1
}

Write-Host ""
Write-Success "?? Proceso completado exitosamente"
