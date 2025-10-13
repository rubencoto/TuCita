# Gu�a de Testing - API de Perfil

## Configuraci�n

### Headers Requeridos
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

Obt�n el JWT_TOKEN haciendo login primero en `/api/auth/login`.

## Endpoints

### 1. GET /api/profile
**Descripci�n:** Obtener informaci�n del perfil del usuario autenticado

**Request:**
```bash
curl -X GET "https://localhost:7089/api/profile" \
  -H "Authorization: Bearer {JWT_TOKEN}"
```

**Response 200 OK:**
```json
{
  "id": 1,
  "nombre": "Juan",
  "apellido": "P�rez",
  "email": "juan@example.com",
  "telefono": "+506 1234 5678",
  "fechaNacimiento": "1990-01-01",
  "identificacion": "123456789",
  "telefonoEmergencia": "+506 8765 4321",
  "creadoEn": "2024-01-01T00:00:00Z",
  "actualizadoEn": "2024-01-15T10:30:00Z"
}
```

**Response 401 Unauthorized:**
```json
{
  "message": "Usuario no autenticado"
}
```

---

### 2. PUT /api/profile
**Descripci�n:** Actualizar informaci�n del perfil

**Request:**
```bash
curl -X PUT "https://localhost:7089/api/profile" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "P�rez Garc�a",
    "email": "juan.perez@example.com",
    "telefono": "+506 1234 5678",
    "fechaNacimiento": "1990-01-01",
    "identificacion": "123456789",
    "telefonoEmergencia": "+506 8765 4321"
  }'
```

**Body Schema:**
```json
{
  "nombre": "string (requerido, max 80)",
  "apellido": "string (requerido, max 80)",
  "email": "string (requerido, email v�lido, max 150)",
  "telefono": "string (opcional, max 30)",
  "fechaNacimiento": "string (opcional, formato: YYYY-MM-DD)",
  "identificacion": "string (opcional, max 30)",
  "telefonoEmergencia": "string (opcional, max 30)"
}
```

**Response 200 OK:**
```json
{
  "message": "Perfil actualizado exitosamente",
  "profile": {
    "id": 1,
    "nombre": "Juan",
    "apellido": "P�rez Garc�a",
    "email": "juan.perez@example.com",
    "telefono": "+506 1234 5678",
    "fechaNacimiento": "1990-01-01",
    "identificacion": "123456789",
    "telefonoEmergencia": "+506 8765 4321",
    "creadoEn": "2024-01-01T00:00:00Z",
    "actualizadoEn": "2024-01-16T15:45:00Z"
  },
  "user": {
    "id": 1,
    "name": "Juan P�rez Garc�a",
    "email": "juan.perez@example.com",
    "phone": "+506 1234 5678",
    "token": ""
  }
}
```

**Response 400 Bad Request (email duplicado):**
```json
{
  "message": "El email ya est� registrado por otro usuario"
}
```

**Response 400 Bad Request (validaci�n):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Nombre": ["El nombre es requerido"],
    "Email": ["El email no es v�lido"]
  }
}
```

---

### 3. POST /api/profile/change-password
**Descripci�n:** Cambiar la contrase�a del usuario

**Request:**
```bash
curl -X POST "https://localhost:7089/api/profile/change-password" \
  -H "Authorization: Bearer {JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Password123!",
    "newPassword": "NewPassword456!",
    "confirmPassword": "NewPassword456!"
  }'
```

**Body Schema:**
```json
{
  "currentPassword": "string (requerido)",
  "newPassword": "string (requerido, min 8, max 100)",
  "confirmPassword": "string (requerido, debe coincidir con newPassword)"
}
```

**Response 200 OK:**
```json
{
  "message": "Contrase�a actualizada exitosamente"
}
```

**Response 400 Bad Request (contrase�a actual incorrecta):**
```json
{
  "message": "La contrase�a actual es incorrecta"
}
```

**Response 400 Bad Request (validaci�n):**
```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "NewPassword": ["La contrase�a debe tener entre 8 y 100 caracteres"],
    "ConfirmPassword": ["Las contrase�as no coinciden"]
  }
}
```

---

## Flujo Completo de Testing

### 1. Login y Obtener Token
```bash
# Login
curl -X POST "https://localhost:7089/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paciente@example.com",
    "password": "Password123!"
  }'

# Respuesta (guardar el token)
{
  "id": 1,
  "name": "Juan P�rez",
  "email": "paciente@example.com",
  "phone": "+506 1234 5678",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Obtener Perfil Actual
```bash
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET "https://localhost:7089/api/profile" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Actualizar Perfil
```bash
curl -X PUT "https://localhost:7089/api/profile" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos",
    "apellido": "P�rez Garc�a",
    "email": "juan.carlos@example.com",
    "telefono": "+506 8888 9999",
    "fechaNacimiento": "1990-05-15",
    "identificacion": "1-1234-5678",
    "telefonoEmergencia": "+506 7777 6666"
  }'
