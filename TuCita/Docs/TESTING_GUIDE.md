# Guía de Pruebas - API de Disponibilidad de Doctores

## ?? Cómo Probar el Backend

### Opción 1: Usar el Frontend (Recomendado)

1. **Iniciar el backend**
   ```bash
   cd TuCita
   dotnet run
   ```

2. **Iniciar el frontend** (en otra terminal)
   ```bash
   cd TuCita/ClientApp
   npm run dev
   ```

3. **Navegar a la página**
   - Ir a `http://localhost:5173` (o el puerto que use Vite)
   - Hacer login como doctor
   - Ir a "Gestión de Disponibilidad"

4. **Operaciones a probar:**
   - ? Ver slots existentes en el calendario
   - ? Crear un nuevo slot
   - ? Editar hora de un slot existente
   - ? Cambiar tipo (PRESENCIAL ? TELECONSULTA)
   - ? Cambiar estado (DISPONIBLE ? BLOQUEADO)
   - ? Eliminar un slot disponible/bloqueado
   - ? Intentar editar/eliminar un slot OCUPADO (debería fallar)

---

### Opción 2: Usar Swagger UI

1. **Iniciar el backend**
   ```bash
   cd TuCita
   dotnet run
   ```

2. **Abrir Swagger**
   - Navegar a: `https://localhost:5001/swagger`
   - Expandir la sección "DoctorAvailability"

3. **Probar endpoints:**

   **GET /api/doctor/availability**
   - Click en "Try it out"
   - (Opcional) Filtrar por `doctorId=DOC-001`
   - Click en "Execute"
   - Verificar respuesta 200 con lista de slots

   **POST /api/doctor/availability**
   ```json
   {
     "doctorId": "DOC-001",
     "fecha": "2025-01-25",
     "horaInicio": "14:00",
     "horaFin": "15:00",
     "tipo": "PRESENCIAL",
     "estado": "DISPONIBLE"
   }
   ```

   **PUT /api/doctor/availability/{id}**
   ```json
   {
     "estado": "BLOQUEADO"
   }
   ```

   **DELETE /api/doctor/availability/{id}**
   - Solo funciona si el slot NO está OCUPADO

---

### Opción 3: Usar cURL

#### Listar todos los slots
```bash
curl -X GET "https://localhost:5001/api/doctor/availability" -k
```

#### Listar slots de un doctor específico
```bash
curl -X GET "https://localhost:5001/api/doctor/availability?doctorId=DOC-001" -k
```

#### Listar slots de una fecha específica
```bash
curl -X GET "https://localhost:5001/api/doctor/availability?doctorId=DOC-001&fecha=2025-01-20" -k
```

#### Obtener un slot específico
```bash
curl -X GET "https://localhost:5001/api/doctor/availability/1" -k
```

#### Crear un nuevo slot
```bash
curl -X POST "https://localhost:5001/api/doctor/availability" \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "DOC-001",
    "fecha": "2025-01-25",
    "horaInicio": "16:00",
    "horaFin": "17:00",
    "tipo": "TELECONSULTA",
    "estado": "DISPONIBLE"
  }' \
  -k
```

#### Actualizar un slot
```bash
curl -X PUT "https://localhost:5001/api/doctor/availability/1" \
  -H "Content-Type: application/json" \
  -d '{
    "horaInicio": "09:30",
    "horaFin": "10:30",
    "tipo": "PRESENCIAL",
    "estado": "BLOQUEADO"
  }' \
  -k
```

#### Eliminar un slot
```bash
curl -X DELETE "https://localhost:5001/api/doctor/availability/1" -k
```

---

### Opción 4: Usar Postman/Insomnia

1. **Importar colección** (crear archivo `DoctorAvailability.postman_collection.json`):

```json
{
  "info": {
    "name": "Doctor Availability API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Get All Slots",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://localhost:5001/api/doctor/availability",
          "protocol": "https",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "doctor", "availability"]
        }
      }
    },
    {
      "name": "Get Slots by Doctor",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://localhost:5001/api/doctor/availability?doctorId=DOC-001",
          "protocol": "https",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "doctor", "availability"],
          "query": [{"key": "doctorId", "value": "DOC-001"}]
        }
      }
    },
    {
      "name": "Get Slot by ID",
      "request": {
        "method": "GET",
        "header": [],
        "url": {
          "raw": "https://localhost:5001/api/doctor/availability/1",
          "protocol": "https",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "doctor", "availability", "1"]
        }
      }
    },
    {
      "name": "Create Slot",
      "request": {
        "method": "POST",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"doctorId\": \"DOC-001\",\n  \"fecha\": \"2025-01-25\",\n  \"horaInicio\": \"14:00\",\n  \"horaFin\": \"15:00\",\n  \"tipo\": \"PRESENCIAL\",\n  \"estado\": \"DISPONIBLE\"\n}"
        },
        "url": {
          "raw": "https://localhost:5001/api/doctor/availability",
          "protocol": "https",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "doctor", "availability"]
        }
      }
    },
    {
      "name": "Update Slot",
      "request": {
        "method": "PUT",
        "header": [{"key": "Content-Type", "value": "application/json"}],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"estado\": \"BLOQUEADO\"\n}"
        },
        "url": {
          "raw": "https://localhost:5001/api/doctor/availability/1",
          "protocol": "https",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "doctor", "availability", "1"]
        }
      }
    },
    {
      "name": "Delete Slot",
      "request": {
        "method": "DELETE",
        "header": [],
        "url": {
          "raw": "https://localhost:5001/api/doctor/availability/1",
          "protocol": "https",
          "host": ["localhost"],
          "port": "5001",
          "path": ["api", "doctor", "availability", "1"]
        }
      }
    }
  ]
}
```

