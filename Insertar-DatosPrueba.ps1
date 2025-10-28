# ============================================================
# Script de PowerShell para Insertar Datos de Prueba en Azure SQL
# TuCita - Sistema de Gestión de Citas Médicas
# ============================================================

param(
    [string]$Server = "tco-cr.database.windows.net",
    [string]$Database = "tco_db",
    [string]$Username = "tcoadmin",
    [string]$Password = "",
    [string]$DoctorPassword = "Doctor123!"
)

# Colores para output
function Write-Success { param($Message) Write-Host $Message -ForegroundColor Green }
function Write-Info { param($Message) Write-Host $Message -ForegroundColor Cyan }
function Write-Warning { param($Message) Write-Host $Message -ForegroundColor Yellow }
function Write-Error { param($Message) Write-Host $Message -ForegroundColor Red }

Write-Host "??????????????????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host "?     TuCita - Inserción de Datos de Prueba                 ?" -ForegroundColor Cyan
Write-Host "?     Base de Datos: Azure SQL Server                       ?" -ForegroundColor Cyan
Write-Host "??????????????????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host ""

# ============================================================
# 1. VALIDAR DEPENDENCIAS
# ============================================================

Write-Info "?? Verificando dependencias..."

# Verificar si existe el módulo SqlServer
$sqlModule = Get-Module -ListAvailable -Name SqlServer
if (-not $sqlModule) {
    Write-Warning "??  Módulo SqlServer no encontrado. Instalando..."
    try {
        Install-Module -Name SqlServer -Force -AllowClobber -Scope CurrentUser
        Write-Success "? Módulo SqlServer instalado correctamente"
    }
    catch {
        Write-Error "? Error al instalar el módulo SqlServer: $_"
        Write-Info "Intenta instalar manualmente: Install-Module -Name SqlServer -Force"
        exit 1
    }
}
else {
    Write-Success "? Módulo SqlServer ya está instalado"
}

Import-Module SqlServer -ErrorAction Stop

# ============================================================
# 2. GENERAR HASH DE BCRYPT
# ============================================================

Write-Info "`n?? Generando hash BCrypt para password: $DoctorPassword"

try {
    # Compilar y ejecutar el generador de hash
    $hashGeneratorPath = Join-Path $PSScriptRoot "Tools\HashGenerator\HashGenerator.csproj"
    
    if (Test-Path $hashGeneratorPath) {
        $hashOutput = dotnet run --project $hashGeneratorPath --no-build 2>&1 | Out-String
        
        # Buscar el hash en el output (formato $2a$11$...)
        if ($hashOutput -match '\$2a\$\d+\$[A-Za-z0-9./]{53}') {
            $passwordHash = $Matches[0]
            Write-Success "? Hash generado: $passwordHash"
        }
        else {
            # Usar hash pre-generado como fallback
            Write-Warning "??  No se pudo generar hash dinámicamente. Usando hash pre-generado."
            $passwordHash = '$2a$11$xE1cR9n4L0P5vZ8K2.4mV.YQR9h/cIPz0gi.URNNX3kh2OPST9/Pg'
            Write-Info "Hash utilizado: $passwordHash"
        }
    }
    else {
        Write-Warning "??  Generador no encontrado. Usando hash pre-generado."
        $passwordHash = '$2a$11$xE1cR9n4L0P5vZ8K2.4mV.YQR9h/cIPz0gi.URNNX3kh2OPST9/Pg'
    }
}
catch {
    Write-Warning "??  Error al generar hash. Usando hash pre-generado."
    $passwordHash = '$2a$11$xE1cR9n4L0P5vZ8K2.4mV.YQR9h/cIPz0gi.URNNX3kh2OPST9/Pg'
}

# ============================================================
# 3. SOLICITAR CREDENCIALES SI NO SE PROPORCIONARON
# ============================================================

