# ?? Requerimientos Funcionales - TuCita Online

**Proyecto:** Sistema de Gestión de Citas Médicas en Línea  
**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Tecnologías:** .NET 8, React/TypeScript, SQL Server/Azure SQL, JWT Authentication

---

## ?? Objetivo del Sistema

TuCita Online es una plataforma web que permite a pacientes agendar, gestionar y consultar citas médicas de manera eficiente, mientras proporciona a los profesionales de la salud herramientas para administrar sus consultas y mantener registros médicos digitales.

---

## ?? Actores del Sistema

### 1. **Paciente/Usuario**
- Usuario registrado que puede agendar y gestionar citas médicas
- Acceso a su historial médico completo
- Gestión de perfil personal y preferencias

### 2. **Médico/Doctor**
- Profesional de salud con especialización
- Gestión de turnos y disponibilidad
- Creación de registros médicos (diagnósticos, recetas, notas clínicas)

### 3. **Administrador del Sistema**
- Gestión de usuarios y permisos
- Configuración del sistema
- Acceso a todas las funcionalidades

---

## ?? Requerimientos Funcionales Detallados

---

### RF-001: Registro de Usuarios
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
El sistema debe permitir que nuevos usuarios se registren proporcionando su información personal.

**Criterios de Aceptación:**
- ? El usuario puede registrarse con: nombre, apellido, email, teléfono, contraseña
- ? El email debe ser único en el sistema
- ? La contraseña debe tener un mínimo de 6 caracteres
- ? Se valida que las contraseñas coincidan
- ? Se hashea la contraseña con BCrypt antes de almacenarla
- ? Al registrarse, el usuario recibe un token JWT
- ? Se crea automáticamente un registro con rol de PACIENTE

**Endpoint:** `POST /api/auth/register`

**Validaciones:**
```csharp
- Email único: No puede existir otro usuario con el mismo email
- Password mínimo 6 caracteres
- Campos obligatorios: nombre, apellido, email, password
- Formato de email válido
```

---

### RF-002: Inicio de Sesión
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los usuarios registrados deben poder iniciar sesión con sus credenciales.

**Criterios de Aceptación:**
- ? Login con email y contraseña
- ? Validación de credenciales contra base de datos
- ? Generación de token JWT con expiración de 7 días
- ? Token incluye: userId, email, nombre completo
- ? Manejo de errores para credenciales inválidas

**Endpoint:** `POST /api/auth/login`

**Respuesta exitosa:**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "phone": "+506 1234-5678",
  "avatar": null,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### RF-003: Recuperación de Contraseña
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Los usuarios deben poder recuperar su contraseña mediante email.

**Criterios de Aceptación:**
- ? Solicitud de recuperación por email
- ? Generación de token único de reset (válido por 1 hora)
- ? Envío de email con enlace de recuperación
- ? Validación de token antes de permitir cambio
- ? Cambio de contraseña con confirmación

**Endpoints:**
- `POST /api/auth/request-password-reset` - Solicitar recuperación
- `POST /api/auth/validate-reset-token` - Validar token
- `POST /api/auth/reset-password` - Restablecer contraseña

**Flujo:**
1. Usuario solicita recuperación con su email
2. Sistema genera token y lo guarda con expiración de 1 hora
3. Se envía email con enlace que incluye el token
4. Usuario accede al enlace, token se valida
5. Usuario ingresa nueva contraseña
6. Token se invalida después del uso

---

### RF-004: Cierre de Sesión
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Los usuarios deben poder cerrar sesión de forma segura.

**Criterios de Aceptación:**
- ? Endpoint de logout requiere autenticación
- ? Se elimina el token del lado del cliente (localStorage)
- ? Redirección a página de inicio

**Endpoint:** `POST /api/auth/logout`

---

### RF-005: Visualización de Perfil
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los usuarios autenticados pueden ver su información personal completa.

