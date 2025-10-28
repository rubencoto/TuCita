-- ============================================================
-- TuCita - Script de Seeding para SQL SERVER (Azure SQL)
-- ============================================================
-- Este script NO usa stored procedures
-- Compatible con SQL Server y Azure SQL Database
-- ============================================================

-- ?? IMPORTANTE: Reemplaza el password hash con uno generado con BCrypt
-- Para generar el hash, ejecuta este c�digo C# en tu aplicaci�n:
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

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Cardiolog�a')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Cardiolog�a', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Dermatolog�a')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Dermatolog�a', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Pediatr�a')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Pediatr�a', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Medicina General')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Medicina General', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Traumatolog�a')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Traumatolog�a', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Ginecolog�a')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Ginecolog�a', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Oftalmolog�a')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Oftalmolog�a', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Odontolog�a')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Odontolog�a', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Psiquiatr�a')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Psiquiatr�a', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Neurolog�a')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Neurolog�a', GETUTCDATE());

IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Ortopedia')
    INSERT INTO especialidades (nombre, creado_en)
    VALUES ('Ortopedia', GETUTCDATE());

GO

-- ============================================================
-- 3. CREAR M�DICOS DE PRUEBA
-- ============================================================

-- ?? REEMPLAZAR ESTE HASH con uno generado por BCrypt.Net
-- Password: "Doctor123!"
DECLARE @password_hash VARCHAR(255) = '$2a$11$ejemplo.reemplazar.con.hash.real.de.bcrypt.generado.correctamente';

-- Obtener el ID del rol MEDICO
DECLARE @rol_medico BIGINT = (SELECT TOP 1 id FROM roles WHERE nombre = 'MEDICO');

-- Variables para IDs de m�dicos
DECLARE @maria_id BIGINT, @carlos_id BIGINT, @ana_id BIGINT, @roberto_id BIGINT, @elena_id BIGINT, @fernando_id BIGINT;

