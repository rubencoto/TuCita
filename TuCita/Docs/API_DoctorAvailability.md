# API de Disponibilidad de Doctores

Documentación del endpoint para gestionar los horarios de disponibilidad de los doctores.

## Base URL
```
/api/doctor/availability
```

## Endpoints

### 1. Obtener todos los slots
**GET** `/api/doctor/availability`

Obtiene todos los slots de disponibilidad, con filtros opcionales.

#### Query Parameters
| Parámetro | Tipo | Requerido | Descripción |
|-----------|------|-----------|-------------|
| `doctorId` | string | No | Filtra por ID del doctor |
| `fecha` | string | No | Filtra por fecha (formato: YYYY-MM-DD) |

#### Ejemplo de Request
```http
GET /api/doctor/availability?doctorId=DOC-001&fecha=2025-01-20
```

#### Ejemplo de Response (200 OK)
```json
[
  {
    "idSlot": 1,
    "doctorId": "DOC-001",
    "fecha": "2025-01-20",
    "horaInicio": "09:00",
    "horaFin": "10:00",
    "tipo": "PRESENCIAL",
    "estado": "DISPONIBLE"
  },
  {
    "idSlot": 2,
    "doctorId": "DOC-001",
    "fecha": "2025-01-20",
    "horaInicio": "10:00",
    "horaFin": "11:00",
    "tipo": "TELECONSULTA",
    "estado": "OCUPADO"
  }
]
```

---

### 2. Obtener un slot específico
**GET** `/api/doctor/availability/{id}`

Obtiene los detalles de un slot específico por su ID.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | long | ID del slot |

#### Ejemplo de Request
```http
GET /api/doctor/availability/1
```

#### Ejemplo de Response (200 OK)
```json
{
  "idSlot": 1,
  "doctorId": "DOC-001",
  "fecha": "2025-01-20",
  "horaInicio": "09:00",
  "horaFin": "10:00",
  "tipo": "PRESENCIAL",
  "estado": "DISPONIBLE"
}
```

#### Response de Error (404 Not Found)
```json
{
  "message": "Slot con ID 999 no encontrado"
}
```

---

### 3. Crear un nuevo slot
**POST** `/api/doctor/availability`

Crea un nuevo slot de disponibilidad.

#### Request Body
```json
{
  "doctorId": "DOC-001",
  "fecha": "2025-01-20",
  "horaInicio": "14:00",
  "horaFin": "15:00",
  "tipo": "PRESENCIAL",
  "estado": "DISPONIBLE"
}
```

#### Validaciones
- ? El `doctorId` es requerido
- ? La fecha debe tener formato `YYYY-MM-DD`
- ? Las horas deben tener formato `HH:mm` (24 horas)
- ? `horaInicio` debe ser anterior a `horaFin`
- ? No puede crear slots en fechas pasadas
- ? No puede solaparse con otros slots del mismo doctor en la misma fecha

#### Ejemplo de Response (201 Created)
```json
{
  "idSlot": 10,
  "doctorId": "DOC-001",
  "fecha": "2025-01-20",
  "horaInicio": "14:00",
  "horaFin": "15:00",
  "tipo": "PRESENCIAL",
  "estado": "DISPONIBLE"
}
```

#### Response de Error (400 Bad Request)
```json
{
  "message": "Formato de hora de inicio inválido (debe ser HH:mm)"
}
```

#### Response de Error (409 Conflict)
```json
{
  "message": "El horario se solapa con otro slot existente"
}
```

---

### 4. Actualizar un slot
**PUT** `/api/doctor/availability/{id}`

Actualiza un slot existente. Todos los campos son opcionales.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | long | ID del slot a actualizar |

#### Request Body (parcial)
```json
{
  "horaInicio": "09:30",
  "horaFin": "10:30",
  "tipo": "TELECONSULTA",
  "estado": "BLOQUEADO"
}
```

#### Validaciones
- ? No se pueden modificar slots con estado `OCUPADO`
- ? Las horas deben tener formato `HH:mm`
- ? `horaInicio` debe ser anterior a `horaFin`
- ? No puede solaparse con otros slots (excluyendo el actual)

#### Ejemplo de Response (200 OK)
```json
{
  "idSlot": 1,
  "doctorId": "DOC-001",
  "fecha": "2025-01-20",
  "horaInicio": "09:30",
  "horaFin": "10:30",
  "tipo": "TELECONSULTA",
  "estado": "BLOQUEADO"
}
```

#### Response de Error (400 Bad Request)
```json
{
  "message": "No se pueden modificar slots ocupados"
}
```

---

### 5. Eliminar un slot
**DELETE** `/api/doctor/availability/{id}`

Elimina un slot de disponibilidad.

#### Path Parameters
| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `id` | long | ID del slot a eliminar |