**Criterios de Aceptación:**
- ? Obtener perfil del usuario autenticado
- ? Información incluye: nombre, apellido, email, teléfono, fecha de nacimiento, identificación, teléfono de emergencia
- ? Muestra fechas de creación y última actualización

**Endpoint:** `GET /api/profile`

---

### RF-006: Edición de Perfil
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los usuarios pueden actualizar su información personal.

**Criterios de Aceptación:**
- ? Actualización de: nombre, apellido, email, teléfono, fecha de nacimiento, identificación, teléfono de emergencia
- ? Validación de email único (si se cambia)
- ? Actualización automática del campo `actualizado_en`
- ? Retorna información actualizada del usuario

**Endpoint:** `PUT /api/profile`

**Campos editables:**
```typescript
{
  nombre: string,
  apellido: string,
  email: string,
  telefono?: string,
  fechaNacimiento?: string, // ISO format
  identificacion?: string,
  telefonoEmergencia?: string
}
```

---

### RF-007: Cambio de Contraseña
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los usuarios pueden cambiar su contraseña actual.

**Criterios de Aceptación:**
- ? Validación de contraseña actual
- ? Nueva contraseña mínimo 6 caracteres
- ? Confirmación de nueva contraseña
- ? Hasheo de nueva contraseña con BCrypt
- ? Actualización en base de datos

**Endpoint:** `POST /api/profile/change-password`

---

### RF-008: Búsqueda de Médicos
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los usuarios pueden buscar médicos por especialidad y disponibilidad.

**Criterios de Aceptación:**
- ? Búsqueda sin autenticación requerida
- ? Filtros por: especialidad, nombre, ubicación
- ? Paginación de resultados
- ? Información básica del médico: nombre, especialidades, ubicación, rating
- ? Indicador de disponibilidad

**Endpoint:** `GET /api/doctors/search?especialidad={especialidad}&page={page}&pageSize={pageSize}`

**Respuesta incluye:**
```typescript
{
  id: number,
  nombre: string,
  especialidades: string[],
  numeroLicencia?: string,
  biografia?: string,
  direccion?: string,
  telefono?: string,
  imageUrl: string,
  experienceYears: string,
  rating: number,
  reviewCount: number,
  hospital: string,
  location: string,
  availableSlots: number,
  nextAvailable: string
}
```

---

### RF-009: Detalle de Médico
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Ver información completa de un médico específico.

**Criterios de Aceptación:**
- ? Información detallada del médico
- ? Listado de especialidades
- ? Biografía y experiencia
- ? Información de contacto
- ? Horarios disponibles

**Endpoint:** `GET /api/doctors/{id}`

---

### RF-010: Obtener Turnos Disponibles
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Consultar los turnos/slots disponibles de un médico para agendar citas.

**Criterios de Aceptación:**
- ? Filtro por fecha específica o rango de fechas
- ? Solo muestra turnos con estado DISPONIBLE
- ? Información incluye: fecha, hora inicio, hora fin, duración
- ? Ordenados por fecha y hora

**Endpoint:** `GET /api/doctors/{id}/available-slots?fecha={fecha}&diasAdelante={dias}`

**Respuesta:**
```typescript
{
  id: number,
  medicoId: number,
  fecha: string,
  horaInicio: string,
  horaFin: string,
  duracionMinutos: number,
  estado: "DISPONIBLE",
  tipoTurno?: string
}
```

---

### RF-011: Crear Cita
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los pacientes autenticados pueden agendar una cita médica.

**Criterios de Aceptación:**
- ? Requiere autenticación
- ? Validación de turno disponible
- ? Validación de que el turno no esté ya tomado
- ? Creación de cita con estado PENDIENTE
- ? Actualización del turno a estado OCUPADO
- ? Envío de email de confirmación al paciente
- ? Cálculo automático de fecha fin basado en duración del turno

**Endpoint:** `POST /api/appointments`

