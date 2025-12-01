-- Script para verificar y corregir usuarios MEDICO sin perfil médico
-- Este script identifica y corrige automáticamente todos los usuarios con rol MEDICO
-- que no tienen un registro en la tabla perfil_medico

USE TuCita;
GO

PRINT '?? Buscando usuarios con rol MEDICO sin perfil médico...';
GO

-- Identificar usuarios MEDICO sin perfil
SELECT 
    u.usuario_id,
    u.nombre,
    u.apellido,
    u.email,
    r.nombre as rol,
    CASE WHEN pm.usuario_id IS NULL THEN 'SIN PERFIL' ELSE 'CON PERFIL' END as estado_perfil
FROM usuario u
INNER JOIN rol_usuario ru ON u.usuario_id = ru.usuario_id
INNER JOIN rol r ON ru.rol_id = r.rol_id
LEFT JOIN perfil_medico pm ON u.usuario_id = pm.usuario_id
WHERE r.nombre = 'MEDICO';
GO

PRINT '';
PRINT '?? Creando perfiles médicos faltantes...';
GO

-- Crear perfiles médicos para usuarios MEDICO que no lo tienen
INSERT INTO perfil_medico (
    usuario_id,
    numero_licencia,
    biografia,
    direccion,
    creado_en,
    actualizado_en
)
SELECT 
    u.usuario_id,
    'MED-' + CAST(u.usuario_id AS VARCHAR(10)) + '-TEMP', -- Número de licencia temporal
    'Perfil creado automáticamente. Por favor actualice esta información.', -- Biografía temporal
    'Por favor actualice la dirección del consultorio', -- Dirección temporal
    GETUTCDATE(),
    GETUTCDATE()
FROM usuario u
INNER JOIN rol_usuario ru ON u.usuario_id = ru.usuario_id
INNER JOIN rol r ON ru.rol_id = r.rol_id
LEFT JOIN perfil_medico pm ON u.usuario_id = pm.usuario_id
WHERE r.nombre = 'MEDICO'
  AND pm.usuario_id IS NULL;

PRINT '? Perfiles médicos creados: ' + CAST(@@ROWCOUNT AS VARCHAR(10));
GO

PRINT '';
PRINT '?? Verificación final:';
GO

-- Verificar resultado
SELECT 
    u.usuario_id,
    u.nombre,
    u.apellido,
    u.email,
    pm.numero_licencia,
    pm.biografia,
    pm.direccion,
    COUNT(me.especialidad_id) as total_especialidades
FROM usuario u
INNER JOIN rol_usuario ru ON u.usuario_id = ru.usuario_id
INNER JOIN rol r ON ru.rol_id = r.rol_id
INNER JOIN perfil_medico pm ON u.usuario_id = pm.usuario_id
LEFT JOIN medico_especialidad me ON u.usuario_id = me.medico_id
WHERE r.nombre = 'MEDICO'
GROUP BY 
    u.usuario_id,
    u.nombre,
    u.apellido,
    u.email,
    pm.numero_licencia,
    pm.biografia,
    pm.direccion
ORDER BY u.usuario_id;
GO

PRINT '';
PRINT '?? IMPORTANTE:';
PRINT '- Los perfiles creados tienen datos temporales';
PRINT '- Debe actualizar manualmente el número de licencia, biografía y dirección';
PRINT '- También debe asignar las especialidades correspondientes';
GO
