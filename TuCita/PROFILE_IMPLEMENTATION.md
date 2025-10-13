# Implementaci�n de Edici�n de Perfil de Usuario

## Resumen

Se ha implementado completamente la funcionalidad de edici�n de perfil de usuario, permitiendo a los pacientes actualizar su informaci�n personal y cambiar su contrase�a de forma segura.

## Componentes Implementados

### 1. Backend (.NET 8)

#### DTOs Creados

**`UpdateProfileDto.cs`**
- Valida y estructura los datos para actualizar el perfil
- Campos: Nombre, Apellido, Email, Tel�fono, FechaNacimiento, Identificaci�n, TelefonoEmergencia
- Incluye validaciones de campo requerido, formato de email y longitud m�xima

**`ChangePasswordDto.cs`**
- Maneja el cambio de contrase�a del usuario
- Campos: CurrentPassword, NewPassword, ConfirmPassword
- Validaciones: contrase�a actual requerida, longitud m�nima de 8 caracteres, confirmaci�n de contrase�a

**`ProfileResponseDto.cs`**
- DTO para la respuesta del perfil del usuario
- Incluye todos los campos del usuario y perfil de paciente

#### Servicio: `ProfileService.cs`

Implementa la interfaz `IProfileService` con los siguientes m�todos:

**`GetProfileAsync(ulong userId)`**
- Obtiene toda la informaci�n del perfil del usuario autenticado
- Incluye datos del usuario y del perfil de paciente
- Retorna: `ProfileResult` con `ProfileResponseDto`

**`UpdateProfileAsync(ulong userId, UpdateProfileDto request)`**
- Actualiza informaci�n personal del usuario
- Valida que el email no est� en uso por otro usuario
- Actualiza tabla `usuarios` y `perfil_paciente`
- Usa transacciones para garantizar consistencia de datos
- Retorna: `ProfileResult` con perfil actualizado y datos de autenticaci�n

**`ChangePasswordAsync(ulong userId, ChangePasswordDto request)`**
- Cambia la contrase�a del usuario
- Verifica la contrase�a actual antes de cambiar
- Usa BCrypt para hashear la nueva contrase�a
- Retorna: `ProfileResult` con mensaje de �xito/error

**Caracter�sticas de Seguridad:**
- Verifica contrase�a actual con BCrypt.Verify()
- Hashea nueva contrase�a con BCrypt.HashPassword()
- Usa transacciones de base de datos para actualizaciones
- Logging de todas las operaciones
- Manejo robusto de errores

#### Controlador: `ProfileController.cs`

Endpoints REST implementados:

**`GET /api/profile`**
- Obtiene el perfil del usuario autenticado
- Requiere autenticaci�n JWT
- Respuesta: `ProfileResponseDto`

**`PUT /api/profile`**
- Actualiza el perfil del usuario
- Requiere autenticaci�n JWT
- Body: `UpdateProfileDto`
- Respuesta: mensaje, perfil actualizado, y datos de usuario para actualizar contexto

**`POST /api/profile/change-password`**
- Cambia la contrase�a del usuario
- Requiere autenticaci�n JWT
- Body: `ChangePasswordDto`
- Respuesta: mensaje de confirmaci�n

**Seguridad del Controlador:**
- Atributo `[Authorize]` en toda la clase
- Extrae userId del token JWT (Claims)
- Valida que el usuario est� autenticado
- ModelState validation en todos los endpoints

#### Registro en `Program.cs`

Se registr� el servicio en el contenedor de inyecci�n de dependencias:
```csharp
builder.Services.AddScoped<IProfileService, ProfileService>();
```

### 2. Frontend (React + TypeScript)

#### Servicio: `profileService.ts`

Cliente TypeScript para consumir la API de perfil:

**M�todos:**
- `getProfile()`: Obtiene informaci�n completa del perfil
- `updateProfile(data)`: Actualiza informaci�n personal
- `changePassword(data)`: Cambia la contrase�a

**Interfaces TypeScript:**
- `UpdateProfileRequest`: Datos para actualizar perfil
- `ChangePasswordRequest`: Datos para cambiar contrase�a
- `ProfileResponse`: Respuesta del servidor con datos del perfil

#### Actualizaci�n de `profile-page.tsx`

**Mejoras Implementadas:**

1. **Carga de Datos del Perfil**
   - Hook `useEffect` que carga el perfil completo al montar el componente
   - Funci�n `loadProfile()` que obtiene datos del servidor
   - Popula todos los campos del formulario con datos reales

2. **Actualizaci�n de Informaci�n Personal**
   - Funci�n `handleSavePersonalInfo()` as�ncrona
   - Llama a `profileService.updateProfile()`
   - Actualiza el contexto del usuario en la aplicaci�n mediante `onUpdateUser()`
   - Muestra notificaciones toast de �xito/error
   - Deshabilita botones durante la carga con `isLoading`

3. **Cambio de Contrase�a**
   - Funci�n `handleChangePassword()` as�ncrona
   - Valida que las contrase�as coincidan
   - Valida longitud m�nima de 8 caracteres
   - Llama a `profileService.changePassword()`
   - Limpia el formulario tras �xito
   - Muestra feedback al usuario

4. **Estados de Carga**
   - Variable `isLoading` para deshabilitar inputs y botones durante operaciones
   - Textos din�micos en botones ("Guardando...", "Cambiando...")
   - Previene m�ltiples env�os simult�neos

5. **Nuevos Campos Implementados**
   - Fecha de nacimiento (date input)
   - Identificaci�n (c�dula/pasaporte)
   - Tel�fono de emergencia
   - Todos vinculados al backend

