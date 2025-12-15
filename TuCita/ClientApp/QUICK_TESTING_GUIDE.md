# ?? GUÍA DE TESTING RÁPIDO - REACT QUERY MIGRATION

**Fecha**: 2024-01-XX  
**Estado**: ? Migración 100% Completa

---

## ?? OBJETIVO

Verificar que la migración a React Query funciona correctamente en **todos los módulos** (Patient, Doctor, Admin).

**Tiempo estimado**: 15-20 minutos

---

## ?? PRE-REQUISITOS

### 1. Iniciar Backend (.NET)

```powershell
# Terminal 1 - Backend
cd C:\Users\ruben\source\repos\rubencoto\TuCita\TuCita
dotnet run
```

**? Verificar**: Backend corriendo en `https://localhost:5001`

### 2. Iniciar Frontend (Vite)

```powershell
# Terminal 2 - Frontend
cd C:\Users\ruben\source\repos\rubencoto\TuCita\TuCita\ClientApp
npm run dev
```

**? Verificar**: Frontend corriendo en `http://localhost:5173`

### 3. Abrir React Query DevTools

1. Abrir `http://localhost:5173` en Chrome/Edge
2. Buscar botón flotante **React Query** en esquina inferior izquierda
3. Hacer clic para abrir DevTools

**? Verificar**: DevTools abierto mostrando queries activas

---

## ?? TEST SUITE

### ?? MÓDULO 1: PATIENT PAGES (6 tests)

#### ? Test 1.1: HomePage - Popular Doctors

**Pasos**:
1. Ir a `http://localhost:5173`
2. Esperar carga de "Doctores Destacados"

**Verificar en UI**:
- ? Lista de doctores se muestra
- ? No hay spinner infinito
- ? No hay mensajes de error

**Verificar en DevTools**:
- ? Query `['doctors', 'popular']` en estado `success`
- ? `staleTime: 5 min` configurado
- ? Datos cacheados visibles

**Resultado esperado**: ? PASS

---

#### ? Test 1.2: SearchPage - Doctor Search

**Pasos**:
1. Ir a `/search`
2. Escribir "cardio" en buscador
3. Esperar resultados

**Verificar en UI**:
- ? Resultados aparecen
- ? Búsqueda funciona
- ? Filtros por especialidad funcionan

**Verificar en DevTools**:
- ? Query `['doctors', 'search', 'cardio']` activa
- ? Actualización automática al cambiar query
- ? Cache se mantiene entre navegaciones

**Resultado esperado**: ? PASS

---

#### ? Test 1.3: BookingPage - Create Appointment

**Pasos**:
1. Login como paciente
2. Seleccionar un doctor desde SearchPage
3. Ir a BookingPage
4. Seleccionar fecha y slot disponible
5. Completar motivo de consulta
6. Crear cita

**Verificar en UI**:
- ? Slots disponibles se cargan
- ? Botón "Agendar Cita" funciona
- ? Toast de éxito aparece
- ? Redirección a `/appointments`

**Verificar en DevTools**:
- ? Query `['doctors', doctorId, 'availability', fecha]` activa
- ? Mutation `createAppointment` ejecutada
- ? Cache de appointments invalidado automáticamente

**Resultado esperado**: ? PASS

---

#### ? Test 1.4: AppointmentsPage - List & Cancel

**Pasos**:
1. Login como paciente
2. Ir a `/appointments`
3. Verificar lista de citas
4. Cancelar una cita programada

**Verificar en UI**:
- ? Lista de citas se muestra
- ? Filtros funcionan (Programadas, Completadas, Todas)
- ? Botón "Cancelar" funciona
- ? Estado cambia a CANCELADA instantáneamente (optimistic update)

**Verificar en DevTools**:
- ? Query `['patient', 'appointments']` activa
- ? Mutation `cancelAppointment` con optimistic update
- ? Rollback automático si falla

**Resultado esperado**: ? PASS

---

#### ? Test 1.5: MedicalHistoryPage - History View

**Pasos**:
1. Login como paciente
2. Ir a `/medical-history`
3. Ver historial de citas atendidas

**Verificar en UI**:
- ? Historial se muestra
- ? Timeline ordenado por fecha
- ? Detalles de cada cita visibles

**Verificar en DevTools**:
- ? Query `['patient', 'medical-history']` activa
- ? `staleTime: 10 min` configurado
- ? Cache persistente