if ([string]::IsNullOrWhiteSpace($Password)) {
    Write-Info "`n?? Ingresa la contraseña de Azure SQL:"
    $securePassword = Read-Host "Password para $Username" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

# ============================================================
# 4. CONSTRUIR CADENA DE CONEXIÓN
# ============================================================

$connectionString = "Server=$Server;Database=$Database;User Id=$Username;Password=$Password;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"

Write-Info "`n?? Conectando a Azure SQL..."
Write-Info "   Servidor: $Server"
Write-Info "   Base de datos: $Database"
Write-Info "   Usuario: $Username"

# ============================================================
# 5. FUNCIÓN PARA EJECUTAR QUERIES
# ============================================================

function Invoke-SqlQuery {
    param(
        [string]$Query,
        [string]$Description
    )
    
    try {
        Write-Info "`n? $Description..."
        $result = Invoke-Sqlcmd -ConnectionString $connectionString -Query $Query -ErrorAction Stop
        Write-Success "? $Description completado"
        return $result
    }
    catch {
        Write-Error "? Error en $Description"
        Write-Error "   Detalle: $($_.Exception.Message)"
        throw
    }
}

# ============================================================
# 6. VERIFICAR CONEXIÓN
# ============================================================

try {
    Invoke-SqlQuery -Query "SELECT 1 AS Test" -Description "Verificando conexión"
}
catch {
    Write-Error "`n? No se pudo conectar a la base de datos"
    Write-Error "Verifica:"
    Write-Error "  1. Credenciales correctas"
    Write-Error "  2. Firewall de Azure permite tu IP"
    Write-Error "  3. Base de datos existe"
    exit 1
}

# ============================================================
# 7. INSERTAR ROLES
# ============================================================

Write-Info "`n?? Insertando datos..."

$rolesQuery = @"
IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'PACIENTE')
    INSERT INTO roles (nombre, creado_en, actualizado_en) VALUES ('PACIENTE', GETUTCDATE(), GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'MEDICO')
    INSERT INTO roles (nombre, creado_en, actualizado_en) VALUES ('MEDICO', GETUTCDATE(), GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'RECEPCION')
    INSERT INTO roles (nombre, creado_en, actualizado_en) VALUES ('RECEPCION', GETUTCDATE(), GETUTCDATE());
IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'ADMIN')
    INSERT INTO roles (nombre, creado_en, actualizado_en) VALUES ('ADMIN', GETUTCDATE(), GETUTCDATE());
"@

Invoke-SqlQuery -Query $rolesQuery -Description "Insertando roles"

# ============================================================
# 8. INSERTAR ESPECIALIDADES
# ============================================================

$especialidadesQuery = @"
DECLARE @especialidades TABLE (nombre VARCHAR(120));
INSERT INTO @especialidades VALUES 
    ('Cardiología'), ('Dermatología'), ('Pediatría'), ('Medicina General'),
    ('Traumatología'), ('Ginecología'), ('Oftalmología'), ('Odontología'),
    ('Psiquiatría'), ('Neurología'), ('Ortopedia');

INSERT INTO especialidades (nombre, creado_en)
SELECT nombre, GETUTCDATE()
FROM @especialidades e
WHERE NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = e.nombre);
"@

Invoke-SqlQuery -Query $especialidadesQuery -Description "Insertando especialidades"

# ============================================================
# 9. INSERTAR MÉDICOS
# ============================================================

$medicos = @(
    @{
        Email = "maria.gonzalez@tucita.com"
        Nombre = "María"
        Apellido = "González"
        Telefono = "+52 55 1234 5001"
        Licencia = "LIC-2018-0001"
        Especialidad = "Cardiología"
        Direccion = "Ciudad de México"
        AnosExperiencia = 5
    },
    @{
        Email = "carlos.ruiz@tucita.com"
        Nombre = "Carlos"
        Apellido = "Ruiz"
        Telefono = "+52 55 1234 5002"
        Licencia = "LIC-2019-0002"
        Especialidad = "Neurología"
        Direccion = "Ciudad de México"
        AnosExperiencia = 4
    },
    @{
        Email = "ana.martinez@tucita.com"
        Nombre = "Ana"
        Apellido = "Martínez"
        Telefono = "+52 33 1234 5003"
        Licencia = "LIC-2020-0003"
        Especialidad = "Pediatría"
        Direccion = "Guadalajara"
        AnosExperiencia = 3
    },
    @{
        Email = "roberto.lopez@tucita.com"
        Nombre = "Roberto"
        Apellido = "López"
        Telefono = "+52 81 1234 5004"
        Licencia = "LIC-2017-0004"
        Especialidad = "Ortopedia"
        Direccion = "Monterrey"
        AnosExperiencia = 6
    },
    @{
        Email = "elena.vargas@tucita.com"
        Nombre = "Elena"
        Apellido = "Vargas"
        Telefono = "+52 55 1234 5005"
        Licencia = "LIC-2021-0005"
        Especialidad = "Dermatología"
        Direccion = "Ciudad de México"
        AnosExperiencia = 2
    },
    @{
        Email = "fernando.silva@tucita.com"
        Nombre = "Fernando"
        Apellido = "Silva"
        Telefono = "+52 22 1234 5006"
        Licencia = "LIC-2016-0006"
        Especialidad = "Medicina General"
        Direccion = "Puebla"
        AnosExperiencia = 7
    }
)