**Request Body:**
```typescript
{
  turnoId: number,
  motivo?: string
}
```

**Validaciones:**
- Turno existe y está DISPONIBLE
- Paciente no tiene otra cita en el mismo horario
- Turno no se cruza con citas existentes del paciente

**Proceso:**
1. Validar turno disponible
2. Obtener información del médico
3. Crear registro de cita
4. Actualizar estado del turno a OCUPADO
5. Enviar email de confirmación
6. Retornar información completa de la cita

---

### RF-012: Listar Mis Citas
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los pacientes pueden ver todas sus citas agendadas.

**Criterios de Aceptación:**
- ? Requiere autenticación
- ? Retorna solo citas del usuario autenticado
- ? Incluye información del médico y turno
- ? Ordenadas por fecha (más recientes primero)
- ? Filtros por estado: PENDIENTE, CONFIRMADA, ATENDIDA, CANCELADA

**Endpoint:** `GET /api/appointments/my-appointments`

**Respuesta incluye:**
```typescript
{
  id: number,
  inicio: string,
  fin: string,
  estado: string,
  motivo?: string,
  nombreMedico: string,
  especialidad?: string,
  direccionMedico?: string,
  duracionMinutos: number,
  fechaCreacion: string
}
```

---

### RF-013: Ver Detalle de Cita
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Ver información completa de una cita específica.

**Criterios de Aceptación:**
- ? Requiere autenticación
- ? Solo el paciente de la cita puede verla
- ? Información completa del médico y turno
- ? Estado actual de la cita

**Endpoint:** `GET /api/appointments/{id}`

---

### RF-014: Cancelar Cita
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los pacientes pueden cancelar sus citas agendadas.

**Criterios de Aceptación:**
- ? Requiere autenticación
- ? Solo el paciente puede cancelar su propia cita
- ? Actualiza estado de cita a CANCELADA
- ? Libera el turno (cambia estado a DISPONIBLE)
- ? Envío de email de notificación de cancelación
- ? No se puede cancelar una cita ya ATENDIDA o CANCELADA

**Endpoint:** `DELETE /api/appointments/{id}`

**Proceso:**
1. Validar que la cita pertenece al usuario
2. Validar estado de la cita (debe ser PENDIENTE o CONFIRMADA)
3. Actualizar estado de cita a CANCELADA
4. Liberar turno asociado (DISPONIBLE)
5. Enviar email de confirmación de cancelación
6. Retornar confirmación

---

### RF-015: Reagendar Cita
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Los pacientes pueden cambiar el horario de una cita existente.

**Criterios de Aceptación:**
- ? Requiere autenticación
- ? Solo el paciente puede reagendar su propia cita
- ? Validación de nuevo turno disponible
- ? Liberación del turno anterior
- ? Asignación del nuevo turno
- ? Actualización de fechas de la cita
- ? Envío de email con nueva información
- ? Mantiene el motivo original de la cita

**Endpoint:** `PUT /api/appointments/{id}/reschedule`

**Request Body:**
```typescript
{
  nuevoTurnoId: number
}
```

**Proceso:**
1. Validar permisos del usuario
2. Validar estado de cita actual
3. Validar disponibilidad del nuevo turno
4. Liberar turno anterior (DISPONIBLE)
5. Ocupar nuevo turno (OCUPADO)
6. Actualizar fechas de la cita
7. Enviar email de confirmación
8. Retornar cita actualizada

---

### RF-016: Actualizar Estado de Cita
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Permitir actualizar el estado de una cita (PENDIENTE ? CONFIRMADA ? ATENDIDA).

**Criterios de Aceptación:**
- ? Actualización de estado
- ? Validación de transiciones válidas de estado
- ? Estados permitidos: PENDIENTE, CONFIRMADA, ATENDIDA, CANCELADA
- ? Trigger automático actualiza `actualizado_en`

**Endpoint:** `PUT /api/appointments/{id}`

