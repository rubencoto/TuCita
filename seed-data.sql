-- ============================================================
-- TuCita - Script de Seeding Manual para Azure MySQL
-- ============================================================
-- Este script crea datos de prueba para médicos y turnos
-- Ejecutar en Azure Data Studio o MySQL Workbench
-- ============================================================

-- Verificar que estamos en la base de datos correcta
-- NOTA: Reemplaza 'tucita' con el nombre de tu base de datos si es diferente
USE defaultdb;

-- ============================================================
-- 1. VERIFICAR Y CREAR ROLES
-- ============================================================

-- Insertar roles si no existen
INSERT IGNORE INTO roles (nombre, creado_en, actualizado_en)
VALUES 
    ('PACIENTE', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('MEDICO', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('RECEPCION', UTC_TIMESTAMP(), UTC_TIMESTAMP()),
    ('ADMIN', UTC_TIMESTAMP(), UTC_TIMESTAMP());

-- ============================================================
-- 2. VERIFICAR Y CREAR ESPECIALIDADES
-- ============================================================

-- Insertar especialidades si no existen
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

-- NOTA: Las contraseñas están hasheadas con BCrypt
-- Password para todos: "Doctor123!"
-- Hash BCrypt: $2a$11$ejemplo... (se debe generar con BCrypt en .NET)

-- Dr. María González - Cardiología
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES (
    'maria.gonzalez@tucita.com',
    'maria.gonzalez@tucita.com',
    '$2a$11$Kq5Y8LKmGxZQYl4LqRZhZeYPzVJ3k.vN5XL7GJ0mNqTxWzRQY5Qy6', -- Doctor123!
    'María',
    'González',
    '+52 55 1234 5001',
    1,
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 YEAR),
    UTC_TIMESTAMP()
);

SET @maria_id = LAST_INSERT_ID();

INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en)
SELECT @maria_id, id, UTC_TIMESTAMP() FROM roles WHERE nombre = 'MEDICO';

INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (
    @maria_id,
    'LIC-2018-0001',
    'Médico especialista en Cardiología con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.',
    'Ciudad de México',
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 YEAR),
    UTC_TIMESTAMP()
);

INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT @maria_id, id FROM especialidades WHERE nombre = 'Cardiología';

-- Dr. Carlos Ruiz - Neurología
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES (
    'carlos.ruiz@tucita.com',
    'carlos.ruiz@tucita.com',
    '$2a$11$Kq5Y8LKmGxZQYl4LqRZhZeYPzVJ3k.vN5XL7GJ0mNqTxWzRQY5Qy6', -- Doctor123!
    'Carlos',
    'Ruiz',
    '+52 55 1234 5002',
    1,
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4 YEAR),
    UTC_TIMESTAMP()
);

SET @carlos_id = LAST_INSERT_ID();

INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en)
SELECT @carlos_id, id, UTC_TIMESTAMP() FROM roles WHERE nombre = 'MEDICO';

INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (
    @carlos_id,
    'LIC-2019-0002',
    'Médico especialista en Neurología con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.',
    'Ciudad de México',
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4 YEAR),
    UTC_TIMESTAMP()
);

INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT @carlos_id, id FROM especialidades WHERE nombre = 'Neurología';

-- Dra. Ana Martínez - Pediatría
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES (
    'ana.martinez@tucita.com',
    'ana.martinez@tucita.com',
    '$2a$11$Kq5Y8LKmGxZQYl4LqRZhZeYPzVJ3k.vN5XL7GJ0mNqTxWzRQY5Qy6', -- Doctor123!
    'Ana',
    'Martínez',
    '+52 33 1234 5003',
    1,
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 YEAR),
    UTC_TIMESTAMP()
);

SET @ana_id = LAST_INSERT_ID();

INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en)
SELECT @ana_id, id, UTC_TIMESTAMP() FROM roles WHERE nombre = 'MEDICO';

INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (
    @ana_id,
    'LIC-2020-0003',
    'Médico especialista en Pediatría con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.',
    'Guadalajara',
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 YEAR),
    UTC_TIMESTAMP()
);

INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT @ana_id, id FROM especialidades WHERE nombre = 'Pediatría';

-- Dr. Roberto López - Ortopedia
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES (
    'roberto.lopez@tucita.com',
    'roberto.lopez@tucita.com',
    '$2a$11$Kq5Y8LKmGxZQYl4LqRZhZeYPzVJ3k.vN5XL7GJ0mNqTxWzRQY5Qy6', -- Doctor123!
    'Roberto',
    'López',
    '+52 81 1234 5004',
    1,
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 6 YEAR),
    UTC_TIMESTAMP()
);

SET @roberto_id = LAST_INSERT_ID();

INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en)
SELECT @roberto_id, id, UTC_TIMESTAMP() FROM roles WHERE nombre = 'MEDICO';

INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (
    @roberto_id,
    'LIC-2017-0004',
    'Médico especialista en Ortopedia con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.',
    'Monterrey',
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 6 YEAR),
    UTC_TIMESTAMP()
);

INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT @roberto_id, id FROM especialidades WHERE nombre = 'Ortopedia';

-- Dra. Elena Vargas - Dermatología
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES (
    'elena.vargas@tucita.com',
    'elena.vargas@tucita.com',
    '$2a$11$Kq5Y8LKmGxZQYl4LqRZhZeYPzVJ3k.vN5XL7GJ0mNqTxWzRQY5Qy6', -- Doctor123!
    'Elena',
    'Vargas',
    '+52 55 1234 5005',
    1,
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 YEAR),
    UTC_TIMESTAMP()
);

SET @elena_id = LAST_INSERT_ID();

INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en)
SELECT @elena_id, id, UTC_TIMESTAMP() FROM roles WHERE nombre = 'MEDICO';

INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (
    @elena_id,
    'LIC-2021-0005',
    'Médico especialista en Dermatología con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.',
    'Ciudad de México',
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 YEAR),
    UTC_TIMESTAMP()
);

INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT @elena_id, id FROM especialidades WHERE nombre = 'Dermatología';

-- Dr. Fernando Silva - Medicina General
INSERT INTO usuarios (email, email_normalizado, password_hash, nombre, apellido, telefono, activo, creado_en, actualizado_en)
VALUES (
    'fernando.silva@tucita.com',
    'fernando.silva@tucita.com',
    '$2a$11$Kq5Y8LKmGxZQYl4LqRZhZeYPzVJ3k.vN5XL7GJ0mNqTxWzRQY5Qy6', -- Doctor123!
    'Fernando',
    'Silva',
    '+52 22 1234 5006',
    1,
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 YEAR),
    UTC_TIMESTAMP()
);

SET @fernando_id = LAST_INSERT_ID();

INSERT INTO roles_usuarios (usuario_id, rol_id, asignado_en)
SELECT @fernando_id, id, UTC_TIMESTAMP() FROM roles WHERE nombre = 'MEDICO';

INSERT INTO perfil_medico (usuario_id, numero_licencia, biografia, direccion, creado_en, actualizado_en)
VALUES (
    @fernando_id,
    'LIC-2016-0006',
    'Médico especialista en Medicina General con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.',
    'Puebla',
    DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 YEAR),
    UTC_TIMESTAMP()
);

INSERT INTO medico_especialidad (medico_id, especialidad_id)
SELECT @fernando_id, id FROM especialidades WHERE nombre = 'Medicina General';

-- ============================================================
-- 4. CREAR TURNOS DISPONIBLES (10 DÍAS LABORABLES)
-- ============================================================

-- NOTA: Este script crea turnos para cada médico
-- Horarios: Mañana (9:00-13:00) y Tarde (15:00-18:00)
-- Intervalo: 30 minutos por turno
-- Solo días laborables (Lunes a Viernes)

DELIMITER $$