Write-Info "`n????? Insertando médicos..."

$rolMedicoId = Invoke-SqlQuery -Query "SELECT id FROM roles WHERE nombre = 'MEDICO'" -Description "Obteniendo ID rol MEDICO"
$rolMedicoId = $rolMedicoId.id

foreach ($medico in $medicos) {
    $biografia = "Médico especialista en $($medico.Especialidad) con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana."
    
    $insertMedicoQuery = @"
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = '$($medico.Email)')
BEGIN
    DECLARE @usuario_id BIGINT;
    
    INSERT INTO usuarios (email, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('$($medico.Email)', '$passwordHash', '$($medico.Nombre)', '$($medico.Apellido)', '$($medico.Telefono)', 1, 
            DATEADD(YEAR, -$($medico.AnosExperiencia), GETUTCDATE()), GETUTCDATE());
    
    SET @usuario_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@usuario_id, $rolMedicoId, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@usuario_id, '$($medico.Licencia)', '$biografia', '$($medico.Direccion)', 
            DATEADD(YEAR, -$($medico.AnosExperiencia), GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id)
    SELECT @usuario_id, id FROM especialidades WHERE nombre = '$($medico.Especialidad)';
    
    SELECT @usuario_id AS usuario_id;
END
"@
    
    try {
        Invoke-SqlQuery -Query $insertMedicoQuery -Description "Insertando Dr(a). $($medico.Nombre) $($medico.Apellido)"
    }
    catch {
        Write-Warning "??  Dr(a). $($medico.Nombre) $($medico.Apellido) ya existe, continuando..."
    }
}

# ============================================================
# 10. INSERTAR TURNOS (SLOTS)
# ============================================================

Write-Info "`n?? Insertando turnos disponibles..."

# Función para generar turnos
function New-TurnosSql {
    param(
        [string]$Email,
        [int]$Dia,
        [string[]]$Horarios
    )
    
    $queries = @()
    
    foreach ($horario in $Horarios) {
        $inicio = $horario.Split('-')[0].Trim()
        $fin = $horario.Split('-')[1].Trim()
        
        $queries += @"
    (@medico_id, DATEADD(DAY, $Dia, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('$inicio' AS DATETIME)), 
                 DATEADD(DAY, $Dia, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('$fin' AS DATETIME)), 
                 'DISPONIBLE', GETUTCDATE(), GETUTCDATE())
"@
    }
    
    return $queries -join ",`n"
}

# Turnos para María González (más completos)
$mariaHorariosDia1 = @(
    '09:00:00-09:30:00', '09:30:00-10:00:00', '10:00:00-10:30:00', '10:30:00-11:00:00',
    '11:00:00-11:30:00', '11:30:00-12:00:00', '12:00:00-12:30:00', '12:30:00-13:00:00',
    '15:00:00-15:30:00', '15:30:00-16:00:00', '16:00:00-16:30:00', '16:30:00-17:00:00',
    '17:00:00-17:30:00', '17:30:00-18:00:00'
)

$mariaHorariosDia2 = @(
    '09:00:00-09:30:00', '10:00:00-10:30:00', '11:00:00-11:30:00',
    '15:00:00-15:30:00', '16:00:00-16:30:00'
)

