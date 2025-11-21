-- ================================================================
-- Script de Verificación del Rol MEDICO
-- ================================================================
-- 
-- El sistema espera que el rol de médicos se llame "MEDICO"
-- Este script verifica que la configuración sea correcta
-- 
-- IMPORTANTE: Ejecutar este script en la base de datos Azure SQL
-- ================================================================

-- Verificar el estado actual de los roles
SELECT * FROM dbo.Roles ORDER BY Id;

-- Verificar los roles del usuario juan.navarro@tucita.com
SELECT 
    u.Id as UsuarioId,
    u.Email,
    u.Nombre,
    u.Apellido,
    r.Id as RolId,
    r.Nombre as RolNombre
FROM dbo.Usuarios u
INNER JOIN dbo.RolesUsuarios ru ON u.Id = ru.UsuarioId
INNER JOIN dbo.Roles r ON ru.RolId = r.Id
WHERE u.Email = 'juan.navarro@tucita.com';

-- Verificar el perfil médico del usuario
SELECT * FROM dbo.PerfilesMedicos WHERE UsuarioId = 26;

-- Verificar las especialidades del médico
SELECT 
    u.Nombre,
    u.Apellido,
    e.Nombre as Especialidad
FROM dbo.Usuarios u
INNER JOIN dbo.MedicosEspecialidades me ON u.Id = me.MedicoId
INNER JOIN dbo.Especialidades e ON me.EspecialidadId = e.Id
WHERE u.Id = 26;

-- ================================================================
-- VERIFICACIONES IMPORTANTES:
-- 
-- 1. El usuario debe tener el rol "MEDICO" (RoleId = 2)
-- 2. Debe existir un registro en PerfilesMedicos para el usuario
-- 3. Debe tener al menos una especialidad asignada
-- 
-- Si alguna de estas condiciones no se cumple, el login fallará
-- ================================================================

-- Si el rol con Id = 2 se llama "DOCTOR" en lugar de "MEDICO", corregirlo
-- (Esto solo aplica si migraste desde una versión anterior)
UPDATE dbo.Roles 
SET Nombre = 'MEDICO'
WHERE Id = 2 AND Nombre = 'DOCTOR';

-- Verificar que no haya roles duplicados
SELECT Nombre, COUNT(*) as Cantidad
FROM dbo.Roles
GROUP BY Nombre
HAVING COUNT(*) > 1;

-- ================================================================
-- Resultado esperado:
-- 
-- Roles del sistema:
-- Id=1, Nombre='PACIENTE'
-- Id=2, Nombre='MEDICO'
-- Id=3, Nombre='ADMIN'
-- 
-- El usuario juan.navarro@tucita.com debe tener:
-- - RolId = 2 (MEDICO)
-- - Un registro en PerfilesMedicos
-- - Al menos una especialidad
-- ================================================================
