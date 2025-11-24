# Backend AdminCitas - Documentación

## ?? Descripción General

El backend para la gestión administrativa de citas (`AdminCitas.tsx`) está **100% funcional** y listo para usar.

## ??? Arquitectura

```
Backend (C# .NET 8)
??? Controller: AdminCitasController.cs
??? Service: AdminCitasService.cs (con IAdminCitasService)
??? DTOs: AdminCitasDto.cs

Frontend (TypeScript + React)
??? Componente: AdminCitas.tsx ? CON ACCIONES DE ESTADO
??? Servicio: adminCitasService.ts
??? Config: apiConfig.ts
```

## ?? **NUEVAS FUNCIONALIDADES - Actualización de Estado**

### ?? Acciones Rápidas desde la Tabla

Cada cita ahora incluye un menú dropdown (?) con acciones contextuales basadas en su estado actual:

#### **Estados y Acciones Disponibles:**

```typescript
PROGRAMADA ? 
  ? Confirmar
  ? Marcar Atendida
  ??  Cancelar
  ? Marcar No Show

CONFIRMADA ?
  ? Marcar Atendida
  ??  Cancelar
  ? Marcar No Show

ATENDIDA ?
  (Sin acciones - estado final)

CANCELADA ?
  ?? Reactivar

NO_SHOW ?
  ?? Reactivar

RECHAZADA ?
  (Sin acciones - estado final)

REPROGRAMADA ?
  ? Confirmar
  ??  Cancelar
```

### ?? Características de la UI

1. **Menú Dropdown Contextual**
   - Icono "? Más" en cada fila
   - Acciones específicas según el estado
   - Iconos de colores para identificación rápida
   - Opción de "Eliminar cita" siempre disponible

2. **Diálogos de Confirmación**
   - Confirmación antes de cambiar estado
   - Campo de notas opcional
   - Muestra el nombre del paciente y fecha/hora
   - Indicadores de carga durante la actualización

3. **Feedback Visual**
   - Toast de éxito/error
   - Actualización instantánea en la tabla
   - Estados de carga con spinner
   - Badges de colores por estado

### ?? Flujos de Trabajo Comunes

#### Atender una Cita
```
1. Usuario hace clic en ? en la fila de la cita
2. Selecciona "Marcar Atendida"
3. Agrega notas (opcional): "Paciente atendido, todo normal"
4. Confirma
5. Estado cambia a ATENDIDA (verde)
```

#### Cancelar una Cita
```
1. Usuario hace clic en ?
2. Selecciona "Cancelar"
3. Agrega motivo: "Paciente solicitó cancelación"
4. Confirma
5. Estado cambia a CANCELADA (amarillo)
6. Turno se libera automáticamente
```

#### Marcar No Show
```
1. Usuario hace clic en ?
2. Selecciona "Marcar No Show"
3. Agrega nota: "Paciente no se presentó"
4. Confirma
5. Estado cambia a NO_SHOW (rojo)
6. Turno se libera automáticamente
```

## ?? Endpoints API

### 1. Buscar Pacientes
```http
GET /api/admin/citas/pacientes/search?q={busqueda}
Authorization: Bearer {token}
Roles: ADMIN
```