```

### 4. Cambiar Contrase�a
```bash
curl -X POST "https://localhost:7089/api/profile/change-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Password123!",
    "newPassword": "NewSecurePass456!",
    "confirmPassword": "NewSecurePass456!"
  }'
```

### 5. Verificar Cambios
```bash
# Login con nueva contrase�a
curl -X POST "https://localhost:7089/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan.carlos@example.com",
    "password": "NewSecurePass456!"
  }'

# Obtener perfil actualizado
curl -X GET "https://localhost:7089/api/profile" \
  -H "Authorization: Bearer $NEW_TOKEN"
```

---

## Postman Collection

Puedes importar esta colecci�n en Postman:

```json
{
  "info": {
    "name": "TuCita - Profile API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://localhost:7089/api",
      "type": "string"
    },
    {
      "key": "jwt_token",
      "value": "",
      "type": "string"
    }
  ],
  "item": [
    {
      "name": "Get Profile",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "{{base_url}}/profile",
          "host": ["{{base_url}}"],
          "path": ["profile"]
        }
      }
    },
    {
      "name": "Update Profile",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"nombre\": \"Juan\",\n  \"apellido\": \"P�rez\",\n  \"email\": \"juan@example.com\",\n  \"telefono\": \"+506 1234 5678\",\n  \"fechaNacimiento\": \"1990-01-01\",\n  \"identificacion\": \"123456789\",\n  \"telefonoEmergencia\": \"+506 8765 4321\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/profile",
          "host": ["{{base_url}}"],
          "path": ["profile"]
        }
      }
    },
    {
      "name": "Change Password",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"currentPassword\": \"Password123!\",\n  \"newPassword\": \"NewPassword456!\",\n  \"confirmPassword\": \"NewPassword456!\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/profile/change-password",
          "host": ["{{base_url}}"],
          "path": ["profile", "change-password"]
        }
      }
    }
  ]
}
```

---

## Casos de Prueba

### ? Casos Exitosos

1. **Obtener perfil existente**
   - Usuario autenticado
   - Respuesta con todos los campos

2. **Actualizar todos los campos**
   - Todos los campos v�lidos
   - Email �nico
   - Respuesta exitosa con datos actualizados

3. **Actualizar solo campos requeridos**
   - Solo nombre, apellido, email
   - Campos opcionales como null
   - Actualizaci�n exitosa

4. **Cambiar contrase�a con datos v�lidos**
   - Contrase�a actual correcta
   - Nueva contrase�a v�lida
   - Confirmaci�n coincide
   - Cambio exitoso

### ? Casos de Error

1. **Sin autenticaci�n**
   - Request sin token
   - Respuesta 401 Unauthorized

2. **Token inv�lido/expirado**
   - Token JWT inv�lido
   - Respuesta 401 Unauthorized

3. **Email duplicado**
   - Email ya usado por otro usuario
   - Respuesta 400 Bad Request

4. **Validaci�n de campos**
   - Email inv�lido
   - Campos demasiado largos
   - Respuesta 400 con detalles de validaci�n

5. **Contrase�a actual incorrecta**
   - Password actual no coincide
   - Respuesta 400 Bad Request

6. **Contrase�a nueva muy corta**
   - Menos de 8 caracteres
   - Respuesta 400 con validaci�n

7. **Contrase�as no coinciden**
   - newPassword != confirmPassword
   - Respuesta 400 con validaci�n

---

## Notas de Seguridad

?? **Importante:**
- Nunca compartir tokens JWT
- Los tokens expiran en 60 minutos por defecto
- Las contrase�as se hashean con BCrypt
- No se puede ver la contrase�a actual
- El email se normaliza a lowercase internamente
- Se verifica unicidad de email antes de actualizar

?? **Buenas Pr�cticas:**
- Usar HTTPS en producci�n
- Rotar tokens regularmente
- Implementar rate limiting
- Validar entrada en cliente y servidor
- Logging de cambios importantes
- No incluir contrase�as en logs

---

## Troubleshooting

### Token Expirado
**S�ntoma:** 401 Unauthorized despu�s de un tiempo

**Soluci�n:** Hacer login nuevamente para obtener un nuevo token

### Email Ya Existe
**S�ntoma:** Error al actualizar email

**Soluci�n:** Usar un email diferente que no est� registrado

### Contrase�a Incorrecta
**S�ntoma:** Error "La contrase�a actual es incorrecta"

**Soluci�n:** Verificar que est�s usando la contrase�a correcta actual
