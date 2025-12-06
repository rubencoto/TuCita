# Testing Guide - Weekly Schedule Builder

## Quick Test (5 minutes)

### Step 1: Start the Application

**Terminal 1 - Backend:**
```bash
cd TuCita
dotnet run
```
Wait for: `Now listening on: http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd ClientApp  
npm run dev
```
Wait for: `Local: http://localhost:5173/`

---

### Step 2: Access the Weekly Schedule Builder

1. Open browser: `http://localhost:5173`
2. Login as a doctor (or navigate to doctor section)
3. Go to **"Gestión de Disponibilidad"** page
4. Click **"Horario Mensual"** button

You should see:
- Date range selector (start/end dates)
- Weekly schedule builder with days Monday-Sunday
- Estimated slots counter
- "Crear X horarios" button

---

### Step 3: Configure a Simple Schedule

1. **Monday (Lunes):**
   - Enable the day (toggle switch)
   - Default slot should appear: 09:00-10:00 PRESENCIAL
   - Click "Añadir Horario" to add another slot
   - Set 10:00-11:00 PRESENCIAL

2. **Wednesday (Miércoles):**
   - Enable the day
   - Add slot: 14:00-15:00 TELECONSULTA

3. **Date Range:**
   - Start: Tomorrow's date
   - End: One week from tomorrow

Expected slots: ~6 (2 slots/Monday + 1 slot/Wednesday × 1-2 weeks)

---

### Step 4: Create the Schedule

1. Click **"Crear X horarios"** button
2. Wait for loading spinner
3. Check for success toast: "X horarios creados correctamente"
4. Page should navigate back to availability page

---

### Step 5: Verify Created Slots

On the availability page:
1. Use calendar to select a Monday in your date range
2. You should see 2 slots: 09:00-10:00 and 10:00-11:00
3. Select a Wednesday - you should see 1 slot: 14:00-15:00
4. Select a Tuesday - should be empty (no slots configured)

---

## Advanced Tests

### Test 1: Quick Templates

1. Go back to "Horario Mensual"
2. Select a day (e.g., Tuesday)
3. Click "Mañana" template button
4. Verify: 08:00-12:00 PRESENCIAL appears
5. Click "Tarde" button
6. Verify: 13:00-17:00 PRESENCIAL appears
7. Click "Completa" button
8. Verify: Both morning and afternoon slots appear

### Test 2: Copy to Weekdays

1. Configure Monday with custom slots
2. Click "Copiar a L-V" button
3. Verify: Tuesday-Friday now have same slots as Monday

### Test 3: Overlap Detection

1. Create Monday slot: 09:00-10:00
2. Try to create Monday slot: 09:30-10:30
3. Should see error toast: "Horario inválido - Se cruza con otro horario"

### Test 4: Teleconsulta vs Presencial

1. Configure different types:
   - Monday 09:00-10:00 PRESENCIAL (blue)
   - Monday 10:00-11:00 TELECONSULTA (purple)
2. Save and verify in availability page
3. Check icons: Building2 for PRESENCIAL, Video for TELECONSULTA

---

## API Testing (Postman/curl)

### Test Bulk Create Endpoint Directly

```bash
curl -X POST http://localhost:5000/api/doctor/availability/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "doctorId": "DOC-001",
    "fechaInicio": "2025-02-01",
    "fechaFin": "2025-02-07",
    "horarioSemanal": {
      "1": [
        {
          "horaInicio": "09:00",
          "horaFin": "10:00",
          "tipo": "PRESENCIAL"
        }
      ],
      "3": [
        {
          "horaInicio": "14:00",
          "horaFin": "15:00",
          "tipo": "TELECONSULTA"
        }
      ]
    }
  }'
```

