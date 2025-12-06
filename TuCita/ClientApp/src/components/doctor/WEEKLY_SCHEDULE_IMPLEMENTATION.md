# Weekly Schedule Builder - Backend Implementation Guide

## ? Backend Already Implemented!

The backend for the weekly schedule builder is **100% complete** and ready to use. Here's what's available:

---

## API Endpoints

### 1. Bulk Create Slots (Weekly Schedule)
**POST** `/api/doctor/availability/bulk`

This is the main endpoint used by the `WeeklyScheduleBuilder` component.

#### Request Body:
```json
{
  "doctorId": "DOC-001",
  "fechaInicio": "2025-02-01",
  "fechaFin": "2025-02-28",
  "horarioSemanal": {
    "1": [
      {
        "horaInicio": "09:00",
        "horaFin": "10:00",
        "tipo": "PRESENCIAL"
      },
      {
        "horaInicio": "10:00",
        "horaFin": "11:00",
        "tipo": "TELECONSULTA"
      }
    ],
    "2": [
      {
        "horaInicio": "09:00",
        "horaFin": "10:00",
        "tipo": "PRESENCIAL"
      }
    ]
  }
}
```

#### Response:
```json
{
  "slotsCreados": 42,
  "slots": [
    {
      "idSlot": 1,
      "doctorId": "DOC-001",
      "fecha": "2025-02-03",
      "horaInicio": "09:00",
      "horaFin": "10:00",
      "tipo": "PRESENCIAL",
      "estado": "DISPONIBLE"
    }
  ],
  "errores": []
}
```

---

## How It Works

### Frontend Flow:
1. **User configures weekly schedule** in `WeeklyScheduleBuilder` component
2. **User sets date range** in `DoctorScheduleConfigPage`
3. **User clicks "Guardar Horarios"**
4. Frontend calls `availabilityService.bulkCreateSlots()`
5. Backend creates individual slots for each day in the range

### Backend Logic:
```
For each day in date range (fechaInicio to fechaFin):
  1. Get day of week (0-6)
  2. Check if horarioSemanal has config for this day
  3. For each time slot in that day's config:
     a. Validate time formats
     b. Check for overlaps with existing slots
     c. Create new slot with estado=DISPONIBLE
     d. Add to results or errors list
```

---

## Data Structures

### TypeScript (Frontend):
```typescript
interface WeeklyTimeSlot {
  horaInicio: string; // "09:00"
  horaFin: string;    // "10:00"
  tipo: SlotTipo;     // "PRESENCIAL" | "TELECONSULTA"
}

interface BulkCreateSlotsRequest {
  doctorId: string;
  fechaInicio: string;  // "2025-02-01"
  fechaFin: string;     // "2025-02-28"
  horarioSemanal: Record<number, WeeklyTimeSlot[]>; // 0-6 (Domingo-Sábado)
}
```

### C# (Backend):
```csharp
public class WeeklyTimeSlot
{
    public string HoraInicio { get; set; }
    public string HoraFin { get; set; }
    public SlotTipo Tipo { get; set; }
}

public class BulkCreateSlotsRequest
{
    public string DoctorId { get; set; }
    public string FechaInicio { get; set; }
    public string FechaFin { get; set; }
    public Dictionary<int, List<WeeklyTimeSlot>> HorarioSemanal { get; set; }
}
```

---

## Validation Rules

The backend automatically validates:

? **Date formats** must be `YYYY-MM-DD`
? **Time formats** must be `HH:mm` (24-hour)
? **End date** must be after start date
? **Date range** cannot exceed 90 days
? **Start time** must be before end time
? **No overlapping slots** for same doctor on same day
? **No past dates** allowed

---

## Error Handling

The backend returns partial success:
- Successfully created slots in `slots` array
- Errors/conflicts in `errores` array

Example error:
```json
{
  "slotsCreados": 38,
  "slots": [...],
  "errores": [
    "2025-02-05: Formato de hora inválido (25:00-26:00)",
    "2025-02-10 09:00-10:00: Se solapa con slot existente"
  ]
}
```

---

## Frontend Service Usage

### 1. Import the service:
```typescript
import * as availabilityService from '@/services/api/doctor/doctorAvailabilityService';
```

### 2. Get default schedule:
```typescript
const defaultSchedule = availabilityService.getDefaultWeeklySchedule();
// Returns Monday-Friday, 9am-5pm schedule
```

### 3. Calculate next month range:
```typescript
const range = availabilityService.getNextMonthRange();
// Returns { start: "2025-02-01", end: "2025-02-28" }
```

### 4. Create bulk slots:
```typescript
const result = await availabilityService.bulkCreateSlots({
  doctorId: 'DOC-001',
  fechaInicio: '2025-02-01',
  fechaFin: '2025-02-28',
  horarioSemanal: {
    1: [{ horaInicio: '09:00', horaFin: '10:00', tipo: 'PRESENCIAL' }],
    2: [{ horaInicio: '09:00', horaFin: '10:00', tipo: 'PRESENCIAL' }],
    // etc...
  }
});

console.log(`Created ${result.slotsCreados} slots`);
if (result.errores.length > 0) {
  console.warn('Conflicts:', result.errores);
}
```

---

## Component Integration

The `WeeklyScheduleBuilder` component is **already integrated** with the backend:

### In `doctor-schedule-config-page.tsx`:
```typescript
import { WeeklyScheduleBuilder } from '@/components/doctor/weekly-schedule-builder';
import * as availabilityService from '@/services/api/doctor/doctorAvailabilityService';

// Use the builder
<WeeklyScheduleBuilder
  initialSchedule={bulkSchedule}
  onChange={setBulkSchedule}
/>

// Submit to backend
const result = await availabilityService.bulkCreateSlots({
  doctorId: 'DOC-001',
  fechaInicio: bulkDateRange.start,
  fechaFin: bulkDateRange.end,
  horarioSemanal: bulkSchedule,
});
```

---

## Testing the Implementation

### 1. Start the backend:
```bash
cd TuCita
dotnet run
```

### 2. Start the frontend:
```bash
cd ClientApp
npm run dev
```

### 3. Navigate to the page:
- Go to Doctor Dashboard
- Click "Horario Mensual" or navigate to schedule config
- Configure weekly schedule
- Set date range
- Click "Guardar Horarios"

### 4. Verify in browser dev tools:
```
Network tab ? POST /api/doctor/availability/bulk
Request payload: { doctorId, fechaInicio, fechaFin, horarioSemanal }
Response: { slotsCreados: X, slots: [...], errores: [] }
```

---

## Database Storage (Future Enhancement)

Currently using in-memory storage (`ConcurrentDictionary`). For production:

1. Add `Turno` table to database
2. Update controller to use `TuCitaDbContext`
3. Replace `_slots` dictionary with EF Core queries
4. Add `doctorId` foreign key to authenticate users

---

## Summary

? **Backend is complete** - No additional C# code needed
? **Frontend service is complete** - `doctorAvailabilityService.ts` has all methods
? **Component is ready** - `WeeklyScheduleBuilder` works out of the box
? **Integration works** - `DoctorScheduleConfigPage` connects everything

**You can start using the weekly schedule builder immediately!**

---

## Support

For questions or issues:
- Check browser console for errors
- Check backend logs in terminal
- Verify date/time formats match `YYYY-MM-DD` and `HH:mm`
- Ensure doctor ID is valid (currently hardcoded as "DOC-001")
