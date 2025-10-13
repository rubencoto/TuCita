# Implementación de Edición de Perfil de Usuario

## Resumen

Se ha implementado completamente la funcionalidad de edición de perfil de usuario, permitiendo a los pacientes actualizar su información personal y cambiar su contraseña de forma segura.

## Componentes Implementados

### 1. Backend (.NET 8)

#### DTOs Creados

**`UpdateProfileDto.cs`**
- Valida y estructura los datos para actualizar el perfil
- Campos: Nombre, Apellido, Email, Teléfono, FechaNacimiento, Identificación, TelefonoEmergencia
- Incluye validaciones de campo requerido, formato de email y longitud máxima

**`ChangePasswordDto.cs`**
- Maneja el cambio de contraseña del usuario
- Campos: CurrentPassword, NewPassword, ConfirmPassword
- Validaciones: contraseña actual requerida, longitud mínima de 8 caracteres, confirmación de contraseña

**`ProfileResponseDto.cs`**
- DTO para la respuesta del perfil del usuario
- Incluye todos los campos del usuario y perfil de paciente

#### Servicio: `ProfileService.cs`

Implementa la interfaz `IProfileService` con los siguientes métodos:

**`GetProfileAsync(ulong userId)`**
- Obtiene toda la información del perfil del usuario autenticado
- Incluye datos del usuario y del perfil de paciente
- Retorna: `ProfileResult` con `ProfileResponseDto`

**`UpdateProfileAsync(ulong userId, UpdateProfileDto request)`**
- Actualiza información personal del usuario
- Valida que el email no esté en uso por otro usuario
- Actualiza tabla `usuarios` y `perfil_paciente`
- Usa transacciones para garantizar consistencia de datos
- Retorna: `ProfileResult` con perfil actualizado y datos de autenticación

**`ChangePasswordAsync(ulong userId, ChangePasswordDto request)`**
- Cambia la contraseña del usuario
- Verifica la contraseña actual antes de cambiar
- Usa BCrypt para hashear la nueva contraseña
- Retorna: `ProfileResult` con mensaje de éxito/error

**Características de Seguridad:**
- Verifica contraseña actual con BCrypt.Verify()
- Hashea nueva contraseña con BCrypt.HashPassword()
- Usa transacciones de base de datos para actualizaciones
- Logging de todas las operaciones
- Manejo robusto de errores

#### Controlador: `ProfileController.cs`

Endpoints REST implementados:

**`GET /api/profile`**
- Obtiene el perfil del usuario autenticado
- Requiere autenticación JWT
- Respuesta: `ProfileResponseDto`

**`PUT /api/profile`**
- Actualiza el perfil del usuario
- Requiere autenticación JWT
- Body: `UpdateProfileDto`
- Respuesta: mensaje, perfil actualizado, y datos de usuario para actualizar contexto

**`POST /api/profile/change-password`**
- Cambia la contraseña del usuario
- Requiere autenticación JWT
- Body: `ChangePasswordDto`
- Respuesta: mensaje de confirmación

**Seguridad del Controlador:**
- Atributo `[Authorize]` en toda la clase
- Extrae userId del token JWT (Claims)
- Valida que el usuario esté autenticado
- ModelState validation en todos los endpoints

#### Registro en `Program.cs`

Se registró el servicio en el contenedor de inyección de dependencias:
```csharp
builder.Services.AddScoped<IProfileService, ProfileService>();
```

### 2. Frontend (React + TypeScript)

#### Servicio: `profileService.ts`

Cliente TypeScript para consumir la API de perfil:

**Métodos:**
- `getProfile()`: Obtiene información completa del perfil
- `updateProfile(data)`: Actualiza información personal
- `changePassword(data)`: Cambia la contraseña

**Interfaces TypeScript:**
- `UpdateProfileRequest`: Datos para actualizar perfil
- `ChangePasswordRequest`: Datos para cambiar contraseña
- `ProfileResponse`: Respuesta del servidor con datos del perfil

#### Actualización de `profile-page.tsx`

**Mejoras Implementadas:**

1. **Carga de Datos del Perfil**
   - Hook `useEffect` que carga el perfil completo al montar el componente
   - Función `loadProfile()` que obtiene datos del servidor
   - Popula todos los campos del formulario con datos reales

2. **Actualización de Información Personal**
   - Función `handleSavePersonalInfo()` asíncrona
   - Llama a `profileService.updateProfile()`
   - Actualiza el contexto del usuario en la aplicación mediante `onUpdateUser()`
   - Muestra notificaciones toast de éxito/error
   - Deshabilita botones durante la carga con `isLoading`