CREATE PROCEDURE IF NOT EXISTS CreateSlotsForDoctor(IN doctor_id BIGINT UNSIGNED)
BEGIN
    DECLARE day_offset INT DEFAULT 0;
    DECLARE current_date DATE;
    DECLARE day_of_week INT;
    DECLARE hour_val INT;
    DECLARE minute_val INT;
    DECLARE slot_start DATETIME;
    DECLARE slot_end DATETIME;
    DECLARE days_created INT DEFAULT 0;
    
    -- Crear turnos para los próximos 20 días (para obtener 10 laborables)
    WHILE days_created < 10 AND day_offset < 20 DO
        SET current_date = DATE_ADD(CURDATE(), INTERVAL day_offset DAY);
        SET day_of_week = DAYOFWEEK(current_date);
        
        -- Solo días laborables (Lunes=2, Viernes=6)
        IF day_of_week >= 2 AND day_of_week <= 6 THEN
            -- Turnos de mañana: 9:00 AM - 1:00 PM
            SET hour_val = 9;
            WHILE hour_val < 13 DO
                SET minute_val = 0;
                WHILE minute_val < 60 DO
                    SET slot_start = TIMESTAMP(current_date, MAKETIME(hour_val, minute_val, 0));
                    SET slot_end = DATE_ADD(slot_start, INTERVAL 30 MINUTE);
                    
                    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en)
                    VALUES (doctor_id, slot_start, slot_end, 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP());
                    
                    SET minute_val = minute_val + 30;
                END WHILE;
                SET hour_val = hour_val + 1;
            END WHILE;
            
            -- Turnos de tarde: 3:00 PM - 6:00 PM
            SET hour_val = 15;
            WHILE hour_val < 18 DO
                SET minute_val = 0;
                WHILE minute_val < 60 DO
                    SET slot_start = TIMESTAMP(current_date, MAKETIME(hour_val, minute_val, 0));
                    SET slot_end = DATE_ADD(slot_start, INTERVAL 30 MINUTE);
                    
                    INSERT INTO agenda_turnos (medico_id, inicio, fin, estado, creado_en, actualizado_en)
                    VALUES (doctor_id, slot_start, slot_end, 'DISPONIBLE', UTC_TIMESTAMP(), UTC_TIMESTAMP());
                    
                    SET minute_val = minute_val + 30;
                END WHILE;
                SET hour_val = hour_val + 1;
            END WHILE;
            
            SET days_created = days_created + 1;
        END IF;
        
        SET day_offset = day_offset + 1;
    END WHILE;
END$$

DELIMITER ;

-- Crear turnos para cada médico
CALL CreateSlotsForDoctor(@maria_id);
CALL CreateSlotsForDoctor(@carlos_id);
CALL CreateSlotsForDoctor(@ana_id);
CALL CreateSlotsForDoctor(@roberto_id);
CALL CreateSlotsForDoctor(@elena_id);
CALL CreateSlotsForDoctor(@fernando_id);

-- Limpiar procedimiento temporal
DROP PROCEDURE IF EXISTS CreateSlotsForDoctor;

-- ============================================================
-- 5. VERIFICACIÓN DE DATOS INSERTADOS
-- ============================================================

-- Contar médicos creados
SELECT 'Médicos creados:' as Info, COUNT(*) as Total FROM perfil_medico;

-- Contar turnos creados
SELECT 'Turnos creados:' as Info, COUNT(*) as Total FROM agenda_turnos;

-- Listar médicos con sus especialidades
SELECT 
    u.nombre,
    u.apellido,
    u.email,
    e.nombre as especialidad,
    pm.direccion,
    COUNT(at.id) as turnos_disponibles
FROM usuarios u
INNER JOIN perfil_medico pm ON u.id = pm.usuario_id
INNER JOIN medico_especialidad me ON pm.usuario_id = me.medico_id
INNER JOIN especialidades e ON me.especialidad_id = e.id
LEFT JOIN agenda_turnos at ON pm.usuario_id = at.medico_id AND at.estado = 'DISPONIBLE'
WHERE u.email LIKE '%@tucita.com'
GROUP BY u.id, e.id;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================

SELECT '? Script de seeding completado exitosamente!' as Resultado;