**Transiciones válidas:**
```
PENDIENTE ? CONFIRMADA
CONFIRMADA ? ATENDIDA
PENDIENTE/CONFIRMADA ? CANCELADA
```

---

### RF-017: Ver Historial Médico del Paciente
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los pacientes pueden consultar su historial médico completo.

**Criterios de Aceptación:**
- ? Requiere autenticación
- ? Solo retorna citas con estado ATENDIDA
- ? Incluye: diagnósticos, recetas, notas clínicas, documentos
- ? Información del médico que atendió
- ? Ordenado por fecha de cita (más reciente primero)

**Endpoint:** `GET /api/historial/paciente/{pacienteId}`

**Respuesta incluye:**
```typescript
{
  citaId: number,
  fechaCita: string,
  nombreMedico: string,
  especialidad?: string,
  estadoCita: "ATENDIDA",
  motivo?: string,
  diagnosticos: DiagnosticoDto[],
  notasClinicas: NotaClinicaDto[],
  recetas: RecetaDto[],
  documentos: DocumentoDto[]
}
```

---

### RF-018: Ver Detalle de Cita Médica
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Ver información completa de una cita específica incluyendo todos los registros médicos.

**Criterios de Aceptación:**
- ? Información completa de la cita
- ? Datos del paciente y médico
- ? Todos los diagnósticos asociados
- ? Notas clínicas del médico
- ? Recetas con medicamentos
- ? Documentos adjuntos

**Endpoint:** `GET /api/historial/cita/{citaId}`

---

### RF-019: Crear Nota Clínica (Solo Médicos)
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los médicos pueden agregar notas clínicas durante o después de una consulta.

**Criterios de Aceptación:**
- ? Requiere autenticación
- ? Solo médicos pueden crear notas
- ? Asociada a una cita específica
- ? Contenido de texto libre
- ? Fecha automática de creación

**Endpoint:** `POST /api/historial/nota`

**Request Body:**
```typescript
{
  citaId: number,
  contenido: string
}
```

---

### RF-020: Crear Diagnóstico (Solo Médicos)
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los médicos pueden registrar diagnósticos para las citas atendidas.

**Criterios de Aceptación:**
- ? Requiere autenticación de médico
- ? Código de diagnóstico opcional (CIE-10)
- ? Descripción obligatoria
- ? Asociado a una cita específica
- ? Múltiples diagnósticos por cita

**Endpoint:** `POST /api/historial/diagnostico`

**Request Body:**
```typescript
{
  citaId: number,
  codigo?: string,        // Ej: "J00" (CIE-10)
  descripcion: string     // Ej: "Rinofaringitis aguda"
}
```

---

### RF-021: Crear Receta Médica (Solo Médicos)
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Los médicos pueden crear recetas con medicamentos para sus pacientes.

**Criterios de Aceptación:**
- ? Requiere autenticación de médico
- ? Asociada a una cita específica
- ? Múltiples medicamentos por receta
- ? Información detallada por medicamento: dosis, frecuencia, duración
- ? Indicaciones generales opcionales

**Endpoint:** `POST /api/historial/receta`

**Request Body:**
```typescript
{
  citaId: number,
  indicaciones?: string,
  medicamentos: [
    {
      medicamento: string,
      dosis?: string,          // Ej: "500mg"
      frecuencia?: string,     // Ej: "Cada 8 horas"
      duracion?: string,       // Ej: "7 días"
      notas?: string
    }
  ]
}
```

**Ejemplo:**
```json
{
  "citaId": 123,
  "indicaciones": "Tomar con alimentos",
  "medicamentos": [
    {
      "medicamento": "Amoxicilina",
      "dosis": "500mg",
      "frecuencia": "Cada 8 horas",
      "duracion": "7 días",
      "notas": "Completar tratamiento"
    },
    {
      "medicamento": "Ibuprofeno",
      "dosis": "400mg",
      "frecuencia": "Cada 6 horas si hay dolor",
      "duracion": "5 días"
    }
  ]
}
```