**Parámetros:**
- `q` (string, min 2 caracteres): Término de búsqueda

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Juan",
    "apellido": "Pérez",
    "nombreCompleto": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "1234567890",
    "identificacion": "12345678"
  }
]
```

---

### 2. Obtener Doctores
```http
GET /api/admin/citas/doctores
Authorization: Bearer {token}
Roles: ADMIN
```

**Response:**
```json
[
  {
    "id": 1,
    "nombre": "Carlos",
    "apellido": "Martínez",
    "nombreCompleto": "Dr. Carlos Martínez",
    "especialidades": ["Cardiología", "Medicina General"]
  }
]
```

---

### 3. Doctores por Especialidad
```http
GET /api/admin/citas/doctores/especialidad/{especialidadId}
Authorization: Bearer {token}
Roles: ADMIN
```

**Parámetros:**
- `especialidadId` (number): ID de la especialidad

---

### 4. Slots Disponibles
```http
GET /api/admin/citas/doctores/{medicoId}/slots?fecha={fecha}
Authorization: Bearer {token}
Roles: ADMIN
```

**Parámetros:**
- `medicoId` (number): ID del médico
- `fecha` (string, yyyy-MM-dd): Fecha a consultar

**Response:**
```json
[
  {
    "turnoId": 1,
    "inicio": "2025-01-15T09:00:00",
    "fin": "2025-01-15T09:30:00",
    "hora": "09:00",
    "horaFin": "09:30"
  }
]
```

---

### 5. Crear Cita
```http
POST /api/admin/citas
Authorization: Bearer {token}
Roles: ADMIN
Content-Type: application/json
```

**Request Body:**
```json
{
  "pacienteId": 1,
  "medicoId": 2,
  "turnoId": 5,
  "motivo": "Consulta general",
  "notasInternas": "Paciente nuevo",
  "enviarEmail": true
}
```

**Response:**
```json
{
  "citaId": 10,
  "pacienteId": 1,
  "nombrePaciente": "Juan Pérez",
  "medicoId": 2,
  "nombreMedico": "Dr. Carlos Martínez",
  "inicio": "2025-01-15T09:00:00",
  "fin": "2025-01-15T09:30:00",
  "estado": "CONFIRMADA",
  "motivo": "Consulta general",
  "emailEnviado": true
}
```

---

### 6. Listar Citas (con filtros y paginación)
```http
GET /api/admin/citas?pagina=1&tamanoPagina=20&estado=PROGRAMADA&busqueda=Juan
Authorization: Bearer {token}
Roles: ADMIN
```

**Query Parameters:**
- `pagina` (number, default: 1)
- `tamanoPagina` (number, default: 20)
- `fechaDesde` (string, yyyy-MM-dd)
- `fechaHasta` (string, yyyy-MM-dd)
- `medicoId` (number)
- `pacienteId` (number)
- `estado` (string): PROGRAMADA, CONFIRMADA, ATENDIDA, CANCELADA, NO_SHOW, RECHAZADA
- `busqueda` (string): Búsqueda general

**Response:**
```json
{
  "citas": [
    {
      "id": 1,
      "paciente": "Juan Pérez",
      "pacienteId": 1,
      "doctor": "Dr. Carlos Martínez",
      "medicoId": 2,
      "especialidad": "Cardiología",
      "fecha": "2025-01-15T09:00:00",
      "fechaStr": "15/01/2025",
      "hora": "09:00",
      "estado": "PROGRAMADA",
      "motivo": "Consulta general",
      "origen": "ADMIN"
    }
  ],
  "totalRegistros": 50,
  "paginaActual": 1,
  "totalPaginas": 3,
  "tamanoPagina": 20
}
```

---

### 7. Detalle de Cita
```http
GET /api/admin/citas/{id}
Authorization: Bearer {token}
Roles: ADMIN
```

**Parámetros:**
- `id` (number): ID de la cita

---

### 8. Actualizar Estado ? **NUEVO**
```http
PATCH /api/admin/citas/{id}/estado
Authorization: Bearer {token}
Roles: ADMIN
Content-Type: application/json
```

**Request Body:**
```json
{
  "estado": "ATENDIDA",
  "notas": "Paciente atendido sin novedades"
}
```

**Casos de Uso:**
- Confirmar citas programadas
- Marcar citas como atendidas
- Cancelar citas
- Registrar no-shows
- Reactivar citas canceladas

---

### 9. Cancelar Cita
```http
DELETE /api/admin/citas/{id}
Authorization: Bearer {token}
Roles: ADMIN
```

**Nota:** Esta acción:
- Cambia el estado a CANCELADA
- Libera el turno automáticamente
- Registra nota de cancelación administrativa

---

## ?? Seguridad

- ? Todas las rutas requieren autenticación JWT
- ? Todas las rutas requieren rol `ADMIN`
- ? El token se envía en el header: `Authorization: Bearer {token}`
- ? Validación de datos con Data Annotations
- ? Manejo de errores robusto

## ?? Características del Servicio

### Validaciones de Negocio
- ? Verifica que el paciente existe y está activo
- ? Verifica que el médico existe y está activo
- ? Verifica que el turno existe y está disponible
- ? Previene doble reserva de turnos
- ? Valida transiciones de estado

### Auditoría
- ? Registra quién creó la cita (`CreadoPor`)
- ? Registra timestamp de creación (`CreadoEn`)
- ? Registra timestamp de actualización (`ActualizadoEn`)
- ? Guarda notas internas en `NotasClinicas`
- ? **Registra cambios de estado con notas del admin**

### Funcionalidades Extra
- ? Envío de email de confirmación (opcional)
- ? Liberación automática de turnos al cancelar
- ? Soporte para notas administrativas
- ? Búsqueda full-text en pacientes y doctores
- ? Paginación eficiente con LINQ
- ? **Menú contextual con acciones por estado**
- ? **Diálogos de confirmación con notas**

## ?? Frontend Conectado

### Componente: `AdminCitas.tsx` ? **ACTUALIZADO**

**Características:**
- ? Búsqueda de pacientes en tiempo real
- ? Filtros múltiples (estado, doctor, fechas)
- ? Paginación
- ? Indicadores de carga
- ? Manejo de errores con `toast`
- ? Tabla responsive
- ? Badges de colores por estado y origen
- ? **Menú dropdown con acciones contextuales**
- ? **Diálogos de confirmación para cambios de estado**
- ? **Campo de notas opcional en cada acción**
- ? **Actualización optimista del estado en la UI**
- ? **Iconos de colores para identificación rápida**

**Estados Soportados:**
```typescript
const statusColors = {
  PROGRAMADA: 'bg-blue-100 text-blue-800',
  CONFIRMADA: 'bg-blue-100 text-blue-800',
  ATENDIDA: 'bg-green-100 text-green-800',
  CANCELADA: 'bg-yellow-100 text-yellow-800',
  NO_SHOW: 'bg-red-100 text-red-800',
  RECHAZADA: 'bg-red-100 text-red-800',
  REPROGRAMADA: 'bg-purple-100 text-purple-800',
};
```

**Iconos por Acción:**
```typescript
? CheckCircle - Confirmar / Atender
?? Clock - Reactivar
??  XCircle - Cancelar
? AlertCircle - No Show
?? Ban - Eliminar
```

## ?? Uso del Servicio Frontend

```typescript
import adminCitasService from '@/services/api/admin/adminCitasService';

