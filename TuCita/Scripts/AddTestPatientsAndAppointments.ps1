# ====================================================================
# Script: AddTestPatientsAndAppointments.ps1
# Descripción: Agrega pacientes de prueba con citas e historial médico
#              para el doctor con ID 16 (Ruben Coto)
# Requisitos: SqlServer PowerShell Module
# ====================================================================

param(
    [Parameter(Mandatory=$false)]
    [string]$EnvFile = ".env",
    
    [Parameter(Mandatory=$false)]
    [long]$DoctorId = 16
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
Write-Info "   TuCita - Agregar Pacientes y Citas"
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
# 4. Verificar que el doctor existe
# ====================================================================
Write-Info "?? Verificando doctor con ID $DoctorId..."

$verifyDoctorScript = @"
SELECT 
    u.id,
    u.email,
    u.nombre,
    u.apellido,
    pm.numero_licencia
FROM usuarios u
JOIN perfil_medico pm ON u.id = pm.usuario_id
WHERE u.id = $DoctorId;
"@

try {
    $doctor = Invoke-Sqlcmd -ConnectionString $connectionString -Query $verifyDoctorScript -ErrorAction Stop
    
    if (-not $doctor) {
        Write-Error "? No se encontró el doctor con ID $DoctorId"
        exit 1
    }
    
    Write-Success "? Doctor encontrado: $($doctor.nombre) $($doctor.apellido) ($($doctor.email))"
    Write-Host ""
} catch {
    Write-Error "? Error al verificar doctor: $($_.Exception.Message)"
    exit 1
}

# ====================================================================
# 5. Definir datos de pacientes de prueba
# ====================================================================
$pacientes = @(
    @{
        Nombre = "María"
        Apellido = "González López"
        Email = "maria.gonzalez@example.com"
        Telefono = "+52 55 1111 1111"
        FechaNacimiento = "1985-03-15"
        Identificacion = "GOLM850315"
        TelefonoEmergencia = "+52 55 9999 1111"
        Password = "Paciente123!"
    },
    @{
        Nombre = "Carlos"
        Apellido = "Rodríguez Pérez"
        Email = "carlos.rodriguez@example.com"
        Telefono = "+52 55 2222 2222"
        FechaNacimiento = "1978-07-22"
        Identificacion = "ROPC780722"
        TelefonoEmergencia = "+52 55 9999 2222"
        Password = "Paciente123!"
    },
    @{
        Nombre = "Ana"
        Apellido = "Martínez Sánchez"
        Email = "ana.martinez@example.com"
        Telefono = "+52 55 3333 3333"
        FechaNacimiento = "1992-11-08"
        Identificacion = "MASA921108"
        TelefonoEmergencia = "+52 55 9999 3333"
        Password = "Paciente123!"
    },
    @{
        Nombre = "Luis"
        Apellido = "Hernández García"
        Email = "luis.hernandez@example.com"
        Telefono = "+52 55 4444 4444"
        FechaNacimiento = "1980-05-30"
        Identificacion = "HEGL800530"
        TelefonoEmergencia = "+52 55 9999 4444"
        Password = "Paciente123!"
    },
    @{
        Nombre = "Patricia"
        Apellido = "López Torres"
        Email = "patricia.lopez@example.com"
        Telefono = "+52 55 5555 5555"
        FechaNacimiento = "1995-09-14"
        Identificacion = "LOTP950914"
        TelefonoEmergencia = "+52 55 9999 5555"
        Password = "Paciente123!"
    }
)

# ====================================================================
# 6. Generar hash de contraseña con BCrypt
# ====================================================================
Write-Info "?? Generando hash de contraseña para pacientes..."

# Crear proyecto temporal para hash
$tempDir = [System.IO.Path]::GetTempPath()
$projectDir = Join-Path $tempDir "TuCitaHasher_$(Get-Random)"

if (Test-Path $projectDir) {
    Remove-Item -Path $projectDir -Recurse -Force
}

New-Item -ItemType Directory -Path $projectDir | Out-Null
$currentDir = Get-Location
Set-Location $projectDir

# Crear proyecto console
& dotnet new console --force | Out-Null
& dotnet add package BCrypt.Net-Next | Out-Null

# Crear código para hash
$programCs = @"
using System;

var password = args.Length > 0 ? args[0] : "Paciente123!";
var hash = BCrypt.Net.BCrypt.HashPassword(password, 11);
Console.WriteLine(hash);
"@

Set-Content -Path "Program.cs" -Value $programCs

# Compilar y ejecutar
& dotnet build --verbosity quiet | Out-Null
$passwordHash = & dotnet run -- "Paciente123!"

# Limpiar
Set-Location $currentDir
Remove-Item -Path $projectDir -Recurse -Force

Write-Success "? Hash generado correctamente"

# ====================================================================
# 7. Crear pacientes y sus citas
# ====================================================================
Write-Info "?? Creando pacientes y sus citas..."

$ahora = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss")
$pacientesCreados = 0
$citasCreadas = 0

foreach ($paciente in $pacientes) {
    Write-Info "   ?? Creando paciente: $($paciente.Nombre) $($paciente.Apellido)"
    
    $crearPacienteScript = @"
-- Verificar si el paciente ya existe
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = '$($paciente.Email)')
BEGIN
    -- Asegurar que existe el rol PACIENTE
    IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'PACIENTE')
    BEGIN
        INSERT INTO roles (nombre) VALUES ('PACIENTE');
    END
    
    DECLARE @RolPacienteId BIGINT;
    SELECT @RolPacienteId = id FROM roles WHERE nombre = 'PACIENTE';
    
    -- Crear usuario
    DECLARE @PacienteUsuarioId BIGINT;
    
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
        '$($paciente.Email)',
        '$passwordHash',
        '$($paciente.Nombre)',
        '$($paciente.Apellido)',
        '$($paciente.Telefono)',
        1,
        '$ahora',
        '$ahora'
    );
    
    SET @PacienteUsuarioId = SCOPE_IDENTITY();
    
    -- Asignar rol PACIENTE
    INSERT INTO roles_usuarios (usuario_id, rol_id)
    VALUES (@PacienteUsuarioId, @RolPacienteId);
    
    -- Crear perfil paciente
    INSERT INTO perfil_paciente (
        usuario_id,
        fecha_nacimiento,
        identificacion,
        telefono_emergencia,
        creado_en,
        actualizado_en
    ) VALUES (
        @PacienteUsuarioId,
        '$($paciente.FechaNacimiento)',
        '$($paciente.Identificacion)',
        '$($paciente.TelefonoEmergencia)',
        '$ahora',
        '$ahora'
    );
    
    SELECT @PacienteUsuarioId AS PacienteId;