---

### RF-022: Subir Documento Médico (Solo Médicos)
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Los médicos pueden adjuntar documentos médicos a una cita (laboratorios, imágenes, etc.).

**Criterios de Aceptación:**
- ? Requiere autenticación de médico
- ? Categorías: LAB, IMAGEN, REFERENCIA, CONSTANCIA, OTRO
- ? Metadatos del archivo: nombre, tipo MIME, tamaño
- ? Etiquetas opcionales para búsqueda
- ? Notas adicionales opcionales
- ? Información de almacenamiento en Azure Blob

**Endpoint:** `POST /api/historial/documento`

**Request Body:**
```typescript
{
  citaId: number,
  categoria: "LAB" | "IMAGEN" | "REFERENCIA" | "CONSTANCIA" | "OTRO",
  nombreArchivo: string,
  mimeType: string,
  tamanoBytes: number,
  storageId: number,
  blobNombre: string,
  blobCarpeta?: string,
  blobContainer: string,
  notas?: string,
  etiquetas?: string[]
}
```

---

### RF-023: Eliminar Documento Médico
**Prioridad:** Baja  
**Estado:** ? Implementado

**Descripción:**  
Eliminar un documento médico de una cita.

**Criterios de Aceptación:**
- ? Requiere autenticación
- ? Permisos: médico que lo creó, paciente de la cita, o admin
- ? Eliminación de base de datos (soft delete posible)
- ? Opcionalmente eliminar de Azure Blob Storage

**Endpoint:** `DELETE /api/historial/documento/{documentoId}`

---

### RF-024: Notificación de Cita Creada
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Envío automático de email cuando se crea una nueva cita.

**Criterios de Aceptación:**
- ? Email enviado al paciente
- ? Información de la cita: fecha, hora, médico, especialidad
- ? Instrucciones de contacto
- ? Diseño responsive HTML

**Trigger:** Al crear una cita exitosamente

**Contenido del email:**
- Confirmación de cita agendada
- Detalles del médico
- Fecha y hora
- Dirección del consultorio
- Instrucciones de preparación (si aplica)

---

### RF-025: Notificación de Cita Cancelada
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Envío automático de email cuando se cancela una cita.

**Criterios de Aceptación:**
- ? Email enviado al paciente
- ? Información de la cita cancelada
- ? Enlace para reagendar
- ? Información de contacto

**Trigger:** Al cancelar una cita

**Contenido del email:**
- Confirmación de cancelación
- Detalles de la cita cancelada
- Opciones para reagendar
- Información de contacto

---

### RF-026: Notificación de Cita Reagendada
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Envío automático de email cuando se reagenda una cita.

**Criterios de Aceptación:**
- ? Email enviado al paciente
- ? Comparación de horario anterior vs nuevo
- ? Nueva información del turno
- ? Confirmación del médico

**Trigger:** Al reagendar exitosamente

**Contenido del email:**
- Confirmación de reagendamiento
- Horario anterior tachado
- Nuevo horario destacado
- Información actualizada

---

### RF-027: Email de Recuperación de Contraseña
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Envío de email con enlace para restablecer contraseña.

**Criterios de Aceptación:**
- ? Email con enlace único y temporal (1 hora)
- ? Instrucciones claras
- ? Advertencias de seguridad
- ? Enlace funcional directo a formulario de reset

**Trigger:** Al solicitar recuperación de contraseña

**Contenido del email:**
- Enlace único de recuperación
- Tiempo de expiración del enlace
- Advertencias de seguridad
- Instrucciones paso a paso

---

### RF-028: Autenticación JWT
**Prioridad:** Crítica  
**Estado:** ? Implementado

**Descripción:**  
Sistema de autenticación basado en tokens JWT.