// Buscar pacientes
const pacientes = await adminCitasService.searchPacientes('Juan');

// Obtener doctores
const doctores = await adminCitasService.getDoctores();

// Obtener slots disponibles
const slots = await adminCitasService.getSlotsDisponibles(medicoId, '2025-01-15');

// Crear cita
const cita = await adminCitasService.createCita({
  pacienteId: 1,
  medicoId: 2,
  turnoId: 5,
  motivo: 'Consulta',
  enviarEmail: true
});

// Listar citas con filtros
const response = await adminCitasService.getCitasPaginadas({
  pagina: 1,
  tamanoPagina: 20,
  estado: 'PROGRAMADA',
  busqueda: 'Juan'
});

// ? Actualizar estado de cita
await adminCitasService.updateEstadoCita(citaId, {
  estado: 'ATENDIDA',
  notas: 'Paciente atendido correctamente'
});

// ? Cancelar/Eliminar cita
await adminCitasService.deleteCita(citaId);
```

## ?? Configuración

### Variables de Entorno (.env)
```env
DB_SERVER=your-server.database.windows.net
DB_NAME=TuCitaDB
DB_USER=admin_user
DB_PASSWORD=your_password
JWT_KEY=your-secret-key
JWT_ISSUER=TuCita
JWT_AUDIENCE=TuCitaUsers
```

### Registro de Servicios (Program.cs)
```csharp
builder.Services.AddScoped<IAdminCitasService, AdminCitasService>();
```
? **Ya configurado**

## ?? Logs

El servicio incluye logging detallado:

```csharp
_logger.LogInformation("Cita {CitaId} creada por admin {AdminId}", cita.CitaId, adminUserId);
_logger.LogWarning(ex, "Error de validación al crear cita");
_logger.LogError(ex, "Error al crear cita");
_logger.LogInformation("Cita {CitaId} actualizada de {EstadoAnterior} a {NuevoEstado}", 
    citaId, estadoAnterior, nuevoEstado);