**Resultado esperado**: ? PASS

---

#### ? Test 1.6: ProfilePage - Update Profile

**Pasos**:
1. Login como paciente
2. Ir a `/profile`
3. Editar datos (nombre, teléfono)
4. Guardar cambios

**Verificar en UI**:
- ? Datos actuales se cargan
- ? Formulario funciona
- ? Toast de éxito al guardar
- ? Datos actualizados visibles inmediatamente

**Verificar en DevTools**:
- ? Query `['patient', 'profile']` activa
- ? Mutation `updatePatientProfile` ejecutada
- ? Cache invalidado y refetch automático

**Resultado esperado**: ? PASS

---

### ????? MÓDULO 2: DOCTOR PAGES (7 tests)

#### ? Test 2.1: DoctorDashboardPage - Dashboard View

**Pasos**:
1. Login como doctor
2. Ir a `/doctor/dashboard`

**Verificar en UI**:
- ? Métricas del día se muestran
- ? Gráficos de citas se renderizan
- ? Próximas citas visibles

**Verificar en DevTools**:
- ? Query `['doctor', 'dashboard']` activa
- ? `staleTime: 1 min` (refetch frecuente)
- ? Auto-refetch al volver a la pestaña

**Resultado esperado**: ? PASS

---

#### ? Test 2.2: DoctorAppointmentsPage - Appointments List

**Pasos**:
1. Login como doctor
2. Ir a `/doctor/appointments`
3. Ver lista de citas del día

**Verificar en UI**:
- ? Lista de citas se muestra
- ? Filtros por estado funcionan
- ? Calendario de fechas funciona

**Verificar en DevTools**:
- ? Query `['doctor', 'appointments', 'list', filters]` activa
- ? Cache por combinación de filtros
- ? Refetch al cambiar filtros

**Resultado esperado**: ? PASS

---

#### ? Test 2.3: DoctorAppointmentDetailPage - Update Status

**Pasos**:
1. Login como doctor
2. Ir a `/doctor/appointments`
3. Hacer clic en una cita
4. Cambiar estado a "ATENDIDA"

**Verificar en UI**:
- ? Detalle de cita se muestra
- ? Botón "Marcar como Atendida" funciona
- ? Toast de éxito
- ? Estado actualizado en lista

**Verificar en DevTools**:
- ? Query `['doctor', 'appointments', 'detail', id]` activa
- ? Mutation `updateAppointmentStatus` ejecutada
- ? Invalidación en cascada (detail ? list ? dashboard)

**Resultado esperado**: ? PASS

---

#### ? Test 2.4: DoctorAvailabilityPage - Manage Slots

**Pasos**:
1. Login como doctor
2. Ir a `/doctor/availability`
3. Ver slots del día
4. Eliminar un slot

**Verificar en UI**:
- ? Calendario de slots se muestra
- ? Slots disponibles/ocupados diferenciados
- ? Botón "Eliminar" funciona
- ? Slot desaparece de la lista

**Verificar en DevTools**:
- ? Query `['doctor', 'availability', 'slots', filters]` activa
- ? Mutation `deleteDoctorSlot` ejecutada
- ? Cache invalidado automáticamente

**Resultado esperado**: ? PASS

---

#### ? Test 2.5: DoctorScheduleConfigPage - Bulk Create

**Pasos**:
1. Login como doctor
2. Ir a `/doctor/schedule-config`
3. Configurar horario semanal (Ej: Lunes 9:00-17:00)
4. Seleccionar rango de fechas (próximo mes)
5. Crear horarios en lote

**Verificar en UI**:
- ? Constructor de horario semanal funciona
- ? Vista previa de slots estimados
- ? Botón "Crear X horarios" funciona
- ? Redirección a `/doctor/availability`

**Verificar en DevTools**:
- ? Mutation `bulkCreateDoctorSlots` ejecutada
- ? Invalidación de cache de slots
- ? Refetch automático en página de destino

**Resultado esperado**: ? PASS

---

#### ? Test 2.6: DoctorProfilePage - Update Profile

**Pasos**:
1. Login como doctor
2. Ir a `/doctor/profile`
3. Editar biografía o especialidades
4. Guardar cambios

**Verificar en UI**:
- ? Datos actuales se cargan
- ? Formulario funciona
- ? Toast de éxito
- ? Cambios visibles inmediatamente

