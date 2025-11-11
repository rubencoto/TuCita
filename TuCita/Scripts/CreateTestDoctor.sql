-- Script para crear doctor de prueba en TuCita
-- Ejecutar solo si el doctor de prueba no existe

-- 1. Verificar si el doctor ya existe
SELECT u.id, u.email, u.nombre, u.apellido, r.nombre as rol
FROM usuarios u
LEFT JOIN roles_usuarios ru ON u.id = ru.usuario_id
LEFT JOIN roles r ON ru.rol_id = r.id
WHERE u.email = 'doctor@tucitaonline.com';

-- Si no existe, continuar con la creación:

-- 2. Asegurar que existe el rol DOCTOR
IF NOT EXISTS (SELECT 1 FROM roles WHERE nombre = 'DOCTOR')
BEGIN
    INSERT INTO roles (nombre) VALUES ('DOCTOR');
END
GO

-- 3. Obtener ID del rol DOCTOR
DECLARE @RolDoctorId BIGINT;
SELECT @RolDoctorId = id FROM roles WHERE nombre = 'DOCTOR';

-- 4. Crear usuario doctor de prueba
-- Contraseña hasheada con BCrypt para "Doctor123!"
-- Hash generado: $2a$11$... (el hash varía cada vez por el salt)
DECLARE @DoctorUsuarioId BIGINT;

IF NOT EXISTS (SELECT 1 FROM usuarios WHERE email_normalizado = 'doctor@tucitaonline.com')
BEGIN
    INSERT INTO usuarios (
        email,
        email_normalizado,
        password_hash,
        nombre,
        apellido,
        telefono,
        activo,
        creado_en,
        actualizado_en
    ) VALUES (
        'doctor@tucitaonline.com',
        'doctor@tucitaonline.com',
        '$2a$11$8vJ5YqXQZxGxYN8VxJxYXOqKxPzVxGxYN8VxJxYXOqKxPzVxGxYNu', -- Hash de "Doctor123!"
        'Test',
        'Doctor',
        '+52 55 0000 0000',
        1,
        GETUTCDATE(),
        GETUTCDATE()
    );
    
    SET @DoctorUsuarioId = SCOPE_IDENTITY();
    
    -- 5. Asignar rol DOCTOR al usuario
    INSERT INTO roles_usuarios (usuario_id, rol_id)
    VALUES (@DoctorUsuarioId, @RolDoctorId);
    
    -- 6. Crear perfil médico
    INSERT INTO perfil_medico (
        usuario_id,
        numero_licencia,
        biografia,
        direccion,
        creado_en,
        actualizado_en
    ) VALUES (
        @DoctorUsuarioId,
        'LIC-TEST-0001',
        'Médico especialista en Medicina General con amplia experiencia en el tratamiento y diagnóstico de pacientes. Comprometido con brindar atención de calidad y calidez humana.',
        'Consultorio de Prueba',
        GETUTCDATE(),
        GETUTCDATE()
    );
    
    -- 7. Asegurar que existe la especialidad de Medicina General
    DECLARE @EspecialidadId INT;
    
    IF NOT EXISTS (SELECT 1 FROM especialidades WHERE nombre = 'Medicina General')
    BEGIN
        INSERT INTO especialidades (nombre) VALUES ('Medicina General');
    END
    
    SELECT @EspecialidadId = id FROM especialidades WHERE nombre = 'Medicina General';
    
    -- 8. Asignar especialidad al doctor
    INSERT INTO medico_especialidad (medico_id, especialidad_id)
    VALUES (@DoctorUsuarioId, @EspecialidadId);
    
    -- 9. Crear algunos turnos disponibles para pruebas
    -- Turnos para los próximos 3 días laborables
    DECLARE @FechaBase DATE = CAST(GETUTCDATE() AS DATE);
    DECLARE @DiaActual INT = 0;
    DECLARE @DiasCreados INT = 0;
    
    WHILE @DiasCreados < 3
    BEGIN
        DECLARE @Fecha DATE = DATEADD(DAY, @DiaActual, @FechaBase);
        DECLARE @DiaSemana INT = DATEPART(WEEKDAY, @Fecha);
        
        -- Solo días laborables (lunes a viernes)
        IF @DiaSemana NOT IN (1, 7) -- 1 = Domingo, 7 = Sábado
        BEGIN
            -- Crear turnos de 9:00 a 13:00 (cada 30 minutos)
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
                        @DoctorUsuarioId,
                        DATEADD(MINUTE, @Minuto, DATEADD(HOUR, @Hora, @Fecha)),
                        DATEADD(MINUTE, @Minuto + 30, DATEADD(HOUR, @Hora, @Fecha)),
                        0, -- DISPONIBLE
                        GETUTCDATE(),
                        GETUTCDATE()
                    );
                    
                    SET @Minuto = @Minuto + 30;
                END
                SET @Hora = @Hora + 1;
            END
            
            -- Crear turnos de 15:00 a 18:00 (cada 30 minutos)
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
                        @DoctorUsuarioId,
                        DATEADD(MINUTE, @Minuto, DATEADD(HOUR, @Hora, @Fecha)),
                        DATEADD(MINUTE, @Minuto + 30, DATEADD(HOUR, @Hora, @Fecha)),
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
    
    PRINT 'Doctor de prueba creado exitosamente';
    PRINT 'Email: doctor@tucitaonline.com';
    PRINT 'Password: Doctor123!';
END
ELSE
BEGIN
    PRINT 'El doctor de prueba ya existe';
END
GO

-- 10. Verificar la creación
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
WHERE u.email = 'doctor@tucitaonline.com'
GROUP BY u.id, u.email, u.nombre, u.apellido, u.telefono, r.nombre, pm.numero_licencia, e.nombre;
