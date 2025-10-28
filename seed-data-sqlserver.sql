-- ============================================================
-- TuCita - Script de Seeding para SQL SERVER (Azure SQL)
-- ============================================================
-- Este script NO usa stored procedures
-- Compatible con SQL Server y Azure SQL Database
-- ============================================================

-- ?? IMPORTANTE: Reemplaza el password hash con uno generado con BCrypt
-- Para generar el hash, ejecuta este código C# en tu aplicación:
-- string hash = BCrypt.Net.BCrypt.HashPassword("Doctor123!");
-- Luego reemplaza todos los hashes en este script

SET NOCOUNT ON;
GO

-- ============================================================
-- 1. CREAR ROLES
-- ============================================================

-- SQL Server usa MERGE o IF NOT EXISTS en lugar de INSERT IGNORE
IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'PACIENTE')
    INSERT INTO roles (nombre, creado_en, actualizado_en)
    VALUES ('PACIENTE', GETUTCDATE(), GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'MEDICO')
    INSERT INTO roles (nombre, creado_en, actualizado_en)
    VALUES ('MEDICO', GETUTCDATE(), GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'RECEPCION')
    INSERT INTO roles (nombre, creado_en, actualizado_en)
    VALUES ('RECEPCION', GETUTCDATE(), GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'ADMIN')
    INSERT INTO roles (nombre, creado_en, actualizado_en)
    VALUES ('ADMIN', GETUTCDATE(), GETUTCDATE());

GO

-- ============================================================
-- 2. CREAR ESPECIALIDADES
-- ============================================================

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Cardiología')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Cardiología', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Dermatología')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Dermatología', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Pediatría')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Pediatría', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Medicina General')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Medicina General', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Traumatología')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Traumatología', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Ginecología')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Ginecología', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Oftalmología')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Oftalmología', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Odontología')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Odontología', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Psiquiatría')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Psiquiatría', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Neurología')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Neurología', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Ortopedia')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Ortopedia', GETUTCDATE());

GO

-- ============================================================
-- 3. CREAR MÉDICOS DE PRUEBA
-- ============================================================

-- ?? REEMPLAZAR ESTE HASH con uno generado por BCrypt.Net
-- Password: "Doctor123!"
DECLARE @password_hash VARCHAR(255) = '$2a$11$ejemplo.reemplazar.con.hash.real.de.bcrypt.generado.correctamente';

-- Obtener el ID del rol MEDICO
DECLARE @rol_medico BIGINT = (SELECT TOP 1 id FROM roles WHERE nombre = 'MEDICO');

-- Variables para IDs de médicos
DECLARE @maria_id BIGINT, @carlos_id BIGINT, @ana_id BIGINT, @roberto_id BIGINT, @elena_id BIGINT, @fernando_id BIGINT;

