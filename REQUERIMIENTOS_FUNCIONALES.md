# ?? Requerimientos Funcionales - TuCita Online

**Proyecto:** Sistema de Gesti�n de Citas M�dicas en L�nea  
**Versi�n:** 1.0  
**Fecha:** Diciembre 2024  
**Tecnolog�as:** .NET 8, React/TypeScript, SQL Server/Azure SQL, JWT Authentication

---

## ?? Objetivo del Sistema

TuCita Online es una plataforma web que permite a pacientes agendar, gestionar y consultar citas m�dicas de manera eficiente, mientras proporciona a los profesionales de la salud herramientas para administrar sus consultas y mantener registros m�dicos digitales.

---

## ?? Actores del Sistema

### 1. **Paciente/Usuario**
- Usuario registrado que puede agendar y gestionar citas m�dicas
- Acceso a su historial m�dico completo
- Gesti�n de perfil personal y preferencias

### 2. **M�dico/Doctor**
- Profesional de salud con especializaci�n
- Gesti�n de turnos y disponibilidad
- Creaci�n de registros m�dicos (diagn�sticos, recetas, notas cl�nicas)

### 3. **Administrador del Sistema**
- Gesti�n de usuarios y permisos
- Configuraci�n del sistema
- Acceso a todas las funcionalidades

---

## ?? Requerimientos Funcionales Detallados

---

### RF-001: Registro de Usuarios
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
El sistema debe permitir que nuevos usuarios se registren proporcionando su informaci�n personal.

**Criterios de Aceptaci�n:**
- ? El usuario puede registrarse con: nombre, apellido, email, tel�fono, contrase�a
- ? El email debe ser �nico en el sistema
- ? La contrase�a debe tener un m�nimo de 6 caracteres
- ? Se valida que las contrase�as coincidan
- ? Se hashea la contrase�a con BCrypt antes de almacenarla
- ? Al registrarse, el usuario recibe un token JWT
- ? Se crea autom�ticamente un registro con rol de PACIENTE

**Endpoint:** `POST /api/auth/register`

**Validaciones:**
```csharp
- Email �nico: No puede existir otro usuario con el mismo email
- Password m�nimo 6 caracteres
- Campos obligatorios: nombre, apellido, email, password
- Formato de email v�lido
```

---

### RF-002: Inicio de Sesi�n
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Los usuarios registrados deben poder iniciar sesi�n con sus credenciales.

**Criterios de Aceptaci�n:**
- ? Login con email y contrase�a
- ? Validaci�n de credenciales contra base de datos
- ? Generaci�n de token JWT con expiraci�n de 7 d�as
- ? Token incluye: userId, email, nombre completo
- ? Manejo de errores para credenciales inv�lidas

**Endpoint:** `POST /api/auth/login`