-- === Dra. Mar�a Gonz�lez - Cardiolog�a ===
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'maria.gonzalez@tucita.com')
BEGIN
    INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('maria.gonzalez@tucita.com', 'maria.gonzalez@tucita.com', @password_hash, 'Mar�a', 'Gonz�lez', '+52 55 1234 5001', 1, DATEADD(YEAR, -5, GETUTCDATE()), GETUTCDATE());
    
    SET @maria_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@maria_id, @rol_medico, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@maria_id, 'LIC-2018-0001', 'M�dico especialista en Cardiolog�a con amplia experiencia en el tratamiento y diagn�stico de pacientes. Comprometido con brindar atenci�n de calidad y calidez humana.', 'Ciudad de M�xico', DATEADD(YEAR, -5, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @maria_id, id FROM especialidades WHERE nombre = 'Cardiolog�a';
END
ELSE
BEGIN
    SET @maria_id = (SELECT id FROM usuarios WHERE email = 'maria.gonzalez@tucita.com');
END

-- === Dr. Carlos Ruiz - Neurolog�a ===
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'carlos.ruiz@tucita.com')
BEGIN
    INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('carlos.ruiz@tucita.com', 'carlos.ruiz@tucita.com', @password_hash, 'Carlos', 'Ruiz', '+52 55 1234 5002', 1, DATEADD(YEAR, -4, GETUTCDATE()), GETUTCDATE());
    
    SET @carlos_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@carlos_id, @rol_medico, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@carlos_id, 'LIC-2019-0002', 'M�dico especialista en Neurolog�a con amplia experiencia en el tratamiento y diagn�stico de pacientes. Comprometido con brindar atenci�n de calidad y calidez humana.', 'Ciudad de M�xico', DATEADD(YEAR, -4, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @carlos_id, id FROM especialidades WHERE nombre = 'Neurolog�a';
END
ELSE
BEGIN
    SET @carlos_id = (SELECT id FROM usuarios WHERE email = 'carlos.ruiz@tucita.com');
END

-- === Dra. Ana Mart�nez - Pediatr�a ===
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'ana.martinez@tucita.com')
BEGIN
    INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('ana.martinez@tucita.com', 'ana.martinez@tucita.com', @password_hash, 'Ana', 'Mart�nez', '+52 33 1234 5003', 1, DATEADD(YEAR, -3, GETUTCDATE()), GETUTCDATE());
    
    SET @ana_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@ana_id, @rol_medico, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@ana_id, 'LIC-2020-0003', 'M�dico especialista en Pediatr�a con amplia experiencia en el tratamiento y diagn�stico de pacientes. Comprometido con brindar atenci�n de calidad y calidez humana.', 'Guadalajara', DATEADD(YEAR, -3, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @ana_id, id FROM especialidades WHERE nombre = 'Pediatr�a';
END
ELSE
BEGIN
    SET @ana_id = (SELECT id FROM usuarios WHERE email = 'ana.martinez@tucita.com');
END

-- === Dr. Roberto L�pez - Ortopedia ===
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'roberto.lopez@tucita.com')
BEGIN
    INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('roberto.lopez@tucita.com', 'roberto.lopez@tucita.com', @password_hash, 'Roberto', 'L�pez', '+52 81 1234 5004', 1, DATEADD(YEAR, -6, GETUTCDATE()), GETUTCDATE());
    
    SET @roberto_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@roberto_id, @rol_medico, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@roberto_id, 'LIC-2017-0004', 'M�dico especialista en Ortopedia con amplia experiencia en el tratamiento y diagn�stico de pacientes. Comprometido con brindar atenci�n de calidad y calidez humana.', 'Monterrey', DATEADD(YEAR, -6, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @roberto_id, id FROM especialidades WHERE nombre = 'Ortopedia';
END
ELSE
BEGIN
    SET @roberto_id = (SELECT id FROM usuarios WHERE email = 'roberto.lopez@tucita.com');
END

-- === Dra. Elena Vargas - Dermatolog�a ===
IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'elena.vargas@tucita.com')
BEGIN
    INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
    VALUES ('elena.vargas@tucita.com', 'elena.vargas@tucita.com', @password_hash, 'Elena', 'Vargas', '+52 55 1234 5005', 1, DATEADD(YEAR, -2, GETUTCDATE()), GETUTCDATE());
    
    SET @elena_id = SCOPE_IDENTITY();
    
    INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) 
    VALUES (@elena_id, @rol_medico, GETUTCDATE());
    
    INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
    VALUES (@elena_id, 'LIC-2021-0005', 'M�dico especialista en Dermatolog�a con amplia experiencia en el tratamiento y diagn�stico de pacientes. Comprometido con brindar atenci�n de calidad y calidez humana.', 'Ciudad de M�xico', DATEADD(YEAR, -2, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @elena_id, id FROM especialidades WHERE nombre = 'Dermatolog�a';
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
    VALUES (@fernando_id, 'LIC-2016-0006', 'M�dico especialista en Medicina General con amplia experiencia en el tratamiento y diagn�stico de pacientes. Comprometido con brindar atenci�n de calidad y calidez humana.', 'Puebla', DATEADD(YEAR, -7, GETUTCDATE()), GETUTCDATE());
    
    INSERT INTO medico_especialidad (medico_id, especialidad_id) 
    SELECT @fernando_id, id FROM especialidades WHERE nombre = 'Medicina General';
END
ELSE
BEGIN
    SET @fernando_id = (SELECT id FROM usuarios WHERE email = 'fernando.silva@tucita.com');
END

GO

-- ============================================================
-- 4. CREAR TURNOS - MAR�A GONZ�LEZ
-- ============================================================

-- Obtener ID de Mar�a Gonz�lez
DECLARE @maria_id BIGINT = (SELECT id FROM usuarios WHERE email = 'maria.gonzalez@tucita.com');

-- D�a 1 (Ma�ana)
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
    
    -- D�a 1 (Tarde)
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:00:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:30:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('17:00:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('17:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('17:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('17:30:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('18:00:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());

    -- D�a 2
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@maria_id, DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('11:00:00' AS DATETIME)), DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('11:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@maria_id, DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:00:00' AS DATETIME)), DATEADD(DAY, 2, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('16:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

GO

-- ?? NOTA: Por brevedad, solo se muestran algunos turnos de ejemplo
-- En producci�n, replicar el mismo patr�n para:
-- - M�s d�as (3-10 d�as siguientes)
-- - Todos los dem�s m�dicos (@carlos_id, @ana_id, @roberto_id, @elena_id, @fernando_id)

-- ============================================================
-- 5. TURNOS PARA OTROS M�DICOS (SIMPLIFICADO - 1 D�A CADA UNO)
-- ============================================================

-- Variables para IDs
DECLARE @carlos_id BIGINT = (SELECT id FROM usuarios WHERE email = 'carlos.ruiz@tucita.com');
DECLARE @ana_id BIGINT = (SELECT id FROM usuarios WHERE email = 'ana.martinez@tucita.com');
DECLARE @roberto_id BIGINT = (SELECT id FROM usuarios WHERE email = 'roberto.lopez@tucita.com');
DECLARE @elena_id BIGINT = (SELECT id FROM usuarios WHERE email = 'elena.vargas@tucita.com');
DECLARE @fernando_id BIGINT = (SELECT id FROM usuarios WHERE email = 'fernando.silva@tucita.com');

-- Carlos Ruiz - D�a 1
IF @carlos_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@carlos_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@carlos_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@carlos_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

-- Ana Mart�nez - D�a 1
IF @ana_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@ana_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@ana_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@ana_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

-- Roberto L�pez - D�a 1
IF @roberto_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@roberto_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@roberto_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@roberto_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

-- Elena Vargas - D�a 1
IF @elena_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@elena_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@elena_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@elena_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

-- Fernando Silva - D�a 1
IF @fernando_id IS NOT NULL
BEGIN
    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
    (@fernando_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('09:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@fernando_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('10:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE()),
    (@fernando_id, DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:00:00' AS DATETIME)), DATEADD(DAY, 1, CAST(CAST(GETDATE() AS DATE) AS DATETIME) + CAST('15:30:00' AS DATETIME)), 'DISPONIBLE', GETUTCDATE(), GETUTCDATE());
END

GO

-- ============================================================
-- 6. VERIFICACI�N
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

PRINT 'M�dicos creados: ' + CAST(@count_medicos AS VARCHAR);
PRINT 'Turnos creados: ' + CAST(@count_turnos AS VARCHAR);
PRINT '';
PRINT '? Script completado!';
PRINT '??  RECUERDA: Reemplazar el password hash antes de ejecutar';

GO