**Verificar en DevTools**:
- ? Query `['doctor', 'profile']` activa
- ? Mutation `updateDoctorProfile` ejecutada
- ? Cache invalidado

**Resultado esperado**: ? PASS

---

### ?? MÓDULO 3: ADMIN PAGES (6 tests)

#### ? Test 3.1: AdminDashboard - Dashboard View

**Pasos**:
1. Login como admin
2. Ir a `/admin/dashboard`

**Verificar en UI**:
- ? Métricas se muestran (citas hoy, atendidas, etc.)
- ? Gráficos de barras y pastel se renderizan
- ? Tabla de próximas citas visible

**Verificar en DevTools**:
- ? Query `['admin', 'dashboard']` activa
- ? `staleTime: 1 min` configurado
- ? Auto-refetch funcional

**Resultado esperado**: ? PASS

---

#### ? Test 3.2: AdminCitas - List & Filter

**Pasos**:
1. Login como admin
2. Ir a `/admin/citas`
3. Filtrar por estado "PROGRAMADA"
4. Buscar por nombre de paciente

**Verificar en UI**:
- ? Lista de citas se muestra
- ? Filtros funcionan correctamente
- ? Paginación funciona
- ? Búsqueda en tiempo real

**Verificar en DevTools**:
- ? Query `['admin', 'citas', 'list', filters]` activa
- ? Cache por combinación de filtros
- ? Refetch al cambiar página

**Resultado esperado**: ? PASS

---

#### ? Test 3.3: AdminCitas - Update Status

**Pasos**:
1. Login como admin
2. Ir a `/admin/citas`
3. Seleccionar una cita programada
4. Cambiar estado a "CONFIRMADA"

**Verificar en UI**:
- ? Dropdown de acciones funciona
- ? Dialog de confirmación aparece
- ? Toast de éxito
- ? Estado actualizado en tabla

**Verificar en DevTools**:
- ? Mutation `updateEstadoCitaAdmin` ejecutada
- ? Invalidación automática de citas
- ? Dashboard también se invalida (cascada)

**Resultado esperado**: ? PASS

---

#### ? Test 3.4: AdminCitasNueva - Create Appointment

**Pasos**:
1. Login como admin
2. Ir a `/admin/citas`
3. Clic en "Nueva cita"
4. Wizard paso 1: Buscar paciente
5. Wizard paso 2: Seleccionar doctor
6. Wizard paso 3: Seleccionar fecha y slot
7. Wizard paso 4: Completar detalles y crear

**Verificar en UI**:
- ? Búsqueda de pacientes funciona (>=2 caracteres)
- ? Lista de doctores se carga
- ? Slots disponibles se muestran
- ? Formulario final funciona
- ? Cita creada con éxito

**Verificar en DevTools**:
- ? Query `useSearchPacientes(query)` activa (enabled cuando query >= 2)
- ? Query `useAdminDoctores()` activa
- ? Query `useAdminSlotsDisponibles(doctorId, fecha)` condicional
- ? Mutation `createCitaAdmin` ejecutada
- ? Cache invalidado (citas + dashboard)

**Resultado esperado**: ? PASS

---

#### ? Test 3.5: AdminUsuarios - CRUD Operations

**Pasos**:
1. Login como admin
2. Ir a `/admin/usuarios`

**Test 3.5.1 - Lista**:
- ? Lista de usuarios se muestra
- ? Filtros por rol (PACIENTE, MEDICO, ADMIN)
- ? Búsqueda funciona

**Test 3.5.2 - Crear Usuario**:
1. Clic en "Nuevo usuario"
2. Seleccionar rol "MEDICO"
3. Completar formulario (email se genera automáticamente)
4. Seleccionar especialidades
5. Guardar

**Verificar**:
- ? Modal se abre
- ? Email se genera automáticamente para MEDICO/ADMIN
- ? Usuario creado con éxito
- ? Lista se actualiza automáticamente

**Test 3.5.3 - Editar Usuario**:
1. Clic en "Editar" de un usuario
2. Cambiar nombre
3. Guardar

**Verificar**:
- ? Modal con datos actuales
- ? Cambios guardados
- ? Lista actualizada

**Test 3.5.4 - Cambiar Estado**:
1. Clic en "Activar/Desactivar"
2. Confirmar

**Verificar**:
- ? Estado cambia inmediatamente
- ? Badge actualizado