#### Validaciones
- ? No se pueden eliminar slots con estado `OCUPADO`

#### Ejemplo de Request
```http
DELETE /api/doctor/availability/1
```

#### Response (204 No Content)
Sin contenido en el cuerpo de la respuesta.

#### Response de Error (400 Bad Request)
```json
{
  "message": "No se pueden eliminar slots ocupados. Primero cancele las citas asociadas."
}
```

#### Response de Error (404 Not Found)
```json
{
  "message": "Slot con ID 999 no encontrado"
}
```

---

## Modelos de Datos

### DoctorSlotDto
```typescript
{
  idSlot: number;          // ID único del slot
  doctorId: string;        // ID del doctor
  fecha: string;           // Formato: YYYY-MM-DD
  horaInicio: string;      // Formato: HH:mm (24h)
  horaFin: string;         // Formato: HH:mm (24h)
  tipo: SlotTipo;          // PRESENCIAL | TELECONSULTA
  estado: SlotEstado;      // DISPONIBLE | BLOQUEADO | OCUPADO
}
```

### SlotTipo (Enum)
- `PRESENCIAL` - Consulta presencial en consultorio
- `TELECONSULTA` - Consulta virtual/remota

### SlotEstado (Enum)
- `DISPONIBLE` - Slot disponible para reservar
- `BLOQUEADO` - Slot bloqueado por el doctor (no disponible)
- `OCUPADO` - Slot con cita agendada (no se puede modificar/eliminar)

---

## Códigos de Estado HTTP

| Código | Significado |
|--------|-------------|
| 200 | OK - Operación exitosa |
| 201 | Created - Recurso creado exitosamente |
| 204 | No Content - Eliminación exitosa |
| 400 | Bad Request - Datos inválidos o violación de reglas de negocio |
| 404 | Not Found - Recurso no encontrado |
| 409 | Conflict - Conflicto con el estado actual (ej: solapamiento) |
| 500 | Internal Server Error - Error del servidor |

---

## Ejemplos de Uso con TypeScript

### Obtener todos los slots de un doctor
```typescript
import * as availabilityService from './services/doctorAvailabilityService';

const slots = await availabilityService.getSlots('DOC-001');
console.log(slots);
```

### Crear un nuevo slot
```typescript
const newSlot = await availabilityService.createSlot({
  doctorId: 'DOC-001',
  fecha: '2025-01-20',
  horaInicio: '14:00',
  horaFin: '15:00',
  tipo: 'PRESENCIAL',
  estado: 'DISPONIBLE'
});
```

### Actualizar un slot
```typescript
const updated = await availabilityService.updateSlot(1, {
  estado: 'BLOQUEADO'
});
```

### Eliminar un slot
```typescript
await availabilityService.deleteSlot(1);
```

---

## Notas de Implementación

### Estado Actual
- ? Almacenamiento en memoria con `ConcurrentDictionary`
- ? Datos de ejemplo pre-cargados
- ? Validaciones completas
- ? Logging de operaciones
- ? Manejo de errores robusto

### Próximos Pasos (Producción)
- [ ] Integrar con `TuCitaDbContext` y tabla `AgendaTurno`
- [ ] Agregar autenticación y autorización
- [ ] Implementar paginación para listados grandes
- [ ] Agregar filtros avanzados (rango de fechas, tipo, estado)
- [ ] Implementar notificaciones cuando se modifiquen slots con citas

---

## Consideraciones de Seguridad

1. **Autenticación**: Agregar `[Authorize]` attribute
2. **Autorización**: Validar que el doctor solo pueda modificar sus propios slots
3. **Validación de entrada**: Ya implementada
4. **Rate limiting**: Considerar agregar para prevenir abuso
5. **Logging**: Ya implementado para auditoría

---

## Migración a Base de Datos

Para migrar de almacenamiento en memoria a base de datos:

1. Inyectar `TuCitaDbContext` en el constructor
2. Reemplazar `_slots` con queries a `context.AgendaTurnos`
3. Agregar columna `Tipo` a la tabla `agenda_turnos`
4. Mapear entre `AgendaTurno` (modelo) y `DoctorSlotDto`

Ejemplo de mapeo:
```csharp
private DoctorSlotDto MapToDto(AgendaTurno turno)
{
    return new DoctorSlotDto
    {
        IdSlot = turno.Id,
        DoctorId = turno.MedicoId.ToString(),
        Fecha = DateOnly.FromDateTime(turno.Inicio).ToString("yyyy-MM-dd"),
        HoraInicio = TimeOnly.FromDateTime(turno.Inicio).ToString("HH:mm"),
        HoraFin = TimeOnly.FromDateTime(turno.Fin).ToString("HH:mm"),
        Tipo = turno.Tipo, // Requiere agregar campo
        Estado = MapEstado(turno.Estado)
    };
}
```