**Respuesta exitosa:**
```json
{
  "id": 1,
  "name": "Juan P�rez",
  "email": "juan@example.com",
  "phone": "+506 1234-5678",
  "avatar": null,
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

### RF-003: Recuperaci�n de Contrase�a
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripci�n:**  
Los usuarios deben poder recuperar su contrase�a mediante email.

**Criterios de Aceptaci�n:**
- ? Solicitud de recuperaci�n por email
- ? Generaci�n de token �nico de reset (v�lido por 1 hora)
- ? Env�o de email con enlace de recuperaci�n
- ? Validaci�n de token antes de permitir cambio
- ? Cambio de contrase�a con confirmaci�n

**Endpoints:**
- `POST /api/auth/request-password-reset` - Solicitar recuperaci�n
- `POST /api/auth/validate-reset-token` - Validar token
- `POST /api/auth/reset-password` - Restablecer contrase�a

**Flujo:**
1. Usuario solicita recuperaci�n con su email
2. Sistema genera token y lo guarda con expiraci�n de 1 hora
3. Se env�a email con enlace que incluye el token
4. Usuario accede al enlace, token se valida
5. Usuario ingresa nueva contrase�a
6. Token se invalida despu�s del uso

---

### RF-004: Cierre de Sesi�n
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripci�n:**  
Los usuarios deben poder cerrar sesi�n de forma segura.

**Criterios de Aceptaci�n:**
- ? Endpoint de logout requiere autenticaci�n
- ? Se elimina el token del lado del cliente (localStorage)
- ? Redirecci�n a p�gina de inicio

**Endpoint:** `POST /api/auth/logout`

---

### RF-005: Visualizaci�n de Perfil
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Los usuarios autenticados pueden ver su informaci�n personal completa.

**Criterios de Aceptaci�n:**
- ? Obtener perfil del usuario autenticado
- ? Informaci�n incluye: nombre, apellido, email, tel�fono, fecha de nacimiento, identificaci�n, tel�fono de emergencia
- ? Muestra fechas de creaci�n y �ltima actualizaci�n

**Endpoint:** `GET /api/profile`

---

### RF-006: Edici�n de Perfil
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Los usuarios pueden actualizar su informaci�n personal.

**Criterios de Aceptaci�n:**
- ? Actualizaci�n de: nombre, apellido, email, tel�fono, fecha de nacimiento, identificaci�n, tel�fono de emergencia
- ? Validaci�n de email �nico (si se cambia)
- ? Actualizaci�n autom�tica del campo `actualizado_en`
- ? Retorna informaci�n actualizada del usuario

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

### RF-007: Cambio de Contrase�a
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Los usuarios pueden cambiar su contrase�a actual.

**Criterios de Aceptaci�n:**
- ? Validaci�n de contrase�a actual
- ? Nueva contrase�a m�nimo 6 caracteres
- ? Confirmaci�n de nueva contrase�a
- ? Hasheo de nueva contrase�a con BCrypt
- ? Actualizaci�n en base de datos

**Endpoint:** `POST /api/profile/change-password`

---

### RF-008: B�squeda de M�dicos
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Los usuarios pueden buscar m�dicos por especialidad y disponibilidad.

**Criterios de Aceptaci�n:**
- ? B�squeda sin autenticaci�n requerida
- ? Filtros por: especialidad, nombre, ubicaci�n
- ? Paginaci�n de resultados
- ? Informaci�n b�sica del m�dico: nombre, especialidades, ubicaci�n, rating
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

### RF-009: Detalle de M�dico
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Ver informaci�n completa de un m�dico espec�fico.

**Criterios de Aceptaci�n:**
- ? Informaci�n detallada del m�dico
- ? Listado de especialidades
- ? Biograf�a y experiencia
- ? Informaci�n de contacto
- ? Horarios disponibles

**Endpoint:** `GET /api/doctors/{id}`

---

### RF-010: Obtener Turnos Disponibles
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Consultar los turnos/slots disponibles de un m�dico para agendar citas.

**Criterios de Aceptaci�n:**
- ? Filtro por fecha espec�fica o rango de fechas
- ? Solo muestra turnos con estado DISPONIBLE
- ? Informaci�n incluye: fecha, hora inicio, hora fin, duraci�n
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

**Descripci�n:**  
Los pacientes autenticados pueden agendar una cita m�dica.

**Criterios de Aceptaci�n:**
- ? Requiere autenticaci�n
- ? Validaci�n de turno disponible
- ? Validaci�n de que el turno no est� ya tomado
- ? Creaci�n de cita con estado PENDIENTE
- ? Actualizaci�n del turno a estado OCUPADO
- ? Env�o de email de confirmaci�n al paciente
- ? C�lculo autom�tico de fecha fin basado en duraci�n del turno

**Endpoint:** `POST /api/appointments`

**Request Body:**
```typescript
{
  turnoId: number,
  motivo?: string
}
```

**Validaciones:**
- Turno existe y est� DISPONIBLE
- Paciente no tiene otra cita en el mismo horario
- Turno no se cruza con citas existentes del paciente

**Proceso:**
1. Validar turno disponible
2. Obtener informaci�n del m�dico
3. Crear registro de cita
4. Actualizar estado del turno a OCUPADO
5. Enviar email de confirmaci�n
6. Retornar informaci�n completa de la cita

---

### RF-012: Listar Mis Citas
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Los pacientes pueden ver todas sus citas agendadas.

**Criterios de Aceptaci�n:**
- ? Requiere autenticaci�n
- ? Retorna solo citas del usuario autenticado
- ? Incluye informaci�n del m�dico y turno
- ? Ordenadas por fecha (m�s recientes primero)
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

**Descripci�n:**  
Ver informaci�n completa de una cita espec�fica.

**Criterios de Aceptaci�n:**
- ? Requiere autenticaci�n
- ? Solo el paciente de la cita puede verla
- ? Informaci�n completa del m�dico y turno
- ? Estado actual de la cita

**Endpoint:** `GET /api/appointments/{id}`

---

### RF-014: Cancelar Cita
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Los pacientes pueden cancelar sus citas agendadas.

**Criterios de Aceptaci�n:**
- ? Requiere autenticaci�n
- ? Solo el paciente puede cancelar su propia cita
- ? Actualiza estado de cita a CANCELADA
- ? Libera el turno (cambia estado a DISPONIBLE)
- ? Env�o de email de notificaci�n de cancelaci�n
- ? No se puede cancelar una cita ya ATENDIDA o CANCELADA

**Endpoint:** `DELETE /api/appointments/{id}`

**Proceso:**
1. Validar que la cita pertenece al usuario
2. Validar estado de la cita (debe ser PENDIENTE o CONFIRMADA)
3. Actualizar estado de cita a CANCELADA
4. Liberar turno asociado (DISPONIBLE)
5. Enviar email de confirmaci�n de cancelaci�n
6. Retornar confirmaci�n

---

### RF-015: Reagendar Cita
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripci�n:**  
Los pacientes pueden cambiar el horario de una cita existente.

**Criterios de Aceptaci�n:**
- ? Requiere autenticaci�n
- ? Solo el paciente puede reagendar su propia cita
- ? Validaci�n de nuevo turno disponible
- ? Liberaci�n del turno anterior
- ? Asignaci�n del nuevo turno
- ? Actualizaci�n de fechas de la cita
- ? Env�o de email con nueva informaci�n
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
7. Enviar email de confirmaci�n
8. Retornar cita actualizada

---

### RF-016: Actualizar Estado de Cita
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripci�n:**  
Permitir actualizar el estado de una cita (PENDIENTE ? CONFIRMADA ? ATENDIDA).

**Criterios de Aceptaci�n:**
- ? Actualizaci�n de estado
- ? Validaci�n de transiciones v�lidas de estado
- ? Estados permitidos: PENDIENTE, CONFIRMADA, ATENDIDA, CANCELADA
- ? Trigger autom�tico actualiza `actualizado_en`

**Endpoint:** `PUT /api/appointments/{id}`

**Transiciones v�lidas:**
```
PENDIENTE ? CONFIRMADA
CONFIRMADA ? ATENDIDA
PENDIENTE/CONFIRMADA ? CANCELADA
```

---

### RF-017: Ver Historial M�dico del Paciente
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Los pacientes pueden consultar su historial m�dico completo.

**Criterios de Aceptaci�n:**
- ? Requiere autenticaci�n
- ? Solo retorna citas con estado ATENDIDA
- ? Incluye: diagn�sticos, recetas, notas cl�nicas, documentos
- ? Informaci�n del m�dico que atendi�
- ? Ordenado por fecha de cita (m�s reciente primero)

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

### RF-018: Ver Detalle de Cita M�dica
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Ver informaci�n completa de una cita espec�fica incluyendo todos los registros m�dicos.

**Criterios de Aceptaci�n:**
- ? Informaci�n completa de la cita
- ? Datos del paciente y m�dico
- ? Todos los diagn�sticos asociados
- ? Notas cl�nicas del m�dico
- ? Recetas con medicamentos
- ? Documentos adjuntos

**Endpoint:** `GET /api/historial/cita/{citaId}`

---

### RF-019: Crear Nota Cl�nica (Solo M�dicos)
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Los m�dicos pueden agregar notas cl�nicas durante o despu�s de una consulta.

**Criterios de Aceptaci�n:**
- ? Requiere autenticaci�n
- ? Solo m�dicos pueden crear notas
- ? Asociada a una cita espec�fica
- ? Contenido de texto libre
- ? Fecha autom�tica de creaci�n

**Endpoint:** `POST /api/historial/nota`

**Request Body:**
```typescript
{
  citaId: number,
  contenido: string
}
```

---

### RF-020: Crear Diagn�stico (Solo M�dicos)
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Los m�dicos pueden registrar diagn�sticos para las citas atendidas.

**Criterios de Aceptaci�n:**
- ? Requiere autenticaci�n de m�dico
- ? C�digo de diagn�stico opcional (CIE-10)
- ? Descripci�n obligatoria
- ? Asociado a una cita espec�fica
- ? M�ltiples diagn�sticos por cita

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

### RF-021: Crear Receta M�dica (Solo M�dicos)
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Los m�dicos pueden crear recetas con medicamentos para sus pacientes.

**Criterios de Aceptaci�n:**
- ? Requiere autenticaci�n de m�dico
- ? Asociada a una cita espec�fica
- ? M�ltiples medicamentos por receta
- ? Informaci�n detallada por medicamento: dosis, frecuencia, duraci�n
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
      duracion?: string,       // Ej: "7 d�as"
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
      "duracion": "7 d�as",
      "notas": "Completar tratamiento"
    },
    {
      "medicamento": "Ibuprofeno",
      "dosis": "400mg",
      "frecuencia": "Cada 6 horas si hay dolor",
      "duracion": "5 d�as"
    }
  ]
}
```

