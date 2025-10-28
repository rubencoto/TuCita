-- ============================================================
-- TuCita - Script de Seeding SIMPLIFICADO para Azure MySQL
-- ============================================================
-- Este script NO usa stored procedures
-- Compatible con restricciones de Azure MySQL
-- ============================================================

-- ?? IMPORTANTE: Reemplaza el password hash con uno generado con BCrypt
-- Para generar el hash, ejecuta este código C# en tu aplicación:
-- string hash = BCrypt.Net.BCrypt.HashPassword("Doctor123!");
-- Luego reemplaza todos los hashes en este script

-- ============================================================
-- 1. CREAR ROLES
-- ============================================================

INSERT IGNORE INTO roles (nombre, creado_en, actualizado_en)
VALUES 
    ('PACIENTE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('MEDICO', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('RECEPCION', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('ADMIN', UTC_TIMESTAMP(), UTC_TIMESTAMP());

-- ============================================================
-- 2. CREAR ESPECIALIDADES
-- ============================================================

INSERT IGNORE INTO especialidades (nombre, creado_en)
VALUES 
    ('Cardiología', UTC_TIMESTAMP()),
    ('Dermatología', UTC_TIMESTAMP()),
    ('Pediatría', UTC_TIMESTAMP()),
    ('Medicina General', UTC_TIMESTAMP()),
    ('Traumatología', UTC_TIMESTAMP()),
    ('Ginecología', UTC_TIMESTAMP()),
    ('Oftalmología', UTC_TIMESTAMP()),
    ('Odontología', UTC_TIMESTAMP()),
    ('Psiquiatría', UTC_TIMESTAMP()),
    ('Neurología', UTC_TIMESTAMP()),
    ('Ortopedia', UTC_TIMESTAMP());

-- ============================================================
-- 3. CREAR MÉDICOS DE PRUEBA
-- ============================================================

-- ?? REEMPLAZAR ESTE HASH con uno generado por BCrypt.Net
-- Password: "Doctor123!"
SET @password_hash = '$2a$11$ejemplo.reemplazar.con.hash.real.de.bcrypt.generado.correctamente';

-- Obtener el ID del rol MEDICO
SET @rol_medico = (SELECT id FROM roles WHERE nombre = 'MEDICO' LIMIT 1);

-- === Dra. María González - Cardiología ===
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES ('maria.gonzalez@tucita.com', 'maria.gonzalez@tucita.com', @password_hash, 'María', 'González', '+52 55 1234 5001', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 YEAR), UTC_TIMESTAMP());
SET @maria_id = LAST_INSERT_ID();
INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) VALUES (@maria_id, @rol_medico, UTC_TIMESTAMP());
INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (@maria_id, 'LIC-2018-0001', 'Médico especialista en Cardiología con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Ciudad de México', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 YEAR), UTC_TIMESTAMP());
INSERT INTO medico_especialidad (medico_id, especialidad_id) SELECT @maria_id, id FROM especialidades WHERE nombre = 'Cardiología' LIMIT 1;

-- === Dr. Carlos Ruiz - Neurología ===
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES ('carlos.ruiz@tucita.com', 'carlos.ruiz@tucita.com', @password_hash, 'Carlos', 'Ruiz', '+52 55 1234 5002', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4 YEAR), UTC_TIMESTAMP());
SET @carlos_id = LAST_INSERT_ID();
INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) VALUES (@carlos_id, @rol_medico, UTC_TIMESTAMP());
INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (@carlos_id, 'LIC-2019-0002', 'Médico especialista en Neurología con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Ciudad de México', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4 YEAR), UTC_TIMESTAMP());
INSERT INTO medico_especialidad (medico_id, especialidad_id) SELECT @carlos_id, id FROM especialidades WHERE nombre = 'Neurología' LIMIT 1;

-- === Dra. Ana Martínez - Pediatría ===
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES ('ana.martinez@tucita.com', 'ana.martinez@tucita.com', @password_hash, 'Ana', 'Martínez', '+52 33 1234 5003', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 YEAR), UTC_TIMESTAMP());
SET @ana_id = LAST_INSERT_ID();
INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) VALUES (@ana_id, @rol_medico, UTC_TIMESTAMP());
INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (@ana_id, 'LIC-2020-0003', 'Médico especialista en Pediatría con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Guadalajara', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 YEAR), UTC_TIMESTAMP());
INSERT INTO medico_especialidad (medico_id, especialidad_id) SELECT @ana_id, id FROM especialidades WHERE nombre = 'Pediatría' LIMIT 1;

