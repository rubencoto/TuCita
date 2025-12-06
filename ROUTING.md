# ?? Guía de Routing - TuCita

## Arquitectura de Routing

TuCita utiliza un sistema de routing híbrido:
- **Backend (ASP.NET Core)**: Maneja rutas `/api/*`
- **Frontend (React + Vite)**: Maneja todas las demás rutas (SPA)

## ??? Mapa de Rutas

### Rutas Públicas (No autenticadas)

```
/                          ? HomePage (landing page)
/login                     ? AuthPage (modo login para pacientes)
/register                  ? AuthPage (modo register para pacientes)
/doctor-login              ? DoctorAuthPage (login para doctores)
/forgot-password           ? ForgotPasswordPage
/reset-password?token=xxx  ? ResetPasswordPage
/search                    ? SearchPage (búsqueda de doctores)
```

### Rutas de Paciente (Requiere autenticación)

```
/appointments              ? AppointmentsPage (lista de citas)
/appointment/:id           ? AppointmentDetailPage (detalle de cita)
/booking                   ? BookingPage (agendar cita)
/reschedule/:id            ? ReschedulePage (reagendar cita)
/profile                   ? ProfilePage (perfil del paciente)
/medical-history           ? MedicalHistoryPage (historial médico)
```

### Rutas de Doctor (Requiere autenticación + rol doctor)

```
/doctor/dashboard          ? DoctorDashboardPage
/doctor/appointments       ? DoctorAppointmentsPage
/doctor/appointment/:id    ? DoctorAppointmentDetailPage
/doctor/medical-history    ? DoctorMedicalHistoryPage
/doctor/availability       ? DoctorAvailabilityPage
/doctor/schedule-config    ? DoctorScheduleConfigPage
/doctor/profile            ? DoctorProfilePage
```

### Rutas de Admin (Requiere autenticación + rol admin)

```
/admin                     ? AdminPanel (panel de administración)
/admin/usuarios            ? Gestión de usuarios
/admin/citas               ? Gestión de citas
/admin/especialidades      ? Gestión de especialidades
/admin/reportes            ? Reportes y estadísticas
```

### Rutas de API Backend

```
/api/auth/*                ? Autenticación y registro
/api/doctors/*             ? Gestión de doctores
/api/appointments/*        ? Gestión de citas
/api/patients/*            ? Gestión de pacientes
/api/admin/*               ? Endpoints administrativos
/api/profile/*             ? Gestión de perfiles
/api/medical-history/*     ? Historial médico
```

## ?? Configuración en Producción

### Program.cs (Backend)

El backend está configurado para:
1. Servir archivos estáticos del build de React (`ClientApp/dist`)
2. Manejar rutas `/api/*` con los controladores
3. Redirigir todas las demás rutas al SPA para que React Router las maneje

```csharp
// Configuración actual en Program.cs
app.MapWhen(
    context => !context.Request.Path.StartsWithSegments("/api"),
    appBuilder =>
    {
        appBuilder.UseSpa(spa =>
        {
            spa.Options.SourcePath = "ClientApp";
            // En producción, sirve archivos estáticos pre-compilados
        });
    }
);
```

### Vite Configuration (Frontend)

El `vite.config.ts` está configurado para:
1. Proxy de desarrollo a `https://localhost:7164/api`
2. Build optimizado en carpeta `dist`
3. Manejo de enrutamiento en desarrollo

## ?? Comportamiento en Producción (Heroku)

### Flujo de Requests

1. **Request llega a Heroku** ? `www.tucitaonline.org/some/path`
2. **Heroku enruta a la app** ? `.NET app en puerto $PORT`
3. **ASP.NET Core evalúa la ruta**:
   - Si es `/api/*` ? Ejecuta controlador correspondiente
   - Si NO es `/api/*` ? Sirve `index.html` del SPA
4. **React Router toma control** ? Renderiza componente basado en la ruta
5. **Navegación interna** ? React Router (sin recarga de página)