---

### RF-022: Subir Documento M�dico (Solo M�dicos)
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripci�n:**  
Los m�dicos pueden adjuntar documentos m�dicos a una cita (laboratorios, im�genes, etc.).

**Criterios de Aceptaci�n:**
- ? Requiere autenticaci�n de m�dico
- ? Categor�as: LAB, IMAGEN, REFERENCIA, CONSTANCIA, OTRO
- ? Metadatos del archivo: nombre, tipo MIME, tama�o
- ? Etiquetas opcionales para b�squeda
- ? Notas adicionales opcionales
- ? Informaci�n de almacenamiento en Azure Blob

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

### RF-023: Eliminar Documento M�dico
**Prioridad:** Baja  
**Estado:** ? Implementado

**Descripci�n:**  
Eliminar un documento m�dico de una cita.

**Criterios de Aceptaci�n:**
- ? Requiere autenticaci�n
- ? Permisos: m�dico que lo cre�, paciente de la cita, o admin
- ? Eliminaci�n de base de datos (soft delete posible)
- ? Opcionalmente eliminar de Azure Blob Storage

**Endpoint:** `DELETE /api/historial/documento/{documentoId}`

---

### RF-024: Notificaci�n de Cita Creada
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Env�o autom�tico de email cuando se crea una nueva cita.