**Criterios de Aceptación:**
- ? Token generado con clave secreta desde variables de entorno
- ? Expiración de 7 días
- ? Claims incluyen: userId, email, nombre completo
- ? Validación de token en cada request protegido
- ? Issuer y Audience configurables

---

### RF-029: Autorización por Roles
**Prioridad:** Alta  
**Estado:** ?? Parcialmente implementado

**Descripción:**  
Control de acceso basado en roles de usuario.

**Roles definidos:**
- ? PACIENTE: Usuario estándar
- ? MEDICO: Profesional de salud
- ? ADMIN: Administrador del sistema

**Permisos:**
- Pacientes: Agendar citas, ver su historial, editar perfil
- Médicos: Todo lo anterior + crear registros médicos, gestionar turnos
- Admin: Acceso completo al sistema

---

### RF-030: Validación de Entrada de Datos
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripción:**  
Todas las entradas de usuario son validadas antes de procesarse.

**Validaciones implementadas:**
- ? Formato de email
- ? Longitud de contraseñas
- ? Campos requeridos vs opcionales
- ? Tipos de datos correctos
- ? Rangos de valores válidos
- ? Unicidad de emails
- ? Validación de fechas
- ? Prevención de SQL Injection (Entity Framework)
- ? Prevención de XSS (sanitización automática)

---

### RF-031: Triggers de Base de Datos
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Triggers automáticos para mantener integridad de datos.

**Triggers implementados:**

1. **Actualización automática de timestamps:**
   - ? `TR_usuarios_update_timestamp`
   - ? `TR_citas_update_timestamp`
   - ? `TR_turnos_update_timestamp`
   - ? `TR_notificaciones_update_timestamp`
   - ? `TR_preferencias_notificacion_update_timestamp`

2. **Gestión de estados:**
   - ? Validación de transiciones de estado en citas
   - ? Actualización automática de estado de turnos

---

### RF-032: Dashboard de Usuario
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Vista general del paciente con información relevante.

**Información mostrada:**
- ? Próximas citas
- ? Historial reciente
- ? Accesos rápidos
- ? Notificaciones pendientes

---

### RF-033: Búsqueda Avanzada de Médicos
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Búsqueda con múltiples criterios.

**Filtros disponibles:**
- ? Especialidad
- ? Nombre del médico
- ? Ubicación
- ? Disponibilidad
- ? Rating/Valoración (simulado)

---

### RF-034: Catálogo de Especialidades
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Listado de especialidades médicas disponibles.

**Especialidades incluidas:**
- Medicina General
- Cardiología
- Dermatología
- Pediatría
- Ginecología
- Oftalmología
- Traumatología
- Neurología
- Psiquiatría
- Odontología
- Y más...

---

### RF-035: Datos de Prueba (Seeding)
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripción:**  
Población inicial de base de datos para desarrollo y testing.

**Datos de prueba:**
- ? 20+ médicos con diferentes especialidades
- ? 100+ turnos disponibles
- ? Usuarios de prueba
- ? Citas de ejemplo
- ? Historial médico simulado
- ? Diagnósticos, recetas y documentos de prueba

---

## ?? Resumen de Implementación

| Módulo | Requerimientos | Estado | Cobertura |
|--------|---------------|--------|-----------|
| **1. Autenticación** | RF-001 a RF-004 (4) | ? Completo | 100% |
| **2. Perfil de Usuario** | RF-005 a RF-007 (3) | ? Completo | 100% |
| **3. Búsqueda de Médicos** | RF-008 a RF-010 (3) | ? Completo | 100% |
| **4. Gestión de Citas** | RF-011 a RF-016 (6) | ? Completo | 100% |
| **5. Historial Médico** | RF-017 a RF-023 (7) | ? Completo | 100% |
| **6. Notificaciones** | RF-024 a RF-027 (4) | ? Completo | 100% |
| **7. Seguridad** | RF-028 a RF-031 (4) | ? Completo | 95% |
| **8. Reporting** | RF-032 a RF-033 (2) | ? Completo | 80% |
| **9. Datos Maestros** | RF-034 a RF-035 (2) | ? Completo | 100% |
| **TOTAL** | **35 Requerimientos** | **? 97%** | |