---

## ?? Casos de Prueba

### ? Casos Exitosos

1. **Crear slot válido**
   - Fecha futura
   - Hora inicio < hora fin
   - No se solapa con otros slots

2. **Actualizar slot disponible**
   - Cambiar horario
   - Cambiar tipo o estado

3. **Eliminar slot disponible/bloqueado**

### ? Casos de Error (Validaciones)

1. **Crear slot con formato inválido**
   ```json
   {
     "doctorId": "DOC-001",
     "fecha": "25-01-2025",  // ? Formato incorrecto
     "horaInicio": "2pm",     // ? Formato incorrecto
     "horaFin": "15:00",
     "tipo": "PRESENCIAL",
     "estado": "DISPONIBLE"
   }
   ```
   **Respuesta esperada:** 400 Bad Request

2. **Crear slot con hora fin antes de hora inicio**
   ```json
   {
     "doctorId": "DOC-001",
     "fecha": "2025-01-25",
     "horaInicio": "15:00",
     "horaFin": "14:00",  // ? Antes de inicio
     "tipo": "PRESENCIAL",
     "estado": "DISPONIBLE"
   }
   ```
   **Respuesta esperada:** 400 Bad Request

3. **Crear slot que se solapa**
   - Primero crear slot de 09:00 a 10:00
   - Intentar crear slot de 09:30 a 10:30
   
   **Respuesta esperada:** 409 Conflict

4. **Actualizar slot ocupado**
   ```json
   PUT /api/doctor/availability/2
   {
     "horaInicio": "10:30"
   }
   ```
   Si el slot 2 tiene estado OCUPADO:
   **Respuesta esperada:** 400 Bad Request

5. **Eliminar slot ocupado**
   ```
   DELETE /api/doctor/availability/2
   ```
   Si el slot 2 tiene estado OCUPADO:
   **Respuesta esperada:** 400 Bad Request

6. **Obtener slot inexistente**
   ```
   GET /api/doctor/availability/999
   ```
   **Respuesta esperada:** 404 Not Found

---

## ?? Datos de Ejemplo Pre-cargados

El backend inicia con los siguientes slots de ejemplo:

| ID | Doctor | Fecha | Hora Inicio | Hora Fin | Tipo | Estado |
|----|--------|-------|-------------|----------|------|--------|
| 1 | DOC-001 | Hoy | 09:00 | 10:00 | PRESENCIAL | DISPONIBLE |
| 2 | DOC-001 | Hoy | 10:00 | 11:00 | PRESENCIAL | OCUPADO |
| 3 | DOC-001 | Hoy | 11:00 | 12:00 | TELECONSULTA | DISPONIBLE |
| 4 | DOC-001 | Hoy | 16:00 | 17:00 | PRESENCIAL | BLOQUEADO |
| 5 | DOC-001 | Mañana | 09:00 | 10:00 | TELECONSULTA | DISPONIBLE |

**Nota:** "Hoy" y "Mañana" son dinámicos basados en `DateTime.Now`

---

## ?? Verificar Logs

Los logs del backend se muestran en la consola:

```
info: TuCita.Controllers.Api.DoctorAvailabilityController[0]
      Obtenidos 5 slots para doctor=DOC-001, fecha=todas
info: TuCita.Controllers.Api.DoctorAvailabilityController[0]
      Slot creado: ID=6, Doctor=DOC-001, Fecha=2025-01-25, Hora=14:00-15:00
```

---

## ? Checklist de Pruebas

- [ ] Listar todos los slots
- [ ] Filtrar por doctor
- [ ] Filtrar por fecha
- [ ] Obtener un slot específico
- [ ] Crear slot válido
- [ ] Crear slot con fecha pasada (debe fallar)
- [ ] Crear slot con formato inválido (debe fallar)
- [ ] Crear slot que se solapa (debe fallar)
- [ ] Actualizar horario de slot disponible
- [ ] Actualizar tipo de slot
- [ ] Actualizar estado de slot
- [ ] Intentar actualizar slot ocupado (debe fallar)
- [ ] Eliminar slot disponible
- [ ] Intentar eliminar slot ocupado (debe fallar)
- [ ] Verificar que los cambios se reflejan en el frontend

---

## ?? Troubleshooting

### Error: "Cannot find module '../ui/card'"
- Los errores de TypeScript relacionados con módulos UI son pre-existentes en el proyecto
- No afectan la funcionalidad del API

### Error: "Slot con ID X no encontrado"
- El almacenamiento es en memoria, se resetea al reiniciar
- Usar los IDs de los slots pre-cargados (1-5)

### Error: "El horario se solapa con otro slot existente"
- Verificar que el nuevo horario no se solape con slots existentes
- Listar slots primero para ver disponibilidad

---

## ?? Próximos Pasos

Una vez validado que todo funciona:

1. ? Migrar a base de datos (ver `API_DoctorAvailability.md`)
2. ? Agregar autenticación/autorización
3. ? Implementar paginación
4. ? Agregar más filtros (rango de fechas, tipo, estado)

---

**Happy Testing! ??**