Expected Response:
```json
{
  "slotsCreados": 2,
  "slots": [
    {
      "idSlot": 6,
      "doctorId": "DOC-001",
      "fecha": "2025-02-03",
      "horaInicio": "09:00",
      "horaFin": "10:00",
      "tipo": "PRESENCIAL",
      "estado": "DISPONIBLE"
    },
    {
      "idSlot": 7,
      "doctorId": "DOC-001",
      "fecha": "2025-02-05",
      "horaInicio": "14:00",
      "horaFin": "15:00",
      "tipo": "TELECONSULTA",
      "estado": "DISPONIBLE"
    }
  ],
  "errores": []
}
```

---

## Browser DevTools Verification

### Network Tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Crear horarios"
4. Find POST request to `/api/doctor/availability/bulk`

**Request Payload:**
```json
{
  "doctorId": "DOC-001",
  "fechaInicio": "2025-02-01",
  "fechaFin": "2025-02-28",
  "horarioSemanal": {
    "1": [...],
    "2": [...]
  }
}
```

**Response:**
```json
{
  "slotsCreados": 42,
  "slots": [...],
  "errores": []
}
```

### Console Tab:
Should see:
```
? Datos recibidos del backend: { slotsCreados: 42, ... }
? Creados 42 slots para doctor=DOC-001
```

---

## Common Issues & Solutions

### Issue: "Error 404 - Not Found"
**Solution:** Backend not running. Start with `dotnet run` in TuCita folder.

### Issue: "Error 400 - Bad Request"
**Solution:** Check date format is YYYY-MM-DD, time format is HH:mm.

### Issue: "Error: Se solapa con slot existente"
**Solution:** Already have slots in that time range. Delete old slots first or choose different dates.

### Issue: Component shows loading forever
**Solution:** Check browser console for errors. Verify API endpoint `/api/doctor/availability/bulk` is accessible.

### Issue: No slots appear after creation
**Solution:** 
1. Check if date range includes the days you configured
2. Verify calendar is selecting dates within your range
3. Check backend console logs for created slots

---

## Expected Behavior Summary

? **Creating schedule should:**
- Show loading state ("Creando...")
- Call POST `/api/doctor/availability/bulk`
- Return to availability page
- Show success toast with count

? **Weekly builder should:**
- Toggle days on/off
- Add/remove time slots
- Show timeline visualization
- Validate overlaps
- Apply templates (Mañana/Tarde/Completa)
- Copy days to weekdays

? **Backend should:**
- Accept bulk request
- Create individual slots per day
- Skip weekends if not configured
- Return count + any errors
- Store in memory (refresh = reset)

---

## Success Criteria

You've successfully tested if:
1. ? Can configure weekly schedule
2. ? Can set date range
3. ? Slots are created (toast shows count)
4. ? Created slots appear in calendar
5. ? No console errors
6. ? Network request shows 200 OK status

---

## Next Steps

After successful testing:
1. Connect to real doctor authentication (replace hardcoded "DOC-001")
2. Integrate with database (currently in-memory storage)
3. Add conflict resolution UI for overlapping slots
4. Implement slot editing/deletion for bulk-created slots
5. Add recurring schedule patterns (e.g., every other week)

---

## Screenshots to Verify

### 1. Weekly Schedule Builder
![Expected: Days sidebar, timeline view, slot configuration]

### 2. Date Range Selector
![Expected: Start/end date inputs with estimated slots]

### 3. Success Toast
![Expected: "42 horarios creados correctamente"]

### 4. Created Slots in Calendar
![Expected: Slots appear on configured days]

---

## Test Checklist

- [ ] Backend starts without errors
- [ ] Frontend starts and loads
- [ ] Can access "Horario Mensual" page
- [ ] Can toggle days on/off
- [ ] Can add/remove time slots
- [ ] Can change slot type (PRESENCIAL/TELECONSULTA)
- [ ] Timeline shows slots correctly
- [ ] Templates work (Mañana/Tarde/Completa)
- [ ] Copy to weekdays works
- [ ] Overlap validation works
- [ ] Can submit to backend
- [ ] Success toast appears
- [ ] Redirects to availability page
- [ ] Created slots appear in calendar
- [ ] Network request shows 200 OK
- [ ] No console errors

---

**All tests passing? ? Your weekly schedule builder is working perfectly!**