**Criterios de Aceptaci�n:**
- ? Email enviado al paciente
- ? Informaci�n de la cita: fecha, hora, m�dico, especialidad
- ? Instrucciones de contacto
- ? Dise�o responsive HTML

**Trigger:** Al crear una cita exitosamente

**Contenido del email:**
- Confirmaci�n de cita agendada
- Detalles del m�dico
- Fecha y hora
- Direcci�n del consultorio
- Instrucciones de preparaci�n (si aplica)

---

### RF-025: Notificaci�n de Cita Cancelada
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Env�o autom�tico de email cuando se cancela una cita.

**Criterios de Aceptaci�n:**
- ? Email enviado al paciente
- ? Informaci�n de la cita cancelada
- ? Enlace para reagendar
- ? Informaci�n de contacto

**Trigger:** Al cancelar una cita

**Contenido del email:**
- Confirmaci�n de cancelaci�n
- Detalles de la cita cancelada
- Opciones para reagendar
- Informaci�n de contacto

---

### RF-026: Notificaci�n de Cita Reagendada
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripci�n:**  
Env�o autom�tico de email cuando se reagenda una cita.

**Criterios de Aceptaci�n:**
- ? Email enviado al paciente
- ? Comparaci�n de horario anterior vs nuevo
- ? Nueva informaci�n del turno
- ? Confirmaci�n del m�dico

**Trigger:** Al reagendar exitosamente

**Contenido del email:**
- Confirmaci�n de reagendamiento
- Horario anterior tachado
- Nuevo horario destacado
- Informaci�n actualizada

---

### RF-027: Email de Recuperaci�n de Contrase�a
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Env�o de email con enlace para restablecer contrase�a.

**Criterios de Aceptaci�n:**
- ? Email con enlace �nico y temporal (1 hora)
- ? Instrucciones claras
- ? Advertencias de seguridad
- ? Enlace funcional directo a formulario de reset

**Trigger:** Al solicitar recuperaci�n de contrase�a

**Contenido del email:**
- Enlace �nico de recuperaci�n
- Tiempo de expiraci�n del enlace
- Advertencias de seguridad
- Instrucciones paso a paso