3. **Cambio de Contraseña**
   - Función `handleChangePassword()` asíncrona
   - Valida que las contraseñas coincidan
   - Valida longitud mínima de 8 caracteres
   - Llama a `profileService.changePassword()`
   - Limpia el formulario tras éxito
   - Muestra feedback al usuario

4. **Estados de Carga**
   - Variable `isLoading` para deshabilitar inputs y botones durante operaciones
   - Textos dinámicos en botones ("Guardando...", "Cambiando...")
   - Previene múltiples envíos simultáneos

5. **Nuevos Campos Implementados**
   - Fecha de nacimiento (date input)
   - Identificación (cédula/pasaporte)
   - Teléfono de emergencia
   - Todos vinculados al backend

6. **Manejo de Errores**
   - Try-catch en todas las operaciones asíncronas
   - Mensajes de error descriptivos desde el backend
   - Fallback a mensajes genéricos si no hay detalles

## Flujo de Datos

### Obtener Perfil
```
Usuario carga página
  ? useEffect() ejecuta loadProfile()
    ? profileService.getProfile()
      ? GET /api/profile
        ? ProfileController.GetProfile()
          ? ProfileService.GetProfileAsync()
            ? Query a BD (usuarios + perfil_paciente)
              ? Retorna ProfileResponseDto
                ? Frontend actualiza estado personalInfo
                  ? Renderiza formulario con datos
```

### Actualizar Perfil
```
Usuario edita campos y hace clic en "Guardar"
  ? handleSavePersonalInfo()
    ? profileService.updateProfile()
      ? PUT /api/profile con UpdateProfileDto
        ? ProfileController.UpdateProfile()
          ? ProfileService.UpdateProfileAsync()
            ? Valida email único
              ? Inicia transacción
                ? Actualiza tabla usuarios
                  ? Actualiza/crea perfil_paciente
                    ? Commit transacción
                      ? Retorna ProfileResult con datos actualizados
                        ? Frontend actualiza contexto de usuario
                          ? Muestra toast de éxito
                            ? Deshabilita modo edición
```

### Cambiar Contraseña
```
Usuario ingresa contraseñas y hace clic en "Cambiar"
  ? Validación en frontend (coincidencia, longitud)
    ? handleChangePassword()
      ? profileService.changePassword()
        ? POST /api/profile/change-password con ChangePasswordDto
          ? ProfileController.ChangePassword()
            ? ProfileService.ChangePasswordAsync()
              ? Verifica contraseña actual con BCrypt
                ? Hashea nueva contraseña con BCrypt
                  ? Actualiza password_hash en BD
                    ? Retorna resultado exitoso
                      ? Frontend limpia formulario
                        ? Muestra toast de éxito
```

## Modelo de Datos

### Tabla: `usuarios`
```sql
- id (bigint unsigned, PK)
- email (varchar 150)
- email_normalizado (varchar 150, computed, unique)
- password_hash (varchar 255)
- nombre (varchar 80)
- apellido (varchar 80)
- telefono (varchar 30, nullable)
- activo (boolean)
- creado_en (datetime)
- actualizado_en (datetime)
```

### Tabla: `perfil_paciente`
```sql
- usuario_id (bigint unsigned, PK, FK)
- fecha_nacimiento (date, nullable)
- identificacion (varchar 30, nullable)
- telefono_emergencia (varchar 30, nullable)
- creado_en (datetime)
- actualizado_en (datetime)
```

## Seguridad Implementada

1. **Autenticación JWT**
   - Todos los endpoints requieren token JWT válido
   - Usuario extraído del token (Claims)
   - No se puede editar perfil de otro usuario

2. **Autorización**
   - Atributo `[Authorize]` en controlador
   - Validación de userId en cada request

3. **Validación de Contraseñas**
   - BCrypt para hashing (factor 11)
   - Verificación de contraseña actual antes de cambio
   - Longitud mínima de 8 caracteres
   - Confirmación de contraseña

4. **Validación de Email**
   - Formato de email válido
   - Unicidad verificada antes de actualizar
   - Normalización a lowercase para búsquedas

5. **Transacciones de Base de Datos**
   - Rollback automático en caso de error
   - Consistencia de datos garantizada

6. **Validación de Entrada**
   - Data Annotations en DTOs
   - ModelState validation en controlador
   - Validación adicional en servicio

7. **Logging**
   - Todas las operaciones logueadas
   - Errores con stack trace
   - Información sensible no expuesta

## Testing Recomendado

