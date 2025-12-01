-- Script para agregar perfil médico al usuario ID 21
-- Este script corrige el usuario que se creó antes del fix

USE TuCita;
GO

-- Verificar que el usuario existe y tiene rol MEDICO
SELECT u.usuario_id, u.nombre, u.apellido, u.email, r.nombre as rol
FROM usuario u
INNER JOIN rol_usuario ru ON u.usuario_id = ru.usuario_id
INNER JOIN rol r ON ru.rol_id = r.rol_id
WHERE u.usuario_id = 21;
GO

-- Verificar si ya tiene perfil médico
SELECT * FROM perfil_medico WHERE usuario_id = 21;
GO

-- Si no tiene perfil médico, insertarlo
IF NOT EXISTS (SELECT 1 FROM perfil_medico WHERE usuario_id = 21)
BEGIN
    INSERT INTO perfil_medico (
        usuario_id, 
        numero_licencia, 
        biografia, 
        direccion, 
        creado_en, 
        actualizado_en
    )
    VALUES (
        21,
        'MED-12345', -- Reemplaza con el número de licencia correcto
        'Médico especialista en Cardiología con amplia experiencia', -- Reemplaza con la biografía correcta
        'Ciudad de México', -- Reemplaza con la dirección correcta
        GETUTCDATE(),
        GETUTCDATE()
    );
    
    PRINT '? Perfil médico creado para usuario 21';
END
ELSE
BEGIN
    PRINT '?? El usuario 21 ya tiene perfil médico';
END
GO

-- Asignar especialidades (ejemplo: Cardiología con ID 2)
-- Primero verifica qué especialidades existen
SELECT * FROM especialidad;
GO

-- Luego asigna las especialidades deseadas
-- Ejemplo: Si Cardiología tiene ID = 2
IF NOT EXISTS (SELECT 1 FROM medico_especialidad WHERE medico_id = 21 AND especialidad_id = 2)
BEGIN
    INSERT INTO medico_especialidad (medico_id, especialidad_id)
    VALUES (21, 2); -- Reemplaza 2 con el ID de la especialidad correcta
    
    PRINT '? Especialidad asignada al médico 21';
END
GO

-- Verificar el resultado final
SELECT 
    u.usuario_id,
    u.nombre,
    u.apellido,
    u.email,
    pm.numero_licencia,
    pm.biografia,
    pm.direccion,
    e.nombre as especialidad
FROM usuario u
INNER JOIN perfil_medico pm ON u.usuario_id = pm.usuario_id
LEFT JOIN medico_especialidad me ON u.usuario_id = me.medico_id
LEFT JOIN especialidad e ON me.especialidad_id = e.especialidad_id
WHERE u.usuario_id = 21;
GO