```

## ?? Testing

### Ejemplo con Postman/cURL

```bash
# Crear cita
curl -X POST https://localhost:7063/api/admin/citas \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pacienteId": 1,
    "medicoId": 2,
    "turnoId": 5,
    "motivo": "Consulta general",
    "enviarEmail": true
  }'

# ? Actualizar estado
curl -X PATCH https://localhost:7063/api/admin/citas/10/estado \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "ATENDIDA",
    "notas": "Paciente atendido sin novedades"
  }'
```

## ?? Notas Importantes

1. **Transacciones**: La creación de citas usa transacciones para garantizar integridad
2. **Estados**: Las citas creadas por admin tienen estado `CONFIRMADA` (no requieren confirmación)
3. **Emails**: El envío de emails es opcional y no bloquea la creación de la cita
4. **Turnos**: Los turnos se liberan automáticamente al cancelar una cita
5. **Auditoría**: Todas las acciones quedan registradas con usuario y timestamp
6. **? Notas**: Cada cambio de estado puede incluir notas del administrador
7. **? UI Optimista**: La tabla se actualiza instantáneamente sin recargar

## ?? Componentes UI Utilizados

```typescript
// shadcn/ui components
- Card, CardContent
- Button
- Input
- Badge
- Select
- DropdownMenu ? NUEVO
- AlertDialog ? NUEVO
- Textarea ? NUEVO
- Label
- Loader (spinner)

// Icons (lucide-react)
- Plus, Search, Eye
- Loader2
- MoreVertical ? NUEVO
- CheckCircle, XCircle ? NUEVO
- Clock, AlertCircle, Ban ? NUEVO
```

## ?? Troubleshooting

### Error: "Usuario no autenticado"
- Verifica que el token esté en localStorage
- Verifica que el token sea válido (no expirado)
- Verifica que el usuario tenga rol ADMIN

### Error: "El turno no está disponible"
- El turno ya fue reservado por otra cita
- Recarga los slots disponibles

### Error: "Paciente no encontrado"
- Verifica que el pacienteId sea correcto
- Verifica que el paciente esté activo

### Error: "Estado inválido"
- Verifica que el estado sea uno de los válidos
- Respeta las transiciones de estado permitidas

## ? Estado del Proyecto

- ? Backend completo y funcional
- ? Frontend conectado y funcionando
- ? Validaciones implementadas
- ? Manejo de errores robusto
- ? Logging configurado
- ? Documentación completa
- ? **Menú de acciones contextual**
- ? **Actualización de estado desde la tabla**
- ? **Diálogos de confirmación**
- ? **Campo de notas administrativas**

## ?? Changelog

### v2.0 - Actualización de Estado desde Tabla ?
- ? Menú dropdown con acciones contextuales
- ? Diálogos de confirmación para cambios de estado
- ? Campo de notas opcional en actualizaciones
- ? Iconos de colores para identificación rápida
- ? Actualización optimista de la UI
- ? Botón de eliminar cita
- ?? Mejoras en la UX con feedback visual

### v1.0 - Versión Inicial
- ? CRUD completo de citas
- ? Filtros y búsqueda
- ? Paginación
- ? Integración con backend

---

**El sistema está listo para producción** ??

**Próximos pasos opcionales:**
1. ? ~~Agregar opciones de actualización de estado~~ **COMPLETADO**
2. Implementar `AdminCitasNueva.tsx` - Modal para crear nuevas citas
3. Implementar vista de detalle expandida
4. Agregar exportación a Excel/PDF