### Backend
1. **ProfileService Tests**
   - Obtener perfil existente
   - Obtener perfil inexistente
   - Actualizar perfil con email único
   - Actualizar perfil con email duplicado
   - Cambiar contraseña con contraseña actual correcta
   - Cambiar contraseña con contraseña actual incorrecta
   - Crear perfil de paciente si no existe
   - Actualizar perfil de paciente existente

2. **ProfileController Tests**
   - GET /api/profile con token válido
   - GET /api/profile sin token
   - PUT /api/profile con datos válidos
   - PUT /api/profile con datos inválidos
   - POST /api/profile/change-password con datos válidos
   - POST /api/profile/change-password con contraseña actual incorrecta

### Frontend
1. **profileService Tests**
   - Llamadas API exitosas
   - Manejo de errores de red
   - Manejo de errores del servidor
   - Transformación correcta de datos

2. **profile-page Tests**
   - Carga inicial de datos
   - Edición de campos
   - Guardado exitoso
   - Manejo de errores
   - Cambio de contraseña exitoso
   - Validaciones de contraseña

## Ejemplos de Uso

### Actualizar Perfil (Frontend)

```typescript
const handleSave = async () => {
  try {
    const response = await profileService.updateProfile({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      telefono: '+506 1234 5678',
      fechaNacimiento: '1990-01-01',
      identificacion: '123456789',
      telefonoEmergencia: '+506 8765 4321'
    });
    
    console.log('Perfil actualizado:', response.profile);
    onUpdateUser(response.user); // Actualizar contexto
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Cambiar Contraseña (Frontend)

```typescript
const handlePasswordChange = async () => {
  try {
    await profileService.changePassword({
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
      confirmPassword: 'newPassword456'
    });
    
    toast.success('Contraseña actualizada');
  } catch (error) {
    toast.error(error.message);
  }
};
```

### Llamar desde Backend (C#)

```csharp
// Actualizar perfil
var updateDto = new UpdateProfileDto
{
    Nombre = "Juan",
    Apellido = "Pérez",
    Email = "juan@example.com",
    Telefono = "+506 1234 5678",
    FechaNacimiento = new DateOnly(1990, 1, 1),
    Identificacion = "123456789",
    TelefonoEmergencia = "+506 8765 4321"
};

var result = await _profileService.UpdateProfileAsync(userId, updateDto);

if (result.Success)
{
    _logger.LogInformation("Perfil actualizado: {Email}", result.Profile.Email);
}
```

## Próximos Pasos Recomendados

1. **Notificaciones**
   - Implementar backend para guardar preferencias de notificaciones
   - Integrar con sistema de envío de emails/SMS

2. **Privacidad**
   - Implementar configuraciones de privacidad en BD
   - Endpoint para eliminar cuenta
   - Endpoint para descargar datos (GDPR)

3. **Avatar**
   - Upload de imagen de perfil
   - Almacenamiento en cloud (AWS S3, Azure Blob)
   - Redimensionamiento automático

4. **Validación Avanzada**
   - Validación de teléfonos por país
   - Validación de identificaciones por tipo
   - Restricciones de edad

5. **Auditoría**
   - Tabla de auditoría para cambios de perfil
   - Historial de cambios de contraseña
   - Logging detallado de accesos

6. **Tests**
   - Unit tests para servicio y controlador
   - Integration tests para endpoints
   - E2E tests para flujo completo

## Archivos Modificados/Creados

### Backend
- ? `TuCita/DTOs/Profile/UpdateProfileDto.cs` (nuevo)
- ? `TuCita/DTOs/Profile/ChangePasswordDto.cs` (nuevo)
- ? `TuCita/DTOs/Profile/ProfileResponseDto.cs` (nuevo)
- ? `TuCita/Services/ProfileService.cs` (nuevo)
- ? `TuCita/Controllers/Api/ProfileController.cs` (nuevo)
- ? `TuCita/Program.cs` (modificado - registro de servicio)

### Frontend
- ? `TuCita/ClientApp/src/services/profileService.ts` (nuevo)
- ? `TuCita/ClientApp/src/components/pages/profile-page.tsx` (modificado)

## Conclusión

Se ha implementado completamente la funcionalidad de edición de perfil, incluyendo:

? Backend API RESTful con validaciones
? Servicio de negocio con lógica segura
? Frontend integrado con backend
? Cambio de contraseña seguro
? Actualización de información personal
? Manejo de errores robusto
? Estados de carga en UI
? Notificaciones al usuario
? Transacciones de BD
? Logging completo
? Validaciones de seguridad

El sistema está listo para uso en producción con las mejoras recomendadas para futuras iteraciones.