**Verificar en DevTools**:
- ? Query `['admin', 'usuarios', 'list', filters]` activa
- ? Mutations: `createUsuario`, `updateUsuario`, `cambiarEstadoUsuario`
- ? Invalidación automática después de cada mutation

**Resultado esperado**: ? PASS

---

#### ? Test 3.6: AdminEspecialidades - CRUD

**Pasos**:
1. Login como admin
2. Ir a `/admin/especialidades`

**Test 3.6.1 - Lista**:
- ? Lista de especialidades se muestra
- ? Contador de doctores asignados visible

**Test 3.6.2 - Crear Especialidad**:
1. Clic en "Nueva especialidad"
2. Escribir "Dermatología"
3. Guardar

**Verificar**:
- ? Modal se abre
- ? Especialidad creada
- ? Lista actualizada

**Test 3.6.3 - Editar Especialidad**:
1. Clic en "Editar"
2. Cambiar nombre
3. Guardar

**Verificar**:
- ? Cambios guardados
- ? Lista actualizada

**Test 3.6.4 - Eliminar Especialidad**:
1. Intentar eliminar especialidad con doctores asignados
2. Intentar eliminar especialidad sin doctores

**Verificar**:
- ? Botón deshabilitado si tiene doctores
- ? Eliminación exitosa si no tiene doctores

**Verificar en DevTools**:
- ? Query `['admin', 'especialidades']` activa
- ? `staleTime: 30 min` (datos muy estables)
- ? Mutations: `createEspecialidad`, `updateEspecialidad`, `deleteEspecialidad`
- ? Invalidación automática

**Resultado esperado**: ? PASS

---

## ?? PRUEBAS DE CACHE E INVALIDACIÓN

### Test C1: Cache Persistence

**Pasos**:
1. Login como paciente
2. Ir a `/search` y buscar doctores
3. Navegar a `/profile`
4. Volver a `/search`

**Verificar en DevTools**:
- ? Query `['doctors', 'search']` está en cache
- ? NO se hace nuevo request al backend
- ? Datos se muestran instantáneamente

**Resultado esperado**: ? PASS

---

### Test C2: Auto-Invalidation (Patient ? Doctor)

**Pasos**:
1. Login como paciente, crear una cita
2. Logout
3. Login como el doctor de esa cita
4. Ir a dashboard

**Verificar**:
- ? Nueva cita aparece en dashboard del doctor
- ? Métricas actualizadas
- ? Slot ya no disponible para agendamiento

**Resultado esperado**: ? PASS

---

### Test C3: Auto-Invalidation (Admin ? Patient ? Doctor)

**Pasos**:
1. Login como admin
2. Cambiar estado de una cita a "CANCELADA"
3. Logout, login como paciente de esa cita
4. Ir a `/appointments`
5. Logout, login como doctor de esa cita
6. Ir a dashboard

**Verificar**:
- ? Estado "CANCELADA" visible en admin
- ? Estado "CANCELADA" visible en patient appointments
- ? Slot liberado en doctor availability
- ? Métricas actualizadas en ambos dashboards

**Resultado esperado**: ? PASS

---

### Test C4: Optimistic Updates Rollback

**Pasos**:
1. Login como paciente
2. Ir a `/appointments`
3. **DESCONECTAR INTERNET** (o detener backend)
4. Intentar cancelar una cita

**Verificar**:
- ? UI muestra estado "CANCELADA" inmediatamente (optimistic)
- ? Error toast aparece después de timeout
- ? Estado revierte a "PROGRAMADA" (rollback)
- ? Lista vuelve al estado original

**Resultado esperado**: ? PASS

---

### Test C5: Multi-Tab Synchronization

**Pasos**:
1. Abrir TuCita en **2 pestañas** del mismo navegador
2. Login como paciente en ambas
3. En **Pestaña 1**: Ir a `/appointments`
4. En **Pestaña 2**: Ir a `/appointments`
5. En **Pestaña 1**: Cancelar una cita
6. Cambiar a **Pestaña 2**

**Verificar**:
- ? Pestaña 2 detecta cambio automáticamente
- ? Lista se actualiza sin refrescar manualmente
- ? Estado sincronizado en ambas pestañas

**Resultado esperado**: ? PASS

---

## ?? RESUMEN DE RESULTADOS

### Template de Reporte