---

## ?? Flujos Principales del Sistema

### Flujo 1: Registro y Primera Cita
1. Usuario se registra en el sistema **(RF-001)**
2. Recibe email de bienvenida (opcional)
3. Busca médico por especialidad **(RF-008)**
4. Selecciona turno disponible **(RF-010)**
5. Agenda cita con motivo de consulta **(RF-011)**
6. Recibe confirmación por email **(RF-024)**
7. Sistema reserva el turno

### Flujo 2: Consulta Médica Completa
1. Paciente llega a su cita
2. Médico accede a historial del paciente **(RF-017)**
3. Realiza consulta y examen
4. Crea nota clínica con observaciones **(RF-019)**
5. Registra diagnóstico(s) **(RF-020)**
6. Genera receta con medicamentos **(RF-021)**
7. Adjunta documentos (laboratorios, imágenes) **(RF-022)**
8. Actualiza estado de cita a ATENDIDA **(RF-016)**
9. Paciente puede ver todo el registro en su historial

### Flujo 3: Cancelación y Reagendamiento
1. Paciente accede a "Mis Citas" **(RF-012)**
2. Selecciona cita a modificar **(RF-013)**
3. Opción 1: Cancela **(RF-014)** (libera turno, recibe confirmación **(RF-025)**)
4. Opción 2: Reagenda **(RF-015)** (selecciona nuevo turno, actualiza cita, recibe email **(RF-026)**)
5. Sistema notifica por email
6. Turnos se actualizan automáticamente

---

## ?? Métricas y KPIs

### Métricas de Negocio
- Número de citas agendadas diarias/semanales/mensuales
- Tasa de cancelación de citas
- Tasa de utilización de turnos
- Tiempo promedio de respuesta del sistema
- Número de usuarios registrados
- Número de médicos activos
- Especialidades más solicitadas

### Métricas Técnicas
- Tiempo de respuesta de APIs (< 500ms)
- Disponibilidad del sistema (99.9%)
- Tasa de éxito de envío de emails
- Errores de autenticación
- Concurrencia de usuarios

---

## ?? Cumplimiento y Privacidad

### HIPAA / Datos Sensibles
- ? Datos médicos encriptados en tránsito (HTTPS) **(RF-028)**
- ? Contraseñas hasheadas (BCrypt) **(RF-001, RF-007)**
- ? Tokens JWT con expiración **(RF-028)**
- ? Acceso controlado por roles **(RF-029)**
- ?? Auditoría de accesos (por implementar)
- ?? Encriptación de datos en reposo (Azure SQL)

### Privacidad del Paciente
- ? Solo el paciente puede ver su historial completo **(RF-017)**
- ? Médicos solo ven historial de sus pacientes
- ? Administradores tienen acceso completo (auditado)
- ? Eliminación de cuenta (soft delete)

---

## ?? Próximas Funcionalidades (Roadmap)

### Corto Plazo (v1.1)
- **RF-036:** Sistema de notificaciones push en navegador
- **RF-037:** Recordatorios automáticos 24h antes de cita
- **RF-038:** Valoración y reseñas de médicos
- **RF-039:** Chat en tiempo real paciente-médico

### Mediano Plazo (v1.2)
- **RF-040:** Videoconsultas (telemedicina)
- **RF-041:** Pagos en línea
- **RF-042:** Integración con seguros médicos
- **RF-043:** App móvil nativa (iOS/Android)

### Largo Plazo (v2.0)
- **RF-044:** Inteligencia artificial para recomendación de médicos
- **RF-045:** Análisis predictivo de disponibilidad
- **RF-046:** Portal para administradores de clínicas
- **RF-047:** Integración con sistemas de facturación