---

### RF-028: Autenticaci�n JWT
**Prioridad:** Cr�tica  
**Estado:** ? Implementado

**Descripci�n:**  
Sistema de autenticaci�n basado en tokens JWT.

**Criterios de Aceptaci�n:**
- ? Token generado con clave secreta desde variables de entorno
- ? Expiraci�n de 7 d�as
- ? Claims incluyen: userId, email, nombre completo
- ? Validaci�n de token en cada request protegido
- ? Issuer y Audience configurables

---

### RF-029: Autorizaci�n por Roles
**Prioridad:** Alta  
**Estado:** ?? Parcialmente implementado

**Descripci�n:**  
Control de acceso basado en roles de usuario.

**Roles definidos:**
- ? PACIENTE: Usuario est�ndar
- ? MEDICO: Profesional de salud
- ? ADMIN: Administrador del sistema

**Permisos:**
- Pacientes: Agendar citas, ver su historial, editar perfil
- M�dicos: Todo lo anterior + crear registros m�dicos, gestionar turnos
- Admin: Acceso completo al sistema

---

### RF-030: Validaci�n de Entrada de Datos
**Prioridad:** Alta  
**Estado:** ? Implementado

**Descripci�n:**  
Todas las entradas de usuario son validadas antes de procesarse.

**Validaciones implementadas:**
- ? Formato de email
- ? Longitud de contrase�as
- ? Campos requeridos vs opcionales
- ? Tipos de datos correctos
- ? Rangos de valores v�lidos
- ? Unicidad de emails
- ? Validaci�n de fechas
- ? Prevenci�n de SQL Injection (Entity Framework)
- ? Prevenci�n de XSS (sanitizaci�n autom�tica)

---

### RF-031: Triggers de Base de Datos
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripci�n:**  
Triggers autom�ticos para mantener integridad de datos.

**Triggers implementados:**

1. **Actualizaci�n autom�tica de timestamps:**
   - ? `TR_usuarios_update_timestamp`
   - ? `TR_citas_update_timestamp`
   - ? `TR_turnos_update_timestamp`
   - ? `TR_notificaciones_update_timestamp`
   - ? `TR_preferencias_notificacion_update_timestamp`

2. **Gesti�n de estados:**
   - ? Validaci�n de transiciones de estado en citas
   - ? Actualizaci�n autom�tica de estado de turnos

---

### RF-032: Dashboard de Usuario
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripci�n:**  
Vista general del paciente con informaci�n relevante.

**Informaci�n mostrada:**
- ? Pr�ximas citas
- ? Historial reciente
- ? Accesos r�pidos
- ? Notificaciones pendientes

---

### RF-033: B�squeda Avanzada de M�dicos
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripci�n:**  
B�squeda con m�ltiples criterios.

**Filtros disponibles:**
- ? Especialidad
- ? Nombre del m�dico
- ? Ubicaci�n
- ? Disponibilidad
- ? Rating/Valoraci�n (simulado)

---

### RF-034: Cat�logo de Especialidades
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripci�n:**  
Listado de especialidades m�dicas disponibles.

**Especialidades incluidas:**
- Medicina General
- Cardiolog�a
- Dermatolog�a
- Pediatr�a
- Ginecolog�a
- Oftalmolog�a
- Traumatolog�a
- Neurolog�a
- Psiquiatr�a
- Odontolog�a
- Y m�s...

---

### RF-035: Datos de Prueba (Seeding)
**Prioridad:** Media  
**Estado:** ? Implementado

**Descripci�n:**  
Poblaci�n inicial de base de datos para desarrollo y testing.

**Datos de prueba:**
- ? 20+ m�dicos con diferentes especialidades
- ? 100+ turnos disponibles
- ? Usuarios de prueba
- ? Citas de ejemplo
- ? Historial m�dico simulado
- ? Diagn�sticos, recetas y documentos de prueba

---

## ?? Resumen de Implementaci�n