```markdown
## ?? TEST RESULTS - $(date)

### Module 1: Patient Pages
- [ ] Test 1.1: HomePage ? PASS / ? FAIL
- [ ] Test 1.2: SearchPage ? PASS / ? FAIL
- [ ] Test 1.3: BookingPage ? PASS / ? FAIL
- [ ] Test 1.4: AppointmentsPage ? PASS / ? FAIL
- [ ] Test 1.5: MedicalHistoryPage ? PASS / ? FAIL
- [ ] Test 1.6: ProfilePage ? PASS / ? FAIL

### Module 2: Doctor Pages
- [ ] Test 2.1: DoctorDashboardPage ? PASS / ? FAIL
- [ ] Test 2.2: DoctorAppointmentsPage ? PASS / ? FAIL
- [ ] Test 2.3: DoctorAppointmentDetailPage ? PASS / ? FAIL
- [ ] Test 2.4: DoctorAvailabilityPage ? PASS / ? FAIL
- [ ] Test 2.5: DoctorScheduleConfigPage ? PASS / ? FAIL
- [ ] Test 2.6: DoctorProfilePage ? PASS / ? FAIL

### Module 3: Admin Pages
- [ ] Test 3.1: AdminDashboard ? PASS / ? FAIL
- [ ] Test 3.2: AdminCitas - List ? PASS / ? FAIL
- [ ] Test 3.3: AdminCitas - Update ? PASS / ? FAIL
- [ ] Test 3.4: AdminCitasNueva ? PASS / ? FAIL
- [ ] Test 3.5: AdminUsuarios ? PASS / ? FAIL
- [ ] Test 3.6: AdminEspecialidades ? PASS / ? FAIL

### Cache & Invalidation Tests
- [ ] Test C1: Cache Persistence ? PASS / ? FAIL
- [ ] Test C2: Auto-Invalidation (Patient ? Doctor) ? PASS / ? FAIL
- [ ] Test C3: Auto-Invalidation (Admin ? All) ? PASS / ? FAIL
- [ ] Test C4: Optimistic Updates Rollback ? PASS / ? FAIL
- [ ] Test C5: Multi-Tab Sync ? PASS / ? FAIL

### Overall Result
**Total Tests**: 25
**Passed**: X / 25
**Failed**: Y / 25
**Success Rate**: Z%

### Notes
[Agregar cualquier observación importante]
```

---

## ?? TROUBLESHOOTING

### Problema: "Query no aparece en DevTools"

**Solución**:
1. Verificar que DevTools está abierto antes de la navegación
2. Refrescar la página con DevTools abierto
3. Verificar que el hook se está llamando en el componente

---

### Problema: "Infinite loading spinner"

**Solución**:
1. Abrir DevTools de React Query
2. Ver estado de la query (loading, error, success)
3. Si está en "error", verificar:
   - Backend está corriendo
   - URL del API es correcta
   - Token de autenticación es válido

---

### Problema: "Cache no se invalida"

**Solución**:
1. Verificar en DevTools que la mutation se ejecutó
2. Verificar que `queryClient.invalidateQueries` se llamó
3. Verificar que el `queryKey` es correcto

---

### Problema: "Datos desactualizados"

**Solución**:
1. Verificar `staleTime` configurado
2. Forzar refetch manual:
   ```typescript
   queryClient.invalidateQueries({ queryKey: ['resource'] })
   ```
3. Verificar que no hay cache duplicado en localStorage

---

## ? CHECKLIST FINAL

Antes de dar por completado el testing:

- [ ] Todos los tests de Patient (6/6) pasan
- [ ] Todos los tests de Doctor (6/6) pasan
- [ ] Todos los tests de Admin (6/6) pasan
- [ ] Todos los tests de Cache (5/5) pasan
- [ ] DevTools funcionan correctamente
- [ ] No hay errores en consola del navegador
- [ ] No hay warnings de React
- [ ] Performance es aceptable (< 2s carga inicial)
- [ ] Multi-tab sync funciona

---

## ?? CONCLUSIÓN

Si **todos los tests pasan**, la migración a React Query está **COMPLETAMENTE FUNCIONAL** y lista para producción.

**Próximo paso**: Deployment a staging/producción ??

---

**Última actualización**: 2024-01-XX  
**Autor**: GitHub Copilot  
**Estado**: ? READY FOR TESTING