-- === Dr. Roberto López - Ortopedia ===
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES ('roberto.lopez@tucita.com', 'roberto.lopez@tucita.com', @password_hash, 'Roberto', 'López', '+52 81 1234 5004', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 6 YEAR), UTC_TIMESTAMP());
SET @roberto_id = LAST_INSERT_ID();
INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) VALUES (@roberto_id, @rol_medico, UTC_TIMESTAMP());
INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (@roberto_id, 'LIC-2017-0004', 'Médico especialista en Ortopedia con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Monterrey', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 6 YEAR), UTC_TIMESTAMP());
INSERT INTO medico_especialidad (medico_id, especialidad_id) SELECT @roberto_id, id FROM especialidades WHERE nombre = 'Ortopedia' LIMIT 1;

-- === Dra. Elena Vargas - Dermatología ===
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES ('elena.vargas@tucita.com', 'elena.vargas@tucita.com', @password_hash, 'Elena', 'Vargas', '+52 55 1234 5005', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 YEAR), UTC_TIMESTAMP());
SET @elena_id = LAST_INSERT_ID();
INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) VALUES (@elena_id, @rol_medico, UTC_TIMESTAMP());
INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (@elena_id, 'LIC-2021-0005', 'Médico especialista en Dermatología con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Ciudad de México', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 YEAR), UTC_TIMESTAMP());
INSERT INTO medico_especialidad (medico_id, especialidad_id) SELECT @elena_id, id FROM especialidades WHERE nombre = 'Dermatología' LIMIT 1;

-- === Dr. Fernando Silva - Medicina General ===
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES ('fernando.silva@tucita.com', 'fernando.silva@tucita.com', @password_hash, 'Fernando', 'Silva', '+52 22 1234 5006', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 YEAR), UTC_TIMESTAMP());
SET @fernando_id = LAST_INSERT_ID();
INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en) VALUES (@fernando_id, @rol_medico, UTC_TIMESTAMP());
INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (@fernando_id, 'LIC-2016-0006', 'Médico especialista en Medicina General con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.', 'Puebla', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 YEAR), UTC_TIMESTAMP());
INSERT INTO medico_especialidad (medico_id, especialidad_id) SELECT @fernando_id, id FROM especialidades WHERE nombre = 'Medicina General' LIMIT 1;

-- ============================================================
-- 4. CREAR TURNOS - MARÍA GONZÁLEZ
-- ============================================================
-- Día 1 (Mañana)
INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:30:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:00:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '12:30:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '13:00:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP());
-- Día 1 (Tarde)
INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:30:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '16:30:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '17:30:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:00:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP());

-- Día 2
INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '09:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '10:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '11:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '11:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '15:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@maria_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '16:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 2 DAY), '16:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP());

-- ?? NOTA: Por brevedad, solo se muestran algunos turnos de ejemplo
-- En producción, replicar el mismo patrón para:
-- - Más días (3-10 días siguientes)
-- - Todos los demás médicos (@carlos_id, @ana_id, @roberto_id, @elena_id, @fernando_id)

-- ============================================================
-- 5. TURNOS PARA OTROS MÉDICOS (SIMPLIFICADO - 1 DÍA CADA UNO)
-- ============================================================

-- Carlos Ruiz - Día 1
INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
(@carlos_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@carlos_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@carlos_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP());

-- Ana Martínez - Día 1
INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
(@ana_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@ana_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@ana_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP());

-- Roberto López - Día 1
INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
(@roberto_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@roberto_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@roberto_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP());

-- Elena Vargas - Día 1
INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
(@elena_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@elena_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@elena_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP());

-- Fernando Silva - Día 1
INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en) VALUES
(@fernando_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@fernando_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '10:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
(@fernando_id, TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:00:00'), TIMESTAMP(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:30:00'), 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP());

-- ============================================================
-- 6. VERIFICACIÓN
-- ============================================================

SELECT 'Médicos creados:' as Info, COUNT(*) as Total FROM perfil_medico WHERE usuario_id IN (@maria_id, @carlos_id, @ana_id, @roberto_id, @elena_id, @fernando_id);
SELECT 'Turnos creados:' as Info, COUNT(*) as Total FROM agenda_turnos WHERE medico_id IN (@maria_id, @carlos_id, @ana_id, @roberto_id, @elena_id, @fernando_id);

SELECT '? Script completado! RECUERDA: Reemplazar el password hash antes de ejecutar' as Resultado;