END
ELSE
BEGIN
    SELECT id AS PacienteId FROM usuarios WHERE email = '$($paciente.Email)';
END
"@
    
    try {
        $result = Invoke-Sqlcmd -ConnectionString $connectionString -Query $crearPacienteScript -ErrorAction Stop
        $pacienteId = $result.PacienteId
        
        Write-Success "   ? Paciente creado/encontrado (ID: $pacienteId)"
        $pacientesCreados++
        
        # Crear 2-3 citas atendidas para cada paciente
        $numeroCitas = Get-Random -Minimum 2 -Maximum 4
        
        for ($i = 0; $i -lt $numeroCitas; $i++) {
            # Crear fecha de cita en el pasado (últimos 3 meses)
            $diasAtras = Get-Random -Minimum 7 -Maximum 90
            $fechaCita = (Get-Date).AddDays(-$diasAtras)
            $horaCita = Get-Random -Minimum 9 -Maximum 17
            $fechaCita = $fechaCita.Date.AddHours($horaCita)
            $inicioCita = $fechaCita.ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss")
            $finCita = $fechaCita.AddMinutes(30).ToUniversalTime().ToString("yyyy-MM-dd HH:mm:ss")
            
            # Motivos de consulta variados
            $motivos = @(
                "Consulta general y revisión de presión arterial",
                "Dolor de cabeza persistente",
                "Seguimiento de tratamiento previo",
                "Chequeo médico preventivo",
                "Molestias estomacales",
                "Dolor de espalda",
                "Consulta por gripe y malestar general",
                "Revisión de resultados de laboratorio"
            )
            $motivoCita = $motivos | Get-Random
            
            $crearCitaScript = @"
-- Crear turno disponible
DECLARE @TurnoId BIGINT;

INSERT INTO agenda_turnos (
    medico_id,
    inicio,
    fin,
    estado,
    creado_en,
    actualizado_en
) VALUES (
    $DoctorId,
    '$inicioCita',
    '$finCita',
    'DISPONIBLE',
    '$ahora',
    '$ahora'
);

SET @TurnoId = SCOPE_IDENTITY();

-- Crear cita ATENDIDA
DECLARE @CitaId BIGINT;

INSERT INTO citas (
    turno_id,
    medico_id,
    paciente_id,
    estado,
    motivo,
    inicio,
    fin,
    creado_por,
    creado_en,
    actualizado_en
) VALUES (
    @TurnoId,
    $DoctorId,
    $pacienteId,
    'ATENDIDA',
    '$motivoCita',
    '$inicioCita',
    '$finCita',
    $pacienteId,
    '$ahora',
    '$ahora'
);

SET @CitaId = SCOPE_IDENTITY();

-- Actualizar estado del turno a RESERVADO
UPDATE agenda_turnos SET estado = 'RESERVADO' WHERE id = @TurnoId;

SELECT @CitaId AS CitaId;
"@
            
            try {
                $citaResult = Invoke-Sqlcmd -ConnectionString $connectionString -Query $crearCitaScript -ErrorAction Stop
                $citaId = $citaResult.CitaId
                
                Write-Info "      ?? Cita creada (ID: $citaId) - Fecha: $($fechaCita.ToString('yyyy-MM-dd HH:mm'))"
                $citasCreadas++
                
                # Agregar historial médico a la cita
                $agregarHistorialScript = @"
DECLARE @CitaId BIGINT = $citaId;

-- Agregar diagnóstico
DECLARE @Diagnosticos TABLE (Codigo VARCHAR(20), Descripcion VARCHAR(300));

INSERT INTO @Diagnosticos (Codigo, Descripcion) VALUES
    ('J00', 'Rinofaringitis aguda (resfriado común)'),
    ('K29.9', 'Gastritis no especificada'),
    ('M54.5', 'Dolor de espalda bajo'),
    ('I10', 'Hipertensión esencial (primaria)'),
    ('E66.9', 'Obesidad no especificada'),
    ('R51', 'Cefalea'),
    ('J06.9', 'Infección aguda de las vías respiratorias superiores'),
    ('K21.9', 'Enfermedad de reflujo gastroesofágico');

-- Insertar un diagnóstico aleatorio
DECLARE @DiagCodigo VARCHAR(20), @DiagDescripcion VARCHAR(300);
SELECT TOP 1 @DiagCodigo = Codigo, @DiagDescripcion = Descripcion 
FROM @Diagnosticos 
ORDER BY NEWID();

INSERT INTO diagnosticos (cita_id, codigo, descripcion, creado_en)
VALUES (@CitaId, @DiagCodigo, @DiagDescripcion, '$ahora');

-- Agregar nota clínica
DECLARE @Notas TABLE (Contenido VARCHAR(MAX));
INSERT INTO @Notas (Contenido) VALUES
    ('Paciente acude a consulta refiriendo malestar general. A la exploración física se encuentra en buen estado general. Signos vitales dentro de parámetros normales. Se indica tratamiento sintomático y se recomienda seguimiento en 7 días.'),
    ('Paciente presenta dolor moderado. Se realiza exploración física completa. No se observan signos de alarma. Se prescribe analgésico y se dan indicaciones de cuidados en casa. Control en una semana.'),
    ('Consulta de seguimiento. Paciente reporta mejoría con el tratamiento previo. Se continúa con el mismo esquema terapéutico. Próxima cita en 15 días para revaloración.'),
    ('Paciente en buen estado general. Se realizan recomendaciones preventivas. Se solicitan estudios de laboratorio de control. Próxima cita para revisión de resultados.');

DECLARE @NotaContenido VARCHAR(MAX);
SELECT TOP 1 @NotaContenido = Contenido 
FROM @Notas 
ORDER BY NEWID();

INSERT INTO notas_clinicas (cita_id, nota, creado_en)
VALUES (@CitaId, @NotaContenido, '$ahora');

-- Agregar receta con medicamentos
DECLARE @RecetaId BIGINT;
INSERT INTO recetas (cita_id, indicaciones, creado_en)
VALUES (@CitaId, 'Tomar los medicamentos con alimentos. No suspender el tratamiento sin indicación médica.', '$ahora');

SET @RecetaId = SCOPE_IDENTITY();

-- Agregar medicamentos a la receta
DECLARE @Medicamentos TABLE (Nombre VARCHAR(150), Dosis VARCHAR(80), Frecuencia VARCHAR(80), Duracion VARCHAR(80));
INSERT INTO @Medicamentos (Nombre, Dosis, Frecuencia, Duracion) VALUES
    ('Paracetamol', '500 mg', 'Cada 8 horas', '5 días'),
    ('Ibuprofeno', '400 mg', 'Cada 8 horas', '3 días'),
    ('Omeprazol', '20 mg', 'Cada 24 horas en ayunas', '7 días'),
    ('Amoxicilina', '500 mg', 'Cada 8 horas', '7 días');

-- Insertar 1-2 medicamentos aleatorios
DECLARE @NumMedicamentos INT = (SELECT CAST(RAND() * 2 + 1 AS INT));
INSERT INTO receta_items (receta_id, medicamento, dosis, frecuencia, duracion)
SELECT TOP (@NumMedicamentos) 
    @RecetaId, 
    Nombre, 
    Dosis, 
    Frecuencia, 
    Duracion
FROM @Medicamentos
ORDER BY NEWID();

PRINT 'Historial médico agregado a la cita';
"@
                
                try {
                    Invoke-Sqlcmd -ConnectionString $connectionString -Query $agregarHistorialScript -ErrorAction Stop | Out-Null
                    Write-Info "      ? Historial médico agregado"
                } catch {
                    Write-Warning "      ?? Error al agregar historial médico: $($_.Exception.Message)"
                }
                
            } catch {
                Write-Error "      ? Error al crear cita: $($_.Exception.Message)"
            }
        }
        
        Write-Host ""
        
    } catch {
        Write-Error "   ? Error al crear paciente: $($_.Exception.Message)"
    }
}

# ====================================================================
# 8. Resumen final
# ====================================================================
Write-Host ""
Write-Success "=========================================="
Write-Success "? Proceso completado"
Write-Success "=========================================="
Write-Host "Pacientes creados: $pacientesCreados"
Write-Host "Citas creadas: $citasCreadas"
Write-Host ""
Write-Info "Credenciales de acceso (todos los pacientes):"
Write-Host "  Password: Paciente123!"
Write-Host ""
Write-Info "Pacientes:"
foreach ($paciente in $pacientes) {
    Write-Host "  - $($paciente.Nombre) $($paciente.Apellido): $($paciente.Email)"
}
Write-Host ""
Write-Success "?? Los pacientes pueden iniciar sesión en: http://localhost:3000"
Write-Success "?? El doctor puede ver su historial en: http://localhost:3000/doctor-auth"
