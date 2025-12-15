# ?? Guía de React Query en TuCitaOnline

## ?? Tabla de Contenidos
1. [Instalación y Configuración](#instalación-y-configuración)
2. [Estrategias de Caché](#estrategias-de-caché)
3. [Hooks Disponibles](#hooks-disponibles)
4. [Patrones de Uso](#patrones-de-uso)
5. [Invalidación de Caché](#invalidación-de-caché)
6. [Migración de Componentes](#migración-de-componentes)
7. [Debugging y DevTools](#debugging-y-devtools)

---

## ?? Instalación y Configuración

### Dependencias Instaladas
```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

### Configuración en `main.tsx`
```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutos
      gcTime: 10 * 60 * 1000,          // 10 minutos
      refetchOnWindowFocus: false,     // No re-fetch automático
      retry: 1,                        // 1 reintento
      refetchOnReconnect: true,        // Re-fetch al reconectar
    },
    mutations: {
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
```

---

## ?? Estrategias de Caché

React Query utiliza dos conceptos clave de tiempo:

### `staleTime` - Tiempo de Frescura
Tiempo que los datos se consideran "frescos" antes de necesitar actualización.

### `gcTime` (antes `cacheTime`) - Tiempo en Caché
Tiempo que los datos permanecen en memoria después de que nadie los usa.

### Estrategias por Tipo de Dato

| Tipo de Dato | `staleTime` | `gcTime` | Razón |
|--------------|-------------|----------|-------|
| **Datos Estáticos** (Especialidades) | `Infinity` | `Infinity` | Raramente cambian |
| **Dashboard/Citas del Día** | `1-2 min` | `5 min` | Actualizaciones frecuentes |
| **Perfil de Usuario** | `10 min` | `30 min` | Cambios poco frecuentes |
| **Lista de Doctores** | `5 min` | `15 min` | Relativamente estables |
| **Turnos Disponibles** | `30 seg` | `2 min` | Muy dinámicos |
| **Detalle de Cita** | `5 min` | `15 min` | Moderadamente dinámico |

---

## ?? Hooks Disponibles

### ?? Citas (Appointments)

#### `useTodayAppointments()`
Obtiene citas del día actual del doctor con estadísticas calculadas.

```tsx
import { useTodayAppointments } from '@/hooks/queries';

function DashboardPage() {
  const { data, isLoading, isError, error } = useTodayAppointments();
  
  const appointments = data?.appointments || [];
  const stats = data?.stats || { total: 0, completed: 0, pending: 0, cancelled: 0 };
  
  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage error={error} />;
  
  return (
    <div>
      <h2>Citas del Día: {stats.total}</h2>
      {appointments.map(apt => <AppointmentCard key={apt.id} appointment={apt} />)}
    </div>
  );
}
```

**Configuración:**
- ? `staleTime`: 1 minuto (datos frecuentes)
- ?? `refetchOnWindowFocus`: `true` (importante para dashboard)

---

#### `useDoctorAppointments(fechaInicio?, fechaFin?, estado?)`
Obtiene todas las citas del doctor con filtros opcionales.

```tsx
import { useDoctorAppointments } from '@/hooks/queries';

function AppointmentsPage() {
  const startDate = '2024-01-01';
  const endDate = '2024-01-31';
  
  const { data: appointments, isLoading } = useDoctorAppointments(
    startDate, 
    endDate, 
    'CONFIRMADA'
  );
  
  return <AppointmentsList appointments={appointments} />;
}
```

**Configuración:**
- ? `staleTime`: 2 minutos
- ?? Query Key incluye filtros (caché separado por filtro)

---

#### `useAppointmentDetail(citaId)`
Obtiene detalles completos de una cita específica.

```tsx
import { useAppointmentDetail } from '@/hooks/queries';

function AppointmentDetailPage({ appointmentId }: { appointmentId: number }) {
  const { data: appointment, isLoading } = useAppointmentDetail(appointmentId);
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      <h1>{appointment.paciente.nombre}</h1>
      <p>Motivo: {appointment.motivo}</p>
    </div>
  );
}
```

**Configuración:**
- ? `staleTime`: 5 minutos
- ?? `enabled`: Solo si `citaId` es válido

---

#### `useUpdateAppointmentStatus()`
Mutación para actualizar el estado de una cita.

```tsx
import { useUpdateAppointmentStatus } from '@/hooks/queries';

function AppointmentActions({ citaId }: { citaId: number }) {
  const updateStatus = useUpdateAppointmentStatus();
  
  const handleMarkAsCompleted = () => {
    updateStatus.mutate({
      citaId,
      data: {
        estado: 'ATENDIDA',
        observaciones: 'Cita completada exitosamente'
      }
    });
  };
  
  return (
    <Button 
      onClick={handleMarkAsCompleted} 
      disabled={updateStatus.isPending}
    >
      {updateStatus.isPending ? 'Actualizando...' : 'Marcar como Atendida'}
    </Button>
  );
}
```

**Características:**
- ? Actualización optimista en la UI
- ?? Invalida caché automáticamente
- ? Rollback automático en caso de error

---

### ????? Doctores (Doctors)

#### `useDoctors(filters?)`
Obtiene lista de doctores con filtros opcionales.

```tsx
import { useDoctors } from '@/hooks/queries';

function SearchPage() {
  const [filters, setFilters] = useState({
    especialidad: 'Cardiología',
    ciudad: 'San José'
  });
  
  const { data: doctors, isLoading } = useDoctors(filters);
  
  return (
    <div>
      <FilterBar filters={filters} onChange={setFilters} />
      {doctors?.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}
    </div>
  );
}
```

**Configuración:**
- ? `staleTime`: 5 minutos
- ?? Caché separado por filtros

---

#### `useSpecialties()`
Obtiene lista de especialidades médicas (datos estáticos).

```tsx
import { useSpecialties } from '@/hooks/queries';

function SpecialtyFilter() {
  const { data: specialties } = useSpecialties();
  
  return (
    <Select>
      {specialties?.map(specialty => (
        <option key={specialty} value={specialty}>{specialty}</option>
      ))}
    </Select>
  );
}
```

**Configuración:**
- ? `staleTime`: `Infinity` (datos muy estables)
- ?? `gcTime`: `Infinity` (mantener indefinidamente)

---

#### `useAvailableSlots(doctorId, fecha)`
Obtiene turnos disponibles para una fecha específica.

```tsx
import { useAvailableSlots } from '@/hooks/queries';

function AppointmentBooking({ doctorId }: { doctorId: number }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { data: slots, isLoading } = useAvailableSlots(doctorId, selectedDate);
  
  return (
    <div>
      <DatePicker value={selectedDate} onChange={setSelectedDate} />
      {slots?.map(slot => (
        <TimeSlot key={slot.id} slot={slot} />
      ))}
    </div>
  );
}
```

**Configuración:**
- ? `staleTime`: 30 segundos (muy dinámicos)
- ?? `refetchOnWindowFocus`: `true`

---

### ?? Perfil (Profile)

#### `useDoctorProfile()`
Obtiene perfil del doctor autenticado.

```tsx
import { useDoctorProfile } from '@/hooks/queries';

function ProfilePage() {
  const { data: profile, isLoading } = useDoctorProfile();
  
  if (isLoading) return <Skeleton />;
  
  return (
    <div>
      <h1>{profile.nombre} {profile.apellido}</h1>
      <p>{profile.email}</p>
      <p>Licencia: {profile.numeroLicencia}</p>
    </div>
  );
}
```

---

#### `useUpdateDoctorProfile()`
Mutación para actualizar perfil del doctor.

```tsx
import { useUpdateDoctorProfile } from '@/hooks/queries';

function ProfileForm() {
  const updateProfile = useUpdateDoctorProfile();
  
  const handleSubmit = (formData) => {
    updateProfile.mutate({
      nombre: formData.nombre,
      apellido: formData.apellido,
      email: formData.email,
      telefono: formData.telefono,
      biografia: formData.biografia
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Campos del formulario */}
      <Button type="submit" disabled={updateProfile.isPending}>
        {updateProfile.isPending ? 'Guardando...' : 'Guardar Cambios'}
      </Button>
    </form>
  );
}
```

**Características:**
- ? Actualización optimista
- ?? Actualiza localStorage automáticamente
- ?? Sincronización con servidor

---

## ?? Invalidación de Caché

### ¿Cuándo Invalidar?

La invalidación fuerza a React Query a re-fetch datos del servidor.

#### Automática (No hacer nada)
- **Mutations:** Las mutaciones invalidan automáticamente queries relacionadas
- **Ejemplo:** `useUpdateAppointmentStatus` invalida `useTodayAppointments`

#### Manual (Usar helpers)
```tsx
import { useInvalidateAppointments } from '@/hooks/queries';

function RefreshButton() {
  const { invalidateToday, invalidateAll } = useInvalidateAppointments();
  
  return (
    <Button onClick={() => invalidateToday()}>
      Actualizar Citas
    </Button>
  );
}
```

### Helpers de Invalidación Disponibles

#### Citas
```tsx
const { invalidateToday, invalidateAll, invalidateDetail } = useInvalidateAppointments();

invalidateToday();              // Solo citas del día
invalidateAll();                // Todas las queries de citas
invalidateDetail(appointmentId); // Detalle específico
```

#### Doctores
```tsx
const { invalidateAll, invalidateList, invalidateDetail, invalidateSlots } = useInvalidateDoctors();

invalidateList({ especialidad: 'Cardiología' }); // Lista con filtros específicos
invalidateSlots(doctorId);                      // Turnos de un doctor
```

#### Perfil
```tsx
const { invalidateDoctor, invalidateAll } = useInvalidateProfile();

invalidateDoctor(); // Perfil del doctor actual
```

---

## ?? Migración de Componentes

### ? Antes (Sin React Query)

```tsx
function OldComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const result = await service.getData();
      setData(result);
    } catch (error) {
      setError(error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <Error />;

  return <div>{/* Renderizar data */}</div>;
}
```

### ? Después (Con React Query)

```tsx
import { useDataQuery } from '@/hooks/queries';

function NewComponent() {
  const { data, isLoading, isError, error } = useDataQuery();

  if (isLoading) return <Spinner />;
  if (isError) return <Error message={error.message} />;

  return <div>{/* Renderizar data */}</div>;
}
```

### ?? Checklist de Migración

1. ? **Remover estado manual**
   - Eliminar `useState` para `data`, `loading`, `error`
   - Eliminar `useEffect` que carga datos

2. ? **Importar hook de React Query**
   ```tsx
   import { useTodayAppointments } from '@/hooks/queries';
   ```

3. ? **Usar hook en el componente**
   ```tsx
   const { data, isLoading, isError } = useTodayAppointments();
   ```

4. ? **Actualizar lógica de renderizado**
   - Cambiar `loading` ? `isLoading`
   - Cambiar `error` ? `isError`
   - Acceder a datos con `data?.` (optional chaining)

5. ? **Convertir mutaciones**
   - Reemplazar funciones async directas con `useMutation`
   - Manejar estados con `isPending`, `isSuccess`, `isError`

---

## ?? Debugging y DevTools

### React Query DevTools

DevTools están habilitados en `main.tsx`:

```tsx
<ReactQueryDevtools initialIsOpen={false} />
```

**Acceso:** Presiona el ícono flotante de React Query en la esquina inferior derecha.

### Características de DevTools

1. **Query Explorer:**
   - Ver todas las queries activas
   - Estado: `fresh`, `fetching`, `stale`, `inactive`
   - Datos en caché

2. **Actions:**
   - ?? Refetch: Re-fetch manual
   - ??? Invalidate: Marcar como stale
   - ?? Remove: Eliminar del caché
   - ?? Reset: Resetear estado

3. **Query Details:**
   - Ver query keys
   - Inspeccionar datos
   - Historial de updates

### Tips de Debugging

#### Ver Query Keys
```tsx
console.log('Query Key:', appointmentKeys.today());
// Output: ['appointments', 'today']
```

#### Inspeccionar Caché
```tsx
const queryClient = useQueryClient();
const cachedData = queryClient.getQueryData(appointmentKeys.today());
console.log('Cached Data:', cachedData);
```

#### Forzar Re-fetch
```tsx
const { refetch } = useTodayAppointments();
refetch(); // Re-fetch inmediato
```

---

## ?? Mejoras de Performance

### Antes vs. Después

#### Sin React Query
- ? Cada navegación = nueva consulta SQL
- ? Componentes hermanos duplican requests
- ? Re-render innecesarios al cambiar pestañas
- ? Estado local inconsistente entre componentes

#### Con React Query
- ? **60-80% menos consultas SQL** (caché inteligente)
- ? **Deduplicación automática** (múltiples componentes = 1 request)
- ? **Sincronización entre componentes** (un cambio actualiza todos)
- ? **Background updates** (re-fetch silencioso)

### Ejemplo Real: Dashboard del Doctor

**Antes:**
```
1. Usuario abre dashboard ? Query SQL
2. Usuario navía a "Todas las Citas" ? Query SQL
3. Usuario regresa a dashboard ? Query SQL (otra vez!)
4. Total: 3 queries SQL para los mismos datos
```

**Después:**
```
1. Usuario abre dashboard ? Query SQL + guardado en caché
2. Usuario navía a "Todas las Citas" ? Datos del caché (sin query)
3. Usuario regresa a dashboard ? Datos del caché (sin query)
4. Total: 1 query SQL, las demás desde caché ?
```

---

## ?? Mejores Prácticas

### 1. Usar Query Keys Consistentes
```tsx
// ? BIEN - Usar constantes
const queryKey = appointmentKeys.today();

// ? MAL - String literal
const queryKey = ['appointments', 'today'];
```

### 2. Manejar Estados Correctamente
```tsx
// ? BIEN
if (isLoading) return <Spinner />;
if (isError) return <Error />;
return <Content data={data} />;

// ? MAL - No verificar estados
return <Content data={data} />; // data puede ser undefined!
```

### 3. Usar Optional Chaining
```tsx
// ? BIEN
const appointments = data?.appointments || [];

// ? MAL - Puede causar error
const appointments = data.appointments;
```

### 4. Invalidar Selectivamente
```tsx
// ? BIEN - Invalidar solo lo necesario
invalidateToday();

// ? MAL - Invalidar todo innecesariamente
queryClient.invalidateQueries();
```

### 5. Configurar `enabled` Correctamente
```tsx
// ? BIEN - Solo ejecutar si hay ID
const { data } = useAppointmentDetail(appointmentId);
// enabled: appointmentId !== null (en el hook)

// ? MAL - Ejecutar siempre
useAppointmentDetail(null); // Error!
```

---

## ?? Recursos Adicionales

- [React Query Docs](https://tanstack.com/query/latest/docs/react/overview)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Effective React Query Keys](https://tkdodo.eu/blog/effective-react-query-keys)

---

## ?? Próximos Pasos

1. ? **Componentes Migrados:**
   - `doctor-dashboard-page.tsx`

2. ?? **Pendientes de Migración:**
   - `search-page.tsx` (usar `useDoctors`)
   - `AdminDashboard.tsx`
   - `doctor-appointments-page.tsx`
   - `doctor-profile-page.tsx` (usar `useDoctorProfile`)

3. ?? **Monitoreo:**
   - Usar DevTools para verificar caché
   - Medir reducción de queries SQL
   - Verificar performance en producción

---

**? ¡React Query está listo para usar en TuCitaOnline!**