-- === Dra. María González - Cardiología ===
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'maria.gonzalez@tucita.com')
BEGIN
    INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('maria.gonzalez@tucita.com', 'maria.gonzalez@tucita.com', @password_hash, 'María', 'González', '+52 55 1234 5001', 1, DATEADD(YEAR, -5, GETUTCDATE()), GETUTCDATE());
    
    SET @maria_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@maria_id, @rol_medico, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@maria_id, 'LIC-2018-0001', 'Médico especialista en Cardiología con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Ciudad de México', DATEADD(YEAR, -5, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @maria_id, id FROM especialidades WHERE nombre = 'Cardiología';
END
ELSE
BEGIN
    SET @maria_id = (SELECT id FROM usuarios WHERE email = 'maria.gonzalez@tucita.com');
END

-- === Dr. Carlos Ruiz - Neurología ===
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'carlos.ruiz@tucita.com')
BEGIN
    INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('carlos.ruiz@tucita.com', 'carlos.ruiz@tucita.com', @password_hash, 'Carlos', 'Ruiz', '+52 55 1234 5002', 1, DATEADD(YEAR, -4, GETUTCDATE()), GETUTCDATE());
    
    SET @carlos_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@carlos_id, @rol_medico, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@carlos_id, 'LIC-2019-0002', 'Médico especialista en Neurología con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Ciudad de México', DATEADD(YEAR, -4, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @carlos_id, id FROM especialidades WHERE nombre = 'Neurología';
END
ELSE
BEGIN
    SET @carlos_id = (SELECT id FROM usuarios WHERE email = 'carlos.ruiz@tucita.com');
END

-- === Dra. Ana Martínez - Pediatría ===
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'ana.martinez@tucita.com')
BEGIN
    INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('ana.martinez@tucita.com', 'ana.martinez@tucita.com', @password_hash, 'Ana', 'Martínez', '+52 33 1234 5003', 1, DATEADD(YEAR, -3, GETUTCDATE()), GETUTCDATE());
    
    SET @ana_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@ana_id, @rol_medico, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@ana_id, 'LIC-2020-0003', 'Médico especialista en Pediatría con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Guadalajara', DATEADD(YEAR, -3, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @ana_id, id FROM especialidades WHERE nombre = 'Pediatría';
END
ELSE
BEGIN
    SET @ana_id = (SELECT id FROM usuarios WHERE email = 'ana.martinez@tucita.com');
END

-- === Dr. Roberto López - Ortopedia ===
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'roberto.lopez@tucita.com')
BEGIN
    INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('roberto.lopez@tucita.com', 'roberto.lopez@tucita.com', @password_hash, 'Roberto', 'López', '+52 81 1234 5004', 1, DATEADD(YEAR, -6, GETUTCDATE()), GETUTCDATE());
    
    SET @roberto_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@roberto_id, @rol_medico, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@roberto_id, 'LIC-2017-0004', 'Médico especialista en Ortopedia con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Monterrey', DATEADD(YEAR, -6, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @roberto_id, id FROM especialidades WHERE nombre = 'Ortopedia';
END
ELSE
BEGIN
    SET @roberto_id = (SELECT id FROM usuarios WHERE email = 'roberto.lopez@tucita.com');
END

-- === Dra. Elena Vargas - Dermatología ===
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'elena.vargas@tucita.com')
BEGIN
    INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('elena.vargas@tucita.com', 'elena.vargas@tucita.com', @password_hash, 'Elena', 'Vargas', '+52 55 1234 5005', 1, DATEADD(YEAR, -2, GETUTCDATE()), GETUTCDATE());
    
    SET @elena_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@elena_id, @rol_medico, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@elena_id, 'LIC-2021-0005', 'Médico especialista en Dermatología con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Ciudad de México', DATEADD(YEAR, -2, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @elena_id, id FROM especialidades WHERE nombre = 'Dermatología';
END
ELSE
BEGIN
    SET @elena_id = (SELECT id FROM usuarios WHERE email = 'elena.vargas@tucita.com');
END

-- === Dr. Fernando Silva - Medicina General ===
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'fernando.silva@tucita.com')
BEGIN
    INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('fernando.silva@tucita.com', 'fernando.silva@tucita.com', @password_hash, 'Fernando', 'Silva', '+52 22 1234 5006', 1, DATEADD(YEAR, -7, GETUTCDATE()), GETUTCDATE());
    
    SET @fernando_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@fernando_id, @rol_medico, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@fernando_id, 'LIC-2016-0006', 'Médico especialista en Medicina General con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Puebla', DATEADD(YEAR, -7, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @fernando_id, id FROM especialidades WHERE nombre = 'Medicina General';
END
ELSE
BEGIN
    SET @fernando_id = (SELECT id FROM usuarios WHERE email = 'fernando.silva@tucita.com');
END

GO

-- ============================================================
-- 4. CREAR TURNOS - MARÍA GONZÁLEZ
-- ============================================================

-- Obtener ID de María González
DECLARE @maria_id BIGINT = (SELECT id FROM usuarios WHERE email = 'maria.gonzalez@tucita.com');

-- Día 1 (Mañana)
IF @maria_id IS NOT NULL
BEGIN
    -- Eliminar turnos existentes para evitar duplicados (opcional)
    -- DELETE FROM agenda_turnos WHERE medico_id = @maria_id AND inicio >= CAST(GETDATE() AS DATE);

    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('11:00:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('11:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('11:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('11:30:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('12:00:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('12:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('12:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('12:30:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('13:00:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
    
    -- Día 1 (Tarde)
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:00:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:30:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('17:00:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('17:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('17:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('17:30:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('18:00:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());

    -- Día 2
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@maria_id, DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('11:00:00' AS DATETIME)), DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('11:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:00:00' AS DATETIME)), DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

GO

-- ?? NOTA: Por brevedad, solo se muestran algunos turnos de ejemplo
-- En producción, replicar el mismo patrón para:
-- - Más días (3-10 días siguientes)
-- - Todos los demás médicos (@carlos_id, @ana_id, @roberto_id, @elena_id, @fernando_id)

-- ============================================================
-- 5. TURNOS PARA OTROS MÉDICOS (SIMPLIFICADO - 1 DÍA CADA UNO)
-- ============================================================

-- Variables para IDs
DECLARE @carlos_id BIGINT = (SELECT id FROM usuarios WHERE email = 'carlos.ruiz@tucita.com');
DECLARE @ana_id BIGINT = (SELECT id FROM usuarios WHERE email = 'ana.martinez@tucita.com');
DECLARE @roberto_id BIGINT = (SELECT id FROM usuarios WHERE email = 'roberto.lopez@tucita.com');
DECLARE @elena_id BIGINT = (SELECT id FROM usuarios WHERE email = 'elena.vargas@tucita.com');
DECLARE @fernando_id BIGINT = (SELECT id FROM usuarios WHERE email = 'fernando.silva@tucita.com');

-- Carlos Ruiz - Día 1
IF @carlos_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@carlos_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@carlos_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@carlos_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

-- Ana Martínez - Día 1
IF @ana_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@ana_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@ana_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@ana_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

-- Roberto López - Día 1
IF @roberto_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@roberto_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@roberto_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@roberto_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

-- Elena Vargas - Día 1
IF @elena_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@elena_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@elena_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@elena_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

-- Fernando Silva - Día 1
IF @fernando_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@fernando_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@fernando_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@fernando_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

GO

-- ============================================================
-- 6. VERIFICACIÓN
-- ============================================================

PRINT '--- RESUMEN DE DATOS CREADOS ---';
PRINT '';

DECLARE @count_medicos INT, @count_turnos INT;

SELECT @count_medicos = COUNT(*) 
FROM perfil_medico pm
INNER JOIN usuarios u ON pm.usuario_id = u.id
WHERE u.email IN (
    'maria.gonzalez@tucita.com',
    'carlos.ruiz@tucita.com',
    'ana.martinez@tucita.com',
    'roberto.lopez@tucita.com',
    'elena.vargas@tucita.com',
    'fernando.silva@tucita.com'
);

SELECT @count_turnos = COUNT(*) 
FROM agenda_turnos at
INNER JOIN usuarios u ON at.medico_id = u.id
WHERE u.email IN (
    'maria.gonzalez@tucita.com',
    'carlos.ruiz@tucita.com',
    'ana.martinez@tucita.com',
    'roberto.lopez@tucita.com',
    'elena.vargas@tucita.com',
    'fernando.silva@tucita.com'
);

PRINT 'Médicos creados: ' + CAST(@count_medicos AS VARCHAR);
PRINT 'Turnos creados: ' + CAST(@count_turnos AS VARCHAR);
PRINT '';
PRINT '? Script completado!';
PRINT '??  RECUERDA: Reemplazar el password hash antes de ejecutar';

GO