$mariaTurnosQuery = @"
DECLARE @medico_id BIGINT = (SELECT id FROM usuarios WHERE email = 'maria.gonzalez@tucita.com');
IF @medico_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
$(New-TurnosSql -Email 'maria.gonzalez@tucita.com' -Dia 1 -Horarios $mariaHorariosDia1),
$(New-TurnosSql -Email 'maria.gonzalez@tucita.com' -Dia 2 -Horarios $mariaHorariosDia2);
END
"@

Invoke-SqlQuery -Query $mariaTurnosQuery -Description "Insertando turnos para Dra. María González"

# Turnos para otros médicos (simplificado)
$horariosSimples = @('09:00:00-09:30:00', '10:00:00-10:30:00', '15:00:00-15:30:00')

$otrosMedicos = @(
    'carlos.ruiz@tucita.com',
    'ana.martinez@tucita.com',
    'roberto.lopez@tucita.com',
    'elena.vargas@tucita.com',
    'fernando.silva@tucita.com'
)

foreach ($email in $otrosMedicos) {
    $turnosQuery = @"
DECLARE @medico_id BIGINT = (SELECT id FROM usuarios WHERE email = '$email');
IF @medico_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
$(New-TurnosSql -Email $email -Dia 1 -Horarios $horariosSimples);
END
"@
    
    $nombre = $email.Split('@')[0].Split('.') | ForEach-Object { (Get-Culture).TextInfo.ToTitleCase($_) }
    Invoke-SqlQuery -Query $turnosQuery -Description "Insertando turnos para Dr(a). $($nombre -join ' ')"
}

# ============================================================
# 11. VERIFICACIÓN FINAL
# ============================================================

Write-Info "`n?? Verificando datos insertados..."

$verificacionQuery = @"
SELECT 
    'Roles' AS Tabla, 
    CAST(COUNT(*) AS VARCHAR) AS Total 
FROM roles

UNION ALL

SELECT 
    'Especialidades', 
    CAST(COUNT(*) AS VARCHAR) 
FROM especialidades

UNION ALL

SELECT 
    'Usuarios', 
    CAST(COUNT(*) AS VARCHAR) 
FROM usuarios

UNION ALL

SELECT 
    'Médicos', 
    CAST(COUNT(*) AS VARCHAR) 
FROM perfil_medico

UNION ALL

SELECT 
    'Turnos Disponibles', 
    CAST(COUNT(*) AS VARCHAR) 
FROM agenda_turnos 
WHERE estado = 'DISPONIBLE' AND inicio >= GETDATE();
"@

$resultados = Invoke-SqlQuery -Query $verificacionQuery -Description "Obteniendo resumen"

Write-Host "`n??????????????????????????????????????????????????????????????" -ForegroundColor Green
Write-Host "?            RESUMEN DE DATOS INSERTADOS                    ?" -ForegroundColor Green
Write-Host "??????????????????????????????????????????????????????????????" -ForegroundColor Green
Write-Host ""

$resultados | Format-Table -AutoSize

# ============================================================
# 12. INFORMACIÓN DE ACCESO
# ============================================================

Write-Host "??????????????????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host "?              CREDENCIALES DE PRUEBA                        ?" -ForegroundColor Cyan
Write-Host "??????????????????????????????????????????????????????????????" -ForegroundColor Cyan
Write-Host ""
Write-Host "Todos los médicos tienen la misma contraseña: $DoctorPassword" -ForegroundColor Yellow
Write-Host ""
Write-Host "Médicos disponibles:" -ForegroundColor Cyan
foreach ($medico in $medicos) {
    Write-Host "  ?? $($medico.Email)" -ForegroundColor White
    Write-Host "     ?? Dr(a). $($medico.Nombre) $($medico.Apellido)" -ForegroundColor Gray
    Write-Host "     ?? $($medico.Especialidad) - $($medico.Direccion)" -ForegroundColor Gray
    Write-Host ""
}

Write-Success "`n? ¡Script completado exitosamente!"
Write-Info "?? Ahora puedes ejecutar tu aplicación con: dotnet run"
Write-Host ""
