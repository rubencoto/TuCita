# ?? Solución al Error de Login de Doctor

## ? Problema

Al intentar iniciar sesión con el usuario doctor `juan.navarro@tucita.com`, aparece el siguiente error:

```
? Error al iniciar sesión: Error: Usuario no autorizado como médico
```

## ?? Diagnóstico

El problema está relacionado con la validación del rol en el backend. El sistema espera que el rol se llame **"MEDICO"** exactamente como está en tu base de datos.

### Código del Backend

En `TuCita\Services\AuthService.cs` línea 99:

```csharp
var esMedico = usuario.RolesUsuarios.Any(ru => ru.Rol.Nombre == "MEDICO");
if (!esMedico)
{
    return new DoctorAuthResult 
    { 
        Success = false, 
        Message = "Usuario no autorizado como médico" 
    };
}
```

El backend verifica que el usuario tenga un rol con el nombre exacto **"MEDICO"**.

## ? Solución

El código ya ha sido actualizado para validar correctamente el rol "MEDICO". Ahora necesitas verificar que tu base de datos esté configurada correctamente.

### ?? Verificación del Estado Actual

Ejecuta el siguiente script SQL para verificar la configuración:

```sql
-- Ver todos los roles
SELECT * FROM dbo.Roles ORDER BY Id;

-- Ver los roles del usuario juan.navarro@tucita.com
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

-- Verificar el perfil médico
SELECT * FROM dbo.PerfilesMedicos WHERE UsuarioId = 26;

-- Verificar las especialidades
SELECT 
    u.Nombre,
    u.Apellido,
    e.Nombre as Especialidad
FROM dbo.Usuarios u
INNER JOIN dbo.MedicosEspecialidades me ON u.Id = me.MedicoId
INNER JOIN dbo.Especialidades e ON me.EspecialidadId = e.Id
WHERE u.Id = 26;
```

## ?? Resultado Esperado

Para que el login funcione correctamente, debes verificar que:

### 1. **Roles del Sistema**

| Id | Nombre   |
|----|----------|
| 1  | PACIENTE |
| 2  | MEDICO   |
| 3  | ADMIN    |

### 2. **Usuario tiene el rol MEDICO**

El usuario `juan.navarro@tucita.com` debe tener asignado el `RoleId = 2` (MEDICO)

### 3. **Tiene Perfil Médico**

Debe existir un registro en la tabla `PerfilesMedicos` para el `UsuarioId = 26`

### 4. **Tiene Especialidad**

Debe tener al menos una especialidad asignada en la tabla `MedicosEspecialidades`

## ?? Posibles Problemas y Soluciones

### Problema 1: El rol no existe o tiene nombre incorrecto

Si el rol con Id = 2 no se llama "MEDICO", créalo o corrígelo:

```sql
-- Si no existe el rol MEDICO, crearlo
INSERT INTO dbo.Roles (Nombre) VALUES ('MEDICO');

-- Si existe pero con otro nombre (ej: DOCTOR), actualizarlo
UPDATE dbo.Roles 
SET Nombre = 'MEDICO'
WHERE Id = 2;
```

### Problema 2: El usuario no tiene el rol asignado

```sql
-- Asignar el rol MEDICO al usuario
INSERT INTO dbo.RolesUsuarios (UsuarioId, RolId)
VALUES (26, 2);
```

### Problema 3: No tiene perfil médico

```sql
-- Crear el perfil médico
INSERT INTO dbo.PerfilesMedicos (
    UsuarioId,
    NumeroLicencia,
    Biografia,
    Direccion,
    CreadoEn,
    ActualizadoEn
)
VALUES (
    26,
    'LIC-2024-001',
    'Médico especialista',
    'Consultorio Principal',
    GETUTCDATE(),
    GETUTCDATE()
);
```

### Problema 4: No tiene especialidad asignada

```sql
-- Primero, verificar qué especialidades existen
SELECT * FROM dbo.Especialidades;

-- Asignar una especialidad (ejemplo: Medicina General con Id = 1)
INSERT INTO dbo.MedicosEspecialidades (MedicoId, EspecialidadId)
VALUES (26, 1);
```

## ?? Pasos de Verificación Rápida

1. **Ejecuta el script de verificación** (`FIX_DOCTOR_ROLE.sql`)
2. **Revisa cada punto del resultado esperado**
3. **Aplica las correcciones necesarias** según los problemas encontrados
4. **Reinicia la aplicación** para asegurar que los cambios se apliquen
5. **Vuelve a intentar el login** con `juan.navarro@tucita.com`

## ?? Cambios Realizados en el Código

Se han actualizado los siguientes archivos para usar "MEDICO" consistentemente:

1. **`TuCita/Services/AuthService.cs`** - Validación del rol actualizada a "MEDICO"
2. **`TuCita/Data/DbInitializer.cs`** - Inicialización de roles usando "MEDICO"
3. **`TuCita/Docs/FIX_DOCTOR_ROLE.sql`** - Script de verificación actualizado

### Roles Esperados por el Sistema

Según `DbInitializer.cs`, los roles deben ser:

1. **PACIENTE** - Para pacientes/usuarios regulares
2. **MEDICO** - Para médicos
3. **ADMIN** - Para administradores

## ?? Si el Problema Persiste

Si después de verificar todo el problema continúa:

1. **Revisa los logs del servidor** en la consola de Visual Studio
2. **Verifica la consola del navegador** (F12) para ver los errores detallados
3. **Asegúrate de que la aplicación se haya reiniciado** después de los cambios
4. **Verifica la conexión a la base de datos** en el archivo `.env`

### Logs Útiles

El backend registra información detallada cuando ocurre un error de login:

```
Intento de login de doctor fallido: usuario sin rol MEDICO - juan.navarro@tucita.com
```

Busca este mensaje en la consola del servidor para confirmar que es un problema de rol.

---

**Archivos modificados**:
- `TuCita/Services/AuthService.cs` - Backend actualizado
- `TuCita/Data/DbInitializer.cs` - Inicialización de datos actualizada
- `TuCita/Docs/FIX_DOCTOR_ROLE.sql` - Script de verificación