6. **Manejo de Errores**
   - Try-catch en todas las operaciones as�ncronas
   - Mensajes de error descriptivos desde el backend
   - Fallback a mensajes gen�ricos si no hay detalles

## Flujo de Datos

### Obtener Perfil
```
Usuario carga p�gina
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
            ? Valida email �nico
              ? Inicia transacci�n
                ? Actualiza tabla usuarios
                  ? Actualiza/crea perfil_paciente
                    ? Commit transacci�n
                      ? Retorna ProfileResult con datos actualizados
                        ? Frontend actualiza contexto de usuario
                          ? Muestra toast de �xito
                            ? Deshabilita modo edici�n
```

### Cambiar Contrase�a
```
Usuario ingresa contrase�as y hace clic en "Cambiar"
  ? Validaci�n en frontend (coincidencia, longitud)
    ? handleChangePassword()
      ? profileService.changePassword()
        ? POST /api/profile/change-password con ChangePasswordDto
          ? ProfileController.ChangePassword()
            ? ProfileService.ChangePasswordAsync()
              ? Verifica contrase�a actual con BCrypt
                ? Hashea nueva contrase�a con BCrypt
                  ? Actualiza password_hash en BD
                    ? Retorna resultado exitoso
                      ? Frontend limpia formulario
                        ? Muestra toast de �xito
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

1. **Autenticaci�n JWT**
   - Todos los endpoints requieren token JWT v�lido
   - Usuario extra�do del token (Claims)
   - No se puede editar perfil de otro usuario

2. **Autorizaci�n**
   - Atributo `[Authorize]` en controlador
   - Validaci�n de userId en cada request

3. **Validaci�n de Contrase�as**
   - BCrypt para hashing (factor 11)
   - Verificaci�n de contrase�a actual antes de cambio
   - Longitud m�nima de 8 caracteres
   - Confirmaci�n de contrase�a

4. **Validaci�n de Email**
   - Formato de email v�lido
   - Unicidad verificada antes de actualizar
   - Normalizaci�n a lowercase para b�squedas

5. **Transacciones de Base de Datos**
   - Rollback autom�tico en caso de error
   - Consistencia de datos garantizada

6. **Validaci�n de Entrada**
   - Data Annotations en DTOs
   - ModelState validation en controlador
   - Validaci�n adicional en servicio

7. **Logging**
   - Todas las operaciones logueadas
   - Errores con stack trace
   - Informaci�n sensible no expuesta

## Testing Recomendado

### Backend
1. **ProfileService Tests**
   - Obtener perfil existente
   - Obtener perfil inexistente
   - Actualizar perfil con email �nico
   - Actualizar perfil con email duplicado
   - Cambiar contrase�a con contrase�a actual correcta
   - Cambiar contrase�a con contrase�a actual incorrecta
   - Crear perfil de paciente si no existe
   - Actualizar perfil de paciente existente

2. **ProfileController Tests**
   - GET /api/profile con token v�lido
   - GET /api/profile sin token
   - PUT /api/profile con datos v�lidos
   - PUT /api/profile con datos inv�lidos
   - POST /api/profile/change-password con datos v�lidos
   - POST /api/profile/change-password con contrase�a actual incorrecta

### Frontend
1. **profileService Tests**
   - Llamadas API exitosas
   - Manejo de errores de red
   - Manejo de errores del servidor
   - Transformaci�n correcta de datos

2. **profile-page Tests**
   - Carga inicial de datos
   - Edici�n de campos
   - Guardado exitoso
   - Manejo de errores
   - Cambio de contrase�a exitoso
   - Validaciones de contrase�a

## Ejemplos de Uso

### Actualizar Perfil (Frontend)

```typescript
const handleSave = async () => {
  try {
    const response = await profileService.updateProfile({
      nombre: 'Juan',
      apellido: 'P�rez',
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

### Cambiar Contrase�a (Frontend)

```typescript
const handlePasswordChange = async () => {
  try {
    await profileService.changePassword({
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
      confirmPassword: 'newPassword456'
    });
    
    toast.success('Contrase�a actualizada');
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
    Apellido = "P�rez",
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

## Pr�ximos Pasos Recomendados

1. **Notificaciones**
   - Implementar backend para guardar preferencias de notificaciones
   - Integrar con sistema de env�o de emails/SMS

2. **Privacidad**
   - Implementar configuraciones de privacidad en BD
   - Endpoint para eliminar cuenta
   - Endpoint para descargar datos (GDPR)

3. **Avatar**
   - Upload de imagen de perfil
   - Almacenamiento en cloud (AWS S3, Azure Blob)
   - Redimensionamiento autom�tico

4. **Validaci�n Avanzada**
   - Validaci�n de tel�fonos por pa�s
   - Validaci�n de identificaciones por tipo
   - Restricciones de edad

5. **Auditor�a**
   - Tabla de auditor�a para cambios de perfil
   - Historial de cambios de contrase�a
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

## Conclusi�n

Se ha implementado completamente la funcionalidad de edici�n de perfil, incluyendo:

? Backend API RESTful con validaciones
? Servicio de negocio con l�gica segura
? Frontend integrado con backend
? Cambio de contrase�a seguro
? Actualizaci�n de informaci�n personal
? Manejo de errores robusto
? Estados de carga en UI
? Notificaciones al usuario
? Transacciones de BD
? Logging completo
? Validaciones de seguridad

El sistema est� listo para uso en producci�n con las mejoras recomendadas para futuras iteraciones.