### Ejemplo de Flujo

```
Usuario visita: https://www.tucitaonline.org/appointments

1. Request ? Heroku
2. Heroku ? .NET App
3. .NET detecta que NO es /api/* ? Sirve index.html
4. React carga en el navegador
5. React Router detecta ruta /appointments
6. Renderiza AppointmentsPage
7. AppointmentsPage llama a /api/appointments/my
8. .NET API responde con datos JSON
9. React muestra las citas
```

## ?? Protección de Rutas

### En el Frontend (App.tsx)

```typescript
// Verificación de autenticación
useEffect(() => {
  const checkAuth = () => {
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    // ... validación
  };
  checkAuth();
}, []);

// Renderizado condicional
if (!isLoggedIn && currentPage === 'appointments') {
  return <AuthPage />; // Redirige a login
}
```

### En el Backend (Controladores)

```csharp
[Authorize] // Requiere JWT válido
[ApiController]
[Route("api/[controller]")]
public class AppointmentsController : ControllerBase
{
    // Solo accesible con token válido
}
```

## ?? Navegación en la Aplicación

### Sistema de Navegación Actual

TuCita usa navegación basada en estado en lugar de React Router tradicional:

```typescript
const handleNavigate = (page: string, data?: any): void => {
  setCurrentPage(page as PageType);
  setPageData(data);
};
```

### Ventajas
- ? Control total sobre el estado de navegación
- ? Fácil pasar datos entre páginas
- ? No requiere configuración de rutas adicional

### Consideración para el Futuro
Para SEO y URLs compartibles, considera migrar a React Router:

```bash
npm install react-router-dom
```

## ?? Actualización de URLs del Frontend

Si migras a React Router en el futuro, actualiza los servicios API para usar rutas base correctas:

```typescript
// Configuración actual en servicios
const BASE_URL = '/api';

// Asegura que funcione tanto en dev como en producción
axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## ?? URLs de Producción

Después del despliegue, todas estas URLs funcionarán:

```
https://www.tucitaonline.org/
https://www.tucitaonline.org/login
https://www.tucitaonline.org/doctor-login
https://www.tucitaonline.org/appointments
https://www.tucitaonline.org/doctor/dashboard
https://www.tucitaonline.org/admin

API:
https://www.tucitaonline.org/api/auth/login
https://www.tucitaonline.org/api/doctors
https://www.tucitaonline.org/api/appointments
```

## ?? Troubleshooting de Routing

### Problema: 404 en rutas del SPA

**Causa**: El servidor no está configurado para servir `index.html` en todas las rutas no-API.

**Solución**: Verificar configuración en `Program.cs`:
```csharp
app.MapWhen(
    context => !context.Request.Path.StartsWithSegments("/api"),
    appBuilder => { appBuilder.UseSpa(...); }
);
```

### Problema: API devuelve HTML en lugar de JSON

**Causa**: La ruta del API está siendo capturada por el SPA.

**Solución**: Verificar que todas las rutas de API empiecen con `/api/`:
```csharp
[Route("api/[controller]")] // ? Correcto
[Route("[controller]")]     // ? Incorrecto
```

### Problema: CORS en producción

**Causa**: Frontend y backend en diferentes orígenes.

**Solución**: Ya configurado en `Program.cs`, pero verifica `AllowedHosts` en `appsettings.Production.json`.

## ?? Checklist de Routing

- [x] Rutas de API usan prefijo `/api/`
- [x] SPA maneja todas las rutas no-API
- [x] Archivos estáticos se sirven correctamente
- [x] Navegación interna funciona sin recarga
- [x] Protección de rutas autenticadas
- [x] Refresh de página mantiene la ruta (en producción)
- [x] APIs responden con JSON, no HTML
- [x] AllowedHosts configurado para el dominio

---

**Nota**: El sistema de routing actual está optimizado para TuCita. Funciona perfectamente en producción.