| M�dulo | Requerimientos | Estado | Cobertura |
|--------|---------------|--------|-----------|
| **1. Autenticaci�n** | RF-001 a RF-004 (4) | ? Completo | 100% |
| **2. Perfil de Usuario** | RF-005 a RF-007 (3) | ? Completo | 100% |
| **3. B�squeda de M�dicos** | RF-008 a RF-010 (3) | ? Completo | 100% |
| **4. Gesti�n de Citas** | RF-011 a RF-016 (6) | ? Completo | 100% |
| **5. Historial M�dico** | RF-017 a RF-023 (7) | ? Completo | 100% |
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
3. Busca m�dico por especialidad **(RF-008)**
4. Selecciona turno disponible **(RF-010)**
5. Agenda cita con motivo de consulta **(RF-011)**
6. Recibe confirmaci�n por email **(RF-024)**
7. Sistema reserva el turno

### Flujo 2: Consulta M�dica Completa
1. Paciente llega a su cita
2. M�dico accede a historial del paciente **(RF-017)**
3. Realiza consulta y examen
4. Crea nota cl�nica con observaciones **(RF-019)**
5. Registra diagn�stico(s) **(RF-020)**
6. Genera receta con medicamentos **(RF-021)**
7. Adjunta documentos (laboratorios, im�genes) **(RF-022)**
8. Actualiza estado de cita a ATENDIDA **(RF-016)**
9. Paciente puede ver todo el registro en su historial

### Flujo 3: Cancelaci�n y Reagendamiento
1. Paciente accede a "Mis Citas" **(RF-012)**
2. Selecciona cita a modificar **(RF-013)**
3. Opci�n 1: Cancela **(RF-014)** (libera turno, recibe confirmaci�n **(RF-025)**)
4. Opci�n 2: Reagenda **(RF-015)** (selecciona nuevo turno, actualiza cita, recibe email **(RF-026)**)
5. Sistema notifica por email
6. Turnos se actualizan autom�ticamente

---

## ?? M�tricas y KPIs

### M�tricas de Negocio
- N�mero de citas agendadas diarias/semanales/mensuales
- Tasa de cancelaci�n de citas
- Tasa de utilizaci�n de turnos
- Tiempo promedio de respuesta del sistema
- N�mero de usuarios registrados
- N�mero de m�dicos activos
- Especialidades m�s solicitadas

### M�tricas T�cnicas
- Tiempo de respuesta de APIs (< 500ms)
- Disponibilidad del sistema (99.9%)
- Tasa de �xito de env�o de emails
- Errores de autenticaci�n
- Concurrencia de usuarios

---

## ?? Cumplimiento y Privacidad

### HIPAA / Datos Sensibles
- ? Datos m�dicos encriptados en tr�nsito (HTTPS) **(RF-028)**
- ? Contrase�as hasheadas (BCrypt) **(RF-001, RF-007)**
- ? Tokens JWT con expiraci�n **(RF-028)**
- ? Acceso controlado por roles **(RF-029)**
- ?? Auditor�a de accesos (por implementar)
- ?? Encriptaci�n de datos en reposo (Azure SQL)

### Privacidad del Paciente
- ? Solo el paciente puede ver su historial completo **(RF-017)**
- ? M�dicos solo ven historial de sus pacientes
- ? Administradores tienen acceso completo (auditado)
- ? Eliminaci�n de cuenta (soft delete)

---

## ?? Pr�ximas Funcionalidades (Roadmap)

### Corto Plazo (v1.1)
- **RF-036:** Sistema de notificaciones push en navegador
- **RF-037:** Recordatorios autom�ticos 24h antes de cita
- **RF-038:** Valoraci�n y rese�as de m�dicos
- **RF-039:** Chat en tiempo real paciente-m�dico

### Mediano Plazo (v1.2)
- **RF-040:** Videoconsultas (telemedicina)
- **RF-041:** Pagos en l�nea
- **RF-042:** Integraci�n con seguros m�dicos
- **RF-043:** App m�vil nativa (iOS/Android)

### Largo Plazo (v2.0)
- **RF-044:** Inteligencia artificial para recomendaci�n de m�dicos
- **RF-045:** An�lisis predictivo de disponibilidad
- **RF-046:** Portal para administradores de cl�nicas
- **RF-047:** Integraci�n con sistemas de facturaci�n

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

**Elaborado por:** Sistema de Gesti�n TuCita  
**�ltima actualizaci�n:** Diciembre 2024  
**Versi�n:** 1.0  
**Estado:** Documento Oficial de Requerimientos  
**Total de Requerimientos:** 35 implementados + 12 en roadmap = 47 totales