---

## ?? Matriz de Trazabilidad

| RF ID | Endpoint | Controller | Service | Test Status |
|-------|----------|------------|---------|-------------|
| RF-001 | POST /api/auth/register | AuthController | AuthService | ? Manual |
| RF-002 | POST /api/auth/login | AuthController | AuthService | ? Manual |
| RF-003 | POST /api/auth/request-password-reset | AuthController | AuthService | ? Manual |
| RF-004 | POST /api/auth/logout | AuthController | AuthService | ? Manual |
| RF-005 | GET /api/profile | ProfileController | ProfileService | ? Manual |
| RF-006 | PUT /api/profile | ProfileController | ProfileService | ? Manual |
| RF-007 | POST /api/profile/change-password | ProfileController | ProfileService | ? Manual |
| RF-008 | GET /api/doctors/search | DoctorsController | DoctorsService | ? Manual |
| RF-009 | GET /api/doctors/{id} | DoctorsController | DoctorsService | ? Manual |
| RF-010 | GET /api/doctors/{id}/available-slots | DoctorsController | DoctorsService | ? Manual |
| RF-011 | POST /api/appointments | AppointmentsController | AppointmentsService | ? Manual |
| RF-012 | GET /api/appointments/my-appointments | AppointmentsController | AppointmentsService | ? Manual |
| RF-013 | GET /api/appointments/{id} | AppointmentsController | AppointmentsService | ? Manual |
| RF-014 | DELETE /api/appointments/{id} | AppointmentsController | AppointmentsService | ? Manual |
| RF-015 | PUT /api/appointments/{id}/reschedule | AppointmentsController | AppointmentsService | ? Manual |
| RF-016 | PUT /api/appointments/{id} | AppointmentsController | AppointmentsService | ? Manual |
| RF-017 | GET /api/historial/paciente/{id} | MedicalHistoryController | MedicalHistoryService | ? Manual |
| RF-018 | GET /api/historial/cita/{id} | MedicalHistoryController | MedicalHistoryService | ? Manual |
| RF-019 | POST /api/historial/nota | MedicalHistoryController | MedicalHistoryService | ? Manual |
| RF-020 | POST /api/historial/diagnostico | MedicalHistoryController | MedicalHistoryService | ? Manual |
| RF-021 | POST /api/historial/receta | MedicalHistoryController | MedicalHistoryService | ? Manual |
| RF-022 | POST /api/historial/documento | MedicalHistoryController | MedicalHistoryService | ? Manual |
| RF-023 | DELETE /api/historial/documento/{id} | MedicalHistoryController | MedicalHistoryService | ? Manual |
| RF-024 | - | - | EmailService | ? Manual |
| RF-025 | - | - | EmailService | ? Manual |
| RF-026 | - | - | EmailService | ? Manual |
| RF-027 | - | - | EmailService | ? Manual |
| RF-028 | - | - | AuthService + JWT Middleware | ? Manual |
| RF-029 | - | - | Authorization Middleware | ?? Parcial |
| RF-030 | - | All Controllers | - | ? Manual |
| RF-031 | - | Database Triggers | - | ? Verified |
| RF-032 | GET /api/appointments/my-appointments | AppointmentsController | AppointmentsService | ? Manual |
| RF-033 | GET /api/doctors/search | DoctorsController | DoctorsService | ? Manual |
| RF-034 | - | Database Seeding | DbInitializer | ? Verified |
| RF-035 | - | Database Seeding | DbInitializer | ? Verified |

---

**Elaborado por:** Sistema de Gestión TuCita  
**Última actualización:** Diciembre 2024  
**Versión:** 1.0  
**Estado:** Documento Oficial de Requerimientos  
**Total de Requerimientos:** 35 implementados + 12 en roadmap = 47 totales
